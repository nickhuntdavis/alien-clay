'use strict';
// Spawn Prawn - manual fire (SET.autoFire OFF): weapons only fire while you hold their FIRE button (one per weapon,
// stacked on the right where Rewind used to be; Rewind moved to the left). A quick tap fires the next shot.
// Orbiting, wake, siphon and heat weapons stay automatic. Echoes always fire.
// Hooks: game.js updateWeapon -> mfGo (and clears w.mfTap after a shot); settings.js SETTINGS_DEF autoFire row.

const mfOn = () => !!G && typeof SET !== 'undefined' && SET.autoFire === false;
const mfGo = w => !mfOn() || w.echo || w.mfHeld || (w.mfTap > 0 && G.t < w.mfTap);

(function mfDom() {
  if (typeof document === 'undefined') return;
  const side = document.getElementById('side'); if (!side) return;
  const col = document.createElement('div');
  col.id = 'fireCol';
  col.style.cssText = 'position:absolute;right:calc(10px + env(safe-area-inset-right));display:none;flex-direction:column-reverse;gap:10px;align-items:flex-end;pointer-events:auto';
  side.parentNode.appendChild(col);
  let key = '';
  const build = ws => {
    col.innerHTML = ws.map((w, i) => `<button data-i="${i}" style="width:66px;height:66px;border-radius:50%;border:2px solid ${elemCol(wElem(w))};background:#000000b0;color:#fff;font:800 9px monospace;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;touch-action:none">${iconSVG(w.def, 24, elemCol(wElem(w)))}FIRE</button>`).join('');
    col.querySelectorAll('button').forEach(b => {
      const w = () => G && G.weapons.filter(Boolean)[+b.dataset.i];
      const up = () => { const x = w(); if (x) x.mfHeld = false; b.style.opacity = ''; };
      b.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); const x = w(); if (!x) return; x.mfHeld = true; x.mfTap = G.t + 0.5; b.style.opacity = '0.6'; try { b.setPointerCapture(e.pointerId); } catch (er) { /* old WebView */ } });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, up));
      b.addEventListener('contextmenu', e => e.preventDefault());
    });
  };
  setInterval(() => {
    const on = mfOn() && G.state === 'play';
    col.style.display = on ? 'flex' : 'none';
    if (!on) { if (G) G.weapons.forEach(w => { if (w) w.mfHeld = false; }); return; }
    col.style.bottom = side.style.bottom || getComputedStyle(side).bottom;
    const ws = G.weapons.filter(Boolean), k = ws.map(w => w.uid + ':' + wElem(w)).join(',');
    if (k !== key) { key = k; build(ws); }
  }, 250);
})();
