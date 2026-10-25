'use strict';
// Spawn Prawn - feedback animations: small soft cues for things that used to happen silently. No player-facing text.
//  1. Reload: a thin arc round you fills while a weapon reloads, with the damage type's charge-up look (chargefx.js) building inside it; a pop when it is back.
//  2. Ready: a Feat slot pulses (and you flash) when a Feat comes off a real cooldown; the same flash when WINDED ends
//     and when Sprint Start's 5 s timer comes round.
//  3. Invulnerable: a shimmer round you for Stair Gate, State of Grace, Ghosting and post-hit iframes; a burst at the
//     start and a flicker in the last stretch. Blips under 0.3 s (dodge, See-Through) are skipped.
//  4. Healing: watches p.hp each frame, so every heal path (regen, lifesteal, kills, pickups, cards) is covered without
//     hooking any of them. Gains are added up and shown as one green puff per chunk, at most one per 0.45 s.
//  5. Status wearing off: the damage type's charge-up look unwinding (chargefx.js) plus its release snap when a status ends on an enemy or on you.
// Per-type looks come only from chargefx.js (drawChargeFx / chargeSnap / cfxMain); nothing per-type lives here.
// Hooks: hooks.js 'tick' -> ffxTick (everything is detected there, from state; no shared file knows about heals,
//   iframes or reloads); render.js render -> ffxDraw (after ringsOnTop, over the world, under enemy bullets).
// Loads after reach.js (last). State lives in FFX, rebuilt for each run (FFX.g !== G).

const FFX = { g: null, fx: [], hp: 0, acc: 0, accT: 0, inv: 0, invPeak: 0, ready: 0, rl: new Map(), cdPk: new Map(), stm: null, spw: null, winded: false, pst: null, n: 0 };
const FFX_CAP = 40;
// status bit -> damage type (the eight statuses, as chemHas lists them)
const FFX_TYPES = ['fire', 'ice', 'shock', 'poison', 'oxi', 'salt', 'arcane', 'soul'];
const ffxEl = w => { const e = wElemOf(w); return e && CFX_LIGHT[e] ? e : 'phys'; }; // (a damage type chargefx.js knows)
const ffxCol = k => col(k === 'heal' ? '#8ac926' : cfxMain(k));
function ffxStyle() {
  if (document.getElementById('ffxCss')) return;
  const s = document.createElement('style'); s.id = 'ffxCss';
  s.textContent = '@keyframes ffxPulse{0%{box-shadow:inset 0 0 0 0 rgba(255,255,255,0),0 0 0 0 rgba(255,255,255,0.9);filter:brightness(1.8)}60%{box-shadow:inset 0 0 14px 2px rgba(255,255,255,0.55),0 0 10px 3px rgba(255,255,255,0.5);filter:brightness(1.35)}100%{box-shadow:inset 0 0 0 0 rgba(255,255,255,0),0 0 0 0 rgba(255,255,255,0);filter:none}}.slot.ffxReady{animation:ffxPulse .6s ease-out}';
  document.head.appendChild(s);
}
function ffxAdd(o) { if (FFX.fx.length < FFX_CAP) FFX.fx.push(o); }
function ffxReset() {
  FFX.g = G; FFX.fx.length = 0; FFX.acc = 0; FFX.accT = 0; FFX.inv = 0; FFX.invPeak = 0; FFX.rl.clear(); FFX.cdPk.clear();
  FFX.hp = G.player ? G.player.hp : 0; FFX.stm = null; FFX.spw = null; FFX.winded = false; FFX.pst = null; FFX.ready = 0;
}

// ---------------------------------------------------------------- the per-type puff (chargefx.js owns the look)
// A status ending is the charge-up look unwinding (drawChargeFx with k running 1 -> 0, in ffxDraw) plus chargeSnap's release.
function ffxTypePuff(x, y, r, k, big) {
  ffxAdd({ k: 'puff', x, y, r, el: k, t: 0, life: big ? 0.6 : 0.45, seed: ++FFX.n });
  chargeSnap(x, y, r * 0.6, k);
}

// ---------------------------------------------------------------- detection (one 'tick' per frame, no allocation)
function ffxTick(dt) {
  if (!G || !G.player || G.state !== 'play') return;
  if (FFX.g !== G) ffxReset();
  const p = G.player, fx = FFX.fx;
  for (let i = fx.length - 1; i >= 0; i--) { fx[i].t += dt; if (fx[i].t >= fx[i].life) { fx[i] = fx[fx.length - 1]; fx.pop(); } }

  // 4. healing: any rise in HP. A big single heal gets its own puff at once; small ones add up.
  const gain = p.hp - FFX.hp; FFX.hp = p.hp;
  FFX.accT -= dt;
  if (gain > 0.01) FFX.acc += gain;
  const chunk = Math.max(3, G.P.maxHp * 0.04);
  if (FFX.acc >= chunk && FFX.accT <= 0) {
    ffxAdd({ k: 'heal', x: p.x, y: p.y, r: 16, t: 0, life: 0.55, big: FFX.acc >= G.P.maxHp * 0.15 });
    fxParts('spark', p.x, p.y, col('#8ac926'), FFX.acc >= G.P.maxHp * 0.15 ? 5 : 2, 38, 0.6, 2, -Math.PI / 2, 1.3);
    FFX.acc = 0; FFX.accT = 0.45;
  }
  if (gain < -0.01) FFX.acc = Math.max(0, FFX.acc + gain * 0.5); // (being hit cancels part of a half-built puff)

  // 3. invulnerability: Stair Gate (shieldT) or iframes. An episode only counts if it starts at 0.3 s or more.
  const inv = Math.max(p.iframes > 0 ? p.iframes : 0, G.shieldT > 0 ? G.shieldT : 0);
  if (inv > 0 && FFX.inv <= 0 && inv >= 0.3) {
    FFX.invPeak = inv; FFX.invShield = G.shieldT > 0;
    ffxAdd({ k: 'ring', x: p.x, y: p.y, r: 14, t: 0, life: 0.35, c: FFX.invShield ? col('#48cae4') : col(PAL.you || '#ffffff') });
  } else if (inv > FFX.inv + 0.05 && inv > 0.3) { FFX.invPeak = Math.max(FFX.invPeak, inv); } // (extended: a new pickup or Feat)
  if (inv <= 0) FFX.invPeak = 0;
  FFX.inv = inv;

  // 2. ready: Feats that came off a real cooldown (the biggest cd seen since the last ready is at least 2 s).
  const sp = G.spells;
  for (let i = 0; i < sp.length; i++) {
    const w = sp[i]; if (!w) continue;
    const pk = FFX.cdPk.get(w.uid) || 0;
    if (w.cd > pk) FFX.cdPk.set(w.uid, w.cd);
    else if (w.cd <= 0 && pk > 0) {
      FFX.cdPk.set(w.uid, 0);
      if (pk >= 2) ffxReady(i);
    }
  }
  // sprint: WINDED ending, and Sprint Start's timer (it fires the moment it comes round, so its cd jumps back up)
  const SM = G.stam;
  if (SM) { if (FFX.winded && !SM.winded) ffxReady(-1); FFX.winded = SM.winded; }
  const sc = G.sprintCd;
  if (sc != null) { if (FFX.spw != null && sc > FFX.spw + 1) ffxReady(-1); FFX.spw = sc; }

  // 1. reload: start and finish of each weapon's reload (arcs are drawn from w.reloadT in ffxDraw)
  const ws = G.weapons;
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i]; if (!w || w.echo) continue;
    const was = FFX.rl.get(w.uid) || 0, now = w.reloadT > 0 ? w.reloadMax : 0;
    if (was && !now && was >= 0.8) ffxAdd({ k: 'ring', x: p.x, y: p.y, r: 18 + (i % 4) * 3, t: 0, life: 0.25, c: ffxCol(ffxEl(w)) });
    if (was !== now) FFX.rl.set(w.uid, now);
  }

  // 5. statuses ending: enemies near the screen, then you
  const cx = cam.x, cy = cam.y, hw = W / 2 / S + 60, hh = H / 2 / S + 60, E = G.enemies;
  for (let i = 0; i < E.length; i++) {
    const e = E[i];
    const m = (e.burn > 0 ? 1 : 0) | (e.chill > 0 || e.frozen > 0 ? 2 : 0) | (e.shock > 0 ? 4 : 0) | (e.poison > 0 && e.poisonStacks > 0 ? 8 : 0)
      | (e.fizz > 0 ? 16 : 0) | (e.pickle > 0 ? 32 : 0) | (e.bloodT > 0 ? 64 : 0) | (e.curse > 0 ? 128 : 0);
    const was = e._ffx | 0; e._ffx = m;
    if (was & ~m && !e.dead && !e.egg && Math.abs(e.x - cx) < hw && Math.abs(e.y - cy) < hh) {
      for (let b = 0; b < 8; b++) if (was & ~m & (1 << b)) { ffxTypePuff(e.x, e.y - e.r * 0.3, e.r + 4, FFX_TYPES[b], false); if (++FFX.n & 1) break; }
    }
  }
  const T = G.pst, now = (T ? (T.snot > G.t ? 1 : 0) | (T.sick > G.t ? 2 : 0) | (T.wet > G.t ? 4 : 0) | (T.lube > G.t ? 8 : 0) : 0), was = FFX.pst | 0;
  FFX.pst = now;
  if (was & ~now) { const K = ['ice', 'poison', 'salt', 'oxi']; for (let b = 0; b < 4; b++) if (was & ~now & (1 << b)) ffxTypePuff(p.x, p.y, 20, K[b], true); }
}
function ffxReady(i) {
  const p = G.player;
  ffxAdd({ k: 'ring', x: p.x, y: p.y, r: 16, t: 0, life: 0.3, c: col('#ffffff') });
  if (i >= 0) {
    const el = document.getElementById('sslots'), s = el && el.children[i];
    if (s) { ffxStyle(); s.classList.remove('ffxReady'); void s.offsetWidth; s.classList.add('ffxReady'); }
  }
}

// ---------------------------------------------------------------- drawing (world space, over the player)
function ffxDraw() {
  if (!G || FFX.g !== G || !G.player) return;
  const p = G.player, px = sx(p.x), py = sy(p.y), t = G.realT || 0;
  const oc = ctx.globalCompositeOperation, oa = ctx.globalAlpha, ow = ctx.lineWidth;
  ctx.globalCompositeOperation = 'lighter';
  // 1. reload arcs (outer ring first, one per reloading weapon, at most 4)
  const ws = G.weapons; let n = 0;
  for (let i = 0; i < ws.length && n < 4; i++) {
    const w = ws[i];
    if (!w || w.echo || !(w.reloadT > 0) || !(w.reloadMax >= 0.8)) continue;
    const k = 1 - w.reloadT / w.reloadMax, rr = (24 + n * 3.5) * S;
    const el = ffxEl(w);
    ctx.strokeStyle = ffxCol(el); ctx.lineWidth = Math.max(1.5, 2 * S); ctx.lineCap = 'round';
    ctx.globalAlpha = 0.18; ctx.beginPath(); ctx.arc(px, py, rr, 0, TAU); ctx.stroke(); // (the empty track)
    ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.arc(px, py, rr, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke();
    drawChargeFx(px, py, (p.r || 11) * S + n * 3 * S, k, el, n + 5); // (the same per-type wind-up look as the charge-ups)
    n++;
  }
  // 3. invulnerable shimmer: a soft breathing halo; the last 0.5 s (1.2 s for the Stair Gate) it flickers
  if (FFX.inv > 0 && FFX.invPeak >= 0.3) {
    const end = FFX.invShield ? 1.2 : 0.5, flick = FFX.inv < end ? (Math.sin(t * 40) > 0 ? 1 : 0.15) : 1;
    const fade = Math.min(1, FFX.invPeak < 1 ? 0.55 : 1);
    ctx.strokeStyle = FFX.invShield ? col('#48cae4') : col(PAL.you || '#ffffff');
    for (let j = 0; j < 2; j++) {
      const rr = (20 + j * 5 + 2 * Math.sin(t * 5 + j * 2)) * S;
      ctx.globalAlpha = (0.3 - j * 0.12) * flick * fade; ctx.lineWidth = (5 - j * 2) * S;
      ctx.beginPath(); ctx.arc(px, py, rr, 0, TAU); ctx.stroke();
    }
    ctx.fillStyle = ctx.strokeStyle; ctx.globalAlpha = 0.07 * flick * fade; ctx.beginPath(); ctx.arc(px, py, 22 * S, 0, TAU); ctx.fill();
  }
  // timed effects: rings, puffs and heal motes
  const fx = FFX.fx;
  for (let i = 0; i < fx.length; i++) {
    const f = fx[i], k = f.t / f.life, x = sx(f.x), y = sy(f.y);
    if (f.k === 'ring') {
      ctx.strokeStyle = f.c; ctx.lineWidth = Math.max(1, 2.5 * (1 - k) * S); ctx.globalAlpha = 0.8 * (1 - k);
      ctx.beginPath(); ctx.arc(x, y, (f.r + k * 16) * S, 0, TAU); ctx.stroke();
    } else if (f.k === 'puff') {
      drawChargeFx(x, y, f.r * S, 1 - k, f.el, f.seed);
    } else if (f.k === 'heal') {
      const c = ffxCol('heal'), a = (1 - k) * (f.big ? 0.9 : 0.7), s = (f.big ? 1.3 : 1) * S;
      ctx.strokeStyle = c; ctx.lineWidth = 2 * s; ctx.lineCap = 'round'; ctx.globalAlpha = a;
      for (let j = -1; j <= 1; j++) { // three soft plus-signs rising
        const cx = x + j * 9 * s, cy = y - (10 + k * 22 + (j & 1) * 5) * s, d = 3 * s;
        ctx.beginPath(); ctx.moveTo(cx - d, cy); ctx.lineTo(cx + d, cy); ctx.moveTo(cx, cy - d); ctx.lineTo(cx, cy + d); ctx.stroke();
      }
      ctx.globalAlpha = a * 0.35; ctx.beginPath(); ctx.arc(x, y, (14 + k * 10) * s, 0, TAU); ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = oc; ctx.globalAlpha = oa; ctx.lineWidth = ow;
}

hookOn('tick', 'ffxTick', dt => ffxTick(dt));
