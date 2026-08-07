import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MockDocument } from '@/data/mockData';

interface UploadedDocsStore {
  uploadedDocs: MockDocument[];
  addDoc: (doc: MockDocument) => void;
  updateDoc: (id: string, updates: Partial<MockDocument>) => void;
  clearDocs: () => void;
}

export const useUploadedDocsStore = create<UploadedDocsStore>()(
  persist(
    (set) => ({
      uploadedDocs: [],
      addDoc: (doc) => set((state) => ({ uploadedDocs: [doc, ...state.uploadedDocs] })),
      updateDoc: (id, updates) =>
        set((state) => ({
          uploadedDocs: state.uploadedDocs.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),
      clearDocs: () => set({ uploadedDocs: [] }),
    }),
    {
      name: 'kmrl-uploaded-docs-v1',
    }
  )
);
