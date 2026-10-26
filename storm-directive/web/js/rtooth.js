'use strict';
// Spawn Prawn - Reverse Tooth Fairy (user, 26 Oct): Eggs (s_toothfairy) Switched at Birth to Blood, holding Homing.
//  - Homing is denied on Eggs (cellmods2.js XC_W deny); it is allowed again once Eggs deals Blood.
//  - With both, Eggs stops leaving bait: each drop becomes 1 + Homing rank teeth that home into enemies (RT.range) and
//    embed (e.rtTeeth). Teeth are Blood hits, so they Bleed.
//  - TEETHING: a bleeding enemy carrying RT.need teeth (one fewer at Homing Rank 3) thrashes for RT.dur seconds: it lurches
//    in a new random direction every RT.turn seconds and bites any enemy it touches (RT.bite of the weapon's damage,
//    Blood, Contact; once per RT.gap per victim). Bosses never thrash; their teeth still Bleed. RT.cap thrash at once.
//  - Homing mastery (Rank 4): every bite plants a tooth in the bitten enemy, so the thrashing spreads.
// Hooks: none in shared files. hookOn tick 'rtTick' and proc 'rtProc'; wraps toys.js toothFire, modOk (after
// cellmods.js), modifiers.js modDraw. Loads after wfusion.js.
const RT = { id: 0, range: 320, need: 3, dur: 3, turn: 0.4, push: 230, bite: 0.6, gap: 0.5, cap: 6, speed: 380 };
const rtIs = w => !!(w && !w.isSpell && w24Key(w) === 's_toothfairy');
const rtBlood = w => rtIs(w) && w.def && w.def.elem === 'arcane';
const rtOn = w => rtBlood(w) && modCount(w, 'homing') > 0;
const rtLive = e => e && !e.dead && !e.charmed && !e.egg && !e.phased;
const rtBleeding = e => !!(e.bleeds && e.bleeds.length);

function rtFire(w, target) {
  const s = w.s, p = G.player, n = 1 + Math.min(4, modCount(w, 'homing')), taken = new Set();
  for (let i = 0; i < n; i++) {
    let t = null, bd = 1e9;
    forNear(p.x, p.y, RT.range, e => { if (!rtLive(e) || taken.has(e)) return; const d = Math.hypot(e.x - p.x, e.y - p.y) + (e.rtTeeth || 0) * 40; if (d < bd) { bd = d; t = e; } });
    t = t || target; if (!t) break; taken.add(t);
    const a = Math.atan2(t.y - p.y, t.x - p.x) + (i - (n - 1) / 2) * 0.35;
    const pr = spawnProj(w, p.x, p.y, a, Object.assign(weaponSrc(w), { rtTooth: ++RT.id }), { r: 3.5, speed: RT.speed, vx: Math.cos(a) * RT.speed, vy: Math.sin(a) * RT.speed, life: 1.4, dmg: s.dmg, pierce: 0, style: 'needle', color: '#fff6e8', bounce: 0, homing: 9 });
    if (pr) pr.tgt = t;
  }
  return true;
}
function rtTeeth(e, w, k) {
  if (!rtLive(e)) return;
  e.rtTeeth = (e.rtTeeth || 0) + (k || 1); e.rtW = w;
  const need = RT.need - (modCount(w, 'homing') >= 3 ? 1 : 0);
  if (!e.boss && !e.rival && !(e.rtEnd > G.t) && e.rtTeeth >= need && rtBleeding(e) && G.enemies.filter(o => o.rtEnd > G.t && !o.dead).length < RT.cap) {
    e.rtEnd = G.t + RT.dur; e.rtTurn = 0; floatText(e.x, e.y - e.r - 12, 'TEETHING', '#ff758f', 11, 0.8);
  }
}
function rtProc(e, dmg, src) { // (one tooth counts once: a hit can be announced twice with a copy of its src)
  if (!src || !src.rtTooth || !src.w) return;
  const S = e.rtIds || (e.rtIds = new Set()); if (S.has(src.rtTooth)) return; S.add(src.rtTooth);
  rtTeeth(e, src.w);
}
function rtTick(dt) {
  if (!G || G.state !== 'play') return;
  for (const e of G.enemies) {
    if (!(e.rtEnd > G.t) || !rtLive(e)) continue;
    const w = e.rtW; if (!w || !w.s) { e.rtEnd = 0; continue; }
    if (!(e.rtTurn > G.t)) { e.rtTurn = G.t + RT.turn; const a = Math.random() * TAU; e.kx = Math.cos(a) * RT.push; e.ky = Math.sin(a) * RT.push; }
    forNear(e.x, e.y, e.r + 30, o => {
      if (o === e || !rtLive(o) || Math.hypot(o.x - e.x, o.y - e.y) > o.r + e.r + 4) return;
      const B = o.rtBit || (o.rtBit = new Map()); if (B.get(e) > G.t) return; B.set(e, G.t + RT.gap);
      damageEnemy(o, w.s.dmg * RT.bite, Object.assign(weaponSrc(w), { atk: 'contact', noProc: true, wupEcho: true, rtBite: 1 }));
      if (modCount(w, 'homing') >= 4 && !o.dead) rtTeeth(o, w);
    });
  }
}
hookOn('tick', 'rtTick', dt => rtTick(dt));
hookOn('proc', 'rtProc', (e, dmg, src) => rtProc(e, dmg, src));

toothFire = (orig => function (w, target) { return rtOn(w) ? rtFire(w, target) : orig.apply(this, arguments); })(toothFire);
modOk = (orig => function (w, id) {
  if (id === 'homing' && rtBlood(w) && !w.wfIn) return modCount(w, 'homing') < MODS10.homing.max; // (allowed once Eggs deals Blood)
  return orig.apply(this, arguments);
})(modOk);
modDraw = (orig => function () {
  orig.apply(this, arguments);
  if (!G) return;
  ctx.save(); ctx.fillStyle = col('#fff6e8'); ctx.strokeStyle = col('#c9184a');
  for (const e of G.enemies) {
    if (!e.rtTeeth || e.dead) continue;
    const n = Math.min(6, e.rtTeeth), frenzy = e.rtEnd > G.t, jx = frenzy ? (Math.random() - 0.5) * 3 * S : 0;
    for (let i = 0; i < n; i++) { const a = i / n * TAU + e.x * 0.01, x = sx(e.x + Math.cos(a) * e.r * 0.7) + jx, y = sy(e.y + Math.sin(a) * e.r * 0.7); ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.moveTo(x - 2 * S, y); ctx.lineTo(x + 2 * S, y); ctx.lineTo(x, y + 4 * S); ctx.closePath(); ctx.fill(); }
    if (frenzy) { ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(e.x) + jx, sy(e.y), (e.r + 6) * S, 0, TAU); ctx.stroke(); }
  }
  ctx.restore();
})(modDraw);
