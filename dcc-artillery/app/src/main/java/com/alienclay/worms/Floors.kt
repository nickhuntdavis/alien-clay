package com.alienclay.worms

/** How a floor's terrain is shaped. */
enum class TerrainStyle { HALLS, CATACOMBS, ROOFTOPS, FORGE }

/** What waits at the bottom of the floor. */
enum class PitStyle { SPIKES, SEWAGE, STREET, LAVA }

/**
 * The floors of the dungeon. Each has its own look, terrain, pit, hazard, boss and (from floor 3) Katia
 * joining the crawlers. Names are written in the spirit of the books; rename freely here.
 */
enum class Floor(
    val number: Int,
    val title: String,
    val blurb: String,
    val style: TerrainStyle,
    val pit: PitStyle,
    val crawlers: List<Species>,
    val mobs: List<Species>,
    /** Top-of-ground and body colours for the terrain painter. */
    val topColors: IntArray,
    val bodyColors: IntArray,
    /** Back wall brick shades, mortar colour and light colour for torches. */
    val wallColors: IntArray,
    val mortar: Int,
    val torch: Int,
    /** Colour of the crystals embedded in the rock (two options). */
    val crystalColors: IntArray,
    val windScale: Float = 1f,
    /** From this turn on, the pit rises by [riseStep] every turn. */
    val collapseTurn: Int = 14,
    val riseStep: Float = 12f,
    /** Chance each turn that molten rock falls from the ceiling. */
    val eruptionChance: Float = 0f,
    val tip: String,
) {
    ONE(1, "The Stairwell Halls", "Torch-lit stone, bones in the walls and spikes below.",
        TerrainStyle.HALLS, PitStyle.SPIKES,
        listOf(Species.CARL, Species.DONUT, Species.MONGO), listOf(Species.GOBLIN, Species.HOBGOBLIN, Species.OGRE),
        intArrayOf(0xFF9A948C.toInt(), 0xFF86807A.toInt(), 0xFF726C66.toInt(), 0xFF4E4A46.toInt()),
        intArrayOf(0xFF5E4C40.toInt(), 0xFF524338.toInt(), 0xFF6A584A.toInt(), 0xFF463B33.toInt()),
        intArrayOf(0xFF2A201C.toInt(), 0xFF251C18.toInt(), 0xFF2F2420.toInt(), 0xFF221A16.toInt()), 0xFF100B09.toInt(),
        0xFFFF9A40.toInt(), intArrayOf(0xFF5AD8C8.toInt(), 0xFFB07CFF.toInt()),
        tip = "The pit is bottomless. Kick things into it. Not yourself."),
    TWO(2, "The Flooded Catacombs", "Mossy tombs over rising sewage. The water comes up early here.",
        TerrainStyle.CATACOMBS, PitStyle.SEWAGE,
        listOf(Species.CARL, Species.DONUT, Species.MONGO), listOf(Species.GOBLIN, Species.HOBGOBLIN, Species.KRAKEN),
        intArrayOf(0xFF6E8A5A.toInt(), 0xFF5A7A4A.toInt(), 0xFF4A6A3E.toInt(), 0xFF34502E.toInt()),
        intArrayOf(0xFF4A5048.toInt(), 0xFF3E4640.toInt(), 0xFF566054.toInt(), 0xFF363C36.toInt()),
        intArrayOf(0xFF1E2622.toInt(), 0xFF1A221E.toInt(), 0xFF222C26.toInt(), 0xFF18201C.toInt()), 0xFF0A0E0C.toInt(),
        0xFF9AE86A.toInt(), intArrayOf(0xFF7AE8A0.toInt(), 0xFF5AD8C8.toInt()),
        collapseTurn = 6, riseStep = 9f,
        tip = "The water rises every turn after the sixth. Fight uphill."),
    THREE(3, "The Over City", "Rooftops above a drop to the streets. The wind up here is brutal.",
        TerrainStyle.ROOFTOPS, PitStyle.STREET,
        listOf(Species.CARL, Species.DONUT, Species.KATIA), listOf(Species.GOBLIN, Species.HOBGOBLIN, Species.GARGOYLE),
        intArrayOf(0xFF8A5A4A.toInt(), 0xFF7A4A3E.toInt(), 0xFF6A3E34.toInt(), 0xFF4A2A24.toInt()),
        intArrayOf(0xFF5A5660.toInt(), 0xFF4E4A56.toInt(), 0xFF66626C.toInt(), 0xFF42404A.toInt()),
        intArrayOf(0xFF1A1C2A.toInt(), 0xFF161826.toInt(), 0xFF1E2030.toInt(), 0xFF141622.toInt()), 0xFF0A0B12.toInt(),
        0xFFFFE08A.toInt(), intArrayOf(0xFFFFE08A.toInt(), 0xFF8AC8FF.toInt()),
        windScale = 1.7f,
        tip = "Wind is much stronger up here. Katia can raise a wall to hide behind."),
    FOUR(4, "The Magma Forge", "Black glass over a lake of fire. Sometimes the ceiling drips.",
        TerrainStyle.FORGE, PitStyle.LAVA,
        listOf(Species.CARL, Species.DONUT, Species.KATIA), listOf(Species.HOBGOBLIN, Species.OGRE, Species.MAGMA_GOLEM),
        intArrayOf(0xFF4A3A3A.toInt(), 0xFF3A2E2E.toInt(), 0xFF2E2424.toInt(), 0xFF1E1818.toInt()),
        intArrayOf(0xFF2A2226.toInt(), 0xFF241C20.toInt(), 0xFF30262A.toInt(), 0xFF1E181C.toInt()),
        intArrayOf(0xFF2A1612.toInt(), 0xFF24120E.toInt(), 0xFF301A14.toInt(), 0xFF200E0C.toInt()), 0xFF0E0504.toInt(),
        0xFFFF6A2A.toInt(), intArrayOf(0xFFFF8A2A.toInt(), 0xFFFFC04A.toInt()),
        eruptionChance = 0.5f, collapseTurn = 12,
        tip = "Molten rock falls from the ceiling. The Golem barely budges when hit.");

    val next: Floor? get() = entries.getOrNull(ordinal + 1)
}
