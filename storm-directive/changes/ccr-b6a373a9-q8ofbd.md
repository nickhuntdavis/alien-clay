## 2026-10-26 Health card trims from the forced-card sim (v10.151)
- Systems: draft cards, healing
- Files: vitals.js, perks.js
- What: Rally wins back 10% of the hit a rank (was 15%) and at most half the hit (was all of it); steady regen 0.2% of max HP a second a rank (was 0.3%); Hex adds 10% damage taken (was 15%). Forced-card sim, 12 runs each against a 3 of 12 baseline: Rally 8 of 12 after the first trim, 5 of 12 with the half-hit cap; regen 4 of 12; Hex 1 of 12 (was 0 of 18).
- Save data: none
- Hooks: none
- Risk: Hex is still a net loss for the bot (it does not value the extra card); a human may rate it differently. Copy briefs for vt_drip, vt_rally and pk_hex must use the new numbers.

## 2026-10-26 Macrophage Queen heals less each cycle; forced-card balance sim (v10.150)
- Systems: bosses (tier 2 signatures), tests
- Files: bosssig10_t2.js, tests/queennomstest.js (new), tests/sim/wave20.js, tests/sim/race.js; merge of main v10.149
- What: the Queen's snack budget shrinks each pattern cycle (SG2.nomsFall 0.6: 6, 4, 2, 1, 1, then none), so she heals at most 42% of her health in a fight; before, 18% every 22 s cycle outhealed any build under about 140 damage a second (two bot fights ran 1000+ s). bossprobe: strong builds unchanged (36 to 72 s); a forced weak build went from a full-health stall to a kill in 245 s.
- Save data: none
- Hooks: none
- Risk: the Queen is easier for weak builds after about 90 s of fighting; fast fights are unchanged.

## 2026-10-26 Fourteen more draft cards: trade-offs, streaks, sprint, decoy, bosses, curse, race (v10.147 on this branch; main later used v10.147 too)
- Systems: draft cards, defences (pdef), healing, stamina (sprint), weapons (fire rate), enemy targeting (decoy)
- Files: perks.js (new), index.html, ARCHITECTURE.md, tests/perkstest.js (new); merge of main v10.146
- What: Big Heart (+40% max HP, 10% slower), Bubble Wrap (Membrane x2, mends half as fast), damage up as health drops, your statuses 25% shorter a rank, a Membrane that cuts the damage type that has hurt you most, kill streaks give +40% fire rate for 4 s, sprinting leaves a slippery trail, starting a sprint shoves and damages, a dud-sperm decoy every 30/24/18 s, +12% damage to bosses, boss hits 10% weaker, Hex (take 15% more, one more draft card), and two race-only cards near the egg (faster, tougher).
- Save data: none
- Hooks: none in shared files. hookOn tick, kill, dmgMul, hurtMul; wraps mutSpeed (mutations.js), rateBonus (arsenal.js), pdefHurt / pdefStatus / pdefTick (pdef.js), draftCards (draft.js), sillyTick / sillyDraw (silly.js), v10Draw (v10.js).
- Risk: Bubble Wrap works by lending Thicker/Faster ranks inside pdefTick (restored after the call), so anything reading G.pd.n during that tick sees the lent ranks. Hex can make 4-card drafts on take-one screens. Draft group 'up' now holds 29 health/perk cards beside the v9 upgrades. Unsimmed for balance (bot 0/3 waves, 1/1 Level 1, no errors). Copy: TODO_COPY:pk_*_title / _desc (28).

## 2026-10-26 Nine more health, Shell and Membrane cards (v10.145 on this branch; main later used v10.145 for its own build)
- Systems: draft cards, defences (pdef), healing
- Files: vitals.js (new), index.html, ARCHITECTURE.md, tests/vitalstest.js (new)
- What: nine slotless 'up:' cards beside membrane.js's six: always-on regen, on-hit lifesteal (inside the lifesteal pool), +20% healing, rally (kills within 3 s of a hit win part of it back), Shell layers regrow mid-wave, Shell layers burst into shrapnel when they break, Membrane pops (damage and shove) when knocked to zero, regen while the Membrane is full, kills refill the Membrane. Shell and Membrane cards only appear when you have one.
- Save data: none
- Hooks: none in shared files (hookOn tick, kill, proc, hurt).
- Risk: more healing in the 'up' draft group (now 15 health cards in it, which dilutes the v9 upgrades); balance unsimmed beyond 2 bot runs (no errors). Copy is TODO_COPY:vt_*_title / _desc (18).
