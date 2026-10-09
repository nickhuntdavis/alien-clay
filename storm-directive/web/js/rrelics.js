'use strict';
// Spawn Prawn - relics for the fifteen newer rivals (the first five have theirs in data.js). Beat a rival and
// you choose one of its two. Each pair plays on that rival's own trick. Hooks from bosses.js: rrelicApply
// (applyRelic), rrelicHit, rrelicKill, rrelicDamageIn, rrelicTick; from game.js: rrelicDmgMul (damageEnemy),
// rrelicSave (hurtPlayer, a fatal hit), rrelicLevel (gainXp).

Object.assign(RELICS, {
  // Dash Mitosis: always early.
  headstart:   { name: 'Head Start', desc: 'Every 8s you burst forward at double speed for 0.6s, and nothing can hurt you while you do.' },
  earlybird:   { name: 'Early Bird', desc: '+40% damage to enemies that are still at full health.' },
  // Sly Motility: sticky fingers.
  pickpocket:  { name: 'Pickpocket', desc: '+50% pickup range, and XP gems are worth 15% more.' },
  fivefinger:  { name: 'Five-Finger Discount', desc: 'Elites always drop a power-up when they die.' },
  // Brick Wallace: a wall.
  mucuswall:   { name: 'Mucus Wall', desc: '+6 armour, but 5% slower.' },
  loadbearing: { name: 'Load-Bearing', desc: 'While you are barely moving, you take 35% less damage.' },
  // Hawkeye Harriet: never misses.
  eagleeye:    { name: 'Eagle Eye', desc: '+45% damage to enemies more than 350 away from you.' },
  steadyhand:  { name: 'Steady Hand', desc: '+35% range and +20% shot speed for every weapon.' },
  // Buckshot Bev: more is more.
  buckshot:    { name: 'Buckshot', desc: '+1 projectile for every weapon and +10% fire rate.' },
  triggerhappy:{ name: 'Trigger Happy', desc: '+15% fire rate and +25% reload speed.' },
  // Casper Flagella: was there a moment ago.
  ectoplasm:   { name: 'Ectoplasm', desc: 'Bullets sometimes pass straight through you: +15% dodge.' },
  nowyouseeme: { name: 'Now You See Me', desc: 'Every 12s you fade out for 2s: nothing can touch you.' },
  // Big Mama Morula: brought her boys.
  herboys:     { name: 'Her Boys', desc: 'Two of Mama\'s boys escort you for the rest of the run. One that falls is back 20s later.' },
  packedlunch: { name: 'Packed Lunch', desc: 'Every level up heals you 12% of your max HP.' },
  // Vlad the Inhaler: drains, never dies.
  bloodbank:   { name: 'Blood Bank', desc: '2% of the damage you deal heals you.' },
  undying:     { name: 'Undead Membership', desc: 'Every 90s, a hit that would kill you leaves you on 1 HP instead.' },
  // Sticky Ricky: leaves a mess.
  slimetrail:  { name: 'Slime Trail', desc: 'You leave a boozy slime trail behind you as you swim.' },
  stickysit:   { name: 'Sticky Situation', desc: 'Anything that touches you is stuck: half speed for 3s.' },
  // Coach Kenny: has a whistle.
  peptalk:     { name: 'Pep Talk', desc: '+12% damage and +12% fire rate. Come on, then.' },
  whistle:     { name: 'The Whistle', desc: 'Every 15s a whistle blast knocks back and dazes everything near you.' },
  // Diva Delores: encores and exits.
  encore:      { name: 'Encore', desc: 'One kill in ten takes a bow: a burst of damage all round it.' },
  exitstage:   { name: 'Exit Stage Left', desc: 'Hit while under half health, you blink away from the trouble (every 8s).' },
  // Nana Nucleus: done this forty times.
  cardigan:    { name: 'Knitted Cardigan', desc: '+2 HP every second, and +10% max HP.' },
  nottoday:    { name: 'Not Today, Dear', desc: 'Once this run, when you would die, you get back up on 50% HP.' },
  // Turbo Tadpole: nine espressos.
  espresso:    { name: 'Nine Espressos', desc: '+25% swim speed and +10% fire rate, but you take 5% more damage.' },
  meltdown:    { name: 'Full Meltdown', desc: 'Below 40% health your weapons fire 40% faster.' },
  // Norman Nucleotide: has calculated your odds.
  calculated:  { name: 'Calculated Odds', desc: '+10% crit chance and +30% crit damage.' },
  probcloud:   { name: 'Probability Cloud', desc: 'One hit in seven you take simply did not happen.' },
  // Morticia Mitochondria: powerhouse, in black.
  powerhouse:  { name: 'Powerhouse of the Cell', desc: 'Above 70% health: +18% damage and +12% fire rate.' },
  mourning:    { name: 'Mourning Wear', desc: 'Every kill near you heals 0.5% of your max HP.' },
});
Object.assign(RIVAL_RELICS, {
  dash: ['headstart', 'earlybird'], sly: ['pickpocket', 'fivefinger'], brick: ['mucuswall', 'loadbearing'], hawk: ['eagleeye', 'steadyhand'],
  bev: ['buckshot', 'triggerhappy'], casper: ['ectoplasm', 'nowyouseeme'], mama: ['herboys', 'packedlunch'], vlad: ['bloodbank', 'undying'],
  ricky: ['slimetrail', 'stickysit'], coach: ['peptalk', 'whistle'], delores: ['encore', 'exitstage'], nana: ['cardigan', 'nottoday'],
  turbo: ['espresso', 'meltdown'], norman: ['calculated', 'probcloud'], morticia: ['powerhouse', 'mourning'],
});

// When taken: the flat ones.
function rrelicApply(id) {
  const P = G.P, p = me();
  switch (id) {
    case 'pickpocket': P.magnet += 0.5; break;
    case 'mucuswall': P.armour += 6; P.speed -= 0.05; break;
    case 'steadyhand': P.range += 0.35; P.projSpeed += 0.2; break;
    case 'buckshot': P.multishot += 1; P.haste += 0.1; break;
    case 'triggerhappy': P.haste += 0.15; P.reloadSpd += 0.25; break;
    case 'ectoplasm': P.dodge = Math.min(0.7, P.dodge + 0.15); break;
    case 'peptalk': P.might += 0.12; P.haste += 0.12; break;
    case 'cardigan': { P.regen += 2; const add = Math.round(P.maxHp * 0.1); P.maxHp += add; p.hp += add; break; }
    case 'espresso': P.speed += 0.25; P.haste += 0.1; break;
    case 'calculated': P.crit += 0.1; P.critDmg += 0.3; break;
    case 'headstart': G.dashRT = G.t + 3; break;
    case 'nowyouseeme': G.fadeRT = G.t + 6; break;
    case 'whistle': G.whistleT = G.t + 5; break;
  }
}
// Damage you deal (damageEnemy): conditional bonuses.
function rrelicDmgMul(e, src) {
  const R = G.relics, p = G.player, P = G.P;
  let k = 1;
  if (R.earlybird && e.hp >= e.maxHp * 0.999) k *= 1.4;
  if (R.eagleeye && !src.dot && Math.hypot(e.x - p.x, e.y - p.y) > 350) k *= 1.45;
  if (R.powerhouse && p.hp > P.maxHp * 0.7) k *= 1.18;
  return k;
}
// Fire-rate bonuses that switch on and off (read in recompute through G.P.haste would be heavy; this is
// applied per frame as a multiplier on weapon cooldowns via rrelicHaste).
function rrelicHaste() {
  const R = G.relics, p = G.player, P = G.P;
  let k = 1;
  if (R.meltdown && p.hp < P.maxHp * 0.4) k *= 1.4;
  if (R.powerhouse && p.hp > P.maxHp * 0.7) k *= 1.12;
  return k;
}
function rrelicHit(e, d, src) {
  const R = G.relics;
  if (R.bloodbank && G.lsBudget > 0) { const h = Math.min(G.lsBudget, d * 0.02); G.lsBudget -= h; healPlayer(h, true); }
}
function rrelicKill(e, src) {
  const R = G.relics, p = me(), P = G.P;
  if (R.fivefinger && e.elite && !e.boss) G.pickups.push(makePickup(pick(['heal', 'magnet', 'rage', 'shield', 'freeze'].concat(PU_NEW)), e.x, e.y));
  if (R.encore && !e.boss && Math.random() < 0.1) {
    aoe(e.x, e.y, 120, Math.max(e.maxHp * 0.6, (20 + G.level * 4) * P.might), { elem: 'arcane', wname: 'Encore', noCrit: true }, '#ff70a6');
    if (!(G.encoreSayT > G.t)) { G.encoreSayT = G.t + 2; floatText(e.x, e.y - 20, 'ENCORE!', '#ff70a6', 14, 0.9); }
  }
  if (R.mourning && Math.hypot(e.x - p.x, e.y - p.y) < 300 && G.lsBudget > 0) { const h = Math.min(G.lsBudget, P.maxHp * 0.005); G.lsBudget -= h; healPlayer(h, true); }
}
// Hits you take (before armour): 0 blocks it.
function rrelicDamageIn(dmg, ent) {
  const R = G.relics, p = me(), P = G.P;
  if (R.probcloud && Math.random() < 1 / 7) { floatText(p.x, p.y - 26, 'DID NOT HAPPEN', '#8338ec', 12, 0.7); p.iframes = Math.max(p.iframes, 0.3); return 0; }
  if (R.loadbearing && Math.hypot(p.vx || 0, p.vy || 0) < 45) dmg *= 0.65;
  if (R.espresso) dmg *= 1.05;
  if (R.stickysit && ent && !ent.dead && !ent.boss && ent.hp != null) ent.soapT = G.t + 3;
  if (R.exitstage && p.hp < P.maxHp * 0.5 && G.t >= (G.exitT || 0)) {
    G.exitT = G.t + 8;
    const ax = ent ? p.x - ent.x : Math.cos(p.face || 0), ay = ent ? p.y - ent.y : Math.sin(p.face || 0), l = Math.hypot(ax, ay) || 1;
    ring(p.x, p.y, 30, '#ff70a6', 0.35, 3);
    p.x += ax / l * 160; p.y += ay / l * 160; p.iframes = Math.max(p.iframes, 0.6);
    floatText(p.x, p.y - 26, 'EXIT STAGE LEFT', '#ff70a6', 12, 0.8);
  }
  return dmg;
}
// A hit that would kill you (hurtPlayer, after armour): true cancels it.
function rrelicSave(d) {
  const R = G.relics, p = G.player, P = G.P;
  if (p.hp - d > 0) return false;
  if (R.nottoday && !G.notTodayUsed) {
    G.notTodayUsed = true; p.hp = P.maxHp * 0.5; p.iframes = 2;
    ring(p.x, p.y, 140, '#c9ada7', 0.7, 6); floatText(p.x, p.y - 50, 'NOT TODAY, DEAR', '#c9ada7', 18, 1.6, true);
    return true;
  }
  if (R.undying && G.t >= (G.undyingT || 0)) {
    G.undyingT = G.t + 90; p.hp = 1; p.iframes = 1.2;
    ring(p.x, p.y, 90, '#d00000', 0.5, 5); floatText(p.x, p.y - 40, 'UNDEAD MEMBERSHIP', '#d00000', 15, 1.2);
    return true;
  }
  return false;
}
function rrelicLevel() {
  if (G.relics.packedlunch) healPlayer(G.P.maxHp * 0.12);
}
function rrelicTick(dt) {
  const R = G.relics, p = me(), P = G.P;
  if (R.headstart && G.t >= (G.dashRT || 0) && Math.hypot(p.vx || 0, p.vy || 0) > 60) {
    G.dashRT = G.t + 8; G.sprintT = G.t + 0.6; p.iframes = Math.max(p.iframes, 0.6);
    ring(p.x, p.y, 40, '#fb5607', 0.3, 3); floatText(p.x, p.y - 26, 'HEAD START', '#fb5607', 12, 0.6);
  }
  if (R.nowyouseeme && G.t >= (G.fadeRT || 0)) {
    G.fadeRT = G.t + 12; p.iframes = Math.max(p.iframes, 2);
    ring(p.x, p.y, 50, '#d8f3ff', 0.5, 3); floatText(p.x, p.y - 26, 'NOW YOU DON\'T', '#d8f3ff', 12, 0.8);
  }
  if (R.whistle && G.t >= (G.whistleT || 0)) {
    G.whistleT = G.t + 15;
    forNear(p.x, p.y, 220, e => { if (e.charmed || e.egg || e.boss) return; const dx = e.x - p.x, dy = e.y - p.y, l = Math.hypot(dx, dy) || 1; e.kx += dx / l * 600; e.ky += dy / l * 600; e.dazeT = G.t + 1; });
    ring(p.x, p.y, 220, '#3a86ff', 0.5, 6); floatText(p.x, p.y - 30, 'PHWEEEET', '#3a86ff', 15, 0.8); cam.shake = Math.min(10, cam.shake + 5);
  }
  if (R.slimetrail && !(G.slimeT > G.t) && Math.hypot(p.vx || 0, p.vy || 0) > 40 && G.zones.length < 200) {
    G.slimeT = G.t + 0.2;
    G.zones.push({ x: p.x, y: p.y, r: 24, life: 2.5, max: 2.5, dps: (6 + G.level * 2) * P.might, elem: 'poison', pull: 0, color: '#80ed99', tick: 0, src: { elem: 'poison', wname: 'Slime Trail' } });
  }
  // Her Boys: two escorts, each back 20s after it falls.
  if (R.herboys) {
    G.boys = (G.boys || []).filter(g => !g.dead && g.charmed);
    if (G.boys.length < 2 && G.t >= (G.boysT || 0) && G.enemies.length < CAPS.enemies) {
      G.boysT = G.t + (G.boys.length ? 20 : 0);
      const g = makeEnemy(ENEMIES.charger || ENEMIES.brute, p.x + rand(-40, 40), p.y + rand(-40, 40));
      g.charmed = true; g.charmT = 1e9; g.name = "Mama's Boy"; g.hp = g.maxHp = g.maxHp * 3; g.xp = 0;
      G.enemies.push(g); G.boys.push(g); ring(g.x, g.y, 26, '#ffafcc', 0.4, 3);
    }
  }
}
