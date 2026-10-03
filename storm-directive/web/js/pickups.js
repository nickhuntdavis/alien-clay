'use strict';
// Spawn Prawn - more temporary power-ups. Each runs on a timer (G.pu[id] = seconds left) and shows as a
// status chip; the hooks below are called from game.js.

Object.assign(POWERUPS, {
  hired:     { name: 'HIRED HELP',     letter: 'H', color: '#8dffc0', desc: 'Three bodyguard swimmers fight for you for 14s' },
  centrifuge:{ name: 'CENTRIFUGE',     letter: 'C', color: '#bde0fe', desc: 'For 6s everything near you is flung round you in a grinding vortex' },
  giant:     { name: 'HYPERTROPHY',    letter: 'G', color: '#ffb4a2', desc: 'For 8s you are huge: you crush what you touch and take half damage' },
  chain:     { name: 'CHAIN REACTION', letter: 'X', color: '#ff7a2f', desc: 'For 10s every kill explodes' },
  reflux:    { name: 'REFLUX',         letter: 'R', color: '#c77dff', desc: 'For 7s bullets near you are swallowed and spat back as sparks' },
  goldrush:  { name: 'GOLD RUSH',      letter: '$', color: '#ffd23f', desc: 'For 12s double XP, and XP flies to you' },
  leech:     { name: 'LEECH',          letter: 'L', color: '#ff4d6d', desc: 'For 10s your hits heal you' },
  rod:       { name: 'LIGHTNING ROD',  letter: 'Z', color: '#ffe94a', desc: 'For 8s lightning strikes enemies on screen twice a second' },
  tailwind:  { name: 'TAILWIND',       letter: 'W', color: '#ff9e00', desc: 'For 8s you swim 60% faster and leave a burning wake' },
});
const PU_TIME = { hired: 14, centrifuge: 6, giant: 8, chain: 10, reflux: 7, goldrush: 12, leech: 10, rod: 8, tailwind: 8 };
const PU_NEW = Object.keys(PU_TIME);
const puOn = id => !!(G && G.pu && G.pu[id] > 0);
const puDmg = k => (18 + G.level * 2.6) * G.P.might * (k || 1);
const puSrc = (name, extra) => Object.assign({ wname: name, noProc: true, noCrit: true }, extra || {});

// From applyPickup: returns true if it handled the type.
function puApply(type) {
  if (!PU_TIME[type]) return false;
  const p = me(), pu = G.pu || (G.pu = {});
  pu[type] = PU_TIME[type];
  if (type === 'hired') {
    for (let i = 0; i < 3 && G.enemies.length < CAPS.enemies; i++) {
      const a = i / 3 * TAU, e = makeEnemy(ENEMIES.charger, p.x + Math.cos(a) * 60, p.y + Math.sin(a) * 60);
      e.charmed = true; e.charmT = PU_TIME.hired; e.hired = true; e.xp = 0; e.name = 'Bodyguard';
      G.enemies.push(e); ring(e.x, e.y, 26, PAL.you, 0.4, 3);
    }
  }
  if (type === 'goldrush') for (const g of G.gems) g.mag = true;
  if (type === 'giant') { cam.shake = Math.min(12, cam.shake + 6); }
  ring(p.x, p.y, 120, POWERUPS[type].color, 0.5, 5);
  return true;
}
// Per frame.
function puTick(dt) {
  const pu = G.pu;
  if (!pu) return;
  const p = me();
  for (const k in pu) if (pu[k] > 0) pu[k] -= dt;
  if (puOn('centrifuge')) {
    // A vortex: everything within 280 is dragged onto an orbit at ~130 and ground down; bullets are flung out.
    G.cfA = (G.cfA || 0) + dt * 5;
    const tick = !(G.cfT > G.t); if (tick) G.cfT = G.t + 0.25;
    forNear(p.x, p.y, 280, e => {
      if (e.charmed || e.egg) return;
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      if (!e.boss && !e.def.heavy) { e.x += (-uy * 260 + ux * (130 - d) * 2.5) * dt; e.y += (ux * 260 + uy * (130 - d) * 2.5) * dt; }
      if (tick) damageEnemy(e, puDmg(0.45), puSrc('Centrifuge', { elem: 'phys' }));
    });
    for (const b of G.ebul) { const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy); if (d < 150 && d > 1) { b.vx = dx / d * 260; b.vy = dy / d * 260; } }
  }
  if (puOn('giant') && !(G.giantT > G.t)) {
    G.giantT = G.t + 0.2;
    const R = p.r * 1.9;
    forNear(p.x, p.y, R + 20, e => { if (e.charmed || e.egg) return; damageEnemy(e, puDmg(1.2), puSrc('Hypertrophy', { elem: 'phys', knock: 260, kx: e.x - p.x, ky: e.y - p.y })); });
  }
  if (puOn('reflux')) {
    let n = 0;
    for (const b of G.ebul) {
      if (b.dead || n >= 6 || Math.hypot(b.x - p.x, b.y - p.y) > 90) continue;
      b.dead = true; n++;
      const t = acquire('nearest', 420, p.x, p.y);
      if (t) { bolt(b.x, b.y, t.x, t.y, '#c77dff', 0.12); damageEnemy(t, b.dmg * 3 + puDmg(0.3), puSrc('Reflux', { elem: 'arcane' })); }
      else spawnPart(b.x, b.y, '#c77dff', 3, 80, 0.3);
    }
  }
  if (puOn('rod') && !(G.rodT > G.t)) {
    G.rodT = G.t + 0.5;
    const vis = onScreen(1);
    if (vis.length) { const e = pick(vis); bolt(e.x + rand(-40, 40), e.y - 520, e.x, e.y, '#ffe94a', 0.25); aoe(e.x, e.y, 70, puDmg(2.2), puSrc('Lightning Rod', { elem: 'shock' }), '#ffe94a'); }
  }
  if (puOn('tailwind') && !(G.windT > G.t) && G.zones.length < 300) {
    G.windT = G.t + 0.08;
    if (Math.hypot(p.vx || 0, p.vy || 0) > 40) G.zones.push({ x: p.x, y: p.y, r: 26, life: 1.6, max: 1.6, dps: puDmg(2), elem: 'fire', pull: 0, color: '#ff9e00', tick: 0, src: puSrc('Tailwind', { elem: 'fire' }) });
  }
  if (puOn('goldrush')) for (const g of G.gems) g.mag = true;
}
// Multipliers and event hooks.
const puSpeed = () => (puOn('tailwind') ? 1.6 : 1) * (puOn('giant') ? 0.9 : 1);
const puXp = () => (puOn('goldrush') ? 2 : 1);
const puHurt = () => (puOn('giant') ? 0.5 : 1);
const puScale = () => (puOn('giant') ? 1.8 : 1);
function puKill(e) {
  if (!puOn('chain') || e.boss || e.egg || e.chainPopped) return;
  e.chainPopped = true;
  const R = 70 + e.r * 2;
  after(0.06, () => aoe(e.x, e.y, R, puDmg(1.5) + e.maxHp * 0.15, puSrc('Chain Reaction', { elem: 'fire' }), '#ff7a2f'));
}
function puHit(e, d, src) {
  if (!puOn('leech') || src.dot || !(G.lsBudget > 0)) return;
  const h = Math.min(G.lsBudget, d * 0.03); G.lsBudget -= h; healPlayer(h, true);
}
// Status chips for the HUD.
function puChips(chips) {
  if (!G.pu) return;
  for (const k of PU_NEW) if (G.pu[k] > 0) chips.push([POWERUPS[k].name + ' ' + Math.ceil(G.pu[k]), PAL.pickup]);
}
// The vortex and the reflux zone, drawn round you.
function puDraw() {
  if (!G.pu) return;
  const p = G.player, x = sx(p.x), y = sy(p.y);
  if (puOn('centrifuge')) {
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const a = (G.cfA || 0) + i / 6 * TAU, R = 130 * S + Math.sin(G.realT * 3 + i) * 10 * S;
      ctx.globalAlpha = 0.55; ctx.strokeStyle = '#bde0fe'; ctx.lineWidth = Math.max(1.5, 3 * S);
      ctx.beginPath(); ctx.arc(x, y, R, a, a + 0.7); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.lineCap = 'butt';
  }
  if (puOn('reflux')) { ctx.globalAlpha = 0.35 + 0.2 * Math.sin(G.realT * 8); ctx.strokeStyle = '#c77dff'; ctx.lineWidth = 2; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.arc(x, y, 90 * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
}
