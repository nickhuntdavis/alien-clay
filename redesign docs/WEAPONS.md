# Weapons (all of them)

Every weapon in the redesign, in one place, 17 Oct 2026. Three groups, plus which weapon each sample starts with (section 4):

1. **Matrix weapons (42):** the v10 baseline, one per attack type × damage type. Source: `V10_NAMES` in `storm-directive/web/js/v10.js` on branch `claude/zealous-clarke-i26iot` (not yet on `main`). Descriptions are the in-game text.
2. **Signature weapons (26):** originals brought back (and five Fire drafts), each a matrix slot plus one signature behaviour. Full detail: `SIGNATURE_WEAPONS.md`.
3. **Parked originals (28):** the rest of the original game's weapons, with why they are not in the redesign (yet). Full original detail: `storm-directive/GAME_GUIDE.md` (describes the shipped game).

Rules: `COMBAT_MATRIX.md` section 13 (the six attack types), `MODIFIERS.md` (how attacks move and repeat), `COMBAT_MATRIX.md` sections 11 and 12 (formulas, signature rules). When a weapon changes, change it here and in its source doc in the same commit.

## Totals

| Damage type | Matrix | Signature | Total |
| --- | --- | --- | --- |
| Force | 6 | 5 | 11 |
| Acid | 6 | 2 | 8 |
| Static | 6 | 2 | 8 |
| Mucus | 6 | 3 | 9 |
| Blood | 6 | 4 | 10 |
| Soul | 6 | 4 | 10 |
| Fire | 6 | 6 | 12 |
| **All** | **42** | **26** | **68** |

## Open naming issues

- **Soul Purpose** is both the Soul Burst matrix weapon (M34) and the Force + Soul reaction. One needs a new name.
- **Snot Trap** (M24) was "Sticky Situation" in v10 code; the code still needs the rename.
- **Pub Crawl** (S3) ships as "Skid Mark" today.

## 1. Matrix weapons (42)

| # | Weapon | Damage type | Attack type | Description | Note |
| --- | --- | --- | --- | --- | --- |
| M1 | Nutcracker | Force | Contact | Smacks nearby enemies with enough force to make them reconsider their life choices. |  |
| M2 | Knuckle Dragger | Force | Projectile | Fires a heavy impact shot. Subtlety was never an option. |  |
| M3 | Broadside | Force | Spread | Fires a fan of blunt impact pellets. A little force goes a long way. A lot goes further. |  |
| M4 | Premature Detonation | Force | Burst | Releases a shockwave around the impact point. Timing is everything. Apparently. |  |
| M5 | Hard Press | Force | Beam | Projects a force beam that shoves enemies backwards. Apply pressure. Continue applying pressure. |  |
| M6 | Pressure Drop | Force | Pool | Creates a field that repeatedly shoves enemies caught inside. Give them some space. Then take it away. |  |
| M7 | Corrosive Bite | Acid | Contact | Bites nearby enemies and corrodes their defences. A terrible habit. A useful one. |  |
| M8 | Acid Spit | Acid | Projectile | Hurls a glob of acid at an enemy. Manners are not a survival strategy. |  |
| M9 | Sour Spray | Acid | Spread | Sprays acid droplets across a wide area. A bitter little shower. |  |
| M10 | Caustic Reaction | Acid | Burst | Splashes acid across a small area on impact. The reaction is entirely appropriate. |  |
| M11 | Dissolving Relationship | Acid | Beam | Streams acid into anything unfortunate enough to be in its path. Some bonds are best broken down. |  |
| M12 | Acid Reflux | Acid | Pool | Leaves a corrosive puddle on the ground. Best not to stand in your own business. |  |
| M13 | Shock Jab | Static | Contact | Delivers an electrical shock through direct contact. Touching is not always affectionate. |  |
| M14 | Zap Seed | Static | Projectile | Fires a charged orb that shocks the first enemy it hits. A little spark of potential. |  |
| M15 | Forked Tongue | Static | Spread | Fires electrical darts across a wide fan. It has several points to make. |  |
| M16 | Power Surge | Static | Burst | Releases a sudden electrical pulse around the impact point. An entirely normal response to stress. |  |
| M17 | Blue Screen | Static | Beam | Channels electricity along a narrow beam. Everything stops working eventually. |  |
| M18 | Live Wire | Static | Pool | Electrifies an area, shocking enemies inside it. The warning label was apparently optional. |  |
| M19 | Snot Knuckle | Mucus | Contact | Smacks nearby enemies with a sticky blow. Keep your hands to yourself. Actually, don't. |  |
| M20 | Gobstopper | Mucus | Projectile | Fires a sticky glob that adheres to its target. It tends to get attached. |  |
| M21 | Snotgun | Mucus | Spread | Fires a wide fan of sticky globs. A messy solution to a messy problem. |  |
| M22 | Gunk Bomb | Mucus | Burst | Splashes mucus across a small area on impact. Cleanup is someone else's problem. |  |
| M23 | Snot Stream | Mucus | Beam | Sprays a continuous stream of mucus that slows enemies it hits. Difficult to shake. |  |
| M24 | Snot Trap | Mucus | Pool | Leaves a patch that sticks enemies crossing it. Watch your step; they won't. | Renamed from "Sticky Situation" (clashed with a reaction) |
| M25 | Bloodletter | Blood | Contact | Cuts nearby enemies, leaving bleeding wounds. Consider this a formal warning. |  |
| M26 | Red Needle | Blood | Projectile | Fires a narrow blood spike at an enemy. Point made. |  |
| M27 | Bloodshot | Blood | Spread | Fires sharp blood droplets across a wide fan. A rather poor bedside manner. |  |
| M28 | Bloodbath | Blood | Burst | Releases a concentrated burst of blood damage around the target. Things have escalated. |  |
| M29 | Bloodline | Blood | Beam | Channels a stream of blood damage into enemies along its path. Family resemblance is not required. |  |
| M30 | Blood Pool | Blood | Pool | Leaves a damaging slick of blood on the ground. Someone will have to mop that up. |  |
| M31 | Spirit Slap | Soul | Contact | Strikes nearby enemies with a spectral blow. A little soul-searching by force. |  |
| M32 | Ghost Load | Soul | Projectile | Fires a slow spirit orb that damages its first target. Something to believe in. |  |
| M33 | Soul Scatter | Soul | Spread | Fires spectral shards across a wide fan. A little piece of you goes a long way. |  |
| M34 | Soul Purpose | Soul | Burst | Releases a spectral shockwave around the impact point. At last, some direction in life. | **Name clash:** also the Force + Soul reaction |
| M35 | Wraith Ray | Soul | Beam | Channels soul energy along a focused beam. Straight through to the other side. |  |
| M36 | Haunted Ground | Soul | Pool | Creates a spectral field that damages enemies inside it. The dead are not known for respecting boundaries. |  |
| M37 | Hot Touch | Fire | Contact | Strikes nearby enemies and sets them alight. You should have called first. |  |
| M38 | Hot Shot | Fire | Projectile | Fires a fireball that ignites its target. A burning ambition. |  |
| M39 | Cinderblast | Fire | Spread | Fires burning sparks across a wide fan. A brief but meaningful relationship with fire. |  |
| M40 | Firecracker | Fire | Burst | Explodes in a compact burst of flame on impact. A little premature excitement. |  |
| M41 | Flame Jet | Fire | Beam | Projects a continuous stream of fire. It is important to keep things flowing. |  |
| M42 | Burning Ground | Fire | Pool | Leaves a patch of fire that damages enemies inside it. The floor is lava. This is not a drill. |  |

## 2. Signature weapons (26)

| # | Weapon (code id) | Damage type | Attack type | Signature | Status |
| --- | --- | --- | --- | --- | --- |
| S1 | Premature Evangelation (`orbit`) | Soul | Contact, orbiting | Guardian angels circle you; their swats build Possessed; some eat bullets | Proposed |
| S2 | Nappy Mines (`mines`) | Acid | Burst, delayed detonation | Proximity mines dropped behind you; each blast leaves an Acid Pool | Proposed |
| S3 | Pub Crawl (`wake`) | Fire | Pool, trail | You shed a boozy trail as you swim; it burns | Proposed |
| S4 | Peekaboo (`peekaboo`) | Soul | Burst | You vanish; enemies search the empty spot and hit each other; then BOO applies Fear | Proposed |
| S5 | Black Hole (`void`, "Toddler Gravity") | Force | Projectile, slow | A slow orb that pulls enemies in; orbs merge; five merged go supernova | Proposed |
| S6 | Tapeworm Seeder (`parasite`) | Soul | Projectile | Infected enemies rise after death and fight for you | Proposed |
| S7 | Red Tape (`redtape`) | Mucus | Projectile | Tapes a target to its neighbours; damage to one is shared with the bundle | Proposed |
| S8 | Due Date (`duedate`) | Blood | Projectile | A countdown mark; when it ends the target takes 40% of everything it took while marked | Proposed |
| S9 | Leeches (`leeches`) | Blood | Contact, summoned | Leeches latch on and feed; a little comes back to you as health | Proposed |
| S10 | Static Cling (`tesla`) | Static | Projectile, chaining | Static jumps through crowds; your other weapons' hits on Charged enemies arc | Proposed |
| S11 | Lard Lobber (`lard`) | Force | Burst | Knocked enemies bowl into their mates: STRIKE | Proposed |
| S12 | Placental Siphon (`siphon`) | Force | Projectile | Eats enemy bullets near you and fires them back | Proposed |
| S13 | Bubble Wand (`bubble`) | Mucus | Projectile | Bubbles trap small enemies; anything touching a bubble pops it | Proposed |
| S14 | Tooth Fairy (`toothfairy`) | Soul | Burst | Drops teeth; greedy enemies swim to them and get smitten | Proposed |
| S15 | Upchuck (`upchuck`) | Acid | Pool | Lobbed sick puddles; touching puddles merge into a bigger one | Proposed |
| S16 | Heartburn (`flamer`) | Fire | Spread, cone | Two streams of reflux; each droplet comes back and hits again on the way home | Draft |
| S17 | Hot and Bothered (new) | Fire | Burst, around you | A wave of heat off your body every 4 s; bigger and hotter the lower your health | Draft (new) |
| S18 | Carpet Burn (new) | Fire | Contact | Friction: touching enemies at speed sets them alight; sprinting doubles it | Draft (new) |
| S19 | Getting Warmer (new) | Fire | Beam | Heats up the longer it stays on; at full heat everything in the lane Ignites at once | Draft (new) |
| S20 | Burning Sensation (new) | Fire | Projectile | Its Burn never drains: it lingers until Ignition, death or Mucus | Draft (new) |
| S21 | Twin Telepathy (`twin`) | Static | Beam, anchored | A beam joins you and your twin across the crowd; swim to sweep it; Charged enemies on it pass arcs on | Proposed |
| S22 | Blood Blister (`blister`) | Blood | Pool, lobbed | Bursts into a big blood pool; when the pool dries it pops once more | Proposed |
| S23 | Thorny Onesie (`onesie`) | Force | Burst, self-centred | Spikes pulse out around you; harder the more max health you have | Proposed |
| S24 | Seeker Siblings (`seeker`) | Blood | Projectile, homing | Homing siblings that never miss; a sibling that kills splits into two | Proposed |
| S25 | Flagellum Flail (`flail`) | Force | Beam, short lash | Your tail cracks in a straight line; the tip hits hardest | Proposed |
| S26 | Nose Goblins (`goblins`) | Mucus | Projectile, orbiting | Bogey goblins circle you and flick snot at different enemies, spreading Snare | Proposed |

## 3. Parked originals (28)

Strongest candidates to bring back next: **Static Hairbrush** and **Lightning Bugs** (Static is still the thinnest signature type), **Bogey Roller** and **Achoo** (Conjoined in one shot).

| Weapon (code id) | Old type | Why parked |
| --- | --- | --- |
| Spitball (`blaster`) | Force | Plain single shot: the matrix Force Projectile (Knuckle Dragger) covers it |
| Hiccup Scattergun (`shotgun`) | Mucus | Point-blank fan: the matrix Spread weapons cover it |
| Yo-Yo Diet (`glaive`) | Force | Candidate: a returning throw that hits twice (the Returning modifier now exists, `MODIFIERS.md`) |
| Booger Flick (`frost`) | Mucus | Covered by the matrix Mucus Projectile (Gobstopper); its shatter idea is gone with the old reactions |
| Morning Sickness (`venom`) | Acid | Lobbed Acid puddles: overlaps Upchuck and the matrix Acid Pool |
| Placenta Paddle (`paddle`) | Force | Candidate: big sweeping Force Contact; overlaps Nutcracker |
| Colouring In (`crayon`) | Force | Parked: needs loops that autorun does not draw |
| Imaginary Friend (`friend`) | Soul | Parked: copies your weapons, hard to bound |
| Baby Rattle (`rattle`) | Force | Covered by the matrix Force Burst |
| Little Swimmers (`swimmers`) | Force | Candidate: pets that headbutt (Force) |
| Gut Punch (`gutpunch`) | Acid | Covered by the matrix Acid Contact; its stun now comes from Poise |
| Ulcer Moons (`ulcer`) | Acid | Overlaps Premature Evangelation (orbiting Contact) |
| Achoo (`achoo`) | Mucus | Candidate: a sneeze cone with every fourth one a big push (Mucus Spread) |
| Bogey Roller (`roller`) | Mucus | Candidate: a snowballing bogey; would be a third Mucus signature |
| Runny Nose (`runny`) | Mucus | A Mucus trail: overlaps Pub Crawl (trail Pool) |
| Static Hairbrush (`hairbrush`) | Static | Strong Static candidate: every fourth swing lets a bolt go |
| Carpet Shuffle (`carpet`) | Static | Covered by the matrix Static Burst (Power Surge) |
| Lightning Bugs (`bugs`) | Static | Strong Static candidate: allied bugs whose bites arc |
| Grubby Fingers (`grubby`) | Cooties (retired) | Built on Sick (Cooties, retired) |
| Whooping Cough (`whoop`) | Cooties (retired) | Built on Sick (Cooties, retired) |
| Cradle Cap (`cradlecap`) | Oil (retired) | Oil (retired); a close-range burst the matrix Spread covers |
| Butter Knife (`butterknife`) | Oil (retired) | Oil (retired); its greasy smear has no new equivalent |
| Head Lice (`lice`) | Oil (retired) | Oil (retired); hopping critters would use the pets rule |
| Paper Cut (`papercut`) | Blood | Candidate: many tiny bleeding cuts (Blood Contact); overlaps Bloodletter |
| Spirit Fingers (`spiritfingers`) | Soul | Covered by the matrix Soul Contact (Spirit Slap) |
| Waters Breaking (`waters`) | Water (retired) | Water (retired); a push-away burst the matrix Force Burst covers |
| Bath Bomb (`bathbomb`) | Water (retired) | Water (retired) |
| Sea Monkeys (`seamonkeys`) | Water (retired) | Water (retired); critters would use the pets rule |

## 4. Sample starting weapons

Each sample in `SAMPLES.md` starts with the matrix weapon for its primary damage type and starting attack type.

| Sample | Primary type | Attack type | Starting weapon |
| --- | --- | --- | --- |
| The Baseline | Force | Projectile | Knuckle Dragger (M2) |
| The Overachiever | Static | Beam | Blue Screen (M17) |
| The Late Starter | Blood | Contact | Bloodletter (M25) |
| The Family Friend | Acid | Projectile | Acid Spit (M8) |
| The Cold Parcel | Mucus | Pool (trail) | Snot Trap (M24), laid as a trail |
| The Unsolicited | Fire | Spread | Cinderblast (M39) |
| The Unaccounted | Soul | Burst | Soul Purpose (M34), the weapon with the name clash |
| The Other Half | Fire, Soul, Static (shifting) | Beam | Flame Jet (M41), Wraith Ray (M35) or Blue Screen (M17), changing every 20 s |
