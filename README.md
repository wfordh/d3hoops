# d3hoops

![image](https://img.shields.io/badge/fastapi-109989?style=for-the-badge&logo=FASTAPI&logoColor=white) ![image](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![image](https://img.shields.io/badge/dbt-FF694B?style=for-the-badge&logo=dbt&logoColor=white) ![image](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)

## Overview
Project for gathering d3 hoops stats and displaying them in a [kenpom](https://kenpom.com) or [barttorvik](https://barttorvik.com) style interface. I am shifting from trying to learn JavaScript for this project to using Python-based frameworks such as SQLAlchemy, FastAPI, and dbt, along with a PostgreSQL database and Bootstrap for the frontend.

Here's a [short video](https://twitter.com/wfordh/status/1762922181171011697) with the progress I've made as of 2/28/24.

## Next Steps
- Completing the webpages
- Handle games w/o boxscores better
  - Before season would write all games on the schedule to the database
  - Once game happens, update that result
- Write lengthier "about" / "overview"
- Reorg code so it makes more sense and easier to backfill / run daily.
  - Add GH action to run it everyday
- Decouple db write code so it doesn't live inside another function
- Add player IDs - use surrogate IDs?
- Moving to the cloud
- Clean up the repo by moving JS related stuff to a `deprecated` folder
