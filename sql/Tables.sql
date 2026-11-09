
-- CIS 560 Group Project
-- Group 3
-- Media Tracking Application
-- Tables.sql

-- DROP TABLES

DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Movie;
DROP TABLE IF EXISTS [Show];
DROP TABLE IF EXISTS Book;
DROP TABLE IF EXISTS Media;
DROP TABLE IF EXISTS MediaType;
DROP TABLE IF EXISTS Genre;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Author;
DROP TABLE IF EXISTS Producer;
DROP TABLE IF EXISTS Publisher;
DROP TABLE IF EXISTS MPARating;

GO

-- CREATE TABLES
-- Create parent tables before child tables

-- MediaType
CREATE TABLE MediaType
(
    MediaTypeID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    TypeName NVARCHAR(20) NOT NULL UNIQUE
        CHECK (TypeName IN ('Movie', 'Show', 'Book'))
);

-- Genre
CREATE TABLE Genre
(
    GenreID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    GenreName NVARCHAR(50) NOT NULL UNIQUE
);

-- Users
CREATE TABLE Users
(
    UserID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    UserName NVARCHAR(50) NOT NULL UNIQUE
);

-- Author
CREATE TABLE Author
(
    AuthorID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Location NVARCHAR(100) NULL
);

-- Producer
CREATE TABLE Producer
(
    ProducerID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL
);

-- Publisher
CREATE TABLE Publisher
(
    PublisherID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Website NVARCHAR(200) NOT NULL UNIQUE
);

-- MPARating
CREATE TABLE MPARating
(
    MPAID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    Rating NVARCHAR(10) NOT NULL UNIQUE
        CHECK (Rating IN ('G', 'PG', 'PG-13', 'R', 'NC-17'))
);

-- Media
CREATE TABLE Media
(
    MediaID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    MediaTypeID INT NOT NULL
        FOREIGN KEY REFERENCES MediaType(MediaTypeID),
    Title NVARCHAR(200) NOT NULL,
    [Platform] NVARCHAR(100) NULL,
    CreationDate DATE NULL,
    GenreID INT NOT NULL
        FOREIGN KEY REFERENCES Genre(GenreID),

    UNIQUE (MediaTypeID, MediaID)
);

-- Movie
CREATE TABLE Movie
(
    MediaID INT NOT NULL PRIMARY KEY,
    MediaTypeID INT NOT NULL,
    Director NVARCHAR(100) NULL,
    Runtime INT NULL CHECK (Runtime > 0),
    ProducerID INT NOT NULL
        FOREIGN KEY REFERENCES Producer(ProducerID),
    Studio NVARCHAR(100) NULL,
    MPAID INT NOT NULL
        FOREIGN KEY REFERENCES MPARating(MPAID),
    BoxOfficeRevenue DECIMAL(18,2) NULL
        CHECK (BoxOfficeRevenue >= 0),

    FOREIGN KEY (MediaTypeID, MediaID)
        REFERENCES Media(MediaTypeID, MediaID)
);

-- Show
CREATE TABLE [Show]
(
    MediaID INT NOT NULL PRIMARY KEY,
    MediaTypeID INT NOT NULL,
    EpisodeCount INT NULL CHECK (EpisodeCount >= 0),
    SeasonCount INT NOT NULL CHECK (SeasonCount >= 0),

    FOREIGN KEY (MediaTypeID, MediaID)
        REFERENCES Media(MediaTypeID, MediaID)
);

-- Book
CREATE TABLE Book
(
    MediaID INT NOT NULL PRIMARY KEY,
    MediaTypeID INT NOT NULL,
    AuthorID INT NOT NULL
        FOREIGN KEY REFERENCES Author(AuthorID),
    PublisherID INT NOT NULL
        FOREIGN KEY REFERENCES Publisher(PublisherID),
    Description NVARCHAR(1000) NULL,
    CopiesSold INT NULL CHECK (CopiesSold >= 0),

    FOREIGN KEY (MediaTypeID, MediaID)
        REFERENCES Media(MediaTypeID, MediaID)
);

-- Review
CREATE TABLE Review
(
    ReviewID INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    MediaID INT NOT NULL
        FOREIGN KEY REFERENCES Media(MediaID),
    UserID INT NOT NULL
        FOREIGN KEY REFERENCES Users(UserID),
    Score INT NOT NULL CHECK (Score BETWEEN 1 AND 5),
    ReviewText NVARCHAR(1000) NULL,
    ReviewDate DATE NOT NULL
        DEFAULT (CAST(GETDATE() AS DATE)),

    UNIQUE (UserID, MediaID)
);

GO

-- Verify Tables

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
  AND TABLE_NAME IN
  (
      'MediaType', 'Genre', 'Users',
      'Author', 'Producer', 'Publisher',
      'MPARating', 'Media', 'Movie',
      'Show', 'Book', 'Review'
  )
ORDER BY TABLE_NAME;
