// Weapon cells part 7 (cellmods7.js): There Is No Spoon (sp) and Family Ties (ft). Card rules (dealt / not dealt, no fork
// screens, every cell has its card line), every cell at rank 1 and at its mastery against a crowd that shoots (no errors,
// the weapon still deals damage), and the headline behaviours of each weapon's own cells.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = { dmg: {} }, DMG = { n: 0 };
    zoneForce = (orig => function () { const z = orig.apply(this, arguments); z.cilia = null; return z; })(zoneForce);
    damageEnemy = (orig => function (e, d, s) { if (s && s.w && G.weapons.includes(s.w) && !e.charmed) DMG.n += d || 0; return orig.apply(this, arguments); })(damageEnemy);
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.ebul.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    const foe = (dx, dy, big) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = 40; e.hp = e.maxHp = 400; if (big) e.r = 40; G.enemies.push(e); return e; };
    const crowd = () => { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 70 + (i % 4) * 50; foe(Math.cos(a) * d, Math.sin(a) * d, i % 5 === 0); } };
    const PEL = ['ice', 'shock', null];
    const shoot = (e, pel) => { const p = G.player, a = Math.atan2(p.y - e.y, p.x - e.x); G.ebul.push({ x: e.x, y: e.y, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, dmg: 4, r: 5, color: '#f00', life: 7, from: 'test', owner: e, pel: pel === undefined ? PEL[Math.floor(Math.random() * 3)] : pel }); };
    const near = (x, y, R) => G.enemies.filter(e => !e.dead && !e.charmed && Math.hypot(e.x - x, e.y - y) < R);
    let feed = false;
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue.length = 0; if (feed && i % 6 === 0) { const sh = near(G.player.x, G.player.y, 300); if (sh.length && G.ebul.length < 60) shoot(sh[i % sh.length]); } update(1 / 60); G.player.hp = 1e6; if (G.enemies.filter(e => !e.dead && !e.charmed).length < 6) crowd(); } };
    const cellsOf = id => XC_W[id].cells;
    // 1. Card rules
    let w = fresh('s_siphon');
    out.spOk = ['ranged', 'melee', 'mines', 'orbiting', 'homing', 'charged', 'area'].map(id => modOk(w, id));
    if (out.spOk.join() !== 'false,true,true,true,true,true,true') bad.push('spoon dealt ' + out.spOk);
    w = fresh('s_void');
    out.ftOk = ['pull', 'piercing', 'ranged', 'gravity', 'melee', 'dfa', 'knock', 'orbiting', 'area'].map(id => modOk(w, id) && modCardOk(w, id));
    if (out.ftOk.join() !== 'false,false,false,false,true,true,true,true,true') bad.push('family ties dealt ' + out.ftOk);
    if (sabCard() && ['s_siphon', 's_void'].includes(w24Key(G.weapons[0]))) { const k = sabCard(); if (k && /Family Ties/.test(k.title)) bad.push('family ties switched at birth'); }
    w = fresh('s_siphon'); SET.noLimits = true; modAdd(w, 'knock'); modAdd(w, 'knock'); SET.noLimits = false;
    if (G.lootQueue.some(q => q.kind === 'fork')) bad.push('fork screen on a spoon cell');
    w = fresh('s_void'); SET.noLimits = true; modAdd(w, 'sticky'); modAdd(w, 'sticky'); SET.noLimits = false;
    if (G.lootQueue.some(q => q.kind === 'fork')) bad.push('fork screen on a family ties cell');
    const c = modCard(w, 'sticky'); if (!c.desc || /TODO_COPY/.test(c.desc)) bad.push('card text ' + c.desc);
    for (const [id, tag] of [['s_siphon', 'sp'], ['s_void', 'ft']]) for (const m of cellsOf(id)) { const t = SLICE_COPY['cell_' + tag + '_' + m]; if (!t || /TODO_COPY/.test(t)) bad.push('no card line cell_' + tag + '_' + m); }
    // 2. Every cell at rank 1 and at mastery (the spoon gets a crowd that shoots)
    for (const id of ['s_siphon', 's_void']) for (const m of cellsOf(id)) for (const n of [1, 4]) {
      w = fresh(id); w.m10 = Array(n).fill(m); computeStats(w); crowd(); feed = id === 's_siphon';
      DMG.n = 0;
      const k = XC_W[id].tag + ':' + m + n;
      try { run(5); } catch (err) { bad.push('error in ' + k + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); continue; }
      out.dmg[k] = Math.round(DMG.n);
      if (!(out.dmg[k] > 0)) bad.push('no damage ' + k);
    }
    feed = false;
    // 3. There Is No Spoon behaviours
    const eat = (w, e, pel, n) => { for (let i = 0; i < (n || 1); i++) { const b = { x: G.player.x + 10, y: G.player.y, vx: 0, vy: 0, dmg: 4, r: 5, life: 7, owner: e, pel }; G.ebul.push(b); } updateSiphon(w, 1 / 60); };
    w = fresh('s_siphon'); w.m10 = ['homing']; computeStats(w); let sh = foe(260, 0); sh.speed = 0; foe(150, 80).speed = 0;
    eat(w, sh, 'ice'); w.cd = 0; updateSiphon(w, 1 / 60);
    let pr = G.proj.find(q => q.w === w && q.c7); out.homeOn = !!(pr && pr.c7.h && pr.c7.h.t === sh); if (!out.homeOn) bad.push('return does not home on its shooter');
    w = fresh('s_siphon'); w.m10 = ['explode']; computeStats(w); sh = foe(200, 0); sh.speed = 0; eat(w, sh, 'ice'); w.cd = 0; updateSiphon(w, 1 / 60);
    pr = G.proj.find(q => q.w === w && q.c7); out.typed = pr && pr.src.elem; if (out.typed !== 'ice') bad.push('return not in its shooter\'s type ' + out.typed);
    w = fresh('s_siphon'); w.m10 = ['charged']; computeStats(w); sh = foe(200, 0); sh.speed = 0;
    eat(w, sh, null, 5); const held = w.q.length; out.held = held; if (!(held >= 4) || G.proj.some(q => q.w === w)) bad.push('charged does not hold ' + held);
    eat(w, sh, null, 8); out.volley = G.proj.filter(q => q.w === w).length; if (!(out.volley >= 8 && w.q.length === 0)) bad.push('no volley ' + out.volley + ' ' + w.q.length);
    w = fresh('s_siphon'); w.m10 = ['melee']; computeStats(w); sh = foe(300, 0); sh.speed = 0; eat(w, sh, 'ice', 3); eat(w, sh, 'shock', 3);
    const vic = foe(40, 0); vic.speed = 0; const hp0 = vic.hp; updateSiphon(w, 1 / 60);
    out.whack = [Math.round(hp0 - vic.hp), w.q.length]; if (!(vic.hp < hp0 && w.q.length === 0) || G.proj.some(q => q.w === w)) bad.push('spoon whack ' + out.whack);
    w = fresh('s_siphon'); w.m10 = ['mines']; computeStats(w); sh = foe(300, 0); sh.speed = 0; eat(w, sh, null, 3);
    out.planted = C7.SPS(w).mines.length; if (!(out.planted >= 3)) bad.push('no planted bullets ' + out.planted);
    w = fresh('s_siphon'); w.m10 = ['orbiting']; computeStats(w); sh = foe(300, 0); sh.speed = 0; eat(w, sh, null, 3); update(1 / 60);
    out.orbit = C7.SPS(w).orbP.length; if (!(out.orbit >= 2)) bad.push('no orbiting bullets ' + out.orbit);
    const ob = C7.SPS(w).orbP[0]; G.ebul.push({ x: ob.x, y: ob.y, vx: 0, vy: 0, dmg: 4, r: 5, life: 7, owner: sh }); const nb = G.ebul.length; update(1 / 60);
    if (G.ebul.length >= nb && G.ebul.some(q => !q.dead && Math.hypot(q.x - ob.x, q.y - ob.y) < 6)) bad.push('orbit does not block');
    w = fresh('s_siphon'); w.m10 = ['dfa']; computeStats(w); sh = foe(250, 0); sh.speed = 0; eat(w, sh, null, 2);
    out.rain = C7.SPS(w).rain.map(q => q.t === sh); if (!out.rain.length || !out.rain[0]) bad.push('rain not on its shooter');
    w = fresh('s_siphon'); const a0 = w.s.area; w.m10 = ['area', 'area']; computeStats(w); out.gape = [Math.round(a0), Math.round(w.s.area)]; if (!(w.s.area > a0 * 1.4)) bad.push('wide gape ' + out.gape);
    w = fresh('s_siphon'); w.m10 = ['pull']; computeStats(w); sh = foe(300, 0); sh.speed = 0; const pb = { x: G.player.x + 130, y: G.player.y, vx: 0, vy: 0, dmg: 4, r: 5, life: 7, owner: sh }; G.ebul.push(pb);
    for (let i = 0; i < 20; i++) updateSiphon(w, 1 / 60); out.curve = pb.dead || Math.hypot(pb.x - G.player.x, pb.y - G.player.y) < 120; if (!out.curve) bad.push('bullets do not curve in');
    // 4. Family Ties behaviours
    const orbs = w => C7.ftOrbs(w);
    w = fresh('s_void'); w.m10 = ['knock']; computeStats(w); let t = foe(220, 0); t.speed = 0; fireWeapon(w, t); let o = orbs(w)[0];
    if (!o || o.pull !== 0) bad.push('knockback hole still pulls'); else { o.vx = o.vy = 0; const e1 = foe(0, 0); e1.speed = 0; e1.x = o.x + 30; e1.y = o.y; for (let i = 0; i < 20; i++) update(1 / 60); out.repel = Math.round(Math.hypot(e1.x - o.x, e1.y - o.y)); if (!(out.repel > 34)) bad.push('hole does not repel ' + out.repel); }
    w = fresh('s_void'); w.m10 = ['dfa']; computeStats(w); t = foe(250, 0); t.speed = 0; for (let i = 0; i < 4; i++) foe(250 + i * 10, 20).speed = 0; fireWeapon(w, t);
    if (orbs(w).length) bad.push('dropped hole travelled'); for (let i = 0; i < 45; i++) update(1 / 60); o = orbs(w)[0];
    out.drop = o ? [Math.round(Math.hypot(o.x - t.x, o.y - t.y)), Math.round(Math.hypot(o.vx, o.vy))] : null; if (!o || out.drop[0] > 80 || out.drop[1] > 1) bad.push('no hole dropped on the crowd ' + out.drop);
    w = fresh('s_void'); w.m10 = ['mines']; computeStats(w); t = foe(400, 0); t.speed = 0; fireWeapon(w, t); out.dorm = C7.FTS(w).dorm.length;
    if (out.dorm !== 1 || orbs(w).length) bad.push('no dormant hole ' + out.dorm); const dm = C7.FTS(w).dorm[0]; dm.arm = 0; const e2 = foe(0, 0); e2.speed = 0; e2.x = dm.x + 40; e2.y = dm.y; update(1 / 60); update(1 / 60);
    if (!orbs(w).length) bad.push('dormant hole does not open');
    w = fresh('s_void'); w.m10 = ['melee']; computeStats(w); const e3 = foe(55, 0); e3.speed = 0; const h3 = e3.hp; const d3 = Math.hypot(e3.x - G.player.x, e3.y - G.player.y); for (let i = 0; i < 40; i++) { update(1 / 60); G.player.hp = 1e6; }
    out.melee = [Math.round(h3 - e3.hp), Math.round(d3), Math.round(Math.hypot(e3.x - G.player.x, e3.y - G.player.y)), orbs(w).length]; if (!(e3.hp < h3) || orbs(w).length) bad.push('hole on you ' + out.melee);
    w = fresh('s_void'); w.m10 = ['orbiting']; computeStats(w); for (let i = 0; i < 5; i++) update(1 / 60); o = orbs(w)[0];
    out.orbitD = o ? Math.round(Math.hypot(o.x - G.player.x, o.y - G.player.y)) : null; if (!o || Math.abs(out.orbitD - 72) > 6) bad.push('hole does not orbit ' + out.orbitD);
    w = fresh('s_void'); w.m10 = ['nth']; computeStats(w); t = foe(300, 0); t.speed = 0; for (let i = 0; i < 4; i++) fireWeapon(w, t);
    out.nth = orbs(w).map(q => q.mass || 1); if (!out.nth.includes(2)) bad.push('4th hole not double ' + out.nth);
    w = fresh('s_void'); t = foe(300, 0); t.speed = 0; fireWeapon(w, t); const r0 = orbs(w)[0].r; w = fresh('s_void'); w.m10 = ['area', 'area']; computeStats(w); t = foe(300, 0); t.speed = 0; fireWeapon(w, t);
    out.horizon = [Math.round(r0), Math.round(orbs(w)[0].r)]; if (!(orbs(w)[0].r > r0 * 1.4)) bad.push('event horizon ' + out.horizon);
    w = fresh('s_void'); w.m10 = ['explode']; computeStats(w); t = foe(200, 0); t.speed = 0; fireWeapon(w, t); o = orbs(w)[0]; o.vx = o.vy = 0;
    for (let i = 0; i < 3; i++) { const q = foe(0, 0); q.speed = 0; q.x = o.x + 20 * i; q.y = o.y + 10; } o.life = 0.01; DMG.n = 0; update(1 / 60); update(1 / 60); update(1 / 60);
    out.burst = Math.round(DMG.n); if (!(DMG.n > w.s.dmg * 4)) bad.push('no burst when the hole runs out ' + out.burst);
    w = fresh('s_void'); w.m10 = ['sticky']; computeStats(w); t = foe(200, 0); t.speed = 0; fireWeapon(w, t); o = orbs(w)[0]; o.vx = o.vy = 0;
    const e4 = foe(0, 0); e4.speed = 0; e4.x = o.x + 10; e4.y = o.y; update(1 / 60); update(1 / 60); e4.x = o.x + o.aura + 40; update(1 / 60); update(1 / 60);
    out.tether = !!(e4.c7teth && e4.c7teth.o === o); if (!out.tether) bad.push('no tidal tether leaving the well');
    w = fresh('s_void'); w.m10 = ['connecting', 'connecting', 'connecting']; computeStats(w); const R0 = VOID_MERGE.reach; update(1 / 60); if (VOID_MERGE.reach !== R0) bad.push('merge reach left changed');
    // 5. Round 2 reworks
    const sp0 = (cells, n) => { const w = fresh('s_siphon'); w.m10 = cells; computeStats(w); return w; };
    w = sp0(['range']); sh = foe(400, 0); sh.speed = 0; eat(w, sh, null); w.cd = 0; updateSiphon(w, 1 / 60); pr = G.proj.find(q => q.w === w && q.c7);
    if (pr) { pr.life = 0.01; let k = 0; while (!pr.dead && k++ < 240) update(1 / 60); } out.recycle = !!(pr && pr.c7.back && pr.dead); if (!out.recycle) bad.push('a miss does not come home');
    w = sp0(['upclose']); sh = foe(80, 0); sh.speed = 0; eat(w, sh, null); w.cd = 0; updateSiphon(w, 1 / 60); out.pellets = G.proj.filter(q => q.w === w && q.c7 && q.c7.pel).length; if (!(out.pellets >= 3)) bad.push('no spit take ' + out.pellets);
    w = sp0(['rapid', 'rapid', 'rapid', 'rapid']); sh = foe(250, 0); sh.speed = 0; w.q = w.q || []; for (let i = 0; i < 5; i++) w.q.push(1); C7.SPS(w).hicT = G.t; update(1 / 60); out.hiccup = w.q.length; if (w.q.length) bad.push('no hiccup ' + w.q.length);
    w = sp0(['catalyst']); const ce = foe(30, 0); ce.speed = 0; rxFired('splash', ce); out.digest = C7.SPS(w).meta.filter(m => m.rx).length; if (!(out.digest >= 1)) bad.push('reaction not digested');
    w = sp0(['kinship']); const kw = G.weapons[1] = makeSlot('v_phys_proj', false, 3); computeStats(kw); const kp = spawnProj(kw, G.player.x + 50, G.player.y, 0, weaponSrc(kw)); w.q = w.q || []; const q0 = w.q.length; projEnd(kp);
    out.kin = [q0, w.q.length]; if (!(w.q.length > q0 && C7.SPS(w).meta.some(m => m.kin === kw))) bad.push('kin shot not eaten ' + out.kin);
    w = sp0(['knock']); sh = foe(300, 0); sh.speed = 0; const kv = foe(120, 0); kv.speed = 0; wupHit(kv, { toHp: 10 }, Object.assign(weaponSrc(w), { c7: { m: { o: sh, t: 'phys' }, k: 1, pr: null } }));
    out.knockHome = !!(kv.c7kn && kv.c7kn.o === sh && kv.kx > 0); if (!out.knockHome) bad.push('not knocked towards its shooter');
    w = sp0(['sticky']); const sv = foe(120, 0); sv.speed = 0; wupHit(sv, { toHp: 10 }, Object.assign(weaponSrc(w), { c7: { m: null, k: 1, pr: null } })); out.splat = (C7.SPS(w).splat || []).length; if (out.splat !== 1) bad.push('no spit splat');
    w = sp0(['focus']); sh = foe(250, 0); sh.speed = 0; const s2 = foe(250, 60); s2.speed = 0; eat(w, sh, null, 3); eat(w, s2, null, 1); for (let i = 0; i < 40; i++) update(1 / 60); out.grudge = C7.SPS(w).grudge === sh; if (!out.grudge) bad.push('no grudge');
    w = sp0(['nth']); sh = foe(420, 0); sh.speed = 0; for (let i = 0; i < 4; i++) { eat(w, sh, null); w.cd = 0; updateSiphon(w, 1 / 60); }
    const hb = G.proj.find(q => q.w === w && q.c7 && q.c7.hair); if (hb) { G.ebul.push({ x: hb.x, y: hb.y, vx: 0, vy: 0, dmg: 4, r: 5, life: 7 }); update(1 / 60); }
    out.hairball = hb ? hb.c7.hair.n : -1; if (!(out.hairball >= 1)) bad.push('no hairball ' + out.hairball);
    const ft0 = cells => { const w = fresh('s_void'); w.m10 = cells; computeStats(w); return w; };
    w = ft0(['range']); t = foe(350, 0); t.speed = 0; fireWeapon(w, t); for (let i = 0; i < 40; i++) update(1 / 60); out.wake = modS().wells.filter(q => q.w === w).length; if (!(out.wake >= 1)) bad.push('no tidal wake');
    w = ft0(['upclose']); t = foe(350, 0); t.speed = 0; fireWeapon(w, t); update(1 / 60); update(1 / 60); o = orbs(w)[0]; out.swing = !!(o && o.c7f.swung); if (!out.swing) bad.push('hole does not swing round you');
    w = ft0(['rapid']); t = foe(300, 0); t.speed = 0; fireWeapon(w, t); o = orbs(w)[0]; o.vx = o.vy = 0; const hb2 = { x: o.x + 10, y: o.y, vx: 0, vy: 0, dmg: 4, r: 5, life: 7 }; G.ebul.push(hb2); o.life = 0.01; update(1 / 60); update(1 / 60); update(1 / 60);
    out.hawking = hb2.dead || !G.ebul.includes(hb2); if (!out.hawking) bad.push('no hawking flash');
    w = ft0(['charged']); update(1 / 60); w.cd = 0.3; G.ebul.push({ x: G.player.x + 30, y: G.player.y, vx: 0, vy: 0, dmg: 4, r: 5, life: 7 }); update(1 / 60); out.accrete = C7.FTS(w).acc || 0; if (!(out.accrete >= 1)) bad.push('no accretion');
    w = ft0(['catalyst']); t = foe(300, 0); t.speed = 0; fireWeapon(w, t); o = orbs(w)[0]; o.vx = o.vy = 0; const m0 = o.mass || 1; const ci = foe(0, 0); ci.x = o.x + 5; ci.y = o.y; rxFired('splash', ci);
    out.rxMass = [m0, o.mass]; if (!(o.mass > m0)) bad.push('reaction did not add mass');
    w = ft0(['kinship']); const k2 = G.weapons[1] = makeSlot('v_phys_proj', false, 3); computeStats(k2); t = foe(300, 0); t.speed = 0; fireWeapon(w, t); o = orbs(w)[0]; o.vx = o.vy = 0;
    const kk = foe(0, 0); kk.speed = 0; kk.x = o.x + o.aura + 100; kk.y = o.y; const kd0 = Math.hypot(kk.x - o.x, kk.y - o.y); wupHit(kk, { toHp: 5 }, weaponSrc(k2));
    out.kinTug = Math.round(kd0 - Math.hypot(kk.x - o.x, kk.y - o.y)); if (!(out.kinTug > 10)) bad.push('kin hit no tug ' + out.kinTug);
    w = ft0(['primer']); const p2 = G.weapons[1] = makeSlot('v_phys_proj', false, 3); computeStats(p2); t = foe(300, 0); t.speed = 0; fireWeapon(w, t); o = orbs(w)[0]; o.vx = o.vy = 0;
    const pin = foe(0, 0); pin.x = o.x + 5; pin.y = o.y; const pout = foe(0, 0); pout.speed = 0; pout.x = o.x + o.aura * 1.6; pout.y = o.y; update(1 / 60); const pd0 = Math.hypot(pout.x - o.x, pout.y - o.y);
    mwDetonate(pin, w, { w, t: G.t + 4, by: new Set([p2]), steps: 0 }); out.flare = Math.round(pd0 - Math.hypot(pout.x - o.x, pout.y - o.y)); if (!(out.flare > 10)) bad.push('no flare ' + out.flare);
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
