'use strict';
// Spawn Prawn - player statuses. Some enemies' bullets carry a damage type, and a typed bullet that lands
// gives you that type's status for a few seconds, so what is shooting at you matters, not just how much:
//   Mucus bullets   -> SNOTTY: you swim slower.
//   Cooties bullets -> SICK: you lose a little health a second (never the last point) and heal at half rate.
//   Water bullets   -> SOAKING WET: Static bullets hit you much harder. Water also washes Snotty and Melting off.
//   Static bullets  -> no status of their own; they are the reason not to stay wet.
// Each hit adds time up to a cap. Your own Water puddles rinse Snotty and Sick off (chem.js chemPlayerZones).
// Typed bullets carry a small white mark (a germ, a highlight, a spark) so they read in Lab view too.
// Hooks: game.js eBullet -> pstElem; hurtPlayer -> pstHurtMul, pstHit; healPlayer -> pstHeal; player speed -> pstSpeed;
//   update -> pstTick. render.js HUD chips -> pstChips; enemy bullets -> pstBulletMarks. chem.js rinse and
//   newfeats.js Fecal Transplant -> pstOn/pstClear.

// Which enemies shoot which damage type (enemy id -> type). Everything else (bosses included) stays untyped.
const PST_SHOOTERS = { spitter: 'ice', warlock: 'poison', diatom: 'salt', lancer: 'shock', sperminator: 'shock', endoskeleton: 'shock' };
const PST = {
  snot: { add: 1.2, cap: 3, slow: 0.8 },          // (seconds per hit, most seconds, speed multiplier)
  sick: { add: 2, cap: 5, dps: 0.01, heal: 0.5 },  // (dps: share of max HP a second)
  wet:  { add: 3, cap: 6, shock: 1.6 },            // (Static hits on you while wet)
};
const PST_OF = { ice: 'snot', poison: 'sick', salt: 'wet' };
const PST_NAME = { snot: 'SNOTTY', sick: 'SICK', wet: 'SOAKING WET' };

Object.assign(STATUS_INTRO, {
  'SNOTTY':      { buff: 0, what: 'An Antibody glob stuck to you: you swim 20% slower while it lasts. Every Mucus hit adds a bit more.', tip: 'Swim through one of your own Water puddles, or get wet, to wash it off.' },
  'SICK':        { buff: 0, what: 'A Cytokine Caster gave you Cooties: you lose a little health every second and heal at half rate. It will not finish you off.', tip: 'Rinse it off in a Water puddle, or wait it out before picking up health.' },
  'SOAKING WET': { buff: 0, what: 'A Diatom soaked you. Static bullets hit you 60% harder while you are wet. On the plus side, the water washes off snot and acid.', tip: 'Keep away from Killer T-Cells and Boosters until you dry off.' },
});

const pstS = () => G.pst || (G.pst = { snot: 0, sick: 0, wet: 0 });
const pstHas = k => G && G.pst && G.pst[k] > G.t;
const pstElem = ent => ent && !ent.boss && ent.def ? pstId(ent.def) || null : null;
let PST_IDS = null;
function pstId(def) {
  if (!PST_IDS) { PST_IDS = new Map(); for (const k in PST_SHOOTERS) if (ENEMIES[k]) PST_IDS.set(ENEMIES[k], PST_SHOOTERS[k]); }
  return PST_IDS.get(def);
}
const pstOn = () => pstHas('snot') || pstHas('sick');
function pstClear() { if (G && G.pst) { G.pst.snot = 0; G.pst.sick = 0; } }

// Static bullets on a wet swimmer.
function pstHurtMul(hf, kind) {
  if (kind !== 'bullets' || !hf || hf.pel !== 'shock' || !pstHas('wet')) return 1;
  const p = me();
  if (!(G.pstZapT > G.t)) { G.pstZapT = G.t + 1.5; floatText(p.x, p.y - 32, 'ZAPPED IN THE BATH', ELEMENTS.shock.color, 12, 0.9); spawnPart(p.x, p.y, ELEMENTS.shock.color, 6, 120, 0.3); }
  return PST.wet.shock;
}
// A typed bullet landed (after dodges, shields and armour).
function pstHit(hf) {
  const k = hf && PST_OF[hf.pel];
  if (!k) return;
  const S = pstS(), C = PST[k], p = me(), was = S[k] > G.t;
  S[k] = Math.min(G.t + C.cap, Math.max(S[k], G.t) + C.add);
  if (k === 'wet') { S.snot = 0; G.acidOn = 0; G.sizzle = 0; }
  if (k === 'snot' && S.wet > G.t) S.snot = 0; // (it slides straight off a wet swimmer)
  if (!was && S[k] > G.t) floatText(p.x, p.y - 32, PST_NAME[k], ELEMENTS[hf.pel].color, 12, 0.9);
}
const pstSpeed = () => pstHas('snot') ? PST.snot.slow : 1;
const pstHeal = () => pstHas('sick') ? PST.sick.heal : 1;
function pstTick(dt) {
  if (!G.pst || G.state !== 'play') return;
  const p = me();
  if (pstHas('sick') && p.hp > 1 && !(G.debug && G.debug.god)) {
    const d = Math.min(p.hp - 1, G.P.maxHp * PST.sick.dps * dt);
    p.hp -= d; G.stats.hurt.Sick = (G.stats.hurt.Sick || 0) + d;
  }
  // A drip, a speck or a droplet now and then, so you can see it on you.
  for (const k in PST_OF) { const s = PST_OF[k]; if (pstHas(s) && Math.random() < dt * 5) spawnPart(p.x + rand(-6, 6), p.y + rand(-6, 6), ELEMENTS[k].color, 1, 30, 0.5); }
}
function pstChips(chips) {
  if (!G.pst) return;
  const left = k => Math.ceil(G.pst[k] - G.t) + 's';
  if (pstHas('snot')) chips.push(['SNOTTY: SLOW ' + left('snot'), ELEMENTS.ice.color]);
  if (pstHas('sick')) chips.push(['SICK: HEALING -50% ' + left('sick'), ELEMENTS.poison.color]);
  if (pstHas('wet')) chips.push(['SOAKING WET: STATIC +60% ' + left('wet'), ELEMENTS.salt.color]);
}
// White marks on the black granules: Mucus a glob highlight, Cooties three germs, Water a droplet glint, Static a spark.
function pstBulletMarks(vis) {
  let any = false;
  for (const b of G.ebul) if (b.pel) { any = true; break; }
  if (!any) return;
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, 1.2 * S);
  ctx.beginPath();
  for (const b of G.ebul) {
    if (!b.pel || !vis(b)) continue;
    const x = sx(b.x), y = sy(b.y), r = b.r * 0.8 * S, d = Math.max(1, r * 0.3);
    if (b.pel === 'salt') { ctx.moveTo(x - r * 0.25 + d, y - r * 0.3); ctx.arc(x - r * 0.25, y - r * 0.3, d, 0, TAU); }
    else if (b.pel === 'ice') { ctx.moveTo(x + d * 1.4, y); ctx.arc(x, y, d * 1.4, 0, TAU); }
    else if (b.pel === 'poison') for (let i = 0; i < 3; i++) { const a = G.realT * 3 + i * TAU / 3, gx = x + Math.cos(a) * (r + d * 1.6), gy = y + Math.sin(a) * (r + d * 1.6); ctx.moveTo(gx + d, gy); ctx.arc(gx, gy, d, 0, TAU); }
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
