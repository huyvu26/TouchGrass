package com.touchgrassmobile

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.Manifest
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DeviceSettingsModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "DeviceSettings"

  @ReactMethod
  fun getFineLocationPermissionStatus(promise: Promise) {
    if (ContextCompat.checkSelfPermission(
        reactContext,
        Manifest.permission.ACCESS_FINE_LOCATION,
      ) == PackageManager.PERMISSION_GRANTED
    ) {
      promise.resolve("granted")
      return
    }
    val requested = reactContext.getSharedPreferences("touch_grass_permissions", Context.MODE_PRIVATE)
      .getBoolean("fine_location_requested", false)
    val canExplain = reactContext.currentActivity?.let {
      ActivityCompat.shouldShowRequestPermissionRationale(it, Manifest.permission.ACCESS_FINE_LOCATION)
    } ?: false
    promise.resolve(
      when {
        !requested -> "notDetermined"
        canExplain -> "denied"
        else -> "blocked"
      },
    )
  }

  @ReactMethod
  fun markFineLocationPermissionRequested(promise: Promise) {
    reactContext.getSharedPreferences("touch_grass_permissions", Context.MODE_PRIVATE)
      .edit()
      .putBoolean("fine_location_requested", true)
      .apply()
    promise.resolve(null)
  }

  @ReactMethod
  fun isLocationServicesEnabled(promise: Promise) {
    val manager = reactContext.getSystemService(Context.LOCATION_SERVICE) as LocationManager
    promise.resolve(
      manager.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
        manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER),
    )
  }

  @ReactMethod
  fun openLocationSettings(promise: Promise) {
    try {
      reactContext.startActivity(
        Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("LOCATION_SETTINGS_ERROR", error)
    }
  }
}
