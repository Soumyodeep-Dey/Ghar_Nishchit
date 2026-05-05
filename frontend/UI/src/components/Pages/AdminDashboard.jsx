import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../useDarkMode';
import {
  LayoutDashboard, Users, Home, FileText, Wrench,
  IndianRupee, Megaphone, Shield, LogOut, Menu, X, AlertTriangle
} from 'lucide-react';

import { useAdminData } from './Admin/useAdminData';
import AdminOverview    from './Admin/AdminOverview';
import AdminUsers       from './Admin/AdminUsers';
import AdminProperties  from './Admin/AdminProperties';
import AdminMaintenance from './Admin/AdminMaintenance';
import AdminPayments    from './Admin/AdminPayments';
import AdminContracts   from './Admin/AdminContracts';
import AdminBroadcast   from './Admin/AdminBroadcast';

const NAV = [
  { id: 'overview',     label: 'Overview',     icon: LayoutDashboard },
  { id: 'users',        label: 'Users',         icon: Users },
  { id: 'properties',   label: 'Properties',    icon: Home },
  { id: 'contracts',    label: 'Contracts',     icon: FileText },
  { id: 'maintenance',  label: 'Maintenance',   icon: Wrench },
  { id: 'payments',     label: 'Payments',      icon: IndianRupee },
  { id: 'broadcast',    label: 'Broadcast',     icon: Megaphone },
];

export default function AdminDashboard() {
  const { darkMode } = useDarkMode();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    data, loading,
    deleteUser, updateUserStatus,
    deleteProperty, updateProperty,
    deleteContract,
    updateMaintenanceStatus,
    broadcast,
  } = useAdminData();

  // Guard — only admin can view
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role !== 'admin' || user.email !== 'ritam@gmail.com') {
    navigate('/'); return null;
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const actions = { deleteUser, updateUserStatus, deleteProperty, updateProperty, deleteContract, updateMaintenanceStatus, broadcast };

  const slaBreaches = data?.analytics?.slaBreaches || 0;

  const Sidebar = ({ mobile }) => (
    <aside className={`${mobile ? 'w-full' : 'w-60 hidden lg:flex'} flex-col bg-[#1e1b4b] text-white h-full`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="p-2 bg-indigo-500 rounded-xl"><Shield size={20} /></div>
        <div>
          <p className="font-bold text-sm leading-none">GharNishchit</p>
          <p className="text-xs text-indigo-300 mt-0.5">Master Control</p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1 hover:bg-white/10 rounded-lg"><X size={18} /></button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => {
          const badge = id === 'maintenance' && slaBreaches > 0 ? slaBreaches : null;
          return (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${activeTab === id ? 'bg-indigo-500 text-white shadow-lg' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">R</div>
          <div>
            <p className="text-xs font-semibold">Ritam</p>
            <p className="text-xs text-indigo-400">Super Admin</p>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 bg-red-600/80 hover:bg-red-600 rounded-xl text-sm font-medium transition">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );

  const tabTitle = NAV.find(n => n.id === activeTab)?.label || '';

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="w-72 flex flex-col h-full"><Sidebar mobile /></div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className={`flex items-center gap-4 px-5 py-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><Menu size={20} /></button>
          <div className="flex-1">
            <h1 className="font-bold text-lg">{tabTitle}</h1>
            {data && <p className="text-xs text-gray-500 dark:text-gray-400">{data.analytics?.totalUsers} users · {data.properties?.length} properties</p>}
          </div>
          {slaBreaches > 0 && (
            <button onClick={() => setActiveTab('maintenance')} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-800 hover:bg-red-100 transition">
              <AlertTriangle size={14} />{slaBreaches} SLA Alert{slaBreaches > 1 ? 's' : ''}
            </button>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading Master Control Panel...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview'    && <AdminOverview   analytics={data?.analytics}   setActiveTab={setActiveTab} />}
              {activeTab === 'users'       && <AdminUsers      users={data?.users}            actions={actions} />}
              {activeTab === 'properties'  && <AdminProperties properties={data?.properties}  actions={actions} />}
              {activeTab === 'contracts'   && <AdminContracts  contracts={data?.contracts}    actions={actions} />}
              {activeTab === 'maintenance' && <AdminMaintenance maintenance={data?.maintenance} analytics={data?.analytics} actions={actions} />}
              {activeTab === 'payments'    && <AdminPayments   payments={data?.payments}      analytics={data?.analytics} />}
              {activeTab === 'broadcast'   && <AdminBroadcast  inquiries={data?.inquiries}    broadcast={broadcast} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
