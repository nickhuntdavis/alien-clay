'use strict';
// Spawn Prawn - whispers (whisper.js). In Immersive mode the two narrator voices (the Scientist and the inner
// voice) don't pop up over the slide: a small indicator appears instead, and tapping it reveals the line while the
// game runs at 10% behind it. Tap the line (or wait) to close it.
// Owns: the indicator (#wsDot), the held line, the reveal and the slow-down.
// Hooks: ui.js sysmsg queue -> wsTake (holds voice lines in Immersive); inspect.js inspectMul -> wsMul.
// Save data: none.
const WS = { held: null, open: false, timer: 0, keep: 0 };
const WS_SLOW = 0.1;  // game speed while a line is open
const WS_KEEP = 30e3; // an unread line waits this long (ms, real time), then the indicator fades
const wsMul = () => (WS.open && G && G.state === 'play' ? WS_SLOW : 1);

function wsDot() {
  let d = $('wsDot');
  if (d) return d;
  d = document.createElement('button'); d.id = 'wsDot'; d.innerHTML = '<i></i><b>LOG</b>';
  $('hud').appendChild(d);
  d.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); wsReveal(); });
  $('sysmsg').addEventListener('pointerdown', e => { if (!WS.open) return; e.stopPropagation(); e.preventDefault(); wsClose(); });
  return d;
}
// Called with the message queue: takes the next line if it is a voice line and Immersive is on. True when it did.
function wsTake(q) {
  const m = q[0];
  if (!m || (m.who !== 'sci' && m.who !== 'con') || !immersiveOn() || WS.open) return false;
  q.shift(); WS.held = m;
  const d = wsDot(); d.dataset.who = m.who;
  d.classList.remove('on'); void d.offsetWidth; d.classList.add('on');
  clearTimeout(WS.keep); WS.keep = setTimeout(() => { if (WS.held === m && !WS.open) { WS.held = null; d.classList.remove('on'); } }, WS_KEEP);
  return true;
}
function wsReveal() {
  const m = WS.held; if (!m || !G || G.state !== 'play') return;
  WS.held = null; WS.open = true; $('wsDot').classList.remove('on');
  const box = $('sysmsg');
  box.querySelector('b').textContent = m.head; box.querySelector('span').textContent = m.body;
  box.dataset.who = m.who; box.classList.add('ws');
  box.classList.remove('on'); void box.offsetWidth; box.classList.add('on');
  UI.msgT = 999; // (ui.js waits; we close it)
  clearTimeout(WS.timer); WS.timer = setTimeout(wsClose, 1500 + 1000 * (m.hold || Math.min(6, 2.2 + m.body.length / 24)));
}
function wsClose() {
  if (!WS.open) return;
  WS.open = false; clearTimeout(WS.timer);
  const box = $('sysmsg'); box.classList.remove('on', 'ws');
  UI.msgT = 0;
}
