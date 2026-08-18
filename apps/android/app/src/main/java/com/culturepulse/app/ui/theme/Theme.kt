package com.culturepulse.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val Ink = Color(0xFF050508)
val Surface = Color(0xFF12121A)
val Raised = Color(0xFF1C1C28)
val Lime = Color(0xFFD6FF3F)
val Pink = Color(0xFFFF4F8B)
val Violet = Color(0xFF9B8CFF)
val Paper = Color(0xFFF4F1EA)
val Mute = Color(0xFF8B8798)

private val scheme = darkColorScheme(
    primary = Lime,
    onPrimary = Ink,
    secondary = Violet,
    background = Ink,
    surface = Surface,
    onBackground = Paper,
    onSurface = Paper,
    error = Pink,
)

@Composable
fun CulturePulseTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = scheme, content = content)
}
