'use strict';
// Spawn Prawn - v10 draft core (redesign docs/UPGRADES.md): one card-choice screen for everything.
//  - Cards: weapon upgrades (Enhance), Switched at Birth, defence cards (pdef.js), and every card registered by
//    feature files through draftRegister (Feats: feats10.js; mutations, Catalysts, Concentration: mutations.js).
//  - Slots: 3 weapons (drafts at Lv 1, 8, 22, as before), 3 Feats, 4 Genome slots shared by mutations and defences.
//    Acquire cards leave the pool once their slots are full, so late drafts become upgrades by themselves.
//  - Forks: a weapon reaching Lv 5 or 10 (one mastery weapon a run), or a Feat reaching level 3 or 5, gets its own
//    2-card screen. Fork options come from forkRegister, or for weapons from two fitting modifiers (modifiers.js).
//  - Pool lean: typed cards 50% primary type, 25% support, 25% other (G.sampleTypes, set by the sample).
//  - Triggers: level-ups and elite/boss chests. Wave mode: one level draft a wave plus chests, all at the wave break.
//    Elsewhere: at most one screen per 40 s of combat (forks are never held back).
// Hooks: v10.js v10Loot -> draftLoot, v10Box -> draftBox; game.js main loop treats draftBox's 'wait' as "not yet".
// Card shape: { id, kind: 'acquire'|'enhance'|'specialise', slot: 'feat'|'genome'|'weaponmut'|null, family, type,
//   rarity, start, title, desc, icon, color, eligible(G), apply(G, target), rank(G), maxRank }.

const DRAFT = { genome: 4, feats: 3, budget: 40, lean: { primary: 0.5, support: 0.25, other: 0.25 }, forkLv: [5, 10], featForkLv: [3, 5] };
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
const defsHeld = () => (typeof pdef === 'function' ? Object.values(pdef().n).filter(n => n > 0).length : 0);
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
    title: c.title, sub: (r ? `Rank ${r} > ${r + 1}` : 'New') + (c.maxRank > 1 ? ` of ${c.maxRank}` : '') + (target ? ` | on ${target.def.name}` : ''), desc: c.desc,
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
function draftCards(n) {
  draftAbsorb();
  const cand = [];
  for (const w of G.weapons) if (w && !w.isSpell && w.lvl < wCap(w)) cand.push({ o: () => weaponUp(w), w: 1.4, fam: 'weapon:' + w.id });
  if (typeof v10Switch === 'function') { const sw = v10Switch(); if (sw.length) cand.push({ o: () => sw[0], w: 0.6, fam: 'switch' }); }
  if (typeof pdefOffer === 'function') {
    const keep = PDEF.slots; PDEF.slots = Math.max(0, DRAFT.genome - mutsHeld()); // defences share the Genome with mutations
    for (const o of pdefOffer(2)) cand.push({ o: () => o, w: 0.8, fam: 'def' });
    PDEF.slots = keep;
  }
  for (const c of CARDS) if (!banished(c.id) && cardOk(c)) cand.push({ o: () => cardOpt(c), w: leanW(c.type) * famK(c.family) * (c.start ? 1 : 0.6), fam: c.family || c.id });
  const out = [], fams = new Set();
  while (out.length < n && cand.length) {
    const tot = cand.reduce((a, c) => a + c.w, 0);
    let x = Math.random() * tot, i = 0;
    for (; i < cand.length - 1; i++) { x -= cand[i].w; if (x <= 0) break; }
    const c = cand.splice(i, 1)[0];
    if (fams.has(c.fam) && cand.some(o => !fams.has(o.fam))) continue; // one card per family when there's a choice
    fams.add(c.fam); out.push(c.o());
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
  const own = FORKS['weapon:' + w.id + '@' + req.lv];
  if (own) return own.slice(0, 2).map(o => ({ rarity: 3, tag: 'FORK', icon: 'F', color: w.def.color, title: o.title, sub: `${w.def.name} | Lv ${req.lv} fork`, desc: o.desc, apply: () => { o.apply(G, w); recomputeAll(); } }));
  if (typeof modsFor !== 'function' || typeof MODS10 === 'undefined') return [];
  return shuffle(modsFor(w)).slice(0, 2).map(id => ({ rarity: 3, tag: 'FORK', icon: 'F', color: w.def.color, title: MODS10[id].name, sub: `${w.def.name} | Lv ${req.lv} fork`, desc: MODS10[id].desc,
    apply: () => { modAdd(w, id); computeStats(w); } }));
}

// ---------------------------------------------------------------- hooks
function draftLoot(req) {
  if (req.kind === 'fork') return forkCards(req);
  if (req.kind === 'level' || req.kind === 'chest' || req.kind === 'boss') return draftCards(3);
  return null;
}
// Which boxes open, and when. 'wait' keeps a box queued without opening it.
function draftBox(req) {
  if (req.kind === 'start' || req.kind === 'slot') return true;
  if (req.kind === 'fork') { if (!forkCards(req).length) return false; G.draftT = G.t; return true; }
  if (!['level', 'chest', 'boss'].includes(req.kind)) return false;
  if (G.wave) { // wave mode: one level draft a wave, plus chests from elites and bosses; they play at the wave break
    if (req.kind === 'level') { if (G.v10sw === G.wave.n && !req.v10ok) return false; G.v10sw = G.wave.n; }
    req.v10ok = true; return true;
  }
  if (req.v10ok) return true;
  if (G.draftT != null && G.t - G.draftT < DRAFT.budget) return 'wait';
  G.draftT = G.t; req.v10ok = true; return true;
}
