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
  showQuickQuestions?: boolean;
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

// ── Unique Conversation Histories per Side Chat Session ───────────────────────
const SESSION_MESSAGES: Record<string, Message[]> = {
  s1: [
    {
      id: 's1-1',
      role: 'assistant',
      content: "HELLO! I'M **INTELLIBOT**, YOUR AI ASSISTANT FOR KMRL INTELLIDOCS. I HAVE ACCESSED THE **METRO OPERATIONS & SAFETY INSPECTION** RECORDS.",
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: 's1-2',
      role: 'user',
      content: 'WHAT ARE THE LATEST SAFETY INSPECTION FINDINGS FOR ALUVA TO PETTA CORRIDOR?',
      timestamp: new Date(Date.now() - 7000000),
    },
    {
      id: 's1-3',
      role: 'assistant',
      content: "Based on the Q2 2024 Safety Audit Report for Kochi Metro Rail Limited:\n\n1. **Track Infrastructure**: All 25.6 km of Line 1 (Aluva to Petta) passed acoustic emission testing with **99.4% track integrity**.\n2. **Emergency Braking Systems**: Automatic Train Control (ATC) brake distance tests met 100% compliance standards across Alstom Metropolis rakes.\n3. **Station Fire Safety**: Escalator emergency cutoffs and fire suppression systems at Edapally and Maharajas College stations verified compliant.",
      citations: [
        { title: 'Q2 2024 SAFETY INSPECTION REPORT', document_id: 'doc-002' },
        { title: 'TRACK MAINTENANCE SLA 2024', document_id: 'doc-004' },
      ],
      timestamp: new Date(Date.now() - 6800000),
    },
  ],
  s2: [
    {
      id: 's2-1',
      role: 'assistant',
      content: "HELLO! YOU ARE VIEWING THE **ROLLING STOCK MAINTENANCE SLA TERMS** DISCUSSION SESSION.",
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: 's2-2',
      role: 'user',
      content: 'WHEN DOES THE ALSTOM TRAIN MAINTENANCE CONTRACT EXPIRE?',
      timestamp: new Date(Date.now() - 86000000),
    },
    {
      id: 's2-3',
      role: 'assistant',
      content: "The **Rolling Stock Preventive Maintenance SLA** with Alstom Transport India Ltd. expires in **23 days (August 30, 2024)**.\n\n- **Contract Value**: ₹ 14.50 Crores\n- **Renewal Notice**: A 60-day mandatory advance renewal notice is required to avoid service penalties of ₹ 2 Lakhs/day.",
      citations: [
        { title: 'ROLLING STOCK PREVENTIVE MAINTENANCE SLA', document_id: 'cnt-01' },
      ],
      timestamp: new Date(Date.now() - 85500000),
    },
  ],
  s3: [
    {
      id: 's3-1',
      role: 'assistant',
      content: "HELLO! YOU ARE VIEWING THE **Q1 FINANCIAL AUDIT SUMMARY** DISCUSSION SESSION.",
      timestamp: new Date(Date.now() - 259200000),
    },
    {
      id: 's3-2',
      role: 'user',
      content: 'WHAT WAS THE TOTAL REVENUE FOR Q1 2024?',
      timestamp: new Date(Date.now() - 259000000),
    },
    {
      id: 's3-3',
      role: 'assistant',
      content: "Summary of KMRL Q1 2024 Financial Performance:\n\n- **Total Revenue**: ₹ 42.80 Crores (Up 14.2% YoY driven by Water Metro rider expansion).\n- **Farebox Earnings**: ₹ 31.50 Crores across Line 1 and Water Metro routes.\n- **Non-Farebox Revenue**: ₹ 11.30 Crores (Station kiosk leasing & digital ad screens).\n- **Net Operating Margin**: Positive ₹ 6.40 Crores.",
      citations: [
        { title: 'KMRL Q1 2024 FINANCIAL AUDIT', document_id: 'doc-001' },
        { title: 'WATER METRO REVENUE STATS', document_id: 'doc-005' },
      ],
      timestamp: new Date(Date.now() - 258500000),
    },
  ],
  s4: [
    {
      id: 's4-1',
      role: 'assistant',
      content: "HELLO! YOU ARE VIEWING THE **HR ALLOWANCE GUIDELINES 2024** DISCUSSION SESSION.",
      timestamp: new Date(Date.now() - 432000000),
    },
    {
      id: 's4-2',
      role: 'user',
      content: 'WHAT IS THE REVISED NIGHT SHIFT ALLOWANCE FOR OPERATIONS STAFF?',
      timestamp: new Date(Date.now() - 431000000),
    },
    {
      id: 's4-3',
      role: 'assistant',
      content: "Per KMRL HR Circular 2024:\n\n1. **Night Shift Allowance**: Revised to **₹ 450 per night shift** for operations and track maintenance personnel.\n2. **Medical Cover**: Health insurance limit increased to ₹ 5 Lakhs/year for all permanent employees.\n3. **Paternity Leave**: Extended to 15 calendar days.",
      citations: [
        { title: 'KMRL HR POLICY MANUAL 2024', document_id: 'doc-007' },
      ],
      timestamp: new Date(Date.now() - 430500000),
    },
  ],
};

// ── Specific Hardcoded Q&A Responses ──────────────────────────────────────────
const HARDCODED_ANSWERS: Record<string, { answer: string; citations: { title: string; document_id: string }[] }> = {
  'WHAT ARE THE LATEST SAFETY INSPECTION FINDINGS?': {
    answer: "Based on the Q2 2024 Safety Audit Report for Kochi Metro Rail Limited:\n\n1. **Track Infrastructure**: All 25.6 km of Line 1 (Aluva to Petta) passed acoustic emission testing with **99.4% track integrity**.\n2. **Emergency Braking Systems**: Automatic Train Control (ATC) brake distance tests met 100% compliance standards across Alstom Metropolis rakes.\n3. **Station Fire Safety**: Escalator emergency cutoffs and fire suppression systems at Edapally and Maharajas College stations verified compliant.\n4. **Action Item**: Scheduled preventative maintenance on traction power substation 3 by end of month.",
    citations: [
      { title: 'Q2 2024 SAFETY INSPECTION REPORT', document_id: 'doc-002' },
      { title: 'TRACK MAINTENANCE SLA 2024', document_id: 'doc-004' },
    ],
  },
  'SUMMARIZE THE Q1 2024 FINANCIAL REPORT': {
    answer: "Summary of KMRL Q1 2024 Financial Performance:\n\n- **Total Revenue**: ₹ 42.80 Crores (Up 14.2% YoY driven by Water Metro rider expansion).\n- **Farebox Earnings**: ₹ 31.50 Crores across Line 1 and Water Metro routes.\n- **Non-Farebox Revenue**: ₹ 11.30 Crores (Station kiosk leasing & digital ad screens).\n- **Operational Expenses**: ₹ 36.40 Crores (Power tariffs, vendor contracts & staff payroll).\n- **Net Operating Margin**: Positive ₹ 6.40 Crores.",
    citations: [
      { title: 'KMRL Q1 2024 FINANCIAL AUDIT', document_id: 'doc-001' },
      { title: 'WATER METRO REVENUE STATS', document_id: 'doc-005' },
    ],
  },
  'SHOW ME PENDING TENDER DOCUMENTS': {
    answer: "Active KMRL Pending Tenders currently under technical review:\n\n1. **Tender Ref KMRL/PROC/2024/099**: Supply of Solar PV Rooftop Systems for Muttom Depot (Estimated ₹ 4.80 Cr).\n2. **Tender Ref KMRL/OPER/2024/042**: Station Housekeeping & Sanitation Services (Estimated ₹ 6.20 Cr).\n3. **Tender Ref KMRL/IT/2024/015**: Upgrade of Automated Fare Collection (AFC) QR & NCMC Card Validators (Estimated ₹ 2.90 Cr).",
    citations: [
      { title: 'MUTTOM DEPOT SOLAR TENDER NIT', document_id: 'doc-003' },
      { title: 'AFC UPGRADE BID DOCUMENTS', document_id: 'doc-006' },
    ],
  },
  'WHAT ARE THE HR POLICY UPDATES THIS YEAR?': {
    answer: "KMRL HR Circular 2024 Highlights:\n\n1. **Enhanced Medical Cover**: Health insurance limit increased to ₹ 5 Lakhs/year for all permanent employees.\n2. **Night Shift Allowance**: Revised to ₹ 450 per night shift for operations and track maintenance personnel.\n3. **Parental Leave Policy**: Paid Paternity Leave extended to 15 calendar days.\n4. **Professional Development**: Annual training sponsorship of up to ₹ 50,000 for certified railway system courses.",
    citations: [
      { title: 'KMRL HR POLICY MANUAL 2024', document_id: 'doc-007' },
      { title: 'NIGHT SHIFT ALLOWANCE CIRCULAR', document_id: 'doc-008' },
    ],
  },
  'LIST DOCUMENTS REQUIRING APPROVAL': {
    answer: "The following KMRL documents are awaiting executive approval:\n\n1. **Rolling Stock Maintenance Renewal SLA** (High Priority - Expiry in 23 Days)\n2. **Water Metro Phase 2 Feeder Route Approval** (Medium Priority)\n3. **Station Kiosk Advertising Contract Extension** (Low Priority)\n4. **Muttom Depot Safety Equipment Procurement** (Critical Priority)",
    citations: [
      { title: 'ROLLING STOCK RENEWAL SLA', document_id: 'cnt-01' },
      { title: 'WATER METRO PHASE 2 FEEDER PLAN', document_id: 'doc-009' },
    ],
  },
  'WHAT MAINTENANCE IS SCHEDULED FOR BLUE LINE?': {
    answer: "Scheduled Maintenance for Line 1 (Aluva - Petta Corridor):\n\n1. **Traction Overhead Equipment (OHE)**: Nightly inspection between 01:00 AM - 04:00 AM at Kalamassery & Edapally.\n2. **Rolling Stock HVAC Servicing**: Scheduled for 6 Metropolis trainsets at Muttom Workshop on Saturday.\n3. **Track Grinding & Rail Alignment**: Kilometer 12.4 to 18.2 scheduled for Sunday non-revenue hours.",
    citations: [
      { title: 'LINE 1 MAINTENANCE SCHEDULE Q3', document_id: 'doc-010' },
    ],
  },
};

export default function AIAssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(PAST_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('s1');
  const [messages, setMessages] = useState<Message[]>(SESSION_MESSAGES['s1']);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const cleanText = text.trim();
    const upperText = cleanText.toUpperCase();

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: cleanText,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    // ── 1. Check Hello Detection ─────────────────────────────────────────────
    const isHello = /^(hello|hi|hey|hello sir|hi sir|good morning|good afternoon|good evening)/i.test(cleanText);
    if (isHello) {
      await new Promise((r) => setTimeout(r, 400));
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Hello sir, how can we help you?',
          citations: [],
          timestamp: new Date(),
          showQuickQuestions: true, // Display interactive hardcoded question buttons underneath!
        },
      ]);
      setLoading(false);
      return;
    }

    // ── 2. Check Specific Hardcoded Q&A Match ─────────────────────────────────
    const matchedQA = HARDCODED_ANSWERS[upperText];
    if (matchedQA) {
      await new Promise((r) => setTimeout(r, 500));
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: matchedQA.answer,
          citations: matchedQA.citations,
          timestamp: new Date(),
        },
      ]);
      setLoading(false);
      return;
    }

    // ── 3. Fallback to API / RAG Engine ──────────────────────────────────────
    try {
      const resp = await chatApi.sendMessage(cleanText, sessionId);
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
          content: `BASED ON KMRL INTELLIDOCS, HERE'S WHAT I FOUND ABOUT "${upperText}": THE SYSTEM CONTAINS EXTENSIVE DOCUMENTATION ACROSS OPERATIONS, FINANCE, HR, MAINTENANCE, LEGAL, AND PROCUREMENT DEPARTMENTS. ALL RECORDS ARE INDEXED AND RETRIEVABLE.`,
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
    const newSess: ChatSession = { id: newSessId, title: 'New Assistant Conversation', date: 'Just now', active: true };
    setSessions((prev) => [newSess, ...prev.map((s) => ({ ...s, active: false }))]);
    setActiveSessionId(newSessId);

    const initMsgs: Message[] = [{
      id: 'welcome',
      role: 'assistant',
      content: "Hello sir, how can we help you?",
      showQuickQuestions: true,
      citations: [],
      timestamp: new Date(),
    }];
    SESSION_MESSAGES[newSessId] = initMsgs;
    setMessages(initMsgs);
    toast.success('New chat session started');
  };

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    setSessions((prev) => prev.map((s) => ({ ...s, active: s.id === id })));
    // Load that specific side chat's unique message history!
    const sessionMsgs = SESSION_MESSAGES[id] || [
      {
        id: `welcome-${id}`,
        role: 'assistant',
        content: "Hello sir, how can we help you?",
        showQuickQuestions: true,
        citations: [],
        timestamp: new Date(),
      },
    ];
    setMessages(sessionMsgs);
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

                <div className={cn('max-w-[80%] space-y-2', msg.role === 'user' ? 'flex flex-col items-end' : '')}>
                  <div className={cn(
                    'p-4 text-xs leading-relaxed pixel-box font-pixel-code',
                    msg.role === 'assistant'
                      ? 'bg-black border-2 border-zinc-700 text-zinc-100'
                      : 'bg-[#18181b] border-2 border-white text-white shadow-[3px_3px_0px_0px_#ffffff]'
                  )}>
                    <p dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />

                    {/* Interactive Quick Questions underneath "Hello sir, how can we help you?" */}
                    {msg.showQuickQuestions && (
                      <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">SELECT A QUESTION BELOW:</p>
                        <div className="flex flex-col gap-1.5">
                          {SUGGESTED_QUESTIONS.map((q) => (
                            <button
                              key={q}
                              onClick={() => sendMessage(q)}
                              className="text-left text-[11px] px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:border-white transition-all uppercase font-bold flex items-center justify-between group"
                            >
                              <span>{q}</span>
                              <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-white flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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

          {/* Suggestions at bottom if conversation is brand new */}
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
