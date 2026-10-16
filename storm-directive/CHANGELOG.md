# CHANGELOG.md: Spawn Prawn

Newest first. One entry per shipped version (or per merge into `main`). Format and rules: `CLAUDE.md` > Change log. System names come from `ARCHITECTURE.md`. Older history (before v9.23) lives in `NOTES.md` > Recent changes and `git log`.

## v9.23 (versionCode 273)
- **Systems**: weapons, combos, chemistry, loot
- **Files**: `playpen.js` (new), `index.html`, `chem.js`, `data.js`, `WEAPON_IDEAS.md`, tests (`armtest`)
- **What**: the Playpen, 20 more weapons from `WEAPON_IDEAS.md` (78 in all), flagged `armoury: 1, pen: 1`. Merged `ccr-618305e3` (the Armoury) and `ccr-d9934b1d` (four weapons retyped for an even damage type spread).
- **Risk / watch**: new weapons in the general pool shift loot odds; armtest guards the play-style and damage type spread.

## Unreleased
- **Systems**: docs
- **Files**: `CLAUDE.md`, `ARCHITECTURE.md` (new), `CHANGELOG.md` (new)
- **What**: change-logging rules and the system architecture map.
