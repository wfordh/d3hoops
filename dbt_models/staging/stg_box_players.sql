WITH player_box_scores AS (
    SELECT *
    FROM {{ source('d3hoops', 'box_players') }}
)

SELECT
    id,
    game_id,
    team_id,
    first_name,
    last_name,
    position,
    minutes_played,
    fgm,
    fga,
    round(fgm / fga, 2) AS fg_pct,
    fg3m,
    fg3a,
    round(fg3m / fg3a, 2) AS fg3_pct,
    fgm - fg3m AS fg2m,
    fga - fg3a AS fg2a,
    round((fgm - fg3m) / (fga - fg3a), 2) AS fg2_pct,
    round((fgm + 1.5 * fg3m) / fga, 2) AS efg_pct,
    ftm,
    fta,
    round(ftm / fta, 2) AS ft_pct,
    rebs,
    o_rebs,
    rebs - o_rebs AS d_rebs,
    assists,
    tovs,
    round(assists / tovs, 2) AS ast_tov_ratio,
    fouls,
    steals,
    blocks,
    points,
    fga + tovs + 0.44 * fta - o_rebs AS num_possessions,
    points / (fga + tovs + 0.44 * fta - o_rebs) AS o_rtg
FROM player_box_scores
