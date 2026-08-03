/**
 * Resolução de coordenadas para Discover / mapa.
 * Ordem: GPS atual → última conhecida → (dev) origem dos seeds em SP.
 */
import * as Location from 'expo-location';

/** Origem dos usuarios seed (`npm run script:seed-nearby` no backend). */
export const SEED_MAP_ORIGIN = {
  latitude: -23.5614,
  longitude: -46.6559,
  label: 'Av. Paulista (seeds de teste)',
};

/**
 * @returns {Promise<{
 *   coords: { latitude: number, longitude: number } | null,
 *   permission: 'granted' | 'denied' | 'undetermined',
 *   source: 'gps' | 'last_known' | 'seed_fallback' | null,
 * }>}
 */
export async function resolveDiscoverCoordinates(options = {}) {
  const allowSeedFallback = options.allowSeedFallback ?? __DEV__;

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
        accuracy: Location.Accuracy.Balanced,
      });
      if (position?.coords) {
        return {
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          permission,
          source: 'gps',
        };
      }
    } catch (e) {
      console.log('GPS atual indisponível:', e?.message);
    }

    try {
      const last = await Location.getLastKnownPositionAsync();
      if (last?.coords) {
        return {
          coords: {
            latitude: last.coords.latitude,
            longitude: last.coords.longitude,
          },
          permission,
          source: 'last_known',
        };
      }
    } catch (e) {
      console.log('Última localização indisponível:', e?.message);
    }
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
