// Weapon upgrade branches, batch 5 (web/js/wup5.js): Ewww, Gross, Blowing Bubbles, One of These Days, Sister Cousin.
// For every weapon: the three promises (Lv 3), the Lv 6 cards (two per promise plus the wildcard) and the three masteries are
// taken through genLoot({kind:'fork'}), each runs 300+ frames of update(1/60) against enemies with no errors, and each asserts
// its signature (w.w5.fx counters, or a state check). Also checks the card data (names, one-line text, banned words).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 400, height: 860 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await page.goto('file://' + require('path').resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => { window.TUT_OFF = 1; splashEnd(); }); await page.waitForTimeout(300);
  const r = await page.evaluate(() => {
    const bad = [], rows = [];
    const IDS = ['s_redtape', 's_bubble', 's_duedate', 's_seeker'];
    // ---- card data
    for (const id of IDS) {
      const S = WUP[id]; if (!S) { bad.push(id + ' not registered'); continue; }
      for (const k of ['A', 'B', 'C']) {
        const P = S[k]; if (!P) { bad.push(id + ' missing promise ' + k); continue; }
        if (!P.name || !P.lv3 || !P.lv3.desc || !P.lv3.apply) bad.push(id + k + ' lv3');
        if (!P.lv6 || P.lv6.length !== 2 || !P.wild) bad.push(id + k + ' lv6 cards');
        for (const c of [...(P.lv6 || []), P.wild]) if (!c || !c.name || !c.desc || !c.apply) bad.push(id + k + ' card ' + (c && c.name));
        if (!P.costs || !P.shows) bad.push(id + k + ' costs/shows');
      }
      if (!S.lv10 || S.lv10.length !== 3) bad.push(id + ' masteries');
      const all = [S.A, S.B, S.C].flatMap(P => [P.name, P.lv3.desc, ...P.lv6.flatMap(c => [c.name, c.desc]), P.wild.name, P.wild.desc]).concat((S.lv10 || []).flatMap(c => [c.name, c.desc]));
      for (const t of all) { if (/\b(element|elemental|cast)\b/i.test(t) || /\n/.test(t) || /—/.test(t)) bad.push('text: ' + t); }
    }
    // ---- scenario machinery
    const def = Object.values(ENEMIES).find(d => d.ai === 'chase') || Object.values(ENEMIES)[0];
    let W_, slots = [], SC = null, cbs = null;
    const setup = (id, lvl) => {
      UI.sample = 's001'; newGame(); G.state = 'play'; G.lootQueue = []; G.t = 100; G.nextBoss = 1e9; G.ev.next = 1e9;
      G.terrain.list.length = 0; G.terrain.grid = terrainGrid(G.terrain.list);
      G.weapons = [makeSlot(id, false, 1), null, null, null]; recomputeAll(); G.P.maxHp = G.player.hp = 1e6;
      W_ = G.weapons[0]; W_.lvl = lvl || 1; computeStats(W_); G.enemies.length = 0; slots = []; return W_;
    };
    const place = (sl) => {
      const p = G.player, e = makeEnemy(def, p.x + Math.cos(sl.a) * sl.r, p.y + Math.sin(sl.a) * sl.r);
      e.hp = e.maxHp = SC.hp + (SC.hpJit ? Math.floor(Math.random() * SC.hpJit) : 0); if (SC.maxHp) e.maxHp = SC.maxHp; e.speed = 0;
      if (SC.shell) { e.cd = makeDefence(e.maxHp, 'shell', 'normal', { layers: SC.shell }); e.cd.hp = e.hp; }
      if (SC.elite) { e.elite = true; if (SC.big) e.r = SC.big; }
      G.enemies.push(e); sl.e = e;
    };
    const build = (sc) => {
      SC = Object.assign({ shape: 'ring', n: 12, hp: 1e5, frames: 300, pre: 0 }, sc); slots = [];
      for (let i = 0; i < SC.n; i++) {
        let a, r;
        if (SC.shape === 'ring') { a = i / SC.n * TAU; r = 70 + i * 12; }
        else if (SC.shape === 'tight') { a = i / SC.n * TAU; r = 100 + (i % 2) * 14; }
        else if (SC.shape === 'near') { a = i / SC.n * TAU * 0.3; r = 90 + i * 16; }
        else { a = i / SC.n * TAU; r = 120; }
        slots.push({ a, r, e: null });
      }
      if (!SC.pre) for (const sl of slots) place(sl);
    };
    const frame = (f) => {
      const p = G.player;
      G.state = 'play'; G.lootQueue = [];
      if (!SC.swim) { if (SC.x0 == null) { SC.x0 = p.x; SC.y0 = p.y; } p.x = SC.x0; p.y = SC.y0; p.vx = p.vy = 0; }
      const mine = new Set(slots.map(s => s.e));
      for (let i = G.enemies.length - 1; i >= 0; i--) { const e = G.enemies[i]; if (!e.egg && !mine.has(e)) G.enemies.splice(i, 1); }
      for (const sl of slots) {
        if (sl.e && !sl.e.dead && !SC.free) { sl.a += SC.rot || 0; sl.e.x = p.x + Math.cos(sl.a) * sl.r; sl.e.y = p.y + Math.sin(sl.a) * sl.r; }
        if (SC.refill && sl.e && sl.e.dead && f % 20 === 0) place(sl);
      }
      if (cbs) cbs(f);
      update(1 / 60);
      if (f % 25 === 0) render(); // (the cards' drawing runs too)
    };
    const run = (sc, cb) => { build(sc); cbs = cb || null; try { for (let f = 0; f < SC.frames; f++) frame(f); } catch (err) { bad.push((W_ && W_.def.name) + ': ' + err.message + ' ' + (err.stack || '').split('\n')[1]); } cbs = null; };
    const take = (w, lv, title) => { const o = genLoot({ kind: 'fork', w, lv }); const c = o.find(x => x.title === title); if (!c) { bad.push(w.def.name + ' Lv ' + lv + ' fork has no "' + title + '": ' + o.map(x => x.title)); return false; } c.apply(); return true; };
    const dealt = () => Object.values(G.stats.dmg).reduce((a, v) => a + v, 0);
    const T = () => TOYS();
    const bundles = w => T().tapes.filter(B => B.w === w && !B.dead && B.members.length > 1);
    const marked = w => G.enemies.filter(e => !e.dead && e.due && e.due.w === w);
    const heldB = w => T().bubbles.filter(b => b.w === w && !b.dead && b.e);
    const kill1 = e => { e.hp = 1; damageEnemy(e, 50, { elem: 'phys', noCrit: true, wname: 'test' }); };
    const plain = e => damageEnemy(e, 3, { elem: 'phys', noCrit: true, noProc: true, wname: 'test' });
    const manualBubble = (w, e) => { const s = w.s; const bb = { x: e.x, y: e.y, vx: 0, vy: 0, r: e.r + 12, life: s.dur, w, e, seed: 1, heldAt: G.t, film: 0, soaked: 0, w5c: 1 }; e.bubT = G.t + s.dur; T().bubbles.push(bb); return bb; };
    const FOD = { hp: 3, refill: 1, n: 14, shape: 'tight' }, TIGHT = { shape: 'tight', n: 16 };
    let st = null; // per-case scratch
    const ST = () => st;

    // ---- what each card must show: { sc, frames, keys, cb(f, w), chk(w) }
    const X = {
      // ---------------- Ewww, Gross
      'Birds of a Feather': { sc: TIGHT, frames: 400, cb: (f, w) => { for (const B of bundles(w)) st.max = Math.max(st.max, B.members.length); }, chk: w => (w.s.chain === 5 && w.s.jump === 220 && w.s.dur === 3 && st.max >= 5) || `chain ${w.s.chain} jump ${w.s.jump} dur ${w.s.dur} max ${st.max}` },
      'Corporate Merger': { sc: { hp: 1e5, n: 8, shape: 'near' }, frames: 200, keys: ['merge'], cb: (f, w) => { if (f === 30) { tapeUp(w, G.enemies[0], 3); tapeUp(w, G.enemies[5], 3); } } },
      'Group Chat': { sc: TIGHT, frames: 300, keys: ['chat'] },
      'Paper Trail': { sc: TIGHT, frames: 450, keys: ['trail', 'stripsnare'] },
      'Shared Trauma': { sc: TIGHT, frames: 400, keys: ['shared'], cb: (f, w) => { if (f > 60) for (const B of bundles(w)) { B.members[0].snareT = G.t + 3; break; } }, chk: w => w.s.share === 0.2 || 'share ' + w.s.share },
      'Puppet Strings': { sc: TIGHT, frames: 300, keys: ['puppet'], cb: (f, w) => { if (f > 60) for (const B of bundles(w)) { const m = B.members[0]; m.charmed = true; m.charmT = 5; break; } } },
      'Gossip': { sc: { shell: 2, hp: 1e5, shape: 'tight', n: 16 }, frames: 400, keys: ['gossipburn', 'gossiplayer'], cb: (f, w) => {
        if (f === 150) { const B = bundles(w)[0]; if (B) { st.B = B; B.members[0].cd.burnPool = 20; B.members[0].cd.burnT = 3; } }
        if (f === 190 && st.B) st.B.members[1].cd.layers = 1; } },
      'Office Politics': { sc: TIGHT, frames: 400, keys: ['bump'] },
      'Toxic Relationship': { sc: TIGHT, frames: 300, keys: ['snap'], cb: (f, w) => { if (f === 150) { const B = bundles(w)[0]; if (B) { st.B = B; st.mem = B.members.slice(); kill1(B.members[0]); } } }, chk: w => (w.s.share === 0 && st.mem && st.mem.some(e => !e.dead && e.hp <= 75000)) || 'share ' + w.s.share + ' hp ' + (st.mem && st.mem.map(e => Math.round(e.hp)))},
      'Tangled': { sc: TIGHT, frames: 300, keys: ['snap', 'knot'], cb: (f, w) => { if (f === 150) { const B = bundles(w)[0]; if (B) { st.mem = B.members.slice(); kill1(B.members[0]); } } if (st.mem && st.mem.some(e => e.conjT > G.t)) st.conj = 1; }, chk: w => st.conj || 'no Conjoined partner' },
      'Escalation': { sc: TIGHT, frames: 300, keys: ['snap'], cb: (f, w) => { if (f === 150) { const B = bundles(w)[0]; if (B) { st.B = B; st.mem = B.members.slice(); kill1(B.members[0]); } } if (f === 160 && st.B) { const e = st.B.members.find(q => !q.dead); if (e) kill1(e); } }, chk: w => (st.mem && st.mem.some(e => !e.dead && e.hp <= 1e5 - 30000 - 45000 + 1)) || 'hp ' + (st.mem && st.mem.map(e => Math.round(e.hp))) },
      'Lost in the Post': { sc: TIGHT, frames: 360, keys: ['youtaped', 'youshare'], cb: (f, w) => { if (w.w5 && w.w5.you && w.w5.you.until > G.t && f % 15 === 0) { G.player.iframes = 0; hurtPlayer(50, null, null, 'bullet'); } } },
      'Bureaucracy': { sc: TIGHT, frames: 300, chk: w => w.s.share === 0.8 || 'share ' + w.s.share },
      'Red Tape Everywhere': { sc: { hp: 1e5, n: 12 }, frames: 420, keys: ['everywhere'], chk: w => G.enemies.filter(e => !e.dead && e.tape).length >= 10 || 'taped ' + G.enemies.filter(e => e.tape).length },
      'Mutually Assured Destruction': { sc: TIGHT, frames: 300, keys: ['snap', 'mad'], cb: (f, w) => { if (f === 150) { const B = bundles(w)[0]; if (B) { for (const m of B.members.slice(1)) { m.hp = m.maxHp * 0.1; } kill1(B.members[0]); } } } },
      // ---------------- Blowing Bubbles
      'Big Bubble Trouble': { sc: { elite: 1, big: 20, hp: 1e5, n: 8 }, frames: 420, keys: ['caught', 'closing'], chk: w => w.s.count === 1 || 'count ' + w.s.count },
      'Locked In': { sc: { elite: 1, big: 20, hp: 1e5, n: 8 }, frames: 420, keys: ['locked', 'closing'], cb: (f, w) => { for (const b of heldB(w)) if (b.e.elite && E_closeUntil(b.e) > G.t && !toyHold(b.e, 0.016)) st.bad = 1; }, chk: w => !st.bad || 'an elite was free while closing' },
      'Cannonball': { sc: { elite: 1, big: 20, hp: 1e5, n: 8 }, frames: 420, keys: ['caught', 'cannon'], cb: (f, w) => { for (const b of heldB(w)) if (b.e.elite && !(b.w5close && G.t - b.w5close < 1) && !st.popped) { st.popped = 1; bubblePop(b); } for (const e of G.enemies) if (e.thrown) st.thrown = 1; }, chk: w => st.thrown || 'nothing was launched' },
      'Bath Time': { sc: { hp: 1e5, n: 8 }, frames: 420, keys: ['soap', 'skid'], cb: (f, w) => { if (f > 100) { const b = heldB(w)[0]; if (b && !st.popped) { st.popped = 1; bubblePop(b); } } if (w.w5 && w.w5.soap && w.w5.soap[0]) { G.player.x = w.w5.soap[0].x; G.player.y = w.w5.soap[0].y; } }, chk: w => (G.penHasteT > G.t && G.penHasteK >= 1.4) || 'no skid ' + G.penHasteK },
      'Bubble Wrap': { sc: { hp: 1e5, n: 8 }, frames: 360, keys: ['block'], cb: (f, w) => { const b = heldB(w)[0]; if (b && f % 20 === 0) { G.ebul.push({ x: b.x, y: b.y, vx: 0, vy: 0, dmg: 1, r: 5, life: 7, from: 'Test' }); st.b = b; } }, chk: w => (st.b && !st.b.dead && st.b.e) || 'the bubble popped' },
      'Chaperone': { sc: { hp: 1e5, n: 8 }, frames: 360, keys: ['chaperone'] },
      'Return to Sender': { sc: { hp: 1e5, n: 8 }, frames: 420, keys: ['block', 'sender'], cb: (f, w) => { const b = heldB(w)[0]; if (b && f % 8 === 0) G.ebul.push({ x: b.x, y: b.y, vx: 0, vy: 0, dmg: 1, r: 5, life: 7, from: 'Test' }); } },
      'Snow Globe': { sc: { hp: 1e5, n: 8 }, frames: 360, keys: ['snow'], cb: (f, w) => { for (const b of T().bubbles) if (b.w === w && !b.dead && !b.e && f % 3 === 0) G.ebul.push({ x: b.x, y: b.y, vx: 0, vy: 0, dmg: 1, r: 5, life: 7, from: 'Test' }); } },
      'Pop Goes the Prawn': { sc: { hp: 1e5, n: 10, shape: 'tight' }, frames: 360, keys: ['wave'], cb: (f, w) => { if (f > 100 && !st.popped) { const b = heldB(w)[0]; if (b) { st.popped = 1; bubblePop(b); } } if (G.enemies.some(e => e.snareT > G.t)) st.snare = 1; }, chk: w => (w.s.dur === 2 && st.snare) || 'dur ' + w.s.dur + ' snare ' + st.snare },
      'Popcorn': { sc: { hp: 1e5, n: 8, shape: 'tight' }, frames: 300, keys: ['wave', 'chainpop'], cb: (f, w) => { if (f === 60) { const a = G.enemies[0], c = G.enemies[1]; st.b1 = manualBubble(w, a); st.b2 = manualBubble(w, c); c.x = a.x + 30; c.y = a.y; slots[1].free = 1; } if (f === 70 && st.b1) bubblePop(st.b1); }, chk: w => (st.b2 && st.b2.dead) || 'the second bubble stayed' },
      'Stuck Together': { sc: { hp: 1e5, n: 8, shape: 'tight' }, frames: 300, keys: ['wave', 'stuck'], cb: (f, w) => { if (f === 60) { st.b1 = manualBubble(w, G.enemies[0]); } if (f === 70 && st.b1) bubblePop(st.b1); if (G.enemies.some(e => e.conjT > G.t)) st.conj = 1; }, chk: w => st.conj || 'nothing Conjoined' },
      'Bubble Gum': { sc: { hp: 1e5, n: 8 }, frames: 360, keys: ['gumdrop', 'gum'], cb: (f, w) => { if (f > 100 && !st.popped) { const b = heldB(w)[0]; if (b) { st.popped = 1; bubblePop(b); } } } },
      'Cotton Wool': { sc: { hp: 1e5, n: 8 }, frames: 300, keys: ['woolup', 'wool'], cb: (f, w) => { const p = G.player; if (w.w5.wool && w.w5.wool.n === 3 && !st.hit3) { st.hit3 = 1; const hp0 = p.hp; for (let i = 0; i < 3; i++) { p.iframes = 0; hurtPlayer(500, null, null, 'bullet'); } st.same = p.hp === hp0; st.n = w.w5.wool.n; } }, chk: w => (st.same && st.n === 0) || 'hp changed ' + st.same + ' n ' + st.n },
      'Bubble Boy': { sc: { elite: 1, big: 20, hp: 1e5, n: 8 }, frames: 420, keys: ['caught'], chk: w => !(w.w5.fx.closing > 0) || 'a bubble took time to close' },
      'Hamster Ball': { sc: { hp: 1e5, n: 10, shape: 'tight' }, frames: 480, keys: ['hamster'], cb: (f, w) => { for (const b of T().bubbles) if (b.w === w && (b.w5d || 0) >= 1) st.deep = 1; }, chk: w => st.deep || 'no second bubble' },
      // ---------------- One of These Days
      'Any Day Now': { sc: { hp: 1e5, n: 8 }, frames: 400, keys: ['shorten'], cb: (f, w) => { const e = marked(w)[0]; if (e && f % 10 === 0) plain(e); }, chk: w => w.s.count === 1 || 'count ' + w.s.count },
      'Early Delivery': { sc: { hp: 1e5, n: 8 }, frames: 300, keys: ['early'], cb: (f, w) => { const e = marked(w)[0]; if (e && !st.pushed && f > 30) { st.pushed = 1; for (let i = 0; i < 25; i++) plain(e); } } },
      'Short Notice': { sc: { hp: 1e5, n: 8 }, frames: 300, keys: ['stagger'], cb: (f, w) => { const e = marked(w)[0]; if (e && !st.pushed && f > 30) { st.pushed = 1; for (let i = 0; i < 25; i++) plain(e); } } },
      'Gender Reveal': { sc: { hp: 1e5, n: 8 }, frames: 420, keys: ['reveal'], cb: (f, w) => { const e = marked(w)[0]; if (e && e.due.end > G.t + 0.2 && f > 50) e.due.end = G.t + 0.1; } },
      'Multiplying Responsibilities': { sc: { hp: 1e5, n: 10, shape: 'tight' }, frames: 420, keys: ['spread'], cb: (f, w) => { const e = marked(w).find(q => !q.due.weak); if (e && f > 50) e.due.end = G.t + 0.1; if (G.enemies.some(q => q.due && q.due.weak === 1)) st.weak = 1; }, chk: w => (w.s.repeat === 0.3 && st.weak) || 'repeat ' + w.s.repeat + ' weak ' + st.weak },
      'Pass the Parcel': { sc: { hp: 1e5, n: 12, shape: 'tight' }, frames: 480, keys: ['spread'], cb: (f, w) => { if (f > 50) for (const e of marked(w)) if (e.due.end > G.t + 0.3) e.due.end = G.t + 0.3; for (const e of G.enemies) if (e.due && e.due.weak) st.maxWeak = Math.max(st.maxWeak || 0, e.due.weak); }, chk: w => st.maxWeak === 2 || 'max weak ' + st.maxWeak },
      'Rush Hour': { sc: { hp: 1e5, n: 10, shape: 'tight' }, frames: 300, keys: ['rush'], cb: (f, w) => { if (f === 60) { for (const e of G.enemies.slice(0, 3)) dueMark(w, e, true); } if (f === 70) for (const e of marked(w)) e.due.end = G.t + 0.01; } },
      'Morning After': { sc: { hp: 1e5, n: 8, free: 1 }, frames: 300, keys: ['morning'], cb: (f, w) => { const e = marked(w)[0]; if (e && f > 40) { e.x = G.player.x + 3000; e.y = G.player.y; } } },
      'Interest Accrued': { nodmg: 1, sc: { hp: 1e5, n: 8 }, frames: 300, chk: w => (w.s.dur === 8 && w.s.repeat === 0.7) || 'dur ' + w.s.dur + ' repeat ' + w.s.repeat },
      'Compound Interest': { sc: { hp: 1e5, n: 10, shape: 'tight' }, frames: 300, keys: ['kept'], cb: (f, w) => { const e = marked(w)[0]; if (e && !st.k && f > 40) { st.k = 1; kill1(e); } } },
      'Fine Print': { sc: { elite: 1, hp: 1e5, n: 8 }, frames: 420, keys: ['again'], cb: (f, w) => { const e = marked(w)[0]; if (e && e.due.end > G.t + 0.2 && f > 40) e.due.end = G.t + 0.1; } },
      'Postponed': { sc: { hp: 1e5, n: 8 }, frames: 300, keys: ['postponed'], cb: (f, w) => { const p = G.player; if (f === 40) { st.hp0 = p.hp; p.iframes = 0; hurtPlayer(G.P.maxHp * 0.3, null, null, 'bullet'); st.now = p.hp === st.hp0; } if (f === 170) st.later = p.hp < st.hp0; }, chk: w => (st.now && st.later) || 'now ' + st.now + ' later ' + st.later },
      'Labour Day': { sc: { hp: 1e5, n: 8 }, frames: 420, keys: ['labour'], cb: (f, w) => { const e = marked(w)[0]; if (e && e.due.end > G.t + 0.2 && f > 40) e.due.end = G.t + 0.1; } },
      'The Big Day': { sc: { hp: 1e5, n: 8 }, frames: 400, keys: ['bigday'], cb: (f, w) => { const m = marked(w); st.max = Math.max(st.max, m.filter(q => !q.due.weak).length); if (m[0] && wupDmgMul(m[0], { w }) >= 1.5) st.mul = 1; }, chk: w => (w.s.count === 3 && st.mul && st.max === 3) || 'count ' + w.s.count + ' mul ' + st.mul + ' max ' + st.max },
      'Induced': { sc: { hp: 1e5, n: 8 }, frames: 300, keys: ['induced'], chk: w => (w.s.repeat === 1 && w.w5.fx.induced === 1) || 'repeat ' + w.s.repeat + ' induced ' + w.w5.fx.induced },
      // ---------------- Sister Cousin
      'Family Planning': { sc: FOD, frames: 400, keys: ['extra'], chk: w => w.s.dmg < st.base * 0.9 || 'dmg ' + w.s.dmg + ' base ' + st.base },
      'Runts of the Litter': { sc: FOD, frames: 400, keys: ['extra', 'runt'] },
      'Overcrowding': { sc: { hp: 1e5, n: 8 }, frames: 60, cb: (f, w) => { if (f === 20) { const a = G.player, e0 = G.enemies[0]; for (let i = 0; i < 14; i++) spawnProj(w, a.x, a.y, i, weaponSrc(w), { life: 9, max: 9, homing: 0, speed: 1, vx: 0.1, vy: 0, mSplit: 1 }); const pr = spawnProj(w, a.x, a.y, 0, weaponSrc(w), { life: 9, max: 9, homing: 0, speed: 1, vx: 0.1, vy: 0 }); const d = makeEnemy(def, a.x + 500, a.y); d.dead = true; const n0 = G.proj.filter(q => q.w === w && !q.dead).length; modHit(pr, d); st.grew = G.proj.filter(q => q.w === w && !q.dead).length - n0; } }, chk: w => st.grew >= 1 || 'no room: grew ' + st.grew },
      'Hide and Seek': { sc: { hp: 1e5, n: 8 }, frames: 200, keys: ['hid', 'ambush'], cb: (f, w) => { const a = G.player; if (f === 10) spawnProj(w, a.x + 300, a.y + 300, 0, weaponSrc(w), { life: 0.05, max: 0.05, homing: 0 }); if (f === 40 && w.w5.hiders[0]) { const e = G.enemies[0], h = w.w5.hiders[0]; e.x = h.x; e.y = h.y; slots[0].free = 1; SC.free = 1; } if (f > 40) { const h = w.w5.hiders[0]; if (h) { G.enemies[0].x = h.x + 10; G.enemies[0].y = h.y; } } } },
      'The Favourite': { sc: { hp: 400, hpJit: 300, n: 10 }, frames: 300, keys: ['favourite'], cb: (f, w) => { for (const pr of G.proj) if (pr.w === w && pr.tgt && !pr.dead) { st.n++; const live = G.enemies.filter(e => !e.dead && Math.hypot(e.x - pr.x, e.y - pr.y) < 380 && !e.elite); const min = Math.min(...live.map(e => e.hp)); if (pr.tgt.hp > min + 1) st.off++; } }, chk: w => (st.n > 5 && st.off <= st.n * 0.25) || 'targets ' + st.n + ' off ' + st.off },
      'Taste for It': { sc: FOD, frames: 400, keys: ['taste'] },
      'Nepotism': { sc: FOD, frames: 400, keys: ['nepo'] },
      'Sibling Squabble': { sc: { hp: 1e5, n: 8 }, frames: 90, keys: ['squabble'], cb: (f, w) => { const a = G.player; if (f === 5) { spawnProj(w, a.x - 400, a.y - 400, 0, weaponSrc(w), { life: 3, max: 3, homing: 0, speed: 100, vx: 100, vy: 0 }); spawnProj(w, a.x - 350, a.y - 400, Math.PI, weaponSrc(w), { life: 3, max: 3, homing: 0, speed: 100, vx: -100, vy: 0 }); } } },
      'Sibling Rivalry': { sc: { hp: 1e5, n: 8 }, frames: 300, keys: ['rivalry'] },
      'Pack Hunting': { sc: { hp: 1e5, n: 8 }, frames: 300, keys: ['pack'] },
      'Pile-On': { sc: { hp: 1e5, n: 8 }, frames: 120, keys: ['pile'], cb: (f, w) => { if (f === 30) { const e = G.enemies[0]; st.e = e; for (let i = 0; i < 6; i++) spawnProj(w, e.x - 25 - i * 3, e.y, 0, weaponSrc(w), { tgt: e, homing: 9, speed: 400, vx: 400, vy: 0 }); } }, chk: w => (st.e && st.e.bleeds && st.e.bleeds.length === 3) || 'bleeds ' + (st.e && st.e.bleeds && st.e.bleeds.length) },
      'Dinner Time': { sc: { hp: 3, refill: 1, n: 14, shape: 'tight' }, frames: 900, /* (3 kills on one sibling takes longer since levels stopped speeding up firing) */ keys: ['dinner_ready', 'dinner'], cb: (f, w) => { G.player.hp = G.P.maxHp * 0.5; } },
      'Baby Boom': { sc: { hp: 1e5, n: 8 }, frames: 300, keys: ['boom'], cb: (f, w) => { st.max = Math.max(st.max, G.proj.filter(q => q.w === w && !q.dead).length); }, chk: w => st.max <= 24 || 'in flight ' + st.max },
      'Family Reunion': { nodmg: 1, sc: { hp: 1e5, n: 8, free: 1 }, frames: 420, keys: ['reunion'], cb: (f, w) => { const a = G.player; if (f === 5) { for (const e of G.enemies) { e.x = a.x + 3000; } spawnProj(w, a.x, a.y, 0, weaponSrc(w), { life: 0.3, max: 0.3, homing: 0 }); } } },
      'Only Child': { sc: { hp: 40, refill: 1, n: 14, shape: 'tight' }, frames: 500, keys: ['only', 'onlydone'], cb: (f, w) => { for (const pr of G.proj) if (pr.w === w && pr.w5only) st.k = Math.max(st.k, pr.w5k || 0); }, chk: w => (w.s.count === 1 && w.w5.fx.onlydone > 0) || 'count ' + w.s.count + ' done ' + w.w5.fx.onlydone },
    };
    const E_closeUntil = e => (e.w5 && e.w5.closeUntil) || 0;
    // ---- run every card
    for (const id of IDS) {
      const S = WUP[id];
      const cases = [];
      for (const k of ['A', 'B', 'C']) {
        cases.push({ lv: 3, p: k, name: S[k].name });
        for (const c of [...S[k].lv6, S[k].wild]) cases.push({ lv: 6, p: k, name: c.name });
      }
      for (const c of S.lv10) cases.push({ lv: 10, p: c.best[0], name: c.name });
      for (const cs of cases) {
        const x = X[cs.name]; if (!x) { bad.push('no test for ' + cs.name); continue; }
        const w = setup(id, cs.lv === 3 ? 3 : cs.lv === 6 ? 6 : 10);
        st = { max: 0, n: 0, off: 0, k: 0 };
        if (cs.lv > 3) { w.lvl = 3; computeStats(w); if (!take(w, 3, S[cs.p].name)) continue; w.lvl = cs.lv; computeStats(w); }
        else st.base = w.s.dmg;
        if (cs.lv > 3) st.base = w.s.dmg / (cs.name === 'Family Planning' ? 1 : 1);
        if (!take(w, cs.lv, cs.name)) continue;
        run(Object.assign({}, x.sc, x.frames ? { frames: x.frames } : {}), x.cb ? (f => x.cb(f, w)) : null);
        const F = (w.w5 && w.w5.fx) || {}, missing = (x.keys || []).filter(k => !(F[k] > 0));
        if (missing.length) bad.push(`${cs.name} (${w.def.name} Lv ${cs.lv}): no ${missing.join(', ')}; fx ${JSON.stringify(F)}`);
        if (x.chk) { const c = x.chk(w); if (c !== true && (typeof c === 'string' || !c)) bad.push(`${cs.name}: ${c}`); }
        if (!(dealt() > 0) && !x.nodmg) bad.push(`${cs.name}: dealt nothing`);
        rows.push(`${cs.name}:${Object.keys(F).map(k => k + F[k]).join(',')}`);
      }
    }
    // ---- the base Sister Cousin splits on a kill (it starts with the multiplying modifier)
    {
      const w = setup('s_seeker', 1); st = {};
      run({ hp: 3, refill: 1, n: 14, shape: 'tight', frames: 300 }, () => { if (G.proj.some(q => q.w === w && q.mSplit)) st.split = 1; });
      if (!st.split) bad.push('base Sister Cousin never split on a kill');
    }
    return { bad, rows };
  });
  if (process.env.WUP_ROWS) console.log(r.rows.join('\n'));
  console.log(r.rows.length + ' cards ran');
  if (r.bad.length) console.log('FAIL', r.bad.join('\n  '));
  console.log('ERRORS ' + JSON.stringify(errors.slice(0, 5))); await b.close();
  if (r.bad.length || errors.length) process.exit(1);
})();
