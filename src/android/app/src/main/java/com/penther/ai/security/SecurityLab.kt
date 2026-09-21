package com.penther.ai.security

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.security.MessageDigest
import kotlin.math.ln

/**
 * PENTHER Security Lab (Android Native)
 * Defensive cybersecurity education and secure cryptographic storage.
 * Created by Rai Kumar
 */
class SecurityLab(private val context: Context) {

    // 1. Secure Storage for API Keys via Android Keystore
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val securePrefs = EncryptedSharedPreferences.create(
        context,
        "penther_secure_vault",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun storeSecret(key: String, value: String) {
        securePrefs.edit().putString(key, value).apply()
    }

    fun getSecret(key: String): String? {
        return securePrefs.getString(key, null)
    }

    // 2. SHA-256 Digest Demonstration
    fun sha256(input: String): String {
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray())
        return bytes.joinToString("") { "%02x".format(it) }
    }

    // 3. Password Entropy Analysis
    fun calculatePasswordEntropy(password: String): Int {
        var pool = 0
        if (password.any { it.isLowerCase() }) pool += 26
        if (password.any { it.isUpperCase() }) pool += 26
        if (password.any { it.isDigit() }) pool += 10
        if (password.any { !it.isLetterOrDigit() }) pool += 32
        if (pool == 0) return 0
        return (password.length * (ln(pool.toDouble()) / ln(2.0))).toInt()
    }

    // 4. Classical Caesar Cipher Shift
    fun caesarCipher(text: String, shift: Int): String {
        return text.map { char ->
            when {
                char.isUpperCase() -> ('A'.code + (char.code - 'A'.code + shift) % 26).toChar()
                char.isLowerCase() -> ('a'.code + (char.code - 'a'.code + shift) % 26).toChar()
                else -> char
            }
        }.joinToString("")
    }
}
