/**
 * Cliente HTTP central — envelope `{ message, statusCode, data, errors }`.
 */
const DEFAULT_TIMEOUT_MS = 20_000;

function getBaseUrl() {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_API_URL não configurada. Copie .env.example para .env e ajuste a URL da API.',
    );
  }
  return url.replace(/\/+$/, '');
}

export class ApiError extends Error {
  constructor({ message, statusCode, errors, body, code }) {
    super(message || 'Request failed');
    this.name = 'ApiError';
    this.statusCode = statusCode || 500;
    this.errors = errors || [];
    this.body = body;
    this.code = code || body?.code;
  }
}

/**
 * @param {string} path - ex. `/api/v1/auth/login`
 * @param {{ method?: string, body?: object, token?: string|null, timeoutMs?: number }} options
 */
export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token = null, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    let payload = null;
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { message: text, statusCode: response.status };
      }
    }

    if (!response.ok) {
      throw new ApiError({
        message: payload?.description || payload?.message || `HTTP ${response.status}`,
        statusCode: payload?.statusCode || response.status,
        errors: payload?.errors || [],
        body: payload,
        code: payload?.code,
      });
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error?.name === 'AbortError') {
      throw new ApiError({ message: 'Request timeout', statusCode: 408 });
    }
    throw new ApiError({
      message: error?.message || 'Network request failed',
      statusCode: 0,
    });
  } finally {
    clearTimeout(timer);
  }
}
