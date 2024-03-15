-- need to add minutes played
WITH

games AS (
    SELECT *
    FROM {{ ref('stg_games') }}
),

player_game_box_scores AS (
    SELECT *
    FROM {{ ref('stg_box_players' ) }}
),

teams AS (
    SELECT *
    FROM {{ ref('stg_teams') }}
),

player_season_box_rollup AS (
    SELECT
        g.season,
        pgbs.team_id,
        pgbs.first_name || ' ' || pgbs.last_name AS player_name,
        pgbs.position,
        count(DISTINCT pgbs.game_id) AS num_games,
        sum(pgbs.fgm) AS season_fgm,
        sum(pgbs.fga) AS season_fga,
        1.0 * sum(pgbs.fgm) / nullif(sum(pgbs.fga), 0) AS fg_pct,
        sum(pgbs.fg2m) AS season_fg2m,
        sum(pgbs.fg2a) AS season_fg2a,
        1.0 * sum(pgbs.fg2m) / nullif(sum(pgbs.fg2a), 0) AS fg2_pct,
        sum(pgbs.fg3m) AS season_fg3m,
        sum(pgbs.fg3a) AS season_fg3a,
        1.0 * sum(pgbs.fg3m) / nullif(sum(pgbs.fg3a), 0) AS fg3_pct,
        sum(pgbs.ftm) AS season_ftm,
        sum(pgbs.fta) AS season_fta,
        1.0 * sum(pgbs.ftm) / nullif(sum(pgbs.fta), 0) AS ft_pct,
        sum(pgbs.rebs) AS season_rebs,
        sum(pgbs.o_rebs) AS season_o_rebs,
        sum(pgbs.d_rebs) AS season_d_rebs,
        sum(pgbs.assists) AS season_assists,
        sum(pgbs.tovs) AS season_tovs,
        sum(pgbs.assists) / nullif(sum(tovs), 0) AS season_ast_tov_ratio,
        sum(pgbs.fouls) AS season_fouls,
        sum(pgbs.steals) AS season_steals,
        sum(pgbs.blocks) AS season_blocks,
        sum(pgbs.points) AS season_points,
        sum(pgbs.num_possessions) AS season_num_possessions,
        100.0 * sum(pgbs.points) / nullif(sum(pgbs.num_possessions), 0) AS season_o_rtg
    FROM games AS g
    LEFT JOIN player_game_box_scores AS pgbs ON g.game_id = pgbs.game_id
    GROUP BY
        g.season,
        pgbs.team_id,
        pgbs.first_name,
        pgbs.last_name,
        pgbs.position
)

SELECT
    teams.team_name,
    rollup.player_name,
    rollup.position,
    rollup.season,
    rollup.team_id,
    rollup.num_games,
    rollup.season_fgm,
    rollup.season_fga,
    rollup.fg_pct,
    rollup.season_fg2m,
    rollup.season_fg2a,
    rollup.fg2_pct,
    rollup.season_fg3m,
    rollup.season_fg3a,
    rollup.fg3_pct,
    rollup.season_ftm,
    rollup.season_fta,
    rollup.ft_pct,
    rollup.season_rebs,
    rollup.season_o_rebs,
    rollup.season_d_rebs,
    rollup.season_assists,
    rollup.season_tovs,
    rollup.season_ast_tov_ratio,
    rollup.season_fouls,
    rollup.season_steals,
    rollup.season_blocks,
    rollup.season_points,
    rollup.season_num_possessions,
    rollup.season_o_rtg
FROM player_season_box_rollup AS rollup
-- inner? is this the right order for the join?
INNER JOIN teams ON rollup.team_id = teams.team_id
