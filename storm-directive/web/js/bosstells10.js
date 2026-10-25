'use strict';
// Spawn Prawn - boss telegraphs (COMBAT_MATRIX 13.4: any attack that can do significant damage shows where and when).
// No boss number changes: each tell either sits inside the gap the attack already had or moves the attack back by the tell time.
//   Charge  (Colossus, Twins: pattern 'charge')  A soft lane under the wind-up (the 0.8 s st 1 in game.js), as long as the dash goes.
//   Blink   (Phantom, Immune Eye)                A marker where it will land, shown for the 0.5 s before each jump (same 1.6 s rhythm); after it lands
//                                                the 14-bullet ring waits 0.3 s (no ring on arrival).
//   Ward round (Matron)                          A ring at the heal radius for 1 s, then the heal and the nurses. The last 0.6 s also pulses the boss.
//   Summon  (Queen)                              A pulse on the boss for 0.6 s, then the adds.
//   Fire ring (Fever)                            An outline where the scalding ground lands, shown for the last 0.7 s of the 1.0 s gap.
// State lives on the boss (e.tl10), so nothing is saved. bossAI (game.js) is wrapped: while a hold is on, the original runs with
// its pattern clock paused (movement still works) and without ever reaching the attack.
// Hooks: wraps bossAI (game.js) and nf10Draw (newfoes.js). Save data: none.

const BT10 = { blinkTell: 0.5, blinkRing: 0.3, blinkGap: 1.6, ward: 1.0, wardPulse: 0.6, summon: 0.6, fire: 0.7, wardR: 650, chargeTime: 0.9, chargeK: 6 };
const bt10St = e => e.tl10 || (e.tl10 = { lastPat: 99, run: 0 });

// Pattern clock paused for a frame: the original still steers the boss but cannot reach the attack (it returns while patT < 0.6).
function bt10Hold(e, dt, dist, ux, uy) {
  const saved = e.patT;
  e.patT = 0;
  bt10AI0(e, dt, dist, ux, uy);
  e.patT = saved + dt;
}

const bt10AI0 = bossAI;
bossAI = function (e, dt, dist, ux, uy) {
  const pat = e.def.patterns[e.pat], s = bt10St(e);
  if (e.patT < s.lastPat) { s.run++; s.flag = null; s.t = 0; s.blinkT = 0.6; s.dest = null; } // (a new pattern run; the first jump lands when the original's did, 0.6 s in, its tell inside the pause)
  s.lastPat = e.patT;
  s.pat = pat;
  if (s.ringT > 0) { // the blink's ring, 0.3 s after it lands
    s.ringT -= dt;
    if (s.ringT <= 0) {
      const bd = e.def.dmg * 0.35 * dmgNow() * (e.campK || 1);
      for (let i = 0; i < 14; i++) eBullet(e.x, e.y, i / 14 * TAU, 125, bd, 6, '#7b2cbf');
      ring(e.x, e.y, 70, '#c77dff', 0.4, 4);
    }
  }
  if (e.patT + dt * 1.5 >= 0.6) { // (the original pauses 0.6 s at the start of each pattern; check one step ahead so the first frame is held too)
    if (pat === 'summon' && e.st === 0) {
      s.t = (s.t || 0) + dt;
      if (s.t < BT10.summon) return bt10Hold(e, dt, dist, ux, uy);
    } else if (pat === 'wardround' && e.st === 0) {
      s.t = (s.t || 0) + dt;
      if (s.t < BT10.ward) return bt10Hold(e, dt, dist, ux, uy);
    } else if (pat === 'firering' && !s.flag) {
      s.flag = 1; e.fireT = BT10.fire; // the first ring waits as long as the tell
    }
  }
  if (pat === 'blink') return bt10Blink(e, dt, dist, ux, uy, s);
  return bt10AI0(e, dt, dist, ux, uy);
};

// The blink is run here (the same jump and ring as game.js, with the destination chosen early and the ring late).
function bt10Blink(e, dt, dist, ux, uy, s) {
  e.fireT = 99; // the original never reaches its own blink
  bt10AI0(e, dt, dist, ux, uy);
  if (e.dead || e.frozen > 0) return;
  s.blinkT -= dt;
  if (s.blinkT <= BT10.blinkTell && !s.dest) {
    const p = G.player, a = Math.random() * TAU;
    s.dest = { x: p.x + Math.cos(a) * 220, y: p.y + Math.sin(a) * 220 };
  }
  if (s.blinkT <= 0 && s.dest) {
    spawnPart(e.x, e.y, e.color, 14, 160, 0.4);
    e.x = s.dest.x; e.y = s.dest.y; s.dest = null;
    s.blinkT = BT10.blinkGap; s.ringT = BT10.blinkRing; s.arrivedT = G.realT;
  }
}

// ---------------------------------------------------------------- drawing (soft edges, no hard outlines: STYLE.md)
function bt10Pulse(e, k, col) {
  const x = sx(e.x), y = sy(e.y), r = e.r * S, g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * (1.5 + 1.3 * k));
  g.addColorStop(0, col.replace('A', (0.1 + 0.4 * k).toFixed(3))); g.addColorStop(1, col.replace('A', '0'));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * (1.5 + 1.3 * k), 0, TAU); ctx.fill();
}
const bt10Draw0 = nf10Draw;
nf10Draw = function () {
  bt10Draw0();
  if (!G) return;
  for (const e of G.enemies) {
    if (!e.boss || e.dead || !e.tl10) continue;
    const s = e.tl10, pat = e.def.patterns[e.pat], x = sx(e.x), y = sy(e.y), now = G.realT;
    ctx.save();
    if (pat === 'charge' && e.st === 1 && e.dashX != null) { // a soft lane as long as the dash, widest at the boss
      const L = (e.speed * BT10.chargeK * BT10.chargeTime + e.r) * S, a = Math.atan2(e.dashY, e.dashX), w = e.r * S * 0.9, k = 1 - clamp(e.stT / 0.8, 0, 1);
      const g = ctx.createLinearGradient(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L);
      g.addColorStop(0, `rgba(255,70,90,${(0.2 + 0.2 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(255,70,90,0.04)');
      drawChargeFx(x, y, e.r * S, k, 'phys', e.id); // (chargefx.js: the body winds up as well as the lane)
      ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(x - Math.sin(a) * w, y + Math.cos(a) * w); ctx.lineTo(x + Math.cos(a) * L - Math.sin(a) * w, y + Math.sin(a) * L + Math.cos(a) * w);
      ctx.lineTo(x + Math.cos(a) * L + Math.sin(a) * w, y + Math.sin(a) * L - Math.cos(a) * w); ctx.lineTo(x + Math.sin(a) * w, y - Math.cos(a) * w); ctx.closePath(); ctx.fill();
    }
    if (pat === 'blink' && s.dest) { // where it will land: a soft disc that fills as the jump nears
      const k = 1 - clamp((s.blinkT) / BT10.blinkTell, 0, 1), dx = sx(s.dest.x), dy = sy(s.dest.y), R = e.r * S * 1.3;
      const g = ctx.createRadialGradient(dx, dy, R * 0.3, dx, dy, R * 1.6);
      g.addColorStop(0, `rgba(199,125,255,${(0.15 + 0.4 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(199,125,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx, dy, R * 1.6, 0, TAU); ctx.fill();
    }
    if (pat === 'summon' && e.st === 0 && s.t > 0 && s.t < BT10.summon) bt10Pulse(e, s.t / BT10.summon, 'rgba(255,111,168,A)');
    if (pat === 'wardround' && e.st === 0 && s.t > 0 && s.t < BT10.ward) { // where the heal lands, and the nurses coming
      const k = s.t / BT10.ward, R = BT10.wardR * S, g = ctx.createRadialGradient(x, y, R * (0.6 + 0.4 * k), x, y, R * 1.04);
      g.addColorStop(0, 'rgba(255,120,150,0)'); g.addColorStop(0.85, `rgba(255,120,150,${(0.06 + 0.16 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(255,120,150,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * 1.04, 0, TAU); ctx.fill();
      if (s.t > BT10.ward - BT10.wardPulse) bt10Pulse(e, (s.t - (BT10.ward - BT10.wardPulse)) / BT10.wardPulse, 'rgba(255,120,150,A)');
    }
    if (pat === 'firering' && e.fireT > 0 && e.fireT <= BT10.fire && e.patT >= 0.6) { // the scalding ground and the ring's reach
      const k = 1 - e.fireT / BT10.fire, R = e.r * 2.2 * S, g = ctx.createRadialGradient(x, y, R * 0.4, x, y, R * 1.15);
      g.addColorStop(0, `rgba(255,107,53,${(0.12 + 0.3 * k).toFixed(3)})`); g.addColorStop(0.8, `rgba(255,107,53,${(0.1 + 0.25 * k).toFixed(3)})`); g.addColorStop(1, 'rgba(255,107,53,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, R * 1.15, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
};
