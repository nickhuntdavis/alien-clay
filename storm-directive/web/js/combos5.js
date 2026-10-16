'use strict';
// Spawn Prawn - Weapon Combos for the Armoury and the Playpen (batch 3: eight more). Five pair weapons from one
// starting sequence; three need a splice (Hand, Foot and Mouth, Hot Wax, Hog Wild). Same schema as combos.js.
//   c_bathtoys     Baby Rattle + Water Pistol          a shake loads 5 double squirts; every SPLOSH shakes the rattle
//   c_hfm          Soft Play + Grubby Fingers          pits dose Cooties; Grubby pokes on the Sick hit your nearest pit
//   c_hotwax       Lava Lamp + Cradle Cap              flakes that fly through a lava blob melt: 60% harder, Acid, a wax splash
//   c_donotsqueeze Blood Blister + Lemon Squeezy       lemon hits in a blister puddle pop it at once for double
//   c_paperhanky   Paper Cut + Runny Nose              cuts on the Snotty hit double and bleed; cutting drips more trail
//   c_gala         Whooping Cough + Sea Monkeys        a coughing fit sends the monkeys splashing; splashes spread Cooties
//   c_hogwild      Greased Piglet + Head Lice          piglets carry lice: each bounce bites 2 more; lice hit Lubricated harder
//   c_parcel       Lard Lobber + Baby Shower           four gifts land round every lard splash and shove the crowd in
// Hooks: combos.js comboFire (combo5Fire), comboHit (combo5Hit), comboTick (combo5Tick).

COMBOS.push(
  { id: 'c_bathtoys', a: 'rattle', b: 'pistol', name: 'Bath Toys', desc: 'Every Rattle shake loads the Water Pistol: its next 5 squirts fire twice. Every SPLOSH shakes the Rattle as well, in a ring of beads. Squeaks when squeezed. Leaks when squeezed.' },
  { id: 'c_hfm', a: 'softplay', b: 'grubby', name: 'Hand, Foot and Mouth', desc: 'Everything in a Soft Play pit catches a dose of Cooties every second. Grubby Fingers pokes on a Sick enemy also hit everything in your nearest pit for 40% (every 0.4s): they all touched the same balls. It is always the ball pit.' },
  { id: 'c_hotwax', a: 'lavalamp', b: 'cradlecap', name: 'Hot Wax', desc: 'Cradle Cap flakes that fly through a Lava Lamp blob melt: they hit 60% harder, do Acid damage and burst in a splash of hot wax. Seventies décor meets infant scalp condition. The smell is indescribable.' },
  { id: 'c_donotsqueeze', a: 'blister', b: 'lemon', name: 'Do Not Squeeze', desc: 'Lemon Squeezy hits on an enemy standing in a Blood Blister puddle pop the blister at once: its last burst goes off at double damage and everything in it bleeds. The leaflet says do not squeeze. Nobody reads the leaflet.' },
  { id: 'c_paperhanky', a: 'papercut', b: 'runny', name: 'Paper Hanky', desc: 'Paper Cut hits on a Snotty enemy cut twice as deep and make it bleed. While you cut, your nose drips a fresh patch of trail under the victim (every 0.6s). Two-ply. Neither ply is helping.' },
  { id: 'c_gala', a: 'whoop', b: 'seamonkeys', name: 'Swimming Gala', desc: 'Every coughing fit sends each Sea Monkey splashing into the nearest enemy at once. Sea Monkey splashes on a Sick enemy give everything in the splash 2 doses of Cooties. No running, no bombing, no coughing in the deep end.' },
  { id: 'c_hogwild', a: 'piglet', b: 'lice', name: 'Hog Wild', desc: 'Every Greased Piglet carries Head Lice: whatever it bounces into gets 2 free louse bites on it and a neighbour. Lice bites on a Lubricated enemy hit 60% harder. Free-range. Very free. Very ranging.' },
  { id: 'c_parcel', a: 'lard', b: 'shower', name: 'Pass the Parcel', desc: 'Every Lard Lobber splash is followed by 4 Baby Shower gifts (at 2.5x damage) landing round its edge, and each one shoves the crowd back into the middle. The music stops. The parcel does not.' },
);
for (const c of COMBOS) COMBO_BY[c.id] = c;

// ---------------------------------------------------------------- after a weapon fires (comboFire)
function combo5Fire(w, target) {
  const p = me();
  if (w.id === 'rattle' && comboOn('c_bathtoys')) { const pw = comboW('pistol'); if (pw) pw.c5Load = 5; return; }
  if (w.id === 'pistol' && comboOn('c_bathtoys')) {
    const rw = comboW('rattle');
    if (!rw || !rw.s || !w.s) return;
    const a = Math.atan2(target.y - p.y, target.x - p.x);
    if (w.c5Load > 0) { w.c5Load--; spawnProj(w, p.x, p.y, a + rand(-0.08, 0.08), comboSrc(w, 'Bath Toys'), { noMods: true }); }
    if (w.squirtN % (hasSig(w, 'psplosh') ? 10 : 20) === 0) {
      const sp = rw.s.speed || 260, n = rw.s.count || 12, src = comboSrc(rw, 'Bath Toys'), off = Math.random() * TAU;
      for (let i = 0; i < n; i++) { const b = off + i / n * TAU; spawnProj(rw, p.x, p.y, b, src, { noMods: true, speed: sp, vx: Math.cos(b) * sp, vy: Math.sin(b) * sp, life: rw.s.range / sp, dmg: rw.s.dmg }); }
      ring(p.x, p.y, 60, rw.def.color, 0.35, 4);
    }
    return;
  }
  if (w.id === 'whoop' && comboOn('c_gala') && cmbEvery('gala', 1)) {
    const mw = comboW('seamonkeys');
    if (!mw || !mw.s || !mw.pets) return;
    const src = comboSrc(mw, 'Swimming Gala', { knock: 0 }), r = (mw.s.area || 40) * 1.4;
    for (const q of mw.pets) {
      const t = acquire('nearest', 260, q.x, q.y);
      if (!t) continue;
      q.x = t.x + rand(-6, 6); q.y = t.y + rand(-6, 6); q.cd = Math.max(q.cd, 0.3); // dive straight in
      IN_AOE = true;
      forNear(t.x, t.y, r, e => { if (!e.dead && !e.charmed) damageEnemy(e, mw.s.dmg * 1.5, src); });
      IN_AOE = false;
      ring(t.x, t.y, r, mw.def.color, 0.35, 3); fxParts('spark', t.x, t.y, mw.def.color, 6, 120, 0.4, 2.5);
    }
    sfx('hit');
    return;
  }
  if (w.id === 'lard' && comboOn('c_parcel')) {
    const sw = comboW('shower');
    if (!sw || !sw.s || !w.s) return;
    const tx = target.x, ty = target.y, R = (w.s.area || 66) * 1.3, src = comboSrc(sw, 'Pass the Parcel', { mult: 2.5 });
    after(w.s.flight || 0.6, () => {
      if (!G || !sw.s) return;
      const off = Math.random() * TAU;
      for (let i = 0; i < 4; i++) {
        if (G.proj.length >= CAPS.proj) break;
        const a = off + i / 4 * TAU, gx = tx + Math.cos(a) * R, gy = ty + Math.sin(a) * R;
        G.proj.push({ lob: true, sx: tx, sy: ty, tx: gx, ty: gy, x: tx, y: ty, t: 0, flight: 0.45 + i * 0.05, w: sw, src, color: sw.def.color, dead: false });
        after(0.45 + i * 0.05, () => { if (G) forNear(gx, gy, R * 0.9, e => { if (c5Free(e)) shove(e, tx, ty, -200); }); });
      }
    });
  }
}
const c5Free = e => !e.boss && !e.rival && !e.egg && !e.dead;

// ---------------------------------------------------------------- every hit (comboHit)
function combo5Hit(e, dmg, src) {
  const id = src.w.id;
  if (id === 'grubby' && comboOn('c_hfm') && sick(e) && cmbEvery('hfm', 0.4)) {
    const sw = comboW('softplay');
    if (!sw) return;
    let pit = null, bd = 420;
    for (const z of G.zones) { if (!z.penSoft || z.life <= 0) continue; const d = Math.hypot(z.x - e.x, z.y - e.y); if (d < bd) { bd = d; pit = z; } }
    if (!pit) return;
    const ks = comboSrc(src.w, 'Hand, Foot and Mouth', { knock: 0 });
    let n = 0;
    IN_AOE = true;
    forNear(pit.x, pit.y, pit.r, o => { if (o.dead || o.charmed || n >= 12) return; n++; damageEnemy(o, dmg * 0.4, ks); });
    IN_AOE = false;
    if (n) { bolt(e.x, e.y, pit.x, pit.y, src.w.def.color, 0.12); ring(pit.x, pit.y, pit.r, src.w.def.color, 0.3, 3); }
    return;
  }
  if (id === 'lemon' && comboOn('c_donotsqueeze')) {
    const bw = comboW('blister');
    if (!bw || !bw.s) return;
    for (const z of G.zones) {
      if (!z.onEnd || z.life <= 0 || !z.src || z.src.w !== bw || Math.hypot(z.x - e.x, z.y - e.y) > z.r + e.r) continue;
      z.onEnd = null; z.life = 0;
      const ks = comboSrc(bw, 'Do Not Squeeze');
      IN_AOE = true;
      forNear(z.x, z.y, z.r * 1.2, o => {
        if (o.dead || o.charmed) return;
        damageEnemy(o, bw.s.dmg * 2, ks);
        if (!o.dead) { o.bloodT = Math.max(o.bloodT || 0, 4); o.bloodN = Math.min(5, (o.bloodN || 0) + 1); o.bloodDps = Math.max(o.bloodDps || 0, bw.s.dmg * 0.4); o.bloodBy = 'Do Not Squeeze'; }
      });
      IN_AOE = false;
      ring(z.x, z.y, z.r * 1.2, bw.def.color, 0.45, 5); fxParts('spark', z.x, z.y, bw.def.color, 12, 180, 0.5, 3);
      floatText(z.x, z.y - z.r * 0.5, 'POP', bw.def.color, 14, 0.6); sfx('boom');
      break;
    }
    return;
  }
  if (id === 'papercut' && comboOn('c_paperhanky')) {
    const rw = comboW('runny');
    if (!rw || !rw.s) return;
    if (lathered(e)) {
      damageEnemy(e, dmg, comboSrc(src.w, 'Paper Hanky', { knock: 0 }));
      if (!e.dead) { e.bloodT = Math.max(e.bloodT || 0, 3); e.bloodN = Math.min(5, (e.bloodN || 0) + 1); e.bloodDps = Math.max(e.bloodDps || 0, dmg * 0.3); e.bloodBy = 'Paper Hanky'; }
    }
    if (!e.dead && cmbEvery('hanky_drip', 0.6) && G.zones.length < 240)
      G.zones.push({ x: e.x, y: e.y, r: (rw.s.area || 24) * 1.6, life: rw.s.dur || 2.6, max: rw.s.dur || 2.6, dps: rw.s.dmg, elem: 'ice', pull: 0, color: rw.def.color, tick: 0, src: comboSrc(rw, 'Paper Hanky') });
    return;
  }
  if (id === 'seamonkeys' && comboOn('c_gala') && sick(e)) {
    const ks = comboSrc(src.w, 'Swimming Gala', { knock: 0 });
    forNear(e.x, e.y, (src.w.s.area || 40) * 1.2, o => { if (!o.dead) c3Dose(o, src.w.s.dmg * 0.3, 2, ks); });
    return;
  }
  if (id === 'piglet' && comboOn('c_hogwild')) {
    const lw = comboW('lice');
    if (!lw || !lw.s || e.dead) return;
    const ks = comboSrc(lw, 'Hog Wild', { knock: 0 });
    damageEnemy(e, lw.s.dmg * 1.5, ks);
    const n = acquire('nearest', 120, e.x, e.y, e);
    if (n) { damageEnemy(n, lw.s.dmg * 1.5, ks); bolt(e.x, e.y, n.x, n.y, lw.def.color, 0.1); }
    spawnPart(e.x, e.y, lw.def.color, 3, 70, 0.3, 2);
    return;
  }
  if (id === 'lice' && comboOn('c_hogwild') && e.fizz > 0) {
    damageEnemy(e, dmg * 0.6, comboSrc(src.w, 'Hog Wild', { knock: 0 }));
  }
}

// ---------------------------------------------------------------- per frame (comboTick)
function combo5Tick(dt) {
  if (comboOn('c_hfm') && cmbEvery('hfm_dose', 1)) {
    const gw = comboW('grubby'), sw = comboW('softplay');
    if (gw && gw.s && sw) {
      const ks = comboSrc(gw, 'Hand, Foot and Mouth', { knock: 0 });
      for (const z of G.zones) if (z.penSoft && z.life > 0) forNear(z.x, z.y, z.r, e => { if (!e.dead && !e.charmed) c3Dose(e, gw.s.dmg * 0.4, 1, ks); });
    }
  }
  if (comboOn('c_hotwax')) {
    const lw = comboW('lavalamp'), cw = comboW('cradlecap');
    if (lw && cw && lw.blades && lw.blades.length && lw.s) {
      const B = lw.blades, R = (lw.s.size || 11) + 6;
      let ks = null;
      for (const pr of G.proj) {
        if (pr.dead || pr.w !== cw || pr.c5Wax) continue;
        for (let i = 0; i < B.length; i += 3) {
          if (Math.abs(B[i] - pr.x) > R || Math.abs(B[i + 1] - pr.y) > R) continue;
          ks = ks || comboSrc(cw, 'Hot Wax', { elem: 'fire' });
          pr.c5Wax = 1; pr.dmg *= 1.6; pr.src = ks; pr.color = '#ff9e3d'; pr.r *= 1.3; pr.explode = Math.max(pr.explode || 0, 34);
          spawnPart(pr.x, pr.y, '#ff9e3d', 2, 60, 0.3, 2);
          break;
        }
      }
    }
  }
}
