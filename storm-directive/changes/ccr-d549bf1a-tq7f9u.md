## 2026-10-20 Narrator voices: one story, two looks (v10.43)
- Systems: narrator (voice10, show), ui, copy (data.js achievements, card quips, sponsors), sequences (seqreveal)
- Files: voice10.js, show.js, ui.js, data.js, seqreveal.js, style.css, tests/veilshot.js (new)
- What: Narrator messages now carry who is speaking. The Scientist shows as the plain lab panel with a "LAB LOG · 1B" header; the inner voice is a pitch-black cloud with a soft, breathing cosmic colour fringe and italic text. Both voices now show in Immersive mode (which hid every narrator line by default). Copy that broke "he works alone" is rewritten: Funding is now Data (no £), research grants and sponsors are things found around the empty lab, Peak viewers is Peak data, achievements, card quips, reward lines and three sample stories lose the doctor, staff, lawyers, Committee and announcer "!".
- Save data: none (achievement ids viewers1m and sponsor keep their keys).
- Hooks: ui.js sysmsg display sets box.dataset.who; show.js sysMsg gains optional 5th arg `who`; voice10.js vxPush adds `who` to the queued message.
- Risk: Immersive now shows narrator lines over the slide (about one every 20 s). SPONSORS now holds place names, so anything that prints a sponsor reads "Found in {place}".
