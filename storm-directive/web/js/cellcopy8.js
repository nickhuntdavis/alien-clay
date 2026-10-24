'use strict';
// Spawn Prawn - plain copy for the weapon cells, part 8: Unwanted Contact (cellmods8.js, tag uc). Same style as cellcopy.js:
// what the modifier does to this one weapon, with numbers, then what ranks 2, 3 and the mastery add. Hooks: none.
// Loads after slicecopy.js and cellcopy.js.
Object.assign(SLICE_COPY, {
  cell_uc_range: 'Less damage lost at range, a faster bolt, and each jump reaches 20 further. Rank 2: 40 further. Rank 3: 60 further. Mastery: no damage lost at range, and jump range doubles.',
  cell_uc_upclose: 'More damage close to you, and a chain that starts within 120 of you gets 1 extra jump. Rank 2: 2 extra jumps. Rank 3: 3. Mastery: every jump within 120 of you Charges its target twice, so it arcs twice.',
  cell_uc_rapid: 'Fires 40% faster, each chain dealing a little less. Ranks 2 and 3: faster again. Mastery: two chains that cross each other both jump once more.',
  cell_uc_charged: 'The weapon winds up for 0.5 s before each chain, then fires one with 1 extra jump and +60% damage (each jump keeps 80% of the last). Rank 2: 3 extra jumps, 0.4 s wind-up. Rank 3: 6 extra jumps, 0.3 s. Mastery: 12 extra jumps, and the chain loses nothing per jump.',
  cell_uc_catalyst: 'Its Charge lasts 25% longer, and its unstable reactions hit 20% harder. Rank 2: 50% and 40%. Rank 3: 75% and 60%. Mastery: every jump can set off an unstable reaction, even on an enemy that has just had one.',
  cell_uc_kinship: '+8% damage for each other Static weapon you carry. Rank 2: +16%. Rank 3: +24%. Mastery: with 3 or more Static weapons, chains lose no damage per jump.',
  cell_uc_knock: 'Each jump shoves its target away from the last enemy in the chain. Ranks 2 and 3: harder shoves. Mastery: jumps launch enemies into each other, and whatever a launched enemy hits takes 40%.',
  cell_uc_pull: 'Each jump tugs its target 30 towards the last enemy in the chain, bunching them up. Rank 2: 60. Rank 3: 90. Mastery: at the end of each chain, every enemy it hit is pulled towards the first.',
  cell_uc_sticky: 'Charged enemies are slowed 30%. Rank 2: 50%. Rank 3: 70%, and the 3rd chain hit on the same enemy within 3 s Snares it for 1 s. Mastery: every enemy a chain hits is Snared.',
  cell_uc_piercing: 'The opening bolt passes through 1 enemy in line, and the chain starts from the last enemy it hits. Rank 2: through 3. Rank 3: through 6. Mastery: through 12, and every enemy it passes through starts its own chain.',
  cell_uc_explode: 'The last enemy in each chain bursts (radius 40, 40% of the jump), Charging what the burst hits. Rank 2: radius 60, 60%. Rank 3: radius 80, 80%. Mastery: every jump bursts. Bursts never start new chains.',
  cell_uc_homing: 'The opening bolt reaches 15% further and bends on to its target. Rank 2: 30%. Rank 3: 45%. Mastery: if the first target has nobody near enough to jump to, the bolt hits it and moves on until it finds one that does.',
  cell_uc_ricochet: 'When a chain runs out of enemies, the arc bounces once more, onwards in the direction it was going, for 20% less. Rank 2: 3 bounces. Rank 3: 6. Mastery: 12, and each bounce starts a new chain (12 extra hits a shot at most).',
  cell_uc_focus: 'Chains that keep starting on the same enemy deal +10% every 0.5 s, up to +40%. Switching targets resets it. Rank 2: up to +80%. Rank 3: up to +120%. Mastery: up to +160%, and at full strength each chain ends by hitting the first enemy again.',
  cell_uc_connecting: 'Enemies a chain jumps through stay linked for 3 s. Sparks crack between them every 0.5 s, and any hit on one arcs to the others for 25%. Rank 2: sparks twice as often. Rank 3: links last 5 s. Mastery: an enemy that wanders between two linked enemies is Charged.',
  cell_uc_turncoat: 'Enemies it kills sometimes rise crackling for 5 s and fight for you, shocking an enemy within 100 every 1 s with a 2-jump chain. Rank 2: 3 jumps. Rank 3: every 0.6 s. Mastery: each shock also Charges every enemy within 100, so your other weapons arc off them.',
  cell_uc_melee: 'No more bolts: any enemy that touches you is zapped for 130% and starts a 3-jump chain. Rank 2: 4 jumps. Rank 3: zapped enemies are thrown off you. Mastery: every second, every enemy within 80 of you is Charged.',
  cell_uc_mines: 'Lays Charged mines where you are instead of firing (3 at a time). An enemy that trips one starts a chain from it for 120%. Rank 2: 5 mines. Rank 3: +1 jump. Mastery: a tripped mine sets off every other mine within 220, and each starts its own chain.',
  cell_uc_dfa: 'A bolt strikes the first target from above for 140% after a 0.4 s warning, then chains as normal. Rank 2: +1 jump. Rank 3: the first target is Charged twice, so it arcs twice. Mastery: every jump is also struck from above for 50%.',
  cell_uc_nth: 'Every 4th chain has 2 more jumps. Rank 2: every 3rd. Rank 3: it loses no damage per jump. Mastery: the empowered chain ends by jumping back to its first target.',
  cell_uc_extra: 'Fires 1 more chain each time, each dealing a little less, branching a different way from the same target. Rank 2: 1 more again. Rank 3: the chains start on different enemies. Mastery: a chain in every direction (8 at most).',
  cell_uc_orbiting: 'No more bolts: 2 Charged orbs circle you and start a chain at any enemy that comes near one. Rank 2: 3 orbs. Rank 3: +1 jump. Mastery: the orbs arc to each other in a crackling ring that zaps and Charges whatever crosses it.',
  cell_uc_area: 'Each jump sets off a small Static burst (radius 40, 25% of the jump) that Charges what it touches, and every burst is 25% bigger per rank. Bursts never start new chains.',
});
