## 2026-10-25 Hidden sixth defences and Amoeba parked (B8, B9)
- Systems: enemies (roster), combat (defences), fight
- Files: roster.js (Callus, Water Bear, Amoeba rows), game.js (damageEnemy: `tun` and `noCrit` checks removed), fight.js (`thickLayers`, Shell ring display), data.js and foes2.js (legacy `tun`/`noCrit` flags removed), ENEMY_STATS.md, ENEMY_BEHAVIOUR.md
- What: Callus can be crit again and instead has one Shell layer with twice the usual layer hit points (`thickLayers`, read in `fightCd`). Water Bears no longer curl into a near-invulnerable tun. The Amoeba is parked (`w: 0`, `status: 'park'`) until its engulf is designed.
- Save data: none
- Hooks: none
- Risk: Water Bear is easier to kill below 30% health; Callus takes crits (balance unsimmed). Amoeba and Plasmodium (splits into Amoeba, already a cut candidate) no longer spawn from the director.
