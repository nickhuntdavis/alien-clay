'use strict';
// Spawn Prawn - more to aim at (user, 24 Oct): with the Advanced Targeting mastery, every weapon's aim menu gets four
// top-level choices above the enemy rules: MINES, PROJECTILES, ENEMIES and ME.
//  - MINES: the weapon aims at your nearest mine (Nappy Mines, the Mines modifier's mines) and sets it off when its
//    attack gets there. PROJECTILES: it aims at the nearest enemy shot and destroys it. ME: its attack lands on you
//    (pools, blasts and lures round you; shots go the way you are swimming). ENEMIES: the nearest enemy (the enemy rules
//    below it pick enemies as before).
//  - These targets are stand-ins (`t.xaim`): not enemies, never in G.enemies. A weapon fires at one as at an enemy;
//    when its attack arrives (travel time by attack type) the stand-in is used up. Anything that would damage one
//    uses it up instead (damageEnemy is asked first). With nothing of that kind in reach, the weapon falls back to its
//    "Then" rule, or the nearest enemy.
// Text: names are the user's words; descriptions are TODO_COPY:aim_<id>_desc.
// Hooks: none in shared files. Adds DIRECTIVES entries; wraps aimAllowed, aimList (spsteer.js), targetScore, acquire,
// acquireMany, fireWeapon, damageEnemy (game.js). Loads after spsteer.js and modwide.js.

const XAIM_IDS = ['mines', 'shots', 'enemies', 'me'];
DIRECTIVES.push(
  { id: 'mines', name: 'MINES', short: 'MINES', desc: 'TODO_COPY:aim_mines_desc', xtop: 1 },
  { id: 'shots', name: 'PROJECTILES', short: 'PROJ', desc: 'TODO_COPY:aim_shots_desc', xtop: 1 },
  { id: 'enemies', name: 'ENEMIES', short: 'ENEMY', desc: 'TODO_COPY:aim_enemies_desc', xtop: 1 },
  { id: 'me', name: 'ME', short: 'ME', desc: 'TODO_COPY:aim_me_desc', xtop: 1 });
aimAllowed = (orig => function (dir) {
  if (XAIM_IDS.includes(dir)) return !!G && typeof steerMast === 'function' && steerMast('sp_aim', 'aim');
  return orig(dir);
})(aimAllowed);
aimList = (orig => function () { const L = orig(); return L.filter(d => d.xtop).concat(L.filter(d => !d.xtop)); })(aimList); // (top-level choices first)
targetScore = (orig => function (dir, e, d2) { return orig(dir === 'enemies' ? 'nearest' : dir, e, d2); })(targetScore);

const XAIM_KIND = { mines: 1, shots: 1, me: 1 };
function xaimProxy(kind, range, x, y) {
  const p = G.player;
  let best = null, bd = range, ref = null, from = null;
  const near = (q, f) => { const d = Math.hypot(q.x - x, q.y - y); if (d < bd) { bd = d; best = q; from = f; } };
  if (kind === 'mines') {
    for (const q of G.proj) if (q.mine && !q.dead && G.weapons.includes(q.w)) near(q, 'proj');
    if (G.mwS) for (const q of G.mwS.mines) if (!q.gone) near(q, 'mw');
    if (G.m10) for (const q of G.m10.mines) if (!q.dead) near(q, 'mod');
  } else if (kind === 'shots') for (const b of G.ebul) { if (!b.dead) near(b, 'shot'); }
  else if (kind === 'me') { const hd = p.hd != null ? p.hd : 0; best = { x: p.x + Math.cos(hd) * 30, y: p.y + Math.sin(hd) * 30 }; from = 'me'; }
  if (!best) return null;
  ref = best;
  return { xaim: kind, ref, from, x: ref.x, y: ref.y, r: 6, dead: false, hp: 1, maxHp: 1, vx: 0, vy: 0, kx: 0, ky: 0, hitT: {}, crowd: 0,
    armour: 0, speed: 0, def: { name: '', ai: '' }, name: '', phased: false, charmed: false, elite: false, boss: false };
}
acquire = (orig => function (dir, range, x, y, exclude) {
  if (!G || typeof dir !== 'string') return orig(dir, range, x, y, exclude);
  const parts = dir.split('>');
  if (!parts.some(d => XAIM_KIND[d])) return orig(dir, range, x, y, exclude);
  for (const d of parts) {
    const t = XAIM_KIND[d] ? xaimProxy(d, range, x, y) : orig(d, range, x, y, exclude);
    if (t) return t;
  }
  return parts.length === 1 ? orig('nearest', range, x, y, exclude) : null; // (nothing of that kind in reach: the nearest enemy)
})(acquire);
acquireMany = (orig => function (dir, range, x, y, n) {
  if (typeof dir === 'string' && dir.split('>').some(d => XAIM_KIND[d])) dir = 'nearest'; // (attacks that pick several targets pick enemies)
  return orig(dir, range, x, y, n);
})(acquireMany);
// The attack reaches the stand-in: a mine goes off, a shot is destroyed (ME: it simply lands on you).
function xaimHit(t) {
  if (t.done) return;
  t.done = 1; t.dead = true;
  const q = t.ref;
  if (t.from === 'proj') { if (!q.dead) { q.dead = true; detonateMine(q); } }
  else if (t.from === 'mw') { if (!q.gone) { q.gone = true; mwMineGo(q); } }
  else if (t.from === 'mod') { if (!q.dead && G.m10.mines.includes(q)) modBlow(q); }
  else if (t.from === 'shot') { if (!q.dead) { q.dead = true; spawnPart(q.x, q.y, '#ffffff', 4, 60, 0.25, 2); } }
}
fireWeapon = (orig => function (w, target) {
  if (target && target.xaim && G) {
    const s = w.s || {}, a = w.def.v10atk, d = Math.hypot(target.x - G.player.x, target.y - G.player.y);
    const t = a === 'beam' || a === 'contact' ? 0.05 : a === 'burst' ? (s.delay || 0.3) : (a === 'pool' || w.def.kind === 'lob') ? (s.flight || 0.55) : d / Math.max(200, s.speed || 500);
    after(Math.min(1.5, t), () => { if (G) xaimHit(target); });
  }
  return orig(w, target);
})(fireWeapon);
damageEnemy = (orig => function (e, dmg, src) {
  if (e && e.xaim) { xaimHit(e); return 0; }
  return orig.apply(this, arguments);
})(damageEnemy);
