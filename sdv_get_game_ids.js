var sdv = require("sportsdataverse")

function getGameID(games) {
	var gid = Array()
	for (const game of games.games) {
		try {
			gid.push(game.game.gameID)
		} catch (error) {
			console.log("foobar")
		}
	}
	console.log(gid)
	return gid;
}

const scores = sdv.ncaa.getScoreboard(
    sport = 'basketball-men', division='d3', year=2020, month=2, day=12
    );
scores.then(result => console.log(getGameID(result)));
// 	result => console.log(result.len)
// 	).then(
// 	result => getGameID(result)
// 	);

// console.log(result)
