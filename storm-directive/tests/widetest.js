// The rest of the modifier matrix (modwide.js): each of the 12 does its basic job, and its Rank 2 card opens a branch fork.
// Range flattens falloff, Up Close boosts close hits, Charged slows and strengthens, Kinship rewards same-type weapons,
// Knockback shoves, Pulling draws enemies in, Turncoat raises allies, Melee strikes close, Ranged lands at range (four
// weapons only), Mines lay and go off, Death from Above strikes after a mark, Primer detonates on another weapon's hit.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2 });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = (wid, more) => {
      META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 400; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.enemies.length = 0; G.zones.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0; G.manual = { x: 0, y: 0 }; G.player.vx = G.player.vy = 0;
      const ids = [wid || 'v_phys_proj', ...(more || [])];
      G.weapons = ids.map(id => makeSlot(id, false, 9)); while (G.weapons.length < 3) G.weapons.push(null);
      for (const w of G.weapons) if (w) computeStats(w);
      return G.weapons[0];
    };
    const foe = (dx, dy, hp) => { const p = G.player, e = makeEnemy(ENEMIES.brute, p.x + dx, p.y + (dy || 0), {}); e.speed = 0; e.hp = e.maxHp = hp || 1e5; G.enemies.push(e); return e; };
    const add = (w, id, n) => { for (let i = 0; i < (n || 1); i++) if (!modAdd(w, id)) bad.push('modAdd refused ' + id + ' on ' + w24Key(w)); computeStats(w); };
    const run = t => { const px = G.player.x, py = G.player.y; for (let f = 0; f < t * 60; f++) { G.state = 'play'; G.lootQueue = []; G.player.x = px; G.player.y = py; update(1 / 60); } }; // (the player is pinned: autorun would kite out of range)
    const src = w => weaponSrc(w);
    // 0. Every one opens a branch fork at Rank 2
    for (const id of Object.keys(MW_NEW)) { const w = fresh(id === 'ranged' ? 'v_phys_burst' : id === 'melee' ? 'v_phys_proj' : 'v_phys_proj'); if (!modOk(w, id)) { w.def = Object.create(w.def, { v10atk: { value: MW_NEW[id].atk[0] } }); } if (!modOk(w, id)) { bad.push('no weapon fits ' + id); continue; } modAdd(w, id); modAdd(w, id); const q = G.lootQueue.find(x => x.ms && x.ms.id === id); if (!q || genLoot(q).length !== 2) bad.push('fork ' + id); }
    // 1. Range: a far hit keeps more damage
    let w = fresh(); const far = foe(500); const k0 = p11Range(far, src(w)); add(w, 'range', 3); const k1 = p11Range(far, src(w));
    out.range = [+k0.toFixed(2), +k1.toFixed(2)]; if (!(k1 > k0)) bad.push('range ' + out.range);
    // 2. Up Close: a close hit is stronger
    w = fresh(); add(w, 'upclose'); const near = foe(80); out.upclose = +p11Range(near, src(w)).toFixed(2); if (!(out.upclose > 1.3)) bad.push('up close ' + out.upclose);
    // 3. Charged: slower and stronger
    w = fresh(); const cd0 = w.s.cd, d0 = w.s.dmg; add(w, 'charged'); out.charged = [+(w.s.cd / cd0).toFixed(2), +(w.s.dmg / d0).toFixed(2)]; if (!(w.s.cd > cd0 && w.s.dmg > d0)) bad.push('charged ' + out.charged);
    // 4. Kinship: another weapon of the same type adds damage
    w = fresh('v_phys_proj', ['v_phys_spread']); add(w, 'kinship'); const ek = foe(120); out.kin = +mwDmgMul(ek, src(w)).toFixed(2); if (!(out.kin > 1)) bad.push('kinship ' + out.kin);
    // 5. Knockback: a hit shoves the enemy away
    w = fresh(); add(w, 'knock', 3); const en = foe(100); damageEnemy(en, 1, src(w)); out.knock = Math.round(en.kx); if (!(en.kx > 50)) bad.push('knockback ' + en.kx);
    // 6. Pulling: enemies near the hit are drawn to it
    w = fresh(); add(w, 'pull', 3); const ep = foe(150), e2 = foe(150, 100); const dd0 = Math.hypot(e2.x - ep.x, e2.y - ep.y); damageEnemy(ep, 1, src(w)); const dd1 = Math.hypot(e2.x - ep.x, e2.y - ep.y);
    out.pull = [Math.round(dd0), Math.round(dd1)]; if (!(dd1 < dd0)) bad.push('pulling ' + out.pull);
    // 7. Turncoat: a kill rises as an ally
    w = fresh(); add(w, 'turncoat'); const rnd = Math.random; Math.random = () => 0; const et = foe(120, 0, 30); damageEnemy(et, 1e4, src(w)); Math.random = rnd; run(0.1);
    out.turncoat = G.enemies.filter(e => e.charmed && !e.dead).length; if (!out.turncoat) bad.push('turncoat');
    { let n = 0; for (let i = 0; i < 400; i++) { const k = foe(140, 40, 30); const a = G.enemies.length; damageEnemy(k, 1e4, src(w)); if (G.enemies.length > a) n++; } out.turnRate = n / 400; if (out.turnRate > 0.12 || out.turnRate < 0.01) bad.push('turncoat chance ' + out.turnRate); } // (Rank 1: 1 in 20)
    // 8. Melee: the weapon strikes close, not far
    w = fresh(); add(w, 'melee'); const m1 = foe(70), m2 = foe(240, 0); run(1.5);
    out.melee = [Math.round(m1.maxHp - m1.hp), Math.round(m2.maxHp - m2.hp), w.s.range]; if (!(out.melee[0] > 0) || out.melee[1] > 0) bad.push('melee ' + out.melee);
    // 9. Ranged: only four weapons; Panic Button lands its blast on a far target
    w = fresh(); if (modOk(w, 'ranged')) bad.push('ranged offered on Standard Issue');
    w = fresh('v_phys_burst'); add(w, 'ranged'); const rg = foe(200); run(2); out.ranged = Math.round(rg.maxHp - rg.hp); if (!(out.ranged > 0)) bad.push('ranged ' + out.ranged);
    // 10. Mines: laid, then set off by an enemy
    w = fresh(); add(w, 'mines'); const mk = foe(150); run(3); out.minesDbg = [w.s.cd, w.cd, G.weapons.filter(Boolean).length, mk.hp < mk.maxHp]; out.mines = mwS().mines.length; mk.x = G.player.x; mk.y = G.player.y; run(0.6);
    out.minesHit = Math.round(mk.maxHp - mk.hp); if (!out.mines || !(out.minesHit > 0)) bad.push('mines ' + out.mines + ' ' + out.minesHit);
    // 11. Death from Above: a strike lands on the target after its mark
    w = fresh(); add(w, 'dfa'); const df = foe(200); run(3); out.dfa = Math.round(df.maxHp - df.hp); if (!(out.dfa > 0)) bad.push('death from above');
    // 12. Primer: another weapon's hit detonates the mark
    w = fresh('v_phys_proj', ['v_phys_spread']); add(w, 'primer'); const a = foe(150), bb = foe(170, 10); G.state = 'play'; update(1 / 60); damageEnemy(a, 1, src(w)); const hb = bb.hp; damageEnemy(a, 1, src(G.weapons[1]));
    out.primer = [!!a.mwPr, Math.round(hb - bb.hp)]; if (!(bb.hp < hb)) bad.push('primer ' + out.primer);
    // 13. Exploding Rounds: a hit bursts on its neighbours
    w = fresh(); add(w, 'explode'); const x1 = foe(150), x2 = foe(170, 15); G.state = 'play'; update(1 / 60); const hx = x2.hp; damageEnemy(x1, 50, src(w));
    out.explode = Math.round(hx - x2.hp); if (!(x2.hp < hx)) bad.push('exploding rounds');
    // 14. No slot limits: a level-up lists every modifier and passive you could take
    w = fresh('v_phys_proj', ['v_phys_burst']); SET.noLimits = true; const all = genLoot({ kind: 'level' }); SET.noLimits = false;
    out.all = [all.length, all.filter(c => c.tag === 'MODIFIER').length]; if (!(all.length >= 25)) bad.push('all cards ' + out.all);
    return { bad, out };
  });
  await page.screenshot({ path: 'wide.png' });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors));
  await b.close();
})();
