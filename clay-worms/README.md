# Clay Worms

A Worms-style turn-based artillery game for Android, set on a crumbly alien clay planet.
Native Kotlin, no third-party libraries: a `SurfaceView` game loop drawing on `Canvas`.

## Play

- **1 player vs CPU** or **2 players (pass & play)** on one phone.
- Three worms per team, 100 HP each. Last team standing wins.
- 30 seconds per turn, then 4 seconds to retreat after firing.
- Fully destructible terrain, random map every match, wind that changes each turn.
- Falling into the water kills a worm; long falls hurt.

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
| Bazooka | unlimited | Explodes on impact, pushed by wind |
| Grenade | unlimited | Bounces, 3 second fuse |
| Cluster Bomb | 3 | Bounces, then splits into 5 bomblets |
| Shotgun | unlimited | Instant straight shot |
| Dynamite | 2 | Drops at your feet, 4 second fuse. Run! |

## Build

Requires JDK 17+ and the Android SDK (platform 34). Point `local.properties` at the SDK
(`sdk.dir=/path/to/android-sdk`) or set `ANDROID_HOME`, then:

```bash
cd clay-worms
./gradlew testDebugUnitTest    # game-logic tests (JVM, no device needed)
./gradlew assembleDebug        # APK at app/build/outputs/apk/debug/app-debug.apk
./gradlew installDebug         # install on a connected phone
```

The `Clay Worms APK` GitHub Actions workflow builds the same APK on every push that touches
`clay-worms/` and attaches it to the run as an artifact.

## Code map

| File | Role |
| --- | --- |
| `Game.kt` | Rules, turns, worm and projectile physics, explosions (pure Kotlin, unit tested) |
| `Terrain.kt` | Pixel terrain generation, colouring and crater carving |
| `Ai.kt` | CPU player: replays candidate shots through the real physics and picks the best |
| `GameView.kt` | Game loop thread, camera, touch controls, rendering and HUD |
| `Entities.kt` | Worm, projectile, particle and weapon types |
| `MainActivity.kt` | Full-screen landscape activity |
