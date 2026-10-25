'use strict';
// Spawn Prawn - Mucus Wall and Interferon grant a capped, temporary Membrane (ENEMY_HANDOFF B4, decision D4).
//  - One mechanism, two ranges (roster `aura`: Mucus Wall 115, Interferon 170). Every 0.5 s each giver refreshes
//    e.auraMem = { pct: 0.25, until: G.t + 1.5 } on allies in range; nothing is untouchable.
//  - The grant goes through fight.js's own Membrane pool (e.cd, combat.js rules: Force does half, mends after 2 quiet
//    seconds, Static recharges it), drawn by foemem.js foeMemDraw. It only lands on enemies with no defence of their own:
//    a native Membrane (foemem.js) is never topped up, so the two never stack past the cap; Shell, Thorns and Evasion keep theirs.
//  - When the grant lapses (1.5 s after the last giver is dead or out of range) the granted Membrane is removed.
// Hooks: hookOn('tick') only.

const FOEAURA = { pct: 0.25, hold: 1.5, every: 0.5, givers: ['bulwark', 'interferon'] };

function foeAuraGive(g, range) {
  const until = G.t + FOEAURA.hold;
  forNear(g.x, g.y, range, o => {
    if (o === g || o.dead || o.boss || o.charmed || o.rival || o.egg || FOEAURA.givers.includes(fightId(o.def))) return;
    const c = fightCd(o);
    if (c.def && !c.auraGrant) return; // has its own defence (a native Membrane included): no grant, no stacking
    o.auraMem = { pct: FOEAURA.pct, until };
    if (!c.auraGrant) { c.def = 'membrane'; c.memMax = c.maxHp * FOEAURA.pct; c.mem = c.memMax; c.memQuietT = 0; c.auraGrant = true; }
  });
}

hookOn('tick', 'foeAura', dt => {
  if (!G || typeof fightCd !== 'function' || typeof ROSTER === 'undefined') return;
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (e.auraMem && e.auraMem.until <= G.t) { // lapsed: take the granted Membrane away
      e.auraMem = null;
      const c = e.cd;
      if (c && c.auraGrant) { c.auraGrant = false; c.def = null; c.mem = 0; c.memMax = 0; }
      continue;
    }
    const id = fightId(e.def);
    if (FOEAURA.givers.includes(id)) {
      e.auraT = (e.auraT == null ? 0 : e.auraT) - dt;
      if (e.auraT <= 0) { e.auraT = FOEAURA.every; const a = ROSTER[id] && ROSTER[id].aura; foeAuraGive(e, a ? a.range : 115); e.pulseRT = G.realT; }
    }
  }
});
