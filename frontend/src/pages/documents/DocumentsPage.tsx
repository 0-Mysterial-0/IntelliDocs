import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Eye, Download, Star, CheckCircle, Clock, XCircle, MoreVertical, Plus } from 'lucide-react';
import { cn, formatDate, formatBytes, truncate } from '@/lib/utils';
import { MOCK_DOCUMENTS } from '@/data/mockData';
import { useUploadedDocsStore } from '@/store/uploadedDocsStore';

const CATEGORIES = ['All', 'Finance', 'HR', 'Operations', 'Maintenance', 'Legal', 'Procurement', 'Safety'];
const STATUSES = ['All', 'approved', 'pending', 'draft', 'rejected'];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ElementType; className: string }> = {
    approved: { icon: CheckCircle, className: 'badge-muted-green font-bloom-green' },
    pending: { icon: Clock, className: 'badge-muted-amber font-bloom-amber' },
    rejected: { icon: XCircle, className: 'badge-muted-red font-bloom-red' },
    draft: { icon: FileText, className: 'bg-black text-zinc-400 border-zinc-700' },
  };
  const { icon: Icon, className } = config[status] || config.draft;
  return (
    <span className={cn('flex items-center gap-1.5 px-2.5 py-0.5 border uppercase font-pixel-code font-bold text-xs', className)}>
      <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
      {status}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-[#fca5a5]',
    high: 'bg-[#fde047]',
    medium: 'bg-[#6ee7b7]',
    low: 'bg-zinc-400',
  };
  return <span className={cn('w-2 h-2 flex-shrink-0', colors[priority] || colors.medium)} title={priority} />;
}

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const { uploadedDocs } = useUploadedDocsStore();

  const allDocs = [...uploadedDocs, ...MOCK_DOCUMENTS];

  const docs = allDocs.filter((d) => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.department.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || d.category === category;
    const matchStatus = status === 'All' || d.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto font-pixel"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-pixel-head font-bold text-white font-bloom">ENTERPRISE DOCUMENTS</h1>
          <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">{docs.length} OF {allDocs.length} INDEXED FILES</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={() => navigate('/upload')}
          className="pixel-btn-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>UPLOAD FILE</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[2.5]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH BY TITLE, DEPARTMENT, METADATA..."
            className="w-full pl-10 pr-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white shadow-[2px_2px_0px_0px_#18181b]"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap font-pixel-code">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400 stroke-[2.5]" />
            <span className="text-xs text-zinc-400 uppercase font-bold">CATEGORY:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'px-2.5 py-1 text-xs font-bold uppercase border transition-all',
                  category === c
                    ? 'bg-white text-black border-white shadow-[2px_2px_0px_0px_#ffffff]'
                    : 'bg-black text-zinc-400 border-zinc-800 hover:border-white hover:text-white'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pixel Table */}
      <div className="pixel-box overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-pixel">
            <thead>
              <tr className="border-b-2 border-[#27272a] bg-black font-pixel-head">
                {['Document', 'Category', 'Status', 'Priority', 'Department', 'Uploaded', 'Size', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#27272a]">
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-zinc-400 font-pixel-code">
                    <FileText className="w-10 h-10 mx-auto text-zinc-600 mb-3 stroke-[2]" />
                    NO DOCUMENTS MATCH YOUR FILTERS
                  </td>
                </tr>
              ) : (
                docs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-zinc-900 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-white stroke-[2.5] flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-xs font-pixel-head font-bold text-white group-hover:text-[#6ee7b7] transition-colors truncate max-w-[200px] font-bloom-subtle">
                            {doc.title}
                          </p>
                          <p className="text-[10px] font-pixel-code text-zinc-400 truncate max-w-[200px]">BY {doc.uploadedBy}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-pixel-code text-white bg-black border border-zinc-700 px-2 py-0.5 uppercase">{doc.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 font-pixel-code">
                        <PriorityDot priority={doc.priority} />
                        <span className="text-xs text-zinc-300 uppercase">{doc.priority}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-pixel-code text-zinc-300 whitespace-nowrap uppercase">{doc.department}</td>
                    <td className="px-4 py-4 text-xs font-pixel-code text-zinc-400 whitespace-nowrap">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-4 text-xs font-pixel-code text-zinc-400 whitespace-nowrap">{formatBytes(doc.fileSize)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/documents/${doc.id}`); }}>
                          <Eye className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-yellow-400 transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Star className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Download className="w-4 h-4 stroke-[2.5]" />
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
    </motion.div>
  );
}
