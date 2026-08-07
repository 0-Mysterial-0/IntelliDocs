import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, FileText, Users, HardDrive, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import { analyticsApi } from '@/lib/api';

const COLORS = ['#ffffff', '#6ee7b7', '#fde047', '#fca5a5', '#a1a1aa', '#71717a'];

const MOCK_STATS = {
  total_documents: 1247,
  uploads_today: 23,
  pending_approvals: 18,
  duplicate_documents: 7,
  ocr_processed: 1182,
  ai_processed: 1089,
  storage_used_bytes: 52_428_800_000,
  storage_total_bytes: 107_374_182_400,
  active_users: 47,
  monthly_uploads: [
    { month: 'Mar', count: 145 }, { month: 'Apr', count: 178 },
    { month: 'May', count: 203 }, { month: 'Jun', count: 189 },
    { month: 'Jul', count: 234 }, { month: 'Aug', count: 298 },
  ],
  category_distribution: [
    { category: 'Finance', count: 234 }, { category: 'Operations', count: 312 },
    { category: 'HR', count: 156 }, { category: 'Safety', count: 189 },
    { category: 'Legal', count: 98 }, { category: 'Procurement', count: 178 },
    { category: 'Maintenance', count: 80 },
  ],
  department_activity: [
    { department: 'Operations', documents: 312, storage_gb: 12.3 },
    { department: 'Finance', documents: 234, storage_gb: 8.7 },
    { department: 'HR', documents: 156, storage_gb: 5.2 },
    { department: 'Maintenance', documents: 180, storage_gb: 7.1 },
    { department: 'Legal', documents: 98, storage_gb: 4.5 },
    { department: 'Procurement', documents: 267, storage_gb: 14.8 },
  ],
  approval_stats: { total: 234, approved: 189, rejected: 23, pending: 18, avg_decision_hours: 4.2 },
  recent_activity: [
    { user: 'Rajan Menon', action: 'Approved', document: 'Financial Statement Q2', time: '2 min ago' },
    { user: 'Priya Nair', action: 'Uploaded', document: 'HR Policy Update', time: '15 min ago' },
    { user: 'Arun Kumar', action: 'Commented on', document: 'Maintenance Schedule', time: '1 hr ago' },
  ],
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  idx: number;
}

function StatCard({ label, value, icon: Icon, trend, idx }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      className={cn(
        'pixel-box p-5 animate-pixel-float cursor-pointer',
        idx % 4 === 1 && 'float-delay-1',
        idx % 4 === 2 && 'float-delay-2',
        idx % 4 === 3 && 'float-delay-3'
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-5 h-5 text-white stroke-[2.5]" />
        {trend && (
          <span className="text-[10px] font-pixel-code font-bold badge-muted-green px-2 py-0.5 uppercase">{trend}</span>
        )}
      </div>
      <p className="text-3xl font-pixel-head font-extrabold text-white font-bloom tracking-tight">{value}</p>
      <p className="text-xs font-pixel-code text-zinc-400 font-bold uppercase mt-1 tracking-wider">{label}</p>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { data: stats = MOCK_STATS } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const resp = await analyticsApi.dashboard();
      return resp.data;
    },
    initialData: MOCK_STATS,
  });

  const storagePercent = Math.round((stats.storage_used_bytes / stats.storage_total_bytes) * 100);

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl mx-auto font-pixel"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-pixel-head font-bold text-white font-bloom">KMRL TELEMETRY ANALYTICS</h1>
        <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">REAL-TIME INTELLIGENCE & DOCUMENT MANAGEMENT INSIGHTS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Documents" value={stats.total_documents.toLocaleString()} icon={FileText} trend="+12%" idx={0} />
        <StatCard label="Uploads Today" value={stats.uploads_today} icon={TrendingUp} trend="+5" idx={1} />
        <StatCard label="Active Users" value={stats.active_users} icon={Users} idx={2} />
        <StatCard label="Pending Approvals" value={stats.pending_approvals} icon={Clock} idx={3} />
        <StatCard label="OCR Processed" value={stats.ocr_processed.toLocaleString()} icon={Zap} idx={4} />
        <StatCard label="AI Analysed" value={stats.ai_processed.toLocaleString()} icon={CheckCircle} idx={5} />
        <StatCard label="Duplicates Found" value={stats.duplicate_documents} icon={AlertCircle} idx={6} />
        <StatCard label="Avg Approval Time" value={`${stats.approval_stats.avg_decision_hours}h`} icon={Clock} idx={7} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Trend */}
        <div className="pixel-box p-6 min-h-[260px] animate-pixel-float float-delay-1">
          <h3 className="font-pixel-head font-bold text-white text-sm font-bloom-subtle mb-4">MONTHLY INGESTION TELEMETRY</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.monthly_uploads}>
              <defs>
                <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
              <XAxis dataKey="month" tick={{ fill: '#ffffff', fontSize: 11, fontFamily: 'Silkscreen' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff', fontSize: 11, fontFamily: 'Silkscreen' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Uploads" stroke="#ffffff" fill="url(#uploadGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="pixel-box p-6 min-h-[260px] animate-pixel-float float-delay-2">
          <h3 className="font-pixel-head font-bold text-white text-sm font-bloom-subtle mb-4">CATEGORY BREAKDOWN</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.category_distribution}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
              >
                {stats.category_distribution.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#000000" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(val) => <span className="text-xs font-pixel-code text-zinc-300 font-bold uppercase">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Activity */}
        <div className="pixel-box p-6 min-h-[260px] animate-pixel-float float-delay-3">
          <h3 className="font-pixel-head font-bold text-white text-sm font-bloom-subtle mb-4">DEPARTMENT VOLUME</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.department_activity} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#27272a" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#ffffff', fontSize: 11, fontFamily: 'Silkscreen' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="department" type="category" tick={{ fill: '#ffffff', fontSize: 11, fontFamily: 'Silkscreen' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="documents" name="Documents" fill="#ffffff" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Storage + Activity */}
        <div className="space-y-6">
          {/* Storage */}
          <div className="pixel-box p-5 animate-pixel-float font-pixel-code">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle">STORAGE TELEMETRY</h3>
              <span className="text-xs font-bold text-[#6ee7b7] font-bloom-green">{storagePercent}% USED</span>
            </div>
            <div className="h-3 bg-black border border-zinc-700 mb-2">
              <div className="h-full bg-white transition-all" style={{ width: `${storagePercent}%` }} />
            </div>
            <div className="flex justify-between text-xs text-zinc-400 uppercase font-bold">
              <span>{formatBytes(stats.storage_used_bytes)} USED</span>
              <span>{formatBytes(stats.storage_total_bytes)} CAPACITY</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="pixel-box p-5 animate-pixel-float float-delay-1">
            <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle mb-3">RECENT SYSTEM ACTIVITY</h3>
            <div className="space-y-2.5 font-pixel-code">
              {stats.recent_activity.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="w-1.5 h-1.5 bg-[#6ee7b7] animate-pulse" />
                  <span className="font-bold text-white uppercase">{a.user}</span>
                  <span className="uppercase">{a.action}</span>
                  <span className="truncate text-zinc-400 uppercase">{a.document}</span>
                  <span className="ml-auto flex-shrink-0 text-zinc-500">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
