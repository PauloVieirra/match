import { apiRequest } from './client';
import { getAccessToken } from '../session';
import { mapSwipeProfileToLocal } from './mappers';

/**
 * Persiste geolocalização do usuário autenticado.
 * @param {{ longitude: number, latitude: number, locationGranted?: boolean }} coords
 */
export async function updateMyLocationOnApi(coords) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const response = await apiRequest('/api/v1/location/me', {
    method: 'PUT',
    token,
    body: {
      longitude: coords.longitude,
      latitude: coords.latitude,
      locationGranted: coords.locationGranted ?? true,
    },
  });

  return response?.data || null;
}

/**
 * Feed de perfis próximos para Discover/swipe.
 * @param {{ maxDistanceKm?: number, longitude?: number, latitude?: number }} query
 */
export async function fetchNearbyProfiles(query = {}) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const params = new URLSearchParams();
  if (query.maxDistanceKm != null) params.set('maxDistanceKm', String(query.maxDistanceKm));
  if (query.longitude != null) params.set('longitude', String(query.longitude));
  if (query.latitude != null) params.set('latitude', String(query.latitude));

  const qs = params.toString();
  const path = qs ? `/api/v1/location/nearby?${qs}` : '/api/v1/location/nearby';

  const response = await apiRequest(path, {
    method: 'GET',
    token,
  });

  const profiles = (response?.data?.profiles || [])
    .map(mapSwipeProfileToLocal)
    .filter(Boolean)
    .map((profile, index) => ({
      ...profile,
      distanceKm: response?.data?.profiles?.[index]?.distanceKm ?? profile.distanceKm ?? null,
    }));

  return {
    profiles,
    meta: response?.data?.meta || { count: profiles.length },
    raw: response,
  };
}
