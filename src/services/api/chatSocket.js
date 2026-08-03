/**
 * Cliente WebSocket do chat.
 * Preferência: EXPO_PUBLIC_WS_URL (wss://host/ws).
 * Fallback: deriva de EXPO_PUBLIC_API_URL (https→wss, http→ws) + /ws.
 */
import { getAccessToken } from '../session';

function getWsUrl() {
  const explicit = process.env.EXPO_PUBLIC_WS_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }

  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!apiUrl) {
    throw new Error(
      'EXPO_PUBLIC_WS_URL ou EXPO_PUBLIC_API_URL não configurada.',
    );
  }

  const base = apiUrl.replace(/\/+$/, '').replace(/^http/, 'ws');
  return base.endsWith('/ws') ? base : `${base}/ws`;
}

let socket = null;
let listeners = new Set();
let reconnectTimer = null;
let intentionalClose = false;
let openWaiters = [];

function flushOpenWaiters(error = null) {
  const waiters = openWaiters;
  openWaiters = [];
  for (const { resolve, reject } of waiters) {
    if (error) reject(error);
    else resolve(socket);
  }
}

function emit(event, payload) {
  for (const listener of listeners) {
    try {
      listener(event, payload);
    } catch (e) {
      console.log('ChatWS listener error:', e?.message);
    }
  }
}

function parseIncoming(raw) {
  try {
    return JSON.parse(typeof raw === 'string' ? raw : String(raw));
  } catch {
    return null;
  }
}

/**
 * Abre (ou reutiliza) a conexão WebSocket autenticada.
 * Resolve quando o socket estiver OPEN.
 */
export async function connectChatSocket() {
  intentionalClose = false;

  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  if (socket && socket.readyState === WebSocket.CONNECTING) {
    return new Promise((resolve, reject) => {
      openWaiters.push({ resolve, reject });
    });
  }

  const token = await getAccessToken();
  if (!token) {
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`;

  return new Promise((resolve, reject) => {
    openWaiters.push({ resolve, reject });

    try {
      socket = new WebSocket(wsUrl);
    } catch (error) {
      flushOpenWaiters(error);
      return;
    }

    socket.onopen = () => {
      emit('open');
      flushOpenWaiters();
    };

    socket.onmessage = (event) => {
      const payload = parseIncoming(event.data);
      if (!payload) return;
      emit(payload.type || 'message', payload);
    };

    socket.onerror = () => {
      emit('error', { message: 'WebSocket error' });
    };

    socket.onclose = () => {
      emit('close');
      const wasConnecting = openWaiters.length > 0;
      if (wasConnecting) {
        flushOpenWaiters(new Error('WebSocket fechou antes de conectar'));
      }
      socket = null;
      if (!intentionalClose) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          connectChatSocket().catch(() => {});
        }, 2500);
      }
    };
  });
}

export function disconnectChatSocket() {
  intentionalClose = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function subscribeChatSocket(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function send(payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket não conectado');
  }
  socket.send(JSON.stringify(payload));
}

/** Entra na sala e recebe `messages_history`. */
export function joinChatRoom(roomId) {
  send({ type: 'join_room', roomId });
}

export function leaveChatRoom(roomId) {
  send({ type: 'leave_room', roomId });
}

export function sendChatMessage(roomId, content) {
  send({ type: 'send_message', roomId, content });
}

export function requestChatHistory(roomId, limit = 50) {
  send({ type: 'get_history', roomId, limit });
}

export function isChatSocketOpen() {
  return Boolean(socket && socket.readyState === WebSocket.OPEN);
}
