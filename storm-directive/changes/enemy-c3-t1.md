## 2026-10-25 Tier 1 boss signature beats (C3)
- Systems: bosses, boss telegraphs, hazards
- Files: bosssig10_t1.js (new), index.html, ARCHITECTURE.md, tests/bosstest.js
- What: each tier 1 boss swaps one generic spray for a signature beat with a tell: Litmus Strip Titration (a line of marked drips sweeps over 3 s in its colour), Johnny Unroll (a latex band blocks movement for 2 s, its back open), Mucus Plug Drip (3 or 4 marked drops, each a Mucus patch), Cramp Contraction (a ring closes over 2 s, pulls you in, hurts once), Sneeze Sniffle (a slow droplet cloud that lands as small Mucus patches). Patterns now: litmus [litmusdrip, titration, aimedFan, litmusdrip], johnny [johnnyroll, aimedFan, johnnyroll, unroll], mucus [mucusspit, drip, aimedFan, mucusspit], cramp [crampgrip, aimedFan, crampgrip, contract], sneeze [sneezecone, aimedFan, sneezecone, sniffle]. Johnny, Cramp and Sneeze end their pattern early when the beat is done. One intro line per boss is a TODO_COPY placeholder.
- Save data: none.
- Hooks: none (wraps bossAI and nf10Draw from its own file).
- Risk: boss cycles are shorter where a beat ends early; the Plug's drop and the Cramp's contraction add one hit each (bd x 0.7, the glob's number). No HP, damage or rate number changed.
