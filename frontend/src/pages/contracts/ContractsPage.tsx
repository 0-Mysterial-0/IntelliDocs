import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, AlertTriangle, ShieldAlert,
  Building2, Search, Plus, User, CheckCircle2, RefreshCw,
  Eye, Check, XCircle, CheckCircle, X, MessageSquare
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useContractsStore, ExtendedMockContract } from '@/store/contractsStore';
import { useAuthStore } from '@/store/authStore';
import { MOCK_CONTRACTS } from '@/data/mockData';

export default function ContractsPage() {
  const { user } = useAuthStore();
  const { contracts: storeContracts, renewContract, approveContract, rejectContract } = useContractsStore();
  const canApproveContract = user?.role === 'manager' || user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'expiring' | 'pending' | 'renewal' | 'approved' | 'rejected'>('all');
  const [selectedContract, setSelectedContract] = useState<ExtendedMockContract | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');

  const contractList = storeContracts && storeContracts.length > 0 ? storeContracts : MOCK_CONTRACTS;

  const handleRenew = (id: string, title: string) => {
    renewContract(id);
    toast.success(`Renewal workflow initiated for "${title}". SLA status updated to UNDER RENEWAL.`);
  };

  const handleApprove = (id: string, title: string, customNotes?: string) => {
    const reviewer = user?.full_name || 'Authorized Manager';
    approveContract(id, reviewer, customNotes || reviewNoteInput);
    toast.success(`Contract "${title}" APPROVED by ${reviewer}!`);
    setSelectedContract(null);
    setReviewNoteInput('');
  };

  const handleReject = (id: string, title: string, customNotes?: string) => {
    const reviewer = user?.full_name || 'Authorized Manager';
    rejectContract(id, reviewer, customNotes || reviewNoteInput);
    toast.error(`Contract "${title}" REJECTED by ${reviewer}!`);
    setSelectedContract(null);
    setReviewNoteInput('');
  };

  const filteredContracts = contractList.filter((c) => {
    if (!c) return false;
    const term = (search || '').toLowerCase().trim();
    if (!term) return true;

    const matchesSearch =
      (c.title || '').toLowerCase().includes(term) ||
      (c.vendor || '').toLowerCase().includes(term) ||
      (c.assignedEmployeeName || '').toLowerCase().includes(term) ||
      (c.assignedEmployeeEmail || '').toLowerCase().includes(term) ||
      (c.id || '').toLowerCase().includes(term) ||
      (c.department || '').toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (activeTab === 'expiring') return c.status === 'expiring_soon';
    if (activeTab === 'pending') return c.status === 'pending_approval';
    if (activeTab === 'renewal') return c.status === 'under_renewal';
    if (activeTab === 'approved') return c.status === 'active' || (c as any).status === 'approved';
    if (activeTab === 'rejected') return c.status === 'rejected';
    return true;
  });

  const expiringCount = contractList.filter((c) => c.status === 'expiring_soon').length;
  const pendingCount = contractList.filter((c) => c.status === 'pending_approval').length;
  const renewalCount = contractList.filter((c) => c.status === 'under_renewal').length;
  const approvedCount = contractList.filter((c) => c.status === 'active' || (c as any).status === 'approved').length;
  const rejectedCount = contractList.filter((c) => c.status === 'rejected').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto font-pixel"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white stroke-[2.5]" />
            <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">CONTRACT & SLA MANAGEMENT</h1>
            <span className="text-xs font-pixel-code font-bold badge-muted-green px-2.5 py-0.5 uppercase">
              {contractList.length} SLA CONTRACTS
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">
            SLA CONTRACT REVISE & APPROVAL WORKFLOW ENGINE · MANAGER & ADMIN EXECUTIVE CONTROL
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-pixel-code">
        <div
          onClick={() => setActiveTab('all')}
          className={cn(
            'pixel-box p-3 cursor-pointer transition-all',
            activeTab === 'all' && 'border-white bg-zinc-900 shadow-[3px_3px_0px_0px_#ffffff]'
          )}
        >
          <p className="text-2xl font-pixel-head font-bold text-white font-bloom">{contractList.length}</p>
          <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">ALL CONTRACTS</p>
        </div>

        <div
          onClick={() => setActiveTab('expiring')}
          className={cn(
            'pixel-box p-3 cursor-pointer transition-all border-amber-500/60 bg-amber-950/10',
            activeTab === 'expiring' && 'border-amber-400 bg-amber-950/30 shadow-[3px_3px_0px_0px_#f59e0b]'
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-2xl font-pixel-head font-bold text-amber-400 font-bloom">{expiringCount}</p>
            <AlertTriangle className="w-4 h-4 text-amber-400 stroke-[2.5]" />
          </div>
          <p className="text-[10px] text-amber-300 font-bold uppercase mt-1">EXPIRING &lt; 60 DAYS</p>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className={cn(
            'pixel-box p-3 cursor-pointer transition-all border-blue-500/60 bg-blue-950/10',
            activeTab === 'pending' && 'border-blue-400 bg-blue-950/30 shadow-[3px_3px_0px_0px_#3b82f6]'
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-2xl font-pixel-head font-bold text-blue-400 font-bloom">{pendingCount}</p>
            <Clock className="w-4 h-4 text-blue-400 stroke-[2.5]" />
          </div>
          <p className="text-[10px] text-blue-300 font-bold uppercase mt-1">PENDING APPROVAL</p>
        </div>

        <div
          onClick={() => setActiveTab('approved')}
          className={cn(
            'pixel-box p-3 cursor-pointer transition-all border-green-500/60 bg-green-950/10',
            activeTab === 'approved' && 'border-green-400 bg-green-950/30 shadow-[3px_3px_0px_0px_#22c55e]'
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-2xl font-pixel-head font-bold text-[#6ee7b7] font-bloom">{approvedCount}</p>
            <CheckCircle className="w-4 h-4 text-[#6ee7b7] stroke-[2.5]" />
          </div>
          <p className="text-[10px] text-[#6ee7b7] font-bold uppercase mt-1">APPROVED / ACTIVE</p>
        </div>

        <div
          onClick={() => setActiveTab('rejected')}
          className={cn(
            'pixel-box p-3 cursor-pointer transition-all border-red-500/60 bg-red-950/10',
            activeTab === 'rejected' && 'border-red-400 bg-red-950/30 shadow-[3px_3px_0px_0px_#ef4444]'
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-2xl font-pixel-head font-bold text-red-400 font-bloom">{rejectedCount}</p>
            <XCircle className="w-4 h-4 text-red-400 stroke-[2.5]" />
          </div>
          <p className="text-[10px] text-red-300 font-bold uppercase mt-1">REJECTED</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3 bg-black p-3 border-2 border-zinc-700">
        <Search className="w-4 h-4 text-zinc-400 stroke-[2.5]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH CONTRACTS BY TITLE, VENDOR, ASSIGNED OFFICER, OR SLA ID..."
          className="w-full bg-transparent text-white placeholder-zinc-500 text-xs font-pixel focus:outline-none uppercase"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContracts.map((c, idx) => (
          <div
            key={c.id}
            className={cn(
              'pixel-box p-5 space-y-4 animate-pixel-float relative flex flex-col justify-between',
              c.status === 'expiring_soon' && 'border-amber-500/60 bg-amber-950/10',
              c.status === 'under_renewal' && 'border-blue-500/60 bg-blue-950/10',
              c.status === 'rejected' && 'border-red-500/60 bg-red-950/10',
              c.status === 'active' && 'border-green-500/40 bg-green-950/5'
            )}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-pixel-code font-bold text-zinc-400 block mb-0.5">
                    {c.id} · {c.department}
                  </span>
                  <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle line-clamp-2">
                    {c.title}
                  </h3>
                </div>

                <span
                  className={cn(
                    'text-[10px] font-pixel-code font-bold px-2 py-0.5 border uppercase flex-shrink-0',
                    c.status === 'expiring_soon' && 'badge-muted-amber font-bloom-amber',
                    c.status === 'under_renewal' && 'badge-muted-blue',
                    c.status === 'pending_approval' && 'badge-muted-blue',
                    c.status === 'rejected' && 'badge-muted-red font-bloom-red',
                    (c.status === 'active' || (c as any).status === 'approved') && 'badge-muted-green font-bloom-green'
                  )}
                >
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-800 font-pixel-code">
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">VENDOR PARTNER</p>
                  <p className="text-white font-bold truncate flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-zinc-400 flex-shrink-0" /> {c.vendor}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">CONTRACT VALUE</p>
                  <p className="text-[#6ee7b7] font-bold">₹ {(c.valueAmount / 100000).toFixed(2)} Lakhs</p>
                </div>
              </div>

              {/* Assigned Employee Tag */}
              <div className="bg-zinc-900/80 p-2.5 border border-zinc-800 flex items-center justify-between text-xs font-pixel-code">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="w-3.5 h-3.5 text-white flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">ASSIGNED OFFICER</p>
                    <p className="text-white font-bold truncate text-xs">{c.assignedEmployeeName}</p>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 truncate max-w-[140px]">{c.assignedEmployeeEmail}</span>
              </div>

              {/* Reviewer Note Badge if reviewed */}
              {c.reviewedBy && (
                <div className="p-2 bg-black border border-zinc-800 text-[10px] font-pixel-code space-y-0.5">
                  <p className="text-zinc-400 font-bold uppercase">REVIEWED BY: <span className="text-white">{c.reviewedBy}</span></p>
                  {c.reviewNotes && <p className="text-zinc-300 italic">"{c.reviewNotes}"</p>}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-zinc-800 font-pixel-code space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-bold">
                  <Clock className="w-3 h-3 text-zinc-400" /> EXPIRY: {formatDate(c.expiryDate)}
                </span>
                <span className="text-[10px] text-zinc-300 font-bold">
                  SLA: {c.slaCoverage}%
                </span>
              </div>

              {/* Review & Accept / Reject Control Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {/* Review Button for everyone */}
                <button
                  onClick={() => {
                    setSelectedContract(c);
                    setReviewNoteInput(c.reviewNotes || '');
                  }}
                  className="pixel-btn-dark text-[10px] py-1 px-2.5 flex-1 flex items-center justify-center gap-1"
                >
                  <Eye className="w-3 h-3 text-white" /> REVIEW SLA
                </button>

                {/* Manager / Admin Executive Actions */}
                {canApproveContract ? (
                  <>
                    <button
                      onClick={() => handleApprove(c.id, c.title)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] py-1 px-2.5 border border-green-400 flex items-center gap-1 shadow-[2px_2px_0px_0px_#14532d]"
                      title="Approve Contract SLA"
                    >
                      <Check className="w-3 h-3 text-white stroke-[3]" /> ACCEPT
                    </button>
                    <button
                      onClick={() => handleReject(c.id, c.title)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] py-1 px-2.5 border border-red-400 flex items-center gap-1 shadow-[2px_2px_0px_0px_#7f1d1d]"
                      title="Reject Contract SLA"
                    >
                      <X className="w-3 h-3 text-white stroke-[3]" /> REJECT
                    </button>
                  </>
                ) : (
                  c.status === 'expiring_soon' && (
                    <span className="text-[9px] text-amber-300 font-bold bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 uppercase">
                      MANAGER DECISION REQ
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contract Review & Decision Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm font-pixel p-4">
          <div className="pixel-box p-6 w-full max-w-xl bg-black border-2 border-white space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-white stroke-[2.5]" />
                <div>
                  <h2 className="text-sm font-pixel-head font-bold text-white uppercase font-bloom">
                    CONTRACT SLA AUDIT REVIEW
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-pixel-code">{selectedContract.id} · {selectedContract.department}</p>
                </div>
              </div>
              <button onClick={() => setSelectedContract(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-4 font-pixel-code text-xs">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">SLA CONTRACT TITLE</p>
                <p className="text-sm font-bold text-white">{selectedContract.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-zinc-900 p-3 border border-zinc-800">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">VENDOR PARTNER</p>
                  <p className="text-white font-bold">{selectedContract.vendor}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">CONTRACT VALUE</p>
                  <p className="text-[#6ee7b7] font-bold">₹ {(selectedContract.valueAmount / 100000).toFixed(2)} Lakhs</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">ASSIGNED OFFICER</p>
                  <p className="text-white font-bold">{selectedContract.assignedEmployeeName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">EXPIRY DATE</p>
                  <p className="text-amber-300 font-bold">{formatDate(selectedContract.expiryDate)}</p>
                </div>
              </div>

              {/* Reviewer Note Input */}
              <div className="space-y-2">
                <label className="block text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-zinc-400" /> REVIEWER DECISION NOTES / JUSTIFICATION
                </label>
                <textarea
                  rows={3}
                  value={reviewNoteInput}
                  onChange={(e) => setReviewNoteInput(e.target.value)}
                  placeholder="Enter manager audit findings, approval justification, or termination reason..."
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-xs text-white placeholder-zinc-600 font-pixel focus:outline-none uppercase"
                />
              </div>

              {/* Action Buttons inside modal */}
              {canApproveContract ? (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(selectedContract.id, selectedContract.title, reviewNoteInput)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 px-4 border-2 border-green-400 flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#14532d]"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> APPROVE CONTRACT SLA
                  </button>
                  <button
                    onClick={() => handleReject(selectedContract.id, selectedContract.title, reviewNoteInput)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 border-2 border-red-400 flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#7f1d1d]"
                  >
                    <X className="w-4 h-4 stroke-[3]" /> REJECT CONTRACT SLA
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 text-amber-300 text-center font-bold text-[11px] uppercase">
                  VIEW ONLY MODE · MANAGER OR ADMIN ROLE REQUIRED TO DECIDE CONTRACT
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
