WITH teams AS (
    SELECT *
    FROM {{ source('d3hoops', 'teams') }}
)

SELECT
    team_id,
    team_name,
    nickname,
    team_abbrev
FROM teams
