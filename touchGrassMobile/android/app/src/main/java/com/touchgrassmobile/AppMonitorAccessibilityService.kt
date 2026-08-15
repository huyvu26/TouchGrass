package com.touchgrassmobile

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

class AppMonitorAccessibilityService : AccessibilityService() {
  private val monitorHandler = Handler(Looper.getMainLooper())
  private var overlayView: View? = null
  private var overlayPackage: String? = null
  private var lastFallbackAt = 0L

  private val monitorRunnable = object : Runnable {
    override fun run() {
      currentForegroundPackage?.let(::evaluatePackage)
      monitorHandler.postDelayed(this, MONITOR_INTERVAL_MS)
    }
  }

  companion object {
    private const val MONITOR_INTERVAL_MS = 1_000L

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
    monitorHandler.removeCallbacks(monitorRunnable)
    monitorHandler.post(monitorRunnable)
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val packageName = event.packageName?.toString() ?: return

    // The accessibility overlay can emit an event owned by Touch Grass itself.
    // Keep monitoring the app underneath until the user chooses an action.
    if (overlayView != null && packageName == this.packageName) return

    currentForegroundPackage = packageName
    if (overlayPackage != null && overlayPackage != packageName) hideLockOverlay()
    evaluatePackage(packageName)
  }

  private fun evaluatePackage(packageName: String) {
    val decision = AppControlPolicy.evaluate(this, packageName)
    if (!decision.shouldLock) {
      if (overlayPackage == packageName) hideLockOverlay()
      return
    }
    rememberPendingApp(packageName, decision.appName)
    showLockOverlay(packageName, decision)
  }

  private fun rememberPendingApp(packageName: String, appName: String) {
    getSharedPreferences(AppControlPolicy.PREFS_NAME, Context.MODE_PRIVATE).edit()
      .putString(AppControlPolicy.KEY_PENDING_PACKAGE, packageName)
      .putString(AppControlPolicy.KEY_PENDING_APP_NAME, appName)
      .apply()
  }

  private fun showLockOverlay(packageName: String, decision: AppControlPolicy.Decision) {
    if (overlayView != null && overlayPackage == packageName) return
    hideLockOverlay()

    val view = buildLockView(packageName, decision)
    val params = WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT,
    ).apply {
      gravity = Gravity.TOP or Gravity.START
    }

    try {
      (getSystemService(Context.WINDOW_SERVICE) as WindowManager).addView(view, params)
      overlayView = view
      overlayPackage = packageName
    } catch (_: Exception) {
      val now = System.currentTimeMillis()
      if (now - lastFallbackAt < 5_000L) return
      lastFallbackAt = now
      startActivity(Intent(this, AppLockActivity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        putExtra(AppLockActivity.EXTRA_PACKAGE, packageName)
        putExtra(AppLockActivity.EXTRA_APP_NAME, decision.appName)
        putExtra(AppLockActivity.EXTRA_USED_MINUTES, decision.usedMinutes)
        putExtra(AppLockActivity.EXTRA_LIMIT_MINUTES, decision.limitMinutes)
      })
    }
  }

  private fun buildLockView(
    packageName: String,
    decision: AppControlPolicy.Decision,
  ): View = ScrollView(this).apply {
    isFillViewport = true
    setBackgroundColor(Color.rgb(18, 61, 19))
    addView(LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setPadding(dp(24), dp(56), dp(24), dp(32))
      addView(lockText("🌱", 60, Color.WHITE, Typeface.NORMAL))
      addView(lockText("Đã đạt giới hạn", 27, Color.WHITE, Typeface.BOLD).withMargins(top = 18))
      addView(lockText(decision.appName, 20, Color.rgb(176, 242, 103), Typeface.BOLD).withMargins(top = 8))
      addView(lockText(
        "Bạn đã sử dụng ${decision.usedMinutes} phút hôm nay. Giới hạn hiện tại là ${decision.limitMinutes} phút.",
        15,
        Color.rgb(220, 232, 217),
        Typeface.NORMAL,
      ).withMargins(top = 12))
      addView(lockText(
        "Touch Grass chỉ giới hạn ứng dụng bạn đã chủ động chọn. Hãy hoàn thành một nhiệm vụ để nhận thời gian mở khóa.",
        13,
        Color.rgb(190, 207, 186),
        Typeface.NORMAL,
      ).withMargins(top = 12, bottom = 28))
      addView(lockButton(
        "Mở Touch Grass để làm nhiệm vụ",
        Color.rgb(176, 242, 103),
        Color.rgb(18, 61, 19),
      ) {
        hideLockOverlay()
        startActivity(Intent(this@AppMonitorAccessibilityService, MainActivity::class.java).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        })
      })
      addView(lockButton("Về màn hình chính", Color.TRANSPARENT, Color.WHITE) {
        hideLockOverlay()
        performGlobalAction(GLOBAL_ACTION_HOME)
      }.withMargins(top = 12))
      addView(lockButton(
        "Tạm bỏ qua 5 phút (thoát an toàn)",
        Color.TRANSPARENT,
        Color.rgb(255, 205, 120),
      ) {
        AppControlPolicy.setTemporaryUnlock(this@AppMonitorAccessibilityService, packageName, 5)
        hideLockOverlay()
      }.withMargins(top = 12))
    }, ViewGroup.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.MATCH_PARENT,
    ))
  }

  private fun hideLockOverlay() {
    val view = overlayView ?: return
    try {
      (getSystemService(Context.WINDOW_SERVICE) as WindowManager).removeView(view)
    } catch (_: Exception) {
      // The system can detach it while Accessibility is being disabled.
    }
    overlayView = null
    overlayPackage = null
  }

  private fun lockText(value: String, size: Int, color: Int, style: Int) = TextView(this).apply {
    text = value
    textSize = size.toFloat()
    setTextColor(color)
    gravity = Gravity.CENTER
    typeface = Typeface.create(Typeface.DEFAULT, style)
  }

  private fun lockButton(
    label: String,
    background: Int,
    foreground: Int,
    onClick: () -> Unit,
  ) = Button(this).apply {
    text = label
    textSize = 14f
    isAllCaps = false
    setTextColor(foreground)
    setBackgroundColor(background)
    setOnClickListener { onClick() }
    layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(54))
  }

  private fun View.withMargins(top: Int = 0, bottom: Int = 0): View = apply {
    val current = layoutParams as? LinearLayout.LayoutParams
      ?: LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)
    current.setMargins(0, dp(top), 0, dp(bottom))
    layoutParams = current
  }

  private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()

  override fun onInterrupt() {
    hideLockOverlay()
  }

  override fun onDestroy() {
    monitorHandler.removeCallbacksAndMessages(null)
    hideLockOverlay()
    isRunning = false
    currentForegroundPackage = null
    super.onDestroy()
  }
}
