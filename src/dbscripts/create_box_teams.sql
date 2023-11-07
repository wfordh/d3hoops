drop table if exists box_teams_testtest cascade;
create table box_teams_testtest (
	id serial PRIMARY KEY
	, game_id int
	, team_id int
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
	, created_at timestamp
);