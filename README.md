# Media Tracker

CIS 560 Group 3. Plain HTML/CSS/JavaScript frontend, an Express backend, and SQL Server.

## Run locally

1. Install Node.js 22 or newer and run `npm install` in this folder.
2. Copy `.env.example` to `.env` and enter your SQL Server host, TCP port, database name, SQL login, and password. The database must already exist and be reachable from this computer (including any required school VPN). This setup uses SQL authentication, not Windows integrated authentication.
3. For a **new, empty database**, execute `sql/Tables.sql`, then `sql/Data.sql` in your SQL client with that database selected. **Tables.sql drops existing tables**, so do not run it to reconnect to a populated database.
4. Execute `backend/Procedures.sql` in the same database to install/update the five reports. For an existing project database, only this procedure update is needed.
5. Run `npm start`, then open http://localhost:3000. Open pages through this server, not by double-clicking the HTML files.
6. Visit http://localhost:3000/api/health to check the actual database connection. A successful response is `{"database":"connected"}`.

`DB_SERVER` is a hostname/IP without a URL prefix. Set `DB_PORT` to the instance's configured TCP port. The login needs SELECT, INSERT, and UPDATE permission on the editable project tables, DELETE permission on Review, and EXECUTE permission on the report procedures. For a trusted local/class server with a self-signed certificate, you may need `DB_TRUST_SERVER_CERTIFICATE=true`; the default checks certificates.

The web server listens on this computer only. Keep `.env` private; `.gitignore` excludes it. Commit `.env.example` and `package-lock.json` so teammates can reproduce the setup. No database credentials are included in this repository.

## Files

- `backend/server.js`: serves the frontend and mounts API routes.
- `backend/db.js`: loads connection settings and reuses a SQL Server connection pool.
- `backend/validation.js`: validates API parameters.
- `backend/routes/reports.js`: maps five report URLs to stored procedures.
- `backend/routes/catalog.js`: searches media and reads genres.
- `backend/routes/media.js`: loads details and dropdowns, and adds or edits media.
- `backend/routes/reviews.js`: reads, adds, edits, and deletes reviews.
- `backend/routes/records.js`: lists, adds, and edits users, authors, producers, and publishers.
- `backend/Procedures.sql`: report SQL installed in the database.
- `frontend/js/`: browser requests and safe HTML table rendering.
- `sql/`: schema and sample data scripts.
- `tests/api.test.js`: HTTP tests using a fake database boundary; these do not test SQL execution.

## Connected pages

- Browse media: title substring, media type, and genre filtering, plus average ratings.
- Reports: all five aggregating reports with parameter forms and results tables.
- Media details: type-specific details, average rating, and review add/edit/delete controls.
- Add/edit media: shared fields and movie, show, or book details saved together.
- Users: list, add, and edit usernames.
- Manage records: list, add, and edit authors, producers, and publishers.

This is a local class demo with profile selection rather than password authentication. Anyone using the app can edit profiles and reviews. Each user can review a title once. Media type cannot be changed after creation.

## API

| URL | Parameters |
| --- | --- |
| `/api/health` | None; checks database connectivity |
| `/api/genres` | None |
| `/api/users` | None |
| `/api/media` | Optional `title`, `mediaType` (Movie/Show/Book), `genreId` |
| `/api/reports/top-shows` | `year` |
| `/api/reports/active-users` | `minimumReviews` |
| `/api/reports/box-office` | `genre` (name) |
| `/api/reports/successful-person` | `personType` (author/producer) |
| `/api/reports/favorite-genre` | `userId` |

Run `npm test` for automated API checks. After configuring SQL Server, compare each report with an EXEC call in your SQL client. Include a user with tied genre averages and a user with no reviews. A blank table is not used to hide connection failures: the page displays the error.

## Saving changes

Forms send JSON to these routes. POST adds a record, PUT edits one, and DELETE removes a review.

| Route | Methods |
| --- | --- |
| `/api/lookups` | GET dropdown choices |
| `/api/media/:id` | GET, PUT |
| `/api/media` | POST (also GET for searching) |
| `/api/media/:id/reviews` | GET, POST |
| `/api/media/:id/reviews/:reviewId` | PUT, DELETE |
| `/api/users`, `/api/authors`, `/api/producers`, `/api/publishers` | GET, POST |
| Each record route followed by `/:id` | PUT |

The HTML page loads its matching file in `frontend/js/`. That file uses `common.js` to send a request. `server.js` directs it to a route, which validates the values and uses `db.js` to run SQL. The response comes back as JSON for the browser to display. Comments in the files explain each step.

`npm test` runs the local API tests with a fake database. To explicitly run the live database test on macOS/Linux, use `RUN_DB_TESTS=true node --test tests/live-crud.test.js`. This creates temporary records in the configured database and removes their recorded IDs afterward. It needs delete permission for those test records.
