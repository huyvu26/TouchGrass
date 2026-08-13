package com.touchgrassmobile

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.provider.Settings
import android.telecom.TelecomManager
import android.provider.Telephony
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class UsageStatsModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "UsageStats"

  @ReactMethod
  fun isUsageAccessGranted(promise: Promise) {
    promise.resolve(hasUsageAccess())
  }

  @ReactMethod
  fun openUsageAccessSettings(promise: Promise) {
    try {
      reactContext.startActivity(
        Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("USAGE_SETTINGS_ERROR", error)
    }
  }

  @ReactMethod
  fun getInstalledLaunchableApps(promise: Promise) {
    try {
      val packageManager = reactContext.packageManager
      val launcherIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
      val protectedPackages = getProtectedPackages()
      val apps = Arguments.createArray()
      val seen = mutableSetOf<String>()

      @Suppress("DEPRECATION")
      val activities = packageManager.queryIntentActivities(launcherIntent, 0)
      activities.sortedBy { it.loadLabel(packageManager).toString().lowercase() }.forEach { info ->
        val packageName = info.activityInfo.packageName
        if (!seen.add(packageName) || protectedPackages.contains(packageName)) return@forEach
        val applicationInfo = info.activityInfo.applicationInfo
        val isSystem = applicationInfo.flags and ApplicationInfo.FLAG_SYSTEM != 0
        // Android's ApplicationInfo categories do not expose a reliable finance/authentication
        // category. Do not guess from the app name; unknown apps remain user-controlled.
        val isSensitive = false
        apps.pushMap(Arguments.createMap().apply {
          putString("packageName", packageName)
          putString("appName", info.loadLabel(packageManager).toString())
          putBoolean("isSystemApp", isSystem)
          putBoolean("isSensitive", isSensitive)
        })
      }
      promise.resolve(apps)
    } catch (error: Exception) {
      promise.reject("INSTALLED_APPS_ERROR", error)
    }
  }

  @ReactMethod
  fun getAppUsageStats(startAt: Double, endAt: Double, promise: Promise) {
    if (!hasUsageAccess()) {
      promise.reject("USAGE_ACCESS_REQUIRED", "Usage Access chưa được cấp")
      return
    }
    try {
      val manager = reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val packageManager = reactContext.packageManager
      val result = Arguments.createArray()
      manager.queryUsageStats(
        UsageStatsManager.INTERVAL_DAILY,
        startAt.toLong(),
        endAt.toLong(),
      ).groupBy { it.packageName }.forEach { (packageName, entries) ->
        val foregroundMs = entries.sumOf { it.totalTimeInForeground }
        if (foregroundMs <= 0) return@forEach
        val appName = try {
          packageManager.getApplicationLabel(packageManager.getApplicationInfo(packageName, 0)).toString()
        } catch (_: Exception) {
          packageName
        }
        result.pushMap(Arguments.createMap().apply {
          putString("packageName", packageName)
          putString("appName", appName)
          putDouble("totalTimeInForegroundMs", foregroundMs.toDouble())
          putDouble("lastTimeUsed", entries.maxOfOrNull { it.lastTimeUsed }?.toDouble() ?: 0.0)
        })
      }
      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject("USAGE_STATS_ERROR", error)
    }
  }

  private fun hasUsageAccess(): Boolean {
    val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = appOps.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS,
      android.os.Process.myUid(),
      reactContext.packageName,
    )
    return mode == AppOpsManager.MODE_ALLOWED
  }

  private fun getProtectedPackages(): Set<String> {
    val packages = mutableSetOf(
      reactContext.packageName,
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
    val packageManager = reactContext.packageManager
    val homeIntent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
    @Suppress("DEPRECATION")
    packageManager.resolveActivity(homeIntent, 0)?.activityInfo?.packageName?.let(packages::add)
    Telephony.Sms.getDefaultSmsPackage(reactContext)?.let(packages::add)
    (reactContext.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager)
      ?.defaultDialerPackage?.let(packages::add)
    return packages
  }
}
