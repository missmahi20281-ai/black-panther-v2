# PENTHER - Android AI Assistant Project

**Created by Rai Kumar**  
**Branding:** PENTHER (Futuristic Personal AI Assistant)  
**Target Platform:** Android 14+ (API 34, Min SDK 26)  
**Architecture:** Kotlin, Jetpack Compose, Material 3, Coroutines, MVVM, Android Intent Manager, Encrypted Security Vault

---

## 📱 Project Overview

PENTHER is a futuristic personal AI assistant for Android featuring an animated 3D robotic anime-inspired character, voice-first interaction (STT/TTS in English, Hindi, and Hinglish), intent execution for Android system actions, a sandboxed Python execution engine, and an ethical cybersecurity learning lab.

---

## 🚀 Building the APK in Android Studio

Follow these steps to compile and install the native Android APK:

### 1. Prerequisites
- **Android Studio:** Android Studio Iguana (2023.2.1) or Jellyfish (2024.1.1)+
- **JDK:** Java Development Kit 17 (recommended: Amazon Corretto 17 or Eclipse Temurin 17)
- **Android SDK:** Platform 34 (Android 14) and Build-Tools 34.0.0

### 2. Opening the Project
1. Launch Android Studio.
2. Select **Open** and choose the `android/` directory of this repository.
3. Allow Gradle to sync dependencies automatically.

### 3. Running on Emulator or Physical Device
- **Emulator:** Create an Android Virtual Device (AVD) running **API 34** (Google APIs image).
- **Physical Device:**
  1. Go to **Settings > About Phone** and tap **Build Number** 7 times to enable Developer Options.
  2. Enable **USB Debugging** in Developer Options.
  3. Connect via USB cable and allow debugging authorization on your device.
  4. Click the green **Run (▶)** button in Android Studio.

### 4. Building the Standalone APK (Installable File)
To generate an APK file that can be distributed and installed directly:
1. In Android Studio, go to menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2. Once the build finishes, click the **"locate"** link in the event log.
3. The APK will be located at:
   ```
   app/build/outputs/apk/debug/app-debug.apk
   ```
4. Copy `app-debug.apk` to any Android phone and install it! (Ensure "Install from unknown sources" is checked).

---

## 📂 Project Architecture

```
com.penther.ai/
├── PentherApplication.kt     # Application class & dependency container
├── MainActivity.kt           # Edge-to-edge Compose host activity
├── ui/
│   ├── screens/              # HomeScreen, SettingsScreen, SecurityLabScreen
│   ├── components/           # AvatarView, VoiceWave, ChatBubbles, ActionCards
│   └── theme/                # Cyberpunk dark theme with cyan & neon accents
├── ai/
│   ├── AIClient.kt           # Server-side Gemini API client (secure token proxy)
│   └── ToolRouter.kt         # Dispatches JSON tool actions to Android Intents
├── android/
│   ├── IntentManager.kt      # Real Android Intents (YouTube, Maps, Camera, Timers)
│   └── PermissionManager.kt  # Centralized least-privilege permission handler
├── security/
│   └── SecurityLab.kt        # EncryptedSharedPreferences, SHA-256, Password Entropy
└── voice/
    ├── VoiceRecognition.kt   # Android SpeechRecognizer (en-US, hi-IN)
    └── VoiceSynthesis.kt     # Android TextToSpeech engine
```

---

## 🛡️ Security & Privacy Architecture
- **No Client-Side Secrets:** Gemini API keys are never bundled into the client APK; they are routed through the secure backend endpoint.
- **Encrypted Keystore:** Local sensitive state and tokens are encrypted via `androidx.security.crypto.EncryptedSharedPreferences`.
- **Sensitive Action Gate:** High-privilege operations (external messaging, storage writes) require explicit user confirmation before intent dispatch.
- **Ethical Security Lab:** Strictly defensive and educational; no destructive or root exploits.

---

**PENTHER** — Personal AI Assistant  
**Created by Rai Kumar**
