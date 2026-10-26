'use strict';
// Spawn Prawn - upgrade fit check: upgrades that would break (or do nothing for) a weapon's branch are not offered.
//  - BRANCH cards (weapons24.js wupForkCards): a Lv 6 card or mastery that contradicts the promise or Lv 6 card taken,
//    or the modifiers the weapon holds, is left out. A tier is never emptied: if every card would go, all stay.
//  - MODIFIER cards (modcards.js modCardOk): a modifier that fights or duplicates the weapon's branch is not offered.
//  - SWITCHED AT BIRTH (modcards.js sabCard): a weapon whose branch runs on its own status switches only to the one
//    type its branch has a version for (FIT_SAB_TYPES; the versions live in each weapon's wup file, the card text in
//    FIT_TEXT). FIT_KEEP_TYPE (now empty) would keep a weapon off the card altogether.
// Tests that exercise the hidden cards themselves set window.FIT_OFF = 1.
// Hooks: none in shared files; wraps wupForkCards, modCardOk and sabCard (loads after combos10.js).
(function () {
  const has = (w, id) => typeof modHas === 'function' && modHas(w, id);
  const U = w => w.up || {};
  const BEAM_OK = ['sweep', 'anchored', 'nth', 'growing', 'scaling'];
  const BURST_OK = ['delayed', 'lobbed', 'selfcentred', 'nth', 'scaling', 'gravity', 'lunge'];
  const holdsOutside = (w, ok) => (w.m10 || []).some(id => !ok.includes(id));

  // Branch cards to leave out, by weapon: (w, up) -> [card titles].
  const FIT_BRANCH = {
    v_phys_proj: (w, u) => has(w, 'homing') ? ['Through and Through'] : [],
    v_phys_spread: (w, u) => [
      ...(u.l6 === 'Roundabout' ? ['Baby Boom'] : []), // (a ring has no direction to recoil from)
      ...(has(w, 'lunge') ? ['Shotgun Wedding', 'Kickback'] : []),
      ...(has(w, 'homing') || has(w, 'returning') ? ['Roundabout'] : [])],
    v_phys_contact: (w, u) => has(w, 'lunge') ? ['Vice Grip', 'Back Off!'] : [],
    v_phys_burst: (w, u) => [
      ...(u.l6 === 'Elbow Room' ? ['Trigger Happy'] : []),
      ...(has(w, 'lobbed') || has(w, 'delayed') ? ['Elbow Room'] : [])],
    v_fire_proj: (w, u) => w.def.elem === 'ice' ? ['Stripped Bare', 'Projectile Vomit'] : (['Spittoon', 'Leapfrog', 'Nasty Fifth', 'Mouthful'].includes(u.l6) || holdsOutside(w, BEAM_OK)) ? ['Projectile Vomit'] : [],
    v_shock_beam: (w, u) => ['Packet Loss', ...(u.p === 'A' ? ['Multi-Monitor Setup'] : [])], // (Packet Loss breaks all three masteries)
    v_ice_pool: (w, u) => [...(u.p === 'B' ? ['Snotwork Everywhere'] : []), ...(has(w, 'trail') ? ['Bogged Down'] : [])],
    v_arcane_proj: (w, u) => has(w, 'homing') ? ['Needlework'] : [],
    v_soul_proj: (w, u) => [...(w.def.elem === 'phys' ? ['Nine-Tenths of the Law', 'Hitching a Ride'] : []),...(u.p === 'B' || u.l6 === 'Second Sighting' ? ['Poltergeist'] : []), ...(has(w, 'returning') ? ['Revolving Door'] : [])],
    v_flame_pool: (w, u) => ['Fire Drill', ...(holdsOutside(w, BURST_OK) ? ['Powder Keg'] : []), ...(u.l6 === 'Powder Keg' ? ['Hellmouth', 'Scorched Earth', 'Spontaneous Combustion'] : [])],
    s_void: (w, u) => [...(u.p === 'A' ? ['Wormhole'] : []), ...(u.p === 'B' ? ['Spaghettification'] : []), ...(has(w, 'multiplying') ? ['Big Bang, Eventually'] : [])],
    s_twin: (w, u) => u.p === 'A' || u.p === 'B' ? ['Conjoined Twins'] : [],
    s_mines: (w, u) => w.def.elem !== 'flame' ? ['Flare Up'] : [], // (its patches take the new type; only Flare Up needs an Ignite)
  };
  // Modifiers to leave out, by weapon: (w, up) -> [modifier ids].
  const FIT_MOD = {
    v_phys_proj: (w, u) => u.p === 'B' ? ['homing'] : [],
    v_phys_spread: (w, u) => [...(u.p === 'A' ? ['lunge'] : []), ...(u.l6 === 'Roundabout' ? ['homing', 'returning'] : [])],
    v_phys_contact: (w, u) => u.p === 'A' || u.p === 'C' ? ['lunge'] : [],
    v_phys_burst: (w, u) => u.l6 === 'Elbow Room' ? ['selfcentred', 'lobbed', 'delayed'] : [],
    v_fire_proj: (w, u) => u.l10 === 'Projectile Vomit' ? Object.keys(MODS10).filter(id => !BEAM_OK.includes(id)) : [],
    v_ice_pool: (w, u) => u.p === 'B' ? ['trail'] : [],
    v_arcane_proj: (w, u) => u.p === 'B' ? ['homing'] : [],
    v_soul_proj: (w, u) => u.p === 'B' ? ['returning'] : [],
    v_flame_pool: (w, u) => u.l6 === 'Powder Keg' ? ['trail'] : [],
    s_void: (w, u) => ['gravity', ...(u.p === 'C' ? ['multiplying'] : [])],
    s_peekaboo: () => ['gravity', 'lobbed', 'delayed', 'selfcentred'],
    s_twin: () => ['anchored'],
    s_tesla: () => ['chaining'],
    s_mines: () => ['selfcentred', 'delayed'],
    s_wake: () => ['trail', 'lobbed'],
  };
  // Weapons whose branches run on their own damage type's status: never offered Switched at Birth.
  const FIT_KEEP_TYPE = [];
  // Weapons that may switch only to these types (their branch has a version for each).
  const FIT_SAB_TYPES = { s_wake: ['shock'], v_arcane_proj: ['soul'], v_fire_proj: ['ice'], v_ice_pool: ['soul'], v_flame_pool: ['arcane'], v_soul_proj: ['phys'], s_tesla: ['flame'] };
  // (The Runs: Static zaps, wup6.js; Little Prick: Parasite voodoo pins, Acid Spit: Mucus Snowball, Nocturnal Emission: Parasite
  // Ectoplasm, wup2.js; Hot Mess: Blood Crime Scene, Rent Free: Force Poltergeist, wup3.js; Unwanted Contact: Fire Wildfire, wup4.js)
  // Card text for those versions: weapon -> type -> card title -> description.
  const FIT_TEXT = { s_wake: { shock: {
    "Can't Hold It": 'The faster you swim, the denser and stronger the trail (up to x2 at full speed; half as much when slow).',
    'Burning Rubber': 'Sprinting leaves a live wire: anything crossing it is zapped by a bolt from the trail and jolted in place (once per enemy per 4 s).',
    'Double Back': 'Crossing your own trail sends a spark running along it both ways (1 s), zapping everything on it.',
    'Full Circle': 'Closing a loop (crossing a trail you laid within 4 s) closes the circuit: the loop lights up and one bolt jolts everything inside.',
    'Afterburner': 'The whole trail is a live wire: everything it touches is zapped and jolted (once per enemy per 3 s).',
    'Hot Lap': 'Closing a loop closes the circuit (everything inside zapped and jolted) and doubles your swim speed for 2 s.',
  } },
  v_fire_proj: { ice: {
    'Spit Take': 'Each glob thickens a snot coat on its target, and the target takes up to +40% from Acid Spit as the coat grows. A full coat snowballs it: stuck fast for 1.5 s, and its sneeze Snares everything near.',
    'Second Helping': 'When a coat snowballs an enemy, the coat stays half on.',
    'Splash Damage': 'A direct hit splatters 3 snot droplets onto enemies within 60 (30% damage); droplets thicken their coats too.',
    'Backsplash': 'Droplets that hit an enemy already coated splatter once more.',
    'Nasty Fifth': 'Every 5th spit is a lobbed glob that leaves a snot puddle (radius 50, 3 s).',
    'Bad Aftertaste': 'Each hit leaves snot on the target; when it dies, the snot splashes its coat onto enemies within 70.',
    'Wet Floor': 'The splash also leaves a small snot puddle where the enemy died (radius 35, 2 s).',
    'Battery Acid': 'Snot Bomb: every hit coats a non-boss enemy fully, so it snowballs at once (bosses: half a coat).',
    'Acid House': 'Snot House: every enemy that dies coated leaves a snot puddle (radius 60, 3 s); touching puddles merge.',
  } },
  v_ice_pool: { soul: {
    'Extra Strength Snot': 'Ectoplasm: ghost hands rise from the puddle and grip what crosses it (40% speed), and keep hold for 1.5 s after it leaves.',
    'Stringy': 'Enemies leaving drag a ghostly strand behind them; the next enemy to cross it is gripped too.',
    'Rising Damp': 'The puddle grows by 10% every second it is gripping something (up to double size).',
    'Bogged Down': 'An enemy that stays in the puddle for 1.5 s is pulled under: two hands hold it down for 1.5 s (once per enemy per 4 s).',
    'Snotwork': 'Puddles within 200 of each other are joined by a ghostly strand; enemies crossing it are gripped.',
    'Bogey Man': 'An enemy that dies gripped in a puddle leaves a wandering ghost that rolls slowly, gripping what it touches for 3 s.',
    'Superglue': 'Anything gripped in a puddle is held down solid for 2 s: no moving, no attacking (elites 1 s; bosses only slowed). Once per enemy per 5 s.',
  } },
  v_flame_pool: { arcane: {
    'Hotter Mess': 'Crime Scene: the longer an enemy stands in the blood, the sooner it slips (up to 3x after 2 s). A slip spins it out across the floor: it cannot attack for 1 s and takes a hit.',
    'Backdraft': 'An enemy that slips inside the patch makes the whole patch slick for 0.5 s (+50% damage).',
    'Spreading Rumours': 'Anything that walks out of the blood leaves bloody footprints for 1.5 s.',
    'Hot Foot': 'Those footprints make enemies slip as fast as the patch does.',
    'Burning Bridges': 'An enemy that slips while leaving footprints drops a fresh small patch where it slips (once per enemy).',
    'Flash in the Pan': 'Patches last half as long, but when one dries up it splashes across its full radius, half-way to a slip for everything in it.',
    'Spontaneous Combustion': 'Every enemy that slips, or Ignites from any source, drops a Hot Mess patch where it stands (once per enemy).',
  } },
  v_soul_proj: { phys: {
    'Ghost Through': 'Poltergeist: passes through up to 4 enemies; each one after the first takes 20% less. Enough hits and the ghost picks an enemy up and THROWS it at the nearest one.',
    'Cold Spot': 'Every enemy the ghost passes through gets closer to being thrown, so a long line can send several flying.',
    'Revolving Door': 'After its hit the ghost fades, reappears and retraces its path back to you, hitting again. Enough hits and the enemy is thrown at its neighbour.',
    'Unfinished Business': 'A hit enemy that survives is haunted for 3 s; if it dies in that time its spirit bursts out (radius 70, 60% damage) and stirs up the poltergeist.',
    'Mass Possession': 'Every hit gets an enemy halfway to being thrown.',
  } },
  s_tesla: { flame: {
    "It's Spreading": 'Wildfire: +3 leaps (6 in all), range 140. The chain is a flame that leaps enemy to enemy, and each one it catches burns as kindling.',
    'Still Buzzing': 'The last enemy in each chain stays kindling for 6 s instead of 3.',
    'Bad Hair Day': 'Moth to a Flame: kindling drifts gently towards other kindling.',
    'Conductive Personality': 'Kindling takes +20% damage from all your weapons, not just Fire.',
    'Spread the Love': 'Unwanted Contact picks targets that are not yet kindling, spreading the fire.',
    'Last Spark': 'When kindling dies, all your weapons fire 20% faster for 2 s (does not stack).',
    'Odd Sock': 'One enemy each wave becomes a bonfire: every chain passes through it on the way.',
    'Brainstorm': 'Every 20 flare-ups, the next Unwanted Contact is a wildfire: it leaps to every piece of kindling on screen.',
    'Balloon Animal': 'A chain that kills leaves a hot-air balloon that floats to the nearest enemy and pops on it.',
    'Tumble Dryer': '20% of hits from all your other weapons start an Unwanted Contact wildfire.',
    'Grid Lock': 'Firebreak: every piece of kindling is joined to the nearest other by a line of flame that hits anything crossing it (8 at most).',
  } },
  v_arcane_proj: { soul: {
    'Bleeding Heart': 'Each hit leaves a pin in the enemy (up to 6). A full pincushion is Possessed and fights for you.',
    'Leaky': 'A full pincushion flicks one of its pins at the nearest enemy every second.',
    'Open Wound': 'A pinned enemy that dies leaves a ghost outline for 3 s; enemies crossing it flinch to a stop and gain a pin.',
    'Sutures': 'A needle that pierces 3 or more leaves a ghost thread between the first and last enemy: anything crossing it is yanked back along it and gains a pin (2 s).',
    'Reef Knot': 'A needle that pierces 5 stitches them into a ragdoll: they are pulled together, pinned and Possessed.',
    'Terminal Clause': 'A needle that hits a pinned enemy under 15% health kills it outright (elites under 8%, never bosses), and its spirit slams into the nearest enemy.',
    'Exsanguinate': 'Voodoo Doll: every hit leaves 3 pins, and a Possessed enemy bursts in pins when its time ends, pinning everything near it.',
  } } };

  const key = w => (typeof w24Key === 'function' ? w24Key(w) : w && w.id);
  function fitBranchOut(w) { const f = FIT_BRANCH[key(w)]; return f ? f(w, U(w)) : []; }
  function fitModOut(w) { const f = FIT_MOD[key(w)]; return f ? f(w, U(w)) : []; }
  const fitSabTypes = w => (FIT_SAB_TYPES[key(w)] || V10_TYPES).filter(t => t !== w.def.elem);
  const fitSabOk = w => w && !w.isSpell && w.def && !FIT_KEEP_TYPE.includes(key(w)) && fitSabTypes(w).length > 0;
  Object.assign(globalThis, { FIT_BRANCH, FIT_MOD, FIT_KEEP_TYPE, FIT_SAB_TYPES, FIT_TEXT, fitBranchOut, fitModOut, fitSabOk });

  if (typeof wupForkCards === 'function') {
    const wf = wupForkCards;
    wupForkCards = function (req) {
      const cs = wf(req);
      if (!cs || !cs.length || !req || !req.w || globalThis.FIT_OFF) return cs;
      const T = (FIT_TEXT[key(req.w)] || {})[req.w.def.elem];
      if (T) for (const c of cs) if (T[c.title]) c.desc = T[c.title] + (c.desc.includes(' Costs: ') ? ' Costs: ' + c.desc.split(' Costs: ')[1] : '');
      const out = fitBranchOut(req.w), keep = cs.filter(c => !out.includes(c.title));
      return keep.length ? keep : cs;
    };
  }
  if (typeof modCardOk === 'function') {
    const mo = modCardOk;
    modCardOk = function (w, id) { return mo(w, id) && (globalThis.FIT_OFF || !fitModOut(w).includes(id)); };
  }
  if (typeof modDraftCands === 'function') { // (no Switched at Birth card at all when no weapon may switch)
    const md = modDraftCands;
    modDraftCands = function (kind) { const c = md(kind); return G.weapons.some(fitSabOk) ? c : c.filter(x => x.fam !== 'switch'); };
  }
  if (typeof sabCard === 'function') {
    const sc = sabCard;
    sabCard = function () {
      const ok = G.weapons.filter(fitSabOk); if (!ok.length) return null;
      const w = pick(ok), keep = G.weapons, types = V10_TYPES.slice(); let c = null;
      G.weapons = [w]; V10_TYPES.splice(0, V10_TYPES.length, ...(FIT_SAB_TYPES[key(w)] || types)); // (sabCard picks a weapon from G.weapons and a type from V10_TYPES)
      try { c = sc(); } finally { G.weapons = keep; V10_TYPES.splice(0, V10_TYPES.length, ...types); }
      return c;
    };
  }
})();
