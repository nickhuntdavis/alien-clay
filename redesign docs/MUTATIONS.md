# Mutations

Working proposal, 17 Oct 2026. **Mutations** are the adaptations, changes and questionable improvements the sample picks up through card choices during a run. Feats are gifts from the consciousness (`FEATS.md`); mutations are the sample's own biology changing in response to its circumstances, sometimes usefully, sometimes in ways that raise questions. The consciousness can still react when one arrives ("Ooh. You're different now." or "That wasn't there before.").

Naming: player-facing these are **Mutations**. The internal list of attack behaviours (homing, orbiting, gravity well and the rest) stays **modifiers** in `MODIFIERS.md`; a weapon mutation may add one of those modifiers to a weapon.

The rule for every card: it changes a decision, makes a visible event, or enables a synergy. A bare "+8% damage" is a secondary stat on a more interesting card, never a card of its own.

## 1. How mutations work

- **Where they go** (`UPGRADES.md` 4):
  - **Body, damage-type, trade-off and rare mutations** use the **Genome** slots (4, shared with defences). Picking one you already have ranks it up instead of using a slot. A Genome mutation is offered only while you have a free slot or already own it.
  - **Weapon mutations** attach to one weapon and use no Genome slot. At most 3 per weapon, so each weapon stays readable on screen.
- **Card behaviours** (separate from rarity: a rare card is more specialised or surprising, not just bigger):

| Behaviour | Meaning | Example |
| --- | --- | --- |
| Stackable | Ranks up when picked again | Slipstream |
| Transformative | Changes how a weapon behaves | Not Finished Yet |
| Conditional | Pays off when you combine things | Conductive Mess |
| Trade-off | A real benefit and a real cost; the cost creates a decision | Big Brain |
| Rare synergy | Uncommon; makes a finished build feel special | Group Project |

- **Combat rules:** every effect follows `COMBAT_MATRIX.md`. Anything a mutation makes that attacks (Heartbeat, A Bit Extra) has the damage type stated and is a normal hit; nothing a mutation makes can set off more of itself (bounded chains, 12.5). No mutation adds a new ground object (decision 27) or a new status.
- **Card text:** name, the consciousness's line, then one plain sentence of what it does. Numbers go in the Field Guide.
- **Starting values** are first guesses for sims.

## 2. Body mutations (any sample)

| # | Mutation | Behaviour | Does | Line |
| --- | --- | --- | --- | --- |
| M1 | Slipstream | Stackable | Swim speed builds while you keep moving, up to +20% after 3 s; taking damage resets it | "Keep going! You're getting good at going!" |
| M2 | Extra Padding | Stackable | +10% max health. While at full health, half the bonus becomes a temporary Membrane (Membrane rules) | "I put something soft around your something soft." |
| M3 | Sticky Fingers | Stackable | +30% XP pickup radius; every level-up pulls all XP within 250 to you | "You found it. It's yours. All of it." |
| M4 | Heartbeat | Stackable | Every 3 s, a Force Burst around you (light damage, knockback); its radius grows with your current health (60 at empty to 120 at full) | "Thump thump. Still there. Good." |
| M5 | Hard to Hold | Stackable | After you take a hit: +25% swim speed and half damage from enemy Contact hits for 1.5 s | "You slipped! Do it again but without the ouch." |
| M6 | Spare Parts | Stackable | Kills sometimes (10%) drop a fragment; every 5 collected heals 4% | "I saved the bits. You might need the bits." |
| M7 | Overexcited | Stackable | 5 kills within 2 s each gives +30% attack speed for 3 s; the chain drops if you stop killing | "Again! Again! AGAIN!" |
| M8 | Personal Space | Stackable | An enemy that stays within 90 of you for 1 s is Snared (a Mucus effect with no damage). Surrounded, more of them are slowed at once | "Please don't touch. Actually, I will handle that." |

Notes: Heartbeat sits between Thorny Onesie (scales with max health) and Hot and Bothered (scales with missing health). Spare Parts overlaps the COME BACK HERE gift; offer only one per run. Personal Space is Mucus-typed rather than a new untyped slow, so it uses Snared instead of adding a status.

## 3. Weapon mutations (attach to one weapon)

| # | Mutation | Behaviour | Fits | Does | Line |
| --- | --- | --- | --- | --- | --- |
| M9 | Can't Pick One | Transformative | Projectile | A hit has a 20% chance to split into two half-damage shots that home on nearby enemies (multiplying and homing modifiers; split shots never split again; max 12 in flight) | "One for you. One for you. One for... oh, there's loads." |
| M10 | Not Finished Yet | Transformative | Projectile, Spread | A shot that kills flies on to another enemy within 110, at 70% damage (chaining modifier, on kill, up to 3 jumps) | "That one was rude too. Get them." |
| M11 | Keep Spinning | Stackable | Orbiting, sweep, Beam | +30% duration; +5% damage for each enemy hit in a row (growing, capped at +50%) | "Round and round. They're not learning." |
| M12 | Reachy | Stackable | Contact, short Beam | +25% reach; the outer quarter hits for +40% (as Flagellum Flail's tip) | "Stretch! You can almost touch that one!" |
| M13 | A Bit Extra | Stackable | Any | A kill has a 25% chance to pop a small Burst (radius 50, 40% of the hit) of the weapon's damage type where it died. Its kills never pop another | "It needed a little more." |
| M14 | Through and Through | Stackable | Projectile, Spread | +2 pierce (piercing modifier: each enemy passed costs 15%) | "You can get more than one. I checked." |
| M15 | Leave a Little Something | Stackable | Pool | Pools last 50% longer and give one last tick at double damage as they end. (No residue: no new ground objects, decision 27) | "For later. You might want it for later." |
| M16 | Everywhere! | Stackable | Projectile, Spread, Beam | Every 3rd attack also fires one extra shot at the next-best target autoaim would pick | "I got all the angles. There are so many angles." |

## 4. Damage-type mutations

| # | Mutation | Type | Behaviour | Does | Line |
| --- | --- | --- | --- | --- | --- |
| M17 | Hit Them Harder | Force | Stackable | +50% knockback on enemies already knocked back in the last 1 s | "Again! They're nearly over there!" |
| M18 | Stickier | Mucus | Stackable | Snared lasts 50% longer, and Poise bars fill 25% faster on Snared enemies | "If it's sticky, it stays. That's science." |
| M19 | Pass It On | Static | Stackable | When Charged runs out on an enemy, 30% chance it passes to the nearest enemy within 110 (once per Charge) | "Everybody gets a turn!" |
| M20 | Bad Blood | Blood | Stackable | Blood pools from bleeding deaths are 50% bigger and make enemies standing in them Bleed. (No trail: no new ground objects) | "Oh. That's going everywhere." |
| M21 | Come Out of There | Soul | Stackable | An enemy killed while it has Soul build-up or is Possessed has a 25% chance to leave a wisp: collect it to heal 3% or gain +20% attack speed for 3 s | "There's something inside! I want it." |
| M22 | Crossed Wires | Any | Conditional | Every reaction you have discovered deals 25% more and its lockout drops from 1.5 s to 1 s. (The specific combinations already exist: they are the 21 reactions, `COMBAT_MATRIX.md` section 1. This is the general Catalyst, `UPGRADES.md` 3.) | "Oh! They did a thing together!" |

## 5. Trade-off mutations

| # | Mutation | Does | Cost | Line |
| --- | --- | --- | --- | --- |
| M23 | Big Brain | +25% damage | −20% max health | "You're getting clever. You look a bit breakable, though." |
| M24 | Quantity Over Quality | +30% attack rate and +1 shot per attack | −30% damage per hit (Shell takes its fixed cut from every small hit: a real decision against Shell enemies) | "One hundred little hits! That's basically one big hit. Right?" |
| M25 | Can't Sit Still | +20% attack speed while swimming | −20% while still or very slow. Never offered to the Overachiever (its passive already does the good half) | "Go go go! Wait. Why did you stop?" |
| M26 | All at Once | First hit on an enemy you haven't hit for 3 s deals +60% | Your other hits on it deal −20% for 3 s | "SURPRISE! Oh. You're still there." |
| M27 | Hungry Hungry | +30% XP | Enemies spawn 20% faster | "More food! More friends! Wait, those aren't friends." |
| M28 | No Time for Being Careful | +20% damage while above 70% health | You take +20% damage | "You look amazing! Please don't get hit." |

## 6. Rare synergy mutations

| # | Mutation | Condition | Does | Line |
| --- | --- | --- | --- | --- |
| M29 | Conductive Mess | Static and blood pools | A Charged enemy standing in a blood pool Charges every other enemy in the same pool | "It's all connected! That's probably fine." |
| M30 | Come Closer | Mucus and Force | Snared enemies take +25% Force damage, and a Force hit on one pulls the other Snared enemies within 80 towards it (Pull rule, 12.2) | "Closer! Closer! There you go." |
| M31 | Death Is Recycling | Soul | An enemy you kill with Soul releases a wisp that flies to the nearest enemy and fills 25% of its Soul bar. Wisp kills never release wisps | "Nothing goes to waste. Not even the insides." |
| M32 | Group Project | Two or more weapons | When two different weapons hit the same enemy within 0.5 s, the second hit deals +30%, with a visual that depends on the pair | "You did it together! I knew you could." |
| M33 | Growing Pains | Any | Each level-up lets off a Force Burst around you, stronger with more enemies near (up to ×2), and enemy Contact hits can't hurt you for 1 s | "You grew! Everybody noticed!" |

## 7. Suggested starting pool

| Mutation | Why |
| --- | --- |
| Slipstream | Rewards active movement |
| Sticky Fingers | Starts an XP-collection build |
| Can't Pick One | Makes Projectile weapons evolve |
| Not Finished Yet | Rewards multi-kills and chaining |
| Keep Spinning | Strengthens orbiting and lasting attacks |
| Crossed Wires | Connects the reaction system to the draft |
| Big Brain | A risky damage specialisation |
| Group Project | Rewards building round several weapons |

Everything else joins through unlocks. Open: the shipped Lateral Gene Transfer mutations (`genes.js`) need the same review against this list; and whether 4 Genome slots is enough once defences, body and type mutations share them (sims to decide; `UPGRADES.md` 11, question 2).
