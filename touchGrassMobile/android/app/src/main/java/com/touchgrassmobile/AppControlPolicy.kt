package com.touchgrassmobile

import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.telecom.TelecomManager
import org.json.JSONArray

object AppControlPolicy {
  const val PREFS_NAME = "touch_grass_app_control"
  const val KEY_RULES = "rules"
  const val KEY_ENABLED = "enabled"
  const val KEY_PENDING_PACKAGE = "pending_package"
  const val KEY_PENDING_APP_NAME = "pending_app_name"
  private const val UNLOCK_PREFIX = "unlock_until_"
  private const val REWARD_PREFIX = "reward_applied_"

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

  fun setTemporaryUnlock(context: Context, packageName: String, minutes: Int) {
    if (minutes <= 0 || isProtected(context, packageName)) return
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit()
      .putLong(UNLOCK_PREFIX + packageName, System.currentTimeMillis() + minutes * 60_000L)
      .apply()
  }

  fun setTemporaryUnlockUntil(context: Context, packageName: String, expiresAtMs: Long) {
    if (expiresAtMs <= System.currentTimeMillis() || isProtected(context, packageName)) return
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit()
      .putLong(UNLOCK_PREFIX + packageName, expiresAtMs)
      .remove(KEY_PENDING_PACKAGE)
      .remove(KEY_PENDING_APP_NAME)
      .apply()
  }

  fun applyRewardUnlock(context: Context, userTaskId: String, minutes: Int): Boolean {
    if (minutes <= 0 || userTaskId.isBlank()) return false
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    if (prefs.getBoolean(REWARD_PREFIX + userTaskId, false)) return false
    val packageName = prefs.getString(KEY_PENDING_PACKAGE, null) ?: return false
    setTemporaryUnlock(context, packageName, minutes)
    prefs.edit()
      .putBoolean(REWARD_PREFIX + userTaskId, true)
      .remove(KEY_PENDING_PACKAGE)
      .remove(KEY_PENDING_APP_NAME)
      .apply()
    return true
  }

  fun isProtected(context: Context, packageName: String): Boolean {
    if (packageName.isBlank() || packageName == context.packageName) return true
    val exact = mutableSetOf(
      "com.android.settings",
      "com.android.systemui",
      "com.android.contacts",
      "com.android.packageinstaller",
      "com.google.android.packageinstaller",
      "com.android.permissioncontroller",
      "com.google.android.permissioncontroller",
      "com.google.android.gms",
      "com.android.emergency",
      "com.google.android.emergency",
      "com.android.camera",
      "com.android.camera2",
      "com.google.android.GoogleCamera",
      "com.android.devicelockcontroller",
    )
    val packageManager = context.packageManager
    @Suppress("DEPRECATION")
    packageManager.resolveActivity(
      Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME),
      0,
    )?.activityInfo?.packageName?.let(exact::add)
    Telephony.Sms.getDefaultSmsPackage(context)?.let(exact::add)
    (context.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager)
      ?.defaultDialerPackage?.let(exact::add)
    return exact.contains(packageName) ||
      packageName.startsWith("com.android.launcher") ||
      packageName.startsWith("com.google.android.apps.nexuslauncher") ||
      packageName.contains("permissioncontroller") ||
      packageName.contains("packageinstaller") ||
      packageName.contains("emergency") ||
      packageName.contains("devicepolicy")
  }

}
