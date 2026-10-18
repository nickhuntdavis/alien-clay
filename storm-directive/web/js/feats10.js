'use strict';
// Spawn Prawn - v10 Feats: gifts from the consciousness (spec: ../redesign docs/FEATS.md; UPGRADES.md 4 to 6;
// COMBAT_MATRIX.md 10 (30), 11.7, 12, 13; MODIFIERS.md; VOICE_GUIDE.md).
//  - Three Feat slots under V10 (F10_SLOTS). A Feat is a SPELLS entry (key 'f10_<id>', kind 'f10') in G.spells, so the old
//    slot UI, Tackle Box, stamina bar and cooldown ring keep working. Levels run 1 to 5: damage and cooldown follow
//    computeStats; f10Stats adds the Develop steps (level 2: wider reach and 20% more of whatever it does; level 4: 15%
//    shorter cooldown) and each Feat's own `stat` reads its fork flags (levels 3 and 5).
//  - A Feat has one damage type and one attack type (or is a utility gift: neither, no stamina). Hits go through
//    damageEnemy with an `atk` field, so fight.js resolves defences, statuses and reactions. Attacking Feats pay
//    stamina (f10Cost); utility gifts are free. Trigger gifts perform themselves (`trig`) and cannot be tapped.
//  - Cards: an acquire card and an enhance card per Feat go to draft.js (draftRegister); forks at levels 3 and 5 go to
//    forkRegister under both card ids ('feat:feat_<id>' and 'feat:feat_<id>_up').
//  - Unique Feats (d.sample, bottom of the file): each sample's slot 1 Feat (s10UniqueFeat, called by samples10.js s10Start). They
//    are not in F10_ORDER and their acquire card is never eligible; only the owner can rank them up.
//  - Fork flags live on the Feat slot: w.f10fk[flag]. A fork never changes the damage type.
// Hooks: game.js newGame (F10_SLOTS spells), fireWeapon (case 'f10'), updateSpellList (f10Wait), featFire (cooldown),
// featTap (f10Wait), computeStats (f10Stats), hurtPlayer (f10Hurt, f10HurtMul), killEnemy (f10Kill), gainXp (f10Xp);
// stamina.js featCost (f10Cost), sprintMul (f10Speed); v10.js v10Tick (f10Tick), v10Draw (f10Draw); ui.js Feat slot count.

const F10_SLOTS = V10 ? 3 : 2;
const F10 = {};
const F10_ORDER = [];
const F10_UNIQUE = {}; // sample id -> its Unique Feat id (SAMPLES.md); not in F10_ORDER, never drafted for anyone else
const F10_INT = { force: 'phys', acid: 'fire', static: 'shock', mucus: 'ice', blood: 'arcane', soul: 'soul', fire: 'flame' };
const F10_COL = { force: TYPE_PAL.phys, acid: TYPE_PAL.fire, static: TYPE_PAL.shock, mucus: TYPE_PAL.ice, blood: TYPE_PAL.arcane, soul: TYPE_PAL.soul, fire: TYPE_PAL.flame, utility: '#cfe7ff' };

const f10 = () => G.f10 || (G.f10 = { fx: [], hits: [], kills: [], hurtBy: [], xpT: [], lq: 0, tides: [], pulls: [] });
// Later unlocks (FEATS.md 5) join the pool once META.f10unl lists them (the unlock system is future work); F10_ALL opens the lot (tests).
const f10Unlocked = d => !!(d.start || (typeof window !== 'undefined' && window.F10_ALL) || (typeof META !== 'undefined' && META.f10unl && META.f10unl.includes(d.id)));
const f10Own = id => (G && G.spells.find(w => w && w.id === 'f10_' + id)) || null;
const f10Fk = (w, k) => !!(w && w.f10fk && w.f10fk[k]);
const f10Live = e => e && !e.dead && !e.charmed && !e.egg && !e.phased;
function f10Near(x, y, r) { const o = []; forNear(x, y, r, e => { if (f10Live(e)) o.push(e); }); return o; }
const f10Src = (w, extra) => Object.assign({ elem: w.def.elem, wname: w.def.name, w, noCrit: true, noProc: true, atk: w.def.atk || 'burst' }, extra || {});
function f10Shove(e, fx, fy, f) { if (e.boss || e.rival || e.egg || e.dead) return; shove(e, fx, fy, f * (fightCd(e).def === 'squishy' ? 0.5 : 1)); }
function f10Hit(w, e, dmg, atk, extra) { return damageEnemy(e, dmg, f10Src(w, Object.assign({ atk }, extra))); }
function f10Burst(w, x, y, r, dmg, extra, color) { aoe(x, y, r, dmg, f10Src(w, Object.assign({ atk: 'burst' }, extra)), color || w.def.color); }
function f10Many(w, list, dmg, atk, extra) {
  const burst = atk === 'burst'; if (burst) IN_AOE = true;
  try { for (const e of list) if (!e.dead) f10Hit(w, e, dmg, atk, extra); } finally { if (burst) IN_AOE = false; }
}
function f10Stagger(e, mult) { if (e.dead) return; fst().stagger++; stun(e, (e.boss ? 0.35 / 0.3 : e.elite ? 0.55 : 0.8) * (mult || 1)); ring(e.x, e.y, e.r + 4, '#ffffff', 0.3, 4); }
function f10Patch(w, x, y, r, life, type, dps) {
  if (G.zones.length >= 150) return null;
  const z = { x, y, r, life, max: life, dps: dps || 1, elem: F10_INT[type], pull: 0, color: ELEMENTS[F10_INT[type]].color, tick: 0, src: f10Src(w, { elem: F10_INT[type], atk: 'pool', zoneHit: true }) };
  G.zones.push(z); return z;
}
const f10Mark = (x, y, r, dur, color) => f10().fx.push({ x, y, end: G.t + dur, t0: G.t, dr: k => { ctx.strokeStyle = col(color); ctx.globalAlpha = 0.35 + 0.4 * k; ctx.lineWidth = 2; ctx.setLineDash([6 * S, 5 * S]); ctx.beginPath(); ctx.arc(sx(x), sy(y), r * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 0.12 * k; ctx.fillStyle = col(color); ctx.fill(); } });
function f10Lunge(dx, dy) { const D = f10(), p = me(); if (G.lvl && typeof lvSolidAt === 'function' && lvSolidAt(p.x + dx, p.y + dy)) return false; D.lunge = { dx, dy, left: 0.25 }; return true; }
function f10Gap(len) { // the direction with the fewest enemies at the far end
  const p = me(); let best = 0, bn = 1e9;
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, n = f10Near(p.x + Math.cos(a) * len, p.y + Math.sin(a) * len, 90).length + f10Near(p.x + Math.cos(a) * len / 2, p.y + Math.sin(a) * len / 2, 60).length; if (n < bn) { bn = n; best = a; } }
  return best;
}
const f10OnView = e => Math.abs(e.x - cam.x) < W / 2 / S + e.r && Math.abs(e.y - cam.y) < H / 2 / S + e.r;

// ---------------------------------------------------------------- the registry
function feat(d) {
  d.key = 'f10_' + d.id; d.elem = d.type ? F10_INT[d.type] : 'phys';
  d.color = F10_COL[d.type || 'utility']; d.atk = d.type ? d.atk : null;
  const text = d.line + ' ' + d.does;
  SPELLS[d.key] = { name: d.name, icon: d.icon, elem: d.elem, kind: 'f10', f10: d, atk: d.atk, color: d.color, dir: 'nearest', noTarget: 1, passive: d.trig ? 1 : 0, desc: text,
    base: Object.assign({ dmg: 0, cd: 10, range: 0, area: 0, dur: 0 }, d.base), lv: {} };
  if (typeof ICON_OF !== 'undefined') ICON_OF[d.key] = d.ico || 'cross';
  F10[d.id] = d; if (d.sample) F10_UNIQUE[d.sample] = d.id; else F10_ORDER.push(d.id);
  const own = () => f10Own(d.id), base = { slot: 'feat', family: 'feat:' + (d.type || 'utility'), type: d.type || null, rarity: d.rar || 0, start: !!d.start, title: d.name, icon: d.icon, color: d.color, maxRank: 5 };
  const acq = Object.assign({ id: 'feat_' + d.id, kind: 'acquire', desc: text, eligible: g => !d.sample && !own() && f10Unlocked(d), apply: g => { const i = g.spells.findIndex(x => !x); if (i >= 0) g.spells[i] = makeSlot(d.key, true, 1); }, rank: () => 0 }, base);
  const up = Object.assign({ id: 'feat_' + d.id + '_up', kind: 'enhance', desc: d.name + ' to the next level. More of whatever it does, and a quicker cooldown later.', eligible: g => { const w = own(); return !!w && w.lvl < 5; }, apply: g => { const w = own(); if (w && w.lvl < 5) w.lvl++; }, rank: () => { const w = own(); return w ? w.lvl : 0; } }, base);
  for (const c of [acq, up]) { if (typeof draftRegister === 'function') draftRegister(c); else (window.CARDS10 = window.CARDS10 || []).push(c); }
  for (const lv of [3, 5]) {
    const pair = (d.forks && d.forks[lv]) || []; if (pair.length < 2) continue;
    const opts = pair.map(o => ({ title: o.title, desc: o.desc, apply: g => { const w = own(); if (w) (w.f10fk || (w.f10fk = {}))[o.id] = 1; } }));
    for (const id of ['feat_' + d.id, 'feat_' + d.id + '_up']) { if (typeof forkRegister === 'function') forkRegister('feat:' + id, lv, opts); else (window.FORKS10 = window.FORKS10 || []).push({ key: 'feat:' + id, lv, opts }); }
  }
  return d;
}
// Give the player a Feat (tests, the debug bench, the samples' slot 1).
function f10Give(id, lvl) { const i = G.spells.findIndex(x => !x); if (i < 0) return null; G.spells[i] = makeSlot('f10_' + id, true, lvl || 1); recomputeAll(); return G.spells[i]; }

// ---------------------------------------------------------------- hooks from the engine
function f10Stats(w, s) {
  const d = w.def.f10; if (!d) return;
  s.k = 1 + (w.lvl >= 2 ? 0.2 : 0) + (w.lvl >= 4 ? 0.2 : 0);
  if (w.lvl >= 2 && s.area) s.area *= 1.15;
  if (w.lvl >= 4) s.cd *= 0.85;
  if (d.stat) d.stat(w, s);
}
function f10Cost(w) { const d = w.def.f10; return d && d.stam ? Math.min(Math.round(stamMax() * 0.9), Math.round(d.stam * (G.P.featCost || 1))) : 0; }
function f10Wait(w) { // true: not yet (game.js updateSpellList / featTap)
  const d = w.def.f10; if (!d || d.ev || !d.when) return true;
  const c = d.when(w); if (!c) return true;
  w.f10ctx = c; return false;
}
function f10Fire(w, target, src) {
  const d = w.def.f10; let c = w.f10ctx; w.f10ctx = null;
  if (!c && d.when) c = d.when(w);
  if (!c && !d.ev) return;
  d.fire(w, c || {});
}
// An event asks a gift to go now: pays stamina, performs, starts the cooldown.
function f10Go(w, ctx) {
  if (!w || w.cd > 0 || !G || G.state !== 'play' || w.echo) return false;
  if (!featPay(w)) return false;
  w.f10ctx = ctx || {}; featFire(w, null); return true;
}
const f10Evs = id => { const w = f10Own(id); return w && w.cd <= 0 ? w : null; };
// A hit is about to land for d. True: it is negated. (game.js hurtPlayer, before the old Anhydrobiosis check)
function f10Hurt(d, ent, kind) {
  const D = f10(), p = me(), P = G.P;
  if (D.husk) return true;
  if (D.mem && D.mem.hp > 0 && D.mem.end > G.t) { D.mem.hp -= d; ring(p.x, p.y, p.r + 14, '#5aa9ff', 0.3, 3); if (D.mem.hp <= 0) f10MemEnd(); return true; }
  if (D.bub) { ring(p.x, p.y, p.r + 16, F10_COL.force, 0.3, 3); if (--D.bub.left <= 0) { const b = D.bub; D.bub = null; f10Pop(b.w); } return true; }
  let w = f10Evs('little_bubble');
  if (w && d >= P.maxHp * 0.10 && f10Go(w, {})) return true;
  w = f10Evs('anhydrobiosis');
  if (w && p.hp - d < P.maxHp * 0.2 && f10Go(w, {})) { floatText(p.x, p.y - 30, 'miss', '#cfe7ff', 13, 0.6); return true; }
  w = f10Evs('not_yet');
  if (w && p.hp - d <= 0 && f10Go(w, {})) return true;
  D.hits.push(G.t); D.hits = D.hits.filter(t => G.t - t < 3);
  if (D.sb) D.sb.broken = true;
  const hf = G.hitFrom || ent; if (hf && hf.maxHp && !hf.dead) D.hurtBy.push({ e: hf, d, t: G.t });
  w = f10Evs('kiss_it_better');
  if (w && D.hits.filter(t => G.t - t < 2).length >= 3) f10Go(w, {});
  return false;
}
function f10HurtMul() { const D = G.f10; return D && D.guiltEnd > G.t ? 0.75 : 1; }
function f10Kill(e, src) {
  const D = f10(), p = me();
  D.kills.push({ t: G.t, x: e.x, y: e.y }); D.kills = D.kills.filter(k => G.t - k.t < 1.2);
  let w = f10Own('come_back_here');
  if (w && Math.hypot(e.x - p.x, e.y - p.y) < w.s.range) {
    const sec = Math.floor(G.t), cap = f10Fk(w, 'ravenous') ? 9 : 6; if (D.cbSec !== sec) { D.cbSec = sec; D.cbUsed = 0; }
    const h = Math.min(G.P.maxHp * (e.boss ? 0.10 : e.elite ? 0.03 : 0.005) * (f10Fk(w, 'bigbites') ? 1.5 : 1) * w.s.k, cap - D.cbUsed);
    if (h > 0) {
      D.cbUsed += h; const over = p.hp + h - G.P.maxHp; healPlayer(h, true); bolt(e.x, e.y, p.x, p.y, '#8ac926', 0.2);
      if (over > 0 && f10Fk(w, 'leftovers')) f10Membrane(Math.min(over, G.P.maxHp * 0.10), 4);
    }
  }
  w = f10Own('that_one');
  if (w && w.f10pt && w.f10pt.includes(e)) { w.f10pt = w.f10pt.filter(o => o !== e); if (w.cd <= 0) f10Go(w, { x: e.x, y: e.y }); }
  w = f10Own('not_yet');
  if (w && e.boss && f10Fk(w, 'denial') && !D.denied && D.nyUsed) { D.denied = true; w.cd = 0; floatText(p.x, p.y - 40, 'NOT YET: READY', w.def.color, 13, 1); }
  w = f10Evs('and_another_thing');
  if (w && !D.pulsing) { const ks = D.kills.filter(k => G.t - k.t < 1); if (ks.length >= 3) f10Go(w, { x: ks.reduce((a, k) => a + k.x, 0) / ks.length, y: ks.reduce((a, k) => a + k.y, 0) / ks.length }); }
}
function f10Xp(v) {
  const D = f10(), p = me(); D.xpT.push(G.t); D.xpT = D.xpT.filter(t => G.t - t < 1);
  let w = f10Evs('more');
  if (w && (p.hp < G.P.maxHp * 0.4 || f10Fk(w, 'greedy')) && !D.more) f10Go(w, {});
  if (D.more) {
    D.more = false; const mw = f10Own('more');
    if (f10Fk(mw, 'seconds')) { for (let i = 0; i < 5; i++) { dropGem(p.x + rand(-30, 30), p.y + rand(-30, 30), v * 0.4); G.gems[G.gems.length - 1].mag = true; } return v; }
    return v * (f10Fk(mw, 'fivefold') ? 5 : 3);
  }
  w = f10Evs('mine');
  if (w && D.xpT.length >= 10) f10Go(w, { orbs: D.xpT.length });
  return v;
}
const f10Speed = () => { const D = G.f10; if (!D) return 1; return D.husk ? 0 : (D.boost > G.t ? 1.3 : 1) * (D.pb && D.pb.end > G.t ? 1.8 : 1); };
function f10MemEnd() { const D = f10(), p = me(), m = D.mem; D.mem = null; if (m && m.pop) f10Burst(m.w, p.x, p.y, 100, m.w.s.dmg, null); }
function f10Membrane(hp, dur, w, pop) { const D = f10(); if (D.mem && D.mem.hp > 0) { D.mem.hp = Math.min(D.mem.hp + hp, G.P.maxHp * 0.3); D.mem.end = Math.max(D.mem.end, G.t + dur); } else D.mem = { hp, end: G.t + dur, w, pop }; }
function f10Pop(w) { // Little Bubble bursts
  const p = me(), s = w.s;
  const list = f10Near(p.x, p.y, s.area);
  f10Burst(w, p.x, p.y, s.area, s.dmg, null);
  for (const e of list) f10Shove(e, p.x, p.y, 320);
  if (f10Fk(w, 'poprocks')) for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - p.x, b.y - p.y) < s.area) b.dead = true;
  if (f10Fk(w, 'echo')) after(0.5, () => { if (G && G.state === 'play') { const q = me(); f10Burst(w, q.x, q.y, s.area, s.dmg * 0.6, null); } });
}

// ---------------------------------------------------------------- each frame (v10.js v10Tick)
function f10Tick(dt) {
  if (!G || (!G.f10 && !G.spells.some(Boolean))) return;
  const D = f10(), p = me();
  D.fx = D.fx.filter(f => f.end > G.t);
  if (D.lunge) { const L = D.lunge, mv = Math.min(dt, L.left); p.x += L.dx * (mv / 0.25); p.y += L.dy * (mv / 0.25); L.left -= dt; if (L.left <= 0) D.lunge = null; }
  if (D.husk) {
    p.iframes = Math.max(p.iframes, 0.1);
    const w = D.husk.w;
    if (f10Fk(w, 'vacuum')) for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - p.x, b.y - p.y) < 45) { b.dead = true; const t = acquire('nearest', 500, p.x, p.y); if (t) { bolt(p.x, p.y, t.x, t.y, F10_COL.force, 0.15); f10Hit(w, t, 10, 'proj'); } }
    if (G.t >= D.husk.end) {
      D.husk = null; f10Burst(w, p.x, p.y, w.s.area, w.s.dmg * (f10Fk(w, 'longhusk') ? 1.5 : 1), null);
      for (const e of f10Near(p.x, p.y, w.s.area)) f10Shove(e, p.x, p.y, 420);
      if (f10Fk(w, 'rehydrate')) healPlayer(G.P.maxHp * 0.15);
      if (f10Fk(w, 'specialboy')) D.sb = { until: G.t + 3, broken: false };
    }
  }
  if (D.sb && G.t >= D.sb.until) { if (!D.sb.broken) { D.boost = G.t + 5; floatText(p.x, p.y - 36, 'Special.', F10_COL.force, 13, 1); } D.sb = null; }
  if (D.mem && D.mem.end <= G.t) f10MemEnd();
  if (D.hoard > G.t) for (const g of G.gems) if (!g.dead && Math.hypot(g.x - p.x, g.y - p.y) < 250) g.mag = true;
  // Gravity wells bend shots that pass through (45 degrees at most each).
  const wells = G.zones.filter(z => z.f10well && z.life > 0);
  if (wells.length) for (const list of [G.ebul, G.proj]) for (const b of list) {
    if (b.dead || b.vx == null) continue;
    for (const z of wells) {
      const dx = z.x - b.x, dy = z.y - b.y; if (dx * dx + dy * dy > z.r * z.r) continue;
      const sp = Math.hypot(b.vx, b.vy); if (!sp) break;
      const a = Math.atan2(b.vy, b.vx), da = ((Math.atan2(dy, dx) - a + Math.PI * 3) % TAU) - Math.PI, room = Math.max(0, 0.785 - (b.f10turn || 0));
      const turn = Math.sign(da) * Math.min(Math.abs(da), 4 * dt, room); b.f10turn = (b.f10turn || 0) + Math.abs(turn);
      b.vx = Math.cos(a + turn) * sp; b.vy = Math.sin(a + turn) * sp; break;
    }
  }
  for (const T of D.tides) { // Shed the Lining
    const k = (G.t - T.t0) / T.dur; if (k > 1) { T.done = true; continue; }
    const front = -360 + 1000 * k, ca = Math.cos(T.a), sa = Math.sin(T.a);
    for (const e of G.enemies) {
      if (!f10Live(e) || T.hit.has(e)) continue;
      const dx = e.x - T.x, dy = e.y - T.y, u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
      if (Math.abs(u - front) > T.width / 2 + e.r || Math.abs(v) > 380) continue;
      T.hit.add(e); f10Hit(T.w, e, T.w.s.dmg, 'beam'); f10Shove(e, e.x - ca * 50, e.y - sa * 50, T.push);
    }
  }
  D.tides = D.tides.filter(T => !T.done);
  if (D.slow) { // WAIT WAIT WAIT: shots inside slow to 20%
    if (G.t > D.slow.end) { for (const b of G.ebul) if (b.f10slow) { b.vx /= 0.2; b.vy /= 0.2; b.f10slow = 0; } D.slow = null; }
    else for (const b of G.ebul) if (!b.dead && !b.f10slow && b.vx != null && Math.hypot(b.x - D.slow.x, b.y - D.slow.y) < D.slow.r) { b.f10slow = 1; b.vx *= 0.2; b.vy *= 0.2; }
  }
  for (const pw of D.pulls) if (pw.end > G.t) for (const e of f10Near(pw.x, pw.y, pw.r)) if (!e.boss) { const dx = pw.x - e.x, dy = pw.y - e.y, d = Math.hypot(dx, dy) || 1, f = Math.min(d, 150 * dt); e.x += dx / d * f; e.y += dy / d * f; }
  D.pulls = D.pulls.filter(pw => pw.end > G.t);
  f10UniqueTick(D, p, dt);
  if (!D.stay || Math.hypot(p.x - D.stay.x, p.y - D.stay.y) > 60) { D.stay = { x: p.x, y: p.y }; D.stayT = 0; } else D.stayT += dt; // Nesting
  if (D.nest) { if (D.nest.end < G.t) D.nest = null; else if (D.nest.cosy && Math.hypot(p.x - D.nest.x, p.y - D.nest.y) < D.nest.r) healPlayer(G.P.maxHp * 0.01 * dt, true); }
  if (D.yolk) { // Packed Lunch
    const y = D.yolk;
    if (G.t > y.end) D.yolk = null;
    else if (Math.hypot(p.x - y.x, p.y - y.y) < p.r + 14) { healPlayer(G.P.maxHp * y.heal); floatText(y.x, y.y - 16, 'Yum.', '#ffd23f', 12, 0.7); D.yolk = null; }
    else if (!y.safe) { for (const e of f10Near(y.x, y.y, 14)) if (!e.boss && !e.rival) { D.yolk = null; floatText(y.x, y.y - 16, 'Hey.', '#ffd23f', 12, 0.7); break; } }
  }
  const lq = G.lootQueue.filter(r => r.kind !== 'start').length; // Mine!: a box landing in the queue
  if (lq > D.lq) { const w = f10Evs('mine'); if (w) f10Go(w, { orbs: 0 }); }
  D.lq = lq;
  D.hurtBy = D.hurtBy.filter(h => G.t - h.t < 5 && !h.e.dead); // THAT ONE: whoever hurt you most in 5 s
  const wt = f10Own('that_one');
  if (wt) {
    const sum = new Map(); for (const h of D.hurtBy) sum.set(h.e, (sum.get(h.e) || 0) + h.d);
    wt.f10pt = [...sum.entries()].sort((a, b) => b[1] - a[1]).slice(0, f10Fk(wt, 'grudge') ? 2 : 1).map(x => x[0]);
  }
}

// ---------------------------------------------------------------- drawing (v10.js v10Draw, world space)
function f10Draw() {
  const D = G && G.f10; if (!D) return;
  const p = me(); ctx.save(); ctx.lineCap = 'round';
  for (const f of D.fx) { ctx.save(); f.dr(Math.max(0, (f.end - G.t) / Math.max(0.01, f.end - f.t0))); ctx.restore(); }
  for (const T of D.tides) {
    const k = (G.t - T.t0) / T.dur, front = -360 + 1000 * k, ca = Math.cos(T.a), sa = Math.sin(T.a), cx = T.x + ca * front, cy = T.y + sa * front;
    ctx.strokeStyle = col(F10_COL.blood); ctx.globalAlpha = 0.5 * (1 - k * 0.5); ctx.lineWidth = T.width * S;
    ctx.beginPath(); ctx.moveTo(sx(cx - sa * 380), sy(cy + ca * 380)); ctx.lineTo(sx(cx + sa * 380), sy(cy - ca * 380)); ctx.stroke();
  }
  ctx.lineWidth = 1.5; ctx.strokeStyle = col(F10_COL.force);
  for (const z of G.zones) if (z.f10well && z.life > 0) for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.r * S * (((G.t * 0.8 + i / 3) % 1) * 0.7 + 0.3), 0, TAU); ctx.stroke(); }
  if (D.bub) { ctx.globalAlpha = 0.7; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 18) * S, 0, TAU); ctx.stroke(); }
  if (D.mem && D.mem.hp > 0) { ctx.strokeStyle = col('#5aa9ff'); ctx.globalAlpha = 0.6; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 22) * S, 0, TAU * Math.min(1, D.mem.hp / (G.P.maxHp * 0.15))); ctx.stroke(); }
  for (const M of D.marks || []) if (!M.e.dead) { ctx.strokeStyle = col(F10_COL.acid); ctx.globalAlpha = 0.75; ctx.lineWidth = 2; ctx.setLineDash([5 * S, 4 * S]); ctx.beginPath(); ctx.arc(sx(M.e.x), sy(M.e.y), (M.e.r + 8) * S, G.t * 2, G.t * 2 + TAU); ctx.stroke(); ctx.setLineDash([]); ctx.strokeStyle = col(F10_COL.soul); ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.arc(sx(M.e.x), sy(M.e.y), M.r * S, 0, TAU); ctx.stroke(); }
  if (D.pb && D.pb.end > G.t) { ctx.strokeStyle = col(F10_COL.static); ctx.globalAlpha = 0.7; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 10) * S, 0, TAU); ctx.stroke(); }
  if (D.husk) { ctx.fillStyle = col('#9a8a6a'); ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 6) * S, 0, TAU); ctx.fill(); }
  if (D.yolk) { ctx.fillStyle = col('#ffd23f'); ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(sx(D.yolk.x), sy(D.yolk.y), 8 * S, 0, TAU); ctx.fill(); }
  if (D.nest) { ctx.strokeStyle = col(F10_COL.mucus); ctx.globalAlpha = 0.4; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(D.nest.x), sy(D.nest.y), D.nest.r * S, 0, TAU); ctx.stroke(); }
  const wt = f10Own('that_one');
  if (wt && wt.f10pt) for (const e of wt.f10pt) if (!e.dead) { ctx.fillStyle = col('#ffffff'); ctx.globalAlpha = 0.9; ctx.font = Math.round(14 * S) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('☞', sx(e.x), sy(e.y - e.r - 10)); }
  ctx.restore();
}

// ================================================================ the Feats
// Each: id, name, icon (2 letters), ico (icons.js shape), type + atk (or neither: utility), trig (performs itself),
// ev (only events start it), when(w) (the moment, polled; returns a context or null), fire(w, ctx), stat(w, s) (fork flags),
// base (level 1 numbers), stam (stamina cost), start (in the starting pool), rar, forks {3: [a, b], 5: [a, b]}.
// Level 5 forks are written here (FEATS.md only lists level 3): flagged in the report.
const fk = (id, title, desc) => ({ id, title, desc });

feat({ id: 'little_bubble', name: 'Little Bubble', icon: 'LB', ico: 'bubble', type: 'force', atk: 'burst', trig: 1, ev: 1, start: 1, rar: 0, stam: 12,
  line: `"I made you a little safe."`, does: 'When a hit would take a tenth of your health, a bubble takes it instead, then bursts and shoves nearby enemies back.',
  base: { dmg: 14, cd: 15, area: 100 },
  stat: (w, s) => { if (f10Fk(w, 'lasting')) s.cd *= 0.67; s.hits = f10Fk(w, 'thick') ? 2 : 1; },
  fire: w => { if (w.s.hits > 1) { f10().bub = { w, left: 1 }; floatText(me().x, me().y - 34, 'Safe.', w.def.color, 12, 0.8); } else f10Pop(w); },
  forks: { 3: [fk('poprocks', 'Pop Rocks', 'The burst also destroys enemy Projectile and Spread shots inside it.'), fk('thick', 'Thicker Skin', 'The bubble holds two hits before it bursts.')],
    5: [fk('echo', 'Echo Pop', 'A second, smaller burst half a second later.'), fk('lasting', 'Lasting Bubble', 'A third shorter cooldown.')] } });

feat({ id: 'oopsie', name: 'Oopsie', icon: 'OO', ico: 'peek', trig: 1, start: 1, rar: 1,
  line: `"Wrong way! No, wait. That way!"`, does: 'When you are surrounded, you lurch through the thinnest gap and hide for a second, leaving an afterimage that enemies attack instead.',
  base: { dmg: 12, cd: 12, area: 90 },
  stat: (w, s) => { if (f10Fk(w, 'brisk')) s.cd *= 0.7; },
  when: w => { const p = me(); return f10Near(p.x, p.y, 120).length >= 6 ? {} : null; },
  fire: w => {
    const p = me(), D = f10(), ox = p.x, oy = p.y, hide = f10Fk(w, 'longhide') ? 2 : 1;
    const go = () => { const a = f10Gap(160); f10Lunge(Math.cos(a) * 160, Math.sin(a) * 160); };
    go(); G.peek = { x: ox, y: oy, t: G.t + hide, w, boo: true };
    D.fx.push({ x: ox, y: oy, t0: G.t, end: G.t + hide, dr: k => { ctx.fillStyle = col(F10_COL.utility); ctx.globalAlpha = 0.35 * k; ctx.beginPath(); ctx.arc(sx(ox), sy(oy), 12 * S, 0, TAU); ctx.fill(); } });
    floatText(p.x, p.y - 34, 'Oops.', F10_COL.utility, 13, 0.8);
    if (f10Fk(w, 'double')) after(0.45, () => { if (G && G.state === 'play') go(); });
    if (f10Fk(w, 'pop')) after(hide, () => { if (!G) return; const l = f10Near(ox, oy, w.s.area); f10Burst(w, ox, oy, w.s.area, w.s.dmg, null); for (const e of l) if (!e.dead) f10Stagger(e); });
  },
  forks: { 3: [fk('pop', 'Pop', 'The afterimage bursts when it fades, and everything caught staggers.'), fk('double', 'Double Oopsie', 'Two lurches, one after the other.')],
    5: [fk('brisk', 'Brisk', 'A shorter cooldown.'), fk('longhide', 'Long Hide', 'You stay hidden for two seconds.')] } });

feat({ id: 'anhydrobiosis', name: 'Anhydrobiosis', icon: 'AN', ico: 'shield', type: 'force', atk: 'burst', trig: 1, ev: 1, start: 1, rar: 1, stam: 0,
  line: `"Shh. Play dead. I'll wake you."`, does: 'When a hit would drop you under a fifth of your health, it misses, and you dry into a husk nothing can hurt for a few seconds, then burst back and shove everything away.',
  base: { dmg: 20, cd: 18, dur: 2.5, area: 160 },
  fire: w => { f10().husk = { w, end: G.t + w.s.dur }; floatText(me().x, me().y - 34, 'Shh.', w.def.color, 13, 1); },
  forks: { 3: [fk('vacuum', 'Vacuum Rated', 'The husk destroys enemy Projectile and Spread shots that touch it and fires them back.'), fk('rehydrate', 'Rehydration', 'The burst also heals 15% of your health.')],
    5: [fk('specialboy', 'Special Boy', 'Get through the husk and the next 3 seconds untouched and you move 30% faster for 5 seconds.'), fk('longhusk', 'Dry Spell', 'The burst hits half as hard again.')] } });

feat({ id: 'big_feelings', name: 'BIG FEELINGS', icon: 'BF', ico: 'nova', type: 'force', atk: 'burst', trig: 1, start: 1, rar: 0, stam: 14,
  line: `"Too much! TOO MUCH!"`, does: 'When five or more enemies press in, a shove bursts out of you. Every extra enemy makes it stronger, up to double.',
  base: { dmg: 12, cd: 8, area: 120 },
  stat: (w, s) => { if (f10Fk(w, 'meltdown')) s.area *= 1.4; if (f10Fk(w, 'tantrum')) s.cd *= 0.65; },
  when: w => { const p = me(), n = f10Near(p.x, p.y, 100).length; return n >= 5 ? { n } : null; },
  fire: (w, c) => {
    const p = me(), s = w.s, k = Math.min(2, 1 + 0.2 * ((c.n || 5) - 5)), list = f10Near(p.x, p.y, s.area);
    f10Burst(w, p.x, p.y, s.area, s.dmg * k, null);
    for (const e of list) f10Shove(e, p.x, p.y, 360 * k);
    if (f10Fk(w, 'sulk')) for (const e of list) f10Stagger(e);
    if (f10Fk(w, 'domino')) for (const e of list) { const m = f10Near(e.x, e.y, 50).find(o => !list.includes(o)); if (m) { f10Shove(m, e.x, e.y, 300); f10Hit(w, m, s.dmg * 0.5, 'burst'); } }
  },
  forks: { 3: [fk('domino', 'Domino', 'An enemy thrown into a mate knocks it too, one step further.'), fk('sulk', 'Sulk', 'The burst also staggers everything it shoves.')],
    5: [fk('meltdown', 'Meltdown', 'A 40% wider burst.'), fk('tantrum', 'Tantrum', 'A much shorter cooldown.')] } });

feat({ id: 'sticky_business', name: 'STICKY BUSINESS', icon: 'SB', ico: 'droplet', type: 'mucus', atk: 'burst', trig: 1, start: 1, rar: 0, stam: 12,
  line: `"Stay! Stay with me!"`, does: 'When an elite, a boss or a charging enemy comes close, a glob hits it and everything near it, and they are Snared.',
  base: { dmg: 8, cd: 10, area: 80 },
  stat: (w, s) => { if (f10Fk(w, 'bigglob')) s.area *= 1.5; if (f10Fk(w, 'fingers')) s.cd *= 0.6; },
  when: w => { const p = me(); const e = f10Near(p.x, p.y, 90).find(o => o.boss || o.elite || o.def.ai === 'charge'); return e ? { e } : null; },
  fire: (w, c) => {
    const e = c.e, s = w.s; if (!e || e.dead) return;
    const list = f10Near(e.x, e.y, s.area); f10Burst(w, e.x, e.y, s.area, s.dmg, null);
    if (f10Fk(w, 'jam')) { const g = list.filter(o => !o.dead).slice(0, 6); g.forEach((q, i) => { q.conjT = G.t + 3; q.conjCd = G.t + 6; q.conjWith = g[(i + 1) % g.length]; q.frozen = Math.max(q.frozen, q.boss ? 0.5 : 3); }); }
    if (f10Fk(w, 'gooey')) f10Patch(w, e.x, e.y, 50, 4, 'mucus', 3);
  },
  forks: { 3: [fk('jam', 'Traffic Jam', 'Everything it Snares is Conjoined into one group of six at most.'), fk('gooey', 'Gooey Centre', 'It also leaves a Mucus patch.')],
    5: [fk('bigglob', 'Bigger Glob', 'A 50% wider glob.'), fk('fingers', 'Sticky Fingers', 'A much shorter cooldown.')] } });

feat({ id: 'jump_scare', name: 'Jump Scare', icon: 'JS', ico: 'ghost', type: 'soul', atk: 'burst', trig: 1, start: 1, rar: 1, stam: 12,
  line: `"BOO! Did I get them? I got them."`, does: 'When three or more enemies get close at once, the consciousness shrieks and everything nearby flees for two seconds.',
  base: { dmg: 6, cd: 10, area: 200 },
  stat: (w, s) => { if (f10Fk(w, 'louder')) s.area *= 1.3; },
  when: w => { const p = me(); return f10Near(p.x, p.y, 70).length >= 3 ? {} : null; },
  fire: w => {
    const p = me(), scare = () => { const l = f10Near(p.x, p.y, w.s.area); f10Burst(w, p.x, p.y, w.s.area, w.s.dmg, null); for (const e of l) if (!e.dead) { if (!e.boss) e.fearT = G.t + (f10Fk(w, 'contagious') ? 3 : 2); if (f10Fk(w, 'look')) fightCd(e).bars.soul = Math.min(0.99, fightCd(e).bars.soul + 0.25); } };
    floatText(p.x, p.y - 36, 'BOO', w.def.color, 20, 0.8); scare();
    if (f10Fk(w, 'again')) after(1, () => { if (G && G.state === 'play') scare(); });
  },
  forks: { 3: [fk('look', 'Made You Look', 'Fleeing enemies also build Alien.'), fk('again', 'Again!', 'A second BOO a second later.')],
    5: [fk('louder', 'Louder', 'A 30% wider shriek.'), fk('contagious', 'Contagious', 'Enemies flee for three seconds.')] } });

feat({ id: 'kiss_it_better', name: 'Kiss It Better', icon: 'KB', ico: 'heart', trig: 1, ev: 1, start: 1, rar: 0,
  line: `"Mwah. Better?"`, does: 'After three hits on you within two seconds, a kiss mark pops on you and you heal a tenth of your health.',
  base: { cd: 14 },
  stat: (w, s) => { if (f10Fk(w, 'extra')) s.cd = Math.min(s.cd, 12 * (w.lvl >= 4 ? 0.85 : 1)); },
  fire: w => {
    const p = me(); let h = 0.10 * w.s.k; if (f10Fk(w, 'lipstick') && p.hp < G.P.maxHp * 0.25) h *= 2;
    healPlayer(G.P.maxHp * h); floatText(p.x, p.y - 40, 'Mwah.', '#ff8fb8', 14, 1); ring(p.x, p.y, p.r + 12, '#ff8fb8', 0.4, 3);
    if (f10Fk(w, 'smoochy') && typeof pstClear === 'function') pstClear();
    if (f10Fk(w, 'makeup')) p.iframes = Math.max(p.iframes, 1);
  },
  forks: { 3: [fk('smoochy', 'Smoochy', 'It also clears the nasty statuses from you.'), fk('extra', 'Extra Kiss', 'A 12 second cooldown.')],
    5: [fk('makeup', 'Kiss and Make Up', 'The kiss also keeps everything off you for a second.'), fk('lipstick', 'Lipstick', 'Double the healing when you are below a quarter of your health.')] } });

feat({ id: 'more', name: 'More!', icon: 'MO', ico: 'pill', trig: 1, ev: 1, start: 1, rar: 1,
  line: `"You need more. Everybody needs more."`, does: 'Picking up XP while hurt starts a feeding frenzy: every XP orb nearby flies to you, and the next one is worth triple.',
  base: { cd: 20, range: 250 },
  stat: (w, s) => { if (f10Fk(w, 'greedy')) s.cd = 30 * (w.lvl >= 4 ? 0.85 : 1); if (f10Fk(w, 'metabolism')) s.cd *= 0.6; },
  fire: w => { const p = me(); for (const g of G.gems) if (!g.dead && Math.hypot(g.x - p.x, g.y - p.y) < w.s.range) g.mag = true; f10().more = true; floatText(p.x, p.y - 36, 'More.', F10_COL.utility, 13, 0.8); },
  forks: { 3: [fk('seconds', 'Seconds', 'The triple orb bursts into five small motes that home in instead.'), fk('greedy', 'Greedy', 'Works at any health, on a 30 second cooldown.')],
    5: [fk('fivefold', 'Third Helping', 'The next orb is worth five times as much.'), fk('metabolism', 'Fast Metabolism', 'A much shorter cooldown.')] } });

feat({ id: 'and_another_thing', name: 'AND ANOTHER THING', icon: 'AT', ico: 'mine', type: 'force', atk: 'burst', trig: 1, ev: 1, start: 1, rar: 1, stam: 14,
  line: `"You thought we were finished?!"`, does: 'After three kills within a second, a marked pulse goes off a second later where most of them died.',
  base: { dmg: 20, cd: 6, area: 120 },
  stat: (w, s) => { if (f10Fk(w, 'bigger')) s.area *= 1.4; },
  fire: (w, c) => {
    const D = f10(), s = w.s, delay = f10Fk(w, 'fuse') ? 0.5 : 1;
    f10Mark(c.x, c.y, s.area, delay, w.def.color);
    if (f10Fk(w, 'gawk')) D.pulls.push({ x: c.x, y: c.y, r: s.area * 1.5, end: G.t + delay });
    after(delay, () => {
      if (!G || G.state !== 'play') return;
      const k0 = G.kills; D.pulsing = true;
      try { f10Burst(w, c.x, c.y, s.area, s.dmg, null); } finally { D.pulsing = false; }
      if (f10Fk(w, 'encore') && G.kills - k0 >= 3) after(0.3, () => { D.pulsing = true; try { f10Burst(w, c.x, c.y, s.area, s.dmg * 0.5, null); } finally { D.pulsing = false; } });
    });
  },
  forks: { 3: [fk('encore', 'Encore', 'If the pulse kills three or more, one more pulse at half strength. Never a third.'), fk('gawk', 'Rubbernecking', 'A gravity well drags enemies to the spot while the pulse waits.')],
    5: [fk('bigger', 'Bigger Gap', 'A 40% wider pulse.'), fk('fuse', 'Short Fuse', 'It goes off after half a second.')] } });

feat({ id: 'brown_fat', name: 'Brown Fat', icon: 'BR', ico: 'flask', type: 'fire', atk: 'burst', start: 1, rar: 1, stam: 22,
  line: `"I saved you some fat. For burning. Wait for it."`, does: 'A fat globule lands in the crowd, marked, and goes off two seconds later: everything inside ignites at once.',
  base: { dmg: 30, cd: 9, area: 110, range: 460 },
  stat: (w, s) => { if (f10Fk(w, 'insulation')) s.area *= 1.5; if (f10Fk(w, 'slowburn')) s.dmg *= 1.8; },
  when: w => { const p = me(), t = acquire('cluster', w.s.range, p.x, p.y); return t ? { x: t.x, y: t.y } : null; },
  fire: (w, c) => {
    const s = w.s, delay = f10Fk(w, 'thermo') ? 0 : f10Fk(w, 'slowburn') ? 3 : 2;
    const boom = k => { if (!G || G.state !== 'play') return; for (const o of f10Near(c.x, c.y, s.area)) fightCd(o).bars.fire = 0.9999999; f10Burst(w, c.x, c.y, s.area, s.dmg * k, null); };
    if (delay) f10Mark(c.x, c.y, s.area, delay, w.def.color);
    after(delay, () => boom(1));
    if (f10Fk(w, 'again')) after(delay + 1, () => boom(0.5));
  },
  forks: { 3: [fk('thermo', 'Thermogenic', 'It goes off at once, with no delay.'), fk('insulation', 'Insulation', 'A 50% wider blast.')],
    5: [fk('slowburn', 'Slow Burn', 'It waits three seconds and hits much harder.'), fk('again', 'Double Chin', 'It goes off a second time a second later, at half strength.')] } });

feat({ id: 'sofa_crevice', name: 'Sofa Crevice', icon: 'SC', ico: 'spiral', type: 'force', atk: 'pool', start: 1, rar: 2, stam: 30,
  line: `"I found where everything goes. Throw them in."`, does: 'Tears open a small singularity under the crowd that drags enemies in, crushes them and bends shots towards it.',
  base: { dmg: 16, cd: 10, area: 125, dur: 3, range: 400, pull: 210 },
  stat: (w, s) => { if (f10Fk(w, 'deep')) s.pullK = 2; if (f10Fk(w, 'horizon')) s.area *= 1.35; if (f10Fk(w, 'linger')) s.dur *= 1.5; },
  when: w => { const p = me(), t = acquire('cluster', w.s.range, p.x, p.y); return t ? { x: t.x, y: t.y } : null; },
  fire: (w, c) => {
    const s = w.s, D = f10(); if (G.zones.length >= 150) return;
    const old = G.zones.filter(z => z.f10well && z.life > 0); if (old.length >= 3) old[0].life = 0.001;
    const loose = f10Fk(w, 'loose'), dmg = s.dmg;
    G.zones.push({ x: c.x, y: c.y, r: s.area, life: s.dur, max: s.dur, dps: dmg * 4, elem: 'phys', pull: s.pull * 0.45 * (s.pullK || 1), color: w.def.color, tick: 0, src: f10Src(w, { atk: 'pool', zoneHit: true }), f10well: true,
      onEnd: loose ? z => f10Burst(w, z.x, z.y, z.r, dmg * 16, null) : null });
  },
  forks: { 3: [fk('deep', 'Down the Back', 'It pulls twice as hard.'), fk('loose', 'Loose Change', 'When it closes, it spits everything out in a burst worth four seconds of its damage.')],
    5: [fk('horizon', 'Event Horizon', 'A 35% wider singularity.'), fk('linger', 'Stuck Cushion', 'It stays open half as long again.')] } });

feat({ id: 'formic_acid', name: 'Formic Acid', icon: 'FA', ico: 'shard', type: 'acid', atk: 'beam', start: 1, rar: 1, stam: 26,
  line: `"I asked an ant. It said yes. I think it said yes."`, does: 'A far-too-big ant snaps the most-Shelled enemy and sprays acid down the line behind it.',
  base: { dmg: 60, cd: 8, range: 360 },
  stat: (w, s) => { if (f10Fk(w, 'mandibles')) s.dmg *= 1.6; },
  when: w => { const p = me(), l = f10Near(p.x, p.y, w.s.range); return l.length ? { l } : null; },
  fire: (w, c) => {
    const p = me(), s = w.s, l = (c.l || []).filter(e => !e.dead).sort((a, b) => fightCd(b).layers - fightCd(a).layers || Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
    const n = (f10Fk(w, 'worker') ? 2 : 1) + (f10Fk(w, 'colony') ? 1 : 0);
    for (const t of l.slice(0, n)) {
      const a = Math.atan2(t.y - p.y, t.x - p.x), ex = t.x + Math.cos(a) * 200, ey = t.y + Math.sin(a) * 200, ca = Math.cos(a), sa = Math.sin(a);
      fightCd(t).bars.acid = 0.9999999; f10Hit(w, t, s.dmg, 'beam');
      for (const o of G.enemies) {
        if (o === t || !f10Live(o)) continue;
        const dx = o.x - p.x, dy = o.y - p.y, u = dx * ca + dy * sa, v = Math.abs(-dx * sa + dy * ca);
        if (u < 0 || u > Math.hypot(ex - p.x, ey - p.y) || v > 34 + o.r) continue;
        const c2 = fightCd(o); c2.bars.acid = Math.min(0.99, c2.bars.acid + 0.5); f10Hit(w, o, s.dmg * 0.4, 'beam');
      }
      (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: p.x, y: p.y, x2: ex, y2: ey, w: 34, c: w.def.color, t: 'fire', life: 0.25, max: 0.25 });
      if (f10Fk(w, 'trail')) for (let i = 1; i <= 4; i++) f10Patch(w, p.x + (ex - p.x) * i / 4, p.y + (ey - p.y) * i / 4, 58, 3.5, 'acid', s.dmg * 0.1);
    }
  },
  forks: { 3: [fk('worker', 'Worker', 'Two bites on two targets.'), fk('trail', 'Pheromone Trail', 'The spray leaves Acid Pools along the line.')],
    5: [fk('mandibles', 'Big Mandibles', 'The bite hits 60% harder.'), fk('colony', 'Colony', 'One more bite on one more target.')] } });

feat({ id: 'tonic_immobility', name: 'Tonic Immobility', icon: 'TI', ico: 'storm', type: 'static', atk: 'burst', start: 1, rar: 2, stam: 34,
  line: `"Everybody freeze! Not you. You keep going."`, does: 'Every enemy on screen takes a Static hit that staggers it at once. Bosses take extra damage.',
  base: { dmg: 40, cd: 12 },
  stat: (w, s) => { if (f10Fk(w, 'quick')) s.cd *= 0.7; },
  when: w => { const l = G.enemies.filter(e => f10Live(e) && f10OnView(e)); return l.length >= 3 ? { l } : null; },
  fire: (w, c) => {
    const s = w.s, l = (c.l || []).filter(e => !e.dead);
    IN_AOE = true;
    try { for (const e of l) f10Hit(w, e, s.dmg * (e.boss ? (f10Fk(w, 'twitch') ? 2.5 : 1.5) : 1), 'burst'); } finally { IN_AOE = false; }
    for (const e of l) f10Stagger(e, !e.boss && !e.elite && f10Fk(w, 'upside') ? 1.5 : 1);
    if (f10Fk(w, 'aftershock')) after(0.8, () => { if (G) for (const e of l) if (!e.dead) f10Stagger(e, 0.6); });
    const p = me(); ring(p.x, p.y, 300, w.def.color, 0.5, 5); cam.shake = Math.min(10, cam.shake + 4);
  },
  forks: { 3: [fk('upside', 'Upside Down', 'The stagger lasts half as long again on ordinary enemies.'), fk('twitch', 'Twitch', 'Bosses take 150% extra instead of 50%.')],
    5: [fk('aftershock', 'Aftershock', 'A second, shorter stagger 0.8 seconds later.'), fk('quick', 'Quick Twitch', 'A much shorter cooldown.')] } });

feat({ id: 'shed_the_lining', name: 'Shed the Lining', icon: 'SL', ico: 'wake', type: 'blood', atk: 'beam', start: 1, rar: 1, stam: 30,
  line: `"Out with the old! All of it! Everybody out!"`, does: 'A wide red tide rolls across the screen from behind you, shoving enemies along and making them bleed.',
  base: { dmg: 12, cd: 8 },
  stat: (w, s) => { if (f10Fk(w, 'flood')) s.dmg *= 1.5; },
  when: w => { const p = me(); return f10Near(p.x, p.y, 400).length ? {} : null; },
  fire: w => {
    const p = me(), D = f10(), heavy = f10Fk(w, 'heavy'), dur = f10Fk(w, 'fast') ? 1.8 : 2.6, a = p.face || 0;
    const tide = ang => D.tides.push({ x: p.x, y: p.y, a: ang, t0: G.t, dur, width: 150 * (heavy ? 1.4 : 1), push: heavy ? 420 : 260, hit: new Set(), w });
    tide(a); if (f10Fk(w, 'irregular')) tide(a + Math.PI);
  },
  forks: { 3: [fk('heavy', 'Heavy Flow', 'A wider tide that pushes harder.'), fk('irregular', 'Irregular', 'A second tide from the opposite edge.')],
    5: [fk('flood', 'Flood', 'The tide hits 50% harder.'), fk('fast', 'Spring Tide', 'The tide crosses the screen in 1.8 seconds.')] } });

feat({ id: 'vanishing_twin', name: 'Vanishing Twin', icon: 'VT', ico: 'twins', type: 'soul', atk: 'burst', start: 1, rar: 2, stam: 26,
  line: `"Remember your twin? No? They remember you."`, does: 'A faint copy of you rises under the toughest enemy nearby and turns it: it fights for you for a few seconds.',
  base: { dmg: 80, cd: 8, range: 380 },
  stat: (w, s) => { if (f10Fk(w, 'closer')) s.cd *= 0.7; },
  when: w => { const p = me(), l = f10Near(p.x, p.y, w.s.range).sort((a, b) => b.maxHp - a.maxHp); return l.length ? { l } : null; },
  fire: (w, c) => {
    const s = w.s, D = f10(), l = (c.l || []).filter(e => !e.dead).sort((a, b) => b.maxHp - a.maxHp);
    for (const t of l.slice(0, f10Fk(w, 'peaks') ? 2 : 1)) {
      fightCd(t).bars.soul = 0.9999999; ring(t.x, t.y, t.r + 14, w.def.color, 0.5, 4); f10Hit(w, t, s.dmg, 'burst');
      if (t.charmed) {
        if (f10Fk(w, 'absorbed') && !t.elite && !t.boss && Math.random() < 0.25) { t.hp = 0; killEnemy(t, f10Src(w)); }
        else if (f10Fk(w, 'guilt')) D.guiltEnd = Math.max(D.guiltEnd || 0, G.t + (t.charmT || 4));
      }
    }
  },
  forks: { 3: [fk('absorbed', 'Absorbed', 'A 25% chance the enemy never comes back (not elites or bosses). It counts as a kill.'), fk('guilt', "Survivor's Guilt", 'While it fights for you, you take 25% less damage.')],
    5: [fk('peaks', 'Twin Peaks', 'The twin rises under the two toughest enemies.'), fk('closer', 'Closer', 'A much shorter cooldown.')] } });

// ---- later unlocks (FEATS.md section 5)
feat({ id: 'not_yet', name: 'NOT YET', icon: 'NY', ico: 'shield', type: 'force', atk: 'burst', trig: 1, ev: 1, rar: 3, stam: 0,
  line: `"No. No no no. You can't go yet."`, does: 'The first time a hit would kill you in a run, you stay on 1 health, nothing can touch you for a second, and a violent shove bursts out of you.',
  base: { dmg: 30, cd: 99999, area: 200 },
  stat: (w, s) => { if (f10Fk(w, 'bang')) s.area *= 1.5; },
  fire: w => {
    const p = me(), D = f10(), l = f10Near(p.x, p.y, w.s.area); D.nyUsed = true; p.hp = 1; p.iframes = Math.max(p.iframes, 1);
    f10Burst(w, p.x, p.y, w.s.area, w.s.dmg, null); for (const e of l) f10Shove(e, p.x, p.y, 520);
    if ((f10Fk(w, 'bargain') && l.length >= 5) || f10Fk(w, 'wind')) healPlayer(G.P.maxHp * (f10Fk(w, 'wind') ? 0.15 : 0.25));
    floatText(p.x, p.y - 40, 'NOT YET', w.def.color, 20, 1.2);
  },
  forks: { 3: [fk('bargain', 'Bargaining', 'If the burst hits five or more enemies, you heal 25%.'), fk('denial', 'Denial', 'One recharge, after your next boss kill.')],
    5: [fk('wind', 'Second Wind', 'You also heal 15% when it goes off.'), fk('bang', 'Bigger Bang', 'A 50% wider burst.')] } });

feat({ id: 'wait_wait_wait', name: 'WAIT WAIT WAIT', icon: 'WW', ico: 'clock', type: 'mucus', atk: 'burst', trig: 1, rar: 3, stam: 24,
  line: `"Everybody stop. I need a second."`, does: 'When you are low and surrounded, everything nearby is Snared and enemy shots inside slow right down for two seconds. You keep moving.',
  base: { dmg: 6, cd: 20, area: 180 },
  stat: (w, s) => { if (f10Fk(w, 'breath')) s.area *= 1.4; if (f10Fk(w, 'another')) s.cd *= 0.6; },
  when: w => { const p = me(); return p.hp < G.P.maxHp * 0.4 && f10Near(p.x, p.y, 180).length >= 6 ? {} : null; },
  fire: w => {
    const p = me(), D = f10(), dur = f10Fk(w, 'long') ? 3 : 2, l = f10Near(p.x, p.y, w.s.area);
    f10Burst(w, p.x, p.y, w.s.area, w.s.dmg, null); D.slow = { x: p.x, y: p.y, r: w.s.area, end: G.t + dur };
    if (f10Fk(w, 'unpause')) { for (const e of l) e.f10hp0 = e.hp; after(dur, () => { if (G) for (const e of l) if (!e.dead) damageEnemy(e, Math.max(0, e.f10hp0 - e.hp) * 0.3, f10Src(w, { echo: true, noStatus: true })); }); }
    floatText(p.x, p.y - 38, 'Wait.', w.def.color, 14, 1);
  },
  forks: { 3: [fk('unpause', 'Unpause', 'When it ends, each enemy caught takes 30% of the damage it took meanwhile again.'), fk('long', 'Long Second', 'It lasts three seconds.')],
    5: [fk('breath', 'Deep Breath', 'A 40% wider reach.'), fk('another', 'Another Second', 'A much shorter cooldown.')] } });

feat({ id: 'come_back_here', name: 'COME BACK HERE', icon: 'CB', ico: 'link', trig: 1, ev: 1, rar: 3,
  line: `"You look hungry. Eat that one."`, does: 'When an enemy dies close by, a scrap of it flies into you and heals a little. Elites and bosses give more.',
  base: { cd: 0, range: 150 },
  stat: (w, s) => { if (f10Fk(w, 'arms')) s.range = 250; },
  fire: () => {},
  forks: { 3: [fk('leftovers', 'Leftovers', 'Healing past full becomes a temporary Membrane.'), fk('arms', 'Long Arms', 'Scraps fly in from 250 away.')],
    5: [fk('bigbites', 'Bigger Bites', 'Scraps heal 50% more.'), fk('ravenous', 'Ravenous', 'The healing cap rises from 6 to 9 health a second.')] } });

feat({ id: 'that_one', name: 'THAT ONE', icon: 'TO', ico: 'grudge', type: 'force', atk: 'burst', trig: 1, ev: 1, rar: 3, stam: 12,
  line: `"I didn't like that one. I don't like it now either."`, does: 'The consciousness points at whichever enemy hurt you most lately. When it dies, it goes off in a burst.',
  base: { dmg: 25, cd: 8, area: 140 },
  stat: (w, s) => { if (f10Fk(w, 'overkill')) s.dmg *= 1.5; if (f10Fk(w, 'forget')) s.cd *= 0.6; },
  fire: (w, c) => { const l = f10Near(c.x, c.y, w.s.area); f10Burst(w, c.x, c.y, w.s.area, w.s.dmg, null); if (f10Fk(w, 'tell')) for (const e of l) f10Stagger(e); },
  forks: { 3: [fk('tell', 'Tell Everyone', 'The burst also staggers everything it hits.'), fk('grudge', 'Grudge', 'It points at the two worst enemies.')],
    5: [fk('overkill', 'Overkill', 'The burst hits 50% harder.'), fk('forget', 'Never Forget', 'A much shorter cooldown.')] } });

feat({ id: 'nesting', name: 'Nesting', icon: 'NE', ico: 'web', type: 'mucus', atk: 'pool', trig: 1, rar: 3, stam: 14,
  line: `"I made a nest. Get in. Get IN."`, does: 'Stay put for two seconds and a ring of Mucus patches forms around you. Anything crossing it is Snared.',
  base: { dmg: 3, cd: 12, area: 50, dur: 4 },
  stat: (w, s) => { if (f10Fk(w, 'feathered')) s.dur *= 2; if (f10Fk(w, 'quick')) s.cd *= 0.6; },
  when: w => (f10().stayT >= 2 ? {} : null),
  fire: w => {
    const p = me(), D = f10(), s = w.s, n = f10Fk(w, 'twelve') ? 12 : 6; D.stayT = 0;
    for (let i = 0; i < n; i++) { const a = i / n * TAU; f10Patch(w, p.x + Math.cos(a) * 70, p.y + Math.sin(a) * 70, s.area, s.dur, 'mucus', s.dmg * 4); }
    D.nest = { x: p.x, y: p.y, r: 100, end: G.t + s.dur, cosy: f10Fk(w, 'cosy') };
  },
  forks: { 3: [fk('feathered', 'Feathered', 'The patches last twice as long.'), fk('cosy', 'Cosy', 'You heal 1% a second while inside the ring.')],
    5: [fk('twelve', 'Full House', 'Twelve patches instead of six.'), fk('quick', 'Quick Nest', 'A much shorter cooldown.')] } });

feat({ id: 'mine', name: 'Mine!', icon: 'MI', ico: 'tooth', trig: 1, ev: 1, rar: 3,
  line: `"Found it. It's ours now."`, does: 'A big haul (a box, a chest or ten XP orbs at once) wraps you in a halo that soaks hits for a few seconds.',
  base: { dmg: 10, cd: 20 },
  stat: (w, s) => { if (f10Fk(w, 'quickfingers')) s.cd *= 0.6; },
  fire: (w, c) => {
    const p = me(), D = f10(), hp = G.P.maxHp * (f10Fk(w, 'haul') ? 0.25 : 0.15) * w.s.k, dur = Math.min(6, 3 + 0.2 * (c.orbs || 0));
    f10Membrane(hp, dur, w, f10Fk(w, 'finders'));
    if (f10Fk(w, 'hoard')) D.hoard = G.t + dur;
    floatText(p.x, p.y - 38, 'Mine.', F10_COL.utility, 13, 0.9);
  },
  forks: { 3: [fk('finders', 'Finders Keepers', 'When it ends, it pops in a Force burst that knocks enemies back.'), fk('hoard', 'Hoard', 'While it lasts, XP within 250 flies to you.')],
    5: [fk('haul', 'Bigger Haul', 'The halo soaks 25% of your health instead of 15%.'), fk('quickfingers', 'Quick Fingers', 'A much shorter cooldown.')] } });

feat({ id: 'packed_lunch', name: 'Packed Lunch', icon: 'PL', ico: 'cross', trig: 1, rar: 3,
  line: `"I packed you lunch. Don't share it."`, does: 'While you are below 60% health, a yolk drops near you every 40 seconds. Swim into it to heal. Greedy enemies try to eat it first.',
  base: { cd: 40 },
  stat: (w, s) => { if (f10Fk(w, 'bag')) s.cd *= 0.6; },
  when: w => { const p = me(), D = f10(); return p.hp < G.P.maxHp * 0.6 && !D.yolk ? {} : null; },
  fire: w => {
    const p = me(), D = f10(), a = rand(0, TAU), d = rand(80, f10Fk(w, 'picnic') ? 300 : 150);
    D.yolk = { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, end: G.t + 15, heal: (f10Fk(w, 'picnic') ? 0.25 : 0.15) * w.s.k + (f10Fk(w, 'gourmet') ? 0.10 : 0), safe: f10Fk(w, 'lunchbox') };
  },
  forks: { 3: [fk('lunchbox', 'Lunchbox', 'Enemies cannot eat the yolk.'), fk('picnic', 'Picnic', 'It heals 25% but lands farther away.')],
    5: [fk('bag', 'Doggy Bag', 'A much shorter cooldown.'), fk('gourmet', 'Gourmet', 'The yolk heals 10% more.')] } });

feat({ id: 'hagfish', name: 'Hagfish', icon: 'HF', ico: 'spray', type: 'mucus', atk: 'burst', rar: 2, stam: 24,
  line: `"I made you slimy. Nobody can hold you now."`, does: 'An instant burst of slime Snares everything around you and leaves a Mucus patch where you were.',
  base: { dmg: 18, cd: 13, area: 150 },
  stat: (w, s) => { if (f10Fk(w, 'bucket')) s.area *= 1.4; if (f10Fk(w, 'slimmer')) s.cd *= 0.7; },
  when: w => { const p = me(); return f10Near(p.x, p.y, 150).length ? {} : null; },
  fire: w => {
    const p = me(), l = f10Near(p.x, p.y, w.s.area); f10Burst(w, p.x, p.y, w.s.area, w.s.dmg, null); f10Patch(w, p.x, p.y, 50, 4, 'mucus', 3);
    if (f10Fk(w, 'clog')) for (const e of l) if (!e.dead) stun(e, 2.5);
    if (f10Fk(w, 'knot')) after(2.5, () => { if (G && G.state === 'play') { const a = me().face || 0; f10Lunge(Math.cos(a) * 160, Math.sin(a) * 160); } });
  },
  forks: { 3: [fk('knot', 'Knot Tying', 'When the Snare ends, you lunge out in the direction you are swimming.'), fk('clog', 'Gill Clogger', 'Enemies it Snares cannot attack while Snared.')],
    5: [fk('bucket', 'Bucketful', 'A 40% wider burst.'), fk('slimmer', 'Slimmer', 'A much shorter cooldown.')] } });

feat({ id: 'running_with_scissors', name: 'Running With Scissors', icon: 'RS', ico: 'scissors', type: 'blood', atk: 'spread', rar: 2, stam: 26,
  line: `"I found sharp things. Don't hold them. Throw them."`, does: 'A ring of blades bursts out of you, cutting and making everything it catches bleed.',
  base: { dmg: 19, cd: 6, area: 220 },
  stat: (w, s) => { if (f10Fk(w, 'serrated')) s.dmg *= 1.5; if (f10Fk(w, 'snips')) s.cd *= 0.7; },
  when: w => { const p = me(); return f10Near(p.x, p.y, w.s.area).length ? {} : null; },
  fire: w => {
    const p = me(), s = w.s, blades = f10Fk(w, 'shears') ? 20 : 16;
    const pass = () => {
      if (!G || G.state !== 'play') return;
      const q = me(), l = f10Near(q.x, q.y, s.area).sort((a, b) => Math.hypot(a.x - q.x, a.y - q.y) - Math.hypot(b.x - q.x, b.y - q.y));
      l.forEach((e, i) => { const n = Math.max(1, Math.round(blades * (2 * e.r) / (TAU * Math.max(30, Math.hypot(e.x - q.x, e.y - q.y))))); for (let j = 0; j < n && !e.dead; j++) f10Hit(w, e, s.dmg * Math.max(0.4, 1 - 0.15 * i), 'spread'); });
      f10().fx.push({ x: q.x, y: q.y, t0: G.t, end: G.t + 0.3, dr: k => { ctx.strokeStyle = col(F10_COL.blood); ctx.lineWidth = 2; ctx.globalAlpha = k; for (let i = 0; i < blades; i++) { const a = i / blades * TAU, r0 = (1 - k) * s.area * 0.9; ctx.beginPath(); ctx.moveTo(sx(q.x + Math.cos(a) * r0), sy(q.y + Math.sin(a) * r0)); ctx.lineTo(sx(q.x + Math.cos(a) * (r0 + 22)), sy(q.y + Math.sin(a) * (r0 + 22))); ctx.stroke(); } } });
    };
    pass(); if (f10Fk(w, 'safety')) after(0.5, pass);
  },
  forks: { 3: [fk('safety', 'Safety Scissors', 'The blades come back, cutting everything twice.'), fk('shears', 'Pinking Shears', 'Four more blades in every ring.')],
    5: [fk('serrated', 'Serrated', 'The blades hit 50% harder.'), fk('snips', 'Quick Snips', 'A much shorter cooldown.')] } });

// ================================================================ the eight Unique Feats (redesign docs/SAMPLES.md)
// Slot 1 of the sample that owns them. Level 3 and 5 forks are written here (the docs only promise them).
const f10Sort = p => (a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y);
const f10Sick = e => corroded(e) || snared(e) || charged(e) || f_burning(e) || f_bleeding(e) || f_possessed(e); // carries a status First Contact can react to

feat({ id: 'standard_procedure', sample: 'baseline', name: 'Standard Procedure', icon: 'SP', ico: 'nova', type: 'force', atk: 'burst', rar: 0, stam: 14,
  line: `"Step one: everyone else, away from you."`, does: 'A clean ring of Force pulses out of you and knocks nearby enemies away. Handy when the screen gets crowded.',
  base: { dmg: 18, cd: 9, area: 130 },
  stat: (w, s) => { if (f10Fk(w, 'extra')) s.area *= 1.4; if (f10Fk(w, 'fast')) s.cd *= 0.7; },
  when: w => { const p = me(); return f10Near(p.x, p.y, w.s.area).length ? {} : null; },
  fire: w => {
    const p = me(), s = w.s, firm = f10Fk(w, 'firm');
    const pulse = k => { if (!G || G.state !== 'play') return; const q = me(), l = f10Near(q.x, q.y, s.area); f10Burst(w, q.x, q.y, s.area, s.dmg * k, null); for (const e of l) { f10Shove(e, q.x, q.y, 380 * k * (firm ? 1.5 : 1)); if (firm && !e.dead) f10Stagger(e, 0.7); } };
    pulse(1); ring(p.x, p.y, s.area, w.def.color, 0.4, 3); if (f10Fk(w, 'double')) after(0.4, () => pulse(0.6));
  },
  forks: { 3: [fk('double', 'Second Dose', 'A second, smaller pulse 0.4 seconds later.'), fk('firm', 'Firm Handling', 'The pulse shoves 50% harder and staggers what it hits.')],
    5: [fk('extra', 'Extra Strength', 'A 40% wider pulse.'), fk('fast', 'Fast Acting', 'A much shorter cooldown.')] } });

feat({ id: 'personal_best', sample: 'alpha', name: 'Personal Best', icon: 'PB', ico: 'wake', type: 'static', atk: 'contact', rar: 0, stam: 20,
  line: `"Go! GO! Beat your time! Beat EVERYONE'S time!"`, does: 'You burst forward in a fast sprint, leaving a Static wake. Every enemy you strike extends the sprint, so pick a good line through the crowd.',
  base: { dmg: 14, cd: 10, dur: 1.5 },
  stat: (w, s) => { if (f10Fk(w, 'longer')) s.dur += 1; if (f10Fk(w, 'second')) s.cd *= 0.7; },
  when: w => { const p = me(), D = f10(); return !(D.pb && D.pb.end > G.t) && f10Near(p.x, p.y, 420).length ? {} : null; },
  fire: w => { const D = f10(), s = w.s; D.pb = { w, t0: G.t, end: G.t + s.dur, max: G.t + s.dur + 2.5, tk: 0, hit: new Set(), ext: f10Fk(w, 'pace') ? 0.6 : 0.3 }; floatText(me().x, me().y - 34, 'GO', w.def.color, 16, 0.7); },
  forks: { 3: [fk('pace', 'Pace Setter', 'Each enemy you strike extends the sprint twice as much.'), fk('slip', 'Slipstream', 'The wake lingers three times as long.')],
    5: [fk('longer', 'Longer Run', 'The sprint lasts a second longer.'), fk('second', 'Second Lap', 'A much shorter cooldown.')] } });

feat({ id: 'second_wind', sample: 'beta', name: 'Second Wind', icon: 'SW', ico: 'heart', type: 'blood', atk: 'burst', rar: 0, stam: 22,
  line: `"They look so full. You look so empty. Fix that."`, does: 'You drain Blood from the wounded enemies around you and heal. The lower your health, the more every drop is worth.',
  base: { dmg: 10, cd: 11, area: 220 },
  stat: (w, s) => { if (f10Fk(w, 'wide')) s.area *= 1.4; if (f10Fk(w, 'again')) s.cd *= 0.7; },
  when: w => { const p = me(); return f10Near(p.x, p.y, w.s.area).some(e => e.hp < e.maxHp) ? {} : null; },
  fire: w => {
    const p = me(), s = w.s, miss = Math.max(0, 1 - p.hp / G.P.maxHp);
    const list = f10Near(p.x, p.y, s.area).filter(e => e.hp < e.maxHp).sort(f10Sort(p)).slice(0, f10Fk(w, 'plenty') ? 8 : 6);
    let h = 0;
    for (const e of list) { bolt(e.x, e.y, p.x, p.y, w.def.color, 0.2); h += 0.012 * (1 + 3 * miss) * (f10Fk(w, 'rich') ? 1.3 : 1); f10Hit(w, e, s.dmg, 'burst'); }
    ring(p.x, p.y, s.area * 0.5, w.def.color, 0.35, 3);
    if (h > 0) { healPlayer(G.P.maxHp * Math.min(0.4, h * s.k)); floatText(p.x, p.y - 36, 'Second wind.', w.def.color, 13, 0.9); }
  },
  forks: { 3: [fk('wide', 'Deep Breath', 'A 40% wider reach.'), fk('rich', 'Rich Blood', 'Every drop heals 30% more.')],
    5: [fk('again', 'Catching Up', 'A much shorter cooldown.'), fk('plenty', 'Plenty More', 'It drains from two more enemies.')] } });

feat({ id: 'pulling_strings', sample: 'private', name: 'Pulling Strings', icon: 'PS', ico: 'link', type: 'acid', atk: 'burst', rar: 0, stam: 20,
  line: `"That one. The one in the good suit. Make it a problem."`, does: 'You mark the toughest enemy nearby. It builds Corrosion fast while the enemies around it fill with Alien, so its own entourage is soon ready to turn on it.',
  base: { dmg: 6, cd: 12, dur: 4, range: 380 },
  stat: (w, s) => { if (f10Fk(w, 'leash')) s.range *= 1.4; if (f10Fk(w, 'short')) s.cd *= 0.7; },
  when: w => { const p = me(); return f10Near(p.x, p.y, w.s.range).length ? {} : null; },
  fire: w => {
    const p = me(), s = w.s, D = f10(), n = f10Fk(w, 'two') ? 2 : 1;
    const l = f10Near(p.x, p.y, s.range).sort((a, b) => b.maxHp - a.maxHp);
    D.marks = D.marks || [];
    for (const e of l.slice(0, n)) {
      D.marks = D.marks.filter(M => M.e !== e); D.marks.push({ e, end: G.t + s.dur, r: f10Fk(w, 'entourage') ? 260 : 170, rate: 0.6 * s.k, w });
      ring(e.x, e.y, e.r + 14, w.def.color, 0.5, 4); f10Hit(w, e, s.dmg, 'burst'); floatText(e.x, e.y - e.r - 14, 'That one.', w.def.color, 12, 0.9);
    }
  },
  forks: { 3: [fk('entourage', 'Big Entourage', 'The Alien spreads to enemies much further from the mark.'), fk('leash', 'Long Leash', 'A 40% longer reach for choosing the mark.')],
    5: [fk('two', 'Two Marks', 'Mark the two toughest enemies.'), fk('short', 'Shorter Leash', 'A much shorter cooldown.')] } });

feat({ id: 'shrink_wrap', sample: 'ordered', name: 'Shrink Wrap', icon: 'SH', ico: 'web', type: 'mucus', atk: 'burst', rar: 0, stam: 22,
  line: `"Fragile. Handle with care. Actually, don't handle."`, does: 'A ring of enemies around you is Snared in Mucus, and half a second later an Acid Pool bubbles up beneath them. Trap first, dissolve second.',
  base: { dmg: 8, cd: 11, area: 170, dur: 3.5 },
  stat: (w, s) => { if (f10Fk(w, 'wide')) s.area *= 1.4; if (f10Fk(w, 'slow')) s.dur *= 1.6; if (f10Fk(w, 'strong')) s.dmg *= 1.5; if (f10Fk(w, 'refund')) s.cd *= 0.7; },
  when: w => { const p = me(); return f10Near(p.x, p.y, w.s.area).length ? {} : null; },
  fire: w => {
    const p = me(), s = w.s, l = f10Near(p.x, p.y, s.area).sort(f10Sort(p)).slice(0, 10);
    f10Many(w, l, s.dmg, 'burst'); for (const e of l) if (!e.dead) fightStatus(e, 'ice', 0, {});
    ring(p.x, p.y, s.area, w.def.color, 0.4, 4);
    after(0.5, () => { if (!G || G.state !== 'play') return; let n = 0; for (const e of l) if (!e.dead && n < 5) { n++; f10Patch(w, e.x, e.y, 62, s.dur, 'acid', s.dmg * 3); } });
  },
  forks: { 3: [fk('wide', 'Bigger Roll', 'A 40% wider ring.'), fk('slow', 'Slow Dissolve', 'The Acid Pools last 60% longer.')],
    5: [fk('strong', 'Industrial Strength', 'The Pools and the first hit are 50% stronger.'), fk('refund', 'Return Policy', 'A much shorter cooldown.')] } });

feat({ id: 'reply_all', sample: 'redtail', name: 'Reply All', icon: 'RA', ico: 'spray', type: 'fire', atk: 'beam', rar: 0, stam: 22,
  line: `"I replied to everyone. EVERYONE. Look how warm they are."`, does: 'You fill the nearest enemy\'s Burn bar at once. Static arcs from it spread more Burn to the enemies around it.',
  base: { dmg: 12, cd: 10, range: 320, area: 170 },
  stat: (w, s) => { if (f10Fk(w, 'wide')) s.area *= 1.4; if (f10Fk(w, 'auto')) s.cd *= 0.7; },
  when: w => { const p = me(), t = acquire('nearest', w.s.range, p.x, p.y); return t ? { t } : null; },
  fire: (w, c) => {
    const p = me(), s = w.s, t = c.t; if (!t || t.dead) return;
    const heads = [t]; if (f10Fk(w, 'bcc')) { const o = f10Near(p.x, p.y, s.range).sort(f10Sort(p)).find(e => e !== t); if (o) heads.push(o); }
    for (const h of heads) {
      bolt(p.x, p.y, h.x, h.y, w.def.color, 0.15); fightCd(h).bars.fire = 0.9999999; f10Hit(w, h, s.dmg, 'beam');
      if (h.dead) continue; burnAdd(fightCd(h), s.dmg * 4); h.chargeT = G.t + 3;
      const near = f10Near(h.x, h.y, s.area).filter(e => e !== h).sort(f10Sort(h)).slice(0, f10Fk(w, 'thread') ? 6 : 3);
      for (const o of near) { bolt(h.x, h.y, o.x, o.y, F10_COL.static, 0.15); damageEnemy(o, s.dmg * 0.5, { elem: 'shock', arc: true, noArc: true, noCrit: true, atk: 'burst', wname: 'Reply All' }); if (!o.dead) burnAdd(fightCd(o), s.dmg * 4); }
    }
  },
  forks: { 3: [fk('thread', 'Reply to Thread', 'The arcs reach six enemies instead of three.'), fk('wide', 'Everyone in CC', 'A 40% wider reach for the arcs.')],
    5: [fk('bcc', 'Bcc', 'The second-nearest enemy catches fire too.'), fk('auto', 'Auto-Reply', 'A much shorter cooldown.')] } });

feat({ id: 'recount', sample: 'prawn', name: 'Recount', icon: 'RC', ico: 'ghost', type: 'soul', atk: 'burst', rar: 0, stam: 28,
  line: `"Let's count again. Six of you. Three seconds. Be nice."`, does: 'You Possess up to six enemies for three seconds. When it ends, each of them loses a chunk of health, and every kill gives some stamina back.',
  base: { dmg: 40, cd: 14, range: 340, dur: 3 },
  stat: (w, s) => { if (f10Fk(w, 'audit')) s.dmg *= 1.5; if (f10Fk(w, 'quick')) s.cd *= 0.7; if (f10Fk(w, 'long')) s.dur += 1; },
  when: w => { const p = me(); return f10Near(p.x, p.y, w.s.range).some(e => !e.boss && !e.rival) ? {} : null; },
  fire: w => {
    const p = me(), s = w.s, D = f10(), n = f10Fk(w, 'sheet') ? 8 : 6;
    const l = f10Near(p.x, p.y, s.range).filter(e => !e.boss && !e.rival && !e.charmed).sort(f10Sort(p)).slice(0, n);
    for (const e of l) { curseFoe(e, s.dur); ring(e.x, e.y, e.r + 8, w.def.color, 0.4, 3); }
    D.recounts = D.recounts || []; D.recounts.push({ list: l, end: G.t + s.dur, w });
    floatText(p.x, p.y - 36, 'One, two...', w.def.color, 13, 0.9);
  },
  forks: { 3: [fk('sheet', 'Spreadsheet', 'Possess up to eight enemies instead of six.'), fk('audit', 'Audit', 'The delayed hit is 50% bigger.')],
    5: [fk('long', 'Long Meeting', 'The Possession lasts a second longer.'), fk('quick', 'Quick Count', 'A much shorter cooldown.')] } });

feat({ id: 'first_contact', sample: 'alien', name: 'First Contact', icon: 'FC', ico: 'twins', rar: 0, stam: 0,
  line: `"Oh, you're different now. Say hello to everyone."`, does: 'You shift to your next damage type at once. For reactions only, you count as a hit of the old type and the new type on every enemy on screen carrying a status (eight at most, nearest first). No damage, no build-up.',
  base: { cd: 14, dmg: 30 },
  stat: (w, s) => { if (f10Fk(w, 'quickintro')) s.cd *= 0.7; if (f10Fk(w, 'firm')) s.dmg *= 1.5; },
  when: w => (G.enemies.some(e => f10Live(e) && f10OnView(e) && f10Sick(e)) ? {} : null),
  fire: w => {
    const p = me(), D = f10(), s = w.s, cyc = S10_BY.alien.shift, S = G.s10;
    let from, to;
    if (S && S.id === 'alien') { from = cyc[S.shiftI]; s10Shift(S); to = cyc[S.shiftI]; }
    else { const i = D.fcI == null ? 0 : D.fcI; from = cyc[i]; D.fcI = (i + 1) % cyc.length; to = cyc[D.fcI]; }
    D.fcType = FIGHT_TYPE[to];
    const types = [FIGHT_TYPE[from], FIGHT_TYPE[to]], list = G.enemies.filter(e => f10Live(e) && f10OnView(e) && f10Sick(e)).sort(f10Sort(p));
    let used = 0;
    for (const e of list) {
      if (used >= 8) break;
      const once = { n: 0 }, src = { raw: s.dmg, once, kx: e.x - p.x, ky: e.y - p.y };
      let fired = false; for (const t of types) { if (fired || e.dead) break; fired = fightReactAs(e, t, src); }
      if (fired) { used++; if (f10Fk(w, 'icebreaker') && !e.dead) f10Stagger(e); }
    }
    D.fcUsed = used;
    if (f10Fk(w, 'warm') && used) healPlayer(G.P.maxHp * 0.02 * used);
    ring(p.x, p.y, 120, w.def.color, 0.5, 4); floatText(p.x, p.y - 40, 'Hello.', w.def.color, 13, 0.9);
  },
  forks: { 3: [fk('warm', 'Warm Handshake', 'You heal 2% of your health for every reaction it sets off.'), fk('firm', 'Firm Handshake', 'Reactions it sets off hit 50% harder.')],
    5: [fk('quickintro', 'Quick Introductions', 'A much shorter cooldown.'), fk('icebreaker', 'Icebreaker', 'Every enemy it sets off a reaction on is staggered.')] } });

// Per-frame work for the Unique Feats (f10Tick).
function f10UniqueTick(D, p, dt) {
  const B = D.pb;
  if (B) {
    if (G.t >= B.end) D.pb = null;
    else {
      if ((B.tk -= dt) <= 0) { B.tk = 0.12; f10Patch(B.w, p.x, p.y, 28, f10Fk(B.w, 'slip') ? 3.6 : 1.2, 'static', B.w.s.dmg * 1.2); fxParts('spark', p.x, p.y, F10_COL.static, 2, 60, 0.3, 2); }
      for (const e of f10Near(p.x, p.y, p.r + 26)) {
        if (B.hit.has(e)) continue;
        B.hit.add(e); f10Hit(B.w, e, B.w.s.dmg, 'contact'); f10Shove(e, p.x, p.y, 240);
        B.end = Math.min(B.max, B.end + B.ext); bolt(p.x, p.y, e.x, e.y, F10_COL.static, 0.1);
      }
    }
  }
  if (D.marks && D.marks.length) {
    for (const M of D.marks) {
      if (M.end <= G.t || M.e.dead) { M.done = true; continue; }
      const c = fightCd(M.e); c.bars.acid = Math.min(0.9999999, c.bars.acid + M.rate * dt); c.barQuietT.acid = 0;
      for (const o of f10Near(M.e.x, M.e.y, M.r)) if (o !== M.e) { const q = fightCd(o); q.bars.soul = Math.min(0.99, q.bars.soul + 0.35 * dt); q.barQuietT.soul = 0; }
    }
    D.marks = D.marks.filter(M => !M.done);
  }
  if (D.recounts && D.recounts.length) {
    for (const R of D.recounts) {
      if (G.t < R.end || (R.list.some(e => !e.dead && e.charmed) && G.t < R.end + 3)) continue;
      R.done = true; const s = R.w.s;
      for (const e of R.list) {
        if (e.dead) continue;
        f10Hit(R.w, e, Math.max(s.dmg, Math.min(e.maxHp * 0.25, s.dmg * 5)), 'burst'); ring(e.x, e.y, e.r + 8, R.w.def.color, 0.3, 3);
        if (e.dead && G.stam) { G.stam.cur = Math.min(stamMax(), G.stam.cur + 8); floatText(e.x, e.y - 14, '+stamina', F10_COL.soul, 11, 0.6); }
      }
    }
    D.recounts = D.recounts.filter(R => !R.done);
  }
}

// samples10.js s10Start: the sample's own Feat goes in slot 1.
function s10UniqueFeat(id) { const fid = F10_UNIQUE[id]; if (fid && G) { const w = f10Own(fid) || f10Give(fid, 1); if (w) w.cd = 0; } }
