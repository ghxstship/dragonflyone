'use client';

import { useMutation } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

// Types
export interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
}

export interface OrganizationData {
  name: string;
  type: string;
  role: string;
  teamSize: string;
}

export interface RoleData {
  role: string;
}

export interface PreferencesData {
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

// Helper to get auth headers - uses cookie-based auth via credentials: include
function getAuthHeaders(): HeadersInit {
  return { 'Content-Type': 'application/json' };
}

// Mutation functions
async function saveProfile(data: ProfileData): Promise<void> {
  const response = await fetch('/api/onboarding/profile', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to save profile');
  }
}

async function saveOrganization(data: OrganizationData): Promise<void> {
  const response = await fetch('/api/onboarding/organization', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to save organization');
  }
}

async function saveRole(data: RoleData): Promise<void> {
  const response = await fetch('/api/onboarding/role', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to save role');
  }
}

async function savePreferences(data: PreferencesData): Promise<void> {
  const response = await fetch('/api/onboarding/preferences', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to save preferences');
  }
}

async function completeOnboarding(): Promise<void> {
  const response = await fetch('/api/onboarding/complete', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to complete onboarding');
  }
}

// Hook for saving profile
export function useSaveProfile() {
  return useMutation({
    mutationFn: saveProfile,
    onError: (error) => {
      log.error('Failed to save profile:', error);
    },
  });
}

// Hook for saving organization
export function useSaveOrganization() {
  return useMutation({
    mutationFn: saveOrganization,
    onError: (error) => {
      log.error('Failed to save organization:', error);
    },
  });
}

// Hook for saving role
export function useSaveRole() {
  return useMutation({
    mutationFn: saveRole,
    onError: (error) => {
      log.error('Failed to save role:', error);
    },
  });
}

// Hook for saving preferences
export function useSavePreferences() {
  return useMutation({
    mutationFn: savePreferences,
    onError: (error) => {
      log.error('Failed to save preferences:', error);
    },
  });
}

// Hook for completing onboarding
export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: completeOnboarding,
    onError: (error) => {
      log.error('Failed to complete onboarding:', error);
    },
  });
}

// Combined hook for all onboarding operations
export function useOnboarding() {
  const saveProfileMutation = useSaveProfile();
  const saveOrganizationMutation = useSaveOrganization();
  const saveRoleMutation = useSaveRole();
  const savePreferencesMutation = useSavePreferences();
  const completeOnboardingMutation = useCompleteOnboarding();

  return {
    // Mutations
    saveProfile: saveProfileMutation.mutateAsync,
    isSavingProfile: saveProfileMutation.isPending,
    profileError: saveProfileMutation.error,

    saveOrganization: saveOrganizationMutation.mutateAsync,
    isSavingOrganization: saveOrganizationMutation.isPending,
    organizationError: saveOrganizationMutation.error,

    saveRole: saveRoleMutation.mutateAsync,
    isSavingRole: saveRoleMutation.isPending,
    roleError: saveRoleMutation.error,

    savePreferences: savePreferencesMutation.mutateAsync,
    isSavingPreferences: savePreferencesMutation.isPending,
    preferencesError: savePreferencesMutation.error,

    completeOnboarding: completeOnboardingMutation.mutateAsync,
    isCompletingOnboarding: completeOnboardingMutation.isPending,
    completeError: completeOnboardingMutation.error,

    // Combined loading state
    isLoading:
      saveProfileMutation.isPending ||
      saveOrganizationMutation.isPending ||
      saveRoleMutation.isPending ||
      savePreferencesMutation.isPending ||
      completeOnboardingMutation.isPending,
  };
}
