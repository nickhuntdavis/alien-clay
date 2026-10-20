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
  const FIT_KEEP_TYPE = ['v_fire_proj', 'v_ice_pool', 'v_flame_pool', 'v_arcane_proj', 'v_soul_proj', 's_wake', 's_tesla'];

  const key = w => (typeof w24Key === 'function' ? w24Key(w) : w && w.id);
  function fitBranchOut(w) { const f = FIT_BRANCH[key(w)]; return f ? f(w, U(w)) : []; }
  function fitModOut(w) { const f = FIT_MOD[key(w)]; return f ? f(w, U(w)) : []; }
  const fitSabOk = w => w && !w.isSpell && w.def && !FIT_KEEP_TYPE.includes(key(w));
  Object.assign(globalThis, { FIT_BRANCH, FIT_MOD, FIT_KEEP_TYPE, fitBranchOut, fitModOut, fitSabOk });

  if (typeof wupForkCards === 'function') {
    const wf = wupForkCards;
    wupForkCards = function (req) {
      const cs = wf(req);
      if (!cs || !cs.length || !req || !req.w || globalThis.FIT_OFF) return cs;
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
      const keep = G.weapons; let c = null;
      G.weapons = keep.filter(w => !w || w.isSpell || fitSabOk(w)); // (sabCard picks from G.weapons; slots without a def are skipped there)
      try { c = G.weapons.some(fitSabOk) ? sc() : null; } finally { G.weapons = keep; }
      return c;
    };
  }
})();
