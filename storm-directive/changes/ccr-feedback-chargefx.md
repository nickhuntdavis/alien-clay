## 2026-10-25 feedbackfx uses the shared charge-up look (v10.140)
- Systems: feedback fx, charge-up look
- Files: feedbackfx.js, NOTES.md, ARCHITECTURE.md
- What: reload arcs now show the damage type's charge-up look building inside the arc, and a status wearing off shows that look unwinding plus its release snap. The stand-in per-type puff code is deleted. chargefx.js is unchanged.
- Save data: none
- Hooks: none (feedbackfx hooks and rate limits unchanged)
- Risk: a reload now draws up to 4 drawChargeFx calls (one per reloading weapon); check frame rate on a phone.
