package com.culturepulse.app.data.model

data class Pulse(
    val id: String,
    val title: String,
    val description: String,
    val placeName: String,
    val lat: Double,
    val lng: Double,
    val status: String,
    val startAt: String,
    val capacity: Int,
    val attendeeCount: Int,
    val vibeTags: List<String>,
    val lastMinuteUpdate: String? = null,
    val sceneName: String? = null,
    val myRsvp: String? = null,
    val distanceKm: Double? = null,
)
