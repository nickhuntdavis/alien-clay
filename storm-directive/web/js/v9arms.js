'use strict';
// Spawn Prawn - the v9 weapons back in the v10 game (user request, 22 Oct 2026: "add back v9 samples and weapons and
// combos and fusions"). Every old weapon joins the live roster (W24 / W24_IDS, as acro.js does), so it is offered in
// every weapon draft beside the 27, listed in the Field Guide, and its v9 combos, pairings and super combos can happen
// again (they look weapons up by the old id a signature slot keeps in w.id; fusion.js runs the ceremony).
//  - Weapons with a signature copy (sigweap.js s_<id>) use it: the 12 already live stay as they are, the 8 archived ones
//    (Heartburn, Premature Evangelation, Flagellum Flail, Thorny Onesie, Upchuck, Nose Goblins, Blood Blister, Leeches)
//    are switched back on.
//  - Every other old weapon gets a signature copy here (sigReg: one damage type, one attack type, old firing code). The
//    retired damage types are re-typed: Cooties -> Alien, Oil -> Fire, Water -> Mucus (V9_RETYPE). Attack types: V9_ATK.
//  - Upgrades: none of their own (no WUP spec), so their forks at Lv 3 / 6 / 10 are v10 modifier cards (draft.js
//    forkCards falls back to two fitting modifiers).
//  - V9_START: which v9 sample each weapon started (samples9.js uses it for the W24 starter column).
// Hooks: none (pushes rows into weapons24.js W24, W24_IDS, W24_BY and W24_DESC; icons into icons.js ICON_OF).
// Off with window.V10_OFF. Loads after acro.js, before samples10.js and w24look.js.

const V9_RETYPE = { poison: 'soul', oxi: 'flame', salt: 'ice' };
const V9_ATK = {
  blaster: 'proj', glaive: 'proj', frost: 'proj', friend: 'proj', dejavu: 'proj', ghosts: 'proj', genegun: 'proj', doubletrouble: 'proj',
  roller: 'proj', cradlecap: 'proj', sticky: 'proj', wetkiss: 'proj', juicebox: 'proj', heelprick: 'proj', pram: 'proj', pistol: 'proj', booerang: 'proj',
  shotgun: 'spread', wedding: 'spread', whoop: 'spread', lemon: 'spread',
  karma: 'burst', banjo: 'burst', rattle: 'burst', carpet: 'burst', moonshine: 'burst', bathbomb: 'burst', softplay: 'burst', shower: 'burst', codliver: 'burst', waters: 'burst',
  venom: 'pool', crayon: 'pool', runny: 'pool', period: 'pool', eggwhite: 'pool',
  cord: 'beam', fork: 'beam',
  paddle: 'contact', swimmers: 'contact', gutpunch: 'contact', ulcer: 'contact', achoo: 'contact', hairbrush: 'contact', bugs: 'contact', grubby: 'contact',
  butterknife: 'contact', lice: 'contact', papercut: 'contact', spiritfingers: 'contact', seamonkeys: 'contact', hanky: 'contact', wetwipe: 'contact',
  lavalamp: 'contact', piglet: 'contact', nightlight: 'contact',
};
const V9_KIND_ATK = { gun: 'proj', lob: 'burst', ring: 'burst', mine: 'burst', melee: 'contact', orbit: 'contact', critter: 'contact', wake: 'pool' }; // (anything V9_ATK misses)
const V9_IDS = []; // the live ids this file added or switched back on
const V9_START = {}; // live id -> v9 sample id (samples9.js)

(function () {
  if (typeof V10 === 'undefined' || !V10 || typeof W24 === 'undefined') return;
  const sampleOf = {};
  for (const [pid, P] of Object.entries(PROFILES)) if (!P.s10 && pid !== 'human1') for (const id of P.weapons || []) if (!sampleOf[id]) sampleOf[id] = pid;
  const live = new Set(W24_IDS);
  const old = Object.keys(WEAPONS).filter(id => { const d = WEAPONS[id]; return !d.v10 && !d.sigOf && !id.startsWith('v_') && !d.isSpell && !d.spell; });
  for (const id of old) {
    const o = WEAPONS[id], sid = 's_' + id;
    if (live.has(sid)) { if (sampleOf[id]) V9_START[sid] = sampleOf[id]; continue; } // (already one of the 27)
    let d = WEAPONS[sid];
    if (!d) {
      const type = V9_RETYPE[o.elem] || o.elem, atk = V9_ATK[id] || V9_KIND_ATK[o.kind] || 'proj';
      if (!V10_ATK[atk] || !ELEMENTS[type]) { console.warn('v9arms: skipped ' + id); continue; }
      d = sigReg(id, id, o.name, o.play || o.desc || '', type, atk, { def: { stars: o.stars || [3, 3, 3, 3] } });
    }
    d.w24 = 1; d.archived = 0; d.v9 = 1;
    if (typeof ICON_OF !== 'undefined' && ICON_OF[id] && !ICON_OF[sid]) ICON_OF[sid] = ICON_OF[id];
    const tag = sampleOf[id] ? 'v9_' + sampleOf[id] : null;
    W24.push([sid, d.name, d.v10type, d.v10atk, tag]); W24_IDS.push(sid);
    W24_BY[sid] = { id: sid, name: d.name, type: d.v10type, atk: d.v10atk, starter: tag };
    W24_DESC[sid] = d.desc;
    V9_IDS.push(sid); if (sampleOf[id]) V9_START[sid] = sampleOf[id];
  }
  // Tier screens (weapons24.js, every 4th level): a v9 weapon has no branch cards, so each tier offers three modifier
  // cards that fit it (modcards.js modCard). Taking one moves it up a tier (internal Lv 3 / 6 / 10, so its combos at Lv 5 happen).
  const v9Mods = w => (typeof modsFor === 'function' ? modsFor(w).filter(id => modCardOk(w, id)) : []);
  const isV9 = w => !!(w && !w.isSpell && w.def && w.def.v9 && w.def.w24);
  const nextLv = wupNextLv;
  wupNextLv = function (w) {
    if (!isV9(w)) return nextLv(w);
    const nx = WUP_TIER.find(l => l > w.lvl);
    return nx && nx <= wCap(w) && v9Mods(w).length ? nx : 0;
  };
  const forkCards = wupForkCards;
  wupForkCards = function (req) {
    if (!isV9(req && req.w)) return forkCards.apply(this, arguments);
    const w = req.w;
    return shuffle(v9Mods(w)).slice(0, 3).map(id => Object.assign(modCard(w, id), { tag: 'MODIFIER', sub: `${w.def.name} | Tier ${WUP_TIER.indexOf(req.lv) + 1}` }));
  };
})();
