'use strict';
// Spawn Prawn - player statuses. Under v10 the hits on you take their statuses from damage types (pdef.js); what is
// left here is SNOTTY, which the Phlegm Hocker's glob and patch, the Snot Bubble and the Hayfever Cell's sneeze give you:
//   Snotty -> you swim slower. Each dose adds time up to a cap.
// Spitter, Killer T-Cell, Sperminator and Endoskeleton bullets carry a small white mark (a glob highlight, a spark) so
// their type reads in Lab view too. Grease Balls lob a slow glob now and then.
// Hooks: game.js eBullet -> pstElem; player speed -> pstSpeed; update -> pstTick; render.js HUD chips -> pstChips;
//   enemy bullets -> pstBulletMarks. chem.js rinse and newfeats.js Fecal Transplant -> pstOn/pstClear.

// Which enemies shoot which damage type (enemy id -> type). Everything else (bosses included) stays untyped.
const PST_SHOOTERS = { spitter: 'ice', lancer: 'shock', sperminator: 'shock', endoskeleton: 'shock' };
const PST = {
  snot: { add: 1.2, cap: 3, slow: 0.8 },          // (seconds per hit, most seconds, speed multiplier)
};
const PST_OF = { ice: 'snot' };
const PST_NAME = { snot: 'SNOTTY' };
const PST_GLOB = 6; // (a Grease Ball lobs a glob every N s)

Object.assign(STATUS_INTRO, {
  'SNOTTY':      { buff: 0, what: 'An Antibody glob stuck to you: you swim 20% slower while it lasts. Every Mucus hit adds a bit more.', tip: 'Swim through one of your own Water puddles, or get wet, to wash it off.' },
});

const pstS = () => G.pst || (G.pst = { snot: 0 });
const pstHas = k => G && G.pst && G.pst[k] > G.t;
const pstElem = ent => ent && !ent.boss && ent.def ? pstId(ent.def) || null : null;
let PST_IDS = null;
function pstId(def) {
  if (!PST_IDS) { PST_IDS = new Map(); for (const k in PST_SHOOTERS) if (ENEMIES[k]) PST_IDS.set(ENEMIES[k], PST_SHOOTERS[k]); }
  return PST_IDS.get(def);
}
const pstOn = () => pstHas('snot');
function pstClear() { if (G && G.pst) G.pst.snot = 0; }

// Give a status for `add` seconds (up to its cap). Also used by the Hocker, the Snot Bubble and the Hayfever Cell's sneeze (foes3.js).
function pstGive(k, add) {
  const S = pstS(), C = PST[k], p = me(), was = S[k] > G.t;
  S[k] = Math.min(G.t + C.cap, Math.max(S[k], G.t) + add);
  const el = 'ice';
  if (!was && S[k] > G.t) floatText(p.x, p.y - 32, PST_NAME[k], ELEMENTS[el].color, 12, 0.9);
}
const pstSpeed = () => pstHas('snot') ? PST.snot.slow : 1;
function pstTick(dt) {
  if (G.state !== 'play') return;
  pstGrease(dt);
  const p = me();
  if (!G.pst) return;
  // A drip, a speck or a droplet now and then, so you can see it on you.
  for (const k in PST_OF) { const s = PST_OF[k]; if (pstHas(s) && Math.random() < dt * 5) spawnPart(p.x + rand(-6, 6), p.y + rand(-6, 6), ELEMENTS[k].color, 1, 30, 0.5); }
}
function pstChips(chips) {
  if (!G.pst) return;
  const left = k => Math.ceil(G.pst[k] - G.t) + 's';
  if (pstHas('snot')) chips.push(['SNOTTY: SLOW ' + left('snot'), ELEMENTS.ice.color]);
}
// Grease Balls: a slow glob now and then (the slick they left is gone: Lubricated is retired).
function pstGrease(dt) {
  const p = me();
  for (const e of G.enemies) {
    if (e.dead || !e.def.grease || e.charmed || e.boss) continue;
    e.ggT = (e.ggT == null ? rand(2, PST_GLOB) : e.ggT) - dt;
    const d = Math.hypot(p.x - e.x, p.y - e.y);
    if (e.ggT <= 0 && d > 90 && d < 340) {
      e.ggT = PST_GLOB * rand(0.85, 1.15);
      const se = shooterEnt, sn = shooterName;
      shooterEnt = e; shooterName = e.name; G.bulSeq = 0;
      eBullet(e.x, e.y, Math.atan2(p.y - e.y, p.x - e.x), 120, e.dmg * 0.35 * dmgNow(), 7);
      shooterEnt = se; shooterName = sn;
    }
  }
}
// White marks on the black granules: Mucus a glob highlight, Static a spark.
function pstBulletMarks(vis) {
  let any = false;
  for (const b of G.ebul) if (b.pel) { any = true; break; }
  if (!any) return;
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, 1.2 * S);
  ctx.beginPath();
  for (const b of G.ebul) {
    if (!b.pel || !vis(b)) continue;
    const x = sx(b.x), y = sy(b.y), r = b.r * 0.8 * S, d = Math.max(1, r * 0.3);
    if (b.pel === 'ice') { ctx.moveTo(x + d * 1.4, y); ctx.arc(x, y, d * 1.4, 0, TAU); }
  }
  ctx.fill();
  ctx.beginPath();
  for (const b of G.ebul) {
    if (b.pel !== 'shock' || !vis(b)) continue;
    const x = sx(b.x), y = sy(b.y), r = b.r * 0.6 * S;
    ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r);
  }
  ctx.stroke();
}
