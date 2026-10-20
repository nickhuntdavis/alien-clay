## 2026-10-20 Inner voice says "we"; shape-shifting cloud; Immersive whispers (v10.44)
- Systems: voice (voice.js, voice10, new whisper.js), narrator copy (data.js LONGING_LINES, show.js), ui, docs (VOICE_GUIDE, voice_and_tone)
- Files: whisper.js (new), voice.js, data.js, show.js, ui.js, inspect.js, index.html, style.css, tests/wstest.js (new), tests/veilshot.js, ARCHITECTURE.md
- What: The inner voice now speaks as "we" (it and the sperm are a team): every consciousness line, sighting, status hint and campaign longing line is rewritten, and the canon in VOICE_GUIDE says so. Its black cloud shape-shifts (core and colour fringe morph out of step). In Immersive, Scientist and inner-voice lines no longer pop up: a small indicator appears (a black cosmic blob, or a LOG chip for the Scientist); tapping it reveals the line and runs the slide at 10% until the line is tapped or times out. Unread lines fade after 30 s.
- Save data: none.
- Hooks: ui.js sysmsg queue -> wsTake; inspect.js inspectMul -> wsMul; index.html whisper.js after voice10.js.
- Risk: In Immersive, a player who never taps misses the lines (by design). The 10% slow-down multiplies the game speed while a line is open; autorun keeps playing behind it.

## 2026-10-20 Narrator voices: one story, two looks (v10.43)
- Systems: narrator (voice10, show), ui, copy (data.js achievements, card quips, sponsors), sequences (seqreveal)
- Files: voice10.js, show.js, ui.js, data.js, seqreveal.js, style.css, tests/veilshot.js (new)
- What: Narrator messages now carry who is speaking. The Scientist shows as the plain lab panel with a "LAB LOG · 1B" header; the inner voice is a pitch-black cloud with a soft, breathing cosmic colour fringe and italic text. Both voices now show in Immersive mode (which hid every narrator line by default). Copy that broke "he works alone" is rewritten: Funding is now Data (no £), research grants and sponsors are things found around the empty lab, Peak viewers is Peak data, achievements, card quips, reward lines and three sample stories lose the doctor, staff, lawyers, Committee and announcer "!".
- Save data: none (achievement ids viewers1m and sponsor keep their keys).
- Hooks: ui.js sysmsg display sets box.dataset.who; show.js sysMsg gains optional 5th arg `who`; voice10.js vxPush adds `who` to the queued message.
- Risk: Immersive now shows narrator lines over the slide (about one every 20 s). SPONSORS now holds place names, so anything that prints a sponsor reads "Found in {place}".
