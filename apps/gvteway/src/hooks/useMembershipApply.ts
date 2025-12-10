'use client';

import { useMutation } from '@tanstack/react-query';

export interface MembershipApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  interests: string[];
  selectedTier: string;
  referralCode: string;
}

export const membershipApplyKeys = {
  all: ['membership-apply'] as const,
};

export function useSubmitMembershipApplication() {
  return useMutation({
    mutationFn: async (application: MembershipApplication) => {
      const response = await fetch('/api/membership/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application),
      });
      if (!response.ok) throw new Error('Application submission failed');
      return response.json();
    },
  });
}

export function useMembershipApplyData() {
  const submitMutation = useSubmitMembershipApplication();

  return {
    submitApplication: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    error: submitMutation.error,
  };
}
