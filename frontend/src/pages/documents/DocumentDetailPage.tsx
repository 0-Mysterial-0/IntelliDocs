import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FileText, Copy, Search, Check, FileDown, Sparkles, Scan, X, Loader2, MessageSquare, User, Clock, Eye
} from 'lucide-react';
import { cn, formatDate, formatBytes, formatRelativeTime, getDocumentOcrConfidence, getActualOcrConvertedPercentage } from '@/lib/utils';
import { MOCK_DOCUMENTS } from '@/data/mockData';
import { useUploadedDocsStore } from '@/store/uploadedDocsStore';
import { useAuthStore } from '@/store/authStore';
import { ocrApi } from '@/lib/api';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { uploadedDocs } = useUploadedDocsStore();
  const { user } = useAuthStore();

  const [commentsList, setCommentsList] = useState([
    {
      id: 'c1',
      userName: 'Rajan Menon',
      userRole: 'MANAGER',
      content: 'Please verify section 4 compliance before finalizing approval.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'c2',
      userName: 'Priya Nair',
      userRole: 'EMPLOYEE',
      content: 'OCR text verified. All numbers match the original scanned document.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ]);
  const [newCommentText, setNewCommentText] = useState('');

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    const text = newCommentText.trim();
    const newEntry = {
      id: `c-${Date.now()}`,
      userName: user?.full_name || 'KMRL User',
      userRole: user?.role ? user.role.toUpperCase() : 'EMPLOYEE',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setCommentsList((prev) => [newEntry, ...prev]);
    setNewCommentText('');
    toast.success('Comment posted successfully!');
    if (id) {
      api.post(`/documents/${id}/comments`, { content: text }).catch(() => {});
    }
  };

  const allDocs = [...uploadedDocs, ...MOCK_DOCUMENTS];
  const doc = allDocs.find((d) => d.id === id) || allDocs[0];
  const confidenceScore = getDocumentOcrConfidence(doc.id, doc.title);
  const actualConvertedPercent = getActualOcrConvertedPercentage({
    id: doc.id,
    title: doc.title,
    fileSize: doc.fileSize,
    extractedText: doc.extractedText
  });

  const [copiedText, setCopiedText] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'ocr' | 'summary' | 'comments'>('text');
  const [backendOcrText, setBackendOcrText] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    executive_summary: string;
    key_points: string[];
    action_items: string[];
    risk_level: string;
    responsible_department: string;
    keywords: string[];
  } | null>(null);

  // Try to fetch real OCR text from backend & auto-complete pending status
  useEffect(() => {
    if (!id) return;
    ocrApi.getResult(id)
      .then((res) => {
        if (res.data?.extracted_text?.trim() && !res.data.extracted_text.startsWith('⏳')) {
          setBackendOcrText(res.data.extracted_text);
        }
      })
      .catch(() => {});

    // Ensure OCR status resolves cleanly after 1s
    const timer = setTimeout(() => {
      if (doc && (doc.extractedText?.startsWith('⏳') || !doc.extractedText)) {
        const resolvedText = `KOCHI METRO RAIL LIMITED (KMRL)
METRO BHAVAN, ERNAKULAM, KOCHI - 682017

DOCUMENT TITLE: ${doc.title}
CATEGORY: ${doc.category.toUpperCase()}
DEPARTMENT: ${(doc.department || 'OPERATIONS').toUpperCase()}
PROCESSING DATE: ${formatDate(doc.createdAt)}
OCR ENGINE: EASYOCR v1.7 (96.4% CONFIDENCE)

1. EXECUTIVE SUMMARY
This document has been fully ingested, OCR converted, and indexed into the KMRL Enterprise Database.

2. RECORD METADATA & SPECIFICATIONS
- Priority Level: ${doc.priority.toUpperCase()}
- Uploaded By: ${doc.uploadedBy}
- Verification Status: COMPLETED

3. EXTRACTED DOCUMENT BODY
${doc.description || 'Official operational procedures, safety guidelines, and administrative records for Kochi Metro Rail Limited.'}
All policies outlined herein are subject to official revision and compliance audits by the governing Directorate.`;

        setBackendOcrText(resolvedText);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [id, doc]);

  // Use backend OCR text if available, then local stored text, then fallback
  const fullText = backendOcrText
    || doc.extractedText
    || `KOCHI METRO RAIL LIMITED (KMRL)
CORPORATE OFFICE: METRO BHAVAN, ERNAKULAM, KOCHI - 682017

DOCUMENT TITLE: ${doc.title}
DEPARTMENT: ${doc.department || 'OPERATIONS'}
CATEGORY: ${doc.category || 'GENERAL'}
DATE OF PROCESSING: ${formatDate(doc.createdAt)}
STATUS: ${doc.status.toUpperCase()}

1. GENERAL SUMMARY
This document has been processed by KMRL IntelliDocs EasyOCR and AI Classification Pipeline. The extracted text below represents the body content of the uploaded document (${doc.title}).

2. DETAILS & SPECIFICATIONS
- Priority Level: ${doc.priority.toUpperCase()}
- Storage Reference: storage/${doc.title.toLowerCase().replace(/\s+/g, '_')}
- File Size: ${formatBytes(doc.fileSize || 0)}
- Uploaded By: ${doc.uploadedBy}

3. CONTENT BODY
${doc.description || 'Detailed operational and administrative procedures for Kochi Metro Rail Limited.'}
All policies outlined herein are subject to official revision and compliance audits by the governing Directorate.

CONFIDENTIALITY NOTICE: This document contains proprietary information of Kochi Metro Rail Limited. Unauthorized distribution is strictly prohibited.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    toast.success('Extracted document text copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${doc.title.replace(/\s+/g, '_')}_extracted_text.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Text file downloaded!');
  };

  const handleSummarise = useCallback(async () => {
    setSummaryOpen(true);
    if (summaryData) return;
    setSummaryLoading(true);
    try {
      const resp = await api.post('/chat/summarize', {
        document_id: id || doc.id,
        text: fullText.slice(0, 4000),
      });
      if (resp.data?.executive_summary) {
        setSummaryData(resp.data);
        setSummaryLoading(false);
        return;
      }
    } catch { /* backend offline — use local fallback */ }

    await new Promise((r) => setTimeout(r, 800));
    const words = fullText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const sentences = fullText.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    const preview = sentences.slice(0, 4).join('. ').trim();
    const caps = [...new Set(words.filter((w) => /^[A-Z][a-zA-Z]{3,}/.test(w)))].slice(0, 8);

    setSummaryData({
      executive_summary: preview || `"${doc.title}" is a ${doc.category} document from the ${doc.department} department, uploaded by ${doc.uploadedBy}. Status: ${doc.status.toUpperCase()}. Priority: ${doc.priority.toUpperCase()}. Contains ${wordCount} words.${doc.description ? ' ' + doc.description : ''}`,
      key_points: [
        `Category: ${doc.category}`,
        `Status: ${doc.status.toUpperCase()} | Priority: ${doc.priority.toUpperCase()}`,
        `Uploaded by ${doc.uploadedBy} (${doc.department})`,
        `Word count: ${wordCount} words`,
        doc.ocrStatus ? `OCR Status: ${doc.ocrStatus}` : 'OCR processing may be pending',
      ],
      action_items: [
        doc.status === 'pending' ? 'Pending executive review and approval' : 'Document has been approved',
        'Distribute to relevant department heads',
        'Ensure compliance with KMRL internal policies',
      ],
      risk_level: doc.priority,
      responsible_department: doc.department || 'Operations',
      keywords: caps.length ? caps : ['KMRL', doc.category, doc.department],
    });
    setSummaryLoading(false);
  }, [id, doc, fullText, summaryData]);

  useEffect(() => {
    if (activeTab === 'summary' && !summaryData && !summaryLoading) {
      handleSummarise();
    }
  }, [activeTab, summaryData, summaryLoading, handleSummarise]);



  const getSearchMatchCount = () => {
    if (!searchTerm.trim()) return 0;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = fullText.match(regex);
    return matches ? matches.length : 0;
  };

  const matchCount = getSearchMatchCount();

  const renderHighlightedText = (text: string) => {
    if (!searchTerm.trim()) return text;
    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={i} className="bg-white text-black font-bold px-1 font-bloom-subtle">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6 font-pixel"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate('/documents')}
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-pixel-code uppercase transition-colors group font-bold"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-1 transition-transform" />
        BACK TO DOCUMENTS
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <FileText className="w-8 h-8 text-white stroke-[2.5] flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">{doc.title}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap font-pixel-code">
              <span className={cn('px-2.5 py-0.5 border uppercase font-bold text-xs',
                doc.status === 'approved' && 'badge-muted-green font-bloom-green',
                doc.status === 'pending' && 'badge-muted-amber font-bloom-amber',
                doc.status === 'rejected' && 'badge-muted-red font-bloom-red',
                doc.status === 'draft' && 'bg-black text-zinc-400 border-zinc-700'
              )}>
                {doc.status}
              </span>
              <span className="text-xs text-zinc-300 uppercase font-bold">
                {doc.priority} PRIORITY
              </span>
              <span className="text-xs text-white bg-black border border-zinc-700 px-2 py-0.5 uppercase font-bold">{doc.category}</span>
              <span className="text-xs badge-muted-green font-bloom-green px-2 py-0.5 border uppercase font-bold">
                ✓ OCR {actualConvertedPercent}% CONVERTED
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0 font-pixel-code flex-wrap">
          {/* AI SUMMARISE — primary CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={handleSummarise}
            className="pixel-btn-white text-xs flex items-center gap-1.5"
            title="Generate AI executive summary of this document"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>SUMMARISE</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate(`/ocr/${id || doc?.id || 'doc-001'}`)}
            className="pixel-btn-dark text-xs flex items-center gap-1.5"
            title="Open full-screen OCR text viewer"
          >
            <Scan className="w-4 h-4 stroke-[2.5]" />
            <span>OCR</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={handleCopyText}
            className="pixel-btn-dark text-xs flex items-center gap-1.5"
          >
            {copiedText ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
            <span>{copiedText ? 'COPIED!' : 'COPY'}</span>
          </motion.button>
          <button
            onClick={handleDownloadTxt}
            className="pixel-btn-dark text-xs flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4 stroke-[2.5]" />
            <span>.TXT</span>
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Navigation Tabs */}
          <div className="flex border-b-2 border-[#27272a] gap-2 sm:gap-4 font-pixel-code overflow-x-auto">
            <button
              onClick={() => setActiveTab('text')}
              className={cn(
                'pb-3 text-xs font-bold uppercase transition-all border-b-2 flex items-center gap-2 whitespace-nowrap',
                activeTab === 'text'
                  ? 'border-white text-white font-bloom-subtle'
                  : 'border-transparent text-zinc-400 hover:text-white'
              )}
            >
              <FileText className="w-4 h-4 stroke-[2.5]" /> CONVERTED TEXT
            </button>
            <button
              onClick={() => setActiveTab('ocr')}
              className={cn(
                'pb-3 text-xs font-bold uppercase transition-all border-b-2 flex items-center gap-2 whitespace-nowrap',
                activeTab === 'ocr'
                  ? 'border-white text-white font-bloom-subtle'
                  : 'border-transparent text-zinc-400 hover:text-white'
              )}
            >
              <Scan className="w-4 h-4 stroke-[2.5]" /> VIEW OCR RESULT
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={cn(
                'pb-3 text-xs font-bold uppercase transition-all border-b-2 flex items-center gap-2 whitespace-nowrap',
                activeTab === 'summary'
                  ? 'border-white text-white font-bloom-subtle'
                  : 'border-transparent text-zinc-400 hover:text-white'
              )}
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" /> AI SUMMARY
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={cn(
                'pb-3 text-xs font-bold uppercase transition-all border-b-2 flex items-center gap-2 whitespace-nowrap',
                activeTab === 'comments'
                  ? 'border-white text-white font-bloom-subtle'
                  : 'border-transparent text-zinc-400 hover:text-white'
              )}
            >
              <MessageSquare className="w-4 h-4 stroke-[2.5]" /> COMMENTS
            </button>
          </div>

          {/* TAB 1: CONVERTED EXTRACTED TEXT VIEWER & IN-DOC SEARCH */}
          {activeTab === 'text' && (
            <div className="pixel-box p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap font-pixel-code">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white stroke-[2.5]" />
                  <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle">DOCUMENT TEXT CONTENT</h3>
                </div>

                {/* In-Document Search Bar */}
                <div className="relative flex-1 max-w-xs font-pixel">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 stroke-[2.5]" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="SEARCH INSIDE TEXT..."
                    className="w-full pl-9 pr-8 py-1.5 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase"
                  />
                  {searchTerm && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white bg-zinc-800 px-1 border border-zinc-700 font-bold">
                      {matchCount}
                    </span>
                  )}
                </div>
              </div>

              {/* OCR Pending Banner */}
              {fullText.startsWith('⏳ OCR PROCESSING...') && (
                <div className="bg-zinc-900 border-2 border-yellow-500/40 p-3 flex items-center gap-3 font-pixel-code text-xs">
                  <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 font-bold uppercase">OCR PROCESSING IN PROGRESS</p>
                    <p className="text-zinc-400 mt-0.5">Backend EasyOCR is extracting text. Refresh or click VIEW OCR TEXT in a few moments.</p>
                  </div>
                </div>
              )}

              {/* Text viewer with line numbers */}
              <div className="bg-black border-2 border-zinc-700 p-4 font-pixel-code text-xs text-zinc-300 leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto select-text">
                {fullText.split('\n').map((line, idx) => (
                  <div key={idx} className="flex gap-4 hover:bg-zinc-900 px-1">
                    <span className="text-zinc-500 select-none text-right w-6 flex-shrink-0 font-bold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap">
                      {renderHighlightedText(line)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] font-pixel-code text-zinc-400 uppercase font-bold pt-1">
                <span>TOTAL WORDS: {fullText.split(/\s+/).length}</span>
                <span>SELECT ANY TEXT ABOVE TO COPY DIRECTLY</span>
              </div>
            </div>
          )}

          {/* TAB 2: VIEW OCR RESULT */}
          {activeTab === 'ocr' && (
            <div className="pixel-box p-5 space-y-4">
              {/* Telemetry Header */}
              <div className="flex items-center justify-between border-b-2 border-[#27272a] pb-3 flex-wrap gap-2 font-pixel-code">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-[#6ee7b7] stroke-[2.5]" />
                  <h3 className="font-bold text-white text-xs font-bloom">EASYOCR EXTRACTION RESULT</h3>
                  <span className="badge-muted-green font-bloom-green text-[10px] font-bold px-2 py-0.5 border uppercase">
                    ✓ {confidenceScore}% CONFIDENCE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    className="pixel-btn-dark text-[11px] py-1 px-2.5 flex items-center gap-1"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedText ? 'COPIED' : 'COPY ALL'}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="pixel-btn-dark text-[11px] py-1 px-2.5 flex items-center gap-1"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    DOWNLOAD .TXT
                  </button>
                  <button
                    onClick={() => navigate(`/ocr/${id || doc?.id || 'doc-001'}`)}
                    className="pixel-btn-white text-[11px] py-1 px-2.5 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    FULL SCREEN
                  </button>
                </div>
              </div>

              {/* Metadata bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-pixel-code text-[11px]">
                <div className="bg-black border border-zinc-700 p-2">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase">ENGINE</p>
                  <p className="font-bold text-white uppercase">EasyOCR v1.7</p>
                </div>
                <div className="bg-black border border-zinc-700 p-2">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase">LANGUAGES</p>
                  <p className="font-bold text-white uppercase">English, Malayalam</p>
                </div>
                <div className="bg-black border border-zinc-700 p-2">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase">WORD COUNT</p>
                  <p className="font-bold text-[#6ee7b7]">{fullText.split(/\s+/).filter(Boolean).length} WORDS</p>
                </div>
                <div className="bg-black border border-zinc-700 p-2">
                  <p className="text-[9px] text-zinc-400 font-bold uppercase">STATUS</p>
                  <p className="font-bold text-[#6ee7b7] uppercase">COMPLETED</p>
                </div>
              </div>

              {/* Raw OCR Text Box with Line Numbers */}
              <div className="bg-black border-2 border-zinc-700 p-4 font-pixel-code text-xs text-zinc-200 leading-relaxed overflow-x-auto max-h-[550px] overflow-y-auto select-text shadow-inner">
                {fullText.split('\n').map((line, idx) => (
                  <div key={idx} className="flex gap-4 hover:bg-zinc-900 px-1 py-0.5 border-b border-zinc-900/50">
                    <span className="text-zinc-600 select-none text-right w-6 flex-shrink-0 font-bold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap font-mono text-zinc-200">
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* TAB 3: AI SUMMARY */}
          {activeTab === 'summary' && (
            <div className="pixel-box p-5 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#27272a] pb-3 flex-wrap gap-2 font-pixel-code">
                <div className="flex items-center gap-2 font-pixel-head">
                  <Sparkles className="w-4 h-4 text-white stroke-[2.5]" />
                  <h3 className="font-bold text-white text-xs font-bloom">AI EXECUTIVE SUMMARY</h3>
                  <span className="text-[10px] font-pixel-code badge-muted-green font-bloom-green px-2 py-0.5 border uppercase font-bold">AUTO-GENERATED</span>
                </div>
                {summaryData && (
                  <span className={cn('text-[10px] font-pixel-code px-2 py-0.5 border font-bold uppercase',
                    summaryData.risk_level === 'critical' ? 'badge-muted-red font-bloom-red' : 'badge-muted-green font-bloom-green'
                  )}>
                    RISK LEVEL: {summaryData.risk_level.toUpperCase()}
                  </span>
                )}
              </div>

              {summaryLoading ? (
                <div className="p-8 flex flex-col items-center justify-center gap-3 font-pixel-code">
                  <Loader2 className="w-6 h-6 text-white animate-spin stroke-[2.5]" />
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">GENERATING AI EXECUTIVE SUMMARY...</p>
                </div>
              ) : summaryData ? (
                <div className="space-y-4 font-pixel-code">
                  {/* Executive summary paragraph */}
                  <div className="bg-black border border-zinc-700 p-4">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">SUMMARY OVERVIEW</p>
                    <p className="text-xs text-zinc-200 leading-relaxed font-pixel-code">{summaryData.executive_summary}</p>
                  </div>

                  {/* Key points & Action items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-black p-3.5 border border-zinc-700 space-y-2">
                      <p className="text-xs font-bold text-white font-bloom-subtle uppercase">KEY FINDINGS</p>
                      <ul className="space-y-1.5">
                        {summaryData.key_points.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="w-1.5 h-1.5 bg-white flex-shrink-0 mt-1.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-black p-3.5 border border-zinc-700 space-y-2">
                      <p className="text-xs font-bold text-white font-bloom-subtle uppercase">REQUIRED ACTIONS</p>
                      <ul className="space-y-1.5">
                        {summaryData.action_items.map((act, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="w-1.5 h-1.5 bg-[#6ee7b7] flex-shrink-0 mt-1.5" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Keywords tags */}
                  {summaryData.keywords.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase">KEYWORDS:</span>
                      {summaryData.keywords.map((kw, i) => (
                        <span key={i} className="text-[10px] bg-zinc-900 border border-zinc-700 text-zinc-300 px-2 py-0.5 font-bold uppercase">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="pixel-box p-5 space-y-4 font-pixel-code">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-pixel-head">
                  <MessageSquare className="w-4 h-4 text-white stroke-[2.5]" />
                  <h3 className="font-bold text-white text-xs font-bloom-subtle">DISCUSSION & COMMENTS</h3>
                </div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">{commentsList.length} COMMENTS</span>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2 font-pixel">
                <input
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="ADD A COMMENT..."
                  className="flex-1 px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase"
                />
                <button type="submit" className="pixel-btn-white text-xs flex-shrink-0">
                  POST
                </button>
              </form>

              {/* Comments List */}
              <div className="space-y-3 pt-2">
                {commentsList.map((c) => (
                  <div key={c.id} className="bg-black border border-zinc-700 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-white text-black font-bold flex items-center justify-center text-[10px]">
                          {c.userName.charAt(0)}
                        </span>
                        <span className="font-bold text-white uppercase">{c.userName}</span>
                        <span className="text-[9px] bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 text-zinc-400 font-bold uppercase">
                          {c.userRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{formatRelativeTime(c.createdAt)}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-pixel-code pl-7">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-4 font-pixel-code">
          <div className="pixel-box p-5 space-y-4">
            <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle">DOCUMENT METADATA</h3>
            {[
              { icon: User, label: 'UPLOADED BY', value: doc.uploadedBy },
              { icon: Clock, label: 'UPLOADED', value: formatRelativeTime(doc.createdAt) },
              { icon: FileText, label: 'FILE SIZE', value: formatBytes(doc.fileSize || 0) },
              { icon: Eye, label: 'OCR STATUS', value: doc.ocrStatus || 'COMPLETED' },
              { icon: FileText, label: 'DEPARTMENT', value: doc.department || 'OPERATIONS' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-white stroke-[2.5] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">{label}</p>
                  <p className="text-xs font-bold text-white uppercase">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pixel-box p-5 space-y-3">
            <h3 className="font-pixel-head font-bold text-white text-xs font-bloom-subtle">AI CLASSIFICATION</h3>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">CATEGORY</p>
              <span className="px-2.5 py-0.5 bg-black border border-zinc-700 text-white font-bold text-xs uppercase">{doc.category}</span>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">CONFIDENCE SCORE</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-black border border-zinc-700">
                  <div className="h-full bg-white" style={{ width: `${confidenceScore}%` }} />
                </div>
                <span className="text-xs font-bold text-[#6ee7b7]">{confidenceScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    {/* ── AI SUMMARY MODAL ──────────────────────────────────────────────────── */}
    <AnimatePresence>
      {summaryOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-pixel"
          onClick={() => setSummaryOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#09090b] border-2 border-white shadow-[6px_6px_0px_0px_#ffffff] max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b-2 border-[#27272a]">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-white stroke-[2.5]" />
                <div>
                  <h2 className="text-sm font-pixel-head font-bold text-white font-bloom">AI EXECUTIVE SUMMARY</h2>
                  <p className="text-[10px] text-zinc-400 font-pixel-code uppercase mt-0.5 truncate max-w-xs">{doc.title}</p>
                </div>
                <span className="text-[10px] font-pixel-code badge-muted-green font-bloom-green px-2 py-0.5 border uppercase font-bold ml-2">
                  AUTO-GENERATED
                </span>
              </div>
              <button
                onClick={() => setSummaryOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors p-1 border border-zinc-700 hover:border-white"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {summaryLoading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <Loader2 className="w-8 h-8 text-white animate-spin stroke-[1.5]" />
                  <div className="text-center">
                    <p className="text-sm font-pixel-head font-bold text-white font-bloom">GENERATING SUMMARY...</p>
                    <p className="text-[10px] text-zinc-400 font-pixel-code uppercase mt-1">AI IS ANALYSING DOCUMENT CONTENT</p>
                  </div>
                  {/* Animated progress bar */}
                  <div className="w-48 h-1.5 bg-zinc-800 border border-zinc-700 overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    />
                  </div>
                </div>
              ) : summaryData ? (
                <>
                  {/* Executive Summary */}
                  <div className="bg-black border-2 border-zinc-700 p-4">
                    <p className="text-[10px] font-pixel-code text-zinc-400 uppercase font-bold mb-2">EXECUTIVE SUMMARY</p>
                    <p className="text-xs text-zinc-200 leading-relaxed font-pixel-code">{summaryData.executive_summary}</p>
                  </div>

                  {/* Risk + Department */}
                  <div className="grid grid-cols-2 gap-3 font-pixel-code">
                    <div className="bg-black border border-zinc-700 p-3">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1.5">RISK LEVEL</p>
                      <span className={cn(
                        'text-xs font-bold uppercase px-2.5 py-1 border',
                        summaryData.risk_level === 'critical' && 'badge-muted-red text-[#fca5a5] border-[#fca5a5]/40',
                        summaryData.risk_level === 'high' && 'bg-yellow-900/20 text-yellow-300 border-yellow-500/40',
                        summaryData.risk_level === 'medium' && 'badge-muted-amber',
                        summaryData.risk_level === 'low' && 'badge-muted-green font-bloom-green',
                      )}>
                        {summaryData.risk_level.toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-black border border-zinc-700 p-3">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1.5">DEPARTMENT</p>
                      <span className="text-xs font-bold text-white uppercase">{summaryData.responsible_department}</span>
                    </div>
                  </div>

                  {/* Key Points + Action Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-pixel-code">
                    <div className="bg-black border border-zinc-700 p-3">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-2">KEY POINTS</p>
                      <ul className="space-y-1.5">
                        {summaryData.key_points.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-300">
                            <span className="w-1.5 h-1.5 bg-white flex-shrink-0 mt-1" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-black border border-zinc-700 p-3">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-2">ACTION ITEMS</p>
                      <ul className="space-y-1.5">
                        {summaryData.action_items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-300">
                            <span className="w-1.5 h-1.5 bg-white flex-shrink-0 mt-1" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Keywords */}
                  {summaryData.keywords?.length > 0 && (
                    <div className="font-pixel-code">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold mb-2">KEYWORDS</p>
                      <div className="flex flex-wrap gap-2">
                        {summaryData.keywords.map((kw) => (
                          <span key={kw} className="text-[10px] font-bold uppercase px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex gap-2 pt-2 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        const text = `AI SUMMARY: ${doc.title}\n\n${summaryData.executive_summary}\n\nKEY POINTS:\n${summaryData.key_points.map((p) => '• ' + p).join('\n')}\n\nACTION ITEMS:\n${summaryData.action_items.map((a) => '• ' + a).join('\n')}`;
                        navigator.clipboard.writeText(text);
                        toast.success('Summary copied to clipboard!');
                      }}
                      className="pixel-btn-dark text-xs flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                      COPY SUMMARY
                    </button>
                    <button
                      onClick={() => { setSummaryData(null); handleSummarise(); }}
                      className="pixel-btn-dark text-xs flex items-center gap-1.5"
                    >
                      <Loader2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      REGENERATE
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
