import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_LIMIT_RULES_KEY = '@touch_grass/app_limit_rules';

export interface AppLimitRule {
  packageName: string;
  appName: string;
  enabled: boolean;
  dailyLimitMinutes: number;
  activeDays: number[];
  startTime: string;
  endTime: string;
}

export async function getAppLimitRules(): Promise<AppLimitRule[]> {
  const raw = await AsyncStorage.getItem(APP_LIMIT_RULES_KEY);
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as AppLimitRule[]) : [];
  } catch {
    return [];
  }
}

export async function saveAppLimitRule(rule: AppLimitRule): Promise<void> {
  const rules = await getAppLimitRules();
  const next = rules.filter(item => item.packageName !== rule.packageName);
  next.push(rule);
  await AsyncStorage.setItem(APP_LIMIT_RULES_KEY, JSON.stringify(next));
}

export async function replaceAppLimitRules(rules: AppLimitRule[]): Promise<void> {
  await AsyncStorage.setItem(APP_LIMIT_RULES_KEY, JSON.stringify(rules));
}

export async function removeAppLimitRule(packageName: string): Promise<void> {
  const rules = await getAppLimitRules();
  await AsyncStorage.setItem(
    APP_LIMIT_RULES_KEY,
    JSON.stringify(rules.filter(item => item.packageName !== packageName)),
  );
}
