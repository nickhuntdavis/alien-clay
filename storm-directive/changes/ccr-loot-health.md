## 2026-10-25 Health and Membrane cards (v10.135)
- Systems: draft cards, defences (pdef), healing
- Files: membrane.js (new), index.html, ARCHITECTURE.md
- What: six new slotless draft cards (family 'up:'): max HP %, low-health regen, kill heal within the lifesteal pool, post-hit damage cut, overheal into Membrane, faster Membrane mend. The last two only appear with a Membrane.
- Save data: none
- Hooks: none in shared files (hookOn tick, kill, hurt, hurtMul; wraps healPlayer).
- Risk: more healing in the 'up' draft group; wave balance unsimmed beyond wave20 4 runs. Copy is TODO_COPY:hp_*_title / _desc (12).
