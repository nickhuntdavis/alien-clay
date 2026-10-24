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
// Hooks: none in shared files. Wraps weapons24.js wupTick, modslice.js forkCards, draft.js draftTitle, mutdrop.js
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
