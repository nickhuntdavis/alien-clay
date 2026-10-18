## 2026-10-18 Soul damage renamed Alien (v10.20)
- Systems: damage types, chemistry, ui, weapons, samples, docs
- Files: data.js, chem.js, mutations.js, tutorial.js, glossary.js, fight.js, wup3.js, wup6.js, voice.js, index.html and others (text only), tests, GAME_GUIDE.md, redesign docs/*
- What: the "Soul" damage type is now "Alien" in every player-facing string, comment, test message, guide and redesign doc. Reaction names follow (Alien Rot, Alien Erosion). Pun names stay: Soulmate Signal, Old Soul, Soul Searching, Soul Purpose, Soul Scatter, Twin Soul.
- Save data: none. Internal id stays `soul` (ELEMENTS.soul, `bars.soul`, `t_soul`, `soulrot`, `v_soul_proj`), so saves and META.offered are untouched. Redesign decision 19 now plans `soul` -> `alien` at the id rename (clash check: sample id `alien`, enemy id `alien`, family `alien` in weapons24.js are separate namespaces).
- Hooks: none.
- Risk: any code that compares display names to the string 'Soul' (needType display arg only; checked).
