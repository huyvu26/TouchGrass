package com.touchgrassmobile

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class ScreenStateModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private var registered = false
  private var screenOffAt: String? = null
  private var screenOnAt: String? = null

  private val receiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      val timestamp = nowIsoUtc()
      when (intent?.action) {
        Intent.ACTION_SCREEN_OFF -> {
          screenOffAt = timestamp
          screenOnAt = null
          emit("SCREEN_OFF", timestamp)
        }
        Intent.ACTION_SCREEN_ON -> {
          if (screenOffAt != null) {
            screenOnAt = timestamp
            emit("SCREEN_ON", timestamp)
          }
        }
      }
    }
  }

  override fun getName(): String = "ScreenState"

  @ReactMethod
  fun startListening(promise: Promise) {
    screenOffAt = null
    screenOnAt = null
    if (!registered) {
      val filter = IntentFilter().apply {
        addAction(Intent.ACTION_SCREEN_OFF)
        addAction(Intent.ACTION_SCREEN_ON)
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        reactContext.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
      } else {
        @Suppress("DEPRECATION")
        reactContext.registerReceiver(receiver, filter)
      }
      registered = true
    }
    promise.resolve(null)
  }

  @ReactMethod
  fun stopListening(promise: Promise) {
    unregisterReceiver()
    promise.resolve(null)
  }

  @ReactMethod
  fun getScreenEvents(promise: Promise) {
    val result = Arguments.createMap().apply {
      putString("screenOffAt", screenOffAt)
      putString("screenOnAt", screenOnAt)
    }
    promise.resolve(result)
  }

  @ReactMethod
  fun addListener(eventName: String) = Unit

  @ReactMethod
  fun removeListeners(count: Double) = Unit

  override fun invalidate() {
    unregisterReceiver()
    super.invalidate()
  }

  private fun unregisterReceiver() {
    if (registered) {
      try {
        reactContext.unregisterReceiver(receiver)
      } catch (_: IllegalArgumentException) {
        // Receiver was already removed by Android.
      }
      registered = false
    }
  }

  private fun emit(type: String, timestamp: String) {
    if (!reactContext.hasActiveReactInstance()) return
    val payload = Arguments.createMap().apply {
      putString("type", type)
      putString("timestamp", timestamp)
    }
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit("ScreenStateChanged", payload)
  }

  private fun nowIsoUtc(): String {
    return SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
      timeZone = TimeZone.getTimeZone("UTC")
    }.format(Date())
  }
}
