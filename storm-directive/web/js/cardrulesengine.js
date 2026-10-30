'use strict';
// Spawn Prawn - card rules: Do, Don't and Weight (the user's design, 30 Oct 2026; contract in CARD_RULES.md, data in cardrules.js).
//  - DON'T is symmetric: a rule "A don't B" makes A and B incompatible. While A is held, B (and its descendants) is never dealt,
//    and while B is held, A is never dealt.
//  - DO is any-one: a card that is the target of one or more Do rules is dealt only while at least one of those parents is held.
//  - WEIGHT (k): while the parent is held, the target is k times as likely in the random deals (modifier cards, Feat and passive
//    cards, new weapons). Branch and fork screens show every option, so weight does not touch them.
//  - SCOPE per rule: 'weapon' (default: a parent that lives on a weapon counts only on the candidate's weapon; a candidate that
//    lives on no weapon reads it as run) or 'run'. Optional conditions: `sample` (only in runs as that sample) and `branch`
//    (a key that must be held, e.g. a weapon branch or a passive branch). These are the user's "this weapon / this sample /
//    this weapon or sample branch".
//  - INHERITANCE: a rule on a weapon branch also covers that branch's Lv 6 cards and wild card; a rule on a modifier also covers its
//    forks and masteries. Holding a Lv 6 card implies holding its branch, so parents need nothing extra.
//  - CONDITIONS on a rule, in its scope: `form` (the weapon's Delivery form: its first Delivery modifier, '' for none), `with` (keys that must be held) and `unless`
//    (keys that turn it off). Rules carry `src` when they came from a game table (audit, matrix, delivery): see CARD_RULES_OWNS.
//  - Held cards are never removed. Rules only stop new deals. If a fork or branch screen would be left empty, it is shown unfiltered
//    rather than locking the weapon.
//  - DEBUG (Settings > Game > ruleDebug): dealt cards carry a line naming the rules that touched them, and a held-back list.
// Keys: w:<weaponId> m:<modId> mf:<modId>:<A|B|A1|A2|B1|B2> b:<weaponId>:<A|B|C> wb:<weaponId>:<card name> f:<featId>
// p:<passiveId> pm:<passiveId>:<A|B> s:<sampleId>; targets may also be tag:g:<group> tag:a:<attack> tag:t:<type> tag:k:<w|m|b|f|p>.
// Hooks: one line in draft.js draftCards (crCardW weight); wraps modOk, modDraftCands, wupForkCards, forkCards, cardOk, kinPool,
// v10Loot, genLoot. SETTINGS_DEF.push('ruleDebug'). Loads last (after every other wrap of those functions).

// ---------------------------------------------------------------- settings
SETTINGS_DEF.push({ id: 'ruleDebug', tab: 'game', label: 'TODO_COPY:set_ruledebug', hint: 'TODO_COPY:set_ruledebug_hint', opts: [[false, 'OFF'], [true, 'ON']] });
SET_DEFAULTS.ruleDebug = false;
try { SET.ruleDebug = JSON.parse(localStorage.getItem('sd_settings') || '{}').ruleDebug === true; } catch (e) { SET.ruleDebug = false; }
const crDebug = () => !!(typeof SET !== 'undefined' && SET.ruleDebug);

// ---------------------------------------------------------------- keys, names and tags
const crSplit = k => { const i = k.indexOf(':'); return [k.slice(0, i), k.slice(i + 1)]; };
const crWKey = w => (w && w.def ? w24Key(w) : null);
function crName(key) {
  if (!key) return '';
  const [t, rest] = crSplit(key);
  try {
    if (t === 'w') return (WEAPONS[rest] && WEAPONS[rest].name) || rest;
    if (t === 'm') return (MODS10[rest] && MODS10[rest].name) || rest;
    if (t === 'mf') { const [id, c] = rest.split(':'), N = MSB[id], i = { A: 0, B: 1, A1: 2, A2: 3, B1: 4, B2: 5 }[c]; return (N && N[i]) || (MODS10[id] ? MODS10[id].name + ' ' + c : rest); }
    if (t === 'b') { const [wid, L] = rest.split(':'); return (WUP[wid] && WUP[wid][L] && WUP[wid][L].name) || rest; }
    if (t === 'wb') return rest.slice(rest.indexOf(':') + 1);
    if (t === 'f') return (F10[rest] && F10[rest].name) || rest;
    if (t === 'p') { const m = MUT_REG.find(x => x.id === rest); return (m && m.title) || rest; }
    if (t === 'pm') { const [id, c] = rest.split(':'), B = SPM_BR[id]; return B ? B[c === 'B' ? 2 : 0] : rest; }
    if (t === 's') { const s = SAMPLES10.find(x => x.id === rest); return (s && s.name) || rest; }
    if (t === 'tag') return 'all ' + rest.replace(':', ' ');
  } catch (e) { }
  return key;
}
function crKnown(key) {
  if (typeof key !== 'string' || key.indexOf(':') < 0) return false;
  const [t, rest] = crSplit(key);
  if (t === 'w') return !!WEAPONS[rest];
  if (t === 'm') return !!MODS10[rest];
  if (t === 'mf') { const [id, c] = rest.split(':'); return !!(MODS10[id] && typeof MSB !== 'undefined' && MSB[id] && ['A', 'B', 'A1', 'A2', 'B1', 'B2'].includes(c)); }
  if (t === 'b') { const [wid, L] = rest.split(':'); return !!(WUP[wid] && WUP[wid][L]); }
  if (t === 'wb') { const i = rest.indexOf(':'), wid = rest.slice(0, i), nm = rest.slice(i + 1), S = WUP[wid]; if (!S) return false; return ['A', 'B', 'C'].some(L => S[L] && [...S[L].lv6, S[L].wild].some(c => c && c.name === nm)) || (S.lv10 || []).some(c => c.name === nm); }
  if (t === 'f') return !!F10[rest];
  if (t === 'p') return MUT_REG.some(x => x.id === rest);
  if (t === 'pm') { const [id, c] = rest.split(':'); return !!(SPM_BR[id] && (c === 'A' || c === 'B')); }
  if (t === 's') return SAMPLES10.some(x => x.id === rest);
  if (t === 'tag') { const [k, v] = rest.split(':'); return ['g', 'a', 't', 'k'].includes(k) && !!v; }
  return false;
}
// The tags of a card key: its kind, modifier group, attack types, damage type.
function crTagsOf(key) {
  const [t, rest] = crSplit(key), out = [];
  const kind = { w: 'w', m: 'm', mf: 'm', b: 'b', wb: 'b', f: 'f', p: 'p', pm: 'p' }[t]; if (kind) out.push('k:' + kind);
  try {
    if (t === 'm' || t === 'mf') { const id = rest.split(':')[0]; out.push('g:' + mmGroup(id)); for (const a of (MODS10[id] && MODS10[id].atk) || []) out.push('a:' + a); }
    if (t === 'w') { const d = WEAPONS[rest]; if (d) { if (d.v10atk) out.push('a:' + d.v10atk); if (d.elem) out.push('t:' + d.elem); } }
    if (t === 'f') { const d = F10[rest]; if (d) { if (d.atk) out.push('a:' + d.atk); if (d.type) out.push('t:' + (F10_INT[d.type] || d.type)); } }
    if (t === 'b' || t === 'wb') { const d = WEAPONS[rest.split(':')[0]]; if (d) { if (d.v10atk) out.push('a:' + d.v10atk); if (d.elem) out.push('t:' + d.elem); } }
  } catch (e) { }
  return out;
}
// Descendants for inheritance: a branch's Lv 6 cards and wild card; a modifier's forks and masteries.
function crCovers(pattern, key) {
  if (pattern === key) return true;
  const [pt, pr] = crSplit(pattern), [kt, kr] = crSplit(key);
  if (pt === 'tag') return crTagsOf(key).includes(pr);
  if (pt === 'm' && kt === 'mf') return kr.split(':')[0] === pr;
  if (pt === 'b' && kt === 'wb') {
    const [wid, L] = pr.split(':'), i = kr.indexOf(':'); if (kr.slice(0, i) !== wid) return false;
    const P = WUP[wid] && WUP[wid][L], nm = kr.slice(i + 1); return !!(P && [...P.lv6, P.wild].some(c => c && c.name === nm));
  }
  if (pt === 'p' && kt === 'pm') return kr.split(':')[0] === pr;
  return false;
}

// ---------------------------------------------------------------- what is held
// Keys held on one weapon slot, and keys held by the run itself.
function crWeaponKeys(w) {
  const k = crWKey(w); if (!k) return [];
  const out = ['w:' + k];
  for (const id of new Set(w.m10 || [])) out.push('m:' + id);
  for (const [id, c] of Object.entries(w.mmB || {})) out.push('mf:' + id + ':' + c);
  for (const [id, c] of Object.entries(w.mmX || {})) out.push('mf:' + id + ':' + c);
  const U = w.up || {};
  if (U.p) out.push('b:' + k + ':' + U.p);
  if (U.l6) out.push('wb:' + k + ':' + U.l6);
  if (U.l10) out.push('wb:' + k + ':' + U.l10);
  return out;
}
function crRunKeys() {
  const out = [];
  for (const s of G.spells || []) if (s && s.def && s.def.f10) out.push('f:' + s.def.f10.id);
  for (const [id, r] of Object.entries(G.muts || {})) if (r > 0) out.push('p:' + id);
  for (const [id, c] of Object.entries(G.spB || {})) out.push('pm:' + id + ':' + c);
  if (G.s10 && G.s10.id) out.push('s:' + G.s10.id);
  return out;
}
// Everything held that counts for a rule of this scope, for a candidate on weapon w (null: a candidate on no weapon).
function crHeldFor(scope, w) {
  const run = crRunKeys(), all = [];
  if (scope === 'weapon' && w) all.push(...crWeaponKeys(w));
  else for (const x of G.weapons || []) if (x && !x.isSpell) all.push(...crWeaponKeys(x));
  return all.concat(run);
}
const crHeld = (pattern, ctx) => !!G && crHeldFor((ctx && ctx.scope) || 'run', ctx && ctx.w).some(k => crCovers(pattern, k));
function crLive(r) { // the rule's run-wide conditions (sample, branch) hold
  if (r.sample && !(G.s10 && G.s10.id === r.sample)) return false;
  if (r.branch && !crHeld(r.branch, { scope: 'run' })) return false;
  return true;
}
const crRules = () => (typeof CARD_RULES !== 'undefined' ? CARD_RULES : []);
// The rule's own conditions against what is held in its scope: `with` (every key held: e.g. the Delivery form an audit row needs)
// and `unless` (any key held turns the rule off: e.g. Knockback is fine on Panic Button once it has Ranged).
const crForm = w => { for (const id of (w && w.m10) || []) if (mmGroup(id) === 'delivery') return id; return ''; }; // (the weapon's Delivery form: its first Delivery modifier, as moddead.js reads it)
function crCond(r, held, w) {
  if (r.form != null && (!w || crForm(w) !== r.form)) return false;
  if (r.with) for (const k of [].concat(r.with)) if (!held.some(h => crCovers(k, h))) return false;
  if (r.unless) for (const k of [].concat(r.unless)) if (held.some(h => crCovers(k, h))) return false;
  return true;
}
// An index of the rules by the keys they name, rebuilt when CARD_RULES changes (tests swap it).
const CRX = { src: [], byKey: new Map(), tags: [] };
function crIndex() {
  const R = crRules();
  if (R.length === CRX.src.length && R.every((r, i) => r === CRX.src[i])) return CRX;
  CRX.src = R.slice(); CRX.byKey = new Map(); CRX.tags = [];
  const put = (k, r) => { const L = CRX.byKey.get(k); if (L) L.push(r); else CRX.byKey.set(k, [r]); };
  for (const r of R) { put(r.parent, r); if (/^tag:/.test(r.target)) CRX.tags.push(r); else put(r.target, r); }
  return CRX;
}
function crRulesFor(key) { // every rule that could name this card, directly or through inheritance or a tag
  const X = crIndex(), out = new Set(X.tags), add = k => { for (const r of X.byKey.get(k) || []) out.add(r); };
  add(key);
  const [t, rest] = crSplit(key);
  if (t === 'wb') { const wid = rest.slice(0, rest.indexOf(':')); for (const L of ['A', 'B', 'C']) add('b:' + wid + ':' + L); }
  if (t === 'mf') add('m:' + rest.split(':')[0]);
  if (t === 'pm') add('p:' + rest.split(':')[0]);
  return out;
}
function crHeldSets(w) { return { weapon: w ? crHeldFor('weapon', w) : null, run: crHeldFor('run', null) }; }
const crHeldIn = (H, r, w) => ((r.scope || 'weapon') === 'weapon' && w ? H.weapon : H.run);

// ---------------------------------------------------------------- the verdict
// null when the card may be dealt, else the reason (for the debug line).
function crWhy(key, ctx) {
  if (!G || !crRules().length) return null;
  const w = ctx && ctx.w, kt = crSplit(key)[0], rules = crRulesFor(key); if (!rules.size) return null;
  const H = crHeldSets(w);
  let doSeen = false, doMet = false; const doNames = [];
  for (const r of rules) {
    if (!crLive(r)) continue;
    const held = crHeldIn(H, r, w); if (!crCond(r, held, w)) continue;
    if (r.mode === 'dont') {
      if (crCovers(r.target, key) && held.some(h => crCovers(r.parent, h))) return 'blocked by ' + crName(r.parent);
      if (!(kt === 'w' && (r.scope || 'weapon') === 'weapon') && crCovers(r.parent, key)) { const h = held.find(x => crCovers(r.target, x)); if (h) return 'blocked by ' + crName(h); } // (a weapon is never "on" another weapon's modifiers)
    } else if (r.mode === 'do' && crCovers(r.target, key)) {
      doSeen = true; doNames.push(crName(r.parent));
      if (held.some(h => crCovers(r.parent, h))) doMet = true;
    }
  }
  if (doSeen && !doMet) return 'needs ' + doNames.join(' or ');
  return null;
}
const crAllowed = (key, ctx) => crWhy(key, ctx) === null;
// The weight factor for a card in a random deal (product of every live Weight rule whose parent is held).
function crWeight(key, ctx) {
  if (!G || !crRules().length) return 1;
  const w = ctx && ctx.w, rules = crRulesFor(key); if (!rules.size) return 1;
  const H = crHeldSets(w); let k = 1;
  for (const r of rules) {
    if (r.mode !== 'weight' || !crLive(r) || !crCovers(r.target, key)) continue;
    const held = crHeldIn(H, r, w); if (!crCond(r, held, w) || !held.some(h => crCovers(r.parent, h))) continue;
    k *= r.k == null || isNaN(+r.k) ? 1 : Math.max(0, +r.k);
  }
  return k;
}
// What the debug line says about a dealt card.
function crNote(key, ctx) {
  const w = ctx && ctx.w, H = crHeldSets(w), out = [];
  for (const r of crRulesFor(key)) {
    if (!crLive(r) || !crCovers(r.target, key)) continue;
    const held = crHeldIn(H, r, w); if (!crCond(r, held, w)) continue;
    if (r.mode === 'do') out.push('only with ' + crName(r.parent));
    if (r.mode === 'weight' && held.some(h => crCovers(r.parent, h))) out.push('x' + r.k + ' from ' + crName(r.parent));
  }
  return out.join('; ');
}
const crLog = (key, why) => { if (crDebug() && G) { const L = G.crHeldBack || (G.crHeldBack = []); if (L.length < 60) L.push(crName(key) + ' (' + why + ')'); } };

// ---------------------------------------------------------------- where cards are dealt
// Modifiers: modOk is asked for every modifier on every weapon (modsFor, the cards, the hold view).
modOk = (orig => function (w, id) {
  if (!orig(w, id)) return false;
  if (!crRules().length || !G) return true; // (a rank-up is a deal too: the old tables blocked them the same way)
  const why = crWhy('m:' + id, { w }); if (why) { crLog('m:' + id, why); return false; }
  return true;
})(modOk);
// Weight for modifier cards: the candidates carry fam 'mod:<id>'; the weapon is the one being dealt for (wmods.js deals one at a time).
modDraftCands = (orig => function (kind) {
  const out = orig.apply(this, arguments);
  if (!crRules().length || !G) return out;
  const ws = (G.weapons || []).filter(x => x && !x.isSpell);
  for (const c of out) {
    if (!c || !c.fam || !c.fam.startsWith('mod:')) continue;
    const id = c.fam.slice(4), on = ws.filter(w => { try { return modOk(w, id); } catch (e) { return false; } });
    const k = on.length ? Math.max(...on.map(w => crWeight('m:' + id, { w }))) : crWeight('m:' + id, { w: null });
    c.w *= k;
  }
  return out.filter(c => !(c && c.w <= 0));
})(modDraftCands);
// Weapon branch screens (Lv 3 promises, Lv 6 cards and wild card, Lv 9 masteries).
wupForkCards = (orig => function (req) {
  const cs = orig(req);
  if (!cs || !crRules().length || !G || !req || !req.w) return cs;
  const w = req.w, wid = crWKey(w), S = WUP[wid]; if (!S) return cs;
  const keyOf = c => { if (req.lv === 3) { const L = ['A', 'B', 'C'].find(k => S[k] && S[k].name === c.title); return L ? 'b:' + wid + ':' + L : null; } return 'wb:' + wid + ':' + c.title; };
  const ok = cs.filter(c => { const k = keyOf(c); if (!k) return true; const why = crWhy(k, { w }); if (why) crLog(k, why); return !why; });
  return ok.length ? ok : cs; // (never an empty branch screen: the rules give way)
})(wupForkCards);
// Modifier forks and masteries (modslice.js: req.ms).
forkCards = (orig => function (req) {
  const cs = orig(req);
  if (!req || !req.ms || !crRules().length || !G || !cs || !cs.length) return cs;
  const { w, id, st } = req.ms, codes = st === 'b' ? ['A', 'B'] : (msBr(w, id) === 'A' ? ['A1', 'A2'] : ['B1', 'B2']);
  const ok = cs.filter((c, i) => { const k = 'mf:' + id + ':' + codes[i]; const why = codes[i] ? crWhy(k, { w }) : null; if (why) crLog(k, why); return !why; });
  return ok.length ? ok : cs;
})(forkCards);
// Feats and sperm passives: the draft's cards (draft.js cardOk), and their weight (one line in draft.js draftCards).
const crCardKey = c => {
  if (!c || !c.id) return null;
  if (c.slot === 'feat' && c.kind === 'acquire' && /^feat_/.test(c.id)) return 'f:' + c.id.slice(5);
  if ((c.slot === 'genome' || c.family === 'mut:rules' || /^mut:/.test(c.family || '')) && c.kind !== 'enhance' && MUT_REG.some(x => x.id === c.id)) return 'p:' + c.id;
  return null;
};
cardOk = (orig => function (c) {
  if (!orig(c)) return false;
  if (!crRules().length || !G) return true;
  const k = crCardKey(c); if (!k || crHeld(k, { scope: 'run' })) return true;
  const why = crWhy(k, { w: null }); if (why) { crLog(k, why); return false; }
  return true;
})(cardOk);
function crCardW(c) { const k = crRules().length && G ? crCardKey(c) : null; return k ? crWeight(k, { w: null }) : 1; }
// New weapons: the slot draft's pool (sigweap.js v10Pool reads kinPool), and its weight (v10Loot 'slot').
kinPool = (orig => function (id) {
  if (!orig(id)) return false;
  if (!crRules().length || !G) return true;
  const why = crWhy('w:' + id, { w: null }); if (why) { crLog('w:' + id, why); return false; }
  return true;
})(kinPool);
v10Loot = (orig => function (req) {
  if (!req || req.kind !== 'slot' || !crRules().length || !G || (typeof sbOn === 'function' && sbOn())) return orig.apply(this, arguments);
  const own = G.weapons.filter(Boolean), have = new Set(own.map(w => w.def.v10atk));
  let pool = v10Pool().filter(id => !own.some(w => (w.sid || w.id) === id) && !have.has(v10Atk(id)));
  if (!pool.length) pool = v10Pool().filter(id => !own.some(w => (w.sid || w.id) === id));
  const keyed = pool.map(id => ({ id, r: Math.pow(Math.random(), 1 / Math.max(1e-6, crWeight('w:' + id, { w: null }))) })).filter(o => crWeight('w:' + o.id, { w: null }) > 0);
  keyed.sort((a, b) => b.r - a.r); // (weighted order: Efraimidis and Spirakis)
  return keyed.slice(0, 3).map(o => optNewWeapon(o.id, 0));
})(v10Loot);
// Debug: what the rules did to this screen.
genLoot = (orig => function (req) {
  if (G) G.crHeldBack = [];
  const cs = orig.apply(this, arguments);
  if (!crDebug() || !G || !Array.isArray(cs) || !crRules().length) return cs;
  for (const c of cs) {
    if (!c) continue;
    let k = null;
    if (c.card && /^mod:/.test(c.card)) k = 'm:' + c.card.slice(4);
    else if (c.wmId) k = 'm:' + c.wmId;
    else if (c.id && /^feat_/.test(c.id)) k = 'f:' + c.id.replace(/^feat_/, '').replace(/_up$/, '');
    else if (c.def && c.def.w24 !== undefined && WEAPONS[c.def.sigOf || c.def.id || '']) k = 'w:' + (c.def.sigOf || c.def.id);
    else if (req && req.xbr && req.xbr.w) { const wid = crWKey(req.xbr.w), S = WUP[wid], L = S && ['A', 'B', 'C'].find(x => S[x] && S[x].name === c.title); k = L ? 'b:' + wid + ':' + L : 'wb:' + wid + ':' + c.title; }
    const note = k ? crNote(k, { w: (req && req.xbr && req.xbr.w) || null }) : '';
    if (note) c.desc = (c.desc || '') + ' [rules: ' + note + ']';
  }
  if (G.crHeldBack.length && cs[0]) cs[0].desc = (cs[0].desc || '') + ' [held back: ' + [...new Set(G.crHeldBack)].slice(0, 6).join(', ') + ']';
  return cs;
})(genLoot);
