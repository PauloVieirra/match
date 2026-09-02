/**
 * Resolução de coordenadas para Discover / mapa.
 * Ordem: GPS atual → última conhecida → perfil salvo na API → env → (dev) seeds Brasília.
 */
import * as Location from 'expo-location';

/** GPS padrão do emulador Android (Google HQ, Mountain View). */
const ANDROID_EMULATOR_DEFAULT = {
  latitude: 37.4219983,
  longitude: -122.084,
};

const COORD_EPSILON = 0.003;

/** Origem dos seeds de teste (Brasília). */
export const SEED_MAP_ORIGIN = {
  latitude: -15.858894,
  longitude: -48.082652,
  label: 'Brasília (seeds de teste)',
};

function nearCoord(a, b, epsilon = COORD_EPSILON) {
  return Math.abs(a - b) <= epsilon;
}

/** Retorna true para o mock fixo do emulador Android (EUA). */
export function isEmulatorMockLocation(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  return (
    nearCoord(latitude, ANDROID_EMULATOR_DEFAULT.latitude)
    && nearCoord(longitude, ANDROID_EMULATOR_DEFAULT.longitude)
  );
}

/** Extrai lat/lng do perfil persistido no backend. */
export function coordsFromProfile(profile) {
  const geo = profile?.location?.coordinates;
  if (Array.isArray(geo) && geo.length >= 2) {
    const [lng, lat] = geo;
    if (typeof lng === 'number' && typeof lat === 'number' && !Number.isNaN(lng) && !Number.isNaN(lat)) {
      return { latitude: lat, longitude: lng };
    }
  }

  if (
    typeof profile?.latitude === 'number'
    && typeof profile?.longitude === 'number'
    && !Number.isNaN(profile.latitude)
    && !Number.isNaN(profile.longitude)
  ) {
    return { latitude: profile.latitude, longitude: profile.longitude };
  }

  return null;
}

function coordsFromEnvFallback() {
  const lat = process.env.EXPO_PUBLIC_FALLBACK_LATITUDE;
  const lng = process.env.EXPO_PUBLIC_FALLBACK_LONGITUDE;
  if (lat == null || lng == null) return null;

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

  return { latitude, longitude };
}

function trustedCoords(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
  if (isEmulatorMockLocation(latitude, longitude)) return null;
  return { latitude, longitude };
}

function resultFromCoords(coords, permission, source) {
  const trusted = trustedCoords(coords.latitude, coords.longitude);
  if (!trusted) return null;
  return { coords: trusted, permission, source };
}

/**
 * @param {{
 *   allowSeedFallback?: boolean,
 *   storedProfileCoords?: { latitude: number, longitude: number } | null,
 * }} options
 * @returns {Promise<{
 *   coords: { latitude: number, longitude: number } | null,
 *   permission: 'granted' | 'denied' | 'undetermined',
 *   source: 'gps' | 'last_known' | 'profile' | 'env_fallback' | 'seed_fallback' | null,
 * }>}
 */
export async function resolveDiscoverCoordinates(options = {}) {
  const allowSeedFallback = options.allowSeedFallback ?? __DEV__;
  const storedProfileCoords = options.storedProfileCoords ?? null;

  let permission = 'undetermined';
  try {
    const current = await Location.getForegroundPermissionsAsync();
    permission = current.status;
    if (current.status !== 'granted') {
      const asked = await Location.requestForegroundPermissionsAsync();
      permission = asked.status;
    }
  } catch {
    permission = 'denied';
  }

  if (permission === 'granted') {
    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      });
      if (position?.coords) {
        const resolved = resultFromCoords(
          position.coords,
          permission,
          'gps',
        );
        if (resolved) return resolved;
        console.log('GPS do emulador ignorado (Mountain View padrão); usando fallback.');
      }
    } catch (e) {
      console.log('GPS atual indisponível:', e?.message);
    }

    try {
      const last = await Location.getLastKnownPositionAsync();
      if (last?.coords) {
        const resolved = resultFromCoords(
          last.coords,
          permission,
          'last_known',
        );
        if (resolved) return resolved;
      }
    } catch (e) {
      console.log('Última localização indisponível:', e?.message);
    }
  }

  const profileCoords = trustedCoords(
    storedProfileCoords?.latitude,
    storedProfileCoords?.longitude,
  );
  if (profileCoords) {
    return { coords: profileCoords, permission, source: 'profile' };
  }

  const envCoords = coordsFromEnvFallback();
  const trustedEnv = envCoords
    ? trustedCoords(envCoords.latitude, envCoords.longitude)
    : null;
  if (trustedEnv) {
    return { coords: trustedEnv, permission, source: 'env_fallback' };
  }

  if (allowSeedFallback) {
    return {
      coords: { ...SEED_MAP_ORIGIN },
      permission,
      source: 'seed_fallback',
    };
  }

  return { coords: null, permission, source: null };
}
