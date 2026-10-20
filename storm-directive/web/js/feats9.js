'use strict';
// Spawn Prawn - the v9 Feats brought back into v10 (spec: ../redesign docs/FEATS.md section 4, "Originals, re-gifted").
// FEATS.md picked 15 of the old Feats that fit v10's rules; feats10.js built nine of them. These are the other six,
// registered through feats10.js feat() like every v10 Feat (cards, forks at levels 3 and 5, stamina, slot UI):
//  - Capacitation (Force, Contact, lunge), Bombardier Beetle (Acid, Spread, recoil lunge), Van de Graaff (Static,
//    Projectile, a dome that swallows enemy bullets), Spinnbarkeit (Mucus, Projectile, strings that Conjoin pairs),
//    Wandering Womb (Alien, slow piercing Projectile with a gravity well), Ear Candling (Fire, Pool, a lure).
// Level 5 forks are built here (FEATS.md only lists level 3); their text, and each Feat's `does`, waits on the user (TODO_COPY). Run state: G.f9 (domes, wombs, candles, strings).
// Hooks: v10.js v10Tick -> f9Tick, v10Draw -> f9Draw.

const f9 = () => G.f9 || (G.f9 = { domes: [], wombs: [], candles: [], strings: [] });
const f9Wall = (x, y) => !!(G.lvl && typeof lvSolidAt === 'function' && lvSolidAt(x, y));
// The longest clear run (up to L) from (x, y) along angle a, checked every 30 units.
function f9Clear(x, y, a, L) { const ca = Math.cos(a), sa = Math.sin(a); for (let d = 30; d <= L; d += 30) if (f9Wall(x + ca * d, y + sa * d)) return Math.max(0, d - 30); return L; }
// Snare and tie two enemies together (fight.js rules: Snared 2.5 s, Conjoined 3 s).
function f9Snare(e) { if (e.dead) return; e.snareT = G.t + 2.5 * (typeof mutSnareK === 'function' ? mutSnareK() : 1); e.chill = 2.5; e.chillAmt = e.boss ? 0.2 : 0.55; }
function f9Conjoin(a, b) {
  for (const q of [a, b]) { if (q.dead) continue; f9Snare(q); q.conjT = G.t + 3; q.conjCd = G.t + 6; q.conjWith = q === a ? b : a; q.frozen = Math.max(q.frozen || 0, q.boss ? 0.5 : 3); }
}
// Pull e towards (x, y) by up to f units, never into a wall.
function f9Pull(e, x, y, f) { if (e.boss || e.rival || e.egg || e.dead) return; const dx = x - e.x, dy = y - e.y, d = Math.hypot(dx, dy) || 1, m = Math.min(d, f), nx = e.x + dx / d * m, ny = e.y + dy / d * m; if (!f9Wall(nx, ny)) { e.x = nx; e.y = ny; } }

// (Merged 20 Oct: the six Feats that were here, Capacitation, Bombardier Beetle, Van de Graaff, Spinnbarkeit, Wandering Womb
// and Ear Candling, are built with the user's copy in feats10.js (Van de Graaff) and gifts10.js (the other five, as later
// unlocks). Their registrations were removed; f9Tick and f9Draw stay so the v10.js hooks still resolve, and do nothing.)
function f9Arc(w, x, y, e) { f9().arcs = (f9().arcs || 0) + 1; bolt(x, y, e.x, e.y, w.def.color, 0.16); f10Hit(w, e, w.s.dmg, 'proj'); if (!e.dead) e.chargeT = Math.max(e.chargeT || 0, G.t + 3); }

// ---------------------------------------------------------------- each frame (v10.js v10Tick)
function f9Tick(dt) {
  const F = G && G.f9; if (!F || G.state !== 'play') return;
  const p = me();
  for (const d of F.domes) { // Van de Graaff
    const w = d.w, a = (G.t - d.t0) * 2.2;
    d.x = p.x + Math.cos(a) * 60; d.y = p.y + Math.sin(a) * 60;
    for (const b of G.ebul) {
      if (b.dead || b.vx == null) continue;
      const dx = d.x - b.x, dy = d.y - b.y, dd = Math.hypot(dx, dy);
      if (dd > w.s.area) continue;
      if (dd < 24) {
        b.dead = true;
        if (f10Fk(w, 'sparkgap')) { const t = acquire('nearest', 420, d.x, d.y); if (t) f9Arc(w, d.x, d.y, t); }
        else d.n = Math.min(10, d.n + 1);
        continue;
      }
      const sp = Math.max(240, Math.hypot(b.vx, b.vy)), k = Math.min(1, 8 * dt); // gravity well (shots only): falls towards the dome
      b.vx += (dx / dd * sp - b.vx) * k; b.vy += (dy / dd * sp - b.vy) * k;
    }
    if (f10Fk(w, 'earthed')) for (const e of f10Near(d.x, d.y, w.s.area)) if (e.maxHp <= 34) f9Pull(e, d.x, d.y, 120 * dt);
    if (G.t >= d.end) {
      d.done = true;
      const l = f10Near(d.x, d.y, 450).sort(f10Sort(d));
      for (let i = 0; i < d.n && l.length; i++) f9Arc(w, d.x, d.y, l[i % l.length]);
      ring(d.x, d.y, 40, w.def.color, 0.35, 3);
    }
  }
  F.domes = F.domes.filter(d => !d.done);
  for (const s of F.strings) { // Spinnbarkeit
    if (G.t < s.end) continue;
    s.done = true;
    if (!f10Fk(s.w, 'elastic')) continue;
    const [a, b] = s.g; if (a.dead || b.dead) continue;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    for (const e of [a, b]) { f9Pull(e, mx, my, Math.hypot(e.x - mx, e.y - my) * 0.7); f10Hit(s.w, e, s.w.s.dmg, 'proj'); }
    ring(mx, my, 24, s.w.def.color, 0.3, 3);
  }
  F.strings = F.strings.filter(s => !s.done);
  for (const m of F.wombs) { // Wandering Womb
    const w = m.w;
    if (m.stop) { if (m.stop.dead) m.stop = null; else { m.x = m.stop.x; m.y = m.stop.y; m.tickT -= dt; if (m.tickT <= 0) { m.tickT = 0.5; f10Hit(w, m.stop, w.s.dmg, 'proj'); } } }
    else { m.x += m.vx * dt; m.y += m.vy * dt; }
    for (const e of f10Near(m.x, m.y, 70)) {
      if (!m.hit.has(e) && Math.hypot(e.x - m.x, e.y - m.y) < 30 + e.r) {
        m.hit.add(e); f10Hit(w, e, w.s.dmg, 'proj');
        if (!m.stop && f10Fk(w, 'ectopic') && (e.elite || e.boss) && !e.dead) { m.stop = e; m.end = Math.min(m.end + 3, G.t + 3); }
      } else f9Pull(e, m.x, m.y, 140 * dt);
    }
    if (G.t >= m.end) m.done = true;
  }
  F.wombs = F.wombs.filter(m => !m.done);
  for (const c of F.candles) { // Ear Candling: the lure (12.6): bosses ignore it, elites come half the time
    for (const e of f10Near(c.x, c.y, 420)) if (!e.boss && !e.rival && (!e.elite || (e.f9lure != null ? e.f9lure : (e.f9lure = Math.random() < 0.5)))) f9Pull(e, c.x, c.y, 70 * dt);
    if (G.t >= c.end) { c.done = true; if (f10Fk(c.w, 'snuffed')) f10Burst(c.w, c.x, c.y, 120, c.w.s.dmg * 3, null); }
  }
  F.candles = F.candles.filter(c => !c.done);
}

// ---------------------------------------------------------------- drawing (v10.js v10Draw, world space)
function f9Draw() {
  const F = G && G.f9; if (!F) return;
  ctx.save(); ctx.lineCap = 'round';
  for (const d of F.domes) {
    const k = Math.max(0, (d.end - G.t) / Math.max(0.01, d.end - d.t0)), x = sx(d.x), y = sy(d.y), r = (16 + d.n) * S;
    ctx.fillStyle = col(F10_COL.static); ctx.globalAlpha = 0.25 + 0.2 * k; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = col(F10_COL.static); ctx.globalAlpha = 0.85; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha = 0.3; ctx.setLineDash([4 * S, 6 * S]); ctx.beginPath(); ctx.arc(x, y, d.w.s.area * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < d.n; i++) { const a = G.t * 3 + i / Math.max(1, d.n) * TAU; ctx.globalAlpha = 0.9; ctx.fillStyle = col('#ffffff'); ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.7, y - Math.abs(Math.sin(a)) * r * 0.6, 1.8 * S, 0, TAU); ctx.fill(); }
  }
  ctx.strokeStyle = col(F10_COL.mucus); ctx.lineWidth = 2.5;
  for (const s of F.strings) {
    const live = s.g.filter(e => !e.dead); if (live.length < 2) continue;
    ctx.globalAlpha = 0.7 * Math.max(0.2, (s.end - G.t) / 3);
    for (let i = 1; i < live.length; i++) { const a = live[0], b = live[i], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 + 10 + 4 * Math.sin(G.t * 6); ctx.beginPath(); ctx.moveTo(sx(a.x), sy(a.y)); ctx.quadraticCurveTo(sx(mx), sy(my), sx(b.x), sy(b.y)); ctx.stroke(); }
  }
  for (const m of F.wombs) {
    const x = sx(m.x), y = sy(m.y), wob = 1 + 0.08 * Math.sin(G.t * 5);
    ctx.fillStyle = col(F10_COL.soul); ctx.globalAlpha = 0.28; ctx.beginPath(); ctx.ellipse(x, y, 30 * S * wob, 24 * S / wob, Math.atan2(m.vy, m.vx), 0, TAU); ctx.fill();
    ctx.strokeStyle = col(F10_COL.soul); ctx.globalAlpha = 0.7; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha = 0.25; ctx.setLineDash([3 * S, 5 * S]); ctx.beginPath(); ctx.arc(x, y, 70 * S, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  }
  for (const c of F.candles) {
    const x = sx(c.x), y = sy(c.y), fl = 1 + 0.25 * Math.sin(G.t * 17 + c.t0);
    ctx.globalAlpha = 0.9; ctx.fillStyle = col('#f3e9d2'); ctx.fillRect(x - 3 * S, y - 4 * S, 6 * S, 16 * S);
    ctx.fillStyle = col(F10_COL.fire); ctx.beginPath(); ctx.ellipse(x, y - 9 * S, 3 * S, 6 * S * fl, 0, 0, TAU); ctx.fill();
    ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.arc(x, y - 9 * S, 22 * S * fl, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
