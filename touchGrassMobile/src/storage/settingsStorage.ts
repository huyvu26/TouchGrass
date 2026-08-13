import {createAsyncStorage} from '@react-native-async-storage/async-storage';

const settingsStorage = createAsyncStorage('touchgrass-settings');
const SETTINGS_KEY = 'preferences';

export async function loadSettings<T>(): Promise<Partial<T>> {
  const saved = await settingsStorage.getItem(SETTINGS_KEY);
  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved) as Partial<T>;
  } catch {
    return {};
  }
}

export async function saveSettings<T>(settings: T): Promise<void> {
  await settingsStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
