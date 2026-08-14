package com.touchgrassmobile

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppControlModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "AppControl"

  @ReactMethod
  fun syncAppLimitRules(rulesJson: String, promise: Promise) {
    try {
      org.json.JSONArray(rulesJson)
      reactContext.getSharedPreferences(AppControlPolicy.PREFS_NAME, android.content.Context.MODE_PRIVATE)
        .edit()
        .putString(AppControlPolicy.KEY_RULES, rulesJson)
        .apply()
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("INVALID_APP_RULES", "Danh sách giới hạn không hợp lệ", error)
    }
  }

  @ReactMethod
  fun isAppControlEnabled(promise: Promise) {
    val enabled = reactContext
      .getSharedPreferences(AppControlPolicy.PREFS_NAME, android.content.Context.MODE_PRIVATE)
      .getBoolean(AppControlPolicy.KEY_ENABLED, false)
    promise.resolve(enabled)
  }

  @ReactMethod
  fun setAppControlEnabled(enabled: Boolean, promise: Promise) {
    reactContext.getSharedPreferences(AppControlPolicy.PREFS_NAME, android.content.Context.MODE_PRIVATE)
      .edit()
      .putBoolean(AppControlPolicy.KEY_ENABLED, enabled)
      .apply()
    promise.resolve(null)
  }

  @ReactMethod
  fun getPendingLockedApp(promise: Promise) {
    val prefs = reactContext.getSharedPreferences(
      AppControlPolicy.PREFS_NAME,
      android.content.Context.MODE_PRIVATE,
    )
    val packageName = prefs.getString(AppControlPolicy.KEY_PENDING_PACKAGE, null)
    if (packageName == null) {
      promise.resolve(null)
      return
    }
    promise.resolve(Arguments.createMap().apply {
      putString("packageName", packageName)
      putString("appName", prefs.getString(AppControlPolicy.KEY_PENDING_APP_NAME, packageName))
    })
  }

  @ReactMethod
  fun grantTemporaryUnlock(userTaskId: String, minutes: Double, promise: Promise) {
    promise.resolve(
      AppControlPolicy.applyRewardUnlock(
        reactContext,
        userTaskId,
        minutes.toInt(),
      ),
    )
  }

  @ReactMethod
  fun setTemporaryUnlockUntil(packageName: String, expiresAt: String, promise: Promise) {
    try {
      val expiresAtMs = java.time.Instant.parse(expiresAt).toEpochMilli()
      AppControlPolicy.setTemporaryUnlockUntil(reactContext, packageName, expiresAtMs)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("INVALID_UNLOCK_EXPIRY", "Thời gian mở khóa không hợp lệ", error)
    }
  }

  @ReactMethod
  fun emergencyDisable(promise: Promise) {
    reactContext.getSharedPreferences(AppControlPolicy.PREFS_NAME, android.content.Context.MODE_PRIVATE)
      .edit()
      .putBoolean(AppControlPolicy.KEY_ENABLED, false)
      .remove(AppControlPolicy.KEY_PENDING_PACKAGE)
      .remove(AppControlPolicy.KEY_PENDING_APP_NAME)
      .apply()
    promise.resolve(null)
  }
}
