'use strict';
// Spawn Prawn - enemy Membranes like yours.
//  - Five cell enemies grow a Membrane at the player's strength (30% of max health, PDEF.memFrac): Nurse Cell,
//    Mitotic Cell, Mother Cell, Plasma Cell, Stem Cell. Rules are combat.js's (Force does half, mends after 2 quiet
//    seconds, refills in 2, Static recharges it); Mucus Wall and Alpha Swimmer keep their thicker 50% one.
//  - Every enemy Membrane draws as your forcefield bubble (stamina.js armourRing, cut down): clear in the middle,
//    glowing just inside a wobbling skin, a soap-bubble highlight, and a bulge that runs from where a hit landed.
// Hooks: fight.js fightCd -> d.memFrac (membrane size), fightDraw -> foeMemDraw (replaces the blue arc).

const FOEMEM = { ids: ['medic', 'splitter', 'summoner', 'plasma', 'stem'], frac: 0.30 };
if (typeof ROSTER !== 'undefined') for (const id of FOEMEM.ids) if (ROSTER[id] && !ROSTER[id].def) ROSTER[id].def = Object.assign(ROSTER_DEF.membrane(), { pct: FOEMEM.frac, memFrac: FOEMEM.frac });

// Drawn in screen space at x, y (enemy radius r already scaled), c = the enemy's defence (combat.js).
function foeMemDraw(e, c, x, y, r) {
  const t = G.realT || 0, k = c.mem / c.memMax;
  if (k <= 0.01) { e.memRip = null; return; }
  // A drop in Membrane since last frame is a hit: start a ripple on the side facing you.
  if (e.memLast != null && c.mem < e.memLast - 0.01) {
    const p = G.player, drop = (e.memLast - c.mem) / c.memMax;
    e.memRip = { t, a: Math.atan2(p.y - e.y, p.x - e.x), k: Math.min(1, 0.5 + drop * 4) };
  }
  e.memLast = c.mem;
  const rp = e.memRip && t - e.memRip.t < 0.7 && t >= e.memRip.t ? e.memRip : null;
  const R = r + 7 * S, flick = c.memQuietT < 2 && k < 1 ? 0.75 + 0.25 * Math.sin(t * 30) : 1;
  const base = (0.3 + 0.6 * k) * flick, u = rp ? (t - rp.t) / 0.7 : 1, hot = rp ? (1 - u) * rp.k : 0;
  const N = 28, pts = [], ph = e.id || 0;
  for (let i = 0; i < N; i++) {
    const th = i / N * TAU;
    let rr = R * (1 + 0.03 * Math.sin(th * 3 + t * 1.6 + ph) + 0.02 * Math.sin(th * 5 - t * 2.3));
    if (rp) { const d = Math.abs(((th - rp.a + Math.PI * 3) % TAU) - Math.PI); rr += R * 0.18 * hot * Math.exp(-((d - u * Math.PI) ** 2) / 0.08); }
    pts.push([x + Math.cos(th) * rr, y + Math.sin(th) * rr]);
  }
  const shell = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < N; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); };
  const df = !!SET.darkfield, tint = df ? '120,220,255' : '40,170,215', rim = df ? '#9ef0ff' : '#1b9cc4', a0 = ctx.globalAlpha;
  ctx.save(); ctx.globalCompositeOperation = df ? 'lighter' : 'source-over';
  const g = ctx.createRadialGradient(x, y, R * 0.35, x, y, R * 1.02);
  g.addColorStop(0, `rgba(${tint},0)`); g.addColorStop(0.6, `rgba(${tint},${0.05 * base + 0.1 * hot})`); g.addColorStop(1, `rgba(${tint},${0.25 * base + 0.3 * hot})`);
  shell(); ctx.fillStyle = g; ctx.globalAlpha = a0; ctx.fill();
  const hx = x - 0.42 * R, hy = y - 0.44 * R, hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 0.4 * R); // soap-bubble highlight
  hg.addColorStop(0, `rgba(255,255,255,${0.3 * base})`); hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy, 0.4 * R, 0, TAU); ctx.fill();
  shell(); ctx.lineWidth = Math.max(1, 1.3 * S); ctx.strokeStyle = rim; ctx.globalAlpha = a0 * Math.min(1, 0.5 * base + 0.6 * hot); ctx.stroke();
  ctx.restore();
}
