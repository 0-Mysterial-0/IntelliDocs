import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Building2, Search, User, Clock, CheckCircle2,
  X, AlertTriangle, MessageSquare, Ban, Check, Lock, KeyRound
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useContractsStore, ExtendedMockContract } from '@/store/contractsStore';
import { useAuthStore } from '@/store/authStore';
import { MOCK_CONTRACTS } from '@/data/mockData';

export default function RevokeContractsPage() {
  const { user } = useAuthStore();
  const { contracts: storeContracts, revokeContract } = useContractsStore();
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState<ExtendedMockContract | null>(null);
  const [revocationReason, setRevocationReason] = useState('');

  // Password verification modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const contractList = storeContracts && storeContracts.length > 0 ? storeContracts : MOCK_CONTRACTS;

  // Filter ONLY active/approved contracts that can be revoked
  const activeContracts = contractList.filter((c) => {
    if (!c) return false;
    const isActive = c.status === 'active' || (c as any).status === 'approved';
    if (!isActive) return false;

    const term = (search || '').toLowerCase().trim();
    if (!term) return true;

    return (
      (c.title || '').toLowerCase().includes(term) ||
      (c.vendor || '').toLowerCase().includes(term) ||
      (c.assignedEmployeeName || '').toLowerCase().includes(term) ||
      (c.id || '').toLowerCase().includes(term) ||
      (c.department || '').toLowerCase().includes(term)
    );
  });

  const handleConfirmRevoke = () => {
    if (!selectedContract) return;
    const revokerName = user?.full_name || 'Rajan Menon (Manager)';
    revokeContract(selectedContract.id, revokerName, revocationReason);
    toast.error(`Contract "${selectedContract.title}" has been REVOKED and CANCELLED!`);
    setSelectedContract(null);
    setRevocationReason('');
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput.trim() === 'password') {
      if (user) {
        useAuthStore.getState().setUser({ ...user, role: 'manager' });
      } else {
        useAuthStore.getState().setAuth(
          {
            id: 'user-manager',
            email: 'rajan.menon@kmrl.in',
            full_name: 'Rajan Menon',
            role: 'manager',
            department_name: 'Finance',
            is_active: true,
            is_verified: true,
          },
          'mock-token-manager-2024'
        );
      }
      toast.success('Security password verified! Manager executive authority activated.');
      setShowPasswordModal(false);
      setPasswordInput('');
    } else {
      toast.error('Invalid security password! Hint: Enter "password"');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto font-pixel"
    >
      {/* Role Banner for Employees */}
      {!isManagerOrAdmin && (
        <div className="p-4 bg-amber-950/40 border-2 border-amber-500/60 font-pixel-code flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 stroke-[2.5] flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase">EMPLOYEE VIEW MODE</p>
              <p className="text-[10px] text-amber-300 uppercase">REVOCATION REQUIRES MANAGER SECURITY PASSWORD ("password")</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="pixel-btn-white text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span>⚡ UNLOCK MANAGER ROLE</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-400 stroke-[2.5]" />
          <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">REVOKE CONTRACT SLAS</h1>
          <span className="text-xs font-pixel-code font-bold badge-muted-red px-2.5 py-0.5 uppercase">
            {activeContracts.length} ACTIVE REVOCABLE CONTRACTS
          </span>
        </div>
        <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">
          EXECUTIVE CONTROL PANEL · CANCEL ACTIVE VENDOR CONTRACTS & TERMINATE SLA AGREEMENTS
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-black p-3 border-2 border-red-500/40 font-pixel-code">
        <Search className="w-4 h-4 text-zinc-400 stroke-[2.5]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH ACTIVE CONTRACTS TO REVOKE BY VENDOR, TITLE, OFFICER OR ID..."
          className="w-full bg-transparent text-white placeholder-zinc-500 text-xs font-pixel focus:outline-none uppercase"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid of Revocable Active Contracts */}
      {activeContracts.length === 0 ? (
        <div className="pixel-box p-12 text-center text-zinc-400 font-pixel-code">
          <CheckCircle2 className="w-10 h-10 text-[#6ee7b7] mx-auto mb-3 stroke-[2]" />
          <p className="font-bold text-white">NO ACTIVE CONTRACTS MATCHING "{search}"</p>
          <p className="text-xs text-zinc-500 mt-1 uppercase">
            ALL ELIGIBLE ACTIVE CONTRACTS ARE EITHER ALREADY REVOKED OR SEARCH QUERY RETURNED NO RESULTS
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeContracts.map((c) => (
            <div
              key={c.id}
              className="pixel-box p-5 space-y-4 border-red-500/30 bg-red-950/5 flex flex-col justify-between"
            >
              <div className="space-y-3 font-pixel-code">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold block mb-0.5">
                      {c.id} · {c.department}
                    </span>
                    <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle line-clamp-2">
                      {c.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold badge-muted-green px-2 py-0.5 uppercase flex-shrink-0">
                    ACTIVE SLA
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-800">
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

                <div className="bg-zinc-900/80 p-2.5 border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-3.5 h-3.5 text-white flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase">ASSIGNED OFFICER</p>
                      <p className="text-white font-bold truncate text-xs">{c.assignedEmployeeName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 font-pixel-code space-y-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold">
                  <span>EXPIRY: {formatDate(c.expiryDate)}</span>
                  <span>SLA: {c.slaCoverage}%</span>
                </div>

                <button
                  onClick={() => {
                    if (!isManagerOrAdmin) {
                      setShowPasswordModal(true);
                    } else {
                      setSelectedContract(c);
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 border border-red-400 flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#7f1d1d] uppercase transition-all"
                >
                  <Ban className="w-4 h-4 text-white stroke-[2.5]" />
                  <span>REVOKE / CANCEL CONTRACT</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Password Verification Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm font-pixel p-4">
          <div className="pixel-box p-6 w-full max-w-md bg-black border-2 border-white space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-amber-400 stroke-[2.5]" />
                <div>
                  <h2 className="text-sm font-pixel-head font-bold text-white uppercase font-bloom">
                    SECURITY PASSWORD VERIFICATION
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-pixel-code">ENTER MANAGER SECURITY PASSWORD TO UNLOCK</p>
                </div>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 font-pixel-code text-xs">
              <div className="space-y-2">
                <label className="block text-[10px] text-zinc-300 font-bold uppercase flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" /> MANAGER / ADMIN PASSWORD:
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder='ENTER "password"'
                  autoFocus
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-xs text-white placeholder-zinc-600 font-pixel focus:outline-none uppercase"
                />
                <p className="text-[10px] text-zinc-400">SECURITY HINT: TYPE <strong className="text-white font-bold">password</strong> TO VERIFY MANAGER AUTHORITY.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 pixel-btn-dark text-xs py-2 px-4"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 pixel-btn-white text-xs py-2 px-4 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> VERIFY & UNLOCK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revocation Confirmation Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm font-pixel p-4">
          <div className="pixel-box p-6 w-full max-w-lg bg-black border-2 border-red-500 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <Ban className="w-6 h-6 text-red-500 stroke-[2.5]" />
                <div>
                  <h2 className="text-sm font-pixel-head font-bold text-white uppercase font-bloom-red">
                    CONFIRM CONTRACT REVOCATION
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-pixel-code">{selectedContract.id} · {selectedContract.vendor}</p>
                </div>
              </div>
              <button onClick={() => setSelectedContract(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-4 font-pixel-code text-xs">
              <div className="p-3 bg-red-950/30 border border-red-500/40 text-red-300 font-bold uppercase text-xs space-y-1">
                <p className="flex items-center gap-1 text-red-400 font-extrabold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> WARNING: PERMANENT CONTRACT CANCELLATION
                </p>
                <p className="text-[11px] font-normal text-zinc-300">
                  Revoking contract <strong className="text-white">"{selectedContract.title}"</strong> will mark it as CANCELLED across the entire KMRL IntelliDocs system for all users.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> CANCELLATION REASON / EXECUTIVE JUSTIFICATION
                </label>
                <textarea
                  rows={3}
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  placeholder="E.G., VENDOR SLA DEFAULT, NON-COMPLIANCE AUDIT, OR EARLY PROJECT TERMINATION..."
                  className="w-full bg-black border-2 border-zinc-700 p-3 text-xs text-white placeholder-zinc-600 font-pixel focus:outline-none uppercase"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedContract(null)}
                  className="flex-1 pixel-btn-dark text-xs py-2 px-4"
                >
                  ABORT / KEEP ACTIVE
                </button>
                <button
                  onClick={handleConfirmRevoke}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 border-2 border-red-400 flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#7f1d1d]"
                >
                  <Ban className="w-4 h-4 stroke-[3]" /> CONFIRM REVOCATION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
