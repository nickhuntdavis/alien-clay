'use strict';
// Spawn Prawn - the 24 weapons (redesign docs/BASE_WEAPONS.md) and their upgrade branches (WEAPON_UPGRADES.md).
//  - W24: the only weapons in the game. 10 foundations (v10 matrix defs, renamed) and 14 signatures (sigweap.js
//    defs, renamed and re-typed). Every other weapon is archived: kept for the Lab Bench, never offered.
//  - Upgrades: Lv 3 pick one of three promises; Lv 6 three cards (the promise's two plus its wildcard); Lv 10 one of
//    three masteries (one weapon a run reaches Lv 10: game.js wCap). Fork screens come from draft.js forkCards.
//  - Card data lives in wup1.js ... wup6.js: wupReg(weaponId, spec). Cards act through the hook set below.
// Hooks: game.js computeStatsInner -> wupStats, fireWeapon -> wupFire; fight.js fightHit -> wupDmgMul, wupHit;
// game.js killEnemy -> wupKill; v10.js v10Tick -> wupTick; draft.js forkCards -> wupForkCards.
//
// Card spec (frozen interface for wup*.js):
//   wupReg(id, {
//     A: { name, tag, costs, shows, modes,                 // a promise
//          lv3: { desc, apply(w) },                         // taking the promise
//          lv6: [ { name, desc, apply(w) }, { name, desc, apply(w) } ],
//          wild: { name, desc, apply(w) } },                // the promise's Lv 6 wildcard
//     B: {...}, C: {...},
//     lv10: [ { name, desc, best: 'A'|'B'|'C'|'AB'..., apply(w) } x3 ] });
//   apply(w) sets state on the slot (w.up holds the choices: { p, l6, l10 }) and adds behaviour with
//   wupOn(w, kind, fn) for kind in:
//     'stats' (w, s)               mutate the computed stats s (after levels and buffs)
//     'fire'  (w, target, src)     return true to replace this weapon's normal firing
//     'hit'   (w, e, res, src)     after a hit of THIS weapon resolved (res from combat.js; res.toHp, res.raw)
//     'dmg'   (w, e, src) -> mult  damage multiplier for this weapon's hits
//     'kill'  (w, e, src)          this weapon killed e
//     'tick'  (w, dt)              every frame while held
//   Where a card is a plain modifier (pierce, ricochet, homing, chaining, orbit, gravity well ...), use
//   modAdd(w, id) from modifiers.js instead of writing it again.

// ---------------------------------------------------------------- the roster
//  id (code), name, internal damage type, attack type, starter of (sample id in samples10.js)
const W24 = [
  ['v_phys_proj', 'Standard Issue', 'phys', 'proj', 'baseline'],
  ['v_phys_spread', 'Maximum Gains', 'phys', 'spread', 'alpha'],
  ['v_phys_contact', 'Nervous Wreck', 'phys', 'contact', 'beta'],
  ['v_phys_burst', 'Panic Button', 'phys', 'burst', 'baseline'],
  ['v_fire_proj', 'Acid Spit', 'fire', 'proj', 'private'],
  ['v_shock_beam', 'Red Flagship', 'shock', 'beam', 'alpha'],
  ['v_ice_pool', 'Nocturnal Emission', 'ice', 'pool', 'beta'],
  ['v_arcane_proj', 'Little Prick', 'arcane', 'proj', 'baseline'],
  ['v_soul_proj', 'Rent Free', 'soul', 'proj', 'private'],
  ['v_flame_pool', 'Hot Mess', 'flame', 'pool', 'ordered'],
  ['s_void', 'Family Ties', 'phys', 'proj', 'alien'],
  ['s_lard', 'Skill Issue', 'phys', 'burst', 'alpha'],
  ['s_siphon', 'There Is No Spoon', 'phys', 'proj', 'alien'],
  ['s_mines', 'Nappy Mines', 'flame', 'burst', 'ordered'],
  ['s_twin', 'Soulmate Signal', 'shock', 'beam', 'alien'],
  ['s_tesla', 'Unwanted Contact', 'shock', 'proj', 'redtail'],
  ['s_redtape', 'Ewww, Gross', 'ice', 'proj', 'private'],
  ['s_bubble', 'Blowing Bubbles', 'ice', 'proj', 'ordered'],
  ['s_duedate', 'One of These Days', 'arcane', 'proj', 'beta'],
  ['s_seeker', 'Sister Cousin', 'arcane', 'proj', 'redtail'],
  ['s_peekaboo', 'Peekaboo', 'soul', 'burst', 'prawn'],
  ['s_toothfairy', 'Eggs', 'soul', 'burst', 'prawn'],
  ['s_parasite', 'Chest Burster', 'soul', 'proj', 'prawn'],
  ['s_wake', 'The Runs', 'flame', 'pool', 'redtail'],
];
const W24_IDS = W24.map(r => r[0]);
// On hold (19 Oct, mechanics under review): never offered, never a starter, hidden from the Field Guide. Code and
// upgrade cards stay (tests and the Lab Bench still use them). Delete an id here to bring that weapon back.
const W24_HOLD = ['s_void', 's_seeker', 's_toothfairy'];
const w24Live = () => W24_IDS.filter(id => !W24_HOLD.includes(id));
const W24_BY = Object.fromEntries(W24.map(([id, name, type, atk, starter]) => [id, { id, name, type, atk, starter }]));
const w24Starters = sample => W24.filter(r => r[4] === sample && !W24_HOLD.includes(r[0])).map(r => r[0]);
// One-line descriptions (BASE_WEAPONS.md, in the game's voice).
const W24_DESC = {
  v_phys_proj: 'A plain, heavy shot. No gimmicks. It keeps firing even when the situation is objectively hopeless.',
  v_phys_spread: 'A wide fan of blunt pellets. The closer you get, the more of them connect. Leg day, every day.',
  v_phys_contact: 'Snaps shut on anything that gets too close. It was not looking for trouble. Trouble found it.',
  v_phys_burst: 'An emergency shockwave. Something got too close and somebody pressed the button.',
  v_fire_proj: 'Hurls a shocking-pink glob that corrodes what it hits. Manners are not a survival strategy.',
  v_shock_beam: 'A sustained electrical beam. It talks for hours, provided nobody challenges the central thesis.',
  v_ice_pool: 'Leaves a sticky green patch that snares whatever crosses it. Nobody mentions it in the morning.',
  v_arcane_proj: 'A thin red needle. Individually unimpressive. Repeated, it becomes a problem.',
  v_soul_proj: 'A pale spirit-kernel that glides through with an unsettling sense of authority.',
  v_flame_pool: 'Splashes down a burning patch that stays put. The floor is unwell.',
  s_void: 'A slow little vortex that drags enemies in and bends your other shots. Five that merge go supernova.',
  s_lard: 'A heavy dollop that sends enemies flying into each other. If it goes wrong, that is a skill issue.',
  s_siphon: 'Eats enemy bullets near you and fires them back as hard as they hit you.',
  s_mines: 'Drops mines behind you. Each blast fills a Burn bar and leaves a small burning patch.',
  s_twin: 'A beam joins you to your twin across the crowd. Swim, and drag it through them.',
  s_tesla: 'Chains electricity through a crowd. Your other weapons arc again off anything it Charged.',
  s_redtape: 'Tapes enemies together with Mucus. Whatever hurts one hurts the bundle (35% of it).',
  s_bubble: 'Traps small enemies in bubbles. Anything that touches a bubble pops it.',
  s_duedate: 'Sticks a countdown on a big target. When it ends, 40% of what it took lands again.',
  s_seeker: 'Two homing siblings per shot. A sibling that kills splits in two. Family is complicated.',
  s_peekaboo: 'You vanish; enemies swarm the empty spot and shoot each other. Then BOO: Fear.',
  s_toothfairy: 'Drops spectral eggs that lure greedy enemies, then smite whoever takes one.',
  s_parasite: 'Infects enemies. The ones that die rise for a few seconds and fight for you.',
  s_wake: 'No aiming: you leave a burning trail wherever you swim.',
};

// Rename and re-type the 24; archive everything else.
for (const [id, name, type] of W24) {
  const d = WEAPONS[id];
  if (!d) { console.warn('weapons24: missing ' + id); continue; }
  d.name = name; d.desc = d.play = W24_DESC[id] || d.desc; d.v10type = type; d.elem = type; d.color = V10_COL[type] || d.color;
  d.icon = name.replace(/[^A-Za-z ]/g, '').split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  d.w24 = 1; d.archived = 0;
}
for (const id in WEAPONS) if (!WEAPONS[id].w24) WEAPONS[id].archived = 1;
for (const id of W24_HOLD) if (WEAPONS[id]) WEAPONS[id].archived = 1; // (on hold: see W24_HOLD)
const w24Key = w => (w && (w.sid || w.id)) || null; // (signature slots keep the old id in w.id, the s_ id in w.sid)

// ---------------------------------------------------------------- the upgrade engine
const WUP = {};
function wupReg(id, spec) { WUP[id] = spec; }
function wupOn(w, kind, fn) { const H = w.uh || (w.uh = {}); (H[kind] || (H[kind] = [])).push(fn); }
const wupUp = w => w.up || (w.up = {});
// Hooks (each a no-op unless a card added behaviour to that slot).
function wupStats(w, s) { if (w.uh && w.uh.stats) for (const f of w.uh.stats) f(w, s); }
function wupFire(w, target, src) { if (!w.uh || !w.uh.fire) return false; let took = false; for (const f of w.uh.fire) if (f(w, target, src)) took = true; return took; }
function wupDmgMul(e, src) { const w = src && src.w; if (!w || !w.uh || !w.uh.dmg) return 1; let k = 1; for (const f of w.uh.dmg) k *= f(w, e, src) || 1; return k; }
function wupHit(e, res, src) { const w = src && src.w; if (w && w.uh && w.uh.hit && !src.wupEcho) for (const f of w.uh.hit) f(w, e, res, src); }
function wupKill(e, src) { const w = src && src.w; if (w && w.uh && w.uh.kill) for (const f of w.uh.kill) f(w, e, src); }
function wupTick(dt) { if (!G) return; for (const w of G.weapons) if (w && w.uh && w.uh.tick) for (const f of w.uh.tick) f(w, dt); }
// Re-apply a slot's choices to a rebuilt slot (makeSlot loses w.uh; e.g. a type shift).
function wupCarry(from, to) {
  const S = WUP[w24Key(to)], U = from.up; if (!S || !U) return;
  to.up = Object.assign({}, U); to.uh = null;
  if (U.p && S[U.p]) S[U.p].lv3.apply(to);
  const l6 = U.p && S[U.p] && [...S[U.p].lv6, S[U.p].wild].find(c => c.name === U.l6); if (l6) l6.apply(to);
  const l10 = S.lv10 && S.lv10.find(c => c.name === U.l10); if (l10) l10.apply(to);
  computeStats(to);
}
// ---------------------------------------------------------------- weapon tiers (user, 18 Oct)
// A weapon has four tiers: 1 (as drafted), 2 (a promise), 3 (a branch card), 4 (a mastery, one weapon a run). Every
// step is a branch choice, never a stat card. Internally the slot keeps the old level scale (1, 3, 6, 10), so stats,
// combos, the mastery cap (game.js wCap) and the card engine below work unchanged. Weapon upgrades are their own
// screen every WUP_EVERY player levels (draft.js draftLoot 'wup'); normal drafts carry no weapon cards.
const WUP_TIER = [1, 3, 6, 10], WUP_EVERY = 4;
const wTier = w => (w && !w.isSpell && w.def && w.def.w24 ? WUP_TIER.filter(l => w.lvl >= l).length : w ? w.lvl : 0);
const wTierMax = w => (w && !w.isSpell && w.def && w.def.w24 ? 4 : MAX_WLVL);
const wLvText = w => 'Lv ' + wTier(w) + '/' + wTierMax(w);
// The next internal level for this slot, or 0 when it has none (top tier, or the run's mastery is taken elsewhere).
function wupNextLv(w) {
  if (!w || w.isSpell || !w.def.w24 || !WUP[w24Key(w)]) return 0;
  const nx = WUP_TIER.find(l => l > w.lvl);
  return nx && nx <= wCap(w) ? nx : 0;
}
const wupReady = () => (G ? G.weapons.filter(w => wupNextLv(w)) : []);
// Between tiers a weapon still grows with you (stats only, never a card): up to 3 old levels past its tier, at one per 3 player levels.
const wStatLv = w => Math.max(w.lvl, Math.min(w.lvl + 3, 1 + Math.floor(((G && G.level) || 1) / 3)));
function wupLevel(lv) {
  if (lv % 3 === 0) recomputeAll();
  if (lv % WUP_EVERY === 0 && wupReady().length) G.lootQueue.push({ kind: 'wup', v10ok: true });
} // (game.js gainXp)
// The weapon upgrade screen: with one weapon ready, its branch cards straight away; with more, pick the weapon first.
// A weapon's branch cards for its next tier; taking one moves the slot up to that tier.
const wupRaise = (w, lv) => (wupForkCards({ w, lv }) || []).map(c => Object.assign(c, { apply: (ap => () => { w.lvl = lv; ap(); computeStats(w); })(c.apply) }));
function wupCards() {
  const ready = wupReady();
  if (ready.length === 1) return wupRaise(ready[0], wupNextLv(ready[0]));
  return ready.map(w => {
    const lv = wupNextLv(w), t = WUP_TIER.indexOf(lv) + 1;
    return { rarity: 3, tag: 'WEAPON UPGRADE', icon: w.def.icon, color: w.def.color, def: w.def, title: w.def.name, sub: `Tier ${t - 1} > ${t}`,
      desc: t === 2 ? 'Choose one of three promises. The other two are gone for the run.' : t === 3 ? 'Choose how its promise grows.' : 'Its mastery. Only one weapon a run gets one.',
      apply: () => G.lootQueue.unshift({ kind: 'wupfork', w, lv, v10ok: true }) };
  });
}
const wupForkReq = req => (wupNextLv(req.w) === req.lv ? wupRaise(req.w, req.lv) : []); // (the chosen weapon's screen)

// The fork screen (draft.js forkCards): Lv 3 promises, Lv 6 the taken promise's cards, Lv 10 masteries.
function wupForkCards(req) {
  const w = req.w, S = w && WUP[w24Key(w)];
  if (!S) return null;
  const U = wupUp(w), col = w.def.color, sub = `${w.def.name} | Tier ${WUP_TIER.indexOf(req.lv) + 1}`;
  const card = (title, desc, fn, tag) => ({ rarity: 3, tag: tag || 'BRANCH', icon: 'B', color: col, title, sub, desc, apply: () => { fn(); computeStats(w); } });
  if (req.lv === 3) return ['A', 'B', 'C'].filter(k => S[k]).map(k => card(S[k].name, S[k].lv3.desc + (S[k].costs ? ' Costs: ' + S[k].costs : ''), () => { U.p = k; S[k].lv3.apply(w); }, 'PROMISE'));
  if (req.lv === 6) {
    const P = S[U.p]; if (!P) return null;
    return [...P.lv6, P.wild].filter(Boolean).map((c, i) => card(c.name || ('Lv 6: ' + P.name), c.desc, () => { U.l6 = c.name; c.apply(w); }, i === 2 ? 'WILDCARD' : 'BRANCH'));
  }
  if (req.lv === 10 && S.lv10) return S.lv10.map(c => card(c.name, c.desc + (c.best ? ` (Best with ${c.best.split('').map(k => S[k] ? S[k].name : k).join(', ')}.)` : ''), () => { U.l10 = c.name; c.apply(w); }, 'MASTERY'));
  return null;
}
