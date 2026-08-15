package com.touchgrassmobile

import android.accessibilityservice.AccessibilityServiceInfo
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
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
    val enabledInSecureSettings = Settings.Secure.getInt(
      reactContext.contentResolver,
      Settings.Secure.ACCESSIBILITY_ENABLED,
      0,
    ) == 1 && Settings.Secure.getString(
      reactContext.contentResolver,
      Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES,
    ).orEmpty().split(':').mapNotNull(ComponentName::unflattenFromString).any {
      it.packageName == expected.packageName &&
        it.className == expected.className
    }
    val manager = reactContext.getSystemService(
      Context.ACCESSIBILITY_SERVICE,
    ) as AccessibilityManager
    val enabledInManager = manager
      .getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)
      .any { service ->
        service.resolveInfo.serviceInfo.packageName == expected.packageName &&
          service.resolveInfo.serviceInfo.name == expected.className
      }
    promise.resolve(
      AppMonitorAccessibilityService.isRunning ||
        enabledInSecureSettings ||
        enabledInManager,
    )
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
