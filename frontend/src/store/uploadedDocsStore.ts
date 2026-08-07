import { create } from 'zustand';
import { MockDocument } from '@/data/mockData';

interface UploadedDocsStore {
  uploadedDocs: MockDocument[];
  addDoc: (doc: MockDocument) => void;
  clearDocs: () => void;
}

export const useUploadedDocsStore = create<UploadedDocsStore>((set) => ({
  uploadedDocs: [],
  addDoc: (doc) => set((state) => ({ uploadedDocs: [doc, ...state.uploadedDocs] })),
  clearDocs: () => set({ uploadedDocs: [] }),
}));
