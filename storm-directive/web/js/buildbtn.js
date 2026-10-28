'use strict';
// Spawn Prawn - a sperm button on the HUD, left of RUN (user, 26 Oct): one tap pauses on the YOU tab (user, 28 Oct; it
// opened BUILD before).
// Hooks: none in shared files. Adds #spermBtn before uikit.js #moveBtn at load; ui.js togglePause, renderPause.
const UI_ICON_SPERM = '<svg viewBox="0 0 24 24" width="22" height="22"><ellipse cx="16.6" cy="7.4" rx="4.6" ry="3.5" transform="rotate(-35 16.6 7.4)" fill="currentColor"/><path d="M13.2 10.2c-2.2 1.8-1.4 3.6-3.4 5.1s-3.4-.1-5 1.5-1.1 3.4-2.6 4.9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="17.6" cy="6.6" rx="1.3" ry="1" transform="rotate(-35 17.6 6.6)" fill="#000" opacity=".45"/></svg>';
function buildBtnTap() {
  if (!G || G.state !== 'play') return;
  UI.togglePause(); // (lands on YOU)
  const p = document.getElementById('pause'); if (p) p.scrollTop = 0;
}
{
  const mv = document.getElementById('moveBtn');
  if (mv && !document.getElementById('spermBtn')) {
    mv.insertAdjacentHTML('beforebegin', uiHudKey('spermBtn', UI_ICON_SPERM, 'Your build'));
    document.getElementById('spermBtn').addEventListener('click', buildBtnTap);
    const st = document.createElement('style');
    // Its look comes from the shared #armBtn rules (style.css, eink.css list #spermBtn beside it); only the portrait
    // Immersive spot is set here: a 52 px key left of RUN (Rewind's spot; one further left while Rewind is on:
    // norewind.js body.rewindOn).
    st.textContent = 'body.immersive:not(.land) #row2 #spermBtn{position:fixed;left:calc(50% - 113px);bottom:calc(24px + env(safe-area-inset-bottom));width:52px!important;height:52px!important;align-self:auto;border-radius:12px!important;z-index:5}'
      + 'body.immersive.rewindOn:not(.land) #row2 #spermBtn{left:calc(50% - 173px)}';
    document.head.appendChild(st);
  }
}
