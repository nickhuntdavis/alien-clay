const fs = require('fs'), vm = require('vm');
const J = require('path').resolve(__dirname, '../../web/js') + '/';
const src = fs.readFileSync(J + 'data.js', 'utf8') + '\n' +
  fs.readFileSync(J + 'meta.js', 'utf8').split('// ---------------------------------------------------------------- run log')[0] +
  '\n' + (fs.readFileSync(J + 'arsenal.js', 'utf8').match(/function weaponTree[\s\S]*?\n}\n/)[0]) +
  '\n' + fs.readFileSync(J + 'events.js', 'utf8') +
  '\n;var MICROBES = {};\n' + ['boons.js', 'combos.js', 'genes.js', 'prestige.js', 'pickups.js', 'silly.js', 'rrelics.js', 'foes.js', 'brood.js', 'intro.js', 'spellfork.js', 'junk.js', 'grants.js'].map(f => fs.readFileSync(J + f, 'utf8')).join('\n') +
  '\n' + fs.readFileSync(J + 'seqsel.js', 'utf8').split('// ---------------------------------------------------------------- the portrait')[0] + '\n' + fs.readFileSync(J + 'reborn.js', 'utf8') + '\n' + fs.readFileSync(J + 'genegun.js', 'utf8') + '\n' + fs.readFileSync(J + 'redtail.js', 'utf8') + '\n' + fs.readFileSync(J + 'pairs2.js', 'utf8') + '\n' + fs.readFileSync(J + 'chem.js', 'utf8') + '\n' + fs.readFileSync(J + 'spoils.js', 'utf8') + '\n' + fs.readFileSync(J + 'campaign.js', 'utf8') + '\n' + fs.readFileSync(J + 'evolve.js', 'utf8') +
  '\n' + fs.readFileSync(J + 'quirks.js', 'utf8') + '\n' + fs.readFileSync(J + 'toys.js', 'utf8').match(/Object\.assign\(QUIRKS, \{[\s\S]*?\n\}\);/)[0] +
  '\n;globalThis.OUT={JUNK,JUNK_POWERS,GRANTS,GRANT_ORDER,EVOLVE,TWISTS,SPOILS,CAMP,ENTOURAGE,DROP_NAMES,ENEMY_INTRO,SPELL_FORKS,SPELL_FORK_LV,RIVAL_RELICS,QUIRKS,BOONS,COMBOS,COMBO_LEVEL,COMBO_MOUNTS,PROFILES,PROFILE_SYNERGIES,PROFILE_RANKS,SEQ_ABILITY,MUTATIONS,VESICLE,SPLICE_LEVELS,IMMUNE,IMMUNE_DNA,BABY_TRAITS,PU_TIME,PU_NEW,SEQ_LOOK,ADAPT,PERK_ADAPT,MAX_WEAPONS,SIGS,PAIRINGS,PAIR_LEVEL,RELICS,BOSSES_PER_RUN,ELEMENTS,DIRECTIVES,MOVE_DIRECTIVES,WEAPONS,SPELLS,RARITIES,PASSIVES,REACTIONS,SYNERGIES,ENEMIES,BOSSES,BOSS_INTERVAL,POWERUPS,SLOT_LEVELS,SAMPLES,DYES,PERK_LEVELS,MAX_WLVL,PERKS,OBSTACLES,RIVALS,CHRONO,MOD_SLOTS,MOD_POWER,MODS,DUOS,CURSES,META_BONUSES,META_STARTERS,META_DYES,weaponTree,RUN_EVENTS,DIRE_LV,EVENT_FIRST_LV};';
const ctx = { localStorage: { getItem: () => null, setItem() {} }, console, document: { getElementById: () => null, body: { classList: { toggle() {} } } }, window: {} };
vm.createContext(ctx); vm.runInContext(src.replace(/^'use strict';/gm, ''), ctx);
const D = ctx.OUT;
const L = []; const p = s => L.push(s);
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|');
const el = e => (D.ELEMENTS[e] || {}).name || e;
const dirName = id => (D.DIRECTIVES.find(d => d.id === id) || {}).name || id || '';
const num = v => typeof v === 'number' ? +v.toFixed(3) : v;
const LABEL = { dmg: 'dmg', cd: 'cd', count: 'count', pierce: 'pierce', area: 'area', dur: 'duration', chain: 'chain', bounce: 'bounce', shred: 'shred', explode: 'blast', speed: 'speed', range: 'range', size: 'size' };
const lvText = (lv, heal) => Object.entries(lv || {}).map(([l, o]) => `Lv${l}: ` + Object.entries(o).map(([k, v]) =>
  k === 'film' ? `thicker bubbles (each holds ${v} more times the wand's damage before it pops, and adds what it soaked to the pop)` : k === 'rainbow' ? 'rainbow pops (each pop takes a random damage type)' : heal && k === 'dmg' ? `+${Math.round(v * 100)}% healing` : ['dmg', 'area', 'dur'].includes(k) ? `+${Math.round(v * 100)}% ${LABEL[k]}` : k === 'cd' ? `${Math.round(-v * 100)}% faster` : `+${num(v)} ${LABEL[k] || k}`).join(', ')).join('; ');
const MAIN = ['dmg', 'cd', 'mag', 'reload', 'count', 'pierce', 'range'];
const other = b => Object.entries(b).filter(([k]) => !MAIN.includes(k) && !['spread', 'speed', 'size'].includes(k)).map(([k, v]) => `${k} ${num(v)}`).join(', ');
const perkName = id => D.PERKS[id] ? D.PERKS[id].name : id;
const treeText = def => { const t = D.weaponTree(def); return D.PERK_LEVELS.map(l => `**Lv${l}:** ${(t[l] || []).map(perkName).join(' / ')}`).join('<br>'); };
const starters = ['blaster', 'shotgun', 'glaive', 'flamer', 'frost', 'tesla', 'venom', 'seeker', 'paddle', 'flail', 'onesie'];
const bank = Object.fromEntries(D.META_STARTERS);

p('# Spawn Prawn: complete game guide');
p('');
p('Every sequence, weapon, combo, Feat, power-up, perk, modifier, stain and curse in the game, with its numbers. Generated from the game data (`web/js/data.js`), so the figures match the build. Numbers are base values at level 1 and common rarity; rarer cards multiply them.');
p('');
p('## Contents'); p('%%TOC%%'); p('');
p('## How upgrades work');
p('');
p('1. **Level-ups and DNA strands** offer loot cards: new weapons, weapon levels, Feats, power-ups, modifiers, stains and (rarely) curses.');
p(`2. **Weapons** level up to Lv${D.MAX_WLVL}. Each weapon has its own upgrade path:`);
p('   - **Lv 3:** pick one of three upgrades any weapon can take (fixed per weapon, so you can plan it). **Lv 5 and Lv 8:** pick one of two signature upgrades only that weapon has. **Lv 10 (mastery):** only one weapon a run can reach it; the others stop at Lv 9.');
p(`3. **Combos:** get two specific weapons to Lv ${D.COMBO_LEVEL}+ and a COMBO card turns up in your next box. Fuse them and both keep firing, gain a new power, and (${D.COMBO_MOUNTS} times a run) you get a bonus weapon mount. **Pairings** are smaller secret bonuses that switch on by themselves when you own both weapons at Lv${D.PAIR_LEVEL}+.`);
p('4. **Weapon tuning:** fire rate, reload, magazine, extra projectiles, projectile speed and range, area, duration and pierce cards go on ONE weapon you choose (tap it on the card); each weapon keeps its own stacks. Legendary and better versions tune every weapon at once.');
p(`5. **Modifiers:** up to ${D.MOD_SLOTS} per weapon. Picking one a weapon already has boosts its power. Two specific modifiers on one weapon unlock a duo combo.`);
p(`6. **Weapon drafts:** your first weapon at level 1, then a new weapon mount at Lv ${D.SLOT_LEVELS.join(', ')} (${D.MAX_WEAPONS} in total, plus up to ${D.COMBO_MOUNTS} bonus mounts from combos). You can only draft weapons from the sequences you carry (plus any Gene Bank wildcards). Ordinary DNA strands never offer new weapons.`);
p(`7. **Sequences:** you start with one Primary Sequence (its trait at full strength, its weapons and its starting ability). At Lv ${D.SPLICE_LEVELS.join(', ')} you can splice in another at half strength (three sequences in total: your primary plus two splices), or skip and take a mutation instead (two rerolls if your genome is full).`);
p(`8. **Lateral Gene Transfer (junk DNA):** from ${D.JUNK.first}s in, then every ${D.JUNK.every.join(' to ')}s, one ordinary enemy on screen carries junk DNA (a white double helix round it, and ${Math.round((D.JUNK.hpK - 1) * 100)}% more health). Kill it within ${D.JUNK.life}s and you absorb a small power of whatever it was, at once; the same kind again stacks, up to ${D.JUNK.stacks} times. **Mutations** (pick one of four; ${D.VESICLE.slots} slots) now come from skipping a sequence splice and from stashes hidden in campaign levels.`);
p(`9. **Bosses:** four bosses, at about 2:05, 3:50, 5:35 and 7:20 of game time; a fifth waits until the Fever Pitch. Each run meets ${D.BOSSES_PER_RUN} of the ${D.BOSSES.length}, in a random order. Beat one and choose one of its three relics.`);
p('10. **Rarity** multiplies a card\'s value:');
p('');
p('| Rarity | Multiplier | Weapon levels granted | Roll weight (relative) | Share of cards offered (mid-run) |'); p('|---|---|---|---|---|');
const OFFER = { Common: '41%', Uncommon: '27%', Rare: '21%', Epic: '5.3%', Legendary: '5.6%', Mythical: '0.45%', Immaculate: '0.12%' };
D.RARITIES.forEach(r => p(`| ${r.name} | x${r.mult} | +${r.lvls} | ${r.w || 'separate roll'} | ${OFFER[r.name] || ''} |`));
p('');
p('Weights are relative, not percentages, and luck tilts them towards the rarer rows. Mythical and Immaculate skip the table: every card first rolls 0.55% for Mythical and 0.18% for Immaculate (times 1 + 2 x luck), three a run at most. Legendary shows up more often than Epic because Legendary-only cards (curses, combos) add to it.');
p('');
p('**Level bonus key:** "+N count/pierce" is additive; "+N% dmg/area/duration" adds to the base; "N% faster" cuts the cooldown.');
p('');

p('## Epigenetic Profiles (sequences)'); p('');
p(`Choose your Primary Sequence before each run. It gives its trait at full strength, its exclusive weapons and a starting ability that fires by itself (or tap its button). Spliced-in sequences give their trait at half strength and add their weapons to your drafts. Each sequence ranks up with kills while you carry it (Rank 2 at ${D.PROFILE_RANKS[1].toLocaleString('en-GB')}, Rank 3 at ${D.PROFILE_RANKS[2].toLocaleString('en-GB')}), doubling its trait each time. Your weapons take your primary's colour (with the GFP Tag).`); p('');
p('| Sequence | Trait (Rank 1) | Weapons | Starting ability | Unlock |'); p('|---|---|---|---|---|');
for (const [id, q] of Object.entries(D.PROFILES)) { const A = D.SEQ_ABILITY[id]; p(`| **${esc(q.name)}** | ${esc(q.trait)}: ${esc(q.fmt(1))} | ${q.weapons.map(w => D.WEAPONS[w].name).join(', ')} | **${esc(A.name)}** (${A.cd}s): ${esc(A.desc)} | ${q.unlock ? esc(q.unlock.text) : 'Always'} |`); }
p(''); p('### Sequence synergies'); p('');
p('| Synergy | Sequences | Effect |'); p('|---|---|---|');
for (const q of D.PROFILE_SYNERGIES) p(`| **${esc(q.name)}** | ${D.PROFILES[q.a].name} + ${D.PROFILES[q.b].name} | ${esc(q.desc)} |`);
p('');
const W = Object.entries(D.WEAPONS).map(([id, d]) => Object.assign({ id }, d));
const pairsOf = id => D.PAIRINGS.filter(q => q.a === id || q.b === id).map(q => `**${q.name}** (+ ${D.WEAPONS[q.a === id ? q.b : q.a].name})`).join(', ');
p('## Weapons');
p('');
p(`${W.length} weapons, each with its own play style. Every weapon belongs to one sequence and only that sequence can draft it, unless you unlock it as a wildcard in the Gene Bank (DNA cost shown). Long-range weapons start at a reach of 300 and grow 30 a level to their full range.`);
p('');
const ownerOf = id => { const k = Object.keys(D.PROFILES).find(p => D.PROFILES[p].weapons.includes(id)); return k ? D.PROFILES[k].name.replace(/^The /, '') : '-'; };
p('| Weapon | Sequence | Damage type | Role | Aims at | Wildcard |'); p('|---|---|---|---|---|---|');
for (const w of W) p(`| [${esc(w.name)}](#${w.name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-')}) | ${ownerOf(w.id)} | ${el(w.elem)} | ${w.role} | ${dirName(w.dir)} | ${bank[w.id] ? bank[w.id] + ' DNA' : '-'} |`);
p('');
for (const w of W) {
  const b = w.base, t = D.weaponTree(w);
  const stats = [b.dmg != null && `dmg ${num(b.dmg)}`, b.cd && `cd ${num(b.cd)}s`, b.mag && `mag ${b.mag}`, b.reload && `reload ${num(b.reload)}s`, b.count > 1 && `x${b.count}`, b.pierce && `pierce ${b.pierce > 90 ? 'all' : b.pierce}`, b.range && `range ${b.range}`].filter(Boolean).join(', ');
  p(`### ${w.name}`); p('');
  p(`*${el(w.elem)} ${w.kind}, ${w.role}.* ${w.desc}`); p('');
  p(`- **Base stats:** ${stats}${other(b) ? ' (' + other(b) + ')' : ''}`);
  p(`- **Level bonuses:** ${lvText(w.lv)}`);
  p(`- **Combos:** ${D.COMBOS.filter(c => c.a === w.id || c.b === w.id).map(c => `**${c.name}** (+ ${D.WEAPONS[c.a === w.id ? c.b : c.a].name})`).join(', ') || '-'}`);
  p(`- **Pairings:** ${pairsOf(w.id) || '-'}`);
  p('');
  p('| Level | Choice | Effect |'); p('|---|---|---|');
  for (const l of D.PERK_LEVELS) {
    const sig = w.sig && w.sig[l];
    const label = sig ? (l >= 10 ? `Lv ${l} mastery` : `Lv ${l} signature`) : `Lv ${l}`;
    t[l].forEach((id, i) => { const K = sig ? D.SIGS[id] : D.PERKS[id]; p(`| ${i ? '' : label} | **${esc(K.name)}** | ${esc(K.desc.replace(/^Mastery\. /, ''))} |`); });
  }
  p('');
}
p('### Upgrades with a twist'); p('');
p('When an upgrade would do nothing for a weapon, that weapon does its own thing with it instead (the card tells you).'); p('');
p('| Upgrade | Weapon | What it does instead |'); p('|---|---|---|');
for (const [id, m] of Object.entries(D.ADAPT)) for (const [wid, note] of Object.entries(m)) p(`| ${D.PASSIVES[id].name} | ${D.WEAPONS[wid].name} | ${esc(note.replace(/^[^:]+: /, ''))} |`);
for (const [id, m] of Object.entries(D.PERK_ADAPT)) if (D.PERKS[id].tier === 1) for (const [wid, note] of Object.entries(m)) p(`| ${D.PERKS[id].name} | ${D.WEAPONS[wid].name} | ${esc(note)} |`);
p('');
p('## Weapon combos'); p('');
p(`Both weapons at Lv ${D.COMBO_LEVEL}+: a COMBO card is guaranteed in your next box. Both keep firing, gain the power below, and the first ${D.COMBO_MOUNTS} combos a run open a bonus weapon mount with a draft.`); p('');
p('| Combo | Weapons | Sequence | Power |'); p('|---|---|---|---|');
for (const c of D.COMBOS) { const a = ownerOf(c.a), b = ownerOf(c.b); p(`| **${esc(c.name)}** | ${D.WEAPONS[c.a].name} + ${D.WEAPONS[c.b].name} | ${a === b ? a : a + ' + ' + b + ' (needs a splice)'} | ${esc(c.desc)} |`); }
p('');
p('## Pairings (secret combos)'); p('');
p(`Own both weapons at Lv ${D.PAIR_LEVEL}+ and the pairing switches on. In the game they stay hidden (???) until you find them once.`); p('');
p('| Pairing | Weapons | Effect |'); p('|---|---|---|');
for (const q of D.PAIRINGS) p(`| **${esc(q.name)}** | ${D.WEAPONS[q.a].name} + ${D.WEAPONS[q.b].name} | ${esc(q.desc)} |`);
p('');
p('## Bosses and relics'); p('');
p(`A boss arrives every ${(D.BOSS_INTERVAL / 60).toFixed(2).replace(/0$/, '')} minutes of game time, four in all. Each run draws ${D.BOSSES_PER_RUN} of these ${D.BOSSES.length} at random; a fifth (a tougher repeat) waits until the Fever Pitch. Every boss is introduced with its strengths and weaknesses, and beating it offers a choice of its three relics.`); p('');
for (const b of D.BOSSES) {
  p(`### ${b.name}: ${b.title}`); p('');
  p(`> "${b.quote}"`); p('');
  p(`${b.desc} Base HP ${b.hp}${b.twins ? ' each' : ''}, armour ${b.armour}, speed ${b.speed}.`); p('');
  p(`- **Strengths:** ${b.strengths.join('; ')}.`);
  p(`- **Weaknesses:** ${b.weaknesses.join('; ')}.`);
  p('');
  p('| Trophy | Effect |'); p('|---|---|');
  for (const id of b.relics) p(`| **${esc(D.RELICS[id].name)}** | ${esc(D.RELICS[id].desc)} |`);
  p('');
}
p('## Run events'); p('');
p(`From level ${D.EVENT_FIRST_LV} (and about 70 seconds in), something unexpected happens every 55 to 75 seconds: never during a boss fight, the Final Five or the swim to the egg. From level ${D.DIRE_LV} events turn **DIRE**: they come every 35 to 50 seconds, hit harder, pay out more, and 30% of the time two arrive at once. Run-event targets (the Golden Swimmer and bounties) get an arrow on screen, and every weapon and the autorun go after them first.`); p('');
p('| Event | Lasts | Normal | Dire |'); p('|---|---|---|---|');
for (const [id, e] of Object.entries(D.RUN_EVENTS)) p(`| **${esc(e.name)}**${e.minLv ? ` (Lv ${e.minLv}+)` : ''} | ${e.dur}s | ${esc(e.desc(false))} | ${esc(e.desc(true))} |`);
p('');
p('## Feats'); p('');
p(`Feats (what used to be spells) cast themselves and use the two Feat slots. The attacking ones (Stork Drop, Power Shower, Brainstorm, Sofa Crevice, Running With Scissors, Dutch Oven) are paid for from your stamina instead of waiting on a cooldown; the rest keep cooldowns. They level up like weapons, and at Lv ${D.SPELL_FORK_LV} each one asks you to choose one of two paths (below).`); p('');
p('| Feat | Damage type | What it does | Base stats | Level bonuses |'); p('|---|---|---|---|---|');
for (const [id, s] of Object.entries(D.SPELLS)) { const b = s.base;
  const stats = Object.entries(b).filter(([k, v]) => v && k !== 'range').map(([k, v]) => id === 'heal' && k === 'dmg' ? `heals ${Math.round(v * 100)}% HP` : k === 'cd' || k === 'dur' || k === 'delay' ? `${k} ${v}s` : `${k} ${v}`).join(', ');
  p(`| **${esc(s.name)}** | ${el(s.elem)} | ${esc(s.desc)} | ${stats} | ${lvText(s.lv, id === 'heal')} |`); }
p('');
p(`### Feat paths (Lv ${D.SPELL_FORK_LV})`); p('');
p('| Feat | Path A | Path B |'); p('|---|---|---|');
for (const [id, f] of Object.entries(D.SPELL_FORKS)) p(`| **${esc(D.SPELLS[id].name)}** | **${esc(f[0].name)}**: ${esc(f[0].desc)} | **${esc(f[1].name)}**: ${esc(f[1].desc)} |`);
p('');
p('## Power-ups (passives)'); p('');
p('Stat boosts that stack. Value shown is per pick at Common rarity.'); p('');
const TUNE = ['haste', 'reload', 'mag', 'multishot', 'velocity', 'area', 'duration', 'pierce'];
p('**Tunes one weapon** means the card goes on one weapon you choose (each weapon has its own max stacks), unless it is Legendary or better, which tunes every weapon.'); p('');
p('| Power-up | Per pick | Applies to | Max stacks |'); p('|---|---|---|---|');
for (const [id, q] of Object.entries(D.PASSIVES)) p(`| **${esc(q.name)}** | ${esc(q.fmt(q.v).replace(/ for all weapons/, ''))}${q.minRarity ? ` (${D.RARITIES[q.minRarity].name} or better only)` : ''} | ${TUNE.includes(id) ? 'Tunes one weapon' : 'You'} | ${q.max}${TUNE.includes(id) ? ' per weapon' : ''} |`);
p('');
p('## Junk DNA (Lateral Gene Transfer)'); p('');
p(`One power per enemy type (offspring such as Daughter Cells carry their parent's). Values are per stack; up to ${D.JUNK.stacks} stacks. Shots and blasts scale with your level and damage. Bosses, rivals and allies never carry junk DNA. In the Petri Dish, carriers only turn up while a wave is on.`); p('');
p('| Enemy | Power | Effect (1 stack) | Effect (3 stacks) |'); p('|---|---|---|---|');
for (const [id, J] of Object.entries(D.JUNK_POWERS)) p(`| ${esc((D.ENEMIES[id] || {}).name || id)} | **${esc(J.name)}** | ${esc(J.fmt(1))} | ${esc(J.fmt(3))} |`);
p('');
p('## Mutations'); p('');
p(`From skipping a sequence splice, and from stashes hidden in campaign levels: pick one of four. ${D.VESICLE.slots} slots (more with the Gene Bank's Well-Incubated). Tier 0 are common, tier 2 rare.`); p('');
p('| Mutation | Tier | Effect |'); p('|---|---|---|');
for (const m of Object.values(D.MUTATIONS).sort((a, b) => (a.tier || 0) - (b.tier || 0))) p(`| **${esc(m.name)}** | ${m.tier || 0} | ${esc(m.desc)} |`);
p('');
p('## Mythical and Immaculate bonuses'); p('');
p('A Mythical or Immaculate card carries one of these on top of its own effect, for the rest of the run (three at most a run).'); p('');
p('| Bonus | Rarity | Effect |'); p('|---|---|---|');
for (const b of Object.values(D.BOONS)) p(`| **${esc(b.name)}** | ${D.RARITIES[b.tier].name} | ${esc(b.desc)} |`);
p('');
p('## Upgrades any weapon can take'); p('');
p('Offered at weapon level 3. Which three a weapon is offered is fixed per weapon (see its table above). Levels 5, 8 and 10 are always the weapon\'s own signature choices.'); p('');
[[3, [1]]].forEach(([lvl, tiers]) => { p(`### Lv ${lvl} pool`); p(''); p('| Upgrade | Effect |'); p('|---|---|');
  for (const k of Object.values(D.PERKS).filter(k => tiers.includes(k.tier))) p(`| **${esc(k.name)}** | ${esc(k.desc)} |`); p(''); });
p('## Modifiers'); p('');
p(`Slot into one weapon (${D.MOD_SLOTS} per weapon). Power by rarity: ${D.RARITIES.map((r, i) => `${r.name} x${D.MOD_POWER[i]}`).join(', ')}. Values below are at Common. "Projectile only" means guns and other shot-firing weapons.`); p('');
p('| Modifier | Effect (Common) | Effect (Legendary) | Fits |'); p('|---|---|---|---|');
for (const m of Object.values(D.MODS)) p(`| **${m.name}** | ${esc(m.desc(1))} | ${esc(m.desc(D.MOD_POWER[4]))} | ${m.kinds ? 'Projectile only' : 'Any weapon'} |`);
p('');
p('## Duo combos'); p('');
p('| Combo | Modifiers | Bonus |'); p('|---|---|---|');
for (const d of D.DUOS) p(`| **${d.name}** | ${D.MODS[d.a].name} + ${D.MODS[d.b].name} | ${esc(d.desc)} |`);
p('');
p('## Stains'); p('');
p('The slide starts in greyscale, your own swimmer included. Colour comes back two ways.'); p('');
p('**Stain grants** are permanent: each turns up once ever, floating on the slide for you to swim into, and is on in every run after that (the pause menu switches any off). Not in campaign levels.'); p('');
p('| Grant | When | What it colours |'); p('|---|---|---|');
for (const id of D.GRANT_ORDER) { const g = D.GRANTS[id]; p(`| **${g.name}** | ${id === 'body' ? 'Floats by the egg, your first game (until you take it)' : `Level ${g.level}, once you have ${D.GRANTS[g.after].name}`} | ${esc(g.see)} |`); }
p('');
p('**Stain cards** turn up in DNA strands: each colours one more thing for that run and brings a boon. (Stains kept on older versions stay on; a kept GFP Tag became the first two grants.)'); p('');
p('| Stain | Boon | What it colours |'); p('|---|---|---|');
for (const d of Object.values(D.DYES)) p(`| **${d.name}** | ${esc(d.boon)} | ${esc(d.desc)} |`);
p('');
p('## Cursed cards'); p('');
p('| Curse | Boon | Bane |'); p('|---|---|---|');
for (const c of D.CURSES) p(`| **${esc(c.name)}** | ${esc(c.boon)} | ${esc(c.bane)} |`);
p('');
p('## Field pickups (temporary power-ups)'); p('');
p('Dropped by kills and elites. Timed ones show a countdown chip.'); p('');
p('| Pickup | Letter | Effect |'); p('|---|---|---|');
for (const q of Object.values(D.POWERUPS)) p(`| **${q.name}** | ${esc(q.letter)} | ${esc(q.desc)} |`);
p('');
p('## Stamina'); p('');
p('One bar of 60 (shown as a thin ring inside your health ring). In manual control, hold the stick right at its edge for a moment (or hold Shift) to sprint: 55% faster, burning 30 stamina a second. Run dry and you are winded until it is back to 30%. Stamina refills at 14 a second after a short pause. The attacking Feats cost stamina (9 per second of their old cooldown, never more than 90% of a full bar), so sprinting and casting share it. Upgrades: Big Lungs (+25 max), Second Wind (refills 30% faster), Cardio (sprinting cheaper and faster), Muscle Memory (Feats cheaper). Curses: Smoker\'s Cough and Couch Potato.'); p('');
p('## Sequence evolutions'); p('');
p('Your Primary Sequence evolves at Lv 5, 10, 20 and 50.'); p('');
p('| Sequence | Lv 5 | Lv 10 | Lv 20 | Lv 50 |'); p('|---|---|---|---|---|');
for (const [id, E] of Object.entries(D.EVOLVE)) p(`| ${(D.SEQ_LOOK[id] || {}).short || id} | ${E.map(e => `**${e.name}**: ${esc(e.desc)}`).join(' | ')} |`);
p('');
p('## Damage types'); p('');
p('Every weapon and Feat has one. Switched at Birth changes it.'); p('');
p('| Damage type | Status it leaves | What it does |'); p('|---|---|---|');
for (const e of Object.values(D.ELEMENTS)) p(`| **${e.name}** | ${e.status} | ${esc(e.blurb)} |`);
p('');
p('## Chemical reactions'); p('');
p('| Reaction | Trigger and effect |'); p('|---|---|');
for (const r of Object.values(D.REACTIONS)) p(`| **${r.name}** | ${esc(r.desc)} |`);
p('');
p('## Combo twists'); p('');
p('A combo whose two weapons are on their usual damage types does what its card says. Change either weapon\'s damage type (Switched at Birth) and the combo also picks up the twist for its new pair of damage types. The twist fires on every hit the combo itself deals, and on about 1 in 8 of either weapon\'s own hits. The Switched at Birth card says which twist you would get.'); p('');
p('| Damage-type pair | Twist | Effect |'); p('|---|---|---|');
for (const [k, t] of Object.entries(D.TWISTS)) p(`| ${k.split('+').map(el).join(' + ')} | **${t.name}** | ${esc(t.desc)} |`);
p('');
p('## Damage-type synergies'); p('');
p('Own two or more weapons or Feats of one damage type to unlock its set bonus.'); p('');
p('| Damage type | Bonus name | Effect |'); p('|---|---|---|');
for (const [e, s] of Object.entries(D.SYNERGIES)) p(`| ${el(e)} | **${s.name}** | ${esc(s.desc)} |`);
p('');
p('## Targeting directives'); p('');
p('| Directive | Aims at |'); p('|---|---|');
for (const d of D.DIRECTIVES) p(`| **${d.name}** | ${esc(d.desc)} |`);
p('');
p('## Movement directives'); p('');
p('| Directive | Behaviour |'); p('|---|---|');
for (const d of D.MOVE_DIRECTIVES) p(`| **${d.name}** | ${esc(d.desc)} |`);
p('');
p('## Immune Response (difficulty)'); p('');
p(`Set on the sequence screen. Each level adds its rule on top of the ones before and +${Math.round(D.IMMUNE_DNA * 100)}% DNA. Win at your highest level to unlock the next.`); p('');
p('| Level | Name | Rule |'); p('|---|---|---|');
D.IMMUNE.forEach((q, i) => p(`| ${i + 1} | **${esc(q.name)}** | ${esc(q.desc)} |`));
p('');
p('## Being born (prestige)'); p('');
p('After a win, the Gene Bank lets you be born: your bonuses, wildcards, dyes and DNA reset, but your Generation goes up for good (+10% DNA, +3% damage and +5 max HP each) and you keep a Baby Trait forever. The Field Guide, sequences, ranks and records stay.'); p('');
p('| Baby Trait | Effect |'); p('|---|---|');
for (const b of Object.values(D.BABY_TRAITS)) p(`| **${esc(b.name)}** | ${esc(b.desc)} |`);
p('');
p('## Gene Bank (permanent upgrades)'); p('');
p('Every run earns DNA: 2 per level, 1 per 80 kills, 15 per boss, 12 per rival you beat, 1 per 30 seconds survived, plus 120 for a win.'); p('');
p('### Bonuses'); p('');
p('| Bonus | Effect | Max rank | Cost per rank |'); p('|---|---|---|---|');
for (const b of D.META_BONUSES) p(`| **${b.name}** | ${b.desc} | ${b.max} | ${Array.from({ length: b.max }, (_, r) => b.cost(r)).join(' / ')} |`);
p(''); p('### Wildcard weapons'); p('');
p('Unlocked wildcards can be drafted by any sequence.'); p('');
p('| Weapon | DNA |'); p('|---|---|');
for (const [id, c] of D.META_STARTERS) p(`| ${D.WEAPONS[id].name} | ${c} |`);
p(''); p('### GFP variants'); p('');
p('| Colour | DNA |'); p('|---|---|');
for (const d of D.META_DYES) p(`| ${d.name} | ${d.cost || 'Free'} |`);
p('');
p('## Enemies'); p('');
p('HP and damage are at the start; both scale up over the run. **From** is the earliest spawn time.'); p('');
p('| Enemy | HP | Damage | Speed | Armour | XP | From | Behaviour |'); p('|---|---|---|---|---|---|---|---|');
const AI = { sperminator: 'Laser lock-on, burst fire, comes back once as a Second Dose', alien: 'Weaves, crouches, pounces; acid blood', chase: 'Swims straight at you', ranged: 'Keeps distance and shoots', charge: 'Winds up, then charges', bomber: 'Rushes in and explodes', summon: 'Spawns minions', medic: 'Heals nearby enemies', turret: 'Sits still and shoots', blink: 'Teleports around', phase: 'Phases in and out', aura: 'Damages anything close', engulf: 'Swallows you if it touches', thief: 'Steals XP and runs', ciliate: 'Darts in bursts', krill: 'Swarms in schools', yeast: 'Buds new yeast cells' };
const mm = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
for (const [id, e] of Object.entries(D.ENEMIES).sort((a, b) => a[1].from - b[1].from)) p(`| **${esc(e.name)}** | ${e.hp} | ${e.dmg} | ${e.speed} | ${e.armour || 0} | ${e.xp} | ${e.from >= 9999 ? 'Spawned by others' : mm(e.from)} | ${e.endo ? 'Laser lock-on, burst fire' : AI[e.ai] || e.ai} |`);
p('');
p('### First sightings'); p('');
p('The first time you ever see each kind of enemy (once ever, not once a run), the slide stops and it gets a short introduction: what it is and how to beat it. It then goes in the Field Guide under ENEMIES. Settings > Tutorial resets them so you can see them again. Bosses always get their full introduction.'); p('');
p('**Spotlight.** That first meeting also gets the stage for about 17 seconds: it arrives as a pack, most new spawns are more of it, the rest of the crowd near you backs off and scripted waves wait, so you can get a feel for it. Types you have already met just join the run as normal.'); p('');
p('| Enemy | What it is | How to beat it |'); p('|---|---|---|');
for (const [id, I] of Object.entries(D.ENEMY_INTRO)) p(`| **${esc(D.ENEMIES[id].name)}** | ${esc(I.what)} | ${esc(I.tip)} |`);
p('');
p('## Rival champions'); p('');
p('Named rivals race you to the egg. When the sperm count reaches 6, the strongest five survivors (rivals first, stand-ins after) become the Final Five. Beat them and the egg opens.'); p('');
p('Knock a named rival out of the race and you choose one of their two relics.'); p('');
p('The first time you ever meet each named rival, the slide stops to introduce them: personality, five attributes (1 to 5) and two specialities that change how they fight.'); p('');
p('| Rival | Growth speed | Aggression | Speed / Tough / Fire / Aggro / Growth | Specialities | How to beat them | Relics (choose one) |'); p('|---|---|---|---|---|---|---|');
for (const r of D.RIVALS) p(`| **${esc(r.name)}** (${esc(r.nick)}) | x${r.skill} | ${r.aggro} | ${r.attrs.join(' / ')} | ${r.specs.map(x => `**${esc(x.name)}**: ${esc(x.desc)}`).join('<br>')} | ${esc(r.tip)} | ${(D.RIVAL_RELICS[r.id] || []).map(id => `**${esc(D.RELICS[id].name)}**: ${esc(D.RELICS[id].desc)}`).join('<br>')} |`);
p('');
p('## Terrain'); p('');
p('Each kind of terrain has an upgrade of its own, offered only when that terrain is on the slide.'); p('');
p('| Feature | Solid | Effect on shots | Notes | Upgrade |'); p('|---|---|---|---|---|');
for (const [tk, o] of Object.entries(D.OBSTACLES)) { const tu = Object.values(D.PASSIVES).find(q => q.terrain === tk); p(`| **${o.name}** | ${o.solid ? 'Yes' : 'No'} | ${o.shot} | ${[o.dps && `${o.dps} damage/s on contact`, o.charge && `absorbs ${o.charge} shots then bursts (radius ${o.burstR})`, o.push && `pushes ${o.push}`, o.traction && `traction x${o.traction}`].filter(Boolean).join('; ') || '-'} | ${tu ? `**${esc(tu.name)}**: ${esc(tu.fmt(1))}` : '-'} |`); }
p('');
p('Also on the slide: the **Morning-After Pill** (a dissolving cloud that grows to about half the map, then fades), **yeast infections** (colonies that bud more yeast) and the ambient crowd of harmless swimmers outside the arena.');
p('');
p('## Campaign (SPOILERS: where Level 1 is set)'); p('');
p('A hand-built maze, lips to throat, played as its own run (you start at Lv 1; DNA banks as usual). Finding the way is up to you: autorun fights where you are but does not solve the maze. If you go 40 seconds without getting any further, a faint chevron next to you points the way on.'); p('');
p('1. **The Lips:** behind the front teeth, a small arena (30 kills) opens the way on.');
p('2. **The Gum Line:** a maze. Plaque walls break if you keep shooting them (some hide shortcuts), and plaque colonies grow Cavity Creeps. A dead end holds a guarded cavity: a mutation and a DNA strand. Then the Gum Pocket arena (70).');
p('3. **The Tongue:** open ground, saliva pools that slow everything, coughs that blow everyone towards the throat, and mouthwash fronts that sweep the tongue: get behind a tooth, because it scours everything out in the open, germs included. The Papillae arena (90) and the Back of the Tongue (110).');
p('4. **The Throat:** the Tartar Colony (a mini-boss in calcified plaque). Beat it and the way to the egg opens. Except it is a tonsil stone. It stinks. The Egg is in another castle, and Level 2 unlocks.'); p('');
p('Arenas seal behind you until the quota is cleared. Food scraps in the corridors break for pick-ups. After 9 minutes the toothbrush starts sweeping up from the lips (it waits while you fight the boss). Local germs: Cavity Creep, Strep Chain, Thrush Spore, Amylase Droplet, Tartar Crust.'); p('');
p('## Achievement DNA'); p('');
p('The hardest achievements (Chemical Warfare: ten different reactions in a run; Breaking Bad: 1,000 reactions in a run; Flawless Specimen: a boss killed without taking a hit) pay out a box where every card is Mythical or Immaculate.'); p('');
p('## Wave mode (The Petri Dish)'); p('');
p(`The default mode. ${D.CAMP.waves} waves. It starts easy: each ordinary wave brings in ${D.CAMP.newPerWave} enemy types you have not met yet this run, on top of the ones you have. Waves 1 to ${D.CAMP.fixedWaves} bring them in a fixed order; after that they are drawn at random from the next ${D.CAMP.drawFrom} you have not had (so nothing big comes early). What a wave holds is a surprise until it lands. Every ${D.CAMP.bossEvery}th wave is a boss wave instead: the boss and its entourage, which keeps arriving on cue with its moves and at each enrage. Beat the boss and the wave is beaten. Wave ${D.CAMP.bossEvery} is always the Pepsinator or the Eye; Chad Prime and the Fever only come at wave 15 or 20. Beat wave ${D.CAMP.waves} and you win (it counts as a birth). Winning once unlocks Endless.`); p('');
p('Your first wave run (and the first after Settings > Tutorial > reset) opens with **wave 0, Pre-pre-pre-pre-school**: ten slow cells, a junk DNA carrier to practise on and a box of upgrades at the end. Tutorial cards explain sprinting (after your first sprint), Feats (before your first upgrade), Lateral Gene Transfer (your first junk DNA), the egg (the first time you swim up to it; until then no arrow points to it), stains (your first grant) and each damage type and reactions (the first time you use them), at least 25 seconds apart. Every card has a skip tutorial link, which also ends wave 0 where it stands.'); p('');
p('From wave 15 the boss can be **the Failed Experiment**: a copy of one of your own past runs (a lost one if you have any), alone in the dish, with an attack for each weapon that run carried and health that grows with the level it reached.'); p('');
p('| Boss | Drop name | Entourage | Arrives | Cued by |'); p('|---|---|---|---|---|');
for (const [id, E] of Object.entries(D.ENTOURAGE)) if (E.mix.length) p(`| ${(D.BOSSES.find(b => b.id === id) || {}).name || id} | ${D.DROP_NAMES[id] || ''} | ${[...new Set(E.mix)].map(m => (D.ENEMIES[m] || {}).name || m).join(', ')} | ${E.at} | ${E.on.join(', ')} |`);
p('');
p(`Boss waves: entourage warm-up (seconds) ${D.CAMP.lead.join(', ')}; boss health (times its base) ${D.CAMP.hp.join(', ')}; boss attack strength ${D.CAMP.hit.join(', ')}.`); p('');
p('## Boss rewards'); p('');
p('Every boss pays twice: a relic (its own three, plus one smuggled relic from a boss you will not meet this run), then a SPOILS box. It also heals you 40%. Spoils are three of these (usually including a full-power Switched at Birth on one of your weapons):'); p('');
p('| Spoils | Effect |'); p('|---|---|');
for (const f of Object.values(D.SPOILS)) { const o = f(); p(`| **${o.title}** | ${esc(o.desc)} |`); }
p('');
p('## Sperm samples'); p('');
p('| Sample | Name | Status | Description |'); p('|---|---|---|---|');
for (const s of D.SAMPLES) p(`| ${s.no} | **${s.name}** | ${!s.open ? 'Coming soon' : s.lockText ? 'Locked: ' + s.lockText : 'Playable'} | ${esc(s.desc)} |`);
p('');
p('## Hidden rules'); p('');
p('Rules the cards do not spell out, but that change what is worth picking.'); p('');
[
  ['Boss damage cap', 'No single hit takes more than 4% of a boss\'s max HP, or 6% of a Final Five rival\'s. Percentage effects (Act of God, Hand of God, Gender Reveal, Nit Comb) are capped the same way.'],
  ['Boss hits on you', 'A single hit from a boss is capped at 15% of your max HP plus a fixed part (about 8 HP at the start, growing with the clock), so more max HP means more hits to go down.'],
  ['Your armour', 'Each point blocks about 1 damage at the start of a run and about 7 by minute 10 (it scales with the enemy damage clock). It never blocks more than 75% of a hit.'],
  ['Enemy armour', 'Flat, but it grows a little with the enemy health clock (about x2.8 by minute 9, x3 at most). At least 15% of every hit gets through. Damage over time ignores armour; shred removes it.'],
  ['Regeneration and lifesteal', 'Regeneration and the lifesteal pool (about 3 HP/s, 9 with Transfusion) both grow with your max HP.'],
  ['Dodge', 'Capped at 75% when rolled. Cards that clamp their own bonus never lower dodge you already have.'],
  ['Crit overflow', 'Crit chance above 100% is added to crit damage one for one.'],
  ['Extra projectiles', 'Shots share damage: k times the projectiles deal (1 + (k^0.6 - 1)/2) in total, about +25% for one extra on a one-shot weapon.'],
  ['Level curve', 'The game expects Lv 60 at 9:00. Each level you are ahead adds 5% enemy health and 3% enemy damage. Three or more levels behind, BEHIND PACE shows on the HUD.'],
  ['Fever Pitch', `From 10:00 (difficulty minute ${15}) enemy health and damage compound every minute. Every win so far has finished in its first 2 minutes (10:15 to 11:35), so it is the final sprint, not a wall: the longer you stay in it, the harder every minute gets.`],
  ['Mythical and Immaculate', 'A separate roll on every card, three a run at most.'],
  ['Weapon tuning', 'Tuning cards only offer weapons the stat actually helps (no pierce for weapons that already pierce everything, no magazine for one-shot weapons).'],
].forEach(([a, b]) => p(`- **${a}:** ${b}`));
p('');
p('## Glossary'); p('');
[
  ['Rewind and Chrono energy', `Rewind fires by itself on a lethal hit, rolls you back about ${D.CHRONO.window}s and leaves a Paradox Echo that replays your path firing copies of your weapons. You start with ${D.CHRONO.startCharges} charge (max ${D.CHRONO.maxCharges}, more with Snooze Button). Charges refill from Chrono energy (${D.CHRONO.energyPerCharge} per charge, 15% more for every Rewind already used this run), earned by fighting.`],
  ['Funding and grants', 'Every sample is an experiment, and the lab is watching. Kills, combos, bosses and achievements raise its funding; funding milestones bring research grants (a heal, Oxytocin, a stair gate, a magnet, a Nit Comb or a DNA strand). In the campaign the same meter is your devotion to the egg, and the gifts are signs from it.'],
  ['The egg', 'Opens at Lv 60: its membrane has 150,000 base HP and 8 armour, and a rival can break in first. The sperm count falls over the run; at 6 the Final Five (you and the five strongest swimmers) fight it out.'],
  ['Feat slots', 'Two. Feats cast themselves on cooldown.'],
  ['Damage-type set', 'Two weapons or Feats of the same damage type turn on its set bonus.'],
  ['Weapon mounts', `Three (Lv 1 and drafts at ${D.SLOT_LEVELS.join(' and ')}), plus up to ${D.COMBO_MOUNTS} bonus mounts from combos.`],
  ['Player base stats', '120 HP, 150 swim speed, 5% crit, x1.6 crit damage, 105 pickup radius, 0 armour, 0 dodge. You grow with max HP.'],
].forEach(([a, b]) => p(`- **${a}:** ${b}`));
p('');
p('## Secret Field Guide entries (spoilers)'); p('');
p(`**Spoiler warning.** ${Object.keys(D.QUIRKS).length} hidden interactions. In the game each one stays ??? in the Field Guide until it happens to you for the first time; each line below says what sets it off.`); p('');
p('| Secret | How it happens |'); p('|---|---|');
for (const q of Object.values(D.QUIRKS)) p(`| **${esc(q.name)}** | ${esc(q.desc)} |`);
p('');
// Contents: every ## and ### heading after the contents itself, so nothing new is ever left out.
const slug = h => h.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-');
const toc = []; let n2 = 0, sec = '';
for (const l of L.slice(L.indexOf('%%TOC%%') + 1)) {
  if (l.startsWith('## ')) { sec = l.slice(3); toc.push(`${++n2}. [${sec}](#${slug(sec)})`); }
  else if (l.startsWith('### ') && !['Weapons', 'Bosses and relics'].includes(sec)) toc.push(`   - [${l.slice(4)}](#${slug(l.slice(4))})`);
}
L.splice(L.indexOf('%%TOC%%'), 1, ...toc);
fs.writeFileSync(require('path').resolve(__dirname, '../../GAME_GUIDE.md'), L.join('\n'));
console.log(L.length, 'lines', W.length, 'weapons');
