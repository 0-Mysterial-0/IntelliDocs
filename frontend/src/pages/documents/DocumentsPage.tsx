import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Search, Filter, Eye, Download, Star, CheckCircle, Clock, XCircle, MoreVertical, Plus } from 'lucide-react';
import { cn, formatDate, formatBytes, truncate } from '@/lib/utils';
import { MOCK_DOCUMENTS } from '@/data/mockData';

const CATEGORIES = ['All', 'Finance', 'HR', 'Operations', 'Maintenance', 'Legal', 'Procurement', 'Safety'];
const STATUSES = ['All', 'approved', 'pending', 'draft', 'rejected'];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ElementType; className: string }> = {
    approved: { icon: CheckCircle, className: 'bg-green-500/15 text-green-400 border-green-500/20' },
    pending: { icon: Clock, className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
    rejected: { icon: XCircle, className: 'bg-red-500/15 text-red-400 border-red-500/20' },
    draft: { icon: FileText, className: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
  };
  const { icon: Icon, className } = config[status] || config.draft;
  return (
    <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', className)}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-sky-500',
  };
  return <span className={cn('w-2 h-2 rounded-full flex-shrink-0', colors[priority] || colors.medium)} title={priority} />;
}

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [view, setView] = useState<'table' | 'grid'>('table');

  const docs = MOCK_DOCUMENTS.filter((d) => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.department.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || d.category === category;
    const matchStatus = status === 'All' || d.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-slate-400 text-sm mt-1">{docs.length} of {MOCK_DOCUMENTS.length} documents</p>
        </div>
        <button onClick={() => navigate('/upload')} className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, department..."
            className="w-full pl-11 pr-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={cn('px-3 py-1 rounded-lg text-xs font-medium border transition-all', category === c ? 'bg-sky-500/15 text-sky-400 border-sky-500/20' : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-sky-500/20')}>
                {c}
              </button>
            ))}
          </div>
          <div className="ml-4 flex gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={cn('px-3 py-1 rounded-lg text-xs font-medium border transition-all capitalize', status === s ? 'bg-violet-500/15 text-violet-400 border-violet-500/20' : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-violet-500/20')}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1f2937]/60 border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Document', 'Category', 'Status', 'Priority', 'Department', 'Uploaded', 'Size', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                    No documents match your filters
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-sky-300 transition-colors truncate max-w-[200px]">{doc.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">By {doc.uploadedBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-slate-300 bg-white/[0.06] px-2 py-1 rounded-lg">{doc.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <PriorityDot priority={doc.priority} />
                        <span className="text-xs text-slate-400 capitalize">{doc.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400 whitespace-nowrap">{doc.department}</td>
                    <td className="px-4 py-4 text-sm text-slate-400 whitespace-nowrap">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-4 text-sm text-slate-400 whitespace-nowrap">{formatBytes(doc.fileSize)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/documents/${doc.id}`); }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-yellow-400 transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Star className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-sky-400 transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
