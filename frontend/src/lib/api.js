export const API = import.meta.env.VITE_API_URL || '/api';
export const API_BASE = API.replace(/\/api\/?$/, '');

const REFRESH_TOKEN_KEY = 'refreshToken';
const REQUEST_TIMEOUT = 45000;
const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const refreshSession = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok || !data.data?.token) {
      throw new Error(data.message || 'Refresh failed');
    }
    localStorage.setItem('token', data.data.token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refreshToken);
    return true;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return false;
  }
};

const request = async (path, options = {}, allowRefresh = true) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) headers['X-Session-Id'] = sessionId;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let res;
  try {
    res = await fetch(`${API}${path}`, { ...options, headers, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('The server is taking too long to respond. If it is sleeping, please wait a moment and try again.');
    }
    throw new Error('Could not reach the server. Please check your connection and try again.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (
    res.status === 401
    && allowRefresh
    && !NO_REFRESH_PATHS.some((p) => path.startsWith(p))
    && localStorage.getItem(REFRESH_TOKEN_KEY)
  ) {
    const refreshed = await refreshSession();
    if (refreshed) return request(path, options, false);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export const formatPrice = (price) => `KSh ${Number(price).toLocaleString()}`;

export const generateSessionId = () => {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = 'sp_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('sessionId', id);
  }
  return id;
};