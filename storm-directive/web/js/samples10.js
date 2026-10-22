'use strict';
// Spawn Prawn - the eight v10 samples (redesign docs/SAMPLES.md): the character you play.
//  - Each sample: a primary and support damage type (the draft's pool lean, G.sampleTypes), one passive, its three starting weapons
//    (BASE_WEAPONS.md 5), a strain number for the Scientist's IDs (1A, 1B; 2A ...). Unique Feats come from
//    feats10.js when it registers them (s10UniqueFeat); until then a sample starts with no Feat.
//  - Built-in defence: only Ordered Online (20% Evasion, no Genome slot; its Evasion card is not offered).
//  - Unlocks (V11): rescue the sample as a kindred spirit in The Race (kindred.js); the old conditions (unlock.txt) are
//    retired. META.s10 holds unlocked ids; developer mode unlocks all. Passives read s10Has: yours plus any absorbed.
//  - The sample screen: pick a sample, then an Experiment (The Petri Dish, The Race, Endless and Level 1: flags S10_PETRI, S10_ENDLESS, S10_LEVELS).
//  - Three starters each (w24Starters); S10_ALL opens every sample for testing; shield flag for pdef.js (s10Shield); Not of This World
//    shifts w.typeOver on its weapons (read by fight.js fightHit).
// Hooks: v10.js v10Samples -> s10Samples, v10Loot 'start' -> s10Start, v10Tick -> s10Tick; fight.js fightHit ->
// s10DmgMul and s10Hit; fight.js fightDeath -> s10Kill; pdef.js pdEvasion and pdefOffer -> s10Evasion.

const S10_TYPES = { force: 'phys', acid: 'fire', static: 'shock', mucus: 'ice', blood: 'arcane', soul: 'soul', fire: 'flame' };
const S10_PETRI = true; // the Experiment picker shows #002 The Petri Dish (s002, wave mode)
const S10_ENDLESS = true; // #006 Endless (s006)
const S10_LEVELS = true; // Level 1 (s007, levels.js), not named until it has been beaten (lvName)
let S10_ALL = true; // every sample open from the start for testing (the unlock rules below stay in code; set false to restore them)
const SAMPLES10 = [
  { id: 'baseline', name: 'Baseline', origin: 'Human', types: ['force', 'blood'], passive: 'Within Normal Limits',
    pdesc: '+5% to every base stat. No conditions, no caveats.', line: 'There. That\'s the egg. Go to the egg. We have one job.',
    sci: 'Sample {id} established as control. It continues to be disappointingly difficult to kill.', unlock: null },
  { id: 'alpha', name: 'Alpha', origin: 'Human', types: ['static', 'force'], passive: 'No Days Off',
    pdesc: 'Fires 25% faster while moving. Back to normal the moment it stops.', line: 'Real talk. Women, sorry, eggs, want a provider. Ninety-eight per cent of sperm are betas. Be the two per cent.',
    sci: 'Sample {id} describes itself as the top 1% of specimens. It is one of approximately 250 million.', unlock: { txt: 'Reach wave 10 of the Petri Dish in one run.' } },
  { id: 'beta', name: 'Beta', origin: 'Human', types: ['blood', 'mucus'], passive: 'Not Dead Yet',
    pdesc: 'Below 30% health: more damage and a little lifesteal, more the closer it is to death.', line: 'We meant to do that. Getting hit is how we learn. The egg isn\'t going anywhere. Neither are we, ideally.',
    sci: 'Sample {id} was initially classified as sluggish. Its subsequent behaviour has made that classification difficult to defend.', unlock: { txt: 'Recover from below 10% health to full health in one run.' } },
  { id: 'private', name: 'Private Schooled', origin: 'Human (paperwork sealed)', types: ['acid', 'soul'], passive: 'Who Do You Think You\'re Dealing With?',
    pdesc: 'Acid builds Corrosion 50% faster. Enemies it Possesses hit their old friends 50% harder.', line: 'That\'s the one in charge. Go say hello. Actually, don\'t bother. They\'ll come to us.',
    sci: 'Sample {id} arrived with complete documentation. The donor\'s identity remains confidential. The accompanying note was written in familiar handwriting.', unlock: { txt: 'Beat the Petri Dish with any sample.' }, shield: true },
  { id: 'ordered', name: 'Ordered Online', origin: 'Synthetic (nanobot)', types: ['mucus', 'fire'], passive: 'Nothing Sticks',
    pdesc: 'Leaves a Mucus trail while moving that Snares whatever follows. 20% Evasion, built in.', line: 'Unit activated. Delivery address confirmed: egg. Threat level: everything. Thank you for choosing you.',
    sci: 'Sample {id} arrived in an anti-static bag. It is not biological. It has been filed as biological, as the form has no other box.', unlock: { txt: 'Open a Mythical box.' }, evasion: 0.2 },
  { id: 'redtail', name: 'Redtail', origin: 'Unknown', types: ['fire', 'static'], passive: 'Touch Everything',
    pdesc: 'Static hits also add to the target\'s burn.', line: 'What\'s that? Can we touch it? We touched it. Oh, it\'s hot. OH, EVERYONE\'S HOT. DO IT AGAIN!',
    sci: 'Sample {id} was discovered outside the laboratory. The door was locked. Eleven minutes of footage are missing.', unlock: { txt: 'Survive one of the slide\'s rare big hazards.' } },
  { id: 'prawn', name: 'Prawn Again', origin: 'Impossible', types: ['soul', 'blood'], passive: 'Collateral Memory',
    pdesc: 'Enemies it Possesses make their old friends Bleed.', line: 'There you are. You were here before. Keep going. The ending is different this time.',
    sci: 'Sample {id} was not introduced to the slide. The count is correct. No amendment is required.', unlock: { txt: 'Land a boss\'s killing blow with Alien damage.', secret: true } },
  { id: 'alien', name: 'Not of This World', origin: 'Extraterrestrial', types: ['fire', 'soul', 'static'], passive: 'Adaptive Biology',
    pdesc: 'Its weapons shift between Fire, Alien and Static every 20 seconds.', line: 'The egg is there. The egg has always been there. We are late to our appointment. Proceed with the arriving.',
    sci: 'Sample {id} has responded to the target. The target has not yet been introduced.', unlock: { txt: 'Beat the campaign\'s furthest level.' }, shift: ['flame', 'soul', 'shock'], shield: true },
];
for (const s of SAMPLES10) s.weapons = w24Starters(s.id); // (the sample's three starters: weapons24.js)
const S10_BY = Object.fromEntries(SAMPLES10.map((s, i) => [s.id, Object.assign(s, { strain: i + 1 })]));

// Each sample is also a profile (genes.js applies it at the start of a run).
for (const s of SAMPLES10) {
  PROFILES['s10_' + s.id] = { name: s.name, trait: s.passive, fmt: () => s.pdesc, desc: s.pdesc, weapons: s.weapons, s10: s.id,
    apply: s.id === 'baseline' ? (P, k) => { const g = Math.sign(k) || 1; P.might += 0.05 * g; P.haste += 0.05 * g; P.maxHp += 6 * g; P.speed += 0.05 * g; P.reloadSpd += 0.05 * g; } : () => {} };
  if (typeof SEQ_LOOK !== 'undefined') SEQ_LOOK['s10_' + s.id] = Object.assign({}, SEQ_LOOK.human1 || SEQ_LOOK.vanguard, { short: s.name.replace('The ', '').toUpperCase() });
}

const s10Of = () => (G && G.genes && PROFILES[G.genes.primary] && PROFILES[G.genes.primary].s10) || null;
const s10Is = id => s10Of() === id;
const s10Shield = () => !!(G && G.s10 && SAMPLES10.some(s => s.shield && s10Has(s.id)));
// Is this sample's passive on? Your own, or one absorbed this run (kindred.js).
const s10Has = id => !!(G && G.s10 && (G.s10.id === id || (typeof kinHas === 'function' && kinHas(id)))); // (Private Schooled and Not of This World: pdef.js reads it)
const s10Open = id => S10_ALL || !S10_BY[id].unlock || !!META.devAll || !!(META.s10 && META.s10[id]);
function s10Unlock(id) {
  if (!S10_BY[id] || s10Open(id)) return;
  (META.s10 || (META.s10 = {}))[id] = 1; saveMeta();
  if (G) banner('NEW SAMPLE: ' + S10_BY[id].name.toUpperCase(), '#ffd23f');
}

// ---------------------------------------------------------------- run start (v10Loot 'start')
function s10Start() {
  const id = s10Of(); if (!id) return null;
  const s = S10_BY[id];
  G.sampleTypes = { primary: s.types[0], support: s.types[1] };
  G.s10 = { id, strain: s.strain, run: ((META.s10runs && META.s10runs[id]) || 0) + 1, ev: s.evasion || 0, shiftT: 20, shiftI: 0, trailT: 0, low: false };
  (META.s10runs || (META.s10runs = {}))[id] = G.s10.run; saveMeta();
  if (typeof s10UniqueFeat === 'function') s10UniqueFeat(id); // (feats10.js puts the sample's Feat in slot 1)
  return s.weapons.map(id => optNewWeapon(id, 0)); // (the draft offers its three starters; the other two stay in the pool)
}
const s10Evasion = () => (G && G.s10 && G.s10.ev) || 0;

// ---------------------------------------------------------------- each frame (v10Tick)
function s10Tick(dt) {
  const S = G.s10; if (!S) return;
  const p = G.player, moving = Math.hypot(p.vx || 0, p.vy || 0) > 20;
  if (s10Has('alpha')) for (const w of G.weapons) if (w) w.rateK = moving ? 1.25 : 1;
  if (s10Has('ordered') && moving && (S.trailT -= dt) <= 0) { // a Mucus ribbon that Snares whatever follows
    S.trailT = 0.3;
    const mine = G.zones.filter(z => z.s10trail);
    if (mine.length >= 18) mine[0].life = 0;
    G.zones.push({ x: p.x, y: p.y, r: 26, life: 3, max: 3, dps: 0.5, elem: 'ice', pull: 0, color: ELEMENTS.ice.color, tick: 0, s10trail: true, src: { elem: 'ice', wname: 'Mucus trail', noCrit: true } });
  }
  if (s10Has('alien')) { if ((S.shiftT -= dt) <= 0) s10Shift(S); else s10Apply(S); } // (weapons picked up later take the type too)
  // (Unlocks: the old watch conditions retired in V11; a sample unlocks when you rescue it in The Race, kindred.js.)
}
// Not of This World: every weapon it holds takes the next type (w.typeOver, an internal elem id read by fight.js fightHit
// and weapons24.js); weapon ids, levels and cards stay put.
function s10Apply(S) { const to = S10_BY.alien.shift[S.shiftI]; for (const w of G.weapons) if (w && w.typeOver !== to) w.typeOver = to; }
function s10Shift(S) {
  const cyc = S10_BY.alien.shift;
  S.shiftT = 20; S.shiftI = (S.shiftI + 1) % cyc.length;
  const to = cyc[S.shiftI];
  s10Apply(S);
  G.sampleTypes = { primary: { flame: 'fire', soul: 'soul', shock: 'static' }[to], support: 'soul' };
  const p = G.player; ring(p.x, p.y, 60, ELEMENTS[to].color, 0.5, 5); floatText(p.x, p.y - 34, ELEMENTS[to].name.toUpperCase(), ELEMENTS[to].color, 14, 1.2);
}

// ---------------------------------------------------------------- hits (fight.js fightHit)
function s10DmgMul(e, src) {
  const S = G.s10; if (!S) return 1;
  let k = 1;
  if (s10Has('beta') && G.player.hp < G.P.maxHp * 0.3 && !src.fromAlly) k *= 1 + (1 - G.player.hp / G.P.maxHp); // up to about +100% at death's door
  if (s10Has('private') && src.fromAlly) k *= 1.5;
  return k;
}
function s10Hit(e, src, res, t) {
  const S = G.s10; if (!S || res.miss) return;
  if (s10Has('beta') && G.player.hp < G.P.maxHp * 0.3 && res.toHp > 0 && !src.fromAlly) healPlayer(res.toHp * 0.04 * (1 - G.player.hp / G.P.maxHp), true);
  if (s10Has('private') && t === 'acid' && res.statusOk) { const c = e.cd; c.bars.acid += 0.5 * res.raw / (COMBAT.barSize.acid * Math.max(1, c.layers) * c.maxHp * COMBAT.rankBarK[c.rank || 'normal']); }
  if (s10Has('redtail') && t === 'static' && res.statusOk && !e.dead) burnAdd(fightCd(e), res.raw);
  if (s10Has('prawn') && src.fromAlly && res.toHp > 0 && !e.dead) fightStatus(e, 'arcane', res.raw, src);
}
// fight.js fightDeath.
function s10Kill(e, src) { } // (its unlock retired in V11: kindred.js)

// ---------------------------------------------------------------- the sample screen (v10Samples)
function s10Samples() {
  const card = (attr, no, name, desc, c, tag, off) => uiSampleCard({ cls: `hero${off ? ' locked' : ''}`, attrs: attr, style: `--c:${c}${off ? ';opacity:0.45' : ''}`, kicker: `#${no}${off ? ' | LOCKED' : ' | IN STOCK'}`, name: esc(name), desc: esc(desc), tag });
  const list = SAMPLES10.map(s => {
    const open = s10Open(s.id), col = ELEMENTS[S10_TYPES[s.types[0]]].color;
    const nm = !open && s.unlock.secret ? '???' : s.name;
    const desc = open ? s.passive + ': ' + s.pdesc : 'Rescue it when it turns up stranded in The Race.'; // (rescue it in The Race: kindred.js)
    const c = card(`data-s10="${s.id}"`, String(s.strain).padStart(3, '0'), nm, desc, col, open ? s.types.map(t => t.toUpperCase()).join(' / ') : 'LOCKED', !open);
    return c.replace('<span class="sx-txt">', `<canvas data-slpic="${s.id}" style="position:relative;inset:auto;flex:none;display:block;width:100%;height:${s.id === 'alien' ? 120 : 96}px"></canvas><span class="sx-txt">`); // (its picture: samplelooks.js)
  }).join('');
  let dev = false; try { dev = localStorage.getItem('sd_dev') === '1'; } catch (e) { /* storage unavailable */ }
  $('sampleList').innerHTML = `${uiSectionHead('SAMPLES')}${list}` + (dev ? `${uiSectionHead('DEVELOPER')}${card('data-v10="s000"', '000', 'Lab Bench (Debug)', 'Spawn anything, god mode.', '#9fb3c8', 'DEBUG')}${sbCards()}` : ''); // (Sandbox: sandbox.js)
  $('sampleList').querySelectorAll('[data-s10]').forEach(b => b.addEventListener('click', () => { if (s10Open(b.dataset.s10)) s10Modes(b.dataset.s10); }));
  $('sampleList').querySelectorAll('[data-v10]').forEach(b => b.addEventListener('click', () => { UI.sample = b.dataset.v10; META.profile = 's10_baseline'; saveMeta(); UI.startGame(true); }));
  sbWire();
  if (typeof slPicStart === 'function') slPicStart(); // (samplelooks.js)
  UI.show('samples');
  return true;
}
function s10Modes(id) {
  const s = S10_BY[id], c = ELEMENTS[S10_TYPES[s.types[0]]].color;
  const card = (mode, no, name, desc, tag) => uiSampleCard({ cls: 'hero', attrs: `data-mode="${mode}"`, style: `--c:${c}`, art: typeof pictoSVG === 'function' ? pictoSVG({ s001: 'egg', s002: 'dish', s006: 'endless', s007: 'maze' }[mode] || 'egg') : null, kicker: `#${no}`, name: esc(name), desc: esc(desc), tag });
  $('sampleList').innerHTML = `${uiSectionHead(esc(s.name.toUpperCase()))}<div class="sx-q">"${esc(s.line)}"</div>`
    + card('s001', '001', 'Evolution', 'Four hundred million hopefuls, one egg.', 'RACE TO THE EGG')
    + (S10_PETRI ? card('s002', '002', 'Iteration', 'Twenty drops into the dish, a boss every fifth.', 'WAVE MODE') : '')
    + (S10_ENDLESS ? card('s006', '006', 'Endless', 'The dish keeps topping itself up. Nobody has found the bottom.', 'NO END') : '')
    + (S10_LEVELS ? card('s007', '007', typeof lvName === 'function' && typeof LEVELS !== 'undefined' ? lvName(LEVELS[LV_SAMPLE.s007]) : 'Level 1', 'The first stretch of the way in. Mapped by nobody who came back.', 'CAMPAIGN') : '')
    + uiButton('BACK', { attrs: 'id="s10Back"' });
  $('sampleList').querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { UI.sample = b.dataset.mode; META.profile = 's10_' + id; saveMeta(); UI.startGame(true); }));
  $('s10Back').addEventListener('click', s10Samples);
}
