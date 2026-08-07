import { Building2, Users, FileText, Plus } from 'lucide-react';

const DEPARTMENTS = [
  { id: '1', name: 'Operations', code: 'OPS', color: '#0ea5e9', description: 'Metro rail operations and control center', members: 12, documents: 312 },
  { id: '2', name: 'Finance', code: 'FIN', color: '#22c55e', description: 'Financial management and accounting', members: 8, documents: 234 },
  { id: '3', name: 'Human Resources', code: 'HR', color: '#a855f7', description: 'HR policies and employee management', members: 6, documents: 156 },
  { id: '4', name: 'Maintenance', code: 'MNT', color: '#f59e0b', description: 'Rolling stock and infrastructure maintenance', members: 15, documents: 180 },
  { id: '5', name: 'Legal', code: 'LGL', color: '#ef4444', description: 'Legal affairs, contracts and compliance', members: 4, documents: 98 },
  { id: '6', name: 'Procurement', code: 'PRO', color: '#06b6d4', description: 'Procurement and vendor management', members: 7, documents: 267 },
];

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-slate-400 text-sm mt-1">KMRL organizational departments and their document statistics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Department
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-white">{DEPARTMENTS.length}</p>
          <p className="text-sm text-slate-400 mt-1">Total Departments</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-white">{DEPARTMENTS.reduce((s, d) => s + d.members, 0)}</p>
          <p className="text-sm text-slate-400 mt-1">Total Users</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 text-center">
          <p className="text-3xl font-bold text-white">{DEPARTMENTS.reduce((s, d) => s + d.documents, 0).toLocaleString()}</p>
          <p className="text-sm text-slate-400 mt-1">Total Documents</p>
        </div>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEPARTMENTS.map((dept) => (
          <div key={dept.id} className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 hover:border-white/10 transition-all cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: dept.color + '20', border: `1px solid ${dept.color}30` }}>
                <span style={{ color: dept.color }}>{dept.code}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm group-hover:text-sky-300 transition-colors">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{dept.description}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-white">{dept.members}</p>
                  <p className="text-[10px] text-slate-500">Members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-white">{dept.documents}</p>
                  <p className="text-[10px] text-slate-500">Documents</p>
                </div>
              </div>
            </div>

            {/* Activity Bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.round((dept.documents / 312) * 100)}%`,
                    backgroundColor: dept.color,
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Document activity</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
