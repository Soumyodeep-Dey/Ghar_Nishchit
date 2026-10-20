const isViteDev =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.DEV === true;

export const getApiBase = () => {
  const raw =
    (typeof window !== 'undefined' && window.__env?.REACT_APP_API_BASE) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
    (isViteDev ? '' : 'http://localhost:5000');

  const trimmed = (raw || '').replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};
