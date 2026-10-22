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
// Not built yet (later passes): masteries, the new and reworked passives (The Runs, Pile-Up, Chain Letter...), pairs.
// Hooks: mutdrop.js mdDraftSkip -> spSkip. Replaces genes.js genesLevel. Loads after mutdrop.js and samples10.js.

const SP = { on: true, base: 2, at: [8, 16, 24], cut: ['m_parts', 'm_space', 'm_hold', 'x_qty', 'x_careless'] };
const spSlots = () => SP.base + SP.at.filter(l => ((G && G.level) || 1) >= l).length;
Object.defineProperty(DRAFT, 'genome', { get: () => spSlots(), configurable: true });

// draft.js (through mutdrop.js mdDraftSkip): which mutation cards stay out of level-up drafts.
const spSkip = c => c.slot === 'weaponmut' || SP.cut.includes(c.id);

// Retired sources.
MUTDROP.chance = 0;
genesLevel = function () {};
for (const s of SAMPLES10) s.shield = false;
