# claude/sharp-hypatia-icfi8l

## 2026-10-31 Planner: versions dropdown, regular 13px buttons, collapsible left panel
- Systems: tests/tools (planner)
- Files: tests/tools/planner/template.html (on top of the build-tree version from ccr-83ce4661-mwfavv)
- What: a Version dropdown next to the sample ("Live in code" by default; edits to Live become named versions kept per sample in S.vers; rename, add and delete); every button is regular weight at 13px; clicking the strip between the left panel and the canvas hides or shows it; the top title row is removed; the 'own' label sits on the name row; the buttons from Copy build on share one row; build trees take blank blocks (anywhere, with a Type dropdown and the fields each card type holds in the game, typed in the panel); every existing weapon and card shows the same fields filled from the game (planner.js now extracts weapon base stats, feat base values, passive rarity and a sample's Unique Feat) and editing one makes an edited copy (build-tree cards too); the details drawer is a right-hand side panel overlay; a blank Weapon or Feat prefills empty stats with the median of the game's cards of the chosen attack type; the left panel is 220px, a single column of smaller chips with no damage-type name in the card text; Feats tab shortened.
- Save data: none in the game.
- Hooks: none.
- Risk: none.
