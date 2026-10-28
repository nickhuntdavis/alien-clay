'use strict';
// Spawn Prawn - Holy/Damned: the damage type that replaced Parasite (internal id still `soul`, no save migration).
//  - Every soul hit carries a polarity: +1 Holy (white and gold) or -1 Damned (black with a red-purple glow).
//    A source's chance of Holy is its `holyP` (HOLY_P by weapon or Feat id, 1 = always Holy, 0 = always Damned);
//    a mixed source (0 < p < 1, Prawn Again's whole kit) flips on a shared HOLY.cycle clock, Holy for p of it.
//    The two bias cards (h_devout, h_heretic: mutations.js style) move every source's p by 0.25 a rank.
//  - The soul build-up bar (combat.js, 0.6) fills as before and keeps a signed total of the hits that filled it.
//    Full with the total >= 0: the HOLY verdict, Possessed exactly as before (curseFoe: fights its mates).
//    Full with the total < 0: the DAMNED verdict, e.damnT: +30% damage from everything for HOLY.ampT, and a death
//    while damned hands HOLY.spread of Damned bar to every mate within HOLY.spreadR (bosses: +15%, 1.5 s).
//    Reactions on "a Possessed enemy" (fight.js f_possessed) fire on either verdict.
//  - Looks: holyCol(pol) for shots, wisps, bars and ribbons (typelook.js, typefx.js, fight.js read it);
//    the player wears a halo or horns while any held mixed source is in that half of the cycle (render.js).
// Hooks: combat.js resolveHit -> holyBar; fight.js fightPayoff 'possess' -> holyPayoff, f_possessed -> holyDamned,
//   fightHit -> holyPol (the hit's polarity before resolveHit); game.js fireWeapon 'fire:after' (pr.pol, pr.color);
//   hooks dmgMul (the Damned amp) and kill (the spread); render.js after drawShip -> holyDrawYou.
// Save data: none. Loads after mutations.js (its cards) and samples10.js.

const HOLY = {
  holy: { col: '#fff6d6', glow: '#ffcf5a', dk: '#c99a2e' },
  damned: { col: '#120810', glow: '#8a1a50', dk: '#3a0820' },
  cycle: 6,         // s: the shared clock mixed sources flip on
  ampK: 0.3, ampT: 4, bossAmpK: 0.15, bossAmpT: 1.5,
  spread: 0.35, spreadR: 90,
  biasRank: 0.25,
};
// Chance of Holy per source id (weapon or Feat). Anything soul-typed and not listed is a coin (0.5).
const HOLY_P = {
  // weapons (weapons24.js ids, plus the sigweap/data.js ids they were built from)
  v_soul_proj: 0, s_peekaboo: 0, s_parasite: 0, s_toothfairy: 1, orbit: 1, void: 0, friend: 1, peekaboo: 0, parasite: 0, toothfairy: 1,
  v_soul_beam: 1, v_soul_burst: 0,
  // Feats (feats10.js / gifts10.js ids)
  jump_scare: 0, vanishing_twin: 1, recount: 1, wandering_womb: 0, x4_friends: 1, x7_extras: 1, x8_notreal: 0,
  blackhole: 0, warp: 1, ouija: 0, vanishingtwin: 1, wanderingwomb: 0,
};
const holyBias = () => (typeof mr === 'function' ? HOLY.biasRank * (mr('h_devout') - mr('h_heretic')) : 0);
const holyIdOf = w => (w && ((w.def && w.def.f10 && w.def.f10.id) || w.id || (w.def && w.def.id))) || null;
const holyBaseP = w => {
  if (w && w.holyP != null) return w.holyP;
  if (w && w.def && w.def.holyP != null) return w.def.holyP;
  const id = holyIdOf(w); if (id != null && HOLY_P[id] != null) return HOLY_P[id];
  const k = id && typeof w24Key === 'function' ? w24Key(w) : null; if (k && HOLY_P[k] != null) return HOLY_P[k];
  return 0.5;
};
// A source's Holy chance now (bias applied), and its polarity on the shared clock.
const holyP = w => Math.max(0, Math.min(1, holyBaseP(w) + holyBias()));
const holyPhase = p => (G ? G.t % HOLY.cycle : 0) < p * HOLY.cycle;
const holyPolW = w => { const p = holyP(w); return p >= 1 ? 1 : p <= 0 ? -1 : holyPhase(p) ? 1 : -1; };
// The polarity of one hit (fight.js fightHit): the source's own, else its weapon's, else the clock at a coin.
function holyPol(src) {
  if (!src) return holyPolW(null);
  if (src.pol) return src.pol;
  return holyPolW(src.w || null);
}
const holyCol = pol => (pol < 0 ? HOLY.damned.glow : HOLY.holy.glow);
const holyCol2 = pol => (pol < 0 ? HOLY.damned.col : HOLY.holy.col);
let HOLY_HIT = 1; // (the polarity of the hit being resolved, set by fightHit before resolveHit)

// ---------------------------------------------------------------- the bar (combat.js resolveHit)
function holyBar(cd, inc, before) {
  if (!(before > 0.02)) cd.polSum = 0; // (a fresh fill forgets the last one)
  cd.polSum = (cd.polSum || 0) + HOLY_HIT * inc;
}
const holyBarCol = cd => holyCol(cd && cd.polSum < 0 ? -1 : 1);
const holyDamned = e => !!e && e.damnT > G.t;

// ---------------------------------------------------------------- the two verdicts (fight.js fightPayoff)
function holyPayoff(e, cd, src) {
  const pol = cd && cd.polSum < 0 ? -1 : 1;
  if (cd) cd.polSum = 0;
  if (pol > 0) { // HOLY: Possessed, as before
    if (!(e.possNextT > G.t)) { e.possNextT = G.t + 12; curseFoe(e, e.boss ? 1.5 : e.elite ? 2.5 : 4); }
    return;
  }
  if (e.damnNextT > G.t) return;
  e.damnNextT = G.t + 12;
  e.damnT = G.t + (e.boss ? HOLY.bossAmpT : HOLY.ampT); e.damnK = e.boss ? HOLY.bossAmpK : HOLY.ampK; e.damnedBy = src && src.wname;
  floatText(e.x, e.y - e.r - 12, 'DAMNED', HOLY.damned.glow, 11, 0.7);
  ring(e.x, e.y, e.r + 10, HOLY.damned.glow, 0.4, 4);
  if (typeof fxParts === 'function') fxParts('smoke', e.x, e.y, HOLY.damned.dk, 8, 50, 0.6, 3);
}
hookOn('dmgMul', 'holy:damned', (e, src) => (holyDamned(e) ? 1 + (e.damnK || HOLY.ampK) : 1));
hookOn('kill', 'holy:spread', e => {
  if (!holyDamned(e) || e.boss) return;
  ring(e.x, e.y, HOLY.spreadR, HOLY.damned.glow, 0.35, 3);
  forNear(e.x, e.y, HOLY.spreadR, o => {
    if (o === e || o.dead || o.charmed) return;
    const c = fightCd(o); c.bars.soul = Math.min(0.999, c.bars.soul + HOLY.spread); c.barQuietT.soul = 0; c.polSum = Math.min(c.polSum || 0, 0) - HOLY.spread;
    if (typeof fxParts === 'function') fxParts('smoke', o.x, o.y, HOLY.damned.dk, 3, 30, 0.5, 2.5);
  });
});

// ---------------------------------------------------------------- shots carry their polarity (fire:after)
hookOn('fire:after', 'holy:shots', (w, target, n0) => {
  if (!G || !w || !w.def || w.def.elem !== 'soul') return;
  const pol = holyPolW(w), c = holyCol(pol);
  for (let i = n0; i < G.proj.length; i++) { const pr = G.proj[i]; if (pr.src && pr.src.w === w) { pr.pol = pol; pr.src = Object.assign({}, pr.src, { pol }); pr.color = c; } }
});

// ---------------------------------------------------------------- the player's halo or horns (render.js, after drawShip)
// Shown while you hold a mixed soul source: which half of the clock you are in.
function holyYouPol() {
  if (!G || !G.weapons) return 0;
  let p = null;
  for (const w of G.weapons.concat(G.spells || [])) if (w && w.def && w.def.elem === 'soul') { const q = holyP(w); if (q > 0 && q < 1) { p = q; break; } }
  if (p == null) return 0;
  return holyPhase(p) ? 1 : -1;
}
function holyDrawYou(px, py) {
  const pol = holyYouPol(); if (!pol) return;
  const p = G.player, r = (p.r || 12) * S, t = G.realT, rc = RAW_COL; RAW_COL = true;
  ctx.save();
  if (pol > 0) { // a halo floating over the head
    ctx.globalAlpha = 0.75 + 0.2 * Math.sin(t * 4); ctx.strokeStyle = HOLY.holy.glow; ctx.lineWidth = Math.max(1.5, r * 0.16);
    ctx.beginPath(); ctx.ellipse(px, py - r * 1.5 + Math.sin(t * 2) * r * 0.1, r * 0.8, r * 0.28, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 0.5; ctx.strokeStyle = HOLY.holy.col; ctx.lineWidth = Math.max(1, r * 0.06); ctx.stroke();
  } else { // two horns and a dim glow
    ctx.globalAlpha = 0.9; ctx.fillStyle = HOLY.damned.col; ctx.strokeStyle = HOLY.damned.glow; ctx.lineWidth = Math.max(1, r * 0.08);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(px + s * r * 0.45, py - r * 0.7); ctx.quadraticCurveTo(px + s * r * 0.9, py - r * 1.1, px + s * r * 0.55, py - r * 1.55); ctx.quadraticCurveTo(px + s * r * 0.55, py - r * 1.0, px + s * r * 0.2, py - r * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.globalAlpha = 0.18 + 0.08 * Math.sin(t * 6); ctx.fillStyle = HOLY.damned.glow; ctx.beginPath(); ctx.arc(px, py, r * 1.9, 0, TAU); ctx.fill();
  }
  ctx.restore(); RAW_COL = rc;
}

// ---------------------------------------------------------------- the bias cards (mutations.js mutCard)
if (typeof mutCard === 'function') {
  const why = () => (typeof hasType === 'function' && hasType('soul') ? '' : 'needs a Holy/Damned weapon or Feat');
  mutCard({ id: 'h_devout', title: 'TODO_COPY:h_devout_title', icon: 'HO', type: 'soul', family: 'holy:bias', color: HOLY.holy.glow, rarity: 1, maxRank: 3, why, flavour: 'TODO_COPY:h_devout_flavour',
    desc: 'TODO_COPY:h_devout_desc' });
  mutCard({ id: 'h_heretic', title: 'TODO_COPY:h_heretic_title', icon: 'DA', type: 'soul', family: 'holy:bias', color: HOLY.damned.glow, rarity: 1, maxRank: 3, why, flavour: 'TODO_COPY:h_heretic_flavour',
    desc: 'TODO_COPY:h_heretic_desc' });
}
