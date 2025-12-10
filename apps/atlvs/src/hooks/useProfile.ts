'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  title: string;
  role: string;
  platformRoles?: string[];
}

const DEMO_PROFILE: UserProfile = {
  firstName: "Demo",
  lastName: "User",
  email: "demo@ghxstship.com",
  phone: "(555) 123-4567",
  department: "Production",
  title: "Production Manager",
  role: "ATLVS_ADMIN",
  platformRoles: [],
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
      if (response.status === 401) {
        return { profile: DEMO_PROFILE, roles: [] };
      }
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      if (data.user) {
        return {
          profile: { ...DEMO_PROFILE, ...data.user },
          roles: data.user.platformRoles || [],
        };
      }
      return { profile: DEMO_PROFILE, roles: [] };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    onError: (error) => {
      log.error('Failed to save profile:', error instanceof Error ? error : undefined);
    },
  });
}

export function useProfileData() {
  const profileQuery = useUserProfile();
  const updateMutation = useUpdateProfile();

  const data = profileQuery.data || { profile: DEMO_PROFILE, roles: [] };

  return {
    profile: data.profile,
    userRoles: data.roles,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    refetch: profileQuery.refetch,
  };
}
