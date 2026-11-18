// Shared database connection code used by the backend routes.
// A pool reuses open SQL connections instead of creating a new connection for every request.

// Load database settings from the local .env file.
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
const sql = require('mssql');

// Keep the pending connection promise too, so simultaneous requests share the same attempt.
let poolPromise;

// Reuse a connection pool across requests. Retry after a failed connection.
async function getPool() {
  if (!poolPromise) {
    // Make sure the required settings exist before attempting a connection.
    const missing = ['DB_SERVER', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD']
      .filter(name => !process.env[name]);
    if (missing.length) {
      const error = new Error(`Missing database settings: ${missing.join(', ')}`);
      error.code = 'DB_CONFIG';
      throw error;
    }
    const port = Number(process.env.DB_PORT || 1433);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      const error = new Error('DB_PORT must be between 1 and 65535.');
      error.code = 'DB_CONFIG';
      throw error;
    }
    // Keep a small set of connections ready for the API routes to reuse.
    const pool = new sql.ConnectionPool({
      server: process.env.DB_SERVER,
      port,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: process.env.DB_ENCRYPT !== 'false',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
      },
      connectionTimeout: 10000,
      requestTimeout: 15000,
      pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
    });
    pool.on('error', error => console.error('SQL pool error:', error.code));
    // Clear a failed connection attempt so the next request can try again.
    poolPromise = pool.connect().catch(error => {
      poolPromise = undefined;
      throw error;
    });
  }
  // await getPool() waits until the connection is ready and returns the connected pool.
  return poolPromise;
}

// Called during shutdown to release the database connections.
async function closePool() {
  if (poolPromise) {
    const pool = await poolPromise;
    poolPromise = undefined;
    await pool.close();
  }
}

module.exports = { sql, getPool, closePool };
