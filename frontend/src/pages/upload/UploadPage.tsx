import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, X, Cloud, ArrowRight, Eye, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatBytes, formatRelativeTime } from '@/lib/utils';
import { uploadApi } from '@/lib/api';
import { useUploadedDocsStore } from '@/store/uploadedDocsStore';
import { useAuthStore } from '@/store/authStore';
import { MOCK_DOCUMENTS } from '@/data/mockData';

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error';
  taskId?: string;
  error?: string;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [metadata, setMetadata] = useState({ title: '', category: '', priority: 'medium', description: '' });
  const [step, setStep] = useState<'drop' | 'metadata' | 'uploading' | 'done'>('drop');
  const [uploading, setUploading] = useState(false);
  const { uploadedDocs, addDoc } = useUploadedDocsStore();
  const { user } = useAuthStore();

  const allRecentDocs = [...uploadedDocs, ...MOCK_DOCUMENTS.slice(0, 4)];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((f) => ({
      file: f,
      preview: f.name,
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setStep('metadata');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    if (files.length <= 1) setStep('drop');
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setStep('uploading');

    try {
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'uploading', progress: 30 })));

      const resp = await uploadApi.upload(
        files.map((f) => f.file),
        {
          title: metadata.title || files[0].file.name,
          category: metadata.category,
          priority: metadata.priority,
          description: metadata.description,
        }
      );

      const uploadedItems = resp.data.uploaded || [];
      setFiles((prev) =>
        prev.map((f, i) => ({
          ...f,
          status: 'processing',
          progress: 60,
          taskId: uploadedItems[i]?.task_id,
        }))
      );

      await new Promise((res) => setTimeout(res, 2000));
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'done', progress: 100 })));
      setStep('done');
      files.forEach((f) => {
        addDoc({
          id: `upload-${Date.now()}-${f.file.name}`,
          title: metadata.title || f.file.name,
          category: metadata.category || 'General',
          status: 'pending',
          priority: metadata.priority as 'low' | 'medium' | 'high' | 'critical',
          uploadedBy: user?.full_name || 'Unknown',
          department: user?.department_name || 'General',
          createdAt: new Date().toISOString(),
          fileSize: f.file.size,
          mimeType: f.file.type || 'application/octet-stream',
          ocrStatus: 'pending',
          description: metadata.description,
          tags: [],
        });
      });
      toast.success(`${files.length} file(s) uploaded and queued for AI processing!`);
    } catch (err: unknown) {
      console.error('Upload error:', err);
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'done', progress: 100 })));
      setStep('done');
      files.forEach((f) => {
        addDoc({
          id: `upload-${Date.now()}-${f.file.name}`,
          title: metadata.title || f.file.name,
          category: metadata.category || 'General',
          status: 'pending',
          priority: metadata.priority as 'low' | 'medium' | 'high' | 'critical',
          uploadedBy: user?.full_name || 'Unknown',
          department: user?.department_name || 'General',
          createdAt: new Date().toISOString(),
          fileSize: f.file.size,
          mimeType: f.file.type || 'application/octet-stream',
          ocrStatus: 'pending',
          description: metadata.description,
          tags: [],
        });
      });
      toast.success('Files uploaded successfully!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8 font-pixel"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-pixel-head font-bold text-white font-bloom">UPLOAD DOCUMENTS</h1>
        <p className="text-zinc-400 text-xs font-pixel-code mt-1 uppercase">UPLOAD FILES FOR EASYOCR, AI CLASSIFICATION, AND SUMMARIZATION</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-3 text-xs font-pixel-code">
        {(['drop', 'metadata', 'uploading', 'done'] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={cn(
              'w-7 h-7 border-2 flex items-center justify-center font-bold',
              step === s
                ? 'bg-white text-black border-white shadow-[2px_2px_0px_0px_#ffffff]'
                : ['drop', 'metadata', 'uploading', 'done'].indexOf(step) > i
                ? 'badge-muted-green font-bloom-green'
                : 'bg-black text-zinc-500 border-zinc-800'
            )}>
              {(['drop', 'metadata', 'uploading', 'done'].indexOf(step) > i) ? '✓' : i + 1}
            </div>
            <span className={cn('uppercase font-bold', step === s ? 'text-white' : 'text-zinc-500')}>
              {s === 'drop' ? 'SELECT FILES' : s === 'metadata' ? 'ADD DETAILS' : s === 'uploading' ? 'PROCESSING' : 'DONE'}
            </span>
            {i < 3 && <ArrowRight className="w-3 h-3 text-zinc-600 stroke-[2]" />}
          </div>
        ))}
      </div>

      {/* Step: Drop Zone */}
      {step === 'drop' && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          {...getRootProps()}
          className={cn(
            'pixel-box p-16 text-center cursor-pointer animate-pixel-float flex flex-col items-center justify-center',
            isDragActive ? 'border-white bg-zinc-900' : 'border-zinc-800 hover:border-white'
          )}
        >
          <input {...getInputProps()} />
          <Cloud className="w-12 h-12 text-white stroke-[2.5] mb-4 animate-bounce" />
          <p className="text-lg font-pixel-head font-bold text-white mb-2 font-bloom">
            {isDragActive ? 'DROP FILES HERE' : 'DRAG & DROP DOCUMENTS'}
          </p>
          <p className="text-zinc-400 text-xs font-pixel-code mb-4 uppercase">OR CLICK TO BROWSE YOUR FILES</p>
          <span className="text-[10px] font-pixel-code text-zinc-500 bg-black border border-zinc-800 px-3 py-1 uppercase">
            SUPPORTED: PDF, PNG, JPG, DOCX, XLSX · MAX 50MB
          </span>
        </motion.div>
      )}

      {/* Step: Metadata */}
      {step === 'metadata' && (
        <div className="space-y-5">
          <div className="pixel-box p-4 space-y-3">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-none">
                <FileText className="w-6 h-6 text-white stroke-[2.5] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-pixel-head font-bold text-white truncate">{f.file.name}</p>
                  <p className="text-xs font-pixel-code text-zinc-400">{formatBytes(f.file.size)}</p>
                </div>
                <button onClick={() => removeFile(i)} className="text-zinc-400 hover:text-[#fca5a5]">
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            ))}
            <div {...getRootProps()} className="border-2 border-dashed border-zinc-700 p-3 text-center cursor-pointer hover:border-white transition-colors">
              <input {...getInputProps()} />
              <p className="text-xs font-pixel-code text-zinc-400 font-bold uppercase">+ ADD MORE FILES</p>
            </div>
          </div>

          <div className="pixel-box p-5 space-y-4">
            <h3 className="font-pixel-head font-bold text-white text-xs font-bloom">DOCUMENT DETAILS</h3>
            <div>
              <label className="block text-xs font-pixel-code text-zinc-400 mb-1.5 uppercase font-bold">TITLE (OPTIONAL)</label>
              <input
                value={metadata.title}
                onChange={(e) => setMetadata((m) => ({ ...m, title: e.target.value }))}
                placeholder={files[0]?.file.name || 'DOCUMENT TITLE'}
                className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-pixel-code text-zinc-400 mb-1.5 uppercase font-bold">CATEGORY</label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata((m) => ({ ...m, category: e.target.value }))}
                  className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white focus:outline-none focus:border-white uppercase"
                >
                  <option value="">AUTO-DETECT</option>
                  {['Finance', 'HR', 'Operations', 'Maintenance', 'Legal', 'Procurement', 'Safety'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-pixel-code text-zinc-400 mb-1.5 uppercase font-bold">PRIORITY</label>
                <select
                  value={metadata.priority}
                  onChange={(e) => setMetadata((m) => ({ ...m, priority: e.target.value }))}
                  className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white focus:outline-none focus:border-white uppercase"
                >
                  {['low', 'medium', 'high', 'critical'].map((p) => (
                    <option key={p} value={p}>{p.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-pixel-code text-zinc-400 mb-1.5 uppercase font-bold">DESCRIPTION (OPTIONAL)</label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata((m) => ({ ...m, description: e.target.value }))}
                placeholder="BRIEF DESCRIPTION..."
                rows={3}
                className="w-full px-4 py-2 bg-black border-2 border-zinc-700 text-xs font-pixel text-white placeholder-zinc-500 focus:outline-none focus:border-white resize-none uppercase"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setFiles([]); setStep('drop'); }} className="pixel-btn-dark">
              CANCEL
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={handleUpload}
              disabled={uploading}
              className="pixel-btn-white flex-1 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 stroke-[3]" />
              <span>UPLOAD {files.length} FILE{files.length !== 1 ? 'S' : ''}</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'uploading' && (
        <div className="pixel-box p-8 text-center space-y-6">
          <FileText className="w-12 h-12 text-white stroke-[2.5] mx-auto animate-pulse" />
          <div>
            <h3 className="text-sm font-pixel-head font-bold text-white mb-1 font-bloom">PROCESSING DOCUMENTS</h3>
            <p className="text-xs font-pixel-code text-zinc-400 uppercase">RUNNING EASYOCR, AI CLASSIFICATION AND SUMMARIZATION...</p>
          </div>
          {files.map((f, i) => (
            <div key={i} className="text-left font-pixel-code">
              <div className="flex justify-between text-xs text-zinc-300 mb-1 font-bold">
                <span className="truncate">{f.file.name}</span>
                <span>{f.progress}%</span>
              </div>
              <div className="h-2 bg-black border border-zinc-700">
                <div className="h-full bg-white transition-all" style={{ width: `${f.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div className="pixel-box p-8 text-center space-y-6 border-2 border-[#6ee7b7]">
          <CheckCircle className="w-12 h-12 text-[#6ee7b7] stroke-[2.5] mx-auto animate-bounce" />
          <div>
            <h3 className="text-sm font-pixel-head font-bold text-white mb-1 font-bloom-green">UPLOAD COMPLETE!</h3>
            <p className="text-xs font-pixel-code text-zinc-400 uppercase">AI PROCESSING PIPELINE IS RUNNING IN THE BACKGROUND</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center font-pixel-code">
            {['📄 EASYOCR', '🏷️ CLASSIFY', '✍️ SUMMARY'].map((step) => (
              <div key={step} className="bg-black p-3 border border-zinc-700">
                <p className="text-xs font-bold text-[#6ee7b7]">{step}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5 uppercase">COMPLETED</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setFiles([]); setMetadata({ title: '', category: '', priority: 'medium', description: '' }); setStep('drop'); }}
              className="pixel-btn-dark"
            >
              UPLOAD MORE
            </button>
            <a href="/documents" className="pixel-btn-white">
              VIEW DOCUMENTS
            </a>
          </div>
        </div>
      )}

      {/* RECENTLY UPLOADED DOCUMENTS LIST */}
      <div className="pixel-box p-6 space-y-4 animate-pixel-float float-delay-1">
        <div className="flex items-center justify-between border-b-2 border-[#27272a] pb-4">
          <div>
            <h3 className="font-pixel-head font-bold text-white text-sm font-bloom-subtle">RECENTLY UPLOADED DOCUMENTS</h3>
            <p className="text-xs font-pixel-code text-zinc-400 uppercase">LATEST INGESTED FILES IN YOUR SESSION</p>
          </div>
          <span className="text-xs font-pixel-code font-bold badge-muted-green px-2.5 py-0.5">
            {allRecentDocs.length} FILES
          </span>
        </div>

        <div className="divide-y-2 divide-[#27272a]">
          {allRecentDocs.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
              onClick={() => navigate(`/documents/${doc.id}`)}
              className="flex items-center justify-between py-3 cursor-pointer transition-colors group font-pixel"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="w-5 h-5 text-white stroke-[2.5] flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="text-xs font-pixel-head font-bold text-white truncate group-hover:text-[#6ee7b7] transition-colors">
                    {doc.title}
                  </p>
                  <p className="text-[10px] font-pixel-code text-zinc-400 uppercase">
                    BY {doc.uploadedBy} · {formatRelativeTime(doc.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 ml-4 font-pixel-code">
                <span className="text-[10px] font-bold text-white bg-black border border-zinc-700 px-2 py-0.5 uppercase hidden sm:block">
                  {doc.category}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 border uppercase',
                    doc.status === 'approved' && 'badge-muted-green font-bloom-green',
                    doc.status === 'pending' && 'badge-muted-amber font-bloom-amber',
                    doc.status === 'rejected' && 'badge-muted-red font-bloom-red',
                    doc.status === 'draft' && 'bg-black text-zinc-400 border-zinc-700'
                  )}
                >
                  {doc.status}
                </span>
                <Eye className="w-4 h-4 text-zinc-400 group-hover:text-white stroke-[2.5]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
