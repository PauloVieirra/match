/**
 * Cliente WebSocket do chat.
 * Preferência: EXPO_PUBLIC_WS_URL (wss://host/ws).
 * Fallback: deriva de EXPO_PUBLIC_API_URL (https→wss, http→ws) + /ws.
 *
 * Reconecta com backoff, reentra nas salas ativas e reenvia mensagens
 * que ficaram na fila (queda de rede / app em background).
 */
import { AppState } from 'react-native';
import { getAccessToken } from '../session';
import { ensureFreshSession } from './client';

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;

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
let reconnectAttempt = 0;
let appStateBound = false;
const joinedRooms = new Set();
const pendingMessages = [];

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

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (intentionalClose || reconnectTimer) return;
  const delay = Math.min(
    RECONNECT_MAX_MS,
    RECONNECT_BASE_MS * 2 ** reconnectAttempt,
  );
  reconnectAttempt += 1;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectChatSocket().catch(() => {});
  }, delay);
}

function rejoinActiveRooms() {
  if (!isChatSocketOpen()) return;
  for (const roomId of joinedRooms) {
    socket.send(JSON.stringify({ type: 'join_room', roomId }));
  }
}

function flushPendingMessages() {
  if (!isChatSocketOpen() || pendingMessages.length === 0) return;
  const queued = pendingMessages.splice(0, pendingMessages.length);
  for (const item of queued) {
    socket.send(
      JSON.stringify({
        type: 'send_message',
        roomId: item.roomId,
        content: item.content,
      }),
    );
  }
}

function bindAppState() {
  if (appStateBound) return;
  appStateBound = true;
  AppState.addEventListener('change', (state) => {
    if (state !== 'active' || intentionalClose) return;
    reconnectAttempt = 0;
    connectChatSocket().catch(() => {});
  });
}

/**
 * Abre (ou reutiliza) a conexão WebSocket autenticada.
 * Resolve quando o socket estiver OPEN.
 */
export async function connectChatSocket() {
  bindAppState();
  intentionalClose = false;

  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  if (socket && socket.readyState === WebSocket.CONNECTING) {
    return new Promise((resolve, reject) => {
      openWaiters.push({ resolve, reject });
    });
  }

  const token = (await ensureFreshSession()) || (await getAccessToken());
  if (!token) {
    scheduleReconnect();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`;

  return new Promise((resolve, reject) => {
    openWaiters.push({ resolve, reject });

    try {
      socket = new WebSocket(wsUrl);
    } catch (error) {
      flushOpenWaiters(error);
      scheduleReconnect();
      return;
    }

    socket.onopen = () => {
      reconnectAttempt = 0;
      clearReconnectTimer();
      rejoinActiveRooms();
      flushPendingMessages();
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
        scheduleReconnect();
      }
    };
  });
}

export function disconnectChatSocket() {
  intentionalClose = true;
  clearReconnectTimer();
  joinedRooms.clear();
  pendingMessages.length = 0;
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

/** Entra na sala e recebe `messages_history`. Lembra a sala para rejoin. */
export function joinChatRoom(roomId) {
  if (!roomId) return;
  joinedRooms.add(roomId);
  if (!isChatSocketOpen()) {
    connectChatSocket().catch(() => {});
    return;
  }
  send({ type: 'join_room', roomId });
}

export function leaveChatRoom(roomId) {
  if (!roomId) return;
  joinedRooms.delete(roomId);
  if (!isChatSocketOpen()) return;
  try {
    send({ type: 'leave_room', roomId });
  } catch {
    // ignore
  }
}

export function sendChatMessage(roomId, content) {
  if (!roomId || !content) return 'ignored';
  if (isChatSocketOpen()) {
    send({ type: 'send_message', roomId, content });
    return 'sent';
  }
  pendingMessages.push({ roomId, content });
  connectChatSocket().catch(() => {});
  return 'queued';
}

export function requestChatHistory(roomId, limit = 50) {
  if (!isChatSocketOpen()) return;
  send({ type: 'get_history', roomId, limit });
}

export function isChatSocketOpen() {
  return Boolean(socket && socket.readyState === WebSocket.OPEN);
}
