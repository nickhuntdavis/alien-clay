'use strict';
// Spawn Prawn - V11 power curve (user, 21 Oct: "we're too strong from the start").
//  - No early one-shots: until P11.capT, one hit on a germ or elite can't do more than P11.cap of its health (crits
//    included), so it takes at least two. The limit lifts between P11.capT and P11.capEnd. Weapon branches and
//    mutations multiply after the limit, so real power still one-shots.
//  - Start weaker: against germs and elites your damage starts at P11.start and rises to P11.dmgTo over P11.dmgFade
//    seconds of the difficulty clock; early germs have P11.foeHp times the health, fading to normal by P11.foeFade. By
//    time, not level: a weak start tied to level would starve a slow build of XP and keep it weak.
//  - A subtle gain every level: +P11.dmgLv damage (x1.2 by Lv 40), +P11.hasteLv attack rate and +P11.hpLv max health
//    (healed as it grows).
//  - Range: a direct hit on something more than P11.near from you loses damage, down to P11.farK at P11.far and beyond.
//    Pools, damage over time, reactions and allies' hits are not range-checked (they land where they are, not from you).
//  - Only your own weapons' and Feats' hits (src.w): hazards, terrain and run events are untouched.
//  - Bosses, rivals and the egg keep their own tuning (range still applies). Off on the Lab Bench and in the Sandbox
//    (G.debug), and under V10_OFF.
// Hooks: none in shared files. Wraps game.js makeEnemy, fight.js fightHit (before defences and the other multipliers)
// and juice.js levelJuice (called after each level-up, once per batch).

const P11 = { cap: 0.5, capT: 120, capEnd: 300, start: 0.7, dmgTo: 1, dmgFade: 600, dmgLv: 0.005, hasteLv: 0.005, hpLv: 1.5,
  near: 220, far: 600, farK: 0.55, foeHp: 2, foeFade: 480 };
const p11On = () => !!(V10 && G && !G.debug);
const p11Big = e => !!(e.boss || e.rival || e.egg);
const p11Lv = () => (P11.start + (P11.dmgTo - P11.start) * Math.min(1, PT() / P11.dmgFade)) * (1 + P11.dmgLv * Math.max(0, ((G && G.level) || 1) - 1));
// The most of a germ's health one hit may take (Infinity once lifted).
function p11Cap() {
  const t = PT();
  if (t >= P11.capEnd) return Infinity;
  return t <= P11.capT ? P11.cap : P11.cap + (1 - P11.cap) * (t - P11.capT) / (P11.capEnd - P11.capT);
}
// How much a hit on e keeps for range (1 close up, P11.farK far away).
function p11Range(e, src) {
  if (src.zoneHit || src.dot || src.rx || src.fromAlly || src.echo || !G.player) return 1;
  const d = Math.hypot(e.x - G.player.x, e.y - G.player.y);
  if (d <= P11.near) return 1;
  return 1 - (1 - P11.farK) * Math.min(1, (d - P11.near) / (P11.far - P11.near));
}
// Early germs are tougher: health x P11.foeHp at the start, fading to x1 over P11.foeFade seconds of the difficulty clock.
const p11FoeHp = () => 1 + (P11.foeHp - 1) * Math.max(0, 1 - PT() / P11.foeFade);

{
  const fh = fightHit, lj = levelJuice, mk = makeEnemy;
  fightHit = function (e, d, src, crit) {
    if (p11On() && src.w && !src.dot && !src.rx && !src.fromAlly) { // (src.w: your weapons and Feats; hazards, terrain and events keep their damage)
      d *= p11Range(e, src);
      if (!p11Big(e)) {
        d *= p11Lv();
        const cap = p11Cap() * e.maxHp / (crit ? G.P.critDmg || 1.6 : 1);
        if (d > cap) d = cap;
      }
    }
    return fh(e, d, src, crit);
  };
  makeEnemy = function (def, x, y, opts) {
    const e = mk(def, x, y, opts);
    if (p11On()) { const k = p11FoeHp(); e.hp *= k; e.maxHp *= k; } // (bosses, rivals and the egg set their own health after)
    return e;
  };
  levelJuice = function (lv) {
    const n = p11On() ? G.level - (G.p11L || 1) : 0; // (levelJuice runs once even when a burst of XP gives several levels)
    if (n > 0) {
      G.p11L = G.level;
      const P = G.P; P.haste += P11.hasteLv * n; P.maxHp += P11.hpLv * n;
      if (G.player) G.player.hp = Math.min(P.maxHp, G.player.hp + P11.hpLv * n);
      if (typeof recomputeAll === 'function') recomputeAll();
    }
    return lj(lv);
  };
}
