import React, { useState } from 'react';
import { X, Smartphone, Download, Copy, Check, FileCode, ExternalLink, Terminal } from 'lucide-react';

interface AndroidProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidProjectModal: React.FC<AndroidProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeFile, setActiveFile] = useState<string>('MainActivity.kt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const files: Record<string, { lang: string; code: string; desc: string }> = {
    'MainActivity.kt': {
      lang: 'kotlin',
      desc: 'Edge-to-edge Jetpack Compose main activity with intent & permission managers',
      code: `package com.penther.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
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
}`,
    },
    'IntentManager.kt': {
      lang: 'kotlin',
      desc: 'Dispatches real Android system intents (Apps, Camera, Timer, Maps, Settings)',
      code: `package com.penther.ai.android

import android.app.SearchManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.AlarmClock
import android.provider.CalendarContract
import android.provider.MediaStore
import android.provider.Settings

class IntentManager(private val context: Context) {

    fun openApp(appName: String): Boolean {
        val packageName = when (appName.lowercase()) {
            "youtube" -> "com.google.android.youtube"
            "whatsapp" -> "com.whatsapp"
            "chrome" -> "com.android.chrome"
            "spotify" -> "com.spotify.music"
            "maps" -> "com.google.android.apps.maps"
            "calculator" -> "com.google.android.calculator"
            else -> appName
        }

        val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
        return if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(launchIntent)
            true
        } else {
            openUrl("https://www.google.com/search?q=$appName")
            false
        }
    }

    fun startTimer(durationSeconds: Int, label: String = "PENTHER Timer") {
        val intent = Intent(AlarmClock.ACTION_SET_TIMER).apply {
            putExtra(AlarmClock.EXTRA_LENGTH, durationSeconds)
            putExtra(AlarmClock.EXTRA_MESSAGE, label)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    fun launchCamera() {
        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}`,
    },
    'AndroidManifest.xml': {
      lang: 'xml',
      desc: 'Android permissions, package visibility queries, and intent filters',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.penther.ai">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SET_ALARM" />

    <queries>
        <package android:name="com.google.android.youtube" />
        <package android:name="com.whatsapp" />
        <package android:name="com.android.chrome" />
        <package android:name="com.google.android.apps.maps" />
    </queries>

    <application
        android:name=".PentherApplication"
        android:label="PENTHER"
        android:theme="@style/Theme.Penther">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    'build.gradle.kts': {
      lang: 'kotlin',
      desc: 'Gradle build configuration with Compose, CameraX, and Security Crypto',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.penther.ai"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.penther.ai"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.material3:material3")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.camera:camera-camera2:1.3.1")
}`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([files[activeFile].code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = activeFile;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.15)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/20 bg-slate-950/80">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-semibold tracking-wider">
            <Smartphone size={18} />
            <span>PENTHER // NATIVE ANDROID PROJECT & APK BUILDER</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="px-5 py-2.5 bg-cyan-950/30 border-b border-cyan-500/10 flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-300">
            Build Target: Android 14 (API 34) | Jetpack Compose | MVVM Architecture
          </span>
          <span className="text-slate-400">Created by Rai Kumar</span>
        </div>

        {/* Content Area */}
        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
          {/* File selector sidebar */}
          <div className="w-full sm:w-60 border-b sm:border-b-0 sm:border-r border-slate-800 bg-slate-950/60 p-3 flex sm:flex-col gap-1.5 overflow-x-auto sm:overflow-y-auto">
            <span className="text-[10px] font-mono text-slate-500 uppercase px-2 mb-1 hidden sm:block">
              Android Source Tree
            </span>
            {Object.keys(files).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-mono transition-all shrink-0 sm:shrink ${
                  activeFile === fileName
                    ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileCode size={14} className="text-cyan-400 shrink-0" />
                <span className="truncate">{fileName}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col p-4 bg-slate-950 overflow-hidden">
            <div className="flex items-center justify-between pb-3 text-xs font-mono text-slate-400 border-b border-slate-800 mb-3">
              <div>
                <span className="text-cyan-300 font-semibold">{activeFile}</span>
                <span className="text-slate-500 block text-[11px] mt-0.5 font-sans">
                  {files[activeFile].desc}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <pre className="flex-1 overflow-auto p-3.5 bg-black/60 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed selection:bg-cyan-500/30">
              <code>{files[activeFile].code}</code>
            </pre>
          </div>
        </div>

        {/* Footer Build Steps */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-cyan-400" />
            <span>To generate APK: Android Studio &gt; Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
