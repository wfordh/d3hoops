import datetime as dt
import sqlalchemy as _sql

import frontend.database as _db

class TeamSingleGameBox(_db.Base):
	"""docstring for team_single_game_box"""
	__tablename__ = "box_teams" 
	__table_args__ = {"schema": "dbt_ford"}
	game_id = _sql.Column(_sql.Integer, primary_key=True) # skip pk and index for now - psych, need it
	team_id = _sql.Column(_sql.Integer, primary_key=True)
	fgm = _sql.Column(_sql.Integer)
	fga = _sql.Column(_sql.Integer)
	fg_pct = _sql.Column(_sql.Float)
	fg3m = _sql.Column(_sql.Integer)
	fg3a = _sql.Column(_sql.Integer)
	fg3_pct = _sql.Column(_sql.Float)
	fg2m = _sql.Column(_sql.Integer)
	fg2a = _sql.Column(_sql.Integer)
	fg2_pct = _sql.Column(_sql.Float)
	efg_pct = _sql.Column(_sql.Float)
	ftm = _sql.Column(_sql.Integer)
	fta = _sql.Column(_sql.Integer)
	ft_pct = _sql.Column(_sql.Float)
	rebs = _sql.Column(_sql.Integer)
	o_rebs = _sql.Column(_sql.Integer)
	d_rebs = _sql.Column(_sql.Integer)
	assists = _sql.Column(_sql.Integer)
	tovs = _sql.Column(_sql.Integer)
	ast_tov_ratio = _sql.Column(_sql.Float)
	fouls = _sql.Column(_sql.Integer)
	blocks = _sql.Column(_sql.Integer)
	points = _sql.Column(_sql.Integer)


class SeasonTeamsRollup(_db.Base):
	"""docstring for SeasonTeamsRollup

	things to add here or in dbt:
		- rebound pct
		- tov pct
		- ast / fgm
	"""
	__tablename__ = "team_season_rollup"
	__table_args__ = {"schema": "dbt_ford"}
	season = _sql.Column(_sql.Integer, primary_key=True)
	team_id = _sql.Column(_sql.Integer, primary_key=True)
	team_name = _sql.Column(_sql.String)
	num_games = _sql.Column(_sql.Integer)
	season_fgm = _sql.Column(_sql.Integer)
	season_fga = _sql.Column(_sql.Integer)
	fg_pct = _sql.Column(_sql.Float)
	season_fg2m = _sql.Column(_sql.Integer)
	season_fg2a = _sql.Column(_sql.Integer)
	fg2_pct = _sql.Column(_sql.Float)
	season_fg3m = _sql.Column(_sql.Integer)
	season_fg3a = _sql.Column(_sql.Integer)
	fg3_pct = _sql.Column(_sql.Float)
	season_ftm = _sql.Column(_sql.Integer)
	season_fta = _sql.Column(_sql.Integer)
	ft_pct = _sql.Column(_sql.Float)
	season_rebs = _sql.Column(_sql.Integer)
	season_o_rebs = _sql.Column(_sql.Integer)
	season_d_rebs = _sql.Column(_sql.Integer)
	season_assists = _sql.Column(_sql.Integer)
	season_tovs = _sql.Column(_sql.Integer)
	season_ast_tov_ratio = _sql.Column(_sql.Float)
	season_fouls = _sql.Column(_sql.Integer)
	season_blocks = _sql.Column(_sql.Integer)
	season_points = _sql.Column(_sql.Integer)
	season_num_possessions = _sql.Column(_sql.Float)
	season_o_rtg = _sql.Column(_sql.Float)
	opponent_season_fgm = _sql.Column(_sql.Integer)
	opponent_season_fga = _sql.Column(_sql.Integer)
	opponent_fg_pct = _sql.Column(_sql.Float)
	opponent_season_fg2m = _sql.Column(_sql.Integer)
	opponent_season_fg2a = _sql.Column(_sql.Integer)
	opponent_fg2_pct = _sql.Column(_sql.Float)
	opponent_season_fg3m = _sql.Column(_sql.Integer)
	opponent_season_fg3a = _sql.Column(_sql.Integer)
	opponent_fg3_pct = _sql.Column(_sql.Float)
	opponent_season_ftm = _sql.Column(_sql.Integer)
	opponent_season_fta = _sql.Column(_sql.Integer)
	opponent_ft_pct = _sql.Column(_sql.Float)
	opponent_season_rebs = _sql.Column(_sql.Integer)
	opponent_season_o_rebs = _sql.Column(_sql.Integer)
	opponent_season_d_rebs = _sql.Column(_sql.Integer)
	opponent_season_assists = _sql.Column(_sql.Integer)
	opponent_season_tovs = _sql.Column(_sql.Integer)
	opponent_season_ast_tov_ratio = _sql.Column(_sql.Float)
	opponent_season_fouls = _sql.Column(_sql.Integer)
	opponent_season_blocks = _sql.Column(_sql.Integer)
	opponent_season_points = _sql.Column(_sql.Integer)
	opponent_season_num_possessions = _sql.Column(_sql.Float)
	opponent_season_o_rtg = _sql.Column(_sql.Float)
	season_margin_of_victory = _sql.Column(_sql.Float)
