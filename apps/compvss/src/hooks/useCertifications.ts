import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Certification {
  id: string;
  crew_id: string;
  name: string;
  type: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  status: 'active' | 'expiring_soon' | 'expired';
  document_url?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useCertifications = (crewId?: string) => {
  return useQuery({
    queryKey: ['certifications', crewId],
    queryFn: async () => {
      let query = supabase
        .from('certifications')
        .select('*')
        .order('expiry_date');

      if (crewId) {
        query = query.eq('crew_id', crewId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Certification[];
    },
  });
};

export const useAddCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cert: Omit<Certification, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('certifications')
        .insert(cert)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
    },
  });
};

export const useUpdateCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Certification> & { id: string }) => {
      const { data, error } = await supabase
        .from('certifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
    },
  });
};

export const useDeleteCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] });
    },
  });
};
