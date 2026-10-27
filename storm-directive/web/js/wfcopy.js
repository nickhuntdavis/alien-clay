'use strict';
// Spawn Prawn - fusion names and card text for all 27 pairs (wfusion2.js to wfusion5.js). Claude-drafted at the user's
// request, 27 Oct (voice_and_tone.md: the name carries the joke, the description says what it visibly does, no numbers).
// Fills WF_TEXT, which wfusion.js reads for the fusion card and the fused weapon's name (wfName).
// Hooks: none. Loads right after wfusion5.js.
const WF_COPY = {
  sibshot: ['Nuclear Family', 'Shots home in. Every kill has children, and the children have children. Nobody planned this.'],
  pinclock: ['Biological Clock', 'Needles start a countdown. At zero the Bleed goes off all at once, and so do the neighbours.'],
  zapbub: ['Static Cling', 'Bubbles feed one charged bubble that drifts onto the crowd, zaps it, then bursts.'],
  peekegg: ['Nest Egg', 'Vanishing leaves an egg behind. Everything goes for it. The egg goes off.'],
  lardmine: ['Nappy Blowout', 'Blasts throw enemies into the next mine, which goes off bigger. Containment has failed.'],
  acidmess: ['Acid Reflux', 'Globs drip burning acid on the way and splash on arrival. It repeats on you.'],
  hotcore: ['Heat Death', 'Black holes burn their core, then collapse in a blast and leave the floor burning.'],
  snotfire: ['Night Sweats', 'The puddles burn, then boil over. The more stuck in one, the worse it goes.'],
  tapezap: ['Chain of Custody', 'Taped bundles crackle with Static. Lose one and the tape finds a replacement.'],
  wormsibs: ['Family Reunion', 'Siblings infect. The dead rise, spit siblings, then burst into more. Everyone is invited.'],
  redlaser: ['Red Alert', 'Whatever the Laser hits splits it into a fan of Static behind it.'],
  possessed: ['Night Terrors', 'Shots possess. The possessed panic, and when one dies it moves in next door.'],
  gainsneeze: ['Gym Flu', 'Close shots pump an enemy up until it bursts and sneezes acid on whoever is behind it.'],
  nervepanic: ['Panic Attack', 'Every snap winds you up. When you are full, everything nearby is thrown back and stunned.'],
  crossbeam: ['Long Distance', 'A live beam joins you to your twin. Anything in between regrets it. Your twin fires too.'],
  ram: ['Concussion', 'Every few headbutts sends an enemy flying through its friends.'],
  reaper: ['Kiss of Life', 'A kill passes the spark to the next enemy, with acid. It keeps going while there is anyone left.'],
  reel: ['Love Bombing', 'The beam draws them in close. Each snap fires a beam straight through the queue.'],
  voodoo: ['Needle Exchange', 'Shots possess. The possessed turn on their friends with your needles.'],
  eggbomb: ['Booby Trap', 'Eggs explode when grabbed. Greed has consequences.'],
  peekhole: ['Ghosting', 'Vanishing leaves a black hole where you were. It swallows the search party, then implodes.'],
  lens: ['Split Ends', 'Shots pop bubbles at their biggest, and a bullet that passes through one comes out as three.'],
  bundle: ['Group Hug', 'Shots on a taped enemy drag the whole bundle together and share the damage.'],
  brood2: ['Breeding Ground', 'Puddles infect what they catch. The dead rise and leave puddles of their own.'],
  sneeze: ['Sympathy Sneeze', 'Your twin sneezes as well, at whatever is near it. Nobody covers their mouth.'],
  induce: ['Induced Labour', 'The spark brings the due date forward. It arrives early, twice the size, and spreads.'],
  ambush: ['Blind Date', 'You come back headfirst. Headbutts from hiding hit much harder and scare off the rest.'],
};
for (const id in WF_COPY) WF_TEXT[id] = { name: WF_COPY[id][0], desc: WF_COPY[id][1] };
