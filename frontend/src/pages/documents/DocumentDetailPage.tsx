import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, FileText, Download, Star, Trash2, Clock, User, Eye,
  MessageSquare, Copy, Search, Check, FileDown, Sparkles, AlertCircle
} from 'lucide-react';
import { cn, formatDate, formatBytes, formatRelativeTime } from '@/lib/utils';
import { MOCK_DOCUMENTS } from '@/data/mockData';
import { toast } from 'sonner';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const doc = MOCK_DOCUMENTS.find((d) => d.id === id) || MOCK_DOCUMENTS[0];

  const [copiedText, setCopiedText] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'summary' | 'comments'>('text');

  const fullText = doc.extractedText || `KOCHI METRO RAIL LIMITED
Corporate Office: Metro Bhavan, Ernakulam, Kochi - 682017

DOCUMENT TITLE: ${doc.title}
DEPARTMENT: ${doc.department}
CATEGORY: ${doc.category}
DATE OF PROCESSING: ${formatDate(doc.createdAt)}
STATUS: ${doc.status.toUpperCase()}

1. GENERAL SUMMARY
This document has been processed by KMRL IntelliDocs OCR and AI Classification Pipeline. The extracted text below represents the converted body content of the uploaded document file (${doc.title}).

2. DETAILS & SPECIFICATIONS
- Priority Level: ${doc.priority.toUpperCase()}
- Storage Reference: demo/${doc.title.toLowerCase().replace(/\s+/g, '_')}.pdf
- File Size: ${formatBytes(doc.fileSize)}
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
                ✓ OCR 96.4% CONVERTED
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0 font-pixel-code">
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={handleCopyText}
            className="pixel-btn-white text-xs flex items-center gap-1.5"
            title="Copy entire document text"
          >
            {copiedText ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
            <span>{copiedText ? 'COPIED!' : 'COPY TEXT'}</span>
          </motion.button>
          <button
            onClick={handleDownloadTxt}
            className="pixel-btn-dark text-xs flex items-center gap-1.5"
            title="Download converted text file"
          >
            <FileDown className="w-4 h-4 stroke-[2.5]" />
            <span>DOWNLOAD .TXT</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Navigation Tabs */}
          <div className="flex border-b-2 border-[#27272a] gap-4 font-pixel-code">
            <button
              onClick={() => setActiveTab('text')}
              className={cn(
                'pb-3 text-xs font-bold uppercase transition-all border-b-2 flex items-center gap-2',
                activeTab === 'text'
                  ? 'border-white text-white font-bloom-subtle'
                  : 'border-transparent text-zinc-400 hover:text-white'
              )}
            >
              <FileText className="w-4 h-4 stroke-[2.5]" /> CONVERTED TEXT
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={cn(
                'pb-3 text-xs font-bold uppercase transition-all border-b-2 flex items-center gap-2',
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
                'pb-3 text-xs font-bold uppercase transition-all border-b-2 flex items-center gap-2',
                activeTab === 'comments'
                  ? 'border-white text-white font-bloom-subtle'
                  : 'border-transparent text-zinc-400 hover:text-white'
              )}
            >
              <MessageSquare className="w-4 h-4 stroke-[2.5]" /> COMMENTS (2)
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

          {/* TAB 2: AI SUMMARY */}
          {activeTab === 'summary' && (
            <div className="pixel-box p-5 space-y-4">
              <div className="flex items-center gap-2 font-pixel-head">
                <Sparkles className="w-4 h-4 text-white stroke-[2.5]" />
                <h3 className="font-bold text-white text-xs font-bloom">AI EXECUTIVE SUMMARY</h3>
                <span className="text-[10px] font-pixel-code badge-muted-green font-bloom-green px-2 py-0.5 border uppercase font-bold">AUTO-GENERATED</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-pixel-code">
                {doc.description || `THIS DOCUMENT CONTAINS IMPORTANT ${doc.category.toUpperCase()} INFORMATION FOR KMRL OPERATIONS. IT COVERS KEY ASPECTS AND PROVIDES GUIDANCE FOR RELEVANT STAKEHOLDERS.`}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 font-pixel-code">
                {[
                  { label: 'KEY POINTS', items: ['COMPLIANCE REVIEW REQUIRED', 'STAKEHOLDER APPROVAL PENDING', 'FOLLOW-UP BY Q2 2024'] },
                  { label: 'ACTION ITEMS', items: ['REVIEW AND APPROVE', 'DISTRIBUTE TO DEPARTMENTS', 'ARCHIVE POST-APPROVAL'] },
                ].map(({ label, items }) => (
                  <div key={label} className="bg-black p-3 border border-zinc-700">
                    <p className="text-xs font-bold text-white font-bloom-subtle mb-2">{label}</p>
                    <ul className="space-y-1.5">
                      {items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-zinc-300">
                          <span className="w-1.5 h-1.5 bg-white flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="pixel-box p-5 space-y-4 font-pixel-code">
              <div className="flex items-center gap-2 mb-2 font-pixel-head">
                <MessageSquare className="w-4 h-4 text-white stroke-[2.5]" />
                <h3 className="font-bold text-white text-xs font-bloom-subtle">DISCUSSION & COMMENTS</h3>
              </div>
              {[
                { user: 'Rajan Menon', comment: 'Reviewed the financial data. Looks accurate. Approved.', time: '2 days ago', role: 'Manager' },
                { user: 'Priya Nair', comment: 'Please ensure all supporting documents are attached before final approval.', time: '3 days ago', role: 'HR Manager' },
              ].map((c) => (
                <div key={c.user} className="flex gap-3 p-3 bg-black border border-zinc-700">
                  <div className="w-8 h-8 border border-white text-white flex items-center justify-center text-xs font-bold font-pixel-head flex-shrink-0">
                    {c.user[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white uppercase">{c.user}</span>
                      <span className="text-[10px] text-zinc-400 uppercase">({c.role})</span>
                      <span className="text-[10px] text-zinc-500 ml-auto uppercase">{c.time}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed uppercase">{c.comment}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2 font-pixel">
                <input
                  placeholder="ADD A COMMENT..."
                  className="flex-1 px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase"
                />
                <button className="pixel-btn-white text-xs">
                  POST
                </button>
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
                  <div className="h-full bg-white" style={{ width: '96.4%' }} />
                </div>
                <span className="text-xs font-bold text-[#6ee7b7]">96.4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
