var sdv = require("sportsdataverse");
const pgp = require("pg-promise")();
require("dotenv").config();

function getGameID(games) {
  var gid = Array();
  for (const game of games.games) {
    try {
      // get game id from url not gameID tag
      gid.push(game.game.url.split("/")[2]);
    } catch (error) {
      console.log("foobar");
    }
  }
  //	console.log(gid)
  return gid;
}

async function writeData(data, db) {
  const tableName_games = "games_testtest";
  const columnNames_games = [
    "game_id",
    "t0_id",
    "t1_id",
    "is_t0_home",
    "game_date",
    { name: "created_at", mod: "^", def: "CURRENT_TIMESTAMP" },
  ];
  const cs_games = new pgp.helpers.ColumnSet(columnNames_games, {
    table: tableName_games, // {table: tableName, schema: 'd3_hoops'},
  });
  await db.none(pgp.helpers.insert(data[0], cs_games));

  const tableName_teamBox = "box_teams_testtest";
  const columnNames_teamBox = [
    "game_id",
    "team_id",
    "fgm",
    "fga",
    "fg3m",
    "fg3a",
    "fg2m",
    "fg2a",
    "ftm",
    "fta",
    "total_rebs",
    "o_rebs",
    "d_rebs",
    "assists",
    "fouls",
    "steals",
    "tovs",
    "blocks",
    "points",
    "fg_pct",
    "fg3p_pct",
    "ft_pct",
    "efg_pct",
    "fg2p_pct",
    { name: "created_at", mod: "^", def: "CURRENT_TIMESTAMP" },
  ];
  const cs_teamBox = new pgp.helpers.ColumnSet(columnNames_teamBox, {
    table: tableName_teamBox,
  });
  await db.none(pgp.helpers.insert(data[1], cs_teamBox));

  const tableName_playersBox = "box_players_testtest";
  const columnNames_playersBox = [
    "game_id",
    "team_id",
    "first_name",
    "last_name",
    "position",
    "minutes_played",
    "fgm",
    "fga",
    "fg3m",
    "fg3a",
    "fg2m",
    "fg2a",
    "ftm",
    "fta",
    "total_rebs",
    "o_rebs",
    "d_rebs",
    "assists",
    "fouls",
    "steals",
    "tovs",
    "blocks",
    "points",
    "fg_pct",
    "fg3p_pct",
    "ft_pct",
    "efg_pct",
    "fg2p_pct",
    { name: "created_at", mod: "^", def: "CURRENT_TIMESTAMP" },
  ];
  const cs_playersBox = new pgp.helpers.ColumnSet(columnNames_playersBox, {
    table: tableName_playersBox,
  });
  await db.none(pgp.helpers.insert(data[2], cs_playersBox));

  // if need columns in order, use Objects.assign()?
  // https://stackoverflow.com/questions/19457337/how-to-add-a-property-at-the-beginning-of-an-object-in-javascript
  // const cs = new pgp.helpers.ColumnSet(columnNames, {table: tableName})
  // await db.none(pgp.helpers.insert(data, cs))
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getBoxScores(games) {
  // add check to make sure the game is final?
  // change promises to an object?
  // depends on pg-promise
  var promises = [];
  for (const gid of games) {
    await sleep(1100);
    let gameBox = await sdv.ncaa.getBoxScore(gid);
    let transformed = transformBoxScore(gameBox, parseInt(gid, 10));
    promises.push(transformed);
  }
  // [games, boxTeam, boxPlayer]
  var allGames = [];
  var allTeamBox = [];
  var allPlayersBox = [];
  // not working...maybe do it in another function?
  for (let gameNum = 0; gameNum < promises.length; gameNum++) {
    allGames.push(promises[gameNum].gameData);
    for (const team of Object.values(promises[gameNum].boxTeam)) {
      allTeamBox.push(team);
    }
    // allTeamBox.push(Object.values(promises[gameNum].boxTeam[0]));
    // need to similarly pull out the players here
    for (const player of Object.values(promises[gameNum].boxPlayers)) {
      allPlayersBox.push(player.shift());
    }
    // allPlayersBox.push(promises[gameNum].boxPlayers);
  }
  const cn = `postgres://${process.env.DB_USER}:@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
  const db = pgp(cn);

  // ignore this part for now
  let sco;
  db.connect()
    .then((obj) => {
      sco = obj;
      return writeData([allGames, allTeamBox, allPlayersBox], obj);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      if (sco) {
        sco.done();
      }
    });
  // writeData(allGames, "games", c).catch((err) => console.log(err));
  // writeData(allTeamBox, "teamBox", c).catch((err) => console.log(err));
  // writeData(allPlayersBox, "playersBox", c).catch((err) => console.log(err));
}

function transformBoxScore(boxScore, gameId) {
  var transformed = new Object();
  var games = new Object();
  var boxAllPlayers = new Object();
  var boxTeam = new Object();
  const t0_id = boxScore.teams[0].teamId;
  const t1_id = boxScore.teams[1].teamId;
  games["game_id"] = gameId;
  games["is_t0_home"] = boxScore.meta.teams[0].homeTeam === "true";
  games["t0_id"] = t0_id;
  games["t1_id"] = t1_id;
  games["game_date"] = boxScore.updatedTimestamp.replace("ET", "EST");
  // adding created_at timestamps? Where in pipeline does that happen?

  var t0_team_stats = parseTeamBox(boxScore.teams[0].playerTotals);
  t0_team_stats["game_id"] = gameId;
  t0_team_stats["team_id"] = t0_id;
  var t1_team_stats = parseTeamBox(boxScore.teams[1].playerTotals);
  t1_team_stats["game_id"] = gameId;
  t1_team_stats["team_id"] = t1_id;
  var t0_players = Array();
  // rewrite this so the function call takes care of loop somehow
  for (const player of boxScore.teams[0].playerStats) {
    var boxPlayer = parsePlayerStats(player);
    boxPlayer["game_id"] = gameId;
    boxPlayer["team_id"] = t0_id;
    t0_players.push(boxPlayer);
  }
  boxAllPlayers[t0_id] = t0_players;
  var t1_players = Array();
  for (const player of boxScore.teams[1].playerStats) {
    var boxPlayer = parsePlayerStats(player);
    boxPlayer["game_id"] = gameId;
    boxPlayer["team_id"] = t1_id;
    t1_players.push(boxPlayer);
  }
  boxAllPlayers[t1_id] = t1_players;

  boxTeam[t0_id] = t0_team_stats;
  boxTeam[t1_id] = t1_team_stats;
  var allGameData = new Object();
  allGameData["gameData"] = games;
  allGameData["boxTeam"] = boxTeam;
  allGameData["boxPlayers"] = boxAllPlayers;
  return allGameData;
}

function parseTeamBox(teamStats) {
  var teamBoxStats = Object();
  teamBoxStats["fgm"] = parseInt(teamStats.fieldGoalsMade.split("-")[0]);
  teamBoxStats["fga"] = parseInt(teamStats.fieldGoalsMade.split("-")[1]);
  teamBoxStats["fg3m"] = parseInt(teamStats.threePointsMade.split("-")[0]);
  teamBoxStats["fg3a"] = parseInt(teamStats.threePointsMade.split("-")[1]);
  teamBoxStats["fg2m"] = teamBoxStats.fgm - teamBoxStats.fg3m;
  teamBoxStats["fg2a"] = teamBoxStats.fga - teamBoxStats.fg3a;
  teamBoxStats["ftm"] = parseInt(teamStats.freeThrowsMade.split("-")[0]);
  teamBoxStats["fta"] = parseInt(teamStats.freeThrowsMade.split("-")[1]);
  teamBoxStats["total_rebs"] = parseInt(teamStats.totalRebounds, 10);
  teamBoxStats["o_rebs"] = parseInt(teamStats.offensiveRebounds, 10);
  teamBoxStats["d_rebs"] = teamBoxStats.total_rebs - teamBoxStats.o_rebs;
  teamBoxStats["assists"] = parseInt(teamStats.assists, 10);
  teamBoxStats["fouls"] = parseInt(teamStats.personalFouls, 10);
  teamBoxStats["steals"] = parseInt(teamStats.steals, 10);
  teamBoxStats["tovs"] = parseInt(teamStats.turnovers, 10);
  teamBoxStats["blocks"] = parseInt(teamStats.blockedShots, 10);
  teamBoxStats["points"] = parseInt(teamStats.points, 10);
  teamBoxStats["fg_pct"] = teamBoxStats.fgm / teamBoxStats.fga;
  teamBoxStats["fg3p_pct"] = teamBoxStats.fg3m / teamBoxStats.fg3a;
  teamBoxStats["ft_pct"] = teamBoxStats.ftm / teamBoxStats.fta;
  teamBoxStats["efg_pct"] =
    (teamBoxStats.fgm + 0.5 * teamBoxStats.fg3m) / teamBoxStats.fga;
  teamBoxStats["fg2p_pct"] = teamBoxStats.fg2m / teamBoxStats.fg2a;
  return teamBoxStats;
}

function parsePlayerStats(playerStats) {
  // how to do this since it'll be multiple players??
  // combine this and team to reduce redundancy?
  // fg3p_pct ==> fg3_pct ??
  var playerBoxStats = Object();
  playerBoxStats["first_name"] = playerStats.firstName;
  playerBoxStats["last_name"] = playerStats.lastName;
  playerBoxStats["position"] = playerStats.position; // null positions?
  playerBoxStats["minutes_played"] = parseInt(playerStats.minutesPlayed, 10);
  const fgData = splitParse(playerStats.fieldGoalsMade);
  playerBoxStats["fgm"] = fgData[0];
  playerBoxStats["fga"] = fgData[1];
  const fg3Data = splitParse(playerStats.threePointsMade);
  playerBoxStats["fg3m"] = fg3Data[0];
  playerBoxStats["fg3a"] = fg3Data[1];
  playerBoxStats["fg2m"] = fgData[0] - fg3Data[0];
  playerBoxStats["fg2a"] = fgData[1] - fg3Data[1];
  const ftData = splitParse(playerStats.freeThrowsMade);
  playerBoxStats["ftm"] = ftData[0];
  playerBoxStats["fta"] = ftData[1];
  playerBoxStats["total_rebs"] = parseInt(playerStats.totalRebounds, 10);
  playerBoxStats["o_rebs"] = parseInt(playerStats.offensiveRebounds, 10);
  playerBoxStats["d_rebs"] = playerBoxStats.total_rebs - playerBoxStats.o_rebs;
  playerBoxStats["assists"] = parseInt(playerBoxStats.assists, 10);
  playerBoxStats["fouls"] = parseInt(playerBoxStats.personalFouls, 10);
  playerBoxStats["steals"] = parseInt(playerBoxStats.steals, 10);
  playerBoxStats["tovs"] = parseInt(playerBoxStats.turnovers, 10);
  playerBoxStats["blocks"] = parseInt(playerBoxStats.blockedShots, 10);
  playerBoxStats["points"] = parseInt(playerBoxStats.points, 10);
  playerBoxStats["fg_pct"] = playerBoxStats.fgm / playerBoxStats.fga;
  playerBoxStats["fg3p_pct"] = playerBoxStats.fg3m / playerBoxStats.fg3a;
  playerBoxStats["ft_pct"] = playerBoxStats.ftm / playerBoxStats.fta;
  playerBoxStats["efg_pct"] =
    (playerBoxStats.fgm + 0.5 * playerBoxStats.fg3m) / playerBoxStats.fga;
  playerBoxStats["fg2p_pct"] = playerBoxStats.fg2m / playerBoxStats.fg2a;
  return playerBoxStats;
}

// fill in function for handling the splitting and parsing like above
function splitParse(stat, split = true) {
  if (split) {
    return stat.split("-").map(function (x) {
      return parseInt(x, 10);
    });
  } else {
    return parseInt(stat, 10);
  }
}

const scores = sdv.ncaa.getScoreboard(
  (sport = "basketball-men"),
  (division = "d3"),
  (year = 2021),
  (month = 3),
  (day = 23)
);
// feb 2020: 14, 15, 16, 18, 19 done. 17 bad.
// jan 2020: 19, 20, 21, 22, 23 done.
// feb 2019: doesn't seem to be formatting the data correctly...
// mar 2021: 15, 16, 17, 18, 19, 23 done. 20 and 21 bad.
scores
  .then((result) => getGameID(result))
  .then((boxData) => getBoxScores(boxData))
  .then(() => console.log("Done! Check the tables"))
  .catch((err) => console.log(err));

// not working
// const scores_await = (async function() { return await sdv.ncaa.getScoreboard(
//     sport = 'basketball-men', division='d1', year=2020, month=2, day=12
//     )})();
// console.log(scores_await)
