'use strict';
// Spawn Prawn - mutations come from elites (Lateral Gene Transfer, reused from junk.js).
//  - Mutation cards (mutations.js, ids m_/w_/t_/x_/r_) are no longer dealt in level-up or DNA strand drafts.
//  - An elite has MUTDROP.chance to carry one: the junk DNA double helix circles it, with a beacon, a countdown and
//    arrows pointing the way. Kill it within MUTDROP.life seconds and it drops the strand: a helix labelled with the
//    MUTATION strand. Swim into it and the mutation screen opens: three you can take right now, pick one
//    (boxlook.js draws your sperm and stats above them). It decays after MUTDROP.dropLife seconds. A carrier that
//    times out sheds it.
//  - Catalysts, Concentrations and defences stay in the draft.
// Hooks: game.js killEnemy -> mdKill; v10.js v10Tick -> mdTick, v10Draw -> mdDraw; draft.js draftCards -> mdDraftSkip.

const MUTDROP = { chance: 0.6, life: 40, dropLife: 20, maxCarriers: 2, col: '#e9f5db' };
const mdIsMut = c => /^[mwtxr]_/.test(c.id) && (c.slot === 'genome' || c.slot === 'weaponmut');
const mdDraftSkip = c => mdIsMut(c); // (draft.js: mutations only come from elites)
const mdS = () => G.md || (G.md = { drops: [] });

// The mutations you could take right now (none if the Genome and every weapon are full).
const mdOk = () => (typeof CARDS === 'undefined' ? [] : CARDS.filter(c => mdIsMut(c) && cardOk(c)));
// The mutation screen's cards (draft.js draftLoot, kind 'mutation').
function mdCards(n) { return shuffle(mdOk()).slice(0, n).map(c => Object.assign(cardOpt(c), { mdTaken: 1 })); }

function mdTick(dt) {
  if (!G || G.state !== 'play' || !G.player) return;
  const S = mdS(), p = G.player;
  let carriers = 0;
  for (const e of G.enemies) {
    if (!e.elite || e.boss || e.dead || e.charmed) continue;
    if (e.mdRoll == null) { // decided once per elite
      e.mdRoll = carriers < MUTDROP.maxCarriers && G.enemies.filter(o => o.mdCarry && !o.dead).length < MUTDROP.maxCarriers && Math.random() < MUTDROP.chance;
      if (e.mdRoll) { e.mdCarry = true; e.mdT = G.t; e.mdPing = G.realT; banner('MUTATION CARRIER!', MUTDROP.col); sfx('level'); vibrate(40); }
    }
    if (e.mdCarry && G.t - e.mdT > MUTDROP.life) { e.mdCarry = false; floatText(e.x, e.y - e.r - 14, 'MUTATION LOST', XR.dim, 12, 0.9); }
    if (e.mdCarry) carriers++;
  }
  for (const d of S.drops) {
    d.life -= dt; d.bob += dt * 4;
    const dx = p.x - d.x, dy = p.y - d.y, dist = Math.hypot(dx, dy) || 1;
    if (d.life <= 0) { d.dead = true; floatText(d.x, d.y - 20, 'MUTATION DECAYED', XR.dim, 12, 0.9); continue; }
    if (dist < 110) { d.x += dx / dist * 170 * dt; d.y += dy / dist * 170 * dt; }
    if (dist < p.r + 20) { d.dead = true; mdAbsorb(d); }
  }
  compactArr(S.drops, d => !d.dead);
}

function mdKill(e) {
  if (!e.mdCarry || e.charmed) return;
  e.mdCarry = false;
  if (!mdOk().length) { floatText(e.x, e.y - e.r - 12, 'NO ROOM FOR A MUTATION', XR.dim, 12, 1); return; }
  mdS().drops.push({ x: e.x, y: e.y, life: MUTDROP.dropLife, bob: Math.random() * TAU });
  ring(e.x, e.y, 50, MUTDROP.col, 0.4, 3); floatText(e.x, e.y - e.r - 12, 'MUTATION DROPPED', MUTDROP.col, 13, 1);
}

function mdAbsorb(d) {
  const p = G.player;
  if (!mdOk().length) { floatText(p.x, p.y - 40, 'NO ROOM FOR A MUTATION', XR.dim, 12, 1.4); return; } // (filled up since it dropped)
  fxParts('drop', d.x, d.y, MUTDROP.col, 16, 240, 0.6, 4); ring(d.x, d.y, 70, MUTDROP.col, 0.4, 4); ring(p.x, p.y, 50, MUTDROP.col, 0.5, 3);
  sfx('pickup'); vibrate(60);
  G.lootQueue.unshift({ kind: 'mutation' }); // (opens at once: draft.js draftBox)
  if (G.stats) G.stats.mutDrops = (G.stats.mutDrops || 0) + 1;
}

// ---------------------------------------------------------------- drawing (junk.js's helix, beacon and arrows)
function mdHelix(x, y, R, t, col) {
  ctx.lineWidth = 2.2; ctx.strokeStyle = col;
  for (const ph of [0, Math.PI]) {
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) { const u = i / 16 * 2 - 1, X = x + Math.sin(u * Math.PI * 1.5 + t * 4 + ph) * R * 0.55, Y = y + u * R; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    ctx.stroke();
  }
  ctx.lineWidth = 1.2; ctx.beginPath();
  for (let i = 0; i < 5; i++) { const u = (i + 0.5) / 5 * 2 - 1, s = Math.sin(u * Math.PI * 1.5 + t * 4) * R * 0.55; ctx.moveTo(x - s, y + u * R); ctx.lineTo(x + s, y + u * R); }
  ctx.stroke();
}
const mdLabel = (txt, x, y, size) => { ctx.font = `900 ${size}px monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000000'; ctx.fillStyle = MUTDROP.col; ctx.strokeText(txt, x, y); ctx.fillText(txt, x, y); };
function mdDraw() {
  if (!G || !G.player) return;
  const t = G.realT, D = mdS(), p = G.player, col = MUTDROP.col;
  ctx.save();
  for (const d of D.drops) { // the dropped strand, labelled with what it holds
    const x = sx(d.x), y = sy(d.y) + Math.sin(d.bob) * 4, R = 13 * Math.max(1, S_() * 0.8);
    if (x < -40 || x > W + 40 || y < -40 || y > H + 40) continue;
    ctx.globalAlpha = d.life < 5 && Math.floor(t * 6) % 2 ? 0.35 : 1;
    ctx.globalCompositeOperation = 'lighter'; glow(x, y, R * 2.4, col, 0.55); ctx.globalCompositeOperation = 'source-over';
    mdHelix(x, y, R, t, '#ffffff');
    mdLabel('MUTATION', x, y - R - 8, 10);
  }
  for (const e of G.enemies) { // carriers: the helix wound round them, a ping, a beacon with its countdown
    if (!e.mdCarry || e.dead) continue;
    const left = MUTDROP.life - (G.t - e.mdT), x = sx(e.x), y = sy(e.y), R = e.r * S + 12;
    ctx.globalAlpha = left < 6 && Math.floor(t * 6) % 2 ? 0.35 : 1;
    ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff';
    for (const ph of [0, Math.PI]) {
      ctx.beginPath();
      for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU + t * 1.2, rr = R + Math.sin(a * 4 + t * 4 + ph) * 5; i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      ctx.stroke();
    }
    const pk = (t - (e.mdPing || -9)) / 1.6;
    if (pk >= 0 && pk < 1) for (let q = 0; q < 3; q++) { const f = pk * 1.6 - q * 0.25; if (f <= 0 || f >= 1) continue; ctx.globalAlpha = 1 - f; ctx.lineWidth = 4 * (1 - f) + 1; ctx.beginPath(); ctx.arc(x, y, R + f * 90, 0, TAU); ctx.stroke(); }
    const by = y - R - 18 - Math.abs(Math.sin(t * 4)) * 8;
    ctx.globalAlpha = 1; junkArrow(x, by, Math.PI / 2, 11, 1);
    mdLabel('KILL FOR A MUTATION ' + Math.ceil(left) + 's', x, by - 16, 12);
    const dW = Math.hypot(e.x - p.x, e.y - p.y), a = Math.atan2(e.y - p.y, e.x - p.x), px = sx(p.x), py = sy(p.y);
    if (dW > 120) for (let q = 0; q < 3; q++) { const ph = (t * 1.8 + q / 3) % 1, rr = 44 * Math.max(1, S * 0.6) + ph * 34; junkArrow(px + Math.cos(a) * rr, py + Math.sin(a) * rr, a, 9, Math.sin(ph * Math.PI)); }
    if (x < 0 || x > W || y < 0 || y > H) { // off screen: a big arrow at the edge
      const cx = W / 2, cy = H / 2, ea = Math.atan2(y - cy, x - cx), m = 34, kk = Math.min((W / 2 - m) / Math.abs(Math.cos(ea) || 1e-6), (H / 2 - m) / Math.abs(Math.sin(ea) || 1e-6));
      const ex = cx + Math.cos(ea) * (kk + Math.sin(t * 6) * 5), ey = cy + Math.sin(ea) * (kk + Math.sin(t * 6) * 5);
      ctx.globalCompositeOperation = 'lighter'; glow(ex, ey, 50, col, 0.6 + 0.3 * Math.sin(t * 5)); ctx.globalCompositeOperation = 'source-over';
      junkArrow(ex, ey, ea, 17, 1);
    }
  }
  ctx.restore();
}
