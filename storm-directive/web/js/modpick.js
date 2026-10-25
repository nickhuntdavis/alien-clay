'use strict';
// Spawn Prawn - one modifier card, you choose the weapon (user, 25 Oct).
// A modifier that fits more than one of your weapons used to be dealt as a card per weapon. Now it is ONE candidate
// (weight = the best of the group, so the draft keeps its card count and the group weights stay as they were). The
// card carries the v9 weapon chips (ui.js pickChips, `pickW`; tap a chip to put it on that weapon). A tap anywhere
// else, or the autorun bot / a single-weapon card, goes on the best weapon: highest level, then the one that already
// holds the most of it. Left as separate cards: Melee/Ranged/Mines swaps (they warn per weapon, atkswap.js) and any id
// where a weapon is at its mastery card.
// Hooks: lootfilter.js lfInfo reads `o.modTab`; rewardui.js fit line reads `o.pickW`. Wraps modDraftCands, loads last.
function mpWeapons(id) {
  return G.weapons.filter(w => w && !w.isSpell && w.def && w.def.v10atk && modsFor(w).includes(id) && modCardOk(w, id));
}
function mpBest(ws, id) { return ws.slice().sort((a, b) => (b.lvl || 1) - (a.lvl || 1) || modCount(b, id) - modCount(a, id))[0]; }
modDraftCands = (orig => function (kind) {
  const out = orig(kind), seen = new Map();
  for (const c of out) if (c.fam && c.fam.startsWith('mod:')) seen.set(c.fam, (seen.get(c.fam) || []).concat(c));
  const drop = new Set();
  for (const [fam, cs] of seen) {
    const id = fam.slice(4);
    if (cs.length < 2 || (typeof ATKSW !== 'undefined' && ATKSW.ids.includes(id))) continue;
    const ws = mpWeapons(id);
    if (ws.length < 2) continue;
    const cards = ws.map(w => modCard(w, id));
    if (cards.some(k => k.tag === 'MASTERY')) continue;
    const m = MODS10[id], best = mpBest(ws, id), base = cards[ws.indexOf(best)], keep = cs[0];
    keep.w = Math.max(...cs.map(c => c.w));
    keep.o = () => Object.assign({}, base, {
      title: m.name, sub: MM_GNAME[mmGroup(id)], desc: m.desc, modFor: '', modTab: best.def.name, tag: 'MODIFIER',
      pickW: ws.map(w => ({ uid: w.uid, def: w.def, lvl: w.lvl, n: modCount(w, id), max: m.max })),
      apply: uid => { const i = ws.findIndex(w => w.uid === uid); (cards[i >= 0 ? i : ws.indexOf(best)]).apply(); },
    });
    for (const c of cs) if (c !== keep) drop.add(c);
  }
  return drop.size ? out.filter(c => !drop.has(c)) : out;
})(modDraftCands);
