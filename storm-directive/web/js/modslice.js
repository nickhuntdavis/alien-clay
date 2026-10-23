'use strict';
// Spawn Prawn - the vertical slice's new weapon modifiers, with branches and masteries (redesign docs/MODIFIER_MATRIX.md
// sections 3 and 4; IMPLEMENTATION_PLAN.md Phase 3). First pass, so numbers are the doc's starting ones and sims tune them.
//  - BRANCHES: a modifier's Rank 2 card opens a fork screen (branch A or B, MSB names); its mastery card (Rank 4, one a
//    build: modmatrix.js) opens another (that branch's two masteries). Chosen paths live on the slot: w.mmB, w.mmX.
//    A modifier taken without the screen (tests, the Sandbox) defaults to branch A and its first mastery.
//  - NEW MODIFIERS: Rapid Fire and Focused Intensity (Tempo), Sticky and Connecting (Crowd), Catalyst (Chemistry: never
//    with Switched at Birth, they share the slot), Extra Projectiles (Delivery).
//  - BEAMS: Ricochet now bounces beams at the true reflection angle (1 / 3 / 6, 12 at mastery; -20% a bounce), and
//    Orbiting turns a beam into a ring round you (the hula hoop: radius 72, 100 from Rank 2; from Rank 3 it burns enemy
//    shots; its mastery adds a second, inner ring). No branches on these two yet.
// Simplifications for now: Burst Fire keeps the weapon's rate and adds the burst gap and the last-shot bonus; Projectile
// Extra Projectiles adds forward shots only (no rear shot); Roadblock slows enemies touching a Snared one by half instead
// of pathing round it; Switchboard and Mixer copy bars by taking the larger value; reactions set off later by a timer
// don't count as this weapon's for Catalyst. Not built: pairs, combo masteries, homing beams, Switched at Birth branches.
// Hooks: none in shared files. Wraps weapons24.js wupStats, wupFire, wupDmgMul, wupHit, wupKill, wupTick (as acro.js
// does), v10.js v10Fire, fight.js fightReact, mutations.js mutBarK, modifiers.js modAdd (via modmatrix.js), modDraw,
// draft.js forkCards and draftTitle, modcards.js modCard. Loads after modmatrix.js and mutations.js (after spassives.js).

// ---------------------------------------------------------------- the modifiers
const MS_NEW = {
  rapid:      { name: 'Rapid Fire', atk: ['proj', 'spread', 'beam', 'contact'], max: 3, cap: { rate: [0.4, 0.8, 1.2], dmg: [0.75, 0.7, 0.65] } },
  focus:      { name: 'Focused Intensity', atk: ['beam', 'proj', 'spread', 'contact'], max: 3, cap: { top: [0.4, 0.8, 1.2] } },
  sticky:     { name: 'Sticky', atk: ['proj', 'spread', 'beam'], max: 3, cap: { slow: [0.3, 0.5, 0.7] } },
  connecting: { name: 'Connecting', atk: ['proj', 'spread', 'beam', 'contact'], max: 3, cap: { share: 0.25, life: 3, r: 140 } },
  catalyst:   { name: 'Catalyst', atk: MOD_ALL, max: 3, cap: { bar: [0.25, 0.5, 0.75], rx: [0.2, 0.4, 0.6], frx: [0.3, 0.6, 0.9] } },
  extra:      { name: 'Extra Projectiles', atk: ['beam', 'proj', 'spread'], max: 3, cap: {} },
};
const MS_GRP = { rapid: 'tempo', focus: 'tempo', sticky: 'crowd', connecting: 'crowd', catalyst: 'chemistry', extra: 'delivery' };
for (const id in MS_NEW) {
  MODS10[id] = Object.assign({ desc: 'TODO_COPY:mod_' + id + '_desc' }, MS_NEW[id]);
  MM_GROUP[id] = MS_GRP[id];
  MODUP[id] = ['TODO_COPY:mod_' + id + '_up2', 'TODO_COPY:mod_' + id + '_up3'];
}
MODS10.ricochet.atk.push('beam'); MODS10.orbiting.atk.push('beam');
// Branch A, branch B, then masteries A1, A2, B1, B2 (draft names from the matrix's Branches blocks).
const MSB = {
  rapid: ['Hail', 'Burst Fire', 'Minigun', 'Hose', 'Clip Dump', 'Overheat'],
  focus: ['Tunnel Vision', 'Spotlight', 'Executioner', 'Overfocus', 'Marked for Death', 'Passing the Torch'],
  sticky: ['Superglue', 'Contagious Goo', 'Roadblock', 'Cement', 'Epidemic', 'Sticky Shots'],
  connecting: ['Shared Pain', 'Network', 'Voodoo Doll', 'Deadman\'s Wire', 'Switchboard', 'Tripwire'],
  catalyst: ['Fuel', 'Cross-Contamination', 'Chain Reactor', 'Hair Trigger', 'Reagent', 'Mixer'],
  extra: ['Full Circle', 'Can\'t Pick One', 'Disco Ball', 'Crossfire', 'Swarm', 'Overflow'],
};
const msR = (w, id) => (w && w.m10 ? modCount(w, id) : 0);
const msBr = (w, id) => (w.mmB && w.mmB[id]) || 'A';
const msMa = (w, id) => (msR(w, id) >= 4 ? (w.mmX && w.mmX[id]) || msBr(w, id) + '1' : null);
const msA = (w, id, lv) => msR(w, id) >= lv && msBr(w, id) === 'A';
const msB = (w, id, lv) => msR(w, id) >= lv && msBr(w, id) === 'B';
const msLv = (arr, r) => arr[Math.max(0, Math.min(arr.length, r) - 1)];
const msS = () => G.msS || (G.msS = { links: [], forkT: 0, forkN: 0 });
const MSC = { src: null, rxW: null };
const msSkip = src => !src || src.dot || src.echo || src.wupEcho || src.rx;
const msNear = (x, y, r, not) => { let b = null, bd = r; for (const o of G.enemies) { if (o.dead || (not && not.includes(o))) continue; const d = Math.hypot(o.x - x, o.y - y) - (o.r || 0); if (d < bd) { bd = d; b = o; } } return b; };
const msEcho = (src, extra) => Object.assign({}, src, { echo: true, wupEcho: true, noRx: true, noCrit: true, msEcho: true }, extra || {});
const msBars = e => { const c = fightCd(e); return c && c.bars; };
const msStatusN = e => { const b = msBars(e); return b ? Object.values(b).filter(v => v > 0.2).length : 0; };
const msSlow = (e, k, t) => { if (e.boss) k *= 0.3; e.chill = Math.max(e.chill || 0, t || 1.5); e.chillAmt = Math.max(e.chillAmt || 0, k); };
const msSnare = (e, t) => { e.snareT = Math.max(e.snareT || 0, G.t + t); e.chill = Math.max(e.chill || 0, t); e.chillAmt = Math.max(e.chillAmt || 0, e.boss ? 0.2 : 0.55); };

// modmatrix.js: Catalyst and Switched at Birth share the Chemistry slot.
modOk = (orig => function (w, id) {
  if (!orig(w, id)) return false;
  if (mmGroup(id) === 'chemistry' && w.def && w.def.sab) return false;
  return true;
})(modOk);

// ---------------------------------------------------------------- fork screens
modAdd = (orig => function (w, id) {
  const ok = orig(w, id);
  if (ok && MSB[id]) {
    const r = modCount(w, id);
    if (r === 2 || r === 4) G.lootQueue.unshift({ kind: 'fork', v10ok: true, lv: r, ms: { w, id, st: r === 2 ? 'b' : 'm' } });
  }
  return ok;
})(modAdd);
forkCards = (orig => function (req) {
  if (!req.ms) return orig(req);
  const { w, id, st } = req.ms, N = MSB[id];
  if (!w || !G.weapons.includes(w) || !N) return [];
  const opts = st === 'b' ? [['A', N[0]], ['B', N[1]]] : msBr(w, id) === 'A' ? [['A1', N[2]], ['A2', N[3]]] : [['B1', N[4]], ['B2', N[5]]];
  return opts.map(([k, nm]) => ({ rarity: st === 'b' ? 3 : 4, tag: st === 'b' ? 'FORK' : 'MASTERY', icon: 'F', color: w.def.color, title: nm,
    sub: MODS10[id].name + ' | ' + w.def.name, desc: 'TODO_COPY:br_' + id + '_' + k, modFor: w.def.name,
    apply: () => { const K = st === 'b' ? 'mmB' : 'mmX'; (w[K] || (w[K] = {}))[id] = k; computeStats(w); recomputeAll(); } }));
})(forkCards);
draftTitle = (orig => function (req) {
  if (!req.ms) return orig(req);
  const nm = MODS10[req.ms.id].name.toUpperCase();
  return [nm + (req.ms.st === 'b' ? ': LEVEL 2 FORK' : ' MASTERY'), 'Two ways to grow. Take one; the other is gone for the run.'];
})(draftTitle);
modCard = (orig => function (w, id) { // (the Rank 3 card follows the branch taken)
  const c = orig(w, id);
  if (MSB[id] && modCount(w, id) === 2) c.desc = 'TODO_COPY:br_' + id + '_' + msBr(w, id) + '_3';
  return c;
})(modCard);

// ---------------------------------------------------------------- stats (wupStats)
const msBeams = w => { // front extra beams, rear beams (Extra Projectiles)
  const r = msR(w, 'extra'); if (!r) return [0, 0];
  return [1 + (msA(w, 'extra', 3) ? 1 : 0), msA(w, 'extra', 2) ? 1 : 0];
};
function msStats(w, s) {
  if (!w.m10 || w.isSpell) return;
  let any = false;
  const r = (typeof lzIs === 'function' && lzIs(w)) ? 0 : msR(w, 'rapid'); // (on the Laser, Rapid Fire shortens its charge-up instead: laserbeam.js)
  if (msR(w, 'rapid')) any = true;
  if (r) {
    any = true; s.cd /= 1 + msLv(MS_NEW.rapid.cap.rate, r); s.dmg *= msLv(MS_NEW.rapid.cap.dmg, r);
    if (msMa(w, 'rapid') === 'A2' && s.cd > 0.1) { s.dmg *= 0.1 / s.cd * 1.15; s.cd = 0.1; } // Hose: one weak, fast stream
  }
  const x = msR(w, 'extra');
  if (x) {
    any = true;
    if (w.def.v10atk === 'beam') { const [f, b] = msBeams(w); s.dmg *= Math.pow(1 / (1 + f + b), 0.4); }
    else { const n0 = s.count || 1, n1 = n0 + (msA(w, 'extra', 3) ? 2 : 1); s.count = n1; s.dmg *= Math.pow(n0 / n1, 0.4); } // (more shots, less each: rule 5)
  }
  for (const id of ['focus', 'sticky', 'connecting', 'catalyst', 'ricochet', 'orbiting']) if (msR(w, id)) any = true;
  if (any) { w.uh = w.uh || {}; G.msAny = true; } // (game.js asks wupFire only when the slot has hooks)
}
wupStats = (orig => function (w, s) { orig(w, s); msStats(w, s); })(wupStats);

// ---------------------------------------------------------------- firing (wupFire: true = this replaced the shot)
function msRefire(w, k, t) {
  if (!G || !G.weapons.includes(w)) return;
  const p = G.player, tg = t && !t.dead ? t : msNear(p.x, p.y, w.s.range || 320);
  if (!tg) return;
  w._msFree = 1; w._msK = k; try { fireWeapon(w, tg); } finally { w._msFree = 0; w._msK = 1; }
}
function msFire(w, target, src) {
  if (!w.m10) return false;
  const p = G.player, s = w.s;
  if (w._msK && w._msK !== 1) src.mult = (src.mult || 1) * w._msK;
  if (w._ventT > G.t) return true; // Overheat: venting
  // Rapid Fire
  const r = (typeof lzIs === 'function' && lzIs(w)) ? 0 : msR(w, 'rapid');
  if (r) {
    if (!(G.t - (w._lastF || -9) < 1)) { w._spinS = G.t; w._heatS = G.t; }
    w._lastF = G.t;
    if (!w._msFree) {
      if (msA(w, 'rapid', 2) && Math.random() < (r >= 3 ? 0.2 : 0.15)) after(0.07, () => msRefire(w, 1, target)); // Hail: a free shot
      if (msB(w, 'rapid', 2)) { // Burst Fire: bursts of 3 (4), the last one harder, then a 0.5 s gap
        const n = r >= 3 ? 4 : 3; w._bn = (w._bn || 0) + 1;
        if (w._bn % n === 0) {
          src.mult = (src.mult || 1) * (r >= 3 ? 1.75 : 1.5); w.cd += 0.5; w._bursts = (w._bursts || 0) + 1;
          if (msMa(w, 'rapid') === 'B1' && w._bursts % 5 === 0) for (let i = 1; i <= 12; i++) after(i * 0.04, () => msRefire(w, 0.5)); // Clip Dump
        }
      }
    }
  }
  // Orbiting beam: the hula hoop
  if (w.def.v10atk === 'beam' && msR(w, 'orbiting') && !(typeof lzIs === 'function' && lzIs(w))) { // (the Laser's orbit is a traced beam: laserbeam.js)
    for (const R of msHoops(w)) for (const e of G.enemies) if (!e.dead && Math.abs(Math.hypot(e.x - p.x, e.y - p.y) - R) < e.r + (s.width || 10) + 6) damageEnemy(e, s.dmg, src);
    return true;
  }
  // Extra Projectiles, Disco Ball on Projectile weapons: a ring of shots at 50%
  if (w.def.v10atk !== 'beam' && msMa(w, 'extra') === 'A1' && !w._msFree) for (let i = 0; i < 8; i++) spawnProj(w, p.x, p.y, i / 8 * TAU, Object.assign({}, src, { mult: (src.mult || 1) * 0.5 }));
  return false;
}
wupFire = (orig => function (w, t, src) { const took = orig(w, t, src); return msFire(w, t, src) || took; })(wupFire);
const msHoops = w => { const r = msR(w, 'orbiting'), R = r >= 2 ? 100 : 72; return r >= 4 ? [R, R * 0.6] : [R]; };

// One beam from any point: hits everything along it, draws like the weapon's beam (the Laser's look: laser.js).
function msBeam(w, x, y, a, L, k, src, skip) {
  const wd = w.s.width || 10, hit = [], c = Math.cos(a), sn = Math.sin(a);
  for (const e of G.enemies) {
    if (e.dead || (skip && skip.includes(e))) continue;
    const t = Math.max(0, Math.min(L, (e.x - x) * c + (e.y - y) * sn));
    if (Math.hypot(e.x - (x + c * t), e.y - (y + sn * t)) > e.r + wd) continue;
    damageEnemy(e, w.s.dmg * k, src); hit.push(e);
  }
  msBeamFx(w, x, y, x + c * L, y + sn * L, wd);
  return hit;
}
function msBeamFx(w, x, y, x2, y2, wd) {
  const las = typeof LASER !== 'undefined' && w.def.name === LASER.name;
  (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x, y, x2, y2, w: las ? Math.max(3, wd * 0.45) : wd, c: las && !w.def.sab ? LASER.col : w.def.color, t: las ? 'laser' : w.def.v10type, life: 0.12, max: 0.12 });
}
// Ricochet on beams: off the first enemy along each segment, at the true reflection angle.
function msRicochet(w, target, src) {
  const r = msR(w, 'ricochet'), p = G.player; if (!r || !target || target.dead) return;
  const n = [1, 3, 6, 12][Math.min(4, r) - 1], wd = w.s.width || 10;
  let x = p.x, y = p.y, a = Math.atan2(target.y - p.y, target.x - p.x), e = target, k = 1, last = [];
  for (let i = 0; i < n && e; i++) {
    const dx = Math.cos(a), dy = Math.sin(a), R = e.r + wd, tc = (e.x - x) * dx + (e.y - y) * dy;
    let h = (e.x - x) * -dy + (e.y - y) * dx; // (signed offset of the centre from the line)
    if (Math.abs(h) < R * 0.25) h = (h < 0 ? -1 : 1) * R * 0.25; // (a dead-centre hit would bounce straight back)
    h = Math.max(-R * 0.95, Math.min(R * 0.95, h));
    const t0 = tc - Math.sqrt(R * R - h * h), cx = x + dx * t0, cy = y + dy * t0;
    const nx = (cx - e.x) / R, ny = (cy - e.y) / R, dot = dx * nx + dy * ny;
    a = Math.atan2(dy - 2 * dot * ny, dx - 2 * dot * nx); k *= 0.8; last = [e];
    const L = w.s.range * 0.7, c = Math.cos(a), s = Math.sin(a);
    let nxt = null, bt = L;
    for (const o of G.enemies) { if (o.dead || o === e) continue; const t = (o.x - cx) * c + (o.y - cy) * s; if (t < 0 || t > bt) continue; if (Math.hypot(o.x - (cx + c * t), o.y - (cy + s * t)) < o.r + wd) { bt = t; nxt = o; } }
    msBeamFx(w, cx, cy, cx + c * bt, cy + s * bt, wd);
    if (nxt) damageEnemy(nxt, w.s.dmg * k, src);
    x = cx; y = cy; e = nxt;
  }
}
v10Fire = (orig => function (w, target, src) {
  const r = orig(w, target, src);
  if (!r || !w || !w.m10 || w.def.v10atk !== 'beam' || !target) return r;
  const p = G.player, a0 = Math.atan2(target.y - p.y, target.x - p.x), L = w.s.range;
  if (msR(w, 'ricochet')) msRicochet(w, target, src);
  if (msR(w, 'extra')) {
    const [f, b] = msBeams(w), front = [], rear = [];
    for (const e of G.enemies) {
      if (e.dead || e === target || Math.hypot(e.x - p.x, e.y - p.y) > L) continue;
      const da = Math.abs(((Math.atan2(e.y - p.y, e.x - p.x) - a0 + Math.PI * 3) % TAU) - Math.PI);
      (da <= Math.PI / 2 ? front : rear).push(e);
    }
    const byD = (u, v) => Math.hypot(u.x - p.x, u.y - p.y) - Math.hypot(v.x - p.x, v.y - p.y);
    front.sort(byD); rear.sort(byD);
    for (const e of front.slice(0, f)) msBeam(w, p.x, p.y, Math.atan2(e.y - p.y, e.x - p.x), L, 1, src);
    for (const e of rear.slice(0, b)) msBeam(w, p.x, p.y, Math.atan2(e.y - p.y, e.x - p.x), L, 1, src);
    const m = msMa(w, 'extra');
    if (m === 'A1') for (let i = 0; i < 6; i++) msBeam(w, p.x, p.y, G.t * 1.5 + i / 6 * TAU, L, 0.5, src); // Disco Ball
    if (m === 'A2') { const ux = (target.x - p.x), uy = (target.y - p.y), l = Math.hypot(ux, uy) || 1; // Crossfire: one more from the far side
      const ox = target.x + ux / l * 140, oy = target.y + uy / l * 140; msBeamFx(w, ox, oy, target.x, target.y, w.s.width || 10); damageEnemy(target, w.s.dmg * 1.3, src); }
  }
  return r;
})(v10Fire);

// ---------------------------------------------------------------- damage (wupDmgMul)
function msFocusRamp(w) {
  const F = w._f; if (!F || !F.e) return 0;
  const r = msR(w, 'focus'), top = msLv(MS_NEW.focus.cap.top, Math.min(3, r)) * (msMa(w, 'focus') === 'A2' ? 2 : 1);
  return Math.min(top, Math.floor((G.t - F.s) / 0.5) * 0.1);
}
const msFocusFull = w => { const r = msR(w, 'focus'); return r && msFocusRamp(w) >= msLv(MS_NEW.focus.cap.top, Math.min(3, r)) - 1e-6; };
function msDmgMul(e, src) {
  if (!G.msAny) return 1;
  MSC.src = src;
  let k = 1;
  const w = src && src.w;
  if (src && src.rx && MSC.rxW) { // Catalyst: this weapon's reactions hit harder
    const cw = MSC.rxW, r = msR(cw, 'catalyst');
    if (r) k *= 1 + msLv(cw.def.elem === 'phys' ? MS_NEW.catalyst.cap.frx : MS_NEW.catalyst.cap.rx, Math.min(3, r)) + (r >= 4 ? 0.2 : 0);
  }
  if (e.msMark > G.t) k *= 1.5; // Marked for Death
  if (e.snareT > G.t && e.msCement > G.t) k *= 1.3; // Cement
  if (!w || msSkip(src)) return k;
  // Focused Intensity on this weapon
  if (msR(w, 'focus')) {
    const F = w._f || (w._f = { e: null, s: G.t, last: -9, pass: 0 });
    if (F.e !== e && F.e && !F.e.dead && G.t - F.last < 0.3) return k; // (a second enemy in the same beam or volley: no ramp, no switch)
    if (F.e !== e || G.t - F.last > 1) {
      const keep = msMa(w, 'focus') === 'A2' ? 0 : msA(w, 'focus', 3) ? 0.75 : msA(w, 'focus', 2) ? 0.5 : 0, old = F.e && G.t - F.last <= 1 ? msFocusRamp(w) : 0;
      F.e = e; F.s = G.t - old * keep * 5; F.pass = 0;
    }
    F.last = G.t;
    if (!(typeof lzOwnFocus === 'function' && lzOwnFocus(w))) k *= 1 + msFocusRamp(w); // (the Laser ramps its own way: laserbeam.js)
    if (msMa(w, 'focus') === 'B1' && msFocusFull(w)) e.msMark = G.t + 30;
  }
  // Spotlight: your other weapons share the focused enemy's ramp
  for (const ow of G.weapons) if (ow && ow !== w && ow._f && ow._f.e === e && msB(ow, 'focus', 2)) k *= 1 + msFocusRamp(ow) * (msR(ow, 'focus') >= 3 ? 0.5 : 0.25);
  // Superglue: slowed enemies take more from this weapon
  if (msA(w, 'sticky', 2) && e.chill > 0) k *= msR(w, 'sticky') >= 3 ? 1.2 : 1.1;
  return k;
}
wupDmgMul = (orig => function (e, src) { return orig(e, src) * msDmgMul(e, src); })(wupDmgMul);
// Catalyst: status bars from this weapon fill faster (mutations.js mutBarK; MSC.src is the hit being resolved).
mutBarK = (orig => function (e) {
  const k0 = orig(e), src = MSC.src; MSC.src = null; // (a per-type table, or nothing)
  if (!G.msAny || !src) return k0;
  let k = 1;
  const w = src.w, r = msR(w, 'catalyst');
  if (r && !msSkip(src)) {
    k *= 1 + msLv(MS_NEW.catalyst.cap.bar, Math.min(3, r)) + (r >= 4 ? 0.25 : 0);
    if (msA(w, 'catalyst', 2)) k *= 1 + Math.min(r >= 3 ? 0.6 : 0.3, 0.1 * Math.max(0, msStatusN(e) - 1)); // Fuel
  }
  if (e.catT > G.t && e.catW && e.catW !== w && G.weapons.includes(e.catW)) k *= msR(e.catW, 'catalyst') >= 3 ? 1.3 : 1.15; // Cross-Contamination
  if (k === 1) return k0;
  const out = {}; for (const t of ['acid', 'fire', 'force', 'soul']) out[t] = ((k0 && k0[t]) || 1) * k;
  return out;
})(mutBarK);
fightReact = (orig => function (e, t, raw, src, res) { // (which weapon set the reaction off: Catalyst)
  const was = MSC.rxW; MSC.rxW = src && src.w && msR(src.w, 'catalyst') ? src.w : null;
  try { return orig(e, t, raw, src, res); } finally { MSC.rxW = was; }
})(fightReact);

// ---------------------------------------------------------------- hits (wupHit)
function msLinkAdd(w, a, b, life) {
  const S = msS(); if (S.links.length >= 12) S.links.shift();
  S.links.push({ a, b, w, t: G.t + life });
}
const msLinksOf = e => msS().links.filter(L => (L.a === e || L.b === e) && L.t > G.t && !L.a.dead && !L.b.dead);
function msHit(e, res, src) {
  if (!G.msAny || !src || e.dead && !res) return;
  const w = src.w;
  // Catalyst masteries on reactions: Chain Reactor repeats once nearby at 50%
  if (src.rx && MSC.rxW && msMa(MSC.rxW, 'catalyst') === 'A1' && !src.msRep && res.toHp > 0) {
    const o = msNear(e.x, e.y, 80, [e]); if (o) damageEnemy(o, res.toHp * 0.5, Object.assign({}, src, { msRep: true }));
  }
  if (src.rx && MSC.rxW && msB(MSC.rxW, 'catalyst', 2)) e.reagT = G.t + 3; // (Reagent reads it)
  if (e.reagT > G.t && G.weapons.some(x => x && msMa(x, 'catalyst') === 'B1')) res.heavy = true; // Reagent
  // Links from any weapon: Network, Voodoo Doll, Switchboard
  if (!src.msEcho && res.toHp > 0) {
    const links = msLinksOf(e);
    for (const L of links) {
      const o = L.a === e ? L.b : L.a, lw = L.w;
      let share = 0;
      if (lw === w) share = msA(lw, 'connecting', 2) ? 0.4 : MS_NEW.connecting.cap.share;
      else if (msMa(lw, 'connecting') === 'A1') share = 0.5;
      else if (msB(lw, 'connecting', 2)) share = msR(lw, 'connecting') >= 3 ? 0.3 : 0.2;
      if (share) damageEnemy(o, res.toHp * share, msEcho(src));
      if (msMa(lw, 'connecting') === 'B1') { const be = msBars(e), bo = msBars(o); if (be && bo) for (const k in be) bo[k] = Math.max(bo[k], Math.min(0.99, be[k] * 0.4)); }
    }
    if (links.length) e.msLastHit = res.toHp;
  }
  if (!w || msSkip(src)) return;
  // Sticky Shots: other weapons that hit a stuck enemy pick up goo for 3 s
  if (e.snareT > G.t && e.msStuckBy && e.msStuckBy !== w && msMa(e.msStuckBy, 'sticky') === 'B2') w._gooT = G.t + 3;
  if (w._gooT > G.t) msSlow(e, 0.3);
  // Sticky
  const sr = msR(w, 'sticky');
  if (sr) {
    const sl = msLv(MS_NEW.sticky.cap.slow, Math.min(3, sr));
    msSlow(e, sl);
    if (msB(w, 'sticky', 2)) forNear(e.x, e.y, e.r + 40, o => { if (o !== e && !o.dead) msSlow(o, sl / 2); }); // Contagious Goo
    if (sr >= 3) {
      e.msStk = e.msStkW === w ? (e.msStk || 0) + 1 : 1; e.msStkW = w;
      if (e.msStk % 3 === 0) {
        msSnare(e, 1); e.msStuckBy = w;
        const m = msMa(w, 'sticky');
        if (m === 'A2') e.msCement = G.t + 1;
        if (msB(w, 'sticky', 3)) { // the Snare passes on: to one neighbour, or a chain of 6 (Epidemic)
          let cur = e, seen = [e];
          for (let i = 0; i < (m === 'B1' ? 6 : 1); i++) { const o = msNear(cur.x, cur.y, cur.r + 40, seen); if (!o) break; msSnare(o, 0.5); o.msStuckBy = w; seen.push(o); cur = o; }
        }
      }
    }
  }
  // Connecting: link what this weapon hits
  const cr = msR(w, 'connecting');
  if (cr) {
    const max = msA(w, 'connecting', 2) ? 2 : 1, mine = msLinksOf(e).filter(L => L.w === w);
    if (mine.length < max) {
      const o = msNear(e.x, e.y, MS_NEW.connecting.cap.r, [e, ...mine.map(L => (L.a === e ? L.b : L.a))]);
      if (o) msLinkAdd(w, e, o, MS_NEW.connecting.cap.life * (msA(w, 'connecting', 2) ? 1.5 : 1));
    }
  }
  // Catalyst on this weapon's hits
  const kr = msR(w, 'catalyst');
  if (kr) {
    if (msB(w, 'catalyst', 2)) { e.catT = G.t + 2; e.catW = w; } // Cross-Contamination
    const m = msMa(w, 'catalyst');
    if (m === 'A2' && msStatusN(e) >= 2) res.heavy = true; // Hair Trigger
    if (m === 'B2') { const b = msBars(e); if (b) { const top = Object.keys(b).reduce((u, v) => (b[u] >= b[v] ? u : v)); forNear(e.x, e.y, 60, o => { if (o !== e && !o.dead) { const bo = msBars(o); if (bo) bo[top] = Math.max(bo[top], Math.min(0.99, b[top] * 0.5)); } }); } } // Mixer
  }
  // Focused Intensity: Executioner
  if (msMa(w, 'focus') === 'A1' && msFocusFull(w) && !e.dead && !e.elite && !e.boss && e.hp < e.maxHp * 0.25) damageEnemy(e, e.hp * 4 + 10, msEcho(src));
  // Extra Projectiles, Can't Pick One: a hit may fork into two (three) weaker shots or beams
  if (msB(w, 'extra', 2) && !src.msFork && !e.dead) {
    const m = msMa(w, 'extra'), ch = m === 'B1' ? 0.4 : msR(w, 'extra') >= 3 ? 0.3 : 0.2;
    if (Math.random() < ch) {
      const S = msS(); if (G.t - S.forkT > 1) { S.forkT = G.t; S.forkN = 0; }
      const n = m === 'B1' ? 3 : 2, k = m === 'B1' ? 0.4 : 0.5, fsrc = Object.assign({}, src, { msFork: true }), seen = [e];
      for (let i = 0; i < n; i++) {
        if (S.forkN >= 12) { if (m === 'B2') aoe(e.x, e.y, 40, w.s.dmg * 0.5, fsrc, w.def.color); break; } // Overflow
        const o = msNear(e.x, e.y, 160, seen); if (!o) break; seen.push(o); S.forkN++;
        if (w.def.v10atk === 'beam') { msBeamFx(w, e.x, e.y, o.x, o.y, (w.s.width || 10) * 0.5); damageEnemy(o, w.s.dmg * k, fsrc); }
        else spawnProj(w, e.x, e.y, Math.atan2(o.y - e.y, o.x - e.x), Object.assign({}, fsrc, { mult: (src.mult || 1) * k }));
      }
    }
  }
}
wupHit = (orig => function (e, res, src) { orig(e, res, src); msHit(e, res, src); })(wupHit);

// ---------------------------------------------------------------- kills (wupKill)
function msKill(e, src) {
  if (!G.msAny) return;
  for (const L of msS().links) {
    if (L.t <= G.t || (L.a !== e && L.b !== e)) continue;
    const o = L.a === e ? L.b : L.a, w = L.w; if (o.dead || !G.weapons.includes(w)) continue;
    const sw = weaponSrc(w);
    if (msMa(w, 'connecting') === 'A2') { aoe(o.x, o.y, 60, w.s.dmg, msEcho(sw), w.def.color); ring(o.x, o.y, 60, w.def.color, 0.35, 3); L.t = 0; } // Deadman's Wire
    else if (msA(w, 'connecting', 3) && e.msLastHit) damageEnemy(o, e.msLastHit * 0.5, msEcho(sw)); // Shared Pain: the last hit again
  }
}
wupKill = (orig => function (e, src) { orig(e, src); msKill(e, src); })(wupKill);

// ---------------------------------------------------------------- every frame (wupTick)
function msTick(dt) {
  if (!G || !G.msAny) return;
  const p = G.player, S = msS();
  S.links = S.links.filter(L => L.t > G.t && !L.a.dead && !L.b.dead);
  for (const w of G.weapons) {
    if (!w || !w.m10) continue;
    const m = msMa(w, 'rapid'), firing = G.t - (w._lastF || -9) < 1;
    if (m === 'A1' && firing) w.cd -= dt * Math.min(1, (G.t - (w._spinS || G.t)) / 3); // Minigun: spins up to +100%
    if (m === 'B2' && firing && !(w._ventT > G.t) && G.t - (w._heatS || G.t) > 4) { w._ventT = G.t + 1.5; w._ventP = 1; } // Overheat
    if (w._ventP && !(w._ventT > G.t)) { w._ventP = 0; w._heatS = G.t; aoe(p.x, p.y, 100, w.s.dmg * 1.5, weaponSrc(w), w.def.color); ring(p.x, p.y, 100, w.def.color, 0.4, 5); }
    // Passing the Torch: the ramp moves on when the focused enemy dies (3 passes in a row)
    if (w._f && w._f.e && w._f.e.dead && msMa(w, 'focus') === 'B2' && w._f.pass < 3) { const o = msNear(w._f.e.x, w._f.e.y, 150); if (o) { w._f.e = o; w._f.last = G.t; w._f.pass++; } }
    // Orbiting beam from Rank 3: the ring burns enemy shots
    if (w.def.v10atk === 'beam' && msR(w, 'orbiting') >= 3) for (const R of msHoops(w)) for (const b of G.ebul) if (!b.dead && Math.abs(Math.hypot(b.x - p.x, b.y - p.y) - R) < 8) b.dead = true;
    // Tripwire: enemies crossing this weapon's links
    if (msMa(w, 'connecting') === 'B2') for (const L of S.links.slice(-6)) if (L.w === w) for (const e of G.enemies) {
      if (e.dead || e === L.a || e === L.b || e.msTripT > G.t) continue;
      const vx = L.b.x - L.a.x, vy = L.b.y - L.a.y, l2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((e.x - L.a.x) * vx + (e.y - L.a.y) * vy) / l2));
      if (Math.hypot(e.x - (L.a.x + vx * t), e.y - (L.a.y + vy * t)) < e.r + 4) { e.msTripT = G.t + 0.5; damageEnemy(e, w.s.dmg * 0.3, msEcho(weaponSrc(w))); }
    }
    // Roadblock: enemies touching one this weapon Snared are slowed by half
    if (msMa(w, 'sticky') === 'A1') { let n = 0; for (const e of G.enemies) if (!e.dead && e.snareT > G.t && e.msStuckBy === w && n++ < 6) forNear(e.x, e.y, e.r + 24, o => { if (o !== e) msSlow(o, 0.5, 0.3); }); }
  }
  for (const e of G.enemies) if (e.msCement > G.t && e.snareT > G.t) { e.kx = 0; e.ky = 0; } // Cement: can't be knocked
}
wupTick = (orig => function (dt) { orig(dt); msTick(dt); })(wupTick);

// ---------------------------------------------------------------- drawing (modDraw)
modDraw = (orig => function () {
  orig();
  if (!G || !G.msAny) return;
  const p = G.player;
  ctx.save(); ctx.lineCap = 'round';
  for (const L of msS().links) { // Connecting threads
    if (L.t <= G.t || L.a.dead || L.b.dead) continue;
    ctx.strokeStyle = col(L.w.def.sab || !(typeof LASER !== 'undefined' && L.w.def.name === LASER.name) ? L.w.def.color : LASER.col);
    ctx.globalAlpha = 0.55; ctx.lineWidth = 1.5 * S; ctx.beginPath(); ctx.moveTo(sx(L.a.x), sy(L.a.y)); ctx.lineTo(sx(L.b.x), sy(L.b.y)); ctx.stroke();
  }
  for (const w of G.weapons) { // the hula hoop
    if (!w || w.def.v10atk !== 'beam' || !msR(w, 'orbiting') || (typeof lzIs === 'function' && lzIs(w))) continue;
    const las = typeof LASER !== 'undefined' && w.def.name === LASER.name && !w.def.sab, c = col(las ? LASER.col : w.def.color), wd = (w.s.width || 10) * (las ? 0.45 : 1);
    for (const R of msHoops(w)) {
      ctx.strokeStyle = c; ctx.globalAlpha = 0.22; ctx.lineWidth = wd * 2 * S; ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), R * S, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 0.85; ctx.lineWidth = Math.max(1.5, wd * 0.5 * S); ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), R * S, 0, TAU); ctx.stroke();
    }
  }
  ctx.restore();
})(modDraw);
