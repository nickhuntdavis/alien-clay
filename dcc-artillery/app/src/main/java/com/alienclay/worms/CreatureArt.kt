package com.alienclay.worms

import android.graphics.Canvas
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

    fun draw(c: Canvas, s: Species, x: Float, y: Float, f: Float, t: Float, airborne: Boolean) {
        when (s) {
            Species.CARL -> carl(c, x, y, f, airborne)
            Species.DONUT -> donut(c, x, y, f, t)
            Species.MONGO -> mongo(c, x, y, f, t, airborne)
            Species.GOBLIN -> goblin(c, x, y, f)
            Species.HOBGOBLIN -> hobgoblin(c, x, y, f)
            Species.OGRE -> ogre(c, x, y, f)
        }
    }

    /** Leather jacket, boxer shorts, bare feet. */
    private fun carl(c: Canvas, x: Float, y: Float, f: Float, airborne: Boolean) {
        val skin = 0xFFE8B894.toInt()
        val spread = if (airborne) 1.5f else 0f
        fill.color = skin
        c.drawRect(x - 4f - spread, y + 3f, x - 1.6f - spread, y + 8.5f, fill) // legs
        c.drawRect(x + 1.6f + spread, y + 3f, x + 4f + spread, y + 8.5f, fill)
        oval(c, x - 4.5f - spread + f * 1.2f, y + 7.5f, x - 0.8f - spread + f * 1.2f, y + 9.8f, skin) // bare feet
        oval(c, x + 0.8f + spread + f * 1.2f, y + 7.5f, x + 4.5f + spread + f * 1.2f, y + 9.8f, skin)
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
        dot(c, x + f * 2.6f, y - 13.3f, 0.9f, 0xFF1A1008.toInt())
        dot(c, x + f * 0.2f, y - 13.3f, 0.9f, 0xFF1A1008.toInt())
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
        oval(c, x - 5f, y + 6.5f, x - 1f, y + 9.8f, shade)
        oval(c, x + 1f, y + 6.5f, x + 5f, y + 9.8f, shade)
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
        dot(c, hx + f - 2.4f, hy - 1f, 1.7f, 0xFFE08A2A.toInt()) // copper eyes
        dot(c, hx + f + 2.4f, hy - 1f, 1.7f, 0xFFE08A2A.toInt())
        dot(c, hx + f - 2.4f, hy - 1f, 0.8f, 0xFF1A1008.toInt())
        dot(c, hx + f + 2.4f, hy - 1f, 0.8f, 0xFF1A1008.toInt())
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
        val step = if (airborne) 0f else sin(t * 6f) * 1f
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
        dot(c, x + f * 6f, y - 12f, 1.3f, 0xFFFFE070.toInt())
        dot(c, x + f * 6.4f, y - 12f, 0.6f, 0xFF101010.toInt())
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
        c.drawRect(x - 3.5f, y + 3f, x - 1.5f, y + 9.5f, fill)
        c.drawRect(x + 1.5f, y + 3f, x + 3.5f, y + 9.5f, fill)
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
        dot(c, x + f * 2.5f - 1.8f, y - 11.5f, 1.2f, 0xFFFFE070.toInt())
        dot(c, x + f * 2.5f + 1.8f, y - 11.5f, 1.2f, 0xFFFFE070.toInt())
        dot(c, x + f * 2.9f - 1.8f, y - 11.5f, 0.5f, 0xFF101010.toInt())
        dot(c, x + f * 2.9f + 1.8f, y - 11.5f, 0.5f, 0xFF101010.toInt())
    }

    private fun hobgoblin(c: Canvas, x: Float, y: Float, f: Float) {
        val skin = 0xFFB0603A.toInt()
        val iron = 0xFF6E747C.toInt()
        fill.color = 0xFF4A3A30.toInt()
        c.drawRect(x - 4f, y + 3f, x - 1.5f, y + 9.5f, fill)
        c.drawRect(x + 1.5f, y + 3f, x + 4f, y + 9.5f, fill)
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
        dot(c, x + f * 2.8f - 1.8f, y - 12f, 1f, 0xFFFFE070.toInt())
        dot(c, x + f * 2.8f + 1.8f, y - 12f, 1f, 0xFFFFE070.toInt())
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
        c.drawRect(x - 5f, y + 3f, x - 1.5f, y + 9.5f, fill)
        c.drawRect(x + 1.5f, y + 3f, x + 5f, y + 9.5f, fill)
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
        dot(c, x + f * 3f - 1.5f, y - 12f, 0.9f, 0xFFFF5A3A.toInt())
        dot(c, x + f * 3f + 1.5f, y - 12f, 0.9f, 0xFFFF5A3A.toInt())
    }

    private fun oval(c: Canvas, l: Float, t: Float, rr: Float, b: Float, color: Int) {
        fill.color = color
        r.set(minOf(l, rr), t, maxOf(l, rr), b)
        c.drawOval(r, fill)
    }

    private fun dot(c: Canvas, x: Float, y: Float, radius: Float, color: Int) {
        fill.color = color
        c.drawCircle(x, y, radius, fill)
    }
}
