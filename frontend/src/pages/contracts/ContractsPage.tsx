import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, AlertTriangle, ShieldAlert,
  Sparkles, Building2, Search, Plus, X
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface Contract {
  id: string;
  title: string;
  vendor: string;
  department: string;
  contractValue: string;
  startDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'active' | 'expiring_soon' | 'expired' | 'under_renewal';
  riskScore: 'low' | 'medium' | 'high' | 'critical';
  autoRenewal: boolean;
  keyClause: string;
}

const DEMO_CONTRACTS: Contract[] = [
  {
    id: 'cnt-01',
    title: 'Rolling Stock Preventive Maintenance SLA',
    vendor: 'Alstom Transport India Ltd.',
    department: 'Maintenance',
    contractValue: '₹ 14.50 Crores',
    startDate: '2022-05-15',
    expiryDate: '2024-08-30',
    daysRemaining: 23,
    status: 'expiring_soon',
    riskScore: 'critical',
    autoRenewal: false,
    keyClause: '60-day mandatory advance renewal notice required to avoid service penalty of ₹ 2 Lakhs/day.',
  },
  {
    id: 'cnt-02',
    title: 'Signaling & Train Control Systems Support',
    vendor: 'Ansaldo STS / Hitachi Rail',
    department: 'Operations',
    contractValue: '₹ 22.80 Crores',
    startDate: '2021-09-01',
    expiryDate: '2024-09-15',
    daysRemaining: 39,
    status: 'expiring_soon',
    riskScore: 'high',
    autoRenewal: false,
    keyClause: 'Requires annual safety audit certificate prior to formal contract extension.',
  },
  {
    id: 'cnt-03',
    title: 'Station Security & Guard Services Agreement',
    vendor: 'Security Intelligence Services (SIS)',
    department: 'Operations',
    contractValue: '₹ 6.20 Crores',
    startDate: '2023-01-01',
    expiryDate: '2024-12-31',
    daysRemaining: 146,
    status: 'active',
    riskScore: 'low',
    autoRenewal: true,
    keyClause: 'Automatic annual renewal subject to 95% SLA compliance score.',
  },
  {
    id: 'cnt-04',
    title: 'Traction Substation Power Supply Contract',
    vendor: 'Kerala State Electricity Board (KSEB)',
    department: 'Maintenance',
    contractValue: '₹ 38.00 Crores',
    startDate: '2020-04-01',
    expiryDate: '2025-03-31',
    daysRemaining: 236,
    status: 'active',
    riskScore: 'low',
    autoRenewal: true,
    keyClause: 'Tariff indexation linked to CERC annual power tariff benchmarks.',
  },
  {
    id: 'cnt-05',
    title: 'IT Infrastructure & Cloud Services SLA',
    vendor: 'TechSys Solutions Pvt Ltd',
    department: 'Procurement',
    contractValue: '₹ 3.40 Crores',
    startDate: '2023-08-10',
    expiryDate: '2024-08-10',
    daysRemaining: 3,
    status: 'expiring_soon',
    riskScore: 'critical',
    autoRenewal: false,
    keyClause: 'Immediate renewal required. Data migration grace period expires 7 days post-expiry.',
  },
  {
    id: 'cnt-06',
    title: 'Water Metro Hull Maintenance Contract',
    vendor: 'Cochin Shipyard Limited (CSL)',
    department: 'Operations',
    contractValue: '₹ 8.90 Crores',
    startDate: '2023-03-01',
    expiryDate: '2025-02-28',
    daysRemaining: 205,
    status: 'active',
    riskScore: 'low',
    autoRenewal: false,
    keyClause: 'Dry-docking mandatory every 12 months with CSL certified inspectors.',
  },
];

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(DEMO_CONTRACTS);
  const [filter, setFilter] = useState<'all' | 'expiring' | 'active'>('all');
  const [search, setSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.vendor.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all'
        ? true
        : filter === 'expiring'
        ? c.daysRemaining <= 60
        : c.daysRemaining > 60;
    return matchSearch && matchFilter;
  });

  const expiringCount = contracts.filter((c) => c.daysRemaining <= 60).length;

  const handleRenew = (c: Contract) => {
    toast.success(`Renewal workflow initiated for "${c.title}"`);
    setContracts((prev) =>
      prev.map((item) =>
        item.id === c.id ? { ...item, status: 'under_renewal' } : item
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Contract Intelligence</h1>
            <span className="text-xs bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full border border-red-500/30 font-medium">
              AI Expiry Monitor
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Autonomous AI tracking for contract deadlines, SLA terms, and renewal notices
          </p>
        </div>
        <button
          onClick={() => toast.info('New contract intake form opened')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Contract
        </button>
      </div>

      {/* Critical Alert Banner */}
      {expiringCount > 0 && (
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-red-500/20 via-amber-500/15 to-transparent border border-red-500/30 rounded-2xl p-5 flex items-start gap-4 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">
                AI Expiry Alert: {expiringCount} Contract{expiringCount > 1 ? 's' : ''} Expiring Soon!
              </h3>
              <span className="text-[10px] bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full font-bold">
                ACTION REQUIRED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              KMRL AI Contract Intelligence detected contracts nearing expiration. Renewals should be initiated immediately to prevent operational disruptions or financial penalties.
            </p>
          </div>
          <button
            onClick={() => setFilter('expiring')}
            className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 text-red-200 border border-red-500/40 rounded-xl text-xs font-semibold transition-colors flex-shrink-0 cursor-pointer"
          >
            Review Expiring ({expiringCount})
          </button>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -2 }} className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Total Monitored</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">{contracts.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active vendor agreements</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-[#1f2937] border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-red-400 font-medium">Expiring &lt; 60 Days</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{expiringCount}</p>
          <p className="text-[11px] text-red-300/70 mt-1">Requires renewal action</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Total Portfolio Value</span>
            <Building2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">₹ 95.8 Cr</p>
          <p className="text-[11px] text-slate-500 mt-1">Under active management</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">AI Monitoring Status</span>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">100%</p>
          <p className="text-[11px] text-slate-500 mt-1">Continuous deadline check</p>
        </motion.div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          {(['all', 'expiring', 'active'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold transition-all border capitalize cursor-pointer',
                filter === f
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
              )}
            >
              {f === 'expiring' ? '⚠️ Expiring Soon' : f}
              <span className="ml-1.5 text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">
                {f === 'all'
                  ? contracts.length
                  : f === 'expiring'
                  ? expiringCount
                  : contracts.length - expiringCount}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vendor, contract title..."
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
          />
        </div>
      </div>

      {/* Contract Table */}
      <div className="bg-[#1f2937]/80 border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs font-medium text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-4">Contract Title & Vendor</th>
                <th className="px-4 py-4">Department</th>
                <th className="px-4 py-4">Value</th>
                <th className="px-4 py-4">Expiry Date</th>
                <th className="px-4 py-4">Days Left</th>
                <th className="px-4 py-4">AI Risk</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-sm">
              {filteredContracts.map((c) => (
                <motion.tr
                  key={c.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  className="transition-colors cursor-pointer"
                  onClick={() => setSelectedContract(c)}
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-white group-hover:text-sky-300 text-sm">
                        {c.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" /> {c.vendor}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-slate-300 bg-white/[0.05] px-2.5 py-1 rounded-lg">
                      {c.department}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-white text-xs whitespace-nowrap">
                    {c.contractValue}
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-300 whitespace-nowrap">
                    {formatDate(c.expiryDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit',
                        c.daysRemaining <= 14
                          ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                          : c.daysRemaining <= 60
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-green-500/20 text-green-400 border-green-500/30'
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {c.daysRemaining} days left
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border',
                        c.riskScore === 'critical'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : c.riskScore === 'high'
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          : 'bg-green-500/20 text-green-400 border-green-500/30'
                      )}
                    >
                      {c.riskScore}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenew(c);
                      }}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer',
                        c.status === 'under_renewal'
                          ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                          : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border-sky-500/30'
                      )}
                    >
                      {c.status === 'under_renewal' ? 'Renewal Pending' : 'Initiate Renewal'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract AI Inspection Drawer / Modal */}
      <AnimatePresence>
        {selectedContract && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1f2937] border border-white/10 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-sky-400 font-mono">CONTRACT ID: {selectedContract.id}</span>
                  <h3 className="font-bold text-white text-lg mt-1">{selectedContract.title}</h3>
                  <p className="text-xs text-slate-400">{selectedContract.vendor}</p>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-slate-500 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-black/30 p-4 rounded-xl border border-white/[0.06] text-xs">
                <div>
                  <span className="text-slate-500">Department</span>
                  <p className="font-semibold text-white mt-0.5">{selectedContract.department}</p>
                </div>
                <div>
                  <span className="text-slate-500">Contract Value</span>
                  <p className="font-semibold text-white mt-0.5">{selectedContract.contractValue}</p>
                </div>
                <div>
                  <span className="text-slate-500">Start Date</span>
                  <p className="font-semibold text-white mt-0.5">{formatDate(selectedContract.startDate)}</p>
                </div>
                <div>
                  <span className="text-slate-500">Expiry Date</span>
                  <p className="font-semibold text-red-400 mt-0.5">{formatDate(selectedContract.expiryDate)}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-4 rounded-xl border border-violet-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <h4 className="font-semibold text-white text-xs">AI Extracted Key Clause</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  "{selectedContract.keyClause}"
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedContract(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleRenew(selectedContract);
                    setSelectedContract(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Initiate Contract Extension
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
