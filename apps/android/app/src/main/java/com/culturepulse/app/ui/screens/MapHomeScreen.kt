package com.culturepulse.app.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Groups
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.culturepulse.app.data.model.Pulse
import com.culturepulse.app.ui.theme.Ink
import com.culturepulse.app.ui.theme.Lime
import com.culturepulse.app.ui.theme.Mute
import com.culturepulse.app.ui.theme.Paper
import com.culturepulse.app.ui.theme.Pink
import com.culturepulse.app.ui.theme.Raised
import com.culturepulse.app.ui.theme.Surface
import com.culturepulse.app.ui.theme.Violet

@Composable
fun MapHomeScreen(
    vm: MapViewModel,
    onOpen: (String) -> Unit,
    onHost: () -> Unit,
    onScenes: () -> Unit,
) {
    val pulses = vm.visible
    Box(Modifier.fillMaxSize().background(Ink)) {
        StylizedMap(pulses, vm.selectedId) { vm.select(it) }
        Column(Modifier.fillMaxSize()) {
            Row(
                Modifier
                    .padding(16.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(Ink.copy(alpha = 0.82f))
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text("Culture", color = Paper, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                Text("Pulse", color = Lime, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                Spacer(Modifier.weight(1f))
                Icon(
                    Icons.Default.Groups,
                    contentDescription = "Scenes",
                    tint = Paper,
                    modifier = Modifier.clickable { onScenes() },
                )
            }
            Row(
                Modifier
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                listOf("chill", "loud", "quiet", "study", "creative", "queer-friendly").forEach { tag ->
                    val on = vm.vibeFilter == tag
                    Text(
                        tag,
                        color = if (on) Ink else Paper,
                        fontSize = 12.sp,
                        modifier = Modifier
                            .clip(RoundedCornerShape(99.dp))
                            .background(if (on) Lime else Raised)
                            .clickable { vm.toggleVibe(tag) }
                            .padding(horizontal = 12.dp, vertical = 7.dp),
                    )
                }
            }
            Spacer(Modifier.weight(1f))
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(320.dp)
                    .clip(RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp))
                    .background(Surface.copy(alpha = 0.96f)),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                item {
                    Text("${pulses.size} scenes near Ahmedabad", color = Paper, fontWeight = FontWeight.Bold)
                }
                items(pulses, key = { it.id }) { p ->
                    PulseRow(p, p.id == vm.selectedId) {
                        vm.select(p.id)
                        onOpen(p.id)
                    }
                }
            }
        }
        FloatingActionButton(
            onClick = onHost,
            containerColor = Lime,
            contentColor = Ink,
            modifier = Modifier.align(Alignment.BottomEnd).padding(end = 18.dp, bottom = 340.dp),
        ) { Icon(Icons.Default.Add, contentDescription = "Host a pulse") }
    }
}

@Composable
private fun PulseRow(p: Pulse, active: Boolean, onClick: () -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(if (active) Lime.copy(alpha = 0.12f) else Raised)
            .clickable(onClick = onClick)
            .padding(12.dp),
    ) {
        Text(
            if (p.status == "live") "● LIVE" else p.status.uppercase(),
            color = if (p.status == "live") Pink else Lime,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
        )
        Text(p.title, color = Paper, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
        Text("${p.placeName} · ${p.attendeeCount}/${p.capacity}", color = Mute, fontSize = 12.sp)
    }
}

@Composable
fun StylizedMap(pulses: List<Pulse>, selectedId: String?, onSelect: (String) -> Unit) {
    val minLat = 23.00
    val maxLat = 23.06
    val minLng = 72.52
    val maxLng = 72.60
    Box(Modifier.fillMaxSize().background(Ink).clickable(enabled = false) {}) {
        Canvas(Modifier.fillMaxSize()) {
            drawRect(Brush.radialGradient(listOf(Color(0xFF1A1530), Ink), center = center, radius = size.maxDimension))
            // river
            drawLine(Violet.copy(alpha = 0.35f), Offset(size.width * 0.42f, 0f), Offset(size.width * 0.58f, size.height), strokeWidth = 28f)
            drawLine(Color(0xFF0E2A3A), Offset(size.width * 0.42f, 0f), Offset(size.width * 0.58f, size.height), strokeWidth = 10f)
            // streets
            for (i in 1..6) {
                val y = size.height * i / 7f
                drawLine(Color.White.copy(alpha = 0.05f), Offset(0f, y), Offset(size.width, y), strokeWidth = 3f)
                val x = size.width * i / 7f
                drawLine(Color.White.copy(alpha = 0.05f), Offset(x, 0f), Offset(x, size.height), strokeWidth = 3f)
            }
            pulses.forEach { p ->
                val x = ((p.lng - minLng) / (maxLng - minLng)).toFloat() * size.width
                val y = (1f - ((p.lat - minLat) / (maxLat - minLat)).toFloat()) * size.height * 0.62f + 40f
                val live = p.status == "live"
                val color = if (live) Pink else Lime
                if (live) drawCircle(color.copy(alpha = 0.25f), 42f, Offset(x, y))
                drawCircle(color, 16f, Offset(x, y))
                drawCircle(Ink, 7f, Offset(x, y))
                if (p.id == selectedId) drawCircle(color, 22f, Offset(x, y), style = Stroke(3f))
            }
        }
        pulses.forEach { p ->
            // tap targets approximated by overlaying invisible boxes is hard without coords;
            // selection happens from the list. Map is visual.
        }
        onSelect
    }
}
