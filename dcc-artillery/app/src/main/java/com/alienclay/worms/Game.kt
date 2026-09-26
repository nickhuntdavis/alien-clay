package com.alienclay.worms

import java.util.Collections
import java.util.Random
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin

enum class Mode { VS_CPU, TWO_PLAYER }
enum class Phase { BANNER, PLAYING, RETREAT, SETTLING, GAME_OVER }

const val STEP_NONE = 0
const val STEP_HIT = 1
const val STEP_OUT = 2

/**
 * All game rules and physics. Runs on a fixed 1/60 s step and has no Android
 * dependencies, so the AI can replay shots exactly and tests run on the JVM.
 */
class Game(val mode: Mode, seed: Long = System.nanoTime(), generate: Boolean = true) {
    companion object {
        const val W = 1600
        const val H = 760
        const val WATER_Y = 715
        const val G = 520f
        const val R = 9f
        const val WALK_SPEED = 70f
        const val MAX_CLIMB = 6
        const val TURN_TIME = 30f
        const val RETREAT_TIME = 4f
        const val MAX_WIND = 140f
        const val MAX_LAUNCH = 900f
        const val WORMS_PER_TEAM = 3
        const val DT = 1f / 60f
        val TEAM_NAMES = arrayOf("Crawlers", "Floor Mobs")
        const val ANNOUNCE_TIME = 3.6f
        const val START_VIEWERS = 842_000_000L
        private val COS = FloatArray(16) { cos(it * PI * 2 / 16).toFloat() }
        private val SIN = FloatArray(16) { sin(it * PI * 2 / 16).toFloat() }
    }

    val rng = Random(seed)
    val terrain = Terrain(W, H)
    val worms = ArrayList<Worm>()
    val projectiles = ArrayList<Projectile>()
    val particles = ArrayList<Particle>()
    val texts = ArrayList<FloatText>()
    val boxes = ArrayList<LootBox>()

    /** Sound cues for the view to play; it drains this list every frame. */
    val sounds = ArrayList<Sfx>()

    /** Latest System AI pop-up; [announceAge] counts up from when it appeared. */
    var announcement: Announcement? = null
        private set
    var announceAge = 0f
        private set

    /** The show's audience. Goes up with every hit, knockout and loot box. */
    var viewers = START_VIEWERS
        private set

    private var killsThisTurn = 0
    private var cause = SystemAi.BLAST

    /** Worms thrown by an explosion that haven't come to rest yet, most recent hit last. */
    val knocked = ArrayList<Worm>()

    var wind = 0f
    var phase = Phase.BANNER
        private set
    var phaseTime = 0f
        private set
    var turnTime = TURN_TIME
        private set
    var team = 0
        private set
    lateinit var active: Worm
        private set
    var weapon = Weapon.HOB_LOBBER
    private val teamWeapon = arrayOf(Weapon.HOB_LOBBER, Weapon.HOB_LOBBER)
    val ammo = Array(2) { IntArray(Weapon.entries.size) { i -> Weapon.entries[i].startAmmo } }
    private val nextIdx = IntArray(2)

    // Input, written by the view (human) or the AI.
    var moveDir = 0
    var jumpRequested = false
    var aiming = false
    var aimAngle = -0.7f
    var aimPower = 0f

    var shake = 0f
        private set
    var time = 0f
        private set
    /** -1 draw, 0 or 1 winning team; only meaningful in GAME_OVER. */
    var winner = -1
        private set

    private var activeHurt = false
    private val ai = Ai(this)
    private val normal = FloatArray(2)

    init {
        if (generate) {
            terrain.generate(seed, WATER_Y)
            spawnWorms()
            begin(rng.nextInt(2))
        }
    }

    private fun sfx(s: Sfx) {
        if (sounds.size < 16) sounds.add(s)
    }

    private fun announce(a: Announcement) {
        announcement = a
        announceAge = 0f
    }

    fun isCpu(t: Int) = mode == Mode.VS_CPU && t == 1
    val humanTurn: Boolean get() = !isCpu(team)
    fun ammoLeft(w: Weapon) = ammo[team][w.ordinal]
    fun teamHp(t: Int) = worms.filter { it.team == t && it.alive }.sumOf { it.hp }

    fun addWorm(x: Float, y: Float, species: Species): Worm {
        val w = Worm(x, y, species.team, species)
        worms.add(w)
        return w
    }

    fun begin(startTeam: Int) = startTurn(startTeam)

    private fun spawnWorms() {
        val xs = ArrayList<Int>()
        var attempts = 0
        while (xs.size < WORMS_PER_TEAM * 2 && attempts < 4000) {
            attempts++
            val x = 80 + rng.nextInt(W - 160)
            val s = terrain.surfaceAt(x)
            if (s >= WATER_Y - 30 || s < 40) continue
            if (xs.any { abs(it - x) < 100 }) continue
            xs.add(x)
        }
        Collections.shuffle(xs, rng)
        for ((i, x) in xs.withIndex()) {
            val t = i % 2
            var y = terrain.surfaceAt(x) - R - 2
            while (collides(x.toFloat(), y) && y > R) y -= 1f
            val w = addWorm(x.toFloat(), y, Species.ofTeam(t)[i / 2])
            w.facing = if (x < W / 2) 1 else -1
        }
    }

    private fun setPhase(p: Phase) {
        phase = p
        phaseTime = 0f
    }

    private fun startTurn(t: Int) {
        team = t
        val list = worms.filter { it.team == t }
        for (k in list.indices) {
            val w = list[(nextIdx[t] + k) % list.size]
            if (w.alive && !w.drowned) {
                active = w
                nextIdx[t] = (nextIdx[t] + k + 1) % list.size
                break
            }
        }
        wind = (rng.nextFloat() * 2 - 1) * MAX_WIND
        turnTime = TURN_TIME
        aiming = false
        aimPower = 0f
        activeHurt = false
        jumpRequested = false
        aimAngle = if (active.facing > 0) -0.7f else (-PI + 0.7).toFloat()
        weapon = teamWeapon[t]
        if (ammo[t][weapon.ordinal] == 0) weapon = Weapon.HOB_LOBBER
        killsThisTurn = 0
        if (rng.nextFloat() < 0.35f && boxes.size < 3) dropRandomBox()
        setPhase(Phase.BANNER)
        sfx(Sfx.TURN)
        if (isCpu(t)) ai.plan()
    }

    private fun endTurn() {
        if (killsThisTurn >= 2) announce(SystemAi.multiKill(rng))
        val alive = IntArray(2)
        for (w in worms) if (w.alive && !w.drowned) alive[w.team]++
        if (alive[0] == 0 || alive[1] == 0) {
            winner = when {
                alive[0] > 0 -> 0
                alive[1] > 0 -> 1
                else -> -1
            }
            setPhase(Phase.GAME_OVER)
            sfx(Sfx.WIN)
            return
        }
        startTurn(1 - team)
    }

    fun cycleWeapon() {
        if (!humanTurn || (phase != Phase.PLAYING && phase != Phase.BANNER)) return
        val all = Weapon.entries
        var i = weapon.ordinal
        do {
            i = (i + 1) % all.size
        } while (ammo[team][i] == 0)
        weapon = all[i]
        teamWeapon[team] = weapon
    }

    fun selectWeapon(w: Weapon) {
        if (ammo[team][w.ordinal] == 0) return
        weapon = w
        teamWeapon[team] = w
    }

    fun update(dt: Float) {
        time += dt
        phaseTime += dt
        shake = max(0f, shake - dt * 30f)
        when (phase) {
            Phase.BANNER -> if (phaseTime > 1.3f) setPhase(Phase.PLAYING)
            Phase.PLAYING -> {
                turnTime -= dt
                if (isCpu(team)) ai.update(dt)
                if (turnTime <= 0f) {
                    aiming = false
                    setPhase(Phase.SETTLING)
                }
            }
            Phase.RETREAT -> {
                turnTime -= dt
                if (turnTime <= 0f) setPhase(Phase.SETTLING)
            }
            Phase.SETTLING -> if (phaseTime > 0.8f && isSettled()) endTurn()
            Phase.GAME_OVER -> {}
        }

        val control = (phase == Phase.PLAYING || phase == Phase.RETREAT) && active.alive
        for (w in worms) updateWorm(w, dt, control && w === active)
        jumpRequested = false
        updateProjectiles(dt)
        updateBoxes(dt)
        updateParticles(dt)
        knocked.removeAll { it.onGround || it.drowned }

        if ((phase == Phase.PLAYING || phase == Phase.RETREAT) && (!active.alive || activeHurt)) {
            aiming = false
            setPhase(Phase.SETTLING)
        }
    }

    private fun isSettled(): Boolean =
        projectiles.isEmpty() && worms.all { it.drowned || it.onGround } && boxes.all { it.landed }

    // ---------------------------------------------------------------- worms

    fun collides(cx: Float, cy: Float): Boolean {
        for (i in 0 until 16) if (terrain.isSolid(cx + COS[i] * R, cy + SIN[i] * R)) return true
        return terrain.isSolid(cx, cy)
    }

    private fun updateWorm(w: Worm, dt: Float, control: Boolean) {
        if (w.drowned) return
        if (w.onGround) {
            if (control && !aiming && moveDir != 0) walk(w, moveDir, dt)
            if (control && jumpRequested && w.onGround) {
                w.onGround = false
                w.vy = -260f
                w.vx = w.facing * 120f
                sfx(Sfx.JUMP)
                return
            }
            if (w.onGround && !collides(w.x, w.y + 1.5f)) w.onGround = false
            return
        }

        w.vy = min(w.vy + G * dt, 900f)
        val steps = max(1, ceil(max(abs(w.vx), abs(w.vy)) * dt / 1.5f).toInt())
        var i = 0
        while (i < steps && !w.onGround) {
            i++
            val sx = w.vx * dt / steps
            val sy = w.vy * dt / steps
            if (sx != 0f) {
                when {
                    !collides(w.x + sx, w.y) -> w.x += sx
                    !collides(w.x + sx, w.y - 3f) -> { w.x += sx; w.y -= 3f }
                    else -> w.vx = -w.vx * 0.3f
                }
            }
            if (collides(w.x, w.y + sy)) {
                if (w.vy > 0f) {
                    if (w.vy > 380f) {
                        cause = SystemAi.FALL
                        hurt(w, ((w.vy - 380f) / 10f).toInt())
                    }
                    if (w.vy > 220f && abs(w.vx) > 40f) {
                        w.vy = -w.vy * 0.25f
                        w.vx *= 0.5f
                    } else {
                        w.vx = 0f
                        w.vy = 0f
                        w.onGround = true
                    }
                } else {
                    w.vy = 0f
                }
            } else {
                w.y += sy
            }
        }
        if (w.y - R > WATER_Y) drown(w)
    }

    private fun walk(w: Worm, dir: Int, dt: Float) {
        if (w.facing != dir) aimAngle = (PI - aimAngle).toFloat().let { if (it > PI) it - 2 * PI.toFloat() else it }
        w.facing = dir
        val nx = w.x + dir * WALK_SPEED * dt
        for (up in 0..MAX_CLIMB) {
            if (!collides(nx, w.y - up)) {
                w.x = nx
                w.y -= up
                var d = 0
                while (d <= MAX_CLIMB && !collides(w.x, w.y + 1f)) {
                    w.y += 1f
                    d++
                }
                if (!collides(w.x, w.y + 1f)) w.onGround = false // walked off a ledge
                return
            }
        }
    }

    private fun drown(w: Worm) {
        w.drowned = true
        w.onGround = true
        if (w.alive) {
            w.alive = false
            w.hp = 0
            texts.add(FloatText(w.x, WATER_Y - 30f, "Splat!", w.team, 1.6f))
            sfx(Sfx.FALL)
            knockout(w, SystemAi.PIT)
        }
        repeat(14) {
            addParticle(w.x, WATER_Y.toFloat(), (rng.nextFloat() - 0.5f) * 160f, -120f - rng.nextFloat() * 180f,
                0.8f, 2.5f, 0xFFFF7A3A.toInt(), PKind.SPARK, G)
        }
        if (w === active) activeHurt = true
    }

    private fun hurt(w: Worm, dmg: Int) {
        if (!w.alive || dmg <= 0) return
        w.hp -= dmg
        viewers += dmg * 1_500_000L
        texts.add(FloatText(w.x, w.y - 30f, "-$dmg", w.team, 1.4f))
        if (w === active && (phase == Phase.PLAYING || phase == Phase.RETREAT)) activeHurt = true
        if (w.hp <= 0) {
            w.hp = 0
            w.alive = false
            knockout(w, cause)
            repeat(10) {
                addParticle(w.x, w.y, (rng.nextFloat() - 0.5f) * 120f, -rng.nextFloat() * 120f,
                    1.2f, 6f, 0xFFB0A0C0.toInt(), PKind.SMOKE, -20f)
            }
        }
    }

    /** A fighter is out: the System AI comments, the audience grows, and loot may drop. */
    private fun knockout(w: Worm, how: Int) {
        killsThisTurn++
        val ownGoal = w.team == team
        viewers += if (ownGoal) 90_000_000L else if (how == SystemAi.PIT) 60_000_000L else 40_000_000L
        announce(SystemAi.knockout(rng, how, ownGoal))
        sfx(Sfx.ACHIEVEMENT)
        if (how != SystemAi.PIT && rng.nextFloat() < 0.6f) boxes.add(LootBox(w.x, w.y - 6f, rollTier()))
    }

    // ------------------------------------------------------------ loot boxes

    private fun rollTier(): Int {
        val r = rng.nextFloat()
        return if (r < 0.6f) 0 else if (r < 0.9f) 1 else 2
    }

    private fun dropRandomBox() {
        for (attempt in 0 until 40) {
            val x = 60 + rng.nextInt(W - 120)
            val s = terrain.surfaceAt(x)
            if (s < WATER_Y - 30 && worms.none { abs(it.x - x) < 30 }) {
                boxes.add(LootBox(x.toFloat(), -20f, rollTier()))
                texts.add(FloatText(x.toFloat(), 40f, "Loot box incoming!", -1, 2f))
                return
            }
        }
    }

    fun addBox(x: Float, y: Float, tier: Int): LootBox = LootBox(x, y, tier).also { boxes.add(it) }

    private fun updateBoxes(dt: Float) {
        for (b in boxes) {
            if (b.landed) {
                if (!terrain.isSolid(b.x, b.y + 7f)) b.landed = false
            } else {
                b.vy = min(b.vy + G * dt, 220f)
                var fall = b.vy * dt
                while (fall > 0f && !b.landed) {
                    val step = min(1f, fall)
                    if (terrain.isSolid(b.x, b.y + 6f + step)) {
                        b.landed = true
                        b.vy = 0f
                    } else {
                        b.y += step
                    }
                    fall -= step
                }
                if (b.y > WATER_Y) b.dead = true
            }
            if (b.dead) continue
            for (w in worms) {
                if (!w.alive) continue
                val dx = w.x - b.x
                val dy = w.y - b.y
                if (dx * dx + dy * dy < (R + 8f) * (R + 8f)) {
                    openBox(b, w)
                    break
                }
            }
        }
        boxes.removeAll { it.dead }
    }

    private fun openBox(b: LootBox, w: Worm) {
        b.dead = true
        val contents: String
        when (b.tier) {
            0 -> {
                heal(w, 20)
                contents = "Twenty health points. Try not to waste them all at once."
            }
            1 -> {
                val wpn = if (rng.nextBoolean()) Weapon.SCATTER else Weapon.SATCHEL
                ammo[w.team][wpn.ordinal]++
                contents = "One ${wpn.label}. Please point it away from the audience."
            }
            else -> {
                heal(w, 40)
                ammo[w.team][Weapon.SATCHEL.ordinal]++
                ammo[w.team][Weapon.SCATTER.ordinal]++
                contents = "Forty health, a Satchel Charge and a Scatter Charge. Someone up there likes you."
            }
        }
        viewers += 5_000_000L
        announce(SystemAi.loot(b.tier, contents))
        sfx(Sfx.LOOT)
        repeat(12) {
            addParticle(b.x, b.y, (rng.nextFloat() - 0.5f) * 140f, -60f - rng.nextFloat() * 120f,
                0.7f, 2f, 0xFFFFD34A.toInt(), PKind.SPARK, G * 0.5f)
        }
    }

    private fun heal(w: Worm, amount: Int) {
        val gained = min(amount, 100 - w.hp)
        if (gained <= 0) return
        w.hp += gained
        texts.add(FloatText(w.x, w.y - 30f, "+$gained", w.team, 1.4f))
    }

    // ---------------------------------------------------------- projectiles

    private fun windAffected(k: Kind) = k == Kind.LOBBER || k == Kind.SCATTER
    private fun bounces(k: Kind) = k == Kind.POTION || k == Kind.SCATTER || k == Kind.SATCHEL
    private fun contact(k: Kind) = k == Kind.LOBBER || k == Kind.SHARD

    fun makeShot(kind: Kind, shooter: Worm, angle: Float, power: Float, fuse: Float): Projectile {
        val dx = cos(angle)
        val dy = sin(angle)
        val sp = power.coerceIn(0.05f, 1f) * MAX_LAUNCH
        return Projectile(kind, shooter.x + dx * (R + 7f), shooter.y + dy * (R + 7f), dx * sp, dy * sp, fuse, shooter)
    }

    /** Advance one projectile by [dt]. Never changes anything except [p], so it is safe for simulations. */
    fun stepProjectile(p: Projectile, dt: Float, windScale: Float): Int {
        p.age += dt
        if (p.resting) {
            if (terrain.isSolid(p.x, p.y + 3f)) return STEP_NONE
            p.resting = false
        }
        if (windAffected(p.kind)) p.vx += wind * windScale * dt
        p.vy += G * dt
        val dist = hypot(p.vx, p.vy) * dt
        val steps = max(1, ceil(dist / 2f).toInt())
        val sx = p.vx * dt / steps
        val sy = p.vy * dt / steps
        for (i in 0 until steps) {
            val nx = p.x + sx
            val ny = p.y + sy
            if (terrain.isSolid(nx, ny)) {
                if (bounces(p.kind)) {
                    bounce(p, nx, ny)
                    return STEP_NONE
                }
                p.x = nx
                p.y = ny
                return STEP_HIT
            }
            p.x = nx
            p.y = ny
            if (contact(p.kind)) {
                for (w in worms) {
                    if (!w.alive || (w === p.owner && p.age < 0.3f)) continue
                    val dx = w.x - p.x
                    val dy = w.y - p.y
                    if (dx * dx + dy * dy < (R + 3f) * (R + 3f)) return STEP_HIT
                }
            }
            if (p.y > WATER_Y + 4 || p.x < -400 || p.x > W + 400) return STEP_OUT
        }
        return STEP_NONE
    }

    private fun bounce(p: Projectile, hx: Float, hy: Float) {
        terrain.normalAt(hx, hy, normal)
        val nx = normal[0]
        val ny = normal[1]
        val dot = p.vx * nx + p.vy * ny
        if (dot < 0) {
            p.vx -= 2 * dot * nx
            p.vy -= 2 * dot * ny
        }
        val damp = if (p.kind == Kind.SATCHEL) 0.2f else 0.5f
        p.vx *= damp
        p.vy *= damp
        p.bounced = hypot(p.vx, p.vy) > 60f
        if (hypot(p.vx, p.vy) < 40f) {
            p.vx = 0f
            p.vy = 0f
            p.resting = true
        }
    }

    /** Where a contact shot would land, or null if it leaves the map or times out. */
    fun simulateImpact(kind: Kind, shooter: Worm, angle: Float, power: Float): FloatArray? {
        val p = makeShot(kind, shooter, angle, power, 0f)
        var t = 0f
        while (t < 6f) {
            when (stepProjectile(p, DT, 1f)) {
                STEP_HIT -> return floatArrayOf(p.x, p.y)
                STEP_OUT -> return null
            }
            t += DT
        }
        return null
    }

    /** Aim guide for the human player: the first part of the path, ignoring wind. */
    fun previewPath(out: FloatArray): Int {
        if (!weapon.usesPower || aimPower <= 0.02f) return 0
        val kind = when (weapon) {
            Weapon.POTION_BOMB -> Kind.POTION
            Weapon.SCATTER -> Kind.SCATTER
            else -> Kind.LOBBER
        }
        val p = makeShot(kind, active, aimAngle, aimPower, 9f)
        var n = 0
        var frame = 0
        while (n + 1 < out.size && frame < 40) {
            if (stepProjectile(p, DT, 0f) != STEP_NONE) break
            frame++
            if (frame % 3 == 0) {
                out[n++] = p.x
                out[n++] = p.y
            }
        }
        return n / 2
    }

    fun fire(): Boolean {
        if (phase != Phase.PLAYING || !active.alive) return false
        val t = team
        val wpn = weapon
        if (ammo[t][wpn.ordinal] == 0) return false
        val w = active
        when (wpn) {
            Weapon.HOB_LOBBER -> projectiles.add(makeShot(Kind.LOBBER, w, aimAngle, aimPower, 0f))
            Weapon.POTION_BOMB -> projectiles.add(makeShot(Kind.POTION, w, aimAngle, aimPower, 3f))
            Weapon.SCATTER -> projectiles.add(makeShot(Kind.SCATTER, w, aimAngle, aimPower, 3f))
            Weapon.MISSILE -> magicMissile(w, cos(aimAngle), sin(aimAngle))
            Weapon.KICK -> kick(w, cos(aimAngle), sin(aimAngle))
            Weapon.SATCHEL -> projectiles.add(Projectile(Kind.SATCHEL, w.x + w.facing * 4f, w.y, w.facing * 30f, -80f, 4f, w))
        }
        if (wpn.usesPower || wpn == Weapon.SATCHEL) sfx(Sfx.THROW)
        if (ammo[t][wpn.ordinal] > 0) ammo[t][wpn.ordinal]--
        aiming = false
        aimPower = 0f
        setPhase(Phase.RETREAT)
        turnTime = RETREAT_TIME
        return true
    }

    /** Carl's signature move: a short-range kick that launches whoever is in front of the foot. */
    private fun kick(w: Worm, dx: Float, dy: Float) {
        val fx = w.x + dx * 10f
        val fy = w.y + dy * 10f
        var target: Worm? = null
        var best = 22f
        for (o in worms) {
            if (o === w || !o.alive) continue
            val d = hypot(o.x - fx, o.y - fy)
            if (d < best) { best = d; target = o }
        }
        if (target == null) {
            sfx(Sfx.WHIFF)
            repeat(6) {
                addParticle(fx, fy + 6f, dx * 60f + (rng.nextFloat() - 0.5f) * 40f, -20f - rng.nextFloat() * 30f,
                    0.5f, 3f, 0xFF8A7A6A.toInt(), PKind.SMOKE, -10f)
            }
            return
        }
        sfx(Sfx.KICK)
        cause = SystemAi.KICK
        hurt(target, 20)
        target.vx = dx * 520f
        target.vy = min(-300f, dy * 520f - 200f)
        target.onGround = false
        knocked.remove(target)
        knocked.add(target)
        shake = min(18f, shake + 6f)
        addParticle(target.x, target.y, 0f, 0f, 0.25f, 16f, 0xFFFFF6D0.toInt(), PKind.RING, 0f)
    }

    private fun magicMissile(w: Worm, dx: Float, dy: Float) {
        var x = w.x + dx * (R + 2f)
        var y = w.y + dy * (R + 2f)
        var hit = false
        var d = 0f
        loop@ while (d < 900f) {
            x += dx * 2f
            y += dy * 2f
            d += 2f
            if (terrain.isSolid(x, y)) { hit = true; break }
            for (o in worms) {
                if (o === w || !o.alive) continue
                val ex = o.x - x
                val ey = o.y - y
                if (ex * ex + ey * ey < (R + 2f) * (R + 2f)) { hit = true; break@loop }
            }
            if (x < 0 || x > W || y < -200 || y > H) break
        }
        var s = 0f
        while (s < d) {
            val col = if ((s / 10f).toInt() % 2 == 0) 0xFFC08AFF.toInt() else 0xFFFFFFFF.toInt()
            addParticle(w.x + dx * s + (rng.nextFloat() - 0.5f) * 3f, w.y + dy * s + (rng.nextFloat() - 0.5f) * 3f,
                0f, 0f, 0.35f, 2.8f, col, PKind.SPARK, 0f)
            s += 8f
        }
        addParticle(w.x + dx * 12f, w.y + dy * 12f, 0f, 0f, 0.3f, 18f, 0xFFC08AFF.toInt(), PKind.RING, 0f)
        sfx(Sfx.ZAP)
        if (hit) explode(x, y, 16f, 25f)
    }

    private fun updateProjectiles(dt: Float) {
        for (p in ArrayList(projectiles)) {
            if (bounces(p.kind)) {
                p.fuse -= dt
                if (p.fuse <= 0f) {
                    detonate(p)
                    continue
                }
            }
            p.bounced = false
            val step = stepProjectile(p, dt, 1f)
            if (p.bounced) sfx(Sfx.BOUNCE)
            when (step) {
                STEP_HIT -> detonate(p)
                STEP_OUT -> {
                    p.dead = true
                    if (p.y > WATER_Y) repeat(8) {
                        addParticle(p.x, WATER_Y.toFloat(), (rng.nextFloat() - 0.5f) * 100f, -80f - rng.nextFloat() * 120f,
                            0.7f, 2f, 0xFFFF7A3A.toInt(), PKind.SPARK, G)
                    }
                }
            }
            if (p.kind == Kind.LOBBER && !p.dead) {
                addParticle(p.x, p.y, 0f, -10f, 0.4f, 2.5f, 0xFF7A6E62.toInt(), PKind.SMOKE, -10f)
                addParticle(p.x, p.y - 4f, (rng.nextFloat() - 0.5f) * 40f, -rng.nextFloat() * 40f,
                    0.2f, 1.5f, 0xFFFFC04A.toInt(), PKind.SPARK, 0f)
            }
            if (p.kind == Kind.SATCHEL && !p.dead) {
                addParticle(p.x, p.y - 8f, (rng.nextFloat() - 0.5f) * 60f, -rng.nextFloat() * 60f,
                    0.3f, 1.8f, if (rng.nextBoolean()) 0xFFFF4A4A.toInt() else 0xFFFFB0A0.toInt(), PKind.SPARK, 0f)
            }
        }
        projectiles.removeAll { it.dead }
    }

    private fun detonate(p: Projectile) {
        p.dead = true
        when (p.kind) {
            Kind.LOBBER -> explode(p.x, p.y, 44f, 50f)
            Kind.POTION -> explode(p.x, p.y, 44f, 45f)
            Kind.SHARD -> explode(p.x, p.y, 22f, 18f)
            Kind.SATCHEL -> explode(p.x, p.y, 70f, 70f)
            Kind.SCATTER -> {
                explode(p.x, p.y, 28f, 25f)
                repeat(5) {
                    projectiles.add(Projectile(Kind.SHARD, p.x, p.y - 6f,
                        (rng.nextFloat() - 0.5f) * 400f, -220f - rng.nextFloat() * 200f, 0f, null))
                }
            }
        }
    }

    fun explode(x: Float, y: Float, radius: Float, damage: Float) {
        cause = SystemAi.BLAST
        sfx(if (radius >= 40f) Sfx.BOOM_BIG else Sfx.BOOM_SMALL)
        for (b in boxes) {
            if (!b.dead && hypot(b.x - x, b.y - y) < radius + 8f) {
                b.dead = true
                texts.add(FloatText(b.x, b.y - 20f, "Loot destroyed!", -1, 1.4f))
            }
        }
        val dirt = terrain.baseColorAt(x, y + radius * 0.5f).let { if (it == 0) 0xFF5A4A3E.toInt() else it }
        terrain.carve(x, y, radius)
        val reach = radius + 18f
        for (w in worms) {
            if (w.drowned) continue
            val dx = w.x - x
            val dy = w.y - y
            val d = hypot(dx, dy)
            if (d >= reach) continue
            val f = 1f - d / reach
            hurt(w, max(1, (damage * f).roundToInt()))
            val kick = min(650f, 420f * f * (damage / 50f))
            val nx = if (d > 0.01f) dx / d else 0f
            val ny = if (d > 0.01f) dy / d else -1f
            w.vx += nx * kick
            w.vx = w.vx.coerceIn(-700f, 700f)
            w.vy = (w.vy + ny * kick - 160f * f).coerceIn(-800f, 800f)
            w.onGround = false
            knocked.remove(w)
            knocked.add(w)
        }
        for (p in projectiles) {
            if (p.dead) continue
            val d = hypot(p.x - x, p.y - y)
            if (d < reach) {
                p.resting = false
                p.vy -= 150f * (1f - d / reach)
            }
        }
        shake = min(18f, shake + radius / 4f)

        addParticle(x, y, 0f, 0f, 0.35f, radius * 1.1f, 0xFFFFF6D0.toInt(), PKind.RING, 0f)
        repeat(16) {
            val a = rng.nextFloat() * PI.toFloat() * 2
            val sp = (40f + rng.nextFloat() * 160f) * radius / 44f
            val col = if (rng.nextBoolean()) 0xFFFFC04A.toInt() else 0xFFFF6A2A.toInt()
            addParticle(x, y, cos(a) * sp, sin(a) * sp, 0.35f + rng.nextFloat() * 0.35f,
                radius * (0.2f + rng.nextFloat() * 0.25f), col, PKind.FIRE, -30f)
        }
        repeat(8) {
            addParticle(x + (rng.nextFloat() - 0.5f) * radius, y + (rng.nextFloat() - 0.5f) * radius,
                (rng.nextFloat() - 0.5f) * 40f, -20f - rng.nextFloat() * 30f, 1f + rng.nextFloat() * 0.8f,
                radius * 0.3f, 0xFF4A403A.toInt(), PKind.SMOKE, -15f)
        }
        repeat(18) {
            val a = -PI.toFloat() * rng.nextFloat()
            val sp = 120f + rng.nextFloat() * 220f
            addParticle(x, y, cos(a) * sp, sin(a) * sp, 0.8f + rng.nextFloat() * 0.6f,
                2f + rng.nextFloat() * 2f, dirt, PKind.DIRT, G)
        }
    }

    // ------------------------------------------------------------ effects

    private fun addParticle(
        x: Float, y: Float, vx: Float, vy: Float, life: Float, size: Float, color: Int, kind: Int, gravity: Float,
    ) {
        if (particles.size < 700) particles.add(Particle(x, y, vx, vy, life, size, color, kind, gravity))
    }

    private fun updateParticles(dt: Float) {
        announceAge += dt
        val it = particles.iterator()
        while (it.hasNext()) {
            val p = it.next()
            p.life -= dt
            if (p.life <= 0f) { it.remove(); continue }
            p.vy += p.gravity * dt
            p.x += p.vx * dt
            p.y += p.vy * dt
            if (p.kind == PKind.FIRE || p.kind == PKind.SMOKE) {
                p.vx *= 0.96f
                p.vy *= 0.96f
            }
        }
        val tt = texts.iterator()
        while (tt.hasNext()) {
            val t = tt.next()
            t.life -= dt
            t.y -= 22f * dt
            if (t.life <= 0f) tt.remove()
        }
    }
}
