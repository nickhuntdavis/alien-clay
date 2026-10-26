'use strict';
// Spawn Prawn - more slotless draft cards (ccr-b6a373a9-q8ofbd): trade-offs, low health, statuses, a damage type the
// Membrane learns, kill streaks, sprinting, a decoy, bosses, a curse and the race to the egg. Fourteen 'up:' cards
// (draft.js group 'up'), ranks in G.pkc[id]. All copy is TODO_COPY:pk_<id>_title / _desc.
//  - pk_heart    (trade-off, 1 rank) max HP +40%, swim 10% slower.
//  - pk_bubble   (trade-off, needs a Membrane, 1 rank) Membrane twice the size, mends half as fast.
//  - pk_edge     up to +25% damage per rank as your health drops (full at 0 HP, nothing at full health).
//  - pk_shrug    your statuses (Snotty slow, Bleeding, Melting/Burning) run 25% shorter and weaker per rank.
//  - pk_learn    while the Membrane is up, hits of the damage type that has hurt you most this run lose 35% per rank (max 2).
//  - pk_streak   10 / 8 / 6 kills inside 5 s: +40% fire rate for 4 s.
//  - pk_trail    sprinting leaves a slime trail for 2 s; enemies on it slip (game.js e.iceT, the ice-rink slide).
//  - pk_burst    starting a sprint shoves enemies round you away and deals Force damage. Once per 3 s.
//  - pk_dud      every 30 / 24 / 18 s a dud sperm appears where you are; for 5 s enemies chase and shoot it (G.decoy, toys.js peekSpot).
//  - pk_slayer   +12% damage to bosses per rank.
//  - pk_brace    boss hits deal 10% less per rank.
//  - pk_hex      (curse, 1 rank) take 15% more damage; every level and box draft deals one more card (four at most).
//  - pk_homing   (race only) within 900 px of the egg, swim 6% faster per rank.
//  - pk_last     (race only) within 900 px of the egg, take 10% less damage per rank.
// Hooks: hookOn tick, kill, dmgMul, hurtMul. Wraps mutSpeed (mutations.js), rateBonus (arsenal.js), pdefHurt, pdefStatus,
// pdefTick (pdef.js), draftCards (draft.js), sillyTick (silly.js: hides the dud from the Cardboard Cutout) and v10Draw
// (draws the trail and the dud). Loads after vitals.js (and after draft.js).

const PKC = {
  pk_heart:  { rarity: 2, max: 1, icon: 'BH', color: '#ff9fb2' },
  pk_bubble: { rarity: 2, max: 1, icon: 'BB', color: '#9fd8ff', needs: 'mem' },
  pk_edge:   { rarity: 2, max: 3, icon: 'ED', color: '#e06c75' },
  pk_shrug:  { rarity: 1, max: 3, icon: 'SR', color: '#c9b6ff' },
  pk_learn:  { rarity: 2, max: 2, icon: 'LN', color: '#9fd8ff', needs: 'mem' },
  pk_streak: { rarity: 2, max: 3, icon: 'KS', color: '#ffd23f' },
  pk_trail:  { rarity: 1, max: 3, icon: 'TR', color: '#bde0fe' },
  pk_burst:  { rarity: 1, max: 3, icon: 'BU', color: '#bde0fe' },
  pk_dud:    { rarity: 2, max: 3, icon: 'DU', color: '#d4a373' },
  pk_slayer: { rarity: 1, max: 3, icon: 'BS', color: '#ff6b6b' },
  pk_brace:  { rarity: 1, max: 3, icon: 'BR', color: '#ff6b6b' },
  pk_hex:    { rarity: 3, max: 1, icon: 'HX', color: '#9d4edd' },
  pk_homing: { rarity: 1, max: 3, icon: 'HO', color: '#ffd6e8', needs: 'race' },
  pk_last:   { rarity: 1, max: 3, icon: 'LS', color: '#ffd6e8', needs: 'race' },
};
const PK = { heartHp: 0.4, heartSpd: 0.9, edge: 0.25, shrug: 0.25, learn: 0.35, streakN: [10, 8, 6], streakT: 5, streakDur: 4, streakRate: 1.4,
  trailEvery: 0.08, trailLife: 2, trailR: 30, burstR: 140, burst: 8, burstShove: 380, burstCd: 3, dudEvery: [30, 24, 18], dudDur: 5,
  slayer: 0.12, brace: 0.1, hexHurt: 1.15, eggR: 900, homing: 0.06, last: 0.1 };
const pkr = id => (G && G.pkc && G.pkc[id]) || 0;
const pkMem = () => typeof pdHasShield === 'function' && pdHasShield(pdef());
const pkRace = () => !!(G && G.eggE && !G.wave && !G.lvl && !G.debug);
const pkNearEgg = () => { const E = G.eggE, p = G.player; return pkRace() && !E.dead && Math.hypot(E.x - p.x, E.y - p.y) < PK.eggR; };
const pkS = () => G.pkS || (G.pkS = { kills: [], hasteT: -9, trail: [], trailT: 0, sprint: false, burstT: -9, dudT: 0, hurtBy: {} });

for (const id in PKC) {
  const K = PKC[id];
  const c = { id, kind: 'enhance', slot: null, family: 'up:' + id, type: null, rarity: K.rarity, start: true,
    title: 'TODO_COPY:' + id + '_title', desc: 'TODO_COPY:' + id + '_desc', icon: K.icon, color: K.color, maxRank: K.max,
    eligible: G => !K.needs || (K.needs === 'mem' ? pkMem() : pkRace()), rank: () => pkr(id),
    apply: G => {
      (G.pkc || (G.pkc = {}))[id] = pkr(id) + 1;
      if (id === 'pk_heart') { const add = Math.round(G.P.maxHp * PK.heartHp); G.P.maxHp += add; G.player.hp += add; }
    } };
  if (typeof draftRegister === 'function') draftRegister(c); else (window.CARDS10 = window.CARDS10 || []).push(c);
}

// ---------------------------------------------------------------- each frame
function pkTick(dt) {
  if (!G || !G.pkc || G.state !== 'play') return;
  const S = pkS(), p = G.player;
  // Slime trail
  const sprint = !!(G.stam && G.stam.sprint);
  if (pkr('pk_trail')) {
    if (sprint && (S.trailT -= dt) <= 0) { S.trailT = PK.trailEvery; S.trail.push({ x: p.x, y: p.y, t: G.t + PK.trailLife }); }
    S.trail = S.trail.filter(b => b.t > G.t);
    const slip = 0.25 + 0.15 * pkr('pk_trail');
    for (const b of S.trail) forNear(b.x, b.y, PK.trailR, e => { if (!e.boss && !e.egg) e.iceT = Math.max(e.iceT || 0, G.t + slip); });
  }
  // Sprint-start burst
  if (sprint && !S.sprint && pkr('pk_burst') && G.t - S.burstT >= PK.burstCd) {
    S.burstT = G.t;
    aoe(p.x, p.y, PK.burstR, PK.burst * pkr('pk_burst') * hpNow(), { elem: 'phys', wname: 'Sprint burst', noCrit: true }, '#bde0fe');
    forNear(p.x, p.y, PK.burstR, e => shove(e, p.x, p.y, PK.burstShove));
  }
  S.sprint = sprint;
  // Dud sperm
  const k = pkr('pk_dud');
  if (k && !(G.decoy && G.decoy.end > G.t) && (S.dudT += dt) >= PK.dudEvery[Math.min(k, 3) - 1]) {
    S.dudT = 0;
    G.decoy = { x: p.x, y: p.y, end: G.t + PK.dudDur, face: p.face || 0, sayT: 1e9, pk: true };
    ring(p.x, p.y, 40, '#d4a373', 0.4, 3);
  }
  const D = G.decoy;
  if (D && D.pk) {
    for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - D.x, b.y - D.y) < 22) { b.dead = true; spawnPart(b.x, b.y, '#d4a373', 2, 60, 0.3); }
    if (G.t > D.end) { G.decoy = null; ring(D.x, D.y, 60, '#d4a373', 0.4, 3); fxParts('spark', D.x, D.y, '#d4a373', 8, 90, 0.4, 2); }
  }
}
function pkKill() {
  const k = pkr('pk_streak'); if (!k) return;
  const S = pkS(); S.kills.push(G.t); S.kills = S.kills.filter(t => G.t - t <= PK.streakT);
  if (S.kills.length >= PK.streakN[Math.min(k, 3) - 1]) {
    S.kills = []; if (!(S.hasteT > G.t)) ring(G.player.x, G.player.y, G.player.r + 16, '#ffd23f', 0.4, 4);
    S.hasteT = G.t + PK.streakDur;
  }
}
function pkDmgMul(e) {
  if (!G || !G.pkc) return 1;
  let m = 1;
  const k = pkr('pk_edge'); if (k) m *= 1 + PK.edge * k * clamp(1 - G.player.hp / G.P.maxHp, 0, 1);
  if (pkr('pk_slayer') && e && e.boss && !e.egg) m *= 1 + PK.slayer * pkr('pk_slayer');
  return m;
}
function pkHurtMul(ent) {
  if (!G || !G.pkc) return 1;
  let m = 1;
  if (pkr('pk_brace') && ent && (ent.boss || ent.bossDef) && !ent.egg) m *= 1 - PK.brace * pkr('pk_brace');
  if (pkr('pk_hex')) m *= PK.hexHurt;
  if (pkr('pk_last') && pkNearEgg()) m *= 1 - PK.last * pkr('pk_last');
  return m;
}

// ---------------------------------------------------------------- wraps
if (typeof mutSpeed === 'function') {
  const pkSpeed0 = mutSpeed;
  mutSpeed = function () { // (Big Heart: slower; Homing In: faster near the egg)
    let m = pkSpeed0();
    if (G && G.pkc) { if (pkr('pk_heart')) m *= PK.heartSpd; if (pkr('pk_homing') && pkNearEgg()) m *= 1 + PK.homing * pkr('pk_homing'); }
    return m;
  };
}
if (typeof rateBonus === 'function') {
  const pkRate0 = rateBonus;
  rateBonus = function () { return pkRate0() * (G && G.pkS && G.pkS.hasteT > G.t ? PK.streakRate : 1); }; // (kill streak)
}
if (typeof pdefHurt === 'function') {
  const pkHurt0 = pdefHurt;
  pdefHurt = function (dmg, from, ent, kind) { // (Learned Membrane: the type that hurt you most loses 35% a rank while the Membrane is up)
    if (G && G.pkc) {
      const S = pkS(), types = pdefTypes(ent);
      for (const t of types) S.hurtBy[t] = (S.hurtBy[t] || 0) + dmg / types.length;
      const k = pkr('pk_learn'), m = G.pd && G.pd.mem;
      if (k && m && m.mem > 0) {
        let top = null; for (const t in S.hurtBy) if (!top || S.hurtBy[t] > S.hurtBy[top]) top = t;
        const share = types.filter(t => t === top).length / types.length;
        if (share > 0) dmg *= 1 - PK.learn * k * share;
      }
    }
    return pkHurt0(dmg, from, ent, kind);
  };
}
if (typeof pdefStatus === 'function') {
  const pkStatus0 = pdefStatus;
  pdefStatus = function (D, amt, d) { // (Shrug It Off: your statuses run shorter and weaker)
    const sn = D.snareT, nb = D.bleeds ? D.bleeds.length : 0, bp = D.burnPool || 0;
    pkStatus0(D, amt, d);
    const k = pkr('pk_shrug'); if (!k) return;
    const f = 1 - PK.shrug * k;
    if (D.snareT !== sn && D.snareT > G.t) D.snareT = G.t + (D.snareT - G.t) * f;
    if (D.bleeds && D.bleeds.length && (D.bleeds.length !== nb || amt.blood > 0)) { const b = D.bleeds[D.bleeds.length - 1]; b.t *= f; }
    if ((D.burnPool || 0) > bp) { D.burnPool = bp + (D.burnPool - bp) * f; D.burnT *= f; }
  };
}
if (typeof pdefTick === 'function') {
  const pkPdTick0 = pdefTick;
  pdefTick = function (dt) { // (Bubble Wrap: twice the Membrane, half the mending; through pdMemFrac's Thicker ranks and tickDefence's Faster ranks)
    const D = G && G.pd;
    if (!D || !pkr('pk_bubble')) return pkPdTick0(dt);
    const th = D.n.thick, fa = D.n.fast;
    D.n.thick = th + (PDEF.memFrac + th * PDEF.thickStep) / PDEF.thickStep; // (doubles the shield's share)
    D.n.fast = (0.5 * (1 + PDEF.fastStep * fa) - 1) / PDEF.fastStep;          // (halves the recharge clock)
    try { pkPdTick0(dt); } finally { D.n.thick = th; D.n.fast = fa; }
  };
}
if (typeof draftCards === 'function') {
  const pkDraft0 = draftCards;
  draftCards = function (n, kind) { return pkDraft0(pkr('pk_hex') ? Math.min(4, n + 1) : n, kind); }; // (Hex: one more card on every draft, four at most)
}
if (typeof sillyTick === 'function') {
  const pkSilly0 = sillyTick;
  sillyTick = function (dt) { // (the dud is not a Cardboard Cutout: keep silly.js from talking for it or knocking it over)
    const D = G && G.decoy; if (!D || !D.pk) return pkSilly0(dt);
    G.decoy = null; try { pkSilly0(dt); } finally { if (!G.decoy) G.decoy = D; }
  };
}
if (typeof sillyDraw === 'function') {
  const pkSillyDraw0 = sillyDraw;
  sillyDraw = function () { const D = G && G.decoy; if (!D || !D.pk) return pkSillyDraw0(); G.decoy = null; try { pkSillyDraw0(); } finally { if (!G.decoy) G.decoy = D; } };
}
function pkDraw() {
  if (!G || !G.pkS) return;
  for (const b of G.pkS.trail) {
    const a = clamp((b.t - G.t) / PK.trailLife, 0, 1) * 0.35;
    ctx.fillStyle = 'rgba(189,224,254,' + a.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(sx(b.x), sy(b.y), PK.trailR * 0.7 * S, 0, TAU); ctx.fill();
  }
  const D = G.decoy;
  if (D && D.pk) {
    const k = clamp((D.end - G.t) / PK.dudDur, 0, 1);
    drawShip(sx(D.x), sy(D.y), D.face, '#d4a373', 0.5 + 0.4 * k, playerScale());
  }
}
if (typeof v10Draw === 'function') { const pkV10Draw0 = v10Draw; v10Draw = function () { pkV10Draw0(); pkDraw(); }; }

hookOn('tick', 'pkTick', dt => pkTick(dt));
hookOn('kill', 'pkKill', () => pkKill());
hookOn('dmgMul', 'pkDmgMul', e => pkDmgMul(e));
hookOn('hurtMul', 'pkHurtMul', ent => pkHurtMul(ent));
