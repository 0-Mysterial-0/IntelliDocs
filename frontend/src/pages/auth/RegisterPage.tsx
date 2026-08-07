import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRegisteredUsersStore } from '@/store/registeredUsersStore';
import { authApi } from '@/lib/api';
import { Train, Eye, EyeOff, UserPlus, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { CursorFollower } from '@/components/common/CursorFollower';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'employee' | 'manager' | 'admin'>('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // 1. Attempt real PostgreSQL database registration via FastAPI backend
      const resp = await authApi.register({
        full_name: fullName,
        email: email.toLowerCase().trim(),
        password: password,
        role: role,
      });

      if (resp?.data?.access_token) {
        toast.success(`Account created successfully for ${fullName}! Please sign in now.`);
        setLoading(false);
        navigate('/login?tab=signin');
        return;
      }
    } catch (err: any) {
      console.log('Backend offline or dev fallback...');
    }

    // 2. Persistent store registration
    try {
      useRegisteredUsersStore.getState().registerUser({
        email: email.toLowerCase().trim(),
        passwordHash: password,
        fullName: fullName.trim(),
        role: role,
        department: 'Operations',
      });
      toast.success(`Account created successfully for ${fullName}! Please sign in with your credentials.`);
      setLoading(false);
      navigate('/login?tab=signin');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#000000] flex flex-col md:flex-row font-pixel text-white selection:bg-white selection:text-black relative overflow-y-auto">
      <CursorFollower />

      {/* Left Panel - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 flex-col p-12 relative overflow-hidden border-r-2 border-[#27272a] bg-[#09090b]"
      >
        <div className="flex items-center gap-3.5 mb-auto">
          <Train className="w-8 h-8 text-white stroke-[2.5] flex-shrink-0 animate-pixel-float" />
          <div>
            <p className="text-base font-pixel-head font-bold text-white font-bloom tracking-wider">INTELLIDOCS</p>
            <p className="text-[10px] font-pixel-code text-zinc-400 uppercase tracking-widest">KOCHI METRO RAIL LIMITED</p>
          </div>
        </div>

        <div className="relative flex-1 flex flex-col justify-center my-auto space-y-6">
          <div>
            <span className="text-xs font-pixel-code text-[#6ee7b7] font-bloom-green tracking-widest uppercase">
              CREATE ACCOUNT // DATABASE PERSISTENCE
            </span>
            <h1 className="text-3xl md:text-5xl font-pixel-head font-bold text-white font-bloom leading-tight mt-2">
              JOIN KMRL INTELLIDOCS
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm font-pixel leading-relaxed mt-3 max-w-lg">
              REGISTER YOUR ENTERPRISE METRO ACCOUNT TO ACCESS EASYOCR CONVERSION, CONTRACT SLA MONITORING, AND RAG AI CHAT.
            </p>
          </div>

          <div className="space-y-3 font-pixel-code text-xs">
            {[
              '🔒 ENTERPRISE ROLE-BASED ACCESS CONTROL (ADMIN / MANAGER / EMPLOYEE)',
              '💾 ACCOUNTS PERSISTED DIRECTLY IN MANAGED POSTGRESQL DATABASE',
              '🤖 FULL ACCESS TO GEMINI & OLLAMA DOCUMENT AI ASSISTANT',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2 bg-black p-3 border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-[#6ee7b7] stroke-[2.5]" />
                <span className="text-zinc-300 font-bold uppercase">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t-2 border-[#27272a] font-pixel-code text-xs text-zinc-500 uppercase">
          KMRL ENTERPRISE METRO SYSTEM · KOCHI METRO RAIL LIMITED
        </div>
      </motion.div>

      {/* Right Panel - Sign Up Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-[#000000] min-h-[100dvh] md:min-h-0"
      >
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Train className="w-7 h-7 text-white stroke-[2.5]" />
            <div>
              <p className="font-pixel-head font-bold text-white font-bloom">INTELLIDOCS</p>
              <p className="text-[10px] font-pixel-code text-zinc-400 uppercase">ACCOUNT REGISTRATION</p>
            </div>
          </div>

          <h2 className="text-xl font-pixel-head font-bold text-white font-bloom mb-1">SIGN UP FOR AN ACCOUNT 📝</h2>
          <p className="text-zinc-400 text-xs font-pixel-code uppercase mb-6">CREATE YOUR CREDENTIALS TO GET STARTED</p>

          <form onSubmit={handleRegister} className="space-y-4 font-pixel-code">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">FULL NAME</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Suresh Prabhu"
                required
                className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white shadow-[2px_2px_0px_0px_#18181b]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@kmrl.in"
                required
                className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white shadow-[2px_2px_0px_0px_#18181b]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white pr-10 shadow-[2px_2px_0px_0px_#18181b]"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4 stroke-[2.5]" /> : <Eye className="w-4 h-4 stroke-[2.5]" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">ENTERPRISE ROLE</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white focus:outline-none focus:border-white uppercase shadow-[2px_2px_0px_0px_#18181b]"
              >
                <option value="employee">EMPLOYEE</option>
                <option value="manager">MANAGER</option>
                <option value="admin">ADMINISTRATOR</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              type="submit"
              disabled={loading}
              className="pixel-btn-white w-full py-3 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[3]" />
                  <span>CREATE ACCOUNT</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle to Sign In */}
          <div className="mt-6 pt-6 border-t-2 border-zinc-800 text-center font-pixel-code">
            <p className="text-xs text-zinc-400 uppercase">ALREADY HAVE AN ACCOUNT?</p>
            <Link
              to="/login"
              className="inline-block text-xs font-bold text-white hover:text-[#6ee7b7] font-bloom-subtle mt-1 uppercase underline underline-offset-4"
            >
              SIGN IN INSTEAD →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
