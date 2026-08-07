import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Shield, UserCheck, FileText, CheckCircle2 } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { MOCK_EMPLOYEES, MockEmployee } from '@/data/mockData';
import { toast } from 'sonner';

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: 'Admin', color: 'badge-muted-red font-bloom-red', icon: Shield },
  manager: { label: 'Manager', color: 'badge-muted-amber font-bloom-amber', icon: UserCheck },
  employee: { label: 'Employee', color: 'badge-muted-green font-bloom-green', icon: Users },
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', role: 'employee', department: 'Operations' });
  const [employeeList, setEmployeeList] = useState<MockEmployee[]>(MOCK_EMPLOYEES);

  const departments = ['All', 'Operations', 'Maintenance', 'Finance', 'HR', 'Legal', 'Procurement', 'Safety', 'Engineering', 'IT', 'Water Metro'];

  const filtered = employeeList.filter((u) => {
    const matchesSearch =
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.assignedContractId.toLowerCase().includes(search.toLowerCase());

    const matchesDept = selectedDept === 'All' || u.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.full_name || !newUser.email) return;

    const newEmp: MockEmployee = {
      id: `emp-${Date.now()}`,
      fullName: newUser.full_name,
      email: newUser.email,
      role: newUser.role as any,
      department: newUser.department,
      assignedContractId: `CNT-2024-${Math.floor(Math.random() * 900) + 100}`,
      assignedContractName: `${newUser.department.toUpperCase()} SPECIAL SERVICE SLA`,
      assignedContractStatus: 'active',
      avatarInitials: getInitials(newUser.full_name),
      badge: 'badge-muted-green font-bloom-green',
    };

    setEmployeeList([newEmp, ...employeeList]);
    toast.success(`User ${newUser.full_name} created with assigned contract ${newEmp.assignedContractId}`);
    setShowAddModal(false);
    setNewUser({ full_name: '', email: '', role: 'employee', department: 'Operations' });
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
            <Users className="w-6 h-6 text-white stroke-[2.5]" />
            <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">KMRL USER DIRECTORY</h1>
            <span className="text-xs font-pixel-code font-bold badge-muted-green px-2.5 py-0.5 uppercase">
              80 EMPLOYEES
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">
            80 HARDCODED KMRL EMPLOYEES · EVERY EMPLOYEE HAS A UNIQUE ASSIGNED CONTRACT SLA
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={() => setShowAddModal(true)}
          className="pixel-btn-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>ADD EMPLOYEE</span>
        </motion.button>
      </div>

      {/* Search & Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[2.5]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH 80 EMPLOYEES BY NAME, EMAIL OR CONTRACT ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase shadow-[2px_2px_0px_0px_#18181b]"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full px-3 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white focus:outline-none focus:border-white uppercase shadow-[2px_2px_0px_0px_#18181b]"
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === 'All' ? 'ALL DEPARTMENTS' : d.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-pixel-code">
        {[
          { label: 'Total Employees', value: employeeList.length },
          { label: 'Admins', value: employeeList.filter((u) => u.role === 'admin').length },
          { label: 'Managers', value: employeeList.filter((u) => u.role === 'manager').length },
          { label: 'Assigned SLAs', value: employeeList.length },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className={cn(
              'pixel-box p-4 text-center animate-pixel-float',
              i === 1 && 'float-delay-1',
              i === 2 && 'float-delay-2',
              i === 3 && 'float-delay-3'
            )}
          >
            <p className="text-3xl font-pixel-head font-bold text-white font-bloom">{value}</p>
            <p className="text-xs text-zinc-400 font-bold uppercase mt-1 tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* Employees Table */}
      <div className="pixel-box p-5 space-y-4">
        <div className="flex items-center justify-between text-xs font-pixel-code text-zinc-400">
          <span>SHOWING {filtered.length} OF {employeeList.length} EMPLOYEES</span>
          <span>KMRL PERSONNEL DIRECTORY</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-pixel-code text-xs">
            <thead>
              <tr className="border-b-2 border-zinc-800 text-zinc-400 text-[10px] uppercase">
                <th className="py-3 px-3">EMPLOYEE</th>
                <th className="py-3 px-3">ROLE</th>
                <th className="py-3 px-3">DEPARTMENT</th>
                <th className="py-3 px-3">ASSIGNED CONTRACT SLA</th>
                <th className="py-3 px-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((user) => {
                const config = ROLE_CONFIG[user.role] || ROLE_CONFIG.employee;
                return (
                  <tr key={user.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-2 border-white bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0 font-pixel-head">
                          {user.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white uppercase truncate text-xs">{user.fullName}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn('px-2.5 py-0.5 text-[10px] font-bold uppercase border', config.color)}>
                        {config.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-300 uppercase font-bold text-[11px]">{user.department}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-white font-bold font-bloom-subtle">
                        <FileText className="w-3.5 h-3.5 text-white flex-shrink-0" />
                        <span className="truncate max-w-[240px] uppercase" title={user.assignedContractName}>
                          {user.assignedContractId}: {user.assignedContractName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-[10px] font-bold badge-muted-green font-bloom-green px-2 py-0.5 uppercase inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#6ee7b7]" /> ACTIVE SLA
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#09090b] border-2 border-white p-6 max-w-md w-full font-pixel-code space-y-4 shadow-[4px_4px_0px_0px_#ffffff]">
            <h3 className="font-pixel-head font-bold text-white text-sm font-bloom">ADD NEW KMRL EMPLOYEE</h3>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">FULL NAME</label>
                <input
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="E.G. SURESH PRABHU"
                  className="w-full p-2 bg-black border border-zinc-700 text-xs text-white uppercase focus:border-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="USER@KMRL.IN"
                  className="w-full p-2 bg-black border border-zinc-700 text-xs text-white uppercase focus:border-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">DEPARTMENT</label>
                <select
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full p-2 bg-black border border-zinc-700 text-xs text-white uppercase focus:border-white focus:outline-none"
                >
                  {departments.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d}>{d.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1">ROLE</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2 bg-black border border-zinc-700 text-xs text-white uppercase focus:border-white focus:outline-none"
                >
                  <option value="employee">EMPLOYEE</option>
                  <option value="manager">MANAGER</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="pixel-btn-dark flex-1 text-xs py-2">
                  CANCEL
                </button>
                <button type="submit" className="pixel-btn-white flex-1 text-xs py-2">
                  CREATE & ASSIGN SLA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
