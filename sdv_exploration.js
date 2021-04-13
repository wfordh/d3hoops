const sdv = require("sportsdataverse");
const process = require("process")

// process.argv.forEach((val, index) => {
// 	console.log(`${index}:${val}`)
// })
if (process.argv.length === 3) {
    console.log("A date was supplied!")
    const currentDate = process.argv[2].split("-")
    const yr = parseInt(currentDate[0])
    const month = parseInt(currentDate[1])
    const day = parseInt(currentDate[2])
} else {
    console.log("No date supplied, using today's date")
    const currentDate = new Date()
    const yr = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    const day = currentDate.getDate()
    console.log(yr)
}
const scores = (async()=> await sdv.ncaaScoreboard.getNcaaScoreboard(
    sport = 'basketball-men', division='d1', year=yr, month=month, day=day
    ))();
if (scores.length === 0) {
    console.log('no scores!')
    } else {
    console.log(scores)
    }
var idGames = Array()

// for (gm of scores.games) {
//     let urlGame = gm.game.url
//     try {
//         const gameId = (async()=> await sdv.ncaaGames.getNcaaRedirectUrl(urlGame))()
//         idGames.push(gameId)
//         } catch(error) {
//         console.log(urlGame)
//         }
//     }
const dailyBoxScores = new Object()
var lostGames = Array()
for (const gid of idGames) {
    try {
        dailyBoxScores[gid] = (async()=> await sdv.ncaaGames.getNcaaBoxScore(gid))()
        } catch(error) {
//         even if no getNcaaBoxScore, might have getNcaaInfo
        lostGames.push(gid)
        }
    }
console.log(lostGames)
console.log(dailyBoxScores)
const gameId = 3194201;
const result = (async()=> await sdv.ncaaGames.getBoxScore(gameId))();
for (let obj of result.teams[0].statistics) {
    console.log(obj.displayValue.split("-"))
}
