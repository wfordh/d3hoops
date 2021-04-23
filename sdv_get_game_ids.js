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
  // add check to make sure the game is final?
  var boxScores = new Object();
  var gameData = new Array();
  var teamBoxData = new Array();
  var playerBoxData = new Array();
  var lostGames = new Array();
  for (const gid of games) {
    try {
      // get box scores
      const gameBox = sdv.ncaa.getBoxScore(gid);
      // [games, boxTeam, boxPlayer]
      gameBox
          .then((box) => transformBoxScore(box, gid))
          .then(() => {
              (boxTransformed)
//            gameData.push(boxTransformed.games);
//            teamBoxData.push(boxTransformed.boxTeam);
//            playerBoxData.push(boxTransformed.boxPlayers);
          })
      ;
      console.log(boxTransformed)
      // switch to three arrays and push respective item to each one?
      // boxScores[gid] = boxTransformed;
    } catch (error) {
      // log game id
      console.log(error);
      lostGames.push(gid);
    }
  }
  console.log(`lost games: ${lostGames}`);
  console.log(gameData);
  return boxScores;
}

function transformBoxScore(boxScore, gameId) {
  var transformed = new Object();
  var games = new Object();
  var boxAllPlayers = new Object();
  var boxTeam = new Object();
  const t0_id = boxScore.teams[0].teamId;
  const t1_id = boxScore.teams[1].teamId;
  // check this
  games["game_id"] = gameId;
  games["is_t0_home"] = boxScore.meta.teams[0].homeTeam === "true";
  games["t0_id"] = t0_id;
  games["t1_id"] = t1_id;
  games["game_date"] = boxScore.updatedTimestamp;
  // adding created_at timestamps? Where in pipeline does that happen?

  var t0_team_stats = parseTeamBox(boxScore.teams[0].playerTotals);
  t0_team_stats["game_id"] = gameId;
  var t1_team_stats = parseTeamBox(boxScore.teams[1].playerTotals);
  t1_team_stats["game_id"] = gameId;
  var t0_players = Array();
  // rewrite this so the function call takes care of loop somehow
  for (const player of boxScore.teams[0].playerStats) {
    var boxPlayer = parsePlayerStats(player);
    boxPlayer["game_id"] = gameId;
    t0_players.push(boxPlayer);
  }
  boxAllPlayers[t0_id] = t0_players;
  var t1_players = Array();
  for (const player of boxScore.teams[1].playerStats) {
    var boxPlayer = parsePlayerStats(player);
    boxPlayer["game_id"] = gameId;
    t1_players.push(boxPlayer);
  }
  boxAllPlayers[t1_id] = t1_players;

  boxTeam[t0_id] = t0_team_stats;
  boxTeam[t1_id] = t1_team_stats;
  var allGameData = new Object();
  allGameData["games"] = games;
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
  playerBoxStats["minutesPlayed"] = parseInt(playerStats.minutesPlayed, 10);
  const fgData = splitParse(playerStats.fieldGoalsMade);
  playerBoxStats["fgm"] = fgData[0];
  playerBoxStats["fga"] = fgData[1];
  const fg3Data = splitParse(playerStats.threePointsMade);
  playerBoxStats["fg3m"] = fg3Data[0];
  playerBoxStats["fg3a"] = fg3Data[1];
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
