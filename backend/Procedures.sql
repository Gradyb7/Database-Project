
-- Query 1: Most Active Users
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

-- Test MostActiveUsers
EXEC MostActiveUsers @MinimumReviews = 3;
