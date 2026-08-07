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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-6xl mx-auto font-pixel"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-white stroke-[2.5]" />
            <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">CONTRACT INTELLIGENCE</h1>
            <span className="text-xs font-pixel-code font-bold badge-muted-red px-2.5 py-0.5 uppercase">
              AI EXPIRY MONITOR
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">
            AUTONOMOUS AI TRACKING FOR CONTRACT DEADLINES, SLA TERMS, AND RENEWAL NOTICES
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={() => toast.info('New contract intake form opened')}
          className="pixel-btn-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>ADD CONTRACT</span>
        </motion.button>
      </div>

      {/* Critical Alert Banner */}
      {expiringCount > 0 && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="pixel-box p-5 animate-pixel-float flex items-start gap-4"
        >
          <ShieldAlert className="w-7 h-7 text-[#fca5a5] flex-shrink-0 stroke-[2.5] mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-pixel-head text-xs font-bold text-white font-bloom-red">
                AI EXPIRY ALERT: {expiringCount} CONTRACT{expiringCount > 1 ? 'S' : ''} EXPIRING SOON!
              </h3>
              <span className="text-[10px] font-pixel-code font-bold badge-muted-red px-2 py-0.5">
                ACTION REQUIRED
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 font-pixel leading-relaxed">
              KMRL AI CONTRACT INTELLIGENCE DETECTED CONTRACTS NEARING EXPIRATION. RENEWALS SHOULD BE INITIATED IMMEDIATELY TO PREVENT DISRUPTIONS.
            </p>
          </div>
          <button
            onClick={() => setFilter('expiring')}
            className="pixel-btn-dark text-xs flex-shrink-0"
          >
            REVIEW EXPIRING ({expiringCount})
          </button>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.03, y: -4 }} className="pixel-box p-5 animate-pixel-float cursor-pointer">
          <div className="flex items-center justify-between mb-3 font-pixel-code">
            <span className="text-xs font-bold text-zinc-300 uppercase">MONITORED</span>
            <FileText className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <p className="text-3xl font-pixel-head font-extrabold text-white font-bloom">{contracts.length}</p>
          <p className="text-[10px] font-pixel-code text-zinc-400 mt-1 uppercase">ACTIVE VENDOR SLAS</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03, y: -4 }} className="pixel-box p-5 animate-pixel-float float-delay-1 cursor-pointer">
          <div className="flex items-center justify-between mb-3 font-pixel-code">
            <span className="text-xs font-bold text-[#fca5a5] uppercase">EXPIRING &lt; 60 DAYS</span>
            <AlertTriangle className="w-4 h-4 text-[#fca5a5] stroke-[2.5]" />
          </div>
          <p className="text-3xl font-pixel-head font-extrabold text-[#fca5a5] font-bloom-red">{expiringCount}</p>
          <p className="text-[10px] font-pixel-code text-zinc-400 mt-1 uppercase">REQUIRES RENEWAL</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03, y: -4 }} className="pixel-box p-5 animate-pixel-float float-delay-2 cursor-pointer">
          <div className="flex items-center justify-between mb-3 font-pixel-code">
            <span className="text-xs font-bold text-zinc-300 uppercase">PORTFOLIO VALUE</span>
            <Building2 className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <p className="text-3xl font-pixel-head font-extrabold text-white font-bloom">₹ 95.8 Cr</p>
          <p className="text-[10px] font-pixel-code text-zinc-400 mt-1 uppercase">ACTIVE MANAGEMENT</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03, y: -4 }} className="pixel-box p-5 animate-pixel-float float-delay-3 cursor-pointer">
          <div className="flex items-center justify-between mb-3 font-pixel-code">
            <span className="text-xs font-bold text-[#6ee7b7] uppercase">AI MONITORING</span>
            <Sparkles className="w-4 h-4 text-[#6ee7b7] stroke-[2.5]" />
          </div>
          <p className="text-3xl font-pixel-head font-extrabold text-[#6ee7b7] font-bloom-green">100%</p>
          <p className="text-[10px] font-pixel-code text-zinc-400 mt-1 uppercase">CONTINUOUS DEADLINE CHECK</p>
        </motion.div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap font-pixel-code">
        <div className="flex gap-2">
          {(['all', 'expiring', 'active'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 border text-xs font-bold uppercase transition-all flex items-center gap-1.5',
                filter === f
                  ? f === 'expiring'
                    ? 'pixel-box-pink text-[#f472b6] font-bloom-pink border-[#f472b6]'
                    : 'bg-white text-black border-white shadow-[2px_2px_0px_0px_#ffffff]'
                  : f === 'expiring'
                  ? 'badge-muted-pink font-bloom-pink hover:border-[#f472b6]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-white hover:text-white'
              )}
            >
              <span>{f === 'expiring' ? 'EXPIRING SOON' : f}</span>
              <span className={cn(
                'text-[10px] px-1.5 border font-bold',
                f === 'expiring' ? 'bg-black/50 text-[#f472b6] border-[#f472b6]/40' : 'bg-black text-zinc-300 border-zinc-700'
              )}>
                {f === 'all'
                  ? contracts.length
                  : f === 'expiring'
                  ? expiringCount
                  : contracts.length - expiringCount}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs font-pixel">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 stroke-[2.5]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH VENDOR, TITLE..."
            className="w-full pl-9 pr-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase"
          />
        </div>
      </div>

      {/* Contract Table */}
      <div className="pixel-box overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-pixel">
            <thead>
              <tr className="border-b-2 border-[#27272a] bg-black font-pixel-head text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <th className="px-5 py-4">CONTRACT TITLE & VENDOR</th>
                <th className="px-4 py-4">DEPARTMENT</th>
                <th className="px-4 py-4">VALUE</th>
                <th className="px-4 py-4">EXPIRY DATE</th>
                <th className="px-4 py-4">DAYS LEFT</th>
                <th className="px-4 py-4">AI RISK</th>
                <th className="px-4 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#27272a]">
              {filteredContracts.map((c) => (
                <motion.tr
                  key={c.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  className="transition-colors cursor-pointer"
                  onClick={() => setSelectedContract(c)}
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-pixel-head font-bold text-white text-xs group-hover:text-[#6ee7b7] transition-colors font-bloom-subtle">
                        {c.title}
                      </p>
                      <p className="text-xs font-pixel-code text-zinc-400 mt-0.5 flex items-center gap-1 uppercase">
                        <Building2 className="w-3 h-3 text-zinc-400 stroke-[2]" /> {c.vendor}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-pixel-code text-white bg-black border border-zinc-700 px-2 py-0.5 uppercase">
                      {c.department}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-pixel-code font-bold text-white text-xs whitespace-nowrap">
                    {c.contractValue}
                  </td>
                  <td className="px-4 py-4 text-xs font-pixel-code text-zinc-300 whitespace-nowrap">
                    {formatDate(c.expiryDate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap font-pixel-code">
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-bold border uppercase flex items-center gap-1 w-fit',
                        c.daysRemaining <= 14
                          ? 'badge-muted-red font-bloom-red animate-pulse'
                          : c.daysRemaining <= 60
                          ? 'badge-muted-amber font-bloom-amber'
                          : 'badge-muted-green font-bloom-green'
                      )}
                    >
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      {c.daysRemaining} DAYS LEFT
                    </span>
                  </td>
                  <td className="px-4 py-4 font-pixel-code">
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 font-bold uppercase border',
                        c.riskScore === 'critical'
                          ? 'badge-muted-red font-bloom-red'
                          : c.riskScore === 'high'
                          ? 'badge-muted-amber font-bloom-amber'
                          : 'badge-muted-green font-bloom-green'
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
                        'pixel-btn-white text-xs',
                        c.status === 'under_renewal' && 'bg-black text-white border-zinc-700'
                      )}
                    >
                      {c.status === 'under_renewal' ? 'PENDING' : 'RENEW'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract AI Inspection Modal */}
      <AnimatePresence>
        {selectedContract && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-pixel">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="pixel-box p-6 w-full max-w-xl space-y-5 bg-black border-2 border-white"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-pixel-code text-zinc-400 uppercase">CONTRACT ID: {selectedContract.id}</span>
                  <h3 className="font-pixel-head font-bold text-white text-sm font-bloom mt-1">{selectedContract.title}</h3>
                  <p className="text-xs font-pixel-code text-zinc-400 uppercase">{selectedContract.vendor}</p>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-zinc-900 p-4 border border-zinc-700 text-xs font-pixel-code">
                <div>
                  <span className="text-zinc-400 uppercase">Department</span>
                  <p className="font-bold text-white uppercase mt-0.5">{selectedContract.department}</p>
                </div>
                <div>
                  <span className="text-zinc-400 uppercase">Contract Value</span>
                  <p className="font-bold text-white mt-0.5">{selectedContract.contractValue}</p>
                </div>
                <div>
                  <span className="text-zinc-400 uppercase">Start Date</span>
                  <p className="font-bold text-white mt-0.5">{formatDate(selectedContract.startDate)}</p>
                </div>
                <div>
                  <span className="text-zinc-400 uppercase">Expiry Date</span>
                  <p className="font-bold text-[#fca5a5] font-bloom-red mt-0.5">{formatDate(selectedContract.expiryDate)}</p>
                </div>
              </div>

              <div className="pixel-box p-4 space-y-2 bg-black border-2 border-zinc-700">
                <div className="flex items-center gap-2 font-pixel-head">
                  <Sparkles className="w-4 h-4 text-white stroke-[2.5]" />
                  <h4 className="font-bold text-white text-xs font-bloom">AI EXTRACTED KEY CLAUSE</h4>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-pixel-code">
                  "{selectedContract.keyClause}"
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedContract(null)}
                  className="pixel-btn-dark flex-1"
                >
                  CLOSE
                </button>
                <button
                  onClick={() => {
                    handleRenew(selectedContract);
                    setSelectedContract(null);
                  }}
                  className="pixel-btn-white flex-1"
                >
                  INITIATE EXTENSION
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
