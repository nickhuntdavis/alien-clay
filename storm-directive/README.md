# Spawn Storm

Autorun, autogun bullet-storm roguelite for Android. You are an alien spermatozoon in a race against four hundred million rival swimmers and the host's entire immune system. Grow strong enough (level 60) to break through the egg's membrane in the middle of the arena and be born. You don't aim or (usually) steer: you program your swimmer with targeting and movement directives, build it up through loot boxes, and a sardonic System narrates every mistake to millions of viewers.

**Install:** sideload `release/SpawnStorm.apk` (Android 5.0+). Enable "Install unknown apps" for your browser or file manager when prompted.

## Features

- **Rival champions race you to the egg.** Five named rivals (Big Steve, Chad Flagellum, Professor Wiggles, Lil' Zygo, Kevin) grow elsewhere on a much larger map, each with their own growth speed and temper. They zap monsters (stealing your XP), pick fights when they're close to your level, flee when hurt and regenerate, and give you a wide berth once you outgrow them. Their toughness tracks your recent damage output, so a rival your size is always a proper duel. If one reaches level 60 first it swims to the egg and starts breaking in: kill it before the membrane gives way or it's born instead of you ("BEATEN TO IT"). Killing one drops a Fan Box and about a level of XP; the host occasionally eliminates one off-screen. A race board under the minimap shows the standings, with rival dots on the minimap and pointers to anyone hunting you or breaking in.
- **Deliberate colour.** The world and the whole UI are greyscale. Colour means exactly one thing each: GFP green is you (your sperm, your shots, your echoes, your mind-controlled allies), red is anything that can hurt you (enemy bullets, acid, hits you take, low HP), gold is reward (loot, big XP, elites, charged mitochondria), and each rival wears its own dye. The UI adds two more, taken from patient-monitor conventions (every trace has its own fixed colour): monitor cyan for upgrades (anything that permanently changes your build: weapons, levels, branch perks, modifiers, power-up stats) and monitor magenta for pickups (temporary field power-ups and their active effects). Loot boxes are gold in the world and in the UI; card rarity shows as border weight rather than colour. The renderer enforces it: any other colour is drawn as grey.
- **Medical-device UI.** Styled on radiology workstations and patient monitors: black panels, 1px hairlines, square corners, monospace uppercase readouts, no glows or gradients. HP is a vital-sign module with a heart rate that climbs as you're hurt and a live ECG trace (your green; red when low; flat when you die). Radar-style minimap, elapsed-time readout, a lead "R" side marker as on a radiograph, film-sheet loot cards. Finished like real film: blue-black panels with uneven exposure and shimmering grain, whites with a little blue in them, and lines and letters that bleed slightly.
- **Glow only where light is emitted.** Fire and heat, electricity, arcane and time effects, fluorescent dye tags, laser beams and charged mitochondria glow. Bullets, needles, blades, drones, ice, poison, acid, XP, pickups, enemy bullets and every creature's body do not; physical shots are drawn solid with a dark edge. Colourless creatures are darker, with stronger halos, for contrast.
- **Looks like a real microscope.** The whole game is drawn as a live wet mount under positive phase contrast, the standard view for semen analysis: an even grey-green field brightest in the middle of the camera frame, counting-chamber grid lines, out-of-focus particles as soft discs with dark diffraction rings, and every object darker than the fluid with a bright halo round its edge. Sperm have real proportions (flat oval head with a paler acrosome, short midpiece, a hair-thin tail about ten head-lengths long). You are GFP-tagged (your acrosome glows green); each rival wears its own fluorescent dye. White blood cells show lobed nuclei and granules; amoebas have a clear rim, granular insides, a nucleus, a pulsing contractile vacuole and food vacuoles; the egg is a proper oocyte (granular ooplasm, germinal vesicle, glassy zona pellucida, polar body, corona radiata and cumulus). A CASA-style overlay (as in computer-assisted sperm analysis) draws colour-coded motion tracks and detection brackets, with a 20 um scale bar and objective readout. The UI is greyscale imaging-software styling.
- **Weapon upgrade trees.** Every weapon has a fixed tree (see it in the Armoury): at Lv 3, 5 and 8 you choose one of two branch perks (for example Drill Tips or Rubber Rounds, Static Charge or Finisher, Overdrive or Chain Reaction). 25 perks in all, from stat boosts to new effects (homing, fragmenting, arcs, venom, ignite, freeze, payload explosions, leech, big-game damage, kill explosions). Each weapon level is also worth +35% damage (was +25%).
- **Loot boxes.** A box on every level up (Bronze or better), plus about 45 more on a run to level 60: Fan Boxes from kills (Gold or better, at most one every 9 seconds; elites and big amoebas are the usual source), Boss Boxes, rival kills and achievement boxes. Once the egg is yours to break, half of your weapons' target picks in range go to it.
- **Amoebas.** Big, slow, spongy engulfers (Amoeba from 1:10, Plasmodium from 4:00) that are immune to knockback, knit themselves back together, and absorb any smaller monster they touch, taking its health, bulk and XP. Leave one alone and it gets enormous; kill a big one for a Fan Box and all the XP it swallowed. A Plasmodium splits into amoebas when it dies.
- **Swim physics.** Your head can only turn so fast, thrust drops mid-turn, and sideways momentum drifts off instead of stopping dead, so sharp turns carve arcs (you pivot faster when nearly stopped). **Traction** is a stat: Sticky Cilia and Hydrodynamic Head upgrades sharpen turns and cut drift. Tails are physical chains that drag and sweep behind every swimmer. You grow 1.5% bigger every level (your hitbox grows half as fast).
- **Terrain.** The womb is full of things: Cartilage Nodules (solid; every shot, yours and theirs, bounces off), Mitochondria (solid; soak up shots and vent an ATP Burst when full, which hits monsters, wipes bullets and gives you an ATP rush if you're close), Acid Crypts (burn anything that touches them and melt shots), Cilia Beds (shove bodies and bend shots outwards), Tubal Currents (carry everything along) and Lubricant Slicks (your grip drops to 30%, so you drift). The autopilot steers around the dangerous ones.
- **Depth of field.** Background layers blur by depth, debris drifts out of focus above the focal plane, and the screen edges get a gentle lens blur (toggle in the pause menu).
- **Win by being born.** At level 60 the egg opens up: its membrane fights back with bullet rings, aimed volleys and immune defenders while every rival rushes in, and it gives way at most 2.5% per second, so the finale is always a proper fight. Break it for the victory screen. Your best time to birth is saved.
- **Autorun + autogun.** Weapons and spells fire on their own, each with its own cooldown, magazine and reload. You start with 3 weapon slots and grow new ones at levels 15, 30 and 45 (6 in total); each new slot comes with a box of three new weapons. Your swimmer visibly grows as you level up.
- **Programmable targeting directives** per weapon/spell: Nearest, Strongest, Weakest, Lowest Health, Highest Health, Highest Armour, Fastest, Furthest, Densest Cluster, Elites & Bosses, Shooters First, Random, Revenge.
- **Armoury:** tap any weapon slot to open it. Tabs for every slot (locked ones show the level they unlock at), stat tiles, level pips, the 3 modifier slots with their power, a directive grid with a one-line explanation of each (per-barrel for the Committee Cannon), fusion partners and progress, and Recycle (frees the slot for 2 rerolls).
- **Autorun directives:** Kite, Collect, Orbit, Hunt, Hold, Nest. The pilot scores 16 escape directions against predicted enemy and bullet positions. Drag anywhere to steer manually.
- **Loot box on every level up:** pick 1 of 3 (new weapon, new spell, upgrade, power-up or fusion), with Bronze/Silver/Gold/Legendary rarities and rerolls. Elites drop loot boxes; bosses drop Gold+ boxes.
- **34 weapons, 15 fusion weapons, 10 spells, 41 stackable power-ups, 11 modifiers, 6 cursed cards.** All upgradable to Lv 8.
- **Modifiers** install into one weapon (3 slots each), with power set by the card's rarity. Picking one you already have powers it up (to a cap). Seeking, Splitting (shots shatter into shards on first hit), Orbiting (shots circle you eating enemy bullets, then launch), Growing (shots swell in size and damage as they fly), Boomerang, Ricochet, Freezing, Exploding, Mind Control (monsters fight for you, up to 6 at once), Element Swap, Shrapnel.
- **Show-season weapons:** Bullet Siphon (eats enemy bullets as ammo), Committee Cannon (3 barrels, 3 directives), Grudge Rifle (hunts whatever last hurt you, triple damage, REVENGE directive), Wake Blade (your flight path cuts), Scrap Cannon (fires your scrap), Mimic Core (copies the last dead shooter's pattern), Parasite Seeder (infected corpses become turrets), Thermal Lance (heat instead of ammo, vents a fireball), Tether Coil (leashes two monsters and slams them together), Gacha Blaster (every magazine rolls Bronze to Legendary), Prequel Launcher (explosion first, shell flies back afterwards). New fusions: Hailreturn, Plague Trail, Salvage Barrage.
- **New power-ups:** Last Word, Tactical Reload, Focus Lock, Overkill Transfer, Crossfire Protocol, Momentum, Anchor Link, Future Rounds, Echo Inheritance. **Cursed cards** give big boons with real downsides.
- **The Show:** a snarky System announcer, 38 achievements (some with real rewards: loot boxes, rerolls, scrap, healing), a live viewer counter, and sponsors who drop gifts at viewer milestones. Loot boxes come in Bronze, Silver, Gold and Legendary.
- **Fusion:** two compatible weapons at Lv 4+ merge into a legendary weapon and free a slot (e.g. Flamer + Frost Lance = Steam Cannon, Railgun + Prism Beam = Annihilator).
- **Elemental reactions:** Thermal Shock, Steam Burst, Combustion, Toxic Arc, Superconduct, Resonance, Overload. Owning 2+ of an element unlocks a synergy bonus.
- **Fewer, stronger enemies:** about half as many monsters on screen, each bigger and tougher, getting steadily nastier until 15:00.
- **18 monster types + 3 bosses** with bullet-hell patterns. Rival swimmers (Sprinters, Headbutters, Quantum and Ghost Swimmers, the armoured Alpha Swimmer, Spermlet swarms) and the immune system (Macrophages, Antibodies, Killer T-Cells, Mitotic Cells that split, Acid Bubbles, Nurse Cells, Mucus Walls, Cytokine Casters, Mother Cells, Enzyme Spires). Bosses: the Macrophage Queen, the Antibody Colossus and the Immune Eye.
- **Field power-ups:** Magnet, Acid Flush, Adrenaline, Glucose Hit, Shield, Stasis, Loot Box.
- **The egg's glow** heals you while you stay near it; the NEST autorun directive keeps you there.
- **Time travel: Rewind and Paradox Echoes.** Tap REWIND to jump 4 seconds into the past (VHS-style rewind of the whole battle). Your future self does not vanish: it stays behind as a **Paradox Echo** that walks the erased timeline backwards, firing copies of your weapons, then collapses in a bullet-clearing blast. If you would die with a charge ready, Rewind triggers automatically. Charges refill from kills and bosses. The **Paradox Rifle** lands every hit twice (the second arrives from 1 second in the future), and Temporal Loop adds charges.
- **Visuals:** living-tissue parallax (fluid, drifting cells, fibres), a warm womb floor that pulses with a heartbeat, a pearly egg that cracks as you break in, sperm with whipping tails, dynamic light from explosions, soft scorch decals, drop shadows and shading on every body, additive glow on projectiles and enemy bullets, vignette, damage flashes and a minimap.
- Boss every 3 minutes; from 15:00 the **Immune Surge** makes enemies tougher and deadlier every minute.

## Project layout

```
storm-directive/            (the game is now called Spawn Storm)
  web/                 The game (HTML5 canvas, no dependencies)
    js/data.js         All content: weapons, spells, fusions, passives, enemies, bosses
    js/game.js         Engine: simulation, combat, reactions, AI, spawning
    js/td.js           The egg's healing glow, Rewind and Paradox Echoes
    js/arsenal.js      Show-season weapons, weapon-wide power-ups, modifier procs, mind-controlled allies
    js/show.js         The System announcer, achievements, viewers, sponsors
    js/rivals.js       Rival champions: growth, AI, the race to the egg
    js/terrain.js      Obstacles: collisions, shot interactions, zones, ATP bursts
    js/render.js       Rendering: parallax, lighting, shadows, glow, HUD, minimap
    js/ui.js           HUD, loot boxes, Armoury, menus
  android/             Native WebView shell (Java, no AndroidX) that bundles web/ as assets
  release/             Prebuilt APK
```

## Build

Play in a browser: open `web/index.html` (WASD/arrows to steer, Esc to pause).

Build the APK (JDK 17+, Android SDK with platform 34):

```bash
cd storm-directive/android
echo "sdk.dir=/path/to/android-sdk" > local.properties
./gradlew assembleRelease
# -> app/build/outputs/apk/release/app-release.apk
```

The release build is signed with the local debug key so it installs directly. APKs built on different machines have different keys, so uninstall before installing one from another machine. GitHub Actions (`.github/workflows/storm-directive-apk.yml`) builds the APK on every push that touches `storm-directive/`.
