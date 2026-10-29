'use strict';
// Spawn Prawn - weapon levels from the weapon's own kills, and modifier screens between the branch tiers (user, 26 Oct).
//  - KILL BAR: each weapon fills its own bar with its own kills (src.w on the kill hook), plus assists and catch-up (wmCredit). A full bar opens that weapon's
//    next level screen (WM.need: kills from Lv L to L+1). Shown as a thin bar under the slot's ammo bar on the HUD.
//  - SCREENS, in the Weapon Draft layout (tabs, details, stage): Lv 3, 6 and 9 are the branch screens (branchback.js:
//    promise, branch, mastery; one weapon mastery a run). Every other level (2, 4, 5, 7, 8) is a MODIFIER SCREEN:
//    WM.cards modifier cards for that weapon only (new ones, rank-ups, masteries, Switched at Birth), with REROLL (one of
//    your rerolls) and SKIP (+2 rerolls, no level: the bar empties and has to fill again). Taking a card levels the
//    weapon (modmatrix.js modAdd; a branch card here). Past Lv 9 a full bar still opens a modifier screen (no level).
//  - LEVEL-UPS AND DNA STRANDS no longer deal modifier cards or Switched at Birth: they deal Feats, sperm passives,
//    defences and small stat cards (WM_STAT: steps of one statup.js stat, more the rarer the card: WM.statSteps). The free weapon level every 4th player
//    level (modmatrix.js MM.freeEvery) is off.
//  - THE STAGE: one drawn loop per modifier (WMV_SCENE), drawn with the weapon's own type colour and attack type
//    (a projectile, a spread, a beam, a contact swipe, a burst or a puddle: wmvKit K.shot).
//  Off in tests and sims (window.TUT_OFF) unless WM.force, and in the Sandbox.
// Hooks: none in shared files. hookOn('kill', 'wmKill'), hookOn('hit:late', 'wmods:hit'), hookOn('tick', 'wmods:tick'). Wraps branchback.js xbrTick (off while this runs), draft.js
// forkCards, draftBox, sidemo.js sivDraftKind and sivDraftHead, sandbox.js sbDraftInfo (the details panel), preview.js
// makePreview (the modifier loops), modmatrix.js modDraftCands and wupLevel, modcards.js modBoxCards, UI.openDraft and
// UI.refreshHud. Loads last (after modpick.js and holdcopy.js).

const WM = { on: true, force: false, k0: 20, kg: 0.42, assist: 0.3, assistT: 3, catchK: 0.35, cards: 3, skipRerolls: 2, statN: 2, statW: 1.1, statSteps: [1.5, 2, 3, 4, 6, 8, 10] };
const wmOn = () => WM.on && !!G && !xbrTest(WM.force) && !(typeof sbOn === 'function' && sbOn());
const wmNeedL = l => Math.round(WM.k0 * (1 + WM.kg * (Math.min(MM.lvlCap, l || 1) - 1)));
const wmNeed = w => wmNeedL(w.lvl);
const wmLive = w => !!w && !w.isSpell && !!w.def && G.weapons.includes(w);
let wmIn = 0; // (inside a modifier screen's deal: modifier candidates allowed)

// ---------------------------------------------------------------- the kill bar
// Catch-up (user, 26 Oct: lower weapons could not catch up): every weapon that hit the enemy in the last WM.assistT s
// gets WM.assist of a kill, and each level a weapon sits below your highest weapon adds WM.catchK to its credit.
// Leaks closed (user, 26 Oct run log): kills keep banking while the weapon's screen waits (wave mode holds it to the
// wave's end; wmDone carries the overflow, up to one bar), a kill with no weapon (a burn or bleed tick, a reaction, an
// arc) goes in full to the last weapon that hit it within WM.assistT, and turrets count for their weapon (src.wmW).
const wmW = src => src && (src.w || src.wmW);
function wmCredit(w, n, top) {
  if (!wmLive(w)) return;
  w.wmK = Math.min(2 * wmNeed(w), (w.wmK || 0) + n * (1 + WM.catchK * Math.max(0, top - (w.lvl || 1))));
  if (!w.wmQ && w.wmK >= wmNeed(w)) wmQueue(w);
}
function wmKill(e, src) {
  if (!wmOn()) return;
  const top = Math.max(1, ...G.weapons.map(x => x && !x.isSpell ? x.lvl || 1 : 1));
  let w = wmW(src);
  if (!w && !(src && src.w) && e.wmHit) { let tb = -9; for (const [x, t] of e.wmHit) if (t > tb && G.t - t <= WM.assistT) { tb = t; w = x; } }
  if (wmLive(w)) wmCredit(w, 1, top);
  if (e.wmHit) for (const [x, t] of e.wmHit) if (x !== w && G.t - t <= WM.assistT) wmCredit(x, WM.assist, top);
}
hookOn('kill', 'wmKill', (e, src) => wmKill(e, src));
hookOn('hit:late', 'wmods:hit', (e, d, src) => { const w = wmOn() && wmW(src); if (w && !w.isSpell) (e.wmHit || (e.wmHit = new Map())).set(w, G.t); });
hookOn('tick', 'wmods:tick', () => {
  if (!wmOn() || G.state !== 'play') return;
  for (const tu of G.turrets || []) if (tu.w && tu.src && !tu.src.wmW) tu.src.wmW = tu.w; // (game.js turrets carry w, not src.w)
  for (const w of G.weapons) if (wmLive(w) && !w.wmQ && (w.wmK || 0) >= wmNeed(w)) wmQueue(w); // (a carried-over full bar)
});
// The next screen for w: a branch screen if Lv+1 is a branch tier it still has cards for, else a modifier screen.
function wmBranch(w) {
  const S = typeof WUP !== 'undefined' && WUP[w24Key(w)], to = (w.lvl || 1) + 1;
  if (!S) return null;
  const U = wupUp(w), step = !U.p ? 0 : !U.l6 ? 1 : !U.l10 ? 2 : 3;
  if (step >= 3 || to !== XBR.at[step]) return null;
  if (step === 2 && (!S.lv10 || (G.xbrMast && G.xbrMast !== w))) return null;
  const lv = [3, 6, 10][step];
  return (wupForkCards({ w, lv }) || []).length ? lv : null;
}
function wmQueue(w) {
  w.wmQ = true;
  const lv = wmBranch(w);
  G.lootQueue.push(lv ? { kind: 'fork', v10ok: true, xbr: { w, lv }, wm: { w } } : { kind: 'fork', v10ok: true, wm: { w } });
}
// A screen closes: the bar empties (less any overflow), and a pick (l0: the level before it) leaves the weapon exactly one level up, to Lv 9.
// (Exactly: a branch card that grants a modifier, or a modifier that ranks up, would otherwise level it twice.)
function wmDone(w, l0) {
  w.wmQ = false;
  if (l0 == null) { w.wmK = 0; return; } // (SKIP: the bar starts again)
  const to = l0 < MM.lvlCap ? l0 + 1 : l0;
  w.wmK = Math.min(wmNeedL(to), Math.max(0, (w.wmK || 0) - wmNeedL(l0))); // (kills banked while the screen waited carry over)
  if (w.lvl !== to) { w.lvl = to; computeStats(w); recomputeAll(); }
}
const wmPicked = (w, ap) => (...a) => { const l0 = w.lvl || 1; ap(...a); wmDone(w, l0); };
// Weapons stop at Lv 9 under the modifier matrix (MM.lvlCap); game.js wCap still said the v9 Lv 10, so Trophy Polish
// (spoils.js) could raise a weapon to Lv 10. Off in the Sandbox, which keeps the old tiers.
wCap = (orig => function (w) { const c = orig(w); return MM.on && w && !w.isSpell && !(typeof sbOn === 'function' && sbOn()) ? Math.min(c, MM.lvlCap) : c; })(wCap);
// Trophy Polish under the kill bar: every weapon's bar fills, so each level still comes through its own screen (a raw
// level would skip a branch tier for good: wmBranch only offers a tier on the level it opens at).
{
  const tp = SPOILS.trophy;
  SPOILS.trophy = () => {
    const o = tp(), ap = o.apply;
    o.apply = () => { if (!wmOn()) return ap(); for (const w of G.weapons) if (wmLive(w) && !w.wmQ && w.lvl < wCap(w)) wmQueue(w); };
    return o;
  };
}
xbrTick = (orig => function () { if (!wmOn()) orig(); })(xbrTick); // (the bar queues the branch screens now)
wupLevel = (orig => function (lv) {
  if (!wmOn()) return orig(lv);
  const k = MM.freeEvery; MM.freeEvery = 0;
  try { return orig(lv); } finally { MM.freeEvery = k; }
})(wupLevel);

// ---------------------------------------------------------------- modifier cards: only on the weapon's own screen
function wmCards(w) {
  if (!wmLive(w)) return [];
  const keep = G.weapons;
  let cand = [];
  wmIn++;
  try {
    G.weapons = [w]; // (every modDraftCands wrap deals for this weapon alone; each card's apply checks the real list later)
    const pool = modDraftCands('wm');
    const out = [], fams = new Set();
    while (out.length < WM.cards && pool.length) {
      const tot = pool.reduce((a, c) => a + c.w, 0);
      let x = Math.random() * tot, i = 0;
      for (; i < pool.length - 1; i++) { x -= pool[i].w; if (x <= 0) break; }
      const c = pool.splice(i, 1)[0];
      if (fams.has(c.fam)) continue;
      fams.add(c.fam);
      const k = c.o(); if (k) out.push(k);
    }
    cand = out;
  } finally { G.weapons = keep; wmIn--; }
  return cand.map(c => Object.assign(c, { wmId: (c.family || c.card || '').replace(/^mod:/, ''), apply: wmPicked(w, c.apply) }));
}
modDraftCands = (orig => function (kind) {
  if (!wmOn() || wmIn) return orig(kind);
  return wmStatCands(); // (level-ups and DNA strands: stat cards in the modifiers' place)
})(modDraftCands);
modBoxCards = (orig => function (n) { return wmOn() && !wmIn ? [] : orig(n); })(modBoxCards);

// Small stat cards for level-ups: two steps of one stat (statup.js).
const WM_STAT = ['dmg', 'rof', 'crit', 'critX', 'mag', 'reload', 'range', 'feat', 'hp', 'regen', 'shell', 'membrane', 'speed', 'xp', 'traction', 'accel'];
// Each card rolls its own rarity (game.js rollRarity, floored by a skipped box's boost); rarer cards give more steps
// (WM.statSteps by rarity index: Common 1.5, Uncommon 2 (the old fixed card), Rare 3, Epic 4, Legendary 6; the average deal
// stays about 2 steps, as before).
function wmStatRar() {
  const q = typeof UI !== 'undefined' && UI.lootReq, min = q && RAR_SKIP[q.kind] != null ? RAR_SKIP[q.kind] + (q.boost || 0) : 0;
  return Math.min(WM.statSteps.length - 1, rollRarity(Math.min(4, min)));
}
function wmStatCard(k) {
  const D = ST_DEF[k], rar = wmStatRar(), n = WM.statSteps[rar];
  return { card: 'stat:' + k, family: 'stat:' + k, rarity: rar, tag: 'STAT', icon: '+', color: '#9fb3c8', statN: n,
    elem: 'phys', title: D.name, sub: stFmt(k, D.k * n), desc: stDelta(k, n), quip: 'A small, measurable improvement. Logged.',
    apply: () => stGain(k, n) };
}
function wmStatCands() {
  const ks = WM_STAT.filter(k => ST_DEF[k] && !banished('stat:' + k));
  return ks.map(k => ({ o: () => wmStatCard(k), w: WM.statW / ks.length * famK('stat:' + k), fam: 'stat:' + k }));
}

// ---------------------------------------------------------------- the screen (draft.js fork requests)
forkCards = (orig => function (req) {
  if (!req.wm) return orig(req);
  const w = req.wm.w;
  if (req.xbr) return orig(req).map(c => Object.assign(c, { apply: wmPicked(w, c.apply) }));
  return wmCards(w);
})(forkCards);
draftBox = (orig => function (req) {
  if (!req.wm) return orig(req);
  const w = req.wm.w;
  if (!wmLive(w)) return false;
  if (!req.fixed) req.fixed = forkCards(req);
  if (!req.fixed.length && req.xbr) { delete req.xbr; req.fixed = forkCards(req); } // (no branch cards left: a modifier screen instead)
  if (!req.fixed.length) { wmDone(w, w.lvl || 1); return false; } // (nothing fits: the level comes free)
  return typeof dirGate === 'function' ? dirGate(req) : true;
})(draftBox);
sivDraftKind = (orig => function (req) {
  if (!req.wm || req.xbr) return orig(req);
  const w = req.wm.w;
  if (!wmLive(w)) return false;
  if (!req.fixed) req.fixed = forkCards(req);
  if (!req.fixed.length) return false;
  Object.assign(req, { kind: 'wupfork', w, lv: (w.lvl || 1) + 1 });
  return true;
})(sivDraftKind);
sivDraftHead = (orig => function (req, weap) {
  if (!req.wm || req.xbr) return orig(req, weap);
  for (const o of UI.lootOpts) o.perk = 'wm|' + (o.wmId || '') + '|' + (o.family === 'switch' ? o.color || '' : '');
  const L = weap.lvl || 1;
  $('dKick').textContent = `${weap.def.name.toUpperCase()} | ${L < MM.lvlCap ? `LV ${L} > ${L + 1}` : 'LV ' + L}`;
  $('dTitle').textContent = 'WEAPON MODIFIER';
  $('dSub').textContent = 'Choose one. Skip for 2 rerolls; the kill bar starts again.';
  return true;
})(sivDraftHead);
sbDraftInfo = (orig => function (D, o) {
  if (!D.req.wm || D.req.xbr) return orig(D, o);
  const w = D.weap, L = w.lvl || 1;
  const lv = Array.from({ length: MM.lvlCap }, (_, k) => `<i class="${k + 1 === L + 1 ? 'now' : k < L ? 'on' : ''}"></i>`).join('');
  return `<div class="dperk"><div class="drole">${esc(o.tag || '')}${o.sub ? ' | ' + esc(o.sub) : ''}</div><div class="pn">${esc(o.title)}</div><div class="pd">${esc(o.desc || '')}</div>${o.quip ? `<div class="pq">${esc(o.quip)}</div>` : ''}</div>`
    + `<h4>${esc(w.def.name.toUpperCase())}</h4><div class="dlv">${lv}</div>`;
})(sbDraftInfo);

// REROLL and SKIP under the CHOOSE button.
function wmBtn(id, fn) {
  let b = $(id);
  if (!b) { b = document.createElement('button'); b.id = id; b.className = 'btn'; b.addEventListener('click', fn); $('dPick').parentNode.appendChild(b); }
  return b;
}
const wmReq = () => G && G.state === 'loot' && UI.lootReq && UI.lootReq.wm && UI.draft && UI.draft.req === UI.lootReq ? UI.lootReq : null;
function wmReroll() {
  const req = wmReq();
  if (!req || req.xbr || G.rerolls <= 0 || performance.now() - UI.lootOpenT < 500) return;
  G.rerolls--;
  clearPreviews(); if (UI.draft.pv) { dropPreview(UI.draft.pv); UI.draft.pv = null; }
  const cards = wmCards(req.wm.w);
  if (!cards.length) return;
  req.fixed = UI.lootOpts = cards; UI.draft.i = 0;
  sivDraftHead(req, req.wm.w); UI.renderDraft(); wmBtns(req); sfx('pickup');
}
function wmSkip() {
  const req = wmReq();
  if (!req || performance.now() - UI.lootOpenT < 500) return;
  clearPreviews(); G.rerolls += WM.skipRerolls; sfx('pickup');
  wmDone(req.wm.w); // (no level: the bar starts again)
  if (typeof dirPicked === 'function') dirPicked();
  G.state = 'play'; UI.show('hud'); UI.refreshHud(true); lastTs = performance.now();
  if (typeof v11Chain === 'function') v11Chain();
}
function wmBtns(req) {
  const on = !!(req && req.wm);
  const r = wmBtn('dWmRoll', wmReroll), s = wmBtn('dWmSkip', wmSkip);
  r.style.display = on && !req.xbr ? '' : 'none'; s.style.display = on ? '' : 'none';
  if (!on) return;
  r.textContent = `REROLL (${G.rerolls} LEFT)`; r.disabled = G.rerolls <= 0;
  s.textContent = 'SKIP (+2 REROLLS)';
}
{
  const od = UI.openDraft;
  UI.openDraft = function (req) { od.call(UI, req); if (G && G.state === 'loot' && UI.lootReq === req) wmBtns(req); };
}

// ---------------------------------------------------------------- the HUD bar
{
  const rh = UI.refreshHud;
  UI.refreshHud = function (full) {
    rh.call(UI, full);
    if (!G || !wmOn()) return;
    const els = $('wslots').children;
    for (let i = 0; i < els.length; i++) {
      const w = G.weapons[i], el = els[i];
      let b = el.querySelector('.wmk');
      if (!b) { b = document.createElement('div'); b.className = 'wmk'; b.innerHTML = '<i></i>'; el.appendChild(b); }
      const f = w && !w.isSpell ? (w.wmQ ? 1 : clamp((w.wmK || 0) / wmNeed(w), 0, 1)) : 0;
      const pc = (f * 100).toFixed(0) + '%';
      if (b.dataset.f !== pc) { b.dataset.f = pc; b.firstChild.style.width = pc; }
      b.style.display = w && !w.isSpell ? '' : 'none';
    }
  };
}

// ---------------------------------------------------------------- the stage: one drawn loop per modifier
// Unit square scene: Spermy on the left, three cells on the right. Each scene draws one 2.4 s loop from u (0..1).
const WMV = { P: 2.4 };
const wmvL = (a, b, k) => a + (b - a) * k;
const wmvE = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k);
const wmvSeg = (u, a, b) => wmvE((u - a) / (b - a));
const WMV_CELLS = [[0.66, 0.3], [0.8, 0.52], [0.66, 0.74]];
function wmvKit(pv, g, W2, H2) {
  const X = x => x * W2, Y = y => y * H2, U = Math.min(W2, H2 * 1.6), atk = pv.def.v10atk || 'proj';
  const K = { g, X, Y, U, atk, col: pv.col, me: [0.24, 0.5] };
  K.cell = (x, y, hit, col) => {
    g.fillStyle = hit > 0 ? '#ffffff' : col || '#5a6068'; g.globalAlpha = 1;
    g.beginPath(); g.arc(X(x), Y(y), U * 0.045, 0, TAU); g.fill();
    g.strokeStyle = col ? col : '#c9d1d9'; g.lineWidth = 1.5; g.stroke();
  };
  K.cells = (hits, pos) => (pos || WMV_CELLS).forEach((p, i) => K.cell(p[0], p[1], hits ? hits[i] : 0));
  K.spermy = (x, y, a) => {
    x = x == null ? K.me[0] : x; y = y == null ? K.me[1] : y; a = a || 0;
    const hr = U * 0.03, hx = X(x), hy = Y(y);
    g.globalAlpha = 1; g.strokeStyle = PAL.you; g.lineWidth = Math.max(1, U * 0.006); g.lineCap = 'round';
    g.beginPath(); g.moveTo(hx - Math.cos(a) * hr, hy - Math.sin(a) * hr);
    for (let k = 1; k <= 6; k++) { const d = hr + k * hr * 0.5; g.lineTo(hx - Math.cos(a) * d + Math.sin(pv.t * 12 + k) * hr * 0.25 * -Math.sin(a), hy - Math.sin(a) * d + Math.sin(pv.t * 12 + k) * hr * 0.25 * Math.cos(a)); }
    g.stroke(); g.fillStyle = PAL.you; g.beginPath(); g.ellipse(hx, hy, hr, hr * 0.75, a, 0, TAU); g.fill();
  };
  K.ring = (x, y, r, al, col, lw) => { g.globalAlpha = Math.max(0, al); g.strokeStyle = col || K.col; g.lineWidth = lw || 2; g.beginPath(); g.arc(X(x), Y(y), U * r, 0, TAU); g.stroke(); g.globalAlpha = 1; };
  K.dot = (x, y, r, col, al) => { g.globalAlpha = al == null ? 1 : al; g.fillStyle = col || K.col; g.beginPath(); g.arc(X(x), Y(y), U * r, 0, TAU); g.fill(); g.globalAlpha = 1; };
  K.line = (x1, y1, x2, y2, col, lw, al, dash) => { g.globalAlpha = al == null ? 1 : al; g.strokeStyle = col || K.col; g.lineWidth = lw || 2; if (dash) g.setLineDash(dash); g.beginPath(); g.moveTo(X(x1), Y(y1)); g.lineTo(X(x2), Y(y2)); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; };
  // The weapon's own attack, drawn at (x, y) heading a: its attack type decides the shape.
  K.shot = (x, y, a, s, col, fx, fy) => {
    s = s || 1; col = col || K.col; a = a || 0;
    const r = 0.016 * s;
    if (atk === 'beam') { K.line(fx == null ? K.me[0] : fx, fy == null ? K.me[1] : fy, x, y, col, U * 0.012 * s, 0.85); K.dot(x, y, r * 1.3, col); }
    else if (atk === 'spread') { const px = -Math.sin(a), py = Math.cos(a); for (const k of [-1, 0, 1]) K.dot(x + px * k * r * 1.8 - Math.cos(a) * Math.abs(k) * r, y + py * k * r * 1.8 - Math.sin(a) * Math.abs(k) * r, r * 0.7, col); }
    else if (atk === 'contact') { g.strokeStyle = col; g.lineWidth = U * 0.01 * s; g.beginPath(); g.arc(X(x), Y(y), U * r * 2.2, a - 1.1, a + 1.1); g.stroke(); }
    else if (atk === 'burst') { K.ring(x, y, r * 2, 0.8, col, 2); K.dot(x, y, r * 0.9, col); }
    else if (atk === 'pool') { g.globalAlpha = 0.6; g.fillStyle = col; g.beginPath(); g.ellipse(X(x), Y(y), U * r * 1.8, U * r * 1.2, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
    else { K.line(x - Math.cos(a) * r * 2.5, y - Math.sin(a) * r * 2.5, x, y, col, U * r * 1.1, 0.5); K.dot(x, y, r, col); }
  };
  K.fly = (u, a, b, x1, y1, x2, y2, s, col) => { if (u < a || u > b) return null; const k = (u - a) / (b - a), x = wmvL(x1, x2, k), y = wmvL(y1, y2, k); K.shot(x, y, Math.atan2(y2 - y1, x2 - x1), s, col); return [x, y]; };
  K.boom = (x, y, u, a, b, r, col) => { if (u < a || u > b) return; const k = (u - a) / (b - a); K.ring(x, y, (r || 0.08) * (0.3 + k), 1 - k, col, 3); };
  return K;
}
const wmvHit = (u, at, d) => (u >= at && u < at + (d || 0.08) ? 1 : 0);
const [WC0, WC1, WC2] = WMV_CELLS;
const WMV_SCENE = {
  homing: (K, u) => { K.cells([0, wmvHit(u, 0.62), 0]); if (u < 0.62) { const k = u / 0.62, x = (1 - k) * (1 - k) * K.me[0] + 2 * k * (1 - k) * 0.45 + k * k * WC1[0], y = (1 - k) * (1 - k) * K.me[1] + 2 * k * (1 - k) * 0.08 + k * k * WC1[1]; K.shot(x, y, Math.atan2(WC1[1] - y, WC1[0] - x) - (1 - k)); } K.spermy(); },
  piercing: (K, u) => { const P = [[0.48, 0.5], [0.64, 0.5], [0.8, 0.5]]; const x = wmvL(K.me[0], 1.02, u / 0.7); K.cells(P.map(p => Math.abs(x - p[0]) < 0.03 ? 1 : 0), P); if (u < 0.7) K.shot(x, 0.5, 0, 1.2 - 0.4 * (x - 0.3)); K.spermy(); },
  chaining: (K, u) => { K.cells([wmvHit(u, 0.35, 0.5), wmvHit(u, 0.5, 0.35), wmvHit(u, 0.65, 0.2)]); K.fly(u, 0, 0.35, K.me[0], K.me[1], WC0[0], WC0[1]); if (u > 0.35 && u < 0.85) { K.line(WC0[0], WC0[1], WC1[0], WC1[1], K.col, 2, 1 - (u - 0.35) * 1.6, [4, 3]); } if (u > 0.5 && u < 0.85) K.line(WC1[0], WC1[1], WC2[0], WC2[1], K.col, 2, 1 - (u - 0.5) * 2.4, [4, 3]); K.spermy(); },
  ricochet: (K, u) => { K.cells([wmvHit(u, 0.3), wmvHit(u, 0.5), wmvHit(u, 0.7)]); K.fly(u, 0, 0.3, K.me[0], K.me[1], WC0[0], WC0[1]) || K.fly(u, 0.3, 0.5, WC0[0], WC0[1], WC1[0], WC1[1]) || K.fly(u, 0.5, 0.7, WC1[0], WC1[1], WC2[0], WC2[1]) || K.fly(u, 0.7, 0.9, WC2[0], WC2[1], 0.95, 0.95); K.spermy(); },
  returning: (K, u) => { const c = [0.6, 0.5], k = u < 0.45 ? wmvE(u / 0.45) : 1 - wmvE((u - 0.45) / 0.45), x = wmvL(K.me[0] + 0.04, 0.92, Math.max(0, k)); K.cells([Math.abs(x - c[0]) < 0.03 ? 1 : 0], [c]); if (u < 0.9) K.shot(x, 0.5 + Math.sin(k * Math.PI) * 0.06, u < 0.45 ? 0 : Math.PI); K.spermy(); },
  orbiting: (K, u) => { const P = [[0.42, 0.3], [0.48, 0.68]]; const a0 = u * TAU; const sh = [0, 1, 2].map(i => [K.me[0] + Math.cos(a0 + i * TAU / 3) * 0.17, K.me[1] + Math.sin(a0 + i * TAU / 3) * 0.27]); K.cells(P.map(p => sh.some(s => Math.hypot(s[0] - p[0], (s[1] - p[1]) * 0.6) < 0.05) ? 1 : 0), P); sh.forEach((s, i) => K.shot(s[0], s[1], a0 + i * TAU / 3 + Math.PI / 2, 0.8)); K.spermy(); },
  delayed: (K, u) => { const t = [0.55, 0.5], cy = wmvL(0.1, 0.9, u); K.cells([u > 0.5 && u < 0.6 ? 1 : 0], [[0.55, cy]]); if (u < 0.15) K.fly(u, 0, 0.15, K.me[0], K.me[1], t[0], t[1]); else if (u < 0.5) { K.dot(t[0], t[1], 0.014, Math.floor(u * 14) % 2 ? K.col : '#fff'); K.ring(t[0], t[1], 0.06, 0.25); } K.boom(t[0], t[1], u, 0.5, 0.75, 0.1); K.spermy(); },
  lobbed: (K, u) => { K.cells([0, wmvHit(u, 0.6, 0.15), 0]); if (u < 0.6) { const k = u / 0.6, x = wmvL(K.me[0], WC1[0], k), y = wmvL(K.me[1], WC1[1], k) - Math.sin(k * Math.PI) * 0.35; K.dot(wmvL(K.me[0], WC1[0], k), wmvL(K.me[1], WC1[1], k) + 0.03, 0.012, '#000', 0.5); K.shot(x, y, 0, 1 + Math.sin(k * Math.PI) * 0.6); } K.boom(WC1[0], WC1[1], u, 0.6, 0.85, 0.1); K.spermy(); },
  trail: (K, u) => { const y = 0.5 + Math.sin(u * TAU) * 0.28, x = 0.25 + u * 0.15; for (let k = 0; k < 10; k++) { const v = u - k * 0.04; if (v < 0) break; K.g.globalAlpha = 0.45 * (1 - k / 10); K.g.fillStyle = K.col; K.g.beginPath(); K.g.ellipse(K.X(0.25 + v * 0.15), K.Y(0.5 + Math.sin(v * TAU) * 0.28), K.U * 0.03, K.U * 0.02, 0, 0, TAU); K.g.fill(); } K.g.globalAlpha = 1; const c = [0.4, wmvL(0.85, 0.15, u)]; K.cells([Math.abs(c[1] - (0.5 + Math.sin((c[0] - 0.25) / 0.15 * TAU) * 0.28)) < 0.08 ? 1 : 0], [c]); K.spermy(x, y, Math.atan2(Math.cos(u * TAU) * 0.28 * TAU, 0.15)); },
  selfcentred: (K, u) => { const P = [[0.4, 0.3], [0.44, 0.7], [0.7, 0.5]]; const r = (u % 0.5) / 0.5 * 0.32; K.cells(P.map(p => Math.abs(Math.hypot(p[0] - K.me[0], (p[1] - K.me[1]) * 0.6) - r) < 0.03 ? 1 : 0), P); K.ring(K.me[0], K.me[1], r, 1 - r / 0.32, K.col, 4); K.spermy(); },
  sweep: (K, u) => { const a = wmvL(-0.9, 0.9, u < 0.5 ? wmvE(u * 2) : 1 - wmvE((u - 0.5) * 2)), x = K.me[0] + Math.cos(a) * 0.55, y = K.me[1] + Math.sin(a) * 0.55 * 1.4; K.cells(WMV_CELLS.map(p => Math.abs(Math.atan2((p[1] - K.me[1]) / 1.4, p[0] - K.me[0]) - a) < 0.08 ? 1 : 0)); K.shot(x, y, a, 1.2, null, K.me[0], K.me[1]); K.spermy(K.me[0], K.me[1], a); },
  anchored: (K, u) => { const A = [0.45, 0.18], B = [0.45, 0.82], cx = wmvL(0.95, 0.25, u); K.line(A[0], A[1], B[0], B[1], K.col, 2, 0.7); for (let k = 0; k < 5; k++) K.shot(0.45, wmvL(0.25, 0.75, k / 4), Math.PI / 2, 0.6); K.dot(A[0], A[1], 0.012, '#fff'); K.dot(B[0], B[1], 0.012, '#fff'); K.cells([Math.abs(cx - 0.45) < 0.04 ? 1 : 0], [[cx, 0.5]]); K.spermy(0.26, 0.5); },
  volley: (K, u) => { K.cells([0, wmvHit(u, 0.4, 0.2), 0]); for (let k = 0; k < 3; k++) K.fly(u, k * 0.07, 0.4 + k * 0.07, K.me[0], K.me[1], WC1[0], WC1[1]); K.spermy(); },
  nth: (K, u) => { K.cells([0, [0.25, 0.5, 0.75, 1].some(t => wmvHit(u % 1, t * 0.8 + 0.12, 0.05)) ? 1 : 0, 0]); for (let k = 0; k < 4; k++) K.fly(u, k * 0.2, k * 0.2 + 0.15, K.me[0], K.me[1], WC1[0], WC1[1], k === 3 ? 2.4 : 0.8); if (u > 0.6 && u < 0.75) K.ring(K.me[0], K.me[1], 0.05 * (1 - (u - 0.6) * 6), 0.8); K.boom(WC1[0], WC1[1], u, 0.75, 0.95, 0.1); K.spermy(); },
  growing: (K, u) => { K.cells([0, wmvHit(u, 0.7, 0.12), 0]); K.fly(u, 0, 0.7, K.me[0], K.me[1], WC1[0], WC1[1], 0.6 + u * 3); K.spermy(); },
  scaling: (K, u) => { K.cells([0, [0.3, 0.6, 0.9].some(t => wmvHit(u, t, 0.06)) ? 1 : 0, 0]); for (let k = 0; k < 3; k++) { K.fly(u, k * 0.3, k * 0.3 + 0.3, K.me[0], K.me[1], WC1[0], WC1[1], 0.7 + k * 0.5); K.boom(WC1[0], WC1[1], u, k * 0.3 + 0.3, k * 0.3 + 0.42, 0.04 + k * 0.03); } K.spermy(); },
  multiplying: (K, u) => { K.cells([wmvHit(u, 0.75), wmvHit(u, 0.75), wmvHit(u, 0.75)]); const m = [0.42, 0.5]; K.fly(u, 0, 0.35, K.me[0], K.me[1], m[0], m[1], 1.2); if (u > 0.35 && u < 0.75) WMV_CELLS.forEach(p => K.fly(u, 0.35, 0.75, m[0], m[1], p[0], p[1], 0.8)); K.boom(m[0], m[1], u, 0.33, 0.45, 0.04); K.spermy(); },
  summoned: (K, u) => { const hx = K.me[0] + 0.08 + Math.cos(u * TAU) * 0.04, hy = K.me[1] - 0.22 + Math.sin(u * TAU) * 0.04; K.cells([wmvHit(u, 0.45), 0, wmvHit(u, 0.85)]); K.fly(u, 0.1, 0.45, hx, hy, WC0[0], WC0[1], 0.7); K.fly(u, 0.5, 0.85, K.me[0], K.me[1], WC2[0], WC2[1]); K.dot(hx, hy, 0.02, K.col); K.ring(hx, hy, 0.03, 0.6, '#fff', 1); K.spermy(); },
  gravity: (K, u) => { const c = [0.72, 0.5]; for (let k = 0; k < 3; k++) K.ring(c[0], c[1], 0.04 + ((u + k / 3) % 1) * 0.12, 0.25 + 0.3 * (1 - (u + k / 3) % 1)); const pull = wmvE(u / 0.8); K.cells([0, 0, 0], WMV_CELLS.map(p => [wmvL(p[0], c[0], pull * 0.75), wmvL(p[1], c[1], pull * 0.75)])); K.dot(c[0], c[1], 0.015, K.col); K.spermy(); },
  lunge: (K, u) => { const t = [0.62, 0.5], k = u < 0.3 ? wmvE(u / 0.3) : u < 0.5 ? 1 : 1 - wmvE((u - 0.5) / 0.4), x = wmvL(K.me[0], t[0] - 0.09, k); K.cells([u > 0.28 && u < 0.4 ? 1 : 0], [t]); for (let j = 1; j < 4 && u < 0.32; j++) K.dot(x - j * 0.03, 0.5, 0.01, PAL.you, 0.3 / j); if (u > 0.28 && u < 0.45) K.shot(t[0] - 0.04, 0.5, 0, 1.3); K.spermy(x, 0.5); },
  rapid: (K, u) => { K.cells([0, Math.floor(u * 20) % 2, 0]); for (let k = 0; k < 8; k++) { const v = (u * 3 + k / 8) % 1; K.shot(wmvL(K.me[0], WC1[0], v), wmvL(K.me[1], WC1[1], v), Math.atan2(WC1[1] - K.me[1], WC1[0] - K.me[0]), 0.55); } K.spermy(); },
  focus: (K, u) => { K.cells([0, u > 0.1 ? Math.floor(u * (6 + u * 20)) % 2 : 0, 0]); const s = 0.6 + u * 2.2; K.shot(WC1[0], WC1[1], 0, s, null, K.me[0], K.me[1]); if (K.atk !== 'beam') K.line(K.me[0], K.me[1], WC1[0], WC1[1], K.col, 1 + u * 5, 0.25 + u * 0.4); K.ring(WC1[0], WC1[1], 0.05 + u * 0.03, u); K.spermy(); },
  sticky: (K, u) => { K.cells([0, wmvHit(u, 0.75, 0.1), 0]); K.fly(u, 0, 0.3, K.me[0], K.me[1], WC1[0] - 0.04, WC1[1]); if (u >= 0.3 && u < 0.75) { K.dot(WC1[0] - 0.04, WC1[1], 0.015, Math.floor(u * 12) % 2 ? K.col : '#fff'); } K.boom(WC1[0], WC1[1], u, 0.75, 0.95, 0.1); K.spermy(); },
  connecting: (K, u) => { const a = K.fly(u, 0, 0.7, K.me[0], K.me[1] - 0.05, WC0[0] + 0.2, WC0[1] - 0.05), b = K.fly(u, 0, 0.7, K.me[0], K.me[1] + 0.05, WC2[0] + 0.2, WC2[1] + 0.05); if (a && b) K.line(a[0], a[1], b[0], b[1], K.col, 3, 0.8); const x = a ? a[0] : 0; K.cell(0.55, 0.5, Math.abs(x - 0.55) < 0.03 ? 1 : 0); K.spermy(); },
  catalyst: (K, u) => { K.cells([0, wmvHit(u, 0.4, 0.15), 0]); K.fly(u, 0, 0.4, K.me[0], K.me[1], WC1[0], WC1[1]); K.boom(WC1[0], WC1[1], u, 0.4, 0.75, 0.1); K.boom(WC1[0], WC1[1], u, 0.5, 0.9, 0.16, '#ffd166'); K.spermy(); },
  extra: (K, u) => { K.cells([wmvHit(u, 0.55), wmvHit(u, 0.55), wmvHit(u, 0.55)]); for (let k = -2; k <= 2; k++) { const a = k * 0.28, d = 0.62; K.fly(u, 0, 0.6, K.me[0], K.me[1], K.me[0] + Math.cos(a) * d, K.me[1] + Math.sin(a) * d * 1.3, 0.8); } K.spermy(); },
  range: (K, u) => { const t = [0.94, 0.5]; K.line(K.me[0], 0.62, t[0], 0.62, '#ffffff', 1, 0.3, [3, 5]); K.cells([wmvHit(u, 0.7, 0.12)], [t]); K.fly(u, 0, 0.7, K.me[0], K.me[1], t[0], t[1]); K.spermy(); },
  upclose: (K, u) => { const t = [0.4, 0.5]; K.ring(K.me[0], K.me[1], 0.24, 0.35, '#ffffff', 1); K.cells([wmvHit(u, 0.25, 0.15)], [t]); K.fly(u, 0, 0.25, K.me[0], K.me[1], t[0], t[1], 1.8); K.boom(t[0], t[1], u, 0.25, 0.5, 0.08); K.spermy(); },
  charged: (K, u) => { K.cells([0, wmvHit(u, 0.8, 0.12), 0]); if (u < 0.6) K.ring(K.me[0] + 0.04, K.me[1], 0.12 * (1 - u / 0.6) + 0.02, u / 0.6, K.col, 3); K.fly(u, 0.6, 0.8, K.me[0], K.me[1], WC1[0], WC1[1], 2.4); K.boom(WC1[0], WC1[1], u, 0.8, 0.98, 0.12); K.spermy(); },
  kinship: (K, u) => { const m = [0.5, 0.5]; K.cells([0, wmvHit(u, 0.75, 0.12), 0]); const a = K.fly(u, 0, 0.4, K.me[0], K.me[1] - 0.25, m[0], m[1], 0.8), b = K.fly(u, 0, 0.4, K.me[0], K.me[1] + 0.25, m[0], m[1], 0.8); if (a && b) K.line(a[0], a[1], b[0], b[1], K.col, 1, 0.4, [2, 3]); K.fly(u, 0.4, 0.75, m[0], m[1], WC1[0], WC1[1], 1.7); K.spermy(); },
  knock: (K, u) => { const k = u < 0.35 ? 0 : wmvE((u - 0.35) / 0.3); const t = [wmvL(0.6, 0.86, k), 0.5]; K.cells([wmvHit(u, 0.35, 0.1)], [t]); K.fly(u, 0, 0.35, K.me[0], K.me[1], 0.56, 0.5); if (u > 0.35 && u < 0.7) K.line(t[0] - 0.06, 0.46, t[0] - 0.12, 0.46, '#fff', 1, 0.6); K.spermy(); },
  pull: (K, u) => { const k = u < 0.35 ? 0 : wmvE((u - 0.35) / 0.4); const t = [wmvL(0.84, 0.42, k), 0.5]; K.cells([wmvHit(u, 0.35, 0.1)], [t]); K.fly(u, 0, 0.35, K.me[0], K.me[1], 0.8, 0.5); if (u > 0.35 && u < 0.75) K.line(t[0] + 0.06, 0.5, t[0] + 0.14, 0.5, K.col, 1, 0.6, [2, 3]); K.spermy(); },
  turncoat: (K, u) => { const turned = u > 0.35; K.cell(WC0[0], WC0[1], wmvHit(u, 0.35, 0.08), turned ? PAL.you : null); K.cell(WC2[0], WC2[1], wmvHit(u, 0.85, 0.08)); K.fly(u, 0, 0.35, K.me[0], K.me[1], WC0[0], WC0[1]); K.fly(u, 0.5, 0.85, WC0[0], WC0[1], WC2[0], WC2[1], 0.8, PAL.you); K.spermy(); },
  melee: (K, u) => { const t = [0.4, 0.5], s = u < 0.4 ? u / 0.4 : 0; K.cells([wmvHit(u, 0.2, 0.15)], [t]); if (s > 0) { K.g.strokeStyle = K.col; K.g.lineWidth = K.U * 0.014; K.g.globalAlpha = 1 - s * 0.5; K.g.beginPath(); K.g.arc(K.X(K.me[0]), K.Y(K.me[1]), K.U * 0.14, -1.3 + s * 1.2, -0.3 + s * 1.6); K.g.stroke(); K.g.globalAlpha = 1; } K.spermy(); },
  ranged: (K, u) => { const t = [0.88, 0.5]; K.cells([wmvHit(u, 0.6, 0.12)], [t]); K.fly(u, 0, 0.6, K.me[0], K.me[1], t[0], t[1]); K.spermy(); },
  mines: (K, u) => { const M = [[0.38, 0.3], [0.48, 0.55], [0.38, 0.78]], cx = wmvL(0.95, 0.15, u); M.forEach((m, i) => { if (u > i * 0.1) { if (Math.abs(cx - m[0]) < 0.04 && i === 1) return; K.dot(m[0], m[1], 0.016, '#111'); K.dot(m[0], m[1], 0.008, Math.floor(u * 8) % 2 ? K.col : '#fff'); } }); const bx = M[1][0]; K.cells([Math.abs(cx - bx) < 0.04 ? 1 : 0], [[cx, M[1][1]]]); if (cx < bx + 0.04 && cx > bx - 0.25) K.boom(bx, M[1][1], (bx + 0.04 - cx) / 0.29, 0, 1, 0.12); K.spermy(0.24, wmvL(0.3, 0.78, u)); },
  dfa: (K, u) => { const t = WC1; K.cells([0, wmvHit(u, 0.75, 0.12), 0]); if (u < 0.75) { K.ring(t[0], t[1], 0.06, 0.6 + Math.sin(u * 30) * 0.3, '#ff5d5d', 1.5); K.line(t[0] - 0.07, t[1], t[0] + 0.07, t[1], '#ff5d5d', 1, 0.6); } K.fly(u, 0.45, 0.75, t[0], -0.05, t[0], t[1], 1.6); K.boom(t[0], t[1], u, 0.75, 0.98, 0.12); K.spermy(); },
  explode: (K, u) => { K.cells([wmvHit(u, 0.45, 0.12), wmvHit(u, 0.4, 0.12), wmvHit(u, 0.45, 0.12)]); K.fly(u, 0, 0.4, K.me[0], K.me[1], WC1[0], WC1[1]); K.boom(WC1[0], WC1[1], u, 0.4, 0.7, 0.2); K.spermy(); },
  area: (K, u) => { const big = u > 0.5; K.cells([wmvHit(u % 0.5, 0.3, 0.1) && !big ? 1 : 0, wmvHit(u % 0.5, 0.3, 0.1), wmvHit(u % 0.5, 0.3, 0.1) && big ? 1 : 0]); K.fly(u % 0.5, 0, 0.3, K.me[0], K.me[1], WC1[0], WC1[1], big ? 1.6 : 1); K.boom(WC1[0], WC1[1], u % 0.5, 0.3, 0.48, big ? 0.24 : 0.12); if (big) K.ring(WC1[0], WC1[1], 0.12, 0.25, '#ffffff', 1); K.spermy(); },
  primer: (K, u) => { K.cells([0, wmvHit(u, 0.25, 0.06) || wmvHit(u, 0.75, 0.12), 0]); K.fly(u, 0, 0.25, K.me[0], K.me[1], WC1[0], WC1[1], 0.7); if (u > 0.25 && u < 0.75) K.ring(WC1[0], WC1[1], 0.06, 0.8, '#ffd166', 2); K.fly(u, 0.5, 0.75, K.me[0], K.me[1], WC1[0], WC1[1]); K.boom(WC1[0], WC1[1], u, 0.75, 0.98, 0.14, '#ffd166'); K.spermy(); },
  switch: (K, u, to) => { K.cells([0, wmvHit(u, 0.7, 0.12), 0]); const k = Math.min(1, u / 0.7); K.fly(u, 0, 0.7, K.me[0], K.me[1], WC1[0], WC1[1], 1.1, k > 0.45 ? to || '#ffffff' : K.col); if (u > 0.28 && u < 0.4) K.ring(wmvL(K.me[0], WC1[0], 0.45), wmvL(K.me[1], WC1[1], 0.45), 0.04, 1 - (u - 0.28) * 8, '#fff', 1); K.spermy(); },
  plain: (K, u) => { K.cells([0, wmvHit(u, 0.5, 0.1), 0]); K.fly(u, 0, 0.5, K.me[0], K.me[1], WC1[0], WC1[1]); K.spermy(); },
};
const WMV_OWN = {
  init: () => {},
  step: (pv, dt) => { pv.t += dt; },
  draw: (pv, g, W2, H2) => {
    const [, id, to] = String(pv.opts.perk).split('|'), K = wmvKit(pv, g, W2, H2);
    (WMV_SCENE[id] || WMV_SCENE.plain)(K, (pv.t % WMV.P) / WMV.P, to);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  },
};
makePreview = (orig => function (canvas, def, opts) {
  const pv = orig(canvas, def, opts);
  if (opts && typeof opts.perk === 'string' && opts.perk.startsWith('wm|')) pv.own = WMV_OWN;
  return pv;
})(makePreview);
