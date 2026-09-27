package com.alienclay.worms

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.abs

class GameTest {
    private val ground = 500

    /** Flat map, one fighter per team, team 0 to move. */
    private fun flatGame(mode: Mode = Mode.TWO_PLAYER, redX: Float = 400f, blueX: Float = 900f): Game {
        val g = Game(mode, seed = 1L, generate = false)
        g.terrain.fillFlat(ground)
        g.addWorm(redX, ground - Game.R - 1f, Species.CARL)
        g.addWorm(blueX, ground - Game.R - 1f, Species.GOBLIN)
        g.begin(0)
        g.wind = 0f
        return g
    }

    private fun run(g: Game, seconds: Float) {
        var t = 0f
        while (t < seconds) {
            g.update(Game.DT)
            t += Game.DT
        }
    }

    @Test
    fun generatedMapSpawnsSixWormsAboveWater() {
        val g = Game(Mode.TWO_PLAYER, seed = 42L)
        assertEquals(6, g.worms.size)
        assertEquals(3, g.worms.count { it.team == 0 })
        for (w in g.worms) assertTrue("${w.name} spawned in water", w.y < Game.WATER_Y)
    }

    @Test
    fun carveRemovesGround() {
        val t = Terrain(200, 200)
        t.fillFlat(100)
        assertTrue(t.isSolid(100, 120))
        t.carve(100f, 120f, 20f)
        assertFalse(t.isSolid(100, 120))
        assertTrue(t.isSolid(100, 190))
    }

    @Test
    fun decorationsOnlyRecolourRock() {
        val t = Terrain(300, 300)
        t.fillFlat(100)
        // Bones and crystals are painted into the rock; they never add or remove ground.
        assertEquals(300 * 200, t.solid.count { it })
        assertTrue(t.crystals.isNotEmpty())
        for (cr in t.crystals) assertTrue(t.isSolid(cr[0], cr[1]))
    }

    @Test
    fun blastingACrystalRemovesItsGlow() {
        val t = Terrain(300, 300)
        t.fillFlat(100)
        val cr = t.crystals.first()
        val before = t.crystals.size
        t.carve(cr[0].toFloat(), cr[1].toFloat(), 10f)
        assertTrue(t.crystals.size < before)
        assertFalse(t.crystals.any { it[0] == cr[0] && it[1] == cr[1] })
    }

    @Test
    fun wormFallsAndLandsOnGround() {
        val g = flatGame()
        val w = g.worms[0]
        w.y = 300f
        w.onGround = false
        run(g, 3f)
        assertTrue(w.onGround)
        assertTrue(abs(w.y - (ground - Game.R - 1f)) < 3f)
    }

    @Test
    fun walkingMovesTheActiveWorm() {
        val g = flatGame()
        run(g, 1.5f) // past the turn banner
        val start = g.active.x
        g.moveDir = 1
        run(g, 1f)
        assertTrue(g.active.x > start + 50f)
    }

    @Test
    fun rocketHitDamagesEnemyAndEndsInRetreat() {
        val g = flatGame(redX = 400f, blueX = 700f)
        run(g, 1.5f)
        assertEquals(Phase.PLAYING, g.phase)
        val blue = g.worms[1]
        // Find a shot that lands on the blue worm with the same physics the game uses.
        var best: Pair<Float, Float>? = null
        var bestD = Float.MAX_VALUE
        var a = -1.5f
        while (a < 0f) {
            var p = 0.3f
            while (p <= 1f) {
                val hit = g.simulateImpact(Kind.LOBBER, g.active, a, p)
                if (hit != null) {
                    val d = abs(hit[0] - blue.x)
                    if (d < bestD) { bestD = d; best = a to p }
                }
                p += 0.02f
            }
            a += 0.02f
        }
        assertNotNull(best)
        g.selectWeapon(Weapon.HOB_LOBBER)
        g.aimAngle = best!!.first
        g.aimPower = best.second
        assertTrue(g.fire())
        assertEquals(Phase.RETREAT, g.phase)
        run(g, 4f)
        assertTrue("blue hp ${blue.hp}", blue.hp < Species.GOBLIN.maxHp)
    }

    @Test
    fun cpuFindsAShotNearItsTarget() {
        val g = flatGame(mode = Mode.VS_CPU, redX = 500f, blueX = 1100f)
        // Hand the turn to the CPU (team 1) by ending red's turn.
        run(g, 1.5f)
        g.aimPower = 0.05f
        g.aimAngle = -PI_HALF
        g.fire()
        var guard = 0
        while (g.team != 1 && guard++ < 1200) g.update(Game.DT)
        assertEquals(1, g.team)
        val ai = Ai(g)
        ai.plan(noise = false)
        val impact = ai.plannedImpact
        assertNotNull(impact)
        val red = g.worms[0]
        assertTrue("impact at ${impact!![0]}, red at ${red.x}", abs(impact[0] - red.x) < 40f)
    }

    @Test
    fun blastThrownWormIsTrackedUntilItLands() {
        val g = flatGame()
        run(g, 1.5f)
        val blue = g.worms[1]
        g.explode(blue.x - 20f, blue.y + 5f, 30f, 40f)
        assertEquals(listOf(blue), g.knocked)
        g.update(Game.DT)
        assertFalse(blue.onGround)
        assertEquals(listOf(blue), g.knocked)
        run(g, 5f)
        assertTrue(blue.onGround || blue.drowned)
        assertTrue(g.knocked.isEmpty())
    }

    @Test
    fun eachTeamFieldsItsThreeFighters() {
        val g = Game(Mode.TWO_PLAYER, seed = 7L)
        assertEquals((Floor.ONE.crawlers + Floor.ONE.mobs).toSet(), g.worms.map { it.species }.toSet())
        for (w in g.worms) assertEquals(w.species.team, w.team)
    }

    @Test
    fun fallingInThePitTriggersAnAchievement() {
        val g = flatGame()
        run(g, 1.5f)
        val blue = g.worms[1]
        blue.y = Game.WATER_Y + 20f
        blue.onGround = false
        g.update(Game.DT)
        assertTrue(blue.drowned)
        assertEquals("NEW ACHIEVEMENT!", g.announcement!!.header)
        assertTrue(g.viewers > Game.START_VIEWERS)
        assertTrue(Sfx.FALL in g.sounds)
    }

    @Test
    fun kickLaunchesANearbyEnemy() {
        val g = flatGame(redX = 400f, blueX = 418f)
        run(g, 1.5f)
        val blue = g.worms[1]
        g.selectWeapon(Weapon.KICK)
        g.aimAngle = -0.3f
        g.aimPower = 1f
        assertTrue(g.fire())
        assertEquals(Species.GOBLIN.maxHp - Weapon.KICK.damage.toInt(), blue.hp)
        assertFalse(blue.onGround)
        assertTrue(blue.vx > 300f)
        assertEquals(blue, g.knocked.last())
    }

    @Test
    fun kickAtNothingJustWhiffs() {
        val g = flatGame(redX = 400f, blueX = 900f)
        run(g, 1.5f)
        g.selectWeapon(Weapon.KICK)
        g.aimPower = 1f
        assertTrue(g.fire())
        assertEquals(Species.GOBLIN.maxHp, g.worms[1].hp)
        assertTrue(Sfx.WHIFF in g.sounds)
    }

    @Test
    fun walkingIntoALootBoxOpensIt() {
        val g = flatGame()
        run(g, 1.5f)
        val red = g.worms[0]
        red.hp = 50
        g.boxes.clear()
        g.addBox(red.x + 30f, ground - 7f, 0)
        g.moveDir = 1
        run(g, 1f)
        assertTrue(g.boxes.isEmpty())
        assertEquals(75, red.hp)
        assertEquals("LOOT BOX OPENED", g.announcement!!.header)
    }

    @Test
    fun silverBoxAddsLimitedAmmo() {
        val g = flatGame()
        run(g, 1.5f)
        val red = g.worms[0]
        g.boxes.clear()
        // A silver box holds either one more of Carl's only limited attack (the Satchel Charge) or a common spell.
        val before = red.ammo[Weapon.SATCHEL.ordinal]
        g.addBox(red.x, red.y, 1)
        g.update(Game.DT)
        val spells = listOf(Weapon.HEAL_POTION, Weapon.PROTECTIVE_SHELL, Weapon.TELEPORT)
        assertTrue(red.ammo[Weapon.SATCHEL.ordinal] == before + 1 || spells.any { red.ammo[it.ordinal] == 1 })
    }

    // ------------------------------------------------------------ gates

    /** A projectile flying right along y = 300 and a gate in its path at x = 520. */
    private fun gateSetup(effect: GateEffect): Pair<Game, Projectile> {
        val g = flatGame()
        run(g, 1.5f)
        g.gates.clear()
        val p = Projectile(Kind.LOBBER, 500f, 300f, 300f, 0f, 0f, null)
        g.projectiles.add(p)
        g.addGate(520f, 300f, effect)
        return g to p
    }

    @Test
    fun tripleGateMultipliesProjectiles() {
        val (g, _) = gateSetup(GateEffect.TRIPLE)
        repeat(10) { g.update(Game.DT) }
        assertEquals(3, g.projectiles.size)
    }

    @Test
    fun bigGatePowersUpAProjectile() {
        val (g, p) = gateSetup(GateEffect.BIG)
        repeat(10) { g.update(Game.DT) }
        assertEquals(1.7f, p.power, 0.001f)
    }

    @Test
    fun aGateOnlyAffectsAProjectileOnce() {
        val (g, p) = gateSetup(GateEffect.FLIP)
        repeat(30) { g.update(Game.DT) }
        assertTrue("flipped back across the gate, still heading left", p.vx < 0f)
        assertEquals(1, p.passed.size)
    }

    @Test
    fun gatesExpireAfterTheirTurns() {
        val g = flatGame()
        g.gates.clear()
        val gate = g.addGate(800f, 200f, GateEffect.FAST)
        gate.turnsLeft = 1
        g.begin(1)
        assertFalse(gate in g.gates)
    }

    // --------------------------------------------------- fighters and moves

    @Test
    fun fightersOnlyUseTheirOwnAttacks() {
        val g = flatGame()
        run(g, 1.5f)
        assertEquals(Species.CARL, g.active.species)
        g.selectWeapon(Weapon.POUNCE)
        assertTrue(g.weapon != Weapon.POUNCE)
        g.selectWeapon(Weapon.HOB_LOBBER)
        assertEquals(Weapon.HOB_LOBBER, g.weapon)
    }

    @Test
    fun donutLandsOnHerFeet() {
        val g = Game(Mode.TWO_PLAYER, seed = 1L, generate = false)
        g.terrain.fillFlat(ground)
        val donut = g.addWorm(400f, 60f, Species.DONUT)
        g.addWorm(900f, ground - Game.R - 1f, Species.GOBLIN)
        g.begin(1)
        run(g, 3f)
        assertTrue(donut.onGround)
        assertEquals(Species.DONUT.maxHp, donut.hp)
    }

    @Test
    fun mongoPouncesOntoAnEnemy() {
        val g = Game(Mode.TWO_PLAYER, seed = 1L, generate = false)
        g.terrain.fillFlat(ground)
        g.addWorm(400f, ground - Game.R - 1f, Species.MONGO)
        val goblin = g.addWorm(520f, ground - Game.R - 1f, Species.GOBLIN)
        g.begin(0)
        g.wind = 0f
        run(g, 1.5f)
        g.selectWeapon(Weapon.POUNCE)
        var best = 0.5f
        var bestD = Float.MAX_VALUE
        var pw = 0.2f
        while (pw <= 1f) {
            val hit = g.simulateImpact(Kind.KNIFE, g.active, -0.8f, pw, 0f, Weapon.POUNCE.launch)
            if (hit != null && abs(hit[0] - goblin.x) < bestD) { bestD = abs(hit[0] - goblin.x); best = pw }
            pw += 0.01f
        }
        g.aimAngle = -0.8f
        g.aimPower = best
        assertTrue(g.fire())
        run(g, 3f)
        assertTrue("goblin hp ${goblin.hp}", goblin.hp < Species.GOBLIN.maxHp)
    }

    @Test
    fun roarPushesEnemiesAwayAndUsesAmmo() {
        val g = Game(Mode.TWO_PLAYER, seed = 1L, generate = false)
        g.terrain.fillFlat(ground)
        val mongo = g.addWorm(400f, ground - Game.R - 1f, Species.MONGO)
        val goblin = g.addWorm(440f, ground - Game.R - 1f, Species.GOBLIN)
        g.begin(0)
        run(g, 1.5f)
        g.selectWeapon(Weapon.ROAR)
        g.aimPower = 1f
        assertTrue(g.fire())
        assertTrue(goblin.vx > 0f)
        assertFalse(goblin.onGround)
        assertEquals(1, mongo.ammo[Weapon.ROAR.ordinal])
    }

    // ------------------------------------------------------------ animation

    @Test
    fun landingSquashesAndWalkingAdvancesTheCycle() {
        val g = flatGame()
        val red = g.worms[0]
        red.y = 380f
        red.onGround = false
        var squashed = false
        repeat(180) { g.update(Game.DT); if (red.squash > 0.2f) squashed = true }
        assertTrue(squashed)
        run(g, 1.5f)
        val phase = red.walkPhase
        g.moveDir = 1
        run(g, 0.5f)
        assertTrue(red.walkPhase > phase)
        assertTrue(red.walkTimer > 0f)
    }

    @Test
    fun explosionsFlashTheScreenAndThrowBouncingRock() {
        val g = flatGame()
        run(g, 1.5f)
        g.explode(700f, ground.toFloat(), 40f, 30f)
        assertTrue(g.flash > 0f)
        val chunks = g.particles.filter { it.kind == PKind.CHUNK }
        assertTrue(chunks.isNotEmpty())
        run(g, 1.5f)
        // Rock comes to rest on the floor (in or around the crater) rather than falling through it.
        for (p in g.particles.filter { it.kind == PKind.CHUNK }) assertTrue("chunk at y=${p.y}", p.y < ground + 45f)
    }

    @Test
    fun takingDamageFlashesTheFighter() {
        val g = flatGame()
        run(g, 1.5f)
        val blue = g.worms[1]
        g.explode(blue.x + 20f, blue.y, 20f, 20f)
        assertTrue(blue.hitFlash > 0f)
    }

    // ------------------------------------------------------- floors & spells

    @Test
    fun eachFloorFieldsItsOwnRoster() {
        for (f in Floor.entries) {
            val g = Game(Mode.TWO_PLAYER, seed = 11L, floor = f)
            assertEquals((f.crawlers + f.mobs).toSet(), g.worms.map { it.species }.toSet())
            for (w in g.worms) assertTrue("${w.name} on floor ${f.number} spawned in the pit", w.y < g.pitY)
        }
    }

    @Test
    fun theFloorCollapsesAndSwallowsLowGround() {
        val g = flatGame()
        val start = g.pitY
        repeat(Floor.ONE.collapseTurn + 2) { g.begin(it % 2) }
        assertTrue(g.pitY < start)
        assertEquals("FLOOR 1 COLLAPSING", g.announcement!!.header)
        // Raise the pit above the floor and everyone standing on it is lost.
        repeat(40) { g.begin(it % 2) }
        g.update(Game.DT)
        assertTrue(g.worms.all { it.drowned })
    }

    private fun castBy(g: Game, spell: Weapon): Worm {
        val me = g.active
        me.ammo[spell.ordinal] = 1
        g.selectWeapon(spell)
        assertEquals(spell, g.weapon)
        return me
    }

    @Test
    fun spellsAppearInTheLoadoutAndAreUsedUp() {
        val g = flatGame()
        run(g, 1.5f)
        castBy(g, Weapon.HEAL_POTION)
        assertTrue(Weapon.HEAL_POTION in g.loadout)
        g.active.hp = 40
        g.aimPower = 1f
        assertTrue(g.fire())
        assertEquals(90, g.active.hp)
        assertFalse(Weapon.HEAL_POTION in g.loadout)
        assertTrue("falls back to a real attack", g.weapon in g.active.species.weapons)
    }

    @Test
    fun protectiveShellBlocksTheNextHit() {
        val g = flatGame()
        run(g, 1.5f)
        val me = castBy(g, Weapon.PROTECTIVE_SHELL)
        g.aimPower = 1f
        g.fire()
        assertTrue(me.shield)
        val hp = me.hp
        g.explode(me.x + 10f, me.y, 20f, 40f)
        assertEquals(hp, me.hp)
        assertFalse(me.shield)
    }

    @Test
    fun barrageDropsFiveBombsNearTheTarget() {
        val g = flatGame()
        run(g, 1.5f)
        castBy(g, Weapon.BARRAGE)
        g.aimAngle = 0f
        g.aimPower = 0.5f
        g.fire()
        assertEquals(5, g.projectiles.size)
        val target = g.barrageTarget(g.active, 1f, 0.5f)
        for (p in g.projectiles) assertTrue(abs(p.x - target) < 70f)
    }

    @Test
    fun earthquakeHurtsEveryoneElse() {
        val g = flatGame()
        run(g, 1.5f)
        val me = castBy(g, Weapon.EARTHQUAKE)
        g.aimPower = 1f
        g.fire()
        assertEquals(Species.CARL.maxHp, me.hp)
        assertTrue(g.worms[1].hp < Species.GOBLIN.maxHp)
    }

    @Test
    fun blinkMovesTheCaster() {
        val g = flatGame()
        run(g, 1.5f)
        val me = castBy(g, Weapon.TELEPORT)
        val x0 = me.x
        g.aimAngle = -0.8f
        g.aimPower = 0.6f
        g.fire()
        assertTrue(abs(me.x - x0) > 100f)
        run(g, 1f)
        assertTrue(me.onGround && me.alive)
    }

    @Test
    fun katiaRaisesABarricade() {
        val g = Game(Mode.TWO_PLAYER, seed = 1L, generate = false)
        g.terrain.fillFlat(ground)
        val katia = g.addWorm(400f, ground - Game.R - 1f, Species.KATIA)
        g.addWorm(900f, ground - Game.R - 1f, Species.GOBLIN)
        g.begin(0)
        run(g, 1.5f)
        katia.facing = 1
        g.selectWeapon(Weapon.BARRICADE)
        g.aimPower = 1f
        assertTrue(g.fire())
        assertTrue(g.terrain.isSolid(422, ground - 30))
    }

    @Test
    fun bossesShrugOffKnockback() {
        val g = Game(Mode.TWO_PLAYER, seed = 1L, generate = false)
        g.terrain.fillFlat(ground)
        val goblin = g.addWorm(400f, ground - Game.R - 1f, Species.GOBLIN)
        val golem = g.addWorm(900f, ground - Game.R - 1f, Species.MAGMA_GOLEM)
        g.begin(1) // both are mobs
        g.explode(goblin.x - 20f, goblin.y, 20f, 30f)
        g.explode(golem.x - 20f, golem.y, 20f, 30f)
        assertTrue(abs(golem.vx) < abs(goblin.vx) * 0.6f)
    }

    @Test
    fun bigAudiencesSendFanBoxes() {
        val g = flatGame()
        run(g, 1.5f)
        g.boxes.clear()
        // Enough damage to push the audience past the first milestone.
        repeat(3) { g.explode(g.worms[1].x, g.worms[1].y, 10f, 5f) }
        var guard = 0
        while (g.viewers < Game.START_VIEWERS + Game.FAN_BOX_EVERY && guard++ < 200) g.explode(1200f, ground.toFloat(), 10f, 1f)
        g.worms[1].hp = 1000
        g.explode(g.worms[1].x, g.worms[1].y, 30f, 200f)
        g.update(Game.DT)
        assertTrue(g.boxes.any { it.tier == 4 })
    }

    @Test
    fun legendaryBoxesGrantALegendarySpell() {
        val g = flatGame()
        run(g, 1.5f)
        val red = g.worms[0]
        g.boxes.clear()
        g.addBox(red.x, red.y, 3)
        g.update(Game.DT)
        assertTrue(red.ammo[Weapon.NUKE.ordinal] == 1 || red.ammo[Weapon.EARTHQUAKE.ordinal] == 1)
    }

    @Test
    fun cpuCanPlanWithSpells() {
        val g = flatGame(mode = Mode.VS_CPU, redX = 500f, blueX = 1100f)
        run(g, 1.5f)
        g.aimPower = 0.05f
        g.aimAngle = -PI_HALF
        g.fire()
        var guard = 0
        while (g.team != 1 && guard++ < 1200) g.update(Game.DT)
        val cpu = g.active
        for (spell in Weapon.entries.filter { it.spell }) cpu.ammo[spell.ordinal] = 1
        cpu.hp = 20
        val ai = Ai(g)
        ai.plan(noise = false)
        assertTrue(ai.plannedWeapon in cpu.available)
    }

    @Test
    fun lastTeamStandingWins() {
        val g = flatGame()
        run(g, 1.5f)
        g.worms[1].x = g.worms[0].x + 20f
        g.explode(g.worms[1].x, g.worms[1].y, 30f, 500f)
        run(g, 10f)
        assertEquals(g.worms.joinToString { "${it.name} ${it.x},${it.y} v=${it.vx},${it.vy} g=${it.onGround} d=${it.drowned} p=${g.projectiles.size}" }, Phase.GAME_OVER, g.phase)
    }

    companion object {
        private const val PI_HALF = (Math.PI / 2).toFloat()
    }
}
