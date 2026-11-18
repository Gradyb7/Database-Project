// Handles catalog searches and genre choices requested by frontend/js/catalog.js.
// server.js adds /api before these paths, so /media here becomes /api/media.

const express = require('express');
const { sql } = require('../db');
const { badRequest, integer, text } = require('../validation');

function catalogRouter(getPool) {
  const router = express.Router();
  // Supply genre choices for the search and report dropdowns.
  router.get('/genres', async (req, res) => {
    const pool = await getPool();
    const result = await pool.request().query('SELECT GenreID, GenreName FROM Genre ORDER BY GenreName');
    res.json(result.recordset);
  });
  // Search media using the filters provided by the browser.
  // req.query contains values after the question mark, such as ?title=Dune&genreId=2.
  router.get('/media', async (req, res) => {
    const title = text(req.query.title, 'Title', 200, true);
    const type = text(req.query.mediaType, 'Media type', 20, true);
    if (type && !['Movie', 'Show', 'Book'].includes(type)) throw badRequest('Invalid media type.');
    const genre = req.query.genreId === undefined || req.query.genreId === ''
      ? null : integer(req.query.genreId, 'Genre ID');
    const pool = await getPool();
    // Bind filters as parameters so user input stays separate from SQL code.
    // Empty filters become null, which tells the query to include all values.
    // LEFT JOIN keeps titles with no reviews. GROUP BY gives one average per title.
    const result = await pool.request()
      .input('Title', sql.NVarChar(200), title)
      .input('Type', sql.NVarChar(20), type)
      .input('GenreID', sql.Int, genre)
      .query(`
        SELECT M.MediaID, M.Title, T.TypeName AS MediaType, G.GenreName,
          M.Platform, CONVERT(char(10), M.CreationDate, 23) AS CreationDate,
          AVG(CAST(R.Score AS decimal(10,4))) AS AverageRating,
          COUNT(R.ReviewID) AS TotalReviews
        FROM Media M
        JOIN MediaType T ON T.MediaTypeID = M.MediaTypeID
        JOIN Genre G ON G.GenreID = M.GenreID
        LEFT JOIN Review R ON R.MediaID = M.MediaID
        WHERE (@Title IS NULL OR CHARINDEX(@Title, M.Title) > 0)
          AND (@Type IS NULL OR T.TypeName = @Type)
          AND (@GenreID IS NULL OR M.GenreID = @GenreID)
        GROUP BY M.MediaID, M.Title, T.TypeName, G.GenreName, M.Platform, M.CreationDate
        ORDER BY M.Title, M.MediaID`);
    res.json(result.recordset);
  });
  return router;
}
module.exports = catalogRouter;
