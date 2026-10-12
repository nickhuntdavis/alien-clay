'use strict';
// Spawn Prawn - the combo unlock. A combo is a big moment, so it never hides in a box among other cards: the
// moment two of your weapons qualify, the game stops for it alone. The two weapons fly in, circle and crackle
// at each other, then slam together in a flash; the combo's name lands and the screen lists everything you
// get (the new power, any twist, both keep firing, the bonus mount). One button: FUSE THEM.
// It rides the loot queue as { kind: 'combo', id } (so it waits its turn, pauses the game and the autorun
// picks it like any box), with UI.lootOpts = [optCombo(c)].
// Super combos (supers.js) use the same screen, in gold, with the two combos as the two sides.
// Hooks: combos.js comboTick (fusionCheck); ui.js openLoot (fusionOpen); ui.js refreshHud (comboBonds); combos.js comboFuse (FUSION.id: the
// ceremony said it all, so no narrator card).

const FUSION = { id: null, req: null, t0: 0, raf: 0, slammed: false, parts: [], shake: 0 };
const FUSION_SLAM = 1.6; // (seconds until the two weapons meet)

// Queue every combo that has just become available, ahead of any other box.
function fusionCheck() {
  if (!G || G.state !== 'play' || !COMBOS) return;
  if (G.fusionAt > G.t) return;
  G.fusionAt = G.t + 0.25;
  const asked = G.fusionAsked || (G.fusionAsked = {});
  for (const c of availableCombos()) {
    if (asked[c.id]) continue;
    asked[c.id] = true;
    G.lootQueue.unshift({ kind: 'combo', id: c.id, now: true }); // (now: a wave doesn't hold it back)
  }
  for (const s of availableSupers()) {
    if (asked['super:' + s.id]) continue;
    asked['super:' + s.id] = true;
    G.lootQueue.unshift({ kind: 'combo', id: s.id, sup: true, now: true });
  }
}

function fusionEl() {
  let el = document.getElementById('fusion');
  if (el) return el;
  el = document.createElement('div'); el.id = 'fusion';
  el.innerHTML = `<canvas id="fuFx"></canvas><div class="fubox">
    <div class="fukick" id="fuKick"></div>
    <div class="fustage" id="fuStage"><div class="fuw" id="fuA"></div><div class="fuw" id="fuB"></div><div class="fuj" id="fuJ"></div></div>
    <div class="funame" id="fuName"></div><div class="fusub" id="fuSub"></div>
    <div class="fulist" id="fuList"></div>
    <div class="fubtns"><button class="btn primary" id="fuGo">FUSE THEM</button></div></div>`;
  document.body.appendChild(el);
  // A tap during the build-up skips to the slam; the button takes it.
  el.addEventListener('pointerdown', () => { if (FUSION.id && !FUSION.slammed) FUSION.t0 = performance.now() - FUSION_SLAM * 1000; });
  document.getElementById('fuGo').addEventListener('click', e => {
    e.stopPropagation();
    if (!FUSION.id || !FUSION.slammed || performance.now() - FUSION.t0 < (FUSION_SLAM + 0.9) * 1000) return;
    UI.pickLoot(0);
  });
  return el;
}

// UI.openLoot hands combo (and super combo) requests here. Returns false if it is no longer there (a weapon was
// recycled meanwhile).
function fusionOpen(req) {
  return req.sup ? fusionOpenSuper(req) : fusionOpenCombo(req);
}
function fusionOpenCombo(req) {
  const c = COMBO_BY[req.id];
  if (!c || (G.combo && G.combo[c.id]) || !owned(c.a) || !owned(c.b)) return false;
  const A = owned(c.a), B = owned(c.b), ca = elemCol(wElemOf(A)), cb = elemCol(wElemOf(B));
  const first = !(META.combos || {})[c.id], mount = (G.comboMounts || 0) < COMBO_MOUNTS, tw = comboTwist(c);
  const found = COMBOS.filter(x => META.combos && META.combos[x.id]).length + (first ? 1 : 0);
  fusionShow(req, optCombo(c), {
    id: c.id, name: c.name, sub: `${A.def.name} + ${B.def.name}`, first, cols: [ca, cb, '#ff3df2'],
    kicks: ['COMBO UNLOCKED', 'NEW COMBO!', 'COMBO!'],
    a: `${iconSVG(A.def, 54, ca)}<b>${esc(A.def.name)}</b><em>Lv ${A.lvl}</em>`,
    b: `${iconSVG(B.def, 54, cb)}<b>${esc(B.def.name)}</b><em>Lv ${B.lvl}</em>`,
    j: [[A.def, ca], [B.def, cb]],
    rows: [
      ['NEW POWER', c.desc],
      tw && [twistLabel(tw), tw.desc],
      ['BOTH KEEP FIRING', `${A.def.name} and ${B.def.name} carry on exactly as before, upgrades and all. Nothing is lost.`],
      mount && ['BONUS WEAPON MOUNT', `A new weapon mount grows, and you draft a weapon for it straight away (combo mount ${(G.comboMounts || 0) + 1} of ${COMBO_MOUNTS} this run).`],
      first && ['FIRST TIME', `A new entry in the Field Guide: ${found} of ${COMBOS.length} combos found.`],
    ],
  });
  return true;
}
// A super combo: the two combos are the two sides, each a pair of icons.
function fusionOpenSuper(req) {
  const s = SUPER_BY[req.id];
  if (!s || superOn(s.id) || !availableSupers().includes(s)) return false;
  const X = COMBO_BY[s.x], Y = COMBO_BY[s.y], col = id => elemCol(wElemOf(owned(id)));
  const pair = (c, sz) => `<span class="fupair">${iconSVG(WEAPONS[c.a], sz, col(c.a))}${iconSVG(WEAPONS[c.b], sz, col(c.b))}</span>`;
  const first = !(META.supers || {})[s.id], found = SUPERS.filter(x => META.supers && META.supers[x.id]).length + (first ? 1 : 0);
  fusionShow(req, superOpt(s), {
    id: s.id, sup: true, name: s.name, sub: `${X.name} + ${Y.name}`, first, cols: [col(X.a), col(Y.a), SUPER_COLOR],
    kicks: ['SUPER COMBO UNLOCKED', 'NEW SUPER COMBO!!', 'SUPER COMBO!!'],
    a: `${pair(X, 40)}<b>${esc(X.name)}</b><em>COMBO</em>`,
    b: `${pair(Y, 40)}<b>${esc(Y.name)}</b><em>COMBO</em>`,
    j: superWeapons(s).map(id => [WEAPONS[id], col(id)]),
    rows: [
      ['SUPER POWER', s.desc],
      ['BOTH COMBOS KEEP GOING', `${X.name} and ${Y.name} carry on exactly as before, on top.`],
      first && ['FIRST TIME', `A new entry in the Field Guide: ${found} of ${SUPERS.length} super combos found. Hardly anyone sees these.`],
    ],
  });
  return true;
}
function fusionShow(req, opt, F) {
  const apply = opt.apply, [ca, cb, cc] = F.cols;
  opt.apply = () => { FUSION.id = F.id; fusionClose(); apply(); FUSION.id = null; };
  G.state = 'loot'; UI.lootReq = req; UI.lootOpts = [opt]; UI.pickedOne = true; UI.lootOpenT = performance.now();
  INPUT.active = false; G.manual = null;
  G.stats.boxes = (G.stats.boxes || 0) + 1;
  const el = fusionEl();
  el.style.setProperty('--ca', ca); el.style.setProperty('--cb', cb); el.style.setProperty('--cc', cc);
  el.className = 'on charging' + (F.sup ? ' super' : '');
  document.getElementById('fuKick').textContent = F.kicks[0];
  document.getElementById('fuA').innerHTML = F.a;
  document.getElementById('fuB').innerHTML = F.b;
  // The merged icon: two weapons overlap; three or four sit round a ring.
  const n = F.j.length, sz = n > 2 ? 52 : 84;
  document.getElementById('fuJ').innerHTML = '<i class="fuhalo"></i>' + F.j.map(([d, c], i) => { const an = i / n * TAU - Math.PI / 2, r = n > 2 ? 30 : 0; return `<span style="color:${c}; left:${(60 - sz / 2 + Math.cos(an) * r).toFixed(0)}px; top:${(60 - sz / 2 + Math.sin(an) * r).toFixed(0)}px">${iconSVG(d, sz, c)}</span>`; }).join('');
  document.getElementById('fuName').textContent = '';
  document.getElementById('fuSub').textContent = '';
  document.getElementById('fuList').innerHTML = F.rows.filter(Boolean).map(([h, d], i) => `<div class="furow" style="animation-delay:${(0.35 + i * 0.22).toFixed(2)}s"><b>${esc(h)}</b><span>${esc(d)}</span></div>`).join('');
  Object.assign(FUSION, { id: F.id, req, t0: performance.now(), slammed: false, parts: [], shake: 0, cols: F.cols, name: F.name, sub: F.sub, first: F.first, kicks: F.kicks, sup: !!F.sup });
  sfx('fusionRise'); vibrate(30);
  cancelAnimationFrame(FUSION.raf); FUSION.raf = requestAnimationFrame(fusionFrame);
}

function fusionClose() {
  cancelAnimationFrame(FUSION.raf); FUSION.req = null;
  const el = document.getElementById('fusion'); if (el) el.className = '';
}

const fuEase = p => p * p * p; // (slow, then rushing together)
function fusionFrame(now) {
  // Gone from under us (a test or a quit dropped the box): tidy up.
  if (!G || G.state !== 'loot' || !FUSION.req || UI.lootReq !== FUSION.req) { fusionClose(); return; }
  const t = (now - FUSION.t0) / 1000, [ca, cb, cc] = FUSION.cols;
  const stage = document.getElementById('fuStage'), fx = document.getElementById('fuFx'), a = document.getElementById('fuA'), b = document.getElementById('fuB');
  const sr = stage.getBoundingClientRect(), cx = sr.left + sr.width / 2, cy = sr.top + sr.height / 2;
  const D = Math.min(sr.width * 0.36, 150);
  const dpr = Math.min(2, window.devicePixelRatio || 1), fw = fx.clientWidth || innerWidth, fh = fx.clientHeight || innerHeight;
  if (fx.width !== Math.round(fw * dpr)) { fx.width = Math.round(fw * dpr); fx.height = Math.round(fh * dpr); }
  const f = fx.getContext('2d'); f.setTransform(dpr, 0, 0, dpr, 0, 0); f.clearRect(0, 0, fw, fh);
  const dt = 1 / 60;
  if (t < FUSION_SLAM) {
    // Fly in from the edges, circle each other, then rush together, shaking harder all the way.
    const fly = Math.min(1, t / 0.35), p = Math.max(0, (t - 0.35) / (FUSION_SLAM - 0.35));
    const sep = (1 - fuEase(p)) * D + (1 - fly) * fw * 0.5;
    const orb = p * p * 2.4, jit = p * p * 6;
    const ax = -Math.cos(orb) * sep, ay = -Math.sin(orb) * sep * 0.35, sc = 1 + p * 0.25;
    const j = () => (Math.random() - 0.5) * jit;
    a.style.transform = `translate(${ax + j()}px, ${ay + j()}px) scale(${sc})`;
    b.style.transform = `translate(${-ax + j()}px, ${-ay + j()}px) scale(${sc})`;
    a.firstChild.style.transform = `rotate(${-p * p * 200}deg)`; b.firstChild.style.transform = `rotate(${p * p * 200}deg)`;
    fusionEl().style.setProperty('--lab', Math.max(0, 1 - p * 2).toFixed(2)); // (the names fade as they close in)
    // The crackle between them: a jagged bolt in each weapon's colour, brighter as they close.
    if (fly >= 1) {
      const x0 = cx + ax, y0 = cy + ay, x1 = cx - ax, y1 = cy - ay;
      f.globalCompositeOperation = 'lighter';
      for (const [col, w] of [[ca, 3], [cb, 3], ['#ffffff', 1.2]]) {
        f.strokeStyle = col; f.lineWidth = w; f.globalAlpha = 0.25 + p * 0.65; f.beginPath(); f.moveTo(x0, y0);
        for (let k = 1; k < 8; k++) { const q = k / 8; f.lineTo(x0 + (x1 - x0) * q + (Math.random() - 0.5) * 18 * (1 - p * 0.5), y0 + (y1 - y0) * q + (Math.random() - 0.5) * 18); }
        f.lineTo(x1, y1); f.stroke();
      }
      // Specks drawn in towards the middle.
      if (Math.random() < 0.4 + p) { const r = 140 + Math.random() * 120, an = Math.random() * TAU; FUSION.parts.push({ x: cx + Math.cos(an) * r, y: cy + Math.sin(an) * r, tx: cx, ty: cy, life: 0.6, r: 1.5 + Math.random() * 2, c: Math.random() < 0.5 ? ca : cb, pull: true }); }
      f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1;
    }
    const k = document.getElementById('fuKick'), kick = t < 0.35 ? FUSION.kicks[0] : 'FUSING' + '.'.repeat(1 + Math.floor(t * 5) % 3);
    if (k.textContent !== kick) k.textContent = kick;
  } else if (!FUSION.slammed) {
    FUSION.slammed = true;
    const el = fusionEl(); el.className = 'on fused' + (FUSION.sup ? ' super' : '');
    document.getElementById('fuKick').textContent = FUSION.kicks[FUSION.first ? 1 : 2];
    document.getElementById('fuName').textContent = FUSION.name.toUpperCase();
    document.getElementById('fuSub').textContent = FUSION.sub;
    a.style.transform = b.style.transform = '';
    for (let i = 0; i < 180; i++) { const an = Math.random() * TAU, v = 140 + Math.random() * 620; FUSION.parts.push({ x: cx, y: cy, vx: Math.cos(an) * v, vy: Math.sin(an) * v, life: 0.9 + Math.random() * 1.3, r: 1.5 + Math.random() * 3.5, c: [ca, cb, cc, '#ffffff'][i % 4] }); }
    FUSION.shake = FUSION.sup ? 1.4 : 1;
    sfx('fusionSlam'); sfx('decode'); vibrate([60, 30, 160]);
  }
  if (t >= FUSION_SLAM) {
    const u = t - FUSION_SLAM;
    if (u < 0.3) { f.fillStyle = '#ffffff'; f.globalAlpha = 1 - u / 0.3; f.fillRect(0, 0, fw, fh); f.globalAlpha = 1; }
    // Shockwaves, one per colour.
    f.globalCompositeOperation = 'lighter';
    [ca, cb, cc].forEach((col, i) => { const v = u - i * 0.12; if (v <= 0 || v > 1) return; f.strokeStyle = col; f.globalAlpha = 1 - v; f.lineWidth = 6 * (1 - v) + 1; f.beginPath(); f.arc(cx, cy, 30 + v * Math.max(fw, fh) * 0.6, 0, TAU); f.stroke(); });
    f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1;
  }
  // Screen shake on the box after the slam.
  if (FUSION.shake > 0) { FUSION.shake = Math.max(0, FUSION.shake - dt * 2.2); const s = FUSION.shake * FUSION.shake * 14; document.querySelector('#fusion .fubox').style.transform = s > 0.2 ? `translate(${(Math.random() - 0.5) * s}px, ${(Math.random() - 0.5) * s}px)` : ''; }
  f.globalCompositeOperation = 'lighter';
  for (const q of FUSION.parts) {
    if (q.life <= 0) continue;
    q.life -= dt;
    if (q.pull) { q.x += (q.tx - q.x) * 0.12; q.y += (q.ty - q.y) * 0.12; }
    else { q.vx *= 0.975; q.vy *= 0.975; q.vy += 60 * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    f.globalAlpha = Math.min(1, q.life * 1.5); f.fillStyle = q.c; f.beginPath(); f.arc(q.x, q.y, q.r, 0, TAU); f.fill();
  }
  f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1;
  if (FUSION.parts.length > 400) FUSION.parts = FUSION.parts.filter(q => q.life > 0);
  FUSION.raf = requestAnimationFrame(fusionFrame);
}

// The build-up: a rising whine and a swelling hiss. The slam: a deep thump and a crack (the fanfare is 'decode').
if (typeof SOUNDS !== 'undefined') {
  SOUNDS.fusionRise = [1, t => {
    vTone(t, 110, 880, 1.6, 0.05, 'sawtooth'); vTone(t, 220, 1760, 1.6, 0.025, 'square');
    vNoise(t, 1.6, 'bandpass', 300, 5000, 1.5, 0.05);
  }];
  SOUNDS.fusionSlam = [1, t => {
    vTone(t, 160, 38, 0.7, 0.22, 'sine'); vTone(t, 90, 30, 0.5, 0.12, 'triangle');
    vNoise(t, 0.5, 'lowpass', 3000, 200, 0.8, 0.14);
  }];
}

// ---------------------------------------------------------------- the HUD bond
// Weapons fused into a combo sit side by side in the weapon panel inside one shared border (gold when a super
// combo joins them), with the combo's name on a tab. Only the display order changes, never G.weapons.
function comboBonds() {
  const box = $('wslots'), host = $('bottom');
  if (!box || !host || !G) return;
  const ws = G.weapons, els = box.children;
  const par = ws.map((_, i) => i), find = i => par[i] === i ? i : (par[i] = find(par[i]));
  const at = id => ws.findIndex(w => w && w.id === id);
  const names = {};
  for (const id in G.combo || {}) {
    const c = COMBO_BY[id], i = c ? at(c.a) : -1, j = c ? at(c.b) : -1;
    if (i < 0 || j < 0) continue;
    par[find(i)] = find(j);
  }
  // Group members sit together, in the order the group's first weapon has.
  const groups = new Map();
  ws.forEach((w, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(i); });
  let o = 0;
  for (const g of groups.values()) for (const k of g) if (els[k]) els[k].style.order = o++;
  // Each bonded group's label: its super combo if it has one, else its combo names.
  const bonds = [];
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    const ids = new Set(g.map(i => ws[i].id));
    const sup = SUPERS.find(s => superOn(s.id) && superWeapons(s).every(id => ids.has(id)));
    const cs = Object.keys(G.combo || {}).filter(id => COMBO_BY[id] && ids.has(COMBO_BY[id].a) && ids.has(COMBO_BY[id].b)).map(id => COMBO_BY[id].name);
    bonds.push({ g, sup: !!sup, label: sup ? sup.name : cs.join(' + ') });
  }
  const br = box.getBoundingClientRect();
  const sig = bonds.map(b => b.g.join(',') + b.label).join('|') + ':' + Math.round(br.left) + ',' + Math.round(br.top) + ',' + Math.round(br.width) + ',' + Math.round(br.height) + ':' + els.length;
  let lay = $('wbonds');
  if (!lay) { lay = document.createElement('div'); lay.id = 'wbonds'; host.appendChild(lay); }
  if (lay.dataset.sig === sig) return;
  lay.dataset.sig = sig;
  const hr = host.getBoundingClientRect();
  let h = '';
  for (const b of bonds) {
    // One box per row the group sits on (it can wrap).
    const rows = [];
    for (const k of b.g) {
      const r = els[k] && els[k].getBoundingClientRect();
      if (!r || !r.width) continue;
      let row = rows.find(q => Math.abs(q.t - r.top) < 8);
      if (!row) rows.push(row = { t: r.top, l: r.left, r: r.right, b: r.bottom });
      row.l = Math.min(row.l, r.left); row.r = Math.max(row.r, r.right); row.b = Math.max(row.b, r.bottom);
    }
    rows.forEach((q, i) => {
      h += `<div class="wbond${b.sup ? ' sup' : ''}" style="left:${(q.l - hr.left - 3).toFixed(0)}px; top:${(q.t - hr.top - 3).toFixed(0)}px; width:${(q.r - q.l + 6).toFixed(0)}px; height:${(q.b - q.t + 6).toFixed(0)}px">${i === 0 ? `<em>${esc(b.label.toUpperCase())}</em>` : ''}</div>`;
    });
  }
  lay.innerHTML = h;
}
