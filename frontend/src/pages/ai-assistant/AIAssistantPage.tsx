import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, User, X, Sparkles, FileText, Loader2, RefreshCw } from 'lucide-react';
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
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `BASED ON KMRL INTELLIDOCS, HERE'S WHAT I FOUND ABOUT "${text}": THE SYSTEM CONTAINS EXTENSIVE DOCUMENTATION ACROSS OPERATIONS, FINANCE, HR, MAINTENANCE, LEGAL, AND PROCUREMENT DEPARTMENTS. FOR SPECIFIC QUERIES, THE DOCUMENTS ARE INDEXED AND SEARCHABLE.`,
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
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "CHAT CLEARED! I'M INTELLIBOT, READY TO HELP YOU EXPLORE KMRL DOCUMENTS. WHAT WOULD YOU LIKE TO KNOW?",
      citations: [],
      timestamp: new Date(),
    }]);
    toast.success('Conversation cleared');
  };

  const renderContent = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bloom-subtle">$1</strong>');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-8rem)] max-w-6xl mx-auto font-pixel"
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
          className="pixel-btn-dark flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>NEW CHAT</span>
        </motion.button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
            <div className={cn(
              'w-8 h-8 border-2 border-white flex items-center justify-center flex-shrink-0 font-bold',
              msg.role === 'assistant' ? 'bg-white text-black' : 'bg-black text-white'
            )}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 stroke-[2.5]" /> : <User className="w-4 h-4 stroke-[2.5]" />}
            </div>

            <div className={cn('max-w-[80%] space-y-2', msg.role === 'user' ? 'items-end' : '')}>
              <div className={cn(
                'p-4 text-xs leading-relaxed pixel-box',
                msg.role === 'assistant'
                  ? 'bg-black border-2 border-zinc-700 text-white'
                  : 'bg-white text-black border-2 border-white shadow-[3px_3px_0px_0px_#ffffff]'
              )}>
                <p dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="space-y-1 font-pixel-code">
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

      {/* Input */}
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
            className="pixel-btn-white flex items-center justify-center disabled:opacity-40 flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 stroke-[3]" />}
          </motion.button>
        </div>
        <p className="text-center text-[10px] font-pixel-code text-zinc-500 mt-2 flex items-center justify-center gap-1 uppercase">
          <Sparkles className="w-3 h-3" /> POWERED BY OLLAMA LLAMA3 WITH GEMINI FALLBACK
        </p>
      </div>
    </motion.div>
  );
}
