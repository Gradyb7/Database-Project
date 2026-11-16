
-- Query 1: Top 10 Rated Shows by Year
-- Shows the 10 highest-rated shows released in a given year,
-- Only includes shows within @Year (parameter).

CREATE OR ALTER PROCEDURE Top10RatedShows
    @Year INT
AS
BEGIN
    SELECT TOP 10
        M.MediaID,
        M.Title,
        AVG(CAST(R.Score AS DECIMAL(5,2))) AS AverageReviewScore,
        COUNT(R.ReviewID) AS TotalReviews,
        M.Platform,
        S.SeasonCount,
        G.GenreName AS Genre,
        RANK() OVER (
            ORDER BY AVG(CAST(R.Score AS DECIMAL(5,2))) DESC
        ) AS RatingRank
    FROM Media M
        INNER JOIN [Show] S ON M.MediaID = S.MediaID
        INNER JOIN Genre G ON M.GenreID = G.GenreID
        INNER JOIN Review R ON M.MediaID = R.MediaID
    WHERE YEAR(M.CreationDate) = @Year
    GROUP BY
        M.MediaID,
        M.Title,
        M.Platform,
        S.SeasonCount,
        G.GenreName
    ORDER BY
        AverageReviewScore DESC,
        TotalReviews DESC,
        M.MediaID
END;

GO

-- Query 2: Most Active Users
-- Shows users ranked by the number of reviews they submitted.
-- Only includes users with at least @MinimumReviews reviews.

CREATE OR ALTER PROCEDURE MostActiveUsers
    @MinimumReviews INT
AS
BEGIN
    SELECT
        U.UserID,
        U.UserName,
        COUNT(R.ReviewID) AS TotalReviews,
        RANK() OVER ( ORDER BY COUNT(R.ReviewID) DESC ) AS ActivityRank
    FROM Users U
    INNER JOIN Review R
        ON U.UserID = R.UserID
    GROUP BY
        U.UserID,
        U.UserName
    HAVING COUNT(R.ReviewID) >= @MinimumReviews
    ORDER BY ActivityRank;
END;

GO

-- Query 3: Average Box Office Revenue
-- Shows the average box office revenue made per MPA rating in a certain genre.
-- Only includes movies in @Genre.

CREATE OR ALTER PROCEDURE AverageRevenuePerGenreByRating
	@Genre NVARCHAR(50)

AS
BEGIN
	SELECT 
		R.Rating,
		AVG(M.BoxOfficeRevenue) AS AverageRevenue
	FROM
		Movie M
		INNER JOIN Media ME ON M.MediaID = ME.MediaID
		INNER JOIN Genre G ON ME.GenreID = G.GenreID
		INNER JOIN MPARating R ON R.MPAID = M.MPAID
	WHERE
		G.GenreName = @Genre
	GROUP BY
		R.MPAID, R.Rating;
END;

GO


-- Query 4: Most Successful Author or Producer
-- Shows authors ranked by total copies sold or producers ranked by total box office revenue.
-- Uses @PersonType ('author' or 'producer') to select which people to rank.
-- People with equal sales totals receive the same rank.

CREATE OR ALTER PROCEDURE MostSuccessfulPerson
    @PersonType NVARCHAR(20)
AS
BEGIN

    SET @PersonType = LOWER(LTRIM(RTRIM(@PersonType)));

    IF @PersonType = 'author'
    BEGIN
        SELECT
            A.AuthorID AS PersonID,
            A.FirstName,
            A.LastName,
            SUM(B.CopiesSold) AS TotalCopiesSold,
            CAST(NULL AS DECIMAL(38, 2)) AS TotalBoxOfficeSales,
            RANK() OVER (
                ORDER BY SUM(B.CopiesSold) DESC
            ) AS SalesRank
        FROM Author A
        INNER JOIN Book B ON B.AuthorID = A.AuthorID
        GROUP BY
            A.AuthorID,
            A.FirstName,
            A.LastName
        ORDER BY SalesRank, PersonID;
    END;
    ELSE
    BEGIN
        SELECT
            P.ProducerID AS PersonID,
            P.FirstName,
            P.LastName,
            CAST(NULL AS BIGINT) AS TotalCopiesSold,
            SUM(M.BoxOfficeRevenue) AS TotalBoxOfficeSales,
            RANK() OVER (
                ORDER BY SUM(M.BoxOfficeRevenue) DESC
            ) AS SalesRank
        FROM Producer P
        INNER JOIN Movie M ON M.ProducerID = P.ProducerID
        GROUP BY
            P.ProducerID,
            P.FirstName,
            P.LastName
        ORDER BY SalesRank, PersonID;
    END;
END;
GO

-- Query 5: A User's Favorite Genre
-- Shows the genre with the highest average review rating for @UserID.
-- Only includes genres the user has reviewed.
-- Returns all genres tied for the highest average rating.

CREATE OR ALTER PROCEDURE UsersFavoriteGenre
    @UserID INT
AS
BEGIN
    SELECT TOP 1 WITH TIES
        U.UserID,
        U.UserName AS Username,
        G.GenreID,
        G.GenreName,
        AVG(R.Score) AS AverageRating,
        Count(*) AS TotalReviews

    FROM Review R
    INNER JOIN Media M
        ON M.MediaID = R.MediaID
    INNER JOIN Genre G
        ON G.GenreID = M.GenreID
    INNER JOIN Users U
        ON U.UserID = R.UserID
    WHERE U.UserID = @UserID
    GROUP BY
        U.UserID,
        U.UserName,
        G.GenreID,
        G.GenreName
    ORDER BY AverageRating DESC;
END;
GO
