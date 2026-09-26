# Cryptid Clash

A turn-based artillery game for Android, in the style of Worms, fought between the world's most
elusive creatures on a misty, moonlit island.
Native Kotlin, no third-party libraries: a `SurfaceView` game loop drawing on `Canvas`.

## Play

- **1 player vs CPU** or **2 players (pass & play)** on one phone.
- **Team Bigfoot** (Bigfoot, Mothman, Chupacabra) against **Team Nessie** (Nessie, Yeti, Jersey Devil).
  100 HP each. Last team standing wins.
- 30 seconds per turn, then 4 seconds to retreat after firing.
- Fully destructible terrain, random map every match, wind that changes each turn.
- Falling into the loch is fatal, and something big surfaces to take a look. Long falls hurt.
- Every knockout is recorded as a blurry photo.

### Controls (landscape)

| Action | How |
| --- | --- |
| Walk | Hold the left/right arrows |
| Jump | JUMP button |
| Aim and fire | Drag back anywhere on screen (like a slingshot), release to fire. Drag further for more power |
| Switch weapon | Tap the weapon box (bottom right) |
| Whole-map view | Magnifier button |
| Pause / menu | Pause button or the Back button |

### Weapons

| Weapon | Ammo | Notes |
| --- | --- | --- |
| Boulder | unlimited | Explodes on impact, pushed by wind |
| Glowing Egg | unlimited | Bounces, 3 second fuse |
| Egg Clutch | 3 | Bounces, then hatches 5 small eggs that burst on impact |
| Camera Flash | unlimited | Instant straight shot |
| Road Flare | 2 | Drops at your feet, 4 second fuse. Run! |

## Build

Requires JDK 17+ and the Android SDK (platform 34). Point `local.properties` at the SDK
(`sdk.dir=/path/to/android-sdk`) or set `ANDROID_HOME`, then:

```bash
cd cryptid-clash
./gradlew testDebugUnitTest    # game-logic tests (JVM, no device needed)
./gradlew assembleDebug        # APK at app/build/outputs/apk/debug/app-debug.apk
./gradlew installDebug         # install on a connected phone
```

The `Cryptid Clash APK` GitHub Actions workflow builds the same APK on every push that touches
`cryptid-clash/` and attaches it to the run as an artifact.

## Code map

| File | Role |
| --- | --- |
| `Game.kt` | Rules, turns, worm and projectile physics, explosions (pure Kotlin, unit tested) |
| `Terrain.kt` | Pixel terrain generation, colouring and crater carving |
| `Ai.kt` | CPU player: replays candidate shots through the real physics and picks the best |
| `GameView.kt` | Game loop thread, camera, touch controls, rendering and HUD |
| `CreatureArt.kt` | Draws the six cryptids |
| `Entities.kt` | Cryptid (`Worm`), species, projectile, particle and weapon types |
| `MainActivity.kt` | Full-screen landscape activity |

The Kotlin package is still `com.alienclay.worms` so the app installs over earlier test builds.
