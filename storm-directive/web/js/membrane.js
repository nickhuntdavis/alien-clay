'use strict';
// Spawn Prawn - health and Membrane draft cards (ccr-loot-health). Six slotless 'up:' cards (draft.js group 'up'), ranked to 3
// (Spillover: 1). Ranks live in G.hpc[id]; everything is read from the hooks below, so no shared table is touched.
//  - hp_marrow   max HP +12% per rank (and heals it). The Membrane resizes with max HP (pdef.js).
//  - hp_scab     below half health, regenerate 0.6% of max HP per second per rank.
//  - hp_slurp    each kill heals 0.8% of max HP per rank, drawn from the lifesteal pool (G.lsBudget), so the limit holds.
//  - hp_scar     after a hit, take 8% less damage per rank for 3 s.
//  - hp_spill    (needs a Membrane) healing past full health refills the Membrane instead.
//  - hp_coat     (needs a Membrane) the Membrane mends 5% of its size per second per rank, even under fire.
// All copy is TODO_COPY:hp_<id>_title / _desc.
// Hooks: hookOn('tick', 'hpTick'), hookOn('kill', 'hpKill'), hookOn('hurt', 'hpHurt'), hookOn('hurtMul', 'hpHurtMul');
// wraps healPlayer (Spillover). Loads after v9back.js.

const HPC = {
  hp_marrow: { rarity: 2, max: 3, icon: 'MA', color: '#ff9fb2' },
  hp_scab:   { rarity: 1, max: 3, icon: 'SC', color: '#e06c75' },
  hp_slurp:  { rarity: 2, max: 3, icon: 'SL', color: '#ff8fab' },
  hp_scar:   { rarity: 1, max: 3, icon: 'ST', color: '#c9b6ff' },
  hp_spill:  { rarity: 3, max: 1, icon: 'SP', color: '#9fd8ff', needs: 'mem' },
  hp_coat:   { rarity: 2, max: 3, icon: 'MC', color: '#9fd8ff', needs: 'mem' },
};
const hpr = id => (G && G.hpc && G.hpc[id]) || 0;
const hpHasMem = () => typeof pdHasShield === 'function' && pdHasShield(pdef());

for (const id in HPC) {
  const H = HPC[id];
  const c = { id, kind: 'enhance', slot: null, family: 'up:' + id, type: null, rarity: H.rarity, start: true,
    title: 'TODO_COPY:' + id + '_title', desc: 'TODO_COPY:' + id + '_desc', icon: H.icon, color: H.color, maxRank: H.max,
    eligible: G => !H.needs || hpHasMem(), rank: () => hpr(id),
    apply: G => {
      (G.hpc || (G.hpc = {}))[id] = hpr(id) + 1;
      if (id === 'hp_marrow') { const add = Math.round(G.P.maxHp * 0.12); G.P.maxHp += add; G.player.hp += add; }
    } };
  if (typeof draftRegister === 'function') draftRegister(c); else (window.CARDS10 = window.CARDS10 || []).push(c);
}

function hpTick(dt) {
  if (!G || !G.hpc || G.state !== 'play') return;
  const P = G.P, p = G.player;
  if (hpr('hp_scab') && p.hp < P.maxHp * 0.5) healPlayer(P.maxHp * 0.006 * hpr('hp_scab') * dt, true);
  if (hpr('hp_coat') && hpHasMem()) { const m = pdef().mem; if (m.memMax > 0 && m.mem < m.memMax) m.mem = Math.min(m.memMax, m.mem + m.memMax * 0.05 * hpr('hp_coat') * dt); }
}
function hpKill() {
  const k = hpr('hp_slurp'); if (!k || !(G.lsBudget > 0)) return;
  const h = Math.min(G.lsBudget, G.P.maxHp * 0.008 * k); G.lsBudget -= h; healPlayer(h, true);
}
function hpHurt() { if (hpr('hp_scar')) G.hpScarT = G.t + 3; }
function hpHurtMul() { const k = hpr('hp_scar'); return k && G.t < (G.hpScarT || 0) ? 1 - 0.08 * k : 1; }

if (typeof healPlayer === 'function') {
  const hpHealOld = healPlayer;
  healPlayer = function (n, silent) { // (Spillover: what would heal past full goes to the Membrane)
    const p = me(), before = p.hp;
    hpHealOld(n, silent);
    if (hpr('hp_spill') && hpHasMem() && before >= G.P.maxHp - 0.01) { const m = pdef().mem; if (m.memMax > 0) m.mem = Math.min(m.memMax, m.mem + n * G.P.healMult * 0.5); }
  };
}
hookOn('tick', 'hpTick', dt => hpTick(dt));
hookOn('kill', 'hpKill', () => hpKill());
hookOn('hurt', 'hpHurt', () => hpHurt());
hookOn('hurtMul', 'hpHurtMul', () => hpHurtMul());
