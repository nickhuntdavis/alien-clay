'use strict';
// Spawn Prawn - transforming fusions (user, 27 Oct). Five of wfusion.js's pairs rebuilt so that fusing changes how the
// weapon plays (a new pattern, a new look, a bigger spike) instead of adding a small proc. The offer, the merge, the
// new mount and the absorbed weapon's HUD slot are still wfusion.js's; this file only replaces the five powers.
//  - sibshot  Standard Issue + Sister Cousin: every Standard Issue shot homes and pierces one more. A Standard Issue kill releases 3 homing
//             siblings from the body; a sibling kill releases 2 more, for up to 4 generations (30 alive at most).
//  - pinclock Little Prick + One of These Days: needles start a visible 3 s countdown. At zero every Bleed stack goes
//             off at once (x1.5) plus half of b's damage a needle, and the blast reaches 140: Bleeding or counting
//             enemies there go off next (0.12 s apart), the rest start a 1.5 s countdown of their own (20 a chain).
//  - zapbub   Unwanted Contact + Blowing Bubbles: Blowing Bubbles stops blowing loose bubbles. Each one feeds a single
//             storm bubble that drifts onto the nearest enemy within 240 of you (else back to you), grows (70 to 140) and zaps everything inside (8 at most, a's damage x0.6,
//             Charges and slows). Fed 8 times it bursts: arcs to 24 enemies within 420 (a x2 + b x1).
//  - peekegg  Peekaboo + Eggs: vanishing leaves a decoy egg where you were. Enemies within 340 go for it; after 2.5 s
//             it explodes (170, b x2.5 + a x1), throws them outward and Fears them.
//  - lardmine Nappy Mines + Skill Issue: a mine blast throws its enemies at your nearest other mine (within 320); they
//             hit whatever they fly through (b x1.5), and that mine goes off 0.22 s later, 25% bigger (x2.5 at most), so a
//             minefield chains and swells.
// Names and card text: TODO_COPY:wf_<id>_name / _desc (the user writes them).
// Hooks: none in shared files. hookOn fire:after 'wf2:home', fire 'wf2:storm', kill 'wf2:family', proc 'wf2:clock',
// tick 'wf2:tick'. Wraps peekFire, toothLure, detonateMine, modDraw. Loads right after wfusion.js.
const WF2 = {
  fam: { first: 3, next: 2, gens: 4, cap: 30, dmgK: 1, pierce: 1, life: 1.6, speed: 340, homing: 7 },
  clock: { t: 3, bleedK: 1.5, needleK: 0.5, reach: 140, chain: 20, gap: 0.12, seed: 1.5 },
  storm: { r0: 70, r1: 140, full: 8, every: 0.35, k: 0.6, max: 8, burstR: 420, burstK: 2, burstBK: 1, burstMax: 24, lag: 2.5, leash: 240 },
  egg: { t: 2.5, lure: 340, r: 170, bK: 2.5, aK: 1, fear: 1.5 },
  mine: { reach: 320, blast: 120, t: 0.4, vMax: 760, dmgK: 1.5, gap: 0.22, grow: 1.25, growMax: 2.5 },
};
Object.assign(WF_TEXT, Object.fromEntries(['sibshot', 'pinclock', 'zapbub', 'peekegg', 'lardmine'].map(id => [id, { name: `TODO_COPY:wf_${id}_name`, desc: `TODO_COPY:wf_${id}_desc` }])));

// ---------------------------------------------------------------- sibshot: the family
function wf2Home(w, n0) {
  const F = wfPair('sibshot'); if (!F || w !== F.a) return;
  for (let i = n0; i < G.proj.length; i++) { const pr = G.proj[i]; if (pr.w === w && !pr.mine && !pr.lob) { pr.homing = Math.max(pr.homing || 0, 6); pr.pierce = (pr.pierce || 0) + WF2.fam.pierce; } }
}
function wf2Family(e, src) {
  const F = wfPair('sibshot'), C = WF2.fam; if (!F || !src) return;
  const gen = src.wfFam || (src.w === F.a ? 0 : -1); if (gen < 0 || gen >= C.gens) return;
  let alive = 0; for (const pr of G.proj) if (pr.wfFam && !pr.dead) alive++;
  const B = F.b, n = gen ? C.next : C.first;
  for (let i = 0; i < n && alive < C.cap; i++, alive++) {
    const o = acquire('nearest', 300, e.x + rand(-40, 40), e.y + rand(-40, 40), e), a = o ? Math.atan2(o.y - e.y, o.x - e.x) + rand(-0.5, 0.5) : Math.random() * TAU;
    spawnProj(B, e.x, e.y, a, wfSrc(B, { wfFam: gen + 1 }), { r: 4 + gen, speed: C.speed, vx: Math.cos(a) * C.speed, vy: Math.sin(a) * C.speed, life: C.life, dmg: B.s.dmg * C.dmgK, pierce: 0, style: 'sperm', color: B.def.color, bounce: 0, homing: C.homing, wfFam: gen + 1, noMods: true });
  }
  fxParts('spark', e.x, e.y, B.def.color, 6 + gen * 2, 120, 0.35, 2);
  ring(e.x, e.y, e.r + 14 + gen * 6, B.def.color, 0.25, 2);
}

// ---------------------------------------------------------------- pinclock: the countdowns
function wf2Clock(e, src) {
  const F = wfPair('pinclock'); if (!F || !src || src.w !== F.a || e.dead) return;
  const C = e.wfClock || (e.wfClock = { end: G.t + WF2.clock.t, max: WF2.clock.t, n: 0 });
  C.n++;
}
function wf2Pop(e, C, F) {
  const K = WF2.clock, B = F.b, ch = C.ch || { n: 0 };
  ch.n++;
  const left = (e.bleeds || []).reduce((a, b) => a + b.dps * b.t, 0); e.bleeds = [];
  damageEnemy(e, left * K.bleedK + B.s.dmg * K.needleK * Math.max(1, C.n), wfSrc(B, { elem: 'arcane' }));
  ring(e.x, e.y, K.reach, B.def.color, 0.4, 5); ring(e.x, e.y, e.r + 24, '#ffffff', 0.2, 3);
  fxParts('spark', e.x, e.y, ELEMENTS.arcane.color, 14, 200, 0.45, 3);
  cam.shake = Math.min(12, cam.shake + 2); sfx('boom');
  if (ch.n >= K.chain) return;
  forNear(e.x, e.y, K.reach, o => {
    if (o === e || !wfLive(o) || Math.hypot(o.x - e.x, o.y - e.y) > K.reach + o.r) return;
    const t = (o.bleeds && o.bleeds.length) || o.wfClock ? K.gap : K.seed, O = o.wfClock;
    if (O) { O.end = Math.min(O.end, G.t + t); O.ch = O.ch || ch; }
    else o.wfClock = { end: G.t + t, max: t, n: 1, ch };
  });
}
function wf2Clocks() {
  const F = wfPair('pinclock'); if (!F) return;
  for (const e of G.enemies) {
    const C = e.wfClock; if (!C || C.end > G.t) continue;
    e.wfClock = null; if (wfLive(e)) wf2Pop(e, C, F);
  }
}

// ---------------------------------------------------------------- zapbub: the storm bubble
function wf2Feed(w) {
  const F = wfPair('zapbub'); if (!F || w !== F.b) return false;
  const p = G.player, St = G.wf2Storm || (G.wf2Storm = { x: p.x, y: p.y, charge: 0, zapT: 0, r: WF2.storm.r0 });
  St.charge += Math.max(1, w.s.count || 1);
  fxParts('bubble', p.x, p.y, w.def.color, 4, 60, 0.4, 3);
  sfx('shot');
  return true;
}
function wf2Storm(dt) {
  const F = wfPair('zapbub'), St = G.wf2Storm, K = WF2.storm;
  if (!F || !St) { if (St && !F) G.wf2Storm = null; return; }
  const p = G.player, A = F.a, k = Math.min(1, dt * K.lag), o = acquire('nearest', K.leash, p.x, p.y), tx = o ? o.x : p.x, ty = o ? o.y : p.y;
  St.x += (tx - St.x) * k; St.y += (ty - St.y) * k; // (it drifts onto the nearest enemy within the leash, else back to you)
  St.r = K.r0 + (K.r1 - K.r0) * Math.min(1, St.charge / K.full);
  if (St.charge >= K.full) {
    St.charge = 0; let n = 0;
    forNear(St.x, St.y, K.burstR, e => {
      if (n >= K.burstMax || !wfLive(e)) return; n++;
      bolt(St.x, St.y, e.x, e.y, A.def.color, 0.25);
      damageEnemy(e, A.s.dmg * K.burstK + F.b.s.dmg * K.burstBK, wfSrc(A, { elem: 'shock' }));
      if (!e.dead) e.chargeT = Math.max(e.chargeT || 0, G.t + 3);
    });
    ring(St.x, St.y, K.burstR, A.def.color, 0.5, 6); ring(St.x, St.y, St.r, '#ffffff', 0.3, 4);
    fxParts('bubble', St.x, St.y, F.b.def.color, 18, 260, 0.6, 4);
    cam.shake = Math.min(14, cam.shake + 6); sfx('boom');
    return;
  }
  if ((St.zapT -= dt) > 0) return;
  St.zapT = K.every; let n = 0;
  forNear(St.x, St.y, St.r, e => {
    if (n >= K.max || !wfLive(e) || Math.hypot(e.x - St.x, e.y - St.y) > St.r + e.r) return; n++;
    bolt(St.x + rand(-St.r, St.r) * 0.3, St.y + rand(-St.r, St.r) * 0.3, e.x, e.y, A.def.color, 0.12);
    damageEnemy(e, A.s.dmg * K.k, wfSrc(A, { elem: 'shock' }));
    if (!e.dead) { e.chargeT = Math.max(e.chargeT || 0, G.t + 3); if (!e.boss) e.dazeSlowT = Math.max(e.dazeSlowT || 0, G.t + 0.6); }
  });
}

// ---------------------------------------------------------------- peekegg: the decoy egg
function wf2Egg() {
  const Eg = G.wf2Egg; if (!Eg || G.t < Eg.end) return;
  G.wf2Egg = null;
  const F = wfPair('peekegg'), K = WF2.egg; if (!F) return;
  const dmg = F.b.s.dmg * K.bK + F.a.s.dmg * K.aK, src = wfSrc(F.b, { elem: 'soul' });
  forNear(Eg.x, Eg.y, K.r, e => {
    if (!wfLive(e) || Math.hypot(e.x - Eg.x, e.y - Eg.y) > K.r + e.r) return;
    damageEnemy(e, dmg, src);
    if (!e.dead && !e.boss) { shove(e, Eg.x, Eg.y, 320); e.fearT = Math.max(e.fearT || 0, G.t + K.fear); }
  });
  ring(Eg.x, Eg.y, K.r, F.b.def.color, 0.5, 6); ring(Eg.x, Eg.y, K.r * 0.5, '#ffffff', 0.3, 3);
  fxParts('spark', Eg.x, Eg.y, F.b.def.color, 22, 260, 0.6, 4);
  cam.shake = Math.min(14, cam.shake + 6); sfx('boom');
}

// ---------------------------------------------------------------- lardmine: the minefield
function wf2Fly(dt) {
  for (const e of G.enemies) {
    const Fl = e.wf2Fly; if (!Fl) continue;
    if (e.dead || G.t > Fl.end) { e.wf2Fly = null; continue; }
    e.x += Fl.vx * dt; e.y += Fl.vy * dt;
    forNear(e.x, e.y, e.r + 6, o => { if (o === e || Fl.hit.has(o) || !wfLive(o)) return; Fl.hit.add(o); damageEnemy(o, Fl.dmg, Fl.src); if (!o.dead) shove(o, e.x, e.y, 200); });
  }
}

// ---------------------------------------------------------------- wiring
hookOn('fire:after', 'wf2:home', (w, target, n0) => wf2Home(w, n0));
hookOn('fire', 'wf2:storm', w => wf2Feed(w), -1); // (before toyFire)
hookOn('kill', 'wf2:family', (e, src) => wf2Family(e, src));
hookOn('proc', 'wf2:clock', (e, dmg, src) => wf2Clock(e, src));
hookOn('tick', 'wf2:tick', dt => { if (!G || G.state !== 'play') return; wf2Clocks(); wf2Storm(dt); wf2Egg(); wf2Fly(dt); });

(function wf2Wrap() {
  const pf = peekFire;
  peekFire = function (w) {
    const r = pf.apply(this, arguments), F = wfPair('peekegg');
    if (F && w === F.a && !w.echo && G.peek && G.peek.w === w && !(G.wf2Egg && G.wf2Egg.end > G.t)) G.wf2Egg = { x: G.peek.x, y: G.peek.y, born: G.t, end: G.t + WF2.egg.t };
    return r;
  };
  const tl = toothLure;
  toothLure = function (e) {
    const Eg = G.wf2Egg;
    if (Eg && Eg.end > G.t && !e.boss && Math.hypot(Eg.x - e.x, Eg.y - e.y) < WF2.egg.lure) return Eg;
    return tl.apply(this, arguments);
  };
  const dm = detonateMine;
  detonateMine = function (pr) {
    const F = wfPair('lardmine'), mine = F && pr && pr.w === F.a, x = pr && pr.x, y = pr && pr.y;
    const r = dm.apply(this, arguments);
    if (!mine) return r;
    const K = WF2.mine;
    let next = null, nd = K.reach;
    for (const m of G.proj) if (m.mine && m.w === F.a && m !== pr && !m.dead && !m.wf2Lit) { const d = Math.hypot(m.x - x, m.y - y); if (d < nd) { nd = d; next = m; } }
    const src = wfSrc(F.b, { elem: 'phys' });
    forNear(x, y, K.blast, e => {
      if (!wfLive(e) || e.boss || e.rival || e.egg || Math.hypot(e.x - x, e.y - y) > K.blast + e.r) return;
      let a, v;
      if (next) { a = Math.atan2(next.y - e.y, next.x - e.x); v = Math.min(K.vMax, Math.hypot(next.x - e.x, next.y - e.y) / K.t); }
      else { a = Math.atan2(e.y - y, e.x - x); v = K.vMax * 0.6; }
      e.wf2Fly = { vx: Math.cos(a) * v, vy: Math.sin(a) * v, end: G.t + K.t, hit: new Set([e]), dmg: F.b.s.dmg * K.dmgK, src };
    });
    ring(x, y, K.blast, F.b.def.color, 0.3, 4);
    if (next) {
      next.wf2Lit = true; next.charge = Math.min(K.growMax, (pr.charge || 1) * K.grow); bolt(x, y, next.x, next.y, F.b.def.color, K.gap + 0.1);
      after(K.gap, () => { if (!next.dead) { next.dead = true; detonateMine(next); } });
    }
    return r;
  };
  modDraw = (orig => function () {
    orig.apply(this, arguments);
    if (!G || !G.wf) return;
    wf2Draw();
  })(modDraw);
})();

function wf2Draw() {
  ctx.save();
  // the countdowns: a ring that drains, blinking in its last third
  const Fc = wfPair('pinclock');
  if (Fc) {
    const c = col(Fc.b.def.color);
    for (const e of G.enemies) {
      const C = e.wfClock; if (!C || e.dead) continue;
      const k = clamp((C.end - G.t) / (C.max || 1), 0, 1), R = (e.r + 10) * S;
      if (k < 0.34 && Math.floor(G.t * 10) % 2) continue;
      ctx.globalAlpha = 0.25; ctx.strokeStyle = c; ctx.lineWidth = 5 * S;
      ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y), R, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 0.9; ctx.lineWidth = 3 * S;
      ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y), R, -Math.PI / 2, -Math.PI / 2 + k * TAU); ctx.stroke();
    }
  }
  // the storm bubble: a film with a fill that rises as it charges, and crackle inside
  const St = G.wf2Storm, Fz = wfPair('zapbub');
  if (St && Fz) {
    const x = sx(St.x), y = sy(St.y), R = St.r * S, k = Math.min(1, St.charge / WF2.storm.full);
    ctx.globalAlpha = 0.1 + 0.15 * k; ctx.fillStyle = col(Fz.a.def.color);
    ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.55; ctx.strokeStyle = col(Fz.b.def.color); ctx.lineWidth = 2.5 * S;
    ctx.beginPath(); ctx.arc(x, y, R * (1 + Math.sin(G.t * 6) * 0.02), 0, TAU); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(x - R * 0.4, y - R * 0.45, Math.max(2, R * 0.08), 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.35 + 0.5 * k; ctx.strokeStyle = col(Fz.a.def.color); ctx.lineWidth = 1.5 * S;
    const n = 2 + Math.round(k * 4);
    for (let i = 0; i < n; i++) {
      let a = Math.random() * TAU, px = x, py = y;
      ctx.beginPath(); ctx.moveTo(px, py);
      for (let j = 0; j < 3; j++) { a += rand(-0.8, 0.8); px += Math.cos(a) * R * 0.3; py += Math.sin(a) * R * 0.3; ctx.lineTo(px, py); }
      ctx.stroke();
    }
  }
  // the decoy egg: wobbles harder and cracks as it nears the blast
  const Eg = G.wf2Egg, Fe = wfPair('peekegg');
  if (Eg && Fe) {
    const k = clamp((G.t - Eg.born) / WF2.egg.t, 0, 1), x = sx(Eg.x), y = sy(Eg.y), w = 18 * S, h = 24 * S, wob = Math.sin(G.t * (8 + k * 30)) * 0.25 * k;
    ctx.globalAlpha = 0.2; ctx.strokeStyle = col(Fe.b.def.color); ctx.lineWidth = 2 * S;
    ctx.beginPath(); ctx.arc(x, y, WF2.egg.lure * S * (0.95 + 0.05 * Math.sin(G.t * 4)), 0, TAU); ctx.stroke();
    ctx.translate(x, y); ctx.rotate(wob);
    ctx.globalAlpha = 0.25 + 0.25 * k; ctx.fillStyle = col(Fe.b.def.color);
    ctx.beginPath(); ctx.ellipse(0, 0, w * 1.6, h * 1.5, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.95;
    ctx.beginPath(); ctx.ellipse(0, 0, w, h, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2b2d42'; ctx.lineWidth = 2.5 * S; ctx.stroke();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5 * S; ctx.globalAlpha = 0.4 + 0.6 * k;
    ctx.beginPath(); ctx.moveTo(-w * 0.8, -h * 0.1);
    const teeth = 2 + Math.floor(k * 4);
    for (let i = 1; i <= teeth; i++) ctx.lineTo(-w * 0.8 + w * 1.6 * i / teeth, -h * 0.1 + (i % 2 ? -1 : 1) * h * 0.18);
    ctx.stroke();
  }
  ctx.restore();
}
