'use strict';
// Spawn Prawn - run events. Every couple of minutes something unexpected happens: a frenzy, a bounty, a
// shower of kidney stones. From level 40 they turn DIRE: nastier, twice as often, sometimes two at once,
// and they pay out more. Called from update() (updateEvents) and from killEnemy (eventKill).

const EVENT_FIRST_LV = 6, DIRE_LV = 40;
// Multipliers the rest of the game reads (all 1 when nothing is on).
const EVM0 = { espd: 1, out: 1, in: 1, xp: 1, pspd: 1, ram: 1, contact: 1, fire: 1, bulspd: 1, dark: 0, mitosis: 0, tideX: 0, tideY: 0 };

const GOLDEN_DEF = { id: 'golden', name: 'Golden Swimmer', hp: 55, speed: 115, armour: 0, r: 15, dmg: 0, xp: 60, color: '#ffd23f', shape: 'sperm', ai: 'flee', from: 99999, w: 0 };
const BOUNTY_NAMES = ['Gary From Accounts', 'The Other Twin', 'Big Kev', 'Tadpole Terry', 'Swimmy McSwimface', 'Lance the Lancer', 'Your Evil Clone', 'Mr Motility'];

// mods(dire): multipliers while it runs. start/tick/end(dire, ev): what it does. win: what decides a payout.
const RUN_EVENTS = {
  frenzy: { name: 'FEEDING FRENZY', color: '#ff4d6d', dur: 25, w: 3,
    desc: d => `Everything swims ${d ? 70 : 40}% faster. XP doubled.`, mods: d => ({ espd: d ? 1.7 : 1.4, xp: 2 }) },
  glass: { name: 'GLASS WOMB', color: '#9ef0ff', dur: 25, w: 2.5,
    desc: d => `You deal and take x${d ? 2.5 : 2} damage.`, mods: d => ({ out: d ? 2.5 : 2, in: d ? 2.5 : 2 }) },
  sugar: { name: 'SUGAR RUSH', color: '#ffd23f', dur: 20, w: 2.5,
    desc: d => `You swim 60% faster, ram x3, contact hurts half as much.${d ? ' So do they: enemies 30% faster.' : ''}`,
    mods: d => ({ pspd: 1.6, ram: 3, contact: 0.5, espd: d ? 1.3 : 1 }) },
  bullethell: { name: 'BULLET HELL', color: '#e056fd', dur: 20, w: 2.5,
    desc: d => `Shooters fire x${d ? 2.6 : 2} as often. Survive: heal 30% and +${d ? '2 rerolls' : '1 reroll'}.`,
    mods: d => ({ fire: d ? 2.6 : 2, bulspd: 1.2 }),
    start: d => { for (let k = 0; k < (d ? 6 : 3); k++) { const s = spawnPos(); G.enemies.push(makeEnemy(ENEMIES.spitter, s.x, s.y, { elite: d && k === 0 })); } },
    end: d => { healPlayer(G.P.maxHp * 0.3); G.rerolls += d ? 2 : 1; return d ? 'HEALED, +2 REROLLS' : 'HEALED, +1 REROLL'; } },
  stones: { name: 'KIDNEY STONE SHOWER', color: '#ffb347', dur: 20, w: 2.5,
    desc: () => 'Stones rain down. They crush everything they land on, you included.',
    tick: (d, ev, dt) => {
      ev.acc = (ev.acc || 0) + dt;
      const gap = d ? 0.28 : 0.45;
      while (ev.acc >= gap) {
        ev.acc -= gap;
        const p = me(), a = Math.random() * TAU, r = Math.random() < 0.3 ? rand(0, 40) : rand(60, 300);
        const x = p.x + Math.cos(a) * r + (p.vx || 0) * 0.6, y = p.y + Math.sin(a) * r + (p.vy || 0) * 0.6, R = rand(42, 64);
        addHazard(x, y, R, 0.2, 16 * dmgMul(G.t) * (d ? 1.4 : 1), '#ffb347', 'Kidney stones', 0.9);
        after(0.9, () => {
          forNear(x, y, R, e => { if (!e.charmed && !e.egg) damageEnemy(e, (e.boss ? 0.02 : 0.45) * e.maxHp + 30 * hpMul(G.t), { elem: 'phys', wname: 'Kidney stones', noCrit: true, knock: 160, kx: e.x - x, ky: e.y - y }); });
          ring(x, y, R, '#ffb347', 0.3, 4); spawnPart(x, y, '#ffd6a5', 6, 140, 0.4, 3);
          cam.shake = Math.min(6, cam.shake + 1);
        });
      }
    } },
  horde: { name: 'THE HORDE', color: '#ff4d6d', dur: 20, w: 2.5,
    desc: d => `Surrounded. Survive 20s for ${d ? 'two gold chests' : 'a gold chest'}.`,
    tick: (d, ev, dt) => {
      ev.acc = (ev.acc == null ? 99 : ev.acc) + dt;
      if (ev.acc < 4) return;
      ev.acc = 0;
      const p = me(), n = d ? 22 : 14, R = Math.hypot(W / S0, H / S0) / 2 + 30;
      const def = G.t > 400 ? pick([ENEMIES.skitter, ENEMIES.brute, ENEMIES.crawler]) : G.t > 150 ? ENEMIES.skitter : ENEMIES.crawler;
      for (let i = 0; i < n && G.enemies.length < CAPS.enemies; i++) { const a = i / n * TAU; G.enemies.push(makeEnemy(def, p.x + Math.cos(a) * R, p.y + Math.sin(a) * R)); }
    },
    end: d => { for (let i = 0; i < (d ? 2 : 1); i++) G.lootQueue.push({ kind: 'chest' }); return d ? 'TWO CHESTS' : 'CHEST'; } },
  golden: { name: 'GOLDEN SWIMMER', color: '#ffd23f', dur: 20, w: 2, win: 'kill',
    desc: d => `A golden sperm is running off with ${d ? 'two chests' : 'a chest'}. Catch it within 20s.`,
    start: d => { const s = spawnPos(), e = makeEnemy(GOLDEN_DEF, s.x, s.y); e.armour = 0; e.evTag = 'golden'; if (d) { e.speed *= 1.15; e.hp *= 1.5; e.maxHp *= 1.5; } G.enemies.push(e); return e; },
    end: (d, ev) => { const e = ev.target; if (e && !e.dead) { e.dead = true; spawnPart(e.x, e.y, '#ffd23f', 14, 160, 0.6); } return null; },
    reward: (d, e) => { for (let i = 0; i < (d ? 2 : 1); i++) G.pickups.push(makePickup('chest', e.x + i * 24, e.y)); return d ? 'TWO CHESTS' : 'CHEST'; } },
  bounty: { name: 'MOST WANTED', color: '#ffd23f', dur: 60, w: 2, win: 'kill',
    desc: d => `A bounty target is loose. Kill it within 60s: ${d ? 'two chests' : 'a chest'} and 2 rerolls.`,
    start: d => {
      const s = spawnPos(), def = pick([ENEMIES.brute, ENEMIES.bulwark, ENEMIES.juggernaut, ENEMIES.warlock, ENEMIES.charger]);
      const e = makeEnemy(def, s.x, s.y, { elite: true });
      const k = d ? 9 : 6;
      e.hp *= k; e.maxHp *= k; e.r *= 1.3; e.dmg *= 1.3; e.xp *= 4; e.evTag = 'bounty'; e.name = 'WANTED: ' + pick(BOUNTY_NAMES);
      G.enemies.push(e);
      return e;
    },
    end: (d, ev) => { const e = ev.target; if (e && !e.dead) { e.elite = false; e.evTag = null; floatText(e.x, e.y - e.r - 12, 'GOT AWAY', '#ffffff', 14); } return null; },
    reward: (d, e) => { for (let i = 0; i < (d ? 2 : 1); i++) G.pickups.push(makePickup('chest', e.x + i * 24, e.y)); G.rerolls += 2; return 'BOUNTY PAID'; } },
  blackout: { name: 'LIGHTS OUT', color: '#b8c0ff', dur: 25, w: 2,
    desc: d => `Someone switched off the microscope lamp. XP doubled.${d ? ' Elites are out hunting.' : ''}`,
    mods: () => ({ dark: 1, xp: 2 }),
    start: d => { if (d) for (let k = 0; k < 3; k++) { const s = spawnPos(); G.enemies.push(makeEnemy(pick([ENEMIES.brute, ENEMIES.charger, ENEMIES.lancer]), s.x, s.y, { elite: true })); } } },
  tide: { name: 'WATERS BREAKING', color: '#48cae4', dur: 20, w: 2, minLv: 25,
    desc: () => 'A strong current sweeps everything one way. Swim with it and you ram for free.',
    mods: (d, ev) => ({ tideX: Math.cos(ev.ang) * (d ? 120 : 85), tideY: Math.sin(ev.ang) * (d ? 120 : 85), ram: 1.5 }),
    start: (d, ev) => { ev.ang = Math.random() * TAU; } },
  mitosis: { name: 'MITOSIS', color: '#43e97b', dur: 20, w: 2.5, minLv: DIRE_LV,
    desc: () => 'Everything that dies splits in two. XP x1.5.', mods: () => ({ mitosis: 1, xp: 1.5 }) },
};

function newEvents() { return { next: 0, active: [], recent: [], n: 0 }; }

function updateEvents(dt) {
  const V = G.ev || (G.ev = newEvents());
  const dire = G.level >= DIRE_LV;
  // Run the active ones.
  for (const ev of V.active) {
    const E = RUN_EVENTS[ev.id];
    ev.left -= dt;
    if (E.tick) E.tick(ev.dire, ev, dt);
    if (E.win === 'kill' && ev.target && ev.target.dead && !ev.paid) {
      ev.paid = true; ev.left = 0;
      const what = E.reward(ev.dire, ev.target);
      banner(E.name + ': ' + what, PAL.reward); sfx('level');
      G.stats.events = (G.stats.events || 0) + 1;
    }
    if (ev.left <= 0 && !ev.over) {
      ev.over = true;
      const what = E.end ? E.end(ev.dire, ev) : null;
      if (!E.win) G.stats.events = (G.stats.events || 0) + 1;
      if (what) { banner(E.name + ' SURVIVED: ' + what, PAL.reward); sfx('level'); }
      else if (E.win === 'kill' && !ev.paid) banner(E.name + ': MISSED IT', XR.dim);
    }
  }
  V.active = V.active.filter(ev => !ev.over);
  // Fold the multipliers.
  const m = Object.assign({}, EVM0);
  for (const ev of V.active) {
    const E = RUN_EVENTS[ev.id];
    if (!E.mods) continue;
    const o = E.mods(ev.dire, ev);
    for (const k in o) { if (k === 'dark' || k === 'mitosis') m[k] = 1; else if (k === 'tideX' || k === 'tideY') m[k] += o[k]; else m[k] *= o[k]; }
  }
  G.evm = m;
  // Schedule the next one (never during a boss, the Final Five or the swim to the egg).
  if (!V.next) V.next = G.t + 100;
  if (G.level < EVENT_FIRST_LV || G.t < V.next) return;
  if (G.boss || G.showdown || G.fertile || V.active.length) { V.next = G.t + 8; return; }
  V.next = G.t + (dire ? rand(45, 65) : rand(80, 110));
  startEvent(dire);
  if (dire && Math.random() < 0.3) startEvent(dire, true);
}

function startEvent(dire, second) {
  const V = G.ev;
  const ids = Object.keys(RUN_EVENTS).filter(id => !(RUN_EVENTS[id].minLv > G.level) && !V.recent.includes(id) && !V.active.some(ev => ev.id === id));
  if (!ids.length) return;
  let tot = ids.reduce((a, id) => a + RUN_EVENTS[id].w, 0), x = Math.random() * tot, id = ids[0];
  for (const k of ids) { x -= RUN_EVENTS[k].w; if (x <= 0) { id = k; break; } }
  const E = RUN_EVENTS[id], ev = { id, dire, left: E.dur, max: E.dur };
  if (E.start) { const t = E.start(dire, ev); if (t && t.x != null) ev.target = t; }
  V.active.push(ev);
  V.recent.push(id); if (V.recent.length > 4) V.recent.shift();
  V.n++;
  const title = (dire ? 'DIRE ' : '') + E.name;
  if (!second) { banner(title, E.color); sfx('boss'); vibrate(80); }
  G.evNote = { text: (second ? 'AND ' + title + ': ' : '') + E.desc(dire), t: 4.5 };
  casaLog(`EVENT: ${title}`);
}

// Kills during events (from killEnemy).
function eventKill(e) {
  if (!G.evm || !G.evm.mitosis || e.boss || e.rival || e.egg || e.charmed || e.final || e.mitoKid || e.bossDef || e.evTag) return;
  for (let i = 0; i < 2 && G.enemies.length < CAPS.enemies; i++) {
    const a = Math.random() * TAU, k = makeEnemy(e.def, e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r);
    k.hp = k.maxHp = e.maxHp * 0.4; k.r = e.r * 0.75; k.xp = e.xp * 0.5; k.mitoKid = true; k.kx = Math.cos(a) * 160; k.ky = Math.sin(a) * 160;
    G.enemies.push(k);
  }
}
