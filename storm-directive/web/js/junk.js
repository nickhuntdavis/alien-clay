'use strict';
// Spawn Prawn - Lateral Gene Transfer: junk DNA. Every so often one ordinary enemy on screen carries junk DNA
// (a white double helix circling it). Kill it within JUNK.life seconds and you absorb a small power to do with
// what it was: an Antibody's spit, a Macrophage's thick skin. Absorbed at once, no box, no pause. The same kind
// again stacks, up to JUNK.stacks. Like relics, but more often and weaker.
// (Mutations no longer come from Lateral Gene Transfers: genes.js keeps them for splice skips and stashes.)
// Hooks: junkStart (newGame), junkTick (update), drawJunk (render), junkKill (killEnemy), junkDmgMul /
// junkHit (damageEnemy), junkHurtIn / junkArmour / junkIframes (hurtPlayer), junkRate (rateBonus, arsenal.js),
// junkHtml (ui.js, the pause menu).

const JUNK = { first: 35, every: [40, 55], life: 30, stacks: 3, hpK: 1.5 };
// Each power: name, fmt(k) for k stacks, apply(P) once per stack (if a plain stat). The rest are hooks below.
const JUNK_POWERS = {
  crawler:    { name: 'Safety in Numbers', fmt: k => `+1% damage for each enemy within 250, up to +${10 * k}%` },
  skitter:    { name: 'Quick Off the Mark', fmt: k => `+${6 * k}% swim speed`, apply: P => { P.speed += 0.06; } },
  spitter:    { name: 'Spit Take', fmt: k => `every 3s, spit ${k > 1 ? k + ' shots' : 'a shot'} at the nearest enemy` },
  krill:      { name: 'Darting', fmt: k => `+${4 * k}% dodge`, apply: P => { P.dodge += 0.04; } },
  brute:      { name: 'Thick Skin', fmt: k => `+${2 * k} armour`, apply: P => { P.armour += 2; } },
  amoeba:     { name: 'Second Helpings', fmt: k => `each kill heals ${k} HP (up to ${3 * k} HP/s)` },
  paramecium: { name: 'Cilia', fmt: k => `sprint stamina recovers ${15 * k}% faster`, apply: P => { P.stamRegen = (P.stamRegen || 1) + 0.15; } },
  splitter:   { name: 'Cell Division', fmt: k => `${10 * k}% of weapon hits fling 2 shards off the target` },
  wisp:       { name: 'Swarm Mind', fmt: k => `+${8 * k}% area`, apply: P => { P.area += 0.08; } },
  bomber:     { name: 'Heartburn', fmt: k => `kills have a ${10 * k}% chance to burst in a small Acid blast` },
  blinker:    { name: 'Now You See Me', fmt: k => `every ${junkBlinkCd(k)}s, the next hit misses (you blink aside)` },
  rotifer:    { name: 'Light-Fingered', fmt: k => `+${20 * k}% pickup range`, apply: P => { P.magnet += 0.2; } },
  medic:      { name: 'Bedside Manner', fmt: k => `+${+(0.6 * k).toFixed(1)} HP/s regeneration`, apply: P => { P.regen += 0.6; } },
  charger:    { name: 'Hard Head', fmt: k => `enemies you swim into take a headbutt (+${+(0.4 * k).toFixed(1)} Headstrong)`, apply: P => { P.ram += 0.4; } },
  pinworm:    { name: 'Wriggle Through', fmt: k => `shots pierce ${k} more ${k > 1 ? 'enemies' : 'enemy'}`, apply: P => { P.pierce += 1; } },
  bulwark:    { name: 'Phlegm', fmt: k => `${10 * k}% less damage from enemy shots` },
  volvox:     { name: 'Colony', fmt: k => `+${8 * k}% XP`, apply: P => { P.xp += 0.08; } },
  warlock:    { name: 'Inflamed', fmt: k => `every 6s, a ring of ${6 * k} small shots bursts out of you` },
  diatom:     { name: 'Glass Case', fmt: k => `the first hit every ${junkGlassCd(k)}s is halved` },
  alien:      { name: 'Licence to Kill', fmt: k => `+${4 * k}% crit chance`, apply: P => { P.crit += 0.04; } },
  phantom:    { name: 'Ghosting', fmt: k => `+${+(0.25 * k).toFixed(2)}s of invulnerability after you are hit` },
  brood:      { name: 'Clutch', fmt: k => `kills have an ${8 * k}% chance to release a broodling that homes in and pops` },
  summoner:   { name: 'Broody', fmt: k => `every 20s, ${k > 1 ? k + ' friendly spermlets fight' : 'a friendly spermlet fights'} beside you for 10s` },
  planarian:  { name: 'Regrowth', fmt: k => `+${+(1.5 * k).toFixed(1)} HP/s regeneration below 50% HP` },
  spire:      { name: 'Rooted', fmt: k => `stay still for 1s: +${15 * k}% fire rate until you move` },
  plasmod:    { name: 'Big-Boned', fmt: k => `+${10 * k}% max HP`, apply: P => { const add = Math.round(P.maxHp * 0.1); P.maxHp += add; G.player.hp += add; } },
  lancer:     { name: 'Long Shot', fmt: k => `+${20 * k}% damage to enemies more than 350 away` },
  waterbear:  { name: 'Hard to Kill', fmt: k => `+${4 * k} armour below 30% HP` },
  juggernaut: { name: 'Alpha', fmt: k => `+${8 * k}% damage`, apply: P => { P.might += 0.08; } },
  sperminator:{ name: 'Booster Shot', fmt: k => `+${8 * k}% fire rate`, apply: P => { P.haste += 0.08; } },
};
// Offspring carry their parent's junk.
const JUNK_PARENT = { splitling: 'splitter', volvoxling: 'volvox', broodling: 'brood' };
const junkId = e => { const id = Object.keys(ENEMIES).find(k => ENEMIES[k] === e.def); return id && (JUNK_PARENT[id] || id); };
const junkK = id => (G && G.junk && G.junk[id]) || 0;
const junkBlinkCd = k => 15 - 4 * (Math.min(3, k) - 1);
const junkGlassCd = k => 10 - 2 * (Math.min(3, k) - 1);
const cap1 = s => s[0].toUpperCase() + s.slice(1);
const junkSc = () => (1 + G.level * 0.12) * G.P.might;

function junkStart(G) {
  G.junk = {}; G.junkE = null; G.nextJunk = JUNK.first; G.junkT = {}; G.junkNear = 0;
}

// ---------------------------------------------------------------- carriers
function junkPick() {
  const p = me(), cands = [];
  for (const e of onScreen(999)) {
    if (e.dead || e.boss || e.rival || e.final || e.egg || e.charmed || e.hired || e.bossDef || e.def.patterns) continue;
    const id = junkId(e);
    if (!id || !JUNK_POWERS[id] || junkK(id) >= JUNK.stacks) continue;
    cands.push([Math.hypot(e.x - p.x, e.y - p.y) + Math.random() * 200, e]);
  }
  if (!cands.length) return null;
  cands.sort((a, b) => a[0] - b[0]);
  return cands[0][1];
}
function junkTick(dt) {
  if (!G || !G.junk || G.debug || G.state !== 'play') return;
  const p = me(), P = G.P, T = G.junkT;
  // The carrier: it sheds the junk if you take too long.
  const c = G.junkE;
  if (c && (c.dead || G.t - c.junk > JUNK.life)) {
    if (!c.dead) { c.junk = null; floatText(c.x, c.y - c.r - 14, 'JUNK DNA LOST', XR.dim, 12, 0.9); }
    G.junkE = null;
  }
  const waveIdle = typeof wavesMode === 'function' && wavesMode() && !G.wave.active;
  if (!G.junkE && G.t >= G.nextJunk && !waveIdle) {
    const e = junkPick();
    if (!e) G.nextJunk = G.t + 2;
    else {
      G.nextJunk = G.t + rand(JUNK.every[0], JUNK.every[1]);
      e.junk = G.t; e.junkPing = G.realT; G.junkE = e; e.hp *= JUNK.hpK; e.maxHp *= JUNK.hpK;
      banner('JUNK DNA!', '#e9f5db'); sfx('level'); vibrate(40);
      if (!G.junkSeen) { G.junkSeen = true; sysMsg('LATERAL GENE TRANSFER', `One of them is carrying junk DNA: the white helix. Kill it in the next ${JUNK.life} seconds and you absorb a small power of whatever it was.`, '#e9f5db', true); }
    }
  }
  // Powers that tick.
  if (!(T.nearT > G.t)) { T.nearT = G.t + 0.25; let n = 0; if (junkK('crawler')) forNear(p.x, p.y, 250, e => { if (!e.charmed && !e.egg) n++; }); G.junkNear = n; }
  T.healB = Math.min(3 * junkK('amoeba'), (T.healB || 0) + 3 * junkK('amoeba') * dt); // (Second Helpings: up to 3 HP/s a stack)
  const sp = Math.hypot(p.vx || 0, p.vy || 0);
  T.still = sp < 25 ? (T.still || 0) + dt : 0;
  let k;
  if ((k = junkK('spitter')) && !((T.spitT || 0) > G.t)) {
    T.spitT = G.t + 3;
    const t = junkNearest(p.x, p.y, 450);
    if (t) for (let i = 0; i < k; i++) junkShot(p.x, p.y, Math.atan2(t.y - p.y, t.x - p.x) + (i - (k - 1) / 2) * 0.18, 14 * junkSc(), 'Spit Take', { r: 5 });
  }
  if ((k = junkK('warlock')) && !((T.ringT || 0) > G.t)) {
    T.ringT = G.t + 6;
    const n = 6 * k, a0 = Math.random() * TAU;
    for (let i = 0; i < n; i++) junkShot(p.x, p.y, a0 + i / n * TAU, 9 * junkSc(), 'Inflamed', { elem: 'fire', life: 0.8 });
    ring(p.x, p.y, 40, '#ff9e6b', 0.3, 3);
  }
  if ((k = junkK('summoner')) && !((T.broodyT || 0) > G.t)) {
    T.broodyT = G.t + 20;
    for (let i = 0; i < k && G.enemies.length < CAPS.enemies; i++) {
      const a = Math.random() * TAU, e = makeEnemy(ENEMIES.wisp, p.x + Math.cos(a) * 40, p.y + Math.sin(a) * 40);
      e.charmed = true; e.charmT = 10; e.hired = true; e.xp = 0; e.name = 'Little Helper'; e.hp = e.maxHp = e.maxHp * 3;
      G.enemies.push(e); ring(e.x, e.y, 22, PAL.you, 0.4, 3);
    }
  }
  if ((k = junkK('planarian')) && p.hp > 0 && p.hp < P.maxHp * 0.5) p.hp = Math.min(P.maxHp, p.hp + 1.5 * k * dt);
}
function junkNearest(x, y, r) {
  let best = null, bd = r;
  for (const e of G.enemies) { if (e.dead || e.charmed || e.egg) continue; const d = Math.hypot(e.x - x, e.y - y); if (d < bd) { bd = d; best = e; } }
  return best;
}
// A small shot of your own, borrowing your first weapon's projectile (credited to the power in the run log).
function junkShot(x, y, a, dmg, name, o) {
  const w = G.weapons.find(Boolean);
  if (!w || G.proj.length >= CAPS.proj) return;
  o = o || {};
  const sp = o.speed || 380;
  spawnProj(w, x, y, a, { elem: o.elem || 'phys', wname: name, junk: true }, { noMods: true, speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: o.life || 1.2,
    dmg, pierce: 0, bounce: 0, homing: o.homing || 0, explode: 0, r: o.r || 4, style: 'bullet', chainHit: 0, aura: 0, color: '#e9f5db' });
}
// Absorbing it.
function junkAbsorb(e) {
  const id = junkId(e), J = JUNK_POWERS[id];
  G.junkE = null;
  if (!J || junkK(id) >= JUNK.stacks) return;
  const k = G.junk[id] = junkK(id) + 1;
  if (J.apply) { J.apply(G.P); recomputeAll(); }
  const p = me();
  fxParts('drop', e.x, e.y, '#e9f5db', 16, 240, 0.6, 4); ring(e.x, e.y, 70, '#e9f5db', 0.4, 4); ring(p.x, p.y, 50, '#e9f5db', 0.5, 3);
  sfx('pickup'); vibrate(60);
  banner(`${J.name.toUpperCase()}${k > 1 ? ' x' + k : ''}`, '#e9f5db'); // (the float underneath says what it does)
  floatText(p.x, p.y - 40, 'JUNK DNA ABSORBED', '#e9f5db', 13, 1.2);
  sysMsg('JUNK DNA: ' + J.name.toUpperCase(), `From the ${ENEMIES[id].name}: ${J.fmt(k)}.`, '#e9f5db');
  tutShow('lgt', true); // (the first one: a card)
  if (typeof mutOn === 'function' && mutOn('trojan')) aoe(p.x, p.y, 180, 40 * (1 + G.level * 0.12) * G.P.might, { elem: 'phys', wname: 'Surprise Package', knock: 400, noCrit: true }, '#e9f5db');
}

// ---------------------------------------------------------------- hooks
function junkKill(e, src) {
  if (!G.junk || e.charmed) return;
  if (e.junk && e === G.junkE) junkAbsorb(e);
  let k;
  if ((k = junkK('amoeba')) && G.junkT.healB >= 1) { const h = Math.min(k, G.junkT.healB); G.junkT.healB -= h; healPlayer(h, true); }
  if ((k = junkK('bomber')) && !(src && src.wname === 'Heartburn') && Math.random() < 0.1 * k) aoe(e.x, e.y, 90, 25 * junkSc(), { elem: 'fire', wname: 'Heartburn', noCrit: true }, '#c6ff3d');
  if ((k = junkK('brood')) && Math.random() < 0.08 * k) { const t = junkNearest(e.x, e.y, 500); if (t) junkShot(e.x, e.y, Math.atan2(t.y - e.y, t.x - e.x), 22 * junkSc(), 'Clutch', { homing: 6, r: 5, life: 2 }); }
}
function junkDmgMul(e, src) {
  if (!G.junk) return 1;
  let m = 1, k;
  if ((k = junkK('crawler'))) m *= 1 + Math.min(0.1, 0.01 * G.junkNear) * k;
  if ((k = junkK('lancer')) && Math.hypot(e.x - me().x, e.y - me().y) > 350) m *= 1 + 0.2 * k;
  return m;
}
function junkHit(e, d, src) {
  const k = junkK('splitter');
  if (!k || src.junk || src.dot || Math.random() >= 0.1 * k) return;
  const a0 = Math.atan2(e.y - me().y, e.x - me().x);
  for (const s of [-0.6, 0.6]) junkShot(e.x + Math.cos(a0) * e.r, e.y + Math.sin(a0) * e.r, a0 + s, d * 0.3, 'Cell Division', { r: 3, life: 0.5, speed: 420 });
}
function junkHurtIn(dmg, ent, kind) {
  if (!G.junk) return dmg;
  const p = me(), T = G.junkT;
  let k;
  if ((k = junkK('blinker')) && !(T.blinkT > G.t)) {
    T.blinkT = G.t + junkBlinkCd(k);
    floatText(p.x, p.y - 24, 'BLINKED', '#e9f5db', 14); ring(p.x, p.y, 30, '#e9f5db', 0.3, 3); p.iframes = Math.max(p.iframes, 0.4);
    return 0;
  }
  if ((k = junkK('bulwark')) && kind === 'bullets') dmg *= 1 - 0.1 * k;
  if ((k = junkK('diatom')) && !(T.glassT > G.t)) { T.glassT = G.t + junkGlassCd(k); dmg *= 0.5; }
  return dmg;
}
const junkArmour = () => { const k = junkK('waterbear'); return k && G.player.hp < G.P.maxHp * 0.3 ? 4 * k : 0; };
const junkIframes = () => 0.25 * junkK('phantom');
const junkRate = () => { const k = junkK('spire'); return k && G.junkT && G.junkT.still >= 1 ? 1 + 0.15 * k : 1; };

// ---------------------------------------------------------------- drawing (world space, from render)
// A bold chevron with a dark outline, so it reads on a pale slide and a dark one.
function junkArrow(x, y, a, sz, alpha) {
  const c = Math.cos(a), sn = Math.sin(a), pt = (u, v) => [x + c * u - sn * v, y + sn * u + c * v];
  ctx.globalAlpha = alpha; ctx.beginPath();
  for (const [u, v] of [[sz, 0], [-sz * 0.6, sz * 0.85], [-sz * 0.2, 0], [-sz * 0.6, -sz * 0.85]]) { const [X, Y] = pt(u, v); ctx.lineTo(X, Y); }
  ctx.closePath(); ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#000000'; ctx.stroke(); ctx.fillStyle = '#e9f5db'; ctx.fill();
  ctx.globalAlpha = 1;
}
function drawJunk() {
  const e = G && G.junkE;
  if (!e || e.dead) return;
  const left = JUNK.life - (G.t - e.junk), x = sx(e.x), y = sy(e.y), R = e.r * S + 12, t = G.realT;
  ctx.save();
  ctx.globalAlpha = left < 6 && Math.floor(t * 6) % 2 ? 0.35 : 1;
  // A double helix wound round it: two strands out of phase, with rungs between them.
  ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff';
  for (const ph of [0, Math.PI]) {
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU + t * 1.2, rr = R + Math.sin(a * 4 + t * 4 + ph) * 5; i ? ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.stroke();
  }
  ctx.lineWidth = 1.2; ctx.globalAlpha *= 0.7; ctx.beginPath();
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * 1.2, s = Math.sin(a * 4 + t * 4) * 5; ctx.moveTo(x + Math.cos(a) * (R + s), y + Math.sin(a) * (R + s)); ctx.lineTo(x + Math.cos(a) * (R - s), y + Math.sin(a) * (R - s)); }
  ctx.stroke();
  // The ping: three rings rippling out, once, when it is marked.
  const pk = (t - (e.junkPing || -9)) / 1.6;
  if (pk >= 0 && pk < 1) for (let q = 0; q < 3; q++) { const f = pk * 1.6 - q * 0.25; if (f <= 0 || f >= 1) continue; ctx.globalAlpha = 1 - f; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * (1 - f) + 1; ctx.beginPath(); ctx.arc(x, y, R + f * 260 * S, 0, TAU); ctx.stroke(); }
  // A beacon: a bobbing chevron and its countdown above it.
  const by = y - R - 18 - Math.abs(Math.sin(t * 4)) * 8;
  ctx.globalAlpha = 1; junkArrow(x, by, Math.PI / 2, 11, 1);
  ctx.font = '900 12px monospace'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000000'; ctx.fillStyle = '#e9f5db';
  const lbl = 'JUNK DNA ' + Math.ceil(left) + 's'; ctx.strokeText(lbl, x, by - 16); ctx.fillText(lbl, x, by - 16);
  // Three small arrows circling you, pointing the way (until you're nearly there).
  const p = me(), dW = Math.hypot(e.x - p.x, e.y - p.y), a = Math.atan2(e.y - p.y, e.x - p.x), px = sx(p.x), py = sy(p.y);
  if (dW > 120) for (let q = 0; q < 3; q++) {
    const ph = (t * 1.8 + q / 3) % 1, rr = 44 * Math.max(1, S * 0.6) + ph * 34;
    junkArrow(px + Math.cos(a) * rr, py + Math.sin(a) * rr, a, 9, Math.sin(ph * Math.PI));
  }
  // Off screen: a big arrow at the edge with the distance.
  const m = 34;
  if (x < 0 || x > W || y < 0 || y > H) {
    const cx = W / 2, cy = H / 2, ea = Math.atan2(y - cy, x - cx), kk = Math.min((W / 2 - m) / Math.abs(Math.cos(ea) || 1e-6), (H / 2 - m) / Math.abs(Math.sin(ea) || 1e-6));
    const bob = Math.sin(t * 6) * 5, ex = cx + Math.cos(ea) * (kk + bob), ey = cy + Math.sin(ea) * (kk + bob);
    ctx.globalCompositeOperation = 'lighter'; glow(ex, ey, 50, '#e9f5db', 0.6 + 0.3 * Math.sin(t * 5)); ctx.globalCompositeOperation = 'source-over';
    junkArrow(ex, ey, ea, 17, 1);
    ctx.font = '900 11px monospace'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000000'; ctx.fillStyle = '#e9f5db';
    const t2 = Math.round(dW / 30 * 10) / 10 + ' m', tx = ex - Math.cos(ea) * 28, ty = ey - Math.sin(ea) * 28 + 4;
    ctx.strokeText(t2, tx, ty); ctx.fillText(t2, tx, ty);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- pause menu
function junkHtml(first) {
  const ids = Object.keys(G.junk || {}).filter(id => G.junk[id] > 0 && JUNK_POWERS[id]);
  const h = ids.map(id => `<div class="li on"><b>${esc(JUNK_POWERS[id].name)}${G.junk[id] > 1 ? ' x' + G.junk[id] : ''}</b> <span class="sb">(${esc(ENEMIES[id].name)})</span><br><span>${esc(cap1(JUNK_POWERS[id].fmt(G.junk[id])))}.</span></div>`).join('');
  return `<h3${first ? '' : ' style="margin-top:10px"'}>Junk DNA (Lateral Gene Transfer)</h3>${h ? `<div class="list">${h}</div>` : '<p class="hint">None yet. Kill an enemy wearing the white helix to absorb a small power from it.</p>'}`;
}
