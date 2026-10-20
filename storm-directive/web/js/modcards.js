'use strict';
// Spawn Prawn - modifier cards and Switched at Birth in the level-up draft (the 24 weapons).
//  - MODIFIER cards: one of the 20 v10 modifiers (modifiers.js MODS10) for a weapon you hold whose attack type fits.
//    A weapon holds at most 3 different modifiers (one Delivery). Taking one it already has ranks it up, to Rank 3;
//    the per-rank numbers live in MODS10 cap arrays (modV), the per-rank card text in MODUP below.
//  - SWITCHED AT BIRTH: a random weapon you hold changes to a random other damage type. It keeps its level, upgrade
//    branch, modifiers and mutations. Always Rare. Never offered in two drafts in a row.
// Hooks: draft.js draftCards -> modDraftCands (candidates for both). The old v10Switch is skipped while this file loads.

const MOD_KINDS = 3; // different modifiers a weapon can hold
const MOD_RAR = [1, 2, 3]; // card rarity by the rank it gives: Uncommon, Rare, Epic
const SAB_RAR = 2; // Rare
// What Rank 2 and Rank 3 add (shown on the card that ranks a modifier up).
const MODUP = {
  homing:      ['Turns harder (7).', 'Turns harder still (9).'],
  piercing:    ['+2 more enemies (4 in all).', '+2 more enemies (6 in all).'],
  chaining:    ['4 jumps, 75% of the last, a little further.', '5 jumps, 80% of the last, further again.'],
  ricochet:    ['3 bounces, losing 15% each.', '4 bounces, losing 10% each.'],
  returning:   ['4 hits; the way back hits 20% harder.', '5 hits; the way back hits 40% harder.'],
  orbiting:    ['Four bodies.', 'Five bodies.'],
  delayed:     ['8 placed at once; blasts +20% damage.', '10 placed at once; blasts +40% damage.'],
  lobbed:      ['Lands sooner; +15% area.', 'Lands sooner still; +30% area.'],
  trail:       ['A piece every 24 units, 50 at most.', 'A piece every 18 units, 60 at most.'],
  selfcentred: ['85% damage around you; +15% area.', 'Full damage around you; +30% area.'],
  sweep:       ['A wider sweep.', 'A wider sweep still.'],
  anchored:    ['Reaches 620; 20% thicker.', 'Reaches 720; 40% thicker.'],
  volley:      ['Four shots a volley.', 'Five shots a volley.'],
  nth:         ['Every third attack is empowered.', 'Every third attack, and harder (x3.2).'],
  growing:     ['Grows to two and a half times.', 'Grows to triple.'],
  scaling:     ['Scales up to x2.5.', 'Scales up to x3.'],
  multiplying: ['Kills split into three; 16 in flight.', 'Splits hit at 60%; 20 in flight.'],
  summoned:    ['Three pets on this weapon.', 'Four pets on this weapon.'],
  gravity:     ['Wider wells, four at once.', 'Wider still, five at once.'],
  lunge:       ['Up to 240 units.', 'Up to 320 units.'],
};

// ---------------------------------------------------------------- modifier cards
const modKinds = w => new Set(w.m10 || []).size;
function modCardOk(w, id) {
  if (!modOk(w, id)) return false;
  return modHas(w, id) || modKinds(w) < MOD_KINDS;
}
function modCard(w, id) {
  const m = MODS10[id], r = modCount(w, id), up = r ? MODUP[id][r - 1] : '';
  return { card: 'mod:' + id, family: 'mod:' + id, rarity: MOD_RAR[r], tag: 'MODIFIER', icon: m.name.slice(0, 1), color: w.def.color, elem: w.def.elem,
    title: m.name + (r ? ' ' + ['', 'II', 'III'][r] : ''), sub: (r ? `Rank ${r} > ${r + 1} of 3` : 'New') + (m.group ? ' | Delivery' : ''), // (the weapon is named below: modFor)
    desc: r ? up : m.desc, modFor: w.def.name, quip: (typeof cardLine === 'function' ? cardLine('mod:' + m.name) : ''), // (ui.js shows "For weapon" on the card)
    apply: () => { modAdd(w, id); computeStats(w); recomputeAll(); } };
}

// ---------------------------------------------------------------- Switched at Birth
// The slot gets its own def over the original (Object.create), so the shared WEAPONS entry keeps its type.
function sabSwitch(w, t) {
  let base = w.def;
  if (base.recol) base = Object.getPrototypeOf(base);
  if (base.sab) base = Object.getPrototypeOf(base);
  const col = (typeof V10_COL !== 'undefined' && V10_COL[t]) || ELEMENTS[t].color;
  w.def = t === base.elem ? base : Object.create(base, { elem: { value: t, enumerable: true }, v10type: { value: t, enumerable: true }, color: { value: col, writable: true, enumerable: true }, sab: { value: true } });
  computeStats(w); recomputeAll();
}
function sabCard() {
  const own = G.weapons.filter(w => w && !w.isSpell && w.def);
  if (!own.length) return null;
  const w = pick(own), types = V10_TYPES.filter(t => t !== w.def.elem && ELEMENTS[t]);
  if (!types.length) return null;
  const t = pick(types), E = ELEMENTS[t];
  return { card: 'switch', family: 'switch', rarity: SAB_RAR, tag: 'SWITCHED AT BIRTH', icon: w.def.icon, color: (typeof V10_COL !== 'undefined' && V10_COL[t]) || E.color, elem: t,
    title: `${w.def.name} → ${E.name}`, sub: `${ELEMENTS[w.def.elem] ? ELEMENTS[w.def.elem].name : ''} > ${E.name} | keeps its level and upgrades`,
    desc: `The hospital mixed up the tags. ${w.def.name} now deals ${E.name} damage. Everything else about it stays where it was.`,
    apply: () => { if (G.weapons.includes(w)) sabSwitch(w, t); } };
}

// A DNA strand's cards (draft.js draftLoot): up to n modifier cards, different modifiers, spread over your weapons.
function modBoxCards(n) {
  const c = [];
  for (const w of G.weapons) {
    if (!w || w.isSpell || !w.def || !w.def.v10atk) continue;
    for (const id of modsFor(w)) if (modCardOk(w, id) && !banished('mod:' + id)) c.push({ w, id });
  }
  const out = [], ids = new Set(), ws = new Map(), per = Math.ceil(n / Math.max(1, new Set(c.map(x => x.w)).size)); // (spread over your weapons)
  for (const x of shuffle(c)) {
    if (out.length >= n) break;
    if (ids.has(x.id) || (ws.get(x.w) || 0) >= per) continue;
    ids.add(x.id); ws.set(x.w, (ws.get(x.w) || 0) + 1); out.push(modCard(x.w, x.id));
  }
  return out;
}

// ---------------------------------------------------------------- draft.js draftCards
// Candidates in draftCards' shape: { o: () => option, w: weight, fam }. o() runs only when the card is dealt.
function modDraftCands(kind) {
  const out = [];
  G.draftN = (G.draftN || 0) + 1;
  const box = kind === 'chest' || kind === 'boss'; // modifiers come in DNA strands (loot boxes) only, not level-ups
  for (const w of box ? G.weapons : []) {
    if (!w || w.isSpell || !w.def || !w.def.v10atk) continue;
    for (const id of modsFor(w)) if (modCardOk(w, id) && !banished('mod:' + id)) out.push({ o: () => modCard(w, id), w: famK('mod:' + id) * (modHas(w, id) ? 1.2 : 1), fam: 'mod:' + id });
  }
  if (!banished('switch') && G.sabAt !== G.draftN - 1 && G.weapons.some(w => w && !w.isSpell && w.def)) {
    const n = G.draftN;
    out.push({ o: () => { const c = sabCard(); G.sabAt = n; return c; }, w: 0.6 * famK('switch'), fam: 'switch' });
  }
  return out;
}
