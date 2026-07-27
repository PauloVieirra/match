import { apiRequest } from './client';
import { getAccessToken, getRefreshToken, saveSession, clearSession } from '../session';
import { mapApiUserToLocal } from './mappers';

async function unwrapAuth(response) {
  const data = response?.data || {};
  if (data.session) {
    await saveSession(data.session);
  }
  return {
    user: mapApiUserToLocal(data.user),
    session: data.session || null,
    raw: response,
  };
}

export async function registerWithEmail({ email, password, name, phone, termsAccepted = true }) {
  const response = await apiRequest('/api/v1/auth/register', {
    method: 'POST',
    body: {
      email,
      password,
      name: name?.trim() || undefined,
      phone: phone?.trim() || undefined,
      termsAccepted,
    },
  });
  return unwrapAuth(response);
}

export async function loginWithEmail({ email, password }) {
  const response = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return unwrapAuth(response);
}

export async function refreshSessionOnApi() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const response = await apiRequest('/api/v1/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    skipAuthRetry: true,
  });
  return unwrapAuth(response);
}

export async function completeOnboardingOnApi(profileData) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const photos = (profileData.photos || []).map((photo, index) => {
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
    };
  });

  const response = await apiRequest('/api/v1/auth/complete-onboarding', {
    method: 'POST',
    token,
    timeoutMs: 90_000,
    body: {
      ...profileData,
      photos,
    },
  });

  return {
    user: mapApiUserToLocal(response?.data?.user),
    raw: response,
  };
}

export async function logoutSession() {
  await clearSession();
}
