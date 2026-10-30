'use strict';
// Spawn Prawn - v10 draft core (redesign docs/UPGRADES.md): one card-choice screen for everything.
//  - Cards: weapon upgrades (Enhance), Switched at Birth, defence cards (pdef.js), and every card registered by
//    feature files through draftRegister (Feats: feats10.js; mutations, Catalysts, Concentration: mutations.js).
//  - Slots: 3 weapons (drafts at Lv 1, 5, 12), 3 Feats, 4 Genome slots shared by mutations and defences.
//    Acquire cards leave the pool once their slots are full, so late drafts become upgrades by themselves.
//  - Forks: a weapon reaching Lv 5 or 10 (one mastery weapon a run), or a Feat reaching level 3 or 5, gets its own
//    2-card screen. Fork options come from forkRegister, or for weapons from two fitting modifiers (modifiers.js).
//  - Pool lean: typed cards 50% primary type, 25% support, 25% other (G.sampleTypes, set by the sample).
//  - Triggers: level-ups and elite/boss chests. When each screen opens is the Reward Director's call (director.js).
// Hooks: v10.js v10Loot -> draftLoot, v10Box -> draftBox (-> director.js dirGate); game.js main loop treats draftBox's 'wait' as "not yet".
// Card shape: { id, kind: 'acquire'|'enhance'|'specialise', slot: 'feat'|'genome'|'weaponmut'|null, family, type,
//   rarity, start, title, desc, icon, color, eligible(G), apply(G, target), rank(G), maxRank }.

const DRAFT = { groupW: { feat: 1.3, mut: 1.3, spec: 0.5, def: 1.1, mod: 1.1, up: 0.6 }, genome: 4, feats: 3, budget: 0, lean: { primary: 0.5, support: 0.25, other: 0.25 }, forkLv: [3, 6, 10], featForkLv: [3, 5] };
const CARDS = [];
const FORKS = {};
function draftRegister(c) { if (c && c.id && !CARDS.some(x => x.id === c.id)) CARDS.push(c); }
function forkRegister(key, lv, opts) { FORKS[key + '@' + lv] = opts; }
function draftAbsorb() { // cards registered before this file loaded
  if (typeof window === 'undefined') return;
  if (window.CARDS10) { window.CARDS10.forEach(draftRegister); window.CARDS10 = null; }
  if (window.FORKS10) { for (const f of window.FORKS10) if (f && f.key) forkRegister(f.key, f.lv, f.opts); window.FORKS10 = null; }
}
const DRAFT_INT = { force: 'phys', acid: 'fire', static: 'shock', mucus: 'ice', blood: 'arcane', soul: 'soul', fire: 'flame' };

// ---------------------------------------------------------------- slots
const featsHeld = () => (G.spells || []).filter(Boolean).length;
const mutsHeld = () => Object.keys(G.muts || {}).filter(k => G.muts[k] > 0).length;
const defsHeld = () => (typeof pdef === 'function' ? Object.entries(pdef().n).filter(([k, n]) => n > 0 && k !== 'thick' && k !== 'fast' && k !== 'wide').length : 0); // (Membrane Shield's levels share its slot: spassives.js)
const genomeFree = () => DRAFT.genome - mutsHeld() - defsHeld();
function cardOk(c) {
  try { if (c.eligible && !c.eligible(G)) return false; } catch (e) { return false; }
  const r = c.rank ? c.rank(G) || 0 : 0;
  if (c.maxRank && r >= c.maxRank) return false;
  if (c.kind === 'acquire' && r === 0) {
    if (c.slot === 'feat' && featsHeld() >= DRAFT.feats) return false;
    if (c.slot === 'genome' && genomeFree() <= 0) return false;
  }
  if (c.slot === 'weaponmut' && !draftMutTarget()) return false;
  return true;
}
const draftMutTarget = () => G.weapons.filter(w => w && !w.isSpell).sort((a, b) => (a.wm10 || []).length - (b.wm10 || []).length).find(w => (w.wm10 || []).length < 3) || null;

// ---------------------------------------------------------------- the pool lean
function leanW(type) {
  const T = G.sampleTypes;
  if (!type || !T) return 1;
  if (type === T.primary) return DRAFT.lean.primary / 0.25 * (1 / 1); // relative weights: primary 2, support 1, other 1/5 each
  if (type === T.support) return 1;
  return DRAFT.lean.other * 4 / 5;
}
const banished = id => G.banish && G.banish[id];
const famK = fam => (G.fewer && G.fewer[fam] ? 0.5 : 1);

// ---------------------------------------------------------------- building a draft
function cardOpt(c) {
  const r = c.rank ? c.rank(G) || 0 : 0, target = c.slot === 'weaponmut' ? draftMutTarget() : null;
  const T = c.type ? DRAFT_INT[c.type] : null;
  const tag = c.slot === 'feat' ? (r ? 'FEAT UPGRADE' : 'NEW FEAT') : c.slot === 'genome' || c.slot === 'weaponmut' ? 'MUTATION' : c.kind === 'specialise' ? 'SPECIALISE' : 'UPGRADE';
  return { card: c.id, family: c.family, rarity: c.rarity || 0, tag, icon: c.icon || c.title.slice(0, 1), color: c.color || (T && ELEMENTS[T] ? ELEMENTS[T].color : '#9fb3c8'), elem: T || undefined,
    title: c.title, sub: (r ? `Rank ${r} > ${r + 1}` : 'New') + (c.maxRank > 1 ? ` of ${c.maxRank}` : '') + (target ? ` | on ${target.def.name}` : ''), desc: c.desc, quip: typeof cardVoice === 'function' ? cardVoice(c) : '', // (cardvoice.js)
    apply: () => { const r0 = r; c.apply(G, target); recomputeAll(); draftAfter(c, r0); } };
}
// After a Feat card, a Feat reaching level 3 or 5 gets its fork screen.
function draftAfter(c, r0) {
  if (c.slot !== 'feat') return;
  const r1 = c.rank ? c.rank(G) || 0 : r0 + 1;
  for (const lv of DRAFT.featForkLv) if (r0 < lv && r1 >= lv && FORKS['feat:' + c.id + '@' + lv]) G.lootQueue.unshift({ kind: 'fork', key: 'feat:' + c.id, lv, v10ok: true });
}
function weaponUp(w) {
  const o = optUpgrade(w, 0), from = w.lvl, ap = o.apply;
  o.family = 'weapon:' + w.id;
  o.apply = () => { ap(); for (const lv of DRAFT.forkLv) if (from < lv && w.lvl >= lv) G.lootQueue.unshift({ kind: 'fork', w, lv, v10ok: true }); };
  return o;
}
function draftCards(n, kind) {
  draftAbsorb();
  const cand = [];
  if (typeof W24 === 'undefined') for (const w of G.weapons) if (w && !w.isSpell && w.lvl < wCap(w) && !banished('weapon:' + w.id)) cand.push({ o: () => weaponUp(w), w: 1.4 * famK('weapon:' + w.id), fam: 'weapon:' + w.id }); // (the 24 upgrade on their own screen: weapons24.js wupCards)
  if (typeof modDraftCands === 'function') cand.push(...modDraftCands(kind)); // (modifier cards and Switched at Birth: modcards.js)
  else if (typeof v10Switch === 'function' && typeof W24 === 'undefined' && !banished('switch')) // (Switched at Birth retires with the matrix: weapons24.js)
     { const sw = v10Switch(); if (sw.length) cand.push({ o: () => Object.assign(sw[0], { family: 'switch' }), w: 0.6 * famK('switch'), fam: 'switch' }); }
  if (typeof pdefOffer === 'function') {
    const keep = PDEF.slots; PDEF.slots = Math.max(0, DRAFT.genome - mutsHeld()); // defences share the Genome with mutations
    for (const o of pdefOffer(2)) if (!banished('def:' + o.defence)) cand.push({ o: () => Object.assign(o, { family: 'def', bkey: 'def:' + o.defence }), w: 0.8 * famK('def'), fam: 'def' });
    PDEF.slots = keep;
  }
  for (const c of CARDS) if (!banished(c.id) && cardOk(c) && !(typeof mdDraftSkip === 'function' && mdDraftSkip(c))) // (mutations come from elites: mutdrop.js)
    cand.push({ o: () => cardOpt(c), w: leanW(c.type) * famK(c.family) * (c.start ? 1 : 0.6) * (typeof crCardW === 'function' ? crCardW(c) : 1), fam: c.family || c.id }); // (crCardW: card rules weight, cardrulesengine.js)
  // Groups share the draft by a fixed weight however many cards they hold, so 30 Feat cards don't crowd out
  // defences (lean, novelty and Fewer still tilt the odds inside each group).
  const grp = f => f.startsWith('feat:') ? 'feat' : f.startsWith('mut:') ? 'mut' : f.startsWith('mod:') ? 'mod' : f === 'catalyst' || f.startsWith('conc:') ? 'spec' : f === 'def' ? 'def' : f.startsWith('up:') ? 'up' : null; // (up: v9 upgrades, v9back.js)
  const tot = {};
  for (const c of cand) { const g = grp(c.fam); if (g) tot[g] = (tot[g] || 0) + c.w; }
  for (const c of cand) { const g = grp(c.fam); if (g && tot[g] > 0) c.w *= DRAFT.groupW[g] / tot[g]; }
  const out = [], fams = new Set();
  // One weapon upgrade always leads the draft while any weapon can still level (the "upgrade a weapon" row).
  const ups = cand.filter(c => c.fam.startsWith('weapon:'));
  if (ups.length && n > 1) { const c = ups[Math.floor(Math.random() * ups.length)]; cand.splice(cand.indexOf(c), 1); fams.add(c.fam); { const k = c.o(); if (k) out.push(k); } /* (a candidate can come back empty, e.g. no weapon left to switch) */; }
  // A DNA strand (loot box) always deals a modifier card when one fits (modcards.js).
  const mods = kind === 'chest' || kind === 'boss' ? cand.filter(c => c.fam.startsWith('mod:')) : [];
  if (mods.length && out.length < n) { const c = mods[Math.floor(Math.random() * mods.length)]; cand.splice(cand.indexOf(c), 1); fams.add(c.fam); { const k = c.o(); if (k) out.push(k); } /* (a candidate can come back empty, e.g. no weapon left to switch) */; }
  while (out.length < n && cand.length) {
    const tot = cand.reduce((a, c) => a + c.w, 0);
    let x = Math.random() * tot, i = 0;
    for (; i < cand.length - 1; i++) { x -= cand[i].w; if (x <= 0) break; }
    const c = cand.splice(i, 1)[0];
    if (fams.has(c.fam) && cand.some(o => !fams.has(o.fam))) continue; // one card per family when there's a choice
    fams.add(c.fam); { const k = c.o(); if (k) out.push(k); } /* (a candidate can come back empty, e.g. no weapon left to switch) */;
  }
  return out;
}
// A fork: two transform cards for one weapon or Feat.
function forkCards(req) {
  draftAbsorb();
  if (req.key) {
    const opts = FORKS[req.key + '@' + req.lv] || [];
    return opts.slice(0, 2).map(o => ({ rarity: 3, tag: 'FORK', icon: 'F', color: '#ffd23f', title: o.title, sub: `Level ${req.lv} fork`, desc: o.desc, apply: () => { o.apply(G); recomputeAll(); } }));
  }
  const w = req.w;
  if (!w || !G.weapons.includes(w)) return [];
  if (typeof wupForkCards === 'function') { const b = wupForkCards(req); if (b) return b; } // (the 24 weapons' branches: weapons24.js)
  const own = FORKS['weapon:' + w.id + '@' + req.lv];
  if (own) return own.slice(0, 2).map(o => ({ rarity: 3, tag: 'FORK', icon: 'F', color: elemCol(wElem(w)), title: o.title, sub: `${w.def.name} | Lv ${req.lv} fork`, desc: o.desc, apply: () => { o.apply(G, w); recomputeAll(); } }));
  if (typeof modsFor !== 'function' || typeof MODS10 === 'undefined') return [];
  return shuffle(modsFor(w)).slice(0, 2).map(id => ({ rarity: 3, tag: 'FORK', icon: 'F', color: elemCol(wElem(w)), title: MODS10[id].name, sub: `${w.def.name} | Lv ${req.lv} fork`, desc: MODS10[id].desc, quip: (typeof cardLine === 'function' ? cardLine('mod:' + MODS10[id].name) : ''),
    apply: () => { modAdd(w, id); computeStats(w); } }));
}

// ---------------------------------------------------------------- Banish (UPGRADES.md 8): two small buttons on each draft card
// Remove (2 rerolls): this card and its upgrade line never come back this run. Fewer like this (1 reroll): its family
// turns up about half as often. Never a whole category to zero. Then the screen redraws (the cost is the reroll).
function draftBanishBtns(c, o) {
  if (!G || !UI.lootReq || !['level', 'chest', 'boss'].includes(UI.lootReq.kind)) return;
  const key = o.card || o.bkey || o.family, fam = o.family || key;
  if (!key) return;
  const mk = (cls, txt, label, cost, fn) => {
    const b = document.createElement('span'); b.className = 'phb ' + cls + (G.rerolls < cost ? ' full' : ''); b.textContent = txt; b.setAttribute('role', 'button'); b.title = label;
    for (const ev of ['pointerdown', 'pointerup', 'click']) b.addEventListener(ev, e => e.stopPropagation());
    b.addEventListener('click', e => {
      e.preventDefault();
      if (!$('lootCards').classList.contains('ready') || G.rerolls < cost) return;
      G.rerolls -= cost; fn();
      UI.lootOpts = UI.sortLoot(genLoot(UI.lootReq)); UI.renderLootCards(); UI.updateReroll();
    });
    c.appendChild(b);
  };
  mk('pin', '½', 'Fewer like this (1 reroll)', 1, () => { (G.fewer || (G.fewer = {}))[fam] = true; });
  mk('hide', '✕', 'Banish: never this run (2 rerolls)', 2, () => { (G.banish || (G.banish = {}))[key] = true; });
}

// The fork screen's title (ui.js openLoot).
function draftTitle(req) {
  if (req.kind === 'wup') return ['WEAPON UPGRADE', wupReady().length > 1 ? 'Choose a weapon to grow.' : 'Choose how it grows. The others are gone for the run.'];
  if (req.kind === 'wupfork') return [req.w.def.name.toUpperCase() + ': TIER ' + (WUP_TIER.indexOf(req.lv) + 1), 'Choose how it grows. The others are gone for the run.'];
  if (req.kind !== 'fork') return [req.kind.toUpperCase(), ''];
  const nm = req.w ? req.w.def.name : (CARDS.find(c => 'feat:' + c.id === req.key) || {}).title || 'Feat';
  return [nm.toUpperCase() + ': LEVEL ' + req.lv + ' FORK', 'Two ways to grow. Take one; the other is gone for the run.'];
}

// ---------------------------------------------------------------- hooks
function draftLoot(req) {
  if (req.kind === 'fork') return forkCards(req);
  if (req.kind === 'wup') return wupCards();
  if (req.kind === 'wupfork') return wupForkReq(req);
  if (req.kind === 'mutation' && typeof mdCards === 'function') return mdCards(3); // (an elite's strand: mutdrop.js)
  if ((req.kind === 'chest' || req.kind === 'boss') && typeof modBoxCards === 'function') { const m = modBoxCards(3); if (m.length) return m; } // (DNA strands: modifiers, modcards.js)
  if (req.kind === 'level' || req.kind === 'chest' || req.kind === 'boss') return draftCards(typeof dirN === 'function' ? dirN(req) : 3, req.kind); // (four on a take-two screen: director.js)
  return null;
}
// Which boxes open, and when. 'wait' keeps a box queued without opening it.
function draftBox(req) {
  if (req.kind === 'start') return true;
  let ok = true;
  if (req.kind === 'mutation') ok = typeof mdOk === 'function' && (mdOk().length > 0 || mdSwapOk()); // (dropped if nothing fits any more: an empty screen would stick)
  else if (req.kind === 'wup') ok = wupReady().length > 0;
  else if (req.kind === 'wupfork') ok = wupNextLv(req.w) === req.lv;
  else if (req.kind === 'fork') ok = forkCards(req).length > 0;
  else if (req.kind !== 'slot' && !['level', 'chest', 'boss', 'relic', 'spoils', 'rrelic'].includes(req.kind)) ok = false; // (boss relics, spoils and a rival's trophy: genLoot builds them)
  if (!ok) return false;
  return typeof dirGate === 'function' ? dirGate(req) : true; // (order, pacing, the egg; wave mode plays at the break: director.js)
}
