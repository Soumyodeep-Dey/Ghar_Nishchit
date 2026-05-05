import { useState } from 'react';
import { Trash2, Star, Search, CheckCircle } from 'lucide-react';

const STATUS_COLORS = { Available: 'bg-green-100 text-green-700', Occupied: 'bg-blue-100 text-blue-700', Maintenance: 'bg-amber-100 text-amber-700', Pending: 'bg-purple-100 text-purple-700' };

export default function AdminProperties({ properties = [], actions }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = properties.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.address?.city?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const occupied = properties.filter(p => p.status === 'Occupied').length;
  const available = properties.filter(p => p.status === 'Available').length;
  const pending = properties.filter(p => p.status === 'Pending').length;

  return (
    <div className="space-y-4">
      {/* Occupancy summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Total', val: properties.length, cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
          { label: 'Occupied', val: occupied, cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
          { label: 'Available', val: available, cls: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
          { label: 'Pending Approval', val: pending, cls: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' }
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 text-center ${s.cls}`}>
            <div className="text-2xl font-bold">{s.val}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or city..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm">
          <option value="all">All Status</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Pending">Pending Approval</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Title', 'Owner', 'City', 'Rent', 'Type', 'Status', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100 max-w-[160px] truncate">{p.title}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{p.postedBy?.name || '—'}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{p.address?.city || '—'}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">₹{p.price?.toLocaleString()}</td>
                  <td className="py-3 px-4 capitalize text-gray-500 dark:text-gray-400">{p.propertyType}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => actions.updateProperty(p._id, { featured: !p.featured })}
                      className={`p-1.5 rounded-lg transition ${p.featured ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-400'}`}
                      title={p.featured ? 'Unfeature' : 'Feature'}
                    >
                      <Star size={16} fill={p.featured ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => actions.deleteProperty(p._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-gray-400">No properties found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
