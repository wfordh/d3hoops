-- Dev rollup view so stats can be used on website
-- Run from psql...need to automate
-- Inspired by https://github.com/mcbarlowe/nbadbscripts/tree/master/bash_scripts
-- Need to figure out connecting to correct db and making sure relationship exists
-- Command: psql -f dbscripts/team_season_stats.sql -d <dbname> -U <username>
drop materialized view if exists team_season_stats;
create materialized view team_season_stats as
select
  team_id
  , case when
    date_part('month', game_date) >= 9 then date_part('year', game_date) + 1
    else date_part('year', game_date)
    end as season
  , count(distinct bt.game_id) as num_games
  , sum(fgm) as season_fgm
  , sum(fga) as season_fga
  , round(sum(fgm) / sum(fga), 2) as fg_pct
--  , round(season_fgm / season_fga, 2) as fg_pct
  , sum(fg2m) as season_fg2m
  , sum(fg2a) as season_fg2a
  , round(sum(fg2m) / sum(fg2a), 2) as fg2_pct
  , sum(fg3m) as season_fg3m
  , sum(fg3a) as season_fg3a
  , round(sum(fg3m) / sum(fg3a), 2) as fg3_pct
  , sum(ftm) as season_ftm
  , sum(fta) as season_fta
  , round(sum(ftm) / sum(fta), 2) as ft_pct
from box_teams_testtest as bt
inner join games_testtest as g on
  g.game_id = bt.game_id and (g.t0_id = bt.team_id or g.t1_id = bt.team_id)
group by
  team_id
  , season
;

create index pgs_team on team_season_stats (team_id);
create index pgs_season on team_season_stats (season);
