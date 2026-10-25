'use strict';
// Spawn Prawn - tier 3 boss signature beats (ENEMY_HANDOFF C3; COMBAT_MATRIX 13.4: every beat shows its area before it lands).
// Each boss loses its generic spray slots (aimedFan, spiral, ring) and gets one beat built from its own mechanic. No boss HP, damage or rate number changes:
// every hit below is the boss's own bd (the same base as its bullets) through the V10_DIFF damage knob, like hazards.
//   Flush   (The Fever, pattern 'flush')      Three expanding heat waves 0.8 s apart, each with one safe gap of 50 degrees; the gap steps 30 degrees a wave.
//                                             The gaps are marked for 0.7 s first (the first one points at you). Answer: stay in the gap.
//   Flex    (Chad Prime, after 'dash3' dashes) A shockwave (radius 2.5 x his r) 0.3 s after each dash lands; the landing spot is marked from the
//                                             wind-up on. Answer: keep clear of where he lands, not just his path.
//   Y-volley (Antibody Colossus, 'yvolley')    Three lanes 120 degrees apart (the Y) sweep 40 degrees over 1.2 s after a 0.9 s mark; two volleys a pattern.
//                                             Answer: stand between the arms.
// State lives on the boss (e.sg3), nothing is saved. Wraps bossAI (game.js, over bosstells10.js) and nf10Draw (newfoes.js). Save data: none.

const SG3 = {
  flushTell: 0.7, flushGap: 50 * Math.PI / 180, flushStep: 30 * Math.PI / 180, flushWaves: 3, flushEvery: 0.8, flushSpeed: 420, flushBand: 24,
  flexDelay: 0.3, flexK: 2.5,
  yTell: 0.9, ySweep: 1.2, yArc: 40 * Math.PI / 180, yBack: 0.4, yLane: 24, yLen: 900, yOff: 40 * Math.PI / 180,
};

// Pattern lists: every generic slot becomes the beat (data.js BOSSES and roster.js ROSTER_BOSSES, edited in place so shared references follow).
const SG3_PATS = {
  fever: ['firering', 'flush', 'firering', 'flush'],
  alpha: ['dash3', 'tailwhip', 'dash3', 'tailwhip'],
  colossus: ['yvolley', 'charge', 'yvolley', 'charge'],
};
for (const id in SG3_PATS) {
  for (const list of [BOSSES, typeof ROSTER_BOSSES !== 'undefined' ? ROSTER_BOSSES : []]) {
    const B = list.find(b => b.id === id);
    if (!B) continue;
    const arr = B.patterns;
    arr.length = 0; SG3_PATS[id].forEach(p => arr.push(p)); // (in place: a def copied from either table shares the array)
  }
  const B = BOSSES.find(b => b.id === id);
  if (B && !(B.strengths || []).includes('TODO_COPY:boss_' + id + '_sig')) (B.strengths = B.strengths || []).push('TODO_COPY:boss_' + id + '_sig');
}

const sg3St = e => e.sg3 || (e.sg3 = { last: 99, pat: null });
const sg3Dmg = e => e.def.dmg * 0.35 * dmgNow() * (e.campK || 1) * V10_DIFF.dmg * 0.8;
const sg3Ang = (a, b) => Math.abs(angDiff(a, b));

// ---------------------------------------------------------------- Flush (Fever): the gap of wave n (n = 0, 1, 2), given the locked first gap
function sg3FlushGap(s, n) { return s.g0 + n * SG3.flushStep; }
// Where wave n's front is, in px from the boss, t seconds into the volley.
function sg3FlushR(e, n, t) { return e.r + (t - n * SG3.flushEvery) * SG3.flushSpeed; }

function sg3Flush(e, dt, s, aim) {
  if (e.patT < 0.6 || e.frozen > 0) { if (e.frozen > 0) s.fl = null; return; }
  const k = e.raged ? 1.5 : 1;
  if (!s.fl) { s.fl = { t: -SG3.flushTell, hit: [false, false, false], done: false }; s.g0 = aim; }
  const f = s.fl;
  if (f.done) return;
  f.t += dt * k;
  if (f.t < 0) { if (f.t < -0.12) s.g0 = aim; return; } // (the first gap follows you until the last 0.12 s of the mark)
  const p = G.player, d = Math.hypot(p.x - e.x, p.y - e.y), pa = Math.atan2(p.y - e.y, p.x - e.x);
  for (let n = 0; n < SG3.flushWaves; n++) {
    if (f.hit[n] || f.t < n * SG3.flushEvery) continue;
    const R = sg3FlushR(e, n, f.t);
    if (Math.abs(d - R) <= SG3.flushBand + p.r * 0.5) {
      f.hit[n] = true;
      if (sg3Ang(pa, sg3FlushGap(s, n)) > SG3.flushGap / 2) hurtPlayer(sg3Dmg(e), e.name + ' heat wave', e);
    } else if (R > d + SG3.flushBand) f.hit[n] = true; // (it has passed you)
  }
  if (f.t > (SG3.flushWaves - 1) * SG3.flushEvery + 1.4) f.done = true;
}

// ---------------------------------------------------------------- Flex (Chad): the shockwave after a dash lands
function sg3Flex(e, pre, s) {
  if (s.flex) return;
  if (pre.pat === e.pat && pre.st === 2 && e.st !== 2 && e.def.patterns[e.pat] === 'dash3') s.flex = { x: e.x, y: e.y, t: SG3.flexDelay, R: e.r * SG3.flexK };
}
function sg3FlexTick(e, dt, s) {
  const f = s.flex;
  if (!f) return;
  f.t -= dt;
  if (f.t > 0) return;
  const p = G.player;
  ring(f.x, f.y, f.R, '#e8d5b0', 0.35, 5);
  if (Math.hypot(p.x - f.x, p.y - f.y) < f.R + p.r * 0.5) hurtPlayer(sg3Dmg(e), e.name + ' flex', e);
  s.flex = null;
}
// Where the next dash will land (from the wind-up, while he is still lining up).
function sg3FlexSpot(e) {
  if (e.def.patterns[e.pat] !== 'dash3' || e.winded > G.t || e.dashX == null || !(e.st === 1 || e.st === 2)) return null;
  const left = e.st === 1 ? 0.36 : Math.max(0, e.stT); // (the dash lasts 0.36 s)
  return { x: e.x + e.dashX * e.speed * 7 * left, y: e.y + e.dashY * e.speed * 7 * left };
}

// ---------------------------------------------------------------- Y-volley (Colossus): the lane angles at time t into a sweep (0..1)
function sg3YAng(s, k, u) { return s.a0 + k * TAU / 3 + u * SG3.yArc; }

function sg3Y(e, dt, s, aim) {
  e.mvs = 0;
  if (e.patT < 0.6) return;
  if (s.y == null) { s.y = 0; s.yT = 0; s.a0 = aim + SG3.yOff; s.laneHit = [false, false, false]; s.vol = 0; }
  s.yT += dt;
  if (s.y === 0) { if (s.yT >= SG3.yTell) { s.y = 1; s.yT = 0; sfx('zap'); } return; }
  if (s.y === 1) {
    const u = clamp(s.yT / SG3.ySweep, 0, 1), p = G.player, px = p.x - e.x, py = p.y - e.y;
    for (let k = 0; k < 3; k++) {
      if (s.laneHit[k]) continue;
      const a = sg3YAng(s, k, u), cx = Math.cos(a), cy = Math.sin(a), along = px * cx + py * cy, perp = Math.abs(px * cy - py * cx);
      if (along > 0 && along < SG3.yLen && perp < SG3.yLane + p.r * 0.5) { s.laneHit[k] = true; hurtPlayer(sg3Dmg(e), e.name + ' Y-volley', e); }
    }
    if (s.yT >= SG3.ySweep) { s.y = 2; s.yT = 0; }
    return;
  }
  if (s.yT >= SG3.yBack) { s.vol++; s.y = 0; s.yT = 0; s.a0 = aim + SG3.yOff; s.laneHit = [false, false, false]; } // (the next volley re-aims)
}

// ---------------------------------------------------------------- the wrap
const sg3AI0 = bossAI;
bossAI = function (e, dt, dist, ux, uy) {
  const id = e.def.id;
  if (id !== 'fever' && id !== 'alpha' && id !== 'colossus') return sg3AI0(e, dt, dist, ux, uy);
  const s = sg3St(e), pre = { pat: e.pat, st: e.st };
  sg3AI0(e, dt, dist, ux, uy);
  if (e.dead) return;
  if (e.patT < s.last) { s.fl = null; s.y = null; s.flex = null; } // (a new pattern run)
  s.last = e.patT;
  const pat = e.def.patterns[e.pat], p = G.player, aim = Math.atan2(p.y - e.y, p.x - e.x);
  if (id === 'fever') { if (pat === 'flush') sg3Flush(e, dt, s, aim); else s.fl = null; }
  else if (id === 'alpha') { sg3Flex(e, pre, s); sg3FlexTick(e, dt, s); }
  else if (pat === 'yvolley') sg3Y(e, dt, s, aim);
  else s.y = null;
};

// ---------------------------------------------------------------- drawing (soft edges, no hard outlines: STYLE.md)
function sg3Wedge(x, y, a, half, L, rgb, al) { // a soft wedge fading with distance
  const g = ctx.createRadialGradient(x, y, 0, x, y, L);
  g.addColorStop(0, `rgba(${rgb},${al.toFixed(3)})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, L, a - half, a + half); ctx.closePath(); ctx.fill();
}
function sg3Lane(x, y, a, L, w, rgb, al) { // a soft lane, widest at the boss
  const g = ctx.createLinearGradient(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L), c = Math.cos(a), sn = Math.sin(a);
  g.addColorStop(0, `rgba(${rgb},${al.toFixed(3)})`); g.addColorStop(1, `rgba(${rgb},${(al * 0.25).toFixed(3)})`);
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(x - sn * w, y + c * w); ctx.lineTo(x + c * L - sn * w, y + sn * L + c * w); ctx.lineTo(x + c * L + sn * w, y + sn * L - c * w); ctx.lineTo(x + sn * w, y - c * w); ctx.closePath(); ctx.fill();
}
const sg3Draw0 = nf10Draw;
nf10Draw = function () {
  sg3Draw0();
  if (!G) return;
  for (const e of G.enemies) {
    if (!e.boss || e.dead || !e.sg3) continue;
    const s = e.sg3, id = e.def.id, pat = e.def.patterns[e.pat], x = sx(e.x), y = sy(e.y);
    ctx.save();
    if (id === 'fever' && pat === 'flush' && s.fl && !s.fl.done) {
      const f = s.fl, L = 760 * S, tell = f.t < 0, kk = tell ? 1 + f.t / SG3.flushTell : 1; // (kk: 0 to 1 through the mark)
      for (let n = 0; n < SG3.flushWaves; n++) { // the safe gaps, the next one brightest
        const next = tell ? n === 0 : f.t < n * SG3.flushEvery + 0.1 && (n === 0 || f.t >= (n - 1) * SG3.flushEvery);
        if (!tell && f.t > n * SG3.flushEvery + 0.9) continue;
        sg3Wedge(x, y, sg3FlushGap(s, n), SG3.flushGap / 2, L, '255,240,190', (next ? 0.12 + 0.2 * kk : 0.07) * (tell ? kk : 1));
      }
      if (!tell) for (let n = 0; n < SG3.flushWaves; n++) { // the waves: heat everywhere but the gap
        const R = sg3FlushR(e, n, f.t) * S;
        if (f.t < n * SG3.flushEvery || R > L * 1.1) continue;
        const gp = sg3FlushGap(s, n), h = SG3.flushGap / 2;
        for (const [w, al] of [[SG3.flushBand * 2.4 * S, 0.12], [SG3.flushBand * 1.1 * S, 0.3]]) {
          ctx.strokeStyle = `rgba(255,107,53,${al})`; ctx.lineWidth = w; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(x, y, R, gp + h, gp - h + TAU); ctx.stroke();
        }
      }
    }
    if (id === 'alpha') {
      const spot = sg3FlexSpot(e), f = s.flex;
      if (spot || f) { // the shockwave's reach, filling as it nears
        const c = f || spot, R = (f ? f.R : e.r * SG3.flexK) * S, k = f ? 1 - f.t / SG3.flexDelay : 0.25, cx = sx(c.x), cy = sy(c.y);
        const g = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.1);
        g.addColorStop(0, `rgba(255,200,120,${(0.06 + 0.2 * k).toFixed(3)})`); g.addColorStop(0.8, `rgba(255,200,120,${(0.08 + 0.3 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.1, 0, TAU); ctx.fill();
      }
    }
    if (id === 'colossus' && pat === 'yvolley' && s.y != null && e.patT >= 0.6) {
      const L = SG3.yLen * S, w = SG3.yLane * S;
      if (s.y === 0) { const k = clamp(s.yT / SG3.yTell, 0, 1); // the start of each lane strong, the end of its sweep faint
        for (let kl = 0; kl < 3; kl++) { sg3Lane(x, y, sg3YAng(s, kl, 0), L, w * (0.5 + 0.5 * k), '255,210,63', 0.06 + 0.2 * k); sg3Lane(x, y, sg3YAng(s, kl, 1), L, w * 0.5, '255,210,63', 0.05 * k); } }
      else if (s.y === 1) { const u = clamp(s.yT / SG3.ySweep, 0, 1); for (let kl = 0; kl < 3; kl++) sg3Lane(x, y, sg3YAng(s, kl, u), L, w, '255,170,40', s.laneHit[kl] ? 0.12 : 0.36); }
    }
    ctx.restore();
  }
};
