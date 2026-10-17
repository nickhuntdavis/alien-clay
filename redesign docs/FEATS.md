# Feats

Working proposal, 17 Oct 2026. **Feats are gifts from the consciousness** (the pre-incarnate soul that speaks to the sperm, `VOICE_GUIDE.md`). It is trying to help you survive, but it hasn't quite learned what a gift is: its idea of survival is instinctive, affectionate and occasionally unhinged. "Here. I made you a thing. It should help. Probably."

A Feat should make a moment (a near-death escape, a horde shoved away, a lucky kill turned spectacular), not just add a number. These are candidates, not a launch list; the suggested starting pool is section 5.

## 1. How gifts work

- **Slots:** 3 (`UPGRADES.md` 4): slot 1 is the sample's unique Feat (`SAMPLES.md`), slots 2 and 3 are drafted. Sample-exclusive gifts (section 3) are extra draft cards only that sample is offered; they do not replace its slot 1 Feat.
- **Triggers:** every gift performs itself, either on a cooldown or when its moment comes (a hit, a crowd, a kill, near death). Each has a cooldown so the moment stays special. Tapping a Feat slot still performs it early if it is ready (`featTap`); trigger-only gifts (marked *trigger*) can't be tapped.
- **Rules:** a Feat that attacks has one damage type and one attack type and follows `COMBAT_MATRIX.md` like a weapon (11.7); attacking Feats cost stamina. A **utility** gift (no attack: a shield, a pickup, a trail) has no damage or attack type and costs no stamina.
- **Card text** (`VOICE_GUIDE.md` progressive disclosure): name, then the gift line in the consciousness's voice, then one plain sentence of what it does. Numbers and science notes go in the Field Guide.
- **Voice arc:** early gifts are instinctive care ("Here. Safe."); later unlocks get more specific and possessive ("I made this just for you."). The consciousness speaks to the sperm as "you" and never as the sperm.
- **Progression:** level 1 is the gift; levels 2 and 4 improve numbers; levels 3 and 5 are forks (`UPGRADES.md` 5). Each gift lists its Lv 3 fork; Lv 5 forks are still to write.

## 2. Gifts for every sample

| # | Gift | Kind | Type and attack | Moment (trigger) | Cooldown |
| --- | --- | --- | --- | --- | --- |
| G1 | Little Bubble | Defence | Force, Burst (self-centred) | A hit that would take 10%+ of your health | 15 s |
| G2 | Oopsie | Escape | Utility (lunge, hiding) | 6+ enemies within 120 | 12 s |
| G3 | More! | Growth | Utility | Picking up XP below 40% health | 20 s |
| G4 | BIG FEELINGS | Crowd control | Force, Burst (self-centred, scaling) | 5+ enemies within 100 | 8 s |
| G5 | Mine! | Defence | Utility (temporary Membrane) | A big haul: a box, a chest, or 10+ XP orbs within 1 s | 20 s |
| G6 | AND ANOTHER THING | Chain reaction | Force, Burst (delayed detonation) | 3+ kills within 1 s | 6 s |
| G7 | STICKY BUSINESS | Control | Mucus, Burst | An elite, boss or charging enemy comes within 90 | 10 s |
| G8 | NOT YET | Last resort | Force, Burst (self-centred) | A hit would kill you | Once per run |
| G9 | WAIT WAIT WAIT | Emergency control | Mucus, Burst (self-centred) | Below 40% health with 6+ enemies within 180 | 20 s |
| G10 | THIS WAY | Recovery | Utility (trail) | 3 s in danger (hit, or 6+ enemies within 150) | 15 s |
| G11 | COME BACK HERE | Recovery | Utility | An enemy dies within 150 | none (capped) |
| G12 | Jump Scare | Crowd control | Soul, Burst (self-centred) | 3+ enemies within 70 at once | 10 s |
| G13 | THAT ONE | Revenge | Force, Burst | The enemy that hurt you most in 5 s dies | 8 s |
| G14 | Kiss It Better | Recovery | Utility | 3 hits on you within 2 s | 14 s |
| G15 | Nesting | Control | Mucus, Pool | You stay within 60 units for 2 s (HOLD and NEST love this) | 12 s |
| G16 | Packed Lunch | Recovery | Utility (pickup, lure) | Every 40 s while below 60% health | 40 s |

G1 to G11 come from the 17 Oct ideas list; G12 to G16 are new. Copycat folded into Oopsie (same idea; it also overlaps the Peekaboo weapon). SPECIAL BOY duplicated Anhydrobiosis (F3): its "escape untouched for a speed boost" twist becomes Anhydrobiosis's Lv 5 fork option.

### G1. Little Bubble *(trigger)*
- **Gift line:** "I made you a little safe."
- **Does:** when a hit would take 10% or more of your health, a one-hit Membrane takes the whole hit, then bursts: a Force Burst (radius 100) that knocks nearby enemies back.
- **Rules:** a Membrane that holds exactly one hit (its own capacity rule; everything else as section 3 of the matrix). The burst is a normal Force Burst.
- **Lv 3 fork:** **Pop Rocks** (the burst also destroys enemy Projectile and Spread shots inside it) or **Thicker Skin** (it holds two hits before bursting).

### G2. Oopsie *(trigger)*
- **Gift line:** "Wrong way! No, wait. That way!"
- **Does:** when you're surrounded, you lurch through the thinnest gap (lunge, up to 160) and hide for 1 s, leaving an afterimage where you were. Enemies attack the afterimage, and their shots there can hit each other.
- **Rules:** the lunge modifier (`MODIFIERS.md` 20) and the player hiding rule (12.4). No decoy rule needed: the afterimage is just your "last seen spot".
- **Lv 3 fork:** **Pop** (the afterimage bursts when hit: a Force Burst that fills Poise, so they stagger) or **Double Oopsie** (two lurches, one after the other).

### G3. More! *(trigger)*
- **Gift line:** "You need more. Everybody needs more."
- **Does:** picking up XP while below 40% health starts a little feeding frenzy: every XP orb within 250 flies to you, and the next one is worth triple.
- **Lv 3 fork:** **Seconds** (the triple orb bursts into 5 small motes that home in) or **Greedy** (works at any health, 30 s cooldown).

### G4. BIG FEELINGS *(trigger)*
- **Gift line:** "Too much! TOO MUCH!"
- **Does:** when 5 or more enemies press in, a shove bursts out of you (radius 120). Every extra enemy past 5 makes it 20% stronger (scaling, capped at ×2).
- **Rules:** Force knockback (11.5); Squishy halves it.
- **Lv 3 fork:** **Domino** (an enemy thrown into a mate knocks it too, depth 2, as Lard Lobber) or **Sulk** (it also fills their Poise: everyone staggers).

### G5. Mine! *(trigger, utility)*
- **Gift line:** "Found it. It's ours now."
- **Does:** a big haul (a box, a chest, or 10+ XP orbs within 1 s) wraps you in a halo: a temporary Membrane of 15% of your max health for 3 s, plus 0.2 s per orb in the haul (cap 6 s).
- **Rules:** Membrane rules (Force does 50% to it; Static from enemies recharges it).
- **Lv 3 fork:** **Finders Keepers** (when it ends, it pops in a Force Burst that knocks enemies back) or **Hoard** (while it lasts, XP within 250 flies to you).

### G6. AND ANOTHER THING *(trigger)*
- **Gift line:** "You thought we were finished?!"
- **Does:** after 3+ kills within 1 s, a marked pulse goes off 1 s later where most of them died (radius 120), catching whatever rushes into the gap.
- **Rules:** a Force Burst with delayed detonation; bounded chains (12.5).
- **Lv 3 fork:** **Encore** (if the pulse kills 3+, one more pulse at half strength; never a third) or **Rubbernecking** (a gravity well, bodies only, drags enemies to the spot during the 1 s wait).

### G7. STICKY BUSINESS *(trigger)*
- **Gift line:** "Stay! Stay with me!"
- **Does:** when an elite, a boss or a charging enemy comes within 90, a glob hits it and everything within 80: they are Snared.
- **Rules:** Snared (2.5 s; bosses as usual). Snared enemies that touch become Conjoined.
- **Lv 3 fork:** **Traffic Jam** (everything it Snares is Conjoined into one group, max 6) or **Gooey Centre** (it also leaves a Mucus patch).

### G8. NOT YET *(trigger)*
- **Gift line:** "No. No no no. You can't go yet."
- **Does:** the first time a hit would kill you in a run, you stay on 1 health, are untouchable for 1 s, and a violent shove bursts out of you (radius 200).
- **Rules:** once per run. A later unlock (section 5), not in the starting pool: it softens the 1-in-3 win target.
- **Lv 3 fork:** **Bargaining** (if the burst hits 5+ enemies, you heal 25%) or **Denial** (one recharge, after your next boss kill).

### G9. WAIT WAIT WAIT *(trigger)*
- **Gift line:** "Everybody stop. I need a second."
- **Does:** when you're low and surrounded, everything within 180 is Snared and enemy shots inside slow to 20% speed for 2 s. You keep moving.
- **Rules:** Snared as usual; slowing shots is this gift's signature (local, 2 s, never stops them).
- **Lv 3 fork:** **Unpause** (when it ends, each enemy caught takes 30% of the damage it took meanwhile again: echo damage, 12.1) or **Long Second** (3 s).

### G10. THIS WAY *(trigger, utility)*
- **Gift line:** "I know where we're going. I think."
- **Does:** after 3 s in danger, a faint trail of motes points to the safest pocket within 400 (autorun's danger map picks it, and autorun follows it). Reaching the end gives +30% speed for 3 s.
- **Lv 3 fork:** **Snack at the End** (reaching it heals 5%) or **Shortcut** (when you're safe, the trail points to the nearest pickup instead).

### G11. COME BACK HERE *(trigger, utility)*
- **Gift line:** "You look hungry. Eat that one."
- **Does:** when an enemy dies within 150, a scrap of it flies into you: 0.5% of your max health (elites 3%, bosses 10%).
- **Rules:** shares Extraction's cap of 6 health per second.
- **Lv 3 fork:** **Leftovers** (healing past full becomes a temporary Membrane, up to 10% of max health) or **Long Arms** (range 250).

### G12. Jump Scare *(trigger)*
- **Gift line:** "BOO! Did I get them? I got them."
- **Does:** when 3 or more enemies get within 70 at once, the consciousness shrieks: everything within 200 is Feared and flees for 2 s.
- **Rules:** this is the "Jump Scare" Feat the matrix already names as Fear's second source (section 4).
- **Lv 3 fork:** **Made You Look** (fleeing enemies also build Soul) or **Again!** (a second BOO 1 s later).

### G13. THAT ONE *(trigger)*
- **Gift line:** "I didn't like that one. I don't like it now either."
- **Does:** the consciousness points at whichever enemy hurt you most in the last 5 s (a small finger icon over it). When it dies, it goes off in a Force Burst (radius 140).
- **Rules:** the pointer is a Feat-only marker, like Due Date's countdown, not a status.
- **Lv 3 fork:** **Tell Everyone** (the burst also staggers: fills Poise) or **Grudge** (it points at the two worst enemies).

### G14. Kiss It Better *(trigger, utility)*
- **Gift line:** "Mwah. Better?"
- **Does:** after 3 hits on you within 2 s, a kiss mark pops on you and you heal 10%.
- **Lv 3 fork:** **Smoochy** (it also clears Bleed and Burning from you) or **Extra Kiss** (12 s cooldown).

### G15. Nesting *(trigger)*
- **Gift line:** "I made a nest. Get in. Get IN."
- **Does:** stay within a small area for 2 s and a ring of 6 Mucus patches forms around you. Anything crossing it is Snared.
- **Rules:** standard Mucus patches (11.6); they count towards the 40-object cap. HOLD and NEST autorun modes trigger it most.
- **Lv 3 fork:** **Feathered** (patches last twice as long) or **Cosy** (you heal 1% per second while inside the ring).

### G16. Packed Lunch *(trigger, utility)*
- **Gift line:** "I packed you lunch. Don't share it."
- **Does:** every 40 s while you're below 60% health, a yolk drops within 150 of you. Swim into it to heal 15%. Greedy enemies try to eat it first.
- **Rules:** the yolk is a lure (12.6). An enemy that reaches it eats it.
- **Lv 3 fork:** **Lunchbox** (enemies can't eat it) or **Picnic** (heals 25% but lands farther away, within 300).

## 3. Sample-exclusive gifts

The consciousness has noticed something peculiar about one sample and made a gift that wouldn't work on anyone else. One per sample, offered in that sample's drafts only.

| # | Gift | Sample | Type and attack | Moment (trigger) | Cooldown |
| --- | --- | --- | --- | --- | --- |
| X1 | TOO MUCH BABY | The Baseline | Force, Burst (self-centred) | 5 hits taken within 3 s | 12 s |
| X2 | FIRST! | The Overachiever | Static, Contact (lunge) | 4 s of swimming without stopping | 8 s |
| X3 | LOOK WHAT YOU DID | The Late Starter | Blood, Burst (delayed detonation) | Taking a hit | 1.5 s |
| X4 | LOOK AFTER EACH OTHER | The Family Friend | Soul, Contact (orbiting) | Every 12 s | 12 s |
| X5 | Where'd You Go | The Cold Parcel | Utility (lunge) | A heavy telegraphed attack is about to hit you | 10 s |
| X6 | EVERYBODY TOGETHER | The Unsolicited | Static, Burst | 6+ enemies within 160 of each other | 10 s |
| X7 | I MADE EXTRAS | The Unaccounted | Soul, Contact (summoned) | You kill an elite or an enemy with 100+ max health | 10 s |
| X8 | YOU'RE NOT REAL | The Other Half | Its current type, Burst (self-centred) | You gain a status or a mark | 12 s |

### X1. TOO MUCH BABY (The Baseline) *(trigger)*
- **Gift line:** "You're so big. That's good. I think."
- **Does:** the Baseline visibly swells with every hit it takes. At the 5th within 3 s it lets go: a huge shockwave (radius 220) that knocks everything back, and for 3 s it can't be Snared.
- **Rules:** the swelling is shown on the body, not a new HUD meter (`SAMPLES.md` design rule 2).
- **Lv 3 fork:** **Personal Space** (the shockwave leaves a ring-shaped Force Pool footprint for 3 s that shoves back anything crossing it) or **Growth Spurt** (radius +50%).

### X2. FIRST! (The Overachiever) *(trigger)*
- **Gift line:** "You did it first! Do it again!"
- **Does:** after 4 s of non-stop swimming, it launches forward (lunge, 160) and bowls through everything in the way: Static Contact hits that make them Charged and knock them aside.
- **Rules:** lunge cap (160; the mastery fork may double it). Overlaps the Overachiever's own Personal Best (a sprint with a Static wake): keep one, or make Personal Best the slot 1 Feat and FIRST! its stronger late draft.
- **Lv 3 fork:** **Victory Lap** (it bounces to up to 2 elites on the way, then carries on) or **Photo Finish** (the last enemy hit discharges an arc at once).

### X3. LOOK WHAT YOU DID (The Late Starter) *(trigger)*
- **Gift line:** "You hurt my little friend. Now look."
- **Does:** every hit you take sheds a droplet of blood. 1 s later it erupts (radius 70, or 110 for a hit of 10%+ of your health) and makes everything near it Bleed.
- **Rules:** a Blood Burst with delayed detonation; at most 4 droplets at once.
- **Lv 3 fork:** **Clotting** (droplets that touch merge into one bigger eruption, up to radius 150) or **Late Bloomer** (below 30% health, each droplet erupts twice).

### X4. LOOK AFTER EACH OTHER (The Family Friend)
- **Gift line:** "I made you friends! They're very small."
- **Does:** every 12 s, three tiny friends circle you. Each one swallows one enemy Projectile or Spread shot, then pops.
- **Rules:** orbiting modifier and the projectile blocking rule (12.8); orbiters, not pets.
- **Lv 3 fork:** **Plus Ones** (friends also swat enemies they touch, building Soul) or **Connections** (four friends).

### X5. Where'd You Go (The Cold Parcel) *(trigger, utility)*
- **Gift line:** "Where'd you go? There you are!"
- **Does:** when a telegraphed heavy attack (a Burst, a Beam or a charge) is about to land on you, you slip out to the far side of the attacker (lunge, up to 160), leaving a Mucus patch where you were. The attack carries on and can hit its own side (their damage, as in 12.4).
- **Rules:** renamed from PEEKABOO, which clashes with the Peekaboo weapon. Works with the Cold Parcel's built-in Evasion: Evasion handles the small shots, this handles the big ones.
- **Lv 3 fork:** **Ghost Ribbon** (a see-through copy repeats your last second of swimming, Snaring what it touches) or **Slippery When Wet** (6 s cooldown).

### X6. EVERYBODY TOGETHER (The Unsolicited) *(trigger)*
- **Gift line:** "Hold hands! ALL OF YOU!"
- **Does:** when 6 or more enemies bunch up, arcs link the whole cluster: every one of them is Charged, so hits pass arcs between them. With the Unsolicited's passive (Static hits also apply Burn), the crowd lights up.
- **Rules:** Charge (3 jumps, 70% falloff).
- **Lv 3 fork:** **Group Chat** (if the cluster had 10+, it jumps to a second cluster within 300) or **Hold Tight** (a gravity well, bodies only, squeezes the cluster together for 1 s).

### X7. I MADE EXTRAS (The Unaccounted) *(trigger)*
- **Gift line:** "One of you isn't enough. I made more."
- **Does:** killing an elite or a big enemy (100+ max health) makes a see-through copy of you (the Unaccounted's offset double, made real) for 4 s. It copies your swimming and fires your first weapon at 50% damage, then bursts, building Soul on everything near.
- **Rules:** a pet (12.3): it counts towards the 8-pet cap.
- **Lv 3 fork:** **Extras of Extras** (a copy that helps kill a big enemy makes one more copy; never a third) or **Long Shift** (copies last 8 s).

### X8. YOU'RE NOT REAL (The Other Half) *(trigger)*
- **Gift line:** "I don't like the way that one looks at you."
- **Does:** when you gain a status (Snared, Bleed, Burning, Charge, Fear) or a mark (Complement Protein's), a ripple bursts out of you (radius 160): it removes them all from you and hits everything inside with your current damage type, which can set off reactions as normal.
- **Rules:** one attack, one type: the type active when it fires (Adaptive Biology).
- **Lv 3 fork:** **Wrong Planet** (the ripple also staggers elites mid-attack: fills Poise) or **Not From Here** (radius +50%).

## 4. Originals, re-gifted

The best 15 of the 48 original Feats (`SPELLS` in `data.js`, forks in `spellfork.js`), mapped to the current rules. They perform on a cooldown and aim like weapons. Their old Scientist descriptions become Field Guide notes; the card line is now the consciousness's.

### Summary

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

### The Feats

### F1. Sofa Crevice (`blackhole`)
- **Is:** Force, Pool with the lobbed and gravity well modifiers. Tears open a singularity (radius 125) under the densest cluster for 3 s.
- **Signature:** the gravity well drags enemies in (pull 210) and bends shots passing near it, so your own shots curve into the crowd it has gathered.
- **Limits:** the gravity well modifier (`MODIFIERS.md` 19) and the Pull rule (12.2): Squishy halves the pull, elites take 50%, bosses 25%. Moved from Soul to Force, like Black Hole: gravity is displacement.
- **Lv 3 fork:** **Down the Back** (pulls twice as hard) or **Loose Change** (when it closes, it spits everything out in one Burst worth 4 s of its damage).
- **Gift line:** "I found where everything goes. Throw them in."
- **Field Guide note:** "Tears open a singularity that drags and crushes. Everything you ever lost is in there."
- **Start stats:** 16 damage per tick, 10 s cooldown, radius 125, 3 s, pull 210.

### F2. Capacitation (`capacitation`)
- **Is:** Force, Contact with the lunge and growing modifiers. You drive head-first through a line of enemies (range 320).
- **Signature:** each enemy you pass through adds 10% to the next hit (growing, capped at +100%), so the last one in line takes the biggest, often heavy, hit (heavy hits knock off Shell layers and trigger Blood Pressure, 11.3).
- **Limits:** the lunge never passes walls or enters a sealed arena; you can still be hit during it. It is Contact, so Thorns answers each hit. The old "carries every status forward" is gone (no rule moves statuses between enemies).
- **Lv 3 fork:** **Hyperactivated** (you drive twice as far) or **Zona Binding** (the last enemy in line is staggered: its Poise bar fills).
- **Gift line:** "Head down. Go through them. You were built for this. I checked."
- **Field Guide note:** "Sperm cannot fertilise anything until the female tract changes them. Then they can."
- **Start stats:** 40 damage, 7 s cooldown, width 30.

### F3. Anhydrobiosis (`anhydrobiosis`)
- **Is:** Force, Burst centred on you (radius 160). A passive Feat: it performs itself, costs no stamina, and is never tapped.
- **Signature:** when a hit would drop you under 20% health, that hit misses (the Evasion "miss" puff) and you dry into a husk that nothing can hurt for 2.5 s. You cannot move or attack meanwhile. Then you rehydrate in a Burst that knocks everything nearby back.
- **Limits:** once per 18 s. Hazards you are standing in stop hurting while you are a husk, but they are still there when you wake up.
- **Lv 3 fork:** **Vacuum Rated** (the husk destroys enemy Projectile and Spread shots that touch it and fires them back, the projectile blocking rule, 12.8) or **Rehydration** (the Burst also heals 15%).
- **Lv 5 fork option:** **Special Boy** (from the ideas list): get through the husk and the next 3 s untouched and you gain +30% speed and attack speed for 5 s.
- **Gift line:** "Shh. Play dead. I'll wake you."
- **Field Guide note:** "Life without water. Tardigrades dry out, wait, and come back."
- **Start stats:** 20 damage, 18 s cooldown, husk 2.5 s.

### F4. Formic Acid (`formicacid`)
- **Is:** Acid, Beam (width 34). Aimed by SHELLED (most Shell layers left); the old "most armoured" directive is retired.
- **Signature:** a far-too-big ant's head reaches in and snaps the target: its Corrosion bar fills at once (so a Shell enemy loses a layer). The spray continues in a line behind it and half-fills the Corrosion bar of everything it hits.
- **Limits:** Corrosion follows its own rules (11.2); against an enemy with no Shell the snap is just a big Acid hit.
- **Lv 3 fork:** **Worker** (two bites on two targets) or **Pheromone Trail** (the spray leaves Acid Pools along the line, standard size, 11.6). The old "draws enemies along it" lure is gone; lures belong to the lure rule (12.6).
- **Gift line:** "I asked an ant. It said yes. I think it said yes."
- **Field Guide note:** "Twenty quadrillion ants on Earth. Two and a half million per person."
- **Start stats:** 60 damage, 8 s cooldown.

### F5. Bombardier Beetle (`bombardier`)
- **Is:** Acid, Spread (a cone of 6 pulses, range 300) with the rapid volley and lunge modifiers. Fired at whatever is nearest behind you.
- **Signature:** the recoil throws you the other way: a free dash through a gap, aimed by the cone.
- **Limits:** the lunge follows its modifier rules (never through walls). Acid builds Corrosion as usual and has no damage over time.
- **Lv 3 fork:** **Turret** (the cone keeps spraying for 1 s, tracking the densest crowd) or **Escape Artist** (nothing can hurt you during the recoil dash).
- **Gift line:** "Spray it at them! Now run the other way!"
- **Field Guide note:** "Mixes two chemicals in its abdomen and fires them at a hundred degrees. Five hundred pulses a second."
- **Start stats:** 12 damage per pulse, 6 s cooldown.

### F6. Van de Graaff (`vandegraaff`)
- **Is:** Static, Projectile with the orbiting and gravity well modifiers. A charged dome floats beside you for 4 s.
- **Signature:** its gravity well pulls enemy Projectile and Spread shots into it (shots only: it does not pull bodies), and the dome swallows them (projectile blocking, 12.8). When it ends it fires one Static arc per bullet caught, at the nearest enemies; each makes its target Charged.
- **Limits:** stores up to 10 bullets, like Placental Siphon. Never blocks Burst, Beam, Pool or Contact.
- **Lv 3 fork:** **Earthed** (its gravity well also pulls small enemies, up to 34 max health) or **Spark Gap** (it fires the arc the moment it catches each bullet, not at the end).
- **Gift line:** "Give me their bullets. I'm keeping them. Okay, have them back."
- **Field Guide note:** "Makes hair stand on end. You have no hair. Something else is standing on end."
- **Start stats:** 16 damage per arc, 12 s cooldown, pull radius 230.

### F7. Tonic Immobility (`tonic`)
- **Is:** Static, Burst covering the whole screen, tagged for Poise.
- **Signature:** every enemy on screen takes a Static hit that fills its Poise bar, so everything staggers at once (0.8 s; elites 0.55 s, bosses 0.35 s; 11.5). The old 1.5 s freeze of everything is gone: it would be the stun-lock the Poise rules prevent.
- **Limits:** bosses take +50% damage from it instead of a longer lock. The cooldown rises from 9 s to 12 s for a screen-wide effect.
- **Lv 3 fork:** **Upside Down** (the stagger lasts 50% longer on ordinary enemies; elites and bosses unchanged) or **Twitch** (bosses take +150% instead of +50%).
- **Gift line:** "Everybody freeze! Not you. You keep going."
- **Field Guide note:** "Turn a shark upside down and it stops moving. Nobody is sure why."
- **Start stats:** 40 damage, 12 s cooldown.

### F8. Spinnbarkeit (`spinnbarkeit`)
- **Is:** Mucus, Projectile with the chaining modifier. Throws stretchy strings between 4 pairs of nearby enemies.
- **Signature:** both ends of a string are Snared and tied together: they count as Conjoined for 3 s (the Conjoined status, section 4), so neither can move and they may hit each other.
- **Limits:** Conjoined caps (max 6 per group). The old "strings carry statuses between them" is gone.
- **Lv 3 fork:** **Elastic** (when a string ends, it flings both ends into each other for one Mucus hit each) or **Ferning** (each string branches to a third enemy: groups of three).
- **Gift line:** "Now they're holding hands. They hate it."
- **Field Guide note:** "At ovulation, cervical mucus stretches up to ten centimetres. Someone measured."
- **Start stats:** 12 damage, 7 s cooldown, 4 pairs.

### F9. Hagfish (`hagfish`)
- **Is:** Mucus, Burst centred on you (radius 150).
- **Signature:** an instant burst of slime: everything inside is Snared, and a Mucus patch (standard, 11.6) is left where you are, so it also sets up Flammable Mucus, Slick Move and Sticky Situation.
- **Limits:** Snared follows its own rules (2.5 s, refreshes on hit). The old "bullets slow and sink" is gone (only orbiters and eaters block shots, 12.8).
- **Lv 3 fork:** **Knot Tying** (when the Snare ends, you lunge out at speed in the direction you are swimming) or **Gill Clogger** (enemies it Snares cannot attack while Snared).
- **Gift line:** "I made you slimy. Nobody can hold you now."
- **Field Guide note:** "Releases enough slime to fill a bucket in seconds. Sharks give up."
- **Start stats:** 18 damage, 13 s cooldown.

### F10. Shed the Lining (`shedlining`)
- **Is:** Blood, Beam with the sweep modifier: a wide red tide (width 150) rolls across the screen from behind you over 2.6 s.
- **Signature:** it pushes enemies along with it and makes everything it touches Bleed. Enemies that die while bleeding leave blood pools as usual, so it feeds Blood Circuit and Caught in the Clot without making pools itself.
- **Limits:** each enemy is hit once per tide. The old "leaves pools behind" is gone (blood pool sources are fixed, decision 14).
- **Lv 3 fork:** **Heavy Flow** (a wider tide that pushes harder) or **Irregular** (a second tide from the opposite edge).
- **Gift line:** "Out with the old! All of it! Everybody out!"
- **Field Guide note:** "Rebuilt monthly. Removed on schedule."
- **Start stats:** 12 damage, 8 s cooldown.

### F11. Running With Scissors (`bladestorm`)
- **Is:** Blood, Spread centred on you with the self-centred and piercing (3) modifiers: a ring of 16 blades.
- **Signature:** every blade cuts and applies Bleed. Moved from Force to Blood: scissors cut, so Squishy does not soften them.
- **Limits:** piercing loses 15% per enemy passed through.
- **Lv 3 fork:** **Safety Scissors** (the blades fly out and come back, the returning modifier, cutting everything twice) or **Pinking Shears** (four more blades in every ring).
- **Gift line:** "I found sharp things. Don't hold them. Throw them."
- **Field Guide note:** "Explodes a ring of blades outward. You were told."
- **Start stats:** 19 damage, 6 s cooldown, 16 blades, speed 460.

### F12. Vanishing Twin (`vanishingtwin`)
- **Is:** Soul, Burst under the toughest enemy nearby (TOUGHEST, range 380).
- **Signature:** a faint copy of you rises under it and fills its Soul bar: it is Possessed at once and fights for you. Bosses take a big hit and a reduced Possessed, as always (11.5).
- **Limits:** Possessed's own rules (4 s, then 8 s before it can happen again). The old "out of play for 3 s" and the Fear on nearby enemies are gone (Fear has two sources only).
- **Lv 3 fork:** **Absorbed** (a 25% chance the enemy never comes back, not elites or bosses; it counts as a kill) or **Survivor's Guilt** (while it fights for you, you take 25% less damage).
- **Gift line:** "Remember your twin? No? They remember you."
- **Field Guide note:** "Estimated in up to thirty percent of twin pregnancies. Nobody tells the survivor."
- **Start stats:** 80 damage, 8 s cooldown.

### F13. Wandering Womb (`wanderingwomb`)
- **Is:** Soul, a slow Projectile with the piercing (unlimited) and gravity well modifiers. A ghostly womb drifts in a straight line across the slide for 4 s, through walls.
- **Signature:** it builds Soul on everything it passes, and its gravity well (radius 70, pull 140) drags enemies into its path, so a crowd ends up in a line of Possessed candidates.
- **Limits:** gravity well and Pull rules; it passes walls but never drags anything through one.
- **Lv 3 fork:** **Ectopic** (it stops on the toughest enemy it meets and stays there for 3 s) or **Bicornuate** (two wombs, angled apart; the gravity well cap still applies).
- **Gift line:** "This was going to be our room. Look, it's going for a walk."
- **Field Guide note:** "Ancient Greek doctors believed the uterus roamed the body. They were wrong."
- **Start stats:** 14 damage, 8 s cooldown.

### F14. Brown Fat (`brownfat`)
- **Is:** Fire, Burst (radius 110) with the lobbed and delayed detonation modifiers. A fat globule lands in the crowd, marked, and goes off 2 s later.
- **Signature:** when it goes off, everything inside Ignites at once (its Burn bar fills, then resets: an ordinary Ignition on each target, as with Getting Warmer).
- **Limits:** the old Oil slick and the Water "Don't Mix" eruption are gone with their damage types. The cooldown rises from 7 s to 9 s for a group Ignition.
- **Lv 3 fork:** **Thermogenic** (it goes off at once, no delay) or **Insulation** (radius +50%).
- **Gift line:** "I saved you some fat. For burning. Wait for it."
- **Field Guide note:** "Burns fat to make heat. Newborns are full of it."
- **Start stats:** 30 damage, 9 s cooldown.

### F15. Ear Candling (`earcandling`)
- **Is:** Fire, Pool. Plants a lit candle behind you for 4 s; the candle is a lure (12.6).
- **Signature:** greedy enemies are drawn to the candle (the lure rule, 12.6), and it drips fire under itself: a Fire Pool footprint (radius 75) that fills the Burn bar of anything close.
- **Limits:** lure rule: bosses ignore it, elites go half as often, at most 3 per Feat. The drips are not wax (wax is Birthday Candle's only) and not a world object reactions use (decision 27).
- **Lv 3 fork:** **Vigil** (two candles) or **Snuffed** (when it burns out, it bursts in a ring of fire: one Fire Burst).
- **Gift line:** "I lit a candle. Everyone's coming to look at it. Don't look at it."
- **Field Guide note:** "Removes no earwax. This has been tested."
- **Start stats:** 10 damage per tick, 7 s cooldown.

## 5. Suggested starting pool

About 15 universal Feats, then more through unlocks. Every damage type has at least one, so the sample lean (`UPGRADES.md` 7) always has typed Feats to offer.

| Purpose | Feats |
| --- | --- |
| Defence and escape (3) | Little Bubble, Oopsie, Anhydrobiosis |
| Crowd control (3) | BIG FEELINGS, STICKY BUSINESS, Jump Scare |
| Recovery and growth (2) | Kiss It Better, More! |
| Chain reactions (2) | AND ANOTHER THING, Brown Fat |
| Attack Feats (5) | Sofa Crevice (gravity), Formic Acid, Tonic Immobility, Shed the Lining, Vanishing Twin |
| Sample-exclusive (8) | One per sample (section 3), offered only to that sample |

Later unlocks: NOT YET, WAIT WAIT WAIT, THIS WAY, COME BACK HERE, THAT ONE, Nesting, Packed Lunch, Mine! and the other ten originals. Types covered at launch: Force (Little Bubble, BIG FEELINGS, AND ANOTHER THING, Anhydrobiosis, Sofa Crevice), Acid (Formic Acid), Static (Tonic Immobility), Mucus (STICKY BUSINESS), Blood (Shed the Lining), Soul (Jump Scare, Vanishing Twin), Fire (Brown Fat).

## 6. Left out, and why

| Old Feat | Why not in the 15 |
| --- | --- |
| Stork Drop, Dummy Spit, Hostile Environment, Lactic Acid | Acid lobs and puddles: covered by Nappy Mines, Upchuck and the matrix Acid Pool |
| Brainstorm, Baby Monitor | Static is covered by Van de Graaff and Tonic Immobility; Baby Monitor would be a stationary pet |
| Latex Barrier | Overlaps Placental Siphon (eat and return shots) |
| Polar Body | A decoy lure: overlaps Ear Candling, Packed Lunch and Tooth Fairy |
| Copycat (ideas list) | Folded into Oopsie; also overlaps the Peekaboo weapon |
| SPECIAL BOY (ideas list) | Duplicates Anhydrobiosis; its twist becomes Anhydrobiosis's Lv 5 fork option |
| Slime Mould, Productive Cough, Biofilm, Fertile Window | Mucus is covered by Spinnbarkeit and Hagfish |
| Mosquito | Clashes with the Mosquito enemy; heals per hit, against Extraction's rule |
| Hirudotherapy, Shared Placenta, Anticoagulant | Overlap Leeches, Red Tape and Cauterise |
| Ouija Board | Overlaps the parked Ouija Planchette enemy |
| Donor Sample | Its final hit is a random damage type (one attack, one type) |
| Nap Time, Tantrum | Global slow and rage scaling: covered by WAIT WAIT WAIT and Hot and Bothered. (Kiss It Better came back as gift G14.) |
| Osmosis | Moving statuses between enemies is not a rule |
| Power Shower, Naughty Corner, Rupture of Membranes, Dutch Oven, Fecal Transplant, Crabs, Asymptomatic, Aerosol, Not Latex-Safe, Lipid Bilayer, Self-Lubricating, Surfactant | Built on retired damage types (Water, Cooties, Oil) |
