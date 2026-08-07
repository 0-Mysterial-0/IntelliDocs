import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bot, Database, HardDrive, Bell, Shield, ChevronRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const sections = [
  { id: 'ai', label: 'AI & ML', icon: Bot },
  { id: 'storage', label: 'STORAGE', icon: HardDrive },
  { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell },
  { id: 'security', label: 'SECURITY', icon: Shield },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'w-12 h-6 border-2 transition-all p-0.5 relative',
        value ? 'bg-white border-white' : 'bg-black border-zinc-700'
      )}
    >
      <div className={cn('w-4 h-4 bg-black transition-transform', value ? 'translate-x-6 bg-black' : 'translate-x-0 bg-white')} />
    </button>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('ai');
  const [settings, setSettings] = useState({
    use_ollama: true,
    use_gemini_fallback: true,
    auto_classify: true,
    auto_summarize: true,
    ocr_languages: ['en', 'ml'],
    embedding_model: 'all-MiniLM-L6-v2',
    max_upload_size_mb: 50,
    storage_quota_gb: 100,
    duplicate_threshold: 0.92,
    notification_email: true,
    notification_upload: true,
    notification_approval: true,
    notification_ai: true,
    session_timeout_hours: 24,
    require_2fa: false,
    audit_logging: true,
    gemini_api_key: '',
    ollama_model: 'llama3',
  });

  const update = (key: string, value: unknown) => setSettings((s) => ({ ...s, [key]: value }));

  const save = () => toast.success('Settings saved successfully');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto font-pixel"
    >
      <div className="mb-6">
        <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">SYSTEM CONFIGURATION</h1>
        <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">CONFIGURE KMRL INTELLIDOCS AI, STORAGE, AND SECURITY SETTINGS</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-2 font-pixel-code">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 border text-xs font-bold transition-all text-left uppercase',
                activeSection === id
                  ? 'bg-white text-black border-white shadow-[3px_3px_0px_0px_#ffffff]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-white hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 stroke-[2.5]" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5">
          {activeSection === 'ai' && (
            <>
              <div className="pixel-box p-5 space-y-5 animate-pixel-float">
                <h3 className="font-pixel-head font-bold text-white text-xs font-bloom flex items-center gap-2">
                  <Bot className="w-4 h-4 text-white stroke-[2.5]" /> AI MODELS TELEMETRY
                </h3>
                {[
                  { key: 'use_ollama', label: 'USE OLLAMA (LOCAL LLM)', desc: 'PRIMARY AI PROCESSING WITH LOCAL LLAMA3 MODEL' },
                  { key: 'use_gemini_fallback', label: 'GEMINI API FALLBACK', desc: 'USE GOOGLE GEMINI WHEN OLLAMA IS UNAVAILABLE' },
                  { key: 'auto_classify', label: 'AUTO-CLASSIFY DOCUMENTS', desc: 'AUTOMATICALLY CLASSIFY UPLOADED DOCUMENTS' },
                  { key: 'auto_summarize', label: 'AUTO-SUMMARIZE DOCUMENTS', desc: 'GENERATE AI SUMMARIES AFTER UPLOAD' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-none font-pixel-code">
                    <div>
                      <p className="text-xs font-bold text-white uppercase">{label}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5 uppercase">{desc}</p>
                    </div>
                    <Toggle value={(settings as any)[key]} onChange={(v) => update(key, v)} />
                  </div>
                ))}
              </div>

              {/* Removed Model Configuration section as requested */}
            </>
          )}

          {activeSection === 'storage' && (
            <div className="pixel-box p-5 space-y-4 font-pixel-code animate-pixel-float">
              <h3 className="font-pixel-head font-bold text-white text-xs font-bloom flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-white stroke-[2.5]" /> STORAGE CONFIGURATION
              </h3>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase font-bold">MAX UPLOAD SIZE (MB)</label>
                <input type="number" value={settings.max_upload_size_mb} onChange={(e) => update('max_upload_size_mb', parseInt(e.target.value))} className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white focus:outline-none uppercase" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase font-bold">STORAGE QUOTA (GB)</label>
                <input type="number" value={settings.storage_quota_gb} onChange={(e) => update('storage_quota_gb', parseInt(e.target.value))} className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white focus:outline-none uppercase" />
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="pixel-box p-5 space-y-5 animate-pixel-float">
              <h3 className="font-pixel-head font-bold text-white text-xs font-bloom flex items-center gap-2">
                <Bell className="w-4 h-4 text-white stroke-[2.5]" /> NOTIFICATION PREFERENCES
              </h3>
              {[
                { key: 'notification_email', label: 'EMAIL NOTIFICATIONS', desc: 'RECEIVE EMAIL ALERTS FOR IMPORTANT EVENTS' },
                { key: 'notification_upload', label: 'UPLOAD COMPLETE', desc: 'NOTIFY WHEN DOCUMENT PROCESSING IS DONE' },
                { key: 'notification_approval', label: 'APPROVAL REQUESTS', desc: 'NOTIFY WHEN APPROVAL IS REQUESTED OR DECIDED' },
                { key: 'notification_ai', label: 'AI PROCESSING', desc: 'NOTIFY WHEN AI ANALYSIS COMPLETES' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-none font-pixel-code">
                  <div>
                    <p className="text-xs font-bold text-white uppercase">{label}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 uppercase">{desc}</p>
                  </div>
                  <Toggle value={(settings as any)[key]} onChange={(v) => update(key, v)} />
                </div>
              ))}
            </div>
          )}

          {activeSection === 'security' && (
            <div className="pixel-box p-5 space-y-5 animate-pixel-float">
              <h3 className="font-pixel-head font-bold text-white text-xs font-bloom flex items-center gap-2">
                <Shield className="w-4 h-4 text-white stroke-[2.5]" /> SECURITY POLICIES
              </h3>
              {[
                { key: 'require_2fa', label: 'REQUIRE TWO-FACTOR AUTHENTICATION', desc: 'ENFORCE 2FA FOR ALL USER ACCOUNTS' },
                { key: 'audit_logging', label: 'AUDIT LOGGING', desc: 'LOG ALL DOCUMENT AND USER ACTIONS' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-none font-pixel-code">
                  <div>
                    <p className="text-xs font-bold text-white uppercase">{label}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 uppercase">{desc}</p>
                  </div>
                  <Toggle value={(settings as any)[key]} onChange={(v) => update(key, v)} />
                </div>
              ))}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={save}
            className="pixel-btn-white flex items-center gap-2 ml-auto"
          >
            <Save className="w-4 h-4 stroke-[3]" />
            <span>SAVE SETTINGS</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
