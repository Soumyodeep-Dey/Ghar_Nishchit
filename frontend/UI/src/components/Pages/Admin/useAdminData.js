import { useState, useEffect, useCallback, useRef } from 'react';
import { showErrorToast, showSuccessToast, showConfirmToast } from '../../../utils/toast';
import { ensureValidAccessToken } from '../../../services/authService.js';
import { getApiBase } from '../../../services/apiBase.js';

const EMPTY = {
  success: false,
  users: [], properties: [], contracts: [],
  maintenance: [], payments: [], inquiries: [], supportRequests: [],
  analytics: {
    totalUsers: 0, totalLandlords: 0, totalTenants: 0, totalProperties: 0,
    totalRevenue: 0, pendingPayments: 0, failedPayments: 0,
    occupiedProperties: 0, availableProperties: 0,
    slaBreaches: 0, monthlyGrowth: [],
  },
};

const SECTION_BY_TAB = {
  users: 'users',
  properties: 'properties',
  contracts: 'contracts',
  maintenance: 'maintenance',
  payments: 'payments',
  broadcast: 'inquiries',
  support: 'supportRequests',
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

export function useAdminData(activeTab = 'overview') {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const overviewLoaded = useRef(false);

  const fetchData = useCallback(async ({ refreshOverview = true } = {}) => {
    setLoading(true);
    try {
      const section = SECTION_BY_TAB[activeTab];
      const [overview, sectionData] = await Promise.all([
        refreshOverview || !overviewLoaded.current
          ? adminRequest('/admin/dashboard?section=overview')
          : Promise.resolve(null),
        section ? adminRequest(`/admin/dashboard?section=${section}`) : Promise.resolve(null),
      ]);

      if ((overview && !overview.success) || (sectionData && !sectionData.success)) {
        throw new Error(overview?.message || sectionData?.message || 'Failed to load admin data');
      }

      if (overview) overviewLoaded.current = true;

      setData((current) => ({
        ...current,
        ...(overview || {}),
        ...(sectionData || {}),
        success: true,
      }));
    } catch (e) {
      console.error('[Admin] fetch error:', e);
      showErrorToast(e.message || 'Cannot reach server — check backend is running');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData({ refreshOverview: false }); }, [fetchData]);

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
