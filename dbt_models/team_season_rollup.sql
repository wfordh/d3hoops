with 

games as (
	select
		*
	from {{ ref('stg_games') }}
),

team_game_box_scores as (
	select
		*
	from {{ ref('stg_box_teams' )}}
),

teams as (
	select
		*
	from {{ ref('stg_teams') }}
),

team_opponent_box_scores as (
	select
		team_box_scores.*,
		opponent_box_scores.team_id as opponent_team_id,
		opponent_box_scores.fgm as opponent_fgm,
		opponent_box_scores.fga as opponent_fga,
		opponent_box_scores.fg_pct as opponent_fg_pct,
		opponent_box_scores.fg3m as opponent_fg3m,
		opponent_box_scores.fg3a as opponent_fg3a,
		opponent_box_scores.fg3_pct as opponent_fg3_pct,
		opponent_box_scores.fg2m as opponent_fg2m,
		opponent_box_scores.fg2a as opponent_fg2a,
		opponent_box_scores.ftm as opponent_ftm,
		opponent_box_scores.fta as opponent_fta,
		opponent_box_scores.rebs as opponent_rebs,
		opponent_box_scores.o_rebs as opponent_o_rebs,
		opponent_box_scores.d_rebs as opponent_d_rebs,
		opponent_box_scores.assists as opponent_assists,
		opponent_box_scores.tovs as opponent_tovs,
		opponent_box_scores.assists / opponent_box_scores.tovs as opponent_ast_tov_ratio,
		opponent_box_scores.fouls as opponent_fouls,
		opponent_box_scores.blocks as opponent_blocks,
		opponent_box_scores.points as opponent_points,
		opponent_box_scores.fga + opponent_box_scores.tovs + 0.44*opponent_box_scores.fta - opponent_box_scores.o_rebs as opponent_num_possessions,
		opponent_box_scores.points / (opponent_box_scores.fga + opponent_box_scores.tovs + 0.44*opponent_box_scores.fta - opponent_box_scores.o_rebs) as opponent_o_rtg,
		team_box_scores.points - opponent_box_scores.points as margin_of_victory
	from team_game_box_scores team_box_scores
	inner join team_game_box_scores opponent_box_scores on 
		team_box_scores.game_id = opponent_box_scores.game_id
		and team_box_scores.team_id <> opponent_box_scores.team_id
),

team_season_box_rollup as (
	select
		g.season,
		tobs.team_id,
		count(distinct tobs.game_id) as num_games,
		sum(tobs.fgm) as season_fgm,
		sum(tobs.fga) as season_fga,
		1.0*sum(tobs.fgm) / sum(tobs.fga) as fg_pct,
		sum(tobs.fg2m) as season_fg2m,
		sum(tobs.fg2a) as season_fg2a,
		1.0*sum(tobs.fg2m) / sum(tobs.fg2a) as fg2_pct,
		sum(tobs.fg3m) as season_fg3m,
		sum(tobs.fg3a) as season_fg3a,
		1.0*sum(tobs.fg3m) / sum(tobs.fg3a) as fg3_pct,
		sum(tobs.ftm) as season_ftm,
		sum(tobs.fta) as season_fta,
		1.0*sum(tobs.ftm) / sum(tobs.fta) as ft_pct,
		sum(tobs.rebs) as season_rebs,
		sum(tobs.o_rebs) as season_o_rebs,
		sum(tobs.d_rebs) as season_d_rebs,
		sum(tobs.assists) as season_assists,
		sum(tobs.tovs) as season_tovs,
		sum(tobs.assists) / sum(tovs) as season_ast_tov_ratio,
		sum(tobs.fouls) as season_fouls,
		sum(tobs.blocks) as season_blocks,
		sum(tobs.points) as season_points,
		sum(tobs.num_possessions) as season_num_possessions,
		100.0*sum(tobs.points) / sum(tobs.num_possessions) as season_o_rtg,
		sum(tobs.opponent_fgm) as opponent_season_fgm,
		sum(tobs.opponent_fga) as opponent_season_fga,
		1.0*sum(tobs.opponent_fgm) / sum(tobs.opponent_fga) as opponent_fg_pct,
		sum(tobs.opponent_fg2m) as opponent_season_fg2m,
		sum(tobs.opponent_fg2a) as opponent_season_fg2a,
		1.0*sum(tobs.opponent_fg2m) / sum(tobs.opponent_fg2a) as opponent_fg2_pct,
		sum(tobs.opponent_fg3m) as opponent_season_fg3m,
		sum(tobs.opponent_fg3a) as opponent_season_fg3a,
		1.0*sum(tobs.opponent_fg3m) / sum(tobs.opponent_fg3a) as opponent_fg3_pct,
		sum(tobs.opponent_ftm) as opponent_season_ftm,
		sum(tobs.opponent_fta) as opponent_season_fta,
		1.0*sum(tobs.opponent_ftm) / sum(tobs.opponent_fta) as opponent_ft_pct,
		sum(tobs.opponent_rebs) as opponent_season_rebs,
		sum(tobs.opponent_o_rebs) as opponent_season_o_rebs,
		sum(tobs.opponent_d_rebs) as opponent_season_d_rebs,
		sum(tobs.opponent_assists) as opponent_season_assists,
		sum(tobs.opponent_tovs) as opponent_season_tovs,
		sum(tobs.opponent_assists) / sum(tovs) as opponent_season_ast_tov_ratio,
		sum(tobs.opponent_fouls) as opponent_season_fouls,
		sum(tobs.opponent_blocks) as opponent_season_blocks,
		sum(tobs.opponent_points) as opponent_season_points,
		sum(tobs.opponent_num_possessions) as opponent_season_num_possessions,
		100.0*sum(tobs.opponent_points) / sum(tobs.num_possessions) as opponent_season_o_rtg,
		avg(margin_of_victory) as season_margin_of_victory
	from games g
	left join team_opponent_box_scores tobs on tobs.game_id = g.game_id
	group by
		g.season,
		tobs.team_id
),

team_season_rollup_with_names as (
	select
		teams.team_name,
		rollup.*
	from team_season_box_rollup rollup
	-- inner? is this the right order for the join?
	inner join teams on teams.team_id = rollup.team_id
)

select * from team_season_rollup_with_names