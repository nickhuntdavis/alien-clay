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

// ---- The triangle (screen space), a cell lying on its side: the left edge is upright with Wiggle at the top and
// Rubber at the bottom, Spunk points right. Corner indices stay 0 Rubber, 1 Wiggle, 2 Spunk.
function trioGeom() {
  const s = TRIO.side, w = s * 0.866, land = document.body.classList.contains('land');
  const bot = document.getElementById('bottom'), top = bot && !land ? bot.getBoundingClientRect().top : H;
  const side = document.getElementById('side'), sr = side && side.getBoundingClientRect(), right = sr && sr.width && !land ? sr.left - 14 : W - 18; // (left of the Charge / Rewind column)
  const lx = document.body.classList.contains('immersive') && !land ? 26 : right - w, by = Math.min(H - 48, top - 44);
  return { v: [[lx, by], [lx, by - s], [lx + w, by - s / 2]], cx: lx + w / 3, cy: by - s / 2, s, w };
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

const trioRGB = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function trioDraw() {
  if (!trioOn() || !G.trio || G.state === 'over') return;
  const T = G.trio, g = trioGeom(), a = trioAlloc(), a0 = ctx.globalAlpha, raw = RAW_COL, br = 1 + 0.04 * Math.sin(G.realT * 1.7);
  RAW_COL = true; // (the HUD keeps its true colours on a grey slide)
  ctx.save();
  const body = () => { ctx.beginPath(); roundPts(g.v, 16); ctx.closePath(); };
  // Cytoplasm: dark and see-through, lit from each corner by how much it holds.
  body(); ctx.fillStyle = 'rgba(6,12,18,0.5)'; ctx.fill();
  ctx.save(); body(); ctx.clip();
  for (let i = 0; i < 3; i++) {
    const [vx, vy] = g.v[i], [r, gg, bb] = trioRGB(TRIO.col[i]), k = 0.08 + 0.09 * trioTier(a[i]) + 0.25 * T.flash[i];
    const gr = ctx.createRadialGradient(vx, vy, 0, vx, vy, g.s * 0.95 * br);
    gr.addColorStop(0, `rgba(${r},${gg},${bb},${k})`); gr.addColorStop(1, `rgba(${r},${gg},${bb},0)`);
    ctx.fillStyle = gr; ctx.fillRect(g.v[0][0] - 20, g.v[1][1] - 20, g.w + 40, g.s + 40);
  }
  ctx.restore();
  // Membrane: a soft thick halo with a thin bright rim.
  body(); ctx.lineJoin = 'round';
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(220,240,255,0.07)'; ctx.stroke();
  ctx.lineWidth = 1.2; ctx.strokeStyle = `rgba(230,245,255,${0.38 + 0.06 * Math.sin(G.realT * 1.7)})`; ctx.stroke();
  // Corners: a glowing organelle each, bigger and brighter with its tier, and its label.
  ctx.font = `700 9px ${getComputedStyle(document.body).getPropertyValue('--mono') || 'monospace'}`; ctx.textBaseline = 'middle';
  const ccx = (g.v[0][0] + g.v[1][0] + g.v[2][0]) / 3, ccy = (g.v[0][1] + g.v[1][1] + g.v[2][1]) / 3;
  for (let i = 0; i < 3; i++) {
    const vx = g.v[i][0] + (ccx - g.v[i][0]) * 0.26, vy = g.v[i][1] + (ccy - g.v[i][1]) * 0.26, [r, gg, bb] = trioRGB(TRIO.col[i]), t = trioTier(a[i]), f = T.flash[i];
    const R = (10 + t * 4 + f * 8) * br, gr = ctx.createRadialGradient(vx, vy, 0, vx, vy, R);
    gr.addColorStop(0, `rgba(${r},${gg},${bb},${0.5 + 0.15 * t})`); gr.addColorStop(0.35, `rgba(${r},${gg},${bb},${0.18 + 0.08 * t})`); gr.addColorStop(1, `rgba(${r},${gg},${bb},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(vx, vy, R, 0, TAU); ctx.fill();
    ctx.globalAlpha = a0 * (a[i] ? 0.95 : 0.35); ctx.fillStyle = TRIO.col[i];
    ctx.beginPath(); ctx.arc(vx, vy, 2 + t * 0.8, 0, TAU); ctx.fill();
    const lbl = `${TRIO.name[i]} ${a[i]}${t ? ' ' + ['', 'I', 'II', 'III'][t] : ''}`;
    if (i === 2) { ctx.textAlign = 'right'; ctx.fillText(lbl, g.v[2][0] + 6, g.v[2][1] + 26); }
    else { ctx.textAlign = 'left'; ctx.fillText(lbl, g.v[i][0] - 2, i === 1 ? g.v[1][1] - 11 : g.v[0][1] + 13); }
    ctx.globalAlpha = a0;
  }
  // Pips: one per point of Juice, in the colour of the corner it is going to (Rubber, Wiggle, Spunk in turn).
  const n = Math.floor(T.juice + 1e-6), frac = T.juice - n, owner = [];
  for (let i = 0; i < 3; i++) for (let k = 0; k < a[i]; k++) owner.push(i);
  const step = Math.min(11, (g.w + 30) / TRIO.max), py = g.v[0][1] + 30;
  for (let k = 0; k < TRIO.max; k++) {
    const x = g.v[0][0] + 3 + k * step;
    if (k < n) {
      const c = TRIO.col[owner[k] != null ? owner[k] : 0], [r, gg, bb] = trioRGB(c), gr = ctx.createRadialGradient(x, py, 0, x, py, 7);
      gr.addColorStop(0, `rgba(${r},${gg},${bb},0.45)`); gr.addColorStop(1, `rgba(${r},${gg},${bb},0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, py, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, py, 3, 0, TAU); ctx.fill();
    } else {
      ctx.globalAlpha = a0 * (k === n ? 0.15 + 0.45 * frac : 0.15); ctx.fillStyle = '#cfd8e0';
      ctx.beginPath(); ctx.arc(x, py, k === n ? 1.5 + 1.5 * frac : 2, 0, TAU); ctx.fill(); ctx.globalAlpha = a0;
    }
  }
  // The puck: a nucleus, tinted by the mix it sets.
  const [px, py2] = trioXY(T.w, g), mix = [0, 1, 2].map(c => Math.round(T.w[0] * trioRGB(TRIO.col[0])[c] + T.w[1] * trioRGB(TRIO.col[1])[c] + T.w[2] * trioRGB(TRIO.col[2])[c]));
  const pr = TRIO_PTR.id != null ? 12 : 10, ng = ctx.createRadialGradient(px - pr * 0.3, py2 - pr * 0.35, 0, px, py2, pr * 2.2);
  ng.addColorStop(0, 'rgba(255,255,255,0.95)'); ng.addColorStop(0.4, `rgba(${mix},0.85)`); ng.addColorStop(0.55, `rgba(${mix},0.25)`); ng.addColorStop(1, `rgba(${mix},0)`);
  ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(px, py2, pr * 2.2, 0, TAU); ctx.fill();
  ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(px, py2, pr * 0.95, 0, TAU); ctx.stroke();
  ctx.restore(); ctx.globalAlpha = a0; RAW_COL = raw;
}
