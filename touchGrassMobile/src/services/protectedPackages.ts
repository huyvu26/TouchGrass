const EXACT_PROTECTED_PACKAGES = new Set([
  'com.android.settings',
  'com.android.systemui',
  'com.android.launcher',
  'com.android.launcher2',
  'com.android.launcher3',
  'com.google.android.apps.nexuslauncher',
  'com.sec.android.app.launcher',
  'com.miui.home',
  'com.android.contacts',
  'com.google.android.contacts',
  'com.samsung.android.contacts',
  'com.android.phone',
  'com.android.dialer',
  'com.google.android.dialer',
  'com.android.incallui',
  'com.android.messaging',
  'com.google.android.apps.messaging',
  'com.samsung.android.messaging',
  'com.android.packageinstaller',
  'com.google.android.packageinstaller',
  'com.android.managedprovisioning',
  'com.android.permissioncontroller',
  'com.google.android.permissioncontroller',
  'com.google.android.gms',
  'com.android.emergency',
  'com.google.android.emergency',
  'com.android.camera',
  'com.android.camera2',
  'com.google.android.googlecamera',
  'com.sec.android.app.camera',
  'com.android.devicelockcontroller',
  'com.touchgrassmobile',
]);

export const protectedPackageAllowlist = EXACT_PROTECTED_PACKAGES;

export function isProtectedPackage(packageName: string): boolean {
  return (
    EXACT_PROTECTED_PACKAGES.has(packageName) ||
    packageName.startsWith('com.touchgrassmobile') ||
    packageName.startsWith('com.android.launcher') ||
    packageName.startsWith('com.google.android.apps.nexuslauncher') ||
    packageName.includes('.permissioncontroller') ||
    packageName.includes('.packageinstaller') ||
    packageName.includes('.emergency') ||
    packageName.includes('.devicepolicy')
  );
}
