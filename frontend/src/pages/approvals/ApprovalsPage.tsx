import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, MessageSquare, FileText, User, ChevronDown, Filter } from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import { approvalsApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

// Mock approvals data
const MOCK_APPROVALS = [
  { id: '1', document_id: 'doc-1', document_title: 'Track Inspection Report - Blue Line', requester_name: 'Arun Kumar', requester_id: 'u3', status: 'pending', created_at: new Date(Date.now() - 2 * 86400000).toISOString(), comments: null },
  { id: '2', document_id: 'doc-2', document_title: 'Contract Amendment - Civil Works', requester_name: 'Deepa Thomas', requester_id: 'u4', status: 'pending', created_at: new Date(Date.now() - 86400000).toISOString(), comments: null },
  { id: '3', document_id: 'doc-3', document_title: 'Budget Allocation FY2024-25', requester_name: 'Mohan Das', requester_id: 'u7', status: 'pending', created_at: new Date(Date.now() - 3600000 * 6).toISOString(), comments: null },
  { id: '4', document_id: 'doc-4', document_title: 'Safety Inspection Report Q1 2024', requester_name: 'Anjali Krishna', requester_id: 'u6', status: 'approved', created_at: new Date(Date.now() - 7 * 86400000).toISOString(), decided_at: new Date(Date.now() - 5 * 86400000).toISOString(), comments: 'Approved after review.' },
  { id: '5', document_id: 'doc-5', document_title: 'IT Infrastructure Procurement RFP', requester_name: 'Suresh Pillai', requester_id: 'u5', status: 'rejected', created_at: new Date(Date.now() - 10 * 86400000).toISOString(), decided_at: new Date(Date.now() - 8 * 86400000).toISOString(), comments: 'Needs revision of technical specifications.' },
];

function StatusIcon({ status }: { status: string }) {
  if (status === 'approved') return <CheckCircle className="w-5 h-5 text-green-400" />;
  if (status === 'rejected') return <XCircle className="w-5 h-5 text-red-400" />;
  return <Clock className="w-5 h-5 text-yellow-400" />;
}

export default function ApprovalsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [commentModal, setCommentModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [comment, setComment] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: approvals = MOCK_APPROVALS, isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      const resp = await approvalsApi.list();
      return resp.data;
    },
    initialData: MOCK_APPROVALS,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      approvalsApi.approve(id, comments),
    onSuccess: () => {
      toast.success('Approval granted');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      setCommentModal(null);
      setComment('');
    },
    onError: () => toast.error('Failed to approve'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      approvalsApi.reject(id, comments),
    onSuccess: () => {
      toast.success('Document rejected');
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      setCommentModal(null);
      setComment('');
    },
    onError: () => toast.error('Failed to reject'),
  });

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    if (action === 'approve') {
      approveMutation.mutate({ id, comments: comment });
    } else {
      rejectMutation.mutate({ id, comments: comment });
    }
  };

  const filtered = (approvals as typeof MOCK_APPROVALS).filter((a) =>
    filter === 'all' ? true : a.status === filter
  );

  const counts = {
    all: (approvals as typeof MOCK_APPROVALS).length,
    pending: (approvals as typeof MOCK_APPROVALS).filter((a) => a.status === 'pending').length,
    approved: (approvals as typeof MOCK_APPROVALS).filter((a) => a.status === 'approved').length,
    rejected: (approvals as typeof MOCK_APPROVALS).filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Approvals</h1>
          <p className="text-slate-400 text-sm mt-1">Review and manage document approval requests</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          {counts.pending} pending
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all border',
              filter === f
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-xs bg-white/10 px-1.5 py-0.5 rounded-full">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p>No {filter !== 'all' ? filter : ''} approvals found</p>
          </div>
        ) : (
          filtered.map((approval) => (
            <div
              key={approval.id}
              className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 space-y-4 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{approval.document_title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <User className="w-3 h-3" />
                      <span>{approval.requester_name}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(approval.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusIcon status={approval.status} />
                  <span className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full border capitalize',
                    approval.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    approval.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  )}>
                    {approval.status}
                  </span>
                </div>
              </div>

              {approval.comments && (
                <div className="flex items-start gap-2 p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-400">{approval.comments}</p>
                </div>
              )}

              {approval.status === 'pending' && user?.role !== 'employee' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setCommentModal({ id: approval.id, action: 'approve' })}
                    className="flex-1 py-2 rounded-xl bg-green-500/15 text-green-400 border border-green-500/30 text-sm font-medium hover:bg-green-500/25 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => setCommentModal({ id: approval.id, action: 'reject' })}
                    className="flex-1 py-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-sm font-medium hover:bg-red-500/25 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f2937] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-white mb-4 capitalize">
              {commentModal.action === 'approve' ? '✅' : '❌'} {commentModal.action} Document
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)..."
              rows={3}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setCommentModal(null); setComment(''); }} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">Cancel</button>
              <button
                onClick={() => handleAction(commentModal.id, commentModal.action)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl font-medium text-sm text-white transition-colors',
                  commentModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                )}
              >
                Confirm {commentModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
