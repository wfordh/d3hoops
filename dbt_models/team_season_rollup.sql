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

team_season_box_rollup as (
	select
		g.season,
		tgbs.team_id,
		count(distinct tgbs.game_id) as num_games,
		sum(tgbs.fgm) as season_fgm,
		sum(tgbs.fga) as season_fga,
		1.0*sum(tgbs.fgm) / sum(tgbs.fga) as fg_pct,
		sum(tgbs.fg2m) as season_fg2m,
		sum(tgbs.fg2a) as season_fg2a,
		1.0*sum(tgbs.fg2m) / sum(tgbs.fg2a) as fg2_pct,
		sum(tgbs.fg3m) as season_fg3m,
		sum(tgbs.fg3a) as season_fg3a,
		1.0*sum(tgbs.fg3m) / sum(tgbs.fg3a) as fg3_pct,
		sum(tgbs.ftm) as season_ftm,
		sum(tgbs.fta) as season_fta,
		1.0*sum(tgbs.ftm) / sum(tgbs.fta) as ft_pct,
		sum(tgbs.rebs) as season_rebs,
		sum(tgbs.o_rebs) as season_o_rebs,
		sum(tgbs.d_rebs) as season_d_rebs,
		sum(tgbs.assists) as season_assists,
		sum(tgbs.tovs) as season_tovs,
		sum(tgbs.assists) / sum(tovs) as season_ast_tov_ratio,
		sum(tgbs.fouls) as season_fouls,
		sum(tgbs.blocks) as season_blocks,
		sum(tgbs.points) as season_points,
		sum(tgbs.num_possessions) as season_num_possessions,
		sum(tgbs.points) / sum(tgbs.num_possessions) as season_o_rtg
	from games g
	left join team_game_box_scores tgbs on tgbs.game_id = g.game_id
	group by
		g.season,
		tgbs.team_id
),

team_season_rollup_with_names as (
	select
		teams.team_name,
		rollup.*
	from team_season_box_rollup rollup
	-- inner? is this the right order for the join?
	inner join teams on teams.team_id = team_season_box_rollup.team_id
)

select * from team_season_rollup_with_names