'use strict';
// Spawn Prawn - quirks: twelve interactions nobody announces. They fall out of how things already work (a
// black hole doesn't care whose mine it swallows; lightning conducts through a puddle) and each unlocks a
// Codex entry the first time it happens. Until then the Codex only says "???".

const QUIRKS = {
  minebelly:  { name: 'Belly Full of Nappies', desc: 'A Toddler Gravity orb swallowed your Nappy Mines. They all went off together when it collapsed.' },
  slingshot:  { name: 'Gravity Assist', desc: 'Your shots curved round a black hole and flew out faster and harder. Ask a space probe.' },
  wetwire:    { name: 'Live Puddle', desc: 'Lightning hit something standing in a toxic puddle, and everyone else in the puddle got it too.' },
  flammable:  { name: 'Flammable Fumes', desc: 'Something burning touched a toxic puddle and set the whole thing alight.' },
  icerink:    { name: 'Ice Rink', desc: 'Frost froze a toxic puddle solid. Enemies slide about on it; you skate across it faster.' },
  icebreaker: { name: 'Icebreaker', desc: 'You rammed a frozen enemy at speed. It shattered, and the shards hit what was behind it.' },
  contagion:  { name: 'Hereditary', desc: 'An infected enemy split during Mitosis, and both halves kept the infection.' },
  driftmines: { name: 'Downstream', desc: 'Waters Breaking swept your mines, puddles and black holes along with everything else.' },
  firelight:  { name: 'Firelight', desc: 'In the dark, fire gives off light. Burning things light up their surroundings during Lights Out.' },
  headon:     { name: 'Head-On', desc: 'Ramming counts closing speed: swim straight at something fast and it hits much harder.' },
  indigestion:{ name: 'Something It Ate', desc: 'An amoeba swallowed something it should not have: a mine, a black hole, or an infected cell.' },
  hoover:     { name: 'Pocket Hoover', desc: 'A black hole sucked up loot lying on the floor, then spat it all out to you when it collapsed.' },
};

// The first time ever: a big reveal. On later runs: a quick nod (once per run).
function quirkFound(id, x, y) {
  const Q = QUIRKS[id];
  if (!Q || !G) return;
  const seen = G.quirks || (G.quirks = {});
  if (seen[id]) return;
  seen[id] = true;
  const p = me(); x = x == null ? p.x : x; y = y == null ? p.y : y;
  if (!META.quirks[id]) {
    META.quirks[id] = true; saveMeta();
    banner('SECRET FOUND: ' + Q.name.toUpperCase(), PAL.upgrade);
    sysMsg('SECRET FOUND (' + Object.keys(META.quirks).length + '/' + Object.keys(QUIRKS).length + ')', Q.name + '. ' + Q.desc + ' (Now in the Codex.)', PAL.upgrade, true);
    sfx('level'); addViewers(6000);
    ring(x, y, 80, PAL.upgrade, 0.6, 5);
  } else floatText(x, y - 40, Q.name.toUpperCase(), PAL.upgrade, 13, 1);
}

const isOrb = pr => pr.style === 'void' && !pr.dead && pr.w && pr.w.id === 'void' && !pr.lob;

// Per frame (from sigTick): black holes vs mines, shots and loot; the current carrying your things; ice.
function quirkTick(dt) {
  const orbs = G.proj.filter(isOrb);
  for (const o of orbs) {
    const A = o.aura || 70, A2 = A * A;
    for (const pr of G.proj) {
      if (pr === o || pr.dead) continue;
      const dx = o.x - pr.x, dy = o.y - pr.y, d2 = dx * dx + dy * dy;
      if (d2 > A2) { if (pr.inGrav === o) { pr.inGrav = null; slingOut(pr); } continue; }
      const d = Math.sqrt(d2) || 1;
      if (pr.mine && !pr.stick) {
        // 1. Mines get dragged in and swallowed whole.
        pr.x += dx / d * Math.min(d, 220 * dt); pr.y += dy / d * Math.min(d, 220 * dt);
        if (d < o.r + 6) { pr.dead = true; o.mines = (o.mines || 0) + 1; o.mineDmg = (o.mineDmg || 0) + pr.w.s.dmg * mineScale(pr).k; o.mineSrc = pr.src; ring(o.x, o.y, o.r + 8, '#ff9f1c', 0.25, 2); if (o.mines >= 2) floatText(o.x, o.y - o.r - 10, o.mines + ' NAPPIES INSIDE', '#ff9f1c', 11, 0.5); }
      } else if (!pr.lob && !pr.mine && pr.style !== 'void' && pr.style !== 'flame' && !pr.slung && pr.speed > 200 && pr.w && !pr.w.isSpell) {
        // 2. Fast shots curve round the orb (a gravity assist), and fly out faster when they leave.
        const v = Math.hypot(pr.vx, pr.vy) || 1, ta = Math.atan2(dy, dx), ca = Math.atan2(pr.vy, pr.vx);
        const na = ca + Math.max(-4 * dt, Math.min(4 * dt, angDiff(ta, ca)));
        pr.vx = Math.cos(na) * v; pr.vy = Math.sin(na) * v; pr.life += dt * 0.6; pr.inGrav = o;
      }
    }
    // 12. Loot on the floor gets sucked in.
    for (const g of G.gems) {
      if (g.dead || g.mag) continue;
      const dx = o.x - g.x, dy = o.y - g.y, d = Math.hypot(dx, dy);
      if (d > A) continue;
      g.x += dx / (d || 1) * Math.min(d, 260 * dt); g.y += dy / (d || 1) * Math.min(d, 260 * dt);
      if (d < o.r) { g.dead = true; (o.loot || (o.loot = [])).push([g.v, g.kind]); }
    }
  }
  // 8. The current carries your mines, puddles and black holes too.
  const tx = G.evm.tideX, ty = G.evm.tideY;
  if (tx || ty) {
    let moved = false;
    for (const pr of G.proj) if (!pr.dead && (pr.mine || isOrb(pr))) { pr.x += tx * 0.8 * dt; pr.y += ty * 0.8 * dt; moved = true; }
    for (const z of G.zones) if (!z.trail && !z.pocket && (z.venom || z.ice || z.burning)) { z.x += tx * 0.8 * dt; z.y += ty * 0.8 * dt; moved = true; }
    if (moved && !(G.quirks && G.quirks.driftmines)) { G.driftT = (G.driftT || 0) + dt; if (G.driftT > 1.5) quirkFound('driftmines'); }
  }
  // 5. Standing on an ice rink.
  G.onIce = false;
  const p = me();
  for (const z of G.zones) if (z.ice && Math.hypot(z.x - p.x, z.y - p.y) < z.r) { G.onIce = true; break; }
}

function slingOut(pr) {
  // 2. Leaving the orb's pull: the slingshot.
  pr.slung = true; pr.vx *= 1.45; pr.vy *= 1.45; pr.speed *= 1.45; pr.dmg *= 1.5;
  fxParts('spark', pr.x, pr.y, '#e0aaff', 3, 200, 0.25, 2, Math.atan2(pr.vy, pr.vx) + Math.PI, 0.4);
  G.slingN = (G.slingN || 0) + 1;
  if (G.slingN >= 3) quirkFound('slingshot', pr.x, pr.y);
}

// When a Toddler Gravity orb collapses (projEnd, or the supernova).
function orbCollapse(o) {
  if (o.mines) {
    // 1. Everything it swallowed goes off at once.
    const R = 90 + 22 * o.mines;
    aoe(o.x, o.y, R, o.mineDmg * 1.5, Object.assign({}, o.mineSrc || o.src, { noProc: true, wname: 'Belly Full of Nappies' }), '#ff9f1c');
    G.fx.push({ type: 'flash', x: o.x, y: o.y, r: R * 1.2, color: '#ff9f1c', life: 0.4, max: 0.4 });
    cam.shake = Math.min(18, cam.shake + 4 + o.mines);
    if (o.mines >= 2) quirkFound('minebelly', o.x, o.y);
    o.mines = 0;
  }
  if (o.loot && o.loot.length) {
    // 12. ...and spits the loot out to you.
    for (const [v, kind] of o.loot) { G.gems.push({ x: o.x + rand(-10, 10), y: o.y + rand(-10, 10), v, kind, mag: true, vx: rand(-200, 200), vy: rand(-200, 200) }); }
    if (o.loot.length >= 3) quirkFound('hoover', o.x, o.y);
    o.loot = null;
  }
}

// 3 and 4 and 5: what happens to a toxic puddle when lightning, fire or frost gets involved (from damageEnemy).
function puddleQuirks(e, src, dmg) {
  const z = e.puddleT > G.t && e.puddleZ;
  if (!z || z.dead || z.life <= 0) return;
  if (src.elem === 'shock' && !src.puddleArc && !(z.wireT > G.realT)) {
    z.wireT = G.realT + 0.3;
    let n = 0;
    forNear(z.x, z.y, z.r, o => {
      if (o === e || o.charmed || o.dead) return;
      n++;
      bolt(e.x, e.y, o.x, o.y, '#ffe94a', 0.15);
      damageEnemy(o, dmg * 0.6, Object.assign({}, src, { puddleArc: true, noProc: true, mult: src.mult || 1, wname: 'Live Puddle' }));
    });
    if (n >= 2) quirkFound('wetwire', z.x, z.y);
  }
  if ((src.elem === 'fire' || e.burn > 0) && !z.burning && !z.ice) {
    z.burning = true; z.life = Math.min(z.life, 3.2); z.max = Math.max(z.max, 3.2); z.dps *= 2.2; z.elem = 'fire'; z.color = '#ff7a2f';
    G.fx.push({ type: 'flash', x: z.x, y: z.y, r: z.r * 1.2, color: '#ff7a2f', life: 0.3, max: 0.3 });
    fxParts('ember', z.x, z.y, '#ff9e00', 10, z.r * 2, 0.9, 3);
    quirkFound('flammable', z.x, z.y);
  }
  if (src.elem === 'ice' && !z.ice && !z.burning) {
    z.ice = true; z.venom = false; z.dps *= 0.3; z.life = Math.max(z.life, 6); z.max = Math.max(z.max, 6); z.color = '#e6f4ff'; z.elem = 'ice';
    ring(z.x, z.y, z.r, '#e6f4ff', 0.5, 4);
    fxParts('shard', z.x, z.y, '#e6f4ff', 8, z.r * 2, 0.5, 3);
    quirkFound('icerink', z.x, z.y);
  }
}

// 11. Amoebas swallowing the wrong thing (from engulfAI).
function amoebaIndigestion(e) {
  for (const pr of G.proj) {
    if (pr.dead || !(pr.mine || isOrb(pr))) continue;
    if (Math.hypot(pr.x - e.x, pr.y - e.y) > e.r * 0.7) continue;
    pr.dead = true;
    if (pr.mine) {
      // It exploded from the inside: the membrane doesn't help.
      damageEnemy(e, pr.w.s.dmg * mineScale(pr).k * 3 + e.maxHp * 0.15, Object.assign({}, pr.src, { noProc: true, wname: 'Something It Ate' }));
      G.fx.push({ type: 'flash', x: e.x, y: e.y, r: e.r * 1.4, color: '#ff9f1c', life: 0.3, max: 0.3 });
      fxParts('drop', e.x, e.y, e.color, 12, 260, 0.6, 4);
    } else {
      // It swallowed a black hole: it implodes.
      damageEnemy(e, e.maxHp * 0.35 + pr.dmg * 4, Object.assign({}, pr.src, { noProc: true, wname: 'Something It Ate' }));
      e.r = Math.max(e.def.r, e.r * 0.7);
      ring(e.x, e.y, e.r * 2, '#c77dff', 0.5, 6);
    }
    floatText(e.x, e.y - e.r - 12, 'INDIGESTION', '#ffffff', 15, 0.8);
    quirkFound('indigestion', e.x, e.y);
  }
}
function amoebaAteInfected(e, o) {
  // Eating an infected cell infects the amoeba: it becomes yours, a very large zombie.
  if (!(o.parasiteT > 0 && o.parasiteW) || e.charmed) return;
  e.charmed = true; e.charmT = 20; e.zombie = true; e.allyT = null;
  floatText(e.x, e.y - e.r - 12, 'INFECTED', PAL.you, 16, 1);
  ring(e.x, e.y, e.r + 16, PAL.you, 0.5, 5);
  quirkFound('indigestion', e.x, e.y);
}
