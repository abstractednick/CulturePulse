package com.culturepulse.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.culturepulse.app.ui.navigation.PulseNav
import com.culturepulse.app.ui.theme.CulturePulseTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            CulturePulseTheme {
                PulseNav()
            }
        }
    }
}
