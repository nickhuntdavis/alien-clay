'use strict';
// Storm Directive - DOM UI: title, HUD slots, loot boxes, pause/directive editor, game over.

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const UI = {
  safeTop: 0,
  hudT: 0,
  lootReq: null,
  lootOpts: null,

  init() {
    const probe = $('safeProbe');
    UI.safeTop = probe ? parseFloat(getComputedStyle(probe).paddingTop) || 0 : 0;
    $('hudTop').style.top = UI.safeTop + 'px';
    // Build HUD slots.
    const ws = $('wslots'), ss = $('sslots');
    for (let i = 0; i < 3; i++) ws.appendChild(UI.makeSlotEl('w', i));
    for (let i = 0; i < 2; i++) ss.appendChild(UI.makeSlotEl('s', i));
    $('moveBtn').addEventListener('click', () => {
      if (!G) return;
      const i = MOVE_DIRECTIVES.findIndex(m => m.id === G.moveDir);
      G.moveDir = MOVE_DIRECTIVES[(i + 1) % MOVE_DIRECTIVES.length].id;
      UI.toast('AUTORUN: ' + MOVE_DIRECTIVES.find(m => m.id === G.moveDir).name);
      UI.refreshHud(true);
    });
    $('pauseBtn').addEventListener('click', () => UI.togglePause());
    $('playBtn').addEventListener('click', () => UI.startGame());
    $('howBtn').addEventListener('click', () => $('how').classList.toggle('open'));
    $('rerollBtn').addEventListener('click', () => UI.reroll());
    $('resumeBtn').addEventListener('click', () => UI.togglePause());
    $('quitBtn').addEventListener('click', () => { G = null; UI.show('title'); UI.renderBest(); });
    $('soundBtn').addEventListener('click', () => {
      AUDIO.on = !AUDIO.on;
      try { localStorage.setItem('sd_sound', AUDIO.on ? '1' : '0'); } catch (e) { /* ignore */ }
      $('soundBtn').textContent = 'SOUND: ' + (AUDIO.on ? 'ON' : 'OFF');
    });
    $('soundBtn').textContent = 'SOUND: ' + (AUDIO.on ? 'ON' : 'OFF');
    $('againBtn').addEventListener('click', () => UI.startGame());
    $('titleBtn').addEventListener('click', () => { G = null; UI.show('title'); UI.renderBest(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.state === 'play') UI.togglePause(); });
    UI.renderBest();
    UI.show('title');
  },

  show(name) {
    for (const id of ['title', 'loot', 'pause', 'over']) $(id).classList.toggle('on', id === name);
    $('hud').classList.toggle('on', name === null || name === 'hud');
  },

  startGame() {
    initAudio();
    newGame();
    UI.show('hud');
    UI.refreshHud(true);
  },

  makeSlotEl(kind, i) {
    const el = document.createElement('div');
    el.className = 'slot ' + (kind === 's' ? 'spell' : 'weapon');
    el.innerHTML = '<div class="ico"></div><div class="lv"></div><div class="dir"></div><div class="bar"><i></i></div>';
    el.addEventListener('click', () => {
      if (!G) return;
      const w = kind === 'w' ? G.weapons[i] : G.spells[i];
      if (!w) { UI.toast(kind === 'w' ? 'Empty weapon slot: level up to fill it' : 'Empty spell slot: find a spell in a loot box'); return; }
      if (w.def.noTarget) { UI.toast(w.def.name + ' is self-cast (no targeting)'); return; }
      const idx = DIRECTIVES.findIndex(d => d.id === w.dir);
      w.dir = DIRECTIVES[(idx + 1) % DIRECTIVES.length].id;
      UI.toast(w.def.name + ' > ' + DIRECTIVES.find(d => d.id === w.dir).name);
      UI.refreshHud(true);
    });
    return el;
  },

  refreshHud(full) {
    if (!G) return;
    const wEls = $('wslots').children, sEls = $('sslots').children;
    const fill = (el, w) => {
      if (!w) {
        if (el.dataset.k !== 'empty') { el.dataset.k = 'empty'; el.classList.add('empty'); el.querySelector('.ico').textContent = '+'; el.querySelector('.lv').textContent = ''; el.querySelector('.dir').textContent = 'EMPTY'; el.style.setProperty('--c', '#445'); }
        el.querySelector('.bar i').style.width = '0%';
        return;
      }
      const key = w.uid + ':' + w.lvl + ':' + w.dir;
      if (full || el.dataset.k !== key) {
        el.dataset.k = key;
        el.classList.remove('empty');
        el.style.setProperty('--c', w.def.color);
        el.querySelector('.ico').textContent = w.def.icon;
        el.querySelector('.lv').textContent = 'Lv' + w.lvl;
        el.querySelector('.dir').textContent = w.def.noTarget ? 'AUTO' : DIRECTIVES.find(d => d.id === w.dir).short;
        el.classList.toggle('merged', !!w.def.merged);
      }
      let frac, reloading = false;
      if (w.isSpell) frac = 1 - Math.max(0, w.cd) / (w.reloadMax || 1);
      else if (w.def.kind === 'orbit') { reloading = w.reloadT > 0; frac = reloading ? 1 - w.reloadT / w.reloadMax : w.active / w.s.dur; }
      else if (w.reloadT > 0) { reloading = true; frac = 1 - w.reloadT / w.reloadMax; }
      else frac = w.ammo / w.s.mag;
      el.classList.toggle('reloading', reloading);
      el.querySelector('.bar i').style.width = (clamp(frac, 0, 1) * 100).toFixed(0) + '%';
    };
    for (let i = 0; i < 3; i++) fill(wEls[i], G.weapons[i]);
    for (let i = 0; i < 2; i++) fill(sEls[i], G.spells[i]);
    $('moveBtn').textContent = 'RUN: ' + MOVE_DIRECTIVES.find(m => m.id === G.moveDir).name;
  },

  tick(dt) {
    UI.hudT -= dt;
    if (UI.hudT <= 0 && G && G.state === 'play') { UI.hudT = 0.08; UI.refreshHud(false); }
    if (UI.toastT > 0) { UI.toastT -= dt; if (UI.toastT <= 0) $('toast').classList.remove('on'); }
  },

  toast(msg) {
    const t = $('toast');
    t.textContent = msg; t.classList.add('on');
    UI.toastT = 1.6;
  },

  // ---------------------------------------------------------------- loot
  openLoot(req) {
    G.state = 'loot';
    UI.lootReq = req;
    UI.lootOpts = genLoot(req);
    const titles = {
      start: ['CHOOSE YOUR FIRST WEAPON', 'Every weapon auto-fires using its own targeting directive'],
      level: ['LEVEL ' + G.level + '!', 'Crack open the loot box: pick one'],
      chest: ['LOOT BOX', 'Rare or better guaranteed'],
      boss: ['BOSS CACHE', 'Epic or better guaranteed'],
    };
    $('lootTitle').textContent = titles[req.kind][0];
    $('lootSub').textContent = titles[req.kind][1];
    const box = $('lootBox');
    box.className = 'box ' + req.kind;
    void box.offsetWidth; // restart animation
    box.classList.add('opening');
    $('lootCards').innerHTML = '';
    $('lootCards').classList.remove('ready');
    UI.renderLootCards();
    $('rerollBtn').style.display = req.kind === 'start' ? 'none' : '';
    UI.updateReroll();
    UI.show('loot');
    INPUT.active = false; G.manual = null;
    sfx('level');
    clearTimeout(UI.lootTimer);
    UI.lootTimer = setTimeout(() => $('lootCards').classList.add('ready'), 650);
  },

  renderLootCards() {
    const wrap = $('lootCards');
    wrap.innerHTML = '';
    UI.lootOpts.forEach((o, i) => {
      const r = RARITIES[o.rarity];
      const c = document.createElement('button');
      c.className = 'card r-' + r.id + (o.fusion ? ' fusion' : '');
      c.style.setProperty('--rc', r.color);
      c.style.setProperty('--ic', o.color);
      c.style.animationDelay = (0.45 + i * 0.12) + 's';
      const el = o.elem ? `<span class="el" style="color:${ELEMENTS[o.elem].color}">${ELEMENTS[o.elem].name}</span>` : '';
      c.innerHTML = `<div class="tag">${esc(o.tag)} <b>${esc(r.name)}</b></div>
        <div class="cico">${esc(o.icon)}</div>
        <div class="ctitle">${esc(o.title)}</div>
        <div class="csub">${esc(o.sub)} ${el}</div>
        <div class="cdesc">${esc(o.desc)}</div>`;
      c.addEventListener('click', () => {
        if (!$('lootCards').classList.contains('ready')) return;
        UI.pickLoot(i);
      });
      wrap.appendChild(c);
    });
  },

  pickLoot(i) {
    const o = UI.lootOpts[i];
    o.apply();
    sfx('pickup');
    G.state = 'play';
    UI.show('hud');
    UI.refreshHud(true);
    lastTs = performance.now();
  },

  reroll() {
    if (!G || G.rerolls <= 0 || !$('lootCards').classList.contains('ready')) return;
    G.rerolls--;
    UI.lootOpts = genLoot(UI.lootReq);
    UI.renderLootCards();
    UI.updateReroll();
  },
  updateReroll() { $('rerollBtn').textContent = `REROLL (${G.rerolls})`; $('rerollBtn').disabled = G.rerolls <= 0; },

  // ---------------------------------------------------------------- pause & directives
  togglePause() {
    if (!G) return;
    if (G.state === 'play') { G.state = 'pause'; INPUT.active = false; G.manual = null; UI.renderPause(); UI.show('pause'); }
    else if (G.state === 'pause') { G.state = 'play'; UI.show('hud'); UI.refreshHud(true); lastTs = performance.now(); }
  },

  renderPause() {
    const box = $('pauseBody');
    let h = '';
    h += `<div class="sec"><h3>Autorun directive</h3><div class="chips">`;
    for (const m of MOVE_DIRECTIVES) h += `<button class="chip ${G.moveDir === m.id ? 'sel' : ''}" data-move="${m.id}">${m.name}</button>`;
    h += `</div><p class="hint">${esc(MOVE_DIRECTIVES.find(m => m.id === G.moveDir).desc)}. Drag anywhere on screen to steer manually.</p></div>`;

    h += `<div class="sec"><h3>Loadout and targeting directives</h3>`;
    const all = G.weapons.map((w, i) => ['w', i, w]).concat(G.spells.map((w, i) => ['s', i, w]));
    for (const [k, i, w] of all) {
      if (!w) { h += `<div class="wcard empty">${k === 'w' ? 'Weapon' : 'Spell'} slot ${i + 1}: empty</div>`; continue; }
      const s = w.s, d = w.def;
      const stats = [];
      if (d.kind === 'heal') stats.push(`Heals ${Math.round(s.dmg * 100)}%`);
      else if (s.dmg) stats.push(`DMG ${s.dmg.toFixed(1)}${d.kind === 'beam' || d.kind === 'zone' ? '/s' : ''}`);
      if (s.count > 1) stats.push(`x${s.count}`);
      if (w.isSpell) stats.push(`CD ${s.cd.toFixed(1)}s`);
      else if (d.kind === 'orbit') stats.push(`Active ${s.dur.toFixed(1)}s`, `Recharge ${s.reload.toFixed(1)}s`);
      else stats.push(`Rate ${(1 / s.cd).toFixed(1)}/s`, `Mag ${s.mag}`, `Reload ${s.reload.toFixed(1)}s`);
      if (s.pierce && s.pierce < 90) stats.push(`Pierce ${s.pierce}`);
      if (s.chain) stats.push(`Chain ${s.chain}`);
      if (s.bounce) stats.push(`Bounce ${s.bounce}`);
      if (s.shred) stats.push(`Shred ${s.shred}`);
      if (s.range) stats.push(`Range ${Math.round(s.range)}`);
      const elName = ELEMENTS[d.elem].name + (d.elem2 ? ' / ' + ELEMENTS[d.elem2].name : '');
      h += `<div class="wcard" style="--c:${d.color}"><div class="wh"><span class="wi">${esc(d.icon)}</span><b>${esc(d.name)}</b> <span class="lvl">Lv ${w.lvl}/8</span> <span class="el" style="color:${ELEMENTS[d.elem].color}">${elName}</span>${d.merged ? ' <span class="fz">FUSED</span>' : ''}</div>
        <div class="ws">${stats.join(' | ')}</div>`;
      if (d.noTarget) h += `<div class="hint">Self-cast: fires automatically when useful.</div>`;
      else {
        h += `<div class="chips">`;
        for (const dd of DIRECTIVES) h += `<button class="chip small ${w.dir === dd.id ? 'sel' : ''}" data-k="${k}" data-i="${i}" data-dir="${dd.id}">${dd.name}</button>`;
        h += `</div>`;
      }
      if (!w.isSpell && !d.merged) {
        const ms = MERGES.filter(m => m.a === w.id || m.b === w.id);
        if (ms.length) h += `<div class="hint">Fuses with: ${ms.map(m => { const o = m.a === w.id ? m.b : m.a; return esc(WEAPONS[o].name) + ' > ' + esc(WEAPONS[m.out].name); }).join(', ')} (both Lv ${MERGE_MIN_LEVEL}+)</div>`;
      }
      h += `</div>`;
    }
    h += `</div>`;

    // Synergies.
    h += `<div class="sec"><h3>Element synergies (own 2+ of an element)</h3><div class="list">`;
    for (const el in SYNERGIES) {
      const on = !!G.synergy[el];
      h += `<div class="li ${on ? 'on' : ''}"><b style="color:${ELEMENTS[el].color}">${SYNERGIES[el].name}</b> ${on ? '(ACTIVE)' : ''}<br><span>${ELEMENTS[el].name}: ${esc(SYNERGIES[el].desc)}</span></div>`;
    }
    h += `</div></div>`;

    // Passives.
    const ps = Object.keys(G.passives);
    h += `<div class="sec"><h3>Power-ups</h3>`;
    h += ps.length ? `<div class="list">${ps.map(id => `<div class="li on"><b>${esc(PASSIVES[id].name)}</b> x${G.passives[id]}</div>`).join('')}</div>` : `<p class="hint">None yet.</p>`;
    h += `<p class="hint">Crit ${Math.round(G.P.crit * 100)}% | Crit dmg ${Math.round(G.P.critDmg * 100)}% | Armour ${G.P.armour} | Dodge ${Math.round(G.P.dodge * 100)}% | Speed ${Math.round(G.P.speed * 100)}%</p></div>`;

    // Reactions.
    h += `<div class="sec"><h3>Elemental reactions</h3><div class="list">`;
    for (const id in REACTIONS) h += `<div class="li"><b style="color:${REACTIONS[id].color}">${REACTIONS[id].name}</b> ${G.stats.reactBy[id] ? 'x' + G.stats.reactBy[id] : ''}<br><span>${esc(REACTIONS[id].desc)}</span></div>`;
    h += `</div></div>`;

    // Fusion recipes.
    h += `<div class="sec"><h3>Fusion recipes</h3><div class="list">`;
    for (const m of MERGES) {
      const ha = G.weapons.find(w => w && w.id === m.a), hb = G.weapons.find(w => w && w.id === m.b);
      h += `<div class="li ${ha && hb ? 'on' : ''}"><b style="color:${WEAPONS[m.out].color}">${esc(WEAPONS[m.out].name)}</b><br><span>${esc(WEAPONS[m.a].name)}${ha ? ' (Lv ' + ha.lvl + ')' : ''} + ${esc(WEAPONS[m.b].name)}${hb ? ' (Lv ' + hb.lvl + ')' : ''}</span></div>`;
    }
    h += `</div></div>`;
    box.innerHTML = h;
    box.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => { G.moveDir = b.dataset.move; UI.renderPause(); }));
    box.querySelectorAll('[data-dir]').forEach(b => b.addEventListener('click', () => {
      const w = b.dataset.k === 'w' ? G.weapons[+b.dataset.i] : G.spells[+b.dataset.i];
      if (w) { w.dir = b.dataset.dir; const y = box.scrollTop; UI.renderPause(); box.scrollTop = y; }
    }));
    $('pauseStats').textContent = `Time ${fmtTime(G.t)} | Level ${G.level} | Kills ${G.kills} | Rerolls ${G.rerolls}`;
  },

  // ---------------------------------------------------------------- game over
  showGameOver() {
    const best = UI.loadBest();
    const isBest = G.t > (best.time || 0);
    if (isBest) UI.saveBest({ time: G.t, level: G.level, kills: G.kills });
    const dmg = Object.entries(G.stats.dmg).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const tot = dmg.reduce((a, b) => a + b[1], 0) || 1;
    const hurt = Object.entries(G.stats.hurt).sort((a, b) => b[1] - a[1]).slice(0, 3);
    let h = `<div class="big">${fmtTime(G.t)}</div><div class="hint">${isBest ? 'NEW BEST!' : 'Best: ' + fmtTime(best.time || 0)}</div>
      <div class="hint">Killed by: <b style="color:#ff4d6d">${esc(G.stats.lastHit || 'the storm')}</b>${hurt.length ? ' | Most damage from: ' + hurt.map(x => esc(x[0])).join(', ') : ''}</div>
      <div class="ostats"><div><b>${G.level}</b>Level</div><div><b>${G.kills}</b>Kills</div><div><b>${G.stats.reactions}</b>Reactions</div><div><b>${G.stats.bossKills}</b>Bosses</div></div>
      <h3>Damage breakdown</h3>`;
    for (const [k, v] of dmg) h += `<div class="dmgrow"><span>${esc(k)}</span><i style="width:${(v / tot * 100).toFixed(0)}%"></i><b>${fmtNum(v)}</b></div>`;
    $('overBody').innerHTML = h;
    UI.show('over');
  },

  loadBest() { try { return JSON.parse(localStorage.getItem('sd_best') || '{}'); } catch (e) { return {}; } },
  saveBest(b) { try { localStorage.setItem('sd_best', JSON.stringify(b)); } catch (e) { /* ignore */ } },
  renderBest() {
    const b = UI.loadBest();
    $('bestLine').textContent = b.time ? `Best run: ${fmtTime(b.time)} | Level ${b.level} | ${b.kills} kills` : 'No runs yet. The storm awaits.';
  },
};

function fmtTime(t) { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${s < 10 ? '0' : ''}${s}`; }
function fmtNum(v) { return v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : Math.round(v) + ''; }

// Android back button bridge: returns 'exit' when the app should close.
window.handleBack = function () {
  const on = id => $(id).classList.contains('on');
  if (on('title')) return 'exit';
  if (on('over')) { G = null; UI.show('title'); UI.renderBest(); return 'ok'; }
  if (on('loot')) return 'ok';
  UI.togglePause();
  return 'ok';
};

// Called by the Android shell when the app is backgrounded.
window.onAppPause = function () { if (G && G.state === 'play') UI.togglePause(); };

UI.init();
requestAnimationFrame(frame);
