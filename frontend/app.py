# uvicorn app:app --reload

import sqlalchemy.orm as _orm
from fastapi import FastAPI, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import frontend.services as _services

app = FastAPI()

templates = Jinja2Templates(directory="templates")

@app.get("/") #, response_class=HTMLResponse)
def root(db: _orm.Session = Depends(_services.get_db)):
	return _services.get_all_teams_season_rollup(season=2023, db=db)
	# result = _services.get_team_game_box(game_id = 6130869, team_id = 504, db=db)
	# return templates.TemplateResponse("season.html", result)