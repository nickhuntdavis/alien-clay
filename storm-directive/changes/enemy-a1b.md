# claude/enemy-a1b

## 2026-10-25 Relics ported to v10 (A1b)
- Systems: relics, pdef, spoils, bosses
- Files: relics10.js (new), bosses.js, bosspack.js, rrelics.js, spoils.js, pdef.js, game.js, data.js, index.html, tests/relictest.js (new), tests/run.sh, ARCHITECTURE.md
- What: every boss and rival relic and every SPOILS card now does something under v10. Armour relics grow the player's v10 Shell layers instead (refit with card layers, capped at 6); Acid relics build Corrosion and make Acid Pools instead of Cooties and armour shred; heat relics use the one shared Burn and its bar instead of the v9 melting burn; Cooties zones became Acid (Ulcer) and Mucus (Slime Trail); Gene Swap only offers v10 damage types. Three card promises that were never built now are (See-Through's pass-through, Pickpocket's XP, the Queen's third guard at once). 11 relic texts and Trophy Hide are `TODO_COPY` placeholders.
- Save data: none (no relic id renamed or removed; run-only G.relHide, G.relRx, G.courtN).
- Hooks: pdef.js pdRefit -> relShell; game.js hurtPlayer passes `kind` to relicDamageIn; game.js optMod 'elemental' filters by V10_TYPES; relics10.js registers dmgMul 'relRxMul'.
- Risk: balance. Shell relics are strong early (3 off per layer; Border Wall 3 layers, Calcified 4); See-Through now lets half of all bullets through (as its card always said); Running Hot fills Burn bars on every weapon hit. Shared: the Gene Swap filter also applies to the 'elemental' modifier wherever optMod offers it.

### Relic audit (keep / port / retire)
Totals: 84 relics (45 boss, 39 rival incl. the duplicate id `ectoplasm`), 8 SPOILS plus Gene Swap. Kept 66, ported 18 (+ 3 SPOILS), retired 0 (every boss has exactly three relics, so none could go).

| Relic (id) | Verdict | Old mechanic -> v10 mechanic |
|---|---|---|
| Border Wall (borderwall) | port | +10 armour -> +3 Shell layers (pdef); +40% HP, -10% speed kept |
| Calcified (calcified) | port | +12 armour -> +4 Shell layers; +25% HP, -8% speed kept |
| Ribbed (ribbed) | port | +4 armour -> +1 Shell layer; +2 Headstrong kept |
| Mucus Wall (mucuswall, rival) | port | +6 armour -> +2 Shell layers; -5% speed kept |
| Acid Tongue (corrosive) | port | armour shred + Cooties DoT -> each weapon hit fills the Corrosion bar by 30% of the hit (strips a Shell layer, or Corroded) |
| Bad Blood (acidblood) | port | Cooties (poison) burst -> Acid (fire) Burst, builds Corrosion |
| Ulcer (ulcer) | port | Cooties puddle -> Acid Pool (elem fire): Corrosion and Pool damage |
| Running Hot (runninghot) | port | v9 melting `e.burn` -> 30% of each weapon hit feeds the shared burn (burnAdd) and the Burn bar (Ignition) |
| Fever Dream (feverdream) | port | counts `e.burn` -> counts burning enemies (`cd.burnT`, f_burning) |
| Heatstroke (heatstroke) | port | melting enemies blow up as Acid -> burning enemies blow up as a Fire (flame) Burst |
| Blue to Red (bluetored) | port | 15% v9 melt + 15% chill -> 15% Corrosion fill (a full hit as Acid) + 15% Mucus Snare (fightStatus). Kept Acid/Mucus (the litmus pair) rather than the Burn bar the brief suggested |
| Lithotripsy (lithotripsy) | port | 2 armour shred per hit -> each weapon hit wears the outer Shell layer by 50% of the hit |
| Pissing Razor Blades (razors) | port | Force burst with shred 6 -> Force Burst that also wears each hit enemy's Shell layer by its damage |
| Slime Trail (slimetrail, rival) | port | Cooties trail -> Mucus (ice) trail: Snares, same damage |
| See-Through (seethrough) | port | only +20% dodge was built -> also half of all bullet hits pass straight through (card text unchanged) |
| Pickpocket (pickpocket, rival) | port | only +50% pickup range was built -> also +15% XP |
| The Queen's Court (court) | port | only two guards for the first 15 s -> three at once, a fallen one back in 15 s |
| Universal Indicator (indicator) | keep | counts v10 types already (weaponSrc) |
| Test Strip (teststrip) | keep | Litmus Strip only |
| Rubber Johnny (rubber) | keep | already v10 (pdef shield) |
| Second Stomach, Swallow Whole, Bouncer, Diplomatic Immunity, Third Eye, Death Stare, Mother's Intuition, Bedside Manner, Triage, Transfusion, Pre-Workout, Tail Whip, Flying Start, Mirror Twin, Double Trouble, Seconds, Poltergeist, Reservoir Tip, Plugged, Snot Rocket, Mucous Membrane, Stitch, Charley Horse, Clench, Bless You, Atishoo, Catch It Bin It Kill It | keep | work as written (stats, ticks, heals, Force/Blood hits, `e.mark`, stasis) |
| Rival: Personal Best, Marathon, Gains, Head Coach, Honorary Degree, Thesis Defence, Small Mercies, Throwing a Wobbly, Just Kevin, Kevin's Mum, Head Start, Early Bird, Five-Finger Discount, Load-Bearing, Eagle Eye, Steady Hand, Buckshot, Trigger Happy, Ectoplasm, Now You See Me, Her Boys, Packed Lunch, Blood Bank, Undead Membership, Sticky Situation, Pep Talk, The Whistle, Encore, Exit Stage Left, Knitted Cardigan, Not Today Dear, Nine Espressos, Full Meltdown, Calculated Odds, Probability Cloud, Powerhouse of the Cell, Mourning Wear | keep | work as written |
| SPOILS Trophy Hide (hide) | port | +4 armour -> +1 Shell layer per pick; +6% dodge kept |
| SPOILS Lab Notes (notes) | port | `P.react` is v9 only -> reaction damage x1.4 per pick (relRxMul); +10% damage types kept |
| SPOILS Gene Swap | port | any `ELEMENTS` key (Cooties, Oil, Water...) -> `V10_TYPES` only |
| SPOILS Trophy Polish, Boss Blood, Adrenal Gland, Victory Lap, Finder's Fee, Killer Instinct | keep | work as written |
