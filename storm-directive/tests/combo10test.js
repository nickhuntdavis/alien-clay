// Branch combos (combos10.js): each of the 30 is offered only with its two promises, fuses, and its effect fires in play.
// Also: the weapon draft offers a combo partner (even one of an attack type you already hold), and the Lv 3 promise card names the combo.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const only = process.argv[2] || '';
  const r = await page.evaluate(only => {
    const R = {};
    const pid = old => W24_IDS.find(id => wl_old(id) === old);
    const promise = (w, k) => { const c = wupRaise(w, 3).find(x => x.title === WUP[w24Key(w)][k].name); c.apply(); wupRaise(w, 6)[0].apply(); };
    const fresh = () => { UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 200; G.nextBoss = 1e9; if (G.ev) G.ev.next = 1e9; G.enemies = []; G.zones = []; G.proj = []; };
    const roster = Object.keys(ENEMIES).filter(k => ENEMIES[k].hp && !ENEMIES[k].boss && ENEMIES[k].ai !== 'phase');
    const run = c => {
      fresh();
      const A = makeSlot(pid(c.a), false, 1), B = makeSlot(pid(c.b), false, 1);
      G.weapons = [A, B, null]; recomputeAll();
      const wrongA = ['A', 'B', 'C'].find(k => k !== c.pa);
      promise(A, wrongA); promise(B, c.pb);
      const gated = !availableCombos().some(x => x.id === c.id);
      fresh(); const A2 = makeSlot(pid(c.a), false, 1), B2 = makeSlot(pid(c.b), false, 1); G.weapons = [A2, B2, null]; recomputeAll();
      promise(B2, c.pb);
      const hint = wupRaise(A2, 3).find(x => x.title === WUP[w24Key(A2)][c.pa].name);
      const hinted = !!(hint && hint.c10 && hint.desc.includes(c.name));
      hint.apply(); wupRaise(A2, 6)[0].apply();
      const offered = availableCombos().some(x => x.id === c.id) && A2.lvl >= COMBO_LEVEL && B2.lvl >= COMBO_LEVEL;
      optCombo(c).apply();
      G.lootQueue = []; G.P.maxHp = 1e6; G.player.hp = 1e6; G.stats.dmg = {}; G.c10n = {};
      let n = 0;
      for (let f = 0; f < 30 * 30; f++) {
        G.lootQueue = []; G.player.hp = 1e6; G.player.r = G.player.r || 10;
        if (f % 15 === 0 && G.enemies.filter(e => !e.dead).length < 26) for (let i = 0; i < 4; i++) {
          const a = Math.random() * 6.28, e = makeEnemy(ENEMIES[pick(roster)], G.player.x + Math.cos(a) * rand(90, 280), G.player.y + Math.sin(a) * rand(90, 280), { elite: i === 0 && f % 90 === 0 });
          e.hp = e.maxHp = 300; G.enemies.push(e);
        }
        if (f % 20 === 0) for (let i = 0; i < 6; i++) { const a = Math.random() * 6.28; G.ebul.push({ x: G.player.x + Math.cos(a) * 60, y: G.player.y + Math.sin(a) * 60, vx: -Math.cos(a) * 200, vy: -Math.sin(a) * 200, r: 4, dmg: 5, life: 2, owner: G.enemies[i] || null, dead: false }); }
        if (c.id === 'c10_blanket' && f % 30 === 0) for (const e of G.enemies.slice(0, 4)) e.fearT = G.t + 2;
        if (c.id === 'c10_noyou' && f % 120 === 0) G.peek = { x: G.player.x, y: G.player.y, t: G.t + 2, w: B2, boo: false };
        if (c.id === 'c10_party' && f % 120 === 0) { (A2.q || (A2.q = [])).push(1, 1, 1); }
        // swim in a figure of eight (crosses its own trail)
        G.player.x += Math.cos(f / 20) * 5; G.player.y += Math.sin(f / 10) * 5; G.player.vx = Math.cos(f / 20) * 150; G.player.vy = Math.sin(f / 10) * 150;
        update(1 / 30); G.state = 'play';
      }
      n = (G.c10n || {})[c.id] || 0;
      const dmg = G.stats.dmg || {}, key = Object.keys(dmg).find(k => k.includes(c.name));
      return { gated, hinted, offered, fx: n, dmg: Math.round(key ? dmg[key] : 0), err: (G.c10err || []).slice(0, 2).join(' ; ') };
    };
    // (some combos need the arena to line up: up to 3 tries each)
    for (const c of C10.filter(c => !only || c.id === only)) { let x, t = 0; do { x = run(c); t++; } while (!(x.fx > 0) && t < 3); x.tries = t; R[c.id] = x; }
    // The weapon draft: holding Standard Issue (Projectile), one card is a partner, even Little Prick (also Projectile).
    let partner = 0;
    for (let i = 0; i < 20; i++) {
      fresh(); G.weapons = [makeSlot('v_phys_proj', false, 1), null, null]; recomputeAll();
      const o = v10Loot({ kind: 'slot' }), names = o.map(x => x.def && x.def.name);
      if (names.includes('Little Prick')) partner++;
    }
    R.draft = { partnerOffered: partner + '/20' };
    return R;
  }, only);
  let bad = 0;
  for (const k in r) {
    console.log(k, JSON.stringify(r[k]));
    if (k === 'draft') { if (r[k].partnerOffered !== '20/20') bad++; continue; }
    if (!r[k].gated || !r[k].hinted || !r[k].offered || !(r[k].fx > 0) || r[k].err) bad++;
  }
  console.log('ERRORS:', errors.length ? [...new Set(errors)].slice(0, 5).join('\n') : 'none', bad ? 'FAIL ' + bad + ' broken' : 'PASS');
  await b.close();
})();
