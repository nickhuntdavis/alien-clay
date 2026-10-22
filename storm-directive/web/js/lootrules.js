'use strict';
// Spawn Prawn - loot rules (user, 22 Oct 2026): card screens come only from levelling up and from boss kills.
//  - Kept: level drafts, weapon drafts (new mounts), Feat forks, weapon upgrades and their branch screens, the start,
//    kindred rescues (The Race's weapon drafts), and Level 0's lesson box.
//  - Dropped: DNA strands (chest pickups from elites, rivals, campaign rooms, the race's spare-mount strand, cures and
//    events), elite mutation carriers (mutations go back into level drafts: mutdrop.js mdDraftSkip), achievement boxes.
//  - A boss kill gives one box of cards (kind 'boss': weapon modifiers when one fits, else a draft) that opens at once,
//    mid-wave included.
//  - A weapon upgrade (every WUP_EVERY levels, weapons24.js) opens the moment it is earned, and its branch screen
//    straight after, mid-wave included.
// Off with window.LOOT_ANY (tests of the old sources) or under V10_OFF.
// 'now' on those requests skips the Director's gap (director.js dirGate) and the wave hold (waves.js waveHoldsLoot).
// Wraps draftBox, bossDown, chestOr, kinDna, v10Tick. Reads mutdrop.js MUTDROP, director.js DIR_PRI.

const LOOTRULE = { keep: ['start', 'level', 'slot', 'fork', 'wup', 'wupfork', 'kindred'], pri: { boss: 900, wupfork: 890, wup: 880 } };
const lrOn = () => V10 && !(typeof window !== 'undefined' && window.LOOT_ANY);
const lrSchool = () => typeof schoolOn === 'function' && schoolOn();

{
  const box = draftBox, down = bossDown, chest = chestOr, dna = kinDna, tick = v10Tick;
  draftBox = function (req) {
    if (lrOn() && !lrSchool()) {
      if (req.kind === 'boss' ? !req.lrBoss : !LOOTRULE.keep.includes(req.kind)) return false;
    }
    return box(req);
  };
  bossDown = function (e) {
    const was = !!(G.bossDead && G.bossDead[e.id]);
    down(e);
    if (!lrOn() || was || !(G.bossDead && G.bossDead[e.id]) || (typeof campFinal === 'function' && campFinal())) return;
    G.lootQueue.unshift({ kind: 'boss', lrBoss: true, now: true, src: { t: 'boss', name: e.def.name } });
  };
  chestOr = alt => (lrOn() ? alt : chest(alt)); // (elites drop a power-up instead of a DNA strand)
  kinDna = function () { if (!lrOn()) dna(); }; // (every mount full at a rescue mark: nothing)
  v10Tick = function (dt) {
    if (lrOn() && G && !lrSchool()) {
      if (G.pickups.some(u => u.type === 'chest')) G.pickups = G.pickups.filter(u => u.type !== 'chest'); // (rivals, campaign rooms)
      for (const q of G.lootQueue) if (LOOTRULE.pri[q.kind] && !q.lrPri) { // (to the front of the queue, before dirTick orders it)
        q.now = q.lrPri = true; q.dirAt = G.t - (LOOTRULE.pri[q.kind] - (DIR_PRI[q.kind] || 30)) / DIRECTOR.age;
      }
    }
    tick(dt);
  };
  if (typeof MUTDROP !== 'undefined') { const c = MUTDROP.chance; Object.defineProperty(MUTDROP, 'chance', { get: () => (lrOn() ? 0 : c) }); } // (no mutation carriers)
}
