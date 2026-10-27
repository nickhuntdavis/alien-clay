## 2026-10-27 Field Guide COMBOS tab shows the weapon fusions (v10.189)
- Systems: help (Field Guide)
- Files: codex10.js, ARCHITECTURE.md, tests/codex10test.js
- What: the COMBOS tab lists the 21 weapon fusions (WF_LIST: name, the two weapons, what it does, fused this run) instead of the retired combos and super combos; the retired combo twists leave RULES. The header counts Fusions.
- Save data: META.cdxWf added (fusion ids made, for the COMBOS tab).
- Hooks: none in shared files (wraps wfusion.js wfFuse from codex10.js).
- Risk: fusion counts start at 0 for everyone (no history before META.cdxWf). TODO_COPY:cdx_wf_hint open; the fusion names and text are still wfusion*.js placeholders.
