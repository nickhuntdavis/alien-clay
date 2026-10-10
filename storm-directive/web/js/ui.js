'use strict';
// UI colour: X-ray neutrals, plus one colour per meaning (see PAL in data.js).
const UI_MEAN = new Set([PAL.you, PAL.danger, PAL.reward, PAL.upgrade, PAL.pickup]);
// A weapon's current type (Element Swap changes it).
function wElem(w) { const m = w.mods && w.mods.find(x => x.id === 'elemental'); return m ? m.elem : w.def.elem; }
function cardCat(o) {
  if (o.cursed) return PAL.danger;
  if (o.tag === 'SUPPLY') return XR.white;
  if (o.relic) return PAL.reward;
  return PAL.upgrade; // weapons, spells, levels, fusions, branches, modifiers, power-ups: all permanent build changes
}
// Spawn Prawn - DOM UI: title, HUD slots, loot boxes, Tackle Box, pause, game over and victory.

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
    refreshPalette();
    const probe = $('safeProbe');
    UI.safeTop = probe ? parseFloat(getComputedStyle(probe).paddingTop) || 0 : 0;
    $('hudTop').style.top = UI.safeTop + 'px';
    // Build HUD slots.
    const ws = $('wslots'), ss = $('sslots');
    for (let i = 0; i < MAX_WEAPONS + COMBO_MOUNTS; i++) ws.appendChild(UI.makeSlotEl('w', i));
    for (let i = 0; i < 2; i++) ss.appendChild(UI.makeSlotEl('s', i));
    $('moveBtn').addEventListener('click', () => {
      if (!G) return;
      const i = MOVE_DIRECTIVES.findIndex(m => m.id === G.moveDir);
      G.moveDir = MOVE_DIRECTIVES[(i + 1) % MOVE_DIRECTIVES.length].id;
      UI.toast('AUTORUN: ' + MOVE_DIRECTIVES.find(m => m.id === G.moveDir).name);
      UI.refreshHud(true);
    });
    $('armBtn').addEventListener('click', e => { e.stopPropagation(); if (G && G.state === 'play') UI.openArmoury('w', 0); });
    $('pauseBtn').addEventListener('click', () => UI.togglePause());
    $('stClose').addEventListener('click', () => UI.closeStatusPanel());
    // Game speed, right on the HUD: each tap steps to the next speed (wrapping round).
    $('spdBtn').addEventListener('click', e => { e.stopPropagation(); const i = SPEED_OPTS.indexOf(gameSpeed()); SET.speed = SPEED_OPTS[(i + 1) % SPEED_OPTS.length]; saveSettings(); UI.syncSpeed(); });
    $('abilBtn').addEventListener('click', e => { e.stopPropagation(); abilityTap(); });
    $('autoBtn').addEventListener('click', e => { e.stopPropagation(); SET.auto = !SET.auto; saveSettings(); UI.syncAuto(); if (G) floatText(me().x, me().y - 40, SET.auto ? 'FULL AUTO ON' : 'FULL AUTO OFF', PAL.you, 14, 1); });
    UI.syncAuto();
    $('armClose').addEventListener('click', () => UI.closeArmoury());
    // Swipe left/right anywhere in the Tackle Box to move between slots.
    { let sx = 0, sy = 0, t0 = 0;
      $('armoury').addEventListener('touchstart', ev => { const t = ev.touches[0]; sx = t.clientX; sy = t.clientY; t0 = performance.now(); }, { passive: true });
      $('armoury').addEventListener('touchend', ev => {
        const t = ev.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
        if (performance.now() - t0 < 600 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8) UI.armStep(dx < 0 ? 1 : -1);
      }, { passive: true }); }
    $('armOpen').addEventListener('click', () => { if (G && G.state === 'pause') { G.state = 'play'; UI.openArmoury('w', 0); } });
    $('rewindBtn').addEventListener('click', () => {
      if (!G || G.state !== 'play') return;
      if (G.chrono.charges < 1) { UI.toast('No Rewind charges: kill enemies to charge your Body Clock'); return; }
      if (G.chrono.snaps.length < 2) { UI.toast('Timeline too short to rewind yet'); return; }
      startRewind(false);
    });
    $('playBtn').addEventListener('click', () => UI.openSamples());
    $('quickBtn').addEventListener('click', () => UI.quickStart());
    $('dailyBtn').addEventListener('click', () => startDaily());
    $('dPrev').addEventListener('click', () => UI.draftStep(-1));
    $('dNext').addEventListener('click', () => UI.draftStep(1));
    $('dPick').addEventListener('click', () => { if (!UI.draft || !(UI.lastDown > UI.lootOpenT) || performance.now() - UI.lootOpenT < 500) return; UI.pickLoot(UI.draft.i); });
    { let sx = 0, sy = 0, t0 = 0; const st = $('draft');
      st.addEventListener('touchstart', ev => { const t = ev.touches[0]; sx = t.clientX; sy = t.clientY; t0 = performance.now(); }, { passive: true });
      st.addEventListener('touchend', ev => { const t = ev.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; if (performance.now() - t0 < 600 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.8) UI.draftStep(dx < 0 ? 1 : -1); }, { passive: true }); }
    $('sampleBack').addEventListener('click', () => { UI.show('title'); UI.renderBest(); });
    $('sqBack').addEventListener('click', () => UI.openSamples());
    $('sqGo').addEventListener('click', () => seqGo());
    $('sqPrev').addEventListener('click', () => seqStep(-1));
    $('sqNext').addEventListener('click', () => seqStep(1));
    { let x0 = 0; const h = $('sqHero'); h.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true }); h.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) seqStep(dx < 0 ? 1 : -1); }, { passive: true }); }
    $('howBtn').addEventListener('click', () => $('how').classList.toggle('open'));
    $('rerollBtn').addEventListener('click', () => UI.reroll());
    // Splice screens can be skipped: stay pure, take two rerolls.
    $('skipBtn').addEventListener('click', () => {
      if (!G || !$('lootCards').classList.contains('ready') || !UI.lootReq) return;
      const k = UI.lootReq.kind;
      if (RAR_SKIP[k] != null) { // Pass on this box: the next one is a rarity better (it stacks).
        clearPreviews(); G.rarBoost = Math.min(4, (UI.lootReq.boost || 0) + 1); sfx('pickup');
        floatText(me().x, me().y - 40, 'NEXT BOX: ' + RARITIES[Math.min(4, RAR_SKIP.level + G.rarBoost)].name.toUpperCase() + '+', PAL.reward, 14, 1.2);
        G.state = 'play'; UI.show('hud'); UI.refreshHud(true); lastTs = performance.now();
        return;
      }
      if (k !== 'splice') return;
      clearPreviews(); spliceSkip(); sfx('pickup');
      G.state = 'play'; UI.show('hud'); UI.refreshHud(true); lastTs = performance.now();
    });
    $('resumeBtn').addEventListener('click', () => UI.togglePause());
    $('quitBtn').addEventListener('click', () => { logRun(G, 'QUIT'); G = null; UI.show('title'); UI.renderBest(); });
    $('setBtnTitle').addEventListener('click', () => UI.openSettings('title'));
    $('setBtnPause').addEventListener('click', () => UI.openSettings('pause'));
    $('setBack').addEventListener('click', () => UI.show(UI.setFrom || 'title'));
    $('bankBtn').addEventListener('click', () => { UI.bankClear = false; UI.bornArm = false; UI.renderBank(); UI.show('bank'); $('bank').scrollTop = 0; });
    $('bankBack').addEventListener('click', () => { UI.show('title'); UI.renderBest(); });
    $('codexBtn').addEventListener('click', () => { UI.openCodex(); $('codex').scrollTop = 0; });
    $('codexBack').addEventListener('click', () => { UI.show('title'); UI.renderBest(); });
    UI.applySettings();
    $('againBtn').addEventListener('click', () => UI.startGame());
    $('newSeqBtn').addEventListener('click', () => openSeq()); // (same mode, another Primary)
    $('dbgBtn').addEventListener('click', e => { e.stopPropagation(); if (G && G.debug) toggleDebugPanel(); });
    $('waveBtn').addEventListener('click', () => { if (G && waveReady()) { waveBegin(); $('waveBtn').classList.remove('on'); } });
    // Boss introductions: once the card is up, a tap anywhere starts the fight.
    $('bossIntro').addEventListener('click', () => { if ($('bossIntro').classList.contains('ready')) endBossIntro(); });
    // The small link under first-sighting and first-status cards: no more of them (Settings > Play brings them back).
    $('biOff').addEventListener('click', ev => { ev.stopPropagation(); tutSkip(); UI.toast('TUTORIAL SKIPPED (SETTINGS > PLAY TO TURN IT BACK ON)'); endBossIntro(); });
    $('copyRunBtn').addEventListener('click', () => {
      const b = $('copyRunBtn'), r = UI.lastRun;
      if (!r) { b.textContent = 'TOO SHORT TO LOG'; return; }
      copyText(`SPAWN PRAWN v${APP_VERSION} - one run | ${winTally()}\n` + runText(r)).then(ok => { b.textContent = ok ? 'COPIED: PASTE IT IN THE CHAT' : 'COPY BLOCKED: USE SETTINGS > RUN LOG'; });
    });
    $('titleBtn').addEventListener('click', () => { G = null; UI.show('title'); UI.renderBest(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && G) liveSave(G); if (document.hidden && G && G.state === 'play') UI.togglePause(); });
    UI.renderBest();
    UI.show('title');
    splashStart(); // (the opening splash over the title; a tap skips it)
  },

  lastDown: 0, lootOpenT: 0,
  show(name) {
    if (!G) refreshPalette(); // out of a run everything is greyscale
    for (const id of ['title', 'loot', 'pause', 'stpanel', 'over', 'armoury', 'settings', 'bank', 'codex', 'samples', 'seqsel', 'born', 'bossIntro', 'draft']) $(id).classList.toggle('on', id === name);
    $('hud').classList.toggle('on', name === null || name === 'hud');
  },

  // Quick start (for testing): straight into the standard slide with a random unlocked sequence and a random
  // starting weapon. No sample screen, no sequence screen, no microscope dive, no weapon draft. Your chosen
  // sequence for normal runs is left as it was.
  quickStart() {
    const keep = META.profile, seqs = Object.keys(PROFILES).filter(id => profUnlocked(id));
    META.profile = pick(seqs.length ? seqs : ['vanguard']);
    UI.sample = 's001';
    UI.startGame(false);
    META.profile = keep;
    const i = G.lootQueue.findIndex(q => q.kind === 'start');
    if (i >= 0) { const [req] = G.lootQueue.splice(i, 1); const o = pick(genLoot(req)); if (o) { o.apply(); floatText(me().x, me().y - 40, o.title.toUpperCase(), PAL.upgrade, 15, 1.4); } }
    UI.refreshHud(true);
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
    if (G.wave && G.wave.camp) sysMsg('THE SCIENTIST', `"Subject in the dish. Twenty drops. Every fifth one is something big. Survive them all and you get the egg." Clear a wave, open your DNA, then start the next.`, XR.dim, true);
    else if (G.wave) sysMsg('THE SCIENTIST', '"Subject in the dish. One drop at a time. Let us see what you become." Clear a wave, open your DNA, then start the next.', XR.dim, true);
    else sysLine('start', true);
    if (G.heat) sysMsg('IMMUNE RESPONSE ' + G.heat, IMMUNE.slice(0, G.heat).map(x => x.name).join(', ') + '. +' + Math.round(IMMUNE_DNA * G.heat * 100) + '% DNA if you survive it.', PAL.danger, true);
    UI.show('hud');
    UI.refreshHud(true);
  },

  makeSlotEl(kind, i) {
    const el = document.createElement('div');
    el.className = 'slot ' + (kind === 's' ? 'spell' : 'weapon');
    el.innerHTML = '<div class="ico"></div><div class="lv"></div><div class="mp"></div><div class="dir"></div><div class="bar"><i></i></div>';
    // Tapping a weapon slot switches its target; slots with nothing to aim open the Tackle Box on it.
    holdable(el, () => {
      const w = G && (kind === 's' ? G.spells[i] : G.weapons[i]);
      if (!w) return `<b>Empty ${kind === 's' ? 'spell' : 'weapon'} slot</b><p>Tap to open the Tackle Box.</p>`;
      const dr = DIRECTIVES.find(x => x.id === w.dir);
      return `<b style="color:${elemCol(wElem(w))}">${esc(w.def.name)}</b> <em>Lv ${w.lvl}/${MAX_WLVL}</em><p>${esc(w.def.desc)}</p>`
        + (w.s && w.s.dmg ? `<p>Damage ${w.s.dmg.toFixed(w.s.dmg < 10 ? 1 : 0)}${w.s.cd ? ' | ' + (1 / w.s.cd).toFixed(1) + '/s' : ''}${dr ? ' | targets ' + dr.name : ''}</p>` : '')
        + (w.mods.length ? `<p>Mods: ${w.mods.map(m => esc(MODS[m.id].name)).join(', ')}</p>` : '')
        + `<p>${kind === 's' ? 'Tap to perform it now. Its target and the rest are in the Tackle Box.' : w.def.noTarget ? 'Tap to open the Tackle Box.' : 'Tap to switch target. TACKLE BOX button for the rest.'}</p>`;
    }, () => {
      if (!G || G.state !== 'play') return;
      const w = kind === 's' ? G.spells[i] : G.weapons[i];
      if (kind === 's' && w) { featTap(w); return; } // (Feats: tap to cast)
      if (!w || w.def.noTarget) { UI.openArmoury(kind, i); return; }
      const idx = DIRECTIVES.findIndex(d => d.id === w.dir);
      w.dir = DIRECTIVES[(idx + 1) % DIRECTIVES.length].id;
      if (w.dirs) w.dirs[0] = w.dir;
      UI.toast(w.def.name + ' > ' + DIRECTIVES.find(d => d.id === w.dir).name);
      UI.refreshHud(true);
    });
    return el;
  },

  refreshHud(full) {
    if (full) UI.syncSpeed();
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
        el.classList.toggle('merged', !!(w.combos && w.combos.length));
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
    $('wslots').classList.toggle('many', G.weapons.length > 3);
    for (let i = 0; i < wEls.length; i++) { wEls[i].style.display = i < G.weapons.length ? '' : 'none'; if (i < G.weapons.length) fill(wEls[i], G.weapons[i]); }
    for (let i = 0; i < 2; i++) fill(sEls[i], G.spells[i]);
    $('moveBtn').textContent = 'RUN: ' + MOVE_DIRECTIVES.find(m => m.id === G.moveDir).name;
    // Keep the Rewind button clear of the HUD as extra weapon rows appear.
    UI.bottomH = $('bottom').offsetHeight;
    $('side').style.bottom = LAYOUT.land ? '' : (UI.bottomH + 12) + 'px';
    // Rewind button.
    const c = G.chrono, rb = $('rewindBtn');
    rb.querySelector('.pips').innerHTML = Array.from({ length: c.max }, (_, i) => `<i class="${i < c.charges ? 'on' : ''}"></i>`).join('');
    rb.style.setProperty('--e', (c.charges >= c.max ? 100 : c.energy / chronoCost() * 100).toFixed(0) + '%');
    rb.classList.toggle('ready', c.charges > 0);
    // Starting ability: its colour, name and cooldown sweep.
    const ab = $('abilBtn'), A = G.genes && SEQ_ABILITY[G.genes.primary];
    ab.style.display = A && !G.debug ? '' : 'none';
    if (A) {
      const left = Math.max(0, (G.genes.abilT || 0) - G.t), pct = left > 0 ? (1 - left / A.cd) * 100 : 100;
      ab.style.setProperty('--ac', SEQ_LOOK[G.genes.primary].color); ab.style.setProperty('--e', pct.toFixed(0) + '%');
      ab.querySelector('b').textContent = A.short; ab.querySelector('span').textContent = left > 0 ? Math.ceil(left) + 's' : 'READY';
      ab.classList.toggle('ready', left <= 0);
    }
  },

  // Full Auto: picks for you at random (DNA strands, drafts, branches, relics), skips the intros, and starts waves.
  syncAuto() { const b = $('autoBtn'); if (b) b.classList.toggle('on', !!SET.auto); UI.syncSpeed(); },
  syncSpeed() { const b = $('spdBtn'); if (b) { b.textContent = 'x' + gameSpeed(); b.classList.toggle('fast', gameSpeed() > 1); } },
  autoTick() {
    if (!SET.auto || !G) return;
    const now = performance.now();
    if (G.state === 'intro') { if (typeof INTRO !== 'undefined' && INTRO.t > 1) endIntro(); return; }
    if (G.state === 'bossIntro') { if ($('bossIntro').classList.contains('ready')) endBossIntro(); return; }
    if (G.state === 'loot') {
      if (now - UI.lootOpenT < 1100 || now - (UI.autoAt || 0) < 700) return;
      const opts = (UI.lootOpts || []).map((o, i) => [o, i]).filter(([o]) => o && !o.taken);
      if (!opts.length) return;
      UI.autoAt = now;
      UI.pickLoot(pick(opts)[1]);
      return;
    }
    if (G.state === 'play' && SET.autoWaves && waveReady()) {
      if (!UI.autoWaveT) UI.autoWaveT = now;
      else if (now - UI.autoWaveT > 1500) { UI.autoWaveT = 0; waveBegin(); $('waveBtn').classList.remove('on'); }
    } else UI.autoWaveT = 0;
  },
  menuOn() { for (const id of ['loot', 'draft', 'pause', 'stpanel', 'over', 'armoury', 'settings', 'bank', 'codex', 'samples', 'seqsel', 'born']) { const el = $(id); if (el && el.classList.contains('on')) return true; } return false; },
  tick(dt) {
    updatePreviews(dt);
    seqTick(dt);
    drawBaby(dt);
    UI.youTick(dt);
    UI.autoTick();
    { const db = $('dbgBtn'); if (db) db.classList.toggle('on', !!(G && G.debug && (G.state === 'play'))); if (DBG.open && !(G && G.debug)) { DBG.open = false; $('dbgPanel').classList.remove('on'); } }
    // The Petri Dish: the next drop waits for you.
    { const wb = $('waveBtn'), on = G && waveReady(); if (wb && wb.classList.contains('on') !== !!on) { wb.classList.toggle('on', !!on); if (on) wb.textContent = G.wave.n + 1 === 0 ? 'START WAVE 0: PRE-SCHOOL' : 'START WAVE ' + (G.wave.n + 1) + (G.wave.camp ? ' OF ' + CAMP.waves : ''); } }
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
        if (!LAYOUT.land) box.style.bottom = Math.round((UI.bottomH || 200) + 44) + 'px'; // (clear of the scale bar and frame-rate line)
        UI.msgT = Math.min(4.5, 1.8 + m.body.length / 40);
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
    // Tabs: one group of settings at a time.
    const TABS = [['play', 'PLAY'], ['view', 'VIEW'], ['sound', 'SOUND'], ['data', 'DATA']], tab = UI.setTab || 'play';
    const TAB_OF = { immersive: 'view', darkfield: 'view', detail: 'view', clinical: 'view', dof: 'view', fx: 'view', layout: 'view', fpsCap: 'view', shake: 'view', narrator: 'sound', sound: 'sound', music: 'sound', vibe: 'sound' };
    const tabsHtml = `<div class="ptabs">${TABS.map(([id, l]) => `<button class="chip ${tab === id ? 'sel' : ''}" data-stab="${id}">${l}</button>`).join('')}</div>`;
    body.innerHTML = tabsHtml + SETTINGS_DEF.filter(d => (TAB_OF[d.id] || 'play') === tab).map(d => `<div class="sec setrow"><h3>${esc(d.label)}</h3>${d.hint ? `<p class="hint">${esc(d.hint)}</p>` : ''}<div class="chips">${d.opts.map(([v, l], i) => `<button class="chip ${SET[d.id] === v ? 'sel' : ''}" data-s="${d.id}" data-i="${i}">${esc(l)}</button>`).join('')}</div></div>`).join('');
    // One delegated handler: the Data tab appends HTML with innerHTML +=, which would wipe per-button listeners.
    body.onclick = ev => { const b = ev.target.closest('[data-stab]'); if (b) { UI.setTab = b.dataset.stab; UI.renderSettings(); $('settings').scrollTop = 0; } };
    if (tab !== 'data') { UI.bindSettingChips(body); return; }
    body.innerHTML += `<div class="sec setrow"><h3>Reset all progress</h3><p class="hint">Wipes everything this phone has earned: DNA, Gene Bank ranks, unlocked sequences and weapons, stains, generations, bests, achievements, the Field Guide and the run log. Your settings stay. This cannot be undone.</p><div class="chips"><button class="chip" id="resetAll">RESET ALL PROGRESS</button></div></div>`;
    body.innerHTML += `<div class="sec setrow"><h3>Tutorial</h3><p class="hint">The first time you meet each kind of enemy, the slide stops to introduce it (${Object.keys(META.seen || {}).filter(k => ENEMY_INTRO[k]).length} of ${Object.keys(ENEMY_INTRO).length} met). Reset to see the introductions again. Your Field Guide keeps what you have found.</p><div class="chips"><button class="chip" id="tutReset">RESET TUTORIAL</button></div></div>`;
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
    $('tutReset').addEventListener('click', ev => {
      if (!ev.target.dataset.armed) { ev.target.dataset.armed = '1'; ev.target.textContent = 'TAP AGAIN TO RESET'; return; }
      resetTutorial(); ev.target.textContent = 'DONE: YOU WILL MEET THEM ALL AGAIN';
    });
    $('resetAll').addEventListener('click', ev => {
      // Two taps, then a third: this is the one button that cannot be taken back.
      const n = +(ev.target.dataset.armed || 0) + 1; ev.target.dataset.armed = n;
      if (n === 1) { ev.target.textContent = 'ARE YOU SURE? TAP AGAIN'; return; }
      if (n === 2) { ev.target.textContent = 'LAST CHANCE: TAP TO WIPE EVERYTHING'; return; }
      resetAllProgress();
    });
    $('logClear').addEventListener('click', ev => {
      if (!RUNLOG.length) return;
      // Clearing can't be undone: ask for a second tap.
      if (!ev.target.dataset.armed) { ev.target.dataset.armed = '1'; ev.target.textContent = 'TAP AGAIN TO CLEAR'; return; }
      RUNLOG = []; saveRunLog(); UI.renderSettings();
    });
    UI.bindSettingChips(body);
  },
  bindSettingChips(body) {
    body.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => {
      const d = SETTINGS_DEF.find(x => x.id === b.dataset.s);
      SET[d.id] = d.opts[+b.dataset.i][0];
      saveSettings(); UI.applySettings();
      const y = $('settings').scrollTop; UI.renderSettings(); $('settings').scrollTop = y;
    }));
  },
  // Push settings into the systems that read them.
  applySettings() {
    AUDIO.on = SET.sound; DOF.on = SET.dof && !SET.clinical; UI.syncAuto();
    applyNarrator();
    document.body.classList.toggle('clinical', !!SET.clinical);
    document.body.classList.toggle('darkfield', !!SET.darkfield);
    document.body.classList.toggle('immersive', !!SET.immersive);
    if (typeof resetLook === 'function') resetLook();
    if (typeof applyLayout === 'function') applyLayout();
  },

  // ---------------------------------------------------------------- Tackle Box (weapon management)
  openArmoury(k, i) {
    if (!G || G.state !== 'play') return;
    G.state = 'armoury';
    INPUT.active = false; G.manual = null;
    UI.arm = { k, i, bar: 0, recycle: false };
    $('armQuip').textContent = pick([
      'Please do not lick the weapons. We have had complaints.',
      'Everything here is legally a gift, so no returns.',
      'Set your directives. Your tail does the rest. You do the blaming.',
      'No other swimmer has a Tackle Box. That is not fair. That is the point.',
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
      if (!x) return `<button class="atab empty ${sel ? 'sel' : ''}" data-k="${k}" data-i="${i}"><b>+</b><span>${k === 'w' ? 'WEAPON' : 'FEAT'} ${i + 1}</span></button>`;
      return `<button class="atab ${sel ? 'sel' : ''} ${k === 's' ? 'spell' : ''}" data-k="${k}" data-i="${i}" style="--c:${elemCol(wElem(x))}"><b>${iconSVG(x.def, 24, elemCol(wElem(x)))}</b><span>Lv ${x.lvl}</span><em>${x.mods.map(m => `<i style="background:${MODS[m.id].color}"></i>`).join('')}</em></button>`;
    };
    G.weapons.forEach((x, i) => { t += tab('w', i, x); });
    SLOT_LEVELS.filter(l => l > G.level).forEach((l, j) => { const i = G.weapons.length + j; t += `<button class="atab locked ${A.k === 'w' && A.i === i ? 'sel' : ''}" data-k="w" data-i="${i}"><b>LOCK</b><span>Lv ${l}</span></button>`; });
    G.spells.forEach((x, i) => { t += tab('s', i, x); });
    $('armTabs').innerHTML = t;
    $('armTabs').querySelectorAll('.atab').forEach(b => b.addEventListener('click', () => { UI.arm = { k: b.dataset.k, i: +b.dataset.i, bar: 0, recycle: false }; UI.renderArmoury(); }));
    const body = $('armBody');
    if (A.k === 'w' && A.i >= G.weapons.length) {
      body.innerHTML = `<div class="sec"><p class="hint">Locked weapon slot. You grow a new weapon mount at level ${SLOT_LEVELS.filter(l => l > G.level)[A.i - G.weapons.length] || '?'} (you are level ${G.level}) and draft a new weapon for it.</p></div>`;
      return;
    }
    if (!w) {
      body.innerHTML = `<div class="sec"><p class="hint">${A.k === 'w' ? 'Empty weapon mount. You draft a new weapon for it as soon as you are back in the race.' : 'Empty Feat slot. Feats show up in DNA strands while you have a free slot.'}</p></div>`;
      return;
    }
    const d = w.def, s = w.s;
    const elName = ELEMENTS[w.mods.find(m => m.id === 'elemental') ? w.mods.find(m => m.id === 'elemental').elem : d.elem].name + (d.elem2 ? ' / ' + ELEMENTS[d.elem2].name : '');
    let h = `<div class="ahead" style="--c:${elemCol(wElem(w))}"><div class="aico">${iconSVG(d, 34, elemCol(wElem(w)))}</div><div class="ainfo">
      <div class="aname">${esc(d.name)}${w.combos && w.combos.length ? ` <span class="fz">COMBO: ${esc(w.combos.map(id => COMBO_BY[id].name).join(', '))}</span>` : ''}</div>
      <div class="asub"><b style="color:${elemCol(wElem(w))}">${esc(elName)}</b> ${w.isSpell ? 'Feat' : 'weapon'} <span class="lpips">${Array.from({ length: MAX_WLVL }, (_, i) => `<i class="${i < w.lvl ? 'on' : ''}"></i>`).join('')}</span> Lv ${w.lvl}/${MAX_WLVL}</div>
      <div class="adesc">${esc(d.desc)}</div>${w.wpN && Object.keys(w.wpN).length ? `<div class="adesc"><b>Tuned:</b> ${Object.entries(w.wpN).map(([id, n]) => esc(PASSIVES[id].name) + ' x' + n).join(', ')}</div>` : ''}</div></div>`;
    // How it plays.
    if (!w.isSpell && d.play) {
      const st = d.stars || [3, 3, 3, 3], bar = n => `<div class="dbar">${Array.from({ length: 5 }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</div>`;
      h += `<div class="sec"><div class="drole">${esc((d.role || '').toUpperCase())}${d.toy ? ' | TOY' : ''}</div><p class="hint atplay">${esc(d.play)}</p>
        <div class="dbars"><span>POWER</span>${bar(st[0])}<span>FIRE RATE</span>${bar(st[1])}<span>REACH</span>${bar(st[2])}<span>CROWDS</span>${bar(st[3])}</div></div>`;
    }
    // This run, and every run.
    if (!w.isSpell) {
      const W = G.stats.wdmg || {}, mine = W[w.uid] || 0, tot = G.weapons.reduce((a, x) => a + (x ? W[x.uid] || 0 : 0), 0) || 1, life = META.wstats[w.id];
      const mo = masterOf(w), note = w.lvl >= MAX_WLVL ? 'This is your mastery weapon this run.' : mo ? `${mo.def.name} took this run's mastery: this one stops at Lv ${MAX_WLVL - 1}.` : 'Mastery (Lv 10) is still open: the first weapon to get there takes it.';
      h += `<div class="sec"><h3>Record</h3><div class="tiles"><div class="tile"><b>${fmtNum(mine)}</b><span>Damage this run</span></div><div class="tile"><b>${Math.round(mine / tot * 100)}%</b><span>Of your weapons' damage</span></div>
        <div class="tile"><b>${life ? life.runs : 0}</b><span>Earlier runs</span></div><div class="tile"><b>${life ? life.born : 0}</b><span>Born with it</span></div></div><p class="hint">${esc(note)}</p></div>`;
    }
    // Your upgrades, with this weapon's own twist on them.
    if (!w.isSpell) {
      const tw = Object.keys(ADAPT).filter(k => ADAPT[k][w.id] && (G.passives[k] || 0) > 0).map(k => `<div class="li on"><b>${esc(PASSIVES[k] ? PASSIVES[k].name : k)}</b> x${G.passives[k]}<br><span>${esc(ADAPT[k][w.id])}</span></div>`);
      const soon = Object.keys(ADAPT).filter(k => ADAPT[k][w.id] && !(G.passives[k] > 0)).map(k => PASSIVES[k] ? PASSIVES[k].name : k);
      if (tw.length || soon.length) h += `<div class="sec"><h3>Upgrade twists</h3>${tw.length ? `<div class="list">${tw.join('')}</div>` : ''}${soon.length ? `<p class="hint">These upgrades work differently on ${esc(d.name)}: ${esc(soon.join(', '))}.</p>` : ''}</div>`;
    }
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
    if (d.toy) toyStats(w, T);
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
          const sigRow = d.sig && d.sig[l];
          h += `<div class="trow br ${reached ? 'on' : ''}${sigRow ? ' sig' : ''}"><span class="tl">Lv ${l}${sigRow ? `<em>${l >= 10 ? 'MASTERY' : 'ONLY HERE'}</em>` : ''}</span><div class="tps">` + tree[l].map(id => {
            const K = perkDef(id), st = chosen ? (chosen === id ? 'chosen' : 'dim') : reached ? 'pending' : '';
            return `<div class="tp ${st}" style="--c:${PAL.upgrade}"><b><i>${esc(K.icon)}</i>${esc(K.name)}</b><span>${esc(K.desc + (PERK_ADAPT[id] && PERK_ADAPT[id][w.id] ? ' ' + PERK_ADAPT[id][w.id] : ''))}</span></div>`;
          }).join('') + `</div></div>`;

        } else {
          const bonus = l > 1 ? lvBonusText(d, l - 1, l) : '';
          const txt = l === 1 ? 'Base weapon' : `+${Math.round(WEAPON_LV_DMG * 100)}% damage, 5% faster, +12% magazine` + (bonus ? '. ' + bonus : '');
          h += `<div class="trow ${reached ? 'on' : ''}"><span class="tl">Lv ${l}</span><span class="tt">${esc(txt)}</span></div>`;
        }
      }
      h += `</div><button class="chip small" id="treeToggle" style="margin-top:8px">${A.full ? 'SHOW LESS' : 'SHOW FULL TREE (LV 1 TO ' + MAX_WLVL + ')'}</button>`;
      if (A.full) h += `<p class="hint">Lv 3 and Lv 8: upgrades any weapon can take (pick one of three). Lv 5 and Lv 10: upgrades only this weapon has (pick one of two): they decide how it plays.</p>`;
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
    if (d.noTarget) h += `<p class="hint">Performs itself. It goes off on its own when useful.</p>`;
    else {
      let cur = w.dir;
      if (w.dirs) {
        h += `<div class="chips">${w.dirs.map((dd, bi) => `<button class="chip ${A.bar === bi ? 'sel' : ''}" data-bar="${bi}">BARREL ${bi + 1}: ${DIRECTIVES.find(x => x.id === dd).short}</button>`).join('')}</div>`;
        cur = w.dirs[A.bar];
      }
      h += `<div class="dgrid">${DIRECTIVES.map(dd => `<button class="dbtn ${cur === dd.id ? 'sel' : ''}" data-dir="${dd.id}"><b>${dd.name}</b><span>${esc(dd.desc)}</span></button>`).join('')}</div>`;
    }
    h += `</div>`;
    // Combos: always shown, so you know what to build towards.
    if (!w.isSpell) {
      const cs = COMBOS.filter(c => c.a === w.id || c.b === w.id);
      if (cs.length) {
        h += `<div class="sec"><h3>Combos</h3><p class="hint">Get both weapons to Lv ${COMBO_LEVEL}+ and a COMBO card turns up in your next box: both keep firing, they gain a new power, and (twice a run) you get a bonus weapon mount.</p><div class="list">`;
        for (const c of cs) {
          const other = c.a === w.id ? c.b : c.a, on = G.combo && G.combo[c.id], ow = owned(other);
          h += `<div class="li ${on ? 'on' : ''}"><b style="color:${on ? '#ff3df2' : 'inherit'}">${esc(c.name)}</b> ${on ? '(FUSED)' : ow ? `(you have it, Lv ${ow.lvl})` : ''}<br><span>+ ${esc(WEAPONS[other].name)}: ${esc(c.desc)}</span></div>`;
        }
        h += `</div></div>`;
      }
    }
    // Pairings: secret until found once (on any run).
    if (!w.isSpell) {
      const ps = PAIRINGS.filter(q => q.a === w.id || q.b === w.id);
      if (ps.length) {
        h += `<div class="sec"><h3>Pairings</h3><p class="hint">Own both weapons at Lv ${PAIR_LEVEL}+ and they start working together.</p><div class="list">`;
        for (const q of ps) {
          const other = q.a === w.id ? q.b : q.a, known = META.pairs[q.id], on = G.pair[q.id];
          h += `<div class="li ${on ? 'on' : ''}"><b style="color:${on ? PAL.upgrade : 'inherit'}">${known ? esc(q.name) : '???'}</b> ${on ? '(ACTIVE)' : ''}<br><span>+ ${esc(WEAPONS[other].name)}${known ? ': ' + esc(q.desc) : ': a secret. Try it.'}</span></div>`;
        }
        h += `</div></div>`;
      }
    }
    // Recycle.
    if (A.k === 'w' && G.weapons.filter(Boolean).length > 1) {
      h += `<div class="sec"><button class="btn ${A.recycle ? 'danger' : ''}" id="armRecycle">${A.recycle ? 'TAP AGAIN TO RECYCLE (+2 REROLLS, THEN DRAFT A NEW ONE)' : 'RECYCLE WEAPON (DRAFT A REPLACEMENT)'}</button></div>`;
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
      G.lootQueue.push({ kind: 'slot', recycled: true }); // draft a replacement
      achieve('recycle');
      sysMsg('SYSTEM MESSAGE', `${d.name} has been recycled into 2 reroll tokens and a faint smell of regret.`, '#8dffc0', true);
      UI.arm = { k: 'w', i: G.weapons.findIndex(Boolean), bar: 0, recycle: false };
      UI.renderArmoury();
    });
  },

  // A weapon upgrade card: a live preview of the weapon, its level track and what the upgrade unlocks.
  upgradeCard(o, i) {
    const w = o.w, d = w.def, wc = elemCol(wElem(w)), r = RARITIES[o.rarity];
    const c = document.createElement('button');
    c.className = 'card wup r-' + r.id;
    c.style.setProperty('--rc', r.color); c.style.setProperty('--wc', wc); c.style.setProperty('--rar', r.color);
    c.style.animationDelay = (0.45 + i * 0.12) + 's';
    const pips = Array.from({ length: MAX_WLVL }, (_, k) => `<i class="${k < o.from ? 'on' : k < o.to ? 'up' : ''} ${PERK_LEVELS.includes(k + 1) ? 'ms' : ''}"></i>`).join('');
    const ms = PERK_LEVELS.filter(l => l > o.from && l <= o.to).map(l => d.sig && d.sig[l] ? (l >= 10 ? `Lv ${l}: choose its MASTERY` : `Lv ${l}: choose its SIGNATURE path`) : `Lv ${l}: choose an upgrade`);
    c.innerHTML = `<canvas></canvas><div class="tag">WEAPON UPGRADE <b>${esc(r.name)}</b></div>
      <div class="ctitle" style="color:${wc}">${esc(d.name)}</div>
      <div class="csub">Lv ${o.from} &rsaquo; ${o.to}${o.to === MAX_WLVL ? ' (MAX)' : ''} | ${esc(d.role || '')}</div>
      <div class="wlv">${pips}</div>
      <div class="cdesc">${esc(o.desc)}</div>${ms.length ? `<div class="wnext">Unlocks ${esc(ms.join(', '))}</div>` : ''}${UI.boonHtml(o)}${UI.rarityFlair(o)}`;
    makePreview(c.querySelector('canvas'), d, { mini: true });
    c.addEventListener('click', () => { if (!$('lootCards').classList.contains('ready') || !(UI.lastDown > UI.lootOpenT)) return; UI.pickLoot(i); });
    return c;
  },

  // ---------------------------------------------------------------- weapon draft (new weapons) and upgrade paths
  openDraft(req) {
    G.state = 'loot';
    UI.lootReq = req;
    UI.lootOpts = req.fixed || genLoot(req); // (the Daily Challenge's starting weapons are fixed for the day)
    if (req.kind === 'level') return; // the weapon for that branch is gone: an ordinary strand instead
    UI.pickedOne = false;
    const weap = req.kind === 'branch' ? G.weapons.find(x => x && x.uid === req.uid) : req.kind === 'sfork' ? G.spells.find(x => x && x.uid === req.uid) : null;
    UI.draft = { req, i: 0, weap, pv: null };
    const box = $('draft'), mount = G.weapons.filter(Boolean).length + 1;
    const sig = weap && weap.def.sig && weap.def.sig[req.lvl];
    $('dKick').textContent = req.kind === 'start' ? 'LEVEL 1 | YOUR FIRST WEAPON' : req.kind === 'slot' ? `LEVEL ${G.level} | WEAPON MOUNT ${mount} OF ${MAX_WEAPONS + (G.comboMounts || 0)}` : `${weap.def.name.toUpperCase()} | LV ${req.lvl || weap.lvl}`;
    $('dTitle').textContent = req.kind === 'sfork' ? 'FEAT PATH' : req.kind === 'branch' ? (sig ? (req.lvl >= 10 ? 'MASTERY' : 'SIGNATURE PATH') : 'UPGRADE PATH') : 'WEAPON DRAFT';
    $('dSub').textContent = req.kind === 'sfork' ? `${weap.def.name} hit Lv ${SPELL_FORK_LV}. Pick how it grows up: the other path goes in the bin.`
      : req.kind === 'start' ? "This is how you'll fight. Everything else you pick builds on it."
      : req.kind === 'slot' ? (req.recycled ? 'A fresh weapon for the empty mount.' : 'A new weapon mount. Choose what your build is missing: reach, crowds, bosses or safety.')
      : sig ? (req.lvl >= 10 ? `The last upgrade ${weap.def.name} ever gets. It changes how the weapon plays.` : `Only ${weap.def.name} can take these. Pick its path: the other one is gone for good.`)
      : `Any weapon can take these. Pick one for ${weap.def.name}.`;
    UI.renderDraft();
    box.classList.remove('opening'); void box.offsetWidth; box.classList.add('opening');
    UI.show('draft');
    box.scrollTop = 0;
    INPUT.active = false; G.manual = null;
    lootSound(req.kind === 'branch' ? 'branch' : 'boss', 3, false, UI.lootOpts.length);
    vibrate(80);
    UI.lootOpenT = performance.now();
    G.stats.boxes = (G.stats.boxes || 0) + 1; const bb = G.stats.boxBy || (G.stats.boxBy = {}); bb[req.kind] = (bb[req.kind] || 0) + 1;
  },
  draftStep(k) { const D = UI.draft, n = UI.lootOpts.length; D.i = (D.i + k + n) % n; UI.renderDraft(); },
  renderDraft() {
    const D = UI.draft, o = UI.lootOpts[D.i], box = $('draft');
    const def = D.weap ? D.weap.def : o.def, wc = D.weap ? elemCol(wElem(D.weap)) : elemCol(def.elem);
    box.style.setProperty('--wc', wc);
    // Stage: the weapon in action.
    const cv = $('dCanvas');
    // Upgrade paths: the preview shows the highlighted upgrade in action.
    if (!D.pv || D.pv.def !== def || D.pv.opts.perk !== o.perk) { if (D.pv) dropPreview(D.pv); D.pv = makePreview(cv, def, { perk: o.perk }); }
    $('dBadge').innerHTML = iconSVG(def, 22, wc) + esc(D.weap ? 'LV ' + D.weap.lvl + ' ' + def.name.toUpperCase() : (def.role || '').toUpperCase());
    // Tabs.
    $('dTabs').innerHTML = UI.lootOpts.map((x, i) => {
      const tc = D.weap ? wc : elemCol(x.def.elem);
      // Weapon drafts: the weapon's icon in its element colour (the names didn't fit); its name and role are in the panel below.
      if (!D.weap) return `<button class="dtab dwep ${i === D.i ? 'sel' : ''}" data-i="${i}" style="--tc:${tc}">${iconSVG(x.def, 24, tc)}<b>${esc(x.title)}</b><span>${esc((x.def.role || '').toUpperCase())}</span></button>`;
      return `<button class="dtab ${i === D.i ? 'sel' : ''}" data-i="${i}" style="--tc:${tc}"><b>${esc(x.title)}</b><span>${esc(x.tag === 'BRANCH' ? 'ANY WEAPON' : x.tag)}</span></button>`;
    }).join('');
    $('dTabs').querySelectorAll('.dtab').forEach(b => b.addEventListener('click', () => { D.i = +b.dataset.i; UI.renderDraft(); }));
    // Details.
    let h = '';
    if (D.req.kind === 'sfork') {
      const w = D.weap, other = UI.lootOpts.filter(x => x !== o);
      h += `<div class="dperk"><div class="drole">FEAT PATH: ONLY ${esc(w.def.name.toUpperCase())}</div><div class="pn">${esc(o.title)}</div><div class="pd">${esc(o.desc)}</div></div>
        <h4>${esc(w.def.name.toUpperCase())}</h4><div class="ddesc">${esc(w.def.desc || '')}</div>`;
      if (other.length) h += `<h4>THE PATH YOU WOULD LOSE</h4><div class="dpath">${other.map(x => `<div class="dp"><em>LV ${SPELL_FORK_LV}</em><b>${esc(x.title)}</b><span>${esc(x.desc)}</span></div>`).join('')}</div>`;
    } else if (D.weap) {
      const w = D.weap, lv = Array.from({ length: MAX_WLVL }, (_, k) => `<i class="${k + 1 === D.req.lvl ? 'now' : k < w.lvl ? 'on' : ''}"></i>`).join('');
      h += `<div class="dperk"><div class="drole">${esc(o.tag === 'BRANCH' ? 'UPGRADE ANY WEAPON CAN TAKE' : o.tag === 'MASTERY' ? 'MASTERY: ONLY ' + w.def.name.toUpperCase() : 'SIGNATURE: ONLY ' + w.def.name.toUpperCase())}</div>
        <div class="pn">${esc(o.title)}</div><div class="pd">${esc(o.desc.replace(/^Mastery\. /, ''))}</div></div>
        <h4>${esc(w.def.name.toUpperCase())}'S PATH</h4><div class="dlv">${lv}</div>`;
      const tree = weaponTree(w.def), rest = PERK_LEVELS.filter(l => l > D.req.lvl && w.def.sig && w.def.sig[l]);
      if (rest.length) h += `<h4>STILL TO COME</h4><div class="dpath">${rest.map(l => tree[l].map(id => `<div class="dp"><em>LV ${l}</em><b>${esc(perkDef(id).name)}</b><span>${esc(perkDef(id).desc.replace(/^Mastery\. /, ''))}</span></div>`).join('')).join('')}</div>`;
    } else {
      const d = def, st = d.stars || [3, 3, 3, 3], bar = n => `<div class="dbar">${Array.from({ length: 5 }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</div>`;
      h += `<div class="drole">${esc((d.role || '').toUpperCase())} | ${esc(ELEMENTS[d.elem].name.toUpperCase())}</div><div class="dname">${esc(d.name)}</div>
        <div class="dplay">${esc(d.play || '')}</div><div class="ddesc">${esc(d.desc)}</div>
        <div class="dbars"><span>POWER</span>${bar(st[0])}<span>FIRE RATE</span>${bar(st[1])}<span>REACH</span>${bar(st[2])}<span>CROWDS</span>${bar(st[3])}</div>`;
      if (d.sig) {
        h += `<h4>PLAYSTYLES IT UNLOCKS</h4><div class="dpath">`;
        for (const l of [5, 8, 10]) for (const id of d.sig[l] || []) h += `<div class="dp"><em>LV ${l} ${l >= 10 ? 'MASTERY (ONE WEAPON A RUN)' : 'SIGNATURE'}</em><b>${esc(SIGS[id].name)}</b><span>${esc(SIGS[id].desc.replace(/^Mastery\. /, ''))}</span></div>`;
        h += `</div>`;
      }
      // Only what matters to this build: pairings and combos with weapons you already own (the rest is in the Field Guide).
      const id0 = defId(o.def), ownsW = oid => G.weapons.some(x => x && x.id === oid);
      const ps = PAIRINGS.filter(q => (q.a === id0 && ownsW(q.b)) || (q.b === id0 && ownsW(q.a)));
      if (ps.length) h += `<h4>PAIRS WITH YOUR</h4><div class="dpairs">${ps.map(q => { const oid = q.a === id0 ? q.b : q.a; return `<b style="color:${PAL.upgrade}">${esc(WEAPONS[oid].name)}</b>: ${esc(q.name)}. ${esc(q.desc)}`; }).join('<br>')}</div>`;
      const cid = id0, cs = COMBOS.filter(c => (c.a === cid && ownsW(c.b)) || (c.b === cid && ownsW(c.a)));
      if (cs.length) h += `<h4>COMBOS WITH YOUR</h4><div class="dpairs">${cs.map(c => { const oid = c.a === cid ? c.b : c.a; return `<b style="color:#ff3df2">${esc(WEAPONS[oid].name)}</b>: ${esc(c.name)}`; }).join('<br>')}</div>`;
      const mine = G.weapons.filter(Boolean);
      if (mine.length) h += `<h4>YOUR MOUNTS</h4><div class="dmounts">${mine.map(x => `<span class="dmount">${iconSVG(x.def, 18, elemCol(wElem(x)))}${esc(x.def.name)} Lv ${x.lvl}</span>`).join('')}<span class="dmount new">${iconSVG(d, 18, elemCol(d.elem))}${esc(d.name)}?</span></div>`;
    }
    const info = $('dInfo'); info.innerHTML = h; info.style.animation = 'none'; void info.offsetWidth; info.style.animation = '';
    $('dPick').textContent = 'CHOOSE ' + o.title.toUpperCase();
  },

  // ---------------------------------------------------------------- boss introduction
  // A first sighting (intro.js): the same screen, lighter. No warning band, a quicker card, and what it
  // does and how to beat it instead of a boss's strengths and weaknesses.
  openFoeIntro(e, id) {
    $('biFight').textContent = 'FIGHT';
    const d = e.def, I = ENEMY_INTRO[id], box = $('bossIntro'), seen = Object.keys(META.seen || {}).filter(k => ENEMY_INTRO[k]).length;
    box.classList.add('foe');
    box.style.setProperty('--bc', d.color);
    const word = (v, lo, hi, a, b, c) => (v < lo ? a : v < hi ? b : c);
    $('biCount').innerHTML = `FIRST SIGHTING <span>${seen} OF ${Object.keys(ENEMY_INTRO).length} IN YOUR FIELD GUIDE</span>`;
    $('biTitle').textContent = 'NEW ON THE SLIDE';
    $('biName').textContent = d.name;
    // The first shooter you ever meet is told, in as many words, that shooters shoot.
    const firstShooter = d.shoot && !META.seenShooter; if (d.shoot && !META.seenShooter) { META.seenShooter = 1; saveMeta(); }
    $('biQuote').textContent = I.what + (firstShooter && !/dodge/i.test(I.what) ? ' It SHOOTS: dodge!' : '');
    $('biDesc').textContent = `Toughness: ${word(d.hp, 25, 90, 'low', 'medium', 'high')}. Speed: ${word(d.speed, 45, 90, 'slow', 'medium', 'fast')}. Armour: ${word(d.armour, 1, 5, 'none', 'light', 'heavy')}.${d.shoot ? ' Shoots.' : ''}${d.split ? ' Splits when it dies.' : ''}`;
    box.querySelector('.bi-col.str h4').textContent = 'HOW TO BEAT IT';
    box.querySelector('.bi-col.weak').style.display = 'none';
    $('biStr').innerHTML = `<li style="animation-delay:0.9s">${esc(I.tip)}</li>`;
    $('biReward').innerHTML = 'Added to your Field Guide.';
    box.classList.remove('ready');
    box.querySelectorAll('.bi-bar, .bi-card, .bi-name, .bi-quote, .bi-desc, .bi-reward').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
    UI.show('bossIntro');
    clearTimeout(UI.biTimer);
    UI.biTimer = setTimeout(() => box.classList.add('ready'), 1500);
  },
  // A buff or debuff, the first time it ever turns up on your HUD (statusintro.js).
  openStatusIntro(key, I, colour) {
    $('biFight').textContent = 'GOT IT';
    const box = $('bossIntro'), seen = Object.keys(META.seenSt || {}).length;
    box.classList.add('foe');
    box.style.setProperty('--bc', colour);
    $('biCount').innerHTML = `FIRST TIME <span>${seen} MET SO FAR</span>`;
    $('biTitle').textContent = I.buff ? 'NEW BUFF' : 'NEW DEBUFF';
    $('biName').textContent = key;
    $('biQuote').textContent = I.what;
    // Only the very first status card explains where the chips are (the key is already marked seen, so 1 = first).
    $('biDesc').textContent = (seen <= 1 ? 'It shows as a chip down the left of your screen (along the top in Immersive mode).' : '') + (I.buff ? '' : (seen <= 1 ? ' ' : '') + 'Get rid of it if you can.');
    box.querySelector('.bi-col.str h4').textContent = I.buff ? 'MAKE THE MOST OF IT' : 'WHAT TO DO';
    box.querySelector('.bi-col.weak').style.display = 'none';
    $('biStr').innerHTML = `<li style="animation-delay:0.9s">${esc(I.tip)}</li>`;
    $('biReward').innerHTML = 'You will not see this card again.';
    box.classList.remove('ready');
    box.querySelectorAll('.bi-bar, .bi-card, .bi-name, .bi-quote, .bi-desc, .bi-reward').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
    UI.show('bossIntro');
    clearTimeout(UI.biTimer);
    UI.biTimer = setTimeout(() => box.classList.add('ready'), 1200);
  },
  // A tutorial card (tutorial.js).
  openTutorial(C) {
    const box = $('bossIntro');
    box.classList.add('foe');
    box.style.setProperty('--bc', C.colour);
    $('biCount').innerHTML = `TUTORIAL <span>${G.wave && G.wave.n === 0 && G.wave.active ? 'PRACTICE' : 'FIRST TIME'}</span>`;
    $('biFight').textContent = 'GOT IT';
    $('biTitle').textContent = C.title;
    $('biName').textContent = C.name;
    $('biQuote').textContent = C.what;
    $('biDesc').textContent = C.desc || '';
    box.querySelector('.bi-col.str h4').textContent = C.head || 'HOW IT WORKS';
    box.querySelector('.bi-col.weak').style.display = 'none';
    $('biStr').innerHTML = C.tips.map((t, i) => `<li style="animation-delay:${(0.8 + i * 0.15).toFixed(2)}s">${esc(t)}</li>`).join('');
    $('biReward').innerHTML = esc(C.foot || 'You will not see this card again.');
    box.classList.remove('ready');
    box.querySelectorAll('.bi-bar, .bi-card, .bi-name, .bi-quote, .bi-desc, .bi-reward').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
    UI.show('bossIntro');
    clearTimeout(UI.biTimer);
    UI.biTimer = setTimeout(() => box.classList.add('ready'), 1200);
  },
  // A named rival, the first time you ever meet them: who they are, five attributes and two specialities.
  openRivalIntro(e) {
    $('biFight').textContent = 'FIGHT';
    const R = e.R, box = $('bossIntro'), met = RIVALS.filter(r => META.seen && META.seen['rival_' + r.id]).length;
    box.classList.add('foe');
    box.style.setProperty('--bc', R.color);
    $('biCount').innerHTML = `RIVAL SWIMMER <span>${met} OF ${RIVALS.length} MET</span>`;
    $('biTitle').textContent = R.nick;
    $('biName').textContent = R.name;
    $('biQuote').textContent = '"' + R.quote + '"';
    $('biDesc').innerHTML = `${esc(R.bio)}${UI.rivalBars(R)}`;
    box.querySelector('.bi-col.str h4').textContent = 'SPECIALITIES';
    box.querySelector('.bi-col.weak').style.display = '';
    box.querySelector('.bi-col.weak h4').textContent = 'HOW TO BEAT THEM';
    $('biStr').innerHTML = R.specs.map((x, i) => `<li style="animation-delay:${(0.9 + i * 0.18).toFixed(2)}s"><b>${esc(x.name)}</b>: ${esc(x.desc)}</li>`).join('');
    $('biWeak').innerHTML = `<li style="animation-delay:1.3s">${esc(R.tip)}</li>`;
    const rr = RIVAL_RELICS[R.id];
    $('biReward').innerHTML = rr ? 'Knock them out and choose one trophy: ' + rr.map(id => `<b>${esc(RELICS[id].name)}</b>`).join(' or ') + '.' : '';
    box.classList.remove('ready');
    box.querySelectorAll('.bi-bar, .bi-card, .bi-name, .bi-quote, .bi-desc, .bi-reward').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
    UI.show('bossIntro');
    clearTimeout(UI.biTimer);
    UI.biTimer = setTimeout(() => box.classList.add('ready'), 1800);
  },
  rivalBars(R) {
    return `<div class="rbars">${RIVAL_ATTRS.map((a, i) => `<span>${a}</span><div class="dbar">${Array.from({ length: 5 }, (_, k) => `<i class="${k < R.attrs[i] ? 'on' : ''}"></i>`).join('')}</div>`).join('')}</div>`;
  },
  openBossIntro(e, idx) {
    $('biFight').textContent = 'FIGHT';
    const d = e.def, box = $('bossIntro');
    box.classList.remove('foe'); box.querySelector('.bi-col.str h4').textContent = 'STRENGTHS'; box.querySelector('.bi-col.weak').style.display = ''; box.querySelector('.bi-col.weak h4').textContent = 'WEAKNESSES';
    box.style.setProperty('--bc', d.color);
    const n = G.bossRoster.length, pips = Array.from({ length: n }, (_, i) => `<i class="${i < idx % n ? 'done' : i === idx % n ? 'now' : ''}"></i>`).join('');
    $('biCount').innerHTML = `BOSS ${idx % n + 1} OF ${n} THIS RUN ${pips} <span>${BOSSES.length} IN THE WARD${idx >= n ? ' | ROUND ' + (Math.floor(idx / n) + 1) : ''}</span>`;
    $('biTitle').textContent = d.title;
    $('biName').textContent = d.twins ? 'MITCH & OSIS' : d.name;
    $('biQuote').textContent = d.quote;
    $('biDesc').textContent = d.desc;
    const li = (arr, base) => arr.map((t, i) => `<li style="animation-delay:${(base + i * 0.18).toFixed(2)}s">${esc(t)}</li>`).join('');
    $('biStr').innerHTML = li(d.strengths, 1.9);
    $('biWeak').innerHTML = li(d.weaknesses, 2.1);
    $('biReward').innerHTML = 'Beat it and choose one trophy: ' + d.relics.map(id => `<b>${esc(RELICS[id].name)}</b>`).join(', ') + '.';
    box.classList.remove('ready');
    // Restart the animations.
    box.querySelectorAll('.bi-bar, .bi-warn, .bi-card, .bi-name, .bi-quote, .bi-desc, .bi-reward').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
    UI.show('bossIntro');
    clearTimeout(UI.biTimer);
    UI.biTimer = setTimeout(() => box.classList.add('ready'), 2600);
  },

  // ---------------------------------------------------------------- loot
  openLoot(req) {
    // A skipped box makes the next ordinary one rarer (G.rarBoost, used up here, kept on the box for rerolls).
    if (RAR_SKIP[req.kind] != null && req.boost == null) { req.boost = G.rarBoost || 0; G.rarBoost = 0; }
    // New weapons and upgrade paths get the full Weapon Draft treatment.
    if (req.kind === 'start' || req.kind === 'slot' || req.kind === 'branch' || req.kind === 'sfork') { UI.openDraft(req); if (req.kind !== 'level') return; } // (every weapon and spell choice gets the draft screen)
    G.state = 'loot';
    UI.lootReq = req;
    UI.lootOpts = UI.sortLoot(genLoot(req));
    const titles = {
      start: ['CHOOSE YOUR FIRST WEAPON', 'Complimentary starter DNA. Yes, sperm can carry guns in their genes now. Do not ask the biology department.'],
      slot: ['NEW WEAPON SLOT!', 'You grew a new weapon mount. Something shiny for it, Rare or better.'],
      level: ['LEVEL ' + G.level + '!', pick(['Fresh DNA. Splice in one gene. Choose wisely. Or quickly.', 'Fresh DNA! Some base pairs may have shifted during your near-death experience.', 'A strand of DNA. The lab had some spare. Do not ask where from.'])],
      chest: ['DONOR DNA', pick(['Epic or better. From an anonymous donor. Do not ask which one.', 'Epic or better. It wriggles. That is probably fine.'])],
      myth: ['ACHIEVEMENT DNA', 'Mythical or Immaculate, every card. Earned, not given. Do not waste it.'],
      boss: ['BOSS DNA', 'Epic or better. Extracted from a still-warm corpse. The genes are yours now. The smell is extra.'],
      branch: ['UPGRADE BRANCH', 'Your weapon hit a milestone. Pick its new trick. The others go in the bin. Forever. No pressure.'],
      sfork: ['FEAT PATH', 'Your Feat hit Lv 4. Pick how it grows up. The other one goes in the bin.'],
      rrelic: ['RIVAL TROPHY', 'They will not be needing it. Choose one; the other goes with them.'],
      relic: ['BOSS TROPHY', 'Choose one. It changes everything, permanently. The others go down with the boss.'],
      spoils: ['SPOILS', 'Picked from the wreckage. Choose one.'],
      vesicle: ['MUTATION', 'Four horribly unstable mutations, borrowed from a passing stranger. Staple one to your genome. You only have room for so many before you pop.'],
      splice: ['SPLICE A SEQUENCE', 'Force another Epigenetic Profile into your RNA. It works at half strength, and its weapons start turning up in drafts.'],
    };
    UI.pickedOne = false;
    if (req.kind === 'relic') titles.relic[0] = 'RELIC: ' + bossDef(req.boss).name.replace(/^THE /, '');
    if (req.kind === 'rrelic') { const V = RIVALS.find(x => x.id === req.rid); if (V) titles.rrelic[0] = 'RELIC: ' + V.name.toUpperCase(); }
    if (req.kind === 'sfork') { const sw = G.spells.find(x => x && x.uid === req.uid); if (sw) titles.sfork[0] = sw.def.name.toUpperCase() + ': LV ' + SPELL_FORK_LV + ' PATH'; }
    if (req.kind === 'branch') { const bw = G.weapons.find(x => x && x.uid === req.uid); if (bw) titles.branch[0] = bw.def.name.toUpperCase() + ': LV ' + req.lvl + (bw.def.sig && bw.def.sig[req.lvl] ? (req.lvl >= 10 ? ' MASTERY' : ' SIGNATURE') : ' BRANCH'); }
    $('lootTitle').textContent = titles[req.kind][0];
    if (req.kind !== 'start') achieve('firstloot');
    if (req.kind === 'level' && Math.random() < 0.3) sysLine('level');
    $('lootSub').textContent = req.kind === 'relic' ? titles.relic[1] : (lootStory(req) || titles[req.kind][1]) + (G.relics.twinpick && req.kind !== 'start' && req.kind !== 'branch' && req.kind !== 'sfork' && req.kind !== 'rrelic' ? ' SECONDS: take two.' : '');
    const box = $('lootBox');
    box.className = 'box ' + req.kind;
    // Loot boxes are gold; a branch choice is an upgrade, so it's cyan.
    const kc = req.kind === 'branch' || req.kind === 'sfork' ? PAL.upgrade : PAL.reward;
    box.style.setProperty('--bc', kc); $('lootTitle').style.color = kc;
    void box.offsetWidth; // restart animation
    box.classList.add('opening');
    $('lootCards').innerHTML = '';
    $('lootCards').classList.remove('ready');
    UI.renderLootCards();
    UI.rarityBanner();
    $('rerollBtn').style.display = req.kind === 'start' || req.kind === 'branch' || req.kind === 'sfork' || req.kind === 'relic' || req.kind === 'rrelic' || req.kind === 'spoils' ? 'none' : '';
    $('skipBtn').style.display = req.kind === 'splice' || RAR_SKIP[req.kind] != null ? '' : 'none';
    $('skipBtn').textContent = RAR_SKIP[req.kind] != null ? `SKIP: NEXT IS ${RARITIES[Math.min(4, RAR_SKIP.level + (req.boost || 0) + 1)].name.toUpperCase()}+` : spliceSkipMut() ? 'SKIP: TAKE A MUTATION' : 'SKIP (+2 REROLLS)';
    UI.updateReroll();
    UI.show('loot');
    INPUT.active = false; G.manual = null;
    lootSound(req.kind, Math.max(...UI.lootOpts.map(o => o.rarity || 0)), UI.lootOpts.some(o => o.cursed), UI.lootOpts.length);
    clearTimeout(UI.lootTimer);
    UI.lootOpenT = performance.now(); UI.freeRerollUsed = false;
    G.stats.boxes = (G.stats.boxes || 0) + 1; { const bb = G.stats.boxBy || (G.stats.boxBy = {}); bb[req.kind] = (bb[req.kind] || 0) + 1; }
    UI.lootTimer = setTimeout(() => $('lootCards').classList.add('ready'), 650);
  },

  // Legendary and up: a ribbon and a light sweep. Mythical and Immaculate also show their bonus effect.
  rarityFlair(o) { return o.rarity >= 4 && !o.cursed ? `<i class="sheen"></i><span class="rrib">${RARITIES[o.rarity].name.toUpperCase()}</span>` : ''; },
  boonHtml(o) { if (!o.boon) return ''; const B = BOONS[o.boon]; return `<div class="cboon"><b>${RARITIES[o.rarity].name.toUpperCase()} BONUS: ${esc(B.name)}</b><span>${esc(B.desc)}</span></div>`; },
  // The box announces its best card when it's Legendary or better.
  rarityBanner() {
    const el = $('rarBanner'), best = Math.max(...UI.lootOpts.filter(o => !o.cursed).map(o => o.rarity || 0));
    el.className = '';
    if (best < 4) { el.textContent = ''; return; }
    const R = RARITIES[best];
    el.textContent = R.name.toUpperCase() + (best >= 6 ? ' DNA!!!' : best >= 5 ? ' DNA!!' : ' DNA!');
    el.style.setProperty('--rar', R.color);
    void el.offsetWidth; el.className = 'on r-' + R.id;
    if (best >= 5) { vibrate([80, 50, 160]); cam.shake = 10; }
  },
  // Weapon upgrades first, in their own section.
  sortLoot(opts) { return opts.filter(o => o.wup).concat(opts.filter(o => !o.wup)); },

  renderLootCards() {
    const wrap = $('lootCards');
    clearPreviews(wrap);
    wrap.innerHTML = '';
    const nW = UI.lootOpts.filter(o => o.wup).length;
    UI.lootOpts.forEach((o, i) => {
      if (nW && i === 0) wrap.insertAdjacentHTML('beforeend', '<div class="lsec">UPGRADE A WEAPON</div>');
      if (nW && i === nW && i < UI.lootOpts.length) wrap.insertAdjacentHTML('beforeend', '<div class="lsec">OR SPLICE IN</div>');
      if (o.wup) { wrap.appendChild(UI.upgradeCard(o, i)); return; }
      const r = RARITIES[o.rarity];
      const c = document.createElement('button');
      c.className = 'card r-' + r.id + (o.fusion ? ' fusion' : '') + (o.cursed ? ' cursed' : '') + (o.tag.startsWith('MODIFIER') ? ' mod' : '');
      c.style.setProperty('--rar', r.color);
      c.style.setProperty('--rc', o.cursed ? cardCat(o) : r.color); // the border is the rarity colour
      c.style.setProperty('--ic', cardCat(o));
      c.style.animationDelay = (0.45 + i * 0.12) + 's';
      // Only weapons and spells have real icons; the two-letter badges are gone until proper icons are drawn.
      c.classList.toggle('noico', !o.def);
      const el = o.elem ? `<span class="el" style="color:${elemCol(o.elem)}">${ELEMENTS[o.elem].name}</span>` : '';
      c.innerHTML = `<div class="tag">${esc(o.tag)} <b>${esc(r.name)}</b></div>
        ${o.def ? `<div class="cico" style="--ic:${elemCol(o.elem)}">${iconSVG(o.def, 28, elemCol(o.elem))}</div>` : ''}
        <div class="ctitle"${o.elem && !o.cursed ? ` style="color:${elemCol(o.elem)}"` : ''}>${esc(o.title)}</div>
        <div class="csub">${esc(o.sub)} ${el}</div>
        <div class="cdesc">${esc(o.desc)}</div>${o.pickW ? UI.pickChips(o) : ''}${o.modFor ? `<div class="cfor">For weapon: <b>${esc(o.modFor)}</b></div>` : ''}${UI.boonHtml(o)}${o.quip ? `<div class="cquip">${esc(o.quip)}</div>` : ''}${UI.rarityFlair(o)}`;
      // Tap to take it; press and hold for the card in full, with every bit of jargon explained (glossary.js).
      holdable(c, () => cardGlossary(o), ev => {
        if (!$('lootCards').classList.contains('ready')) return;
        // Only a tap that started on this screen picks a card (not one left over from skipping the intro
        // or steering when the box popped up).
        if (!(UI.lastDown > UI.lootOpenT)) return;
        if (o.pickW) {
          // Tuning cards: tap the weapon to tune (or anywhere, if there is only one).
          const chip = ev.target.closest('.wchip');
          if (chip) { UI.pickLoot(i, +chip.dataset.w); return; }
          if (o.pickW.length === 1) { UI.pickLoot(i, o.pickW[0].uid); return; }
          c.classList.remove('nudge'); void c.offsetWidth; c.classList.add('nudge');
          return;
        }
        UI.pickLoot(i);
      });
      wrap.appendChild(c);
    });
  },

  pickChips(o) {
    return `<div class="wpick"><span class="wpl">TAP A WEAPON:</span>${o.pickW.map(t => `<span class="wchip" data-w="${t.uid}" title="${esc(t.def.name)}" style="--c:${elemCol(t.def.elem)}">${iconSVG(t.def, 28, elemCol(t.def.elem))}<em>${t.n}/${t.max}</em></span>`).join('')}</div>`;
  },
  pickLoot(i, wuid) {
    const o = UI.lootOpts[i];
    if (!o || o.taken) return;
    clearPreviews();
    o.apply(wuid);
    sfx('pickup');
    // Twin Pick relic: DNA strands let you take a second card.
    const k = UI.lootReq && UI.lootReq.kind;
    if ((G.relics.twinpick || (k === 'vesicle' && G.vesTwo)) && !UI.pickedOne && k !== 'start' && k !== 'slot' && k !== 'branch' && k !== 'sfork' && k !== 'relic' && k !== 'rrelic' && UI.lootOpts.length > 1) {
      UI.pickedOne = true; o.taken = true;
      const el = $('lootCards').children[i]; if (el) { el.style.opacity = '0.3'; el.style.pointerEvents = 'none'; }
      $('lootSub').textContent = 'Seconds: take one more.';
      return;
    }
    G.state = 'play';
    UI.show('hud');
    UI.refreshHud(true);
    lastTs = performance.now();
  },

  reroll() {
    if (!G || !$('lootCards').classList.contains('ready')) return;
    // The Re-Roller of Dice: the first one per screen is free. Water Bear Armour: sometimes it isn't used up.
    const free = (mutOn('rerolldice') && !UI.freeRerollUsed) || (mutOn('waterbear') && Math.random() < 0.35);
    if (!free && G.rerolls <= 0) return;
    if (mutOn('rerolldice') && !UI.freeRerollUsed) UI.freeRerollUsed = true;
    if (!free) G.rerolls--;
    UI.lootOpts = UI.sortLoot(genLoot(UI.lootReq));
    UI.renderLootCards();
    UI.rarityBanner();
    UI.updateReroll();
  },
  updateReroll() { const free = mutOn('rerolldice') && !UI.freeRerollUsed; $('rerollBtn').textContent = free ? 'REROLL (FREE)' : `REROLL (${G.rerolls})`; $('rerollBtn').disabled = !free && G.rerolls <= 0 && !mutOn('waterbear'); },

  // ---------------------------------------------------------------- pause & directives
  // Every buff and debuff you have right now, with what it does and how long it has left (statusintro.js).
  openStatusPanel() {
    if (!G || G.state !== 'play') return;
    G.state = 'pause'; INPUT.active = false; G.manual = null;
    const rows = (UI.chips || []).map(([label, colour]) => {
      const key = statusKey(label) || label.replace(/\s*[\d:].*$/, ''), I = statusInfo(key), t = statusTimer(key);
      return `<div class="li"><b style="color:${colour}">${esc(key)}</b> <em>${I ? (I.buff ? 'BUFF' : 'DEBUFF') : ''}${t != null ? ' | ' + Math.ceil(t) + 's left' : ''}</em><br><span>${esc(I ? I.what + ' ' + I.tip : label)}</span></div>`;
    });
    $('stBody').innerHTML = rows.length ? `<div class="list">${rows.join('')}</div>` : '<p class="hint">Nothing active right now.</p>';
    UI.show('stpanel');
  },
  closeStatusPanel() { if (G && G.state === 'pause') { G.state = 'play'; UI.show('hud'); UI.refreshHud(true); lastTs = performance.now(); } },
  togglePause() {
    if (!G) return;
    if (G.state === 'play') { G.state = 'pause'; INPUT.active = false; G.manual = null; UI.pauseTab = 'you'; UI.renderPause(); UI.show('pause'); }
    else if (G.state === 'pause') { G.state = 'play'; UI.show('hud'); UI.refreshHud(true); lastTs = performance.now(); }
  },

  renderPause() {
    const box = $('pauseBody'), tab = UI.pauseTab || 'you';
    let h = `<div class="ptabs">${[['you', 'YOU'], ['run', 'RUN'], ['build', 'BUILD'], ['show', 'THE LAB'], ['codex', 'GUIDE']].map(([id, l]) => `<button class="chip ${tab === id ? 'sel' : ''}" data-ptab="${id}">${l}</button>`).join('')}</div>`;
    if (tab === 'run') {
    h += `<div class="sec"><h3>Autorun directive</h3><div class="chips">`;
    for (const m of MOVE_DIRECTIVES) h += `<button class="chip ${G.moveDir === m.id ? 'sel' : ''}" data-move="${m.id}">${m.name}</button>`;
    h += `</div><p class="hint">${esc(MOVE_DIRECTIVES.find(m => m.id === G.moveDir).desc)}. Drag anywhere on screen to steer manually.</p></div>`;
    h += `<div class="sec"><h3>Game speed</h3><div class="chips">${SPEED_OPTS.map(v => `<button class="chip ${gameSpeed() === v ? 'sel' : ''}" data-spd="${v}">x${v}</button>`).join('')}</div></div>`;

    h += `<div class="sec"><h3>The race</h3><p class="hint">Sperm count: <b>${spermCount().toLocaleString('en-GB')}</b>. ${G.fertile ? 'It is one. It is you. Swim into the egg.' : G.showdown ? 'The Final Five are here: beat them all and the egg is yours.' : 'It falls as time passes, as you grow and as you kill rival swimmers. At six, the Final Five come for you.'} Weapon mounts: ${G.weapons.length}/${MAX_WEAPONS} (next draft at level ${SLOT_LEVELS.find(l => l > G.level) || 'none'}). Rewind charges ${G.chrono.charges}/${G.chrono.max}.${vetK() ? ` Veteran: your Gene Bank upgrades are strong, so germs have +${Math.round(vetK() * VET.hp * 100)}% HP and +${Math.round(vetK() * VET.dmg * 100)}% damage (bosses and rivals +${Math.round(vetK() * VET.big * 100)}% HP).` : ''} The egg's warm glow heals you (NEST autorun keeps you in it).</p>
</div>`;
    }
    if (tab === 'show') {
    // Achievements and the show.
    const got = G.show.order;
    h += `<div class="sec"><h3>Achievements (${got.length}/${Object.keys(ACHIEVEMENTS).length}) | ${showWord()} ${fmtViewers(G.show.viewers)}</h3>`;
    h += got.length ? `<div class="list">${got.map(id => `<div class="li on"><b>${esc(ACHIEVEMENTS[id].name)}</b><br><span>${esc(ACHIEVEMENTS[id].desc)}</span></div>`).join('')}</div>` : `<p class="hint">None yet. The lab is waiting.</p>`;
    const cur = Object.keys(G.curses);
    if (cur.length) h += `<p class="hint">Curses: ${cur.map(id => esc(CURSES.find(c => c.id === id).name)).join(', ')}</p>`;
    h += `</div>`;
    }
    if (tab === 'build') {
    // Your genome: sequences and mutations.
    if (G.genes) {
      const gs = G.genes.active.map(id => `<div class="li on"><b>${esc(PROFILES[id].name)}</b> ${id === G.genes.primary ? '(PRIMARY)' : '(spliced, half strength)'} Rank ${profRank(id)}<br><span>${esc(PROFILES[id].trait)}: ${esc(PROFILES[id].fmt(G.genes.k[id] || 0))}</span></div>`).join('');
      const sy = PROFILE_SYNERGIES.filter(q => synOn(q.a, q.b)).map(q => `<div class="li on"><b style="color:${PAL.upgrade}">${esc(q.name)}</b><br><span>${esc(q.desc)}</span></div>`).join('');
      const ms = Object.keys(G.mut).map(id => G.mutHidden[id] ? `<div class="li"><b>Mystery Meat</b><br><span>Something inside is doing something.</span></div>` : `<div class="li"><b>${esc(MUTATIONS[id].name)}</b><br><span>${esc(MUTATIONS[id].desc)}</span></div>`).join('');
      h += `<div class="sec"><h3>Your genome</h3><div class="list">${gs}${sy}</div><h3 style="margin-top:10px">Mutations (${mutCount()}/${mutCap()})</h3>${ms ? `<div class="list">${ms}</div>` : '<p class="hint">None yet. Skip a sequence splice to take one.</p>'}${typeof junkHtml === 'function' ? junkHtml() : ''}</div>`;
    }
    // Synergies.
    h += `<div class="sec"><h3>Damage-type synergies (own 2+ of one damage type)</h3><div class="list">`;
    for (const el in SYNERGIES) {
      const on = !!G.synergy[el];
      h += `<div class="li ${on ? 'on' : ''}"><b>${SYNERGIES[el].name}</b> ${on ? '(ACTIVE)' : ''}<br><span>${ELEMENTS[el].name}: ${esc(SYNERGIES[el].desc)}</span></div>`;
    }
    h += `</div></div>`;

    // Passives.
    const ps = Object.keys(G.passives);
    const st = Object.keys(DYES).filter(id => G.dyes && G.dyes[id]);
    h += `<div class="sec"><h3>Stains (${st.length}/${Object.keys(DYES).length})</h3>${UI.stainsHtml()}</div>`;
    const rl = Object.keys(G.relics);
    if (rl.length) h += `<div class="sec"><h3>Boss trophies</h3><div class="list">${rl.map(id => `<div class="li on"><b style="color:${PAL.reward}">${esc(RELICS[id].name)}</b><br><span>${esc(RELICS[id].desc)}</span></div>`).join('')}</div></div>`;
    h += `<div class="sec"><h3>Power-ups</h3>`;
    h += ps.length ? `<div class="list">${ps.map(id => `<div class="li on"><b>${esc(PASSIVES[id].name)}</b> x${G.passives[id]}</div>`).join('')}</div>` : `<p class="hint">None yet.</p>`;
    h += `<p class="hint">Crit ${Math.round(G.P.crit * 100)}% | Crit dmg ${Math.round(G.P.critDmg * 100)}% | Armour ${G.P.armour} | Dodge ${Math.round(G.P.dodge * 100)}% | Speed ${Math.round(G.P.speed * 100)}% | Traction ${Math.round(G.P.traction * 100)}%</p></div>`;

    }
    if (tab === 'you') h += UI.youHtml();
    if (tab === 'codex') h += UI.codexHtml();
    box.innerHTML = h;
    box.querySelectorAll('[data-ptab]').forEach(b => b.addEventListener('click', () => { UI.pauseTab = b.dataset.ptab; UI.renderPause(); $('pause').scrollTop = 0; }));
    UI.bindCodex(box, () => { const y = $('pause').scrollTop; UI.renderPause(); $('pause').scrollTop = y; });
    if (tab === 'codex') portraitsStart(box);
    box.querySelectorAll('[data-yk]').forEach(b => b.addEventListener('click', () => { G.state = 'play'; UI.openArmoury(b.dataset.yk, +b.dataset.yi); }));
    box.querySelectorAll('[data-spd]').forEach(b => b.addEventListener('click', () => { SET.speed = +b.dataset.spd; saveSettings(); UI.renderPause(); UI.syncSpeed(); }));
    box.querySelectorAll('[data-pst]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.pst, off = META.pstainOff || (META.pstainOff = {});
      if (off[id]) delete off[id]; else off[id] = 1;
      saveMeta();
      if (!G.dyeBoon[id]) { if (off[id]) delete G.dyes[id]; else G.dyes[id] = true; refreshPalette(); }
      const y = $('pause').scrollTop; UI.renderPause(); $('pause').scrollTop = y;
    }));
    if (typeof grantsBind === 'function') grantsBind(box, () => { const y = $('pause').scrollTop; UI.renderPause(); $('pause').scrollTop = y; });
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

  // ---------------------------------------------------------------- pause: you, on one page
  // Your swimmer: a big portrait, then its sequences and ability, stats, spells, weapons and everything else.
  youHtml() {
    const P = G.P, p = G.player, pr = G.genes ? G.genes.primary : 'vanguard', L = SEQ_LOOK[pr] || SEQ_LOOK.vanguard;
    const pc0 = v => Math.round(v * 100) + '%', plus = v => (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
    const li = (name, body, color, on) => `<div class="li ${on === false ? '' : 'on'}"><b${color ? ` style="color:${color}"` : ''}>${name}</b>${body ? `<br><span>${body}</span>` : ''}</div>`;
    const seqs = G.genes ? G.genes.active : [pr];
    let h = `<div class="youTop" style="--c:${L.color}"><canvas id="youCan"></canvas><div class="youCap"><b>${esc((PROFILES[pr] || {}).name || '')}</b><span>${seqs.length > 1 ? 'Spliced with ' + seqs.filter(id => id !== pr && PROFILES[id]).map(id => esc(PROFILES[id].name)).join(' and ') : esc(L.tag)} | Level ${G.level} | HP ${Math.ceil(p.hp)}/${Math.round(P.maxHp)}</span></div></div>`;
    // Sequences and abilities.
    const A = SEQ_ABILITY[pr];
    let sq = A ? li(`${esc(A.name)} <em class="ycd">every ${A.cd}s</em>`, esc(A.desc), L.color) : '';
    for (const id of seqs) if (PROFILES[id]) sq += li(`${esc(PROFILES[id].name)} ${id === pr ? '(PRIMARY)' : '(spliced, half strength)'} Rank ${profRank(id)}`, `${esc(PROFILES[id].trait)}: ${esc(PROFILES[id].fmt(G.genes ? G.genes.k[id] || 0 : 0))}`);
    for (const q of PROFILE_SYNERGIES.filter(q => synOn(q.a, q.b))) sq += li(esc(q.name), esc(q.desc), PAL.upgrade);
    if (rebornK()) { const n = G.memories || 0; sq += li(`Memories of a past life (${n}/6)`, n ? MEMORIES.slice(0, n).map(m => esc(m.text) + ' <i>' + esc(m.gift) + '</i>').join('<br>') : 'None yet: the first surfaces at level 6.', REBORN.color); }
    h += `<div class="sec"><h3>Sequences and abilities</h3><div class="list">${sq}</div></div>`;
    // Stats.
    const T = [];
    const t = (label, val) => T.push(`<div class="tile"><b>${val}</b><span>${label}</span></div>`);
    t('Max HP', Math.round(P.maxHp)); t('Damage', plus(P.might - 1)); t('Fire rate', plus(P.haste - 1));
    t('Reload speed', plus(P.reloadSpd - 1)); t('Crit chance', pc0(P.crit)); t('Crit damage', pc0(P.critDmg));
    t('Armour', P.noArmour ? 'none' : P.armour); t('Dodge', pc0(P.dodge)); t('Regen', (P.regen * Math.max(1, P.maxHp / 120)).toFixed(1) + '/s');
    t('Heal per kill', P.lifesteal.toFixed(2)); t('Speed', pc0(P.speed)); t('Traction', pc0(P.traction));
    t('Pickup range', pc0(P.magnet)); t('Luck', plus(P.luck)); t('XP gain', pc0(P.xp));
    t('Area', pc0(P.area)); t('Duration', pc0(P.dur)); t('Range', pc0(P.range));
    t('Extra shots', '+' + P.multishot); t('Pierce', '+' + P.pierce); t('Feat cooldown', pc0(P.cdr));
    const el = Object.keys(P.elem).filter(k => Math.abs(P.elem[k] - 1) > 0.001 && ELEMENTS[k]);
    h += `<div class="sec"><h3>Stats</h3><div class="tiles">${T.join('')}</div>${el.length ? `<p class="hint">Damage types: ${el.map(k => `<b style="color:${elemCol(k)}">${esc(ELEMENTS[k].name)}</b> ${plus(P.elem[k] - 1)}`).join(' | ')}</p>` : ''}</div>`;
    // Spells and weapons.
    const slot = (w, i, k) => {
      const c = elemCol(wElem(w)), sub = [];
      if (w.isSpell) {
        sub.push(`Cooldown ${w.s.cd.toFixed(1)}s`);
        const f = w.fork && SPELL_FORKS[w.id] ? SPELL_FORKS[w.id][w.fork === 'a' ? 0 : 1] : null;
        if (f) sub.push(`<b>${esc(f.name)}</b>: ${esc(f.desc)}`); else if (w.lvl < SPELL_FORK_LV && SPELL_FORKS[w.id]) sub.push(`Picks a path at Lv ${SPELL_FORK_LV}`);
      } else {
        if (!w.def.noTarget) sub.push('Targets ' + esc((w.dirs ? w.dirs.map(d => DIRECTIVES.find(x => x.id === d).short).join(' / ') : (DIRECTIVES.find(x => x.id === w.dir) || {}).name || '')));
        const pk = Object.keys(w.perks || {}).sort((a, b) => a - b).map(l => `<b>${esc(perkDef(w.perks[l]).name)}</b> (Lv ${l})`);
        if (pk.length) sub.push(pk.join(', '));
        if (w.mods.length) sub.push('Mods: ' + w.mods.map(m => esc(MODS[m.id].name)).join(', '));
        if (w.wpN && Object.keys(w.wpN).length) sub.push('Tuned: ' + Object.entries(w.wpN).map(([id, n]) => esc(PASSIVES[id].name) + ' x' + n).join(', '));
        const dm = (G.stats.wdmg || {})[w.uid]; if (dm) sub.push(`${fmtNum(dm)} damage this run`);
      }
      return `<button class="yslot" data-yk="${k}" data-yi="${i}" style="--c:${c}"><i>${iconSVG(w.def, 30, c)}</i><div><b>${esc(w.def.name)}</b> <em>Lv ${w.lvl}${!w.isSpell && w.lvl >= MAX_WLVL ? ' MASTERY' : ''}</em><br><span>${sub.join('<br>')}</span></div></button>`;
    };
    const sp = G.spells.map((w, i) => w && slot(w, i, 's')).filter(Boolean), wp = G.weapons.map((w, i) => w && slot(w, i, 'w')).filter(Boolean);
    h += `<div class="sec"><h3>Feats (${sp.length}/${G.spells.length})</h3>${sp.length ? sp.join('') : '<p class="hint">None yet. Feats show up in DNA strands while you have a free slot.</p>'}</div>`;
    h += `<div class="sec"><h3>Weapons (${wp.length}/${MAX_WEAPONS})</h3>${wp.join('')}<p class="hint">Tap one to open it in the Tackle Box.</p></div>`;
    // The rest.
    let r = '';
    const cb = Object.keys(G.combo || {}).filter(id => COMBO_BY[id]).map(id => li(esc(COMBO_BY[id].name), esc(COMBO_BY[id].desc), PAL.upgrade));
    const pa = PAIRINGS.filter(q => G.pair && G.pair[q.id]).map(q => li(esc(q.name), esc(q.desc), PAL.upgrade));
    if (cb.length || pa.length) r += `<h3>Combos and pairings</h3><div class="list">${cb.join('')}${pa.join('')}</div>`;
    const sy = Object.keys(SYNERGIES).filter(e => G.synergy[e]).map(e => li(esc(SYNERGIES[e].name), `${ELEMENTS[e].name}: ${esc(SYNERGIES[e].desc)}`));
    if (sy.length) r += `<h3>Damage-type synergies</h3><div class="list">${sy.join('')}</div>`;
    const ms = Object.keys(G.mut).map(id => G.mutHidden[id] ? li('Mystery Meat', 'Something inside is doing something.') : li(esc(MUTATIONS[id].name), esc(MUTATIONS[id].desc)));
    if (typeof junkHtml === 'function') r += junkHtml(true);
    r += `<h3>Mutations (${mutCount()}/${mutCap()})</h3>${ms.length ? `<div class="list">${ms.join('')}</div>` : '<p class="hint">None yet.</p>'}`;
    const rl = Object.keys(G.relics || {}).filter(id => RELICS[id]).map(id => li(esc(RELICS[id].name), esc(RELICS[id].desc), PAL.reward));
    if (rl.length) r += `<h3>Trophies</h3><div class="list">${rl.join('')}</div>`;
    const bn = Object.keys(G.boons || {}).filter(id => BOONS[id]).map(id => li(esc(BOONS[id].name), esc(BOONS[id].desc), PAL.reward));
    if (bn.length) r += `<h3>Boons</h3><div class="list">${bn.join('')}</div>`;
    const ps = Object.keys(G.passives).filter(id => PASSIVES[id] && G.passives[id] > 0);
    r += `<h3>Power-ups</h3>${ps.length ? `<div class="list">${ps.map(id => li(`${esc(PASSIVES[id].name)} x${G.passives[id]}`, esc(PASSIVES[id].fmt(PASSIVES[id].v * G.passives[id])))).join('')}</div>` : '<p class="hint">None yet.</p>'}`;
    const st = Object.keys(DYES).filter(id => G.dyes && G.dyes[id]);
    r += `<h3>Stains (${st.length}/${Object.keys(DYES).length})</h3>${UI.stainsHtml()}`;
    const cu = Object.keys(G.curses || {}).map(id => CURSES.find(c => c.id === id)).filter(Boolean);
    if (cu.length) r += `<h3>Curses</h3><div class="list">${cu.map(c => li(esc(c.name), `${esc(c.boon)}. ${esc(c.bane)}.`, PAL.danger)).join('')}</div>`;
    h += `<div class="sec you-rest">${r}</div>`;
    return h;
  },
  // Stains as a colour key: what each colour on the slide means, the boon it brought, and what's still out there.
  stainsHtml() {
    const ids = Object.keys(DYES), got = ids.filter(id => G.dyes && G.dyes[id]), miss = ids.filter(id => !(G.dyes && G.dyes[id]) && !(G.wave && id === 'rival'));
    const sw = id => id === 'rival' ? `<i class="sw multi">${RIVALS.map(r => `<u style="background:${r.color}"></u>`).join('')}</i>` : `<i class="sw" style="background:${DYES[id].key}"></i>`;
    let h = got.length ? `<div class="list">${got.map(id => `<div class="li on stain">${sw(id)}<div><b>${esc(DYES[id].name)}</b><br><span>${esc(DYES[id].see)}.</span><br><span class="sb">${G.dyeBoon && G.dyeBoon[id] ? esc(DYES[id].boon) : 'Permanent stain: colour only (find it in a DNA strand for its boon).'}</span></div></div>`).join('')}</div>`
      : (typeof GRANT_ORDER !== 'undefined' && GRANT_ORDER.some(grantHas) ? '<p class="hint">No stain cards found this run yet.</p>' : '<p class="hint">None yet: the slide is all greyscale. Each stain brings back one kind of colour, and a boon.</p>');
    const perm = Object.keys(META.pstains || {}).filter(id => DYES[id]);
    if (perm.length) h += `<h3 style="margin-top:10px">Permanent stains</h3><div class="chips">${perm.map(id => { const on = !(META.pstainOff || {})[id]; return `<button class="chip ${on ? 'sel' : ''}" data-pst="${id}">${esc(DYES[id].name)}: ${on ? 'ON' : 'OFF'}</button>`; }).join('')}</div><p class="hint">Kept from earlier runs. Switch any off if you'd rather not see its colour.</p>`;
    if (typeof grantsHtml === 'function') h = grantsHtml() + h; // permanent stain grants first (grants.js)
    if (miss.length) h += `<p class="hint">Still to find (in DNA strands): ${miss.map(id => `<b>${esc(DYES[id].name)}</b>`).join(', ')}. Each brings back one kind of colour, and a boon.</p>`;
    return h;
  },
  // From UI.tick: animate the portrait while the YOU page is open.
  youTick(dt) {
    const cv = $('youCan');
    if (!cv || !G || G.state !== 'pause' || UI.pauseTab !== 'you') return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    UI.youT = (UI.youT || 0) + dt;
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    UI.youBody = UI.youBody || { x: 0, y: 0, vx: 0, vy: 0, id: -1 };
    drawYouPortrait(g, W, H, UI.youBody, 1000 + UI.youT);
  },

  // ---------------------------------------------------------------- sample select (levels)
  // One Epigenetic Profile: its trait at its current rank, how far to the next rank, or what unlocks it.
  profileHtml(id, opts) {
    const Pr = PROFILES[id], u = Pr.unlock, open = profUnlocked(id), r = profRank(id), kills = profKills(id), next = PROFILE_RANKS[r] || 0;
    const prog = !open ? `<em>LOCKED: ${esc(u.text)} (${fmtNum(Math.min(u.have(), u.need))}/${fmtNum(u.need)})</em>`
      : `<em>Rank ${r}${next ? ` | ${fmtNum(kills)}/${fmtNum(next)} kills to Rank ${r + 1}` : ' (max)'}</em>`;
    const syn = PROFILE_SYNERGIES.filter(q => q.a === id || q.b === id).map(q => `${esc(PROFILES[q.a === id ? q.b : q.a].name)}: ${esc(q.name)}`).join('; ');
    return `<b>${esc(Pr.name)}</b> <span class="brole">${esc(Pr.trait.toUpperCase())}</span><br><span>${esc(Pr.desc)} ${open ? esc(capFirst(Pr.fmt(profK(id, true)))) + ' as your Primary.' : ''}</span><br>${prog}`
      + (opts && opts.full ? `<br><span class="hint">Starting ability: ${esc(SEQ_ABILITY[id].name)}. ${esc(SEQ_ABILITY[id].desc)}</span><br><span class="hint">As your Primary it evolves at ${esc(evolveText(id))}.</span><br><span class="hint">Weapons: ${Pr.weapons.map(w => esc(WEAPONS[w].name)).join(', ')}.${syn ? ' Splice with ' + syn + '.' : ''}</span>` : '');
  },
  openSamples() {
    const best = UI.loadBest();
    // Developer mode (tap the title five times) shows the Lab Bench.
    let dev = false; try { dev = localStorage.getItem('sd_dev') === '1'; } catch (e) { /* storage unavailable */ }
    const shut = s => !s.open || (s.locked && s.locked());
    const by = id => SAMPLES.find(s => s.id === id);
    const extra = s => s.id === 's007' ? (META.lvBest && META.lvBest.mouth ? 'BEST ' + fmtTime(META.lvBest.mouth) : 'NOT YET BEATEN') : s.id === 's002' ? (best.campBest ? (best.campBest >= CAMP.waves ? 'BEATEN' : 'BEST: WAVE ' + best.campBest + ' OF ' + CAMP.waves) : '20 WAVES') : s.id === 's006' ? (best.wave ? 'BEST: WAVE ' + best.wave : 'NO END') : s.id === 's001' ? (best.born ? 'FASTEST ' + fmtTime(best.born) : 'ONE EGG') : '';
    // Line art for each mode, drawn in its accent colour.
    const ART = {
      s002: '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/><path d="M16 60h88M60 16v88M28 32l64 56M92 32L28 88" stroke="currentColor" stroke-width=".6" opacity=".3"/><circle cx="60" cy="60" r="9" fill="currentColor" opacity=".85"/><g fill="currentColor"><circle cx="34" cy="44" r="2.5"/><circle cx="82" cy="40" r="2"/><circle cx="76" cy="82" r="2.5"/><circle cx="40" cy="80" r="2"/></g></svg>',
      s001: '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="26" fill="currentColor" opacity=".18"/><circle cx="60" cy="60" r="26" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity=".6"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i / 8 * 6.283, x = 60 + Math.cos(a) * 50, y = 60 + Math.sin(a) * 50, tx = 60 + Math.cos(a) * 64, ty = 60 + Math.sin(a) * 64; return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.2" ry="2.2" fill="currentColor" transform="rotate(${(a * 57.3).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/><path d="M${x.toFixed(1)} ${y.toFixed(1)}Q${((x + tx) / 2 + 4).toFixed(1)} ${((y + ty) / 2 - 4).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}" stroke="currentColor" fill="none" stroke-width="1"/>`; }).join('') + '</svg>',
      s006: '<svg viewBox="0 0 120 120"><path d="M60 60c-14-20-40-20-40 0s26 20 40 0 40-20 40 0-26 20-40 0z" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/></svg>',
      s000: '<svg viewBox="0 0 120 120"><path d="M48 18h24M52 18v32L28 94a8 8 0 0 0 7 12h50a8 8 0 0 0 7-12L68 50V18" fill="none" stroke="currentColor" stroke-width="3"/><path d="M38 80h44" stroke="currentColor" opacity=".6"/></svg>',
    };
    const ACC = { s002: '#5fd4e8', s001: '#ffd6e8', s006: '#ffd23f', s000: '#9fb3c8' };
    const card = (s, hero) => `<button class="sx-card ${hero ? 'hero' : ''} ${shut(s) ? 'locked' : ''}" data-sample="${s.id}" style="--c:${ACC[s.id] || '#9fb3c8'}">
      <span class="sx-art">${ART[s.id] || ''}</span>
      <span class="sx-txt"><i>#${s.no} | ${esc(shut(s) ? 'LOCKED' : s.tag || 'IN STOCK')}</i><b>${esc(s.name)}</b>${hero ? `<span>${esc(s.desc)}</span>` : ''}<em>${esc(shut(s) ? (s.lockText || 'Locked.') : extra(s))}</em></span></button>`;
    const modes = ['s001', 's006'].concat(dev ? ['s000'] : []).map(by).filter(Boolean);
    // The campaign: a way into the body, one region at a time (the far ones are only rumours so far).
    const lvls = [by('s007'), by('s008'), { teaser: true, name: 'Level 3', no: '?' }, { teaser: true, name: 'Level 4', no: '?' }];
    const node = (s, i) => s.teaser
      ? `<div class="sx-node tease"><span class="sx-dot">${i + 1}</span><span class="sx-ni"><b>${esc(s.name)}</b><em>UNCHARTED</em></span></div>`
      : `<button class="sx-node ${shut(s) ? 'locked' : 'open'}" data-sample="${s.id}"><span class="sx-dot">${i + 1}</span><span class="sx-ni"><b>${esc(s.name)}</b><span>${esc(s.desc)}</span><em>${esc(shut(s) ? (s.lockText || 'Locked.') : extra(s))}</em></span></button>`;
    $('sampleList').innerHTML = `<div class="sx-h">MAIN EVENT</div>${card(by('s002'), true)}
      <div class="sx-h">QUICK RUNS</div><div class="sx-grid">${modes.map(s => card(s, false)).join('')}${dev ? `<button class="sx-card" id="devAll" style="--c:#ff9f43"><span class="sx-art">${ART.s000}</span><span class="sx-txt"><i>DEVELOPER</i><b>Unlock Everything</b><em>${UI.devArm ? 'TAP AGAIN TO CONFIRM' : 'ALL PROGRESS + 100K DNA'}</em></span></button>` : ''}</div>
      <div class="sx-h">THE CAMPAIGN <span>INTO THE BODY</span></div><div class="sx-path">${lvls.map(node).join('')}</div>`;
    $('sampleList').querySelectorAll('[data-sample]').forEach(b => b.addEventListener('click', () => {
      const s = SAMPLES.find(x => x.id === b.dataset.sample);
      if (!s.open || (s.locked && s.locked())) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); if (s.lockText) UI.toast(s.lockText.toUpperCase()); return; }
      UI.sample = s.id; openSeq();
    }));
    const da = $('devAll');
    if (da) da.addEventListener('click', () => {
      if (!UI.devArm) { UI.devArm = true; UI.openSamples(); return; }
      UI.devArm = false; devUnlockAll(); UI.toast('EVERYTHING UNLOCKED'); UI.openSamples();
    });
    UI.show('samples');
    const st = $('sampTitle');
    if (st && !st.dataset.dev) {
      st.dataset.dev = '1'; let taps = 0, last = 0;
      st.addEventListener('click', () => {
        const now = performance.now(); taps = now - last < 600 ? taps + 1 : 1; last = now;
        if (taps < 5) return;
        taps = 0; let on = false; try { on = localStorage.getItem('sd_dev') !== '1'; localStorage.setItem('sd_dev', on ? '1' : '0'); } catch (e) { /* storage unavailable */ }
        UI.toast(on ? 'DEVELOPER MODE: LAB BENCH ON' : 'DEVELOPER MODE OFF'); UI.openSamples();
      });
    }
  },

  // ---------------------------------------------------------------- Field Guide (from the pause menu, or the title screen between runs)
  codexHtml() {
    const run = !!G, cyan = PAL.upgrade, sec = UI.codexSec || 'all', box = (title, inner, hint) => `<div class="sec"><h3>${title}</h3>${hint ? `<p class="hint">${hint}</p>` : ''}${inner}</div>`;
    const wids = Object.keys(WEAPONS), used = wids.filter(id => META.wstats[id]);
    const pf = PAIRINGS.filter(q => META.pairs[q.id]), qs = Object.keys(QUIRKS), qf = qs.filter(id => META.quirks[id]);
    const beasts = Object.keys(META.seen || {}).filter(k => ENEMY_INTRO[k]).length;
    const met = Object.keys(META.bosses).length, rel = Object.keys(RELICS).filter(id => META.relics[id]);
    const pids = Object.keys(PROFILES), pu = pids.filter(profUnlocked), mids = Object.keys(MUTATIONS), mf = mids.filter(id => META.muts[id]);
    const got = used.length + pf.length + qf.length + met + rel.length + pu.length + mf.length + beasts, all = wids.length + PAIRINGS.length + qs.length + BOSSES.length + Object.keys(RELICS).length + pids.length + mids.length + Object.keys(ENEMY_INTRO).length;
    let h = `<div class="sec cdxhead"><div class="cdxpct"><b>${Math.round(got / all * 100)}%</b><span>FIELD GUIDE COMPLETE</span></div><div class="cdxbar"><i style="width:${(got / all * 100).toFixed(1)}%"></i></div>
      <div class="cdxcount"><span>Weapons ${used.length}/${wids.length}</span><span>Combos ${COMBOS.filter(c => META.combos && META.combos[c.id]).length}/${COMBOS.length}</span><span>Pairings ${pf.length}/${PAIRINGS.length}</span><span>Secrets ${qf.length}/${qs.length}</span><span>Enemies ${beasts}/${Object.keys(ENEMY_INTRO).length}</span><span>Bosses ${met}/${BOSSES.length}</span><span>Trophies ${rel.length}/${Object.keys(RELICS).length}</span><span>Sequences ${pu.length}/${pids.length}</span><span>Mutations ${mf.length}/${mids.length}</span></div></div>`;
    h += `<div class="chips cdxtabs">${[['all', 'ALL'], ['weapons', 'WEAPONS'], ['genes', 'SEQUENCES'], ['muts', 'MUTATIONS'], ['pairs', 'COMBOS'], ['secrets', 'SECRETS'], ['beasts', 'ENEMIES'], ['bosses', 'BOSSES'], ['rules', 'RULES']].map(([id, l]) => `<button class="chip ${sec === id ? 'sel' : ''}" data-cdx="${id}">${l}</button>`).join('')}</div>`;
    const show = id => sec === 'all' || sec === id;
    if (show('weapons')) {
      let l = '';
      for (const id of wids) {
        const d = WEAPONS[id], r = META.wstats[id], own = run && G.weapons.some(w => w && w.id === id);
        l += `<div class="li cdxw ${own ? 'on' : ''}"><span class="bico">${iconSVG(d, 22, r ? elemCol(d.elem) : '#ffffff40')}</span><div><b style="color:${r ? 'inherit' : '#ffffff80'}">${esc(d.name)}</b> <span class="brole">${esc((d.role || '').toUpperCase())}${d.toy ? ' | TOY' : ''}</span><br><span>${esc(d.play || d.desc)}</span><br><em>${r ? `${r.runs} run${r.runs > 1 ? 's' : ''}, born ${r.born}, best Lv ${r.best}` : 'Never taken into a run.'}</em></div></div>`;
      }
      h += box(`Weapons (${used.length}/${wids.length} used)`, `<div class="list">${l}</div>`, 'Every weapon in the fridge. Take one into a run to log it.');
    }
    if (show('genes')) {
      h += box(`Epigenetic Profiles (${pu.length}/${pids.length} unlocked)`, `<div class="list">${pids.map(id => `<div class="li ${run && genesOn(id) ? 'on' : ''}">${UI.profileHtml(id, { full: true })}</div>`).join('')}</div>`, 'Pick your Primary Sequence after choosing a sample, before a run.');
      h += box('Sequence synergies', `<div class="list">${PROFILE_SYNERGIES.map(q => `<div class="li ${run && synOn(q.a, q.b) ? 'on' : ''}"><b>${esc(q.name)}</b><br><span>${esc(PROFILES[q.a].name)} + ${esc(PROFILES[q.b].name)}: ${esc(q.desc)}</span></div>`).join('')}</div>`);
    }
    if (show('muts')) {
      h += box(`Mutations found (${mf.length}/${mids.length})`, `<div class="list">${mids.map(id => { const k = META.muts[id], M = MUTATIONS[id]; return `<div class="li ${run && G.mut && G.mut[id] ? 'on' : ''}"><b style="color:${k ? cyan : 'inherit'}">${k ? esc(M.name) : '???'}</b><br><span>${k ? esc(M.desc) : 'Not stapled to your genome yet.'}</span></div>`; }).join('')}</div>`, 'They come from skipping a sequence splice, and from stashes hidden in campaign levels: pick one of four.');
    }
    if (show('pairs')) {
      let lc = '';
      for (const c of COMBOS) {
        const known = META.combos && META.combos[c.id], on = run && G.combo && G.combo[c.id];
        const seqOf = id => { const k = Object.keys(PROFILES).find(p => PROFILES[p].weapons.includes(id)); return k ? SEQ_LOOK[k].short : 'Wildcard'; };
        const sa = seqOf(c.a), sb = seqOf(c.b);
        lc += `<div class="li ${on ? 'on' : ''}"><b style="color:${known ? '#ff3df2' : 'inherit'}">${esc(c.name)}</b>${on ? ' (FUSED)' : known ? '' : ' (not fused yet)'}<br><span>${esc(WEAPONS[c.a].name)} + ${esc(WEAPONS[c.b].name)} (${sa === sb ? esc(sa) : esc(sa) + ' + ' + esc(sb) + ', needs a splice'}): ${esc(c.desc)}</span></div>`;
      }
      h += box(`Combos fused (${COMBOS.filter(c => META.combos && META.combos[c.id]).length}/${COMBOS.length})`, `<div class="list">${lc}</div>`, `Both weapons at Lv ${COMBO_LEVEL}+: a COMBO card turns up in your next box. Both keep firing, they gain the new power, and twice a run the fusion opens a bonus weapon mount.`);
      let l = '';
      for (const q of PAIRINGS) {
        const known = META.pairs[q.id], on = run && G.pair && G.pair[q.id];
        l += `<div class="li ${on ? 'on' : ''}"><b style="color:${known ? cyan : 'inherit'}">${known ? esc(q.name) : '???'}</b>${on ? ' (ACTIVE)' : ''}<br><span>${known ? esc(WEAPONS[q.a].name) + ' + ' + esc(WEAPONS[q.b].name) + ': ' + esc(q.desc) : 'Two weapons, both Lv ' + PAIR_LEVEL + '+. Nobody has told you which.'}</span></div>`;
      }
      h += box(`Pairings found (${pf.length}/${PAIRINGS.length})`, `<div class="list">${l}</div>`);
    }
    if (show('secrets')) {
      let l = '';
      for (const id of qs) { const known = META.quirks[id], Q = QUIRKS[id]; l += `<div class="li ${run && G.quirks && G.quirks[id] ? 'on' : ''}"><b style="color:${known ? cyan : 'inherit'}">${known ? esc(Q.name) : '???'}</b><br><span>${known ? esc(Q.desc) : 'Undiscovered.'}</span></div>`; }
      h += box(`Secrets found (${qf.length}/${qs.length})`, `<div class="list">${l}</div>`, 'Things that happen when the rules collide. Nobody will tell you what they are.');
    }
    if (show('beasts')) {
      // The bestiary: every enemy type you have met (introduced on first sighting, see intro.js).
      let l = '';
      for (const id in ENEMY_INTRO) {
        const d = ENEMIES[id] || (typeof LV_FOES !== 'undefined' && LV_FOES[id]), I = ENEMY_INTRO[id], m = META.seen && META.seen[id]; // (campaign germs live in LV_FOES)
        if (!d) continue;
        l += `<div class="li cdxe">${portraitTag('foe', id, m)}<div><b${m ? ` style="color:${col(d.color)}"` : ''}>${m ? esc(d.name) : '???'}</b><br><span>${m ? esc(I.what) + ' <i>' + esc(I.tip) + '</i>' : 'Not met yet.'}</span></div></div>`;
      }
      let rv = '';
      for (const R of RIVALS) {
        const m = META.seen && META.seen['rival_' + R.id];
        rv += `<div class="li cdxe">${portraitTag('rival', R.id, m)}<div><b${m ? ` style="color:${R.color}"` : ''}>${m ? esc(R.name) : '???'}</b>${m ? ' <em>' + esc(R.nick) + '</em>' : ''}<br><span>${m ? esc(R.bio) + UI.rivalBars(R) + R.specs.map(x => '<b>' + esc(x.name) + '</b>: ' + esc(x.desc)).join('<br>') + '<br><i>' + esc(R.tip) + '</i>' : 'Not met yet.'}</span></div></div>`;
      }
      h += box(`Rivals (${RIVALS.filter(R => META.seen && META.seen['rival_' + R.id]).length}/${RIVALS.length} met)`, `<div class="list">${rv}</div>`, 'The other swimmers in the race, with their specialities.');
      h += box(`Enemies (${beasts}/${Object.keys(ENEMY_INTRO).length} met)`, `<div class="list">${l}</div>`, 'Every enemy type you have met, with how to beat it. Settings > Tutorial lets you meet them again.');
    }
    if (show('bosses')) {
      let l = '';
      for (const b of BOSSES) {
        const m = META.bosses[b.id], now = run && G.bossRoster && G.bossRoster.indexOf(b.id) >= 0 && G.bossRoster.indexOf(b.id) < G.bossCount;
        const rl = b.relics.map(id => (META.relics[id] ? `<b style="color:${PAL.reward}">${esc(RELICS[id].name)}</b>` : esc(RELICS[id].name))).join(', ');
        l += `<div class="li cdxe boss ${now ? 'on' : ''}">${portraitTag('boss', b.id, m)}<div><b>${m ? esc(b.name) : '???'}</b>${m ? ' <em>' + esc(b.title) + '</em>' : ''}<br><span>${m ? 'Weak to: ' + esc(b.weaknesses.join('; ')) + '. Relics: ' + rl : 'Not met yet.'}</span></div></div>`;
      }
      h += box(`The boss ward (${met}/${BOSSES.length} met, ${rel.length}/${Object.keys(RELICS).length} trophies taken)`, `<div class="list">${l}</div>`, `Every run you meet ${BOSSES_PER_RUN} of them, in a random order. Trophies you have taken are in gold.`);
    }
    if (show('rules')) {
      h += box('Rewind', '', `<b>REWIND</b> sends you ${CHRONO.window}s into the past. Your future self stays behind as a Paradox Echo: it retraces the erased timeline backwards firing your weapons, then collapses in a bullet-clearing blast. If you would die with a charge ready, Rewind triggers automatically.`);
      let l = '';
      for (const id in REACTIONS) l += `<div class="li"><b>${REACTIONS[id].name}</b> ${run && G.stats.reactBy[id] ? 'x' + G.stats.reactBy[id] : ''}<br><span>${esc(REACTIONS[id].desc)}</span></div>`;
      h += box('Chemical reactions', `<div class="list">${l}</div>`);
      let el = '';
      for (const id in ELEMENTS) el += `<div class="li"><b style="color:${ELEM_UI[id]}">${ELEMENTS[id].name}</b> <em>${esc(ELEMENTS[id].status)}</em><br><span>${esc(ELEMENTS[id].blurb)}</span></div>`;
      h += box('Damage types', `<div class="list">${el}</div>`, 'Every weapon has one. Switched at Birth changes it.');
      let tl = '';
      const live = run ? activeTwists() : [];
      for (const k in TWISTS) { const on = live.some(x => x.tw.key === k); tl += `<div class="li"><b${on ? ' style="color:#ff3df2"' : ''}>${esc(TWISTS[k].name)}</b> <em>${k.split('+').map(x => ELEMENTS[x].name).join(' + ')}</em>${on ? ' (active)' : ''}<br><span>${esc(TWISTS[k].desc)}</span></div>`; }
      h += box('Combo twists', `<div class="list">${tl}</div>`, 'A combo whose two weapons are on their usual damage types does what it says. Change either damage type with Switched at Birth and the combo picks up the twist for its new pair of elements, on top.');
    }
    return h;
  },
  // Field Guide tabs inside a screen: re-render whichever screen holds it.
  bindCodex(root, rerender) { root.querySelectorAll('[data-cdx]').forEach(b => b.addEventListener('click', () => { UI.codexSec = b.dataset.cdx; rerender(); })); },
  openCodex() { UI.codexSec = UI.codexSec || 'all'; $('codexBody').innerHTML = UI.codexHtml(); UI.bindCodex($('codexBody'), () => UI.openCodex()); UI.show('codex'); portraitsStart($('codexBody')); },

  // ---------------------------------------------------------------- Gene Bank (meta progression)
  renderBank() {
    const body = $('bankBody'), gold = PAL.reward, cyan = PAL.upgrade, best = UI.loadBest();
    const buy = (kind, id, cost, owned, label) => owned
      ? `<span class="bown" style="color:${cyan}">${label || 'OWNED'}</span>`
      : `<button class="chip bbuy ${META.dna < cost ? 'poor' : ''}" data-k="${kind}" data-id="${id}">${cost} DNA</button>`;
    const spent = metaSpent();
    let h = `<div class="bdna"><b style="color:${gold}">${fmtNum(META.dna)}</b> DNA banked <span class="hint">(${fmtNum(META.total)} earned, ${fmtNum(spent)} spent)</span></div>
      <p class="hint">Every run banks DNA: levels, bosses, rival kills, time survived, and a big bonus for being born. Spend it on permanent changes to every future swimmer.</p>`;
    // What the next swimmer starts with.
    const now = META_BONUSES.filter(b => META.ranks[b.id]).map(b => META_NOW[b.id](META.ranks[b.id]));
    const st = META_STARTERS.filter(([id]) => META.starters[id] && WEAPONS[id]).map(([id]) => WEAPONS[id].name);
    h += `<div class="sec bnext"><h3>Your next swimmer</h3><p class="hint">${now.length ? esc(now.join(', ')) : 'Nothing inherited yet.'}${st.length ? '<br>Extra starters: ' + esc(st.join(', ')) : ''}<br>Tag: ${esc((META_DYES.find(d => d.id === META.dye) || META_DYES[0]).name)}</p></div>`;
    h += `<div class="sec"><h3>Inherited traits</h3>`;
    for (const b of META_BONUSES) {
      const r = META.ranks[b.id] || 0, pips = Array.from({ length: b.max }, (_, i) => `<i class="${i < r ? 'on' : ''}"></i>`).join('');
      h += `<div class="brow"><div><b>${esc(b.name)}</b><span class="pips">${pips}</span><div class="hint">${esc(b.desc)}${r ? ` <span style="color:${cyan}">(now ${esc(META_NOW[b.id](r))})</span>` : ''}</div></div>${buy('rank', b.id, r < b.max ? b.cost(r) : 0, r >= b.max, 'MAX')}</div>`;
    }
    const starterRow = ([id, cost]) => {
      const d = WEAPONS[id]; if (!d) return '';
      const ws = META.wstats[id];
      return `<div class="brow"><div class="bico">${iconSVG(d, 26, elemCol(d.elem))}</div><div><b>${esc(d.name)}</b> <span class="brole">${esc((d.role || '').toUpperCase())}</span><div class="hint">${esc(d.play || d.desc || '')}${ws ? ` <span style="color:${cyan}">(${ws.runs} run${ws.runs > 1 ? 's' : ''}, born ${ws.born})</span>` : ''}</div></div>${buy('starter', id, cost, META.starters[id])}</div>`;
    };
    h += `</div><div class="sec"><h3>Epigenetic Profiles</h3><p class="hint">Your Primary Sequence (chosen just before a run) is <b>${esc(PROFILES[META.profile] ? PROFILES[META.profile].name : 'The Firstborn')}</b>. Ranks come from kills, unlocks from what you do across all your runs.</p><div class="list">${Object.keys(PROFILES).map(id => `<div class="li ${META.profile === id ? 'on' : ''}">${UI.profileHtml(id)}</div>`).join('')}</div>`;
    h += `</div><div class="sec"><h3>Wildcard weapons</h3><p class="hint">Every weapon belongs to one sequence, and only that sequence can draft it. Unlock one here and it becomes a wildcard: any sequence can draft it, and one is offered at the start of every run.</p>`;
    h += META_STARTERS.filter(([id]) => !WEAPONS[id] || !WEAPONS[id].toy).map(starterRow).join('');
    h += `<h3 style="margin-top:12px">Toys</h3><p class="hint">The rule-breakers. They turn up in drafts anyway; unlock one to have it on offer from the start.</p>`;
    h += META_STARTERS.filter(([id]) => WEAPONS[id] && WEAPONS[id].toy).map(starterRow).join('');
    h += `</div><div class="sec"><h3>Tag dyes</h3><p class="hint">Your fluorescent tag. All in the green family, so green still means you.</p>`;
    for (const d of META_DYES) {
      const owned = META.dyes[d.id], on = META.dye === d.id;
      h += `<div class="brow"><div class="bdye" style="background:${d.color};box-shadow:0 0 10px ${d.color}"></div><div><b>${esc(d.name)}</b></div>${on ? `<span class="bown" style="color:${cyan}">WEARING</span>` : owned ? `<button class="chip bbuy" data-k="dye" data-id="${d.id}">WEAR</button>` : buy('dye', d.id, d.cost, false)}</div>`;
    }
    h += `</div>`;
    // Records.
    const runs = RUNLOG.length, born = RUNLOG.filter(r => r.res === 'WON').length, topLv = RUNLOG.reduce((m, r) => Math.max(m, r.lvl || 0), 0);
    const fav = Object.entries(META.wstats).sort((a, b) => b[1].runs - a[1].runs).slice(0, 3).filter(([id]) => WEAPONS[id]).map(([id, r]) => `${WEAPONS[id].name} (${r.runs})`);
    h += `<div class="sec"><h3>Records</h3><div class="tiles">
      <div class="tile"><b>${runs}</b><span>Runs logged</span></div><div class="tile"><b>${born}</b><span>Born</span></div>
      <div class="tile"><b>${best.born ? fmtTime(best.born) : '-'}</b><span>Fastest birth</span></div><div class="tile"><b>${topLv || '-'}</b><span>Highest level</span></div>
      <div class="tile"><b>${best.wave || '-'}</b><span>Best Petri Dish wave</span></div><div class="tile"><b>${fmtNum(META.total)}</b><span>DNA earned</span></div>
      <div class="tile"><b>${META.gen || 0}</b><span>Generation</span></div><div class="tile"><b>${META.heatBest || 0} / ${META.heatMax || 0}</b><span>Immune Response: best born / unlocked</span></div></div>
      ${fav.length ? `<p class="hint">Most used: ${esc(fav.join(', '))}.</p>` : ''}</div>`;
    // Being born: the prestige.
    { const g = META.gen || 0, bt = (META.baby || []).map(id => BABY_TRAITS[id] ? BABY_TRAITS[id].name : id);
      h += `<div class="sec"><h3>Be born (Generation ${g + 1})</h3><p class="hint">You are Generation <b>${g}</b> (${esc(genName(g))}): +${g * 10}% DNA, +${g * 3}% damage and +${g * 5} max HP on every run.${bt.length ? ' Baby Traits: ' + esc(bt.join(', ')) + '.' : ''}</p>
        <p class="hint">Being born wipes your DNA, traits, wildcards and dyes. You keep your Generation (one more), a new Baby Trait of your choice, the Field Guide, your sequences and their ranks, Immune Response levels and records.${META.wonSinceBirth ? '' : ' <b>Win a run first.</b>'}</p>
        <button class="btn ${UI.bornArm ? 'danger' : 'primary'}" id="bankBorn" ${META.wonSinceBirth ? '' : 'disabled'}>${UI.bornArm ? 'TAP AGAIN: BE BORN (THIS WIPES YOUR BANK)' : 'BE BORN'}</button></div>`; }
    // Clear: a full refund, so you can spend it all again. Two taps.
    h += `<div class="sec"><h3>Clear the bank</h3><p class="hint">Refunds every DNA you have spent (${fmtNum(spent)}) and removes all traits, starters and dyes, so you can spend it again differently. Your Field Guide discoveries and records stay.</p>
      <button class="btn ${UI.bankClear ? 'danger' : ''}" id="bankClear" ${spent ? '' : 'disabled'}>${UI.bankClear ? `TAP AGAIN: CLEAR AND REFUND ${fmtNum(spent)} DNA` : 'CLEAR GENE BANK'}</button></div>`;
    body.innerHTML = h;
    body.querySelectorAll('.bbuy').forEach(b => b.addEventListener('click', () => {
      if (!metaBuy(b.dataset.k, b.dataset.id)) { UI.toast('Not enough DNA yet: swim again'); return; }
      sfx('pickup'); UI.bankClear = false;
      const y = $('bank').scrollTop; UI.renderBank(); $('bank').scrollTop = y;
    }));
    const bb = $('bankBorn');
    if (bb) bb.addEventListener('click', () => { if (!UI.bornArm) { UI.bornArm = true; const y = $('bank').scrollTop; UI.renderBank(); $('bank').scrollTop = y; return; } UI.bornArm = false; openBirth(); });
    const cb = $('bankClear');
    if (cb) cb.addEventListener('click', () => {
      const y = $('bank').scrollTop;
      if (!UI.bankClear) { UI.bankClear = true; UI.renderBank(); $('bank').scrollTop = y; return; }
      UI.bankClear = false;
      const n = metaClear();
      UI.toast(`Gene Bank cleared: ${fmtNum(n)} DNA refunded`); sfx('pickup');
      UI.renderBank(); $('bank').scrollTop = y; UI.renderBest();
    });
  },

  // ---------------------------------------------------------------- game over
  showVictory() { UI.showGameOver(true); },
  showGameOver(won) {
    const best = UI.loadBest();
    if (G.wave && !G.wave.camp) return UI.showDishOver(best);
    const isBest = won ? !best.born || G.t < best.born : G.t > (best.time || 0);
    if (G.wave && G.wave.camp) UI.saveBest(Object.assign(best, { campBest: Math.max(best.campBest || 0, won ? CAMP.waves : G.wave.n - 1) }));
    if (won && !G.lvl) UI.saveBest(Object.assign(best, { born: isBest ? G.t : best.born, births: (best.births || 0) + 1 }));
    else if (isBest) UI.saveBest(Object.assign(best, { time: G.t, level: G.level, kills: G.kills }));
    $('overTitle').textContent = won && G.lvl ? 'THE EGG IS IN ANOTHER CASTLE' : won ? "IT'S SPERMY!" : G.rivalWinner ? 'BEATEN TO IT' : 'SPERMY ABSORBED';
    $('overTitle').classList.toggle('won', !!won);
    const dmg = Object.entries(G.stats.dmg).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const tot = dmg.reduce((a, b) => a + b[1], 0) || 1;
    const hurt = Object.entries(G.stats.hurt).sort((a, b) => b[1] - a[1]).slice(0, 3);
    let h = G.lvl ? `<div class="eulogy">${won ? `Lips to throat, through the plaque and the mouthwash, to a pale glowing ball at the back of the throat. It was a tonsil stone. It stinks. The egg is in another castle.${G.lvl.L.next ? ' LEVEL 1 WAS THE MOUTH. LEVEL 2 UNLOCKED (coming soon).' : ''}` : `Swallowed ${Math.round(lvProgress() * 100)}% of the way through ${esc(lvName(G.lvl.L).toLowerCase().replace(/\b\w/g, c => c.toUpperCase()))}.`}</div><div class="big">${fmtTime(G.t)}</div>` + (won ? '' : `<div class="hint">Absorbed by: <b style="color:${PAL.danger}">${esc(G.stats.lastHit || 'the immune system')}</b></div>`)
      : won
      ? `<div class="eulogy">${G.wave ? 'Twenty drops, four bosses, one egg in a dish. In vitro still counts: you are the one who gets to be a person.' + (META.waveWins === 1 ? ' ENDLESS MODE UNLOCKED.' : '') : 'Sperm count: one. You fertilised the egg. Out of four hundred million swimmers, you are the one who gets to be a person. Try not to waste it.'}</div><div class="big born">${fmtTime(G.t)}</div><div class="hint">${isBest ? 'FASTEST BIRTH YET!' : 'Fastest birth: ' + fmtTime(best.born)} | Peak viewers ${fmtViewers(G.show.peak)}</div>`
      : `<div class="eulogy">${esc(G.wave ? `The scientist makes a note: "Subject expired in wave ${G.wave.n} of ${CAMP.waves}. Promising. Get me another one."` : G.rivalWinner ? G.rivalWinner + ' broke into the egg first. They get to be a person. You get to be a footnote.' : pick(sysPool('death')))}</div><div class="big">${fmtTime(G.t)}</div><div class="hint">${isBest ? 'NEW BEST! The lab is cautiously optimistic.' : 'Best: ' + fmtTime(best.time || 0)} | Peak viewers ${fmtViewers(G.show.peak)}</div>
      <div class="hint">${G.rivalWinner ? 'Born instead of you: ' : 'Absorbed by: '}<b style="color:${PAL.danger}">${esc(G.rivalWinner || G.stats.lastHit || 'the immune system')}</b>${hurt.length ? ' | Most damage from: ' + hurt.map(x => esc(x[0])).join(', ') : ''}</div>`;
    const dr = dailyRecord(won);
    if (dr) h += `<div class="hint daily"><b>DAILY ${G.daily}</b>: ${dr.isBest ? 'NEW BEST FOR TODAY! ' : ''}Best ${dailyFmt(dr.best)} | Attempt ${dr.tries} | ${dr.streak}-day streak</div>`;
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
    const dna = bankRun(G, won && !G.lvl); // (a tonsil stone is not a birth)
    h = `<div class="bdna">+<b style="color:${PAL.reward}">${dna}</b> DNA banked <span class="hint">(${fmtNum(META.dna)} to spend in the Gene Bank)</span></div>` + h;
    if (G.heatUnlocked) h = `<div class="bdna" style="color:#ff3b3b">IMMUNE RESPONSE ${G.heatUnlocked} UNLOCKED: ${esc(IMMUNE[G.heatUnlocked - 1].name)}</div>` + h;
    if (won && !G.lvl && META.wonSinceBirth) h = `<p class="hint">You can now <b>be born</b> from the Gene Bank: a new Generation and a Baby Trait, for everything in the bank.</p>` + h;
    h = seqNewHtml() + h; // (the sequence ladder: seqlock.js)
    const dishWin = won && G.wave && G.wave.camp, left = dishWin ? seqStartersLeft() : [];
    if (dishWin) h = `<p class="hint">${left.length ? 'Beat it with ' + left.map(SEQ_NAME).join(' and ') + ' too to decode a new sequence.' : 'Fancy another go with a different Primary Sequence?'}</p>` + h;
    $('newSeqBtn').style.display = dishWin ? '' : 'none';
    $('againBtn').classList.toggle('primary', !dishWin);
    if (!won) h = UI.killerHtml() + h;
    $('overBody').innerHTML = h;
    if (!won) UI.drawKiller();
    UI.show('over');
  },
  // Lost: whoever finished you off, big, close up and red, with a word for you.
  killerHtml() {
    const e = G.rivalWinner ? G.enemies.find(x => x.rival && x.name === G.rivalWinner) : G.lastHitEnt;
    UI.killer = e || null;
    const name = G.rivalWinner || (e ? (e.rival ? e.R.name : e.bossDef ? e.bossDef.name : e.def.name) + (e.elite ? ' (elite)' : '') : (G.stats.lastHit || 'The immune system'));
    const key = e && !e.rival && !e.boss ? Object.keys(ENEMIES).find(k => ENEMIES[k] === e.def) : null;
    const lines = e && e.rival && e.R ? KILL_LINES.rival[e.R.id] : e && (e.boss || e.bossDef) ? (e.bossDef || e.def).quote ? [(e.bossDef || e.def).quote].concat(KILL_LINES.boss) : KILL_LINES.boss : key && KILL_LINES.foe[key] ? KILL_LINES.foe[key] : null;
    const line = pick(lines || KILL_LINES.any);
    return `<div class="killer"><canvas id="killCan"></canvas><div class="kcap"><span>FINISHED OFF BY</span><b>${esc(name)}</b><em>"${esc(line)}"</em></div></div>`;
  },
  // A close-up of the killer, cut from the last frame of the slide, tinted red.
  drawKiller() {
    const c = $('killCan'), e = UI.killer;
    if (!c) return;
    const W2 = c.clientWidth || 320, H2 = c.clientHeight || 180, dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(W2 * dpr); c.height = Math.round(H2 * dpr);
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#100204'; g.fillRect(0, 0, W2, H2);
    if (e) {
      const ex = sx(e.x), ey = sy(e.y), R = Math.max(55, e.r * S * 2.6);
      if (ex > -R && ey > -R && ex < W + R && ey < H + R) {
        const k = cv.width / W, sw = R * 2 * (W2 / H2), sh = R * 2;
        try { g.drawImage(cv, (ex - sw / 2) * k, (ey - sh / 2) * k, sw * k, sh * k, 0, 0, W2, H2); } catch (err) { /* canvas unavailable */ }
      }
    }
    g.globalCompositeOperation = 'multiply'; g.fillStyle = '#ff5050'; g.fillRect(0, 0, W2, H2);
    g.globalCompositeOperation = 'source-over';
    const v = g.createRadialGradient(W2 / 2, H2 / 2, H2 * 0.25, W2 / 2, H2 / 2, W2 * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.85)');
    g.fillStyle = v; g.fillRect(0, 0, W2, H2);
  },
  // The Petri Dish: how many waves you survived.
  showDishOver(best) {
    const n = G.wave.best, isBest = n > (best.wave || 0);
    if (isBest) UI.saveBest(Object.assign(best, { wave: n }));
    $('overTitle').textContent = 'THE DISH WINS'; $('overTitle').classList.remove('won');
    const dmg = Object.entries(G.stats.dmg).sort((a, b) => b[1] - a[1]).slice(0, 8), tot = dmg.reduce((a, b) => a + b[1], 0) || 1;
    let h = `<div class="eulogy">The scientist makes a note: "Subject expired during wave ${G.wave.n}. Promising. Get me another one."</div><div class="big">WAVE ${n}</div>
      <div class="hint">${isBest ? 'NEW BEST! The grant has been renewed.' : 'Best: wave ' + (best.wave || 0)} | ${fmtTime(G.t)} in the dish</div>
      <div class="hint">Absorbed by: <b style="color:${PAL.danger}">${esc(G.stats.lastHit || 'the experiment')}</b></div>
      <div class="ostats"><div><b>${n}</b>Waves cleared</div><div><b>${G.level}</b>Level</div><div><b>${G.kills}</b>Kills</div><div><b>${G.stats.bossKills}</b>Bosses</div></div><h3>Damage breakdown</h3>`;
    for (const [k, v] of dmg) h += `<div class="dmgrow"><span>${esc(k)}</span><i style="width:${(v / tot * 100).toFixed(0)}%"></i><b>${fmtNum(v)}</b></div>`;
    logRun(G, 'WAVE ' + n);
    UI.lastRun = G.logged ? RUNLOG[RUNLOG.length - 1] : null; $('copyRunBtn').textContent = 'COPY THIS RUN';
    const dna = bankRun(G, false);
    $('overBody').innerHTML = `<div class="bdna">+<b style="color:${PAL.reward}">${dna}</b> DNA banked</div>` + h;
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
    $('dailyLine').textContent = dailyLine();
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
    sponsor: lvOn() ? [
      `The egg sent this. You are certain of it. Nobody can tell you otherwise.`,
      `A token from the egg, surely. It knows you are coming. It must.`,
    ] : [
      `A research grant from ${n}. Terms and conditions apply to your soul.`,
      `${n} funded this with a note: "Please cite us when you are born." You will not remember any of this.`,
    ],
    boss: [
      `${n} is dead. This was in its will. You were not in its will. You are now.`,
      `You spliced this out of ${n} while the lab took notes. The lab has questionable ethics.`,
      `${n} guarded these genes with its life. That turned out to be a limited resource.`,
    ],
    ach: [
      `For "${n}". The doctor insisted. The ethics board wept. Here is your prize.`,
      `Achievement unlocked: "${n}". The lab sends a strand of DNA and a small round of applause.`,
    ],
    cure: [
      'For clearing up the yeast infection. The womb is grateful, and slightly embarrassed.',
      'Infection cured. The doctor sends this DNA with a leaflet you will not read.',
    ],
    level: [
      `Level ${L}. You grew, and the womb noticed. It sends its regards, and some spare DNA.`,
      `Level ${L}! Every time you get bigger, somebody leaves a strand of DNA out for you. You have not asked whose.`,
      `Level ${L}. You are bigger, your head is harder, and here, for some reason, is a strand of DNA.`,
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

function fmtTime(t) { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${s < 10 ? '0' : ''}${s}`; }
function fmtNum(v) { return v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : Math.round(v) + ''; }

// Android back button bridge: returns 'exit' when the app should close.
window.handleBack = function () {
  const on = id => $(id).classList.contains('on');
  if (on('title')) return 'exit';
  if (G && G.state === 'intro') { endIntro(); return 'ok'; }
  if (G && G.state === 'bossIntro') { if ($('bossIntro').classList.contains('ready')) endBossIntro(); return 'ok'; }
  if (G && G.state === 'finale') { endFinale(); return 'ok'; }
  if (on('over')) { G = null; UI.show('title'); UI.renderBest(); return 'ok'; }
  if (on('loot') || on('draft')) return 'ok';
  if (on('stpanel')) { UI.closeStatusPanel(); return 'ok'; }
  if (on('armoury')) { UI.closeArmoury(); return 'ok'; }
  if (on('seqsel')) { UI.openSamples(); return 'ok'; }
  if (on('born')) { UI.show('bank'); return 'ok'; }
  if (on('bank') || on('samples') || on('codex')) { UI.show('title'); UI.renderBest(); return 'ok'; }
  if (on('settings')) { UI.show(UI.setFrom || 'title'); return 'ok'; }
  UI.togglePause();
  return 'ok';
};

// Called by the Android shell when the app is backgrounded.
window.onAppPause = function () { if (G && G.state === 'play') UI.togglePause(); };

UI.init();
requestAnimationFrame(frame);
