package com.touchgrassmobile

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.telecom.TelecomManager
import org.json.JSONArray
import java.util.Calendar

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
    val usedMinutes: Int = 0,
    val limitMinutes: Int = 0,
  )

  fun evaluate(context: Context, packageName: String): Decision {
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    if (!prefs.getBoolean(KEY_ENABLED, false) || isProtected(context, packageName)) {
      return Decision(false)
    }
    if (prefs.getLong(UNLOCK_PREFIX + packageName, 0L) > System.currentTimeMillis()) {
      return Decision(false)
    }
    if (!hasUsageAccess(context)) return Decision(false)

    val rules = try {
      JSONArray(prefs.getString(KEY_RULES, "[]") ?: "[]")
    } catch (_: Exception) {
      JSONArray()
    }
    for (index in 0 until rules.length()) {
      val rule = rules.optJSONObject(index) ?: continue
      if (rule.optString("packageName") != packageName || !rule.optBoolean("enabled", false)) continue
      if (!isScheduleActive(rule)) return Decision(false)
      val limit = rule.optInt("dailyLimitMinutes", 0)
      if (limit <= 0) return Decision(false)
      val used = getTodayUsageMinutes(context, packageName)
      return Decision(
        shouldLock = used >= limit,
        appName = rule.optString("appName", packageName),
        usedMinutes = used,
        limitMinutes = limit,
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

  private fun hasUsageAccess(context: Context): Boolean {
    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    return appOps.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS,
      android.os.Process.myUid(),
      context.packageName,
    ) == AppOpsManager.MODE_ALLOWED
  }

  private fun getTodayUsageMinutes(context: Context, packageName: String): Int {
    val calendar = Calendar.getInstance().apply {
      set(Calendar.HOUR_OF_DAY, 0)
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
    }
    val manager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val totalMs = manager.queryUsageStats(
      UsageStatsManager.INTERVAL_DAILY,
      calendar.timeInMillis,
      System.currentTimeMillis(),
    ).filter { it.packageName == packageName }.sumOf { it.totalTimeInForeground }
    return (totalMs / 60_000L).toInt()
  }

  private fun isScheduleActive(rule: org.json.JSONObject): Boolean {
    val now = Calendar.getInstance()
    val mondayFirstDay = (now.get(Calendar.DAY_OF_WEEK) + 5) % 7
    val days = rule.optJSONArray("activeDays") ?: return false
    var activeDay = false
    for (index in 0 until days.length()) {
      if (days.optInt(index, -1) == mondayFirstDay) activeDay = true
    }
    if (!activeDay) return false
    val current = "%02d:%02d".format(now.get(Calendar.HOUR_OF_DAY), now.get(Calendar.MINUTE))
    val start = rule.optString("startTime", "00:00")
    val end = rule.optString("endTime", "23:59")
    return current >= start && current <= end
  }
}
