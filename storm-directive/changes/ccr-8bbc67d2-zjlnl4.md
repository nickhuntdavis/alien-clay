## 2026-10-27 Field Guide rebuilt for v10 (v10.185)
- Systems: help (Field Guide, damage type card)
- Files: codex10.js (new), index.html, ARCHITECTURE.md, tests/codex10test.js (new), tests/codexsamples.js
- What: the Field Guide lists only what a v10 run can meet. RULES: the seven v10 damage types with their bar or status (GLOSSARY text), the 21 v10 reactions (? until set off), defences, attack types and combo twists on live type pairs; the v9 reaction list, retired types and Rewind are gone. ENEMIES lists only enemies that can still spawn; BOSSES shows the v10 strength and signature lines; SECRETS drops five unreachable ones; MUTATIONS lists the sperm passive cards the draft deals (the 61 genes.js mutations can no longer be had); SEQUENCES no longer repeats each trait. The damage type card uses the same v10 table. 14 TODO_COPY placeholders (type blurbs, new section titles and hints).
- Save data: META.cdxMut added (mutation card ids taken, for the MUTATIONS tab).
- Hooks: none in shared files (replaces UI.codexHtml and INSPECTOR.elem; wraps each live mutation card's apply).
- Risk: other branches editing ui.js codexHtml will no longer show (codex10.js replaces it). Mutation counts start at 0 for everyone (no history before META.cdxMut).
