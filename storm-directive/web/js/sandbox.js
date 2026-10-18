'use strict';
// Spawn Prawn - Sandbox (s010, developer only): weapons and nothing else, for tuning how they feel.
//  - Runs on the Lab Bench (G.debug, so no bosses, rivals, events, egg race or Feats), without god mode.
//  - A slow stream of enemies: its own difficulty clock at a quarter of race speed (minute 40 here is about
//    minute 10 of a race). HEAT + / - on the HUD: each step spawns 35% more and moves the clock on 90 s.
//  - Loot: the starting weapon (any of the 24), new mounts up to the chosen 1, 2 or 3 weapons, and the weapon
//    upgrade screens (promise, branch, mastery), shown in the weapon draft screen. Every other box is dropped
//    and power-ups are cleared.
//  - Developer mode: tap the samples title five times (sd_dev).
// Hooks: game.js PT -> sbPT, director -> sbSpawn, newGame -> sbInit; v10.js v10Box -> sbBox, v10Loot -> sbLoot;
// ui.js openLoot -> sbDraftKind, openDraft -> sbDraftHead, renderDraft -> sbDraftInfo; samples10.js s10Samples -> sbCards/sbWire.

const SB = { clockK: 0.25, rateK: 0.6, capK: 0.7, heatRate: 1.35, heatCap: 1.2, heatPT: 90 };
const sbOn = () => !!(G && G.debug && G.debug.sb);

function sbInit() {
  initDebug();
  Object.assign(G.debug, { god: false, loot: true, sb: { n: UI.sbN || 1, heat: 0 } });
  G.weapons = Array(BASE_SLOTS).fill(null);
  G.lootQueue = [{ kind: 'start' }];
  recomputeAll();
}
const sbPT = () => Math.max(0, G.t * PACE * SB.clockK + G.debug.sb.heat * SB.heatPT);

function sbSpawn(rate, maxAlive, hostile, dt) {
  const h = G.debug.sb.heat, cap = Math.min(CAPS.enemies - 30, maxAlive * SB.capK * Math.pow(SB.heatCap, h));
  G.spawnAcc += rate * dt * G.P.spawnMult * SB.rateK * Math.pow(SB.heatRate, h);
  while (G.spawnAcc >= 1) { G.spawnAcc--; if (hostile < cap) { spawnRandom(); hostile++; } }
  G.pickups.length = 0; // (no power-ups or DNA chests)
}

// Which boxes open: weapons and weapon upgrades only.
function sbBox(req) {
  const k = req.kind, own = G.weapons.filter(Boolean).length;
  if (k === 'start') return true;
  if (k === 'slot') {
    if (own < G.debug.sb.n) return true;
    while (G.weapons.length > 1 && G.weapons[G.weapons.length - 1] === null) G.weapons.pop(); // (the mount it grew)
    return false;
  }
  if (k === 'wup') {
    const r = wupReady();
    if (r.length === 1) { req.kind = 'wupfork'; req.w = r[0]; req.lv = wupNextLv(r[0]); } // (straight to its branch cards)
    return r.length > 0;
  }
  if (k === 'wupfork') return wupNextLv(req.w) === req.lv;
  return false;
}
function sbLoot(req) {
  const pool = v10Pool().filter(id => WEAPONS[id] && !G.weapons.some(w => w && (w.sid || w.id) === id));
  if (req.kind === 'start' || req.kind === 'slot') return pool.map(id => optNewWeapon(id, 0));
  if (req.kind === 'wupfork') return wupForkReq(req).map(c => Object.assign(c, { tag: c.tag === 'BRANCH' ? 'BRANCH CARD' : c.tag }));
  return null;
}

// Weapon upgrades in the weapon draft screen (ui.js openDraft).
const sbDraftKind = req => sbOn() && req.kind === 'wupfork';
function sbDraftHead(req, weap) {
  if (!sbDraftKind(req)) return false;
  const t = WUP_TIER.indexOf(req.lv) + 1;
  $('dKick').textContent = `${weap.def.name.toUpperCase()} | TIER ${t - 1} > ${t}`;
  $('dTitle').textContent = ['', '', 'PROMISE', 'BRANCH', 'MASTERY'][t] || 'UPGRADE';
  $('dSub').textContent = 'Take one. The others are gone for the run.';
  return true;
}
function sbDraftInfo(D, o) {
  const rest = UI.lootOpts.filter(x => x !== o);
  return `<div class="dperk"><div class="drole">${esc(o.tag || '')}</div><div class="pn">${esc(o.title)}</div><div class="pd">${esc(o.desc)}</div></div>`
    + (rest.length ? `<h4>YOU WOULD LOSE</h4><div class="dpath">${rest.map(x => `<div class="dp"><em>${esc(x.tag || '')}</em><b>${esc(x.title)}</b><span>${esc(x.desc)}</span></div>`).join('')}</div>` : '');
}

// Samples screen: three Sandbox cards in the DEVELOPER section, and the five-tap switch on the title.
const sbCards = () => [1, 2, 3].map(n => `<button class="sx-card hero" data-sb="${n}" style="--c:#9fb3c8"><span class="sx-txt"><i>#010</i><b>Sandbox: ${n} weapon${n > 1 ? 's' : ''}</b><span>Weapons only. Slow stream, HEAT button.</span><em>SANDBOX</em></span></button>`).join('');
function sbWire() {
  $('sampleList').querySelectorAll('[data-sb]').forEach(b => b.addEventListener('click', () => {
    UI.sample = 's010'; UI.sbN = +b.dataset.sb; META.profile = 'human1'; saveMeta(); UI.startGame(true);
  }));
}
(function sbDom() {
  if (typeof document === 'undefined') return;
  const st = document.getElementById('sampTitle');
  if (st && !st.dataset.dev) {
    st.dataset.dev = '1'; let taps = 0, last = 0;
    st.addEventListener('click', () => {
      const now = performance.now(); taps = now - last < 600 ? taps + 1 : 1; last = now;
      if (taps < 5) return;
      taps = 0; let on = false; try { on = localStorage.getItem('sd_dev') !== '1'; localStorage.setItem('sd_dev', on ? '1' : '0'); } catch (e) { /* storage unavailable */ }
      UI.toast(on ? 'DEVELOPER MODE ON' : 'DEVELOPER MODE OFF'); UI.openSamples();
    });
  }
  // The HEAT bar (ugly on purpose: developer only).
  const bar = document.createElement('div');
  bar.id = 'sbBar';
  bar.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:calc(70px + env(safe-area-inset-top));z-index:7;display:none;gap:6px;align-items:center;font:800 12px monospace;color:#fff;background:#000a;padding:4px 6px;border-radius:6px;pointer-events:auto';
  bar.innerHTML = '<button data-h="-1" style="font:inherit;padding:6px 12px">-</button><span id="sbTxt"></span><button data-h="1" style="font:inherit;padding:6px 12px">HEAT +</button>';
  document.body.appendChild(bar);
  const stop = e => e.stopPropagation();
  ['pointerdown', 'touchstart', 'mousedown'].forEach(ev => bar.addEventListener(ev, stop));
  bar.querySelectorAll('button').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); if (!sbOn()) return;
    const S = G.debug.sb; S.heat = Math.max(-3, S.heat + +b.dataset.h); // (below 0: quieter still) sbShow();
  }));
  const sbShow = () => {
    const on = sbOn() && G.state === 'play';
    bar.style.display = on ? 'flex' : 'none';
    if (on) $('sbTxt').textContent = `HEAT ${G.debug.sb.heat} | ${fmtTime(G.t)} | ${G.enemies.length} foes`;
  };
  setInterval(sbShow, 400);
})();
