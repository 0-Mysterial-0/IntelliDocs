import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, CheckCircle, Upload, FileText, AlertTriangle, Info, X, Check } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { notificationsApi } from '@/lib/api';
import { toast } from 'sonner';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'upload_complete', title: 'Document Uploaded', message: 'Safety_Inspection_Q1_2024.pdf has been uploaded and OCR processing is complete.', is_read: false, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '2', type: 'approval_request', title: 'Approval Requested', message: 'Arun Kumar has requested your approval for Track Inspection Report - Blue Line.', is_read: false, created_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: '3', type: 'ai_complete', title: 'AI Processing Complete', message: 'AI summarization complete for Tender Document - Signal System Upgrade.', is_read: false, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '4', type: 'duplicate_detected', title: 'Duplicate Detected', message: 'Possible duplicate found: Revenue_Report_Q2.pdf matches an existing document (92% similarity).', is_read: false, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: '5', type: 'system_alert', title: 'Storage Alert', message: 'Storage usage has reached 75% (52 GB of 100 GB). Consider archiving older documents.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '6', type: 'approval_request', title: 'Document Approved', message: 'Rajan Menon approved Financial Statement March 2024.', is_read: true, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

function NotifIcon({ type }: { type: string }) {
  const props = { className: 'w-5 h-5' };
  if (type === 'upload_complete') return <Upload {...props} className="w-5 h-5 text-sky-400" />;
  if (type === 'approval_request') return <CheckCircle {...props} className="w-5 h-5 text-green-400" />;
  if (type === 'ai_complete') return <FileText {...props} className="w-5 h-5 text-violet-400" />;
  if (type === 'duplicate_detected') return <AlertTriangle {...props} className="w-5 h-5 text-amber-400" />;
  if (type === 'system_alert') return <AlertTriangle {...props} className="w-5 h-5 text-red-400" />;
  return <Info {...props} className="w-5 h-5 text-slate-400" />;
}

const iconBg: Record<string, string> = {
  upload_complete: 'bg-sky-500/10',
  approval_request: 'bg-green-500/10',
  ai_complete: 'bg-violet-500/10',
  duplicate_detected: 'bg-amber-500/10',
  system_alert: 'bg-red-500/10',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markRead = (id: string) => {
    setNotifications((n) => n.map((notif) => notif.id === id ? { ...notif, is_read: true } : notif));
    notificationsApi.markRead(id).catch(() => {});
  };

  const markAllRead = () => {
    setNotifications((n) => n.map((notif) => ({ ...notif, is_read: true })));
    notificationsApi.markAllRead().catch(() => {});
    toast.success('All notifications marked as read');
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-sky-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">Stay updated on document activity</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors">
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
              filter === f ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'unread' && unreadCount > 0 && <span className="ml-1.5 text-xs bg-sky-500/20 text-sky-400 px-1.5 rounded-full">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400">No {filter} notifications</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group',
                notif.is_read
                  ? 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]'
                  : 'bg-sky-500/5 border-sky-500/10 hover:border-sky-500/20'
              )}
              onClick={() => !notif.is_read && markRead(notif.id)}
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg[notif.type] || 'bg-slate-500/10')}>
                <NotifIcon type={notif.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm font-semibold', notif.is_read ? 'text-slate-300' : 'text-white')}>{notif.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-500">{formatRelativeTime(notif.created_at)}</span>
                    {!notif.is_read && <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0" />}
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
