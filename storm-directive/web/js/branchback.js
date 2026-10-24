'use strict';
// Spawn Prawn - two things back (user, 24 Oct).
//  - WEAPON BRANCHES: the old upgrade path (weapons24.js and wup1.js ... wup6.js: a promise of three, then that promise's
//    two cards and its wildcard, then a mastery) opens as a weapon reaches Lv 3, 6 and 9 (XBR.at). Weapons level by
//    taking modifiers and stop at Lv 9 (modmatrix.js), so the old Lv 10 mastery comes at Lv 9; one weapon a run gets it.
//    The screen is a fork request (req.xbr); taking a card records it on the slot as before (w.up.p, .l6, .l10).
//  - ELITE CARRIERS: elites carry a DNA strand again (mutdrop.js: the helix, the beacon and the countdown). Killing a
//    carrier in time drops the strand; it now holds a loot box (a DNA strand box: modifier cards), not a mutation.
//    Its banner, float text and labels say LOOT, not MUTATION.
//  Tests and sims (window.TUT_OFF) get neither unless XBR.force / XEB.force.
// Hooks: none in shared files. Wraps weapons24.js wupTick, modslice.js forkCards, draft.js draftTitle and draftBox, sidemo.js
// sivDraftKind and sivDraftHead (the branch screen in the Weapon Draft layout), mutdrop.js
// mdTick and mdKill, game.js banner and floatText (the carrier lines only); mutdrop.js's two strand labels are placeholders in place. Loads after modslice.js and spassives.js.

const XBR = { at: [3, 6, 9], force: false };
const XEB = { chance: 0.6, force: false };
const xbrTest = f => typeof window !== 'undefined' && window.TUT_OFF && !f;
const xbrOn = () => !!G && !xbrTest(XBR.force) && !(typeof sbOn === 'function' && sbOn());

// ---------------------------------------------------------------- weapon branches
function xbrTick() {
  if (!xbrOn() || G.state !== 'play') return;
  for (const w of G.weapons) {
    if (!w || w.isSpell || !w.def || !WUP[w24Key(w)]) continue;
    const U = wupUp(w), step = !U.p ? 0 : !U.l6 ? 1 : !U.l10 ? 2 : 3;
    if (step >= 3 || w.xbrQ === step || (w.lvl || 1) < XBR.at[step]) continue;
    if (step === 2 && (!WUP[w24Key(w)].lv10 || (G.xbrMast && G.xbrMast !== w))) continue; // (one weapon a run gets its mastery)
    w.xbrQ = step;
    G.lootQueue.push({ kind: 'fork', v10ok: true, xbr: { w, lv: [3, 6, 10][step] } });
  }
}
wupTick = (orig => function (dt) { orig(dt); xbrTick(); })(wupTick);
forkCards = (orig => function (req) {
  if (!req.xbr) return orig(req);
  const { w, lv } = req.xbr;
  if (!G.weapons.includes(w)) return [];
  return (wupForkCards({ w, lv }) || []).map(c => Object.assign(c, { apply: (ap => () => { ap(); if (lv === 10) G.xbrMast = w; w.xbrQ = null; computeStats(w); })(c.apply) }));
})(forkCards);
draftTitle = (orig => function (req) {
  if (!req.xbr) return orig(req);
  return orig({ kind: 'wupfork', w: req.xbr.w, lv: req.xbr.lv }); // (the old upgrade screen's title)
})(draftTitle);
// The branch screen opens in the Weapon Draft layout (user, 24 Oct): tabs, the details panel and the live stage, as the
// old upgrade route did (sidemo.js). The request becomes a 'wupfork' for the screen (so ui.js openDraft finds its weapon)
// with its cards fixed first; weapons with their own branch scenes (sivFlags) play each tab's card on the stage.
const XBR_HEAD = { 3: 2, 6: 3, 10: 4 };
sivDraftKind = (orig => function (req) {
  if (!req.xbr) return orig(req);
  if (!G || !G.weapons.includes(req.xbr.w)) return false;
  if (!req.fixed) req.fixed = forkCards(req);
  if (!req.fixed.length) return false;
  Object.assign(req, { kind: 'wupfork', w: req.xbr.w, lv: req.xbr.lv });
  return true;
})(sivDraftKind);
sivDraftHead = (orig => function (req, weap) {
  if (!req.xbr) return orig(req, weap);
  const t = XBR_HEAD[req.lv] || 2, U = weap.up || {}, S = WUP[w24Key(weap)], FL = sivFlags(weap);
  for (const o of UI.lootOpts) {
    if (FL) o.perk = 'siv|' + [...new Set([FL[U.p], U.l6 && FL[U.l6], FL[o.title]].filter(Boolean))].join(',');
    if (o.tag === 'BRANCH') o.tag = 'BRANCH CARD';
  }
  $('dKick').textContent = `${weap.def.name.toUpperCase()} | TIER ${t - 1} > ${t}`;
  $('dTitle').textContent = ['', '', 'PROMISE', 'BRANCH', 'MASTERY'][t] || 'UPGRADE';
  $('dSub').textContent = t === 2 ? 'Three ways for it to grow. Take one: the other two are gone for the run.'
    : t === 3 ? `How ${S && S[U.p] ? S[U.p].name : 'its promise'} grows. Take one: the others are gone for the run.`
    : 'Its mastery. Only one weapon a run gets one.';
  return true;
})(sivDraftHead);
draftBox = (orig => function (req) { // (a branch screen put back in the queue is still a fork: wupNextLv knows no Lv 9 mastery)
  if (!req.xbr) return orig(req);
  return G.weapons.includes(req.xbr.w) && forkCards(req).length > 0 && (typeof dirGate === 'function' ? dirGate(req) : true);
})(draftBox);

// ---------------------------------------------------------------- elite carriers
const XEB_TEXT = { 'MUTATION CARRIER!': 'LOOT CARRIER!', 'MUTATION SECURED': 'LOOT SECURED', 'MUTATION LOST': 'LOOT LOST' };
mdTick = (orig => function (dt) {
  if (G && !xbrTest(XEB.force)) MUTDROP.chance = XEB.chance; // (tests set their own)
  return orig(dt);
})(mdTick);
mdKill = function (e) { // (replaces mutdrop.js's: the strand holds a loot box)
  if (!e.mdCarry || e.charmed) return;
  e.mdCarry = false;
  mdS().drops.push({ x: e.x, y: e.y, life: MUTDROP.dropLife, bob: Math.random() * TAU });
  ring(e.x, e.y, 50, MUTDROP.col, 0.4, 3); floatText(e.x, e.y - e.r - 12, 'MUTATION SECURED', MUTDROP.col, 13, 1);
  G.lootQueue.push({ kind: 'chest', src: { t: 'elite', name: (e.name || '').replace(' (elite)', '') } }); // (yours on the kill; the Reward Director picks the moment)
  if (G.stats) G.stats.mutDrops = (G.stats.mutDrops || 0) + 1;
};
banner = (orig => function (text, ...a) { return orig(XEB_TEXT[text] || text, ...a); })(banner);
floatText = (orig => function (x, y, text, ...a) { return orig(x, y, XEB_TEXT[text] || text, ...a); })(floatText);
