import pydantic

class _BaseGameBox(pydantic.BaseModel):
	fgm: int
	fga: int
	fg_pct: float
	fg3m: int
	fg3a: int
	fg3_pct: float
	fg2m: int
	fg2a: int
	fg2_pct: float
	efg_pct: float
	ftm: int
	fta: int
	ft_pct: float
	rebs: int
	o_rebs: int
	d_rebs: int
	assists: int
	tovs: int
	ast_tov_ratio: float
	fouls: int
	blocks: int
	points: int

class TeamGameBox(_BaseGameBox):
	game_id: int
	team_id: int

	class Config:
		orm_mode = True

