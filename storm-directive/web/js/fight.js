'use strict';
// Spawn Prawn - v10 combat slice: wires combat.js (the pure resolver) into the engine.
//  - Defences come from roster.js (ROSTER[id].def); enemies without a roster entry have none.
//  - Hits resolve through resolveHit: Evasion, Membrane, Shell, Squishy, crit, health; bars pay off as
//    strip / corrode / stagger / possess / ignite; Thorns hurts you back on Contact hits.
//  - New statuses for the slice types (matrix 11.5): Acid builds Corrosion only (no damage over time),
//    Mucus Snares (55% slow, 2.5 s, puts out Burning), Static Charges (3 s, +20% Static, arcs 3 x 110 at 70%).
//  - Blood Bleeds (30% over 3 s, 3 at most), Extraction and blood pools on bleeding deaths; Soul fills the Possess bar;
//    Fire adds to one shared burn (decision 36); Conjoined when two Snared enemies touch.
//  - Twenty reactions (matrix section 1, decision 33). Shocking Impact waits for a dual-type weapon.
//  - Run stats for tuning (G.fst): reactions, damage share, misses, Membrane soaked, layers shed, Thorns, staggers.
// Hooks: game.js damageEnemy -> fightHit (replaces armour under V10) and the applyElement guard (e.fOk);
// chem.js applyElement -> fightStatus; v10.js v10Tick -> fightTick, v10Draw -> fightDraw; meta.js run log -> fst.

const FIGHT_TYPE = { phys: 'force', fire: 'acid', shock: 'static', ice: 'mucus', arcane: 'blood', soul: 'soul', flame: 'fire' };
const FIGHT_COL = { membrane: DEF_PAL.membrane, shell: DEF_PAL.shell, thorns: DEF_PAL.thorns, corroded: TYPE_PAL.fire, snared: TYPE_PAL.ice, charged: TYPE_PAL.shock };
const FIGHT_RX = {
  splash: { name: 'Corrosive Splash', color: '#ff2fa8' },
  rocket: { name: 'Snot Rocket', color: '#7fd04a' },
  cpool: { name: 'Conductive Pool', color: '#ffe94a' },
  slick: { name: 'Slick Move', color: '#ff2fa8' },
  sticky: { name: 'Sticky Situation', color: '#ffe94a' },
  pressure: { name: 'Blood Pressure', color: '#c9184a' },
  oob: { name: 'Out-of-Body Experience', color: '#b06cff' },
  flashover: { name: 'Flashover', color: '#ff6a2a' },
  breach: { name: 'Caustic Breach', color: '#ff2fa8' },
  erosion: { name: 'Soul Erosion', color: '#ff2fa8' },
  evap: { name: 'Premature Evaporation', color: '#ff6a2a' },
  circuit: { name: 'Blood Circuit', color: '#ffe94a' },
  interference: { name: 'Interference Pattern', color: '#b06cff' },
  arcflash: { name: 'Arc Flash', color: '#ffe94a' },
  clot: { name: 'Caught in the Clot', color: '#c9184a' },
  suspension: { name: 'Held in Suspension', color: '#7fd04a' },
  flammable: { name: 'Flammable Mucus', color: '#ff6a2a' },
  donor: { name: 'Blood Donor', color: '#c9184a' },
  cauterise: { name: 'Cauterise', color: '#ff6a2a' },
  spectral: { name: 'Spectral Combustion', color: '#b06cff' },
  shock: { name: 'Shocking Impact', color: '#ffe94a' },
};

// The Thorns chaser joins the slice, drawn as a worm until its own shape exists.
if (typeof ROSTER !== 'undefined' && ROSTER.ingrown && !ENEMIES.ingrown) ENEMIES.ingrown = Object.assign({}, ROSTER.ingrown, { shape: 'worm', armour: 0 });

let FIGHT_IDS = null;
const fightId = def => { if (!FIGHT_IDS) FIGHT_IDS = new Map(Object.keys(ENEMIES).map(k => [ENEMIES[k], k])); return FIGHT_IDS.get(def); };
// The defence state lives on the enemy (e.cd), made on first need so elite and boss flags are already set.
function fightCd(e) {
  if (e.cd) return e.cd;
  const id = fightId(e.def), r = typeof ROSTER !== 'undefined' && ROSTER[id], bd = e.bossDef || e.def, d = (bd && bd.v10def) || (r && r.def); // (bosses: boss10.js)
  const rank = e.boss ? 'boss' : e.elite ? 'elite' : 'normal';
  e.cd = makeDefence(e.maxHp, d ? d.kind : null, rank, { layers: d && d.layers });
  e.cd.hp = e.hp;
  return e.cd;
}
const fst = () => G.fst || (G.fst = { rx: {}, dmg: { weapon: 0, reaction: 0, dot: 0 }, miss: 0, mem: 0, layers: 0, thorns: 0, stagger: 0, possess: 0, corrode: 0, ignite: 0, snareT: 0 });
const inZone = (z, x, y) => z.life > 0 && Math.hypot(z.x - x, z.y - y) <= z.r;
const zoneAt = (elem, x, y) => G.zones.find(z => z.elem === elem && !z.rxDone && inZone(z, x, y));
const corroded = e => e.corrodedT > G.t || (e.cd && e.cd.bars.acid > 0.15);
const snared = e => e.snareT > G.t;
const charged = e => e.chargeT > G.t;
const f_burning = e => !!(e.cd && e.cd.burnT > 0);
const f_bleeding = e => !!(e.bleeds && e.bleeds.length);
const f_possessed = e => !!(e.charmed && !e.zombie);

// ---------------------------------------------------------------- one hit (game.js damageEnemy)
// Returns the damage that reaches health, or -1 for a miss. Damage-over-time ticks skip defences.
function fightHit(e, d, src, crit) {
  const S = fst();
  if (src.dot) { S.dmg.dot += d; e.fOk = true; return d; }
  const cd = fightCd(e), t = FIGHT_TYPE[src.elem || 'phys'] || 'force';
  if (t === 'static' && charged(e)) d *= 1.2;
  if (typeof s10DmgMul === 'function') d *= s10DmgMul(e, src); // (sample passives: samples10.js)
  d *= mutDmg(e, src, t); // (mutation cards: mutations.js)
  d *= wupDmgMul(e, src); // (weapon branches: weapons24.js)
  const atk = src.zoneHit ? 'pool' : IN_AOE ? 'burst' : src.atk || (src.w && src.w.def && src.w.def.v10atk) || 'proj';
  COMBAT.critMult = G.P.critDmg || 1.6;
  cd.hp = e.hp;
  const res = resolveHit(cd, { atk, comps: [{ type: t, amt: d }], crit, echo: !!src.echo, barK: mutBarK(e) }, Math.random);
  if (res.miss) {
    S.miss++;
    if (!(e.missRT > G.realT)) { e.missRT = G.realT + 0.4; floatText(e.x, e.y - e.r - 6, 'miss', '#cfe7ff', 11, 0.5); fxParts('spark', e.x, e.y, '#cfe7ff', 4, 60, 0.3, 2); }
    e.fOk = false; return -1;
  }
  S.mem += res.toMem;
  if (res.staticRecharge) ring(e.x, e.y, e.r + 8, FIGHT_COL.membrane, 0.4, 3);
  if (res.layersLost > 0) { S.layers += res.layersLost; ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.35, 5); fxParts('spark', e.x, e.y, FIGHT_COL.shell, 8, 140, 0.4, 3); }
  for (const p of res.payoffs) fightPayoff(e, p, res, src);
  if (res.thorns > 0 && !src.rx) { S.thorns += res.thorns; hurtPlayer(res.thorns, 'Thorns', e, 'thorns'); }
  e.fOk = res.statusOk;
  if (typeof s10Hit === 'function') s10Hit(e, src, res, t);
  wupHit(e, res, src); // (weapon branches: weapons24.js)
  if (src.rx) S.dmg.reaction += res.toHp; else S.dmg.weapon += res.toHp;
  if (!src.rx && !src.echo) fightReact(e, t, res.raw, src, res);
  mutHit(e, d, src, t, res);
  return res.toHp;
}

function fightPayoff(e, p, res, src) {
  const S = fst();
  if (p === 'corrode') { S.corrode++; e.corrodedT = G.t + COMBAT.corrodedT; floatText(e.x, e.y - e.r - 10, 'CORRODED', FIGHT_COL.corroded, 11, 0.6); }
  else if (p === 'stagger') { S.stagger++; stun(e, e.boss ? 0.35 / 0.3 : e.elite ? 0.55 : 0.8); ring(e.x, e.y, e.r + 4, '#ffffff', 0.3, 4); }
  else if (p === 'possess') { S.possess++; if (!(e.possNextT > G.t)) { e.possNextT = G.t + 12; curseFoe(e, e.boss ? 1.5 : e.elite ? 2.5 : 4); } }
  else if (p === 'ignite') { S.ignite++; after(0, () => { if (!e.dead) { damageEnemy(e, res.raw * 1.5, { elem: 'flame', echo: true, noStatus: true, noCrit: true, atk: 'burst', wname: 'Ignition' }); ring(e.x, e.y, e.r + 10, '#ff6a2a', 0.4, 5); } }); }
  // ('strip' is done inside the resolver: the layer is already gone.)
}

// ---------------------------------------------------------------- statuses (chem.js applyElement, under V10)
// True when the slice owns this type's status; Blood, Soul and Fire keep the v10 build's statuses for now.
function fightStatus(e, elem, dmg, src) {
  const t = FIGHT_TYPE[elem];
  if (t === 'acid') return true; // Corrosion is a bar (combat.js); no Acid damage over time on enemies (decision 23)
  if (t === 'mucus') {
    if (!snared(e)) fst();
    e.snareT = G.t + 2.5 * mutSnareK(); e.chill = 2.5; e.chillAmt = e.boss ? 0.2 : 0.55;
    e.v10burn = 0; e.v10bdps = 0; if (e.cd) { e.cd.bars.fire = 0; e.cd.burnPool = 0; e.cd.burnT = 0; } // Snared puts out Burning (decision 25)
    return true;
  }
  if (t === 'static') { e.chargeT = G.t + 3; if (!src.arc) fightArc(e, dmg, 3); return true; }
  if (t === 'blood') { // Bleed: 30% of the hit over 3 s, at most 3 at once (the oldest gives way)
    const b = e.bleeds || (e.bleeds = []);
    if (b.length >= 3) b.shift();
    b.push({ dps: dmg * 0.3 / 3, t: 3, by: dotName(src) });
    return true;
  }
  if (t === 'soul') return true; // the Soul bar Possesses (combat.js); nothing else on a hit
  if (t === 'fire') { burnAdd(fightCd(e), dmg); e.burnBy = dotName(src); return true; } // one shared burn (decision 36)
  return false;
}
// Charge: a Static hit on a Charged enemy passes an arc on (3 jumps, 110 range, 70% each). At most one a 0.3 s per enemy.
function fightArc(e, dmg, jumps) {
  if (!(e.chargeT > G.t) || e.arcRT > G.t || jumps <= 0) return;
  e.arcRT = G.t + 0.3;
  let from = e, amt = dmg * 0.7;
  const hit = new Set([e]);
  for (let j = 0; j < jumps; j++) {
    let best = null, bd = 110;
    for (const o of G.enemies) { if (o.dead || hit.has(o) || o.charmed) continue; const dd = Math.hypot(o.x - from.x, o.y - from.y); if (dd < bd) { bd = dd; best = o; } }
    if (!best) break;
    hit.add(best); bolt(from.x, from.y, best.x, best.y, FIGHT_COL.charged, 0.12);
    damageEnemy(best, amt, { elem: 'shock', arc: true, noArc: true, noCrit: true, atk: 'burst', wname: 'Static arcs' });
    from = best; amt *= 0.7;
  }
}

// ---------------------------------------------------------------- reactions (matrix section 1)
let FIGHT_ONE = null; // (First Contact: at most one reaction per enemy; set only inside fightReactAs)
const fightOnceDone = () => !!(FIGHT_ONE && FIGHT_ONE.n);
function rxLocked(e, id) { if (fightOnceDone()) return true; const L = e.rxT || (e.rxT = {}); if (L[id] > G.t) return true; L[id] = G.t + (e.boss ? 3 : mutRxLock(id)); return false; }
function rxFired(id, e) {
  const S = fst(), R = FIGHT_RX[id];
  S.rx[id] = (S.rx[id] || 0) + 1; if (FIGHT_ONE) FIGHT_ONE.n++;
  const seen = META.rxSeen || (META.rxSeen = []);
  if (!seen.includes(id)) { seen.push(id); saveMeta(); floatText(e.x, e.y - e.r - 24, 'UNSTABLE REACTION: ' + R.name.toUpperCase(), R.color, 15, 2, true); if (typeof vxReaction === 'function') vxReaction(id, seen.length === 1); }
  else floatText(e.x, e.y - e.r - 16, R.name, R.color, 11, 0.8);
}
const rxSrc = (id, elem, extra) => Object.assign({ elem, rx: id, noCrit: true, noArc: true, atk: 'burst', wname: FIGHT_RX[id].name }, extra || {});
function fightReact(e, t, raw, src, res) {
  // Force + Acid: a Force hit on a Corroded target splashes Corrosion onto up to 4 neighbours (60% of the hit).
  if (t === 'force' && corroded(e) && !rxLocked(e, 'splash')) {
    rxFired('splash', e); ring(e.x, e.y, 80, FIGHT_COL.corroded, 0.35, 3);
    let n = 0;
    forNear(e.x, e.y, 80, o => { if (o === e || o.dead || n >= 4) return; n++; const c = fightCd(o); c.bars.acid = Math.min(0.99, c.bars.acid + 0.5); damageEnemy(o, raw * 0.6, rxSrc('splash', 'fire')); });
  }
  // Force + Mucus: a Force hit on a Snared enemy launches it; it leaves one Mucus patch where it lands. No damage.
  if (t === 'force' && snared(e) && !rxLocked(e, 'rocket')) {
    rxFired('rocket', e);
    if (!e.boss) { const p = me(), kx = src.kx != null ? src.kx : e.x - p.x, ky = src.ky != null ? src.ky : e.y - p.y, l = Math.hypot(kx, ky) || 1, k = e.elite ? 260 : 520; e.kx += kx / l * k; e.ky += ky / l * k; }
    after(0.4, () => { if (G && G.zones.length < 150) G.zones.push(fightPatch(e.x, e.y, 'rocket')); });
  }
  // Static + Acid Pool: one pulse across that pool (60% of the hit to everything in it), once per pool.
  if (t === 'static' && !src.feat) {
    const z = zoneAt('fire', e.x, e.y);
    if (z && !z.cpool) {
      z.cpool = true; rxFired('cpool', e); ring(z.x, z.y, z.r, FIGHT_COL.charged, 0.3, 3);
      forNear(z.x, z.y, z.r, o => { if (!o.dead) { bolt(z.x, z.y, o.x, o.y, FIGHT_COL.charged, 0.1); damageEnemy(o, raw * 0.6, rxSrc('cpool', 'shock')); } });
    }
  }
  // Acid + Mucus patch: the patch becomes a short-lived Acid Pool. No damage of its own.
  if (t === 'acid' && !src.feat) {
    const z = zoneAt('ice', e.x, e.y);
    if (z) { z.life = 0; z.rxDone = true; rxFired('slick', e); G.zones.push({ x: z.x, y: z.y, r: 58, life: 3.5, max: 3.5, dps: Math.max(4, raw), elem: 'fire', pull: 0, color: ELEMENTS.fire.color, tick: 0, src: rxSrc('slick', 'fire', { zoneHit: true }) }); }
  }
  // Static + Mucus patch: the patch is charged; the next enemy to enter it is shocked (a short stun, no damage).
  if (t === 'static' && !src.feat) {
    const z = zoneAt('ice', e.x, e.y);
    if (z && !z.charged && !z.stuck) { z.charged = true; z.inside = new Set(); forNear(z.x, z.y, z.r, o => z.inside.add(o.id)); ring(z.x, z.y, z.r, FIGHT_COL.charged, 0.4, 3); }
  }
  fightReact2(e, t, raw, src, res);
  if (!src.feat) sigReact(e, t, raw, src, res); // (Shocking Impact, Burning Sensation: sigweap.js)
}
// The other fifteen (Shocking Impact waits for a dual-type weapon).
function fightReact2(e, t, raw, src, res) {
  const p = me();
  // Force + Blood: a heavy Force hit on a bleeding target bursts the wound (60%, small area). No new Bleed.
  if (t === 'force' && res && res.heavy && f_bleeding(e) && !rxLocked(e, 'pressure')) {
    rxFired('pressure', e); ring(e.x, e.y, 60, FIGHT_RX.pressure.color, 0.35, 4);
    forNear(e.x, e.y, 60, o => { if (!o.dead) damageEnemy(o, raw * 0.6, rxSrc('pressure', 'arcane')); });
  }
  // Force + Soul: a Force hit on a Possessed enemy launches it; the first mate it hits takes 60%.
  if (t === 'force' && f_possessed(e) && !rxLocked(e, 'oob')) {
    rxFired('oob', e);
    const kx = src.kx != null ? src.kx : e.x - p.x, ky = src.ky != null ? src.ky : e.y - p.y, l = Math.hypot(kx, ky) || 1;
    if (!e.boss) { e.kx += kx / l * 480; e.ky += ky / l * 480; }
    e.oobT = G.t + 0.6; e.oobDmg = raw * 0.6;
  }
  // Force + Fire: a Force hit on a burning target throws a tongue of flame at one neighbour (60%, adds to its Burn).
  if (t === 'force' && f_burning(e) && !rxLocked(e, 'flashover')) {
    const n = fightNearest(e, 120);
    if (n) { rxFired('flashover', e); bolt(e.x, e.y, n.x, n.y, FIGHT_RX.flashover.color, 0.15); damageEnemy(n, raw * 0.6, rxSrc('flashover', 'flame', { atk: 'proj' })); }
  }
  // Acid + Blood: an Acid hit on a bleeding target strips one Shell layer at once (once per Bleed). No damage.
  if (t === 'acid' && f_bleeding(e) && e.cd && e.cd.layers > 0 && !e.bleeds.breached && !rxLocked(e, 'breach')) {
    e.bleeds.breached = true; e.cd.layers--; e.cd.layerHp = e.cd.maxHp * COMBAT.shellLayerHpFrac; fst().layers++;
    rxFired('breach', e); ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.4, 5);
  }
  // Acid + Soul: an Acid hit on a Possessed enemy: when the Possession ends it bursts in an Acid splash.
  if (t === 'acid' && f_possessed(e) && !e.erodeOnEnd && !rxLocked(e, 'erosion')) { e.erodeOnEnd = raw; rxFired('erosion', e); }
  // Acid + Fire: a Fire hit on a Corroded target consumes the Corrosion in a close burst (150%).
  if (t === 'fire' && corroded(e) && !rxLocked(e, 'evap')) {
    e.corrodedT = 0; if (e.cd) e.cd.bars.acid = 0;
    rxFired('evap', e); ring(e.x, e.y, 70, FIGHT_RX.evap.color, 0.4, 5); fxParts('spark', e.x, e.y, '#ff9a5a', 14, 180, 0.5, 3);
    forNear(e.x, e.y, 70, o => { if (!o.dead) damageEnemy(o, raw * 1.5, rxSrc('evap', 'flame')); });
  }
  // Static + blood pool: one arc to the nearest enemy in or beside the pool (60%). No onward chain.
  if (t === 'static' && !src.feat) {
    const z = zoneAt('arcane', e.x, e.y);
    if (z && !z.circuit) {
      let best = null, bd = z.r + 40;
      for (const o of G.enemies) { if (o.dead || o === e) continue; const dd = Math.hypot(o.x - z.x, o.y - z.y); if (dd < bd) { bd = dd; best = o; } }
      if (best) { z.circuit = true; rxFired('circuit', e); bolt(z.x, z.y, best.x, best.y, FIGHT_COL.charged, 0.15); damageEnemy(best, raw * 0.6, rxSrc('circuit', 'shock')); }
    }
  }
  // Static + Soul: a Static hit on a Possessed enemy makes it last 2 s longer (once per Possession). No damage.
  if (t === 'static' && f_possessed(e) && !e.interfered && !fightOnceDone()) { e.interfered = true; e.charmT += 2; rxFired('interference', e); }
  // Static + Fire: a Static hit on a burning target arcs once to the nearest other enemy (60%).
  if (t === 'static' && f_burning(e) && !rxLocked(e, 'arcflash')) {
    const n = fightNearest(e, 140);
    if (n) { rxFired('arcflash', e); bolt(e.x, e.y, n.x, n.y, FIGHT_COL.charged, 0.15); damageEnemy(n, raw * 0.6, rxSrc('arcflash', 'shock', { arc: true })); }
  }
  // Mucus + blood pool: the pool thickens; the first enemy to cross it is Snared, then the pool is gone.
  if (t === 'mucus' && !src.feat) { const z = zoneAt('arcane', e.x, e.y); if (z && !z.clot) { z.clot = true; z.inside = new Set(); forNear(z.x, z.y, z.r, o => z.inside.add(o.id)); rxFired('clot', e); } }
  // Mucus + Soul: a Mucus hit on a Possessed enemy pins it for a moment. No damage.
  if (t === 'mucus' && f_possessed(e) && !rxLocked(e, 'suspension')) { e.frozen = Math.max(e.frozen, e.boss ? 0.3 : 1); rxFired('suspension', e); }
  // Mucus patch + Fire: the patch flares once: everything in it ignites (150%), then the patch is gone.
  if (t === 'fire' && !src.feat) {
    const z = zoneAt('ice', e.x, e.y);
    if (z) {
      z.life = 0; z.rxDone = true; rxFired('flammable', e); ring(z.x, z.y, z.r, FIGHT_RX.flammable.color, 0.45, 6);
      forNear(z.x, z.y, z.r, o => { if (o.dead) return; const c = fightCd(o); c.bars.fire = 0.999; damageEnemy(o, raw * 1.5, rxSrc('flammable', 'flame')); });
    }
  }
  // Blood + Soul: a Blood hit on a Possessed enemy heals you a little (once per Possession). No damage.
  if (t === 'blood' && f_possessed(e) && !e.donated && !fightOnceDone()) { e.donated = true; healPlayer(Math.max(3, G.P.maxHp * 0.03)); rxFired('donor', e); }
  // Blood + Fire: a Fire hit on a bleeding target consumes the Bleed for one burst (150% plus the Bleed left).
  if (t === 'fire' && f_bleeding(e) && !rxLocked(e, 'cauterise')) {
    const left = e.bleeds.reduce((a, b) => a + b.dps * b.t, 0); e.bleeds = [];
    rxFired('cauterise', e); ring(e.x, e.y, 70, FIGHT_RX.cauterise.color, 0.4, 5);
    forNear(e.x, e.y, 70, o => { if (!o.dead) damageEnemy(o, raw * 1.5 + (o === e ? left : 0), rxSrc('cauterise', 'flame')); });
  }
  // Soul + Fire: the Soul Beam + Burning Ground Pairing (both Lv 5+) on a burning, Possessed enemy: it ignites and Possession ends.
  if ((t === 'soul' || t === 'fire') && f_burning(e) && f_possessed(e) && !src.feat && fightPairing() && !rxLocked(e, 'spectral')) {
    const first = !(META.rxSeen || []).includes('spectral');
    rxFired('spectral', e); e.charmT = 0.01; const c = fightCd(e); c.bars.fire = 0; fightPayoff(e, 'ignite', { raw }, src);
    if (first && !(typeof vxSpectral === 'function' && vxSpectral())) floatText(p.x, p.y - 60, 'Form 12B filed.', '#e8e2d6', 13, 3);
  }
}
// First Contact (Feats, matrix 11.3): a virtual hit of type t on e, for reactions only. No damage, no bar fill, no Thorns.
// Runs the state + hit reactions (world-object ones, Spectral Combustion and signature reactions are skipped); src.raw is the
// notional hit size the reaction damage scales from; src.once ({n:0}, shared by the caller across both types) keeps it to one
// reaction per enemy. Returns true if one fired.
function fightReactAs(e, t, src) {
  if (!e || e.dead) return false;
  const s = Object.assign({}, src, { feat: true }), once = s.once || (s.once = { n: 0 }), n0 = once.n, prev = FIGHT_ONE;
  FIGHT_ONE = once;
  try { fightReact(e, t, s.raw || 0, s, null); } finally { FIGHT_ONE = prev; }
  return once.n > n0;
}
const fightNearest = (e, r) => { let best = null, bd = r; for (const o of G.enemies) { if (o.dead || o === e || o.charmed) continue; const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; best = o; } } return best; };
const fightPairing = () => { const lv = id => { const w = G.weapons.find(w => w && w.id === id); return w ? w.lvl || w.level || 0 : 0; }; return lv('v_soul_beam') >= 5 && lv('v_flame_pool') >= 5; };
const fightPatch = (x, y, tag) => ({ x, y, r: 50, life: 4, max: 4, dps: 0, quiet: true, elem: 'ice', pull: 0, color: ELEMENTS.ice.color, tick: 0, rxMade: tag, src: { elem: 'ice', wname: 'Mucus patch' } });

// ---------------------------------------------------------------- each frame (v10.js v10Tick)
function fightTick(dt) {
  if (!G) return;
  const S = fst();
  for (const e of G.enemies) {
    if (e.dead || !e.cd) continue;
    tickDefence(e.cd, dt);
    if (snared(e)) S.snareT += dt;
    if (e.cd.burnDmg > 0) { const b = e.cd.burnDmg; e.cd.burnDmg = 0; damageEnemy(e, b, { elem: 'flame', dot: true, noCrit: true, noStatus: true, noArc: true, wname: (e.burnBy || '?') + ' (burning)' }); if (Math.random() < dt * 8) fxParts('ember', e.x + rand(-e.r, e.r), e.y, '#ff6a2a', 1, 30, 0.5, 2.5, -Math.PI / 2, 0.6); }
    if (e.dead) continue;
    if (e.bleeds && e.bleeds.length) {
      let d = 0; for (const b of e.bleeds) { const k = Math.min(dt, b.t); d += b.dps * k; b.t -= dt; }
      const by = e.bleeds[0].by; e.bleeds = Object.assign(e.bleeds.filter(b => b.t > 0), { breached: e.bleeds.breached });
      if (d > 0) damageEnemy(e, d, { elem: 'arcane', dot: true, noCrit: true, noStatus: true, noArc: true, wname: (by || '?') + ' (bleeding)' });
      if (e.dead) continue;
    }
    if (e.oobT > G.t) { // Out-of-Body Experience: the first mate it collides with takes the hit
      for (const o of G.enemies) if (o !== e && !o.dead && Math.hypot(o.x - e.x, o.y - e.y) < o.r + e.r) { e.oobT = 0; damageEnemy(o, e.oobDmg, rxSrc('oob', 'soul')); ring(o.x, o.y, o.r + 6, FIGHT_RX.oob.color, 0.3, 4); break; }
    }
    if (!e.charmed && (e.erodeOnEnd || e.interfered || e.donated)) { // a Possession has ended
      if (e.erodeOnEnd) { const raw = e.erodeOnEnd; ring(e.x, e.y, 80, FIGHT_COL.corroded, 0.35, 3); forNear(e.x, e.y, 80, o => { if (o === e || o.dead) return; const c = fightCd(o); c.bars.acid = Math.min(0.99, c.bars.acid + 0.5); damageEnemy(o, raw * 0.6, rxSrc('erosion', 'fire')); }); }
      e.erodeOnEnd = 0; e.interfered = false; e.donated = false;
    }
    if (snared(e) && !(e.conjT > G.t) && !(e.conjCd > G.t)) { // Conjoined: two Snared creatures touch and stick (3 s)
      for (const o of G.enemies) if (o !== e && !o.dead && snared(o) && !(o.conjT > G.t) && Math.hypot(o.x - e.x, o.y - e.y) < o.r + e.r + 2) {
        for (const q of [e, o]) { q.conjT = G.t + 3; q.conjCd = G.t + 6; q.conjWith = q === e ? o : e; q.frozen = Math.max(q.frozen, q.boss ? 0.5 : 3); }
        floatText((e.x + o.x) / 2, (e.y + o.y) / 2 - 14, 'CONJOINED', FIGHT_COL.snared, 11, 0.7); break;
      }
    }
  }
  for (const z of G.zones) {
    if (!z.charged || z.stuck || z.life <= 0) continue;
    let hit = null;
    forNear(z.x, z.y, z.r, o => { if (!hit && !o.dead && !z.inside.has(o.id)) hit = o; });
    if (hit) { z.stuck = true; z.charged = false; stun(hit, 0.6); bolt(z.x, z.y, hit.x, hit.y, FIGHT_COL.charged, 0.15); if (!rxLocked(hit, 'sticky')) rxFired('sticky', hit); }
  }
  for (const z of G.zones) { // Caught in the Clot: the first enemy to cross a thickened blood pool is Snared, then it's gone
    if (!z.clot || z.life <= 0) continue;
    let hit = null;
    forNear(z.x, z.y, z.r, o => { if (!hit && !o.dead && !z.inside.has(o.id)) hit = o; });
    if (hit) { z.life = 0; fightStatus(hit, 'ice', 0, {}); ring(z.x, z.y, z.r, FIGHT_RX.clot.color, 0.4, 4); }
  }
}
// A Charged enemy discharges one arc when it dies (game.js killEnemy -> fightDeath).
// Deferred a frame, so a chain of deaths never recurses.
function fightDeath(e, src) {
  if (typeof s10Kill === 'function') s10Kill(e, src);
  if (charged(e)) { e.arcRT = 0; after(0, () => { if (G) fightArc(e, e.maxHp * 0.15, 1); }); }
  if (f_bleeding(e) && G) { // dying while bleeding: Extraction (1% of your max health, at most 6 a second) and a blood pool
    const S = fst(), sec = Math.floor(G.t);
    if (S.exSec !== sec) { S.exSec = sec; S.exUsed = 0; }
    const h = Math.min(G.P.maxHp * 0.01, 6 - S.exUsed);
    if (h > 0) { S.exUsed += h; S.heal = (S.heal || 0) + h; healPlayer(h, true); }
    if (G.zones.length < 150) G.zones.push({ x: e.x, y: e.y, r: 35, life: 3, max: 3, dps: 0, quiet: true, elem: 'arcane', pull: 0, color: ELEMENTS.arcane.color, tick: 0, src: { elem: 'arcane', wname: 'blood pool' } });
  }
}

// ---------------------------------------------------------------- drawing (v10.js v10Draw, world space)
function fightDraw() {
  if (!G) return;
  const now = G.t;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const c = e.cd || (fightId(e.def) && typeof ROSTER !== 'undefined' && ROSTER[fightId(e.def)] && ROSTER[fightId(e.def)].def ? fightCd(e) : null);
    const x = sx(e.x), y = sy(e.y), r = e.r * S;
    ctx.save(); ctx.lineCap = 'round';
    if (c && c.def === 'membrane' && c.memMax > 0) { // blue ring, full while up; flickers while recharging
      const k = c.mem / c.memMax;
      ctx.strokeStyle = col(FIGHT_COL.membrane); ctx.globalAlpha = 0.25 + 0.6 * k * (c.memQuietT < 2 && k < 1 ? 0.7 + 0.3 * Math.sin(now * 30) : 1);
      ctx.lineWidth = 2 + 2 * k; ctx.beginPath(); ctx.arc(x, y, r + 5 * S, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0.02, k)); ctx.stroke();
    }
    if (c && c.def === 'shell') for (let i = 0; i < c.layers; i++) { // one brown ring per layer; the outer one fades as it wears
      const outer = i === c.layers - 1, hp = c.layerHp / (c.maxHp * 0.15);
      ctx.strokeStyle = col(FIGHT_COL.shell); ctx.globalAlpha = outer ? 0.35 + 0.55 * Math.max(0, hp) : 0.9; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.arc(x, y, r + (3 + i * 3.5) * S, 0, TAU); ctx.stroke();
    }
    if (c && c.def === 'thorns') { ctx.strokeStyle = col(FIGHT_COL.thorns); ctx.globalAlpha = 0.9; ctx.lineWidth = 1.6;
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + e.spin; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.lineTo(x + Math.cos(a) * (r + 6 * S), y + Math.sin(a) * (r + 6 * S)); ctx.stroke(); } }
    if (c && c.def === 'evasion') { ctx.strokeStyle = col('#cfe7ff'); ctx.globalAlpha = 0.35; ctx.lineWidth = 1.2; ctx.setLineDash([3 * S, 4 * S]); ctx.beginPath(); ctx.arc(x, y, r + 4 * S, now * 2, now * 2 + TAU); ctx.stroke(); ctx.setLineDash([]); }
    if (corroded(e)) { ctx.fillStyle = col(FIGHT_COL.corroded); ctx.globalAlpha = 0.85; for (let i = 0; i < 3; i++) { const a = now * 1.5 + i * 2.1; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.7, y + r * 0.5 + ((now * 20 + i * 7) % 8) * S, 1.8 * S, 0, TAU); ctx.fill(); } }
    if (snared(e)) { ctx.strokeStyle = col(FIGHT_COL.snared); ctx.globalAlpha = 0.7; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y + r * 0.2, r * 1.1, r * 0.8, 0, 0, TAU); ctx.stroke(); }
    if (charged(e)) { ctx.strokeStyle = col(FIGHT_COL.charged); ctx.globalAlpha = 0.9; ctx.lineWidth = 1.4; ctx.beginPath();
      for (let i = 0; i < 2; i++) { const a = rand(0, TAU); ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.lineTo(x + Math.cos(a + 0.3) * (r + 5 * S), y + Math.sin(a + 0.3) * (r + 5 * S)); } ctx.stroke(); }
    if (f_bleeding(e)) { ctx.fillStyle = col('#c9184a'); ctx.globalAlpha = 0.9; for (let i = 0; i < e.bleeds.length; i++) { const yy = y + r * 0.6 + ((now * 30 + i * 9) % 10) * S; ctx.beginPath(); ctx.arc(x + (i - 1) * r * 0.4, yy, 1.8 * S, 0, TAU); ctx.fill(); } }
    if (f_burning(e)) { ctx.fillStyle = col('#ff6a2a'); ctx.globalAlpha = 0.55 + 0.3 * Math.sin(now * 20 + e.id); for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.6; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8 - 2 * S, 2.5 * S, (5 + 2 * Math.sin(now * 15 + i)) * S, a + Math.PI / 2, 0, TAU); ctx.fill(); } }
    if (e.conjT > now && e.conjWith && !e.conjWith.dead && e.id < e.conjWith.id) { const o = e.conjWith; ctx.strokeStyle = col(FIGHT_COL.snared); ctx.globalAlpha = 0.6; ctx.lineWidth = Math.min(e.r, o.r) * S; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(sx(o.x), sy(o.y)); ctx.stroke(); }
    if (c) { // build-up bars: short arcs under the body, one per type that is filling
      let i = 0;
      for (const [k, cc] of [['acid', FIGHT_COL.corroded], ['force', '#ffffff'], ['fire', '#ff6a2a'], ['soul', '#b06cff']]) {
        const v = c.bars[k]; if (!(v > 0.02)) continue;
        ctx.strokeStyle = col(cc); ctx.globalAlpha = 0.9; ctx.lineWidth = 2.5;
        const rr = r + (9 + i * 4) * S; ctx.beginPath(); ctx.arc(x, y, rr, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 0.5 * Math.min(1, v)); ctx.stroke(); i++;
      }
    }
    ctx.restore();
  }
  for (const z of G.zones) if (z.charged && z.life > 0) { // a charged Mucus patch crackles round its edge
    ctx.save(); ctx.strokeStyle = col(FIGHT_COL.charged); ctx.globalAlpha = 0.6 + 0.4 * Math.sin(now * 25); ctx.lineWidth = 2; ctx.setLineDash([5 * S, 5 * S]);
    ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.r * S, 0, TAU); ctx.stroke(); ctx.restore();
  }
}

// ---------------------------------------------------------------- Field Guide (inspect.js chart under V10)
// The 21 pairs as a 7 by 7 chart. A reaction shows as ? until you have set it off once (META.rxSeen, decision 22);
// then its square names it and the line below says what sets it off and what it does (the Field Guide may explain).
const RX10_ORDER = ['phys', 'fire', 'shock', 'ice', 'arcane', 'soul', 'flame'];
const RX10 = {
  'phys+fire': ['splash', 'A Force hit on a Corroded target splashes Corrosion onto up to 4 neighbours (60% of the hit).'],
  'phys+shock': ['shock', 'A dual Force/Static weapon (Rubbed the Wrong Way): a Static shot after a Force shot bursts locally (60%). No chain.'],
  'phys+ice': ['rocket', 'A Force hit on a Snared enemy launches it; it leaves a Mucus patch where it lands. No damage.'],
  'phys+arcane': ['pressure', 'A heavy Force hit on a bleeding target bursts the wound: a small area hit (60%).'],
  'phys+soul': ['oob', 'A Force hit on a Possessed enemy launches it into the first mate it meets (60%).'],
  'phys+flame': ['flashover', 'A Force hit on a burning target throws a tongue of flame at one neighbour (60%, adds to its burn).'],
  'fire+shock': ['cpool', 'A Static hit in an Acid Pool sends one pulse across the pool (60% to everything in it). Once per pool.'],
  'fire+ice': ['slick', 'An Acid hit on a Mucus patch turns it into a short-lived Acid Pool.'],
  'fire+arcane': ['breach', 'An Acid hit on a bleeding target strips one Shell layer at once. Once per Bleed.'],
  'fire+soul': ['erosion', 'An Acid hit on a Possessed enemy: when the Possession ends it bursts in an Acid splash (60%, adds Corrosion).'],
  'fire+flame': ['evap', 'A Fire hit on a Corroded target consumes the Corrosion in a close burst (150%).'],
  'shock+ice': ['sticky', 'A Static hit charges a Mucus patch; the next enemy to enter it is stunned. Once per patch.'],
  'shock+arcane': ['circuit', 'A Static hit in a blood pool arcs once to the nearest enemy in or beside it (60%).'],
  'shock+soul': ['interference', 'A Static hit on a Possessed enemy makes the Possession last 2 s longer. Once per Possession.'],
  'shock+flame': ['arcflash', 'A Static hit on a burning target arcs once to the nearest other enemy (60%).'],
  'ice+arcane': ['clot', 'A Mucus hit on a blood pool thickens it: the first enemy to cross it is Snared, then it is gone.'],
  'ice+soul': ['suspension', 'A Mucus hit on a Possessed enemy pins it in place for a moment.'],
  'ice+flame': ['flammable', 'A Fire hit on a Mucus patch flares it: everything standing in it ignites (150%), then it is gone.'],
  'arcane+soul': ['donor', 'A Blood hit on a Possessed enemy heals you a little. Once per Possession.'],
  'arcane+flame': ['cauterise', 'A Fire hit on a bleeding target consumes the Bleed in one burst (150% plus the Bleed left).'],
  'soul+flame': ['spectral', 'The Soul Beam + Burning Ground Pairing (both Lv 5+) on a burning, Possessed enemy: it ignites and the Possession ends.'],
};
const rx10Pair = (a, b) => RX10[a + '+' + b] || RX10[b + '+' + a] || null;
const rx10Seen = id => !!(META.rxSeen && META.rxSeen.includes(id));
function rxChart10() {
  const lab = k => `<i class="rxh" style="color:${ELEMENTS[k].color}">${inspectEsc(ELEMENTS[k].name.slice(0, 3).toUpperCase())}</i>`;
  let cells = '', seen = 0;
  for (const a of RX10_ORDER) {
    cells += lab(a);
    for (const b of RX10_ORDER) {
      const P = a !== b && rx10Pair(a, b), s = P && rx10Seen(P[0]), R = P && FIGHT_RX[P[0]];
      cells += `<button class="rxc ${P ? (s ? 'got' : 'unk') : 'none'}" ${s ? `style="--c:${R.color}"` : ''} data-insp="rxcell:${a}+${b}">${P ? (s ? R.name.split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase() : '?') : '-'}</button>`;
    }
  }
  for (const k in RX10) if (rx10Seen(RX10[k][0])) seen++;
  return `<h3>Unstable reactions</h3><em>${seen} OF 21 FOUND</em><div class="rxgrid"><i></i>${RX10_ORDER.map(lab).join('')}${cells}</div><p id="rxDetail" class="hint">Tap a square. A question mark is one you have not set off yet.</p>`;
}
function rxCell10(pair) {
  const [a, b] = pair.split('+'), P = a !== b && rx10Pair(a, b), box = document.getElementById('rxDetail');
  if (!box) return;
  if (!P) { box.innerHTML = 'A damage type does not react with itself.'; return; }
  const R = FIGHT_RX[P[0]];
  box.innerHTML = rx10Seen(P[0]) ? `<b style="color:${R.color}">${inspectEsc(R.name)}</b>: ${inspectEsc(P[1])}` : 'Not seen yet. Set it off in a run.';
}
