package com.alienclay.worms

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.abs

class GameTest {
    private val ground = 500

    /** Flat map, one worm per team, team 0 to move. */
    private fun flatGame(mode: Mode = Mode.TWO_PLAYER, redX: Float = 400f, blueX: Float = 900f): Game {
        val g = Game(mode, seed = 1L, generate = false)
        g.terrain.fillFlat(ground)
        g.addWorm(redX, ground - Game.R - 1f, 0, "Red")
        g.addWorm(blueX, ground - Game.R - 1f, 1, "Blue")
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
                val hit = g.simulateImpact(Kind.ROCKET, g.active, a, p)
                if (hit != null) {
                    val d = abs(hit[0] - blue.x)
                    if (d < bestD) { bestD = d; best = a to p }
                }
                p += 0.02f
            }
            a += 0.02f
        }
        assertNotNull(best)
        g.aimAngle = best!!.first
        g.aimPower = best.second
        assertTrue(g.fire())
        assertEquals(Phase.RETREAT, g.phase)
        run(g, 4f)
        assertTrue("blue hp ${blue.hp}", blue.hp < 100)
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
