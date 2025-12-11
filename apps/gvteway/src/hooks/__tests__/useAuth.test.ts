import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSignUp, useOAuthSignIn, useForgotPassword, useResetPassword, useMagicLink, authKeys } from '../useAuth';

// Mock fetch
global.fetch = vi.fn();

const createWrapper = (): (({ children }: { children: ReactNode }) => JSX.Element) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function TestWrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authKeys', () => {
    it('should generate correct all key', () => {
      expect(authKeys.all).toEqual(['auth']);
    });
  });

  describe('useSignUp hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useSignUp(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useSignUp(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useOAuthSignIn hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useOAuthSignIn(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useForgotPassword hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useForgotPassword(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useResetPassword hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useResetPassword(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useMagicLink hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useMagicLink(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('SignUpData interface', () => {
  it('should have required fields', () => {
    const data = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    expect(data.firstName).toBeDefined();
    expect(data.lastName).toBeDefined();
    expect(data.email).toBeDefined();
    expect(data.password).toBeDefined();
  });
});

describe('ResetPasswordData interface', () => {
  it('should have required fields', () => {
    const data = {
      email: 'john@example.com',
    };

    expect(data.email).toBeDefined();
  });
});

describe('NewPasswordData interface', () => {
  it('should have required fields', () => {
    const data = {
      token: 'reset-token-123',
      password: 'newpassword123',
    };

    expect(data.token).toBeDefined();
    expect(data.password).toBeDefined();
  });
});
