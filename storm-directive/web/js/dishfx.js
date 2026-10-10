'use strict';
// Spawn Prawn - wave conditions (Petri Dish wave mode). From wave 4, about half the ordinary waves come with
// something wrong in the dish for the whole wave: a blown lamp, a stirring rod, agar set too thick, a leaky
// drip tray, the incubator on high. Never two waves running. They ride the event system (events.js: entries
// in RUN_EVENTS with w: 0, so they never turn up at random), so their multipliers (G.evm) work everywhere
// events already do, and waveClear ends them.
// Hooks: campaign.js campBegin (dishFxBegin); render.js drawEventBar (ev.wave: no countdown).

const DISH_FX = { from: 4, chance: 0.5 };
Object.assign(RUN_EVENTS, {
  fxdark: { name: 'LAMP BLOWN', color: '#b8c0ff', dur: 1e9, w: 0,
    desc: () => 'The microscope lamp has gone. You can only see what is close to you. +20% XP.',
    mods: () => ({ dark: 1, xp: 1.2 }) },
  fxstir: { name: 'STIRRING ROD', color: '#48cae4', dur: 1e9, w: 0,
    desc: () => 'Someone is stirring the dish. A current sweeps everything along, and it keeps turning.',
    mods: (d, ev) => ({ tideX: Math.cos(ev.ang || 0) * 70, tideY: Math.sin(ev.ang || 0) * 70, ram: 1.3 }),
    tick: (d, ev, dt) => { ev.ang = (ev.ang == null ? Math.random() * TAU : ev.ang) + dt * 0.22; } },
  fxagar: { name: 'THICK AGAR', color: '#e9c46a', dur: 1e9, w: 0,
    desc: () => 'The agar set too thick. Everything swims a quarter slower, you included, and so do the bullets.',
    mods: () => ({ espd: 0.75, pspd: 0.8, bulspd: 0.75 }) },
  fxdrip: { name: 'LEAKY DRIP TRAY', color: '#9ef01a', dur: 1e9, w: 0,
    desc: () => 'Drops of acid keep landing in the dish. Swim out of the rings before they land. They burn enemies too.',
    tick: (d, ev, dt) => {
      ev.acc = (ev.acc || 0) + dt;
      while (ev.acc >= 1.1) {
        ev.acc -= 1.1;
        const p = me(), a = Math.random() * TAU, r = rand(40, 340), R = rand(46, 70);
        const line = Math.random() < 0.35; // (some land right where you are heading)
        let x = p.x + (p.vx || 0) * (line ? 0.6 : 0.5) + (line ? 0 : Math.cos(a) * r), y = p.y + (p.vy || 0) * (line ? 0.6 : 0.5) + (line ? 0 : Math.sin(a) * r);
        const c = G.core, d = Math.hypot(x - c.x, y - c.y), Rd = CORE.arena - DISH_IN; if (d > Rd) { x = c.x + (x - c.x) / d * Rd; y = c.y + (y - c.y) / d * Rd; }
        addHazard(x, y, R, 0.25, 12 * dmgNow(), '#9ef01a', 'Acid drip', 1.0);
        after(1.0, () => { if (!G || !G.wave || !G.wave.active) return; forNear(x, y, R, e => { if (!e.charmed && !e.egg) damageEnemy(e, (e.boss ? 0.01 : 0.3) * e.maxHp + 20 * hpNow(), { elem: 'fire', wname: 'Acid drip', noCrit: true }); }); ring(x, y, R, '#9ef01a', 0.3, 4); });
      }
    } },
  fxheat: { name: 'INCUBATOR ON HIGH', color: '#ff7a2f', dur: 1e9, w: 0,
    desc: () => 'It is 41 degrees in here. Everything swims faster and shooters fire more often. +20% XP.',
    mods: () => ({ espd: 1.2, pspd: 1.1, fire: 1.3, xp: 1.2 }) },
});
const DISH_FX_IDS = ['fxdark', 'fxstir', 'fxagar', 'fxdrip', 'fxheat'];

// An ordinary wave just began: maybe something is wrong with the dish.
function dishFxBegin(V) {
  if (!V.camp || V.n < DISH_FX.from || V.lastFx === V.n - 1 || Math.random() >= DISH_FX.chance) return;
  const id = pick(DISH_FX_IDS.filter(k => k !== V.fxId));
  V.fxId = id; V.lastFx = V.n;
  const E = RUN_EVENTS[id], ev = { id, dire: false, left: E.dur, max: E.dur, wave: true };
  G.ev.active.push(ev);
  after(1.4, () => { if (!G || !G.wave || !G.wave.active) return; banner(E.name, E.color); sysMsg('THE LAB TECH', E.desc(false, ev), E.color); });
}
