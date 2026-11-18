// Tests invalid form submissions and database error messages without using a real database.
// These tests check the API responses, not whether SQL inserts and updates actually work.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../backend/server');

// Inject a fake database function, start an available local port, and close it after the test.
async function withApp(getPool, run) {
  const server = createApp(getPool).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('write routes validate required fields and reject invalid JSON', async () => {
  await withApp(async () => { throw new Error('Validation should happen first'); }, async base => {
    // Each pair is a route and invalid form values. Every case should return HTTP 400.
    for (const [url, body] of [
      ['/api/users', {}], ['/api/authors', { FirstName: 'A' }],
      ['/api/media', { TypeName: 'Music' }],
      ['/api/media/1/reviews', { UserID: '1', Score: '6' }],
      ['/api/media/1/reviews', { UserID: '1', Score: '4', ReviewText: 'x'.repeat(1001) }]
    ]) {
      const response = await fetch(base + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      assert.equal(response.status, 400);
    }
    // A lone opening brace is broken JSON, so Express should reject it before a route runs.
    const invalid = await fetch(base + '/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(invalid.status, 400);
    // Forms must use JSON. A plain text body should return HTTP 415.
    const wrongType = await fetch(base + '/api/users', { method: 'POST', body: 'UserName=Test' });
    assert.equal(wrongType.status, 415);
  });
});

test('database constraints return actionable errors', async () => {
  // 2627 and 2601 are duplicate errors. 547 is a foreign-key or check-constraint error.
  for (const [number, expected] of [[2627, 409], [2601, 409], [547, 400]]) {
    await withApp(async () => ({ request: () => ({
      // This fake accepts parameter binding, then throws when the route executes its query.
      input() { return this; },
      async query() { throw Object.assign(new Error('private SQL message'), { number }); }
    }) }), async base => {
      const response = await fetch(base + '/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ UserName: 'Test' }) });
      assert.equal(response.status, expected);
      assert.ok(!(await response.text()).includes('private SQL message'));
    });
  }
});
