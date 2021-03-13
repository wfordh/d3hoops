var sdv = require("sportsdataverse");
const scores = await sdv.ncaaScoreboard.getNcaaScoreboard(
    sport = 'basketball-men', division='d1', year=2020, month=06, day=15
    )
if (scores === '') {
    console.log('no scores!')
    } else {
    console.log(scores)
    }
var idGames = Array()
for (gm of scores.games) {
    let urlGame = gm.game.url
    try {
        const gameId = await sdv.ncaaGames.getNcaaRedirectUrl(urlGame)
        idGames.push(gameId)
        } catch(error) {
        console.log(urlGame)
        }
    }
const dailyBoxScores = new Object()
var lostGames = Array()
for (const gid of idGames) {
    try {
        dailyBoxScores[gid] = await sdv.ncaaGames.getNcaaBoxScore(gid)
        } catch(error) {
//         even if no getNcaaBoxScore, might have getNcaaInfo
        lostGames.push(gid)
        }
    }
console.log(lostGames)
console.log(await sdv.ncaaGames.getNcaaInfo(3194201))
console.log(dailyBoxScores)
const gameId = 401260281;
const result = await sdv.cbbGames.getBoxScore(gameId);
for (let obj of result.teams[0].statistics) {
    console.log(obj.displayValue.split("-"))
}
