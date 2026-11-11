-- CIS 560 Group Project
-- Group 3
-- Media Tracking Application
-- Inserts.sql

-- Run after Tables.sql. Tables load parents first.
-- IDs are inserted explicitly so foreign keys line up.

-- MediaType
SET IDENTITY_INSERT MediaType ON;
INSERT INTO MediaType (MediaTypeID, TypeName)
VALUES
    (1, N'Show'),
    (2, N'Movie'),
    (3, N'Book');
SET IDENTITY_INSERT MediaType OFF;

-- Genre
SET IDENTITY_INSERT Genre ON;
INSERT INTO Genre (GenreID, GenreName)
VALUES
    (1, N'Drama'),
    (2, N'Crime'),
    (3, N'Science Fiction'),
    (4, N'Fantasy'),
    (5, N'Comedy'),
    (6, N'Thriller'),
    (7, N'Romance'),
    (8, N'Horror'),
    (9, N'Animation'),
    (10, N'Action'),
    (11, N'Mystery');
SET IDENTITY_INSERT Genre OFF;

-- Users
SET IDENTITY_INSERT Users ON;
INSERT INTO Users (UserID, UserName)
VALUES
    (1, N'cinephile_maya'),
    (2, N'bookworm_ben'),
    (3, N'nightowl_noor'),
    (4, N'popcorn_pete'),
    (5, N'pagesandplots'),
    (6, N'binge_bianca'),
    (7, N'reel_rafael'),
    (8, N'quietreader_kim'),
    (9, N'couchcritic_dev'),
    (10, N'storyhunter_ana'),
    (11, N'film_fan_tomas'),
    (12, N'sofa_scholar_lee'),
    (13, N'plotwist_priya'),
    (14, N'marathon_marcus'),
    (15, N'chapter_chloe');
SET IDENTITY_INSERT Users OFF;

-- Author
SET IDENTITY_INSERT Author ON;
INSERT INTO Author (AuthorID, FirstName, LastName, Location)
VALUES
    (1, N'J.K.', N'Rowling', N'Yate, England'),
    (2, N'Dan', N'Brown', N'Exeter, New Hampshire'),
    (3, N'F. Scott', N'Fitzgerald', N'St. Paul, Minnesota'),
    (4, N'Harper', N'Lee', N'Monroeville, Alabama'),
    (5, N'J.R.R.', N'Tolkien', N'Bloemfontein, South Africa'),
    (6, N'J.D.', N'Salinger', N'New York, New York'),
    (7, N'C.S.', N'Lewis', N'Belfast, Northern Ireland'),
    (8, N'Suzanne', N'Collins', N'Hartford, Connecticut'),
    (9, N'Stephen', N'King', N'Portland, Maine'),
    (10, N'Gillian', N'Flynn', N'Kansas City, Missouri'),
    (11, N'Agatha', N'Christie', N'Torquay, England');
SET IDENTITY_INSERT Author OFF;

-- Producer
SET IDENTITY_INSERT Producer ON;
INSERT INTO Producer (ProducerID, FirstName, LastName)
VALUES
    (1, N'Albert S.', N'Ruddy'),
    (2, N'Kathleen', N'Kennedy'),
    (3, N'Jon', N'Landau'),
    (4, N'Emma', N'Thomas'),
    (5, N'Ralph', N'Guggenheim'),
    (6, N'Jason', N'Blum'),
    (7, N'Lawrence', N'Bender'),
    (8, N'Frank', N'Marshall'),
    (9, N'Niki', N'Marvin'),
    (10, N'Graham', N'Walters'),
    (11, N'Kwak', N'Sin-ae'),
    (12, N'Bob', N'Gale'),
    (13, N'David', N'Heyman');
SET IDENTITY_INSERT Producer OFF;

-- Publisher
SET IDENTITY_INSERT Publisher ON;
INSERT INTO Publisher (PublisherID, Name, Website)
VALUES
    (1, N'Bloomsbury', N'https://www.bloomsbury.com'),
    (2, N'Doubleday', N'https://www.knopfdoubleday.com'),
    (3, N'Scribner', N'https://www.simonandschuster.com'),
    (4, N'HarperCollins', N'https://www.harpercollins.com'),
    (5, N'Little, Brown and Company', N'https://www.littlebrown.com'),
    (6, N'Scholastic', N'https://www.scholastic.com'),
    (7, N'Crown', N'https://crownpublishing.com');
SET IDENTITY_INSERT Publisher OFF;

-- MPARating
SET IDENTITY_INSERT MPARating ON;
INSERT INTO MPARating (MPAID, Rating)
VALUES
    (1, N'G'),
    (2, N'PG'),
    (3, N'PG-13'),
    (4, N'R'),
    (5, N'NC-17');
SET IDENTITY_INSERT MPARating OFF;

-- Media
SET IDENTITY_INSERT Media ON;
INSERT INTO Media (MediaID, MediaTypeID, Title, [Platform], CreationDate, GenreID)
VALUES
    (1, 1, N'Breaking Bad', N'AMC', '2008-01-20', 2),
    (2, 1, N'The Sopranos', N'HBO', '1999-01-10', 2),
    (3, 1, N'Stranger Things', N'Netflix', '2016-07-15', 3),
    (4, 1, N'Game of Thrones', N'HBO', '2011-04-17', 4),
    (5, 1, N'The Office', N'NBC', '2005-03-24', 5),
    (6, 1, N'Friends', N'NBC', '1994-09-22', 5),
    (7, 1, N'The Wire', N'HBO', '2002-06-02', 2),
    (8, 1, N'Mad Men', N'AMC', '2007-07-19', 1),
    (9, 2, N'The Godfather', N'Theatrical', '1972-03-24', 2),
    (10, 2, N'Jurassic Park', N'Theatrical', '1993-06-11', 3),
    (11, 2, N'Titanic', N'Theatrical', '1997-12-19', 7),
    (12, 2, N'The Dark Knight', N'Theatrical', '2008-07-18', 10),
    (13, 2, N'Inception', N'Theatrical', '2010-07-16', 3),
    (14, 2, N'Toy Story', N'Theatrical', '1995-11-22', 9),
    (15, 2, N'Get Out', N'Theatrical', '2017-02-24', 8),
    (16, 2, N'Pulp Fiction', N'Theatrical', '1994-10-14', 2),
    (17, 2, N'Raiders of the Lost Ark', N'Theatrical', '1981-06-12', 10),
    (18, 3, N'Harry Potter and the Philosopher''s Stone', N'Print', '1997-06-26', 4),
    (19, 3, N'Harry Potter and the Chamber of Secrets', N'Print', '1998-07-02', 4),
    (20, 3, N'The Da Vinci Code', N'Print', '2003-03-18', 6),
    (21, 3, N'The Great Gatsby', N'Print', '1925-04-10', 1),
    (22, 3, N'To Kill a Mockingbird', N'Print', '1960-07-11', 1),
    (23, 3, N'The Hobbit', N'Print', '1937-09-21', 4),
    (24, 3, N'The Catcher in the Rye', N'Print', '1951-07-16', 1),
    (25, 3, N'The Lion, the Witch and the Wardrobe', N'Print', '1950-10-16', 4),
    (26, 1, N'The Crown', N'Netflix', '2016-11-04', 1),
    (27, 1, N'Better Call Saul', N'AMC', '2015-02-08', 2),
    (28, 1, N'Seinfeld', N'NBC', '1989-07-05', 5),
    (29, 1, N'Parks and Recreation', N'NBC', '2009-04-09', 5),
    (30, 1, N'The Mandalorian', N'Disney+', '2019-11-12', 3),
    (31, 1, N'Succession', N'HBO', '2018-06-03', 1),
    (32, 2, N'The Shawshank Redemption', N'Theatrical', '1994-09-23', 1),
    (33, 2, N'Avatar', N'Theatrical', '2009-12-18', 3),
    (34, 2, N'Finding Nemo', N'Theatrical', '2003-05-30', 9),
    (35, 2, N'Parasite', N'Theatrical', '2019-05-30', 6),
    (36, 2, N'Back to the Future', N'Theatrical', '1985-07-03', 3),
    (37, 2, N'Barbie', N'Theatrical', '2023-07-21', 5),
    (38, 3, N'Harry Potter and the Prisoner of Azkaban', N'Print', '1999-07-08', 4),
    (39, 3, N'The Hunger Games', N'Print', '2008-09-14', 3),
    (40, 3, N'The Shining', N'Print', '1977-01-28', 8),
    (41, 3, N'Gone Girl', N'Print', '2012-06-05', 6),
    (42, 3, N'And Then There Were None', N'Print', '1939-11-06', 11);
SET IDENTITY_INSERT Media OFF;

-- Movie
INSERT INTO Movie (MediaID, MediaTypeID, Director, Runtime, ProducerID, Studio, MPAID, BoxOfficeRevenue)
VALUES
    (9, 2, N'Francis Ford Coppola', 175, 1, N'Paramount Pictures', 4, 250000000),
    (10, 2, N'Steven Spielberg', 127, 2, N'Universal Pictures', 3, 1058000000),
    (11, 2, N'James Cameron', 195, 3, N'Paramount Pictures / 20th Century Fox', 3, 2264000000),
    (12, 2, N'Christopher Nolan', 152, 4, N'Warner Bros. Pictures', 3, 1009000000),
    (13, 2, N'Christopher Nolan', 148, 4, N'Warner Bros. Pictures', 3, 839000000),
    (14, 2, N'John Lasseter', 81, 5, N'Pixar Animation Studios', 1, 394000000),
    (15, 2, N'Jordan Peele', 104, 6, N'Universal Pictures', 4, 255000000),
    (16, 2, N'Quentin Tarantino', 154, 7, N'Miramax', 4, 214000000),
    (17, 2, N'Steven Spielberg', 115, 8, N'Paramount Pictures', 2, 390000000),
    (32, 2, N'Frank Darabont', 142, 9, N'Columbia Pictures', 4, 73000000),
    (33, 2, N'James Cameron', 162, 3, N'20th Century Fox', 3, 2923000000),
    (34, 2, N'Andrew Stanton', 100, 10, N'Pixar Animation Studios', 1, 941000000),
    (35, 2, N'Bong Joon-ho', 132, 11, N'Barunson E&A', 4, 263000000),
    (36, 2, N'Robert Zemeckis', 116, 12, N'Universal Pictures', 2, 388000000),
    (37, 2, N'Greta Gerwig', 114, 13, N'Warner Bros. Pictures', 3, 1447000000);

-- Show
INSERT INTO [Show] (MediaID, MediaTypeID, EpisodeCount, SeasonCount)
VALUES
    (1, 1, 62, 5),
    (2, 1, 86, 6),
    (3, 1, 42, 5),
    (4, 1, 73, 8),
    (5, 1, 201, 9),
    (6, 1, 236, 10),
    (7, 1, 60, 5),
    (8, 1, 92, 7),
    (26, 1, 60, 6),
    (27, 1, 63, 6),
    (28, 1, 180, 9),
    (29, 1, 126, 7),
    (30, 1, 24, 3),
    (31, 1, 39, 4);

-- Book
INSERT INTO Book (MediaID, MediaTypeID, AuthorID, PublisherID, Description, CopiesSold)
VALUES
    (18, 3, 1, 1, N'An orphaned boy learns he is a wizard and starts school at Hogwarts.', 120000000),
    (19, 3, 1, 1, N'Harry returns to Hogwarts as students are mysteriously attacked.', 77000000),
    (20, 3, 2, 2, N'A symbologist follows a trail of clues after a murder at the Louvre.', 80000000),
    (21, 3, 3, 3, N'A wealthy, mysterious man pursues a lost love in Jazz Age New York.', 30000000),
    (22, 3, 4, 4, N'A lawyer in Depression-era Alabama defends a wrongly accused Black man.', 40000000),
    (23, 3, 5, 4, N'A home-loving hobbit joins a company of dwarves on a quest for treasure.', 100000000),
    (24, 3, 6, 5, N'A disillusioned teenager wanders New York after leaving prep school.', 65000000),
    (25, 3, 7, 4, N'Four siblings pass through a wardrobe into the frozen land of Narnia.', 85000000),
    (38, 3, 1, 1, N'Harry learns that a dangerous prisoner has escaped and may be hunting him.', 65000000),
    (39, 3, 8, 6, N'A teenager volunteers for a televised fight to the death in place of her sister.', 30000000),
    (40, 3, 9, 2, N'A writer caretaking an isolated hotel for the winter turns on his family.', 10000000),
    (41, 3, 10, 7, N'A husband becomes the prime suspect when his wife vanishes on their anniversary.', 20000000),
    (42, 3, 11, 4, N'Ten strangers lured to an island are killed off one by one.', 100000000);

-- Review
SET IDENTITY_INSERT Review ON;
INSERT INTO Review (ReviewID, MediaID, UserID, Score, ReviewText, ReviewDate)
VALUES
    (1, 17, 4, 4, N'Great characters, solid ending.', '2026-07-28'),
    (2, 3, 9, 5, N'Would happily revisit this again.', '2026-04-08'),
    (3, 1, 7, 4, N'Strong, with a few slow stretches.', '2025-07-09'),
    (4, 19, 10, 3, N'Better than expected, still uneven.', '2026-10-07'),
    (5, 8, 1, 3, N'Some good moments, some dull ones.', '2025-04-07'),
    (6, 7, 3, 5, N'Would happily revisit this again.', '2025-11-07'),
    (7, 6, 8, 4, N'Strong, with a few slow stretches.', '2025-04-03'),
    (8, 4, 6, 5, N'An all-time favorite.', '2026-09-02'),
    (9, 19, 9, 5, N'Would happily revisit this again.', '2026-04-09'),
    (10, 3, 7, 4, N'Strong, with a few slow stretches.', '2026-10-01'),
    (11, 18, 4, 5, N'An all-time favorite.', '2026-06-26'),
    (12, 25, 7, 4, N'Really enjoyed it overall.', '2025-03-02'),
    (13, 23, 9, 4, N'Really enjoyed it overall.', '2025-07-14'),
    (14, 14, 10, 5, N'Absolutely loved it.', '2026-09-07'),
    (15, 3, 3, 4, N'Really enjoyed it overall.', '2026-04-21'),
    (16, 16, 2, 5, N'Lived up to the hype and then some.', '2026-03-28'),
    (17, 11, 9, 4, N'Strong, with a few slow stretches.', '2026-06-16'),
    (18, 1, 9, 5, N'Absolutely loved it.', '2026-10-18'),
    (19, 1, 8, 3, N'Fine for a single go.', '2026-05-27'),
    (20, 3, 4, 4, N'Really enjoyed it overall.', '2025-03-29'),
    (21, 6, 6, 4, N'Great characters, solid ending.', '2025-10-12'),
    (22, 6, 10, 3, N'Better than expected, still uneven.', '2026-07-19'),
    (23, 13, 10, 4, N'Really enjoyed it overall.', '2025-09-18'),
    (24, 16, 5, 3, N'Fine for a single go.', '2025-08-24'),
    (25, 25, 8, 4, N'Well made and worth the time.', '2025-01-31'),
    (26, 15, 4, 5, N'An all-time favorite.', '2026-07-31'),
    (27, 6, 1, 4, N'Really enjoyed it overall.', '2026-02-15'),
    (28, 19, 4, 4, N'Really enjoyed it overall.', '2025-10-25'),
    (29, 17, 7, 4, N'Great characters, solid ending.', '2025-03-10'),
    (30, 18, 10, 4, N'Really enjoyed it overall.', '2025-01-01'),
    (31, 24, 7, 5, N'Absolutely loved it.', '2025-08-03'),
    (32, 11, 8, 5, N'An all-time favorite.', '2026-04-27'),
    (33, 6, 7, 4, N'Great characters, solid ending.', '2026-02-11'),
    (34, 12, 5, 4, N'Great characters, solid ending.', '2025-03-16'),
    (35, 16, 1, 5, N'Absolutely loved it.', '2025-10-04'),
    (36, 8, 2, 4, N'Well made and worth the time.', '2025-03-31'),
    (37, 21, 8, 4, N'Well made and worth the time.', '2025-12-07'),
    (38, 1, 2, 5, N'An all-time favorite.', '2026-02-24'),
    (39, 20, 5, 5, N'An all-time favorite.', '2025-05-18'),
    (40, 21, 7, 4, N'Strong, with a few slow stretches.', '2025-04-14'),
    (41, 5, 1, 5, N'An all-time favorite.', '2025-03-03'),
    (42, 18, 9, 5, N'Would happily revisit this again.', '2026-05-14'),
    (43, 24, 4, 5, N'Absolutely loved it.', '2026-07-27'),
    (44, 9, 8, 4, N'Strong, with a few slow stretches.', '2026-04-04'),
    (45, 22, 5, 3, N'Some good moments, some dull ones.', '2025-05-15'),
    (46, 26, 6, 4, N'Great characters, solid ending.', '2026-10-22'),
    (47, 26, 3, 5, N'Would happily revisit this again.', '2025-04-30'),
    (48, 27, 7, 3, N'Better than expected, still uneven.', '2026-03-07'),
    (49, 27, 11, 4, N'Strong, with a few slow stretches.', '2025-01-01'),
    (50, 28, 1, 4, N'Well made and worth the time.', '2026-08-30'),
    (51, 28, 2, 3, N'Fine for a single go.', '2025-01-21'),
    (52, 29, 14, 5, N'Absolutely loved it.', '2025-07-11'),
    (53, 29, 9, 4, N'Great characters, solid ending.', '2026-09-09'),
    (54, 30, 2, 4, N'Really enjoyed it overall.', '2025-02-13'),
    (55, 30, 6, 4, N'Strong, with a few slow stretches.', '2025-08-07'),
    (56, 31, 10, 4, N'Great characters, solid ending.', '2025-09-22'),
    (57, 31, 1, 5, N'An all-time favorite.', '2026-09-17'),
    (58, 32, 15, 4, N'Well made and worth the time.', '2025-10-31'),
    (59, 32, 9, 5, N'Would happily revisit this again.', '2025-03-17'),
    (60, 33, 4, 4, N'Really enjoyed it overall.', '2025-04-03'),
    (61, 33, 1, 4, N'Strong, with a few slow stretches.', '2026-08-20'),
    (62, 34, 2, 4, N'Strong, with a few slow stretches.', '2025-01-16'),
    (63, 34, 7, 5, N'Lived up to the hype and then some.', '2026-01-16'),
    (64, 35, 7, 3, N'Better than expected, still uneven.', '2025-05-11'),
    (65, 35, 2, 4, N'Great characters, solid ending.', '2026-08-12'),
    (66, 36, 4, 4, N'Strong, with a few slow stretches.', '2026-01-31'),
    (67, 36, 2, 4, N'Strong, with a few slow stretches.', '2026-10-05'),
    (68, 37, 9, 4, N'Strong, with a few slow stretches.', '2025-11-15'),
    (69, 37, 7, 4, N'Strong, with a few slow stretches.', '2026-09-18'),
    (70, 38, 1, 3, N'Some good moments, some dull ones.', '2025-07-14'),
    (71, 38, 14, 4, N'Strong, with a few slow stretches.', '2026-10-07'),
    (72, 39, 10, 4, N'Strong, with a few slow stretches.', '2026-02-02'),
    (73, 39, 2, 4, N'Great characters, solid ending.', '2026-09-11'),
    (74, 40, 4, 5, N'An all-time favorite.', '2026-03-08'),
    (75, 40, 11, 4, N'Really enjoyed it overall.', '2025-04-17'),
    (76, 41, 11, 5, N'An all-time favorite.', '2025-02-09'),
    (77, 41, 10, 3, N'Fine for a single go.', '2025-09-02'),
    (78, 42, 1, 4, N'Great characters, solid ending.', '2025-09-21'),
    (79, 42, 10, 5, N'Would happily revisit this again.', '2026-09-03'),
    (80, 31, 14, 5, N'Would happily revisit this again.', '2025-10-28'),
    (81, 4, 15, 4, N'Strong, with a few slow stretches.', '2025-03-12'),
    (82, 18, 2, 4, N'Strong, with a few slow stretches.', '2025-08-22'),
    (83, 4, 12, 4, N'Great characters, solid ending.', '2026-07-27'),
    (84, 11, 6, 5, N'An all-time favorite.', '2025-10-14'),
    (85, 23, 7, 3, N'Some good moments, some dull ones.', '2025-07-28'),
    (86, 33, 11, 3, N'Decent, but not memorable.', '2025-03-12'),
    (87, 12, 4, 4, N'Well made and worth the time.', '2026-02-26'),
    (88, 10, 5, 5, N'Would happily revisit this again.', '2025-09-13'),
    (89, 24, 14, 3, N'Decent, but not memorable.', '2025-02-17');
SET IDENTITY_INSERT Review OFF;

GO

-- Verify Inserts

SELECT 'MediaType' AS TableName, COUNT(*) AS TotalRows FROM MediaType
UNION ALL
SELECT 'Genre' AS TableName, COUNT(*) AS TotalRows FROM Genre
UNION ALL
SELECT 'Users' AS TableName, COUNT(*) AS TotalRows FROM Users
UNION ALL
SELECT 'Author' AS TableName, COUNT(*) AS TotalRows FROM Author
UNION ALL
SELECT 'Producer' AS TableName, COUNT(*) AS TotalRows FROM Producer
UNION ALL
SELECT 'Publisher' AS TableName, COUNT(*) AS TotalRows FROM Publisher
UNION ALL
SELECT 'MPARating' AS TableName, COUNT(*) AS TotalRows FROM MPARating
UNION ALL
SELECT 'Media' AS TableName, COUNT(*) AS TotalRows FROM Media
UNION ALL
SELECT 'Movie' AS TableName, COUNT(*) AS TotalRows FROM Movie
UNION ALL
SELECT 'Show' AS TableName, COUNT(*) AS TotalRows FROM [Show]
UNION ALL
SELECT 'Book' AS TableName, COUNT(*) AS TotalRows FROM Book
UNION ALL
SELECT 'Review' AS TableName, COUNT(*) AS TotalRows FROM Review;
