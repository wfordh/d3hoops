import frontend.database as _db
import frontend.models as _models
import frontend.schemas as _schemas

def get_db():
	db = _db.SessionLocal()
	try:
		yield db
	finally:
		db.close()


# why is session in quotes??
def get_team_game_box(game_id: int, team_id: int, db: "Session"):
	# might not be how to do that typing anymore
	# why the first?
	team_game_box = db.query(_models.TeamSingleGameBox).filter(_models.TeamSingleGameBox.game_id == game_id, _models.TeamSingleGameBox.team_id == team_id).first()
	return team_game_box


def get_all_teams_season_rollup(season: int, db: "Session"):
	"""Naming? Split these up into multiple files?
	"""
	season_rollup = db.query(
		_models.SeasonTeamsRollup
	).filter(
		_models.SeasonTeamsRollup.season == season
	).order_by(
		_models.SeasonTeamsRollup.simple_rating_system.desc()
	).all()
	return season_rollup


def get_single_team_all_season_rollup(team_id: int, db: "Session"):
	"""Naming? Split these up into multiple files?
	"""
	team_all_seasons = db.query(
		_models.SeasonTeamsRollup
	).filter(
		_models.SeasonTeamsRollup.team_id == team_id
	).order_by(
		_models.SeasonTeamsRollup.season.desc()
	).all()
	return team_all_seasons


def get_team_season_games(team_id: int, season: int, db: "Session"):
	team_season_games = db.query(
		_models.TeamSeasonGames
	).filter(
		_models.TeamSeasonGames.team_id == team_id, 
		_models.TeamSeasonGames.season == season
	).order_by(
		_models.TeamSeasonGames.game_date.asc()
	).all()
	return team_season_games

def get_single_team_single_season_rollup(team_id: int, season: int, db: "Session"):
	team_season_rollup = db.query(
		_models.SeasonTeamsRollup
	).filter(
		_models.SeasonTeamsRollup.season == season,
		_models.SeasonTeamsRollup.team_id == team_id
	).all()
	return team_season_rollup

def get_team_all_players_season_rollup(team_id: int, season: int, db: "Session"):
	team_players = db.query(
		_models.SeasonPlayerRollup
	).filter(
		_models.SeasonPlayerRollup.team_id == team_id,
		_models.SeasonPlayerRollup.season == season
	).order_by(
		_models.SeasonPlayerRollup.season_num_possessions.desc()
	).all()
	return team_players


def get_team_years(team_id: int, db: "Session"):
	team_years = db.query(
		_models.TeamSeasonGames.season, _models.TeamSeasonGames.team_id
	).filter(
		_models.TeamSeasonGames.team_id == team_id
	).distinct().order_by(
		_models.TeamSeasonGames.season.desc()
	).all()
	return team_years


def get_single_player_all_seasons(player_name: str):
	# how to get all seasons if going by name and one team / season?
	return
