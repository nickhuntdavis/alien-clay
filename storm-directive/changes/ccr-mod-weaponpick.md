## 2026-10-25 One modifier card, choose the weapon (v10.135)
- Systems: modifier cards, draft, loot filters
- Files: modpick.js (new), lootfilter.js, rewardui.js, index.html, tests/modpicktest.js (new)
- What: a modifier that fits more than one weapon is dealt as one level-up card with the v9 weapon chips; tap a chip to pick the weapon, a plain tap or the bot picks the highest-level weapon. Draft keeps its card count. DNA strand boxes are unchanged (already one card per modifier).
- Save data: none
- Hooks: lootfilter.js lfInfo reads o.modTab; rewardui.js fit line reads o.pickW
- Risk: modifier frequency in level-ups follows the best of the group's weight instead of each weapon's; TODO_COPY:modpick_fit is open.
