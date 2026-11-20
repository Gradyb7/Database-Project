# Media Tracker

**CIS 560 Group Project · Team 3**

A web app for browsing and reviewing books, movies, and TV shows. Data lives in SQL Server. A Node.js/Express backend serves a plain HTML/CSS/JavaScript frontend and a JSON API.

## Project structure

```
├── backend/
│   ├── server.js         # Express app: static files, /api routes, error handling
│   ├── db.js             # SQL Server connection pool (reads .env)
│   ├── validation.js     # Shared input validation helpers
│   ├── Procedures.sql    # Stored procedures used by the reports
│   └── routes/           # API route handlers
│       ├── catalog.js    #   genres, media search
│       ├── media.js      #   media details, add/edit media, lookup lists
│       ├── reviews.js    #   review CRUD
│       ├── records.js    #   users, authors, producers, publishers
│       └── reports.js    #   report endpoints → stored procedures
├── frontend/
│   ├── index.html        # Browse media
│   ├── media.html        # Media details and reviews
│   ├── media-form.html   # Add/edit media
│   ├── users.html        # Users
│   ├── manage.html       # Authors, producers, publishers
│   ├── reports.html      # Reports
│   ├── css/styles.css
│   └── js/               # One script per page, plus common.js
├── sql/
│   ├── Tables.sql        # Schema
│   └── Data.sql          # Sample data
├── tests/                # API tests
└── Media_Database_Sample_Data.xlsx   # Source spreadsheet for the sample data
```

## Features

- **Browse and search** the media catalog, filtered by genre
- **View media details** and read, add, edit, or delete user reviews
- **Add and edit media** (books, movies, and shows, each with type-specific fields)
- **Manage records:** users, authors, producers, and publishers
- **Reports** built on stored procedures:
  - Top 10 rated shows for a given year
  - Most active users (by minimum review count)
  - Average box-office revenue per genre, by MPA rating
  - Most successful author or producer
  - A user's favorite genre

## Tech stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Database | Microsoft SQL Server (T-SQL)                  |
| Backend  | Node.js 22+, Express 5, `mssql`, `dotenv`     |
| Frontend | HTML, CSS, vanilla JavaScript (no build step) |
| Tests    | Node's built-in test runner (`node --test`)   |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or newer
- Access to a SQL Server database, plus a SQL login that can create tables and procedures

### 1. Set up the database

Run these scripts against your database **in this order** (for example in SSMS or Azure Data Studio):

1. `sql/Tables.sql`: creates the tables
2. `sql/Data.sql`: loads the sample data
3. `backend/Procedures.sql`: installs the report stored procedures

> ⚠️ `Tables.sql` **drops existing tables** before it recreates them. Running it again deletes all data, including reviews added through the app.

### 2. Configure the connection

Copy the example settings file and fill in your database details:

```bash
cp .env.example .env
```

| Variable                      | Description                                                                        | Default  |
| ----------------------------- | ---------------------------------------------------------------------------------- | -------- |
| `PORT`                        | Port the web server listens on                                                     | `3000`   |
| `DB_SERVER`                   | SQL Server host name or address                                                    | required |
| `DB_PORT`                     | SQL Server port                                                                    | `1433`   |
| `DB_DATABASE`                 | Database name                                                                      | required |
| `DB_USER` / `DB_PASSWORD`     | SQL login credentials                                                              | required |
| `DB_ENCRYPT`                  | Encrypt the connection                                                             | `true`   |
| `DB_TRUST_SERVER_CERTIFICATE` | Accept a self-signed certificate. Use `true` only for a trusted local/class server | `false`  |

`.env` is in `.gitignore`. Never commit real credentials.

### 3. Install and run

```bash
npm install
```

```bash
npm start
```

Open <http://localhost:3000>. The server listens on `127.0.0.1` only. To check the database connection, visit <http://localhost:3000/api/health>.

For development, `npm run dev` restarts the server whenever a file changes.

## Database schema

| Table                             | Purpose                                                |
| --------------------------------- | ------------------------------------------------------ |
| `Media`                           | Shared fields for every title (type, genre, and so on) |
| `Book`, `Movie`, `Show`           | Type-specific details for each media item              |
| `MediaType`, `Genre`, `MPARating` | Lookup tables                                          |
| `Author`, `Producer`, `Publisher` | People and companies linked to media                   |
| `Users`, `Review`                 | App users and their reviews                            |

See `sql/Tables.sql` for the columns, keys, and constraints.

## API overview

All endpoints are under `/api`. Write requests (`POST`, `PUT`, `DELETE`) must send JSON.

| Method           | Endpoint                                                           | Description                          |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------ |
| GET              | `/health`                                                          | Database connection check            |
| GET              | `/genres`, `/lookups`                                              | Lists for filters and form dropdowns |
| GET              | `/media`                                                           | Search and list media                |
| GET              | `/media/:id`                                                       | Media details                        |
| POST / PUT       | `/media`, `/media/:id`                                             | Add or edit media                    |
| GET / POST       | `/media/:id/reviews`                                               | List or add reviews                  |
| PUT / DELETE     | `/media/:id/reviews/:reviewId`                                     | Edit or delete a review              |
| GET / POST / PUT | `/users`, `/authors`, `/producers`, `/publishers` (`/:id` for PUT) | Manage records                       |
| GET              | `/reports/top-shows?year=`                                         | Top 10 rated shows                   |
| GET              | `/reports/active-users?minimumReviews=`                            | Most active users                    |
| GET              | `/reports/box-office?genre=`                                       | Average revenue by rating            |
| GET              | `/reports/successful-person?personType=author\|producer`           | Most successful person               |
| GET              | `/reports/favorite-genre?userId=`                                  | A user's favorite genre              |

## Testing

```bash
npm test
```

The default tests start a temporary server with a **fake database**, so they don't need SQL Server and don't change any data.

To also run the end-to-end test against the real database in `.env`:

```bash
RUN_DB_TESTS=true node --test tests/live-crud.test.js
```

This test creates temporary records and deletes only the records it created.

## Troubleshooting

| Message                                 | Likely cause                                                                                       |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| *Database connection is not configured* | `.env` is missing, or a required `DB_*` value is blank                                             |
| *Unable to load database data*          | The server can't be reached, the credentials are wrong, or `Procedures.sql` hasn't been run        |
| Certificate or TLS errors               | For a local or class server with a self-signed certificate, set `DB_TRUST_SERVER_CERTIFICATE=true` |
