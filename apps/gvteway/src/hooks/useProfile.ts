'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  role: string;
  membershipTier: string;
  platformRoles?: string[];
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@example.com',
  phone: '(305) 555-0123',
  city: 'Miami',
  state: 'FL',
  role: 'GVTEWAY_MEMBER',
  membershipTier: 'PLUS',
};

export const profileKeys = {
  all: ['profile'] as const,
  user: () => [...profileKeys.all, 'user'] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: profileKeys.user(),
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) return { user: DEFAULT_PROFILE, platformRoles: [] };
      const data = await response.json();
      return {
        user: { ...DEFAULT_PROFILE, ...data.user },
        platformRoles: data.user?.platformRoles || [],
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error('Failed to save profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
}

export function useProfileData() {
  const profileQuery = useUserProfile();
  const saveMutation = useSaveProfile();

  return {
    profile: profileQuery.data?.user || DEFAULT_PROFILE,
    platformRoles: profileQuery.data?.platformRoles || [],
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    saveProfile: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
