import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Clock, AlertTriangle, ShieldAlert,
  Building2, Search, Plus, User, CheckCircle2, RefreshCw
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useContractsStore } from '@/store/contractsStore';
import { MOCK_CONTRACTS, MockContract } from '@/data/mockData';

export default function ContractsPage() {
  const { contracts: storeContracts, renewContract } = useContractsStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'expiring' | 'pending' | 'renewal'>('all');
  const [contractList, setContractList] = useState<MockContract[]>(
    storeContracts && storeContracts.length > 0 ? storeContracts : MOCK_CONTRACTS
  );

  const handleRenew = (id: string, title: string) => {
    renewContract(id);
    setContractList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'under_renewal', isExpiring: false } : c))
    );
    toast.success(`Renewal workflow initiated for "${title}". SLA status updated to UNDER RENEWAL.`);
  };

  const filteredContracts = contractList.filter((c) => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.vendor.toLowerCase().includes(search.toLowerCase()) ||
      c.assignedEmployeeName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'expiring') return c.status === 'expiring_soon';
    if (activeTab === 'pending') return c.status === 'pending_approval';
    if (activeTab === 'renewal') return c.status === 'under_renewal';
    return true;
  });

  const expiringCount = contractList.filter((c) => c.status === 'expiring_soon').length;
  const pendingCount = contractList.filter((c) => c.status === 'pending_approval').length;
  const renewalCount = contractList.filter((c) => c.status === 'under_renewal').length;

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
              80 SLA CONTRACTS
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">
            80 HARDCODED CONTRACT SLAS · INDIVIDUALLY ASSIGNED TO EVERY KMRL EMPLOYEE
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-pixel-code">
        <div
          onClick={() => setActiveTab('all')}
          className={cn(
            'pixel-box p-4 cursor-pointer transition-all',
            activeTab === 'all' && 'border-white bg-zinc-900 shadow-[3px_3px_0px_0px_#ffffff]'
          )}
        >
          <p className="text-3xl font-pixel-head font-bold text-white font-bloom">{contractList.length}</p>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1">TOTAL CONTRACTS</p>
        </div>

        <div
          onClick={() => setActiveTab('expiring')}
          className={cn(
            'pixel-box p-4 cursor-pointer transition-all border-amber-500/60 bg-amber-950/10',
            activeTab === 'expiring' && 'border-amber-400 bg-amber-950/30 shadow-[3px_3px_0px_0px_#f59e0b]'
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-3xl font-pixel-head font-bold text-amber-400 font-bloom">{expiringCount}</p>
            <AlertTriangle className="w-5 h-5 text-amber-400 stroke-[2.5]" />
          </div>
          <p className="text-xs text-amber-300 font-bold uppercase mt-1">EXPIRING &lt; 60 DAYS</p>
        </div>

        <div
          onClick={() => setActiveTab('pending')}
          className={cn(
            'pixel-box p-4 cursor-pointer transition-all',
            activeTab === 'pending' && 'border-white bg-zinc-900 shadow-[3px_3px_0px_0px_#ffffff]'
          )}
        >
          <p className="text-3xl font-pixel-head font-bold text-white font-bloom">{pendingCount}</p>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1">PENDING APPROVAL</p>
        </div>

        <div
          onClick={() => setActiveTab('renewal')}
          className={cn(
            'pixel-box p-4 cursor-pointer transition-all',
            activeTab === 'renewal' && 'border-white bg-zinc-900 shadow-[3px_3px_0px_0px_#ffffff]'
          )}
        >
          <p className="text-3xl font-pixel-head font-bold text-[#6ee7b7] font-bloom">{renewalCount}</p>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1">UNDER RENEWAL</p>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-pixel-code">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[2.5]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH CONTRACTS, VENDORS OR EMPLOYEES..."
            className="w-full pl-10 pr-4 py-2 bg-black border-2 border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {[
            { id: 'all', label: `ALL (${contractList.length})` },
            { id: 'expiring', label: `EXPIRING (${expiringCount})` },
            { id: 'pending', label: `PENDING (${pendingCount})` },
            { id: 'renewal', label: `RENEWAL (${renewalCount})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                'px-3 py-1.5 text-xs font-bold uppercase border transition-all',
                activeTab === t.id
                  ? 'bg-white text-black border-white shadow-[2px_2px_0px_0px_#ffffff]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-white hover:text-white'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contract Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContracts.map((c) => (
          <div
            key={c.id}
            className={cn(
              'pixel-box p-5 space-y-3 font-pixel-code border-2 transition-all',
              c.status === 'expiring_soon'
                ? 'border-amber-500/70 bg-amber-950/10'
                : c.status === 'under_renewal'
                ? 'border-green-500/70 bg-green-950/10'
                : 'border-zinc-800 bg-black'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">{c.id} · {c.department}</span>
                <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle uppercase mt-0.5">
                  {c.title}
                </h3>
              </div>
              <span
                className={cn(
                  'text-[10px] px-2 py-0.5 font-bold uppercase border flex-shrink-0',
                  c.status === 'expiring_soon'
                    ? 'bg-amber-400 text-black border-amber-300'
                    : c.status === 'under_renewal'
                    ? 'badge-muted-green font-bloom-green'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-600'
                )}
              >
                {c.status.replace('_', ' ')}
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

            {/* Assigned Employee Tag */}
            <div className="bg-zinc-900/80 p-2.5 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-3.5 h-3.5 text-white flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">ASSIGNED OFFICER</p>
                  <p className="text-white font-bold truncate text-xs">{c.assignedEmployeeName}</p>
                </div>
              </div>
              <span className="text-[10px] text-zinc-400 truncate max-w-[140px]">{c.assignedEmployeeEmail}</span>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-bold">
                <Clock className="w-3 h-3 text-zinc-400" /> EXPIRY: {formatDate(c.expiryDate)}
              </span>

              {c.status === 'expiring_soon' && (
                <button
                  onClick={() => handleRenew(c.id, c.title)}
                  className="pixel-btn-white text-[10px] py-1 px-2.5 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-black animate-spin" style={{ animationDuration: '3s' }} /> INITIATE RENEWAL
                </button>
              )}

              {c.status === 'under_renewal' && (
                <span className="text-[10px] font-bold text-[#6ee7b7] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#6ee7b7]" /> RENEWAL IN PROGRESS
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
