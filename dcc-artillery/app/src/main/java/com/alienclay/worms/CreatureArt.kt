package com.alienclay.worms

import android.graphics.Canvas
import android.graphics.LightingColorFilter
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import kotlin.math.sin

/**
 * Draws the six fighters with Canvas primitives, in world units.
 * (x, y) is the collision centre; feet sit at y + [Game.R]. [f] is facing (+1 right, -1 left).
 */
class CreatureArt {
    private val fill = Paint(Paint.ANTI_ALIAS_FLAG)
    private val line = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }
    private val path = Path()
    private val r = RectF()
    private val flashFilter = LightingColorFilter(0xFF808080.toInt(), 0x007F7F7F)

    // Per-draw animation inputs.
    private var step = 0f // leg swing, -1..1 scaled per creature
    private var blink = false

    /**
     * [walk] is the walk-cycle phase (radians) and [walking] 0..1 how much of it to show.
     * [blinking] closes the eyes; [flash] washes the whole figure towards white.
     */
    fun draw(
        c: Canvas, s: Species, x: Float, y: Float, f: Float, t: Float, airborne: Boolean,
        walk: Float = 0f, walking: Float = 0f, blinking: Boolean = false, flash: Boolean = false,
    ) {
        step = sin(walk) * walking
        blink = blinking
        val filter = if (flash) flashFilter else null
        fill.colorFilter = filter
        line.colorFilter = filter
        when (s) {
            Species.CARL -> carl(c, x, y, f, airborne)
            Species.DONUT -> donut(c, x, y, f, t)
            Species.MONGO -> mongo(c, x, y, f, t, airborne)
            Species.GOBLIN -> goblin(c, x, y, f)
            Species.HOBGOBLIN -> hobgoblin(c, x, y, f)
            Species.OGRE -> ogre(c, x, y, f)
            Species.KATIA -> katia(c, x, y, f, t)
            Species.KRAKEN -> kraken(c, x, y, f, t)
            Species.GARGOYLE -> gargoyle(c, x, y, f, t, airborne)
            Species.MAGMA_GOLEM -> golem(c, x, y, f, t)
        }
        fill.colorFilter = null
        line.colorFilter = null
    }

    /** Leather jacket, boxer shorts, bare feet. */
    private fun carl(c: Canvas, x: Float, y: Float, f: Float, airborne: Boolean) {
        val skin = 0xFFE8B894.toInt()
        val spread = if (airborne) 1.5f else 0f
        val l = -spread + step * 2f // left leg offset
        val rr = spread - step * 2f
        fill.color = skin
        c.drawRect(x - 4f + l, y + 3f, x - 1.6f + l, y + 8.5f, fill) // legs
        c.drawRect(x + 1.6f + rr, y + 3f, x + 4f + rr, y + 8.5f, fill)
        oval(c, x - 4.5f + l + f * 1.2f, y + 7.5f, x - 0.8f + l + f * 1.2f, y + 9.8f, skin) // bare feet
        oval(c, x + 0.8f + rr + f * 1.2f, y + 7.5f, x + 4.5f + rr + f * 1.2f, y + 9.8f, skin)
        // Boxers with polka dots
        fill.color = 0xFFD63A3A.toInt()
        r.set(x - 5f, y - 1.5f, x + 5f, y + 4.5f)
        c.drawRoundRect(r, 1.5f, 1.5f, fill)
        dot(c, x - 2.5f, y + 0.5f, 0.7f, 0xFFFFFFFF.toInt())
        dot(c, x + 1.5f, y + 2.5f, 0.7f, 0xFFFFFFFF.toInt())
        dot(c, x + 3f, y - 0.2f, 0.7f, 0xFFFFFFFF.toInt())
        // Jacket, open over the chest
        oval(c, x - 8.5f, y - 8.5f, x - 4.5f, y + 1f, 0xFF5A3A26.toInt()) // sleeves
        oval(c, x + 4.5f, y - 8.5f, x + 8.5f, y + 1f, 0xFF5A3A26.toInt())
        fill.color = 0xFF6A4630.toInt()
        r.set(x - 6f, y - 9.5f, x + 6f, y)
        c.drawRoundRect(r, 2.5f, 2.5f, fill)
        fill.color = skin
        c.drawRect(x - 1.3f + f * 0.8f, y - 9f, x + 1.3f + f * 0.8f, y - 1f, fill)
        dot(c, x - 7f, y + 1f, 1.4f, skin) // hands
        dot(c, x + 7f, y + 1f, 1.4f, skin)
        // Head
        dot(c, x + f * 0.6f, y - 13f, 4.3f, skin)
        fill.color = 0xFF4A2E1A.toInt()
        r.set(x + f * 0.6f - 4.5f, y - 17.8f, x + f * 0.6f + 4.5f, y - 11.5f)
        c.drawArc(r, 180f, 180f, true, fill) // hair
        fill.color = 0x55402A1A
        r.set(x + f * 0.6f - 3.6f, y - 12.5f, x + f * 0.6f + 3.6f, y - 8.8f)
        c.drawArc(r, 0f, 180f, true, fill) // stubble
        eye(c, x + f * 2.6f, y - 13.3f, 0.9f, 0xFF1A1008.toInt())
        eye(c, x + f * 0.2f, y - 13.3f, 0.9f, 0xFF1A1008.toInt())
    }

    /** A very fluffy show cat with a tiara. */
    private fun donut(c: Canvas, x: Float, y: Float, f: Float, t: Float) {
        val fur = 0xFFF2E2C6.toInt()
        val shade = 0xFFD9C09A.toInt()
        // Plumed tail
        val sway = sin(t * 3f) * 1.5f
        line.color = fur
        line.strokeWidth = 4.5f
        path.reset()
        path.moveTo(x - f * 6f, y + 5f)
        path.quadTo(x - f * 13f, y + 2f, x - f * (11f + sway), y - 6f)
        c.drawPath(path, line)
        // Body and paws
        oval(c, x - 8.5f, y - 3f, x + 8.5f, y + 9f, fur)
        oval(c, x - 5f + step * 1.5f, y + 6.5f, x - 1f + step * 1.5f, y + 9.8f, shade)
        oval(c, x + 1f - step * 1.5f, y + 6.5f, x + 5f - step * 1.5f, y + 9.8f, shade)
        // Head with ears
        val hx = x + f * 3f
        val hy = y - 7f
        for (s in floatArrayOf(-1f, 1f)) {
            path.reset()
            path.moveTo(hx + s * 5.5f, hy - 2f)
            path.lineTo(hx + s * 2f, hy - 5f)
            path.lineTo(hx + s * 5.8f, hy - 8f)
            path.close()
            fill.color = fur
            c.drawPath(path, fill)
        }
        dot(c, hx, hy, 6.5f, fur)
        oval(c, hx - 3.5f + f, hy - 0.5f, hx + 3.5f + f, hy + 4f, shade) // flat Persian face
        eye(c, hx + f - 2.4f, hy - 1f, 1.7f, 0xFFE08A2A.toInt()) // copper eyes
        eye(c, hx + f + 2.4f, hy - 1f, 1.7f, 0xFFE08A2A.toInt())
        eye(c, hx + f - 2.4f, hy - 1f, 0.8f, 0xFF1A1008.toInt())
        eye(c, hx + f + 2.4f, hy - 1f, 0.8f, 0xFF1A1008.toInt())
        dot(c, hx + f, hy + 1.6f, 0.8f, 0xFFD27A8A.toInt()) // nose
        // Tiara
        path.reset()
        path.moveTo(hx - 3.5f, hy - 5f)
        path.lineTo(hx - 2.5f, hy - 8f)
        path.lineTo(hx - 1f, hy - 6f)
        path.lineTo(hx, hy - 9.5f)
        path.lineTo(hx + 1f, hy - 6f)
        path.lineTo(hx + 2.5f, hy - 8f)
        path.lineTo(hx + 3.5f, hy - 5f)
        path.close()
        fill.color = 0xFFFFD34A.toInt()
        c.drawPath(path, fill)
        dot(c, hx, hy - 7f, 0.9f, 0xFFFF5AA0.toInt())
    }

    /** A small, excitable dinosaur with a red collar. */
    private fun mongo(c: Canvas, x: Float, y: Float, f: Float, t: Float, airborne: Boolean) {
        val green = 0xFF5E8A4E.toInt()
        val dark = 0xFF3E6232.toInt()
        val step = if (airborne) 0f else this.step * 2f
        // Tail
        path.reset()
        path.moveTo(x - f * 3f, y - 3f)
        path.lineTo(x - f * 15f, y - 6f + step * 0.5f)
        path.lineTo(x - f * 3f, y + 3f)
        path.close()
        fill.color = green
        c.drawPath(path, fill)
        // Legs
        fill.color = dark
        c.drawRect(x - 3f + step, y + 2f, x - 1f + step, y + 9f, fill)
        c.drawRect(x + 1f - step, y + 2f, x + 3f - step, y + 9f, fill)
        oval(c, x - 3.5f + step + f, y + 8f, x + 0.5f + step + f, y + 9.8f, dark)
        oval(c, x + 0.5f - step + f, y + 8f, x + 4.5f - step + f, y + 9.8f, dark)
        // Body
        oval(c, x - 7f, y - 6f, x + 7f, y + 4f, green)
        for (i in 0..2) {
            fill.color = dark
            val sx = x - f * (4f - i * 3f)
            c.drawRect(sx - 0.6f, y - 5.5f, sx + 0.6f, y - 1.5f, fill) // stripes
        }
        // Neck and head
        oval(c, x + f * 3f - 3f, y - 11f, x + f * 3f + 3f, y - 2f, green)
        oval(c, x + f * 6f - 5f, y - 14f, x + f * 6f + 5f, y - 8f, green)
        fill.color = 0xFFD63A3A.toInt()
        c.drawRect(x + f * 3f - 3f, y - 6f, x + f * 3f + 3f, y - 4.5f, fill) // collar
        eye(c, x + f * 6f, y - 12f, 1.3f, 0xFFFFE070.toInt())
        eye(c, x + f * 6.4f, y - 12f, 0.6f, 0xFF101010.toInt())
        fill.color = 0xFFF4F0E0.toInt()
        for (i in 0..2) {
            val tx = x + f * (8f + i * 1.3f)
            path.reset()
            path.moveTo(tx - 0.5f, y - 9f)
            path.lineTo(tx + 0.5f, y - 9f)
            path.lineTo(tx, y - 7.8f)
            path.close()
            c.drawPath(path, fill) // teeth
        }
        // Tiny arms
        line.color = dark
        line.strokeWidth = 1.2f
        c.drawLine(x + f * 5f, y - 2f, x + f * 7.5f, y, line)
    }

    private fun goblin(c: Canvas, x: Float, y: Float, f: Float) {
        val skin = 0xFF6FA04A.toInt()
        fill.color = 0xFF4E7A34.toInt()
        c.drawRect(x - 3.5f + step * 2f, y + 3f, x - 1.5f + step * 2f, y + 9.5f, fill)
        c.drawRect(x + 1.5f - step * 2f, y + 3f, x + 3.5f - step * 2f, y + 9.5f, fill)
        // Dagger held forward
        fill.color = 0xFFC8CCD4.toInt()
        path.reset()
        path.moveTo(x + f * 7f, y - 1f)
        path.lineTo(x + f * 13f, y - 3f)
        path.lineTo(x + f * 7f, y + 1f)
        path.close()
        c.drawPath(path, fill)
        oval(c, x - 5.5f, y - 5f, x + 5.5f, y + 5f, skin)
        fill.color = 0xFF7A5634.toInt()
        c.drawRect(x - 5f, y + 1f, x + 5f, y + 4.5f, fill) // loincloth
        dot(c, x + f * 6.5f, y, 1.5f, skin) // hand
        // Head with big ears
        for (s in floatArrayOf(-1f, 1f)) {
            path.reset()
            path.moveTo(x + s * 3f, y - 11f)
            path.lineTo(x + s * 11f, y - 14f)
            path.lineTo(x + s * 4f, y - 7f)
            path.close()
            fill.color = skin
            c.drawPath(path, fill)
        }
        dot(c, x + f, y - 10f, 5f, skin)
        oval(c, x + f * 5f - 2.2f, y - 10f, x + f * 5f + 2.2f, y - 7f, 0xFF5E8A3E.toInt()) // nose
        eye(c, x + f * 2.5f - 1.8f, y - 11.5f, 1.2f, 0xFFFFE070.toInt())
        eye(c, x + f * 2.5f + 1.8f, y - 11.5f, 1.2f, 0xFFFFE070.toInt())
        eye(c, x + f * 2.9f - 1.8f, y - 11.5f, 0.5f, 0xFF101010.toInt())
        eye(c, x + f * 2.9f + 1.8f, y - 11.5f, 0.5f, 0xFF101010.toInt())
    }

    private fun hobgoblin(c: Canvas, x: Float, y: Float, f: Float) {
        val skin = 0xFFB0603A.toInt()
        val iron = 0xFF6E747C.toInt()
        fill.color = 0xFF4A3A30.toInt()
        c.drawRect(x - 4f + step * 2f, y + 3f, x - 1.5f + step * 2f, y + 9.5f, fill)
        c.drawRect(x + 1.5f - step * 2f, y + 3f, x + 4f - step * 2f, y + 9.5f, fill)
        oval(c, x - 9f, y - 7f, x - 5f, y + 3f, skin) // arms
        oval(c, x + 5f, y - 7f, x + 9f, y + 3f, skin)
        fill.color = iron
        r.set(x - 6.5f, y - 8f, x + 6.5f, y + 4f)
        c.drawRoundRect(r, 3f, 3f, fill) // breastplate
        fill.color = 0xFF565B62.toInt()
        c.drawRect(x - 6.5f, y - 3f, x + 6.5f, y - 2f, fill)
        // Head, tusks, helmet
        dot(c, x + f, y - 11.5f, 4.8f, skin)
        fill.color = 0xFFF4F0E0.toInt()
        c.drawRect(x + f * 1f - 2.8f, y - 9.5f, x + f * 1f - 1.8f, y - 7.5f, fill)
        c.drawRect(x + f * 1f + 1.8f, y - 9.5f, x + f * 1f + 2.8f, y - 7.5f, fill)
        fill.color = iron
        r.set(x + f - 5.5f, y - 18f, x + f + 5.5f, y - 11f)
        c.drawArc(r, 180f, 180f, true, fill)
        c.drawRect(x + f - 0.6f, y - 20f, x + f + 0.6f, y - 17f, fill) // spike
        eye(c, x + f * 2.8f - 1.8f, y - 12f, 1f, 0xFFFFE070.toInt())
        eye(c, x + f * 2.8f + 1.8f, y - 12f, 1f, 0xFFFFE070.toInt())
    }

    /** The floor's heavy hitter: big, horned, carrying a club. */
    private fun ogre(c: Canvas, x: Float, y: Float, f: Float) {
        val skin = 0xFF8A9A6A.toInt()
        // Club behind
        c.save()
        c.rotate(f * 35f, x + f * 8f, y)
        fill.color = 0xFF6A4A2E.toInt()
        r.set(x + f * 8f - 2f, y - 16f, x + f * 8f + 2f, y + 1f)
        c.drawRoundRect(r, 2f, 2f, fill)
        oval(c, x + f * 8f - 3.5f, y - 20f, x + f * 8f + 3.5f, y - 11f, 0xFF7A5634.toInt())
        c.restore()
        fill.color = 0xFF5E6A48.toInt()
        c.drawRect(x - 5f + step * 1.5f, y + 3f, x - 1.5f + step * 1.5f, y + 9.5f, fill)
        c.drawRect(x + 1.5f - step * 1.5f, y + 3f, x + 5f - step * 1.5f, y + 9.5f, fill)
        oval(c, x - 11f, y - 7f, x - 5.5f, y + 4f, skin)
        oval(c, x + 5.5f, y - 7f, x + 11f, y + 4f, skin)
        oval(c, x - 9f, y - 10f, x + 9f, y + 6f, skin) // bulk
        oval(c, x - 5f, y - 3f, x + 5f, y + 5f, 0xFFA2B084.toInt()) // belly
        fill.color = 0xFF6A4A2E.toInt()
        c.drawRect(x - 8f, y + 2f, x + 8f, y + 4f, fill) // belt
        // Small head sunk into the shoulders, with horns
        dot(c, x + f * 1.5f, y - 12f, 4.5f, skin)
        for (s in floatArrayOf(-1f, 1f)) {
            path.reset()
            path.moveTo(x + f * 1.5f + s * 2.5f, y - 15f)
            path.lineTo(x + f * 1.5f + s * 4.5f, y - 15f)
            path.lineTo(x + f * 1.5f + s * 6f, y - 20f)
            path.close()
            fill.color = 0xFFE8D8B0.toInt()
            c.drawPath(path, fill)
        }
        fill.color = 0xFF4A3A2A.toInt()
        c.drawRect(x + f * 1.5f - 3f, y - 14f, x + f * 1.5f + 3f, y - 13f, fill) // heavy brow
        eye(c, x + f * 3f - 1.5f, y - 12f, 0.9f, 0xFFFF5A3A.toInt())
        eye(c, x + f * 3f + 1.5f, y - 12f, 0.9f, 0xFFFF5A3A.toInt())
    }

    /** Sturdy, armoured, with a faint shimmer at the edges where her shape is never quite settled. */
    private fun katia(c: Canvas, x: Float, y: Float, f: Float, t: Float) {
        val skin = 0xFFD8A888.toInt()
        // Faint shimmering outline: her shape is never quite settled.
        line.color = ((60 + 40 * sin(t * 3f)).toInt() shl 24) or 0xB07CFF
        line.strokeWidth = 0.8f
        r.set(x - 9.5f, y - 18.5f, x + 9.5f, y + 10.5f)
        c.drawOval(r, line)
        fill.color = 0xFF3A3040.toInt()
        c.drawRect(x - 4f + step * 2f, y + 3f, x - 1.3f + step * 2f, y + 9f, fill) // legs
        c.drawRect(x + 1.3f - step * 2f, y + 3f, x + 4f - step * 2f, y + 9f, fill)
        oval(c, x - 4.8f + step * 2f + f, y + 8f, x - 0.8f + step * 2f + f, y + 10f, 0xFF201820.toInt())
        oval(c, x + 0.8f - step * 2f + f, y + 8f, x + 4.8f - step * 2f + f, y + 10f, 0xFF201820.toInt())
        oval(c, x - 9f, y - 8f, x - 4.5f, y + 2f, skin) // arms
        oval(c, x + 4.5f, y - 8f, x + 9f, y + 2f, skin)
        fill.color = 0xFF5A4A6A.toInt()
        r.set(x - 6.5f, y - 9.5f, x + 6.5f, y + 4f)
        c.drawRoundRect(r, 3f, 3f, fill) // leather armour
        fill.color = 0xFF7A6A8A.toInt()
        c.drawRect(x - 6.5f, y - 3f, x + 6.5f, y - 1.8f, fill)
        dot(c, x + f * 0.6f, y - 13f, 4.3f, skin)
        fill.color = 0xFF2A1E26.toInt()
        r.set(x + f * 0.6f - 4.8f, y - 18f, x + f * 0.6f + 4.8f, y - 11.5f)
        c.drawArc(r, 180f, 180f, true, fill) // short dark hair
        c.drawRect(x - f * 3.5f - 1.2f, y - 14f, x - f * 3.5f + 1.2f, y - 9f, fill)
        eye(c, x + f * 2.4f, y - 13f, 0.9f, 0xFF1A1008.toInt())
        eye(c, x + f * 0.2f, y - 13f, 0.9f, 0xFF1A1008.toInt())
    }

    /** A bulbous head on a nest of curling tentacles. */
    private fun kraken(c: Canvas, x: Float, y: Float, f: Float, t: Float) {
        val body = 0xFF5A3A6A.toInt()
        line.color = 0xFF4A2E58.toInt()
        line.strokeWidth = 2.6f
        for (k in 0 until 5) {
            val bx = x - 8f + k * 4f
            val curl = sin(t * 3f + k) * 3f
            path.reset()
            path.moveTo(bx, y + 1f)
            path.quadTo(bx + curl, y + 7f, bx + curl * 1.5f + (k - 2) * 1.5f, y + 9.5f)
            c.drawPath(path, line)
        }
        oval(c, x - 10f, y - 17f, x + 10f, y + 4f, body)
        oval(c, x - 7f, y - 15f, x + 3f, y - 9f, 0xFF7A5A8A.toInt()) // sheen
        for (k in 0 until 3) dot(c, x - 5f + k * 5f, y - 3f, 1.1f, 0xFFB08AC0.toInt()) // suckers
        eye(c, x + f * 3f - 3.5f, y - 9f, 2.6f, 0xFFFFE070.toInt())
        eye(c, x + f * 3f + 3.5f, y - 9f, 2.6f, 0xFFFFE070.toInt())
        if (!blink) {
            fill.color = 0xFF101010.toInt()
            c.drawRect(x + f * 3.4f - 4f, y - 10.8f, x + f * 3.4f - 3f, y - 7.2f, fill)
            c.drawRect(x + f * 3.4f + 3f, y - 10.8f, x + f * 3.4f + 4f, y - 7.2f, fill)
        }
    }

    /** Crouched grey stone with folded bat wings; the wings open while it flies. */
    private fun gargoyle(c: Canvas, x: Float, y: Float, f: Float, t: Float, airborne: Boolean) {
        val stone = 0xFF7A7A82.toInt()
        val dark = 0xFF55555E.toInt()
        val open = if (airborne) 1f else 0.35f
        val flap = if (airborne) sin(t * 14f) * 2.5f else 0f
        for (side in floatArrayOf(-1f, 1f)) {
            path.reset()
            path.moveTo(x + side * 3f, y - 7f)
            path.lineTo(x + side * (5f + 11f * open), y - 16f - flap)
            path.lineTo(x + side * (4f + 9f * open), y - 8f)
            path.lineTo(x + side * (5f + 10f * open), y - 2f + flap * 0.3f)
            path.lineTo(x + side * 4f, y + 1f)
            path.close()
            fill.color = dark
            c.drawPath(path, fill)
        }
        fill.color = dark
        c.drawRect(x - 5f + step * 1.5f, y + 3f, x - 1.5f + step * 1.5f, y + 9.5f, fill)
        c.drawRect(x + 1.5f - step * 1.5f, y + 3f, x + 5f - step * 1.5f, y + 9.5f, fill)
        oval(c, x - 7f, y - 9f, x + 7f, y + 6f, stone)
        dot(c, x + f * 2f, y - 12f, 4.8f, stone)
        for (s in floatArrayOf(-1f, 1f)) {
            path.reset()
            path.moveTo(x + f * 2f + s * 2f, y - 15f)
            path.lineTo(x + f * 2f + s * 4f, y - 15f)
            path.lineTo(x + f * 2f + s * 5.5f, y - 21f)
            path.close()
            fill.color = dark
            c.drawPath(path, fill)
        }
        fill.color = 0xFF3A3A40.toInt()
        c.drawRect(x - 5f, y - 3f, x + 5f, y - 2.2f, fill) // cracks
        c.drawRect(x - 2f, y + 1f, x + 3f, y + 1.6f, fill)
        eye(c, x + f * 3.8f - 1.6f, y - 12.5f, 1.1f, 0xFFFF3A3A.toInt())
        eye(c, x + f * 3.8f + 1.6f, y - 12.5f, 1.1f, 0xFFFF3A3A.toInt())
    }

    /** Black rock with glowing seams of molten orange and huge fists. */
    private fun golem(c: Canvas, x: Float, y: Float, f: Float, t: Float) {
        val rock = 0xFF2A2226.toInt()
        val glow = if (sin(t * 4f) > 0f) 0xFFFF8A2A.toInt() else 0xFFFFA84A.toInt()
        fill.color = rock
        c.drawRect(x - 5.5f + step * 1.5f, y + 3f, x - 1.5f + step * 1.5f, y + 9.5f, fill)
        c.drawRect(x + 1.5f - step * 1.5f, y + 3f, x + 5.5f - step * 1.5f, y + 9.5f, fill)
        oval(c, x - 12f, y - 6f, x - 5f, y + 7f, rock) // fists
        oval(c, x + 5f, y - 6f, x + 12f, y + 7f, rock)
        oval(c, x - 9f, y - 13f, x + 9f, y + 6f, rock)
        line.color = glow
        line.strokeWidth = 0.9f
        path.reset()
        path.moveTo(x - 6f, y - 8f); path.lineTo(x - 2f, y - 4f); path.lineTo(x - 4f, y + 1f)
        path.moveTo(x + 2f, y - 10f); path.lineTo(x + 5f, y - 5f); path.lineTo(x + 2f, y + 2f)
        path.moveTo(x - 10f, y); path.lineTo(x - 7f, y + 3f)
        path.moveTo(x + 10f, y); path.lineTo(x + 7f, y + 4f)
        c.drawPath(path, line)
        dot(c, x + f * 1.5f, y - 15f, 4.5f, rock)
        eye(c, x + f * 3f - 1.6f, y - 15.5f, 1.3f, glow)
        eye(c, x + f * 3f + 1.6f, y - 15.5f, 1.3f, glow)
        fill.color = glow
        c.drawRect(x + f * 1.5f - 2.5f, y - 12.6f, x + f * 1.5f + 2.5f, y - 11.8f, fill) // mouth
    }

    private fun oval(c: Canvas, l: Float, t: Float, rr: Float, b: Float, color: Int) {
        fill.color = color
        r.set(minOf(l, rr), t, maxOf(l, rr), b)
        c.drawOval(r, fill)
    }

    /** An eye (or pupil): drawn as a closed lid line while blinking; pupils vanish. */
    private fun eye(c: Canvas, x: Float, y: Float, radius: Float, color: Int) {
        if (!blink) {
            dot(c, x, y, radius, color)
        } else if (radius >= 0.85f) {
            line.color = 0xFF1A1008.toInt()
            line.strokeWidth = 0.6f
            c.drawLine(x - radius, y, x + radius, y, line)
        }
    }

    private fun dot(c: Canvas, x: Float, y: Float, radius: Float, color: Int) {
        fill.color = color
        c.drawCircle(x, y, radius, fill)
    }
}
