'use strict';
// Spawn Prawn - specialist passives: Alpha, Beta, Redtail and Prawn Again each work through their ONE damage type.
//  - Alpha (Static): while moving, its hits add Charge. A Static hit keeps the target Charged 50% longer (4.5 s, not 3 s) and
//    its Charge arcs hit 50% harder; any other hit (Force and the rest) Charges the target for 1 s. The old +50% fire rate is off.
//  - Beta (Blood): below 40% health, the Bleed damage its enemies take heals it: 25% of each Bleed tick, rising to 50% at 10%
//    health. The old damage bonus and generic lifesteal are off.
//  - Redtail (Fire): anything its body touches Ignites (a Burning dose on body contact, once a second per enemy). The old
//    "Static hits add to the burn" is off.
//  - Prawn Again (Parasite): Private Schooled's second line: enemies it Possesses hit their old friends twice as hard. The old
//    Bleed on those hits is off. (If Private Schooled's passive is also held, via a kindred spirit, the x2 is not doubled.)
// The old code stays in samples10.js, untouched: this file wraps s10Tick, s10DmgMul and s10Hit and masks what the old branches read
// (see each wrapper), so the old branches do nothing. If samples10.js changes those branches, change the masks to match.
// Hooks: none in shared files. Wraps samples10.js s10Tick, s10DmgMul, s10Hit and fight.js fightStatus. hookOn('tick') for Redtail's
// touch, hookOn('hit:late') for Beta's Bleed heal.
// index.html loads this after gifts10.js (needs SAMPLES10, S10_BY, PROFILES, s10Has, fightStatus, burnAdd, forNear).
// Copy: TODO_COPY:pas_alpha_desc, pas_beta_desc, pas_redtail_desc (Prawn Again keeps its existing line).
const SPASS = {
  alphaMoving: 20, // swimming faster than this counts as moving (the same line the old fire-rate bonus used)
  alphaChargeK: 1.5, // +50% Charge on a moving Static hit: Charge time (3 s) and arc damage
  alphaOtherCharge: 1, // seconds of Charge a moving non-Static hit adds (never shortens a longer one)
  betaBelow: 0.4, // Beta's threshold, as a fraction of max health
  betaHeal0: 0.25, betaHeal1: 0.5, betaFull: 0.1, // share of a Bleed tick returned at the threshold, and at betaFull health
  touchEvery: 1, // Redtail: seconds between ignitions of one enemy
  touchBurn: 120, // Redtail: the Fire damage of one ignition, times your damage bonus (the burn pool is 20% of it, over 3 s)
};
(function () {
  if (typeof SAMPLES10 === 'undefined' || typeof S10_BY === 'undefined') return;

  // ------------------------------------------------------------ copy (the user writes these lines)
  const COPY = { alpha: 'While moving, Static hits keep enemies Charged for 4.5 s with stronger arcs, and every other hit Charges them for 1 s.', beta: 'Below 40% health, Bleed damage heals it: 25% of the damage, rising to 50% near death.', redtail: 'Anything it touches starts Burning.',
    prawn: 'Enemies it Possesses hit their old friends twice as hard.' }; // (Prawn Again: the existing Private Schooled line)
  for (const id in COPY) {
    const s = S10_BY[id]; if (!s) continue;
    s.pdesc = COPY[id];
    if (PROFILES['s10_' + id]) PROFILES['s10_' + id].desc = COPY[id]; // (fmt reads s.pdesc live; desc was copied at load)
  }

  const moving = () => { const p = G.player; return Math.hypot(p.vx || 0, p.vy || 0) > SPASS.alphaMoving; };
  const lowBeta = () => s10Has('beta') && G.player.hp < G.P.maxHp * SPASS.betaBelow;

  // ------------------------------------------------------------ each frame: undo the old Alpha fire-rate bonus
  // samples10.js s10Tick sets w.rateK = 1.5 / 1 on every weapon for Alpha (sigs.js resets it to 1 each frame before that).
  // Put back whatever was there, so Alpha's rate is only what the weapons themselves ask for.
  const _tick = s10Tick;
  s10Tick = function (dt) {
    if (!G.s10 || !s10Has('alpha')) return _tick(dt);
    const keep = G.weapons.map(w => (w ? w.rateK : 0));
    _tick(dt);
    G.weapons.forEach((w, i) => { if (w) w.rateK = keep[i]; });
  };

  // ------------------------------------------------------------ damage dealt
  const _mul = s10DmgMul;
  s10DmgMul = function (e, src) {
    let k = _mul(e, src);
    if (!G.s10) return k;
    // Beta: the old damage bonus (1 + 2 x missing health, below 40%) is divided back out.
    if (lowBeta() && !src.fromAlly) k /= 1 + 2 * (1 - G.player.hp / G.P.maxHp);
    // Prawn Again: Possessed enemies hit their old friends twice as hard (not twice over if Private Schooled's is also on).
    if (s10Has('prawn') && !s10Has('private') && src.fromAlly) k *= 2;
    return k;
  };

  // ------------------------------------------------------------ each hit
  const _hit = s10Hit;
  s10Hit = function (e, src, res, t) {
    if (!G.s10 || res.miss) return _hit(e, src, res, t);
    // Alpha: while moving, a Static hit is marked for the stronger Charge (fightStatus below); any other hit Charges briefly.
    if (s10Has('alpha') && !src.dot && !src.arc && (src.w || src.spell)) {
      const on = moving();
      src.spChg = on && t === 'static';
      if (on && t !== 'static' && !e.dead && !(e.chargeT > G.t + SPASS.alphaOtherCharge)) e.chargeT = G.t + SPASS.alphaOtherCharge;
    }
    // The old branches read these: Redtail's "Static hit adds to the burn" needs t === 'static'; Beta's lifesteal and Prawn's
    // Bleed need res.toHp > 0. Mask them for the old code only.
    const red = s10Has('redtail') && t === 'static', toHp = s10Has('beta') || s10Has('prawn');
    return _hit(e, src, toHp ? Object.assign({}, res, { toHp: 0 }) : res, red ? 'static (masked)' : t);
  };

  // Alpha's extra Charge: a marked Static hit keeps the target Charged 50% longer and its arcs hit 50% harder.
  const _status = fightStatus;
  fightStatus = function (e, elem, dmg, src) {
    if (!(src && src.spChg) || FIGHT_TYPE[elem] !== 'static') return _status(e, elem, dmg, src);
    src.spChg = false;
    const r = _status(e, elem, dmg * SPASS.alphaChargeK, src);
    e.chargeT = Math.max(e.chargeT || 0, G.t + 3 * SPASS.alphaChargeK);
    return r;
  };

  // ------------------------------------------------------------ Beta: Bleed damage heals it
  hookOn('hit:late', 'specpass:beta', (e, d, src, crit, hp0) => {
    if (!G || !G.s10 || !src.dot || src.elem !== 'arcane' || !(d > 0) || e.egg || !/\(bleeding\)$/.test(src.wname || '') || !lowBeta()) return;
    const f = clamp((G.player.hp / G.P.maxHp - SPASS.betaFull) / (SPASS.betaBelow - SPASS.betaFull), 0, 1); // 0 at 10% health, 1 at 40%
    const share = SPASS.betaHeal1 + (SPASS.betaHeal0 - SPASS.betaHeal1) * f;
    healPlayer(Math.min(d, Math.max(0, hp0)) * share, true);
  });

  // ------------------------------------------------------------ Redtail: whatever its body touches Ignites
  hookOn('tick', 'specpass:redtail', dt => {
    if (!G || !G.s10 || !G.player || !s10Has('redtail')) return;
    const p = G.player, R = (typeof pdefBubbleR === 'function' && pdefBubbleR()) || p.r;
    forNear(p.x, p.y, R + 3, e => {
      if (e.dead || e.egg || e.charmed || e.phased || e.spTouchT > G.t) return false;
      e.spTouchT = G.t + SPASS.touchEvery;
      burnAdd(fightCd(e), SPASS.touchBurn * G.P.might); e.burnBy = 'Touch Everything';
      fxParts('ember', e.x, e.y, '#ff6a2a', 3, 50, 0.4, 2);
      return false;
    });
  });
})();
