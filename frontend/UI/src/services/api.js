// Minimal API service for frontend to call backend endpoints
// Resolve base URL in browser-safe way. If app provides window.__env.REACT_APP_API_BASE use it.
const BASE = (typeof window !== 'undefined' && window.__env && window.__env.REACT_APP_API_BASE) || 'http://localhost:8000/api';

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

    try {
        const res = await fetch(`${BASE}${path}`, { ...options, headers });

        console.log(`API Response: ${res.status} ${res.statusText}`);

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

            console.error('API Error Response:', errorData);

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
            console.log('API Success Response:', data);
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
