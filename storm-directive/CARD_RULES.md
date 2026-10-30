# Card rules: Do and Don't (30 Oct 2026)

The user's design. In the Loadout Planner a card is opened in a side panel and other cards are dragged into its **Do** and **Don't**
boxes. The planner exports a rule list; a generator writes `web/js/cardrules.js`; the game reads it when it deals cards.

## Meaning (the user's decisions)
1. **Don't is symmetric.** If A has B in its Don't box, the pair is incompatible: while the player holds A, B is never dealt, and
   while the player holds B, A is never dealt. Whichever was taken first.
2. **Do is any-one.** A card that sits in the Do box of one or more parents is dealt only while the player holds at least one of them.
   A card in no Do box is unaffected.
3. **Scope** (per rule, set in the panel): `weapon` (default: the parent and the candidate must be on the same weapon slot), `run`
   (the parent counts wherever in the run it is held), or `sample` (like run, but only in runs as one named sample). For a candidate
   that lives on no weapon (a Feat, a sperm passive, a new weapon) a `weapon` rule reads as `run`. A rule on a branch card
   (a weapon branch, a modifier fork) is inherently about its weapon.
4. **Held means taken.** A branch taken, a modifier at any rank (a rule can name one fork or mastery of it), a Feat in a slot, a sperm
   passive at any rank, a weapon in a slot. A rule never removes a card the player already holds; it only stops new deals.
5. Rules default to NONE: the shipped `CARD_RULES` is empty until the user saves some, so behaviour does not change by merging this.

## Card keys (one id space for the planner, the generator and the game)
| Key | Card |
|---|---|
| `w:<weaponId>` | a weapon, e.g. `w:v_phys_proj` |
| `m:<modId>` | a weapon modifier, e.g. `m:charged` (modifiers.js / modmatrix.js ids, including the built-in Delivery ones) |
| `mf:<modId>:<code>` | a modifier fork or mastery: code `A` or `B` (Rank 2 fork, `w.mmB[modId]`), `A1` `A2` `B1` `B2` (mastery, `w.mmX[modId]`) |
| `b:<weaponId>:<A\|B\|C>` | a weapon's Lv 3 branch (`w.up.p`) |
| `wb:<weaponId>:<card name>` | a weapon's Lv 6 card, wild card or Lv 9 mastery by its name (`w.up.l6`, `w.up.l10`) |
| `f:<featId>` | a Feat (feats10.js id, e.g. `f:quick_draw`) |
| `p:<passiveId>` | a sperm passive (mutations.js id, e.g. `p:m_slip`, `p:pass_comeback`) |
| `s:<sampleId>` | a sample (only meaningful as a held parent, or in the `sample` scope) |
| `tag:<kind>:<value>` | a group of cards, target side only: `tag:g:<modifier group>` (delivery, flight, crowd, tempo, chemistry, area, lifesteal), `tag:a:<attack type>` (proj, spread, contact, burst, beam, pool: weapons and Feats), `tag:t:<damage type>` (phys, fire, ice, shock, arcane, soul, flame), `tag:k:<w\|m\|b\|f\|p>` (all weapons, modifiers, branch cards, Feats, passives) |

## The data file `web/js/cardrules.js` (generated; header says so)
```js
const CARD_RULES = [
  { id: 'r1', parent: 'b:v_phys_proj:A', mode: 'dont', target: 'm:charged', scope: 'weapon' },
  { id: 'r2', parent: 'b:v_phys_proj:C', mode: 'do',   target: 'f:acid_bath', scope: 'run' },
  { id: 'r3', parent: 'p:m_slip', mode: 'dont', target: 'tag:g:tempo', scope: 'sample', sample: 'baseline' },
];
```
`parent` is the card whose panel the rule was written in. `mode: 'dont'` is symmetric (see above); `mode: 'do'` is one-way (parent
enables target). Rules whose parent or target key does not resolve in the live game are reported by the generator and left out.

## The game API (`web/js/cardrules.js` data, `web/js/cardrulesengine.js` code)
- `crHeld(key, ctx)`: is the card held. `ctx = { w }` (the weapon the candidate would go on, or null).
- `crAllowed(key, ctx)`: may this card be dealt now (true or false). `crWhy(key, ctx)`: null, or a string naming the blocking rule
  ("blocked by Rambo" / "needs Robocop").
- `crTagsOf(key)`: the tags of a card key (modifier group, attack type, damage type, kind).
- `crKnown(key)`: does the key resolve to a real card in the live game (used by the generator and the tests).
- Dealing: modifier cards go through `modOk`; branch cards through the fork screens (weapons24.js `wupForkCards`, modslice.js
  `forkCards`); Feat and sperm passive acquire cards through their draft `eligible`; a new weapon through the slot draft (`v10Pool`).
  All of them consult `crAllowed` and nothing else changes.
