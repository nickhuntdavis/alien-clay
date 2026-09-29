'use strict';
// Spawn Storm - meta progression. Every run earns DNA; the Gene Bank spends it on permanent starting
// bonuses, extra starter weapons and dye variants. Saved on the device.

const META_BONUSES = [
  { id: 'hp',       name: 'Thicker Membrane',   desc: '+10 max HP per rank',             max: 5, cost: r => 30 + r * 25, apply: (G, r) => { G.P.maxHp += 10 * r; G.player.hp += 10 * r; } },
  { id: 'dmg',      name: 'Potent Genome',      desc: '+4% damage per rank',             max: 5, cost: r => 40 + r * 30, apply: (G, r) => { G.P.might += 0.04 * r; } },
  { id: 'xp',       name: 'Fast Metaboliser',   desc: '+5% XP per rank',                 max: 5, cost: r => 35 + r * 25, apply: (G, r) => { G.P.xp += 0.05 * r; } },
  { id: 'reroll',   name: 'Second Opinion',     desc: '+1 starting reroll per rank',     max: 3, cost: r => 30 + r * 30, apply: (G, r) => { G.rerolls += r; } },
  { id: 'grip',     name: 'Pre-Sticky Cilia',   desc: '+10% traction per rank',          max: 3, cost: r => 30 + r * 25, apply: (G, r) => { G.P.traction += 0.1 * r; } },
  { id: 'magnet',   name: 'Chemotaxis',         desc: '+15% pickup range per rank',      max: 3, cost: r => 25 + r * 20, apply: (G, r) => { G.P.magnet += 0.15 * r; } },
  { id: 'rewind',   name: 'Deja Vu',            desc: 'Start with an extra Rewind charge', max: 1, cost: () => 150, apply: (G, r) => { G.chrono.charges = Math.min(G.chrono.max, G.chrono.charges + r); } },
];
// Starter weapons you can add to the first box.
const META_STARTERS = [
  ['nailgun', 60], ['cryopipette', 60], ['antibioticsg', 70], ['nerveimpulse', 70], ['placebo', 80],
  ['chromowhip', 80], ['metaflare', 90], ['genesplicer', 100], ['mitosiscannon', 120], ['hailswarm', 90],
];
// Dye variants for your tag, kept in the green family so "green is you" still holds.
const META_DYES = [
  { id: 'egfp',    name: 'EGFP (standard)', color: '#4dff9a', cost: 0 },
  { id: 'emerald', name: 'Emerald',         color: '#2fe07e', cost: 80 },
  { id: 'azami',   name: 'Azami Green',     color: '#7dff6a', cost: 120 },
  { id: 'aqua',    name: 'Aqua GFP',        color: '#4dffd2', cost: 160 },
];

const META = { dna: 0, total: 0, ranks: {}, starters: {}, dyes: { egfp: true }, dye: 'egfp', lastEarned: 0 };
try { Object.assign(META, JSON.parse(localStorage.getItem('sd_meta') || '{}')); } catch (e) { /* storage unavailable */ }
function saveMeta() { try { localStorage.setItem('sd_meta', JSON.stringify(META)); } catch (e) { /* ignore */ } }

// DNA earned by a run.
function runDna(G, won) {
  const rivals = Object.values(G.rivalOut || {}).filter(v => v === 'you').length;
  return Math.round(G.level * 2 + G.kills / 80 + G.stats.bossKills * 15 + rivals * 12 + (won ? 120 : 0) + G.t / 30);
}
function bankRun(G, won) {
  if (G.banked) return META.lastEarned;
  G.banked = true;
  const n = runDna(G, won);
  META.dna += n; META.total += n; META.lastEarned = n;
  saveMeta();
  return n;
}
// Called from newGame(): apply ranks and the chosen dye.
function applyMeta(G) {
  for (const b of META_BONUSES) { const r = META.ranks[b.id] || 0; if (r) b.apply(G, r); }
  const dye = META_DYES.find(d => d.id === META.dye) || META_DYES[0];
  setYouColour(dye.color);
}
function setYouColour(c) {
  if (PAL.you === c) return;
  if (typeof PAL_OK !== 'undefined') { PAL_OK.delete(PAL.you); PAL_OK.add(c); }
  PAL.you = c;
  for (const d of Object.values(WEAPONS).concat(Object.values(SPELLS))) d.color = c;
  if (typeof COL !== 'undefined') { COL.clear(); COLDF.clear(); SPR.glow.clear(); }
}
function starterPool() {
  const base = ['blaster', 'smg', 'shotgun', 'flamer', 'frost', 'tesla', 'glaive', 'needler', 'seeker', 'rocket', 'railgun', 'venom'];
  return base.concat(META_STARTERS.filter(([id]) => META.starters[id]).map(([id]) => id));
}
function metaBuy(kind, id) {
  let cost = 0;
  if (kind === 'rank') { const b = META_BONUSES.find(x => x.id === id), r = META.ranks[id] || 0; if (r >= b.max) return false; cost = b.cost(r); if (META.dna < cost) return false; META.ranks[id] = r + 1; }
  else if (kind === 'starter') { const s = META_STARTERS.find(x => x[0] === id); if (META.starters[id]) return false; cost = s[1]; if (META.dna < cost) return false; META.starters[id] = true; }
  else if (kind === 'dye') { const d = META_DYES.find(x => x.id === id); if (!META.dyes[id]) { cost = d.cost; if (META.dna < cost) return false; META.dyes[id] = true; } META.dye = id; }
  META.dna -= cost;
  saveMeta();
  return true;
}
