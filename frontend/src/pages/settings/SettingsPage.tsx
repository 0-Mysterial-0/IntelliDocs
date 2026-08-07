import { useState } from 'react';
import { Settings, Bot, Database, HardDrive, Bell, Shield, ChevronRight, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const sections = [
  { id: 'ai', label: 'AI & ML', icon: Bot },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn('relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none', value ? 'bg-sky-500' : 'bg-white/10')}
    >
      <div className={cn('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200', value ? 'translate-x-5' : 'translate-x-0')} />
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure KMRL IntelliDocs AI, storage, and security settings</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0 space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                activeSection === id ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeSection === 'ai' && (
            <>
              <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 space-y-5">
                <h3 className="font-semibold text-white flex items-center gap-2"><Bot className="w-4 h-4 text-sky-400" /> AI Models</h3>
                {[
                  { key: 'use_ollama', label: 'Use Ollama (Local LLM)', desc: 'Primary AI processing with local Llama3 model' },
                  { key: 'use_gemini_fallback', label: 'Gemini API Fallback', desc: 'Use Google Gemini when Ollama is unavailable' },
                  { key: 'auto_classify', label: 'Auto-classify Documents', desc: 'Automatically classify uploaded documents' },
                  { key: 'auto_summarize', label: 'Auto-summarize Documents', desc: 'Generate AI summaries after upload' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                    <Toggle value={(settings as any)[key]} onChange={(v) => update(key, v)} />
                  </div>
                ))}
              </div>

              <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-white">Model Configuration</h3>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Gemini API Key</label>
                  <input
                    type="password"
                    value={settings.gemini_api_key}
                    onChange={(e) => update('gemini_api_key', e.target.value)}
                    placeholder="AIza..."
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Ollama Model</label>
                  <select value={settings.ollama_model} onChange={(e) => update('ollama_model', e.target.value)} className="w-full px-4 py-2.5 bg-[#111827] border border-white/10 rounded-xl text-sm text-white focus:outline-none">
                    {['llama3', 'llama3:8b', 'mistral', 'gemma2'].map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Duplicate Threshold ({Math.round(settings.duplicate_threshold * 100)}%)</label>
                  <input type="range" min={0.7} max={1} step={0.01} value={settings.duplicate_threshold} onChange={(e) => update('duplicate_threshold', parseFloat(e.target.value))} className="w-full accent-sky-500" />
                </div>
              </div>
            </>
          )}

          {activeSection === 'storage' && (
            <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2"><HardDrive className="w-4 h-4 text-sky-400" /> Storage Settings</h3>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Max Upload Size (MB)</label>
                <input type="number" value={settings.max_upload_size_mb} onChange={(e) => update('max_upload_size_mb', parseInt(e.target.value))} className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500/50" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Storage Quota (GB)</label>
                <input type="number" value={settings.storage_quota_gb} onChange={(e) => update('storage_quota_gb', parseInt(e.target.value))} className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500/50" />
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 space-y-5">
              <h3 className="font-semibold text-white flex items-center gap-2"><Bell className="w-4 h-4 text-sky-400" /> Notification Preferences</h3>
              {[
                { key: 'notification_email', label: 'Email Notifications', desc: 'Receive email alerts for important events' },
                { key: 'notification_upload', label: 'Upload Complete', desc: 'Notify when document processing is done' },
                { key: 'notification_approval', label: 'Approval Requests', desc: 'Notify when approval is requested or decided' },
                { key: 'notification_ai', label: 'AI Processing', desc: 'Notify when AI analysis completes' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <Toggle value={(settings as any)[key]} onChange={(v) => update(key, v)} />
                </div>
              ))}
            </div>
          )}

          {activeSection === 'security' && (
            <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 space-y-5">
              <h3 className="font-semibold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-sky-400" /> Security Settings</h3>
              {[
                { key: 'require_2fa', label: 'Require Two-Factor Authentication', desc: 'Enforce 2FA for all user accounts' },
                { key: 'audit_logging', label: 'Audit Logging', desc: 'Log all document and user actions' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <Toggle value={(settings as any)[key]} onChange={(v) => update(key, v)} />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Session Timeout (hours)</label>
                <input type="number" value={settings.session_timeout_hours} onChange={(e) => update('session_timeout_hours', parseInt(e.target.value))} className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500/50" />
              </div>
            </div>
          )}

          <button
            onClick={save}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium text-sm transition-colors ml-auto"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
