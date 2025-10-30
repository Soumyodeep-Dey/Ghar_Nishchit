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
    // Prefer 'token' (set by Login.jsx), fall back to 'authToken' if present
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...getAuthHeader()
    };

    // Quiet logs in production; remove verbose request logging

    try {
        const res = await fetch(`${BASE}${path}`, { ...options, headers });

        // Quiet logs in production; avoid noisy response logging

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

            // Keep a concise error log for debugging
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

        // No content
        if (res.status === 204) return null;

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const data = await res.json();
            return data;
        }
        return res.text();
    } catch (error) {
        // Network error or fetch failed
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
    // Create new maintenance request
    createMaintenanceRequest: (data) => request('/maintenance', { method: 'POST', body: JSON.stringify(data) }),

    // Get maintenance requests
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

    // Update maintenance requests
    updateMaintenanceRequest: (id, data) => request(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateMaintenanceStatus: (id, status) => request(`/maintenance/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

    // Comments and assignments
    addMaintenanceComment: (id, comment) => request(`/maintenance/${id}/comment`, { method: 'POST', body: JSON.stringify(comment) }),
    assignTechnician: (id, assignmentData) => request(`/maintenance/${id}/assign`, { method: 'PATCH', body: JSON.stringify(assignmentData) }),

    // Delete maintenance request
    deleteMaintenanceRequest: (id) => request(`/maintenance/${id}`, { method: 'DELETE' }),

    // Statistics
    getMaintenanceStats: (landlordId) => request(`/maintenance/stats/${landlordId}`, { method: 'GET' }),
};

export default api;
