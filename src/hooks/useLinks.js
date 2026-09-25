import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { linksApi } from '../services/api';

/**
 * @param {{ q?: string, category?: string, readingTime?: string, sort?: string }} filters
 */
export function useLinks(filters = {}) {
  const queryClient = useQueryClient();

  const linksQuery = useQuery({
    queryKey: ['links', filters],
    queryFn: async () => {
      const response = await linksApi.list(filters);
      return response?.data?.data || [];
    }
  });

  const createLinkMutation = useMutation({
    mutationFn: linksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    }
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (id) => linksApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
    }
  });

  return { linksQuery, createLinkMutation, deleteLinkMutation };
}
