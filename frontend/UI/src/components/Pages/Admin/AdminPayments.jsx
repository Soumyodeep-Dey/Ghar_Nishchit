import { useState } from 'react';
import { IndianRupee, CheckCircle, Clock, XCircle, AlertCircle, Download } from 'lucide-react';

const STATUS_ICONS = { Paid: CheckCircle, Pending: Clock, Overdue: AlertCircle, Failed: XCircle };
const STATUS_COLORS = { Paid: 'text-green-600 bg-green-50', Pending: 'text-amber-600 bg-amber-50', Overdue: 'text-orange-600 bg-orange-50', Failed: 'text-red-600 bg-red-50' };

export default function AdminPayments({ payments = [], analytics }) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = payments.filter(p => statusFilter === 'all' || p.status === statusFilter);

  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const totalFailed = payments.filter(p => p.status === 'Failed').length;

  const exportCSV = () => {
    const headers = ['Tenant', 'Property', 'Amount', 'Method', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filtered.map(p => {
        return [
          p.tenantId?.name ? `"${p.tenantId.name}"` : '—',
          p.propertyId?.title ? `"${p.propertyId.title}"` : 'Manual',
          p.amount,
          p.paymentMethod,
          p.status,
          p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : new Date(p.createdAt).toLocaleDateString('en-IN')
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'payments_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalPaid.toLocaleString()}`, cls: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' },
          { label: 'Pending', value: `₹${totalPending.toLocaleString()}`, cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
          { label: 'Failed Txns', value: totalFailed, cls: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' },
          { label: 'Total Txns', value: payments.length, cls: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.cls}`}>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter and Export */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'Paid', 'Pending', 'Overdue', 'Failed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-indigo-400'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 rounded-xl text-sm font-semibold hover:bg-gray-700 dark:hover:bg-white transition">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                {['Tenant', 'Property', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(p => {
                const Icon = STATUS_ICONS[p.status] || Clock;
                return (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-gray-100">{p.tenantId?.name || '—'}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 max-w-[120px] truncate">{p.propertyId?.title || 'Manual'}</td>
                    <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-100">₹{p.amount?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{p.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] || ''}`}>
                        <Icon size={12} />{p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-gray-400">No payments found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
