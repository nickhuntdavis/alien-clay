# Feats

Working proposal, 17 Oct 2026. The drafted Feats for the redesign: the best 15 of the 48 original Feats (`SPELLS` in `data.js`, forks in `spellfork.js`), mapped to the current rules. The eight samples' unique Feats are in `SAMPLES.md` and are not repeated here.

Every Feat follows `COMBAT_MATRIX.md` like a weapon (11.7): one damage type, one attack type, modifiers from `MODIFIERS.md`, and stamina as today (attacking Feats cost stamina). Progression is `UPGRADES.md` 5: level 1 is the defining ability, levels 2 and 4 improve numbers (the old Lv 3 and 5 bonuses), and levels 3 and 5 are forks. The Lv 3 fork below is the old `spellfork.js` pair, mapped to the rules; Lv 5 forks are still to write (`UPGRADES.md` 11, question 4).

## Summary

| # | Feat (old id) | Damage type (was) | Attack type and modifiers | One line |
| --- | --- | --- | --- | --- |
| F1 | Sofa Crevice (`blackhole`) | Force (Soul) | Pool, lobbed, **gravity well** | A singularity under the crowd drags everything in and crushes it |
| F2 | Capacitation (`capacitation`) | Force (Force) | Contact, **lunge**, growing | You drive head-first through a line; the last in line takes the most |
| F3 | Anhydrobiosis (`anhydrobiosis`) | Force (Water, retired) | Burst, self-centred | Performs itself before a killing blow: you dry into a husk, then burst back |
| F4 | Formic Acid (`formicacid`) | Acid (Acid) | Beam | A giant ant snaps the most-Shelled enemy and sprays acid down the line |
| F5 | Bombardier Beetle (`bombardier`) | Acid (Acid) | Spread, rapid volley, **lunge** | Boiling acid at your chaser; the recoil throws you clear |
| F6 | Van de Graaff (`vandegraaff`) | Static (Static) | Projectile, orbiting, **gravity well** (shots only) | A dome swallows enemy bullets, then fires one arc per bullet |
| F7 | Tonic Immobility (`tonic`) | Static (Static) | Burst (whole screen) | Every enemy on screen staggers at once |
| F8 | Spinnbarkeit (`spinnbarkeit`) | Mucus (Mucus) | Projectile, chaining | Stretchy strings tie enemies into Conjoined pairs |
| F9 | Hagfish (`hagfish`) | Mucus (Mucus) | Burst, self-centred | A slime burst Snares everything around you and leaves a patch |
| F10 | Shed the Lining (`shedlining`) | Blood (Blood) | Beam, sweep | A red tide rolls across the screen, sweeping and bleeding enemies |
| F11 | Running With Scissors (`bladestorm`) | Blood (Force) | Spread, self-centred, piercing | A ring of blades bursts out of you |
| F12 | Vanishing Twin (`vanishingtwin`) | Soul (Soul) | Burst | Your twin rises under the toughest enemy and turns it |
| F13 | Wandering Womb (`wanderingwomb`) | Soul (Soul) | Projectile, slow, piercing, **gravity well** | A ghostly womb drifts across the slide, pulling enemies into its path |
| F14 | Brown Fat (`brownfat`) | Fire (Oil, retired) | Burst, lobbed, delayed detonation | A fat globule lands, then everything near it Ignites at once |
| F15 | Ear Candling (`earcandling`) | Fire (Oil, retired) | Pool (a lure, 12.6) | A lit candle behind you draws the crowd in and drips fire on them |

**Spread:** Force 3, Acid 2, Static 2, Mucus 2, Blood 2, Soul 2, Fire 2. Attack types: Burst 5, Projectile 3, Pool 2, Beam 2, Spread 2, Contact 1.

## The Feats

### F1. Sofa Crevice (`blackhole`)
- **Is:** Force, Pool with the lobbed and gravity well modifiers. Tears open a singularity (radius 125) under the densest cluster for 3 s.
- **Signature:** the gravity well drags enemies in (pull 210) and bends shots passing near it, so your own shots curve into the crowd it has gathered.
- **Limits:** the gravity well modifier (`MODIFIERS.md` 19) and the Pull rule (12.2): Squishy halves the pull, elites take 50%, bosses 25%. Moved from Soul to Force, like Black Hole: gravity is displacement.
- **Lv 3 fork:** **Down the Back** (pulls twice as hard) or **Loose Change** (when it closes, it spits everything out in one Burst worth 4 s of its damage).
- **Description:** "Tears open a singularity that drags and crushes. Everything you ever lost is in there."
- **Start stats:** 16 damage per tick, 10 s cooldown, radius 125, 3 s, pull 210.

### F2. Capacitation (`capacitation`)
- **Is:** Force, Contact with the lunge and growing modifiers. You drive head-first through a line of enemies (range 320).
- **Signature:** each enemy you pass through adds 10% to the next hit (growing, capped at +100%), so the last one in line takes the biggest, often heavy, hit (heavy hits knock off Shell layers and trigger Blood Pressure, 11.3).
- **Limits:** the lunge never passes walls or enters a sealed arena; you can still be hit during it. It is Contact, so Thorns answers each hit. The old "carries every status forward" is gone (no rule moves statuses between enemies).
- **Lv 3 fork:** **Hyperactivated** (you drive twice as far) or **Zona Binding** (the last enemy in line is staggered: its Poise bar fills).
- **Description:** "Sperm cannot fertilise anything until the female tract changes them. Then they can."
- **Start stats:** 40 damage, 7 s cooldown, width 30.

### F3. Anhydrobiosis (`anhydrobiosis`)
- **Is:** Force, Burst centred on you (radius 160). A passive Feat: it performs itself, costs no stamina, and is never tapped.
- **Signature:** when a hit would drop you under 20% health, that hit misses (the Evasion "miss" puff) and you dry into a husk that nothing can hurt for 2.5 s. You cannot move or attack meanwhile. Then you rehydrate in a Burst that knocks everything nearby back.
- **Limits:** once per 18 s. Hazards you are standing in stop hurting while you are a husk, but they are still there when you wake up.
- **Lv 3 fork:** **Vacuum Rated** (the husk destroys enemy Projectile and Spread shots that touch it and fires them back, the projectile blocking rule, 12.8) or **Rehydration** (the Burst also heals 15%).
- **Description:** "Life without water. Tardigrades dry out, wait, and come back."
- **Start stats:** 20 damage, 18 s cooldown, husk 2.5 s.

### F4. Formic Acid (`formicacid`)
- **Is:** Acid, Beam (width 34). Aimed by SHELLED (most Shell layers left); the old "most armoured" directive is retired.
- **Signature:** a far-too-big ant's head reaches in and snaps the target: its Corrosion bar fills at once (so a Shell enemy loses a layer). The spray continues in a line behind it and half-fills the Corrosion bar of everything it hits.
- **Limits:** Corrosion follows its own rules (11.2); against an enemy with no Shell the snap is just a big Acid hit.
- **Lv 3 fork:** **Worker** (two bites on two targets) or **Pheromone Trail** (the spray leaves Acid Pools along the line, standard size, 11.6). The old "draws enemies along it" lure is gone; lures belong to the lure rule (12.6).
- **Description:** "Twenty quadrillion ants on Earth. Two and a half million per person."
- **Start stats:** 60 damage, 8 s cooldown.

### F5. Bombardier Beetle (`bombardier`)
- **Is:** Acid, Spread (a cone of 6 pulses, range 300) with the rapid volley and lunge modifiers. Fired at whatever is nearest behind you.
- **Signature:** the recoil throws you the other way: a free dash through a gap, aimed by the cone.
- **Limits:** the lunge follows its modifier rules (never through walls). Acid builds Corrosion as usual and has no damage over time.
- **Lv 3 fork:** **Turret** (the cone keeps spraying for 1 s, tracking the densest crowd) or **Escape Artist** (nothing can hurt you during the recoil dash).
- **Description:** "Mixes two chemicals in its abdomen and fires them at a hundred degrees. Five hundred pulses a second."
- **Start stats:** 12 damage per pulse, 6 s cooldown.

### F6. Van de Graaff (`vandegraaff`)
- **Is:** Static, Projectile with the orbiting and gravity well modifiers. A charged dome floats beside you for 4 s.
- **Signature:** its gravity well pulls enemy Projectile and Spread shots into it (shots only: it does not pull bodies), and the dome swallows them (projectile blocking, 12.8). When it ends it fires one Static arc per bullet caught, at the nearest enemies; each makes its target Charged.
- **Limits:** stores up to 10 bullets, like Placental Siphon. Never blocks Burst, Beam, Pool or Contact.
- **Lv 3 fork:** **Earthed** (its gravity well also pulls small enemies, up to 34 max health) or **Spark Gap** (it fires the arc the moment it catches each bullet, not at the end).
- **Description:** "Makes hair stand on end. You have no hair. Something else is standing on end."
- **Start stats:** 16 damage per arc, 12 s cooldown, pull radius 230.

### F7. Tonic Immobility (`tonic`)
- **Is:** Static, Burst covering the whole screen, tagged for Poise.
- **Signature:** every enemy on screen takes a Static hit that fills its Poise bar, so everything staggers at once (0.8 s; elites 0.55 s, bosses 0.35 s; 11.5). The old 1.5 s freeze of everything is gone: it would be the stun-lock the Poise rules prevent.
- **Limits:** bosses take +50% damage from it instead of a longer lock. The cooldown rises from 9 s to 12 s for a screen-wide effect.
- **Lv 3 fork:** **Upside Down** (the stagger lasts 50% longer on ordinary enemies; elites and bosses unchanged) or **Twitch** (bosses take +150% instead of +50%).
- **Description:** "Turn a shark upside down and it stops moving. Nobody is sure why."
- **Start stats:** 40 damage, 12 s cooldown.

### F8. Spinnbarkeit (`spinnbarkeit`)
- **Is:** Mucus, Projectile with the chaining modifier. Throws stretchy strings between 4 pairs of nearby enemies.
- **Signature:** both ends of a string are Snared and tied together: they count as Conjoined for 3 s (the Conjoined status, section 4), so neither can move and they may hit each other.
- **Limits:** Conjoined caps (max 6 per group). The old "strings carry statuses between them" is gone.
- **Lv 3 fork:** **Elastic** (when a string ends, it flings both ends into each other for one Mucus hit each) or **Ferning** (each string branches to a third enemy: groups of three).
- **Description:** "At ovulation, cervical mucus stretches up to ten centimetres. Someone measured."
- **Start stats:** 12 damage, 7 s cooldown, 4 pairs.

### F9. Hagfish (`hagfish`)
- **Is:** Mucus, Burst centred on you (radius 150).
- **Signature:** an instant burst of slime: everything inside is Snared, and a Mucus patch (standard, 11.6) is left where you are, so it also sets up Flammable Mucus, Slick Move and Sticky Situation.
- **Limits:** Snared follows its own rules (2.5 s, refreshes on hit). The old "bullets slow and sink" is gone (only orbiters and eaters block shots, 12.8).
- **Lv 3 fork:** **Knot Tying** (when the Snare ends, you lunge out at speed in the direction you are swimming) or **Gill Clogger** (enemies it Snares cannot attack while Snared).
- **Description:** "Releases enough slime to fill a bucket in seconds. Sharks give up."
- **Start stats:** 18 damage, 13 s cooldown.

### F10. Shed the Lining (`shedlining`)
- **Is:** Blood, Beam with the sweep modifier: a wide red tide (width 150) rolls across the screen from behind you over 2.6 s.
- **Signature:** it pushes enemies along with it and makes everything it touches Bleed. Enemies that die while bleeding leave blood pools as usual, so it feeds Blood Circuit and Caught in the Clot without making pools itself.
- **Limits:** each enemy is hit once per tide. The old "leaves pools behind" is gone (blood pool sources are fixed, decision 14).
- **Lv 3 fork:** **Heavy Flow** (a wider tide that pushes harder) or **Irregular** (a second tide from the opposite edge).
- **Description:** "Rebuilt monthly. Removed on schedule."
- **Start stats:** 12 damage, 8 s cooldown.

### F11. Running With Scissors (`bladestorm`)
- **Is:** Blood, Spread centred on you with the self-centred and piercing (3) modifiers: a ring of 16 blades.
- **Signature:** every blade cuts and applies Bleed. Moved from Force to Blood: scissors cut, so Squishy does not soften them.
- **Limits:** piercing loses 15% per enemy passed through.
- **Lv 3 fork:** **Safety Scissors** (the blades fly out and come back, the returning modifier, cutting everything twice) or **Pinking Shears** (four more blades in every ring).
- **Description:** "Explodes a ring of blades outward. You were told."
- **Start stats:** 19 damage, 6 s cooldown, 16 blades, speed 460.

### F12. Vanishing Twin (`vanishingtwin`)
- **Is:** Soul, Burst under the toughest enemy nearby (TOUGHEST, range 380).
- **Signature:** a faint copy of you rises under it and fills its Soul bar: it is Possessed at once and fights for you. Bosses take a big hit and a reduced Possessed, as always (11.5).
- **Limits:** Possessed's own rules (4 s, then 8 s before it can happen again). The old "out of play for 3 s" and the Fear on nearby enemies are gone (Fear has two sources only).
- **Lv 3 fork:** **Absorbed** (a 25% chance the enemy never comes back, not elites or bosses; it counts as a kill) or **Survivor's Guilt** (while it fights for you, you take 25% less damage).
- **Description:** "Estimated in up to thirty percent of twin pregnancies. Nobody tells the survivor."
- **Start stats:** 80 damage, 8 s cooldown.

### F13. Wandering Womb (`wanderingwomb`)
- **Is:** Soul, a slow Projectile with the piercing (unlimited) and gravity well modifiers. A ghostly womb drifts in a straight line across the slide for 4 s, through walls.
- **Signature:** it builds Soul on everything it passes, and its gravity well (radius 70, pull 140) drags enemies into its path, so a crowd ends up in a line of Possessed candidates.
- **Limits:** gravity well and Pull rules; it passes walls but never drags anything through one.
- **Lv 3 fork:** **Ectopic** (it stops on the toughest enemy it meets and stays there for 3 s) or **Bicornuate** (two wombs, angled apart; the gravity well cap still applies).
- **Description:** "Ancient Greek doctors believed the uterus roamed the body. They were wrong."
- **Start stats:** 14 damage, 8 s cooldown.

### F14. Brown Fat (`brownfat`)
- **Is:** Fire, Burst (radius 110) with the lobbed and delayed detonation modifiers. A fat globule lands in the crowd, marked, and goes off 2 s later.
- **Signature:** when it goes off, everything inside Ignites at once (its Burn bar fills, then resets: an ordinary Ignition on each target, as with Getting Warmer).
- **Limits:** the old Oil slick and the Water "Don't Mix" eruption are gone with their damage types. The cooldown rises from 7 s to 9 s for a group Ignition.
- **Lv 3 fork:** **Thermogenic** (it goes off at once, no delay) or **Insulation** (radius +50%).
- **Description:** "Burns fat to make heat. Newborns are full of it."
- **Start stats:** 30 damage, 9 s cooldown.

### F15. Ear Candling (`earcandling`)
- **Is:** Fire, Pool. Plants a lit candle behind you for 4 s; the candle is a lure (12.6).
- **Signature:** greedy enemies are drawn to the candle (the lure rule, 12.6), and it drips fire under itself: a Fire Pool footprint (radius 75) that fills the Burn bar of anything close.
- **Limits:** lure rule: bosses ignore it, elites go half as often, at most 3 per Feat. The drips are not wax (wax is Birthday Candle's only) and not a world object reactions use (decision 27).
- **Lv 3 fork:** **Vigil** (two candles) or **Snuffed** (when it burns out, it bursts in a ring of fire: one Fire Burst).
- **Description:** "Removes no earwax. This has been tested."
- **Start stats:** 10 damage per tick, 7 s cooldown.

## Left out, and why

| Old Feat | Why not in the 15 |
| --- | --- |
| Stork Drop, Dummy Spit, Hostile Environment, Lactic Acid | Acid lobs and puddles: covered by Nappy Mines, Upchuck and the matrix Acid Pool |
| Brainstorm, Baby Monitor | Static is covered by Van de Graaff and Tonic Immobility; Baby Monitor would be a stationary pet |
| Latex Barrier | Overlaps Placental Siphon (eat and return shots) |
| Polar Body | A decoy lure: overlaps Ear Candling and Tooth Fairy |
| Slime Mould, Productive Cough, Biofilm, Fertile Window | Mucus is covered by Spinnbarkeit and Hagfish |
| Mosquito | Clashes with the Mosquito enemy; heals per hit, against Extraction's rule |
| Hirudotherapy, Shared Placenta, Anticoagulant | Overlap Leeches, Red Tape and Cauterise |
| Ouija Board | Overlaps the parked Ouija Planchette enemy |
| Donor Sample | Its final hit is a random damage type (one attack, one type) |
| Kiss It Better, Nap Time, Tantrum | Healing, global slow and rage scaling are covered by samples (Second Wind) and signature weapons (Hot and Bothered) |
| Osmosis | Moving statuses between enemies is not a rule |
| Power Shower, Naughty Corner, Rupture of Membranes, Dutch Oven, Fecal Transplant, Crabs, Asymptomatic, Aerosol, Not Latex-Safe, Lipid Bilayer, Self-Lubricating, Surfactant | Built on retired damage types (Water, Cooties, Oil) |
