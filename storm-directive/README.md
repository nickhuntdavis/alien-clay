# Storm Directive

Autorun, autogun bullet-storm roguelite for Android. You don't aim or (usually) steer: you program your ship with targeting and movement directives, then build it up through loot boxes.

**Install:** sideload `release/StormDirective.apk` (Android 5.0+). Enable "Install unknown apps" for your browser or file manager when prompted.

## Features

- **Autorun + autogun.** Up to 3 weapons and 2 spells fire on their own, each with its own cooldown, magazine and reload.
- **Programmable targeting directives** per weapon/spell: Nearest, Strongest, Weakest, Lowest Health, Highest Health, Highest Armour, Fastest, Furthest, Densest Cluster, Elites & Bosses, Shooters First, Random. Tap a slot to cycle, or pause for the full editor.
- **Autorun directives:** Kite, Collect, Orbit, Hunt, Hold, Defend. The pilot scores 16 escape directions against predicted enemy and bullet positions. Drag anywhere to steer manually.
- **Loot box on every level up:** pick 1 of 3 (new weapon, new spell, upgrade, power-up or fusion), with Common/Rare/Epic/Legendary rarities and rerolls. Elites drop loot boxes; bosses drop Epic+ caches.
- **23 weapons, 12 fusion weapons, 10 spells, 32 stackable power-ups, 6 tower types.** All upgradable to Lv 8.
- **Fusion:** two compatible weapons at Lv 4+ merge into a legendary weapon and free a slot (e.g. Flamer + Frost Lance = Steam Cannon, Railgun + Prism Beam = Annihilator).
- **Elemental reactions:** Thermal Shock, Steam Burst, Combustion, Toxic Arc, Superconduct, Resonance, Overload. Owning 2+ of an element unlocks a synergy bonus.
- **18 monster types + 3 bosses** with bullet-hell patterns (spirals, rings, fans, charges, blinks). Armour, healers, shielders, splitters, bombers, phasers, summoners, snipers.
- **Field power-ups:** Magnet, Nuke, Overdrive, Medkit, Shield, Stasis, Loot Box.
- **Tower defence: the Chrono Anchor.** A crystal at the centre of the arena that you must protect. Every 80 seconds siege waves pour out of 2 to 3 rifts and march on it along telegraphed lanes. Enemies drop **scrap**; spend it on 12 build pads (tap BUILD, or tap a pad in the world): Autocannon, Tesla Pylon, Cryo Spire, Mortar Nest, Stasis Clock (time runs at 35% in its field) and Repair Beacon. Towers upgrade to Lv 3, have their own targeting directives, and grow stronger over time. Standing near the Anchor heals you. The DEFEND autorun directive guards it and intercepts siege lines.
- **Time travel: Rewind and Paradox Echoes.** Tap REWIND to jump 4 seconds into the past (VHS-style rewind of the whole battle). Your future self does not vanish: it stays behind as a **Paradox Echo** that walks the erased timeline backwards, firing copies of your weapons, then collapses in a bullet-clearing blast. If you or the Anchor would die with a charge ready, Rewind triggers automatically. Charges refill from kills and bosses. The **Paradox Rifle** lands every hit twice (the second arrives from 1 second in the future), and Temporal Loop adds charges.
- **Visuals:** parallax nebula and star layers, a lit arena floor with pulse rings, dynamic light from explosions, soft scorch decals, drop shadows and shading on every body, additive glow on projectiles and enemy bullets, vignette, damage flashes and a minimap.
- Boss every 3 minutes; from 15:00 the **Storm Surge** raises enemy damage every minute.

## Project layout

```
storm-directive/
  web/                 The game (HTML5 canvas, no dependencies)
    js/data.js         All content: weapons, spells, fusions, passives, enemies, bosses
    js/game.js         Engine: simulation, combat, reactions, AI, spawning
    js/td.js           Chrono Anchor tower defence, siege rifts, Rewind and Paradox Echoes
    js/render.js       Rendering: parallax, lighting, shadows, glow, HUD, minimap
    js/ui.js           HUD, loot boxes, directive editor, menus
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
