'use strict';
// Spawn Prawn - meta progression. Every run earns DNA; the Gene Bank spends it on permanent starting
// bonuses, extra starter weapons and dye variants. Saved on the device.

const META_BONUSES = [
  { id: 'hp',       name: 'Thicker Membrane',   desc: '+10 max HP per rank',             max: 5, cost: r => 30 + r * 25, apply: (G, r) => { G.P.maxHp += 10 * r; G.player.hp += 10 * r; } },
  { id: 'dmg',      name: 'Potent Genome',      desc: '+4% damage per rank',             max: 5, cost: r => 40 + r * 30, apply: (G, r) => { G.P.might += 0.04 * r; } },
  { id: 'xp',       name: 'Fast Metaboliser',   desc: '+5% XP per rank',                 max: 5, cost: r => 35 + r * 25, apply: (G, r) => { G.P.xp += 0.05 * r; } },
  { id: 'reroll',   name: 'Second Opinion',     desc: '+1 starting reroll per rank',     max: 3, cost: r => 30 + r * 30, apply: (G, r) => { G.rerolls += r; } },
  { id: 'grip',     name: 'Pre-Sticky Cilia',   desc: '+10% traction per rank',          max: 3, cost: r => 30 + r * 25, apply: (G, r) => { G.P.traction += 0.1 * r; } },
  { id: 'magnet',   name: 'Chemotaxis',         desc: '+15% pickup range per rank',      max: 3, cost: r => 25 + r * 20, apply: (G, r) => { G.P.magnet += 0.15 * r; } },
  { id: 'rewind',   name: 'Deja Vu',            desc: 'Start with an extra Rewind charge', max: 1, cost: () => 150, apply: (G, r) => { G.chrono.charges = Math.min(G.chrono.max, G.chrono.charges + r); } },
  { id: 'armour',   name: 'Thick Zona',         desc: '+1 armour per rank',              max: 3, cost: r => 45 + r * 35, apply: (G, r) => { G.P.armour += r; } },
  { id: 'luck',     name: 'Lucky Genes',        desc: '+5% luck per rank (rarer DNA strands)', max: 3, cost: r => 35 + r * 30, apply: (G, r) => { G.P.luck += 0.05 * r; } },
  { id: 'crit',     name: 'Sharp Acrosome',     desc: '+3% crit chance per rank',        max: 3, cost: r => 40 + r * 30, apply: (G, r) => { G.P.crit += 0.03 * r; } },
  { id: 'incubated', name: 'Well-Incubated',    desc: '+1 mutation slot per rank (Enzyme Vesicles)', max: 2, cost: r => 80 + r * 60, apply: () => {} },
];
// What a rank adds, in words, for the Gene Bank's "next swimmer" line.
const META_NOW = { hp: r => `+${10 * r} max HP`, dmg: r => `+${4 * r}% damage`, xp: r => `+${5 * r}% XP`, reroll: r => `+${r} reroll${r > 1 ? 's' : ''}`, grip: r => `+${10 * r}% traction`,
  magnet: r => `+${15 * r}% pickup range`, rewind: () => '+1 Rewind charge', armour: r => `+${r} armour`, luck: r => `+${5 * r}% luck`, crit: r => `+${3 * r}% crit`, incubated: r => `+${r} mutation slot${r > 1 ? 's' : ''}` };
// Starter weapons you can add to the first box.
const META_STARTERS = [
  ['mines', 60], ['orbit', 60], ['void', 80], ['wake', 80], ['parasite', 90], ['siphon', 100],
  // The toys.
  ['crayon', 90], ['bubble', 90], ['redtape', 90], ['duedate', 100], ['peekaboo', 100], ['toothfairy', 100], ['twin', 110], ['friend', 120],
];
// Dye variants for your tag, kept in the green family so "green is you" still holds.
const META_DYES = [
  { id: 'egfp',    name: 'EGFP (standard)', color: '#4dff9a', cost: 0 },
  { id: 'emerald', name: 'Emerald',         color: '#2fe07e', cost: 80 },
  { id: 'azami',   name: 'Azami Green',     color: '#7dff6a', cost: 120 },
  { id: 'aqua',    name: 'Aqua GFP',        color: '#4dffd2', cost: 160 },
];

const META = { dna: 0, total: 0, ranks: {}, starters: {}, dyes: { egfp: true }, dye: 'egfp', lastEarned: 0, pairs: {}, bosses: {} };
try { Object.assign(META, JSON.parse(localStorage.getItem('sd_meta') || '{}')); } catch (e) { /* storage unavailable */ }
META.pairs = META.pairs || {}; META.combos = META.combos || {}; META.bosses = META.bosses || {}; META.quirks = META.quirks || {}; META.wstats = META.wstats || {}; META.relics = META.relics || {};
META.prof = META.prof || {}; META.muts = META.muts || {}; META.profile = META.profile || 'vanguard';
// v7.63 raised the sequence rank thresholds: whatever rank you'd already reached is kept.
if (!META.rankMig) { META.rankMig = 1; for (const id in META.prof) { const k = META.prof[id].kills || 0; META.prof[id].keep = k >= 25000 ? 3 : k >= 5000 ? 2 : 1; } }
META.life = Object.assign({ bestT: 0, bosses: 0, pickups: 0, elem: 0, casts: 0 }, META.life || {});
// v6 retired most weapons: starters bought for them are refunded in full.
{ const OLD = { nailgun: 60, cryopipette: 60, antibioticsg: 70, nerveimpulse: 70, placebo: 80, chromowhip: 80, metaflare: 90, genesplicer: 100, mitosiscannon: 120, hailswarm: 90 };
  for (const id in META.starters) if (!WEAPONS[id]) { META.dna += OLD[id] || 0; delete META.starters[id]; } }
function saveMeta() { try { localStorage.setItem('sd_meta', JSON.stringify(META)); } catch (e) { /* ignore */ } }

// DNA earned by a run.
function runDna(G, won) {
  const rivals = Object.values(G.rivalOut || {}).filter(v => v === 'you').length;
  // About 450 for a win (the Gene Bank takes about 10), and beating a named rival is worth more than before.
  return Math.round((G.level * 1.2 + G.kills / 150 + G.stats.bossKills * 12 + rivals * 25 + (won ? 100 : 0) + G.t / 40) * (typeof prestigeDna === 'function' ? prestigeDna(G) : 1));
}
function bankRun(G, won) {
  if (G.banked) return META.lastEarned;
  G.banked = true;
  const n = runDna(G, won);
  META.dna += n; META.total += n; META.lastEarned = n;
  // Lifetime record per weapon, for the Codex and the Gene Bank.
  for (const w of G.weapons) {
    if (!w) continue;
    const r = META.wstats[w.id] || (META.wstats[w.id] = { runs: 0, born: 0, best: 0 });
    r.runs++; if (won) r.born++; r.best = Math.max(r.best, w.lvl);
  }
  for (const id in G.relics || {}) if (RELICS[id]) META.relics[id] = true;
  if (typeof genesBank === 'function') genesBank(G);
  if (typeof prestigeBank === 'function') prestigeBank(G, won);
  saveMeta();
  return n;
}
// DNA spent so far, and a full refund (the Gene Bank's CLEAR). Discoveries and records are kept.
function metaSpent() {
  let n = 0;
  for (const b of META_BONUSES) for (let r = 0; r < (META.ranks[b.id] || 0); r++) n += b.cost(r);
  for (const [id, c] of META_STARTERS) if (META.starters[id]) n += c;
  for (const d of META_DYES) if (META.dyes[d.id]) n += d.cost;
  return n;
}
function metaClear() {
  const n = metaSpent();
  META.dna += n; META.ranks = {}; META.starters = {}; META.dyes = { egfp: true }; META.dye = 'egfp';
  setYouColour(META_DYES[0].color);
  saveMeta();
  return n;
}
// Called from newGame(): apply ranks and the chosen dye.
function applyMeta(G) {
  for (const b of META_BONUSES) { const r = META.ranks[b.id] || 0; if (r) b.apply(G, r); }
  if (typeof babyApply === 'function') babyApply(G); // Generations and Baby Traits
  G.heat = Math.min(META.heat || 0, META.heatMax || 0); // Immune Response
  const dye = META_DYES.find(d => d.id === META.dye) || META_DYES[0];
  setYouColour(dye.color);
}
function setYouColour(c) {
  if (PAL.you === c) return;
  PAL.you = c;
  for (const d of Object.values(WEAPONS).concat(Object.values(SPELLS))) d.color = c;
  if (typeof refreshPalette === 'function') refreshPalette(); // only shows once you have the GFP stain
}
function starterPool() {
  const base = ['blaster', 'shotgun', 'glaive', 'flamer', 'frost', 'tesla', 'venom', 'seeker', 'paddle', 'flail', 'onesie'];
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

// ---------------------------------------------------------------- run log
// Every run (win, loss or quit after 30 s) is summarised and kept on the device (last 60), so it can be
// copied from Settings and shared for balancing. Nothing leaves the phone unless you copy it.
const APP_VERSION = '8.34';
let RUNLOG = [];
try { RUNLOG = JSON.parse(localStorage.getItem('sd_runs') || '[]'); } catch (e) { RUNLOG = []; }
function saveRunLog() { try { localStorage.setItem('sd_runs', JSON.stringify(RUNLOG.slice(-60))); } catch (e) { /* ignore */ } }
function logRun(G, result) {
  if (!G || G.logged || G.t < 30) return;
  G.logged = true;
  try { localStorage.removeItem('sd_live'); } catch (e) { /* ignore */ }
  RUNLOG.push(runSummary(G, result));
  saveRunLog();
}
// A run in progress is saved every 20 s and whenever the app is hidden. If the app is closed mid-run,
// the next launch logs it as CLOSED, so runs that never reach a death, win or Quit still show up.
function liveSave(G) {
  if (!G || G.logged || G.t < 30 || G.debug) return;
  try { localStorage.setItem('sd_live', JSON.stringify(runSummary(G, 'CLOSED'))); } catch (e) { /* ignore */ }
}
try { const live = JSON.parse(localStorage.getItem('sd_live') || 'null'); if (live) { live.n = (RUNLOG.length ? RUNLOG[RUNLOG.length - 1].n : 0) + 1; RUNLOG.push(live); saveRunLog(); } localStorage.removeItem('sd_live'); } catch (e) { /* ignore */ }
function runSummary(G, result) {
  const top = (o, n) => Object.entries(o || {}).sort((a, b) => b[1] - a[1]).slice(0, n);
  const dmgTot = Object.values(G.stats.dmg).reduce((a, b) => a + b, 0) || 1;
  const d = new Date(), pad = n => (n < 10 ? '0' : '') + n;
  return {
    n: (RUNLOG.length ? RUNLOG[RUNLOG.length - 1].n : 0) + 1, v: APP_VERSION,
    at: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`,
    res: result, smp: (typeof UI !== 'undefined' && UI.sample) || 's001', ir: G.heat || 0, gen: META.gen || 0, seq: G.genes ? G.genes.active.join('+') : '', combos: Object.keys(G.combo || {}).join('+'), t: Math.round(G.t), lvl: G.level, kills: G.kills, bosses: G.stats.bossKills, rewinds: G.stats.rewinds,
    egg: G.eggAt ? Math.round(G.eggAt) : 0, by: G.rivalWinner || G.stats.lastHit || '',
    hurt: top(G.stats.hurt, 4).map(([k, v]) => k + ' ' + Math.round(v)),
    hurtK: Object.fromEntries(Object.entries(G.stats.hurtKind || {}).map(([k, v]) => [k, Math.round(v)])),
    dots: ['burn', 'poison'].map(t => { const e = Object.entries(G.stats.dmg).filter(([k]) => k.endsWith(' (' + t + ')')).sort((a, b) => b[1] - a[1]), tot = e.reduce((a, x) => a + x[1], 0);
      if (tot / dmgTot < 0.005) return '';
      const src = e.filter(([, v]) => v / dmgTot >= 0.005).slice(0, 4).map(([k, v]) => k.slice(0, -t.length - 3) + ' ' + Math.round(v / dmgTot * 100) + '%').join(', ');
      return `${t} ${Math.round(tot / dmgTot * 100)}%${src ? ' (' + src + ')' : ''}`; }).filter(Boolean), // (no empty brackets when every source is under 0.5%)
    dmg: top(G.stats.dmg, 6).map(([k, v]) => k + ' ' + Math.round(v / dmgTot * 100) + '%'),
    w: G.weapons.filter(Boolean).map(w => w.id + w.lvl + (w.mods.length ? '[' + w.mods.map(m => m.id).join(',') + ']' : '')),
    s: G.spells.filter(Boolean).map(w => w.id + w.lvl),
    p: top(G.passives, 12).map(([k, v]) => k + v),
    boxes: G.stats.boxes || 0, boxBy: G.stats.boxBy || {}, xp: Math.round(G.stats.xpGot || 0), xpRaw: Math.round(G.stats.xpRaw || 0), xpDrop: Math.round(G.stats.xpDrop || 0), xpFloor: Math.round(G.gems.filter(g => g.kind !== 's').reduce((a, g) => a + g.v, 0)), xpK: +((G.P.xp > 1 ? 1 + (G.P.xp - 1) * 0.5 : G.P.xp) * XP_PACE).toFixed(2), curve: Math.round((G.level - (1 + 59 * Math.pow(Math.min(1, G.t / 540), 0.85))) * 10) / 10, rivals: Object.entries(G.rivalOut || {}).map(([k, v]) => k + ':' + v),
    tl: G.tl || [], fps: G.fpsTl || [], perf: G.perfTl || [], dev: typeof deviceTag === 'function' ? deviceTag() : '', cap: (typeof SET !== 'undefined' && SET.fpsCap) || 0, meta: Object.values(META.ranks).reduce((a, b) => a + b, 0), zoom: +ZOOM.z.toFixed(2), spd: (() => { const u = G.spdUse || {}, t = Object.values(u).reduce((a, b) => a + b, 0); if (!t) return ''; const e = Object.entries(u).filter(([, v]) => v / t >= 0.05); return e.length === 1 && +e[0][0] === 1 ? '' : e.map(([k, v]) => 'x' + k + (e.length > 1 ? ' ' + Math.round(v / t * 100) + '%' : '')).join(' '); })(), vet: Math.round(vetK() * VET.hp * 100),
  };
}
function runLogText() {
  const wins = RUNLOG.filter(r => r.res === 'WON').length;
  // Only errors from this version: anything older has been fixed or is out of date.
  let err = ''; try { err = localStorage.getItem('sd_err') || ''; } catch (e) { /* ignore */ }
  if (!err.startsWith('v' + APP_VERSION + ' ')) err = '';
  return `SPAWN PRAWN RUN LOG (v${APP_VERSION}) - ${RUNLOG.length} runs, ${wins} born | ${winTally()}\n` + (err ? 'Last error: ' + err + '\n' : '') + RUNLOG.map(r => '\n' + runText(r)).join('');
}
// Win rate over the last 9 finished runs (wins and losses only; quits and closed runs don't count). Target: 1 in 3.
function winTally() {
  const done = RUNLOG.filter(r => r.res === 'WON' || r.res === 'LOST').slice(-9), w = done.filter(r => r.res === 'WON').length;
  return `last ${done.length} finished: ${w} won (target 1 in 3)`;
}
function runText(r) {
  const m = s => `${Math.floor(s / 60)}:${(s % 60 < 10 ? '0' : '') + s % 60}`;
  let out = `#${r.n} ${r.at} v${r.v} ${r.res} ${m(r.t)}${r.ir ? ' IR' + r.ir : ''}${r.gen ? ' Gen' + r.gen : ''}${r.seq ? ' [' + r.seq + ']' : ''}${r.combos ? ' combos:' + r.combos : ''} Lv${r.lvl} K${r.kills} bosses${r.bosses} rewinds${r.rewinds} final5@${r.egg ? m(r.egg) : '-'} boxes${r.boxes}${r.boxBy && Object.keys(r.boxBy).length ? '(' + Object.entries(r.boxBy).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + v).join(' ') + ')' : ''} metaRanks${r.meta}${r.spd ? ' speed ' + r.spd : ''}${r.vet ? ' vet+' + r.vet + '%' : ''} zoom${r.zoom}${r.dev ? ' | device ' + r.dev : ''}\n`;
  out += ` ended by: ${r.res === 'WON' ? 'the egg (you won)' : r.by || '-'} | hurt: ${r.hurt.join(', ')}\n`;
  if (r.hurtK) { const t = Object.values(r.hurtK).reduce((a, b) => a + b, 0) || 1; out += ` hurt by type: ${Object.entries(r.hurtK).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v} (${Math.round(v / t * 100)}%)`).join(', ') || '-'}\n`; }
  out += ` dmg: ${r.dmg.join(', ')}\n`;
  if (r.dots && r.dots.length) out += ` dots: ${r.dots.join(' | ')}\n`;
  out += ` build: ${r.w.join(' ')} | spells: ${r.s.join(' ') || '-'} | ups: ${r.p.join(' ') || '-'}\n`;
  if (r.xp != null) out += ` xp: ${r.xp} gained (x${r.xpK} bonus on ${r.xpRaw} collected of ${r.xpDrop} dropped, ${r.xpFloor} left on the floor) | vs level curve: ${r.curve >= 0 ? '+' : ''}${r.curve} levels\n`;
  out += ` rivals: ${r.rivals.join(' ') || '-'} | lv/hp% per min: ${r.tl.join(' ')}${r.fps && r.fps.length ? ' | fps avg/low per min: ' + r.fps.join(' ') : ''}\n`;
  if (r.perf && r.perf.length) out += ` worst frame per min (cap ${r.cap || 'off'}; ms total(u update d draw) e enemies b bullets s shots p particles z zones L frames over 50ms): ${r.perf.join(' ')}\n`;
  return out;
}
function copyText(text) {
  const fallback = () => {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove(); return ok;
  };
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(() => true, () => fallback());
  return Promise.resolve(fallback());
}
