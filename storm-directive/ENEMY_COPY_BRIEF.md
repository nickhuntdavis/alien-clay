# Copy brief: stale enemy text (task A7)

Source: `ENEMY_HANDOFF.md` task A7. Facts: `ENEMY_BEHAVIOUR.md` (v10 roster) and the code paths named in each row. No code or existing text was changed.

## How to use this

- A row marked `TODO_COPY:<id>` needs one line from you. A row marked **delete** needs nothing: the text goes, and no placeholder is written. Delete rows are listed so none is missed.
- **Now** is the current text, with its length in characters. That length is the limit for the replacement.
- **Facts** use the v10 terms. Enemy defences: **Membrane** (a pool that soaks hits first and refills after a rest), **Shell** (layers, 3 off each hit), **Squishy** (Force does 35% less), **Thorns**, **Evasion** (35% of shots miss). Attacks: Contact, Projectile, Spread, Burst, Beam, Pool.
- **Where it appears**: the group heading says it. Enemy intros are first-sighting cards: one at a time, skippable, at least 12 s apart (`INTRO_GAP` in intro.js). Status lines show when the status first lands (statusintro.js). Glossary entries are keyword matches (glossary.js). Boss lines show on the boss's own card. Hold times were not measured.

## Decide these first

Rows depend on these. Answer them before writing copy.

1. **Name of `flame` and `fire`.** ENEMY_BEHAVIOUR calls the `fire` type "Acid" and the `flame` type "Fire". CLAUDE.md maps internal `fire` to Acid, and `V10_TYPES` (v10.js:41) lists `flame`. My reading: Acid is `fire`, and Fire is `flame`. Confirm the player name for `flame`: the Matchstick, Cytokine Caster, Birthday Candle and Fever use it, and rows F3 and B9 depend on it.
2. **Word for armour.** Defences are now Shell (enemies, and the player's Shell layers in pdef.js) and Membrane. I recommend retiring "armour" in all player text. The glossary matches "armour" by regex (glossary.js:22), so a new term needs its own matcher row. That is a code change, not copy.
3. **Glue.** The handoff says gluing is dead, but ENEMY_BEHAVIOUR still names it for the Fever and the Colossus. A2 only deletes the Fever glue trigger if nothing sets it. Rows F7, F8 and C2 depend on this.
4. **The duplicate "never miss" line.** The copy at data.js:835 ("Blasts, beams and pools never miss him") matches boss10.js:14 ("Bursts, Beams and Pools never miss"), which every Evasion boss gets at runtime. I recommend keeping boss10.js:14 and deleting data.js:835 (rows C5, C7).
5. **Rewind.** Rewind, Echo and Chrono are off (norewind.js). I recommend deleting their Field Guide box and glossary entries (F4, F5, F12, G1).
6. **Tip lines.** voice_and_tone.md section 5 says tactical tips belong in the Field Guide, not on the card. Decide whether the rewritten tips move there. This changes the job of rows A2, A4, A6, A8, A18 and A20 (and the other tips).

## Intro keys and the roster they stand for

| Intro key | Roster name | Source |
|---|---|---|
| brute | Macrophage | roster.js:59 |
| spitter | Antibody | roster.js:50 |
| bomber | Acid Bubble | ENEMY_BEHAVIOUR row 13 |
| bulwark | Mucus Wall | by description, ENEMY_BEHAVIOUR row 61 |
| phantom | Ghost Swimmer | by description, row 46 |
| juggernaut | Alpha Swimmer | roster.js:152; ENEMY_BEHAVIOUR row 65 |
| endoskeleton | Second Dose | roster.js:185 |
| diatom | Diatom | row 51 |
| yeast | Candida | row 15 |
| litmus | Litmus Cell (retired by D2) | foes2.js:14 |
| mirror | Mirror Cell | foes2.js:16 |
| shell | Shell Cell | row 45 |
| grease | Grease Ball | row 43 |
| hocker | Phlegm Hocker | row 25 |
| snotbubble | Snot Bubble | row 24 |
| hayfever | Hayfever Cell | row 42 |
| tartar | Tartar Colony (a Colossus copy in Level 1) | levels.js:42 |
| waterbear | Water Bear | row 64 |

---

## A. First-sighting cards (intro.js, `ENEMY_INTRO`)

Shown the first time each enemy is met in a run. `what` is the card. `tip` also shows (question 6).

| ID | Where | Now (chars) | Action | Job and facts to convey | Neighbour |
|---|---|---|---|---|---|
| `TODO_COPY:intro_brute_what` | intro.js:13 | "A big eater with a little armour. Swallows whatever it catches." (63) | rewrite the armour clause | Macrophage: a big soft eater. Facts: Squishy, so Force does 35% less and barely pushes it. Other types land in full. Contact hits hard (16). | intro.js:12 "Part of the host's immune system. Keeps its distance and shoots at you: dodge!" |
| `TODO_COPY:intro_brute_tip` | intro.js:13 | "Armour shred and big single hits. Don't let it pin you against a wall." (70) | rewrite | Facts: Force is weak into it. Any other type works normally. It is slow, so kite it. Shred no longer exists. | intro.js:12 "Its shots are slow. Swim across them, not along them. SHOOTERS FIRST targeting helps." |
| `TODO_COPY:intro_bomber_what` | intro.js:14 | "A bubble of stomach acid that rushes you and bursts." (52) | revise after B1 | Acid Bubble now stops, shows a 0.5 s ring of its burst (radius 60, 18 dmg), then bursts and leaves an Acid Pool. The card should name the ring, not a rush. | intro.js:15 "Divides when it dies: two smaller, faster cells come out." |
| `TODO_COPY:intro_bomber_tip` | intro.js:14 | "Kill it at range, or swim clear when it swells. Its blast hurts other enemies too." (82) | revise after B1 | "Swells" belongs to the Snot Bubble, not this. Facts: the 0.5 s ring is the warning. The Acid Pool it leaves is the hazard. Confirm the pool hurts other enemies before keeping that clause. | intro.js:15 "Splash damage handles the halves. Kill it where your blasts can catch them." |
| `TODO_COPY:intro_bulwark_what` | intro.js:22 | "A slow wall of mucus with heavy armour that shields the enemies behind it." (74) | rewrite the armour clause | Mucus Wall. Facts: a Membrane (50% pool, regenerates after a rest). It gives nearby allies a capped Membrane (B4: range 160, 25% cap). Keep "shields the enemies behind it". | intro.js:21 "Lowers its head, winds up, then charges in a straight line." |
| `TODO_COPY:intro_bulwark_tip` | intro.js:22 | "Armour shred, damage over time (it ignores armour) and HIGHEST ARMOUR targeting." (80) | rewrite | Facts: Acid is the counter. Static recharges its Membrane, so avoid it. Separate it from its allies. The directive name must match the label chosen in A3 (`TODO_COPY:aim_tough_label`). | intro.js:21 "When it stops and shakes, sidestep. It can't turn mid-charge." |
| `TODO_COPY:intro_juggernaut_what` | intro.js:39 | "A huge rival swimmer, armoured and hard-hitting." (48) | rewrite the armour word | Alpha Swimmer. Facts: a Membrane (50% pool) that regenerates. Force and Static, contact 30. "Hard-hitting" stays. | intro.js:38 "A small Pepsinator. All the stomach, half the size." |
| `TODO_COPY:intro_juggernaut_tip` | intro.js:39 | "Shred its armour and keep your distance. Its charge is slow to start." (69) | rewrite | Facts: keep up pressure, because the Membrane refills only if you stop. Static would recharge it. It chases (roster `ai`); it does not charge, so drop "its charge". | intro.js:38 "Treat it like a mini boss: keep moving and hit it hard." |
| `TODO_COPY:intro_endoskeleton_tip` | intro.js:41 | "It has no armour left. Finish it before it reaches you." (55) | revise the word only | Second Dose: defence none. The "no armour left" idea stays, in new words. Spawned only by the Booster. | intro.js:40 "Move as soon as the line settles on you. A Second Dose follows it." |
| `TODO_COPY:intro_diatom_what` | intro.js:31 | "A glass-shelled turret: heavy armour and a ring of shots." (57) | rewrite the armour clause | Facts: Shell x2 (3 off each hit). Acid or one heavy Force hit sheds a layer. It fires a slow, full ring of six (8 dmg, 0.4 s tell). | intro.js:33 "Swims in long straight lines and backs off when it bumps into you." |
| `TODO_COPY:intro_diatom_tip` | intro.js:31 | "Armour shred and big hits. Its rings have gaps." (47) | rewrite | "Its rings have gaps" is wrong: the ring is full (not a fan). Facts: the 0.4 s tell is the warning. Acid and heavy Force shed layers. | intro.js:33 "Predictable: put a trap or a mine in its path." |
| intro_pinworm_what | intro.js:30 | "A wriggling worm. Tougher than it looks and hard to hit side on." (64) | **delete** (A6: cut enemy) | none | intro.js:31 "A glass-shelled turret: heavy armour and a ring of shots." |
| intro_pinworm_tip | intro.js:30 | "Piercing shots go down its length." (34) | **delete** (A6) | none | intro.js:28 "Acid and big blasts. Don't let it eat its way to a giant size." |
| intro_plasmod_what | intro.js:29 | "A giant amoeba made of many. It splits into amoebas when it dies." (65) | **delete** (A6: cut enemy) | none | intro.js:28 "Soft, slow and huge. It eats other enemies and grows, and shrugs off knockback." |
| intro_plasmod_tip | intro.js:29 | "Save your area damage for when it bursts." (41) | **delete** (A6) | none | intro.js:28 "Acid and big blasts. Don't let it eat its way to a giant size." |
| `TODO_COPY:intro_phantom_what` | intro.js:24 | "Fades out of phase: shots pass straight through it while it is faded." (69) | rewrite (found outside the list; B5) | Ghost Swimmer. Facts: it fades for about 1.4 s with a flicker. While faded it stays targetable at Evasion (35% of shots miss), so it is not immune. Contact is off while faded. | intro.js:23 "Fires rings of cytokines in every direction." |
| `TODO_COPY:intro_phantom_tip` | intro.js:24 | "Hit it when it is solid. Auras and trails catch it as it comes back." (68) | revise (found; B5) | Facts: Burst and Beam ignore its Evasion. "Auras and trails" needs checking against the B5 build. | intro.js:23 "Find the gaps in the ring and slip through them. Kill it before the rings stack up." |
| `TODO_COPY:intro_blinker_tip` | intro.js:19 | "Homing shots and chaining static don't care where it went." (58) | revise (found outside the list) | "Chaining static" is the Static arc block, which E1 deletes. Facts: homing shots still find it. Check that blinker is a live id before writing. | intro.js:18 "Area damage and auras. Single shots waste time on them." |
| `TODO_COPY:intro_waterbear_what` | intro.js:32 | "A tardigrade: very tough, very armoured, and it curls into a near-indestructible ball when hurt." (96) | rewrite (found; D5, B8) | Water Bear: Shell x4 (3 off each hit). Tunnelling is removed. Confirm the curl is still a live effect (it may be the tunnelling). | intro.js:31 "A glass-shelled turret: heavy armour and a ring of shots." |
| `TODO_COPY:intro_waterbear_tip` | intro.js:32 | "Back off while it is curled up, then finish it. Damage over time ignores its armour." (84) | rewrite (found) | Facts: four Shell layers. Acid or a heavy Force hit sheds them. It is slow, so walking away works. | intro.js:34 "Kill it quickly: it drops what it ate. Collect XP before it does." |
| `TODO_COPY:intro_yeast_what` | intro.js:37 | "Candida: every cell buds a daughter every few seconds, so a colony doubles and doubles. Sticky to swim through." (111) | revise (found) | "Doubles and doubles" conflicts with the hard cap on colony size. Facts: a visible bud every few seconds, with a hard cap. "Sticky" needs checking. | intro.js:35 "A hollow colony that bursts into daughter colonies when it dies." |
| `TODO_COPY:intro_yeast_tip` | intro.js:37 | "Clear it out early, before it spreads. Acid and Cooties clouds work well." (73) | rewrite (found; Cooties is dead) | Facts: clear it early. Acid works well. Nothing else in the tip is a Cooties claim. | intro.js:36 "Splash damage." |

## B. Enemy intros (foes2.js, foes3.js, `ENEMY_INTRO`)

Same card as group A.

| ID | Where | Now (chars) | Action | Job and facts to convey | Neighbour |
|---|---|---|---|---|---|
| intro_litmus_what | foes2.js:61 | "A cell that has been reading your lab book. It resists whichever damage type you have dealt most this run: its paper strip shows which." (135) | **delete** when D2 lands (Litmus Cell is retired, `w: 0`) | none | foes2.js:62 "Polished to a shine. Shots that hit its front bounce straight back at you." |
| intro_litmus_tip | foes2.js:61 | "Switch it up. A second damage type in your build earns its keep here. Oil bleaches it." (86) | **delete** with D2 (Oil is dead) | none | foes2.js:62 "Hit it from the side or behind, or use blasts and pools. Acid etches the silvering." |
| `TODO_COPY:intro_mirror_what` | foes2.js:62 | "Polished to a shine. Shots that hit its front bounce straight back at you." (74) | rewrite (A4: front reflection removed) | Mirror Cell. Facts: a Membrane soaks hits first and refills after a rest. Its front no longer reflects. | foes2.js:64 "A fungal puffball. Hit it with a blast or a pool and it bursts into a cloud of spores that chase you." |
| `TODO_COPY:intro_mirror_tip` | foes2.js:62 | "Hit it from the side or behind, or use blasts and pools. Acid etches the silvering." (83) | rewrite | Facts: no front, so the side and back are not special. Membrane soaks first: keep hitting. The Membrane percentage is set in A4 (check roster.js). "Acid etches the silvering" has no mechanic behind it. | foes2.js:64 "Single shots are fine. Save the blasts for after it has gone." |
| `TODO_COPY:intro_shell_what` | foes2.js:63 | "A cell that has grown a shell like a whelk. Fifteen points of armour: small hits just tickle." (93) | rewrite the armour clause | Shell Cell: one Shell layer. Each hit takes 3 off it. The "fifteen points" figure goes. | foes2.js:64 "A fungal puffball. Hit it with a blast or a pool and it bursts into a cloud of spores that chase you." |
| `TODO_COPY:intro_shell_tip` | foes2.js:63 | "Big single hits, armour shred and damage over time. Acid dissolves the shell." (77) | rewrite | Facts: Acid strips the layer for good. One heavy Force hit knocks it loose. Then it is soft. Shred is gone. | foes2.js:65 "A spore from a burst Puffball. Small, quick and annoying, like the person who burst it." |
| `TODO_COPY:intro_grease_what` | foes2.js:66 | "A ball of grease. Homing shots slide right off it, and it can't be knocked about." (81) | revise (Squishy, A4) | Grease Ball: Squishy, so Force does 35% less. The homing slide and "heavy" stay (A4). "Can't be knocked about" needs checking against B11. | foes2.js:65 "Anything that hits a crowd." |
| `TODO_COPY:intro_grease_tip` | foes2.js:66 | "Aim properly, or use pools and auras. Mucus gums it up." (55) | rewrite | Facts: Force is weak into it. Other types land in full. Mucus gumming it up is not a mechanic. | foes2.js:65 "Anything that hits a crowd." |
| `TODO_COPY:intro_hocker_tip` | foes3.js:23 | "Strafe, don't back off in a straight line. Water makes it gargle, and its next globs land as puddles that rinse you clean." (122) | rewrite | Facts: the 0.3 s tell. Each glob leaves a Mucus patch (B10). Gargling and rinsing are removed. The patch feeds Static, Fire and Acid reactions (question 1 on the name of Fire). | foes3.js:24 "Pop it early for a small splash, or from range. Static pops it at once, and harmlessly." |
| `TODO_COPY:intro_snotbubble_what` | foes3.js:24 | "A bubble blown out of a nostril. Every hit makes it swell. Pop it too late and it bursts all over the neighbourhood, you included." (130) | revise after B1 | Snot Bubble. Facts: each hit swells it (at most once per 0.1 s). After a 0.5 s tell ring it bursts, doing no damage, and leaves a Mucus patch (radius 80). The "bursts instantly" idea goes. | foes3.js:25 "Allergic to everything, mostly you." |
| `TODO_COPY:intro_hayfever_what` | foes3.js:25 | "Allergic to everything, mostly you. Every few seconds it winds up (AH... AH...) and sneezes a cone at you, and it sneezes back whatever statuses you have given it." (163) | revise | Hayfever Cell. Facts: a 0.8 s wind-up, then a cone of 6 dmg. It reflects one clearly signalled status you gave it (not every status). Confirm how often the cone fires. | foes3.js:24 "A bubble blown out of a nostril." |
| `TODO_COPY:intro_hayfever_tip` | foes3.js:25 | "Step out of the cone when it winds up, and go easy on the statuses. Soak it with Water, then give it Cooties, and it sneezes on its friends instead." (148) | rewrite | Facts: step out during the 0.8 s wind-up. The reflection is one signalled status. Water, Cooties and "sneezes on its friends" are gone. | foes3.js:24 "Pop it early for a small splash, or from range." |

## C. Boss cards (data.js, boss10.js)

Shown on each boss's card: strengths and weaknesses. boss10.js:30 filters out any line with `+N%`, "double damage" or "immune" at runtime, so those lines never show. They are still dead copy, so delete them at source.

| ID | Where | Now (chars) | Action | Job and facts to convey | Neighbour |
|---|---|---|---|---|---|
| `TODO_COPY:boss_colossus_desc` | data.js:810 | "A Y-shaped wall of protein. Heavily armoured, cannot be moved or glued, and charges in straight lines." (102) | rewrite (found outside the list) | Antibody Colossus. Facts: Shell x5 (3 off each hit). Acid strips layers for good. One heavy Force hit knocks one loose. It charges in straight lines (side-step; the lane is drawn after C2). "Cannot be moved or glued" goes with question 3. | data.js:816 "It teleports next to you, then glares: a beam that follows you around." (the Immune Eye desc) |
| `TODO_COPY:boss_colossus_str1` | data.js:811 | "12 armour: small hits barely scratch it" (39) | rewrite | Facts: Shell x5 (3 off each hit). Small hits do almost nothing. | data.js:811 "Cannot be knocked back or glued" |
| boss_colossus_weak1 | data.js:811 | "Static: +60% damage" (19) | **delete** (no per-type weakness in v10; filtered at runtime) | none | data.js:811 "Charges are telegraphed: side-step" |
| boss_colossus_weak2 | data.js:811 | "Armour shred sticks for longer" (30) | **delete** (shred is dead, A2) | none | data.js:811 "Charges are telegraphed: side-step" |
| boss_chad_str2 | data.js:835 | "Flexes: dodges 30% of your shots" (32) | **delete**: boss10.js:14 supplies the v10 Evasion line for Evasion bosses (confirm Chad gets it), and `dodge: 0.3` is removed (A2) | none | data.js:835 "Blindingly fast triple dash" |
| boss_chad_weak1 | data.js:835 | "Winded after every dash: stunned, double damage" (47) | **confirm**: the filter removes it at runtime (double damage), so it never shows. Decide whether the stun is live before deleting | none, unless the stun is live | data.js:835 "Blasts, beams and pools never miss him" |
| boss_chad_weak2 | data.js:835 | "Blasts, beams and pools never miss him" (38) | **delete**: duplicates boss10.js:14 (see question 4) | none | boss10.js:14 "Bursts, Beams and Pools never miss" |
| `TODO_COPY:boss_stone_desc` | data.js:895 | "A crystal of calcium oxalate the size of a grudge. 40 armour: ordinary hits barely scratch it. Armour shred is the way in, and it sticks: the stone cannot grow it back. Every enrage cracks 10 armour off." (203) | rewrite | Kidney Stone. Facts: Shell x6 (3 off each hit). Acid strips layers for good. One heavy Force hit knocks one loose. Each enrage sheds one Shell layer (A2). | data.js:894 "I am not going anywhere. Not without a fight. And a lot of screaming." |
| `TODO_COPY:boss_stone_str1` | data.js:896 | "40 armour: small hits do almost nothing" (39) | rewrite | Facts: Shell x6 (3 off each hit). Small hits do almost nothing. | data.js:896 "Rolls at you, leaving gravel" |
| `TODO_COPY:boss_stone_weak1` | data.js:896 | "Armour shred sticks to it for good" (34) | rewrite | Facts: Acid strips layers for good. One heavy Force hit knocks one loose. Shred is gone. | data.js:896 "Static: +50% (lithotripsy)" |
| boss_stone_weak2 | data.js:896 | "Static: +50% (lithotripsy)" (26) | **delete** (no per-type weakness; `weak` deleted in E1) | none | data.js:896 "Cracks lose 10 armour each" |
| `TODO_COPY:boss_stone_weak3` | data.js:896 | "Cracks lose 10 armour each" (26) | rewrite | Facts: each enrage sheds one Shell layer. | data.js:896 "Rolls at you, leaving gravel" |
| `TODO_COPY:boss_fallback_telegraph` | boss10.js:32 | "Learn the telegraph; every big attack shows where it lands first" (64) | revise after C2. It is shown for the Matron, the Immune Eye and the Pepsinator, and it is untrue until C2 adds their tells | Facts per boss, in place of the fallback: Matron (wardround, 1 s tell, heals nearby enemies); Immune Eye (teleports, then a 30 dmg glare beam, 1 s tell); Pepsinator (acid rain pool, 0.6 s tell; splits at 60% and 30%) | data.js:817 "Teleports right next to you" (the Immune Eye strengths) |
| `TODO_COPY:boss_evasion_bursts` | boss10.js:14 | "Bursts, Beams and Pools never miss" (35) | confirm (found: the copy that replaces data.js:835, question 4) | Facts: Burst, Beam and Pool ignore Evasion. Uses v10 terms. | boss10.js:14 "Evasion: a third of your shots and swipes simply miss" |

## D. Level 1 and the Tartar Colony (levels.js)

Tartar is a Colossus copy in Level 1 (A5). It shows on the level's intro list and on its boss card.

| ID | Where | Now (chars) | Action | Job and facts to convey | Neighbour |
|---|---|---|---|---|---|
| `TODO_COPY:level_tartar_what` | levels.js:42 | "Hardened plaque that walks. Heavily armoured, and it shields the germs behind it." (81) | rewrite the armour clause | Facts: Shell x5 (3 off each hit). The "shields the germs" flavour can stay. | levels.js:41 "A drop of the enzyme in spit. It drifts at you and bursts." |
| `TODO_COPY:level_tartar_tip` | levels.js:42 | "Shred, Static and big hits. Or go round." (40) | rewrite | Facts: Acid strips layers for good. One heavy Force hit knocks one loose. Its charges run in straight lines, so going round works. | levels.js:41 "Shoot it before it reaches you, or let it pop on the crowd." |
| `TODO_COPY:level_tartar_desc` | levels.js:48 | "A slab of something hard and yellow, blocking the way on. Armoured, it cannot be shoved, and it charges in straight lines." (122) | rewrite the armour word (found outside the list) | Facts: Shell x5. It cannot be knocked back. It charges in straight lines. | levels.js:47 "Twenty years without a dentist. We built a city." |
| `TODO_COPY:level_tartar_str1` | levels.js:49 | "8 armour: small hits barely scratch it" (38) | rewrite (found; A5) | Facts: Shell x5 (3 off each hit). Small hits do almost nothing. | levels.js:49 "Cannot be knocked back" |
| level_tartar_weak1 | levels.js:49 | "Static: +60% damage" (19) | **delete** (no per-type weakness) | none | levels.js:49 "Charges are telegraphed: side-step" |

## E. Status cards (pstatus.js, `STATUS_INTRO`)

Shown when the status first lands (statusintro.js). Four statuses. Three are dead.

| ID | Where | Now (chars) | Action | Job and facts to convey | Neighbour |
|---|---|---|---|---|---|
| `TODO_COPY:status_snotty_what` | pstatus.js:28 | "An Antibody glob stuck to you: you swim 20% slower while it lasts. Every Mucus hit adds a bit more." (99) | revise the source: the Antibody is now an Acid shooter (6 dmg, Projectile) | Snotty is a Mucus status. Its source is the Phlegm Hocker's glob. Confirm the 20% figure in fight.js before keeping it. | pstatus.js:29 "A Cytokine Caster gave you Cooties: ..." |
| `TODO_COPY:status_snotty_tip` | pstatus.js:28 | "Swim through one of your own Water puddles, or get wet, to wash it off." (71) | rewrite: Water and wet are dead | Facts: how Snotty ends (confirm: time, or nothing else). | pstatus.js:29 "Rinse it off in a Water puddle, or wait it out before picking up health." |
| status_sick_what | pstatus.js:29 | "A Cytokine Caster gave you Cooties: you lose a little health every second and heal at half rate. It will not finish you off." (124) | **delete** (Cooties is dead; E1 removes Sick) | none | pstatus.js:28 "An Antibody glob stuck to you: you swim 20% slower while it lasts." |
| status_sick_tip | pstatus.js:29 | "Rinse it off in a Water puddle, or wait it out before picking up health." (72) | **delete** | none | pstatus.js:28 "Swim through one of your own Water puddles, or get wet, to wash it off." |
| status_lubricated_what | pstatus.js:30 | "Grease on you: you lose your grip and skid wide in turns. If anything Static hits you now, the grease catches fire." (115) | **delete** (Lubricated is removed in A4) | none | pstatus.js:31 "A Diatom soaked you. Static bullets hit you 60% harder while you are wet." |
| status_lubricated_tip | pstatus.js:30 | "Keep out of the slicks Grease Balls leave. Water does not wash oil off (it just floats), so wait it out." (104) | **delete** | none | pstatus.js:31 "Keep away from Killer T-Cells and Boosters until you dry off." |
| status_soakingwet_what | pstatus.js:31 | "A Diatom soaked you. Static bullets hit you 60% harder while you are wet. On the plus side, the water washes off snot and acid." (127) | **delete** (Wet is removed in E1; the Diatom no longer soaks) | none | pstatus.js:30 "Grease on you: you lose your grip and skid wide in turns." |
| status_soakingwet_tip | pstatus.js:31 | "Keep away from Killer T-Cells and Boosters until you dry off." (61) | **delete** | none | pstatus.js:30 "Keep out of the slicks Grease Balls leave." |

## F. Glossary (glossary.js)

Keyword-matched entries. Each row's keyword match is noted where it changes.

| ID | Where | Now (chars) | Action | Job and facts to convey | Neighbour |
|---|---|---|---|---|---|
| `TODO_COPY:gloss_armour` | glossary.js:22 | "Taken off every hit before it lands (at least 15% of a hit always gets through). Yours wears down a point per hit and grows back when you stop getting hit; enemies' can be shredded." (181) | rewrite; the term changes (question 2), so add a matcher row | Facts for the player: your Shell layers take 3 off each hit. Enemies have Shell, a Membrane or Squishy. The 15% floor is to be confirmed in code. Drop the shred clause. | glossary.js:21 "A chance for a hit to deal extra damage. Crit damage is how much extra (x2 to start)." |
| glossary_shred | glossary.js:23 | "Strips an enemy's armour for a while, so everything hits it harder." (67) | **delete** (shred is dead) | none | glossary.js:24 "Pushes enemies away from the hit. Bosses and heavy enemies barely move." |
| `TODO_COPY:gloss_damage_type` | glossary.js:43 | "Force, Acid, Mucus, Static, Cooties, Oil, Water, Blood or Alien. Each leaves a status on what it hits, and two different ones set off an unstable reaction." (155) | rewrite the list (Cooties, Oil and Water are dead) | Facts: the seven v10 types are Force, Acid, Mucus, Static, Blood, Alien and Fire (question 1). Each type leaves a status (confirm the names). Two different types set off an unstable reaction. | glossary.js:42 "Installs into one weapon (three slots each) and changes how its shots behave." |
| glossary_rewind | glossary.js:50 | "Jumps you back a few seconds. Charges as you kill things." (57) | **delete** (Rewind is off) | none | glossary.js:48 "A permanent, run-changing reward from a boss or a rival." |
| glossary_echo | glossary.js:51 | "Your future self, left behind by a Rewind: it replays your weapons, then bursts." (80) | **delete** | none | glossary.js:52 "How fast you move." |
| glossary_doses | glossary.js:56 | "Cooties stacks: each dose adds damage over time. Top one up to its limit and it spreads (Pandemic)." (99) | **delete** (Cooties is dead). Check the keyword regex first: it also matches "stacking" and "stacks of" | none | glossary.js:55 "A patch on the ground that keeps hurting enemies standing in it." |
| `TODO_COPY:gloss_glued` | glossary.js:61 | "Mucus status at full strength: stuck fast for a moment." (55) | **confirm** (question 3) | If glue survives: stuck fast, with its trigger. If it does not: delete. | glossary.js:62 "Mucus status: slower with every hit. Enough and it is glued in place." |
| `TODO_COPY:gloss_snotty` | glossary.js:62 | "Mucus status: slower with every hit. Enough and it is glued in place." (69) | revise (drop the glued clause if glue is gone) | Facts: Mucus status. Slower with every hit. | glossary.js:61 "Mucus status at full strength: stuck fast for a moment." |
| `TODO_COPY:gloss_melting` | glossary.js:63 | "Acid status: damage over time that eats armour as it goes, and +50% once the armour is gone." (92) | rewrite | Facts: Acid status. Damage over time. Acid strips a Shell layer for good (confirm the +50% clause). | glossary.js:62 "Mucus status: slower with every hit." |
| `TODO_COPY:gloss_charged` | glossary.js:64 | "Static status for 3 seconds: the enemy takes 20% more Static damage and passes arcs on to nearby enemies (3 jumps, a bit weaker each time). It also arcs once when it dies." (171) | revise: remove the arc clauses (E1 deletes the arc block). Keep the 20% only if it is live (confirm) | Facts: Static status for 3 s. Takes 20% more Static damage (if live). | glossary.js:63 "Acid status: damage over time that eats armour as it goes." |
| glossary_sick | glossary.js:65 | "Cooties status: stacking damage over time; it staggers, hits you softer and sneezes it onto its mates." (102) | **delete** (Cooties is dead) | none | glossary.js:64 "Static status for 3 seconds: the enemy takes 20% more Static damage." |
| glossary_chrono | glossary.js:84 | "Chrono energy" (13) and "Earned by fighting. 600 fills a Rewind charge, a little more every time you use one." (84) | **delete** (Rewind is off) | none | glossary.js:83 "A bar of 60. Sprinting (hold the stick at its edge) is 55% faster and burns it." |

## G. Field Guide rules (ui.js)

| ID | Where | Now (chars) | Action | Job and facts to convey | Neighbour |
|---|---|---|---|---|---|
| fieldguide_rewind | ui.js:1320 | The Rewind box: "REWIND sends you ${CHRONO.window}s into the past. Your future self stays behind as a Paradox Echo: ..." (280) | **delete** the whole box (Rewind is off; question 5) | none | ui.js:1323 box title "Unstable reactions" |

The reactions list at ui.js:1322 has no text of its own. Its descriptions come from data.js `REACTIONS` (see H1). The damage-type list at ui.js:1325 reads data.js `ELEMENTS` (names, statuses, blurbs). That data is not in this brief (see "Outside this brief").

## H. Found while checking, outside the list

| ID | Where | Now (chars) | Action | Job and facts to convey | Neighbour |
|---|---|---|---|---|---|
| reaction_gargled | foes3.js:29 (`REACTIONS`) | "Water on a Phlegm Hocker: its next 3 globs land as rinse puddles that wash you clean." (85) | **delete** (Water is dead; B10 removes the gargle) | none | foes3.js:28 `popped`: "Static on a Snot Bubble: it bursts at once, harmless to you, and every enemy nearby is Snotty." (keep) |

---

## Kept (checked, still true)

These lines in the listed ranges stay as they are. Items marked "confirm" depend on a decision above.

- intro.js:40 Booster what and tip (no dead mechanic; Shell x2 is not stated, which is fine).
- foes2.js:64 Puffball what and tip. "Blast" is plain English for Burst; confirm you accept it in player text.
- foes2.js:65 Spore what and tip.
- foes3.js:23 Hocker what (the "Snotty" clause is a Mucus status).
- foes3.js:24 Snot Bubble tip ("Static pops it at once, and harmlessly" is still true).
- foes3.js:28 `popped` reaction.
- data.js:811 "Cannot be knocked back or glued" (confirm: B11 and question 3).
- data.js:811 "Charges are telegraphed: side-step" (true once C2 draws the charge lane; the lane is not drawn yet).
- data.js:893 both Kidney Stone phase lines (each enrage sheds a layer, as the new facts say).
- data.js:896 "Rolls at you, leaving gravel".
- levels.js:49 "The tonsils make good cover" (not checked for mechanics).

## Held

- intro.js:28 Amoeba (parked by D3): leave the text until the engulf decision.
- Litmus rows B1 and B2: delete when D2 lands, not before.

## Outside this brief (needs its own pass)

- **Damage type names and statuses**: data.js `ELEMENTS` (blurb and status shown at ui.js:1325). It lists Cooties, Oil and Water. Write after question 1.
- **Other reaction descriptions**: data.js and foes3.js `REACTIONS` except `popped` and `gargled`. Not checked.
- **Fever and Colossus glue**: rows C2 (`cannot be glued`) and F7 wait on question 3.

## Counts

- Rows: 75 (A 22, B 12, C 14, D 5, E 8, F 12, G 1, H 1).
- Actions: rewrite 33, revise 13, confirm 3, delete 26. Rows that need a `TODO_COPY` line: 46 (rewrite and revise), plus 3 to confirm.
