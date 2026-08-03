import { apiRequest } from './client';
import { getAccessToken } from '../session';
import { mapMatchItemToLocal, mapSwipeProfileToLocal } from './mappers';

/**
 * Registra swipe (conexão / like / pass).
 * @param {string} targetUserId
 * @param {'LIKE'|'PASS'|'SUPER_LIKE'} action
 */
export async function postSwipe(targetUserId, action = 'LIKE') {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const response = await apiRequest('/api/v1/swipes', {
    method: 'POST',
    token,
    body: { targetUserId, action },
  });

  const data = response?.data || {};
  return {
    swipe: data.swipe || null,
    match: data.match
      ? {
          id: data.match.id,
          conversationId: data.match.conversationId || data.match.roomId,
          roomId: data.match.roomId || data.match.conversationId,
        }
      : null,
    raw: response,
  };
}

/**
 * Lista matches ativos do usuário autenticado.
 */
export async function fetchMyMatches() {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const response = await apiRequest('/api/v1/matches', {
    method: 'GET',
    token,
  });

  const items = Array.isArray(response?.data) ? response.data : [];
  return {
    matches: items.map(mapMatchItemToLocal).filter(Boolean),
    raw: response,
  };
}

/**
 * Lista salas de conversa (inbox).
 */
export async function fetchConversations() {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const response = await apiRequest('/api/v1/conversations', {
    method: 'GET',
    token,
  });

  return {
    conversations: Array.isArray(response?.data) ? response.data : [],
    raw: response,
  };
}

/**
 * Histórico REST de mensagens de uma sala (roomId / conversationId).
 * @param {string} roomId
 * @param {{ limit?: number }} [options]
 */
export async function fetchRoomMessages(roomId, options = {}) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const params = new URLSearchParams();
  if (options.limit != null) params.set('limit', String(options.limit));
  const qs = params.toString();
  const path = qs
    ? `/api/v1/conversations/${roomId}/messages?${qs}`
    : `/api/v1/conversations/${roomId}/messages`;

  const response = await apiRequest(path, {
    method: 'GET',
    token,
  });

  return {
    messages: Array.isArray(response?.data) ? response.data : [],
    raw: response,
  };
}

/**
 * Envio REST (fallback). Preferir WebSocket `send_message`.
 * @param {string} roomId
 * @param {string} content
 */
export async function sendRoomMessageHttp(roomId, content) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const response = await apiRequest(`/api/v1/conversations/${roomId}/messages`, {
    method: 'POST',
    token,
    body: { content },
  });

  return {
    message: response?.data || null,
    raw: response,
  };
}

/** Helper: monta person local a partir do swipe profile da API de matches. */
export function personFromMatchApi(matchItem) {
  const person = matchItem?.person || matchItem?.user;
  return mapSwipeProfileToLocal(person);
}
