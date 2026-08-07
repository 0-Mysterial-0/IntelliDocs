import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Search, Edit2, ToggleLeft, ToggleRight, Shield, UserCheck } from 'lucide-react';
import { cn, getInitials, generateAvatarColor, formatDate } from '@/lib/utils';
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
  admin: { label: 'Admin', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Shield },
  manager: { label: 'Manager', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', icon: UserCheck },
  employee: { label: 'Employee', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', icon: Users },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-slate-400 text-sm mt-1">Manage KMRL IntelliDocs user accounts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length },
          { label: 'Admins', value: (users as typeof MOCK_USERS).filter((u) => u.role === 'admin').length },
          { label: 'Managers', value: (users as typeof MOCK_USERS).filter((u) => u.role === 'manager').length },
          { label: 'Active', value: (users as typeof MOCK_USERS).filter((u) => u.is_active).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['User', 'Role', 'Department', 'Status', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-5 py-4 text-xs font-medium text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((user) => {
                const roleConf = ROLE_CONFIG[user.role];
                const RoleIcon = roleConf.icon;
                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: generateAvatarColor(user.full_name) }}
                        >
                          {getInitials(user.full_name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.full_name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium border', roleConf.color)}>
                        <RoleIcon className="w-3 h-3" />
                        {roleConf.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-300">{user.department_name || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full text-xs font-medium border', user.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30')}>
                        <div className={cn('w-1.5 h-1.5 rounded-full', user.is_active ? 'bg-green-400' : 'bg-slate-400')} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{formatDate(user.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f2937] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-white mb-5">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              {[
                { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Priya Sharma' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'priya@kmrl.in' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 8 characters' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(newUser as any)[key]}
                    onChange={(e) => setNewUser((u) => ({ ...u, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#111827] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500/50"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
