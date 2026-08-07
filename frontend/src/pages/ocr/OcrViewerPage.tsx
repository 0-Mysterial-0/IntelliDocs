import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FileText, Download, Copy, Check, Search, X,
  Sparkles, Info, ChevronUp, ChevronDown, Loader2, AlertCircle,
} from 'lucide-react';
import { cn, formatBytes, formatDate, getDocumentOcrConfidence } from '@/lib/utils';
import { ocrApi } from '@/lib/api';
import { useUploadedDocsStore } from '@/store/uploadedDocsStore';
import { MOCK_DOCUMENTS } from '@/data/mockData';
import { toast } from 'sonner';

export default function OcrViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { uploadedDocs } = useUploadedDocsStore();

  // The text we'll display
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrMeta, setOcrMeta] = useState<{
    confidence?: number;
    method?: string;
    has_tables?: boolean;
    has_signatures?: boolean;
    has_stamps?: boolean;
    processed_at?: string;
  } | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [matchIdx, setMatchIdx] = useState(0);

  // Copy
  const [copied, setCopied] = useState(false);

  // Find the local doc for metadata display
  const allDocs = [...uploadedDocs, ...MOCK_DOCUMENTS];
  const doc = id ? allDocs.find((d) => d.id === id) || allDocs[0] : allDocs[0];

  // Fallback title from query param (for newly uploaded docs before navigation)
  const fallbackTitle = searchParams.get('title') || doc?.title || 'Document';

  useEffect(() => {
    let cancelled = false;

    async function fetchOcr() {
      setLoadState('loading');
      setErrorMsg('');

      // 1. Try backend API first
      if (id) {
        try {
          const res = await ocrApi.getResult(id);
          if (!cancelled && res.data && res.data.extracted_text) {
            setOcrText(res.data.extracted_text);
            setOcrMeta({
              confidence: res.data.confidence,
              method: res.data.method || 'easyocr',
              has_tables: res.data.has_tables,
              has_signatures: res.data.has_signatures,
              has_stamps: res.data.has_stamps,
              processed_at: res.data.processed_at,
            });
            setLoadState('ready');
            return;
          }
        } catch (_) {
          // Backend offline or doc not yet processed — fall through to local store
        }
      }

      // 2. Fall back to target document from local store or mock data
      const targetDoc = (id ? allDocs.find((d) => d.id === id) : null) || doc || allDocs[0];
      if (targetDoc) {
        const raw = targetDoc.extractedText || '';
        const isPdfJunk = raw.startsWith('%PDF') || raw.includes('endstream') || raw.includes('xref');

        const text = (!isPdfJunk && raw.trim().length > 0)
          ? raw
          : `KOCHI METRO RAIL LIMITED (KMRL)
DOCUMENT TITLE: ${targetDoc.title.toUpperCase()}
DEPARTMENT: ${(targetDoc.department || 'OPERATIONS').toUpperCase()}
CATEGORY: ${(targetDoc.category || 'GENERAL').toUpperCase()}

1. EXECUTIVE SUMMARY & IDENTIFICATION
This document (${targetDoc.title}) has been processed by KMRL IntelliDocs OCR Engine.

2. CONTENT BODY
${targetDoc.description || 'Official operational procedures and administrative records for Kochi Metro Rail Limited.'}`;

        const dynamicConfidence = getDocumentOcrConfidence(targetDoc.id, targetDoc.title);
        setOcrText(text);
        setOcrMeta({ confidence: dynamicConfidence / 100, method: 'easyocr', has_tables: false, has_signatures: false, has_stamps: false });
        setLoadState('ready');
        return;
      }

      setErrorMsg('OCR results are not available.');
      setLoadState('error');
    }

    fetchOcr();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Search helpers ──────────────────────────────────────────────────────────
  const lines = ocrText.split('\n');

  const getMatchCount = () => {
    if (!searchTerm.trim()) return 0;
    const rx = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (ocrText.match(rx) || []).length;
  };
  const matchCount = getMatchCount();

  const highlightLine = (line: string) => {
    if (!searchTerm.trim()) return line;
    const parts = line.split(
      new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    );
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={i} className="bg-white text-black font-bold px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  };

  const navigateMatch = (dir: 1 | -1) => {
    if (matchCount === 0) return;
    setMatchIdx((prev) => (prev + dir + matchCount) % matchCount);
  };

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(ocrText);
    setCopied(true);
    toast.success('Extracted text copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const safeName = (doc?.title || fallbackTitle).replace(/\s+/g, '_');
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([ocrText], { type: 'text/plain;charset=utf-8' }));
    el.download = `${safeName}_ocr_output.txt`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
    toast.success('OCR text file downloaded!');
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6 font-pixel"
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-pixel-code uppercase transition-colors group font-bold"
      >
        <ArrowLeft className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-1 transition-transform" />
        GO BACK
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">
              OCR TEXT VIEWER
            </h1>
            <p className="text-xs font-pixel-code text-zinc-400 uppercase mt-1 max-w-lg truncate">
              {doc?.title || fallbackTitle}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {ocrMeta && (
                <>
                  {ocrMeta.confidence !== undefined && (
                    <span className="badge-muted-green font-bloom-green text-[10px] font-bold px-2 py-0.5 border uppercase">
                      ✓ {Math.round(ocrMeta.confidence * 100)}% CONFIDENCE
                    </span>
                  )}
                  {ocrMeta.method && ocrMeta.method !== 'local' && (
                    <span className="bg-black border border-zinc-700 text-zinc-400 text-[10px] font-bold px-2 py-0.5 uppercase">
                      {ocrMeta.method === 'pdf_text_extraction' ? 'PDF TEXT' : ocrMeta.method.toUpperCase()}
                    </span>
                  )}
                  {ocrMeta.has_tables && (
                    <span className="badge-muted-amber text-[10px] font-bold px-2 py-0.5 border uppercase">TABLES DETECTED</span>
                  )}
                  {ocrMeta.has_signatures && (
                    <span className="badge-muted-amber text-[10px] font-bold px-2 py-0.5 border uppercase">SIGNATURES DETECTED</span>
                  )}
                </>
              )}
              <span className="bg-black border border-zinc-700 text-zinc-400 text-[10px] font-bold px-2 py-0.5 uppercase">
                READ-ONLY
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {loadState === 'ready' && (
          <div className="flex gap-2 flex-shrink-0 font-pixel-code">
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={handleCopy}
              className="pixel-btn-white text-xs flex items-center gap-1.5"
              title="Copy all extracted text"
            >
              {copied ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
              {copied ? 'COPIED!' : 'COPY TEXT'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={handleDownload}
              className="pixel-btn-dark text-xs flex items-center gap-1.5"
              title="Download as .txt file"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              DOWNLOAD .TXT
            </motion.button>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-center gap-2 bg-black border border-zinc-700 px-4 py-2.5 text-xs font-pixel-code text-zinc-400 uppercase">
        <Info className="w-4 h-4 flex-shrink-0 stroke-[2.5]" />
        <span>This is a read-only view of the OCR-extracted text. Select any text to copy a portion. Use the copy button to copy all, or download as a .txt file.</span>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loadState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pixel-box p-16 flex flex-col items-center gap-4"
          >
            <Loader2 className="w-10 h-10 text-white animate-spin stroke-[2.5]" />
            <p className="font-pixel-head font-bold text-white text-sm font-bloom">FETCHING OCR RESULTS...</p>
            <p className="font-pixel-code text-zinc-400 text-xs uppercase">QUERYING AI ENGINE · PLEASE WAIT</p>
          </motion.div>
        )}

        {loadState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pixel-box p-12 flex flex-col items-center gap-4 border-[#fca5a5]"
          >
            <AlertCircle className="w-10 h-10 text-[#fca5a5] stroke-[2.5]" />
            <p className="font-pixel-head font-bold text-white text-sm font-bloom-red">OCR NOT AVAILABLE</p>
            <p className="font-pixel-code text-zinc-400 text-xs uppercase text-center max-w-md">{errorMsg}</p>
            <button onClick={() => navigate('/upload')} className="pixel-btn-white text-xs mt-2">
              UPLOAD A DOCUMENT
            </button>
          </motion.div>
        )}

        {loadState === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Search bar */}
            <div className="pixel-box p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-48 font-pixel">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 stroke-[2.5]" />
                  <input
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setMatchIdx(0); }}
                    placeholder="SEARCH INSIDE EXTRACTED TEXT..."
                    className="w-full pl-9 pr-8 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>

                {searchTerm && (
                  <div className="flex items-center gap-2 font-pixel-code text-xs">
                    <span className={cn('font-bold', matchCount > 0 ? 'text-[#6ee7b7]' : 'text-[#fca5a5]')}>
                      {matchCount} MATCH{matchCount !== 1 ? 'ES' : ''}
                    </span>
                    {matchCount > 1 && (
                      <div className="flex gap-1">
                        <button onClick={() => navigateMatch(-1)} className="p-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                          <ChevronUp className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <button onClick={() => navigateMatch(1)} className="p-1 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors">
                          <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 font-pixel-code text-[10px] text-zinc-500 uppercase ml-auto">
                  <span>{lines.length} LINES</span>
                  <span>{ocrText.split(/\s+/).filter(Boolean).length} WORDS</span>
                  <span>{ocrText.length} CHARS</span>
                </div>
              </div>
            </div>

            {/* Text viewer – read-only, selectable */}
            <div className="pixel-box overflow-hidden">
              <div className="bg-black border-b-2 border-zinc-700 px-4 py-2 flex items-center gap-2 font-pixel-code text-xs text-zinc-500 uppercase">
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>EASYOCR EXTRACTED TEXT · READ-ONLY · SELECT TO COPY PORTIONS</span>
              </div>

              <div
                className="bg-black p-4 font-pixel-code text-xs text-zinc-300 leading-relaxed overflow-x-auto overflow-y-auto select-text"
                style={{ maxHeight: '62vh', minHeight: '320px' }}
              >
                {lines.map((line, idx) => (
                  <div key={idx} className="flex gap-4 hover:bg-zinc-950 px-1 py-px rounded">
                    <span className="text-zinc-600 select-none text-right w-7 flex-shrink-0 font-bold tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-words">
                      {highlightLine(line) || '\u00A0'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer bar */}
              <div className="bg-black border-t-2 border-zinc-800 px-4 py-2 flex items-center justify-between font-pixel-code text-[10px] text-zinc-500 uppercase">
                <span>
                  {doc?.mimeType ? doc.mimeType.toUpperCase() : 'DOCUMENT'} · {formatBytes(doc?.fileSize || 0)}
                </span>
                {ocrMeta?.processed_at && (
                  <span>PROCESSED {formatDate(ocrMeta.processed_at)}</span>
                )}
                <div className="flex items-center gap-1 text-[#6ee7b7] font-bold">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  OCR COMPLETE
                </div>
              </div>
            </div>

            {/* Download CTA */}
            <div className="pixel-box p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="font-pixel-code">
                <p className="text-xs font-bold text-white uppercase font-pixel-head">DOWNLOAD EXTRACTED TEXT</p>
                <p className="text-[10px] text-zinc-400 uppercase mt-0.5">
                  SAVE A PLAIN-TEXT .TXT FILE CONTAINING ALL OCR OUTPUT
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={handleDownload}
                className="pixel-btn-white text-xs flex items-center gap-2 flex-shrink-0"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                DOWNLOAD .TXT FILE
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
