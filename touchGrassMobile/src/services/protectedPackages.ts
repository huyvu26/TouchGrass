const EXACT_PROTECTED_PACKAGES = new Set([
  'com.android.settings',
  'com.android.systemui',
  'com.android.contacts',
  'com.android.packageinstaller',
  'com.google.android.packageinstaller',
  'com.android.permissioncontroller',
  'com.google.android.permissioncontroller',
  'com.google.android.gms',
  'com.android.emergency',
  'com.google.android.emergency',
  'com.android.camera',
  'com.android.camera2',
  'com.google.android.GoogleCamera',
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
