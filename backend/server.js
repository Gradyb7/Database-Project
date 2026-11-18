// Entry point: npm start runs this file in Node, not in the browser.
// Express serves the HTML files and sends /api requests to the route files below.

const express = require('express');
const path = require('node:path');
const db = require('./db');
const reportsRouter = require('./routes/reports');
const catalogRouter = require('./routes/catalog');
const recordsRouter = require('./routes/records');
const mediaRouter = require('./routes/media');
const reviewsRouter = require('./routes/reviews');

// Serve the website and connect its API routes.
// Tests can pass a fake getPool function. Normal startup uses the real one from db.js.
function createApp(getPool = db.getPool) {
  const app = express();
  app.disable('x-powered-by');
  // Read JSON form submissions and reject other body formats for write requests.
  // express.json converts the submitted JSON text into req.body for the route handlers.
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      if (!req.is('application/json')) return res.status(415).json({ error: 'Send form data as JSON.' });
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({ error: 'A form object is required.' });
      }
    }
    // next() lets Express continue to the next handler instead of ending this request.
    next();
  });
  // Check the database connection with a small query.
  app.get('/api/health', async (req, res) => {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS Connected');
    res.json({ database: 'connected' });
  });
  // Send report requests to reports.js and other data requests to catalog.js.
  app.use('/api/reports', reportsRouter(getPool));
  app.use('/api', recordsRouter(getPool));
  app.use('/api', mediaRouter(getPool));
  app.use('/api', reviewsRouter(getPool));
  app.use('/api', catalogRouter(getPool));
  // This fallback runs only when none of the API routes above handled the URL.
  app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found.' }));
  // Only expose frontend assets, never database settings or backend source.
  app.use(express.static(path.join(__dirname, '../frontend')));
  // Return a helpful error to the browser without exposing database credentials.
  app.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON form data.' });
    if (error.status === 413) return res.status(413).json({ error: 'Form data is too large.' });
    if ([400, 404].includes(error.status)) return res.status(error.status).json({ error: error.message });
    // Translate common database constraints into messages the user can fix.
    if ([2601, 2627].includes(error.number)) return res.status(409).json({ error: 'That username, publisher name/website, or user review already exists. Edit the existing record instead.' });
    if (error.number === 547) return res.status(400).json({ error: 'A selected record no longer exists or a value is outside its allowed range. Reload and check the form.' });
    console.error('Database request failed:', error.code || error.name);
    const message = error.code === 'DB_CONFIG'
      ? 'Database connection is not configured. Fill in the server .env file.'
      : 'Unable to load database data. Check the SQL Server connection and installed procedures.';
    res.status(503).json({ error: message });
  });
  return app;
}

// npm start runs this file directly and starts the local web server.
if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = createApp().listen(port, '127.0.0.1', () => {
    console.log(`Media Tracker: http://localhost:${port}`);
  });
  // Close database connections when the server is stopped.
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.close(async () => {
      await db.closePool();
      process.exit(0);
    }));
  }
}
module.exports = { createApp };
