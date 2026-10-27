'use strict';
// Spawn Prawn - stat bonuses and weapon base stats (user, 23 Oct).
//  - SIXTEEN STATS (ST_DEF): Bullet Damage, Rate of Fire, Crit Chance, Crit Bonus, Magazine Size, Reload Speed, Bullet
//    Range, Feat Power, Max Health, Health Regeneration, Shell, Membrane, Move Speed, XP Bonus, Traction, Acceleration.
//  - MODIFIERS: every weapon modifier card taken (and Switched at Birth) also banks a small bonus in one stat (ST_MOD),
//    shown on the card. Bonuses stay for the run even if the modifier is later swapped out. Totals in G.stb.
//    Most go straight into G.P (haste, crit, critDmg, magMult, reloadSpd, range, maxHp, regen, speed, xp, traction, accel);
//    Bullet Damage (weapons only) and Feat Power (Feats only) multiply w.s.dmg in computeStats; Shell takes a flat amount
//    off every hit that gets through (pdefHurt, never below half the hit or 1); Membrane adds a share of max health to
//    the Membrane (pdef.js pdMemFrac), so it soaks hits even without a shield.
//  - WEAPON BASE STATS (ST_W): each of the 27 matrix weapons gets its own shape (fire rate, magazine, reload, crit chance,
//    crit bonus, range) and its damage is rescaled so sustained expected damage per second stays what it was
//    (stNorm: shots per second over a full magazine and reload, times the crit average, times a reach trade).
//    Base crit chance is b.critBonus (on top of P.crit), the base crit bonus b.critX (added to P.critDmg for its hits).
//    The weapon draft (weapon select) shows them (stBaseHtml); the pause BUILD tab lists your bonus totals.
// Hooks: game.js updatePlayer swim thrust reads P.accel; pdef.js pdMemFrac -> stMemFrac. Wraps computeStats, fightHit,
// pdefHurt, modAdd, modCard, sabCard, UI.boonHtml, UI.renderDraft, bpHtml, runSummary, runText (a stats line). Loads after areamod.js.

const ST_DEF = {
  dmg:      { name: 'Bullet Damage',       k: 0.03,  fmt: 'pct' },
  rof:      { name: 'Rate of Fire',        k: 0.03,  fmt: 'pct',  P: 'haste' },
  crit:     { name: 'Crit Chance',         k: 0.015, fmt: 'pct',  P: 'crit' },
  critX:    { name: 'Crit Bonus',          k: 0.08,  fmt: 'pct',  P: 'critDmg' },
  mag:      { name: 'Magazine Size',       k: 0.06,  fmt: 'pct',  P: 'magMult' },
  reload:   { name: 'Reload Speed',        k: 0.05,  fmt: 'pct',  P: 'reloadSpd' },
  range:    { name: 'Bullet Range',        k: 0.05,  fmt: 'pct',  P: 'range' },
  feat:     { name: 'Feat Power',          k: 0.05,  fmt: 'pct' },
  hp:       { name: 'Max Health',          k: 5,     fmt: 'flat' },
  regen:    { name: 'Health Regeneration', k: 0.15,  fmt: 'rate', P: 'regen' },
  shell:    { name: 'Shell',               k: 1,     fmt: 'flat' },
  membrane: { name: 'Membrane',            k: 0.03,  fmt: 'pct' },
  speed:    { name: 'Move Speed',          k: 0.03,  fmt: 'pct',  P: 'speed' },
  xp:       { name: 'XP Bonus',            k: 0.05,  fmt: 'pct',  P: 'xp' },
  traction: { name: 'Traction',            k: 0.05,  fmt: 'pct',  P: 'traction' },
  accel:    { name: 'Acceleration',        k: 0.06,  fmt: 'pct',  P: 'accel' },
};
const ST_ORDER = Object.keys(ST_DEF);
// Which stat each modifier card adds to (one rank, one bonus). Every stat has at least one way in.
const ST_MOD = {
  piercing: 'dmg', explode: 'dmg', rapid: 'rof', homing: 'crit', primer: 'crit', charged: 'critX', focus: 'critX',
  mines: 'mag', extra: 'mag', ranged: 'reload', connecting: 'reload', range: 'range', catalyst: 'feat', nth: 'feat',
  upclose: 'hp', kinship: 'regen', area: 'regen', knock: 'shell', melee: 'shell', sticky: 'membrane', orbiting: 'membrane',
  dfa: 'speed', turncoat: 'xp', switch: 'xp', pull: 'traction', ricochet: 'accel',
  returning: 'range', // (back in the matrix from v10.140; 'range' is what the stFor fallback already gave it, so cards bank the same)
};
const ST_FALLBACK = ['dmg', 'rof', 'crit', 'critX', 'mag', 'reload', 'range', 'feat']; // (modifiers outside the matrix: a weapon stat by id)
const stFor = id => ST_MOD[id] || ST_FALLBACK[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % ST_FALLBACK.length];

// ---------------------------------------------------------------- the bank
const stb = () => (G.stb || (G.stb = {}));
function stGain(k, n) {
  const D = ST_DEF[k]; if (!D || !G) return;
  const v = D.k * (n || 1), B = stb(), P = G.P;
  B[k] = (B[k] || 0) + v;
  if (D.P) P[D.P] = (P[D.P] == null ? (D.P === 'accel' ? 1 : 0) : P[D.P]) + v;
  if (k === 'hp') { P.maxHp += v; G.player.hp += v; }
  if (G.weapons) recomputeAll();
}
const stVal = k => (G && G.stb && G.stb[k]) || 0;
const stMemFrac = () => stVal('membrane');
function stFmt(k, v) {
  const D = ST_DEF[k], r = x => Math.round(x * 10) / 10;
  if (D.fmt === 'pct') return '+' + r(v * 100) + '%';
  if (D.fmt === 'rate') return '+' + r(v) + '/s';
  return '+' + r(v);
}
// Your current value of a stat, and what it would be after n more steps (cards show "Crit Chance 5% → 8%", user 26 Oct).
function stNow(k, add) {
  const D = ST_DEF[k], P = (G && G.P) || {}, r = x => Math.round(x * 10) / 10;
  let v;
  if (k === 'hp') v = P.maxHp || 0;
  else if (k === 'crit' || k === 'regen') v = P[D.P] || 0;
  else if (k === 'critX') v = (P.critDmg || ST_X0) - 1;
  else if (k === 'shell' || k === 'membrane') v = stVal(k);
  else if (D.P) v = P[D.P] == null ? 1 : P[D.P];
  else v = 1 + stVal(k); // (Bullet Damage, Feat Power: a multiplier on the weapon or Feat)
  v += add || 0;
  if (k === 'critX') return '+' + r(v * 100) + '%';
  if (D.fmt === 'pct') return r(v * 100) + '%';
  if (D.fmt === 'rate') return r(v) + '/s';
  return String(Math.round(v * 10) / 10);
}
const stDelta = (k, n) => `${ST_DEF[k].name} ${stNow(k)} → ${stNow(k, ST_DEF[k].k * (n || 1))}`;
const stLine = k => stDelta(k, 1);

// ---------------------------------------------------------------- weapon base stats
// Shape per weapon: rof/mag/reload multiply the old values, crit adds to the chance, critX to the crit multiplier,
// range sets a new base range. Damage is then worked out by stNorm (dmgK: a correction from statuptest's dummy runs). Beams keep their tick rate; There Is No Spoon and
// Peekaboo keep their odd clocks (only crit moves).
const ST_W = {
  v_phys_proj:    { mag: 1.25, reload: 0.9 },                                    // Standard Issue: the reliable one
  v_fire_proj:    { rof: 1.25, mag: 1.5, range: 270, dmgK: 0.8 },                // Acid Spit: fast, close (more hits build Melting faster)
  v_arcane_proj:  { rof: 0.85, mag: 0.75, crit: 0.10, critX: 0.4, dmgK: 0.95 },  // Little Prick: precise (crits Bleed harder)
  v_soul_proj:    { rof: 0.9, reload: 1.1, crit: 0.05, critX: 0.2 },
  v_phys_spread:  { rof: 0.9, critX: 0.3 },
  acro_spray:     { rof: 1.15, mag: 1.5, crit: 0.03, dmgK: 0.5 },
  s_parasite:     { rof: 1.1, mag: 1.25, reload: 1.15, crit: 0.04 },
  s_siphon:       { crit: 0.08, critX: 0.2 },
  s_seeker:       { mag: 1.33, reload: 0.9, crit: 0.06 },
  v_shock_beam:   { mag: 1.2, reload: 1.1, crit: 0.02 },
  v_flame_beam:   { mag: 0.8, reload: 0.85, crit: 0.04, critX: 0.3 },
  acro_spark:     { mag: 1.5, crit: 0.03 },
  v_flame_pool:   { rof: 1.1, mag: 1.25 },
  v_ice_pool:     { rof: 0.9, reload: 0.85, crit: 0.03 },
  s_tesla:        { rof: 1.15, crit: 0.03, critX: 0.1 },
  s_redtape:      { reload: 0.9, crit: 0.06, critX: 0.3 },
  s_twin:         { rof: 0.9, crit: 0.10, critX: 0.5 },
  s_lard:         { crit: 0.04, critX: 0.2 },                     // (its throughput is not magazine-bound)
  v_phys_burst:   { crit: 0.05, critX: 0.25 },
  s_mines:        { mag: 1.2, reload: 0.9, crit: 0.02 },
  v_phys_contact: { rof: 1.1, crit: 0.05, critX: 0.2 },
  acro_cap:       { rof: 0.9, crit: 0.12, critX: 0.5, dmgK: 1.1 },
  s_void:         { mag: 1.5, reload: 1.1 },
  s_bubble:       { crit: 0.06, critX: 0.1 },                     // (nor is this one's)
  s_duedate:      { mag: 1.33, reload: 1.1, crit: 0.08, critX: 0.3 },
  s_peekaboo:     { crit: 0.15, critX: 0.6 },
  s_toothfairy:   { mag: 1.33, reload: 1.15, crit: 0.04 },
};
const ST_C0 = 0.05, ST_X0 = 1.6; // (newStats: base crit chance and crit multiplier)
const stReach = (d, r) => (r > REACH_START && !REACH_FREE.has(d.kind) ? REACH_START : r || 0);
// Sustained shots a second: a full magazine at the fire rate, then the reload.
const stRate = b => { const cd = Math.max(0.01, b.cd || 1), mag = b.mag || 1; return b.reload > 0 ? mag / (mag * cd + b.reload) : 1 / cd; };
const stEV = b => 1 + (ST_C0 + (b.critBonus || 0)) * (ST_X0 + (b.critX || 0) - 1);
function stNorm(d, b0, sh) {
  const b = Object.assign({}, b0);
  if (sh.rof) b.cd = b0.cd / sh.rof;
  if (sh.mag && b0.mag > 1) b.mag = Math.max(1, Math.round(b0.mag * sh.mag));
  if (sh.reload && b0.reload > 0) b.reload = Math.round(b0.reload * sh.reload * 100) / 100;
  if (sh.crit) b.critBonus = (b0.critBonus || 0) + sh.crit;
  if (sh.critX) b.critX = (b0.critX || 0) + sh.critX;
  if (sh.range) b.range = sh.range;
  const reachK = Math.sqrt(Math.max(1, stReach(d, b0.range)) / Math.max(1, stReach(d, b.range))); // (shorter reach, a little more punch)
  const k = (stRate(b0) * stEV(b0)) / (stRate(b) * stEV(b)) * reachK * (sh.dmgK || 1), dm = b0.dmg * k;
  b.dmg = dm < 20 ? Math.round(dm * 10) / 10 : Math.round(dm);
  b.stOld = b0; // (the old base, for tests and the balance check)
  return b;
}
const ST = { on: true, done: false };
function stApplyBases() {
  if (ST.done || !ST.on) return;
  for (const id in ST_W) { const d = WEAPONS[id]; if (d && d.base) d.base = stNorm(d, d.base, ST_W[id]); }
  ST.done = true;
}
stApplyBases();

// The weapon's base stats as the draft shows them.
function stBase(d) {
  const b = d.base || {}, n = b.count > 1 ? ' ×' + b.count : '', f = x => (Math.round(x * 10) / 10).toString();
  return [
    ['Bullet Damage', f(b.dmg || 0) + n],
    ['Rate of Fire', f(1 / Math.max(0.01, b.cd || 1)) + '/s'],
    ['Crit Chance', Math.round((ST_C0 + (b.critBonus || 0)) * 100) + '%'],
    ['Crit Bonus', '+' + Math.round((ST_X0 + (b.critX || 0) - 1) * 100) + '%'],
    ['Magazine Size', String(b.mag || 1)],
    ['Reload Speed', b.reload > 0 ? f(b.reload) + ' s' : 'none'],
    ['Bullet Range', String(Math.round(stReach(d, b.range)))],
  ];
}
const stBaseHtml = d => `<h4>BASE STATS</h4><div class="stBase">${stBase(d).map(([k, v]) => `<span>${esc(k.toUpperCase())}</span><b>${esc(v)}</b>`).join('')}</div>`;

// ---------------------------------------------------------------- wiring
computeStats = (orig => function (w) {
  orig(w);
  if (!G || !G.stb || !w || !w.s) return;
  const k = w.isSpell ? stVal('feat') : stVal('dmg');
  if (k) w.s.dmg *= 1 + k;
})(computeStats);
fightHit = (orig => function (e, d, src, crit) { // (the weapon's own crit bonus rides on top of yours for its hits)
  const x = crit && src && src.w && src.w.def && src.w.def.base ? src.w.def.base.critX || 0 : 0;
  if (!x) return orig(e, d, src, crit);
  G.P.critDmg += x;
  try { return orig(e, d, src, crit); } finally { G.P.critDmg -= x; }
})(fightHit);
pdefHurt = (orig => function (dmg, from, ent, kind) {
  const d = orig(dmg, from, ent, kind), sh = stVal('shell');
  return d > 0 && sh > 0 ? Math.max(d * 0.5, Math.min(d, 1), d - sh) : d;
})(pdefHurt);
modAdd = (orig => function (w, id) {
  const ok = orig(w, id);
  if (ok && G) stGain(stFor(id));
  return ok;
})(modAdd);
modCard = (orig => function (w, id) { const c = orig(w, id); if (c) c.stUp = stFor(id); return c; })(modCard);
sabCard = (orig => function () {
  const c = orig(); if (!c) return c;
  const a = c.apply; c.stUp = stFor('switch'); c.apply = function () { const r = a.apply(this, arguments); stGain(c.stUp); return r; };
  return c;
})(sabCard);
UI.boonHtml = (orig => function (o) { return orig.call(this, o) + (o && o.stUp && ST_DEF[o.stUp] ? `<div class="stUp">${esc(stLine(o.stUp))}</div>` : ''); })(UI.boonHtml);
UI.renderDraft = (orig => function () {
  orig.apply(this, arguments);
  const D = UI.draft, o = D && UI.lootOpts[D.i];
  if (!D || D.weap || !o || !o.def || !o.def.base) return;
  const bars = $('dInfo').querySelector('.dbars');
  if (bars) bars.insertAdjacentHTML('afterend', stBaseHtml(o.def));
})(UI.renderDraft);
if (typeof bpHtml === 'function') bpHtml = (orig => function () {
  let h = orig.apply(this, arguments);
  const B = (G && G.stb) || {}, ks = ST_ORDER.filter(k => B[k] > 0);
  if (ks.length) h += `<h3 class="bp-h">Stat bonuses</h3>${uiTiles(ks.map(k => uiTile(esc(stFmt(k, B[k])), esc(ST_DEF[k].name))).join(''))}`;
  return h;
})(bpHtml);
// The run log: your bonus totals under the build line (" stats: +9% Rate of Fire, +10 Max Health").
runSummary = (orig => function (G, result) {
  const r = orig(G, result), B = (G && G.stb) || {};
  r.stb = ST_ORDER.filter(k => B[k] > 0).map(k => `${stFmt(k, B[k])} ${ST_DEF[k].name}`);
  return r;
})(runSummary);
runText = (orig => function (r) {
  const out = orig(r);
  return r && r.stb ? out.replace(/( build: [^\n]*\n)/, `$1 stats: ${r.stb.join(', ') || '-'}\n`) : out;
})(runText);
