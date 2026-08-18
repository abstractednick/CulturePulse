package com.culturepulse.app.ui.screens

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.culturepulse.app.data.model.Pulse
import com.culturepulse.app.data.repository.PulseRepository

class MapViewModel(
    private val repo: PulseRepository = PulseRepository(),
) : ViewModel() {
    var pulses by mutableStateOf(repo.nearby())
        private set
    var selectedId by mutableStateOf(pulses.firstOrNull()?.id)
        private set
    var vibeFilter by mutableStateOf<String?>(null)
        private set

    val visible: List<Pulse>
        get() = pulses.filter { vibeFilter == null || it.vibeTags.contains(vibeFilter) }

    fun select(id: String) {
        selectedId = id
    }

    fun toggleVibe(tag: String) {
        vibeFilter = if (vibeFilter == tag) null else tag
    }

    fun pulse(id: String) = repo.byId(id)

    fun rsvp(id: String) {
        pulses = pulses.map {
            if (it.id == id) it.copy(attendeeCount = it.attendeeCount + 1, myRsvp = "going") else it
        }
    }
}
