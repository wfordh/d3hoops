drop table if exists box_players_testtest;
create table box_players_testtest (
	game_id int
	, team_id int
	, first_name text
	, last_name text
	, position varchar(2)
	, minutes_played smallint
	, fgm smallint
	, fga smallint
	, fg3m smallint
	, fg3a smallint
	, ftm smallint
	, fta smallint
	, rebs smallint
	, o_rebs smallint
	, assists smallint
	, fouls smallint
	, steals smallint
	, tovs smallint
	, blocks smallint
	, points smallint
)