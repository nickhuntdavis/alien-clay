'use strict';
// Spawn Prawn - upgrade fit check: upgrades that would break (or do nothing for) a weapon's branch are not offered.
//  - BRANCH cards (weapons24.js wupForkCards): a Lv 6 card or mastery that contradicts the promise or Lv 6 card taken,
//    or the modifiers the weapon holds, is left out. A tier is never emptied: if every card would go, all stay.
//  - MODIFIER cards (modcards.js modCardOk): a modifier that fights or duplicates the weapon's branch is not offered.
//  - SWITCHED AT BIRTH (modcards.js sabCard): only weapons whose branch does not run on their own status can switch.
//    With no such weapon the card is not dealt.
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
      ...(u.l6 === 'Personal Space' ? ['Hair Trigger Happy'] : []),
      ...(has(w, 'lobbed') || has(w, 'delayed') ? ['Personal Space'] : [])],
    v_fire_proj: (w, u) => (['Spittoon', 'Lob Lip', 'Nasty Fifth', 'Gargle'].includes(u.l6) || holdsOutside(w, BEAM_OK)) ? ['Projectile Vomit'] : [],
    v_shock_beam: (w, u) => ['Packet Loss', ...(u.p === 'A' ? ['Multi-Monitor Setup'] : [])], // (Packet Loss breaks all three masteries)
    v_ice_pool: (w, u) => [...(u.p === 'B' ? ['Snotwork Everywhere'] : []), ...(has(w, 'trail') ? ['Bogged Down'] : [])],
    v_arcane_proj: (w, u) => has(w, 'homing') ? ['Needlework'] : [],
    v_soul_proj: (w, u) => [...(u.p === 'B' || u.l6 === 'Second Sighting' ? ['Poltergeist'] : []), ...(has(w, 'returning') ? ['Return to Sender'] : [])],
    v_flame_pool: (w, u) => ['Fire Drill', ...(holdsOutside(w, BURST_OK) ? ['Powder Keg'] : []), ...(u.l6 === 'Powder Keg' ? ['Hellmouth', 'Scorched Earth', 'Spontaneous Combustion'] : [])],
    s_void: (w, u) => [...(u.p === 'A' ? ['Wormhole'] : []), ...(u.p === 'B' ? ['Spaghettification'] : []), ...(has(w, 'multiplying') ? ['Big Bang, Eventually'] : [])],
    s_twin: (w, u) => u.p === 'A' || u.p === 'B' ? ['Conjoined Twins'] : [],
    s_mines: (w, u) => w.def.sab ? ['Lingering Smoulder', 'Flare Up', 'Nappy Rash'] : [],
    s_peekaboo: (w, u) => w.def.sab ? ['Mass Hysteria'] : [],
    s_toothfairy: (w, u) => w.def.sab ? ['Possession Fee'] : [],
  };
  // Modifiers to leave out, by weapon: (w, up) -> [modifier ids].
  const FIT_MOD = {
    v_phys_proj: (w, u) => u.p === 'B' ? ['homing'] : [],
    v_phys_spread: (w, u) => [...(u.p === 'A' ? ['lunge'] : []), ...(u.l6 === 'Roundabout' ? ['homing', 'returning'] : [])],
    v_phys_contact: (w, u) => u.p === 'A' || u.p === 'C' ? ['lunge'] : [],
    v_phys_burst: (w, u) => u.l6 === 'Personal Space' ? ['selfcentred', 'lobbed', 'delayed'] : [],
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
  const FIT_KEEP_TYPE = ['v_fire_proj', 'v_ice_pool', 'v_flame_pool', 'v_soul_proj', 's_tesla'];
  // Weapons that may switch only to these types (their branch has a version for each): The Runs has a Static version (wup6.js rnBar).
  const FIT_SAB_TYPES = { s_wake: ['shock'], v_arcane_proj: ['soul'] }; // (Little Prick: Alien voodoo pins, wup2.js w2Voodoo)
  // Card text for those versions: weapon -> type -> card title -> description.
  const FIT_TEXT = { s_wake: { shock: {
    "Can't Hold It": 'The faster you swim, the denser and stronger the trail (up to x2 at full speed; half as much when slow).',
    'Burning Rubber': 'Sprinting leaves a live wire: anything crossing it is zapped by a bolt from the trail and jolted in place (once per enemy per 4 s).',
    'Backdraft': 'Crossing your own trail sends a spark running along it both ways (1 s), zapping everything on it.',
    'Full Circle': 'Closing a loop (crossing a trail you laid within 4 s) closes the circuit: the loop lights up and one bolt jolts everything inside.',
    'Afterburner': 'The whole trail is a live wire: everything it touches is zapped and jolted (once per enemy per 3 s).',
    'Hot Lap': 'Closing a loop closes the circuit (everything inside zapped and jolted) and doubles your swim speed for 2 s.',
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
