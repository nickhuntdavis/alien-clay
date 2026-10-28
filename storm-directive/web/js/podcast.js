'use strict';
// Spawn Prawn - Obligatory Podcast (user, 28 Oct): Alpha's Force sound weapon. Each shot sends POD.pulses sound waves
// a beat apart; each wave is an arc that widens as it travels (a funnel of POD.half either side of the aim), passes
// through everything (each enemy once per wave) and gives a light shove.
//  - The def is a copy of Maximum Gains (v_phys_spread: magazine, reload, levels, modifier pool as a spread weapon);
//    a wave is a normal piercing shot (spawnProj) whose radius grows with distance, so homing, bounce, returning and
//    the rest still act on it. Damage per enemy per shot is POD.k of a full Maximum Gains volley (s.dmg x s.count).
//  - Drafts: it is a Force weapon (the Force pool), and Alpha (a Static specialist) can draft it too (podOk).
//  - No branch screens (WUP) and no Switched at Birth alternate for now, as dlvweap.js.
// Hooks: render.js shot loop skips pr.pod (drawn here, in v10Draw); typepools.js tpOk -> podOk. hookOn fire, tick.
// Loads after dlvweap.js (the roster loops in w24look.js and wtags.js see it). Save data: none.

const POD = { id: 'v_phys_podcast', base: 'v_phys_spread', pulses: 3, gap: 0.1, half: 0.35, r0: 10, speed: 340, reach: 1.3, k: 0.25, knock: 60 };

(function podJoin() {
  const b = WEAPONS[POD.base], row = W24_BY[POD.base];
  if (!b || !row || WEAPONS[POD.id]) return;
  const d = Object.assign({}, b, { base: JSON.parse(JSON.stringify(b.base || {})), lv: JSON.parse(JSON.stringify(b.lv || {})),
    stars: (b.stars || []).slice(), name: 'Obligatory Podcast', desc: 'TODO_COPY:w_podcast_desc', icon: 'OP', pod: 1, w24: 1, archived: 0 });
  d.play = d.desc;
  d.base.range = Math.round((b.base.range || 260) * POD.reach); d.base.knock = POD.knock;
  WEAPONS[POD.id] = d;
  W24.push([POD.id, d.name, row.type, row.atk, null]);
  W24_IDS.push(POD.id);
  W24_BY[POD.id] = { id: POD.id, name: d.name, type: row.type, atk: row.atk, starter: null };
  W24_DESC[POD.id] = d.desc;
  if (typeof IC !== 'undefined') IC.w_podcast = '<path d="M4 9.5v5"/><path d="M8.5 7a7 7 0 0 1 0 10"/><path d="M12.5 4.5a11 11 0 0 1 0 15"/><path d="M16.5 2.5a14 14 0 0 1 0 19"/>';
  if (typeof ICON_OF !== 'undefined') ICON_OF[POD.id] = 'w_podcast';
})();

// Alpha drafts it although it is not a Static weapon (typepools.js tpOk).
const podOk = id => id === POD.id && typeof s10Has === 'function' && s10Has('alpha');

function podWave(w, x, y, a, src) {
  const s = w.s, sp = POD.speed * (s.speed || 520) / 520, life = (s.range || 340) / sp;
  spawnProj(w, x, y, a, src, { pod: { a, half: POD.half }, pierce: 999, r: POD.r0, speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
    life, max: life, dmg: s.dmg * (s.count || 7) * POD.k / POD.pulses, style: 'pod' });
}
hookOn('fire', 'podcast:fire', (w, target, src) => {
  if (!w || !w.def || !w.def.pod) return false;
  const p = G.player, a = target ? Math.atan2(target.y - p.y, target.x - p.x) : (p.face || 0);
  for (let i = 0; i < POD.pulses; i++) {
    if (!i) podWave(w, p.x, p.y, a, src);
    else after(POD.gap * i, () => { if (G && G.player) podWave(w, G.player.x, G.player.y, a, src); });
  }
  return true;
});
// The funnel: a wave's radius (its half-width) grows with the distance it has travelled.
hookOn('tick', 'podcast:grow', () => {
  for (const pr of G.proj) if (pr.pod && !pr.dead) {
    const trav = (pr.max - pr.life) * pr.speed;
    pr.r = POD.r0 + trav * Math.tan(pr.pod.half);
  }
});

// Drawing (world space, under the enemies): each wave is an arc of the circle it spreads from, with two fainter ripples.
function podDraw() {
  if (!G) return;
  let any = false;
  for (const pr of G.proj) {
    if (!pr.pod || pr.dead) continue;
    const X = sx(pr.x), Y = sy(pr.y), m = (pr.r + 40) * S; if (X < -m || Y < -m || X > W + m || Y > H + m) continue;
    if (!any) { any = true; ctx.lineCap = 'round'; }
    const h = Math.atan2(pr.vy, pr.vx), R = Math.max(8, pr.r / Math.tan(pr.pod.half)), cx = pr.x - Math.cos(h) * R, cy = pr.y - Math.sin(h) * R;
    const fade = clamp(pr.life / pr.max * 1.6, 0, 1);
    ctx.strokeStyle = pr.color;
    for (let j = 0; j < 3; j++) {
      const rr = (R - j * 9) * S; if (rr <= 2) break;
      ctx.globalAlpha = fade * (j ? 0.5 / j : 1); ctx.lineWidth = (j ? 2 : 4.5) * S;
      ctx.beginPath(); ctx.arc(sx(cx), sy(cy), rr, h - pr.pod.half, h + pr.pod.half); ctx.stroke();
    }
  }
  if (any) { ctx.globalAlpha = 1; ctx.lineCap = 'butt'; }
}
{ const podV10Draw0 = v10Draw; v10Draw = function () { podV10Draw0(); podDraw(); }; }
