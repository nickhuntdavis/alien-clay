package com.alienclay.worms

import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import kotlin.math.cos
import kotlin.math.sin

/**
 * Draws the six cryptids with Canvas primitives, in world units.
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
            Species.BIGFOOT -> bigfoot(c, x, y, f)
            Species.MOTHMAN -> mothman(c, x, y, f, t, airborne)
            Species.CHUPACABRA -> chupacabra(c, x, y, f)
            Species.NESSIE -> nessie(c, x, y, f, t)
            Species.YETI -> yeti(c, x, y, f)
            Species.JERSEY_DEVIL -> jerseyDevil(c, x, y, f, t, airborne)
        }
    }

    private fun bigfoot(c: Canvas, x: Float, y: Float, f: Float) {
        oval(c, x - 10.5f, y - 6f, x - 5f, y + 6f, 0xFF4E3019.toInt()) // arms
        oval(c, x + 5f, y - 6f, x + 10.5f, y + 6f, 0xFF4E3019.toInt())
        oval(c, x - 8f, y - 13f, x + 8f, y + 8.5f, 0xFF6B4428.toInt())
        // Shaggy crown
        path.reset()
        path.moveTo(x - 6f, y - 10f)
        path.lineTo(x - 3.5f, y - 15.5f)
        path.lineTo(x - 1f, y - 11.5f)
        path.lineTo(x + 1.5f, y - 16f)
        path.lineTo(x + 4f, y - 11.5f)
        path.lineTo(x + 6.5f, y - 14.5f)
        path.lineTo(x + 7f, y - 9f)
        path.close()
        fill.color = 0xFF6B4428.toInt()
        c.drawPath(path, fill)
        oval(c, x - 7.5f + f, y + 6f, x - 0.5f + f, y + 10f, 0xFF3A2312.toInt()) // big feet
        oval(c, x + 0.5f + f, y + 6f, x + 7.5f + f, y + 10f, 0xFF3A2312.toInt())
        oval(c, x + f * 2f - 4.5f, y - 10f, x + f * 2f + 4.5f, y - 1.5f, 0xFFC9A27A.toInt()) // face
        fill.color = 0xFF3A2312.toInt()
        c.drawRect(x + f * 2f - 4f, y - 8.2f, x + f * 2f + 4f, y - 7f, fill) // brow
        dot(c, x + f * 2f - 2f, y - 5.8f, 1.1f, 0xFF1A1008.toInt())
        dot(c, x + f * 2f + 2f, y - 5.8f, 1.1f, 0xFF1A1008.toInt())
        oval(c, x + f * 2f - 1.2f, y - 4.5f, x + f * 2f + 1.2f, y - 3f, 0xFF8A6446.toInt()) // nose
    }

    private fun mothman(c: Canvas, x: Float, y: Float, f: Float, t: Float, airborne: Boolean) {
        val flap = sin(t * if (airborne) 18f else 2.5f) * if (airborne) 3f else 1f
        for (side in intArrayOf(-1, 1)) {
            val s = side.toFloat()
            path.reset()
            path.moveTo(x + s * 2f, y - 6f)
            path.lineTo(x + s * 16f, y - 15f - flap)
            path.lineTo(x + s * 14f, y - 7f - flap * 0.5f)
            path.lineTo(x + s * 15f, y - 1f)
            path.lineTo(x + s * 9f, y + 1f)
            path.lineTo(x + s * 4f, y + 5f)
            path.close()
            fill.color = 0xFF3E3A4A.toInt()
            c.drawPath(path, fill)
            line.color = 0xFF26232E.toInt()
            line.strokeWidth = 0.8f
            c.drawLine(x + s * 2f, y - 6f, x + s * 14f, y - 7f - flap * 0.5f, line)
            c.drawLine(x + s * 2f, y - 5f, x + s * 9f, y + 1f, line)
        }
        fill.color = 0xFF221F29.toInt()
        c.drawRect(x - 3.5f, y + 4f, x - 1.8f, y + 9.5f, fill) // spindly legs
        c.drawRect(x + 1.8f, y + 4f, x + 3.5f, y + 9.5f, fill)
        oval(c, x - 6f, y - 11f, x + 6f, y + 6f, 0xFF2B2833.toInt())
        // Glowing red eyes
        val ex = x + f * 1.5f
        dot(c, ex - 3f, y - 5f, 4.2f, 0x55FF2020)
        dot(c, ex + 3f, y - 5f, 4.2f, 0x55FF2020)
        dot(c, ex - 3f, y - 5f, 2.6f, 0xFFFF3030.toInt())
        dot(c, ex + 3f, y - 5f, 2.6f, 0xFFFF3030.toInt())
        dot(c, ex - 3f + f * 0.6f, y - 5.4f, 0.9f, 0xFFFFD0C0.toInt())
        dot(c, ex + 3f + f * 0.6f, y - 5.4f, 0.9f, 0xFFFFD0C0.toInt())
    }

    private fun chupacabra(c: Canvas, x: Float, y: Float, f: Float) {
        fill.color = 0xFF5E6E4E.toInt()
        for (lx in floatArrayOf(-6f, -2.5f, 2f, 5.5f)) c.drawRect(x + lx - 1f, y + 3f, x + lx + 1f, y + 9.5f, fill)
        // Spines down the back
        for (i in 0..4) {
            val sx = x - f * (7f - i * 3f)
            val sy = y - 5.5f - sin(i / 4f * Math.PI.toFloat()) * 2.5f
            path.reset()
            path.moveTo(sx - 1.8f, sy + 2f)
            path.lineTo(sx + 1.8f, sy + 2f)
            path.lineTo(sx - f * 1.2f, sy - 4.5f)
            path.close()
            fill.color = 0xFF4F5E40.toInt()
            c.drawPath(path, fill)
        }
        oval(c, x - 8.5f, y - 7f, x + 8.5f, y + 6f, 0xFF7D8F6A.toInt()) // hunched body
        oval(c, x + f * 6f - 5f, y - 9f, x + f * 6f + 5f, y + 1f, 0xFF8FA07A.toInt()) // head
        // Big black almond eyes
        c.save()
        c.rotate(-f * 20f, x + f * 7f, y - 5f)
        oval(c, x + f * 7f - 2.6f, y - 6.3f, x + f * 7f + 2.6f, y - 3.7f, 0xFF101010.toInt())
        c.restore()
        dot(c, x + f * 7.6f, y - 5.4f, 0.6f, 0xFFFFFFFF.toInt())
        // Fangs
        path.reset()
        path.moveTo(x + f * 8.5f, y - 1.5f)
        path.lineTo(x + f * 9.8f, y - 1.5f)
        path.lineTo(x + f * 9.2f, y + 1.2f)
        path.close()
        fill.color = 0xFFF4F0E0.toInt()
        c.drawPath(path, fill)
    }

    private fun nessie(c: Canvas, x: Float, y: Float, f: Float, t: Float) {
        val green = 0xFF3F8F6A.toInt()
        // Tail
        path.reset()
        path.moveTo(x - f * 6f, y + 3f)
        path.lineTo(x - f * 14f, y + 8.5f)
        path.lineTo(x - f * 6f, y + 9f)
        path.close()
        fill.color = green
        c.drawPath(path, fill)
        // Flippers
        oval(c, x - f * 5f - 3f, y + 6f, x - f * 5f + 3f, y + 10f, 0xFF2F7454.toInt())
        oval(c, x + f * 5f - 3f, y + 6f, x + f * 5f + 3f, y + 10f, 0xFF2F7454.toInt())
        // Hump
        oval(c, x - 9f, y - 1f, x + 8f, y + 8.5f, green)
        oval(c, x - 5f, y + 3.5f, x + 5f, y + 8.5f, 0xFF7FC79A.toInt())
        dot(c, x - f * 3f, y + 1.5f, 1.2f, 0xFF2F7454.toInt())
        dot(c, x - f * 0.5f, y + 0.5f, 1f, 0xFF2F7454.toInt())
        // Long neck, swaying a little
        val sway = sin(t * 2f) * 0.8f
        line.color = green
        line.strokeWidth = 4.5f
        path.reset()
        path.moveTo(x + f * 2f, y + 2f)
        path.quadTo(x + f * 3f, y - 7f, x + f * (5.5f + sway), y - 12f)
        c.drawPath(path, line)
        // Head
        val hx = x + f * (6.5f + sway)
        oval(c, hx - 4f + f * 1.5f, y - 16f, hx + 4f + f * 1.5f, y - 10.5f, green)
        dot(c, hx + f * 1.5f, y - 13.8f, 1.5f, 0xFFFFFFFF.toInt())
        dot(c, hx + f * 2f, y - 13.8f, 0.8f, 0xFF102018.toInt())
    }

    private fun yeti(c: Canvas, x: Float, y: Float, f: Float) {
        val white = 0xFFF2F5FA.toInt()
        oval(c, x - 11f, y - 6f, x - 5f, y + 6f, 0xFFDCE4EE.toInt()) // arms
        oval(c, x + 5f, y - 6f, x + 11f, y + 6f, 0xFFDCE4EE.toInt())
        oval(c, x - 7.5f + f, y + 6f, x - 0.5f + f, y + 10f, 0xFF9FB4CC.toInt()) // feet
        oval(c, x + 0.5f + f, y + 6f, x + 7.5f + f, y + 10f, 0xFF9FB4CC.toInt())
        oval(c, x - 8.5f, y - 12.5f, x + 8.5f, y + 8.5f, white)
        // Fluffy tufts round the edge
        for (i in 0 until 8) {
            val a = (i / 8f) * Math.PI.toFloat() * 2f
            dot(c, x + cos(a) * 8f, y - 2f + sin(a) * 10f, 2.6f, white)
        }
        oval(c, x + f * 2f - 4.5f, y - 10f, x + f * 2f + 4.5f, y - 1.5f, 0xFF9FC7E8.toInt()) // face
        dot(c, x + f * 2f - 2f, y - 6.5f, 1.1f, 0xFF1A2A44.toInt())
        dot(c, x + f * 2f + 2f, y - 6.5f, 1.1f, 0xFF1A2A44.toInt())
        fill.color = 0xFF1A2A44.toInt()
        c.drawRect(x + f * 2f - 2.5f, y - 4f, x + f * 2f + 2.5f, y - 2.6f, fill) // mouth
        fill.color = 0xFFFFFFFF.toInt()
        c.drawRect(x + f * 2f - 1.8f, y - 4f, x + f * 2f - 0.9f, y - 3.1f, fill)
        c.drawRect(x + f * 2f + 0.9f, y - 4f, x + f * 2f + 1.8f, y - 3.1f, fill)
    }

    private fun jerseyDevil(c: Canvas, x: Float, y: Float, f: Float, t: Float, airborne: Boolean) {
        val flap = if (airborne) sin(t * 16f) * 3f else 0f
        val body = 0xFF7A2A3A.toInt()
        // Forked tail
        line.color = body
        line.strokeWidth = 1.4f
        path.reset()
        path.moveTo(x - f * 4f, y + 4f)
        path.quadTo(x - f * 12f, y + 6f, x - f * 12f, y - 3f)
        c.drawPath(path, line)
        path.reset()
        path.moveTo(x - f * 12f, y - 6f)
        path.lineTo(x - f * 10f, y - 2f)
        path.lineTo(x - f * 14f, y - 2f)
        path.close()
        fill.color = body
        c.drawPath(path, fill)
        // Bat wings
        for (side in intArrayOf(-1, 1)) {
            val s = side.toFloat()
            path.reset()
            path.moveTo(x + s * 2f, y - 5f)
            path.lineTo(x + s * 13f, y - 11f - flap)
            path.lineTo(x + s * 11f, y - 5f)
            path.lineTo(x + s * 13f, y - 1f + flap * 0.3f)
            path.lineTo(x + s * 8f, y - 1f)
            path.lineTo(x + s * 3f, y + 2f)
            path.close()
            fill.color = 0xFF4A1A2A.toInt()
            c.drawPath(path, fill)
        }
        // Legs with hooves
        fill.color = 0xFF5E1E2C.toInt()
        c.drawRect(x - 3.5f, y + 3f, x - 1.8f, y + 8.5f, fill)
        c.drawRect(x + 1.8f, y + 3f, x + 3.5f, y + 8.5f, fill)
        fill.color = 0xFF151010.toInt()
        c.drawRect(x - 4f, y + 8f, x - 1.4f, y + 9.8f, fill)
        c.drawRect(x + 1.4f, y + 8f, x + 4f, y + 9.8f, fill)
        oval(c, x - 6f, y - 8f, x + 6f, y + 6f, body)
        // Long horse-like head
        c.save()
        c.rotate(f * 15f, x + f * 3f, y - 11f)
        oval(c, x + f * 3f - 4.5f, y - 15f, x + f * 3f + 4.5f, y - 7f, body)
        c.restore()
        oval(c, x + f * 6.5f - 2f, y - 10.5f, x + f * 6.5f + 2f, y - 7f, 0xFF8E3A4A.toInt()) // snout
        for (hs in floatArrayOf(-2.5f, 2.5f)) {
            path.reset()
            path.moveTo(x + f * 2f + hs - 1.3f, y - 14f)
            path.lineTo(x + f * 2f + hs + 1.3f, y - 14f)
            path.lineTo(x + f * 2f + hs * 1.4f, y - 19f)
            path.close()
            fill.color = 0xFFE8D8B0.toInt()
            c.drawPath(path, fill)
        }
        dot(c, x + f * 3.8f, y - 12f, 1.2f, 0xFFFFD34A.toInt())
    }

    private fun oval(c: Canvas, l: Float, t: Float, rr: Float, b: Float, color: Int) {
        fill.color = color
        r.set(l, t, rr, b)
        c.drawOval(r, fill)
    }

    private fun dot(c: Canvas, x: Float, y: Float, radius: Float, color: Int) {
        fill.color = color
        c.drawCircle(x, y, radius, fill)
    }
}
