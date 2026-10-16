'use strict';
// Spawn Prawn - branches. A second choice tree that sits on top of the old forks (Lv 3, 5, 8 and 10 stay as they
// are). A weapon listed in BRANCHES gets two extra choices: at Lv 4 a first branch (two to pick from), and at
// Lv 7 two sub-branches that belong to the first branch you took. Weapons not listed here are unaffected.
// This is the Force slice (v9.28): Spitball, Placenta Paddle and Little Swimmers. The design for the other
// damage types and weapons is in STARTERS.md.
// Perks are stored in w.perks[4] and w.perks[7] like the other forks, so they ride along with saves, fusing and
// recycling for free. Branch cards say BRANCH (the old forks say SIGNATURE and MASTERY).
// Hooks: brQueue (setWeaponLevel), brIds (genLoot 'branch'), brStats (applyPerks), brProc (perkProcs),
// brVolley (sigVolley), brSwing (meleeSweep), brPet (petsTick), brTick (update), brSpeed (player speed).

const BRANCH_LEVELS = [4, 7];
const BRANCHES = {
  blaster: [
    { id: 'brTapWater', name: 'Tap Water', desc: 'A steady stream: +60% magazine, and it reloads 25% faster.', kids: [
      { id: 'brFireHose', name: 'Fire Hose', desc: 'Fires twice as fast. Each spitball hits 40% softer and the stream spreads out.' },
      { id: 'brSplosh', name: 'Big Splosh', desc: 'Every 10th spitball is a heavy splosh: 4x damage, 3x the size, and it pierces three.' }] },
    { id: 'brSpitTake', name: 'Spit Take', desc: 'Hits mark the target for 2.5 seconds. When the mark runs out, it takes 35% of what your Spitball did to it meanwhile.', kids: [
      { id: 'brSubpoena', name: 'Subpoena', desc: 'If a marked enemy dies, its mark jumps to the nearest unmarked enemy, damage and all.' },
      { id: 'brSpitRoast', name: 'Spit Roast', desc: 'A mark paying out also hits everything close to it for half.' }] },
  ],
  paddle: [
    { id: 'brSpanking', name: 'Spanking Machine', desc: 'A wider, longer swing: +25% arc and +10% reach.', kids: [
      { id: 'brBounce', name: 'Bounce House', desc: 'Knockback hits 80% harder, and swatted enemies bowl into their neighbours for 40% damage.' },
      { id: 'brTimeOut', name: 'Time Out', desc: 'Swatted enemies are stunned for 0.8 seconds. Think about what you did.' }] },
    { id: 'brAfterbirth', name: 'Afterbirth', desc: 'Every swing leaves a puddle that hurts whatever stands in it.', kids: [
      { id: 'brWarm', name: 'Warm Bath', desc: 'Standing in your own puddle heals you.' },
      { id: 'brSlip', name: 'Slip and Slide', desc: 'Enemies standing in your puddles are shoved outwards.' }] },
  ],
  swimmers: [
    { id: 'brRace', name: 'Race to the Egg', desc: 'Swimmers are 40% faster and headbutt 30% harder.', kids: [
      { id: 'brPhoto', name: 'Photo Finish', desc: 'Every headbutt bursts into the crowd round the target for half damage.' },
      { id: 'brSlipstream', name: 'Slipstream', desc: 'While your swimmers are out, you swim 8% faster.' }] },
    { id: 'brPeer', name: 'Peer Pressure', desc: 'Swimmers bite 20% faster, and each bite heals you a little.', kids: [
      { id: 'brHug', name: 'Group Hug', desc: 'Headbutts drag nearby enemies in towards the target.' },
      { id: 'brBlood', name: 'Blood Brothers', desc: 'Bites heal twice as much, and every swimmer adds a little regeneration.' }] },
  ],
};

// Register every node as a branch card (an upgrade-path option with an icon, but not a signature fork).
for (const wid in BRANCHES) for (const n of BRANCHES[wid]) for (const k of [n].concat(n.kids)) {
  SIGS[k.id] = { name: k.name, desc: k.desc, icon: k.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase(), color: (WEAPONS[wid] && WEAPONS[wid].color) || '#e8f0ff', sig: false };
}

const hasBr = (w, id) => !!(w && w.perks && (w.perks[4] === id || w.perks[7] === id));

// Lv 4 and Lv 7 each queue one branch choice (only for weapons that have a tree here).
function brQueue(w, from, to) {
  if (!BRANCHES[w.id] || w.isSpell) return;
  for (const m of BRANCH_LEVELS) if (from < m && to >= m && !w.perks[m]) G.lootQueue.push({ kind: 'branch', uid: w.uid, lvl: m });
}

// The ids offered at a branch level, or null when this level is one of the old forks.
function brIds(w, lvl) {
  const tree = BRANCHES[w.id];
  if (!tree || !BRANCH_LEVELS.includes(lvl)) return null;
  if (lvl === 4) return tree.map(n => n.id);
  const first = tree.find(n => n.id === w.perks[4]) || tree[0]; // (no first branch picked: the weapon was fused or recycled)
  return first.kids.map(k => k.id);
}

// Stat side.
function brStats(w, s) {
  if (!BRANCHES[w.id]) return;
  const has = id => hasBr(w, id);
  if (has('brTapWater')) { s.mag = Math.round(s.mag * 1.6); s.reload *= 0.75; }
  if (has('brFireHose')) { s.cd *= 0.5; s.dmg *= 0.6; s.spread = (s.spread || 0.04) + 0.1; }
  if (has('brSpanking')) { s.arc *= 1.25; for (const f of ['range', 'reach']) if (s[f]) s[f] *= 1.1; }
  if (has('brBounce')) s.knock = (s.knock || 0) * 1.8;
  if (has('brRace')) { s.speed *= 1.4; s.dmg *= 1.3; }
  if (has('brPeer')) s.cd *= 0.8;
}

// Every 10th spitball is a Big Splosh (the same slot the Loogie fork uses in fireWeapon).
function brVolley(w, out) {
  if (!hasBr(w, 'brSplosh')) return;
  w.brN = (w.brN || 0) + 1;
  if (w.brN % 10 === 0) { out.big = true; floatText(me().x, me().y - 30, 'SPLOSH', w.def.color, 12, 0.5); }
}

// ---------------------------------------------------------------- Spitball: Spit Take marks
// e.spit = { t: pays out at, dmg: what it took from the Spitball while marked, w, roast }.
const brMarks = () => G.brMarks || (G.brMarks = []);
function brProc(e, dmg, src) {
  const w = src && src.w;
  if (!w || !w.perks || src.noProc || src.dot || !hasBr(w, 'brSpitTake')) return;
  if (!e.spit) { e.spit = { t: G.t + 2.5, dmg: 0, w }; brMarks().push(e); ring(e.x, e.y, e.r + 6, w.def.color, 0.3, 2); }
  e.spit.dmg += dmg;
}
function brPayout(e) {
  const m = e.spit, w = m.w, payout = m.dmg * 0.35;
  e.spit = null;
  if (payout <= 0) return;
  const src = Object.assign({}, weaponSrc(w), { noProc: true, noCrit: true, noArc: true, knock: 0, mult: 1, wname: 'Spit Take' });
  damageEnemy(e, payout, src);
  floatText(e.x, e.y - e.r - 8, 'SPIT TAKE', w.def.color, 12, 0.6);
  ring(e.x, e.y, e.r + 14, w.def.color, 0.3, 3);
  if (hasBr(w, 'brSpitRoast')) {
    forNear(e.x, e.y, 90, o => { if (o !== e && !o.dead && !o.charmed && !o.egg) damageEnemy(o, payout * 0.5, src); });
    ring(e.x, e.y, 90, w.def.color, 0.35, 2);
  }
}

// ---------------------------------------------------------------- Paddle: after every swing
function brSwing(w, x, y, a, src) {
  if (w.id !== 'paddle') return;
  const s = w.s, R = s.reach || s.range;
  if (hasBr(w, 'brBounce') || hasBr(w, 'brTimeOut')) {
    const hit = [];
    forNear(x, y, R, e => { if (!e.charmed && !e.egg && inArc(e, x, y, a, s.arc)) hit.push(e); });
    if (hasBr(w, 'brTimeOut')) for (const e of hit) if (!e.boss) stun(e, 0.8);
    if (hasBr(w, 'brBounce')) {
      const bsrc = Object.assign({}, src, { noProc: true, noCrit: true, knock: 60, wname: 'Bounce House' }), done = new Set(hit);
      for (const e of hit) forNear(e.x, e.y, 70, o => {
        if (done.has(o) || o.dead || o.charmed || o.egg) return;
        done.add(o);
        damageEnemy(o, s.dmg * 0.4, Object.assign({}, bsrc, { kx: o.x - e.x, ky: o.y - e.y }));
      });
    }
  }
  if (hasBr(w, 'brAfterbirth') && G.zones.length < 220) {
    G.zones.push({ x: x + Math.cos(a) * R * 0.6, y: y + Math.sin(a) * R * 0.6, r: 42, life: 2.5, max: 2.5, dps: s.dmg * 0.35, elem: 'phys', pull: 0,
      color: w.def.color, tick: 0, src: Object.assign({}, src, { wname: 'Afterbirth' }), br: w.uid, warm: hasBr(w, 'brWarm'), slip: hasBr(w, 'brSlip') });
  }
}

// ---------------------------------------------------------------- Swimmers: after every headbutt
function brPet(w, q, t, s, src) {
  if (w.id !== 'swimmers') return;
  if (hasBr(w, 'brPhoto')) {
    forNear(t.x, t.y, 60, e => { if (e !== t && !e.dead && !e.charmed && !e.egg) damageEnemy(e, s.dmg * 0.5, src); });
    ring(t.x, t.y, 60, w.def.color, 0.25, 2);
  }
  if (hasBr(w, 'brHug')) {
    forNear(t.x, t.y, 90, e => {
      if (e === t || e.dead || e.boss || e.egg || e.charmed) return;
      const dx = t.x - e.x, dy = t.y - e.y, d = Math.hypot(dx, dy) || 1, step = Math.min(24, d - t.r);
      if (step > 0) { e.x += dx / d * step; e.y += dy / d * step; }
    });
  }
  if (hasBr(w, 'brPeer') && !w.echo) {
    const k = hasBr(w, 'brBlood') ? 2 : 1;
    healPlayer(Math.min(G.P.maxHp * 0.01 * s.cd * k, s.dmg * 0.05 * k), true);
  }
}
// You swim a little faster while Slipstream swimmers are out.
function brSpeed() {
  if (!G || !G.weapons) return 1;
  let k = 1;
  for (const w of G.weapons) if (w && w.id === 'swimmers' && hasBr(w, 'brSlipstream')) k *= 1.08;
  return k;
}

// ---------------------------------------------------------------- per frame
function brTick(dt) {
  if (!G || G.state === 'dead') return;
  // Spit Take: pay out, or hand a dying mark on.
  const M = G.brMarks;
  if (M && M.length) for (let i = M.length - 1; i >= 0; i--) {
    const e = M[i], m = e.spit;
    if (!m) { M.splice(i, 1); continue; }
    if (e.dead) {
      M.splice(i, 1); e.spit = null;
      if (hasBr(m.w, 'brSubpoena')) {
        const n = acquire('nearest', 220, e.x, e.y, e);
        if (n && !n.dead && !n.spit) { n.spit = { t: G.t + 2.5, dmg: m.dmg, w: m.w }; M.push(n); ring(n.x, n.y, n.r + 6, m.w.def.color, 0.3, 2); }
      }
    } else if (G.t >= m.t) { M.splice(i, 1); brPayout(e); }
  }
  // Paddle puddles: Warm Bath heals you, Slip and Slide shoves enemies outwards.
  const p = me();
  for (const z of G.zones) {
    if (!z.br) continue;
    if (z.warm && Math.hypot(p.x - z.x, p.y - z.y) < z.r) healPlayer(1.2 * dt, true);
    if (z.slip) forNear(z.x, z.y, z.r, e => {
      if (e.boss || e.egg || e.dead) return;
      const dx = e.x - z.x, dy = e.y - z.y, d = Math.hypot(dx, dy) || 1;
      e.x += dx / d * 70 * dt; e.y += dy / d * 70 * dt;
    });
  }
  // Blood Brothers: every swimmer adds a trickle of regeneration.
  for (const w of G.weapons) if (w && w.id === 'swimmers' && w.pets && hasBr(w, 'brBlood')) healPlayer(0.4 * w.pets.length * dt, true);
}
