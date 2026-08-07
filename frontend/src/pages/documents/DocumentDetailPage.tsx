import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  // Calculate search match occurrences
  const getSearchMatchCount = () => {
    if (!searchTerm.trim()) return 0;
    const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = fullText.match(regex);
    return matches ? matches.length : 0;
  };

  const matchCount = getSearchMatchCount();

  // Highlight search text
  const renderHighlightedText = (text: string) => {
    if (!searchTerm.trim()) return text;
    const parts = text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={i} className="bg-yellow-400/40 text-yellow-200 font-bold px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const statusColors: Record<string, string> = {
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const priorityColors: Record<string, string> = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-sky-400',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/documents')}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Documents
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-7 h-7 text-sky-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{doc.title}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize', statusColors[doc.status] || statusColors.draft)}>
                {doc.status}
              </span>
              <span className={cn('text-xs font-medium capitalize', priorityColors[doc.priority])}>
                {doc.priority} priority
              </span>
              <span className="text-xs text-slate-500">{doc.category}</span>
              <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                ✓ Text Converted (OCR 96.4%)
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-medium transition-all"
            title="Copy entire document text"
          >
            {copiedText ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copiedText ? 'Copied!' : 'Copy Text'}
          </button>
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 text-xs font-medium transition-all"
            title="Download converted text file"
          >
            <FileDown className="w-4 h-4 text-slate-400" />
            Download .TXT
          </button>
          <button className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-slate-400 hover:text-yellow-400 transition-all">
            <Star className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-slate-400 hover:text-red-400 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/[0.06] gap-4">
            <button
              onClick={() => setActiveTab('text')}
              className={cn(
                'pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2',
                activeTab === 'text'
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <FileText className="w-4 h-4" /> Converted Extracted Text
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={cn(
                'pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2',
                activeTab === 'summary'
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <Sparkles className="w-4 h-4 text-violet-400" /> AI Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={cn(
                'pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2',
                activeTab === 'comments'
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              <MessageSquare className="w-4 h-4" /> Comments (2)
            </button>
          </div>

          {/* TAB 1: CONVERTED EXTRACTED TEXT VIEWER & IN-DOC SEARCH */}
          {activeTab === 'text' && (
            <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <h3 className="font-semibold text-white text-sm">Document Text Content</h3>
                </div>

                {/* In-Document Search Bar */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search inside this text..."
                    className="w-full pl-9 pr-8 py-1.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                  />
                  {searchTerm && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-white/10 px-1 rounded">
                      {matchCount}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl text-xs font-medium transition-colors"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedText ? 'Copied' : 'Copy All Text'}
                </button>
              </div>

              {/* Text viewer with line numbers */}
              <div className="bg-black/30 border border-white/[0.06] rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-[500px] overflow-y-auto select-text">
                {fullText.split('\n').map((line, idx) => (
                  <div key={idx} className="flex gap-4 hover:bg-white/[0.03] px-1 rounded">
                    <span className="text-slate-600 select-none text-right w-6 flex-shrink-0 font-sans">
                      {idx + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap">
                      {renderHighlightedText(line)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Total Words: {fullText.split(/\s+/).length}</span>
                <span>Select any text above to copy directly</span>
              </div>
            </div>
          )}

          {/* TAB 2: AI SUMMARY */}
          {activeTab === 'summary' && (
            <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/5 border border-sky-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <h3 className="font-semibold text-white text-sm">AI Executive Summary</h3>
                <span className="text-[10px] bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded-full">Auto-generated</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {doc.description || `This document contains important ${doc.category} information for KMRL operations. It covers key aspects and provides guidance for relevant stakeholders across departments.`}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { label: 'Key Points', items: ['Compliance review required', 'Stakeholder approval pending', 'Follow-up by Q2 2024'] },
                  { label: 'Action Items', items: ['Review and approve', 'Distribute to departments', 'Archive post-approval'] },
                ].map(({ label, items }) => (
                  <div key={label} className="bg-black/20 rounded-xl p-3 border border-white/[0.04]">
                    <p className="text-xs font-semibold text-sky-300 mb-2">{label}</p>
                    <ul className="space-y-1">
                      {items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-slate-300">
                          <div className="w-1.5 h-1.5 bg-sky-400 rounded-full flex-shrink-0" />
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
            <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-white text-sm">Discussion & Comments</h3>
              </div>
              {[
                { user: 'Rajan Menon', comment: 'Reviewed the financial data. Looks accurate. Approved.', time: '2 days ago', role: 'Manager' },
                { user: 'Priya Nair', comment: 'Please ensure all supporting documents are attached before final approval.', time: '3 days ago', role: 'HR Manager' },
              ].map((c) => (
                <div key={c.user} className="flex gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {c.user[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{c.user}</span>
                      <span className="text-xs text-slate-500">{c.role}</span>
                      <span className="text-xs text-slate-600 ml-auto">{c.time}</span>
                    </div>
                    <p className="text-sm text-slate-300">{c.comment}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <input
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                />
                <button className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors">
                  Post
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Metadata */}
          <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-white text-sm">Document Info</h3>
            {[
              { icon: User, label: 'Uploaded by', value: doc.uploadedBy },
              { icon: Clock, label: 'Uploaded', value: formatRelativeTime(doc.createdAt) },
              { icon: FileText, label: 'File size', value: formatBytes(doc.fileSize || 0) },
              { icon: Eye, label: 'OCR Status', value: doc.ocrStatus || 'Completed' },
              { icon: FileText, label: 'Department', value: doc.department || 'Operations' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm text-slate-200 font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* AI Classification */}
          <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-4">AI Classification</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Category</p>
                <span className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-lg text-sm font-medium">{doc.category}</span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1.5">Confidence Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: '96%' }} />
                  </div>
                  <span className="text-xs text-slate-400">96.4%</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Extracted Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {['KMRL', doc.category, '2024', 'official', doc.department].map((kw) => (
                    <span key={kw} className="px-2 py-0.5 bg-white/[0.06] text-slate-400 rounded-lg text-xs">{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Version History */}
          <div className="bg-[#1f2937] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="font-semibold text-white text-sm mb-3">Version History</h3>
            {[{ v: 'v1.0', time: formatDate(doc.createdAt), label: 'Initial upload' }].map((v) => (
              <div key={v.v} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <span className="text-xs font-mono text-sky-400">{v.v}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{v.time}</p>
                </div>
                <span className="text-xs text-slate-500">{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
