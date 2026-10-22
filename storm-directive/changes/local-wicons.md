## 2026-10-21 Weapon icons drawn from what each weapon does
- Systems: weapons, ui
- Files: wicons.js (new), index.html
- What: the 27 live weapons (the 24 plus the three Early Bird weapons) get their own icons, drawn from what they do (a dumbbell for Maximum Gains, a nappy for Nappy Mines, a moon over a puddle for Nocturnal Emission), replacing the generic gun shapes. Same grid as icons.js: 24 x 24, stroke 1.7, in the damage-type colour. Matches Figma "Weapon Icons v2".
- Save data: none.
- Hooks: none (index.html script tag after w24look.js).
- Risk: none for play. Signature slots that carry an old weapon id get the new icon too (ICON_OF[sigOf]).
- Not shipped: no APK built (local Mac has no SPAWN_KS_PASS or Android SDK). Ship from the cloud environment.
