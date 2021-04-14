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
        gameBox.then((box) => console.log(box.teams[0].playerHeader));
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
  transformed["t0_id"] = boxScore.teams[0].teamId;
  transformed["t1_id"] = boxScore.teams[1].teamId;
  // check this
  transformed["t0_home"] = boxScore.meta.teams[0].homeTeam === "true";
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
