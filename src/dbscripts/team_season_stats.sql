-- Dev rollup view so stats can be used on website
-- Run from psql...need to automate
-- Inspired by https://github.com/mcbarlowe/nbadbscripts/tree/master/bash_scripts
-- Need to figure out connecting to correct db and making sure relationship exists
drop materialized view if exists team_season_stats;
create materialized view team_season_stats as
select
  team_id
  , case when
    date_part('month', game_date) >= 9 then date_part('year', game_date) + 1
    else date_part('year', game_date)
    end as season
  , count(distinct game_id) as num_games
  , sum(fgm) as fgm
  , sum(fga) as fga
  , round(fgm / fga, 2) as fg_pct
  , sum(fg2m) as fg2m
  , sum(fg2a) as fg2a
  , round(fg2m / fg2a, 2) as fg2_pct
  , sum(fg3m) as fg3m
  , sum(fg3a) as fg3a
  , round(fg3m / fg3a, 2) as fg3_pct
  , sum(ftm) as ftm
  , sum(fta) as fta
  , round(ftm / fta, 2) as ft_pct
from box_teams_testtest as bt
inner join games_testtest as g on
  g.game_id = bt.game_id and (g.t0_id = bt.team_id or g.t1_id = bt.team_id)
group by
  team_id
  , season
;

create index pgs_team on team_season_stats (team_id);
create index pgs_season on team_season_stats (season);
