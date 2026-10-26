## 2026-10-26 Sperm key matches the Tackle Box key (v10.167)
- Systems: hud
- Files: buildbtn.js, style.css, eink.css
- What: the sperm HUD key takes its look from the same rules as the Tackle Box key (#spermBtn listed beside #armBtn in style.css and eink.css: 3 px themed border, corners, colours, Immersive translucency, landscape size), and its icon is a solid silhouette like the Tackle Box one. buildbtn.js keeps only its portrait Immersive position.
- Save data: none
- Hooks: none
- Risk: a branch restyling #armBtn in style.css or eink.css should add #spermBtn to new rules too.
