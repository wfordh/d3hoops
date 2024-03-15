WITH games AS (
    SELECT *
    FROM {{ source('d3hoops', 'games') }}
)

SELECT
    game_id,
    team_zero_id,
    team_zero_conference,
    team_one_id,
    team_one_conference,
    is_team_zero_home,
    game_date,
    CASE
        WHEN date_part('month', game_date) > 7 THEN date_part('year', game_date) + 1
        ELSE date_part('year', game_date)
    END AS season,
    coalesce(team_zero_conference = team_one_conference, FALSE) AS is_conference_game,
    created_at
FROM games
