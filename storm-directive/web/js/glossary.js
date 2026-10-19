'use strict';
// Spawn Prawn - the glossary. Press and hold any loot card (or anything else built with holdable) to see the
// card in full, with a short bullet for every bit of game jargon it uses.

const GLOSSARY = [
  [/\bpoise|stagger/i, 'Poise', 'Force builds a Poise bar on what it hits. Fill it and the enemy staggers (stops for under a second; bosses barely at all). The bar drains if you stop hitting.'],
  [/\balien bar|possess/i, 'Alien bar', 'Alien hits fill this bar. Fill it and the enemy is Possessed: it fights its own mates for a few seconds, then cannot be Possessed again for a while. Bosses resist.'],
  [/\bburn bar|ignit|burning/i, 'Burn bar', 'Fire fills this bar, and a burning enemy takes a short damage over time. Fill it and it Ignites: one flare on that enemy, then the bar resets. Becoming Snared puts it out.'],
  [/\bcorro(sion|ded)/i, 'Corrosion', 'Acid fills this bar. Fill it and one Shell layer is stripped for good. With no Shell, the enemy is just visibly Corroded for 4 seconds. No damage over time.'],
  [/\bmembrane/i, 'Membrane', 'A second health pool (half of max health) that soaks hits first. It recharges after 2 seconds without being hit. Force does only half damage to it; Static recharges it.'],
  [/\bshell\b|\blayers?\b/i, 'Shell', 'Layers of hard casing. Each layer takes a fixed amount off every physical hit and has a little health of its own. A lost layer stays lost; Acid strips them fast and heavy Force breaks one at once.'],
  [/\bsquishy/i, 'Squishy', 'Soft body: cuts blunt Force damage by about a third and knockback by half. Cuts and the other damage types go straight through.'],
  [/\bthorns/i, 'Thorns', 'Hurts whoever hit it, once per Contact hit. It does not soften the hit. Ranged shots and hazards never set it off.'],
  [/\bevasion/i, 'Evasion', 'A chance to dodge a Contact, Projectile or Spread hit entirely, with a visible miss puff. Area attacks (Burst, Beam, Pool) cannot be evaded.'],
  [/\bsnared?\b/i, 'Snared', 'Mucus status: a heavy slow for a couple of seconds. Refreshes on every hit, and puts out Burning.'],
  [/\bconjoined/i, 'Conjoined', 'Two Snared enemies that touch stick together for 3 seconds.'],
  [/\bextraction|bleed/i, 'Bleeding', 'Blood status. If an enemy dies while bleeding, it is Extracted: you heal 1% of your max health (at most 6 a second) and it leaves a blood pool.'],
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
  [/\bupgrade all/i, 'Upgrade All', 'Spend 5 rerolls to raise every card in a box one rarity (sometimes two), up to Mythical.'],
  [/\bacquired taste/i, 'Acquired Taste', 'Cards of that damage type come up more often. You hold one at a time.'],
  [/\bgone off it/i, 'Gone Off It', 'Cards of that damage type come up less often (never none). You hold one at a time.'],
  [/\breroll/i, 'Reroll', 'Swap all the cards in a box for new ones.'],
  [/\b(common|uncommon|rare|epic|legendary)\b/i, 'Rarity', 'Common, Uncommon, Rare, Epic, Legendary: the rarer the card, the bigger its numbers.'],
  [/\bmastery|lv 10\b/i, 'Mastery', 'Only one weapon a run can reach Lv 10. It picks a mastery perk there.'],
  [/\bcombo/i, 'Combo', 'Two weapons that are both Lv 5 or more can fuse: both keep firing and gain a new power, plus a bonus weapon mount.'],
  [/\bpairing/i, 'Pairing', 'Two weapons that work better together just by both being yours.'],
  [/\btwist/i, 'Combo twist', 'A combo whose weapons are not on their usual damage types also gets an effect from its new pair of damage types.'],
  [/\b(modifier|mod slot)/i, 'Modifier', 'Installs into one weapon (three slots each) and changes how its shots behave.'],
  [/\bswitched at birth|damage type/i, 'Damage type', 'Force, Acid, Mucus, Static, Cooties, Oil, Water, Blood or Alien. Each leaves a status on what it hits, and two different ones set off an unstable reaction.'],
  [/\breaction/i, 'Reaction', 'An unstable reaction: one damage type landing on an enemy that already carries another\'s status. See the Field Guide for all of them.'],
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
  [/\brounds? of ethanol|\bmax (rounds|stacks)|\bstacking\b|\bstacks? of\b/i, 'Doses', 'Cooties stacks: each dose adds damage over time. Top one up to its limit and it spreads (Pandemic).'],
  [/\boverkill/i, 'Overkill', 'Damage left over after a kill jumps to the next enemy.'],
  [/\bspell/i, 'Feat', 'Performs itself on a cooldown. You have two Feat slots.'],
  [/\bsequence/i, 'Sequence', 'Your Epigenetic Profile: it sets your starting weapons, ability and bonus.'],
  [/\b(curse|bane)/i, 'Bane', 'A drawback that comes with a strong boon.'],
  [/\bsapon/i, 'Glued', 'Mucus status at full strength: stuck fast for a moment.'],
  [/\blather/i, 'Snotty', 'Mucus status: slower with every hit. Enough and it is glued in place.'],
  [/\bcorro/i, 'Melting', 'Acid status: damage over time that eats armour as it goes, and +50% once the armour is gone.'],
  [/\bcharged\b/i, 'Charged', 'Static status: some damage it takes arcs to a neighbour and drags it closer.'],
  [/\bdrunk/i, 'Sick', 'Cooties status: stacking damage over time; it staggers, hits you softer and sneezes it onto its mates.'],
  [/\bhex(ed|es)?\b/i, 'Marked', 'Takes 30% more from everything for a few seconds.'],
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
