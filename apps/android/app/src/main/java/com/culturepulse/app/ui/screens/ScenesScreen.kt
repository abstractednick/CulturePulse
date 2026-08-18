package com.culturepulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.culturepulse.app.ui.theme.Surface

@Composable
fun ScenesScreen(onBack: () -> Unit) {
    val scenes = listOf(
        "Ahmedabad Night Skaters" to "Late-night sessions. Helmets encouraged.",
        "Sabarmati Study Circles" to "Phones down, laptops open.",
        "Law Garden Open Mic" to "Poetry, stand-up, one song from Tuesday.",
        "Queer & Cozy Book Club" to "Sober space. Pronoun stickers at the door.",
        "Navrangpura Beat Cypher" to "Whoever shows up with bars.",
        "CG Road Creator Collab" to "Leave with something shipped.",
    )
    Column(Modifier.fillMaxSize().background(Ink).padding(20.dp)) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = Paper)
        }
        Text("Micro-communities", color = Lime, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text("Follow a scene.", color = Paper, fontWeight = FontWeight.ExtraBold, fontSize = 32.sp)
        scenes.forEach { (name, blurb) ->
            Column(
                Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp)
                    .background(Surface, RoundedCornerShape(18.dp))
                    .padding(14.dp),
            ) {
                Text(name, color = Paper, fontWeight = FontWeight.SemiBold)
                Text(blurb, color = Mute, fontSize = 13.sp)
            }
        }
    }
}
