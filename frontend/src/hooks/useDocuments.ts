import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MOCK_DOCUMENTS, MockDocument } from '../data/mockData';

export const useDocuments = () => {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_DOCUMENTS;
    }
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const doc = MOCK_DOCUMENTS.find((d: MockDocument) => d.id === id);
      if (!doc) throw new Error('Document not found');
      return doc;
    }
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
};
