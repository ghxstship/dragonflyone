'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MENTORSHIP HOOKS
// Manage mentors and mentorship programs
// =============================================================================

export interface Mentor {
  id: string;
  name: string;
  role: string;
  department: string;
  yearsExperience: number;
  specialties: string[];
  availability: 'Available' | 'Limited' | 'Full';
  mentees: number;
  maxMentees: number;
  rating: number;
}

export interface MentorshipProgram {
  id: string;
  name: string;
  description: string;
  level: 'Entry' | 'Intermediate' | 'Advanced';
  duration: string;
  modules: number;
  enrolled: number;
  capacity: number;
}

// Fetch mentors
export function useMentors() {
  return useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_people')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(m => ({
        id: m.id,
        name: m.name,
        role: m.role,
        department: m.department,
        yearsExperience: m.years_experience || 0,
        specialties: m.specialties || [],
        availability: m.availability || 'Available',
        mentees: m.current_mentees || 0,
        maxMentees: m.max_mentees || 3,
        rating: m.rating || 4.5,
      })) as Mentor[];
    },
  });
}

// Fetch mentorship programs
export function useMentorshipPrograms() {
  return useQuery({
    queryKey: ['mentorship-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        level: p.level || 'Entry',
        duration: p.duration,
        modules: p.modules_count || 0,
        enrolled: p.enrolled_count || 0,
        capacity: p.capacity || 20,
      })) as MentorshipProgram[];
    },
  });
}

// Request mentorship
export function useRequestMentorship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: { mentorId: string; message: string; experienceLevel: string; goals: string }) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          mentor_id: request.mentorId,
          message: request.message,
          experience_level: request.experienceLevel,
          goals: request.goals,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
}
