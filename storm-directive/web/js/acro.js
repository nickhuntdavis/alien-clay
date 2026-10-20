'use strict';
// Spawn Prawn - Sample 9's three weapons and their branches (PROPOSED; spec: ../redesign docs/SAMPLE_9_ACRO.md,
// BASE_WEAPONS.md 8, WEAPON_UPGRADES.md 25 to 27). Every player-facing string is a TODO_COPY placeholder.
//  - acro_cap (Acid Contact), acro_spray (Acid Spread), acro_spark (Fire Beam). They join the W24 roster (starter of
//    'acro', a sample that doesn't exist yet), so any sample can draft them.
//  - One dispatcher per hook kind reads the flags the cards set on w.ac (promise in w.ac.p; Lv 6 and Lv 10 cards set a
//    flag each), as wup1.js does. Base behaviour (the Corrosion bonus, the 4th-hit lunge, the beam's targeting) needs no card,
//    so the branch engine's hooks are wrapped here instead of using wupOn: wupStats, wupFire, wupDmgMul, wupHit, wupKill,
//    wupTick, and hurtPlayer (two Hard hat cards and one Drilling card react to hits you take). No shared file is edited.
//  - "Corroded" means the visible Corroded state (e.corrodedT, no Shell left), not fight.js corroded()'s part-filled bar.
//    The beam waits for the strip: Corroded first, then enemies a Fire hit can't wipe, then Shelled enemies with a filling bar.
// Simplifications (flagged in the report): pools don't merge (12.7) beyond Drizzle's grow card; the pellet fuse card raises
// the second pellet's damage instead of merging two shots; the drilling cap hits only its target (the lash can't miss sideways).
// Hooks: none in shared files. index.html loads this after wup6.js (needs wup2.js w2* helpers, weapons24.js, modifiers.js modS).
(function () {
  if (typeof V10 === 'undefined' || !V10 || typeof W24 === 'undefined') return;
  const CAP = 'acro_cap', SPRAY = 'acro_spray', SPARK = 'acro_spark', IDS = [CAP, SPRAY, SPARK];
  const T = id => (typeof ACRO_COPY !== 'undefined' && ACRO_COPY[id]) || 'TODO_COPY:' + id;
  const PINK = TYPE_PAL.fire, ORANGE = TYPE_PAL.flame, TWO = Math.PI * 2;

  // ------------------------------------------------------------ the weapons
  const DEFS = {
    [CAP]: { type: 'fire', atk: 'contact', kind: 'melee', melee: 'lash', icon: '9C', ico: 'tooth',
      base: Object.assign({}, V10_ATK.contact.base, { dmg: 34, cd: 0.6, mag: 4, reload: 1.0, range: 70, reach: 70, width: 22, knock: 0 }) },
    [SPRAY]: { type: 'fire', atk: 'spread', kind: 'gun', icon: '9S', ico: 'spray',
      base: Object.assign({}, V10_ATK.spread.base, { dmg: 14, cd: 0.9, count: 3, spread: 0.5, range: 160, speed: 480, knock: 10 }) },
    [SPARK]: { type: 'flame', atk: 'beam', kind: 'gun', icon: '9B', ico: 'bigbeam',
      base: Object.assign({}, V10_ATK.beam.base, { dmg: 4, cd: 0.1, mag: 12, reload: 1.0, range: 180, width: 8 }) },
  };
  for (const id of IDS) {
    const D = DEFS[id], A = V10_ATK[D.atk], name = T({ [CAP]: 'w25', [SPRAY]: 'w26', [SPARK]: 'w27' }[id] + '_name'), desc = T(id + '_desc');
    WEAPONS[id] = { name, desc, play: desc, stars: [3, 3, 3, 3], icon: D.icon, elem: D.type, kind: D.kind, melee: D.melee, color: V10_COL[D.type],
      dir: 'nearest', role: A.label, v10: 1, v10atk: D.atk, v10type: D.type, w24: 1, archived: 0, acro: 1, base: D.base, lv: {} };
    if (typeof ICON_OF !== 'undefined') ICON_OF[id] = D.ico;
    W24.push([id, name, D.type, D.atk, 'acro']); W24_IDS.push(id);
    W24_BY[id] = { id, name, type: D.type, atk: D.atk, starter: 'acro' }; W24_DESC[id] = desc;
  }

  // ------------------------------------------------------------ helpers
  const F = w => w.ac || (w.ac = { n: 0 });
  const R = () => G.ac || (G.ac = { pools: [] });
  const isAc = w => !!(w && w.def && w.def.acro);
  const has = (w, k) => !!F(w)[k];
  const shelled = e => { const c = fightCd(e); return c.def === 'shell' && c.layers > 0; };
  const corrodedNow = e => e.corrodedT > G.t;
  const near = (x, y, r, f) => { const o = []; forNear(x, y, r, e => { if (!e.dead && !e.charmed && !e.phased && !e.egg && (!f || f(e))) o.push(e); }); return o; };
  const nearest = (x, y, r, f, not) => { let b = null, bd = 1e9; for (const e of near(x, y, r, f)) { if (e === not) continue; const d = Math.hypot(e.x - x, e.y - y); if (d < bd) { bd = d; b = e; } } return b; };
  const src = (w, extra) => Object.assign(weaponSrc(w), { atk: w.def.v10atk }, extra || {});
  const card = (w, extra) => Object.assign(weaponSrc(w), { atk: w.def.v10atk, wupEcho: true, noCrit: true, noProc: true }, extra || {});
  // Fill a bar by a share of the hit (k = extra multiples) and pay it off like the resolver; returns 'strip' | 'corrode' | 'ignite' | null.
  function acid(e, raw, k, s) { if (!e.cd || e.dead || !(k > 0)) return null; return w2BarBump(e, 'acid', w2AcidFrac(e, raw) * k, s); }
  function burn(e, raw, k, s) {
    if (e.dead || !(k > 0)) return null; const c = fightCd(e), sz = COMBAT.barSize.fire * COMBAT.rankBarK[c.rank || 'normal'] * c.maxHp;
    c.bars.fire += raw * k / sz; c.barQuietT.fire = 0;
    if (c.bars.fire < 1) return null; c.bars.fire = 0; fightPayoff(e, 'ignite', { raw }, s || {}); return 'ignite';
  }
  function payNow(e, s) { if (!e.cd || e.dead) return null; return w2BarBump(e, 'acid', Math.max(0.001, 1.001 - e.cd.bars.acid), s); } // strip a layer, or Corrode
  function lungeTo(tx, ty, dist) { // forward lunge (modifiers.js runs it)
    const p = G.player, S = modS(); if (S.lunge && S.lunge.left > 0) return false;
    const a = Math.atan2(ty - p.y, tx - p.x); S.lunge = { ux: Math.cos(a), uy: Math.sin(a), left: dist, v: dist / 0.22 }; return true;
  }
  function recoilFrom(x, y, dist) { const p = G.player, S = modS(); if (S.lunge && S.lunge.left > 0) return; const dx = p.x - x, dy = p.y - y, l = Math.hypot(dx, dy) || 1; S.lunge = { ux: dx / l, uy: dy / l, left: dist, v: dist / 0.22 }; }
  function inLane(x1, y1, x2, y2, wd) { return near((x1 + x2) / 2, (y1 + y2) / 2, Math.hypot(x2 - x1, y2 - y1) / 2 + wd + 30, e => w2SegDist(e.x, e.y, x1, y1, x2, y2) <= e.r + wd); }
  function pool(w, x, y, r, life, dps) { // a standard Acid Pool from this weapon (11.6)
    const z = w2Zone(w, x, y, r, life, dps, { elem: 'fire', color: PINK, src: w2Base(w, { wupEcho: true, atk: 'pool', zoneHit: true, acPool: true, elem: 'fire' }) });
    if (z) ring(x, y, r, PINK, 0.3, 3); return z;
  }
  function footprint(w, x, y, r, life) { // a Fire Pool footprint: burns, sets off no reaction
    return w2Zone(w, x, y, r, life, w.s.dmg * 3, { elem: 'flame', color: ORANGE, src: w2Base(w, { wupEcho: true, atk: 'pool', zoneHit: true, noRx: true, elem: 'flame' }) });
  }
  const say = (e, txt, c) => { if (!(e.acSayT > G.realT)) { e.acSayT = G.realT + 0.6; floatText(e.x, e.y - e.r - 12, txt, c || PINK, 11, 0.5); } };

  // ------------------------------------------------------------ strips (any of the cap's or spray's hits that took a layer)
  function onStrip(w, e, wasLast) {
    const f = F(w), p = G.player;
    f.strips = (f.strips || 0) + 1;
    if (w.def === WEAPONS[CAP]) {
      if (f.p === 'A' && has(w, 'a6a') && wasLast) { const n = nearest(e.x, e.y, 200, null, e); if (n && lungeTo(n.x, n.y, Math.min(200, Math.hypot(n.x - p.x, n.y - p.y)))) { f.tgt = n; ring(p.x, p.y, 24, PINK, 0.3, 3); } }
      if (f.p === 'A' && has(w, 'aw')) for (const o of near(e.x, e.y, 150, null).filter(o => o !== e).slice(0, 2)) { w2Line(e.x, e.y, o.x, o.y, 3, PINK, 0.15); damageEnemy(o, w.s.dmg * 0.4, card(w, { atk: 'proj' })); }
      if (f.p === 'C') { const D = pdef(), cap = has(w, 'm3') ? 6 : 3; if (D.layers < cap) { D.layers++; if (D.layerHp <= 0) D.layerHp = G.P.maxHp * COMBAT.shellLayerHpFrac; ring(p.x, p.y, p.r + 10, FIGHT_COL.shell, 0.35, 4); } }
    }
    if (w.def === WEAPONS[SPRAY] && f.p === 'C') {
      if (has(w, 'c6a') && !(f.freeT > G.t)) { f.freeT = G.t + 1; after(0.05, () => { if (G && G.weapons.includes(w)) { const t = nearest(p.x, p.y, w.s.range, shelled) || nearest(p.x, p.y, w.s.range); if (t) volley(w, t, src(w)); } }); }
    }
  }

  // ------------------------------------------------------------ firing (wupFire): true = this replaced the normal shot
  function volley(w, t, s, x0, y0, n0) { // one fan of pellets at t (spray)
    const p = G.player, x = x0 == null ? p.x : x0, y = y0 == null ? p.y : y0, n = n0 || w.s.count, a = Math.atan2(t.y - y, t.x - x);
    for (let i = 0; i < n; i++) spawnProj(w, x, y, a + (n > 1 ? (i / (n - 1) - 0.5) * w.s.spread : 0) + rand(-0.03, 0.03), s);
    F(w).vol = (F(w).vol || 0) + 1; F(w).volHit = new Map();
  }
  function fireCap(w, t, s) {
    const f = F(w), p = G.player; f.n++;
    if (has(w, 'c6a') && pdef().layers > 0) s.knock = 200;
    if (f.p === 'B') { breach(w, t, s, 140, 0); return true; }
    if (f.p === 'A') { // drilling: one target at a time
      if (!f.tgt || f.tgt.dead || Math.hypot(f.tgt.x - p.x, f.tgt.y - p.y) > w.s.reach + f.tgt.r + 20) { if (f.tgt !== t) f.stack = 0; f.tgt = t; }
      const e = f.tgt; p.face = Math.atan2(e.y - p.y, e.x - p.x);
      damageEnemy(e, w.s.dmg, Object.assign({}, s, { kx: Math.cos(p.face), ky: Math.sin(p.face) }));
      G.fx.push({ type: 'swing', x: p.x, y: p.y, a: p.face, arc: 0.5, r: w.s.reach, color: PINK, life: 0.18, max: 0.18 });
      f.stack = Math.min(7, (f.stack || 0) + 1);
      if (f.stack >= 7 && !e.dead && (f.since = (f.since || 0) + 1) % 7 === 1) { const wasLast = shelled(e) && fightCd(e).layers === 1; if (payNow(e, s) === 'strip') onStrip(w, e, wasLast); }
      if (f.n % 4 === 0) fourth(w, e, s);
      return true;
    }
    if (f.n % 4 === 0) after(0, () => { if (G && !t.dead) fourth(w, t, s); });
    return false; // the lash fires as normal
  }
  function fourth(w, t, s) { // every 4th hit: a lunge through the target (Every Nth + Lunge); M1 strips outright
    const p = G.player, d = Math.hypot(t.x - p.x, t.y - p.y);
    lungeTo(t.x, t.y, Math.min(120, d + t.r + 20));
    if (has(w, 'm1') && !t.dead) { const wasLast = shelled(t) && fightCd(t).layers === 1, r = payNow(t, s); if (r) { say(t, 'x4', PINK); if (r === 'strip') onStrip(w, t, wasLast); } }
  }
  function breach(w, t, s, L0, depth) { // B: every hit a lunge through the lane
    const f = F(w), p = G.player, a = Math.atan2(t.y - p.y, t.x - p.x), L = Math.min(L0, Math.hypot(t.x - p.x, t.y - p.y) + t.r + 30);
    const x2 = p.x + Math.cos(a) * L, y2 = p.y + Math.sin(a) * L, lane = inLane(p.x, p.y, x2, y2, 22).sort((u, v) => Math.hypot(u.x - p.x, u.y - p.y) - Math.hypot(v.x - p.x, v.y - p.y));
    if (has(w, 'b6b')) for (const z of G.zones) if (z.elem === 'fire' && z.life > 0 && w2SegDist(z.x, z.y, p.x, p.y, x2, y2) < z.r) { f.coat = 3; break; }
    lane.forEach((e, i) => {
      damageEnemy(e, w.s.dmg * 0.8, Object.assign({}, s, { kx: Math.cos(a), ky: Math.sin(a), acLane: 1 }));
      if (has(w, 'b6a') && i && !e.dead) acid(e, w.s.dmg * 0.8, Math.min(1, 0.1 * i), s);
      if (f.coat > 0 && !e.dead) { f.coat--; pool(w, e.x, e.y, 35, 2, w.s.dmg * 0.6); }
      if (e.dead && has(w, 'm2') && depth < 5) f.chain = depth + 1;
    });
    w2Line(p.x, p.y, x2, y2, 10, PINK, 0.2); lungeTo(x2, y2, L);
    if (has(w, 'bw') && !depth) after(0.32, () => { if (G && G.weapons.includes(w)) { const q = G.player, back = nearest(q.x - Math.cos(a) * 80, q.y - Math.sin(a) * 80, 90); if (back) breach(w, back, s, 140, 9); } });
    if (f.chain) { const k = f.chain; f.chain = 0; after(0.24, () => { if (!G || !G.weapons.includes(w)) return; const q = G.player, n = nearest(q.x, q.y, 140); if (n) breach(w, n, s, 140, k); }); }
  }
  function fireSpray(w, t, s) {
    const f = F(w), p = G.player; f.vn = (f.vn || 0) + 1; f.volHit = new Map();
    if (f.p === 'A') {
      const d = Math.hypot(t.x - p.x, t.y - p.y); w.s.count = Math.round((has(w, 'm3') ? 2 : 1) * (3 + clamp(Math.floor((160 - d) / 40), 0, 4))); // (3 to 7 pellets)
      if (has(w, 'a6b') && d < 70) recoilFrom(t.x, t.y, 45);
      if (has(w, 'aw') && f.vn % 6 === 0) { for (let i = 0; i < 12; i++) spawnProj(w, p.x, p.y, i / 12 * TWO, s); ring(p.x, p.y, 40, PINK, 0.3, 3); return true; }
    }
    if (f.rapid) { f.rapid = 0; for (const k of [0.12, 0.24]) after(k, () => { if (G && G.weapons.includes(w)) { const q = nearest(G.player.x, G.player.y, w.s.range + 60); if (q) volley(w, q, s); } }); }
    if (f.p === 'C') { const sh = nearest(p.x, p.y, w.s.range + 40, shelled); volley(w, sh || t, s); return true; }
    return false;
  }
  // The beam's target order: Corroded (no Shell left) first; then anything a Fire hit can't wipe; then Shelled enemies with a filling bar.
  const sparkRank = e => (corrodedNow(e) && !shelled(e) ? 0 : !corroded(e) ? 1 : 2);
  function sparkTargets(w, x, y, r) { return near(x, y, r).sort((a, b) => sparkRank(a) - sparkRank(b) || Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)); }
  function beam(w, x1, y1, x2, y2, wd, k, s, skip) {
    const hit = inLane(x1, y1, x2, y2, wd).filter(e => !(skip && skip.includes(e)));
    for (const e of hit) damageEnemy(e, w.s.dmg * k, s);
    (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: x1, y: y1, x2, y2, w: wd, c: ORANGE, t: 'flame', life: 0.12, max: 0.12 });
    if (has(w, 'aw') && !(F(w).fpT > G.t)) { F(w).fpT = G.t + 0.35; for (let i = 1; i <= 3; i++) footprint(w, x1 + (x2 - x1) * i / 3, y1 + (y2 - y1) * i / 3, 18, 1); }
    return hit;
  }
  function fireSpark(w, t, s) {
    const f = F(w), p = G.player, wd = w.s.width * (f.wideT > G.t ? 2 : 1);
    if (f.p === 'B') { // spark gap: anchored between Corroded enemies
      // Anchors: Corroded enemies first, then any with Corrosion building (fight.js corroded(): bar above 15%). A Shelled
      // anchor isn't burnt by its own string, so the Fire never wipes progress towards a layer; on an unshelled one the
      // reaction is the payoff (Premature Evaporation's burst). Everything between the anchors burns.
      const A = near(p.x, p.y, has(w, 'b6b') ? 380 : w.s.range + 80, e => corroded(e)).sort((a, b) => (corrodedNow(b) && !shelled(b)) - (corrodedNow(a) && !shelled(a)) || Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y)).slice(0, has(w, 'b6a') ? 3 : 2);
      // The chain starts at you: you to the nearest anchor, then anchor to anchor (x1.4). No anchors: an ordinary beam.
      if (!A.length) { const t0 = sparkTargets(w, p.x, p.y, w.s.range)[0]; if (t0) beam(w, p.x, p.y, t0.x, t0.y, wd, 1, s); return true; }
      const spare = A.filter(shelled), me0 = { x: p.x, y: p.y };
      beam(w, me0.x, me0.y, A[0].x, A[0].y, wd, 1, s, spare); p.face = Math.atan2(A[0].y - p.y, A[0].x - p.x);
      const segs = A.length === 3 ? [[A[0], A[1]], [A[1], A[2]], [A[2], A[0]]] : A.length === 2 ? [[A[0], A[1]]] : [];
      for (const [a, b] of segs) beam(w, a.x, a.y, b.x, b.y, wd, 1.4, s, spare);
      if (has(w, 'bw')) for (const [a, b] of segs) { w2Pull(a, b.x, b.y, 60, 0.1); w2Pull(b, a.x, a.y, 60, 0.1); }
      if (has(w, 'm1')) { const o = sparkTargets(w, p.x, p.y, w.s.range).find(e => !A.includes(e)); if (o) beam(w, p.x, p.y, o.x, o.y, wd, 1, s); }
      return true;
    }
    let a;
    if (f.p === 'C') { // paint the slide: points where you swim
      a = f.head == null ? p.face || 0 : f.head;
      if (has(w, 'cw') && f.still > 0.4) a += Math.sin(G.t * 3) * 1.2;
      const L = w.s.range, x2 = p.x + Math.cos(a) * L, y2 = p.y + Math.sin(a) * L;
      for (const e of beam(w, p.x, p.y, x2, y2, wd * (has(w, 'm3') ? 2 : 1), 1, s)) if (!e.dead) burn(e, w.s.dmg, 0.5, s);
      if (has(w, 'c6b') && !(f.tipT > G.t)) { f.tipT = G.t + 0.25; footprint(w, x2, y2, 22, 1); }
      return true;
    }
    const list = sparkTargets(w, p.x, p.y, w.s.range), n = (has(w, 'm1') ? 2 : 1) + (f.splitT > G.t ? 1 : 0);
    for (const e of list.slice(0, n)) { p.face = Math.atan2(e.y - p.y, e.x - p.x); beam(w, p.x, p.y, e.x, e.y, wd, 1, s); }
    return true;
  }

  // ------------------------------------------------------------ the hook wrappers
  const _stats = wupStats, _fire = wupFire, _mul = wupDmgMul, _hit = wupHit, _kill = wupKill, _tick = wupTick, _hurt = hurtPlayer;
  wupStats = function (w, s) {
    _stats(w, s); if (!isAc(w)) return;
    w.uh = w.uh || {}; // (game.js only asks wupFire when the slot has hooks)
    const f = F(w);
    if (w.def === WEAPONS[SPRAY]) { if (f.p === 'A') s.range *= 0.6; if (has(w, 'm3')) { s.count *= 2; s.dmg *= 0.6; } }
    if (w.def === WEAPONS[SPARK] && has(w, 'm3')) s.cd *= 0.5;
  };
  wupFire = function (w, t, s) {
    if (isAc(w) && t) { const D = w.def; if ((D === WEAPONS[CAP] ? fireCap : D === WEAPONS[SPRAY] ? fireSpray : fireSpark)(w, t, s)) return true; }
    return _fire(w, t, s);
  };
  wupDmgMul = function (e, s) {
    let k = _mul(e, s); const w = s && s.w; if (!isAc(w)) return k;
    const f = F(w);
    e.acPre = corroded(e); // (for the hit hook: did this hit set off Premature Evaporation?)
    if (w.def === WEAPONS[CAP]) {
      if (f.p === 'A' && f.tgt === e && !s.wupEcho) k *= 1 + 0.15 * (f.stack || 0);
      if (f.p === 'C') k *= 0.75 * (has(w, 'm3') ? 1 + 0.15 * pdef().layers : 1);
    }
    if (w.def === WEAPONS[SPRAY]) {
      if (s.acPool) return k;
      if (f.p === 'B') { k *= 0.8; if (has(w, 'b6a') && R().pools.some(z => z.life > 0 && Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r)) k *= 1.3; }
      if (has(w, 'a6a') && f.volHit) { const c = f.volHit.get(e) || 0; f.volHit.set(e, c + 1); if (c === 1) { k *= 1.5; ring(e.x, e.y, e.r + 4, PINK, 0.2, 2); } }
    }
    if (w.def === WEAPONS[SPARK] && f.p === 'A') {
      k *= corrodedNow(e) ? 1.4 : 0.7;
      if (has(w, 'a6a')) k *= 1 + Math.min(1, 0.1 * near(G.player.x, G.player.y, 700, corrodedNow).length);
    }
    return k;
  };
  wupHit = function (e, res, s) {
    _hit(e, res, s); const w = s && s.w; if (!isAc(w) || s.wupEcho || s.echo) return;
    const f = F(w), p = G.player, wasLast = res.layersLost > 0 && fightCd(e).layers === 0;
    if (res.layersLost > 0 && w.def !== WEAPONS[SPARK]) onStrip(w, e, wasLast);
    if (w.def === WEAPONS[CAP] && res.statusOk && !res.payoffs.length) { // base: Corrosion fills twice as fast
      const r = acid(e, res.raw, 1, s); if (r === 'strip') onStrip(w, e, fightCd(e).layers === 0);
    }
    if (w.def === WEAPONS[SPRAY] && res.statusOk && !s.acPool) {
      const d = Math.hypot(e.x - p.x, e.y - p.y), k = (f.p === 'A' && d < 60 + e.r ? 1 : 0) + (f.p === 'C' && shelled(e) ? 0.5 : 0);
      if (k && !res.payoffs.length) { const r = acid(e, res.raw, k, s); if (r === 'strip') onStrip(w, e, fightCd(e).layers === 0); }
      if (has(w, 'm1') && d < 60 + e.r && !(e.acM1T > G.t)) { e.acM1T = G.t + 1; const was = shelled(e) && fightCd(e).layers === 1; if (payNow(e, s) === 'strip') onStrip(w, e, was); }
      if (has(w, 'c6b') && !s.acPass && !e.dead && corrodedNow(e) && !shelled(e)) { const a = Math.atan2(e.y - p.y, e.x - p.x); spawnProj(w, e.x + Math.cos(a) * (e.r + 4), e.y + Math.sin(a) * (e.r + 4), a, Object.assign({}, s, { acPass: 1 })); }
      if (has(w, 'cw') && res.layersLost > 0 && !s.acBounce) { const o = nearest(e.x, e.y, 220, shelled, e); if (o) spawnProj(w, e.x, e.y, Math.atan2(o.y - e.y, o.x - e.x), Object.assign({}, s, { acBounce: 1 })); }
    }
    if (w.def === WEAPONS[SPARK]) {
      const evap = e.acPre && !corroded(e);
      if (evap && f.p === 'A' && has(w, 'a6b')) { f.splitT = G.t + 2; say(e, '||', ORANGE); }
      if (has(w, 'm2') && res.payoffs.includes('ignite') && e.acPre) for (const o of near(e.x, e.y, 80, o => o !== e)) { o.cd = o.cd || fightCd(o); w2BarBump(o, 'acid', 0.5, s); }
    }
  };
  wupKill = function (e, s) { _kill(e, s); };
  wupTick = function (dt) {
    _tick(dt); if (!G || G.state !== 'play') return;
    const p = G.player, Rs = R();
    Rs.pools = Rs.pools.filter(z => z.life > 0);
    for (const w of G.weapons) {
      if (!isAc(w)) continue;
      w.uh = w.uh || {};
      const f = F(w);
      if (w.def === WEAPONS[SPARK]) { // heading, standing still, sharp turns
        const dx = p.x - (f.px == null ? p.x : f.px), dy = p.y - (f.py == null ? p.y : f.py), sp = Math.hypot(dx, dy) / Math.max(dt, 1e-3);
        f.px = p.x; f.py = p.y;
        if (sp > 30) { const h = Math.atan2(dy, dx); if (f.head != null && Math.abs(angDiff(h, f.head)) > 0.9 && has(w, 'c6a')) f.wideT = G.t + 0.5; f.head = h; f.still = 0; } else f.still = (f.still || 0) + dt;
      }
      if (w.def === WEAPONS[SPRAY] && f.p === 'B') { // drizzle: misses land as pools
        const S = w2Track(w), cap = has(w, 'm2') ? 12 : 8;
        for (const pr of S.gone) {
          if (!(pr.life <= 0.02) || pr.src.acPass || pr.src.acBounce) continue; // (it hit something)
          const into = has(w, 'b6b') && Rs.pools.find(z => z.w === w && z.life > 0 && Math.hypot(pr.x - z.x, pr.y - z.y) < z.r);
          if (into) { into.r = Math.min(80, into.r + 10); into.life = into.max; continue; }
          const mine = Rs.pools.filter(z => z.w === w);
          if (mine.length >= cap) mine[0].life = 0;
          const z = pool(w, pr.x, pr.y, 25, has(w, 'm2') ? 9999 : 2, w.s.dmg * 1.2); if (z) { z.w = w; Rs.pools.push(z); }
        }
        if (has(w, 'm2') && G.wave && f.wave !== G.wave.n) { f.wave = G.wave.n; for (const z of Rs.pools) if (z.w === w) z.life = 0; }
        if (has(w, 'bw') && Rs.pools.some(z => z.w === w && z.life > 0 && Math.hypot(p.x - z.x, p.y - z.y) < z.r)) f.rapid = 1;
      }
      if (w.def === WEAPONS[CAP] && f.p === 'C') { // hard hat: losing the last layer bursts it
        const L = pdef().layers;
        if (has(w, 'cw') && f.lastL > 0 && L === 0) { ring(p.x, p.y, 80, PINK, 0.4, 5); for (const e of near(p.x, p.y, 80)) { damageEnemy(e, w.s.dmg * 0.5, card(w, { atk: 'burst' })); w2BarBump(e, 'acid', 0.5, card(w)); } }
        f.lastL = L;
      }
      if (w.def === WEAPONS[CAP] && f.p === 'A' && f.tgt && !f.tgt.dead && (f.stack || 0) > 1 && !(f.ringT > G.realT)) { f.ringT = G.realT + 0.25; ring(f.tgt.x, f.tgt.y, f.tgt.r + 3 + f.stack, PINK, 0.25, 2 + f.stack * 0.4); }
    }
  };
  hurtPlayer = function (dmg, from, ent, kind) {
    const contact = ent && !ent.dead && ent.maxHp && typeof pdefAtk === 'function' && pdefAtk(kind, ent) === 'contact';
    if (contact && G && G.weapons) for (const w of G.weapons) {
      if (!isAc(w) || w.def !== WEAPONS[CAP]) continue;
      const f = F(w);
      if (f.p === 'A' && has(w, 'a6b') && f.tgt && !f.tgt.dead && (f.stack || 0) > 1) dmg *= 0.6;
      if (f.p === 'C' && has(w, 'c6b') && pdef().layers > 0 && !(f.backT > G.t)) { f.backT = G.t + 1; damageEnemy(ent, w.s.dmg, card(w, { atk: 'contact', kx: ent.x - G.player.x, ky: ent.y - G.player.y, knock: 160 })); ring(ent.x, ent.y, ent.r + 6, PINK, 0.3, 3); }
    }
    return _hurt(dmg, from, ent, kind);
  };

  // ------------------------------------------------------------ the cards (all text is TODO_COPY: SAMPLE_9_ACRO.md 6.4 to 6.6)
  const set = k => w => { F(w)[k] = 1; };
  const promise = (id, k, tag, modes, flags) => ({ name: T(`${id}_${k}`), tag, costs: T(`${id}_${k}c`), shows: T(`${id}_${k}s`), modes,
    lv3: { desc: T(`${id}_${k}3`), apply: w => { F(w).p = k; } },
    lv6: ['6a', '6b'].map((x, i) => ({ name: T(`${id}_${k}${x}`), desc: T(`${id}_${k}${x}_desc`), apply: set(flags[i]) })),
    wild: { name: T(`${id}_${k}w`), desc: T(`${id}_${k}w_desc`), apply: set(flags[2]) } });
  const masteries = (id, best) => best.map((b, i) => ({ name: T(`${id}_M${i + 1}`), desc: T(`${id}_M${i + 1}_desc`), best: b, apply: set('m' + (i + 1)) }));
  wupReg(CAP, { A: promise(CAP, 'A', 'HUNT', 'HUNT', ['a6a', 'a6b', 'aw']), B: promise(CAP, 'B', 'ORBIT', 'ORBIT, HUNT', ['b6a', 'b6b', 'bw']),
    C: promise(CAP, 'C', 'HOLD', 'HOLD, ORBIT', ['c6a', 'c6b', 'cw']), lv10: masteries(CAP, ['A', 'B', 'C']) });
  wupReg(SPRAY, { A: promise(SPRAY, 'A', 'ORBIT', 'ORBIT, HUNT', ['a6a', 'a6b', 'aw']), B: promise(SPRAY, 'B', 'HOLD', 'HOLD', ['b6a', 'b6b', 'bw']),
    C: promise(SPRAY, 'C', 'HUNT', 'HUNT', ['c6a', 'c6b', 'cw']), lv10: masteries(SPRAY, ['A', 'B', 'BC']) });
  wupReg(SPARK, { A: promise(SPARK, 'A', 'HUNT', 'HUNT', ['a6a', 'a6b', 'aw']), B: promise(SPARK, 'B', 'KITE', 'KITE', ['b6a', 'b6b', 'bw']),
    C: promise(SPARK, 'C', 'ORBIT', 'ORBIT', ['c6a', 'c6b', 'cw']), lv10: masteries(SPARK, ['AB', 'A', 'C']) });
})();
