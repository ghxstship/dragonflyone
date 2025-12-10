'use client';

import { useMutation } from '@tanstack/react-query';

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface NewPasswordData {
  token: string;
  password: string;
}

export const authKeys = {
  all: ['auth'] as const,
};

export function useSignUp() {
  return useMutation({
    mutationFn: async (data: SignUpData) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Sign up failed');
      return result;
    },
  });
}

export function useOAuthSignIn() {
  return useMutation({
    mutationFn: async (provider: 'google' | 'apple') => {
      const response = await fetch(`/api/auth/oauth/${provider}`, { method: 'POST' });
      const data = await response.json();
      return data;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send reset email');
      return result;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, password }: NewPasswordData) => {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to reset password');
      return result;
    },
  });
}

export function useMagicLink() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to send magic link');
      return result;
    },
  });
}

export function useAuthData() {
  const signUpMutation = useSignUp();
  const oauthMutation = useOAuthSignIn();
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();
  const magicLinkMutation = useMagicLink();

  return {
    signUp: signUpMutation.mutateAsync,
    isSigningUp: signUpMutation.isPending,
    signUpError: signUpMutation.error,
    oauthSignIn: oauthMutation.mutateAsync,
    isOAuthLoading: oauthMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingReset: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetting: resetPasswordMutation.isPending,
    sendMagicLink: magicLinkMutation.mutateAsync,
    isSendingMagicLink: magicLinkMutation.isPending,
  };
}
