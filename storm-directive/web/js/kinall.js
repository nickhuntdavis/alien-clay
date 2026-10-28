'use strict';
// Spawn Prawn - kindred spirits in every mode, rescue odds, type-pool rescue drafts, and rescue-and-finish unlocks (user).
//  - WHERE: a stranded sample now turns up in more than The Race (kindred.js does the spawning, beacon, pointers, touch,
//    draft screen and fusion; this file only decides when and who).
//      The Race (s001): unchanged (the timed marks 02:00, 05:00 ... and Donor DNA stay Race-only).
//      Petri Dish (s002) and Endless (s006): when a boss wave is cleared (waves 5, 10, 15; Endless every 5th wave). Wave 20
//        of the Dish is the win, so no spirit comes after it. One at a time: a spirit still waiting is not doubled.
//      Level 1 (s007): when an arena is cleared (levels.js V.done grows), placed on a floor cell 6 to 11 cells off by the route.
//      In the Dish and Endless the next drop waits up to KINALL.hold (30 s) for the spirit, so the draft opens in the rest.
//    kinOn() is "spirits are live here"; the Race-only rules (no level-up weapon drafts, the Recycle button text) stay on raceOn().
//  - WHO (kinChoose): weighted odds KINALL.odds from the samples not yet unlocked (META.s10) and not carried; if you own them
//    all, from any not carried. Baseline and Private Schooled never appear. acro is off KIN.skip (it is on the rack now).
//  - THE DRAFT (kinCards): two random weapons of the rescued sample's type pool (typepools.js tpPool; Not of This World: any
//    type) that you do not hold, plus one wildcard from any live weapon. Absorbing adds its type to the run's draft pool
//    (typepools.js tpAdd). The rescue screen shows the type: a swatch and a line (TODO_COPY:kin_type_note).
//  - UNLOCKS: a sample opens (META.s10) when you rescued it in a run AND finished the run: the Race reached the egg
//    (victory), the Dish beat wave 20 (campWin -> victory), Endless reached wave 20 (waveBegin), Level 1 lvWin. Dying
//    after a rescue unlocks nothing. Achievements no longer unlock samples (s10Unlock is closed to everything but this file).
//    S10_ALL is off: only Baseline (and META.s10, developer mode) is open.
// Hooks: none in shared files. Wraps kindred.js kinTick, kinChoose, kinCards, kinAbsorb; waves.js waveClear, waveBegin;
// game.js victory; levels.js lvWin; samples10.js s10Unlock; ui.js UI.showVictory; UI.openDraft (the type note). Uses
// hookOn('tick') for Level 1 arenas. One-line edit in kindred.js: kinTick's first line reads kinOn() instead of raceOn().
// samplestart.js: the achievement unlocks and s10LockTxt (now TODO_COPY:kin_lock_txt) were edited there.
// Save data: META.s10 (unlocked ids, as before) and META.kinSeen (as before). Loads after typepools.js.

S10_ALL = false;
const KINALL = { odds: { alpha: 4, beta: 4, ordered: 3, redtail: 3, acro: 2, prawn: 1, alien: 0.5 }, bossEvery: 5, lvLo: 6, lvHi: 11, hold: 30 };
{ const i = KIN.skip.indexOf('acro'); if (i >= 0) KIN.skip.splice(i, 1); } // (acro is on the rack now)

// ---------------------------------------------------------------- copy placeholders
const KINALL_COPY = {
  kin_unlocked: 'TODO_COPY:kin_unlocked', // {name}
  kin_lock_txt: 'TODO_COPY:kin_lock_txt',
  kin_type_note: 'TODO_COPY:kin_type_note', // {n} {type}
  kin_type_note_any: 'TODO_COPY:kin_type_note_any', // {n}
};
// (While a line is still a placeholder the values are appended, so a test or a screenshot shows what would be filled in.)
function kaCopy(id, vars) {
  let t = KINALL_COPY[id] || 'TODO_COPY:' + id;
  if (t.startsWith('TODO_COPY')) return vars ? t + ' (' + Object.values(vars).join(' / ') + ')' : t;
  for (const k in vars || {}) t = t.split('{' + k + '}').join(vars[k]);
  return t;
}
const kaLockTxt = () => kaCopy('kin_lock_txt');

// ---------------------------------------------------------------- where spirits are live
const kaLevel1 = () => !!(G && G.lvl && typeof UI !== 'undefined' && UI.sample === 's007' && !G.lvl.L.school && !G.lvl.L.course);
const kaDish = () => !!(G && G.wave && !G.lvl);
const kinOn = () => !!(G && (raceOn() || kaDish() || kaLevel1()));

// Everywhere but the Race: the timed marks are off (the spirit loop, reminders and the touch still run).
kinTick = (orig => function (dt) {
  if (raceOn()) return orig(dt);
  if (!kinOn() || !G.s10) return;
  kinInit(); if (!G.kin) return;
  G.kin.n = KIN.at.length;
  const lm = KIN.lastMark; KIN.lastMark = -1;
  try { orig(dt); } finally { KIN.lastMark = lm; }
})(kinTick);

// ---------------------------------------------------------------- who
function kaWeighted(list) { // [[id, weight], ...]
  const tot = list.reduce((a, x) => a + x[1], 0); if (!(tot > 0)) return null;
  let r = Math.random() * tot;
  for (const [id, w] of list) { r -= w; if (r < 0) return id; }
  return list[list.length - 1][0];
}
kinChoose = function () {
  if (!G.kin) return null;
  const cand = Object.keys(KINALL.odds).filter(id => S10_BY[id] && S10_BY[id].weapons && S10_BY[id].weapons.length && !kinHas(id) && !KIN.skip.includes(id) && !G.kin.spirits.some(k => k.id === id));
  const fresh = cand.filter(id => !(META.s10 && META.s10[id]));
  return kaWeighted((fresh.length ? fresh : cand).map(id => [id, KINALL.odds[id]]));
};

// ---------------------------------------------------------------- when: boss waves and Level 1 arenas
function kaSpawn() {
  if (!kinOn() || !G.s10) return false;
  kinInit(); const K = G.kin; if (!K || K.spirits.length) return false; // (one at a time)
  kinSpawn(); const s = K.spirits[0]; if (!s) return false;
  K.holdT = 0;
  if (kaLevel1()) { const q = kaLvSpot(); s.x = q.x; s.y = q.y; } // (kinSpawn's ring around you could be inside a wall)
  return true;
}
// Level 1: a floor cell KINALL.lvLo to lvHi cells from you by the route (levels.js dPl), ahead of you if there is one (nearer
// the exit, dEx), else any; widened step by step; last resort, your own cell.
function kaLvSpot() {
  const V = G.lvl, p = me(), myEx = V.dEx[lvIdx(p.x, p.y)] ?? 1e9;
  for (let w = 0; w < 6; w++) {
    const lo = Math.max(3, KINALL.lvLo - w), hi = KINALL.lvHi + w * 3, ahead = [], any = [];
    for (let i = 0; i < V.grid.length; i++) {
      const d = V.dPl[i]; if (d < lo || d > hi || (V.grid[i] !== LV_T.floor && V.grid[i] !== LV_T.saliva)) continue;
      any.push(i); if (V.dEx[i] <= myEx) ahead.push(i);
    }
    const list = ahead.length ? ahead : any;
    if (list.length) { const c = lvCentre(pick(list)); return { x: c.x, y: c.y }; }
  }
  return { x: p.x, y: p.y };
}
waveClear = (orig => function (V) {
  orig(V);
  if (V && V.n >= KINALL.bossEvery && V.n % KINALL.bossEvery === 0 && V.kinN !== V.n && !(V.camp && V.n >= CAMP.waves)) { V.kinN = V.n; kaSpawn(); }
})(waveClear);
// The Dish and Endless: the next drop waits (up to KINALL.hold seconds) for the spirit, so the rescue draft opens in the
// rest between waves (waves.js waveHoldsLoot would hold it until the next wave clears). The wait is a rest timer kept above zero.
hookOn('tick', 'kinall:hold', dt => {
  if (!kaDish() || G.state !== 'play' || !G.kin || !G.kin.spirits.length || G.wave.active) return;
  G.kin.holdT = (G.kin.holdT || 0) + dt;
  if (G.kin.holdT < KINALL.hold) G.wave.restT = Math.max(G.wave.restT, 0.5);
});
hookOn('tick', 'kinall:arena', () => {
  if (!kaLevel1() || G.state !== 'play' || !G.s10) return;
  kinInit(); const K = G.kin; if (!K) return;
  const n = Object.keys(G.lvl.done || {}).length;
  if (K.lvN == null) K.lvN = n;
  if (n > K.lvN) { K.lvN = n; kaSpawn(); }
});

// ---------------------------------------------------------------- the rescue: its type joins the pool, three cards from it
kinAbsorb = (orig => function (id) {
  const had = kinHas(id);
  orig(id);
  if (!had && typeof tpAdd === 'function') tpAdd(tpOf(id));
})(kinAbsorb);
kinCards = function (req) {
  if (kinFull()) return [];
  const type = tpOf(req.id), held = id => G.weapons.some(w => w && (w.sid || w.id) === id);
  const free = pool => pool.filter(id => WEAPONS[id] && !held(id));
  const typed = shuffle(free(tpPool(type))).slice(0, 2);
  const rest = shuffle(free(tpPool('*')).filter(id => !typed.includes(id)));
  const ids = typed.concat(rest).slice(0, KIN.cards); // (the wildcard last; if the type has fewer than two left, any weapon fills in)
  return ids.map(id => {
    const o = optNewWeapon(id, 0), eq = o.apply;
    o.apply = () => { if (!G.weapons.some(w => !w)) G.weapons.push(null); eq(); };
    return o;
  });
};
// The rescue screen says what type you are getting.
function kaNote(id) {
  let el = $('kinTypeNote');
  if (!el && !id) return;
  if (!el) {
    el = document.createElement('div'); el.id = 'kinTypeNote';
    el.style.cssText = 'display:none;align-items:center;justify-content:center;gap:6px;margin:4px 0 6px;font:800 13px sans-serif;letter-spacing:1px;text-align:center';
    const sub = $('dSub'); sub.parentNode.insertBefore(el, sub.nextSibling);
  }
  if (!id) { el.style.display = 'none'; return; }
  const sm = S10_BY[id], any = tpOf(id) === '*';
  const sw = sm.types.map(t => { const c = ELEMENTS[S10_TYPES[t]].color; return `<i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${typeof pictoInk === 'function' && !pictoInk(c) ? 'var(--color-text-primary)' : c}"></i>`; }).join('');
  const nm = sm.types[0].charAt(0).toUpperCase() + sm.types[0].slice(1);
  el.innerHTML = `${sw}<span>${esc(any ? kaCopy('kin_type_note_any', { n: 2 }) : kaCopy('kin_type_note', { n: 2, type: nm }))}</span>`;
  el.style.display = 'flex';
}
UI.openDraft = (od => function (req) { const r = od.apply(UI, arguments); kaNote(req && req.kin || null); return r; })(UI.openDraft);

// ---------------------------------------------------------------- unlocks: rescued, then finished
// Only this file opens a sample now (achievements and the Shell-strip no longer do).
s10Unlock = function () { /* closed: kaWin sets META.s10 itself */ };
for (const s of SAMPLES10) if (s.unlock) s.unlock.txt = kaLockTxt(); // (the Field Guide card reads s.unlock.txt)
function kaWin() {
  const K = G && G.kin; if (!K || !G.s10) return [];
  const ids = K.has.slice(1).filter(id => S10_BY[id] && id !== 'private' && !(META.s10 && META.s10[id]));
  if (!ids.length) return [];
  for (const id of ids) (META.s10 || (META.s10 = {}))[id] = 1;
  saveMeta();
  K.unlocked = (K.unlocked || []).concat(ids);
  return ids;
}
const kaUnlockedTxt = () => { const K = G && G.kin; return K && K.unlocked && K.unlocked.length ? kaCopy('kin_unlocked', { name: K.unlocked.map(id => S10_BY[id].name).join(', ') }) : ''; };
victory = (orig => function (at) {
  const was = G && G.state;
  orig(at);
  if (G && was !== 'finale' && was !== 'won' && G.state === 'finale') kaWin(); // (the Race egg; the Dish's wave 20 comes through here too)
})(victory);
lvWin = (orig => function (at) {
  const V = G && G.lvl, was = V && V.won;
  orig(at);
  if (V && !was && V.won && kaLevel1()) kaWin();
})(lvWin);
waveBegin = (orig => function () {
  orig();
  if (G && G.wave && !G.wave.camp && G.wave.n >= 20 && kinOn() && kaWin().length) banner(kaUnlockedTxt(), PAL.reward); // (Endless: reaching wave 20 counts)
})(waveBegin);
UI.showVictory = (orig => function () {
  orig.apply(UI, arguments);
  const t = kaUnlockedTxt(), b = $('overBody');
  if (t && b) b.insertAdjacentHTML('afterbegin', `<div class="bdna">${esc(t)}</div>`);
})(UI.showVictory);
