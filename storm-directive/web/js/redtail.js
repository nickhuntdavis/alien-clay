'use strict';
// Spawn Prawn - The Redtail, the tenth sequence (Reece's idea). Bred for luck, from a very small family tree.
// Level-up boxes roll luckier, but every level up brings a little bane. Its own kit: Shotgun Wedding (a
// double-barrelled blunderbuss), Moonshine Jug (lobbed jugs of homebrew) and Duelling Banjo (rings of notes), two
// upgrades that only turn up while it's in your genome, and the ability Sister-Cousin.
// Hooks: redFire (fireWeapon), redLand (landLob), redLevel (gainXp), redHurt (hurtPlayer), redTick (update),
// redDraw (render), redDmgMul (damageEnemy), redHaste (weapon fire rate), redLoot (genLoot).

const RED = { color: '#e85d04' };
Object.assign(WEAPONS, {
  wedding: { name: 'Shotgun Wedding', stars: [4, 2, 1, 4], play: 'A double-barrelled blunderbuss: two blasts of pellets, then a reload. Every third blast is both barrels at once, with double the pellets and a kick that sends things flying. Pellets that miss bounce once to the nearest relative.', icon: 'SW', elem: 'phys', kind: 'gun', color: '#ffb703', dir: 'nearest', role: 'Brawler', redtail: 1, seqOnly: 'redtail',
    desc: 'Something old, something new, something double-barrelled.',
    base: { dmg: 6, cd: 0.55, mag: 2, reload: 1.3, count: 7, spread: 0.6, speed: 520, pierce: 0, range: 300, size: 3.5, knock: 90, bounce: 1 },
    lv: { 3: { count: 2 }, 6: { dmg: 0.3 }, 9: { count: 2 } }, sig: { 5: ['rtrice', 'rtboth'], 10: ['rtreception', 'rtelope'] } },
  moonshine: { name: 'Moonshine Jug', stars: [4, 2, 3, 4], play: 'Lobs a jug of homebrew that bursts into a boozy puddle. One jug in six is a bad batch and goes up in a much bigger blast.', icon: 'MJ', elem: 'poison', kind: 'lob', color: '#f48c06', dir: 'cluster', role: 'Firebomber', redtail: 1, seqOnly: 'redtail',
    desc: 'Grandpappy\'s recipe. Do not drink. Do not stand near.',
    base: { dmg: 15, cd: 1.2, mag: 3, reload: 2.0, count: 1, spread: 40, range: 380, area: 70, explode: 1, dur: 2.4, flight: 0.65 },
    lv: { 3: { dur: 0.5 }, 6: { count: 1 }, 9: { area: 0.35 } }, sig: { 5: ['rtproof', 'rtstill'], 10: ['rtbadbatch', 'rthooch'] } },
  banjo: { name: 'Duelling Banjo', stars: [3, 3, 2, 4], play: 'Twangs a ring of notes all around you. The rings alternate: high notes fly fast and far, low notes are slow, wide and hit hard.', icon: 'DB', elem: 'shock', kind: 'ring', color: '#ffd166', dir: 'nearest', role: 'Ring', redtail: 1, seqOnly: 'redtail',
    desc: 'Only knows one song. Plays it with feeling.',
    base: { dmg: 12, cd: 1.3, mag: 3, reload: 1.6, count: 10, speed: 320, pierce: 2, range: 240, size: 4 },
    lv: { 3: { count: 4 }, 6: { dmg: 0.4 }, 9: { pierce: 2 } }, sig: { 5: ['rtpick', 'rtduel'], 10: ['rthoedown', 'rtencore'] } },
});
Object.assign(SIGS, {
  rtrice: { name: 'Throwing Rice', desc: 'Every blast also scatters a ring of 8 grains of rice all around you at 40% damage.' },
  rtboth: { name: 'Both Barrels, Always', desc: 'Every blast is both barrels: double the pellets, but 30% slower to fire.' },
  rtreception: { name: 'The Reception', desc: 'Mastery. Every fourth blast fires a full ring of pellets all around you as well.' },
  rtelope: { name: 'Elope', desc: 'Mastery. Every reload, you dash forward and nothing can hurt you for half a second.' },
  rtproof: { name: '200 Proof', desc: 'Puddles last 50% longer and spread 25% wider.' },
  rtstill: { name: 'Backyard Still', desc: 'Every third jug lands as three jugs.' },
  rtbadbatch: { name: 'Every Batch Is Bad', desc: 'Mastery. Every jug is a bad batch.' },
  rthooch: { name: 'Hooch Hour', desc: 'Mastery. Standing in your own puddles heals you 2% of your max HP a second. You are used to it.' },
  rtpick: { name: 'Fingerpicking', desc: '+6 notes in every ring.' },
  rtduel: { name: 'Duelling', desc: 'Every ring is answered a moment later by a second ring: from your Sister-Cousin if she is out, otherwise from you.' },
  rthoedown: { name: 'Hoedown', desc: 'Mastery. Low notes knock enemies back hard and leave them dazed for a moment.' },
  rtencore: { name: 'Bluegrass Encore', desc: 'Mastery. Every third ring plays both notes at once.' },
});
Object.assign(PASSIVES, {
  moonshinep: { name: 'Homebrew', icon: 'HB', max: 4, v: 0.08, seq: 'redtail', fmt: v => `+${pc(v)} fire rate and +${pc(v)} damage, -${pc(v / 4)} swim speed`, apply: (P, v) => { P.haste += v; P.might += v; P.speed -= v / 4; } },
  thickskin: { name: 'Thick as Thieves', icon: 'TT', max: 3, v: 2, seq: 'redtail', fmt: v => `+${v} armour and +${pc(v * 0.03)} luck`, apply: (P, v) => { P.armour += v; P.luck += v * 0.03; } },
});
if (typeof ICON_OF !== 'undefined') Object.assign(ICON_OF, { wedding: 'shotgun', moonshine: 'jug', banjo: 'banjo' });
if (typeof IC !== 'undefined') Object.assign(IC, {
  jug: '<path d="M9 3h6v3l2 3v10a2 2 0 01-2 2H9a2 2 0 01-2-2V9l2-3z"/><path d="M17 10h2a2 2 0 010 4h-2"/><path d="M9.5 13h5"/>',
  banjo: '<circle cx="8" cy="16" r="5"/><path d="M11.5 12.5L20 4"/><path d="M18 3l3 3"/><circle cx="8" cy="16" r="1.5"/>',
});

// ================================================================ the sequence
const BANES = [
  { id: 'webtoes', name: 'Webbed Toes', desc: '-3% swim speed', apply: P => { P.speed -= 0.03; } },
  { id: 'lazyeye', name: 'Lazy Eye', desc: '-2% crit chance', apply: P => { P.crit -= 0.02; } },
  { id: 'nipple', name: 'Third Nipple', desc: '-4 max HP', apply: P => { P.maxHp = Math.max(60, P.maxHp - 4); } },
  { id: 'wreath', name: 'Family Wreath', desc: '-3% reload speed', apply: P => { P.reloadSpd -= 0.03; } },
  { id: 'banjoears', name: 'Banjo Ears', desc: '-5% pickup range', apply: P => { P.magnet -= 0.05; } },
  { id: 'sixtoes', name: 'Six Toes', desc: '-2% fire rate', apply: P => { P.haste -= 0.02; } },
  { id: 'uncledad', name: 'Uncle Daddy', desc: '-2% damage', apply: P => { P.might -= 0.02; } },
  { id: 'onebrow', name: 'The Monobrow', desc: '-1% dodge', apply: P => { P.dodge = Math.max(0, P.dodge - 0.01); } },
];
const BANE_MAX = 4;
PROFILES.redtail = {
  name: 'The Redtail', trait: 'Inbred Luck', fmt: k => `+${pc(0.25 * k)} luck; level-up boxes are never Common. Every level up also brings a small bane (at most ${BANE_MAX} of each)`,
  apply: (P, k) => { P.luck += 0.25 * k; },
  desc: 'Bred for luck, from a very small family tree. Level-up boxes roll better, and every level up comes with something you would rather not talk about.',
  weapons: ['wedding', 'moonshine', 'banjo'],
  unlock: { text: 'Play 20 runs (any result)', have: () => (typeof RUNLOG !== 'undefined' ? RUNLOG.length : 0), need: 20 },
};
if (typeof SEQ_LOOK !== 'undefined') SEQ_LOOK.redtail = { short: 'Redtail', color: RED.color, tag: 'BRED FOR LUCK', quote: 'Mama always said we was special. Then she said it to my cousin. Who is also my sister.', stats: [4, 3, 2, 3] };
const redOn = () => !!(G && G.genes && G.genes.active.includes('redtail'));
const redK = () => (redOn() ? clamp(G.genes.k.redtail || 0.5, 0.5, 1.5) : 0);
// Level-up boxes for the Redtail are never Common (from genLoot: the lowest rarity).
const redLoot = (req, minR) => (req.kind === 'level' && redOn() ? Math.max(minR, 1) : minR);
// From gainXp, once per level gained: a bane.
function redLevel() {
  if (!redOn()) return;
  const got = G.banes || (G.banes = {});
  const open = BANES.filter(b => (got[b.id] || 0) < BANE_MAX);
  if (!open.length) return;
  const b = pick(open);
  got[b.id] = (got[b.id] || 0) + 1;
  b.apply(G.P); recomputeAll();
  const p = me();
  floatText(p.x, p.y - 62, 'BANE: ' + b.name.toUpperCase() + ' (' + b.desc + ')', RED.color, 12, 1.6);
}

// ================================================================ weapons
// From fireWeapon. Returns true when it handled the shot.
function redFire(w, target, src) {
  const s = w.s, p = G.player, a0 = Math.atan2(target.y - p.y, target.x - p.x);
  if (w.id === 'wedding') {
    w.blastN = (w.blastN || 0) + 1;
    const both = hasSig(w, 'rtboth') || w.blastN % 3 === 0, n = s.count * (both ? 2 : 1);
    for (let i = 0; i < n; i++) spawnProj(w, p.x, p.y, a0 + (Math.random() - 0.5) * s.spread * (both ? 1.3 : 1), src, both ? { knock: (s.knock || 90) * 2 } : null);
    if (both) pair2Both(w); // (Hoedown Throwdown, pairs2.js)
    if (both) { cam.shake = Math.min(10, cam.shake + 3); if (!(G.bothSayT > G.t)) { G.bothSayT = G.t + 3; floatText(p.x, p.y - 30, 'BOTH BARRELS', '#ffb703', 12, 0.6); } }
    if (hasSig(w, 'rtrice')) for (let i = 0; i < 8; i++) spawnProj(w, p.x, p.y, i / 8 * TAU, src, { noMods: true, dmg: s.dmg * 0.4, r: 2.5, color: '#fff3e0', bounce: 0 });
    if (hasSig(w, 'rtreception') && w.blastN % 4 === 0) for (let i = 0; i < 16; i++) spawnProj(w, p.x, p.y, i / 16 * TAU, src, { noMods: true });
    if (both && hasSig(w, 'rtboth')) w.cd += s.cd * 0.3;
    sfx('boom');
    return true;
  }
  if (w.id === 'banjo') {
    w.noteN = (w.noteN || 0) + 1;
    const n = s.count + (hasSig(w, 'rtpick') ? 6 : 0);
    const ring = (x, y, hi) => {
      const sp = s.speed * (hi ? 1.45 : 0.7), off = Math.random() * TAU;
      for (let i = 0; i < n; i++) spawnProj(w, x, y, off + i / n * TAU, src, { speed: sp, vx: Math.cos(off + i / n * TAU) * sp, vy: Math.sin(off + i / n * TAU) * sp, life: s.range * (hi ? 1.25 : 0.8) / sp, dmg: s.dmg * (hi ? 0.75 : 1.45), r: (s.size || 4) * (hi ? 0.8 : 1.7), note: hi ? 'hi' : 'lo', color: hi ? '#ffd166' : '#f48c06' });
    };
    const hi = w.noteN % 2 === 1;
    ring(p.x, p.y, hi);
    if (hasSig(w, 'rtencore') && w.noteN % 3 === 0) ring(p.x, p.y, !hi);
    if (hasSig(w, 'rtduel')) after(0.35, () => { if (!G || !w.s) return; const C = G.cousin; ring(C ? C.x : G.player.x, C ? C.y : G.player.y, !hi); });
    sfx('zap');
    return true;
  }
  if (w.id === 'moonshine' && hasSig(w, 'rtstill')) { w.jugN = (w.jugN || 0) + 1; if (w.jugN % 3 === 0) w.s.countBonus = 2; }
  return false; // (the jug flies as an ordinary lob)
}
// From the projectile collision: Hoedown low notes.
function redNoteHit(pr, e) {
  if (pr.note === 'lo' && hasSig(pr.w, 'rthoedown') && !e.boss && !e.dead) { const dx = e.x - pr.x, dy = e.y - pr.y, l = Math.hypot(dx, dy) || 1; e.kx += dx / l * 380; e.ky += dy / l * 380; e.dazeT = G.t + 0.5; }
}
// From landLob: bad batches, 200 Proof, the still.
function redLand(pr) {
  const w = pr.w, s = w.s;
  if (hasSig(w, 'rtproof')) { const z = G.zones[G.zones.length - 1]; if (z && z.x === pr.tx && z.y === pr.ty) { z.life *= 1.5; z.max *= 1.5; z.r *= 1.25; } }
  if (hasSig(w, 'rtbadbatch') || Math.random() < 1 / 6) {
    aoe(pr.tx, pr.ty, s.area * 1.6, s.dmg * 0.8, Object.assign({}, pr.src, { wname: 'Bad Batch' }), '#ff5400');
    cam.shake = Math.min(12, cam.shake + 5);
    if (!(G.batchSayT > G.t)) { G.batchSayT = G.t + 2; floatText(pr.tx, pr.ty - 30, 'BAD BATCH', '#ff5400', 14, 0.8); }
  }
  if (w.s.countBonus) {
    const b = w.s.countBonus; w.s.countBonus = 0;
    for (let i = 0; i < b; i++) { const a = Math.random() * TAU, d = rand(50, 90); G.proj.push({ lob: true, sx: pr.tx, sy: pr.ty, tx: pr.tx + Math.cos(a) * d, ty: pr.ty + Math.sin(a) * d, x: pr.tx, y: pr.ty, t: 0, flight: 0.35, w, src: pr.src, color: pr.color, dead: false }); }
  }
}

// ================================================================ Sister-Cousin
// When you're hit (35% chance, at most every 12s), a copy of you splits off. She fights beside you with a little
// shotgun for 12s. Swim into her to recombine: Keeping It in the Family (+30% damage, +20% fire rate for 8s and
// 10% of your health back). Or tap the ability button to split on purpose.
const COUSIN = { chance: 0.35, life: 12, buff: 8 };
function cousinSplit() {
  const p = G.player, a = Math.random() * TAU;
  G.cousin = { x: p.x + Math.cos(a) * 40, y: p.y + Math.sin(a) * 40, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, face: a, born: G.t, end: G.t + COUSIN.life, shootT: G.t + 0.6, tailV: 0 };
  ring(p.x, p.y, 50, RED.color, 0.4, 4);
  floatText(p.x, p.y - 40, pick(['SISTER-COUSIN!', 'COUSIN-SISTER!', 'IT\'S A FAMILY THING']), RED.color, 14, 1);
  return true;
}
SEQ_ABILITY.redtail = { name: 'Sister-Cousin', short: 'COUSIN', cd: 12,
  desc: 'When you are hit, there is a 35% chance a copy of you splits off and fights beside you for 12s. Swim into her to recombine for Keeping It in the Family: +30% damage and +20% fire rate for 8s, and 10% of your health back. Tap to split on purpose.',
  fire(manual) { return manual && !G.cousin ? cousinSplit() : false; } };
function redHurt() {
  const g = G.genes;
  if (!g || g.primary !== 'redtail' || G.cousin || G.t < (g.abilT || 0) || Math.random() > COUSIN.chance) return;
  if (cousinSplit()) { g.abilT = G.t + SEQ_ABILITY.redtail.cd; }
}
function redTick(dt) {
  const C = G.cousin, p = G.player;
  // Hooch Hour: your own puddles are good for you.
  if (G.weapons.some(w => w && w.id === 'moonshine' && hasSig(w, 'rthooch')) && !(G.hoochT > G.t)) {
    G.hoochT = G.t + 0.5;
    if (G.zones.some(z => z.src && z.src.wname === 'Moonshine Jug' && Math.hypot(z.x - p.x, z.y - p.y) < z.r)) healPlayer(G.P.maxHp * 0.01, true);
  }
  if (!C) return;
  // She drifts out, then circles you at a distance, shooting whatever is nearest.
  const dx = p.x - C.x, dy = p.y - C.y, d = Math.hypot(dx, dy) || 1, want = 110;
  const ax = dx / d * (d - want) * 3 + -dy / d * 90, ay = dy / d * (d - want) * 3 + dx / d * 90;
  C.vx += (ax - C.vx) * Math.min(1, dt * 3); C.vy += (ay - C.vy) * Math.min(1, dt * 3);
  C.x += C.vx * dt; C.y += C.vy * dt; C.tailV = Math.hypot(C.vx, C.vy);
  if (C.tailV > 10) C.face = Math.atan2(C.vy, C.vx);
  if (G.t >= C.shootT) {
    C.shootT = G.t + 0.9;
    const t = acquire('nearest', 320, C.x, C.y);
    if (t) {
      const a = Math.atan2(t.y - C.y, t.x - C.x), dmg = (10 + G.level * 2.2) * G.P.might;
      IN_AOE = true;
      for (let i = 0; i < 5; i++) { const aa = a + (Math.random() - 0.5) * 0.5; alongLine({ x: C.x, y: C.y }, { x: C.x + Math.cos(aa) * 260, y: C.y + Math.sin(aa) * 260 }, 8, e => { if (!e.charmed && !e.egg) damageEnemy(e, dmg / 2, { elem: 'phys', wname: 'Sister-Cousin', noCrit: true }); }); bolt(C.x, C.y, C.x + Math.cos(aa) * 200, C.y + Math.sin(aa) * 200, '#ffb703', 0.08); }
      IN_AOE = false;
    }
  }
  // Recombine: swim into her (after a moment).
  if (G.t - C.born > 1 && d < 30) {
    G.cousin = null; G.familyT = G.t + COUSIN.buff;
    healPlayer(G.P.maxHp * 0.1);
    ring(p.x, p.y, 90, RED.color, 0.6, 6); G.flashT = Math.max(G.flashT || 0, 0.1);
    floatText(p.x, p.y - 44, 'KEEPING IT IN THE FAMILY', RED.color, 15, 1.4, true); sfx('pickup');
    return;
  }
  if (G.t >= C.end) {
    G.cousin = null;
    floatText(C.x, C.y - 30, pick(['SHE\'S GONE TO UNCLE DAVE\'S', 'SHE\'LL BE AT THE REUNION', 'BACK TO THE TRAILER']), RED.color, 12, 1.2);
  }
}
const redDmgMul = () => (G.familyT > G.t ? 1.3 : 1);
const redHaste = () => (G && G.familyT > G.t ? 1.2 : 1);
function redDraw() {
  const C = G.cousin;
  if (!C) return;
  const x = sx(C.x), y = sy(C.y), left = C.end - G.t, a = left < 2 ? 0.4 + 0.4 * Math.abs(Math.sin(G.realT * 10)) : 0.85;
  RAW_COL = true; drawShip(x, y, C.face, RED.color, a, playerScale() * 0.9, C); RAW_COL = false; // (in Redtail red, whatever your stains)
  ctx.globalAlpha = a; RAW_COL = true; ctx.fillStyle = RED.color; ctx.font = `700 ${Math.round(Math.max(9, 10 * S))}px sans-serif`; ctx.textAlign = 'center';
  ctx.fillText('SISTER-COUSIN', x, y - 22 * S); RAW_COL = false; ctx.globalAlpha = 1;
}
// Chips for the HUD.
function redChips(chips) {
  if (G.familyT > G.t) chips.push(['FAMILY ' + Math.ceil(G.familyT - G.t), RED.color]);
  if (G.cousin) chips.push(['SISTER-COUSIN ' + Math.ceil(G.cousin.end - G.t), RED.color]);
}

// ================================================================ drawing (sequence screen and in play)
// Portrait: a red mullet at the back of the head.
function redPortrait(g, hx, hy, R, c, t) {
  g.strokeStyle = c; g.lineWidth = Math.max(2, R * 0.12); g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const y0 = hy - R * 0.55 + i * R * 0.3, sw = Math.sin(t * 3 + i) * R * 0.08; g.beginPath(); g.moveTo(hx - R * 0.95, y0); g.quadraticCurveTo(hx - R * 1.45, y0 + R * 0.1 + sw, hx - R * 1.65, y0 + R * 0.35 + sw); g.stroke(); }
  g.lineCap = 'butt';
}
// In play (drawSeqMods, already turned to the head): the same mullet, small.
function redMods(k, c, t) {
  ctx.strokeStyle = c; ctx.lineWidth = Math.max(0.8, 0.8 * k); ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const y0 = (-2.6 + i * 2.6) * k, sw = Math.sin(t * 4 + i) * 0.5 * k; ctx.beginPath(); ctx.moveTo(-5.5 * k, y0); ctx.quadraticCurveTo(-8 * k, y0 + 0.6 * k + sw, -9.5 * k, y0 + 1.8 * k + sw); ctx.stroke(); }
  ctx.lineCap = 'butt';
}
