var sdv = require("sportsdataverse");
const { Pool, Client } = require("pg");

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

function getBoxScores(games) {
  // add check to make sure it's final?
  var boxScores = new Object();
  var lostGames = new Array();
  for (const gid of games) {
    try {
      // get box scores
      const gameBox = sdv.ncaa.getBoxScore(gid);
      //			gameBox.then(box => console.log(box.teams[0].teamId))
      if (gid === "3942769") {
        gameBox.then((box) => transformBoxScore(box));
      }
      boxScores[gid] = gameBox;
    } catch (error) {
      // log game id
      lostGames.push(gid);
    }
  }
  console.log(lostGames);
  return boxScores;
}

function transformBoxScore(boxScore) {
  var transformed = new Object();
  var games = new Object();
  var boxPlayer = new Object();
  var boxTeam = new Object();
  const t0_id = boxScore.teams[0].teamId;
  const t1_id = boxScore.teams[1].teamId;
  // check this
  games["is_t0_home"] = boxScore.meta.teams[0].homeTeam === "true";
  games["t0_id"] = t0_id;
  games["t1_id"] = t1_id;
  games["game_date"] = boxScore.updatedTimestamp;
  // adding created_at timestamps? Where in pipeline does that happen?
  // boxPlayer creation
  // not sure this is necessary since can't create object from keys with empty values in JS
  var playerHeaders = [
    "team_id",
    "first_name",
    "last_name",
    "position",
    "minutes_played",
    "fgm",
    "fga",
    "3pm",
    "3pa",
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
    "3p_pct",
    "ft_pct",
    "efg_pct",
  ];
  // boxTeam creation
  var teamHeaders = [
    "team_id",
    "fgm",
    "fga",
    "3pm",
    "3pa",
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
    "3p_pct",
    "ft_pct",
    "efg_pct",
  ];

  var t0_team_stats = parseTeamBox(boxScore.teams[0].playerTotals);
  var t1_team_stats = parseTeamBox(boxScore.teams[1].playerTotals);
  console.log(t0_team_stats);
  boxTeam[t0_id] = t0_team_stats;
  boxTeam[t1_id] = t1_team_stats;
  console.log(games);
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

// fill in function for handling the splitting and parsing like above
function splitParse(stat, isInt = true) {
  if (isInt) {
    return stat.split("-").map(function (x) {
      return parseInt(x, 10);
    });
  } else {
    return stat.split("-");
  }
}

const scores = sdv.ncaa.getScoreboard(
  (sport = "basketball-men"),
  (division = "d3"),
  (year = 2020),
  (month = 2),
  (day = 12)
);
scores
  .then((result) => getGameID(result))
  .then((boxData) => getBoxScores(boxData))
  .catch((err) => console.log(err));

// not working
// const scores_await = (async function() { return await sdv.ncaa.getScoreboard(
//     sport = 'basketball-men', division='d1', year=2020, month=2, day=12
//     )})();
// console.log(scores_await)
