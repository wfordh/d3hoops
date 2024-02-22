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
),

team_opponent_box_scores AS (
    -- turn this into it's own model? or jsut the 
    -- relevant columns for the team game schedule / results for the team page?
    -- kinda depends on how much detail / stats I want to include in it?
    -- barttorvik adds the four factors / ratings, kenpom doesn't
    SELECT *
    FROM {{ ref('team_season_games') }}
),

team_margin_of_victory AS (
    SELECT
        team_id,
        avg(margin_of_victory) AS avg_mov,
        count(DISTINCT game_id) AS num_games
    FROM team_opponent_box_scores
    GROUP BY team_id
),

team_opponent_box_scores_with_mov AS (
    SELECT
        tobs.*,
        tmov.avg_mov AS opponent_season_mov,
        tmov.num_games AS opponent_num_games
    FROM team_opponent_box_scores AS tobs
    INNER JOIN team_margin_of_victory AS tmov ON
        tobs.opponent_team_id = tmov.team_id
),

team_season_box_rollup AS (
    SELECT
        tobs_mv.season,
        tobs_mv.team_id,
        tobs_mv.team_conference,
        count(tobs_mv.game_id) AS num_games,
        count(CASE WHEN tobs_mv.team_points > tobs_mv.opponent_points THEN 1 END) AS num_wins,
        count(CASE WHEN tobs_mv.team_points < tobs_mv.opponent_points THEN 1 END) AS num_losses,
        sum(tobs_mv.team_fgm) AS season_fgm,
        sum(tobs_mv.team_fga) AS season_fga,
        1.0 * sum(tobs_mv.team_fgm) / sum(tobs_mv.team_fga) AS fg_pct,
        sum(tobs_mv.team_fg2m) AS season_fg2m,
        sum(tobs_mv.team_fg2a) AS season_fg2a,
        1.0 * sum(tobs_mv.team_fg2m) / sum(tobs_mv.team_fg2a) AS fg2_pct,
        sum(tobs_mv.team_fg3m) AS season_fg3m,
        sum(tobs_mv.team_fg3a) AS season_fg3a,
        1.0 * sum(tobs_mv.team_fg3m) / sum(tobs_mv.team_fg3a) AS fg3_pct,
        sum(tobs_mv.team_ftm) AS season_ftm,
        sum(tobs_mv.team_fta) AS season_fta,
        1.0 * sum(tobs_mv.team_ftm) / sum(tobs_mv.team_fta) AS ft_pct,
        sum(tobs_mv.team_rebs) AS season_rebs,
        sum(tobs_mv.team_o_rebs) AS season_o_rebs,
        sum(tobs_mv.team_d_rebs) AS season_d_rebs,
        sum(tobs_mv.team_assists) AS season_assists,
        sum(tobs_mv.team_tovs) AS season_tovs,
        sum(tobs_mv.team_assists) / sum(tobs_mv.team_tovs) AS season_ast_tov_ratio,
        sum(tobs_mv.team_fouls) AS season_fouls,
        sum(tobs_mv.team_steals) AS season_steals,
        sum(tobs_mv.team_blocks) AS season_blocks,
        sum(tobs_mv.team_points) AS season_points,
        sum(tobs_mv.team_num_possessions) AS season_num_possessions,
        100.0 * sum(tobs_mv.team_points) / sum(tobs_mv.team_num_possessions) AS season_o_rtg,
        sum(tobs_mv.opponent_fgm) AS opponent_season_fgm,
        sum(tobs_mv.opponent_fga) AS opponent_season_fga,
        1.0 * sum(tobs_mv.opponent_fgm) / sum(tobs_mv.opponent_fga) AS opponent_fg_pct,
        sum(tobs_mv.opponent_fg2m) AS opponent_season_fg2m,
        sum(tobs_mv.opponent_fg2a) AS opponent_season_fg2a,
        1.0 * sum(tobs_mv.opponent_fg2m) / sum(tobs_mv.opponent_fg2a) AS opponent_fg2_pct,
        sum(tobs_mv.opponent_fg3m) AS opponent_season_fg3m,
        sum(tobs_mv.opponent_fg3a) AS opponent_season_fg3a,
        1.0 * sum(tobs_mv.opponent_fg3m) / sum(tobs_mv.opponent_fg3a) AS opponent_fg3_pct,
        sum(tobs_mv.opponent_ftm) AS opponent_season_ftm,
        sum(tobs_mv.opponent_fta) AS opponent_season_fta,
        1.0 * sum(tobs_mv.opponent_ftm) / sum(tobs_mv.opponent_fta) AS opponent_ft_pct,
        sum(tobs_mv.opponent_rebs) AS opponent_season_rebs,
        sum(tobs_mv.opponent_o_rebs) AS opponent_season_o_rebs,
        sum(tobs_mv.opponent_d_rebs) AS opponent_season_d_rebs,
        sum(tobs_mv.opponent_assists) AS opponent_season_assists,
        sum(tobs_mv.opponent_tovs) AS opponent_season_tovs,
        sum(tobs_mv.opponent_assists) / sum(tobs_mv.opponent_tovs) AS opponent_season_ast_tov_ratio,
        sum(tobs_mv.opponent_fouls) AS opponent_season_fouls,
        sum(tobs_mv.opponent_steals) AS opponent_season_steals,
        sum(tobs_mv.opponent_blocks) AS opponent_season_blocks,
        sum(tobs_mv.opponent_points) AS opponent_season_points,
        sum(tobs_mv.opponent_num_possessions) AS opponent_season_num_possessions,
        100.0 * sum(tobs_mv.opponent_points) / sum(tobs_mv.opponent_num_possessions) AS opponent_season_o_rtg,
        avg(margin_of_victory) AS season_margin_of_victory,
        sum(tobs_mv.opponent_season_mov * tobs_mv.opponent_num_games)
        / sum(tobs_mv.opponent_num_games) AS strength_of_schedule
    FROM team_opponent_box_scores_with_mov AS tobs_mv
    GROUP BY
        tobs_mv.season,
        tobs_mv.team_id,
        tobs_mv.team_conference
)

SELECT
    teams.team_name,
    rollup.season,
    rollup.team_id,
    rollup.team_conference,
    rollup.num_games,
    rollup.num_wins,
    rollup.num_losses,
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
    100.0 * (rollup.season_fg2m + 1.5 * rollup.season_fg3m) / rollup.season_fga AS efg_pct,
    rollup.season_rebs,
    rollup.season_o_rebs,
    rollup.season_d_rebs,
    100.0 * rollup.season_o_rebs / (rollup.season_o_rebs + rollup.opponent_season_d_rebs) AS o_reb_pct,
    rollup.season_assists,
    rollup.season_tovs,
    rollup.season_ast_tov_ratio,
    rollup.season_fouls,
    rollup.season_steals,
    rollup.season_blocks,
    rollup.season_points,
    rollup.season_num_possessions,
    rollup.season_o_rtg,
    rollup.opponent_season_fgm,
    rollup.opponent_season_fga,
    rollup.opponent_fg_pct,
    rollup.opponent_season_fg2m,
    rollup.opponent_season_fg2a,
    rollup.opponent_fg2_pct,
    rollup.opponent_season_fg3m,
    rollup.opponent_season_fg3a,
    rollup.opponent_fg3_pct,
    rollup.opponent_season_ftm,
    rollup.opponent_season_fta,
    rollup.opponent_ft_pct,
    rollup.opponent_season_rebs,
    rollup.opponent_season_o_rebs,
    rollup.opponent_season_d_rebs,
    rollup.opponent_season_assists,
    rollup.opponent_season_tovs,
    rollup.opponent_season_ast_tov_ratio,
    rollup.opponent_season_fouls,
    rollup.opponent_season_steals,
    rollup.opponent_season_blocks,
    rollup.opponent_season_points,
    rollup.opponent_season_num_possessions,
    rollup.opponent_season_o_rtg,
    rollup.season_margin_of_victory,
    rollup.strength_of_schedule,
    rollup.season_margin_of_victory + rollup.strength_of_schedule AS simple_rating_system
FROM
    teams
-- team_season_box_rollup rollup
-- inner? is this the right order for the join?
INNER JOIN
    team_season_box_rollup AS rollup
    -- teams 
    ON teams.team_id = rollup.team_id
