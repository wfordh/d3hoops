# d3hoops

## Overview
Project for gathering d3 hoops stats and displaying them in a [kenpom](https://kenpom.com) or [barttorvik](https://barttorvik.com) style interface. I am starting this project with zero JavaScript knowledge, so it should be an adventure! I plan to use the [sportsdataverse](https://www.npmjs.com/package/sportsdataverse) package for getting all of the data from the NCAA website.

## Next Steps
- Designing and setting up the database
  - Figuring out how to insert multiple rows at once
    - [pg-promise insert](https://vitaly-t.github.io/pg-promise/helpers.html#.insert)
  - Current design: games, boxTeams, boxPlayers
    - When is the best time to write to the db? When works best for the code?
- Get one day/week of box data into the database
