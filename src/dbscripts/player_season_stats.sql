-- Dev rollup view so stats can be used on website
-- Run from psql...need to automate
-- Inspired by https://github.com/mcbarlowe/nbadbscripts/tree/master/bash_scripts
-- Need to figure out connecting to correct db and making sure relationship exists
-- Command: psql -f dbscripts/player_season_stats.sql -d <dbname> -U <username>
drop materialized view if exists player_season_stats;
create materialized view player_season_stats as
select
  team_id
  , case when
    date_part('month', game_date) >= 9 then date_part('year', game_date) + 1
    else date_part('year', game_date)
    end as season
  , first_name
  , last_name
  , position
  , count(distinct bp.game_id) as num_games
  , sum(fgm) as season_fgm
  , sum(fga) as season_fga
  , round(1.0*sum(fgm) / nullif(sum(fga), 0), 3) as fg_pct
--  , round(season_fgm / season_fga, 2) as fg_pct
  , sum(fg2m) as season_fg2m
  , sum(fg2a) as season_fg2a
  , round(1.0*sum(fg2m) / nullif(sum(fg2a), 0), 3) as fg2_pct
  , sum(fg3m) as season_fg3m
  , sum(fg3a) as season_fg3a
  , round(1.0*sum(fg3m) / nullif(sum(fg3a), 0), 3) as fg3_pct
  , sum(ftm) as season_ftm
  , sum(fta) as season_fta
  , round(1.0*sum(ftm) / nullif(sum(fta), 0), 3) as ft_pct
from box_players_testtest as bp
inner join games_testtest as g on
  g.game_id = bp.game_id and (g.t0_id = bp.team_id or g.t1_id = bp.team_id)
group by
  team_id
  , season
  , first_name
  , last_name
  , position
;

create index pts_player on player_season_stats (team_id, first_name, last_name, position);
create index pts_season on player_season_stats (season);
