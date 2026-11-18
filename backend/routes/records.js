// Handles listing, adding, and editing users, authors, producers, and publishers.
// frontend/js/users.js and manage.js send requests here through server.js.

const express = require('express');
const { sql } = require('../db');
const { integer, text } = require('../validation');

// These fixed definitions let the four small maintenance forms share the same code.
// Each field entry is [column name, maximum text length, optional].
const records = {
  users: { table: 'Users', id: 'UserID', fields: [['UserName', 50, false]] },
  authors: { table: 'Author', id: 'AuthorID', fields: [['FirstName', 50, false], ['LastName', 50, false], ['Location', 100, true]] },
  producers: { table: 'Producer', id: 'ProducerID', fields: [['FirstName', 50, false], ['LastName', 50, false]] },
  publishers: { table: 'Publisher', id: 'PublisherID', fields: [['Name', 100, false], ['Website', 200, false]] }
};

function recordsRouter(getPool) {
  const router = express.Router();
  // Object.entries gives pairs such as users and its definition. Register routes for each pair.
  for (const [name, definition] of Object.entries(records)) {
    const { table, id, fields } = definition;
    // Table and column names come only from the fixed definitions above.
    router.get(`/${name}`, async (req, res) => {
      const pool = await getPool();
      const result = await pool.request().query(`SELECT * FROM ${table} ORDER BY ${id}`);
      res.json(result.recordset);
    });

    // Both POST and PUT use this handler. An ID in the URL means update instead of insert.
    async function save(req, res) {
      // map builds a new array of validated values in the same order as the field definitions.
      const values = fields.map(([field, length, optional]) => text(req.body[field], field, length, optional));
      // req.params.id comes from /users/:id. Req.body contains the submitted form values.
      const recordID = req.params.id ? integer(req.params.id, 'ID') : null;
      const pool = await getPool();
      const request = pool.request();
      // input binds each value to a named SQL parameter such as @UserName.
      fields.forEach(([field, length], index) => request.input(field, sql.NVarChar(length), values[index]));
      // map and join build column lists from our fixed definitions, never from submitted field names.
      let query;
      if (recordID) {
        request.input('ID', sql.Int, recordID);
        query = `UPDATE ${table} SET ${fields.map(([field]) => `${field} = @${field}`).join(', ')} OUTPUT INSERTED.* WHERE ${id} = @ID`;
      } else {
        query = `INSERT INTO ${table} (${fields.map(([field]) => field).join(', ')}) OUTPUT INSERTED.* VALUES (${fields.map(([field]) => `@${field}`).join(', ')})`;
      }
      // OUTPUT INSERTED.* returns the saved row for both INSERT and UPDATE.
      const result = await request.query(query);
      // No returned row means the ID being edited did not match an existing record.
      if (!result.recordset.length) return res.status(404).json({ error: 'Record not found.' });
      // HTTP 200 means an update succeeded. 201 means a new record was created.
      res.status(recordID ? 200 : 201).json(result.recordset[0]);
    }
    router.post(`/${name}`, save);
    router.put(`/${name}/:id`, save);
  }
  return router;
}
module.exports = recordsRouter;
