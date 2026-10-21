## 2026-10-21 eInk view always light (v10.52)
- Systems: style, settings
- Files: settings.js, tests/einkshot.js, ARCHITECTURE.md
- What: eInk view is always Paper (light), whatever the phone's dark setting.
- Save data: none.
- Hooks: none.
- Risk: none.

## 2026-10-21 eInk view (v10.51)
- Systems: style, settings, ui
- Files: eink.css (new), fonts/Barlow-*.ttf + OFL.txt (new), style.css, index.html, settings.js, ui.js, tests/einkshot.js (new), tests/run.sh, ARCHITECTURE.md
- What: Merged the e-ink UI archive. Settings > View now has a third option, EINK: every DOM screen and the HUD use the Figma e-ink design system (grey paper, 2px ink rules, Barlow, no glow or grain; Ink mode, AMOLED black, when the phone is in dark mode), over the Arcade slide. style.css's hardcoded greys now use the colour tokens (Lab and Arcade look the same as before, near enough).
- Save data: SET.view gains the value 'eink' (no new keys).
- Hooks: ui.js applySettings -> applyEink(); index.html loads eink.css (media off) after style.css.
- Risk: viewArcade() is true in eInk view, so everything gated on Arcade (full colour, rings, Immersive AUTO) applies. TODO_COPY:set_view_eink_hint open. Barlow adds about 530 KB to the APK.
