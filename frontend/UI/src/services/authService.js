const ACCESS_KEY = 'token';
const REFRESH_KEY = 'refreshToken';
const USER_KEY = 'user';
const ADMIN_BYPASS_TOKEN = 'admin-token-bypass';

const isViteDev =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.DEV === true;

const getApiBase = () => {
  const raw =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) ||
    (isViteDev ? '' : 'http://localhost:5000');
  const trimmed = (raw || '').replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const decodeJwtPayload = (token) => {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export const getAccessToken = () =>
  localStorage.getItem(ACCESS_KEY) || localStorage.getItem('authToken');

export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const setAuthSession = ({ accessToken, refreshToken, token, user }) => {
  const access = accessToken || token;
  if (access) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.removeItem('authToken');
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem('authToken');
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAdminSession = () => getAccessToken() === ADMIN_BYPASS_TOKEN;

export const isTokenExpired = (token) => {
  if (!token || token === ADMIN_BYPASS_TOKEN) return false;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
};

export const hasValidRefreshToken = () => {
  const refreshToken = getRefreshToken();
  return refreshToken ? !isTokenExpired(refreshToken) : false;
};

export const getRoleDashboardPath = (user) => {
  const role = (user?.role || (Array.isArray(user?.roles) && user.roles[0]) || '').toLowerCase();
  if (role === 'tenant') return '/tenant';
  if (role === 'landlord') return '/landlord';
  if (role === 'admin') return '/admin';
  return '/';
};

let refreshPromise = null;

export const refreshSession = async () => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  refreshPromise = (async () => {
    const res = await fetch(`${getApiBase()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearAuthSession();
      throw new Error('Session expired');
    }

    const data = await res.json();
    setAuthSession(data);
    return data;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const restoreSession = async () => {
  if (isAdminSession()) {
    return getStoredUser();
  }

  const accessToken = getAccessToken();
  if (accessToken && !isTokenExpired(accessToken)) {
    return getStoredUser();
  }

  if (hasValidRefreshToken()) {
    const data = await refreshSession();
    return data.user;
  }

  clearAuthSession();
  return null;
};

export const ensureValidAccessToken = async () => {
  if (isAdminSession()) return getAccessToken();

  const accessToken = getAccessToken();
  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }

  if (hasValidRefreshToken()) {
    const data = await refreshSession();
    return data.accessToken || data.token;
  }

  clearAuthSession();
  return null;
};
