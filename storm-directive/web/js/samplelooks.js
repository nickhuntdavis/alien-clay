'use strict';
// Spawn Prawn - a body for each v10 sample (samples10.js), in three families:
//  - Natural specimens (Baseline, Alpha, Beta): real sperm in phase contrast; the anatomy shows the play style.
//    Baseline is the textbook control. Alpha is long and streamlined with an oversized midpiece (the engine: it
//    fires faster while moving). Beta is small, with a bent neck, a cytoplasmic droplet, a coiled tail tip and a
//    plaster (real morphology defects: it is not dead yet).
//  - Engineered specimens (Private Schooled, Ordered Online): the satire is in the construction. Private Schooled is
//    lacquered navy with gold trim, a crest and a school-tie midpiece. Ordered Online is moulded plastic: boxy, a
//    seam, a barcode, a crooked sticker, a misaligned cap, a ribbed hose for a midpiece and a zip-tie tail, frosted.
//  - Anomalies (Redtail, Prawn Again; Not of This World in alienyou.js): Redtail is a lumpy, wobbling red head with
//    twitchy hairs, a frayed tail that splits into strands and sheds embers. Prawn Again is white-gold and holy: a
//    halo, little feathered wings at the neck, slow light rays and a faint echo of where it was a moment ago.
// The natural family keeps its fluorescent tag on the acrosome (red when hit); the others flush red when hit.
// The tail is still the shared one (render.js stepTail), so swim physics and hitbox are unchanged.
// Hooks: render.js drawShip -> sampleLook (also routes Not of This World to alienYou); seqsel.js drawSeqMods ->
// sampleLookOn; samples10.js s10Samples -> slPicStart (a live picture on every sample card); ui.js codexHtml -> slCodex
// (the Field Guide's SAMPLES tab) and portraits.js portraitsStart -> slPicStart (its pictures); alienyou.js alienDraw ->
// slDefState/slDefUnder/slDefOver; pdef.js pdefDraw skips its Shell rings for v10 samples (sampleLookOn).

// neck: where the tail joins (local, x back from the head centre; y for Beta's bent neck). len: tail length.
const SL = {
  baseline: { size: 1,    neck: [-10.5, 0], len: 78, beat: 1,    tw: 1.9 },
  alpha:    { size: 1.06, neck: [-13.5, 0], len: 90, beat: 1.18, tw: 2.4 },
  beta:     { size: 0.9,  neck: [-9.6, 2.6], len: 70, beat: 0.85, tw: 1.6 },
  private:  { size: 1,    neck: [-12, 0],   len: 80, beat: 1,    tw: 2.0 },
  ordered:  { size: 1,    neck: [-12, 0],   len: 76, beat: 0.95, tw: 2.4 },
  redtail:  { size: 1,    neck: [-10.5, 0], len: 74, beat: 1.25, tw: 2.2 },
  prawn:    { size: 1,    neck: [-10.5, 0], len: 80, beat: 0.9,  tw: 2.0 },
};
const SL_HIT = '#ff4d6d';
const SL_C = { navy: '#1d2a5a', navy2: '#3a4f9a', gold: '#e2bd5c', tie: '#7a1f3d', plastic: '#e9e5da', seam: '#7d7a72', sticker: '#ff9f1c', cap: 'rgba(120,190,255,0.55)', red: '#d62839', red2: '#ff6a2a', redDk: '#5a0a14', holy: '#ffe6a3', holyRim: '#e2b64a' };

const sampleLookOn = b => (b && G && G.s10 && (b === G.player || (typeof UI !== 'undefined' && b === UI.youBody))) ? G.s10.id : null;
function sampleLook(x, y, face, tag, alpha, scale, body, look) {
  const id = sampleLookOn(body);
  if (!id) return false;
  if (id === 'alien') return typeof alienYou === 'function' && alienYou(x, y, face, tag, alpha, scale, body);
  if (!SL[id]) return false;
  slDraw(id, x, y, face, tag, alpha, scale, body, G.realT);
  return true;
}

const slEll = (x, y, rx, ry, r) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, r || 0, 0, TAU); };
// Screen point of a local (head-frame) point.
const slAt = (x, y, face, k, lx, ly) => [x + (Math.cos(face) * lx - Math.sin(face) * ly) * k, y + (Math.sin(face) * lx + Math.cos(face) * ly) * k];

function slDraw(id, x, y, face, tag, alpha, scale, body, now) {
  const D = SL[id], sc = (scale || 1) * D.size, k = S * sc, B = body.sl || (body.sl = { emb: [], hist: [] });
  const hit = tag === SL_HIT;
  // The head's pose first (rock, squash and stretch, jitter), so the tail can leave from exactly where its neck is drawn.
  const sq = body === G.player && typeof headSquash === 'function' ? headSquash(body) : null, st = slDefState(body, B, now), sh = SL_SHAPE[id];
  const U = st && st.up, yaw = body.tail ? Math.sin((body.beat || 0) + 0.6) * 0.14 * Math.min(1.4, body.turnK ?? 1) : 0, fy = face + yaw;
  const gx = st ? st.jel[0] : sq ? sq.x : 1, gy = st ? st.jel[1] : sq ? sq.y : 1;
  const jit = U && U.M.x_still ? 0.5 * U.M.x_still : 0, jx = (Math.random() - 0.5) * jit, jy = (Math.random() - 0.5) * jit; // (Can't Sit Still: local units)
  body.yaw = yaw;
  // The tail (shared physics), pinned to the neck: the local neck point through the head's scale and rotation.
  const v = body.tailV != null ? body.tailV : Math.hypot(body.vx || 0, body.vy || 0), lx = D.neck[0] * gx + jx, ly = D.neck[1] * gy + jy;
  const nwx = body.x + (Math.cos(fy) * lx - Math.sin(fy) * ly) * sc, nwy = body.y + (Math.sin(fy) * lx + Math.cos(fy) * ly) * sc;
  stepTail(body, nwx, nwy, fy, D.len * sc * (U ? 1 + 0.1 * U.speed : 1), v, D.beat * (U ? U.beat : 1), TAIL_BASE); // (attack rate quickens the beat, swim speed lengthens the tail)
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (SL_UNDER[id]) SL_UNDER[id](x, y, face, k, alpha, now, B, body, sc);
  SL_TAIL[id](body.tailDraw, k, alpha, now, B, sc);
  ctx.globalAlpha = alpha;
  ctx.save(); ctx.translate(x, y); ctx.rotate(fy); ctx.translate(jx * k, jy * k); ctx.scale(gx, gy);
  if (st) slDefUnder(k, alpha, now, sh, st, body);
  SL_HEAD[id](k, alpha, now, tag, hit, B);
  if (st) slDefOver(k, alpha, now, sh, st);
  ctx.restore();
  if (SL_OVER[id]) SL_OVER[id](x, y, face, k, alpha, now, B, body, sc);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
}

// ---------------------------------------------------------------- tails
function slNatTail(t, k, alpha, w, rw) {
  ctx.globalAlpha = alpha * 0.45; drawTail(t, '#ffffff', (w + 1.7) * k, (rw + 1.6) * k);
  ctx.globalAlpha = alpha * 0.9; drawTail(t, 'rgb(46,52,48)', w * k, rw * k);
}
const SL_TAIL = {
  baseline: (t, k, a) => slNatTail(t, k, a, 1.9, 2), // (root width = the midpiece's, so the join doesn't step)
  alpha: (t, k, a) => slNatTail(t, k, a, 2.4, 3.3),
  beta: (t, k, a, now) => {
    slNatTail(t, k, a, 1.6, 1.9);
    // Coiled tip: a small loop where the end of the tail has curled round on itself.
    const e = t[t.length - 1], d = t[t.length - 2], ang = Math.atan2(e.y - d.y, e.x - d.x), r = 2.2 * k;
    const cx = sx(e.x) + Math.cos(ang + Math.PI / 2) * r, cy = sy(e.y) + Math.sin(ang + Math.PI / 2) * r;
    ctx.globalAlpha = a * 0.45; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2 * k; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
    ctx.globalAlpha = a * 0.9; ctx.strokeStyle = 'rgb(46,52,48)'; ctx.lineWidth = 0.9 * k; ctx.stroke();
  },
  private: (t, k, a) => {
    ctx.globalAlpha = a * 0.5; drawTail(t, SL_C.gold, 3.4 * k, 4.4 * k);
    ctx.globalAlpha = a; drawTail(t, SL_C.navy, 2.2 * k, 3.2 * k);
    // Gold rings at even spacing, like a braided cord.
    ctx.strokeStyle = SL_C.gold; ctx.lineWidth = 0.7 * k; ctx.beginPath();
    for (let i = 1; i < t.length - 2; i += 2) {
      const p = t[i], q = t[i + 1], ang = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 2, h = 1.4 * k * (1 - i / t.length * 0.6);
      ctx.moveTo(sx(p.x) + Math.cos(ang) * h, sy(p.y) + Math.sin(ang) * h); ctx.lineTo(sx(p.x) - Math.cos(ang) * h, sy(p.y) - Math.sin(ang) * h);
    }
    ctx.stroke();
  },
  ordered: (t, k, a) => {
    ctx.globalAlpha = a; drawTail(t, SL_C.seam, 3.2 * k, 4 * k); drawTail(t, SL_C.plastic, 2.2 * k, 3 * k);
    // Zip-tie teeth along it.
    ctx.strokeStyle = SL_C.seam; ctx.lineWidth = 0.5 * k; ctx.beginPath();
    for (let i = 1; i < t.length - 1; i++) {
      const p = t[i], q = t[i + 1], ang = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 2, h = 1.1 * k * (1 - i / t.length * 0.7);
      for (const f of [0, 0.5]) { const mx = sx(p.x + (q.x - p.x) * f), my = sy(p.y + (q.y - p.y) * f); ctx.moveTo(mx + Math.cos(ang) * h, my + Math.sin(ang) * h); ctx.lineTo(mx - Math.cos(ang) * h, my - Math.sin(ang) * h); }
    }
    ctx.stroke();
  },
  redtail: (t, k, a, now, B, sc) => {
    // Frayed: the tail splits into three uneven strands for its last stretch.
    const n = t.length, i0 = Math.floor(n * 0.5);
    ctx.globalAlpha = a * 0.5; drawTail(t.slice(0, i0 + 2), SL_C.red2, 3.6 * k, 4.4 * k);
    ctx.globalAlpha = a; drawTail(t.slice(0, i0 + 2), SL_C.red, 2.2 * k, 3 * k);
    const pts = t.map((p, i) => { const q = t[Math.min(n - 1, i + 1)], o = t[Math.max(0, i - 1)], ang = Math.atan2(q.y - o.y, q.x - o.x) + Math.PI / 2; return [sx(p.x), sy(p.y), Math.cos(ang), Math.sin(ang)]; });
    ctx.strokeStyle = SL_C.red;
    for (const [s, len, w] of [[-1, 1, 1.1], [0.15, 0.8, 0.9], [1, 0.92, 1]]) {
      const iEnd = i0 + Math.round((n - 1 - i0) * len);
      ctx.lineWidth = w * k; ctx.beginPath();
      for (let i = i0; i <= iEnd; i++) {
        const f = (i - i0) / Math.max(1, n - 1 - i0), off = s * 5 * k * Math.pow(f, 1.4) + Math.sin(now * 9 + i + s * 3) * 0.8 * k * f;
        const P = pts[i]; i === i0 ? ctx.moveTo(P[0] + P[2] * off, P[1] + P[3] * off) : ctx.lineTo(P[0] + P[2] * off, P[1] + P[3] * off);
      }
      ctx.stroke();
    }
    // Embers drip off and fade.
    if (Math.random() < 0.18) { const p = t[2 + Math.floor(Math.random() * (n - 3))]; B.emb.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, l: 0.7 }); }
    ctx.globalCompositeOperation = 'lighter';
    for (const e of B.emb) { e.l -= 1 / 60; e.x += e.vx / 60; e.y += e.vy / 60; glow(sx(e.x), sy(e.y), 2.6 * k, SL_C.red2, a * Math.max(0, e.l)); }
    ctx.globalCompositeOperation = 'source-over';
    if (B.emb.length > 24 || (B.emb[0] && B.emb[0].l <= 0)) B.emb = B.emb.filter(e => e.l > 0).slice(-24);
  },
  prawn: (t, k, a, now) => {
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * 0.35; drawTail(t, SL_C.holy, 5 * k, 6 * k); ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = a; drawTail(t, SL_C.holyRim, 2.4 * k, 3.2 * k); drawTail(t, '#fffaf0', 1.3 * k, 2 * k);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 2; i < t.length; i += 2) glow(sx(t[i].x), sy(t[i].y), 2.4 * k, '#fff3c4', a * Math.max(0, Math.sin(now * 4 + i * 1.7)) * 0.8);
    ctx.globalCompositeOperation = 'source-over';
  },
};

// ---------------------------------------------------------------- heads (local frame: +x forward, units of k)
function slNatHead(k, a, tag, o) {
  // Midpiece (with a bright mitochondrial helix when o.mito), then the head with its halo, the acrosome cap
  // carrying the fluorescent tag, and the post-acrosomal band.
  const [m0, m1] = o.mid;
  ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = a * 0.5; ctx.lineWidth = (o.mw + 1.6) * k;
  ctx.beginPath(); ctx.moveTo(m0[0] * k, m0[1] * k); ctx.lineTo(m1[0] * k, m1[1] * k); ctx.stroke();
  ctx.globalAlpha = a; ctx.strokeStyle = 'rgb(58,64,60)'; ctx.lineWidth = o.mw * k; ctx.stroke();
  if (o.mito) {
    ctx.strokeStyle = 'rgba(225,232,228,0.8)'; ctx.lineWidth = Math.max(0.6, 0.55 * k); ctx.beginPath();
    for (let i = 0; i < o.mito; i++) { const f = (i + 0.5) / o.mito, hx = (m0[0] + (m1[0] - m0[0]) * f) * k, hy = (m0[1] + (m1[1] - m0[1]) * f) * k, h = o.mw * 0.42 * k; ctx.moveTo(hx + 0.5 * k, hy - h); ctx.lineTo(hx - 0.5 * k, hy + h); }
    ctx.stroke();
  }
  o.path(); ctx.fillStyle = MIC.body; ctx.fill(); pcHalo(2.2 * k, 0.75);
  o.cap(); ctx.fillStyle = tag || MIC.acro; ctx.globalAlpha = a * (tag ? 0.85 : 0.8); ctx.fill(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(20,24,22,0.35)'; slEll(o.band, 0, 2 * k, o.bandR * k); ctx.fill();
}
function slFlush(path, a, hit) { if (!hit) return; path(); ctx.fillStyle = SL_HIT; ctx.globalAlpha = a * 0.45; ctx.fill(); ctx.globalAlpha = a; }

const SL_HEAD = {
  baseline: (k, a, now, tag) => slNatHead(k, a, tag, {
    mid: [[-5, 0], [-11, 0]], mw: 2, mito: 0,
    path: () => slEll(1 * k, 0, 7.5 * k, 5 * k), cap: () => slEll(3.6 * k, 0, 4.4 * k, 4.3 * k), band: -2.6 * k, bandR: 4 }),
  alpha: (k, a, now, tag) => {
    // Long, sleek and pointed, with a ridge down the middle and a big striped midpiece.
    const path = () => { ctx.beginPath(); ctx.moveTo(12 * k, 0); ctx.bezierCurveTo(8 * k, -4.6 * k, -2 * k, -5 * k, -4.6 * k, -2.6 * k); ctx.quadraticCurveTo(-5.6 * k, 0, -4.6 * k, 2.6 * k); ctx.bezierCurveTo(-2 * k, 5 * k, 8 * k, 4.6 * k, 12 * k, 0); ctx.closePath(); };
    slNatHead(k, a, tag, { mid: [[-4.5, 0], [-13.5, 0]], mw: 3.3, mito: 8, path,
      cap: () => { ctx.beginPath(); ctx.moveTo(12 * k, 0); ctx.bezierCurveTo(9 * k, -3.9 * k, 3 * k, -4.2 * k, 2.2 * k, 0); ctx.bezierCurveTo(3 * k, 4.2 * k, 9 * k, 3.9 * k, 12 * k, 0); ctx.closePath(); }, band: -2.4 * k, bandR: 3.4 });
    ctx.strokeStyle = 'rgba(230,236,232,0.6)'; ctx.lineWidth = 0.6 * k; ctx.beginPath(); ctx.moveTo(10.5 * k, 0); ctx.lineTo(-3.5 * k, 0); ctx.stroke();
  },
  beta: (k, a, now, tag) => {
    // Bent neck: the midpiece kinks down, the head sits a little crooked on it. A droplet at the neck, a plaster.
    const wob = i => 1 + 0.07 * Math.sin(now * 1.3 + i * 2.1);
    const path = () => { ctx.beginPath(); for (let i = 0; i <= 8; i++) { const an = i / 8 * TAU, r = wob(i % 8); const px = 1 * k + Math.cos(an) * 6.2 * k * r, py = Math.sin(an) * 5.1 * k * r; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); };
    slNatHead(k, a, tag, { mid: [[-4.2, 0.2], [-9.6, 2.6]], mw: 1.9, mito: 0, path, cap: () => slEll(3.2 * k, -0.3 * k, 3.6 * k, 3.7 * k), band: -2.2 * k, bandR: 3.6 });
    ctx.fillStyle = 'rgba(235,240,236,0.75)'; slEll(-7 * k, 1.9 * k, 1.6 * k, 1.4 * k); ctx.fill();
    ctx.strokeStyle = 'rgba(30,34,32,0.5)'; ctx.lineWidth = 0.4 * k; ctx.stroke();
    ctx.save(); ctx.translate(0.4 * k, -2.4 * k); ctx.rotate(-0.55);
    ctx.fillStyle = '#d8b48a'; ctx.beginPath(); ctx.roundRect(-3.4 * k, -1.1 * k, 6.8 * k, 2.2 * k, 1.1 * k); ctx.fill();
    ctx.fillStyle = '#c29a6c'; ctx.fillRect(-1 * k, -1.1 * k, 2 * k, 2.2 * k);
    ctx.fillStyle = 'rgba(120,90,60,0.6)'; for (const dx of [-2.4, 2.1]) { slEll(dx * k, 0, 0.25 * k, 0.25 * k); ctx.fill(); }
    ctx.restore();
  },
  private: (k, a, now, tag, hit) => {
    // School tie midpiece: burgundy with gold diagonal stripes.
    ctx.save(); ctx.beginPath(); ctx.rect(-12 * k, -1.7 * k, 7.4 * k, 3.4 * k); ctx.fillStyle = SL_C.tie; ctx.fill(); ctx.clip();
    ctx.strokeStyle = SL_C.gold; ctx.lineWidth = 0.7 * k; ctx.beginPath(); for (let i = -14; i < -3; i += 2) { ctx.moveTo(i * k, 2 * k); ctx.lineTo((i + 3) * k, -2 * k); } ctx.stroke(); ctx.restore();
    // Lacquered head, gold rim, an equatorial gold band and a crest.
    const path = () => slEll(1 * k, 0, 7.6 * k, 5.2 * k);
    const gr = ctx.createLinearGradient(0, -5 * k, 0, 5 * k); gr.addColorStop(0, SL_C.navy2); gr.addColorStop(1, SL_C.navy);
    path(); ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = SL_C.gold; ctx.lineWidth = 0.8 * k; ctx.stroke();
    ctx.lineWidth = 0.9 * k; ctx.beginPath(); ctx.moveTo(1.6 * k, -5 * k); ctx.quadraticCurveTo(0.4 * k, 0, 1.6 * k, 5 * k); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; slEll(4 * k, -2.4 * k, 2.6 * k, 0.9 * k, -0.25); ctx.fill(); // (the gloss)
    ctx.save(); ctx.translate(-3 * k, 0); ctx.fillStyle = SL_C.gold;
    ctx.beginPath(); ctx.moveTo(-1.5 * k, -1.7 * k); ctx.lineTo(1.5 * k, -1.7 * k); ctx.lineTo(1.5 * k, 0.2 * k); ctx.quadraticCurveTo(1.3 * k, 1.5 * k, 0, 2 * k); ctx.quadraticCurveTo(-1.3 * k, 1.5 * k, -1.5 * k, 0.2 * k); ctx.closePath(); ctx.fill();
    ctx.fillStyle = SL_C.tie; ctx.fillRect(-0.3 * k, -1.2 * k, 0.6 * k, 2.4 * k); ctx.fillRect(-1 * k, -0.4 * k, 2 * k, 0.6 * k); ctx.restore();
    slFlush(path, a, hit);
  },
  ordered: (k, a, now, tag, hit) => {
    // Ribbed hose midpiece.
    ctx.fillStyle = SL_C.seam; ctx.fillRect(-12.4 * k, -1.7 * k, 7 * k, 3.4 * k);
    ctx.fillStyle = '#c9c5ba'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.roundRect((-12 + i * 1.7) * k, -1.5 * k, 1.2 * k, 3 * k, 0.5 * k); ctx.fill(); }
    // Boxy moulded body with a seam, barcode, crooked sticker and a cap that doesn't quite line up.
    const path = () => { ctx.beginPath(); ctx.roundRect(-6 * k, -4.8 * k, 14 * k, 9.6 * k, 2.6 * k); };
    path(); ctx.fillStyle = SL_C.plastic; ctx.fill(); ctx.strokeStyle = SL_C.seam; ctx.lineWidth = 0.8 * k; ctx.stroke();
    ctx.setLineDash([1 * k, 0.8 * k]); ctx.lineWidth = 0.4 * k; ctx.beginPath(); ctx.moveTo(-6 * k, 0.4 * k); ctx.lineTo(8 * k, 0.4 * k); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#2a2a2a'; [0.5, 0.25, 0.6, 0.3, 0.25, 0.55, 0.35].reduce((px, w) => { ctx.fillRect(px * k, -3.7 * k, w * k, 3.2 * k); return px + w + 0.3; }, -4.6);
    ctx.save(); ctx.translate(0.6 * k, 2.5 * k); ctx.rotate(0.18); ctx.fillStyle = SL_C.sticker; ctx.fillRect(-2 * k, -1.1 * k, 4 * k, 2.2 * k);
    ctx.fillStyle = '#fff'; ctx.fillRect(-1.5 * k, -0.25 * k, 3 * k, 0.5 * k); ctx.restore();
    ctx.fillStyle = SL_C.cap; ctx.beginPath(); ctx.ellipse(6.6 * k, -0.7 * k, 3.6 * k, 4.4 * k, 0, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.4 * k; ctx.stroke();
    // Frost from the cryo container.
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 0.35 * k; ctx.beginPath();
    for (const [fx, fy] of [[-5, -4.2], [7, 3.9], [-5.2, 3.6]]) for (let i = 0; i < 3; i++) { const an = i * Math.PI / 3; ctx.moveTo((fx + Math.cos(an)) * k, (fy + Math.sin(an)) * k); ctx.lineTo((fx - Math.cos(an)) * k, (fy - Math.sin(an)) * k); }
    ctx.stroke();
    slFlush(path, a, hit);
  },
  redtail: (k, a, now, tag, hit) => {
    // Lumpy midpiece.
    ctx.fillStyle = SL_C.redDk; for (const [mx, r] of [[-6, 1.9], [-8.4, 1.5], [-10.2, 1.7]]) { slEll(mx * k, Math.sin(now * 5 + mx) * 0.4 * k, r * k, r * k); ctx.fill(); }
    // A lumpy wobbling head (no two lobes the same) with a blister.
    const lobes = [1.12, 0.9, 1.16, 0.94, 1.02, 1.2, 0.86, 1.04];
    const path = () => { ctx.beginPath(); const P = []; for (let i = 0; i < 8; i++) { const an = i / 8 * TAU, r = lobes[i] * (1 + 0.09 * Math.sin(now * 3.1 + i * 2.3)); P.push([1 * k + Math.cos(an) * 7 * k * r, Math.sin(an) * 5 * k * r]); }
      ctx.moveTo((P[7][0] + P[0][0]) / 2, (P[7][1] + P[0][1]) / 2); for (let i = 0; i < 8; i++) { const p = P[i], q = P[(i + 1) % 8]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } ctx.closePath(); };
    const gr = ctx.createLinearGradient(-6 * k, 0, 8 * k, 0); gr.addColorStop(0, SL_C.red); gr.addColorStop(1, SL_C.red2);
    path(); ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = SL_C.redDk; ctx.lineWidth = 0.8 * k; ctx.stroke();
    ctx.fillStyle = 'rgba(255,200,170,0.75)'; slEll(-1 * k, -4.6 * k, 1.6 * k, 1.3 * k); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(90,10,20,0.35)'; slEll(2.5 * k, 1.2 * k, 1.1 * k, 0.8 * k); ctx.fill(); slEll(-2.5 * k, 1.8 * k, 0.7 * k, 0.6 * k); ctx.fill();
    // Twitchy hairs at odd angles (it touches everything).
    ctx.strokeStyle = SL_C.redDk; ctx.lineWidth = 0.5 * k; ctx.beginPath();
    for (const [an, l] of [[0.7, 3], [1.9, 2.2], [-1.2, 3.4], [-2.4, 2], [2.6, 2.6]]) { const j = Math.sin(now * 17 + an * 5) * 0.35, ex = 1 * k + Math.cos(an) * 7 * k, ey = Math.sin(an) * 5 * k; ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(an + j) * l * k, ey + Math.sin(an + j) * l * k); }
    ctx.stroke();
    slFlush(path, a, hit);
  },
  prawn: (k, a, now, tag, hit, B) => {
    // Little feathered wings at the neck, beating slowly.
    const flap = Math.sin(now * 5) * 0.35;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(-5 * k, s * 2.6 * k); ctx.rotate(s * (2.3 + flap));
      for (const [l, off] of [[6.2, 0], [5, 0.38], [3.8, 0.74]]) { ctx.save(); ctx.rotate(-s * off); slEll(l / 2 * k, 0, l / 2 * k, 1.15 * k); ctx.fillStyle = '#fffaf0'; ctx.globalAlpha = a * 0.92; ctx.fill(); ctx.strokeStyle = SL_C.holyRim; ctx.lineWidth = 0.4 * k; ctx.stroke(); ctx.restore(); }
      ctx.restore();
    }
    ctx.globalAlpha = a;
    ctx.strokeStyle = SL_C.holyRim; ctx.lineWidth = 2.2 * k; ctx.beginPath(); ctx.moveTo(-5 * k, 0); ctx.lineTo(-10.5 * k, 0); ctx.stroke();
    const path = () => slEll(1 * k, 0, 7.5 * k, 5 * k);
    const gr = ctx.createRadialGradient(2.5 * k, -1 * k, 0, 1 * k, 0, 8 * k); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#fff4d0'); gr.addColorStop(1, SL_C.holy);
    path(); ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = SL_C.holyRim; ctx.lineWidth = 0.9 * k; ctx.stroke();
    slFlush(path, a, hit);
  },
};

// ---------------------------------------------------------------- behind and above (screen space)
const SL_UNDER = {
  prawn: (x, y, face, k, a, now, B, body) => {
    // Slow rays of light behind it, and a faint echo of where it was half a second ago.
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ffe6a3';
    for (let i = 0; i < 8; i++) {
      const an = now * 0.25 + i * TAU / 8, w = 0.12, L = (16 + 4 * Math.sin(now * 1.3 + i)) * k;
      ctx.globalAlpha = a * 0.13; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an - w) * L, y + Math.sin(an - w) * L); ctx.lineTo(x + Math.cos(an + w) * L, y + Math.sin(an + w) * L); ctx.closePath(); ctx.fill();
    }
    glow(x, y, 26 * k, '#ffe6a3', a * 0.4);
    B.hist.push({ x: body.x, y: body.y, f: face }); if (B.hist.length > 30) B.hist.shift();
    const h = B.hist[0];
    if (Math.hypot(h.x - body.x, h.y - body.y) > 6) {
      const ex = sx(h.x), ey = sy(h.y);
      ctx.globalAlpha = a * 0.22; ctx.fillStyle = '#fff6dc'; slEll(ex + Math.cos(h.f) * k, ey + Math.sin(h.f) * k, 7.5 * k, 5 * k, h.f); ctx.fill();
      glow(ex, ey, 10 * k, '#ffe6a3', a * 0.18);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
  },
};
const SL_OVER = {
  prawn: (x, y, face, k, a, now) => {
    // The halo floats above the head (screen up), whichever way it is facing.
    const [hx, hy] = slAt(x, y, face, k, 1, 0), cy = hy - (10 + Math.sin(now * 2) * 0.8) * k;
    ctx.globalCompositeOperation = 'lighter'; glow(hx, cy, 9 * k, '#ffd36a', a * 0.5); ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = a; ctx.strokeStyle = SL_C.holyRim; ctx.lineWidth = 1.6 * k; slEll(hx, cy, 6 * k, 1.9 * k); ctx.stroke();
    ctx.strokeStyle = '#fff6d0'; ctx.lineWidth = 0.7 * k; ctx.stroke();
  },
};

// ---------------------------------------------------------------- the sample cards' pictures (s10Samples)
// A live canvas on every sample card: sperm-shaped samples swim on the spot facing right; Not of This World hangs
// and runs through its moods (alienyou.js alienDraw). Borrows the world drawing globals for each frame (like
// drawYouPortrait), stands a stub G in on the title screen, and stops once the cards leave the page.
let slPicTok = 0;
const SL_PIC_MOODS = ['idle', 'curious', 'alert', 'agitated'];
function slPicStart() {
  const cvs = [...document.querySelectorAll('canvas[data-slpic]')]; if (!cvs.length) return;
  const tok = ++slPicTok, t0 = performance.now(), bodies = new Map();
  const frame = () => {
    if (tok !== slPicTok || !cvs.some(c => c.isConnected)) return;
    requestAnimationFrame(frame);
    const now = (performance.now() - t0) / 1000;
    for (const cv of cvs) {
      if (!cv.isConnected || !cv.clientWidth) continue;
      const r = cv.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) continue; // (off screen: skip)
      const dpr = window.devicePixelRatio || 1, id = cv.dataset.slpic;
      if (cv.width !== Math.round(cv.clientWidth * dpr) || cv.height !== Math.round(cv.clientHeight * dpr)) { cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(cv.clientHeight * dpr); }
      const body = bodies.get(id) || (bodies.set(id, { x: 0, y: 0, vx: id === 'alien' ? 0 : 140, vy: id === 'alien' ? -50 : 0, tailV: 140, id: -2 }), bodies.get(id));
      slPicDraw(cv, id, body, now);
    }
  };
  requestAnimationFrame(frame);
}
function slPicDraw(cv, id, body, now) {
  const g = cv.getContext('2d'), keep = { ctx, S, W, H, cx: cam.x, cy: cam.y, G };
  try {
    ctx = g; W = cv.width; H = cv.height;
    G = { realT: now }; // (a stand-in: the tail and drawing read only the clock; the real G comes back below)
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    if (id === 'alien') {
      S = H / 84; body.y = Math.sin(now * 1.1) * 2.5;
      const step = Math.floor(now / 3), core = ELEMENTS[S10_BY.alien.shift[step % 3]].color;
      alienDraw(W / 2, H * 0.2 + body.y * S, -Math.PI / 2, null, 1, 1, body, now, core, SL_PIC_MOODS[step % SL_PIC_MOODS.length]);
    } else {
      const D = SL[id], span = (12 - D.neck[0] + D.len) * D.size; // (nose to tail tip)
      S = Math.min(W * 0.86 / span, H * 0.5 / (12 * D.size));
      cam.x = body.x + (12 * D.size - span / 2) * 0.98; cam.y = body.y + (id === 'prawn' ? -3 : 0);
      body.y = Math.sin(now * 1.4) * 1.2; body.hd = body.face = 0;
      slDraw(id, sx(body.x), sy(body.y), 0, id === 'baseline' || id === 'alpha' || id === 'beta' ? PAL.you : null, 1, 1, body, now);
    }
  } finally { ctx = keep.ctx; S = keep.S; W = keep.W; H = keep.H; cam.x = keep.cx; cam.y = keep.cy; G = keep.G; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
}

// ---------------------------------------------------------------- your defences, worn on the body (pdef.js G.pd)
// Instead of rings round you, your Genome defence cards change the body itself (every sample, the alien too):
//  - Shell: brown armour bands that wrap the head like an armadillo's, front first. Each layer adds a band and
//    thickness (4 layers: the whole head and a collar). Shaded as a curved surface (lit top, dark underside, a
//    highlight along each band, a shadow under its back lip) with a drop shadow. The front band cracks as the
//    outer layer wears and chips away near the end.
//  - Squishy: the body turns to jelly. The head's squash and stretch is exaggerated and springy (it overshoots and
//    wobbles back), a hit squashes it flat and it boings back, and it has a wet sheen.
//  - Thorns: pale spikes raked back along the sides of the head, more and longer with each rank.
//  - Evasion: faint after-images of the head trail it while moving (one, then two from rank 3).
// sh: the head as an ellipse in local units of k ({ cx, rx, ry }).
const SL_SHAPE = { baseline: [1, 7.5, 5], alpha: [3.5, 8.5, 4.8], beta: [1, 6.2, 5.1], private: [1, 7.6, 5.2], ordered: [1, 7, 4.8], redtail: [1, 7.6, 5.4], prawn: [1, 7.5, 5], alien: [2.5, 10.5, 9, 0.35] }; // (4th: the most of its length a Shell may cover: the alien's core stays in view)
const SL_SHELL = { top: '#c99a64', mid: DEF_PAL.shell, dk: '#4e3219', lit: '#e8c48e' };

// The defence state for a body (only yours, in a run): { n: card ranks, D: G.pd, jel: [sx, sy] or null }.
// The body state for you (null for anything else): { D: G.pd or null, n: defence ranks, up: upgrades (slUpState),
// jel: [sx, sy], the head's scale: Squishy's jelly or the usual squash, times bulk (damage) and stretch (swim speed) }.
function slDefState(body, B, now) {
  if (!sampleLookOn(body)) return null;
  const D = G.pd || null, n = D ? D.n : {}, up = slUpState();
  const sq = body === G.player && typeof headSquash === 'function' ? headSquash(body) : null, j = slJelly(B, body, sq, now, n.squishy > 0);
  const bx = up.bulk * up.str, by = up.bulk / Math.sqrt(up.str);
  return { D, n, up, jel: j ? [j[0] * bx, j[1] * by] : [(sq ? sq.x : 1) * bx, (sq ? sq.y : 1) * by] };
}
function slJelly(B, body, sq, now, on) {
  const J = B.j || (B.j = { x: 0, v: 0, t: now, f: false });
  const dt = Math.min(0.05, Math.max(0, now - J.t)); J.t = now;
  if (!on) { J.x = J.v = 0; return null; }
  const tgt = clamp(((sq ? sq.x / sq.y : 1) - 1) * 3.2, -0.45, 0.85); // (headSquash's stretch, three times over)
  const hit = body.flash > 0; if (hit && !J.f) J.v -= 9; J.f = hit; // (a hit squashes it flat, then it boings back)
  J.v += ((tgt - J.x) * 170 - J.v * 5) * dt; J.x = clamp(J.x + J.v * dt, -0.5, 0.95); // (underdamped: it overshoots)
  const w = 0.05 * Math.sin(now * 7.3), s = 1 + J.x;
  return [s * (1 + w), (1 / s) * (1 - w)];
}
// Behind the head (Evasion's after-images). Local frame.
function slDefUnder(k, a, now, sh, st, body) {
  slUpUnder(k, a, now, sh, st.up, body);
  const r = st.n.evasion; if (!r) return;
  const v = Math.min(1, Math.hypot(body.vx || 0, body.vy || 0) / 160); if (v < 0.15) return;
  ctx.fillStyle = '#cfe7ff';
  for (let j = 1; j <= (r >= 3 ? 2 : 1); j++) { ctx.globalAlpha = a * 0.16 * v / j; slEll((sh[0] - j * 4 * v) * k, Math.sin(now * 9 + j) * 0.6 * k, sh[1] * k, sh[2] * k); ctx.fill(); }
  ctx.globalAlpha = a;
}
// Over the head (Shell, Thorns, Squishy's sheen). Local frame.
function slDefOver(k, a, now, sh, st) {
  const [cx, rx, ry] = sh, n = st.n;
  if (n.squishy) { ctx.fillStyle = '#ffffff'; ctx.globalAlpha = a * 0.4; slEll((cx + rx * 0.25) * k, -ry * 0.45 * k, rx * 0.45 * k, ry * 0.2 * k, -0.15); ctx.fill(); ctx.globalAlpha = a; }
  slUpOver(k, a, now, sh, st.up);
  const L = Math.min(4, (st.D && st.D.layers) || 0);
  if (L) slShell(k, a, now, sh, L, clamp(st.D.layerHp / pdLayerHp(), 0, 1));
  if (n.thorns) {
    const per = 2 + n.thorns, len = 2.2 + 0.8 * n.thorns, ox = rx + (L ? 0.6 + 0.35 * L : 0.2), oy = ry + (L ? 0.6 + 0.35 * L : 0.2);
    for (const s of [-1, 1]) for (let i = 0; i < per; i++) {
      const an = s * (0.75 + i / Math.max(1, per - 1) * 1.7), bx = cx + Math.cos(an) * ox, by = Math.sin(an) * oy;
      let nx = Math.cos(an) / ox, ny = Math.sin(an) / oy; const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl; // (the outward normal)
      const tx = nx - 0.45, ty = ny, tl = Math.hypot(tx, ty), dx = tx / tl, dy = ty / tl, px = -dy * 0.75, py = dx * 0.75; // (raked back)
      ctx.beginPath(); ctx.moveTo((bx + px) * k, (by + py) * k); ctx.lineTo((bx + dx * len) * k, (by + dy * len) * k); ctx.lineTo((bx - px) * k, (by - py) * k); ctx.closePath();
      ctx.fillStyle = DEF_PAL.thorns; ctx.fill(); ctx.strokeStyle = 'rgba(60,48,30,0.8)'; ctx.lineWidth = 0.35 * k; ctx.stroke();
    }
  }
}
function slShell(k, a, now, sh, L, hp) {
  const [cx, rx, ry] = sh, th = 0.6 + 0.35 * L, ex = (rx + th) * k, ey = (ry + th) * k, c = cx * k;
  const bands = L + 1, cover = Math.min(sh[3] || 9, [0, 0.45, 0.65, 0.85, 1.12][L]); // (how far back from the nose the bands reach, as a share of the head's length)
  const front = c + ex, x0 = front - cover * 2 * ex, bw = (front - x0) / bands, curve = 0.32 * ey;
  const outline = () => slEll(c, 0, ex, ey);
  // Drop shadow, then the bands from the back forward so each overlaps the one behind it.
  ctx.save(); outline(); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x0 + 0.6 * k, -ey + 0.9 * k, front - x0, 2 * ey);
  const gr = ctx.createLinearGradient(0, -ey, 0, ey); gr.addColorStop(0, SL_SHELL.top); gr.addColorStop(0.45, SL_SHELL.mid); gr.addColorStop(1, SL_SHELL.dk);
  for (let i = bands - 1; i >= 0; i--) {
    const xa = front - (i + 1) * bw, xb = i ? xa + bw + 0.9 * k : front + k, outer = i === 0; // (i 0: the front band, drawn last, over the rest)
    ctx.globalAlpha = a * (outer ? 0.55 + 0.45 * Math.min(1, hp * 2) : 1);
    ctx.beginPath(); ctx.moveTo(xa, -ey * 1.2); ctx.quadraticCurveTo(xa - curve * 2, 0, xa, ey * 1.2); ctx.lineTo(xb, ey * 1.2); ctx.lineTo(xb, -ey * 1.2); ctx.closePath();
    ctx.fillStyle = gr; ctx.fill();
    ctx.strokeStyle = SL_SHELL.dk; ctx.lineWidth = 0.9 * k; ctx.beginPath(); ctx.moveTo(xa, -ey * 1.2); ctx.quadraticCurveTo(xa - curve * 2, 0, xa, ey * 1.2); ctx.stroke(); // (the back lip's shadow)
    ctx.strokeStyle = SL_SHELL.lit; ctx.lineWidth = 0.45 * k; ctx.beginPath(); ctx.moveTo(xa + 0.7 * k, -ey * 1.2); ctx.quadraticCurveTo(xa - curve * 2 + 0.7 * k, 0, xa + 0.7 * k, ey * 1.2); ctx.stroke(); // (its lit edge)
    ctx.fillStyle = '#fff2dc'; ctx.globalAlpha *= 0.4; slEll(xa + bw * 0.45, -ey * 0.55, bw * 0.38, ey * 0.13); ctx.fill(); // (a gloss highlight along the top)
  }
  ctx.globalAlpha = a;
  // Wear: cracks across the front band, chips missing near the end.
  if (hp < 0.85) {
    ctx.strokeStyle = 'rgba(30,18,8,0.85)'; ctx.lineWidth = 0.4 * k; ctx.beginPath();
    const nC = hp < 0.5 ? 3 : hp < 0.7 ? 2 : 1;
    for (let j = 0; j < nC; j++) { let px = front - 0.6 * k, py = (j - 1) * ey * 0.45; ctx.moveTo(px, py); for (let s = 0; s < 4; s++) { px -= bw * 0.28; py += ((s + j) % 2 ? 1 : -1) * 0.9 * k; ctx.lineTo(px, py); } }
    ctx.stroke();
  }
  ctx.restore();
  if (hp < 0.35) { ctx.fillStyle = 'rgba(30,18,8,0.55)'; for (const [fx, fy] of [[0.92, -0.3], [0.8, 0.45]]) { slEll(c + fx * ex, fy * ey, 0.9 * k, 0.7 * k); ctx.fill(); } }
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - curve * 2, -ey * 1.3, front - x0 + 2 * k + curve * 2, ey * 2.6); ctx.clip(); // (a dark rim round the covered part only)
  outline(); ctx.strokeStyle = 'rgba(40,24,10,0.7)'; ctx.lineWidth = 0.5 * k; ctx.stroke(); ctx.restore();
  if (L >= 4) { ctx.fillStyle = SL_SHELL.mid; ctx.strokeStyle = SL_SHELL.dk; ctx.lineWidth = 0.5 * k; ctx.beginPath(); ctx.roundRect(c - ex - 2.2 * k, -1.9 * k, 2.6 * k, 3.8 * k, 1 * k); ctx.fill(); ctx.stroke(); } // (the collar)
}

// ---------------------------------------------------------------- the Field Guide's SAMPLES tab (ui.js codexHtml)
// Each sample with its live picture, family, origin, passive and the lab's note. Locked ones show dimmed (a secret one
// shows no name or note).
const SL_FAMILY = { baseline: 'Natural specimen', alpha: 'Natural specimen', beta: 'Natural specimen', private: 'Engineered specimen', ordered: 'Engineered specimen', redtail: 'Anomaly', prawn: 'Anomaly', alien: 'Anomaly' };
function slCodex(box) {
  const rows = SAMPLES10.map(s => {
    const open = s10Open(s.id), secret = !open && s.unlock && s.unlock.secret, no = String(s.strain).padStart(3, '0'), c = ELEMENTS[S10_TYPES[s.types[0]]].color;
    const pic = `<canvas data-slpic="${s.id}" style="position:relative;inset:auto;flex:none;display:block;width:100%;height:${s.id === 'alien' ? 110 : 80}px${open ? '' : ';filter:grayscale(1) brightness(0.5)'}"></canvas>`;
    const txt = secret ? `<b>#${no} ???</b><br><span>Unlock: ???</span>`
      : `<b style="color:${c}">#${no} ${esc(s.name)}</b> <em>${SL_FAMILY[s.id]} | ${esc(s.origin)}</em><br><span><b>${esc(s.passive)}</b>: ${esc(s.pdesc)}</span>`
        + (open ? `<br><i>${esc(s.sci.replace('{id}', no))}</i>` : `<br><span>Unlock: ${esc(s.unlock.txt)}</span>`);
    return `<div class="li">${pic}${txt}</div>`;
  }).join('');
  return box(`Samples (${SAMPLES10.filter(s => s10Open(s.id)).length}/${SAMPLES10.length} in stock)`, `<div class="list">${rows}</div>`, 'Natural specimens, engineered specimens and anomalies. Pick one before a run.');
}

// ---------------------------------------------------------------- your other upgrades, on the body (G.P, G.muts: mutations.js)
// Stat changes reshape the whole body (any source: mutations, cards): more damage = a bulkier head, more attack rate = a
// quicker tail beat, more swim speed = a sleeker, stretched head and a longer tail, more pickup range = a faint
// receptor field round it. Each body and trade-off mutation adds its own mark, sized by rank:
//  - Slipstream: a wake streaming off the sides while moving.     - Extra Padding: pale quilted pads round the back.
//  - Sticky Fingers: hairs with sticky tips.                     - Heartbeat: a little heart at the neck, beating.
//  - Hard to Hold: wet and glossy, dripping.                     - Spare Parts: a sac of bits stuck to its side.
//  - Overexcited: excitement lines (big while it is active).     - Personal Space: a slow ripple pushing outward.
//  - Big Brain: a pink, folded brain bulging from the front.     - Quantity Over Quality: tiny copies budding off it.
//  - Can't Sit Still: it jitters.                                - All at Once: a barb on the nose.
//  - Hungry Hungry: a pot belly behind the head.                 - No Time for Being Careful: red racing stripes.
//  - Growing Pains: stretch marks.                               - A damage type mutation: the neck dyed its colour.
// (Weapon mutations show on the weapons, not you.)
function slUpState() {
  const P = G.P, M = G.muts || {}, b = G.slBase || (G.slBase = { might: P.might, haste: P.haste, speed: P.speed, magnet: P.magnet }); // (relative to the run's start)
  const r = (v, b0, span) => clamp((v / (b0 || 1) - 1) / span, 0, 1);
  let dye = null, best = 0;
  for (const t of ['force', 'mucus', 'static', 'blood', 'soul']) { const n = M['t_' + t] || 0; if (n > best) { best = n; dye = MUT_COL[t]; } }
  const m10 = G.mut10 || {}, U = { might: r(P.might, b.might, 0.6), haste: r(P.haste, b.haste, 0.6), speed: r(P.speed, b.speed, 0.4), magnet: r(P.magnet, b.magnet, 0.9), M, dye,
    excited: (m10.oxT || 0) > G.t, hb: m10.hbT };
  U.bulk = 1 + 0.12 * U.might; U.str = 1 + 0.15 * U.speed; U.beat = (1 + 0.35 * U.haste) * (U.excited ? 1.3 : 1);
  return U;
}
function slUpUnder(k, a, now, sh, U, body) {
  const [cx, rx, ry] = sh, M = U.M, v = Math.min(1, Math.hypot(body.vx || 0, body.vy || 0) / 160);
  if (M.m_space) { const ph = (now * 0.6) % 1; ctx.strokeStyle = '#cfe7ff'; ctx.globalAlpha = a * 0.3 * (1 - ph); ctx.lineWidth = 0.5 * k; slEll(cx * k, 0, rx * (1.5 + ph * (0.6 + 0.2 * M.m_space)) * k, ry * (1.6 + ph * (0.6 + 0.2 * M.m_space)) * k); ctx.stroke(); }
  if (U.magnet > 0) { ctx.save(); ctx.rotate(now * 0.8); ctx.setLineDash([2 * k, 4 * k]); ctx.strokeStyle = '#d6e4f0'; ctx.globalAlpha = a * 0.25; ctx.lineWidth = 0.5 * k; slEll(0, 0, (rx + 4 + 3 * U.magnet) * k, (rx + 4 + 3 * U.magnet) * k); ctx.stroke(); ctx.restore(); }
  if (M.m_slip && v > 0.35) {
    ctx.strokeStyle = '#eef6ff'; ctx.lineWidth = 0.45 * k;
    for (const s of [-1, 1]) for (let j = 1; j <= M.m_slip; j++) { ctx.globalAlpha = a * 0.4 * v / j; const yy = s * (ry + 0.6 + j * 1.2) * k, x0 = (cx - rx * 0.2) * k; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.quadraticCurveTo(x0 - 4 * k, yy + s * 0.6 * k, x0 - (7 + 4 * j) * v * k, yy + s * 1.2 * k); ctx.stroke(); }
  }
  ctx.globalAlpha = a;
  if (U.dye) { // (the neck dyed)
    ctx.strokeStyle = U.dye; ctx.lineWidth = 2.8 * k; ctx.beginPath(); ctx.moveTo((cx - rx + 0.5) * k, 0); ctx.lineTo((cx - rx - 4) * k, 0); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; glow((cx - rx - 2) * k, 0, 5 * k, U.dye, a * 0.45); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
  }
  if (M.x_hungry) { ctx.fillStyle = 'rgba(66,70,68,0.92)'; slEll((cx - rx - 2.4) * k, 0.4 * k, 3.4 * k, 3 * k); ctx.fill(); pcHalo(1.2 * k, 0.6); ctx.fillStyle = 'rgba(255,255,255,0.25)'; slEll((cx - rx - 1.8) * k, -1 * k, 1.4 * k, 0.8 * k); ctx.fill(); }
  if (M.m_pad) {
    ctx.fillStyle = '#efe6d8'; ctx.strokeStyle = '#b9ab95'; ctx.lineWidth = 0.4 * k;
    for (const an of [1.9, 2.5, Math.PI, -2.5, -1.9]) { slEll((cx + Math.cos(an) * rx * 0.95) * k, Math.sin(an) * ry * 0.95 * k, (1.7 + 0.35 * M.m_pad) * k, (1.5 + 0.3 * M.m_pad) * k, an); ctx.fill(); ctx.stroke(); }
  }
  if (M.m_parts) {
    const px = (cx - rx * 0.3) * k, py = (ry + 1.8) * k;
    ctx.fillStyle = 'rgba(230,232,222,0.55)'; ctx.strokeStyle = 'rgba(60,64,62,0.7)'; ctx.lineWidth = 0.4 * k; slEll(px, py, 2.4 * k, 2 * k); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgb(70,74,72)'; for (let i = 0; i < 2 + M.m_parts; i++) { const an = i * 2.4 + now * 0.4; ctx.fillRect(px + Math.cos(an) * 1.1 * k - 0.4 * k, py + Math.sin(an) * 0.9 * k - 0.3 * k, 0.8 * k, 0.6 * k); }
  }
  if (M.x_qty) { // (tiny copies budding off the back, each with a wisp of a tail)
    for (const an of [2.2, -2.2, 2.75]) {
      const bx = (cx + Math.cos(an) * (rx + 0.8)) * k, by = Math.sin(an) * (ry + 0.8) * k;
      ctx.strokeStyle = 'rgba(46,52,48,0.8)'; ctx.lineWidth = 0.35 * k; ctx.beginPath(); ctx.moveTo(bx - 1.4 * k, by); ctx.quadraticCurveTo(bx - 2.6 * k, by + Math.sin(now * 12 + an) * 0.8 * k, bx - 4 * k, by); ctx.stroke();
      ctx.fillStyle = MIC.body; slEll(bx, by, 1.6 * k, 1.1 * k); ctx.fill(); pcHalo(0.8 * k, 0.6);
    }
  }
  ctx.globalAlpha = a;
}
function slUpOver(k, a, now, sh, U) {
  const [cx, rx, ry] = sh, M = U.M, head = () => slEll(cx * k, 0, rx * k, ry * k);
  if (M.x_brain) {
    const bx = (cx + rx * 0.3) * k, brx = rx * 0.62 * k, bry = ry * 0.86 * k;
    ctx.save(); slEll(bx, 0, brx, bry); ctx.fillStyle = '#f2b8c6'; ctx.fill(); ctx.strokeStyle = '#a8566a'; ctx.lineWidth = 0.5 * k; ctx.stroke(); ctx.clip();
    ctx.lineWidth = 0.4 * k; ctx.beginPath();
    for (let j = -2; j <= 2; j++) { const yy = j * bry * 0.38; ctx.moveTo(bx - brx, yy); for (let i = 1; i <= 8; i++) ctx.lineTo(bx - brx + i * brx / 4, yy + Math.sin(i * 1.9 + j * 1.3) * 0.7 * k); }
    ctx.stroke(); ctx.restore();
  }
  if (M.x_careless) { ctx.save(); head(); ctx.clip(); ctx.strokeStyle = '#ff3b3b'; ctx.globalAlpha = a * 0.85; ctx.lineWidth = 0.6 * k; ctx.beginPath(); for (const yy of [-1, 1]) { ctx.moveTo((cx - rx) * k, yy * k); ctx.lineTo((cx + rx) * k, yy * k); } ctx.stroke(); ctx.restore(); ctx.globalAlpha = a; }
  if (M.r_pains) { ctx.strokeStyle = 'rgba(244,227,224,0.75)'; ctx.lineWidth = 0.35 * k; ctx.beginPath(); for (let i = 0; i < 3; i++) { const xx = (cx - rx * 0.45 + i * 1.3) * k; ctx.moveTo(xx, -ry * 0.75 * k); ctx.quadraticCurveTo(xx + 0.6 * k, -ry * 0.45 * k, xx, -ry * 0.2 * k); } ctx.stroke(); }
  if (M.x_once) { const n0 = (cx + rx - 0.3) * k, bl = (3 + M.x_once) * k; ctx.fillStyle = 'rgb(58,64,60)'; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 0.35 * k; ctx.beginPath(); ctx.moveTo(n0 + bl, 0); ctx.lineTo(n0, -1.7 * k); ctx.lineTo(n0, 1.7 * k); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  if (M.m_fingers) {
    const n = 3 + 2 * M.m_fingers; ctx.strokeStyle = 'rgba(40,46,42,0.85)'; ctx.lineWidth = 0.35 * k; ctx.fillStyle = '#e6c75a';
    for (let i = 0; i < n; i++) {
      const an = Math.PI * 0.4 + (i / (n - 1)) * Math.PI * 1.2, ex = (cx + Math.cos(an) * rx) * k, ey = Math.sin(an) * ry * k, w = Math.sin(now * 8 + i) * 0.4, tx = ex + Math.cos(an + w) * 2.8 * k, ty = ey + Math.sin(an + w) * 2.8 * k;
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(tx, ty); ctx.stroke(); slEll(tx, ty, 0.55 * k, 0.55 * k); ctx.fill();
    }
  }
  if (M.m_hold) {
    ctx.fillStyle = '#ffffff'; ctx.globalAlpha = a * 0.55; slEll((cx + rx * 0.2) * k, -ry * 0.55 * k, rx * 0.5 * k, 0.6 * k, -0.1); ctx.fill(); slEll((cx - rx * 0.3) * k, ry * 0.5 * k, rx * 0.25 * k, 0.4 * k, 0.1); ctx.fill();
    ctx.fillStyle = '#bfe9ff'; ctx.globalAlpha = a * 0.8;
    for (let i = 0; i < M.m_hold + 1; i++) { const ph = (now * 0.9 + i * 0.37) % 1, dx = (cx - rx * (0.2 + 0.3 * i)) * k - ph * 3 * k, dy = (ry + 0.8 + ph * 3) * k; ctx.beginPath(); ctx.moveTo(dx, dy - 1 * k); ctx.quadraticCurveTo(dx + 0.7 * k, dy + 0.4 * k, dx, dy + 0.7 * k); ctx.quadraticCurveTo(dx - 0.7 * k, dy + 0.4 * k, dx, dy - 1 * k); ctx.fill(); }
    ctx.globalAlpha = a;
  }
  if (M.m_heart) {
    const beat = Math.pow(Math.max(0, Math.sin(now * 7)), 8) + (U.hb != null && U.hb < 0.35 ? 0.8 : 0), hx = (cx - rx - 1.2) * k, s = (1.1 + 0.15 * M.m_heart) * k * (1 + 0.3 * beat);
    ctx.fillStyle = '#e5383b'; ctx.beginPath(); ctx.moveTo(hx, s * 0.9); ctx.bezierCurveTo(hx - s * 1.4, -s * 0.1, hx - s * 0.6, -s * 1.2, hx, -s * 0.4); ctx.bezierCurveTo(hx + s * 0.6, -s * 1.2, hx + s * 1.4, -s * 0.1, hx, s * 0.9); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; glow(hx, 0, 4 * k * (1 + beat), '#ff4d6d', a * 0.35 * (0.4 + beat)); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
  }
  if (M.m_excite) {
    ctx.strokeStyle = '#ffe94a'; ctx.globalAlpha = a * (U.excited ? 0.95 : 0.35); ctx.lineWidth = (U.excited ? 0.6 : 0.4) * k; ctx.beginPath();
    for (const an of [-1.1, -0.75, -0.4]) { const r0 = (rx + 1.2 + (U.excited ? Math.sin(now * 20) * 0.5 : 0)) * k, r1 = r0 + (U.excited ? 3 : 1.8) * k; ctx.moveTo(cx * k + Math.cos(an) * r0, Math.sin(an) * r0 * ry / rx); ctx.lineTo(cx * k + Math.cos(an) * r1, Math.sin(an) * r1 * ry / rx); }
    ctx.stroke(); ctx.globalAlpha = a;
  }
}
