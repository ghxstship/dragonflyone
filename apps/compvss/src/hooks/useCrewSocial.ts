'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// CREW SOCIAL HOOKS
// Manage crew social features, photos, and connections
// =============================================================================

export interface SocialCrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio?: string;
  skills: string[];
  location?: string;
  joined_date: string;
  projects_count: number;
  connections: string[];
  is_online: boolean;
}

export interface CrewPhoto {
  id: string;
  url: string;
  caption?: string;
  uploaded_by: string;
  project_name: string;
  likes: number;
  liked_by: string[];
  uploaded_at: string;
}

// Fetch social crew members
export function useSocialCrewMembers() {
  return useQuery({
    queryKey: ['social-crew-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_people')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(m => ({
        id: m.id,
        name: m.name || `${m.first_name} ${m.last_name}`,
        role: m.role || m.job_title,
        department: m.department,
        bio: m.bio,
        skills: m.skills || [],
        location: m.location,
        joined_date: m.created_at,
        projects_count: m.projects_count || 0,
        connections: m.connections || [],
        is_online: m.is_online || false,
      })) as SocialCrewMember[];
    },
  });
}

// Fetch crew photos
export function useCrewPhotos() {
  return useQuery({
    queryKey: ['crew-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        url: p.url,
        caption: p.caption,
        uploaded_by: p.uploaded_by,
        project_name: p.project_name,
        likes: p.likes || 0,
        liked_by: p.liked_by || [],
        uploaded_at: p.uploaded_at,
      })) as CrewPhoto[];
    },
  });
}

// Crew posts interface
export interface CrewPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  type: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

// Fetch crew posts
export function useCrewPosts() {
  return useQuery({
    queryKey: ['crew-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        authorId: p.author_id || '',
        authorName: p.author_name || '',
        authorRole: p.author_role || '',
        type: p.post_type || 'Update',
        content: p.content || '',
        timestamp: p.created_at || '',
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
      })) as CrewPost[];
    },
  });
}

// Like photo mutation
export function useLikePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, userId }: { photoId: string; userId: string }) => {
      // Get current photo
      const { data: photo, error: fetchError } = await supabase
        .from('legend_documents')
        .select('*')
        .eq('id', photoId)
        .single();

      if (fetchError) throw fetchError;

      const liked_by = photo.liked_by || [];
      const isLiked = liked_by.includes(userId);
      
      const newLikedBy = isLiked 
        ? liked_by.filter((id: string) => id !== userId)
        : [...liked_by, userId];

      const { data, error } = await supabase
        .from('legend_documents')
        .update({
          likes: newLikedBy.length,
          liked_by: newLikedBy,
        })
        .eq('id', photoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-photos'] });
    },
  });
}
