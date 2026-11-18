// Run explicitly with RUN_DB_TESTS=true node --test tests/live-crud.test.js.
// This test uses the database in .env, creates temporary data, and cleans up its recorded IDs.
// Ordinary npm test skips this file so routine checks do not write to the database.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../backend/db');
const { createApp } = require('../backend/server');

// Opt in explicitly: this creates temporary records and deletes only those records afterward.
test('live SQL Server create, read, update, and delete flows', { skip: process.env.RUN_DB_TESTS !== 'true' }, async () => {
  const pool = await db.getPool();
  // Use a timestamp in test names to avoid conflicts with existing project records.
  const suffix = `Test${Date.now()}`;
  // Record every new ID so cleanup targets only rows made by this test.
  const created = { users: [], authors: [], producers: [], publishers: [], media: [] };
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  // Send one API request, verify its expected status, and return the JSON result.
  async function request(path, method = 'GET', values, expected = 200) {
    const response = await fetch(base + path, {
      method, headers: { 'Content-Type': 'application/json' },
      body: values === undefined ? undefined : JSON.stringify(values)
    });
    const data = await response.json();
    assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
    return data;
  }
  try {
    // Create and edit temporary related records before using their IDs in media and reviews.
    const user = await request('/users', 'POST', { UserName: suffix }, 201);
    created.users.push(user.UserID);
    await request(`/users/${user.UserID}`, 'PUT', { UserName: suffix + 'Edited' });
    await request('/users', 'POST', { UserName: suffix + 'Edited' }, 409);
    const author = await request('/authors', 'POST', { FirstName: suffix, LastName: 'Author', Location: '' }, 201);
    created.authors.push(author.AuthorID);
    await request(`/authors/${author.AuthorID}`, 'PUT', { FirstName: suffix, LastName: 'Author', Location: 'Kansas' });
    const producer = await request('/producers', 'POST', { FirstName: suffix, LastName: 'Producer' }, 201);
    created.producers.push(producer.ProducerID);
    await request(`/producers/${producer.ProducerID}`, 'PUT', { FirstName: suffix, LastName: 'Updated' });
    const publisher = await request('/publishers', 'POST', { Name: suffix, Website: `https://example.com/${suffix}` }, 201);
    created.publishers.push(publisher.PublisherID);
    await request(`/publishers/${publisher.PublisherID}`, 'PUT', { Name: suffix + 'Edited', Website: `https://example.com/${suffix}` });
    const lookups = await request('/lookups');
    // Use real lookup IDs and a valid leap-day date in each sample title.
    const common = { Title: suffix, GenreID: String(lookups.genres[0].GenreID), Platform: '', CreationDate: '2024-02-29' };
    const types = [
      { TypeName: 'Movie', ProducerID: String(producer.ProducerID), MPAID: String(lookups.ratings[0].MPAID), Runtime: '100', Director: '', Studio: '', BoxOfficeRevenue: '12345.67' },
      { TypeName: 'Show', EpisodeCount: '10', SeasonCount: '1' },
      { TypeName: 'Book', AuthorID: String(author.AuthorID), PublisherID: String(publisher.PublisherID), CopiesSold: '200', Description: 'Test description' }
    ];
    for (const type of types) {
      // The spread syntax combines shared media fields with the fields for this particular type.
      const values = { ...common, ...type };
      const media = await request('/media', 'POST', values, 201);
      created.media.push(media.MediaID);
      const detail = await request(`/media/${media.MediaID}`);
      assert.equal(detail.TypeName, type.TypeName);
      assert.equal(detail.ReleaseDate, '2024-02-29');
      if (type.TypeName === 'Movie') assert.equal(detail.BoxOfficeRevenue, '12345.67');
      await request(`/media/${media.MediaID}`, 'PUT', { ...values, Title: suffix + 'Edited' });
      assert.equal((await request(`/media/${media.MediaID}`)).Title, suffix + 'Edited');
    }
    // Exercise review creation, duplicate rejection, editing, rating refresh, and deletion.
    const mediaID = created.media[0];
    const review = await request(`/media/${mediaID}/reviews`, 'POST', { UserID: String(user.UserID), Score: '4', ReviewText: 'First review' }, 201);
    await request(`/media/${mediaID}/reviews`, 'POST', { UserID: String(user.UserID), Score: '3' }, 409);
    await request(`/media/${mediaID}/reviews/${review.ReviewID}`, 'PUT', { UserID: String(user.UserID), Score: '5', ReviewText: 'Updated review' });
    const reviews = await request(`/media/${mediaID}/reviews`);
    assert.equal(reviews[0].Score, 5);
    assert.equal((await request(`/media/${mediaID}`)).AverageRating, 5);
    await request(`/media/${mediaID}/reviews/${review.ReviewID}`, 'DELETE', { UserID: String(user.UserID) });
    assert.equal((await request(`/media/${mediaID}/reviews`)).length, 0);
    // A failed subtype insert must also undo the new shared Media row.
    await request('/media', 'POST', { ...common, ...types[0], Title: suffix + 'Rollback', ProducerID: '2147483647' }, 400);
    assert.equal((await request(`/media?title=${suffix}Rollback`)).length, 0);
    await request('/media', 'POST', { ...common, ...types[1], CreationDate: '2023-02-29' }, 400);
    await request('/media/2147483647', 'GET', undefined, 404);
    console.log('Verified all three media types, all maintenance forms, reviews, duplicates, and rollback.');
  // Cleanup runs even if an assertion fails. It removes dependent rows before parent records.
  } finally {
    // Remove only IDs created by this test, in foreign-key order.
    for (const id of created.media) {
      await pool.request().input('ID', db.sql.Int, id).query('DELETE FROM Review WHERE MediaID=@ID; DELETE FROM Movie WHERE MediaID=@ID; DELETE FROM [Show] WHERE MediaID=@ID; DELETE FROM Book WHERE MediaID=@ID; DELETE FROM Media WHERE MediaID=@ID;');
    }
    for (const [name, table, key] of [['users','Users','UserID'], ['authors','Author','AuthorID'], ['producers','Producer','ProducerID'], ['publishers','Publisher','PublisherID']]) {
      for (const id of created[name]) await pool.request().input('ID', db.sql.Int, id).query(`DELETE FROM ${table} WHERE ${key}=@ID`);
    }
    await new Promise(resolve => server.close(resolve));
    await db.closePool();
  }
});
