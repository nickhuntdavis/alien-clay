// Draft filter: never offer a modifier card that the modifier audit (tests/sim/modaudit.js) found does nothing on that
// weapon in its current form. MOD_DEAD[weapon id][base] lists the dead modifiers, where base is '' (no Delivery) or the
// Delivery modifier the slot holds. Regenerate the table with tests/tools/moddead.js --write after rerunning the audit.
// Hooks: wraps modOk (after matrixonly.js). Loaded after cellmods4.js, before ui.js.
const MOD_DEAD = {
// TABLE START
  v_phys_proj: { '': ['homing', 'ricochet', 'area'], 'orbiting': ['piercing', 'area'], 'extra': ['ricochet', 'focus', 'catalyst', 'area'], 'melee': ['catalyst'], 'mines': ['piercing', 'returning', 'catalyst'], 'dfa': ['homing'] },
  v_phys_spread: { '': ['focus', 'pull', 'explode'], 'orbiting': ['nth', 'pull', 'explode'], 'extra': ['focus', 'pull', 'explode'], 'melee': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'catalyst', 'pull', 'explode', 'area'], 'mines': ['nth', 'focus', 'connecting', 'pull', 'explode'], 'dfa': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'connecting', 'pull', 'turncoat', 'explode'] },
  v_phys_contact: { '': ['focus', 'area'], 'orbiting': ['area'], 'ranged': ['area'] },
  v_phys_burst: { '': ['pull'], 'melee': ['kinship'], 'mines': ['catalyst', 'kinship'], 'dfa': ['catalyst'] },
  v_fire_proj: { '': ['homing', 'ricochet', 'turncoat'], 'orbiting': ['piercing', 'kinship', 'turncoat', 'area'], 'extra': ['homing', 'ricochet', 'focus', 'catalyst', 'area'], 'melee': ['catalyst'], 'mines': ['piercing', 'returning'], 'dfa': ['area'] },
  v_shock_beam: { '': ['catalyst'], 'orbiting': ['catalyst'], 'extra': ['catalyst'], 'melee': ['ricochet', 'nth', 'focus', 'catalyst', 'charged'], 'mines': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'catalyst', 'charged', 'turncoat', 'primer'], 'dfa': ['catalyst'] },
  v_ice_pool: { 'orbiting': ['piercing', 'nth'], 'melee': ['piercing', 'nth'], 'mines': ['piercing', 'nth'], 'dfa': ['piercing', 'ricochet', 'nth'] },
  v_arcane_proj: { '': ['homing', 'ricochet', 'focus', 'catalyst', 'kinship', 'area'], 'orbiting': ['piercing', 'focus', 'area'], 'extra': ['homing', 'ricochet', 'focus', 'catalyst', 'area'], 'melee': ['catalyst', 'turncoat'], 'mines': ['piercing', 'returning', 'catalyst'], 'dfa': ['homing', 'ricochet', 'focus', 'catalyst'] },
  v_soul_proj: { '': ['ricochet', 'focus', 'catalyst', 'area'], 'orbiting': ['piercing', 'focus', 'area'], 'extra': ['ricochet', 'focus', 'catalyst', 'area'], 'melee': ['turncoat'], 'mines': ['piercing', 'returning', 'turncoat'], 'dfa': ['focus'] },
  v_flame_pool: { 'orbiting': ['piercing', 'nth'], 'melee': ['piercing', 'nth'], 'mines': ['piercing', 'nth'], 'dfa': ['piercing', 'ricochet', 'nth'] },
  s_void: { '': ['ricochet'], 'orbiting': ['area'], 'extra': ['ricochet'], 'melee': ['turncoat'], 'mines': ['returning', 'focus', 'connecting', 'catalyst', 'turncoat'] },
  s_lard: { 'mines': ['turncoat'] },
  s_mines: { '': ['connecting'], 'orbiting': ['ricochet', 'nth', 'sticky', 'connecting', 'charged', 'pull', 'turncoat'], 'extra': ['connecting', 'catalyst'], 'melee': ['ricochet', 'nth', 'sticky', 'connecting', 'charged', 'pull'] },
  s_twin: { '': ['piercing', 'catalyst', 'charged'], 'orbiting': ['homing', 'piercing', 'catalyst', 'charged'], 'extra': ['piercing', 'catalyst', 'charged'], 'melee': ['homing', 'piercing', 'catalyst', 'charged'], 'mines': ['homing', 'piercing', 'catalyst', 'charged', 'knock', 'area'], 'dfa': ['piercing', 'catalyst', 'charged'] },
  s_tesla: { '': ['homing', 'piercing', 'ricochet', 'returning', 'catalyst', 'area'], 'orbiting': ['piercing', 'focus', 'catalyst', 'turncoat', 'area'], 'extra': ['homing', 'piercing', 'ricochet', 'returning', 'catalyst', 'area'], 'melee': ['catalyst'], 'mines': ['piercing', 'returning', 'catalyst'], 'dfa': ['homing', 'piercing', 'catalyst'] },
  s_redtape: { '': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'focus', 'catalyst', 'turncoat', 'mines', 'dfa', 'area'], 'orbiting': ['piercing', 'catalyst', 'area'], 'extra': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'focus', 'catalyst', 'turncoat', 'area'], 'melee': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'focus', 'catalyst', 'turncoat', 'area'], 'mines': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'focus', 'catalyst', 'turncoat', 'area'], 'dfa': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'focus', 'catalyst', 'turncoat', 'area'] },
  s_bubble: { '': ['returning', 'nth'], 'orbiting': ['piercing', 'ricochet', 'returning', 'nth', 'catalyst'], 'extra': ['returning', 'nth', 'connecting'], 'melee': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'sticky', 'connecting', 'knock', 'pull', 'explode'], 'mines': ['piercing', 'ricochet', 'returning', 'catalyst'], 'dfa': ['returning'] },
  s_duedate: { '': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'focus', 'connecting', 'catalyst', 'pull', 'turncoat', 'mines', 'dfa', 'area'], 'orbiting': ['piercing', 'catalyst', 'area'], 'extra': ['returning', 'nth', 'focus', 'catalyst', 'area'], 'melee': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'focus', 'catalyst', 'pull', 'turncoat', 'mines', 'area'], 'mines': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'focus', 'connecting', 'catalyst', 'pull', 'turncoat', 'area'], 'dfa': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'focus', 'connecting', 'catalyst', 'pull', 'turncoat', 'area'] },
  s_seeker: { '': ['ricochet', 'focus', 'catalyst', 'area'], 'orbiting': ['piercing', 'focus', 'catalyst', 'turncoat', 'area'], 'extra': ['ricochet', 'catalyst', 'area'], 'melee': ['catalyst'], 'mines': ['piercing', 'returning', 'catalyst', 'kinship', 'turncoat'], 'dfa': ['ricochet', 'focus', 'catalyst'] },
  s_peekaboo: { '': ['nth', 'mines', 'dfa', 'area'], 'melee': ['nth', 'area'], 'ranged': ['returning', 'nth', 'area'], 'mines': ['nth', 'area'], 'dfa': ['nth', 'area'] },
  s_toothfairy: { '': ['connecting', 'turncoat'], 'orbiting': ['ricochet', 'connecting'], 'melee': ['ricochet', 'nth', 'sticky', 'connecting', 'knock', 'pull', 'turncoat', 'area'], 'dfa': ['ricochet', 'connecting', 'turncoat'] },
  s_parasite: { '': ['ricochet', 'area'], 'orbiting': ['piercing', 'focus', 'area'], 'extra': ['ricochet', 'focus', 'area'], 'melee': ['catalyst'], 'mines': ['piercing', 'returning'], 'dfa': ['homing'] },
  acro_cap: { '': ['focus', 'catalyst', 'kinship'], 'orbiting': ['focus', 'catalyst'], 'ranged': ['catalyst', 'kinship', 'area'] },
  acro_spray: { '': ['homing', 'connecting'], 'orbiting': ['nth', 'pull'], 'extra': ['homing', 'focus'], 'melee': ['homing', 'ricochet', 'returning', 'nth', 'focus', 'connecting', 'catalyst', 'pull', 'turncoat', 'area'], 'mines': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'focus', 'connecting', 'catalyst', 'knock', 'pull', 'explode'], 'dfa': ['homing', 'piercing', 'ricochet', 'returning', 'nth', 'connecting', 'pull', 'explode'] },
  acro_spark: { '': ['homing', 'ricochet', 'nth', 'connecting', 'explode'], 'orbiting': ['homing', 'nth', 'connecting', 'explode'], 'extra': ['homing', 'ricochet', 'nth', 'focus', 'connecting', 'pull', 'turncoat', 'explode'], 'melee': ['homing', 'ricochet', 'nth', 'focus', 'connecting', 'charged', 'explode'], 'mines': ['homing', 'ricochet', 'nth', 'focus', 'connecting', 'catalyst', 'charged', 'kinship', 'knock', 'pull', 'turncoat', 'explode', 'primer'], 'dfa': ['homing', 'ricochet', 'nth', 'connecting', 'explode'] },
  v_flame_beam: { '': ['homing', 'catalyst', 'area'], 'orbiting': ['nth', 'focus', 'area'], 'extra': ['area'] },
// TABLE END
};
// Modifiers the audit finds dead on their own (it adds one card at a time) that come alive next to another the weapon holds:
// MOD_LIVE_WITH[weapon id][modifier] = cards that wake it. Hand-kept (outside the table, so a rebuild leaves it alone).
const MOD_LIVE_WITH = {
  v_flame_beam: { homing: ['ricochet', 'piercing'] }, // (Homing curves every bounce and pierce: laserbeam.js lzTrace)
};
const modDeliveryOf = w => { for (const id of (w && w.m10) || []) if (MM_GROUP[id] === 'delivery') return id; return ''; };
const modWoken = (w, id) => { const l = (MOD_LIVE_WITH[w24Key(w)] || {})[id]; return !!l && l.some(m => ((w && w.m10) || []).includes(m)); };
modOk = (orig => function (w, id) {
  const d = MOD_DEAD[w24Key(w)];
  if (d && d[modDeliveryOf(w)] && d[modDeliveryOf(w)].includes(id) && !modWoken(w, id)) return false;
  return orig(w, id);
})(modOk);
