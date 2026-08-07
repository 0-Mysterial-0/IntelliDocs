import { useState, useRef, useEffect } from 'react';
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
  'What are the latest safety inspection findings?',
  'Summarize the Q1 2024 financial report',
  'Show me pending tender documents',
  'What are the HR policy updates this year?',
  'List documents requiring approval',
  'What maintenance is scheduled for Blue Line?',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm **IntelliBot**, your AI assistant for KMRL IntelliDocs. I can help you find information in KMRL documents, summarize reports, and answer questions about metro operations. What would you like to know?",
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
      // Demo fallback
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Based on KMRL IntelliDocs, here's what I found about "${text}": The system contains extensive documentation across Operations, Finance, HR, Maintenance, Legal, and Procurement departments. For specific queries, the documents are indexed and searchable. Please check the Documents section for direct access to files.`,
          citations: [{ title: 'Operations Manual', document_id: 'demo-1' }, { title: 'Safety Protocols 2024', document_id: 'demo-2' }],
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
      content: "Chat cleared! I'm IntelliBot, ready to help you explore KMRL documents. What would you like to know?",
      citations: [],
      timestamp: new Date(),
    }]);
    toast.success('Conversation cleared');
  };

  const renderContent = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-300">$1</strong>');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">AI Assistant</h1>
            <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">RAG Powered</span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Ask questions about KMRL documents using natural language</p>
        </div>
        <button onClick={clearChat} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}>
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
              msg.role === 'assistant' ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-sky-500/20 border border-sky-500/30'
            )}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-sky-400" />}
            </div>

            <div className={cn('max-w-[80%] space-y-2', msg.role === 'user' ? 'items-end' : '')}>
              <div className={cn(
                'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                msg.role === 'assistant'
                  ? 'bg-[#1f2937] border border-white/[0.06] text-slate-200'
                  : 'bg-sky-500 text-white'
              )}>
                <p dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Sources
                  </p>
                  {msg.citations.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg hover:bg-white/[0.05] transition-colors cursor-pointer">
                      <FileText className="w-3 h-3 text-sky-400 flex-shrink-0" />
                      <span className="text-xs text-slate-300 truncate">{c.title}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-600 px-1">{formatRelativeTime(msg.timestamp)}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 bg-[#1f2937] border border-white/[0.06] rounded-2xl">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex-shrink-0 py-3">
          <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 pt-3">
        <div className="flex items-end gap-3 bg-[#1f2937] border border-white/[0.08] rounded-2xl p-3 focus-within:border-sky-500/40 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Ask about KMRL documents... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 resize-none focus:outline-none max-h-24"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white hover:bg-sky-600 transition-colors disabled:opacity-40 flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-2 flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3" /> Powered by Ollama Llama3 with Gemini fallback
        </p>
      </div>
    </div>
  );
}
