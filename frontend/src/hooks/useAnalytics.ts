import { useQuery } from '@tanstack/react-query';
import { MOCK_ANALYTICS } from '../data/mockData';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return MOCK_ANALYTICS;
    }
  });
};
