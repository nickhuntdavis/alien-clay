## 2026-10-17 Player defences and defence cards
- Systems: combat, v10, ui (loot cards only)
- Files: pdef.js (new), game.js, v10.js, render.js, index.html, tests/pdeftest.js (new), tests/v10test.js, tests/fighttest.js
- What: under V10 you start with a base Membrane (30% of max health, recharges like an enemy's) and can hold Shell layers, Squishy, Evasion and Thorns from six new defence cards (Thicker Membrane, Faster Recharge, Shell Layer, Squishy, Evasion, Thorns). Hits resolve in matrix 11.1 order in pdef.js; a hit fully soaked by the Membrane applies no status. Level-ups now offer Switched at Birth plus two different defence cards (one box a wave unchanged). Blue Membrane arc and brown Shell rings are drawn round you; the old armour ring is off under V10.
- Save data: none (G.pd is per run; run log gains fst.pMem, pLayers, pMiss, pThorns).
- Hooks: game.js hurtPlayer -> pdefHurt (replaces the armour block under V10); v10.js v10Tick -> pdefTick, v10Draw -> pdefDraw, v10Loot -> pdefOffer; render.js armourRing skipped under V10.
- Risk: player survivability shifts (a free 30% Membrane); fighttest and v10test adjusted for it. Genome slots (4) are enforced for defence cards only.

## 2026-10-17 Merge v10.04 and record the implementation plan
- Systems: none (docs and merge)
- Files: merge of claude/zealous-clarke-i26iot; NOTES.md (v10 section); redesign docs/README.md
- What: this branch now carries the v10 test build plus the newest redesign docs. NOTES records the Soul, defence and player-armour decisions and the phase plan.

## 2026-10-17 Redesign docs: agent guide for the folder
- Systems: docs only (redesign docs)
- Files: redesign docs/CLAUDE.md (new), redesign docs/README.md, CLAUDE.md
- What: per the user, a CLAUDE.md in the redesign folder tells agents the source-of-truth order, which doc holds what, the hard limits and vocabulary, what to ignore, and the checks before finishing. The root CLAUDE.md points to it.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: mutation cards
- Systems: docs only (redesign docs)
- Files: redesign docs/MUTATIONS.md (new), MODIFIERS.md, UPGRADES.md, COMBAT_MATRIX.md, README.md
- What: per the user, the run's change-the-sample cards are called Mutations (the attack-behaviour list keeps the internal name modifiers). 33 mutations from the user's list, mapped to the rules: body, weapon, damage-type, trade-off and rare synergy. Weapon mutations attach to a weapon (max 3); the rest use Genome slots and rank up when picked again. Bad Blood and Leave a Little Something lost their new ground objects; Crossed Wires became the general Catalyst (the combinations are the 21 reactions). Starting pool of 8.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: Feats as the consciousness's gifts; gravity well and lunge
- Systems: docs only (redesign docs)
- Files: redesign docs/FEATS.md (new), MODIFIERS.md, COMBAT_MATRIX.md, SIGNATURE_WEAPONS.md, WEAPONS.md, UPGRADES.md, VOICE_GUIDE.md, README.md
- What: per the user, Feats are gifts from the consciousness: 16 gifts for every sample (11 from the user's ideas list, 5 new), 8 sample-exclusive gifts (one per sample), and the best 15 of the 48 original Feats mapped to the current rules and re-gifted (gift line on the card, old Scientist line as a Field Guide note), with a suggested starting pool of about 15. New attack modifiers: gravity well (pulls bodies and bends shots; Black Hole, Sofa Crevice, Wandering Womb, Van de Graaff) and lunge (moves you). Utility Feats have no damage or attack type.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: open issues settled (decisions 29 to 32)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, WEAPONS.md, SAMPLES.md, ENEMY_DESIGN.md, UPGRADES.md, DEFENCE_TYPES.md, SIGNATURE_WEAPONS.md, README.md, tables/combat_interactions.csv
- What: per the user, (29) the Force + Soul reaction is renamed Out-of-Body Experience, so the Soul Burst weapon keeps Soul Purpose; (30) The Other Half's First Contact is a fifth reaction trigger kind (Feat): it counts as a hit of the old and new type for reactions only, at most 8 per use; (31) the player gets defences from upgrade cards (Genome slots) or built into some samples, weapons and Feats (no slot); Assimilation is dropped; (32) built-ins stay rare: The Cold Parcel has 20% Evasion, Thorny Onesie gives Thorns, no sample Feat has one.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: COMBAT_MATRIX is the single source; CSVs generated
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, ATTACK_TYPES.md, ENEMY_DESIGN.md, README.md, MODIFIERS.md, WEAPONS.md, SIGNATURE_WEAPONS.md, UPGRADES.md, tables/*.csv, tables/export.py (new)
- What: per the user, every combat rule and status now lives only in COMBAT_MATRIX.md (new: type rules in section 2, all defence rules and interaction rows in section 3, triggers and design status on every status in section 4, attack-type rules in section 13, a where-things-live map and the CSV export in section 14; old section 9 merged away). DAMAGE_TYPES, DEFENCE_TYPES and ATTACK_TYPES are cut to identity, look, strengths and weaknesses plus pointers. ENEMY_DESIGN cites the matrix instead of restating it. The three CSVs are now generated by tables/export.py from the matrix. Stale lines fixed: "named weapon combo", Static "Charge to interrupt", Matchstick's trail as a world object, "five" Soul reactions (six), signature weapon counts, a wrong rule reference on Placental Siphon, Yo-Yo Diet's missing modifier.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: Heartburn signature (returning droplets)
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md, WEAPONS.md, MODIFIERS.md
- What: per the user, Heartburn's signature is "coming back up": each droplet flies out to full range and back, hitting on both passes (the Returning modifier, now allowed on Spread). Damage per droplet 3.4 to 2.4 to compensate.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: shipped ground objects only, greyscale notes gone, tidy-up
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md, DAMAGE_TYPES.md, DEFENCE_TYPES.md, ENEMY_DESIGN.md, SIGNATURE_WEAPONS.md, WEAPONS.md, SAMPLES.md, VOICE_GUIDE.md, tables/*.csv
- What: per the user, only shipped ground objects plus wax (decision 27): Burn zones, corrosive slicks, clot patches and Heartburn's reflux puddle are cut. Slick Move now leaves an Acid Pool, Caught in the Clot Snares the first enemy across the blood pool, Flammable Mucus flares once (a burst, not a zone), Smouldering elites give off a death Burst. Shipped terrain added to the world objects table. Acid stays shocking pink (decision 28). Greyscale notes removed (Lab view is retired). Em dashes replaced, duplicate link removed.
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Heartburn has no signature until one is chosen.

## 2026-10-17 Redesign docs: modifiers stack, forks can rarely change attack type
- Systems: docs only (redesign docs)
- Files: redesign docs/UPGRADES.md, MODIFIERS.md
- What: per the user, a weapon can carry several modifiers (the two-plus-one cap is gone) and a fork can, rarely, change a weapon's attack type (mostly at the Lv 10 mastery fork). Damage type never changes.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: upgrades and progression
- Systems: docs only (redesign docs)
- Files: redesign docs/UPGRADES.md (new), README.md
- What: the progression model: one shared card draft (Acquire, Enhance, Transform, Specialise), slot caps (3 weapons at levels 1/8/22, 3 Feats with the sample's unique Feat fixed, 4 shared Genome slots for mutations and Assimilation defences), Feat levels with forks at 3 and 5, weapon forks at 5 and 10 (one mastery a run; forks use the upgrade modifier slot from MODIFIERS.md, never change attack type), a 50/25/25 sample-type pool lean, Skip/Reroll/Banish (Remove 2, Fewer like this 1) and a one-screen-per-40 s interruption budget.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Redesign docs: pets rule, modifiers, six more signature weapons
- Systems: docs only (redesign docs)
- Files: redesign docs/MODIFIERS.md (new), COMBAT_MATRIX.md (12.3 Pets), SIGNATURE_WEAPONS.md, WEAPONS.md, ATTACK_TYPES.md, README.md
- What: pets get one rule (damage, leash 300, 4 per weapon and 8 in total, 20% of your health, respawn 3 s, ignore statuses and hazards, enemies only target nearby pets). MODIFIERS.md defines 18 modifiers with caps (homing, piercing, chaining, ricochet, returning, orbiting, delayed detonation, lobbed, trail, self-centred, sweep, anchored beam, rapid volley, every Nth, growing, scaling, multiplying, summoned). Twin Telepathy, Blood Blister, Thorny Onesie, Seeker Siblings, Flagellum Flail and Nose Goblins become signature weapons 21 to 26 (68 weapons in all).
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Samples doc: tell, quirk and payoff format
- Systems: docs only (redesign docs)
- Files: redesign docs/SAMPLES.md
- What: SAMPLES.md rewritten in the user's format: design principle (tell, quirk, payoff), one-line roster, a page per sample (core fantasy, behaviour, named passive, Unique Feat, visual signature, consciousness, Scientist, selection-card gag), visual rhythm, guardrails and the guiding test. Rules, starting attack types (linked to WEAPONS.md section 4), unlocks and open decisions kept at the end.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-17 Redesign docs: one weapons list
- Systems: docs only (redesign docs)
- Files: redesign docs/WEAPONS.md (new), README.md
- What: all 62 redesign weapons in one table set (42 matrix weapons from v10.js V10_NAMES, 20 signature weapons) plus the 34 parked originals with reasons. Flags a new name clash: Soul Purpose is both the Soul Burst weapon and the Force + Soul reaction. Section 4 maps each SAMPLES.md sample to its starting matrix weapon.
- Save data: none.
- Hooks: none.
- Risk: none (docs only).

## 2026-10-17 Samples design: eight new playable characters
- Systems: docs only (redesign docs)
- Files: redesign docs/SAMPLES.md (new), README.md, VOICE_GUIDE.md
- What: Eight samples (Baseline to Other Half) to replace the sequences as playable characters: types, starter attack type, passive, unique Feat, Scientist line, unlock, story and visual language each, aligned with the 26 reconciliation decisions (Soul possesses, no automatic Fire spread, Lab view retired, type colours). Profiles become trait-named builds; game modes become "Experiments".
- Save data: none.
- Hooks: none.
- Risk: none now; when built, replacing sequences touches seqsel/seqlock/genes and the META.prof migration.
## 2026-10-17 Redesign docs: Fire signature weapon drafts
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md
- What: five Fire signature drafts, one per attack type beside Pub Crawl's Pool: Heartburn (original `flamer`, moved from Acid), Hot and Bothered, Carpet Burn, Getting Warmer, Burning Sensation. Names checked against the code (Hot Flush, Running a Temperature and Fever Dream are taken).
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Moving `flamer` from Acid to Fire changes Heartburn's existing upgrades and Pairings when ported.

## 2026-10-17 Redesign docs: signature weapons
- Systems: docs only (redesign docs)
- Files: redesign docs/SIGNATURE_WEAPONS.md (new), COMBAT_MATRIX.md (section 12, Fear row), README.md
- What: 15 original weapons (Premature Evangelation, Nappy Mines, Pub Crawl, Peekaboo, Black Hole, Tapeworm Seeder, Red Tape, Due Date, Leeches, Static Cling, Lard Lobber, Placental Siphon, Bubble Wand, Tooth Fairy, Upchuck) return as signature weapons beside the 42-weapon matrix, each retyped to one of the seven types. New rules: echo damage, Pull, allied creatures, player hiding, bounded chains, lures, merging pools, projectile blocking.
- Save data: none.
- Hooks: none.
- Risk: none (docs only). Porting will touch weapon ids that have Pairings on other branches.

## 2026-10-17 Redesign docs: formulas and starting values
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (new section 11, status rows), DAMAGE_TYPES.md, DEFENCE_TYPES.md, ENEMY_DESIGN.md (Damage type column), AUTORUN_AUTOAIM.md (SHELLED, MEMBRANED, TOUGHEST), README.md, tables/*.csv
- What: every mechanic now has a formula and a starting number: hit order (Evasion, Membrane, Shell, Squishy, then crit); one build-up bar formula (raw damage over bar size x max HP, 2 s drain); heavy Force hit at 15% max HP; reaction damage as % of the triggering hit with a 1.5 s lockout; Possessed AI; Charge as a conductor; Extraction on bleeding kills; Membrane recharge only (no supercharge); defence, status and world-object values; enemy damage types on a bell curve; Snot Trap rename.
- Save data: proposed META.rxSeen (reaction discovery); nothing in code yet.
- Hooks: none.
- Risk: none (docs only); numbers need playtest.

## 2026-10-17 Redesign docs: reconciliation (26 decisions)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (rewritten), DAMAGE_TYPES.md, DEFENCE_TYPES.md, ATTACK_TYPES.md, ENEMY_DESIGN.md, VOICE_GUIDE.md, README.md, tables/*.csv (regenerated)
- What: cross-doc contradictions settled one by one (COMBAT_MATRIX.md section 10). Reactions use four trigger kinds (state + hit, world object + hit, dual-type weapon, Pairing) and are identical in every doc; Soul reactions rebuilt on Possessed and the Soul Mark retired; Dodge defence renamed Evasion (miss chance on Contact, Projectile, Spread only); Acid strips Shell for good and has no DoT outside Pools; Fire uses a Burn bar with one Ignition flare and no auto-spread; Squishy blunt only; Shell layers wear slowly under ordinary hits; Mucus smothers Fire; world objects split from statuses; player can have every defence and status except Possessed; reactions are discovered; Lab view to be retired; plain internal ids to come.
- Save data: none yet (decision 19 will rename internal type ids and needs a migration).
- Hooks: none.
- Risk: decisions 19 to 21 (id rename, Lab view retired, palette) are big code changes still to do; see redesign docs/README.md "Follow-on work".

## 2026-10-17 Redesign docs: Soul as mind control, TOUGHEST restored, feature-file enemy rows
- Systems: docs only (redesign docs)
- Files: redesign docs/AUTORUN_AUTOAIM.md (copied from claude/zealous-clarke-i26iot), DAMAGE_TYPES.md, DEFENCE_TYPES.md, COMBAT_MATRIX.md, ENEMY_DESIGN.md, README.md, tables/mechanics_statuses.csv, tables/combat_interactions.csv; NOTES.md (one bullet)
- What: Soul is mind control only: new Possessed status (full build-up turns an enemy on its mates for a few seconds; bounded, bosses reduced); essence and resource bypass removed everywhere (Essence Drain and Soul Fracture rows gone). TOUGHEST restored (HIGHEST HEALTH was removed in AUTORUN_AUTOAIM.md). ENEMY_DESIGN 5.3 now reviews all 27 enemies from foes.js, foes2.js and foes3.js, with revisions for Litmus Cell, Mirror Cell, Platelet Clump and Grease Ball.
- Save data: none.
- Hooks: none.
- Risk: v10 code may still describe Soul with essence wording.

## 2026-10-17 Enemy design doc: review fixes
- Systems: docs only (redesign docs)
- Files: redesign docs/ENEMY_DESIGN.md
- What: Fire damage and Burning separated; defence wording allows enemy-specific states that aren't hidden defences; exact triggers for Static Sock (Crackle by distance), Stress Ball (qualifying hit, reset, decay, hazard-safe rebound), Mosquito (fixed bite, half back within 4 s, not Extraction) and Snot Bubble (any Static hit bursts it); targeting policies framed as tools (TOUGHEST, which doesn't exist, is now HIGHEST HEALTH); roster uses in-game names with code ids, adds Paramecium and lists the unreviewed foes/foes2/foes3 enemies; Fire prototype order (Matchstick first).
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-17 Combat rulings 33 to 38 (docs)
- Systems: docs only (redesign docs)
- Files: redesign docs/COMBAT_MATRIX.md (section 10 rows 33-38, 11.3, 11.5), tables/mechanics_statuses.csv (regenerated)
- What: reaction damage is explicit per reaction (no hidden 60%/150% on every reaction); Corrosion makes unshelled enemies Corroded for 4 s; a hit fully soaked by Membrane applies no status; one shared burn per target; Shell wear rule; the 21 reactions are inventory until playtested.
- Save data: none.
- Hooks: none.
- Risk: none (docs).

## 2026-10-17 Pure combat resolver (combat.js)
- Systems: combat (new)
- Files: web/js/combat.js (new, not yet loaded by index.html), tests/combatunit.js (new, plain node)
- What: matrix 11.1 hit resolution as pure functions (makeDefence, resolveHit, tickDefence, addBurn, COMBAT constants) with decisions 33-37; 45 unit tests. Crits fill bars and judge heavy hits from pre-crit damage.
- Save data: none.
- Hooks: none yet (wired into damageEnemy/hurtPlayer in the slice).
- Risk: none until wired.

## 2026-10-17 Voice line tables (voice.js)
- Systems: voice (new)
- Files: web/js/voice.js (new, not yet loaded)
- What: Scientist and consciousness lines for 19 events with composure tiers, a Scientist and a consciousness first-sighting line for 81 enemies and bosses, 13 first-time status hints, sampleId (1A..1Z, 1AA) and voiceLine (no repeats, tier rarity).
- Save data: none.
- Hooks: none yet (show.js, intro.js, finale.js later).
- Risk: none until wired.

## 2026-10-17 Combat slice: defences and the first reactions in play (v10.05)
- Systems: combat (new fight.js), roster, v10, chemistry, engine
- Files: fight.js (new), roster.js (new, data), combat.js (addBurn renamed burnAdd: chem.js has one), game.js, chem.js, v10.js, meta.js, index.html, tests/fighttest.js (new)
- What: enemies now carry the five defences from the roster (Macrophage Squishy, Diatom/Spire/Water Bear Shell, Mucus Wall/Alpha Swimmer Membrane, Sprinter/Quantum/Ghost Evasion, the new Ingrown Hair Thorns), drawn as rings (blue Membrane arc, brown ring per Shell layer, thorn spikes, dashed Evasion ring) with "miss" puffs. Hits resolve through combat.js; crits come last. Acid builds Corrosion (strips a Shell layer, or Corroded for 4 s) with no damage over time; Mucus Snares (55% slow, puts out Burning); Static Charges (+20% Static, arcs 3 jumps, discharges on death). Five reactions: Corrosive Splash, Snot Rocket, Conductive Pool, Slick Move, Sticky Situation, named on first discovery (META.rxSeen). Per-run stats in G.fst, saved in the run log.
- Save data: META.rxSeen (list of reaction ids) added; run log entries gain `fst`.
- Hooks: game.js damageEnemy -> fightHit (replaces armour under V10; crit multiplier skipped under V10), applyElement guard e.fOk; game.js killEnemy -> fightDeath; chem.js applyElement -> fightStatus; v10.js v10Tick -> fightTick, v10Draw -> fightDraw; meta.js runSummary fst.
- Risk: balance. Bot sim (2 runs) dies at waves 4-5, same as the build before the slice (waves 3-5): v10 has almost no upgrades yet. Blood, Soul and Fire keep v10.04 statuses for now. Shocking Impact needs a dual-type weapon (none yet).

## 2026-10-17 All seven damage types and twenty reactions
- Systems: combat (fight.js), engine
- Files: fight.js, game.js, tests/fighttest.js, tests/v10test.js
- What: Blood Bleeds (30% of the hit over 3 s, 3 at most); dying while bleeding leaves a blood pool and heals you a little (Extraction, 1% max health, 6 a second at most). Soul fills the Possess bar only. Fire adds to one shared burn; Snared puts it out. Two Snared enemies touching are Conjoined for 3 s. The other fifteen reactions now fire: Blood Pressure, Out-of-Body Experience, Flashover, Caustic Breach, Soul Erosion, Premature Evaporation, Blood Circuit, Interference Pattern, Arc Flash, Caught in the Clot, Held in Suspension, Flammable Mucus, Blood Donor, Cauterise, Spectral Combustion (Soul Beam + Burning Ground, both Lv 5+). Area hits now land on Possessed enemies (autoaim still skips them), so the Soul reactions can happen.
- Save data: none new (META.rxSeen gains the new ids).
- Hooks: game.js damageEnemy charmed guard skipped under V10.
- Risk: Possessed enemies can now be killed by your area weapons. Shocking Impact still needs a dual-type weapon.

## 2026-10-17 Draft core (draft.js) (v10.06)
- Systems: draft (new), v10, loot
- Files: draft.js (new), v10.js, game.js, index.html, tests/drafttest.js (new), tests/v10test.js, tests/pdeftest.js
- What: level-ups and elite/boss chests open one shared draft: weapon upgrades, Switched at Birth, defence cards and any card a feature file registers (Feats, mutations). Acquire cards need a free slot (3 Feats, 4 Genome shared by mutations and defences). Weapons reaching Lv 5 or 10 and Feats reaching level 3 or 5 get a 2-card fork screen. Wave mode: one level draft a wave plus chests, at the wave break; race: at most one screen per 40 s (forks never wait). Banish data (G.banish, G.fewer) is honoured; the buttons come with the UI pass.
- Save data: none.
- Hooks: v10.js v10Box -> draftBox, v10Loot -> draftLoot; game.js main loop: a 'wait' from v10Box rotates the box to the back of the queue.
- Risk: more drafts in race mode than v10.04's every-strand switches are fewer now (40 s budget); elite/boss chests now open drafts in wave mode.

## 2026-10-18 Wave-mode drafts queue instead of vanishing; sim uses the real draft rules
- Systems: draft, tests
- Files: draft.js, tests/sim/wave20.js, tests/v10test.js
- What: in wave mode every level-up draft now queues and plays at the wave break (UPGRADES.md 9); before, every level after the first in a wave was dropped. The wave sim now sends boxes through v10Box like the real loop and prints combat stats (G.fst) and the final build per run.
- Save data: none.
- Hooks: none.
- Risk: more upgrades per run in wave mode. Bot sims (3 runs): deaths at waves 8, 5, 8 (was 4 to 5).
