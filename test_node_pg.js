const { Pool, Client } = require("pg");
require("dotenv").config();

const pool_two = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT), // not sure I need the parseInt()
});

const new_game = new Object();
new_game["is_t0_home"] = true;
new_game["t0_id"] = 1400;
new_game["t1_id"] = 2391;
new_game["game_date"] = "2020-02-19 13:42:57 ET";
const text =
  "INSERT INTO games_test(t0_id, t1_id, is_t0_home, game_date) VALUES($2, $3, $1, $4)";
const values = Object.values(new_game);

pool_two.query(text, values, (err, res) => {
  if (err) {
    console.log(e.stack);
  } else {
    console.log(res.rows[0]);
  }
});
