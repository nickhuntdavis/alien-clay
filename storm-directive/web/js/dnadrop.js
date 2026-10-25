'use strict';
// Spawn Prawn - DNA drops: the scientist pipettes your level-up DNA onto the slide (user, 25 Oct). Builds on levelbox.js.
//  - A level-up no longer lands at your feet: a pipette comes down from above and drips it DNADROP.min to .max away,
//    inside the dish, off terrain and boss hazards. In a campaign level it is a floor cell DNADROP.cellLo to .cellHi
//    cells away by the route to you (dPl), preferring cells you can see and cells further along the way to the exit.
//  - One drop on the slide at a time. Further level-ups drip onto the same drop and add to its count; swimming into it
//    opens every screen it holds, back to back (levelbox.js's now: no wave-break hold, no Reward Director gap).
//  - Boss fights: drops still come, but land nearer (DNADROP.bossMin/Max, 2 to 4 cells in a level), and autorun only
//    goes for one when the way there is not in trouble (arRisk). The screen pauses the fight, so it is a breather.
//  - Autorun goes for a drop before any other pickup (the others pull at DNADROP.others of their usual weight). In a
//    level it only steers to a drop it can see (lvSight), as for other pickups: it does not solve the maze.
//  - Off screen: junk.js's outlined chevron (gold here) at the screen edge with the distance, and three small ones
//    circling you, as for junk DNA and mutation carriers. Black outline, so it reads on pale and dark slides.
//  - The level-up screen gets a note from the scientist (DD_NOTES), picked by the moment: low health, a boss, a stack.
//  - Tests and sims keep level-ups as screens (window.TUT_OFF) unless LVBOX.force, as levelbox.js does.
// Hooks: none in shared files. Replaces levelbox.js lvboxTick and lvboxSpot; wraps applyPickup (outside levelbox.js's),
// autorun.js arPickups, v10Draw and UI.openLoot; hookOn('tick', 'ddTick'). Adds TUT_CARDS.dnadrop. Loads after levelbox.js.

const DNADROP = { min: 300, max: 560, bossMin: 160, bossMax: 320, cellLo: 4, cellHi: 8, fall: 1.3, land: 0.72, pull: 2, others: 0.4, col: '#ffd23f' };
const DD_COPY = { label: 'TODO_COPY:dnadrop_label', head: 'Note from the scientist' };
// The scientist's notes on the level-up screen, by moment (the first that applies). Lines by the user.
const DD_NOTES = {
  low: ['Subject is faltering. Applying evolutionary pressure now.'],
  boss: ['TODO_COPY:sci_note_boss'],
  stack: ['TODO_COPY:sci_note_stack'],
  well: ['TODO_COPY:sci_note_thriving'],
  any: ['Now administering agents 14, 17 and 23b. Let\'s see what will happen…'],
};
const ddS = () => G.dd || (G.dd = { fall: null, show: [] });
const ddBoss = () => !!(G.boss && !G.boss.dead);
const ddBox = () => G.pickups.find(u => u.type === 'lvbox' && !u.dead && u.src && u.src.reqs);
const ddTarget = () => ddBox() || (G.dd && G.dd.fall);
const ddCount = () => { const b = ddBox(), f = G.dd && G.dd.fall; return (b ? b.src.reqs.length : 0) + (f ? f.reqs.length : 0); };

// Where the pipette drips: reachable, some way off, never in a wall or a hazard.
lvboxSpot = function () {
  const p = G.player, boss = ddBoss();
  if (G.lvl) { const c = ddCell(boss); if (c) return c; }
  const lo = boss ? DNADROP.bossMin : DNADROP.min, hi = boss ? DNADROP.bossMax : DNADROP.max;
  const c = G.core || { x: 0, y: 0 }, R = (CORE.arena || 2400) - 160;
  for (let i = 0; i < 48; i++) {
    const a = Math.random() * TAU, d = rand(lo, hi) * (i < 32 ? 1 : 0.6);
    let x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d;
    const dc = Math.hypot(x - c.x, y - c.y); if (dc > R) { x = c.x + (x - c.x) / dc * R; y = c.y + (y - c.y) / dc * R; }
    if (G.lvl && lvSolidAt(x, y)) continue;
    if (!G.lvl && Math.hypot(x - c.x, y - c.y) < CORE.r + 90) continue; // (not on the egg)
    if (typeof terrainDanger === 'function' && terrainDanger(x, y, 50)) continue;
    if (G.hazards && G.hazards.length && typeof hazardDanger === 'function' && hazardDanger(x, y, 30) > 0) continue;
    return { x, y };
  }
  return { x: p.x, y: p.y };
};
// A campaign level: a floor cell lo to hi cells away by the route to you, seen and further along scoring higher.
function ddCell(boss) {
  const V = G.lvl, p = G.player, i0 = lvIdx(p.x, p.y), myEx = i0 >= 0 && V.dEx[i0] >= 0 ? V.dEx[i0] : 1e9;
  const lo = boss ? 2 : DNADROP.cellLo, hi = boss ? 4 : DNADROP.cellHi;
  let best = null, bs = -1;
  for (let i = 0; i < V.grid.length; i++) {
    const d = V.dPl[i];
    if (d < lo || d > hi || V.grid[i] !== LV_T.floor || V.scrap[i]) continue;
    const c = lvCentre(i);
    if (V.cavity && Math.hypot(c.x - V.cavity.x, c.y - V.cavity.y) < LV_C) continue;
    if (typeof terrainDanger === 'function' && terrainDanger(c.x, c.y, 40)) continue;
    const s = Math.random() + (lvSight(p.x, p.y, c.x, c.y) ? 2 : 0) + (V.dEx[i] >= 0 && V.dEx[i] < myEx ? 1 : 0);
    if (s > bs) { bs = s; best = c; }
  }
  return best;
}

// Each frame: level requests become a drop (or join the one already there).
lvboxTick = function () {
  if (!lvboxOn() || G.state !== 'play') return;
  const D = ddS();
  for (let i = 0; i < G.lootQueue.length; i++) {
    const q = G.lootQueue[i];
    if (q.kind !== 'level' || q.mstone || q.lvbox) continue;
    G.lootQueue.splice(i--, 1);
    G.stats.ddLv = (G.stats.ddLv || 0) + 1;
    const b = ddBox();
    if (D.fall) D.fall.reqs.push(q);
    else if (b) { b.src.reqs.push(q); D.show.push({ x: b.x, y: b.y, t: 0 }); } // (a top-up: just the pipette, dripping onto it)
    else { const s = lvboxSpot(); D.fall = { x: s.x, y: s.y, t: 0, reqs: [q] }; D.show.push({ x: s.x, y: s.y, t: 0 }); sfx('level'); }
  }
};
function ddTick(dt) {
  if (!G || !G.dd || G.state !== 'play') return;
  const D = G.dd, f = D.fall;
  for (const s of D.show) s.t += dt;
  compactArr(D.show, s => s.t < DNADROP.fall);
  if (f && (f.t += dt) >= DNADROP.fall * DNADROP.land) { // (the drip lands)
    D.fall = null;
    const u = makePickup('lvbox', f.x, f.y, { req: f.reqs[0], reqs: f.reqs }); u.life = 1e9; G.pickups.push(u);
    ring(u.x, u.y, 46, DNADROP.col, 0.5, 4); fxParts('drop', u.x, u.y, DNADROP.col, 12, 160, 0.5, 3); sfx('gem');
    G.stats.ddDrops = (G.stats.ddDrops || 0) + 1;
    if (typeof tutShow === 'function') tutShow('dnadrop', true);
  }
}
hookOn('tick', 'ddTick', dt => ddTick(dt));

// Swimming into a drop: every screen it holds, straight away.
applyPickup = (orig => function (type, src) {
  if (type !== 'lvbox' || !src || !src.reqs) return orig(type, src);
  G.stats.pickups = (G.stats.pickups || 0) + 1; sfx('pickup');
  G.lootQueue.unshift(...src.reqs.map(q => Object.assign({}, q, { lvbox: true, now: true })));
  G.stats.ddGot = (G.stats.ddGot || 0) + src.reqs.length;
})(applyPickup);

// Autorun: the drop first. Other pickups and XP still pull, more weakly.
arPickups = (orig => function (p, mode, goal) {
  const t = ddTarget();
  if (!t) return orig(p, mode, goal);
  const d = Math.hypot(t.x - p.x, t.y - p.y), boss = ddBoss();
  let go = !G.lvl || (d < 900 && lvSight(p.x, p.y, t.x, t.y));
  if (go && boss && arRisk(p, t.x, t.y) >= (mode === 'collect' ? 2.2 : 1.4)) go = false;
  if (!go) return orig(p, mode, goal);
  goal(t.x, t.y, boss ? 1 : mode === 'hold' ? 0.8 : DNADROP.pull);
  let homing = orig(p, mode, (x, y, w) => goal(x, y, w * DNADROP.others));
  if (!boss && d < 220 && arThreat(p.x, p.y, 120) === 0) { homing = true; goal(t.x, t.y, 2.5); }
  return homing;
})(arPickups);

// ---------------------------------------------------------------- drawing
const ddLabel = (txt, x, y, size) => { ctx.font = `900 ${size}px monospace`; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000000'; ctx.fillStyle = DNADROP.col; ctx.strokeText(txt, x, y); ctx.fillText(txt, x, y); };
// The pipette: a glass tip down from above the screen, a gold drip, then back up.
function ddPipette(s) {
  const k = s.t / DNADROP.fall, X = sx(s.x), Yg = sy(s.y), sc = Math.max(1, S_() * 0.8), L = DNADROP.land;
  const eo = v => 1 - (1 - v) * (1 - v), hang = Yg - 150 * sc;
  const tipY = k < 0.3 ? -30 + (hang + 30) * eo(k / 0.3) : k < L + 0.05 ? hang : hang - (hang + 60 + 260 * sc) * Math.pow((k - L - 0.05) / (1 - L - 0.05), 2);
  ctx.save();
  if (k < L) { // where it will land: a dashed ring closing in
    ctx.globalAlpha = 0.4 + 0.4 * (k / L); ctx.setLineDash([5, 5]); ctx.lineWidth = 2.5; ctx.strokeStyle = '#000000';
    ctx.beginPath(); ctx.arc(X, Yg, (34 - 16 * k / L) * sc, 0, TAU); ctx.stroke();
    ctx.strokeStyle = DNADROP.col; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1; ctx.lineJoin = 'round';
  const w = 9 * sc, top = tipY - 260 * sc; // the tube, tapering to the tip
  ctx.beginPath(); ctx.moveTo(X - 2 * sc, tipY); ctx.lineTo(X - w, tipY - 70 * sc); ctx.lineTo(X - w, top); ctx.lineTo(X + w, top); ctx.lineTo(X + w, tipY - 70 * sc); ctx.lineTo(X + 2 * sc, tipY); ctx.closePath();
  ctx.fillStyle = 'rgba(235,245,255,0.75)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#000000'; ctx.stroke();
  if (k < L) { ctx.beginPath(); ctx.moveTo(X - w * 0.6, tipY - 110 * sc); ctx.lineTo(X + w * 0.6, tipY - 110 * sc); ctx.lineTo(X + w * 0.6, tipY - 72 * sc); ctx.lineTo(X + 1.5 * sc, tipY - 4 * sc); ctx.lineTo(X - 1.5 * sc, tipY - 4 * sc); ctx.lineTo(X - w * 0.6, tipY - 72 * sc); ctx.closePath(); ctx.fillStyle = DNADROP.col; ctx.fill(); }
  if (k > 0.3 && k < L) { // the drip
    const f = (k - 0.3) / (L - 0.3), y = tipY + (Yg - tipY) * f * f, r = 6 * sc;
    ctx.beginPath(); ctx.moveTo(X, y - r * 2.2); ctx.quadraticCurveTo(X + r * 1.1, y - r * 0.4, X, y + r); ctx.quadraticCurveTo(X - r * 1.1, y - r * 0.4, X, y - r * 2.2);
    ctx.fillStyle = DNADROP.col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#000000'; ctx.stroke();
  }
  ctx.restore();
}
function ddDraw() {
  if (!G || !G.player || !G.dd) return;
  const D = G.dd, p = G.player, t = G.realT, b = ddBox(), tg = b || D.fall, n = ddCount();
  for (const s of D.show) ddPipette(s);
  if (!tg) return;
  ctx.save();
  const x = sx(tg.x), y = sy(tg.y), sc = Math.max(1, S_() * 0.8);
  if (b) { ddLabel(DD_COPY.label, x, y - 34 * sc, 10); if (n > 1) ddLabel('x' + n, x + 26 * sc, y + 4, 13); }
  const dW = Math.hypot(tg.x - p.x, tg.y - p.y), a = Math.atan2(tg.y - p.y, tg.x - p.x), px = sx(p.x), py = sy(p.y);
  if (dW > 160) for (let q = 0; q < 3; q++) { const ph = (t * 1.8 + q / 3) % 1, rr = 44 * Math.max(1, S_() * 0.6) + ph * 34; junkArrow(px + Math.cos(a) * rr, py + Math.sin(a) * rr, a, 9, Math.sin(ph * Math.PI), DNADROP.col); }
  if (x < 0 || x > W || y < 0 || y > H) { // off screen: a big arrow at the edge, with the distance
    const m = 34, cx = W / 2, cy = H / 2, ea = Math.atan2(y - cy, x - cx), kk = Math.min((W / 2 - m) / Math.abs(Math.cos(ea) || 1e-6), (H / 2 - m) / Math.abs(Math.sin(ea) || 1e-6));
    const ey0 = clamp(cy + Math.sin(ea) * kk, (UI.safeTop || 0) + 120, H - (UI.bottomH || 160) - 20), bob = Math.sin(t * 6) * 5;
    const ex = cx + Math.cos(ea) * (kk + bob), ey = ey0 + Math.sin(ea) * bob;
    ctx.globalCompositeOperation = 'lighter'; glow(ex, ey, 50, DNADROP.col, 0.6 + 0.3 * Math.sin(t * 5)); ctx.globalCompositeOperation = 'source-over';
    junkArrow(ex, ey, ea, 17, 1, DNADROP.col);
    const t2 = Math.round(dW / 30 * 10) / 10 + ' m' + (n > 1 ? '  x' + n : '');
    ddLabel(t2, ex - Math.cos(ea) * 30, ey - Math.sin(ea) * 30 + 4, 11);
  }
  ctx.restore();
}
v10Draw = (orig => function () { orig(); if (G) ddDraw(); })(v10Draw);

// ---------------------------------------------------------------- the note on the level-up screen
function ddNoteLine() {
  const hp = G.player ? G.player.hp / G.P.maxHp : 1;
  const k = hp < 0.4 ? 'low' : ddBoss() ? 'boss' : G.lootQueue.some(q => q.kind === 'level') ? 'stack' : hp >= 0.95 && Math.random() < 0.4 ? 'well' : 'any';
  return pick(DD_NOTES[k]);
}
function ddNote(req) {
  let el = document.getElementById('lootNote');
  if (!el) {
    const sub = document.getElementById('lootSub'); if (!sub) return;
    el = document.createElement('div'); el.id = 'lootNote';
    el.style.cssText = 'margin:8px auto 2px;max-width:30em;padding:6px 10px;border-left:3px solid #ffd23f;background:rgba(255,210,63,0.14);font:italic 12px/1.35 ui-monospace,Menlo,monospace;color:inherit;text-align:left;overflow-wrap:anywhere';
    sub.insertAdjacentElement('afterend', el);
  }
  const on = req && req.kind === 'level' && !(typeof weirdInfo === 'function' && weirdInfo(req));
  el.style.display = on ? '' : 'none';
  if (!on) return;
  el.innerHTML = '';
  const h = document.createElement('b'); h.textContent = DD_COPY.head + ': '; h.style.cssText = 'font-style:normal';
  el.append(h, document.createTextNode(ddNoteLine()));
}
UI.openLoot = (orig => function (req) { orig.call(this, req); try { ddNote(req); } catch (e) { /* (a note never blocks a screen) */ } })(UI.openLoot);

// ---------------------------------------------------------------- the tutorial card, on the first drop
if (typeof TUT_CARDS !== 'undefined') TUT_CARDS.dnadrop = () => ({ title: 'TODO_COPY:tut_dnadrop_title', name: 'TODO_COPY:tut_dnadrop_name', colour: DNADROP.col,
  what: 'TODO_COPY:tut_dnadrop_what', head: 'TODO_COPY:tut_dnadrop_head', tips: ['TODO_COPY:tut_dnadrop_tip1', 'TODO_COPY:tut_dnadrop_tip2'] });
