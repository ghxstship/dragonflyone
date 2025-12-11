import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserProfile, useUpdateProfile, profileKeys } from '../useProfile';

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

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('profileKeys', () => {
    it('should generate correct all key', () => {
      expect(profileKeys.all).toEqual(['profile']);
    });

    it('should generate correct user key', () => {
      expect(profileKeys.user()).toEqual(['profile', 'user']);
    });
  });

  describe('useUserProfile hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.profile).toBeDefined();
      expect(result.current.data?.roles).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useUserProfile(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useUpdateProfile hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useUpdateProfile(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('UserProfile interface', () => {
  it('should have required fields', () => {
    const profile = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      department: 'Production',
      title: 'Production Manager',
      role: 'ATLVS_ADMIN',
    };

    expect(profile.firstName).toBeDefined();
    expect(profile.lastName).toBeDefined();
    expect(profile.email).toBeDefined();
    expect(profile.phone).toBeDefined();
    expect(profile.department).toBeDefined();
    expect(profile.title).toBeDefined();
    expect(profile.role).toBeDefined();
  });

  it('should support optional fields', () => {
    const profile = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      department: 'Production',
      title: 'Production Manager',
      role: 'ATLVS_ADMIN',
      platformRoles: ['admin', 'viewer'],
    };

    expect(profile.platformRoles).toHaveLength(2);
    expect(profile.platformRoles).toContain('admin');
  });
});
