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
- **Depth:** stone pillars and hanging chains, hooks and cages scroll at their own speeds behind the action, rock
  spikes hang in the foreground, and dust drifts through the torchlight. The floor is cobbled, with bones and
  glowing crystals buried in the rock (blast a crystal and its glow goes out) and shadow under overhangs.
- **Look:** torch-lit darkness where torches, explosions, magic, gates and loot light up the scene; fighters
  walk, blink, breathe, squash on landing, flash when hit and tumble when blasted; explosions flash the screen,
  throw bouncing rock and leave scorched craters and drifting smoke.
- **Interface:** styled like the dungeon's System AI: bracketed panels, a terminal font for its messages (which
  type themselves out), a timer ring that drains and pulses red near zero, health bars that drain with a trailing
  "damage" segment, and a LIVE audience counter that pops "+X" whenever the ratings jump.
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

### Floors

Pick a floor after choosing a mode. Against the CPU, clearing a floor lets you descend to the next.

| Floor | Look | Hazard | Boss | Third crawler |
| --- | --- | --- | --- | --- |
| 1: The Stairwell Halls | Torch-lit stone, spikes below | Pit rises from turn 14 | Ogre | Mongo |
| 2: The Flooded Catacombs | Mossy tombs, riddled with caves | Sewage rises from turn 6 | Catacomb Kraken | Mongo |
| 3: The Over City | Rooftops above a drop to the street | Wind 1.7x stronger | Gargoyle | Katia |
| 4: The Magma Forge | Black glass over lava | Molten rock falls from the ceiling | Magma Golem | Katia |

Mordecai offers a tip for each floor on the floor-select screen. Floors live in `Floors.kt`.

### Fighters

Each fighter has their own stats, a passive trait and two or three attacks (ammo in brackets, none means unlimited).

| Fighter | HP | Trait | Attacks |
| --- | --- | --- | --- |
| Carl | 110 | Explosives expert: +25% blast damage | Kick, Hob-Lobber, Satchel Charge (2) |
| Princess Donut | 80 | Always lands on her feet (no fall damage), jumps high | Magic Missile (two bolts, straight line), Potion Bomb |
| Mongo | 120 | Fast and a big jumper | Bite, Pounce (leaps at the target), Roar (2, pushes everyone nearby away) |
| Katia | 130 | Shapeshifter: half knockback | Heavy Punch, Crossbow, Barricade (2, raises a stone wall) |
| Goblin | 70 | Quick | Throwing Knife, Potion Bomb, Scatter Charge (2) |
| Hobgoblin | 100 | Drilled soldier | Spear, Shield Bash (huge knockback), Satchel Charge (1) |
| Ogre (boss, floor 1) | 150 | Slow, heavy | Boulder, Club, Ground Slam (2) |
| Catacomb Kraken (boss, floor 2) | 160 | Long reach, 60% knockback | Tentacle Lash, Ink Bomb, Water Spout (2) |
| Gargoyle (boss, floor 3) | 140 | Glides: no fall damage, huge jump | Stone Dive, Stone Shards, Screech (2) |
| Magma Golem (boss, floor 4) | 170 | Barely movable: 40% knockback | Lava Ball, Magma Fist, Eruption (2) |

### Loot boxes and spells

Boxes drop from fallen fighters and parachute in at random; walk into one to open it. Spells found inside join
the opener's weapon list for one use each.

| Box | Contents |
| --- | --- |
| Bronze Adventurer Box | 25 health |
| Silver Adventurer Box | One more limited attack, or a common spell |
| Gold Adventurer Box | A rare spell and 20 health |
| Legendary Adventurer Box | A legendary spell, 30 health and a refill |
| Fan Box | Sent by the audience each time viewers pass another 250 million; a spell and a note from a fan |
| Benefactor Box | Rare: two spells and 40 health, courtesy of a sponsor |

| Spell | Tier | Effect |
| --- | --- | --- |
| Healing Potion | Common | +50 health |
| Protective Shell | Common | Blocks the next hit |
| Blink | Common | Teleport to where the aim lands |
| Fireball | Rare | Big straight-flying blast |
| Magic Missile Storm | Rare | Seven bolts in a fan |
| Hob-Lobber Barrage | Rare | Five bombs drop from the ceiling on the spot you aim at |
| Gravity Well | Rare | Blast that drags everyone nearby into it |
| Earthquake | Legendary | Hurts and throws everyone else, cracks the floor |
| Tactical Nuke | Legendary | Enormous explosion |

The CPU opens boxes and uses spells too.

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
| `Entities.kt` | Fighter (`Worm`), species stats and loadouts, weapons and spells, gates, projectiles, loot boxes |
| `Floors.kt` | The four floors: look, terrain style, pit, hazards, rosters, Mordecai's tips |
| `MainActivity.kt` | Full-screen landscape activity |

Fonts: Cinzel, Cinzel Decorative and VT323, bundled in `app/src/main/assets/fonts/` under the SIL Open Font
Licence (licence texts alongside).

The Kotlin package is still `com.alienclay.worms` so the app installs over earlier test builds.
