// Handles a single title, the add/edit media form, and its dropdown choices.
// Each title has one Media row plus one Movie, Show, or Book row.

const express = require('express');
const { sql } = require('../db');
const { badRequest, integer, optionalInteger, text, money, date } = require('../validation');

function mediaRouter(getPool) {
  const router = express.Router();
  // One request loads all the choices needed by the media form.
  router.get('/lookups', async (req, res) => {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT MediaTypeID, TypeName FROM MediaType ORDER BY TypeName;
      SELECT GenreID, GenreName FROM Genre ORDER BY GenreName;
      SELECT MPAID, Rating FROM MPARating ORDER BY MPAID;
      SELECT AuthorID, FirstName + ' ' + LastName AS Name FROM Author ORDER BY LastName;
      SELECT ProducerID, FirstName + ' ' + LastName AS Name FROM Producer ORDER BY LastName;
      SELECT PublisherID, Name FROM Publisher ORDER BY Name;`);
    // Each SELECT produces a separate result array. Their order matches the queries above.
    const [types, genres, ratings, authors, producers, publishers] = result.recordsets;
    res.json({ types, genres, ratings, authors, producers, publishers });
  });

  // The details page and edit form both load this endpoint using the MediaID in their URL.
  router.get('/media/:id', async (req, res) => {
    const id = integer(req.params.id, 'Media ID');
    const pool = await getPool();
    // LEFT JOIN includes whichever subtype exists. Fields from the other types remain null.
    const result = await pool.request().input('ID', sql.Int, id).query(`
      SELECT M.*, T.TypeName, G.GenreName,
        CONVERT(char(10), M.CreationDate, 23) AS ReleaseDate,
        V.Director, V.Runtime, V.ProducerID, V.Studio, V.MPAID,
        CONVERT(varchar(30), V.BoxOfficeRevenue) AS BoxOfficeRevenue,
        P.FirstName + ' ' + P.LastName AS ProducerName, A.Rating,
        S.EpisodeCount, S.SeasonCount, B.AuthorID, B.PublisherID, B.Description, B.CopiesSold,
        AU.FirstName + ' ' + AU.LastName AS AuthorName, PB.Name AS PublisherName,
        (SELECT AVG(CAST(Score AS decimal(10,4))) FROM Review WHERE MediaID = M.MediaID) AS AverageRating
      FROM Media M JOIN MediaType T ON T.MediaTypeID = M.MediaTypeID
      JOIN Genre G ON G.GenreID = M.GenreID
      LEFT JOIN Movie V ON V.MediaID = M.MediaID
      LEFT JOIN Producer P ON P.ProducerID = V.ProducerID
      LEFT JOIN MPARating A ON A.MPAID = V.MPAID
      LEFT JOIN [Show] S ON S.MediaID = M.MediaID
      LEFT JOIN Book B ON B.MediaID = M.MediaID
      LEFT JOIN Author AU ON AU.AuthorID = B.AuthorID
      LEFT JOIN Publisher PB ON PB.PublisherID = B.PublisherID
      WHERE M.MediaID = @ID`);
    if (!result.recordset.length) return res.status(404).json({ error: 'Media not found.' });
    res.json(result.recordset[0]);
  });

  // POST has no ID and creates a title. PUT has an ID and edits that existing title.
  async function save(req, res) {
    const body = req.body;
    const id = req.params.id ? integer(req.params.id, 'Media ID') : null;
    const type = text(body.TypeName, 'Media type', 20);
    if (!['Movie', 'Show', 'Book'].includes(type)) throw badRequest('Choose Movie, Show, or Book.');
    // Validate all fields before starting the database transaction.
    // Each array entry contains a parameter name, its SQL type, and its validated value.
    const values = [
      ['Title', sql.NVarChar(200), text(body.Title, 'Title', 200)],
      ['GenreID', sql.Int, integer(body.GenreID, 'Genre ID')],
      ['Platform', sql.NVarChar(100), text(body.Platform, 'Platform', 100, true)],
      ['CreationDate', sql.Date, date(body.CreationDate)],
      ['TypeName', sql.NVarChar(20), type]
    ];
    // Only collect fields for the selected media type. Unrelated form fields are ignored.
    if (type === 'Movie') values.push(
      ['Director', sql.NVarChar(100), text(body.Director, 'Director', 100, true)],
      ['Runtime', sql.Int, optionalInteger(body.Runtime, 'Runtime', 1)],
      ['ProducerID', sql.Int, integer(body.ProducerID, 'Producer ID')],
      ['Studio', sql.NVarChar(100), text(body.Studio, 'Studio', 100, true)],
      ['MPAID', sql.Int, integer(body.MPAID, 'MPA rating')],
      ['Revenue', sql.VarChar(30), money(body.BoxOfficeRevenue)]
    );
    if (type === 'Show') values.push(
      ['EpisodeCount', sql.Int, optionalInteger(body.EpisodeCount, 'Episode count')],
      ['SeasonCount', sql.Int, integer(body.SeasonCount, 'Season count', 0)]
    );
    if (type === 'Book') values.push(
      ['AuthorID', sql.Int, integer(body.AuthorID, 'Author ID')],
      ['PublisherID', sql.Int, integer(body.PublisherID, 'Publisher ID')],
      ['Description', sql.NVarChar(1000), text(body.Description, 'Description', 1000, true)],
      ['CopiesSold', sql.Int, optionalInteger(body.CopiesSold, 'Copies sold')]
    );
    const pool = await getPool();
    // A transaction groups both table changes so a partial save can be undone.
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      // Every query using this request belongs to the same transaction.
      const request = new sql.Request(transaction);
      for (const [name, dataType, value] of values) request.input(name, dataType, value);
      // Look up the type ID by name instead of assuming Movie, Show, and Book have fixed IDs.
      const typeResult = await request.query('SELECT MediaTypeID FROM MediaType WHERE TypeName = @TypeName');
      if (!typeResult.recordset.length) throw badRequest('Media type is missing from the database.');
      request.input('TypeID', sql.Int, typeResult.recordset[0].MediaTypeID);
      let mediaID = id;
      if (id) {
        request.input('ID', sql.Int, id);
        // Hold an update lock while checking and saving this record to avoid conflicting edits.
        const current = await request.query('SELECT MediaTypeID FROM Media WITH (UPDLOCK, HOLDLOCK) WHERE MediaID = @ID');
        if (!current.recordset.length) throw Object.assign(new Error('Media not found.'), { status: 404 });
        // Keep the existing type so an edit cannot leave a mismatched subtype row.
        if (current.recordset[0].MediaTypeID !== typeResult.recordset[0].MediaTypeID) throw badRequest('The media type cannot be changed after creation.');
        await request.query('UPDATE Media SET Title=@Title, GenreID=@GenreID, Platform=@Platform, CreationDate=@CreationDate WHERE MediaID=@ID');
      } else {
        const result = await request.query(`INSERT INTO Media (MediaTypeID, Title, GenreID, Platform, CreationDate)
          OUTPUT INSERTED.MediaID VALUES (@TypeID, @Title, @GenreID, @Platform, @CreationDate)`);
        // OUTPUT INSERTED.MediaID gives us the ID SQL Server assigned to the new title.
        mediaID = result.recordset[0].MediaID;
        request.input('ID', sql.Int, mediaID);
      }
      // Save the shared Media row and its type-specific row as one operation.
      // Choose the matching subtype statement. Each ternary uses UPDATE when id exists.
      const queries = {
        Movie: id
          ? 'UPDATE Movie SET Director=@Director, Runtime=@Runtime, ProducerID=@ProducerID, Studio=@Studio, MPAID=@MPAID, BoxOfficeRevenue=CAST(@Revenue AS decimal(18,2)) WHERE MediaID=@ID'
          : 'INSERT INTO Movie (MediaID,MediaTypeID,Director,Runtime,ProducerID,Studio,MPAID,BoxOfficeRevenue) VALUES (@ID,@TypeID,@Director,@Runtime,@ProducerID,@Studio,@MPAID,CAST(@Revenue AS decimal(18,2)))',
        Show: id
          ? 'UPDATE [Show] SET EpisodeCount=@EpisodeCount, SeasonCount=@SeasonCount WHERE MediaID=@ID'
          : 'INSERT INTO [Show] (MediaID,MediaTypeID,EpisodeCount,SeasonCount) VALUES (@ID,@TypeID,@EpisodeCount,@SeasonCount)',
        Book: id
          ? 'UPDATE Book SET AuthorID=@AuthorID, PublisherID=@PublisherID, Description=@Description, CopiesSold=@CopiesSold WHERE MediaID=@ID'
          : 'INSERT INTO Book (MediaID,MediaTypeID,AuthorID,PublisherID,Description,CopiesSold) VALUES (@ID,@TypeID,@AuthorID,@PublisherID,@Description,@CopiesSold)'
      };
      const saved = await request.query(queries[type]);
      // Expect exactly one subtype row. Otherwise undo the shared Media change too.
      if (saved.rowsAffected[0] !== 1) throw badRequest('The media detail row is missing.');
      // Commit makes both saves permanent, then return the ID for the browser to open.
      await transaction.commit();
      res.status(id ? 200 : 201).json({ MediaID: mediaID });
    } catch (error) {
      // Undo the shared row too if saving the movie, show, or book fails.
      await transaction.rollback();
      // Pass the failure to server.js so it can show the user a readable error.
      throw error;
    }
  }
  router.post('/media', save);
  router.put('/media/:id', save);
  return router;
}
module.exports = mediaRouter;
