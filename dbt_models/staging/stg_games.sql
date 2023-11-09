with games as (
	select
		*
	from {{ source('d3hoops', 'games') }}
)
select
	game_id, 
	team_zero_id,
	team_one_id,
	is_team_zero_home,
	game_date,
	case 
		when date_part('month', game_date) > 7 then date_part('year', game_date) + 1
		else date_part('year', game_date)
	end as season,
	created_at
from games