import { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, ChevronDown } from 'lucide-react';

const PRIORITY_COLORS = { High: 'text-red-600 bg-red-50', Medium: 'text-amber-600 bg-amber-50', Low: 'text-green-600 bg-green-50' };
const STATUS_COLORS = { Pending: 'bg-amber-100 text-amber-700', 'In Progress': 'bg-blue-100 text-blue-700', Completed: 'bg-green-100 text-green-700', Cancelled: 'bg-gray-100 text-gray-500', 'On Hold': 'bg-purple-100 text-purple-700' };

export default function AdminMaintenance({ maintenance = [], analytics, actions }) {
  const [filter, setFilter] = useState('all');

  const SLA_DAYS = 7;
  const now = Date.now();

  const filtered = maintenance.filter(m => {
    if (filter === 'sla') return ['Pending', 'In Progress'].includes(m.status) && (now - new Date(m.createdAt)) > SLA_DAYS * 86400000;
    if (filter === 'emergency') return m.isEmergency || m.isUrgent;
    if (filter === 'pending') return m.status === 'Pending';
    return true;
  });

  const slaCount = maintenance.filter(m => ['Pending', 'In Progress'].includes(m.status) && (now - new Date(m.createdAt)) > SLA_DAYS * 86400000).length;

  const daysSince = (d) => Math.floor((now - new Date(d)) / 86400000);

  return (
    <div className="space-y-4">
      {/* SLA Alert Banner */}
      {slaCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertTriangle size={20} className="text-red-600 shrink-0" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400">{slaCount} SLA Breach{slaCount > 1 ? 'es' : ''} Detected</p>
            <p className="text-xs text-red-600 dark:text-red-300">Requests open for more than {SLA_DAYS} days without resolution.</p>
          </div>
          <button onClick={() => setFilter('sla')} className="ml-auto text-xs font-semibold text-red-600 hover:underline">View All</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['all', 'All'], ['sla', `SLA Breaches (${slaCount})`], ['emergency', 'Emergency'], ['pending', 'Pending']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === val ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-indigo-400'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Title', 'Tenant', 'Priority', 'Category', 'Status', 'Age', 'Action'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(m => {
                const age = daysSince(m.createdAt);
                const isBreach = age > SLA_DAYS && ['Pending', 'In Progress'].includes(m.status);
                return (
                  <tr key={m._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition ${isBreach ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                    <td className="py-3 px-4 max-w-[150px]">
                      <div className="flex items-center gap-2">
                        {(m.isEmergency || m.isUrgent) && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                        <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{m.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{m.tenantName || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[m.priority] || ''}`}>{m.priority}</span>
                    </td>
                    <td className="py-3 px-4 capitalize text-gray-500 dark:text-gray-400">{m.category}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[m.status] || ''}`}>{m.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`flex items-center gap-1 ${isBreach ? 'text-red-600 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                        <Clock size={13} />{age}d
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={m.status}
                        onChange={e => actions.updateMaintenanceStatus(m._id, e.target.value)}
                        className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 focus:outline-none"
                      >
                        {['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">No records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
