package com.touchgrassmobile

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.net.Uri
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

class AppLockActivity : Activity() {
  private lateinit var lockedPackage: String

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    lockedPackage = intent.getStringExtra(EXTRA_PACKAGE).orEmpty()
    if (lockedPackage.isBlank() || AppControlPolicy.isProtected(this, lockedPackage)) {
      finish()
      return
    }
    setContentView(buildContent())
  }

  @Suppress("DEPRECATION")
  override fun onBackPressed() {
    goHome()
  }

  private fun buildContent(): View {
    val appName = intent.getStringExtra(EXTRA_APP_NAME) ?: lockedPackage
    val padding = dp(24)

    return ScrollView(this).apply {
      setBackgroundColor(Color.rgb(18, 61, 19))
      addView(LinearLayout(context).apply {
        orientation = LinearLayout.VERTICAL
        gravity = Gravity.CENTER_HORIZONTAL
        setPadding(padding, dp(56), padding, dp(32))
        addView(text("🌱", 60, Color.WHITE, Typeface.NORMAL))
        addView(text("Ứng dụng đang bị khóa", 27, Color.WHITE, Typeface.BOLD).withMargins(top = 18))
        addView(text(appName, 20, Color.rgb(176, 242, 103), Typeface.BOLD).withMargins(top = 8))
        addView(text("Ứng dụng này nằm trong danh sách bạn đã chọn để hạn chế sử dụng.", 15, Color.rgb(220, 232, 217), Typeface.NORMAL).withMargins(top = 12))
        addView(text("Hãy dùng Leaf Point để mua thời gian sử dụng tạm thời.", 13, Color.rgb(190, 207, 186), Typeface.NORMAL).withMargins(top = 12, bottom = 28))
        addView(button("Mở Touch Grass", Color.rgb(176, 242, 103), Color.rgb(18, 61, 19)) {
          startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("touchgrass://app-lock")).apply {
            setPackage(this@AppLockActivity.packageName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
          })
          finish()
        })
        addView(button("Về màn hình chính", Color.TRANSPARENT, Color.WHITE) { goHome() }.withMargins(top = 12))
      })
    }
  }

  private fun goHome() {
    startActivity(Intent(Intent.ACTION_MAIN).apply {
      addCategory(Intent.CATEGORY_HOME)
      flags = Intent.FLAG_ACTIVITY_NEW_TASK
    })
    finish()
  }

  private fun text(value: String, size: Int, color: Int, style: Int) = TextView(this).apply {
    text = value
    textSize = size.toFloat()
    setTextColor(color)
    gravity = Gravity.CENTER
    typeface = Typeface.create(Typeface.DEFAULT, style)
  }

  private fun button(label: String, background: Int, foreground: Int, onClick: () -> Unit) =
    Button(this).apply {
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

  companion object {
    const val EXTRA_PACKAGE = "package_name"
    const val EXTRA_APP_NAME = "app_name"
  }
}
