## 2026-10-16 Combos batch 2: eight more Weapon Combos for Armoury and Playpen weapons
- Systems: combos, weapons
- Files: combos4.js (new), combos.js, index.html, tests/combo4test.js (new), tests/run.sh, tests/tools/guide.js, tests/tools/copy/areas.js, ARCHITECTURE.md, GAME_GUIDE.md
- What: eight new combos, one per starting sequence, each pairing two Armoury/Playpen weapons that had none: Fertile Window (Egg White + Little Swimmers), Open Wide (Butter Knife + Cod Liver Oil), Bug Zapper (Carpet Shuffle + Lightning Bugs), Pick and Roll (Nose Goblins + Bogey Roller), Night Terrors (Boo-merang + Night Light), Blood Bank (Umbilical Cord + Leeches), Lunar Cycle (Period Drama + Ulcer Moons), Catch It, Bin It (Achoo + Wet Wipe). 16 combos now cover 28 of the 45 new weapons.
- Save data: META.combos gains eight combo ids. Otherwise none.
- Hooks: combos.js comboFire -> combo4Fire, comboHit -> combo4Hit, comboTick -> combo4Tick.
- Risk: Lunar Cycle rewrites Ulcer Moons' s.radius each frame while fused (as the Lava Lamp does its own); Blood Bank appends leeched enemies to the Cord's w.cords so they are drawn. Balance: each combo's own damage in combo4test sits at about 1k to 12k per 25 s, within batch 1's range.
