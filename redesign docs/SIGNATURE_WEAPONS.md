# Signature Weapons

Working proposal, 17 Oct 2026. Fifteen favourite weapons from the original game, brought back **alongside** v10's 42-weapon matrix (6 attack types × 7 damage types, `ATTACK_TYPES.md`). The matrix weapons are the plain baseline; a signature weapon is a matrix slot plus one signature behaviour that no other weapon has.

Each signature weapon has exactly one damage type and one attack type, and follows every rule in `COMBAT_MATRIX.md` (sections 1 to 11). The new rules they need are in `COMBAT_MATRIX.md` section 12. Starting stats are today's values from `data.js` and `armoury.js`; their level-up upgrades (the `sig` lists in code) carry over, except any that depend on a retired type (Cooties, Oil, Water), which get rewritten when the weapon is ported.

## Summary

| # | Weapon (code id) | Damage type (was) | Attack type | Signature | New rules used |
| --- | --- | --- | --- | --- | --- |
| 1 | Premature Evangelation (`orbit`) | Soul (Soul) | Contact, orbiting | Guardian angels circle you; their swats build Possessed; some eat bullets | Projectile blocking |
| 2 | Nappy Mines (`mines`) | Acid (Acid) | Burst, delayed detonation | Proximity mines dropped behind you; each blast leaves an Acid Pool | Bounded chains |
| 3 | Pub Crawl (`wake`) | Fire (Oil; Cooties before) | Pool, trail | You shed a boozy trail as you swim; it burns | (none) |
| 4 | Peekaboo (`peekaboo`) | Soul (Oil) | Burst | You vanish; enemies search the empty spot and hit each other; then BOO applies Fear | Player hiding; Fear source |
| 5 | Black Hole (`void`, "Toddler Gravity") | Force (Soul) | Projectile, slow | A slow orb that pulls enemies in; orbs merge; five merged go supernova | Pull; bounded chains |
| 6 | Tapeworm Seeder (`parasite`) | Soul (Cooties) | Projectile | Infected enemies rise after death and fight for you | Allied creatures |
| 7 | Red Tape (`redtape`) | Mucus (Cooties) | Projectile | Tapes a target to its neighbours; damage to one is shared with the bundle | Echo damage |
| 8 | Due Date (`duedate`) | Blood (Blood) | Projectile | A countdown mark; when it ends the target takes 40% of everything it took while marked | Echo damage |
| 9 | Leeches (`leeches`) | Blood (Blood) | Contact, summoned | Leeches latch on and feed; a little comes back to you as health | Allied creatures; Extraction |
| 10 | Static Cling (`tesla`) | Static (Static) | Projectile, chaining | Static jumps through crowds; your other weapons' hits on Charged enemies arc | (Charge as conductor) |
| 11 | Lard Lobber (`lard`) | Force (Oil) | Burst | Knocked enemies bowl into their mates: STRIKE | Bounded chains |
| 12 | Placental Siphon (`siphon`) | Force (Water) | Projectile | Eats enemy bullets near you and fires them back | Projectile blocking |
| 13 | Bubble Wand (`bubble`) | Mucus (Water) | Projectile | Bubbles trap small enemies; anything touching a bubble pops it | (Snared) |
| 14 | Tooth Fairy (`toothfairy`) | Soul (Blood) | Burst | Drops teeth; greedy enemies swim to them and get smitten | Lures |
| 15 | Upchuck (`upchuck`) | Acid (Acid) | Pool | Lobbed sick puddles; touching puddles merge into a bigger one | Merging pools |

**Spread across types:** Soul 4, Force 3, Acid 2, Mucus 2, Blood 2, Static 1, Fire 1. Soul is heavy here on purpose (it suits tricks), Fire is light because Fire is new: Fire signature weapons are a gap to fill later.

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
- **Signature:** the trail is a run of short Burn zones (each fills the Burn bar of whatever wades through). Swim circles round a crowd to set the whole thing alight.
- **Limits:** trail pieces count towards the 40-object cap; the oldest piece goes first. Mucus (Snared) puts burning enemies out, as usual.
- **Start stats:** 20 damage, each piece lasts 2.2 s, width 22.

### 4. Peekaboo (`peekaboo`)
- **Is:** Soul, Burst. Every 5.5 s you vanish for 1.8 s, then BOO (radius 230).
- **Signature:** while you're hidden, enemies lose you and swarm your last spot; their shots there can hit each other. The BOO applies **Fear** to everything in range and hits harder the more enemies were searching for you.
- **Limits:** player hiding rule (12.4). Fear lasts 2 s. BOO damage bonus is capped at +100% (from 10 searching enemies).
- **Start stats:** 20 damage, 5.5 s cooldown, hidden 1.8 s.

### 5. Black Hole (`void`, shown as "Toddler Gravity")
- **Is:** Force, a slow Projectile (speed 115) that pierces everything and **pulls** enemies within 72.
- **Signature:** two black holes that touch merge into a bigger one. Five merged go supernova: one Burst, and the hole is gone.
- **Limits:** pull uses the Pull rule (12.2); merges cap at 5 (it was 20). Moved from Soul to Force because gravity is displacement, and Soul is now mind control.
- **Start stats:** 8 damage, 1.8 s cooldown, pull strength 95.

### 6. Tapeworm Seeder (`parasite`)
- **Is:** Soul, Projectile. Fast shots infect (8 s).
- **Signature:** an infected enemy that dies rises as an undead ally for a few seconds and fights for you. Possessed after death: the purest Soul weapon.
- **Limits:** allied creatures rule (12.3); at most **4 undead** at once; each lasts 6 s.
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
- **Limits:** allied creatures rule (12.3); at most 4 leeches at once. Leech bites apply Bleed as normal Blood hits.
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
- **Limits:** projectile blocking rule (12.1). Stores up to 10 bullets. A returned bullet keeps its **original damage type**, so it can fill bars and set off reactions.
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

## Old Pairings that use these weapons

These need checking against the new rules when ported (several used Cooties or Oil): Whack-a-Mole (Paddle + Nappy Mines), Silent but Deadly (Peekaboo + Pub Crawl), Baby Monitor Network (Static Cling + Nappy Mines), Trail Mix (Pub Crawl + Nappy Mines), Bait and Switch (Tooth Fairy + Nappy Mines), He Went That Way (Imaginary Friend + Peekaboo), Nappy Rash (Thorny Onesie + Cooties weapon). The Soul Beam + Fire Pool Pairing (Spectral Combustion) is unaffected.
