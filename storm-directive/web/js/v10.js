'use strict';
// Spawn Prawn - v10 test build. The combat rework's first slice (spec: ../redesign docs/):
//  - Human Sample 1 (sequence 'human1': no trait, no starting ability) in two modes: wave mode (s002) and
//    regular mode (s001, the race to the egg).
//  - The weapon matrix: 6 attack types x 7 damage types = 42 weapons, built from V10_ATK and V10_NAMES.
//  - The only upgrade is Switched at Birth: one card a wave (the first level-up box; the wave's others are
//    dropped), a swap that keeps the attack type and changes the damage type (Snotgun -> Cinderblast). Every other box is dropped. No Feats, mutations, relics or combos.
//    Regular mode: every level-up and DNA strand is a Switched at Birth card instead.
//  - Fire is a new damage type (internal id 'flame', since 'fire' is Acid): Burning, a short damage over time.
//  - The old automatic reactions are off; each type keeps its own status (chem.js applyElement).
// Old content is still in the code but out of reach. window.V10_OFF = 1 (before load) switches all of this off.
// Hooks: game.js main loop v10Box, genLoot v10Loot, fireWeapon v10Fire, update v10Tick, newGame (no junkStart),
// newStats elem.flame; render.js v10Draw; chem.js applyElement v10Burn and V10 guards; ui.js openSamples v10Samples;
// meta.js storage key sd_meta10.

const V10 = !(typeof window !== 'undefined' && window.V10_OFF);

ELEMENTS.flame = { name: 'Fire', color: TYPE_PAL.flame, status: 'burning', blurb: 'Sets things alight. Burning enemies take damage for a few seconds after the hit. Fire does not make every surface explode.' };

PROFILES.human1 = { name: 'Human Sample 1', trait: 'None', fmt: () => 'no trait', apply: () => {},
  desc: 'One sample, one swimmer, no history. For testing.', weapons: [] };
SEQ_LOOK.human1 = Object.assign({}, SEQ_LOOK.vanguard, { short: 'SAMPLE 1' });

// Attack types: what reaches the enemy and how. Each reuses an engine kind (beam and burst are 'gun' here,
// fired by v10Fire, so every other system treats them as ordinary guns).
const V10_ATK = {
  contact: { label: 'Contact', icon: 'C', kind: 'melee', melee: 'lash', dir: 'nearest',
    base: { dmg: 30, cd: 0.6, mag: 4, reload: 1.0, count: 1, range: 110, area: 1, width: 24, spread: 0.3, knock: 160 } },
  proj: { label: 'Projectile', icon: 'P', kind: 'gun', dir: 'nearest',
    base: { dmg: 16, cd: 0.45, mag: 8, reload: 1.2, count: 1, spread: 0.04, speed: 560, pierce: 0, range: 440, size: 5 } },
  beam: { label: 'Beam', icon: 'B', kind: 'gun', dir: 'nearest',
    base: { dmg: 3.5, cd: 0.1, mag: 30, reload: 1.2, count: 1, spread: 0, speed: 0, pierce: 99, range: 300, size: 5, width: 10 } },
  spread: { label: 'Spread', icon: 'S', kind: 'gun', dir: 'nearest',
    base: { dmg: 6, cd: 0.8, mag: 4, reload: 1.5, count: 7, spread: 0.7, speed: 520, pierce: 0, range: 260, size: 3.5, knock: 30 } },
  burst: { label: 'Burst', icon: 'X', kind: 'gun', dir: 'cluster',
    base: { dmg: 34, cd: 1.1, mag: 3, reload: 1.4, count: 1, spread: 0, speed: 0, pierce: 0, range: 380, size: 5, area: 70, delay: 0.45 } },
  pool: { label: 'Pool', icon: 'O', kind: 'lob', dir: 'cluster',
    base: { dmg: 9, cd: 1.0, mag: 4, reload: 1.6, count: 1, spread: 40, range: 380, area: 58, dur: 3.5, flight: 0.55 } },
};
const V10_ATKS = Object.keys(V10_ATK);
const V10_TYPES = ['phys', 'fire', 'shock', 'ice', 'arcane', 'soul', 'flame'];
const V10_COL = Object.assign({}, TYPE_PAL); // (look10.js)

const V10_NAMES = {
  phys: {
    contact: ['Nutcracker', 'Smacks nearby enemies with enough force to make them reconsider their life choices.'],
    proj: ['Knuckle Dragger', 'Fires a heavy impact shot. Subtlety was never an option.'],
    beam: ['Hard Press', 'Projects a force beam that shoves enemies backwards. Apply pressure. Continue applying pressure.'],
    spread: ['Broadside', 'Fires a fan of blunt impact pellets. A little force goes a long way. A lot goes further.'],
    burst: ['Premature Detonation', 'Releases a shockwave around the impact point. Timing is everything. Apparently.'],
    pool: ['Pressure Drop', 'Creates a field that repeatedly shoves enemies caught inside. Give them some space. Then take it away.'] },
  fire: {
    contact: ['Corrosive Bite', 'Bites nearby enemies and corrodes their defences. A terrible habit. A useful one.'],
    proj: ['Acid Spit', 'Hurls a glob of acid at an enemy. Manners are not a survival strategy.'],
    beam: ['Dissolving Relationship', 'Streams acid into anything unfortunate enough to be in its path. Some bonds are best broken down.'],
    spread: ['Sour Spray', 'Sprays acid droplets across a wide area. A bitter little shower.'],
    burst: ['Caustic Reaction', 'Splashes acid across a small area on impact. The reaction is entirely appropriate.'],
    pool: ['Acid Reflux', 'Leaves a corrosive puddle on the ground. Best not to stand in your own business.'] },
  shock: {
    contact: ['Shock Jab', 'Delivers an electrical shock through direct contact. Touching is not always affectionate.'],
    proj: ['Zap Seed', 'Fires a charged orb that shocks the first enemy it hits. A little spark of potential.'],
    beam: ['Blue Screen', 'Channels electricity along a narrow beam. Everything stops working eventually.'],
    spread: ['Forked Tongue', 'Fires electrical darts across a wide fan. It has several points to make.'],
    burst: ['Power Surge', 'Releases a sudden electrical pulse around the impact point. An entirely normal response to stress.'],
    pool: ['Live Wire', 'Electrifies an area, shocking enemies inside it. The warning label was apparently optional.'] },
  ice: {
    contact: ['Snot Knuckle', 'Smacks nearby enemies with a sticky blow. Keep your hands to yourself. Actually, don\'t.'],
    proj: ['Gobstopper', 'Fires a sticky glob that adheres to its target. It tends to get attached.'],
    beam: ['Snot Stream', 'Sprays a continuous stream of mucus that slows enemies it hits. Difficult to shake.'],
    spread: ['Snotgun', 'Fires a wide fan of sticky globs. A messy solution to a messy problem.'],
    burst: ['Gunk Bomb', 'Splashes mucus across a small area on impact. Cleanup is someone else\'s problem.'],
    pool: ['Sticky Situation', 'Leaves a patch that slows or adheres enemies crossing it. They really should have watched their step.'] },
  arcane: {
    contact: ['Bloodletter', 'Cuts nearby enemies, leaving bleeding wounds. Consider this a formal warning.'],
    proj: ['Red Needle', 'Fires a narrow blood spike at an enemy. Point made.'],
    beam: ['Bloodline', 'Channels a stream of blood damage into enemies along its path. Family resemblance is not required.'],
    spread: ['Bloodshot', 'Fires sharp blood droplets across a wide fan. A rather poor bedside manner.'],
    burst: ['Bloodbath', 'Releases a concentrated burst of blood damage around the target. Things have escalated.'],
    pool: ['Blood Pool', 'Leaves a damaging slick of blood on the ground. Someone will have to mop that up.'] },
  soul: {
    contact: ['Spirit Slap', 'Strikes nearby enemies with a spectral blow. A little soul-searching by force.'],
    proj: ['Ghost Load', 'Fires a slow spirit orb that damages its first target. Something to believe in.'],
    beam: ['Wraith Ray', 'Channels soul energy along a focused beam. Straight through to the other side.'],
    spread: ['Soul Scatter', 'Fires spectral shards across a wide fan. A little piece of you goes a long way.'],
    burst: ['Soul Purpose', 'Releases a spectral shockwave around the impact point. At last, some direction in life.'],
    pool: ['Haunted Ground', 'Creates a spectral field that damages enemies inside it. The dead are not known for respecting boundaries.'] },
  flame: {
    contact: ['Hot Touch', 'Strikes nearby enemies and sets them alight. You should have called first.'],
    proj: ['Hot Shot', 'Fires a fireball that ignites its target. A burning ambition.'],
    beam: ['Flame Jet', 'Projects a continuous stream of fire. It is important to keep things flowing.'],
    spread: ['Cinderblast', 'Fires burning sparks across a wide fan. A brief but meaningful relationship with fire.'],
    burst: ['Firecracker', 'Explodes in a compact burst of flame on impact. A little premature excitement.'],
    pool: ['Burning Ground', 'Leaves a patch of fire that damages enemies inside it. The floor is lava. This is not a drill.'] },
};
// Per-weapon tweaks the descriptions ask for.
const V10_TWEAK = {
  v_soul_proj: { dmg: 22, cd: 0.6, speed: 240, size: 10 }, // Ghost Load: slow, bright, big
  v_flame_proj: { speed: 820, size: 4.5 },                  // Hot Shot: fast
  v_phys_beam: { push: 260 },                               // Hard Press: shoves back
  v_phys_pool: { push: 140 },                               // Pressure Drop: shoves from the middle
};
const v10Id = (t, a) => 'v_' + t + '_' + a;
const v10Atk = id => WEAPONS[id] && WEAPONS[id].v10atk;
const v10Ids = () => V10_TYPES.flatMap(t => V10_ATKS.map(a => v10Id(t, a)));

for (const t of V10_TYPES) for (const a of V10_ATKS) {
  const A = V10_ATK[a], [name, desc] = V10_NAMES[t][a], id = v10Id(t, a);
  const base = Object.assign({}, A.base, V10_TWEAK[id] || {});
  WEAPONS[id] = { name, desc, play: desc, stars: [3, 3, 3, 3], icon: name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    elem: t, kind: A.kind, melee: A.melee, color: V10_COL[t], dir: A.dir, role: A.label, v10: 1, v10atk: a, v10type: t,
    base, lv: {} };
}

// ---------------------------------------------------------------- boxes
// Which boxes open at all (game.js main loop): weapon drafts, and one level-up a wave. Everything else is dropped.
function v10Box(req) {
  if (!V10) return true;
  if (sbOn()) return sbBox(req); // (Sandbox: weapons only, sandbox.js)
  return draftBox(req); // (level-ups, chests, forks and the interruption budget: draft.js)
}
function v10Loot(req) {
  if (sbOn()) { const o = sbLoot(req); if (o) return o; } // (Sandbox: sandbox.js)
  if (req.kind === 'start') { const o = typeof s10Start === 'function' && s10Start(); if (o) return o; } // (a sample starts with its own weapon: samples10.js)
  if (req.kind === 'start') return shuffle(v10Pool()).slice(0, 4).map(id => optNewWeapon(id, 0));
  if (req.kind === 'slot') {
    const own = G.weapons.filter(Boolean), have = new Set(own.map(w => w.def.v10atk));
    let pool = v10Pool().filter(id => !own.some(w => (w.sid || w.id) === id) && !have.has(v10Atk(id)));
    if (!pool.length) pool = v10Pool().filter(id => !own.some(w => (w.sid || w.id) === id));
    return shuffle(pool).slice(0, 3).map(id => optNewWeapon(id, 0));
  }
  { const o = draftLoot(req); if (o) return o; } // (one draft for weapons, Switched at Birth, defences, Feats, mutations; forks: draft.js)
  return null;
}
// Switched at Birth: same attack type, another damage type. One card: a random weapon you own, a random new type.
function v10Switch() {
  const own = G.weapons.map((w, i) => ({ w, i })).filter(o => o.w && o.w.def.v10 && !o.w.def.sig); // (a signature weapon keeps its one damage type)
  const cands = shuffle(own.flatMap(o => V10_TYPES.filter(t => t !== o.w.def.v10type).map(t => ({ o, t }))));
  const out = [], used = new Set();
  for (const c of cands) { if (out.length >= 3) break; if (used.has(c.o.i) && own.length > 1 && out.length < own.length) continue; used.add(c.o.i); out.push(c); }
  for (const c of cands) { if (out.length >= 3) break; if (!out.includes(c)) out.push(c); }
  return out.slice(0, 1).map(({ o, t }) => {
    const nid = v10Id(t, o.w.def.v10atk), def = WEAPONS[nid];
    return { def, rarity: 0, tag: 'SWITCHED AT BIRTH', icon: def.icon, color: def.color, elem: t, title: `${o.w.def.name} → ${def.name}`,
      sub: `${ELEMENTS[t].name} | ${V10_ATK[def.v10atk].label}`, desc: def.desc,
      apply: () => { const i = G.weapons.indexOf(o.w); if (i >= 0) { const n = makeSlot(nid, false, o.w.lvl); n.m10 = o.w.m10; n.wm10 = o.w.wm10; G.weapons[i] = n; setWeaponLevel(n, o.w.lvl, 1); recomputeAll(); /* (keeps its level, modifiers and weapon mutations) */ } } };
  });
}

// ---------------------------------------------------------------- firing (game.js fireWeapon)
function v10Fire(w, target, src) {
  const d = w.def, s = w.s, p = G.player;
  if (d.sig) return d.sigFire ? d.sigFire(w, target, src) !== false : false; // (signature weapons: sigweap.js)
  if (d.v10atk === 'beam') {
    let a = Math.atan2(target.y - p.y, target.x - p.x), L = s.range, wd = s.width || 10, bk = 1;
    if (w.m10) ({ a, L, wd, bk } = modBeam(w, a, L, wd)); // (v10 modifiers, modifiers.js)
    const ex = p.x + Math.cos(a) * L, ey = p.y + Math.sin(a) * L;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const t = Math.max(0, Math.min(L, (e.x - p.x) * Math.cos(a) + (e.y - p.y) * Math.sin(a)));
      if (Math.hypot(e.x - (p.x + Math.cos(a) * t), e.y - (p.y + Math.sin(a) * t)) > e.r + wd) continue;
      damageEnemy(e, s.dmg * bk, src);
      if (s.push && !e.dead && !e.boss) { e.kx += Math.cos(a) * s.push * 0.1; e.ky += Math.sin(a) * s.push * 0.1; }
    }
    (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: p.x, y: p.y, x2: ex, y2: ey, w: wd, c: d.color, t: d.v10type, life: 0.12, max: 0.12 });
    return true;
  }
  if (d.v10atk === 'burst') {
    const tx = target.x, ty = target.y;
    G.fx.push({ type: 'warn', x: tx, y: ty, r: s.area, color: d.color, life: s.delay, max: s.delay });
    after(s.delay, () => { aoe(tx, ty, s.area, s.dmg, src, d.color); ring(tx, ty, s.area, d.color, 0.35, 4); fxParts('spark', tx, ty, d.color, 12, 160, 0.45, 3); if (w.m10) modBurstEnd(w, tx, ty); });
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- Fire: Burning (chem.js applyElement)
function v10Burn(e, dmg, src) {
  e.v10burn = 3;
  e.v10bdps = Math.max((e.v10bdps || 0) * 0.8, dmg * 0.35);
  e.v10bBy = dotName(src);
}
function v10Tick(dt) {
  if (!V10 || !G) return;
  fightTick(dt); // (defences, charged patches: fight.js)
  wupTick(dt); // (weapon branches: weapons24.js)
  if (typeof vxTick === 'function') vxTick(dt); // (the two voices: voice10.js)
  if (typeof s10Tick === 'function') s10Tick(dt); // (sample passives and unlocks: samples10.js)
  mutTick(dt); // (mutation cards: mutations.js)
  f10Tick(dt); // (Feats: feats10.js)
  sigwTick(dt); // (signature weapons: sigweap.js)
  pdefTick(dt); // (your Membrane and Shell: pdef.js)
  for (const e of G.enemies) {
    if (!(e.v10burn > 0) || e.dead) continue;
    e.v10burn -= dt;
    damageEnemy(e, e.v10bdps * dt, { elem: 'flame', dot: true, noCrit: true, noStatus: true, noArc: true, wname: (e.v10bBy || '?') + ' (burning)' });
    if (Math.random() < dt * 8) fxParts('ember', e.x + rand(-e.r, e.r), e.y + rand(-e.r, e.r) * 0.5, ELEMENTS.flame.color, 1, 30, 0.5, 2.5, -Math.PI / 2, 0.6);
    if (e.v10burn <= 0) e.v10bdps = 0;
  }
  // Pressure Drop: its puddles push outwards instead of pulling.
  for (const z of G.zones) if (!z.v10 && z.src && z.src.w && z.src.w.def && z.src.w.def.v10) { z.v10 = 1; if (z.src.w.s.push) z.pull = -z.src.w.s.push; }
  modTick(dt); // (v10 modifiers, modifiers.js)
  if (G.v10fx) { for (const f of G.v10fx) f.life -= dt; G.v10fx = G.v10fx.filter(f => f.life > 0); }
}

// ---------------------------------------------------------------- drawing (render.js, world space)
function v10Draw() {
  if (G && V10) { fightDraw(); pdefDraw(); mutDraw(); f10Draw(); sigDraw(); } // (defence rings, status marks: fight.js; yours: pdef.js; mutations; Feats: feats10.js; signature weapons: sigweap.js)
  if (G && V10) nf10Draw(); // (telegraphs, wax, trails: newfoes.js)
  if (G && V10) modDraw(); // (v10 modifiers, modifiers.js)
  if (!G || !G.v10fx) return;
  for (const f of G.v10fx) {
    const k = f.life / f.max, x1 = sx(f.x), y1 = sy(f.y), x2 = sx(f.x2), y2 = sy(f.y2);
    ctx.save(); ctx.strokeStyle = col(f.c); ctx.lineCap = 'round';
    ctx.globalAlpha = 0.25 * k; ctx.lineWidth = f.w * 2 * S; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.globalAlpha = 0.9 * k; ctx.lineWidth = Math.max(1.5, f.w * 0.5 * S); ctx.beginPath(); ctx.moveTo(x1, y1);
    if (f.t === 'shock') { // Static jitters; the rest flow
      const n = 9, dx = (x2 - x1) / n, dy = (y2 - y1) / n, L = Math.hypot(dx, dy) || 1;
      for (let i = 1; i < n; i++) { const j = rand(-1, 1) * 7 * S; ctx.lineTo(x1 + dx * i - dy / L * j, y1 + dy * i + dx / L * j); }
    }
    ctx.lineTo(x2, y2); ctx.stroke(); ctx.restore();
  }
}

// ---------------------------------------------------------------- the samples screen (ui.js openSamples)
function v10Samples() {
  if (typeof s10Samples === 'function' && s10Samples()) return; // (the eight samples: samples10.js)
  let dev = false; try { dev = localStorage.getItem('sd_dev') === '1'; } catch (e) { /* storage unavailable */ }
  const card = (id, no, name, desc, c, tag) => `<button class="sx-card hero" data-v10="${id}" style="--c:${c}"><span class="sx-txt"><i>#${no} | IN STOCK</i><b>${esc(name)}</b><span>${esc(desc)}</span><em>${tag}</em></span></button>`;
  $('sampleList').innerHTML = `<div class="sx-h">HUMAN SAMPLE 1</div>${card('s002', '001', 'Wave Mode', 'Twenty drops into the dish, a boss every fifth. One Switched at Birth card a wave.', '#5fd4e8', 'WAVE MODE')}`
    + card('s001', '001', 'Regular Mode', 'Four hundred million hopefuls, one egg. Every level-up and DNA strand is a Switched at Birth card.', '#ffd6e8', 'RACE TO THE EGG')
    + (dev ? `<div class="sx-h">DEVELOPER</div>${card('s000', '000', 'Lab Bench (Debug)', 'Spawn anything, god mode.', '#9fb3c8', 'DEBUG')}` : '');
  $('sampleList').querySelectorAll('[data-v10]').forEach(b => b.addEventListener('click', () => {
    UI.sample = b.dataset.v10; META.profile = 'human1'; saveMeta(); UI.startGame(true);
  }));
  UI.show('samples');
}
