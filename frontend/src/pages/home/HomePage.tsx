import { useNavigate } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Upload, Search, Bot, Shield, CheckSquare, BarChart3, Building2,
  Train, ArrowRight, Sparkles, Activity, Clock, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const MODULE_CARDS = [
  { label: 'SYSTEM DASHBOARD', desc: 'REAL-TIME TELEMETRY, ANALYTICS & RECENT INGESTION', icon: Activity, to: '/dashboard', badge: 'TELEMETRY' },
  { label: 'ENTERPRISE DOCUMENTS', desc: 'BROWSE, FILTER & MANAGED INDEXED METRO FILES', icon: FileText, to: '/documents', badge: '1,247 FILES' },
  { label: 'CONTRACTS SLA MONITOR', desc: 'AUTONOMOUS AI EXPIRY & RENEWAL TRACKING', icon: Shield, to: '/contracts', badge: '3 EXPIRING', urgent: true },
  { label: 'UPLOAD DOCUMENTS', desc: 'EASYOCR, AI CLASSIFICATION & SUMMARIZATION', icon: Upload, to: '/upload', badge: 'UPLOAD' },
  { label: 'PIXEL VECTOR SEARCH', desc: 'NATURAL LANGUAGE & FULL-TEXT CONVERTED OCR SEARCH', icon: Search, to: '/search', badge: 'SEARCH' },
  { label: 'AI ASSISTANT (RAG)', desc: 'CHAT WITH KMRL DOCUMENTS & EXTRACT CITATIONS', icon: Bot, to: '/ai-assistant', badge: 'AI CHAT' },
  { label: 'APPROVAL WORKFLOW', desc: 'REVIEW & DECIDE ON PENDING DOCUMENT APPROVALS', icon: CheckSquare, to: '/approvals', badge: '18 PENDING' },
  { label: 'ANALYTICS INSIGHTS', desc: 'DEPARTMENT DISTRIBUTION & STORAGE TELEMETRY', icon: BarChart3, to: '/analytics', badge: 'ANALYTICS' },
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

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-7xl mx-auto font-pixel"
    >
      {/* Hero Pixel Banner */}
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -3 }}
        className="pixel-box p-8 md:p-10 animate-pixel-float relative cursor-pointer"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#6ee7b7] animate-pulse border border-black" />
              <span className="text-xs font-pixel-head text-[#6ee7b7] font-bloom-green tracking-widest uppercase">
                KMRL METRO PIXEL v2 // SYSTEM HUB
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-pixel-head font-bold text-white font-bloom tracking-wider leading-tight">
              KMRL INTELLIDOCS PLATFORM
            </h1>
            <p className="text-zinc-300 text-xs md:text-sm max-w-2xl font-pixel leading-relaxed">
              KOCHI METRO RAIL LIMITED — EASYOCR CONVERSION, VECTOR SEARCH, AI CONTRACT SLA MONITORING & ENTERPRISE DOCUMENT INTELLIGENCE.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/dashboard')}
              className="pixel-btn-white flex items-center gap-2 text-sm"
            >
              <span>OPEN DASHBOARD</span>
              <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/ai-assistant')}
              className="pixel-btn-dark flex items-center gap-2 text-sm"
            >
              <Bot className="w-4 h-4 text-white stroke-[2.5]" />
              <span>AI ASSISTANT</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* System Quick Module Grid */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4 font-pixel-code">
          <h2 className="text-xs font-pixel-head font-bold text-white font-bloom-subtle tracking-widest">
            PLATFORM MODULES // QUICK ACCESS
          </h2>
          <span className="text-xs text-zinc-400">8 ACTIVE MODULES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MODULE_CARDS.map(({ label, desc, icon: Icon, to, badge, urgent }, idx) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.03, y: -5 }}
              onClick={() => navigate(to)}
              className={cn(
                'pixel-box p-5 cursor-pointer animate-pixel-float group hover:bg-zinc-900',
                idx % 4 === 1 && 'float-delay-1',
                idx % 4 === 2 && 'float-delay-2',
                idx % 4 === 3 && 'float-delay-3',
                urgent && 'border-[#f472b6] shadow-[3px_3px_0px_0px_#f472b6]'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-6 h-6 text-white stroke-[2.5]" />
                <span className={cn('text-[10px] font-pixel-code font-bold px-2 py-0.5 border uppercase', urgent ? 'badge-muted-pink font-bloom-pink' : 'bg-black text-white border-zinc-700')}>
                  {badge}
                </span>
              </div>
              <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle group-hover:text-[#6ee7b7] transition-colors flex items-center gap-1">
                {label}
                <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform ml-auto" />
              </h3>
              <p className="text-xs text-zinc-400 mt-2 font-pixel leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Real-time System Telemetry Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 font-pixel-code">
        <div className="pixel-box p-6 animate-pixel-float">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-300 uppercase">DOCUMENT CONVERSION</span>
            <Zap className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <p className="text-3xl font-pixel-head font-bold text-white font-bloom">1,182</p>
          <p className="text-xs text-zinc-400 mt-1 uppercase">FILES PROCESSED WITH EASYOCR (94.8% ACCURACY)</p>
        </div>

        <div className="pixel-box p-6 animate-pixel-float float-delay-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#f472b6] font-bloom-pink uppercase">CONTRACT SLA MONITOR</span>
            <Shield className="w-5 h-5 text-[#f472b6] stroke-[2.5]" />
          </div>
          <p className="text-3xl font-pixel-head font-bold text-[#f472b6] font-bloom-pink">3 CONTRACTS</p>
          <p className="text-xs text-zinc-400 mt-1 uppercase">EXPIRING IN LESS THAN 60 DAYS</p>
        </div>

        <div className="pixel-box p-6 animate-pixel-float float-delay-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6ee7b7] font-bloom-green uppercase">AI VECTOR ENGINE</span>
            <Sparkles className="w-5 h-5 text-[#6ee7b7] stroke-[2.5]" />
          </div>
          <p className="text-3xl font-pixel-head font-bold text-[#6ee7b7] font-bloom-green">ONLINE</p>
          <p className="text-xs text-zinc-400 mt-1 uppercase">OLLAMA LLAMA3 & GEMINI HYBRID RAG</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
