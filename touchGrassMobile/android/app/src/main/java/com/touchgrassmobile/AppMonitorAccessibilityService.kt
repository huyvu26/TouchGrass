package com.touchgrassmobile

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.view.accessibility.AccessibilityEvent

class AppMonitorAccessibilityService : AccessibilityService() {
  private var lastEvaluatedPackage: String? = null
  private var lastEvaluationAt = 0L

  companion object {
    @Volatile
    var currentForegroundPackage: String? = null
      private set

    @Volatile
    var isRunning: Boolean = false
      private set
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    isRunning = true
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val packageName = event.packageName?.toString() ?: return
    currentForegroundPackage = packageName
    val now = System.currentTimeMillis()
    if (packageName == lastEvaluatedPackage && now - lastEvaluationAt < 1_500L) return
    lastEvaluatedPackage = packageName
    lastEvaluationAt = now

    val decision = AppControlPolicy.evaluate(this, packageName)
    if (!decision.shouldLock) return
    getSharedPreferences(AppControlPolicy.PREFS_NAME, Context.MODE_PRIVATE).edit()
      .putString(AppControlPolicy.KEY_PENDING_PACKAGE, packageName)
      .putString(AppControlPolicy.KEY_PENDING_APP_NAME, decision.appName)
      .apply()
    startActivity(Intent(this, AppLockActivity::class.java).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      putExtra(AppLockActivity.EXTRA_PACKAGE, packageName)
      putExtra(AppLockActivity.EXTRA_APP_NAME, decision.appName)
      putExtra(AppLockActivity.EXTRA_USED_MINUTES, decision.usedMinutes)
      putExtra(AppLockActivity.EXTRA_LIMIT_MINUTES, decision.limitMinutes)
    })
  }

  override fun onInterrupt() = Unit

  override fun onDestroy() {
    isRunning = false
    currentForegroundPackage = null
    super.onDestroy()
  }
}
