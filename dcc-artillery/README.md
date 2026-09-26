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
| Aim and attack | Drag back anywhere on screen (like a slingshot), release. Drag further for more power. Area attacks show their range as a circle |
| Switch weapon | Tap the weapon box (bottom right) |
| Whole-map view | Magnifier button |
| Mute | Speaker button |
| Pause / menu | Pause button or the Back button |

### Fighters

Each fighter has their own stats, a passive trait and two or three attacks (ammo in brackets, none means unlimited).

| Fighter | HP | Trait | Attacks |
| --- | --- | --- | --- |
| Carl | 110 | Explosives expert: +25% blast damage | Kick, Hob-Lobber, Satchel Charge (2) |
| Princess Donut | 80 | Always lands on her feet (no fall damage), jumps high | Magic Missile (two bolts, straight line), Potion Bomb |
| Mongo | 120 | Fast and a big jumper | Bite, Pounce (leaps at the target), Roar (2, pushes everyone nearby away) |
| Goblin | 70 | Quick | Throwing Knife, Potion Bomb, Scatter Charge (2) |
| Hobgoblin | 100 | Drilled soldier | Spear, Shield Bash (huge knockback), Satchel Charge (1) |
| Ogre | 150 | Slow, heavy | Boulder (big blast, short range), Club, Ground Slam (2, shockwave around him) |

Loot boxes top up the opener's own limited attacks.

### Gates

Glowing portals open in the air at random (up to three at once, each lasting a few turns). Anything
thrown through one is changed, once per gate:

| Gate | Effect |
| --- | --- |
| ×3 / +2 | Splits into three, or adds two more at different speeds |
| BIG / tiny | Bigger or smaller blast |
| FAST / SLOW | Speeds up or slows down |
| FLIP | Reverses direction |
| ? | Any of the above, or something stranger: turns into a different projectile, becomes a loot box, splits five ways, or explodes into healing |

The CPU doesn't plan around gates, so they can wreck its shots too.

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
| `Game.kt` | Rules, turns, physics, attacks, gates, loot boxes (pure Kotlin, unit tested) |
| `Terrain.kt` | Pixel terrain generation, colouring and crater carving |
| `Ai.kt` | CPU player: tries each of its fighter's attacks, replaying throws through the real physics |
| `SystemAi.kt` | Achievement and loot box text |
| `GameView.kt` | Game loop thread, camera, touch controls, rendering and HUD |
| `CreatureArt.kt` | Draws the six fighters |
| `SoundFx.kt` | Synthesises the sound effects and ambience, plays them through a SoundPool |
| `Entities.kt` | Fighter (`Worm`), species stats and loadouts, weapons, gates, projectiles, loot boxes |
| `MainActivity.kt` | Full-screen landscape activity |

The Kotlin package is still `com.alienclay.worms` so the app installs over earlier test builds.
