'use strict';
// Spawn Prawn - meet a sample you have never played (user, 28 Oct). Rescuing a kindred spirit of a sample you have no
// runs with (no kills on its profile, META.prof) and have not met before (META.s10met) pauses the run on a full-screen
// card before its rescue screen: MEET <NAME>, the sample swimming (samplelooks.js slPicStart), its origin and damage
// types, its line, its passive and a play-style tip (TODO_COPY:meet_<id>_style). A tap on the button closes it and
// the rescue carries on (its weapon screen, or the fusion when every mount is full). Once per sample, ever.
//  - Skipped in tests and sims (window.TUT_OFF), as the tutorial cards are.
// Hooks: none (wraps kindred.js kinRescue; loads after kinall.js). Save data: META.s10met { <sample id>: 1 }.

const MEET = { open: false, paused: false };
const meetPlayed = id => !!((META.s10met || {})[id]) || ((META.prof && META.prof['s10_' + id] && META.prof['s10_' + id].kills) || 0) > 0;
function meetEl() {
  let el = document.getElementById('meetS');
  if (el) return el;
  el = document.createElement('div'); el.id = 'meetS';
  el.innerHTML = '<div class="mswrap"><div class="mskick" id="msKick"></div><canvas id="msPic"></canvas><div class="msname" id="msName"></div>'
    + '<div class="msorigin" id="msOrigin"></div><div class="mstypes" id="msTypes"></div><p class="msline" id="msLine"></p>'
    + '<div class="msbox"><b id="msPass"></b><span id="msPdesc"></span></div><div class="msbox msstyle"><span id="msStyle"></span></div>'
    + '<button class="btn primary" id="msGo"></button></div>';
  document.body.appendChild(el);
  return el;
}
function meetShow(id) {
  const s = S10_BY[id]; if (!s) return;
  const el = meetEl();
  document.getElementById('msKick').textContent = 'MEET';
  document.getElementById('msName').textContent = s.name.toUpperCase();
  document.getElementById('msOrigin').textContent = s.origin || '';
  const disp = (typeof TP_DISPLAY !== 'undefined' && TP_DISPLAY[id]) || s.types || [];
  document.getElementById('msTypes').innerHTML = disp.map(t => { const el2 = S10_TYPES[t] || t, nm = (ELEMENTS[el2] && ELEMENTS[el2].name) || t;
    return `<span class="mstype" style="--tc:${elemCol(el2)}">${esc(nm)}</span>`; }).join('');
  document.getElementById('msLine').textContent = s.line ? '"' + s.line + '"' : '';
  document.getElementById('msPass').textContent = s.passive || '';
  document.getElementById('msPdesc').textContent = s.pdesc || '';
  document.getElementById('msStyle').textContent = 'TODO_COPY:meet_' + id + '_style';
  const go = document.getElementById('msGo'); go.textContent = 'TODO_COPY:meet_go';
  const pic = document.getElementById('msPic'); pic.dataset.slpic = id; pic.width = pic.height = 0;
  el.className = 'on';
  MEET.open = true;
  if (G && G.state === 'play') { G.state = 'loot'; MEET.paused = true; } // (paused under the card)
  if (typeof slPicStart === 'function') slPicStart();
  if (typeof sfx === 'function') sfx('level');
  go.onclick = e => { e.stopPropagation(); meetClose(); };
  (META.s10met || (META.s10met = {}))[id] = 1; saveMeta();
}
function meetClose() {
  const el = document.getElementById('meetS'); if (el) el.className = '';
  MEET.open = false;
  if (MEET.paused && G && G.state === 'loot' && !UI.kinFuse) { G.state = 'play'; if (typeof lastTs !== 'undefined') lastTs = performance.now(); } // (the rescue screen then opens from the queue)
  MEET.paused = false;
}
if (typeof kinRescue === 'function') {
  const kr = kinRescue;
  kinRescue = function (s) {
    const first = !window.TUT_OFF && s && S10_BY[s.id] && !meetPlayed(s.id);
    const r = kr.apply(this, arguments);
    if (first) meetShow(s.id);
    return r;
  };
}
