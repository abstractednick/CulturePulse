package com.culturepulse.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.culturepulse.app.ui.screens.CreatePulseScreen
import com.culturepulse.app.ui.screens.MapHomeScreen
import com.culturepulse.app.ui.screens.PulseDetailScreen
import com.culturepulse.app.ui.screens.ScenesScreen
import com.culturepulse.app.ui.screens.MapViewModel

@Composable
fun PulseNav() {
    val nav = rememberNavController()
    val vm: MapViewModel = viewModel()
    NavHost(navController = nav, startDestination = "map") {
        composable("map") {
            MapHomeScreen(
                vm = vm,
                onOpen = { nav.navigate("pulse/$it") },
                onHost = { nav.navigate("host") },
                onScenes = { nav.navigate("scenes") },
            )
        }
        composable(
            "pulse/{id}",
            arguments = listOf(navArgument("id") { type = NavType.StringType }),
        ) { back ->
            val id = back.arguments?.getString("id") ?: return@composable
            PulseDetailScreen(id = id, vm = vm, onBack = { nav.popBackStack() })
        }
        composable("host") { CreatePulseScreen(onBack = { nav.popBackStack() }) }
        composable("scenes") { ScenesScreen(onBack = { nav.popBackStack() }) }
    }
}
