with teams as (
	select
		*
	from {{ ref('d3hoops', 'teams') }}
)
select
	team_id,
	team_name,
	nickname,
	team_abbrev
from teams