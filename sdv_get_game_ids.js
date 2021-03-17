var sdv = require("sportsdataverse")

const scores = sdv.ncaa.getScoreboard(
    sport = 'basketball-men', division='d3', year=2020, month=2, day=12
    );
scores.then(result => console.log(result.games[0]))
