## 2026-10-20 Pick feedback on take-more-than-one card screens
- Systems: ui (card screens), rewards
- Files: pickfeel.js (new), ui.js, index.html, style.css
- What: Screens where you take two cards show an "n/2" chip. The card you took stays visible with a tick and a held glow; the remaining cards pulse an outline. Cards also squash on press.
- Save data: none
- Hooks: ui.js openLoot -> pfInit; ui.js pickLoot -> pfTaken
- Risk: the old 30% dim on the taken card is gone. Two TODO_COPY placeholders (pick_first, pick_more) until copy arrives.
