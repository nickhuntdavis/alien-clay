'use strict';
// Spawn Prawn - more health, Shell and Membrane draft cards (ccr-b6a373a9-q8ofbd). Nine slotless 'up:' cards (draft.js
// group 'up'), beside membrane.js's six. Ranks live in G.vtc[id]; everything runs from the hooks below.
//  Health
//  - vt_drip     regenerate 0.2% of max HP per second per rank, at any health (membrane.js hp_scab only works below half).
//  - vt_leech    weapon hits heal 3% of the damage dealt per rank, drawn from the lifesteal pool (G.lsBudget).
//  - vt_plasma   all healing +20% per rank (G.P.healMult).
//  - vt_rally    after a hit, kills within 3 s win back 10% per rank of that hit (at most half the hit, VT.rallyCap).
//  Shell (needs a Shell layer: card or relic)
//  - vt_regrow   one lost Shell layer grows back every 24 / 16 / 10 s, inside the wave.
//  - vt_shrap    a Shell layer that breaks bursts: Force damage round you (scales with the enemy HP clock, hpNow).
//  Membrane (needs a Membrane)
//  - vt_pop      a Membrane knocked to zero pops: damage and a shove round you. Once per 6 s.
//  - vt_osmo     while the Membrane is full, regenerate 0.5% of max HP per second per rank.
//  - vt_feed     each kill refills 3% of the Membrane per rank.
// All copy is TODO_COPY:vt_<id>_title / _desc.
// Hooks: hookOn('tick', 'vtTick'), hookOn('kill', 'vtKill'), hookOn('proc', 'vtProc'), hookOn('hurt', 'vtHurt').
// Loads after membrane.js.

const VTC = {
  vt_drip:   { rarity: 1, max: 3, icon: 'DR', color: '#8ac926' },
  vt_leech:  { rarity: 2, max: 3, icon: 'LE', color: '#ff8fab' },
  vt_plasma: { rarity: 1, max: 3, icon: 'PL', color: '#ffb3c1' },
  vt_rally:  { rarity: 2, max: 3, icon: 'RA', color: '#e06c75' },
  vt_regrow: { rarity: 2, max: 3, icon: 'RG', color: '#b08968', needs: 'shell' },
  vt_shrap:  { rarity: 2, max: 3, icon: 'SH', color: '#b08968', needs: 'shell' },
  vt_pop:    { rarity: 2, max: 3, icon: 'PO', color: '#9fd8ff', needs: 'mem' },
  vt_osmo:   { rarity: 1, max: 3, icon: 'OS', color: '#9fd8ff', needs: 'mem' },
  vt_feed:   { rarity: 1, max: 3, icon: 'FE', color: '#9fd8ff', needs: 'mem' },
};
const VT = { drip: 0.002, leech: 0.03, plasma: 0.2, rallyT: 3, rally: 0.10, rallyCap: 0.5, regrow: [24, 16, 10], shrapR: 120, shrap: 14, popR: 150, pop: 10, popShove: 420, popCd: 6, osmo: 0.005, feed: 0.03 };
const vtr = id => (G && G.vtc && G.vtc[id]) || 0;
const vtMem = () => typeof pdHasShield === 'function' && pdHasShield(pdef());
const vtShellCap = D => Math.min(Math.max(D.n.shell, typeof RELIC10 !== 'undefined' ? RELIC10.shellCap : 0), D.n.shell + (typeof relShell === 'function' ? relShell() : 0)); // (as pdef.js pdRefit)
const vtShell = () => typeof pdef === 'function' && vtShellCap(pdef()) > 0;

for (const id in VTC) {
  const V = VTC[id];
  const c = { id, kind: 'enhance', slot: null, family: 'up:' + id, type: null, rarity: V.rarity, start: true,
    title: 'TODO_COPY:' + id + '_title', desc: 'TODO_COPY:' + id + '_desc', icon: V.icon, color: V.color, maxRank: V.max,
    eligible: G => !V.needs || (V.needs === 'mem' ? vtMem() : vtShell()), rank: () => vtr(id),
    apply: G => {
      (G.vtc || (G.vtc = {}))[id] = vtr(id) + 1;
      if (id === 'vt_plasma') G.P.healMult += VT.plasma;
    } };
  if (typeof draftRegister === 'function') draftRegister(c); else (window.CARDS10 = window.CARDS10 || []).push(c);
}

function vtTick(dt) {
  if (!G || !G.vtc || G.state !== 'play') return;
  const P = G.P, p = G.player, D = pdef(), m = D.mem, S = G.vtS || (G.vtS = { layers: D.layers, mem: m.mem, popT: -99, regT: 0 });
  if (vtr('vt_drip') && p.hp < P.maxHp) healPlayer(P.maxHp * VT.drip * vtr('vt_drip') * dt, true);
  const memUp = vtMem() && m.memMax > 0;
  if (vtr('vt_osmo') && memUp && m.mem >= m.memMax - 1e-6 && p.hp < P.maxHp) healPlayer(P.maxHp * VT.osmo * vtr('vt_osmo') * dt, true);
  // Membrane popped this frame
  if (vtr('vt_pop') && memUp && S.mem > 0 && m.mem <= 0 && G.t - S.popT >= VT.popCd) {
    S.popT = G.t; const k = vtr('vt_pop'), dmg = VT.pop * k * hpNow();
    aoe(p.x, p.y, VT.popR, dmg, { elem: 'phys', wname: 'Membrane pop', noCrit: true }, '#9fd8ff');
    forNear(p.x, p.y, VT.popR, e => shove(e, p.x, p.y, VT.popShove));
  }
  // Shell layers lost this frame (a refit only adds)
  if (D.layers < S.layers && vtr('vt_shrap')) {
    const n = S.layers - D.layers, dmg = VT.shrap * vtr('vt_shrap') * hpNow() * n;
    aoe(p.x, p.y, VT.shrapR, dmg, { elem: 'phys', wname: 'Shell shrapnel', noCrit: true }, '#b08968');
  }
  // Regrow one layer at a time while below the refit size
  const cap = vtShellCap(D), k = vtr('vt_regrow');
  if (k && D.layers < cap) {
    S.regT += dt;
    if (S.regT >= VT.regrow[Math.min(k, 3) - 1]) { S.regT = 0; if (D.layers === 0) D.layerHp = pdLayerHp(); D.layers++; ring(p.x, p.y, p.r + 14, '#b08968', 0.3, 3); }
  } else S.regT = 0;
  S.layers = D.layers; S.mem = m.mem;
}
function vtKill() {
  if (!G || !G.vtc) return;
  const k = vtr('vt_feed');
  if (k && vtMem()) { const m = pdef().mem; if (m.memMax > 0) m.mem = Math.min(m.memMax, m.mem + m.memMax * VT.feed * k); }
  const r = G.vtRally;
  if (r && G.t < r.t && r.left > 0) { const h = Math.min(r.left, r.hit * VT.rally * vtr('vt_rally')); r.left -= h; healPlayer(h, true); }
}
function vtProc(e, dmg, src, d) {
  const k = vtr('vt_leech'); if (!k || !(d > 0) || !(G.lsBudget > 0)) return;
  const h = Math.min(G.lsBudget, d * VT.leech * k); G.lsBudget -= h; healPlayer(h, true);
}
function vtHurt(d) { if (vtr('vt_rally') && d > 0) G.vtRally = { t: G.t + VT.rallyT, hit: d, left: d * VT.rallyCap }; }

hookOn('tick', 'vtTick', dt => vtTick(dt));
hookOn('kill', 'vtKill', () => vtKill());
hookOn('proc', 'vtProc', (e, dmg, src, d) => vtProc(e, dmg, src, d));
hookOn('hurt', 'vtHurt', d => vtHurt(d));
