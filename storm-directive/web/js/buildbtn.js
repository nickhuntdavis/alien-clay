'use strict';
// Spawn Prawn - a sperm button on the HUD, left of RUN (user, 26 Oct): one tap pauses on the BUILD tab (buildpanel.js),
// where the pause button lands on YOU.
// Hooks: none in shared files. Adds #spermBtn before uikit.js #moveBtn at load; ui.js togglePause, renderPause.
const UI_ICON_SPERM = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><ellipse cx="17" cy="7" rx="4.2" ry="3.2" transform="rotate(-35 17 7)" fill="currentColor"/><path d="M13.6 9.6c-2 1.6-1.2 3.6-3.2 5s-3.4-.2-5 1.4-1 3.6-2.6 5"/></svg>';
function buildBtnTap() {
  if (!G || G.state !== 'play') return;
  UI.togglePause();
  UI.pauseTab = 'build'; UI.renderPause(); const p = document.getElementById('pause'); if (p) p.scrollTop = 0;
}
{
  const mv = document.getElementById('moveBtn');
  if (mv && !document.getElementById('spermBtn')) {
    mv.insertAdjacentHTML('beforebegin', uiHudKey('spermBtn', UI_ICON_SPERM, 'Your build'));
    document.getElementById('spermBtn').addEventListener('click', buildBtnTap);
    const st = document.createElement('style');
    // The HUD key look (eink.css #armBtn) and, in the portrait Immersive HUD, a 52 px key left of RUN (Rewind's spot;
    // one further left while Rewind is on: norewind.js body.rewindOn).
    st.textContent = '#spermBtn{pointer-events:auto;display:flex;align-items:center;justify-content:center;padding:0 10px;color:var(--color-text-strong)}'
      + '#hud #spermBtn{background:var(--hud-bg-app,var(--color-bg-sheet))!important;border:1px solid var(--hud-border-edge,var(--line))!important;color:var(--hud-text-primary,var(--color-text-strong))!important;box-shadow:none!important;border-radius:12px!important}'
      + 'body.immersive #spermBtn{opacity:.5;background:var(--veil)!important;border-color:var(--line)!important}body.immersive #spermBtn:active{opacity:.9}'
      + 'body.immersive:not(.land) #row2 #spermBtn{position:fixed;left:calc(50% - 113px);bottom:calc(24px + env(safe-area-inset-bottom));width:52px;height:52px;padding:0}'
      + 'body.immersive.rewindOn:not(.land) #row2 #spermBtn{left:calc(50% - 173px)}'
      + 'body.land #row2 #spermBtn{width:46px;padding:0}';
    document.head.appendChild(st);
  }
}
