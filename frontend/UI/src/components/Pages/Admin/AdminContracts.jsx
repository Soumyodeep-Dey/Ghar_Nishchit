import { Trash2, FileText, Download } from 'lucide-react';

const STATUS_COLORS = { pending: 'bg-amber-100 text-amber-700', active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700' };

export default function AdminContracts({ contracts = [], actions }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['pending', 'active', 'completed', 'cancelled'].map(s => (
          <div key={s} className={`rounded-xl p-4 text-center ${STATUS_COLORS[s]}`}>
            <div className="text-2xl font-bold">{contracts.filter(c => c.status === s).length}</div>
            <div className="text-xs font-medium capitalize mt-0.5">{s}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={() => {
          const headers = ['Tenant', 'Landlord', 'Property', 'Rent/mo', 'Duration', 'Status'];
          const csv = [headers.join(','), ...contracts.map(c => [
            c.tenant?.name ? `"${c.tenant.name}"` : '—',
            c.landlord?.name ? `"${c.landlord.name}"` : '—',
            c.property?.title ? `"${c.property.title}"` : '—',
            c.rentAmount,
            `${c.duration} mo`,
            c.status
          ].join(','))].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'contracts_report.csv';
          link.click();
        }} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-700 dark:hover:bg-white transition">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Tenant', 'Landlord', 'Property', 'Rent/mo', 'Duration', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {contracts.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                  <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">{c.tenant?.name || '—'}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{c.landlord?.name || '—'}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400 max-w-[120px] truncate">{c.property?.title || '—'}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-100">₹{c.rentAmount?.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{c.duration} mo</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => actions.deleteContract(c._id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {contracts.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-gray-400">No contracts found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
