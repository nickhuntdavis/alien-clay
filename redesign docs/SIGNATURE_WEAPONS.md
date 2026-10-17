# Signature Weapons

Working proposal, 17 Oct 2026. Twenty-one favourite weapons from the original game, plus five Fire drafts (16 to 20), brought back **alongside** v10's 42-weapon matrix (6 attack types × 7 damage types, `ATTACK_TYPES.md`). The matrix weapons are the plain baseline; a signature weapon is a matrix slot plus one signature behaviour that no other weapon has.

Each signature weapon has exactly one damage type and one attack type, and follows every rule in `COMBAT_MATRIX.md` (sections 1 to 11). The new rules they need are in `COMBAT_MATRIX.md` section 12. Starting stats are today's values from `data.js` and `armoury.js`; their level-up upgrades (the `sig` lists in code) carry over, except any that depend on a retired type (Cooties, Oil, Water), which get rewritten when the weapon is ported.

## Summary

| # | Weapon (code id) | Damage type (was) | Attack type | Signature | New rules used |
| --- | --- | --- | --- | --- | --- |
| 1 | Premature Evangelation (`orbit`) | Soul (Soul) | Contact, orbiting | Guardian angels circle you; their swats build Possessed; some eat bullets | Projectile blocking |
| 2 | Nappy Mines (`mines`) | Acid (Acid) | Burst, delayed detonation | Proximity mines dropped behind you; each blast leaves an Acid Pool | Bounded chains |
| 3 | Pub Crawl (`wake`) | Fire (Oil; Cooties before) | Pool, trail | You shed a boozy trail as you swim; it burns | (none) |
| 4 | Peekaboo (`peekaboo`) | Soul (Oil) | Burst | You vanish; enemies search the empty spot and hit each other; then BOO applies Fear | Player hiding; Fear source |
| 5 | Black Hole (`void`, "Toddler Gravity") | Force (Soul) | Projectile, slow, gravity well | A slow orb that warps space: pulls enemies in and bends shots; orbs merge; five merged go supernova | Gravity well; bounded chains |
| 6 | Tapeworm Seeder (`parasite`) | Soul (Cooties) | Projectile | Infected enemies rise after death and fight for you | Pets |
| 7 | Red Tape (`redtape`) | Mucus (Cooties) | Projectile | Tapes a target to its neighbours; damage to one is shared with the bundle | Echo damage |
| 8 | Due Date (`duedate`) | Blood (Blood) | Projectile | A countdown mark; when it ends the target takes 40% of everything it took while marked | Echo damage |
| 9 | Leeches (`leeches`) | Blood (Blood) | Contact, summoned | Leeches latch on and feed; a little comes back to you as health | Pets; Extraction |
| 10 | Static Cling (`tesla`) | Static (Static) | Projectile, chaining | Static jumps through crowds; your other weapons' hits on Charged enemies arc | (Charge as conductor) |
| 11 | Lard Lobber (`lard`) | Force (Oil) | Burst | Knocked enemies bowl into their mates: STRIKE | Bounded chains |
| 12 | Placental Siphon (`siphon`) | Force (Water) | Projectile | Eats enemy bullets near you and fires them back | Projectile blocking |
| 13 | Bubble Wand (`bubble`) | Mucus (Water) | Projectile | Bubbles trap small enemies; anything touching a bubble pops it | (Snared) |
| 14 | Tooth Fairy (`toothfairy`) | Soul (Blood) | Burst | Drops teeth; greedy enemies swim to them and get smitten | Lures |
| 15 | Upchuck (`upchuck`) | Acid (Acid) | Pool | Lobbed sick puddles; touching puddles merge into a bigger one | Merging pools |
| 16 | Heartburn (`flamer`) | Fire (Acid) | Spread, cone | Two streams of reflux; each droplet comes back and hits again on the way home | Returning modifier |
| 17 | Hot and Bothered (new) | Fire (new) | Burst, around you | A wave of heat off your body every 4 s; bigger and hotter the lower your health | (none) |
| 18 | Carpet Burn (new) | Fire (new) | Contact | Friction: touching enemies at speed sets them alight; sprinting doubles it | (none) |
| 19 | Getting Warmer (new) | Fire (new) | Beam | Heats up the longer it stays on; at full heat everything in the lane Ignites at once | (none) |
| 20 | Burning Sensation (new) | Fire (new) | Projectile | Its Burn never drains: it lingers until Ignition, death or Mucus | (none) |
| 21 | Twin Telepathy (`twin`) | Static (Static) | Beam, anchored | A beam joins you and your twin across the crowd; swim to sweep it; Charged enemies on it pass arcs on | (Charge as conductor) |
| 22 | Blood Blister (`blister`) | Blood (Blood) | Pool, lobbed | Bursts into a big blood pool; when the pool dries it pops once more | (blood pools) |
| 23 | Thorny Onesie (`onesie`) | Force (Force) | Burst, self-centred | Spikes pulse out around you; harder the more max health you have | Scaling |
| 24 | Seeker Siblings (`seeker`) | Blood (Blood) | Projectile, homing | Homing siblings that never miss; a sibling that kills splits into two | Multiplying |
| 25 | Flagellum Flail (`flail`) | Force (Force) | Beam, short lash | Your tail cracks in a straight line; the tip hits hardest | Heavy hit |
| 26 | Nose Goblins (`goblins`) | Mucus (Mucus) | Projectile, orbiting | Bogey goblins circle you and flick snot at different enemies, spreading Snare | Orbiting |

**Spread across types:** Fire 6, Force 5, Soul 4, Blood 4, Mucus 3, Acid 2, Static 2. Fire covers all six attack types (Pub Crawl is its Pool); rows 16 to 20 are drafts; rows 21 to 26 were added on 17 Oct from the parked originals.

**Name note:** the shipped game currently calls `wake` "Skid Mark"; this doc restores **Pub Crawl**.

## The weapons

### 1. Premature Evangelation (`orbit`)
- **Is:** Soul, Contact with the orbiting modifier. Three angels circle you (radius 72) and swat whatever comes close.
- **Signature:** each swat builds Soul, so a crowd that presses in gets converted (Possessed). Some angels destroy enemy shots they touch (projectile blocking).
- **Limits:** blocking uses the shared rule (Projectile and Spread shots only). Possessed enemies are skipped by the angels, as by every weapon.
- **Start stats:** 23 damage, 3 angels, 4.5 s on / 2.2 s reload.

### 2. Nappy Mines (`mines`)
- **Is:** Acid, Burst with delayed detonation. Drops proximity mines behind you (blast radius 72, life 14 s).
- **Signature:** each blast leaves a small Acid Pool (the standard object, 11.6). Domino upgrade: a blast sets off other mines in range, up to **3 mines** per chain.
- **Limits:** the Nuclear Nappy upgrade (every 6th mine, 3× radius and 6× damage) stays as its level-10 mastery and counts as one Burst; its Pool is the normal size.
- **Start stats:** 34 damage, 0.7 s between mines, 5 per load, 2.4 s reload.

### 3. Pub Crawl (`wake`)
- **Is:** Fire, Pool laid as a trail. No aiming: you shed a boozy trail wherever you swim. Alcohol burns.
- **Signature:** the trail (Skid Mark's shipped trail, now Fire) burns whatever wades through it, filling its Burn bar. Swim circles round a crowd to set the whole thing alight.
- **Limits:** trail pieces count towards the 40-object cap; the oldest piece goes first. Mucus (Snared) puts burning enemies out, as usual.
- **Start stats:** 20 damage, each piece lasts 2.2 s, width 22.

### 4. Peekaboo (`peekaboo`)
- **Is:** Soul, Burst. Every 5.5 s you vanish for 1.8 s, then BOO (radius 230).
- **Signature:** while you're hidden, enemies lose you and swarm your last spot; their shots there can hit each other. The BOO applies **Fear** to everything in range and hits harder the more enemies were searching for you.
- **Limits:** player hiding rule (12.4). Fear lasts 2 s. BOO damage bonus is capped at +100% (from 10 searching enemies).
- **Start stats:** 20 damage, 5.5 s cooldown, hidden 1.8 s.

### 5. Black Hole (`void`, shown as "Toddler Gravity")
- **Is:** Force, a slow Projectile (speed 115) that pierces everything, with the **gravity well** modifier (radius 72): it pulls enemies in and bends every shot that passes near it, so your other weapons' shots curve into the crowd it is gathering.
- **Signature:** two black holes that touch merge into a bigger one. Five merged go supernova: one Burst, and the hole is gone.
- **Limits:** gravity well modifier (`MODIFIERS.md` 19) and the Pull rule (12.2); a merged hole is one well with a bigger radius (up to 140), so merging never breaks the 3-well cap; merges cap at 5 (it was 20). Moved from Soul to Force because gravity is displacement, and Soul is now mind control.
- **Start stats:** 8 damage, 1.8 s cooldown, pull strength 95.

### 6. Tapeworm Seeder (`parasite`)
- **Is:** Soul, Projectile. Fast shots infect (8 s).
- **Signature:** an infected enemy that dies rises as an undead ally for a few seconds and fights for you. Possessed after death: the purest Soul weapon.
- **Limits:** pets rule (12.3); at most **4 undead** at once; each lasts 6 s.
- **Start stats:** 12 damage, 0.4 s between shots, 8 per load.

### 7. Red Tape (`redtape`)
- **Is:** Mucus, Projectile. Stamps a target and tapes it to up to 3 neighbours within 170 for 5 s.
- **Signature:** damage to one of the bundle is shared with the rest (35%). Being taped counts as Conjoined: the bundle cannot move apart.
- **Limits:** the shared 35% is echo damage (12.1): it never fills bars, sets off reactions or shares on again.
- **Start stats:** 18 damage, 1.4 s cooldown, 3 per load.

### 8. Due Date (`duedate`)
- **Is:** Blood, Projectile. Sticks a 4 s countdown on a big target (it prefers TOUGHEST).
- **Signature:** when the countdown ends, the target takes 40% of everything it took while marked, all over again. If it dies early, the stored damage bursts onto enemies nearby.
- **Limits:** the repeat is echo damage (12.1). One Due Date per target.
- **Start stats:** 20 damage, 0.9 s cooldown, 3 per load.

### 9. Leeches (`leeches`)
- **Is:** Blood, Contact with the summoned modifier. Two leeches swim off, latch on and feed until the target dies.
- **Signature:** a little of what they drink comes back to you as health. This is Extraction: it shares the 6 health per second cap.
- **Limits:** pets rule (12.3); at most 4 leeches at once. Leech bites apply Bleed as normal Blood hits.
- **Start stats:** 6 damage per bite, 0.25 s between bites.

### 10. Static Cling (`tesla`)
- **Is:** Static, Projectile with the chaining modifier (3 jumps, range 140).
- **Signature:** every enemy it hits is Charged. Your **other** weapons' hits on a Charged enemy arc too (the old "powers every other weapon"), within the usual 3-jump limit.
- **Limits:** an arc never starts another arc on the same target; jump falloff is 70% (11.5).
- **Start stats:** 13 damage, 0.7 s cooldown, 6 per load.

### 11. Lard Lobber (`lard`)
- **Is:** Force, Burst (lobbed, radius 66). Dollops of lard send everything flying.
- **Signature:** an enemy sent flying that hits a mate knocks that mate flying too, and both take the 40% collision damage: STRIKE.
- **Limits:** bounded chain (12.5): each flying enemy knocks one more, once (depth 2). Squishy halves the knockback as usual.
- **Start stats:** 14 damage, 1.2 s cooldown, 3 per load.

### 12. Placental Siphon (`siphon`)
- **Is:** Force, Projectile. Eats enemy bullets within 90 of you and fires them back as hard as they hit you.
- **Signature:** it rewards a busy screen; with nothing to eat it dribbles a weak spit.
- **Limits:** projectile blocking rule (12.8). Stores up to 10 bullets. A returned bullet keeps its **original damage type**, so it can fill bars and set off reactions.
- **Start stats:** 15 damage (spit), 40 per load, fires every 0.08 s while stocked.

### 13. Bubble Wand (`bubble`)
- **Is:** Mucus, Projectile (slow bubbles).
- **Signature:** a bubble traps a small enemy (up to 34 max health): it is fully Snared and cannot attack. Anything touching the bubble (you, an enemy, a shot) pops it, and the pop is a small Burst that hits everything near except the trapped one.
- **Limits:** never traps elites or bosses; a trap lasts 5 s at most.
- **Start stats:** 18 damage, 1.1 s cooldown, 4 per load.

### 14. Tooth Fairy (`toothfairy`)
- **Is:** Soul, Burst (the smite).
- **Signature:** drops baby teeth near the crowd. Greedy enemies within 230 swim off to grab one; the Fairy smites whoever takes it, harder for every tooth it holds.
- **Limits:** lures rule (12.6): at most 3 teeth on the ground; each lasts 6 s. Bosses ignore teeth.
- **Start stats:** 34 damage, 1.1 s cooldown, 3 per load.

### 15. Upchuck (`upchuck`)
- **Is:** Acid, Pool (lobbed, radius 60, 4 s).
- **Signature:** puddles that touch merge into one bigger, nastier puddle, so throwing at one spot pays.
- **Limits:** merging pools rule (12.7): a merged puddle grows to radius 100 at most and its timer resets once per merge.
- **Start stats:** 16 damage, 1.2 s cooldown, 3 per load.

## Fire signature weapons (drafts)

Fire is new, so the original game had only one Fire-shaped weapon. These five give Fire one signature weapon per attack type (Pub Crawl is the sixth, the Pool). Heartburn is an original (`flamer`), moved from Acid to Fire; the other four are new. Descriptions are written in the Scientist's flat voice (`VOICE_GUIDE.md`); numbers are starting points.

### 16. Heartburn (`flamer`)
- **Is:** Fire, Spread (a short cone: 2 streams, range 200, pierces).
- **Signature:** "coming back up". Each droplet flies out to full range, then flies back to you, hitting on the way out and on the way back (the Returning modifier, `MODIFIERS.md`). Swimming close to a crowd means most droplets hit twice. (It replaces the reflux puddle, cut with the other new ground objects in `COMBAT_MATRIX.md` decision 27.)
- **Limits:** droplets still pierce, so they turn back only at full range (not on a third hit); an enemy is hit at most once per pass, so twice per droplet. Its old upgrades (Blue Flame, Indigestion, Napalm, Heatwave, Dragon, Hell's Kitchen) suit Fire better than they ever suited Acid; Heatwave keeps the full-circle sweep.
- **Description:** "A short-range spray of reflux. It burns going up and coming down."
- **Start stats:** 2.4 damage per droplet (down from today's 3.4, since most hit twice), 2 streams, a droplet every 0.05 s, 50 per load, 2.1 s reload.

### 17. Hot and Bothered (new)
- **Is:** Fire, Burst centred on you (radius 110), every 4 s.
- **Signature:** the lower your health, the bigger and hotter it gets: up to +60% radius and +60% damage at 25% health. A comeback weapon for a desperate moment.
- **Limits:** it never hurts you. It scales from your current health, not damage taken, so healing cools it down.
- **Description:** "Subject's surface temperature rises sharply under stress. The surrounding area is affected. The subject denies this."
- **Start stats:** 22 damage, 4 s cooldown.

### 18. Carpet Burn (new)
- **Is:** Fire, Contact.
- **Signature:** friction. Touching an enemy while swimming deals Fire damage scaled by your speed; while sprinting, the hit fills the Burn bar twice as fast. It rewards autorun modes that keep moving (KITE, ORBIT) and sprint builds.
- **Limits:** each enemy once per 0.5 s. It is a Contact hit, so Thorns answers it. No damage while standing still.
- **Description:** "Friction burns. Mostly theirs."
- **Start stats:** 10 damage at normal speed, 20 while sprinting.

### 19. Getting Warmer (new)
- **Is:** Fire, Beam (range 260).
- **Signature:** heats up while it keeps firing on enemies: +10% damage per second, up to +80%. At full heat it boils over: everything in the lane Ignites at once, then the beam cools for 1.5 s and starts again from cold.
- **Limits:** the boil-over is an ordinary Ignition on each target (their Burn bars reset). Any 1 s gap with nothing in the lane cools it back to zero.
- **Description:** "Warmer. Warmer. Considerably warmer than recommended."
- **Start stats:** 4 damage per tick, a tick every 0.1 s.

### 20. Burning Sensation (new)
- **Is:** Fire, Projectile.
- **Signature:** the Burn bar it fills never drains. Every other bar drains after 2 s without a hit (11.2); a Burning Sensation lingers until it Ignites, the target dies, or Mucus puts it out.
- **Limits:** only the part of the bar this weapon filled stays put; Burn from other weapons drains as normal. Snared still clears it (Mucus smothers Fire).
- **Description:** "A persistent burning sensation. It should clear up on its own. It will not."
- **Start stats:** 14 damage, 0.6 s cooldown, 6 per load.

## Added 17 Oct: six more originals

Modifiers are defined in `MODIFIERS.md`; pets in `COMBAT_MATRIX.md` 12.3.

### 21. Twin Telepathy (`twin`)
- **Is:** Static, Beam with the anchored-beam and sweep modifiers. Your twin mirrors you across an anchor on the crowd (range 520), and a beam (width 10) always joins the two of you.
- **Signature:** swim to drag the beam through the crowd. Every enemy it touches is Charged, and Charged enemies on the beam pass arcs on (3 jumps, 70% falloff), so a crowded lane lights up.
- **Limits:** the twin is not a pet: it can't be hit and only carries the beam. Each enemy is hit at most every 0.1 s.
- **Start stats:** 24 damage, 1.6 s cooldown, 3 per load.

### 22. Blood Blister (`blister`)
- **Is:** Blood, Pool with the lobbed modifier.
- **Signature:** each blister bursts into a large blood pool (radius 70, 2.5 s) that Bleeds what stands in it. When the pool dries, it pops once more as a small Burst. It is the main player source of blood pools, so it feeds Blood Circuit (Static) and Caught in the Clot (Mucus).
- **Limits:** the dry-up pop is one Burst per pool, never a chain. Pools count towards the 40-object cap.
- **Description:** "Do not pop it. It will pop itself. Twice."
- **Start stats:** 14 damage, 1.3 s cooldown, 3 per load.

### 23. Thorny Onesie (`onesie`)
- **Is:** Force, Burst with the self-centred and scaling modifiers. Spikes pulse out around you (radius 90) and push enemies back.
- **Signature:** the tank weapon. Damage scales with your max health: × (max health ÷ 120), capped at ×2. Owning it also gives you Thorns (a built-in defence: no Genome slot, `UPGRADES.md` 5).
- **Limits:** the old "and armour" scaling goes (armour is now Shell layers).
- **Description:** "Spikes pulse out all around you. Huggable, technically."
- **Start stats:** 18 damage, a pulse every 0.55 s, knockback 120.

### 24. Seeker Siblings (`seeker`)
- **Is:** Blood, Projectile with the homing and multiplying modifiers. Two homing siblings per shot (turn rate 5).
- **Signature:** they never miss (Evasion still applies), and a sibling that kills splits into two smaller siblings (50% damage) that home on the next targets. Their hits Bleed.
- **Limits:** split siblings never split again; at most 12 siblings in flight.
- **Description:** "Tiny homing siblings who swim for you and never miss. Family is complicated."
- **Start stats:** 9 damage, 0.45 s cooldown, 6 per load.

### 25. Flagellum Flail (`flail`)
- **Is:** Force, Beam (a short lash: range 190, width 15) with the sweep modifier.
- **Signature:** your tail cracks in a long straight line, hitting everything along it. The last quarter of the lash (the tip) deals +50% and pushes harder, so the tip is where heavy hits (Shell layers off, Blood Pressure) come from.
- **Limits:** each enemy is hit once per crack. Its "Get Over Here" upgrade becomes a short Pull (12.2) instead of a push.
- **Description:** "Your tail cracks like a whip in a long straight line. It was a weapon all along."
- **Start stats:** 19 damage, 0.38 s cooldown, 6 per load, knockback 60.

### 26. Nose Goblins (`goblins`)
- **Is:** Mucus, Projectile with the orbiting and piercing (1) modifiers. Two bogey goblins circle you and flick snot.
- **Signature:** each goblin picks a different enemy where it can, so the Snare spreads across the front of a crowd; two Snared enemies that touch become Conjoined.
- **Limits:** goblins are orbiters, not pets: they can't be hit and never block shots.
- **Description:** "They live up there. They have always lived up there."
- **Start stats:** 9 damage, 0.5 s cooldown, 8 per load.

## Old Pairings that use these weapons

These need checking against the new rules when ported (several used Cooties or Oil): Whack-a-Mole (Paddle + Nappy Mines), Silent but Deadly (Peekaboo + Pub Crawl), Baby Monitor Network (Static Cling + Nappy Mines), Trail Mix (Pub Crawl + Nappy Mines), Bait and Switch (Tooth Fairy + Nappy Mines), He Went That Way (Imaginary Friend + Peekaboo), Nappy Rash (Thorny Onesie + Cooties weapon). The Soul Beam + Fire Pool Pairing (Spectral Combustion) is unaffected.
