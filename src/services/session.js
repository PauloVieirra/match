import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_KEY = 'matchmaromba.accessToken';
const REFRESH_KEY = 'matchmaromba.refreshToken';
const SESSION_META_KEY = '@matchmaromba:sessionMeta';

async function setItem(key, value) {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key) {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key) {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveSession(session) {
  if (!session?.accessToken) return;
  await setItem(ACCESS_KEY, session.accessToken);
  if (session.refreshToken) await setItem(REFRESH_KEY, session.refreshToken);
  await AsyncStorage.setItem(
    SESSION_META_KEY,
    JSON.stringify({
      expiresIn: session.expiresIn,
      expiresAt: session.expiresAt,
      tokenType: session.tokenType || 'bearer',
    }),
  );
}

export async function getAccessToken() {
  return getItem(ACCESS_KEY);
}

export async function getRefreshToken() {
  return getItem(REFRESH_KEY);
}

export async function clearSession() {
  await Promise.all([
    deleteItem(ACCESS_KEY),
    deleteItem(REFRESH_KEY),
    AsyncStorage.removeItem(SESSION_META_KEY),
  ]);
}
