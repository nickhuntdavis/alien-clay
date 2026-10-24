'use strict';
// Spawn Prawn - weapon cells, part 5: One of These Days and Sister Cousin (redesign docs/MODIFIER_MATRIX.md 5.9, and those
// two rows of sections 3 and 4; built 24 Oct). Same engine as cellmods.js (XC_W masking, no fork screens, rank 1 to 3 then
// the mastery). Card text: cell_od_<modifier> / cell_sc_<modifier> in cellcopy5.js.
//  - ONE OF THESE DAYS (s_duedate, toys.js Due Date: dueFire / dueMark / duePop / toyHurt / toyKill). With a cell this file
//    places the marks itself (dueFire): a mark is placed "free" and its needle hit is dealt here, so a cell can choose the
//    source (Death from Above's strike ignores Evasion). Each new mark is set up once (xcOdInit: share, length, links,
//    tags) and paid out through duePop, whose share (s.repeat) is swapped for the mark's own for that one call; the after
//    effects of a payout (launch, burst, bounce, splash, re-mark) are in xcOdPaid. Shared forms kept: Range, Up Close
//    (the falloff on the needle hit), Catalyst, Kinship, Primer, Area. Switched at Birth (Mucus): the needle Snares 1 s.
//  - SISTER COUSIN (s_seeker, the homing gun; its kill split is modifiers.js 'multiplying', added by wup5.js makeSlot).
//    Siblings are tagged in modProj (volley, Every Nth, Piercing, Ricochet, Extra Projectiles' directions) and every hit
//    runs through modHit (after the engine's own split). Melee (clingy siblings), Orbiting, Mines (nests) and Death from
//    Above (dives) replace the volley. 'multiplying' is the weapon's own split, so it no longer fills the Flight slot
//    (modOk ignores it). Homing is N/A (it already homes). Shared forms kept: Range, Up Close, Catalyst, Kinship, Area.
//    Switched at Birth (Fire): the Fire type itself sets targets alight (fight.js); nothing extra here.
// Simplified (see 5.9): Switched at Birth has no ranks (its Snare and Burn steps are not built); od Kinship and sc Kinship
// masteries need 3 weapons of the type (Full Family); splash payouts (Every Nth, Melee, Death from Above masteries) are echo
// damage at 50%, capped at 8 enemies; sc Knockback's mastery hits the nearest enemy for the corpse (the dead are removed).
// Hooks: none in shared files. Wraps toys.js dueFire/dueMark/duePop/toyHurt/toyKill, modifiers.js modProj/modHit, modOk,
// mwDetonate, wupDmgMul, wupKill, fight.js rxFired, modDraw; fills cellmods.js XC_TICK/XC_FIRE/XC_STATS/XC_RUN/XC_LIFE.
// Loads after cellmods2.js.

XC_W.s_duedate = { tag: 'od',
  cells: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
  mask: ['rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
  deny: ['ranged'], atkOk: [] };
XC_W.s_seeker = { tag: 'sc',
  cells: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
  mask: ['rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting'],
  deny: ['homing', 'ranged'], atkOk: [] };

const x5Bleed = (e, dmg, w) => { if (!e || e.dead || e.charmed) return; const b = e.bleeds || (e.bleeds = []); if (b.length >= 3) b.shift(); b.push({ dps: Math.max(0.5, dmg) * 0.3 / 3, t: 3, by: w.def.name }); };
const x5Fam = w => G.weapons.filter(x => x && !x.isSpell && x.def && mwType(x) === mwType(w)).length >= 3; // (Kinship's Full Family)
const x5Tough = (x, y, R, not, free) => { let b = null, bv = -1; for (const o of G.enemies) { if (!toyCan(o) || (not && not.includes(o)) || (free && o.due)) continue; if (Math.hypot(o.x - x, o.y - y) - (o.r || 0) > R) continue; const v = o.hp + (o.elite || o.boss ? 1e6 : 0); if (v > bv) { bv = v; b = o; } } return b; };
// Mucus pulls mates in, others take a share: everything within R of (x, y) but e, at most n.
const x5Near = (x, y, R, e, n, fn) => { let k = 0; forNear(x, y, R, o => { if (o === e || !toyCan(o) || k >= n) return; k++; fn(o); }); return k; };

// ================================================================ ONE OF THESE DAYS
const XOD = { tag: null, main: null };
const xcOd = w => w.xcOd || (w.xcOd = { nd: null, mines: [], fly: [] });
const xcOdDur = (D, t) => { D.end = G.t + t; D.max = t; };
const xcOdSrc = (w, extra) => toySrc(w, 'Due Date', Object.assign({ due: true, noCrit: true }, extra || {})); // (payout shares: echo)
// One mark from a cell: placed free, then its needle hit (o.free: no hit; o.k: hit strength; o.src: extra source fields).
function xcOdMark(w, e, tag, o) {
  if (!e || !toyCan(e) || !G.weapons.includes(w)) return null;
  XOD.tag = tag;
  try { dueMark(w, e, true); } finally { XOD.tag = null; }
  if (!(o && o.free)) damageEnemy(e, w.s.dmg * ((o && o.k) || 1), toySrc(w, 'Due Date', o && o.src));
  return e.due && e.due.w === w ? e.due : null;
}
// A new mark of this weapon, set up once.
function xcOdInit(w, e, D) {
  const R = id => xcR(w, id), p = G.player, s = w.s, dist = Math.hypot(e.x - p.x, e.y - p.y), tag = XOD.tag;
  D.xcSeen = 1; D.t0 = G.t; D.xcRep = 0; D.tag = tag;
  const rep = v => { D.xcRep = Math.max(D.xcRep, v); };
  if (R('range') && dist > 300) D.xcFar = 1; // Forwarding address
  if (R('range') >= 4 && dist > 400) rep(0.55);
  if (R('upclose') && dist < 120) { D.xcNear = 1; if (R('upclose') >= 4 && dist < 60) xcOdDur(D, 2); } // Express delivery
  if (tag === 'copy' && XOD.main) { D.xcRepK = R('extra') >= 3 ? 0.75 : 0.5; D.xcCopyOf = XOD.main; D.end = XOD.main.end; D.max = XOD.main.max; } // a carbon copy
  if (R('charged')) rep(xcLv([0.5, 0.6, 0.7, 0.7], R('charged')));
  if (tag === 'melee') { if (R('melee') >= 2) rep(0.5); if (R('melee') >= 3) xcOdDur(D, 3); }
  if (tag === 'mine' && R('mines') >= 3) rep(0.5);
  if (tag === 'dfa' && R('dfa') >= 2) rep(0.5);
  if (tag === 'orbit' && R('orbiting') >= 3) rep(0.5);
  if (tag === 'turn' && R('turncoat') >= 2) rep(0.5);
  if (tag === 'mini') { D.xcFix = 0.2; xcOdDur(D, 2); }
  if (R('nth') && ['fire', 'dfa', 'mine', 'melee', 'orbit'].includes(tag)) { // Every Nth: a big bill
    w.xcN = (w.xcN || 0) + 1;
    if (w.xcN % (R('nth') >= 2 ? 3 : 4) === 0) { D.xcNth = 1; rep(0.7); if (R('nth') >= 3) xcOdDur(D, 3); floatText(e.x, e.y - e.r - 26, 'x' + Math.round(D.xcRep * 100) + '%', w.def.color, 13, 0.8); }
  }
  if (R('ricochet') && tag !== 'bounce') D.xcB = XC_RAMP(R('ricochet'));
  if (R('connecting') && tag !== 'mini') { // Joint account: the nearest neighbours share the bill
    const L = D.xcLinks = [], n = R('connecting') >= 2 ? 2 : 1;
    for (const o of acquireMany('nearest', 160, e.x, e.y, n + 3)) { if (L.length >= n) break; if (o === e || o.due || o.xcJA && o.xcJA.e.due === o.xcJA.D) continue; L.push(o); o.xcJA = { D, e }; }
  }
  if (w.def.sab && mwType(w) === 'ice') msSnare(e, 1); // (Switched at Birth: the needle Snares)
  if (R('extra') && (tag === 'fire' || tag === 'dfa') && !XOD.main) { // Carbon copies: the same bill on its neighbours, paid at the same moment
    const k = xcLv([1, 2, 2, 2], R('extra')), cs = acquireMany('nearest', 160, e.x, e.y, k + 4).filter(o => o !== e && !o.due).slice(0, k);
    if (R('extra') >= 4) for (const o of G.enemies) { if (cs.length >= 10) break; if (toyCan(o) && (o.elite || o.boss || o.rival) && !o.due && o !== e && !cs.includes(o) && Math.hypot(o.x - p.x, o.y - p.y) < 700) cs.push(o); }
    XOD.main = D;
    try { for (const o of cs) { bolt(e.x, e.y, o.x, o.y, '#f8f9fa', 0.2); xcOdMark(w, o, 'copy', { k: 0.5 }); } } finally { XOD.main = null; }
    D.xcCopies = cs;
  }
}
dueMark = (orig => function (w, e, free) {
  const had = e && e.due;
  orig(w, e, free);
  if (!G || !w || !xcIs(w, 'od') || !xcAny(w) || !e || !e.due || e.due.w !== w) return;
  if (!e.due.xcSeen) xcOdInit(w, e, e.due);
  else if (had && xcR(w, 'rapid') >= 4) e.due.xcRep = Math.min(0.8, Math.max(e.due.xcRep || 0, w.s.repeat) + 0.1); // (stacked marks: cap 80%)
})(dueMark);
// The needle (Piercing): passes through the enemies between you and the mark.
function xcOdNeedle(w, t) {
  const p = G.player, r = xcR(w, 'piercing'), on = [];
  alongLine(p, t, 10, o => { if (o !== t && on.length < 24) on.push(o); });
  on.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
  bolt(p.x, p.y, t.x, t.y, w.def.color, 0.15);
  on.slice(0, XC_RAMP(r)).forEach((o, i) => {
    damageEnemy(o, w.s.dmg * 0.6 * Math.pow(0.85, i), toySrc(w, 'Due Date'));
    if (r >= 4 && !o.due) xcOdMark(w, o, 'mini', { free: true });
  });
}
function xcOdSend(w, e) {
  const R = id => xcR(w, id), dfa = R('dfa'), wait = dfa || R('charged') ? 0.4 : 0;
  if (R('piercing')) xcOdNeedle(w, e);
  if (!wait) { xcOdMark(w, e, 'fire'); return; }
  G.fx.push({ type: 'warn', x: e.x, y: e.y, r: e.r + (dfa ? 16 : 10), color: w.def.color, life: wait, max: wait }); // (the reticle, or Charged's wind-up)
  after(wait, () => {
    if (!G || !G.weapons.includes(w) || e.dead) return;
    if (dfa) bolt(e.x, e.y - 160, e.x, e.y, w.def.color, 0.18);
    xcOdMark(w, e, dfa ? 'dfa' : 'fire', dfa >= 3 ? { src: { atk: 'burst' } } : null); // (a strike: Evasion can't miss it)
  });
}
function xcOdFire(w, target) {
  const R = id => xcR(w, id), s = w.s, p = G.player, O = xcOd(w);
  if (R('melee') || R('orbiting')) return; // (Tick tock and the orbiting needle run in the tick)
  if (R('mines')) { // countdown mines, laid in the target's path
    const cap = R('mines') >= 2 ? 5 : 3, mine = O.mines.filter(m => !m.used || m.wait);
    if (mine.length >= cap) mine[0].end = 0;
    const t = target || acquire('nearest', s.range, p.x, p.y);
    const x = t ? p.x + (t.x - p.x) * 0.75 : p.x, y = t ? p.y + (t.y - p.y) * 0.75 : p.y;
    O.mines.push({ x: x + rand(-20, 20), y: y + rand(-20, 20), arm: G.t + 0.4, end: G.t + 14, used: false });
    O.mines = O.mines.filter(m => m.end > G.t).slice(-12);
    sfx('shot'); return;
  }
  const h = R('homing'), dir = h ? 'strongest' : aimDir(w), rng = s.range * (h ? 1 + 0.25 * Math.min(3, h) : 1);
  const n = s.count;
  let ts = acquireMany(dir, rng, p.x, p.y, n + 6).filter(e => !e.due || R('rapid') >= 4);
  if (h >= 4) { const safe = ts.filter(e => e.hp > s.dmg * 2); if (safe.length) ts = safe; } // (never a target about to die)
  ts = ts.slice(0, n);
  if (!ts.length && target && !target.dead && !target.due) ts.push(target);
  for (const e of ts) xcOdSend(w, e);
  if (ts.length) sfx('shot');
}
dueFire = (orig => function (w, target) {
  if (G && w && xcIs(w, 'od') && xcAny(w)) { xcOdFire(w, target); return; }
  return orig(w, target);
})(dueFire);
XC_STATS.od = function (w, s) {
  const R = id => xcR(w, id);
  if (R('rapid')) { s.cd /= 1 + xcLv([0.4, 0.8, 1.2, 1.6], R('rapid')); s.dur = Math.min(s.dur, 3); s.repeat *= 0.75; } // more, smaller, sooner bills
  if (R('range')) s.range *= 1 + 0.15 * Math.min(3, R('range'));
};
// The payout: the mark's own share, then everything a payout sets off.
duePop = (orig => function (e) {
  const D = e && e.due, w = D && D.w;
  if (!G || !w || !w.s || !xcIs(w, 'od') || !xcAny(w) || !D.xcSeen) return orig(e);
  const s = w.s, R = id => xcR(w, id), keep = s.repeat;
  let rep = D.xcFix != null ? D.xcFix : Math.max(s.repeat, D.xcRep || 0);
  rep += (D.xcFee || 0) + (D.xcFoc || 0) + (D.xcPct || 0);
  if (D.xcEarly && R('focus') >= 4) rep = Math.max(rep, 0.8); // (paid in full early)
  if (D.xcRepK) rep *= D.xcRepK;
  rep = Math.min(1.5, rep);
  if (D.xcBonus) D.stored += D.xcBonus / Math.max(0.05, rep); // (carried and added damage lands as itself)
  const P = D.stored * rep + s.dmg * 3, x = e.x, y = e.y;
  const links = (D.xcLinks || []).filter(o => !o.dead), split = R('connecting') >= 4 && links.length ? 1 / (links.length + 1) : 1;
  if (split < 1) D.stored *= split;
  const parts = R('rapid') ? xcLv([2, 3, 4, 4], R('rapid')) : 1, d0 = s.dmg; // Instalments: the first part now, the rest 0.25 s apart
  s.repeat = rep / parts; s.dmg = d0 / parts;
  try { orig(e); } finally { s.repeat = keep; s.dmg = d0; }
  for (let i = 1; i < parts; i++) after(0.25 * i, () => {
    if (!G || e.dead || !G.weapons.includes(w)) return;
    damageEnemy(e, P * split / parts, xcOdSrc(w)); floatText(e.x, e.y - e.r - 18, (i + 1) + '/' + parts, w.def.color, 12, 0.5); ring(e.x, e.y, e.r + 20, w.def.color, 0.25, 3);
    if (i === parts - 1 && R('rapid') >= 4 && !e.dead && !e.due) xcOdMark(w, e, 'mini', { free: true }); // the last instalment opens a new bill
  });
  if (D.xcCopies) for (const o of D.xcCopies) if (!o.dead && o.due && o.due.xcCopyOf === D) o.due.end = G.t; // copies are paid at the same moment
  xcOdPaid(w, e, D, P, x, y, links, split);
})(duePop);
function xcOdPaid(w, e, D, P, x, y, links, split) {
  const R = id => xcR(w, id), s = w.s, src = xcOdSrc(w), p = G.player, O = xcOd(w);
  if (R('knock') && !e.dead && !e.boss) { // the payout launches the target
    shove(e, p.x, p.y, xcLv([120, 200, 280, 280], R('knock')));
    if (R('knock') >= 4 && O.fly.length < 6) O.fly.push({ e, t: G.t + 0.6, dmg: P * 0.4, hit: [] });
  }
  if (R('pull') >= 4 && D.xcPulled) { for (const o of D.xcPulled) if (!o.dead && o !== e) damageEnemy(o, P * 0.5, src); ring(x, y, D.xcPullR || 80, w.def.color, 0.35, 3); }
  if (R('sticky') >= 4 && !e.dead) msSnare(e, 2);
  if (R('explode')) { // the bill bursts
    const rr = 60 * xcArea(w), k = xcLv([0.5, 0.6, 0.7, 0.7], R('explode')); let top = null;
    x5Near(x, y, rr, e, 12, o => { damageEnemy(o, P * k, src); if (!top || o.hp > top.hp) top = o; });
    ring(x, y, rr, w.def.color, 0.4, 4);
    if (R('explode') >= 4 && top && !top.dead && !top.due) xcOdMark(w, top, 'mini', { free: true });
  }
  if (R('area')) { const rr = 40 * xcArea(w); x5Near(x, y, rr, e, 12, o => { damageEnemy(o, P * 0.25, src); x5Bleed(o, P * 0.25, w); }); ring(x, y, rr, w.def.color, 0.3, 2); } // Collateral
  if (R('charged') >= 4) { forNear(x, y, 80, o => { if (toyCan(o)) x5Bleed(o, P * 0.3, w); }); ring(x, y, 80, '#c9184a', 0.35, 3); }
  const splash = (rr, k) => { x5Near(x, y, rr, e, 8, o => damageEnemy(o, P * k, src)); ring(x, y, rr, w.def.color, 0.4, 3); };
  if (D.xcNth && R('nth') >= 4) splash(100, 0.5);
  if (D.tag === 'melee' && R('melee') >= 4) splash(60, 0.5);
  if (D.tag === 'dfa' && R('dfa') >= 4) { G.fx.push({ type: 'warn', x, y, r: 80, color: w.def.color, life: 0.2, max: 0.2 }); bolt(x, y - 180, x, y, w.def.color, 0.2); splash(80, 0.5); }
  if (links.length) { // Joint account: the partners pay out too
    const k = split < 1 ? split : 0.5;
    for (const o of links) { damageEnemy(o, P * k, src); bolt(x, y, o.x, o.y, w.def.color, 0.18); o.xcJA = null; }
  }
  if (D.xcB > 0) { // the bill bounces on
    const t = acquireMany('nearest', 220, x, y, 6).find(o => o !== e && !o.due && toyCan(o));
    if (t) { bolt(x, y, t.x, t.y, w.def.color, 0.2); const N = xcOdMark(w, t, 'bounce', { free: true }); if (N) { N.xcB = D.xcB - 1; if (R('ricochet') >= 4) N.xcBonus = P * 0.7; } }
  }
  if (D.tag === 'orbit' && R('orbiting') >= 4) { const t = x5Tough(x, y, 250, [e], true); if (t) { bolt(x, y, t.x, t.y, w.def.color, 0.2); xcOdMark(w, t, 'orbit', { free: true }); } }
  if (D.xcFar) { // Forwarding address: part of a far bill is forwarded to the enemy nearest you
    const o = msNear(p.x, p.y, 250, [e]);
    if (o && toyCan(o)) { bolt(x, y, o.x, o.y, w.def.color, 0.25); damageEnemy(o, P * xcLv([0.3, 0.45, 0.6, 0.6], R('range')), src); ring(o.x, o.y, o.r + 12, w.def.color, 0.3, 3); }
  }
  if (D.xcNear && R('upclose') >= 4 && !e.dead && !e.boss && Math.hypot(e.x - p.x, e.y - p.y) < 120) shove(e, p.x, p.y, 220); // a delivery to the door
  if (R('kinship')) { // Family debt: enemies your other weapons of this type hit lately share the bill
    let n = 0;
    for (const o of G.enemies) {
      if (n >= 6 || o === e || !toyCan(o) || !(o.xcKinT > G.t - 2) || o.xcKinTy !== mwType(w) || Math.hypot(o.x - x, o.y - y) > 150) continue;
      n++; bolt(x, y, o.x, o.y, w.def.color, 0.2); damageEnemy(o, P * xcLv([0.2, 0.3, 0.4, 0.4], R('kinship')), src);
      if (R('kinship') >= 4 && !o.due) xcOdMark(w, o, 'mini', { free: true });
    }
  }
  if (D.xcMine) { D.xcMine.used = false; D.xcMine.wait = false; D.xcMine.arm = G.t + 0.5; } // the payout re-arms the mine
}
toyHurt = (orig => function (e, lost, src) {
  orig(e, lost, src);
  if (!G || lost <= 0 || !src || src.due || (src.echo && src.w && src.w.def.sig)) return;
  const J = e.xcJA; // Joint account: a partner's damage counts towards the bill
  if (J && J.e.due === J.D && !J.e.dead && J.D.w && xcR(J.D.w, 'connecting')) J.D.stored += lost * (xcR(J.D.w, 'connecting') >= 3 ? 1 : 0.5);
  const D = e.due, w = D && D.w;
  if (!w || !D.xcSeen || !xcIs(w, 'od')) return;
  if (xcR(w, 'focus') && src.w && !D.xcEarly) { // Running tab: every hit adds to the share; a full tab is paid at once
    const cap = xcLv([0.15, 0.3, 0.45, 0.45], xcR(w, 'focus'));
    D.xcFoc = Math.min(cap, (D.xcFoc || 0) + 0.015);
    if (D.xcFoc >= cap - 1e-6) { D.xcEarly = 1; D.end = G.t; floatText(e.x, e.y - e.r - 30, 'PAID IN FULL', w.def.color, 13, 0.8); }
  }
})(toyHurt);
toyKill = (orig => function (e, src) {
  const D = e && e.due, w = D && D.w;
  if (G && w && w.s && D.xcSeen && xcIs(w, 'od') && xcAny(w) && G.weapons.includes(w)) {
    if (xcR(w, 'homing') >= 4) { // the needle retargets: the bill moves to the toughest enemy near
      const t = x5Tough(e.x, e.y, 260, [e], true);
      if (t) { e.due = null; t.due = D; TOYS().marks.push(t); bolt(e.x, e.y, t.x, t.y, w.def.color, 0.2); ring(t.x, t.y, t.r + 14, w.def.color, 0.3, 3); return orig(e, src); }
    }
    if (xcR(w, 'turncoat') && !e.elite && !e.boss && !e.rival && !e.egg && !e.mwAllyOf) { // Debt collector
      const carry = xcR(w, 'turncoat') >= 4 ? D.stored : 0, n0 = G.enemies.length;
      orig(e, src);
      xcRise(w, e);
      if (G.enemies.length > n0) { const z = G.enemies[G.enemies.length - 1]; if (z.xcRun && z.xcRun.w === w) z.xcRun.carry = carry; }
      return;
    }
  }
  return orig(e, src);
})(toyKill);
XC_LIFE.od = () => 6;
XC_RUN.od = function (z, dt) { // the debt collector swims to the toughest enemy and sticks a fresh bill on it
  const w = z.xcRun.w, r = xcR(w, 'turncoat');
  let t = z.xcRun.t; if (!t || !toyCan(t) || t.due) t = z.xcRun.t = x5Tough(z.x, z.y, 500, [z], true);
  if (t) {
    const d = Math.hypot(t.x - z.x, t.y - z.y) || 1, sp = r >= 3 ? 280 : 140;
    z.x += (t.x - z.x) / d * sp * dt; z.y += (t.y - z.y) / d * sp * dt;
    if (d < t.r + z.r + 6) {
      const N = xcOdMark(w, t, 'turn');
      if (N && z.xcRun.carry) N.stored += z.xcRun.carry;
      ring(t.x, t.y, t.r + 16, w.def.color, 0.35, 3); z.dead = true; return;
    }
  }
  if (z.xcRun.end <= G.t) z.dead = true;
};
XC_TICK.od = function (w, dt) {
  const R = id => xcR(w, id), s = w.s, p = G.player, O = xcOd(w);
  const t4 = !(w.xcT4 > G.t); if (t4) w.xcT4 = G.t + 0.25;
  for (const e of TOYS().marks) {
    const D = e.due; if (!D || D.w !== w || e.dead || !D.xcSeen) continue;
    const left = D.end - G.t;
    if (R('sticky')) { msSlow(e, xcLv([0.3, 0.5, 0.7, 0.7], R('sticky')), 0.3); D.xcFee = Math.min(xcLv([0.12, 0.18, 0.24, 0.24], R('sticky')), 0.04 * (G.t - D.t0)); } // Late fee
    if (R('pull') && left < 1.2) { // the marked one pulls its mates in before it pays
      const rr = 80 * xcLv([1, 1.5, 2, 2], R('pull')) * xcArea(w); D.xcPullR = rr;
      forNear(e.x, e.y, rr, o => { if (o === e || o.charmed || o.boss) return; mwPull(o, e.x, e.y, 90 * Math.min(3, R('pull')) * dt); if (R('pull') >= 4) { const L = D.xcPulled || (D.xcPulled = []); if (L.length < 12 && !L.includes(o)) L.push(o); } });
    }
    if (D.xcNear && R('upclose') && Math.hypot(e.x - p.x, e.y - p.y) < 120) { D.end -= dt * (xcLv([2, 2.5, 3, 3], R('upclose')) - 1); D.xcExp = G.t + 0.1; } // Express delivery: the clock runs fast while it is close
    if (R('primer') >= 3 && t4 && !(e.mwPr && e.mwPr.t > G.t)) e.mwPr = { w, t: D.end, by: new Set(), steps: 0 }; // primed all the way to the payout
  }
  if (R('melee') && t4) { // Tick tock: whatever touches you gets a bill
    let n = TOYS().marks.filter(e => e.due && e.due.w === w && e.due.tag === 'melee').length;
    forNear(p.x, p.y, (p.r || 12) + 30, e => { if (n >= 12 || !toyCan(e) || e.due || w.xcOdMT > G.t) return; n++; w.xcOdMT = G.t + s.cd * 0.75; xcOdMark(w, e, 'melee'); }); // (about one bill per shot: the needle's damage per second, which also pauses to reload)
  }
  if (R('orbiting')) { // a needle circles you and marks the biggest enemy to come close
    const n = R('orbiting') >= 2 ? 2 : 1;
    if (!O.nd || O.nd.length !== n) O.nd = Array.from({ length: n }, () => ({ ready: 0 }));
    O.na = (O.na || 0) + 2.5 * dt;
    O.nd.forEach((nd, i) => {
      const a = O.na + i / n * TAU; nd.x = p.x + Math.cos(a) * 70; nd.y = p.y + Math.sin(a) * 70; nd.a = a;
      if (nd.ready > G.t) return;
      const t = x5Tough(p.x, p.y, 140, null, true); if (!t) return;
      bolt(nd.x, nd.y, t.x, t.y, w.def.color, 0.15); xcOdMark(w, t, 'orbit'); nd.ready = G.t + Math.max(1.2, s.cd * 2);
    });
  } else O.nd = null;
  for (const m of O.mines) { // countdown mines mark whoever trips them
    if (m.used || m.end < G.t || m.arm > G.t) continue;
    const e = xcFoe(m.x, m.y, 36); if (!e || e.due) continue;
    const D = xcOdMark(w, e, 'mine'); ring(m.x, m.y, 30, w.def.color, 0.3, 3); m.used = true;
    if (D && R('mines') >= 4) { D.xcMine = m; m.wait = true; } else m.end = 0;
  }
  O.mines = O.mines.filter(m => m.end > G.t);
  for (const L of O.fly) { // a launched target hits its mates
    if (L.e.dead || L.t < G.t) { L.t = 0; continue; }
    forNear(L.e.x, L.e.y, L.e.r + 8, o => { if (o === L.e || !toyCan(o) || L.hit.includes(o) || L.hit.length >= 4) return; L.hit.push(o); damageEnemy(o, L.dmg, xcOdSrc(w)); spawnPart(o.x, o.y, w.def.color, 3, 70, 0.2, 2); });
  }
  O.fly = O.fly.filter(L => L.t > 0);
};
// Kills by this weapon: the shared Turncoat never rises a random kill here (the debt collector rises from a marked kill).
wupKill = (orig => function (e, src) {
  const w = src && src.w;
  if (!(w && xcIs(w, 'od') && w.m10 && w.m10.includes('turncoat') && !w.xcDepth)) return orig(e, src);
  const k = w.m10; w.m10 = k.filter(x => x !== 'turncoat');
  try { return orig(e, src); } finally { w.m10 = k; }
})(wupKill);

// ================================================================ SISTER COUSIN
const XSC = { vol: null, rx: null };
const xcSc = w => w.xcSc || (w.xcSc = { vol: 0, orb: [], cl: [], nests: [], dives: [], feud: [], hang: [] });
const xcScLive = w => { let n = 0; for (const q of G.proj) if (q.w === w && !q.dead) n++; return n; };
const xcScCap = w => (typeof modV === 'function' && modHas(w, 'multiplying') ? modV(w, 'multiplying', 'flight') : 12) + 4;
// Split siblings made by a cell (the engine's own split is modifiers.js modHit): up to n, at the nearest other enemies.
function xcScKids(w, pr, e, n, over) {
  const room = Math.min(n, xcScCap(w) - xcScLive(w)); if (room <= 0) return 0;
  const ts = acquireMany('nearest', 260, e.x, e.y, 4).filter(t => t !== e);
  XSC.vol = pr.xcVol != null ? pr.xcVol : XSC.vol;
  try {
    for (let i = 0; i < room; i++) {
      const t = ts.length ? ts[i % ts.length] : null, a = t ? Math.atan2(t.y - e.y, t.x - e.x) : Math.random() * TAU;
      spawnProj(w, e.x, e.y, a, pr.src || weaponSrc(w), Object.assign({ dmg: (pr.dmg || w.s.dmg) * 0.5, mSplit: 1, pierce: 0, hits: [e.id], tgt: t }, over || null));
    }
  } finally { XSC.vol = null; }
  return room;
}
XC_STATS.sc = function (w, s) {
  const R = id => xcR(w, id);
  if (R('range')) s.range *= 1 + 0.15 * Math.min(3, R('range'));
  if (R('rapid')) { const n0 = s.count || 2, n1 = n0 + R('rapid'), K = xcLv([1.05, 1.26, 1.43, 1.6], R('rapid')); s.count = n1; s.dmg *= K * n0 / n1; } // more, weaker siblings
  if (R('charged')) { // a wind-up, then a bigger litter (balanced on damage per second)
    const r = R('charged'), n0 = s.count || 2, n1 = n0 + xcLv([1, 2, 3, 3], r), cd0 = s.cd, wind = xcLv([0.5, 0.4, 0.3, 0.3], r), K = xcLv([1.07, 1.36, 1.69, 1.69], r);
    s.cd = cd0 + wind; s.count = n1; s.dmg *= K / ((n1 / n0) * (cd0 / s.cd)); s.xcWind = wind;
  }
  if (R('extra')) { const n0 = s.count || 2, n1 = R('extra') >= 4 ? Math.max(8, n0 + 2) : n0 + xcLv([1, 2, 2], R('extra')); s.count = n1; s.dmg *= Math.pow(n0 / n1, 0.4); }
};
function xcScDive(w, e, kid) {
  const S = xcSc(w); if (S.dives.length >= 12 || !e) return;
  S.dives.push({ e, at: G.t + 0.4, kid: !!kid, x: e.x, y: e.y });
}
XC_FIRE.sc = function (w, target, src) {
  const R = id => xcR(w, id), S = xcSc(w), p = G.player, s = w.s;
  S.vol++;
  if (R('melee') || R('orbiting')) return true; // (clingy siblings and the orbit run in the tick)
  if (!target) return false;
  if (R('mines')) { // a sibling nest in the target's path
    const cap = R('mines') >= 3 ? 5 : 3;
    if (S.nests.length >= cap) S.nests.shift();
    S.nests.push({ x: p.x + (target.x - p.x) * 0.6 + rand(-20, 20), y: p.y + (target.y - p.y) * 0.6 + rand(-20, 20), ready: G.t + 0.4, end: G.t + 14 });
    sfx('shot'); return true;
  }
  if (R('dfa')) { // siblings dive from above on their targets
    const ts = acquireMany(w.dir || 'nearest', s.range, p.x, p.y, R('dfa') >= 2 ? 3 : 2);
    for (const e of ts) xcScDive(w, e, false);
    if (ts.length) sfx('shot'); return true;
  }
  if (R('nth')) { // Big sister: every 4th volley brings one big sibling (2.5x, pierces 2)
    w.xcN = (w.xcN || 0) + 1;
    if (w.xcN % (R('nth') >= 2 ? 3 : 4) === 0) spawnProj(w, p.x, p.y, Math.atan2(target.y - p.y, target.x - p.x), src, { dmg: s.dmg * 2.5, r: (s.size || 4) * 2.2, pierce: 2, xcNth: 1, speed: s.speed * 0.85 });
  }
  return false;
};
modProj = (orig => function (pr, w) {
  orig(pr, w);
  if (G && w && pr && xcIs(w, 'sc') && xcAny(w)) xcScProj(pr, w);
})(modProj);
function xcScProj(pr, w) {
  const R = id => xcR(w, id), S = xcSc(w), kid = !!pr.mSplit;
  pr.xcSc = 1; pr.xcVol = kid && XSC.vol != null ? XSC.vol : S.vol;
  if (R('piercing') && !kid) { pr.pierce = (pr.pierce || 0) + XC_RAMP(R('piercing')); pr.xcPc = 1; }
  if (R('ricochet') && (!kid || R('ricochet') >= 4)) pr.bounce = (pr.bounce || 0) + XC_RAMP(R('ricochet'));
  if (R('extra') >= 3 && !kid) { // front and back; the mastery is a brood in every direction
    if (S.exF !== (G.frameN || 0) || S.exI == null) { S.exF = G.frameN || 0; S.exI = 0; }
    const i = S.exI++, sp = pr.speed;
    if (R('extra') >= 4) { const a = i / Math.max(1, w.s.count) * TAU + rand(-0.1, 0.1); pr.vx = Math.cos(a) * sp; pr.vy = Math.sin(a) * sp; }
    else if (i % 2) { pr.vx = -pr.vx; pr.vy = -pr.vy; }
  }
  if (kid && R('range') >= 4) { pr.xcFar = 1; pr.life = pr.max = Math.max(pr.life, 2.5); } // (split siblings reach the whole screen)
  if (kid && XSC.rx) pr.xcRxB = XSC.rx;
}
modHit = (orig => function (pr, e) {
  const w = pr && pr.w;
  if (!G || !w || !pr.xcSc || !xcIs(w, 'sc') || !G.weapons.includes(w)) return orig(pr, e);
  const R = id => xcR(w, id), S = xcSc(w), kid = !!pr.mSplit, dead = e.dead, n0 = G.proj.length;
  if (R('piercing') >= 4 && pr.xcPc) pr.mSplitDone = 0; // every kill made while piercing splits
  XSC.vol = pr.xcVol; XSC.rx = dead && R('catalyst') >= 4 && e.xcRxT > G.t - 1 && e.cd ? Object.assign({}, e.cd.bars) : null;
  try { orig(pr, e); } finally { XSC.vol = null; }
  if (dead) {
    if (R('charged') >= 4 && !kid && pr.mSplitDone) xcScKids(w, pr, e, 1); // a charged sibling splits into 3
    if (pr.xcNest && pr.xcNest.wait) { pr.xcNest.wait = false; pr.xcNest.ready = G.t + 0.5; } // the nest releases again
    if (R('explode') && (!kid || R('explode') >= 4)) aoe(e.x, e.y, 40 * xcLv([1, 1.5, 2, 2], R('explode')), pr.dmg * xcLv([0.4, 0.8, 1.2, 1.2], R('explode')), Object.assign({}, pr.src, { noProc: true }), w.def.color);
    if (R('pull') >= 4) { forNear(e.x, e.y, 140, o => { if (!o.charmed) mwPull(o, e.x, e.y, 40); }); ring(e.x, e.y, 140, w.def.color, 0.3, 2); } // the kill site draws them in
  } else {
    const other = () => { let b = null, bd = 300; for (const q of G.proj) { if (q.w !== w || q === pr || q.dead || !q.tgt || q.tgt === e || q.tgt.dead) continue; const d = Math.hypot(q.tgt.x - e.x, q.tgt.y - e.y); if (d < bd) { bd = d; b = q.tgt; } } return b; };
    if (R('knock') && !e.boss) { const t = other() || msNear(e.x, e.y, 220, [e]); if (t) { xcToward(e, t.x, t.y, xcLv([60, 110, 160, 160], R('knock'))); e.xcCan = { w, t: G.t + 0.5, f: 60, k: 0.3 }; } }
    if (R('pull')) { const t = other(); if (t && !t.boss) { mwPull(t, e.x, e.y, 30 * Math.min(3, R('pull'))); bolt(t.x, t.y, e.x, e.y, w.def.color, 0.1); } }
  }
  if (R('focus') >= 4 && !pr.xcFS && e.xcDog > G.t && e.xcDogW === w) { pr.xcFS = 1; xcScKids(w, pr, e, 2); } // every sibling that joins a dogpile splits
  if (R('nth') >= 4 && pr.xcNth && !pr.xcNS) { pr.xcNS = 1; xcScKids(w, pr, e, 2); } // its siblings split on any hit
  // what the hit did to e
  if (R('sticky') && !e.dead && !(pr.pierce > 0) && !(pr.bounce > 0) && !pr.back) { // Hangers-on: a sibling that stops in an enemy stays stuck to it
    const L = (e.xcHang || []).filter(h => h.end > G.t);
    if (L.length < 3) { L.push({ end: G.t + xcLv([1, 1.5, 2, 2], R('sticky')), a: Math.random() * TAU }); if (L.length === 3 && R('sticky') >= 3) { msSnare(e, 1); ring(e.x, e.y, e.r + 10, w.def.color, 0.3, 3); } }
    e.xcHang = L; e.xcHangW = w; if (!S.hang.includes(e) && S.hang.length < 24) S.hang.push(e);
  }
  if (R('primer') && (!kid || R('primer') >= 4) && !e.dead && !(e.mwPr && e.mwPr.t > G.t)) e.mwPr = { w, t: G.t + 4, by: new Set(), steps: 0 };
  if (R('connecting') && !e.dead) { // Family feud: one volley's targets are linked
    e.xcFeud = { w, vol: pr.xcVol, t: G.t + 4 };
    let F = S.feud.find(f => f.vol === pr.xcVol); if (!F) { F = { vol: pr.xcVol, list: [] }; S.feud.push(F); if (S.feud.length > 4) S.feud.shift(); }
    if (!F.list.includes(e) && F.list.length < 6) F.list.push(e);
  }
  if (pr.xcNth && R('nth') >= 3) { x5Bleed(e, pr.dmg, w); x5Bleed(e, pr.dmg, w); }
  e.xcScHit = { w, t: G.t }; // (Gossip and Cousins read it)
  if (pr.xcRxB && !e.dead) { const c = fightCd(e); for (const k in pr.xcRxB) if (k in c.bars) c.bars[k] = Math.max(c.bars[k], Math.min(0.99, pr.xcRxB[k] * 0.8)); fightReactAs(e, FIGHT_TYPE[mwType(w)], Object.assign({}, pr.src, { raw: pr.dmg })); pr.xcRxB = null; } // carries the parent's reaction
  if (!e.dead) { // the ramps (read by wupDmgMul)
    if (R('focus') && !(e.xcDog > G.t)) { // Dogpile: 3 siblings on one enemy inside 1 s pin it, and it takes more from them for 1 s
      const L = e.xcDogL || (e.xcDogL = []); L.push(G.t); while (L.length && G.t - L[0] > 1) L.shift(); if (L.length > 6) L.shift();
      if (L.length >= 3) { L.length = 0; e.xcDog = G.t + 1; e.xcDogW = w; msSnare(e, 0.5); ring(e.x, e.y, e.r + 14, w.def.color, 0.35, 4); }
    }
    if (R('upclose') && !e.boss && Math.hypot(e.x - G.player.x, e.y - G.player.y) < 120) { shove(e, G.player.x, G.player.y, xcLv([40, 70, 100, 100], R('upclose'))); spawnPart(e.x, e.y, w.def.color, 2, 60, 0.2, 2); } // Huddle: close hits push it away from you
    const Q = e.xcScQ || (e.xcScQ = []); Q.push(G.t); while (Q.length && G.t - Q[0] > 0.4) Q.shift(); if (Q.length > 8) Q.shift();
  }
  if (R('upclose') >= 4 && !pr.xcRet && !pr.back) { pr.xcRet = 1; pr.back = true; pr.hits = [e.id]; pr.pierce = Math.max(pr.pierce || 0, 3); } // back to you, striking on the way
  if (pr.xcPc && pr.pierce > 0) { pr.dmg *= 0.85; pr.tgt = acquireMany('nearest', 300, e.x, e.y, 4).find(o => o !== e && !(pr.hits && pr.hits.includes(o.id))) || null; }
  if (pr.bounce > 0) { pr.dmg *= 0.8; pr.tgt = acquireMany('nearest', 260, e.x, e.y, 4).find(o => o !== e && !(pr.hits && pr.hits.includes(o.id))) || null; }
  // new split siblings: where they go
  const kids = []; for (let i = n0; i < G.proj.length; i++) { const q = G.proj[i]; if (q.w === w && q.mSplit && !q.dead) kids.push(q); }
  if (kids.length) {
    if (R('area')) aoe(e.x, e.y, 50, pr.dmg * 0.4, Object.assign({}, pr.src, { noProc: true }), w.def.color); // Family reunion (Area scales the pulse)
    if (R('dfa') >= 4) for (const q of kids) { q.dead = true; xcScDive(w, msNear(e.x, e.y, 300, [e]), true); }
    else if (R('orbiting') >= 3) for (const q of kids) { if (S.orb.filter(o => o.kid).length >= 4) break; q.dead = true; S.orb.push({ kid: 1, end: G.t + 6, ready: G.t + 0.3 }); }
    else if (R('melee') >= 4) for (const q of kids) { if (S.cl.length >= 12) break; q.dead = true; S.cl.push({ kid: 1, end: G.t + 6, ready: G.t + 0.2 }); }
  }
})(modHit);
wupDmgMul = (orig => function (e, src) {
  let k = orig(e, src);
  const w = src && src.w;
  if (!G || !w || src.dot || src.echo || !xcIs(w, 'sc') || !xcAny(w)) return k;
  if (xcR(w, 'focus') && e.xcDog > G.t && e.xcDogW === w) k *= 1 + xcLv([0.4, 0.8, 1.2, 1.2], xcR(w, 'focus')); // a dogpiled enemy
  if (xcR(w, 'catalyst') && e.xcGosT > G.t && e.xcGosW === w) k *= 1 + xcLv([0.25, 0.4, 0.55, 0.55], xcR(w, 'catalyst')); // the gossip
  if (xcR(w, 'rapid') >= 4 && e.xcScQ) k *= 1 + 0.1 * Math.min(5, e.xcScQ.filter(t => G.t - t < 0.4).length); // in quick succession
  return k;
})(wupDmgMul);
// One sibling's strike that is not a flying shot (a peck, a dive, an adopted sibling's bite): a kill still splits.
function xcScStrike(w, e, k, extra, kid) {
  damageEnemy(e, w.s.dmg * k, Object.assign(weaponSrc(w), extra || {}));
  if (!e.dead || kid) return;
  if (xcR(w, 'dfa') >= 4 && extra && extra.xcDive) { for (let i = 0; i < 2; i++) xcScDive(w, acquireMany('nearest', 300, e.x, e.y, 3).filter(o => o !== e)[i], true); return; }
  if (xcR(w, 'melee') >= 4 && extra && extra.xcPeck) { const S = xcSc(w); for (let i = 0; i < 2 && S.cl.length < 12; i++) S.cl.push({ kid: 1, end: G.t + 6, ready: G.t + 0.2 }); return; }
  xcScKids(w, { src: weaponSrc(w), dmg: w.s.dmg }, e, 2);
}
XC_LIFE.sc = w => (xcR(w, 'turncoat') >= 2 ? 7 : 5);
XC_RUN.sc = function (z, dt) { // Adopted: fights for you; your siblings home on what it attacks
  const w = z.xcRun.w, r = xcR(w, 'turncoat'), S = xcSc(w);
  const o = xcFoe(z.x, z.y, 420, [z]);
  if (o) {
    const d = Math.hypot(o.x - z.x, o.y - z.y) || 1; z.x += (o.x - z.x) / d * 150 * dt; z.y += (o.y - z.y) / d * 150 * dt;
    S.adopt = { e: o, t: G.t + 0.5 };
    if (d < z.r + o.r + 6 && !(z.xcBiteT > G.t)) { z.xcBiteT = G.t + 0.5; damageEnemy(o, w.s.dmg * 1.5, Object.assign(weaponSrc(w), { xcAdopt: 1, atk: 'contact' })); if (r >= 3) x5Bleed(o, w.s.dmg * 1.5, w); }
  }
  if (z.xcRun.end <= G.t) z.dead = true;
};
XC_TICK.sc = function (w, dt) {
  const R = id => xcR(w, id), S = xcSc(w), p = G.player, s = w.s;
  const t10 = !(w.xcT10 > G.t); if (t10) w.xcT10 = G.t + 0.1;
  if (t10 && (R('range') || (S.adopt && S.adopt.t > G.t))) for (const pr of G.proj) { // wider search; the adopted sibling's target
    if (pr.w !== w || pr.dead || !pr.xcSc || pr.back || pr.orbitT > 0) continue;
    if (S.adopt && S.adopt.t > G.t && toyCan(S.adopt.e) && !pr.mSplit) pr.tgt = S.adopt.e;
    else if (R('range') && (!pr.tgt || pr.tgt.dead)) pr.tgt = acquire('nearest', pr.xcFar ? 900 : 380 * (1 + 0.25 * Math.min(3, R('range'))), pr.x, pr.y);
  }
  if (R('range')) for (const pr of G.proj) { // Late arrivals: a sibling with nobody to chase circles where it is and waits
    if (pr.w !== w || pr.dead || !pr.xcSc || pr.back || pr.orbitT > 0 || (pr.tgt && !pr.tgt.dead)) continue;
    const wait = xcLv([1, 1.5, 2, 2], R('range')); pr.xcWait = (pr.xcWait || 0) + dt;
    if (pr.xcWait > wait) continue;
    const a = Math.atan2(pr.vy, pr.vx) + 5 * dt, sp = Math.hypot(pr.vx, pr.vy) || pr.speed; pr.vx = Math.cos(a) * sp; pr.vy = Math.sin(a) * sp; pr.life = Math.max(pr.life, dt * 2);
  }
  if (R('rapid') && t10) { // Squabbling: siblings of one volley that bump into each other push apart and pick different targets
    const L = []; for (const q of G.proj) if (q.w === w && !q.dead && q.xcSc && !q.back && !(q.orbitT > 0) && L.length < 16) L.push(q);
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const a = L[i], b = L[j]; if (a.xcVol !== b.xcVol || a.xcSq > G.t || b.xcSq > G.t || Math.hypot(a.x - b.x, a.y - b.y) > 14) continue;
      a.xcSq = b.xcSq = G.t + 0.6;
      const ang = Math.atan2(b.y - a.y, b.x - a.x) || Math.random() * TAU, sp = b.speed;
      b.vx = Math.cos(ang) * sp; b.vy = Math.sin(ang) * sp;
      const t = acquireMany('nearest', 380, b.x, b.y, 4).find(o => o !== a.tgt); if (t) b.tgt = t;
      spawnPart((a.x + b.x) / 2, (a.y + b.y) / 2, w.def.color, 2, 50, 0.2, 2); S.sq = (S.sq || 0) + 1;
    }
  }
  if (S.hang.length) { // hangers-on slow what they cling to (15% each)
    S.hang = S.hang.filter(e => !e.dead && e.xcHang && (e.xcHang = e.xcHang.filter(h => h.end > G.t)).length);
    for (const e of S.hang) msSlow(e, 0.15 * e.xcHang.length, 0.2);
  }
  if (R('orbiting')) { // siblings circle you, then dive at whatever comes close
    const base = R('orbiting') >= 2 ? 3 : 2;
    while (S.orb.filter(o => !o.kid).length < base) S.orb.push({ ready: G.t + 0.3 });
    S.orb = S.orb.filter(o => !o.kid || (o.end > G.t && !o.gone));
    S.oa = (S.oa || 0) + 3 * dt;
    S.orb.forEach((o, i) => {
      const a = S.oa + i / S.orb.length * TAU; o.x = p.x + Math.cos(a) * 60; o.y = p.y + Math.sin(a) * 60;
      if (R('orbiting') >= 4) for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - o.x, b.y - o.y) < 10 + (b.r || 3)) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 2, 40, 0.2); } // the orbit blocks shots
      if (o.ready > G.t) return;
      const e = xcFoe(p.x, p.y, 120); if (!e) return;
      spawnProj(w, o.x, o.y, Math.atan2(e.y - o.y, e.x - o.x), weaponSrc(w), { tgt: e });
      if (o.kid) o.gone = 1; else o.ready = G.t + Math.max(0.8, s.cd * 3);
    });
  } else S.orb = [];
  if (R('melee')) { // clingy siblings: stay within 80 and peck what comes close
    const base = R('melee') >= 2 ? 3 : 2;
    while (S.cl.filter(c => !c.kid).length < base) S.cl.push({ ready: G.t + 0.2 });
    S.cl = S.cl.filter(c => !c.kid || c.end > G.t);
    S.ca = (S.ca || 0) + 4 * dt;
    S.cl.forEach((c, i) => {
      const a = S.ca + i / S.cl.length * TAU, rr = 36 + (i % 3) * 8; c.x = p.x + Math.cos(a) * rr; c.y = p.y + Math.sin(a) * rr;
      if (c.ready > G.t) return;
      const e = xcFoe(p.x, p.y, 80); if (!e) return;
      c.ready = G.t + Math.max(0.3, s.cd * 1.2); bolt(c.x, c.y, e.x, e.y, w.def.color, 0.08);
      if (R('melee') >= 3) x5Bleed(e, s.dmg * 1.2, w);
      xcScStrike(w, e, 1.2, { atk: 'contact', xcPeck: 1 }, false);
    });
  } else S.cl = [];
  for (const n of S.nests) { // nests release siblings at enemies that come near
    if (n.ready > G.t || n.end < G.t) continue;
    const e = xcFoe(n.x, n.y, 70); if (!e) continue;
    const k = R('mines') >= 2 ? 3 : 2, ts = acquireMany('nearest', 200, n.x, n.y, k);
    for (let i = 0; i < k; i++) { const t = ts[i % ts.length] || e; spawnProj(w, n.x, n.y, Math.atan2(t.y - n.y, t.x - n.x), weaponSrc(w), { tgt: t, xcNest: n }); }
    ring(n.x, n.y, 24, w.def.color, 0.3, 3);
    if (R('mines') >= 4) { n.wait = true; n.ready = G.t + 99; } else n.end = 0;
  }
  S.nests = S.nests.filter(n => n.end > G.t);
  for (const d of S.dives) { // dives: the reticle tracks its target, then the sibling lands from above
    if (d.e && !d.e.dead) { d.x = d.e.x; d.y = d.e.y; }
    if (d.at > G.t) continue;
    d.at = 0;
    if (!d.e || d.e.dead) continue;
    bolt(d.x, d.y - 150, d.x, d.y, w.def.color, 0.15);
    if (R('dfa') >= 3) x5Bleed(d.e, s.dmg * 1.3, w);
    xcScStrike(w, d.e, d.kid ? 0.6 : 1.3, { atk: 'burst', xcDive: 1 }, d.kid);
  }
  S.dives = S.dives.filter(d => d.at > 0);
};
// Kills: Family feud bursts, the corpse that is flung, adopted siblings that split.
wupKill = (orig => function (e, src) {
  orig(e, src);
  if (!G) return;
  const F = e.xcFeud;
  if (F && F.t > G.t && G.weapons.includes(F.w) && xcR(F.w, 'connecting')) { // one dies: its feud partners Bleed
    e.xcFeud = null;
    const w = F.w, r = xcR(w, 'connecting'), mates = G.enemies.filter(o => o !== e && !o.dead && o.xcFeud && o.xcFeud.w === w && o.xcFeud.vol === F.vol && o.xcFeud.t > G.t).slice(0, 6);
    let n = 0;
    for (const o of mates) {
      bolt(e.x, e.y, o.x, o.y, '#c9184a', 0.15);
      for (let i = 0; i < (r >= 2 ? 2 : 1); i++) x5Bleed(o, w.s.dmg * 2, w);
      if (r >= 3) forNear(o.x, o.y, 60, q => { if (q !== o && toyCan(q) && n < 12) { n++; x5Bleed(q, w.s.dmg * 2, w); } });
    }
    if (r >= 4 && !(src && src.w === w && !src.dot)) xcScKids(w, { src: weaponSrc(w), dmg: w.s.dmg }, e, 2); // a feud death counts as a kill
  }
  const hw = e.xcHangW; // Hangers-on mastery: when it dies, each sibling stuck to it hops off as a fresh sibling
  if (hw && e.xcHang && G.weapons.includes(hw) && xcR(hw, 'sticky') >= 4) { const n = e.xcHang.filter(h => h.end > G.t).length; if (n) xcScKids(hw, { src: weaponSrc(hw), dmg: hw.s.dmg * 2 }, e, n); }
  e.xcHang = null;
  const w = src && src.w;
  if (!w || !xcIs(w, 'sc') || !xcAny(w)) return;
  if (xcR(w, 'knock') >= 4) { const o = msNear(e.x, e.y, 150, [e]); if (o && !o.charmed) { bolt(e.x, e.y, o.x, o.y, w.def.color, 0.15); damageEnemy(o, w.s.dmg * 0.8, msEcho(weaponSrc(w))); shove(o, e.x, e.y, 120); } } // flung into the nearest
  if (src.xcAdopt && xcR(w, 'turncoat') >= 4 && !e.elite && !e.boss && !e.rival && !e.egg) xcRise(w, e); // adopted siblings split too (cap 6)
})(wupKill);
mwDetonate = (orig => function (e, pw, M) {
  orig(e, pw, M);
  if (!G || !pw || !G.weapons.includes(pw)) return;
  if (xcIs(pw, 'sc') && xcR(pw, 'primer')) { // Family emergency: a detonation hatches siblings; from rank 3 a detonation kill splits as well
    const n = (xcR(pw, 'primer') >= 2 ? 2 : 1) + (xcR(pw, 'primer') >= 3 && e.dead ? 2 : 0);
    if (xcScKids(pw, { src: weaponSrc(pw), dmg: pw.s.dmg }, e, n)) ring(e.x, e.y, e.r + 16, pw.def.color, 0.3, 3);
  }
  if (xcIs(pw, 'od') && xcR(pw, 'primer') && e.due && e.due.w === pw && !e.dead) { // Collections: a detonation knocks time off the clock
    const D = e.due;
    if (xcR(pw, 'primer') >= 4) { D.xcPct = (D.xcPct || 0) + 0.25; D.end = G.t; floatText(e.x, e.y - e.r - 30, 'COLLECTED', pw.def.color, 13, 0.8); } // pays out at once, +25%
    else { D.end = Math.max(G.t, D.end - xcLv([1, 1.5, 2], xcR(pw, 'primer'))); ring(e.x, e.y, e.r + 18, pw.def.color, 0.3, 3); }
  }
})(mwDetonate);
rxFired = (orig => function (id, e) {
  orig(id, e);
  if (!e || !G) return;
  e.xcRxT = G.t;
  const D = e.due, w = D && D.w;
  if (w && D.xcSeen && xcIs(w, 'od') && xcR(w, 'catalyst') && !e.dead && (D.xcCat || 0) < 3 && !(D.xcCatT > G.t)) { // Compound interest: a reaction moves the clock on and adds 5%
    D.xcCat = (D.xcCat || 0) + 1; D.xcCatT = G.t + 0.4; D.xcPct = (D.xcPct || 0) + 0.05;
    if (xcR(w, 'catalyst') >= 4 && !D.xcCatPaid) { D.xcCatPaid = 1; D.end = G.t; after(0.05, () => { if (G && !e.dead && !e.due) xcOdMark(w, e, 'fire', { free: true }); }); } // pays at once and opens a new bill
    else D.end = Math.max(G.t, D.end - xcLv([0.5, 1, 1.5], xcR(w, 'catalyst')));
    floatText(e.x, e.y - e.r - 30, '+INTEREST', w.def.color, 12, 0.6);
  }
  const H = e.xcScHit, sw = H && H.w;
  if (sw && G.t - H.t < 0.5 && xcIs(sw, 'sc') && xcR(sw, 'catalyst') && G.weapons.includes(sw) && !e.dead) { // Gossip: every sibling near turns to watch, and joins in harder
    e.xcGosT = G.t + 1; e.xcGosW = sw; let n = 0;
    for (const q of G.proj) if (q.w === sw && !q.dead && !q.back && !(q.orbitT > 0) && n < 8 && Math.hypot(q.x - e.x, q.y - e.y) < 220) { q.tgt = e; n++; }
    if (n) ring(e.x, e.y, e.r + 18, sw.def.color, 0.3, 2);
  }
})(rxFired);
// Kinship. One of These Days: Family debt (hits by your other weapons of its type are remembered). Sister Cousin: Cousins
// (another weapon of its type hitting an enemy a sibling hit in the last second hatches a cousin there).
wupHit = (orig => function (e, res, src) {
  orig(e, res, src);
  const x = src && src.w;
  if (!G || !x || x.isSpell || !x.def || src.dot || src.echo || e.dead) return;
  if (!xcIs(x, 'od')) { e.xcKinT = G.t; e.xcKinTy = mwType(x); }
  const H = e.xcScHit, w = H && H.w;
  if (w && w !== x && G.t - H.t < 1 && xcIs(w, 'sc') && xcR(w, 'kinship') && mwType(w) === mwType(x) && !(w.xcCousT > G.t) && G.weapons.includes(w)) {
    w.xcCousT = G.t + xcLv([1, 0.7, 0.5, 0.5], xcR(w, 'kinship'));
    if (xcScKids(w, { src: weaponSrc(w), dmg: w.s.dmg }, e, 1, xcR(w, 'kinship') >= 4 ? { mSplit: 0, mS: 1, xcCousin: 1 } : { xcCousin: 1 })) ring(e.x, e.y, e.r + 12, w.def.color, 0.3, 3); // (mastery: a cousin splits like a real sibling)
  }
})(wupHit);
// Sister Cousin's split is its own ('multiplying'): it never takes the Flight slot from Piercing, Ricochet or Exploding Rounds.
modOk = (orig => function (w, id) {
  if (!(w && id !== 'multiplying' && xcIs(w, 'sc') && w.m10 && w.m10.includes('multiplying'))) return orig(w, id);
  const k = w.m10; w.m10 = k.filter(x => x !== 'multiplying');
  try { return orig(w, id); } finally { w.m10 = k; }
})(modOk);

// ---------------------------------------------------------------- drawing (world space)
modDraw = (orig => function () {
  orig();
  if (!G || !G.weapons) return;
  const p = G.player;
  ctx.save(); ctx.lineWidth = Math.max(1, 1.5 * S);
  for (const w of G.weapons) {
    if (!w || !xcAny(w)) continue;
    const c = col(w.def.color);
    ctx.strokeStyle = c; ctx.fillStyle = c;
    if (xcIs(w, 'od')) {
      const O = w.xcOd;
      if (O && O.nd) for (const nd of O.nd) { if (nd.x == null) continue; ctx.globalAlpha = nd.ready > G.t ? 0.3 : 0.9; const dx = Math.cos(nd.a + Math.PI / 2) * 7, dy = Math.sin(nd.a + Math.PI / 2) * 7; ctx.beginPath(); ctx.moveTo(sx(nd.x - dx), sy(nd.y - dy)); ctx.lineTo(sx(nd.x + dx), sy(nd.y + dy)); ctx.stroke(); } // the orbiting needle
      if (O) for (const m of O.mines) { const on = !m.used && m.arm <= G.t; ctx.globalAlpha = on ? 0.85 : 0.3; ctx.strokeRect(sx(m.x) - 5 * S, sy(m.y) - 5 * S, 10 * S, 10 * S); ctx.fillRect(sx(m.x) - 5 * S, sy(m.y) - 5 * S, 10 * S, 3 * S); } // countdown mines (little calendars)
      if (xcR(w, 'melee')) { ctx.globalAlpha = 0.18; ctx.setLineDash([3 * S, 5 * S]); ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), ((p.r || 12) + 30) * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]); } // Tick tock's reach
      for (const e of TOYS().marks) {
        const D = e.due; if (!D || D.w !== w || e.dead || !D.xcSeen) continue;
        if (D.xcLinks) { ctx.globalAlpha = 0.55; ctx.setLineDash([4 * S, 4 * S]); for (const o of D.xcLinks) if (!o.dead) { ctx.beginPath(); ctx.moveTo(sx(e.x), sy(e.y)); ctx.lineTo(sx(o.x), sy(o.y)); ctx.stroke(); } ctx.setLineDash([]); } // joint account
        if (D.xcPullR && D.end - G.t < 1.2) { ctx.globalAlpha = 0.2; ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y), D.xcPullR * S, 0, TAU); ctx.stroke(); }
        if (D.xcNth) { ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y), (e.r + 9) * S, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y), (e.r + 13) * S, 0, TAU); ctx.stroke(); } // a big bill
        if (D.xcExp > G.t) { ctx.globalAlpha = 0.35; ctx.setLineDash([2 * S, 3 * S]); ctx.beginPath(); ctx.moveTo(sx(p.x), sy(p.y)); ctx.lineTo(sx(e.x), sy(e.y)); ctx.stroke(); ctx.setLineDash([]); } // express delivery
        if (D.xcCopyOf) { ctx.globalAlpha = 0.5; ctx.strokeStyle = '#f8f9fa'; ctx.strokeRect(sx(e.x) - 4 * S, sy(e.y - e.r) - 16 * S, 8 * S, 8 * S); ctx.strokeStyle = c; } // a carbon copy
        if (D.xcFee > 0.01) { ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y), (e.r + 6) * S, -Math.PI / 2, -Math.PI / 2 + TAU * D.xcFee / 0.24); ctx.stroke(); } // the late fee growing
      }
    } else if (xcIs(w, 'sc')) {
      const X = w.xcSc;
      if (X) {
        for (const o of X.orb) if (o.x != null && !o.gone) { ctx.globalAlpha = o.ready > G.t ? 0.35 : 0.9; ctx.beginPath(); ctx.arc(sx(o.x), sy(o.y), 3.5 * S, 0, TAU); ctx.fill(); }
        for (const q of X.cl) if (q.x != null) { ctx.globalAlpha = q.ready > G.t ? 0.4 : 0.9; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 3 * S, 0, TAU); ctx.fill(); }
        for (const n of X.nests) { ctx.globalAlpha = n.ready > G.t ? 0.3 : 0.75; ctx.beginPath(); ctx.arc(sx(n.x), sy(n.y), 9 * S, 0, TAU); ctx.stroke(); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(sx(n.x + Math.cos(i * 2.1) * 4), sy(n.y + Math.sin(i * 2.1) * 4), 1.8 * S, 0, TAU); ctx.fill(); } } // nests with siblings in
        for (const d of X.dives) { const k = clamp((d.at - G.t) / 0.4, 0, 1); ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(sx(d.x), sy(d.y), (8 + 14 * k) * S, 0, TAU); ctx.stroke(); } // dive reticles closing
        for (const e of X.hang) if (!e.dead && e.xcHang) e.xcHang.forEach(h => { ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(sx(e.x + Math.cos(h.a) * e.r), sy(e.y + Math.sin(h.a) * e.r), 2.5 * S, 0, TAU); ctx.fill(); }); // hangers-on
        for (const e of G.enemies) if (e.xcDog > G.t && e.xcDogW === w && !e.dead) for (let i = 0; i < 5; i++) { const a = G.realT * 4 + i / 5 * TAU; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(sx(e.x + Math.cos(a) * (e.r + 6)), sy(e.y + Math.sin(a) * (e.r + 6)), 2 * S, 0, TAU); ctx.fill(); } // a dogpile
        if (xcR(w, 'connecting')) { ctx.globalAlpha = 0.4; ctx.setLineDash([3 * S, 4 * S]); for (const F of X.feud) { const L = F.list.filter(o => !o.dead && o.xcFeud && o.xcFeud.vol === F.vol && o.xcFeud.t > G.t); for (let i = 1; i < L.length; i++) { ctx.beginPath(); ctx.moveTo(sx(L[i - 1].x), sy(L[i - 1].y)); ctx.lineTo(sx(L[i].x), sy(L[i].y)); ctx.stroke(); } } ctx.setLineDash([]); } // family feuds
      }
      const wind = w.s && w.s.xcWind; // Charged: the wind-up fills round you
      if (wind && xcR(w, 'charged') && w.cd > 0 && w.cd < wind) { ctx.globalAlpha = 0.8; ctx.lineWidth = 3 * S; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), ((p.r || 12) + 10) * S, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - w.cd / wind)); ctx.stroke(); ctx.lineWidth = Math.max(1, 1.5 * S); }
    }
  }
  ctx.restore();
})(modDraw);
