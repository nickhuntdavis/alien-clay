'use strict';
// Spawn Prawn - Mythical and Immaculate cards can drop again (user, 28 Oct: "I haven't seen one in a very long time").
// Under v10 every box goes through v10Loot, whose cards never reached them: modifier cards take their rarity from the
// rank they give (Uncommon to Epic), Feat cards have fixed ones, and stat cards (wmods.js wmStatRar) rolled without
// game.js rollRarity's special roll, so Legendary was the ceiling. Achievement DNA ('myth', all Mythical or Immaculate)
// was dropped by draft.js draftBox, which refuses kinds it does not list.
//  - Stat cards now take the special roll (wmods.js): about 0.55% Mythical and 0.18% Immaculate a card, three a run
//    (G.mythN); a Mythical or Immaculate stat card carries a boon like any other (boons.js withBoon).
//  - Achievement DNA opens (through the Reward Director, like a fork) and deals three different stat cards, every one
//    Mythical or Immaculate (G.mythBox: 30% Immaculate), each with its boon.
// Hooks: none (wraps wmods.js wmStatCard, draftBox and v10Loot; loads after vestigial.js). Save data: none.

wmStatCard = (orig => function (k) { const o = orig.apply(this, arguments); return o && o.rarity >= 5 && typeof withBoon === 'function' ? withBoon(o) : o; })(wmStatCard);
draftBox = (orig => function (req) {
  if (!req || req.kind !== 'myth') return orig.apply(this, arguments);
  return typeof dirGate === 'function' ? dirGate(Object.assign(req, { now: true })) : true;
})(draftBox);
v10Loot = (orig => function (req) {
  if (!req || req.kind !== 'myth' || !G) return orig.apply(this, arguments);
  G.mythBox = true;
  try {
    const out = [], fams = new Set(), cands = shuffle(wmStatCands().slice());
    for (const c of cands) { if (out.length >= 3) break; if (fams.has(c.fam)) continue; const o = c.o(); if (o) { fams.add(c.fam); out.push(o); } }
    return out.length ? out : orig.apply(this, arguments);
  } finally { G.mythBox = false; }
})(v10Loot);
