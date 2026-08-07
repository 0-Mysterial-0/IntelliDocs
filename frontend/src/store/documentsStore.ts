import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_DOCUMENTS, MockDocument } from '@/data/mockData';

interface DocumentsStore {
  documents: MockDocument[];
  addDocument: (doc: MockDocument) => void;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<MockDocument>) => void;
  getDuplicates: () => MockDocument[];
  resetToDefaults: () => void;
}

export const useDocumentsStore = create<DocumentsStore>()(
  persist(
    (set, get) => ({
      documents: MOCK_DOCUMENTS,
      addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
      deleteDocument: (id) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        }));
      },
      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),
      getDuplicates: () => get().documents.filter((d) => d.isDuplicate),
      resetToDefaults: () => set({ documents: MOCK_DOCUMENTS }),
    }),
    {
      name: 'kmrl-documents-store-v3',
    }
  )
);
