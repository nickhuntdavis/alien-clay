'use strict';
// Spawn Prawn - weapon cells, part 7: There Is No Spoon (s_siphon, tag sp) and Family Ties (s_void, tag ft)
// (redesign docs/MODIFIER_MATRIX.md 5.9 and those two rows of every table in sections 3 and 4; built 24 Oct). Same engine
// as cellmods.js (XC_W masking, no fork screens, rank 1 to 3 then the mastery as rank 4). Card text: cell_sp_<modifier> /
// cell_ft_<modifier> in cellcopy7.js. Neither weapon is dealt Ranged or Switched at Birth (not in MM_SAB); Family Ties is
// also never dealt Pulling, Piercing or Gravity Well (it already pulls and pierces).
//  - THERE IS NO SPOON fires from arsenal.js updateSiphon (wup4.js swaps in w4SipUpdate), not fireWeapon, so this file wraps
//    updateSiphon: Charged (a held volley), Melee (the spoon whack), Mines (planted bullets), Death from Above (rain on the
//    shooter) and Orbiting (stored bullets circle you) stop the stream and spend the store themselves. Every eaten bullet
//    is remembered (siphonAte) as {type, shooter, where}, in step with the store (w.q holds only strengths): a returned
//    shot carries it (pr.c7, and pr.src.c7 for its hits). The base weapon returns Force; while a cell that reads the
//    bullet's type is held (Catalyst, Kinship, Exploding Rounds, Primer, Melee, Piercing / Ricochet masteries), returns
//    fly in their shooter's type (pstatus.js b.pel; only the game's damage types, otherwise Force).
//  - FAMILY TIES: every hole it makes is tagged as it spawns (pr.c7f; spawnProj) and run each frame here (repel, slow on
//    the way out, homing, bounces, the centre hold, the 120 bonus, the trap); ended holes are noticed once (Exploding
//    Rounds). Melee (a hole on you), Orbiting, Mines (dormant holes) and Death from Above replace the shot (XC_FIRE.ft).
//    Merges: voidMerge (Connecting: reach and drift), voidCombine (masses), voidSupernova (Area, Knockback, Turncoat).
// Simplified: Family Ties' base drift is unchanged (MODIFIER_MATRIX conflict 4 is a base change), so Connecting Lv 1 adds a
// little drift instead; Charged on There Is No Spoon also lets go after 6 s with anything stored (a dry store still
// fires); its Kinship status fill stays the shared (Force) one.
// Hooks: none in shared files. Wraps arsenal.js updateSiphon, sigs.js siphonAte/voidMerge/voidCombine/voidSupernova,
// game.js spawnProj, modifiers.js modStep/modHit/modDraw, aim.js aimBend, fight.js rxFired, modwide.js mwDetonate,
// weapons24.js wupHit/wupDmgMul; fills cellmods.js XC_W/XC_TICK/XC_FIRE/XC_STATS/XC_RUN/XC_LIFE. Loads after cellmods.js.
(function () {
  XC_W.s_siphon = { tag: 'sp',
    cells: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'pull', 'sticky', 'piercing', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
    mask: ['charged', 'kinship', 'knock', 'pull', 'piercing', 'homing', 'ricochet', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
    deny: ['ranged'], atkOk: [] };
  XC_W.s_void = { tag: 'ft',
    cells: ['range', 'upclose', 'rapid', 'charged', 'catalyst', 'kinship', 'knock', 'sticky', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'primer', 'nth', 'extra', 'orbiting', 'area'],
    mask: ['range', 'upclose', 'charged', 'knock', 'sticky', 'explode', 'homing', 'ricochet', 'focus', 'connecting', 'turncoat', 'melee', 'mines', 'dfa', 'nth', 'extra', 'orbiting'],
    deny: ['pull', 'piercing', 'ranged', 'gravity'], atkOk: [] };

  const C = { cur: null, ftKin: false };
  const live = w => !!(G && G.weapons && G.weapons.includes(w));
  const typeOf = t => (t && typeof V10_TYPES !== 'undefined' && V10_TYPES.includes(t) ? t : 'phys');
  const ek = ent => (typeof ent === 'number' ? ent : (ent && ent.k) || 0);
  const tcol = t => (typeof V10_COL !== 'undefined' && V10_COL[t]) || '#ffffff';
  const foeOk = e => e && !e.dead && !e.charmed && !e.egg;
  const SPS = w => w.c7 || (w.c7 = { meta: [], dry: 0, fi: 0, n: 0, mines: [], rain: [], links: [], shot: [], orbP: [], oa: 0, holdS: 0 });
  const FTS = w => w.c7f || (w.c7f = { known: [], nth: 0, dorm: [], orb: [], oa: 0 });
  const spOn = w => !!w && xcIs(w, 'sp') && xcAny(w);
  const ftOn = w => !!w && xcIs(w, 'ft') && xcAny(w);
  // Returns read their bullet's type while one of these is held.
  const spTyped = w => ['catalyst', 'kinship', 'explode', 'primer', 'melee'].some(id => xcR(w, id) > 0) || xcR(w, 'piercing') >= 4 || xcR(w, 'ricochet') >= 4;
  const rec = b => ({ t: typeOf(b.pel), o: b.owner && !b.owner.dead ? b.owner : null, x: b.x, y: b.y });
  // A status of type t on e (Primer Lv 3): the bar where the type has one, otherwise its status.
  function c7Fill(e, t, dmg, src) {
    const ft = FIGHT_TYPE[t] || 'force', c = fightCd(e), bar = { acid: 'acid', fire: 'fire', soul: 'soul', force: 'force' }[ft];
    if (bar) c.bars[bar] = Math.min(0.99, c.bars[bar] + 0.4);
    else fightStatus(e, t, dmg, src);
  }

  // ================================================================ THERE IS NO SPOON
  function spTake(w) { // one entry off the front of the store, with what it remembers
    if (!w.q) return null;
    while (w.q.length && typeof w.q[0] !== 'number' && w.q[0].fill) w.q.shift();
    if (!w.q.length) return null;
    const A = SPS(w), ent = w.q.shift(); w.stored = w.q.length;
    let m = null; if (A.dry > 0) A.dry--; else m = A.meta.shift() || null;
    return { k: ek(ent), m };
  }
  function spStore(w, b) { // eat a bullet into the store (Turncoat mastery, Orbiting Lv 3)
    if (!w.q || w.q.length >= w.s.mag) return false;
    siphonStore(w, siphonStrength(b)); siphonAte(w, b);
    return true;
  }
  siphonAte = (orig => function (w, b) {
    orig(w, b);
    if (!G || !spOn(w)) return;
    const A = SPS(w), m = rec(b); A.ate = (A.ate || 0) + 1;
    A.meta.push(m); if (A.meta.length > 40) A.meta.shift();
    if (m.o && !A.shot.includes(m.o) && A.shot.length < 12) A.shot.push(m.o);
    if (xcArea(w) > 1 && m.o && !(m.o.c7gT > G.t)) { // Wide gape: eating pushes the shooter's neighbours back
      const o = m.o; o.c7gT = G.t + 0.3;
      forNear(o.x, o.y, 80, q => { if (q !== o && !q.charmed) shove(q, o.x, o.y, 40); });
      ring(o.x, o.y, 34, w.def.color, 0.25, 2);
    }
    if (xcR(w, 'focus') >= 4 && w._f && b.owner && b.owner === w._f.e && msFocusFull(w) && w.q.length < w.s.mag) { // returned twice
      w.q.push(w.q[w.q.length - 1]); w.stored = w.q.length; A.meta.push(Object.assign({}, m));
      ring(G.player.x, G.player.y, G.player.r + 12, w.def.color, 0.25, 2);
    }
  })(siphonAte);

  // A returned shot: everything the cells put on one.
  function spTag(w, pr, m, o) {
    if (!pr) return pr;
    o = o || {};
    const R = id => xcR(w, id), A = SPS(w);
    const c = pr.c7 = { m, k: o.k || 1, pr, x0: pr.x, y0: pr.y, rk: 1 };
    pr.src = Object.assign({}, pr.src, { c7: c });
    if (m && m.t !== 'phys' && spTyped(w)) { pr.src.elem = m.t; pr.color = tcol(m.t); }
    if (R('piercing')) { pr.pierce = (pr.pierce || 0) + XC_RAMP(R('piercing')); pr.mP = 1; }
    if (R('ricochet')) c.rb = XC_RAMP(R('ricochet'));
    const ho = R('homing'), cn = R('connecting');
    if ((ho || cn) && m && m.o && !m.o.dead) c.h = { t: m.o, turn: ho ? 4 * Math.min(3, ho) : 6, def: m.o.def };
    if (o.emp) { pr.dmg *= 2; pr.r *= 1.6; if (R('nth') >= 3) { pr.pierce = (pr.pierce || 0) + 3; pr.mP = 1; } }
    return pr;
  }
  function spEvent(w, first) { // once per return (not per projectile): Every Nth, Pulling's tug
    const A = SPS(w), R = id => xcR(w, id);
    if (!first) return A.emp;
    A.emp = false;
    if (R('nth')) { A.n++; w.m10n = A.n; if (A.n % (R('nth') >= 2 ? 3 : 4) === 0) A.emp = true; }
    return A.emp;
  }
  spawnProj = (orig => function (w, x, y, a, src, over) {
    if (!G || !w) return orig(w, x, y, a, src, over);
    if (C.cur === w && spOn(w)) { // a shot of the stream (updateSiphon)
      const A = SPS(w), R = id => xcR(w, id), i = A.fi++, n = w.s.count || 1, ex = R('extra');
      if (i === 0) {
        if (A.q0 === 0 && !A.ate) { A.trick = 1; A.m = null; } // (the dry spit, fired the frame it was made)
        else if (A.dry > 0) { A.dry--; A.m = null; } else A.m = A.meta.shift() || null;
        if (R('pull') >= 4 && A.m && foeOk(A.m.o)) { mwPull(A.m.o, G.player.x, G.player.y, 40); A.tug = { a: A.m.o, t: G.t + 0.15 }; } // the tug
      }
      if (ex >= 3 && n > 1) { const off = i - (n - 1) / 2, a0 = a - off * 0.12; a = ex >= 4 ? a0 + i / n * TAU : a0 + off * 0.52 / (n - 1); } // fan, then a ring
      const emp = spEvent(w, i === 0);
      const pr = spTag(w, orig(w, x, y, a, src, over), A.m, { emp, k: A.k0 });
      if (pr && i === 0) {
        const extra = [];
        if (R('rapid') >= 4) extra.push(0.09); // in pairs
        if (emp && R('nth') >= 4) extra.push(-0.16, 0.16); // three
        C.cur = null;
        try { for (const da of extra) spTag(w, orig(w, x, y, a + da, src, over), A.m, { emp, k: A.k0 }); } finally { C.cur = w; }
      }
      return pr;
    }
    const pr = orig(w, x, y, a, src, over);
    if (pr && pr.style === 'void' && ftOn(w)) ftBorn(w, pr);
    return pr;
  })(spawnProj);
  function spFire(w, x, y, a, k, m, first) { // a shot this file sends (volley, mines, orbit): the stream's shot, cells and all
    const src = weaponSrc(w); src.mult *= k;
    const emp = spEvent(w, first);
    return spTag(w, spawnProj(w, x, y, a, src), m, { emp, k });
  }

  updateSiphon = (orig => function (w, dt) {
    if (!G || !spOn(w)) return orig(w, dt);
    const A = SPS(w), R = id => xcR(w, id), p = G.player, s = w.s;
    w.q = w.q || [];
    if (R('pull')) { // bullets within reach curve in to be eaten
      const r = R('pull'), RR = xcLv([140, 180, 220, 220], r) * xcArea(w), f = (160 + 80 * Math.min(3, r)) * dt; let n = 0;
      if (w.q.length < s.mag) for (const b of G.ebul) {
        if (b.dead) continue;
        const dx = p.x - b.x, dy = p.y - b.y, d = Math.hypot(dx, dy);
        if (d < RR && d > s.area * 0.7) { const m = Math.min(d - 1, f); b.x += dx / d * m; b.y += dy / d * m; n++; }
      }
      if (n && !(A.pullT > G.t)) { A.pullT = G.t + 0.4; ring(p.x, p.y, RR, w.def.color, 0.3, 2); }
    }
    const mode = R('melee') ? 'melee' : R('mines') ? 'mines' : R('dfa') ? 'dfa' : R('orbiting') ? 'orb' : R('charged') ? 'charged' : null;
    const cap = mode === 'orb' ? xcLv([3, 5, 5, 5], R('orbiting')) : 0, block = !!mode && (mode !== 'orb' || w.q.length <= cap), cd0 = w.cd;
    A.q0 = w.q.length; A.ate = 0; A.fi = 0; A.trick = 0; A.k0 = w.q.length ? ek(w.q.find(x => typeof x === 'number' || !x.fill) || 1) : SIPHON.dry;
    if (block) w.cd = 9;
    C.cur = w;
    try { orig(w, dt); } finally { C.cur = null; if (block) w.cd = Math.max(0, cd0 - dt); }
    if (A.q0 === 0 && !A.ate && !A.trick && w.q.length > 0 && !A.dry) A.dry = 1; // (a dry spit sits at the front)
    while (A.meta.length > Math.max(0, w.q.length - A.dry)) A.meta.shift(); // (in step with the store)
    if (mode === 'charged') spCharged(w);
    else if (mode === 'melee') spWhack(w);
    else if (mode === 'mines') spPlant(w);
    else if (mode === 'dfa') spRain(w);
  })(updateSiphon);
  // Charged: nothing returns until the store is full, then one volley (a ring round you at the mastery).
  function spCharged(w) {
    const A = SPS(w), r = xcR(w, 'charged'), s = w.s, p = G.player;
    if (!w.q.length || !A.holdS) A.holdS = G.t;
    if (!(w.q.length >= s.mag || (w.q.length && G.t - A.holdS > 6))) return;
    const t = acquire(aimDir(w), s.range, p.x, p.y); if (!t) return;
    const all = []; let x; while ((x = spTake(w))) all.push(x);
    const n = all.length * (s.count || 1), a0 = Math.atan2(t.y - p.y, t.x - p.x), bonus = 1 + xcLv([0.6, 0.9, 1.2, 1.2], r);
    let i = 0;
    for (const e of all) for (let j = 0; j < (s.count || 1); j++, i++) spFire(w, p.x, p.y, r >= 4 ? a0 + i / n * TAU : a0 + (i - (n - 1) / 2) * 0.07, e.k * bonus, e.m, j === 0);
    A.holdS = G.t; A.volT = G.t + 0.3;
    ring(p.x, p.y, r >= 4 ? 110 : 60, w.def.color, 0.4, 5); sfx('shot');
  }
  // Melee: the spoon whack, every stored bullet at once, each in its own type.
  function spWhack(w) {
    const A = SPS(w), r = xcR(w, 'melee'), s = w.s, p = G.player;
    if (!w.q.length || A.whackT > G.t) return;
    const reach = (r >= 2 ? 80 : 60) * xcArea(w), e = xcFoe(p.x, p.y, reach); if (!e) return;
    const by = {}; let x; while ((x = spTake(w))) { const t = x.m ? x.m.t : 'phys'; by[t] = (by[t] || 0) + x.k; }
    const types = Object.keys(by), hit = [e];
    if (r >= 3) forNear(e.x, e.y, 40 + e.r, o => { if (o !== e && !o.charmed && hit.length < 10) hit.push(o); });
    for (const o of hit) for (const t of types) damageEnemy(o, s.dmg * by[t] * 1.2, Object.assign(weaponSrc(w), { elem: t, atk: 'contact', kx: o.x - p.x, ky: o.y - p.y, c7: { m: null, k: by[t], pr: null, whack: 1 } }));
    if (r >= 4 && types.length >= 3 && !e.dead) for (const t of types) fightReactAs(e, FIGHT_TYPE[t], { raw: s.dmg * by[t], once: { n: 0 }, w });
    A.whackT = G.t + 0.35;
    const a = Math.atan2(e.y - p.y, e.x - p.x);
    (G.v10fx || (G.v10fx = [])).push({ k: 'arc', x: p.x, y: p.y, a, r: reach, c: w.def.color, life: 0.15, max: 0.15 });
    ring(e.x, e.y, e.r + 10 + 4 * types.length, w.def.color, 0.25, 3 + types.length); sfx('shot');
  }
  // Mines: every eaten bullet is planted where it was eaten, and fires back at the first enemy to come near.
  function spPlant(w) {
    const A = SPS(w), r = xcR(w, 'mines'), p = G.player; let x;
    while ((x = spTake(w))) {
      if (A.mines.length >= 16) A.mines.shift();
      const m = x.m;
      A.mines.push({ x: m ? m.x : p.x + rand(-40, 40), y: m ? m.y : p.y + rand(-40, 40), k: x.k, m, shots: xcLv([1, 2, 2, 4], r), t: G.t + 14, arm: G.t + 0.4, next: 0, hit: [] });
    }
  }
  // Death from Above: one stored bullet at a time falls on whoever fired it (tracking it for 0.4 s).
  function spRain(w) {
    const A = SPS(w), s = w.s, p = G.player;
    if (!w.q.length || A.dfaT > G.t || A.rain.length >= 20) return;
    const m0 = A.dry > 0 ? null : A.meta[0], t = m0 && foeOk(m0.o) ? m0.o : acquire(aimDir(w), (s.range || 460) + 100, p.x, p.y);
    if (!t) return;
    const x = spTake(w);
    A.rain.push({ t, k: x.k, m: x.m, at: G.t + 0.4, x: t.x, y: t.y });
    A.dfaT = G.t + Math.max(0.15, (s.cd || 0.1) * 2);
  }
  // Each frame: orbiting bullets, planted mines, the rain, links and who has shot at you.
  XC_TICK.sp = function (w, dt) {
    const A = SPS(w), R = id => xcR(w, id), s = w.s, p = G.player;
    const wave = G.wave ? G.wave.n : 0; if (A.wave !== wave) { A.wave = wave; A.shot.length = 0; }
    if (!(A.shotT > G.t)) { A.shotT = G.t + 0.5; A.shot = A.shot.filter(foeOk); for (const b of G.ebul) if (A.shot.length < 12 && b.owner && foeOk(b.owner) && !A.shot.includes(b.owner)) A.shot.push(b.owner); }
    A.links = A.links.filter(L => L.t > G.t && !L.a.dead && !L.b.dead);
    // Orbiting: stored bullets circle you, block shots and hit what they touch
    A.orbP.length = 0;
    if (R('orbiting') && w.q) {
      const r = R('orbiting'), n = Math.min(xcLv([3, 5, 5, 5], r), w.q.length), rad = 56;
      A.oa += 3 * dt;
      for (let i = 0; i < n; i++) {
        const a = A.oa + i / Math.max(1, n) * TAU, x = p.x + Math.cos(a) * rad, y = p.y + Math.sin(a) * rad;
        A.orbP.push({ x, y });
        for (const b of G.ebul) if (!b.dead && Math.abs(b.x - x) < 10 + b.r && Math.abs(b.y - y) < 10 + b.r) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 2, 50, 0.2, 2); if (r >= 3) spStore(w, b); }
        const e = xcFoe(x, y, 10);
        if (e && !(e.hitT['c7o' + i] > G.t)) { e.hitT['c7o' + i] = G.t + 0.5; damageEnemy(e, s.dmg * 0.6, Object.assign(weaponSrc(w), { atk: 'contact', kx: e.x - p.x, ky: e.y - p.y })); }
      }
      if (r >= 4 && n && !(A.ofT > G.t)) { // they fire themselves at enemies within 80
        const t = xcFoe(p.x, p.y, 80);
        if (t) { const o = A.orbP[0], x = spTake(w); A.ofT = G.t + 0.15; if (x) spFire(w, o.x, o.y, Math.atan2(t.y - o.y, t.x - o.x), x.k, x.m, true); }
      }
    }
    // Mines: planted bullets
    for (const m of A.mines) {
      if (m.t < G.t || m.shots <= 0 || m.arm > G.t || m.next > G.t) continue;
      const t = xcFoe(m.x, m.y, 70, R('mines') >= 4 ? m.hit : null); if (!t) continue;
      spFire(w, m.x, m.y, Math.atan2(t.y - m.y, t.x - m.x), m.k * (R('mines') >= 3 ? 1 : 0.7), m.m, true);
      m.shots--; m.hit.push(t); m.next = G.t + 0.25; ring(m.x, m.y, 12, w.def.color, 0.2, 2);
    }
    A.mines = A.mines.filter(m => m.t >= G.t && m.shots > 0 && R('mines'));
    // Death from Above: the rain lands
    for (const q of A.rain) {
      if (q.t && !q.t.dead) { q.x = q.t.x; q.y = q.t.y; }
      if (G.t < q.at) continue;
      q.done = 1;
      const r = R('dfa') || 1, t = q.t && !q.t.dead ? q.t : xcFoe(q.x, q.y, 60), dmg = s.dmg * q.k * (r >= 2 ? 1.2 : 1);
      const src = Object.assign(weaponSrc(w), { c7: { m: q.m, k: q.k, pr: null, rain: 1 } });
      const hit = t ? [t] : [];
      if (t && r >= 3) forNear(t.x, t.y, (r >= 4 ? 100 : 40) + t.r, o => { if (o !== t && !o.charmed && hit.length < 12) hit.push(o); });
      for (const o of hit) damageEnemy(o, dmg, src);
      ring(q.x, q.y, r >= 4 ? 100 : r >= 3 ? 40 : 16, w.def.color, 0.3, 3);
    }
    A.rain = A.rain.filter(q => !q.done);
    if (A.tug && A.tug.t < G.t) A.tug = null;
  };
  XC_STATS.sp = function (w, s) {
    const R = id => xcR(w, id);
    if (R('area')) s.area *= xcArea(w); // Wide gape
    const ex = R('extra');
    if (ex) { const n0 = s.count || 1, n1 = ex >= 4 ? 6 : ex >= 2 ? n0 + 2 : n0 + 1; s.count = n1; s.dmg *= Math.pow(n0 / n1, 0.4); }
  };
  // Turncoat: a bullet sponge stands in front of you and soaks up enemy shots.
  XC_LIFE.sp = w => (xcR(w, 'turncoat') >= 2 ? 6 : 4);
  XC_RUN.sp = function (z, dt) {
    const w = z.xcRun.w, r = xcR(w, 'turncoat'), p = G.player;
    const o = xcFoe(p.x, p.y, 500, [z]), a = o ? Math.atan2(o.y - p.y, o.x - p.x) : (p.face || 0);
    const k = Math.min(1, 8 * dt); z.x += (p.x + Math.cos(a) * 55 - z.x) * k; z.y += (p.y + Math.sin(a) * 55 - z.y) * k; z.kx = 0; z.ky = 0;
    const RR = z.r + (r >= 3 ? 45 : 22); z.c7rr = RR;
    for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - z.x, b.y - z.y) < RR + b.r) { b.dead = true; spawnPart(b.x, b.y, w.def.color, 2, 50, 0.2, 2); if (r >= 4) spStore(w, b); }
    if (z.xcRun.end <= G.t) z.dead = true;
  };
  // Hits of returned bullets (src.c7): Knockback, Sticky, Connecting, Catalyst, Exploding Rounds, Primer.
  function spHit(w, e, res, src) {
    const R = id => xcR(w, id), A = SPS(w), c = src.c7, m = c.m, p = G.player;
    if (R('knock') && !e.dead) {
      const r = R('knock'), f = 117 * xcLv([1, 2, 3, 3], r) * (r >= 4 ? clamp(c.k || 1, 0.5, 2) : 1), v = c.pr;
      if (v) shove(e, e.x - v.vx, e.y - v.vy, f); else shove(e, p.x, p.y, f);
    }
    if (R('sticky') >= 4 && !e.dead && !(e.c7snT > G.t)) { msSnare(e, 1); e.c7snT = G.t + 1.2; }
    if (Math.hypot(e.x - p.x, e.y - p.y) < 60 + e.r && R('upclose') >= 4) ring(e.x, e.y, e.r + 6, w.def.color, 0.2, 2); // (double damage: wupDmgMul)
    const cn = R('connecting');
    if (cn >= 2 && m && m.o === e && !c.linked) { // the shooter is linked to its nearest mate
      c.linked = 1; const o = msNear(e.x, e.y, 140, [e]);
      if (o && !o.charmed) { if (A.links.length >= 8) A.links.shift(); A.links.push({ a: e, b: o, t: G.t + 3, share: cn >= 3 ? 0.4 : 0.25 }); }
    }
    if (cn >= 4 && res.toHp > 0 && !(A.sprT > G.t)) { // every enemy that has shot at you this wave shares it
      A.sprT = G.t + 0.2; A.sprFx = G.t + 0.15;
      for (const o of A.shot) if (o !== e && foeOk(o)) damageEnemy(o, res.toHp * 0.25, msEcho(src));
    }
    if (R('catalyst') >= 4 && !e.dead && !(e.c7rxT > G.t)) { // the hit reacts with the shooter's own damage type
      const et = pstElem(e), t = et && typeOf(et);
      if (t && t !== 'phys') { e.c7rxT = G.t + 0.3; fightReactAs(e, FIGHT_TYPE[t], { raw: res.toHp || w.s.dmg, once: { n: 0 }, w }); }
    }
    if (R('explode') >= 4 && m) { // two different types bursting together: their unstable reaction
      const B = A.booms || (A.booms = []), t = m.t;
      const o = B.find(q => q.t !== t && G.t - q.at < 0.4 && Math.hypot(q.x - e.x, q.y - e.y) < 100);
      if (o) {
        B.splice(B.indexOf(o), 1);
        const mx = (o.x + e.x) / 2, my = (o.y + e.y) / 2; let n = 0;
        forNear(mx, my, 70, q => { if (q.charmed || n >= 8) return; n++; const once = { n: 0 }; fightReactAs(q, FIGHT_TYPE[o.t], { raw: w.s.dmg, once, w }); fightReactAs(q, FIGHT_TYPE[t], { raw: w.s.dmg, once, w }); });
        bolt(o.x, o.y, e.x, e.y, tcol(t), 0.2); ring(mx, my, 70, tcol(o.t), 0.35, 3);
      } else { B.push({ t, x: e.x, y: e.y, at: G.t }); if (B.length > 8) B.shift(); }
    }
    if (R('primer') && e.mwPr && e.mwPr.w === w && e.mwPr.c7t == null) e.mwPr.c7t = m ? m.t : 'phys';
  }

  // ---------------------------------------------------------------- returned shots in flight (modStep / modHit)
  modStep = (orig => function (pr, dt) {
    const c = pr.c7, w = pr.w;
    if (c && w && G) {
      const R = id => xcR(w, id);
      if (c.h) { // home on the shooter (Homing, Connecting); the Homing mastery picks the nearest of its kind
        let t = c.h.t;
        if (!t || t.dead) {
          t = null;
          if (R('homing') >= 4 && !c.h.re) { c.h.re = 1; let bd = 500; for (const o of G.enemies) { if (!foeOk(o) || o.def !== c.h.def) continue; const d = Math.hypot(o.x - pr.x, o.y - pr.y); if (d < bd) { bd = d; t = o; } } }
          c.h.t = t; if (!t) c.h = null;
        }
        if (t) { const ca = Math.atan2(pr.vy, pr.vx), na = ca + clamp(angDiff(Math.atan2(t.y - pr.y, t.x - pr.x), ca), -c.h.turn * dt, c.h.turn * dt), sp = Math.hypot(pr.vx, pr.vy) || pr.speed; pr.vx = Math.cos(na) * sp; pr.vy = Math.sin(na) * sp; }
      }
      if (R('range') >= 4) { const fl = Math.hypot(pr.x - c.x0, pr.y - c.y0), nk = 1 + 0.5 * Math.min(1, fl / 500); pr.dmg *= nk / c.rk; c.rk = nk; } // further, harder
    }
    return orig(pr, dt);
  })(modStep);
  modHit = (orig => function (pr, e) {
    const c = pr.c7, through = c && pr.mP && pr.pierce > 0;
    orig(pr, e);
    if (!c || !G || !pr.w) return;
    const w = pr.w, R = id => xcR(w, id);
    if (through && R('piercing') >= 4 && !e.dead) { // a hit in every damage type in the store
      const own = pr.src.elem || 'phys', ts = [...new Set(SPS(w).meta.map(m => m.t))].filter(t => t !== own).slice(0, 4);
      for (const t of ts) { damageEnemy(e, pr.dmg * 0.3, Object.assign({}, pr.src, { elem: t, c7x: 1, noCrit: true })); fxParts('spark', e.x, e.y, tcol(t), 3, 90, 0.25, 2); }
    }
    if (c.rb > 0 && !pr.dead) { // bounce off at the true reflection angle
      const nx = pr.x - e.x, ny = pr.y - e.y, d = Math.hypot(nx, ny) || 1, ux = nx / d, uy = ny / d, dot = pr.vx * ux + pr.vy * uy;
      if (dot < 0) { pr.vx -= 2 * dot * ux; pr.vy -= 2 * dot * uy; }
      pr.x = e.x + ux * (e.r + pr.r + 1); pr.y = e.y + uy * (e.r + pr.r + 1);
      c.rb--; pr.dmg *= 0.8; pr.pierce = (pr.pierce || 0) + 1; pr.life = Math.max(pr.life, 0.5);
      if (c.h && c.h.t === e) c.h = null;
      spawnPart(pr.x, pr.y, pr.color, 3, 60, 0.2, 2);
      if (R('ricochet') >= 4) { // each bounce: the next damage type in the store
        const ts = [...new Set(SPS(w).meta.map(m => m.t).concat(['phys']))], cur = pr.src.elem || 'phys', nt = ts[(ts.indexOf(cur) + 1) % ts.length];
        pr.src = Object.assign({}, pr.src, { elem: nt }); pr.color = tcol(nt);
      }
    }
  })(modHit);

  // ================================================================ FAMILY TIES
  const ftOrbs = w => G.proj.filter(pr => pr.w === w && pr.style === 'void' && !pr.dead && !pr.lob);
  function ftNearOrb(w, x, y, R, not) { let b = null, bd = R; for (const o of G.proj) { if (o.dead || o.w !== w || o.style !== 'void' || o === not) continue; const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { bd = d; b = o; } } return b; }
  function ftMerge(a, b) {
    if (a.dead || b.dead) return false;
    if ((a.mass || 1) + (b.mass || 1) >= VOID_MERGE.supernova && G.t < (G.novaT || 0)) return false;
    voidCombine(a.r >= b.r ? a : b, a.r >= b.r ? b : a); return true;
  }
  const ftGrow = (o, k) => { const f = o.c7f || {}; const cap = (f.a0 || o.aura) * 2; if (o.aura * k > cap) k = Math.max(1, cap / o.aura); o.aura *= k; o.r *= Math.sqrt(k); if (o.aura0) o.aura0 *= k; if (o.r0) o.r0 *= Math.sqrt(k); };
  // A new hole: size, speed, mass and marks from the cells.
  function ftBorn(w, pr) {
    const R = id => xcR(w, id), A = FTS(w), f = pr.c7f = { born: G.t };
    let rk = xcArea(w), ak = 1, pk = 1; // (Area: the aura is scaled by areamod.js; the hole's radius here)
    if (R('range')) { const k = xcLv([1.3, 1.6, 1.9, 1.9], R('range')); pr.vx *= k; pr.vy *= k; pr.speed *= k; if (R('range') >= 4) { pr.life *= 2; pr.max = pr.life; } }
    if (R('rapid')) { rk *= 0.8; ak *= 0.85; }
    if (R('extra')) { rk *= 0.85; ak *= 0.9; }
    if (R('charged')) { const k = xcLv([1.6, 1.9, 2.2, 2.2], R('charged')); rk *= k; ak *= k; pk *= k; if (R('charged') >= 4) pr.mass = (pr.mass || 1) + 1; }
    if (R('nth')) {
      A.nth++; w.m10n = A.nth;
      if (A.nth % (R('nth') >= 2 ? 3 : 4) === 0) { f.emp = 1; pr.mass = (pr.mass || 1) + 1; if (R('nth') >= 3) { rk *= 1.3; ak *= 1.3; } if (R('nth') >= 4) f.nova = G.t + 3; }
    }
    pr.r *= rk; pr.aura *= ak; pr.pull *= pk; pr.r0 = pr.r; pr.aura0 = pr.aura; f.a0 = pr.aura;
    if (R('knock')) { f.push = pr.pull; pr.pull = 0; } // it repels instead
    if (f.emp) ring(pr.x, pr.y, pr.aura, '#ffffff', 0.4, 4);
    A.known.push(pr);
  }
  XC_STATS.ft = function (w, s) {
    const R = id => xcR(w, id);
    if (R('charged')) s.cd += xcLv([0.8, 0.7, 0.6, 0.5], R('charged')); // the wind-up
    const ex = R('extra');
    if (ex) { const n0 = s.count || 1, n1 = ex >= 3 ? 3 : n0 + 1; s.count = n1; s.dmg *= Math.pow(n0 / n1, 0.4); }
  };
  XC_FIRE.ft = function (w, target, src) {
    const R = id => xcR(w, id), p = G.player, s = w.s, A = FTS(w);
    if (R('melee') || R('orbiting')) return true; // (the hole on you and the orbit run in the tick)
    if (R('mines')) { // a dormant hole
      if (A.dorm.length >= (R('mines') >= 2 ? 2 : 1)) A.dorm.shift();
      const x = p.x + rand(-20, 20), y = p.y + rand(-20, 20); A.dorm.push({ x, y, t: G.t + 20, arm: G.t + 0.5 });
      ring(x, y, 16, w.def.color, 0.3, 2); return true;
    }
    if (!target) return false;
    if (R('dfa')) { // dropped onto the densest cluster
      const r = R('dfa'), spot = acquire('cluster', (s.range || 400) + 100, p.x, p.y) || target;
      let x = spot.x, y = spot.y;
      if (r >= 3) { const o = ftNearOrb(w, x, y, 700); if (o) { const d = Math.hypot(x - o.x, y - o.y) || 1, D = Math.min(d, o.aura * 0.9 + 20); x = o.x + (x - o.x) / d * D; y = o.y + (y - o.y) / d * D; } } // beside a hole
      G.fx.push({ type: 'warn', x, y, r: (s.aura || 72) + (r >= 2 ? 20 : 0), color: w.def.color, life: 0.6, max: 0.6 });
      after(0.6, () => {
        if (!G || !live(w)) return;
        const pr = spawnProj(w, x, y, 0, weaponSrc(w)); if (!pr) return;
        pr.vx = pr.vy = 0;
        if (r >= 2) { pr.aura += 20; pr.aura0 = pr.aura; if (pr.c7f) pr.c7f.a0 = pr.aura; }
        ring(x, y, pr.aura, w.def.color, 0.35, 4);
        if (r >= 4) { const o = ftNearOrb(w, x, y, 100 + pr.r, pr); if (o) ftMerge(o, pr); } // merges on landing
      });
      return true;
    }
    const ex = R('extra');
    if (ex >= 2) {
      const a0 = Math.atan2(target.y - p.y, target.x - p.x);
      if (ex >= 4) for (let i = 0; i < 3; i++) { // a triangle round the target that falls in on itself
        const a = a0 + i / 3 * TAU, x = target.x + Math.cos(a) * 75, y = target.y + Math.sin(a) * 75, pr = spawnProj(w, x, y, a + Math.PI, src);
        if (pr) { pr.vx *= 0.5; pr.vy *= 0.5; }
      }
      else if (ex >= 3) for (const a of [a0 - 0.3, a0 + 0.3, a0 + Math.PI]) spawnProj(w, p.x, p.y, a, src); // a pair forwards, one back
      else { for (let i = 0; i < Math.max(1, s.count - 1); i++) spawnProj(w, p.x, p.y, a0 + rand(-s.spread, s.spread) * 0.5, src); spawnProj(w, p.x, p.y, a0 + Math.PI, src); } // front and back
      sfx('shot'); return true;
    }
    return false;
  };
  function ftExpire(w, o) { // a hole ran out (not merged, not a supernova)
    const r = xcR(w, 'explode'); if (!r) return;
    const held = []; forNear(o.x, o.y, o.aura, e => { if (!e.charmed && !e.dead && held.length < 30) held.push(e); });
    const base = (o.dmg || w.s.dmg) * 4 * xcLv([1, 1.5, 2, 2], r) * (1 + 0.1 * Math.min(10, held.length)), RR = o.aura + xcLv([40, 60, 80, 80], r);
    aoe(o.x, o.y, RR, base, weaponSrc(w), w.def.color); ring(o.x, o.y, RR, w.def.color, 0.4, 5);
    if (r >= 4) for (const e of held) if (!e.dead && !e.boss) { shove(e, o.x, o.y, 420); e.xcCan = { w, t: G.t + 0.6, f: 200, k: 0.4 * base / Math.max(1, w.s.dmg) }; } // flung into their mates
  }
  XC_TICK.ft = function (w, dt) {
    const R = id => xcR(w, id), A = FTS(w), p = G.player, s = w.s;
    C.ftKin = R('kinship') >= 4 || G.weapons.some(x => x && x !== w && xcIs(x, 'ft') && xcR(x, 'kinship') >= 4);
    for (let i = A.known.length - 1; i >= 0; i--) { const o = A.known[i]; if (!o.dead) continue; A.known.splice(i, 1); if (o.life <= 0 && !o.c7nova) ftExpire(w, o); }
    if (A.known.length > 40) A.known.splice(0, A.known.length - 40);
    let orbs = ftOrbs(w);
    if ((R('rapid') || R('extra') || R('mines') || R('orbiting')) && orbs.length > 3) { // the 3-well cap
      orbs.sort((a, b) => (a.c7f ? a.c7f.born : 0) - (b.c7f ? b.c7f.born : 0));
      for (const o of orbs.slice(0, orbs.length - 3)) o.life = Math.min(o.life, 0.001);
      orbs = orbs.slice(orbs.length - 3);
    }
    const t4 = !(A.t4 > G.t); if (t4) A.t4 = G.t + 0.25;
    for (const o of orbs) {
      const f = o.c7f || (o.c7f = { born: G.t, a0: o.aura });
      const dp = Math.hypot(o.x - p.x, o.y - p.y);
      if (R('upclose')) { // stronger within 120 of you; the mastery traps what is inside
        const k = xcLv([1.4, 1.8, 2.2, 2.2], R('upclose'));
        if (dp < 120) { if (o.pull > 0) forNear(o.x, o.y, o.aura, e => { if (!e.boss && !e.charmed) mwPull(e, o.x, o.y, o.pull * (k - 1) * dt); }); if (R('upclose') >= 4 && !f.trap) { f.trap = 1; ring(o.x, o.y, o.aura, w.def.color, 0.4, 4); } }
        if (f.trap) forNear(o.x, o.y, o.aura * 1.3, e => { if (e.boss || e.charmed) return; const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 1; if (d > o.aura * 0.85) { e.x = o.x + dx / d * o.aura * 0.85; e.y = o.y + dy / d * o.aura * 0.85; e.kx = e.ky = 0; } });
      }
      if (R('knock') && f.push) { // the hole repels
        const m = f.push * xcLv([1, 1.5, 2, 2], R('knock')) * dt;
        forNear(o.x, o.y, o.aura, e => { if (e.boss || e.charmed || e.egg) return; const dx = e.x - o.x, dy = e.y - o.y, d = Math.hypot(dx, dy) || 1, nx = e.x + dx / d * m, ny = e.y + dy / d * m; if (!(G.lvl && lvSolidAt(nx, ny))) { e.x = nx; e.y = ny; } });
        if (!(f.kT > G.t)) { f.kT = G.t + 0.5; ring(o.x, o.y, o.aura, w.def.color, 0.3, 2); }
      }
      if (R('sticky')) forNear(o.x, o.y, o.aura, e => { // (slowed on the way out: below)
        if (e.charmed) return; e.c7sO = o; e.c7sL = G.t;
        if (R('sticky') >= 4 && Math.hypot(e.x - o.x, e.y - o.y) < Math.max(o.r, o.aura * 0.25) + e.r * 0.3 && !(e.c7snT > G.t)) { msSnare(e, 0.5); e.c7snT = G.t + 0.4; }
      });
      if (R('homing') && Math.hypot(o.vx, o.vy) > 5) { // drifts towards the densest cluster
        if (!(f.hT > G.t)) { f.hT = G.t + 0.25; f.ht = acquire('cluster', 350, o.x, o.y); }
        const t = f.ht;
        if (t && !t.dead) { const sp = Math.hypot(o.vx, o.vy), ca = Math.atan2(o.vy, o.vx), tr = xcLv([1, 2, 3, 4], R('homing')) * dt, na = ca + clamp(angDiff(Math.atan2(t.y - o.y, t.x - o.x), ca), -tr, tr); o.vx = Math.cos(na) * sp; o.vy = Math.sin(na) * sp; }
      }
      if (R('ricochet')) { // off walls and big enemies
        if (f.rb == null) f.rb = XC_RAMP(R('ricochet'));
        if (f.rb > 0 && !(f.rbT > G.t) && Math.hypot(o.vx, o.vy) > 5) {
          let hit = false;
          const nx = o.x + o.vx * dt * 3, ny = o.y + o.vy * dt * 3;
          if (modWall(nx, ny)) { let fx = modWall(nx, o.y), fy = modWall(o.x, ny); if (!fx && !fy) fx = fy = true; if (fx) o.vx = -o.vx; if (fy) o.vy = -o.vy; hit = true; }
          else for (const e of G.enemies) {
            if (e.dead || e.charmed || !(e.r >= 18 || e.elite || e.boss)) continue;
            const dx = o.x - e.x, dy = o.y - e.y, d = Math.hypot(dx, dy) || 1;
            if (d > o.r + e.r) continue;
            const ux = dx / d, uy = dy / d, dot = o.vx * ux + o.vy * uy; if (dot < 0) { o.vx -= 2 * dot * ux; o.vy -= 2 * dot * uy; hit = true; } break;
          }
          if (hit) { f.rb--; f.rbT = G.t + 0.3; spawnPart(o.x, o.y, w.def.color, 4, 80, 0.3, 3); ring(o.x, o.y, o.r + 8, w.def.color, 0.25, 3); if (R('ricochet') >= 4) ftGrow(o, 1.1); }
        }
      }
      if (R('focus')) forNear(o.x, o.y, Math.max(o.r, o.aura * 0.3), e => { // held in the centre: the crush ramps
        if (e.charmed) return;
        if (e.c7hO !== o || G.t - (e.c7hL || -9) > 0.3) { e.c7hO = o; e.c7hS = G.t; }
        e.c7hL = G.t; e.c7hW = w;
        if (R('focus') >= 4 && ftRamp(e, 4) >= 1.2 - 1e-6 && !e.elite && !e.boss && !e.dead) { // spaghettified
          bolt(e.x, e.y, o.x, o.y, w.def.color, 0.25); fxParts('spark', e.x, e.y, w.def.color, 10, 160, 0.4, 2);
          damageEnemy(e, e.hp * 4 + 10, msEcho(weaponSrc(w)));
        }
      });
      if (f.nova && G.t >= f.nova && !o.dead) { f.nova = 0; G.novaT = G.t + VOID_MERGE.gap; voidSupernova(o); } // Every Nth mastery
    }
    if (R('sticky')) for (const e of G.enemies) { // left the well: slowed
      const o = e.c7sO; if (!o || e.dead || G.t - e.c7sL < dt * 0.5) continue;
      e.c7sO = null; if (G.t - e.c7sL > 0.3) continue;
      msSlow(e, xcLv([0.3, 0.5, 0.7, 0.7], R('sticky')), 2); spawnPart(e.x, e.y, w.def.color, 2, 40, 0.3, 2);
    }
    if (R('rapid') >= 4 && t4) for (let i = 0; i < orbs.length; i++) for (let j = i + 1; j < orbs.length; j++) { // small holes merge twice as easily
      const a = orbs[i], b = orbs[j]; if (!a.dead && !b.dead && Math.hypot(a.x - b.x, a.y - b.y) < (a.r + b.r) * 1.3) ftMerge(a, b);
    }
    // Mines: dormant holes open when enemies come near (the mastery opens them all at once, merged)
    if (A.dorm.length) {
      const op = A.dorm.find(d => d.arm <= G.t && xcFoe(d.x, d.y, 90));
      if (op) {
        const all = R('mines') >= 4 ? A.dorm.slice() : [op];
        A.dorm = A.dorm.filter(d => !all.includes(d));
        for (const d of all) {
          const pr = spawnProj(w, op.x + rand(-4, 4), op.y + rand(-4, 4), 0, weaponSrc(w)); if (!pr) continue;
          pr.vx = pr.vy = 0;
          if (R('mines') >= 3) ftGrow(pr, 1.3);
          ring(op.x, op.y, pr.aura, w.def.color, 0.35, 4);
        }
      }
      A.dorm = A.dorm.filter(d => d.t > G.t);
    }
    if (!R('mines')) A.dorm.length = 0;
    // Orbiting: the hole circles you
    if (R('orbiting')) {
      const r = R('orbiting'), n = r >= 4 ? 2 : 1, rad = r >= 4 ? 104 : r >= 2 ? 100 : 72;
      A.oa += 1.6 * dt;
      for (let i = 0; i < n; i++) {
        let o = A.orb[i];
        const a = A.oa + i * Math.PI, x = p.x + Math.cos(a) * rad, y = p.y + Math.sin(a) * rad;
        if ((!o || o.dead) && !(A.orbT > G.t)) { o = A.orb[i] = spawnProj(w, x, y, a + Math.PI / 2, weaponSrc(w)) || null; A.orbT = G.t + Math.min(1, s.cd || 1); }
        if (!o || o.dead) continue;
        o.x = x; o.y = y; o.vx = o.vy = 0;
        if (r >= 3) for (const b of G.ebul) { // shots it bends are thrown away from you
          if (b.dead || b.c7th || Math.hypot(b.x - x, b.y - y) > o.aura * 1.6) continue;
          b.c7th = 1; const sp = Math.hypot(b.vx, b.vy) || 100, aa = Math.atan2(b.y - p.y, b.x - p.x); b.vx = Math.cos(aa) * sp; b.vy = Math.sin(aa) * sp; spawnPart(b.x, b.y, w.def.color, 1, 40, 0.2, 2);
        }
      }
      A.orb.length = n;
    } else A.orb.length = 0;
    // Melee: a small black hole sits on you
    if (R('melee')) {
      const r = R('melee'), RR = (r >= 2 ? 80 : 60) * xcArea(w), pull = (s.pull || 95) * dt;
      forNear(p.x, p.y, RR, e => {
        if (e.charmed || e.egg) return;
        const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, keep = p.r + e.r + 14; // (pulled close, never into you)
        if (d <= keep) return;
        const m = Math.min(d - keep, pull * (e.boss ? 0.25 : e.elite ? 0.5 : 1)), nx = e.x + dx / d * m, ny = e.y + dy / d * m;
        if (!(G.lvl && lvSolidAt(nx, ny))) { e.x = nx; e.y = ny; }
      });
      if (t4) forNear(p.x, p.y, RR, e => { if (!e.charmed) damageEnemy(e, s.dmg, Object.assign(weaponSrc(w), { atk: 'contact', kx: e.x - p.x, ky: e.y - p.y })); });
      const near = RR + 40, tr = 3 * dt;
      if (r >= 3) for (const b of G.ebul) { // enemy shots bend away
        if (b.dead || Math.hypot(b.x - p.x, b.y - p.y) > near) continue;
        const sp = Math.hypot(b.vx, b.vy) || 1, ca = Math.atan2(b.vy, b.vx), na = ca + clamp(angDiff(Math.atan2(b.y - p.y, b.x - p.x), ca), -tr, tr); b.vx = Math.cos(na) * sp; b.vy = Math.sin(na) * sp;
      }
      if (r >= 4) for (const q of G.proj) { // your shots bend towards enemies
        if (q.dead || q.lob || q.mine || q.style === 'void' || !q.w || Math.hypot(q.x - p.x, q.y - p.y) > near) continue;
        const t = xcFoe(q.x, q.y, 300); if (!t) continue;
        const sp = Math.hypot(q.vx, q.vy) || 1, ca = Math.atan2(q.vy, q.vx), na = ca + clamp(angDiff(Math.atan2(t.y - q.y, t.x - q.x), ca), -tr * 1.5, tr * 1.5); q.vx = Math.cos(na) * sp; q.vy = Math.sin(na) * sp;
      }
    }
  };
  const ftRamp = (e, r) => Math.min(xcLv([0.4, 0.8, 1.2, 1.2], r), Math.floor((G.t - (e.c7hS || G.t)) / 0.5) * 0.1);
  // Turncoat: satellites orbit the hole and slam into enemies being pulled in.
  XC_LIFE.ft = () => 30;
  XC_RUN.ft = function (z, dt) {
    const X = z.xcRun, w = X.w, r = xcR(w, 'turncoat'), s = w.s;
    if (X.fl) { // flung out by the supernova
      z.x += X.fl.vx * dt; z.y += X.fl.vy * dt; z.kx = z.ky = 0;
      forNear(z.x, z.y, z.r + 8, e => { if (e === z || e.charmed || e.hitT.c7fl > G.t) return; e.hitT.c7fl = G.t + 0.5; damageEnemy(e, s.dmg * 6, weaponSrc(w)); shove(e, z.x - X.fl.vx, z.y - X.fl.vy, 200); });
      if (G.t > X.fl.end) z.dead = true;
      return;
    }
    let o = X.o;
    if (!o || o.dead) {
      const nx = ftNearOrb(w, z.x, z.y, 400);
      if (nx) X.o = o = nx;
      else if (o && o.c7nova && r >= 4) { const a = Math.atan2(z.y - o.y, z.x - o.x); X.fl = { vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, end: G.t + 1 }; return; }
      else if (r >= 3 && X.cx != null) { if (!X.lose) X.lose = G.t + 2; } // outlasts the hole by 2 s
      else { z.dead = true; return; }
      if (!nx) o = null;
    }
    if (X.lose && G.t > X.lose) { z.dead = true; return; }
    if (o) { X.cx = o.x; X.cy = o.y; X.rad = Math.max(30, o.aura * 0.75); }
    if (X.cx == null) { z.dead = true; return; }
    X.ang = (X.ang == null ? Math.atan2(z.y - X.cy, z.x - X.cx) : X.ang) + 2.5 * dt;
    z.x = X.cx + Math.cos(X.ang) * X.rad; z.y = X.cy + Math.sin(X.ang) * X.rad; z.kx = z.ky = 0;
    forNear(z.x, z.y, z.r + 6, e => { if (e === z || e.charmed || e.hitT.c7sat > G.t) return; e.hitT.c7sat = G.t + 0.4; damageEnemy(e, s.dmg * 4 * (r >= 2 ? 1.3 : 1), weaponSrc(w)); spawnPart(e.x, e.y, w.def.color, 2, 60, 0.2, 2); });
  };
  // Merges: Connecting reaches further and drifts faster.
  voidMerge = (orig => function (dt) {
    const w = G && G.weapons ? G.weapons.find(x => x && xcIs(x, 'ft') && xcR(x, 'connecting')) : null;
    if (!w) return orig(dt);
    const r = xcR(w, 'connecting'), R0 = VOID_MERGE.reach, B0 = VOID_MERGE.band;
    VOID_MERGE.reach = r >= 4 ? 900 : r >= 3 ? 400 : 200; VOID_MERGE.band = B0 * (r >= 2 ? 1.6 : 1.25);
    try { orig(dt); } finally { VOID_MERGE.reach = R0; VOID_MERGE.band = B0; }
  })(voidMerge);
  voidSupernova = (orig => function (a) {
    const w = a && a.w, mine = ftOn(w);
    if (mine) a.c7nova = 1;
    const R = Math.max(220, ((a && a.aura) || 0) * 3.5);
    orig(a);
    if (!mine || !G) return;
    const k = xcArea(w);
    if (k > 1) for (const b of G.ebul) if (Math.hypot(b.x - a.x, b.y - a.y) < R * k) b.dead = true; // (Area: the blast is scaled by areamod.js)
    if (xcR(w, 'knock') >= 4) { forNear(a.x, a.y, R * k, e => { if (!e.charmed) shove(e, a.x, a.y, 780); }); ring(a.x, a.y, R * k + 200, w.def.color, 0.6, 5); } // everything 200 outward
  })(voidSupernova);
  // Kinship mastery: the well bends your shots twice as hard.
  aimBend = (orig => function (pr, dt) {
    orig(pr, dt);
    if (!C.ftKin || !G || pr.dead || !pr.w || pr.style === 'void') return;
    const H = G.aimHoles;
    if (H && H.some(h => h.src && h.src.c7f && h.src.w && xcR(h.src.w, 'kinship') >= 4 && Math.hypot(h.x - pr.x, h.y - pr.y) < h.R)) orig(pr, dt);
  })(aimBend);
  // Catalyst mastery: each reaction inside the well grows it 10%.
  rxFired = (orig => function (id, e) {
    orig(id, e);
    if (!G || !e || !G.weapons) return;
    for (const w of G.weapons) {
      if (!w || !xcIs(w, 'ft') || xcR(w, 'catalyst') < 4) continue;
      const o = ftNearOrb(w, e.x, e.y, 9999); if (!o || Math.hypot(o.x - e.x, o.y - e.y) > o.aura || o.c7f && o.c7f.rxT > G.t) continue;
      if (o.c7f) o.c7f.rxT = G.t + 0.2; ftGrow(o, 1.1); ring(o.x, o.y, o.aura, w.def.color, 0.3, 3);
    }
  })(rxFired);

  // ---------------------------------------------------------------- both: detonations, hits, damage
  mwDetonate = (orig => function (e, pw, M) {
    if (G && pw && G.weapons.includes(pw) && xcIs(pw, 'sp') && xcR(pw, 'primer')) { // in the bullet's type
      const r = xcR(pw, 'primer'), t = (M && M.c7t) || 'phys', RR = r >= 2 ? 60 : 40, k = r >= 2 ? 0.75 : 0.5;
      const src = mwSrc(pw, { mwDet: true, noRx: false, elem: t });
      aoe(e.x, e.y, RR, pw.s.dmg * k, src, tcol(t)); ring(e.x, e.y, RR, tcol(t), 0.35, 4);
      const dw = M && M.by ? [...M.by].pop() : null, dt = dw && dw.def ? mwType(dw) : null;
      if (r >= 3) forNear(e.x, e.y, RR, o => { if (o.charmed || o.dead) return; c7Fill(o, t, pw.s.dmg * k, src); if (r >= 4 && dt) fightReactAs(o, FIGHT_TYPE[dt], { raw: pw.s.dmg, once: { n: 0 }, w: pw }); });
      return;
    }
    orig(e, pw, M);
    if (!G || !pw || !G.weapons.includes(pw) || !xcIs(pw, 'ft') || xcR(pw, 'primer') < 3) return;
    const o = ftNearOrb(pw, e.x, e.y, 9999); if (!o || Math.hypot(o.x - e.x, o.y - e.y) > o.aura) return;
    ftGrow(o, 1.1); ring(o.x, o.y, o.aura, pw.def.color, 0.3, 3); // detonations inside the well grow it
    if (xcR(pw, 'primer') >= 4) { // and count as a merge
      o.mass = (o.mass || 1) + 1;
      if (o.mass >= VOID_MERGE.supernova && G.t >= (G.novaT || 0)) { G.novaT = G.t + VOID_MERGE.gap; voidSupernova(o); }
    }
  })(mwDetonate);
  wupHit = (orig => function (e, res, src) {
    orig(e, res, src);
    if (!G || !src || !res) return;
    const w = src.w;
    if (!w || !xcIs(w, 'sp') || !xcAny(w) || src.dot || src.echo) return;
    if (src.c7 && !src.c7x && !src.mwBoom && !src.mwDet && !src.rx) spHit(w, e, res, src);
    const L = SPS(w).links; if (!L.length || !(res.toHp > 0)) return; // Connecting: linked enemies share
    for (const l of L) if ((l.a === e || l.b === e) && l.t > G.t) { const o = l.a === e ? l.b : l.a; if (foeOk(o)) damageEnemy(o, res.toHp * l.share, msEcho(src)); }
  })(wupHit);
  wupDmgMul = (orig => function (e, src) {
    let k = orig(e, src);
    const w = src && src.w;
    if (!G || !w || w.isSpell || src.dot || src.echo || src.rx) return k;
    if (spOn(w)) {
      if (xcR(w, 'upclose') >= 4 && Math.hypot(e.x - G.player.x, e.y - G.player.y) < 60 + (e.r || 0)) k *= 2;
      const kr = xcR(w, 'kinship');
      if (kr) { const t = src.c7 && src.c7.m ? src.c7.m.t : 'phys', kin = G.weapons.filter(x => x && x !== w && !x.isSpell && x.def && mwType(x) === t).length; k *= 1 + (xcLv([0.08, 0.16, 0.24, 0.24], kr) + (kr >= 4 ? 0.08 : 0)) * kin; }
    } else if (ftOn(w)) {
      if (xcR(w, 'upclose') && Math.hypot(e.x - G.player.x, e.y - G.player.y) < 120 + (e.r || 0)) k *= xcLv([1.4, 1.8, 2.2, 2.2], xcR(w, 'upclose'));
      if (xcR(w, 'focus') && e.c7hW === w && G.t - (e.c7hL || -9) < 0.3) k *= 1 + ftRamp(e, xcR(w, 'focus'));
    }
    return k;
  })(wupDmgMul);

  // ---------------------------------------------------------------- drawing (world space)
  modDraw = (orig => function () {
    orig();
    if (!G || !G.weapons) return;
    const p = G.player, k = S_();
    ctx.save(); ctx.lineWidth = Math.max(1, 1.5 * k);
    for (const w of G.weapons) {
      if (!w || !xcAny(w)) continue;
      const c = col(w.def.color);
      if (xcIs(w, 'sp')) {
        const A = SPS(w);
        ctx.fillStyle = c;
        for (const o of A.orbP) { ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(sx(o.x), sy(o.y), 4.5 * k, 0, TAU); ctx.fill(); } // orbiting bullets
        for (const m of A.mines) { ctx.globalAlpha = m.arm > G.t ? 0.35 : 0.9; ctx.beginPath(); ctx.arc(sx(m.x), sy(m.y), 3.5 * k, 0, TAU); ctx.fill(); ctx.globalAlpha = 0.18; ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(sx(m.x), sy(m.y), 70 * k, 0, TAU); ctx.stroke(); } // planted bullets
        ctx.strokeStyle = c;
        for (const q of A.rain) { const f = clamp((q.at - G.t) / 0.4, 0, 1); ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), (8 + 14 * f) * k, 0, TAU); ctx.moveTo(sx(q.x) - 6 * k, sy(q.y)); ctx.lineTo(sx(q.x) + 6 * k, sy(q.y)); ctx.moveTo(sx(q.x), sy(q.y) - 6 * k); ctx.lineTo(sx(q.x), sy(q.y) + 6 * k); ctx.stroke(); } // the reticle
        ctx.globalAlpha = 0.5; for (const l of A.links) { ctx.beginPath(); ctx.moveTo(sx(l.a.x), sy(l.a.y)); ctx.lineTo(sx(l.b.x), sy(l.b.y)); ctx.stroke(); } // linked shooters
        if (A.sprFx > G.t) { ctx.globalAlpha = 0.35; for (const o of A.shot) if (foeOk(o)) { ctx.beginPath(); ctx.moveTo(sx(p.x), sy(p.y)); ctx.lineTo(sx(o.x), sy(o.y)); ctx.stroke(); } }
        if (A.tug && foeOk(A.tug.a)) { ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(sx(p.x), sy(p.y)); ctx.lineTo(sx(A.tug.a.x), sy(A.tug.a.y)); ctx.stroke(); } // the tug
        if (xcR(w, 'charged') && w.q) { const f = Math.min(1, w.q.length / (w.s.mag || 10)); ctx.globalAlpha = 0.25 + 0.5 * f; ctx.lineWidth = (2 + 4 * f) * k; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 8 + 16 * f) * k, 0, TAU); ctx.stroke(); ctx.lineWidth = Math.max(1, 1.5 * k); } // the held volley swelling
      } else if (xcIs(w, 'ft')) {
        const A = FTS(w);
        ctx.strokeStyle = c;
        for (const d of A.dorm) { ctx.globalAlpha = d.arm > G.t ? 0.3 : 0.5 + 0.2 * Math.sin(G.realT * 4); ctx.setLineDash([4 * k, 4 * k]); ctx.beginPath(); ctx.arc(sx(d.x), sy(d.y), 14 * k, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = '#10121a'; ctx.beginPath(); ctx.arc(sx(d.x), sy(d.y), 5 * k, 0, TAU); ctx.fill(); } // dormant holes
        for (const o of G.proj) {
          if (o.dead || o.w !== w || o.style !== 'void' || !o.c7f) continue;
          if (o.c7f.trap) { ctx.globalAlpha = 0.55; ctx.setLineDash([6 * k, 5 * k]); ctx.lineDashOffset = -G.realT * 20; ctx.beginPath(); ctx.arc(sx(o.x), sy(o.y), o.aura * 0.85 * k, 0, TAU); ctx.stroke(); ctx.setLineDash([]); } // the trap
          if (o.c7f.emp) { ctx.globalAlpha = 0.6 + 0.3 * Math.sin(G.realT * 8); ctx.strokeStyle = col('#ffffff'); ctx.beginPath(); ctx.arc(sx(o.x), sy(o.y), (o.r + 6) * k, 0, TAU); ctx.stroke(); ctx.strokeStyle = c; } // the empowered hole
        }
        if (xcR(w, 'focus')) for (const e of G.enemies) { if (e.dead || e.c7hW !== w || G.t - (e.c7hL || -9) > 0.3) continue; const f = ftRamp(e, xcR(w, 'focus')) / 1.2; if (f <= 0) continue; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y), (e.r + 5) * k, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx.stroke(); } // the crush ramp
        if (xcR(w, 'melee')) { const RR = (xcR(w, 'melee') >= 2 ? 80 : 60) * xcArea(w); ctx.globalAlpha = 0.16; ctx.fillStyle = '#10121a'; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), RR * k, 0, TAU); ctx.fill(); ctx.globalAlpha = 0.5; ctx.setLineDash([3 * k, 6 * k]); ctx.lineDashOffset = G.realT * 30; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), RR * k, 0, TAU); ctx.stroke(); ctx.setLineDash([]); } // the hole on you
        if (xcR(w, 'charged')) { const wd = xcLv([0.8, 0.7, 0.6, 0.5], xcR(w, 'charged')); if (w.cd > 0 && w.cd < wd && !(w.reloadT > 0)) { ctx.globalAlpha = 0.7; ctx.lineWidth = 3 * k; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 10) * k, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - w.cd / wd)); ctx.stroke(); ctx.lineWidth = Math.max(1, 1.5 * k); } } // the wind-up
      }
    }
    for (const z of G.enemies) if (z.xcRun && !z.dead && z.c7rr && xcIs(z.xcRun.w, 'sp')) { ctx.globalAlpha = 0.45; ctx.strokeStyle = col(z.xcRun.w.def.color); ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.c7rr * k, 0, TAU); ctx.stroke(); } // the bullet sponge
    ctx.restore();
  })(modDraw);

  window.C7 = { SPS, FTS, spTake, ftOrbs, ftMerge }; // (tests)
})();
