import { useState, useEffect } from 'react';
import { useDarkMode } from '../../useDarkMode';
import { Users, Home, FileText, Trash2, Shield, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export default function AdminDashboard() {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const [data, setData] = useState({ users: [], properties: [], contracts: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/dashboard`);
      const result = await response.json();
      if (result.success) {
        setData({
          users: result.users,
          properties: result.properties,
          contracts: result.contracts
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showErrorToast('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if the user is the admin
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin' || user.email !== 'ritam@gmail.com') {
      navigate('/');
    } else {
      fetchDashboardData();
    }
  }, [navigate]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/user/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccessToast('User deleted');
        fetchDashboardData();
      }
    } catch (e) {
      showErrorToast('Error deleting user');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/property/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccessToast('Property deleted');
        fetchDashboardData();
      }
    } catch (e) {
      showErrorToast('Error deleting property');
    }
  };

  const handleDeleteContract = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/contract/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccessToast('Contract deleted');
        fetchDashboardData();
      }
    } catch (e) {
      showErrorToast('Error deleting contract');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Loading Admin Panel...</div>;
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Shield size={32} className="text-indigo-600" />
            <h1 className="text-3xl font-bold">Master Admin Controller</h1>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            <LogOut size={20} /> Logout
          </button>
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl shadow-lg bg-indigo-600 text-white cursor-pointer hover:scale-105 transition" onClick={() => setActiveTab('users')}>
            <div className="flex items-center gap-4">
              <Users size={40} />
              <div>
                <p className="text-sm opacity-80">Total Users</p>
                <h2 className="text-3xl font-bold">{data.users.length}</h2>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl shadow-lg bg-teal-600 text-white cursor-pointer hover:scale-105 transition" onClick={() => setActiveTab('properties')}>
            <div className="flex items-center gap-4">
              <Home size={40} />
              <div>
                <p className="text-sm opacity-80">Total Properties</p>
                <h2 className="text-3xl font-bold">{data.properties.length}</h2>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl shadow-lg bg-rose-600 text-white cursor-pointer hover:scale-105 transition" onClick={() => setActiveTab('contracts')}>
            <div className="flex items-center gap-4">
              <FileText size={40} />
              <div>
                <p className="text-sm opacity-80">Total Contracts</p>
                <h2 className="text-3xl font-bold">{data.contracts.length}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Table */}
        <div className={`p-6 rounded-2xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-bold mb-4 capitalize">{activeTab} Management</h2>
          <div className="overflow-x-auto">
            {activeTab === 'users' && (
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map(u => (
                    <tr key={u._id} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className="py-3 px-4">{u.name}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4 font-semibold capitalize text-indigo-500">{u.role}</td>
                      <td className="py-3 px-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'properties' && (
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Rent</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.properties.map(p => (
                    <tr key={p._id} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className="py-3 px-4 font-medium">{p.title}</td>
                      <td className="py-3 px-4">{p.location?.address}</td>
                      <td className="py-3 px-4">₹{p.price}</td>
                      <td className="py-3 px-4 capitalize">{p.status}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDeleteProperty(p._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'contracts' && (
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="py-3 px-4">Tenant</th>
                    <th className="py-3 px-4">Landlord</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.contracts.map(c => (
                    <tr key={c._id} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'}`}>
                      <td className="py-3 px-4">{c.tenant?.name || 'Unknown'}</td>
                      <td className="py-3 px-4">{c.landlord?.name || 'Unknown'}</td>
                      <td className="py-3 px-4">₹{c.rentAmount}</td>
                      <td className="py-3 px-4 capitalize">{c.status}</td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => handleDeleteContract(c._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
