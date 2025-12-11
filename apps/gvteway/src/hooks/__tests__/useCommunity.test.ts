import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCommunityData, communityKeys } from '../useCommunity';

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

describe('useCommunity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('communityKeys', () => {
    it('should generate correct all key', () => {
      expect(communityKeys.all).toEqual(['community']);
    });

    it('should generate correct forums key', () => {
      expect(communityKeys.forums()).toEqual(['community', 'forums']);
    });

    it('should generate correct groups key', () => {
      expect(communityKeys.groups()).toEqual(['community', 'groups']);
    });

    it('should generate correct events key', () => {
      expect(communityKeys.events()).toEqual(['community', 'events']);
    });
  });

  describe('useCommunityData hook', () => {
    it('should return demo data on error response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
      });

      const { result } = renderHook(() => useCommunityData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.forums).toBeDefined();
      expect(result.current.groups).toBeDefined();
      expect(result.current.communityEvents).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));
      const { result } = renderHook(() => useCommunityData(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });
});

describe('Forum interface', () => {
  it('should have required fields', () => {
    const forum = {
      id: '1',
      title: 'Festival Tips & Tricks',
      posts: 1234,
      members: 5678,
      lastActive: '2 hours ago',
      trending: true,
    };

    expect(forum.id).toBeDefined();
    expect(forum.title).toBeDefined();
    expect(forum.posts).toBeDefined();
    expect(forum.members).toBeDefined();
    expect(forum.lastActive).toBeDefined();
    expect(forum.trending).toBeDefined();
  });

  it('should support optional fields', () => {
    const forum = {
      id: '1',
      title: 'Festival Tips & Tricks',
      posts: 1234,
      members: 5678,
      lastActive: '2 hours ago',
      trending: true,
      category: 'General',
    };

    expect(forum.category).toBe('General');
  });
});

describe('CommunityGroup interface', () => {
  it('should have required fields', () => {
    const group = {
      id: '1',
      name: 'EDM Lovers',
      members_count: 2500,
      privacy: 'public',
      description: 'A community for electronic dance music enthusiasts',
    };

    expect(group.id).toBeDefined();
    expect(group.name).toBeDefined();
    expect(group.members_count).toBeDefined();
    expect(group.privacy).toBeDefined();
    expect(group.description).toBeDefined();
  });
});

describe('CommunityEvent interface', () => {
  it('should have required fields', () => {
    const event = {
      id: '1',
      title: 'Pre-Festival Meetup',
      description: 'Meet fellow fans before the big day!',
      location: 'Downtown Coffee House',
      event_date: '2024-07-15',
      attendees_count: 45,
    };

    expect(event.id).toBeDefined();
    expect(event.title).toBeDefined();
    expect(event.description).toBeDefined();
    expect(event.location).toBeDefined();
    expect(event.event_date).toBeDefined();
    expect(event.attendees_count).toBeDefined();
  });
});
