import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, FileText, Users, HardDrive, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';
import { analyticsApi } from '@/lib/api';

const COLORS = ['#0ea5e9', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

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
  color?: string;
}

function StatCard({ label, value, icon: Icon, trend, color = 'sky' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    sky: 'bg-sky-500/10 text-sky-400',
    green: 'bg-green-500/10 text-green-400',
    violet: 'bg-violet-500/10 text-violet-400',
    amber: 'bg-amber-500/10 text-amber-400',
    red: 'bg-red-500/10 text-red-400',
    cyan: 'bg-cyan-500/10 text-cyan-400',
  };

  return (
    <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">{trend}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
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
      <div className="bg-[#1f2937] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Document management insights for KMRL IntelliDocs</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Documents" value={stats.total_documents.toLocaleString()} icon={FileText} trend="+12%" color="sky" />
        <StatCard label="Uploads Today" value={stats.uploads_today} icon={TrendingUp} trend="+5" color="green" />
        <StatCard label="Active Users" value={stats.active_users} icon={Users} color="violet" />
        <StatCard label="Pending Approvals" value={stats.pending_approvals} icon={Clock} color="amber" />
        <StatCard label="OCR Processed" value={stats.ocr_processed.toLocaleString()} icon={Zap} color="cyan" />
        <StatCard label="AI Analysed" value={stats.ai_processed.toLocaleString()} icon={CheckCircle} color="green" />
        <StatCard label="Duplicates Found" value={stats.duplicate_documents} icon={AlertCircle} color="red" />
        <StatCard label="Avg Approval Time" value={`${stats.approval_stats.avg_decision_hours}h`} icon={Clock} color="sky" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Trend */}
        <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5">Monthly Uploads</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats.monthly_uploads}>
              <defs>
                <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Uploads" stroke="#0ea5e9" fill="url(#uploadGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.category_distribution}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {stats.category_distribution.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(val) => <span className="text-xs text-slate-400">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Activity */}
        <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-5">Department Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.department_activity} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="department" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="documents" name="Documents" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Storage + Approval Stats */}
        <div className="space-y-4">
          {/* Storage */}
          <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white text-sm">Storage Usage</h3>
              <span className="text-xs text-slate-400">{storagePercent}%</span>
            </div>
            <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{formatBytes(stats.storage_used_bytes)} used</span>
              <span>{formatBytes(stats.storage_total_bytes)} total</span>
            </div>
          </div>

          {/* Approval Funnel */}
          <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4">Approval Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Approved', val: stats.approval_stats.approved, color: 'bg-green-500', total: stats.approval_stats.total },
                { label: 'Pending', val: stats.approval_stats.pending, color: 'bg-yellow-500', total: stats.approval_stats.total },
                { label: 'Rejected', val: stats.approval_stats.rejected, color: 'bg-red-500', total: stats.approval_stats.total },
              ].map(({ label, val, color, total }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white font-medium">{val}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${Math.round((val / total) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {stats.recent_activity.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full flex-shrink-0" />
                  <span className="font-medium text-slate-300">{a.user}</span>
                  <span>{a.action}</span>
                  <span className="truncate text-slate-500">{a.document}</span>
                  <span className="ml-auto flex-shrink-0 text-slate-600">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
