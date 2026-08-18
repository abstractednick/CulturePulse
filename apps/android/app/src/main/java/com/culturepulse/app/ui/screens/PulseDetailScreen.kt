package com.culturepulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.culturepulse.app.ui.theme.Ink
import com.culturepulse.app.ui.theme.Lime
import com.culturepulse.app.ui.theme.Mute
import com.culturepulse.app.ui.theme.Paper
import com.culturepulse.app.ui.theme.Pink
import com.culturepulse.app.ui.theme.Surface

@Composable
fun PulseDetailScreen(id: String, vm: MapViewModel, onBack: () -> Unit) {
    val p = vm.pulse(id) ?: return
    Column(
        Modifier
            .fillMaxSize()
            .background(Ink)
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
    ) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Paper)
        }
        Text(
            if (p.status == "live") "● LIVE" else p.status.uppercase(),
            color = if (p.status == "live") Pink else Lime,
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp,
        )
        Text(p.title, color = Paper, fontWeight = FontWeight.ExtraBold, fontSize = 32.sp, lineHeight = 34.sp)
        p.sceneName?.let { Text(it, color = Lime, modifier = Modifier.padding(top = 6.dp)) }
        Text(p.description, color = Mute, modifier = Modifier.padding(top = 12.dp))
        p.lastMinuteUpdate?.let {
            Text("Host update: $it", color = Paper, modifier = Modifier.padding(top = 12.dp).background(Pink.copy(0.15f), RoundedCornerShape(12.dp)).padding(12.dp))
        }
        Text("${p.placeName} · ${p.attendeeCount}/${p.capacity} seats", color = Paper, modifier = Modifier.padding(top = 16.dp))
        Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            p.vibeTags.forEach {
                Text(it, color = Paper, fontSize = 11.sp, modifier = Modifier.background(Surface, RoundedCornerShape(99.dp)).padding(horizontal = 10.dp, vertical = 4.dp))
            }
        }
        Button(
            onClick = { vm.rsvp(p.id) },
            colors = ButtonDefaults.buttonColors(containerColor = Lime, contentColor = Ink),
            modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
        ) { Text(if (p.myRsvp == "going") "You're going" else "RSVP going") }
        OutlinedButton(onClick = { }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
            Text("Go anonymously", color = Paper)
        }
    }
}
