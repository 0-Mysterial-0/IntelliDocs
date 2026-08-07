import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FileText, Upload, Search, Bot, HardDrive, Clock, ArrowRight, ChevronRight, Zap,
  ShieldAlert, Copy
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { MOCK_ANALYTICS, MOCK_DOCUMENTS } from '@/data/mockData';

const STAT_CARDS = [
  { label: 'Total Documents', value: '1,247', icon: FileText, trend: '+12%', color: 'sky' },
  { label: 'Uploads Today', value: '23', icon: Upload, trend: '+5', color: 'green' },
  { label: 'Pending Approvals', value: '18', icon: Clock, trend: '3 urgent', color: 'amber', urgent: true },
  { label: 'Expiring Contracts', value: '3', icon: ShieldAlert, trend: '< 60 days', color: 'red', urgent: true },
  { label: 'OCR Processed', value: '1,182', icon: Zap, trend: '94.8%', color: 'cyan' },
  { label: 'Storage Used', value: '48.8 GB', icon: HardDrive, trend: '48%', color: 'sky' },
  { label: 'Duplicates Flagged', value: '7', icon: Copy, trend: 'Prevented', color: 'amber' },
  { label: 'AI Summaries', value: '1,089', icon: Bot, trend: '87.3%', color: 'violet' },
];

const COLOR_MAP: Record<string, string> = {
  sky: 'bg-sky-500/10 text-sky-400',
  green: 'bg-green-500/10 text-green-400',
  amber: 'bg-amber-500/10 text-amber-400',
  violet: 'bg-violet-500/10 text-violet-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
  red: 'bg-red-500/10 text-red-400',
};

const QUICK_ACTIONS = [
  { label: 'Contract Intelligence', desc: 'Monitor deadlines & renewals', icon: ShieldAlert, to: '/contracts', color: 'from-red-500 to-amber-600' },
  { label: 'Upload Document', desc: 'Drop files for AI processing', icon: Upload, to: '/upload', color: 'from-sky-500 to-sky-600' },
  { label: 'AI Assistant (RAG)', desc: 'Chat with your documents', icon: Bot, to: '/ai-assistant', color: 'from-violet-500 to-indigo-600' },
  { label: 'Semantic Search', desc: 'Natural language search', icon: Search, to: '/search', color: 'from-emerald-500 to-green-600' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1f2937] border border-white/10 rounded-xl px-3 py-2 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-transparent border border-sky-500/20 rounded-2xl p-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">System Online & Active</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Good morning, {user?.full_name?.split(' ')[0] || 'User'}! 👋
          </h2>
          <p className="text-slate-400 text-sm mt-1">KMRL IntelliDocs — AI-powered document intelligence & contract monitoring platform</p>
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-400 flex-wrap">
            <span>📄 1,247 documents indexed</span>
            <span>⚡ EasyOCR Engine: Active</span>
            <span>🤖 AI Chat & RAG: Online</span>
            <span>📜 Contract Expiry Monitor: Running</span>
          </div>
        </div>
      </motion.div>

      {/* Contract Expiry & Duplicate Intelligence Alert Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contract Intelligence Alert */}
        <div
          onClick={() => navigate('/contracts')}
          className="bg-gradient-to-r from-red-500/15 via-amber-500/10 to-transparent border border-red-500/30 rounded-2xl p-4 cursor-pointer hover:border-red-500/50 transition-all flex items-start gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs group-hover:text-red-300 transition-colors">
                Contract Intelligence Alert
              </h3>
              <span className="text-[10px] bg-red-500/30 text-red-300 px-2 py-0.5 rounded-full font-bold">
                3 Expiring
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
              Rolling Stock Maintenance SLA expires in <strong className="text-red-400">23 days</strong>. IT Infrastructure SLA expires in <strong className="text-red-400">3 days</strong>.
            </p>
          </div>
        </div>

        {/* Duplicate Detection Alert */}
        <div
          onClick={() => navigate('/search')}
          className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 cursor-pointer hover:border-amber-500/50 transition-all flex items-start gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Copy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs group-hover:text-amber-300 transition-colors">
                AI Duplicate Detection
              </h3>
              <span className="text-[10px] bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                7 Flagged
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
              Possible duplicate detected: <strong className="text-amber-300">"Revenue_Report_Q2.pdf"</strong> matches an existing file with 94.2% similarity.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, trend, color, urgent }) => (
          <motion.div
            key={label}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={cn('bg-[#1f2937] border rounded-2xl p-4 hover:border-white/10 transition-all shadow-md', urgent ? 'border-amber-500/20' : 'border-white/[0.06]')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', COLOR_MAP[color])}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', urgent ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-400')}>{trend}</span>
            </div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, desc, icon: Icon, to, color }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(to)}
              className="group relative bg-white/[0.03] border border-white/[0.06] hover:border-white/10 rounded-2xl p-4 text-left transition-all hover:shadow-lg overflow-hidden cursor-pointer"
            >
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity', color)} />
              <div className={cn('w-9 h-9 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br text-white', color)}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              <ChevronRight className="absolute right-4 top-4 w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Uploads Trend */}
        <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 min-h-[220px]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white text-sm">Document Upload Trend</h3>
            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">↑ 27%</span>
          </div>
          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ANALYTICS.monthly_uploads}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Uploads" stroke="#0ea5e9" fill="url(#grad1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 min-h-[220px]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white text-sm">Category Distribution</h3>
          </div>
          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ANALYTICS.category_distribution} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Documents" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Recent Documents */}
      <motion.div variants={itemVariants} className="bg-[#1f2937] border border-white/[0.06] rounded-2xl overflow-hidden shadow-md">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
          <h3 className="font-semibold text-white text-sm">Recent Documents</h3>
          <button onClick={() => navigate('/documents')} className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {MOCK_DOCUMENTS.slice(0, 5).map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors group"
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-sky-300 transition-colors">{doc.title}</p>
                <p className="text-xs text-slate-500">{doc.department} · {formatRelativeTime(doc.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-500 bg-white/[0.05] px-2 py-0.5 rounded-lg">{doc.category}</span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', {
                  'bg-green-500/20 text-green-400 border-green-500/30': doc.status === 'approved',
                  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30': doc.status === 'pending',
                  'bg-red-500/20 text-red-400 border-red-500/30': doc.status === 'rejected',
                  'bg-slate-500/20 text-slate-400 border-slate-500/30': doc.status === 'draft',
                })}>
                  {doc.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
