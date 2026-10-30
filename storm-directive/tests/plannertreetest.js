// The Loadout Planner (tests/tools/planner): sample branch chips in the rack, and build trees (alternatives as branches, order checks,
// card rules per path, a path into a build). Rebuilds tests/out/loadout-planner.html from the live game first.
const { chromium } = require('playwright');
const { execSync } = require('child_process'), path = require('path');
(async () => {
  execSync('node ' + path.resolve(__dirname, 'tools/planner/planner.js'), { stdio: 'ignore', env: process.env });
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text()); });
  await page.goto('file://' + path.resolve(__dirname, 'out/loadout-planner.html')); await page.waitForTimeout(1200);
  await page.selectOption('#sample', 'baseline'); await page.waitForTimeout(300);
  // 1. Robocop visible in the rack and as a prompt
  await page.click('#tab-branches'); await page.waitForTimeout(200);
  const vis = await page.evaluate(() => ({ rack: [...document.querySelectorAll('#rack .chip b')].map(b => b.textContent).filter(t => /Robocop|Rambo|Dirty Harry/.test(t)), hint: (document.querySelector('.node.smbhint') || {}).innerText }));
  // tap Robocop chip in Build view
  await page.evaluate(() => { const c = [...document.querySelectorAll('#rack .chip')].find(x => x.innerText.startsWith('Robocop')); c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, clientX: 5, clientY: 5 })); window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1, clientX: 5, clientY: 5 })); });
  await page.waitForTimeout(300);
  const built = await page.evaluate(() => ({ smb: JSON.stringify(smbHeld()), onMap: document.querySelector('#stage').innerText.includes('Robocop') }));
  await page.screenshot({ path: path.resolve(__dirname, 'out/pt_build.png') });
  // 2. build tree
  await page.click('#treebtn'); await page.waitForTimeout(400);
  const t0 = await page.evaluate(() => ({ tree: S.tree, hint: !!NODES.pthint, btn: $('#treebtn').textContent, copy: $('#copy').textContent }));
  // seed everything from the sperm's panel
  await page.evaluate(() => { S.sel = 'root'; render(); }); await page.click('#detail [data-pt*="seed"]'); await page.waitForTimeout(500);
  const t1 = await page.evaluate(() => ({ n: ptT().nodes.length, leaves: ptLeaves(), bad: LAST.all.filter(n => n.why).map(n => n.title + ': ' + n.why).slice(0, 5), top: NODES.root.children.map(c => c.title) }));
  await page.screenshot({ path: path.resolve(__dirname, 'out/pt_all.png') });
  // prune: remove Standard Issue, add a modifier under Shotgun via rack tap with Shotgun selected
  const t2 = await page.evaluate(() => {
    const si = Object.values(NODES).find(n => n.kind === 'pt' && n.key === 'w:v_phys_proj'); ptRemove(si.pt.id);
    const sg = Object.values(NODES).find(n => n.kind === 'pt' && n.key === 'w:v_phys_spread'); S.sel = sg.id; render();
    const r1 = dropPlan({ k: 'mod', id: 'range' }, NODES[S.sel]); if (r1.ok) r1.run();
    const bad = dropPlan({ k: 'wbranch', w: 'v_phys_spread', p: 'A', i: 0 }, NODES['root']);
    const okLv6 = (() => { const p = Object.values(NODES).find(n => n.kind === 'pt' && n.key === 'b:v_phys_spread:A'); return dropPlan({ k: 'wbranch', w: 'v_phys_spread', p: 'A', i: 0 }, p); })();
    save(); render();
    return { range: ptT().nodes.some(x => x.key === 'm:range'), refuse: bad.why, dup: okLv6.ok ? 'allowed' : okLv6.why, text: buildText().split('\n').slice(0, 8) };
  });
  // a path to the build
  const t3 = await page.evaluate(() => {
    const leaf = Object.values(NODES).find(n => n.kind === 'pt' && n.key === 'sbc:baseline:Dead on Arrival');
    if (!leaf) return 'no DOA leaf';
    ptToBuild(leaf.pt.id);
    return { tree: S.tree, smb: JSON.stringify(smbHeld()), weapons: S.weapons.map(w => w.id) };
  });
  // rules on a path: Acid bath under Dirty Harry's path is held back
  const t4 = await page.evaluate(() => {
    S.tree = true; ptUi(); const T = ptT(); const hb = T.nodes.find(x => x.key === 'sb:baseline:B'); const id = ptAdd(hb.id, 'f:acid_bath'); const id2 = ptAdd(hb.id, 'f:quick_draw'); render();
    return [NODES['pt' + id].why, NODES['pt' + id2].why];
  });
  await page.evaluate(() => { S.sel = Object.keys(NODES).find(k => NODES[k].key === 'sb:baseline:C'); render(); });
  await page.waitForTimeout(200); await page.screenshot({ path: path.resolve(__dirname, 'out/pt_sel.png') });
  const bad = [], chk = (n, c, i) => { if (!c) bad.push(n + ' ' + JSON.stringify(i)); };
  chk('sample branches in the rack', vis.rack.join() === 'Rambo,Dirty Harry,Robocop', vis.rack);
  chk('a chip puts Robocop on the sperm', JSON.parse(built.smb).p === 'C' && built.onMap, built);
  chk('the tree view', t0.tree && t0.hint && t0.copy === 'Copy tree', t0);
  chk('everything seeds', t1.n > 50 && t1.leaves > 20 && !t1.bad.length && t1.top.includes('Robocop') && t1.top.includes('Standard Issue'), t1);
  chk('a modifier under its weapon', t2.range, t2);
  chk('order is checked', /Needs Sperminator/.test(t2.refuse || ''), t2.refuse);
  chk('no twins under one node', /already here/.test(t2.dup || ''), t2.dup);
  chk('a path becomes a build', t3 && t3.tree === false && JSON.parse(t3.smb).p === 'C' && JSON.parse(t3.smb).mast === 2, t3);
  chk('card rules per path', t4[0] === 'Needs Robocop' && t4[1] === null, t4);
  if (errors.length) console.log('ERRORS', errors.slice(0, 5).join(' | '));
  if (bad.length) console.log('FAIL', bad.join('; ')); else console.log('plannertreetest OK');
  await b.close();
})();
