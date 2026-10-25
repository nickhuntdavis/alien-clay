'use strict';
// Spawn Prawn - marked Bursts for the two bubbles (COMBAT_MATRIX 13: a Burst always shows its area before it goes off).
//   Acid Bubble   (roster 'bomber', ai 'new_bomber') Rushes you. Inside trigger range it stops, marks a ring (ROSTER.bomber.atk[0].tele,
//                 radius) and then bursts: one Burst hit if you stand in the ring (leaving it avoids it; Evasion never applies: kind
//                 'blast'), then leaves an Acid Pool (radius, life from the roster) that ticks while you stand in it. The bubble is spent.
//                 Killed first, it just pops the pool: no blast, no friendly fire.
//   Snot Bubble   (foes3.js) A player kill no longer splashes at once: the burst area (small, or big when swollen) is marked for the
//                 roster's tele, then foes3Kill's effects land, and a Mucus Pool (roster leftover) is left behind. Static still pops
//                 it at once and harmlessly (e.popped skips the mark).
// Pools live in G.b10pool, marks in G.b10 (both on the run state, so a new run starts clean).
// Hooks: hooks.js 'tick' -> b10Tick and 'kill' -> b10Kill; nf10Draw (newfoes.js, called from v10.js) is wrapped to draw them;
//   foes3Kill (foes3.js) is wrapped to defer a player kill. roster.js bomber.ai is 'new_bomber'.
// Save data: none.

const B10 = { trigger: 30, poolTick: 0.5, poolDmg: 0.2, snotDose: 0.6, cap: 40 };
const b10Atk = id => ROSTER[id].atk[0];

function b10Mark(x, y, r, t, kind, e) {
  const L = G.b10 || (G.b10 = []);
  if (L.length < B10.cap) L.push({ x, y, r, t, max: t, kind, e });
}
function b10Pool(x, y, r, life, kind) {
  const L = G.b10pool || (G.b10pool = []);
  if (L.length < B10.cap) L.push({ x, y, r, life, max: life, kind, tick: 0 });
}

Object.assign(FOE_AI, {
  new_bomber(e, dt, dist) {
    if (e.b10T > 0) { e.b10T -= dt; if (e.b10T <= 0) b10Acid(e); return { x: 0, y: 0, s: 0 }; }
    if (dist < e.r + me().r + B10.trigger) {
      const a = b10Atk('bomber');
      e.b10T = a.tele; e.b10RT = G.realT;
      b10Mark(e.x, e.y, a.radius, a.tele, 'acid', e);
      floatText(e.x, e.y - e.r - 10, '!', '#b8f35a', 14, a.tele);
      return { x: 0, y: 0, s: 0 };
    }
    return null;
  },
});

// (nfWire ran before this file loaded and put the old AI back for want of FOE_AI.new_bomber)
if (ENEMIES.bomber) ENEMIES.bomber.ai = 'new_bomber';

function b10Acid(e) {
  if (e.dead || e.b10Done) return;
  e.b10Done = 1;
  const a = b10Atk('bomber'), p = me();
  ring(e.x, e.y, a.radius, '#b8f35a', 0.35, 5); spawnPart(e.x, e.y, '#b8f35a', 14, 220, 0.45, 4);
  if (Math.hypot(p.x - e.x, p.y - e.y) < a.radius + p.r * 0.5) hurtPlayer(e.dmg, 'Acid Bubble', e, 'blast');
  b10Pool(e.x, e.y, a.leftover.radius, a.leftover.life, 'acid');
  e.hp = 0; killEnemy(e, { wname: 'Acid Bubble' });
}

function b10Kill(e, src) {
  if (!e.def || e.def.ai !== 'new_bomber' || e.b10Done) return;
  e.b10Done = 1; // killed first: the pool pops, nothing else
  b10Pool(e.x, e.y, b10Atk('bomber').leftover.radius, b10Atk('bomber').leftover.life, 'acid');
  if (G.b10) G.b10 = G.b10.filter(m => m.e !== e);
}
hookOn('kill', 'b10Kill', (e, src) => b10Kill(e, src));

// Snot Bubble: mark the burst, then let foes3.js do its effects.
const b10OrigSnotKill = foes3Kill;
foes3Kill = function (e, src) {
  if (!src || e.popped || e.def !== ENEMIES.snotbubble || e.b10Marked) return b10OrigSnotKill(e, src);
  const B = F3.bubble, A = b10Atk('snotbubble'), big = (e.swell || 0) >= B.late;
  e.b10Marked = 1;
  b10Mark(e.x, e.y, big ? B.big : B.early, A.tele, 'snot', { x: e.x, y: e.y, swell: e.swell, def: e.def, r: e.r, big });
};
function b10SnotGo(m) {
  const g = m.e, ghost = { x: g.x, y: g.y, swell: g.swell, def: g.def, r: g.r, b10Marked: 1 };
  b10OrigSnotKill(ghost, {});
  b10Pool(m.x, m.y, b10Atk('snotbubble').leftover.radius, b10Atk('snotbubble').leftover.life, 'snot');
}

function b10Tick(dt) {
  if (!G || G.state !== 'play') return;
  const p = me();
  if (G.b10 && G.b10.length) {
    for (const m of G.b10) {
      m.t -= dt;
      if (m.kind === 'acid' && (m.e.dead || m.e.b10Done)) m.t = -1; // (resolved by its owner)
      else if (m.t <= 0 && m.kind === 'snot') b10SnotGo(m);
    }
    G.b10 = G.b10.filter(m => m.t > 0);
  }
  if (G.b10pool && G.b10pool.length) {
    for (const z of G.b10pool) {
      z.life -= dt; z.tick -= dt;
      if (z.tick <= 0 && z.life > 0 && Math.hypot(p.x - z.x, p.y - z.y) < z.r + p.r * 0.6) {
        z.tick = B10.poolTick;
        if (z.kind === 'acid') hurtPlayer(Math.max(1, ENEMIES.bomber.dmg * B10.poolDmg), 'Acid Pool', null, 'other');
        else pstGive('snot', B10.snotDose);
      }
    }
    G.b10pool = G.b10pool.filter(z => z.life > 0);
  }
}
hookOn('tick', 'b10Tick', dt => b10Tick(dt));

// ---------------------------------------------------------------- drawing
const b10Draw0 = nf10Draw;
nf10Draw = function () {
  b10Draw0();
  if (!G || !((G.b10 && G.b10.length) || (G.b10pool && G.b10pool.length))) return;
  const now = G.realT;
  ctx.save();
  for (const z of G.b10pool || []) { // the pool's edge for its whole life
    const k = Math.min(1, z.life / 0.6), col = z.kind === 'acid' ? '#b8f35a' : ELEMENTS.ice.color;
    ctx.globalAlpha = 0.25 * k; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.r * S, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.7 * k; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([3 * S, 4 * S]); ctx.beginPath(); ctx.arc(sx(z.x), sy(z.y), z.r * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  }
  for (const m of G.b10 || []) { // an area about to go off
    const k = 1 - m.t / m.max, col = m.kind === 'acid' ? '#b8f35a' : ELEMENTS.ice.color;
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now * 22) ** 2; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash([6 * S, 5 * S]);
    ctx.beginPath(); ctx.arc(sx(m.x), sy(m.y), m.r * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 0.12 + 0.2 * k; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(sx(m.x), sy(m.y), m.r * k * S, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
