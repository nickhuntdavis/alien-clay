'use strict';
// Spawn Prawn - the rest of the weapon modifier matrix (redesign docs/MODIFIER_MATRIX.md 3 and 4; IMPLEMENTATION_PLAN.md
// Phase 7): Range, Up Close, Charged, Kinship, Knockback, Pulling, Turncoat, Melee, Ranged, Mines, Death from Above, Primer.
// Each has its Lv 1, both branches (fork at Rank 2) and four masteries, on modslice.js's fork engine (MSB, msBr, msMa).
// One shared version per modifier: the per-weapon table cells (laser sword, orbital laser, reprogrammed allies...) are
// not built; every weapon gets the generic form below.
//  - Range / Up Close (Tempo; Projectile and Spread): replace power11.js's falloff for this weapon (p11Range).
//  - Charged (Tempo): a wind-up added to each attack (0.5 / 0.4 / 0.3 s), then +60 / 90 / 120% damage.
//  - Kinship (Chemistry): +8 / 16 / 24% damage and status fill per other weapon of the same damage type.
//  - Knockback / Pulling / Turncoat (Crowd): shoves (with collisions), pulls under the Pull rule, kills rising as allies.
//  - Melee / Ranged / Mines / Death from Above (Delivery): replace how the weapon fires. Melee: a 150-degree strike in
//    front (reach 90; a Contact attack for defences). Ranged (Nervous Wreck, Enzyme Headbutt, Peekaboo, Panic Button
//    only): the attack lands on the target up to 220 away. Mines: lays mines (3 on the floor, trigger 60, life 14 s) that
//    go off as a blast of the weapon's hit. Death from Above: a marked strike lands on the target after 0.4 s.
//  - Primer (Chemistry): hits mark (4 s); another weapon's hit on the mark sets off a burst (radius 40, 50%).
// Simplified for now: Range's camera zoom; Boomerang, Artillery and Tripline (Range masteries) become a +40% hit beyond
// 400 / a 50-radius blast on the target / free hits on enemies that come within 400; Cornered checks enemies behind only;
// Trampoline and Funnel are not built (Keep Away and Pied Piper's other parts are); Slow Burn holds up to 3 s only
// between targets; Grappling Hook pulls the target to you; Decoy Army is not built (its allies only explode); Leech and
// Hunter-Killer mines are thrown 120 towards an enemy. Burst Fire-style per-weapon cells come later.
// Hooks: none in shared files. Wraps weapons24.js wupStats/wupFire/wupDmgMul/wupHit/wupKill/wupTick, power11.js
// p11Range, mutations.js mutBarK, game.js hurtPlayer, modifiers.js modDraw. Loads after power11.js (it wraps p11Range).

const MW_NEW = {
  range:   { name: 'Range', atk: ['proj', 'spread', 'beam'], g: 'tempo', b: ['Long Shot', 'Overwatch', 'Sniper', 'Boomerang', 'Artillery', 'Tripline'] },
  upclose: { name: 'Up Close', atk: ['proj', 'spread'], g: 'tempo', b: ['Point Blank', 'Packed Room', 'Execution', 'Zero Distance', 'Mosh Pit', 'Cornered'] },
  charged: { name: 'Charged', atk: ['proj', 'beam', 'burst', 'spread'], g: 'tempo', b: ['Full Charge', 'Quick Release', 'Overcharge', 'Slow Burn', 'Hair Trigger', 'Capacitor'] },
  kinship: { name: 'Kinship', atk: MOD_ALL, g: 'chemistry', b: ['Purist', 'Mixed Marriage', 'Full Family', 'Chorus', 'Melting Pot', 'Referee'] },
  knock:   { name: 'Knockback', atk: ['proj', 'burst', 'contact', 'beam', 'spread'], g: 'crowd', b: ['Wall Slam', 'Keep Away', 'Bowling Ball', 'Launch', 'Repulsor', 'Trampoline'] },
  pull:    { name: 'Pulling', atk: ['beam', 'burst', 'pool', 'proj', 'spread'], g: 'crowd', b: ['Gravity', 'Pied Piper', 'Singularity', 'Tractor', 'Dinner Bell', 'Funnel'] },
  turncoat:{ name: 'Turncoat', atk: MOD_ALL, g: 'crowd', b: ['Veteran Corps', 'Walking Bombs', 'Sergeant', 'Old Soldier', 'Chain Gang', 'Decoy Army'] },
  melee:   { name: 'Melee', atk: ['proj', 'beam', 'spread', 'burst', 'pool'], g: 'delivery', b: ['Brawler', 'Hit and Run', 'Berserker', 'Slam', 'Slipstream', 'Counter'] },
  ranged:  { name: 'Ranged', atk: ['contact', 'burst'], g: 'delivery', b: ['Long Arm', 'Proxy', 'Grappling Hook', 'Artillery', 'Puppet', 'Ventriloquist'] },
  mines:   { name: 'Mines', atk: ['burst', 'proj', 'beam', 'spread'], g: 'delivery', b: ['Minefield', 'Smart Mines', 'Carpet', 'Mega Mine', 'Leech', 'Hunter-Killer'] },
  dfa:     { name: 'Death from Above', atk: ['burst', 'proj', 'beam', 'spread', 'pool'], g: 'delivery', b: ['Orbital Strike', 'Precision Strike', 'Carpet Bombing', 'Siege', 'Volley', 'Guardian Angel'] },
  explode: { name: 'Exploding Rounds', atk: ['proj', 'spread', 'beam', 'contact'], g: 'flight', b: ['Pop Pop', 'A Bit Extra', 'Cluster Round', 'Fragmentation', 'Chain Blast', 'Overkill'] },
  primer:  { name: 'Primer', atk: ['proj', 'beam', 'spread', 'contact', 'burst'], g: 'chemistry', b: ['Bomb Squad', 'Tag Team', 'Chain Primer', 'Time Bomb', 'Full Roster', 'Handoff'] },
};
const MW_RANGED = ['v_phys_contact', 'v_phys_burst', 's_peekaboo', 'acro_cap']; // (Nervous Wreck, Panic Button, Peekaboo, Enzyme Headbutt)
for (const id in MW_NEW) {
  const m = MW_NEW[id];
  MODS10[id] = { name: m.name, desc: 'TODO_COPY:mod_' + id + '_desc', atk: m.atk, max: 3, cap: {} };
  MM_GROUP[id] = m.g; MSB[id] = m.b;
  MODUP[id] = ['TODO_COPY:mod_' + id + '_up2', 'TODO_COPY:mod_' + id + '_up3'];
}
if (typeof SLICE !== 'undefined') SLICE.mods.push(...Object.keys(MW_NEW)); // (slice-only testing deals these too)
modOk = (orig => function (w, id) { // Ranged fits four close-range weapons only; Anchored Beam is retired (user, 23 Oct: the aim menu's FURTHEST does its job)
  if (id === 'anchored') return false;
  if (id === 'ranged' && !MW_RANGED.includes(w24Key(w))) return false;
  return orig(w, id);
})(modOk);

const mwR = (w, id) => (w && w.m10 ? Math.min(3, modCount(w, id)) : 0);
const mwS = () => G.mwS || (G.mwS = { mines: [], allies: [], marks: [] });
const mwType = w => (w.def && (w.def.v10type || w.def.elem)) || 'phys';
const mwK = w => w.uid || w24Key(w);
const mwWs = () => G.weapons.filter(x => x && !x.isSpell && x.def);
const mwSrc = (w, extra) => Object.assign(weaponSrc(w), extra || {});
const mwPull = (e, x, y, f) => { // the Pull rule (COMBAT_MATRIX 12.2): Squishy half, elites 50%, bosses 25%, never into walls
  if (e.egg || e.dead) return;
  if (e.boss) f *= 0.25; else if (e.elite) f *= 0.5; if (fightCd(e).def === 'squishy') f *= 0.5;
  const dx = x - e.x, dy = y - e.y, d = Math.hypot(dx, dy) || 1, m = Math.min(Math.max(0, d - (e.r || 10)), f), nx = e.x + dx / d * m, ny = e.y + dy / d * m;
  if (G.lvl && lvSolidAt(nx, ny)) return;
  e.x = nx; e.y = ny;
};

// ---------------------------------------------------------------- stats
function mwStats(w, s) {
  if (!w.m10 || w.isSpell) return;
  let any = false;
  const rr = mwR(w, 'range'); if (rr) { any = true; s.speed *= 1 + 0.2 * rr; if (w.def.v10atk === 'beam') s.range *= 1 + 0.2 * rr; // (beams: +20% reach a rank)
    if (msB(w, 'range', 2)) s.range += 100; } // (Overwatch: picks targets 100 further out)
  const cr = (typeof lzIs === 'function' && lzIs(w)) ? 0 : mwR(w, 'charged'); // (the Laser's Charge-Up is a blast: laserbeam.js)
  if (mwR(w, 'charged')) any = true;
  if (cr) {
    any = true; const m = msMa(w, 'charged');
    const wind = [0.5, 0.4, 0.3][cr - 1], bonus = [0.6, 0.9, 1.2][cr - 1] + (modCount(w, 'charged') >= 4 ? 0.3 : 0);
    if (m === 'B1') { s.cd = (s.cd + wind) / 2; s.dmg *= 1 + bonus * 0.7; } else { s.cd += wind; s.dmg *= 1 + bonus; }
  }
  if (mwR(w, 'melee')) { any = true; s.range = Math.min(s.range || 120, 110); }
  if (mwR(w, 'ranged')) { any = true; s.range = Math.max(s.range || 0, 220 * (msA(w, 'ranged', 2) ? (mwR(w, 'ranged') >= 3 ? 1.6 : 1.3) : 1)); }
  for (const id of ['upclose', 'kinship', 'knock', 'pull', 'turncoat', 'mines', 'dfa', 'primer', 'explode']) if (mwR(w, id)) any = true;
  if (any) { w.uh = w.uh || {}; G.mwAny = true; G.msAny = true; }
}
wupStats = (orig => function (w, s) { orig(w, s); mwStats(w, s); })(wupStats);

// ---------------------------------------------------------------- falloff: Range and Up Close (power11.js p11Range)
p11Range = (orig => function (e, src) {
  const w = src && src.w, base = orig(e, src);
  if (!w || !G.mwAny || src.zoneHit || src.dot || src.rx || src.echo) return base;
  const d = Math.hypot(e.x - G.player.x, e.y - G.player.y);
  const rr = mwR(w, 'range');
  if (rr) {
    if (modCount(w, 'range') >= 4 && msMa(w, 'range') === 'A1') return d > 600 ? 1.5 : d > 400 ? 1.3 : 1; // Sniper: no falloff
    const near = [300, 400, 520][rr - 1], floor = [0.65, 0.75, 0.85][rr - 1];
    let k = d <= near ? 1 : 1 - (1 - floor) * Math.min(1, (d - near) / Math.max(1, 600 - near + 200));
    if (msA(w, 'range', 2) && d > 400) k *= rr >= 3 ? 1.2 : 1.1; // Long Shot
    if (msB(w, 'range', 3) && d > 400 && !(e.mwFar && e.mwFar[mwK(w)])) { (e.mwFar || (e.mwFar = {}))[mwK(w)] = 1; k *= 1.25; } // Overwatch: first far hit
    if (msMa(w, 'range') === 'A2' && d > 400) k *= 1.4; // Boomerang (simplified)
    return k;
  }
  const ur = mwR(w, 'upclose');
  if (ur) {
    const bonus = [0.4, 0.8, 1.2][ur - 1], end = [180, 160, 140][ur - 1], floor = [0.4, 0.35, 0.3][ur - 1];
    let k = d <= 120 ? 1 + bonus : d <= end ? 1 : 1 - (1 - floor) * Math.min(1, (d - end) / (450 - end));
    if (msA(w, 'upclose', 2) && d < 60) k *= ur >= 3 ? 1.5 : 1.25; // Point Blank
    return k;
  }
  return base;
})(p11Range);

// ---------------------------------------------------------------- firing
function mwStrike(w, x, y, r, k, src) { aoe(x, y, r, w.s.dmg * k, src, w.def.color); ring(x, y, r, w.def.color, 0.3, 4); }
function mwDfa(w, t, src, k, delay) { // one strike from above: a 0.4 s mark, then a blast on the spot
  const r = (w.s.area || 40) * (msA(w, 'dfa', 2) ? 1.3 : 1), x = t.x, y = t.y, dl = delay != null ? delay : msB(w, 'dfa', 2) ? 0.2 : 0.4;
  G.fx.push({ type: 'warn', x, y, r, color: w.def.color, life: dl, max: dl });
  after(dl, () => { if (G) mwStrike(w, x, y, r, 1.4 * k * (msA(w, 'dfa', 2) ? 1.3 : 1), src); });
}
function mwFire(w, target, src) {
  if (!w.m10 || !G.mwAny) return false;
  const p = G.player, s = w.s;
  // Charged
  if (mwR(w, 'charged') && !(typeof lzIs === 'function' && lzIs(w))) {
    const m = msMa(w, 'charged'), idle = G.t - (w.mwLastF || G.t);
    if (msA(w, 'charged', 2) && idle > 1) src.mult = (src.mult || 1) * (1 + Math.min(0.5, (idle - 1) * 0.25)); // Full Charge: keeps building
    if (m === 'A2' && idle > 1) src.mult = (src.mult || 1) * (1 + Math.min(1.8, (idle - 1) * 0.6)); // Slow Burn
    if (w.mwCap) { src.mult = (src.mult || 1) * 1.5; w.mwCap = 0; } // Capacitor
    if (msB(w, 'charged', 2) && target && Math.hypot(target.x - p.x, target.y - p.y) < 100) src.mult = (src.mult || 1) * (mwR(w, 'charged') >= 3 ? 0.875 : 0.75); // Quick Release: a half charge
    src.mwFull = msA(w, 'charged', 3);
    if (m === 'A1' && !w._msFree) after(0.2, () => msRefire(w, 0.6, target)); // Overcharge
  }
  w.mwLastF = G.t;
  // Kinship, Chorus: the other weapons of this type echo the hit
  // Delivery replacements
  if (mwR(w, 'melee') && target) return mwMelee(w, target, src);
  if (mwR(w, 'ranged') && target) { const r = (w.s.area || 60) * (msMa(w, 'ranged') === 'A2' ? 2 : 1); mwStrike(w, target.x, target.y, r, 1, src); mwRangedExtra(w, target, src); return true; }
  if (mwR(w, 'mines')) { mwLay(w, target, src); return true; }
  if (mwR(w, 'dfa') && target) {
    const m = msMa(w, 'dfa');
    if (m === 'B1') { for (const e of acquireMany('strongest', s.range || 400, p.x, p.y, 6)) mwDfa(w, e, src, 0.6); return true; }
    mwDfa(w, target, src, 1);
    if (msA(w, 'dfa', 3)) after(0.5, () => G && mwStrike(w, target.x, target.y, w.s.area || 40, 1, src));
    if (msB(w, 'dfa', 3)) { const t2 = acquireMany('strongest', s.range || 400, p.x, p.y, 2)[1]; if (t2) mwDfa(w, t2, src, 1); }
    if (m === 'A1') { const a = Math.atan2(target.y - p.y, target.x - p.x); for (let i = 1; i <= 4; i++) after(i * 0.2, () => G && mwStrike(w, target.x + Math.cos(a) * 60 * i, target.y + Math.sin(a) * 60 * i, w.s.area || 40, 1, src)); }
    if (m === 'A2') for (let i = 1; i <= 3; i++) after(i * 0.5, () => G && mwStrike(w, target.x, target.y, w.s.area || 40, 1, src));
    return true;
  }
  return false;
}
wupFire = (orig => function (w, t, src) { const took = orig(w, t, src); return mwFire(w, t, src) || took; })(wupFire);

// Melee: a strike in a 150-degree arc in front, reach 90 (a Contact attack). Brawler combos; Hit and Run dashes.
function mwMelee(w, target, src) {
  const p = G.player, a = Math.atan2(target.y - p.y, target.x - p.x), reach = 90 * (typeof areaK === 'function' ? areaK(w) : 1), m = msMa(w, 'melee');
  const msrc = Object.assign({}, src, { atk: 'contact' });
  let k = 1.5;
  if (msA(w, 'melee', 2)) { w.mwCombo = ((w.mwCombo || 0) % (mwR(w, 'melee') >= 3 ? 4 : 3)) + 1; const last = w.mwCombo === (mwR(w, 'melee') >= 3 ? 4 : 3); if (last) { k *= mwR(w, 'melee') >= 3 ? 2 : 1.5; if (m === 'A2') mwStrike(w, p.x, p.y, 100, 2, msrc); } }
  if (msB(w, 'melee', 2)) { // Hit and Run: dart to the target (and through a line of them with Slipstream)
    const d = Math.min(120, Math.max(0, Math.hypot(target.x - p.x, target.y - p.y) - (target.r || 10) - 6));
    p.x += Math.cos(a) * d; p.y += Math.sin(a) * d;
    if (mwR(w, 'melee') >= 3) p.iframes = Math.max(p.iframes || 0, 0.25);
    if (m === 'B1') { let n = 0; for (const e of G.enemies) { if (e.dead || n >= 6) continue; const t = (e.x - p.x) * Math.cos(a) + (e.y - p.y) * Math.sin(a); if (t > 0 && t < 240 && Math.hypot(e.x - (p.x + Math.cos(a) * t), e.y - (p.y + Math.sin(a) * t)) < e.r + 14) { damageEnemy(e, w.s.dmg * k, msrc); n++; } } }
  }
  let hits = 0;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
    if (d > reach + e.r) continue;
    const da = Math.abs(((Math.atan2(dy, dx) - a + Math.PI * 3) % TAU) - Math.PI);
    if (da > Math.PI * 150 / 360) continue;
    damageEnemy(e, w.s.dmg * k, msrc); hits++;
    if (msA(w, 'melee', 2) && w.mwCombo === (mwR(w, 'melee') >= 3 ? 4 : 3)) shove(e, p.x, p.y, 200);
  }
  if (m === 'A1') { w.mwBers = hits ? Math.min(10, (w.mwBers || 0) + 1) : 0; w.mwBersT = G.t; } // Berserker
  (G.v10fx || (G.v10fx = [])).push({ k: 'arc', x: p.x, y: p.y, a, r: reach, c: w.def.color, life: 0.15, max: 0.15 });
  ring(p.x + Math.cos(a) * reach * 0.6, p.y + Math.sin(a) * reach * 0.6, reach * 0.5, w.def.color, 0.15, 3);
  return true;
}
// Ranged extras: Long Arm Lv 3 hits a second enemy in line; Grappling Hook pulls the target in; Proxy repeats the attack.
function mwRangedExtra(w, target, src) {
  const p = G.player, m = msMa(w, 'ranged');
  if (msA(w, 'ranged', 3)) { const o = msNear(target.x, target.y, 120, [target]); if (o) mwStrike(w, o.x, o.y, w.s.area || 60, 0.6, src); }
  if (m === 'A1') mwPull(target, p.x, p.y, 120);
  if (msB(w, 'ranged', 2)) {
    const S = mwS(), mine = S.marks.filter(q => q.w === w && q.k === 'proxy');
    if (mine.length < 2) S.marks.push({ k: 'proxy', w, x: target.x, y: target.y, t: G.t + (mwR(w, 'ranged') >= 3 ? 5 : 3), next: G.t + 1, walk: m === 'B1', copy: m === 'B2' });
  }
}
// Mines
function mwLay(w, target, src) {
  const S = mwS(), p = G.player, m = msMa(w, 'mines'), cap = msA(w, 'mines', 2) || msB(w, 'mines', 2) ? 5 : 3;
  const put = (x, y) => { S.mines.push({ w, x, y, t: G.t + 14, armed: G.t + 0.4, src, big: 1, rearm: msB(w, 'mines', 3) ? 1 : 0 }); };
  if (m === 'A1') { const a = target ? Math.atan2(target.y - p.y, target.x - p.x) : 0; for (let i = 0; i < 5; i++) put(p.x - Math.cos(a) * 30 * i, p.y - Math.sin(a) * 30 * i); }
  else if ((m === 'B1' || m === 'B2') && target) { const a = Math.atan2(target.y - p.y, target.x - p.x); put(p.x + Math.cos(a) * 120, p.y + Math.sin(a) * 120); } // (thrown towards an enemy: simplified)
  else put(p.x + rand(-20, 20), p.y + rand(-20, 20));
  const mine = S.mines.filter(q => q.w === w); while (mine.length > cap * (m === 'A1' ? 2 : 1)) { const o = mine.shift(); S.mines.splice(S.mines.indexOf(o), 1); }
  if (m === 'A2') { // Mega Mine: three close together merge
    const near = mine.filter(q => mine.filter(o => Math.hypot(o.x - q.x, o.y - q.y) < 100).length >= 3);
    if (near.length >= 3) { const keep = near[0]; keep.big = 3; for (const o of near.slice(1, 3)) S.mines.splice(S.mines.indexOf(o), 1); }
  }
}
function mwMineGo(q) {
  const w = q.w, r = 60 * (q.big > 1 ? 2 : 1);
  mwStrike(w, q.x, q.y, r, 1.2 * q.big, q.src);
  if (msA(w, 'mines', 3)) for (const o of mwS().mines) if (o !== q && !o.gone && o.w === w && Math.hypot(o.x - q.x, o.y - q.y) < 100) { o.gone = true; after(0.12, () => G && mwMineGo(o)); }
}

// ---------------------------------------------------------------- damage
function mwDmgMul(e, src) {
  if (!G.mwAny) return 1;
  let k = 1;
  const w = src && src.w;
  if (!w || src.dot || src.echo || src.rx) return k;
  // Kinship
  const kr = mwR(w, 'kinship');
  if (kr) {
    const ws = mwWs(), t = mwType(w), kin = ws.filter(x => x !== w && mwType(x) === t).length, types = new Set(ws.map(mwType)).size;
    k *= 1 + [0.08, 0.16, 0.24][kr - 1] * kin;
    if (msA(w, 'kinship', 2) && ws.every(x => mwType(x) === t)) k *= kr >= 3 ? 1.2 : 1.1; // Purist
    if (msB(w, 'kinship', 2)) k *= 1 + (kr >= 3 ? 0.16 : 0.08) * Math.min(3, types - 1); // Mixed Marriage
    if (msMa(w, 'kinship') === 'A1' && kin >= 2) k *= 1.3; // Full Family
    if (msMa(w, 'kinship') === 'B2' && w.mwRefT > G.t) k *= 1 + 0.2 * (w.mwRefN || 1); // Referee
  }
  // Pulling, Gravity: pulled enemies take more from this weapon
  if (msA(w, 'pull', 2) && e.mwPulledT > G.t) k *= mwR(w, 'pull') >= 3 ? 1.2 : 1.1;
  // Up Close masteries
  const d = Math.hypot(e.x - G.player.x, e.y - G.player.y);
  if (msB(w, 'upclose', 2) && d < 180) { let n = 0; forNear(e.x, e.y, 120, o => { if (o !== e && !o.dead) n++; }); k *= 1 + Math.min(mwR(w, 'upclose') >= 3 ? 0.5 : 0.25, 0.05 * n); } // Packed Room
  if (msMa(w, 'upclose') === 'B2' && d < 180) { const ux = (e.x - G.player.x) / (d || 1), uy = (e.y - G.player.y) / (d || 1); if (msNear(e.x + ux * (e.r + 14), e.y + uy * (e.r + 14), 16, [e])) k *= 2; } // Cornered
  // Melee, Berserker: (rate, in mwTick)
  return k;
}
wupDmgMul = (orig => function (e, src) { return orig(e, src) * mwDmgMul(e, src); })(wupDmgMul);
mutBarK = (orig => function (e) { // Kinship: status fill too (MSC.src is the hit being resolved: modslice.js)
  const src = MSC.src, w = src && src.w, k0 = orig(e); // (read the hit before modslice.js's wrapper clears it)
  if (!G || !G.mwAny || !w || !mwR(w, 'kinship')) return k0;
  const kin = mwWs().filter(x => x !== w && mwType(x) === mwType(w)).length; if (!kin) return k0;
  const k = 1 + [0.08, 0.16, 0.24][mwR(w, 'kinship') - 1] * kin, out = {};
  for (const t of ['acid', 'fire', 'force', 'soul']) out[t] = ((k0 && k0[t]) || 1) * k;
  return out;
})(mutBarK);

// ---------------------------------------------------------------- hits
function mwHit(e, res, src) {
  if (!G.mwAny || !src) return;
  const w = src.w, p = G.player;
  // Primer: another weapon's hit sets off a mark
  if (e.mwPr && e.mwPr.t > G.t && w && w !== e.mwPr.w && !src.mwDet && !src.echo && !src.dot) {
    const M = e.mwPr, pw = M.w, B = msB(pw, 'primer', 2);
    M.by.add(w);
    if (!B || M.by.size >= 2) { e.mwPr = null; mwDetonate(e, pw, M); }
  }
  if (!w || src.dot || src.echo || src.rx || src.wupEcho || src.mwDet) return;
  if (src.mwFull) res.heavy = true; // Full Charge Lv 3
  // Exploding Rounds, Pop Pop (and Lv 1 of either branch): hits explode round the target
  const er = mwR(w, 'explode');
  const lzBoom = (typeof lzIs === 'function' && lzIs(w)) ? (G.t >= (w.lzBoomT || 0) ? (w.lzBoomT = G.t + 0.5, 0.25 / Math.max(0.05, w.s.cd || 0.1)) : 0) : 1; // (the Laser's beam tip pops every 0.5 s, worth 0.5 s of hits)
  if (er && lzBoom && !src.mwBoom && res.toHp > 0 && (er < 2 || msBr(w, 'explode') === 'A')) {
    const R = [40, 60, 80][er - 1], k = [0.4, 0.6, 0.8][er - 1] * lzBoom, bsrc = Object.assign({}, src, { mwBoom: 1, noRx: true });
    aoe(e.x, e.y, R, res.toHp * k, bsrc, w.def.color); ring(e.x, e.y, R, w.def.color, 0.25, 3);
    const m = msMa(w, 'explode');
    if (m === 'A1') for (let i = 0; i < 3; i++) { const a = Math.random() * TAU, x = e.x + Math.cos(a) * R, y = e.y + Math.sin(a) * R; after(0.1, () => G && aoe(x, y, 30, res.toHp * 0.3, bsrc, w.def.color)); } // Cluster Round
    if (m === 'A2' && w.def.v10atk !== 'beam') for (let i = 0; i < 4; i++) spawnProj(w, e.x, e.y, i / 4 * TAU + Math.random(), Object.assign({}, bsrc, { mult: (src.mult || 1) * 0.25 })); // Fragmentation
  }
  // Kinship, Referee: two of your weapons of different types on one enemy within 1 s
  if (e.mwLastW && e.mwLastW !== w && G.t - e.mwLastT < 1 && mwType(e.mwLastW) !== mwType(w)) for (const x of mwWs()) if (msMa(x, 'kinship') === 'B2') { x.mwRefN = Math.min(3, (x.mwRefT > G.t ? x.mwRefN : 0) + 1); x.mwRefT = G.t + 2; }
  e.mwLastW = w; e.mwLastT = G.t;
  // Kinship, Chorus: the other weapons of this type echo the hit at 40%
  if (msMa(w, 'kinship') === 'A2' && res.toHp > 0) for (const x of mwWs().filter(x => x !== w && mwType(x) === mwType(w)).slice(0, 3)) damageEnemy(e, x.s.dmg * 0.4, msEcho(weaponSrc(x)));
  // Primer: mark
  const pr = mwR(w, 'primer');
  if (pr && (typeof lzIs === 'function' && lzIs(w))) { if (G.t - (e.lzPrL || -9) > 0.25) e.lzPrS = G.t; e.lzPrL = G.t; } // (the Laser marks an enemy held 0.5 s)
  if (pr && !e.dead && !(e.mwPr && e.mwPr.t > G.t) && !((typeof lzIs === 'function' && lzIs(w)) && G.t - e.lzPrS < 0.5)) e.mwPr = { w, t: G.t + (msA(w, 'primer', 2) ? 8 : 4), by: new Set(), steps: 0 };
  // Knockback
  const kr = mwR(w, 'knock');
  if (kr && !e.boss && (typeof lzIs === 'function' && lzIs(w)) && e.lzCrossT > G.t) { /* (caught in Crossfire: pinned, not pushed) */ }
  else if (kr && !e.boss && (typeof lzIs === 'function' && lzIs(w))) { // the Laser pushes steadily along the beam (40 a second a rank) instead of shoving each tick
    const d = Math.hypot(e.x - p.x, e.y - p.y) || 1, f = 40 * kr * Math.max(0.05, w.s.cd || 0.1) * (msB(w, 'knock', 2) && d < 100 ? 1.5 : 1) * (msMa(w, 'knock') === 'A2' ? 2 : 1);
    const nx = e.x + (e.x - p.x) / d * f, ny = e.y + (e.y - p.y) / d * f; if (!(G.lvl && lvSolidAt(nx, ny))) { e.x = nx; e.y = ny; }
    if (!(e.mwKnT > G.t - 0.6)) e.mwKnHit = null; e.mwKnT = G.t; e.mwKnW = w;
    if (msMa(w, 'knock') === 'B1' && G.t >= (w.lzKnNT || 0)) { w.lzKnNT = G.t + 2.5; ring(p.x, p.y, 140, w.def.color, 0.4, 5); forNear(p.x, p.y, 140, o => { if (!o.dead && !o.boss) shove(o, p.x, p.y, 300); }); }
  } else if (kr && !e.boss) {
    let f = 150 * kr, d = Math.hypot(e.x - p.x, e.y - p.y);
    if (msB(w, 'knock', 2) && d < 100) f *= 1.5;
    if (msB(w, 'knock', 3) && e.mwKnT > G.t - 2) f *= 2;
    if (msMa(w, 'knock') === 'A2') { f *= 3; const ex = e; after(0.4, () => { if (G && !ex.dead) mwStrike(w, ex.x, ex.y, 60, 0.5, msEcho(src)); }); }
    shove(e, p.x, p.y, f); e.mwKnT = G.t; e.mwKnW = w; e.mwKnHit = null;
    if (msMa(w, 'knock') === 'B1') { w.mwKnN = (w.mwKnN || 0) + 1; if (w.mwKnN % 5 === 0) { const RR = 140 * (typeof areaK === 'function' ? areaK(w) : 1); ring(p.x, p.y, RR, w.def.color, 0.4, 5); forNear(p.x, p.y, RR, o => { if (!o.dead && !o.boss) shove(o, p.x, p.y, 300); }); } }
  }
  // Pulling: enemies near the hit are drawn onto it
  const pl = mwR(w, 'pull');
  if (pl) {
    let tx = e.x, ty = e.y;
    if (msB(w, 'pull', 2)) { const z = G.zones.filter(z => z.src && z.src.w && Math.hypot(z.x - e.x, z.y - e.y) < 250).sort((a, b) => Math.hypot(a.x - e.x, a.y - e.y) - Math.hypot(b.x - e.x, b.y - e.y))[0]; if (z) { tx = z.x; ty = z.y; } } // Pied Piper
    const f = 18 * pl * (tx !== e.x && mwR(w, 'pull') >= 3 ? 1.5 : 1), R = 50 * pl * (typeof areaK === 'function' ? areaK(w) : 1);
    let n = 0;
    for (const o of G.enemies) { if (o.dead || o.charmed || n >= 12 || Math.hypot(o.x - e.x, o.y - e.y) > R) continue; n++; mwPull(o, tx, ty, f); o.mwPulledT = G.t + 1; } // (not forNear: its grid lags a frame behind)
    if (msMa(w, 'pull') === 'A1' && n >= 3) forNear(e.x, e.y, 40, o => { if (o !== e && !o.dead) damageEnemy(o, w.s.dmg * 0.4, msEcho(src)); }); // Singularity
    if (msMa(w, 'pull') === 'A2' && !e.boss) { e.mwTract = G.t + 1.5; e.mwTractW = w; } // Tractor
  }
  // Up Close, Execution: point-blank finishes the weak
  if (msMa(w, 'upclose') === 'A1' && !e.dead && !e.elite && !e.boss && e.hp < e.maxHp * 0.15 && Math.hypot(e.x - p.x, e.y - p.y) < 60) damageEnemy(e, e.hp * 4 + 10, msEcho(src));
  // Up Close, Mosh Pit: crowded close hits splash
  if (msMa(w, 'upclose') === 'B1' && Math.hypot(e.x - p.x, e.y - p.y) < 180) { let n = 0; forNear(p.x, p.y, 120, () => n++); if (n >= 5) { let k = 0; forNear(e.x, e.y, 120, o => { if (o !== e && !o.dead && k++ < 8) damageEnemy(o, res.toHp * 0.4, msEcho(src)); }); } }
}
wupHit = (orig => function (e, res, src) { orig(e, res, src); mwHit(e, res, src); })(wupHit);

function mwDetonate(e, pw, M) {
  if (!G.weapons.includes(pw)) return;
  const r = msR(pw, 'primer') >= 2 ? 60 : 40;
  let k = msR(pw, 'primer') >= 2 ? 0.75 : 0.5;
  if (msB(pw, 'primer', 3)) k *= 1 + 0.25 * Math.min(3, M.by.size);
  if (msMa(pw, 'primer') === 'B1' && M.by.size >= 3) k *= 3; // Full Roster
  const src = mwSrc(pw, { mwDet: true, noRx: false });
  aoe(e.x, e.y, r, pw.s.dmg * k, src, pw.def.color); ring(e.x, e.y, r, pw.def.color, 0.35, 4);
  const m = msMa(pw, 'primer');
  if (m === 'A1' && (M.steps || 0) < 3) forNear(e.x, e.y, r, o => { if (o !== e && !o.dead && !(o.mwPr && o.mwPr.t > G.t)) o.mwPr = { w: pw, t: G.t + 4, by: new Set(), steps: (M.steps || 0) + 1 }; }); // Chain Primer
  if (m === 'B2') { const o = msNear(e.x, e.y, 100, [e]); if (o) o.mwPr = { w: pw, t: G.t + 4, by: new Set(), steps: 0 }; } // Handoff
}

// ---------------------------------------------------------------- kills
function mwKill(e, src) {
  if (!G.mwAny) return;
  if (e.mwPr && e.mwPr.t > G.t && msA(e.mwPr.w, 'primer', 3)) { const M = e.mwPr; e.mwPr = null; mwDetonate(e, M.w, M); } // Bomb Squad: dies primed, explodes
  const w = src && src.w;
  // Exploding Rounds, A Bit Extra: killing hits explode, bigger (Chain Blast: kills by a burst burst too, 12 in a chain)
  if (w && msB(w, 'explode', 2) && (!src.mwBoom || (msMa(w, 'explode') === 'B1' && (src.mwChain || 0) < 12))) {
    const er = mwR(w, 'explode'), big = msMa(w, 'explode') === 'B2' && e.elite ? 3 : 1;
    const R = (er >= 3 ? 120 : 80) * big, k = (er >= 3 ? 1.8 : 1.2) * (msMa(w, 'explode') === 'B2' ? 2 : 1);
    const bsrc = Object.assign({}, src, { mwBoom: 1, noRx: true, mwChain: (src.mwChain || 0) + 1 });
    aoe(e.x, e.y, R, w.s.dmg * k, bsrc, w.def.color); ring(e.x, e.y, R, w.def.color, 0.3, 4);
  }
  // Turncoat: the kill rises as an ally (old Soldier keeps its allies alive while they kill)
  if (src && src.fromAlly) { const A = mwS().allies.filter(a => !a.z.dead && Math.hypot(a.z.x - e.x, a.z.y - e.y) < a.z.r + e.r + 12)[0]; if (A && msMa(A.w, 'turncoat') === 'A2') A.end = Math.min(G.t + 15, A.end + 3); } // Old Soldier (the ally touching it made the kill)
  if (!w || !mwR(w, 'turncoat') || e.elite || e.boss || e.rival || e.egg || e.charmed || e.mwAllyOf) return;
  mwRise(w, e, src && src.mwBomb);
}
function mwRise(w, e, bomb) {
  const S = mwS(), A = msA(w, 'turncoat', 2), life = 5 * (A ? 1.5 : 1);
  const z = makeEnemy(e.def, e.x, e.y);
  z.charmed = true; z.charmT = 1e9; z.zombie = true; z.xp = 0; z.mwAllyOf = w; z.name = e.name;
  z.hp = z.maxHp = z.maxHp * 0.5 * (msA(w, 'turncoat', 3) ? 1.5 : 1);
  if (msMa(w, 'turncoat') === 'A1' && !S.allies.some(a => a.w === w && a.sgt)) { z.r *= 1.5; z.mwSgt = 1; }
  G.enemies.push(z); ring(z.x, z.y, z.r + 8, w.def.color, 0.4, 3);
  S.allies.push({ w, z, end: G.t + life, sgt: !!z.mwSgt });
  const mine = S.allies.filter(a => a.w === w && !a.z.dead);
  while (mine.length > 6) { const o = mine.shift(); o.z.dead = true; o.end = 0; }
}
wupKill = (orig => function (e, src) { orig(e, src); mwKill(e, src); })(wupKill);

// ---------------------------------------------------------------- hurt: Melee Counter, Guardian Angel
hurtPlayer = (orig => function (dmg, from, ent, kind) {
  if (G && G.mwAny && ent && !ent.dead && kind !== 'thorns') {
    for (const w of mwWs()) {
      if (msMa(w, 'melee') === 'B2' && !(w.mwCtrT > G.t)) { w.mwCtrT = G.t + 3; damageEnemy(ent, w.s.dmg * 2, mwSrc(w, { atk: 'contact' })); ring(G.player.x, G.player.y, 40, w.def.color, 0.3, 4); return 0; } // Counter: no damage from that hit
      if (msMa(w, 'dfa') === 'B2' && !(w.mwGaT > G.t)) { w.mwGaT = G.t + 4; mwDfa(w, ent, weaponSrc(w), 2, 0.3); }
    }
  }
  return orig(dmg, from, ent, kind);
})(hurtPlayer);

// ---------------------------------------------------------------- every frame
function mwTick(dt) {
  if (!G || !G.mwAny || G.state !== 'play') return;
  const S = mwS(), p = G.player;
  // Mines: arm, creep (Smart Mines), go off
  for (const q of S.mines) {
    if (q.gone) continue;
    if (q.t < G.t || !G.weapons.includes(q.w)) { q.gone = true; continue; }
    if (q.armed > G.t) continue;
    if (msB(q.w, 'mines', 2)) { const o = msNear(q.x, q.y, 250); if (o) { const d = Math.hypot(o.x - q.x, o.y - q.y) || 1; q.x += (o.x - q.x) / d * 30 * dt; q.y += (o.y - q.y) / d * 30 * dt; } }
    const trig = msNear(q.x, q.y, 60 * (q.big > 1 ? 1.5 : 1));
    if (trig) { mwMineGo(q); if (q.rearm) { q.rearm = 0; q.armed = G.t + 1; } else q.gone = true; }
  }
  S.mines = S.mines.filter(q => !q.gone);
  // Turncoat allies: expire (Walking Bombs explode, running at the nearest enemy from Lv 3)
  for (const A of S.allies) {
    if (A.z.dead) continue;
    if (msB(A.w, 'turncoat', 3)) { const o = msNear(A.z.x, A.z.y, 300, [A.z]); if (o && !o.charmed) { const d = Math.hypot(o.x - A.z.x, o.y - A.z.y) || 1; A.z.x += (o.x - A.z.x) / d * 60 * dt; A.z.y += (o.y - A.z.y) / d * 60 * dt; } }
    if (A.end > G.t) continue;
    A.z.dead = true;
    if (msB(A.w, 'turncoat', 2) && G.weapons.includes(A.w)) {
      const r = mwR(A.w, 'turncoat') >= 3 ? 80 : 60, src = mwSrc(A.w, { mwBomb: msMa(A.w, 'turncoat') === 'B1' });
      mwStrike(A.w, A.z.x, A.z.y, r, 0.8, src);
    }
  }
  S.allies = S.allies.filter(A => !A.z.dead);
  // Ranged proxies: repeat the attack where they stand (Puppet walks; Ventriloquist copies)
  for (const q of S.marks) {
    if (q.k !== 'proxy' || q.t < G.t || !G.weapons.includes(q.w)) continue;
    if (q.walk) { const o = msNear(q.x, q.y, 300); if (o) { const d = Math.hypot(o.x - q.x, o.y - q.y) || 1; q.x += (o.x - q.x) / d * 80 * dt; q.y += (o.y - q.y) / d * 80 * dt; } }
    if (q.next <= G.t) { q.next = G.t + 1; mwStrike(q.w, q.x, q.y, q.w.s.area || 60, q.copy ? 0.5 : 1, weaponSrc(q.w)); }
  }
  S.marks = S.marks.filter(q => q.t >= G.t);
  for (const w of mwWs()) {
    if (!w.m10) continue;
    // Melee, Berserker: +10% rate a hit in a row
    if (msMa(w, 'melee') === 'A1' && w.mwBers && G.t - (w.mwBersT || 0) < 1) w.cd -= dt * 0.1 * w.mwBers; else if (w.mwBers && G.t - (w.mwBersT || 0) >= 1) w.mwBers = 0;
    // Charged, Capacitor: 1.5 s with nothing in range charges the next attack
    if (msMa(w, 'charged') === 'B2' && !msNear(p.x, p.y, w.s.range || 300)) { w.mwIdle = (w.mwIdle || 0) + dt; if (w.mwIdle > 1.5) { w.mwCap = 1; w.cd = Math.min(w.cd, 0); } } else w.mwIdle = 0;
    // Charged, Quick Release Lv 2: half the wind-up when an enemy is within 100
    if (msB(w, 'charged', 2) && msNear(p.x, p.y, 100)) w.cd -= dt;
    // Range, Tripline (simplified): enemies coming within 400 take one free hit each (3 a second)
    if (msMa(w, 'range') === 'B2') { w.mwTripN = w.mwTripS === Math.floor(G.t) ? w.mwTripN || 0 : 0; w.mwTripS = Math.floor(G.t);
      for (const e of G.enemies) { if (w.mwTripN >= 3) break; if (e.dead || e.charmed || (e.mwTrip && e.mwTrip[mwK(w)])) continue; if (Math.hypot(e.x - p.x, e.y - p.y) < 400) { (e.mwTrip || (e.mwTrip = {}))[mwK(w)] = 1; w.mwTripN++; damageEnemy(e, w.s.dmg, weaponSrc(w)); } } }
    // Pulling, Dinner Bell: your ground objects pull nearby enemies weakly
    if (msMa(w, 'pull') === 'B1') for (const z of G.zones) if (z.src && z.src.w === w) forNear(z.x, z.y, 200, o => { if (!o.charmed) mwPull(o, z.x, z.y, 6 * dt * 60 * 0.3); });
  }
  // Knockback, Wall Slam: shoved enemies that hit a mate take collision damage (once per shove)
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (e.mwTract > G.t && e.mwTractW) mwPull(e, p.x, p.y, 90 * dt); // Tractor: reeled in
    if (!(e.mwKnT > G.t - 0.6) || e.mwKnHit || !msA(e.mwKnW, 'knock', 2)) continue;
    const o = msNear(e.x, e.y, e.r + 2, [e]); if (!o) continue;
    e.mwKnHit = 1; const w = e.mwKnW, k = mwR(w, 'knock') >= 3 ? 0.4 : 0.2;
    if (!G.weapons.includes(w)) continue;
    const src = msEcho(weaponSrc(w));
    damageEnemy(e, w.s.dmg * k, src); damageEnemy(o, w.s.dmg * k, src);
    if (msMa(w, 'knock') === 'A1' && !o.boss) { shove(o, e.x, e.y, 150 * mwR(w, 'knock')); o.mwKnT = G.t; o.mwKnW = w; o.mwKnHit = null; } // Bowling Ball (each step clears the mark once)
  }
  // Primer, Time Bomb: a mark nobody set off goes off on its own after 3 s
  for (const e of G.enemies) if (e.mwPr && !e.dead && msMa(e.mwPr.w, 'primer') === 'A2' && e.mwPr.t - G.t < (msA(e.mwPr.w, 'primer', 2) ? 5 : 1)) { const M = e.mwPr; e.mwPr = null; mwDetonate(e, M.w, Object.assign(M, { by: new Set([1, 2]) })); }
}
wupTick = (orig => function (dt) { orig(dt); mwTick(dt); })(wupTick);

// ---------------------------------------------------------------- drawing: mines, proxies, primer marks, the melee arc
modDraw = (orig => function () {
  orig();
  if (!G || !G.mwAny) return;
  const M = mwS(); ctx.save();
  for (const q of M.mines) { const c = col(q.w.def.color), r = (q.big > 1 ? 10 : 6) * S; ctx.globalAlpha = q.armed > G.t ? 0.4 : 0.9; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), r, 0, TAU); ctx.fill(); ctx.globalAlpha = 0.3; ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 60 * (q.big > 1 ? 1.5 : 1) * S, 0, TAU); ctx.stroke(); }
  for (const q of M.marks) if (q.k === 'proxy') { ctx.globalAlpha = 0.6; ctx.strokeStyle = col(q.w.def.color); ctx.lineWidth = 2 * S; ctx.beginPath(); ctx.arc(sx(q.x), sy(q.y), 12 * S, 0, TAU); ctx.stroke(); }
  for (const e of G.enemies) if (e.mwPr && e.mwPr.t > G.t && !e.dead) { ctx.globalAlpha = 0.8; ctx.strokeStyle = col(e.mwPr.w.def.color); ctx.lineWidth = 1.5 * S; ctx.setLineDash([3 * S, 3 * S]); ctx.beginPath(); ctx.arc(sx(e.x), sy(e.y), (e.r + 6) * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
  for (const f of G.v10fx || []) if (f.k === 'arc') { ctx.globalAlpha = 0.5 * f.life / f.max; ctx.strokeStyle = col(f.c); ctx.lineWidth = 4 * S; ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), f.r * S, f.a - 1.31, f.a + 1.31); ctx.stroke(); }
  ctx.restore();
})(modDraw);

// ---------------------------------------------------------------- no slot limits: every modifier on each level-up (user, 23 Oct)
// With the no-limits setting on (modmatrix.js mmFree), a level-up lists every card you could take: each weapon's modifiers,
// Switched at Birth, the sperm passives and defences the draft would deal (slice-only rules still apply). Feats keep their
// own cards elsewhere. The list scrolls. Hooks: draft.js draftLoot and ui.js UI.renderLootCards (wrapped).
function mwAllCards() {
  const out = [];
  for (const w of mwWs()) if (w.def.v10atk) for (const id of modsFor(w)) if (!banished('mod:' + id)) out.push(modCard(w, id));
  const sab = sabCard(); if (sab) out.push(sab);
  for (const c of CARDS) if ((c.family || '').startsWith('mut:') && !banished(c.id) && cardOk(c) && !(typeof mdDraftSkip === 'function' && mdDraftSkip(c))) out.push(cardOpt(c));
  if (typeof pdefOffer === 'function') for (const o of pdefOffer(99)) if (!banished('def:' + o.defence)) out.push(Object.assign(o, { family: 'def', bkey: 'def:' + o.defence }));
  return out.filter(Boolean);
}
draftLoot = (orig => function (req) {
  if (req.kind === 'level' && mmFree()) { draftAbsorb(); const all = mwAllCards(); if (all.length) return all; }
  return orig(req);
})(draftLoot);
UI.renderLootCards = (orig => function () {
  orig.call(this);
  const el = $('lootCards'); if (el) el.classList.toggle('mwall', !!(UI.lootReq && UI.lootReq.kind === 'level' && mmFree()));
})(UI.renderLootCards);
{ const st = document.createElement('style'); st.textContent = '#lootCards.mwall{max-height:64vh;overflow-y:auto;flex-direction:column!important;-webkit-overflow-scrolling:touch}#lootCards.mwall .card{flex:none;animation-delay:0s!important}'; document.head.appendChild(st); }
