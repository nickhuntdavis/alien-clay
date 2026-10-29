## 2026-10-29 Feat page shows Lv x/5
- Systems: weapons (level display), ui (Tackle Box Feat page)
- Files: weapons24.js
- What: wTierMax returns 5 for v10 Feats, so the Feat page header reads Lv 1/5 with five squares, matching the loadout row and the real cap.
- Save data: none.
- Hooks: none.
- Risk: anything else that reads wTierMax for a Feat (wLvText in the slot tooltips) now says /5. Weapons unchanged.

## 2026-10-29 Sequence stories trimmed, last narrator drift fixed (v10.223)
- Systems: sequences, voice, ui, tutorials, bosses (float text only), campaign levels (banner only)
- Files: seqreveal.js, reborn.js, redtail.js, twins.js, holy.js, spoon.js, dnadrop.js, ui.js, weird.js, intro.js, game.js, levels.js, statusintro.js, bosspack.js, render.js, rivals.js, voice_and_tone.md
- What: the eleven v9 sequence stories are shorter and speakerless (no "my handwriting", no "Mine"); Prawn Again's gift line now matches the mechanic (every 45 s, not once a run). The three sequence quotes that spoke (Prawn Again, Redtail, Twins) are captions, and the Twins tag is SOLD AS A PAIR. The remaining first-person and "the scientist"/"the doctor" lines are captions, "bloke" is gone, and HUD alerts use a colon instead of "!". voice_and_tone.md 8B now lists what is left (enemy taunts as the deliberate exception, ENEMY_INTRO tips, the persona docs, dead Sample 9 lines).
- Save data: none.
- Hooks: none.
- Risk: none in code paths; text only. seqtest fails before and after (pre-existing unlock-order check).

## 2026-10-29 Copy pass: speakerless captions (v10.222)
- Systems: voice, ui (mutation cards, Meet card), campaign, data
- Files: voice.js, data.js, waves.js, ui.js, campaign.js, rivals.js, tutorial.js, mutations.js, samples10.js, meetsample.js
- What: every narration line that spoke in the first person, named a person in the room or shouted now reads as a flat log caption (voice_and_tone.md). About 55 voice.js lines, 20 SYSTEM_LINES, the waves.js SCIENTIST pool, the quoted dish intros, all 35 mutation flavour lines, two STATUS_HINT lines and five sighting lines were rewritten; the loud Tier 2 and 3 lines keep their volume without a speaker. The Meet card's play-style line and button are filled (MEET_STYLE, "TO THE SLIDE"). Copy written by Claude at the user's request.
- Save data: none.
- Hooks: none.
- Risk: tests that match exact narration text (none found) would break; voicetest, mutstest, samplestest, drafttest, quick pass.

## 2026-10-29 Persona cut: one caption voice, no characters (v10.221)
- Systems: voice, settings, ui (cards, sample screens), campaign, data
- Files: cardvoice.js (deleted), giftvoice.js (deleted), tests/tools/copy/cardvoice.py and giftvoice.py (deleted), index.html, voice.js, voice10.js, show.js, settings.js, data.js, feats10.js, samples10.js, meetsample.js, weapons24.js, ui.js, campaign.js, rivals.js, tutorial.js, waves.js, tests/voicetest.js, tests/wstest.js, tests/veilshot.js, tests/tools/guide.js, voice_and_tone.md, ARCHITECTURE.md, CLAUDE.md
- What: the game has a tone, not characters (voice_and_tone.md rewritten). The per-sample card quip line is gone (cards show the name and what they do; weird-box and stat-card quips stay). The Narrator setting and its Documentary, Midwife and Mums packs are gone. The inner voice is gone: voice.js keeps one pool per event (the old `sci` key), sightings have one line, `LONGING_LINES` and the campaign's egg sponsor line are deleted, the end screen shows one line. Sample intro quotes (`line`) are gone from the sample screen and the Meet card; the Feats' quoted gift lines are gone. Every caption header reads LAB LOG. Rival quotes and KILL_LINES stay by the user's decision.
- Save data: SET.narrator is no longer read (stale values are harmless). None added.
- Hooks: none added. ui.js applySettings no longer calls applyNarrator; show.js sysPool reads SYSTEM_LINES only.
- Risk: any branch that adds cardvoice.js rows, CARD_VOICE keys, `con` pools, a narrator pack or a sample `line` field will conflict or go unused. feats10.js `line` fields were removed from every Feat def. veilshot.js and statuptest fail before and after this change (pre-existing).
