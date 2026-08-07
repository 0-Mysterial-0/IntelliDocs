import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Upload, FileText, AlertTriangle, Info, X, Check, Sparkles } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { notificationsApi } from '@/lib/api';
import { toast } from 'sonner';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'upload_complete', title: 'DOCUMENT UPLOADED', message: 'SAFETY_INSPECTION_Q1_2024.PDF HAS BEEN UPLOADED AND EASYOCR PROCESSING IS COMPLETE.', is_read: false, created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '2', type: 'approval_request', title: 'APPROVAL REQUESTED', message: 'ARUN KUMAR HAS REQUESTED YOUR APPROVAL FOR TRACK INSPECTION REPORT - BLUE LINE.', is_read: false, created_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: '3', type: 'ai_complete', title: 'AI PROCESSING COMPLETE', message: 'AI SUMMARIZATION COMPLETE FOR TENDER DOCUMENT - SIGNAL SYSTEM UPGRADE.', is_read: false, created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '4', type: 'duplicate_detected', title: 'DUPLICATE DETECTED', message: 'POSSIBLE DUPLICATE FOUND: REVENUE_REPORT_Q2.PDF MATCHES AN EXISTING DOCUMENT (92% SIMILARITY).', is_read: false, created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: '5', type: 'system_alert', title: 'STORAGE ALERT', message: 'STORAGE USAGE HAS REACHED 75% (52 GB OF 100 GB). CONSIDER ARCHIVING OLDER DOCUMENTS.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '6', type: 'approval_request', title: 'DOCUMENT APPROVED', message: 'RAJAN MENON APPROVED FINANCIAL STATEMENT MARCH 2024.', is_read: true, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

function NotifIcon({ type }: { type: string }) {
  if (type === 'upload_complete') return <Upload className="w-5 h-5 text-white stroke-[2.5]" />;
  if (type === 'approval_request') return <CheckCircle className="w-5 h-5 text-[#f472b6] stroke-[2.5]" />;
  if (type === 'ai_complete') return <FileText className="w-5 h-5 text-white stroke-[2.5]" />;
  if (type === 'duplicate_detected') return <AlertTriangle className="w-5 h-5 text-[#fde047] stroke-[2.5]" />;
  if (type === 'system_alert') return <AlertTriangle className="w-5 h-5 text-[#fca5a5] stroke-[2.5]" />;
  return <Info className="w-5 h-5 text-zinc-400 stroke-[2.5]" />;
}

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-6 font-pixel"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-white stroke-[2.5]" />
            <h1 className="text-xl font-pixel-head font-bold text-white font-bloom-pink">NOTIFICATIONS</h1>
            {unreadCount > 0 && (
              <span className="badge-muted-pink font-bloom-pink text-xs font-pixel-code font-bold px-2.5 py-0.5 uppercase">{unreadCount} UNREAD</span>
            )}
          </div>
          <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">STAY UPDATED ON KMRL DOCUMENT TELEMETRY</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="pixel-btn-white flex items-center gap-1 text-xs">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>MARK ALL READ</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 font-pixel-code">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 border text-xs font-bold uppercase transition-all',
              filter === f
                ? 'bg-[#f472b6] text-black border-[#f472b6] shadow-[2px_2px_0px_0px_#f472b6]'
                : 'bg-black text-zinc-400 border-zinc-800 hover:border-white hover:text-white'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notification List with Shiny Pink Card Styling */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="pixel-box p-12 text-center text-zinc-400 font-pixel-code">
            <Bell className="w-10 h-10 text-zinc-600 mx-auto mb-3 stroke-[2]" />
            <p className="font-bold">NO {filter.toUpperCase()} NOTIFICATIONS</p>
          </div>
        ) : (
          filtered.map((notif, idx) => (
            <motion.div
              key={notif.id}
              whileHover={{ scale: 1.01, y: -2 }}
              onClick={() => !notif.is_read && markRead(notif.id)}
              className={cn(
                'p-5 flex items-start gap-4 animate-pixel-float cursor-pointer group',
                idx % 3 === 1 && 'float-delay-1',
                idx % 3 === 2 && 'float-delay-2',
                !notif.is_read
                  ? 'pixel-box-pink'
                  : 'pixel-box opacity-80 hover:opacity-100'
              )}
            >
              <div className="w-10 h-10 border-2 border-white bg-black flex items-center justify-center flex-shrink-0">
                <NotifIcon type={notif.type} />
              </div>
              <div className="flex-1 min-w-0 font-pixel">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-xs font-pixel-head font-bold uppercase', notif.is_read ? 'text-zinc-300' : 'text-white font-bloom-pink')}>{notif.title}</p>
                  <div className="flex items-center gap-2 flex-shrink-0 font-pixel-code">
                    <span className="text-[10px] text-zinc-400 uppercase">{formatRelativeTime(notif.created_at)}</span>
                    {!notif.is_read && <span className="w-2.5 h-2.5 bg-[#f472b6] animate-pulse border border-black" />}
                  </div>
                </div>
                <p className="text-xs text-zinc-300 mt-1 font-pixel-code leading-relaxed uppercase">{notif.message}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
