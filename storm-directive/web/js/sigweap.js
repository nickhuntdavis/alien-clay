'use strict';
// Spawn Prawn - v10 signature weapons (spec: ../redesign docs/SIGNATURE_WEAPONS.md, rules in COMBAT_MATRIX.md 12).
// 21 favourite originals, 5 Fire drafts and one dual-type Force/Static weapon, registered as WEAPONS['s_<id>'] beside the
// 42 matrix weapons. Each has ONE damage type and ONE attack type (v10: 1, v10atk, v10type, sig: 1).
//  - The originals are the old weapons re-typed through the new rules: the def is a copy of the old one (sigOf = old id) and
//    makeSlot gives the slot the OLD id (w.id), so the old behaviour code (toys.js, armoury.js, sigs.js, arsenal.js) finds it.
//    w.sid is the s_ id. Their old upgrade lists are dropped (lv: {}).
//  - The new ones (Hot and Bothered, Carpet Burn, Getting Warmer, Burning Sensation, the dual-type weapon) fire from sigFire.
//  - Echo damage (12.1): Red Tape's share and Due Date's repeat carry src.echo (toys.js toySrc), which fight.js already skips for
//    bars, heavy hits, Thorns and reactions; statuses are switched off with noStatus.
//  - Pets (12.3): at most 4 per weapon and 8 in all (leeches, undead turrets). Undead last 6 s. Lures (12.6): 3 teeth.
//  - Shocking Impact (matrix 1 / 11.3): the dual-type weapon alternates Force and Static shots; a Static shot sets off a small
//    burst (60%, radius 56, no chain). Two separate weapons never do.
// Hooks: v10.js v10Fire -> d.sigFire, v10Tick -> sigwTick, v10Draw -> sigDraw, v10Loot/v10Switch -> v10Pool; game.js makeSlot
// (id: def.sigOf || id, sid); fight.js fightReact -> sigReact and FIGHT_RX.shock; sigs.js afterMine -> sigMine, bladeEats;
// toys.js toySrc/toyHurt (echo), peekBoo (Fear 2 s, +100% at 10 lookers), toothFire (3 teeth); armoury.js latch heal ->
// sigExtract, upchuck merge cap 100, bowling depth 2; arsenal.js meleeLash (flail tip).

if (typeof VOID_MERGE !== 'undefined') VOID_MERGE.supernova = 5; // (12.5: Black Hole merges stop at 5, then supernova)

const SIG_IDS = [];
function sigReg(id, old, name, desc, elem, atk, over) {
  over = over || {};
  const o = old ? WEAPONS[old] : null;
  const d = Object.assign({}, o || {}, { name, desc, play: desc, elem, color: V10_COL[elem], v10: 1, v10atk: atk, v10type: elem, sig: 1,
    role: V10_ATK[atk].label, lv: {}, stars: [3, 3, 3, 3], sigOf: old || undefined }, over.def || {});
  if (!o) { d.kind = 'gun'; d.dir = d.dir || 'nearest'; d.icon = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
  d.base = Object.assign({}, o ? o.base : V10_ATK[atk].base, over.base || {});
  delete d.elem2;
  WEAPONS['s_' + id] = d; SIG_IDS.push('s_' + id);
  return d;
}
const v10Pool = () => (typeof W24_IDS !== 'undefined' ? w24Live().filter(id => typeof kinPool !== 'function' || kinPool(id)) : v10Ids().concat(SIG_IDS)); // (the 24: weapons24.js; a race offers only your and absorbed samples' weapons: kindred.js)

// ---------------------------------------------------------------- the originals (re-typed)
sigReg('orbit', 'orbit', 'Premature Evangelation', 'Guardian angels circle you and swat whatever comes close. Some eat bullets. They always start too soon.', 'soul', 'contact');
sigReg('mines', 'mines', 'Nappy Mines', 'Leaves mines behind you. Each blast leaves an acid pool, and a blast sets off its neighbours (three at most).', 'fire', 'burst');
sigReg('wake', 'wake', 'Pub Crawl', 'No aiming: you shed a boozy trail wherever you swim. Alcohol burns.', 'flame', 'pool');
sigReg('peekaboo', 'peekaboo', 'Peekaboo', 'You vanish. Enemies search the empty spot and shoot each other. Then BOO: fear, and more of it the more were looking.', 'soul', 'burst');
sigReg('void', 'void', 'Toddler Gravity', 'A slow black hole that pulls everything in. Two that touch merge. Five merged go supernova.', 'phys', 'proj');
sigReg('parasite', 'parasite', 'Tapeworm Seeder', 'Infects. An infected enemy that dies rises for a few seconds and fights for you. Four undead at most.', 'soul', 'proj');
sigReg('redtape', 'redtape', 'Red Tape', 'Tapes a target to its neighbours. Damage to one is shared with the bundle (35%, as echo damage).', 'ice', 'proj');
sigReg('duedate', 'duedate', 'Due Date', 'A countdown mark. When it ends, the target takes 40% of everything it took while marked, again.', 'arcane', 'proj');
sigReg('leeches', 'leeches', 'Leeches', 'Leeches latch on and feed. A little comes back to you as health. Four at most.', 'arcane', 'contact', { base: { count: 2 } });
sigReg('tesla', 'tesla', 'Static Cling', 'Static jumps through crowds. Charged enemies pass your other weapons\' hits on as arcs.', 'shock', 'proj', { base: { dmg: 11 } }); // (dmg 13 until 20 Oct: it led every weapon test)
sigReg('lard', 'lard', 'Lard Lobber', 'Lobs lard that sends everything flying. Flying enemies bowl into their mates, once. STRIKE.', 'phys', 'burst');
sigReg('siphon', 'siphon', 'Placental Siphon', 'Eats enemy bullets near you and fires them back. With nothing to eat it only dribbles.', 'phys', 'proj', { base: { mag: 10 } });
sigReg('bubble', 'bubble', 'Bubble Wand', 'Bubbles trap small enemies. Anything that touches a bubble pops it.', 'ice', 'proj');
sigReg('toothfairy', 'toothfairy', 'Tooth Fairy', 'Drops baby teeth. Greedy enemies swim to them and get smitten. Three teeth at most.', 'soul', 'burst');
sigReg('upchuck', 'upchuck', 'Upchuck', 'Lobs puddles of sick. Puddles that touch merge into a bigger one.', 'fire', 'pool');
sigReg('flamer', 'flamer', 'Heartburn', 'A short-range spray of reflux. It burns going up and coming down.', 'flame', 'spread', { base: { dmg: 2.4, count: 2, boomerang: 1 } });
sigReg('twin', 'twin', 'Twin Telepathy', 'A beam joins you and your twin across the crowd. Swim to sweep it. Charged enemies on it pass arcs on.', 'shock', 'beam');
sigReg('blister', 'blister', 'Blood Blister', 'Do not pop it. It will pop itself. Twice.', 'arcane', 'pool');
sigReg('onesie', 'onesie', 'Thorny Onesie', 'Spikes pulse out all around you. Huggable, technically. Harder the more max health you have.', 'phys', 'burst');
sigReg('seeker', 'seeker', 'Seeker Siblings', 'Tiny homing siblings who swim for you and never miss. A sibling that kills splits in two.', 'arcane', 'proj');
sigReg('flail', 'flail', 'Flagellum Flail', 'Your tail cracks like a whip in a long straight line. The tip hits hardest.', 'phys', 'beam');
sigReg('goblins', 'goblins', 'Nose Goblins', 'They live up there. They have always lived up there. They flick snot at different enemies.', 'ice', 'proj');

// ---------------------------------------------------------------- new: sigFire weapons
const sigShot = (w, target, src, extra, over) => {
  const p = G.player, a = Math.atan2(target.y - p.y, target.x - p.x);
  return spawnProj(w, p.x, p.y, a + rand(-w.s.spread, w.s.spread) * 0.5, Object.assign({}, src, extra || {}), over);
};

// Rubbed the Wrong Way (new, flagged): the dual-type Force/Static weapon that lets Shocking Impact fire.
sigReg('dual', null, 'Rubbed the Wrong Way', 'Every other shot is a knock, then a shock. A shock straight after a knock sets off Shocking Impact. Friction is a relationship.', 'phys', 'proj', {
  base: { dmg: 14, cd: 0.5, mag: 8, reload: 1.2 },
  def: { dual: 1, sigFire(w, target, src) {
    w.dualN = (w.dualN || 0) + 1;
    const el = w.dualN % 2 ? 'phys' : 'shock';
    sigShot(w, target, src, { elem: el, dual: true }, { color: el === 'shock' ? V10_COL.shock : V10_COL.phys });
    return true;
  } } });

sigReg('hotb', null, 'Hot and Bothered', 'Subject\'s surface temperature rises sharply under stress. The surrounding area is affected. The subject denies this.', 'flame', 'burst', {
  base: { dmg: 22, cd: 4, mag: 999, reload: 0, area: 110, range: 170 },
  def: { sigFire(w, target, src) {
    const p = G.player, s = w.s, f = clamp(p.hp / G.P.maxHp, 0, 1), k = clamp((1 - f) / 0.75, 0, 1) * 0.6; // up to +60% at 25% health
    const R = s.area * (1 + k), dmg = s.dmg * (1 + k), c = V10_COL.flame;
    G.fx.push({ type: 'warn', x: p.x, y: p.y, r: R, color: c, life: 0.3, max: 0.3 });
    after(0.3, () => { if (!G) return; const q = me(); aoe(q.x, q.y, R, dmg, src, c); ring(q.x, q.y, R, c, 0.4, 5); fxParts('ember', q.x, q.y, c, 14, R * 2, 0.6, 3); });
    return true;
  } } });

sigReg('carpet', null, 'Carpet Burn', 'Friction burns. Mostly theirs.', 'flame', 'contact', {
  base: { dmg: 10, cd: 0.5, mag: 999, reload: 0, range: 60 },
  def: { noTarget: 1, sigFire() { return true; } } }); // (the work is in sigwTick: it needs no aiming)

sigReg('warmer', null, 'Getting Warmer', 'Warmer. Warmer. Considerably warmer than recommended.', 'flame', 'beam', {
  base: { dmg: 4, cd: 0.1, mag: 9999, reload: 0, range: 260, width: 10 },
  def: { sigFire(w, target, src) {
    const s = w.s, p = G.player, now = G.t;
    if (w.gwCool > now) return true;
    if (now - (w.gwLast || -9) > 1) w.gwHeat = 0; // a gap with nothing in the lane cools it
    w.gwLast = now; w.gwHeat = (w.gwHeat || 0) + s.cd;
    const a = Math.atan2(target.y - p.y, target.x - p.x), L = s.range, ca = Math.cos(a), sa = Math.sin(a), wd = s.width;
    const lane = G.enemies.filter(e => {
      if (e.dead) return false;
      const t = clamp((e.x - p.x) * ca + (e.y - p.y) * sa, 0, L);
      return Math.hypot(e.x - (p.x + ca * t), e.y - (p.y + sa * t)) <= e.r + wd;
    });
    const boil = w.gwHeat >= 8, mult = 1 + Math.min(0.8, 0.1 * w.gwHeat);
    for (const e of lane) {
      if (boil) fightCd(e).bars.fire = 0.999; // the next Fire hit tips it into Ignition
      damageEnemy(e, s.dmg * mult, Object.assign({}, src, { atk: 'beam' }));
    }
    if (boil) { w.gwCool = now + 1.5; w.gwHeat = 0; ring(p.x, p.y, 40, V10_COL.flame, 0.4, 5); floatText(p.x, p.y - 30, 'BOILED OVER', V10_COL.flame, 13, 0.8); }
    (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: p.x, y: p.y, x2: p.x + ca * L, y2: p.y + sa * L, w: wd * (1 + mult - 1), c: V10_COL.flame, t: 'flame', life: 0.12, max: 0.12 });
    return true;
  } } });

sigReg('bsens', null, 'Burning Sensation', 'A persistent burning sensation. It should clear up on its own. It will not.', 'flame', 'proj', {
  base: { dmg: 14, cd: 0.6, mag: 6, reload: 1.2 },
  def: { sigFire(w, target, src) { sigShot(w, target, src, { bsens: true }); return true; } } });

// ---------------------------------------------------------------- Shocking Impact and Burning Sensation (fight.js fightReact)
function sigReact(e, t, raw, src, res) {
  // Force + Static, dual-type weapon only: a Static shot of the dual weapon (it follows a Force shot) bursts, 60%, small, no chain.
  if (src.dual && t === 'static' && !rxLocked(e, 'shock')) {
    rxFired('shock', e); ring(e.x, e.y, 56, FIGHT_RX.shock.color, 0.3, 4); fxParts('spark', e.x, e.y, FIGHT_RX.shock.color, 8, 120, 0.3, 2);
    forNear(e.x, e.y, 56, o => { if (!o.dead) damageEnemy(o, raw * 0.6, rxSrc('shock', 'shock', { arc: true })); }); // (arc: Charges, but starts no chain)
  }
  // Burning Sensation: the part of the Burn bar this weapon filled never drains.
  if (src.bsens && t === 'fire' && e.cd) {
    if (res && res.payoffs.indexOf('ignite') >= 0) e.bsHold = 0;
    else e.bsHold = Math.min(0.99, (e.bsHold || 0) + raw / (COMBAT.barSize.fire * COMBAT.rankBarK[e.cd.rank || 'normal'] * e.cd.maxHp));
  }
}

// ---------------------------------------------------------------- Nappy Mines (sigs.js afterMine)
function sigMine(pr) {
  const s = pr.w.s;
  if (G.zones.length < 150) G.zones.push({ x: pr.x, y: pr.y, r: 58, life: 3.5, max: 3.5, dps: Math.max(4, s.dmg * 0.25), elem: 'fire', pull: 0, color: ELEMENTS.fire.color, tick: 0,
    src: Object.assign({}, pr.src, { zoneHit: true, wname: 'Nappy Mines (pool)' }) });
  const ch = pr.domChain || (pr.domChain = { n: 1 }); // domino: three mines in a chain, at most
  for (const o of G.proj) {
    if (ch.n >= 3) break;
    if (!o.mine || o.dead || o === pr || Math.hypot(o.x - pr.x, o.y - pr.y) > 170) continue;
    o.dead = true; o.domChain = ch; ch.n++; sigChainStat(ch);
    after(0.09, () => detonateMine(o));
  }
}
const sigChainStat = ch => { if (G.sigS) G.sigS.domino = Math.max(G.sigS.domino || 0, ch.n); };

// ---------------------------------------------------------------- Extraction (shares the 6 health per second cap, fight.js)
function sigExtract(h) {
  const S = fst(), sec = Math.floor(G.t);
  if (S.exSec !== sec) { S.exSec = sec; S.exUsed = 0; }
  const x = Math.max(0, Math.min(h, 6 - (S.exUsed || 0)));
  S.exUsed = (S.exUsed || 0) + x; S.heal = (S.heal || 0) + x;
  return x;
}

// ---------------------------------------------------------------- each frame (v10.js v10Tick)
function sigPetCount() {
  let n = 0;
  for (const w of G.weapons) if (w && w.def.sig && w.pets) n += w.pets.length;
  for (const t of G.turrets) if (t.sigPet && t.life > 0) n++;
  return n;
}
function sigwTick(dt) {
  if (!G || !G.weapons) return;
  const p = G.player;
  for (const w of G.weapons) {
    if (!w || !w.def.sig || !w.s) continue;
    const sid = w.sid;
    if (w.pets && w.pets.length > 4) w.pets.length = 4; // pets: 4 per weapon
    if (sid === 's_carpet') { // Carpet Burn: friction, scaled by speed; sprinting doubles it; nothing when still
      const v = Math.hypot(p.vx || 0, p.vy || 0);
      if (v > 30) {
        const dmg = w.s.dmg * Math.min(1, v / 165) * (G.sprintT > G.t ? 2 : 1), src = Object.assign(weaponSrc(w), { atk: 'contact', kx: p.vx, ky: p.vy });
        forNear(p.x, p.y, p.r + 60, e => {
          if (e.dead || e.charmed || e.cbT > G.t || Math.hypot(e.x - p.x, e.y - p.y) > p.r + e.r + 8) return;
          e.cbT = G.t + 0.5; damageEnemy(e, dmg, src);
          fxParts('ember', e.x, e.y, V10_COL.flame, 2, 60, 0.3, 2);
        });
      }
    }
    if (sid === 's_onesie') { // scales with max health (x maxHp/120, at most x2); owning it gives Thorns
      if (w.s !== w.sigRef) { w.sigRef = w.s; w.sigD0 = w.s.dmg; }
      w.s.dmg = w.sigD0 * clamp(G.P.maxHp / 120, 0.5, 2);
      if (G.pd && G.pd.n && G.pd.n.thorns < 1) G.pd.n.thorns = 1;
    }
  }
  // Undead (Tapeworm Seeder): retype, 6 s, newest 4 per weapon, 8 pets in all.
  const und = [];
  for (const t of G.turrets) {
    if (!t.w || !t.w.def.sig || t.w.def.sigOf !== 'parasite' || t.life <= 0) continue;
    if (!t.sigPet) { t.sigPet = true; t.src = Object.assign({}, t.src, { elem: t.w.def.elem }); t.life = Math.min(t.life, 6); t.max = t.life; t.born = G.t; }
    und.push(t);
  }
  und.sort((a, b) => b.born - a.born);
  und.slice(4).forEach(t => { t.life = 0; });
  let extra = sigPetCount() - 8;
  for (let i = und.length - 1; i >= 0 && extra > 0; i--) if (und[i].life > 0) { und[i].life = 0; extra--; }
  for (const w of G.weapons) if (extra > 0 && w && w.pets) while (extra > 0 && w.pets.length) { w.pets.pop(); extra--; }
  // Black Hole: one well, up to radius 140.
  for (const pr of G.proj) if (pr.style === 'void' && pr.w && pr.w.def.sig && pr.aura > 140) pr.aura = 140;
  // Burning Sensation: the Burn it filled does not drain; Snared (Mucus) still clears it.
  for (const e of G.enemies) {
    if (!(e.bsHold > 0) || e.dead || !e.cd) continue;
    if (snared(e)) { e.bsHold = 0; continue; }
    if (e.cd.bars.fire < e.bsHold) e.cd.bars.fire = e.bsHold;
  }
}

// ---------------------------------------------------------------- drawing (v10.js v10Draw, world space)
function sigDraw() {
  if (!G || !G.weapons) return;
  const p = G.player;
  for (const w of G.weapons) {
    if (!w || w.sid !== 's_warmer' || !(w.gwHeat > 0) || !(G.t - (w.gwLast || -9) < 1)) continue;
    ctx.save(); ctx.strokeStyle = col(V10_COL.flame); ctx.globalAlpha = 0.8; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 7) * S, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, w.gwHeat / 8)); ctx.stroke(); ctx.restore();
  }
}
