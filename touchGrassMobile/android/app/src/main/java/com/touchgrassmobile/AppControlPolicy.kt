package com.touchgrassmobile

import android.content.Context
import org.json.JSONArray

object AppControlPolicy {
  const val PREFS_NAME = "touch_grass_app_control"
  const val KEY_RULES = "rules"
  const val KEY_PROTECTED_PACKAGES = "protected_packages"
  const val KEY_ENABLED = "enabled"
  const val KEY_PENDING_PACKAGE = "pending_package"
  const val KEY_PENDING_APP_NAME = "pending_app_name"
  private const val UNLOCK_PREFIX = "unlock_until_"

  data class Decision(
    val shouldLock: Boolean,
    val appName: String = "Ứng dụng",
  )

  fun evaluate(context: Context, packageName: String): Decision {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    if (!prefs.getBoolean(KEY_ENABLED, false) || isProtected(context, packageName)) {
      return Decision(false)
    }
    if (prefs.getLong(UNLOCK_PREFIX + packageName, 0L) > System.currentTimeMillis()) {
      return Decision(false)
    }
    val rules = try {
      JSONArray(prefs.getString(KEY_RULES, "[]") ?: "[]")
    } catch (_: Exception) {
      JSONArray()
    }
    for (index in 0 until rules.length()) {
      val rule = rules.optJSONObject(index) ?: continue
      if (rule.optString("packageName") != packageName || !rule.optBoolean("enabled", false)) continue
      return Decision(
        shouldLock = true,
        appName = rule.optString("appName", packageName),
      )
    }
    return Decision(false)
  }

  fun setTemporaryUnlockUntil(context: Context, packageName: String, expiresAtMs: Long) {
    if (expiresAtMs <= System.currentTimeMillis() || isProtected(context, packageName)) return
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit()
      .putLong(UNLOCK_PREFIX + packageName, expiresAtMs)
      .remove(KEY_PENDING_PACKAGE)
      .remove(KEY_PENDING_APP_NAME)
      .apply()
  }

  fun isProtected(context: Context, packageName: String): Boolean {
    if (packageName.isBlank() || packageName == context.packageName) return true
    val protectedPackages = try {
      JSONArray(
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
          .getString(KEY_PROTECTED_PACKAGES, "[]") ?: "[]",
      )
    } catch (_: Exception) {
      JSONArray()
    }
    for (index in 0 until protectedPackages.length()) {
      if (protectedPackages.optString(index) == packageName) return true
    }
    return false
  }

}
