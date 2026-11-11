
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
