import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Production {
  id: string;
  title: string;
  tagline?: string;
  description?: string;
  format?: string;
  genre?: string;
  status: string;
  venue_id?: string;
  venue_name?: string;
  opening_date?: string;
  closing_date?: string;
  budget?: number;
  created_at?: string;
  updated_at?: string;
}

interface ProductionsResponse {
  productions: Production[];
}

interface UseProductionsOptions {
  status?: string;
  limit?: number;
  offset?: number;
}

export function useProductions(options: UseProductionsOptions = {}) {
  const { status, limit = 50, offset = 0 } = options;

  return useQuery<Production[], Error>({
    queryKey: ['productions', { status, limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/productions?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch productions');
      }
      const data: ProductionsResponse = await response.json();
      return data.productions || [];
    },
  });
}

export function useProduction(id: string) {
  return useQuery<Production, Error>({
    queryKey: ['production', id],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch production');
      }
      const data = await response.json();
      return data.production;
    },
    enabled: !!id,
  });
}

interface CreateProductionData {
  title: string;
  tagline?: string;
  description?: string;
  format?: string;
  genre?: string;
  venue_id?: string;
  opening_date?: string;
  closing_date?: string;
  budget?: number;
}

export function useCreateProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductionData) => {
      const response = await fetch('/api/productions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create production');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
    },
  });
}

export function useUpdateProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Production) => {
      const response = await fetch(`/api/productions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update production');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
      queryClient.invalidateQueries({ queryKey: ['production', variables.id] });
    },
  });
}

export function useDeleteProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/productions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete production');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productions'] });
    },
  });
}

export function useProductionStats() {
  return useQuery({
    queryKey: ['production-stats'],
    queryFn: async () => {
      const response = await fetch('/api/productions/stats');
      if (!response.ok) {
        // Return default stats if endpoint doesn't exist
        return { total: 0, active: 0, upcoming: 0, past: 0 };
      }
      return response.json();
    },
  });
}
