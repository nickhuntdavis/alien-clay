// Draft filter: never offer a modifier card that the modifier audit (tests/sim/modaudit.js) found does nothing on that
// weapon in its current form. MOD_DEAD[weapon id][base] lists the dead modifiers, where base is '' (no Delivery) or the
// Delivery modifier the slot holds. Regenerate the table with tests/tools/moddead.js --write after rerunning the audit.
// Hooks: wraps modOk (after matrixonly.js). Loaded after cellmods4.js, before ui.js.
const MOD_DEAD = {
// TABLE START
  v_phys_proj: { '': ['homing', 'ricochet', 'area'], 'orbiting': ['piercing', 'area'], 'extra': ['ricochet', 'focus', 'catalyst', 'area'], 'melee': ['catalyst'], 'mines': ['piercing', 'catalyst'], 'dfa': ['homing'] },
  v_phys_spread: { '': ['focus', 'pull', 'explode'], 'orbiting': ['nth', 'pull', 'explode'], 'extra': ['focus', 'pull', 'explode'], 'melee': ['homing', 'piercing', 'ricochet', 'nth', 'catalyst', 'range', 'pull', 'explode', 'area'], 'mines': ['nth', 'focus', 'connecting', 'pull', 'explode'], 'dfa': ['homing', 'piercing', 'ricochet', 'nth', 'connecting', 'range', 'pull', 'turncoat', 'explode'] },
  v_phys_contact: { '': ['focus', 'range', 'upclose', 'area'], 'orbiting': ['area'], 'ranged': ['range', 'area'] },
  v_phys_burst: { '': ['pull'], 'melee': ['upclose', 'kinship'], 'ranged': ['upclose'], 'mines': ['catalyst', 'upclose', 'kinship'], 'dfa': ['catalyst', 'upclose'] },
  v_fire_proj: { '': ['homing', 'ricochet', 'range', 'turncoat'], 'orbiting': ['piercing', 'kinship', 'turncoat', 'area'], 'extra': ['homing', 'ricochet', 'focus', 'catalyst', 'area'], 'melee': ['catalyst'], 'mines': ['piercing'], 'dfa': ['area'] },
  v_shock_beam: { '': ['catalyst'], 'orbiting': ['catalyst'], 'extra': ['catalyst'], 'melee': ['ricochet', 'nth', 'focus', 'catalyst', 'charged'], 'mines': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'catalyst', 'upclose', 'charged', 'turncoat', 'primer'], 'dfa': ['catalyst'] },
  v_ice_pool: { 'orbiting': ['piercing', 'nth'], 'melee': ['piercing', 'nth'], 'mines': ['piercing', 'nth'], 'dfa': ['piercing', 'ricochet', 'nth', 'upclose'] },
  v_arcane_proj: { '': ['homing', 'ricochet', 'focus', 'catalyst', 'range', 'kinship', 'area'], 'orbiting': ['piercing', 'focus', 'area'], 'extra': ['homing', 'ricochet', 'focus', 'catalyst', 'area'], 'melee': ['catalyst', 'turncoat'], 'mines': ['piercing', 'catalyst'], 'dfa': ['homing', 'ricochet', 'focus', 'catalyst'] },
  v_soul_proj: { '': ['ricochet', 'focus', 'catalyst', 'area'], 'orbiting': ['piercing', 'focus', 'area'], 'extra': ['ricochet', 'focus', 'catalyst', 'area'], 'melee': ['upclose', 'turncoat'], 'mines': ['piercing', 'upclose', 'turncoat'], 'dfa': ['focus'] },
  v_flame_pool: { 'orbiting': ['piercing', 'nth'], 'melee': ['piercing', 'nth'], 'mines': ['piercing', 'nth'], 'dfa': ['piercing', 'ricochet', 'nth'] },
  s_void: { '': ['ricochet'], 'orbiting': ['area'], 'extra': ['ricochet'], 'melee': ['turncoat'], 'mines': ['focus', 'connecting', 'catalyst', 'turncoat'] },
  s_lard: { 'mines': ['turncoat'] },
  s_mines: { '': ['connecting'], 'orbiting': ['ricochet', 'nth', 'sticky', 'connecting', 'charged', 'pull', 'turncoat'], 'extra': ['connecting', 'catalyst'], 'melee': ['ricochet', 'nth', 'sticky', 'connecting', 'charged', 'pull'] },
  s_twin: { '': ['piercing', 'catalyst', 'charged'], 'orbiting': ['homing', 'piercing', 'catalyst', 'charged'], 'extra': ['piercing', 'catalyst', 'charged'], 'melee': ['homing', 'piercing', 'catalyst', 'charged'], 'mines': ['homing', 'piercing', 'catalyst', 'charged', 'knock', 'area'], 'dfa': ['piercing', 'catalyst', 'charged'] },
  s_tesla: { '': ['homing', 'piercing', 'ricochet', 'catalyst', 'area'], 'orbiting': ['piercing', 'focus', 'catalyst', 'turncoat', 'area'], 'extra': ['homing', 'piercing', 'ricochet', 'catalyst', 'range', 'area'], 'melee': ['catalyst', 'range'], 'mines': ['piercing', 'catalyst'], 'dfa': ['homing', 'piercing', 'catalyst'] },
  s_redtape: { '': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'catalyst', 'range', 'upclose', 'turncoat', 'mines', 'dfa', 'area'], 'orbiting': ['piercing', 'catalyst', 'area'], 'extra': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'catalyst', 'range', 'turncoat', 'area'], 'melee': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'catalyst', 'range', 'upclose', 'turncoat', 'area'], 'mines': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'catalyst', 'range', 'upclose', 'turncoat', 'area'], 'dfa': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'catalyst', 'range', 'upclose', 'turncoat', 'area'] },
  s_bubble: { '': ['nth'], 'orbiting': ['piercing', 'ricochet', 'nth', 'catalyst'], 'extra': ['nth', 'connecting'], 'melee': ['homing', 'piercing', 'ricochet', 'nth', 'sticky', 'connecting', 'knock', 'pull', 'explode'], 'mines': ['piercing', 'ricochet', 'catalyst'] },
  s_duedate: { '': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'connecting', 'catalyst', 'range', 'pull', 'turncoat', 'mines', 'dfa', 'area'], 'orbiting': ['piercing', 'catalyst', 'area'], 'extra': ['piercing', 'ricochet'], 'melee': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'catalyst', 'range', 'pull', 'turncoat', 'mines', 'area'], 'mines': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'connecting', 'catalyst', 'range', 'pull', 'turncoat', 'area'], 'dfa': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'connecting', 'catalyst', 'range', 'pull', 'turncoat', 'area'] },
  s_seeker: { '': ['ricochet', 'focus', 'catalyst', 'area'], 'orbiting': ['piercing', 'focus', 'catalyst', 'turncoat', 'area'], 'extra': ['ricochet', 'catalyst', 'area'], 'melee': ['catalyst'], 'mines': ['piercing', 'catalyst', 'kinship', 'turncoat'], 'dfa': ['ricochet', 'focus', 'catalyst'] },
  s_peekaboo: { '': ['nth', 'range', 'upclose', 'ranged', 'mines', 'dfa', 'area'], 'melee': ['nth', 'range', 'upclose', 'area'], 'ranged': ['nth', 'range', 'upclose', 'mines', 'area'], 'mines': ['nth', 'range', 'upclose', 'ranged', 'area'], 'dfa': ['nth', 'range', 'upclose', 'area'] },
  s_toothfairy: { '': ['connecting', 'turncoat'], 'orbiting': ['ricochet', 'connecting'], 'melee': ['ricochet', 'nth', 'sticky', 'connecting', 'knock', 'pull', 'turncoat', 'area'], 'dfa': ['ricochet', 'connecting', 'turncoat'] },
  s_parasite: { '': ['ricochet', 'area'], 'orbiting': ['piercing', 'focus', 'area'], 'extra': ['ricochet', 'focus', 'area'], 'melee': ['catalyst'], 'mines': ['piercing'], 'dfa': ['homing'] },
  acro_cap: { '': ['focus', 'catalyst', 'upclose', 'kinship'], 'orbiting': ['focus', 'catalyst'], 'ranged': ['catalyst', 'range', 'upclose', 'kinship', 'area'] },
  acro_spray: { '': ['homing', 'connecting'], 'orbiting': ['nth', 'pull'], 'extra': ['homing', 'focus'], 'melee': ['homing', 'ricochet', 'nth', 'focus', 'connecting', 'catalyst', 'range', 'pull', 'turncoat', 'area'], 'mines': ['homing', 'piercing', 'ricochet', 'nth', 'focus', 'connecting', 'catalyst', 'upclose', 'knock', 'pull', 'explode'], 'dfa': ['homing', 'piercing', 'ricochet', 'nth', 'connecting', 'pull', 'explode'] },
  acro_spark: { '': ['homing', 'ricochet', 'nth', 'connecting', 'range', 'explode'], 'orbiting': ['homing', 'nth', 'connecting', 'explode'], 'extra': ['homing', 'ricochet', 'nth', 'focus', 'connecting', 'range', 'pull', 'turncoat', 'explode'], 'melee': ['homing', 'ricochet', 'nth', 'focus', 'connecting', 'charged', 'explode'], 'mines': ['homing', 'ricochet', 'nth', 'focus', 'connecting', 'catalyst', 'range', 'upclose', 'charged', 'kinship', 'knock', 'pull', 'turncoat', 'explode', 'primer'], 'dfa': ['homing', 'ricochet', 'nth', 'connecting', 'explode'] },
  v_flame_beam: { '': ['homing', 'catalyst', 'area'], 'orbiting': ['nth', 'focus', 'area'], 'extra': ['area'] },
// TABLE END
};
const modDeliveryOf = w => { for (const id of (w && w.m10) || []) if (MM_GROUP[id] === 'delivery') return id; return ''; };
modOk = (orig => function (w, id) {
  const d = MOD_DEAD[w24Key(w)];
  if (d && d[modDeliveryOf(w)] && d[modDeliveryOf(w)].includes(id)) return false;
  return orig(w, id);
})(modOk);
