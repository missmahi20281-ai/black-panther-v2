package com.penther.ai.ai

import com.penther.ai.android.IntentManager
import org.json.JSONObject

/**
 * PENTHER Tool Router (Android Native)
 * Dispatches structured JSON tool actions from Gemini to Android Intents.
 * Created by Rai Kumar
 */
class ToolRouter(private val intentManager: IntentManager) {

    data class ToolResult(
        val success: Boolean,
        val message: String,
        val actionTaken: String
    )

    fun execute(toolJson: String, onRequireConfirmation: (prompt: String, onConfirm: () -> Unit) -> Unit): ToolResult {
        return try {
            val obj = JSONObject(toolJson)
            val name = obj.optString("name")
            val args = obj.optJSONObject("arguments") ?: JSONObject()
            val requiresConfirmation = obj.optBoolean("requiresConfirmation", false)

            if (requiresConfirmation) {
                val prompt = obj.optString("confirmationPrompt", "Execute sensitive intent?")
                onRequireConfirmation(prompt) {
                    dispatchTool(name, args)
                }
                ToolResult(true, "Awaiting user confirmation on Android UI", "CONFIRMATION_PENDING")
            } else {
                dispatchTool(name, args)
            }
        } catch (e: Exception) {
            ToolResult(false, "Tool execution failed: ${e.message}", "ERROR")
        }
    }

    private fun dispatchTool(name: String, args: JSONObject): ToolResult {
        return when (name) {
            "open_app" -> {
                val appName = args.optString("appName", "Browser")
                intentManager.openApp(appName)
                ToolResult(true, "Dispatched Android launch intent: $appName", "OPEN_APP")
            }
            "open_settings" -> {
                val type = args.optString("settingType", "general")
                intentManager.openSettings(type)
                ToolResult(true, "Dispatched Settings intent: $type", "OPEN_SETTINGS")
            }
            "open_url" -> {
                val url = args.optString("url", "https://google.com")
                intentManager.openUrl(url)
                ToolResult(true, "Opened URL: $url", "OPEN_URL")
            }
            "search_web" -> {
                val q = args.optString("query", "")
                intentManager.searchWeb(q)
                ToolResult(true, "Triggered Web Search: $q", "SEARCH_WEB")
            }
            "timer" -> {
                val duration = args.optInt("durationSeconds", 60)
                val label = args.optString("label", "PENTHER Timer")
                intentManager.startTimer(duration, label)
                ToolResult(true, "Set timer for $duration seconds", "TIMER")
            }
            "reminder" -> {
                val title = args.optString("title", "PENTHER Reminder")
                intentManager.createReminder(title)
                ToolResult(true, "Created Calendar reminder: $title", "REMINDER")
            }
            "camera" -> {
                intentManager.launchCamera()
                ToolResult(true, "Launched Camera hardware intent", "CAMERA")
            }
            "maps" -> {
                val query = args.optString("query", "current location")
                intentManager.openMaps(query)
                ToolResult(true, "Opened Google Maps: $query", "MAPS")
            }
            "share" -> {
                val text = args.optString("text", "")
                intentManager.shareContent(text)
                ToolResult(true, "Shared content via Android Share Sheet", "SHARE")
            }
            else -> ToolResult(false, "Unsupported tool: $name", "UNKNOWN")
        }
    }
}
