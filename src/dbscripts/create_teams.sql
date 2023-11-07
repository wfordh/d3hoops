-- no need for timestamp - would like first and last seasons if possible
drop table cascade if exists teams_testtest;
create table teams_testtest (
	team_id int PRIMARY KEY
	, team_name text
	, nickname text
	, team_abbrev text
);