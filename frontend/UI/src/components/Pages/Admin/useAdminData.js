import { useState, useEffect, useCallback } from 'react';
import { showErrorToast, showSuccessToast, showConfirmToast } from '../../../utils/toast';

const API = import.meta.env.VITE_BACKEND_URL;

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
      const res = await fetch(`${API}/api/admin/dashboard`);
      if (!res.ok) {
        console.error('[Admin] API error:', res.status, await res.text());
        showErrorToast(`API error: ${res.status}`);
        setData(EMPTY);
        return;
      }
      const result = await res.json();
      console.log('[Admin] dashboard result:', result);
      if (result.success) setData(result);
      else { showErrorToast(result.message || 'Failed to load admin data'); setData(EMPTY); }
    } catch (e) {
      console.error('[Admin] fetch error:', e);
      showErrorToast('Cannot reach server — check backend is running');
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteUser = (id) => {
    showConfirmToast('Delete this user permanently?', async () => {
      try {
        const res = await fetch(`${API}/api/admin/user/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) { showSuccessToast('User deleted'); await fetchData(); }
        else showErrorToast(result.message || 'Deletion failed');
      } catch (e) { console.error(e); showErrorToast('Network error'); }
    });
  };

  const updateUserStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/admin/user-status/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await res.json();
      if (result.success) { showSuccessToast(`User ${status}`); await fetchData(); }
      else showErrorToast(result.message || 'Update failed');
    } catch (e) { console.error(e); showErrorToast('Network error'); }
  };

  const deleteProperty = (id) => {
    showConfirmToast('Delete this property?', async () => {
      try {
        const res = await fetch(`${API}/api/admin/property/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) { showSuccessToast('Property deleted'); await fetchData(); }
        else showErrorToast(result.message || 'Deletion failed');
      } catch (e) { console.error(e); showErrorToast('Network error'); }
    });
  };

  const updateProperty = async (id, updates) => {
    try {
      const res = await fetch(`${API}/api/admin/property-status/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await res.json();
      if (result.success) { showSuccessToast('Property updated'); await fetchData(); }
      else showErrorToast(result.message || 'Update failed');
    } catch (e) { console.error(e); showErrorToast('Network error'); }
  };

  const deleteContract = (id) => {
    showConfirmToast('Delete this contract?', async () => {
      try {
        const res = await fetch(`${API}/api/admin/contract/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) { showSuccessToast('Contract deleted'); await fetchData(); }
        else showErrorToast(result.message || 'Deletion failed');
      } catch (e) { console.error(e); showErrorToast('Network error'); }
    });
  };

  const updateMaintenanceStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/admin/maintenance-status/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const result = await res.json();
      if (result.success) { showSuccessToast('Maintenance updated'); await fetchData(); }
      else showErrorToast(result.message || 'Update failed');
    } catch (e) { console.error(e); showErrorToast('Network error'); }
  };

  const broadcast = async (title, message, targetRole) => {
    const res = await fetch(`${API}/api/admin/broadcast`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, targetRole })
    });
    const result = await res.json();
    showSuccessToast(`Sent to ${result.sent} users`);
  };

  const updateSupportStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/admin/support-status/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (result.success) { showSuccessToast('Support request updated'); await fetchData(); }
      else showErrorToast(result.message || 'Update failed');
    } catch (e) { console.error(e); showErrorToast('Network error'); }
  };

  const replyToSupport = async (id, content) => {
    try {
      const res = await fetch(`${API}/api/admin/support/${id}/reply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const result = await res.json();
      if (result.success) { showSuccessToast('Reply sent'); await fetchData(); }
      else showErrorToast(result.message || 'Reply failed');
    } catch (e) { console.error(e); showErrorToast('Network error'); }
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
