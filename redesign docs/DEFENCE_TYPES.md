# Defence Types

Squishy | Membrane | Shell | Thorns | Evasion

The five defences: what each one is for, how it looks, and what beats it. These are the only defences; there are no extra traits. Enemies and the player can both have any of them (the player through Assimilation, `UPGRADES.md` 5).

**Every rule lives in `COMBAT_MATRIX.md`:** the defence rules and interaction rows (section 3), how each damage type meets each defence (section 7), how a hit resolves (11.1) and the starting values (11.4). This doc never restates them.

| Defence | One line | The answer to it |
| --- | --- | --- |
| **Squishy / Absorption** | Soft body that softens blunt impact | Anything but Force: cuts, Acid, Static, Fire and the rest go through |
| **Membrane** | A regenerating barrier before the body | Keep the pressure on; don't bring Force or Static |
| **Shell** | Rigid layers that shrug off small hits, lost one at a time | Acid strips layers fast; heavy Force knocks one off |
| **Thorns** | Hitting it hurts you back; the hit still lands | Ranged attacks |
| **Evasion** | Luck and agility: some hits just miss | Burst, Beam and Pool always land |

---

# Squishy / Absorption

**Give under pressure. Soften the hit. Stay hard to knock around.**

A soft, yielding body that absorbs blunt impact instead of transmitting it. A focused anti-Force defence, not a general resistance to damage or control.

**Visual language:** rubbery, slimy. The hit visibly lands and sinks in; it never looks like a miss or an immunity.

| Strong against | Weak against |
| --- | --- |
| Repeated blunt impacts | Cuts, Acid, heat, Static and every other non-blunt hit |
| Force knockback | Control that doesn't rely on impulse |
| Force-heavy builds | Statuses and hazards |

---

# Membrane

**A barrier before the body. Break contact, let it recover, then go again.**

A separate, regenerating pool that takes damage before health. It buys temporary protection and rewards breaking off; sustained pressure stops it recovering.

**Visual language:** blue. On enemies, a blue ring; on the player, a reactive membrane like the existing armour bubble. The recharge has a strong visual and audio tell, and Static's recharge crackles across the bubble.

| Strong against | Weak against |
| --- | --- |
| Force (resisted) | Continuous pressure, which stops it recovering |
| Short bursts of damage followed by a pause | Statuses and hazards (it blocks neither once applied) |
| Static builds (Static recharges it, a risk the player can see) | Anything once it has broken |

Not to be confused with Shell: a Membrane recovers; Shell loses layers for good.

---

# Shell

**Rigid layers. Shrug off small hits. Lose protection one piece at a time.**

Finite physical plating. Each layer takes a fixed amount off every physical hit, so it is best against many small hits. Lost layers never come back during the encounter.

**Visual language:** a brown UI ring per layer; a ring cracks off when its layer is lost. Reuse the existing prototype Shell visual, and keep the ring count matching the real layers left.

| Strong against | Weak against |
| --- | --- |
| Repeated small physical hits (Spread pellets, Beam ticks) | Acid (Corrosion strips layers fast) |
| Rapid, low-damage attackers | Heavy Force hits (knock a layer off at once) |
| Physical damage generally | Heat, Burning, Bleed ticks, Soul build-up and control |

---

# Thorns

**Hitting it hurts you back. The hit still lands.**

Retaliation, not protection: a Contact hit on a Thorns creature lands in full and then hurts the attacker. It makes close-range play costly without making it pointless.

**Visual language:** literal thorns and spikes.

| Strong against | Weak against |
| --- | --- |
| Contact weapons and melee attackers | Projectile, Spread, Burst, Beam and Pool |
| Fast attackers that land many separate Contact hits | Evasion (a miss means no contact, so no retaliation) |
| Enemies that force the player into contact | It never reduces the incoming hit |

---

# Evasion

**Don't absorb the hit. Don't be where it lands.**

A miss chance against hits aimed at one point (Contact, Projectile and Spread). Protection by luck and agility, not by damage reduction or a pool. Renamed from Dodge on 17 Oct 2026, because autorun "dodges" by moving.

**Visual language:** a quick sideways flicker and a visible "miss" puff on every miss, so a miss never looks like an immunity or a bug.

| Strong against | Weak against |
| --- | --- |
| Single projectiles and Contact strikes | Burst, Beam and Pool, which always land |
| Contact attackers (a miss also avoids Thorns) | Many small hits that average out the luck (Spread pellets) |
| Slow, heavy single hits | Statuses and hazards already applied |
