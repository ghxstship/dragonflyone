import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signOut, getCurrentUser, isAuthenticated } from '../auth.js';

describe('auth utilities', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  describe('signOut', () => {
    it('calls signout API endpoint', async () => {
      mockFetch.mockResolvedValueOnce(new Response());
      
      await signOut();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/signout', { method: 'POST' });
    });
  });

  describe('getCurrentUser', () => {
    it('returns user when authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ user: mockUser }), { status: 200 })
      );
      
      const user = await getCurrentUser();
      
      expect(user).toEqual(mockUser);
    });

    it('returns null when not authenticated', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 401 })
      );
      
      const user = await getCurrentUser();
      
      expect(user).toBeNull();
    });

    it('calls the correct API endpoint', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ user: null }), { status: 200 })
      );
      
      await getCurrentUser();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me');
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when authenticated', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 200 })
      );
      
      const result = await isAuthenticated();
      
      expect(result).toBe(true);
    });

    it('returns false when not authenticated', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 401 })
      );
      
      const result = await isAuthenticated();
      
      expect(result).toBe(false);
    });

    it('calls the correct API endpoint', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response(null, { status: 200 })
      );
      
      await isAuthenticated();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me');
    });
  });
});
