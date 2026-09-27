package com.alienclay.worms

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapShader
import android.graphics.Matrix
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RadialGradient
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.os.Build
import android.view.MotionEvent
import android.view.SurfaceHolder
import android.view.SurfaceView
import kotlin.math.PI
import kotlin.math.atan2
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/** Owns the game loop thread, the camera, touch controls and all drawing. */
@SuppressLint("ViewConstructor")
class GameView(context: Context) : SurfaceView(context), SurfaceHolder.Callback, Runnable {
    private enum class Screen { MENU, GAME }

    private val lock = Any()
    private var thread: Thread? = null
    @Volatile private var running = false

    private var screen = Screen.MENU
    private var game: Game? = null
    private val menuGame = Game(Mode.VS_CPU, 7L)

    private val dp = resources.displayMetrics.density
    private var vw = 1f
    private var vh = 1f

    // Camera: world point at screen centre, and pixels per world unit.
    private var camX = Game.W / 2f
    private var camY = Game.H / 2f
    private var scale = 1f
    private var fullScale = 1f
    private var closeScale = 1f
    private var zoomedOut = false

    private var terrainBmp: Bitmap? = null
    private var bmpOwner: Terrain? = null

    // Controls
    private val btnLeft = RectF()
    private val btnRight = RectF()
    private val btnJump = RectF()
    private val btnWeapon = RectF()
    private val btnZoom = RectF()
    private val btnPause = RectF()
    private val btnSound = RectF()
    private val windBox = RectF()
    private val btnResume = RectF()
    private val btnCpu = RectF()
    private val btnTwo = RectF()
    private val btnAgain = RectF()
    private val btnToMenu = RectF()
    private val pickerRows = Array(3) { RectF() } // no fighter carries more than three attacks
    private var pickerOpen = false

    private val roles = HashMap<Int, Int>()
    private var aimStartX = 0f
    private var aimStartY = 0f
    private var aimCurX = 0f
    private var aimCurY = 0f

    // Drawing
    private val fill = Paint(Paint.ANTI_ALIAS_FLAG)
    private val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
    private val text = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        textAlign = Paint.Align.CENTER
    }
    private val bmpPaint = Paint(Paint.FILTER_BITMAP_FLAG)
    private val sky = Paint()
    private val pitGlow = Paint()
    private val art = CreatureArt()
    private val wall = Paint().apply { shader = BitmapShader(brickTile(), Shader.TileMode.REPEAT, Shader.TileMode.REPEAT) }
    private val wallMatrix = Matrix()

    // Lighting: a dark layer with holes cut by soft lights, then a warm additive glow on top.
    private val darkness = Paint()
    private val lightCut = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        shader = RadialGradient(0f, 0f, 1f, intArrayOf(0xFFFFFFFF.toInt(), 0x99FFFFFF.toInt(), 0x00FFFFFF),
            floatArrayOf(0f, 0.45f, 1f), Shader.TileMode.CLAMP)
        xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_OUT)
    }
    private val glow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        xfermode = PorterDuffXfermode(PorterDuff.Mode.ADD)
    }
    private val glowShaders = HashMap<Int, RadialGradient>()
    private val fire = Paint(Paint.ANTI_ALIAS_FLAG).apply { xfermode = PorterDuffXfermode(PorterDuff.Mode.ADD) }
    private val vignette = Paint()
    private class Light(var x: Float = 0f, var y: Float = 0f, var r: Float = 0f, var k: Float = 0f, var color: Int = 0)
    private val lightPool = ArrayList<Light>()
    private var lightCount = 0

    /** Sound effects; created here so the activity can pause and release them. */
    val sound = SoundFx(context)
    private val path = Path()
    private val rect = RectF()
    private val preview = FloatArray(80)
    // HUD animation state (see updateHudAnimation).
    private var shownViewers = Game.START_VIEWERS.toFloat()
    private var lastViewers = Game.START_VIEWERS
    private class Pop(val text: String) { var age = 0f }
    private val viewerPops = ArrayList<Pop>()
    private val teamShown = floatArrayOf(1f, 1f)
    private val teamLag = floatArrayOf(1f, 1f)
    private val wormShownHp = java.util.IdentityHashMap<Worm, Float>()
    private var uiTime = 0f
    private var screenSince = 0f
    private var lastScreen = Screen.MENU

    // Fonts: Cinzel for titles and labels, VT323 for the System AI and counters (all SIL Open Font Licence).
    private val titleFont = loadFont("fonts/CinzelDecorative-Bold.ttf")
    private val uiFont = loadFont("fonts/Cinzel-Bold.ttf")
    private val sysFont = loadFont("fonts/VT323-Regular.ttf")
    private val plainFont = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)

    private fun loadFont(path: String): Typeface =
        try {
            Typeface.createFromAsset(context.assets, path)
        } catch (_: RuntimeException) {
            Typeface.DEFAULT_BOLD
        }

    init {
        holder.addCallback(this)
        isFocusable = true
    }

    // ------------------------------------------------------------ lifecycle

    override fun surfaceCreated(holder: SurfaceHolder) {
        running = true
        thread = Thread(this, "game-loop").also { it.start() }
    }

    override fun surfaceChanged(holder: SurfaceHolder, format: Int, width: Int, height: Int) {
        synchronized(lock) { layout(width.toFloat(), height.toFloat()) }
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        running = false
        try {
            thread?.join(500)
        } catch (_: InterruptedException) {
        }
        thread = null
    }

    /** Back button: leave the match for the menu. Returns false to let the app close. */
    fun onBack(): Boolean = synchronized(lock) {
        if (screen == Screen.GAME) {
            screen = Screen.MENU
            clearInput()
            true
        } else {
            false
        }
    }

    override fun run() {
        var last = System.nanoTime()
        var acc = 0f
        while (running) {
            val now = System.nanoTime()
            acc += min(0.1f, (now - last) / 1e9f)
            last = now
            synchronized(lock) {
                while (acc >= Game.DT) {
                    tick(Game.DT)
                    acc -= Game.DT
                }
            }
            val c = try {
                if (Build.VERSION.SDK_INT >= 26) holder.lockHardwareCanvas() else holder.lockCanvas()
            } catch (_: Exception) {
                null
            }
            if (c == null) {
                Thread.sleep(10)
                continue
            }
            try {
                synchronized(lock) { render(c) }
            } finally {
                holder.unlockCanvasAndPost(c)
            }
        }
    }

    private fun layout(w: Float, h: Float) {
        vw = w
        vh = h
        fullScale = min(vw / Game.W, vh / (Game.H + 20f))
        closeScale = max(fullScale, vh / 360f)
        scale = if (screen == Screen.GAME && !zoomedOut) closeScale else fullScale
        sky.shader = LinearGradient(0f, 0f, 0f, vh,
            intArrayOf(0xFF0A0706.toInt(), 0xFF140E0C.toInt(), 0xFF22160F.toInt(), 0xFF3A1E12.toInt()),
            floatArrayOf(0f, 0.45f, 0.75f, 1f), Shader.TileMode.CLAMP)
        vignette.shader = RadialGradient(vw / 2, vh / 2, max(vw, vh) * 0.75f,
            intArrayOf(0x00000000, 0x00000000, 0xAA000000.toInt()), floatArrayOf(0f, 0.55f, 1f), Shader.TileMode.CLAMP)
        // Red glow rising out of the pit, in world coordinates.
        pitGlow.shader = LinearGradient(0f, Game.WATER_Y - 110f, 0f, Game.WATER_Y.toFloat(),
            0x00FF4A1A, 0x66FF4A1A, Shader.TileMode.CLAMP)

        val m = 16 * dp
        val b = 64 * dp
        btnLeft.set(m, vh - m - b, m + b, vh - m)
        btnRight.set(btnLeft.right + 14 * dp, btnLeft.top, btnLeft.right + 14 * dp + b, btnLeft.bottom)
        btnJump.set(btnRight.right + 24 * dp, btnLeft.top, btnRight.right + 24 * dp + b, btnLeft.bottom)
        btnWeapon.set(vw - m - 200 * dp, vh - m - 60 * dp, vw - m, vh - m)
        btnZoom.set(vw - m - 52 * dp, btnWeapon.top - 14 * dp - 52 * dp, vw - m, btnWeapon.top - 14 * dp)
        btnPause.set(vw - m - 44 * dp, m, vw - m, m + 44 * dp)
        btnSound.set(btnPause.left - 10 * dp - 44 * dp, m, btnPause.left - 10 * dp, m + 44 * dp)
        windBox.set(btnSound.left - 12 * dp - 170 * dp, m, btnSound.left - 12 * dp, m + 44 * dp)
        val rowH = 36 * dp
        for (i in pickerRows.indices) {
            val bottom = btnWeapon.top - 8 * dp - (pickerRows.size - 1 - i) * (rowH + 4 * dp)
            pickerRows[i].set(btnWeapon.left, bottom - rowH, btnWeapon.right, bottom)
        }

        val bw = min(340 * dp, vw * 0.6f)
        val bh = 52 * dp
        val cx = vw / 2
        layoutMenuButtons()
        btnAgain.set(cx - bw / 2, vh * 0.55f, cx + bw / 2, vh * 0.55f + bh)
        btnToMenu.set(cx - bw / 2, btnAgain.bottom + 14 * dp, cx + bw / 2, btnAgain.bottom + 14 * dp + bh)
    }

    /** Stack the menu buttons, with RESUME on top only while a match is in progress. */
    private fun layoutMenuButtons() {
        val bw = min(340 * dp, vw * 0.6f)
        val bh = 52 * dp
        val gap = 12 * dp
        val cx = vw / 2
        val resume = game.let { it != null && it.phase != Phase.GAME_OVER }
        var top = vh * 0.36f
        if (resume) {
            btnResume.set(cx - bw / 2, top, cx + bw / 2, top + bh)
            top += bh + gap
        } else {
            btnResume.setEmpty()
        }
        btnCpu.set(cx - bw / 2, top, cx + bw / 2, top + bh)
        btnTwo.set(cx - bw / 2, btnCpu.bottom + gap, cx + bw / 2, btnCpu.bottom + gap + bh)
    }

    private fun startGame(mode: Mode) {
        val g = Game(mode)
        game = g
        screen = Screen.GAME
        zoomedOut = false
        pickerOpen = false
        clearInput()
        scale = closeScale
        camX = g.active.x
        camY = g.active.y
        resetHudAnimation()
    }

    private fun clearInput() {
        roles.clear()
        game?.let {
            it.moveDir = 0
            if (it.humanTurn) it.aiming = false
        }
    }

    // --------------------------------------------------------------- update

    private fun tick(dt: Float) {
        uiTime += dt
        if (screen != lastScreen) {
            lastScreen = screen
            screenSince = uiTime
        }
        val g = game
        if (screen == Screen.GAME && g != null) {
            g.update(dt)
            for (sfx in g.sounds) sound.play(sfx)
            g.sounds.clear()
            updateHudAnimation(g, dt)
            if (!g.humanTurn || g.phase == Phase.GAME_OVER) {
                roles.clear()
                g.moveDir = 0
                pickerOpen = false
            }
            updateCamera(g, dt)
        } else {
            scale = fullScale
            camX = Game.W / 2f
            camY = Game.H - vh / 2f / scale
        }
    }

    private fun updateCamera(g: Game, dt: Float) {
        val target = if (zoomedOut) fullScale else closeScale
        scale += (target - scale) * min(1f, dt * 5f)
        var tx: Float
        var ty: Float
        var speed = 3.5f
        val p = g.projectiles.firstOrNull()
        val flying = g.knocked.lastOrNull()
        if (zoomedOut) {
            tx = Game.W / 2f
            ty = Game.H / 2f
        } else if (flying != null) {
            // A worm thrown by a blast: watch it until it lands.
            tx = flying.x
            ty = flying.y
            speed = 6f
        } else if (p != null) {
            tx = p.x
            ty = p.y
            speed = 6f
        } else {
            tx = g.active.x
            ty = g.active.y - 40f
            if (g.aiming) {
                tx += cos(g.aimAngle) * 120f
                ty += sin(g.aimAngle) * 80f
            }
        }
        camX += (tx - camX) * min(1f, dt * speed)
        camY += (ty - camY) * min(1f, dt * speed)
        val hw = vw / 2f / scale
        val hh = vh / 2f / scale
        camX = if (hw * 2 >= Game.W) Game.W / 2f else camX.coerceIn(hw, Game.W - hw)
        val maxY = Game.H - hh
        val minY = hh - 260f
        camY = if (maxY <= minY) maxY else camY.coerceIn(minY, maxY)
    }

    // ---------------------------------------------------------------- input

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(e: MotionEvent): Boolean {
        synchronized(lock) {
            when (e.actionMasked) {
                MotionEvent.ACTION_DOWN, MotionEvent.ACTION_POINTER_DOWN -> {
                    val i = e.actionIndex
                    down(e.getPointerId(i), e.getX(i), e.getY(i))
                }
                MotionEvent.ACTION_MOVE -> for (i in 0 until e.pointerCount) {
                    if (roles[e.getPointerId(i)] == ROLE_AIM) aimMove(e.getX(i), e.getY(i))
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                    val i = e.actionIndex
                    up(e.getPointerId(i))
                }
                MotionEvent.ACTION_CANCEL -> clearInput()
            }
            updateMove()
        }
        return true
    }

    private fun down(id: Int, x: Float, y: Float) {
        // The open weapon picker sits over the top-right buttons, so it gets the tap first.
        if (!(screen == Screen.GAME && pickerOpen) && btnSound.contains(x, y)) {
            sound.toggleMute()
            return
        }
        if (screen == Screen.MENU) {
            layoutMenuButtons()
            when {
                btnResume.contains(x, y) -> screen = Screen.GAME
                btnCpu.contains(x, y) -> startGame(Mode.VS_CPU)
                btnTwo.contains(x, y) -> startGame(Mode.TWO_PLAYER)
            }
            return
        }
        val g = game ?: return
        if (g.phase == Phase.GAME_OVER) {
            if (btnAgain.contains(x, y)) startGame(g.mode)
            else if (btnToMenu.contains(x, y)) {
                screen = Screen.MENU
                game = null
            }
            return
        }
        if (btnPause.contains(x, y)) {
            screen = Screen.MENU
            clearInput()
            return
        }
        if (btnZoom.contains(x, y)) {
            zoomedOut = !zoomedOut
            return
        }
        if (!g.humanTurn) return
        if (pickerOpen) {
            pickerOpen = false
            for ((i, w) in g.loadout.withIndex()) {
                if (pickerRows[i].contains(x, y)) g.selectWeapon(w)
            }
            return
        }
        when {
            btnLeft.contains(x, y) -> roles[id] = ROLE_LEFT
            btnRight.contains(x, y) -> roles[id] = ROLE_RIGHT
            btnJump.contains(x, y) -> {
                roles[id] = ROLE_JUMP
                g.jumpRequested = true
            }
            btnWeapon.contains(x, y) -> {
                if (g.phase == Phase.PLAYING || g.phase == Phase.BANNER) pickerOpen = true
            }
            g.phase == Phase.PLAYING && !roles.containsValue(ROLE_AIM) -> {
                roles[id] = ROLE_AIM
                aimStartX = x; aimStartY = y
                aimCurX = x; aimCurY = y
                g.aiming = true
                g.aimPower = 0f
            }
        }
    }

    private fun aimMove(x: Float, y: Float) {
        val g = game ?: return
        aimCurX = x
        aimCurY = y
        if (!g.aiming) return
        val dx = aimStartX - x
        val dy = aimStartY - y
        val len = hypot(dx, dy)
        val dead = 12 * dp
        if (len > dead) {
            g.aimAngle = atan2(dy, dx)
            g.active.facing = if (dx >= 0) 1 else -1
        }
        g.aimPower = ((len - dead) / (150 * dp)).coerceIn(0f, 1f)
    }

    private fun up(id: Int) {
        val role = roles.remove(id) ?: return
        val g = game ?: return
        if (role == ROLE_AIM && g.aiming) {
            if (g.aimPower > 0.04f) g.fire() else g.aiming = false
        }
    }

    private fun updateMove() {
        val g = game ?: return
        if (!g.humanTurn) return
        val l = roles.containsValue(ROLE_LEFT)
        val r = roles.containsValue(ROLE_RIGHT)
        g.moveDir = (if (r) 1 else 0) - (if (l) 1 else 0)
    }

    // --------------------------------------------------------------- render

    private fun sx(wx: Float) = (wx - camX) * scale + vw / 2f
    private fun sy(wy: Float) = (wy - camY) * scale + vh / 2f

    private fun render(c: Canvas) {
        val g = if (screen == Screen.GAME) game ?: menuGame else menuGame
        drawWorld(c, g)
        if (screen == Screen.GAME && game != null) {
            drawLabels(c, g)
            drawHud(c, g)
        } else {
            drawMenu(c)
        }
    }

    private fun drawWorld(c: Canvas, g: Game) {
        c.drawRect(0f, 0f, vw, vh, sky)

        c.save()
        var shx = 0f
        var shy = 0f
        if (g.shake > 0f) {
            shx = (Math.random().toFloat() - 0.5f) * g.shake * scale
            shy = (Math.random().toFloat() - 0.5f) * g.shake * scale
        }
        c.translate(vw / 2f + shx, vh / 2f + shy)
        c.scale(scale, scale)
        c.translate(-camX, -camY)

        val left = camX - vw / 2f / scale - 40f
        val right = camX + vw / 2f / scale + 40f
        val top = camY - vh / 2f / scale - 40f

        // Back wall of the dungeon, scrolling slower than the floor for depth.
        val par = camX * 0.4f
        wallMatrix.setTranslate(par, 0f)
        wall.shader.setLocalMatrix(wallMatrix)
        c.drawRect(left, top, right, Game.WATER_Y.toFloat(), wall)
        drawTorches(c, g, par, left, right)
        drawPillars(c, left, right, top)
        drawChains(c, g, left, right)
        c.drawRect(left, Game.WATER_Y - 110f, right, Game.WATER_Y.toFloat(), pitGlow)

        syncTerrain(g.terrain)
        terrainBmp?.let {
            rect.set(0f, 0f, Game.W.toFloat(), Game.H.toFloat())
            c.drawBitmap(it, null, rect, bmpPaint)
        }

        for (w in g.worms) drawWorm(c, g, w)
        for (gate in g.gates) drawGate(c, g, gate)
        for (p in g.projectiles) drawProjectile(c, p)
        drawParticles(c, g, emissive = false)
        for (b in g.boxes) drawBox(c, g, b)
        drawPit(c, g, left, right)

        drawLighting(c, g, par, left, right, top)
        // Things that give off light sit above the darkness.
        drawParticles(c, g, emissive = true)
        drawDust(c, g, left, right, top)
        drawStalactites(c, left, right)
        if (screen == Screen.GAME) drawAim(c, g)
        c.restore()

        c.drawRect(0f, 0f, vw, vh, vignette)
        if (g.flash > 0f) {
            fill.color = 0xFFFFF4E0.toInt()
            fill.alpha = (110 * g.flash).toInt()
            c.drawRect(0f, 0f, vw, vh, fill)
            fill.alpha = 255
        }
    }

    /** Gather this frame's lights: torches, explosions, magic, gates, the pit, loot and the fighter whose turn it is. */
    private fun collectLights(g: Game, par: Float, left: Float, right: Float) {
        lightCount = 0
        fun add(x: Float, y: Float, r: Float, k: Float, color: Int) {
            if (x + r < left || x - r > right) return
            if (lightCount == lightPool.size) lightPool.add(Light())
            val l = lightPool[lightCount++]
            l.x = x; l.y = y; l.r = r; l.k = k.coerceIn(0f, 1f); l.color = color
        }
        val spacing = 320f
        var k = kotlin.math.floor((left - par) / spacing).toInt()
        while (k * spacing + par < right + 200f) {
            val x = k * spacing + par + 60f
            val y = 170f + (((k % 3) + 3) % 3) * 40f
            val flick = sin(g.time * 13f + k * 1.7f) * 0.08f + sin(g.time * 7.3f + k) * 0.06f
            add(x, y - 8f, 190f * (1f + flick), 0.9f, TORCH_COLOR)
            k++
        }
        var px = kotlin.math.floor(left / 160f) * 160f
        while (px < right + 160f) {
            add(px, Game.WATER_Y + 30f, 150f, 0.55f, 0xFFFF4A1A.toInt())
            px += 160f
        }
        for (p in g.particles) {
            val f = p.life / p.maxLife
            when (p.kind) {
                PKind.RING -> add(p.x, p.y, p.size * 4f, f, p.color)
                PKind.FIRE -> if (p.size > 8f) add(p.x, p.y, p.size * 3f, f * 0.35f, 0xFFFF8A2A.toInt())
            }
        }
        for (p in g.projectiles) {
            when {
                p.healing -> add(p.x, p.y, 70f, 0.8f, 0xFF7AFF9A.toInt())
                p.kind == Kind.BOLT -> add(p.x, p.y, 80f, 0.9f, 0xFFC08AFF.toInt())
                p.kind == Kind.SATCHEL -> add(p.x, p.y, 60f, 0.7f, 0xFFFF4A2A.toInt())
                p.kind == Kind.LOBBER -> add(p.x, p.y, 40f, 0.6f, 0xFFFFB04A.toInt())
            }
        }
        for (gate in g.gates) add(gate.x, gate.y, 110f + 60f * gate.flash, 0.75f + 0.25f * gate.flash, gate.effect.color)
        for (b in g.boxes) add(b.x, b.y, 55f, 0.6f, 0xFFFFD34A.toInt())
        for (cr in g.terrain.crystals) add(cr[0].toFloat(), cr[1].toFloat(), 42f, 0.45f + 0.1f * sin(g.time * 2f + cr[0]), cr[2])
        // Every fighter carries a little light so nobody vanishes into the dark.
        for (w in g.worms) if (w.alive) add(w.x, w.y - 6f, 55f, 0.55f, 0xFFFFE8C0.toInt())
        if (screen == Screen.GAME && g.phase != Phase.GAME_OVER && g.active.alive) {
            add(g.active.x, g.active.y - 10f, 110f, 0.7f, 0xFFFFE8C0.toInt())
        }
    }

    private fun drawLighting(c: Canvas, g: Game, par: Float, left: Float, right: Float, top: Float) {
        collectLights(g, par, left, right)
        val bottom = Game.H + 400f
        rect.set(left, top, right, bottom)
        c.saveLayer(rect, null)
        darkness.color = 0xB8050308.toInt()
        c.drawRect(rect, darkness)
        for (i in 0 until lightCount) {
            val l = lightPool[i]
            c.save()
            c.translate(l.x, l.y)
            c.scale(l.r, l.r)
            lightCut.alpha = (255 * l.k).toInt()
            c.drawCircle(0f, 0f, 1f, lightCut)
            c.restore()
        }
        c.restore()
        // Coloured additive glow so light has a tint, not just less darkness.
        for (i in 0 until lightCount) {
            val l = lightPool[i]
            val color = l.color
            glow.shader = glowShaders.getOrPut(color) {
                RadialGradient(0f, 0f, 1f, intArrayOf((color and 0x00FFFFFF) or 0x55000000, color and 0x00FFFFFF),
                    null, Shader.TileMode.CLAMP)
            }
            glow.alpha = (255 * l.k).toInt()
            c.save()
            c.translate(l.x, l.y)
            c.scale(l.r * 0.7f, l.r * 0.7f)
            c.drawCircle(0f, 0f, 1f, glow)
            c.restore()
        }
    }

    private fun syncTerrain(t: Terrain) {
        var bmp = terrainBmp
        if (bmp == null) {
            bmp = Bitmap.createBitmap(t.w, t.h, Bitmap.Config.ARGB_8888)
            terrainBmp = bmp
        }
        if (bmpOwner !== t) {
            bmpOwner = t
            t.markAllDirty()
        }
        if (t.dirty) {
            val l = t.dirtyL
            val top = t.dirtyT
            bmp!!.setPixels(t.pixels, top * t.w + l, t.w, l, top, t.dirtyR - l, t.dirtyB - top)
            t.clearDirty()
        }
    }

    /** Iron sconces on the back wall with flickering flames. */
    private fun drawTorches(c: Canvas, g: Game, par: Float, left: Float, right: Float) {
        val spacing = 320f
        var k = kotlin.math.floor((left - par) / spacing).toInt()
        while (k * spacing + par < right) {
            val x = k * spacing + par + 60f
            val y = 170f + (((k % 3) + 3) % 3) * 40f
            val flick = sin(g.time * 13f + k * 1.7f) * 0.15f + sin(g.time * 7.3f + k) * 0.1f
            fill.color = 0x22FFA040
            c.drawCircle(x, y - 8f, 60f * (1f + flick), fill)
            fill.color = 0x33FFB050
            c.drawCircle(x, y - 8f, 30f * (1f + flick), fill)
            fill.color = 0xFF3A302A.toInt()
            c.drawRect(x - 2f, y - 4f, x + 2f, y + 12f, fill)
            c.drawRect(x - 5f, y - 5f, x + 5f, y - 2f, fill)
            path.reset()
            path.moveTo(x - 4f, y - 5f)
            path.quadTo(x - 3f, y - 14f - flick * 10f, x + flick * 6f, y - 20f - flick * 8f)
            path.quadTo(x + 4f, y - 12f, x + 4f, y - 5f)
            path.close()
            fill.color = 0xFFFF8A2A.toInt()
            c.drawPath(path, fill)
            fill.color = 0xFFFFE070.toInt()
            c.drawCircle(x, y - 8f, 2.2f, fill)
            k++
        }
    }

    /** Stone columns between the back wall and the floor, scrolling at their own depth. */
    private fun drawPillars(c: Canvas, left: Float, right: Float, top: Float) {
        val spacing = 520f
        val shift = camX * 0.25f
        var k = kotlin.math.floor((left - shift - 200f) / spacing).toInt()
        while (k * spacing + shift + 200f < right + 60f) {
            val x = k * spacing + shift + 200f
            val w = 34f
            val t = min(top, -200f)
            val b = Game.WATER_Y.toFloat()
            fill.color = 0xFF4A3E36.toInt()
            c.drawRect(x - w / 2, t, x - w / 6, b, fill)
            fill.color = 0xFF3A302A.toInt()
            c.drawRect(x - w / 6, t, x + w / 6, b, fill)
            fill.color = 0xFF2A221D.toInt()
            c.drawRect(x + w / 6, t, x + w / 2, b, fill)
            // Block joints and a carved band.
            fill.color = 0xFF16110E.toInt()
            var y = kotlin.math.floor(t / 70f) * 70f
            while (y < b) {
                c.drawRect(x - w / 2, y, x + w / 2, y + 2f, fill)
                y += 70f
            }
            fill.color = 0xFF443830.toInt()
            c.drawRect(x - w / 2 - 5f, 60f, x + w / 2 + 5f, 72f, fill)
            fill.color = 0xFF2A221D.toInt()
            c.drawRect(x - w / 2 - 5f, 72f, x + w / 2 + 5f, 76f, fill)
            k++
        }
    }

    /** Chains hanging from the unseen ceiling, some ending in hooks or cages, swaying slightly. */
    private fun drawChains(c: Canvas, g: Game, left: Float, right: Float) {
        val spacing = 380f
        val shift = camX * 0.15f
        var k = kotlin.math.floor((left - shift - 90f) / spacing).toInt()
        while (k * spacing + shift + 90f < right + 60f) {
            val seed = ((k * 2654435761L) ushr 7).toInt() and 0xFFFF
            val x = k * spacing + shift + 90f + (seed % 120)
            val end = 110f + (seed % 170)
            val sway = sin(g.time * 0.8f + k * 1.3f) * 0.05f
            c.save()
            c.rotate((sway * 180 / PI).toFloat(), x, -400f)
            stroke.color = 0xFF4A4440.toInt()
            stroke.strokeWidth = 1.6f
            var y = -400f
            var i = 0
            while (y < end) {
                if (i % 2 == 0) {
                    rect.set(x - 2.5f, y, x + 2.5f, y + 8f)
                    c.drawOval(rect, stroke)
                } else {
                    c.drawLine(x, y, x, y + 8f, stroke)
                }
                y += 6f
                i++
            }
            when (seed % 3) {
                0 -> { // cage
                    stroke.strokeWidth = 1.4f
                    rect.set(x - 14f, end, x + 14f, end + 36f)
                    c.drawArc(x - 14f, end - 8f, x + 14f, end + 10f, 180f, 180f, false, stroke)
                    for (bx in -2..2) c.drawLine(x + bx * 7f, end + 1f, x + bx * 7f, end + 36f, stroke)
                    c.drawLine(x - 14f, end + 36f, x + 14f, end + 36f, stroke)
                    if (seed % 2 == 0) {
                        fill.color = 0xFF8A8270.toInt()
                        c.drawCircle(x - 3f, end + 30f, 4f, fill) // a former contestant
                        fill.color = 0xFF1A1210.toInt()
                        c.drawCircle(x - 4.5f, end + 29.5f, 1f, fill)
                        c.drawCircle(x - 1.5f, end + 29.5f, 1f, fill)
                    }
                }
                1 -> { // hook
                    stroke.strokeWidth = 2f
                    c.drawArc(x - 5f, end, x + 5f, end + 12f, -90f, 270f, false, stroke)
                }
                else -> {}
            }
            c.restore()
            k++
        }
    }

    /** Rock spikes in the foreground, hanging from the top of the view and scrolling faster than the world. */
    private fun drawStalactites(c: Canvas, left: Float, right: Float) {
        val viewTop = camY - vh / 2f / scale
        val spacing = 150f
        val shift = -camX * 0.35f
        var k = kotlin.math.floor((left - shift) / spacing).toInt() - 1
        fill.color = 0xFF070405.toInt()
        stroke.color = 0x33FFB070
        stroke.strokeWidth = 1f
        while (k * spacing + shift < right + spacing) {
            val seed = ((k * 40503L + 7) ushr 3).toInt() and 0xFFF
            val x = k * spacing + shift + (seed % 60)
            val len = 22f + (seed % 50)
            val wd = 10f + (seed % 12)
            path.reset()
            path.moveTo(x - wd, viewTop - 5f)
            path.lineTo(x - wd * 0.3f, viewTop + len * 0.55f)
            path.lineTo(x, viewTop + len)
            path.lineTo(x + wd * 0.35f, viewTop + len * 0.4f)
            path.lineTo(x + wd, viewTop - 5f)
            path.close()
            c.drawPath(path, fill)
            c.drawLine(x - wd * 0.3f, viewTop + len * 0.55f, x, viewTop + len, stroke)
            k++
        }
    }

    /** Dust drifting through the air, only visible where torchlight catches it. */
    private fun drawDust(c: Canvas, g: Game, left: Float, right: Float, top: Float) {
        val width = right - left
        val height = Game.WATER_Y - top
        if (height <= 0f) return
        for (i in 0 until 90) {
            val x = left + ((i * 137.5f + g.time * (4f + i % 5)) % width + width) % width
            val y = top + ((i * 71.3f + g.time * (2f + i % 3) + sin(g.time * 0.6f + i) * 15f) % height + height) % height
            var a = 0f
            for (li in 0 until lightCount) {
                val l = lightPool[li]
                if (l.color != TORCH_COLOR) continue
                val d = hypot(l.x - x, l.y - y)
                if (d < l.r) a = max(a, 1f - d / l.r)
            }
            if (a <= 0.05f) continue
            fill.color = 0xFFFFE6C0.toInt()
            fill.alpha = (200 * a).toInt()
            c.drawCircle(x, y, 0.7f + (i % 3) * 0.35f, fill)
        }
        fill.alpha = 255
    }

    /** The bottomless pit: jagged spikes over darkness, with embers drifting up. */
    private fun drawPit(c: Canvas, g: Game, left: Float, right: Float) {
        val base = Game.WATER_Y.toFloat()
        fill.color = 0xFF0A0504.toInt()
        c.drawRect(left, base + 6f, right, Game.H + 2000f, fill)
        path.reset()
        path.moveTo(left, base + 12f)
        var x = kotlin.math.floor(left / 14f) * 14f
        var i = 0
        while (x <= right + 14f) {
            val h = 10f + ((i * 7919) % 5) * 3f
            path.lineTo(x, base + 12f)
            path.lineTo(x + 7f, base + 12f - h)
            x += 14f
            i++
        }
        path.lineTo(right + 14f, base + 30f)
        path.lineTo(left, base + 30f)
        path.close()
        fill.color = 0xFF2A1812.toInt()
        c.drawPath(path, fill)
        for (e in 0 until 24) {
            val ex = left + ((e * 97.3f + g.time * 7f) % (right - left + 1f))
            val life = (g.time * 0.4f + e * 0.173f) % 1f
            fill.color = 0xFFFF7A3A.toInt()
            fill.alpha = (200 * (1f - life)).toInt()
            c.drawCircle(ex + sin(g.time * 2f + e) * 4f, base + 10f - life * 90f, 1.4f, fill)
        }
        fill.alpha = 255
    }

    /** A floating portal: glowing ring, orbiting motes, brighter for a moment after something passes. */
    private fun drawGate(c: Canvas, g: Game, gate: Gate) {
        val fading = gate.turnsLeft <= 1 && sin(g.time * 10f) > 0f
        val a = if (fading) 0.45f else 1f
        val hh = gate.halfHeight
        val pulse = 1f + 0.06f * sin(g.time * 4f + gate.id) + gate.flash * 0.3f
        fill.color = gate.effect.color
        fill.alpha = ((40 + 80 * gate.flash) * a).toInt()
        rect.set(gate.x - 18f * pulse, gate.y - hh * 1.15f * pulse, gate.x + 18f * pulse, gate.y + hh * 1.15f * pulse)
        c.drawOval(rect, fill)
        fill.color = 0xFF0A0610.toInt()
        fill.alpha = (200 * a).toInt()
        rect.set(gate.x - 8f, gate.y - hh, gate.x + 8f, gate.y + hh)
        c.drawOval(rect, fill)
        stroke.color = gate.effect.color
        stroke.alpha = (255 * a).toInt()
        stroke.strokeWidth = 3f
        c.drawOval(rect, stroke)
        fill.color = gate.effect.color
        for (i in 0 until 6) {
            val t = g.time * 2.5f + i * PI.toFloat() / 3f
            fill.alpha = (200 * a).toInt()
            c.drawCircle(gate.x + cos(t) * 5f, gate.y + sin(t) * (hh - 6f), 1.4f, fill)
        }
        fill.alpha = 255
        stroke.alpha = 255
    }

    private fun drawBox(c: Canvas, g: Game, b: LootBox) {
        val col = when (b.tier) {
            0 -> 0xFFCD7F32.toInt()
            1 -> 0xFFC8D0DA.toInt()
            else -> 0xFFFFD34A.toInt()
        }
        val glow = 0.5f + 0.5f * sin(g.time * 5f + b.x)
        fill.color = col
        fill.alpha = (60 + 60 * glow).toInt()
        c.drawCircle(b.x, b.y, 14f, fill)
        fill.alpha = 255
        rect.set(b.x - 7f, b.y - 6f, b.x + 7f, b.y + 6f)
        c.drawRoundRect(rect, 1.5f, 1.5f, fill)
        fill.color = 0xFF3A2A1A.toInt()
        c.drawRect(b.x - 7f, b.y - 1.5f, b.x + 7f, b.y - 0.5f, fill)
        c.drawRect(b.x - 1.5f, b.y - 6f, b.x + 1.5f, b.y + 6f, fill)
        fill.color = 0xFFFFFFFF.toInt()
        c.drawCircle(b.x - 4f, b.y - 3.5f, 0.9f, fill)
        if (!b.landed) {
            // A little parachute while it drops in.
            stroke.color = 0xAAE8E2D0.toInt()
            stroke.strokeWidth = 0.8f
            c.drawLine(b.x - 7f, b.y - 6f, b.x - 10f, b.y - 18f, stroke)
            c.drawLine(b.x + 7f, b.y - 6f, b.x + 10f, b.y - 18f, stroke)
            fill.color = 0xFFD63A3A.toInt()
            rect.set(b.x - 13f, b.y - 26f, b.x + 13f, b.y - 12f)
            c.drawArc(rect, 180f, 180f, true, fill)
        }
    }

    private fun drawWorm(c: Canvas, g: Game, w: Worm) {
        if (w.drowned) return
        val x = w.x
        val y = w.y
        if (!w.alive) {
            // Skull and crossbones where the fighter fell.
            stroke.color = 0xFFE8E2D0.toInt()
            stroke.strokeWidth = 2f
            c.drawLine(x - 6f, y + 3f, x + 6f, y + 9f, stroke)
            c.drawLine(x + 6f, y + 3f, x - 6f, y + 9f, stroke)
            fill.color = 0xFFE8E2D0.toInt()
            c.drawCircle(x, y, 5.5f, fill)
            c.drawRect(x - 3f, y + 3f, x + 3f, y + 6.5f, fill)
            fill.color = 0xFF1A1210.toInt()
            c.drawCircle(x - 2f, y - 0.5f, 1.5f, fill)
            c.drawCircle(x + 2f, y - 0.5f, 1.5f, fill)
            return
        }
        val isActive = w === g.active && g.phase != Phase.GAME_OVER
        val bob = if (w.onGround) sin(g.time * 4f + x) * 0.5f else 0f

        // Team-coloured glow on the ground marks whose side each fighter is on.
        fill.color = TEAM_COLORS[w.team]
        fill.alpha = 150
        rect.set(x - 10f, y + 7.5f, x + 10f, y + 11f)
        c.drawOval(rect, fill)
        fill.alpha = 255

        // Squash on landing, gentle breathing when idle, tumbling when knocked flying.
        val breathe = if (w.onGround && w.walkTimer <= 0f) sin(g.time * 2.2f + x * 0.1f) * 0.025f else 0f
        val sq = w.squash
        val stretch = if (!w.onGround) (kotlin.math.abs(w.vy) / 900f).coerceAtMost(0.15f) else 0f
        c.save()
        c.scale(1f + 0.28f * sq - stretch * 0.5f, 1f - 0.28f * sq + breathe + stretch, x, y + Game.R)
        if (w.spin != 0f) c.rotate(w.spin, x, y)
        val blinking = ((g.time + x * 0.37f) % 3.4f) < 0.12f
        val walking = (w.walkTimer / 0.12f).coerceIn(0f, 1f)
        art.draw(c, w.species, x, y + bob, w.facing.toFloat(), g.time, !w.onGround,
            w.walkPhase, walking, blinking, w.hitFlash > 0f && (w.hitFlash * 20f).toInt() % 2 == 0)
        c.restore()

        // What it is holding while it takes aim.
        val held = g.weapon.action in listOf(Action.ARC, Action.FUSE, Action.BOLT) ||
            g.weapon == Weapon.CLUB || g.weapon == Weapon.SHIELD_BASH
        if (isActive && g.phase == Phase.PLAYING && held) {
            val hx = x + cos(g.aimAngle) * 11f
            val hy = y + sin(g.aimAngle) * 11f
            c.save()
            c.translate(hx, hy)
            c.rotate((g.aimAngle * 180 / PI).toFloat())
            drawThrowable(c, g.weapon)
            c.restore()
        }
    }

    /** Small in-hand version of each weapon, centred on the origin. */
    private fun drawThrowable(c: Canvas, w: Weapon) {
        when (w) {
            Weapon.HOB_LOBBER -> {
                fill.color = 0xFF2A2A30.toInt()
                c.drawCircle(0f, 0f, 3.6f, fill)
                fill.color = 0xFF8A6A4A.toInt()
                c.drawRect(-0.5f, -5.5f, 0.5f, -3f, fill)
                fill.color = 0xFFFFC04A.toInt()
                c.drawCircle(0f, -6f, 1f, fill)
            }
            Weapon.POTION_BOMB -> {
                fill.color = 0xFFE05AA0.toInt()
                c.drawCircle(0f, 1f, 3.4f, fill)
                fill.color = 0xFFB0C8D0.toInt()
                c.drawRect(-1f, -4.5f, 1f, -2f, fill)
                fill.color = 0xFFFFFFFF.toInt()
                c.drawCircle(-1.2f, 0f, 0.8f, fill)
            }
            Weapon.SCATTER -> {
                fill.color = 0xFF8A6A4A.toInt()
                rect.set(-4f, -3f, 4f, 4f)
                c.drawOval(rect, fill)
                fill.color = 0xFF5A4030.toInt()
                c.drawRect(-1.5f, -4.5f, 1.5f, -2.5f, fill)
                fill.color = 0xFF2A2A30.toInt()
                c.drawCircle(-1.3f, 1f, 1.1f, fill)
                c.drawCircle(1.5f, 1.5f, 1.1f, fill)
            }
            Weapon.MISSILE -> {
                fill.color = 0x55C08AFF
                c.drawCircle(0f, 0f, 5.5f, fill)
                fill.color = 0xFFD8B8FF.toInt()
                c.drawCircle(0f, 0f, 2.6f, fill)
            }
            Weapon.KICK -> {
                fill.color = 0xFFE8B894.toInt()
                rect.set(-4.5f, -2f, 4.5f, 2.5f)
                c.drawOval(rect, fill)
                c.drawRect(-4.5f, -6f, -1.5f, 0f, fill)
            }
            Weapon.SATCHEL -> {
                fill.color = 0xFF7A5634.toInt()
                rect.set(-4f, -3f, 4f, 4f)
                c.drawRoundRect(rect, 1.5f, 1.5f, fill)
                fill.color = 0xFF5A4030.toInt()
                c.drawRect(-4f, -3f, 4f, -1f, fill)
                fill.color = 0xFFFF4A4A.toInt()
                c.drawCircle(3f, -4f, 1f, fill)
            }
            Weapon.BITE -> {
                fill.color = 0xFF8A2A3A.toInt()
                rect.set(-5f, -3.5f, 5f, 3.5f)
                c.drawOval(rect, fill)
                fill.color = 0xFFF4F0E0.toInt()
                for (i in -2..1) {
                    path.reset()
                    path.moveTo(i * 2f, -3f); path.lineTo(i * 2f + 2f, -3f); path.lineTo(i * 2f + 1f, -0.5f); path.close()
                    c.drawPath(path, fill)
                    path.reset()
                    path.moveTo(i * 2f, 3f); path.lineTo(i * 2f + 2f, 3f); path.lineTo(i * 2f + 1f, 0.5f); path.close()
                    c.drawPath(path, fill)
                }
            }
            Weapon.POUNCE -> {
                fill.color = 0xFF5E8A4E.toInt()
                c.drawCircle(0f, 1.5f, 2.8f, fill)
                for (i in -1..1) c.drawCircle(i * 2.6f, -2.5f + kotlin.math.abs(i) * 0.8f, 1.2f, fill)
            }
            Weapon.ROAR -> {
                stroke.color = 0xFFFFE0A0.toInt()
                stroke.strokeWidth = 1f
                for (k in 1..3) {
                    rect.set(-k * 1.8f, -k * 1.8f, k * 1.8f, k * 1.8f)
                    c.drawArc(rect, -45f, 90f, false, stroke)
                }
                fill.color = 0xFFFFE0A0.toInt()
                c.drawCircle(-1f, 0f, 1.2f, fill)
            }
            Weapon.KNIFE -> {
                fill.color = 0xFFC8CCD4.toInt()
                path.reset()
                path.moveTo(-1f, -1.2f); path.lineTo(6f, 0f); path.lineTo(-1f, 1.2f); path.close()
                c.drawPath(path, fill)
                fill.color = 0xFF6A4A2E.toInt()
                c.drawRect(-4.5f, -1f, -1f, 1f, fill)
            }
            Weapon.SPEAR -> {
                fill.color = 0xFF8A6A4A.toInt()
                c.drawRect(-8f, -0.6f, 5f, 0.6f, fill)
                fill.color = 0xFFC8CCD4.toInt()
                path.reset()
                path.moveTo(5f, -1.8f); path.lineTo(9f, 0f); path.lineTo(5f, 1.8f); path.close()
                c.drawPath(path, fill)
            }
            Weapon.SHIELD_BASH -> {
                fill.color = 0xFF6E747C.toInt()
                c.drawCircle(0f, 0f, 4.5f, fill)
                fill.color = 0xFF7A5634.toInt()
                c.drawCircle(0f, 0f, 3.5f, fill)
                fill.color = 0xFF9AA0A8.toInt()
                c.drawCircle(0f, 0f, 1.2f, fill)
            }
            Weapon.BOULDER -> {
                fill.color = 0xFF8A8578.toInt()
                c.drawCircle(0f, 0f, 5f, fill)
                fill.color = 0xFF6A665C.toInt()
                c.drawCircle(1.5f, 1.2f, 1.6f, fill)
                c.drawCircle(-2f, -1.5f, 1f, fill)
            }
            Weapon.CLUB -> {
                fill.color = 0xFF7A5634.toInt()
                c.drawRect(-5f, -0.9f, 1f, 0.9f, fill)
                rect.set(0f, -2.5f, 7f, 2.5f)
                c.drawOval(rect, fill)
            }
            Weapon.SLAM -> {
                fill.color = 0xFFFFE0A0.toInt()
                path.reset()
                for (k in 0 until 10) {
                    val a = k * PI.toFloat() / 5f
                    val rr = if (k % 2 == 0) 5f else 2.2f
                    if (k == 0) path.moveTo(cos(a) * rr, sin(a) * rr) else path.lineTo(cos(a) * rr, sin(a) * rr)
                }
                path.close()
                c.drawPath(path, fill)
            }
        }
    }

    private fun drawProjectile(c: Canvas, p: Projectile) {
        c.save()
        c.translate(p.x, p.y)
        if (p.healing) {
            fill.color = 0x557AFF9A
            c.drawCircle(0f, 0f, 9f, fill)
        }
        if (p.power != 1f) {
            val k = kotlin.math.sqrt(p.power).coerceIn(0.6f, 2.2f)
            c.scale(k, k)
            if (p.power > 1.3f) {
                fill.color = 0x44FF9A3A
                c.drawCircle(0f, 0f, 7f, fill)
            }
        }
        val heading = (atan2(p.vy, p.vx) * 180 / PI).toFloat()
        when (p.kind) {
            Kind.KNIFE -> {
                c.rotate(heading)
                drawThrowable(c, Weapon.KNIFE)
            }
            Kind.SPEAR -> {
                c.rotate(heading)
                drawThrowable(c, Weapon.SPEAR)
            }
            Kind.BOULDER -> {
                c.rotate(p.age * 300f)
                drawThrowable(c, Weapon.BOULDER)
            }
            Kind.BOLT -> {
                fill.color = 0x55C08AFF
                c.drawCircle(0f, 0f, 7f, fill)
                fill.color = 0xFFD8B8FF.toInt()
                c.drawCircle(0f, 0f, 3f, fill)
                fill.color = 0xFFFFFFFF.toInt()
                c.drawCircle(0f, 0f, 1.4f, fill)
            }
            Kind.LOBBER -> {
                c.rotate(p.age * 400f)
                drawThrowable(c, Weapon.HOB_LOBBER)
            }
            Kind.POTION -> {
                c.rotate(p.age * 300f)
                drawThrowable(c, Weapon.POTION_BOMB)
            }
            Kind.SCATTER -> drawThrowable(c, Weapon.SCATTER)
            Kind.SHARD -> {
                fill.color = 0xFF2A2A30.toInt()
                c.drawCircle(0f, 0f, 2.2f, fill)
                fill.color = 0xFFFFC04A.toInt()
                c.drawCircle(0f, -2.6f, 0.7f, fill)
            }
            Kind.SATCHEL -> {
                fill.color = 0x44FF4A1A
                c.drawCircle(0f, -4f, 9f, fill)
                drawThrowable(c, Weapon.SATCHEL)
            }
        }
        c.restore()
    }

    /** [emissive] draws the glowing kinds (fire, sparks, rings), otherwise the rest (smoke, dirt, rock). */
    private fun drawParticles(c: Canvas, g: Game, emissive: Boolean) {
        for (p in g.particles) {
            val glows = p.kind == PKind.FIRE || p.kind == PKind.SPARK || p.kind == PKind.RING
            if (glows != emissive) continue
            val f = (p.life / p.maxLife).coerceIn(0f, 1f)
            when (p.kind) {
                PKind.CHUNK -> {
                    fill.color = p.color
                    fill.alpha = (255 * min(1f, f * 3f)).toInt()
                    c.save()
                    c.rotate(p.rot, p.x, p.y)
                    path.reset()
                    path.moveTo(p.x - p.size, p.y - p.size * 0.4f)
                    path.lineTo(p.x - p.size * 0.2f, p.y - p.size)
                    path.lineTo(p.x + p.size, p.y - p.size * 0.3f)
                    path.lineTo(p.x + p.size * 0.5f, p.y + p.size * 0.8f)
                    path.lineTo(p.x - p.size * 0.6f, p.y + p.size * 0.7f)
                    path.close()
                    c.drawPath(path, fill)
                    c.restore()
                }
                PKind.FIRE -> {
                    // Additive, so overlapping flames burn brighter towards white.
                    fire.color = p.color
                    fire.alpha = (170 * f).toInt()
                    c.drawCircle(p.x, p.y, p.size * (0.4f + 0.6f * f), fire)
                    fire.color = 0xFFFFE8A0.toInt()
                    fire.alpha = (160 * f * f).toInt()
                    c.drawCircle(p.x, p.y, p.size * 0.45f * f, fire)
                }
                PKind.SMOKE -> {
                    fill.color = p.color
                    fill.alpha = (130 * f).toInt()
                    c.drawCircle(p.x, p.y, p.size * (1.6f - f), fill)
                }
                PKind.RING -> {
                    stroke.color = p.color
                    stroke.alpha = (255 * f).toInt()
                    stroke.strokeWidth = 3f
                    c.drawCircle(p.x, p.y, p.size * (0.3f + 0.9f * (1f - f)), stroke)
                }
                else -> {
                    fill.color = p.color
                    fill.alpha = (255 * min(1f, f * 2f)).toInt()
                    c.drawRect(p.x - p.size / 2, p.y - p.size / 2, p.x + p.size / 2, p.y + p.size / 2, fill)
                }
            }
        }
        fill.alpha = 255
        stroke.alpha = 255
    }

    private fun drawAim(c: Canvas, g: Game) {
        if (g.phase != Phase.PLAYING || !g.aiming) return
        val w = g.active
        val action = g.weapon.action
        if (action == Action.ROAR || action == Action.SLAM) {
            stroke.color = TEAM_COLORS[g.team]
            stroke.strokeWidth = 1.5f
            stroke.alpha = 160
            c.drawCircle(w.x, w.y, g.weapon.radius, stroke)
            stroke.alpha = 255
            return
        }
        if (action == Action.DROP) return
        val dx = cos(g.aimAngle)
        val dy = sin(g.aimAngle)
        val color = TEAM_COLORS[g.team]
        // Crosshair
        val reach = if (action == Action.MELEE) 20f else 48f
        val cx = w.x + dx * reach
        val cy = w.y + dy * reach
        stroke.color = color
        stroke.strokeWidth = 2f
        c.drawCircle(cx, cy, 6f, stroke)
        c.drawLine(cx - 9f, cy, cx - 3f, cy, stroke)
        c.drawLine(cx + 3f, cy, cx + 9f, cy, stroke)
        c.drawLine(cx, cy - 9f, cx, cy - 3f, stroke)
        c.drawLine(cx, cy + 3f, cx, cy + 9f, stroke)
        // Trajectory dots (no wind, first part only)
        val n = g.previewPath(preview)
        fill.color = 0xFFFFFFFF.toInt()
        for (i in 0 until n) {
            fill.alpha = 220 - i * 200 / max(1, n)
            c.drawCircle(preview[i * 2], preview[i * 2 + 1], 2.2f, fill)
        }
        fill.alpha = 255
    }

    // ------------------------------------------------------------------ HUD

    private fun font(tf: Typeface, size: Float, color: Int, align: Paint.Align = Paint.Align.CENTER) {
        text.typeface = tf
        text.textSize = size
        text.color = color
        text.textAlign = align
    }

    /**
     * The house style for every panel: near-black glass, a thin accent border and bright corner brackets,
     * like an on-screen notice from the dungeon's System AI.
     */
    private fun drawPanel(c: Canvas, r: RectF, accent: Int, strong: Boolean = false, fillColor: Int = PANEL) {
        val rad = 5 * dp
        fill.color = fillColor
        c.drawRoundRect(r, rad, rad, fill)
        fill.color = 0x12FFFFFF
        c.drawRect(r.left + 3 * dp, r.top + 2 * dp, r.right - 3 * dp, r.top + 3 * dp, fill)
        stroke.color = accent
        stroke.alpha = if (strong) 200 else 90
        stroke.strokeWidth = if (strong) 1.5f * dp else 1f * dp
        c.drawRoundRect(r, rad, rad, stroke)
        stroke.alpha = 255
        stroke.strokeWidth = 2 * dp
        val b = min(10 * dp, r.height() / 3)
        path.reset()
        path.moveTo(r.left, r.top + b); path.lineTo(r.left, r.top); path.lineTo(r.left + b, r.top)
        path.moveTo(r.right - b, r.top); path.lineTo(r.right, r.top); path.lineTo(r.right, r.top + b)
        path.moveTo(r.right, r.bottom - b); path.lineTo(r.right, r.bottom); path.lineTo(r.right - b, r.bottom)
        path.moveTo(r.left + b, r.bottom); path.lineTo(r.left, r.bottom); path.lineTo(r.left, r.bottom - b)
        c.drawPath(path, stroke)
    }

    /** Eases the numbers the HUD shows towards the real ones, so changes animate instead of jumping. */
    private fun updateHudAnimation(g: Game, dt: Float) {
        shownViewers += (g.viewers - shownViewers) * min(1f, dt * 3f)
        val delta = g.viewers - lastViewers
        if (delta >= 1_000_000L) {
            viewerPops.add(Pop("+" + formatViewers(delta.toFloat())))
            lastViewers = g.viewers
        }
        for (p in viewerPops) p.age += dt
        viewerPops.removeAll { it.age > 1.4f }
        for (t in 0..1) {
            val frac = g.teamHp(t) / g.teamMaxHp(t).toFloat()
            teamShown[t] += (frac - teamShown[t]) * min(1f, dt * 8f)
            teamLag[t] = if (teamLag[t] > teamShown[t]) teamLag[t] + (teamShown[t] - teamLag[t]) * min(1f, dt * 1.2f) else teamShown[t]
        }
        for (w in g.worms) {
            val cur = wormShownHp[w] ?: w.hp.toFloat()
            wormShownHp[w] = cur + (w.hp - cur) * min(1f, dt * 6f)
        }
    }

    private fun resetHudAnimation() {
        shownViewers = Game.START_VIEWERS.toFloat()
        lastViewers = Game.START_VIEWERS
        viewerPops.clear()
        teamShown.fill(1f)
        teamLag.fill(1f)
        wormShownHp.clear()
    }

    private fun drawLabels(c: Canvas, g: Game) {
        for (w in g.worms) {
            if (!w.alive) continue
            val x = sx(w.x)
            val y = sy(w.y - 22f)
            val col = TEAM_COLORS[w.team]
            val hp = ((wormShownHp[w] ?: w.hp.toFloat()) + 0.5f).toInt().toString()
            font(sysFont, 17 * dp, col)
            val tw = text.measureText(hp) + 12 * dp
            rect.set(x - tw / 2, y - 15 * dp, x + tw / 2, y + 2 * dp)
            fill.color = 0xDD0C0A12.toInt()
            c.drawRoundRect(rect, 3 * dp, 3 * dp, fill)
            stroke.color = col
            stroke.strokeWidth = 1 * dp
            stroke.alpha = 150
            c.drawRoundRect(rect, 3 * dp, 3 * dp, stroke)
            stroke.alpha = 255
            c.drawText(hp, x, y - 2 * dp, text)
            font(uiFont, 10 * dp, 0xFFFFFFFF.toInt())
            shadowText(c, w.name, x, y - 19 * dp)
        }
        // Bouncing arrow over the fighter whose turn it is.
        if ((g.phase == Phase.BANNER || g.phase == Phase.PLAYING) && !g.aiming) {
            val w = g.active
            val ax = sx(w.x)
            val ay = sy(w.y - 22f) - 42 * dp + sin(g.time * 6f) * 5 * dp
            path.reset()
            path.moveTo(ax - 9 * dp, ay - 10 * dp)
            path.lineTo(ax + 9 * dp, ay - 10 * dp)
            path.lineTo(ax, ay)
            path.close()
            fill.color = TEAM_COLORS[g.team]
            c.drawPath(path, fill)
        }
        for (gate in g.gates) {
            font(uiFont, 15 * dp, gate.effect.color)
            shadowText(c, gate.effect.label, sx(gate.x), sy(gate.y - gate.halfHeight) - 8 * dp)
        }
        for (p in g.projectiles) {
            if (g.bounces(p.kind)) {
                font(sysFont, 17 * dp, 0xFFFFFFFF.toInt())
                shadowText(c, ceil(p.fuse).toInt().toString(), sx(p.x), sy(p.y) - 14 * dp)
            }
        }
        for (t in g.texts) {
            font(sysFont, 22 * dp, if (t.team >= 0) TEAM_COLORS[t.team] else 0xFFFFE8C0.toInt())
            text.alpha = (255 * min(1f, t.life * 2f)).toInt()
            shadowText(c, t.text, sx(t.x), sy(t.y))
        }
        text.alpha = 255
    }

    private fun drawHud(c: Canvas, g: Game) {
        val m = 16 * dp

        // Team panels with animated health: the bright bar tracks health, a pale trail shows what was just lost.
        for (t in 0..1) {
            val top = m + t * 38 * dp
            rect.set(m, top, m + 250 * dp, top + 32 * dp)
            val ours = t == g.team && g.phase != Phase.GAME_OVER
            drawPanel(c, rect, TEAM_COLORS[t], strong = ours)
            font(uiFont, 12 * dp, TEAM_COLORS[t], Paint.Align.LEFT)
            c.drawText(Game.TEAM_NAMES[t], m + 10 * dp, top + 21 * dp, text)
            if (g.isCpu(t)) {
                val lw = text.measureText(Game.TEAM_NAMES[t])
                font(sysFont, 14 * dp, 0xAAFFFFFF.toInt(), Paint.Align.LEFT)
                c.drawText("CPU", m + 16 * dp + lw, top + 21 * dp, text)
            }
            val barL = m + 150 * dp
            val barR = m + 240 * dp
            val bt = top + 11 * dp
            val bb = top + 21 * dp
            fill.color = 0x33FFFFFF
            c.drawRect(barL, bt, barR, bb, fill)
            fill.color = 0xCCFFE8C0.toInt()
            c.drawRect(barL, bt, barL + (barR - barL) * teamLag[t], bb, fill)
            fill.color = TEAM_COLORS[t]
            c.drawRect(barL, bt, barL + (barR - barL) * teamShown[t], bb, fill)
            fill.color = 0x990C0A12.toInt()
            for (k in 1 until 10) {
                val x = barL + (barR - barL) * k / 10f
                c.drawRect(x - 0.5f * dp, bt, x + 0.5f * dp, bb, fill)
            }
        }
        text.textAlign = Paint.Align.CENTER

        // Turn timer: a ring that empties, pulsing red for the last five seconds.
        if (g.phase != Phase.GAME_OVER) {
            val tx = vw / 2
            val ty = m + 26 * dp
            val playing = g.phase == Phase.PLAYING || g.phase == Phase.RETREAT
            val secs = if (playing) ceil(max(0f, g.turnTime)).toInt() else Game.TURN_TIME.toInt()
            val urgent = g.phase == Phase.PLAYING && g.turnTime <= 5f
            val pulse = if (urgent) 1f + 0.08f * sin(uiTime * 14f) else 1f
            val r = 26 * dp * pulse
            fill.color = PANEL
            c.drawCircle(tx, ty, r, fill)
            stroke.strokeWidth = 3 * dp
            stroke.color = 0x33FFFFFF
            c.drawCircle(tx, ty, r - 3 * dp, stroke)
            val limit = if (g.phase == Phase.RETREAT) Game.RETREAT_TIME else Game.TURN_TIME
            val frac = if (playing) (g.turnTime / limit).coerceIn(0f, 1f) else 1f
            stroke.color = when {
                urgent -> 0xFFFF4A4A.toInt()
                g.phase == Phase.RETREAT -> 0xFFFFC04A.toInt()
                else -> TEAM_COLORS[g.team]
            }
            rect.set(tx - r + 3 * dp, ty - r + 3 * dp, tx + r - 3 * dp, ty + r - 3 * dp)
            c.drawArc(rect, -90f, 360f * frac, false, stroke)
            font(sysFont, 30 * dp * pulse, if (urgent) 0xFFFF6A6A.toInt() else 0xFFFFFFFF.toInt())
            c.drawText(secs.toString(), tx, ty + 9 * dp * pulse, text)
        }

        drawViewerCounter(c, vw / 2, m + 70 * dp)

        // Wind
        drawPanel(c, windBox, 0xFF5AD8FF.toInt())
        font(sysFont, 15 * dp, 0xFFBFEFFF.toInt())
        c.drawText("WIND", windBox.centerX(), windBox.top + 16 * dp, text)
        val mid = windBox.centerX()
        val barY = windBox.top + 29 * dp
        val half = windBox.width() / 2 - 14 * dp
        fill.color = 0x33FFFFFF
        c.drawRect(mid - half, barY - 3 * dp, mid + half, barY + 3 * dp, fill)
        fill.color = 0x66FFFFFF
        for (k in -4..4) c.drawRect(mid + half * k / 4f - 0.5f * dp, barY - 5 * dp, mid + half * k / 4f + 0.5f * dp, barY + 5 * dp, fill)
        val wl = g.wind / Game.MAX_WIND * half
        fill.color = 0xFF5AD8FF.toInt()
        c.drawRect(min(mid, mid + wl), barY - 3 * dp, max(mid, mid + wl), barY + 3 * dp, fill)
        if (kotlin.math.abs(wl) > 2 * dp) {
            path.reset()
            val tip = mid + wl + (if (wl > 0) 7 * dp else -7 * dp)
            path.moveTo(tip, barY)
            path.lineTo(mid + wl, barY - 6 * dp)
            path.lineTo(mid + wl, barY + 6 * dp)
            path.close()
            c.drawPath(path, fill)
        }

        // Pause
        drawPanel(c, btnPause, GOLD)
        fill.color = 0xFFFFFFFF.toInt()
        c.drawRect(btnPause.centerX() - 7 * dp, btnPause.centerY() - 9 * dp, btnPause.centerX() - 3 * dp, btnPause.centerY() + 9 * dp, fill)
        c.drawRect(btnPause.centerX() + 3 * dp, btnPause.centerY() - 9 * dp, btnPause.centerX() + 7 * dp, btnPause.centerY() + 9 * dp, fill)

        drawSoundButton(c)

        // Zoom
        drawPanel(c, btnZoom, GOLD)
        stroke.color = 0xFFFFFFFF.toInt()
        stroke.strokeWidth = 3 * dp
        c.drawCircle(btnZoom.centerX() - 3 * dp, btnZoom.centerY() - 3 * dp, 9 * dp, stroke)
        c.drawLine(btnZoom.centerX() + 4 * dp, btnZoom.centerY() + 4 * dp, btnZoom.centerX() + 11 * dp, btnZoom.centerY() + 11 * dp, stroke)
        stroke.strokeWidth = 2 * dp
        c.drawLine(btnZoom.centerX() - 7 * dp, btnZoom.centerY() - 3 * dp, btnZoom.centerX() + 1 * dp, btnZoom.centerY() - 3 * dp, stroke)
        if (!zoomedOut) c.drawLine(btnZoom.centerX() - 3 * dp, btnZoom.centerY() - 7 * dp, btnZoom.centerX() - 3 * dp, btnZoom.centerY() + 1 * dp, stroke)

        val human = g.humanTurn && g.phase != Phase.GAME_OVER
        if (human) {
            drawControlButton(c, btnLeft, roles.containsValue(ROLE_LEFT)) { cx, cy, s -> arrow(c, cx, cy, s, -1f) }
            drawControlButton(c, btnRight, roles.containsValue(ROLE_RIGHT)) { cx, cy, s -> arrow(c, cx, cy, s, 1f) }
            drawControlButton(c, btnJump, roles.containsValue(ROLE_JUMP)) { cx, cy, s ->
                path.reset()
                path.moveTo(cx, cy - s)
                path.lineTo(cx + s, cy + s * 0.2f)
                path.lineTo(cx - s, cy + s * 0.2f)
                path.close()
                c.drawPath(path, fill)
                font(sysFont, 15 * dp, 0xFFFFFFFF.toInt())
                c.drawText("JUMP", cx, cy + s * 1.2f, text)
            }
            drawWeaponButton(c, g)
            if (pickerOpen) drawPicker(c, g)
        }

        // Power meter and slingshot band while dragging.
        if (human && g.aiming && g.phase == Phase.PLAYING) {
            stroke.color = 0x88FFFFFF.toInt()
            stroke.strokeWidth = 2 * dp
            c.drawLine(aimStartX, aimStartY, aimCurX, aimCurY, stroke)
            fill.color = 0x88FFFFFF.toInt()
            c.drawCircle(aimStartX, aimStartY, 6 * dp, fill)
            val bw = 240 * dp
            val bx = vw / 2 - bw / 2
            val by = vh - 44 * dp
            rect.set(bx - 58 * dp, by - 6 * dp, bx + bw + 8 * dp, by + 18 * dp)
            drawPanel(c, rect, GOLD)
            font(sysFont, 15 * dp, GOLD, Paint.Align.LEFT)
            c.drawText("POWER", bx - 50 * dp, by + 10 * dp, text)
            text.textAlign = Paint.Align.CENTER
            val p = if (g.weapon.usesPower) g.aimPower else if (g.aimPower > 0.04f) 1f else 0f
            val segs = 20
            val sw = bw / segs
            for (k in 0 until segs) {
                val lit = (k + 0.5f) / segs <= p
                fill.color = if (lit) blend(0xFF8BE04E.toInt(), 0xFFFF5A5A.toInt(), k / (segs - 1f)) else 0x22FFFFFF
                c.drawRect(bx + k * sw + 1 * dp, by, bx + (k + 1) * sw - 1 * dp, by + 12 * dp, fill)
            }
        }

        // Hints, as a System AI prompt with a blinking cursor.
        val hint = when {
            g.phase == Phase.GAME_OVER -> null
            !g.humanTurn -> "The dungeon is taking aim..."
            g.phase == Phase.PLAYING && !g.aiming && !pickerOpen ->
                when (g.weapon.action) {
                    Action.DROP -> "Drag and release to drop the ${g.weapon.label.lowercase()}, then run!"
                    Action.MELEE -> "Get close, drag back and release: ${g.weapon.label}"
                    Action.POUNCE -> "Drag back and release to pounce"
                    Action.ROAR, Action.SLAM -> "Drag and release: ${g.weapon.label} hits everyone in the circle"
                    else -> "Drag back anywhere and release to fire"
                }
            g.phase == Phase.RETREAT -> "RETREAT!"
            else -> null
        }
        if (hint != null) {
            val cursor = if ((uiTime * 2f).toInt() % 2 == 0) "_" else " "
            font(sysFont, 19 * dp, if (g.phase == Phase.RETREAT) 0xFFFFC04A.toInt() else 0xFFE8E2D0.toInt())
            shadowText(c, "> $hint$cursor", vw / 2, vh - 22 * dp - if (g.aiming) 34 * dp else 0f)
        }

        // Turn banner. If a System AI pop-up is showing on the right, the banner moves to the left half.
        if (g.phase == Phase.BANNER) {
            val a = min(1f, min(g.phaseTime * 4f, (1.3f - g.phaseTime) * 4f)).coerceIn(0f, 1f)
            val drop = (1f - min(1f, g.phaseTime * 5f)) * 12 * dp
            val y = vh * 0.4f - drop
            val popUp = g.announcement != null && g.announceAge < Game.ANNOUNCE_TIME
            val cx = if (popUp) vw * 0.3f else vw / 2
            val maxW = if (popUp) vw * 0.52f else vw * 0.8f
            val title = "${Game.TEAM_NAMES[g.team]}: ${g.active.name}"
            font(uiFont, 30 * dp, TEAM_COLORS[g.team])
            val tw0 = text.measureText(title)
            if (tw0 > maxW) text.textSize = text.textSize * maxW / tw0
            val tw = text.measureText(title)
            fill.color = 0xB00C0A12.toInt()
            fill.alpha = (176 * a).toInt()
            rect.set(cx - tw / 2 - 16 * dp, y - text.textSize - 6 * dp, cx + tw / 2 + 16 * dp, y + 58 * dp)
            c.drawRoundRect(rect, 6 * dp, 6 * dp, fill)
            text.alpha = (255 * a).toInt()
            shadowText(c, title, cx, y)
            fill.color = TEAM_COLORS[g.team]
            fill.alpha = (180 * a).toInt()
            c.drawRect(cx - tw / 2, y + 8 * dp, cx + tw / 2, y + 9.5f * dp, fill)
            fill.alpha = 255
            font(sysFont, 19 * dp, 0xFFFFFFFF.toInt())
            text.alpha = (255 * a).toInt()
            shadowText(c, if (g.humanTurn) "Your move, crawler" else "The dungeon's move", cx, y + 30 * dp)
            font(sysFont, 17 * dp, GOLD)
            text.alpha = (255 * a).toInt()
            shadowText(c, g.active.species.trait, cx, y + 50 * dp)
            text.alpha = 255
        }

        drawAnnouncement(c, g)

        if (g.phase == Phase.GAME_OVER) drawGameOver(c, g)
    }

    /** "LIVE" tag and audience count, with "+X" pops rising off it whenever the audience jumps. */
    private fun drawViewerCounter(c: Canvas, cx: Float, y: Float) {
        val count = formatViewers(shownViewers) + " WATCHING"
        font(sysFont, 17 * dp, 0xFFFFFFFF.toInt())
        val cw = text.measureText(count)
        val tagW = 50 * dp
        val total = tagW + cw + 16 * dp
        val l = cx - total / 2
        rect.set(l, y - 13 * dp, l + tagW, y + 5 * dp)
        fill.color = 0xFFD63A3A.toInt()
        c.drawRoundRect(rect, 3 * dp, 3 * dp, fill)
        fill.color = 0xFFFFFFFF.toInt()
        fill.alpha = (160 + 95 * sin(uiTime * 5f)).toInt().coerceIn(0, 255)
        c.drawCircle(l + 9 * dp, y - 4 * dp, 3 * dp, fill)
        fill.alpha = 255
        font(sysFont, 17 * dp, 0xFFFFFFFF.toInt(), Paint.Align.LEFT)
        c.drawText("LIVE", l + 16 * dp, y + 1 * dp, text)
        rect.set(l + tagW, y - 13 * dp, l + total, y + 5 * dp)
        fill.color = PANEL
        c.drawRoundRect(rect, 3 * dp, 3 * dp, fill)
        c.drawText(count, l + tagW + 8 * dp, y + 1 * dp, text)
        for (p in viewerPops) {
            font(sysFont, 17 * dp, GOLD)
            text.alpha = (255 * (1f - p.age / 1.4f)).toInt().coerceIn(0, 255)
            shadowText(c, p.text, l + tagW + 8 * dp + cw / 2 + 20 * dp, y + 22 * dp + p.age * 14 * dp)
        }
        text.alpha = 255
        text.textAlign = Paint.Align.CENTER
    }

    private fun drawGameOver(c: Canvas, g: Game) {
        fill.color = 0xCC060408.toInt()
        c.drawRect(0f, 0f, vw, vh, fill)
        val pw = btnAgain.width() + 80 * dp
        rect.set(vw / 2 - pw / 2, vh * 0.16f, vw / 2 + pw / 2, btnToMenu.bottom + 16 * dp)
        val accent = if (g.winner >= 0) TEAM_COLORS[g.winner] else GOLD
        drawPanel(c, rect, accent, strong = true)
        fill.color = accent
        c.drawRect(rect.left, rect.top, rect.right, rect.top + 22 * dp, fill)
        font(sysFont, 18 * dp, 0xFF0C0A12.toInt())
        c.drawText("BROADCAST ENDED", vw / 2, rect.top + 16 * dp, text)
        val msg = when {
            g.winner < 0 -> "It's a draw!"
            g.mode == Mode.VS_CPU && g.winner == 0 -> "Floor cleared!"
            g.mode == Mode.VS_CPU -> "The dungeon wins"
            else -> "${Game.TEAM_NAMES[g.winner]} win!"
        }
        font(uiFont, 34 * dp, accent)
        shadowText(c, msg, vw / 2, vh * 0.36f)
        val stats = "> Final audience: ${formatViewers(g.viewers.toFloat())} viewers"
        val shown = ((g.phaseTime - 0.3f) * 45f).toInt().coerceIn(0, stats.length)
        font(sysFont, 19 * dp, 0xFFE8E2D0.toInt())
        c.drawText(stats.substring(0, shown) + if (shown < stats.length || (uiTime * 2f).toInt() % 2 == 0) "_" else " ",
            vw / 2, vh * 0.36f + 30 * dp, text)
        drawMenuButton(c, btnAgain, "PLAY AGAIN", 0xFF8BE04E.toInt())
        drawMenuButton(c, btnToMenu, "MENU", 0xFFFFFFFF.toInt())
    }

    private inline fun drawControlButton(c: Canvas, r: RectF, pressed: Boolean, icon: (Float, Float, Float) -> Unit) {
        fill.color = if (pressed) 0x88FFD34A.toInt() else 0xB00C0A12.toInt()
        c.drawCircle(r.centerX(), r.centerY(), r.width() / 2, fill)
        stroke.color = GOLD
        stroke.alpha = if (pressed) 255 else 150
        stroke.strokeWidth = 1.5f * dp
        c.drawCircle(r.centerX(), r.centerY(), r.width() / 2, stroke)
        stroke.alpha = 255
        fill.color = 0xFFFFFFFF.toInt()
        icon(r.centerX(), r.centerY() - if (r === btnJump) 6 * dp else 0f, 12 * dp)
    }

    private fun arrow(c: Canvas, cx: Float, cy: Float, s: Float, dir: Float) {
        path.reset()
        path.moveTo(cx + dir * s, cy)
        path.lineTo(cx - dir * s * 0.6f, cy - s)
        path.lineTo(cx - dir * s * 0.6f, cy + s)
        path.close()
        c.drawPath(path, fill)
    }

    private fun drawWeaponButton(c: Canvas, g: Game) {
        drawPanel(c, btnWeapon, TEAM_COLORS[g.team], strong = true)
        drawWeaponRow(c, btnWeapon, g.weapon, g.ammoLeft(g.weapon), true)
    }

    private fun drawPicker(c: Canvas, g: Game) {
        for ((i, w) in g.loadout.withIndex()) {
            val r = pickerRows[i]
            val left = g.ammoLeft(w)
            drawPanel(c, r, GOLD, strong = w == g.weapon, fillColor = if (w == g.weapon) 0xF0241A30.toInt() else PANEL)
            if (left == 0) {
                fill.color = 0x88000000.toInt()
                c.drawRoundRect(r, 5 * dp, 5 * dp, fill)
            }
            drawWeaponRow(c, r, w, left, false)
        }
    }

    private fun drawWeaponRow(c: Canvas, r: RectF, w: Weapon, ammo: Int, hint: Boolean) {
        val ix = r.left + 26 * dp
        val iy = r.centerY()
        drawWeaponIcon(c, w, ix, iy, 1.6f * dp)
        font(uiFont, 14 * dp, 0xFFFFFFFF.toInt(), Paint.Align.LEFT)
        val room = r.width() - 50 * dp - 46 * dp // leave space for the ammo count
        val lw = text.measureText(w.label)
        if (lw > room) text.textSize = text.textSize * room / lw
        c.drawText(w.label, r.left + 50 * dp, iy + (if (hint) 0f else 5 * dp), text)
        if (hint) {
            font(sysFont, 14 * dp, 0x99FFFFFF.toInt(), Paint.Align.LEFT)
            c.drawText("tap to change", r.left + 50 * dp, iy + 16 * dp, text)
        }
        if (ammo < 0) {
            // The display fonts have no infinity sign, so this one comes from the system font.
            font(plainFont, 16 * dp, GOLD, Paint.Align.RIGHT)
            c.drawText("∞", r.right - 12 * dp, iy + 6 * dp, text)
        } else {
            font(sysFont, 20 * dp, GOLD, Paint.Align.RIGHT)
            c.drawText("x$ammo", r.right - 12 * dp, iy + 6 * dp, text)
        }
        text.textAlign = Paint.Align.CENTER
    }

    private fun drawWeaponIcon(c: Canvas, w: Weapon, x: Float, y: Float, s: Float) {
        c.save()
        c.translate(x, y)
        c.scale(s * 1.7f, s * 1.7f)
        drawThrowable(c, w)
        c.restore()
    }

    private fun drawSoundButton(c: Canvas) {
        drawPanel(c, btnSound, GOLD)
        val cx = btnSound.centerX() - 4 * dp
        val cy = btnSound.centerY()
        fill.color = 0xFFFFFFFF.toInt()
        path.reset()
        path.moveTo(cx - 8 * dp, cy - 4 * dp)
        path.lineTo(cx - 4 * dp, cy - 4 * dp)
        path.lineTo(cx + 2 * dp, cy - 10 * dp)
        path.lineTo(cx + 2 * dp, cy + 10 * dp)
        path.lineTo(cx - 4 * dp, cy + 4 * dp)
        path.lineTo(cx - 8 * dp, cy + 4 * dp)
        path.close()
        c.drawPath(path, fill)
        stroke.color = 0xFFFFFFFF.toInt()
        stroke.strokeWidth = 2 * dp
        if (sound.muted) {
            c.drawLine(cx + 6 * dp, cy - 5 * dp, cx + 14 * dp, cy + 5 * dp, stroke)
            c.drawLine(cx + 14 * dp, cy - 5 * dp, cx + 6 * dp, cy + 5 * dp, stroke)
        } else {
            rect.set(cx - 2 * dp, cy - 8 * dp, cx + 10 * dp, cy + 8 * dp)
            c.drawArc(rect, -50f, 100f, false, stroke)
            rect.set(cx - 6 * dp, cy - 12 * dp, cx + 14 * dp, cy + 12 * dp)
            c.drawArc(rect, -50f, 100f, false, stroke)
        }
    }

    /**
     * System AI pop-up: slides in from the right with a brief glitch, then types its message out
     * behind a blinking cursor, over faint scanlines.
     */
    private fun drawAnnouncement(c: Canvas, g: Game) {
        val a = g.announcement ?: return
        val age = g.announceAge
        if (age > Game.ANNOUNCE_TIME) return
        val slide = min(1f, age * 5f) * min(1f, (Game.ANNOUNCE_TIME - age) * 4f)
        val glitch = if (age < 0.18f) (Math.random().toFloat() - 0.5f) * 10 * dp else 0f
        val pw = min(320 * dp, vw * 0.44f)
        val pad = 12 * dp
        font(sysFont, 18 * dp, 0xFFCFC8D8.toInt(), Paint.Align.LEFT)
        val lines = wrap(a.body, pw - pad * 2)
        val lineH = 17 * dp
        val ph = 64 * dp + lines.size * lineH
        val right = vw - 16 * dp + (1f - slide) * (pw + 40 * dp) + glitch
        val top = 84 * dp
        rect.set(right - pw, top, right, top + ph)
        drawPanel(c, rect, GOLD, strong = true)
        fill.color = GOLD
        c.drawRect(rect.left, rect.top, rect.right, rect.top + 20 * dp, fill)
        font(sysFont, 18 * dp, 0xFF0C0A12.toInt(), Paint.Align.LEFT)
        c.drawText("» " + a.header, rect.left + pad, top + 15 * dp, text)
        font(uiFont, 16 * dp, 0xFFFFFFFF.toInt(), Paint.Align.LEFT)
        c.drawText(a.title, rect.left + pad, top + 41 * dp, text)
        font(sysFont, 18 * dp, 0xFFCFC8D8.toInt(), Paint.Align.LEFT)
        var remaining = ((age - 0.25f) * 55f).toInt().coerceAtLeast(0)
        var cursorX = rect.left + pad
        var cursorY = top + 62 * dp
        for ((i, l) in lines.withIndex()) {
            if (remaining <= 0) break
            val part = if (remaining >= l.length) l else l.substring(0, remaining)
            remaining -= l.length + 1
            val ly = top + 62 * dp + i * lineH
            c.drawText(part, rect.left + pad, ly, text)
            cursorX = rect.left + pad + text.measureText(part)
            cursorY = ly
        }
        if ((uiTime * 2.5f).toInt() % 2 == 0) {
            fill.color = 0xFFCFC8D8.toInt()
            c.drawRect(cursorX + 2 * dp, cursorY - 12 * dp, cursorX + 8 * dp, cursorY + 1 * dp, fill)
        }
        fill.color = 0x0EFFFFFF
        var sy = rect.top + 22 * dp
        while (sy < rect.bottom - 2 * dp) {
            c.drawRect(rect.left + 2 * dp, sy, rect.right - 2 * dp, sy + 1 * dp, fill)
            sy += 3 * dp
        }
        text.textAlign = Paint.Align.CENTER
    }

    /** Greedy word wrap using the current text paint. */
    private fun wrap(s: String, width: Float): List<String> {
        val out = ArrayList<String>()
        var line = ""
        for (word in s.split(" ")) {
            val next = if (line.isEmpty()) word else "$line $word"
            if (text.measureText(next) > width && line.isNotEmpty()) {
                out.add(line)
                line = word
            } else {
                line = next
            }
        }
        if (line.isNotEmpty()) out.add(line)
        return out
    }

    private fun formatViewers(v: Float): String =
        if (v >= 1e9f) String.format(java.util.Locale.UK, "%.2fB", v / 1e9f)
        else String.format(java.util.Locale.UK, "%.1fM", v / 1e6f)

    private fun drawMenu(c: Canvas) {
        fill.color = 0x99060408.toInt()
        c.drawRect(0f, 0f, vw, vh, fill)
        val t = uiTime - screenSince
        val appear = min(1f, t * 2.5f)
        val base = vh * 0.36f

        font(titleFont, 38 * dp, GOLD)
        // Shrink the title to fit between the screen edges and the mute button.
        // The decorative swashes overhang the measured width, hence the 10% margin.
        val room = 2 * (btnSound.left - 16 * dp - vw / 2) * 0.9f
        val tw = text.measureText("DUNGEON CRAWLER CARL")
        if (tw > room) text.textSize = text.textSize * room / tw
        text.alpha = (255 * appear).toInt()
        text.setShadowLayer(14 * dp, 0f, 0f, 0xAAFF9A40.toInt())
        c.drawText("DUNGEON CRAWLER CARL", vw / 2, base - 52 * dp - (1f - appear) * 16 * dp, text)
        text.clearShadowLayer()
        font(uiFont, 14 * dp, 0xFFFFFFFF.toInt())
        text.alpha = (255 * appear).toInt()
        text.letterSpacing = 0.25f
        c.drawText("ARTILLERY EDITION", vw / 2, base - 30 * dp, text)
        text.letterSpacing = 0f

        // The System AI greets you, one quip at a time.
        val quip = MENU_QUIPS[((t / 6f).toInt()) % MENU_QUIPS.size]
        val into = t % 6f
        val shown = ((into - 0.4f) * 40f).toInt().coerceIn(0, quip.length)
        val cursor = if ((uiTime * 2f).toInt() % 2 == 0) "_" else " "
        font(sysFont, 17 * dp, 0xFF9AE8FF.toInt())
        c.drawText("> " + quip.substring(0, shown) + cursor, vw / 2, base - 10 * dp, text)

        layoutMenuButtons()
        drawSoundButton(c)
        val buttons = ArrayList<Triple<RectF, String, Int>>()
        if (!btnResume.isEmpty) buttons.add(Triple(btnResume, "RESUME", 0xFF8BE04E.toInt()))
        buttons.add(Triple(btnCpu, "1 PLAYER VS CPU", 0xFFFFFFFF.toInt()))
        buttons.add(Triple(btnTwo, "2 PLAYERS (PASS & PLAY)", 0xFFFFFFFF.toInt()))
        for ((i, b) in buttons.withIndex()) {
            val k = ((t - 0.15f - i * 0.08f) * 4f).coerceIn(0f, 1f)
            val ease = 1f - (1f - k) * (1f - k)
            c.save()
            c.translate(0f, (1f - ease) * 24 * dp)
            drawMenuButton(c, b.first, b.second, b.third, ease)
            c.restore()
        }

        font(sysFont, 16 * dp, 0xAAE8E2D0.toInt())
        c.drawText("Arrows walk  •  Jump  •  Drag back and release to attack  •  Tap the weapon to switch",
            vw / 2, vh - 16 * dp, text)
        font(sysFont, 15 * dp, 0x88E8E2D0.toInt(), Paint.Align.LEFT)
        c.drawText("unofficial fan game", 16 * dp, 28 * dp, text)
        text.textAlign = Paint.Align.CENTER
    }

    private fun drawMenuButton(c: Canvas, r: RectF, label: String, color: Int, alpha: Float = 1f) {
        if (alpha < 1f) c.saveLayerAlpha(r.left - 4 * dp, r.top - 4 * dp, r.right + 4 * dp, r.bottom + 4 * dp, (255 * alpha).toInt())
        drawPanel(c, r, color, strong = true, fillColor = 0xE8140C1E.toInt())
        font(uiFont, 18 * dp, color)
        c.drawText(label, r.centerX(), r.centerY() + 6 * dp, text)
        if (alpha < 1f) c.restore()
    }

    private fun shadowText(c: Canvas, s: String, x: Float, y: Float) {
        val col = text.color
        val a = text.alpha
        text.color = 0xFF0C0A12.toInt()
        text.alpha = a
        c.drawText(s, x + 1.5f * dp, y + 1.5f * dp, text)
        text.color = col
        text.alpha = a
        c.drawText(s, x, y, text)
    }

    private fun blend(a: Int, b: Int, t: Float): Int {
        fun ch(c: Int, s: Int) = (c shr s) and 0xFF
        val r = (ch(a, 16) + (ch(b, 16) - ch(a, 16)) * t).toInt()
        val g = (ch(a, 8) + (ch(b, 8) - ch(a, 8)) * t).toInt()
        val bl = (ch(a, 0) + (ch(b, 0) - ch(a, 0)) * t).toInt()
        return (0xFF shl 24) or (r shl 16) or (g shl 8) or bl
    }

    /** One tile of mortared stone bricks for the back wall. */
    private fun brickTile(): Bitmap {
        val bmp = Bitmap.createBitmap(64, 32, Bitmap.Config.ARGB_8888)
        val c = Canvas(bmp)
        c.drawColor(0xFF100B09.toInt())
        val p = Paint()
        val shades = intArrayOf(0xFF2A201C.toInt(), 0xFF251C18.toInt(), 0xFF2F2420.toInt(), 0xFF221A16.toInt())
        for (row in 0..1) {
            val off = if (row == 0) 0f else -16f
            for (col in 0..2) {
                p.color = shades[(row * 3 + col) % shades.size]
                val l = off + col * 32f + 1f
                c.drawRect(l, row * 16f + 1f, l + 30f, row * 16f + 15f, p)
            }
        }
        return bmp
    }

    companion object {
        private const val ROLE_LEFT = 1
        private const val ROLE_RIGHT = 2
        private const val ROLE_JUMP = 3
        private const val ROLE_AIM = 4
        private const val TORCH_COLOR = 0xFFFF9A40.toInt()
        private const val GOLD = 0xFFFFD34A.toInt()
        private const val PANEL = 0xE00C0A12.toInt()
        private val MENU_QUIPS = arrayOf(
            "Welcome, crawler. Please die entertainingly.",
            "The sponsors are watching. Try to explode on camera.",
            "Reminder: the pit is not a shortcut.",
            "Loot boxes contain loot. Probably.",
            "Ratings are down. Consider more explosions.",
        )
        private val TEAM_COLORS = intArrayOf(0xFFFF5A5A.toInt(), 0xFF4DA6FF.toInt())
    }
}
