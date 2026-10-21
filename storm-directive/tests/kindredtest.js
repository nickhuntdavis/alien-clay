// Kindred spirits (kindred.js, V11): The Race spawns a stranded sample at 05:00 and 10:00, a chevron points to it,
// touching it absorbs it (passive on, weapons into the race pool, META.s10 unlock) and opens CHOOSE YOUR DIFFERENCE
// with its three weapons; the pick goes on a new mount. Race weapon drafts only offer carried samples' weapons.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    META.s10 = { private: 1, ordered: 1, redtail: 1, prawn: 1, alien: 1, beta: 1 }; // (only Alpha never rescued)
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 10;
    genLoot({ kind: 'start' })[0].apply();
    if (!raceOn()) bad.push('not a race');
    // Pool before: Baseline's weapons only.
    const own = r => W24.find(x => x[0] === r)[4];
    if (v10Pool().some(id => own(id) !== 'baseline')) bad.push('pool not limited ' + v10Pool().map(own));
    G.weapons.push(null); G.weapons[1] = makeSlot(w24Starters('baseline')[1], false, 1); recomputeAll(); // (two weapons, two mounts: the rescue grows the third)
    v10Tick(0.016);
    if (G.kin.spirits.length) bad.push('spirit before 02:00');
    G.t = 120; v10Tick(0.016);
    const s = G.kin.spirits[0];
    if (!s) { bad.push('no spirit at 02:00'); return { bad, out }; }
    // Autorun on COLLECT heads for it, whatever else is about.
    { let gx = 0, gy = 0; const p = G.player; G.moveDir = 'collect';
      arGoal(p, 'collect', (x, y, w) => { const d = Math.hypot(x - p.x, y - p.y) || 1; gx += (x - p.x) / d * w; gy += (y - p.y) / d * w; }, () => {});
      const dot = (gx * (s.x - p.x) + gy * (s.y - p.y)) / ((Math.hypot(gx, gy) || 1) * (Math.hypot(s.x - p.x, s.y - p.y) || 1));
      out.collectDot = +dot.toFixed(2); if (!(dot > 0.7)) bad.push('collect does not head for the spirit ' + dot); }
    s.t = KIN.remind + 0.1; v10Tick(0.016); if (!(s.remN > 0)) bad.push('no reminder');
    if (s.id !== 'alpha') bad.push('prefers unrescued: got ' + s.id);
    out.dist = Math.round(Math.hypot(s.x - G.player.x, s.y - G.player.y));
    G.player.x = s.x; G.player.y = s.y; v10Tick(0.016);
    if (G.kin.spirits.length) bad.push('not rescued on touch');
    if (!kinHas('alpha') || !s10Has('alpha') || !s10Has('baseline')) bad.push('passives ' + G.kin.has);
    if (!(META.s10 && META.s10.alpha)) bad.push('not unlocked');
    if (!v10Pool().some(id => own(id) === 'alpha')) bad.push('alpha weapons not in pool');
    const q = G.lootQueue[0];
    if (!q || q.kind !== 'kindred' || draftBox(q) !== true) bad.push('no kindred screen ' + JSON.stringify(q));
    const cards = genLoot({ kind: 'slot', kin: q.id });
    if (cards.slice(0, 3).map(c => c.title).join() !== w24Starters('alpha').map(id => WEAPONS[id].name).join() || cards.length !== 4 || cards[3].title !== WEAPONS[w24Starters('baseline')[2]].name) bad.push('cards ' + cards.map(c => c.title)); // (its three, then your own unpicked starter)
    // Alpha's passive now runs: moving speeds up every weapon.
    G.player.vx = 100; s10Tick(0.016); if (!(G.weapons[0].rateK > 1)) bad.push('alpha passive off');
    const n0 = G.weapons.filter(Boolean).length; cards[0].apply();
    if (G.weapons.filter(Boolean).length !== n0 + 1) bad.push('pick not equipped ' + G.weapons.map(w => w && w.id));
    // Open the real screen once.
    G.weapons[2] = null; G.lootQueue = [q]; UI.openLoot(G.lootQueue.shift());
    out.screen = document.getElementById('dTitle').textContent; out.kick = document.getElementById('dKick').textContent;
    if (out.screen !== 'CHOOSE YOUR DIFFERENCE' || !UI.draft || UI.lootOpts.length !== 4) bad.push('not the weapon draft screen: ' + out.screen);
    // Grafts: your tail is drawn in lengths, yours then Alpha's.
    { const seen = []; const keep = SL_TAIL.alpha; SL_TAIL.alpha = (t, ...r) => { seen.push(t.length); return keep(t, ...r); };
      UI.show('game'); G.state = 'play'; try { drawShip ? render() : 0; } catch (e) { bad.push('render ' + e.message); }
      SL_TAIL.alpha = keep; out.graft = seen.slice(0, 2);
      if (!seen.length) bad.push('no Alpha tail graft'); }
    UI.show('game'); G.state = 'play';
    // 05:00: a second spirit, not Alpha.
    G.t = 300; v10Tick(0.016);
    const s2 = G.kin.spirits[0];
    if (!s2 || s2.id === 'alpha' || s2.id === 'baseline') bad.push('second spirit ' + (s2 && s2.id));
    // Mutations: plain cards; weapon upgrade tiers: the Weapon Draft layout with scenes.
    if (BOX_LOOK_ON || !SIV_DRAFT) bad.push('box looks on or tier screens off');
    // Draw paths: world and chevrons.
    try { v10Draw(); kinPointers(() => {}); } catch (e) { bad.push('draw ' + e.message); }
    // The rescue screen's portrait, then the fusion after a pick and after a skip (pauses, closes on a late tap).
    for (const how of ['pick', 'skip']) {
      UI.show('hud'); G.state = 'play'; G.lootQueue = []; G.weapons[2] = null;
      UI.openLoot({ kind: 'kindred', id: 'redtail', now: true }); UI.lootOpenT -= 1000;
      const pic = document.getElementById('kinPic');
      if (!pic || pic.style.display === 'none' || pic.dataset.slpic !== 'redtail') bad.push(how + ': no portrait');
      if (how === 'pick') UI.pickLoot(0); else document.getElementById('dSkip').click();
      const el = document.getElementById('kinFuse');
      if (!el || el.style.display !== 'flex' || G.state !== 'loot' || !UI.kinFuse) { bad.push(how + ': no fusion ' + G.state); continue; }
      try { kinFuseDraw(el.querySelector('canvas'), UI.kinFuse, 0.5); kinFuseDraw(el.querySelector('canvas'), UI.kinFuse, 1.6); kinFuseDraw(el.querySelector('canvas'), UI.kinFuse, 3); } catch (e) { bad.push('fusion draw ' + e.message); }
      UI.kinFuse.t0 -= 3000; el.onpointerdown({ stopPropagation() {} });
      if (el.style.display !== 'none' || G.state !== 'play') bad.push(how + ': fusion did not close');
    }
    UI.openLoot({ kind: 'slot' }); if (document.getElementById('kinPic').style.display !== 'none') bad.push('portrait on an ordinary draft');
    UI.show('hud'); G.state = 'play';
    // Not a race: no spirits.
    META.profile = 's10_baseline'; UI.sample = 's002'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 400; v10Tick(0.016);
    if (G.kin && G.kin.spirits.length) bad.push('spirit in the Petri Dish');
    // Later marks: 08:00 brings a rescue only with an empty mount.
    { META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; genLoot({ kind: 'start' })[0].apply(); G.weapons.push(null, null); G.weapons[1] = makeSlot(w24Starters('baseline')[1], false, 1);
      G.t = 1; v10Tick(0.016); const K = G.kin; K.n = KIN.at.length; K.spirits = []; G.weapons[2] = makeSlot(w24Starters('baseline')[2], false, 1); G.t = 480; v10Tick(0.016);
      if (K.spirits.length) bad.push('rescue at 08:00 with every mount full');
      G.weapons[2] = null; G.t = 660; v10Tick(0.016); if (!K.spirits.length) bad.push('no rescue at 11:00 with an empty mount');
      if (draftBox({ kind: 'slot', recycled: true }) !== false) bad.push('race still drafts a Recycle replacement'); }
    // Mounts: no level-up weapon drafts in a race; the dish keeps SLOT_LEVELS.
    UI.sample = 's002'; newGame(); G.state = 'play';
    if (!kinSlotLv(12) || !kinSlotLv(5)) bad.push('dish slot levels');
    META.profile = 's10_baseline'; UI.sample = 's001'; newGame(); G.state = 'play';
    if (kinSlotLv(12) || kinSlotLv(5)) bad.push('race slot levels');
    // Skip on a weapon draft: back to play, +2 rerolls, the mount stays empty.
    G.lootQueue = []; genLoot({ kind: 'start' })[0].apply(); G.weapons.push(null); const rr = G.rerolls;
    UI.openLoot({ kind: 'slot' }); UI.lootOpenT -= 1000;
    if (document.getElementById('dTitle').textContent !== 'CHOOSE A WEAPON' || document.getElementById('dSkip').style.display === 'none') bad.push('slot draft head/skip');
    document.getElementById('dSkip').click();
    if (G.state !== 'play' || G.rerolls !== rr + 2 || G.weapons[1] !== null) bad.push('skip ' + G.state + ' ' + G.rerolls);
    UI.openLoot({ kind: 'mutation' }); out.mutHead = document.getElementById('lootTitle').textContent;
    if (G.state === 'loot' && out.mutHead !== 'CHOOSE A MUTATION') bad.push('mutation heading ' + out.mutHead);
    G.state = 'play'; UI.show('hud');
    UI.openLoot({ kind: 'level' }); if (document.getElementById('lootTitle').textContent !== 'CHOOSE AN UPGRADE') bad.push('level heading');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
