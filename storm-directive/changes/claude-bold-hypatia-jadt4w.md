## 2026-10-19 Flaky tests fixed; empty mutation screen no longer sticks (v10.35)
- Systems: mutation drops, draft, tests
- Files: draft.js, tests/perf18.js, tests/eggtest.js, tests/autoruntest.js
- What: a mutation box now opens only if a mutation can still be taken (draft.js draftBox); several strands queued while the Genome filled up used to open an empty mutation screen that stuck the run. Tests: perf18 goes through v10Box like the main loop and times 300 play frames (it could time none); eggtest's rival break-in runs unarmed (anything of yours hitting the rival stops it gnawing); autoruntest clears terrain properly (`G.terrain` is { list, grid }: 85 to 102 pieces were left in and pushed you off HOLD and ORBIT).
- Save data: none.
- Hooks: none.
- Risk: none.
