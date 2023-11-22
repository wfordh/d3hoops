import frontend.database as _db
import frontend.models as _models
import frontend.schemas as _schemas

def get_db():
	db = _db.SessionLocal()
	try:
		yield db
	finally:
		db.close()


def get_team_game_box(game_id: int, team_id: int, db: "Session"):
	# might not be how to do that typing anymore
	# why the first?
	team_game_box = db.query(_models.TeamSingleGameBox).filter(_models.TeamSingleGameBox.game_id == game_id, _models.TeamSingleGameBox.team_id == team_id).first()
	return team_game_box


def get_all_teams_season_rollup(season: int, db: "Session"):
	"""Naming? Split these up into multiple files?
	"""
	season_rollup = db.query(_models.SeasonTeamsRollup).filter(_models.SeasonTeamsRollup.season == season).all()
	return season_rollup