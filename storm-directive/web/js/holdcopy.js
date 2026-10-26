'use strict';
// Spawn Prawn - the last open copy, and the press-and-hold view of a modifier card (user, 25 Oct: "explain what the
// modifier will do in that instance as well as the stat changes").
//  - COPY: fills the placeholders still open at load (boss signature lines, the health and Membrane cards) and the ones
//    built on the fly (Switched at Birth levels, the water-balloon cells cell_bl_*), through SLICE_COPY (slicecopy.js).
//  - HOLD VIEW: holding a modifier card shows, for each weapon it can go on: what it does on THAT weapon at the rank the
//    card gives (the weapon's own cell or Delivery text where one exists, else HC_MOD below with the weapon's own nouns
//    and the rank's real numbers), what this rank adds, and the weapon's numbers before and after (computeStats with the
//    modifier added, then put back). Other cards keep glossary.js's view.
// Hooks: none in shared files. Wraps glossary.js cardGlossary and modmatrix.js/sabtiers.js sabCard. Loads after modpick.js.

// ---------------------------------------------------------------- copy
Object.assign(SLICE_COPY, {
  // Health and Membrane cards (membrane.js)
  hp_marrow_title: 'Bone Marrow', hp_marrow_desc: '+12% max HP per rank, and you heal what it adds. A Membrane grows with it.',
  hp_scab_title: 'Scab Over', hp_scab_desc: 'Below half health, regenerate 0.6% of your max HP every second per rank. Do not pick at it.',
  hp_slurp_title: 'Slurp', hp_slurp_desc: 'Every kill heals 0.8% of your max HP per rank. It counts towards your lifesteal limit.',
  hp_scar_title: 'Scar Tissue', hp_scar_desc: 'After a hit, take 8% less damage per rank for 3 seconds. The second hit always hurts less.',
  hp_spill_title: 'Spillover', hp_spill_desc: 'Healing past full health refills your Membrane instead of going to waste.',
  hp_coat_title: 'Second Coat', hp_coat_desc: 'Your Membrane mends 5% of its size every second per rank, even under fire.',
  // Switched at Birth in three levels (sabtiers.js)
  sab_l1_desc: 'The hospital mixed up the tags, partly. 35% of this weapon\'s attacks now deal the new damage type. It keeps its level and upgrades. Two more of these finish the job.',
  sab_l2_desc: 'More paperwork errors. 70% of its attacks now deal the new damage type.',
  sab_l3_desc: 'The final mix-up. Next you choose: every attack in the new damage type, or every attack in both.',
  sab_l3a_name: 'Clean Break', sab_l3a_desc: 'Every attack deals the new damage type. The old one is gone, and nobody mentions it.',
  sab_l3b_name: 'Both Sides of the Family', sab_l3b_desc: 'Every hit lands as the new damage type at 60%, plus an echo of the old one at 60%. Both statuses go on, so this one weapon can set off its own unstable reaction.',
  // The two pools as water balloons (cellmods4.js; Nocturnal Emission and Hot Mess share these)
  cell_bl_range: 'The balloon bursts on the first enemy in its path and the spray carries on the way it was thrown, soaking the enemies behind; the puddle lands as a line, not a circle. Reach +20%. Ranks 2 and 3: reach +40 / 60%, a longer spray. Mastery: at full reach the spray rolls on as a wave to the edge of the screen, pushing and soaking everything in line.',
  cell_bl_upclose: 'The enemy it hits in the face takes +40%; the spray and the edge of the puddle do 60%. Ranks 2 and 3: face +80 / 120%, edges 50 / 40%. Mastery: an enemy that comes within 120 of you gets a balloon in the face at once (every 3 s at most).',
  cell_bl_rapid: 'Throws 40% faster, but each splat is 20% smaller. Splats that overlap merge into one puddle, up to 3 times the size. Ranks 2 and 3: 80 / 120% faster, 30 / 35% smaller. Mastery: a puddle merged from 3 or more splats ripples once a second, hitting everything in it for 30%.',
  cell_bl_charged: 'The balloon swells on your nose for 0.5 s, then lands 60% bigger, and the enemy it hits takes +60%. Ranks 2 and 3: 0.4 / 0.3 s, +90 / 120%. Mastery: the balloon sticks to its target and bursts 1 s later, after it has carried it into its friends.',
  cell_bl_catalyst: 'Puddles shrink to 60% as they dry but get stronger: statuses fill up to 25% faster by the end, and unstable reactions in them hit 20% harder. Ranks 2 and 3: fill +50 / 75%, reactions +40 / 60%. Mastery: a reaction in a puddle\'s last second refills it to full size (once per puddle).',
  cell_bl_kinship: 'Besides the usual bonus for each other weapon of the same damage type, each one adds a small extra to every splat (a bubble trap, a mine, a tape bundle or a beam flash, by weapon). Ranks 2 and 3: extras +25 / 50%. Mastery: with 3 or more, every 3rd balloon carries each extra twice.',
  cell_bl_knock: 'Puddles have no friction. Enemies in them keep sliding the way they were going, and knockback from any of your weapons sends them skating; a skater that hits another enemy deals 30% to both. Ranks 2 and 3: they slide twice / three times as far. Mastery: the balloon\'s impact sends its target skidding through the crowd, bowling over whatever it meets.',
  cell_bl_pull: 'Puddles drain towards their centre, swirling in enemies within 60 of the edge; in its last second a puddle gurgles and pulls hard once. Ranks 2 and 3: reach 120 / 180. Mastery: the last gurgle swallows everything to the centre and spits a fresh balloon at the nearest group.',
  cell_bl_sticky: 'Enemies leaving a puddle leave sticky footprints for 2 s that slow anything on them by 30%. Footprints never Snare, so burning puddles stay lit. Ranks 2 and 3: 3 / 4 s, 50 / 70%. Mastery: enemies that bump into each other in a puddle stick into a slow-rolling ball (up to 8) that the puddle keeps hitting.',
  cell_bl_piercing: 'The balloon punches through 1 enemy, dripping on it (a fifth of a status fill), and bursts on the next. Ranks 2 and 3: through 3 / 6. Mastery: through 12, and the burst sends a jet on through the next 6 in line.',
  cell_bl_explode: 'An enemy that dies in a puddle bursts like a balloon: 40% damage to everything within 40, and a small puddle of its own (every 0.5 s at most). Ranks 2 and 3: radius 60 / 80, 60 / 80%. Mastery: a puddle erupts when it runs out, 10% bigger and stronger for every enemy that stood in it (up to double).',
  cell_bl_homing: 'Puddles creep towards the nearest enemy outside them at 20 a second, like spilt water finding the low point. Never through walls. Ranks 2 and 3: 40 / 60 a second. Mastery: a puddle that reaches an enemy splits in two to chase two more (once per puddle).',
  cell_bl_ricochet: 'The balloon is too thick to burst on its first target: it bounces off, leaving a small splat (80%), and bursts on the next. Ranks 2 and 3: 3 / 6 bounces, each splat 20% smaller. Mastery: it also bounces off walls, and each wall bounce makes its splat 10% bigger (12 bounces in all).',
  cell_bl_focus: 'Enemies take +10% for every 0.5 s they stay in a puddle, up to +40%; stepping out resets it. Ranks 2 and 3: up to +80 / 120%. Mastery: an enemy at the full bonus drips small puddles wherever it walks for 3 s.',
  cell_bl_connecting: 'All your puddles are linked like connected tanks: 30% of the damage dealt in one is echoed to enemies standing in the others. Ranks 2 and 3: 50 / 70%. Mastery: when a puddle ends, its remaining time pours into your nearest other puddle, which grows to match.',
  cell_bl_turncoat: 'An enemy that dies in a puddle rises at its edge for 5 s as a lifeguard, shoving escaping enemies back in. Ranks 2 and 3: 7 s, and twice as hard. Mastery: when a lifeguard\'s shift ends it throws a balloon at the nearest group.',
  cell_bl_melee: 'No throw. The balloon is smashed into the face of the nearest enemy within 80 for +50%, and the puddle forms round you both. It does not hurt you. Ranks 2 and 3: reach 100, +75%. Mastery: swimming into your own puddle sends a splash wave through it, hitting everything in it (once per puddle).',
  cell_bl_ranged: 'Each puddle squirts a jet at the nearest enemy outside it (within 150) once a second, for 30% plus its status. Ranks 2 and 3: 2 / 3 jets a second. Mastery: the jets spin out in every direction, 6 a second at 20% each.',
  cell_bl_mines: 'Balloons are left on the floor unburst instead of thrown (3 at once, 14 s each). An enemy that treads on one bursts it up into its own face. Ranks 2 and 3: 4 / 5 balloons. Mastery: a floor balloon bursting sets off every other one within 160.',
  cell_bl_dfa: 'The balloon drops on the crowd unburst after a 0.6 s warning, and the first enemy to tread on it splashes 3 puddles round itself. Rank 2: splashes +30%. Rank 3: 4 splashes. Mastery: it bursts high above and rains for 2 s, the puddle growing while it falls.',
  cell_bl_primer: 'Every puddle is a primer. The first hit from another of your weapons inside it sets the whole puddle off as a blast its own size, for 50% of base damage, and uses it up. Ranks 2 and 3: 75 / 100%. Mastery: the blast throws the remains as 3 new balloons at nearby enemies.',
  cell_bl_nth: 'Every 4th balloon is giant: twice the size, and its puddle lasts three times as long. Rank 2: every 3rd. Rank 3: its target also takes +50%. Mastery: the giant balloon bursts in the air over the crowd and rains a puddle over all of it.',
  cell_bl_extra: 'The balloon splits in mid-air into 2 smaller ones that burst on 2 different enemies, each a little weaker. Ranks 2 and 3: 3, then 4. Mastery: the splits land in a ring round the crowd and become one big puddle.',
  cell_bl_orbiting: 'An unburst balloon circles you (72 out) and bursts on the first enemy it touches; it regrows after 2 s. Ranks 2 and 3: 2 / 3 balloons, 100 out. Mastery: when you are hit, every circling balloon bursts round you at once.',
  cell_bl_area: 'Splats are 25% bigger per rank, on top of the usual Area bonus. Mastery: every 10 s all your puddles surge to double size for 1 s.',
});
// One strengths line per boss for its signature move (bosssig10_t1/t2/t3.js), about 60 characters.
const HC_BOSS_SIG = {
  queen: 'Rings the dinner bell: her adds rush you down a marked line',
  colossus: 'Sweeps three arms of shots at once, in a Y',
  eye: 'Its glare sweeps a marked wedge of the arena',
  matron: 'Walks a marked route between beds, healing all she passes',
  pepsin: 'Floods half the arena with rolling acid',
  alpha: 'Every dash lands with a shockwave',
  fever: 'Hot flushes: three heat waves, one safe gap in each',
  twins: 'They flank you and fire a beam down the lane between them',
  ghost: 'Two false positives blink with her. The real one is ringed',
  litmus: 'Titration: an advancing line that drips acid as it goes',
  johnny: 'Unrolls a latex band that blocks your way',
  mucus: 'Drips on wherever you stand, leaving mucus behind',
  cramp: 'Contractions: a ring closes in and drags you to the middle',
  sneeze: 'Sniffles: a cloud of slow droplets that land as mucus',
  stone: 'Every Shell layer it sheds rolls at you as gravel',
};
for (const tbl of [BOSSES, typeof ROSTER_BOSSES !== 'undefined' ? ROSTER_BOSSES : []]) for (const b of tbl) {
  if (b && b.strengths) b.strengths = b.strengths.map(s => { const m = /^TODO_COPY:boss_(\w+)_sig$/.exec(s); return m && HC_BOSS_SIG[m[1]] ? HC_BOSS_SIG[m[1]] : s; });
}
for (const c of CARDS) for (const k of ['title', 'desc']) { try { if (typeof c[k] === 'string' && c[k].startsWith('TODO_COPY:')) c[k] = slCopy(c[k]); } catch (e) { /* (a getter) */ } }
if (typeof sabCard === 'function') sabCard = (orig => function () { return slCard(orig.apply(this, arguments)); })(sabCard);

// ---------------------------------------------------------------- the hold view: words
// What one attack is called on each weapon (singular, plural). Unlisted weapons use their attack type's.
const HC_NOUN = {
  v_phys_proj: ['heavy shot', 'heavy shots'], v_phys_spread: ['pellet', 'pellets'], v_phys_contact: ['snap', 'snaps'], v_phys_burst: ['shockwave', 'shockwaves'],
  v_fire_proj: ['glob of acid', 'globs of acid'], v_shock_beam: ['beam', 'beams'], v_ice_pool: ['balloon of snot', 'balloons of snot'], v_arcane_proj: ['needle', 'needles'],
  v_soul_proj: ['spirit', 'spirits'], v_flame_pool: ['balloon of burning fuel', 'balloons of burning fuel'], s_void: ['vortex', 'vortices'], s_lard: ['dollop', 'dollops'],
  s_siphon: ['returned bullet', 'returned bullets'], s_mines: ['mine', 'mines'], s_twin: ['beam', 'beams'], s_tesla: ['zap', 'zaps'], s_redtape: ['strip of tape', 'strips of tape'],
  s_bubble: ['bubble', 'bubbles'], s_duedate: ['countdown', 'countdowns'], s_seeker: ['sibling', 'siblings'], s_peekaboo: ['BOO', 'BOOs'], s_toothfairy: ['egg', 'eggs'],
  s_parasite: ['larva', 'larvae'], s_wake: ['patch of trail', 'patches of trail'], acro_cap: ['headbutt', 'headbutts'], acro_spray: ['droplet', 'droplets'], acro_spark: ['spark', 'sparks'],
  v_flame_beam: ['beam', 'beams'],
};
const HC_ATK = { proj: ['shot', 'shots'], spread: ['pellet', 'pellets'], contact: ['strike', 'strikes'], burst: ['blast', 'blasts'], beam: ['beam', 'beams'], pool: ['puddle', 'puddles'] };
const hcKey = w => (typeof w24Key === 'function' ? w24Key(w) : w.def.id);
const hcPct = v => Math.round(v * 100) + '%';
const hcOrd = n => n + (n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
const hcAt = (a, k) => (Array.isArray(a) ? a[Math.min(a.length, k) - 1] : a);
const hcCap = (id, key, k) => hcAt(((MODS10[id] || {}).cap || {})[key], k);
const hcFirst = s => s.charAt(0).toUpperCase() + s.slice(1);

// What each modifier does, in the weapon's own words. x: W (weapon name), one, many (its attack), k (the rank this card
// gives, 1 to 3), atk (attack type), w (the slot).
const HC_MOD = {
  homing: x => `Each ${x.one} curves towards its target (turning strength ${hcCap('homing', 'turn', x.k)}). If the target dies first, it flies straight on, and enemies can still dodge it.`,
  piercing: x => `Each ${x.one} carries on through up to ${2 * x.k} enemies instead of stopping at the first, losing 15% of its damage for each one it passes.`,
  chaining: x => `After each hit the ${x.one} jumps to another enemy within ${hcCap('chaining', 'range', x.k)}, up to ${hcCap('chaining', 'jumps', x.k)} times; each jump does ${hcPct(hcCap('chaining', 'falloff', x.k))} of the one before.`,
  ricochet: x => x.atk === 'beam' ? `The beam bounces off walls at the true angle (${[1, 3, 6][x.k - 1]} bounce${x.k > 1 ? 's' : ''}), losing 20% a bounce.`
    : `Each ${x.one} bounces off walls up to ${hcCap('ricochet', 'bounces', x.k)} times instead of breaking, losing ${hcPct(hcCap('ricochet', 'loss', x.k))} a bounce.`,
  returning: x => { const b = hcCap('returning', 'back', x.k); return `Each ${x.one} flies out, then turns round and comes back to you, hitting on the way out and on the way back: up to ${hcCap('returning', 'hits', x.k)} hits${b > 1 ? `, and the way back hits ${hcPct(b - 1)} harder` : ''}.`; },
  orbiting: x => x.atk === 'beam' ? `The beam becomes a ring round you (${x.k > 1 ? 100 : 72} out) that burns whatever it touches${x.k >= 3 ? ', enemy shots included' : ''}.`
    : `${x.W} attacks from ${hcCap('orbiting', 'bodies', x.k)} bodies circling you, 72 out, instead of from you. They cannot be hit and do not count as pets.`,
  delayed: x => { const d = hcCap('delayed', 'dmg', x.k); return `Each ${x.one} is set down and marked on the ground instead of going off at once. It goes off when an enemy comes near, or after 14 s. Up to ${hcCap('delayed', 'placed', x.k)} set at once${d > 1 ? `, each +${hcPct(d - 1)}` : ''}.`; },
  lobbed: x => { const a = hcCap('lobbed', 'area', x.k); return `Each ${x.one} is thrown in an arc over everything in the way and lands on a marked spot ${hcCap('lobbed', 'flight', x.k)} s later${a > 1 ? `, ${hcPct(a - 1)} bigger` : ''}.`; },
  trail: x => `As you swim, ${x.W} leaves a ${x.one} behind you every ${hcCap('trail', 'gap', x.k)} units (${hcCap('trail', 'pieces', x.k)} at most) instead of ${hcKey(x.w) === 's_wake' ? 'one long trail' : 'throwing'}. Staying still leaves nothing.`,
  selfcentred: x => { const a = hcCap('selfcentred', 'area', x.k); return `Each ${x.one} goes off around you instead of at a target, at ${hcPct(hcCap('selfcentred', 'dmg', x.k))} damage${a > 1 ? ` and ${hcPct(a - 1)} bigger` : ''}. It never hurts you.`; },
  sweep: x => `Each ${x.one} sweeps across a ${Math.round(hcCap('sweep', 'arc', x.k) * 180 / Math.PI)}° arc in front of you, hitting every enemy in it once per sweep.`,
  anchored: x => { const t = hcCap('anchored', 'width', x.k); return `The beam runs from you to the far side of the crowd (up to ${hcCap('anchored', 'range', x.k)}) instead of straight ahead${t > 1 ? `, ${hcPct(t - 1)} thicker` : ''}. It moves when either end moves.`; },
  volley: x => `Attacks come in volleys: ${hcCap('volley', 'size', x.k)} ${x.many} in quick succession, then a pause.`,
  nth: x => `Every ${hcOrd(hcCap('nth', 'n', x.k))} ${x.one} is empowered and hits ${hcCap('nth', 'mult', x.k)} times as hard. The count shows over you.`,
  growing: x => { const g = 1 + hcCap('growing', 'size', x.k), up = `up to ${g === 2 ? 'double' : g === 3 ? 'triple' : g + ' times'}. It resets when the attack ends.`;
    return x.atk === 'proj' ? `Each ${x.one} grows bigger and stronger the further it flies, ${up}` : x.atk === 'contact' ? `Each ${x.one} in a row grows bigger and stronger, ${up}`
      : x.atk === 'beam' ? `The beam grows thicker and stronger the longer it stays on, ${up}` : `Each ${x.one} grows bigger and stronger the longer it lasts, ${up}`; },
  scaling: x => { const a = x.atk, st = a === 'contact' || a === 'burst' ? 'hp' : a === 'proj' || a === 'beam' ? 'speed' : 'missing', P = G.P, m = hcCap('scaling', 'mult', x.k);
    const now = Math.max(1, Math.min(m, st === 'hp' ? 1 + (P.maxHp - 120) / 240 : st === 'speed' ? 1 + (P.speed - 1) : 1 + (1 - G.player.hp / P.maxHp)));
    return `Damage grows with ${st === 'hp' ? 'your max HP' : st === 'speed' ? 'your swim speed' : 'how much health you are missing'}, up to x${m}. Right now that is x${now.toFixed(2)}.`; },
  multiplying: x => `A ${x.one} that kills splits into ${hcCap('multiplying', 'split', x.k)} smaller ones at ${hcPct(hcCap('multiplying', 'child', x.k))} damage, which fly on to new targets. Splits never split again, and no more than ${hcCap('multiplying', 'flight', x.k)} fly at once.`,
  summoned: x => `Pets carry the ${x.one} to enemies for you: ${hcCap('summoned', 'pets', x.k)} pets on this weapon (8 across all your weapons).`,
  gravity: x => `Each ${x.one} leaves a gravity well ${hcCap('gravity', 'r', x.k)} across that drags enemies towards its centre and bends shots passing through it. Up to ${hcCap('gravity', 'wells', x.k)} wells at once.`,
  lunge: x => x.atk === 'contact' ? `Each ${x.one} carries you forwards through its target, up to ${hcCap('lunge', 'dist', x.k)}.` : `Each ${x.one} kicks you backwards as recoil, up to ${hcCap('lunge', 'dist', x.k)}. Useful for leaving.`,
  rapid: x => `${x.W} attacks ${hcPct(MS_NEW.rapid.cap.rate[x.k - 1])} faster, but each hit does ${hcPct(MS_NEW.rapid.cap.dmg[x.k - 1])} of its damage.`,
  focus: x => `Damage on one enemy climbs the longer ${x.W} keeps hitting it, up to +${hcPct(MS_NEW.focus.cap.top[x.k - 1])}. Switching targets starts again from nothing.`,
  sticky: x => `Every ${x.one} that hits slows the enemy by ${hcPct(MS_NEW.sticky.cap.slow[x.k - 1])}.`,
  connecting: () => `An enemy it hits is linked for 3 s to another within 140, and 25% of the damage one takes is shared with the other.`,
  catalyst: x => `Statuses from ${x.W} build ${hcPct(MS_NEW.catalyst.cap.bar[x.k - 1])} faster, and unstable reactions it sets off hit ${hcPct(MS_NEW.catalyst.cap.rx[x.k - 1])} harder.`,
  extra: x => `Each attack fires ${x.k >= 3 ? 'two' : 'one'} more ${x.one}${x.k >= 3 ? ' in all' : ''}, each a little weaker.`,
  range: x => { const near = [300, 400, 520][x.k - 1], fl = [65, 75, 85][x.k - 1];
    return x.atk === 'beam' ? `The beam reaches ${20 * x.k}% further, and keeps full damage out to ${near} (never below ${fl}% beyond).`
      : x.atk === 'pool' ? `${x.W} reaches further, and its direct hits keep full damage out to ${near} (never below ${fl}% beyond). Puddle damage never fades with distance anyway.`
      : `Keeps full damage out to ${near} instead of 220, and never drops below ${fl}% beyond.${x.atk === 'proj' || x.atk === 'spread' ? ` ${hcFirst(x.many)} fly ${20 * x.k}% faster.` : ''}`; },
  upclose: x => `Enemies within 120 of you take +${[40, 80, 120][x.k - 1]}%. Full damage holds to ${[180, 160, 140][x.k - 1]}, then fades to ${[40, 35, 30][x.k - 1]}% by 450.`,
  charged: x => `${x.W} winds up for ${[0.5, 0.4, 0.3][x.k - 1]} s before each attack, then hits ${[60, 90, 120][x.k - 1]}% harder.`,
  kinship: x => { const t = mwType(x.w), n = mwWs().filter(o => o !== x.w && mwType(o) === t).length, per = [8, 16, 24][x.k - 1], nm = (ELEMENTS[t] || {}).name || t;
    return `+${per}% damage and status build-up for each other ${nm} weapon you carry. You carry ${n ? n + ' right now: +' + per * n + '%' : 'none right now, so nothing yet'}.`; },
  knock: x => `Every ${x.one} that hits shoves the enemy away (${150 * x.k} strength). Bosses do not budge.`,
  pull: x => `Every ${x.one} that hits drags other enemies within ${50 * x.k} of the target in towards it.`,
  turncoat: x => `${['1 in 20', '1 in 10', '3 in 20'][x.k - 1]} enemies ${x.W} kills rise as allies for a few seconds and fight for you. Never elites or bosses.`,
  melee: x => `${x.W} stops ${x.atk === 'pool' ? 'throwing' : 'firing'} and becomes a 150° strike in front of you, reach 90. Enemy defences treat it as Contact.`,
  ranged: x => `The ${x.one} lands on an enemy up to 220 away instead of only right next to you.`,
  mines: x => `${x.W} lays mines instead of attacking directly: ${x.k >= 2 ? 5 : 3} on the floor at once, 14 s each. An enemy within 60 sets one off as a blast of the ${x.one}'s hit.`,
  dfa: x => `${x.W} keeps its own attack, and about every ${Math.round(1 / MW_DFA_RATE[x.k - 1])} s a strike lands on its target from above after a 0.4 s warning, for 140% damage.`,
  explode: x => `Hits explode: ${[40, 60, 80][x.k - 1]}% of the hit to every enemy within ${[40, 60, 80][x.k - 1]} of the target.`,
  primer: () => `Hits mark enemies for 4 s. A hit from any other weapon of yours sets the mark off as a blast (40 around) for 50%.`,
  area: x => `Everything ${x.W} does over an area is ${25 * x.k}% bigger: ${x.atk === 'contact' ? 'its reach and width' : x.atk === 'burst' ? 'its blast' : x.atk === 'pool' ? 'its puddles' : x.atk === 'beam' ? 'the beam\'s width' : 'any blasts and splashes'}, plus pulls and pushes.`,
};

// ---------------------------------------------------------------- the hold view: numbers
const HC_STATS = [ // key, label, format
  ['dmg', 'Damage per hit', v => fmtN(v)], ['count', 'Per attack', v => fmtN(v)], ['cd', 'Between attacks', v => v.toFixed(2) + ' s'],
  ['mag', 'Attacks before reload', v => fmtN(v)], ['reload', 'Reload', v => v.toFixed(2) + ' s'], ['range', 'Reach', v => fmtN(v)],
  ['speed', 'Shot speed', v => fmtN(v)], ['pierce', 'Passes through', v => fmtN(v)], ['chain', 'Chain jumps', v => fmtN(v)],
  ['crit', 'Crit chance', v => Math.round(v * 100) + '%'], ['area', 'Area', v => v < 5 ? Math.round(v * 100) + '%' : fmtN(v)], ['width', 'Width', v => fmtN(v)],
  ['size', 'Size', v => fmtN(v)], ['dur', 'Lasts', v => v.toFixed(1) + ' s'], ['knock', 'Knockback', v => fmtN(v)],
];
const fmtN = v => (Math.abs(v) >= 10 ? Math.round(v) + '' : (Math.round(v * 10) / 10) + '');
const hcDps = s => (s.cd > 0 && s.dmg > 0 ? s.dmg * (s.count || 1) * (s.mag || 1) / ((s.mag || 1) * s.cd + (s.reload || 0)) : 0);
// The weapon's numbers now and with the modifier one rank higher, plus the card's stat point (statup.js), put back afterwards.
function hcDelta(w, id, st) {
  const m0 = w.m10, s0 = Object.assign({}, w.s), D = typeof ST_DEF !== 'undefined' && st && st !== 'hp' ? ST_DEF[st] : null, B = D ? stb() : null, P = G.P;
  const b0 = B && B[st], p0 = D && D.P ? P[D.P] : undefined;
  let s1;
  try {
    if (D) { B[st] = (B[st] || 0) + D.k; if (D.P) P[D.P] = (P[D.P] == null ? (D.P === 'accel' ? 1 : 0) : P[D.P]) + D.k; }
    w.m10 = (m0 || []).concat(id); computeStats(w); s1 = Object.assign({}, w.s);
  } catch (e) { s1 = null; } finally {
    w.m10 = m0;
    if (D) { if (b0 === undefined) delete B[st]; else B[st] = b0; if (D.P) { if (p0 === undefined) delete P[D.P]; else P[D.P] = p0; } }
    try { computeStats(w); } catch (e) { /* ignore */ }
  }
  if (!s1) return [];
  const out = [];
  for (const [k, l, f] of HC_STATS) {
    const a = s0[k], b = s1[k];
    if (typeof a !== 'number' || typeof b !== 'number' || (k === 'pierce' && a >= 99) || Math.abs(b - a) < Math.max(1e-3, Math.abs(a) * 0.005) || f(a) === f(b)) continue;
    out.push(`${l} ${f(a)} → ${f(b)}`);
  }
  const d0 = hcDps(s0), d1 = hcDps(s1);
  if (d0 > 0 && Math.abs(d1 - d0) > d0 * 0.01) out.push(`Damage a second (rough) ${fmtN(d0)} → ${fmtN(d1)}`);
  return out;
}

// ---------------------------------------------------------------- the hold view: putting it together
// Text that says the same on every weapon (so a card showing it has no weapon-specific line of its own).
function hcGeneric(id) {
  const s = new Set([(MODS10[id] || {}).desc].concat(MODUP[id] || []));
  for (const k in SLICE_COPY) if (k.startsWith('mod_' + id + '_') || k.startsWith('br_' + id + '_') || k === 'mastery_' + id) s.add(SLICE_COPY[k]);
  s.add('Mastery: pushes its effect one step further. One weapon mastery a build.');
  return s;
}
function hcWeapon(w, id, o) {
  const r = modCount(w, id), mastery = o.tag === 'MASTERY' || r >= 3, k = Math.min(3, r + 1), [one, many] = HC_NOUN[hcKey(w)] || HC_ATK[w.def.v10atk] || ['attack', 'attacks'];
  let card = null; try { card = modCard(w, id); } catch (e) { /* (the card's own text stays) */ }
  const own = card && card.desc ? card.desc : o.desc, gen = hcGeneric(id), special = own && !gen.has(own) && !/^TODO_COPY/.test(own);
  const fn = HC_MOD[id];
  let what = special ? own : fn ? fn({ W: w.def.name, one, many, k, atk: w.def.v10atk, w }) : own;
  let line = '';
  if (!special && r > 0 && own && own !== (MODS10[id] || {}).desc) line = own; // (this rank's own line: branch, rank 3 or mastery)
  const st = card && card.stUp, nums = hcDelta(w, id, st);
  if (st && typeof ST_DEF !== 'undefined' && ST_DEF[st]) nums.push(`Also: ${stLine(st)}`);
  return `<div class="hcw"><p><b>On ${esc(w.def.name)}</b> <em>${mastery ? 'MASTERY' : r ? 'RANK ' + r + ' > ' + (r + 1) : 'NEW'}</em></p><p>${esc(what || '')}</p>` +
    (line ? `<p class="hcr"><b>${mastery ? 'Mastery' : 'Rank ' + (r + 1)}:</b> ${esc(line)}</p>` : '') +
    (nums.length ? `<div class="hcn"><b>Numbers</b> ${nums.map(esc).join(' · ')}</div>` : `<div class="hcn"><b>Numbers</b> No change to its basic stats: the effect above is the whole point.</div>`) + '</div>';
}
cardGlossary = (orig => function (o) {
  try {
    const id = o && typeof o.card === 'string' && o.card.startsWith('mod:') ? o.card.slice(4) : null;
    if (!id || !G || !MODS10[id]) return orig(o);
    const ws = o.pickW ? o.pickW.map(p => G.weapons.find(w => w && w.uid === p.uid)).filter(Boolean)
      : G.weapons.filter(w => w && !w.isSpell && w.def && w.def.name === o.modFor).slice(0, 1);
    if (!ws.length) return orig(o);
    const g = ws.length > 1 ? [] : glossFor(o.desc || '').slice(0, 3);
    return `<b>${esc(o.title)}</b><em>${esc(o.tag || '')}</em>` + ws.slice(0, 3).map(w => hcWeapon(w, id, o)).join('') +
      (ws.length > 1 ? `<p class="hint">Tap a weapon on the card to choose; tap anywhere else for ${esc(o.modTab || ws[0].def.name)}.</p>` : (typeof rwFitHtml === 'function' ? rwFitHtml(o, true) : '')) +
      (g.length ? `<ul class="gloss">${g.map(([t, d]) => `<li><b>${esc(t)}</b>: ${esc(d)}</li>`).join('')}</ul>` : '');
  } catch (e) { return orig(o); }
})(cardGlossary);
