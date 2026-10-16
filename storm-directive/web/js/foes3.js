'use strict';
// Spawn Prawn - two enemies that use the player statuses (pstatus.js) against you, from ENEMY_IDEAS.md.
//   Phlegm Hocker (Mucus, punisher): hangs back and lobs big sticky globs that make you Snotty.
//     GARGLED (Water on it): its next 3 globs come out as rinse puddles that wash you clean.
//   Hayfever Cell (Cooties, punisher): every few seconds it winds up and sneezes a cone at you, giving you
//     whichever of Snotty, Sick and Soaking wet you have put on it. Pile statuses on it carelessly and it backfires.
//     ANTIHISTAMINE (Water, then Cooties on it): it sneezes on its own side instead, making its neighbours Sick.
// Hooks: chem.js (after an enemy takes a damage type's status) -> foes3Chem. Everything else rides foes2's
//   tables (cap, FOE_AI, MICROBES, ENEMY_INTRO).

Object.assign(ENEMIES, {
  hocker:   { name: 'Phlegm Hocker', hp: 32, speed: 50, armour: 0, r: 14, dmg: 8, xp: 4, color: '#b9c98a', shape: 'hocker', ai: 'hocker', from: 140, w: 1.2, cap: 6, f3rx: true,
    weak: { salt: 1.5 }, resist: { ice: 0.6 }, does: 'Lobs sticky globs that make you Snotty' },
  hayfever: { name: 'Hayfever Cell', hp: 50, speed: 48, armour: 1, r: 16, dmg: 10, xp: 5, color: '#f2c6d6', shape: 'hayfever', ai: 'hayfever', from: 200, w: 1.0, cap: 6, f3rx: true,
    weak: { salt: 1.5 }, resist: { poison: 0.6 }, does: 'Sneezes the statuses you gave it back at you' },
});
Object.assign(ENEMY_INTRO, {
  hocker:   { what: 'Clears its throat, then lobs a big glob of phlegm at you. A direct hit leaves you Snotty: slower for a few seconds.', tip: 'Strafe, don\'t back off in a straight line. Water makes it gargle, and its next globs land as puddles that rinse you clean.' },
  hayfever: { what: 'Allergic to everything, mostly you. Every few seconds it winds up (AH... AH...) and sneezes a cone at you, and it sneezes back whatever statuses you have given it.', tip: 'Step out of the cone when it winds up, and go easy on the statuses. Soak it with Water, then give it Cooties, and it sneezes on its friends instead.' },
});
Object.assign(REACTIONS, {
  gargled:       { name: 'GARGLED',       color: '#3d8bff', desc: 'Water on a Phlegm Hocker: its next 3 globs land as rinse puddles that wash you clean.' },
  antihistamine: { name: 'ANTIHISTAMINE', color: '#ff5fa2', desc: 'Water, then Cooties, on a Hayfever Cell: it sneezes on its own side, and everything near it is Sick.' },
});
Object.assign(JUNK_POWERS, {
  hocker:   { name: 'Clear Your Throat', fmt: k => `+${5 * k}% projectile speed`, apply: P => { P.projSpeed += 0.05; } },
  hayfever: { name: 'Bless You', fmt: k => `+${3 * k}% dodge`, apply: P => { P.dodge += 0.03; } },
});
if (typeof PST_SHOOTERS !== 'undefined') PST_SHOOTERS.hocker = 'ice';
if (typeof RX_OF !== 'undefined') { RX_OF.gargled = 'splash'; RX_OF.antihistamine = 'pop'; }

const F3 = {
  glob: { cd: 2.4, speed: 150, dmg: 8, r: 8, dose: 1.7 },        // (dose: Snotty seconds x this)
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
      const p = me();
      if (e.garg > 0) { // (gargled: a rinse puddle on the way to you instead)
        e.garg--;
        if (G.zones.length < 200) { const k = 0.7, x = e.x + (p.x - e.x) * k, y = e.y + (p.y - e.y) * k; G.zones.push({ x, y, r: 42, life: 5, max: 5, dps: 0, elem: 'salt', pull: 0, color: ELEMENTS.salt.color, tick: 0, src: { elem: 'salt', noStatus: true, wname: 'Rinse' }, water: true, quiet: true }); spawnPart(x, y, ELEMENTS.salt.color, 6, 70, 0.4); }
      } else {
        const se = shooterEnt, sn = shooterName, n = G.ebul.length;
        shooterEnt = e; shooterName = e.name;
        G.bulSeq = 0; // (a single glob always flies)
        eBullet(e.x + ux * e.r, e.y + uy * e.r, Math.atan2(uy, ux), F3.glob.speed, F3.glob.dmg * dmgNow(), F3.glob.r);
        shooterEnt = se; shooterName = sn;
        if (G.ebul.length > n) G.ebul[G.ebul.length - 1].pk = F3.glob.dose;
      }
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
  if (e.def === ENEMIES.hocker && elem === 'salt' && !(e.garg > 0) && say('gargled')) e.garg = 3;
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
  hayfever(e, x, y, r, face) {
    // A puffy cell dusted with pollen grains, two nostrils at the front. It swells as it winds up.
    const w = e.snzW > 0 ? 1 - e.snzW / F3.sneeze.wind : 0, sw = 1 + 0.18 * w;
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
