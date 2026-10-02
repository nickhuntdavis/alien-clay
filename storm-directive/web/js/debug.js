'use strict';
// Spawn Prawn - Sample 000: the Lab Bench. A debug level: nothing spawns on its own, nothing races you, and a
// DEBUG panel lets you send in any enemy, boss or event, switch any weapon or spell on and off, and play
// in god mode.

function initDebug() {
  G.debug = { god: true, loot: false, freeze: false, count: 5, elite: false };
  G.nextBoss = 1e12; G.nextWave = 1e12; G.nextPill = 1e12; G.nextYeast = 1e12;
  G.rivalsInit = true; // no race
  G.lootQueue = [];
  G.weapons = [makeSlot('blaster', false, 1)];
  recomputeAll();
}

// Per frame (from update): keep the bench quiet.
function debugTick() {
  const D = G.debug;
  G.ev.next = 1e12;
  if (!D.loot) G.lootQueue.length = 0;
  if (D.god) { G.player.hp = G.P.maxHp; }
}

function debugSpawn(id) {
  const D = G.debug, p = me(), def = ENEMIES[id];
  for (let i = 0; i < D.count && G.enemies.length < CAPS.enemies; i++) {
    const a = Math.random() * TAU, r = rand(260, 380);
    const e = makeEnemy(def, p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, { elite: D.elite });
    if (def.ai === 'yeast') { e.baseR = e.r; e.grow = 1; }
    G.enemies.push(e);
  }
}
function debugBoss(id) {
  if (!G.bossRoster) G.bossRoster = bossRoster();
  G.bossRoster[G.bossCount % BOSSES_PER_RUN] = id;
  if (G.boss && !G.boss.dead) return;
  spawnBoss();
}
function debugWeapon(id, spell) {
  const list = spell ? G.spells : G.weapons, i = list.findIndex(w => w && w.id === id);
  if (i >= 0) list.splice(i, 1);
  else list.push(makeSlot(id, spell, 1));
  if (!spell && !G.weapons.length) G.weapons.push(null);
  recomputeAll(); UI.refreshHud(true);
}
function debugLevel(id, spell, d) {
  const w = (spell ? G.spells : G.weapons).find(o => o && o.id === id);
  if (!w) return;
  const to = Math.max(1, Math.min(MAX_WLVL, w.lvl + d));
  if (d > 0 && !spell) setWeaponLevel(w, to); else w.lvl = to;
  computeStats(w); UI.refreshHud(true);
}

// ---------------------------------------------------------------- the panel
const DBG = { open: false };
function debugPanel() {
  const D = G.debug, el = $('dbgPanel');
  const tog = (k, label) => `<button class="db ${D[k] ? 'on' : ''}" data-tog="${k}">${label}</button>`;
  const has = (id, spell) => (spell ? G.spells : G.weapons).find(w => w && w.id === id);
  let h = `<div class="dbh">LAB BENCH <button class="db" id="dbgClose">CLOSE</button></div>
    <div class="dbr">${tog('god', 'GOD MODE')}${tog('freeze', 'FREEZE TIME')}${tog('loot', 'LOOT BOXES')}<button class="db" data-act="lvl">+5 LEVELS</button><button class="db" data-act="clear">CLEAR ENEMIES</button><button class="db" data-act="heal">HEAL</button></div>
    <h5>SEND ENEMIES <span>${[1, 5, 20].map(n => `<button class="db sm ${D.count === n ? 'on' : ''}" data-count="${n}">x${n}</button>`).join('')}${tog('elite', 'ELITE')}</span></h5>
    <div class="dbr">${Object.keys(ENEMIES).map(id => `<button class="db" data-spawn="${id}">${esc(ENEMIES[id].name)}</button>`).join('')}</div>
    <h5>BOSSES</h5><div class="dbr">${BOSSES.map(b => `<button class="db" data-boss="${b.id}">${esc(b.name)}</button>`).join('')}</div>
    <h5>RUN EVENTS</h5><div class="dbr">${Object.keys(RUN_EVENTS).map(id => `<button class="db" data-ev="${id}">${esc(RUN_EVENTS[id].name)}</button>`).join('')}${tog('dire', 'DIRE')}</div>
    <h5>WEAPONS (tap to switch on or off)</h5><div class="dbr">`;
  for (const id in WEAPONS) { const w = has(id); h += `<span class="dbw ${w ? 'on' : ''}"><button class="db ${w ? 'on' : ''}" data-wep="${id}">${esc(WEAPONS[id].name)}${w ? ' Lv' + w.lvl : ''}</button>${w ? `<button class="db sm" data-lv="${id}" data-d="-1">-</button><button class="db sm" data-lv="${id}" data-d="1">+</button>` : ''}</span>`; }
  h += `</div><h5>SPELLS</h5><div class="dbr">`;
  for (const id in SPELLS) { const w = has(id, true); h += `<span class="dbw ${w ? 'on' : ''}"><button class="db ${w ? 'on' : ''}" data-spell="${id}">${esc(SPELLS[id].name)}${w ? ' Lv' + w.lvl : ''}</button>${w ? `<button class="db sm" data-slv="${id}" data-d="-1">-</button><button class="db sm" data-slv="${id}" data-d="1">+</button>` : ''}</span>`; }
  h += '</div>';
  el.innerHTML = h;
  const y = el.scrollTop;
  el.querySelectorAll('button').forEach(b => b.addEventListener('click', ev => {
    ev.stopPropagation();
    const ds = b.dataset;
    if (b.id === 'dbgClose') { DBG.open = false; el.classList.remove('on'); return; }
    if (ds.tog) D[ds.tog] = !D[ds.tog];
    else if (ds.count) D.count = +ds.count;
    else if (ds.spawn) debugSpawn(ds.spawn);
    else if (ds.boss) debugBoss(ds.boss);
    else if (ds.ev) { const E = RUN_EVENTS[ds.ev], e2 = { id: ds.ev, dire: !!D.dire, left: E.dur, max: E.dur }; if (E.start) { const t = E.start(e2.dire, e2); if (t && t.x != null) e2.target = t; } G.ev.active.push(e2); banner((e2.dire ? 'DIRE ' : '') + E.name, E.color); G.evNote = { text: E.desc(e2.dire), t: 4 }; }
    else if (ds.wep) debugWeapon(ds.wep, false);
    else if (ds.spell) debugWeapon(ds.spell, true);
    else if (ds.lv) debugLevel(ds.lv, false, +ds.d);
    else if (ds.slv) debugLevel(ds.slv, true, +ds.d);
    else if (ds.act === 'lvl') { for (let i = 0; i < 5; i++) gainXp(G.xpNeed / (G.P.xp * XP_PACE * G.evm.xp) + 1); }
    else if (ds.act === 'clear') { for (const e of G.enemies) if (!e.charmed) e.dead = true; G.boss = null; G.ebul.length = 0; }
    else if (ds.act === 'heal') healPlayer(G.P.maxHp);
    sfx('pickup');
    debugPanel(); $('dbgPanel').scrollTop = y;
  }));
}
function toggleDebugPanel() {
  DBG.open = !DBG.open;
  $('dbgPanel').classList.toggle('on', DBG.open);
  if (DBG.open) debugPanel();
}
