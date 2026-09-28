'use strict';
// Storm Directive - DOM UI: title, HUD slots, loot boxes, pause/directive editor, game over.

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const UI = {
  safeTop: 0,
  hudT: 0,
  lootReq: null,
  lootOpts: null,
  arm: { k: 'w', i: 0, bar: 0, recycle: false },

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
    $('armClose').addEventListener('click', () => UI.closeArmoury());
    $('armOpen').addEventListener('click', () => { if (G && G.state === 'pause') { G.state = 'play'; UI.openArmoury('w', 0); } });
    $('rewindBtn').addEventListener('click', () => {
      if (!G || G.state !== 'play') return;
      if (G.chrono.charges < 1) { UI.toast('No Rewind charges: kill enemies to charge the Chrono meter'); return; }
      if (G.chrono.snaps.length < 2) { UI.toast('Timeline too short to rewind yet'); return; }
      startRewind(false);
    });
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
    for (const id of ['title', 'loot', 'pause', 'over', 'armoury']) $(id).classList.toggle('on', id === name);
    $('hud').classList.toggle('on', name === null || name === 'hud');
  },

  startGame() {
    initAudio();
    newGame();
    sysLine('start', true);
    UI.msgT = 0; $('sysmsg').classList.remove('on');
    UI.show('hud');
    UI.refreshHud(true);
  },

  makeSlotEl(kind, i) {
    const el = document.createElement('div');
    el.className = 'slot ' + (kind === 's' ? 'spell' : 'weapon');
    el.innerHTML = '<div class="ico"></div><div class="lv"></div><div class="mp"></div><div class="dir"></div><div class="bar"><i></i></div>';
    // Tapping a slot opens the Armoury on that weapon or spell.
    el.addEventListener('click', () => { if (G && G.state === 'play') UI.openArmoury(kind, i); });
    return el;
  },

  refreshHud(full) {
    if (!G) return;
    const wEls = $('wslots').children, sEls = $('sslots').children;
    const fill = (el, w) => {
      if (!w) {
        if (el.dataset.k !== 'empty') { el.dataset.k = 'empty'; el.classList.add('empty'); el.querySelector('.ico').textContent = '+'; el.querySelector('.lv').textContent = ''; el.querySelector('.mp').innerHTML = ''; el.querySelector('.dir').textContent = 'EMPTY'; el.style.setProperty('--c', '#445'); }
        el.querySelector('.bar i').style.width = '0%';
        return;
      }
      const key = w.uid + ':' + w.lvl + ':' + w.dir + ':' + w.mods.length + ':' + w.gachaTier;
      if (full || el.dataset.k !== key) {
        el.dataset.k = key;
        el.classList.remove('empty');
        el.style.setProperty('--c', w.def.gacha ? GACHA_TIERS[w.gachaTier].color : w.def.color);
        el.querySelector('.ico').textContent = w.def.icon;
        el.querySelector('.lv').textContent = 'Lv' + w.lvl;
        el.querySelector('.mp').innerHTML = w.mods.map(m => `<i style="background:${MODS[m.id].color}"></i>`).join('');
        el.querySelector('.dir').textContent = w.def.noTarget ? 'AUTO' : DIRECTIVES.find(d => d.id === w.dir).short + (w.dirs ? ' +2' : '');
        el.classList.toggle('merged', !!w.def.merged);
      }
      let frac, reloading = false;
      if (w.isSpell) frac = 1 - Math.max(0, w.cd) / (w.reloadMax || 1);
      else if (w.def.kind === 'orbit') { reloading = w.reloadT > 0; frac = reloading ? 1 - w.reloadT / w.reloadMax : w.active / w.s.dur; }
      else if (w.def.scrapAmmo) frac = Math.min(1, G.scrap / 30);
      else if (w.def.heat) { reloading = w.reloadT > 0; frac = 1 - w.heat; }
      else if (w.reloadT > 0) { reloading = true; frac = 1 - w.reloadT / w.reloadMax; }
      else frac = w.ammo / w.s.mag;
      el.classList.toggle('reloading', reloading);
      el.querySelector('.bar i').style.width = (clamp(frac, 0, 1) * 100).toFixed(0) + '%';
    };
    for (let i = 0; i < 3; i++) fill(wEls[i], G.weapons[i]);
    for (let i = 0; i < 2; i++) fill(sEls[i], G.spells[i]);
    $('moveBtn').textContent = 'RUN: ' + MOVE_DIRECTIVES.find(m => m.id === G.moveDir).name;
    // Rewind button.
    const c = G.chrono, rb = $('rewindBtn');
    rb.querySelector('.pips').innerHTML = Array.from({ length: c.max }, (_, i) => `<i class="${i < c.charges ? 'on' : ''}"></i>`).join('');
    rb.style.setProperty('--e', (c.charges >= c.max ? 100 : c.energy / CHRONO.energyPerCharge * 100).toFixed(0) + '%');
    rb.classList.toggle('ready', c.charges > 0);
  },

  tick(dt) {
    UI.hudT -= dt;
    if (UI.hudT <= 0 && G && G.state === 'play') { UI.hudT = 0.08; UI.refreshHud(false); }
    if (UI.toastT > 0) { UI.toastT -= dt; if (UI.toastT <= 0) $('toast').classList.remove('on'); }
    // System messages: one at a time, only while playing.
    if (G && G.state === 'play') {
      if (UI.msgT > 0) { UI.msgT -= dt; if (UI.msgT <= 0) $('sysmsg').classList.remove('on'); }
      else if (G.show.msgQ.length) {
        const m = G.show.msgQ.shift(), box = $('sysmsg');
        box.querySelector('b').textContent = m.head; box.querySelector('b').style.color = m.color;
        box.querySelector('span').textContent = m.body;
        box.style.setProperty('--mc', m.color);
        box.classList.remove('on'); void box.offsetWidth; box.classList.add('on');
        UI.msgT = Math.min(6, 2.2 + m.body.length / 30);
      }
    }
  },

  toast(msg) {
    const t = $('toast');
    t.textContent = msg; t.classList.add('on');
    UI.toastT = 1.6;
  },

  // ---------------------------------------------------------------- Armoury (weapon management)
  openArmoury(k, i) {
    if (!G || G.state !== 'play') return;
    G.state = 'armoury';
    INPUT.active = false; G.manual = null;
    UI.arm = { k, i, bar: 0, recycle: false };
    $('armQuip').textContent = pick([
      'Please do not lick the weapons. We have had complaints.',
      'Everything here is legally a gift, so no returns.',
      'Set your directives. The ship does the rest. You do the blaming.',
      'Tip: modifiers stack with anything. So do bad decisions.',
    ]);
    UI.renderArmoury();
    UI.show('armoury');
  },
  closeArmoury() {
    if (!G || G.state !== 'armoury') return;
    G.state = 'play';
    UI.show('hud'); UI.refreshHud(true);
    lastTs = performance.now();
  },
  armSlot() { return UI.arm.k === 'w' ? G.weapons[UI.arm.i] : G.spells[UI.arm.i]; },
  renderArmoury() {
    const A = UI.arm, w = UI.armSlot();
    // Slot tabs.
    let t = '';
    const tab = (k, i, x) => {
      const sel = A.k === k && A.i === i;
      if (!x) return `<button class="atab empty ${sel ? 'sel' : ''}" data-k="${k}" data-i="${i}"><b>+</b><span>${k === 'w' ? 'WEAPON' : 'SPELL'} ${i + 1}</span></button>`;
      return `<button class="atab ${sel ? 'sel' : ''} ${k === 's' ? 'spell' : ''}" data-k="${k}" data-i="${i}" style="--c:${x.def.color}"><b>${esc(x.def.icon)}</b><span>Lv ${x.lvl}</span><em>${x.mods.map(m => `<i style="background:${MODS[m.id].color}"></i>`).join('')}</em></button>`;
    };
    G.weapons.forEach((x, i) => { t += tab('w', i, x); });
    G.spells.forEach((x, i) => { t += tab('s', i, x); });
    $('armTabs').innerHTML = t;
    $('armTabs').querySelectorAll('.atab').forEach(b => b.addEventListener('click', () => { UI.arm = { k: b.dataset.k, i: +b.dataset.i, bar: 0, recycle: false }; UI.renderArmoury(); }));
    const body = $('armBody');
    if (!w) {
      body.innerHTML = `<div class="sec"><p class="hint">${A.k === 'w' ? 'Empty weapon slot. New weapons show up in loot boxes while you have a free slot. Recycle a weapon to make room.' : 'Empty spell slot. Spells show up in loot boxes while you have a free slot.'}</p></div>`;
      return;
    }
    const d = w.def, s = w.s;
    const elName = ELEMENTS[w.mods.find(m => m.id === 'elemental') ? w.mods.find(m => m.id === 'elemental').elem : d.elem].name + (d.elem2 ? ' / ' + ELEMENTS[d.elem2].name : '');
    let h = `<div class="ahead" style="--c:${d.color}"><div class="aico">${esc(d.icon)}</div><div class="ainfo">
      <div class="aname">${esc(d.name)}${d.merged ? ' <span class="fz">FUSED</span>' : ''}</div>
      <div class="asub">${esc(elName)} ${w.isSpell ? 'spell' : 'weapon'} <span class="lpips">${Array.from({ length: 8 }, (_, i) => `<i class="${i < w.lvl ? 'on' : ''}"></i>`).join('')}</span> Lv ${w.lvl}/8</div>
      <div class="adesc">${esc(d.desc)}</div></div></div>`;
    // Stats.
    const tiles = [];
    const T = (label, val) => tiles.push(`<div class="tile"><b>${val}</b><span>${label}</span></div>`);
    if (d.kind === 'heal') T('Heals', Math.round(s.dmg * 100) + '%');
    else if (s.dmg) T(d.kind === 'beam' || d.kind === 'zone' || d.kind === 'wake' ? 'Damage/s' : 'Damage', s.dmg.toFixed(s.dmg < 10 ? 1 : 0));
    if (w.isSpell) T('Cooldown', s.cd.toFixed(1) + 's');
    else if (d.kind === 'orbit') { T('Active', s.dur.toFixed(1) + 's'); T('Recharge', s.reload.toFixed(1) + 's'); }
    else if (d.kind === 'siphon') { T('Fire rate', (1 / s.cd).toFixed(1) + '/s'); T('Bullet store', `${w.stored}/${s.mag}`); T('Absorb radius', Math.round(s.area)); }
    else if (d.heat) { T('Overheat', s.dur.toFixed(1) + 's'); T('Vent cooldown', s.reload.toFixed(1) + 's'); }
    else if (d.kind === 'wake') { T('Trail life', s.dur.toFixed(1) + 's'); T('Trail width', Math.round(s.area)); }
    else {
      if (s.cd) T('Fire rate', (1 / s.cd).toFixed(1) + '/s');
      if (d.scrapAmmo) T('Ammo', Math.floor(G.scrap) + ' scrap'); else { T('Magazine', s.mag); T('Reload', s.reload.toFixed(1) + 's'); }
    }
    if (s.range) T('Range', Math.round(s.range));
    if (s.count > 1) T('Projectiles', s.count);
    if (s.pierce && s.pierce < 90) T('Pierce', s.pierce);
    if (s.bounce) T('Bounces', s.bounce);
    if (s.chain) T('Chain', s.chain);
    if (s.area && d.kind !== 'wake' && d.kind !== 'siphon') T('Area', Math.round(s.area));
    if (!w.isSpell) T('Crit', Math.round(s.crit * 100) + '%');
    h += `<div class="tiles">${tiles.join('')}</div>`;
    // Modifiers.
    if (!w.isSpell) {
      h += `<div class="sec"><h3>Modifiers (${w.mods.length}/${MOD_SLOTS})</h3><div class="mods">`;
      for (let i = 0; i < MOD_SLOTS; i++) {
        const m = w.mods[i];
        if (!m) { h += `<div class="modslot empty">Empty slot. Modifier cards drop from loot boxes.</div>`; continue; }
        const M = MODS[m.id];
        const desc = m.id === 'elemental' ? `Converts this weapon to ${ELEMENTS[m.elem].name} damage.` : M.desc(m.p || 1);
        h += `<div class="modslot" style="--c:${M.color}"><span class="mi">${esc(M.icon)}</span><div><b>${esc(M.name)}</b> <em>power ${(m.p || 1).toFixed(2)}</em><br><span>${esc(desc)}</span></div></div>`;
      }
      const ok = Object.keys(MODS).filter(id => !MODS[id].kinds || MODS[id].kinds.includes(d.kind));
      h += `</div><p class="hint">Can take: ${ok.map(id => MODS[id].name).join(', ')}.</p></div>`;
    }
    // Targeting.
    h += `<div class="sec"><h3>Targeting directive</h3>`;
    if (d.noTarget) h += `<p class="hint">Self-cast. It fires on its own when useful.</p>`;
    else {
      let cur = w.dir;
      if (w.dirs) {
        h += `<div class="chips">${w.dirs.map((dd, bi) => `<button class="chip ${A.bar === bi ? 'sel' : ''}" data-bar="${bi}">BARREL ${bi + 1}: ${DIRECTIVES.find(x => x.id === dd).short}</button>`).join('')}</div>`;
        cur = w.dirs[A.bar];
      }
      h += `<div class="dgrid">${DIRECTIVES.map(dd => `<button class="dbtn ${cur === dd.id ? 'sel' : ''}" data-dir="${dd.id}"><b>${dd.name}</b><span>${esc(dd.desc)}</span></button>`).join('')}</div>`;
    }
    h += `</div>`;
    // Fusion.
    if (!w.isSpell) {
      const ms = MERGES.filter(m => m.a === w.id || m.b === w.id);
      if (ms.length) {
        h += `<div class="sec"><h3>Fusion</h3>`;
        for (const m of ms) {
          const other = m.a === w.id ? m.b : m.a, ow = G.weapons.find(x => x && x.id === other);
          const ready = ow && ow.lvl >= MERGE_MIN_LEVEL && w.lvl >= MERGE_MIN_LEVEL;
          const status = ready ? '<b style="color:#7df9ff">READY: offered in your next loot box</b>' : ow ? `Owned at Lv ${ow.lvl}. Both need Lv ${MERGE_MIN_LEVEL}.` : 'Not owned.';
          h += `<div class="fuse" style="--c:${WEAPONS[m.out].color}"><b>+ ${esc(WEAPONS[other].name)}</b> = <b style="color:${WEAPONS[m.out].color}">${esc(WEAPONS[m.out].name)}</b><br><span>${status}</span></div>`;
        }
        h += `</div>`;
      } else if (d.merged) h += `<div class="sec"><p class="hint">Already fused. It cannot be fused again. We checked. There was a small fire.</p></div>`;
    }
    // Recycle.
    if (A.k === 'w' && G.weapons.filter(Boolean).length > 1) {
      h += `<div class="pbtns"><button class="btn ${A.recycle ? 'danger' : ''}" id="armRecycle">${A.recycle ? 'TAP AGAIN TO RECYCLE (+2 REROLLS)' : 'RECYCLE WEAPON (FREES THE SLOT)'}</button></div>`;
    }
    body.innerHTML = h;
    body.querySelectorAll('[data-bar]').forEach(b => b.addEventListener('click', () => { A.bar = +b.dataset.bar; UI.renderArmoury(); }));
    body.querySelectorAll('[data-dir]').forEach(b => b.addEventListener('click', () => {
      if (w.dirs) { w.dirs[A.bar] = b.dataset.dir; if (A.bar === 0) w.dir = b.dataset.dir; } else w.dir = b.dataset.dir;
      const y = $('armoury').scrollTop; UI.renderArmoury(); $('armoury').scrollTop = y;
    }));
    const rb = $('armRecycle');
    if (rb) rb.addEventListener('click', () => {
      if (!A.recycle) { A.recycle = true; const y = $('armoury').scrollTop; UI.renderArmoury(); $('armoury').scrollTop = y; return; }
      G.weapons[A.i] = null; G.rerolls += 2; recomputeAll();
      achieve('recycle');
      sysMsg('SYSTEM MESSAGE', `${d.name} has been recycled into 2 reroll tokens and a faint smell of regret.`, '#7df9ff', true);
      UI.arm = { k: 'w', i: G.weapons.findIndex(Boolean), bar: 0, recycle: false };
      UI.renderArmoury();
    });
  },

  // ---------------------------------------------------------------- loot
  openLoot(req) {
    G.state = 'loot';
    UI.lootReq = req;
    UI.lootOpts = genLoot(req);
    const titles = {
      start: ['CHOOSE YOUR FIRST WEAPON', 'Complimentary Starter Box. Every weapon fires itself. You just pick the directive and pray.'],
      level: ['LEVEL ' + G.level + '!', pick(['Bronze-or-better Adventurer Box. Pick one. Choose wisely. Or quickly.', 'Adventurer Box! Contents may have shifted during your near-death experience.', 'Adventurer Box. The fans chipped in. Some of them twice.'])],
      chest: ['FAN BOX', pick(['Silver or better. The fans sent this. Some of the fans are very strange.', 'Silver or better. It rattles. That is probably fine.'])],
      boss: ['BOSS BOX', 'Gold or better. Pried from a still-warm corpse. Contents are yours. Smell is extra.'],
    };
    $('lootTitle').textContent = titles[req.kind][0];
    if (req.kind !== 'start') achieve('firstloot');
    if (req.kind === 'level' && Math.random() < 0.3) sysLine('level');
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
      c.className = 'card r-' + r.id + (o.fusion ? ' fusion' : '') + (o.cursed ? ' cursed' : '') + (o.tag.startsWith('MODIFIER') ? ' mod' : '');
      c.style.setProperty('--rc', r.color);
      c.style.setProperty('--ic', o.color);
      c.style.animationDelay = (0.45 + i * 0.12) + 's';
      const el = o.elem ? `<span class="el" style="color:${ELEMENTS[o.elem].color}">${ELEMENTS[o.elem].name}</span>` : '';
      c.innerHTML = `<div class="tag">${esc(o.tag)} <b>${esc(r.name)}</b></div>
        <div class="cico">${esc(o.icon)}</div>
        <div class="ctitle">${esc(o.title)}</div>
        <div class="csub">${esc(o.sub)} ${el}</div>
        <div class="cdesc">${esc(o.desc)}</div>${o.modFor ? `<div class="cfor">For weapon: <b>${esc(o.modFor)}</b></div>` : ''}${o.quip ? `<div class="cquip">${esc(o.quip)}</div>` : ''}`;
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

    h += `<div class="sec"><h3>Time and the Anchor</h3><p class="hint">Rewind charges ${G.chrono.charges}/${G.chrono.max}. The Anchor at the centre of the arena heals you while you stand in its sanctuary (GUARD autorun does this for you).</p>
      <p class="hint"><b>REWIND</b> sends you ${CHRONO.window}s into the past. Your future self stays behind as a Paradox Echo: it retraces the erased timeline backwards firing your weapons, then collapses in a bullet-clearing blast. If you or the Anchor would die with a charge ready, Rewind triggers automatically.</p></div>`;
    // Achievements and the show.
    const got = G.show.order;
    h += `<div class="sec"><h3>Achievements (${got.length}/${Object.keys(ACHIEVEMENTS).length}) | Viewers ${fmtViewers(G.show.viewers)}</h3>`;
    h += got.length ? `<div class="list">${got.map(id => `<div class="li on"><b style="color:#ffd23f">${esc(ACHIEVEMENTS[id].name)}</b><br><span>${esc(ACHIEVEMENTS[id].desc)}</span></div>`).join('')}</div>` : `<p class="hint">None yet. The audience is waiting.</p>`;
    const cur = Object.keys(G.curses);
    if (cur.length) h += `<p class="hint">Curses: ${cur.map(id => esc(CURSES.find(c => c.id === id).name)).join(', ')}</p>`;
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
      if (w) {
        if (b.dataset.bar != null && w.dirs) { w.dirs[+b.dataset.bar] = b.dataset.dir; if (b.dataset.bar === '0') w.dir = b.dataset.dir; }
        else w.dir = b.dataset.dir;
        const y = box.scrollTop; UI.renderPause(); box.scrollTop = y;
      }
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
    let h = `<div class="eulogy">${esc(pick(SYSTEM_LINES.death))}</div><div class="big">${fmtTime(G.t)}</div><div class="hint">${isBest ? 'NEW BEST! The producers are cautiously optimistic.' : 'Best: ' + fmtTime(best.time || 0)} | Peak viewers ${fmtViewers(G.show.peak)}</div>
      <div class="hint">Killed by: <b style="color:#ff4d6d">${esc(G.stats.lastHit || 'the storm')}</b>${hurt.length ? ' | Most damage from: ' + hurt.map(x => esc(x[0])).join(', ') : ''}</div>
      <div class="ostats"><div><b>${G.level}</b>Level</div><div><b>${G.kills}</b>Kills</div><div><b>${G.stats.reactions}</b>Reactions</div><div><b>${G.stats.bossKills}</b>Bosses</div>
      <div><b>${G.stats.rewinds}</b>Rewinds</div><div><b>${G.stats.charms || 0}</b>Allies won</div><div><b>${G.weapons.reduce((a, w) => a + (w ? w.mods.length : 0), 0)}</b>Modifiers</div><div><b>${G.stats.absorbed}</b>Bullets eaten</div></div>
      <h3>Damage breakdown</h3>`;
    for (const [k, v] of dmg) h += `<div class="dmgrow"><span>${esc(k)}</span><i style="width:${(v / tot * 100).toFixed(0)}%"></i><b>${fmtNum(v)}</b></div>`;
    const got = G.show.order;
    h += `<h3>Achievements this run (${got.length})</h3>`;
    h += got.length ? `<div class="list">${got.map(id => `<div class="li on"><b style="color:#ffd23f">${esc(ACHIEVEMENTS[id].name)}</b></div>`).join('')}</div>` : `<p class="hint">None. Impressive, in its own way.</p>`;
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
  if (on('armoury')) { UI.closeArmoury(); return 'ok'; }
  UI.togglePause();
  return 'ok';
};

// Called by the Android shell when the app is backgrounded.
window.onAppPause = function () { if (G && G.state === 'play') UI.togglePause(); };

UI.init();
requestAnimationFrame(frame);
