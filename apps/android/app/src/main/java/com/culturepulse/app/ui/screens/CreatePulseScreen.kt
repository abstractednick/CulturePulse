package com.culturepulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.culturepulse.app.ui.theme.Ink
import com.culturepulse.app.ui.theme.Lime
import com.culturepulse.app.ui.theme.Mute
import com.culturepulse.app.ui.theme.Paper

@Composable
fun CreatePulseScreen(onBack: () -> Unit) {
    var title by remember { mutableStateOf("") }
    var place by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var done by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().background(Ink).padding(20.dp)) {
        IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = Paper)
        }
        Text("Drop a pulse", color = Paper, fontWeight = FontWeight.ExtraBold, fontSize = 32.sp)
        Text("Title, time, vibe, pin. That's a scene.", color = Mute, modifier = Modifier.padding(top = 6.dp, bottom = 16.dp))
        OutlinedTextField(title, { title = it }, label = { Text("Title") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(place, { place = it }, label = { Text("Place name") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
        OutlinedTextField(desc, { desc = it }, label = { Text("Vibe + safety notes") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp), minLines = 3)
        Button(
            onClick = { done = true },
            colors = ButtonDefaults.buttonColors(containerColor = Lime, contentColor = Ink),
            modifier = Modifier.fillMaxWidth().padding(top = 20.dp),
        ) { Text("Publish pulse") }
        if (done) Text("Pulse queued locally — connect the API to publish for real.", color = Lime, modifier = Modifier.padding(top = 12.dp))
    }
}
