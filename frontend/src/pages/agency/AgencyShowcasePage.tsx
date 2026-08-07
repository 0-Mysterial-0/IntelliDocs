import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sparkles, ChevronRight, CheckCircle2, Award, Users, Globe, Play,
  ExternalLink, Menu, X, ArrowUpRight, Shield, Layers, Cpu, Code2, Zap, Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CursorFollower } from '@/components/common/CursorFollower';

// Projects Data
const PROJECTS = [
  {
    id: 'proj-1',
    title: 'Kochi Metro Rail Enterprise Platform',
    category: 'AI & Document Engineering',
    tags: ['FastAPI', 'React 19', 'Vector RAG', 'EasyOCR'],
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    desc: 'High-speed document intelligence platform indexing over 1,200 SLA contracts and technical manuals.',
  },
  {
    id: 'proj-2',
    title: 'Stripe Horizon Analytics System',
    category: 'Fintech & Telemetry',
    tags: ['Real-Time Charts', 'WebSockets', 'TailwindCSS'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    desc: 'Cinematic real-time payment data visualization dashboard handling 50k requests/sec.',
  },
  {
    id: 'proj-3',
    title: 'Linear Velocity Studio',
    category: 'Design Systems',
    tags: ['Framer Motion', 'TypeScript', 'Apple UI'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    desc: 'Next-generation issue tracking and engineering project manager built for speed.',
  },
  {
    id: 'proj-4',
    title: 'Awwwards Neo-Digital Space',
    category: 'Interactive WebGL',
    tags: ['Three.js', 'Shader Effects', 'Lenis Physics'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    desc: 'Interactive 3D immersive brand experience that won Site of the Year 2025.',
  },
];

// Services Data
const SERVICES = [
  {
    icon: Cpu,
    title: 'AI & RAG Architecture',
    desc: 'Custom vector embeddings, LLM RAG pipelines, ChromaDB vector stores, and automated document processing.',
  },
  {
    icon: Code2,
    title: 'High-Performance Web Engineering',
    desc: 'Ultra-fast Next.js 15, React 19, TypeScript applications built with 60fps Framer Motion & GSAP animations.',
  },
  {
    icon: Layers,
    title: 'Luxury Brand Design Systems',
    desc: 'Apple × Linear level design aesthetics, bespoke glassmorphism, micro-interactions, and accessible typography.',
  },
  {
    icon: Shield,
    title: 'Contract SLA Monitoring',
    desc: 'Automated contract expiration tracking, duplicate detection, and enterprise compliance reporting.',
  },
];

// Timeline Data
const TIMELINE = [
  { step: '01', title: 'Discovery & Vector Mapping', desc: 'Analyzing architecture requirements and indexing data schemas into high-density vector databases.' },
  { step: '02', title: 'Awwwards UI & Motion Prototyping', desc: 'Crafting 60fps micro-interactions, 20px glass containers, and responsive component systems.' },
  { step: '03', title: 'Engine Integration & RAG Pipelines', desc: 'Wiring FastAPI backends, EasyOCR fallback paths, and instant search indexers.' },
  { step: '04', title: 'Optimization & Global Deployment', desc: 'Achieving 95+ Lighthouse scores, WCAG AAA accessibility, and zero-downtime deployment.' },
];

// Awards Data
const AWARDS = [
  { count: '14×', label: 'Site of the Day', source: 'Awwwards' },
  { count: '08×', label: 'Developer Award', source: 'FWA' },
  { count: '100%', label: 'Lighthouse Score', source: 'Google Audit' },
  { count: '60fps', label: 'Smooth Animation', source: 'Lenis Scroll' },
];

// Clients Marquee Data
const CLIENTS = ['KOCHI METRO', 'STRIPE', 'LINEAR', 'APPLE', 'FIGMA', 'VERCEL', 'SUPABASE', 'CHROMA'];

export default function AgencyShowcasePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'design'>('all');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#03050B] text-slate-100 selection:bg-[#4F7CFF]/30 selection:text-[#D8FF4F] font-sans relative overflow-hidden">
      <CursorFollower />

      {/* Floating Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#4F7CFF]/20 z-[100]">
        <div className="h-full bg-gradient-to-r from-[#4F7CFF] via-indigo-500 to-[#D8FF4F] w-1/3 transition-all duration-300" />
      </div>

      {/* Glass Floating Navbar */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 lg:px-12 py-5',
          scrolled
            ? 'bg-[#03050B]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl py-4'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-[#4F7CFF] to-[#D8FF4F] p-[1px] shadow-lg shadow-[#4F7CFF]/20">
              <div className="w-full h-full bg-[#03050B] rounded-[13px] flex items-center justify-center font-bold text-sm text-[#D8FF4F]">
                KM
              </div>
            </div>
            <div>
              <p className="text-base font-display font-extrabold text-white tracking-tight">IntelliDocs</p>
              <p className="text-[10px] font-mono text-[#D8FF4F] uppercase tracking-wider">Awwwards Studio Edition</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#hero" className="hover:text-[#D8FF4F] transition-colors">Hero</a>
            <a href="#projects" className="hover:text-[#D8FF4F] transition-colors">Projects</a>
            <a href="#services" className="hover:text-[#D8FF4F] transition-colors">Services</a>
            <a href="#process" className="hover:text-[#D8FF4F] transition-colors">Process</a>
            <a href="#awards" className="hover:text-[#D8FF4F] transition-colors">Awards</a>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#4F7CFF] hover:bg-blue-600 text-white rounded-[16px] text-xs font-bold transition-all shadow-lg shadow-[#4F7CFF]/25 hover:scale-105"
            >
              <span>Launch Enterprise App</span>
              <ArrowRight className="w-4 h-4 text-[#D8FF4F]" />
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-[14px] bg-white/[0.05] border border-white/10 text-white md:hidden"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#03050B]/95 backdrop-blur-3xl flex flex-col justify-center px-8 space-y-6 md:hidden"
          >
            {['Hero', 'Projects', 'Services', 'Process', 'Awards'].map((item, i) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-display font-bold text-white hover:text-[#D8FF4F] transition-colors"
              >
                0{i + 1}. {item}
              </a>
            ))}
            <a
              href="/dashboard"
              className="py-4 bg-[#4F7CFF] text-white rounded-2xl text-center font-bold text-sm"
            >
              Launch Enterprise Dashboard
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. LANDING HERO (Fullscreen) */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center px-6 lg:px-12 pt-28 pb-16">
        {/* Background Mesh Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#4F7CFF]/15 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#D8FF4F]/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="awwwards-badge text-[#D8FF4F] border-[#D8FF4F]/30 bg-[#D8FF4F]/10">
              <span className="w-2 h-2 rounded-full bg-[#D8FF4F] animate-lime-pulse" />
              Apple × Linear × Awwwards Digital Excellence
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.08]">
              Designing Digital <br />
              <span className="text-apple-gradient">Experiences That</span> <br />
              <span className="text-neon-lime">Feel Alive.</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
              Enterprise-grade document intelligence, vector RAG search pipelines, and SLA contract monitoring engineered with 60fps kinetic motion.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="/dashboard"
                className="px-8 py-4 bg-[#4F7CFF] hover:bg-blue-600 text-white rounded-[20px] text-sm font-bold transition-all shadow-xl shadow-[#4F7CFF]/30 hover:scale-105 flex items-center gap-3"
              >
                <span>Enter Workspace Hub</span>
                <ArrowRight className="w-4 h-4 text-[#D8FF4F]" />
              </a>

              <a
                href="#projects"
                className="px-8 py-4 bg-white/[0.05] hover:bg-white/10 text-slate-200 border border-white/15 rounded-[20px] text-sm font-bold transition-all hover:scale-105"
              >
                Explore Case Studies
              </a>
            </div>

            <div className="flex items-center gap-8 pt-6 border-t border-white/[0.08] text-xs font-mono text-slate-400">
              <div>
                <p className="text-white font-bold text-sm font-mono-num">1,247</p>
                <p>Indexed Documents</p>
              </div>
              <div>
                <p className="text-[#D8FF4F] font-bold text-sm font-mono-num">60 fps</p>
                <p>Fluid Motion</p>
              </div>
              <div>
                <p className="text-[#4F7CFF] font-bold text-sm font-mono-num">95+ score</p>
                <p>Lighthouse Audit</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Card Simulation */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="awwwards-card p-8 w-full max-w-md space-y-6 border-[#4F7CFF]/30 shadow-2xl relative group">
              <div className="w-16 h-16 rounded-[20px] bg-[#4F7CFF]/20 border border-[#4F7CFF]/40 flex items-center justify-center text-[#4F7CFF] text-2xl font-bold font-mono">
                AI
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#D8FF4F]">
                  <span>VECTOR RAG ENGINE</span>
                  <span>ONLINE</span>
                </div>
                <h3 className="text-xl font-bold text-white">KMRL IntelliDocs RAG</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-time semantic retrieval over EasyOCR extracted PDF document text with instant citations.
                </p>
              </div>

              <div className="p-4 bg-black/40 rounded-[16px] border border-white/10 space-y-2 font-mono text-xs text-slate-300">
                <p className="text-emerald-400">✓ ChromaDB Collection: "kmrl_documents"</p>
                <p className="text-blue-400">✓ Embedding: all-MiniLM-L6-v2</p>
                <p className="text-purple-400">✓ SLA Monitor: Active</p>
              </div>

              <a
                href="/ai-assistant"
                className="w-full py-3 bg-[#4F7CFF]/15 border border-[#4F7CFF]/35 hover:bg-[#4F7CFF]/25 text-[#4F7CFF] rounded-[16px] text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#D8FF4F]" />
                Test AI Assistant Chat
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED PROJECTS */}
      <section id="projects" className="py-24 px-6 lg:px-12 relative border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[#D8FF4F] tracking-widest uppercase">02 / FEATURED WORK</span>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mt-2">
                Selected Enterprise Systems.
              </h2>
            </div>
            <p className="text-slate-400 text-sm max-w-sm">
              Hand-crafted software platforms engineered with high aesthetic density and maximum speed.
            </p>
          </div>

          {/* Alternating Project Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PROJECTS.map((proj) => (
              <div key={proj.id} className="awwwards-card p-6 space-y-5 group cursor-pointer">
                <div className="relative overflow-hidden rounded-[18px] aspect-video">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-[#D8FF4F]">
                    {proj.category}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#4F7CFF] transition-colors flex items-center gap-2">
                      {proj.title}
                      <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-[#D8FF4F]" />
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300">{proj.desc}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {proj.tags.map((t) => (
                    <span key={t} className="text-[10px] font-mono bg-white/[0.06] border border-white/10 px-2.5 py-1 rounded-full text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section id="services" className="py-24 px-6 lg:px-12 bg-white/[0.01] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div>
            <span className="text-xs font-mono text-[#4F7CFF] tracking-widest uppercase">03 / CAPABILITIES</span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mt-2">
              Engineering Capabilities.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="awwwards-card p-8 space-y-5 hover:border-[#4F7CFF]/50 transition-all group">
                  <div className="w-14 h-14 rounded-[18px] bg-[#4F7CFF]/15 border border-[#4F7CFF]/30 flex items-center justify-center text-[#4F7CFF] group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#D8FF4F] transition-colors">{s.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PROCESS TIMELINE */}
      <section id="process" className="py-24 px-6 lg:px-12 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div>
            <span className="text-xs font-mono text-[#D8FF4F] tracking-widest uppercase">04 / THE METHODOLOGY</span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mt-2">
              Execution Process.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {TIMELINE.map((step) => (
              <div key={step.step} className="awwwards-card p-6 space-y-4">
                <span className="text-3xl font-display font-extrabold text-[#4F7CFF] font-mono-num">{step.step}</span>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. AWARDS & TELEMETRY COUNTERS */}
      <section id="awards" className="py-20 px-6 lg:px-12 bg-gradient-to-r from-[#4F7CFF]/10 via-transparent to-[#D8FF4F]/10 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {AWARDS.map((a, i) => (
            <div key={i} className="space-y-2">
              <p className="text-4xl lg:text-6xl font-display font-extrabold text-white font-mono-num">{a.count}</p>
              <p className="text-xs font-bold text-[#D8FF4F] uppercase tracking-wider">{a.label}</p>
              <p className="text-[11px] text-slate-400 font-mono">{a.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. MARQUEE CLIENTS */}
      <section className="py-12 border-t border-b border-white/[0.08] overflow-hidden bg-black/40">
        <div className="flex gap-12 whitespace-nowrap animate-marquee">
          {CLIENTS.concat(CLIENTS).map((c, i) => (
            <span key={i} className="text-xl font-display font-extrabold text-slate-500 hover:text-white transition-colors cursor-pointer tracking-widest px-4">
              {c} ·
            </span>
          ))}
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section className="py-28 px-6 lg:px-12 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4F7CFF]/15 rounded-full blur-[180px] pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-8 z-10 relative">
          <span className="awwwards-badge text-[#D8FF4F] border-[#D8FF4F]/30 bg-[#D8FF4F]/10">
            Ready to Explore the Platform?
          </span>

          <h2 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight">
            Elevate Your Enterprise Document Operations.
          </h2>

          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Experience AI document parsing, instant OCR search, and contract SLA monitoring live in your browser.
          </p>

          <div className="pt-4 flex justify-center">
            <a
              href="/dashboard"
              className="px-10 py-5 bg-[#4F7CFF] hover:bg-blue-600 text-white rounded-[24px] text-base font-bold transition-all shadow-2xl shadow-[#4F7CFF]/40 hover:scale-105 flex items-center gap-3"
            >
              <span>Launch Enterprise App Now</span>
              <ArrowRight className="w-5 h-5 text-[#D8FF4F]" />
            </a>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-12 px-6 lg:px-12 border-t border-white/[0.08] bg-[#020307]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[12px] bg-[#4F7CFF] flex items-center justify-center font-bold text-white text-xs">
              KM
            </div>
            <span className="font-display font-bold text-white text-sm">KMRL IntelliDocs</span>
          </div>

          <p>© 2026 Kochi Metro Rail Limited. Engineered to Apple × Awwwards Standards.</p>

          <div className="flex items-center gap-6">
            <a href="/dashboard" className="hover:text-[#D8FF4F] transition-colors">Dashboard</a>
            <a href="/documents" className="hover:text-[#D8FF4F] transition-colors">Documents</a>
            <a href="/ai-assistant" className="hover:text-[#D8FF4F] transition-colors">AI Assistant</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
