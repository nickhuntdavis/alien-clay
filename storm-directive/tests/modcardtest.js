// Modifier cards and Switched at Birth in the draft (modcards.js): modifier cards fit the weapon, rank up to 3 and
// stop at 3 different modifiers a weapon; Switched at Birth is Rare, keeps the weapon, and never comes two drafts running.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], out = {};
    UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = [];
    const wid = W24_IDS.find(i => WEAPONS[i] && WEAPONS[i].v10atk === 'proj' && !WEAPONS[i].sig);
    if (!G.weapons.some(x => !x)) G.weapons.push(null); optNewWeapon(wid, 0).apply();
    const w = G.weapons.find(x => x && x.id === wid);
    if (!w || !w.def.v10atk) { bad.push('no starting v10 weapon'); return { bad, out }; }
    out.weapon = [w.id, w.def.v10atk, w.def.elem];
    // 1. Modifier cards: only fitting ids, rank text, ranks cap at 3.
    const ids = modsFor(w); out.fits = ids.length;
    if (!ids.length) bad.push('no modifier fits ' + w.id);
    const id = ids[0], c1 = modCard(w, id);
    if (c1.tag !== 'MODIFIER' || c1.rarity !== 1 || !/New/.test(c1.sub)) bad.push('first card: ' + JSON.stringify([c1.tag, c1.rarity, c1.sub]));
    c1.apply(); const c2 = modCard(w, id);
    if (c2.rarity !== 2 || !/Rank 1 > 2 of 3/.test(c2.sub) || c2.desc !== MODUP[id][0]) bad.push('rank 2 card: ' + c2.sub + ' ' + c2.desc);
    c2.apply(); modCard(w, id).apply();
    if (modCount(w, id) !== 3) bad.push('rank after three cards: ' + modCount(w, id));
    if (!modCardOk(w, id) || modCard(w, id).tag !== 'MASTERY') bad.push('the mastery (a fourth rank) was not offered');
    G.mmM = ['test']; if (modCardOk(w, id)) bad.push('a second weapon mastery was offered'); G.mmM = [];
    // 2. One modifier per group, in the slots the weapon's level has opened (22 Oct, modmatrix.js).
    for (let i = 0; i < 3; i++) for (const k of modsFor(w)) if (modCardOk(w, k) && !modHas(w, k)) modCard(w, k).apply();
    out.kinds = modKinds(w); out.slots = mmSlots(w);
    if (mmHeld(w).size > mmSlots(w)) bad.push('more groups than open slots');
    if (mmHeld(w).size === mmSlots(w) && modsFor(w).some(k => !modHas(w, k) && modCardOk(w, k))) bad.push('a new group offered with every slot full');
    w.lvl = MM.lvlCap; if (!mmRoom(w)) bad.push('no room at Lv 9 for Chemistry');
    // 3. Per-rank numbers.
    const t = makeSlot('v_phys_proj', false, 1); t.m10 = ['ricochet'];
    const r1 = modV(t, 'ricochet', 'bounces'); t.m10.push('ricochet', 'ricochet'); const r3 = modV(t, 'ricochet', 'bounces');
    if (r1 !== 2 || r3 !== 4) bad.push('ricochet ranks ' + r1 + ' ' + r3);
    // 4. Switched at Birth: Rare, same weapon, new type, level and modifiers kept; WEAPONS entry untouched.
    const lvl = w.lvl, m10 = (w.m10 || []).slice(), base = WEAPONS[w.sid || w.id].elem;
    let sab = null; for (let i = 0; i < 20 && !sab; i++) { const s = sabCard(); if (s && G.weapons.indexOf(w) >= 0) sab = s; }
    if (!sab || sab.rarity !== 2 || sab.tag !== 'SWITCHED AT BIRTH') bad.push('switch card: ' + JSON.stringify(sab && [sab.rarity, sab.tag]));
    const target = G.weapons.find(x => x && sab.title.startsWith(x.def.name));
    sab.apply();
    out.sab = [sab.title, target && target.def.elem];
    if (!target || target.def.elem !== sab.elem) bad.push('type did not change');
    if (target === w && (w.lvl !== Math.min(MM.lvlCap, MM.lvlCap + 1) || (w.m10 || []).join() !== m10.join())) bad.push('switch lost level or modifiers');
    if (WEAPONS[target.sid || target.id].elem !== (target === w ? base : WEAPONS[target.sid || target.id].elem)) bad.push('shared WEAPONS def changed');
    if (weaponSrc(target).elem !== sab.elem) bad.push('hits still use the old type: ' + weaponSrc(target).elem);
    // 5. Never two drafts in a row (a fresh run: a weapon switches once, then it has nothing left to offer).
    newGame(); G.state = 'play'; G.lootQueue = []; if (!G.weapons.some(x => !x)) G.weapons.push(null); optNewWeapon(wid, 0).apply();
    let rows = 0, prev = false;
    for (let i = 0; i < 200; i++) {
      const cs = draftCards(3, i % 2 ? 'chest' : 'level'), has = cs.some(c => c && c.tag === 'SWITCHED AT BIRTH');
      if (has && prev) rows++;
      prev = has;
      if (cs.some(c => !c)) { bad.push('a null card in the draft'); break; }
      if (cs.some(c => c.tag === 'MODIFIER')) out.modSeen = 1;
      if (has) out.sabSeen = (out.sabSeen || 0) + 1;
    }
    if (rows) bad.push('Switched at Birth in two drafts running: ' + rows);
    if (!out.sabSeen) bad.push('Switched at Birth never offered in 200 drafts');
    return { bad, out };
  });
  console.log(JSON.stringify(r.out));
  if (r.bad.length) console.log('FAIL', r.bad.join('; '));
  console.log('ERRORS', JSON.stringify(errors));
  await b.close();
})();
