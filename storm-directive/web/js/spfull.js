'use strict';
// Spawn Prawn - the rest of the sperm passives (redesign docs/SPERM_PASSIVES.md 2 and 3; user 23 Oct: "continue work on
// sperm passives"). Simple descriptive names and lines for now (user's request); the user may replace any of them.
//  - THE LIST: level-up drafts deal only the passives in SP_KEEP (the doc's 30, as far as they are built). Every other
//    Genome card (Sticky Fingers, the old damage-type cards, Come Closer and Death Is Recycling as cards, the v9 g_ cards...)
//    joins spassives.js SP.cut. Defences: all eight pdef.js cards.
//  - RENAMED to the doc's names: Hair Trigger -> Overexcited, Clingy -> Stickier, First Impressions -> All at Once,
//    Eating for Two -> Hungry Hungry.
//  - NEW (3 levels and a mastery each; the mastery uses spassives.js spMasteryRoom):
//    PILE-UP (Force): Force hits knock back 30/60/90% further; an enemy sent flying deals 20/30/40% of the hit to the
//      first enemy it hits. Mastery: that enemy is knocked flying too (depth 2).
//    WET FLOOR (Acid): your Acid pools are 30/60/90% bigger and last as much longer. Mastery: an enemy standing in one
//      loses a Shell layer every 2 s.
//    CHAIN LETTER (Static): Charge arcs and chaining weapons get +1/2/3 jumps and +20/40/60 jump range. Mastery: arcs
//      lose no damage per jump.
//    BLEEDING HEART (Blood): Bleeds deal 25/50/75% more; Extraction heals 50/100/150% more. Mastery (Bad Blood): pools from
//      bleeding deaths are 50% bigger, and enemies standing in them Bleed.
//    PEER PRESSURE (Alien): Possessed lasts 30/60/90% longer; possessed enemies hit their mates 20/40/60% harder.
//      Mastery: a possessed enemy that kills a mate possesses that mate's nearest neighbour for 1 s.
//    LEAVE A LITTLE SOMETHING: every pool you make (weapons, Feats, reactions) lasts 50/75/100% longer and gives one
//      last tick at double damage as it ends. Mastery: triple.
//  - PAIRS (automatic while both are held; no card, no slot): COME CLOSER (Stickier + Pile-Up): Snared enemies take +25%
//    Force damage, and a Force hit on one pulls the other Snared enemies within 80 towards it. DEATH IS RECYCLING (Peer
//    Pressure + Crossed Wires): an enemy you kill while it is Possessed lets out a wisp that fills 25% of the nearest
//    enemy's Alien bar (mutations.js st.fly). Holding one half makes the draft offer the other 50% more often.
//  - THE RUNS mastery: close a loop of trail and everything inside takes one hit of its damage type (spfLoopTick).
// Not built: the doc's other masteries (for now one step further on the numbers).
// Hooks: none in shared files. Wraps fight.js fightStatus, fightDeath, fightArc; chem.js curseFoe; mutations.js mutHit;
// weapons24.js wupStats, wupDmgMul, wupTick, wupKill; v10.js v10Draw; the pair cards' start flag (draft.js weight). Loads after matrixonly.js.

const SP_KEEP = ['sp_runs', 'm_slip', 'm_heart', 'm_excite', 'r_group', 'r_pains', 'sp_leave', 'm_pad', 'sp_pile', 'sp_wet', 'sp_chain',
  't_mucus', 'sp_bleed', 'sp_peer', 'sp_fever', 't_wires', 'r_mess', 'x_brain', 'x_still', 'x_once', 'x_hungry', 'sp_extra', 'sp_space', 'sp_iric'];
const SPF_PAIRS = [['t_mucus', 'sp_pile'], ['sp_peer', 't_wires']];

// ---------------------------------------------------------------- cards
mutCard({ id: 'sp_pile', title: 'Pile-Up', icon: 'PU', type: 'force', family: MUT_TF('force'), color: MUT_COL.force, rarity: 1, maxRank: 3, why: needType('force', 'Force'),
  flavour: 'Knock one into another.', desc: 'Force hits knock enemies further. An enemy sent flying hurts the first enemy it hits.' });
mutCard({ id: 'sp_wet', title: 'Wet Floor', icon: 'WF', type: 'acid', family: MUT_TF('acid'), color: MUT_COL.acid, rarity: 1, maxRank: 3, why: needType('acid', 'Acid'),
  flavour: 'Bigger puddles.', desc: 'Your Acid pools are bigger and last longer.' });
mutCard({ id: 'sp_chain', title: 'Chain Letter', icon: 'CL', type: 'static', family: MUT_TF('static'), color: MUT_COL.static, rarity: 1, maxRank: 3, why: needType('static', 'Static'),
  flavour: 'More jumps.', desc: 'Static arcs and chains jump to more enemies, from further away.' });
mutCard({ id: 'sp_bleed', title: 'Bleeding Heart', icon: 'BH', type: 'blood', family: MUT_TF('blood'), color: MUT_COL.blood, rarity: 1, maxRank: 3, why: needType('blood', 'Blood'),
  flavour: 'Bleed more, heal more.', desc: 'Bleeds hurt more, and killing a bleeding enemy heals you more.' });
mutCard({ id: 'sp_peer', title: 'Peer Pressure', icon: 'PP', type: 'soul', family: MUT_TF('soul'), color: MUT_COL.soul, rarity: 2, maxRank: 3, why: needType('soul', 'Alien'),
  flavour: 'Longer possession.', desc: 'Possessed lasts longer, and possessed enemies hit their mates harder.' });
mutCard({ id: 'sp_leave', title: 'Leave a Little Something', icon: 'LS', rarity: 1, maxRank: 3,
  flavour: 'Pools last longer.', desc: 'Every pool you make lasts longer and hits twice as hard as it dries up.' });
for (const id of ['sp_pile', 'sp_wet', 'sp_chain', 'sp_bleed', 'sp_peer', 'sp_leave']) { // masteries: a 4th rank, one a build
  const c = MUT_REG.find(x => x.id === id), el = c.eligible, ap = c.apply;
  c.maxRank = 4; c.eligible = G => el(G) && (mr(id) < 3 || spMasteryRoom('sperm'));
  c.apply = (G, t) => { const r0 = mr(id); ap(G, t); if (r0 === 3 && mr(id) === 4) (G.spM || (G.spM = [])).push(id); };
}
{ // the doc's names
  const ren = { m_excite: ['Overexcited', 'A quick run of kills makes you attack faster for a few seconds.'], t_mucus: ['Stickier', 'Snared lasts longer.'],
    x_once: ['All at Once', null], x_hungry: ['Hungry Hungry', null] };
  for (const id in ren) { const c = MUT_REG.find(x => x.id === id); if (!c) continue; c.title = ren[id][0]; if (ren[id][1]) c.desc = ren[id][1]; }
}
// The list: everything else stays out of drafts.
SP.cut.push(...MUT_REG.concat(CARDS).filter(c => c.slot === 'genome' && !SP_KEEP.includes(c.id)).map(c => c.id)); // (CARDS: the v9 g_ cards, v9back.js)
if (typeof SLICE !== 'undefined') {
  for (const id of SP_KEEP) if (!SLICE.muts.includes(id)) SLICE.muts.push(id);
  for (const k of Object.keys(PDEF_CARDS)) if (!SLICE.defs.includes(k)) SLICE.defs.push(k);
}
const spfPair = (a, b) => mr(a) > 0 && mr(b) > 0;
const spfNear = (x, y, r, f) => { for (const e of G.enemies) if (!e.dead && Math.hypot(e.x - x, e.y - y) < r) f(e); }; // (not forNear: its grid lags a frame behind spawns)

// ---------------------------------------------------------------- Pile-Up and Come Closer (after a hit: mutations.js mutHit)
mutHit = (orig => function (e, d, src, t, res) {
  orig(e, d, src, t, res);
  if (!G || !G.muts || src.dot || src.mut || src.echo || src.rx || t !== 'force' || e.dead) return;
  const r = mr('sp_pile');
  if (r && !e.boss) {
    const k = 1 + 0.3 * Math.min(3, r); e.kx *= k; e.ky *= k;
    if (Math.hypot(e.kx, e.ky) > 40 && d > 0) e.spPile = { t: G.t + 0.6, dmg: d * [0.2, 0.3, 0.4, 0.4][r - 1], depth: src.spPileD || 0, w: src.w };
  }
  if (spfPair('t_mucus', 'sp_pile') && mutSnared(e) && !(e.spPullT > G.t)) { // Come Closer: pull the other Snared enemies in
    e.spPullT = G.t + 0.5;
    spfNear(e.x, e.y, 80, o => {
      if (o === e || o.dead || !mutSnared(o)) return;
      const l = Math.hypot(e.x - o.x, e.y - o.y) || 1, k = 260 * (12 / Math.max(12, o.r)) * (o.boss ? 0.25 : o.elite ? 0.5 : 1) * (o.cd && o.cd.def === 'squishy' ? 0.5 : 1);
      o.kx += (e.x - o.x) / l * k; o.ky += (e.y - o.y) / l * k;
    });
  }
})(mutHit);
function spfPileTick() {
  if (!mr('sp_pile')) return;
  for (const e of G.enemies) {
    const P = e.spPile; if (!P) continue;
    if (e.dead || P.t < G.t || Math.hypot(e.kx, e.ky) < 30) { e.spPile = null; continue; }
    let hit = null;
    spfNear(e.x, e.y, e.r * 2 + 6, o => { if (!hit && o !== e && !o.dead && !o.charmed && Math.hypot(o.x - e.x, o.y - e.y) < o.r + e.r + 2) hit = o; });
    if (!hit) continue;
    e.spPile = null;
    ring(hit.x, hit.y, hit.r + 6, MUT_COL.force, 0.25, 3);
    const s = { elem: 'phys', mut: 'pile', noCrit: true, noProc: true, atk: 'burst', wname: 'Pile-Up', w: P.w, knock: 0 };
    damageEnemy(hit, P.dmg, s);
    if (mr('sp_pile') >= 4 && P.depth < 2 && !hit.boss && !hit.dead) { // mastery: it goes flying too
      const l = Math.hypot(e.kx, e.ky) || 1, f = Math.min(400, l * 0.7);
      hit.kx += e.kx / l * f; hit.ky += e.ky / l * f;
      hit.spPile = { t: G.t + 0.6, dmg: P.dmg * 0.7, depth: P.depth + 1, w: P.w };
    }
  }
}

// ---------------------------------------------------------------- pools: Wet Floor, Leave a Little Something, Bad Blood
const spfMine = z => !!(z && z.src && (z.src.w || z.spell || z.src.rx) && z.src.wname !== 'blood pool');
function spfZoneTick() {
  const wet = mr('sp_wet'), lls = mr('sp_leave'), bad = mr('sp_bleed') >= 4, now = G.t;
  if (!wet && !lls && !bad) return;
  for (const z of G.zones) {
    if (z.life <= 0) continue;
    if (!z.spfSeen) {
      z.spfSeen = 1;
      if (wet && spfMine(z) && (z.elem === 'fire' || z.src.elem === 'fire')) { const k = 1 + 0.3 * Math.min(3, wet); z.r *= k; z.life *= k; z.max = (z.max || z.life) * k; z.spWet = 1; }
      if (lls && spfMine(z)) { const k = 1 + [0.5, 0.75, 1, 1][lls - 1]; z.life *= k; z.max = (z.max || z.life) * k; z.spLls = 1; }
      if (bad && z.src && z.src.wname === 'blood pool') { z.r *= 1.5; z.spBad = 1; }
    }
    if (z.spLls && !z.lls && z.life <= 0.25) { // one last tick as it dries up
      z.lls = true;
      const hs = Object.assign({}, z.src, { noCrit: true, knock: 0, zoneHit: true, mut: 'lls' }), k = lls >= 4 ? 1.5 : 1;
      ring(z.x, z.y, z.r, z.color || '#ffffff', 0.3, 4);
      if (z.dps > 0) spfNear(z.x, z.y, z.r, e => { if (!e.dead && !e.charmed) damageEnemy(e, z.dps * k, hs); });
    }
    if (z.spWet && wet >= 4) spfNear(z.x, z.y, z.r, e => { // Wet Floor mastery: Shell layers come off
      if (e.dead || !e.cd || e.cd.def !== 'shell' || !(e.cd.layers > 0) || e.spWetT > now) return;
      e.spWetT = now + 2; e.cd.layers--; e.cd.layerHp = e.cd.layers ? e.cd.maxHp * COMBAT.shellLayerHpFrac : 0;
      floatText(e.x, e.y - e.r - 10, 'LAYER OFF', MUT_COL.acid, 10, 0.6);
    });
    if (z.spBad) spfNear(z.x, z.y, z.r, e => { // Bad Blood: standing in it Bleeds
      if (e.dead || e.spBBT > now) return;
      e.spBBT = now + 0.8; fightStatus(e, 'arcane', 12 * G.P.might, { wname: 'Bad Blood' });
    });
  }
}

// ---------------------------------------------------------------- Chain Letter
wupStats = (orig => function (w, s) {
  orig(w, s);
  const r = Math.min(3, mr('sp_chain'));
  if (r && w.def && (w.def.elem === 'shock' || w.def.elem2 === 'shock') && s.chain > 0) { s.chain += r; s.jump = (s.jump || 0) + 20 * r; }
})(wupStats);
fightArc = (orig => function (e, dmg, jumps) {
  const r = mr('sp_chain'); if (!r) return orig(e, dmg, jumps);
  if (!(e.chargeT > G.t) || e.arcRT > G.t || jumps <= 0) return;
  e.arcRT = G.t + 0.3;
  const n = jumps + Math.min(3, r), range = 110 + 20 * Math.min(3, r), fall = r >= 4 ? 1 : 0.7;
  let from = e, amt = dmg * 0.7;
  const hit = new Set([e]);
  for (let j = 0; j < n; j++) {
    let best = null, bd = range;
    for (const o of G.enemies) { if (o.dead || hit.has(o) || o.charmed) continue; const dd = Math.hypot(o.x - from.x, o.y - from.y); if (dd < bd) { bd = dd; best = o; } }
    if (!best) break;
    hit.add(best); bolt(from.x, from.y, best.x, best.y, FIGHT_COL.charged, 0.12);
    damageEnemy(best, amt, { elem: 'shock', arc: true, noArc: true, noCrit: true, atk: 'burst', wname: 'Static arcs' });
    from = best; amt *= fall;
  }
})(fightArc);

// ---------------------------------------------------------------- Bleeding Heart
fightStatus = (orig => function (e, elem, dmg, src) {
  const out = orig(e, elem, dmg, src), r = mr('sp_bleed');
  if (r && out && FIGHT_TYPE[elem] === 'blood' && e.bleeds && e.bleeds.length) e.bleeds[e.bleeds.length - 1].dps *= 1 + 0.25 * Math.min(3, r);
  return out;
})(fightStatus);
fightDeath = (orig => function (e, src) {
  const bleeding = f_bleeding(e);
  orig(e, src);
  const r = mr('sp_bleed');
  if (r && bleeding && G) { const S = fst(), h = G.P.maxHp * 0.01 * 0.5 * Math.min(3, r); S.heal = (S.heal || 0) + h; healPlayer(h, true); }
})(fightDeath);

// ---------------------------------------------------------------- Peer Pressure and Death Is Recycling
curseFoe = (orig => function (e, t) { return orig(e, t * (1 + 0.3 * Math.min(3, mr('sp_peer')))); })(curseFoe);
wupDmgMul = (orig => function (e, src) {
  let k = orig(e, src);
  const r = mr('sp_peer');
  if (r && src && src.fromAlly) k *= 1 + 0.2 * Math.min(3, r);
  if (src && !src.dot && !src.rx && (src.elem || 'phys') === 'phys' && spfPair('t_mucus', 'sp_pile') && mutSnared(e)) k *= 1.25; // Come Closer
  return k;
})(wupDmgMul);
function spfKill(e, src) {
  if (!src) return;
  if (mr('sp_peer') >= 4 && src.fromAlly) { // a possessed enemy's kill: its neighbour turns for 1 s
    let best = null, bd = 120;
    for (const o of G.enemies) { if (o.dead || o === e || o.charmed) continue; const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; best = o; } }
    if (best) curseFoe(best, 1 / (1 + 0.9));
  }
  if (spfPair('sp_peer', 't_wires') && e.charmed && !e.wispKill) { // Death Is Recycling
    let best = null, bd = 1e9;
    for (const o of G.enemies) { if (o.dead || o === e) continue; const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; best = o; } }
    if (best) { const st = mutSt(); st && st.fly.push({ x: e.x, y: e.y, tgt: best, life: 3 }); }
  }
}

// ---------------------------------------------------------------- pair weighting in drafts
// The other half of a pair you half hold turns up more often: draft.js weighs a card x1 when c.start, else x0.6.
for (const [a, b] of SPF_PAIRS) for (const [me, mate] of [[a, b], [b, a]]) {
  const c = MUT_REG.find(x => x.id === me); if (!c) continue;
  const s0 = !!c.start;
  Object.defineProperty(c, 'start', { get: () => s0 || (!!G && mr(mate) > 0 && !mr(me)), configurable: true });
}

// ---------------------------------------------------------------- hooks
wupTick = (orig => function (dt) { orig(dt); if (!G || G.state !== 'play') return; spfPileTick(); spfZoneTick(); })(wupTick);
wupKill = (orig => function (e, src) { orig(e, src); spfKill(e, src); })(wupKill);

// ---------------------------------------------------------------- The Runs mastery: close the loop (user, 23 Oct)
// Swim a loop that crosses your own trail and everything inside it takes one hit of the trail's damage type (3x a
// trail piece's damage), with a flash of the loop. At most once a second.
const SPF_LOOP = { step: 30, k: 3, cd: 1, flash: 0.45 };
function spfSegX(a, b, c, d) { // do segments ab and cd cross?
  const o = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
}
function spfInPoly(x, y, P) {
  let inside = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i].y > y) !== (P[j].y > y) && x < (P[j].x - P[i].x) * (y - P[i].y) / (P[j].y - P[i].y) + P[i].x) inside = !inside;
  return inside;
}
function spfLoopTick() {
  if (mr('sp_runs') < 4 || !G.spRuns) return;
  const p = G.player, L = G.spLoop || (G.spLoop = { pts: [], t: -9, fx: [] }), w = G.spRuns.w, life = (w.s && w.s.dur) || 3;
  while (L.pts.length && G.t - L.pts[0].t > life) L.pts.shift();
  const last = L.pts[L.pts.length - 1];
  if (last && Math.hypot(p.x - last.x, p.y - last.y) < SPF_LOOP.step) return;
  const np = { x: p.x, y: p.y, t: G.t };
  if (last && G.t - L.t > SPF_LOOP.cd) for (let i = 0; i < L.pts.length - 3; i++) {
    if (!spfSegX(L.pts[i], L.pts[i + 1], last, np)) continue;
    const poly = L.pts.slice(i + 1).concat([np]);
    const src = Object.assign(weaponSrc(w), { mut: 'loop', noCrit: true, atk: 'burst', wname: 'The Runs (loop)' }), dmg = (w.s.dmg || 5) * SPF_LOOP.k;
    for (const e of G.enemies) if (!e.dead && !e.charmed && !e.egg && spfInPoly(e.x, e.y, poly)) damageEnemy(e, dmg, src);
    L.fx.push({ poly, t: G.t, col: w.def.color }); L.t = G.t; L.pts = [np];
    return;
  }
  L.pts.push(np);
}
function spfLoopDraw() {
  const L = G && G.spLoop; if (!L || !L.fx.length) return;
  L.fx = L.fx.filter(f => G.t - f.t < SPF_LOOP.flash);
  for (const f of L.fx) {
    const k = 1 - (G.t - f.t) / SPF_LOOP.flash;
    ctx.save(); ctx.globalAlpha = 0.35 * k; ctx.fillStyle = col(f.col || '#ffffff'); ctx.beginPath();
    f.poly.forEach((q, i) => (i ? ctx.lineTo(sx(q.x), sy(q.y)) : ctx.moveTo(sx(q.x), sy(q.y)))); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.8 * k; ctx.strokeStyle = col(f.col || '#ffffff'); ctx.lineWidth = 3 * S; ctx.stroke(); ctx.restore();
  }
}
wupTick = (orig => function (dt) { orig(dt); if (G && G.state === 'play') spfLoopTick(); })(wupTick);
v10Draw = (orig => function () { orig(); if (G) spfLoopDraw(); })(v10Draw);
