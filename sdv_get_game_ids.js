var sdv = require("sportsdataverse");

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

  var t0_team_stats = boxScore.teams[0].playerTotals;
  // sketch out how this is saved. team data: game_id, team_id, all the stats?
  var box_t0_stats = Object();
  box_t0_stats["fgm"] = parseInt(t0_team_stats.fieldGoalsMade.split("-")[0]);
  box_t0_stats["fga"] = parseInt(t0_team_stats.fieldGoalsMade.split("-")[1]);
  box_t0_stats["3pm"] = parseInt(t0_team_stats.threePointsMade.split("-")[0]);
  box_t0_stats["3pa"] = parseInt(t0_team_stats.threePointsMade.split("-")[1]);
  box_t0_stats["ftm"] = parseInt(t0_team_stats.freeThrowsMade.split("-")[0]);
  box_t0_stats["fta"] = parseInt(t0_team_stats.freeThrowsMade.split("-")[1]);
  console.log(box_t0_stats);
  console.log(games);
}

function splitParse() {}

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
