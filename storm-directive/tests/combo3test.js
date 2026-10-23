// The Armoury/Playpen combos (combos3.js): each is offered at Lv 5, fusing opens a bonus mount, its power deals damage under its own name, and its twist link (src.combo) resolves.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html')); await page.evaluate(() => (window.TUT_OFF = 1, splashEnd())); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const R = {}, IDS = ['c_driveby', 'c_onetwo_deliv', 'c_livemains', 'c_aunties_revenge', 'c_waterdelivery', 'c_towel_snap', 'c_packed_lunch', 'c_guthrie_test'];
    for (const id of IDS) {
      const c = COMBO_BY[id];
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 200; G.nextBoss = 1e9; G.ev.next = 1e9; G.enemies = [];
      G.weapons = [makeSlot(c.a, false, 6), makeSlot(c.b, false, 6), null]; recomputeAll();
      const offered = availableCombos().some(x => x.id === id);
      optCombo(c).apply();
      const mount = G.weapons.length === 4 && G.lootQueue.some(q => q.kind === 'slot');
      G.lootQueue = []; G.P.maxHp = 1e6; G.player.hp = 1e6; G.stats.dmg = {};
      let boil = 0, weak = 0, held = 0, lobs = 0;
      for (let f = 0; f < 30 * 25; f++) {
        G.lootQueue = []; G.player.hp = 1e6;
        if (f % 15 === 0 && G.enemies.length < 30) for (let i = 0; i < 4; i++) { const a = Math.random() * 6.28; const e = makeEnemy(Object.values(ENEMIES)[0], G.player.x + Math.cos(a) * rand(80, 260), G.player.y + Math.sin(a) * rand(80, 260)); e.hp = e.maxHp = 400; if (id === 'c_onetwo_deliv') e.burn = 3; G.enemies.push(e); }
        G.player.x += Math.cos(f / 25) * 4; G.player.y += Math.sin(f / 25) * 4;
        update(1 / 30); G.state = 'play';
        if (G.zones.some(z => z.boilT > G.t)) boil++;
        weak += G.enemies.filter(e => e.weakT > G.t).length ? 1 : 0;
        lobs += G.zones.filter(z => z.cwd).length ? 1 : 0;
      }
      const NAME = { c_driveby: 'Drive-By Pramming', c_onetwo_deliv: 'One-Two Delivery', c_livemains: 'Live Mains', c_aunties_revenge: "Auntie's Revenge", c_waterdelivery: 'Water Delivery', c_towel_snap: 'Locker Room Towel', c_packed_lunch: 'Packed Lunch', c_guthrie_test: 'Guthrie Test' };
      const dmg = G.stats.dmg || {}, key = Object.keys(dmg).find(k => k.includes(NAME[id]));
      R[id] = { offered, mount, linked: comboIdOf(NAME[id]) === id, dmg: Math.round(key ? dmg[key] : 0), boil, weak, pools: lobs, top: Object.entries(dmg).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + ':' + Math.round(v)).join(' ') };
    }
    return R;
  });
  let bad = 0;
  for (const k in r) { console.log(k, JSON.stringify(r[k])); if (!r[k].offered || r[k].mount || !r[k].linked) bad++; /* (no bonus mount since 22 Oct: 3 weapons a run, COMBO_MOUNTS 0) */ }
  console.log('ERRORS:', errors.length ? [...new Set(errors)].slice(0, 5).join('\n') : 'none', bad ? 'FAIL ' + bad + ' combos broken' : '');
  await b.close();
})();
