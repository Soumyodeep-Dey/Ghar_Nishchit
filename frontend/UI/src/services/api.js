// Minimal API service for frontend to call backend endpoints
// Resolve base URL in browser-safe way. Priority: window.__env.REACT_APP_API_BASE -> VITE_API_BASE -> localhost:3000/api
const RAW_BASE = (typeof window !== 'undefined' && window.__env && window.__env.REACT_APP_API_BASE)
    || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
    || 'http://localhost:3000/api';

// Normalize base to always include /api at the end, and no trailing slash
const BASE = (() => {
    const trimmed = (RAW_BASE || '').replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
})();

const getAuthHeader = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...getAuthHeader()
    };

    try {
        const res = await fetch(`${BASE}${path}`, { ...options, headers });

        if (!res.ok) {
            let errorData = null;
            const contentType = res.headers.get('content-type') || '';
            try {
                if (contentType.includes('application/json')) {
                    errorData = await res.json();
                } else {
                    errorData = await res.text();
                }
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
            }
            console.error('API error', res.status, errorData);
            const err = new Error(
                errorData?.message ||
                errorData?.error ||
                (typeof errorData === 'string' ? errorData : res.statusText) ||
                'Request failed'
            );
            err.status = res.status;
            err.body = errorData;
            throw err;
        }

        if (res.status === 204) return null;

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await res.json();
            return data;
        }
        return res.text();
    } catch (error) {
        if (!error.status) {
            console.error('Network error:', error);
            error.message = 'Network error: Unable to connect to server';
        }
        throw error;
    }
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
    changePassword: ({ email, oldPassword, newPassword }) =>
        request('/auth/change-password', { method: 'POST', body: JSON.stringify({ email, oldPassword, newPassword }) }),

    // Tenants (for landlords)
    getMyTenants: () => request('/tenants', { method: 'GET' }),
    getTenantById: (tenantId) => request(`/tenants/${tenantId}`, { method: 'GET' }),
    getTenantStats: () => request('/tenants/stats', { method: 'GET' }),

    // Maintenance Management
    createMaintenanceRequest: (data) => request('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
    getLandlordMaintenanceRequests: (landlordId, filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return request(`/maintenance/landlord/${landlordId}${params ? '?' + params : ''}`, { method: 'GET' });
    },
    getTenantMaintenanceRequests: (tenantId, filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return request(`/maintenance/tenant/${tenantId}${params ? '?' + params : ''}`, { method: 'GET' });
    },
    getMaintenanceRequestById: (id) => request(`/maintenance/${id}`, { method: 'GET' }),
    getMaintenanceByProperty: (propertyId) => request(`/maintenance/property/${propertyId}`, { method: 'GET' }),
    updateMaintenanceRequest: (id, data) => request(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateMaintenanceStatus: (id, status) => request(`/maintenance/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    addMaintenanceComment: (id, comment) => request(`/maintenance/${id}/comment`, { method: 'POST', body: JSON.stringify(comment) }),
    assignTechnician: (id, assignmentData) => request(`/maintenance/${id}/assign`, { method: 'PATCH', body: JSON.stringify(assignmentData) }),
    deleteMaintenanceRequest: (id) => request(`/maintenance/${id}`, { method: 'DELETE' }),
    getMaintenanceStats: (landlordId) => request(`/maintenance/stats/${landlordId}`, { method: 'GET' }),

    // ── Visit Scheduling ────────────────────────────────────────────────────
    scheduleVisit: (data) =>
        request('/visits', { method: 'POST', body: JSON.stringify(data) }),
    getMyVisits: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return request(`/visits/my${params ? '?' + params : ''}`, { method: 'GET' });
    },
    getLandlordVisits: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return request(`/visits/landlord${params ? '?' + params : ''}`, { method: 'GET' });
    },
    getVisitById: (id) => request(`/visits/${id}`, { method: 'GET' }),
    updateVisitStatus: (id, status, reason) =>
        request(`/visits/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
        }),
    cancelVisit: (id) => request(`/visits/${id}`, { method: 'DELETE' }),
    // ────────────────────────────────────────────────────────────────────────

    // ── Favorites ────────────────────────────────────────────────────────────
    // Returns array of saved property IDs (or objects) for the logged-in tenant
    getFavorites: () => request('/favorites', { method: 'GET' }),

    // Toggle a property favourite on/off.
    // POST /favorites/:propertyId  → adds if not present, removes if already saved
    // Backend should return { favorited: true|false }
    toggleFavorite: (propertyId) =>
        request(`/favorites/${propertyId}`, { method: 'POST' }),
    // ────────────────────────────────────────────────────────────────────────
};

export default api;
