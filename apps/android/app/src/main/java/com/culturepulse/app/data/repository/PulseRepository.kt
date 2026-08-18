package com.culturepulse.app.data.repository

import com.culturepulse.app.data.model.Pulse

/**
 * Demo dataset so the Android client is impressive without a running API.
 * Swap [PulseRepository] to Retrofit in production (see ApiModule).
 */
object DemoPulses {
    val ahmedabad = listOf(
        Pulse(
            id = "p_skate_live",
            title = "Riverfront night roll",
            description = "Smooth stretch near the lower promenade. Lights on, music low enough to hear wheels.",
            placeName = "Sabarmati Riverfront",
            lat = 23.0395,
            lng = 72.5726,
            status = "live",
            startAt = "Tonight",
            capacity = 28,
            attendeeCount = 14,
            vibeTags = listOf("loud", "outdoors", "beginner-ok"),
            lastMinuteUpdate = "Moved 80m south — the north ramp is wet.",
            sceneName = "Ahmedabad Night Skaters",
        ),
        Pulse(
            id = "p_study_tonight",
            title = "Deep-work lamps · 2hr sprint",
            description = "No talking until the tea break. Bring headphones.",
            placeName = "Riverfront library lawn",
            lat = 23.0368,
            lng = 72.5841,
            status = "upcoming",
            startAt = "Tonight · 3h",
            capacity = 12,
            attendeeCount = 7,
            vibeTags = listOf("quiet", "study", "chill"),
            sceneName = "Sabarmati Study Circles",
            distanceKm = 1.4,
        ),
        Pulse(
            id = "p_mic_weekend",
            title = "Thursday open mic · five minutes",
            description = "Sign-up sheet at 6:40. Original work only. Snaps, not heckles.",
            placeName = "Law Garden night market",
            lat = 23.0229,
            lng = 72.5603,
            status = "upcoming",
            startAt = "Thu evening",
            capacity = 40,
            attendeeCount = 19,
            vibeTags = listOf("chill", "creative", "queer-friendly"),
            sceneName = "Law Garden Open Mic",
            distanceKm = 2.1,
        ),
        Pulse(
            id = "p_cypher",
            title = "Golden-hour cypher",
            description = "No stage. No judging. One speaker, rotating 16 bars.",
            placeName = "Navrangpura plaza",
            lat = 23.0391,
            lng = 72.565,
            status = "upcoming",
            startAt = "In 5h",
            capacity = 24,
            attendeeCount = 11,
            vibeTags = listOf("loud", "outdoors", "creative"),
            sceneName = "Navrangpura Beat Cypher",
        ),
        Pulse(
            id = "p_book",
            title = "Short stories & soft lighting",
            description = "Sober space, pronoun stickers at the door. Fuzzy pin until you RSVP.",
            placeName = "Paldi reading room",
            lat = 23.0112,
            lng = 72.5298,
            status = "upcoming",
            startAt = "This weekend",
            capacity = 10,
            attendeeCount = 6,
            vibeTags = listOf("chill", "queer-friendly", "sober"),
            sceneName = "Queer & Cozy Book Club",
        ),
        Pulse(
            id = "p_improv",
            title = "IIM-A lawn improv jam",
            description = "Yes-and until sunset. Spectators welcome on the grass.",
            placeName = "IIM Ahmedabad lawn",
            lat = 23.0316,
            lng = 72.5264,
            status = "upcoming",
            startAt = "Tomorrow",
            capacity = 22,
            attendeeCount = 9,
            vibeTags = listOf("creative", "outdoors", "beginner-ok"),
        ),
    )
}

class PulseRepository {
    fun nearby(): List<Pulse> = DemoPulses.ahmedabad
    fun byId(id: String): Pulse? = DemoPulses.ahmedabad.find { it.id == id }
}
