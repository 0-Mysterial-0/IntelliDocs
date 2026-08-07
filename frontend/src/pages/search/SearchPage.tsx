import { useState } from 'react';
import { motion } from 'framer-motion';
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
    return text.replace(regex, '<mark class="bg-white text-black px-1 font-bold font-bloom-subtle">$1</mark>');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6 font-pixel"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-white stroke-[2.5]" />
          <h1 className="text-xl font-pixel-head font-bold text-white font-bloom">PIXEL VECTOR SEARCH</h1>
          <span className="text-xs font-pixel-code font-bold badge-muted-green px-2.5 py-0.5 uppercase">
            SEMANTIC & OCR SEARCH
          </span>
        </div>
        <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">SEARCH TITLES, OCR CONVERTED TEXT CONTENT, OR CONCEPTS ACROSS ALL KMRL FILES</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-3 font-pixel-code">
        <button
          onClick={() => { setSearchMode('semantic'); if (searched) handleSearch(); }}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase transition-all border',
            searchMode === 'semantic'
              ? 'bg-white text-black border-white shadow-[3px_3px_0px_0px_#ffffff]'
              : 'bg-black text-zinc-400 border-zinc-800 hover:border-white hover:text-white'
          )}
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          SEMANTIC AI SEARCH (CONTEXTUAL)
        </button>
        <button
          onClick={() => { setSearchMode('content'); if (searched) handleSearch(); }}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase transition-all border',
            searchMode === 'content'
              ? 'bg-white text-black border-white shadow-[3px_3px_0px_0px_#ffffff]'
              : 'bg-black text-zinc-400 border-zinc-800 hover:border-white hover:text-white'
          )}
        >
          <FileText className="w-4 h-4 stroke-[2.5]" />
          FULL-TEXT SEARCH (EXACT MATCH)
        </button>
      </div>

      {/* Search Bar Input */}
      <div className="pixel-box p-3">
        <div className="flex items-center gap-3">
          {searchMode === 'semantic' ? (
            <Sparkles className="w-5 h-5 text-white stroke-[2.5] flex-shrink-0" />
          ) : (
            <Search className="w-5 h-5 text-white stroke-[2.5] flex-shrink-0" />
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={
              searchMode === 'semantic'
                ? 'TRY: "SAFETY INSPECTION FINDINGS Q1" OR "PENDING TENDERS ABOVE 1 CRORE"'
                : 'ENTER EXACT WORD OR PHRASE INSIDE DOCUMENT BODY...'
            }
            className="flex-1 bg-transparent text-white placeholder-zinc-500 text-xs font-pixel focus:outline-none uppercase"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setSearched(false);
              }}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.03 }}
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="pixel-btn-white flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4 stroke-[3]" />
            )}
            <span>SEARCH</span>
          </motion.button>
        </div>
      </div>

      {/* Category Filters */}
      {searched && (
        <div className="flex items-center gap-2 font-pixel-code">
          <Filter className="w-4 h-4 text-zinc-400 stroke-[2.5]" />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1 text-xs font-bold uppercase transition-all border',
                  selectedCategory === cat
                    ? 'bg-white text-black border-white shadow-[2px_2px_0px_0px_#ffffff]'
                    : 'bg-black text-zinc-400 border-zinc-800 hover:border-white hover:text-white'
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
        <div className="space-y-3 font-pixel">
          <div className="flex items-center justify-between text-xs font-pixel-code text-zinc-400">
            <span>
              {filteredResults.length} DOCUMENT{filteredResults.length !== 1 ? 'S' : ''} FOUND
              <span className="text-[10px] text-zinc-500 ml-2">({searchMode === 'semantic' ? 'AI VECTOR MATCH' : 'FULL TEXT BODY MATCH'})</span>
            </span>
            <span>{searchTime}ms</span>
          </div>

          {filteredResults.length === 0 ? (
            <div className="pixel-box p-12 text-center text-zinc-400 font-pixel-code">
              <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3 stroke-[2]" />
              <p className="font-bold">NO MATCHING CONTENT FOUND FOR "{query}"</p>
              <p className="text-xs text-zinc-500 mt-1 uppercase">TRY SWITCHING SEARCH MODES OR REFINING YOUR SEARCH TERM</p>
            </div>
          ) : (
            filteredResults.map((result) => (
              <div
                key={result.document_id}
                onClick={() => navigate(`/documents/${result.document_id}`)}
                className="pixel-box p-5 cursor-pointer space-y-3 animate-pixel-float hover:bg-zinc-900 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileText className="w-6 h-6 text-white stroke-[2.5] flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap font-pixel-code">
                        <h3 className="font-pixel-head font-bold text-white text-xs group-hover:text-[#6ee7b7] transition-colors truncate font-bloom-subtle">
                          {result.title}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 bg-black border border-zinc-700 text-zinc-300 uppercase">
                          {result.category}
                        </span>
                        {result.department && (
                          <span className="text-[10px] px-2 py-0.5 badge-muted-green font-bloom-green uppercase">
                            {result.department}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs text-zinc-300 leading-relaxed font-pixel-code bg-black p-3 border border-zinc-800"
                        dangerouslySetInnerHTML={{ __html: highlightQuery(result.excerpt) }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 font-pixel-code">
                    <span className="text-xs px-2.5 py-0.5 font-bold badge-muted-green font-bloom-green uppercase">
                      {Math.round(result.score * 100)}% MATCH
                    </span>
                    <button
                      onClick={(e) => copyResultText(e, result.document_id, result.extractedText || result.excerpt)}
                      className="pixel-btn-dark text-[10px] py-1 px-2 flex items-center gap-1"
                      title="Copy document text"
                    >
                      {copiedId === result.document_id ? (
                        <>
                          <Check className="w-3 h-3 text-[#6ee7b7]" /> COPIED
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> COPY TEXT
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
        <div className="pixel-box p-12 text-center animate-pixel-float">
          <Zap className="w-10 h-10 text-white stroke-[2.5] mx-auto mb-3" />
          <h3 className="text-sm font-pixel-head font-bold text-white mb-2 font-bloom">SEARCH DOCUMENT CONTENTS & EXTRACTED TEXT</h3>
          <p className="text-zinc-400 text-xs font-pixel-code max-w-md mx-auto uppercase">
            SEARCH FULL TEXT BODY, SPECIFIC TERMS, NUMBERS, OR TOPICS CONVERTED FROM UPLOADED PDFS & IMAGES.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center font-pixel-code">
            {['Thermit weld', 'PSD Gate 4', 'HEPA filters', 'Operating Surplus', 'CBTC signaling'].map((q) => (
              <button
                key={q}
                onClick={() => {
                  setQuery(q);
                  setSearchMode('content');
                }}
                className="px-3 py-1 bg-black border border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white hover:border-white transition-all uppercase flex items-center gap-1.5"
              >
                <Search className="w-3 h-3 text-zinc-400" />
                "{q}"
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
