# d3hoops

## Overview
Project for gathering d3 hoops stats and displaying them in a [kenpom](https://kenpom.com) or [barttorvik](https://barttorvik.com) style interface. I am starting this project with zero JavaScript knowledge, so it should be an adventure! I plan to use the [sportsdataverse](https://www.npmjs.com/package/sportsdataverse) package for getting all of the data from the NCAA website.

## Next Steps
- Designing and setting up the database
  - Current design: games, boxTeams, boxPlayers
    - When is the best time to write to the db? When works best for the code?
- Get one day/week of box data into the database
- Look into using DBT here?
- Handle games w/o boxscores better
- Write lengthier "about" / "overview"
- Reorg code so it makes more sense and easier to backfill / run daily.
  - Add GH action to run it everyday?
- Find way to make a teams table in the db
- Decouple db write code so it doesn't live inside another function
