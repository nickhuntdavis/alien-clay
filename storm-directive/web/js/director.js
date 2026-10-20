'use strict';
// Spawn Prawn - the Reward Director: one gate for every reward screen (user, 20 Oct).
//  - Every reward still pushes a request onto G.lootQueue ({ kind }); cards are only built when its screen opens.
//    The director orders that queue, spaces the screens out and merges spare level-ups.
//  - Order: highest priority first (DIR_PRI); a request gains DIRECTOR.age points per second it waits, so a
//    mutation or a level draft is never starved by a stream of bigger rewards.
//  - Pacing: one screen per DIRECTOR.gap seconds of combat while one reward waits; a backlog shortens the gap
//    (dirGapNow: 30 s, 20 s with two waiting, 15 s with three, never under DIRECTOR.minGap), so a fast player is
//    not starved and a slow one is not buried. Forks, boss rewards and the second weapon go
//    straight through (a fork is the consequence of a pick). Wave modes (Petri Dish, Endless): the wave break is
//    the window (waves.js waveHoldsLoot), where take-two screens keep the pile short.
//  - Coalescing: two waiting level drafts merge into one screen of four cards where you take two
//    (DIRECTOR.maxPicks). Nothing earned is lost. Only level drafts merge; unique rewards stay their own screen.
//  - The egg: once its membrane is awake no new screen opens. Waiting rewards apply themselves (one card each,
//    named in floating text) so the ending is never held up by a menu.
//  - Telemetry in G.stats: scr (screens opened), scrBy (by kind), merged, auto (applied at the egg), menuT (seconds
//    spent on reward screens). Logged in the run log with the rest of G.stats.
// Hooks: v10.js v10Tick -> dirTick; draft.js draftBox -> dirGate, draftLoot -> dirN; ui.js openLoot -> dirTitle,
// pickLoot -> dirTwo, dirPicked. Calls rewardui.js rwSaved.

const DIRECTOR = { gap: 30, minGap: 10, age: 1, maxPicks: 2 };
const DIR_PRI = { start: 1000, relic: 90, spoils: 85, boss: 80, slot: 75, wupfork: 72, wup: 70, fork: 68, mutation: 50, chest: 40, level: 20 };
const dirS = () => G.dir || (G.dir = { t: null });
const dirGapNow = () => Math.max(DIRECTOR.minGap, DIRECTOR.gap / (1 + 0.5 * (Math.max(1, G.lootQueue.length) - 1)));
const dirEgg = () => !!(G.eggE && !G.eggE.dead);
const dirPri = q => (DIR_PRI[q.kind] || 30) + (G.t - (q.dirAt != null ? q.dirAt : G.t)) * DIRECTOR.age;

// Every frame of play: stamp, merge and order the waiting requests.
function dirTick() {
  if (!G || !G.lootQueue || !G.lootQueue.length) return;
  const Q = G.lootQueue;
  for (const q of Q) if (q.dirAt == null) { q.dirAt = G.t; if (typeof rwSaved === 'function' && (G.wave ? waveHoldsLoot() : dirS().t != null && G.t - dirS().t < dirGapNow())) rwSaved(q); } // (held back: say so, rewardui.js)
  // Two single level drafts become one take-two screen.
  const lv = Q.filter(q => q.kind === 'level' && !(q.picks > 1));
  for (let i = 0; i + 1 < lv.length; i += 2) {
    const a = lv[i], b = lv[i + 1];
    a.picks = DIRECTOR.maxPicks; a.dirAt = Math.min(a.dirAt, b.dirAt);
    Q.splice(Q.indexOf(b), 1);
    G.stats.merged = (G.stats.merged || 0) + 1;
  }
  if (Q.length > 1) {
    const k = Q.map((q, i) => ({ q, i, p: dirPri(q) }));
    k.sort((x, y) => y.p - x.p || x.i - y.i);
    for (let i = 0; i < k.length; i++) Q[i] = k[i].q;
  }
}

// draft.js draftBox, for a request that is valid right now: true opens it, 'wait' keeps it, false drops it.
function dirGate(req) {
  if (req.kind === 'start') return true;
  if (dirEgg()) return dirAuto(req);
  const D = dirS();
  if (req.kind === 'fork' || req.kind === 'wupfork' || req.now || G.wave) return dirOpen(req);
  if (req.kind === 'slot' && G.weapons.filter(Boolean).length < 2) return dirOpen(req); // (the second weapon is never held back)
  if (D.t != null && G.t - D.t < dirGapNow()) return 'wait';
  D.t = G.t;
  return dirOpen(req);
}
function dirOpen(req) {
  const st = G.stats;
  st.scr = (st.scr || 0) + 1;
  (st.scrBy || (st.scrBy = {}))[req.kind] = (st.scrBy[req.kind] || 0) + 1;
  return true;
}

// At the egg: apply a waiting reward without a screen. A new weapon slot waits (it needs the draft screen).
function dirAuto(req) {
  if (req.kind === 'slot') return 'wait';
  let opts = [];
  try { opts = genLoot(req) || []; } catch (e) { opts = []; }
  opts = opts.filter(o => o && o.apply && !o.cursed);
  for (const o of shuffle(opts).slice(0, req.picks > 1 ? req.picks : 1)) {
    try { o.apply(); } catch (e) { continue; }
    if (G.player) floatText(G.player.x, G.player.y - 50, String(o.title || '').toUpperCase(), PAL.upgrade, 13, 1.4);
    G.stats.auto = (G.stats.auto || 0) + 1;
  }
  if (typeof recomputeAll === 'function') recomputeAll();
  return false;
}

// Cards on a level draft: four when you take two (draft.js draftLoot).
const dirN = req => (req && req.picks > 1 ? 4 : 3);
// ui.js openLoot: say so on a take-two screen.
function dirTitle(req, titles) {
  if (req.kind === 'level' && req.picks > 1 && titles.level) titles.level = [titles.level[0], 'Two levels at once. Take two.'];
}
// ui.js pickLoot: a take-two screen keeps its second pick (the Twin Pick path).
const dirTwo = req => !!(req && req.picks > 1);
// ui.js pickLoot, as the screen closes: time spent choosing.
function dirPicked() {
  if (!G || !G.stats || typeof UI === 'undefined' || !UI.lootOpenT) return;
  G.stats.menuT = Math.round(((G.stats.menuT || 0) + (performance.now() - UI.lootOpenT) / 1000) * 10) / 10;
}
