'use strict';
// Spawn Prawn - Weapon Combos for the Armoury and the Playpen (batch 2: eight more, one per starting sequence, each
// pairing two weapons that had no combo yet). Same schema as combos.js and combos3.js. The sum of what each one does:
//   c_fertile      Egg White + Little Swimmers        swimmers in the lane go 60% faster and come out charged: double headbutts that glue
//   c_openwide     Butter Knife + Cod Liver Oil       knife hits spoon the gag onward; on a gagging foe they hit 150% harder
//   c_bugzapper    Carpet Shuffle + Lightning Bugs    each shuffle sets off a spark ring from every bug; bugs bite double for 2s
//   c_pickroll     Nose Goblins + Bogey Roller        goblins flick bogeys onto rollers; a full-size roller flicks them back out
//   c_nightterrors Boo-merang + Night Light           a Boo-merang past a lamp makes it flare (stun, damage, longer life)
//   c_bloodbank    Umbilical Cord + Leeches           the Cord plugs into every leeched enemy; leeches on corded foes bite double
//   c_lunarcycle   Period Drama + Ulcer Moons         every cramp flings the moons out to the cramp's edge; out there they cut deep
//   c_catchbin     Achoo + Wet Wipe                   a big sneeze is wiped up all round: bullets gone, everything soaked
// Hooks: combos.js comboFire (combo4Fire), comboHit (combo4Hit), comboTick (combo4Tick).

COMBOS.push(
  { id: 'c_fertile', a: 'eggwhite', b: 'swimmers', name: 'Fertile Window', desc: 'Little Swimmers swim 60% faster in your Egg White lane and come out of it charged for 2s: their headbutts hit twice as hard and glue for 0.6s. Conditions are optimal. Everyone is very excited.' },
  { id: 'c_openwide', a: 'butterknife', b: 'codliver', name: 'Open Wide', desc: 'Butter Knife hits flick a spoonful of Cod Liver Oil at the nearest enemy that is not gagging yet (every 0.5s), so the gag goes round the room. Knife hits on a gagging enemy hit 150% harder. Here comes the aeroplane. Nobody is fooled.' },
  { id: 'c_bugzapper', a: 'carpet', b: 'bugs', name: 'Bug Zapper', desc: 'Every Carpet Shuffle also bursts out of each Lightning Bug as a ring of 6 sparks, and for 2s after a shuffle the bugs bite twice as hard. Socks, carpet and a jar of fireflies.' },
  { id: 'c_pickroll', a: 'goblins', b: 'roller', name: 'Pick and Roll', desc: 'Every 0.5s the Nose Goblins flick fresh bogeys onto your Bogey Rollers, so they grow without touching anything. A roller twice its size flicks goblin bogeys at the nearest enemy every 0.3s. A closed ecosystem.' },
  { id: 'c_nightterrors', a: 'booerang', b: 'nightlight', name: 'Night Terrors', desc: 'A Boo-merang flying past a Night Light makes it flare: everything within 150 is stunned for 0.6s and takes a heavy zap, and the lamp stays plugged in 2s longer. Enemies already BOOed take 50% more from the lamps. It was under the bed the whole time.' },
  { id: 'c_bloodbank', a: 'cord', b: 'leeches', name: 'Blood Bank', desc: 'The Umbilical Cord also plugs into every enemy a Leech is latched onto (up to 4) and feeds off it. Leeches on a corded enemy bite twice as hard. Donations are not voluntary.' },
  { id: 'c_lunarcycle', a: 'period', b: 'ulcer', name: 'Lunar Cycle', desc: 'Every wave of cramps flings your Ulcer Moons out to its edge and back, and calls them out early if they were resting. Out at full stretch they hit twice as hard and make what they hit bleed. Twenty-eight days, give or take.' },
  { id: 'c_catchbin', a: 'achoo', b: 'wetwipe', name: 'Catch It, Bin It', desc: 'Every big sneeze is followed by a Wet Wipe all round you: every enemy bullet in reach is wiped away, and everything in reach takes a heavy wipe and gets soaked. Wet Wipe hits on a Snotty enemy hit 50% harder. As the posters say.' },
);
for (const c of COMBOS) COMBO_BY[c.id] = c;

const c4InLane = (x, y, uid) => { for (const z of G.zones) if (z.penLane === uid && z.life > 0 && Math.hypot(z.x - x, z.y - y) < z.r + 10) return true; return false; };
const c4Free = e => !e.boss && !e.rival && !e.egg && !e.dead;

// ---------------------------------------------------------------- after a weapon fires (comboFire)
function combo4Fire(w, target) {
  const p = me();
  if (w.id === 'carpet' && comboOn('c_bugzapper')) {
    const bw = comboW('bugs');
    if (!bw || !bw.pets || !w.s) return;
    G.cmbBugT = G.t + 2;
    const src = comboSrc(w, 'Bug Zapper'), sp = (w.s.speed || 300) * 0.9;
    for (const q of bw.pets.slice(0, 6)) {
      const off = Math.random() * TAU;
      for (let i = 0; i < 6; i++) { const a = off + i / 6 * TAU; spawnProj(w, q.x, q.y, a, src, { noMods: true, speed: sp, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.45, dmg: w.s.dmg * 0.6, pierce: 1, explode: 0, bounce: 0, homing: 0 }); }
      ring(q.x, q.y, 40, bw.def.color, 0.3, 3);
    }
    return;
  }
  if (w.id === 'cord' && comboOn('c_bloodbank')) {
    const lw = comboW('leeches');
    if (!lw || !lw.pets || !w.s) return;
    const src = comboSrc(w, 'Blood Bank', { knock: 0 }), have = new Set(w.cords || []);
    let n = 0;
    for (const q of lw.pets) {
      const t = q.on;
      if (!t || t.dead || have.has(t) || n >= 4 || Math.hypot(t.x - p.x, t.y - p.y) > w.s.range * 1.4) continue;
      have.add(t); n++;
      const got = damageEnemy(t, w.s.dmg, src) || 0;
      if (got > 0) healPlayer(Math.min(G.P.maxHp * 0.002, got * 0.03), true);
      (w.cords || (w.cords = [])).push(t);
    }
    if (n) w.cordUntil = G.t + 0.3;
    return;
  }
  if (w.id === 'period' && comboOn('c_lunarcycle')) {
    const uw = comboW('ulcer');
    if (!uw || !uw.s) return;
    G.cmbLunarT = G.t; // three waves, 0.35s apart (playpen.js)
    if (uw.reloadT > 0) uw.reloadT = 0.001; // the moons come out early
    return;
  }
  if (w.id === 'achoo' && comboOn('c_catchbin') && w.sneezeN % (hasSig(w, 'xblessyou') ? 2 : 4) === 0) {
    const ww = comboW('wetwipe');
    if (!ww || !ww.s) return;
    after(0.18, () => {
      if (!G || !ww.s) return;
      const q = me(), R = Math.max(150, (ww.s.reach || ww.s.range || 125) * 1.5), src = comboSrc(ww, 'Catch It, Bin It');
      let wiped = 0;
      for (const b of G.ebul) if (!b.dead && Math.hypot(b.x - q.x, b.y - q.y) < R) { b.dead = true; wiped++; spawnPart(b.x, b.y, ww.def.color, 1, 60, 0.3); }
      IN_AOE = true;
      forNear(q.x, q.y, R, e => { if (!e.dead && !e.charmed) damageEnemy(e, ww.s.dmg * 1.1, src); });
      IN_AOE = false;
      ring(q.x, q.y, R, ww.def.color, 0.5, 6); ring(q.x, q.y, R * 0.7, '#ffffff', 0.35, 3);
      fxParts('spark', q.x, q.y, ww.def.color, 14, R * 2.5, 0.5, 3);
      floatText(q.x, q.y - 34, wiped >= 3 ? 'BINNED' : 'WIPED', ww.def.color, 13, 0.6); sfx('shot');
    });
  }
}

// ---------------------------------------------------------------- every hit (comboHit)
function combo4Hit(e, dmg, src) {
  const id = src.w.id;
  if (id === 'swimmers' && comboOn('c_fertile')) {
    let q = null;
    for (const o of src.w.pets || []) if (o.fwT > G.t && Math.hypot(o.x - e.x, o.y - e.y) < e.r + 30) { q = o; break; }
    if (!q) return;
    damageEnemy(e, dmg, comboSrc(src.w, 'Fertile Window', { knock: 0 }));
    if (!e.elite) glue(e, 0.6);
    spawnPart(e.x, e.y, '#ffffff', 3, 80, 0.3, 2);
    return;
  }
  if (id === 'butterknife' && comboOn('c_openwide')) {
    const cw = comboW('codliver');
    if (!cw || !cw.s) return;
    if (e.gagT > G.t) damageEnemy(e, dmg * 1.5, comboSrc(src.w, 'Open Wide', { knock: 0 }));
    if (e.dead || !cmbEvery('openwide', 0.5) || G.proj.length >= CAPS.proj) return;
    let best = null, bd = 320;
    for (const o of G.enemies) { if (o === e || o.dead || o.charmed || o.gagT > G.t) continue; const d = Math.hypot(o.x - e.x, o.y - e.y); if (d < bd) { bd = d; best = o; } }
    if (!best) return;
    G.proj.push({ lob: true, sx: e.x, sy: e.y, tx: best.x, ty: best.y, x: e.x, y: e.y, t: 0, flight: 0.35, w: cw, src: comboSrc(cw, 'Open Wide'), color: cw.def.color, dead: false });
    floatText(e.x, e.y - e.r - 10, 'OPEN WIDE', cw.def.color, 12, 0.5);
    return;
  }
  if (id === 'bugs' && comboOn('c_bugzapper') && G.cmbBugT > G.t) {
    damageEnemy(e, dmg, comboSrc(src.w, 'Bug Zapper', { knock: 0 }));
    return;
  }
  if (id === 'nightlight' && comboOn('c_nightterrors') && e.booT > G.t) {
    damageEnemy(e, dmg * 0.5, comboSrc(src.w, 'Night Terrors', { knock: 0 }));
    return;
  }
  if (id === 'leeches' && comboOn('c_bloodbank')) {
    const cw = comboW('cord');
    if (!cw || !(cw.cordUntil > G.t) || !(cw.cords || []).includes(e)) return;
    damageEnemy(e, dmg, comboSrc(src.w, 'Blood Bank', { knock: 0 }));
    return;
  }
  if (id === 'ulcer' && comboOn('c_lunarcycle') && G.t - (G.cmbLunarT || -9) < 1.3) {
    damageEnemy(e, dmg, comboSrc(src.w, 'Lunar Cycle', { knock: 0 }));
    if (e.dead) return;
    e.bloodT = Math.max(e.bloodT || 0, 3); e.bloodN = Math.min(5, (e.bloodN || 0) + 1);
    e.bloodDps = Math.max(e.bloodDps || 0, dmg * 0.3); e.bloodBy = 'Lunar Cycle';
    return;
  }
  if (id === 'wetwipe' && comboOn('c_catchbin') && lathered(e)) {
    damageEnemy(e, dmg * 0.5, comboSrc(src.w, 'Catch It, Bin It', { knock: 0 }));
  }
}

// ---------------------------------------------------------------- per frame (comboTick)
function combo4Tick(dt) {
  const p = me();
  if (comboOn('c_fertile')) {
    const ew = comboW('eggwhite'), sw = comboW('swimmers');
    if (ew && sw && sw.pets) for (const q of sw.pets) {
      if (!c4InLane(q.x, q.y, ew.uid)) continue;
      q.fwT = G.t + 2;
      q.x += q.vx * dt * 0.6; q.y += q.vy * dt * 0.6; // 60% faster in the lane
      if (Math.random() < dt * 6) spawnPart(q.x, q.y, '#ffffff', 1, 30, 0.3, 1.5);
    }
  }
  if (comboOn('c_pickroll')) {
    const gw = comboW('goblins'), rw = comboW('roller');
    if (gw && rw && gw.s && rw.s) {
      const flick = cmbEvery('pr_flick', 0.5), shed = cmbEvery('pr_shed', 0.3), g = rw.s.growK || 1;
      let n = 0;
      for (const pr of G.proj) {
        if (pr.dead || pr.w !== rw || n >= 3) continue;
        n++;
        if (pr.r0 == null) { pr.r0 = pr.r; pr.dmg0 = pr.dmg; }
        if (flick) {
          const steps = Math.max(1, gw.s.count || 2);
          for (let i = 0; i < steps; i++) { pr.r = Math.min(pr.r0 * 3.5 * g, pr.r * (1 + 0.08 * g)); pr.dmg = Math.min(pr.dmg0 * 4 * g, pr.dmg * (1 + 0.07 * g)); }
          const o = dronePos(gw, 0, steps);
          bolt(o.x, o.y, pr.x, pr.y, gw.def.color, 0.12); spawnPart(pr.x, pr.y, gw.def.color, 3, 60, 0.3, 2);
        }
        if (shed && pr.r >= pr.r0 * 2 * g) {
          const t = acquire('nearest', 320, pr.x, pr.y);
          if (t) spawnProj(gw, pr.x, pr.y, Math.atan2(t.y - pr.y, t.x - pr.x), comboSrc(gw, 'Pick and Roll'), { dmg: gw.s.dmg * 1.5, noMods: true });
        }
      }
    }
  }
  if (comboOn('c_nightterrors')) {
    const bw = comboW('booerang'), nw = comboW('nightlight');
    if (bw && nw && nw.s && nw.lamps && nw.lamps.length) {
      for (const pr of G.proj) {
        if (pr.dead || pr.w !== bw) continue;
        for (const L of nw.lamps) {
          if (L.terrorT > G.t || Math.hypot(L.x - pr.x, L.y - pr.y) > 90) continue;
          L.terrorT = G.t + 2; L.life += 2;
          const src = comboSrc(nw, 'Night Terrors', { knock: 0 });
          IN_AOE = true;
          forNear(L.x, L.y, 150, e => { if (e.dead || e.charmed) return; stun(e, 0.6); damageEnemy(e, nw.s.dmg * 1.2, src); });
          IN_AOE = false;
          ring(L.x, L.y, 150, nw.def.color, 0.5, 5); addLight(L.x, L.y, 220, nw.def.color, 0.5);
          floatText(L.x, L.y - 24, 'BOO!', nw.def.color, 14, 0.6); sfx('zap');
        }
      }
    }
  }
  if (comboOn('c_lunarcycle')) {
    const uw = comboW('ulcer');
    if (uw && uw.s) {
      if (uw.lunS !== uw.s) { uw.lunS = uw.s; uw.lunR0 = uw.s.radius; }
      const f = (G.t - (G.cmbLunarT || -9)) / 1.3; // out and back over the three waves of cramps
      uw.s.radius = uw.lunR0 * (f >= 0 && f < 1 ? 1 + 1.8 * Math.sin(f * Math.PI) : 1);
    }
  }
}
