// Weapon cells part 3 (cellmods3.js): Standard Issue and Little Prick. Card rules (which modifiers are dealt, Switched at
// Birth, no fork screens, a plain card line for every cell), every cell at rank 1 and at its mastery against a crowd (no
// errors, the weapon still deals damage), and the headline behaviours.
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
    const fresh = id => { META.profile = 's10_ordered'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0; G.P.maxHp = G.player.hp = 1e6; for (let i = 0; i < G.weapons.length; i++) G.weapons[i] = null; const w = G.weapons[0] = makeSlot(id, false, 3); computeStats(w); return w; };
    const foe = (dx, dy, big) => { const p = G.player, e = makeEnemy(ENEMIES.crawler, p.x + dx, p.y + dy, {}); e.speed = 40; e.hp = e.maxHp = 400; if (big) e.r = 40; G.enemies.push(e); return e; };
    const crowd = () => { for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 70 + (i % 4) * 50; foe(Math.cos(a) * d, Math.sin(a) * d, i % 5 === 0); } };
    const run = s => { for (let i = 0; i < s * 60; i++) { G.state = 'play'; G.lootQueue.length = 0; update(1 / 60); G.player.hp = 1e6; if (G.enemies.filter(e => !e.dead && !e.charmed).length < 6) crowd(); } };
    const set = (id, m) => { const w = fresh(id); w.m10 = m.slice(); computeStats(w); return w; };
    const IDS = ['v_phys_proj', 'v_arcane_proj'];
    // 1. Card rules
    for (const id of IDS) {
      const w = fresh(id), D = XC_W[id];
      if (modOk(w, 'ranged')) bad.push(id + ' dealt Ranged');
      SET.noLimits = true;
      const no = D.cells.filter(m => !modOk(fresh(id), m)); if (no.length) bad.push(id + ' not dealt ' + no);
      for (const m of D.cells) { // the card line, at rank 1 and at the mastery
        for (const n of [0, 3]) {
          const v = fresh(id); v.m10 = Array(n).fill(m); G.mmM = [];
          const c = modCard(v, m); if (!c || !c.desc || /TODO_COPY/.test(c.desc) || c.desc !== SLICE_COPY['cell_' + D.tag + '_' + m]) bad.push('card text ' + D.tag + ':' + m + n + ' ' + (c && c.desc));
        }
      }
      const v = fresh(id); modAdd(v, 'knock'); modAdd(v, 'knock'); modAdd(v, 'focus'); modAdd(v, 'focus');
      if (G.lootQueue.some(q => q.kind === 'fork')) bad.push(id + ' fork screen on a cell');
      SET.noLimits = false;
    }
    const sab = new Set(); for (let i = 0; i < 20; i++) { fresh('v_phys_proj'); const k = sabCard(); if (k) sab.add(k.elem); }
    if (sab.size !== 1 || !sab.has('arcane')) bad.push('standard issue switched at birth ' + [...sab]);
    fresh('v_arcane_proj'); if (sabCard()) bad.push('little prick dealt switched at birth');
    // 2. Every cell at rank 1 and at its mastery
    for (const id of IDS) for (const m of XC_W[id].cells) for (const n of [1, 4]) {
      const w = set(id, Array(n).fill(m)); crowd(); DMG.n = 0;
      const k = XC_W[id].tag + ':' + m + n;
      try { run(m === 'turncoat' ? 6 : 4); } catch (err) { bad.push('error in ' + k + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); continue; }
      try { render(); } catch (err) { bad.push('draw error in ' + k + ': ' + err.message); }
      out.dmg[k] = Math.round(DMG.n);
      if (!(out.dmg[k] > 0)) bad.push('no damage ' + k);
      const S = G.xc3; if (S && (S.st.length > 12 || S.th.length > 12 || S.sti.length > 12 || S.lodge.length > 40 || S.mine.length > 5 || S.cr.length > 6)) bad.push('unbounded ' + k);
      if (G.proj.length > 300) bad.push('shots pile up ' + k + ' ' + G.proj.length);
    }
    for (const id of IDS) { // everything at once (no slot limits), with drawing
      const m = []; for (const c of XC_W[id].cells) if (c !== 'melee' && c !== 'mines') m.push(c, c, c, c);
      set(id, m); crowd(); DMG.n = 0;
      try { for (let i = 0; i < 6 * 60; i++) { run(1 / 60); if (i % 20 === 0) render(); } } catch (err) { bad.push('error in all ' + id + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
      out.dmg['all:' + id] = Math.round(DMG.n); if (!(DMG.n > 0)) bad.push('no damage all ' + id);
      if (G.proj.length > 300) bad.push('shots pile up all ' + id + ' ' + G.proj.length);
    }
    // 3. Behaviours
    const at = (dx, dy) => { const e = foe(dx, dy); e.speed = 0; return e; };
    const upd = update; update = dt => { const p = G.player, x = p.x, y = p.y; upd(dt); p.x = x; p.y = y; }; // (the player holds still: autorun would swim off)
    let w = set('v_phys_proj', ['ricochet', 'ricochet']); const e1 = at(150, 0); at(80, 60); at(80, -60); // Ricochet: bounces off the enemy
    spawnProj(w, G.player.x, G.player.y, 0, weaponSrc(w)); const pr1 = G.proj[G.proj.length - 1];
    for (let i = 0; i < 40; i++) update(1 / 60); out.bounces = pr1.xc3Bn || 0; if (!(out.bounces >= 1)) bad.push('pellet did not bounce');
    w = set('v_phys_proj', ['knock']); const a1 = at(100, 0), a2 = at(100 + a1.r * 2 + 2, 0); // Billiards: the shoved enemy shoves the next
    a2.x = a1.x + a1.r + a2.r + 1; spawnProj(w, G.player.x, G.player.y, 0, weaponSrc(w)); const h2 = a2.hp;
    for (let i = 0; i < 40; i++) update(1 / 60); out.billiards = Math.round(h2 - a2.hp); if (!(a2.hp < h2)) bad.push('billiards: no collision');
    w = set('v_phys_proj', ['sticky', 'sticky', 'sticky', 'sticky']); const s1 = at(120, 0); s1.hp = s1.maxHp = 1e5; // Lodged: 5 at most, then Snared
    for (let i = 0; i < 7; i++) { spawnProj(w, G.player.x, G.player.y, 0, weaponSrc(w)); for (let j = 0; j < 20; j++) update(1 / 60); }
    out.lodged = s1.xc3Lg ? s1.xc3Lg.n : 0; if (out.lodged !== 5 || !(s1.xc3LgS > 0)) bad.push('lodged ' + out.lodged + ' snared ' + !!s1.xc3LgS); // (Dead weight: Snared once 5 are in)
    w = set('v_phys_proj', ['connecting']); const c1 = at(120, 0); at(170, 30); // Staple
    spawnProj(w, G.player.x, G.player.y, 0, weaponSrc(w)); for (let i = 0; i < 30; i++) update(1 / 60);
    out.staples = G.xc3.st.length; if (!(out.staples >= 1)) bad.push('no staple');
    w = set('v_phys_proj', ['orbiting', 'orbiting', 'orbiting', 'orbiting']); at(260, 0); // Slingshot mastery: pellets stay in orbit
    for (let i = 0; i < 4 * 60; i++) { G.lootQueue.length = 0; update(1 / 60); } out.orbit = (w.xc3Orbs || []).filter(q => q.xc3Orb && q.xc3Orb.stay).length;
    if (!(out.orbit >= 2 && out.orbit <= 6)) bad.push('orbiting pellets ' + out.orbit);
    w = set('v_phys_proj', ['melee']); const m1 = at(90, 0); // Head-on ram: you move into it
    fireWeapon(w, m1); out.ram = [Math.round(G.m10 && G.m10.lunge ? G.m10.lunge.left : 0), Math.round(m1.maxHp - m1.hp)];
    if (!(out.ram[0] > 10 && out.ram[1] > 0)) bad.push('ram ' + out.ram);
    w = set('v_phys_proj', ['mines']); at(200, 0); for (let i = 0; i < 60; i++) update(1 / 60); // pellet mines
    out.mines = G.xc3 ? G.xc3.mine.length : 0; if (!(out.mines >= 1)) bad.push('no pellet mines');
    w = set('v_arcane_proj', ['charged', 'charged']); const b1 = at(150, 0); b1.hp = b1.maxHp = 1e5; // Charged: extra Bleed stacks
    spawnProj(w, G.player.x, G.player.y, 0, weaponSrc(w)); for (let i = 0; i < 30; i++) update(1 / 60);
    out.stacks = b1.bleeds ? b1.bleeds.length : 0; if (!(out.stacks >= 5)) bad.push('charged stacks ' + out.stacks);
    w = set('v_arcane_proj', ['nth', 'nth', 'nth', 'nth']); const b2 = at(150, 0); b2.hp = b2.maxHp = 1e5; // tick all stacks at once
    b2.bleeds = [{ dps: 10, t: 3, by: 'x' }, { dps: 10, t: 3, by: 'x' }]; const hb = b2.hp; xc3BleedAll(b2, w);
    out.tickAll = Math.round(hb - b2.hp); if (!(out.tickAll >= 40) || b2.bleeds.length) bad.push('tick all ' + out.tickAll);
    w = set('v_arcane_proj', ['connecting', 'connecting', 'connecting']); const t1 = at(150, 0), t2 = at(190, 20); t1.hp = t1.maxHp = t2.hp = t2.maxHp = 1e5; // Blood thread passes stacks
    spawnProj(w, G.player.x, G.player.y, 0, weaponSrc(w)); for (let i = 0; i < 90; i++) update(1 / 60);
    out.thread = [G.xc3.th.length, t2.bleeds ? t2.bleeds.length : 0]; if (!(out.thread[0] >= 1 && out.thread[1] >= 1)) bad.push('thread ' + out.thread);
    w = set('v_arcane_proj', ['explode']); const x1 = at(150, 0), x2 = at(185, 0); x1.hp = x1.maxHp = x2.hp = x2.maxHp = 1e5; // bursts 0.5 s later
    spawnProj(w, G.player.x, G.player.y, 0, weaponSrc(w)); for (let i = 0; i < 18; i++) update(1 / 60); const hx = x2.hp;
    for (let i = 0; i < 40; i++) update(1 / 60); out.burst = Math.round(hx - x2.hp); if (!(x2.hp < hx)) bad.push('needle burst did not land');
    w = set('v_arcane_proj', ['melee', 'melee']); const k1 = at(70, 0); k1.hp = k1.maxHp = 1e5; for (let i = 0; i < 40; i++) update(1 / 60); // stab: double Bleed
    out.stab = k1.bleeds ? k1.bleeds.length : 0; if (!(out.stab >= 2)) bad.push('stab bleed ' + out.stab);
    w = set('v_arcane_proj', ['area', 'area']); const r1 = at(150, 0), r2 = at(150, 35); r1.hp = r1.maxHp = r2.hp = r2.maxHp = 1e5; // Blood mist
    spawnProj(w, G.player.x, G.player.y, 0, weaponSrc(w)); for (let i = 0; i < 30; i++) update(1 / 60);
    out.mist = r2.bleeds ? r2.bleeds.length : 0; if (!(out.mist >= 1)) bad.push('no blood mist');
    // 4. Round 2 reworks (one check each)
    const shot = (w, a) => spawnProj(w, G.player.x, G.player.y, a || 0, weaponSrc(w));
    const tough = (dx, dy) => { const e = at(dx, dy); e.hp = e.maxHp = 1e5; return e; }, grid = () => { G.weapons[0].cd = 9; update(1 / 60); }; // (forNear's grid is rebuilt each frame)
    const R2 = {};
    w = set('v_phys_proj', ['range']); { const e = tough(150, 0), pr = shot(w); pr.xc3Fly = 250; const p0 = pr.pierce; xc3Hit(pr, e); R2.siRange = pr.pierce > p0; }
    w = set('v_phys_proj', ['rapid']); { const e = tough(200, 0); fireWeapon(w, e); const c = G.xc3.cas[0], o = tough(0, 0); if (c) { o.x = c.x; o.y = c.y; } for (let i = 0; i < 3; i++) update(1 / 60); R2.siRapid = !!c && o.xc3SlT > G.t; }
    w = set('v_phys_proj', ['charged']); { const e = tough(45, 0); grid(); fireWeapon(w, e); R2.siCharged = e.hp < e.maxHp; }
    w = set('v_phys_proj', ['catalyst']); { const e = tough(150, 0); tough(200, 40); tough(200, -40); e.xc3CatW = w; e.xc3CatT = G.t + 1; const n0 = G.proj.length; rxFired('pressure', e); R2.siCatalyst = G.proj.length - n0 >= 2; }
    w = set('v_phys_proj', ['kinship']); { const w2 = G.weapons[1] = makeSlot('v_phys_spread', false, 3); computeStats(w2); const e = tough(150, 0), n0 = G.proj.filter(q => q.w === w).length; damageEnemy(e, 10, weaponSrc(w2)); R2.siKinship = G.proj.filter(q => q.w === w).length > n0; G.weapons[1] = null; }
    w = set('v_phys_proj', ['primer']); { const e = tough(150, 0), back = tough(220, 0), side = tough(150, 90); grid(); mwDetonate(e, w, { w, t: G.t + 4, by: new Set(), steps: 0 }); R2.siPrimer = back.hp < back.maxHp && side.hp === side.maxHp; }
    w = set('v_phys_proj', ['focus']); { const e = tough(150, 0); let pr; for (let i = 0; i < 5; i++) { pr = shot(w); xc3Hit(pr, e); } R2.siFocus = pr.pierce >= 1; }
    w = set('v_phys_proj', ['homing']); { const e = tough(250, 0); w.curTarget = e; const n0 = G.proj.length; fireWeapon(w, e); const pr = G.proj[n0]; R2.siHoming = !!pr && Math.abs(Math.atan2(pr.vy, pr.vx)) > 0.3 && pr.xc3Clip === 1; }
    w = set('v_arcane_proj', ['range']); { const e = tough(150, 0), pr = shot(w); pr.xc3Fly = 250; xc3Hit(pr, e); R2.lpRange = !!e.xc3Dart; }
    w = set('v_arcane_proj', ['rapid']); { const e = tough(150, 0); tough(190, 30); for (let i = 0; i < 4; i++) xc3Hit(shot(w), e); R2.lpRapid = G.xc3.sti.length >= 1; }
    w = set('v_arcane_proj', ['catalyst']); { const e = tough(150, 0), o = tough(180, 20); e.bleeds = [{ dps: 5, t: 3, by: 'x' }]; grid(); e.xc3CatW = w; e.xc3CatT = G.t + 1; rxFired('pressure', e); R2.lpCatalyst = !!(o.bleeds && o.bleeds.length); }
    w = set('v_arcane_proj', ['kinship']); { const w2 = G.weapons[1] = makeSlot('s_duedate', false, 3); computeStats(w2); const e = tough(150, 0), o = tough(200, 30); e.bleeds = [{ dps: 5, t: 3, by: 'x' }, { dps: 5, t: 3, by: 'x' }]; damageEnemy(e, 10, weaponSrc(w2)); R2.lpKinship = !!(o.bleeds && o.bleeds.length); G.weapons[1] = null; }
    w = set('v_arcane_proj', ['primer']); { const e = tough(150, 0); tough(200, 40); tough(200, -40); const n0 = G.proj.length; mwDetonate(e, w, { w, t: G.t + 4, by: new Set(), steps: 0 }); R2.lpPrimer = G.proj.length - n0 >= 2; }
    w = set('v_arcane_proj', ['focus']); { const e = tough(150, 0), o = tough(190, 20); grid(); for (let i = 0; i < 5; i++) xc3Hit(shot(w), e); R2.lpFocus = !!(o.bleeds && o.bleeds.length); }
    w = set('v_arcane_proj', ['homing']); { const pr = shot(w), o = tough(40, 20); o.bleeds = [{ dps: 5, t: 3, by: 'x' }]; pr.tgt = tough(300, 0); xc3Step(pr, 1 / 60); R2.lpHoming = pr.tgt === o; }
    w = set('v_arcane_proj', ['sticky']); { const e = tough(150, 0); xc3Hit(shot(w), e); R2.lpSticky = e.xcHeldT > G.t; }
    out.round2 = R2; for (const k in R2) if (!R2[k]) bad.push('round 2 ' + k);
    update = upd;
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.bad.length ? 'FAIL ' + r.bad.join('; ') : 'OK', 'ERRORS', JSON.stringify(errors.slice(0, 5)));
  await b.close();
})();
