## 2026-10-20 Switched versions for every status-bound weapon
- Systems: fitcheck, upgrades, tests
- Files: wup2.js, wup3.js, wup4.js, fitcheck.js, tests/switchtest.js (new), tests/wup2test.js, tests/fittest.js, tests/tools/guide.js, GAME_GUIDE.md
- What: Switched at Birth can now pick every weapon. The seven whose branches run on their own status switch only to one type with its own version: Acid Spit to Mucus (Snowball), Nocturnal Emission to Alien (Ectoplasm), Hot Mess to Blood (Crime Scene), Rent Free to Force (Poltergeist), Unwanted Contact to Fire (Wildfire), plus The Runs (Static) and Little Prick (Alien) from earlier. Mass Hysteria and Possession Fee are no longer hidden after a switch (they never needed Alien); Nappy Mines hides only Flare Up.
- Save data: none.
- Hooks: none (w2Snot/w2Ecto in wup2.js, w3Scene/w3Polter in w3BarFrac, ucWild in wup4.js ucChain; fitcheck.js FIT_SAB_TYPES, FIT_TEXT).
- Risk: card and callout text for the new versions are drafts (user keeps them for now and edits in place: fitcheck.js FIT_TEXT, floatText calls in wup2/3/4/6.js); untested for balance.
