## 2026-10-20 Close-up between waves; tutorial cards pan to terrain and the egg (v10.49)
- Systems: wave-mode, camera, tutorial
- Files: restcam.js (new), game.js, bosses.js, tutorial.js, index.html
- What: while the next-wave button shows, the camera zooms in on your sperm and sits low of it so the button does not cover you; it eases back out when the wave starts. Terrain and egg tutorial cards now pan and zoom to the thing they explain (they used to spotlight you).
- Save data: none
- Hooks: game.js update -> restCamTick (camera line); bosses.js updateBossIntro reads I.zk
- Risk: ZOOM.z is written directly during the rest (not saved); pinching during the rest becomes the new base zoom.
