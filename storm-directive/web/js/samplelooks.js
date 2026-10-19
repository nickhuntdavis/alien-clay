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
// sampleLookOn; samples10.js s10Samples -> slPicStart (a live picture on every sample card).

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
  // The tail (shared physics), anchored at this sample's neck.
  const v = body.tailV != null ? body.tailV : Math.hypot(body.vx || 0, body.vy || 0);
  const nwx = body.x + (Math.cos(face) * D.neck[0] - Math.sin(face) * D.neck[1]) * sc, nwy = body.y + (Math.sin(face) * D.neck[0] + Math.cos(face) * D.neck[1]) * sc;
  stepTail(body, nwx, nwy, face, D.len * sc, v, D.beat, TAIL_BASE);
  const yaw = body.tail ? Math.sin((body.beat || 0) + 0.6) * 0.14 * Math.min(1.4, body.turnK ?? 1) : 0;
  body.yaw = yaw;
  const sq = body === G.player && typeof headSquash === 'function' ? headSquash(body) : null;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (SL_UNDER[id]) SL_UNDER[id](x, y, face, k, alpha, now, B, body, sc);
  SL_TAIL[id](body.tailDraw, k, alpha, now, B, sc);
  ctx.globalAlpha = alpha;
  ctx.save(); ctx.translate(x, y); ctx.rotate(face + yaw); if (sq) ctx.scale(sq.x, sq.y);
  SL_HEAD[id](k, alpha, now, tag, hit, B);
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
  baseline: (t, k, a) => slNatTail(t, k, a, 1.9, 2.6),
  alpha: (t, k, a) => slNatTail(t, k, a, 2.4, 3.6),
  beta: (t, k, a, now) => {
    slNatTail(t, k, a, 1.6, 2.2);
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
