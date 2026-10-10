'use strict';
// Spawn Prawn - juice. Hit-stop (the slide freezes for a few hundredths of a second on a big moment, so it
// lands), level-up and mastery celebrations, and named vibration patterns.
const HAPTIC = {
  hurt: 30, bigHurt: [50, 30, 80], elite: [25, 20, 50], bossHit: 18,
  level: [30, 40, 30, 40, 90], mastery: [60, 40, 60, 40, 240], bossKill: [120, 60, 120, 60, 420],
};
function buzz(name) { const p = HAPTIC[name]; if (p) vibrate(p); }
// Freeze the world for sec (real seconds). Returns false while the last one is still cooling down, so a
// stream of big hits doesn't turn into a slideshow.
function hitStop(sec, gap) {
  if (!G || G.state !== 'play') return false;
  const now = performance.now() / 1000;
  if (now < (G.hsNext || 0)) return false;
  G.hitStop = Math.max(G.hitStop || 0, sec); G.hsNext = now + sec + (gap == null ? 0.25 : gap);
  return true;
}
// A level up: a golden shockwave off you and the number, and a beat before the reward box opens so you see it.
function levelJuice(lv) {
  const p = G.player;
  ring(p.x, p.y, 70, PAL.reward, 0.45, 7); ring(p.x, p.y, 150, PAL.reward, 0.7, 4); ring(p.x, p.y, 240, '#ffffff', 0.9, 2);
  fxParts('spark', p.x, p.y, PAL.reward, 22, 380, 0.6, 2.6);
  addLight(p.x, p.y, 320, PAL.reward, 0.6);
  floatText(p.x, p.y - 46, 'LEVEL ' + lv, PAL.reward, 22, 1.1, true);
  G.flashT = Math.max(G.flashT || 0, 0.12); cam.shake = Math.min(14, cam.shake + 6);
  G.lootHold = 0.45;
  hitStop(0.06, 0.1);
  sfx('level'); buzz('level');
}
// A weapon reaches Lv 10 (mastery): the big one. Plays when the upgrade screen closes.
function masteryJuice(w) {
  const p = G.player;
  banner('WEAPON MASTERED!', PAL.reward);
  for (const [r, wd, l] of [[80, 10, 0.6], [180, 7, 0.9], [320, 4, 1.2], [480, 2, 1.5]]) ring(p.x, p.y, r, l > 1 ? '#ffffff' : PAL.reward, l, wd);
  fxParts('spark', p.x, p.y, PAL.reward, 40, 520, 0.9, 3); fxParts('ember', p.x, p.y, '#ffffff', 18, 300, 1.2, 3);
  G.fx.push({ type: 'pillar', x: p.x, y: p.y, r: 60, color: PAL.reward, life: 1.2, max: 1.2 });
  addLight(p.x, p.y, 700, PAL.reward, 1.2);
  floatText(p.x, p.y - 60, w.def.name.toUpperCase(), PAL.reward, 24, 1.6, true);
  G.flashT = 0.3; cam.shake = 18;
  G.hitStop = 0.14; // (a freeze as the upgrade screen closes)
  sfx('mastery'); buzz('mastery');
}
