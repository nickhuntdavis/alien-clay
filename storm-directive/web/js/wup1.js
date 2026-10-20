'use strict';
// Spawn Prawn - weapon branches, batch 1: Standard Issue, Maximum Gains, Nervous Wreck, Panic Button
// (spec: ../redesign docs/WEAPON_UPGRADES.md 1 to 4; engine and card interface: weapons24.js).
// Everything is inside one function so batches can't clash on names. Each weapon has ONE dispatcher per hook kind that
// reads the flags its cards set on w.w1 (promise in w.w1.p; Lv 6 and Lv 10 cards set a flag each); the Lv 3 card installs
// the dispatchers. Run state lives in G.w1 (lists of marks, lanes, nuts, lumps ... all capped).
// Extra hook kinds used here, dispatched by two wrappers at the bottom (projHit and projEnd are wrapped, no shared file
// is edited): 'phit' (w, pr, e) after one of this weapon's shots hit e; 'pend' (w, pr) when a shot's flight ends.
// Also wrapped: wupDmgMul (marks that raise damage from your other weapons), hurtPlayer (Untouchable), v10Draw (marks).
// Simplifications: a "heavy hit" from a card is applied directly (one Shell layer off, Poise up), because the resolver only
// calls a hit heavy by its size; it does not trigger Blood Pressure. Knockback is simulated by e.kx/e.ky (never on bosses).
(function () {
  const SI = 'v_phys_proj', MG = 'v_phys_spread', NW = 'v_phys_contact', PB = 'v_phys_burst';
  const TWO = Math.PI * 2;
  const S1 = () => G.w1 || (G.w1 = { vid: 0, vol: new Map(), shoved: [], nuts: [], lanes: [], conk: [], pips: [], lumps: [], frags: [], held: [], carry: null, tf: -1 });
  const F = w => w.w1 || (w.w1 = {});
  const live = w => !!(G && G.weapons && G.weapons.includes(w));
  const pale = '#f1ecff';
  const ang = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

  // ------------------------------------------------------------ shared helpers
  // A hit a card makes: real damage but no hook re-trigger (wupEcho). echo=true makes it echo damage (matrix 12.1).
  function cardSrc(w, atk, echo, extra) {
    return Object.assign({ elem: 'phys', w, atk, wupEcho: true, noCrit: true, noProc: true, noArc: true, wname: w.def.name + (echo ? ' (echo)' : '') }, echo ? { echo: true, noStatus: true } : null, extra);
  }
  // Knock e away along (ux, uy) by about dist units (bosses, eggs and the very large don't move; Squishy halves it).
  function shove(e, ux, uy, dist) {
    if (!e || e.dead || e.boss || e.egg || e.def.spongy || e.def.heavy || e.tethT > G.t) return false;
    const l = Math.hypot(ux, uy) || 1;
    let k = dist * 3.9 * (e.def.ai === 'aura' || e.def.hp > 200 ? 0.3 : 1) * (e.cd && e.cd.def === 'squishy' ? 0.5 : 1);
    if (!(k > 0)) return false;
    e.kx += ux / l * k; e.ky += uy / l * k;
    return true;
  }
  // A heavy hit's effects: one Shell layer off, Poise up by fill (1 = a stagger). Returns layers removed.
  function heavy(e, w, fill) {
    if (!e || e.dead) return 0;
    const c = fightCd(e); let shed = 0;
    if (c.def === 'shell' && c.layers > 0) {
      c.layers--; c.layerHp = c.layers ? c.maxHp * COMBAT.shellLayerHpFrac : 0; fst().layers++; shed = 1;
      ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.35, 5); fxParts('spark', e.x, e.y, FIGHT_COL.shell, 8, 140, 0.4, 3);
    }
    if (fill) {
      c.bars.force += fill; c.barQuietT.force = 0;
      if (c.bars.force >= 1) { c.bars.force = 0; fightPayoff(e, 'stagger', { raw: 0 }, {}); }
    }
    return shed;
  }
  function recoil(fromX, fromY, dist) { // push the swimmer away from (fromX, fromY) (modifiers.js lunge)
    const p = G.player, S = modS(), dx = p.x - fromX, dy = p.y - fromY, l = Math.hypot(dx, dy) || 1;
    if (S.lunge && S.lunge.left > 0) return;
    S.lunge = { ux: dx / l, uy: dy / l, left: dist, v: dist / 0.25 };
  }
  const throttleT = {};
  function say(key, x, y, txt, color, size, gap) { // floating text, at most once per gap seconds per key
    if ((throttleT[key] || 0) > G.realT) return;
    throttleT[key] = G.realT + (gap || 0.25); floatText(x, y, txt, color, size || 12, 0.6);
  }
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
    return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
  }

  // ------------------------------------------------------------ collisions (matrix 11.5 wall = 40% of the hit)
  // A shoved enemy that runs into another enemy (or a wall) takes a collision hit, and so does what it hit (40% of the
  // shove's damage each, echo damage). s.max = how many more enemies the shove may be passed on to (0 = none).
  function shoveTrack(e, w, ux, uy, dist, o) {
    if (!shove(e, ux, uy, dist)) return false;
    S1().shoved.push(Object.assign({ e, w, age: 0, hit: new Set([e]), depth: 0, max: 0 }, o));
    return true;
  }
  function collide(s, e, o, wx, wy) {
    if (s.cap) { if (s.cap.n >= s.cap.max) { s.done = 1; return; } s.cap.n++; }
    const base = (typeof s.dmg === 'function' ? s.dmg() : s.dmg) || 0, d = base * 0.4, mx = o ? (e.x + o.x) / 2 : wx, my = o ? (e.y + o.y) / 2 : wy;
    if (!s.noDmg && d > 0) {
      damageEnemy(e, d, cardSrc(s.w, 'contact', true));
      if (o) damageEnemy(o, d, cardSrc(s.w, 'contact', true));
    }
    ring(mx, my, 20, '#ffffff', 0.25, 3); fxParts('spark', mx, my, s.w.def.color, 6, 130, 0.3, 2.5);
    say('clack', mx, my - 14, s.noDmg ? 'KNOCK-ON' : 'CLACK', pale, 11, 0.2);
    if (s.blast) { const rr = 50; forNear(mx, my, rr, q => { damageEnemy(q, base * 0.4, cardSrc(s.w, 'burst', true)); return false; }); ring(mx, my, rr, s.w.def.color, 0.3, 4); }
    if (o) {
      s.hit.add(o);
      const ux = o.x - e.x, uy = o.y - e.y;
      if (s.knockOn) shove(o, ux, uy, 100);
      else if (s.depth < s.max) shoveTrack(o, s.w, ux, uy, 90, Object.assign({}, s, { e: o, age: 0, done: 0, depth: s.depth + 1, dmg: base * 0.6 }));
    }
    s.done = 1;
  }
  function trackTick(dt) {
    const S = S1();
    for (let i = 0; i < S.shoved.length; i++) {
      const s = S.shoved[i], e = s.e;
      s.age += dt;
      if (e.dead || s.age > 0.7 || !live(s.w)) { s.done = 1; continue; }
      const sp = Math.hypot(e.kx, e.ky);
      if (sp < 70) { if (s.age > 0.08) s.done = 1; continue; }
      const ux = e.kx / sp, uy = e.ky / sp;
      if (typeof modWall === 'function' && modWall(e.x + ux * (e.r + 6), e.y + uy * (e.r + 6))) { collide(s, e, null, e.x + ux * (e.r + 4), e.y + uy * (e.r + 4)); continue; }
      let other = null;
      forNear(e.x, e.y, e.r + 4, o => {
        if (o === e || o.dead || o.egg || s.hit.has(o)) return false;
        const dx = o.x - e.x, dy = o.y - e.y;
        if (Math.hypot(dx, dy) < e.r + o.r + 2 && dx * ux + dy * uy > 0) { other = o; return true; }
        return false;
      });
      if (other) collide(s, e, other);
    }
    S.shoved = S.shoved.filter(s => !s.done);
  }

  // ------------------------------------------------------------ per-frame world state shared by the four weapons
  function gtick(dt) {
    if (!G || G.frameN === undefined) return;
    const S = S1();
    if (S.tf === G.frameN) return;
    S.tf = G.frameN;
    const p = G.player;
    trackTick(dt);
    for (const [id, v] of S.vol) if (G.t - v.t > 2) S.vol.delete(id);
    // Contraflow lanes: knock sideways whatever crosses one, once each.
    for (const l of S.lanes) {
      l.life -= dt;
      const mx = (l.x1 + l.x2) / 2, my = (l.y1 + l.y2) / 2, len = Math.hypot(l.x2 - l.x1, l.y2 - l.y1);
      forNear(mx, my, len / 2 + 20, e => {
        if (l.hit.has(e) || segDist(e.x, e.y, l.x1, l.y1, l.x2, l.y2) > e.r + 16) return false;
        l.hit.add(e);
        const cr = (l.x2 - l.x1) * (e.y - l.y1) - (l.y2 - l.y1) * (e.x - l.x1), nx = -(l.y2 - l.y1) * Math.sign(cr || 1), ny = (l.x2 - l.x1) * Math.sign(cr || 1);
        if (shove(e, nx, ny, 90)) { ring(e.x, e.y, e.r + 6, pale, 0.25, 3); say('lane', e.x, e.y - e.r - 8, 'CONTRAFLOW', pale, 10, 0.3); }
        return false;
      });
    }
    S.lanes = S.lanes.filter(l => l.life > 0 && live(l.w));
    // Conkers: a nut on a string swings once round the enemy it hit.
    for (const c of S.conk) {
      c.t += dt;
      const e = c.e; if (!e.dead) { c.cx = e.x; c.cy = e.y; }
      const a = c.a + c.t / 0.45 * TWO, R = (c.er || 14) + 46; c.nx = c.cx + Math.cos(a) * R; c.ny = c.cy + Math.sin(a) * R;
      forNear(c.nx, c.ny, 12, q => { if (c.hit.has(q)) return false; c.hit.add(q); damageEnemy(q, c.dmg, cardSrc(c.w, 'proj', false, { kx: q.x - c.cx, ky: q.y - c.cy })); return false; });
    }
    S.conk = S.conk.filter(c => c.t < 0.45 && live(c.w));
    // Nuts on the floor (Squirrel): swim over one and it fires again.
    for (const n of S.nuts) {
      n.life -= dt;
      if (Math.hypot(p.x - n.x, p.y - n.y) < 30) {
        const t = acquire('nearest', n.w.s.range * 1.2, n.x, n.y);
        if (t) { spawnProj(n.w, n.x, n.y, ang(n, t), cardSrc(n.w, 'proj'), { dmg: n.dmg }); ring(n.x, n.y, 16, pale, 0.3, 3); say('nut', n.x, n.y - 16, 'NUT', pale, 12); n.life = 0; }
      }
    }
    S.nuts = S.nuts.filter(n => n.life > 0 && live(n.w));
    // Confetti stuck in the floor.
    for (const c of S.pips) {
      c.life -= dt;
      forNear(c.x, c.y, 9, e => { damageEnemy(e, c.dmg, cardSrc(c.w, 'spread', false, { kx: e.x - c.x, ky: e.y - c.y })); c.life = 0; fxParts('spark', c.x, c.y, pale, 3, 90, 0.25, 2); return true; });
    }
    S.pips = S.pips.filter(c => c.life > 0 && live(c.w));
    // Dud lumps.
    for (const l of S.lumps) {
      l.t -= dt;
      if (l.t <= 0 && live(l.w)) pbBlast(l.w, l.x, l.y, { r: l.r, dmg: l.dmg, base: l.r, bdmg: l.dmg, ev: { pops: 0, pending: 0 } });
    }
    S.lumps = S.lumps.filter(l => l.t > 0 && live(l.w));
    // Shrapnel: lands, bounces once, hits what it lands on.
    for (const f of S.frags) {
      f.t += dt;
      const k = Math.min(1, f.t / f.dur);
      f.x = lerp(f.sx, f.tx, k); f.y = lerp(f.sy, f.ty, k); f.h = Math.sin(k * Math.PI) * 26;
      if (k >= 1) {
        forNear(f.tx, f.ty, 24, e => { damageEnemy(e, f.dmg, cardSrc(f.w, 'burst', false, { kx: e.x - f.tx, ky: e.y - f.ty })); return false; });
        ring(f.tx, f.ty, 22, f.w.def.color, 0.25, 3); fxParts('spark', f.tx, f.ty, f.w.def.color, 4, 100, 0.3, 2.5);
        if (!f.bounced) { f.bounced = 1; const a = rand(0, TWO); f.sx = f.tx; f.sy = f.ty; f.tx += Math.cos(a) * 70; f.ty += Math.sin(a) * 70; f.t = 0; f.dur = 0.25; }
        else f.done = 1;
      }
    }
    S.frags = S.frags.filter(f => !f.done && live(f.w));
    // Vice Grip holds: pinned in place, jaws shut.
    let holding = false;
    for (const h of S.held) {
      if (h.e.dead || G.t > h.until) { h.done = 1; continue; }
      holding = true; h.e.kx = 0; h.e.ky = 0; h.e.x = h.x; h.e.y = h.y;
    }
    S.held = S.held.filter(h => !h.done);
    if (holding) {
      for (const h of S.held) if (h.getaway) {
        if (!(G.penHasteT > G.t)) { G.penHasteT = G.t + 0.1; G.penHasteK = 1.25; }
        for (const b of G.ebul) if (!b.dead && !b.w1lost && Math.hypot(b.x - p.x, b.y - p.y) < 320) { b.w1lost = 1; const a = (Math.random() < 0.5 ? 1 : -1) * 0.5, c = Math.cos(a), s = Math.sin(a), vx = b.vx; b.vx = vx * c - b.vy * s; b.vy = vx * s + b.vy * c; }
        break;
      }
    }
    // Hug It Out: the carried enemy rides in front of you and soaks up enemy shots.
    const cr = S.carry;
    if (cr) {
      if (cr.e.dead || G.t > cr.until || !live(cr.w)) S.carry = null;
      else {
        const e = cr.e, face = p.face || 0;
        e.x = p.x + Math.cos(face) * (p.r + e.r + 14); e.y = p.y + Math.sin(face) * (p.r + e.r + 14); e.kx = 0; e.ky = 0; stun(e, 0.2);
        for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r + 2) { b.dead = true; damageEnemy(e, b.dmg, cardSrc(cr.w, 'proj', true)); spawnPart(b.x, b.y, cr.w.def.color, 2, 60, 0.2, 2); say('soak', e.x, e.y - e.r - 8, 'SOAKED', pale, 11, 0.3); }
      }
    }
  }

  // ------------------------------------------------------------ drawing (marks, nuts, lanes, lumps, jaws)
  const s_ = () => (typeof S === 'number' ? S : 1);
  function w1Draw() {
    if (!G || !G.w1) return;
    const S = G.w1, k = s_(), t = G.realT || 0;
    ctx.save(); ctx.lineWidth = Math.max(1.5, 2 * k); ctx.lineCap = 'round';
    for (const e of G.enemies) { // dented-nut marks (Standard Issue) and cracks (Nervous Wreck)
      if (e.dead) continue;
      if (e.w1n > 0 || e.w1mk) {
        const x = sx(e.x), y = sy(e.y), r = (e.r + 7) * k;
        ctx.strokeStyle = col(pale);
        for (let i = 0; i < 4; i++) { ctx.globalAlpha = e.w1mk || i < e.w1n % 4 ? 0.95 : 0.22; ctx.beginPath(); ctx.arc(x, y, r, i * Math.PI / 2 + 0.15, (i + 1) * Math.PI / 2 - 0.15); ctx.stroke(); }
        if (e.w1mk) { ctx.globalAlpha = 0.9 + 0.1 * Math.sin(t * 10); ctx.fillStyle = col(pale); ctx.beginPath(); ctx.arc(x, y - r - 7 * k, 5 * k, 0, TWO); ctx.fill(); ctx.fillStyle = col('#10121a'); ctx.beginPath(); ctx.arc(x + 2 * k, y - r - 9 * k, 2.4 * k, 0, TWO); ctx.fill(); }
      }
      if (e.w3crack > 0) {
        const x = sx(e.x), y = sy(e.y), r = e.r * k; ctx.strokeStyle = col('#ffffff'); ctx.globalAlpha = 0.85;
        for (let i = 0; i < e.w3crack * 2; i++) { const a = i * 2.4 + e.id; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2); ctx.lineTo(x + Math.cos(a + 0.3) * r * 0.65, y + Math.sin(a + 0.3) * r * 0.65); ctx.lineTo(x + Math.cos(a - 0.1) * r * 1.0, y + Math.sin(a - 0.1) * r * 1.0); ctx.stroke(); }
      }
    }
    ctx.globalAlpha = 0.9;
    for (const h of S.held) { // jaws shut
      const e = h.e, x = sx(e.x), y = sy(e.y), r = (e.r + 5) * k; ctx.strokeStyle = col(h.w.def.color); ctx.lineWidth = Math.max(2, 3 * k);
      ctx.beginPath(); ctx.arc(x, y, r, 0.35, Math.PI - 0.35); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, r, Math.PI + 0.35, TWO - 0.35); ctx.stroke();
    }
    ctx.lineWidth = Math.max(1.5, 2 * k);
    if (S.carry && !S.carry.e.dead) { ctx.strokeStyle = col(S.carry.w.def.color); ctx.beginPath(); ctx.arc(sx(S.carry.e.x), sy(S.carry.e.y), (S.carry.e.r + 6) * k, 0, TWO); ctx.stroke(); }
    ctx.fillStyle = col(pale);
    for (const n of S.nuts) { ctx.globalAlpha = Math.min(1, n.life / 2); ctx.beginPath(); ctx.arc(sx(n.x), sy(n.y), 5 * k, 0, TWO); ctx.fill(); }
    for (const c of S.pips) { ctx.globalAlpha = Math.min(1, c.life); ctx.fillRect(sx(c.x) - 2 * k, sy(c.y) - 2 * k, 4 * k, 4 * k); }
    ctx.globalAlpha = 1;
    for (const l of S.lanes) { ctx.strokeStyle = col(pale); ctx.globalAlpha = Math.min(1, l.life * 2.5); ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.moveTo(sx(l.x1), sy(l.y1)); ctx.lineTo(sx(l.x2), sy(l.y2)); ctx.stroke(); }
    ctx.lineWidth = Math.max(1.5, 2 * k); ctx.globalAlpha = 0.9;
    for (const c of S.conk) { if (c.nx === undefined) continue; ctx.strokeStyle = col(pale); ctx.beginPath(); ctx.moveTo(sx(c.cx), sy(c.cy)); ctx.lineTo(sx(c.nx), sy(c.ny)); ctx.stroke(); ctx.fillStyle = col(pale); ctx.beginPath(); ctx.arc(sx(c.nx), sy(c.ny), 6 * k, 0, TWO); ctx.fill(); }
    for (const l of S.lumps) { ctx.strokeStyle = col(l.w.def.color); ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 12); ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.arc(sx(l.x), sy(l.y), l.r * k, 0, TWO); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.fillStyle = col(l.w.def.color); ctx.beginPath(); ctx.arc(sx(l.x), sy(l.y), (5 + (2 - l.t) * 2) * k, 0, TWO); ctx.fill(); }
    ctx.fillStyle = col(pale); ctx.globalAlpha = 1;
    for (const f of S.frags) { ctx.beginPath(); ctx.arc(sx(f.x), sy(f.y) - (f.h || 0) * k, 4.5 * k, 0, TWO); ctx.fill(); }
    ctx.restore();
  }

  // ------------------------------------------------------------ Standard Issue (Force, Projectile)
  function siStats(w, s) {
    const f = F(w);
    if (f.p === 'A') s.dmg *= 0.85;
    if (f.p === 'B') { s.pierce = (s.pierce || 0) + 3 + (f.momentum ? 1 : 0) + (f.contraflow ? 2 : 0); s.cd *= 1.25; }
    if (f.shell) s.cd /= 1.5;
    if (f.inf) s.pierce = Math.max(s.pierce || 0, 11);
  }
  function siFire(w, target) {
    if (w._in) return false;
    const f = F(w), p = G.player, s = w.s;
    if (f.sqa) {
      f.n = (f.n || 0) + 1;
      if (f.n % 10 === 0) { // the last ten again, in 0.3 s, each x1.5
        const fl = Object.assign(weaponSrc(w), { wupEcho: true });
        say('sqa', p.x, p.y - 34, 'SQUIRREL AWAY', pale, 14, 0.4);
        for (let i = 0; i < 10; i++) after(i * 0.033, () => {
          if (!live(w)) return;
          const q = G.player, t = target && !target.dead ? target : acquire('nearest', w.s.range, q.x, q.y);
          if (t) spawnProj(w, q.x, q.y, ang(q, t) + rand(-0.04, 0.04), fl, { dmg: w.s.dmg * 1.5 });
        });
      }
    }
    if (f.p === 'C') { // no switching while one is marked
      let m = null, bd = 1e12;
      for (const e of G.enemies) if (e.w1mk && !e.dead) { const d2 = (e.x - p.x) ** 2 + (e.y - p.y) ** 2; if (d2 < bd && d2 < s.range * s.range) { bd = d2; m = e; } }
      if (m && m !== target) { w._in = 1; try { fireWeapon(w, m); } finally { w._in = 0; } return true; }
    }
    return false;
  }
  function siDmg(w, e, src) {
    if (src.wupEcho) return 1;
    return F(w).p === 'C' && e.w1mk ? 2.5 : 1;
  }
  function siHit(w, e, res, src) {
    const f = F(w);
    if (f.p === 'C') {
      if (e.w1mk) { // the bonk
        e.w1mk = 0; e.w1n = 0; e.w1soft = 0;
        heavy(e, w, f.concuss ? 1 : 0.333);
        shove(e, e.x - G.player.x, e.y - G.player.y, 45);
        ring(e.x, e.y, e.r + 16, '#ffffff', 0.3, 7); fxParts('spark', e.x, e.y, pale, 12, 200, 0.4, 3); cam.shake = Math.min(8, cam.shake + 3);
        floatText(e.x, e.y - e.r - 14, 'BONK', pale, 16, 0.7);
      } else {
        e.w1n = (e.w1n || 0) + 1;
        if (e.w1n >= (f.concuss && (e.elite || e.boss) ? 3 : 4)) {
          e.w1n = 0; e.w1mk = 1; e.w1by = w; e.w1soft = f.soft ? 1 : 0;
          ring(e.x, e.y, e.r + 8, pale, 0.3, 4); floatText(e.x, e.y - e.r - 12, 'DENTED', pale, 12, 0.6);
        }
      }
    }
    if (f.shell) heavy(e, w, 0.333);
  }
  function siKill(w, e) {
    if (!F(w).allergy) return;
    const x = e.x, y = e.y, r = e.r;
    G.fx.push({ type: 'warn', x, y, r: r + 36, color: w.def.color, life: 0.3, max: 0.3 });
    after(0.3, () => {
      if (!live(w)) return;
      ring(x, y, r + 50, pale, 0.3, 5); fxParts('spark', x, y, pale, 10, 180, 0.4, 3); say('allergy', x, y - 14, 'ACHOO', pale, 13, 0.3);
      forNear(x, y, 90, q => { shove(q, q.x - x, q.y - y, 80); return false; });
    });
  }
  function siPhit(w, pr, e) {
    if (pr.src && pr.src.wupEcho) return;
    const f = F(w), S = S1();
    pr.wn = (pr.wn || 0) + 1;
    if (pr.wn === 1) { pr.wx0 = e.x; pr.wy0 = e.y; pr.wbase = pr.dmg; pr.wr0 = pr.r; }
    if (f.p === 'C' && f.nutAllergy) { /* (the burst is on the kill) */ }
    if (f.conkers && !pr.cs && S.conk.length < 8) {
      pr.cs = 1; S.conk.push({ w, e, a: rand(0, TWO), t: 0, hit: new Set([e]), dmg: pr.dmg * 0.6, cx: e.x, cy: e.y, er: e.r });
    }
    if (f.p === 'B') {
      if (pr.pierce > 0) {
        pr.dmg = Math.min(pr.dmg * 1.15, pr.wbase * (f.inf ? 2.5 : 2)); pr.r = Math.min(pr.r * 1.12, pr.wr0 * 2.2);
        if (f.momentum) { pr.speed *= 1.12; pr.vx *= 1.12; pr.vy *= 1.12; pr.life += 0.04; }
      }
      if (f.momentum && pr.wn >= 4) pr.r = Math.max(pr.r, pr.wr0 * 2);
      if (f.contraflow && pr.wn >= 5 && !pr.lane && S.lanes.length < 6) {
        pr.lane = 1; S.lanes.push({ w, x1: pr.wx0, y1: pr.wy0, x2: pr.x, y2: pr.y, life: 0.5, hit: new Set() });
        say('lane0', pr.x, pr.y - 12, 'CONTRAFLOW', pale, 11, 0.3);
      }
    }
    const maxB = f.inf ? 99 : 2 + (f.lastOrders ? 1 : 0);
    if (f.p === 'A') {
      if (f.lastOrders && pr.wb === 2) { heavy(e, w, 0.333); ring(e.x, e.y, e.r + 12, '#ffffff', 0.3, 5); }
      if ((pr.wb || 0) < maxB && pr.wn < (f.inf ? 12 : 99)) {
        const ex = pr.hits || []; let nx = null, bd = 110 * 110;
        forNear(e.x, e.y, 110, (o, d2) => { if (o === e || o.dead || o.charmed || o.egg || ex.includes(o.id)) return false; if (d2 < bd) { bd = d2; nx = o; } return false; });
        if (nx) {
          pr.wb = (pr.wb || 0) + 1;
          const sp = Math.hypot(pr.vx, pr.vy) || pr.speed, a = ang(pr, nx);
          pr.vx = Math.cos(a) * sp; pr.vy = Math.sin(a) * sp; pr.pierce = Math.max(pr.pierce, 1); pr.life = Math.max(pr.life, 0.45);
          if (!f.inf) pr.dmg *= 0.8;
          bolt(e.x, e.y, nx.x, nx.y, pale, 0.25);
          if (f.cradle) { // slam the two together
            shove(e, nx.x - e.x, nx.y - e.y, 40);
            const d = pr.dmg * 0.4; damageEnemy(e, d, cardSrc(w, 'contact', true)); damageEnemy(nx, d, cardSrc(w, 'contact', true));
            ring((e.x + nx.x) / 2, (e.y + nx.y) / 2, 20, '#ffffff', 0.25, 3); say('cradle', (e.x + nx.x) / 2, (e.y + nx.y) / 2 - 14, 'CLACK', pale, 11, 0.2);
          }
        }
      }
    }
    if (f.inf) { if (pr.wn < 12) pr.pierce = Math.max(pr.pierce, 1); else pr.pierce = 0; }
  }
  function siPend(w, pr) {
    const f = F(w), S = S1();
    if (!f.squirrel || pr.nHit || (pr.src && pr.src.wupEcho) || S.nuts.length >= 8) return;
    S.nuts.push({ w, x: pr.x, y: pr.y, life: 12, dmg: w.s.dmg });
  }
  function siInstall(w) {
    const f = F(w); if (f.inst) return; f.inst = 1;
    wupOn(w, 'stats', siStats); wupOn(w, 'fire', siFire); wupOn(w, 'dmg', siDmg); wupOn(w, 'hit', siHit); wupOn(w, 'kill', siKill);
    wupOn(w, 'phit', siPhit); wupOn(w, 'pend', siPend); wupOn(w, 'tick', (w, dt) => gtick(dt));
  }

  // ------------------------------------------------------------ Maximum Gains (Force, Spread)
  function mgStats(w, s) {
    const f = F(w);
    if (f.p === 'A') { s.spread /= 3; s.range = Math.min(s.range, 200); }
    if (f.p === 'B') { s.count += 5; s.spread *= 1.5; s.size *= 0.85; }
    if (f.p === 'C') { s.knock = Math.max(s.knock || 0, 70); s.dmg *= 0.85; }
    if (f.hic) s.cd *= 0.8;
    if (f.baby) s.count *= 3;
    if (f.auto) { s.cd *= 0.25; s.dmg *= 0.6; s.mag = 99; s.reload = 0.05; }
  }
  function mgVolley(w, t) { // the engine's own volley, with its pellets tagged
    const f = F(w), S = S1(), n0 = G.proj.length;
    w._in = 1; try { fireWeapon(w, t); } finally { w._in = 0; }
    const prs = G.proj.slice(n0).filter(q => q.w === w && !q.dead);
    if (!prs.length) return;
    const id = ++S.vid; S.vol.set(id, { n: prs.length, hits: new Map(), dmg: new Map(), shv: new Map(), t: G.t, w, cap: { n: 0, max: 6 } });
    prs.forEach(q => { q.wv = id; });
    if (f.p === 'B' && !f.baby && prs.length > 5) for (const q of prs.slice(-5)) { q.dmg *= 0.6; q.r *= 0.8; }
  }
  function mgFire(w, target) {
    if (w._in) return false;
    const f = F(w), p = G.player, s = w.s;
    f.vn = (f.vn || 0) + 1;
    let t = target;
    if (f.rice && f.vn % 2 === 0) { t = { x: p.x - (target.x - p.x), y: p.y - (target.y - p.y), r: 1 }; say('rice', p.x, p.y - 30, 'REAR VOLLEY', pale, 11, 0.3); }
    const a0 = ang(p, t);
    if (f.slug && f.vn % 3 === 0) { // the volley fuses into one slug
      p.face = a0; G.fx.push({ type: 'muzzle', x: p.x, y: p.y, a: a0, color: w.def.color, life: 0.1, max: 0.1 });
      spawnProj(w, p.x, p.y, a0, weaponSrc(w), { dmg: s.dmg * s.count * 0.8, r: 9, pierce: 3, wslug: 1 });
      say('slug', p.x, p.y - 30, 'SLUG', pale, 13, 0.3); ring(p.x + Math.cos(a0) * 24, p.y + Math.sin(a0) * 24, 16, pale, 0.2, 4);
    } else if (f.round && f.vn % 4 === 0) { // a full ring (Burst rules: no Evasion)
      const sr = Object.assign(weaponSrc(w), { atk: 'burst' }), N = 20;
      for (let i = 0; i < N; i++) spawnProj(w, p.x, p.y, i / N * TWO, sr, { dmg: s.dmg });
      ring(p.x, p.y, 70, pale, 0.3, 4); say('round', p.x, p.y - 30, 'ROUNDABOUT', pale, 13, 0.3);
    } else mgVolley(w, t);
    if (f.hic) w.cd += s.cd * (Math.random() < 0.2 ? -1 : rand(-0.2, 0.6)); // never on a rhythm; sometimes twice in a row
    if (f.baby) recoil(t.x, t.y, 80);
    else if (f.p === 'A') recoil(t.x, t.y, 14); // a little kick on every volley
    return true;
  }
  function mgDmg(w, e, src) {
    if (src.wupEcho) return 1;
    const f = F(w);
    if (f.p === 'A' && Math.hypot(e.x - G.player.x, e.y - G.player.y) <= 120 + e.r * 0.5) {
      if ((e.w1fx || 0) < G.realT) { e.w1fx = G.realT + 0.3; fxParts('spark', e.x, e.y, '#ffd9a0', 3, 90, 0.25, 2); }
      return 1.6;
    }
    return 1;
  }
  function mgPhit(w, pr, e) {
    if (pr.src && pr.src.wupEcho) return;
    const f = F(w), S = S1();
    if (pr.wslug) { heavy(e, w, 0.333); ring(e.x, e.y, e.r + 10, '#ffffff', 0.3, 5); return; }
    const v = pr.wv && S.vol.get(pr.wv); if (!v) return;
    const n = (v.hits.get(e) || 0) + 1; v.hits.set(e, n); v.dmg.set(e, (v.dmg.get(e) || 0) + pr.dmg);
    const unit = (w.s.knock || 0) / 3.9;
    if (f.p === 'C' && n >= 3) { if (shove(e, pr.vx, pr.vy, (n === 3 ? 3 : 1) * unit) && n === 3) { ring(e.x, e.y, e.r + 8, pale, 0.3, 4); say('shov', e.x, e.y - e.r - 8, 'SHOVED', pale, 11, 0.3); } }
    if (f.riot) { const used = v.shv.get(e) || 0; if (used < 240) { shove(e, pr.vx, pr.vy, 45); v.shv.set(e, used + 45); } }
    if (n === 1 && (f.pile || f.skit || f.riot)) S.shoved.push({ e, w, age: 0, hit: new Set([e]), depth: 0, max: f.skit || f.riot ? 1 : 0, cap: v.cap, dmg: () => v.dmg.get(e) || 0, blast: !!f.riot });
    if (f.kick && n === v.n && !v.kicked) { // every pellet found one enemy
      v.kicked = 1; shove(e, pr.vx, pr.vy, 170); recoil(e.x, e.y, 60);
      ring(e.x, e.y, e.r + 12, '#ffffff', 0.3, 6); floatText(e.x, e.y - e.r - 14, 'KICKBACK', pale, 15, 0.7); cam.shake = Math.min(8, cam.shake + 3);
    }
  }
  function mgPend(w, pr) {
    const f = F(w), S = S1();
    if (pr.nHit || (pr.src && pr.src.wupEcho)) return;
    if (f.conf && S.pips.length < 30) S.pips.push({ w, x: pr.x, y: pr.y, life: 2, dmg: pr.dmg });
    if (f.over && !pr.wsplit && !pr.wslug) {
      for (const da of [-0.35, 0.35]) spawnProj(w, pr.x, pr.y, Math.atan2(pr.vy, pr.vx) + da, pr.src, { dmg: pr.dmg * 0.4, life: 0.4, max: 0.4, wsplit: 1 });
    }
  }
  function mgTick(w, dt) {
    gtick(dt);
    if (F(w).auto) { w.reloadT = 0; w.ammo = Math.max(w.ammo, 4); }
  }
  function mgInstall(w) {
    const f = F(w); if (f.inst) return; f.inst = 1;
    wupOn(w, 'stats', mgStats); wupOn(w, 'fire', mgFire); wupOn(w, 'dmg', mgDmg); wupOn(w, 'phit', mgPhit); wupOn(w, 'pend', mgPend); wupOn(w, 'tick', mgTick);
  }

  // ------------------------------------------------------------ Nervous Wreck (Force, Contact)
  const nwR = w => w.s.reach || w.s.range;
  function nwStats(w, s) {
    const f = F(w);
    if (f.p === 'A') s.cd *= 1.34;
    if (f.jaws) { s.range = 240; s.reach = 240; }
  }
  function nwFire(w, target) {
    const f = F(w), p = G.player, s = w.s;
    if (f.nuts !== undefined) { // Nut Sack: a nut a clamp, six are flung as one heavy shot
      f.nuts++; say('nutn', p.x, p.y - 30, 'NUT ' + f.nuts + '/6', pale, 11, 0.1);
      if (f.nuts >= 6) {
        f.nuts = 0;
        const far = acquire('furthest', 440, p.x, p.y);
        if (far) {
          const a = ang(p, far);
          spawnProj(w, p.x, p.y, a, Object.assign(weaponSrc(w), { wupEcho: true, atk: 'proj' }), { speed: 560, vx: Math.cos(a) * 560, vy: Math.sin(a) * 560, life: 0.9, max: 0.9, r: 9, dmg: s.dmg * 3, pierce: 0, wheavy: 1 });
          floatText(p.x, p.y - 44, 'NUT SACK', pale, 14, 0.7);
        }
      }
    }
    if (f.jaws) { // a ring of jaws round you
      const R = 240; let n = 0; const sr = weaponSrc(w);
      p.face = ang(p, target);
      forNear(p.x, p.y, R, e => { if (e.charmed || n >= 24) return false; n++; damageEnemy(e, s.dmg, Object.assign({}, sr, { kx: e.x - p.x, ky: e.y - p.y })); return false; });
      ring(p.x, p.y, R, w.def.color, 0.3, 5); ring(p.x, p.y, R * 0.7, '#ffffff', 0.25, 3);
      return true;
    }
    return false;
  }
  function nwDmg(w, e, src) {
    if (src.wupEcho) return 1;
    const f = F(w);
    if (f.p !== 'C') return 1;
    e.w3now = e.w3ent && (f.untouch || G.t >= (e.w3cT || 0)) ? 1 : 0;
    return e.w3now ? 2 : 0.8;
  }
  function nwHit(w, e, res, src) {
    const f = F(w), p = G.player, S = S1();
    if (f.p === 'A') {
      const hold = e.boss ? 0.12 : 0.4, h0 = S.held.find(q => q.e === e); // (a boss is held 30% as long, like every stun)
      if (!h0) S.held.push({ e, w, until: G.t + hold, x: e.x, y: e.y, getaway: !!f.getaway });
      else h0.until = G.t + hold;
      stun(e, 0.4);
      ring(e.x, e.y, e.r + 5, w.def.color, 0.25, 4);
      if (f.friend) {
        let o = null, bd = 170 * 170;
        forNear(e.x, e.y, 170, (q, d2) => { if (q !== e && !q.dead && !q.egg && d2 < bd) { bd = d2; o = q; } return false; });
        if (o) {
          const gap = Math.hypot(o.x - e.x, o.y - e.y), mv = Math.max(0, Math.min(gap - e.r - o.r, 60)), ux = (o.x - e.x) / (gap || 1), uy = (o.y - e.y) / (gap || 1);
          if (!e.boss) { e.x += ux * mv; e.y += uy * mv; const h = S.held.find(q => q.e === e); if (h) { h.x = e.x; h.y = e.y; } }
          const d = res.raw * 0.4; damageEnemy(e, d, cardSrc(w, 'contact', true)); damageEnemy(o, d, cardSrc(w, 'contact', true));
          bolt(e.x, e.y, o.x, o.y, pale, 0.2); say('friend', (e.x + o.x) / 2, (e.y + o.y) / 2 - 14, 'CLACK', pale, 11, 0.2);
        }
      }
    }
    if (f.p === 'B') {
      const c = fightCd(e);
      e.w3n = (e.w3n || 0) + 1;
      let opened = false;
      if (e.w3n % 3 === 0) {
        if (c.def === 'shell' && c.layers > 0) { heavy(e, w, 0); if (c.layers === 0) opened = true; }
        else { e.w3crack = Math.min(3, (e.w3crack || 0) + 1); ring(e.x, e.y, e.r + 6, '#ffffff', 0.25, 3); say('crack', e.x, e.y - e.r - 10, 'CRACK ' + e.w3crack, pale, 11, 0.2); }
      }
      if (res.layersLost > 0 && c.def === 'shell' && c.layers === 0) opened = true;
      if (f.seep && e.w3crack > 0) {
        let k = 0; forNear(e.x, e.y, e.r + 14, q => { if (q === e || q.dead || k >= 4 || Math.hypot(q.x - e.x, q.y - e.y) > e.r + q.r + 8) return false; k++; damageEnemy(q, res.raw * 0.3, cardSrc(w, 'contact', true)); fxParts('spark', q.x, q.y, pale, 2, 70, 0.2, 2); return false; });
      }
      if (f.open && opened && !e.w3open) {
        e.w3open = 1; heavy(e, w, 1); ring(e.x, e.y, e.r + 14, '#ffffff', 0.3, 6); floatText(e.x, e.y - e.r - 14, 'CRACKED OPEN', pale, 13, 0.7);
        damageEnemy(e, w.s.dmg * 3, cardSrc(w, 'contact', false, { kx: e.x - p.x, ky: e.y - p.y }));
      }
    }
    if (f.crack) { // Crack Addict: every clamp is heavy; layers off heal you (6 health a second at most)
      const shed = heavy(e, w, 0.333) + (res.layersLost > 0 ? res.layersLost : 0);
      if (shed > 0) {
        const h = Math.min(shed * G.P.maxHp * 0.01, f.heal || 0);
        if (h > 0) { f.heal -= h; healPlayer(h, false); }
      }
    }
    if (f.p === 'C') {
      if (e.w3now) {
        e.w3now = 0; e.w3ent = 0; e.w3cT = G.t + 4; f.lastCtr = G.t;
        shove(e, e.x - p.x, e.y - p.y, 170);
        if (f.knockon) S.shoved.push({ e, w, age: 0, hit: new Set([e]), depth: 0, max: 0, noDmg: true, knockOn: true, dmg: 0 });
        ring(e.x, e.y, e.r + 14, '#ffffff', 0.3, 7); fxParts('spark', e.x, e.y, pale, 12, 200, 0.4, 3); cam.shake = Math.min(8, cam.shake + 3);
        floatText(e.x, e.y - e.r - 14, 'BACK OFF!', pale, 15, 0.7);
      }
      if (f.hug && !S.carry && G.t > (f.hugT || 0) && !e.boss && !e.egg) { S.carry = { e, w, until: G.t + 1 }; f.hugT = G.t + 3; say('hug', e.x, e.y - e.r - 12, 'HUG', pale, 13, 0.3); }
    }
  }
  function nwTick(w, dt) {
    gtick(dt);
    const f = F(w), p = G.player, S = S1(), R = nwR(w);
    if (f.crack) f.heal = Math.min(6, (f.heal || 0) + 6 * dt);
    if (f.tooth && G.t >= (f.toothT || 0)) {
      for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - p.x, b.y - p.y) < R) { b.dead = true; f.toothT = G.t + 0.5; spawnPart(b.x, b.y, w.def.color, 4, 80, 0.25, 2); ring(b.x, b.y, 14, pale, 0.25, 3); say('tooth', b.x, b.y - 10, 'CRUNCH', pale, 11, 0.2); break; }
    }
    if (f.p === 'C' || f.untouch) {
      let inRange = false;
      for (const e of G.enemies) {
        if (e.dead || e.phased || e.egg || e.charmed) continue;
        const near = Math.hypot(e.x - p.x, e.y - p.y) < R + e.r;
        if (near) {
          inRange = true;
          if (!e.w3in) {
            e.w3in = 1; e.w3ent = 1; (f.ents || (f.ents = [])).push(G.t);
            if (f.untouch && G.t - (f.lastCtr || -9) >= 0.3 && !(e.boss && false)) { // countered on the spot
              f.lastCtr = G.t; e.w3ent = 0; e.w3cT = G.t + 4;
              damageEnemy(e, w.s.dmg * 2, cardSrc(w, 'contact', false, { kx: e.x - p.x, ky: e.y - p.y }));
              shove(e, e.x - p.x, e.y - p.y, 170); ring(e.x, e.y, e.r + 14, '#ffffff', 0.3, 7); say('ctr', e.x, e.y - e.r - 14, 'BACK OFF!', pale, 14, 0.3);
            }
          }
        } else if (e.w3in) { e.w3in = 0; e.w3ent = 0; }
      }
      f.inRange = inRange;
      if (f.ents) f.ents = f.ents.filter(t => G.t - t <= 1);
      if (f.closing && f.ents && f.ents.length >= 3 && G.t > (f.ringT || 0)) { // three arrive at once: the jaws snap them all
        f.ringT = G.t + 3; f.ents.length = 0; let n = 0;
        forNear(p.x, p.y, R, e => { if (e.charmed || n >= 12) return false; n++; damageEnemy(e, w.s.dmg, cardSrc(w, 'contact', false, { kx: e.x - p.x, ky: e.y - p.y })); return false; });
        ring(p.x, p.y, R, w.def.color, 0.3, 6); ring(p.x, p.y, R * 0.7, '#ffffff', 0.25, 3); floatText(p.x, p.y - 36, 'CLOSING TIME', pale, 14, 0.7);
      }
    }
  }
  function nwInstall(w) {
    const f = F(w); if (f.inst) return; f.inst = 1;
    wupOn(w, 'stats', nwStats); wupOn(w, 'fire', nwFire); wupOn(w, 'dmg', nwDmg); wupOn(w, 'hit', nwHit); wupOn(w, 'phit', (w, pr, e) => { if (pr.wheavy) { heavy(e, w, 0.333); ring(e.x, e.y, e.r + 12, '#ffffff', 0.3, 6); } }); wupOn(w, 'tick', nwTick);
  }

  // ------------------------------------------------------------ Panic Button (Force, Burst)
  // One blast: damage by distance (Bigger Bang), chain pops (Chain Reaction), launches (Premature Evacuation).
  // o: { r, dmg, base (radius a chain pop keeps), bdmg (full damage), depth, ev, chain, noLaunch }
  function pbBlast(w, x, y, o) {
    const f = F(w), S = S1(), col = w.def.color, depth = o.depth || 0, ev = o.ev || (o.ev = { pops: 0, pending: 0 });
    const src = Object.assign(weaponSrc(w), { atk: 'burst', wupEcho: true });
    const killed = [], surv = [];
    forNear(x, y, o.r, (e, d2) => {
      const k = f.p === 'A' ? 0.8 + 0.5 * clamp(Math.sqrt(d2) / o.r, 0, 1) : 1, hp0 = e.hp;
      damageEnemy(e, o.dmg * k, Object.assign({}, src, { kx: e.x - x, ky: e.y - y }));
      if (e.dead) killed.push(e); else surv.push({ e, dealt: Math.max(0, hp0 - e.hp) });
      return false;
    });
    if (!o.chain) {
      G.fx.push({ type: 'flash', x, y, r: o.r * 0.9, color: col, life: 0.14, max: 0.14 });
      ring(x, y, o.r, col, 0.35, 4);
      if (f.p === 'A') ring(x, y, o.r, '#ffffff', 0.4, 8); // the bright rim
      fxParts('spark', x, y, col, Math.min(14, 5 + o.r / 9), o.r * 4.5, 0.3, 2.2);
      cam.shake = Math.min(8, cam.shake + o.r / 40); sfx('boom');
    } else { ring(x, y, o.r, col, 0.25, 3); fxParts('spark', x, y, col, 5, o.r * 4, 0.25, 2); }
    if (f.p === 'C' && !o.noLaunch) {
      for (const sv of surv) {
        const dist = 60 + 600 * Math.min(0.4, sv.dealt / Math.max(1, sv.e.maxHp)), ux = sv.e.x - x || rand(-1, 1), uy = sv.e.y - y || rand(-1, 1);
        if (f.bump) shoveTrack(sv.e, w, ux, uy, dist, { max: 0, dmg: o.dmg, cap: ev.cap || (ev.cap = { n: 0, max: 8 }) });
        else shove(sv.e, ux, uy, dist);
      }
      if (surv.length) ring(x, y, o.r * 1.15, pale, 0.4, 3);
    }
    if (f.p === 'B' || f.cmd) {
      const maxD = f.cmd ? 6 : f.daisy ? 3 : 1, cap = f.cmd ? 20 : 12, base = o.base || o.r, bdmg = o.bdmg || o.dmg;
      if (depth < maxD) {
        killed.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
        for (const e of killed) {
          if (ev.pops >= cap) break;
          ev.pops++; ev.pending++;
          const ex = e.x, ey = e.y, dl = 0.06 + clamp(Math.hypot(ex - x, ey - y) / Math.max(1, o.r), 0, 1) * 0.25;
          after(dl, () => {
            if (live(w)) pbBlast(w, ex, ey, { r: f.cmd ? base : base * 0.4, dmg: bdmg * 0.5, base, bdmg, depth: depth + 1, ev, chain: true });
            ev.pending--;
            if (live(w) && ev.pending <= 0 && f.finale && ev.pops >= 3 && !ev.fin) {
              ev.fin = 1; pbBlast(w, ex, ey, { r: base, dmg: bdmg, base, bdmg, depth: 99, ev, noLaunch: true });
              floatText(ex, ey - 24, 'GRAND FINALE', pale, 15, 0.8);
            }
          });
        }
      }
    }
    if (f.frag && !o.chain && S.frags.length < 24) {
      for (let i = 0; i < 6; i++) { const a = i / 6 * TWO + rand(0, 1), d = rand(90, 170); S.frags.push({ w, x, y, sx: x, sy: y, tx: x + Math.cos(a) * d, ty: y + Math.sin(a) * d, t: 0, dur: 0.35, dmg: o.dmg * 0.35 }); }
    }
  }
  function pbStats(w, s) {
    const f = F(w);
    if (f.p === 'A') s.area *= 1.4;
    if (f.p === 'B') s.dmg *= 0.85;
    if (f.big) { s.area *= 2.5; s.dmg *= 2; s.cd *= 2; }
    if (f.hair) { s.cd = 0.4; s.mag = 99; s.reload = 0.05; }
  }
  function pbFire(w, target) {
    if (w._in) return false;
    const f = F(w), s = w.s, p = G.player, S = S1();
    f.bn = (f.bn || 0) + 1;
    let t = target;
    if (f.grudge && G.grudge && !G.grudge.dead && Math.hypot(G.grudge.x - p.x, G.grudge.y - p.y) < s.range) { t = G.grudge; ring(t.x, t.y, t.r + 8, pale, 0.4, 3); say('grudge', t.x, t.y - t.r - 10, 'GRUDGE', pale, 12, 0.4); }
    if (f.hair) { const cs = acquireMany('cluster', s.range, p.x, p.y, 8), pv = f.lastC; t = cs.find(c => !pv || Math.hypot(c.x - pv.x, c.y - pv.y) > s.area * 0.8) || t; }
    let x = t.x, y = t.y;
    if (f.selfc) { x = p.x; y = p.y; }
    else if (f.edge) { const dx = p.x - x, dy = p.y - y, l = Math.hypot(dx, dy) || 1; x += dx / l * s.area * 0.6; y += dy / l * s.area * 0.6; }
    f.lastC = { x, y };
    const r = s.area, dmg = s.dmg;
    if (f.dud) { // one in four fails (a shuffled bag of four)
      if (!f.bag || !f.bag.length) f.bag = shuffle([0, 0, 0, 1]);
      if (f.bag.pop() === 1 && S.lumps.length < 3) { S.lumps.push({ w, x, y, t: 2, r: r * 3, dmg }); floatText(x, y - 16, 'DUD', pale, 14, 0.8); return true; }
    }
    G.fx.push({ type: 'warn', x, y, r, color: w.def.color, life: s.delay, max: s.delay });
    after(s.delay, () => {
      if (!live(w)) return;
      pbBlast(w, x, y, { r, dmg, base: r, bdmg: dmg });
      if (f.encore && f.bn % 4 === 0) after(0.3, () => { if (live(w)) { pbBlast(w, x, y, { r: r * 2, dmg: dmg * 0.6, base: r, bdmg: dmg, depth: 99, chain: false, noLaunch: true }); say('encore', x, y - 20, 'ENCORE', pale, 13, 0.3); } });
    });
    return true;
  }
  function pbInstall(w) {
    const f = F(w); if (f.inst) return; f.inst = 1;
    wupOn(w, 'stats', pbStats); wupOn(w, 'fire', pbFire); wupOn(w, 'tick', (w, dt) => { gtick(dt); if (F(w).hair) { w.reloadT = 0; w.ammo = Math.max(w.ammo, 2); } });
  }

  // ------------------------------------------------------------ the cards
  const C = (name, desc, apply) => ({ name, desc, apply });
  const set = (k, v) => w => { F(w)[k] = v === undefined ? 1 : v; };
  const P = (k, install) => w => { F(w).p = k; install(w); };

  wupReg(SI, {
    A: { name: 'Ricochet Brain', tag: 'Play into packed groups', costs: 'the first hit is 15% weaker.', shows: 'a pale zigzag links the bounces.', modes: 'ORBIT keeps a tight group in front of you.',
      lv3: { desc: 'After a hit, the shot bounces on to the nearest enemy, twice, a little weaker each time. First hit 15% weaker.', apply: P('A', siInstall) },
      lv6: [C("Newton's Cradle", 'A bounce slams the enemy it left into the one it found: both take a collision hit.', set('cradle')),
        C('Last Orders', 'The last bounce of each shot is a heavy hit, and the shot bounces once more.', set('lastOrders'))],
      wild: C('Squirrel', 'Missed shots land as nuts on the floor; swim over one and it fires again at the nearest enemy.', set('squirrel')) },
    B: { name: 'Through and Through', tag: 'Line the crowd up', costs: 'fire rate -20%.', shows: 'the pellet grows and its trail thickens with every enemy.', modes: 'KITE lines pursuers up behind each other.',
      lv3: { desc: 'Shots pierce up to 4 enemies, and each one after the first takes more than the last. Fire rate 20% slower.', apply: P('B', siInstall) },
      lv6: [C('Gathering Momentum', 'Shots speed up and pierce one more with every enemy they pass, and grow to double size after 4.', set('momentum')),
        C('Contraflow', 'Pierces 2 more; a shot that goes through 5 or more leaves a brief lane that knocks back whatever crosses it.', set('contraflow'))],
      wild: C('Conkers', 'Each shot is on a string: after its first hit it swings once round that enemy, hitting whatever it sweeps.', set('conkers')) },
    C: { name: 'Marked for Bonking', tag: 'Focus fire', costs: 'the shot stays on a marked enemy and will not switch.', shows: 'a dent icon fills in quarters; the bonk has a big thwack.', modes: 'HUNT, which already locks one target.',
      lv3: { desc: 'Every 4th hit on one enemy marks it; your next shot on it is a big heavy hit. Shots will not switch off a marked enemy.', apply: P('C', siInstall) },
      lv6: [C('Soft Spot', 'A marked enemy takes more damage from your other weapons until the bonk lands.', set('soft')),
        C('Concussion', 'The bonk staggers the enemy and knocks off a Shell layer; elites are marked every 3rd hit instead of 4th.', set('concuss'))],
      wild: C('Nut Allergy', 'Enemies killed by this weapon swell up and burst, knocking their neighbours back.', set('allergy')) },
    lv10: [
      { name: 'Shell Shock', best: 'C', desc: 'Every shot is a heavy hit that strips a Shell layer, and you fire half again as fast.', apply: set('shell') },
      { name: 'Infinite Nuts', best: 'AB', desc: 'Shots keep piercing and bouncing at full damage until each has hit 12 enemies.', apply: set('inf') },
      { name: 'Squirrel Away', best: 'C', desc: 'Every 10th shot fires the last ten again at the same target, each one harder.', apply: set('sqa') }] });

  wupReg(MG, {
    A: { name: 'Shotgun Wedding', tag: 'Get close and commit', costs: 'almost nothing lands beyond 200 units.', shows: 'a dense pellet ball and a recoil kick on the sperm.', modes: 'HUNT and ORBIT close the gap; KITE wastes it.',
      lv3: { desc: 'The cone narrows to a third and pellets hit much harder up close. Almost nothing lands at long range.', apply: P('A', mgInstall) },
      lv6: [C('Kickback', 'A point-blank volley knocks the enemy back hard and kicks you back as well.', set('kick')),
        C('Slug It Out', 'Every 3rd volley fuses into one slug that pierces 3 enemies and is a heavy hit.', set('slug'))],
      wild: C('Confetti', 'Pellets that miss stick in the floor for a moment and hit enemies that swim over them.', set('conf')) },
    B: { name: 'More Is More', tag: 'Cover the screen', costs: 'poor single-target damage; bosses shrug it off.', shows: 'a wide fan of tiny pips, then a full ring.', modes: 'ORBIT keeps a crowd in the fan; COLLECT clears a path through gems.',
      lv3: { desc: 'Adds 5 smaller pellets across a much wider fan. Poor against single tough enemies; bosses shrug it off.', apply: P('B', mgInstall) },
      lv6: [C('Overspill', 'Pellets that miss carry on and split once into 2 weaker pellets.', set('over')),
        C('Roundabout', '[Attack becomes Burst] Every 4th volley fires a full ring of pellets all the way round you.', set('round'))],
      wild: C('Wedding Rice', 'Every other volley fires backwards, behind you.', set('rice')) },
    C: { name: 'Get Off Me!', tag: 'Shove them about', costs: '-15% damage per pellet.', shows: 'enemies tumble away and bump into each other.', modes: 'KITE and HOLD keep space clear; NEST keeps the egg free.',
      lv3: { desc: 'Pellets knock enemies back, twice as far when 3 or more hit one enemy. Pellets do 15% less damage.', apply: P('C', mgInstall) },
      lv6: [C('Pile-Up', 'An enemy shoved into another enemy or a wall takes a collision hit, and so does what it hit.', set('pile')),
        C('Skittles', 'A shove that causes a collision knocks the next enemy on as well, so one volley scatters a group.', set('skit'))],
      wild: C('Hiccups', 'Fires at random moments, sometimes twice in a row: faster on average, but never on a rhythm.', set('hic')) },
    lv10: [
      { name: 'Baby Boom', best: 'AB', desc: 'Three times the pellets, each at full damage, and every volley kicks you backwards.', apply: set('baby') },
      { name: 'Riot Control', best: 'C', desc: 'Every pellet knocks back hard, and each collision sets off a small Force blast.', apply: set('riot') },
      { name: 'Full Auto', best: 'B', desc: 'Fires four times as fast with no reload, but each pellet does much less damage.', apply: set('auto') }] });

  wupReg(NW, {
    A: { name: 'Vice Grip', tag: 'Hold them and get out', costs: 'one clamp per 0.8 s (slower).', shows: 'the jaws stay shut round the enemy.', modes: 'KITE uses the hold to escape; NEST stops attackers reaching the egg.',
      lv3: { desc: 'Each clamp holds the enemy in place for a moment. Clamps come slower (one per 0.8 s).', apply: P('A', nwInstall) },
      lv6: [C('Getaway', 'While an enemy is held you swim faster, and enemy shots aimed at you lose track.', set('getaway')),
        C('Bring a Friend', 'The clamp swings the held enemy into the nearest enemy: a collision hit on both.', set('friend'))],
      wild: C('Tooth and Nail', 'The jaws bite bullets: an enemy shot that comes into clamp range is crushed (once per 0.5 s).', set('tooth')) },
    B: { name: 'Shell Game', tag: 'Crack the tough ones', costs: 'it does nothing extra to enemies you do not stay on.', shows: 'cracks spread across the target.', modes: 'HUNT keeps you on one enemy.',
      lv3: { desc: 'Every 3rd clamp on one enemy knocks off a Shell layer; with no Shell left it cracks and takes more from you. Only pays on enemies you stay on.', apply: P('B', nwInstall) },
      lv6: [C('Seepage', 'A cracked enemy leaks: your clamps on it splash on to the enemies touching it.', set('seep')),
        C('Cracked Open', 'When the last Shell layer comes off, the enemy is staggered and takes a triple-strength clamp.', set('open'))],
      wild: C('Nut Sack', 'Each clamp stores a nut; every 6 stored are flung at the furthest enemy as one heavy shot.', w => { F(w).nuts = 0; }) },
    C: { name: 'Back Off!', tag: 'Answer the first one in', costs: 'later clamps on the same enemy are 20% weaker.', shows: 'a big star thump and enemies flung clear.', modes: 'HOLD and NEST let enemies come to you.',
      lv3: { desc: 'The first clamp on each enemy that comes into range hits double and knocks it far back. Later clamps on it are 20% weaker.', apply: P('C', nwInstall) },
      lv6: [C('Knock-On', 'A counter-struck enemy knocked into another enemy knocks that one back too.', set('knockon')),
        C('Closing Time', 'When 3 or more enemies come into range at once, the jaws snap all of them in a ring.', set('closing'))],
      wild: C('Hug It Out', 'A clamped enemy is carried in front of you for a second, soaking up enemy shots.', set('hug')) },
    lv10: [
      { name: 'Jaws of Life', best: 'C', desc: 'The clamp becomes a wide ring of jaws round you that bites everything in reach every time.', apply: set('jaws') },
      { name: 'Crack Addict', best: 'B', desc: 'Every clamp is a heavy hit, and each Shell layer you knock off heals you a little.', apply: set('crack') },
      { name: 'Untouchable', best: 'AC', desc: 'While an enemy is in clamp range you take half Contact damage, and every enemy that comes into range is countered.', apply: set('untouch') }] });

  wupReg(PB, {
    A: { name: 'Bigger Bang Theory', tag: 'Clear the crowd', costs: '-20% damage at the centre.', shows: 'a fat shockwave with a bright rim.', modes: 'ORBIT keeps clusters in range.',
      lv3: { desc: 'Blasts are much wider and hit hardest at the rim. The centre does 20% less.', apply: P('A', pbInstall) },
      lv6: [C('Edge Case', "Blasts aim at the edge of the densest cluster, so the rim lands on the most enemies.", set('edge')),
        C('Encore', 'Every 4th blast is followed by a second, larger, weaker ring.', set('encore'))],
      wild: C('Grudge Match', 'Each blast goes off on whoever last hurt you, if it is in range.', set('grudge')) },
    B: { name: 'Chain Reaction', tag: 'Cascades', costs: '-15% base damage, so the payoff needs kills.', shows: 'pops rippling outwards through the crowd.', modes: 'COLLECT benefits from gems spilled across a wide area.',
      lv3: { desc: 'An enemy killed by a blast sets off a small blast where it died. Base damage 15% lower, so it needs kills.', apply: P('B', pbInstall) },
      lv6: [C('Daisy Chain', 'Chain blasts can kill too, and those kills chain on again, three links deep at most.', set('daisy')),
        C('Grand Finale', 'A chain of 3 or more pops ends in one full-size blast at the last link.', set('finale'))],
      wild: C('Dud', 'One blast in 4 fails and leaves a lump that goes off a moment later at triple size.', set('dud')) },
    C: { name: 'Premature Evacuation', tag: 'Make room', costs: 'no extra damage; the payoff is space and collisions.', shows: 'enemies flung outwards in a ring.', modes: 'KITE and NEST, which want enemies kept away.',
      lv3: { desc: 'Survivors are flung away from the blast; the more damage, the further they fly. No extra damage, only space.', apply: P('C', pbInstall) },
      lv6: [C('Bumper Cars', 'A launched enemy that hits another enemy or a wall takes a collision hit, and so does what it hits.', set('bump')),
        C('Elbow Room', 'Blasts go off around you instead of at a target, flinging everything nearby outward.', set('selfc'))],
      wild: C('Shrapnel Shower', 'Blasts throw chunky fragments that land, bounce once and hit whatever they land on.', set('frag')) },
    lv10: [
      { name: 'Big Bang', best: 'A', desc: 'Blasts are far bigger and twice as strong, but go off half as often.', apply: set('big') },
      { name: 'Chain of Command', best: 'B', desc: 'Chain blasts go six links deep and stay full size.', apply: set('cmd') },
      { name: 'Trigger Happy', best: 'AC', desc: 'A blast every fraction of a second, each on a different cluster.', apply: set('hair') }] });

  // ------------------------------------------------------------ wrappers (no shared file is edited)
  if (!globalThis.WUP_PROJ_HOOKS) { // the 'phit' and 'pend' hook kinds (shared by every wup*.js file)
    globalThis.WUP_PROJ_HOOKS = 1;
    const ph = projHit, pe = projEnd;
    projHit = function (pr, e) { ph(pr, e); const w = pr.w; if (w && w.uh && w.uh.phit) for (const f of w.uh.phit) f(w, pr, e); };
    projEnd = function (pr) { pe(pr); const w = pr.w; if (w && w.uh && w.uh.pend) for (const f of w.uh.pend) f(w, pr); };
  }
  const dm = wupDmgMul; // marks that raise what your weapons deal to that enemy
  wupDmgMul = function (e, src) {
    let k = dm(e, src);
    if (src && src.w && !src.dot) {
      if (e.w1mk && e.w1soft && e.w1by && src.w !== e.w1by) k *= 1.2; // Soft Spot
      if (e.w3crack) k *= 1 + 0.15 * e.w3crack; // Shell Game cracks
    }
    return k;
  };
  const hp = hurtPlayer; // Untouchable: half Contact damage while something is in clamp range
  hurtPlayer = function (dmg, from, ent, kind) {
    if (kind === 'contact' && G && G.weapons) for (const w of G.weapons) if (w && w.w1 && w.w1.untouch && w.w1.inRange) { dmg *= 0.5; break; }
    return hp(dmg, from, ent, kind);
  };
  const vd = v10Draw;
  v10Draw = function () { vd(); w1Draw(); };
})();
