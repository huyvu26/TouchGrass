package com.touchgrassmobile

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class AppMonitorAccessibilityService : AccessibilityService() {
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
    currentForegroundPackage = event.packageName?.toString()
  }

  override fun onInterrupt() = Unit

  override fun onDestroy() {
    isRunning = false
    currentForegroundPackage = null
    super.onDestroy()
  }
}
