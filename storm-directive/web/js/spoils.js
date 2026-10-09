'use strict';
// Spawn Prawn - boss spoils. Beating a boss now pays twice: its relic (one of its three, plus one smuggled in
// from a boss you won't meet this run), then a SPOILS box: three cards from a varied pool, one of which is
// usually a chance to switch a weapon's element (with the combo chemistry it would bring spelled out).
// Hooks: spoilsRelics (genLoot, kind 'relic'), spoilsOpts (genLoot, kind 'spoils'), bossDown pushes the box.

function spoilsRelics(boss) {
  const own = bossDef(boss).relics.map(id => optRelic(id, boss));
  const away = BOSSES.filter(b => b.id !== boss && !(G.bossRoster || []).includes(b.id));
  const pool = [];
  for (const b of (away.length ? away : BOSSES.filter(x => x.id !== boss))) for (const id of b.relics) if (!G.relics[id]) pool.push([id, b.id]);
  if (pool.length) { const [id, b] = pick(pool); const o = optRelic(id, b); o.tag = 'SMUGGLED RELIC'; own.push(o); }
  return own;
}
const SPOILS = {
  trophy: () => ({ title: 'Trophy Polish', icon: 'TP', desc: 'Every weapon you own goes up a level.', ok: () => G.weapons.some(w => w && w.lvl < wCap(w)),
    apply: () => { for (const w of G.weapons) if (w && w.lvl < wCap(w)) { setWeaponLevel(w, w.lvl + 1); computeStats(w); } } }),
  blood: () => ({ title: 'Boss Blood', icon: 'BB', desc: '+15% max HP, and heal to full.', apply: () => { const p = me(), add = Math.round(G.P.maxHp * 0.15); G.P.maxHp += add; p.hp = G.P.maxHp; } }),
  gland: () => ({ title: 'Adrenal Gland', icon: 'AG', desc: '+8% damage and +8% fire rate, for good.', apply: () => { G.P.might += 0.08; G.P.haste += 0.08; } }),
  hide: () => ({ title: 'Trophy Hide', icon: 'TH', desc: '+4 armour and +6% dodge.', apply: () => { G.P.armour += 4; G.P.dodge = Math.min(0.7, G.P.dodge + 0.06); } }),
  notes: () => ({ title: 'Lab Notes', icon: 'LN', desc: 'Reactions hit 40% harder, and your damage types +10%.', apply: () => { G.P.react += 0.4; for (const k in G.P.elem) G.P.elem[k] += 0.1; } }),
  lap: () => ({ title: 'Victory Lap', icon: 'VL', desc: '+12% swim speed and +30% pickup range.', apply: () => { G.P.speed += 0.12; G.P.magnet += 0.3; } }),
  bounty: () => ({ title: 'Bounty', icon: 'BY', desc: '+3 rerolls and +15% luck.', apply: () => { G.rerolls += 3; G.P.luck += 0.15; } }),
  crit: () => ({ title: 'Killer Instinct', icon: 'KI', desc: '+10% crit chance and +40% crit damage.', apply: () => { G.P.crit += 0.1; G.P.critDmg += 0.4; } }),
};
function spoilsOpts() {
  const out = [];
  // A weapon that could take a new element (Switched at Birth at full power), if any.
  const sw = shuffle(G.weapons.filter(w => w && !w.isSpell && w.mods && !w.mods.some(m => m.id === 'elemental') && w.mods.length < MOD_SLOTS));
  if (sw.length && Math.random() < 0.85) { const o = optMod(sw[0], 'elemental', 4); o.tag = 'SPOILS: GENE SWAP'; out.push(o); }
  const ids = shuffle(Object.keys(SPOILS));
  for (const id of ids) {
    if (out.length >= 3) break;
    const s = SPOILS[id]();
    if (s.ok && !s.ok()) continue;
    out.push({ rarity: 4, tag: 'SPOILS', icon: s.icon, color: PAL.reward, title: s.title, sub: 'Permanent', desc: s.desc, apply: () => { s.apply(); recomputeAll(); } });
  }
  return out;
}
