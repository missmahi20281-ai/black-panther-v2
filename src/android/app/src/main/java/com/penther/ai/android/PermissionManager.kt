package com.penther.ai.android

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat

/**
 * PENTHER Centralized Permission Manager
 * Strictly enforces least-privilege permission handling with upfront rationale.
 * Created by Rai Kumar
 */
class PermissionManager(private val activity: ComponentActivity) {

    fun hasRecordAudioPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            activity,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun hasCameraPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            activity,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun hasNotificationPermission(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                activity,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    fun requestAudioPermission(onResult: (Boolean) -> Unit) {
        val launcher = activity.activityResultRegistry.register(
            "penther_audio_perm",
            ActivityResultContracts.RequestPermission()
        ) { isGranted ->
            onResult(isGranted)
        }
        launcher.launch(Manifest.permission.RECORD_AUDIO)
    }

    fun requestCameraPermission(onResult: (Boolean) -> Unit) {
        val launcher = activity.activityResultRegistry.register(
            "penther_camera_perm",
            ActivityResultContracts.RequestPermission()
        ) { isGranted ->
            onResult(isGranted)
        }
        launcher.launch(Manifest.permission.CAMERA)
    }
}
