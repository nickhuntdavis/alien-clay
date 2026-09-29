'use strict';
// UI colour: X-ray neutrals, plus one colour per meaning (see PAL in data.js).
const UI_MEAN = new Set([PAL.you, PAL.danger, PAL.reward, PAL.upgrade, PAL.pickup]);
// A weapon's current type (Element Swap changes it).
function wElem(w) { const m = w.mods && w.mods.find(x => x.id === 'elemental'); return m ? m.elem : w.def.elem; }
function uiCol(c) { const v = col(c); return UI_MEAN.has(v) ? v : XR.white; }
function cardCat(o) {
  if (o.cursed) return PAL.danger;
  if (o.tag === 'SUPPLY') return XR.white;
  return PAL.upgrade; // weapons, spells, levels, fusions, branches, modifiers, power-ups: all permanent build changes
}
// Spawn Prawn - DOM UI: title, HUD slots, loot boxes, Armoury, pause, game over and victory.

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

window.addEventListener('pointerdown', () => { UI.lastDown = performance.now(); }, true);
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
    for (let i = 0; i < 3 + SLOT_LEVELS.length; i++) ws.appendChild(UI.makeSlotEl('w', i));
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
    // Swipe left/right anywhere in the Armoury to move between slots.
    { let sx = 0, sy = 0, t0 = 0;
      $('armoury').addEventListener('touchstart', ev => { const t = ev.touches[0]; sx = t.clientX; sy = t.clientY; t0 = performance.now(); }, { passive: true });
      $('armoury').addEventListener('touchend', ev => {
        const t = ev.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
        if (performance.now() - t0 < 600 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8) UI.armStep(dx < 0 ? 1 : -1);
      }, { passive: true }); }
    $('armOpen').addEventListener('click', () => { if (G && G.state === 'pause') { G.state = 'play'; UI.openArmoury('w', 0); } });
    $('rewindBtn').addEventListener('click', () => {
      if (!G || G.state !== 'play') return;
      if (G.chrono.charges < 1) { UI.toast('No Rewind charges: kill enemies to charge the Chrono meter'); return; }
      if (G.chrono.snaps.length < 2) { UI.toast('Timeline too short to rewind yet'); return; }
      startRewind(false);
    });
    $('playBtn').addEventListener('click', () => UI.openSamples());
    $('sampleBack').addEventListener('click', () => { UI.show('title'); UI.renderBest(); });
    $('howBtn').addEventListener('click', () => $('how').classList.toggle('open'));
    $('rerollBtn').addEventListener('click', () => UI.reroll());
    $('resumeBtn').addEventListener('click', () => UI.togglePause());
    $('quitBtn').addEventListener('click', () => { logRun(G, 'QUIT'); G = null; UI.show('title'); UI.renderBest(); });
    $('setBtnTitle').addEventListener('click', () => UI.openSettings('title'));
    $('setBtnPause').addEventListener('click', () => UI.openSettings('pause'));
    $('setBack').addEventListener('click', () => UI.show(UI.setFrom || 'title'));
    $('bankBtn').addEventListener('click', () => { UI.renderBank(); UI.show('bank'); });
    $('bankBack').addEventListener('click', () => { UI.show('title'); UI.renderBest(); });
    UI.applySettings();
    $('againBtn').addEventListener('click', () => UI.startGame());
    $('copyRunBtn').addEventListener('click', () => {
      const b = $('copyRunBtn'), r = UI.lastRun;
      if (!r) { b.textContent = 'TOO SHORT TO LOG'; return; }
      copyText(`SPAWN PRAWN v${APP_VERSION} - one run\n` + runText(r)).then(ok => { b.textContent = ok ? 'COPIED: PASTE IT IN THE CHAT' : 'COPY BLOCKED: USE SETTINGS > RUN LOG'; });
    });
    $('titleBtn').addEventListener('click', () => { G = null; UI.show('title'); UI.renderBest(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.state === 'play') UI.togglePause(); });
    UI.renderBest();
    UI.show('title');
  },

  lastDown: 0, lootOpenT: 0,
  show(name) {
    for (const id of ['title', 'loot', 'pause', 'over', 'armoury', 'settings', 'bank', 'samples']) $(id).classList.toggle('on', id === name);
    $('hud').classList.toggle('on', name === null || name === 'hud');
  },

  // From the title, the camera dives into the microscope first; tap to skip.
  startGame(intro) {
    initAudio();
    newGame();
    UI.msgT = 0; $('sysmsg').classList.remove('on');
    if (intro) { startIntro(); UI.show('none'); return; }
    UI.afterIntro();
  },
  afterIntro() {
    sysLine('start', true);
    UI.show('hud');
    UI.refreshHud(true);
  },

  makeSlotEl(kind, i) {
    const el = document.createElement('div');
    el.className = 'slot ' + (kind === 's' ? 'spell' : 'weapon');
    el.innerHTML = '<div class="ico"></div><div class="lv"></div><div class="mp"></div><div class="dir"></div><div class="bar"><i></i></div>';
    // Tapping a slot opens the Armoury on that weapon or spell.
    holdable(el, () => {
      const w = G && (kind === 's' ? G.spells[i] : G.weapons[i]);
      if (!w) return `<b>Empty ${kind === 's' ? 'spell' : 'weapon'} slot</b><p>Tap to open the Armoury.</p>`;
      const dr = DIRECTIVES.find(x => x.id === w.dir);
      return `<b style="color:${elemCol(wElem(w))}">${esc(w.def.name)}</b> <em>Lv ${w.lvl}/${MAX_WLVL}</em><p>${esc(w.def.desc)}</p>`
        + (w.s && w.s.dmg ? `<p>Damage ${w.s.dmg.toFixed(w.s.dmg < 10 ? 1 : 0)}${w.s.cd ? ' | ' + (1 / w.s.cd).toFixed(1) + '/s' : ''}${dr ? ' | targets ' + dr.name : ''}</p>` : '')
        + (w.mods.length ? `<p>Mods: ${w.mods.map(m => esc(MODS[m.id].name)).join(', ')}</p>` : '');
    }, () => { if (G && G.state === 'play') UI.openArmoury(kind, i); });
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
        el.style.setProperty('--c', elemCol(wElem(w)));
        el.querySelector('.ico').innerHTML = iconSVG(w.def, w.isSpell ? 18 : 24, elemCol(wElem(w)));
        el.querySelector('.lv').textContent = 'Lv' + w.lvl;
        el.querySelector('.mp').innerHTML = w.mods.map(m => `<i style="background:${PAL.upgrade}"></i>`).join('');
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
    for (let i = 0; i < wEls.length; i++) { wEls[i].style.display = i < G.weapons.length ? '' : 'none'; if (i < G.weapons.length) fill(wEls[i], G.weapons[i]); }
    for (let i = 0; i < 2; i++) fill(sEls[i], G.spells[i]);
    $('moveBtn').textContent = 'RUN: ' + MOVE_DIRECTIVES.find(m => m.id === G.moveDir).name;
    // Keep the Rewind button clear of the HUD as extra weapon rows appear.
    UI.bottomH = $('bottom').offsetHeight;
    $('side').style.bottom = LAYOUT.land ? '' : (UI.bottomH + 12) + 'px';
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
        box.querySelector('b').textContent = m.head; box.querySelector('b').style.color = col(m.color) === PAL.danger ? PAL.danger : XR.dim;
        box.querySelector('span').textContent = m.body;
        box.style.setProperty('--mc', col(m.color) === PAL.danger ? PAL.danger : XR.white); // messages are neutral unless they warn you
        box.classList.remove('on'); void box.offsetWidth; box.classList.add('on');
        UI.msgT = Math.min(6, 2.2 + m.body.length / 30);
      }
    }
  },

  showInfo(html, x, y) {
    const el = $('holdInfo'); el.innerHTML = html; el.classList.add('on');
    const r = el.getBoundingClientRect(), top = Math.max(8 + UI.safeTop, y - r.height - 28);
    el.style.top = (top < y - 40 ? top : Math.min(innerHeight - r.height - 8, y + 28)) + 'px';
  },
  hideInfo() { $('holdInfo').classList.remove('on'); },
  toast(msg) {
    const t = $('toast');
    t.textContent = msg; t.classList.add('on');
    UI.toastT = 1.6;
  },

  // ---------------------------------------------------------------- Settings
  openSettings(from) { UI.setFrom = from; UI.renderSettings(); UI.show('settings'); },
  renderSettings() {
    const body = $('setBody');
    body.innerHTML = SETTINGS_DEF.map(d => `<div class="sec setrow"><h3>${esc(d.label)}</h3>${d.hint ? `<p class="hint">${esc(d.hint)}</p>` : ''}<div class="chips">${d.opts.map(([v, l], i) => `<button class="chip ${SET[d.id] === v ? 'sel' : ''}" data-s="${d.id}" data-i="${i}">${esc(l)}</button>`).join('')}</div></div>`).join('');
    body.innerHTML += `<div class="sec setrow"><h3>Run log</h3><p class="hint">${RUNLOG.length} run${RUNLOG.length === 1 ? '' : 's'} recorded on this phone (${RUNLOG.filter(r => r.res === 'WON').length} born). Copy it and paste it to whoever is balancing the game.</p>
      <div class="chips"><button class="chip" id="logCopy">COPY RUN LOG</button><button class="chip" id="logClear">CLEAR</button></div><p class="hint" id="logMsg"></p><textarea id="logText" readonly style="display:none;width:100%;height:160px;margin-top:8px;background:#000;color:#d6e4f0;font:10px monospace;border:1px solid #ffffff30;border-radius:6px"></textarea></div>`;
    $('logCopy').addEventListener('click', () => {
      const text = runLogText();
      copyText(text).then(ok => {
        if (ok) { $('logMsg').textContent = 'Copied. Paste it into the chat.'; return; }
        // Clipboard blocked: show it so it can be selected by hand.
        const ta = $('logText'); ta.style.display = ''; ta.value = text; ta.focus(); ta.select();
        $('logMsg').textContent = 'Your phone blocked copying: select all the text below and copy it.';
      });
    });
    $('logClear').addEventListener('click', ev => {
      if (!RUNLOG.length) return;
      // Clearing can't be undone: ask for a second tap.
      if (!ev.target.dataset.armed) { ev.target.dataset.armed = '1'; ev.target.textContent = 'TAP AGAIN TO CLEAR'; return; }
      RUNLOG = []; saveRunLog(); UI.renderSettings();
    });
    body.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => {
      const d = SETTINGS_DEF.find(x => x.id === b.dataset.s);
      SET[d.id] = d.opts[+b.dataset.i][0];
      saveSettings(); UI.applySettings();
      const y = $('settings').scrollTop; UI.renderSettings(); $('settings').scrollTop = y;
    }));
  },
  // Push settings into the systems that read them.
  applySettings() {
    AUDIO.on = SET.sound; DOF.on = SET.dof && !SET.clinical;
    applyNarrator();
    document.body.classList.toggle('clinical', !!SET.clinical);
    document.body.classList.toggle('hudmin', SET.hud === 'minimal');
    document.body.classList.toggle('darkfield', !!SET.darkfield);
    if (typeof resetLook === 'function') resetLook();
    if (typeof applyLayout === 'function') applyLayout();
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
      'Set your directives. Your tail does the rest. You do the blaming.',
      'No other swimmer has an Armoury. That is not fair. That is the point.',
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
  armStep(dir) {
    if (!G || G.state !== 'armoury') return;
    const tabs = [...$('armTabs').querySelectorAll('.atab')].map(b => ({ k: b.dataset.k, i: +b.dataset.i }));
    const cur = tabs.findIndex(t => t.k === UI.arm.k && t.i === UI.arm.i);
    const nx = tabs[(cur + dir + tabs.length) % tabs.length];
    UI.arm = { k: nx.k, i: nx.i, bar: 0, recycle: false };
    UI.renderArmoury(); $('armoury').scrollTop = 0;
    const b = $('armBody'); b.classList.remove('swipeL', 'swipeR'); void b.offsetWidth; b.classList.add(dir > 0 ? 'swipeL' : 'swipeR');
  },
  armSlot() { return UI.arm.k === 'w' ? G.weapons[UI.arm.i] : G.spells[UI.arm.i]; },
  renderArmoury() {
    const A = UI.arm, w = UI.armSlot();
    // Slot tabs.
    let t = '';
    const tab = (k, i, x) => {
      const sel = A.k === k && A.i === i;
      if (!x) return `<button class="atab empty ${sel ? 'sel' : ''}" data-k="${k}" data-i="${i}"><b>+</b><span>${k === 'w' ? 'WEAPON' : 'SPELL'} ${i + 1}</span></button>`;
      return `<button class="atab ${sel ? 'sel' : ''} ${k === 's' ? 'spell' : ''}" data-k="${k}" data-i="${i}" style="--c:${elemCol(wElem(x))}"><b>${iconSVG(x.def, 24, elemCol(wElem(x)))}</b><span>Lv ${x.lvl}</span><em>${x.mods.map(m => `<i style="background:${MODS[m.id].color}"></i>`).join('')}</em></button>`;
    };
    G.weapons.forEach((x, i) => { t += tab('w', i, x); });
    for (let i = G.weapons.length; i < 3 + SLOT_LEVELS.length; i++) t += `<button class="atab locked ${A.k === 'w' && A.i === i ? 'sel' : ''}" data-k="w" data-i="${i}"><b>LOCK</b><span>Lv ${SLOT_LEVELS[i - 3]}</span></button>`;
    G.spells.forEach((x, i) => { t += tab('s', i, x); });
    $('armTabs').innerHTML = t;
    $('armTabs').querySelectorAll('.atab').forEach(b => b.addEventListener('click', () => { UI.arm = { k: b.dataset.k, i: +b.dataset.i, bar: 0, recycle: false }; UI.renderArmoury(); }));
    const body = $('armBody');
    if (A.k === 'w' && A.i >= G.weapons.length) {
      body.innerHTML = `<div class="sec"><p class="hint">Locked weapon slot. You grow a new weapon mount at level ${SLOT_LEVELS[A.i - 3]} (you are level ${G.level}). The next DNA strand after that is all new weapons.</p></div>`;
      return;
    }
    if (!w) {
      body.innerHTML = `<div class="sec"><p class="hint">${A.k === 'w' ? 'Empty weapon slot. New weapons show up in DNA strands while you have a free slot. Recycle a weapon to make room.' : 'Empty spell slot. Spells show up in DNA strands while you have a free slot.'}</p></div>`;
      return;
    }
    const d = w.def, s = w.s;
    const elName = ELEMENTS[w.mods.find(m => m.id === 'elemental') ? w.mods.find(m => m.id === 'elemental').elem : d.elem].name + (d.elem2 ? ' / ' + ELEMENTS[d.elem2].name : '');
    let h = `<div class="ahead" style="--c:${elemCol(wElem(w))}"><div class="aico">${iconSVG(d, 34, elemCol(wElem(w)))}</div><div class="ainfo">
      <div class="aname">${esc(d.name)}${d.merged ? ' <span class="fz">FUSED</span>' : ''}</div>
      <div class="asub"><b style="color:${elemCol(wElem(w))}">${esc(elName)}</b> ${w.isSpell ? 'spell' : 'weapon'} <span class="lpips">${Array.from({ length: MAX_WLVL }, (_, i) => `<i class="${i < w.lvl ? 'on' : ''}"></i>`).join('')}</span> Lv ${w.lvl}/${MAX_WLVL}</div>
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
    // Upgrade tree: every level's gains, with a choice of two perks at each milestone.
    if (!w.isSpell) {
      const tree = weaponTree(d);
      // Collapsed by default: where you are, anything waiting on a pick, and the next milestone.
      const nextBranch = PERK_LEVELS.find(l => l > w.lvl);
      const showRow = l => A.full || l === w.lvl || l === w.lvl + 1 || l === nextBranch || (tree[l] && w.lvl >= l && !w.perks[l]);
      h += `<div class="sec"><h3>Upgrade tree</h3><div class="tree">`;
      for (let l = 1; l <= MAX_WLVL; l++) {
        if (!showRow(l)) continue;
        const reached = w.lvl >= l;
        if (tree[l]) {
          const chosen = w.perks[l];
          h += `<div class="trow br ${reached ? 'on' : ''}"><span class="tl">Lv ${l}</span><div class="tps">` + tree[l].map(id => {
            const K = PERKS[id], st = chosen ? (chosen === id ? 'chosen' : 'dim') : reached ? 'pending' : '';
            return `<div class="tp ${st}" style="--c:${PAL.upgrade}"><b><i>${esc(K.icon)}</i>${esc(K.name)}</b><span>${esc(K.desc)}</span></div>`;
          }).join('') + `</div></div>`;
        } else {
          const bonus = l > 1 ? lvBonusText(d, l - 1, l) : '';
          const txt = l === 1 ? 'Base weapon' : `+${Math.round(WEAPON_LV_DMG * 100)}% damage, 5% faster, +12% magazine` + (bonus ? '. ' + bonus : '');
          h += `<div class="trow ${reached ? 'on' : ''}"><span class="tl">Lv ${l}</span><span class="tt">${esc(txt)}</span></div>`;
        }
      }
      h += `</div><button class="chip small" id="treeToggle" style="margin-top:8px">${A.full ? 'SHOW LESS' : 'SHOW FULL TREE (LV 1 TO ' + MAX_WLVL + ')'}</button>`;
      if (A.full) h += `<p class="hint">Branches at Lv ${PERK_LEVELS.slice(0, -1).join(', ')} and a mastery at Lv ${MAX_WLVL}: pick one of three each time.</p>`;
      h += `</div>`;
    }
    // Modifiers.
    if (!w.isSpell) {
      h += `<div class="sec"><h3>Modifiers (${w.mods.length}/${MOD_SLOTS})</h3><div class="mods">`;
      for (let i = 0; i < MOD_SLOTS; i++) {
        const m = w.mods[i];
        if (!m) { h += `<div class="modslot empty">Empty slot. Modifier cards come in DNA strands.</div>`; continue; }
        const M = MODS[m.id];
        const desc = m.id === 'elemental' ? `Converts this weapon to ${ELEMENTS[m.elem].name} damage.` : M.desc(m.p || 1);
        h += `<div class="modslot" style="--c:${PAL.upgrade}"><span class="mi">${esc(M.icon)}</span><div><b>${esc(M.name)}</b> <em>power ${(m.p || 1).toFixed(2)}</em><br><span>${esc(desc)}</span></div></div>`;
      }
      const ok = Object.keys(MODS).filter(id => !MODS[id].kinds || MODS[id].kinds.includes(d.kind));
      const duoRows = DUOS.filter(x => ok.includes(x.a) && ok.includes(x.b)).map(x => {
        const on = s.duos && s.duos.includes(x.name), half = w.mods.some(m => m.id === x.a || m.id === x.b);
        return `<div class="li ${on ? 'on' : ''}"><b style="color:${on ? PAL.upgrade : 'inherit'}">${esc(x.name)}</b> ${on ? '(ACTIVE)' : half ? '(half there)' : ''}<br><span>${esc(MODS[x.a].name)} + ${esc(MODS[x.b].name)}: ${esc(x.desc)}</span></div>`;
      });
      h += `</div><p class="hint">Can take: ${ok.map(id => MODS[id].name).join(', ')}.</p>`;
      if (duoRows.length) h += `<h3 style="margin-top:10px">Combos</h3><div class="list">${duoRows.join('')}</div>`;
      h += `</div>`;
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
          const status = ready ? `<b style="color:${PAL.upgrade}">READY: offered in your next DNA strand</b>` : ow ? `Owned at Lv ${ow.lvl}. Both need Lv ${MERGE_MIN_LEVEL}.` : 'Not owned.';
          h += `<div class="fuse" style="--c:${PAL.upgrade}"><b>+ ${esc(WEAPONS[other].name)}</b> = <b style="color:${PAL.upgrade}">${esc(WEAPONS[m.out].name)}</b><br><span>${status}</span></div>`;
        }
        h += `</div>`;
      } else if (d.merged) h += `<div class="sec"><p class="hint">Already fused. It cannot be fused again. We checked. There was a small fire.</p></div>`;
    }
    // Recycle.
    if (A.k === 'w' && G.weapons.filter(Boolean).length > 1) {
      h += `<div class="sec"><button class="btn ${A.recycle ? 'danger' : ''}" id="armRecycle">${A.recycle ? 'TAP AGAIN TO RECYCLE (+2 REROLLS)' : 'RECYCLE WEAPON (FREES THE SLOT)'}</button></div>`;
    }
    body.innerHTML = h;
    body.querySelectorAll('[data-bar]').forEach(b => b.addEventListener('click', () => { A.bar = +b.dataset.bar; UI.renderArmoury(); }));
    body.querySelectorAll('[data-dir]').forEach(b => b.addEventListener('click', () => {
      if (w.dirs) { w.dirs[A.bar] = b.dataset.dir; if (A.bar === 0) w.dir = b.dataset.dir; } else w.dir = b.dataset.dir;
      const y = $('armoury').scrollTop; UI.renderArmoury(); $('armoury').scrollTop = y;
    }));
    const tt = $('treeToggle');
    if (tt) tt.addEventListener('click', () => { A.full = !A.full; const y = $('armoury').scrollTop; UI.renderArmoury(); $('armoury').scrollTop = y; });
    const rb = $('armRecycle');
    if (rb) rb.addEventListener('click', () => {
      if (!A.recycle) { A.recycle = true; const y = $('armoury').scrollTop; UI.renderArmoury(); $('armoury').scrollTop = y; return; }
      G.weapons[A.i] = null; G.rerolls += 2; recomputeAll();
      achieve('recycle');
      sysMsg('SYSTEM MESSAGE', `${d.name} has been recycled into 2 reroll tokens and a faint smell of regret.`, '#8dffc0', true);
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
      start: ['CHOOSE YOUR FIRST WEAPON', 'Complimentary starter DNA. Yes, sperm can carry guns in their genes now. Do not ask the biology department.'],
      slot: ['NEW WEAPON SLOT!', 'You grew a new weapon mount. Something shiny for it, Silver or better.'],
      level: ['LEVEL ' + G.level + '!', pick(['Bronze-or-better DNA. Splice in one gene. Choose wisely. Or quickly.', 'Fresh DNA! Some base pairs may have shifted during your near-death experience.', 'A strand of DNA. The fans chipped in. Some of them twice.'])],
      chest: ['FAN DNA', pick(['Gold or better. The fans sent this. Some of the fans are very strange.', 'Gold or better. It wriggles. That is probably fine.'])],
      boss: ['BOSS DNA', 'Gold or better. Extracted from a still-warm corpse. The genes are yours now. The smell is extra.'],
      branch: ['UPGRADE BRANCH', 'Your weapon hit a milestone. Pick its new trick. The other one goes in the bin. Forever. No pressure.'],
    };
    if (req.kind === 'branch') { const bw = G.weapons.find(x => x && x.uid === req.uid); if (bw) titles.branch[0] = bw.def.name.toUpperCase() + ': LV ' + req.lvl + ' BRANCH'; }
    $('lootTitle').textContent = titles[req.kind][0];
    if (req.kind !== 'start') achieve('firstloot');
    if (req.kind === 'level' && Math.random() < 0.3) sysLine('level');
    $('lootSub').textContent = lootStory(req) || titles[req.kind][1];
    const box = $('lootBox');
    box.className = 'box ' + req.kind;
    // Loot boxes are gold; a branch choice is an upgrade, so it's cyan.
    const kc = req.kind === 'branch' ? PAL.upgrade : PAL.reward;
    box.style.setProperty('--bc', kc); $('lootTitle').style.color = kc;
    void box.offsetWidth; // restart animation
    box.classList.add('opening');
    $('lootCards').innerHTML = '';
    $('lootCards').classList.remove('ready');
    UI.renderLootCards();
    $('rerollBtn').style.display = req.kind === 'start' || req.kind === 'branch' ? 'none' : '';
    UI.updateReroll();
    UI.show('loot');
    INPUT.active = false; G.manual = null;
    lootSound(req.kind, Math.max(...UI.lootOpts.map(o => o.rarity || 0)), UI.lootOpts.some(o => o.cursed), UI.lootOpts.length);
    clearTimeout(UI.lootTimer);
    UI.lootOpenT = performance.now();
    G.stats.boxes = (G.stats.boxes || 0) + 1;
    UI.lootTimer = setTimeout(() => $('lootCards').classList.add('ready'), 650);
  },

  renderLootCards() {
    const wrap = $('lootCards');
    wrap.innerHTML = '';
    UI.lootOpts.forEach((o, i) => {
      const r = RARITIES[o.rarity];
      const c = document.createElement('button');
      c.className = 'card r-' + r.id + (o.fusion ? ' fusion' : '') + (o.cursed ? ' cursed' : '') + (o.tag.startsWith('MODIFIER') ? ' mod' : '');
      c.style.setProperty('--rc', cardCat(o));
      c.style.setProperty('--ic', cardCat(o));
      c.style.animationDelay = (0.45 + i * 0.12) + 's';
      const el = o.elem ? `<span class="el" style="color:${elemCol(o.elem)}">${ELEMENTS[o.elem].name}</span>` : '';
      c.innerHTML = `<div class="tag">${esc(o.tag)} <b>${esc(r.name)}</b></div>
        <div class="cico"${o.def ? ` style="--ic:${elemCol(o.elem)}"` : ''}>${o.def ? iconSVG(o.def, 28, elemCol(o.elem)) : esc(o.icon)}</div>
        <div class="ctitle">${esc(o.title)}</div>
        <div class="csub">${esc(o.sub)} ${el}</div>
        <div class="cdesc">${esc(firstSentence(o.desc))}</div>${o.modFor ? `<div class="cfor">For weapon: <b>${esc(o.modFor)}</b></div>` : ''}<div class="chold">Hold for details</div>`;
      holdable(c, () => `<b>${esc(o.title)}</b> <em>${esc(o.tag)} | ${esc(r.name)}</em><p>${esc(o.sub)}</p><p>${esc(o.desc)}</p>`
        + (o.modFor ? `<p>For weapon: <b>${esc(o.modFor)}</b></p>` : '') + (o.quip ? `<p><i>${esc(o.quip)}</i></p>` : ''), () => {
        if (!$('lootCards').classList.contains('ready')) return;
        // Only a tap that started on this screen picks a card (not one left over from skipping the intro
        // or steering when the box popped up).
        if (!(UI.lastDown > UI.lootOpenT)) return;
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
    if (G.state === 'play') { G.state = 'pause'; INPUT.active = false; G.manual = null; UI.pauseTab = 'run'; UI.renderPause(); UI.show('pause'); }
    else if (G.state === 'pause') { G.state = 'play'; UI.show('hud'); UI.refreshHud(true); lastTs = performance.now(); }
  },

  renderPause() {
    const box = $('pauseBody'), tab = UI.pauseTab || 'run';
    let h = `<div class="ptabs">${[['run', 'RUN'], ['build', 'BUILD'], ['show', 'THE SHOW'], ['codex', 'CODEX']].map(([id, l]) => `<button class="chip ${tab === id ? 'sel' : ''}" data-ptab="${id}">${l}</button>`).join('')}</div>`;
    if (tab === 'run') {
    h += `<div class="sec"><h3>Autorun directive</h3><div class="chips">`;
    for (const m of MOVE_DIRECTIVES) h += `<button class="chip ${G.moveDir === m.id ? 'sel' : ''}" data-move="${m.id}">${m.name}</button>`;
    h += `</div><p class="hint">${esc(MOVE_DIRECTIVES.find(m => m.id === G.moveDir).desc)}. Drag anywhere on screen to steer manually.</p></div>`;

    h += `<div class="sec"><h3>The race</h3><p class="hint">Sperm count: <b>${spermCount().toLocaleString('en-GB')}</b>. ${G.fertile ? 'It is one. It is you. Swim into the egg.' : G.showdown ? 'The Final Five are here: beat them all and the egg is yours.' : 'It falls as time passes, as you grow and as you kill rival swimmers. At six, the Final Five come for you.'} Weapon slots: ${G.weapons.length}/${3 + SLOT_LEVELS.length} (next at level ${SLOT_LEVELS.find(l => l > G.level) || 'none'}). Rewind charges ${G.chrono.charges}/${G.chrono.max}. The egg's warm glow heals you (NEST autorun keeps you in it).</p>
</div>`;
    }
    if (tab === 'show') {
    // Achievements and the show.
    const got = G.show.order;
    h += `<div class="sec"><h3>Achievements (${got.length}/${Object.keys(ACHIEVEMENTS).length}) | Viewers ${fmtViewers(G.show.viewers)}</h3>`;
    h += got.length ? `<div class="list">${got.map(id => `<div class="li on"><b>${esc(ACHIEVEMENTS[id].name)}</b><br><span>${esc(ACHIEVEMENTS[id].desc)}</span></div>`).join('')}</div>` : `<p class="hint">None yet. The audience is waiting.</p>`;
    const cur = Object.keys(G.curses);
    if (cur.length) h += `<p class="hint">Curses: ${cur.map(id => esc(CURSES.find(c => c.id === id).name)).join(', ')}</p>`;
    h += `</div>`;
    }
    if (tab === 'build') {
    // Synergies.
    h += `<div class="sec"><h3>Element synergies (own 2+ of an element)</h3><div class="list">`;
    for (const el in SYNERGIES) {
      const on = !!G.synergy[el];
      h += `<div class="li ${on ? 'on' : ''}"><b>${SYNERGIES[el].name}</b> ${on ? '(ACTIVE)' : ''}<br><span>${ELEMENTS[el].name}: ${esc(SYNERGIES[el].desc)}</span></div>`;
    }
    h += `</div></div>`;

    // Passives.
    const ps = Object.keys(G.passives);
    h += `<div class="sec"><h3>Power-ups</h3>`;
    h += ps.length ? `<div class="list">${ps.map(id => `<div class="li on"><b>${esc(PASSIVES[id].name)}</b> x${G.passives[id]}</div>`).join('')}</div>` : `<p class="hint">None yet.</p>`;
    h += `<p class="hint">Crit ${Math.round(G.P.crit * 100)}% | Crit dmg ${Math.round(G.P.critDmg * 100)}% | Armour ${G.P.armour} | Dodge ${Math.round(G.P.dodge * 100)}% | Speed ${Math.round(G.P.speed * 100)}% | Traction ${Math.round(G.P.traction * 100)}%</p></div>`;

    }
    if (tab === 'codex') {
    h += `<div class="sec"><h3>Rewind</h3><p class="hint"><b>REWIND</b> sends you ${CHRONO.window}s into the past. Your future self stays behind as a Paradox Echo: it retraces the erased timeline backwards firing your weapons, then collapses in a bullet-clearing blast. If you would die with a charge ready, Rewind triggers automatically.</p></div>`;
    // Reactions.
    h += `<div class="sec"><h3>Elemental reactions</h3><div class="list">`;
    for (const id in REACTIONS) h += `<div class="li"><b>${REACTIONS[id].name}</b> ${G.stats.reactBy[id] ? 'x' + G.stats.reactBy[id] : ''}<br><span>${esc(REACTIONS[id].desc)}</span></div>`;
    h += `</div></div>`;

    // Fusion recipes.
    h += `<div class="sec"><h3>Fusion recipes</h3><div class="list">`;
    for (const m of MERGES) {
      const ha = G.weapons.find(w => w && w.id === m.a), hb = G.weapons.find(w => w && w.id === m.b);
      h += `<div class="li ${ha && hb ? 'on' : ''}"><b style="color:${PAL.upgrade}">${esc(WEAPONS[m.out].name)}</b><br><span>${esc(WEAPONS[m.a].name)}${ha ? ' (Lv ' + ha.lvl + ')' : ''} + ${esc(WEAPONS[m.b].name)}${hb ? ' (Lv ' + hb.lvl + ')' : ''}</span></div>`;
    }
    h += `</div></div>`;
    }
    box.innerHTML = h;
    box.querySelectorAll('[data-ptab]').forEach(b => b.addEventListener('click', () => { UI.pauseTab = b.dataset.ptab; UI.renderPause(); $('pause').scrollTop = 0; }));
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

  // ---------------------------------------------------------------- sample select (levels)
  openSamples() {
    const best = UI.loadBest();
    $('sampleList').innerHTML = SAMPLES.map(s => `<button class="slide ${s.open ? '' : 'locked'}" data-sample="${s.id}">
      <span class="slabel"><b>#${s.no}</b><i>${s.open ? 'IN STOCK' : 'COMING SOON'}</i></span>
      <span class="sglass"><span class="sdrop"></span></span>
      <span class="sinfo"><b>${esc(s.name)}</b><span>${esc(s.desc)}</span>${s.open ? `<em>Count ${s.count} | Motility ${s.motility}${best.born ? ' | Fastest fertilisation ' + fmtTime(best.born) : ''}</em>` : '<em>More to cum.</em>'}</span>
    </button>`).join('');
    $('sampleList').querySelectorAll('.slide').forEach(b => b.addEventListener('click', () => {
      const s = SAMPLES.find(x => x.id === b.dataset.sample);
      if (!s.open) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); return; }
      UI.sample = s.id; UI.startGame(true);
    }));
    UI.show('samples');
  },

  // ---------------------------------------------------------------- Gene Bank (meta progression)
  renderBank() {
    const body = $('bankBody'), gold = PAL.reward, cyan = PAL.upgrade;
    const buy = (kind, id, cost, owned, label) => owned
      ? `<span class="bown" style="color:${cyan}">${label || 'OWNED'}</span>`
      : `<button class="chip bbuy ${META.dna < cost ? 'poor' : ''}" data-k="${kind}" data-id="${id}">${cost} DNA</button>`;
    let h = `<div class="bdna"><b style="color:${gold}">${fmtNum(META.dna)}</b> DNA banked <span class="hint">(${fmtNum(META.total)} earned in total)</span></div>
      <p class="hint">Every run banks DNA: levels, bosses, rival kills, time survived, and a big bonus for being born. Spend it on permanent changes to every future swimmer.</p>`;
    h += `<div class="sec"><h3>Inherited traits</h3>`;
    for (const b of META_BONUSES) {
      const r = META.ranks[b.id] || 0, pips = Array.from({ length: b.max }, (_, i) => `<i class="${i < r ? 'on' : ''}"></i>`).join('');
      h += `<div class="brow"><div><b>${esc(b.name)}</b><span class="pips">${pips}</span><div class="hint">${esc(b.desc)}</div></div>${buy('rank', b.id, r < b.max ? b.cost(r) : 0, r >= b.max, 'MAX')}</div>`;
    }
    h += `</div><div class="sec"><h3>Starter weapons</h3><p class="hint">Unlocked weapons join your starter DNA. One is always offered.</p>`;
    for (const [id, cost] of META_STARTERS) {
      const d = WEAPONS[id]; if (!d) continue;
      h += `<div class="brow"><div class="bico">${iconSVG(d, 26, elemCol(d.elem))}</div><div><b>${esc(d.name)}</b><div class="hint">${esc(d.desc || '')}</div></div>${buy('starter', id, cost, META.starters[id])}</div>`;
    }
    h += `</div><div class="sec"><h3>Tag dyes</h3><p class="hint">Your fluorescent tag. All in the green family, so green still means you.</p>`;
    for (const d of META_DYES) {
      const owned = META.dyes[d.id], on = META.dye === d.id;
      h += `<div class="brow"><div class="bdye" style="background:${d.color};box-shadow:0 0 10px ${d.color}"></div><div><b>${esc(d.name)}</b></div>${on ? `<span class="bown" style="color:${cyan}">WEARING</span>` : owned ? `<button class="chip bbuy" data-k="dye" data-id="${d.id}">WEAR</button>` : buy('dye', d.id, d.cost, false)}</div>`;
    }
    h += `</div>`;
    body.innerHTML = h;
    body.querySelectorAll('.bbuy').forEach(b => b.addEventListener('click', () => {
      if (!metaBuy(b.dataset.k, b.dataset.id)) { UI.toast('Not enough DNA yet: swim again'); return; }
      sfx('pickup');
      const y = $('bank').scrollTop; UI.renderBank(); $('bank').scrollTop = y;
    }));
  },

  // ---------------------------------------------------------------- game over
  showVictory() { UI.showGameOver(true); },
  showGameOver(won) {
    const best = UI.loadBest();
    const isBest = won ? !best.born || G.t < best.born : G.t > (best.time || 0);
    if (won) UI.saveBest(Object.assign(best, { born: isBest ? G.t : best.born, births: (best.births || 0) + 1 }));
    else if (isBest) UI.saveBest(Object.assign(best, { time: G.t, level: G.level, kills: G.kills }));
    $('overTitle').textContent = won ? "IT'S SPERMY!" : G.rivalWinner ? 'BEATEN TO IT' : 'SPERMY ABSORBED';
    $('overTitle').classList.toggle('won', !!won);
    const dmg = Object.entries(G.stats.dmg).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const tot = dmg.reduce((a, b) => a + b[1], 0) || 1;
    const hurt = Object.entries(G.stats.hurt).sort((a, b) => b[1] - a[1]).slice(0, 3);
    let h = won
      ? `<div class="eulogy">Sperm count: one. You fertilised the egg. Out of four hundred million swimmers, you are the one who gets to be a person. Try not to waste it.</div><div class="big born">${fmtTime(G.t)}</div><div class="hint">${isBest ? 'FASTEST BIRTH YET!' : 'Fastest birth: ' + fmtTime(best.born)} | Peak viewers ${fmtViewers(G.show.peak)}</div>`
      : `<div class="eulogy">${esc(G.rivalWinner ? G.rivalWinner + ' broke into the egg first. They get to be a person. You get to be a footnote.' : pick(SYSTEM_LINES.death))}</div><div class="big">${fmtTime(G.t)}</div><div class="hint">${isBest ? 'NEW BEST! The producers are cautiously optimistic.' : 'Best: ' + fmtTime(best.time || 0)} | Peak viewers ${fmtViewers(G.show.peak)}</div>
      <div class="hint">${G.rivalWinner ? 'Born instead of you: ' : 'Absorbed by: '}<b style="color:${PAL.danger}">${esc(G.rivalWinner || G.stats.lastHit || 'the immune system')}</b>${hurt.length ? ' | Most damage from: ' + hurt.map(x => esc(x[0])).join(', ') : ''}</div>`;
    h += `
      <div class="ostats"><div><b>${G.level}</b>Level</div><div><b>${G.kills}</b>Kills</div><div><b>${G.stats.reactions}</b>Reactions</div><div><b>${G.stats.bossKills}</b>Bosses</div>
      <div><b>${G.stats.rewinds}</b>Rewinds</div><div><b>${G.stats.charms || 0}</b>Allies won</div><div><b>${G.weapons.reduce((a, w) => a + (w ? w.mods.length : 0), 0)}</b>Modifiers</div><div><b>${G.stats.absorbed}</b>Bullets eaten</div></div>
      <h3>Damage breakdown</h3>`;
    for (const [k, v] of dmg) h += `<div class="dmgrow"><span>${esc(k)}</span><i style="width:${(v / tot * 100).toFixed(0)}%"></i><b>${fmtNum(v)}</b></div>`;
    const got = G.show.order;
    h += `<h3>Achievements this run (${got.length})</h3>`;
    h += got.length ? `<div class="list">${got.map(id => `<div class="li on"><b>${esc(ACHIEVEMENTS[id].name)}</b></div>`).join('')}</div>` : `<p class="hint">None. Impressive, in its own way.</p>`;
    logRun(G, won ? 'WON' : G.rivalWinner ? 'BEATEN' : 'LOST');
    UI.lastRun = G.logged ? RUNLOG[RUNLOG.length - 1] : null; $('copyRunBtn').textContent = 'COPY THIS RUN';
    const dna = bankRun(G, won);
    h = `<div class="bdna">+<b style="color:${PAL.reward}">${dna}</b> DNA banked <span class="hint">(${fmtNum(META.dna)} to spend in the Gene Bank)</span></div>` + h;
    $('overBody').innerHTML = h;
    UI.show('over');
  },

  loadBest() { try { return JSON.parse(localStorage.getItem('sd_best') || '{}'); } catch (e) { return {}; } },
  saveBest(b) { try { localStorage.setItem('sd_best', JSON.stringify(b)); } catch (e) { /* ignore */ } },
  renderBest() {
    const b = UI.loadBest();
    const parts = [];
    if (b.time) parts.push(`Longest swim: ${fmtTime(b.time)} (Level ${b.level})`);
    if (b.born) parts.push(`Born ${b.births} time${b.births === 1 ? '' : 's'}, fastest ${fmtTime(b.born)}`);
    $('bestLine').textContent = parts.length ? parts.join(' | ') : 'No swims yet. The egg awaits.';
    $('dnaLine').textContent = META.dna ? fmtNum(META.dna) + ' DNA' : '';
  },
};

// Where this box came from, told as a little story (falls back to the box's usual line).
function lootStory(req) {
  const src = req.src || {}, n = src.name || 'something', L = G.level;
  const lines = {
    elite: [
      `Extracted from the still-twitching ${n}. It won't be needing this where it's going, which is nowhere.`,
      `The ${n} was carrying these genes in a pocket nobody knew it had. Finders keepers. Losers dissolved.`,
      `You beat the ${n} fair and square, then went through its chromosomes. Standard practice.`,
    ],
    amoeba: [
      `Recovered from inside an Amoeba that had eaten ${src.meals || 'several'} of its neighbours. It was wedged between two of them.`,
      `The Amoeba swallowed this DNA ages ago and never managed to digest it. Neither will you, but you can shoot with it.`,
      `Fished out of a very full Amoeba. Please do not ask what else was in there. There was a lot else in there.`,
    ],
    drop: [
      `A ${n} dropped this on its way out of existence. Rude not to take it.`,
      `Lucky find: it fell out of a ${n}. The odds of that were low. The odds of you gloating are high.`,
    ],
    rival: [
      `${n}'s personal effects. Their mum would like the DNA back. She is not getting the DNA back.`,
      `${n} left this to you in a will they wrote about four seconds before you happened to them.`,
      `Everything ${n} was now fits on one strand of DNA. Sad, really. Anyway: splice it in.`,
    ],
    sponsor: [
      `A gift from ${n}, sponsor of today's race. Terms and conditions apply to your soul.`,
      `${n} sent this with a note: "Please mention us when you are born." You will not remember any of this.`,
    ],
    boss: [
      `${n} is dead. This was in its will. You were not in its will. You are now.`,
      `You spliced this out of ${n} while the audience cheered. The audience has questionable values.`,
      `${n} guarded these genes with its life. That turned out to be a limited resource.`,
    ],
    ach: [
      `For "${n}". The producers insisted. The lawyers wept. Here is your prize.`,
      `Achievement unlocked: "${n}". The show sends a strand of DNA and a small round of applause.`,
    ],
    cure: [
      'For clearing up the yeast infection. The womb is grateful, and slightly embarrassed.',
      'Infection cured. The doctor sends this DNA with a leaflet you will not read.',
    ],
    level: [
      `Level ${L}. You grew, and the womb noticed. It sends its regards, and some spare DNA.`,
      `Level ${L}! Every time you get bigger, somebody leaves a strand of DNA out for you. You have not asked whose.`,
      `Level ${L}. Your tail is longer, your head is harder, and here, for some reason, is a strand of DNA.`,
    ],
  };
  const pool = lines[src.t] || (req.kind === 'level' ? lines.level : null);
  return pool ? pick(pool) : '';
}

// Tap acts; press and hold shows details in a popover (let go to close, nothing happens).
function holdable(el, info, onTap) {
  let timer = 0, held = false, sx = 0, sy = 0, suppress = false;
  el.addEventListener('pointerdown', ev => {
    held = false; sx = ev.clientX; sy = ev.clientY; clearTimeout(timer);
    timer = setTimeout(() => { held = true; UI.showInfo(info(), sx, sy); }, 380);
  });
  el.addEventListener('pointermove', ev => { if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 14) clearTimeout(timer); });
  el.addEventListener('pointerup', () => { clearTimeout(timer); if (held) { held = false; suppress = true; UI.hideInfo(); } });
  el.addEventListener('pointercancel', () => { clearTimeout(timer); if (held) { held = false; UI.hideInfo(); } });
  el.addEventListener('contextmenu', ev => ev.preventDefault());
  el.addEventListener('click', ev => { if (suppress) { suppress = false; return; } onTap(ev); });
}
function firstSentence(t) { const m = String(t).match(/^.*?[.!?](\s|$)/); return m ? m[0].trim() : t; }

function fmtTime(t) { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${s < 10 ? '0' : ''}${s}`; }
function fmtNum(v) { return v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : Math.round(v) + ''; }

// Android back button bridge: returns 'exit' when the app should close.
window.handleBack = function () {
  const on = id => $(id).classList.contains('on');
  if (on('title')) return 'exit';
  if (G && G.state === 'intro') { endIntro(); return 'ok'; }
  if (on('over')) { G = null; UI.show('title'); UI.renderBest(); return 'ok'; }
  if (on('loot')) return 'ok';
  if (on('armoury')) { UI.closeArmoury(); return 'ok'; }
  if (on('bank') || on('samples')) { UI.show('title'); UI.renderBest(); return 'ok'; }
  if (on('settings')) { UI.show(UI.setFrom || 'title'); return 'ok'; }
  UI.togglePause();
  return 'ok';
};

// Called by the Android shell when the app is backgrounded.
window.onAppPause = function () { if (G && G.state === 'play') UI.togglePause(); };

UI.init();
requestAnimationFrame(frame);
