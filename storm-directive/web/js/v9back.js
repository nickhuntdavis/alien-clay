'use strict';
// Spawn Prawn - v9 upgrades and mutations brought back into v10, as draft cards (draft.js draftRegister).
//  - Upgrades: the v9 upgrades (PASSIVES in data.js) that change how you play rather than add a bare number
//    (MUTATIONS.md: "a bare +8% damage is never a card of its own"; stamina is the one stat UPGRADES.md lists).
//    Slotless Enhance cards, family 'up:<id>', ranked to at most 3; G.passives and G.P exactly as in v9, so the pause
//    screen lists them as before. Left out: plain stat bumps, the old damage-type and reaction boosts (v10 has its own
//    type mutations and Catalysts), armour, thorns, dodge and plates (v10 defences), terrain upgrades, Full Load (it
//    only reads the old Feats), Inheritance, and anything that would duplicate a v10 card's name.
//  - Mutations: the v9 Lateral Gene Transfer mutations (MUTATIONS in genes.js) that use none of the retired damage types
//    (Cooties, Oil, Water) and none of the retired stats, and don't repeat a v10 mutation. Genome cards (id 'g_<id>',
//    one rank), dealt by elites like every other mutation (mutdrop.js mdIsMut); taking one runs genes.js mutTake, so
//    the v9 hooks (genesDamageMul, genesKill, genesHurt, genesLethal...) do the work unchanged.
// Hooks: none of its own. draft.js groups 'up:' cards (DRAFT.groupW.up); mutdrop.js mdIsMut takes 'g_' ids.

const V9UP = { // id -> when it can matter (null: always)
  lastround: G => ownedWeapons().some(w => (w.s.mag || 1) > 1),
  focus: null,
  overkill: null,
  crossfire: G => ownedWeapons().length >= 2,
  momentum: null,
  grit: null,
  heft: null,
  efficient: G => G.spells.some(w => w && typeof f10Cost === 'function' && f10Cost(w) > 0),
  lungs: null,
  cardio: null,
  tactical: G => ownedWeapons().some(w => (w.s.mag || 1) > 1 && w.s.reload > 0),
  future: G => ownedWeapons().some(w => w.def.kind === 'gun' || w.def.kind === 'lob'),
  anchorlink: G => !!(G.wave && G.core),
  ram: null,
  temporal: G => !!(G.chrono && G.chrono.max > 0),
};
const V9UP_TXT = { // where the v9 text names something v10 retired
  ram: 'Enemies you swim into take big damage. It grows with your level and max HP. At full speed it sends out a shockwave and their contact hurts 40% less.',
};
for (const id in V9UP) {
  const P0 = PASSIVES[id]; if (!P0) continue;
  const ok = V9UP[id], rank = () => (G && G.passives && G.passives[id]) || 0;
  const c = { id: 'up_' + id, kind: 'enhance', slot: null, family: 'up:' + id, type: null, rarity: P0.minRarity || 1, start: true,
    title: P0.name, icon: P0.icon, color: '#9fd8ff', maxRank: Math.min(3, P0.max),
    get desc() { const t = V9UP_TXT[id] || P0.fmt(P0.v * (rank() + 1)); return /\.$|^TODO_COPY/.test(t) ? t : t + '.'; }, // (what you have after taking it)
    eligible: G => !ok || ok(G), rank,
    apply: G => { P0.apply(G.P, P0.v, G); G.passives[id] = rank() + 1; } };
  if (typeof draftRegister === 'function') draftRegister(c); else (window.CARDS10 = window.CARDS10 || []).push(c);
}

// v9 mutations: id -> v10 text where the v9 text names something v10 retired (null: keep the v9 text).
const V9MUT = {
  spite: null, macjaw: null, origami: null, toothpick: null, tcells: null, soup: null, sludge: null, sugardaddy: null,
  powerhouse: null, sugarrush: null, peerpressure: null, codependency: null, turbo: null, bonk: null,
  frostbitten: 'Every hit you take: +1 max HP, up to +150.', bonejuice: null, roidrage: null, greedyhands: null,
  ointment: null, rerolldice: null, payload: null, runningjuice: null, overachiever: null, sniperrna: null,
  chernobyl: null, zombiecore: null, tooangry: null, pointy: null, bipolar: 'Acid, Mucus and Static +40%. Force and Blood -10%.',
};
const V9MUT_NO = { sludge: 'x_still' }; // (Screen Time and Can't Sit Still pull opposite ways: one or the other)
for (const id in V9MUT) {
  const M = MUTATIONS[id]; if (!M) continue;
  const gid = 'g_' + id, trade = /-\d|Half|Once|but/.test(M.desc);
  const c = { id: gid, kind: 'acquire', slot: 'genome', family: 'mut:v9', type: null, rarity: [1, 2, 3][M.tier], start: true,
    title: M.name, icon: M.name.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    color: M.tier >= 2 ? MUT_COL.rare : trade ? MUT_COL.trade : MUT_COL.body, maxRank: 1, desc: V9MUT[id] || M.desc,
    eligible: G => !(G.mut && G.mut[id]) && !(V9MUT_NO[id] && mr(V9MUT_NO[id]) > 0), rank: () => mr(gid),
    apply: G => { mutSt(); G.muts[gid] = 1; mutTake(id); } };
  if (typeof draftRegister === 'function') draftRegister(c); else (window.CARDS10 = window.CARDS10 || []).push(c);
}
