# Handoff notes (keep short; update at the end of each session)

## Current state
- Version v8.67 (versionCode 217), branch `claude/autorun-bullet-storm-game-blptu8` (merged from session branches). All suite tests pass.
- The Weapon Atlas artifact lives at https://claude.ai/artifact/LBga1dJ3q2QyAX1uee8Ef9. It was built from the old scratchpad (`weapon-atlas.html` plus a data generator), which is now lost. To update it, read it back with the Artifact tool and republish to that URL.

## Recent changes (newest first)
- v8.67: developer mode (tap the samples title 5 times) adds an UNLOCK EVERYTHING card beside the Lab Bench (`devUnlockAll` in debug.js; tap twice). It sets every unlock, discovery and record, rank III sequences, all grants, Immune Response max, wave mode beaten, levels named, and +100,000 DNA (Gene Bank ranks left to buy). `META.devAll` opens every sequence, including Redtail's 20-runs gate, without faking run logs. Test: `devall`.
- v8.66 (from a user run log: easy until the Immune Eye at wave 10, then dead in 40 s): wave mode waves 1 to 11 start harder (`CAMP.early` +12% enemies, `CAMP.earlyPT` +45 s on the difficulty clock, both fading out by wave 12 via `campEarly`); the Eye glares once per cycle (patterns blink, glare, flower, doubleSpiral). A +30% enemy-count version made the bot stronger (more XP), so the clock carries most of it. Sim: 2 wins of 5, deaths at waves 5, 15 and 20.
- v8.60 to v8.65: health bar and stamina ring visuals, zoom up to 5x.
- v8.59:
  - Lateral Gene Transfer is junk DNA (`junk.js`): an ordinary on-screen enemy wears a white helix, and killing it within 30 s absorbs a small power tied to that enemy type (`JUNK_POWERS`, 30 of them, up to 3 stacks). It comes every 40 to 55 s, and only during waves in the dish. The floating vesicle is gone. Mutations stay, but only via splice SKIP and campaign stashes.
  - Stain grants (`grants.js`): permanent colour, once ever. Personal stain (your swimmer) floats by the egg; Tracer Dye (shots, weapon effects, damage types) comes at level 5; Gentian Violet (power-ups) at level 10. Switch them in the pause menu (`META.grants`/`grantOff`). The GFP card and the end-of-run "keep a stain" are gone. H&E no longer colours power-ups. Your swimmer (sequence marks included) is grey until the first grant.
  - Egg: no arrow until met (`META.eggMet`) or ready; a card on the first approach (`eggMeetTick`).
  - Waves: banners hide what's in them; from wave 4 the newcomers come from a shuffle of the next 6 unmet types (`CAMP.fixedWaves`/`drawFrom`).
  - Spotlight: the crowd eases off and drifts sideways for 4 s only when an intro fires (`G.introBack`). The dish no longer runs the race-mode spotlight, which had been spotlighting types that weren't in the wave.
- v8.58: Incompatible Viral Load renamed Pub Crawl; weapons keep damage-type colours, others take the Primary Sequence colour (`weaponColours` in meta.js); loot card titles coloured by damage type; Chonker is just fat (no plates, no chin); head squash and stretch on the player (`headSquash` in render.js); only the first status card says where the chips are.
- v8.57 (build): release APKs are now signed with the fixed `android/spawnprawn.keystore`. The v8.56 debug key was lost, so installing v8.57 needs one uninstall (it wipes the save); after that every build installs over the last.
- v8.57: copy pass for two frames. Dish and race modes are the scientist's forced-evolution experiment: the narrator is the LAB TECH, viewers are lab Funding (£), sponsors are research grants, Fan DNA is Donor DNA. The campaign (`lvOn()`) uses an INNER VOICE (`LONGING_LINES` in data.js, via `sysPool`) obsessed with the egg, and the meter shows as Devotion. Also: Voodoo→Histamine (status swollen), MAG→LOAD, Storm Surge→Fever Pitch, Relic→Trophy, Codex→Field Guide, Armoury→Tackle Box, Celestial→Immaculate, Bounty→Tagged Specimen, Chrono→Body Clock. Internal ids unchanged.
- v8.58: Settings tabs fixed (Data tab wiped the tab handlers); boss rewards open at once in wave mode; Feats card after your first Feat; first-time cards for Grudge, tethers, allies and each terrain type; reaction card names the two types; bigger card kickers; bottom health bar (also in Immersive); near-invisible stamina ring; head squash and stretch. APK builds here need `ANDROID_HOME=/tmp/claude-0/sdk` (installed via sdkmanager; not persistent).
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
- v8.59 sim (`wave20.js 4 mortal`, before the v8.58 merge): 2 wins of 4, deaths at waves 15 and 20. That is the top of the bot band. If humans find it easy, slow junk DNA (`JUNK.every`) first.
- Campaign Level 1: difficulty clock `pt` [10, 200], par (bristles) 540 s, arena quotas 30/70/90/110, Tartar Colony with `campK` 0.65. A self-steering bot clears it in about 4 to 7 minutes.

## Open threads and ideas
- Level 2 (internal next: "Esophagus Descent"; never show that name) is not built. Its sample `s008` is a locked placeholder. Level select teases Level 3 and Level 4.
- Possible: a longer Level 1 (bigger map), and a body-map level select once more levels exist.
- Reece is a veteran tester friend of the user. The user shares run logs (copied from the game's run log) for balance feedback.
