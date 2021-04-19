# d3hoops

## Overview
Project for gathering d3 hoops stats and displaying them in a [kenpom](https://kenpom.com) or [barttorvik](https://barttorvik.com) style interface. I am starting this project with zero JavaScript knowledge, so it should be an adventure! I plan to use the [sportsdataverse](https://www.npmjs.com/package/sportsdataverse) package for getting all of the data from the NCAA website.

## Next Steps
- Pulling relevant data from box scores
  - Extract and format the data and functionalize it
    - Done for game and boxTeam
- Designing and setting up the database
  - Figuring out how to insert multiple rows at once
  - Current design: games, boxTeams, boxPlayers
    - When is the best time to write to the db? When works best for the code?
- Get one day of box data into the database
