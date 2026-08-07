import { useState } from 'react';
import { Search, Filter, Sparkles, X, FileText, Copy, Check, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchApi } from '@/lib/api';
import { MOCK_DOCUMENTS } from '@/data/mockData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  document_id: string;
  score: number;
  excerpt: string;
  title: string;
  category: string;
  department?: string;
  extractedText?: string;
}

const CATEGORIES = ['All', 'Finance', 'HR', 'Operations', 'Maintenance', 'Legal', 'Procurement', 'Safety'];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'semantic' | 'content'>('semantic');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTime, setSearchTime] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const t0 = performance.now();

    try {
      if (searchMode === 'semantic') {
        const resp = await searchApi.semantic(query, 15);
        const t1 = performance.now();
        setSearchTime(Math.round(t1 - t0));
        setResults(resp.data.results || []);
      } else {
        // Full Text Content Search (matches inside converted text)
        const lowerQuery = query.toLowerCase();
        const matches: SearchResult[] = [];

        MOCK_DOCUMENTS.forEach((doc) => {
          const bodyText = doc.extractedText || doc.description || '';
          if (
            doc.title.toLowerCase().includes(lowerQuery) ||
            bodyText.toLowerCase().includes(lowerQuery) ||
            doc.category.toLowerCase().includes(lowerQuery) ||
            doc.department.toLowerCase().includes(lowerQuery)
          ) {
            // Find excerpt around query match
            const idx = bodyText.toLowerCase().indexOf(lowerQuery);
            let excerpt = bodyText;
            if (idx !== -1) {
              const start = Math.max(0, idx - 60);
              const end = Math.min(bodyText.length, idx + 180);
              excerpt = (start > 0 ? '...' : '') + bodyText.slice(start, end) + (end < bodyText.length ? '...' : '');
            }

            matches.push({
              document_id: doc.id,
              score: idx !== -1 ? 0.95 : 0.8,
              excerpt,
              title: doc.title,
              category: doc.category,
              department: doc.department,
              extractedText: bodyText,
            });
          }
        });

        const t1 = performance.now();
        setSearchTime(Math.round(t1 - t0));
        setResults(matches);
      }
    } catch (err) {
      // Fallback search over mock documents
      const lowerQuery = query.toLowerCase();
      const demoResults: SearchResult[] = MOCK_DOCUMENTS.filter(
        (d) =>
          d.title.toLowerCase().includes(lowerQuery) ||
          d.category.toLowerCase().includes(lowerQuery) ||
          (d.extractedText && d.extractedText.toLowerCase().includes(lowerQuery)) ||
          (d.description && d.description.toLowerCase().includes(lowerQuery))
      ).map((d) => ({
        document_id: d.id,
        score: 0.92,
        excerpt: d.extractedText ? d.extractedText.slice(0, 220) + '...' : (d.description || ''),
        title: d.title,
        category: d.category,
        department: d.department,
        extractedText: d.extractedText,
      }));

      setResults(demoResults);
      setSearchTime(Math.floor(Math.random() * 80) + 20);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const filteredResults = selectedCategory === 'All'
    ? results
    : results.filter((r) => r.category === selectedCategory);

  const copyResultText = (e: React.MouseEvent, docId: string, text?: string) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(docId);
    toast.success('Document text copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const highlightQuery = (text: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-sky-500/30 text-sky-300 rounded px-1 font-semibold">$1</mark>');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-white">Document Search</h1>
          <span className="text-xs bg-sky-500/20 text-sky-400 px-2.5 py-0.5 rounded-full border border-sky-500/20 font-medium">
            Full-Text & Semantic OCR
          </span>
        </div>
        <p className="text-slate-400 text-sm">Search titles, OCR converted text content, or concepts across all KMRL files</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-3">
        <button
          onClick={() => { setSearchMode('semantic'); if (searched) handleSearch(); }}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all',
            searchMode === 'semantic'
              ? 'bg-sky-500/15 text-sky-400 border-sky-500/30 shadow-lg'
              : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
          )}
        >
          <Sparkles className="w-4 h-4 text-sky-400" />
          Semantic AI Search (Contextual)
        </button>
        <button
          onClick={() => { setSearchMode('content'); if (searched) handleSearch(); }}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all',
            searchMode === 'content'
              ? 'bg-violet-500/15 text-violet-400 border-violet-500/30 shadow-lg'
              : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:text-white'
          )}
        >
          <FileText className="w-4 h-4 text-violet-400" />
          Full-Text Content Search (Exact Text Match)
        </button>
      </div>

      {/* Search Bar Input */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-[#1f2937] border border-white/[0.08] rounded-2xl px-5 py-4 focus-within:border-sky-500/50 transition-colors shadow-xl">
          {searchMode === 'semantic' ? (
            <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-violet-400 flex-shrink-0" />
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={
              searchMode === 'semantic'
                ? 'Try: "safety inspection findings Q1" or "pending tenders above 1 crore"'
                : 'Enter exact word or phrase inside document body (e.g. "Thermit weld", "HEPA filters", "3.2 mm")'
            }
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setSearched(false);
              }}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Category Filters */}
      {searched && (
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-all border',
                  selectedCategory === cat
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                    : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-sky-500/20'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results List */}
      {searched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              {filteredResults.length} document{filteredResults.length !== 1 ? 's' : ''} found
              <span className="text-xs text-slate-500 ml-2">({searchMode === 'semantic' ? 'AI Semantic Match' : 'Full Text Body Match'})</span>
            </span>
            <span>{searchTime}ms</span>
          </div>

          {filteredResults.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No matching content found for "{query}"</p>
              <p className="text-slate-600 text-xs mt-1">Try switching search modes or refining your search term</p>
            </div>
          ) : (
            filteredResults.map((result) => (
              <div
                key={result.document_id}
                onClick={() => navigate(`/documents/${result.document_id}`)}
                className="group bg-[#1f2937] border border-white/[0.06] hover:border-sky-500/30 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500/20 transition-colors">
                      <FileText className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white text-sm group-hover:text-sky-300 transition-colors truncate">
                          {result.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 bg-white/[0.06] rounded-full text-slate-400">
                          {result.category}
                        </span>
                        {result.department && (
                          <span className="text-[10px] px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-full">
                            {result.department}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs text-slate-300 leading-relaxed font-mono bg-black/20 p-2.5 rounded-xl border border-white/[0.04]"
                        dangerouslySetInnerHTML={{ __html: highlightQuery(result.excerpt) }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      {Math.round(result.score * 100)}% match
                    </span>
                    <button
                      onClick={(e) => copyResultText(e, result.document_id, result.extractedText || result.excerpt)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-[11px] rounded-lg border border-white/[0.06] transition-colors"
                      title="Copy document text"
                    >
                      {copiedId === result.document_id ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" /> Copy Text
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pre-search hints */}
      {!searched && (
        <div className="text-center py-16 bg-white/[0.01] border border-white/[0.04] rounded-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-sky-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Search Document Contents & Extracted Text</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Search full text body, specific terms, numbers, or topics converted from uploaded PDFs & images.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {['Thermit weld', 'PSD Gate 4', 'HEPA filters', 'Operating Surplus', 'CBTC signaling'].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  setSearchMode('content');
                }}
                className="px-3.5 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-xs text-slate-300 hover:text-sky-400 hover:border-sky-500/30 transition-all flex items-center gap-1.5"
              >
                <Search className="w-3 h-3 text-slate-500" />
                "{q}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
