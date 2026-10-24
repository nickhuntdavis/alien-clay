## 2026-10-24 Weapon cells for the eleven Projectile weapons (v10.120)
- Systems: weapon cells, modifiers
- Files: cellmods3.js to cellmods8.js (new), cellcopy3.js to cellcopy8.js (new), index.html, MODIFIER_MATRIX.md 5.9, tests/celltest3.js to celltest8.js (new), modcardtest.js, modstest.js
- What: Standard Issue, Little Prick, Acid Spit, Ewww Gross, One of These Days, Sister Cousin, Rent Free, Chest Burster, There Is No Spoon, Family Ties and Unwanted Contact each have their own effect for every modifier they are dealt (rank 1 to 3 and a mastery), plus an Area cell. Card lines are plain copy in the cellcopy files.
- Save data: none.
- Hooks: none in shared files (wraps from the new files, as cellmods2.js does).
- Risk: balance unsimmed (One of These Days + Melee hit about 3x base damage in a crowd test); modcardtest and modstest now clear XC_W so they keep testing the shared forms; celltest3 failed 2 runs in about 12 under load (timing). Card copy was written by Claude at the user's earlier request for plain cell copy.
