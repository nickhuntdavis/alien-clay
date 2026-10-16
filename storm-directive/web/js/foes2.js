'use strict';
// Spawn Prawn - twenty more things in the dish. Build-punishers (they each spoil one kind of build), support
// cells (they make the others worse), and joke ones (bits of rubbish that got into the sample).
// Every type has a `cap`: at most that many on the slide at once (G.typeN, counted on makeEnemy and death,
// resynced every second); a spawn over its cap rolls another type (campaign.js campSpawnMob, game.js spawnRandom).
// Ordinary enemies with `weak`/`resist` (same shape as BOSSES) take those multipliers too (foes2Dmg).
// Hooks: foes2Make (makeEnemy), foes2Kill (foeKill, foes.js), foes2Dmg (damageEnemy, after armour),
// foes2Shot (projectile collision, game.js), foes2Tick (update), foes2Speed (player speed), foes2HurtMul
// (hurtPlayer), foes2Fx (drawEnemy), foeRoom (spawners). Knockback skips tethered enemies (e.tethT) and
// crits skip def.noCrit (damageEnemy).

Object.assign(ENEMIES, {
  // ---- build-punishers (cap 6)
  litmus:    { name: 'Litmus Cell', hp: 40, speed: 50, armour: 1, r: 15, dmg: 10, xp: 4, color: '#d9a7c7', shape: 'litmus', ai: 'chase', from: 120, w: 1.5, cap: 6, litmus: true,
    weak: { oxi: 1.4 }, resist: {}, does: 'Resists the damage type you have dealt most this run' },
  mirror:    { name: 'Mirror Cell', hp: 34, speed: 54, armour: 0, r: 14, dmg: 9, xp: 4, color: '#cfd8e3', shape: 'mirror', ai: 'mirror', from: 150, w: 1.3, cap: 6, shotFx: true, mirror: true,
    weak: { fire: 1.4 }, resist: { shock: 0.6 }, does: 'Reflects shots that hit its front' },
  shell:     { name: 'Shell Cell', hp: 46, speed: 38, armour: 15, r: 16, dmg: 12, xp: 5, color: '#e6dcc4', shape: 'shell', ai: 'chase', from: 175, w: 1.2, cap: 6,
    weak: { fire: 1.5 }, resist: { phys: 0.7 }, does: '15 armour' },
  puffball:  { name: 'Puffball', hp: 42, speed: 42, armour: 0, r: 17, dmg: 8, xp: 4, color: '#e2d6b4', shape: 'puffball', ai: 'chase', from: 110, w: 1.4, cap: 6, puff: 'spore',
    weak: { fire: 1.3 }, resist: { poison: 0.6 }, does: 'Blasts and pools burst it into spores' },
  spore:     { name: 'Spore', hp: 6, speed: 84, armour: 0, r: 7, dmg: 4, xp: 0.3, color: '#ece2c0', shape: 'spore', ai: 'chase', from: 99999, w: 0, cap: 10,
    weak: { fire: 1.3 } },
  grease:    { name: 'Grease Ball', hp: 52, speed: 52, armour: 2, r: 16, dmg: 11, xp: 5, color: '#d8c98f', shape: 'grease', ai: 'chase', from: 190, w: 1.2, cap: 6, heavy: true, shotFx: true, grease: true,
    weak: { ice: 1.5 }, resist: { salt: 0.6 }, does: 'Homing shots slide off; cannot be knocked back' },
  leech:     { name: 'Leech', hp: 30, speed: 72, armour: 0, r: 12, dmg: 7, xp: 4, color: '#8a6f78', shape: 'leech', ai: 'leech', from: 130, w: 1.3, cap: 6,
    weak: { salt: 1.6 }, resist: { arcane: 0.5 }, does: 'Drains your stamina within 120' },
  platelet:  { name: 'Platelet Clump', hp: 46, speed: 46, armour: 2, r: 15, dmg: 10, xp: 4, color: '#e8b4bc', shape: 'platelet', ai: 'chase', from: 160, w: 1.2, cap: 6, shotFx: true, clot: true,
    weak: { poison: 1.4 }, resist: { arcane: 0.6 }, does: 'Stops piercing shots dead' },
  callus:    { name: 'Callus', hp: 58, speed: 40, armour: 4, r: 16, dmg: 12, xp: 5, color: '#e9d8a6', shape: 'callus', ai: 'chase', from: 200, w: 1.1, cap: 6, noCrit: true,
    weak: { salt: 1.4 }, resist: { phys: 0.8 }, does: 'Immune to crits' },
  // ---- support (cap 3): they hang back
  plasma:    { name: 'Plasma Cell', hp: 38, speed: 46, armour: 1, r: 15, dmg: 7, xp: 6, color: '#b8c0ff', shape: 'plasma', ai: 'plasma', from: 175, w: 0.9, cap: 3, support: true, pack: 2,
    weak: { shock: 1.4 }, does: 'Shooters within 200 fire 40% faster' },
  interferon:{ name: 'Interferon', hp: 34, speed: 46, armour: 0, r: 14, dmg: 6, xp: 6, color: '#bde0fe', shape: 'interferon', ai: 'interferon', from: 185, w: 0.9, cap: 3, support: true, pack: 2,
    weak: { fire: 1.3 }, does: 'Shields allies within 170 (30 HP, scaling)' },
  cortisol:  { name: 'Cortisol Puff', hp: 30, speed: 50, armour: 0, r: 13, dmg: 6, xp: 5, color: '#ffd6a5', shape: 'cortisol', ai: 'cortisol', from: 145, w: 0.9, cap: 3, support: true, pack: 2,
    weak: { poison: 1.4 }, does: 'Allies within 180 swim 30% faster' },
  fibrin:    { name: 'Fibrin Weaver', hp: 44, speed: 40, armour: 1, r: 15, dmg: 8, xp: 6, color: '#efe3d0', shape: 'fibrin', ai: 'fibrin', from: 205, w: 0.8, cap: 3, support: true, pack: 2,
    weak: { oxi: 1.4 }, resist: { phys: 0.8 }, does: 'Tethers up to 4 allies: they cannot be knocked back' },
  complement:{ name: 'Complement Protein', hp: 28, speed: 60, armour: 0, r: 12, dmg: 6, xp: 5, color: '#ffafcc', shape: 'complement', ai: 'complement', from: 165, w: 0.9, cap: 3, support: true, pack: 2,
    weak: { arcane: 1.4 }, does: 'Marks you: enemies hit you 25% harder for 5s' },
  stem:      { name: 'Stem Cell', hp: 44, speed: 36, armour: 1, r: 15, dmg: 6, xp: 8, color: '#caffbf', shape: 'stem', ai: 'stem', from: 230, w: 0.7, cap: 3, support: true, pack: 2,
    weak: { shock: 1.3 }, does: 'Revives a dead ordinary enemy every 10s' },
  // ---- joke (cap 8)
  tadpole:   { name: 'Lost Tadpole', hp: 1, speed: 46, armour: 0, r: 9, dmg: 0, xp: 0.5, color: '#4a4a4a', shape: 'tadpole', ai: 'tadpole', from: 80, w: 1.1, cap: 8, oneHp: true,
    weak: { salt: 2 }, does: '1 HP. Harmless. Asks for directions' },
  pube:      { name: 'Stray Pube', hp: 10, speed: 30, armour: 0, r: 10, dmg: 0, xp: 0.5, color: '#3d3530', shape: 'pube', ai: 'pube', from: 90, w: 1.1, cap: 8,
    weak: { ice: 1.6 }, does: 'Drifts in; touching it tangles you briefly' },
  fluff:     { name: 'Navel Fluff', hp: 18, speed: 34, armour: 0, r: 13, dmg: 3, xp: 0.6, color: '#9fa8c0', shape: 'fluff', ai: 'drift', from: 75, w: 1.1, cap: 8,
    weak: { shock: 1.5 }, does: 'Drifts about. Nobody knows where it comes from' },
  bogey:     { name: 'Bogey', hp: 16, speed: 58, armour: 0, r: 11, dmg: 0, xp: 0.6, color: '#a8c256', shape: 'bogey', ai: 'bogey', from: 100, w: 1.0, cap: 8,
    weak: { salt: 1.4 }, resist: { ice: 0.7 }, does: 'Sticks to you: 5% slower each (up to 20%)' },
  sweetcorn: { name: 'Bit of Sweetcorn', hp: 110, speed: 32, armour: 6, r: 12, dmg: 0, xp: 2, color: '#ffd166', shape: 'sweetcorn', ai: 'drift', from: 115, w: 0.8, cap: 8,
    weak: { fire: 1.2 }, resist: { phys: 0.6, poison: 0.6 }, does: 'Tough and completely harmless' },
  glitter:   { name: 'Glitter', hp: 8, speed: 76, armour: 0, r: 7, dmg: 2, xp: 0.4, color: '#f7c6ff', shape: 'glitter', ai: 'chase', from: 95, w: 0.9, cap: 8, group: 4, glitter: true,
    weak: { oxi: 1.3 }, resist: { shock: 0.6 }, does: 'Comes back once after you kill it' },
});

Object.assign(ENEMY_INTRO, {
  litmus:     { what: 'A cell that has been reading your lab book. It resists whichever damage type you have dealt most this run: its paper strip shows which.', tip: 'Switch it up. A second damage type in your build earns its keep here. Oil bleaches it.' },
  mirror:     { what: 'Polished to a shine. Shots that hit its front bounce straight back at you.', tip: 'Hit it from the side or behind, or use blasts and pools. Acid etches the silvering.' },
  shell:      { what: 'A cell that has grown a shell like a whelk. Fifteen points of armour: small hits just tickle.', tip: 'Big single hits, armour shred and damage over time. Acid dissolves the shell.' },
  puffball:   { what: 'A fungal puffball. Hit it with a blast or a pool and it bursts into a cloud of spores that chase you.', tip: 'Single shots are fine. Save the blasts for after it has gone.' },
  spore:      { what: 'A spore from a burst Puffball. Small, quick and annoying, like the person who burst it.', tip: 'Anything that hits a crowd.' },
  grease:     { what: 'A ball of grease. Homing shots slide right off it, and it can\'t be knocked about.', tip: 'Aim properly, or use pools and auras. Mucus gums it up.' },
  leech:      { what: 'Latches on from a distance and sucks the stamina out of you while it is within 120.', tip: 'Kill it before you need to sprint or perform a Feat. Water makes it curl up.' },
  platelet:   { what: 'A clot of platelets. Piercing shots stop dead in it, like a plaster.', tip: 'Blasts and chains go round it. Blood thins it out.' },
  callus:     { what: 'Hard skin with ideas above its station. Crits do nothing extra to it.', tip: 'Raw damage and damage over time. Water softens it.' },
  plasma:     { what: 'An antibody factory. Shooters near it fire 40% faster.', tip: 'Kill it first and the bullets thin out. It hangs back, so go and get it.' },
  interferon: { what: 'A warning signal. It wraps nearby enemies in a shield that soaks about 30 damage.', tip: 'Kill it before you spend big hits on shielded enemies.' },
  cortisol:   { what: 'A puff of stress hormone. Everything near it swims 30% faster. You know the feeling.', tip: 'Take it out early, then the crowd calms down.' },
  fibrin:     { what: 'Spins sticky threads to up to four nearby enemies. Tethered enemies can\'t be knocked back.', tip: 'Cut the weaver and the threads go with it.' },
  complement: { what: 'Tags you for destruction. While you are marked, every enemy hits you 25% harder.', tip: 'It is flimsy: kill it the moment it closes in. The mark wears off after 5 seconds.' },
  stem:       { what: 'It can become anything, including whatever you just killed. Every 10 seconds it brings one back.', tip: 'Kill it before it gets to work, or nothing in the dish stays dead.' },
  tadpole:    { what: 'A frog tadpole. It has no idea how it got here and it would like directions to the pond.', tip: 'One hit. Or don\'t. It\'s not hurting anyone.' },
  pube:       { what: 'A stray pube, drifting about. Swim into it and you are tangled for a second.', tip: 'Shoot it or swim round it. Mucus glues it down.' },
  fluff:      { what: 'Navel fluff. Nobody knows where it comes from. It barely hurts.', tip: 'Ignore it, or let it soak up a stray shot.' },
  bogey:      { what: 'A bogey. It flicks itself at you and sticks: each one stuck on you slows you down a little.', tip: 'Your weapons will pick them off you. Water helps, as does a tissue.' },
  sweetcorn:  { what: 'A bit of sweetcorn. It has been through the whole system intact and it is not stopping now. Tough as anything, completely harmless.', tip: 'Don\'t waste your best hits on it. It can\'t hurt you.' },
  glitter:    { what: 'Glitter from a hen do. Kill it and it comes back. You will be finding it for weeks.', tip: 'Area damage. It only comes back once.' },
});

// Junk DNA powers (junk.js skips any type without one).
Object.assign(JUNK_POWERS, {
  litmus:   { name: 'Litmus Test', fmt: k => `+${6 * k}% damage`, apply: P => { P.might += 0.06; } },
  mirror:   { name: 'Smoke and Mirrors', fmt: k => `+${4 * k}% dodge`, apply: P => { P.dodge += 0.04; } },
  shell:    { name: 'Shell Suit', fmt: k => `+${2 * k} armour`, apply: P => { P.armour += 2; } },
  puffball: { name: 'Spore Print', fmt: k => `+${8 * k}% area`, apply: P => { P.area += 0.08; } },
  grease:   { name: 'Greased Lightning', fmt: k => `+${6 * k}% swim speed`, apply: P => { P.speed += 0.06; } },
  leech:    { name: 'Second Wind', fmt: k => `stamina recovers ${20 * k}% faster`, apply: P => { P.stamRegen = (P.stamRegen || 1) + 0.2; } },
  platelet: { name: 'Quick Clotter', fmt: k => `+${+(0.5 * k).toFixed(1)} HP/s regeneration`, apply: P => { P.regen += 0.5; } },
  callus:   { name: 'Hard Skin', fmt: k => `+${10 * k}% crit damage`, apply: P => { P.critDmg += 0.1; } },
  plasma:   { name: 'Mass Production', fmt: k => `+${6 * k}% fire rate`, apply: P => { P.haste += 0.06; } },
  cortisol: { name: 'Fight or Flight', fmt: k => `+${5 * k}% swim speed`, apply: P => { P.speed += 0.05; } },
});
Object.assign(JUNK_PARENT, { spore: 'puffball' });

// ---------------------------------------------------------------- caps and counts
let FOE_KEYS = null;
const foeKey = def => (FOE_KEYS || (FOE_KEYS = new Map(Object.entries(ENEMIES).map(([k, d]) => [d, k])))).get(def);
// Room for one more of this type on the slide?
function foeRoom(def) { if (!def || !def.cap || !G) return true; const n = G.typeN && G.typeN[foeKey(def)]; return !n || n < def.cap; }
function foes2Make(e) {
  const D = e.def;
  if (D.cap) { const k = foeKey(D); if (k) { const N = G.typeN || (G.typeN = {}); N[k] = (N[k] || 0) + 1; e.capd = k; } }
  if (D.oneHp) e.hp = e.maxHp = 1;
}
function f2spawn(def, x, y, extra) {
  if (G.enemies.length >= CAPS.enemies || !foeRoom(def)) return null;
  const z = makeEnemy(def, x, y);
  if (extra) Object.assign(z, extra);
  G.enemies.push(z);
  return z;
}
const F2_SAY = ["WHICH WAY'S THE POND?", 'HAVE YOU SEEN MY MUM?', 'IS THIS THE FROGSPAWN?', 'I TOOK A WRONG TURN AT THE KIDNEYS', 'ARE YOU A TADPOLE TOO?', 'NICE TAIL, MATE'];
const f2msg = (e, txt, c, gap) => { if (G.f2msgT > G.t) return; G.f2msgT = G.t + (gap || 2.5); floatText(e.x, e.y - e.r - 14, txt, c || XR.white, 12, 1.1); };

function foes2Kill(e, src) {
  const D = e.def;
  if (D.f3kill) foes3Kill(e, src); // (Snot Bubble: foes3.js)
  if (e.capd && G.typeN && G.typeN[e.capd] > 0) G.typeN[e.capd]--;
  // A Stem Cell's raw material: ordinary enemies that just died.
  if (!e.elite && !e.boss && !e.rival && !e.charmed && !e.revived && D.w > 0 && !D.support && !e.bossDef) {
    const C = G.f2dead || (G.f2dead = []);
    C.push({ def: D, x: e.x, y: e.y, t: G.t });
    if (C.length > 24) C.shift();
  }
  if (D.puff && (G.t - (e.puffHit || -9) < 0.3)) {
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + Math.random(); f2spawn(ENEMIES[D.puff], e.x + Math.cos(a) * 14, e.y + Math.sin(a) * 14); }
    fxParts('smoke', e.x, e.y, '#e2d6b4', 4, 60, 0.9, e.r * 0.5);
  }
  if (D.glitter && !e.reborn && !e.charmed) {
    const x = e.x, y = e.y;
    after(1.2, () => { if (G.state !== 'play' && G.state !== 'loot') return; const z = f2spawn(D, x + rand(-30, 30), y + rand(-30, 30), { reborn: true, xp: 0 }); if (z) { spawnPart(z.x, z.y, '#f7c6ff', 6, 90, 0.4, 2); f2msg(z, 'STILL HERE', '#f7c6ff', 4); } });
  }
  if (D.shape === 'fluff') fxParts('smoke', e.x, e.y, '#9fa8c0', 2, 40, 0.8, e.r * 0.4);
}

// From damageEnemy, after armour. Also tallies what you have dealt by damage type (the Litmus Cell reads it).
function foes2Dmg(e, d, src) {
  const el = src.elem || 'phys', F = G.f2el || (G.f2el = {});
  F[el] = (F[el] || 0) + d;
  const D = e.def;
  if (!e.boss && !e.bossDef && !e.rival && (D.weak || D.resist)) {
    let m = 1;
    if (D.weak && D.weak[el]) m *= D.weak[el];
    if (D.resist && D.resist[el] != null) m *= D.resist[el];
    if (m !== 1) {
      d *= m;
      if (D.litmus && m < 1 && !src.dot && !(e.resT > G.realT)) { e.resT = G.realT + 1.2; floatText(e.x, e.y - e.r - 10, 'RESISTED', XR.dim, 11, 0.7); }
    }
  }
  if (D.f3dmg) foes3Dmg(e, src); // (Snot Bubble swells: foes3.js)
  if (e.ifn > 0 && d > 0) { const a = Math.min(e.ifn, d); e.ifn -= a; d -= a; if (e.ifn <= 0) spawnPart(e.x, e.y, '#bde0fe', 4, 80, 0.3, 2); }
  if (D.puff && (IN_AOE || src.zoneHit)) {
    e.puffHit = G.t;
    if (!(e.puffT > G.t)) { e.puffT = G.t + 1.5; e.puffRT = G.realT; const a = Math.random() * TAU; f2spawn(ENEMIES[D.puff], e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r); }
  }
  return d;
}

// From the projectile collision: 0 = hit as normal, 1 = this enemy is skipped, 2 = the shot is spent.
function foes2Shot(pr, e) {
  const D = e.def;
  if (D.mirror) {
    const fa = e.mface != null ? e.mface : 0, vl = Math.hypot(pr.vx, pr.vy) || 1;
    if ((pr.vx * Math.cos(fa) + pr.vy * Math.sin(fa)) / vl < -0.45) {
      if (!(e.refT > G.t)) {
        e.refT = G.t + 0.18;
        const p = me(), sn = shooterName, se = shooterEnt;
        shooterName = e.name; shooterEnt = e;
        eBullet(e.x + Math.cos(fa) * e.r, e.y + Math.sin(fa) * e.r, Math.atan2(p.y - e.y, p.x - e.x) + rand(-0.08, 0.08), 260, 5 * dmgNow(), 4, '#ffffff');
        shooterName = sn; shooterEnt = se;
        e.glintRT = G.realT;
      }
      return pr.orbitT > 0 ? 1 : 2;
    }
  }
  if (D.grease && pr.homing > 0) {
    pr.homing = 0; pr.tgt = null;
    const a = Math.atan2(pr.vy, pr.vx) + (Math.random() < 0.5 ? 1 : -1) * 0.9, sp = Math.hypot(pr.vx, pr.vy);
    pr.vx = Math.cos(a) * sp; pr.vy = Math.sin(a) * sp;
    if (!(e.slipT > G.realT)) { e.slipT = G.realT + 1; floatText(e.x, e.y - e.r - 10, 'SLIPPED OFF', XR.dim, 11, 0.7); }
    return 1;
  }
  if (D.clot && pr.pierce > 0 && !(e.thinT > G.t)) { // (THINNED by Blood: chem.js)
    pr.pierce = 0; if (!(e.slipT > G.realT)) { e.slipT = G.realT + 1; floatText(e.x, e.y - e.r - 10, 'CLOTTED', XR.dim, 11, 0.7); } }
  return 0;
}

// Player modifiers.
const foes2Speed = () => !G ? 1 : (G.tangleT > G.t ? 0.5 : 1) * (1 - Math.min(0.2, 0.05 * (G.bogeyN || 0)));
const foes2HurtMul = ent => (G.complT > G.t && !(ent && (ent.boss || ent.bossDef)) ? 1.25 : 1);

// From update.
function foes2Tick(dt) {
  if (!G || G.state !== 'play') return;
  if (!(G.f2syncT > G.t)) {
    G.f2syncT = G.t + 1;
    const N = {};
    for (const e of G.enemies) if (!e.dead && e.capd) N[e.capd] = (N[e.capd] || 0) + 1;
    G.typeN = N;
    // The Litmus Cell's paper: whichever damage type you have dealt most this run (not before 200 of it).
    let top = null, best = 200;
    for (const k in (G.f2el || {})) if (G.f2el[k] > best) { best = G.f2el[k]; top = k; }
    G.f2top = top; ENEMIES.litmus.resist = top ? { [top]: 0.35 } : {};
  }
  let bog = 0;
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (e.plasT > G.t && e.def.shoot && !e.boss) e.shootCd -= dt * 0.4; // (40% faster: Plasma Cell)
    const fast = e.cortT > G.t && !e.boss;
    if (fast && !e.cortOn) { e.cortOn = true; e.speed *= 1.3; } else if (!fast && e.cortOn) { e.cortOn = false; e.speed /= 1.3; }
    if (e.stuck) bog++;
  }
  G.bogeyN = bog;
}

// ---------------------------------------------------------------- behaviour
// Support cells hang back at 200 to 320 and circle.
function f2keep(e, dist, ux, uy) {
  if (dist < 200) return { x: -ux, y: -uy };
  if (dist > 320) return { x: ux, y: uy };
  return { x: -uy * e.side, y: ux * e.side };
}
function f2aura(e, dt, r, fn) {
  e.auT = (e.auT || 0) - dt;
  if (e.auT > 0) return;
  e.auT = 0.25;
  forNear(e.x, e.y, r, o => { if (o !== e && !o.boss && !o.charmed && !o.rival && !o.egg) fn(o); });
}
Object.assign(FOE_AI, {
  mirror(e, dt, dist, ux, uy) {
    // Turns its polished front to you, but not quickly: get round the side.
    const want = Math.atan2(uy, ux);
    if (e.mface == null) e.mface = want;
    e.mface += clamp(angDiff(want, e.mface), -1.5 * dt, 1.5 * dt);
    return null;
  },
  leech(e, dt, dist, ux, uy) {
    e.drainOn = dist < 120;
    if (e.drainOn && G.stam) {
      G.stam.cur = Math.max(0, G.stam.cur - 10 * dt); G.stam.restT = Math.max(G.stam.restT, 0.3);
      f2msg(e, 'STAMINA DRAINED', '#9ef0ff', 6);
    }
    if (dist < 70) return { x: -uy * e.side, y: ux * e.side };
    return null;
  },
  plasma(e, dt, dist, ux, uy) { f2aura(e, dt, 200, o => { if (o.def.shoot) o.plasT = G.t + 0.6; }); return f2keep(e, dist, ux, uy); },
  interferon(e, dt, dist, ux, uy) {
    e.ifnT = (e.ifnT == null ? 1 : e.ifnT) - dt;
    if (e.ifnT <= 0) {
      e.ifnT = 4; const amt = 30 * hpNow();
      forNear(e.x, e.y, 170, o => { if (o !== e && !o.boss && !o.charmed && !o.rival && !o.egg && o.def !== e.def) o.ifn = Math.max(o.ifn || 0, amt); });
      e.pulseRT = G.realT;
    }
    return f2keep(e, dist, ux, uy);
  },
  cortisol(e, dt, dist, ux, uy) { f2aura(e, dt, 180, o => { o.cortT = G.t + 0.6; }); return f2keep(e, dist, ux, uy); },
  fibrin(e, dt, dist, ux, uy) {
    e.tT = (e.tT || 0) - dt;
    if (e.tT <= 0) {
      e.tT = 0.3; const L = [];
      forNear(e.x, e.y, 200, (o, d2) => { if (o !== e && !o.boss && !o.charmed && !o.rival && !o.egg && !o.def.support) L.push([d2, o]); });
      L.sort((a, b) => a[0] - b[0]);
      e.teth = L.slice(0, 4).map(x => x[1]);
      for (const o of e.teth) o.tethT = G.t + 0.5;
    }
    return f2keep(e, dist, ux, uy);
  },
  complement(e, dt, dist, ux, uy) {
    // Closes to about 200, and after 1.5 s within 240 it tags you for 5 s.
    e.cmT = dist < 240 ? (e.cmT || 0) + dt : 0;
    if (e.cmT > 1.5 && !(e.cmCd > G.t)) {
      e.cmCd = G.t + 6; e.cmT = 0; G.complT = G.t + 5;
      const p = me(); floatText(p.x, p.y - 30, 'MARKED', '#ffafcc', 13, 1); ring(p.x, p.y, 30, '#ffafcc', 0.4, 2);
    }
    if (dist < 170) return { x: -uy * e.side, y: ux * e.side };
    return null;
  },
  stem(e, dt, dist, ux, uy) {
    e.stemT = (e.stemT == null ? 6 : e.stemT) - dt;
    if (e.stemT <= 0 && G.f2dead && G.f2dead.length) {
      let best = -1;
      for (let i = G.f2dead.length - 1; i >= 0; i--) { const c = G.f2dead[i]; if (G.t - c.t < 30 && Math.hypot(c.x - e.x, c.y - e.y) < 340 && foeRoom(c.def)) { best = i; break; } }
      if (best >= 0) {
        const c = G.f2dead.splice(best, 1)[0], z = f2spawn(c.def, c.x, c.y, { revived: true });
        if (z) { z.xp *= 0.5; spawnPart(c.x, c.y, '#caffbf', 8, 90, 0.5, 3); f2msg(z, 'BACK AGAIN', '#caffbf', 3); }
        e.stemT = 10;
      } else e.stemT = 1;
    }
    return f2keep(e, dist, ux, uy);
  },
  tadpole(e, dt, dist, ux, uy) {
    // Wanders about asking for directions; drifts over to you for a chat.
    if (dist < 260 && Math.random() < dt * 0.25) f2msg(e, pick(F2_SAY), '#e0e6e0', 5);
    const w = Math.sin(e.age * 1.3 + e.id) * 1.6;
    if (dist < 90) return { x: -uy * e.side, y: ux * e.side };
    return { x: ux * Math.cos(w) - uy * Math.sin(w), y: uy * Math.cos(w) + ux * Math.sin(w) };
  },
  pube(e, dt, dist, ux, uy) {
    const p = me();
    if (dist < e.r + p.r + 4 && !(e.tgT > G.t)) { e.tgT = G.t + 3; G.tangleT = G.t + 1; floatText(p.x, p.y - 30, 'TANGLED IN A PUBE', '#cfc7bd', 12, 0.9); }
    const w = Math.sin(e.age * 0.9 + e.id) * 1.2;
    return { x: ux * Math.cos(w) - uy * Math.sin(w), y: uy * Math.cos(w) + ux * Math.sin(w) };
  },
  drift(e, dt, dist, ux, uy) {
    const w = Math.sin(e.age * 0.7 + e.id * 1.3) * 1.1;
    return { x: ux * Math.cos(w) - uy * Math.sin(w), y: uy * Math.cos(w) + ux * Math.sin(w) };
  },
  bogey(e, dt, dist, ux, uy) {
    const p = me();
    if (e.stuck) {
      e.x = p.x + e.stuck.x; e.y = p.y + e.stuck.y; e.kx = 0; e.ky = 0;
      return { x: 0, y: 0, s: 0 };
    }
    if (dist < e.r + p.r + 2) {
      const a = Math.atan2(-uy, -ux), d = p.r + e.r * 0.4;
      e.stuck = { x: Math.cos(a) * d, y: Math.sin(a) * d };
      f2msg(e, 'STUCK ON YOU', '#c5d88a', 3);
      return { x: 0, y: 0, s: 0 };
    }
    return null;
  },
});

// ---------------------------------------------------------------- drawing (STYLE.md: soft waxy edges, no rings)
// A soft organic outline, its own lumps per instance, breathing slowly.
// (Point lists are reused, one per length, so drawing a crowd makes no garbage.)
const F2BUF = {};
const f2pts = n => { let P = F2BUF[n]; if (!P) { P = F2BUF[n] = []; for (let i = 0; i < n; i++) P.push([0, 0]); } return P; };
function f2blob(x, y, r, n, amp, seed, t) {
  const P = f2pts(n);
  for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + amp * (0.6 * Math.sin(i * 2.3 + seed) + 0.4 * Math.sin(a * 3 + t + seed))); P[i][0] = x + Math.cos(a) * rr; P[i][1] = y + Math.sin(a) * rr; }
  ctx.beginPath(); smoothPts(P); ctx.closePath();
}
const f2t = e => G.realT * 1.4 + e.id;
Object.assign(MICROBES, {
  litmus(e, x, y, r) {
    f2blob(x, y, r, 14, 0.06, e.id, f2t(e)); ctx.fillStyle = mBody(e, 0.42); ctx.fill(); mHalo(r * 0.13);
    // A strip of indicator paper inside: half dipped, the dipped end the colour of what it resists.
    const top = G.f2top, a = e.id * 0.7 + Math.sin(G.realT * 0.6 + e.id) * 0.2, c = Math.cos(a), s = Math.sin(a);
    const pt = (u, v) => [x + u * c - v * s, y + u * s + v * c], L = r * 0.62, Wd = r * 0.2;
    ctx.beginPath(); roundPts([pt(-L, -Wd), pt(0, -Wd), pt(0, Wd), pt(-L, Wd)], Wd * 0.5); ctx.closePath(); ctx.fillStyle = 'rgba(236,232,220,0.85)'; ctx.fill();
    ctx.beginPath(); roundPts([pt(0, -Wd), pt(L, -Wd), pt(L, Wd), pt(0, Wd)], Wd * 0.5); ctx.closePath();
    ctx.fillStyle = top && ELEMENTS[top] && top !== 'phys' ? ELEMENTS[top].color : top === 'phys' ? '#f4f6fa' : 'rgba(150,150,150,0.8)'; ctx.fill();
  },
  mirror(e, x, y, r, face) {
    const fa = e.mface != null ? e.mface : face;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.86, fa, 0, TAU); ctx.fillStyle = mBody(e, 0.4); ctx.fill(); mHalo(r * 0.12);
    // The polished front: a bright curved band, with a highlight sliding across it.
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(236,242,248,0.9)'; ctx.lineWidth = Math.max(2, r * 0.3);
    ctx.beginPath(); ctx.arc(x, y, r * 0.98, fa - 1.05, fa + 1.05); ctx.stroke();
    const gl = Math.sin(G.realT * 1.7 + e.id) * 0.7, hot = G.realT - (e.glintRT || -9) < 0.2;
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * (hot ? 0.3 : 0.12));
    ctx.beginPath(); ctx.arc(x, y, r * 0.98, fa + gl - 0.2, fa + gl + 0.2); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = 'rgba(30,36,32,0.4)'; ctx.beginPath(); ctx.arc(x - Math.cos(fa) * r * 0.3, y - Math.sin(fa) * r * 0.3, r * 0.22, 0, TAU); ctx.fill();
  },
  shell(e, x, y, r, face) {
    // A soft body peeking out of the front, then the ridged shell over it.
    ctx.beginPath(); ctx.ellipse(x + Math.cos(face) * r * 0.55, y + Math.sin(face) * r * 0.55, r * 0.5, r * 0.36, face, 0, TAU); ctx.fillStyle = mBody(e, 0.34); ctx.fill(); mHalo(r * 0.08);
    f2blob(x, y, r * 1.02, 16, 0.04, e.id, f2t(e) * 0.3); ctx.fillStyle = mBody(e, 0.55); ctx.fill(); mHalo(r * 0.16);
    const a0 = e.id * 1.1 + e.age * 0.15;
    ctx.strokeStyle = 'rgba(30,36,32,0.35)'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.beginPath();
    for (let i = 1; i <= 3; i++) { const rr = r * (0.25 * i); ctx.moveTo(x + Math.cos(a0) * rr, y + Math.sin(a0) * rr); ctx.arc(x, y, rr, a0, a0 + TAU * 0.8); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.4, r * 0.4, r * 0.14, -0.4, 0, TAU); ctx.fill();
  },
  puffball(e, x, y, r) {
    const sw = 1 + 0.05 * Math.sin(G.realT * 2 + e.id);
    f2blob(x, y, r * sw, 18, 0.05, e.id, f2t(e)); ctx.fillStyle = mBody(e, 0.42); ctx.fill(); mHalo(r * 0.12);
    ctx.fillStyle = 'rgba(30,36,32,0.38)'; ctx.beginPath();
    for (let i = 0; i < 9; i++) { const a = i * 2.39 + e.id, d = r * 0.75 * Math.sqrt((i * 0.618 + 0.1) % 1), pr = r * 0.07; ctx.moveTo(x + Math.cos(a) * d + pr, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, pr, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.25, 0, TAU); ctx.fill();
    const k = G.realT - (e.puffRT || -9);
    if (k < 0.8) { // a soft puff of spores
      ctx.fillStyle = `rgba(236,226,192,${0.5 * (1 - k / 0.8)})`; ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = i * 0.8 + e.id, d = r * (1 + k * 1.6), pr = r * 0.12; ctx.moveTo(x + Math.cos(a) * d + pr, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, pr, 0, TAU); }
      ctx.fill();
    }
  },
  spore(e, x, y, r) {
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.1, r * 0.8, e.id + e.age, 0, TAU); ctx.fillStyle = mBody(e, 0.48); ctx.fill(); mHalo(r * 0.16);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(x, y, r * 0.3, 0, TAU); ctx.fill();
  },
  grease(e, x, y, r) {
    f2blob(x, y, r, 14, 0.09, e.id, G.realT * 3 + e.id); ctx.fillStyle = mBody(e, 0.32); ctx.fill(); mHalo(r * 0.1);
    // An oily film: thin interference bands sliding over the top.
    const t = G.realT * 0.8 + e.id;
    ctx.lineWidth = Math.max(1, r * 0.12);
    ctx.strokeStyle = 'rgba(200,182,255,0.45)'; ctx.beginPath(); ctx.arc(x + Math.sin(t) * r * 0.1, y, r * 0.62, t, t + 2.2); ctx.stroke();
    ctx.strokeStyle = 'rgba(159,212,230,0.4)'; ctx.beginPath(); ctx.arc(x, y + Math.cos(t) * r * 0.1, r * 0.45, -t, -t + 1.8); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.38, r * 0.3, r * 0.12, -0.5, 0, TAU); ctx.fill();
  },
  leech(e, x, y, r, face) {
    if (e.drainOn && G.player) {
      // A faint wavering thread of your stamina, drawn off to it.
      const px = sx(G.player.x), py = sy(G.player.y), mx = (px + x) / 2 + Math.sin(G.realT * 5) * 8, my = (py + y) / 2 + Math.cos(G.realT * 4) * 8;
      ctx.strokeStyle = 'rgba(158,240,255,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo(mx, my, x, y); ctx.stroke();
    }
    const sq = 1 + 0.15 * Math.sin(e.age * 5 + e.id), c = Math.cos(face), s = Math.sin(face);
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.5 * sq, r * 0.55 / sq, face, 0, TAU); ctx.fillStyle = mBody(e, 0.38); ctx.fill(); mHalo(r * 0.1);
    ctx.strokeStyle = 'rgba(30,36,32,0.3)'; ctx.lineWidth = Math.max(0.8, r * 0.06); ctx.beginPath();
    for (let i = -2; i <= 2; i++) { const u = i * r * 0.45 * sq, w = r * 0.45 / sq; ctx.moveTo(x + c * u - s * w, y + s * u + c * w); ctx.quadraticCurveTo(x + c * (u + r * 0.1), y + s * (u + r * 0.1), x + c * u + s * w, y + s * u - c * w); }
    ctx.stroke();
    ctx.fillStyle = 'rgba(20,24,22,0.65)'; ctx.beginPath(); ctx.arc(x + c * r * 1.3 * sq, y + s * r * 1.3 * sq, r * 0.2, 0, TAU); ctx.fill();
  },
  platelet(e, x, y, r) {
    // Four or five little discs stuck together.
    const n = 4 + (e.id % 2), t = G.realT * 0.6 + e.id;
    ctx.beginPath();
    for (let i = 0; i < n; i++) { const a = i / n * TAU + e.id, d = r * 0.42, pr = r * (0.5 + 0.06 * Math.sin(t + i)); const cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d; ctx.moveTo(cx + pr, cy); ctx.ellipse(cx, cy, pr, pr * 0.8, a, 0, TAU); }
    ctx.fillStyle = mBody(e, 0.44); ctx.fill(); mHalo(r * 0.1);
    ctx.fillStyle = 'rgba(30,36,32,0.45)'; ctx.beginPath();
    for (let i = 0; i < n; i++) { const a = i / n * TAU + e.id, cx = x + Math.cos(a) * r * 0.42, cy = y + Math.sin(a) * r * 0.42, pr = r * 0.1; ctx.moveTo(cx + pr, cy); ctx.arc(cx, cy, pr, 0, TAU); }
    ctx.fill();
  },
  callus(e, x, y, r) {
    f2blob(x, y, r, 16, 0.08, e.id, e.id); ctx.fillStyle = mBody(e, 0.56); ctx.fill(); mHalo(r * 0.16);
    // Layer on layer of hard skin.
    ctx.strokeStyle = 'rgba(30,36,32,0.25)'; ctx.lineWidth = Math.max(1, r * 0.07);
    f2blob(x + r * 0.05, y + r * 0.05, r * 0.72, 12, 0.1, e.id + 2, e.id); ctx.stroke();
    f2blob(x + r * 0.1, y + r * 0.08, r * 0.42, 10, 0.12, e.id + 4, e.id); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.42, r * 0.38, r * 0.13, -0.4, 0, TAU); ctx.fill();
  },
  plasma(e, x, y, r) {
    ctx.beginPath(); ctx.ellipse(x, y, r * 1.1, r * 0.85, e.id, 0, TAU); ctx.fillStyle = mBody(e, 0.42); ctx.fill(); mHalo(r * 0.12);
    // The eccentric nucleus, its chromatin like a cartwheel, and a pale Golgi beside it.
    const a = e.id, nx = x + Math.cos(a) * r * 0.4, ny = y + Math.sin(a) * r * 0.32, nr = r * 0.42;
    ctx.fillStyle = 'rgba(232,236,234,0.45)'; ctx.beginPath(); ctx.arc(x - Math.cos(a) * r * 0.25, y - Math.sin(a) * r * 0.2, r * 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(30,36,32,0.55)'; ctx.beginPath(); ctx.arc(nx, ny, nr, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(232,236,234,0.45)'; ctx.lineWidth = Math.max(0.8, r * 0.06); ctx.beginPath();
    for (let i = 0; i < 6; i++) { const b = i / 6 * TAU + G.realT * 0.3; ctx.moveTo(nx + Math.cos(b) * nr * 0.2, ny + Math.sin(b) * nr * 0.2); ctx.lineTo(nx + Math.cos(b) * nr * 0.85, ny + Math.sin(b) * nr * 0.85); }
    ctx.stroke();
  },
  interferon(e, x, y, r) {
    const P = f2pts(18), rot = e.age * 0.5 + e.id;
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, rr = r * (0.78 + 0.24 * Math.cos(3 * a + rot)); P[i][0] = x + Math.cos(a) * rr; P[i][1] = y + Math.sin(a) * rr; }
    ctx.beginPath(); smoothPts(P); ctx.closePath();
    // A soft signal glow that swells after each pulse (a wide faint stroke, not a ring).
    const k = Math.max(0, 1 - (G.realT - (e.pulseRT || -9)) / 0.8);
    ctx.strokeStyle = `rgba(255,255,255,${0.08 + 0.2 * k})`; ctx.lineWidth = r * (0.4 + 0.5 * k); ctx.stroke();
    ctx.fillStyle = mBody(e, 0.4); ctx.fill(); mHalo(r * 0.12);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(x, y, r * 0.22, 0, TAU); ctx.fill();
  },
  cortisol(e, x, y, r) {
    // A puff: overlapping soft lobes, with the steroid's four fused rings inside.
    ctx.beginPath();
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + e.id, d = r * 0.4, pr = r * (0.58 + 0.06 * Math.sin(G.realT * 2 + i)); ctx.moveTo(x + Math.cos(a) * d + pr, y + Math.sin(a) * d); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, pr, 0, TAU); }
    ctx.fillStyle = mBody(e, 0.36); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.stroke();
    ctx.strokeStyle = 'rgba(30,36,32,0.45)'; ctx.lineWidth = Math.max(0.8, r * 0.06); ctx.beginPath();
    const hr = r * 0.2, a0 = e.id * 0.5;
    for (let j = 0; j < 4; j++) {
      const cx = x + Math.cos(a0) * (j - 1.5) * hr * 1.6, cy = y + Math.sin(a0) * (j - 1.5) * hr * 1.6 + (j % 2 ? hr * 0.5 : 0), n = j === 3 ? 5 : 6, P = [];
      for (let i = 0; i < n; i++) { const b = i / n * TAU + 0.5; P.push([cx + Math.cos(b) * hr, cy + Math.sin(b) * hr]); }
      roundPts(P, hr * 0.3); ctx.closePath();
    }
    ctx.stroke();
  },
  fibrin(e, x, y, r) {
    // Sticky threads to everything it has tethered: one path, sagging a little.
    if (e.teth && e.teth.length) {
      ctx.strokeStyle = 'rgba(240,234,222,0.45)'; ctx.lineWidth = 1.2; ctx.beginPath();
      for (const o of e.teth) { if (o.dead) continue; const ox = sx(o.x), oy = sy(o.y), sag = Math.sin(G.realT * 2 + o.id) * 10; ctx.moveTo(x, y); ctx.quadraticCurveTo((x + ox) / 2 + sag, (y + oy) / 2 + 12, ox, oy); }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(240,234,222,0.55)'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.beginPath();
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + e.id, w = Math.sin(G.realT * 1.5 + i) * 0.3, L = r * 1.5; ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a + w) * L * 0.6, y + Math.sin(a + w) * L * 0.6, x + Math.cos(a) * L, y + Math.sin(a) * L); }
    ctx.stroke();
    f2blob(x, y, r * 0.75, 12, 0.07, e.id, f2t(e)); ctx.fillStyle = mBody(e, 0.42); ctx.fill(); mHalo(r * 0.1);
    ctx.fillStyle = 'rgba(30,36,32,0.5)'; ctx.beginPath(); ctx.arc(x, y, r * 0.22, 0, TAU); ctx.fill();
  },
  complement(e, x, y, r, face) {
    // A short curled chain of protein beads.
    ctx.beginPath();
    for (let i = 0; i < 5; i++) { const a = face + Math.PI + (i - 2) * 0.8 + Math.sin(G.realT * 2 + i + e.id) * 0.15, d = r * 0.55, bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d, br = r * (0.48 - i * 0.04); ctx.moveTo(bx + br, by); ctx.arc(bx, by, br, 0, TAU); }
    ctx.fillStyle = mBody(e, 0.42); ctx.fill(); mHalo(r * 0.1);
    // Your mark: little beads circling you while it lasts (drawn once a frame, by whichever Complement gets there first).
    if (G.complT > G.t && G.player && G.f2markF !== G.frameN) {
      G.f2markF = G.frameN;
      const px = sx(G.player.x), py = sy(G.player.y), pr = (G.player.r + 10) * S;
      ctx.fillStyle = '#ffafcc'; ctx.beginPath();
      for (let i = 0; i < 5; i++) { const a = G.realT * 2 + i / 5 * TAU, bx = px + Math.cos(a) * pr, by = py + Math.sin(a) * pr; ctx.moveTo(bx + 2.5, by); ctx.arc(bx, by, 2.5, 0, TAU); }
      ctx.fill();
    }
  },
  stem(e, x, y, r) {
    // A plain round cell with a big nucleus, and a bud swelling as its next revival nears.
    const ripe = 1 - clamp((e.stemT == null ? 6 : e.stemT) / 10, 0, 1), ba = e.id + G.realT * 0.2;
    ctx.beginPath(); ctx.arc(x + Math.cos(ba) * r, y + Math.sin(ba) * r, r * (0.15 + 0.3 * ripe), 0, TAU); ctx.fillStyle = mBody(e, 0.45); ctx.fill(); mHalo(r * 0.08);
    f2blob(x, y, r, 14, 0.03, e.id, f2t(e)); ctx.fillStyle = mBody(e, 0.42); ctx.fill(); mHalo(r * 0.12);
    ctx.fillStyle = 'rgba(232,236,234,0.45)'; ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(30,36,32,0.55)'; ctx.beginPath(); ctx.arc(x + r * 0.12, y - r * 0.08, r * 0.16, 0, TAU); ctx.fill();
  },
  tadpole(e, x, y, r) {
    const fa = Math.hypot(e.svx || 0, e.svy || 0) > 1 ? Math.atan2(e.svy, e.svx) : e.id, c = Math.cos(fa), s = Math.sin(fa);
    ctx.strokeStyle = mBody(e, 0.3); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y);
    for (let i = 1; i <= 6; i++) { const u = -r * 0.5 * i, w = Math.sin(e.age * 9 - i * 0.9) * r * 0.12 * i; ctx.lineTo(x + c * u - s * w, y + s * u + c * w); }
    ctx.lineWidth = Math.max(1, r * 0.35); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.8, fa, 0, TAU); ctx.fillStyle = mBody(e, 0.3); ctx.fill(); mHalo(r * 0.12);
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(x + c * r * 0.45 - s * r * 0.3, y + s * r * 0.45 + c * r * 0.3, r * 0.16, 0, TAU); ctx.fill();
  },
  pube(e, x, y, r) {
    // A crinkly curl, gently turning.
    const a0 = e.id + e.age * 0.4, P = [];
    for (let i = 0; i <= 16; i++) { const u = i / 16, a = a0 + u * 5.5, rr = r * (0.3 + 0.9 * u) + Math.sin(u * 40 + e.id) * r * 0.08; P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = Math.max(2, r * 0.32); ctx.stroke();
    ctx.strokeStyle = e.flash > 0 ? '#ffffff' : 'rgb(42,42,42)'; ctx.lineWidth = Math.max(1.2, r * 0.17); ctx.stroke();
    ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  },
  fluff(e, x, y, r) {
    f2blob(x, y, r, 16, 0.14, e.id, G.realT * 0.7 + e.id); ctx.fillStyle = mBody(e, 0.62); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = Math.max(1, r * 0.1); ctx.stroke();
    // Loose fibres sticking out every which way.
    ctx.strokeStyle = 'rgba(70,76,90,0.5)'; ctx.lineWidth = Math.max(0.7, r * 0.05); ctx.beginPath();
    for (let i = 0; i < 14; i++) { const a = i * 2.17 + e.id, d0 = r * (0.3 + 0.5 * ((i * 0.37) % 1)), d1 = d0 + r * 0.5, w = Math.sin(G.realT + i) * 0.2; ctx.moveTo(x + Math.cos(a) * d0, y + Math.sin(a) * d0); ctx.lineTo(x + Math.cos(a + w) * d1, y + Math.sin(a + w) * d1); }
    ctx.stroke();
  },
  bogey(e, x, y, r) {
    const fl = e.stuck ? 0.75 : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(1 / fl, fl);
    f2blob(0, 0, r, 12, 0.11, e.id, G.realT * 1.1 + e.id); ctx.fillStyle = mBody(e, 0.42); ctx.fill(); mHalo(r * 0.1);
    ctx.fillStyle = 'rgba(30,36,32,0.3)'; ctx.beginPath(); ctx.arc(r * 0.25, r * 0.2, r * 0.25, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.35, r * 0.3, r * 0.12, -0.5, 0, TAU); ctx.fill();
    ctx.restore();
  },
  sweetcorn(e, x, y, r) {
    const a = e.id + e.age * 0.4, c = Math.cos(a), s = Math.sin(a), pt = (u, v) => [x + (u * c - v * s) * r, y + (u * s + v * c) * r];
    ctx.beginPath(); roundPts([pt(-0.85, -0.75), pt(0.85, -0.75), pt(0.6, 0.95), pt(-0.6, 0.95)], r * 0.4); ctx.closePath();
    ctx.fillStyle = mBody(e, 0.6); ctx.fill(); mHalo(r * 0.14);
    const [tx, ty] = pt(0, 0.85); ctx.fillStyle = 'rgba(30,36,32,0.45)'; ctx.beginPath(); ctx.arc(tx, ty, r * 0.15, 0, TAU); ctx.fill();
    const [hx, hy] = pt(-0.3, -0.35); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(hx, hy, r * 0.3, r * 0.12, a, 0, TAU); ctx.fill();
  },
  glitter(e, x, y, r) {
    const a = e.id + e.age * 3, P = [];
    for (let i = 0; i < 6; i++) { const b = a + i / 6 * TAU; P.push([x + Math.cos(b) * r, y + Math.sin(b) * r * (0.4 + 0.6 * Math.abs(Math.cos(e.age * 2 + e.id)))]); }
    ctx.beginPath(); roundPts(P, r * 0.2); ctx.closePath(); ctx.fillStyle = mBody(e, 0.62); ctx.fill(); mHalo(r * 0.12);
    // Now and then it catches the light.
    const gl = Math.sin(G.realT * 4 + e.id * 2.7);
    if (gl > 0.7) {
      const k = (gl - 0.7) / 0.3, L = r * (1 + 1.5 * k), g0 = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,255,255,${0.8 * k})`; ctx.lineWidth = 1.2; ctx.beginPath();
      ctx.moveTo(x - L, y); ctx.lineTo(x + L, y); ctx.moveTo(x, y - L); ctx.lineTo(x, y + L); ctx.stroke();
      ctx.globalCompositeOperation = g0;
    }
  },
});
// Buffs from the support cells, drawn on whoever has them (drawEnemy): a soap-film shield, a hint of hurry.
function foes2Fx(e, x, y, r) {
  if (!G || e.boss) return;
  if (e.ifn > 0) {
    const t = G.realT + e.id, g0 = ctx.globalCompositeOperation;
    ctx.globalCompositeOperation = 'lighter'; // (a film of light: shows on the grey slide and in darkfield alike)
    ctx.strokeStyle = 'rgba(189,224,254,0.22)'; ctx.lineWidth = Math.max(2, r * 0.25); ctx.beginPath(); ctx.arc(x, y, r * 1.2, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = Math.max(1, r * 0.08); ctx.beginPath(); ctx.arc(x, y, r * 1.2, t, t + 0.9); ctx.stroke();
    ctx.globalCompositeOperation = g0;
  }
  if (e.cortT > G.t && (e.svx || e.svy)) {
    const a = Math.atan2(e.svy, e.svx) + Math.PI, c = Math.cos(a), s = Math.sin(a);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath();
    for (const o of [-0.5, 0.5]) { const bx = x + c * r - s * o * r, by = y + s * r + c * o * r; ctx.moveTo(bx, by); ctx.lineTo(bx + c * r * 0.8, by + s * r * 0.8); }
    ctx.stroke();
  }
  if (e.plasT > G.t) { ctx.fillStyle = 'rgba(184,192,255,0.7)'; const a = G.realT * 3 + e.id; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 1.15, 2, 0, TAU); ctx.fill(); }
}
