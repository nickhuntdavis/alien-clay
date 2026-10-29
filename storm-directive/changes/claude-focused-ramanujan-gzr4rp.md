## 2026-10-29 Remove the Narrator setting and HUD narration (v10.221)
- Systems: settings, narrative (show, voice10), ui
- Files: settings.js, show.js, voice10.js, tests/voicetest.js, tests/wstest.js (removed), tests/tools/guide.js
- What: the Narrator row is gone from Settings (saves fall back to the default pack). Narrator lines (Scientist, inner voice, Lab Tech chatter) no longer reach the HUD message box; gameplay notices (achievements, combos, hazards, level instructions) still show. Voice lines are still picked and logged, and the end screen and boss intro lines are unchanged. Immersive whispers (whisper.js) are now inert.
- Save data: SET.narrator is forced to 'system' on load; key kept.
- Hooks: none (early returns in sysLine, vxPush and narrator-headed sysMsg).
- Risk: the Scientist's wave-mode start line also carried the "clear a wave, open your DNA" instruction, which no longer shows.
