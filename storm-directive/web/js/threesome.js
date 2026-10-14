'use strict';
// Spawn Prawn - The Devil's Threesome (PROTOTYPE, Settings > Play). One pool of Juice (10 pips) split three ways by a
// puck in a triangle (bottom right): Rubber (defence), Wiggle (mobility), Spunk (offence). Getting hit, sprinting and
// performing Feats all drain the one pool; the split is redone from the puck every frame. Tiers: 1-2 pips, 3-4, 5+.
//  - Rubber: each pip soaks a chunk of a hit before HP. 3+: one hit every 10 s is free. 5+: soaking a hit fires a
//    spine burst that clears enemy bullets nearby.
//  - Wiggle: +3% speed a pip. 1+: sprint (costs Juice; 0 Wiggle: no sprint). 3+: Flinch (a hit is dodged with a dart
//    sideways, 1 pip, 6 s cooldown). 5+: Flinch every 3 s, sprinting gives i-frames and leaves a stinging wake.
//  - Spunk: +3% fire rate a pip. Attacking Feats cost 1 to 3 pips. Tier read before paying: I x1, II x1.35 and +1
//    count / +20% area, III x1.7 and stuns what it hits for 1.5 s. 0 Spunk: no attacking Feats.
// Juice regrows 1 pip per 2.5 s after 2 s unhurt; kills top it up (elites 1, bosses 3).
// Keys: 1 Rubber, 2 Wiggle, 3 Spunk, 4 centre.
// Hooks: trioTick (stamTick), trioSpeed (sprintMul), trioRate (weapon fire rate), trioFeatCost / trioFeatPay
// (featCost / featPay), trioFeat (featFire), trioFlinch / trioAbsorb (hurtPlayer), trioKill (killEnemy), trioDraw (HUD).
const TRIO = { max: 10, regen: 0.4, restAfter: 2, soak: 0.06, sprintCost: 1.1, flinchCd: [6, 3], freeCd: 10,
  side: 112, snap: 18, col: ['#9ef0ff', '#4dff9a', '#ffb84d'], name: ['RUBBER', 'WIGGLE', 'SPUNK'] };
const trioOn = () => !!(G && SET.trio !== false);
const trioTier = n => (n >= 5 ? 3 : n >= 3 ? 2 : n >= 1 ? 1 : 0);
function trioState() {
  if (!G.trio) G.trio = { juice: TRIO.max, w: [1 / 3, 1 / 3, 1 / 3], hitT: -9, flinchT: -9, freeT: -9, wakeT: 0, flash: [0, 0, 0], tiers: [0, 0, 0] };
  return G.trio;
}
// Whole pips split by the puck (largest remainder, so a centred 10 is 3/3/4 and an edge starves its third corner).
function trioAlloc() {
  const T = trioState(), n = Math.floor(T.juice + 1e-6), raw = T.w.map(w => w * n), a = raw.map(Math.floor);
  let left = n - a[0] - a[1] - a[2];
  const order = [0, 1, 2].sort((i, j) => (raw[j] - a[j]) - (raw[i] - a[i]));
  for (const i of order) { if (left <= 0) break; if (T.w[i] > 0.001) { a[i]++; left--; } }
  return a;
}
const trioPts = i => (trioOn() ? trioAlloc()[i] : 0);
function trioSpend(n) { const T = trioState(); T.juice = Math.max(0, T.juice - n); T.hitT = Math.max(T.hitT, G.t - TRIO.restAfter + 0.6); }

function trioTick(dt) {
  const T = trioState(), p = me(), S = G.stam;
  // Sprint: the stick held at its edge, as before, but paid from Juice and only with Wiggle in the split.
  T.edgeT = G.manual && G.manual.edge ? (T.edgeT || 0) + dt : 0;
  const wig = trioPts(1);
  S.sprint = !!(G.manual && (G.manual.sprint || T.edgeT > STAM.hold)) && wig >= 1 && T.juice > 0.3 && G.state === 'play';
  S.cur = stamMax() * T.juice / TRIO.max; S.winded = false; S.restT = 0; // (the old stamina ring stays quiet)
  if (S.sprint) {
    trioSpend(TRIO.sprintCost * dt);
    if (wig >= 5) {
      p.iframes = Math.max(p.iframes, 0.08);
      if ((T.wakeT -= dt) <= 0) {
        T.wakeT = 0.12;
        forNear(p.x, p.y, 46, e => { if (!e.charmed && !e.egg) damageEnemy(e, 6 + G.P.maxHp * 0.04, { elem: 'phys', wname: 'Wiggle Wake', noProc: true }); });
        fxParts('spark', p.x, p.y, TRIO.col[1], 3, 60, 0.4, 2.5);
      }
    } else if (Math.random() < dt * 20) fxParts('spark', p.x, p.y, TRIO.col[1], 1, 40, 0.3, 2);
  }
  if (G.t - T.hitT > TRIO.restAfter) T.juice = Math.min(TRIO.max, T.juice + TRIO.regen * dt);
  // Tier changes: flash the corner (and a word over you when one goes up).
  const a = trioAlloc();
  for (let i = 0; i < 3; i++) {
    const t = trioTier(a[i]);
    if (t !== T.tiers[i]) { T.flash[i] = 1; if (t > T.tiers[i] && t >= 2) floatText(p.x, p.y - 34, `${TRIO.name[i]} ${['', 'I', 'II', 'III'][t]}`, TRIO.col[i], 12, 0.7); T.tiers[i] = t; }
    T.flash[i] = Math.max(0, T.flash[i] - dt * 2.5);
  }
  trioKeys();
}
const trioSpeed = () => (trioOn() ? 1 + 0.03 * trioPts(1) : 1);
const trioRate = () => (trioOn() ? 1 + 0.03 * trioPts(2) : 1);

// Feats: 1 to 3 pips by size (cooldown), and Spunk sets the tier.
const trioFeatCost = w => (w.s.cd >= 9 ? 3 : w.s.cd >= 6 ? 2 : 1);
function trioFeatPay(w) {
  const T = trioState(), c = trioFeatCost(w), sp = trioPts(2);
  if (sp < 1 || T.juice < c) return false;
  T.featTier = trioTier(sp); trioSpend(c);
  return true;
}
function trioFeat(w, target) {
  const T = G.trio;
  if (!trioOn() || !T || !T.featTier || !STAM_FEATS.has(w.id) || w.echo) { fireWeapon(w, target); return; }
  const tier = T.featTier, s0 = w.s, s = Object.assign({}, s0);
  T.featTier = 0;
  s.dmg = s0.dmg * [1, 1, 1.35, 1.7][tier];
  if (tier >= 2) { if (s.count) s.count += 1; if (s.area) s.area *= 1.2; }
  w.s = s;
  try { fireWeapon(w, target); } finally { w.s = s0; }
  if (tier >= 3) {
    const p = me(), x = target ? target.x : p.x, y = target ? target.y : p.y, r = (s.area || 120) + 40;
    after(Math.min(0.8, (s.delay || 0) + 0.05), () => forNear(x, y, r, e => { if (!e.boss && !e.rival && !e.egg && !e.charmed && !e.dead) e.frozen = Math.max(e.frozen || 0, 1.5); }));
    floatText(p.x, p.y - 40, 'SPUNK III', TRIO.col[2], 13, 0.7);
  }
}

// Wiggle 3+: Flinch. A hit that would land is dodged with a dart sideways (1 pip).
function trioFlinch(ent) {
  if (!trioOn()) return false;
  const T = trioState(), wig = trioPts(1);
  if (wig < 3 || T.juice < 1 || G.t - T.flinchT < TRIO.flinchCd[wig >= 5 ? 1 : 0]) return false;
  const p = me(), hf = G.hitFrom || ent;
  let a = hf && hf.x != null ? Math.atan2(hf.y - p.y, hf.x - p.x) : p.face || 0;
  a += (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2;
  dashPlayer(Math.cos(a), Math.sin(a), 420); p.iframes = Math.max(p.iframes, wig >= 5 ? 0.6 : 0.35);
  T.flinchT = G.t; trioSpend(1); G.hitFrom = null;
  floatText(p.x, p.y - 24, 'FLINCH', TRIO.col[1], 14);
  fxParts('spark', p.x, p.y, TRIO.col[1], 8, 120, 0.35, 2.5);
  return true;
}
// Rubber: soak the hit with pips before HP.
function trioAbsorb(dmg, ent) {
  if (!trioOn()) return dmg;
  const T = trioState(), rub = trioPts(0), p = me();
  if (rub < 1) { T.hitT = G.t; return dmg; }
  T.hitT = G.t;
  if (rub >= 3 && G.t - T.freeT >= TRIO.freeCd) {
    T.freeT = G.t; p.iframes = Math.max(p.iframes, 0.4);
    floatText(p.x, p.y - 24, 'SHRUGGED', TRIO.col[0], 13); trioRubberFx();
    return 0;
  }
  const per = G.P.maxHp * TRIO.soak * (1 + (G.P.armour || 0) * 0.03), cap = rub * per, take = Math.min(dmg, cap);
  T.juice = Math.max(0, T.juice - take / per);
  trioRubberFx();
  if (rub >= 5) {
    const R = 170;
    for (const b of G.ebul) if (Math.hypot(b.x - p.x, b.y - p.y) < R) { b.dead = true; spawnPart(b.x, b.y, TRIO.col[0], 1, 50, 0.25); }
    forNear(p.x, p.y, R, e => { if (!e.charmed && !e.egg) damageEnemy(e, 10 + G.P.maxHp * 0.08, { elem: 'phys', wname: 'Rubber Spines', noProc: true }); });
    fxParts('spark', p.x, p.y, TRIO.col[0], 18, 260, 0.45, 2.5);
  }
  dmg -= take;
  if (dmg <= 0) { p.iframes = Math.max(p.iframes, 0.35); return 0; }
  return dmg;
}
function trioRubberFx() { const p = G.player; G.armFlash = { t: G.realT, k: 1, a: null }; fxParts('spark', p.x, p.y, TRIO.col[0], 6, 90, 0.3, 2); }
function trioKill(e) {
  if (!trioOn()) return;
  const T = trioState();
  T.juice = Math.min(TRIO.max, T.juice + (e.boss ? 3 : e.elite ? 1 : 0.12));
}

// ---- The triangle (screen space). Corner 0 Rubber at the top, 1 Wiggle bottom left, 2 Spunk bottom right.
function trioGeom() {
  const s = TRIO.side, h = s * 0.866, land = document.body.classList.contains('land');
  const bot = document.getElementById('bottom'), top = bot && !land ? bot.getBoundingClientRect().top : H;
  const side = document.getElementById('side'), sr = side && side.getBoundingClientRect(), right = sr && sr.width && !land ? sr.left - 14 : W - 18; // (left of the Charge / Rewind column)
  const cx = right - s / 2, by = Math.min(H - 44, top - 40);
  return { v: [[cx, by - h], [cx - s / 2, by], [cx + s / 2, by]], cx, cy: by - h / 3, s, h };
}
function trioXY(w, g) { return [0, 1].map(k => w[0] * g.v[0][k] + w[1] * g.v[1][k] + w[2] * g.v[2][k]); }
function trioBary(x, y, g) {
  const [a, b, c] = g.v, d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
  let l0 = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / d, l1 = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / d, l2 = 1 - l0 - l1;
  l0 = Math.max(0, l0); l1 = Math.max(0, l1); l2 = Math.max(0, l2);
  const t = l0 + l1 + l2 || 1;
  return [l0 / t, l1 / t, l2 / t];
}
const TRIO_SNAPS = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0.5, 0.5, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [1 / 3, 1 / 3, 1 / 3]];
function trioSnap(g) {
  const T = G.trio, [x, y] = trioXY(T.w, g);
  for (const s of TRIO_SNAPS) { const [sx2, sy2] = trioXY(s, g); if (Math.hypot(sx2 - x, sy2 - y) < TRIO.snap) { T.w = s.slice(); return; } }
}
const TRIO_PTR = { id: null };
function trioHit(x, y) {
  const g = trioGeom(), w = trioBary(x, y, g), [px, py] = trioXY(w, g);
  return Math.hypot(px - x, py - y) < 26 ? g : null; // (inside the triangle, or within 26 px of it)
}
cv.addEventListener('pointerdown', ev => {
  if (!trioOn() || G.state !== 'play') return;
  const g = trioHit(ev.clientX, ev.clientY);
  if (!g) return;
  ev.stopImmediatePropagation(); ev.preventDefault();
  TRIO_PTR.id = ev.pointerId; trioState().w = trioBary(ev.clientX, ev.clientY, g); vibrate(10);
  try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* ignore */ }
}, { capture: true });
cv.addEventListener('pointermove', ev => {
  if (ev.pointerId !== TRIO_PTR.id || !G || !G.trio) return;
  ev.stopImmediatePropagation();
  G.trio.w = trioBary(ev.clientX, ev.clientY, trioGeom());
}, { capture: true });
const trioUp = ev => {
  if (ev.pointerId !== TRIO_PTR.id) return;
  ev.stopImmediatePropagation(); TRIO_PTR.id = null;
  if (G && G.trio) trioSnap(trioGeom());
};
cv.addEventListener('pointerup', trioUp, { capture: true });
cv.addEventListener('pointercancel', trioUp, { capture: true });
function trioKeys() {
  const k = INPUT.keys, T = G.trio;
  if (k['1']) T.w = [1, 0, 0]; else if (k['2']) T.w = [0, 1, 0]; else if (k['3']) T.w = [0, 0, 1]; else if (k['4']) T.w = [1 / 3, 1 / 3, 1 / 3];
}

function trioDraw() {
  if (!trioOn() || !G.trio || G.state === 'over') return;
  const T = G.trio, g = trioGeom(), a = trioAlloc(), [A, B, C] = g.v, a0 = ctx.globalAlpha;
  ctx.save();
  // Body: a faint fill tinted towards the heavy corner, and the edges.
  ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.lineTo(C[0], C[1]); ctx.closePath();
  ctx.fillStyle = 'rgba(6,11,16,0.55)'; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(220,235,245,0.35)'; ctx.stroke();
  // Each corner: its colour, its pips and its tier.
  ctx.font = `700 9px ${getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace'}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) {
    const [vx, vy] = g.v[i], col = TRIO.col[i], t = trioTier(a[i]), f = T.flash[i];
    ctx.globalAlpha = a0 * (0.25 + 0.2 * t + f * 0.5);
    ctx.beginPath(); ctx.arc(vx, vy, 9 + t * 2 + f * 6, 0, TAU); ctx.fillStyle = col; ctx.fill();
    ctx.globalAlpha = a0 * (a[i] ? 1 : 0.4); ctx.fillStyle = col;
    const ly = i === 0 ? vy - 20 : vy + 18, lx = i === 1 ? vx + 6 : i === 2 ? vx - 6 : vx;
    ctx.fillText(`${TRIO.name[i]} ${a[i]}${t ? ' ' + ['', 'I', 'II', 'III'][t] : ''}`, lx, ly);
  }
  // Pool pips along the bottom edge.
  const n = Math.floor(T.juice + 1e-6), frac = T.juice - n;
  for (let k = 0; k < TRIO.max; k++) {
    const x = B[0] + (k + 0.5) * g.s / TRIO.max, y = B[1] + 32;
    ctx.globalAlpha = a0 * (k < n ? 0.95 : k === n ? 0.2 + 0.5 * frac : 0.15); ctx.fillStyle = k < n ? '#e8f4ff' : '#7f8c99';
    ctx.beginPath(); ctx.arc(x, y, 3.2, 0, TAU); ctx.fill();
  }
  // The puck.
  const [px, py] = trioXY(T.w, g);
  ctx.globalAlpha = a0; ctx.beginPath(); ctx.arc(px, py, TRIO_PTR.id != null ? 11 : 9, 0, TAU);
  ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.stroke();
  ctx.restore(); ctx.globalAlpha = a0;
}
