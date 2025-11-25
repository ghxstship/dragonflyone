import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CrewSkill {
  id: string;
  crew_id: string;
  skill_name: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  certifications?: string[];
  last_used?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCrewSkills = (crewId?: string) => {
  return useQuery({
    queryKey: ['crew-skills', crewId],
    queryFn: async () => {
      let query = supabase
        .from('crew_skills')
        .select('*')
        .order('skill_name');

      if (crewId) {
        query = query.eq('crew_id', crewId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrewSkill[];
    },
  });
};

export const useAddCrewSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skill: Omit<CrewSkill, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('crew_skills')
        .insert(skill)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-skills'] });
    },
  });
};

export const useUpdateCrewSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CrewSkill> & { id: string }) => {
      const { data, error } = await supabase
        .from('crew_skills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-skills'] });
    },
  });
};

export const useDeleteCrewSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crew_skills')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-skills'] });
    },
  });
};
