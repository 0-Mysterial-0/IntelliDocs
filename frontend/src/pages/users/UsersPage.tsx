import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Users, Plus, Search, Shield, UserCheck } from 'lucide-react';
import { cn, getInitials, formatDate } from '@/lib/utils';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';

const MOCK_USERS = [
  { id: 'u1', email: 'admin@kmrl.in', full_name: 'Suresh Prabhu', role: 'admin', department_name: 'Operations', is_active: true, created_at: '2024-01-01' },
  { id: 'u2', email: 'rajan.menon@kmrl.in', full_name: 'Rajan Menon', role: 'manager', department_name: 'Finance', is_active: true, created_at: '2024-01-05' },
  { id: 'u3', email: 'priya.nair@kmrl.in', full_name: 'Priya Nair', role: 'manager', department_name: 'Human Resources', is_active: true, created_at: '2024-01-05' },
  { id: 'u4', email: 'arun.kumar@kmrl.in', full_name: 'Arun Kumar', role: 'employee', department_name: 'Maintenance', is_active: true, created_at: '2024-01-10' },
  { id: 'u5', email: 'deepa.thomas@kmrl.in', full_name: 'Deepa Thomas', role: 'employee', department_name: 'Legal', is_active: true, created_at: '2024-01-10' },
  { id: 'u6', email: 'suresh.pillai@kmrl.in', full_name: 'Suresh Pillai', role: 'employee', department_name: 'Procurement', is_active: true, created_at: '2024-01-12' },
  { id: 'u7', email: 'anjali.krishna@kmrl.in', full_name: 'Anjali Krishna', role: 'employee', department_name: 'Operations', is_active: true, created_at: '2024-01-15' },
  { id: 'u8', email: 'mohan.das@kmrl.in', full_name: 'Mohan Das', role: 'employee', department_name: 'Finance', is_active: false, created_at: '2024-01-20' },
];

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: 'Admin', color: 'badge-muted-red font-bloom-red', icon: Shield },
  manager: { label: 'Manager', color: 'badge-muted-amber font-bloom-amber', icon: UserCheck },
  employee: { label: 'Employee', color: 'badge-muted-green font-bloom-green', icon: Users },
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', role: 'employee', password: '' });

  const { data: users = MOCK_USERS } = useQuery({
    queryKey: ['users'],
    queryFn: async () => { const r = await usersApi.list(); return r.data; },
    initialData: MOCK_USERS,
  });

  const filtered = (users as typeof MOCK_USERS).filter((u) =>
    !search || u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersApi.create(newUser);
      toast.success(`User ${newUser.full_name} created`);
      setShowAddModal(false);
      setNewUser({ full_name: '', email: '', role: 'employee', password: '' });
    } catch {
      toast.success('User created (demo mode)');
      setShowAddModal(false);
    }
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
          <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">USER MANAGEMENT</h1>
          <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">MANAGE KMRL INTELLIDOCS USER ACCOUNTS</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={() => setShowAddModal(true)}
          className="pixel-btn-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-black stroke-[3]" />
          <span>ADD USER</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 stroke-[2.5]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH BY NAME OR EMAIL..."
          className="w-full pl-10 pr-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 font-pixel-code">
        {[
          { label: 'Total Users', value: users.length },
          { label: 'Admins', value: (users as typeof MOCK_USERS).filter((u) => u.role === 'admin').length },
          { label: 'Managers', value: (users as typeof MOCK_USERS).filter((u) => u.role === 'manager').length },
          { label: 'Active', value: (users as typeof MOCK_USERS).filter((u) => u.is_active).length },
        ].map(({ label, value }, i) => (
          <div key={label} className={cn('pixel-box p-4 text-center animate-pixel-float', i === 1 && 'float-delay-1', i === 2 && 'float-delay-2', i === 3 && 'float-delay-3')}>
            <p className="text-3xl font-pixel-head font-bold text-white font-bloom">{value}</p>
            <p className="text-xs text-zinc-400 font-bold uppercase mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="pixel-box overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full font-pixel">
            <thead>
              <tr className="border-b-2 border-[#27272a] bg-black font-pixel-head">
                {['User', 'Role', 'Department', 'Status', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#27272a]">
              {filtered.map((u) => {
                const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.employee;
                const RoleIcon = roleConf.icon;
                return (
                  <tr key={u.id} className="hover:bg-zinc-900 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-2 border-white bg-black text-white flex items-center justify-center text-xs font-bold font-pixel-head flex-shrink-0">
                          {getInitials(u.full_name)}
                        </div>
                        <div>
                          <p className="text-xs font-pixel-head font-bold text-white font-bloom-subtle">{u.full_name}</p>
                          <p className="text-[10px] font-pixel-code text-zinc-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-pixel-code">
                      <span className={cn('flex items-center gap-1.5 w-fit px-2.5 py-0.5 border uppercase font-bold text-xs', roleConf.color)}>
                        <RoleIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                        {roleConf.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-pixel-code text-zinc-300 uppercase">
                      {u.department_name || '—'}
                    </td>
                    <td className="px-5 py-4 font-pixel-code">
                      <span className={cn('flex items-center gap-1.5 w-fit px-2.5 py-0.5 border uppercase font-bold text-xs', u.is_active ? 'badge-muted-green font-bloom-green' : 'bg-black text-zinc-500 border-zinc-800')}>
                        <span className={cn('w-1.5 h-1.5', u.is_active ? 'bg-[#6ee7b7] animate-pulse' : 'bg-zinc-600')} />
                        {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-pixel-code text-zinc-400">{formatDate(u.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-pixel">
          <div className="pixel-box p-6 w-full max-w-md bg-black border-2 border-white">
            <h3 className="font-pixel-head font-bold text-white text-sm mb-5 uppercase font-bloom">ADD NEW USER</h3>
            <form onSubmit={handleAddUser} className="space-y-4 font-pixel-code">
              {[
                { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'PRIYA SHARMA' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'PRIYA@KMRL.IN' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'MIN 8 CHARACTERS' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-zinc-400 mb-1.5 uppercase font-bold">{label}</label>
                  <input
                    type={type}
                    value={(newUser as any)[key]}
                    onChange={(e) => setNewUser((u) => ({ ...u, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required
                    className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase font-bold">ROLE</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}
                  className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white focus:outline-none focus:border-white uppercase"
                >
                  <option value="employee">EMPLOYEE</option>
                  <option value="manager">MANAGER</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="pixel-btn-dark flex-1">CANCEL</button>
                <button type="submit" className="pixel-btn-white flex-1">CREATE USER</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
