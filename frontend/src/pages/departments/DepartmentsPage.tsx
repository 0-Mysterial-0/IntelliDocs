import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, FileText, Plus, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const DEPT_COLORS = ['#ffffff', '#6ee7b7', '#fde047', '#fca5a5', '#a1a1aa', '#71717a'];

interface Department {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
  members: number;
  documents: number;
}

const INITIAL_DEPARTMENTS: Department[] = [
  { id: '1', name: 'Operations', code: 'OPS', color: '#ffffff', description: 'Metro rail operations and control center', members: 12, documents: 312 },
  { id: '2', name: 'Finance', code: 'FIN', color: '#6ee7b7', description: 'Financial management and accounting', members: 8, documents: 234 },
  { id: '3', name: 'Human Resources', code: 'HR', color: '#fde047', description: 'HR policies and employee management', members: 6, documents: 156 },
  { id: '4', name: 'Maintenance', code: 'MNT', color: '#fca5a5', description: 'Rolling stock and infrastructure maintenance', members: 15, documents: 180 },
  { id: '5', name: 'Legal', code: 'LGL', color: '#a1a1aa', description: 'Legal affairs, contracts and compliance', members: 4, documents: 98 },
  { id: '6', name: 'Procurement', code: 'PRO', color: '#ffffff', description: 'Procurement and vendor management', members: 7, documents: 267 },
];

export default function DepartmentsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', color: DEPT_COLORS[0] });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      toast.error('Department name and code are required');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase().slice(0, 5),
      color: form.color,
      description: form.description.trim() || `${form.name} department`,
      members: 0,
      documents: 0,
    };
    setDepartments((prev) => [...prev, newDept]);
    setForm({ name: '', code: '', description: '', color: DEPT_COLORS[0] });
    setShowModal(false);
    setSaving(false);
    toast.success(`Department "${newDept.name}" created successfully!`);
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
          <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">ORGANIZATIONAL DEPARTMENTS</h1>
          <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">KMRL DEPARTMENTS AND DOCUMENT TELEMETRY</p>
        </div>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => setShowModal(true)}
            className="pixel-btn-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>NEW DEPARTMENT</span>
          </motion.button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-6 font-pixel-code">
        <div className="pixel-box p-5 text-center animate-pixel-float">
          <p className="text-3xl font-pixel-head font-bold text-white font-bloom">{departments.length}</p>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1">TOTAL DEPARTMENTS</p>
        </div>
        <div className="pixel-box p-5 text-center animate-pixel-float float-delay-1">
          <p className="text-3xl font-pixel-head font-bold text-white font-bloom">{departments.reduce((s, d) => s + d.members, 0)}</p>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1">TOTAL MEMBERS</p>
        </div>
        <div className="pixel-box p-5 text-center animate-pixel-float float-delay-2">
          <p className="text-3xl font-pixel-head font-bold text-white font-bloom">{departments.reduce((s, d) => s + d.documents, 0).toLocaleString()}</p>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1">INDEXED DOCUMENTS</p>
        </div>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept, idx) => (
          <motion.div
            key={dept.id}
            whileHover={{ scale: 1.02, y: -4 }}
            className={cn(
              'pixel-box p-5 animate-pixel-float cursor-pointer group',
              idx % 3 === 1 && 'float-delay-1',
              idx % 3 === 2 && 'float-delay-2'
            )}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border-2 border-white bg-black text-white flex items-center justify-center font-bold text-xs font-pixel-head flex-shrink-0">
                {dept.code}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-pixel-head font-bold text-white text-xs group-hover:text-[#6ee7b7] transition-colors font-bloom-subtle">{dept.name}</h3>
                <p className="text-xs font-pixel text-zinc-400 mt-1 line-clamp-2">{dept.description}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t-2 border-[#27272a] grid grid-cols-2 gap-3 font-pixel-code">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400 stroke-[2]" />
                <div>
                  <p className="text-sm font-bold text-white">{dept.members}</p>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400 stroke-[2]" />
                <div>
                  <p className="text-sm font-bold text-white">{dept.documents}</p>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Documents</p>
                </div>
              </div>
            </div>

            {/* Activity Bar */}
            <div className="mt-3 font-pixel-code">
              <div className="h-2 bg-black border border-zinc-700">
                <div
                  className="h-full bg-white transition-all"
                  style={{
                    width: `${Math.min(100, Math.round((dept.documents / Math.max(...departments.map(d => d.documents), 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* Admin Delete Action */}
            {isAdmin && (
              <div className="mt-3 pt-2 border-t border-zinc-800 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
                    toast.success(`Department "${dept.name}" deleted!`);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] py-1 px-2 border border-red-400 flex items-center gap-1 shadow-[2px_2px_0px_0px_#7f1d1d]"
                  title="Admin Delete Department"
                >
                  <Trash2 className="w-3 h-3 text-white" /> DELETE DEPT
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Non-admin notice */}
      {!isAdmin && (
        <p className="text-center text-xs font-pixel-code text-zinc-500 uppercase pt-2">
          ONLY ADMINISTRATORS CAN CREATE OR MODIFY DEPARTMENTS.
        </p>
      )}

      {/* Create Department Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm font-pixel p-4">
          <div className="pixel-box p-6 w-full max-w-md bg-black border-2 border-white space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-white stroke-[2.5]" />
                <h2 className="text-sm font-pixel-head font-bold text-white uppercase font-bloom">NEW DEPARTMENT</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-4 font-pixel-code">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase font-bold">DEPARTMENT NAME *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="E.G. SAFETY & SECURITY"
                  className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase font-bold">DEPARTMENT CODE *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().slice(0, 5) }))}
                  placeholder="E.G. SAF (MAX 5 CHARS)"
                  className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase tracking-widest"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase font-bold">DESCRIPTION</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="BRIEF DESCRIPTION..."
                  rows={2}
                  className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white resize-none uppercase"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="pixel-btn-dark flex-1"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !form.name.trim() || !form.code.trim()}
                className="pixel-btn-white flex-1"
              >
                {saving ? 'CREATING...' : 'CREATE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
