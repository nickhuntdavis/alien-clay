'use strict';
// Spawn Prawn - The Runs rolls a damage type per card (user, 26 Oct). The trail used to take the sample's primary type.
//  - CARD: each time The Runs is dealt as a new card it rolls one of the seven damage types, weighted towards your build
//    (each held weapon of a type adds RUNS.ownK to its weight, the sample's primary type 1). Picking it fixes the trail's
//    type for the run (G.spRunsType, read by spassives.js spRunsSlot); its upgrade cards show and keep that type.
//  - Every type keeps its own status on the trail (Acid Corrosion, Mucus Snare, Blood Bleed, Fire Burn and the rest).
//    Four types get an extra on top (every RUNS.tick seconds):
//      Force: enemies on the trail are shoved aside (RUNS.shove).
//      Static: arcs jump between neighbouring trail pieces like a fence, hitting what crosses them (RUNS.arc of its dps).
//      Blood: while enemies stand in it, you heal a little (RUNS.heal of max health a second for each, 3 at most).
//      Parasite: enemies on it are dragged along it, away from you (RUNS.drag).
//  Card text TODO_COPY:sp_runs_<type>_desc (type: the internal id).
// Hooks: none in shared files. hookOn tick 'runsTick'; wraps draft.js cardOpt. spassives.js spRunsSlot reads G.spRunsType.
// Loads after passivefeat.js.
const RUNS = { types: ['phys', 'fire', 'shock', 'ice', 'arcane', 'soul', 'flame'], ownK: 2, tick: 0.25, shove: 160, arc: 0.6, arcGap: 70, heal: 0.004, drag: 110 };
function runsRoll() {
  const w = {}; for (const t of RUNS.types) w[t] = 1;
  for (const x of G.weapons || []) if (x && !x.isSpell && x.def) { const t = x.def.elem; if (w[t] != null) w[t] += RUNS.ownK; }
  const pt = typeof DRAFT_INT !== 'undefined' && G.sampleTypes && DRAFT_INT[G.sampleTypes.primary]; if (pt && w[pt] != null) w[pt] += 1;
  let r = Math.random() * Object.values(w).reduce((a, v) => a + v, 0);
  for (const t of RUNS.types) { r -= w[t]; if (r <= 0) return t; }
  return 'phys';
}
const runsCol = t => (typeof V10_COL !== 'undefined' && V10_COL[t]) || (ELEMENTS[t] && ELEMENTS[t].color) || '#cfe7ff';
cardOpt = (orig => function (c) {
  const o = orig.apply(this, arguments);
  if (!c || c.id !== 'sp_runs' || !o || !G) return o;
  const r = c.rank ? c.rank(G) || 0 : 0, t = r ? (G.spRunsType || null) : runsRoll();
  if (!t) return o;
  o.elem = t; o.color = runsCol(t); o.sub = (o.sub || '') + ' | ' + ELEMENTS[t].name;
  if (!r) { o.desc = 'TODO_COPY:sp_runs_' + t + '_desc'; o.runsType = t; const ap = o.apply; o.apply = () => { G.spRunsType = t; ap(); }; }
  return o;
})(cardOpt);

function runsTick(dt) {
  if (!G || G.state !== 'play' || !G.spRuns || !G.spRunsType) return;
  if (G.runsT > G.t) return; G.runsT = G.t + RUNS.tick;
  const S = G.spRuns, t = G.spRunsType, p = G.player;
  if (t !== 'phys' && t !== 'shock' && t !== 'arcane' && t !== 'soul') return;
  const Z = G.zones.filter(z => z.trail && z.src && z.src.w === S.w && z.life > 0);
  if (!Z.length) return;
  const live = e => e && !e.dead && !e.charmed && !e.egg && !e.phased;
  const inside = z => { const l = []; forNear(z.x, z.y, z.r + 20, e => { if (live(e) && Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.r * 0.5) l.push(e); }); return l; };
  if (t === 'phys') {
    for (const z of Z) for (const e of inside(z)) if (!e.boss && !(e.runsShT > G.t)) { e.runsShT = G.t + 0.5; const a = Math.atan2(e.y - z.y, e.x - z.x); shove(e, e.x - Math.cos(a) * 10, e.y - Math.sin(a) * 10, RUNS.shove); }
  } else if (t === 'shock') {
    for (let i = 1, n = 0; i < Z.length && n < 6; i++) {
      const a = Z[i - 1], b = Z[i]; if (Math.hypot(b.x - a.x, b.y - a.y) > RUNS.arcGap || Math.random() < 0.5) continue;
      n++; bolt(a.x, a.y, b.x, b.y, runsCol('shock'), 0.12);
      for (const e of G.enemies) {
        if (!live(e)) continue;
        const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1, k = clamp(((e.x - a.x) * dx + (e.y - a.y) * dy) / l2, 0, 1);
        if (Math.hypot(e.x - (a.x + dx * k), e.y - (a.y + dy * k)) < e.r + 6) damageEnemy(e, b.dps * RUNS.arc, Object.assign({}, b.src, { atk: 'beam', zoneHit: true, runsArc: 1 }));
      }
    }
  } else if (t === 'arcane') {
    const seen = new Set(); for (const z of Z) for (const e of inside(z)) seen.add(e);
    if (seen.size) healPlayer(G.P.maxHp * RUNS.heal * RUNS.tick * Math.min(3, seen.size), true);
  } else if (t === 'soul') {
    Z.forEach((z, i) => { if (!i) return; const q = Z[i - 1]; for (const e of inside(z)) if (!e.boss) shove(e, 2 * e.x - q.x, 2 * e.y - q.y, RUNS.drag * RUNS.tick * 4); }); // (shove pushes away from a point: this pulls towards the older piece)
  }
}
hookOn('tick', 'runsTick', dt => runsTick(dt));
