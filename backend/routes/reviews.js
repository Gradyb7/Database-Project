// Handles the reviews shown on media.html for one selected title.
// GET reads reviews, POST adds one, PUT edits one, and DELETE removes one.

const express = require('express');
const { sql } = require('../db');
const { integer, text } = require('../validation');

function reviewsRouter(getPool) {
  const router = express.Router();
  // The :id part is the MediaID from the URL, not the ID of a review.
  router.get('/media/:id/reviews', async (req, res) => {
    const id = integer(req.params.id, 'Media ID');
    const pool = await getPool();
    const result = await pool.request().input('MediaID', sql.Int, id).query(`
      SELECT R.ReviewID, R.UserID, U.UserName, R.Score, R.ReviewText,
        CONVERT(char(10), R.ReviewDate, 23) AS ReviewDate
      FROM Review R JOIN Users U ON U.UserID = R.UserID
      WHERE R.MediaID = @MediaID ORDER BY R.ReviewDate DESC, R.ReviewID DESC`);
    res.json(result.recordset);
  });

  // The optional reviewId in the URL chooses between editing and adding a review.
  async function save(req, res) {
    const mediaID = integer(req.params.id, 'Media ID');
    const userID = integer(req.body.UserID, 'User ID');
    const score = integer(req.body.Score, 'Score', 1, 5);
    const reviewText = text(req.body.ReviewText, 'Review text', 1000, true);
    const reviewID = req.params.reviewId ? integer(req.params.reviewId, 'Review ID') : null;
    const pool = await getPool();
    // Bind values separately so review text is treated as data rather than SQL code.
    const request = pool.request().input('MediaID', sql.Int, mediaID)
      .input('UserID', sql.Int, userID).input('Score', sql.Int, score)
      .input('ReviewText', sql.NVarChar(1000), reviewText);
    // A selected profile is not a login. This class demo has no authentication.
    // The condition ? update : insert expression selects one of the two SQL statements.
    // SQL Server supplies ReviewDate for a new row and prevents duplicate user/title reviews.
    const query = reviewID
      ? `UPDATE Review SET Score = @Score, ReviewText = @ReviewText
         OUTPUT INSERTED.ReviewID WHERE ReviewID = @ReviewID AND MediaID = @MediaID AND UserID = @UserID`
      : `INSERT INTO Review (MediaID, UserID, Score, ReviewText)
         OUTPUT INSERTED.ReviewID VALUES (@MediaID, @UserID, @Score, @ReviewText)`;
    if (reviewID) request.input('ReviewID', sql.Int, reviewID);
    const result = await request.query(query);
    if (!result.recordset.length) return res.status(404).json({ error: 'Review not found for this user and media.' });
    res.status(reviewID ? 200 : 201).json(result.recordset[0]);
  }
  router.post('/media/:id/reviews', save);
  router.put('/media/:id/reviews/:reviewId', save);
  // Match all three IDs so a delete cannot accidentally target a different title or profile.
  // This identifies the record but does not verify the identity of the person using the app.
  router.delete('/media/:id/reviews/:reviewId', async (req, res) => {
    const mediaID = integer(req.params.id, 'Media ID');
    const reviewID = integer(req.params.reviewId, 'Review ID');
    const userID = integer(req.body.UserID, 'User ID');
    const pool = await getPool();
    const result = await pool.request().input('MediaID', sql.Int, mediaID)
      .input('ReviewID', sql.Int, reviewID).input('UserID', sql.Int, userID)
      .query(`DELETE FROM Review OUTPUT DELETED.ReviewID
        WHERE ReviewID = @ReviewID AND MediaID = @MediaID AND UserID = @UserID`);
    if (!result.recordset.length) return res.status(404).json({ error: 'Review not found for this user and media.' });
    res.json({ message: 'Review deleted.' });
  });
  return router;
}
module.exports = reviewsRouter;
