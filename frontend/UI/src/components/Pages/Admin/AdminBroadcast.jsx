import { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

export default function AdminBroadcast({ inquiries = [], broadcast }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [sending, setSending] = useState(false);
  const [expandedInquiry, setExpandedInquiry] = useState(null);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return showErrorToast('Title and message are required');
    setSending(true);
    try {
      await broadcast(title, message, targetRole);
      setTitle(''); setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl"><Megaphone size={22} className="text-indigo-600" /></div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">System Broadcast</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Send platform-wide notifications to users</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. System maintenance tonight" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="w-44">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Target</label>
              <select value={targetRole} onChange={e => setTargetRole(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none">
                <option value="all">All Users</option>
                <option value="tenant">Tenants Only</option>
                <option value="landlord">Landlords Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Write your announcement here..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
          </div>
          <button onClick={handleSend} disabled={sending} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50">
            <Send size={16} />{sending ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </div>

      {/* Inquiry / Message Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">Inquiry Logs ({inquiries.length})</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Communication logs between landlords and tenants</p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {inquiries.length === 0 && <p className="py-12 text-center text-gray-400 text-sm">No inquiries found</p>}
          {inquiries.map(inq => (
            <div key={inq._id}>
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30"
                onClick={() => setExpandedInquiry(expandedInquiry === inq._id ? null : inq._id)}
              >
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{inq.property?.title || 'Unknown Property'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {inq.seeker?.name || 'Unknown'} → {inq.landlord?.name || 'Unknown'} · {new Date(inq.contactTime).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">{inq.replies?.length || 0} replies</span>
              </div>
              {expandedInquiry === inq._id && (
                <div className="px-5 pb-4 space-y-2 bg-gray-50 dark:bg-gray-700/20">
                  <p className="text-sm text-gray-600 dark:text-gray-300 border-l-2 border-indigo-400 pl-3 py-1 italic">"{inq.message}"</p>
                  {inq.replies?.map((r, i) => (
                    <div key={i} className={`flex ${r.role === 'landlord' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${r.role === 'landlord' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'}`}>
                        <p className="font-semibold mb-0.5">{r.senderName} ({r.role})</p>
                        <p>{r.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
