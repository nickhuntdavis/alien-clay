'use strict';
// Spawn Prawn - Prawn Again turns Damned under pressure (user, 28 Oct). Replaces its 30 s Holy/Damned clock (holy.js).
//  - THE TRIGGER: the invisible intensity meter (pacing.js, 0 to 1). At PRAWN_D.on (0.8) Prawn Again turns Damned;
//    it turns back once things ease off: the meter is relaxing and has drained to PRAWN_D.off (0.5), or has fallen
//    under PRAWN_D.floor (0.3) any other way. The free modes read pacing.js's own meter (G.pace). The Petri Dish,
//    Endless waves, Level 1 and the Lab Bench do not run one, so Prawn Again keeps a copy there (G.prawnPace) with
//    pacing.js's rules and numbers: kills near you, hits you take and time fill it; a peak, then it drains.
//  - THE STANCE: prawnPol() (+1 Holy, -1 Damned) is what holy.js reads for Prawn Again's mixed soul sources and its
//    stance (holyPolW, holyYouPol), so every Holy/Damned rule follows it (Damned deals and takes 10% more, etc.).
//    The bias cards still pin it: at a Holy chance of 1 or 0 there is no mixed source and no stance.
//  - THE LOOK: the body itself changes (samplelooks.js SL_* prawn wrapped): Holy is the white and gold body with
//    wings, halo and rays; Damned is dark plum with red veins, bat wings, horns, red eyes and purple smoke. The flip
//    flashes, shakes and bursts. While Damned every shot it fires is drawn red and purple.
//  - ENEMIES: an enemy Possessed by a Holy verdict (holy.js e.holyConv) is gold and labelled CONVERTED; while Prawn
//    Again is Damned its Possessed allies take the evil colours instead. A Damned-verdict enemy wears a dark red aura.
// Hooks: render.js enemy draw -> holyCharmCol (tag and rim colour), holyFoeMark (label and aura); holy.js holyPolW and
//   holyYouPol -> prawnPol, holyDrawYou skips Prawn Again. hookOn tick, kill, hurt, fire:after. Save data: none.
// Loads after samplelooks.js, pacing.js and holy.js.

const PRAWN_D = { on: 0.8, off: 0.5, floor: 0.3,
  evil: { body: '#160410', mid: '#3e0a2c', hi: '#7a1446', red: '#ff2a48', vein: '#e0203c', purple: '#9b30e0', smoke: '#3a0a4a' },
  gold: '#ffcf5a' };
HOLY.damned.glow = '#d01c5c'; // (brighter than the old #8a1a50: Damned text, bars and shots read on the dark slide)

// ---------------------------------------------------------------- the meter
const prawnOwnMeter = () => !(typeof paceFree === 'function' && paceFree() && PACING.on && PACING.mode === 'meter');
const prawnMeter = () => (prawnOwnMeter() ? G.prawnPace || (G.prawnPace = { meter: 0, st: 'build', stT: 0 }) : paceS());
const prawnFill = x => { const S = prawnMeter(); if (S.st === 'build') S.meter = Math.min(1, S.meter + x); };
const prawnPol = () => (G && G.prawnD && G.prawnD.on ? -1 : 1);
const prawnDamnedNow = () => !!(G && G.prawnD && G.prawnD.on && typeof holyPrawn === 'function' && holyPrawn());

hookOn('tick', 'prawnd:tick', dt => {
  if (!G || G.state !== 'play' || !holyPrawn()) return;
  if (prawnOwnMeter()) { // (pacing.js paceTick's meter, for the modes that have none)
    const S = prawnMeter(); S.stT += dt;
    if (S.st === 'build') { S.meter += PACING.timeFill * dt; if (S.meter >= 1) { S.meter = 1; S.st = 'peak'; S.stT = 0; } }
    else if (S.st === 'peak') { if (S.stT >= PACING.peakSec) { S.st = 'relax'; S.stT = 0; } }
    else { S.meter = Math.max(0, S.meter - PACING.drain * dt); if (S.meter <= PACING.relaxTo || S.stT >= PACING.relaxMax) { S.st = 'build'; S.stT = 0; } }
  }
  const S = prawnMeter(), D = G.prawnD || (G.prawnD = { on: false, flipT: -9 });
  if (!D.on && S.meter >= PRAWN_D.on) { D.on = true; prawnFlip(-1); }
  else if (D.on && (S.st === 'relax' ? S.meter <= PRAWN_D.off : S.meter < PRAWN_D.floor)) { D.on = false; prawnFlip(1); }
});
hookOn('kill', 'prawnd:kill', e => {
  if (!G || !holyPrawn() || !prawnOwnMeter()) return;
  if (e.boss) { const S = prawnMeter(); S.meter = 1; S.st = 'peak'; S.stT = PACING.peakSec; return; }
  const p = G.player; if (p && Math.hypot(e.x - p.x, e.y - p.y) <= PACING.killR) prawnFill(e.elite ? PACING.eliteFill : PACING.killFill);
});
hookOn('hurt', 'prawnd:hurt', d => { if (G && holyPrawn() && prawnOwnMeter() && G.P && G.P.maxHp > 0) prawnFill(PACING.hurtFill * d / G.P.maxHp); });

// The change itself: a flash, a shake and a burst of light or smoke (holy.js's flip tick names the half).
function prawnFlip(pol) {
  const p = G.player, E = PRAWN_D.evil; G.prawnD.flipT = G.realT;
  cam.shake = Math.min(10, cam.shake + (pol < 0 ? 6 : 3));
  if (pol < 0) {
    ring(p.x, p.y, 140, E.red, 0.7, 7); ring(p.x, p.y, 90, E.purple, 0.5, 5);
    if (typeof fxParts === 'function') { fxParts('smoke', p.x, p.y, E.smoke, 22, 140, 0.9, 5); fxParts('spark', p.x, p.y, E.red, 16, 180, 0.6, 3); }
    vibrate([60, 30, 90]);
  } else {
    G.flashT = Math.max(G.flashT || 0, 0.14);
    ring(p.x, p.y, 120, PRAWN_D.gold, 0.6, 6);
    if (typeof fxParts === 'function') fxParts('spark', p.x, p.y, '#fff6d6', 18, 160, 0.6, 3);
    vibrate(50);
  }
}

// ---------------------------------------------------------------- shots
hookOn('fire:after', 'prawnd:shots', (w, target, n0) => {
  if (!w || !prawnDamnedNow()) return;
  const E = PRAWN_D.evil;
  for (let i = n0; i < G.proj.length; i++) { const pr = G.proj[i]; if (pr.src && pr.src.w === w) pr.color = i % 2 ? E.purple : E.red; }
});

// ---------------------------------------------------------------- the Damned body (samplelooks.js, Prawn Again only)
const prawnDrawDamned = body => body === G.player && prawnDamnedNow();
const prawnFlipK = () => Math.max(0, 1 - (G.realT - ((G.prawnD && G.prawnD.flipT) || -9)) / 0.4); // (a white-hot flash for 0.4 s after a flip)
{
  const T = SL_TAIL.prawn, Hd = SL_HEAD.prawn, U = SL_UNDER.prawn, O = SL_OVER.prawn, E = PRAWN_D.evil;
  SL_TAIL.prawn = function (t, k, a, now, B, sc) {
    if (!G || !prawnDrawDamned(B.owner)) return T.apply(this, arguments);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * 0.4; drawTail(t, E.purple, 5.5 * k, 6.5 * k); ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = a; drawTail(t, E.body, 2.8 * k, 3.6 * k); drawTail(t, E.vein, 1.1 * k, 1.6 * k);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 2; i < t.length; i += 2) glow(sx(t[i].x), sy(t[i].y), 2.6 * k, E.red, a * Math.max(0, Math.sin(now * 6 + i * 1.3)) * 0.7);
    ctx.globalCompositeOperation = 'source-over';
  };
  SL_HEAD.prawn = function (k, a, now, tag, hit, B) {
    if (!G || !prawnDrawDamned(B.owner)) return Hd.apply(this, arguments);
    // Bat wings at the neck: pointed membranes with red edges, beating hard.
    const flap = Math.sin(now * 9) * 0.3;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(-5 * k, s * 2.6 * k); ctx.rotate(s * (2.25 + flap));
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7.5 * k, -1.6 * k); ctx.lineTo(6 * k, 0.4 * k); ctx.lineTo(8.2 * k, 1.6 * k); ctx.lineTo(5 * k, 2 * k); ctx.lineTo(5.6 * k, 3.6 * k); ctx.lineTo(1.5 * k, 2.2 * k); ctx.closePath();
      ctx.globalAlpha = a; ctx.fillStyle = E.body; ctx.fill(); ctx.strokeStyle = E.vein; ctx.lineWidth = 0.5 * k; ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = a; ctx.strokeStyle = E.mid; ctx.lineWidth = 2.2 * k; ctx.beginPath(); ctx.moveTo(-5 * k, 0); ctx.lineTo(-10.5 * k, 0); ctx.stroke();
    const path = () => slEll(1 * k, 0, 7.5 * k, 5 * k);
    const gr = ctx.createRadialGradient(2.5 * k, -1 * k, 0, 1 * k, 0, 8 * k); gr.addColorStop(0, E.hi); gr.addColorStop(0.55, E.mid); gr.addColorStop(1, E.body);
    path(); ctx.fillStyle = gr; ctx.fill(); ctx.strokeStyle = E.vein; ctx.lineWidth = 0.9 * k; ctx.stroke();
    // Red veins that pulse, and two red eyes.
    ctx.save(); path(); ctx.clip();
    ctx.strokeStyle = E.vein; ctx.lineWidth = 0.45 * k; ctx.globalAlpha = a * (0.55 + 0.35 * Math.sin(now * 5)); ctx.beginPath();
    for (const [x0, y0, x1, y1, cx, cy] of [[-5, 0, 6, -3.5, 0, -3], [-5, 0, 5, 3.8, 1, 2.6], [-2, -1, 7, 0.5, 3, -1.8], [-1, 1.5, 3, 4.6, 2, 2]]) { ctx.moveTo(x0 * k, y0 * k); ctx.quadraticCurveTo(cx * k, cy * k, x1 * k, y1 * k); }
    ctx.stroke(); ctx.restore();
    ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
    for (const s of [-1, 1]) { ctx.fillStyle = E.red; slEll(5.2 * k, s * 1.7 * k, 1.1 * k, 0.55 * k, s * 0.4); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    const f = prawnFlipK(); if (f > 0) { path(); ctx.fillStyle = '#ffffff'; ctx.globalAlpha = a * f * 0.8; ctx.fill(); ctx.globalAlpha = a; }
    slFlush(path, a, hit);
  };
  SL_UNDER.prawn = function (x, y, face, k, a, now, B, body) {
    B.owner = body; // (the tail and head draws are told whose body it is through B)
    if (!G || !prawnDrawDamned(body)) return U.apply(this, arguments);
    // Purple smoke and slow red spikes turning the other way.
    glow(x, y, 30 * k, E.smoke, a * 0.75);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = E.vein;
    for (let i = 0; i < 7; i++) {
      const an = -now * 0.4 + i * TAU / 7, w = 0.08, L = (14 + 6 * Math.sin(now * 2.1 + i * 1.7)) * k;
      ctx.globalAlpha = a * 0.22; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(an - w) * L, y + Math.sin(an - w) * L); ctx.lineTo(x + Math.cos(an) * L * 1.25, y + Math.sin(an) * L * 1.25); ctx.lineTo(x + Math.cos(an + w) * L, y + Math.sin(an + w) * L); ctx.closePath(); ctx.fill();
    }
    glow(x, y, 20 * k, E.red, a * 0.25);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a;
    B.hist.push({ x: body.x, y: body.y, f: face }); if (B.hist.length > 30) B.hist.shift();
  };
  SL_OVER.prawn = function (x, y, face, k, a, now, B, body) {
    if (!G || !prawnDrawDamned(body)) return O.apply(this, arguments);
    // Horns over the head (screen up), whichever way it is facing.
    const [hx, hy] = slAt(x, y, face, k, 1, 0), by = hy - 4 * k;
    ctx.globalCompositeOperation = 'lighter'; glow(hx, by - 4 * k, 10 * k, E.red, a * 0.35); ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = a;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(hx + s * 2 * k, by); ctx.quadraticCurveTo(hx + s * 6.5 * k, by - 3 * k, hx + s * 4.5 * k, by - 10 * k);
      ctx.quadraticCurveTo(hx + s * 4.6 * k, by - 4.5 * k, hx + s * 0.6 * k, by - 1.4 * k); ctx.closePath();
      ctx.fillStyle = E.body; ctx.fill(); ctx.strokeStyle = E.vein; ctx.lineWidth = 0.6 * k; ctx.stroke();
    }
  };
}

// ---------------------------------------------------------------- enemies: Converted (gold) and Damned (render.js)
const holyConvd = e => !!(e.charmed && !e.zombie && (e.holyConv || (typeof hasType === 'function' && hasType('soul')))); // (Possessed while you hold Holy/Damned)
const holyCharmCol = e => (!holyConvd(e) ? PAL.you : prawnDamnedNow() ? PRAWN_D.evil.red : PRAWN_D.gold);
// The mark over an enemy: a glow only (the word pops once, when it turns: chem.js curseFoe). True for a Converted
// enemy, so render.js skips its ALLY countdown label.
function holyFoeMark(e, x, y, r) {
  const E = PRAWN_D.evil;
  if (e.damnT > G.t && !e.charmed) { // a Damned verdict: a dark red aura
    ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 1.9, E.vein, 0.35 + 0.1 * Math.sin(G.realT * 6 + e.id)); ctx.globalCompositeOperation = 'source-over';
    glow(x, y, r * 1.5, E.smoke, 0.45);
    return false;
  }
  if (!holyConvd(e)) return false;
  const damned = prawnDamnedNow();
  ctx.globalCompositeOperation = 'lighter'; glow(x, y, r * 1.8, damned ? E.purple : PRAWN_D.gold, 0.35); ctx.globalCompositeOperation = 'source-over';
  return true;
}
