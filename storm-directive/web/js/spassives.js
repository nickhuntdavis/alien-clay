'use strict';
// Spawn Prawn - sperm passives, first pass (redesign docs/SPERM_PASSIVES.md; COMBAT_MATRIX decisions 52 to 55;
// IMPLEMENTATION_PLAN.md Phases 1 and 2).
//  - Sperm passives replace the Genome slots. For now they are the shipped Genome mutations (mutations.js) and the
//    defence cards (pdef.js), dealt in level-up drafts only.
//  - SLOTS: 2 at the start, then +1 at run Lv 8, 16 and 24 (SP.at). Defences share them (draft.js reads DRAFT.genome).
//  - Cut in the re-sort (SPERM_PASSIVES.md 4): Spare Parts, Personal Space, Quantity Over Quality, and the merged
//    Hard to Hold and No Time for Being Careful; weapon mutations are never dealt (they fold into modifiers).
//  - Retired: elite mutation drops (mutdrop.js), mid-run sequence splices (genes.js genesLevel), and the built-in
//    shields of Private Schooled and Not of This World: the membrane comes only from its card (decision 54).
//    Samples still apply their own profile at the start of a run (genesStart is untouched).
//  - Runs hold 3 weapons at most: combos.js COMBO_MOUNTS is 0 (decision 55).
//  - MASTERY: a passive at Rank 3 can take a 4th card, its mastery (for now its numbers one step further: the formulas in
//    mutations.js are linear in rank). One sperm-passive mastery per build; EXTRA MASTERY (a passive) adds one more of
//    either kind, weapon modifier or sperm passive (spMasteryRoom, also read by modmatrix.js).
//  - THE RUNS: a sperm passive now. A hidden trail slot (the old s_wake) in the sample's primary damage type, run each
//    frame (arsenal.js updateWake). Lv 2: pieces last 50% longer and are 50% wider; Lv 3: +50% damage; mastery +100%.
//  - MEMBRANE SHIELD: the Latex Protection card is the shield; Thicker Membrane and Faster Recharge are its levels
//    (one rank each; they use no slot of their own: pdef.js pdHeld, draft.js defsHeld).
// Not built yet (later passes): transforming masteries (Internal Ricochet...), the reworked passives (Pile-Up...), pairs.
// Hooks: mutdrop.js mdDraftSkip -> spSkip. Replaces genes.js genesLevel; wraps v10.js v10Tick (The Runs). Loads after
// mutdrop.js and samples10.js.

const SP = { on: true, base: 2, at: [8, 16, 24], cut: ['m_parts', 'm_space', 'm_hold', 'x_qty', 'x_careless'] };
const spSlots = () => (typeof mmFree === 'function' && mmFree() ? 99 : 0) + SP.base + SP.at.filter(l => ((G && G.level) || 1) >= l).length;
Object.defineProperty(DRAFT, 'genome', { get: () => spSlots(), configurable: true });

// draft.js (through mutdrop.js mdDraftSkip): which mutation cards stay out of level-up drafts.
const spSkip = c => c.slot === 'weaponmut' || SP.cut.includes(c.id) || (typeof sliceSkip === 'function' && sliceSkip(c)); // (sliceSkip: slice-only testing, spslice.js)

// Retired sources.
MUTDROP.chance = 0;
genesLevel = function () {};
for (const s of SAMPLES10) s.shield = false;

// ---------------------------------------------------------------- masteries
// kind 'sperm' or 'weapon': one of each per build; Extra Mastery's extra goes to whichever comes first.
function spMasteryRoom(kind) {
  if (!G) return false;
  const sm = (G.spM || []).length, wm = (G.mmM || []).length, extra = mr('sp_extra') ? 1 : 0;
  const over = Math.max(0, sm - 1) + Math.max(0, wm - 1);
  const mine = kind === 'sperm' ? sm : wm;
  return mine < 1 || over < extra;
}
for (const c of MUT_REG) {
  if (c.slot !== 'genome' || c.maxRank !== 3) continue;
  const el = c.eligible, ap = c.apply;
  c.maxRank = 4;
  c.eligible = G => el(G) && (mr(c.id) < 3 || spMasteryRoom('sperm'));
  c.apply = (G, target) => { const r0 = mr(c.id); ap(G, target); if (r0 === 3 && mr(c.id) === 4) (G.spM || (G.spM = [])).push(c.id); };
}

// ---------------------------------------------------------------- new passives
mutCard({ id: 'sp_extra', title: 'Extra Mastery', icon: 'XM', rarity: 3, maxRank: 1, family: 'mut:rules', flavour: 'TODO_COPY:sp_extra_line',
  desc: 'TODO_COPY:sp_extra_desc' });
mutCard({ id: 'sp_runs', title: 'The Runs', icon: 'TR', rarity: 1, maxRank: 3, start: true, family: 'mut:body', flavour: 'TODO_COPY:sp_runs_line',
  desc: 'TODO_COPY:sp_runs_desc' });
{ const c = MUT_REG.find(x => x.id === 'sp_runs'), el = c.eligible, ap = c.apply; // (The Runs can be mastered too)
  c.maxRank = 4; c.eligible = G => el(G) && (mr('sp_runs') < 3 || spMasteryRoom('sperm'));
  c.apply = (G, t) => { const r0 = mr('sp_runs'); ap(G, t); if (r0 === 3 && mr('sp_runs') === 4) (G.spM || (G.spM = [])).push('sp_runs'); }; }

// The Runs: a hidden trail slot in the sample's primary damage type (DRAFT_INT maps the sample's type names).
function spRunsSlot() {
  const S = G.spRuns || (G.spRuns = { w: makeSlot('s_wake', false, 1), rank: 0, type: null });
  const t = G.spRunsType || DRAFT_INT[(G.sampleTypes && G.sampleTypes.primary) || 'force'] || 'phys'; // (the type its card rolled: runstype.js)
  if (S.type !== t) { S.type = t; S.w.def = Object.create(WEAPONS.s_wake, { elem: { value: t, enumerable: true }, v10type: { value: t, enumerable: true }, color: { value: (V10_COL && V10_COL[t]) || WEAPONS.s_wake.color, writable: true, enumerable: true } }); S.rank = 0; }
  const r = mr('sp_runs');
  if (S.rank !== r) { S.rank = r; computeStats(S.w); const s = S.w.s; if (r >= 2) { s.dur *= 1.5; s.area *= 1.5; } if (r >= 3) s.dmg *= 1.5; if (r >= 4) s.dmg *= 4 / 3; }
  return S.w;
}
v10Tick = (orig => function (dt) {
  orig(dt);
  if (G && G.state === 'play' && mr('sp_runs')) updateWake(spRunsSlot(), dt);
})(v10Tick);

// Membrane Shield's levels: one rank each.
PDEF_CARDS.thick.max = 1; PDEF_CARDS.fast.max = 1;
