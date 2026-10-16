## 2026-10-16 Combos batch 3: eight more Weapon Combos for Armoury and Playpen weapons (v9.29)
- Systems: combos, weapons
- Files: combos5.js (new), combos.js, index.html, tests/combo5test.js (new), tests/run.sh, tests/tools/guide.js, tests/tools/copy/areas.js, ARCHITECTURE.md, GAME_GUIDE.md
- What: Bath Toys (Baby Rattle + Water Pistol), Hand, Foot and Mouth (Soft Play + Grubby Fingers, a splice), Hot Wax (Lava Lamp + Cradle Cap, a splice), Do Not Squeeze (Blood Blister + Lemon Squeezy), Paper Hanky (Paper Cut + Runny Nose), Swimming Gala (Whooping Cough + Sea Monkeys), Hog Wild (Greased Piglet + Head Lice, a splice), Pass the Parcel (Lard Lobber + Baby Shower). 24 combos now cover 44 of the 45 new weapons (Spirit Fingers has none).
- Save data: META.combos gains eight combo ids. Otherwise none.
- Hooks: combos.js comboFire -> combo5Fire, comboHit -> combo5Hit, comboTick -> combo5Tick.
- Risk: Do Not Squeeze clears a Blood Blister puddle's onEnd before popping it early. Hot Wax rewrites src, damage and explode on Cradle Cap flakes that cross a Lava Lamp blob. Balance: each combo's own damage in combo5test is about 0.4k to 10k per 25 s.

## 2026-10-16 Combos batch 2: eight more Weapon Combos for Armoury and Playpen weapons (v9.28)
- Systems: combos, weapons
- Files: combos4.js (new), combos.js, index.html, tests/combo4test.js (new), tests/run.sh, tests/tools/guide.js, tests/tools/copy/areas.js, ARCHITECTURE.md, GAME_GUIDE.md
- What: eight new combos, one per starting sequence, each pairing two Armoury/Playpen weapons that had none: Fertile Window (Egg White + Little Swimmers), Open Wide (Butter Knife + Cod Liver Oil), Bug Zapper (Carpet Shuffle + Lightning Bugs), Pick and Roll (Nose Goblins + Bogey Roller), Night Terrors (Boo-merang + Night Light), Blood Bank (Umbilical Cord + Leeches), Lunar Cycle (Period Drama + Ulcer Moons), Catch It, Bin It (Achoo + Wet Wipe). 16 combos now cover 28 of the 45 new weapons.
- Save data: META.combos gains eight combo ids. Otherwise none.
- Hooks: combos.js comboFire -> combo4Fire, comboHit -> combo4Hit, comboTick -> combo4Tick.
- Risk: Lunar Cycle rewrites Ulcer Moons' s.radius each frame while fused (as the Lava Lamp does its own); Blood Bank appends leeched enemies to the Cord's w.cords so they are drawn. Balance: each combo's own damage in combo4test sits at about 1k to 12k per 25 s, within batch 1's range.
