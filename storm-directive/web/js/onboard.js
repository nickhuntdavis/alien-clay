'use strict';
// Spawn Prawn - first-run setup (user, 29 Oct): a new player picks their look and sound before the title screen.
//  1. View: a live autorun Race plays in the top half (kept busy: OB.crowd enemies swim in round you), the left of it in Lab view and the right in Arcade; tap one.
//  2. Slide: the same demo in the chosen view, the left plain (brightfield) and the right Darkfield; tap one.
//  3. Sound: the demo in the chosen look with sound on, and the Sound effects and Music sliders. Done opens the title.
// The demo is a real run (newGame, autorun, the player can't die, reward screens and pauses are skipped). Nothing of
// it is kept: META is restored from a copy taken at the start, achievements, tutorials and live saves are off while it
// runs, and only the three settings chosen here are saved. Each frame of a split screen is drawn twice, once per look,
// keeping the left half of the first (the cached slide layers and sprite sheets are kept per look: OB.cache).
// Shown once, to a player with no runs and no DNA (META.obDone), never under window.TUT_OFF (tests). obStart() reruns it.
// Hooks: none in shared files. hookOn('hurt:before') (no damage in the demo). Wraps splash.js splashEnd, render.js render, UI.tick, show.js achieve, meta.js liveSave.

const OB = { on: false, step: 0, split: null, cache: {}, cv: null, demoSample: 's001', crowd: 22, crowdR: [380, 620], crowdDefs: ['crawler', 'crawler', 'skitter', 'spitter', 'brute'], crowdT: 0 };
const OB_COPY = {
  view: { title: 'Calibrate the eyepiece', body: 'Lab: grey, as nature intended. Arcade: full colour, with rings that drain as effects wear off. Settings can change it.' },
  field: { title: 'Adjust the lighting', body: 'Brightfield lights the slide from below. Darkfield turns the room off and lets the specimens glow.', bright: 'Brightfield' },
  sound: { title: 'Check the audio', body: 'Sound is on. Adjust until tolerable. 0% is silent, which the lab also recommends.', done: 'Begin the study' },
};
const obNeeded = () => !META.obDone && !(META.total > 0) && !(typeof RUNLOG !== 'undefined' && RUNLOG.length) && !(typeof window !== 'undefined' && window.TUT_OFF);
const obOpt = (id, v) => { const d = SETTINGS_DEF.find(x => x.id === id), o = d && d.opts.find(x => x[0] === v); return o ? o[1] : String(v); };
const obLabel = id => { const d = SETTINGS_DEF.find(x => x.id === id); return d ? d.label : id; };

splashEnd = (orig => function () {
  const was = SPLASH.on;
  orig();
  if (was && obNeeded()) setTimeout(() => { if (!G && obNeeded()) obStart(); }, 360);
})(splashEnd);

function obStart() {
  if (OB.on) return;
  OB.on = true; OB.step = 0; OB.cache = {};
  OB.meta = JSON.stringify(META); OB.set = JSON.stringify(SET); OB.tut = window.TUT_OFF;
  window.TUT_OFF = 1; // (no tutorial cards; level-ups are plain requests, cleared below)
  META.seen = META.seen || {}; for (const k in ENEMY_INTRO) META.seen[k] = 1; // (no first-sighting cards in the demo)
  META.seenSt = META.seenSt || {}; for (const k in STATUS_INTRO) META.seenSt[k] = 1;
  SET.auto = true; SET.musVol = 0; SET.sfxVol = 0; UI.applySettings(); // (silent until the sound step)
  UI.sample = OB.demoSample; UI.syncAuto(); newGame();
  if (!G.weapons.filter(Boolean).length) { const o = (genLoot({ kind: 'start' }) || []).find(x => x && x.apply); if (o) o.apply(); }
  if (typeof INTRO !== 'undefined' && INTRO.on) endIntro();
  G.state = 'play'; G.lootQueue.length = 0;
  UI.show('none');
  obPane(); obStep(0);
}
// The look: settings plus the slide caches that depend on them, swapped as a set.
const obKey = () => SET.view + '|' + !!SET.darkfield;
function obLook(id, v) {
  if (SET[id] === v) return;
  OB.cache[obKey()] = { layers: SPR.layers, fore: SPR.fore, oocyte: SPR.oocyte, oocyteR: SPR.oocyteR, vigKey: SPR.vigKey, vignette: SPR.vignette, sheets: new Map(SHEETS) };
  SET[id] = v;
  const c = OB.cache[obKey()];
  if (c) { Object.assign(SPR, { layers: c.layers, fore: c.fore, oocyte: c.oocyte, oocyteR: c.oocyteR, vigKey: c.vigKey, vignette: c.vignette }); SHEETS.clear(); for (const [k, x] of c.sheets) SHEETS.set(k, x); }
  else resetLook();
  if (typeof refreshPalette === 'function') refreshPalette();
}

function obStep(n) {
  OB.step = n;
  const el = $('obPane'), C = n === 0 ? OB_COPY.view : n === 1 ? OB_COPY.field : OB_COPY.sound;
  OB.split = n === 0 ? ['view', 'lab', 'arcade'] : n === 1 ? ['darkfield', false, true] : null;
  const lab = $('obLabels');
  lab.innerHTML = !OB.split ? '' : n === 0 ? `<span>${esc(obOpt('view', 'lab'))}</span><span>${esc(obOpt('view', 'arcade'))}</span>`
    : `<span>${esc(OB_COPY.field.bright)}</span><span>${esc(obLabel('darkfield'))}</span>`;
  let h = `<div class="obCount">${n + 1} / 3</div><h2>${esc(C.title)}</h2>${uiHint(esc(C.body))}`;
  if (n === 0) h += `<div class="obPick">${uiButton(esc(obOpt('view', 'lab')), { attrs: 'data-ob="view|lab"' })}${uiButton(esc(obOpt('view', 'arcade')), { attrs: 'data-ob="view|arcade"' })}</div>`;
  else if (n === 1) h += `<div class="obPick">${uiButton(esc(OB_COPY.field.bright), { attrs: 'data-ob="darkfield|0"' })}${uiButton(esc(obLabel('darkfield')), { attrs: 'data-ob="darkfield|1"' })}</div>`;
  else h += ['sfxVol', 'musVol'].map(id => `<div class="srh"><h3>${esc(obLabel(id))}</h3><span class="svv" id="obv_${id}">${Math.round(SET[id] * 100)}%</span></div><input type="range" class="sslide" min="0" max="100" step="5" value="${Math.round(SET[id] * 100)}" data-obv="${id}">`).join('')
    + `<div class="obPick">${uiButton(esc(C.done), { attrs: 'data-obdone="1"' })}</div>`;
  el.innerHTML = h;
  el.querySelectorAll('[data-ob]').forEach(b => b.addEventListener('click', () => {
    const [id, v] = b.dataset.ob.split('|');
    OB.pick = OB.pick || {};
    OB.pick[id] = id === 'darkfield' ? v === '1' : v;
    obLook(id, OB.pick[id]);
    if (id === 'view') obStep(1);
    else { // the sound step: sound on, at full volume to start with
      OB.pick.sfxVol = 1; OB.pick.musVol = 1; SET.sfxVol = 1; SET.musVol = 1;
      initAudio(); UI.applySettings(); obStep(2);
    }
  }));
  el.querySelectorAll('[data-obv]').forEach(r => {
    const id = r.dataset.obv;
    r.addEventListener('input', () => { SET[id] = +r.value / 100; OB.pick[id] = SET[id]; $('obv_' + id).textContent = r.value + '%'; UI.applySettings(); });
    r.addEventListener('change', () => { if (id === 'sfxVol' && SET.sfxVol > 0) { initAudio(); sfx('pickup'); } });
  });
  const d = el.querySelector('[data-obdone]'); if (d) d.addEventListener('click', obEnd);
}
function obEnd() {
  if (!OB.on) return;
  const pick = OB.pick || {};
  OB.on = false; OB.split = null; OB.cache = {};
  G = null;
  if (typeof INTRO !== 'undefined' && INTRO.on) endIntro();
  window.TUT_OFF = OB.tut;
  for (const k of Object.keys(META)) delete META[k];
  Object.assign(META, JSON.parse(OB.meta)); META.obDone = 1; saveMeta();
  const set = JSON.parse(OB.set); for (const k of Object.keys(set)) SET[k] = set[k];
  Object.assign(SET, pick); saveSettings(); resetLook(); UI.applySettings();
  const p = $('obPane'); if (p) p.remove(); const l = $('obLabels'); if (l) l.remove();
  UI.show('title'); UI.renderBest();
}

// The two panels: the setup card on the lower half, the two look names over the demo.
function obPane() {
  if (!$('obPane')) { const d = document.createElement('div'); d.id = 'obPane'; document.body.appendChild(d); }
  if (!$('obLabels')) { const d = document.createElement('div'); d.id = 'obLabels'; document.body.appendChild(d); }
  if (!$('obStyle')) {
    const s = document.createElement('style'); s.id = 'obStyle';
    s.textContent = '#obPane{position:fixed;left:0;right:0;bottom:0;max-height:52%;overflow:auto;z-index:60;padding:16px 16px calc(16px + env(safe-area-inset-bottom));background:var(--color-bg-sheet);color:var(--color-text-primary);border-top:3px solid var(--color-border-edge);box-sizing:border-box;overflow-wrap:anywhere}'
      + '#obPane h2{margin:4px 0 6px;font-size:20px;letter-spacing:.04em}#obPane .obCount{font:12px monospace;color:var(--color-text-muted)}'
      + '#obPane .obPick{display:flex;gap:10px;margin-top:14px}#obPane .obPick .btn{flex:1;min-width:0;white-space:normal}#obPane .sslide{width:100%;margin:4px 0 12px}'
      + '#obLabels{position:fixed;left:0;right:0;top:calc(14% + env(safe-area-inset-top));z-index:59;display:flex;pointer-events:none}'
      + '#obLabels span{flex:1;text-align:center;font:900 13px monospace;letter-spacing:.08em;color:#fff;text-shadow:0 0 3px #000,0 0 3px #000;overflow-wrap:anywhere;padding:0 8px}';
    document.head.appendChild(s);
  }
}

// The demo frame: the player sits in the top half; a split frame is drawn once per look.
render = (orig => function () {
  if (!OB.on || !G) return orig();
  const pane = $('obPane'), lift = (pane ? pane.offsetHeight / 2 : 0) / S; cam.y += lift; // (you, centred in the visible half)
  try {
    if (!OB.split) return orig();
    const [id, a, b] = OB.split, cv = ctx.canvas, w = Math.floor(cv.width / 2);
    if (!OB.cv || OB.cv.width !== cv.width || OB.cv.height !== cv.height) OB.cv = makeCanvas(cv.width, cv.height);
    const keep = SET[id], oc = OB.cv.getContext('2d');
    obLook(id, a); orig();
    oc.clearRect(0, 0, w, cv.height); oc.drawImage(cv, 0, 0, w, cv.height, 0, 0, w, cv.height);
    obLook(id, b); orig();
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.drawImage(OB.cv, 0, 0, w, cv.height, 0, 0, w, cv.height);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(w - DPR, 0, 2 * DPR, cv.height);
    ctx.restore();
    obLook(id, keep);
  } finally { cam.y -= lift; }
})(render);

// Every frame: the demo never stops for a screen, and you can't die in it.
UI.tick = (orig => function (dt) {
  if (OB.on && G) {
    if (typeof INTRO !== 'undefined' && INTRO.on) endIntro();
    if (G.state === 'bossIntro' && typeof endBossIntro === 'function') endBossIntro();
    G.lootQueue.length = 0;
    if (G.player) G.player.hp = G.P.maxHp;
    if ((OB.crowdT -= dt) <= 0 && G.player && G.state === 'play') { // (a busy slide from the first second)
      OB.crowdT = 0.4;
      const p = G.player, live = G.enemies.filter(e => !e.dead && !e.boss && Math.hypot(e.x - p.x, e.y - p.y) < 900).length;
      for (let i = live; i < OB.crowd && i < live + 4; i++) {
        const a = Math.random() * TAU, d = rand(OB.crowdR[0], OB.crowdR[1]), def = ENEMIES[pick(OB.crowdDefs)];
        if (def) G.enemies.push(makeEnemy(def, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d));
      }
    }
    if (G.state !== 'play' && G.state !== 'bossIntro') { G.state = 'play'; UI.show('none'); }
  }
  return orig.call(this, dt);
})(UI.tick);
achieve = (orig => function (id) { if (OB.on) return; return orig(id); })(achieve);
liveSave = (orig => function (g) { if (OB.on) return; return orig(g); })(liveSave);
hookOn('hurt:before', 'onboard:god', () => (OB.on ? null : undefined));
