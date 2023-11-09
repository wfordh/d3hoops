with teams as (
	select
		*
	from {{ source('d3hoops', 'teams') }}
)
select
	team_id,
	team_name,
	nickname,
	team_abbrev
from teams