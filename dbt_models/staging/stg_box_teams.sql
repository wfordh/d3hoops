with team_box_scores as (
	select
		*
	from {{ source('d3hoops', 'box_teams') }}
)
select
	id,
	game_id,
	team_id,
	fgm,
	fga,
	round(fgm / fga, 2) as fg_pct,
	fg3m,
	fg3a,
	round(fg3m / fg3a, 2) as fg3_pct,
	fgm - fg3m as fg2m,
	fga - fg3a as fg2a,
    round((fgm - fg3m) / (fga - fg3a), 2) as fg2_pct,
	round((fgm + 1.5*fg3m) / fga, 2) as efg_pct,
	ftm,
	fta,
	round(ftm / fta, 2) as ft_pct,
	rebs,
	o_rebs,
	rebs - o_rebs as d_rebs,
	assists,
	tovs,
	round(assists / tovs, 2) as ast_tov_ratio,
	fouls,
	blocks,
	points,
	fga + tovs + 0.44*fta - o_rebs as n_poss
	points / (fga + tovs + 0.44*fta - o_rebs) as o_rtg
from team_box_scores
