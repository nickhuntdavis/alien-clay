## 2026-10-19 Panic Button and Little Prick: real previews, tabbed branch screens, a scene per branch (v10.35)
- Systems: bldemo (new), sidemo, screens
- Files: bldemo.js (new), sidemo.js, index.html
- What: the other two baseline weapons get the Standard Issue treatment. Panic Button's preview marks the densest cluster in reach, fills a warning for 0.45 s and blasts it (3 to a magazine); Little Prick fires needles that stack Bleed (red pips, drips, tick numbers) and leave blood pools. Their tier screens open in the Weapon Draft tabs, and each of their 30 branch cards plays its own scene. sidemo.js is now a shared engine: any PV_OWN entry with a flags table gets the tabbed screen.
- Save data: none.
- Hooks: none new (PV_OWN entries; sidemo.js sivDraw gained under/over/cell/me layers and sivDamage a kill hook).
- Risk: preview only, no combat change. 'wup' boxes with only one of these three weapons ready now open as that weapon's fork.
