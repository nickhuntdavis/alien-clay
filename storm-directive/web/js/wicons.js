'use strict';
// Spawn Prawn - weapon icons drawn from what each weapon does (Figma "Weapon Icons v2", Components page), replacing
// the generic gun shapes. One IC key per live weapon (the 24 plus the three Early Bird weapons), same grid as icons.js:
// 24 x 24, stroke 1.7, round caps, drawn in the damage-type colour by iconSVG.
// Owns: IC.w_* paths and the ICON_OF entries for those weapons (and the old ids their signature slots still carry).
// Loads after icons.js, weapons24.js, acro.js and w24look.js (which set the old keys first).
// Hooks: none (index.html script tag only).
// Save data: none.
const WICONS = {
  v_phys_proj: '<circle cx="15" cy="12" r="4"/><path d="M3 9h6M2 12h7M3 15h6"/>',
  v_phys_spread: '<path d="M6 7v10M3 9.5v5M18 7v10M21 9.5v5M6 12h12"/>',
  v_phys_contact: '<path d="M3 19.5h18"/><path d="M5 19.5V13a7 7 0 0 1 14 0v6.5"/><path d="M7 13.5l1.5-2 1.5 2 1.5-2 1.5 2 1.5-2 1.5 2 1.5-2"/>',
  v_phys_burst: '<path d="M3.5 20h17M6 20v-3h12v3"/><path d="M8 17a4 4 0 0 1 8 0"/><path d="M12 4v3M5 7.5l2 2M19 7.5l-2 2"/>',
  v_fire_proj: '<path d="M21 12c0 3-2.5 5-5.5 5S10 15 10 12s3-5 6-5c1.8 0 3.5.8 5 2"/><path d="M2 10h5M3 14h5"/><path d="M14.5 17v3"/>',
  v_shock_beam: '<path d="M4 3v18"/><path d="M4 4h7l-2 3 2 3H4"/><path d="M8 15h13M8 18.5l2-2 2 2 2-2 2 2 2-2 2 2"/>',
  v_ice_pool: '<path d="M17 3a5 5 0 1 0 4 8 4 4 0 1 1-4-8z"/><path d="M3 20h18"/><path d="M5 20c0-3 3-4 6-3 2-2 6-2 7 3"/>',
  v_arcane_proj: '<path d="M4 20l9-9"/><path d="M12 7l5 5 3-3-5-5z"/><path d="M18.5 3.5l2 2"/><circle cx="3" cy="13" r="0.8"/><circle cx="6" cy="10" r="0.8"/>',
  v_soul_proj: '<path d="M7 20v-8a5 5 0 0 1 10 0v8l-2.5-2-2.5 2-2.5-2z"/><circle cx="10" cy="11" r="0.8"/><circle cx="14" cy="11" r="0.8"/><path d="M2 9h3M2 13h2"/>',
  v_flame_pool: '<path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z"/><path d="M3 20.5h18"/>',
  s_void: '<path d="M12 12a1.5 1.5 0 1 1 1.5 1.5 3 3 0 1 1-3-3 4.5 4.5 0 1 1 4.5 4.5 6 6 0 1 1-6-6"/><circle cx="20.5" cy="4" r="1"/><circle cx="3.5" cy="20" r="1"/>',
  s_lard: '<path d="M3 19Q8 3 17 12"/><circle cx="18" cy="15" r="3"/><path d="M14 20.5l-1.5 1.5M22 20.5l1 1.5M21 11l1.5-1.5"/>',
  s_siphon: '<ellipse cx="13" cy="6" rx="3" ry="3.5"/><path d="M13 9.5v4l3 3v4.5"/><circle cx="5" cy="17" r="1.4"/><path d="M6 15c-2-3-1.5-6 2-8M8 7l-2.5-.3M8 7l-.8 2.4"/>',
  s_mines: '<path d="M4 8h16l-2 5c-1.5 4-4 6-6 6s-4.5-2-6-6z"/><path d="M8 8l4 5 4-5"/><path d="M12 8V5M10 3l2 2 2-2"/>',
  s_twin: '<circle cx="4.5" cy="14" r="2.5"/><circle cx="19.5" cy="14" r="2.5"/><path d="M7 14h10"/><path d="M12 10l-2.5-2.5a1.6 1.6 0 0 1 2.5-2 1.6 1.6 0 0 1 2.5 2z"/>',
  s_tesla: '<circle cx="4" cy="18" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="20" cy="16" r="1.6"/><path d="M5 16.5l2.5-4 1 1.5 2.5-6M13 6.5l2 3 1-.5 2.5 5"/>',
  s_redtape: '<circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><path d="M5 9.5h14v5H5z"/><path d="M8 9.5l2 5M12 9.5l2 5M16 9.5l2 5"/>',
  s_bubble: '<circle cx="9" cy="14" r="5"/><circle cx="17.5" cy="7" r="3"/><circle cx="18.5" cy="17" r="2"/><path d="M6.5 12a2.5 2.5 0 0 1 2-2"/>',
  s_duedate: '<circle cx="12" cy="14" r="7"/><path d="M12 14V10.5M12 14l2.5 1.5"/><path d="M10 3h4M12 3v4M18.5 7l1.5-1.5"/>',
  s_seeker: '<circle cx="18" cy="6" r="2"/><path d="M16 7c-3 2-6-1-10 1s-3 2-4 1"/><circle cx="18" cy="17" r="2"/><path d="M16 16c-3-2-6 1-10-1s-3-2-4-1"/>',
  s_peekaboo: '<circle cx="12" cy="12" r="8.5" stroke-dasharray="2 3"/><circle cx="9.5" cy="10.5" r="1"/><circle cx="14.5" cy="10.5" r="1"/><circle cx="12" cy="15" r="1.6"/>',
  s_toothfairy: '<path d="M12 3c4 0 7 7 7 11a7 7 0 0 1-14 0c0-4 3-11 7-11z" stroke-dasharray="2.5 2.5"/><path d="M12 10v4M10 12h4"/>',
  s_parasite: '<path d="M7 20V9a5 5 0 0 1 10 0v11"/><path d="M7 13h3M14 13h3M7 16.5h3M14 16.5h3"/><circle cx="12" cy="12" r="2"/><path d="M12 6.5v2.5M9 9.5l1.5 1M15 9.5l-1.5 1"/>',
  s_wake: '<path d="M2 18c3-3 5 3 8 0s5 3 8 0"/><circle cx="20.5" cy="17" r="1.5"/><path d="M5 13c0-2 2-3 2-6 1.5 2 2 3.5 2 6a2 2 0 0 1-4 0zM12 12c0-1.5 1.5-2.5 1.5-4.5 1 1.5 1.5 2.5 1.5 4.5a1.5 1.5 0 0 1-3 0z"/>',
  acro_cap: '<ellipse cx="10" cy="12" rx="5" ry="3.5"/><path d="M5 12c-1.5 1.5-2.5-1.5-3.5 0"/><path d="M17 8l2.5-2.5M18 12h3.5M17 16l2.5 2.5"/>',
  acro_spray: '<path d="M3 10.5c1.5 0 2.5.6 3 1.5-.5.9-1.5 1.5-3 1.5"/><path d="M14 5.5c1 1.4 1 2.6 0 3.2s-2 0-2-1.2 1-1.4 2-2zM18 11c1 1.4 1 2.6 0 3.2s-2 0-2-1.2 1-1.4 2-2zM14 15.5c1 1.4 1 2.6 0 3.2s-2 0-2-1.2 1-1.4 2-2z"/><path d="M7 10l3-2M7.5 12h5M7 14l3 2" stroke-dasharray="1.5 1.5"/>',
  acro_spark: '<path d="M2 12h10"/><path d="M17 5v4M17 15v4M12.5 12H14M20 12h2M13.8 8.8l1.5 1.5M18.7 13.7l1.5 1.5M13.8 15.2l1.5-1.5M18.7 10.3l1.5-1.5"/><circle cx="17" cy="12" r="1.6"/>',
};
if (typeof IC !== 'undefined' && typeof ICON_OF !== 'undefined') {
  for (const id in WICONS) {
    const key = 'w_' + id;
    IC[key] = WICONS[id];
    ICON_OF[id] = key;
    const d = typeof WEAPONS !== 'undefined' && WEAPONS[id];
    if (d && d.sigOf) ICON_OF[d.sigOf] = key; // (a signature slot still carries the old id)
  }
}

