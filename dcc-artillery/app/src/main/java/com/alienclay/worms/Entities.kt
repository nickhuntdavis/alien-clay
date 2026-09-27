package com.alienclay.worms

/** How a weapon is used. */
enum class Action {
    ARC, // thrown, explodes on contact
    FUSE, // thrown, bounces, explodes when the fuse runs out
    BOLT, // straight-line magic, no gravity (several at once for [Weapon.bolts] > 1)
    DROP, // placed at your feet with a fuse
    MELEE, // hits whoever is right in front of you
    POUNCE, // you are the projectile
    ROAR, // pushes everyone nearby away
    SLAM, // shockwave around you
    BARRICADE, // raises a stone wall in front of you
    AIRSTRIKE, // bombs fall from the ceiling onto a spot you aim at
    TELEPORT, // you appear where the aim lands
    HEAL, // restores your health
    SHELL, // blocks the next hit you take
    QUAKE, // shakes the whole floor
}

/**
 * Every attack in the game. Fighters use the ones in their [Species] loadout plus any spells found in loot
 * boxes ([spell] = one-use, only from boxes). [damage] and [radius] describe the hit; [launch] scales throw
 * speed or melee knockback; [power] multiplies the blast of the projectile it throws.
 */
enum class Weapon(
    val label: String,
    val action: Action,
    val kind: Kind?,
    val damage: Float,
    val radius: Float,
    val launch: Float = 1f,
    val spell: Boolean = false,
    val bolts: Int = 2,
    val power: Float = 1f,
) {
    HOB_LOBBER("Hob-Lobber", Action.ARC, Kind.LOBBER, 50f, 44f),
    KICK("Kick", Action.MELEE, null, 30f, 22f, 520f),
    SATCHEL("Satchel Charge", Action.DROP, Kind.SATCHEL, 70f, 70f),
    MISSILE("Magic Missile", Action.BOLT, Kind.BOLT, 22f, 14f),
    POTION_BOMB("Potion Bomb", Action.FUSE, Kind.POTION, 45f, 44f),
    BITE("Bite", Action.MELEE, null, 32f, 22f, 220f),
    POUNCE("Pounce", Action.POUNCE, null, 30f, 24f, 0.65f),
    ROAR("Roar", Action.ROAR, null, 6f, 75f, 420f),
    KNIFE("Throwing Knife", Action.ARC, Kind.KNIFE, 22f, 8f, 1.1f),
    SCATTER("Scatter Charge", Action.FUSE, Kind.SCATTER, 25f, 28f),
    SPEAR("Spear", Action.ARC, Kind.SPEAR, 38f, 14f),
    SHIELD_BASH("Shield Bash", Action.MELEE, null, 15f, 22f, 620f),
    BOULDER("Boulder", Action.ARC, Kind.BOULDER, 55f, 52f, 0.8f),
    CLUB("Club", Action.MELEE, null, 30f, 24f, 450f),
    SLAM("Ground Slam", Action.SLAM, null, 28f, 48f, 380f),

    // Katia
    PUNCH("Heavy Punch", Action.MELEE, null, 26f, 22f, 480f),
    CROSSBOW("Crossbow", Action.ARC, Kind.KNIFE, 26f, 8f, 1.2f, power = 1.2f),
    BARRICADE("Barricade", Action.BARRICADE, null, 0f, 0f),

    // Floor bosses
    TENTACLE("Tentacle Lash", Action.MELEE, null, 28f, 40f, 520f),
    INK_BOMB("Ink Bomb", Action.FUSE, Kind.POTION, 40f, 44f),
    WATER_SPOUT("Water Spout", Action.ROAR, null, 10f, 95f, 480f),
    DIVE("Stone Dive", Action.POUNCE, null, 34f, 26f, 0.75f),
    SCREECH("Screech", Action.ROAR, null, 8f, 85f, 440f),
    STONE_SHARDS("Stone Shards", Action.FUSE, Kind.SCATTER, 25f, 28f),
    LAVA_BALL("Lava Ball", Action.ARC, Kind.LAVA, 45f, 46f, 0.9f),
    ERUPTION("Eruption", Action.SLAM, null, 34f, 62f, 440f),
    MAGMA_FIST("Magma Fist", Action.MELEE, null, 32f, 24f, 460f),

    // Spells, only from loot boxes (one use each)
    HEAL_POTION("Healing Potion", Action.HEAL, null, 50f, 0f, spell = true),
    PROTECTIVE_SHELL("Protective Shell", Action.SHELL, null, 0f, 0f, spell = true),
    TELEPORT("Blink", Action.TELEPORT, null, 0f, 0f, 0.8f, spell = true),
    FIREBALL("Fireball", Action.BOLT, Kind.FIREBALL, 60f, 58f, spell = true, bolts = 1),
    MISSILE_STORM("Magic Missile Storm", Action.BOLT, Kind.BOLT, 22f, 14f, spell = true, bolts = 7),
    BARRAGE("Hob-Lobber Barrage", Action.AIRSTRIKE, Kind.LOBBER, 50f, 44f, spell = true),
    GRAVITY_WELL("Gravity Well", Action.ARC, Kind.WELL, 20f, 30f, spell = true),
    EARTHQUAKE("Earthquake", Action.QUAKE, null, 12f, 0f, spell = true),
    NUKE("Tactical Nuke", Action.ARC, Kind.NUKE, 90f, 100f, 0.85f, spell = true),
    ;

    /** Whether dragging further means a harder throw (otherwise only the direction matters). */
    val usesPower: Boolean
        get() = action == Action.ARC || action == Action.FUSE || action == Action.POUNCE ||
            action == Action.AIRSTRIKE || action == Action.TELEPORT
}

enum class Kind { LOBBER, POTION, SCATTER, SHARD, SATCHEL, KNIFE, SPEAR, BOULDER, BOLT, FIREBALL, LAVA, WELL, NUKE }

/** Every fighter: stats, a passive trait, and the attacks each one can use (ammo -1 = unlimited). */
enum class Species(
    val label: String,
    val team: Int,
    val maxHp: Int,
    val walk: Float,
    val jump: Float,
    val trait: String,
    val loadout: List<Pair<Weapon, Int>>,
    val fallProof: Boolean = false,
    val blastBonus: Float = 1f,
    val knockback: Float = 1f,
) {
    CARL("Carl", 0, 110, 1f, 1f, "Explosives expert: +25% blast damage",
        listOf(Weapon.KICK to -1, Weapon.HOB_LOBBER to -1, Weapon.SATCHEL to 2), blastBonus = 1.25f),
    DONUT("Princess Donut", 0, 80, 1.1f, 1.35f, "Always lands on her feet",
        listOf(Weapon.MISSILE to -1, Weapon.POTION_BOMB to -1), fallProof = true),
    MONGO("Mongo", 0, 120, 1.4f, 1.3f, "Fast, fierce and very good at pouncing",
        listOf(Weapon.BITE to -1, Weapon.POUNCE to -1, Weapon.ROAR to 2)),
    KATIA("Katia", 0, 130, 0.9f, 0.9f, "Shapeshifter: shrugs off half the knockback",
        listOf(Weapon.PUNCH to -1, Weapon.CROSSBOW to -1, Weapon.BARRICADE to 2), knockback = 0.5f),
    GOBLIN("Goblin", 1, 70, 1.3f, 1.1f, "Quick, sneaky and fragile",
        listOf(Weapon.KNIFE to -1, Weapon.POTION_BOMB to -1, Weapon.SCATTER to 2)),
    HOBGOBLIN("Hobgoblin", 1, 100, 1f, 1f, "Drilled soldier",
        listOf(Weapon.SPEAR to -1, Weapon.SHIELD_BASH to -1, Weapon.SATCHEL to 1)),
    OGRE("Ogre", 1, 150, 0.6f, 0.7f, "Floor boss. Huge, slow and hits like a landslide",
        listOf(Weapon.BOULDER to -1, Weapon.CLUB to -1, Weapon.SLAM to 2)),
    KRAKEN("Catacomb Kraken", 1, 160, 0.5f, 0.6f, "Floor boss. Long reach, wet and angry",
        listOf(Weapon.TENTACLE to -1, Weapon.INK_BOMB to -1, Weapon.WATER_SPOUT to 2), knockback = 0.6f),
    GARGOYLE("Gargoyle", 1, 140, 0.9f, 1.8f, "Floor boss. Glides down from any height",
        listOf(Weapon.DIVE to -1, Weapon.STONE_SHARDS to -1, Weapon.SCREECH to 2), fallProof = true),
    MAGMA_GOLEM("Magma Golem", 1, 170, 0.5f, 0.6f, "Floor boss. Molten, massive, barely movable",
        listOf(Weapon.LAVA_BALL to -1, Weapon.MAGMA_FIST to -1, Weapon.ERUPTION to 2), knockback = 0.4f),
    ;

    val weapons: List<Weapon> get() = loadout.map { it.first }
}

/** One fighter. Still called a worm internally: it is the genre's word for a player-controlled unit. */
class Worm(var x: Float, var y: Float, val team: Int, val species: Species) {
    val name: String get() = species.label
    var vx = 0f
    var vy = 0f
    var hp = species.maxHp
    var alive = true
    var drowned = false
    var onGround = false
    var facing = 1

    /** Ammo per [Weapon] ordinal: -1 unlimited, 0 none (or not in this fighter's loadout). */
    val ammo = IntArray(Weapon.entries.size).also { a -> for ((w, n) in species.loadout) a[w.ordinal] = n }
    var weapon = species.loadout.first().first

    /** Mid-pounce: lands (or collides) with a bite. */
    var pouncing = false

    /** Which attack a pounce in progress is using (Mongo's Pounce or the Gargoyle's Stone Dive). */
    var pounceWith = Weapon.POUNCE

    /** Protective Shell: the next hit is blocked. */
    var shield = false

    /** Loadout attacks, then any spells picked up from loot boxes that still have a use left. */
    val available: List<Weapon>
        get() = species.weapons + Weapon.entries.filter { it.spell && ammo[it.ordinal] > 0 }

    // Animation state, advanced by the game and read by the renderer.
    var walkPhase = 0f
    var walkTimer = 0f // > 0 while walking
    var squash = 0f // 0..1, set on landing and decays
    var hitFlash = 0f // > 0 just after taking damage
    var spin = 0f // degrees, while tumbling from a hit

    fun has(w: Weapon) = ammo[w.ordinal] != 0
}

class Projectile(
    val kind: Kind,
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    var fuse: Float,
    val owner: Worm?,
) {
    var age = 0f
    var resting = false
    var dead = false
    var bounced = false

    /** Damage multiplier (blast radius grows with its square root). Changed by gates and passives. */
    var power = 1f

    /** Explodes into healing instead of damage. */
    var healing = false

    /** Ids of gates already passed through, so each gate affects a projectile once. */
    val passed = HashSet<Int>()

    fun copyTraitsFrom(o: Projectile) {
        power = o.power
        healing = o.healing
        passed.addAll(o.passed)
    }
}

/** What a gate does to projectiles passing through it. [MYSTERY] rolls a random outcome, including ones no gate shows. */
enum class GateEffect(val label: String, val color: Int) {
    TRIPLE("×3", 0xFF6AE86A.toInt()),
    PLUS_TWO("+2", 0xFF6AE86A.toInt()),
    BIG("BIG", 0xFFFF9A3A.toInt()),
    TINY("tiny", 0xFF9AA0B0.toInt()),
    FAST("FAST", 0xFF5AD8FF.toInt()),
    SLOW("SLOW", 0xFF5A7AFF.toInt()),
    FLIP("FLIP", 0xFFE05AE0.toInt()),
    MYSTERY("?", 0xFFFFD34A.toInt()),
}

/** A floating portal in the air. Lasts [turnsLeft] more turn starts. */
class Gate(val id: Int, val x: Float, val y: Float, val effect: GateEffect, var turnsLeft: Int) {
    val halfHeight = 30f
    var flash = 0f
}

/**
 * A loot box. Tiers: 0 Bronze, 1 Silver, 2 Gold, 3 Legendary, 4 Fan Box (sent by the audience),
 * 5 Benefactor Box (from a sponsor). Falls until it lands; opened by whoever touches it.
 */
class LootBox(var x: Float, var y: Float, val tier: Int) {
    var vy = 0f
    var landed = false
    var dead = false
}

/** A pop-up from the System AI: an achievement or a loot box opening. */
class Announcement(val header: String, val title: String, val body: String)

/** Sound cues raised by the game logic and played by the view. */
enum class Sfx { THROW, ZAP, KICK, WHIFF, BOOM_BIG, BOOM_SMALL, BOUNCE, JUMP, FALL, ACHIEVEMENT, LOOT, TURN, WIN, GATE, ROAR, SPELL }

object PKind {
    const val FIRE = 0
    const val SMOKE = 1
    const val DIRT = 2
    const val SPARK = 3
    const val RING = 4
    const val SPLASH = 5
    const val CHUNK = 6 // rock debris that bounces off the ground
}

class Particle(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    var life: Float,
    val size: Float,
    val color: Int,
    val kind: Int,
    val gravity: Float,
) {
    val maxLife = life
    var rot = 0f
}

/** Floating text such as damage numbers. [team] picks the colour, -1 for neutral. */
class FloatText(var x: Float, var y: Float, val text: String, val team: Int, var life: Float)
