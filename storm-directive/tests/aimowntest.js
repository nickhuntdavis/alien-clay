// MY OWN MESS (aimat.js): a weapon aims at the enemy nearest another weapon's stuff.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    META.seen = META.seen || {}; for (const id in ENEMY_INTRO) META.seen[id] = 1; for (const R of RIVALS) META.seen['rival_' + R.id] = 1;
    UI.quickStart(); G.nextBoss = 1e9; G.ev.next = 1e9; window.spawnRandom = () => {}; G.enemies.length = 0; G.zones.length = 0; G.proj.length = 0;
    const p = G.player; p.x = 700; p.y = 300;
    G.weapons = [makeSlot('blaster', false, 3), makeSlot('venom', false, 3), null]; G.spells = [makeSlot('blackhole', true, 2), null, null]; recomputeAll();
    const [gun, ven] = G.weapons, hole = G.spells[0];
    const def = Object.values(ENEMIES).find(d => !d.boss && d.ai === 'chase') || Object.values(ENEMIES)[0];
    const mk = (x, y) => { const e = makeEnemy(def, x, y); e.hp = e.maxHp = 1e4; G.enemies.push(e); return e; };
    const near = mk(760, 300), byPud = mk(900, 400), byHole = mk(640, 140);
    const out = {}, F = []; const pick = () => { AIMAT.w = gun; return acquire(gun.dir, 400, p.x, p.y); }, pick_v = w => { AIMAT.w = w; return acquire(aimDir(w), 400, p.x, p.y); };
    gun.dir = 'ownmess'; gun.aimAt = ven.uid;
    out.noMess = pick() === near; if (!out.noMess) F.push('no mess: not nearest');
    G.zones.push({ x: 920, y: 400, r: 50, life: 5, max: 5, dps: 1, elem: 'fire', pull: 0, color: '#fff', tick: 0, src: weaponSrc(ven) });
    G.zones.push({ x: 640, y: 120, r: 90, life: 5, max: 5, dps: 1, elem: 'soul', pull: 100, color: '#fff', tick: 0, src: weaponSrc(hole), spell: 'blackhole' });
    G.zones.push({ x: 765, y: 300, r: 200, life: 5, max: 5, dps: 1, elem: 'fire', pull: 0, color: '#fff', tick: 0, src: { wname: 'enemy puddle' } });
    if (pick() !== byPud) F.push('puddle: wrong target');
    gun.aimAt = hole.uid; if (pick() !== byHole) F.push('black hole: wrong target');
    gun.aimAt = 0; if (pick() !== byHole) F.push('any mess: should take the biggest (hole)');
    if (acquireMany(gun.dir, 400, p.x, p.y, 2)[0] !== byHole) F.push('acquireMany: wrong order');
    gun.aimAt = 99999; if (pick() !== byHole || gun.aimAt !== 0) F.push('gone weapon: should fall back to ANY');
    gun.dir = 'nearest'; if (pick() !== near) F.push('nearest broke');
    // a real frame of firing with the mode on
    gun.dir = 'ownmess'; gun.aimAt = hole.uid; gun.cd = 0; gun.lastTarget = null; G.enemies = [near, byPud, byHole]; for (const e of G.enemies) e.speed = 0; updateWeapon(gun, 1 / 60);
    out.lastTarget = gun.lastTarget === byHole ? 'black hole enemy' : gun.lastTarget ? gun.lastTarget.name : 'none';
    if (gun.lastTarget !== byHole) F.push('in play: shot ' + out.lastTarget);
    // as a tie-breaker: ELITES first, then MY OWN MESS (no elites, so the mess decides)
    gun.dir = 'elite'; gun.dir2 = 'ownmess'; gun.aimAt = hole.uid; const tb = pick_v(gun); if (tb !== byHole) F.push('tie-breaker: wrong target ' + aimDir(gun) + ' ' + JSON.stringify(AIMAT.pt) + ' ' + [near, byPud, byHole].map(e => aimEliteTier(e) + '/' + e.dead + '/' + (e === tb)).join(' ')); gun.dir2 = null;
    // a v10 weapon: Standard Issue aims at Nocturnal Emission's real puddles
    if (WEAPONS.v_ice_pool && WEAPONS.v_phys_proj) {
      G.zones.length = 0; G.proj.length = 0;
      const si = makeSlot('v_phys_proj', false, 3), ne = makeSlot('v_ice_pool', false, 3); G.weapons = [si, ne, null]; G.spells = [null, null, null]; recomputeAll();
      const far = mk(980, 300); G.enemies = [near, far]; for (const e of G.enemies) e.speed = 0;
      for (let f = 0; f < 240 && !G.zones.some(z => z.src && z.src.w === ne); f++) { ne.cd = Math.min(ne.cd, 0); updateWeapon(ne, 1 / 60); G.lootQueue = []; update(1 / 60); G.state = 'play'; G.enemies = [near, far]; near.x = 760; near.y = 300; far.x = 980; far.y = 300; }
      const pud = G.zones.find(z => z.src && z.src.w === ne); out.v10puddle = pud ? Math.round(pud.x) + ',' + Math.round(pud.y) : 'none';
      if (pud) { si.dir = 'ownmess'; si.aimAt = ne.uid; const want = Math.hypot(near.x - pud.x, near.y - pud.y) < Math.hypot(far.x - pud.x, far.y - pud.y) ? near : far; AIMAT.w = si; if (acquire(aimDir(si), 600, p.x, p.y) !== want) F.push('v10 puddle: wrong target'); }
      else F.push('v10: Nocturnal Emission left no puddle');
    }
    // the picker shows on the weapon page and in the loadout
    const pk = aimOwnPick(G.weapons[0], 'ownmess'); out.pickChips = (pk.match(/data-aimat/g) || []).length;
    if (out.pickChips !== 1 + G.weapons.concat(G.spells).filter(Boolean).length) F.push('picker: ' + out.pickChips + ' chips');
    if (!DIRECTIVES.find(d => d.id === 'ownmess')) F.push('not in DIRECTIVES');
    out.problems = F; return out;
  });
  console.log(JSON.stringify(r, null, 1)); if (r.problems.length) console.log("FAIL", r.problems.join('; '));
  console.log('ERRORS:', errors.length ? errors : 'none'); await b.close();
})();
