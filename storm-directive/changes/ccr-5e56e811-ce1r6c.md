## 2026-10-23 Splash intro lag fix (v10.68)
- Systems: ui (splash)
- Files: splash.js
- What: the focus phase of the opening splash no longer uses a canvas blur filter (very slow in the Android WebView). The slide is drawn small and scaled up for the soft look, and the canvas resolution is capped at 1.5x.
- Save data: none
- Hooks: none
- Risk: the out-of-focus look is slightly different (softer, pixel-scaled rather than gaussian).
