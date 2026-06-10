import { useState } from 'react';
import { LifeBuoy, Send, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';

const STATUS_COLORS = {
  open:        'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved:    'bg-green-100 text-green-700',
  closed:      'bg-gray-100 text-gray-500',
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AdminSupport({ supportRequests = [], actions }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState(null);

  const openCount = supportRequests.filter((r) => r.status === 'open').length;

  const filtered = supportRequests.filter((r) => {
    if (filter === 'open') return r.status === 'open';
    if (filter === 'in_progress') return r.status === 'in_progress';
    return true;
  });

  const handleReply = async (id) => {
    const text = replyText[id]?.trim();
    if (!text) return;
    setSending(id);
    try {
      await actions.replyToSupport(id, text);
      setReplyText((prev) => ({ ...prev, [id]: '' }));
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-4">
      {openCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <LifeBuoy size={20} className="text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              {openCount} open help request{openCount > 1 ? 's' : ''} awaiting response
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-300">Users need assistance — review and reply below.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {[['all', 'All'], ['open', `Open (${openCount})`], ['in_progress', 'In Progress']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === val
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-indigo-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((req) => {
          const isOpen = expanded === req._id;
          const thread = [
            { role: req.userRole, senderName: req.userName, content: req.message, createdAt: req.createdAt },
            ...(req.replies || []),
          ];

          return (
            <div key={req._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : req._id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
              >
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl shrink-0">
                  <MessageCircle size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{req.subject}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {req.userName} ({req.userRole}) · {req.userEmail} · {formatDate(req.createdAt)}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[req.status] || ''}`}>
                  {STATUS_LABELS[req.status] || req.status}
                </span>
                {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="py-4 space-y-3 max-h-64 overflow-y-auto">
                    {thread.map((msg, i) => (
                      <div
                        key={i}
                        className={`rounded-xl px-4 py-3 text-sm ${
                          msg.role === 'admin'
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 ml-0 mr-8'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 ml-8 mr-0'
                        }`}
                      >
                        <p className="text-xs font-semibold opacity-60 mb-1">
                          {msg.role === 'admin' ? 'Admin' : msg.senderName || req.userName}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs opacity-40 mt-1">{formatDate(msg.createdAt)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <select
                      value={req.status}
                      onChange={(e) => actions.updateSupportStatus(req._id, e.target.value)}
                      className="text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none"
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>

                    <div className="flex flex-1 gap-2">
                      <input
                        className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 bg-white dark:bg-gray-700 focus:outline-none"
                        placeholder="Type a reply to the user..."
                        value={replyText[req._id] || ''}
                        onChange={(e) => setReplyText((prev) => ({ ...prev, [req._id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleReply(req._id)}
                      />
                      <button
                        onClick={() => handleReply(req._id)}
                        disabled={sending === req._id || !replyText[req._id]?.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl disabled:opacity-50 hover:bg-indigo-700 transition"
                      >
                        <Send size={14} />
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <LifeBuoy className="w-10 h-10 mx-auto mb-2 opacity-40" />
            No help requests found
          </div>
        )}
      </div>
    </div>
  );
}
