'use strict';
// Spawn Prawn - a sharper start to the race (user, 28 Oct): ordinary enemies spawned in the first RACE_EARLY.fade seconds
// are tougher, hit harder and swim faster, fading to normal by 3:00. Not more of them: extra early spawns only fed XP.
// Why: early mobs (Also-Ran hit 3, Krill 1.3, against 138 health) spawned about 800 away and mostly never caught you;
// the bot took 1 to 24 damage a minute in minutes 1 and 2 (tests/sim/early.js). Bosses and rivals (def.patterns) and
// the Petri Dish, Endless waves and levels (raceOn) are untouched.
// Hooks: wraps game.js makeEnemy.

const RACE_EARLY = { fade: 180, hp: 1.0, dmg: 1.5, speed: 0.4 }; // (extra share at 0:00, falling to none at fade: sim J/L, 28 Oct)
{ const mk = makeEnemy;
  makeEnemy = function (def, x, y, opts) {
    const e = mk(def, x, y, opts);
    if (raceOn() && G.t < RACE_EARLY.fade && !def.patterns && !e.boss) {
      const f = 1 - G.t / RACE_EARLY.fade, kh = 1 + RACE_EARLY.hp * f;
      e.hp *= kh; e.maxHp *= kh; e.dmg *= 1 + RACE_EARLY.dmg * f; e.speed *= 1 + RACE_EARLY.speed * f;
    }
    return e;
  }; }
