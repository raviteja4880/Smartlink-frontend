import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';

/**
 * @param {string|null} linkId
 */
export function useAnalytics(linkId) {
  const statsQuery = useQuery({
    queryKey: ['analytics', linkId],
    queryFn: async () => {
      const response = await analyticsApi.getStats(linkId);
      return response?.data?.data || null;
    },
    enabled: Boolean(linkId),
    staleTime: 60_000 // 1 minute
  });

  const eventsQuery = useQuery({
    queryKey: ['analytics-events', linkId],
    queryFn: async () => {
      const response = await analyticsApi.getEvents(linkId, 50);
      return response?.data?.data || [];
    },
    enabled: Boolean(linkId),
    staleTime: 30_000
  });

  return { statsQuery, eventsQuery };
}
