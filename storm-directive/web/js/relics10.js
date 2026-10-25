'use strict';
// Spawn Prawn - boss and rival relics on the v10 rules (ENEMY_HANDOFF.md A1b; COMBAT_MATRIX.md 3, 4, 11).
// Owns the helpers the ported relics share, so the relic files (bosses.js, bosspack.js, rrelics.js, spoils.js) only
// call one function each:
//  - relShell / relShellAdd: Shell layers from relics (Border Wall, Calcified, Ribbed, Mucus Wall, Trophy Hide replace
//    their old armour with the player's v10 Shell, pdef.js). They refit with the card layers (each wave, or every 60 s
//    in the race); card and relic layers together stop at RELIC10.shellCap.
//  - relBar: fills one of an enemy's build-up bars (combat.js 11.2) as if that much damage of the type had landed, and
//    pays it off the same way (Corrosion strips a Shell layer or Corrodes, Burn ignites). Acid Tongue, Blue to Red, Running Hot.
//  - relBurn: adds to the enemy's one shared burn (decision 36) and its Burn bar. Running Hot.
//  - relWear: wears the outer Shell layer by an amount (Lithotripsy, Pissing Razor Blades: the old armour shred).
//  - relRxMul: Lab Notes' +40% on unstable reaction damage (the old G.P.react is v9 only).
// Hooks: pdef.js pdRefit -> relShell; bosses.js applyRelic, bosspack.js bpRelicApply, rrelics.js rrelicApply,
// spoils.js hide -> relShellAdd; bosses.js relicHit/relicTick, bosspack.js bpRelicHit/bpRelicHurt -> relBar, relBurn, relWear;
// registers dmgMul 'relRxMul' itself. Test: tests/relictest.js.

const RELIC10 = {
  shell: { borderwall: 3, calcified: 4, ribbed: 1, mucuswall: 2 }, // relic -> Shell layers (old armour / 3, Shell's 3 off per layer)
  hideShell: 1,          // Trophy Hide (SPOILS): layers per pick
  shellCap: 6,           // card + relic layers at most (bosses top out at 6, matrix 11.4)
  rxK: 0.4,              // Lab Notes: + this much reaction damage per pick
};

const relShell = () => {
  if (!G || !G.relics) return 0;
  let n = (G.relHide || 0) * RELIC10.hideShell;
  for (const id in RELIC10.shell) if (G.relics[id]) n += RELIC10.shell[id];
  return n;
};
// A relic (or Trophy Hide) just added n layers: grow them now, at full health, rather than at the next refit.
function relShellAdd(n) {
  if (!G || typeof pdef !== 'function') return;
  const D = pdef(), cap = Math.min(RELIC10.shellCap, D.n.shell + relShell());
  const was = D.layers;
  D.layers = Math.min(cap, D.layers + n);
  if (D.layers > was && (was === 0 || !(D.layerHp > 0))) D.layerHp = pdLayerHp();
}
// Fill an enemy's bar k ('acid', 'fire', 'force', 'soul') as amt damage of that type would (combat.js resolveHit 7).
function relBar(e, k, amt) {
  if (!e || e.dead || !(amt > 0)) return;
  const t = fightCd(e);
  let size = COMBAT.barSize[k];
  if (k === 'acid' && t.def === 'shell' && t.layers > 0) size *= t.layers;
  t.barQuietT[k] = 0;
  t.bars[k] += amt / (size * COMBAT.rankBarK[t.rank] * t.maxHp);
  if (t.bars[k] < 1) return;
  t.bars[k] = 0;
  const res = { layersLost: 0, raw: amt };
  if (k === 'acid' && t.def === 'shell' && t.layers > 0) { dropLayer(t, res); relLayerFx(e, res.layersLost); }
  else fightPayoff(e, k === 'acid' ? 'corrode' : BAR_PAYOFF[k], res, {});
}
// Fire on top of a hit: the shared burn takes 20% of amt (combat.js burnAdd), and the Burn bar fills by amt.
function relBurn(e, amt, name) {
  if (!e || e.dead || !(amt > 0) || snared(e)) return; // (Snared puts Burning out, decision 25)
  burnAdd(fightCd(e), amt); e.burnBy = name;
  relBar(e, 'fire', amt);
}
// Wear the outer Shell layer by amt; a worn-through layer is gone for the encounter.
function relWear(e, amt) {
  if (!e || e.dead || !(amt > 0)) return;
  const t = fightCd(e);
  if (!(t.layers > 0)) return;
  t.layerHp -= amt;
  if (t.layerHp > 0) return;
  const res = { layersLost: 0 };
  dropLayer(t, res); relLayerFx(e, res.layersLost);
}
function relLayerFx(e, n) {
  if (!n) return;
  fst().layers += n;
  ring(e.x, e.y, e.r + 6, FIGHT_COL.shell, 0.35, 5); fxParts('spark', e.x, e.y, FIGHT_COL.shell, 8, 140, 0.4, 3);
}
// Lab Notes (SPOILS): reaction damage (fight.js rxSrc marks it src.rx).
const relRxMul = (e, src) => src.rx && G.relRx ? 1 + RELIC10.rxK * G.relRx : 1;
hookOn('dmgMul', 'relRxMul', (e, src) => relRxMul(e, src));
