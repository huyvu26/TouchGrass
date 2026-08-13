package com.touchgrassmobile

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AccessibilityMonitorModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "AccessibilityMonitor"

  @ReactMethod
  fun isAccessibilityEnabled(promise: Promise) {
    val expected = ComponentName(reactContext, AppMonitorAccessibilityService::class.java)
    val enabled = Settings.Secure.getInt(
      reactContext.contentResolver,
      Settings.Secure.ACCESSIBILITY_ENABLED,
      0,
    ) == 1 && Settings.Secure.getString(
      reactContext.contentResolver,
      Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
    ).orEmpty().split(':').mapNotNull(ComponentName::unflattenFromString).any {
      it == expected
    }
    promise.resolve(enabled)
  }

  @ReactMethod
  fun openAccessibilitySettings(promise: Promise) {
    try {
      reactContext.startActivity(
        Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("ACCESSIBILITY_SETTINGS_ERROR", error)
    }
  }

  @ReactMethod
  fun getCurrentForegroundPackage(promise: Promise) {
    promise.resolve(AppMonitorAccessibilityService.currentForegroundPackage)
  }
}
