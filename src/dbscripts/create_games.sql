-- psql -f src/dbscripts/create_games.sql -d d3hoops -U fordhiggins
drop table if exists games_testtest;
create table games_testtest (
	game_id int PRIMARY KEY
	, team_zero_id int
	, team_one_id int
	, is_team_zero_home bool
	, game_date date
	, created_at timestamp
)