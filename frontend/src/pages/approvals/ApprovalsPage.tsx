import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, MessageSquare, FileText, User, ChevronDown, Filter } from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import { approvalsApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { MOCK_APPROVALS as GENERATED_APPROVALS } from '@/data/mockData';

const INITIAL_APPROVALS = GENERATED_APPROVALS.map((a) => ({
  id: a.id,
  document_id: a.documentId,
  document_title: a.documentTitle,
  requester_name: a.requestedBy,
  requester_id: `u-${a.id}`,
  status: a.status,
  created_at: a.dateRequested,
  comments: a.status === 'approved' ? 'Approved after executive review.' : (a.status === 'rejected' ? 'Revision requested for section 2.4 compliance.' : null),
}));

function StatusIcon({ status }: { status: string }) {
  if (status === 'approved') return <CheckCircle className="w-5 h-5 text-[#6ee7b7] stroke-[2.5]" />;
  if (status === 'rejected') return <XCircle className="w-5 h-5 text-[#fca5a5] stroke-[2.5]" />;
  return <Clock className="w-5 h-5 text-[#fde047] stroke-[2.5]" />;
}

export default function ApprovalsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [commentModal, setCommentModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [comment, setComment] = useState('');
  const { user } = useAuthStore();

  const [approvalsList, setApprovalsList] = useState(INITIAL_APPROVALS);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approvalsApi.approve(id, comment);
      } else {
        await approvalsApi.reject(id, comment);
      }
    } catch (_) {}

    setApprovalsList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: action === 'approve' ? 'approved' : 'rejected',
              comments: comment || item.comments,
              decided_at: new Date().toISOString(),
            }
          : item
      )
    );

    toast.success(action === 'approve' ? 'Approval granted' : 'Document rejected');
    setCommentModal(null);
    setComment('');
  };

  const filtered = approvalsList.filter((a) =>
    filter === 'all' ? true : a.status === filter
  );

  const counts = {
    all: approvalsList.length,
    pending: approvalsList.filter((a) => a.status === 'pending').length,
    approved: approvalsList.filter((a) => a.status === 'approved').length,
    rejected: approvalsList.filter((a) => a.status === 'rejected').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6 font-pixel"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">APPROVAL WORKFLOW</h1>
          <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">REVIEW AND MANAGE DOCUMENT APPROVAL REQUESTS</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-pixel-code text-zinc-300 font-bold uppercase">
          <span className="w-2 h-2 bg-[#fde047] animate-pulse" />
          {counts.pending} PENDING ACTION
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 font-pixel-code">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 border text-xs font-bold uppercase transition-all',
              filter === f
                ? 'bg-white text-black border-white shadow-[2px_2px_0px_0px_#ffffff]'
                : 'bg-black text-zinc-400 border-zinc-800 hover:border-white hover:text-white'
            )}
          >
            {f}
            <span className="ml-2 text-[10px] bg-black text-zinc-300 px-1.5 border border-zinc-700">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="pixel-box p-12 text-center text-zinc-400 font-pixel-code">
            <CheckCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3 stroke-[2]" />
            <p className="font-bold">NO {filter !== 'all' ? filter.toUpperCase() : ''} APPROVALS FOUND</p>
          </div>
        ) : (
          filtered.map((approval, idx) => (
            <motion.div
              key={approval.id}
              whileHover={{ scale: 1.01, y: -2 }}
              className={cn(
                'pixel-box p-5 space-y-4 animate-pixel-float cursor-pointer',
                idx % 3 === 1 && 'float-delay-1',
                idx % 3 === 2 && 'float-delay-2'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-white stroke-[2.5] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle">{approval.document_title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs font-pixel-code text-zinc-400 uppercase">
                      <User className="w-3 h-3 stroke-[2]" />
                      <span>{approval.requester_name}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(approval.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 font-pixel-code">
                  <StatusIcon status={approval.status} />
                  <span className={cn(
                    'text-xs font-bold px-2.5 py-0.5 border uppercase',
                    approval.status === 'approved' ? 'badge-muted-green font-bloom-green' :
                    approval.status === 'rejected' ? 'badge-muted-red font-bloom-red' :
                    'badge-muted-amber font-bloom-amber'
                  )}>
                    {approval.status}
                  </span>
                </div>
              </div>

              {approval.comments && (
                <div className="flex items-start gap-2 p-3 bg-black border border-zinc-800 font-pixel-code">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-zinc-300">{approval.comments}</p>
                </div>
              )}

              {approval.status === 'pending' && user?.role !== 'employee' && (
                <div className="flex gap-3 pt-1 font-pixel-code">
                  <button
                    onClick={() => setCommentModal({ id: approval.id, action: 'approve' })}
                    className="pixel-btn-white flex-1 flex items-center justify-center gap-1.5 text-xs"
                  >
                    <CheckCircle className="w-4 h-4 stroke-[3]" /> APPROVE
                  </button>
                  <button
                    onClick={() => setCommentModal({ id: approval.id, action: 'reject' })}
                    className="pixel-btn-dark flex-1 flex items-center justify-center gap-1.5 text-xs text-[#fca5a5] border-[#fca5a5]/40"
                  >
                    <XCircle className="w-4 h-4 stroke-[3]" /> REJECT
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-pixel">
          <div className="pixel-box p-6 w-full max-w-md bg-black border-2 border-white">
            <h3 className="font-pixel-head font-bold text-white text-sm mb-4 uppercase font-bloom">
              {commentModal.action === 'approve' ? '✅' : '❌'} {commentModal.action} DOCUMENT
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="ADD A COMMENT (OPTIONAL)..."
              rows={3}
              className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white resize-none mb-4 uppercase"
            />
            <div className="flex gap-3">
              <button onClick={() => { setCommentModal(null); setComment(''); }} className="pixel-btn-dark flex-1">CANCEL</button>
              <button
                onClick={() => handleAction(commentModal.id, commentModal.action)}
                className="pixel-btn-white flex-1"
              >
                CONFIRM {commentModal.action.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
