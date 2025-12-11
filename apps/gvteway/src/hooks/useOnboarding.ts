'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
}

export interface PreferencesData {
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ghxstship_access_token') : null;
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export function useSaveProfile() {
  return useMutation({
    mutationFn: async (profile: ProfileData) => {
      const response = await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error('Failed to save profile');
      return response.json();
    },
  });
}

export function useSaveInterests() {
  return useMutation({
    mutationFn: async (interests: string[]) => {
      const response = await fetch('/api/onboarding/interests', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ interests }),
      });
      if (!response.ok) throw new Error('Failed to save interests');
      return response.json();
    },
  });
}

export function useSavePreferences() {
  return useMutation({
    mutationFn: async (preferences: PreferencesData) => {
      const response = await fetch('/api/onboarding/preferences', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences),
      });
      if (!response.ok) throw new Error('Failed to save preferences');
      return response.json();
    },
  });
}

export function useCompleteOnboarding() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to complete onboarding');
      return response.json();
    },
    onSuccess: () => {
      router.push('/');
    },
  });
}

export function useOnboardingData() {
  const saveProfileMutation = useSaveProfile();
  const saveInterestsMutation = useSaveInterests();
  const savePreferencesMutation = useSavePreferences();
  const completeMutation = useCompleteOnboarding();

  return {
    saveProfile: saveProfileMutation.mutateAsync,
    isSavingProfile: saveProfileMutation.isPending,
    profileError: saveProfileMutation.error,
    
    saveInterests: saveInterestsMutation.mutateAsync,
    isSavingInterests: saveInterestsMutation.isPending,
    interestsError: saveInterestsMutation.error,
    
    savePreferences: savePreferencesMutation.mutateAsync,
    isSavingPreferences: savePreferencesMutation.isPending,
    preferencesError: savePreferencesMutation.error,
    
    completeOnboarding: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
    completeError: completeMutation.error,
    
    isLoading: saveProfileMutation.isPending || saveInterestsMutation.isPending || savePreferencesMutation.isPending || completeMutation.isPending,
    error: saveProfileMutation.error || saveInterestsMutation.error || savePreferencesMutation.error || completeMutation.error,
  };
}
