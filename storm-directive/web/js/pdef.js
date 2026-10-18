'use strict';
// Spawn Prawn - v10 player defences (spec: ../redesign docs/COMBAT_MATRIX.md 3, 10 (decisions 15, 31 to 37), 11.1, 11.4, 11.5;
// ../redesign docs/UPGRADES.md 5; MUTATIONS.md).
// Owns: the player's defences (G.pd): a base Membrane every run starts with, plus Shell layers, Squishy, Evasion and
// Thorns from Genome cards. The player can hold several at once, so this mirrors matrix 11.1 in order (Evasion, Membrane,
// Shell, Squishy, health) and reuses combat.js for the state and timers (makeDefence for the Membrane, tickDefence for its
// recharge and the Corrosion bar drain, COMBAT for every shared number). Only the numbers that are the player's own
// live in PDEF. Replaces the old armour block in hurtPlayer under V10.
//  - Hit type: kind 'contact' is Contact, 'bullets' Projectile (Spread if the shooter only has Spread attacks), 'blast' and
//    Thorns recoil Burst, anything else (hazards, beams, puddles) Pool. Damage type comes from the shooter's roster entry
//    (default Force; two types split the hit evenly).
//  - A hit fully soaked by the Membrane applies no status (decision 35): hurtPlayer returns before pstHit.
//  - Shell layers from cards do not regrow inside a wave: they come back when a wave starts (wave mode) or every 60 s (race).
//  - Thorns: Contact hits that connect return 5 + 35% of the hit (x rank) to the attacker as echo damage (never missed, no status).
//  - The shield (v10 decision, 18 Oct): the Membrane is only there if you have a shield: Private Schooled and Not of This World
//    start with one (samples10.js s10Shield), the Rubber Johnny relic grants one, or take the Latex Protection card. It draws
//    as the original forcefield bubble (stamina.js armourRing, fed by the Membrane) with its elastic physics (bodymods.js).
// Hooks: game.js hurtPlayer -> pdefHurt (replaces the armour block under V10); v10.js v10Tick -> pdefTick,
// v10Draw -> pdefDraw, v10Loot -> pdefOffer; render.js calls armourRing under V10 only while the shield is up (pdefShieldUp);
// bodymods.js bubbleOn / bubbleBump -> pdefShieldUp / pdefDent; stamina.js armourRing -> pdefShieldUp / pdefShieldK; bosspack.js bpRelicIn skips the old skin under V10.

const PDEF = {
  memFrac: 0.30,          // base Membrane: share of max health (enemies get 50%, COMBAT.membraneFrac)
  thickStep: 0.10,        // Thicker Membrane: + this much of max health per rank
  fastStep: 0.35,         // Faster Recharge: delay and refill both run 35% faster per rank
  shellRegrow: 60,        // race mode: seconds between Shell refits
  evasionStep: 0.10,      // Evasion: miss chance per rank (cap COMBAT.evasionCap)
  thornsStep: 0.5,        // Thorns: each rank beyond the first adds this much to the return
  soakIframes: 0.4,       // grace after a fully soaked hit, so one touch does not drain the Membrane every frame
  missIframes: 0.25,
  slots: 4,               // Genome slots shared by defence cards (UPGRADES.md 5); a rank-up of a held card is free
};
const PDEF_ATK = { contact: 'contact', bullets: 'proj', blast: 'burst', thorns: 'burst' }; // everything else is Pool
const PDEF_COL = { membrane: DEF_PAL.membrane, shell: DEF_PAL.shell, miss: '#cfe7ff' };

// The defence cards. G.pd.n[id] = ranks held.
const PDEF_CARDS = {
  latex: { name: 'Latex Protection', max: 1, icon: 'L', sub: 'Shield',
    desc: 'Ninety-eight percent effective, according to the leaflet. You are wrapped in a thin latex forcefield worth 30% of your max health. It soaks what hits it and mends after two quiet seconds. The other two percent is not covered.' },
  thick: { name: 'Thicker Membrane', max: 4, icon: 'M', sub: 'Membrane',
    desc: 'You were already wrapped in something thin and wet. Now it is thicker and wetter. +10% of your max health in Membrane.' },
  fast: { name: 'Faster Recharge', max: 3, icon: 'R', sub: 'Membrane',
    desc: 'Your Membrane starts mending sooner and finishes sooner. Nobody asked it to hurry. It did anyway.' },
  shell: { name: 'Shell Layer', max: 4, icon: 'S', sub: 'Shell',
    desc: 'You grow a hard brown layer. Each hit loses 3 before it reaches you. It wears, it cracks, and it does not grow back until the next wave.' },
  squishy: { name: 'Squishy', max: 1, icon: 'Q', sub: 'Squishy',
    desc: 'You go soft in the right places. Blunt (Force) hits lose 35%. Cuts do not care how soft you are.' },
  evasion: { name: 'Evasion', max: 5, icon: 'E', sub: 'Evasion',
    desc: '+10% chance a Contact, Projectile or Spread hit simply misses. Area attacks and puddles still find you. Luck is not a plan, but it is a plan with a percentage.' },
  thorns: { name: 'Thorns', max: 3, icon: 'T', sub: 'Thorns',
    desc: 'Anything that touches you takes 5 damage plus a third of what it dealt. Consent was never discussed.' },
};

// ---------------------------------------------------------------- state
function pdef() {
  if (G.pd) return G.pd;
  const mem = makeDefence(G.P.maxHp, 'membrane', 'normal', { memFrac: pdHasShield(null) ? PDEF.memFrac : 0 }); // (no shield, no Membrane)
  return G.pd = { mem, n: { latex: 0, thick: 0, fast: 0, shell: 0, squishy: 0, evasion: 0, thorns: 0 }, layers: 0, layerHp: 0, wave: null, shellT: 0, missT: 0, flashT: -9 };
}
const pdLayerHp = () => G.P.maxHp * COMBAT.shellLayerHpFrac;
function pst() {
  const S = fst();
  if (S.pMem == null) { S.pMem = 0; S.pLayers = 0; S.pMiss = 0; S.pThorns = 0; }
  return S;
}
const pdEvasion = D => Math.min(COMBAT.evasionCap, D.n.evasion * PDEF.evasionStep + (typeof s10Evasion === 'function' ? s10Evasion() : 0)); // (the Cold Parcel's built-in 20%: samples10.js)
const pdHasShield = D => !!((D && D.n.latex > 0) || (G && G.relics && G.relics.rubber) || (typeof s10Shield === 'function' && s10Shield())); // (card, Rubber Johnny relic, or a sample that starts with one)
const pdMemFrac = D => pdHasShield(D) ? PDEF.memFrac + D.n.thick * PDEF.thickStep : 0;
const pdefShieldUp = () => !!(G && G.pd && G.pd.mem.memMax > 0 && G.pd.mem.mem > 0 && pdHasShield(G.pd)); // (the bubble is on: stamina.js armourRing, bodymods.js)
const pdefShieldK = () => { const m = G.pd.mem; return m.memMax > 0 ? clamp(m.mem / m.memMax, 0, 1) : 0; };
// The bubble hit a surface too fast: it wears like a hit and the Membrane loses a little (bodymods.js bubbleBump).
function pdefDent(n) { const m = pdef().mem; if (m.memMax > 0) { m.mem = Math.max(0, m.mem - n * 0.04 * m.memMax); m.memQuietT = 0; } }
// Refit the Shell: every owned layer, full health.
function pdRefit(D) { D.layers = D.n.shell; D.layerHp = D.layers ? pdLayerHp() : 0; }

// What attacked you, as matrix attack and damage types.
function pdefAtk(kind, ent) {
  let a = PDEF_ATK[kind || 'other'] || 'pool';
  if (a === 'proj' && ent && ent.def) { // a shooter that only fires Spread
    const r = typeof ROSTER !== 'undefined' && ROSTER[fightId(ent.def)], t = r && r.atk && r.atk.map(x => x.type);
    if (t && t.indexOf('spread') >= 0 && t.indexOf('proj') < 0) a = 'spread';
  }
  return a;
}
function pdefTypes(ent) {
  const bd = ent && (ent.bossDef || ent.def), r = ent && ent.def && typeof ROSTER !== 'undefined' && ROSTER[fightId(ent.def)], t = (bd && bd.v10dmg) || (r && r.dmgType); // (bosses: boss10.js)
  return !t ? ['force'] : Array.isArray(t) ? t : [t];
}

// ---------------------------------------------------------------- one hit (game.js hurtPlayer, V10 only)
// Returns the damage that reaches your health (0: missed or fully soaked; hurtPlayer then returns).
function pdefHurt(dmg, from, ent, kind) {
  const D = pdef(), p = G.player, S = pst(), atk = pdefAtk(kind, ent), m = D.mem;
  // 1. Evasion (Contact, Projectile, Spread only). A miss stops here: no damage, no status, no Thorns.
  const ev = pdEvasion(D);
  if (ev > 0 && COMBAT.evasionTypes.indexOf(atk) >= 0 && Math.random() < ev) {
    S.pMiss++; p.iframes = Math.max(p.iframes, PDEF.missIframes);
    if (!(D.missT > G.realT)) { D.missT = G.realT + 0.3; floatText(p.x, p.y - 24, 'miss', PDEF_COL.miss, 13, 0.5); fxParts('spark', p.x, p.y, PDEF_COL.miss, 5, 70, 0.3, 2); }
    return 0;
  }
  // 2. Raw damage by type (Charged: +20% Static).
  const types = pdefTypes(ent), left = {}, raw = dmg;
  for (const t of types) left[t] = (left[t] || 0) + dmg / types.length * (t === 'static' && D.chargeT > G.t ? 1.2 : 1);
  const amt = Object.assign({}, left);
  const sum = () => { let s = 0; for (const k in left) s += left[k]; return s; };
  const scale = f => { for (const k in left) left[k] *= f; };
  const force = amt.force || 0, heavy = force > 0 && force >= COMBAT.heavyFrac.normal * G.P.maxHp;
  let blocked = false, toMem = 0, lost = 0;
  const drop = () => { if (D.layers <= 0) return; D.layers--; lost++; D.layerHp = D.layers ? pdLayerHp() : 0; };
  // 3. Membrane: absorbs first; Force costs 2 per point.
  if (m.memMax > 0) {
    let cost = 0; for (const k in left) cost += left[k] * (k === 'force' ? 1 / COMBAT.membraneForceK : 1);
    if (cost > 0 && m.mem > 0) {
      const f = Math.min(1, m.mem / cost);
      toMem = raw * f; m.mem = Math.max(0, m.mem - cost * f); m.memQuietT = 0; scale(1 - f);
      if (f >= 1) blocked = true;
      G.armFlash = { t: G.realT, k: Math.min(1, 0.4 + 0.6 * toMem / (0.15 * G.P.maxHp)), a: ent && ent.x != null ? Math.atan2(ent.y - p.y, ent.x - p.x) : null }; // (the bubble lights where it was hit: stamina.js armourRing)
    }
    if (amt.static > 0 && m.memStaticCd <= 0) { m.mem = Math.min(m.memMax, m.mem + COMBAT.staticRechargeFrac * m.memMax); m.memStaticCd = COMBAT.staticRechargeCd; G.armFlash = { t: G.realT, k: 0.5, a: null }; }
  }
  // 4. Shell: 3 off per layer (floor 1), the outer layer wears by what it blocked; a heavy Force hit sheds one more.
  if (D.layers > 0 && sum() > 0) {
    const before = sum(), blk = Math.max(0, Math.min(COMBAT.shellPerLayer * D.layers, before - Math.min(before, COMBAT.shellFloor)));
    scale((before - blk) / before);
    D.layerHp -= blk; if (D.layerHp <= 0) drop();
    if (heavy) drop();
  }
  // Corrosion: Acid builds a bar against your Shell (sized per layer); a full bar strips a layer until the next refit.
  if (D.layers > 0 && !blocked && amt.acid > 0) {
    m.bars.acid += amt.acid / (COMBAT.barSize.acid * D.layers * G.P.maxHp); m.barQuietT.acid = 0;
    if (m.bars.acid >= 1) { m.bars.acid = 0; drop(); }
  }
  // 5. Squishy: blunt only.
  if (D.n.squishy && left.force) left.force *= 1 - COMBAT.squishyForceCut;
  const d = sum();
  S.pMem += toMem; S.pLayers += lost;
  if (toMem > 0) D.flashT = G.realT;
  if (lost) { ring(p.x, p.y, p.r + 16, PDEF_COL.shell, 0.35, 5); fxParts('spark', p.x, p.y, PDEF_COL.shell, 8, 140, 0.4, 3); }
  // Thorns: Contact only, once per hit, bounded; the hit has connected (a miss returned above).
  if (atk === 'contact' && D.n.thorns && ent && ent.maxHp > 0 && !ent.dead && !ent.egg) {
    const t = (COMBAT.thornsBase + COMBAT.thornsFrac * raw) * (1 + PDEF.thornsStep * (D.n.thorns - 1));
    S.pThorns += t; after(0, () => { if (G && !ent.dead) damageEnemy(ent, t, { elem: 'phys', echo: true, noStatus: true, noCrit: true, atk: 'contact', wname: 'Thorns' }); });
  }
  if (blocked || d <= 0) { // fully soaked: no status, no damage, a short grace
    p.iframes = Math.max(p.iframes, PDEF.soakIframes);
    ring(p.x, p.y, p.r + 12, PDEF_COL.membrane, 0.3, 3);
    return 0;
  }
  pdefStatus(D, amt, d);
  return d;
}

// ---------------------------------------------------------------- your statuses (matrix 11.5 "On the player")
// A hit that got past the Membrane applies its damage types' statuses: Mucus Snares (55% slower, 1.5 s here, and it
// puts out Burning), Blood Bleeds (30% of the hit over 3 s, 3 at most), Fire adds to one shared burn (20% of the
// hit over 3 s, at most 25% of your max health held), Static Charges (3 s, +20% Static taken). Soul never Possesses you.
function pdefStatus(D, amt, d) {
  const P = PDEF_ST;
  if (amt.mucus > 0) { D.snareT = G.t + P.snareT; D.burnPool = 0; D.burnT = 0; }
  if (amt.blood > 0) { const b = D.bleeds || (D.bleeds = []); if (b.length >= 3) b.shift(); b.push({ dps: amt.blood * 0.3 / 3, t: 3 }); }
  if (amt.fire > 0 && !(D.snareT > G.t)) { D.burnPool = Math.min(G.P.maxHp * P.burnCap, (D.burnPool || 0) + amt.fire * 0.2); D.burnT = 3; }
  if (amt.static > 0) D.chargeT = G.t + 3;
}
const PDEF_ST = { snareT: 1.5, snareSlow: 0.45, burnCap: 0.25 };
function pdefSpeed() { const D = G && G.pd; return D && D.snareT > G.t ? PDEF_ST.snareSlow : 1; }
function pdefStatusDraw() { // your statuses, drawn on you like the enemies' (fight.js)
  const D = G.pd; if (!D) return;
  const p = G.player, x = sx(p.x), y = sy(p.y), r = p.r * S * 1.3, now = G.t;
  ctx.save();
  if (D.snareT > now) { ctx.strokeStyle = col('#7fd04a'); ctx.globalAlpha = 0.7; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y + r * 0.2, r * 1.2, r * 0.9, 0, 0, TAU); ctx.stroke(); }
  if (D.bleeds && D.bleeds.length) { ctx.fillStyle = col('#c9184a'); ctx.globalAlpha = 0.9; for (let i = 0; i < D.bleeds.length; i++) { ctx.beginPath(); ctx.arc(x + (i - 1) * r * 0.4, y + r * 0.7 + ((now * 30 + i * 9) % 10) * S, 2 * S, 0, TAU); ctx.fill(); } }
  if (D.burnT > 0) { ctx.fillStyle = col('#ff6a2a'); ctx.globalAlpha = 0.6 + 0.3 * Math.sin(now * 20); for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.6; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, 2.5 * S, (5 + 2 * Math.sin(now * 15 + i)) * S, a + Math.PI / 2, 0, TAU); ctx.fill(); } }
  if (D.chargeT > now) { ctx.strokeStyle = col('#ffe94a'); ctx.globalAlpha = 0.9; ctx.lineWidth = 1.4; ctx.beginPath(); for (let i = 0; i < 2; i++) { const a = rand(0, TAU); ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.lineTo(x + Math.cos(a + 0.3) * (r + 6 * S), y + Math.sin(a + 0.3) * (r + 6 * S)); } ctx.stroke(); }
  ctx.restore();
}
// Bleed and burn ticks: they can kill you, like any other damage, but skip defences (damage over time).
function pdefDot(d, name) {
  const p = G.player;
  if (!(d > 0) || G.state !== 'play' || (G.debug && G.debug.god)) return;
  p.hp -= d; G.stats.lastHit = name; G.stats.hurt[name] = (G.stats.hurt[name] || 0) + d;
  if (p.hp <= 0) { p.hp = 0; if (!genesLethal() && !boonSave() && !schoolSave() && !startRewind(true)) gameOver(); }
}
function pdefStatusTick(D, dt) {
  if (D.bleeds && D.bleeds.length) { let d = 0; for (const b of D.bleeds) { d += b.dps * Math.min(dt, b.t); b.t -= dt; } D.bleeds = D.bleeds.filter(b => b.t > 0); pdefDot(d, 'Bleeding'); }
  if (D.burnT > 0) { const k = Math.min(1, dt / D.burnT), d = D.burnPool * k; D.burnPool -= d; D.burnT -= dt; pdefDot(d, 'Burning'); if (D.burnT <= 0) D.burnPool = 0; }
}

// ---------------------------------------------------------------- each frame (v10.js v10Tick)
function pdefTick(dt) {
  if (!G) return;
  const D = pdef(), m = D.mem;
  const mx = G.P.maxHp * pdMemFrac(D); // max health and Thicker Membrane move the capacity; keep the fill share
  if (Math.abs(mx - m.memMax) > 1e-6) { const k = m.memMax > 0 ? m.mem / m.memMax : 1; m.memMax = mx; m.maxHp = G.P.maxHp; m.mem = Math.min(mx, k * mx); }
  pdefStatusTick(D, dt);
  tickDefence(m, dt * (1 + PDEF.fastStep * D.n.fast)); // (recharge and Corrosion drain, combat.js; Faster Recharge speeds both clocks)
  if (G.wave) { if (D.wave !== G.wave.n) { D.wave = G.wave.n; pdRefit(D); } }
  else if (G.t - D.shellT >= PDEF.shellRegrow) { D.shellT = G.t; pdRefit(D); }
}

// ---------------------------------------------------------------- drawing (v10.js v10Draw, world space)
function pdefDraw() {
  if (!G || G.state === 'over') return;
  pdefStatusDraw();
  const D = pdef(), p = G.player, x = sx(p.x), y = sy(p.y);
  const R = 24 * S * playerScale() * 1.45;
  ctx.save(); ctx.lineCap = 'round';
  // (the Membrane itself is the forcefield bubble: stamina.js armourRing, called from render.js)
  for (let i = 0; i < D.layers; i++) { // brown ring per layer; the outer one fades as it wears
    const outer = i === D.layers - 1, hp = D.layerHp / pdLayerHp();
    ctx.strokeStyle = col(PDEF_COL.shell); ctx.globalAlpha = outer ? 0.35 + 0.55 * Math.max(0, hp) : 0.9; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(x, y, R + (4 + i * 3.5) * S, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------- cards (v10.js v10Loot)
const pdHeld = D => Object.keys(D.n).filter(k => D.n[k] > 0).length;
function pdefCard(id) {
  const C = PDEF_CARDS[id], n = pdef().n[id];
  return { rarity: 0, tag: 'DEFENCE', icon: C.icon, color: PDEF_COL.membrane, title: C.name, sub: `Defence | ${C.sub} | ${n ? 'Rank ' + (n + 1) : 'New'}${C.max > 1 ? ' of ' + C.max : ''}`, desc: C.desc, defence: id,
    apply: () => { const d = pdef(); d.n[id] = Math.min(C.max, d.n[id] + 1); if (id === 'shell') { d.layers = Math.min(d.n.shell, d.layers + 1); if (d.layers === 1) d.layerHp = pdLayerHp(); } } };
}
// k different defence cards: none that are maxed, and no new one once the Genome slots are full.
function pdefOffer(k) {
  const D = pdef(), full = pdHeld(D) >= PDEF.slots;
  const sh = pdHasShield(D); // Latex Protection only while you have no shield; Thicker Membrane and Faster Recharge only with one
  const ok = Object.keys(PDEF_CARDS).filter(id => D.n[id] < PDEF_CARDS[id].max && (id === 'latex' ? !sh : (id !== 'thick' && id !== 'fast') || sh) && !(full && D.n[id] === 0) && !(id === 'evasion' && typeof s10Evasion === 'function' && s10Evasion() > 0)); // (no Evasion card with Evasion built in)
  return shuffle(ok).slice(0, Math.max(0, k)).map(pdefCard);
}
