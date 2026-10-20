# ccr-cbcb5f5b-nfwar6

## 2026-10-20 v9 Feats, upgrades and mutations back in v10 (v10.42)
- Systems: feats9 (new), v9back (new), feats10, draft, mutation drops
- Files: feats9.js (new), v9back.js (new), feats10.js, draft.js, mutdrop.js, v10.js, index.html, tests/featstest.js, tests/v9backtest.js (new), tests/run.sh
- What: the six v9 Feats FEATS.md picked but never built (Capacitation, Bombardier Beetle, Van de Graaff, Spinnbarkeit, Wandering Womb, Ear Candling) are in, with level 3 and 5 forks, and Hagfish and Running With Scissors join the starting pool (it was waiting on an unlock system that doesn't exist). 15 v9 upgrades that change how you play (Last Word, Tunnel Vision, Overachiever, Pincer Movement, Hurry Up, Stubborn Streak, Big Boned, Muscle Memory, Big Lungs, Cardio, Tactical Nap, Spoilers, Separation Anxiety, Headstrong, Snooze Button) are draft cards again, and 29 v9 mutations are back in the elite mutation drops.
- Save data: none (G.passives, G.mut and META.muts as in v9).
- Hooks: v10.js v10Tick -> f9Tick, v10Draw -> f9Draw; draft.js grp 'up' (DRAFT.groupW.up 0.6); mutdrop.js mdIsMut also takes 'g_' ids.
- Risk: more power in a run (bot sim: death wave 9.7 -> 11.8, 0 wins both); fewer v10 mutations per elite drop (29 more in the pool); the Feat starting pool is 23, so each Feat turns up less often.
