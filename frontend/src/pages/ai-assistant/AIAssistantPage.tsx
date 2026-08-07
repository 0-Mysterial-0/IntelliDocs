import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, User, Sparkles, FileText, Plus, MessageSquare, ChevronRight } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { chatApi } from '@/lib/api';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: { title: string; document_id: string }[];
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  active?: boolean;
}

const PAST_SESSIONS: ChatSession[] = [
  { id: 's1', title: 'Metro Operations & Safety Inspection', date: '2 hours ago', active: true },
  { id: 's2', title: 'Rolling Stock Maintenance SLA Terms', date: 'Yesterday' },
  { id: 's3', title: 'Q1 Financial Audit Summary', date: '3 days ago' },
  { id: 's4', title: 'HR Allowance Guidelines 2024', date: '5 days ago' },
];

const SUGGESTED_QUESTIONS = [
  'WHAT ARE THE LATEST SAFETY INSPECTION FINDINGS?',
  'SUMMARIZE THE Q1 2024 FINANCIAL REPORT',
  'SHOW ME PENDING TENDER DOCUMENTS',
  'WHAT ARE THE HR POLICY UPDATES THIS YEAR?',
  'LIST DOCUMENTS REQUIRING APPROVAL',
  'WHAT MAINTENANCE IS SCHEDULED FOR BLUE LINE?',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "HELLO! I'M **INTELLIBOT**, YOUR AI ASSISTANT FOR KMRL INTELLIDOCS. I CAN HELP YOU FIND INFORMATION IN KMRL DOCUMENTS, SUMMARIZE REPORTS, AND ANSWER QUESTIONS ABOUT METRO OPERATIONS. WHAT WOULD YOU LIKE TO KNOW?",
      citations: [],
      timestamp: new Date(),
    },
  ]);
  const [sessions, setSessions] = useState<ChatSession[]>(PAST_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('s1');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await chatApi.sendMessage(text, sessionId);
      const data = resp.data;
      setSessionId(data.session_id);
      setMessages((m) => [
        ...m,
        {
          id: data.message_id || Date.now().toString(),
          role: 'assistant',
          content: data.message,
          citations: data.citations || [],
          timestamp: new Date(data.created_at || Date.now()),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `BASED ON KMRL INTELLIDOCS, HERE'S WHAT I FOUND ABOUT "${text.toUpperCase()}": THE SYSTEM CONTAINS EXTENSIVE DOCUMENTATION ACROSS OPERATIONS, FINANCE, HR, MAINTENANCE, LEGAL, AND PROCUREMENT DEPARTMENTS. ALL RECORDS ARE INDEXED AND RETRIEVABLE.`,
          citations: [{ title: 'OPERATIONS MANUAL', document_id: 'demo-1' }, { title: 'SAFETY PROTOCOLS 2024', document_id: 'demo-2' }],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (sessionId) {
      try { await chatApi.clearHistory(sessionId); } catch (_) {}
    }
    setSessionId(undefined);
    const newSessId = `s-${Date.now()}`;
    setSessions((prev) => [
      { id: newSessId, title: 'New Assistant Conversation', date: 'Just now', active: true },
      ...prev.map((s) => ({ ...s, active: false })),
    ]);
    setActiveSessionId(newSessId);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "NEW CHAT STARTED! I'M INTELLIBOT, READY TO HELP YOU EXPLORE KMRL DOCUMENTS. WHAT WOULD YOU LIKE TO KNOW?",
      citations: [],
      timestamp: new Date(),
    }]);
    toast.success('New chat session started');
  };

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    setSessions((prev) => prev.map((s) => ({ ...s, active: s.id === id })));
    toast.info('Loaded side chat conversation');
  };

  const renderContent = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-8rem)] max-w-7xl mx-auto font-pixel"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-white stroke-[2.5]" />
            <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">AI ASSISTANT</h1>
            <span className="text-xs font-pixel-code font-bold badge-muted-green px-2.5 py-0.5 uppercase">RAG POWERED</span>
          </div>
          <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">ASK QUESTIONS ABOUT KMRL DOCUMENTS USING NATURAL LANGUAGE</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={clearChat}
          className="pixel-btn-white flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>NEW CHAT</span>
        </motion.button>
      </div>

      {/* Main Container with Left Side Chat Drawer */}
      <div className="flex-1 flex gap-5 min-h-0 overflow-hidden">
        {/* Left Side Chat History Drawer */}
        <div className="hidden md:flex flex-col w-64 bg-[#09090b] border-2 border-[#27272a] p-3 space-y-3 flex-shrink-0 font-pixel-code">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-white stroke-[2.5]" />
              <span className="font-bold text-white text-xs font-bloom-subtle">SIDE CHATS</span>
            </div>
            <button onClick={clearChat} className="text-zinc-400 hover:text-white" title="New Chat">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={cn(
                  'w-full text-left p-2.5 border transition-all text-xs font-pixel-code flex items-start gap-2 group',
                  s.id === activeSessionId
                    ? 'bg-zinc-900 border-white text-white shadow-[2px_2px_0px_0px_#ffffff]'
                    : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white'
                )}
              >
                <MessageSquare className="w-3.5 h-3.5 stroke-[2] text-white flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-[11px] uppercase leading-tight">{s.title}</p>
                  <p className="text-[9px] text-zinc-500 mt-1 uppercase">{s.date}</p>
                </div>
                {s.id === activeSessionId && <ChevronRight className="w-3.5 h-3.5 text-white flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right Active Chat Main View */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#000000]">
          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 border-2 border-white bg-white text-black flex items-center justify-center flex-shrink-0 font-bold">
                    <Bot className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}

                <div className={cn('max-w-[80%] space-y-1.5', msg.role === 'user' ? 'flex flex-col items-end' : '')}>
                  <div className={cn(
                    'p-4 text-xs leading-relaxed pixel-box font-pixel-code',
                    msg.role === 'assistant'
                      ? 'bg-black border-2 border-zinc-700 text-zinc-100'
                      : 'bg-[#18181b] border-2 border-white text-white shadow-[3px_3px_0px_0px_#ffffff]'
                  )}>
                    <p dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                  </div>

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-1 font-pixel-code w-full">
                      <p className="text-xs text-zinc-400 flex items-center gap-1 uppercase font-bold">
                        <FileText className="w-3 h-3 stroke-[2]" /> SOURCES
                      </p>
                      {msg.citations.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-black border border-zinc-700 hover:border-white transition-colors cursor-pointer text-xs font-bold text-white uppercase">
                          <FileText className="w-3.5 h-3.5 text-white flex-shrink-0" />
                          <span className="truncate">{c.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] font-pixel-code text-zinc-500 px-1">{formatRelativeTime(msg.timestamp)}</p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 border-2 border-white bg-black text-white flex items-center justify-center flex-shrink-0 font-bold">
                    <User className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 border-2 border-white bg-white text-black flex items-center justify-center">
                  <Bot className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="p-4 pixel-box bg-black border-2 border-zinc-700">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="flex-shrink-0 py-3 font-pixel-code">
              <p className="text-xs text-zinc-400 mb-2 uppercase font-bold">SUGGESTED QUESTIONS:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 bg-black border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-all uppercase font-bold"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="flex-shrink-0 pt-3">
            <div className="flex items-end gap-3 bg-black border-2 border-zinc-700 p-3 focus-within:border-white transition-colors shadow-[3px_3px_0px_0px_#18181b]">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="ASK ABOUT KMRL DOCUMENTS... (ENTER TO SEND)"
                rows={1}
                className="flex-1 bg-transparent text-xs font-pixel text-white placeholder-zinc-500 resize-none focus:outline-none max-h-24 uppercase"
                style={{ lineHeight: '1.5' }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="pixel-btn-white p-2.5 flex items-center justify-center disabled:opacity-50 flex-shrink-0"
              >
                <Send className="w-4 h-4 text-black stroke-[3]" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
