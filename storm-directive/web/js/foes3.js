'use strict';
// Spawn Prawn - two enemies that use the player statuses (pstatus.js) against you, from ENEMY_IDEAS.md.
//   Phlegm Hocker (Mucus, punisher): hangs back and lobs big sticky globs that make you Snotty.
//     The glob leaves a Mucus patch (fight.js fightPatch, 40 wide, 4 s) where it lands or bursts; standing in it keeps you Snotty.
//   Hayfever Cell (Cooties, punisher): every few seconds it winds up and sneezes a cone at you, giving you
//     whichever of Snotty, Sick and Soaking wet you have put on it. Pile statuses on it carelessly and it backfires.
//     ANTIHISTAMINE (Water, then Cooties on it): it sneezes on its own side instead, making its neighbours Sick.
//   Snot Bubble (Mucus, carrier): a nostril bubble that swells with every hit. Pop it early and it only splashes
//     Snotty on the neighbours; pop it late (4+ hits) and it bursts, sticking every enemy nearby and you if you are close.
//     POPPED (Static on it): bursts at once, harmless to you, every enemy nearby Snotty.
// Hooks: chem.js (after an enemy takes a damage type's status) -> foes3Chem; foes2.js foes2Dmg -> foes3Dmg and
//   foes2Kill -> foes3Kill (Snot Bubble). Everything else rides foes2's tables (cap, FOE_AI, MICROBES, ENEMY_INTRO).

Object.assign(ENEMIES, {
  hocker:   { name: 'Phlegm Hocker', hp: 32, speed: 50, armour: 0, r: 14, dmg: 8, xp: 4, color: '#b9c98a', shape: 'hocker', ai: 'hocker', from: 140, w: 1.2, cap: 6, f3rx: true,
    weak: { salt: 1.5 }, resist: { ice: 0.6 }, does: 'Lobs sticky globs that make you Snotty' },
  hayfever: { name: 'Hayfever Cell', hp: 50, speed: 48, armour: 1, r: 16, dmg: 10, xp: 5, color: '#f2c6d6', shape: 'hayfever', ai: 'hayfever', from: 200, w: 1.0, cap: 6, f3rx: true,
    weak: { salt: 1.5 }, resist: { poison: 0.6 }, does: 'Sneezes the statuses you gave it back at you' },
  snotbubble: { name: 'Snot Bubble', hp: 30, speed: 34, armour: 0, r: 13, dmg: 6, xp: 4, color: '#cfe3c0', shape: 'snotbubble', ai: 'chase', from: 120, w: 1.0, cap: 4, f3rx: true, f3dmg: true, f3kill: true,
    weak: { shock: 1.5 }, resist: { phys: 0.6 }, does: 'Swells with every hit, then bursts and sticks everything nearby' },
});
Object.assign(ENEMY_INTRO, {
  hocker:   { what: 'Clears its throat, then lobs a big glob of phlegm at you. A direct hit leaves you Snotty: slower for a few seconds.', tip: 'TODO_COPY:hocker_tip' },
  snotbubble: { what: 'A bubble blown out of a nostril. Every hit makes it swell. Pop it too late and it bursts all over the neighbourhood, you included.', tip: 'Pop it early for a small splash, or from range. Static pops it at once, and harmlessly.' },
  hayfever: { what: 'Allergic to everything, mostly you. Every few seconds it winds up (AH... AH...) and sneezes a cone at you, and it sneezes back whatever statuses you have given it.', tip: 'Step out of the cone when it winds up, and go easy on the statuses. Soak it with Water, then give it Cooties, and it sneezes on its friends instead.' },
});
Object.assign(REACTIONS, {
  popped:        { name: 'POPPED',        color: '#9fd46a', desc: 'Static on a Snot Bubble: it bursts at once, harmless to you, and every enemy nearby is Snotty.' },
  antihistamine: { name: 'ANTIHISTAMINE', color: '#ff5fa2', desc: 'Water, then Cooties, on a Hayfever Cell: it sneezes on its own side, and everything near it is Sick.' },
});
Object.assign(JUNK_POWERS, {
  hocker:   { name: 'Clear Your Throat', fmt: k => `+${5 * k}% projectile speed`, apply: P => { P.projSpeed += 0.05; } },
  snotbubble: { name: 'Nose Job', fmt: k => `+${3 * k}% swim speed`, apply: P => { P.speed += 0.03; } },
  hayfever: { name: 'Bless You', fmt: k => `+${3 * k}% dodge`, apply: P => { P.dodge += 0.03; } },
});
if (typeof PST_SHOOTERS !== 'undefined') PST_SHOOTERS.hocker = 'ice';
if (typeof RX_OF !== 'undefined') { RX_OF.antihistamine = 'pop'; RX_OF.popped = 'pop'; }

const F3 = {
  globs: [], // (live Hocker globs, watched until they land: f3patchTick)
  glob: { cd: 2.4, speed: 150, dmg: 8, r: 8, patchR: 40, stay: 1 }, // (patchR: Mucus patch radius it leaves; stay: Snotty seconds while you stand in a patch)
  bubble: { swell: 0.07, late: 4, max: 8, early: 80, big: 170, near: 24, snot: 3 }, // (grow per hit, hits that count as late, most hits that show, radii, your Snotty seconds when close)
  sneeze: { cd: 4.5, wind: 0.8, range: 230, half: 0.5, dur: 2, dmg: 0.6 }, // (half: cone half-angle; dmg: share of its contact damage)
};
// What the Hayfever Cell is carrying, as player statuses.
const f3carry = e => [e.pickle > 0 && 'wet', e.poison > 0 && 'sick', (e.chill > 0 || e.frozen > 0) && 'snot'].filter(Boolean);

Object.assign(FOE_AI, {
  hocker(e, dt, dist, ux, uy) {
    e.shootCd -= dt;
    if (e.shootCd <= 0 && dist < 460 && !e.charmed) {
      e.shootCd = F3.glob.cd * rand(0.85, 1.15);
      e.hockRT = G.realT;
      const se = shooterEnt, sn = shooterName, n = G.ebul.length;
      shooterEnt = e; shooterName = e.name;
      G.bulSeq = 0; // (a single glob always flies)
      eBullet(e.x + ux * e.r, e.y + uy * e.r, Math.atan2(uy, ux), F3.glob.speed, F3.glob.dmg * dmgNow(), F3.glob.r);
      shooterEnt = se; shooterName = sn;
      if (G.ebul.length > n) { const g = G.ebul[G.ebul.length - 1]; g.f3run = G; F3.globs.push(g); }
    }
    if (dist > 300) return null;
    if (dist < 200) return { x: -ux, y: -uy };
    return { x: -uy * e.side, y: ux * e.side };
  },
  hayfever(e, dt, dist, ux, uy) {
    if (e.snzW > 0) { // winding up: AH... AH...
      e.snzW -= dt;
      if (e.snzW <= 0) f3sneeze(e);
      return { x: 0, y: 0, s: 0 };
    }
    e.snzCd = (e.snzCd == null ? rand(1.5, 3) : e.snzCd) - dt;
    if (e.snzCd <= 0 && dist < F3.sneeze.range * 0.9 && !e.charmed) {
      e.snzW = F3.sneeze.wind; e.snzCd = F3.sneeze.cd; e.snzA = Math.atan2(uy, ux); e.windRT = G.realT;
      floatText(e.x, e.y - e.r - 12, 'AH... AH...', '#f2c6d6', 11, F3.sneeze.wind);
      return { x: 0, y: 0, s: 0 };
    }
    return null;
  },
});

// A Hocker glob that has landed (hit you, hit a wall, or run out of range) leaves a Mucus patch; standing in one keeps you Snotty.
function f3patchTick() {
  if (!G) return;
  const gl = F3.globs;
  for (let i = gl.length - 1; i >= 0; i--) {
    const b = gl[i];
    if (!b.dead && b.f3run === G) continue;
    gl.splice(i, 1);
    if (b.f3run !== G) continue; // (a glob from an earlier run)
    if (G.zones.length < 150 && typeof fightPatch === 'function') { const z = fightPatch(b.x, b.y, 'hocker'); z.r = F3.glob.patchR; z.f3patch = true; G.zones.push(z); }
  }
  const p = me();
  if (p && G.zones.length) for (const z of G.zones) if (z.f3patch && z.life > 0 && Math.hypot(p.x - z.x, p.y - z.y) < z.r + (p.r || 12) * 0.5) { pstGive('snot', F3.glob.stay); break; }
}
hookOn('tick', 'f3patchTick', f3patchTick);

// Snot Bubble: every hit swells it (not more than once every 0.1 s, so one burst of pellets is one hit).
function foes3Dmg(e, src) {
  if (e.def !== ENEMIES.snotbubble || e.dead || e.swT > G.t) return;
  const B = F3.bubble;
  e.swT = G.t + 0.1; e.r0 = e.r0 || e.r;
  e.swell = Math.min(B.max, (e.swell || 0) + 1); e.r = e.r0 * (1 + B.swell * e.swell);
  if (e.swell === B.late) floatText(e.x, e.y - e.r - 10, 'ABOUT TO GO', ELEMENTS.ice.color, 11, 0.8);
}
// It is gone: a small splash, or (late or popped) a burst that sticks everything nearby.
function f3snotOn(n, big) {
  n.chill = Math.max(n.chill || 0, 2.5);
  if (!big) return;
  n.chillAmt = Math.min(0.6, (n.chillAmt || 0) + 0.6);
  if (n.frozen <= 0) n.frozen = n.boss ? 0.4 : 1.3;
}
function foes3Kill(e) {
  if (e.def !== ENEMIES.snotbubble) return;
  const B = F3.bubble, p = me(), big = e.popped || (e.swell || 0) >= B.late, R = big ? B.big : B.early;
  forNear(e.x, e.y, R, n => { if (n !== e && !n.dead && !n.charmed && !n.rival && !n.egg) { f3snotOn(n, big); bolt(e.x, e.y, n.x, n.y, ELEMENTS.ice.color, 0.12); } });
  if (big && !e.popped && Math.hypot(p.x - e.x, p.y - e.y) < R * 0.6 + B.near) pstGive('snot', B.snot);
  spawnPart(e.x, e.y, '#e6f2d0', big ? 18 : 8, big ? 200 : 110, 0.5);
  floatText(e.x, e.y - e.r - 8, e.popped ? 'POP' : big ? 'SPLAT' : 'pop', ELEMENTS.ice.color, big ? 14 : 11, 0.7);
  if (big && G.zones.length < 180) G.zones.push({ x: e.x, y: e.y, r: 30, life: 4, max: 4, dps: 0, elem: 'ice', pull: 0, color: ELEMENTS.ice.color, tick: 0, src: { elem: 'ice', noStatus: true, wname: 'Snot' }, snot: true, quiet: true });
}

// CHOO. Anything in the cone gets what it is carrying.
function f3sneeze(e) {
  const p = me(), S = F3.sneeze, c = f3carry(e);
  e.snzRT = G.realT; e.snzRing = false;
  floatText(e.x, e.y - e.r - 12, 'CHOO!', '#f2c6d6', 13, 0.7);
  spawnPart(e.x + Math.cos(e.snzA) * e.r, e.y + Math.sin(e.snzA) * e.r, '#f2e6ea', 8, 160, 0.4);
  const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy);
  if (d > S.range + (p.r || 12) || Math.abs(angDiff(Math.atan2(dy, dx), e.snzA)) > S.half + 0.15) return;
  hurtPlayer(e.dmg * S.dmg, 'Hayfever Cell sneeze', e, 'blast');
  for (const k of c) pstGive(k, S.dur);
}

// After an enemy takes a damage type's status (chem.js).
function foes3Chem(e, elem, dmg, src, rsrc) {
  const say = id => { e.reactCd = 0; return react(e, id, src); }; // (always fires: a pair reaction on the same hit has not used it up)
  if (e.def === ENEMIES.snotbubble && elem === 'shock' && !e.popped && say('popped')) { e.popped = 1; damageEnemy(e, e.hp + 1, rsrc); return; }
  if (e.def === ENEMIES.hayfever) {
    if (elem === 'salt') e.f3wetT = G.t + 3;
    else if (elem === 'poison' && (e.pickle > 0 || e.f3wetT > G.t) && !(e.ahT > G.t) && say('antihistamine')) {
      e.ahT = G.t + 6; e.f3wetT = 0; e.snzW = 0; e.snzCd = F3.sneeze.cd; e.snzRT = G.realT; e.snzRing = true;
      forNear(e.x, e.y, 180, o => { if (o !== e && !o.boss && !o.charmed && !o.rival && !o.egg) { addSick(o, 3, dmg * 0.3 * rxK(o), rsrc.wname); bolt(e.x, e.y, o.x, o.y, REACTIONS.antihistamine.color, 0.15); } });
    }
  }
}

// ---------------------------------------------------------------- drawing (STYLE.md: soft waxy edges, no rings)
Object.assign(MICROBES, {
  hocker(e, x, y, r, face) {
    // A slimy lump with puffed cheeks; it swells just before it hocks, then sags.
    const k = G.realT - (e.hockRT || -9), sw = 1 + (e.shootCd < 0.5 ? 0.12 * (1 - Math.max(0, e.shootCd) / 0.5) : 0) - (k < 0.25 ? 0.08 * (1 - k / 0.25) : 0);
    f2blob(x, y, r * sw, 16, 0.08, e.id, f2t(e)); ctx.fillStyle = mBody(e, 0.45); ctx.fill(); mHalo(r * 0.12);
    // The mouth, at the front, and a drip hanging off it.
    const fx = x + Math.cos(face) * r * 0.62, fy = y + Math.sin(face) * r * 0.62;
    ctx.fillStyle = 'rgba(30,36,32,0.5)'; ctx.beginPath(); ctx.ellipse(fx, fy, r * 0.28, r * 0.16, face + Math.PI / 2, 0, TAU); ctx.fill();
    const dr = r * (0.18 + 0.08 * Math.sin(G.realT * 2 + e.id));
    ctx.fillStyle = 'rgba(220,232,190,0.75)'; ctx.beginPath(); ctx.arc(fx + Math.cos(face) * dr, fy + Math.sin(face) * dr + dr * 0.6, dr * 0.6, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.35, r * 0.32, r * 0.13, -0.5, 0, TAU); ctx.fill();
    if (e.garg > 0) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < e.garg; i++) { const a = G.realT * 2 + i * TAU / 3; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.45, y + Math.sin(a) * r * 0.45, r * 0.1, 0, TAU); ctx.fill(); } } // (bubbles: it is gargling)
  },
  snotbubble(e, x, y, r, face) {
    // A thin skin of snot over a breath: it wobbles harder and greens up the more it has swollen, with a drip at the bottom.
    const k = Math.min(1, (e.swell || 0) / F3.bubble.late), wob = 1 + 0.05 * k * Math.sin(G.realT * (8 + 10 * k) + e.id);
    ctx.fillStyle = 'rgba(30,36,32,0.25)'; ctx.beginPath(); ctx.ellipse(x, y + r * 1.05, r * 0.7, r * 0.18, 0, 0, TAU); ctx.fill();
    f2blob(x, y, r * wob, 18, 0.03, e.id, f2t(e)); ctx.fillStyle = mBody(e, 0.18 + 0.2 * k); ctx.fill(); mHalo(r * 0.1);
    ctx.lineWidth = Math.max(1, r * 0.08); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(x, y, r * 0.78, -2.6, -1.2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(x - r * 0.35, y - r * 0.4, r * 0.2, r * 0.1, -0.6, 0, TAU); ctx.fill();
    const dr = r * (0.16 + 0.05 * Math.sin(G.realT * 2 + e.id));
    ctx.fillStyle = 'rgba(220,232,190,0.75)'; ctx.beginPath(); ctx.arc(x + r * 0.1, y + r * 0.95 + dr, dr, 0, TAU); ctx.fill();
  },
  hayfever(e, x, y, r, face) {
    // A puffy cell dusted with pollen grains, two nostrils at the front. It swells as it winds up.
    const w = e.snzW > 0 ? 1 - e.snzW / F3.sneeze.wind : 0, sw = 1 + 0.18 * w;
    drawChargeFx(x, y, r, w, 'poison', e.id); // (chargefx.js)
    f2blob(x, y, r * sw, 18, 0.05, e.id, f2t(e)); ctx.fillStyle = mBody(e, 0.4); ctx.fill(); mHalo(r * 0.12);
    ctx.fillStyle = 'rgba(30,36,32,0.42)'; ctx.beginPath();
    for (let i = 0; i < 7; i++) { const a = i * 2.39 + e.id, d = r * 0.82 * sw, pr = r * 0.09; ctx.moveTo(x + Math.cos(a) * d + pr, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, pr, 0, TAU); }
    ctx.fill();
    const na = e.snzW > 0 ? e.snzA : face;
    for (const o of [-0.35, 0.35]) { const nx = x + Math.cos(na + o) * r * 0.55 * sw, ny = y + Math.sin(na + o) * r * 0.55 * sw; ctx.fillStyle = 'rgba(30,36,32,0.55)'; ctx.beginPath(); ctx.arc(nx, ny, r * (0.1 + 0.06 * w), 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.22, 0, TAU); ctx.fill();
    // The wind-up: a faint cone showing where the sneeze will go. Then the spray itself.
    const k = G.realT - (e.snzRT || -9), R = F3.sneeze.range * S, H = F3.sneeze.half;
    if (e.snzW > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.06 + 0.1 * w})`; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, R, na - H, na + H); ctx.closePath(); ctx.fill();
    } else if (k < 0.5) {
      const f = k / 0.5; ctx.fillStyle = `rgba(242,230,234,${0.7 * (1 - f)})`; ctx.beginPath();
      for (let i = 0; i < 26; i++) { const a = e.snzRing ? i / 26 * TAU : e.snzA + (((i * 0.618) % 1) * 2 - 1) * H, d = R * (0.2 + 0.8 * ((i * 0.381) % 1)) * (0.4 + 0.6 * f) * (e.snzRing ? 0.75 : 1), pr = Math.max(1, r * 0.08); ctx.moveTo(x + Math.cos(a) * d + pr, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, pr, 0, TAU); }
      ctx.fill();
    }
  },
});
// v10: chem.js no longer calls foes3Chem; the Snot Bubble's Static pop (ENEMY_DESIGN 6.1) rides the proc event instead.
function f3popped(e, dmg, src) { if (e && src && !src.dot && src.elem === 'shock' && e.def === ENEMIES.snotbubble && !e.popped && !e.dead) foes3Chem(e, 'shock', dmg, src, src); }
hookOn('hit:late', 'f3popped', f3popped);
