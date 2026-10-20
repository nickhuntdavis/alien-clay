'use strict';
// Spawn Prawn - the v9 Feats brought back into v10 (spec: ../redesign docs/FEATS.md section 4, "Originals, re-gifted").
// FEATS.md picked 15 of the old Feats that fit v10's rules; feats10.js built nine of them. These are the other six,
// registered through feats10.js feat() like every v10 Feat (cards, forks at levels 3 and 5, stamina, slot UI):
//  - Capacitation (Force, Contact, lunge), Bombardier Beetle (Acid, Spread, recoil lunge), Van de Graaff (Static,
//    Projectile, a dome that swallows enemy bullets), Spinnbarkeit (Mucus, Projectile, strings that Conjoin pairs),
//    Wandering Womb (Alien, slow piercing Projectile with a gravity well), Ear Candling (Fire, Pool, a lure).
// Level 5 forks are built here (FEATS.md only lists level 3); their text and each Feat's `does` are written. Run state: G.f9 (domes, wombs, candles, strings).
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

feat({ id: 'capacitation', name: 'Capacitation', icon: 'CP', ico: 'seeker', type: 'force', atk: 'contact', start: 1, rar: 1, stam: 24,
  line: `"Head down. Go through them. You were built for this. I checked."`, does: 'When an enemy is in range, you lunge straight through everything in the line. Each one passed makes the next hit harder, up to double.',
  base: { dmg: 40, cd: 7, range: 320, width: 30 },
  stat: (w, s) => { if (f10Fk(w, 'hyper')) s.range *= 2; if (f10Fk(w, 'acrosome')) s.dmg *= 1.5; if (f10Fk(w, 'headstart')) s.cd *= 0.7; },
  when: w => { const p = me(), t = acquire('nearest', w.s.range, p.x, p.y); return t ? { x: t.x, y: t.y } : null; },
  fire: (w, c) => {
    const p = me(), s = w.s, a = Math.atan2(c.y - p.y, c.x - p.x), ca = Math.cos(a), sa = Math.sin(a), L = f9Clear(p.x, p.y, a, s.range);
    if (L < 40) return;
    const x0 = p.x, y0 = p.y, line = [];
    for (const e of G.enemies) {
      if (!f10Live(e)) continue;
      const dx = e.x - x0, dy = e.y - y0, u = dx * ca + dy * sa;
      if (u > -10 && u < L + e.r && Math.abs(-dx * sa + dy * ca) < s.width + e.r) line.push({ e, u });
    }
    line.sort((m, n) => m.u - n.u);
    if (!f10Lunge(ca * L, sa * L)) return;
    p.iframes = Math.max(p.iframes || 0, 0.1);
    line.forEach((o, i) => after(0.25 * Math.max(0, Math.min(1, o.u / L)), () => {
      if (!G || G.state !== 'play' || o.e.dead) return;
      f10Hit(w, o.e, s.dmg * Math.min(2, 1 + 0.1 * i), 'contact'); // each one passed adds 10% to the next (growing, capped at +100%)
      if (i === line.length - 1) { ring(o.e.x, o.e.y, o.e.r + 10, w.def.color, 0.35, 4); if (f10Fk(w, 'zona')) f10Stagger(o.e); }
    }));
    fxParts('spark', p.x, p.y, w.def.color, 8, 140, 0.3, 2.5, a + Math.PI, 0.6);
  },
  forks: { 3: [fk('hyper', 'Hyperactivated', 'You drive twice as far.'), fk('zona', 'Zona Binding', 'The last enemy in line is staggered.')],
    5: [fk('acrosome', 'Acrosome Reaction', '50% more damage.'), fk('headstart', 'Head Start', 'A 30% shorter cooldown.')] } });

feat({ id: 'bombardier', name: 'Bombardier Beetle', icon: 'BB', ico: 'steam', type: 'acid', atk: 'spread', start: 1, rar: 1, stam: 22,
  line: `"Spray it at them! Now run the other way!"`, does: 'Sprays six pulses of Acid at whatever is behind you, then recoils away from it.',
  base: { dmg: 12, cd: 6, range: 300 },
  stat: (w, s) => { if (f10Fk(w, 'pressure')) s.dmg *= 1.5; if (f10Fk(w, 'reflex')) s.cd *= 0.7; },
  when: w => {
    const p = me(), f = p.face || 0, l = f10Near(p.x, p.y, w.s.range);
    const behind = l.filter(e => Math.cos(Math.atan2(e.y - p.y, e.x - p.x) - f) < 0).sort(f10Sort(p));
    const t = behind[0] || l.filter(e => Math.hypot(e.x - p.x, e.y - p.y) < 160).sort(f10Sort(p))[0];
    return t ? { x: t.x, y: t.y } : null;
  },
  fire: (w, c) => {
    const s = w.s, volley = (tx, ty) => {
      if (!G || G.state !== 'play') return;
      const p = me(), a0 = Math.atan2(ty - p.y, tx - p.x);
      for (let i = 0; i < 6; i++) { // six pulses across a cone; each hits the first enemy on its line
        const a = a0 + (i - 2.5) * 0.12, ca = Math.cos(a), sa = Math.sin(a);
        let best = null, bu = s.range;
        for (const e of G.enemies) {
          if (!f10Live(e)) continue;
          const dx = e.x - p.x, dy = e.y - p.y, u = dx * ca + dy * sa;
          if (u > 0 && u < bu && Math.abs(-dx * sa + dy * ca) < 14 + e.r) { best = e; bu = u; }
        }
        if (best) f10Hit(w, best, s.dmg, 'spread');
        (G.v10fx || (G.v10fx = [])).push({ k: 'beam', x: p.x, y: p.y, x2: p.x + ca * bu, y2: p.y + sa * bu, w: 6, c: w.def.color, t: 'fire', life: 0.16, max: 0.16 });
      }
    };
    volley(c.x, c.y);
    const p = me(), a = Math.atan2(c.y - p.y, c.x - p.x) + Math.PI, L = f9Clear(p.x, p.y, a, 200);
    if (L >= 40 && f10Lunge(Math.cos(a) * L, Math.sin(a) * L) && f10Fk(w, 'escape')) p.iframes = Math.max(p.iframes || 0, 0.35);
    if (f10Fk(w, 'turret')) for (let k = 1; k <= 4; k++) after(0.25 * k, () => { if (!G) return; const q = me(), t = acquire('cluster', s.range, q.x, q.y); if (t) volley(t.x, t.y); });
  },
  forks: { 3: [fk('turret', 'Turret', 'The spray keeps going for a second, tracking the biggest crowd.'), fk('escape', 'Escape Artist', 'Nothing can hurt you during the recoil.')],
    5: [fk('pressure', 'Pressure Valve', '50% more damage.'), fk('reflex', 'Reflex Action', 'A 30% shorter cooldown.')] } });

feat({ id: 'vandegraaff', name: 'Van de Graaff', icon: 'VG', ico: 'bolt', type: 'static', atk: 'proj', start: 1, rar: 2, stam: 26,
  line: `"Give me their bullets. I'm keeping them. Okay, have them back."`, does: 'A charged dome circles you for four seconds, pulling in and swallowing enemy bullets. When it fades, it fires one Static arc for each bullet swallowed.',
  base: { dmg: 16, cd: 12, area: 230, dur: 4 },
  stat: (w, s) => { if (f10Fk(w, 'cling')) s.dur *= 1.5; if (f10Fk(w, 'quick')) s.cd *= 0.7; },
  when: w => { const p = me(); return G.ebul.some(b => !b.dead && Math.hypot(b.x - p.x, b.y - p.y) < 380) || f10Near(p.x, p.y, 300).length >= 3 ? {} : null; },
  fire: w => { const F = f9(); F.domes = F.domes.filter(d => d.w !== w); F.domes.push({ w, end: G.t + w.s.dur, t0: G.t, n: 0, x: me().x, y: me().y }); },
  forks: { 3: [fk('earthed', 'Earthed', 'Its pull also drags small enemies in.'), fk('sparkgap', 'Spark Gap', 'It fires an arc the moment it catches each shot.')],
    5: [fk('cling', 'Static Cling', 'The dome lasts 50% longer.'), fk('quick', 'Quick Charge', 'A 30% shorter cooldown.')] } });
function f9Arc(w, x, y, e) { f9().arcs = (f9().arcs || 0) + 1; bolt(x, y, e.x, e.y, w.def.color, 0.16); f10Hit(w, e, w.s.dmg, 'proj'); if (!e.dead) e.chargeT = Math.max(e.chargeT || 0, G.t + 3); }

feat({ id: 'spinnbarkeit', name: 'Spinnbarkeit', icon: 'SK', ico: 'whip', type: 'mucus', atk: 'proj', start: 1, rar: 1, stam: 22,
  line: `"Now they're holding hands. They hate it."`, does: 'Ties up to four pairs of nearby enemies together with Mucus. Each pair is Snared and Conjoined for three seconds.',
  base: { dmg: 12, cd: 7, range: 300 },
  stat: (w, s) => { s.pairs = f10Fk(w, 'more') ? 6 : 4; if (f10Fk(w, 'stretch')) s.dmg *= 1.5; },
  when: w => { const p = me(); return f10Near(p.x, p.y, w.s.range).length >= 2 ? {} : null; },
  fire: w => {
    const p = me(), s = w.s, F = f9(), free = f10Near(p.x, p.y, s.range).sort(f10Sort(p)), fern = f10Fk(w, 'ferning');
    let made = 0;
    while (made < (s.pairs || 4) && free.length >= 2) {
      const a = free.shift();
      let bi = -1, bd = 220;
      free.forEach((o, i) => { const d = Math.hypot(o.x - a.x, o.y - a.y); if (d < bd) { bd = d; bi = i; } });
      if (bi < 0) continue;
      const b = free.splice(bi, 1)[0], group = [a, b];
      if (fern && free.length) { let ci = 0, cd = 1e9; free.forEach((o, i) => { const d = Math.hypot(o.x - (a.x + b.x) / 2, o.y - (a.y + b.y) / 2); if (d < cd) { cd = d; ci = i; } }); if (cd < 220) group.push(free.splice(ci, 1)[0]); }
      f10Many(w, group, s.dmg, 'proj');
      f9Conjoin(a, b); if (group[2]) f9Conjoin(group[2], a);
      F.strings.push({ w, g: group, end: G.t + 3, t0: G.t });
      made++;
    }
  },
  forks: { 3: [fk('elastic', 'Elastic', 'When a string ends, it flings both ends into each other.'), fk('ferning', 'Ferning', 'Each string branches to a third enemy.')],
    5: [fk('stretch', 'Stringy', '50% more damage.'), fk('more', 'Loose Ends', 'Six pairs instead of four.')] } });

feat({ id: 'wanderingwomb', name: 'Wandering Womb', icon: 'WW', ico: 'void', type: 'soul', atk: 'proj', start: 1, rar: 2, stam: 24,
  line: `"This was going to be our room. Look, it's going for a walk."`, does: 'A slow womb drifts toward the crowd for four seconds, pulling enemies in and hurting each one it touches.',
  base: { dmg: 14, cd: 8, dur: 4, range: 420 },
  stat: (w, s) => { if (f10Fk(w, 'gestation')) s.dmg *= 1.5; if (f10Fk(w, 'quick')) s.cd *= 0.7; },
  when: w => { const p = me(), t = acquire('cluster', w.s.range, p.x, p.y); return t && f10Near(p.x, p.y, w.s.range).length >= 2 ? { x: t.x, y: t.y } : null; },
  fire: (w, c) => {
    const p = me(), F = f9(), a0 = Math.atan2(c.y - p.y, c.x - p.x), angs = f10Fk(w, 'bicornuate') ? [a0 - 0.35, a0 + 0.35] : [a0];
    if (F.wombs.length >= 4) F.wombs.shift();
    for (const a of angs) F.wombs.push({ w, x: p.x, y: p.y, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, end: G.t + w.s.dur, t0: G.t, hit: new Set(), stop: null, tickT: 0 });
  },
  forks: { 3: [fk('ectopic', 'Ectopic', 'It stops on the first elite or boss it meets and stays there.'), fk('bicornuate', 'Bicornuate', 'Two wombs, angled apart.')],
    5: [fk('gestation', 'Full Term', '50% more damage.'), fk('quick', 'Early Labour', 'A 30% shorter cooldown.')] } });

feat({ id: 'earcandling', name: 'Ear Candling', icon: 'EC', ico: 'flame', type: 'fire', atk: 'pool', start: 1, rar: 1, stam: 20,
  line: `"I lit a candle. Everyone's coming to look at it. Don't look at it."`, does: 'Lights a candle behind you that burns for four seconds. Enemies come to look at it, and it burns them for looking.',
  base: { dmg: 10, cd: 7, area: 75, dur: 4 },
  stat: (w, s) => { if (f10Fk(w, 'scented')) s.area *= 1.4; if (f10Fk(w, 'quick')) s.cd *= 0.7; },
  when: w => { const p = me(); return f10Near(p.x, p.y, 320).length >= 3 ? {} : null; },
  fire: w => {
    const p = me(), s = w.s, F = f9(), f = (p.face || 0) + Math.PI, angs = f10Fk(w, 'vigil') ? [f - 0.6, f + 0.6] : [f];
    for (const a of angs) {
      const x = p.x + Math.cos(a) * 70, y = p.y + Math.sin(a) * 70;
      if (f9Wall(x, y)) continue;
      if (F.candles.length >= 3) F.candles.shift(); // (lures: at most 3 per Feat, 12.6)
      F.candles.push({ w, x, y, end: G.t + s.dur, t0: G.t });
      f10Patch(w, x, y, s.area, s.dur, 'fire', s.dmg * 2);
    }
  },
  forks: { 3: [fk('vigil', 'Vigil', 'Two candles.'), fk('snuffed', 'Snuffed', 'When it burns out, it bursts in a ring of fire.')],
    5: [fk('scented', 'Scented Wax', 'The flame is 40% wider.'), fk('quick', 'Short Wick', 'A 30% shorter cooldown.')] } });

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
