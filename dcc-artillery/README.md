# DCC Artillery

An unofficial, personal-use fan game: turn-based artillery for Android in the style of Worms, set in the
world of Matt Dinniman's *Dungeon Crawler Carl*. Not affiliated with or endorsed by the author or publisher,
and not for distribution.

## Play

- **1 player vs CPU** or **2 players (pass & play)** on one phone.
- **Crawlers** (Carl, Princess Donut, Mongo) against the **Floor Mobs** (Goblin, Hobgoblin, Ogre).
  100 HP each. Last team standing wins.
- 30 seconds per turn, then 4 seconds to retreat after attacking.
- Fully destructible terrain, random dungeon floor every match, wind that changes each turn.
- Falling into the pit is fatal. Long falls hurt.
- The System AI hands out snarky achievements for every knockout, and a live viewer count climbs with the carnage.
- **Loot boxes** drop from fallen fighters and parachute in at random. Walk into one to open it:
  Bronze (heal), Silver (extra Scatter or Satchel Charge), Gold (big heal plus both).
- **Sound:** all effects and the dungeon ambience are synthesised in code. The speaker button mutes them.

### Controls (landscape)

| Action | How |
| --- | --- |
| Walk | Hold the left/right arrows |
| Jump | JUMP button |
| Aim and attack | Drag back anywhere on screen (like a slingshot), release. Drag further for more power |
| Switch weapon | Tap the weapon box (bottom right) |
| Whole-map view | Magnifier button |
| Mute | Speaker button |
| Pause / menu | Pause button or the Back button |

### Weapons

| Weapon | Ammo | Notes |
| --- | --- | --- |
| Hob-Lobber | unlimited | Explodes on impact, pushed by wind |
| Magic Missile | unlimited | Instant straight shot |
| Kick | unlimited | Point blank. Big knockback, great for pit kills |
| Potion Bomb | unlimited | Bounces, 3 second fuse |
| Scatter Charge | 3 | Bounces, then bursts into 5 small bombs |
| Satchel Charge | 2 | Drops at your feet, 4 second fuse. Run! |

## Build

Requires JDK 17+ and the Android SDK (platform 34). Point `local.properties` at the SDK
(`sdk.dir=/path/to/android-sdk`) or set `ANDROID_HOME`, then:

```bash
cd dcc-artillery
./gradlew testDebugUnitTest    # game-logic tests (JVM, no device needed)
./gradlew assembleDebug        # APK at app/build/outputs/apk/debug/app-debug.apk
./gradlew installDebug         # install on a connected phone
```

The `DCC Artillery APK` GitHub Actions workflow builds the same APK on every push that touches
`dcc-artillery/` and attaches it to the run as an artifact.

## Code map

| File | Role |
| --- | --- |
| `Game.kt` | Rules, turns, physics, explosions, kicks, loot boxes (pure Kotlin, unit tested) |
| `Terrain.kt` | Pixel terrain generation, colouring and crater carving |
| `Ai.kt` | CPU player: replays candidate throws through the real physics and picks the best |
| `SystemAi.kt` | Achievement and loot box text |
| `GameView.kt` | Game loop thread, camera, touch controls, rendering and HUD |
| `CreatureArt.kt` | Draws the six fighters |
| `SoundFx.kt` | Synthesises the sound effects and ambience, plays them through a SoundPool |
| `Entities.kt` | Fighter (`Worm`), species, weapons, projectiles, loot boxes, particles |
| `MainActivity.kt` | Full-screen landscape activity |

The Kotlin package is still `com.alienclay.worms` so the app installs over earlier test builds.
