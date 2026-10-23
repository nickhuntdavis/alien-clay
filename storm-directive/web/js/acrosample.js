'use strict';
// Spawn Prawn - Sample 9 (PROPOSED; spec: ../redesign docs/SAMPLE_9_ACRO.md, SAMPLES.md 9, FEATS.md X9, CONSCIOUSNESS.md 9).
// Every player-facing string is a TODO_COPY placeholder (briefs: SAMPLE_9_ACRO.md 6.1, 6.2, 6.2a).
//  - The sample: id 'acro', strain 9, Acid / Fire (the draft lean), starters acro_cap, acro_spray, acro_spark (acro.js).
//  - Passive: Corrosion bars pay off at 50% (exaggerated from 70%, user 23 Oct) (a Shell layer strips early; with no Shell, Corroded early).
//  - Unique Feat 'acro_release' (slot 1): an Acid burst fills every nearby Corrosion bar and leaves an Acid Pool; then your
//    Acid damage is -25% for 4 s (the cap is spent), shown by a bare head. (Tuned 20 Oct after a sim: was -50% for 6 s.)
//  - Exclusive gift X9 'acro_x9' (drafted, this sample only): stay still for 1 s and an Acid Pool spills out around you. The
//    first sample-exclusive gift in code: its acquire card is eligible only while you play this sample.
//  - Unlock: strip 50 Shell layers in one run (S10_ALL opens every sample for testing anyway).
//  - Body: natural family (samplelooks.js), the baseline anatomy with an oversized fizzing pink acrosome; bare while spent.
//  - The tell (SAMPLES.md 9): it lurches forward a beat before every turn. Cosmetic only: when your swim heading starts to
//    swing, the drawn body (head and tail together) darts a few units ahead along the new heading and settles back,
//    with a fizz off the cap. The hitbox and movement are unchanged. Wraps samplelooks.js sampleLook (render.js drawShip).
// Hooks: none in shared files. Wraps samples10.js s10Tick, s10DmgMul, s10Hit (all called from v10.js / fight.js) and
// samplelooks.js sampleLook (the lurch).
// index.html loads this after feats10.js (needs SAMPLES10, S10_BY, PROFILES, feat(), SL tables, w2BarBump).
(function () {
  if (typeof V10 === 'undefined' || !V10 || typeof SAMPLES10 === 'undefined' || typeof feat !== 'function') return;
  const T = id => (typeof ACRO_COPY !== 'undefined' && ACRO_COPY[id]) || 'TODO_COPY:' + id, ID = 'acro', PINK = TYPE_PAL.fire;

  // ------------------------------------------------------------ the sample
  const S = { id: ID, name: T('s9_name'), origin: T('acro_origin'), types: ['acid', 'fire'], passive: T('acro_passive'), pdesc: T('acro_pdesc'),
    line: T('acro_line'), sci: T('acro_sci'), unlock: { txt: T('acro_unlock') } };
  S.weapons = w24Starters(ID); S.strain = SAMPLES10.length + 1;
  SAMPLES10.push(S); S10_BY[ID] = S;
  PROFILES['s10_' + ID] = { name: S.name, trait: S.passive, fmt: () => S.pdesc, desc: S.pdesc, weapons: S.weapons, s10: ID, apply: () => {} };
  if (typeof SEQ_LOOK !== 'undefined') SEQ_LOOK['s10_' + ID] = Object.assign({}, SEQ_LOOK.human1 || SEQ_LOOK.vanguard, { short: 'SAMPLE 9' });

  const D = () => f10();
  const spent = () => { const s = G && G.f10 && G.f10.acSpent; return s && s.end > G.t ? s : null; };
  const payNow = (e, src) => (e.cd && !e.dead ? w2BarBump(e, 'acid', Math.max(0.001, 1.001 - e.cd.bars.acid), src) : null);

  // ------------------------------------------------------------ passive, penalty, unlock (wrapped samples10.js hooks)
  const _hit = s10Hit, _mul = s10DmgMul, _tick = s10Tick;
  s10Hit = function (e, src, res, t) {
    _hit(e, src, res, t);
    if (!G.s10 || G.s10.id !== ID || res.miss) return;
    if (t === 'acid' && res.statusOk && !e.dead && e.cd && e.cd.bars.acid >= 0.5) { payNow(e, src); ring(e.x, e.y, e.r + 5, PINK, 0.25, 2); } // (early payoff)
    const sp = spent(), w = sp && f10Own('acro_release');
    if (sp && res.layersLost > 0 && f10Fk(w, 'regrow')) { sp.end -= 1; if (w) w.cd = Math.max(0, w.cd - 1); }
  };
  s10DmgMul = function (e, src) {
    let k = _mul(e, src); const sp = spent();
    if (sp && G.s10 && G.s10.id === ID && src && src.elem === 'fire' && !src.fromAlly) k *= sp.k; // (Acid's internal id is 'fire')
    return k;
  };
  s10Tick = function (dt) {
    _tick(dt); const s = G.s10; if (!s) return;
    if (G.fst && G.fst.layers >= 50) s10Unlock(ID);
    if (s.id !== ID) return;
    const d = D(), p = G.player, X = d.acDrip;
    if (X && G.t < X.end) { // X9's drip: the spill trails behind you once you move off
      if (Math.hypot(p.x - X.x, p.y - X.y) > 70 && (X.tk -= dt) <= 0) { X.tk = 0.3; f10Patch(X.w, p.x, p.y, 30, 2, 'acid', X.w.s.dmg); }
    } else if (X) d.acDrip = null;
  };

  // ------------------------------------------------------------ Unique Feat (slot 1)
  const fk2 = (id, n) => fk(id, T(n), T(n + '_desc'));
  feat({ id: 'acro_release', sample: ID, name: T('acro_feat_name'), icon: '9F', ico: 'droplet', type: 'acid', atk: 'burst', rar: 0, stam: 24,
    line: T('acro_feat_line'), does: T('acro_feat_does'),
    base: { dmg: 10, cd: 14, area: 220 },
    stat: (w, s) => { if (f10Fk(w, 'wide')) s.area *= 1.4; },
    when: w => { const p = me(); return f10Near(p.x, p.y, w.s.area).length >= 4 ? {} : null; },
    fire: w => {
      const p = me(), s = w.s, src = f10Src(w, { atk: 'burst' }), list = f10Near(p.x, p.y, s.area);
      f10Burst(w, p.x, p.y, s.area, s.dmg, null, PINK);
      for (const e of list) {
        if (e.dead) continue; const c = fightCd(e);
        if (e.boss) w2BarBump(e, 'acid', 0.5, src); else payNow(e, src);
        if (f10Fk(w, 'strip') && !e.boss && !e.dead && c.def === 'shell' && c.layers > 0) payNow(e, src);
      }
      f10Patch(w, p.x, p.y, 90, 3, 'acid', s.dmg * 0.8);
      const quick = f10Fk(w, 'quick'); D().acSpent = { end: G.t + (quick ? 2 : 4), k: quick ? 0.9 : 0.75 }; // (tuned 20 Oct: was -50% for 6 s, -25% for 3 s)
      ring(p.x, p.y, s.area, PINK, 0.45, 5); fxParts('bubble', p.x, p.y, PINK, 18, 160, 0.6, 3);
    },
    forks: { 3: [fk2('wide', 'acro_feat_fk3_wide'), fk2('quick', 'acro_feat_fk3_quick')], 5: [fk2('strip', 'acro_feat_fk5_strip'), fk2('regrow', 'acro_feat_fk5_regrow')] } });

  // ------------------------------------------------------------ exclusive gift X9 (drafted; this sample only)
  const X9 = feat({ id: 'acro_x9', name: T('acro_x9_name'), icon: 'X9', ico: 'droplet', type: 'acid', atk: 'pool', trig: 1, rar: 1, stam: 12,
    line: T('acro_x9_line'), does: T('acro_x9_does'),
    base: { dmg: 6, cd: 8, area: 90, dur: 3 },
    stat: (w, s) => { if (f10Fk(w, 'spill')) s.area *= 1.5; },
    when: w => (D().stayT >= (f10Fk(w, 'fidget') ? 0.5 : 1) ? {} : null), // (Nesting's stand-still clock: feats10.js f10Tick)
    fire: w => {
      const p = me(), s = w.s; f10Patch(w, p.x, p.y, s.area, s.dur, 'acid', s.dmg);
      if (f10Fk(w, 'topup')) for (const z of G.zones) if (z.elem === 'fire' && z.life > 0 && Math.hypot(z.x - p.x, z.y - p.y) < s.area + z.r) z.life = z.max;
      if (f10Fk(w, 'drip')) D().acDrip = { w, x: p.x, y: p.y, end: G.t + 3 + s.dur, tk: 0 };
      ring(p.x, p.y, s.area, PINK, 0.35, 4); fxParts('bubble', p.x, p.y, PINK, 10, 70, 0.7, 3, -Math.PI / 2, 1);
    },
    forks: { 3: [fk2('spill', 'acro_x9_fk3_spill'), fk2('drip', 'acro_x9_fk3_drip')], 5: [fk2('fidget', 'acro_x9_fk5_fidget'), fk2('topup', 'acro_x9_fk5_topup')] } });
  Object.defineProperty(X9, 'start', { get: () => !!(G && G.s10 && G.s10.id === ID), configurable: true }); // (only this sample's drafts offer it)

  // ------------------------------------------------------------ the body (samplelooks.js)
  if (typeof SL !== 'undefined') {
    SL[ID] = Object.assign({}, SL.baseline, { beat: 1.1, tw: 2.0 });
    SL_TAIL[ID] = SL_TAIL.baseline;
    SL_SHAPE[ID] = SL_SHAPE.baseline;
    SL_FAMILY[ID] = SL_FAMILY.baseline;
    SL_HEAD[ID] = (k, a, now, tag, hit, B) => {
      const bare = !!(G && G.s10 && G.s10.id === ID && spent()), f = bare ? 0.55 : 1.35 + 0.05 * Math.sin(now * 9); // (oversized and fizzing; small and bare while spent)
      slNatHead(k, a, tag || (bare ? null : PINK), { mid: [[-5, 0], [-11, 0]], mw: 2, mito: 0,
        path: () => slEll(1 * k, 0, 7.5 * k, 5 * k), cap: () => slEll((3.6 + (f - 1) * 1.6) * k, 0, 4.4 * f * k, 4.3 * f * k), band: -2.6 * k, bandR: 4 });
      if (!bare) { ctx.fillStyle = '#ffd6ee'; for (let i = 0; i < 3; i++) { const t = (now * 1.7 + i / 3) % 1; ctx.globalAlpha = a * (1 - t) * 0.8; slEll((6 + 4 * t) * k, (Math.sin(i * 2.4) * 4 - 2 * t) * k, 0.8 * k, 0.8 * k); ctx.fill(); } ctx.globalAlpha = a; }
    };
  }

  // ------------------------------------------------------------ the tell: a lurch before every turn (cosmetic)
  const LURCH = { dist: 7, dur: 0.2, turn: 0.55, gap: 0.35 }; // (world units, seconds, radians of heading swing, seconds between lurches)
  if (typeof sampleLook === 'function') {
    const _look = sampleLook;
    sampleLook = function (x, y, face, tag, alpha, scale, body, look) {
      if (!(body && G && body === G.player && G.s10 && G.s10.id === ID)) return _look(x, y, face, tag, alpha, scale, body, look);
      const L = body.acL || (body.acL = { h: null, acc: 0, t0: -9, dir: 0, last: G.realT }), now = G.realT, dt = Math.min(0.1, Math.max(0, now - L.last));
      L.last = now;
      const v = Math.hypot(body.vx || 0, body.vy || 0);
      if (v > 40) {
        const h = Math.atan2(body.vy, body.vx);
        if (L.h != null) L.acc = L.acc * Math.max(0, 1 - dt * 4) + Math.abs(angDiff(h, L.h)); // (heading swing in the last quarter second or so)
        L.h = h;
        if (L.acc > LURCH.turn && now - L.t0 > LURCH.gap) { L.t0 = now; L.dir = h; L.acc = 0; if (!(G.f10 && G.f10.acSpent && G.f10.acSpent.end > G.t)) fxParts('bubble', body.x + Math.cos(h) * 10, body.y + Math.sin(h) * 10, PINK, 3, 50, 0.35, 2); }
      } else { L.h = null; L.acc = 0; }
      const u = (now - L.t0) / LURCH.dur;
      if (u < 0 || u >= 1) return _look(x, y, face, tag, alpha, scale, body, look);
      const d = LURCH.dist * Math.sin(Math.PI * u) * (u < 0.35 ? 1 : 1 - (u - 0.35) * 0.6), ox = Math.cos(L.dir) * d, oy = Math.sin(L.dir) * d;
      body.x += ox; body.y += oy; // (the tail is pinned to the drawn neck, so it comes along)
      try { return _look(x + ox * S, y + oy * S, face, tag, alpha, scale, body, look); } finally { body.x -= ox; body.y -= oy; }
    };
  }
})();
