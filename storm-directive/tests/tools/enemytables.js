// Regenerates ENEMY_STATS.md and ENEMY_BEHAVIOUR.md from the live v10 game (not from data.js).
// Run from storm-directive/: NODE_PATH=/opt/node22/lib/node_modules node tests/tools/enemytables.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.resolve(__dirname, '../..');

(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  await page.goto('file://' + path.resolve(__dirname, '../../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; if (typeof splashEnd === 'function') splashEnd(); });
  await page.waitForTimeout(800);
  await page.evaluate(() => UI.quickStart()); await page.waitForTimeout(1200);
  const D = await page.evaluate(() => {
    const realPT = window.PT, clock = { start: 0, mid: 450 };
    const scaled = def => {
      const o = {};
      for (const k in clock) { window.PT = () => clock[k]; const e = makeEnemy(def, 0, 0); o[k] = { hp: e.hp, dmg: e.dmg, speed: e.speed }; }
      window.PT = realPT; return o;
    };
    const enemies = Object.entries(ENEMIES).map(([k, d]) => ({
      k, name: d.name, hp: d.hp, speed: d.speed, dmg: d.dmg, xp: d.xp, from: d.from, w: d.w, ai: d.ai, r: d.r, max: d.max || null,
      group: d.group || null, split: d.split || null, splitN: d.splitN || null, cap: d.cap || null, shoot: d.shoot || null, sc: scaled(d),
      kept: !!d.nfKept, spongy: !!d.spongy, heavy: !!d.heavy, tun: !!d.tun,
      ro: typeof ROSTER !== 'undefined' && ROSTER[k] ? { role: ROSTER[k].role, def: ROSTER[k].def, dmgType: ROSTER[k].dmgType, atk: ROSTER[k].atk, status: ROSTER[k].status, notes: ROSTER[k].notes } : null,
    }));
    const cut = Object.entries(ROSTER).filter(([k, r]) => r.cut && !ENEMIES[k]).map(([k, r]) => ({ k, name: r.name, hp: r.hp, dmg: r.dmg, notes: r.notes }));
    const bosses = BOSSES.map(B => {
      const R = ROSTER_BOSSES.find(r => r.id === B.id) || {};
      return { id: B.id, name: B.name, tier: B.tier, hp: B.hp, speed: B.speed, dmg: B.dmg, xp: B.xp, r: B.r, patterns: B.patterns, def: R.def || null, dmgType: R.dmgType || null,
        atk: R.atk || [], notes: R.notes || '', strengths: B.strengths, weaknesses: B.weaknesses };
    });
    return { enemies, cut, bosses, diff: V10_DIFF, camp: { hp: CAMP.hp, hit: CAMP.hit, waveSec: CAMP.waveSec }, enemyDef: { miss: 0 } };
  });
  await b.close();

  const f1 = n => (Math.round(n * 10) / 10).toString(), f0 = n => Math.round(n).toString();
  const IFR = 0.7;
  const defText = d => !d ? 'none' : d.kind === 'shell' ? `Shell x${d.layers} (-${d.perLayer}/hit)` : d.kind === 'membrane' ? `Membrane (${d.pct * 100}% pool)` : d.kind === 'squishy' ? `Squishy (-${d.bluntCut * 100}% Force)` : d.kind === 'thorns' ? `Thorns (${d.flat} + ${d.pct * 100}%)` : d.kind === 'evasion' ? `Evasion (${d.miss * 100}% miss)` : d.kind;
  // Effective HP against ordinary hits: membrane adds its pool, shell adds its layers' own health, evasion divides by the hit chance,
  // squishy divides by the blunt cut (Force only). Thorns changes nothing about HP.
  const eMul = d => !d ? 1 : d.kind === 'membrane' ? 1 + d.pct : d.kind === 'shell' ? 1 + d.layers * d.layerHpPct : d.kind === 'evasion' ? 1 / (1 - d.miss) : d.kind === 'squishy' ? 1 / (1 - d.bluntCut) : 1;
  const shotDps = e => { const s = e.shoot; if (!s) return 0; return (s.count || 1) * s.dmg * D.diff.bullet / (s.cd * D.diff.fireGap); };
  const rows = D.enemies.map(e => {
    const hp = e.sc.start.hp, ehp = hp * eMul(e.ro && e.ro.def), contact = e.sc.start.dmg / IFR, shot = shotDps(e);
    return { ...e, hp0: hp, hp5: e.sc.mid.hp, ehp, contact, shot, danger: contact + shot };
  }).sort((a, b) => a.ehp - b.ehp || a.k.localeCompare(b.k));

  const spawn = e => e.from >= 99999 ? (e.kept ? 'events and bosses only' : 'spawned only') : String(e.from);
  let s = `# Enemy stats (v10, generated)

Generated from the live game by \`tests/tools/enemytables.js\` (it loads the game, reads \`ENEMIES\`, \`ROSTER\`, \`BOSSES\` and \`V10_DIFF\`, and builds each enemy with the real \`makeEnemy\`). Re-run it after balance changes. Behaviour, attack types and notes are in \`ENEMY_BEHAVIOUR.md\`.

v10 replaced armour with five defences (Squishy, Membrane, Shell, Thorns, Evasion; rules in \`redesign docs/COMBAT_MATRIX.md\`). Every enemy's armour is 0 in the live game, so there is no armour column. Rows are ranked by effective HP at the start of a run, weakest first.

## How the numbers work

- **Base HP** is the roster value. **HP at start** and **HP at 5 min** are what \`makeEnemy\` produces at run clock 0 and 450 (5 real minutes at pace 1.5), including the v10 enemy HP knob (x${D.diff.hp}) and the run's HP curve. Wave mode and the campaign use their own clocks, so treat these as a guide.
- **Effective HP** (at start) adjusts HP for the defence against ordinary non-Force-specific hits: Membrane adds its pool (+50%), Shell adds its layers' own health (+15% per layer, and each hit also loses ${D.enemies.find(e => e.ro && e.ro.def && e.ro.def.kind === 'shell') ? D.enemies.find(e => e.ro && e.ro.def && e.ro.def.kind === 'shell').ro.def.perLayer : 3} damage per layer, not counted here), Evasion divides by the hit chance, Squishy divides by the blunt cut (Force only). Thorns does not change HP. It is an estimate: the matrix says numbers are still for playtesting.
- **Contact dmg** is what one touch does at the start of a run (includes the x${D.diff.dmg} v10 damage knob). **Contact dmg/s** = contact dmg / ${IFR} (you get ${IFR}s of invulnerability after a hit): the most a touching enemy can deal per second.
- **Shot dmg/s** counts only enemies with a legacy \`shoot\` table: bullets per volley x bullet dmg x ${D.diff.bullet} (v10 bullet knob) / (cooldown x ${D.diff.fireGap} fire gap), assuming every bullet lands. Newer attack types (Burst, Beam, Pool) have no cadence in the data and are not counted; see \`ENEMY_BEHAVIOUR.md\`.
- **Danger/s** = contact dmg/s + shot dmg/s. A ceiling, not an observed figure.

## Regular enemies

| # | Enemy | Base HP | HP at start | HP at 5 min | Defence | Effective HP | Speed | Contact dmg | Contact dmg/s | Shot dmg/s | Danger/s | XP | From |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
`;
  rows.forEach((e, i) => { s += `| ${i + 1} | ${e.name} | ${f0(e.hp)} | ${f1(e.hp0)} | ${f1(e.hp5)} | ${defText(e.ro && e.ro.def)} | ${f1(e.ehp)} | ${f0(e.speed)} | ${f1(e.sc.start.dmg)} | ${f1(e.contact)} | ${e.shot ? f1(e.shot) : '-'} | ${f1(e.danger)} | ${e.xp} | ${spawn(e)} |\n`; });

  // Bosses: in wave mode (campaign.js campBoss) HP = base x CAMP.hp[slot] x (1 + PT/600) x bossHp; slot = wave/5 - 1; a tier sets which waves it can appear.
  const WAVES = { 1: [5], 2: [10, 15], 3: [20] };
  const bossHp = (B, wave) => { const slot = wave / 5 - 1, pt = D.camp.waveSec * (wave - 1); return B.hp * D.camp.hp[slot] * (1 + pt / 600) * D.diff.bossHp; };
  const bosses = D.bosses.map(B => ({ ...B, wh: WAVES[B.tier].map(w => bossHp(B, w)), ehpK: eMul(B.def), contact: B.dmg * D.diff.dmg / IFR })).sort((a, b) => a.wh[0] * a.ehpK - b.wh[0] * b.ehpK);
  s += `
## Bosses

Boss HP in wave mode is base HP x ${D.camp.hp.join(' / ')} (for the boss on waves 5 / 10 / 15 / 20) x (1 + run clock / 600) x ${D.diff.bossHp} (v10 boss HP knob). Tier 1 bosses only appear on wave 5, tier 2 on waves 10 and 15, tier 3 on wave 20. The run clock is estimated as ${D.camp.waveSec}s per wave, ignoring the early-wave bonus. Boss damage also gets a per-boss-wave softener (\`CAMP.hit\` = ${D.camp.hit.join(' / ')}) that is not applied below. Race and level modes use different formulas. Contact dmg/s uses base damage x ${D.diff.dmg}; boss attacks come from named patterns with no per-bullet numbers in the data, so there is no shot column.

| # | Boss | Tier | Base HP | HP in wave mode (wave: HP) | Defence | Damage type | Speed | Contact dmg/s | XP |
|---|---|---|---|---|---|---|---|---|---|
`;
  bosses.forEach((B, i) => { s += `| ${i + 1} | **${B.name.replace(/^THE /, 'The ').replace(/\b([A-Z])([A-Z]+)\b/g, (m, a, r) => a + r.toLowerCase())}** | ${B.tier} | ${B.hp} | ${WAVES[B.tier].map((w, j) => `${w}: ${f0(B.wh[j])}`).join('; ')} | ${defText(B.def)} | ${Array.isArray(B.dmgType) ? B.dmgType.join(' + ') : B.dmgType} | ${B.speed} | ${f1(B.contact)} | ${B.xp} |\n`; });
  fs.writeFileSync(path.join(OUT, 'ENEMY_STATS.md'), s);

  // ---------------------------------------------------------------- behaviour
  const atkText = a => a.map(x => `${x.type}${x.mode ? ' ' + x.mode : ''} (${x.dmg != null ? x.dmg + ' dmg' : ''}${x.tele ? (x.dmg != null ? ', ' : '') + x.tele + 's tell' : ''})`.replace(' ()', '')).join('; ');
  const shootText = sh => !sh ? '-' : `${sh.pattern}${sh.count ? ' x' + sh.count : ''}, ${sh.dmg} dmg, speed ${sh.speed}, every ${sh.cd}s`;
  const pack = e => [e.group ? 'pack of ' + e.group : '', e.split ? `splits into ${e.split}${e.splitN ? ' x' + e.splitN : ''}` : '', e.cap ? 'cap ' + e.cap : ''].filter(Boolean).join('; ') || '-';
  const flags = e => [e.spongy ? 'spongy' : '', e.heavy ? 'heavy' : '', e.tun ? 'tunnels' : '', e.kept ? 'cut from random spawns' : '', e.max ? 'grows to ' + e.max : ''].filter(Boolean).join(', ') || '-';
  let t = `# Enemy behaviour (v10, generated)

Generated from the live game by \`tests/tools/enemytables.js\`. Same enemy order as \`ENEMY_STATS.md\`. Roles, defences, damage types and attack types come from \`web/js/roster.js\` (the v10 roster, applied by \`newfoes.js\`). Damage types use the canonical names (force, acid, static, mucus, blood, soul, fire). Attack types are Contact, Proj(ectile), Spread, Burst, Beam and Pool (\`redesign docs/ATTACK_TYPES.md\`). "AI" is the engine behaviour id. "Legacy projectile" is the older \`shoot\` table that still drives shooters. "Weight" is spawn weight.

Regular enemies have no per-type weaknesses in v10: counterplay is the defence (see \`redesign docs/DEFENCE_TYPES.md\`).

## Regular enemies

| # | Enemy | Roles | Defence | Damage type | Attack types | Legacy projectile | AI | Radius | Weight | Pack, splits, cap | Flags | Roster status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
`;
  rows.forEach((e, i) => { const r = e.ro || {}; t += `| ${i + 1} | ${e.name} | ${(r.role || []).join(', ') || '-'} | ${defText(r.def)} | ${Array.isArray(r.dmgType) ? r.dmgType.join(' + ') : r.dmgType || '-'} | ${r.atk ? atkText(r.atk) : '-'} | ${shootText(e.shoot)} | ${e.ai} | ${e.r} | ${e.w} | ${pack(e)} | ${flags(e)} | ${r.status || '-'} |\n`; });

  t += `\n## Bosses\n\nPer-boss defence and damage type come from \`ROSTER_BOSSES\`. The old hard counters (+60% to one damage type, immunities, Force passing through) are off in v10 (\`boss10.js\`); what is left is the defence plus each boss's own mechanic.\n\n| # | Boss | Defence | Damage type | Patterns | Attack types | Strengths | Weaknesses |\n|---|---|---|---|---|---|---|---|\n`;
  bosses.forEach((B, i) => { t += `| ${i + 1} | **${B.name}** | ${defText(B.def)} | ${Array.isArray(B.dmgType) ? B.dmgType.join(' + ') : B.dmgType} | ${B.patterns.join(', ')} | ${atkText(B.atk)} | ${(B.strengths || []).join('; ')} | ${(B.weaknesses || []).join('; ')} |\n`; });

  t += `\n## Cut from the roster\n\nMarked \`cut\` in \`roster.js\` and removed from \`ENEMIES\` (not in the live game):\n\n`;
  D.cut.forEach(c => { t += `- **${c.name}** (HP ${c.hp}, dmg ${c.dmg}): ${c.notes || ''}\n`; });
  t += `\nEnemies cut from random spawns but still spawned by id (events and bosses): ${rows.filter(e => e.kept).map(e => e.name).join(', ') || 'none'}.\n`;

  t += `\n## Design notes per enemy (from roster.js)\n\n`;
  rows.forEach(e => { if (e.ro && e.ro.notes) t += `- **${e.name}**: ${e.ro.notes}\n`; });
  fs.writeFileSync(path.join(OUT, 'ENEMY_BEHAVIOUR.md'), t);
  console.log('enemies', rows.length, 'bosses', bosses.length, 'cut', D.cut.length);
})();
