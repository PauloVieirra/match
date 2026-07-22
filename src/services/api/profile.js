import { apiRequest } from './client';
import { getAccessToken } from '../session';
import { mapApiUserToLocal, mapSwipeProfileToLocal } from './mappers';

/**
 * Perfil completo do dono autenticado.
 * GET /api/v1/profile/me
 */
export async function fetchMyProfile() {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const response = await apiRequest('/api/v1/profile/me', {
    method: 'GET',
    token,
  });

  const profilePayload = response?.data?.profile;
  return {
    user: mapApiUserToLocal(profilePayload),
    raw: response,
  };
}

/**
 * Atualiza o perfil do dono.
 * PATCH /api/v1/profile/me
 */
export async function updateMyProfileOnApi(partialProfile) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const photos = Array.isArray(partialProfile?.photos)
    ? partialProfile.photos.map((photo, index) => {
        if (photo?.base64) {
          return {
            order: typeof photo.order === 'number' ? photo.order : index,
            mimeType: photo.mimeType || 'image/jpeg',
            base64: photo.base64,
          };
        }
        return {
          order: typeof photo.order === 'number' ? photo.order : index,
          uri: photo?.uri,
          path: photo?.path,
          bucket: photo?.bucket,
        };
      })
    : undefined;

  const body = {
    ...partialProfile,
    ...(photos ? { photos } : {}),
  };

  const response = await apiRequest('/api/v1/profile/me', {
    method: 'PATCH',
    token,
    timeoutMs: photos?.some((p) => p.base64) ? 90_000 : 20_000,
    body,
  });

  return {
    user: mapApiUserToLocal(response?.data?.profile),
    raw: response,
  };
}

/**
 * Perfil público para swipe / detalhe.
 * GET /api/v1/profile/:userId
 */
export async function fetchPublicProfile(userId) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const response = await apiRequest(`/api/v1/profile/${userId}`, {
    method: 'GET',
    token,
  });

  return {
    profile: mapSwipeProfileToLocal(response?.data?.profile),
    raw: response,
  };
}
