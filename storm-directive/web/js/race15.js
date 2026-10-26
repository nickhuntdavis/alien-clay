'use strict';
// Spawn Prawn - the 15-minute race to the egg (user, 20 Oct).
//  - The egg opens for you at RACE15.len seconds (15:00), or sooner: reach EGG.level, or get the sperm count to 1.
//    Getting there early pays RACE15.early DNA per minute to spare, on a win (raceDnaBonus, meta.js runDna).
//  - The race is stretched to fit: the difficulty clock runs at real time (PACE), rivals take RIVAL.finish to reach
//    the egg level, the sperm count's time share fills over COUNT.time, and the "behind pace" curve expects
//    EGG.level at RACE15.curveT. Rivals reach the egg level around 13 to 15 minutes but only go for the egg from
//    15:00 (raceRivalEgg), so they start cracking it as the timer opens it.
//  - Rival track (Immersive mode): a thin line under the menu buttons with a dot for you and each rival, placed by
//    level, the egg at the right end and a tick for the clock. Tap it: the full standings in a small overlay while
//    the slide runs at RACE15.slow speed.
// Hooks: wraps game.js dmgMul (the Fever Pitch hold); game.js autoSteer -> raceEggSteer, acquire -> raceEggPick; game.js eggBreakable -> raceEggOpen, levelsAhead -> raceCurveT, PT and spawn rate -> racePace, gainXp -> raceXp,
// canvas tap -> raceTap;
// render.js drawHud -> raceHud, raceTrackH, behind-pace chip -> raceCurveT, drawTopBar -> raceClock;
// rivals.js updateShowdown -> raceTick, rival egg mode -> raceRivalEgg; inspect.js inspectMul -> raceMul; meta.js runDna -> raceDnaBonus.

const RACE15 = { len: 900, curveT: 690, early: 20, slow: 0.1, pace: 1.0, xp: 1.8, rivalFinish: 860, countTime: 810, surgeLag: 180, touch: 80, eggPull: [4, 3.5], eggRange: 0.8, eggBand: 40, eggBuds: 2, budR: 260, budPick: 0.2 }; // (eggPull: autorun's pull to the egg once it is breakable, before and after it wakes, game.js autoSteer; was 1.8 and 1.4, which lost to dodging) // (touch: how close to the egg's edge counts as swimming into it, game.js eggTick)
// Fever Pitch (game.js SURGE_T, 15:00) used to start the moment the egg opened, so every egg fight ran inside a damage
// spiral (x1.3 a minute). In a race, enemy damage holds at its 15:00 level for RACE15.surgeLag seconds, then grows again.
{ const dm0 = dmgMul; dmgMul = function (t) { return dm0(raceOn() && t > SURGE_T ? Math.max(SURGE_T, t - RACE15.surgeLag) : t); }; }
// Race-only numbers (the Petri Dish, Endless and the levels keep theirs).
{ const F = RIVAL.finish, T = COUNT.time;
  Object.defineProperty(RIVAL, 'finish', { get: () => (raceOn() ? RACE15.rivalFinish : F) });
  Object.defineProperty(COUNT, 'time', { get: () => (raceOn() ? RACE15.countTime : T) }); }
const racePace = () => (raceOn() ? RACE15.pace : PACE); // (game.js PT and the spawn rate)
const raceXp = () => (raceOn() ? RACE15.xp : 1); // (game.js gainXp: fewer monsters on the slower clock, each worth more)
// Autorun's egg fight (game.js autoSteer, once you have woken the egg): hold a ring at RACE15.eggRange of your weapons'
// reach (inside its healing glow, CORE.sanctuary), circling it, instead of drifting off while dodging its rings.
function raceEggSteer(p, cdist, goal, add, pull) {
  const c = G.core, rs = ownedWeapons().map(w => w.s && w.s.range).filter(r => r > 0).sort((a, b) => a - b);
  const R = clamp((rs.length ? rs[Math.floor(rs.length / 2)] : 300) * RACE15.eggRange, CORE.r + 70, CORE.sanctuary), ux = (p.x - c.x) / (cdist || 1), uy = (p.y - c.y) / (cdist || 1);
  if (cdist > R + RACE15.eggBand) goal(c.x, c.y, pull);
  else if (cdist < R - RACE15.eggBand) add(ux * 1.2, uy * 1.2);
  add(-uy * 0.8, ux * 0.8);
}
// game.js acquire: the share of target picks that go to the egg (0.5), less while RACE15.eggBuds of its bodyguards are
// within RACE15.budR of you, so autorun clears them first.
function raceEggPick(x, y) {
  if (!raceOn()) return 0.5;
  let n = 0; for (const e of G.enemies) if (e.eggBud && !e.dead && Math.hypot(e.x - x, e.y - y) < RACE15.budR && ++n >= RACE15.eggBuds) return RACE15.budPick;
  return 0.5;
}
// Rivals keep racing at Lv 60 but only head for the egg from 15:00 (rivals.js; user, 20 Oct).
const raceRivalEgg = () => !raceOn() || G.t >= RACE15.len;

const raceOn = () => !!(G && !G.wave && !G.lvl && !(G.debug) && typeof UI !== 'undefined' && UI.sample !== 's000' && UI.sample !== 's010');
const raceCurveT = () => RACE15.curveT;
const raceLeft = () => Math.max(0, RACE15.len - (G ? G.t : 0));
const raceEggOpen = () => raceOn() && G.t >= RACE15.len;
const mmss = t => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; };

// The top bar's clock: time left to the egg in a race, time played elsewhere.
function raceClock(m, s) {
  if (!raceOn() || eggBreakable()) return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  return 'EGG ' + mmss(raceLeft());
}

// Every frame of a race: the egg opening on time, and the early arrival.
function raceTick() {
  if (!raceOn() || G.state !== 'play') return;
  const R = G.race || (G.race = {});
  if (R.openT == null && eggBreakable()) {
    R.openT = G.t;
    const spare = Math.floor(raceLeft() / 60);
    if (G.t < RACE15.len && spare > 0) { banner(`THE EGG IS OPEN. ${spare} MIN TO SPARE`, PAL.reward); sysMsg('RACE UPDATE', `You got there with ${mmss(raceLeft())} on the clock. Break the membrane and the lab pays ${spare * RACE15.early} DNA extra for the hurry.`, PAL.reward, true); }
    else if (!G.fertile && G.level < EGG.level) { banner('15:00. THE EGG IS OPEN', PAL.reward); sysMsg('RACE UPDATE', 'Time is up and the egg has stopped waiting for anyone better. Swim in.', PAL.reward, true); }
    sfx('level'); vibrate(120);
  }
}
// DNA for minutes to spare, on a win (meta.js runDna).
const raceDnaBonus = (g, won) => (won && g.race && g.race.openT != null && g.race.openT < RACE15.len ? Math.floor((RACE15.len - g.race.openT) / 60) * RACE15.early : 0);

// ---------------------------------------------------------------- the rival track (Immersive mode)
const raceTrackOn = () => raceOn() && immersiveOn() && G.rivalsInit && typeof rivalBoard === 'function';
const raceTrackH = () => (raceTrackOn() ? 18 : 0); // (render.js: the status chip row moves down to make room)
function raceHud(top) {
  if (!raceTrackOn()) return;
  const x0 = 16, x1 = W - 84, y = top + 66, rows = rivalBoard();
  const rx = lv => x0 + (x1 - x0) * clamp((lv - 1) / (EGG.level - 1), 0, 1);
  const rawc = RAW_COL; RAW_COL = true;
  ctx.save(); ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff'; ctx.fillRect(x0, y - 0.5, x1 - x0, 1);
  // The clock: a tick that walks to the egg over 15 minutes.
  const tx = x0 + (x1 - x0) * clamp(G.t / RACE15.len, 0, 1);
  ctx.globalAlpha = 0.6; ctx.fillRect(tx - 0.5, y - 5, 1, 10);
  // The egg.
  ctx.globalAlpha = 0.9; ctx.strokeStyle = '#ffd6e8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x1 + 8, y, 5, 0, TAU); ctx.stroke();
  // Rivals first, you on top.
  for (const r of rows.filter(r => !r.you)) {
    ctx.globalAlpha = r.out ? 0.25 : 0.85; ctx.fillStyle = r.color;
    ctx.beginPath(); ctx.arc(rx(r.out ? 1 : r.lvl), y, 3.5, 0, TAU); ctx.fill();
  }
  const me = rows.find(r => r.you);
  if (me) {
    const mx = rx(me.lvl);
    ctx.globalAlpha = 1; ctx.fillStyle = PAL.you; ctx.beginPath(); ctx.arc(mx, y, 5, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(mx, y, 7, 0, TAU); ctx.stroke();
  }
  ctx.restore(); RAW_COL = rawc;
  UI.raceRect = { x: x0 - 8, y: y - 10, w: x1 - x0 + 30, h: 20 };
}
// game.js canvas tap: the track opens the standings.
function raceTap(ev) {
  const r = UI.raceRect;
  if (!raceTrackOn() || !r || ev.clientX < r.x || ev.clientX > r.x + r.w || ev.clientY < r.y || ev.clientY > r.y + r.h) return false;
  raceBoardOpen(); return true;
}

// ---------------------------------------------------------------- the standings overlay
function raceBoardOpen() {
  let el = document.getElementById('raceBoard');
  if (!el) {
    el = document.createElement('div'); el.id = 'raceBoard';
    el.addEventListener('pointerdown', e => { e.stopPropagation(); raceBoardClose(); });
    document.body.appendChild(el);
  }
  const rows = rivalBoard();
  const line = (r, i) => `<div class="rb-row${r.you ? ' you' : ''}${r.out ? ' out' : ''}"><span class="rb-n">${r.out ? '-' : i + 1}</span><span class="rb-dot" style="background:${r.color}"></span><span class="rb-name">${esc(r.you ? 'You' : r.name)}</span><span class="rb-lv">${r.out ? 'out' : r.egg ? 'at the egg' : 'Lv ' + r.lvl}</span></div>`;
  el.innerHTML = `<div class="rb-box"><div class="rb-h">THE RACE <em>${eggBreakable() ? 'Egg open' : 'Egg in ' + mmss(raceLeft()) + ' or Lv ' + EGG.level}</em></div>${rows.map(line).join('')}<div class="rb-f">Sperm count ${spermCount().toLocaleString('en-GB')}. Tap to close.</div></div>`;
  el.classList.add('on');
  G.raceBoard = true;
  clearInterval(UI.raceBoardT); UI.raceBoardT = setInterval(() => { if (!G || G.state !== 'play') raceBoardClose(); }, 250); // (a reward screen or the pause menu closes it)
}
function raceBoardClose() { clearInterval(UI.raceBoardT); const el = document.getElementById('raceBoard'); if (el) el.classList.remove('on'); if (G) G.raceBoard = false; }
// inspect.js inspectMul: the slide crawls while the standings are up.
const raceMul = () => (G && G.raceBoard ? (G.state === 'play' ? RACE15.slow : 1) : 1);
