// Connects the report forms to the five procedures already installed in SQL Server.
// This file calls the procedures by name. It does not execute Procedures.sql itself.

const express = require('express');
const { sql } = require('../db');
const { badRequest, integer, text } = require('../validation');

// Each public route maps to a fixed procedure and a typed SQL parameter.
function reportsRouter(getPool) {
  const router = express.Router();
  // Each entry lists the URL, procedure, input names, SQL type, and validation rule.
  const reports = [
    ['top-shows', 'Top10RatedShows', 'year', 'Year', sql.Int,
      value => integer(value, 'Year', 1, 9999)],
    ['active-users', 'MostActiveUsers', 'minimumReviews', 'MinimumReviews', sql.Int,
      value => integer(value, 'Minimum reviews', 0)],
    ['box-office', 'AverageRevenuePerGenreByRating', 'genre', 'Genre', sql.NVarChar(50),
      value => text(value, 'Genre', 50)],
    ['successful-person', 'MostSuccessfulPerson', 'personType', 'PersonType', sql.NVarChar(20),
      value => {
        const type = text(value, 'Person type', 20).toLowerCase();
        if (!['author', 'producer'].includes(type)) throw badRequest('Choose author or producer.');
        return type;
      }],
    ['favorite-genre', 'UsersFavoriteGenre', 'userId', 'UserID', sql.Int,
      value => integer(value, 'User ID')]
  ];

  // The brackets unpack each report definition into named variables for this loop.
  for (const [route, procedure, queryName, parameter, type, validate] of reports) {
    // req holds the browser request. Res is used to send the response back.
    router.get(`/${route}`, async (req, res) => {
      // Validate the input before sending it to SQL Server.
      const value = validate(req.query[queryName]);
      const pool = await getPool();
      // Pass the value as a SQL parameter and run the installed stored procedure.
      const result = await pool.request().input(parameter, type, value).execute(procedure);
      // Send the returned rows to the browser as JSON for its results table.
      res.json(result.recordset);
    });
  }
  return router;
}

module.exports = reportsRouter;
