'use strict';
// Spawn Prawn - the glossary. Press and hold any loot card (or anything else built with holdable) to see the
// card in full, with a short bullet for every bit of game jargon it uses.

const GLOSSARY = [
  [/\bpierc/i, 'Pierce', 'A shot carries on through this many extra enemies before it stops.'],
  [/\b(bounce|ricochet)/i, 'Bounce', 'After a hit, the shot hops on to another enemy.'],
  [/\b(chain|jump)/i, 'Chain', 'The hit leaps on to nearby enemies, a little weaker with each jump.'],
  [/\bcrit damage|crits?\b|critical/i, 'Crit', 'A chance for a hit to deal extra damage. Crit damage is how much extra (x2 to start). Chance over 100% adds to crit damage.'],
  [/\barmou?r\b/i, 'Armour', 'Taken off every hit before it lands (at least 15% of a hit always gets through). Yours wears down a point per hit and grows back when you stop getting hit; enemies\' can be shredded.'],
  [/\bshred/i, 'Shred', 'Strips an enemy\'s armour for a while, so everything hits it harder.'],
  [/\b(knock|knockback|flung|hurled|shove)/i, 'Knockback', 'Pushes enemies away from the hit. Bosses and heavy enemies barely move.'],
  [/\b(homing|home in|hunt|seek)/i, 'Homing', 'Shots steer towards a target on their own.'],
  [/\b(reload|magazine)/i, 'Reload', 'Guns fire a magazine of shots, then pause to reload.'],
  [/\b(cooldown|fire rate|cycling|fire \d+% faster)/i, 'Fire rate', 'How often a weapon or Feat goes off. Higher is faster.'],
  [/\b(area|radius|blast|explod)/i, 'Area', 'The size of blasts, pools, pulses and other effects that hit a space rather than one enemy.'],
  [/\b(lifesteal|heals? you)/i, 'Healing', 'Health back for you. Lifesteal is capped at a few HP a second, growing with your max HP.'],
  [/\bdodge/i, 'Dodge', 'A chance for a hit on you to miss completely (70% at most).'],
  [/\bluck/i, 'Luck', 'Better rarities in your loot boxes.'],
  [/\bxp\b|\blevel(s)?\b/i, 'XP and levels', 'Kills drop XP granules. Each level opens a loot box.'],
  [/\breroll/i, 'Reroll', 'Swap all the cards in a box for new ones.'],
  [/\b(common|uncommon|rare|epic|legendary)\b/i, 'Rarity', 'Common, Uncommon, Rare, Epic, Legendary: the rarer the card, the bigger its numbers.'],
  [/\bmastery|lv 10\b/i, 'Mastery', 'Only one weapon a run can reach Lv 10. It picks a mastery perk there.'],
  [/\bcombo/i, 'Combo', 'Two weapons that are both Lv 5 or more can fuse: both keep firing and gain a new power, plus a bonus weapon mount.'],
  [/\bpairing/i, 'Pairing', 'Two weapons that work better together just by both being yours.'],
  [/\btwist/i, 'Combo twist', 'A combo whose weapons are not on their usual damage types also gets an effect from its new pair of damage types.'],
  [/\b(modifier|mod slot)/i, 'Modifier', 'Installs into one weapon (three slots each) and changes how its shots behave.'],
  [/\bswitched at birth|damage type/i, 'Damage type', 'Force, Acid, Base, Static, Ethanol, Peroxide, Brine or Histamine. Each leaves a status on what it hits, and two different ones set off a chemical reaction.'],
  [/\breaction/i, 'Reaction', 'A chemical reaction: one damage type landing on an enemy that already carries another\'s status. See the Field Guide for all of them.'],
  [/\bmount/i, 'Weapon mount', 'A slot for a weapon. You get three a run, plus up to two from combos.'],
  [/\belite/i, 'Elite', 'A tougher version of an enemy that drops a loot box.'],
  [/\bboss/i, 'Boss', 'A big named enemy. Beat it for a trophy and a box of spoils.'],
  [/\b(relic|troph)/i, 'Trophy', 'A permanent, run-changing reward from a boss or a rival.'],
  [/\bdna strand/i, 'DNA strand', 'A loot box lying on the slide. Swim over it.'],
  [/\brewind/i, 'Rewind', 'Jumps you back a few seconds. Charges as you kill things.'],
  [/\becho/i, 'Echo', 'Your future self, left behind by a Rewind: it replays your weapons, then bursts.'],
  [/\bswim speed/i, 'Swim speed', 'How fast you move.'],
  [/\bpickup range|magnet/i, 'Pickup range', 'How far away XP and pickups fly to you.'],
  [/\b(projectile|multishot|extra shot)/i, 'Projectiles', 'Shots per volley. Extra projectiles spread out.'],
  [/\b(puddle|pool|patch)/i, 'Puddle', 'A patch on the ground that keeps hurting enemies standing in it.'],
  [/\brounds? of ethanol|\bmax (rounds|stacks)|\bstacking\b|\bstacks? of\b/i, 'Rounds', 'Ethanol stacks: each round adds damage over time. Too many and the enemy blacks out.'],
  [/\boverkill/i, 'Overkill', 'Damage left over after a kill jumps to the next enemy.'],
  [/\bspell/i, 'Feat', 'Casts itself on a cooldown. You have two Feat slots.'],
  [/\bsequence/i, 'Sequence', 'Your Epigenetic Profile: it sets your starting weapons, ability and bonus.'],
  [/\b(curse|bane)/i, 'Bane', 'A drawback that comes with a strong boon.'],
  [/\bsapon/i, 'Saponified', 'Base status at full strength: turned to soap and stuck solid for a moment.'],
  [/\blather/i, 'Lathered', 'Base status: slower, and slides further when hit. Enough lather saponifies.'],
  [/\bcorro/i, 'Corroding', 'Acid status: damage over time that eats a little armour as it goes.'],
  [/\bcharged\b/i, 'Charged', 'Static status: some damage it takes arcs to a neighbour and drags it closer.'],
  [/\bdrunk/i, 'Drunk', 'Ethanol status: stacking damage over time, and the enemy weaves about.'],
  [/\bswollen|swelling/i, 'Swollen', 'Histamine status: takes more from everything. The swelling passes on when it dies.'],
  [/\b(faint|stun|daze)/i, 'Stunned', 'Stops moving and attacking for a moment.'],
];
// The jargon in a piece of text: [[term, definition]], at most eight.
function glossFor(text) {
  const out = [], seen = new Set();
  for (const id in ELEMENTS) { const n = ELEMENTS[id].name; if (new RegExp('\\b' + n + '\\b').test(text) && !seen.has(n)) { seen.add(n); out.push([n, ELEMENTS[id].blurb]); } }
  for (const id in REACTIONS) { const n = REACTIONS[id].name, w = n.split(' ')[0].slice(0, 6); if (new RegExp('\\b' + w, 'i').test(text) && !seen.has(n)) { seen.add(n); out.push([n.charAt(0) + n.slice(1).toLowerCase(), REACTIONS[id].desc]); } }
  for (const [re, term, def] of GLOSSARY) if (re.test(text) && !seen.has(term)) { seen.add(term); out.push([term, def]); }
  return out.slice(0, 8);
}
// The expanded view of a loot card (shown while it is held).
function cardGlossary(o) {
  const text = [o.title, o.sub, o.desc, o.boon || ''].join(' ');
  const g = glossFor(text);
  return `<b>${esc(o.title)}</b><em>${esc(o.tag || '')}</em><p>${esc(o.desc || '')}</p>` +
    (g.length ? `<ul class="gloss">${g.map(([t, d]) => `<li><b>${esc(t)}</b>: ${esc(d)}</li>`).join('')}</ul>` : '<p class="hint">Nothing here needs explaining.</p>');
}
