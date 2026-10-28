## 28 Oct 2026 Prawn Again's stance, 30 s clock (v10.197)
- Systems: samples, chemistry (damage types), look, voice
- Files: holy.js, tests/holytest.js, redesign docs (DAMAGE_TYPES.md, COMBAT_MATRIX.md 69)
- What: the shared Holy/Damned clock is 30 s (15 s a side at a 0.5 chance, was 6 s) and the halo or horns flicker in the last 2.5 s. Prawn Again makes every soul source it holds a coin, whatever its leaning, and the clock is its stance: Holy half glows white and gold and each Possession it causes heals 2% of max health; Damned half wears a dark shroud with red veins, deals and takes 10% more, and Damned deaths refund 6 stamina. Each flip rings and names the half; the first flip each way in a run gets a Scientist line (2 new TODO_COPY: prawn_flip_holy, prawn_flip_damned).
- Save data: none (G.holySt is run state).
- Hooks: tick (holy:flip) and hurtMul (holy:stance) registered from holy.js; voice10.js vxSay called with a forced line. No new lines in shared files.
- Risk: Prawn Again's power swings with the clock (unsimmed); the 10% taken in the Damned half can tip a close fight.

## 28 Oct 2026 Holy/Damned replaces Parasite (v10.196)
- Systems: chemistry (damage types), combat, mutations, samples, look
- Files: holy.js (new), tests/holytest.js (new), combat.js, fight.js, render.js, typefx.js, typelook.js, chargefx.js, look10.js, style.css, data.js, codex10.js, inspect.js, rewardui.js, mutations.js, samples10.js, boss10.js, cellcopy.js, feats10.js, gifts10.js, glossary.js, tutorial.js, voice.js, wup3.js, wup6.js, index.html, ARCHITECTURE.md, redesign docs (DAMAGE_TYPES.md, COMBAT_MATRIX.md decision 69)
- What: the Parasite damage type is now Holy/Damned (internal id still `soul`). Every soul hit is Holy or Damned by its source (HOLY_P; Prawn Again's kit flips on a shared 6 s clock, the player wears a halo or horns); the soul bar keeps a signed total and pays out Possessed (Holy, as before) or Damned (+30% damage taken 4 s, bosses +15% 1.5 s, spreads 0.35 of Damned bar to mates within 90 units on death). The six soul reactions fire on either verdict. Two bias cards (h_devout, h_heretic) move the chance 0.25 a rank. Type colour gold (#ffcf5a); Damned draws black with a red-purple glow. 13 TODO_COPY placeholders; "Parasite" swapped for "Holy/Damned" in 20 existing lines (user to read through).
- Save data: none (META.offered keys unchanged; `G.muts.h_devout` / `h_heretic` are run state).
- Hooks: combat.js resolveHit -> holyBar; fight.js fightHit -> holyPol, fightPayoff 'possess' -> holyPayoff, f_possessed -> holyDamned, bar colour -> holyBarCol; render.js after drawShip -> holyDrawYou; hooks fire:after, dmgMul, kill registered from holy.js.
- Risk: Damned's +30% and the death spread are unsimmed (Prawn Again and Rent Free builds get stronger); reactions on Damned enemies (Erosion bursts when Damned ends, Interference extends Damned) are new interactions; any code reading ELEMENTS.soul.color now gets gold.
