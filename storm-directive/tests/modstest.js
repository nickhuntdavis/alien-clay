// v10 modifiers (modifiers.js): every one of the 20 runs 300 frames against a ring of stationary enemies with no
// errors, and shows its visible signature (pierce hits 2+, homing curves, ricochet bounces, orbit circles, gravity
// pulls, caps hold...). Modifiers are added with modAdd(G.weapons[0], id).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    const fresh = () => {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.P.maxHp = G.player.hp = 1e6; G.player.iframes = 0;
      G.terrain = null; G.manual = { x: 0, y: 0 }; G.player.vx = G.player.vy = 0; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null;
    };
    const wp = (id, mods, i, quiet) => { const w = makeSlot(id, false, 1); G.weapons[i || 0] = w; recomputeAll(); for (const m of mods || []) if (!modAdd(w, m)) bad.push('modAdd refused ' + m + ' on ' + id); w.cd = quiet ? 1e9 : 0; return w; };
    const foe = (dx, dy, hp) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + (dy || 0)); e.hp = e.maxHp = hp || 1e6; e.speed = 0; e.t10 = 1; G.enemies.push(e); gridBuild(); return e; };
    const step = n => { for (let i = 0; i < n; i++) { for (let k = G.enemies.length - 1; k >= 0; k--) if (!G.enemies[k].t10) G.enemies.splice(k, 1); G.ebul.length = 0; G.lootQueue.length = 0; G.state = 'play'; G.player.hp = G.P.maxHp; update(1 / 60); } };
    const hurt = e => e.hp < e.maxHp;
    const shot = (w, a) => spawnProj(w, G.player.x, G.player.y, a || 0, weaponSrc(w));
    const ang = pr => Math.atan2(pr.vy, pr.vx);
    const ids = Object.keys(MODS10);
    if (ids.length !== 20) bad.push('MODS10 has ' + ids.length + ' modifiers, not 20');

    // 1. Every modifier: 300 frames against a ring of stationary enemies, no errors.
    for (const id of ids) {
      fresh();
      const atk = MODS10[id].atk[0], w = wp('v_phys_' + atk, [id]);
      for (let i = 0; i < 8; i++) foe(Math.cos(i / 8 * TAU) * 150, Math.sin(i / 8 * TAU) * 150);
      try { step(300); } catch (e) { bad.push(id + ' threw: ' + e.message); }
      if (!w.m10 || !w.m10.includes(id)) bad.push(id + ' not on the weapon');
    }
    out.ring = 'ok';

    // 2. Homing: a shot fired straight ahead turns towards an enemy off its line; the target dying lets it fly on.
    fresh(); let w = wp('v_phys_proj', ['homing'], 0, 1); foe(150, 150); let pr = shot(w, 0);
    step(15); out.homing = +ang(pr).toFixed(2);
    if (!(ang(pr) > 0.25)) bad.push('Homing did not curve: ' + out.homing);
    G.enemies[0].dead = true; pr.tgt = G.enemies[0]; step(2); const a1 = ang(pr); step(10);
    if (Math.abs(ang(pr) - a1) > 0.01) bad.push('Homing kept turning after the target died');
    fresh(); w = wp('v_phys_proj', [], 0, 1); foe(150, 150); pr = shot(w, 0); step(15);
    if (Math.abs(ang(pr)) > 0.01) bad.push('control shot curved');

    // 3. Piercing: one shot hits 2+ enemies in a line, each pass costs 15%.
    fresh(); w = wp('v_phys_proj', ['piercing'], 0, 1); const l = [foe(70), foe(120), foe(170)]; pr = shot(w, 0); const d0 = pr.dmg; step(40);
    out.pierce = l.map(hurt); if (l.filter(hurt).length < 2) bad.push('Piercing hit ' + l.filter(hurt).length);
    if (!(pr.dmg < d0 * 0.9)) bad.push('Piercing cost nothing: ' + pr.dmg + ' of ' + d0);
    fresh(); w = wp('v_phys_proj', [], 0, 1); const l0 = [foe(70), foe(120)]; shot(w, 0); step(40);
    if (l0.filter(hurt).length !== 1) bad.push('control shot pierced');

    // 4. Chaining: the hit jumps to an enemy off the line, at most three jumps, each target once.
    fresh(); w = wp('v_phys_proj', ['chaining'], 0, 1); const ca = foe(100), cb = foe(100, 80), cc = foe(100, 160), cd2 = foe(100, 240), ce = foe(100, 320); shot(w, 0); step(20);
    out.chain = [cb, cc, cd2, ce].map(hurt);
    if (!hurt(cb) || !hurt(cc) || !hurt(cd2)) bad.push('Chaining missed a jump: ' + out.chain);
    if (hurt(ce)) bad.push('Chaining made a fourth jump');
    if (!(ca.maxHp - ca.hp > cb.maxHp - cb.hp)) bad.push('Chain jump not weaker than the hit');

    // 5. Ricochet: bounces off a wall, twice at most, 20% weaker each time.
    fresh(); w = wp('v_phys_proj', ['ricochet'], 0, 1); const p5 = G.player; G.m10walls = [{ x: p5.x + 150, y: p5.y - 600, w: 40, h: 1200 }, { x: p5.x - 190, y: p5.y - 600, w: 40, h: 1200 }];
    pr = shot(w, 0); pr.life = pr.max = 5; const d5 = pr.dmg; step(30); out.ricochet = [pr.mBounced, Math.round(pr.vx)];
    if (!(pr.mBounced >= 1) || !(pr.vx < 0)) bad.push('Ricochet did not bounce: ' + out.ricochet);
    step(60); if (pr.mBounced > 2) bad.push('Ricochet bounced ' + pr.mBounced);
    if (!(pr.dmg < d5 * 0.85)) bad.push('Ricochet lost no damage');
    G.m10walls = null;

    // 6. Returning: flies out, turns back, and comes home.
    fresh(); w = wp('v_phys_proj', ['returning'], 0, 1); pr = shot(w, 0); let mx = 0, back = false;
    for (let i = 0; i < 120; i++) { step(1); mx = Math.max(mx, pr.x - G.player.x); if (pr.back) back = true; }
    out.returning = [Math.round(mx), back, pr.dead];
    if (mx < 150 || !back || !pr.dead) bad.push('Returning: ' + out.returning);
    fresh(); w = wp('v_phys_proj', ['returning'], 0, 1); const rt = [foe(60), foe(100)]; pr = shot(w, 0); step(10); // one non-piercing pass: 3 hits and back
    if (rt.filter(hurt).length < 2) bad.push('Returning did not hit on the way out');

    // 7. Orbiting: three bodies at radius 72 circle you and hurt what they touch.
    fresh(); w = wp('v_phys_contact', ['orbiting']); const ob = foe(72, 0); step(2); const a0 = Math.atan2(w.m10orb[0].y - G.player.y, w.m10orb[0].x - G.player.x);
    step(30); const o1 = w.m10orb[0], a2 = Math.atan2(o1.y - G.player.y, o1.x - G.player.x), rr = Math.hypot(o1.x - G.player.x, o1.y - G.player.y);
    out.orbit = [w.m10orb.length, Math.round(rr), +Math.abs(angDiff(a2, a0)).toFixed(2)];
    if (w.m10orb.length !== 3 || Math.abs(rr - 72) > 1 || !(Math.abs(angDiff(a2, a0)) > 0.5)) bad.push('Orbit: ' + out.orbit);
    step(120); if (!hurt(ob)) bad.push('Orbiters hurt nothing');

    // 8. Delayed detonation: the blast is placed and marked, then goes off.
    fresh(); w = wp('v_phys_burst', ['delayed']); const de = foe(150); step(12);
    out.delayed = [modS().mines.length, hurt(de)];
    if (modS().mines.length < 1 || hurt(de)) bad.push('Delayed: no placed blast or it went off at once: ' + out.delayed);
    step(60); if (!hurt(de)) bad.push('Delayed blast never went off');

    // 9. Lobbed: Burst arcs and lands on the marked spot; Pool lobs for 0.6 s.
    fresh(); w = wp('v_phys_burst', ['lobbed']); const lo = foe(150); step(10);
    out.lobbed = [modS().lobs.length, hurt(lo)]; if (modS().lobs.length < 1 || hurt(lo)) bad.push('Lobbed burst: ' + out.lobbed);
    step(50); if (!hurt(lo)) bad.push('Lobbed burst never landed');
    fresh(); w = wp('v_phys_pool', ['lobbed']); foe(150); step(5);
    if (!G.proj.some(q => q.lob && Math.abs(q.flight - 0.6) < 1e-6)) bad.push('Lobbed pool did not lob');

    // 10. Trail: a piece every 30 units swum, nothing while still.
    fresh(); w = wp('v_phys_pool', ['trail']); step(2);
    for (let i = 0; i < 6; i++) { G.player.x += 40; step(1); }
    const n10 = G.zones.filter(z => z.m10trail).length; step(30); const n10b = G.zones.filter(z => z.m10trail).length;
    out.trail = [n10, n10b]; if (n10 < 5 || n10b !== n10) bad.push('Trail: ' + out.trail);
    for (let i = 0; i < 60; i++) { G.player.x += 35; step(1); }
    if (G.zones.filter(z => z.m10trail && z.life > 0.01).length > 40) bad.push('Trail passed the 40 cap');

    // 11. Self-centred: goes off round you, at no target.
    fresh(); w = wp('v_phys_burst', ['selfcentred']); const sc = foe(40); step(60);
    out.self = [hurt(sc), modS().mines.length]; if (!hurt(sc)) bad.push('Self-centred burst missed a neighbour');
    fresh(); w = wp('v_phys_spread', ['selfcentred']); const behind = foe(-120), ahead = foe(120); step(20);
    if (!hurt(behind) || !hurt(ahead)) bad.push('Self-centred spread did not go all round');

    // 12. Sweep: contact arc hits enemies a lash would miss; a beam sweeps its angle.
    fresh(); w = wp('v_phys_contact', ['sweep']); const sw = [foe(80 * Math.cos(-0.45), 80 * Math.sin(-0.45)), foe(80), foe(80 * Math.cos(0.45), 80 * Math.sin(0.45))]; step(5);
    out.sweep = sw.map(hurt); if (sw.filter(hurt).length < 3) bad.push('Sweep hit ' + sw.filter(hurt).length + ' of 3');
    fresh(); w = wp('v_fire_beam', ['sweep']); foe(200); const angs = [];
    for (let i = 0; i < 40; i++) { step(1); const f = (G.v10fx || []).find(q => q.k === 'beam'); if (f) angs.push(Math.atan2(f.y2 - f.y, f.x2 - f.x)); }
    out.sweepBeam = +(Math.max(...angs) - Math.min(...angs)).toFixed(2); if (!(out.sweepBeam > 0.2)) bad.push('Beam did not sweep: ' + out.sweepBeam);

    // 13. Anchored beam: joins you to the far side of the crowd.
    fresh(); w = wp('v_fire_beam', ['anchored']); foe(100, 50); const far = foe(250, 0); step(3);
    const bf = (G.v10fx || []).find(q => q.k === 'beam');
    out.anchored = bf && [Math.round(Math.hypot(bf.x2 - far.x, bf.y2 - far.y))];
    if (!bf || Math.hypot(bf.x2 - far.x, bf.y2 - far.y) > 15 || !hurt(far)) bad.push('Anchored beam missed the far end: ' + out.anchored);

    // 14. Rapid volley: three shots from one attack.
    const count = mods => { fresh(); const w = wp('v_phys_proj', mods); foe(200); let n = 0; const orig = window.spawnProj; window.spawnProj = function (ww) { if (ww === w) n++; return orig.apply(this, arguments); }; step(20); window.spawnProj = orig; return n; };
    out.volley = [count(['volley']), count([])]; if (out.volley[0] !== 3 || out.volley[1] !== 1) bad.push('Volley shots: ' + out.volley);

    // 15. Every Nth: the 4th attack hits 2.5 times harder.
    fresh(); w = wp('v_phys_proj', ['nth'], 0, 1); const nt = foe(200), mults = [];
    for (let i = 0; i < 4; i++) { fireWeapon(w, nt); mults.push(+G.proj[G.proj.length - 1].src.mult.toFixed(2)); }
    out.nth = mults; if (!(mults[3] > mults[0] * 2.4) || mults[1] !== mults[0] || mults[2] !== mults[0]) bad.push('Nth: ' + mults);

    // 16. Growing: bigger and stronger in flight, never past double.
    fresh(); w = wp('v_phys_proj', ['growing'], 0, 1); pr = shot(w, 0); pr.life = pr.max = 3; const r0 = pr.r, dm0 = pr.dmg; step(30); const r1 = pr.r; step(150);
    out.growing = [r0, +r1.toFixed(1), +pr.r.toFixed(1)]; if (!(r1 > r0 * 1.05) || pr.r > r0 * 2.001 || pr.dmg > dm0 * 2.001) bad.push('Growing: ' + out.growing);
    fresh(); w = wp('v_fire_pool', ['growing']); foe(150); step(40); const gz = G.zones.find(z => z.m10g);
    if (!gz) bad.push('Growing pool: no zone'); else { const z0 = gz.r; step(60); if (!(gz.r > z0) || gz.r > gz.r0 * 2.001) bad.push('Growing pool radius ' + z0 + ' -> ' + gz.r); }

    // 17. Scaling: damage follows one stat, capped at x2.
    fresh(); w = wp('v_phys_proj', ['scaling'], 0, 1); G.P.speed = 1.5; const k1 = modScaleK(w); G.P.speed = 9; const k2 = modScaleK(w); G.P.speed = 1;
    out.scaling = [k1, k2]; if (Math.abs(k1 - 1.5) > 1e-6 || k2 !== 2) bad.push('Scaling: ' + out.scaling);

    // 18. Multiplying: a killing shot splits in two at half damage, once; twelve in flight at most.
    fresh(); w = wp('v_phys_proj', ['multiplying'], 0, 1); const mk = foe(100, 0, 1); foe(100, 90); foe(100, -90); pr = shot(w, 0); const md = pr.dmg; const sp = []; const o18 = window.spawnProj; window.spawnProj = function (ww, x, y, a, src, over) { const r = o18.apply(this, arguments); if (over && over.mSplit && r) sp.push(r); return r; }; step(10); window.spawnProj = o18; out.multiplying = sp.length;
    if (sp.length !== 2 || Math.abs(sp[0].dmg - md * 0.5) > 0.01) bad.push('Multiplying: ' + sp.length);
    if (sp.some(q => q.mS)) bad.push('Split shots can split again');
    fresh(); w = wp('v_phys_proj', ['multiplying'], 0, 1); foe(100, 0, 1); foe(100, 90);
    for (let i = 0; i < 11; i++) G.proj.push({ x: G.player.x - 4000, y: G.player.y, vx: 0, vy: 0, speed: 1, r: 3, dmg: 1, pierce: 0, life: 9, max: 9, w, src: weaponSrc(w), color: '#fff', style: 'bullet', dead: false, hits: null, homing: 0, bounce: 0, boomerang: 0, chainHit: 0, aura: 0, pull: 0, tick: 0, tgt: null, back: false, explode: 0 });
    shot(w, 0); step(10); if (G.proj.filter(q => q.w === w && !q.dead).length > 12) bad.push('Multiplying passed 12 in flight');

    // 19. Summoned: pets, four per weapon and eight in all.
    fresh(); w = wp('v_phys_contact', ['summoned']); const pe = foe(150); step(240);
    out.summoned = [modS().pets.length]; if (modS().pets.length !== 2) bad.push('Pets for one copy: ' + modS().pets.length);
    if (!hurt(pe)) bad.push('Pets hurt nothing');
    fresh(); const ws = [wp('v_phys_contact', ['summoned', 'summoned'], 0), wp('v_fire_contact', ['summoned', 'summoned'], 1), wp('v_shock_contact', ['summoned', 'summoned'], 2)];
    step(60); const per = ws.map(q => modS().pets.filter(p => p.w === q).length); out.pets = per;
    if (modS().pets.length !== 8 || Math.max(...per) > 4) bad.push('Pet caps: ' + per);
    if (modAdd(ws[0], 'summoned')) bad.push('a third Summoned copy was allowed');

    // 20. Gravity well: drags bodies in, bends shots, three at once at most.
    fresh(); w = wp('v_phys_burst', ['gravity']); const g1 = foe(150); const g2 = foe(150, 85); step(30);
    const gw = modS().wells[0]; if (!gw) bad.push('Gravity: no well after the blast'); else {
      const dd = () => Math.hypot(g2.x - gw.x, g2.y - gw.y), before = dd(); step(30); out.gravity = [Math.round(before), Math.round(dd())];
      if (!(dd() < before - 5)) bad.push('Gravity did not pull: ' + out.gravity);
    }
    fresh(); w = wp('v_phys_proj', [], 0, 1); modWell(G.player.x + 200, G.player.y + 100, 110, 600, 3, w, false, true); pr = shot(w, 0); step(40);
    out.bend = +ang(pr).toFixed(2); if (!(ang(pr) > 0.1) || ang(pr) > 0.79) bad.push('Well bend: ' + out.bend);
    fresh(); w = wp('v_phys_proj', [], 0, 1); for (let i = 0; i < 5; i++) modWell(i * 50, 0, 100, 600, 3, w, true, true); if (modS().wells.length !== 3) bad.push('Wells: ' + modS().wells.length);

    // 21. Lunge: forwards through a Contact target, backwards from Spread; 160 a copy, two copies at most.
    fresh(); w = wp('v_phys_contact', ['lunge']); foe(105); const x0 = G.player.x; step(30);
    out.lungeC = Math.round(G.player.x - x0); if (!(G.player.x - x0 > 60) || G.player.x - x0 > 165) bad.push('Contact lunge: ' + out.lungeC);
    fresh(); w = wp('v_phys_spread', ['lunge']); foe(150); const x1 = G.player.x; step(30);
    out.lungeS = Math.round(G.player.x - x1); if (!(x1 - G.player.x > 60) || x1 - G.player.x > 165) bad.push('Spread recoil: ' + out.lungeS);
    fresh(); w = wp('v_phys_spread', ['lunge', 'lunge']); foe(150); const x2 = G.player.x; step(30);
    if (!(x2 - G.player.x > 165) || x2 - G.player.x > 325) bad.push('Double lunge: ' + (x2 - G.player.x));
    if (modAdd(w, 'lunge')) bad.push('a third Lunge copy was allowed');

    // 22. Caps and rules.
    fresh(); w = wp('v_phys_proj', ['homing']);
    if (modAdd(w, 'homing')) bad.push('Homing twice');
    if (modAdd(w, 'gravity') === false || modAdd(w, 'piercing') === false) bad.push('refused a fitting modifier');
    if (modAdd(w, 'anchored') || modAdd(w, 'trail')) bad.push('accepted a modifier for the wrong attack type');
    if (modAdd(w, 'orbiting') === false || modAdd(w, 'summoned')) bad.push('delivery group not exclusive');
    if (modsFor(w).includes('homing') || !modsFor(w).includes('ricochet')) bad.push('modsFor wrong: ' + modsFor(w));
    for (let i = 0; i < 4; i++) modAdd(w, 'piercing'); if (modCount(w, 'piercing') !== 3) bad.push('Piercing cap ' + modCount(w, 'piercing'));
    if (w.mods.length) bad.push('touched the old w.mods');
    if (modsFor(G.weapons[5] || { def: {} }).length) bad.push('modsFor of a non-v10 weapon');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
