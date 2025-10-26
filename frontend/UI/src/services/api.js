// Minimal API service for frontend to call backend endpoints
// Resolve base URL in browser-safe way. If app provides window.__env.REACT_APP_API_BASE use it.
const BASE = (typeof window !== 'undefined' && window.__env && window.__env.REACT_APP_API_BASE) || 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...getAuthHeader()
    };

    console.log(`API Request: ${options.method || 'GET'} ${BASE}${path}`);
    console.log('Headers:', headers);
    if (options.body) console.log('Body:', options.body);

    const res = await fetch(`${BASE}${path}`, { ...options, headers });

    console.log(`API Response: ${res.status} ${res.statusText}`);

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('API Error:', text);
        const err = new Error(res.statusText || 'Request failed');
        err.status = res.status;
        err.body = text;
        throw err;
    }
    // No content
    if (res.status === 204) return null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return res.text();
}

const api = {
    // Properties
    getProperties: () => request('/properties', { method: 'GET' }),
    getPropertyById: (id) => request(`/properties/${id}`, { method: 'GET' }),
    createProperty: (data) => request('/properties', { method: 'POST', body: JSON.stringify(data) }),
    updateProperty: (id, data) => request(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProperty: (id) => request(`/properties/${id}`, { method: 'DELETE' }),
    getPropertiesByUser: (userId) => request(`/properties/user/${userId}`, { method: 'GET' }),

    // Auth/profile
    getProfile: () => request('/auth/profile', { method: 'GET' }),
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

    // Tenants (for landlords)
    getMyTenants: () => request('/tenants', { method: 'GET' }),
    getTenantById: (tenantId) => request(`/tenants/${tenantId}`, { method: 'GET' }),
    getTenantStats: () => request('/tenants/stats', { method: 'GET' }),
};

export default api;
