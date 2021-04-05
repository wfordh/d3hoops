var sdv = require("sportsdataverse")

function getGameID(games) {
	var gid = Array()
	for (const game of games.games) {
		try {
			// get game id from url not gameID tag
			gid.push(game.game.url.split("/")[2])
		} catch (error) {
			console.log("foobar")
		}
	}
	console.log(gid)
	return gid;
}

function getBoxScores(games) {
	// add check to make sure it's final?
	var boxScores = new Object()
	var lostGames = new Array()
	for (const gid of games) {
		try {
			// get box scores
			const gameBox = sdv.ncaa.getBoxScore(gid)
			gameBox.then(box => console.log(box.teams[0].teamId))
			boxScores[gid] = gameBox
		} catch (error) {
			// log game id
			lostGames.push(gid)
		}
	}
	console.log(lostGames)
	return boxScores
}

const scores = sdv.ncaa.getScoreboard(
    sport = 'basketball-men', division='d3', year=2020, month=2, day=12
    );
scores.then(
	result => getGameID(result)
	).then(
	boxData => getBoxScores(boxData)
	).catch(err => console.log(err));

// not working
// const scores_await = (async function() { return await sdv.ncaa.getScoreboard(
//     sport = 'basketball-men', division='d1', year=2020, month=2, day=12
//     )})();
// console.log(scores_await)