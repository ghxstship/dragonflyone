'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@ghxstship/config';

export type CrewCertification = Tables<'crew_certifications'>;
export type CrewCertificationInsert = TablesInsert<'crew_certifications'>;
export type CrewCertificationUpdate = TablesUpdate<'crew_certifications'>;

export const useCertifications = (crewMemberId?: string) => {
  return useQuery({
    queryKey: ['crew_certifications', crewMemberId],
    queryFn: async () => {
      let query = supabase
        .from('crew_certifications')
        .select('*')
        .order('expiration_date');

      if (crewMemberId) {
        query = query.eq('crew_member_id', crewMemberId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useAddCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cert: CrewCertificationInsert) => {
      const { data, error } = await supabase
        .from('crew_certifications')
        .insert(cert)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_certifications'] });
    },
  });
};

export const useUpdateCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CrewCertificationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('crew_certifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_certifications'] });
    },
  });
};

export const useDeleteCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crew_certifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_certifications'] });
    },
  });
};
