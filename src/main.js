const sdv = require('sportsdataverse');

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


