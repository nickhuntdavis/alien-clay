// v10 signature weapons (sigweap.js): every one fires for 300 frames against a ring of enemies with no errors and deals damage;
// echo damage never fills bars; Shocking Impact fires from the dual-type weapon and never from two separate weapons;
// pet, lure and chain caps hold; the draft pool includes the signature weapons.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { localStorage.removeItem('sd_dev'); window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  await page.click('#playBtn'); await page.waitForTimeout(300);
  await page.click('#sampleList [data-s10="baseline"]'); await page.waitForTimeout(300);
  await page.click('#sampleList [data-mode="s002"]'); await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const bad = [], rows = [];
    const def = ENEMIES.chaser || Object.values(ENEMIES)[0];
    const fresh = () => {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.P.maxHp = G.player.hp = 1e6; G.enemies.length = 0; G.stats.dmg = {}; G.stats.reactions = 0; G.fst = null;
    };
    const ring12 = (d0, still) => {
      const p = G.player;
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = d0 + (i % 3) * 40; const e = makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d); e.hp = e.maxHp = 1e5; if (still) e.speed = 0; G.enemies.push(e); }
    };
    const sigs = Object.keys(WEAPONS).filter(id => WEAPONS[id].sig === 1);
    if (sigs.length !== 27) bad.push('signature weapons: ' + sigs.length);
    for (const id of sigs) { const d = WEAPONS[id]; if (!d.v10 || !d.v10atk || !d.v10type || !ELEMENTS[d.v10type]) bad.push(id + ': not typed'); if (/element|\bcast\b/i.test(d.desc)) bad.push(id + ': banned word'); }
    // draft pool
    if (v10Pool().length !== 42 + sigs.length) bad.push('draft pool size ' + v10Pool().length);
    fresh(); genLoot({ kind: 'start' })[0].apply();
    let seen = 0; for (let i = 0; i < 60; i++) seen += genLoot({ kind: 'slot' }).filter(o => o.def.sig).length;
    if (!seen) bad.push('slot draft never offers a signature weapon');
    fresh();
    const sl = genLoot({ kind: 'start' })[0]; sl.apply();
    const sl2 = genLoot({ kind: 'slot' }); const have = G.weapons.find(Boolean).def.v10atk;
    if (sl2.some(o => o.def.v10atk === have)) bad.push('slot draft repeated an attack type');
    // every weapon
    for (const id of sigs) {
      fresh();
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll();
      const p = G.player;
      if (id === 's_carpet') { ring12(26, true); G.manual = { x: 1, y: 0 }; }
      else ring12(70, id !== 's_toothfairy' && id !== 's_mines' && id !== 's_wake' && id !== 's_bubble');
      try { for (let f = 0; f < 300; f++) { if (id === 's_wake') G.manual = { x: Math.cos(f / 15), y: Math.sin(f / 15) }; if (id === 's_carpet') { G.manual = { x: Math.cos(f / 20), y: Math.sin(f / 20) }; G.enemies.forEach((e, i) => { if (f % 30 === 0) { e.x = p.x + Math.cos(i) * 24; e.y = p.y + Math.sin(i) * 24; } }); } update(1 / 60); } }
      catch (err) { bad.push(id + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
      G.manual = null;
      const dealt = Object.values(G.stats.dmg).reduce((a, v) => a + v, 0);
      if (!(dealt > 0)) bad.push(id + ': no damage');
      rows.push(WEAPONS[id].name + ' ' + Math.round(dealt / 5) + '/s');
    }
    // Carpet Burn: nothing when standing still.
    fresh(); G.weapons = [makeSlot('s_carpet', false, 1), null, null, null]; recomputeAll(); ring12(20, true); G.player.vx = G.player.vy = 0; G.manual = { x: 0, y: 0 };
    for (let f = 0; f < 60; f++) { G.player.vx = G.player.vy = 0; sigwTick(1 / 60); }
    G.manual = null;
    if (Object.values(G.stats.dmg).reduce((a, v) => a + v, 0) > 0) bad.push('Carpet Burn hurt while standing still');
    // Echo damage never fills a bar.
    fresh(); { const e = makeEnemy(def, G.player.x + 90, G.player.y); e.hp = e.maxHp = 1e5; G.enemies.push(e); const c = fightCd(e);
      damageEnemy(e, 60, { elem: 'flame', echo: true, noStatus: true, wname: 't' }); damageEnemy(e, 60, { elem: 'fire', echo: true, noStatus: true, wname: 't' }); damageEnemy(e, 60, { elem: 'phys', echo: true, noStatus: true, wname: 't' });
      if (c.bars.fire || c.bars.acid || c.bars.force || c.bars.soul) bad.push('echo filled a bar ' + JSON.stringify(c.bars));
      damageEnemy(e, 60, { elem: 'flame', wname: 't' }); if (!(c.bars.fire > 0)) bad.push('control: a normal hit should fill the Burn bar'); }
    // Red Tape: the share is echo.
    fresh(); { G.weapons = [makeSlot('s_redtape', false, 1), null, null, null]; recomputeAll(); const w = G.weapons[0], p = G.player, es = [];
      for (let i = 0; i < 3; i++) { const e = makeEnemy(def, p.x + 100 + i * 20, p.y + i * 10); e.hp = e.maxHp = 1e5; e.speed = 0; G.enemies.push(e); es.push(e); }
      w.cd = 99; update(1 / 60); tapeUp(w, es[0], 3); const hp0 = es[1].hp; damageEnemy(es[0], 500, { elem: 'flame', wname: 't' });
      for (let f = 0; f < 30; f++) update(1 / 60);
      if (!(es[1].hp < hp0)) bad.push('Red Tape shared nothing');
      for (const o of [es[1], es[2]]) { const c = o.cd; if (c && (c.bars.fire || c.bars.acid || c.bars.force || c.bars.soul)) bad.push('Red Tape share filled a bar'); }
      if (G.stats.reactions || Object.keys((G.fst && G.fst.rx) || {}).length) bad.push('Red Tape share set off a reaction'); }
    // Shocking Impact: from the dual-type weapon only.
    const impact = ws => { fresh(); G.weapons = ws.map(id => makeSlot(id, false, 1)); while (G.weapons.length < 4) G.weapons.push(null); recomputeAll(); ring12(60, true);
      for (let f = 0; f < 900; f++) update(1 / 60); return (G.fst && G.fst.rx && G.fst.rx.shock) || 0; };
    const nDual = impact(['s_dual']); if (!(nDual > 0)) bad.push('Shocking Impact never fired from the dual-type weapon');
    const nSep = impact(['v_phys_proj', 'v_shock_burst', 'v_shock_proj']); if (nSep) bad.push('Shocking Impact fired from separate weapons: ' + nSep);
    // Pets: 4 a weapon, 8 in all; undead last 6 s.
    fresh(); { G.weapons = [makeSlot('s_leeches', false, 1), makeSlot('s_parasite', false, 1), null, null]; recomputeAll(); const lw = G.weapons[0], pw = G.weapons[1];
      lw.s.count = 9; ring12(120, true);
      for (let i = 0; i < 10; i++) G.turrets.push({ x: G.player.x, y: G.player.y, life: 20, max: 20, cd: 5, rate: 1, dmg: 1, range: 300, w: pw, src: { elem: 'poison' }, face: 0, color: '#fff' });
      for (let f = 0; f < 60; f++) update(1 / 60);
      const und = G.turrets.filter(t => t.sigPet && t.life > 0);
      if (lw.pets.length > 4) bad.push('leeches over cap ' + lw.pets.length);
      if (und.length > 4) bad.push('undead over cap ' + und.length);
      if (und.some(t => t.life > 6)) bad.push('undead last longer than 6 s');
      if (sigPetCount() > 8) bad.push('pets over 8 in all: ' + sigPetCount());
      if (und.some(t => t.src.elem !== 'soul')) bad.push('undead not Parasite'); }
    // Lures: 3 teeth.
    fresh(); { G.weapons = [makeSlot('s_toothfairy', false, 1), null, null, null]; recomputeAll(); const w = G.weapons[0]; w.s.count = 6; ring12(120, true);
      for (let i = 0; i < 6; i++) toothFire(w, G.enemies[0]);
      if (TOYS().teeth.filter(t => t.w === w && !t.dead).length > 3) bad.push('more than 3 teeth'); }
    // Chains: Nappy Mines domino stops at 3.
    fresh(); { G.weapons = [makeSlot('s_mines', false, 1), null, null, null]; recomputeAll(); const w = G.weapons[0], p = G.player; let n = 0; const orig = detonateMine; detonateMine = function (pr) { n++; return orig(pr); };
      const ms = []; for (let i = 0; i < 8; i++) { const m = mineDrop(w, p.x + 200 + i * 10, p.y); m.arm = 0; ms.push(m); G.proj.push(m); }
      ms[0].dead = true; detonateMine(ms[0]); for (let f = 0; f < 120; f++) update(1 / 60); detonateMine = orig;
      if (n > 3) bad.push('mine domino went past 3: ' + n);
      if (!G.zones.some(z => z.src && z.src.wname === 'Nappy Mines (pool)')) bad.push('mines left no Acid Pool'); }
    // Switched at Birth leaves a signature weapon alone.
    fresh(); G.weapons = [makeSlot('s_orbit', false, 1), null, null, null]; recomputeAll(); if (v10Switch().length) bad.push('Switched at Birth offered for a signature weapon');
    return { bad, rows };
  });
  console.log(r.rows.join(' | '));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
})();
