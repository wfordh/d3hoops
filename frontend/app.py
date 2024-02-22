# uvicorn app:app --reload

import sqlalchemy.orm as _orm
from fastapi import FastAPI, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import frontend.services as _services

SEASON=2023
app = FastAPI()

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

templates = Jinja2Templates(directory="frontend/templates")

@app.get("/", response_class=HTMLResponse)
def root(request: Request, db: _orm.Session = Depends(_services.get_db)):
	result = _services.get_all_teams_season_rollup(season=2023, db=db)
	# result = _services.get_team_game_box(game_id = 6130869, team_id = 504, db=db)
	return templates.TemplateResponse("season.html", {"request": request, "result": result})


# currently the same as above just with a season attached, too
@app.get("/{season}", response_class=HTMLResponse)
def all_teams_season_page(request: Request, db: _orm.Session = Depends(_services.get_db), season: int = SEASON):
	result = _services.get_all_teams_season_rollup(season=season, db=db)
	# result = _services.get_team_game_box(game_id = 6130869, team_id = 504, db=db)
	return templates.TemplateResponse("season.html", {"request": request, "result": result})


@app.get("/teams/{team_id}/{season}", response_class=HTMLResponse)
def single_team_season_page(
		request: Request,
		db: _orm.Session = Depends(_services.get_db),
		team_id: int = 504,
		season: int = SEASON
	):
	# should 'games' be 'schedule'?
	team_season_games = _services.get_team_season_games(team_id=team_id, season=season, db=db)
	team_season_rollup = _services.get_single_team_single_season_rollup(team_id=team_id, season=season, db=db)
	team_players_rollup = _services.get_team_all_players_season_rollup(team_id=team_id, season=season, db=db)
	team_years = _services.get_team_years(team_id=team_id, db=db)
	result = {
		"games": team_season_games,
		"team_rollup": team_season_rollup,
		"player_rollup": team_players_rollup,
		"team_years": team_years
	}
	return templates.TemplateResponse("team_season.html", {"request": request, "result": result})


@app.get("/teams/{team_id}/all")
def single_team_history_page(request: Request, team_id: int, db: _orm.Session = Depends(_services.get_db)):
	# historical stats overview page for a single team
	result = _services.get_single_team_all_season_rollup(team_id=team_id, db=db)
	return result


@app.get("/players/")
def single_player_stats(request: Request, player_name: str):
	result = {}
	return result


@app.get("/about/", response_class=HTMLResponse)
def get_about_page(request: Request):
	return templates.TemplateResponse("about.html", {"request": request, "result": {}})


@app.get("/glossary/", response_class=HTMLResponse)
def get_glossary_page(request: Request):
	return templates.TemplateResponse("glossary.html", {"request": request, "result": {}})
