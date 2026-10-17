'use strict';
// Spawn Prawn - v10 combat slice: wires combat.js (the pure resolver) into the engine.
//  - Defences come from roster.js (ROSTER[id].def); enemies without a roster entry have none.
//  - Hits resolve through resolveHit: Evasion, Membrane, Shell, Squishy, crit, health; bars pay off as
//    strip / corrode / stagger / possess / ignite; Thorns hurts you back on Contact hits.
//  - New statuses for the slice types (matrix 11.5): Acid builds Corrosion only (no damage over time),
//    Mucus Snares (55% slow, 2.5 s, puts out Burning), Static Charges (3 s, +20% Static, arcs 3 x 110 at 70%).
//  - The six slice reactions (matrix section 1, decision 33): Corrosive Splash, Snot Rocket, Conductive Pool,
//    Slick Move, Sticky Situation. Shocking Impact needs a dual-type weapon (none yet).
//  - Run stats for tuning (G.fst): reactions, damage share, misses, Membrane soaked, layers shed, Thorns, staggers.
// Hooks: game.js damageEnemy -> fightHit (replaces armour under V10) and the applyElement guard (e.fOk);
// chem.js applyElement -> fightStatus; v10.js v10Tick -> fightTick, v10Draw -> fightDraw; meta.js run log -> fst.

const FIGHT_TYPE = { phys: 'force', fire: 'acid', shock: 'static', ice: 'mucus', arcane: 'blood', soul: 'soul', flame: 'fire' };
const FIGHT_COL = { membrane: '#5aa9ff', shell: '#9a6b3f', thorns: '#d8c9a8', corroded: '#ff2fa8', snared: '#7fd04a', charged: '#ffe94a' };
const FIGHT_RX = {
  splash: { name: 'Corrosive Splash', color: '#ff2fa8' },
  rocket: { name: 'Snot Rocket', color: '#7fd04a' },
  cpool: { name: 'Conductive Pool', color: '#ffe94a' },
  slick: { name: 'Slick Move', color: '#ff2fa8' },
  sticky: { name: 'Sticky Situation', color: '#ffe94a' },
};

// The Thorns chaser joins the slice, drawn as a worm until its own shape exists.
if (typeof ROSTER !== 'undefined' && ROSTER.ingrown && !ENEMIES.ingrown) ENEMIES.ingrown = Object.assign({}, ROSTER.ingrown, { shape: 'worm', armour: 0 });

let FIGHT_IDS = null;
const fightId = def => { if (!FIGHT_IDS) FIGHT_IDS = new Map(Object.keys(ENEMIES).map(k => [ENEMIES[k], k])); return FIGHT_IDS.get(def); };
// The defence state lives on the enemy (e.cd), made on first need so elite and boss flags are already set.
function fightCd(e) {
  if (e.cd) return e.cd;
  const id = fightId(e.def), r = typeof ROSTER !== 'undefined' && ROSTER[id], d = r && r.def;
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

// ---------------------------------------------------------------- one hit (game.js damageEnemy)
// Returns the damage that reaches health, or -1 for a miss. Damage-over-time ticks skip defences.
function fightHit(e, d, src, crit) {
  const S = fst();
  if (src.dot) { S.dmg.dot += d; e.fOk = true; return d; }
  const cd = fightCd(e), t = FIGHT_TYPE[src.elem || 'phys'] || 'force';
  if (t === 'static' && charged(e)) d *= 1.2;
  const atk = src.zoneHit ? 'pool' : IN_AOE ? 'burst' : src.atk || (src.w && src.w.def && src.w.def.v10atk) || 'proj';
  COMBAT.critMult = G.P.critDmg || 1.6;
  cd.hp = e.hp;
  const res = resolveHit(cd, { atk, comps: [{ type: t, amt: d }], crit, echo: !!src.echo }, Math.random);
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
  if (src.rx) S.dmg.reaction += res.toHp; else S.dmg.weapon += res.toHp;
  if (!src.rx && !src.echo) fightReact(e, t, res.raw, src);
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
    e.snareT = G.t + 2.5; e.chill = 2.5; e.chillAmt = e.boss ? 0.2 : 0.55;
    e.v10burn = 0; e.v10bdps = 0; if (e.cd) e.cd.bars.fire = 0; // Snared puts out Burning (decision 25)
    return true;
  }
  if (t === 'static') { e.chargeT = G.t + 3; if (!src.arc) fightArc(e, dmg, 3); return true; }
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
function rxLocked(e, id) { const L = e.rxT || (e.rxT = {}); if (L[id] > G.t) return true; L[id] = G.t + (e.boss ? 3 : 1.5); return false; }
function rxFired(id, e) {
  const S = fst(), R = FIGHT_RX[id];
  S.rx[id] = (S.rx[id] || 0) + 1;
  const seen = META.rxSeen || (META.rxSeen = []);
  if (!seen.includes(id)) { seen.push(id); saveMeta(); floatText(e.x, e.y - e.r - 24, 'UNSTABLE REACTION: ' + R.name.toUpperCase(), R.color, 15, 2, true); }
  else floatText(e.x, e.y - e.r - 16, R.name, R.color, 11, 0.8);
}
const rxSrc = (id, elem, extra) => Object.assign({ elem, rx: id, noCrit: true, noArc: true, atk: 'burst', wname: FIGHT_RX[id].name }, extra || {});
function fightReact(e, t, raw, src) {
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
  if (t === 'static') {
    const z = zoneAt('fire', e.x, e.y);
    if (z && !z.cpool) {
      z.cpool = true; rxFired('cpool', e); ring(z.x, z.y, z.r, FIGHT_COL.charged, 0.3, 3);
      forNear(z.x, z.y, z.r, o => { if (!o.dead) { bolt(z.x, z.y, o.x, o.y, FIGHT_COL.charged, 0.1); damageEnemy(o, raw * 0.6, rxSrc('cpool', 'shock')); } });
    }
  }
  // Acid + Mucus patch: the patch becomes a short-lived Acid Pool. No damage of its own.
  if (t === 'acid') {
    const z = zoneAt('ice', e.x, e.y);
    if (z) { z.life = 0; z.rxDone = true; rxFired('slick', e); G.zones.push({ x: z.x, y: z.y, r: 58, life: 3.5, max: 3.5, dps: Math.max(4, raw), elem: 'fire', pull: 0, color: ELEMENTS.fire.color, tick: 0, src: rxSrc('slick', 'fire', { zoneHit: true }) }); }
  }
  // Static + Mucus patch: the patch is charged; the next enemy to enter it is shocked (a short stun, no damage).
  if (t === 'static') {
    const z = zoneAt('ice', e.x, e.y);
    if (z && !z.charged && !z.stuck) { z.charged = true; z.inside = new Set(); forNear(z.x, z.y, z.r, o => z.inside.add(o.id)); ring(z.x, z.y, z.r, FIGHT_COL.charged, 0.4, 3); }
  }
}
const fightPatch = (x, y, tag) => ({ x, y, r: 50, life: 4, max: 4, dps: 0, quiet: true, elem: 'ice', pull: 0, color: ELEMENTS.ice.color, tick: 0, rxMade: tag, src: { elem: 'ice', wname: 'Mucus patch' } });

// ---------------------------------------------------------------- each frame (v10.js v10Tick)
function fightTick(dt) {
  if (!G) return;
  const S = fst();
  for (const e of G.enemies) {
    if (e.dead || !e.cd) continue;
    tickDefence(e.cd, dt);
    if (snared(e)) S.snareT += dt;
  }
  for (const z of G.zones) {
    if (!z.charged || z.stuck || z.life <= 0) continue;
    let hit = null;
    forNear(z.x, z.y, z.r, o => { if (!hit && !o.dead && !z.inside.has(o.id)) hit = o; });
    if (hit) { z.stuck = true; z.charged = false; stun(hit, 0.6); bolt(z.x, z.y, hit.x, hit.y, FIGHT_COL.charged, 0.15); if (!rxLocked(hit, 'sticky')) rxFired('sticky', hit); }
  }
}
// A Charged enemy discharges one arc when it dies (game.js killEnemy -> fightDeath).
// Deferred a frame, so a chain of deaths never recurses.
function fightDeath(e) { if (charged(e)) { e.arcRT = 0; after(0, () => { if (G) fightArc(e, e.maxHp * 0.15, 1); }); } }

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
