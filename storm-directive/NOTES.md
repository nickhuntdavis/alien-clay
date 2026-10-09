# Handoff notes (keep short; update at the end of each session)

## Current state
- Version v8.57 (versionCode 207), branch `claude/autorun-bullet-storm-game-blptu8`. All 46 suite tests pass.
- The Weapon Atlas artifact lives at https://claude.ai/artifact/LBga1dJ3q2QyAX1uee8Ef9. It was built from the old scratchpad (`weapon-atlas.html` plus a data generator), which is now lost. To update it, read it back with the Artifact tool and republish to that URL.

## Recent changes (newest first)
- v8.57: copy pass for two frames. Dish and race modes are the scientist's forced-evolution experiment: the narrator is the LAB TECH, viewers are lab Funding (£), sponsors are research grants, Fan DNA is Donor DNA. The campaign (`lvOn()`) uses an INNER VOICE (`LONGING_LINES` in data.js, via `sysPool`) obsessed with the egg, and the meter shows as Devotion. Also: Voodoo→Histamine (status swollen), MAG→LOAD, Storm Surge→Fever Pitch, Relic→Trophy, Codex→Field Guide, Armoury→Tackle Box, Celestial→Immaculate, Bounty→Tagged Specimen, Chrono→Body Clock. Internal ids unchanged.
- v8.56: Codex enemy list crash fixed (campaign germs had no ENEMIES entry); tests, CLAUDE.md and these notes moved into the repo.
- v8.55: the campaign's way-on chevron only shows after 40 s without headway (`LV_LOST`).
- v8.54: autorun no longer solves campaign mazes (no route pull, no corridor wandering).
- v8.53: campaign levels are "Level N" until beaten. The setting is revealed by the tonsil stone ("you have been in a mouth").
- v8.52:
  - fewer boxes (XP ×1.3, `LOOT_GAP` 70 s, Lateral Gene Transfer every 60–90 s)
  - SKIP for rarity
  - sprint needs a 0.2 s hold at the stick edge
  - the shield flares where it was hit
  - "element" wording removed
  - HUD moves; Immersive mode; new sample select
- v8.51: novelty weighting so every card turns up. v8.50: HUD rework, tap-to-cast Feats.
- v8.49: campaign Level 1, Achievement DNA, "damage type" wording.

## Balance numbers to know
- Wave mode boss strength: `CAMP.hp` [2.2, 13, 50, 160] and `CAMP.hit` [0.55, 0.75, 0.9, 1]. The mortal bot wins about 1 in 5 and mostly dies to the Pepsinator at wave 5. Soften further if the user finds wave 5 a wall.
- About 37 boxes per 9-minute wave run (it was 48).
- Campaign Level 1: difficulty clock `pt` [10, 200], par (bristles) 540 s, arena quotas 30/70/90/110, Tartar Colony with `campK` 0.65. A self-steering bot clears it in about 4 to 7 minutes.

## Open threads and ideas
- Level 2 (internal next: "Esophagus Descent"; never show that name) is not built. Its sample `s008` is a locked placeholder. Level select teases Level 3 and Level 4.
- Possible: a longer Level 1 (bigger map), and a body-map level select once more levels exist.
- Reece is a veteran tester friend of the user. The user shares run logs (copied from the game's run log) for balance feedback.
