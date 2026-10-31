// Loadout Planner draft generator: turns saved idea rows into ONE draft feature file in the repo's hook-file style.
//
//   node tests/tools/planner/draft.js <ideas.json> [--sample baseline] [--out web/js/<name>.js] [--copy copy.json] [--start N] [--no-verify]
//   (run from storm-directive/; NODE_PATH=/opt/node22/lib/node_modules is set by tests/run.sh, set it yourself otherwise)
//
// Input: a JSON array of idea rows as the planner's "Save to ideas.md" writes them to the artifact database collection "ideas":
//   { type, name, text, under, sample, planSample, f, kind: 'block'|'edit', orig: { name, text } | null, status, planVersion }.
//   f holds the Type's fields (template.html FLD: damage type, attack type, base stats and so on). Rows saved before f was stored
//   carry the same values as a trailing "Fields: Label: value; ..." line in text: that is read too. Rows come from the database
//   (ArtifactData list) or from a pasted array.
// Output (stdout): a Markdown table in the ideas.md format, Status "briefed", ready to paste under a dated batch heading.
//   Everything else goes to stderr. The draft file is written to --out (default web/js/draft_<sample>.js).
// What the file holds: one card per row, filled from f and text. Names and user text are kept exactly as typed.
//   - Weapon (new)        a clone of the same damage type and attack type weapon (podcast.js pattern): W24, W24_BY, W24_DESC,
//                         MATRIX_ONLY.weapons. Blank numbers default to the median of existing weapons of that attack type.
//   - Weapon (edit)       override of the existing weapon (baseline3.js rename pattern): name, text, base stats.
//   - Lv 3 / 6 / 9        wupReg (new weapon) or wupRegFor(sample, ...) merged into the weapon's current set (A, B, C and lv10).
//   - Modifier (+ forks)  MODS10, MM_GROUP, MODUP, MATRIX_ONLY.mods, MSB and SLICE_MODS text when forks are in the batch.
//   - Feat (+ forks)      feat({...}) (feats10.js), blanks default to the median of existing Feats of that attack type.
//   - Sperm passive       mutCard({...}) (mutations.js). Edits of Feats, modifiers and passives override the live entry.
//   - Everything else (Sample branch, Switched at Birth, Passive mastery, Gate, Sample, Enemy, Other, edits of branch cards) is
//     written as a clearly marked "DRAFT: apply by hand" block, never silently dropped.
//   Effects are never invented: every card's apply / fire / on is an empty stub (flag('key') where a branch card is taken) with
//   "// DRAFT: effect not built". A human decides every "// DRAFT:" line. Where the user's text is a note rather than card copy
//   the text is kept and marked "// DRAFT copy"; --copy copy.json ({ "Type:Name": "card line in the game's voice" }, or a `copy`
//   field on the row) replaces it with a written line, still marked DRAFT copy so the user reads it through.
// Verify (on unless --no-verify): node --check, then web/index.html + the draft in headless Chromium: no page errors, every new
//   card is in its game table after splashEnd() (WEAPONS / W24_BY / F10 / MODS10 / MUT_REG / the weapon's branch set), and
//   makeSlot / f10Give work on the new weapon and Feat.
// Add the file to web/index.html after cardrulesengine.js (the last script; it needs mutations, feats10, samplebranches, modmatrix).
const { chromium } = require(process.env.NODE_PATH ? 'playwright' : '/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs'), cp = require('child_process');

// ---------------------------------------------------------------- the planner's field definitions (template.html FLD), as [key, label, kind, unit]
const N = (k, l, u) => [k, l, 'num', u || ''], S_ = (k, l) => [k, l, 'sel', ''];
const FLD = {
  'Weapon': [S_('dt', 'Damage type'), S_('at', 'Attack type'), N('dmg', 'Damage'), N('rof', 'Rate of fire', '/s'), N('mag', 'Magazine size'), N('rel', 'Reload', 's'), N('rng', 'Range'), N('crit', 'Crit chance', '%'), N('critb', 'Crit bonus', '%')],
  'Lv 3 branch': [S_('w', 'Weapon'), S_('costs', 'Costs (the trade-off)'), S_('shows', 'What it looks like')],
  'Lv 6 branch': [S_('w', 'Weapon'), S_('par', 'Lv 3 branch it follows'), S_('wild', 'Wild card? (yes or no)')],
  'Lv 9 mastery': [S_('w', 'Weapon'), S_('best', 'Best with branch (A, B, C)')],
  'Modifier': [S_('grp', 'Group'), S_('at', 'Fits attack type'), S_('r1', 'Rank 1'), S_('r2', 'Rank 2'), S_('r3', 'Rank 3')],
  'Modifier fork': [S_('mod', 'Modifier'), S_('fk', 'Fork'), S_('r2', 'At rank 2')],
  'Modifier mastery': [S_('mod', 'Modifier'), S_('fk', 'Fork it follows'), S_('r3', 'At rank 3')],
  'Switched at Birth': [S_('dt', 'Damage type it switches to')],
  'Feat': [S_('dt', 'Damage type'), S_('at', 'Attack type'), N('stam', 'Stamina cost'), N('cd', 'Cooldown', 's'), N('dur', 'Duration', 's'), N('rng', 'Range'), N('dmg', 'Damage'), S_('trig', 'Triggered')],
  'Feat fork': [S_('feat', 'Feat'), S_('lv', 'Level')],
  'Sperm passive': [S_('fam', 'Family'), N('max', 'Max rank'), S_('rar', 'Rarity')],
  'Passive mastery': [S_('pass', 'Passive'), S_('fk', 'Mastery')],
  'Gate': [S_('by', 'Unlocked by (the branch)'), S_('card', 'The card it unlocks'), S_('samp', 'Only in sample')],
  'Sample': [S_('dt1', 'Damage type 1'), S_('dt2', 'Damage type 2'), S_('pas', 'Passive'), S_('feat', 'Unique Feat'), S_('origin', 'Origin')],
  'Sample branch': [S_('samp', 'Sample'), S_('lv', 'Run level'), S_('costs', 'Costs (the trade-off)')],
  'Enemy': [N('hp', 'Health'), N('spd', 'Speed'), N('dmg', 'Contact damage'), S_('role', 'Role'), S_('dt', 'Damage type')],
};
const ATK = { projectile: 'proj', proj: 'proj', spread: 'spread', contact: 'contact', burst: 'burst', beam: 'beam', pool: 'pool', trail: 'trail' };
const ATK_NAME = { proj: 'Projectile', spread: 'Spread', contact: 'Contact', burst: 'Burst', beam: 'Beam', pool: 'Pool', trail: 'Trail' };
const F10_OF = { phys: 'force', fire: 'acid', shock: 'static', ice: 'mucus', arcane: 'blood', soul: 'soul', flame: 'fire' };
const FAMILY = { body: 'mut:body', 'trade-off': 'mut:trade', rare: 'mut:rare', rules: 'mut:rules', defence: 'mut:def', fire: 'mut:fire' };
const RARITY = ['common', 'uncommon', 'rare', 'epic', 'mythical'];

// ---------------------------------------------------------------- small helpers
const q = s => "'" + String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'";
const eqn = (a, b) => String(a == null ? '' : a).trim().toLowerCase() === String(b == null ? '' : b).trim().toLowerCase();
const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'card';
const initials = n => { const all = String(n).split(/[^A-Za-z0-9]+/).filter(Boolean), cap = all.filter(x => /^[A-Z0-9]/.test(x)), w = cap.length > 1 ? cap : all; return (w.length > 1 ? w.map(x => x[0]).join('') : (w[0] || 'X')).slice(0, 2).toUpperCase(); };
const med = a => { a = a.filter(x => x > 0).sort((x, y) => x - y); return a.length ? a[Math.floor((a.length - 1) / 2)] : ''; }; // (planner.js / template.html fldMed)
const r2 = x => Math.round(x * 100) / 100;
const pathOf = u => String(u || '').split('>').map(s => s.trim()).filter(s => s && !/^\(on the sperm\)$/i.test(s) && !/^the sperm$/i.test(s));
const isNote = t => { t = String(t || '').trim(); if (!t) return true; if (/^\(.*\)$/.test(t) || /no text yet|same text as|not sure|\bTODO\b|\?\s*$/i.test(t) || / \/ /.test(t)) return true; return !(/[.!"')]$/.test(t) && /^[A-Z0-9"']/.test(t) && t.length >= 20 && t.length <= 240); };

function normRow(r, i) {
  let text = String(r.text || ''), f = Object.assign({}, r.f || {});
  const type = String(r.type || 'Other').replace(/\s*\(edit of .*\)\s*$/i, '').trim();
  const m = text.match(/\n\nFields: ([^]*)$/);
  if (m) {
    text = text.slice(0, m.index);
    for (const part of m[1].split(/;\s+(?=[A-Z])/)) { const j = part.indexOf(': '); if (j < 0) continue; const lab = part.slice(0, j), d = (FLD[type] || []).find(x => x[1] === lab); if (!d) continue; let v = part.slice(j + 2).trim(); if (d[2] === 'num') v = parseFloat(v); if (f[d[0]] == null || f[d[0]] === '') f[d[0]] = v; }
  }
  for (const k of Object.keys(f)) if (f[k] === '' || f[k] == null || (typeof f[k] === 'number' && isNaN(f[k]))) delete f[k];
  return { i: i + 1, type, name: String(r.name || 'Untitled'), text: text.trim(), under: String(r.under || ''), path: pathOf(r.under), f, edit: r.kind === 'edit' || /\(edit of /i.test(r.type || ''), orig: r.orig || null, copy: r.copy || '', planSample: r.planSample || '', sampleName: r.sample || '', raw: r };
}

// ---------------------------------------------------------------- args
const args = process.argv.slice(2), opt = {}, pos = [];
for (let i = 0; i < args.length; i++) { const a = args[i]; if (a === '--no-verify') opt.noVerify = 1; else if (/^--(sample|out|copy|start)$/.test(a)) opt[a.slice(2)] = args[++i]; else pos.push(a); }
if (!pos[0]) { console.error('usage: node tests/tools/planner/draft.js <ideas.json> [--sample baseline] [--out web/js/<name>.js] [--copy copy.json] [--start N] [--no-verify]'); process.exit(2); }
const ROOT = path.resolve(__dirname, '../../..'); // storm-directive/

(async () => {
  const rowsIn = JSON.parse(fs.readFileSync(path.resolve(pos[0]), 'utf8'));
  if (!Array.isArray(rowsIn)) throw new Error('the input must be a JSON array of idea rows');
  const copyMap = opt.copy ? JSON.parse(fs.readFileSync(path.resolve(opt.copy), 'utf8')) : {};
  const rows = rowsIn.map(normRow);
  for (const r of rows) if (!r.copy && copyMap[r.type + ':' + r.name]) r.copy = copyMap[r.type + ':' + r.name];

  // ------------------------------------------------------------ the game's own tables (the planner's data, read live)
  const browser = await chromium.launch(); const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.addInitScript(() => { window.TUT_OFF = 1; });
  await page.goto('file://' + path.join(ROOT, 'web/index.html')); await page.waitForTimeout(800);
  await page.evaluate(() => { try { splashEnd(); } catch (e) { } });
  const sampleVotes = {}; for (const r of rows) if (r.planSample) sampleVotes[r.planSample] = (sampleVotes[r.planSample] || 0) + 1;
  const sampleId = opt.sample || Object.keys(sampleVotes).sort((a, b) => sampleVotes[b] - sampleVotes[a])[0] || 'baseline';
  const CAT = await page.evaluate(sid => {
    try { if (!G) newGame('s002'); } catch (e) { }
    const fix = s => String(s == null ? '' : s), R = x => Math.round(x * 100) / 100;
    const pcrit = (typeof G !== 'undefined' && G && G.P && G.P.crit) || 0.05;
    const types = {}; for (const k of Object.keys(ELEMENTS)) types[k] = fix(ELEMENTS[k].name);
    const weapons = {};
    for (const id of MATRIX_ONLY.weapons) {
      const def = WEAPONS[id], row = W24_BY[id]; if (!def || !row) continue;
      let q = null; try { q = makeSlot(id).s; } catch (e) { }
      const b = def.base || {}, s = q || b;
      const spec = (typeof wupSpecFor === 'function' ? wupSpecFor(id, sid) : WUP[id]) || {};
      weapons[id] = { id, name: row.name, type: row.type, atk: row.atk, desc: fix(W24_DESC[id] || def.desc),
        stats: { dmg: R(s.dmg || 0), rof: s.cd ? R(1 / s.cd) : 0, mag: s.mag || 0, rel: R(s.reload || 0), rng: s.range || 0, crit: Math.round((s.crit != null ? s.crit : pcrit) * 100) },
        letters: ['A', 'B', 'C'].filter(k => spec[k]), promises: ['A', 'B', 'C'].filter(k => spec[k]).map(k => ({ k, name: fix(spec[k].name), lv6: (spec[k].lv6 || []).map(c => fix(c.name)).concat(spec[k].wild ? [fix(spec[k].wild.name)] : []) })),
        masteries: (spec.lv10 || []).map(c => fix(c.name)) };
    }
    const allW = Object.keys(WEAPONS);
    const mods = {}; for (const id of Object.keys(MODS10)) mods[id] = { id, name: fix(MODS10[id].name), desc: fix(MODS10[id].desc), group: mmGroup(id), atk: MODS10[id].atk };
    const feats = {}; for (const id of Object.keys(F10)) { const f = F10[id]; feats[id] = { id, name: fix(f.name), type: f.type || '', atk: f.atk || '', stam: f.stam || 0, base: f.base || {}, does: fix(f.does), sample: f.sample || '' }; }
    const passives = MUT_REG.filter(m => m.slot === 'genome' && m.kind === 'acquire').map(m => ({ id: m.id, name: fix(m.title), desc: fix(m.desc), flavour: fix(m.flavour), family: fix(m.family), rarity: m.rarity, maxRank: m.maxRank || 1 }));
    const samples = SAMPLES10.map(s => ({ id: s.id, name: fix(s.name) }));
    return { allW, types, weapons, mods, feats, passives, samples, gname: MM_GNAME, pcrit };
  }, sampleId);
  await browser.close();
  if (errs.length) console.error('page errors while reading the game:', errs.slice(0, 3));

  const typeId = n => { if (!n) return ''; const k = Object.keys(CAT.types).find(t => eqn(CAT.types[t], n) || eqn(t, n)); return k || ''; };
  const atkId = n => ATK[String(n || '').trim().toLowerCase()] || '';
  const groupId = n => Object.keys(CAT.gname).find(k => eqn(CAT.gname[k], n) || eqn(k, n)) || '';
  const sampleName = (CAT.samples.find(s => s.id === sampleId) || {}).name || sampleId;
  const wList = Object.values(CAT.weapons), fList = Object.values(CAT.feats), mList = Object.values(CAT.mods), pList = CAT.passives;
  const existing = (list, r) => list.find(x => eqn(x.name, r.edit && r.orig && r.orig.name ? r.orig.name : r.name)) || (r.edit ? null : list.find(x => eqn(x.name, r.name)));

  const used = new Set([...Object.keys(CAT.weapons), ...Object.keys(CAT.feats), ...Object.keys(CAT.mods), ...CAT.passives.map(p => p.id)]);
  const newId = (pre, name) => { let id = pre + slug(name), n = 2; const base = id; while (used.has(id)) id = base + '_' + n++; used.add(id); return id; };
  const out = [], hand = [], notes = [], LOG = { weaponEdits: [], weapons: [], renames: [], branches: [], feats: [], featEdits: [], mods: [], modEdits: [], passives: [], passiveEdits: [] };
  const say = s => notes.push(s);
  const when = r => 'row ' + r.i + ' (' + r.type + ': ' + r.name + ')';
  const handBlock = (r, why) => { hand.push('// DRAFT: apply by hand: ' + why + '\n//   ' + when(r) + ', under ' + (r.under || '(the sperm)') + '\n//   fields: ' + (Object.keys(r.f).map(k => k + '=' + r.f[k]).join('; ') || 'none') + '\n//   text: ' + (r.text || '(none)').replace(/\n/g, ' ')); say(when(r) + ': written as an apply-by-hand block (' + why + ')'); };
  // Card copy: the user's text when it reads as a card line, else a DRAFT copy marker (or the --copy line).
  const copyOf = (r, text, fallback) => {
    const t = r.copy || text || '';
    if (r.copy) return { s: q(r.copy), c: '// DRAFT copy: a line written in the game\'s voice for the user\'s note; read it through' };
    if (!t) return { s: q(fallback || 'DRAFT: write this card line'), c: '// DRAFT copy: no text was given' };
    return isNote(t) ? { s: q(t), c: '// DRAFT copy: the user\'s text is a note, not card copy; write the card line' } : { s: q(t), c: '' };
  };
  const cm = c => (c ? ' ' + c : '');

  // ------------------------------------------------------------ weapons
  const weaponRows = rows.filter(r => r.type === 'Weapon'), wCtx = {}; // lower-cased name (new or old) -> { id, row, isNew }
  for (const r of weaponRows) {
    const ex = existing(wList, r);
    if (ex) { wCtx[ex.name.toLowerCase()] = wCtx[r.name.toLowerCase()] = { id: ex.id, row: r, isNew: false, ex }; continue; }
    if (r.edit) { handBlock(r, 'edit of a weapon the game does not have'); continue; }
    const dt = typeId(r.f.dt), at = atkId(r.f.at);
    const id = newId('v_' + (dt || 'phys') + '_', r.name);
    wCtx[r.name.toLowerCase()] = { id, row: r, isNew: true, dt, at };
  }
  for (const r of weaponRows) {
    const c = wCtx[r.name.toLowerCase()]; if (!c || c.row !== r) continue;
    const L = [];
    if (c.isNew) {
      const dt = c.dt, atk0 = c.at; let atk = atk0;
      L.push('// ---- Weapon: ' + r.name + ' (row ' + r.i + ')');
      if (!dt) L.push('// DRAFT: damage type ' + (r.f.dt ? '"' + r.f.dt + '" is not one the game has' : 'was not set') + '; cloned from a Force weapon, so it deals Force until you decide');
      if (!atk) { L.push('// DRAFT: attack type ' + (r.f.at ? '"' + r.f.at + '"' : 'was not set') + (r.f.at && atkId(r.f.at) === 'trail' ? ' (Trail has no game attack type yet)' : '') + '; cloned from a Projectile weapon'); atk = atkId(r.f.at) === 'trail' ? 'pool' : 'proj'; }
      const baseId = ['v_' + (dt || 'phys') + '_' + atk, 'v_phys_' + atk].find(x => CAT.allW.includes(x)) || 'v_phys_proj', cloneDt = baseId.split('_')[1];
      const peers = wList.filter(w => w.atk === atk), star = k => med(peers.map(w => w.stats[k] || 0));
      const val = (k, label) => { if (r.f[k] != null) return r.f[k]; const m = star(k); L.push('// DRAFT: ' + label + ' not set; defaulted to the median of ' + (ATK_NAME[atk] || atk) + ' weapons (' + m + ')'); return m; };
      const st = { dmg: val('dmg', 'damage'), rof: val('rof', 'rate of fire'), mag: val('mag', 'magazine size'), rel: val('rel', 'reload'), rng: val('rng', 'range') };
      const crit = r.f.crit != null ? r.f.crit : star('crit');
      const cp = copyOf(r, r.text, 'DRAFT: write this card line');
      const base = Object.assign({}, st.dmg !== '' ? { dmg: st.dmg } : {}, st.rof ? { cd: r2(1 / st.rof) } : {}, st.mag !== '' ? { mag: st.mag } : {}, st.rel !== '' ? { reload: st.rel } : {}, st.rng !== '' ? { range: st.rng } : {});
      if (crit !== '' && crit != null) base.critBonus = r2(crit / 100 - CAT.pcrit);
      if (r.f.critb != null) L.push('// DRAFT: crit bonus ' + r.f.critb + '% is global in this game (COMBAT.critMult); not applied per weapon');
      L.push('(function () {');
      L.push('  const id = ' + q(c.id) + ', b = WEAPONS[' + q(baseId) + '];');
      L.push('  if (!b || WEAPONS[id]) return;');
      L.push('  const desc = ' + cp.s + ';' + cm(cp.c));
      L.push('  const d = Object.assign({}, b, { base: JSON.parse(JSON.stringify(b.base || {})), lv: JSON.parse(JSON.stringify(b.lv || {})), stars: (b.stars || []).slice(),');
      L.push('    name: ' + q(r.name) + ', desc, play: desc, icon: ' + q(initials(r.name)) + ', w24: 1, archived: 0 }); // DRAFT: icon letters and the weapon drawing (w24look.js) are the clone\'s');
      L.push('  Object.assign(d.base, ' + JSON.stringify(base) + ');');
      L.push('  WEAPONS[id] = d;');
      L.push('  W24.push([id, d.name, ' + q(cloneDt) + ', ' + q(atk) + ', null]); W24_IDS.push(id); // DRAFT: starter sample is null (never a start weapon); set one in W24 if wanted');
      L.push('  W24_BY[id] = { id, name: d.name, type: ' + q(cloneDt) + ', atk: ' + q(atk) + ', starter: null }; W24_DESC[id] = desc;');
      L.push("  if (typeof MATRIX_ONLY !== 'undefined') MATRIX_ONLY.weapons.push(id);");
      L.push('  // DRAFT: effect not built: a plain ' + (ATK_NAME[atk] || atk) + ' weapon until fire / hit hooks (hookOn(\'fire\', ...), see podcast.js) give it its own behaviour');
      L.push('})();');
      LOG.weapons.push({ id: c.id, name: r.name });
    } else {
      const ex = c.ex, changed = [], base = {};
      const set = (k, key, v) => { if (r.f[k] != null && r.f[k] !== ex.stats[k]) { base[key] = v; changed.push(k + ' ' + ex.stats[k] + ' to ' + r.f[k]); } };
      set('dmg', 'dmg', r.f.dmg); set('rof', 'cd', r.f.rof ? r2(1 / r.f.rof) : 0); set('mag', 'mag', r.f.mag); set('rel', 'reload', r.f.rel); set('rng', 'range', r.f.rng);
      if (r.f.crit != null && r.f.crit !== ex.stats.crit) { base.critBonus = r2(r.f.crit / 100 - CAT.pcrit); changed.push('crit ' + ex.stats.crit + ' to ' + r.f.crit); }
      const renamed = !eqn(r.name, ex.name) || r.name !== ex.name, textNew = r.text && r.text !== ex.desc;
      if ((r.f.dt && typeId(r.f.dt) && typeId(r.f.dt) !== ex.type) || (r.f.at && atkId(r.f.at) && atkId(r.f.at) !== ex.atk)) say(when(r) + ': a damage or attack type change on an existing weapon is not drafted (it changes the weapon\'s whole identity)');
      if (!changed.length && !renamed && !textNew) { say(when(r) + ': matches the existing card, nothing to draft'); continue; }
      L.push('// ---- Weapon edit: ' + ex.name + (renamed ? ' -> ' + r.name : '') + ' (row ' + r.i + (changed.length ? '; ' + changed.join(', ') : '') + ')');
      L.push('(function () {');
      L.push('  const id = ' + q(ex.id) + ', d = WEAPONS[id]; if (!d) return;');
      if (renamed || textNew) {
        const cp = copyOf(r, textNew ? r.text : ex.desc);
        L.push('  const name = ' + q(r.name) + ', desc = ' + (textNew || r.copy ? cp.s : q(ex.desc)) + ';' + (textNew || r.copy ? cm(cp.c) : ''));
        L.push('  d.name = name; d.desc = d.play = desc; W24_DESC[id] = desc; if (W24_BY[id]) W24_BY[id].name = name;');
        L.push("  const row = W24.find(x => x[0] === id); if (row) row[1] = name; // (the rename pattern of baseline3.js)");
        LOG.renames.push({ id: ex.id, name: r.name });
      }
      if (changed.length) L.push('  Object.assign(d.base, ' + JSON.stringify(base) + '); // DRAFT: check the wup*.js cards that scale these numbers (hgBase-style retunes) still read right');
      L.push('})();');
      if (changed.length) LOG.weaponEdits.push({ id: ex.id, base });
    }
    out.push(L.join('\n'));
  }

  // ------------------------------------------------------------ weapon branch sets (Lv 3, Lv 6, Lv 9)
  const ctxOf = name => wCtx[String(name || '').toLowerCase()] || (() => { const w = wList.find(x => eqn(x.name, name)); return w ? { id: w.id, isNew: false, ex: w } : null; })();
  const byW = {}; // weapon id -> { ctx, p: [{row, letter, l6:[], wild, best}], m: [] }
  const slot = c => byW[c.id] || (byW[c.id] = { c, p: [], m: [] });
  for (const r of rows.filter(r => r.type === 'Lv 3 branch')) {
    const c = ctxOf(r.f.w || r.path[0]); if (!c || r.edit) { handBlock(r, r.edit ? 'edit of an existing branch card' : 'the weapon "' + (r.f.w || r.path[0] || '?') + '" is not in the game or the batch'); continue; }
    slot(c).p.push({ row: r, l6: [], wild: null });
  }
  for (const r of rows.filter(r => r.type === 'Lv 6 branch')) {
    const c = ctxOf(r.f.w || r.path[0]); const parName = r.f.par || r.path[1];
    const P = c && !r.edit && byW[c.id] && byW[c.id].p.find(p => eqn(p.row.name, parName));
    if (!P) { handBlock(r, r.edit ? 'edit of an existing branch card' : 'its Lv 3 branch "' + (parName || '?') + '" is not in this batch (add to an existing branch by hand)'); continue; }
    const wild = /^y/i.test(r.f.wild || '');
    if (wild || P.l6.length >= 2) { if (P.wild) handBlock(r, 'a second wild card on one branch'); else { P.wild = r; if (!wild) say(when(r) + ': the third Lv 6 card on a branch became its wild card'); } } else P.l6.push(r);
  }
  for (const r of rows.filter(r => r.type === 'Lv 9 mastery')) {
    const c = ctxOf(r.f.w || r.path[0]); if (!c || r.edit) { handBlock(r, r.edit ? 'edit of an existing mastery card' : 'the weapon "' + (r.f.w || r.path[0] || '?') + '" is not in the game or the batch'); continue; }
    slot(c).m.push(r);
  }
  for (const W of Object.values(byW)) {
    const c = W.c, ex = c.ex, free = ['A', 'B', 'C'].filter(k => c.isNew || !ex.letters.includes(k));
    const L = ['// ---- Branches: ' + (ex ? ex.name : c.row.name) + ' (' + W.p.map(p => 'row ' + p.row.i).concat(W.m.map(m => 'row ' + m.i)).join(', ') + ')'];
    const entries = [], letterOf = {};
    W.p.forEach((P, i) => {
      let k = free[i];
      if (!k) { k = 'C'; L.push('// DRAFT: all three branch slots (A, B, C) are taken; "' + P.row.name + '" replaces ' + k + ' (decide which branch it should replace)'); }
      letterOf[P.row.name.toLowerCase()] = k;
      const r = P.row, cp = copyOf(r, r.text), flag = 'dr_' + slug(r.name), a = 'draftFlag(' + q(flag) + ')';
      const a_ = x => 'draftFlag(' + q('dr_' + slug(x.name)) + ')';
      const C_ = x => { const cc = copyOf(x, x.text); return 'draftC(' + q(x.name) + ', ' + cc.s + ', ' + a_(x) + ')' + (cc.c ? ' /*' + cc.c.replace(/^\/\/ /, '') + '*/' : ''); };
      const lines = [];
      lines.push('  ' + k + ': { name: ' + q(r.name) + ', tag: ' + q('') + ', costs: ' + q(r.f.costs || '') + ', shows: ' + q(r.f.shows || '') + ", modes: '',");
      if (!r.f.costs) lines.push('    // DRAFT: costs (the trade-off line) not set');
      lines.push('    // DRAFT: tag (the one-line pitch) not set');
      lines.push('    lv3: { desc: ' + cp.s + ', apply: ' + a + ' },' + cm(cp.c) + ' // DRAFT: effect not built');
      const l6 = P.l6.map(x => C_(x)); while (l6.length < 2) { l6.push("draftC('DRAFT: Lv 6 card', 'DRAFT: write this card')"); lines.push('    // DRAFT: the game needs two Lv 6 cards on a branch; a stub stands in for the missing one'); }
      lines.push('    lv6: [' + l6.join(', ') + '], // DRAFT: effects not built');
      lines.push('    wild: ' + (P.wild ? C_(P.wild) : "draftC('DRAFT: wild card', 'DRAFT: write this card')") + ' },' + (P.wild ? '' : ' // DRAFT: no wild card in the batch'));
      entries.push(lines.join('\n'));
    });
    let lv10 = '';
    if (W.m.length) {
      const ms = W.m.map(m => { const cc = copyOf(m, m.text), best = (m.f.best || letterOf[(m.path[1] || '').toLowerCase()] || '').toString().toUpperCase();
        return '{ name: ' + q(m.name) + ', best: ' + q(best) + ', desc: ' + cc.s + ', apply: draftFlag(' + q('dr_' + slug(m.name)) + ') }' + (best ? '' : ' /* DRAFT: best-with branch not set */') + (cc.c ? ' /*' + cc.c.replace(/^\/\/ /, '') + '*/' : ''); });
      lv10 = ms;
    }
    const bests = W.m.map(m => (m.f.best || letterOf[(m.path[1] || '').toLowerCase()] || '').toString().toUpperCase());
    const lv10Txt = lv10 ? 'lv10: ' + (c.isNew ? '[' + lv10.join(', ') + ']' : '(sp.lv10 || []).filter(x => ![' + bests.map(q).join(', ') + '].includes(x.best)).concat([' + lv10.join(', ') + '])') + ', // DRAFT: the game deals three masteries; ' + (c.isNew ? 'this weapon has ' + lv10.length + ' so far' : 'these replace the existing mastery with the same best letter') : '';
    const specBody = entries.join('\n') + (lv10Txt ? '\n  ' + lv10Txt : '');
    L.push('(function () {');
    if (c.isNew) { L.push('  wupReg(' + q(c.id) + ', {'); L.push(specBody.replace(/^/gm, '  ')); L.push('  });'); }
    else {
      L.push('  const id = ' + q(c.id) + ', S = ' + q(sampleId) + ', sp = Object.assign({}, (typeof wupSpecFor === \'function\' ? wupSpecFor(id, S) : WUP[id]) || {});');
      L.push('  // DRAFT: wupRegFor(S, ...) makes this the sample\'s own branch set for the weapon (other samples keep the shared one); use wupReg(id, sp) to share it');
      L.push('  Object.assign(sp, {'); L.push(specBody.replace(/^/gm, '  ')); L.push('  });');
      L.push('  wupRegFor(S, id, sp);');
    }
    L.push('})();');
    out.push(L.join('\n'));
    for (const P of W.p) LOG.branches.push({ id: c.id, sample: c.isNew ? null : sampleId, letter: letterOf[P.row.name.toLowerCase()], name: P.row.name });
  }

  // ------------------------------------------------------------ modifiers (+ forks and masteries)
  const modRows = rows.filter(r => r.type === 'Modifier'), modCtx = {};
  for (const r of modRows) {
    const ex = existing(mList, r), L = [];
    if (ex) {
      const rn = r.name !== ex.name, tx = r.text && r.text !== ex.desc, f = r.f;
      if (!rn && !tx && !f.r1 && !f.r2 && !f.r3) { say(when(r) + ': matches the existing card, nothing to draft'); continue; }
      const cp = copyOf(r, r.f.r1 || r.text, ex.desc);
      out.push(['// ---- Modifier edit: ' + ex.name + (rn ? ' -> ' + r.name : '') + ' (row ' + r.i + ')', '(function () {', '  const m = MODS10[' + q(ex.id) + ']; if (!m) return;', '  m.name = ' + q(r.name) + ';' + (tx || f.r1 ? ' m.desc = ' + cp.s + ';' + cm(cp.c) : ''),
        (f.r2 || f.r3) ? '  if (typeof MODUP !== \'undefined\' && MODUP[' + q(ex.id) + ']) { ' + (f.r2 ? 'MODUP[' + q(ex.id) + '][0] = ' + q(f.r2) + '; ' : '') + (f.r3 ? 'MODUP[' + q(ex.id) + '][1] = ' + q(f.r3) + ';' : '') + ' }' : '',
        '  // DRAFT: the name may also be overridden in slicecopy.js SLICE_NAMES, which wins over this one', '})();'].filter(Boolean).join('\n'));
      LOG.modEdits.push({ id: ex.id, name: r.name }); modCtx[r.name.toLowerCase()] = { id: ex.id, ex: ex };
      continue;
    }
    if (r.edit) { handBlock(r, 'edit of a modifier the game does not have'); continue; }
    const id = newId('dr_', r.name), g = groupId(r.f.grp), at = atkId(r.f.at);
    modCtx[r.name.toLowerCase()] = { id, row: r, isNew: true, forks: [], masts: [] };
  }
  for (const r of rows.filter(r => r.type === 'Modifier fork' || r.type === 'Modifier mastery')) {
    const c = modCtx[String(r.f.mod || r.path[0] || '').toLowerCase()] || (() => { const m = mList.find(x => eqn(x.name, r.f.mod || r.path[0])); return m ? { id: m.id, ex: m } : null; })();
    if (!c || !c.isNew) { handBlock(r, c ? 'a fork on an existing modifier changes its shared branch tables (MSB, SLICE_MODS)' : 'the modifier "' + (r.f.mod || r.path[0] || '?') + '" is not in the game or the batch'); continue; }
    (r.type === 'Modifier fork' ? c.forks : c.masts).push(r);
  }
  for (const c of Object.values(modCtx)) {
    if (!c.isNew || c.done) continue; c.done = 1;
    const r = c.row, f = r.f, g = groupId(f.grp), at = atkId(f.at), L = [];
    L.push('// ---- Modifier: ' + r.name + ' (row ' + r.i + ')');
    const cp = copyOf(r, f.r1 || r.text);
    if (!g) L.push('// DRAFT: group (' + Object.keys(CAT.gname).join(', ') + ') ' + (f.grp ? '"' + f.grp + '" is not one' : 'not set') + '; Flight stands in');
    if (!at) L.push('// DRAFT: attack types it fits were not set; it fits all six until you decide (modOk also reads the modifier matrix)');
    L.push('(function () {'); L.push('  const id = ' + q(c.id) + ';'); L.push('  if (typeof MODS10 === \'undefined\' || MODS10[id]) return;');
    L.push('  MODS10[id] = { name: ' + q(r.name) + ', desc: ' + cp.s + ', atk: ' + (at ? '[' + q(at) + ']' : 'MOD_ALL.slice()') + ', max: 3, cap: {} };' + cm(cp.c) + ' // DRAFT: effect not built (see modslice.js for how a modifier acts: wrap wupStats / wupDmgMul / wupHit)');
    L.push('  MM_GROUP[id] = ' + q(g || 'flight') + ';');
    L.push('  MODUP[id] = [' + q(f.r2 || 'DRAFT: write the Rank 2 line') + ', ' + q(f.r3 || 'DRAFT: write the Rank 3 line') + ']; ' + (f.r2 && f.r3 ? '' : '// DRAFT copy: rank lines missing'));
    L.push("  if (typeof MATRIX_ONLY !== 'undefined') MATRIX_ONLY.mods.push(id);");
    if (c.forks.length || c.masts.length) {
      const nm = (list, fk, i) => { const x = list.filter(y => String(y.f.fk || '').toUpperCase() === fk)[i]; return x; };
      const A = nm(c.forks, 'A', 0), B = nm(c.forks, 'B', 0), A1 = nm(c.masts, 'A', 0), A2 = nm(c.masts, 'A', 1), B1 = nm(c.masts, 'B', 0), B2 = nm(c.masts, 'B', 1);
      const N_ = x => q(x ? x.name : 'DRAFT'), T_ = x => q(x ? x.name + ': ' + (x.f.r2 || x.f.r3 || x.text) : 'DRAFT: write this line');
      L.push("  if (typeof MSB !== 'undefined') MSB[id] = [" + [A, B, A1, A2, B1, B2].map(N_).join(', ') + ']; // fork A, fork B, then masteries A1, A2, B1, B2' + ([A, B, A1, A2, B1, B2].some(x => !x) ? ' // DRAFT: some fork or mastery slots were not in the batch' : ''));
      L.push("  if (typeof SLICE_MODS !== 'undefined') SLICE_MODS[id] = [MODS10[id].desc, MODUP[id][0], MODUP[id][1], " + [A, B].map(T_).join(', ') + ", 'DRAFT: fork A Rank 3 line', 'DRAFT: fork B Rank 3 line', " + [A1, A2, B1, B2].map(T_).join(', ') + ']; // DRAFT copy: the Rank 3 fork lines are not in the planner yet');
      for (const x of [].concat(c.forks, c.masts)) if (![A, B, A1, A2, B1, B2].includes(x)) handBlock(x, 'more than two forks or masteries on one side of a modifier');
    }
    L.push('})();'); out.push(L.join('\n'));
    LOG.mods.push({ id: c.id, name: r.name });
  }

  // ------------------------------------------------------------ feats (+ forks)
  const featRows = rows.filter(r => r.type === 'Feat'), fCtx = {};
  for (const r of featRows) {
    const ex = existing(fList, r), L = [];
    if (ex) {
      const rn = r.name !== ex.name, tx = r.text && r.text !== ex.does, base = {}, ch = [];
      const set = (k, key, cur) => { if (r.f[k] != null && r.f[k] !== (cur || 0)) { base[key] = r.f[k]; ch.push(k + ' ' + (cur || 0) + ' to ' + r.f[k]); } };
      set('cd', 'cd', ex.base.cd); set('dur', 'dur', ex.base.dur); set('rng', 'range', ex.base.range); set('dmg', 'dmg', ex.base.dmg);
      const stam = r.f.stam != null && r.f.stam !== ex.stam ? r.f.stam : null; if (stam != null) ch.push('stam ' + ex.stam + ' to ' + stam);
      if (!rn && !tx && !ch.length) { say(when(r) + ': matches the existing card, nothing to draft'); continue; }
      const cp = copyOf(r, tx ? r.text : ex.does);
      out.push(['// ---- Feat edit: ' + ex.name + (rn ? ' -> ' + r.name : '') + ' (row ' + r.i + (ch.length ? '; ' + ch.join(', ') : '') + ')', '(function () {',
        '  const d = F10[' + q(ex.id) + '], sp = SPELLS[' + q('f10_' + ex.id) + ']; if (!d || !sp) return;',
        '  d.name = sp.name = ' + q(r.name) + ';' + (tx ? ' d.does = sp.desc = ' + cp.s + ';' + cm(cp.c) : ''),
        Object.keys(base).length ? '  Object.assign(d.base, ' + JSON.stringify(base) + '); Object.assign(sp.base, ' + JSON.stringify(base) + ');' : '', stam != null ? '  d.stam = ' + stam + ';' : '',
        '  for (const c of (typeof CARDS !== \'undefined\' ? CARDS : [])) if (c.id === ' + q('feat_' + ex.id) + ') { c.title = ' + q(r.name) + '; ' + (tx ? 'c.desc = ' + cp.s + '; ' : '') + '}',
        '  // DRAFT: the description text may quote numbers (stamina, cooldown) that the fire() code reads from the numbers above; check they agree', '})();'].filter(Boolean).join('\n'));
      LOG.featEdits.push({ id: ex.id, name: r.name }); fCtx[r.name.toLowerCase()] = { id: ex.id, ex };
      continue;
    }
    if (r.edit) { handBlock(r, 'edit of a Feat the game does not have'); continue; }
    fCtx[r.name.toLowerCase()] = { id: newId('', r.name), row: r, isNew: true, forks: { 3: [], 5: [] } };
  }
  for (const r of rows.filter(r => r.type === 'Feat fork')) {
    const c = fCtx[String(r.f.feat || r.path[0] || '').toLowerCase()];
    const lv = parseInt(r.f.lv || '3', 10) === 5 ? 5 : 3;
    if (!c || !c.isNew) { handBlock(r, c ? 'a fork on an existing Feat' : 'the Feat "' + (r.f.feat || r.path[0] || '?') + '" is not in the game or the batch'); continue; }
    c.forks[lv].push(r);
  }
  for (const c of Object.values(fCtx)) {
    if (!c.isNew || c.done) continue; c.done = 1;
    const r = c.row, f = r.f, L = [], dt = typeId(f.dt), t = F10_OF[dt] || '', atk = atkId(f.at) || 'proj';
    L.push('// ---- Feat: ' + r.name + ' (row ' + r.i + ')');
    if (!t) L.push('// DRAFT: damage type ' + (f.dt ? '"' + f.dt + '" has no Feat type (Feats come in Force, Acid, Static, Mucus, Blood, Parasite, Fire)' : 'not set') + '; a utility Feat (no damage type) until you decide');
    if (t && !atkId(f.at)) L.push('// DRAFT: attack type not set; Projectile stands in');
    const peers = fList.filter(x => x.atk === atk && !x.sample), star = k => med(peers.map(x => (x.base && x.base[k]) || 0));
    const val = (k, key, label) => { if (f[k] != null) return f[k]; const m = key === 'stam' ? med(peers.map(x => x.stam || 0)) : star(key); if (m !== '') L.push('// DRAFT: ' + label + ' not set; defaulted to the median of ' + ATK_NAME[atk] + ' Feats (' + m + ')'); return m; };
    const stam = val('stam', 'stam', 'stamina cost'), base = {};
    for (const [k, key, lab] of [['dmg', 'dmg', 'damage'], ['cd', 'cd', 'cooldown'], ['rng', 'range', 'range'], ['dur', 'dur', 'duration']]) { const v = val(k, key, lab); if (v !== '') base[key] = v; }
    const cp = copyOf(r, r.text, 'DRAFT: write this card line'), trig = /^y/i.test(f.trig || '');
    L.push('feat({ id: ' + q(c.id) + ', name: ' + q(r.name) + ', icon: ' + q(initials(r.name)) + ", ico: 'cross', " + (t ? 'type: ' + q(t) + ', atk: ' + q(atk) + ', ' : '') + (trig ? 'trig: 1, ev: 1, ' : '') + 'rar: 1, stam: ' + (stam === '' ? 0 : stam) + ',');
    L.push('  // DRAFT: unlock: a Feat is only dealt once META.f10unl lists it or start: true is set; icon (ico) is the generic cross');
    L.push('  does: ' + cp.s + ',' + cm(cp.c));
    L.push('  base: ' + JSON.stringify(base).replace(/"(\w+)":/g, '$1: ').replace(/,/g, ', ').replace(/^\{/, '{ ').replace(/\}$/, ' }') + ',');
    L.push('  fire: (w, c) => { }, // DRAFT: effect not built (f10Hit / f10Burst / f10Patch in feats10.js are the helpers)' + (trig ? ' // DRAFT: a triggered Feat also needs the event that calls f10Go (see baseline1.js quick_draw)' : ''));
    const forks = {};
    for (const lv of [3, 5]) {
      const fr = c.forks[lv]; if (!fr.length) continue;
      if (fr.length < 2) { L.push('  // DRAFT: the Lv ' + lv + ' fork needs two options; only ' + fr.length + ' in the batch (' + fr[0].name + '), so it is left out'); continue; }
      forks[lv] = fr.slice(0, 2).map(x => { const cc = copyOf(x, x.text); return '{ id: ' + q('dr_' + slug(x.name)) + ', title: ' + q(x.name) + ', desc: ' + cc.s + ' }' + (cc.c ? ' /*' + cc.c.replace(/^\/\/ /, '') + '*/' : ''); });
      fr.slice(2).forEach(x => handBlock(x, 'a third Lv ' + lv + ' fork option'));
    }
    const fk = Object.keys(forks);
    L.push(fk.length ? '  forks: { ' + fk.map(lv => lv + ': [' + forks[lv].join(', ') + ']').join(', ') + ' } }); // DRAFT: fork effects not built (read them with f10Fk(w, id) in fire / stat)' : '  forks: {} });');
    out.push(L.join('\n'));
    LOG.feats.push({ id: c.id, name: r.name });
  }

  // ------------------------------------------------------------ sperm passives
  for (const r of rows.filter(r => r.type === 'Sperm passive')) {
    const ex = existing(pList, r), L = [], f = r.f, fam = FAMILY[String(f.fam || '').toLowerCase()], rar = RARITY.indexOf(String(f.rar || '').toLowerCase());
    if (ex) {
      const rn = r.name !== ex.name, tx = r.text && r.text !== ex.desc, mx = f.max != null && f.max !== ex.maxRank, rr = rar >= 0 && rar !== ex.rarity;
      if (!rn && !tx && !mx && !rr) { say(when(r) + ': matches the existing card, nothing to draft'); continue; }
      const cp = copyOf(r, tx ? r.text : ex.desc);
      out.push(['// ---- Passive edit: ' + ex.name + (rn ? ' -> ' + r.name : '') + ' (row ' + r.i + ')', '(function () {', '  const c = MUT_REG.find(x => x.id === ' + q(ex.id) + '); if (!c) return;', '  c.title = ' + q(r.name) + ';' + (tx ? ' c.desc = ' + cp.s + ';' + cm(cp.c) : ''), mx ? '  c.maxRank = ' + f.max + '; // DRAFT: spassives.js makes rank-3 passives rank 4 (mastery); check that still holds' : '', rr ? '  c.rarity = ' + rar + ';' : '', '})();'].filter(Boolean).join('\n'));
      LOG.passiveEdits.push({ id: ex.id, name: r.name }); continue;
    }
    if (r.edit) { handBlock(r, 'edit of a passive the game does not have'); continue; }
    const id = newId('pass_', r.name), cp = copyOf(r, r.text);
    L.push('// ---- Sperm passive: ' + r.name + ' (row ' + r.i + ')');
    if (!fam) L.push('// DRAFT: family ' + (f.fam ? '"' + f.fam + '" has no plain family here' : 'not set') + '; Body stands in');
    if (rar < 0) L.push('// DRAFT: rarity not set; Uncommon stands in');
    L.push("if (typeof mutCard === 'function') {");
    L.push('  mutCard({ id: ' + q(id) + ', title: ' + q(r.name) + ', icon: ' + q(initials(r.name)) + ', rarity: ' + (rar < 0 ? 1 : rar) + ', maxRank: ' + (f.max || 1) + ', family: ' + q(fam || 'mut:body') + ',');
    L.push("    flavour: 'DRAFT: write the flavour line', // DRAFT copy: the planner has no flavour field");
    L.push('    desc: ' + cp.s + ',' + cm(cp.c));
    L.push("    why: () => '' }); // DRAFT: effect not built: add on: (G, rank) => { ... } or hookOn(...) reading mr(" + q(id) + '); gate it by a Do rule (cardrules.js) if it belongs to a branch');
    L.push('}'); out.push(L.join('\n'));
    LOG.passives.push({ id, name: r.name });
  }

  // ------------------------------------------------------------ everything else
  const done = new Set(['Weapon', 'Lv 3 branch', 'Lv 6 branch', 'Lv 9 mastery', 'Modifier', 'Modifier fork', 'Modifier mastery', 'Feat', 'Feat fork', 'Sperm passive']);
  for (const r of rows) if (!done.has(r.type)) handBlock(r, r.type === 'Sample branch' ? 'smbReg(sampleId, spec) replaces a sample\'s whole branch tree (samplebranch.js); merge with the live one' : r.type + ' rows are not drafted yet');

  // ------------------------------------------------------------ the file
  const outPath = path.resolve(opt.out || path.join(ROOT, 'web/js/draft_' + slug(sampleId) + '.js')), stem = path.basename(outPath, '.js');
  const hooks = [];
  if (LOG.weapons.length) hooks.push('W24 / W24_IDS / W24_BY / W24_DESC / MATRIX_ONLY.weapons pushes (new weapons, podcast.js pattern)');
  if (LOG.branches.length) hooks.push('wupReg / wupRegFor (branch sets)');
  if (LOG.mods.length) hooks.push('MODS10 / MM_GROUP / MODUP / MSB / SLICE_MODS entries, MATRIX_ONLY.mods.push');
  if (LOG.feats.length) hooks.push('feat() (feats10.js)');
  if (LOG.passives.length) hooks.push('mutCard() (mutations.js)');
  if (LOG.renames.length || LOG.featEdits.length || LOG.modEdits.length || LOG.passiveEdits.length) hooks.push('overrides of live entries (WEAPONS, W24_*, F10, SPELLS, MODS10, MUT_REG)');
  const head = ["'use strict';",
    '// Spawn Prawn - DRAFT cards from the Loadout Planner (' + path.basename(pos[0]) + ', ' + rows.length + ' rows, sample ' + sampleName + '), written by tests/tools/planner/draft.js.',
    '// Every "// DRAFT:" line is a decision for a human; every effect is a stub ("// DRAFT: effect not built"). Names and text are the user\'s, as typed.',
    '// Hooks: ' + (hooks.join('; ') || 'none') + '. No edits to shared tables beyond those pushes. No save data.',
    '// Loads after cardrulesengine.js (the last script in index.html): needs weapons24, samplebranches, modmatrix, modslice, feats10, mutations.',
    "const draftNone = () => {}, draftFlag = k => w => { (w.dr || (w.dr = {}))[k] = 1; }, draftC = (name, desc, apply) => ({ name, desc, apply: apply || draftNone }); // (a branch card taken sets w.dr.<key>; read it in the effect you build)"];
  const body = out.concat(hand.length ? ['// ---------------------------------------------------------------- apply by hand\n' + hand.join('\n\n')] : []).join('\n\n');
  const stemKey = q(stem);
  const text = head.join('\n') + '\n\n' + body + '\n\nwindow.DRAFT_LOG = Object.assign(window.DRAFT_LOG || {}, { [' + stemKey + ']: ' + JSON.stringify(LOG) + ' }); // (what this file registered: tests/tools/planner/draft.js checks these after splashEnd())\n';
  fs.mkdirSync(path.dirname(outPath), { recursive: true }); fs.writeFileSync(outPath, text);
  console.error('wrote ' + path.relative(process.cwd(), outPath) + ' (' + text.split('\n').length + ' lines)');
  for (const n of notes) console.error('note: ' + n);
  console.error('DRAFT markers: ' + (text.match(/DRAFT/g) || []).length + '; TODO_COPY: ' + (text.match(/TODO_COPY/g) || []).length);

  // ------------------------------------------------------------ the ideas.md table
  let next = opt.start ? parseInt(opt.start, 10) : 1;
  if (!opt.start) { try { const md = fs.readFileSync(path.join(ROOT, 'ideas.md'), 'utf8'); for (const m of md.matchAll(/^\| (\d+) \|/gm)) next = Math.max(next, +m[1] + 1); } catch (e) { } }
  const cell = s => String(s || '').replace(/\r?\n+/g, ' ').replace(/\|/g, '/').trim();
  const fieldTxt = r => { const L = (FLD[r.type] || []).filter(d => r.f[d[0]] != null).map(d => d[1] + ': ' + r.f[d[0]] + d[3]); return L.length ? ' [' + L.join('; ') + ']' : ''; };
  const lines = ['| # | Type | Name | Under | Idea | Status |', '|---|---|---|---|---|---|'];
  rows.forEach((r, i) => lines.push('| ' + (next + i) + ' | ' + cell(r.type + (r.edit ? ' (edit of ' + ((r.orig && r.orig.name) || r.name) + ')' : '')) + ' | ' + cell(r.name) + ' | ' + cell(r.under || 'the sperm') + ' | ' + cell((r.text || '(no text yet)') + fieldTxt(r)) + ' | briefed |'));
  console.log(lines.join('\n'));

  // ------------------------------------------------------------ verify
  if (opt.noVerify) return;
  try { cp.execFileSync(process.execPath, ['--check', outPath], { stdio: 'pipe' }); console.error('verify: node --check ok'); } catch (e) { console.error('verify: node --check FAILED\n' + (e.stderr || e)); process.exit(1); }
  const b2 = await chromium.launch(), pg = await b2.newPage(), pe = [];
  pg.on('pageerror', e => pe.push(e.message));
  await pg.addInitScript(() => { window.TUT_OFF = 1; });
  await pg.goto('file://' + path.join(ROOT, 'web/index.html')); await pg.waitForTimeout(800);
  await pg.addScriptTag({ path: outPath }); // (the file as index.html would load it: after every other script)
  await pg.evaluate(() => { splashEnd(); });
  const res = await pg.evaluate(([key, sid]) => {
    const L = window.DRAFT_LOG && window.DRAFT_LOG[key], bad = [], ok = [];
    if (!L) return { bad: ['DRAFT_LOG missing'], ok };
    const chk = (c, m) => (c ? ok : bad).push(m);
    try { if (!G) newGame('s002'); } catch (e) { bad.push('newGame: ' + e.message); }
    for (const w of L.weapons) { chk(!!WEAPONS[w.id] && WEAPONS[w.id].name === w.name && !!W24_BY[w.id] && W24_IDS.includes(w.id) && MATRIX_ONLY.weapons.includes(w.id), 'weapon ' + w.id);
      try { const s = makeSlot(w.id); chk(!!(s && s.def && s.def.name === w.name), 'makeSlot ' + w.id); } catch (e) { bad.push('makeSlot ' + w.id + ': ' + e.message); } }
    for (const w of L.weaponEdits) for (const k of Object.keys(w.base)) chk(WEAPONS[w.id].base[k] === w.base[k], 'weapon edit ' + w.id + ' ' + k);
    for (const w of L.renames) chk(WEAPONS[w.id] && WEAPONS[w.id].name === w.name && W24_BY[w.id].name === w.name, 'rename ' + w.id);
    for (const b of L.branches) { const sp = b.sample ? wupSpecFor(b.id, b.sample) : WUP[b.id]; chk(!!(sp && sp[b.letter] && sp[b.letter].name === b.name && sp[b.letter].lv6 && sp[b.letter].lv6.length >= 2), 'branch ' + b.id + ' ' + b.letter + ' ' + b.name); }
    for (const f of L.feats) { chk(!!F10[f.id] && F10_ORDER.includes(f.id) && !!SPELLS['f10_' + f.id] && SPELLS['f10_' + f.id].name === f.name, 'feat ' + f.id);
      try { window.F10_ALL = 1; const w = f10Give(f.id, 1); chk(!!w, 'f10Give ' + f.id); recomputeAll(); } catch (e) { bad.push('f10Give ' + f.id + ': ' + e.message); } }
    for (const f of L.featEdits) chk(F10[f.id] && F10[f.id].name === f.name && SPELLS['f10_' + f.id].name === f.name, 'feat edit ' + f.id);
    for (const m of L.mods) chk(!!MODS10[m.id] && MODS10[m.id].name === m.name && MM_GROUP[m.id] && MATRIX_ONLY.mods.includes(m.id), 'modifier ' + m.id);
    for (const m of L.modEdits) chk(MODS10[m.id] && MODS10[m.id].name === m.name, 'modifier edit ' + m.id);
    for (const p of L.passives) chk(!!MUT_REG.find(x => x.id === p.id && x.title === p.name), 'passive ' + p.id);
    for (const p of L.passiveEdits) chk(!!MUT_REG.find(x => x.id === p.id && x.title === p.name), 'passive edit ' + p.id);
    return { bad, ok };
  }, [stem, sampleId]);
  await b2.close();
  for (const e of pe) res.bad.push('page error: ' + e);
  console.error('verify: ' + res.ok.length + ' checks passed' + (res.bad.length ? ', ' + res.bad.length + ' FAILED:\n  ' + res.bad.join('\n  ') : ', no page errors'));
  if (res.bad.length) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
