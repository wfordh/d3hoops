WITH

games AS (
    SELECT *
    FROM {{ ref('stg_games') }}
),

team_game_box_scores AS (
    SELECT *
    FROM {{ ref('stg_box_teams' ) }}
),

teams AS (
    SELECT *
    FROM {{ ref('stg_teams') }}
)

SELECT
    g.season,
    g.game_id,
    g.game_date,
    team_box_scores.team_id AS team_id,
    CASE
        WHEN team_box_scores.team_id = g.team_zero_id
            THEN g.team_one_conference
        ELSE g.team_zero_conference
    END AS team_conference,
    team_box_scores.fgm AS team_fgm,
    team_box_scores.fga AS team_fga,
    team_box_scores.fg_pct AS team_fg_pct,
    team_box_scores.fg3m AS team_fg3m,
    team_box_scores.fg3a AS team_fg3a,
    team_box_scores.fg3_pct AS team_fg3_pct,
    team_box_scores.fg2m AS team_fg2m,
    team_box_scores.fg2a AS team_fg2a,
    team_box_scores.fg2m / team_box_scores.fg2a AS team_fg2_pct,
    team_box_scores.ftm AS team_ftm,
    team_box_scores.fta AS team_fta,
    team_box_scores.ftm / team_box_scores.fta AS team_ft_pct,
    team_box_scores.rebs AS team_rebs,
    team_box_scores.o_rebs AS team_o_rebs,
    team_box_scores.d_rebs AS team_d_rebs,
    team_box_scores.assists AS team_assists,
    team_box_scores.tovs AS team_tovs,
    team_box_scores.assists / team_box_scores.tovs AS team_ast_tov_ratio,
    team_box_scores.fouls AS team_fouls,
    team_box_scores.steals AS team_steals,
    team_box_scores.blocks AS team_blocks,
    team_box_scores.points AS team_points,
    team_box_scores.fga
    + team_box_scores.tovs
    + 0.44 * team_box_scores.fta
    - team_box_scores.o_rebs AS team_num_possessions,
    team_box_scores.points
    / (team_box_scores.fga + team_box_scores.tovs + 0.44 * team_box_scores.fta - team_box_scores.o_rebs) AS team_o_rtg,
    opponent_box_scores.team_id AS opponent_team_id,
    CASE
        WHEN opponent_box_scores.team_id = g.team_zero_id
            THEN g.team_one_conference
        ELSE g.team_zero_conference
    END AS opponent_conference,
    opponent_box_scores.fgm AS opponent_fgm,
    opponent_box_scores.fga AS opponent_fga,
    opponent_box_scores.fg_pct AS opponent_fg_pct,
    opponent_box_scores.fg3m AS opponent_fg3m,
    opponent_box_scores.fg3a AS opponent_fg3a,
    opponent_box_scores.fg3_pct AS opponent_fg3_pct,
    opponent_box_scores.fg2m AS opponent_fg2m,
    opponent_box_scores.fg2a AS opponent_fg2a,
    opponent_box_scores.fg2m / opponent_box_scores.fg2a AS opponent_fg2_pct,
    opponent_box_scores.ftm AS opponent_ftm,
    opponent_box_scores.fta AS opponent_fta,
    opponent_box_scores.ftm / opponent_box_scores.fta AS opponent_ft_pct,
    opponent_box_scores.rebs AS opponent_rebs,
    opponent_box_scores.o_rebs AS opponent_o_rebs,
    opponent_box_scores.d_rebs AS opponent_d_rebs,
    opponent_box_scores.assists AS opponent_assists,
    opponent_box_scores.tovs AS opponent_tovs,
    opponent_box_scores.assists / opponent_box_scores.tovs AS opponent_ast_tov_ratio,
    opponent_box_scores.fouls AS opponent_fouls,
    opponent_box_scores.steals AS opponent_steals,
    opponent_box_scores.blocks AS opponent_blocks,
    opponent_box_scores.points AS opponent_points,
    opponent_box_scores.fga
    + opponent_box_scores.tovs
    + 0.44 * opponent_box_scores.fta
    - opponent_box_scores.o_rebs AS opponent_num_possessions,
    opponent_box_scores.points
    / (
        opponent_box_scores.fga + opponent_box_scores.tovs + 0.44 * opponent_box_scores.fta - opponent_box_scores.o_rebs
    ) AS opponent_o_rtg,
    team_box_scores.points - opponent_box_scores.points AS margin_of_victory,
    g.is_conference_game
FROM games AS g
LEFT JOIN team_game_box_scores AS team_box_scores
    ON
        g.game_id = team_box_scores.game_id
LEFT JOIN team_game_box_scores AS opponent_box_scores ON
    g.game_id = opponent_box_scores.game_id
    AND team_box_scores.team_id != opponent_box_scores.team_id
