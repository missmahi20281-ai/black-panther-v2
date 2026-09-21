package com.penther.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.penther.ai.android.IntentManager
import com.penther.ai.android.PermissionManager
import com.penther.ai.ui.screens.HomeScreen
import com.penther.ai.ui.theme.PentherTheme

/**
 * PENTHER - Futuristic Personal AI Assistant for Android
 * Created by Rai Kumar
 */
class MainActivity : ComponentActivity() {

    private lateinit var permissionManager: PermissionManager
    private lateinit var intentManager: IntentManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Initialize Android Subsystems
        permissionManager = PermissionManager(this)
        intentManager = IntentManager(this)

        setContent {
            PentherTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HomeScreen(
                        intentManager = intentManager,
                        permissionManager = permissionManager
                    )
                }
            }
        }
    }
}
