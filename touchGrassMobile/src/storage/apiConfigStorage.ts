import AsyncStorage from '@react-native-async-storage/async-storage';

import {DEFAULT_API_ORIGIN} from '../config/api';

const API_ORIGIN_KEY = '@touch_grass/api_origin';

export async function getApiOrigin(): Promise<string> {
  return (await AsyncStorage.getItem(API_ORIGIN_KEY)) ?? DEFAULT_API_ORIGIN;
}

export async function saveApiOrigin(origin: string): Promise<void> {
  const normalized = origin.trim().replace(/\/+$/, '');
  if (!/^https?:\/\/[^\s/]+(?::\d+)?$/.test(normalized)) {
    throw new Error('Địa chỉ phải có dạng http://192.168.1.10:3000');
  }
  await AsyncStorage.setItem(API_ORIGIN_KEY, normalized);
}

export async function getApiBaseUrl(): Promise<string> {
  return `${await getApiOrigin()}/api/v1`;
}
