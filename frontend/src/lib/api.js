export const API = import.meta.env.VITE_API_URL || '/api';
export const API_BASE = API.replace(/\/api\/?$/, '');

const request = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) headers['X-Session-Id'] = sessionId;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
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
