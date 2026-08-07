import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  FileText, Upload, Search, Bot, HardDrive, Clock, ArrowRight, ChevronRight, Zap,
  ShieldAlert, Copy, Activity, Sparkles
} from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { MOCK_ANALYTICS, MOCK_DOCUMENTS } from '@/data/mockData';

const STAT_CARDS = [
  { label: 'TOTAL DOCUMENTS', value: '1,247', icon: FileText, trend: '+12.4%', metric: 'INDEXED' },
  { label: 'UPLOADS TODAY', value: '23', icon: Upload, trend: '+5 NEW', metric: 'FILES' },
  { label: 'PENDING APPROVALS', value: '18', icon: Clock, trend: '3 URGENT', urgent: true, metric: 'ACTION REQ' },
  { label: 'EXPIRING CONTRACTS', value: '3', icon: ShieldAlert, trend: '< 60 DAYS', urgent: true, metric: 'CRITICAL' },
  { label: 'OCR PROCESSED', value: '1,182', icon: Zap, trend: '94.8%', metric: 'ACCURACY' },
  { label: 'STORAGE USED', value: '48.8 GB', icon: HardDrive, trend: '48%', metric: 'ACTIVE' },
  { label: 'AI DUPLICATES', value: '7', icon: Copy, trend: 'PREVENTED', metric: 'FLAGGED' },
  { label: 'AI SUMMARIES', value: '1,089', icon: Bot, trend: '87.3%', metric: 'AUTO' },
];

const QUICK_ACTIONS = [
  { label: 'CONTRACT SLA MONITOR', desc: 'MONITOR SLA DEADLINES & RENEWALS', icon: ShieldAlert, to: '/contracts', badge: '3 EXPIRING' },
  { label: 'UPLOAD STUDIO', desc: 'DROP FILES FOR EASYOCR & AI EXTRACTION', icon: Upload, to: '/upload', badge: 'UPLOAD' },
  { label: 'AI ASSISTANT (RAG)', desc: 'CHAT WITH KMRL DOCS & GET CITATIONS', icon: Bot, to: '/ai-assistant', badge: 'AI CHAT' },
  { label: 'PIXEL DEEP SEARCH', desc: 'NATURAL LANGUAGE VECTOR SEARCH', icon: Search, to: '/search', badge: 'SEARCH' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-black border-2 border-white p-3 font-pixel-code shadow-[3px_3px_0px_0px_#ffffff]">
        <p className="text-zinc-400 text-xs mb-1 uppercase font-bold">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-bold text-white font-bloom-subtle">
            {p.name}: <span className="text-[#6ee7b7] font-bloom-green">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl mx-auto font-pixel"
    >
      {/* Header Pixel Banner */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -3 }}
        className="pixel-box p-6 md:p-8 animate-pixel-float relative cursor-pointer"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#6ee7b7] animate-pulse border border-black" />
              <span className="text-xs font-pixel-head text-[#6ee7b7] font-bloom-green tracking-widest">
                KMRL ENTERPRISE METRO SYSTEM // ONLINE
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-pixel-head font-bold text-white font-bloom tracking-wider">
              WELCOME BACK, {user?.full_name?.split(' ')[0] || 'USER'}!
            </h1>
            <p className="text-zinc-300 text-xs md:text-sm max-w-2xl font-pixel leading-relaxed">
              KOCHI METRO RAIL LIMITED — EASYOCR PIXEL ENGINE & AI DOCUMENT INTELLIGENCE HUB.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/upload')}
              className="pixel-btn-white flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-black stroke-[3]" />
              <span>UPLOAD FILES</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/ai-assistant')}
              className="pixel-btn-dark flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-white stroke-[2.5]" />
              <span>LAUNCH AI</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Floating Intelligence Alerts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Intelligence */}
        <motion.div
          whileHover={{ scale: 1.015, y: -4 }}
          onClick={() => navigate('/contracts')}
          className="pixel-box p-5 cursor-pointer animate-pixel-float float-delay-1 group"
        >
          <div className="flex items-start gap-4">
            <ShieldAlert className="w-7 h-7 text-[#fca5a5] flex-shrink-0 stroke-[2.5] mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel-head text-xs font-bold text-white font-bloom-red group-hover:text-[#fca5a5] transition-colors">
                  CONTRACT SLA ALERT
                </h3>
                <span className="text-[10px] font-pixel-code font-bold badge-muted-red px-2 py-0.5">
                  3 EXPIRING
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-2 font-pixel leading-relaxed">
                ROLLING STOCK SLA EXPIRES IN <strong className="text-[#fca5a5] font-bloom-red">23 DAYS</strong>. IT INFRASTRUCTURE SLA EXPIRES IN <strong className="text-[#fca5a5] font-bloom-red">3 DAYS</strong>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* AI Duplicate Detection */}
        <motion.div
          whileHover={{ scale: 1.015, y: -4 }}
          onClick={() => navigate('/search')}
          className="pixel-box p-5 cursor-pointer animate-pixel-float float-delay-2 group"
        >
          <div className="flex items-start gap-4">
            <Copy className="w-7 h-7 text-[#fde047] flex-shrink-0 stroke-[2.5] mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel-head text-xs font-bold text-white font-bloom-amber group-hover:text-[#fde047] transition-colors">
                  AI DUPLICATE DETECTED
                </h3>
                <span className="text-[10px] font-pixel-code font-bold badge-muted-amber px-2 py-0.5">
                  7 FLAGGED
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-2 font-pixel leading-relaxed">
                DUPLICATE ALERT: <strong className="text-[#fde047] font-bloom-amber">"REVENUE_REPORT_Q2.PDF"</strong> MATCHES EXISTING FILE WITH 94.2% VECTOR SIMILARITY.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Animated Telemetry Metrics Grid */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-pixel-head font-bold text-white font-bloom-subtle tracking-widest">
            SYSTEM TELEMETRY // REAL-TIME METRICS
          </h2>
          <span className="text-xs font-pixel-code text-zinc-400">FPS: 60 // PING: 12ms</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STAT_CARDS.map(({ label, value, icon: Icon, trend, urgent, metric }, idx) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'pixel-box p-5 animate-pixel-float cursor-pointer',
                idx % 4 === 1 && 'float-delay-1',
                idx % 4 === 2 && 'float-delay-2',
                idx % 4 === 3 && 'float-delay-3',
                urgent && 'border-[#fde047]/40 shadow-[3px_3px_0px_0px_rgba(253,224,71,0.3)]'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-6 h-6 text-white stroke-[2.5]" />
                <span className={cn('text-[10px] font-pixel-code font-bold px-2 py-0.5 border', urgent ? 'badge-muted-amber' : 'bg-black text-white border-zinc-700')}>
                  {trend}
                </span>
              </div>
              <p className="text-3xl font-pixel-head font-extrabold text-white font-bloom tracking-tight">{value}</p>
              <div className="flex items-center justify-between mt-2 font-pixel-code">
                <p className="text-xs text-zinc-300 font-bold uppercase tracking-wider">{label}</p>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">{metric}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Studio Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xs font-pixel-head font-bold text-white font-bloom-subtle tracking-widest mb-4">
          QUICK ACTIONS // PIXEL MODULES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUICK_ACTIONS.map(({ label, desc, icon: Icon, to, badge }, idx) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.03, y: -4 }}
              onClick={() => navigate(to)}
              className={cn(
                'pixel-box p-5 cursor-pointer animate-pixel-float group hover:bg-zinc-900',
                idx % 4 === 1 && 'float-delay-1',
                idx % 4 === 2 && 'float-delay-2',
                idx % 4 === 3 && 'float-delay-3'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-6 h-6 text-white stroke-[2.5]" />
                <span className="text-[10px] font-pixel-code font-bold px-2 py-0.5 bg-black text-white border border-zinc-700">
                  {badge}
                </span>
              </div>
              <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle group-hover:text-[#6ee7b7] transition-colors flex items-center gap-1">
                {label}
                <ChevronRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-zinc-400 mt-2 font-pixel">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uploads Trend */}
        <div className="pixel-box p-6 min-h-[260px] animate-pixel-float float-delay-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-pixel-head font-bold text-white text-sm font-bloom-subtle">DOCUMENT INGESTION TREND</h3>
              <p className="text-xs font-pixel-code text-zinc-400 mt-0.5 uppercase">MONTHLY VOLUME TELEMETRY</p>
            </div>
            <span className="text-xs font-pixel-code font-bold badge-muted-green px-2.5 py-1">
              ↑ 27% MoM
            </span>
          </div>
          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ANALYTICS.monthly_uploads}>
                <defs>
                  <linearGradient id="pixelGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
                <XAxis dataKey="month" tick={{ fill: '#ffffff', fontSize: 11, fontFamily: 'Silkscreen' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#ffffff', fontSize: 11, fontFamily: 'Silkscreen' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Uploads" stroke="#ffffff" fill="url(#pixelGrad1)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="pixel-box p-6 min-h-[260px] animate-pixel-float float-delay-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-pixel-head font-bold text-white text-sm font-bloom-subtle">DEPARTMENT DISTRIBUTION</h3>
              <p className="text-xs font-pixel-code text-zinc-400 mt-0.5 uppercase">DOCUMENTS BY DEPARTMENT</p>
            </div>
            <span className="text-xs font-pixel-code text-zinc-300 font-bold">6 DEPARTMENTS</span>
          </div>
          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ANALYTICS.category_distribution} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#27272a" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#ffffff', fontSize: 11, fontFamily: 'Silkscreen' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fill: '#ffffff', fontSize: 11, fontFamily: 'Silkscreen' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Documents" fill="#ffffff" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Recent Documents Table */}
      <motion.div variants={itemVariants} className="pixel-box overflow-hidden animate-pixel-float float-delay-3">
        <div className="flex items-center justify-between p-6 border-b-2 border-[#27272a]">
          <div>
            <h3 className="font-pixel-head font-bold text-white text-base font-bloom-subtle">RECENT ENTERPRISE DOCUMENTS</h3>
            <p className="text-xs font-pixel-code text-zinc-400 mt-0.5 uppercase">LATEST INDEXED FILES</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate('/documents')}
            className="pixel-btn-white flex items-center gap-1.5"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </motion.button>
        </div>

        <div className="divide-y-2 divide-[#27272a]">
          {MOCK_DOCUMENTS.slice(0, 5).map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              onClick={() => navigate(`/documents/${doc.id}`)}
              className="flex items-center justify-between px-6 py-4 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <FileText className="w-6 h-6 text-white stroke-[2.5] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0 font-pixel">
                  <p className="text-sm font-pixel-head font-bold text-white truncate group-hover:text-[#6ee7b7] transition-colors font-bloom-subtle">
                    {doc.title}
                  </p>
                  <p className="text-xs font-pixel-code text-zinc-400 mt-0.5 uppercase">
                    {doc.department} · INDEXED {formatRelativeTime(doc.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-4 font-pixel-code">
                <span className="text-xs font-bold text-white bg-black border-2 border-zinc-700 px-3 py-1 uppercase hidden sm:block">
                  {doc.category}
                </span>
                <span
                  className={cn(
                    'text-xs font-bold px-3 py-1 border uppercase',
                    doc.status === 'approved' && 'badge-muted-green font-bloom-green',
                    doc.status === 'pending' && 'badge-muted-amber font-bloom-amber',
                    doc.status === 'rejected' && 'badge-muted-red font-bloom-red',
                    doc.status === 'draft' && 'bg-black text-zinc-400 border-zinc-700'
                  )}
                >
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
