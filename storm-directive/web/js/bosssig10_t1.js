'use strict';
// Spawn Prawn - tier 1 boss signature beats (enemy handoff C3). Each tier 1 boss swaps one generic spray slot for a second beat built from
// its own mechanic and keeps ONE short spray (aimedFan, else ring) as the breather. Every beat shows its area first (COMBAT_MATRIX 13.4),
// has two answers, and uses only numbers the boss already had (bd x 0.7 is the glob the Plug already throws, bd x 0.4 the Sneeze's spray).
//   Titration  (Litmus Strip, 'titration')  A soft line in its current colour shows for 1 s, then advances 3 s, dropping a row of marked
//                                           drips every 0.75 s (a hazard pool each, 0.6 s warning, gaps between). Cross between drips, or go round the ends.
//   Unroll     (The Johnny, 'unroll')       0.8 s tell line from it to a point past you, then a latex band there for 2 s that blocks movement.
//                                           Its open back is exposed while stretched (bpExposed). Go round the band.
//   Drip       (Mucus Plug, 'drip')         3 drops (4 once enraged) fall where you stand: a disc marks the spot 0.6 s, then the drop hits
//                                           once and leaves a Mucus patch (fight.js fightPatch). Keep moving.
//   Contraction(The Cramp, 'contract')      A marked ring (0.8 s) then closes in over 2 s; inside the edge you are pulled in, and hurt once
//                                           if you are still inside the final ring when it shuts. Swim outward.
//   Sniffle    (The Sneeze, 'sniffle')      0.8 s cloud tell, then 10 slow droplets drift out; each lands as a small Mucus patch. Step round the cloud.
// State lives on the boss (e.sg1). Each beat ends the pattern early when it is done. Hooks: wraps bossAI (game.js, through bosstells10.js) and
// nf10Draw (newfoes.js). Save data: none. Player-facing text: none here (the intro line is a TODO_COPY placeholder).

const SG1 = {
  titTell: 1.0, titSpeed: 150, titRows: 4, titGap: 0.75, titSp: 120, titHalf: 420, titR: 26, titLead: 70, titWarn: 0.6,
  unTell: 0.8, unLock: 0.5, unHold: 2.0, unAfter: 0.5, unPad: 8,
  dripMark: 0.6, dripGap: 0.95, dripR: 50, dripFirst: 0.1,
  conTell: 0.8, conClose: 2.0, conR0: 440, conEnd: 150, conAfter: 0.4,
  snTell: 0.8, snN: 10, snLife: 3.0, snSpread: 1.0, snPatch: 28, snAfter: 0.3, snLock: 0.5
};
const SG1_BOSS = { // boss id -> the generic slot it gives up and its new pattern id
  litmus: { slot: 'ring', pat: 'titration' }, johnny: { slot: 'spiral', pat: 'unroll' }, mucus: { slot: 'ring', pat: 'drip' },
  cramp: { slot: 'spiral', pat: 'contract' }, sneeze: { slot: 'spiral', pat: 'sniffle' }
};
for (const id in SG1_BOSS) {
  const B = SG1_BOSS[id];
  for (const tbl of [BOSSES, typeof ROSTER_BOSSES !== 'undefined' ? ROSTER_BOSSES : []]) {
    const d = tbl.find(b => b.id === id); if (!d) continue;
    const i = d.patterns.indexOf(B.slot); if (i >= 0) d.patterns[i] = B.pat;
    d.strengths = (d.strengths || []).slice(0, 2).concat('TODO_COPY:boss_' + id + '_sig'); // (one intro line per boss; the brief is in the changelog fragment)
  }
}

const sg1St = e => e.sg1 || (e.sg1 = { last: 99, t: 0, marks: [], drops: [] });
const sg1Bd = e => e.def.dmg * 0.35 * dmgNow() * (e.campK || 1);
const sg1Rgba = (hex, a) => { if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return 'rgba(255,255,255,' + a + ')'; const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; };

// The band stops the player crossing it; round either end is free. s.side remembers which side they are on.
function sg1Block(s, e, a, L, p) {
  const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx, u = (p.x - e.x) * dx + (p.y - e.y) * dy;
  if (u < 0 || u > L) return;
  const sd = (p.x - e.x) * nx + (p.y - e.y) * ny, need = p.r + SG1.unPad;
  if (Math.abs(sd) >= need) { s.side = sd >= 0 ? 1 : -1; return; }
  if (s.side == null) s.side = sd >= 0 ? 1 : -1;
  p.x = e.x + dx * u + nx * s.side * need; p.y = e.y + dy * u + ny * s.side * need;
}

// Drip landings and sniffle droplets run whether or not the pattern is still on (they outlast it by a moment).
function sg1Tick(e, s) {
  const p = me();
  for (let i = s.marks.length - 1; i >= 0; i--) {
    const m = s.marks[i]; if (G.t < m.land) continue;
    s.marks.splice(i, 1);
    if (Math.hypot(p.x - m.x, p.y - m.y) < SG1.dripR + p.r * 0.5) hurtPlayer(sg1Bd(e) * 0.7 * V10_DIFF.dmg, e.name + ' glob', e);
    if (G.zones.length < 150) G.zones.push(fightPatch(m.x, m.y, 'mucusdrip'));
    ring(m.x, m.y, SG1.dripR, e.color, 0.4, 4); spawnPart(m.x, m.y, e.color, 8, 120, 0.4);
  }
  for (let i = s.drops.length - 1; i >= 0; i--) {
    const d = s.drops[i], b = d.b;
    if (G.ebul.indexOf(b) >= 0 && b.life > 0.05) { d.x = b.x; d.y = b.y; continue; }
    s.drops.splice(i, 1);
    if (G.zones.length < 150) { const z = fightPatch(d.x, d.y, 'sniffle'); z.r = SG1.snPatch; G.zones.push(z); }
  }
}

const sg1AI0 = bossAI;
bossAI = function (e, dt, dist, ux, uy) {
  sg1AI0(e, dt, dist, ux, uy);
  const B = SG1_BOSS[e.def.id];
  if (!B || e.dead || !G || !G.player) return;
  const s = sg1St(e), p = me(), mine = e.def.patterns[e.pat] === B.pat;
  const dte = e.patT >= s.last ? e.patT - s.last : e.patT; // (the boss's own clock: bossUpkeep slows it, and the beat slows with it)
  if (e.patT < s.last) { s.t = 0; s.init = s.done = s.over = s.band = s.hit = false; s.k = 0; s.L = s.side = s.R = null; }
  s.last = e.patT;
  sg1Tick(e, s);
  s.on = mine && e.patT >= 0.6 && !s.done;
  if (!s.on || e.winded > G.t) return;
  s.t += dte;
  const t = s.t, bd = sg1Bd(e), aim = Math.atan2(p.y - e.y, p.x - e.x), T = SG1;
  switch (B.pat) {
    case 'titration': {
      if (!s.init) { s.init = true; s.col = (ELEMENTS[e.lit] || ELEMENTS.fire).color; }
      if (t < T.titTell * 0.7) { s.a = aim; s.cx = e.x; s.cy = e.y; } // (the line follows you, then locks)
      const nx = -Math.sin(s.a), ny = Math.cos(s.a);
      while (s.k < T.titRows && t >= T.titTell + s.k * T.titGap) {
        const pos = T.titLead + T.titSpeed * s.k * T.titGap;
        for (let o = -T.titHalf + (s.k % 2 ? T.titSp / 2 : 0); o <= T.titHalf; o += T.titSp) addHazard(s.cx + Math.cos(s.a) * pos + nx * o, s.cy + Math.sin(s.a) * pos + ny * o, T.titR, 3.5, bd * 0.7, s.col, e.name + ' drip', T.titWarn);
        s.k++;
      }
      s.over = t >= T.titTell + T.titRows * T.titGap;
      break;
    }
    case 'unroll': {
      if (!s.init) { s.init = true; s.a = e.face || 0; }
      if (t < T.unLock) { s.a = e.face || 0; s.L = null; }
      else if (s.L == null) s.L = clamp(dist + 260, 420, 900);
      if (t >= T.unTell && !s.band && !s.over) { s.band = true; e.face = s.a; e.bpExposed = G.t + T.unHold; sfx('zap'); }
      if (s.band) {
        sg1Block(s, e, s.a, s.L, p);
        if (t >= T.unTell + T.unHold) { s.band = false; s.over = true; }
      }
      if (t >= T.unTell + T.unHold + T.unAfter) { s.done = true; e.patT = 5.51; }
      break;
    }
    case 'drip': {
      const n = 3 + ((e.bphase || 0) >= 1 ? 1 : 0);
      while (s.k < n && t >= T.dripFirst + s.k * T.dripGap) { s.marks.push({ x: p.x, y: p.y, t0: G.t, land: G.t + T.dripMark }); s.k++; }
      if (s.k >= n && !s.marks.length) { s.done = true; e.patT = 5.51; }
      break;
    }
    case 'contract': {
      if (dist < 380) e.mvs *= 0.3; // (far off, the usual fast close-in stands)
      const k = clamp((t - T.conTell) / T.conClose, 0, 1), Rend = e.r + T.conEnd;
      s.R = T.conR0 + (Rend - T.conR0) * k;
      if (k > 0 && k < 1) {
        const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
        if (d < s.R && d > Rend) { const q = BP.pull * dte; p.x += dx / d * q; p.y += dy / d * q; }
      }
      if (k >= 1 && !s.hit) {
        s.hit = true;
        if (Math.hypot(p.x - e.x, p.y - e.y) < Rend + p.r) hurtPlayer(bd * 0.7 * V10_DIFF.dmg, e.name + ' contraction', e);
        ring(e.x, e.y, Rend, e.color, 0.5, 6); cam.shake = Math.max(cam.shake, 8); sfx('boom');
      }
      if (t >= T.conTell + T.conClose + T.conAfter) { s.done = true; e.patT = 5.51; }
      break;
    }
    case 'sniffle': {
      if (t < T.snLock) s.a = aim;
      if (t >= T.snTell && !s.k) {
        s.k = 1;
        bpShoot(e, () => {
          for (let i = 0; i < T.snN; i++) {
            const n0 = G.ebul.length;
            eBullet(e.x, e.y, s.a + (i / (T.snN - 1) - 0.5) * T.snSpread + rand(-0.04, 0.04), rand(95, 135), bd * 0.4, rand(4, 6));
            if (G.ebul.length > n0) { const b = G.ebul[G.ebul.length - 1]; b.life = T.snLife; s.drops.push({ b, x: b.x, y: b.y }); }
          }
        });
        sfx('zap');
      }
      if (t >= T.snTell + T.snLife + T.snAfter) { s.done = true; e.patT = 5.51; }
      break;
    }
  }
};

// ---------------------------------------------------------------- drawing (soft edges, no hard outlines: STYLE.md)
function sg1Soft(x0, y0, x1, y1, w, rgb, a) { // a line with a soft edge: three passes, widest faintest
  ctx.lineCap = 'round';
  for (const [k, f] of [[1, 0.35], [0.55, 0.55], [0.2, 1]]) { ctx.strokeStyle = sg1Rgba(rgb, (a * f).toFixed(3)); ctx.lineWidth = Math.max(1, w * k); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
}
function sg1Disc(x, y, R, rgb, a) {
  const g = ctx.createRadialGradient(x, y, R * 0.2, x, y, R);
  g.addColorStop(0, sg1Rgba(rgb, a.toFixed(3))); g.addColorStop(1, sg1Rgba(rgb, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fill();
}
const sg1Draw0 = nf10Draw;
nf10Draw = function () {
  sg1Draw0();
  if (!G) return;
  const T = SG1;
  for (const e of G.enemies) {
    if (!e.boss || e.dead || !e.sg1) continue;
    const s = e.sg1, t = s.t, id = e.def.id;
    ctx.save();
    for (const m of s.marks) sg1Disc(sx(m.x), sy(m.y), T.dripR * S, '#d9f0a3', 0.1 + 0.35 * (1 - clamp((m.land - G.t) / T.dripMark, 0, 1)));
    if (s.on) {
      if (id === 'litmus' && !s.over && s.a != null) { // the line, in its colour, and the drips it is about to leave
        const col = s.col || ELEMENTS.fire.color, adv = t < T.titTell ? 0 : (t - T.titTell) * T.titSpeed, pos = T.titLead + adv;
        const c = Math.cos(s.a), sn = Math.sin(s.a), nx = -sn, ny = c, X = s.cx + c * pos, Y = s.cy + sn * pos, k = clamp(t / T.titTell, 0.2, 1);
        sg1Soft(sx(X - nx * T.titHalf), sy(Y - ny * T.titHalf), sx(X + nx * T.titHalf), sy(Y + ny * T.titHalf), 18 * S, col, 0.25 * k);
        for (let o = -T.titHalf + (s.k % 2 ? T.titSp / 2 : 0); o <= T.titHalf; o += T.titSp) sg1Disc(sx(X + nx * o), sy(Y + ny * o), T.titR * S * 1.3, col, 0.2 + 0.25 * k);
      }
      if (id === 'johnny' && s.a != null && !s.over) { // the band: a faint line while it stretches, then a firm latex strip
        const L = (s.L != null ? s.L : 520), x0 = sx(e.x), y0 = sy(e.y), x1 = sx(e.x + Math.cos(s.a) * L), y1 = sy(e.y + Math.sin(s.a) * L);
        if (s.band) sg1Soft(x0, y0, x1, y1, 16 * S, '#9fe8d8', 0.55); else sg1Soft(x0, y0, x1, y1, 12 * S, '#9fe8d8', 0.08 + 0.2 * clamp(t / T.unTell, 0, 1));
      }
      if (id === 'cramp' && s.R != null && !s.done) { // the edge of the squeeze and the shut ring it ends on
        const x = sx(e.x), y = sy(e.y), R = s.R * S, Re = (e.r + T.conEnd) * S, k = clamp(t / T.conTell, 0.2, 1);
        const g = ctx.createRadialGradient(x, y, R * 0.82, x, y, R * 1.03);
        g.addColorStop(0, 'rgba(255,138,92,0)'); g.addColorStop(0.8, sg1Rgba('#ff8a5c', (0.12 + 0.2 * k).toFixed(3))); g.addColorStop(1, 'rgba(255,138,92,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * 1.03, 0, TAU); ctx.fill();
        sg1Disc(x, y, Re, '#ff8a5c', 0.12);
      }
      if (id === 'sneeze' && !s.k && s.a != null) { // the cloud's reach
        const x = sx(e.x), y = sy(e.y), L = 420 * S, h = T.snSpread / 2 + 0.06, k = clamp(t / T.snTell, 0.1, 1);
        const g = ctx.createRadialGradient(x, y, 0, x, y, L);
        g.addColorStop(0, sg1Rgba('#b8e0ff', (0.3 * k).toFixed(3))); g.addColorStop(1, 'rgba(184,224,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, L, s.a - h, s.a + h); ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
  }
};
