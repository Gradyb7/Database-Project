// Run with npm test. These tests send real HTTP requests to a temporary local server.
// The database is replaced with small fake objects, so these tests do not change SQL Server data.
// An assert checks an expected result and fails the test if the actual result differs.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../backend/server');

// Start a disposable server, run the supplied test function, then close it even if a check fails.
async function withApp(getPool, run) {
  // Port 0 asks the operating system for an unused port, avoiding the normal app server.
  const server = createApp(getPool).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await run(base); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('all reports pass typed parameters to the correct stored procedure', async () => {
  let last;
  const rows = [{ GenreName: 'Drama', AverageRating: 4.5 }];
  // This fake pool records the parameter and procedure without connecting to SQL Server.
  const getPool = async () => ({ request() {
    return {
      // Returning this allows the route to chain .input(...).execute(...) like the real driver.
      input(name, type, value) { last = { name, type, value }; return this; },
      async execute(procedure) { last.procedure = procedure; return { recordset: rows }; }
    };
  } });
  await withApp(getPool, async base => {
    for (const [path, procedure, parameter, value] of [
      ['top-shows?year=2020', 'Top10RatedShows', 'Year', 2020],
      ['active-users?minimumReviews=0', 'MostActiveUsers', 'MinimumReviews', 0],
      ['box-office?genre=Drama', 'AverageRevenuePerGenreByRating', 'Genre', 'Drama'],
      ['successful-person?personType=Author', 'MostSuccessfulPerson', 'PersonType', 'author'],
      ['favorite-genre?userId=1', 'UsersFavoriteGenre', 'UserID', 1]
    ]) {
      const response = await fetch(`${base}/api/reports/${path}`);
      // Check both the HTTP response and the exact arguments sent to the fake database.
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), rows);
      assert.equal(last.procedure, procedure);
      assert.equal(last.name, parameter);
      assert.equal(last.value, value);
      assert.ok(last.type);
    }
  });
});

test('invalid report and catalog inputs are rejected before database access', async () => {
  // If validation accidentally reaches the database, this fake throws and the test fails.
  await withApp(async () => { throw new Error('Database should not be called'); }, async base => {
    for (const path of [
      'reports/favorite-genre', 'reports/favorite-genre?userId=1.5',
      'reports/favorite-genre?userId=1&userId=2',
      'reports/favorite-genre?userId=2147483648',
      'reports/top-shows?year=10000', 'reports/active-users?minimumReviews=-1',
      'reports/successful-person?personType=director', 'reports/box-office?genre=',
      'media?genreId=abc', 'media?mediaType=Music'
    ]) {
      assert.equal((await fetch(`${base}/api/${path}`)).status, 400, path);
    }
  });
});

test('catalog filters are bound as parameters, including SQL-like text', async () => {
  const parameters = {};
  let query;
  await withApp(async () => ({ request: () => ({
    input(name, type, value) { parameters[name] = value; return this; },
    async query(value) { query = value; return { recordset: [] }; }
  }) }), async base => {
    // This deliberately suspicious title must remain a parameter, never part of the SQL text.
    const title = "'; DROP TABLE Media;--";
    const response = await fetch(`${base}/api/media?${new URLSearchParams({ title, mediaType: 'Book', genreId: '2' })}`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
    assert.deepEqual(parameters, { Title: title, Type: 'Book', GenreID: 2 });
    assert.ok(!query.includes(title));
  });
});

test('database errors return a safe message and static pages remain available', async () => {
  // Simulate a failed SQL login and confirm that private error text is not sent to the browser.
  await withApp(async () => { throw Object.assign(new Error('secret-password'), { code: 'ELOGIN' }); }, async base => {
    const response = await fetch(`${base}/api/reports/favorite-genre?userId=1`);
    assert.equal(response.status, 503);
    assert.ok(!(await response.text()).includes('secret-password'));
    assert.equal((await fetch(`${base}/reports.html`)).status, 200);
    assert.equal((await fetch(`${base}/js/reports.js`)).status, 200);
    assert.equal((await fetch(`${base}/backend/db.js`)).status, 404);
    assert.equal((await fetch(`${base}/.env`)).status, 404);
    assert.equal((await fetch(`${base}/api/unknown`)).status, 404);
  });
});
