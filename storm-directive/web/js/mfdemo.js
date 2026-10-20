'use strict';
// Spawn Prawn - previews and branch scenes for the Mucus and Fire weapons, on the sidemo.js engine with the bldemo.js,
// fbdemo.js and asdemo.js (xs* statuses) helpers.
//  - Nocturnal Emission (v_ice_pool): a lobbed snot trap (58 wide, 3.5 s, 2 down at once) that Snares what crosses it.
//  - Ewww, Gross (s_redtape): tapes up to 4 nearby cells into a bundle for 5 s; whatever hurts one hurts the rest 35%.
//  - Blowing Bubbles (s_bubble): a slow bubble that traps a small cell for 5 s; anything touching the bubble pops it.
//  - Hot Mess (v_flame_pool): a lobbed burning patch (58 wide, 3.5 s) that fills the Burn bars of what stands in it.
//  - Nappy Mines (s_mines): mines dropped behind you as you swim; a touch sets one off (72 wide, 34), it fills Burn bars
//    and leaves a small burning patch.
//  - The Runs (s_wake): no aiming; a burning trail wherever you swim (2.2 s a piece).
// Hooks: none (PV_OWN entries).

const MF_SNOT = '#7fd04a', MF_TAPE = '#d62828';
function mfConj(pv, a, b) { if (!a || !b || a === b || a.conj || b.conj) return; a.conj = b; b.conj = a; sivTxt(pv, (a.x + b.x) / 2, (a.y + b.y) / 2 - 0.04, 'CONJOINED', MF_SNOT); }
function mfStepConj(pv) { for (const e of sivAlive(pv)) { const o = e.conj; if (!o) continue; if (o.hp <= 0) { e.conj = null; continue; } const d = sivD(e, o), L = e.r + o.r + 0.005; if (d > L) { const k = (d - L) / 2 / d; e.x += (o.x - e.x) * k; e.y += (o.y - e.y) * k; o.x -= (o.x - e.x) * k; o.y -= (o.y - e.y) * k; } } }
function mfDrawConj(pv, g, X, Y) { for (const e of sivAlive(pv)) if (e.conj && e.conj.hp > 0 && e.id0 < e.conj.id0) { g.strokeStyle = MF_SNOT; g.lineWidth = 3; g.beginPath(); g.moveTo(X(e.x), Y(e.y)); g.lineTo(X(e.conj.x), Y(e.conj.y)); g.stroke(); } }
let MF_ID = 0;
const mfFoe = (pv, x, y, o) => { const e = sivFoe(pv, x, y, o); e.id0 = ++MF_ID; return e; };
function mfLob(pv, t, o) { const me = pv.me; me.a = Math.atan2(t.y - me.y, t.x - me.x); me.kick = 0.008; pv.lobs.push(Object.assign({ sx: me.x, sy: me.y, tx: t.x, ty: t.y, k: 0 }, o)); }
function mfStepLobs(pv, dt, land) { for (const L of pv.lobs) { L.k += dt / 0.55; if (L.k >= 1) { L.done = true; land(pv, L); } } pv.lobs = pv.lobs.filter(L => !L.done); }
function mfDrawLobs(pv, g, X, Y, U, col) { for (const L of pv.lobs) { const x = X(L.sx + (L.tx - L.sx) * L.k), y = Y(L.sy + (L.ty - L.sy) * L.k) - Math.sin(L.k * Math.PI) * U * 0.1; pvGlow(g, x, y, U * 0.03, col, 0.8); g.fillStyle = col; g.beginPath(); g.arc(x, y, U * 0.01, 0, TAU); g.fill(); } }
function mfPatrol(pv, dt, fx, fy, k) { const me = pv.me, h = fbHome(pv); h.x = fx(pv.t); h.y = fy(pv.t); const ox = me.x, oy = me.y; me.x += (h.x - me.x) * Math.min(1, dt * (k || 3)); me.y += (h.y - me.y) * Math.min(1, dt * (k || 3)); const v = Math.hypot(me.x - ox, me.y - oy) / dt; if (v > 0.01) me.a = Math.atan2(me.y - oy, me.x - ox); return v; }

// ================================================================ Nocturnal Emission (snot traps)
const NEV = { id: 'v_ice_pool', range: 0.65, cd: 1, mag: 4, reload: 1.6, dmg: 9, r: 0.1, dur: 3.5, max: 2 };
const NEV_FLAG = { A: 'strength', B: 'bog', C: 'work', 'Extra Strength Snot': 'strength', Stringy: 'stringy', 'Rising Damp': 'damp', 'Floater': 'bubble',
  'Bogged Down': 'bog', 'Bad Company': 'company', 'Gag Reflex': 'gag', 'Sneeze Guard': 'sneeze', Snotwork: 'work', 'Spare Hankies': 'hankies', Twang: 'twang',
  'Bogey Man': 'bogey', 'Snot Ocean': 'ocean', Superglue: 'glue', 'Snotwork Everywhere': 'everywhere' };
function nevInit(pv) {
  const F = xsInit(pv, { range: NEV.range, mag: NEV.mag, reload: NEV.reload, rate: NEV.cd, lobs: [], traps: [], strands: [], bogeys: [], bubbles: [], dropT: 0 });
  pv.max = F.has('everywhere') ? 8 : F.has('bog') ? 1 : F.has('hankies') ? 4 : NEV.max;
  pv.tr = NEV.r * (F.has('work') ? 0.7 : 1) * (F.has('ocean') ? 3 : 1); pv.dur = NEV.dur * (F.has('strength') ? 0.75 : 1) * (F.has('ocean') ? 2 : 1);
  pv.me.x = 0.16; if (F.has('everywhere')) pv.patrol = true;
}
function nevWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 7; i++) mfFoe(pv, 0.75 + R() * 0.3, H * (0.15 + R() * 0.7), { hp: 60, sp: 0.06 });
  if (F.has('gag') || F.has('sneeze')) mfFoe(pv, 0.7, H * 0.2, { hp: 400, sp: 0.03, spit: true, spitCd: 1.2 });
}
function nevTrap(pv, x, y) {
  pv.traps.push({ x, y, r: pv.tr, t: pv.dur, max: pv.dur, n: 0, seen: new Set(), blockT: 0 });
  while (pv.traps.length > pv.max) pv.traps.shift();
  if (pv.F.has('work') || pv.F.has('everywhere')) { pv.strands = []; for (let i = 0; i < pv.traps.length; i++) for (let j = i + 1; j < pv.traps.length; j++) if (pv.F.has('everywhere') || sivD(pv.traps[i], pv.traps[j]) < 0.34) pv.strands.push([pv.traps[i], pv.traps[j]]); }
  for (const e of sivAlive(pv)) if (sivD(e, { x, y }) < pv.tr + e.r) sivDamage(pv, e, NEV.dmg, false, MF_SNOT);
}
function nevFire(pv) {
  if (pv.F.has('everywhere')) return false;
  const me = pv.me, t = fbCluster(pv, me, pv.range, 0.12); if (!t) return false;
  const lead = t.x - 0.06; mfLob(pv, { x: lead, y: t.y }); return true; // (a little ahead of the crowd)
}
function nevStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  if (pv.patrol) { mfPatrol(pv, dt, t => 0.4 + Math.sin(t * 0.6) * 0.25, t => H * (0.5 + Math.sin(t * 1.2) * 0.3)); pv.dropT -= dt; if (pv.dropT <= 0) { pv.dropT = 1; nevTrap(pv, me.x, me.y); xsHint(pv, 'ev', 'SNOTWORK EVERYWHERE', MF_SNOT); } }
  else fbMe(pv, dt);
  blvGun(pv, dt, nevFire);
  mfStepLobs(pv, dt, (pv, L) => nevTrap(pv, L.tx, L.ty));
  // Traps: Snare what is in them (Extra Strength: 40% speed and 1.5 s after; Rising Damp: grows; Bogged Down: stuck).
  for (const T of pv.traps) {
    T.t -= dt; let caught = 0;
    for (const e of sivAlive(pv)) {
      if (e.dying) continue;
      const inT = sivD(e, T) < T.r + e.r * 0.3;
      if (inT) {
        caught++; xsSnare(e, F.has('strength') ? 1.5 : 0.15); e.slowK = F.has('strength') ? 0.4 : 0.6;
        e.inTrap = T; e.trapT = (e.trapT || 0) + dt;
        if (F.has('bog') && e.trapT > 1.5 && !(e.bogT > pv.t)) { e.bogT = pv.t + 4; e.stuck = 1.5; sivTxt(pv, e.x, e.y - e.r - 0.04, 'BOGGED DOWN', MF_SNOT); if (F.has('gag') && e.spit) sivTxt(pv, e.x, e.y - e.r - 0.08, 'GAG REFLEX', MF_SNOT); }
        if (F.has('glue') && !(e.glueT > pv.t)) { e.glueT = pv.t + 5; e.stuck = e.elite ? 1 : 2; sivTxt(pv, e.x, e.y - e.r - 0.04, 'SUPERGLUE', MF_SNOT); }
        T.seen.add(e);
      } else if (e.inTrap === T) {
        e.inTrap = null; e.trapT = 0;
        if (F.has('stringy')) { pv.strands.push([{ x: T.x, y: T.y }, { x: e.x, y: e.y }, 2]); sivTxt(pv, e.x, e.y - e.r, 'STRINGY', MF_SNOT); }
      }
    }
    T.n = caught;
    if (caught) { if (F.has('strength')) xsHint(pv, 'es', 'EXTRA STRENGTH: 40% SPEED', MF_SNOT); if (F.has('ocean')) xsHint(pv, 'so', 'SNOT OCEAN: x3 SIZE', MF_SNOT); if (F.has('hankies') && pv.traps.length > 2) xsHint(pv, 'sh', 'SPARE HANKIES: ' + pv.traps.length + ' TRAPS', MF_SNOT); }
    if (F.has('damp') && caught && T.r < pv.tr * 2) { T.r = Math.min(pv.tr * 2, T.r * (1 + 0.1 * dt)); xsHint(pv, 'rd', 'RISING DAMP', MF_SNOT); }
    T.dT = (T.dT || 0) - dt; if (T.dT <= 0) { T.dT = 0.5; for (const e of sivAlive(pv)) if (sivD(e, T) < T.r + e.r * 0.3) sivDamage(pv, e, 3, false, MF_SNOT); }
    if (F.has('bubble') && !T.floated && T.t < T.max - 1.5 && Math.random() < dt * 0.5) { T.floated = true; T.t = 0; pv.bubbles.push({ x: T.x, y: T.y }); sivTxt(pv, T.x, T.y - 0.05, 'SNOT BUBBLE', MF_SNOT); }
  }
  pv.traps = pv.traps.filter(T => T.t > 0);
  // Bad Company: two stuck cells close together are Conjoined.
  if (F.has('company')) { const st = sivAlive(pv).filter(e => e.stuck > 0); for (let i = 0; i < st.length; i++) for (let j = i + 1; j < st.length; j++) if (sivD(st[i], st[j]) < 0.1) mfConj(pv, st[i], st[j]); }
  // Strands (Snotwork between traps; Stringy behind a cell): crossing one Snares (Twang: and pulls it to the nearest trap).
  for (const S of pv.strands) {
    if (S[2] != null) S[2] -= dt;
    for (const e of sivAlive(pv)) if (!e.dying && blvSeg(e, S[0], S[1]) < e.r && !(e.strT > pv.t)) {
      e.strT = pv.t + 1; xsSnare(e, 1); sivTxt(pv, e.x, e.y - e.r, S[2] != null ? 'STRINGY' : 'SNARED', MF_SNOT);
      if (F.has('twang')) { const T = pv.traps.slice().sort((a, b) => sivD(a, e) - sivD(b, e))[0]; if (T) { const d = sivD(T, e) || 1; e.kx += (T.x - e.x) / d * 0.6; e.ky += (T.y - e.y) / d * 0.6; sivTxt(pv, e.x, e.y - e.r - 0.03, 'TWANG', MF_SNOT); } }
    }
  }
  pv.strands = pv.strands.filter(S => (S[2] == null ? pv.traps.includes(S[0]) && pv.traps.includes(S[1]) : S[2] > 0));
  // Snot bubbles drift after the nearest cell and splat; bogeys roll, Snaring what they touch.
  for (const b of pv.bubbles) { const o = fbNearest(pv, b, 1); if (o) { const d = sivD(o, b) || 1; b.x += (o.x - b.x) / d * 0.15 * dt; b.y += (o.y - b.y) / d * 0.15 * dt; if (d < o.r + 0.02) { b.done = true; nevTrap(pv, o.x, o.y); sivTxt(pv, o.x, o.y - o.r - 0.03, 'SPLAT', MF_SNOT); } } }
  pv.bubbles = pv.bubbles.filter(b => !b.done);
  for (const b of pv.bogeys) { b.t -= dt; b.x -= 0.05 * dt; for (const e of sivAlive(pv)) if (sivD(e, b) < e.r + 0.015) xsSnare(e, 1); }
  pv.bogeys = pv.bogeys.filter(b => b.t > 0);
  // Gag Reflex: stuck spitters cannot spit. Sneeze Guard: traps block shots.
  for (const e of sivAlive(pv)) if (e.spit && e.stuck > 0 && F.has('gag')) e.spitT = Math.max(e.spitT || 0, 0.2);
  fbSpit(pv, dt, (pv, b) => { if (F.has('sneeze')) { const T = pv.traps.find(T => sivD(T, b) < T.r && T.blockT <= pv.t); if (T) { T.blockT = pv.t + 0.3; sivTxt(pv, b.x, b.y - 0.03, 'SNEEZE GUARD', MF_SNOT); return true; } } return false; });
  mfStepConj(pv);
  xsStep(pv, dt);
}
function nevKill(pv, e) { if (pv.F.has('bogey') && e.inTrap) { pv.bogeys.push({ x: e.x, y: e.y, t: 3 }); sivTxt(pv, e.x, e.y - e.r - 0.03, 'BOGEY MAN', MF_SNOT); } }
function nevUnder(pv, g, X, Y, U) {
  for (const T of pv.traps) { g.globalAlpha = Math.min(1, T.t) * 0.4; g.fillStyle = MF_SNOT; g.beginPath(); g.ellipse(X(T.x), Y(T.y), U * T.r, U * T.r * 0.8, 0, 0, TAU); g.fill(); }
  g.globalAlpha = 0.8; g.strokeStyle = MF_SNOT; g.lineWidth = 1.5;
  for (const S of pv.strands) { g.beginPath(); g.moveTo(X(S[0].x), Y(S[0].y)); g.quadraticCurveTo((X(S[0].x) + X(S[1].x)) / 2, (Y(S[0].y) + Y(S[1].y)) / 2 + 6, X(S[1].x), Y(S[1].y)); g.stroke(); }
  for (const b of pv.bogeys) { g.fillStyle = MF_SNOT; g.beginPath(); g.arc(X(b.x), Y(b.y), U * 0.014, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
  mfDrawConj(pv, g, X, Y); fbDrawSpit(pv, g, X, Y, U);
}
function nevOver(pv, g, X, Y, U) { mfDrawLobs(pv, g, X, Y, U, MF_SNOT); for (const b of pv.bubbles) { g.strokeStyle = MF_SNOT; g.lineWidth = 1.5; g.beginPath(); g.arc(X(b.x), Y(b.y), U * 0.025, 0, TAU); g.stroke(); } }
PV_OWN[NEV.id] = { init: nevInit, step: nevStep, draw: sivDraw, flags: NEV_FLAG, wave: nevWave, under: nevUnder, over: nevOver, cell: xsCellHook, kill: nevKill };

// ================================================================ Ewww, Gross (red tape bundles)
const RTV = { id: 's_redtape', range: 0.72, cd: 1.4, mag: 3, reload: 2, dmg: 18, n: 4, jump: 0.29, dur: 5, share: 0.35 };
const RTV_FLAG = { A: 'birds', B: 'trauma', C: 'toxic', 'Birds of a Feather': 'birds', 'Corporate Merger': 'merger', 'Long Distance': 'chat', 'Loose Ends': 'trail',
  'Shared Trauma': 'trauma', 'Bad Influence': 'puppet', Gossip: 'gossip', 'Office Politics': 'office', 'Toxic Relationship': 'toxic', Tangled: 'tangled',
  Escalation: 'escal', 'Lost in the Post': 'post', Bureaucracy: 'bureau', 'Small World': 'everywhere', 'Till Death Do Us Part': 'mad' };
function rtvInit(pv) {
  const F = xsInit(pv, { range: RTV.range, mag: RTV.mag, reload: RTV.reload, rate: RTV.cd, bundles: [], trails: [], reT: 0 });
  pv.me.x = 0.16;
  pv.share = F.has('bureau') ? 0.8 : F.has('trauma') ? 0.2 : F.has('toxic') ? 0 : RTV.share;
  pv.other = !F.has('everywhere') || true;
}
function rtvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 9; i++) mfFoe(pv, 0.45 + R() * 0.45, H * (0.12 + R() * 0.76), { hp: F.has('toxic') || F.has('mad') ? 50 : 80, sp: 0.02, shell: F.has('gossip') ? 1 : 0 });
  if (F.has('chat')) mfFoe(pv, 0.62, H * 0.5, { r: 0.05, hp: 500, sp: 0.002, elite: true, boss: true });
  if (F.has('post')) mfFoe(pv, 0.95, H * 0.85, { hp: 500, sp: 0.002, spit: true, spitCd: 1.3 });
}
const rtvBundleOf = (pv, e) => pv.bundles.find(B => B.list.includes(e));
function rtvMake(pv, first) { // tape the nearest cells into a bundle
  const F = pv.F, n = F.has('birds') ? 6 : RTV.n, jump = F.has('birds') ? 0.38 : RTV.jump, list = [first];
  let cur = first;
  while (list.length < n) { const o = fbNearest(pv, cur, jump, cur, q => !list.includes(q) && !rtvBundleOf(pv, q) && !q.spit); if (!o) break; list.push(o); cur = o; }
  if (list.length < 2) return null;
  const B = { list, t: F.has('birds') ? 3 : RTV.dur, snaps: 0 };
  if (F.has('birds') && list.length > 4) xsHint(pv, 'bf', 'BIRDS OF A FEATHER: ' + list.length + ' TAPED', MF_TAPE);
  pv.bundles.push(B);
  return B;
}
function rtvFire(pv) {
  const F = pv.F, me = pv.me;
  if (F.has('everywhere')) return false;
  const t = fbCluster(pv, me, pv.range, 0.2, null); if (!t || t.spit) return false;
  me.a = Math.atan2(t.y - me.y, t.x - me.x); me.kick = 0.008;
  if (rtvBundleOf(pv, t)) { const u = fbNearest(pv, me, pv.range, null, q => !rtvBundleOf(pv, q) && !q.spit); if (!u) { rtvHurt(pv, t, RTV.dmg); return true; } const B2 = rtvMake(pv, u); rtvHurt(pv, u, RTV.dmg); return true; }
  const B = rtvMake(pv, t); rtvHurt(pv, t, RTV.dmg);
  if (B && F.has('post') && Math.random() < 0.5) { B.me = true; sivTxt(pv, me.x, me.y - 0.08, 'LOST IN THE POST', MF_TAPE); }
  return true;
}
// A hit on a taped cell: its partners take a share (Group Chat: a boss takes all of it).
function rtvHurt(pv, e, k, col) {
  const F = pv.F, B = rtvBundleOf(pv, e);
  sivDamage(pv, e, k, false, col);
  if (!B || !pv.share) return;
  for (const o of B.list) if (o !== e && o.hp > 0) { const s = o.boss && F.has('chat') ? 1 : pv.share; sivDamage(pv, o, k * s, false, MF_TAPE); if (o.boss && F.has('chat')) xsHint(pv, 'gc', 'GROUP CHAT: FULL SHARE', MF_TAPE); }
  if (Math.random() < 0.25) sivTxt(pv, e.x, e.y - e.r - 0.03, F.has('bureau') ? 'BUREAUCRACY 80%' : 'SHARED', MF_TAPE);
}
function rtvKill(pv, e) {
  const F = pv.F, B = rtvBundleOf(pv, e); if (!B) return;
  B.list = B.list.filter(o => o !== e);
  if (F.has('toxic')) { // the tape snaps: partners take 30% of its max health (Escalation: +50% a snap)
    B.snaps++; const k = e.max * 0.3 * (F.has('escal') ? 1 + 0.5 * (B.snaps - 1) : 1);
    sivTxt(pv, e.x, e.y - e.r - 0.04, F.has('escal') && B.snaps > 1 ? 'ESCALATION x' + B.snaps : 'SNAP', MF_TAPE, true);
    for (const o of B.list) if (o.hp > 0) { pv.fx.push({ type: 'line', a: { x: e.x, y: e.y }, b: { x: o.x, y: o.y }, color: MF_TAPE, life: 0.3, max: 0.3 }); sivDamage(pv, o, k, false, MF_TAPE); }
    if (F.has('tangled')) { const L = B.list.filter(o => o.hp > 0); for (let i = 0; i + 1 < L.length; i += 2) mfConj(pv, L[i], L[i + 1]); }
  }
  if (F.has('mad')) for (const o of B.list) if (o.hp > 0 && o.hp / o.max < 0.3) { sivTxt(pv, o.x, o.y - o.r - 0.04, 'MUTUALLY ASSURED', MF_TAPE); sivDamage(pv, o, o.hp + 1, false, MF_TAPE); }
}
function rtvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me;
  fbMe(pv, dt);
  blvGun(pv, dt, rtvFire);
  if (F.has('everywhere')) { pv.reT -= dt; if (pv.reT <= 0) { pv.reT = 3; pv.bundles = []; for (const e of sivAlive(pv)) if (!rtvBundleOf(pv, e) && !e.spit) rtvMake(pv, e); sivTxt(pv, me.x, me.y - 0.08, 'RED TAPE EVERYWHERE', MF_TAPE, true); } }
  for (const B of pv.bundles) {
    B.list = B.list.filter(o => o.hp > 0); B.t -= dt;
    if (F.has('everywhere')) B.t = Math.max(B.t, 0.1);
    if ((B.t <= 0 || B.list.length < 2) && !B.gone) { B.gone = true; if (F.has('trail') && B.list.length > 1) { for (let i = 0; i + 1 < B.list.length; i++) pv.trails.push({ a: { x: B.list[i].x, y: B.list[i].y }, b: { x: B.list[i + 1].x, y: B.list[i + 1].y }, t: 3 }); sivTxt(pv, B.list[0].x, B.list[0].y - 0.05, 'PAPER TRAIL', MF_TAPE); } }
    // Office Politics: taped cells shove each other about.
    if (F.has('office') && Math.random() < dt * 1.5 && B.list.length > 1) { const a = B.list[0], b = B.list[1]; const [vx, vy] = fbAway(b, a, 0.3); b.kx += vx; b.ky += vy; sivDamage(pv, b, 4, false, MF_TAPE); sivTxt(pv, b.x, b.y - b.r, 'OFFICE POLITICS', MF_TAPE); }
    // Puppet Strings: a Possessed partner drags the others with it.
    if (F.has('puppet')) { const P = B.list.find(o => o.poss > 0); if (P) for (const o of B.list) if (o !== P) { const d = sivD(P, o) || 1; o.x += (P.x - o.x) / d * 0.08 * dt; o.y += (P.y - o.y) / d * 0.08 * dt; xsHint(pv, 'ps', 'PUPPET STRINGS', XS.alien); } }
  }
  // Corporate Merger: two bundles that touch become one (10 at most).
  if (F.has('merger')) for (const A of pv.bundles) for (const B of pv.bundles) if (A !== B && !A.gone && !B.gone && A.list.length + B.list.length <= 10 && A.list.some(a => B.list.some(b => sivD(a, b) < a.r + b.r + 0.15))) { A.list = A.list.concat(B.list); B.gone = true; A.t = Math.max(A.t, B.t); sivTxt(pv, A.list[0].x, A.list[0].y - 0.06, 'CORPORATE MERGER', MF_TAPE, true); }
  pv.bundles = pv.bundles.filter(B => !B.gone);
  // Your other weapon (grey; with Shared Trauma it sets fire, and with Puppet Strings it haunts).
  fbOther(pv, dt, (pv, e, k) => {
    rtvHurt(pv, e, k, '#8a959a');
    if (F.has('trauma') || F.has('gossip')) { const B = rtvBundleOf(pv, e); if (xsAdd(pv, e, 'burn', F.has('gossip') ? 0.5 : 0.35) && B && F.has('gossip') && !B.gos) { B.gos = true; for (const o of B.list) if (o !== e) { o.ign = 3; if (o.shell) o.shell--; } sivTxt(pv, e.x, e.y - e.r - 0.06, 'GOSSIP', MF_TAPE, true); } if (B && F.has('trauma')) for (const o of B.list) if (o !== e) { xsAdd(pv, o, 'burn', 0.35 / 4); if (Math.random() < 0.1) sivTxt(pv, o.x, o.y - o.r, 'SHARED TRAUMA', XS.burn); } }
    if (F.has('puppet')) xsAdd(pv, e, 'alien', 0.3);
  });
  for (const T of pv.trails) { T.t -= dt; for (const e of sivAlive(pv)) if (blvSeg(e, T.a, T.b) < e.r) xsSnare(e, 0.5); }
  pv.trails = pv.trails.filter(T => T.t > 0);
  // Lost in the Post: while you are in a bundle, 40% of each hit on you goes to it.
  fbSpit(pv, dt, null, (pv, b) => { const B = pv.bundles.find(B => B.me); if (B) { sivTxt(pv, me.x, me.y - 0.07, 'OW -' + Math.round(b.dmg * 0.6) + ' (40% POSTED)', MF_TAPE); for (const o of B.list) sivDamage(pv, o, b.dmg * 0.4, false, MF_TAPE); } else sivTxt(pv, me.x, me.y - 0.06, 'OW -' + b.dmg, BLV_SPIT, true); });
  mfStepConj(pv);
  xsStep(pv, dt);
}
function rtvUnder(pv, g, X, Y, U) {
  for (const T of pv.trails) { g.globalAlpha = Math.min(1, T.t) * 0.6; g.strokeStyle = MF_TAPE; g.lineWidth = 3; g.setLineDash([5, 3]); g.beginPath(); g.moveTo(X(T.a.x), Y(T.a.y)); g.lineTo(X(T.b.x), Y(T.b.y)); g.stroke(); g.setLineDash([]); }
  g.globalAlpha = 1;
  for (const B of pv.bundles) { g.strokeStyle = MF_TAPE; g.lineWidth = 2.5; g.beginPath(); B.list.forEach((o, i) => i ? g.lineTo(X(o.x), Y(o.y)) : g.moveTo(X(o.x), Y(o.y))); g.stroke(); if (B.me) { const o = B.list[0]; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(pv.me.x), Y(pv.me.y)); g.lineTo(X(o.x), Y(o.y)); g.stroke(); g.setLineDash([]); } }
  mfDrawConj(pv, g, X, Y); fbDrawSpit(pv, g, X, Y, U);
}
function rtvOver(pv, g, X, Y, U) { for (const p of pv.pips || []) { g.fillStyle = '#8a959a'; g.beginPath(); g.arc(X(p.x), Y(p.y), U * 0.006, 0, TAU); g.fill(); } }
PV_OWN[RTV.id] = { init: rtvInit, step: rtvStep, draw: sivDraw, flags: RTV_FLAG, wave: rtvWave, under: rtvUnder, over: rtvOver, cell: xsCellHook, kill: rtvKill };

// ================================================================ Blowing Bubbles
const BBV = { id: 's_bubble', range: 0.65, cd: 1.1, mag: 4, reload: 2, dmg: 18, v: 0.29, hold: 5, pop: 0.15 };
const BBV_FLAG = { A: 'big', B: 'wrap', C: 'pop', 'Big Bubble Trouble': 'big', 'Locked In': 'locked', Cannonball: 'cannon', 'Bath Time': 'bath',
  'Bubble Wrap': 'wrap', Chaperone: 'chaperone', 'Spit It Back': 'return', 'Snow Globe': 'globe', 'Pop Goes the Prawn': 'pop', Popcorn: 'popcorn',
  'Stuck Together': 'stuckt', 'Bubble Gum': 'gum', 'Cotton Wool': 'cotton', 'Bubble Boy': 'boy', 'Hamster Ball': 'hamster' };
function bbvInit(pv) {
  const F = xsInit(pv, { range: BBV.range, mag: BBV.mag, reload: BBV.reload, rate: BBV.cd, blows: [], bubs: [], soap: [], gum: [], cotton: 0, cotT: 2 });
  pv.me.x = 0.2; if (F.has('bath')) pv.patrol = true;
}
function bbvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 7; i++) mfFoe(pv, 0.55 + R() * 0.4, H * (0.12 + R() * 0.76), { hp: 60, sp: 0.04 });
  if (F.has('big') || F.has('boy') || F.has('cannon') || F.has('locked') || F.has('bath')) mfFoe(pv, 0.7, H * 0.5, { r: 0.045, hp: 200, sp: 0.02, elite: true, spit: F.has('locked'), spitCd: 1.3 });
  if (F.has('wrap') || F.has('cotton') || F.has('globe')) mfFoe(pv, 0.95, H * 0.2, { hp: 600, sp: 0.002, spit: true, spitCd: 0.8 });
}
const bbvSmall = e => e.r < 0.03 && !e.spit;
function bbvFire(pv) {
  const F = pv.F, me = pv.me;
  if (F.has('big') && pv.bubs.length + pv.blows.length >= 1) return false; // (one bubble at a time)
  const can = e => !e.trapped && !e.boss && (bbvSmall(e) || F.has('big') || F.has('boy')) && !(e.spit && !e.elite) && !(e.spit && e.hp > 500);
  const t = (F.has('big') || F.has('boy')) && sivAlive(pv).find(e => e.elite && can(e)) || fbNearest(pv, me, pv.range, null, can);
  if (!t) return false;
  me.a = Math.atan2(t.y - me.y, t.x - me.x); me.kick = 0.006;
  pv.blows.push({ x: me.x, y: me.y, t, a: me.a });
  return true;
}
function bbvTrap(pv, e, depth) {
  const F = pv.F, slow = !bbvSmall(e) && !F.has('boy');
  e.trapped = true; e.stuck = 99;
  if (F.has('boy') && !bbvSmall(e)) xsHint(pv, 'bb', 'BUBBLE BOY: ANY SIZE, AT ONCE', '#bde0fe');
  pv.bubs.push({ e, t: F.has('pop') ? 2 : BBV.hold, close: slow ? 0.8 : 0, r: e.r + 0.02, blocked: 0, shots: [], depth: depth || 0 });
  if (slow) sivTxt(pv, e.x, e.y - e.r - 0.05, 'BIG BUBBLE TROUBLE', '#bde0fe');
  if (F.has('hamster')) pv.bubs[pv.bubs.length - 1].roll = fbNearest(pv, e, 0.5, e, q => !q.trapped);
}
function bbvPop(pv, B, why) {
  const F = pv.F, e = B.e;
  if (B.gone) return; B.gone = true;
  e.trapped = false; e.stuck = 0;
  sivRing(pv, e.x, e.y, B.r * 1.4, '#bde0fe', 0.3); sivDamage(pv, e, BBV.dmg, false, '#bde0fe');
  if (F.has('bath')) pv.soap.push({ x: e.x, y: e.y, t: 4 });
  if (F.has('gum')) pv.gum.push({ x: e.x, y: e.y, t: 5 });
  if (F.has('cannon') && e.elite) { const o = fbNearest(pv, e, 0.5, e); if (o) { const d = sivD(o, e) || 1; fbLaunch(pv, e, (o.x - e.x) / d * 1.1, (o.y - e.y) / d * 1.1); sivTxt(pv, e.x, e.y - e.r - 0.05, 'CANNONBALL', '#bde0fe', true); } }
  if (B.shots.length) { for (const s of B.shots) { const o = fbNearest(pv, e, 1, e); if (o) fbShot(pv, e.x, e.y, Math.atan2(o.y - e.y, o.x - e.x), { dmg: 8, col: BLV_SPIT, range: 1 }); } sivTxt(pv, e.x, e.y - e.r - 0.05, why === 'return' ? 'RETURN TO SENDER' : 'SNOW GLOBE', '#bde0fe', true); }
  if (F.has('pop')) { // a Mucus shockwave that Snares (Popcorn: and pops bubbles; Stuck Together: Conjoins)
    sivRing(pv, e.x, e.y, BBV.pop, MF_SNOT, 0.4); sivTxt(pv, e.x, e.y - e.r - 0.03, 'POP', MF_SNOT);
    const near = sivAlive(pv).filter(o => o !== e && sivD(o, e) < BBV.pop);
    for (const o of near) xsSnare(o, 2);
    if (F.has('stuckt') && near.length > 1) { mfConj(pv, near[0], near[1]); xsHint(pv, 'st', 'STUCK TOGETHER', MF_SNOT); }
    if (F.has('popcorn') && B.depth < 3) for (const C of pv.bubs) if (!C.gone && C !== B && sivD(C.e, e) < BBV.pop) { C.depth = B.depth + 1; sivTxt(pv, C.e.x, C.e.y - 0.05, 'POPCORN', MF_SNOT); bbvPop(pv, C); }
  }
}
function bbvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  if (pv.patrol) { const sp0 = pv.soap[0]; mfPatrol(pv, dt, t => sp0 ? sp0.x : 0.35 + Math.sin(t * 0.8) * 0.2, t => sp0 ? sp0.y : H * (0.5 + Math.cos(t * 0.9) * 0.3), pv.skid > 0 ? 4.2 : 1.5); pv.skid = Math.max(0, (pv.skid || 0) - dt); }
  else fbMe(pv, dt);
  blvGun(pv, dt, bbvFire);
  for (const b of pv.blows) { const t = b.t; if (t.hp <= 0 || t.trapped) { b.done = true; continue; } const a = Math.atan2(t.y - b.y, t.x - b.x); b.x += Math.cos(a) * BBV.v * dt; b.y += Math.sin(a) * BBV.v * dt; if (sivD(t, b) < t.r) { b.done = true; bbvTrap(pv, t); } }
  pv.blows = pv.blows.filter(b => !b.done);
  for (const B of pv.bubs) {
    const e = B.e; if (e.hp <= 0) { B.gone = true; continue; }
    B.t -= dt; if (B.close > 0) B.close -= dt;
    if (F.has('locked') && e.elite && e.spit) { e.spitT = Math.max(e.spitT || 0, 0.2); xsHint(pv, 'li', 'LOCKED IN', '#bde0fe'); }
    if (B.t <= 0) { bbvPop(pv, B, 'time'); continue; }
    // drifting: up a little (Chaperone: between you and the shooter; Hamster Ball: rolls at the next cell)
    const sh = sivAlive(pv).find(o => o.spit && !o.trapped);
    if (F.has('chaperone') && sh) { const tx = me.x + (sh.x - me.x) * 0.3, ty = me.y + (sh.y - me.y) * 0.3; e.x += (tx - e.x) * Math.min(1, dt); e.y += (ty - e.y) * Math.min(1, dt); xsHint(pv, 'ch', 'CHAPERONE', '#bde0fe'); }
    else if (B.roll && B.roll.hp > 0) { const o = B.roll, d = sivD(o, e) || 1; e.x += (o.x - e.x) / d * 0.3 * dt; e.y += (o.y - e.y) / d * 0.3 * dt; if (d < e.r + o.r + 0.02) { bbvPop(pv, B); if (B.depth < 3) { bbvTrap(pv, o, B.depth + 1); sivTxt(pv, o.x, o.y - o.r - 0.05, 'HAMSTER BALL', '#bde0fe', true); } continue; } }
    else e.y -= 0.01 * dt;
    // Anything that touches a bubble pops it (Bubble Wrap: only shots and you).
    if (!F.has('wrap') && B.close <= 0) for (const o of sivAlive(pv)) if (o !== e && !o.trapped && sivD(o, e) < o.r + B.r) { sivTxt(pv, e.x, e.y - e.r - 0.03, 'POP', '#bde0fe'); bbvPop(pv, B); break; }
  }
  pv.bubs = pv.bubs.filter(B => !B.gone);
  // Enemy shots: bubbles block them (Bubble Wrap; Return to Sender after 5; Snow Globe keeps them); Cotton Wool wraps you.
  if (F.has('cotton')) { pv.cotT -= dt; if (pv.cotT <= 0 && pv.cotton <= 0) { pv.cotT = 6; pv.cotton = 3; sivTxt(pv, me.x, me.y - 0.08, 'COTTON WOOL', '#bde0fe', true); } }
  fbSpit(pv, dt, (pv, b) => {
    for (const B of pv.bubs) if (sivD(B.e, b) < B.r + b.r) {
      if (F.has('globe')) { B.shots.push(b); if (B.shots.length === 1) sivTxt(pv, B.e.x, B.e.y - B.r - 0.03, 'SNOW GLOBE', '#bde0fe'); return true; }
      if (F.has('wrap')) { B.blocked++; sivTxt(pv, b.x, b.y - 0.03, 'BLOCKED', '#bde0fe'); if (F.has('return') && B.blocked >= 5) { B.shots = [1, 2, 3, 4, 5]; bbvPop(pv, B, 'return'); } return true; }
      bbvPop(pv, B); return true;
    }
    return false;
  }, (pv, b) => { if (pv.cotton > 0) { pv.cotton--; sivTxt(pv, me.x, me.y - 0.07, 'BLOCKED (' + pv.cotton + ' LEFT)', '#bde0fe'); } else sivTxt(pv, me.x, me.y - 0.06, 'OW', BLV_SPIT, true); });
  for (const s of pv.soap) { s.t -= dt; if (sivD(s, me) < 0.04 && !(pv.skid > 0)) { pv.skid = 2; sivTxt(pv, me.x, me.y - 0.07, 'BATH TIME +40%', '#bde0fe', true); } }
  pv.soap = pv.soap.filter(s => s.t > 0);
  for (const gm of pv.gum) { gm.t -= dt; for (const e of sivAlive(pv)) if (!e.trapped && sivD(e, gm) < e.r + 0.015) { gm.t = 0; xsSnare(e, 3); sivTxt(pv, e.x, e.y - e.r - 0.03, 'BUBBLE GUM', '#ff8fab'); break; } }
  pv.gum = pv.gum.filter(gm => gm.t > 0);
  fbStepShots(pv, dt, (pv, s, e) => sivDamage(pv, e, s.dmg, false, BLV_SPIT));
  fbStepFly(pv, dt, (pv, e, o) => { sivDamage(pv, o, 15, false, '#bde0fe'); const [vx, vy] = fbAway(o, e, 0.4); o.kx += vx; o.ky += vy; });
  mfStepConj(pv);
  xsStep(pv, dt);
}
function bbvUnder(pv, g, X, Y, U) {
  for (const s of pv.soap) { g.globalAlpha = Math.min(1, s.t) * 0.4; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(X(s.x), Y(s.y), U * 0.04, U * 0.025, 0, 0, TAU); g.fill(); }
  for (const gm of pv.gum) { g.globalAlpha = 0.8; g.fillStyle = '#ff8fab'; g.beginPath(); g.arc(X(gm.x), Y(gm.y), U * 0.012, 0, TAU); g.fill(); }
  g.globalAlpha = 1; mfDrawConj(pv, g, X, Y); fbDrawSpit(pv, g, X, Y, U);
}
function bbvOver(pv, g, X, Y, U) {
  g.globalCompositeOperation = 'source-over';
  for (const b of pv.blows) { g.strokeStyle = '#bde0fe'; g.lineWidth = 1.5; g.beginPath(); g.arc(X(b.x), Y(b.y), U * 0.012, 0, TAU); g.stroke(); }
  for (const B of pv.bubs) { const e = B.e, k = B.close > 0 ? 1 - B.close / 0.8 : 1, R = U * B.r * (1 + Math.sin(pv.t * 6) * 0.04); g.strokeStyle = '#bde0fe'; g.lineWidth = 2; g.globalAlpha = 0.9; g.beginPath(); g.arc(X(e.x), Y(e.y), R, -Math.PI / 2, -Math.PI / 2 + TAU * k); g.stroke(); g.fillStyle = '#bde0fe22'; g.fill(); g.globalAlpha = 1; for (const s of B.shots) if (s.x != null) { g.fillStyle = BLV_SPIT; g.beginPath(); g.arc(X(e.x) + Math.cos(pv.t * 3) * R * 0.5, Y(e.y) + Math.sin(pv.t * 3) * R * 0.5, 2.5, 0, TAU); g.fill(); } }
  if (pv.cotton > 0) { g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.beginPath(); g.arc(X(pv.me.x), Y(pv.me.y), U * 0.06, 0, TAU); g.stroke(); }
  g.globalCompositeOperation = 'lighter';
  fbDrawShots(pv, g, X, Y, U);
}
PV_OWN[BBV.id] = { init: bbvInit, step: bbvStep, draw: sivDraw, flags: BBV_FLAG, wave: bbvWave, under: bbvUnder, over: bbvOver, cell: xsCellHook };

// ================================================================ Hot Mess (burning patches)
const HMV = { id: 'v_flame_pool', range: 0.65, cd: 1, mag: 4, reload: 1.6, dmg: 9, r: 0.1, dur: 3.5, fill: 0.35 };
const HMV_FLAG = { A: 'hotter', B: 'rumours', C: 'flash', 'Hotter Mess': 'hotter', Backdraft: 'backdraft', 'Hot Tub': 'tub', 'Fire Drill': 'drill',
  'Spreading Rumours': 'rumours', 'Hot Foot': 'hotfoot', 'Burning Bridges': 'bridges', Toasty: 'toasty', 'Flash in the Pan': 'flash', 'Short Fuse': 'fuse',
  'Powder Keg': 'keg', 'Hot Potato': 'potato', Hellmouth: 'hell', 'Spontaneous Combustion': 'spont', 'Scorched Earth': 'scorched' };
function hmvInit(pv) {
  const F = xsInit(pv, { range: HMV.range, mag: HMV.mag, reload: HMV.reload, rate: HMV.cd, lobs: [], patches: [], steps: [], hell: null });
  pv.pr = HMV.r * (F.has('hotter') ? 0.8 : 1); pv.pdur = HMV.dur * (F.has('rumours') ? 0.7 : 1) * (F.has('flash') ? 0.5 : 1);
  pv.me.x = 0.18; if (F.has('toasty')) pv.patrol = true;
}
function hmvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 8; i++) mfFoe(pv, 0.7 + R() * 0.35, H * (0.12 + R() * 0.76), { hp: 70, sp: 0.05 });
}
function hmvPatch(pv, x, y, o) { const p = Object.assign({ x, y, r: pv.pr, t: pv.pdur, max: pv.pdur, flare: 0, jt: 0.9 }, o); pv.patches.push(p); if (pv.patches.length > (pv.F.has('scorched') ? 6 : 4)) pv.patches.shift(); return p; }
function hmvFire(pv) {
  const F = pv.F, me = pv.me;
  if (F.has('hell')) { if (!pv.hell) { pv.hell = hmvPatch(pv, 0.6, pv.fh * 0.5, { r: 0.34, t: 10, max: 10, hell: true }); sivTxt(pv, 0.6, pv.fh * 0.2, 'HELLMOUTH', XS.burn, true); } return false; }
  const t = fbCluster(pv, me, pv.range, 0.12); if (!t) return false;
  mfLob(pv, { x: t.x - 0.05, y: t.y }); return true;
}
function hmvErupt(pv, P, why) {
  P.t = 0; sivRing(pv, P.x, P.y, P.r * (P.keg ? 2 : 1), XS.burn, 0.4); sivTxt(pv, P.x, P.y - P.r * 0.5, why, XS.burn, true);
  for (const e of sivAlive(pv)) if (sivD(e, P) < P.r * (P.keg ? 2 : 1) + e.r) { sivDamage(pv, e, P.keg ? 30 : 15, false, XS.burn); xsAdd(pv, e, 'burn', 0.5); }
}
function hmvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  if (pv.patrol) { const P0 = pv.patches[0]; mfPatrol(pv, dt, t => P0 ? P0.x : 0.4 + Math.sin(t * 0.5) * 0.15, t => P0 ? P0.y : H * (0.5 + Math.sin(t * 0.9) * 0.3), 1.2); for (const P of pv.patches) if (sivD(P, me) < P.r) { pv.toastT = (pv.toastT || 0) + dt; if (pv.toastT > 1) { pv.toastT = 0; sivTxt(pv, me.x, me.y - 0.07, 'TOASTY +1%', BLV_GREEN); } } }
  else fbMe(pv, dt);
  blvGun(pv, dt, hmvFire);
  mfStepLobs(pv, dt, (pv, L) => { if (F.has('keg')) { hmvPatch(pv, L.tx, L.ty, { keg: true, t: 1, max: 1 }); } else hmvPatch(pv, L.tx, L.ty); });
  if (pv.hell) { const t = fbCluster(pv, pv.hell, 1, 0.15); if (t) { const d = sivD(t, pv.hell) || 1; pv.hell.x += (t.x - pv.hell.x) / d * Math.min(d, 0.05 * dt); pv.hell.y += (t.y - pv.hell.y) / d * Math.min(d, 0.05 * dt); } if (pv.hell.t <= 0) pv.hell = null; }
  for (const P of pv.patches) {
    const inside = sivAlive(pv).filter(e => !e.dying && sivD(e, P) < P.r + e.r * 0.3);
    if (!(F.has('scorched') && inside.length)) P.t -= dt; else xsHint(pv, 'se', 'SCORCHED EARTH: STAYS LIT', XS.burn);
    if (P.flare > 0) P.flare -= dt;
    if (P.keg) { if (P.t <= 0) hmvErupt(pv, P, 'POWDER KEG'); continue; }
    if (F.has('flash') && P.t <= 0 && !P.erupted) { P.erupted = true; hmvErupt(pv, P, 'FLASH IN THE PAN'); continue; }
    if (F.has('fuse') && inside.length >= 4 && !P.erupted) { P.erupted = true; hmvErupt(pv, P, 'SHORT FUSE'); continue; }
    P.tick = (P.tick || 0) - dt;
    for (const e of inside) {
      e.inP = (e.inP || 0) + dt; e.lastP = P;
      let fill = HMV.fill * dt * (F.has('hotter') ? 1 + Math.min(2, e.inP) : 1) * (F.has('drill') ? 2 : 1) * (P.flare > 0 ? 1.5 : 1);
      if (xsAdd(pv, e, 'burn', fill)) {
        if (F.has('backdraft')) { P.flare = 0.5; sivTxt(pv, P.x, P.y - P.r, 'BACKDRAFT', XS.burn, true); }
        if (F.has('spont') && !e.spont) { e.spont = true; hmvPatch(pv, e.x, e.y, { r: pv.pr * 0.7 }); sivTxt(pv, e.x, e.y - e.r - 0.05, 'SPONTANEOUS COMBUSTION', XS.burn); }
      }
      if (F.has('hotter') && e.inP > 1.5) xsHint(pv, 'hm', 'HOTTER MESS x3', XS.burn);
    }
    if (P.tick <= 0) { P.tick = 0.5; for (const e of inside) sivDamage(pv, e, HMV.dmg * 0.5 * (P.flare > 0 ? 1.5 : 1), false, XS.burn); }
    // Hot Tub: cells at the edge are pulled back in. Fire Drill: they won't come in.
    for (const e of sivAlive(pv)) { const d = sivD(e, P); if (F.has('tub') && d > P.r * 0.8 && d < P.r * 1.4) { e.x += (P.x - e.x) / d * 0.08 * dt; e.y += (P.y - e.y) / d * 0.08 * dt; xsHint(pv, 'ht', 'HOT TUB', XS.burn); } if (F.has('drill') && d > P.r && d < P.r + e.r + 0.02 && !inside.includes(e)) { e.x += (e.x - P.x) / d * 0.1 * dt; e.y += (e.y - P.y) / d * 0.1 * dt; xsHint(pv, 'fd', 'FIRE DRILL: A WALL', XS.burn); } }
    // Hot Potato: every 2 s the patch jumps under the nearest cell outside it.
    if (F.has('potato')) { P.jt = (P.jt || 0) + dt; if (P.jt > 2) { P.jt = 0; const o = fbNearest(pv, P, 0.5, null, q => sivD(q, P) > P.r); if (o) { P.x = o.x; P.y = o.y; sivTxt(pv, o.x, o.y - o.r - 0.04, 'HOT POTATO', XS.burn); } } }
  }
  pv.patches = pv.patches.filter(P => P.t > 0);
  // Spreading Rumours: a burning cell that walks out leaves footprints (Hot Foot: they burn as hard; Burning Bridges: an ignition on them drops a patch).
  if (F.has('rumours')) for (const e of sivAlive(pv)) {
    const inAny = pv.patches.some(P => sivD(e, P) < P.r);
    if (!inAny && e.xs && e.xs.burn > 0 || e.ign > 0) { e.stepT = (e.stepT || 0) - dt; if (e.stepT <= 0 && !inAny) { e.stepT = 0.25; e.trailing = true; pv.steps.push({ x: e.x, y: e.y + e.r * 0.5, t: 1.5, by: e }); xsHint(pv, 'sr', 'SPREADING RUMOURS', XS.burn); } }
  }
  for (const s of pv.steps) { s.t -= dt; for (const e of sivAlive(pv)) if (e !== s.by && sivD(e, s) < e.r) { if (xsAdd(pv, e, 'burn', (F.has('hotfoot') ? HMV.fill : 0.1) * dt * 4) && F.has('bridges') && !e.bridge) { e.bridge = true; hmvPatch(pv, e.x, e.y, { r: pv.pr * 0.6 }); sivTxt(pv, e.x, e.y - e.r - 0.04, 'BURNING BRIDGES', XS.burn); } if (F.has('hotfoot')) xsHint(pv, 'hf', 'HOT FOOT', XS.burn); } }
  pv.steps = pv.steps.filter(s => s.t > 0);
  xsStep(pv, dt);
}
function hmvUnder(pv, g, X, Y, U) {
  for (const P of pv.patches) {
    const k = Math.min(1, P.t), R = U * P.r * (P.keg ? 2 : 1);
    if (P.keg) { g.globalAlpha = 0.6; g.strokeStyle = XS.burn; g.setLineDash([4, 4]); g.lineWidth = 2; g.beginPath(); g.arc(X(P.x), Y(P.y), R, 0, TAU); g.stroke(); g.setLineDash([]); g.globalAlpha = 0.2; g.fillStyle = XS.burn; g.beginPath(); g.arc(X(P.x), Y(P.y), R * (1 - P.t), 0, TAU); g.fill(); continue; }
    g.globalAlpha = k * (P.flare > 0 ? 0.6 : 0.35) * (pv.F.has('flash') ? 0.6 + 0.4 * (1 - P.t / P.max) : 1); g.fillStyle = XS.burn; g.beginPath(); g.ellipse(X(P.x), Y(P.y), R, R * 0.75, 0, 0, TAU); g.fill();
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + pv.t, fx = X(P.x) + Math.cos(a) * R * 0.5, fy = Y(P.y) + Math.sin(a) * R * 0.35; g.globalAlpha = k * 0.7; g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(fx - 3, fy); g.lineTo(fx, fy - 6 - Math.sin(pv.t * 9 + i) * 3); g.lineTo(fx + 3, fy); g.fill(); }
  }
  for (const s of pv.steps) { g.globalAlpha = s.t / 1.5 * 0.7; g.fillStyle = XS.burn; g.beginPath(); g.ellipse(X(s.x), Y(s.y), 3, 2, 0, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
}
function hmvFull(pv, e, k) { if (k === 'burn' && pv.F.has('bridges') && e.trailing && !e.bridge) { e.bridge = true; hmvPatch(pv, e.x, e.y, { r: pv.pr * 0.6 }); sivTxt(pv, e.x, e.y - e.r - 0.06, 'BURNING BRIDGES', XS.burn, true); } }
PV_OWN[HMV.id] = { full: hmvFull, init: hmvInit, step: hmvStep, draw: sivDraw, flags: HMV_FLAG, wave: hmvWave, under: hmvUnder, over: (pv, g, X, Y, U) => mfDrawLobs(pv, g, X, Y, U, XS.burn), cell: xsCellHook };

// ================================================================ Nappy Mines
const NMV = { id: 's_mines', cd: 0.7, mag: 5, reload: 2.4, dmg: 34, r: 0.12, life: 14, patch: 0.06, pdur: 2 };
const NMV_FLAG = { A: 'prox', B: 'cluster', C: 'smoulder', 'Proximity Problems': 'prox', 'Pass the Parcel': 'parcel', 'Crawling Baby': 'crawl', 'Hand-Me-Down': 'hand',
  'Cluster Diaper': 'cluster', 'Compound Interest': 'compound', 'Nappy Pin': 'pin', 'Changing Mat': 'mat', 'Lingering Smoulder': 'smoulder', 'Pooling Resources': 'pool',
  'Flare Up': 'flare', 'Bouncy Castle': 'bouncy', 'Nuclear Nappy': 'nuke', Minefield: 'field', 'Nappy Rash': 'rash' };
function nmvInit(pv) {
  const F = xsInit(pv, { range: 1, mag: NMV.mag, reload: NMV.reload, rate: NMV.cd / (F0(pv, 'field') ? 2 : 1), mines: [], dropN: 0, still: 0 });
  pv.me.x = 0.3; pv.patrol = true;
}
function nmvWave(pv) {
  const H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 7; i++) mfFoe(pv, 0.7 + R() * 0.3, H * (0.12 + R() * 0.76), { hp: 60, sp: 0.06 });
}
function nmvDrop(pv, x, y) {
  const F = pv.F; pv.dropN++;
  const m = { x, y, t: F.has('pool') ? 2.5 : NMV.life * (F.has('field') ? 2 : 1), arm: 0.4, nuke: F.has('nuke') && pv.dropN % 4 === 0, link: null };
  if (m.nuke) sivTxt(pv, x, y - 0.05, 'NUCLEAR NAPPY', '#ffd23f', true);
  if (F.has('cluster')) { const o = pv.mines.find(q => !q.dead && sivD(q, m) < 0.2); if (o) { m.link = o.link || (o.link = { list: [o] }); m.link.list.push(m); } }
  pv.mines.push(m);
}
function nmvFire(pv) {
  const me = pv.me, a = me.a + Math.PI;
  const n = pv.F.has('field') ? 3 : 1;
  for (let i = 0; i < n; i++) nmvDrop(pv, me.x + Math.cos(a + (i - (n - 1) / 2) * 0.6) * 0.05, me.y + Math.sin(a + (i - (n - 1) / 2) * 0.6) * 0.05);
  return true;
}
function nmvBoom(pv, m, scale, label) {
  const F = pv.F; if (m.dead) return; m.dead = true;
  const R = NMV.r * (m.nuke ? 3 : 1) * (scale || 1), k = NMV.dmg * (m.nuke ? 6 : 1) * (F.has('prox') ? 0.85 : 1) * (F.has('smoulder') ? 0.75 : 1) * (scale || 1);
  sivRing(pv, m.x, m.y, R, XS.burn, 0.4); pv.flash = pv.flash || []; pv.flash.push({ x: m.x, y: m.y, r: R, life: 0.3 });
  if (label) sivTxt(pv, m.x, m.y - R * 0.6, label, XS.burn, true);
  for (const e of sivAlive(pv)) if (!e.dying && sivD(e, m) < R + e.r) { sivDamage(pv, e, k, false, XS.burn); xsAdd(pv, e, 'burn', 1); if (F.has('parcel') && m.touch === e && e.hp > 0) { const n = pv.mines.find(q => !q.dead && q !== m); if (n) { const d = sivD(n, e) || 1; fbLaunch(pv, e, (n.x - e.x) / d * 0.9, (n.y - e.y) / d * 0.9); sivTxt(pv, e.x, e.y - e.r - 0.04, 'PASS THE PARCEL', XS.burn); } } }
  const pr = NMV.patch * (F.has('rash') ? 1.7 : 1) * (F.has('smoulder') ? 1.2 : 1), pt = NMV.pdur * (F.has('smoulder') ? 1.5 : 1) * (F.has('rash') ? 3 : 1);
  pv.puddles.push({ x: m.x, y: m.y, r: pr, t: pt, col: XS.burn, grow: F.has('smoulder') });
  if (F.has('bouncy') && !m.bounced) { const a = Math.random() * TAU, m2 = { x: m.x + Math.cos(a) * 0.17, y: Math.max(0.05, Math.min(pv.fh - 0.05, m.y + Math.sin(a) * 0.17)), t: 0.6, arm: 99, bounced: true, fuse: 0.5 }; pv.mines.push(m2); sivTxt(pv, m.x, m.y - 0.05, 'BOUNCY CASTLE', XS.burn); }
  // Cluster Diaper: the whole taped group goes off in turn (Compound Interest: bigger each; Nappy Pin: a chain of 3 ends huge).
  if (m.link && !m.link.going) { m.link.going = true; const L = m.link.list.filter(q => !q.dead); L.forEach((q, i) => { q.chainAt = 0.15 * (i + 1); q.chainK = F.has('compound') ? Math.pow(1.2, i + 1) : 1; q.pin = F.has('pin') && i === L.length - 1 && L.length + 1 >= 3; }); }
}
function nmvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  // Spermy swims a loop (Changing Mat: it stops now and then, and a ring of mines is laid).
  const stop = F.has('mat') && (pv.t % 5) > 4;
  if (!stop) { pv.still = 0; mfPatrol(pv, dt, t => 0.3 + Math.sin(t * 0.7) * 0.18, t => H * (0.5 + Math.sin(t * 1.4) * 0.32)); }
  else { pv.still += dt; if (pv.still > 0.3 && !pv.matDone) { pv.matDone = true; for (let i = 0; i < 6; i++) nmvDrop(pv, me.x + Math.cos(i / 6 * TAU) * 0.08, me.y + Math.sin(i / 6 * TAU) * 0.08); sivTxt(pv, me.x, me.y - 0.09, 'CHANGING MAT', XS.burn, true); } }
  if (!stop) pv.matDone = false;
  if (!stop) blvGun(pv, dt, nmvFire);
  for (const m of pv.mines) {
    if (m.dead) continue;
    m.t -= dt; m.arm -= dt;
    if (m.chainAt != null) { m.chainAt -= dt; if (m.chainAt <= 0) { nmvBoom(pv, m, (m.chainK || 1) * (m.pin ? 3 : 1), m.pin ? 'NAPPY PIN' : F.has('compound') ? 'COMPOUND x' + (m.chainK || 1).toFixed(1) : 'CHAIN'); } continue; }
    if (m.fuse != null) { m.fuse -= dt; if (m.fuse <= 0) nmvBoom(pv, m); continue; }
    if (m.carry) { const e = m.carry; m.ct -= dt; if (e.hp > 0) { m.x = e.x; m.y = e.y; } if (m.ct <= 0) { nmvBoom(pv, m, 1, 'HAND-ME-DOWN'); } continue; }
    if (F.has('crawl')) { const o = fbNearest(pv, m, 0.26); if (o) { const d = sivD(o, m) || 1; m.x += (o.x - m.x) / d * 0.06 * dt; m.y += (o.y - m.y) / d * 0.06 * dt; xsHint(pv, 'cb', 'CRAWLING BABY', XS.burn); } }
    if (m.t <= 0) { nmvBoom(pv, m); continue; }
    if (m.arm > 0) continue;
    const reach = F.has('prox') ? 0.085 : 0;
    for (const e of sivAlive(pv)) if (!e.dying && sivD(e, m) < e.r + 0.012 + reach) {
      if (F.has('hand') && !m.handed) { m.handed = true; m.carry = e; m.ct = 1; sivTxt(pv, e.x, e.y - e.r - 0.04, 'PICKED UP', XS.burn); break; }
      m.touch = e; nmvBoom(pv, m, 1, F.has('prox') && sivD(e, m) > e.r + 0.012 ? 'PROXIMITY' : null); break;
    }
  }
  pv.mines = pv.mines.filter(m => !m.dead);
  // Patches: they grow (Smoulder), merge (Pooling Resources, Nappy Rash) and flare (Flare Up).
  for (const P of pv.puddles) { if (P.grow) P.r = Math.min(0.15, P.r + 0.01 * dt); if (P.flareT > 0) { P.flareT -= dt; if (P.flareT <= 0) P.r = P.r0; } }
  if (F.has('pool') || F.has('rash')) for (let i = 0; i < pv.puddles.length; i++) for (let j = i + 1; j < pv.puddles.length; j++) { const A = pv.puddles[i], B = pv.puddles[j]; if (!A.gone && !B.gone && sivD(A, B) < A.r + B.r) { B.gone = true; A.r = Math.min(0.27, Math.hypot(A.r, B.r)); A.t = Math.max(A.t, B.t); xsHint(pv, 'pr', F.has('rash') ? 'NAPPY RASH' : 'POOLING RESOURCES', XS.burn); } }
  pv.puddles = pv.puddles.filter(P => !P.gone);
  for (const P of pv.puddles) for (const e of sivAlive(pv)) if (sivD(e, P) < P.r && e.ign > 2.9 && F.has('flare') && !P.flared) { P.flared = true; P.r0 = P.r; P.r *= 2; P.flareT = 1; sivTxt(pv, P.x, P.y - P.r, 'FLARE UP', XS.burn); }
  if (F.has('smoulder') && pv.puddles.length) xsHint(pv, 'ls', 'LINGERING SMOULDER', XS.burn);
  if (F.has('field')) xsHint(pv, 'mf', 'MINEFIELD: 3 A DROP', XS.burn);
  xsPools(pv, dt, 'burn');
  fbStepFly(pv, dt, () => {});
  if (pv.flash) { for (const f of pv.flash) f.life -= dt; pv.flash = pv.flash.filter(f => f.life > 0); }
  xsStep(pv, dt);
}
function nmvUnder(pv, g, X, Y, U) {
  xsDrawPools(pv, g, X, Y, U, XS.burn);
  for (const m of pv.mines) if (m.link) for (const o of m.link.list) if (o !== m && !o.dead && sivD(o, m) < 0.2) { g.strokeStyle = '#ffffff55'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(m.x), Y(m.y)); g.lineTo(X(o.x), Y(o.y)); g.stroke(); }
}
function nmvOver(pv, g, X, Y, U) {
  for (const f of pv.flash || []) pvGlow(g, X(f.x), Y(f.y), U * f.r, XS.burn, 0.6 * f.life / 0.3);
  g.globalCompositeOperation = 'source-over';
  for (const m of pv.mines) { // a little nappy with a blinking light (faster as cells come near)
    const x = X(m.x), y = Y(m.y), s = U * 0.014 * (m.nuke ? 1.5 : 1), near = fbNearest(pv, m, 0.15), rate = near ? 16 : 5;
    g.fillStyle = m.nuke ? '#ffd23f' : '#f1ecff'; g.beginPath(); g.moveTo(x - s, y - s * 0.6); g.lineTo(x + s, y - s * 0.6); g.lineTo(x + s * 0.5, y + s * 0.6); g.lineTo(x - s * 0.5, y + s * 0.6); g.closePath(); g.fill();
    g.fillStyle = m.arm > 0 || Math.floor(pv.t * rate) % 2 ? XS.burn : '#fff'; g.beginPath(); g.arc(x, y - s * 0.1, s * 0.3, 0, TAU); g.fill();
  }
  g.globalCompositeOperation = 'lighter';
}
PV_OWN[NMV.id] = { init: nmvInit, step: nmvStep, draw: sivDraw, flags: NMV_FLAG, wave: nmvWave, under: nmvUnder, over: nmvOver, cell: xsCellHook };

// ================================================================ The Runs (burning trail)
const TRV = { id: 's_wake', dmg: 20, life: 2.2, r: 0.037, fill: 0.5 };
const TRV_FLAG = { A: 'cant', B: 'backdraft', C: 'leave', "Can't Hold It": 'cant', 'Burning Rubber': 'rubber', Footloose: 'foot', 'Slip Road': 'slip',
  Backdraft: 'backdraft', 'Full Circle': 'circle', Flashpoint: 'flashp', Breadcrumbs: 'crumbs', 'Slow Burn': 'leave', 'Creature of Habit': 'habit',
  'Well Trodden': 'trodden', 'Wrong Way': 'wrong', Afterburner: 'after', 'Hot Lap': 'lap', 'Scorched Route': 'route' };
function trvInit(pv) {
  const F = xsInit(pv, { range: 0.01, mag: 1, reload: 1, trail: [], waves: [], dropT: 0, gems: [], boost: 0, ph: 0 });
  pv.life = TRV.life * (F.has('leave') ? 3 : 1); if (F.has('route')) pv.life = 20;
  pv.me.x = 0.4;
}
function trvWave(pv) {
  const F = pv.F, H = pv.fh, R = () => Math.random();
  pv.foes = pv.foes.filter(e => e.hp > 0);
  for (let i = 0; i < 6; i++) mfFoe(pv, R() < 0.5 ? 0.95 : 0.05, H * (0.12 + R() * 0.76), { hp: 70, sp: 0.05 });
  if (F.has('crumbs')) for (let i = 0; i < 5; i++) pv.gems.push({ x: 0.2 + R() * 0.6, y: H * (0.2 + R() * 0.6) });
}
function trvStep(pv, dt) {
  dt = Math.min(dt, 1 / 30); pv.t += dt;
  const F = pv.F, me = pv.me, H = pv.fh;
  // Spermy swims a figure of eight (so it crosses its own trail), sprinting now and then.
  const sprint = (pv.t % 4) < 1.2, k = (sprint ? 1.6 : 1) * (pv.boost > 0 ? 2 : 1) * (F.has('cant') && (pv.t % 6) > 5 ? 0.15 : 1);
  pv.ph += dt * 1.6 * k;
  const ox = me.x, oy = me.y;
  me.x = 0.45 + Math.sin(pv.ph) * 0.3; me.y = H * (0.5 + Math.sin(pv.ph * 2) * 0.3);
  const v = Math.hypot(me.x - ox, me.y - oy) / dt; if (v > 0.01) me.a = Math.atan2(me.y - oy, me.x - ox);
  if (pv.boost > 0) pv.boost -= dt;
  // Lay the trail (Wrong Way: ahead of you; Footloose: wider at full speed; Burning Rubber: white-hot while sprinting).
  pv.dropT -= dt;
  if (pv.dropT <= 0) {
    pv.dropT = 0.06;
    const heat = F.has('cant') ? Math.max(0.5, Math.min(2, v / 0.4)) : 1;
    if (F.has('leave')) xsHint(pv, 'lb', 'LEAVE A LITTLE BEHIND: WARMS UP', XS.burn);
    if (F.has('cant') && v < 0.05) { xsHint(pv, 'ch', 'STANDING STILL: NOTHING', '#8a959a'); }
    else {
      const at = F.has('wrong') ? { x: me.x + Math.cos(me.a) * 0.25, y: me.y + Math.sin(me.a) * 0.25 } : { x: me.x - Math.cos(me.a) * 0.03, y: me.y - Math.sin(me.a) * 0.03 };
      const w = F.has('foot') && sprint ? 3 : 1, p = { x: at.x, y: at.y, t: pv.life, max: pv.life, heat, hot: F.has('rubber') && sprint, w, born: pv.t, route: 0 };
      // Well Trodden: a piece laid on a route you keep using turns to embers.
      if (F.has('trodden')) { const old = pv.trail.find(q => sivD(q, p) < 0.03 && pv.t - q.born > 1.5); if (old) { old.route = (old.route || 0) + 1; if (old.route === 3) { old.t = old.max = 10; old.ember = true; sivTxt(pv, old.x, old.y - 0.03, 'WELL TRODDEN', XS.burn); } } }
      // Backdraft / Full Circle / Hot Lap: crossing your own trail.
      const cross = pv.trail.find(q => sivD(q, p) < 0.03 && pv.t - q.born > 0.8);
      if (cross && !(pv.crossT > pv.t)) {
        pv.crossT = pv.t + 1;
        if (F.has('backdraft')) { const org = pv.t; pv.waves.push({ i: pv.trail.indexOf(cross), d: 1, t: 2, org }, { i: pv.trail.indexOf(cross), d: -1, t: 2, org }); sivTxt(pv, p.x, p.y - 0.05, 'BACKDRAFT', XS.burn, true); }
        if ((F.has('circle') || F.has('lap')) && pv.t - cross.born < 4) { const loop = pv.trail.filter(q => q.born >= cross.born); const cx = loop.reduce((a, q) => a + q.x, 0) / loop.length, cy = loop.reduce((a, q) => a + q.y, 0) / loop.length; for (const e of sivAlive(pv)) if (Math.hypot(e.x - cx, e.y - cy) < 0.15) xsAdd(pv, e, 'burn', F.has('lap') ? 1 : 0.8); sivRing(pv, cx, cy, 0.15, XS.burn, 0.4); sivTxt(pv, cx, cy - 0.05, F.has('lap') ? 'HOT LAP' : 'FULL CIRCLE', XS.burn, true); if (F.has('lap')) pv.boost = 2; }
      }
      pv.trail.push(p); if (pv.trail.length > (F.has('route') ? 80 : 200)) pv.trail.shift();
    }
  }
  // Trail pieces burn what they touch.
  for (const p of pv.trail) {
    p.t -= dt;
    const warm = F.has('leave') ? Math.min(1, (pv.t - p.born) / 2) * 0.8 + 0.2 : 1;
    for (const e of sivAlive(pv)) {
      if (e.dying || sivD(e, p) > TRV.r * p.w + e.r) continue;
      let f = TRV.fill * dt * p.heat * warm * (F.has('backdraft') ? 0.7 : 1);
      if (F.has('habit') && Math.abs(Math.atan2(e.y - (e.py || e.y), e.x - (e.px || e.x)) - me.a) < 1) { f *= 1.5; xsHint(pv, 'hb', 'CREATURE OF HABIT +50%', XS.burn); }
      xsAdd(pv, e, 'burn', f);
      if ((p.hot || F.has('after')) && !(e.rubT > pv.t)) { e.rubT = pv.t + (F.has('after') ? 3 : 4); e.ign = 3; sivTxt(pv, e.x, e.y - e.r - 0.04, F.has('after') ? 'AFTERBURNER' : 'BURNING RUBBER', '#ffffff'); }
      if (F.has('slip') && !(e.slipT > pv.t)) { e.slipT = pv.t + 1; e.kx += Math.cos(me.a) * 0.3; e.ky += Math.sin(me.a) * 0.3; sivTxt(pv, e.x, e.y - e.r, 'SLIP ROAD', XS.burn); }
      e.tt = (e.tt || 0) + dt; if (e.tt > 0.5) { e.tt = 0; sivDamage(pv, e, TRV.dmg * 0.25 * p.heat * warm, false, XS.burn); }
    }
  }
  for (const e of sivAlive(pv)) { e.px = e.x; e.py = e.y; }
  pv.trail = pv.trail.filter(p => p.t > 0);
  // Fire waves run along the trail both ways (Flashpoint: where two meet, a burst).
  for (const W of pv.waves) {
    W.t -= dt; W.i += W.d * 30 * dt;
    const p = pv.trail[Math.round(W.i)]; if (!p) { W.t = 0; continue; } W.at = p;
    if (F.has('flashp') && p.waved && p.wOrg !== W.org && pv.t - p.waved < 2 && !W.met) { W.met = true; sivRing(pv, p.x, p.y, 0.15, XS.burn, 0.4); sivTxt(pv, p.x, p.y - 0.05, 'FLASHPOINT', XS.burn, true); for (const e of sivAlive(pv)) if (sivD(e, p) < 0.15) sivDamage(pv, e, 25, false, XS.burn); }
    p.waved = pv.t; p.wOrg = W.org;
    for (const e of sivAlive(pv)) if (sivD(e, p) < 0.05 && !(e.waveT > pv.t)) { e.waveT = pv.t + 0.5; xsAdd(pv, e, 'burn', 0.5); }
  }
  if (F.has('flashp')) for (let i = 0; i < pv.waves.length; i++) for (let j = i + 1; j < pv.waves.length; j++) { const A = pv.waves[i], B = pv.waves[j]; if (A.at && B.at && A.d !== B.d && sivD(A.at, B.at) < 0.03 && A.t < 0.9 && !A.met) { A.met = B.met = true; sivRing(pv, A.at.x, A.at.y, 0.15, XS.burn, 0.4); sivTxt(pv, A.at.x, A.at.y - 0.05, 'FLASHPOINT', XS.burn, true); for (const e of sivAlive(pv)) if (sivD(e, A.at) < 0.15) sivDamage(pv, e, 25, false, XS.burn); } }
  pv.waves = pv.waves.filter(W => W.t > 0);
  // Breadcrumbs: gems you swim past follow you along the trail.
  for (const gm of pv.gems) { if (!gm.f && sivD(gm, me) < 0.1) { gm.f = true; sivTxt(pv, gm.x, gm.y - 0.03, 'BREADCRUMBS', FB_GEM); } if (gm.f) { const d = sivD(gm, me) || 1; gm.x += (me.x - gm.x) / d * Math.min(d, 0.25 * dt); gm.y += (me.y - gm.y) / d * Math.min(d, 0.25 * dt); if (d < 0.03) gm.got = true; } }
  pv.gems = pv.gems.filter(gm => !gm.got);
  if (F.has('wrong')) xsHint(pv, 'ww', 'WRONG WAY: LAID AHEAD', XS.burn);
  if (F.has('route')) xsHint(pv, 'sr', 'SCORCHED ROUTE: 20 s', XS.burn);
  if (F.has('foot') && sprint) xsHint(pv, 'fl', 'FOOTLOOSE: TRIPLE WIDTH', XS.burn);
  if (pv.boost > 0) xsHint(pv, 'bo', 'SPEED x2', '#ffffff');
  xsStep(pv, dt);
}
function trvUnder(pv, g, X, Y, U) {
  const F = pv.F;
  for (const p of pv.trail) {
    const warm = F.has('leave') ? Math.min(1, (pv.t - p.born) / 2) : 1, a = Math.min(1, p.t) * (0.3 + 0.5 * warm);
    g.globalAlpha = a; g.fillStyle = p.hot ? '#ffffff' : p.ember ? '#ff3b3b' : warm < 0.5 ? '#8a3a1a' : XS.burn;
    g.beginPath(); g.arc(X(p.x), Y(p.y), U * TRV.r * p.w * (0.6 + 0.4 * Math.min(1.5, p.heat)), 0, TAU); g.fill();
  }
  g.globalAlpha = 1;
  for (const W of pv.waves) if (W.at) pvGlow(g, X(W.at.x), Y(W.at.y), U * 0.05, '#ffd23f', 0.9);
  for (const gm of pv.gems) { g.fillStyle = FB_GEM; g.save(); g.translate(X(gm.x), Y(gm.y)); g.rotate(Math.PI / 4); g.fillRect(-3, -3, 6, 6); g.restore(); }
}
PV_OWN[TRV.id] = { init: trvInit, step: trvStep, draw: sivDraw, flags: TRV_FLAG, wave: trvWave, under: trvUnder, cell: xsCellHook };
