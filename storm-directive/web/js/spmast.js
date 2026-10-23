'use strict';
// Spawn Prawn - branching sperm passive masteries (user, 23 Oct: "keep the first two of each as branching masteries").
// Taking a passive's mastery (its 4th card; one a build, spassives.js spMasteryRoom) opens a fork: A or B, the other is
// gone for the run. Defences (Squishy, Shell, Thorns, Evasion) get a mastery card of their own once you hold enough of
// them; it uses no extra slot. Group Project, Growing Pains, Conductive Mess and the four trade-offs gain the doc's
// 3 levels (SPERM_PASSIVES.md 2), so they have a mastery too.
//   Slipstream      A Wake: at full speed enemies behind you are dragged along and slowed 30%.  B Ram: at full speed,
//                   swimming into an enemy is a Force hit that knocks it aside.
//   Heartbeat       A the burst is your sample's damage type.  B a second, smaller beat 0.3 s later.
//   Overexcited     A the boost never runs out while a boss is alive.  B each kill in the boost adds 0.5 s (8 s at most).
//   Group Project   A the window is 1 s.  B a third weapon in the window deals +100%.
//   Growing Pains   A the burst heals 5% per enemy hit (25% at most).  B 3 s of +30% attack speed after a level-up.
//   Extra Padding   A overflow healing becomes Membrane.  B once a wave, the hit that takes you below half is halved.
//   Squishy         A while 2+ enemies touch you, Contact hits do half.  B an enemy that hits you is knocked back.
//   Shell           A a lost layer regrows after 15 s without a hit (layers already refit each wave).  B a lost layer
//                   bursts as a Force hit round you.
//   Thorns          A also answers enemy bullets, at half.  B Thorns makes enemies Bleed.
//   Evasion         A your next hit within 1 s of an evade deals +50%.  B an evade gives 0.5 s of +40% swim speed.
//   Stickier        A Snared enemies in your pools can't be knocked out.  B a Snared enemy Snares what touches it (once).
//   Crossed Wires   A reaction lockout 0.5 s.  B each reaction hit has a 25% chance to hit again.
//   Conductive Mess A Charged enemies in a blood pool Bleed.  B a blood pool with a Charged enemy zaps everything in it.
//   Big Brain       A above 70% health +20% damage, and the health cost becomes a Membrane.  B the +20% only.
//   Can't Sit Still A no penalty for 3 s after a Feat.  B no penalty at all.
//   All at Once     A no follow-up penalty.  B an enemy is fresh again after 1.5 s (not 3).
//   Hungry Hungry   A 1 kill in 6 drops its XP twice (the extra enemies' share).  B XP pickups heal 0.5% each.
// Hooks: none in shared files. Wraps mutations.js mutDmg, mutRate, mutSpeed, mutHurtIn, mutKill, mutLevel, mutBurst,
// mutRxLock, mutHit; pdef.js pdefHurt; game.js healPlayer, gainXp, fireWeapon (Feats); weapons24.js wupTick, wupDmgMul,
// wupKill; draft.js forkCards, draftTitle. Loads after spsteer.js.

const SPM_BR = {
  m_slip: ['Wake', 'At full speed, enemies behind you are dragged along and slowed by 30%.', 'Ram', 'At full speed, swimming into an enemy hits it with Force and knocks it aside.'],
  m_heart: ['Your Type', 'The burst is your sample\'s damage type.', 'Double Beat', 'A second, smaller burst follows 0.3 s later.'],
  m_excite: ['Boss Rush', 'While a boss is alive, the boost never runs out.', 'Keep It Going', 'Each kill during the boost adds 0.5 s, up to 8 s.'],
  r_group: ['Longer Window', 'The window for the second hit is 1 s.', 'Third Wheel', 'A third weapon hitting in the window deals +100%.'],
  r_pains: ['Healing Burst', 'The burst heals you 5% per enemy hit, up to 25%.', 'Afterglow', 'For 3 s after a level-up, you attack 30% faster.'],
  m_pad: ['Overflow', 'Healing past full health becomes Membrane.', 'Cushion', 'Once a wave, the hit that takes you below half health is halved.'],
  t_mucus: ['Stuck Fast', 'Snared enemies in your pools can\'t be knocked out of them.', 'Glue Trap', 'An enemy that touches a Snared one is Snared too.'],
  t_wires: ['Quick Reset', 'Unstable reactions can go off again after 0.5 s.', 'Echo', 'Each unstable reaction hit has a 25% chance to hit again.'],
  r_mess: ['Bloody Wires', 'Charged enemies in a blood pool Bleed.', 'Live Wire', 'A blood pool with a Charged enemy in it zaps everything inside every second.'],
  x_brain: ['Thick Skull', 'Above 70% health, +20% damage, and the health cost becomes a Membrane.', 'Showing Off', 'Above 70% health, +20% damage.'],
  x_still: ['Feat Break', 'No penalty for 3 s after you perform a Feat.', 'Fidget', 'No penalty for keeping still.'],
  x_once: ['No Hard Feelings', 'Follow-up hits are no longer weaker.', 'Short Memory', 'An enemy counts as fresh again after 1.5 s.'],
  x_hungry: ['Seconds', '1 kill in 6 drops its XP twice.', 'Snack', 'Each XP pickup heals 0.5% of your health.'],
  squishy: ['Squeeze', 'While 2 or more enemies touch you, their Contact hits do half damage.', 'Bounce Back', 'An enemy that hits you is knocked back.'],
  shell: ['Regrowth', 'A lost layer grows back after 15 s without being hit.', 'Shrapnel', 'A lost layer bursts outward as a Force hit.'],
  thorns: ['Return Fire', 'Thorns also answers enemy bullets, at half strength.', 'Barbs', 'Thorns damage makes enemies Bleed.'],
  evasion: ['Counter', 'Your next hit within 1 s of an evade deals +50%.', 'Slip Away', 'An evade gives 0.5 s of +40% swim speed.'],
};
const SPM_DEF = ['squishy', 'shell', 'thorns', 'evasion'];
const spmB = id => (SPM_DEF.includes(id) ? (G && G.spMx && G.spMx[id]) : mr(id) >= 4) ? ((G.spB && G.spB[id]) || 'A') : null;
const spmFork = id => G.lootQueue.unshift({ kind: 'fork', v10ok: true, lv: 4, sp: id, spm: 1 });

// ---------------------------------------------------------------- cards: levels and the mastery fork
for (const id of Object.keys(SPM_BR)) {
  if (SPM_DEF.includes(id)) continue;
  const c = MUT_REG.find(x => x.id === id); if (!c) continue;
  const el = c.eligible, ap = c.apply;
  if (c.maxRank === 1) { // the doc's 3 levels and a mastery
    c.maxRank = 4; c.eligible = G => el(G) && (mr(id) < 3 || spMasteryRoom('sperm'));
    c.apply = (G, t) => {
      const r0 = mr(id);
      if (!r0) return ap(G, t);
      mutSt(); G.muts[id] = r0 + 1;
      if (id === 'x_brain' && r0 < 3) G.P.might *= (1.25 + 0.1 * r0) / (1.15 + 0.1 * r0); // +25/35/45%; the cost stays
      if (id === 'x_hungry' && r0 < 3) G.P.xp += 0.3; // +30/45/60% (XP bonuses count half)
      if (r0 === 3) (G.spM || (G.spM = [])).push(id);
    };
  }
  const ap2 = c.apply;
  c.apply = (G, t) => { const r0 = mr(id); ap2(G, t); if (r0 === 3 && mr(id) === 4) spmFork(id); };
}
for (const k of SPM_DEF) { // defence masteries: no slot of their own
  const need = () => Math.min(3, PDEF_CARDS[k].max);
  const c = mutCard({ id: 'spm_' + k, title: PDEF_CARDS[k].name + ' Mastery', icon: PDEF_CARDS[k].icon, rarity: 3, maxRank: 1, family: 'mut:def', flavour: 'Mastery.',
    desc: 'Choose one of two masteries for ' + PDEF_CARDS[k].name + '.', why: G => G.pd && G.pd.n[k] >= need() && spMasteryRoom('sperm') ? '' : 'needs ' + PDEF_CARDS[k].name + ' at ' + need() });
  c.rank = () => (G && G.spMx && G.spMx[k] ? 1 : 0);
  c.apply = G => { (G.spMx || (G.spMx = {}))[k] = 1; (G.spM || (G.spM = [])).push('spm_' + k); spmFork(k); };
  SP_KEEP.push(c.id); if (typeof SLICE !== 'undefined') SLICE.muts.push(c.id);
}
forkCards = (orig => function (req) {
  if (!req.spm) return orig(req);
  const B = SPM_BR[req.sp], nm = SPM_DEF.includes(req.sp) ? PDEF_CARDS[req.sp].name : (MUT_REG.find(c => c.id === req.sp) || {}).title;
  return [['A', B[0], B[1]], ['B', B[2], B[3]]].map(([k, t, d]) => ({ rarity: 4, tag: 'MASTERY', icon: 'M', color: '#ffd23f', title: t, sub: nm, desc: d,
    apply: () => { (G.spB || (G.spB = {}))[req.sp] = k; } }));
})(forkCards);
draftTitle = (orig => function (req) {
  if (!req.spm) return orig(req);
  const nm = SPM_DEF.includes(req.sp) ? PDEF_CARDS[req.sp].name : (MUT_REG.find(c => c.id === req.sp) || {}).title;
  return [nm.toUpperCase() + ': MASTERY', 'Pick one. The other is gone for this run.'];
})(draftTitle);

// ---------------------------------------------------------------- damage dealt (mutDmg, wupDmgMul)
mutDmg = (orig => function (e, src, t) {
  const plain = G.muts && !src.dot && !src.echo && !src.mut && !src.rx && src.w, w = src.w;
  let fresh = false, pen = false, grp = 0, base = false, k = 1;
  if (plain && mr('x_once')) {
    const win = spmB('x_once') === 'B' ? 1.5 : 3;
    fresh = !(e.mHitT > G.t - win); pen = !fresh && e.mPenT > G.t;
    if (fresh && e.mHitT > G.t - 3) e.mHitT = -9; // (Short Memory: fresh after 1.5 s)
  }
  if (plain && mr('r_group')) {
    const g = e.mGp, win = spmB('r_group') === 'A' ? 1 : 0.5;
    if (g && g.uid !== w.uid && G.t - g.t <= win) {
      grp = 1; base = G.t - g.t <= 0.5; // (base: mutations.js has already counted it)
      const L = (e.spGp || []).filter(x => G.t - x.t <= win && x.uid !== w.uid);
      if (spmB('r_group') === 'B' && new Set(L.map(x => x.uid)).size >= 2) grp = 2;
    }
    e.spGp = (e.spGp || []).filter(x => G.t - x.t <= 1).concat([{ uid: w.uid, t: G.t }]);
  }
  let m = orig(e, src, t);
  if (!plain) return m;
  const r = x => Math.min(3, mr(x));
  if (fresh && mr('x_once')) k *= (1.4 + 0.2 * r('x_once')) / 1.6; // +60/80/100%
  if (pen && spmB('x_once') === 'A') k /= 0.8;
  if (grp) {
    const g = 1.15 + 0.15 * r('r_group'); // +30/45/60%
    k *= (grp === 2 ? 2 : g) / (base ? 1.3 : 1);
    if (!base) ring(e.x, e.y, e.r + 6, w.def.color, 0.3, 3);
  }
  if (spmB('x_brain') && G.player.hp > 0.7 * G.P.maxHp) k *= 1.2;
  if (G.spEvT > G.t && spmB('evasion') === 'A') { k *= 1.5; G.spEvT = 0; }
  return m * k;
})(mutDmg);

// ---------------------------------------------------------------- attack rate and swim speed
mutRate = (orig => function () {
  let r = orig(); const st = G && G.mut10; if (!st) return r;
  if (mr('x_still')) {
    if (st.csK > 1) r *= (1.1 + 0.1 * Math.min(3, mr('x_still'))) / 1.2; // +20/30/40% while swimming
    else if (spmB('x_still') === 'B' || (spmB('x_still') === 'A' && G.spFeatT > G.t)) r /= st.csK;
  }
  if (spmB('r_pains') === 'B' && G.spGlowT > G.t) r *= 1.3;
  return r;
})(mutRate);
mutSpeed = (orig => function () { return orig() * (spmB('evasion') === 'B' && G.spSlipT > G.t ? 1.4 : 1); })(mutSpeed);
fireWeapon = (orig => function (w, target) { if (w && w.isSpell && G) G.spFeatT = G.t + 3; return orig(w, target); })(fireWeapon);

// ---------------------------------------------------------------- getting hurt
mutHurtIn = (orig => function (dmg, ent, kind) {
  const p = G.player, P = G.P;
  if (kind === 'contact' && spmB('squishy') === 'A') { let n = 0; for (const e of G.enemies) if (!e.dead && !e.charmed && Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r + 6) n++; if (n >= 2) dmg *= 0.5; }
  const B = G.spBrain; if (B && B.pad > 0 && dmg > 0) { const a = Math.min(dmg, B.pad); B.pad -= a; dmg -= a; ring(p.x, p.y, p.r + 10, '#5aa9ff', 0.3, 3); }
  if (B) B.quietT = G.t;
  let d = orig(dmg, ent, kind);
  if (spmB('m_pad') === 'B' && d > 0 && p.hp >= 0.5 * P.maxHp && p.hp - d < 0.5 * P.maxHp) {
    const tag = G.wave ? G.wave.n : Math.floor(G.t / 60);
    if (G.spCushion !== tag) { G.spCushion = tag; d *= 0.5; ring(p.x, p.y, p.r + 14, '#5aa9ff', 0.4, 4); }
  }
  if (spmB('squishy') === 'B' && kind === 'contact' && ent && ent.maxHp && !ent.boss && !ent.dead) { const l = Math.hypot(ent.x - p.x, ent.y - p.y) || 1; ent.kx += (ent.x - p.x) / l * 260; ent.ky += (ent.y - p.y) / l * 260; }
  return d;
})(mutHurtIn);
pdefHurt = (orig => function (dmg, from, ent, kind) {
  const S = pst(), miss0 = S.pMiss, D = pdef(), L0 = D.layers, p = G.player;
  const d = orig(dmg, from, ent, kind);
  if (S.pMiss > miss0) { G.spEvT = G.t + 1; G.spSlipT = G.t + 0.5; }
  if (D.layers < L0) {
    D.spLostT = G.t;
    if (spmB('shell') === 'B') { ring(p.x, p.y, 110, PDEF_COL.shell, 0.4, 5); mutBurst(p.x, p.y, 110, 30 * G.P.might * (L0 - D.layers), 'Shrapnel', 'shrapnel'); }
  }
  if (d > 0 || S.pMiss === miss0) D.spHitT = G.t;
  const atk = pdefAtk(kind, ent), tb = spmB('thorns');
  if (D.n.thorns && ent && ent.maxHp > 0 && !ent.dead && !ent.egg && S.pMiss === miss0) {
    const t = (COMBAT.thornsBase + COMBAT.thornsFrac * dmg) * (1 + PDEF.thornsStep * (D.n.thorns - 1));
    if (tb === 'A' && (atk === 'proj' || atk === 'spread')) after(0, () => { if (G && !ent.dead) damageEnemy(ent, t * 0.5, { elem: 'phys', echo: true, noStatus: true, noCrit: true, atk: 'contact', wname: 'Thorns' }); });
    if (tb === 'B' && atk === 'contact') after(0, () => { if (G && !ent.dead) fightStatus(ent, 'arcane', t, { wname: 'Barbs' }); });
  }
  return d;
})(pdefHurt);
healPlayer = (orig => function (n, silent) {
  const p = G && G.player;
  if (!p || spmB('m_pad') !== 'A') return orig(n, silent);
  const before = p.hp; orig(n, silent);
  const over = Math.max(0, n * G.P.healMult - (p.hp - before)), st = mutSt();
  if (over > 0 && st) st.pad = Math.min(0.05 * G.P.maxHp * Math.min(3, mr('m_pad')) * 2, st.pad + over);
})(healPlayer);

// ---------------------------------------------------------------- kills, level-ups, bursts, reactions
mutKill = (orig => function (e, src) {
  const st = mutSt(), was = st && st.oxT > G.t, t0 = st && st.oxT;
  orig(e, src);
  if (!st) return;
  if (st.oxT !== t0 && !was) st.oxStart = G.t;
  if (was && spmB('m_excite') === 'B') st.oxT = Math.min((st.oxStart || G.t) + 8, st.oxT + 0.5);
  if (spmB('x_hungry') === 'A' && e.xp > 0 && Math.random() < 1 / 6) dropGem(e.x, e.y, e.xp);
})(mutKill);
mutLevel = (orig => function (lv) {
  const st = mutSt(), p = G.player, r = Math.min(3, mr('r_pains'));
  if (r >= 2) { // Lv 2 and 3: a bigger burst, longer safety
    let n = 0; for (const e of G.enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 200) n++;
    const R = 90 + 10 * r, dm = 22 * G.P.might * (1 + Math.min(1, n / 12)) * (r === 2 ? 0.5 : 1);
    mutBurst(p.x, p.y, R, dm, 'Growing Pains', 'pains');
  }
  orig(lv);
  if (!st || !mr('r_pains')) return;
  st.gpT = G.t + 0.5 + 0.5 * r;
  if (spmB('r_pains') === 'A') { let n = 0; for (const e of G.enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 90 + 10 * r) n++; if (n) healPlayer(G.P.maxHp * Math.min(0.25, 0.05 * n)); }
  if (spmB('r_pains') === 'B') G.spGlowT = G.t + 3;
})(mutLevel);
mutBurst = (orig => function (x, y, R, dm, name, tag) {
  if (tag !== 'heart' || !spmB('m_heart')) return orig(x, y, R, dm, name, tag);
  if (spmB('m_heart') === 'A') { // the sample's damage type
    const el = DRAFT_INT[(G.sampleTypes && G.sampleTypes.primary) || 'force'] || 'phys';
    IN_AOE = true;
    for (const e of G.enemies) if (!e.dead && Math.hypot(e.x - x, e.y - y) < R + e.r) damageEnemy(e, dm, { elem: el, mut: tag, noCrit: true, noProc: true, atk: 'burst', wname: name, knock: 140, kx: e.x - x, ky: e.y - y });
    IN_AOE = false;
    return;
  }
  orig(x, y, R, dm, name, tag);
  after(0.3, () => { if (G) { const p = G.player; ring(p.x, p.y, R * 0.7, '#ffd6e0', 0.3, 3); orig(p.x, p.y, R * 0.7, dm * 0.5, name, tag); } });
})(mutBurst);
mutRxLock = (orig => function (id) { const s = orig(id); return spmB('t_wires') === 'A' && (META.rxSeen || []).includes(id) ? Math.min(s, 0.5) : s; })(mutRxLock);
mutHit = (orig => function (e, d, src, t, res) {
  orig(e, d, src, t, res);
  if (src.rx && !src.spEcho && d > 0 && spmB('t_wires') === 'B' && Math.random() < 0.25) {
    const s2 = Object.assign({}, src, { spEcho: 1 });
    after(0.2, () => { if (G && !e.dead) { ring(e.x, e.y, e.r + 8, MUT_COL.rare, 0.3, 3); damageEnemy(e, d, s2); } });
  }
})(mutHit);

// ---------------------------------------------------------------- every frame
function spmTick(dt) {
  const p = G.player, st = G.mut10, now = G.t;
  // Slipstream at full speed
  const sb = spmB('m_slip');
  if (sb && st && st.slipT >= 3) {
    const v = Math.hypot(p.vx, p.vy) || 1, ux = p.vx / v, uy = p.vy / v;
    for (const e of G.enemies) {
      if (e.dead || e.charmed || e.egg) continue;
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
      if (sb === 'A' && d < 160 && dx * ux + dy * uy < 0 && !e.boss) { e.x += ux * v * 0.4 * dt; e.y += uy * v * 0.4 * dt; e.chill = Math.max(e.chill || 0, 0.2); e.chillAmt = Math.max(e.chillAmt || 0, 0.3); }
      if (sb === 'B' && d < e.r + p.r + 4 && !(e.spRamT > now)) {
        e.spRamT = now + 0.5;
        damageEnemy(e, 20 * G.P.might, { elem: 'phys', mut: 'ram', noCrit: true, atk: 'contact', wname: 'Ram', knock: 260, kx: -uy * Math.sign(dx * -uy + dy * ux || 1), ky: ux * Math.sign(dx * -uy + dy * ux || 1) });
      }
    }
  }
  // Overexcited: Boss Rush
  if (spmB('m_excite') === 'A' && st && st.oxT > now && G.boss && !G.boss.dead) st.oxT = Math.max(st.oxT, now + 0.2);
  // Big Brain: Thick Skull
  if (spmB('x_brain') === 'A') {
    const B = G.spBrain || (G.spBrain = (hpFix(G, 1 / 0.8), { pad: 0, quietT: -9 })), cap = 0.2 * G.P.maxHp;
    if (now - B.quietT > 2) B.pad = Math.min(cap, B.pad + cap * dt / 2);
  }
  // Shell: Regrowth
  const D = G.pd;
  if (spmB('shell') === 'A' && D && D.layers < D.n.shell && now - (D.spHitT || 0) > 15 && now - (D.spLostT || -99) > 15) { D.layers++; D.layerHp = pdLayerHp(); D.spLostT = now; ring(p.x, p.y, p.r + 16, PDEF_COL.shell, 0.35, 4); }
  // Stickier
  const sk = spmB('t_mucus');
  if (sk) for (const e of G.enemies) {
    if (e.dead || !mutSnared(e)) continue;
    if (sk === 'A' && G.zones.some(z => z.life > 0 && z.src && (z.src.w || z.spell) && Math.hypot(z.x - e.x, z.y - e.y) < z.r)) { e.kx = 0; e.ky = 0; }
    if (sk === 'B') for (const o of G.enemies) if (o !== e && !o.dead && !o.spGlued && !mutSnared(o) && Math.hypot(o.x - e.x, o.y - e.y) < o.r + e.r + 2) { o.spGlued = 1; fightStatus(o, 'ice', 0, { wname: 'Glue Trap' }); }
  }
  // Conductive Mess: levels widen the spread; masteries
  const cm = mr('r_mess');
  if (cm && !(G.spMessT > now)) {
    G.spMessT = now + 1;
    for (const z of G.zones) {
      if (z.life <= 0 || !z.src || z.src.wname !== 'blood pool') continue;
      const R = z.r * (1 + 0.25 * (Math.min(3, cm) - 1)), inside = G.enemies.filter(e => !e.dead && Math.hypot(e.x - z.x, e.y - z.y) < R);
      const charged = inside.filter(e => e.chargeT > now);
      if (!charged.length) continue;
      for (const e of inside) if (!(e.chargeT > now)) { e.chargeT = now + 3; e.mNoPass = true; }
      if (spmB('r_mess') === 'A') for (const e of charged) fightStatus(e, 'arcane', 10 * G.P.might, { wname: 'Bloody Wires' });
      if (spmB('r_mess') === 'B') { ring(z.x, z.y, R, MUT_COL.static, 0.25, 3); for (const e of inside) damageEnemy(e, 8 * G.P.might, { elem: 'shock', mut: 'mess', noArc: true, noCrit: true, atk: 'burst', wname: 'Live Wire' }); }
    }
  }
}
wupTick = (orig => function (dt) { orig(dt); if (G && G.state === 'play') spmTick(dt); })(wupTick);
gainXp = (orig => function (v) {
  orig(v);
  if (G && spmB('x_hungry') === 'B' && v > 0) { const sec = Math.floor(G.t); if (G.spSnackS !== sec) { G.spSnackS = sec; G.spSnackN = 0; } if (G.spSnackN < 6) { G.spSnackN++; healPlayer(G.P.maxHp * 0.005, true); } }
})(gainXp);
