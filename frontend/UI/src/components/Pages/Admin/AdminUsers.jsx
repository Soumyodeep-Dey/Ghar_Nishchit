import { useState } from 'react';
import { Trash2, ShieldOff, ShieldCheck, Ban, Search, UserCheck, Eye } from 'lucide-react';

const STATUS_COLORS = { active: 'bg-green-100 text-green-700', suspended: 'bg-amber-100 text-amber-700', banned: 'bg-red-100 text-red-700' };
const ROLE_COLORS = { landlord: 'text-indigo-600 font-semibold', tenant: 'text-teal-600 font-semibold' };

export default function AdminUsers({ users = [], actions }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewUser, setViewUser] = useState(null);

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none">
          <option value="all">All Roles</option>
          <option value="landlord">Landlords</option>
          <option value="tenant">Tenants</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="font-semibold text-sm text-gray-600 dark:text-gray-300">{filtered.length} users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(u => (
                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">{u.name}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="py-3 px-4"><span className={ROLE_COLORS[u.role] || ''}>{u.role}</span></td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[u.status || 'active']}`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button title="View Profile" onClick={() => setViewUser(u)} className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50"><Eye size={16} /></button>
                      {u.status !== 'active' && (
                        <button title="Activate" onClick={() => actions.updateUserStatus(u._id, 'active')} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"><UserCheck size={16} /></button>
                      )}
                      {u.status !== 'suspended' && (
                        <button title="Suspend" onClick={() => actions.updateUserStatus(u._id, 'suspended')} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"><ShieldOff size={16} /></button>
                      )}
                      {u.status !== 'banned' && (
                        <button title="Ban" onClick={() => actions.updateUserStatus(u._id, 'banned')} className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-50"><Ban size={16} /></button>
                      )}
                      <button title="Delete" onClick={() => actions.deleteUser(u._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Profile Modal Placeholder */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">User Verification</h3>
              <button onClick={() => setViewUser(null)} className="text-gray-400 hover:text-gray-600"><Ban size={20} className="rotate-45" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold text-2xl">
                  {viewUser.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white text-xl">{viewUser.name}</h4>
                  <p className="text-gray-500 dark:text-gray-400">{viewUser.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[viewUser.role] || ''} bg-gray-100 dark:bg-gray-700`}>{viewUser.role}</span>
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/30">
                <h5 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">KYC & Documents</h5>
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
