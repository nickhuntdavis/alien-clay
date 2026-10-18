'use strict';
// Spawn Prawn - v10 mutation cards (spec: ../redesign docs/MUTATIONS.md; UPGRADES.md 3, 4, 7, 8; COMBAT_MATRIX.md 10 to 12).
// Owns: the 33 mutation cards (body, weapon, damage-type, trade-off, rare), the Catalyst cards (one per reaction in FIGHT_RX,
// offered once that reaction is in META.rxSeen) and the Concentration cards (a build-up bar fills faster / drains slower).
// Registered with the draft core (draft.js draftRegister). State: G.muts = { id: rank } (Genome mutations; draft.js counts slots
// from it), w.wm10 = ids on a weapon (max 3, a stackable one may repeat), G.cat = { reactionId: rank }, G.conc = { type: rank },
// G.mut10 = per-run working state (timers, drops). Everything a mutation makes that hits is a normal hit tagged src.mut and
// sets off no other mutation (bounded chains, 12.5); nothing adds a ground object or a status (decision 27).
// Not built (no system yet): none. Spare Parts' "offer only one with COME BACK HERE" waits for that Feat.
// Hooks: v10.js v10Tick -> mutTick, v10Draw -> mutDraw; fight.js fightHit -> mutDmg (damage), mutBarK (bar fill), mutHit;
// fight.js rxLocked -> mutRxLock, fightStatus Mucus -> mutSnareK; combat.js resolveHit -> a.barK; game.js killEnemy -> mutKill,
// hurtPlayer -> mutHurtIn / mutHurt, gainXp -> mutLevel, computeStatsInner -> mutWeaponStats, fireWeapon -> mutFire,
// updateProjectiles -> mutProjHit, updatePlayer speed -> mutSpeed; arsenal.js rateBonus -> mutRate.

const MUT_COL = { body: '#d8c9a8', force: '#e8eef8', acid: '#ff2fa8', static: '#ffe94a', mucus: '#7fd04a', blood: '#c9184a', soul: '#b06cff', fire: '#ff6a2a', trade: '#ffb347', rare: '#ffd700', weapon: '#9fd8ff' };
const MUT_INT = { force: 'phys', acid: 'fire', static: 'shock', mucus: 'ice', blood: 'arcane', soul: 'soul', fire: 'flame' };
const MUT_REG = [];
const mr = id => (G && G.muts && G.muts[id]) || 0;
const wmN = (w, id) => (w && w.wm10 ? w.wm10.filter(x => x === id).length : 0);
const wAtk = w => {
  const d = w.def;
  if (d.v10atk) return d.v10atk;
  if (d.kind === 'orbit') return 'orbit';
  if (d.kind === 'melee') return 'contact';
  if (d.kind === 'beam') return 'beam';
  if (d.kind === 'lob') return 'pool';
  if (d.kind === 'gun') return (w.s && w.s.count > 2) ? 'spread' : 'proj';
  return 'other';
};
const ownedWeapons = () => (G.weapons || []).filter(w => w && !w.isSpell);
const hasType = t => ownedWeapons().concat((G.spells || []).filter(Boolean)).some(w => w.def && w.def.elem === MUT_INT[t]);

function mutSt() {
  if (!G) return null;
  if (G.mut10) return G.mut10;
  G.muts = G.muts || {}; G.cat = G.cat || {}; G.conc = G.conc || {};
  return G.mut10 = { slipT: 0, slipK: 1, csK: 1, htT: 0, gpT: 0, hbT: 3, kills: [], oxT: 0, oxK: 1, wispT: 0, frags: 0, drops: [], fly: [], pad: 0, base: { drain: COMBAT.barDrain } };
}

// ---------------------------------------------------------------- card factory
function mutCard(o) {
  const slot = o.slot || 'genome';
  const c = Object.assign({ kind: 'acquire', slot, family: 'mut:body', type: null, rarity: 1, start: false, color: MUT_COL.body, maxRank: 1 }, o);
  c.why = o.why || (() => '');
  c.eligible = G => !c.why(G);
  if (slot === 'genome') {
    c.rank = () => mr(c.id);
    c.apply = (G, target) => { mutSt(); G.muts[c.id] = Math.min(c.maxRank, mr(c.id) + 1); o.on && o.on(G, G.muts[c.id]); };
  } else {
    c.rank = () => 0; // a weapon mutation ranks per weapon (wm10), so the card itself never retires
    c.maxRank = 3;
    c.fits = w => !!w && !w.isSpell && (o.fit === 'any' || o.fit.indexOf(wAtk(w)) >= 0) && (w.wm10 || []).length < 3 && (o.stack || wmN(w, c.id) === 0);
    c.why = G => ownedWeapons().some(c.fits) ? '' : 'no weapon of the right attack type with room (max 3 mutations each)';
    c.eligible = G => !c.why(G);
    c.apply = (G, target) => {
      const w = c.fits(target) ? target : ownedWeapons().find(c.fits);
      if (!w) return;
      mutSt();
      (w.wm10 || (w.wm10 = [])).push(c.id);
      o.on && o.on(G, w);
    };
  }
  if (typeof draftRegister === 'function') draftRegister(c); else (window.CARDS10 = window.CARDS10 || []).push(c);
  MUT_REG.push(c);
  return c;
}
const needType = (t, name) => () => hasType(t) ? '' : 'needs a ' + name + ' weapon or Feat';
const hpFix = (G, f) => { const P = G.P, p = G.player; P.maxHp *= f; p.hp = Math.min(P.maxHp, f > 1 ? p.hp + (P.maxHp - P.maxHp / f) : p.hp); };

// ---------------------------------------------------------------- body (M1 to M8)
mutCard({ id: 'm_slip', title: 'Slipstream', icon: 'SL', rarity: 0, maxRank: 3, start: true, flavour: 'Keep going! You\'re getting good at going!',
  desc: 'Swim speed builds while you keep moving, up to +20% after 3 s. A hit resets it.' });
mutCard({ id: 'm_pad', title: 'Extra Padding', icon: 'EP', rarity: 0, maxRank: 3, flavour: 'I put something soft around your something soft.',
  desc: '+10% max health. At full health, half of it is a temporary Membrane.', on: G => hpFix(G, 1.05) });
mutCard({ id: 'm_fingers', title: 'Sticky Fingers', icon: 'SF', rarity: 0, maxRank: 3, start: true, flavour: 'You found it. It\'s yours. All of it.',
  desc: '+30% pickup range. Each level-up pulls in all XP within 250.', on: G => { G.P.magnet += 0.3; } });
mutCard({ id: 'm_heart', title: 'Heartbeat', icon: 'HB', rarity: 1, maxRank: 3, flavour: 'Thump thump. Still there. Good.',
  desc: 'Every 3 s a Force Burst shoves enemies away. Wider the healthier you are.' });
mutCard({ id: 'm_hold', title: 'Hard to Hold', icon: 'HH', rarity: 1, maxRank: 3, flavour: 'You slipped! Do it again but without the ouch.',
  desc: 'After a hit: +25% swim speed and half Contact damage for 1.5 s.' });
mutCard({ id: 'm_parts', title: 'Spare Parts', icon: 'SP', rarity: 1, maxRank: 3, flavour: 'I saved the bits. You might need the bits.',
  desc: 'Kills sometimes drop a fragment. Every 5 collected heals 4%.' });
mutCard({ id: 'm_excite', title: 'Overexcited', icon: 'OX', rarity: 1, maxRank: 3, flavour: 'Again! Again! AGAIN!',
  desc: '5 kills within 2 s: +30% attack speed for 3 s.' });
mutCard({ id: 'm_space', title: 'Personal Space', icon: 'PS', rarity: 1, maxRank: 3, family: 'mut:body', flavour: 'Please don\'t touch. Actually, I will handle that.',
  desc: 'An enemy that stays within 90 of you for 1 s is Snared.' });

// ---------------------------------------------------------------- weapon (M9 to M16)
const MUT_WF = 'mut:weapon', MUT_WC = MUT_COL.weapon;
mutCard({ id: 'w_split', slot: 'weaponmut', family: MUT_WF, color: MUT_WC, title: 'Can\'t Pick One', icon: 'CP', rarity: 2, start: true, fit: ['proj', 'spread'], flavour: 'One for you. One for you. One for... oh, there\'s loads.',
  desc: 'A hit may split into two half-damage shots that home in. Splits never split.' });
mutCard({ id: 'w_nfy', slot: 'weaponmut', family: MUT_WF, color: MUT_WC, title: 'Not Finished Yet', icon: 'NY', rarity: 2, start: true, fit: ['proj', 'spread'], flavour: 'That one was rude too. Get them.',
  desc: 'A shot that kills flies on to another enemy within 110 at 70% damage, up to 3 jumps.' });
mutCard({ id: 'w_spin', slot: 'weaponmut', family: MUT_WF, color: MUT_WC, title: 'Keep Spinning', icon: 'KS', rarity: 1, start: true, stack: true, fit: ['orbit', 'contact', 'beam'], flavour: 'Round and round. They\'re not learning.',
  desc: '+30% duration. +5% damage for each enemy hit in a row, up to +50%.' });
mutCard({ id: 'w_reach', slot: 'weaponmut', family: MUT_WF, color: MUT_WC, title: 'Reachy', icon: 'RE', rarity: 1, stack: true, fit: ['contact', 'beam'], flavour: 'Stretch! You can almost touch that one!',
  desc: '+25% reach. The outer quarter hits for +40%.' });
mutCard({ id: 'w_extra', slot: 'weaponmut', family: MUT_WF, color: MUT_WC, title: 'A Bit Extra', icon: 'AB', rarity: 2, stack: true, fit: 'any', flavour: 'It needed a little more.',
  desc: 'A kill may pop a small Burst of the weapon\'s damage type. Its kills never pop another.' });
mutCard({ id: 'w_thru', slot: 'weaponmut', family: MUT_WF, color: MUT_WC, title: 'Through and Through', icon: 'TT', rarity: 1, stack: true, fit: ['proj', 'spread'], flavour: 'You can get more than one. I checked.',
  desc: '+2 pierce. Each enemy passed costs 15% damage.' });
mutCard({ id: 'w_pool', slot: 'weaponmut', family: MUT_WF, color: MUT_WC, title: 'Leave a Little Something', icon: 'LS', rarity: 1, stack: true, fit: ['pool'], flavour: 'For later. You might want it for later.',
  desc: 'Pools last 50% longer and give one last tick at double damage as they end.' });
mutCard({ id: 'w_every', slot: 'weaponmut', family: MUT_WF, color: MUT_WC, title: 'Everywhere!', icon: 'EV', rarity: 2, stack: true, fit: ['proj', 'spread', 'beam'], flavour: 'I got all the angles. There are so many angles.',
  desc: 'Every 3rd attack also fires one extra shot at the next-best target.' });

// ---------------------------------------------------------------- damage type (M17 to M22)
const MUT_TF = t => 'mut:type:' + t;
mutCard({ id: 't_force', title: 'Hit Them Harder', icon: 'HT', type: 'force', family: MUT_TF('force'), color: MUT_COL.force, rarity: 1, maxRank: 3, why: needType('force', 'Force'), flavour: 'Again! They\'re nearly over there!',
  desc: '+50% knockback on enemies already knocked back in the last 1 s.' });
mutCard({ id: 't_mucus', title: 'Stickier', icon: 'ST', type: 'mucus', family: MUT_TF('mucus'), color: MUT_COL.mucus, rarity: 1, maxRank: 3, why: needType('mucus', 'Mucus'), flavour: 'If it\'s sticky, it stays. That\'s science.',
  desc: 'Snared lasts 50% longer. Poise fills 25% faster on Snared enemies.' });
mutCard({ id: 't_static', title: 'Pass It On', icon: 'PI', type: 'static', family: MUT_TF('static'), color: MUT_COL.static, rarity: 1, maxRank: 3, why: needType('static', 'Static'), flavour: 'Everybody gets a turn!',
  desc: 'When Charged runs out, 30% chance it passes to the nearest enemy within 110, once.' });
mutCard({ id: 't_blood', title: 'Bad Blood', icon: 'BB', type: 'blood', family: MUT_TF('blood'), color: MUT_COL.blood, rarity: 1, maxRank: 3, why: needType('blood', 'Blood'), flavour: 'Oh. That\'s going everywhere.',
  desc: 'Blood pools from bleeding deaths are 50% bigger and make enemies in them Bleed.' });
mutCard({ id: 't_soul', title: 'Come Out of There', icon: 'CO', type: 'soul', family: MUT_TF('soul'), color: MUT_COL.soul, rarity: 2, maxRank: 3, why: needType('soul', 'Soul'), flavour: 'There\'s something inside! I want it.',
  desc: 'An enemy killed with Soul build-up or Possessed may leave a wisp: heal 3% or +20% attack speed for 3 s.' });
mutCard({ id: 't_wires', title: 'Crossed Wires', icon: 'CW', family: 'mut:type:any', color: MUT_COL.rare, rarity: 2, start: true, flavour: 'Oh! They did a thing together!',
  desc: 'Every unstable reaction you have discovered hits 25% harder and comes round again in 1 s.' });

// ---------------------------------------------------------------- trade-offs (M23 to M28)
mutCard({ id: 'x_brain', title: 'Big Brain', icon: 'BR', family: 'mut:trade', color: MUT_COL.trade, rarity: 2, start: true, flavour: 'You\'re getting clever. You look a bit breakable, though.',
  desc: '+25% damage. -20% max health.', on: G => { G.P.might *= 1.25; hpFix(G, 0.8); } });
mutCard({ id: 'x_qty', title: 'Quantity Over Quality', icon: 'QQ', family: 'mut:trade', color: MUT_COL.trade, rarity: 2, flavour: 'One hundred little hits! That\'s basically one big hit. Right?',
  desc: '+30% attack rate and +1 shot. -30% damage per hit.', on: G => { G.P.haste *= 1.3; G.P.multishot += 1; G.P.might *= 0.7; } });
mutCard({ id: 'x_still', title: 'Can\'t Sit Still', icon: 'CS', family: 'mut:trade', color: MUT_COL.trade, rarity: 2, flavour: 'Go go go! Wait. Why did you stop?',
  desc: '+20% attack speed while swimming. -20% while still.', why: G => (G.sample === 'overachiever' || (G.seqId || G.sequence) === 'overachiever') ? 'the Overachiever already has this' : '' });
mutCard({ id: 'x_once', title: 'All at Once', icon: 'AO', family: 'mut:trade', color: MUT_COL.trade, rarity: 2, flavour: 'SURPRISE! Oh. You\'re still there.',
  desc: 'First hit on an enemy not hit for 3 s deals +60%. Your other hits on it deal -20% for 3 s.' });
mutCard({ id: 'x_hungry', title: 'Hungry Hungry', icon: 'HG', family: 'mut:trade', color: MUT_COL.trade, rarity: 2, flavour: 'More food! More friends! Wait, those aren\'t friends.',
  desc: '+30% XP. Enemies spawn 20% faster.', on: G => { G.P.xp += 0.6; G.P.spawnMult *= 1.2; } }); // (XP bonuses count half in gainXp, so +0.6 is +30%)
mutCard({ id: 'x_careless', title: 'No Time for Being Careful', icon: 'NC', family: 'mut:trade', color: MUT_COL.trade, rarity: 2, flavour: 'You look amazing! Please don\'t get hit.',
  desc: '+20% damage while above 70% health. You take +20% damage.' });

// ---------------------------------------------------------------- rare synergy (M29 to M33)
const MUT_RF = 'mut:rare';
mutCard({ id: 'r_mess', title: 'Conductive Mess', icon: 'CM', family: MUT_RF, color: MUT_COL.rare, rarity: 3, why: () => hasType('static') && hasType('blood') ? '' : 'needs Static and Blood', flavour: 'It\'s all connected! That\'s probably fine.',
  desc: 'A Charged enemy in a blood pool Charges everyone else in that pool.' });
mutCard({ id: 'r_closer', title: 'Come Closer', icon: 'CC', family: MUT_RF, color: MUT_COL.rare, rarity: 3, why: () => hasType('mucus') && hasType('force') ? '' : 'needs Mucus and Force', flavour: 'Closer! Closer! There you go.',
  desc: 'Snared enemies take +25% Force damage. A Force hit on one pulls other Snared enemies within 80 towards it.' });
mutCard({ id: 'r_recycle', title: 'Death Is Recycling', icon: 'DR', family: MUT_RF, color: MUT_COL.rare, rarity: 3, why: needType('soul', 'Soul'), flavour: 'Nothing goes to waste. Not even the insides.',
  desc: 'An enemy you kill with Soul releases a wisp that fills 25% of the nearest enemy\'s Soul bar.' });
mutCard({ id: 'r_group', title: 'Group Project', icon: 'GP', family: MUT_RF, color: MUT_COL.rare, rarity: 3, start: true, why: () => ownedWeapons().length >= 2 ? '' : 'needs two weapons', flavour: 'You did it together! I knew you could.',
  desc: 'Two different weapons hitting the same enemy within 0.5 s: the second hit deals +30%.' });
mutCard({ id: 'r_pains', title: 'Growing Pains', icon: 'GR', family: MUT_RF, color: MUT_COL.rare, rarity: 3, flavour: 'You grew! Everybody noticed!',
  desc: 'Each level-up lets off a Force Burst, stronger with more enemies near. Contact hits cannot hurt you for 1 s.' });

// ---------------------------------------------------------------- Catalysts: one per reaction (UPGRADES.md 3)
const MUT_RXTYPE = { splash: 'force', rocket: 'force', cpool: 'static', slick: 'acid', sticky: 'static', pressure: 'force', oob: 'force', flashover: 'force', breach: 'acid', erosion: 'acid',
  evap: 'fire', circuit: 'static', interference: 'static', arcflash: 'static', clot: 'mucus', suspension: 'mucus', flammable: 'fire', donor: 'blood', cauterise: 'fire', spectral: 'soul' };
for (const id of Object.keys(FIGHT_RX)) {
  const R = FIGHT_RX[id];
  const c = {
    id: 'cat_' + id, kind: 'specialise', slot: null, family: 'catalyst', type: MUT_RXTYPE[id] || null, rarity: 2, start: false,
    title: 'More ' + R.name, flavour: 'That worked. Do it more.', desc: R.name + ' hits 25% harder (where it hits at all) and comes round sooner.',
    icon: 'CA', color: R.color, maxRank: 3, rxId: id,
    why: G => (META.rxSeen || []).includes(id) ? '' : 'that unstable reaction has not been discovered yet',
    rank: G => (G.cat && G.cat[id]) || 0,
    apply: G => { mutSt(); G.cat[id] = Math.min(3, (G.cat[id] || 0) + 1); },
  };
  c.eligible = G => !c.why(G);
  if (typeof draftRegister === 'function') draftRegister(c); else (window.CARDS10 = window.CARDS10 || []).push(c);
  MUT_REG.push(c);
}

// ---------------------------------------------------------------- Concentration: a build-up bar fills faster / drains slower
const MUT_CONC = { acid: ['Eaten Away', 'Corrosion fills 25% faster and drains 25% slower.', 'EA'], fire: ['Slow Burn', 'Burn fills 25% faster and drains 25% slower.', 'SB'],
  soul: ['Thin Veil', 'The Soul bar fills 25% faster and drains 25% slower.', 'TV'], force: ['Off Balance', 'Poise fills 25% faster and drains 25% slower.', 'OB'] };
for (const t of Object.keys(MUT_CONC)) {
  const [title, desc, icon] = MUT_CONC[t];
  const c = {
    id: 'conc_' + t, kind: 'specialise', slot: null, family: 'conc:' + t, type: t, rarity: 1, start: false, title, desc, icon, color: MUT_COL[t], maxRank: 3, flavour: 'It\'s working. Keep going.',
    why: G => hasType(t) ? '' : 'needs a ' + t + ' weapon or Feat that builds this bar',
    rank: G => (G.conc && G.conc[t]) || 0,
    apply: G => { mutSt(); G.conc[t] = Math.min(3, (G.conc[t] || 0) + 1); },
  };
  c.eligible = G => !c.why(G);
  if (typeof draftRegister === 'function') draftRegister(c); else (window.CARDS10 = window.CARDS10 || []).push(c);
  MUT_REG.push(c);
}

// ---------------------------------------------------------------- hooks: damage and bars (fight.js fightHit)
const mutSnared = e => e.snareT > G.t;
function mutDmg(e, src, t) { // a multiplier on the hit before defences
  if (!G.muts || src.dot || src.echo || src.mut) return 1;
  let m = 1;
  if (src.rx) { // reactions: Crossed Wires and Catalysts
    if ((META.rxSeen || []).includes(src.rx)) m *= (1 + 0.25 * mr('t_wires')) * (1 + 0.25 * ((G.cat && G.cat[src.rx]) || 0));
    return m;
  }
  const P = G.P, w = src.w, p = G.player;
  if (mr('x_careless') && p.hp > P.maxHp * 0.7) m *= 1.2;
  if (mr('r_closer') && t === 'force' && mutSnared(e)) m *= 1.25;
  if (!w) return m;
  if (mr('x_once')) {
    if (!(e.mHitT > G.t - 3)) { m *= 1.6; e.mPenT = G.t + 3; } else if (e.mPenT > G.t) m *= 0.8;
    e.mHitT = G.t;
  }
  if (mr('r_group')) {
    const g = e.mGp;
    if (g && g.uid !== w.uid && G.t - g.t <= 0.5) { m *= 1.3; ring(e.x, e.y, e.r + 6, w.def.color, 0.3, 3); fxParts('spark', e.x, e.y, g.col, 5, 90, 0.3, 2); }
    e.mGp = { uid: w.uid, t: G.t, col: w.def.color };
  }
  const ks = wmN(w, 'w_spin');
  if (ks) {
    if (G.t - (w.ksT || -9) > 1.2) w.ksN = 0;
    w.ksT = G.t; w.ksN = (w.ksN || 0) + 1;
    m *= 1 + Math.min(0.5 + 0.2 * (ks - 1), 0.05 * w.ksN);
  }
  const rc = wmN(w, 'w_reach');
  if (rc && wAtk(w) === 'contact' && w.s && Math.hypot(e.x - p.x, e.y - p.y) > 0.75 * w.s.range) m *= 1 + 0.4 * rc;
  return m;
}
function mutBarK(e) { // per-hit build-up multipliers (combat.js resolveHit a.barK)
  if (!G.conc && !mr('t_mucus')) return null;
  const k = { acid: 1, fire: 1, force: 1, soul: 1 };
  for (const t in G.conc) k[t] *= 1 + 0.25 * G.conc[t];
  if (mr('t_mucus') && mutSnared(e)) k.force *= 1 + 0.25 * mr('t_mucus');
  return k;
}
function mutHit(e, d, src, t, res) { // after a hit has resolved
  if (!G.muts || src.dot) return;
  e.mLast = d;
  if (src.mut || src.echo || src.rx) return;
  if (mr('t_force') && t === 'force' && Math.hypot(e.kx, e.ky) > 40) { const k = 1 + 0.5 * mr('t_force'); e.kx *= k; e.ky *= k; }
  if (mr('r_closer') && t === 'force' && mutSnared(e) && !(e.mPullT > G.t)) {
    e.mPullT = G.t + 0.5;
    forNear(e.x, e.y, 80, o => {
      if (o === e || o.dead || !mutSnared(o)) return;
      const l = Math.hypot(e.x - o.x, e.y - o.y) || 1, k = 260 * (12 / Math.max(12, o.r)) * (o.boss ? 0.25 : o.elite ? 0.5 : 1) * (o.cd && o.cd.def === 'squishy' ? 0.5 : 1);
      o.kx += (e.x - o.x) / l * k; o.ky += (e.y - o.y) / l * k;
    });
  }
}
const mutSnareK = () => (G && G.muts ? 1 + 0.5 * mr('t_mucus') : 1);
function mutRxLock(id) {
  if (!G || !G.muts) return 1.5;
  let s = 1.5;
  if ((META.rxSeen || []).includes(id)) { if (mr('t_wires')) s = 1; s -= 0.25 * ((G.cat && G.cat[id]) || 0); }
  return Math.max(0.5, s);
}

// ---------------------------------------------------------------- hooks: stats, rate, speed
function mutWeaponStats(w, s) {
  if (!w.wm10 || !w.wm10.length) return;
  const n = id => wmN(w, id);
  if (n('w_thru') && w.def.kind === 'gun' && s.pierce < 90) s.pierce = (s.pierce || 0) + 2 * n('w_thru');
  if (n('w_spin')) s.dur = (s.dur || 0) * (1 + 0.3 * n('w_spin'));
  if (n('w_reach')) s.range = (s.range || 0) * (1 + 0.25 * n('w_reach'));
  if (n('w_pool') && wAtk(w) === 'pool') s.dur = (s.dur || 0) * (1 + 0.5 * n('w_pool'));
}
function mutRate() {
  const st = G && G.mut10; if (!st) return 1;
  let r = 1;
  if (mr('x_still')) r *= st.csK;
  if (st.oxT > G.t) r *= st.oxK;
  if (st.wispT > G.t) r *= 1.2;
  return r;
}
function mutSpeed() {
  const st = G && G.mut10; if (!st) return 1;
  return (mr('m_slip') ? st.slipK : 1) * (mr('m_hold') && st.htT > G.t ? 1.25 : 1);
}

// ---------------------------------------------------------------- hooks: the player is hurt (game.js hurtPlayer)
function mutHurtIn(dmg, ent, kind) {
  const st = G.mut10; if (!st) return dmg;
  if (kind === 'contact') {
    if (mr('r_pains') && st.gpT > G.t) return 0;
    if (mr('m_hold') && st.htT > G.t) dmg *= 0.5;
  }
  if (mr('x_careless')) dmg *= 1.2;
  if (st.pad > 0 && dmg > 0) { // Extra Padding's temporary Membrane soaks first
    const a = Math.min(dmg, st.pad); st.pad -= a; dmg -= a; st.padOk = false;
    const p = G.player; ring(p.x, p.y, p.r + 10, '#5aa9ff', 0.3, 3);
    if (dmg <= 0) G.player.iframes = Math.max(G.player.iframes, 0.4);
  }
  return dmg;
}
function mutHurt(d) {
  const st = G.mut10; if (!st) return;
  st.slipT = 0; st.padOk = false;
  if (mr('m_hold')) st.htT = G.t + 1.5;
}

// ---------------------------------------------------------------- hooks: kills
function mutKill(e, src) {
  const st = mutSt(); if (!st || !src) return;
  const now = G.t, w = src.w;
  // Overexcited and Spare Parts count every kill.
  if (mr('m_excite')) {
    st.kills.push(now); while (st.kills.length && st.kills[0] < now - 2) st.kills.shift();
    if (st.kills.length >= 5 && !(st.oxT > now)) { st.oxT = now + 3; st.oxK = 1 + 0.3 + 0.15 * (mr('m_excite') - 1); st.kills.length = 0; floatText(G.player.x, G.player.y - 30, 'OVEREXCITED', '#ffd6e0', 12, 0.8); }
  }
  if (mr('m_parts') && Math.random() < 0.05 + 0.05 * mr('m_parts')) st.drops.push({ x: e.x, y: e.y, k: 'frag', life: 12 });
  // Not Finished Yet continues its own chain; everything else ignores kills a mutation made.
  const nfy = w ? wmN(w, 'w_nfy') : 0, jumps = src.mutJ || 0;
  if (nfy && jumps < 3 && (!src.mut || src.mut === 'nfy') && ['proj', 'spread'].indexOf(wAtk(w)) >= 0 && e.mLast > 0) {
    let best = null, bd = 110;
    for (const o of G.enemies) { if (o.dead || o === e || o.charmed) continue; const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; best = o; } }
    if (best) {
      bolt(e.x, e.y, best.x, best.y, w.def.color, 0.15);
      const js = Object.assign({}, src, { mut: 'nfy', mutJ: jumps + 1, mult: 1, noCrit: true, noProc: true, kx: undefined, ky: undefined });
      const dm = e.mLast * (0.6 + 0.1 * nfy);
      after(0, () => { if (G && !best.dead) damageEnemy(best, dm, js); });
    }
  }
  if (src.mut) return;
  const abe = w ? wmN(w, 'w_extra') : 0;
  if (abe && Math.random() < 0.15 + 0.1 * abe && e.mLast > 0) {
    const dm = e.mLast * 0.4, bs = { elem: src.elem || 'phys', mut: 'extra', noCrit: true, noProc: true, atk: 'burst', wname: 'A Bit Extra' }, x = e.x, y = e.y, col = w.def.color;
    after(0, () => { if (!G) return; ring(x, y, 50, col, 0.3, 3); fxParts('spark', x, y, col, 6, 120, 0.3, 2.5); IN_AOE = true; forNear(x, y, 50, o => { if (!o.dead) damageEnemy(o, dm, bs); }); IN_AOE = false; });
  }
  if (mr('t_blood')) { // the pool fight.js just made grows
    const z = G.zones[G.zones.length - 1];
    if (z && z.src && z.src.wname === 'blood pool' && z.x === e.x && z.y === e.y) { z.r *= 1 + 0.5 * mr('t_blood'); z.bad = true; }
  }
  if (mr('t_soul') && !e.wispKill && ((e.cd && e.cd.bars.soul > 0.02) || e.charmed) && Math.random() < 0.25 + 0.1 * (mr('t_soul') - 1)) st.drops.push({ x: e.x, y: e.y, k: 'wisp', life: 10 });
  if (mr('r_recycle') && src.elem === 'soul' && !e.wispKill) {
    let best = null, bd = 1e9;
    for (const o of G.enemies) { if (o.dead || o === e) continue; const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; best = o; } }
    if (best) st.fly.push({ x: e.x, y: e.y, tgt: best, life: 3 });
  }
}
function mutLevel(lv) {
  const st = mutSt(); if (!st) return;
  const p = G.player;
  if (mr('m_fingers')) { const r = 250 + 50 * (mr('m_fingers') - 1); for (const g of G.gems) if (!g.dead && Math.hypot(g.x - p.x, g.y - p.y) < r) g.mag = true; }
  if (mr('r_pains')) {
    let n = 0; forNear(p.x, p.y, 200, o => { if (!o.dead) n++; });
    const k = 1 + Math.min(1, n / 12), dm = 22 * G.P.might * k, R = 90 + 10 * mr('r_pains');
    st.gpT = G.t + 1;
    ring(p.x, p.y, R, MUT_COL.force, 0.45, 5);
    mutBurst(p.x, p.y, R, dm, 'Growing Pains', 'pains');
  }
}
function mutBurst(x, y, R, dm, name, tag) {
  IN_AOE = true;
  forNear(x, y, R, e => { if (!e.dead) damageEnemy(e, dm, { elem: 'phys', mut: tag, noCrit: true, noProc: true, atk: 'burst', wname: name, knock: 140, kx: e.x - x, ky: e.y - y }); });
  IN_AOE = false;
}

// ---------------------------------------------------------------- hooks: weapons firing and projectiles hitting
function mutFire(w, target, src) {
  if (!w.wm10 || !w.wm10.length) return;
  const n = wmN(w, 'w_every');
  if (!n || !target) return;
  w.evN = (w.evN || 0) + 1;
  if (w.evN % 3) return;
  const p = G.player, s = w.s, atk = wAtk(w);
  const ts = acquireMany(aimDir(w), s.range, p.x, p.y, n + 2).filter(t => t !== target).slice(0, n);
  for (const t of ts) {
    if (atk === 'beam' && w.def.v10) v10Fire(w, t, src);
    else if (atk === 'proj' || atk === 'spread') spawnProj(w, p.x, p.y, Math.atan2(t.y - p.y, t.x - p.x), src);
    else continue;
    ring(t.x, t.y, 14, w.def.color, 0.25, 2);
  }
}
function mutProjHit(pr, e) {
  const w = pr.w; if (!w || !w.wm10 || !w.wm10.length) return;
  if (wmN(w, 'w_thru') && pr.pierce > 0 && !pr.orbitT) pr.dmg *= 0.85;
  const sp = wmN(w, 'w_split');
  if (sp && !pr.mSplit && Math.random() < Math.min(0.5, 0.2 * sp)) {
    let live = 0; for (const q of G.proj) if (q.mSplit && !q.dead) live++;
    if (live > 10) return;
    const a0 = Math.atan2(pr.vy, pr.vx);
    for (let i = 0; i < 2; i++) {
      const a = a0 + (i ? 0.7 : -0.7);
      spawnProj(w, pr.x, pr.y, a, pr.src, { noMods: true, mSplit: 1, speed: 460, vx: Math.cos(a) * 460, vy: Math.sin(a) * 460, life: 0.9, dmg: pr.dmg * 0.5, r: Math.max(2, pr.r * 0.7),
        pierce: 0, bounce: 0, homing: 8, explode: 0, chainHit: 0, aura: 0, boomerang: 0, hits: [e.id] });
    }
    ring(pr.x, pr.y, 14, w.def.color, 0.2, 2);
  }
}

// ---------------------------------------------------------------- each frame (v10.js v10Tick)
function mutTick(dt) {
  const st = mutSt(); if (!st) return;
  const P = G.P, p = G.player, now = G.t;
  const moving = Math.hypot(p.vx, p.vy) > 45;
  // Concentration: slower drain (refund part of what the bar lost while draining), and the base drain constant
  if (G.conc) for (const e of G.enemies) {
    if (e.dead || !e.cd) continue;
    const c = e.cd, pv = e.mB || (e.mB = {});
    for (const t in G.conc) {
      const k = { acid: 'acid', fire: 'fire', soul: 'soul', force: 'force' }[t];
      if (pv[k] != null && c.bars[k] < pv[k] && c.barQuietT[k] > COMBAT.barDelay) c.bars[k] += (pv[k] - c.bars[k]) * (1 - 1 / (1 + 0.25 * G.conc[t]));
      pv[k] = c.bars[k];
    }
  }
  // Slipstream
  const sl = mr('m_slip');
  if (sl) { st.slipT = moving ? Math.min(3, st.slipT + dt) : Math.max(0, st.slipT - dt * 2); st.slipK = 1 + (0.2 + 0.1 * (sl - 1)) * st.slipT / 3; }
  if (mr('x_still')) st.csK = moving ? 1.2 : 0.8;
  // Extra Padding
  const pd = mr('m_pad');
  if (pd) { const cap = 0.05 * P.maxHp * pd; if (p.hp >= P.maxHp - 0.01) st.padOk = true; if (st.padOk) st.pad = Math.min(cap, st.pad + cap * dt / 2); st.pad = Math.min(st.pad, cap); }
  // Heartbeat
  const hb = mr('m_heart');
  if (hb) {
    st.hbT -= dt;
    if (st.hbT <= 0) {
      st.hbT = 3 / (1 + 0.25 * (hb - 1));
      const R = (60 + 60 * clamp(p.hp / P.maxHp, 0, 1)) * (1 + 0.1 * (hb - 1));
      ring(p.x, p.y, R, '#ffd6e0', 0.35, 4);
      mutBurst(p.x, p.y, R, 12 * P.might * (1 + 0.4 * (hb - 1)), 'Heartbeat', 'heart');
    }
  }
  const ps = mr('m_space'), pass = mr('t_static');
  if (ps || pass) for (const e of G.enemies) {
    if (e.dead) continue;
    if (ps) {
      if (Math.hypot(e.x - p.x, e.y - p.y) < 90 + e.r * 0.5 && !mutSnared(e)) {
        e.mPsT = (e.mPsT || 0) + dt;
        if (e.mPsT >= 1 - 0.15 * (ps - 1)) { e.mPsT = -1.5; fightStatus(e, 'ice', 0, { wname: 'Personal Space' }); }
      } else if (e.mPsT > 0) e.mPsT = 0; else if (e.mPsT < 0) e.mPsT = Math.min(0, e.mPsT + dt);
    }
    if (pass) {
      if (e.chargeT > now) e.mChg = 1;
      else if (e.mChg) {
        e.mChg = 0;
        if (e.mNoPass) e.mNoPass = false;
        else if (Math.random() < 0.3 + 0.1 * (pass - 1)) {
          let best = null, bd = 110;
          for (const o of G.enemies) { if (o.dead || o === e || o.chargeT > now) continue; const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; best = o; } }
          if (best) { best.chargeT = now + 3; best.mNoPass = true; bolt(e.x, e.y, best.x, best.y, MUT_COL.static, 0.15); }
        }
      }
    }
  }
  // blood pools: Bad Blood bleeds, Conductive Mess spreads Charge
  if (mr('t_blood') || mr('r_mess')) for (const z of G.zones) {
    if (z.life <= 0 || !z.src || z.src.wname !== 'blood pool') continue;
    let any = false;
    const inside = [];
    forNear(z.x, z.y, z.r, e => { if (!e.dead) inside.push(e); });
    for (const e of inside) {
      if (z.bad && !(e.mBBT > now)) { e.mBBT = now + 0.8; fightStatus(e, 'arcane', 12 * P.might, { wname: 'Bad Blood' }); }
      if (e.chargeT > now) any = true;
    }
    if (any && mr('r_mess')) for (const e of inside) if (!(e.chargeT > now)) { e.chargeT = now + 3; e.mNoPass = true; bolt(z.x, z.y, e.x, e.y, MUT_COL.static, 0.12); }
  }
  // Leave a Little Something: one last tick at double damage as a Pool ends
  for (const z of G.zones) {
    if (z.lls || z.life > 0.25 || z.life <= 0 || !z.src || !z.src.w || !wmN(z.src.w, 'w_pool')) continue;
    z.lls = true;
    const hs = Object.assign({}, z.src, { noCrit: true, knock: 0, zoneHit: true });
    ring(z.x, z.y, z.r, z.src.w.def.color, 0.3, 4);
    forNear(z.x, z.y, z.r, e => { if (!e.dead) damageEnemy(e, z.dps * 0.5 * wmN(z.src.w, 'w_pool'), hs); });
  }
  // drops: fragments (every 5 heal 4%) and wisps (heal 3% or +20% attack speed for 3 s)
  for (const d of st.drops) {
    d.life -= dt;
    const dx = p.x - d.x, dy = p.y - d.y, l = Math.hypot(dx, dy) || 1;
    if (l < 90) { d.x += dx / l * 220 * dt; d.y += dy / l * 220 * dt; }
    if (l < p.r + 14) {
      d.life = 0;
      if (d.k === 'frag') { st.frags++; if (st.frags % 5 === 0) healPlayer(P.maxHp * 0.04); }
      else if (Math.random() < 0.5) healPlayer(P.maxHp * 0.03); else { st.wispT = now + 3; floatText(p.x, p.y - 30, 'FASTER', MUT_COL.soul, 12, 0.7); }
    }
  }
  st.drops = st.drops.filter(d => d.life > 0);
  for (const f of st.fly) {
    f.life -= dt;
    const t = f.tgt;
    if (!t || t.dead) { f.life = 0; continue; }
    const dx = t.x - f.x, dy = t.y - f.y, l = Math.hypot(dx, dy) || 1;
    f.x += dx / l * Math.min(l, 420 * dt); f.y += dy / l * Math.min(l, 420 * dt);
    if (l < t.r + 6) {
      f.life = 0; t.wispKill = true;
      const c = fightCd(t); c.bars.soul += 0.25; c.barQuietT.soul = 0;
      if (c.bars.soul >= 1) { c.bars.soul = 0; fightPayoff(t, 'possess', { raw: 0 }, {}); }
    }
  }
  st.fly = st.fly.filter(f => f.life > 0);
}

// ---------------------------------------------------------------- drawing (v10.js v10Draw, world space)
function mutDraw() {
  const st = G && G.mut10; if (!st) return;
  const p = G.player, t = G.t;
  if (st.pad > 0.5) { ctx.save(); ctx.strokeStyle = col('#5aa9ff'); ctx.globalAlpha = 0.35 + 0.4 * Math.min(1, st.pad / (0.05 * G.P.maxHp * Math.max(1, mr('m_pad')))); ctx.lineWidth = 2; ctx.setLineDash([4 * S, 3 * S]); ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), (p.r + 7) * S, 0, TAU); ctx.stroke(); ctx.restore(); }
  for (const d of st.drops) {
    const wisp = d.k === 'wisp', x = sx(d.x), y = sy(d.y + Math.sin(t * 5 + d.x) * 2);
    ctx.save(); ctx.globalAlpha = Math.min(1, d.life / 2); ctx.fillStyle = col(wisp ? MUT_COL.soul : '#e8d9b0');
    ctx.beginPath(); ctx.arc(x, y, (wisp ? 5 : 3) * S, 0, TAU); ctx.fill();
    if (wisp) { ctx.globalAlpha *= 0.4; ctx.beginPath(); ctx.arc(x, y, 9 * S, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  for (const f of st.fly) { ctx.save(); ctx.fillStyle = col(MUT_COL.soul); ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y), 4 * S, 0, TAU); ctx.fill(); ctx.restore(); }
}
