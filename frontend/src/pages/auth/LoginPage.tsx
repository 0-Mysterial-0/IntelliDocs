import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useRegisteredUsersStore } from '@/store/registeredUsersStore';
import { authApi } from '@/lib/api';
import { Train, Eye, EyeOff, Sparkles, Shield, Search, Bot, ArrowRight, CheckCircle2, UserPlus, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CursorFollower } from '@/components/common/CursorFollower';

const DEMO_USERS = [
  { label: 'ADMIN', email: 'admin@kmrl.in', password: 'kmrl@2024', role: 'admin' as const, name: 'Suresh Prabhu', badge: 'badge-muted-red font-bloom-red' },
  { label: 'MANAGER', email: 'rajan.menon@kmrl.in', password: 'kmrl@2024', role: 'manager' as const, name: 'Rajan Menon', badge: 'badge-muted-amber font-bloom-amber' },
  { label: 'EMPLOYEE', email: 'priya.nair@kmrl.in', password: 'kmrl@2024', role: 'employee' as const, name: 'Priya Nair', badge: 'badge-muted-green font-bloom-green' },
];

const FEATURES = [
  { icon: Search, label: 'SEMANTIC SEARCH', desc: 'NATURAL LANGUAGE VECTOR SEARCH' },
  { icon: Bot, label: 'AI ASSISTANT', desc: 'RAG-POWERED DOCUMENT CHAT' },
  { icon: Shield, label: 'SECURE & COMPLIANT', desc: 'ENTERPRISE METRO SECURITY' },
  { icon: Sparkles, label: 'AUTO-CLASSIFY', desc: 'AI CLASSIFICATION & EASYOCR' },
];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<'employee' | 'manager' | 'admin'>('employee');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const { validateCredentials, registerUser } = useRegisteredUsersStore();
  const navigate = useNavigate();

  // ── STRICT SIGN IN VALIDATION ──────────────────────────────────────────────
  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string, overridePassword?: string) => {
    if (e) e.preventDefault();

    const targetEmail = (overrideEmail || email).trim();
    const targetPassword = overridePassword || password;

    if (!targetEmail) {
      toast.error('Please enter your email address!');
      return;
    }
    if (!targetPassword) {
      toast.error('Please enter your password!');
      return;
    }

    setLoading(true);

    // 1. Try FastAPI real backend endpoint if online
    try {
      const resp = await authApi.login(targetEmail, targetPassword);
      if (resp?.data?.access_token) {
        const { access_token, refresh_token, user } = resp.data;
        setAuth(user, access_token, refresh_token);
        toast.success(`Welcome back, ${user.full_name?.split(' ')[0] || 'User'}!`);
        setLoading(false);
        navigate('/dashboard');
        return;
      }
    } catch {
      // Backend offline or local verification fallback
    }

    // 2. Strict Local Registered Users Verification
    const validatedUser = validateCredentials(targetEmail, targetPassword);
    if (!validatedUser) {
      toast.error('Invalid email or password! Please check your credentials or create a new account.');
      setLoading(false);
      return; // DO NOT REDIRECT!
    }

    const mockUser = {
      id: validatedUser.id,
      email: validatedUser.email,
      full_name: validatedUser.fullName,
      role: validatedUser.role,
      is_active: true,
      is_verified: true,
    };

    setAuth(mockUser, 'kmrl-jwt-token-' + Date.now(), 'kmrl-refresh-token');
    toast.success(`Welcome back, ${mockUser.full_name}!`);
    setLoading(false);
    navigate('/dashboard');
  };

  // ── SIGN UP HANDLER ────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!signUpEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 4) {
      toast.error('Password must be at least 4 characters long');
      return;
    }

    setLoading(true);

    try {
      registerUser({
        email: signUpEmail.trim().toLowerCase(),
        passwordHash: signUpPassword,
        fullName: signUpName.trim(),
        role: signUpRole,
        department: 'Operations',
      });

      toast.success(`Account created for ${signUpName}! Please sign in now.`);
      setEmail(signUpEmail.trim().toLowerCase());
      setPassword(signUpPassword);
      setActiveTab('signin');
      setSignUpName('');
      setSignUpEmail('');
      setSignUpPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (u: typeof DEMO_USERS[0]) => {
    setEmail(u.email);
    setPassword(u.password);
    handleLogin(undefined, u.email, u.password);
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
        {/* Header Logo */}
        <div className="flex items-center gap-3.5 mb-auto">
          <Train className="w-8 h-8 text-white stroke-[2.5] flex-shrink-0 animate-pixel-float" />
          <div>
            <p className="text-base font-pixel-head font-bold text-white font-bloom tracking-wider">INTELLIDOCS</p>
            <p className="text-[10px] font-pixel-code text-zinc-400 uppercase tracking-widest">KOCHI METRO RAIL LIMITED</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative flex-1 flex flex-col justify-center my-auto space-y-6">
          <div>
            <span className="text-xs font-pixel-code text-[#6ee7b7] font-bloom-green tracking-widest uppercase">
              KMRL ENTERPRISE METRO SYSTEM // AUTH
            </span>
            <h1 className="text-3xl md:text-5xl font-pixel-head font-bold text-white font-bloom leading-tight mt-2">
              AI-POWERED DOCUMENT INTELLIGENCE
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm font-pixel leading-relaxed mt-3 max-w-lg">
              TRANSFORM DOCUMENT OVERLOAD WITH EASYOCR, VECTOR SEMANTIC SEARCH, AND AUTOMATED METRO WORKFLOWS.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc }, i) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.03, y: -3 }}
                className={cn(
                  'pixel-box p-4 animate-pixel-float cursor-pointer',
                  i === 1 && 'float-delay-1',
                  i === 2 && 'float-delay-2',
                  i === 3 && 'float-delay-3'
                )}
              >
                <Icon className="w-5 h-5 text-white stroke-[2.5] mb-2" />
                <p className="text-xs font-pixel-head font-bold text-white font-bloom-subtle">{label}</p>
                <p className="text-[10px] font-pixel-code text-zinc-400 mt-1 uppercase">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Telemetry Stats */}
          <div className="flex items-center gap-6 pt-4 font-pixel-code">
            {[
              ['1,247', 'DOCUMENTS'],
              ['94.8%', 'OCR ACCURACY'],
              ['87%', 'TIME SAVED']
            ].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-2xl font-pixel-head font-extrabold text-white font-bloom">{val}</p>
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{lbl}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t-2 border-[#27272a] font-pixel-code text-xs text-zinc-500 uppercase">
          KMRL ENTERPRISE METRO SYSTEM · KOCHI METRO RAIL LIMITED
        </div>
      </motion.div>

      {/* Right Panel - Tabbed Auth Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-[#000000] min-h-[100dvh] md:min-h-0"
      >
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <Train className="w-7 h-7 text-white stroke-[2.5]" />
            <div>
              <p className="font-pixel-head font-bold text-white font-bloom">INTELLIDOCS</p>
              <p className="text-[10px] font-pixel-code text-zinc-400 uppercase">DOCUMENT INTELLIGENCE</p>
            </div>
          </div>

          {/* ── INTERACTIVE TAB SWITCHER (SIGN IN vs SIGN UP) ───────────────── */}
          <div className="flex border-b-2 border-zinc-800 mb-6 font-pixel-code">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={cn(
                'flex-1 py-2.5 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 border-b-2',
                activeTab === 'signin'
                  ? 'text-white border-white bg-zinc-900'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              )}
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SIGN IN</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={cn(
                'flex-1 py-2.5 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 border-b-2',
                activeTab === 'signup'
                  ? 'text-white border-white bg-zinc-900'
                  : 'text-zinc-500 border-transparent hover:text-zinc-300'
              )}
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SIGN UP</span>
            </button>
          </div>

          {/* ── TAB 1: SIGN IN FORM ────────────────────────────────────────── */}
          {activeTab === 'signin' && (
            <div>
              <h2 className="text-xl font-pixel-head font-bold text-white font-bloom mb-1">WELCOME BACK</h2>
              <p className="text-zinc-400 text-xs font-pixel-code uppercase mb-5">SIGN IN TO YOUR KMRL INTELLIDOCS ACCOUNT</p>

              <form onSubmit={handleLogin} className="space-y-4 font-pixel-code">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kmrl.in"
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
                      className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white pr-10 shadow-[2px_2px_0px_0px_#18181b]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 stroke-[2.5]" /> : <Eye className="w-4 h-4 stroke-[2.5]" />}
                    </button>
                  </div>
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
                      <span>SIGN IN</span> <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Quick Switch to Sign Up */}
              <div className="mt-4 pt-3 border-t border-zinc-800 text-center font-pixel-code">
                <button
                  onClick={() => setActiveTab('signup')}
                  className="text-xs text-zinc-400 hover:text-white uppercase font-bold"
                >
                  DON'T HAVE AN ACCOUNT? <span className="underline text-white ml-1">CREATE ACCOUNT NOW →</span>
                </button>
              </div>

              {/* 1-Click Demo Login */}
              <div className="flex items-center gap-3 my-5 font-pixel-code">
                <div className="flex-1 h-0.5 bg-zinc-800" />
                <span className="text-[10px] text-zinc-400 font-bold uppercase">1-CLICK DEMO LOGIN</span>
                <div className="flex-1 h-0.5 bg-zinc-800" />
              </div>

              <div className="space-y-2 font-pixel-code">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.role}
                    type="button"
                    onClick={() => quickLogin(u)}
                    disabled={loading}
                    className="w-full flex items-center gap-3 p-2.5 bg-black border-2 border-zinc-700 hover:border-white transition-all cursor-pointer group shadow-[2px_2px_0px_0px_#18181b]"
                  >
                    <span className={cn('px-2 py-0.5 border text-[10px] font-bold uppercase', u.badge)}>{u.label}</span>
                    <span className="text-zinc-300 group-hover:text-white transition-colors truncate text-xs">{u.email}</span>
                    <span className="ml-auto text-[10px] text-zinc-500 flex items-center gap-1 font-bold">
                      1-CLICK <CheckCircle2 className="w-3.5 h-3.5 text-[#6ee7b7] opacity-0 group-hover:opacity-100 transition-opacity stroke-[2.5]" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 2: SIGN UP FORM ────────────────────────────────────────── */}
          {activeTab === 'signup' && (
            <div>
              <h2 className="text-xl font-pixel-head font-bold text-white font-bloom mb-1">CREATE ACCOUNT</h2>
              <p className="text-zinc-400 text-xs font-pixel-code uppercase mb-5">REGISTER YOUR NEW KMRL ENTERPRISE USER</p>

              <form onSubmit={handleSignUp} className="space-y-3.5 font-pixel-code">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">FULL NAME</label>
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Suresh Prabhu"
                    className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white shadow-[2px_2px_0px_0px_#18181b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="user@kmrl.in"
                    className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white shadow-[2px_2px_0px_0px_#18181b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">PASSWORD</label>
                  <input
                    type="password"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white shadow-[2px_2px_0px_0px_#18181b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase">ROLE</label>
                  <select
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white focus:outline-none focus:border-white uppercase shadow-[2px_2px_0px_0px_#18181b]"
                  >
                    <option value="employee">EMPLOYEE (VIEW & UPLOAD)</option>
                    <option value="manager">MANAGER (APPROVALS & ANALYTICS)</option>
                    <option value="admin">ADMIN (FULL ACCESS)</option>
                  </select>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  type="submit"
                  disabled={loading}
                  className="pixel-btn-white w-full py-3 flex items-center justify-center gap-2 mt-3"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>CREATE ACCOUNT</span> <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-4 pt-3 border-t border-zinc-800 text-center font-pixel-code">
                <button
                  onClick={() => setActiveTab('signin')}
                  className="text-xs text-zinc-400 hover:text-white uppercase font-bold"
                >
                  ALREADY HAVE AN ACCOUNT? <span className="underline text-white ml-1">SIGN IN HERE →</span>
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-[10px] font-pixel-code text-zinc-500 mt-6 uppercase">
            KMRL INTELLIDOCS · KOCHI METRO RAIL LIMITED
          </p>
        </div>
      </motion.div>
    </div>
  );
}
