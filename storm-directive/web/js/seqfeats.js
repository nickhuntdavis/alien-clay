'use strict';
// Spawn Prawn - sequence Feats. Four Feats that only turn up in drafts while their sequence is in your genome
// (SPELLS seqOnly, as Prawn Again's Out of Body): Elbows Out (the Firstborn), Belly Flop (the Chonker),
// Lightbulb Moment (the Bright Spark) and Come Play With Us (the Twins). Each has two forks at Feat level 4. All four
// attack, so they are paid for in stamina (STAM_FEATS).
// Hooks: game.js castSpell (case 'seqfeat': seqFeatFire).

const SEQ_FEAT_COL = id => (typeof SEQ_LOOK !== 'undefined' && SEQ_LOOK[id] ? SEQ_LOOK[id].color : '#ffffff');
Object.assign(SPELLS, {
  elbows: { name: 'Elbows Out', icon: 'EO', elem: 'phys', kind: 'seqfeat', color: SEQ_FEAT_COL('vanguard'), dir: 'nearest', seqOnly: 'vanguard',
    desc: 'You throw your elbows about. Everything close to you is hit and shoved well back. Firstborn only.',
    base: { dmg: 30, cd: 8, area: 140, range: 140 },
    lv: { 3: { area: 0.2 }, 5: { dmg: 0.5 }, 7: { cd: -0.2 } } },
  bellyflop: { name: 'Belly Flop', icon: 'BF', elem: 'phys', kind: 'seqfeat', color: SEQ_FEAT_COL('bruiser'), dir: 'cluster', seqOnly: 'bruiser',
    desc: 'You launch yourself at the thickest crowd nearby and land on it, hard. Chonker only.',
    base: { dmg: 55, cd: 10, area: 130, range: 260 },
    lv: { 3: { area: 0.2 }, 5: { dmg: 0.5 }, 7: { cd: -0.2 } } },
  lightbulb: { name: 'Lightbulb Moment', icon: 'LM', elem: 'shock', kind: 'seqfeat', color: SEQ_FEAT_COL('nerd'), dir: 'nearest', seqOnly: 'nerd',
    desc: 'A bolt of inspiration jumps from enemy to enemy, up to six of them. Bright Spark only.',
    base: { dmg: 34, cd: 7, count: 6, range: 420 },
    lv: { 3: { count: 2 }, 5: { dmg: 0.5 }, 7: { cd: -0.2 } } },
  doubleact: { name: 'Come Play With Us', icon: 'DA', elem: 'phys', kind: 'seqfeat', color: SEQ_FEAT_COL('twins'), dir: 'nearest', seqOnly: 'twins',
    desc: 'You and your twin both reach out at the same moment. Everything near either of you is pulled in close and hurt. Twins only.',
    base: { dmg: 40, cd: 9, area: 150, range: 150 },
    lv: { 3: { area: 0.2 }, 5: { dmg: 0.5 }, 7: { cd: -0.2 } } },
});
Object.assign(SPELL_FORKS, {
  elbows: [{ name: 'Sharp Elbows', desc: 'Everything you shove is stunned for a second.' },
    { name: 'Personal Space', desc: 'For 3s after, you take 30% less damage.' }],
  bellyflop: [{ name: 'Aftershock', desc: 'A second slam lands 0.6s later, for 60% of the first.' },
    { name: 'Soft Landing', desc: 'Nothing can hurt you for a second after you land.' }],
  lightbulb: [{ name: 'Bright Idea', desc: 'The bolt jumps to four more enemies.' },
    { name: 'Brainwave', desc: 'Every enemy the bolt jumps through is stunned for half a second.' }],
  doubleact: [{ name: 'Again, Again', desc: 'You both reach out again 0.8s later.' },
    { name: 'Feed on Fear', desc: 'You heal 2% of your max health for every enemy caught (up to 10%).' }],
});
if (typeof STAM_FEATS !== 'undefined') for (const id of ['elbows', 'bellyflop', 'lightbulb', 'doubleact']) STAM_FEATS.add(id);
if (typeof ICON_OF !== 'undefined') Object.assign(ICON_OF, { elbows: 'hammer', bellyflop: 'comet', lightbulb: 'bolt', doubleact: 'pair' });

function seqFeatFire(w, target, src) {
  const p = G.player, s = w.s, c = w.def.color;
  switch (w.id) {
    case 'elbows': {
      const stun = spellFork(w, 'a');
      forNear(p.x, p.y, s.area, e => { if (e.charmed || e.egg || e.dead) return false; damageEnemy(e, s.dmg, Object.assign({}, src, { knock: 420, kx: e.x - p.x, ky: e.y - p.y })); if (stun && !e.boss && !e.rival) e.frozen = Math.max(e.frozen, 1); return false; });
      if (spellFork(w, 'b')) G.elbowT = G.t + 3;
      ring(p.x, p.y, s.area, c, 0.35, 6); cam.shake = Math.min(8, cam.shake + 3);
      floatText(p.x, p.y - 36, 'ELBOWS OUT', c, 14, 0.8);
      break;
    }
    case 'bellyflop': {
      const t = target && !target.dead ? target : acquire('cluster', s.range, p.x, p.y);
      let x = p.x, y = p.y;
      if (t) { const a = Math.atan2(t.y - p.y, t.x - p.x), d = Math.min(220, Math.hypot(t.x - p.x, t.y - p.y)); x = p.x + Math.cos(a) * d; y = p.y + Math.sin(a) * d; }
      const cR = Math.hypot(x - G.core.x, y - G.core.y), lim = CORE.arena - 40; if (cR > lim) { x = G.core.x + (x - G.core.x) / cR * lim; y = G.core.y + (y - G.core.y) / cR * lim; }
      p.x = x; p.y = y; p.iframes = Math.max(p.iframes, spellFork(w, 'b') ? 1.2 : 0.3); unstick(p, p.r + 4);
      const slam = k => { aoe(p.x, p.y, s.area, s.dmg * k, Object.assign({}, src, { knock: 300 }), c); ring(p.x, p.y, s.area, c, 0.4, 7); cam.shake = Math.min(12, cam.shake + 6); };
      slam(1);
      if (spellFork(w, 'a')) after(0.6, () => { if (G && G.state === 'play') slam(0.6); });
      floatText(p.x, p.y - 40, 'BELLY FLOP', c, 15, 0.9);
      break;
    }
    case 'lightbulb': {
      const n = s.count + (spellFork(w, 'a') ? 4 : 0), hit = new Set();
      let from = p, cur = target && !target.dead ? target : acquire('nearest', s.range, p.x, p.y);
      for (let i = 0; i < n && cur; i++) {
        hit.add(cur);
        bolt(from.x, from.y, cur.x, cur.y, c, 0.18);
        damageEnemy(cur, s.dmg, src);
        if (spellFork(w, 'b') && !cur.boss && !cur.rival) cur.frozen = Math.max(cur.frozen, 0.5);
        from = cur;
        cur = acquireMany('nearest', 260, from.x, from.y, 6).find(e => !hit.has(e) && !e.dead) || null;
      }
      break;
    }
    case 'doubleact': {
      const burst = () => {
        let hits = 0;
        for (const o of [p, G.twin].filter(Boolean)) { forNear(o.x, o.y, s.area, e => { if (!e.charmed && !e.egg && !e.dead) { damageEnemy(e, s.dmg, Object.assign({}, src, { knock: -160, kx: e.x - o.x, ky: e.y - o.y })); hits++; } return false; }); ring(o.x, o.y, s.area, c, 0.35, 5); }
        if (spellFork(w, 'b') && hits) healPlayer(G.P.maxHp * Math.min(0.1, 0.02 * hits));
      };
      burst();
      if (spellFork(w, 'a')) after(0.8, () => { if (G && G.state === 'play') burst(); });
      floatText(p.x, p.y - 36, G.twin ? 'COME PLAY WITH US' : 'COME PLAY WITH ME', c, 14, 0.8);
      break;
    }
  }
}
// Personal Space (Elbows Out): less damage taken for a moment (from hurtPlayer).
const seqFeatHurt = () => (G && G.elbowT > G.t ? 0.7 : 1);
