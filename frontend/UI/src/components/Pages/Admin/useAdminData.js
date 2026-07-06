import { useState, useEffect, useCallback } from 'react';
import { showErrorToast, showSuccessToast, showConfirmToast } from '../../../utils/toast';
import { ensureValidAccessToken } from '../../../services/authService.js';

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

async function adminRequest(path, options = {}) {
  const token = await ensureValidAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${getApiBase()}${path}`, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const err = new Error(body?.message || body?.error || res.statusText || 'Request failed');
    err.status = res.status;
    throw err;
  }

  return body;
}

export function useAdminData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const EMPTY = {
    success: false,
    users: [], properties: [], contracts: [],
    maintenance: [], payments: [], inquiries: [], supportRequests: [],
    analytics: {
      totalUsers: 0, totalLandlords: 0, totalTenants: 0,
      totalRevenue: 0, pendingPayments: 0, failedPayments: 0,
      occupiedProperties: 0, availableProperties: 0,
      slaBreaches: 0, slaBreachList: [], monthlyGrowth: [],
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const result = await adminRequest('/admin/dashboard');
      if (result.success) setData(result);
      else {
        showErrorToast(result.message || 'Failed to load admin data');
        setData(EMPTY);
      }
    } catch (e) {
      console.error('[Admin] fetch error:', e);
      showErrorToast(e.message || 'Cannot reach server — check backend is running');
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteUser = (id) => {
    showConfirmToast('Delete this user permanently?', async () => {
      try {
        const result = await adminRequest(`/admin/user/${id}`, { method: 'DELETE' });
        if (result.success) { showSuccessToast('User deleted'); await fetchData(); }
        else showErrorToast(result.message || 'Deletion failed');
      } catch (e) { console.error(e); showErrorToast(e.message || 'Network error'); }
    });
  };

  const updateUserStatus = async (id, status) => {
    try {
      const result = await adminRequest(`/admin/user-status/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (result.success) { showSuccessToast(`User ${status}`); await fetchData(); }
      else showErrorToast(result.message || 'Update failed');
    } catch (e) { console.error(e); showErrorToast(e.message || 'Network error'); }
  };

  const deleteProperty = (id) => {
    showConfirmToast('Delete this property?', async () => {
      try {
        const result = await adminRequest(`/admin/property/${id}`, { method: 'DELETE' });
        if (result.success) { showSuccessToast('Property deleted'); await fetchData(); }
        else showErrorToast(result.message || 'Deletion failed');
      } catch (e) { console.error(e); showErrorToast(e.message || 'Network error'); }
    });
  };

  const updateProperty = async (id, updates) => {
    try {
      const result = await adminRequest(`/admin/property-status/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (result.success) { showSuccessToast('Property updated'); await fetchData(); }
      else showErrorToast(result.message || 'Update failed');
    } catch (e) { console.error(e); showErrorToast(e.message || 'Network error'); }
  };

  const deleteContract = (id) => {
    showConfirmToast('Delete this contract?', async () => {
      try {
        const result = await adminRequest(`/admin/contract/${id}`, { method: 'DELETE' });
        if (result.success) { showSuccessToast('Contract deleted'); await fetchData(); }
        else showErrorToast(result.message || 'Deletion failed');
      } catch (e) { console.error(e); showErrorToast(e.message || 'Network error'); }
    });
  };

  const updateMaintenanceStatus = async (id, status) => {
    try {
      const result = await adminRequest(`/admin/maintenance-status/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      if (result.success) { showSuccessToast('Maintenance updated'); await fetchData(); }
      else showErrorToast(result.message || 'Update failed');
    } catch (e) { console.error(e); showErrorToast(e.message || 'Network error'); }
  };

  const broadcast = async (title, message, targetRole) => {
    const result = await adminRequest('/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message, targetRole })
    });
    showSuccessToast(`Sent to ${result.sent} users`);
  };

  const updateSupportStatus = async (id, status) => {
    try {
      const result = await adminRequest(`/admin/support-status/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (result.success) { showSuccessToast('Support request updated'); await fetchData(); }
      else showErrorToast(result.message || 'Update failed');
    } catch (e) { console.error(e); showErrorToast(e.message || 'Network error'); }
  };

  const replyToSupport = async (id, content) => {
    try {
      const result = await adminRequest(`/admin/support/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      if (result.success) { showSuccessToast('Reply sent'); await fetchData(); }
      else showErrorToast(result.message || 'Reply failed');
    } catch (e) { console.error(e); showErrorToast(e.message || 'Network error'); }
  };

  return {
    data, loading, fetchData,
    deleteUser, updateUserStatus,
    deleteProperty, updateProperty,
    deleteContract,
    updateMaintenanceStatus,
    broadcast,
    updateSupportStatus,
    replyToSupport,
  };
}
