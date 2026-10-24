'use strict';
// Spawn Prawn - v10 bodies for the eleven v9 samples (samples9.js, ids 'v9_<profile>'), drawn through samplelooks.js
// (slDraw), so they swim, wear your defences and upgrades, and show on sample cards, the Field Guide and fusions the
// same way the v10 ones do. Each keeps its v9 colour (seqsel.js SEQ_LOOK) and gets its own anatomy:
//  - The Firstborn: the textbook sperm, but first: a thickened forehead plate (Head First) and a cyan rosette.
//  - The Chonker: a big round head with fat rolls that jiggle, a double chin at the neck and a short, thick tail.
//  - The Bright Spark: a domed head, taped spectacles, a glowing charge in the cap; sparks arc over it and run down
//    the tail.
//  - The Favourite: glossy pink with a heart-shaped cap, a gold star sticker and the odd twinkle round it.
//  - The Quiet One: nearly see-through (dark middle, thin violet rim), a black head wrap whose ties trail behind.
//  - The Good Eater: plump and translucent, food vacuoles drifting inside, crumbs and rod bacteria stuck to it.
//  - The Problem Child: a scrunched, flushed head with a dummy plugged in the front, Acid dribbling off it.
//  - The Designer Baby: frosted porcelain with a turning double helix inside and a barcode label at the neck.
//  - Prawn Again (v9's Old Soul): wrinkled lilac, a stitched scar, and its soul drifting half out and back.
//  - The Redtail (v9): lopsided, with a monobrow and a straw in the front; the tail goes red at the end.
//  - The Twins: sepia-pale with a lace ruff and a black bow; your twin (twins.js) is drawn with the same body.
// Hooks: none in shared files. Fills samplelooks.js's SL, SL_TAIL, SL_HEAD, SL_UNDER, SL_OVER and SL_SHAPE; wraps
// sampleLook so your twin and its after-images draw as The Twins. Loads after samples9.js.

(function () {
  if (typeof SL === 'undefined' || typeof S9_IDS === 'undefined') return;
  const C = id => (typeof SEQ_LOOK !== 'undefined' && SEQ_LOOK[id] && SEQ_LOOK[id].color) || '#cfd8e3';
  const V = { star: '#ffd23f', starDk: '#b8860b', pink: '#ff8fb1', pinkDk: '#c2416b', wrap: '#14111c', lace: '#f6f1ea', sepia: '#d8cbbb', bow: '#16131a' };
  const acid = () => (typeof TYPE_PAL !== 'undefined' ? TYPE_PAL.fire : '#ff2fa8');
  Object.assign(SL, {
    v9_vanguard:  { size: 1,    neck: [-10.5, 0], len: 80, beat: 1,    tw: 2.0 },
    v9_bruiser:   { size: 1.12, neck: [-10.6, 0], len: 62, beat: 0.8,  tw: 2.8 },
    v9_nerd:      { size: 0.96, neck: [-10, 0],   len: 76, beat: 1.1,  tw: 1.8 },
    v9_eggseeker: { size: 1,    neck: [-10.5, 0], len: 78, beat: 1,    tw: 2.0 },
    v9_stealth:   { size: 0.95, neck: [-11, 0],   len: 86, beat: 1.3,  tw: 1.4 },
    v9_pusher:    { size: 1.06, neck: [-10.8, 0], len: 72, beat: 0.9,  tw: 2.2 },
    v9_acid:      { size: 0.94, neck: [-10, 0],   len: 72, beat: 1.35, tw: 2.0 },
    v9_splicer:   { size: 1,    neck: [-11.5, 0], len: 82, beat: 1,    tw: 1.9 },
    v9_reborn:    { size: 1,    neck: [-10.5, 0], len: 76, beat: 0.8,  tw: 1.8 },
    v9_redtail:   { size: 1,    neck: [-10.5, 0.6], len: 76, beat: 1.15, tw: 2.0 },
    v9_twins:     { size: 0.96, neck: [-10.5, 0], len: 78, beat: 0.95, tw: 1.8 },
  });
  Object.assign(SL_SHAPE, {
    v9_vanguard: [1, 7.5, 5], v9_bruiser: [0.5, 8.4, 7], v9_nerd: [1.6, 7.6, 5.8], v9_eggseeker: [1, 7.5, 5.1], v9_stealth: [1.5, 7.6, 4.4],
    v9_pusher: [0.8, 8, 6.2], v9_acid: [1, 6.8, 5.2], v9_splicer: [1, 7.6, 5], v9_reborn: [1, 7.5, 5], v9_redtail: [1, 7.6, 5.4], v9_twins: [1, 7.4, 5],
  });

  // ---------------------------------------------------------------- shared bits
  const ell = slEll;
  const tint = (tag, own) => (tag === SL_HIT ? tag : own); // (the natural family's fluorescent cap: its own v9 colour, red when hit)
  const glowL = (x, y, r, c, a) => { ctx.globalCompositeOperation = 'lighter'; glow(x, y, r, c, a); ctx.globalCompositeOperation = 'source-over'; };
  // A glossy body: fill, a darker rim and a soft top highlight (the engineered and anomaly families).
  function gloss(path, k, a, top, bot, rim, cx, rx, ry) {
    const gr = ctx.createLinearGradient(0, -ry * k, 0, ry * k); gr.addColorStop(0, top); gr.addColorStop(1, bot);
    path(); ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = rim; ctx.lineWidth = 0.8 * k; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.globalAlpha = a; ell((cx + rx * 0.3) * k, -ry * 0.5 * k, rx * 0.36 * k, ry * 0.17 * k, -0.2); ctx.fill();
  }
  function midpiece(k, a, x0, x1, w, c, halo) {
    ctx.strokeStyle = halo || '#ffffff'; ctx.globalAlpha = a * 0.45; ctx.lineWidth = (w + 1.6) * k;
    ctx.beginPath(); ctx.moveTo(x0 * k, 0); ctx.lineTo(x1 * k, 0); ctx.stroke();
    ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = w * k; ctx.stroke();
  }
  // A plain tail with a soft outer edge (rgb colour) and optional halo colour.
  function tail(t, k, a, c, w, rw, halo, ha) {
    ctx.globalAlpha = a * (ha != null ? ha : 0.45); drawTail(t, halo || '#ffffff', (w + 1.7) * k, (rw + 1.6) * k);
    ctx.globalAlpha = a; drawTail(t, c, w * k, rw * k);
  }
  const tw = (t, i) => { const p = t[i], q = t[Math.min(t.length - 1, i + 1)], o = t[Math.max(0, i - 1)]; return [sx(p.x), sy(p.y), Math.atan2(q.y - o.y, q.x - o.x)]; };

  // ---------------------------------------------------------------- tails (screen space; t = body.tailDraw)
  Object.assign(SL_TAIL, {
    v9_vanguard: (t, k, a) => slNatTail(t, k, a, 1.9, 2),
    v9_bruiser: (t, k, a) => slNatTail(t, k, a, 2.6, 3.6),
    v9_nerd: (t, k, a, now) => {
      slNatTail(t, k, a, 1.7, 2);
      // A spark runs down the tail every so often (it carries a charge).
      const ph = (now * 0.7) % 1; if (ph > 0.45) return;
      const i = Math.min(t.length - 1, Math.floor(ph / 0.45 * (t.length - 1))), [px, py] = tw(t, i);
      glowL(px, py, 5 * k, C('nerd'), a * 0.9); glowL(px, py, 1.8 * k, '#ffffff', a);
    },
    v9_eggseeker: (t, k, a, now) => {
      tail(t, k, a, '#c95c80', 1.9, 2.2, '#ffe3ec', 0.6);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 3; i < t.length; i += 3) { const s = Math.max(0, Math.sin(now * 3 + i * 1.3)); if (s > 0.6) glow(sx(t[i].x), sy(t[i].y), 2.2 * k, V.star, a * (s - 0.6) * 2); }
      ctx.globalCompositeOperation = 'source-over';
    },
    v9_stealth: (t, k, a) => { tail(t, k, a * 0.55, 'rgb(28,22,40)', 1.3, 1.8, C('stealth'), 0.35); },
    v9_pusher: (t, k, a) => slNatTail(t, k, a, 2, 2.4),
    v9_acid: (t, k, a, now, B) => {
      slNatTail(t, k, a, 1.8, 2);
      dribble(t, a, k, B, 0.05);
    },
    v9_splicer: (t, k, a) => {
      tail(t, k, a, '#eef7fa', 1.9, 2.4, C('splicer'), 0.55);
      ctx.globalAlpha = a * 0.8; drawTail(t, '#5aa9c4', 0.5 * k, 0.7 * k);
    },
    v9_reborn: (t, k, a, now) => {
      const n = t.length, i0 = Math.floor(n * 0.7);
      tail(t.slice(0, i0 + 1), k, a, 'rgb(96,86,116)', 1.8, 2, C('reborn'), 0.4);
      // The last stretch is threadbare: two thin strands.
      ctx.strokeStyle = 'rgba(120,108,140,0.8)'; ctx.lineWidth = 0.5 * k;
      for (const s of [-1, 1]) { ctx.beginPath(); for (let i = i0; i < n; i++) { const [px, py, an] = tw(t, i), f = (i - i0) / Math.max(1, n - 1 - i0), o = s * 1.6 * k * f + Math.sin(now * 6 + i) * 0.5 * k * f; const X = px - Math.sin(an) * o, Y = py + Math.cos(an) * o; i === i0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y); } ctx.stroke(); }
    },
    v9_redtail: (t, k, a) => {
      const n = t.length, i0 = Math.floor(n * 0.55);
      slNatTail(t.slice(0, i0 + 1), k, a, 1.9, 2.1);
      // The red tail it is named for: the last stretch dyed red and a little ragged.
      const r = t.slice(i0), c = C('redtail');
      ctx.globalAlpha = a * 0.4; drawTail(r, '#ffd0b0', 3 * k, 3.4 * k);
      ctx.globalAlpha = a; drawTail(r, c, 1.9 * k, 1.9 * k);
    },
    v9_twins: (t, k, a) => tail(t, k, a, 'rgb(150,140,128)', 1.7, 2, V.lace, 0.55),
  });

  // Acid dribble: drops leave the given tail points or the head and fall away, fading (Problem Child).
  function dribble(t, a, k, B, rate) {
    if (Math.random() < rate && t.length > 4) { const p = t[1 + Math.floor(Math.random() * 3)]; B.emb.push({ x: p.x, y: p.y, vx: (Math.random() - 0.5) * 14, vy: 8 + Math.random() * 14, l: 0.8 }); }
    const c = acid();
    for (const e of B.emb) { e.l -= 1 / 60; e.x += e.vx / 60; e.y += e.vy / 60; if (e.l <= 0) continue; ctx.globalAlpha = a * Math.min(1, e.l * 1.6) * 0.85; ctx.fillStyle = c; ell(sx(e.x), sy(e.y), 1.1 * k, 1.4 * k); ctx.fill(); }
    if (B.emb.length > 18 || (B.emb[0] && B.emb[0].l <= 0)) B.emb = B.emb.filter(e => e.l > 0).slice(-18);
    ctx.globalAlpha = a;
  }

  // ---------------------------------------------------------------- heads (local frame: +x forward, units of k)
  Object.assign(SL_HEAD, {
    v9_vanguard: (k, a, now, tag) => {
      // Textbook anatomy with a thicker, flatter forehead (it leads with it), then a first-prize rosette at the neck.
      const path = () => { ctx.beginPath(); ctx.moveTo(8.2 * k, -3.2 * k); ctx.quadraticCurveTo(9 * k, 0, 8.2 * k, 3.2 * k); ctx.bezierCurveTo(6 * k, 5.4 * k, -4 * k, 5.4 * k, -6.4 * k, 2 * k); ctx.quadraticCurveTo(-7.2 * k, 0, -6.4 * k, -2 * k); ctx.bezierCurveTo(-4 * k, -5.4 * k, 6 * k, -5.4 * k, 8.2 * k, -3.2 * k); ctx.closePath(); };
      slNatHead(k, a, tint(tag, C('vanguard')), { mid: [[-5, 0], [-10.5, 0]], mw: 2, mito: 4, path, cap: () => slEll(4.2 * k, 0, 4.3 * k, 4.2 * k), band: -2.4 * k, bandR: 4 });
      ctx.strokeStyle = 'rgba(232,246,250,0.9)'; ctx.lineWidth = 1.3 * k; ctx.beginPath(); ctx.moveTo(7.6 * k, -3.6 * k); ctx.quadraticCurveTo(9.3 * k, 0, 7.6 * k, 3.6 * k); ctx.stroke();
      ctx.strokeStyle = 'rgba(20,30,34,0.5)'; ctx.lineWidth = 0.4 * k; ctx.stroke();
      // The rosette: pleated disc, two ribbon tails.
      const rx = -6.6 * k, ry = -4.6 * k, c = C('vanguard');
      ctx.fillStyle = c; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 2.6 * k + s * 0.6 * k, ry - 3.2 * k); ctx.lineTo(rx - 1.2 * k + s * 1 * k, ry - 3.4 * k); ctx.closePath(); ctx.fill(); }
      ctx.beginPath(); for (let i = 0; i < 16; i++) { const an = i / 16 * TAU, r = (i % 2 ? 1.6 : 2.1) * k; ctx.lineTo(rx + Math.cos(an) * r, ry + Math.sin(an) * r); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(10,40,48,0.6)'; ctx.lineWidth = 0.3 * k; ctx.stroke();
      ctx.fillStyle = '#e9fbff'; ell(rx, ry, 0.9 * k, 0.9 * k); ctx.fill();
    },
    v9_bruiser: (k, a, now, tag) => {
      // A double chin hangs at the neck, then the big round head; its rolls jiggle a beat behind it.
      const j = Math.sin(now * 6) * 0.3;
      ctx.fillStyle = MIC.body; ell(-7 * k, 0.6 * k, 3.6 * k, 3.4 * k); ctx.fill(); pcHalo(1.6 * k, 0.6);
      const path = () => slEll(0.5 * k, 0, 8.4 * k, 7 * k);
      slNatHead(k, a, tint(tag, C('bruiser')), { mid: [[-7, 0], [-10.6, 0]], mw: 3.4, mito: 0, path, cap: () => slEll(3.6 * k, 0, 5 * k, 5.6 * k), band: -2.8 * k, bandR: 5.4 });
      ctx.strokeStyle = 'rgba(225,232,228,0.8)'; ctx.lineWidth = 0.75 * k; ctx.beginPath();
      for (const [x0, s] of [[-3.4, 1], [-5.4, 0.8]]) { ctx.moveTo((x0 + j) * k, -6.2 * s * k); ctx.quadraticCurveTo((x0 - 1.4 + j) * k, 0, (x0 + j) * k, 6.2 * s * k); }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ell(2 * k, -4 * k, 4 * k, 1.2 * k, -0.1); ctx.fill();
    },
    v9_nerd: (k, a, now, tag, hit) => {
      // A domed head, big at the front, with the charge glowing in its cap.
      const c = C('nerd'), pulse = 0.6 + 0.4 * Math.sin(now * 5);
      const path = () => { ctx.beginPath(); ctx.moveTo(-5.6 * k, 0); ctx.bezierCurveTo(-5.6 * k, -3.6 * k, -1 * k, -5.8 * k, 3 * k, -5.8 * k); ctx.bezierCurveTo(8.2 * k, -5.8 * k, 9.4 * k, -2 * k, 9.2 * k, 0); ctx.bezierCurveTo(9.4 * k, 2 * k, 8.2 * k, 5.8 * k, 3 * k, 5.8 * k); ctx.bezierCurveTo(-1 * k, 5.8 * k, -5.6 * k, 3.6 * k, -5.6 * k, 0); ctx.closePath(); };
      slNatHead(k, a, hit ? SL_HIT : c, { mid: [[-5, 0], [-10, 0]], mw: 1.8, mito: 0, path, cap: () => slEll(4.4 * k, 0, 4.6 * k, 4.9 * k), band: -2.6 * k, bandR: 4.6 });
      glowL(4.4 * k, 0, 7 * k, c, a * 0.4 * pulse); ctx.globalAlpha = a;
      // Taped spectacles.
      ctx.strokeStyle = 'rgba(20,22,26,0.95)'; ctx.lineWidth = 0.7 * k;
      for (const s of [-1, 1]) { ell(5.4 * k, s * 2.3 * k, 1.8 * k, 1.8 * k); ctx.fillStyle = 'rgba(220,240,255,0.25)'; ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(5.4 * k, -0.5 * k); ctx.lineTo(5.4 * k, 0.5 * k); ctx.stroke();
      ctx.fillStyle = '#f4f1e4'; ctx.fillRect(4.7 * k, -0.7 * k, 1.4 * k, 1.4 * k);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.35 * k; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(5.4 * k, s * 2.3 * k, 1.2 * k, -2.4, -1.5); ctx.stroke(); }
      // A small arc jumps across the dome now and then.
      if (Math.sin(now * 2.3) > 0.7) {
        ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = c; ctx.lineWidth = 0.5 * k; ctx.globalAlpha = a * 0.9; ctx.beginPath();
        const s = Math.sin(now * 11) > 0 ? 1 : -1; let px = -2 * k, py = s * 5.9 * k; ctx.moveTo(px, py);
        for (let i = 1; i <= 5; i++) { px += 1.6 * k; py = s * (5.9 + 1.6 * Math.sin(i * 2.7 + now * 40)) * k; ctx.lineTo(px, py); }
        ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
      }
    },
    v9_eggseeker: (k, a, now, tag, hit) => {
      midpiece(k, a, -4.6, -10.5, 2.2, '#c95c80', '#ffe3ec');
      const path = () => slEll(1 * k, 0, 7.5 * k, 5.1 * k);
      gloss(path, k, a, '#ffb3c9', V.pinkDk, '#a33358', 1, 7.5, 5.1);
      // A heart-shaped cap (it was always the favourite), a gold star sticker, a blush.
      ctx.save(); ctx.translate(3.6 * k, 0); ctx.rotate(-Math.PI / 2); const hs = 3.4 * k;
      ctx.beginPath(); ctx.moveTo(0, hs * 0.9); ctx.bezierCurveTo(-hs * 1.4, -hs * 0.1, -hs * 0.6, -hs * 1.2, 0, -hs * 0.4); ctx.bezierCurveTo(hs * 0.6, -hs * 1.2, hs * 1.4, -hs * 0.1, 0, hs * 0.9);
      ctx.fillStyle = '#ffd6e2'; ctx.globalAlpha = a * 0.9; ctx.fill(); ctx.strokeStyle = 'rgba(194,65,107,0.6)'; ctx.lineWidth = 0.35 * k; ctx.stroke(); ctx.restore();
      ctx.globalAlpha = a;
      ctx.save(); ctx.translate(-1.6 * k, -2.2 * k); ctx.rotate(0.3 + Math.sin(now * 1.5) * 0.05); ctx.beginPath();
      for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + i / 10 * TAU, r = (i % 2 ? 1.05 : 2.4) * k; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
      ctx.closePath(); ctx.fillStyle = V.star; ctx.fill(); ctx.strokeStyle = V.starDk; ctx.lineWidth = 0.35 * k; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ell(-0.5 * k, -0.6 * k, 0.6 * k, 0.35 * k, -0.5); ctx.fill(); ctx.restore();
      ctx.fillStyle = 'rgba(255,90,130,0.35)'; ell(-0.6 * k, 3 * k, 1.8 * k, 0.9 * k); ctx.fill();
      slFlush(path, a, hit);
    },
    v9_stealth: (k, a, now, tag, hit) => {
      // Nearly see-through: a dark middle and a thin bright rim, like a Darkfield ghost.
      const c = C('stealth'), path = () => { ctx.beginPath(); ctx.moveTo(9.4 * k, 0); ctx.bezierCurveTo(6 * k, -4.6 * k, -3 * k, -4.6 * k, -5.8 * k, -1.6 * k); ctx.quadraticCurveTo(-6.6 * k, 0, -5.8 * k, 1.6 * k); ctx.bezierCurveTo(-3 * k, 4.6 * k, 6 * k, 4.6 * k, 9.4 * k, 0); ctx.closePath(); };
      ctx.globalAlpha = a * 0.5; midpiece(k, a * 0.6, -5, -11, 1.6, 'rgb(34,26,48)', c);
      ctx.globalAlpha = a * 0.62; path(); ctx.fillStyle = 'rgb(22,16,32)'; ctx.fill();
      ctx.globalAlpha = a * 0.85; ctx.strokeStyle = c; ctx.lineWidth = 0.55 * k; ctx.stroke();
      // The head wrap, and its two ties streaming back.
      ctx.globalAlpha = a; ctx.save(); path(); ctx.clip(); ctx.fillStyle = V.wrap; ctx.fillRect(1.2 * k, -6 * k, 2.6 * k, 12 * k);
      ctx.strokeStyle = 'rgba(199,125,255,0.45)'; ctx.lineWidth = 0.3 * k; ctx.beginPath(); ctx.moveTo(1.5 * k, -6 * k); ctx.lineTo(1.5 * k, 6 * k); ctx.moveTo(3.5 * k, -6 * k); ctx.lineTo(3.5 * k, 6 * k); ctx.stroke(); ctx.restore();
      ctx.fillStyle = V.wrap;
      for (const s of [-1, 1]) {
        const w = Math.sin(now * 9 + s) * 1.2;
        ctx.beginPath(); ctx.moveTo(1.6 * k, s * 3.4 * k); ctx.quadraticCurveTo(-3 * k, s * (4.4 + w * 0.6) * k, -8.5 * k, s * (2.6 + w) * k); ctx.quadraticCurveTo(-3 * k, s * (3.6 + w * 0.3) * k, 2.4 * k, s * 2.6 * k); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ell(5.6 * k, -2 * k, 2 * k, 0.5 * k, -0.15); ctx.fill();
      slFlush(path, a, hit);
    },
    v9_pusher: (k, a, now, tag) => {
      // Plump and translucent: the cell body is lighter than the others, so you can see what it has eaten.
      const path = () => slEll(0.8 * k, 0, 8 * k, 6.2 * k);
      slNatHead(k, a, tint(tag, C('pusher')), { mid: [[-5.6, 0], [-10.8, 0]], mw: 2.4, mito: 0, path, cap: () => slEll(4.6 * k, 0, 3.8 * k, 4.4 * k), band: -3.4 * k, bandR: 5 });
      ctx.save(); path(); ctx.clip();
      for (let i = 0; i < 4; i++) {
        const vx = (-2 + i * 1.6 + Math.sin(now * 0.7 + i * 2) * 0.9) * k, vy = (Math.cos(i * 2.4) * 2.8 + Math.sin(now * 0.9 + i) * 0.6) * k, r = (1.1 + (i % 2) * 0.5) * k;
        ell(vx, vy, r, r); ctx.fillStyle = 'rgba(150,160,150,0.55)'; ctx.fill(); ctx.strokeStyle = 'rgba(235,240,236,0.6)'; ctx.lineWidth = 0.35 * k; ctx.stroke();
        ctx.fillStyle = 'rgba(40,46,40,0.8)'; ell(vx + 0.3 * k, vy - 0.2 * k, r * 0.35, r * 0.3); ctx.fill();
      }
      ctx.restore();
      // Crumbs, and rod bacteria stuck to the outside, wriggling (it has not washed its hands).
      ctx.fillStyle = '#c9a66b'; for (const [cx, cy, r] of [[6.4, 4.6, 0.7], [-3.2, -6.2, 0.55], [2, 6.4, 0.45]]) { ell(cx * k, cy * k, r * k, r * 0.8 * k, cx); ctx.fill(); }
      const g = C('pusher');
      for (const [an, l] of [[-1.1, 2.6], [2.2, 2.2], [0.9, 2.4], [-2.5, 2]]) {
        const w = Math.sin(now * 7 + an * 3) * 0.25, ex = (0.8 + Math.cos(an) * 8.2) * k, ey = Math.sin(an) * 6.4 * k;
        ctx.save(); ctx.translate(ex, ey); ctx.rotate(an + Math.PI / 2 + w);
        ctx.fillStyle = g; ctx.globalAlpha = a * 0.9; ctx.beginPath(); ctx.roundRect(-l / 2 * k, -0.55 * k, l * k, 1.1 * k, 0.55 * k); ctx.fill();
        ctx.strokeStyle = 'rgba(30,60,10,0.7)'; ctx.lineWidth = 0.3 * k; ctx.stroke(); ctx.restore();
      }
      ctx.globalAlpha = a;
    },
    v9_acid: (k, a, now, tag, hit) => {
      // A scrunched, flushed head (mid-tantrum), a dummy plugged in the front, Acid round the mouth of it.
      const c = acid(), sh = 1 + Math.sin(now * 14) * 0.03;
      midpiece(k, a, -4.2, -10, 2, 'rgb(70,48,60)');
      const path = () => { ctx.beginPath(); ctx.moveTo(7.8 * k, -2 * k); ctx.quadraticCurveTo(7 * k, -4.4 * k * sh, 2 * k, -5.2 * k * sh); ctx.bezierCurveTo(-3 * k, -5.6 * k, -6 * k, -3 * k, -5.8 * k, 0); ctx.bezierCurveTo(-6 * k, 3 * k, -3 * k, 5.6 * k, 2 * k, 5.2 * k * sh); ctx.quadraticCurveTo(7 * k, 4.4 * k * sh, 7.8 * k, 2 * k); ctx.quadraticCurveTo(7.2 * k, 0, 7.8 * k, -2 * k); ctx.closePath(); };
      gloss(path, k, a, '#f3d6e0', '#c98aa2', '#8a3a5a', 1, 6.8, 5.2);
      ctx.fillStyle = c; ctx.globalAlpha = a * 0.35; ell(-0.5 * k, 3.4 * k, 2 * k, 1 * k); ctx.fill(); ell(-0.5 * k, -3.4 * k, 2 * k, 1 * k); ctx.fill(); ctx.globalAlpha = a;
      ctx.strokeStyle = 'rgba(110,40,70,0.7)'; ctx.lineWidth = 0.45 * k; ctx.beginPath(); // (the scrunch lines)
      for (const s of [-1, 1]) { ctx.moveTo(3.2 * k, s * 1.4 * k); ctx.lineTo(4.6 * k, s * 2.6 * k); ctx.moveTo(2.2 * k, s * 1.8 * k); ctx.lineTo(3 * k, s * 3.2 * k); }
      ctx.stroke();
      // The dummy: a shield across the front and a ring handle.
      ctx.fillStyle = c; ctx.globalAlpha = a * 0.55; ell(8.4 * k, 0, 1.2 * k, 2.6 * k); ctx.fill(); ctx.globalAlpha = a; // (the acid round it)
      ctx.fillStyle = '#7fd6ff'; ctx.strokeStyle = '#2e6f8e'; ctx.lineWidth = 0.4 * k; ctx.beginPath(); ctx.roundRect(8.2 * k, -3 * k, 1.5 * k, 6 * k, 0.7 * k); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#f2f6ff'; ctx.lineWidth = 0.8 * k; ctx.beginPath(); ctx.arc(11.2 * k, 0, 1.6 * k, 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#2e6f8e'; ctx.lineWidth = 0.3 * k; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = a * 0.6; ell(8.9 * k, -1.6 * k, 0.35 * k, 0.9 * k); ctx.fill(); ctx.globalAlpha = a;
      slFlush(path, a, hit);
    },
    v9_splicer: (k, a, now, tag, hit) => {
      // Barcode label wrapped round the neck.
      ctx.fillStyle = '#f7f9fb'; ctx.fillRect(-11.5 * k, -1.5 * k, 6.4 * k, 3 * k); ctx.strokeStyle = 'rgba(80,110,124,0.6)'; ctx.lineWidth = 0.3 * k; ctx.strokeRect(-11.5 * k, -1.5 * k, 6.4 * k, 3 * k);
      ctx.fillStyle = '#1b2228'; let bx = -11;
      for (const w of [0.3, 0.15, 0.45, 0.15, 0.3, 0.6, 0.15, 0.3, 0.15, 0.45, 0.3]) { ctx.fillRect(bx * k, -1.1 * k, w * k, 2.2 * k); bx += w + 0.22; }
      // Frosted porcelain head with a double helix turning inside it.
      const path = () => slEll(1 * k, 0, 7.6 * k, 5 * k), c = C('splicer');
      const gr = ctx.createRadialGradient(2.5 * k, -1.6 * k, 0, 1 * k, 0, 8 * k); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#e3f3f8'); gr.addColorStop(1, '#a9d4e2');
      path(); ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = '#6aa6bb'; ctx.lineWidth = 0.7 * k; ctx.stroke();
      ctx.save(); path(); ctx.clip(); ctx.lineWidth = 0.55 * k;
      for (const ph of [0, Math.PI]) { ctx.strokeStyle = ph ? '#3b8fb0' : c; ctx.beginPath(); for (let i = 0; i <= 24; i++) { const xx = -5 + i * 0.52, yy = Math.sin(xx * 0.9 - now * 3 + ph) * 2.6; i ? ctx.lineTo(xx * k, yy * k) : ctx.moveTo(xx * k, yy * k); } ctx.stroke(); }
      ctx.strokeStyle = 'rgba(59,143,176,0.55)'; ctx.lineWidth = 0.35 * k; ctx.beginPath();
      for (let xx = -4.6; xx < 7; xx += 1.1) { const y1 = Math.sin(xx * 0.9 - now * 3) * 2.6; ctx.moveTo(xx * k, y1 * k); ctx.lineTo(xx * k, -y1 * k); }
      ctx.stroke(); ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ell(4 * k, -2.6 * k, 2.4 * k, 0.7 * k, -0.2); ctx.fill();
      slFlush(path, a, hit);
    },
    v9_reborn: (k, a, now, tag, hit) => {
      midpiece(k, a, -4.8, -10.5, 2, 'rgb(96,86,116)', C('reborn'));
      const path = () => slEll(1 * k, 0, 7.5 * k, 5 * k);
      gloss(path, k, a, '#e6dcf5', '#9d8bb8', '#6b5a86', 1, 7.5, 5);
      // Wrinkles at the back, a stitched scar across the front (it has died here before).
      ctx.strokeStyle = 'rgba(90,72,116,0.6)'; ctx.lineWidth = 0.4 * k; ctx.beginPath();
      for (const x0 of [-3.4, -4.6, -5.6]) { ctx.moveTo(x0 * k, -3.2 * k); ctx.quadraticCurveTo((x0 - 0.8) * k, 0, x0 * k, 3.2 * k); }
      ctx.stroke();
      ctx.strokeStyle = '#4a3a62'; ctx.lineWidth = 0.45 * k; ctx.beginPath(); ctx.moveTo(1.6 * k, -4.4 * k); ctx.quadraticCurveTo(4.8 * k, -0.6 * k, 3.2 * k, 3.8 * k);
      for (let i = 0; i < 4; i++) { const f = (i + 0.5) / 4, px = (1.6 + (3.2 - 1.6) * f + Math.sin(f * Math.PI) * 2) * k, py = (-4.4 + 8.2 * f) * k; ctx.moveTo(px - 0.9 * k, py - 0.4 * k); ctx.lineTo(px + 0.9 * k, py + 0.4 * k); }
      ctx.stroke();
      slFlush(path, a, hit);
    },
    v9_redtail: (k, a, now, tag) => {
      // Lopsided (one side bigger), a monobrow across the front, a straw in it.
      const path = () => { ctx.beginPath(); ctx.moveTo(8.4 * k, -0.6 * k); ctx.bezierCurveTo(7.6 * k, -5.2 * k, -3.6 * k, -5.8 * k, -6 * k, -1.6 * k); ctx.quadraticCurveTo(-6.8 * k, 0.6 * k, -5.4 * k, 2.4 * k); ctx.bezierCurveTo(-3 * k, 5 * k, 7.4 * k, 4.4 * k, 8.4 * k, -0.6 * k); ctx.closePath(); };
      slNatHead(k, a, tint(tag, C('redtail')), { mid: [[-5, 0.4], [-10.5, 0.6]], mw: 2, mito: 0, path, cap: () => slEll(3.8 * k, -0.6 * k, 4.2 * k, 4 * k), band: -2.4 * k, bandR: 4.2 });
      ctx.save(); ctx.translate(Math.sin(now * 3) * 0.15 * k, 0);
      ctx.strokeStyle = 'rgba(28,20,14,0.95)'; ctx.lineWidth = 0.45 * k; ctx.beginPath();
      for (let i = 0; i <= 16; i++) { const f = i / 16, yy = -4 + 8 * f, xx = 4.6 + Math.sin(f * Math.PI) * 2.2, h = 1.6 * (0.6 + 0.4 * Math.sin(f * Math.PI)), tl = (i % 3 - 1) * 0.5; ctx.moveTo((xx - h * 0.4) * k, (yy - tl) * k); ctx.lineTo((xx + h * 0.6) * k, (yy + tl) * k); }
      ctx.stroke(); ctx.restore();
      const bob = Math.sin(now * 4) * 0.12;
      ctx.save(); ctx.translate(8 * k, 1 * k); ctx.rotate(0.35 + bob);
      ctx.strokeStyle = '#d9b44a'; ctx.lineWidth = 0.7 * k; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7 * k, 0); ctx.stroke();
      ctx.strokeStyle = '#a07e26'; ctx.lineWidth = 0.35 * k; ctx.beginPath(); ctx.moveTo(6.2 * k, 0); ctx.lineTo(7.6 * k, -0.9 * k); ctx.moveTo(6.6 * k, 0); ctx.lineTo(7.8 * k, 0.6 * k); ctx.stroke(); ctx.restore();
    },
    v9_twins: (k, a, now, tag, hit) => {
      // Sepia-pale, like an old photograph, with a lace ruff at the neck and a black bow.
      midpiece(k, a, -4.8, -10.5, 1.9, 'rgb(150,140,128)', V.lace);
      ctx.fillStyle = V.lace; ctx.strokeStyle = 'rgba(140,128,116,0.8)'; ctx.lineWidth = 0.3 * k;
      for (const sd of [-1, 1]) for (let i = 0; i < 9; i++) { const an = sd * (Math.PI * 0.55 + i / 8 * Math.PI * 0.9); ell(-6 * k + Math.cos(an) * 2.4 * k, Math.sin(an) * 4.4 * k, 1.3 * k, 1.3 * k); ctx.fill(); ctx.stroke(); }
      const path = () => slEll(1 * k, 0, 7.4 * k, 5 * k);
      gloss(path, k, a, '#efe6da', V.sepia, '#8f8170', 1, 7.4, 5);
      ctx.save(); path(); ctx.clip(); const vg = ctx.createRadialGradient(1 * k, 0, 2 * k, 1 * k, 0, 8 * k); vg.addColorStop(0, 'rgba(120,96,70,0)'); vg.addColorStop(1, 'rgba(120,96,70,0.4)'); ctx.fillStyle = vg; ctx.fillRect(-7 * k, -6 * k, 16 * k, 12 * k); ctx.restore();
      ctx.save(); ctx.translate(-2.6 * k, -4.8 * k); ctx.rotate(-0.2); ctx.fillStyle = V.bow;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 3.2 * k, -2.8 * k, s * 3.8 * k, -0.2 * k); ctx.quadraticCurveTo(s * 3 * k, 1.8 * k, 0, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, 0.4 * k); ctx.lineTo(s * 1.6 * k, 3 * k); ctx.lineTo(s * 0.6 * k, 3.2 * k); ctx.closePath(); ctx.fill(); }
      ell(0, 0, 0.9 * k, 0.8 * k); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.3 * k; ctx.beginPath(); ctx.moveTo(-2.8 * k, -1.2 * k); ctx.quadraticCurveTo(-1.6 * k, -2 * k, -0.8 * k, -0.6 * k); ctx.moveTo(2.8 * k, -1.2 * k); ctx.quadraticCurveTo(1.6 * k, -2 * k, 0.8 * k, -0.6 * k); ctx.stroke(); ctx.restore();
      slFlush(path, a, hit);
    },
  });

  // ---------------------------------------------------------------- behind and above (screen space)
  Object.assign(SL_UNDER, {
    v9_stealth: (x, y, face, k, a) => { glowL(x, y, 18 * k, C('stealth'), a * 0.12); ctx.globalAlpha = a; },
    v9_reborn: (x, y, face, k, a, now, B, body) => {
      // Its soul drifts half out of it and back, on a slow cycle.
      const ph = Math.max(0, Math.sin(now * 0.8)), o = ph * 5 * k, [hx, hy] = slAt(x, y, face, k, 1 - ph * 2, 0);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * 0.25 * (0.3 + ph); ctx.fillStyle = C('reborn');
      ell(hx, hy - o, 7.5 * k, 5 * k, face); ctx.fill(); glow(hx, hy - o, 10 * k, C('reborn'), a * 0.2 * ph);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
    },
  });
  Object.assign(SL_OVER, {
    v9_eggseeker: (x, y, face, k, a, now) => {
      // The odd twinkle round it.
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) { const ph = (now * 0.5 + i / 3) % 1, an = i * 2.1 + Math.floor(now * 0.5 + i / 3) * 1.7, r = 11 * k, s = Math.sin(ph * Math.PI); if (s < 0.2) continue;
        const px = x + Math.cos(an) * r, py = y + Math.sin(an) * r * 0.8; ctx.globalAlpha = a * s; ctx.strokeStyle = '#fff2c4'; ctx.lineWidth = 0.5 * k;
        ctx.beginPath(); ctx.moveTo(px - 1.6 * s * k, py); ctx.lineTo(px + 1.6 * s * k, py); ctx.moveTo(px, py - 1.6 * s * k); ctx.lineTo(px, py + 1.6 * s * k); ctx.stroke(); glow(px, py, 2.2 * k, V.star, a * s * 0.6); }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
    },
    v9_acid: (x, y, face, k, a, now, B, body) => { // (a drip off the dummy now and then)
      if (Math.random() < 0.06) { const [px, py] = slAt(x, y, face, k, 9.6, 2.4); B.emb.push({ x: body.x + (px - x) / S, y: body.y + (py - y) / S, vx: (Math.random() - 0.5) * 8, vy: 12, l: 0.7 }); }
    },
  });

  // ---------------------------------------------------------------- your twin draws as one of The Twins
  const sl = sampleLook;
  sampleLook = function (x, y, face, tag, alpha, scale, body) {
    const twin = G && G.s10 && G.s10.id === 'v9_twins' && typeof TWINS !== 'undefined';
    if (twin && body && body === G.twin) { slDraw('v9_twins', x, y, face, tag, alpha, scale, body, G.realT); return true; }
    if (twin && !body && tag === TWINS.color) { // (its after-images: a head only)
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(face || 0); SL_HEAD.v9_twins(S * (scale || 1) * SL.v9_twins.size, alpha, G.realT, tag, false, {}); ctx.restore(); ctx.globalAlpha = 1; return true;
    }
    return sl.apply(this, arguments);
  };
})();
