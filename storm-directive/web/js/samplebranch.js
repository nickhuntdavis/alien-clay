'use strict';
// Spawn Prawn - sample branches (user, 30 Oct 2026): a sample grows a branch of its own, as a weapon does, but for the
// whole sperm. At sample (run) Lv 5 a screen offers the sample's three branches; at Lv 20 the taken branch's two cards
// and its wildcard; at Lv 25 the masteries (any branch may take any, each says which it suits). A branch is a passive on
// every weapon you hold plus the cards that grow it, and the body wears it (the sample's costume: baselinelook.js).
//  - smbReg(sampleId, spec): spec is the weapon branch shape (weapons24.js wupReg): { A, B, C: { name, tag, costs, kind,
//    lv3: { desc, apply }, lv6: [card, card], wild: card }, lv10: [{ name, best, desc, apply }] }; `kind` names the costume.
//    A card's apply(G) runs once, when taken. Behaviour reads the run state (smbP, smbHas), not the weapon.
//  - Run state G.smb: { p: branch letter, l6, l10: card names taken, q: the step already queued, f: flags set by cards }.
//  - The screen is a fork request ({ kind: 'fork', smb: { lv } }), dealt by the director like the weapon branch screens;
//    the branch cards carry a live picture of the sample in each costume (smbPics).
//  Tests and sims (window.TUT_OFF) get no screens unless SMB.force.
// Hooks: none in shared files. hookOn('tick'); wraps draft.js forkCards and draftTitle, ui.js UI.renderLootCards and UI.openLoot.
// Loads after branchback.js, before baseline1.js. Save data: none.

const SMB = { at: [5, 20, 25], force: false };
const SMB_REG = {};
function smbReg(id, spec) { SMB_REG[id] = spec; }
const smbS = () => G.smb || (G.smb = { p: '', l6: '', l10: '', q: -1, f: {} });
const smbId = () => (G && G.s10 ? G.s10.id : null);
const smbSpec = () => SMB_REG[smbId()] || null;
const smbP = () => (G && G.smb && smbSpec() ? G.smb.p : '');
const smbHas = k => !!(G && G.smb && G.smb.f[k] && smbSpec());
const smbSet = k => () => { smbS().f[k] = 1; };
const smbOn = () => !!G && !!smbSpec() && !(typeof window !== 'undefined' && window.TUT_OFF && !SMB.force) && !(typeof sbOn === 'function' && sbOn());
const smbName = () => { const s = smbId() && typeof S10_BY !== 'undefined' && S10_BY[smbId()]; return s ? s.name : 'Sample'; };

// ---------------------------------------------------------------- the level gates
function smbStep() { const M = smbS(); return !M.p ? 0 : !M.l6 ? 1 : !M.l10 ? 2 : 3; }
hookOn('tick', 'samplebranch:gate', () => {
  if (!smbOn() || G.state !== 'play') return;
  const M = smbS(), step = smbStep();
  if (step >= 3 || M.q === step || (G.level || 1) < SMB.at[step]) return;
  if (step === 2 && !smbSpec().lv10) return;
  M.q = step;
  G.lootQueue.push({ kind: 'fork', v10ok: true, smb: { lv: [3, 6, 10][step] } });
});

// ---------------------------------------------------------------- the cards
// The screen's cards for a step (lv 3, 6 or 10), or [] once that step is taken.
function smbCards(lv) {
  const S = smbSpec(); if (!S) return [];
  const M = smbS(), step = lv === 3 ? 0 : lv === 6 ? 1 : 2;
  if (smbStep() !== step) return [];
  const sub = `${smbName()} | Lv ${SMB.at[step]}`, col = '#ff4d6d';
  const card = (title, desc, fn, tag, kind) => ({ rarity: 3, tag, icon: 'B', color: col, title, sub, desc, smbKind: kind || '',
    apply: () => { fn(); M.q = -1; recomputeAll(); } });
  if (lv === 3) return ['A', 'B', 'C'].filter(k => S[k]).map(k => card(S[k].name, S[k].lv3.desc + (S[k].costs ? ' Costs: ' + S[k].costs : ''), () => { M.p = k; S[k].lv3.apply(G); }, 'SAMPLE BRANCH', S[k].kind));
  const P = S[M.p]; if (!P) return [];
  if (lv === 6) return [...P.lv6, P.wild].filter(Boolean).map((c, i) => card(c.name, c.desc, () => { M.l6 = c.name; c.apply(G); }, i === 2 ? 'WILDCARD' : 'BRANCH', P.kind));
  return (S.lv10 || []).map(c => card(c.name, c.desc + (c.best ? ` (Best with ${c.best.split('').map(k => S[k] ? S[k].name : k).join(', ')}.)` : ''), () => { M.l10 = c.name; c.apply(G); }, 'MASTERY', P.kind));
}
forkCards = (orig => function (req) { return req && req.smb ? smbCards(req.smb.lv) : orig(req); })(forkCards);
draftTitle = (orig => function (req) {
  if (!req || !req.smb) return orig(req);
  const P = smbSpec() && smbSpec()[smbS().p], lv = req.smb.lv;
  return [smbName().toUpperCase() + ': ' + (lv === 3 || !P ? 'SAMPLE BRANCH' : P.name.toUpperCase()), lv === 3 ? 'This one changes the whole sample. Take one: the other two are gone for the run.' : lv === 6 ? 'How it grows from here. Take one: the others are gone for the run.' : "The sample's mastery. Any will take; each says which branch it suits."];
})(draftTitle);

// ---------------------------------------------------------------- a live picture of the sample on each card
// The sample swims on the spot facing right, wearing the card's costume (smbLookKind is read by the costume drawer).
let smbLookKind = null, smbPicTok = 0;
function smbPics() {
  const req = UI.lootReq; if (!req || !req.smb || !G || !smbId()) return;
  const id = smbId(), cards = [...document.querySelectorAll('#lootCards > .card')];
  const cvs = [];
  cards.forEach((c, i) => {
    const o = UI.lootOpts[i]; if (!o || !o.smbKind || c.querySelector('canvas.smbPic')) return;
    const cv = document.createElement('canvas'); cv.className = 'smbPic'; cv.dataset.k = o.smbKind;
    cv.style.cssText = 'position:relative;display:block;width:100%;height:64px;margin:16px 0 4px;border-radius:8px;background:rgba(255,255,255,0.05);pointer-events:none';
    c.insertBefore(cv, c.firstChild); cvs.push(cv);
  });
  if (!cvs.length || typeof slPicDraw !== 'function' || !SL[id]) return;
  const tok = ++smbPicTok, t0 = performance.now(), bodies = new Map();
  const frame = () => {
    if (tok !== smbPicTok || !cvs.some(c => c.isConnected)) return;
    requestAnimationFrame(frame);
    const now = (performance.now() - t0) / 1000;
    for (const cv of cvs) {
      if (!cv.isConnected || !cv.clientWidth) continue;
      const dpr = window.devicePixelRatio || 1;
      if (cv.width !== Math.round(cv.clientWidth * dpr) || cv.height !== Math.round(cv.clientHeight * dpr)) { cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(cv.clientHeight * dpr); }
      const body = bodies.get(cv) || (bodies.set(cv, { x: 0, y: 0, vx: 140, vy: 0, tailV: 140, id: -2 }), bodies.get(cv));
      smbLookKind = cv.dataset.k;
      try { smbPicDraw(cv, id, body, now); } finally { smbLookKind = null; }
    }
  };
  requestAnimationFrame(frame);
}
// samplelooks.js slPicDraw, framed closer: the head at three quarters across, the front of the tail behind it.
function smbPicDraw(cv, id, body, now) {
  const g = cv.getContext('2d'), keep = { ctx, S, W, H, cx: cam.x, cy: cam.y, G };
  try {
    ctx = g; W = cv.width; H = cv.height;
    G = { realT: now };
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    S = H / 19; body.y = Math.sin(now * 1.4) * 0.8; body.hd = body.face = 0;
    cam.x = body.x - W * 0.22 / S; cam.y = body.y;
    slDraw(id, sx(body.x), sy(body.y), 0, PAL.you, 1, 1, body, now);
  } finally { ctx = keep.ctx; S = keep.S; W = keep.W; H = keep.H; cam.x = keep.cx; cam.y = keep.cy; G = keep.G; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
}
UI.openLoot = (orig => function (req) { const r = orig.apply(this, arguments); if (req && req.smb) $('rerollBtn').style.display = 'none'; return r; })(UI.openLoot); // (a branch screen has nothing to reroll)
UI.renderLootCards = (orig => function () { const r = orig.apply(this, arguments); try { smbPics(); } catch (e) { console.error(e); } return r; })(UI.renderLootCards);
