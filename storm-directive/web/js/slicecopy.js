'use strict';
// Spawn Prawn - plain first-pass copy for the TODO_COPY placeholders (user, 23 Oct: "simple copy, says what it does").
// One map (SLICE_COPY, id -> text). At load it fills the static placeholders (modifier descriptions and rank-up lines,
// sperm passive cards, the Laser, the no-limits setting, race rescue text, v9 sample text); at runtime it fills the
// cards built on the fly (branch and mastery forks, mastery cards). A placeholder with no entry stays as TODO_COPY:id.
// Also gives the weapon modifiers plain names (SLICE_NAMES; quips still found under the old names).
// Hooks: none in shared files. Wraps cardvoice.js cardLine, modcards.js modCard (via modmatrix/modslice), draft.js forkCards, game.js banner
// and makePickup (race rescue text), ui.js UI.renderArmoury. Loads last.

const SLICE_COPY = {
  // ---- the Laser and the setting
  w28_desc: 'A thin red beam. Starts weak and gets stronger the longer it stays on one enemy.',
  set_nolimits: 'No slot limits',
  set_nolimits_hint: 'Testing: weapons take any number of modifiers and you can hold any number of sperm passives. Level-ups list every card you can take. Still 3 weapons and one mastery of each kind.',
  // ---- sperm passives
  sp_extra_desc: 'Allows one more mastery, of a weapon modifier or a sperm passive.', sp_extra_line: 'Overachiever.',
  sp_runs_desc: 'Leaves a trail behind you that hurts enemies, in your sample\'s main damage type. Ranks: longer and wider, then stronger.', sp_runs_line: 'Not now. Not here.',
  sp_fever_desc: 'An enemy that dies burning sets 1 neighbour alight (2, then 3 with ranks). Mastery: burning enemies that touch share their Burn.', sp_fever_line: 'It spreads.',
  sp_space_desc: 'A field round you pushes nearby enemies away. At Rank 2 choose: push harder, or pull them in.', sp_space_line: 'Back off.',
  sp_iric_desc: 'Membrane Shield mastery. While the membrane is up, your shots bounce off its inside instead of leaving it.', sp_iric_line: 'Nothing gets out.',
  br_sp_space_A: 'Repel: the push doubles, and enemies pushed out of the field are staggered. Rank 3: bigger field, pushed enemies collide.',
  br_sp_space_B: 'Attract: the field pulls enemies in instead. Rank 3: bigger field, pulled enemies are slowed.',
  // ---- race rescues and v9 samples (other sessions' placeholders)
  kin_dna_src: 'Rescue DNA', kin_dna_banner: 'RESCUE DNA DROPPED', kin_recycle_btn: 'RECYCLE A WEAPON', kin_recycle_confirm: 'TAP A WEAPON TO RECYCLE IT',
  s9_origin: 'From the old lab', s9_family: 'Old lab',
};
// Modifiers with branches: [description, Rank 2 line, Rank 3 line, branch A, branch B, A Rank 3, B Rank 3, mastery A1, A2, B1, B2]
const SLICE_MODS = {
  rapid: ['Attacks faster, each hit a little weaker.', 'Faster again. Choose a branch.', 'Faster again.',
    'Hail: each hit can fire a free extra shot.', 'Burst Fire: attacks come in bursts; the last of each burst hits harder.',
    'Free shots more often.', 'Longer bursts; the last hit is stronger.',
    'Minigun: the longer it fires, the faster it gets.', 'Hose: one fast, steady stream of weak hits.', 'Clip Dump: every 5th burst empties a rapid spray of shots.', 'Overheat: after 4 s of firing it vents, then releases a blast around you.'],
  focus: ['Damage rises the longer it stays on one enemy. Switching resets it.', 'Higher cap. Choose a branch.', 'Higher cap.',
    'Tunnel Vision: switching targets keeps half the build-up.', 'Spotlight: your other weapons share part of the bonus on the focused enemy.',
    'Keeps three quarters on a switch.', 'Other weapons share more.',
    'Executioner: at full build-up, finishes weak enemies outright.', 'Overfocus: the build-up keeps rising past its cap, but resets fully on a switch.', 'Marked for Death: at full build-up, every weapon deals +50% to the target.', 'Passing the Torch: when the target dies, the build-up passes to the next enemy.'],
  sticky: ['Hits slow enemies.', 'Stronger slow. Choose a branch.', 'Stronger slow; every 3rd hit on one enemy roots it briefly.',
    'Superglue: slowed enemies take more damage from this weapon.', 'Contagious Goo: slowed enemies slow their neighbours.',
    'More damage to slowed enemies; 3rd hits root.', 'The root also spreads to a neighbour.',
    'Roadblock: rooted enemies hold up the ones behind them.', 'Cement: rooted enemies can\'t be moved and take +30% from all your weapons.', 'Epidemic: roots spread through a chain of touching enemies.', 'Sticky Shots: your other weapons\' shots pick up goo and slow what they hit.'],
  connecting: ['Links enemies it hits; linked enemies share some of the damage.', 'Longer links. Choose a branch.', 'Stronger links.',
    'Shared Pain: links last longer, hold more enemies and share more.', 'Network: your other weapons\' hits also travel down the links.',
    'A linked enemy that dies passes its last hit on.', 'Links share more of the other weapons\' hits.',
    'Voodoo Doll: damage from any weapon is shared to every linked enemy.', 'Deadman\'s Wire: a linked enemy that dies blows up its links.', 'Switchboard: status build-up spreads along links.', 'Tripwire: enemies crossing a link take damage.'],
  catalyst: ['Statuses from this weapon build faster, and its unstable reactions hit harder.', 'Stronger. Choose a branch.', 'Stronger.',
    'Fuel: builds even faster on enemies already carrying statuses.', 'Cross-Contamination: your other weapons build statuses faster on enemies this weapon hit.',
    'Builds faster still.', 'Bigger boost for your other weapons.',
    'Chain Reactor: its reactions repeat once on a nearby enemy.', 'Hair Trigger: hits on enemies with 2 or more statuses count as heavy.', 'Reagent: after one of its reactions, every hit on that enemy counts as heavy for 3 s.', 'Mixer: hits copy the target\'s strongest status to enemies nearby.'],
  extra: ['Fires one more shot or beam, each a little weaker.', 'Choose a branch.', 'One more again.',
    'Full Circle: adds a shot or beam behind you.', 'Can\'t Pick One: hits can split into two weaker shots that go for nearby enemies.',
    'One more shot or beam in front.', 'Splits happen more often.',
    'Disco Ball: beams spin out in every direction.', 'Crossfire: an extra beam hits the target from the far side.', 'Swarm: splits make three shots.', 'Overflow: extra splits become small blasts.'],
  range: ['Keeps full damage further away, and shots fly faster.', 'Further. Choose a branch.', 'Further again.',
    'Long Shot: far hits deal extra damage.', 'Overwatch: picks targets further out.',
    'Bigger bonus for far hits.', 'The first far hit on each enemy deals +25%.',
    'Sniper: no damage loss at range; far hits deal much more.', 'Boomerang: far hits deal extra damage.', 'Artillery: shots land as a blast on the target.', 'Tripline: enemies that come within 400 take a free hit.'],
  upclose: ['Much more damage to close enemies, less to far ones.', 'Closer is stronger. Choose a branch.', 'Stronger close up.',
    'Point Blank: very close hits deal extra damage.', 'Packed Room: more damage for each enemy crowded round the target.',
    'Bigger point-blank bonus.', 'Bigger crowd bonus.',
    'Execution: very close hits finish weak enemies.', 'Zero Distance: very close hits ignore shields.', 'Mosh Pit: in a crowd, close hits splash onto everyone nearby.', 'Cornered: double damage to an enemy with another right behind it.'],
  charged: ['Winds up before each attack, then hits much harder.', 'Shorter wind-up, bigger hit. Choose a branch.', 'Shorter wind-up, bigger hit.',
    'Full Charge: keeps charging while nothing is in range.', 'Quick Release: fires early at half charge when an enemy gets close.',
    'A full charge counts as a heavy hit.', 'Half charges keep more of the bonus.',
    'Overcharge: a full charge fires twice.', 'Slow Burn: waiting longer makes the next attack much stronger.', 'Hair Trigger: attacks come twice as often, a little weaker.', 'Capacitor: after a quiet moment, the next attack fires instantly and hits harder.'],
  kinship: ['More damage and status build-up for each other weapon of the same damage type.', 'Bigger bonus. Choose a branch.', 'Bigger bonus.',
    'Purist: extra bonus if every weapon shares this type.', 'Mixed Marriage: bonus for each different damage type you carry.',
    'Bigger purist bonus.', 'Bigger bonus per type.',
    'Full Family: with 3 weapons of the type, +30% damage.', 'Chorus: your other weapons of this type add an echo hit.', 'Melting Pot: with 4 damage types, reactions hit much harder.', 'Referee: when two different types hit one enemy, this weapon gets stronger for 2 s.'],
  knock: ['Hits shove enemies away.', 'Bigger shove. Choose a branch.', 'Bigger shove.',
    'Wall Slam: shoved enemies that hit another take damage.', 'Keep Away: shoves are stronger close to you.',
    'Collisions hurt more.', 'An enemy shoved twice in 2 s flies further.',
    'Bowling Ball: a shoved enemy knocks on the one it hits.', 'Launch: shoves become launches that land with a blast.', 'Repulsor: every 5th hit pushes everything away from you.', 'Trampoline: enemies bounce back off walls into the crowd.'],
  pull: ['Hits draw nearby enemies in towards the target.', 'Stronger pull. Choose a branch.', 'Stronger pull.',
    'Gravity: pulled enemies take more damage from this weapon.', 'Pied Piper: pulls enemies towards your pools and other ground objects instead.',
    'Pulled enemies take more again.', 'Stronger pull towards objects.',
    'Singularity: pulled enemies are crushed together for damage.', 'Tractor: the target is reeled in towards you.', 'Dinner Bell: your ground objects always pull nearby enemies a little.', 'Funnel: pulled enemies line up in single file.'],
  turncoat: ['1 in 20 enemies it kills rises as an ally for a few seconds.', 'Allies last longer, and 1 in 10 kills rises. Choose a branch.', 'Tougher allies, and 3 in 20 kills rise.',
    'Veteran Corps: allies last longer and hit harder.', 'Walking Bombs: allies explode when they expire.',
    'Allies rise tougher.', 'Bigger blasts, and allies run at enemies first.',
    'Sergeant: one ally leads, bigger and stronger.', 'Old Soldier: allies that keep killing stay longer.', 'Chain Gang: enemies killed by a bomb rise as new bombs.', 'Decoy Army: enemies go for your allies before you.'],
  melee: ['Turns the weapon into a close-range strike in front of you.', 'Choose a branch.', 'Stronger combo.',
    'Brawler: strikes come in combos; the last hit is stronger and knocks back.', 'Hit and Run: each strike dashes you to the target.',
    'Longer combo with a bigger finisher.', 'You can\'t be hit while dashing.',
    'Berserker: each hit in a row makes it attack faster.', 'Slam: every combo ends in a ground slam.', 'Slipstream: the dash hits every enemy in a line.', 'Counter: when something hits you, you strike back and take no damage (every 3 s).'],
  ranged: ['The close-range attack lands on an enemy at a distance.', 'Choose a branch.', 'Further reach.',
    'Long Arm: longer reach.', 'Proxy: leaves a marker that repeats the attack.',
    'Even longer reach; also hits a second enemy.', 'Markers last longer.',
    'Grappling Hook: pulls the target to you.', 'Artillery: lands as a much bigger blast.', 'Puppet: markers walk to the nearest enemy.', 'Ventriloquist: markers copy your attacks.'],
  mines: ['Lays mines that go off when enemies come near.', 'More mines. Choose a branch.', 'Mines set each other off.',
    'Minefield: more mines; mines set each other off.', 'Smart Mines: mines creep towards enemies.',
    'Nearby mines set each other off.', 'Mines re-arm once after going off.',
    'Carpet: lays a line of mines.', 'Mega Mine: three close mines merge into one big one.', 'Leech: mines are thrown at enemies.', 'Hunter-Killer: mines are thrown at enemies.'],
  dfa: ['Now and then, a strike from above lands on the target after a short warning. The weapon keeps its own attack.', 'Strikes come more often. Choose a branch.', 'Strikes come more often, and a second strike follows.',
    'Orbital Strike: bigger, stronger strikes.', 'Precision Strike: faster strikes.',
    'A second strike lands on the same spot.', 'Also strikes the second-toughest enemy.',
    'Carpet Bombing: five strikes walk across the crowd.', 'Siege: the spot is struck 4 times.', 'Volley: strikes up to 6 targets at once.', 'Guardian Angel: when you are hit, a strike lands on the attacker.'],
  explode: ['Hits explode, damaging enemies around the target.', 'Bigger blasts. Choose a branch.', 'Bigger blasts.',
    'Pop Pop: every hit explodes, bigger and stronger.', 'A Bit Extra: only kills explode, but much bigger.',
    'Bigger, stronger blasts.', 'Even bigger kill blasts.',
    'Cluster Round: each blast throws three small blasts.', 'Fragmentation: each blast sprays shards.', 'Chain Blast: enemies killed by a blast explode too.', 'Overkill: kill blasts are much stronger; elites explode bigger.'],
  primer: ['Hits mark enemies; a hit from another of your weapons sets the mark off as a blast.', 'Bigger blasts. Choose a branch.', 'Bigger blasts.',
    'Bomb Squad: marks last longer.', 'Tag Team: the mark goes off once two different weapons have hit.',
    'Marked enemies explode when they die.', 'Blasts grow with each weapon that hit.',
    'Chain Primer: blasts mark the enemies they hit.', 'Time Bomb: marks go off on their own after 3 s.', 'Full Roster: triple blast when 3 weapons hit within 2 s.', 'Handoff: after a blast, the mark jumps to the next enemy.'],
};
for (const id in SLICE_MODS) {
  const [d, u2, u3, A, B, A3, B3, A1, A2, B1, B2] = SLICE_MODS[id];
  Object.assign(SLICE_COPY, { ['mod_' + id + '_desc']: d, ['mod_' + id + '_up2']: u2, ['mod_' + id + '_up3']: u3,
    ['br_' + id + '_A']: A, ['br_' + id + '_B']: B, ['br_' + id + '_A_3']: A3, ['br_' + id + '_B_3']: B3,
    ['br_' + id + '_A1']: A1, ['br_' + id + '_A2']: A2, ['br_' + id + '_B1']: B1, ['br_' + id + '_B2']: B2,
    ['mastery_' + id]: 'Mastery: choose one of two final upgrades. One weapon mastery a build.' });
}
const slCopy = s => (typeof s === 'string' && s.startsWith('TODO_COPY:') ? SLICE_COPY[s.slice(10)] || (s.startsWith('TODO_COPY:mastery_') ? 'Mastery: pushes its effect one step further. One weapon mastery a build.' : s) : s);

// ---------------------------------------------------------------- plain modifier names (user, 23 Oct: "simple descriptive names, not clever ones")
const SLICE_NAMES = {
  homing: 'Homing', piercing: 'Piercing', chaining: 'Chain Hits', ricochet: 'Bounce', returning: 'Returning', orbiting: 'Orbiting',
  delayed: 'Delayed Blast', lobbed: 'Lobbed', trail: 'Trail', selfcentred: 'Around You', sweep: 'Sweep', anchored: 'Anchored Beam',
  volley: 'Volley', nth: 'Empowered Attack', growing: 'Growing', scaling: 'Stat Scaling', multiplying: 'Split on Kill', summoned: 'Pets',
  gravity: 'Gravity Well', lunge: 'Lunge', rapid: 'Rapid Fire', focus: 'Focus', sticky: 'Sticky', connecting: 'Link', catalyst: 'Status Boost',
  extra: 'Extra Shots', range: 'Long Range', upclose: 'Close Range', charged: 'Charge-Up', kinship: 'Same Type Bonus', knock: 'Knockback',
  pull: 'Pull', turncoat: 'Raise Allies', melee: 'Melee', ranged: 'Ranged', mines: 'Mines', dfa: 'Strike from Above', explode: 'Explosive Hits',
  primer: 'Mark and Detonate',
};
const SLICE_OLD = {}; // (new name -> old: the card quips are keyed on the old names, cardvoice.js)
for (const id in SLICE_NAMES) if (MODS10[id]) { SLICE_OLD[SLICE_NAMES[id]] = MODS10[id].name; MODS10[id].name = SLICE_NAMES[id]; }
if (typeof cardLine === 'function') cardLine = (orig => function (key) {
  const m = typeof key === 'string' && key.startsWith('mod:') && SLICE_OLD[key.slice(4)];
  return orig(m ? 'mod:' + m : key);
})(cardLine);

// ---------------------------------------------------------------- fill the static placeholders
for (const id in MODS10) MODS10[id].desc = slCopy(MODS10[id].desc);
for (const id in MODUP) MODUP[id] = MODUP[id].map(slCopy);
for (const c of (typeof MUT_REG !== 'undefined' ? MUT_REG : [])) for (const k of ['desc', 'flavour']) { try { if (typeof c[k] === 'string' && c[k].startsWith('TODO_COPY:')) c[k] = slCopy(c[k]); } catch (e) { /* (a getter) */ } }
for (const c of CARDS) for (const k of ['desc', 'flavour']) { try { if (typeof c[k] === 'string' && c[k].startsWith('TODO_COPY:')) c[k] = slCopy(c[k]); } catch (e) { /* (a getter: v9back.js cards) */ } }
for (const d of SETTINGS_DEF) { d.label = slCopy(d.label); d.hint = slCopy(d.hint); }
if (typeof LASER !== 'undefined') { LASER.desc = slCopy(LASER.desc); const d = WEAPONS[LASER.id]; if (d) { d.desc = slCopy(d.desc); d.play = slCopy(d.play); } if (typeof W24_DESC !== 'undefined') W24_DESC[LASER.id] = slCopy(W24_DESC[LASER.id]); }
for (const s of (typeof SAMPLES10 !== 'undefined' ? SAMPLES10 : [])) s.origin = slCopy(s.origin);
if (typeof SL_FAMILY !== 'undefined') for (const k in SL_FAMILY) SL_FAMILY[k] = slCopy(SL_FAMILY[k]);

// ---------------------------------------------------------------- cards built on the fly
const slCard = c => { if (c) for (const k of ['title', 'sub', 'desc', 'quip']) { try { if (typeof c[k] === 'string' && c[k].startsWith('TODO_COPY:')) c[k] = slCopy(c[k]); } catch (e) { /* (a getter) */ } } return c; };
modCard = (orig => function (w, id) { return slCard(orig(w, id)); })(modCard);
forkCards = (orig => function (req) { return orig(req).map(slCard); })(forkCards);
banner = (orig => function (t, c) { return orig(slCopy(t), c); })(banner);
makePickup = (orig => function (k, x, y, o) { if (o && o.name) o.name = slCopy(o.name); return orig(k, x, y, o); })(makePickup);
if (UI.renderArmoury) UI.renderArmoury = (orig => function () { orig.call(UI); const b = $('armRecycle'); if (b) b.textContent = slCopy(b.textContent); })(UI.renderArmoury);
