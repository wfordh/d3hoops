# turn these into async functions?
# go with psycopg2 first instead of boto3
# https://stackoverflow.com/questions/54300263/connect-to-aws-rds-postgres-database-with-python
# initdb -D /usr/local/var/postgres/data why? idk
# followed by: pg_ctl -D /usr/local/var/postgres/data -l logfile start
# createdb d3hoops
# psql -d d3hoops -U fordhiggins
# next: run dbscripts to create those tables.
# also need teams and games tables
# once some data is in there, start on dbt scripts

import argparse
import logging
import time
from datetime import datetime
from typing import Union

import requests
import sqlalchemy as _sql

parser = argparse.ArgumentParser()

parser.add_argument(
    "-d",
    "--date",
    required=True,
    type=str,
    help="Provide a date for extracting game data. Format: 'YYYY-MM-DD'.",
)

logging.basicConfig(level=logging.INFO)


def parse_int(string: str) -> Union[int, None]:
    try:
        return int(string)
    except ValueError:
        return None


def write_data(
    games_data: list, box_teams_data: list, box_players_data: list, teams_info: list
):
    # should really be more modular...
    # move all this stuff to .env file
    dbname = "d3hoops"
    user = "fordhiggins"
    password = None  # don't think I need it locally
    port = 5432
    host = "localhost"  # don't think I need it locally

    # use declarative models instead??
    cn = f"postgresql://{user}:@{host}:{port}/{dbname}"
    engine = _sql.create_engine(cn)
    metadata_obj = _sql.MetaData()
    with engine.connect() as conn:
        games_table_name = "games_testtest"
        games_table = _sql.Table(games_table_name, metadata_obj, autoload_with=engine)
        games_result = conn.execute(_sql.insert(games_table), games_data)

        team_box_table_name = "box_teams_testtest"
        team_box_table = _sql.Table(
            team_box_table_name, metadata_obj, autoload_with=engine
        )
        team_box_result = conn.execute(_sql.insert(team_box_table), box_teams_data)

        player_box_table_name = "box_players_testtest"
        player_box_table = _sql.Table(
            player_box_table_name, metadata_obj, autoload_with=engine
        )
        player_box_result = conn.execute(
            _sql.insert(player_box_table), box_players_data
        )

        # want to do it this way because only want teams that haven't
        # been entered before. different than games and players
        teams_statement = _sql.text(
            """INSERT INTO teams_testtest (team_id, team_name, nickname, team_abbrev)
            VALUES (:team_id, :team_name, :nickname, :team_abbrev)
            ON CONFLICT (team_id) DO NOTHING;
            """
        )
        for team in teams_info:
            conn.execute(teams_statement, team)
        conn.commit()

    conn.close()


def get_scoreboard(sport: str, division: str, year: str, month: str, day: str) -> dict:
    if len(month) == 1:
        month = "0" + month
    if len(day) == 1:
        day = "0" + day
    base_url = f"https://data.ncaa.com/casablanca/scoreboard/{sport}/{division}/{year}/{month}/{day}/scoreboard.json"
    res = requests.get(base_url)
    assert res.status_code == 200
    return res.json()


def get_game_urls(scoreboard: dict) -> list:
    game_urls = list()
    games = scoreboard.get("games")
    for game in games:
        # skip getting the box score, but maybe some way to still
        # add it for schedules?
        if game["game"]["gameState"] != "final":
            continue
        game_url = game["game"]["url"].rsplit("/", maxsplit=1)[1]
        game_urls.append(game_url)
    return game_urls


def get_game_box_score(game_url: str) -> dict:
    base_url = f"https://data.ncaa.com/casablanca/game/{game_url}/boxscore.json"
    res = requests.get(base_url)
    if res.status_code != 200:
        logging.warning(f"Game box score not accessible: {base_url}")
    assert res.status_code == 200
    return res.json()


def get_box_scores(game_urls: list):
    games = list()
    for url in game_urls:
        # just until async / await?
        time.sleep(1.8)
        game_box = get_game_box_score(url)
        # do I actually want this? might want to have some branching
        # logic to add the game w/o pulling extra info and can add
        # status to the db somehow to help with pulling the schedules
        if game_box["meta"]["status"] != "Final":
            continue
        transformed_box = transform_box_score(game_box, url)
        games.append(transformed_box)

    all_games = list()
    all_team_box = list()
    all_players_box = list()
    all_teams = list()

    for game in games:
        game["game_data"]["created_at"] = datetime.now().isoformat()
        all_games.append(game["game_data"])

        for team in game["box_teams"]:
            team["created_at"] = datetime.now().isoformat()
            all_team_box.append(team)

        for player in game["box_players"]:
            player["created_at"] = datetime.now().isoformat()
            all_players_box.append(player)

        all_teams.extend(game["teams_info"])

    write_data(
        games_data=all_games,
        box_teams_data=all_team_box,
        box_players_data=all_players_box,
        teams_info=all_teams,
    )


def transform_box_score(game_box: dict, game_id: str) -> dict:
    # could pass simpler things into the functions so I don't
    # have to add team and game IDs later
    game_data = dict()
    box_teams = list()
    box_players = list()
    team_zero_info = get_team_info(game_box["meta"]["teams"][0])
    team_one_info = get_team_info(game_box["meta"]["teams"][1])
    teams_info = [team_zero_info, team_one_info]
    team_zero = game_box["teams"][0]["teamId"]
    team_one = game_box["teams"][1]["teamId"]
    game_data["game_id"] = game_id
    game_data["team_zero_id"] = team_zero
    game_data["team_one_id"] = team_one
    game_data["is_team_zero_home"] = game_box["meta"]["teams"][0]["homeTeam"] == "true"
    game_data["game_date"] = game_box["updatedTimestamp"].replace(
        "ET", "EST"
    )  # why the repalce? should I truncate to just date?

    team_zero_stats = extract_team_box_score(game_box["teams"][0]["playerTotals"])
    team_zero_stats["team_id"] = team_zero
    team_zero_stats["game_id"] = game_id
    box_teams.append(team_zero_stats)

    team_one_stats = extract_team_box_score(game_box["teams"][1]["playerTotals"])
    team_one_stats["team_id"] = team_one
    team_one_stats["game_id"] = game_id
    box_teams.append(team_one_stats)

    team_zero_players = extract_player_box_stats(game_box["teams"][0]["playerStats"])
    for player in team_zero_players:
        player["team_id"] = team_zero
        player["game_id"] = game_id

    box_players += team_zero_players

    team_one_players = extract_player_box_stats(game_box["teams"][1]["playerStats"])
    for player in team_one_players:
        player["team_id"] = team_one
        player["game_id"] = game_id

    box_players += team_one_players

    return {
        "game_data": game_data,
        "box_teams": box_teams,
        "box_players": box_players,
        "teams_info": teams_info,
    }


def extract_team_box_score(player_totals: dict) -> dict:
    # do commented out lines in dbt???
    team_box_stats = dict()
    team_box_stats["fgm"] = parse_int(player_totals["fieldGoalsMade"].split("-")[0])
    team_box_stats["fga"] = parse_int(player_totals["fieldGoalsMade"].split("-")[1])
    team_box_stats["fg3m"] = parse_int(player_totals["threePointsMade"].split("-")[0])
    team_box_stats["fg3a"] = parse_int(player_totals["threePointsMade"].split("-")[1])
    # team_box_stats["fg2m"] = team_box_stats["fgm"] - team_box_stats["fg3m"]
    # team_box_stats["fg2a"] = team_box_stats["fga"] - team_box_stats["fg3a"]
    team_box_stats["ftm"] = parse_int(player_totals["freeThrowsMade"].split("-")[0])
    team_box_stats["fta"] = parse_int(player_totals["freeThrowsMade"].split("-")[1])
    team_box_stats["rebs"] = parse_int(player_totals["totalRebounds"])
    team_box_stats["o_rebs"] = parse_int(player_totals["offensiveRebounds"])
    # team_box_stats["d_rebs"] =
    team_box_stats["assists"] = parse_int(player_totals["assists"])
    team_box_stats["fouls"] = parse_int(player_totals["personalFouls"])
    team_box_stats["steals"] = parse_int(player_totals["steals"])
    team_box_stats["tovs"] = parse_int(player_totals["turnovers"])
    team_box_stats["blocks"] = parse_int(player_totals["blockedShots"])
    team_box_stats["points"] = parse_int(player_totals["points"])
    # fg_pct, fg3_pct, ft_pct, efg_pct, fg2_pct
    return team_box_stats


def extract_player_box_stats(player_stats: dict) -> list:
    player_list = list()
    for player in player_stats:
        player_data = dict()
        player_data["first_name"] = player["firstName"]
        player_data["last_name"] = player["lastName"]
        player_data["position"] = player["position"]
        player_data["minutes_played"] = parse_int(player["minutesPlayed"])
        player_data["fgm"] = parse_int(player["fieldGoalsMade"].split("-")[0])
        player_data["fga"] = parse_int(player["fieldGoalsMade"].split("-")[1])
        player_data["fg3m"] = parse_int(player["threePointsMade"].split("-")[0])
        player_data["fg3a"] = parse_int(player["threePointsMade"].split("-")[1])
        player_data["ftm"] = parse_int(player["freeThrowsMade"].split("-")[0])
        player_data["fta"] = parse_int(player["freeThrowsMade"].split("-")[1])
        player_data["rebs"] = parse_int(player["totalRebounds"])
        player_data["o_rebs"] = parse_int(player["offensiveRebounds"])
        player_data["assists"] = parse_int(player["assists"])
        player_data["fouls"] = parse_int(player["personalFouls"])
        player_data["steals"] = parse_int(player["steals"])
        player_data["tovs"] = parse_int(player["turnovers"])
        player_data["blocks"] = parse_int(player["blockedShots"])
        player_data["points"] = parse_int(player["points"])

        player_list.append(player_data)

    return player_list


def get_team_info(boxscore_teams):
    # could be dict or list, depending on if I loop
    # add season somewhere
    team_data = dict()
    team_data["team_id"] = boxscore_teams["id"]
    team_data["team_name"] = boxscore_teams["shortName"]
    team_data["nickname"] = boxscore_teams["nickName"]
    team_data["team_abbrev"] = boxscore_teams["sixCharAbbr"]

    return team_data


def main():
    # add CLI for getting the day for the GH action
    args = parser.parse_args()
    command_args = dict(vars(args))
    extract_date = command_args.pop("date", None)
    # probably want some sort of error handling to make sure of this...
    year, month, day = extract_date.split("-")
    logging.info(f"Scraping data for year: {year} month: {month} day: {day}")
    # test day was 2023-03-10
    scoreboard = get_scoreboard(
        sport="basketball-men", division="d3", year=year, month=month, day=day
    )

    game_urls = get_game_urls(scoreboard)
    get_box_scores(game_urls)


if __name__ == "__main__":
    main()
