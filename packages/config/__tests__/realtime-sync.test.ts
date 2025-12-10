import { describe, it, expect } from 'vitest';
import type {
  RealtimeChangeEvent,
  RealtimeSyncOptions,
  PresenceState,
} from '../realtime-sync';
import { QueryClient } from '@tanstack/react-query';

describe('realtime-sync', () => {
  describe('RealtimeChangeEvent', () => {
    it('should include all event types', () => {
      const events: RealtimeChangeEvent[] = ['INSERT', 'UPDATE', 'DELETE', '*'];
      expect(events.length).toBe(4);
    });
  });

  describe('RealtimeSyncOptions interface', () => {
    it('should have all required fields', () => {
      const queryClient = new QueryClient();
      const options: RealtimeSyncOptions<{ id: string; name: string }> = {
        table: 'projects',
        queryKey: ['projects'],
        queryClient,
      };

      expect(options.table).toBe('projects');
      expect(options.queryKey).toEqual(['projects']);
      expect(options.queryClient).toBe(queryClient);
    });

    it('should support optional event filter', () => {
      const queryClient = new QueryClient();
      const options: RealtimeSyncOptions<{ id: string }> = {
        table: 'tasks',
        queryKey: ['tasks'],
        queryClient,
        event: 'INSERT',
      };

      expect(options.event).toBe('INSERT');
    });

    it('should support optional row filter', () => {
      const queryClient = new QueryClient();
      const options: RealtimeSyncOptions<{ id: string }> = {
        table: 'tasks',
        queryKey: ['tasks', 'project-123'],
        queryClient,
        filter: 'project_id=eq.project-123',
      };

      expect(options.filter).toBe('project_id=eq.project-123');
    });

    it('should support optional callbacks', () => {
      const queryClient = new QueryClient();
      const insertCallback = vi.fn();
      const updateCallback = vi.fn();
      const deleteCallback = vi.fn();

      const options: RealtimeSyncOptions<{ id: string; name: string }> = {
        table: 'projects',
        queryKey: ['projects'],
        queryClient,
        onInsert: insertCallback,
        onUpdate: updateCallback,
        onDelete: deleteCallback,
      };

      expect(options.onInsert).toBe(insertCallback);
      expect(options.onUpdate).toBe(updateCallback);
      expect(options.onDelete).toBe(deleteCallback);
    });

    it('should support custom schema', () => {
      const queryClient = new QueryClient();
      const options: RealtimeSyncOptions<{ id: string }> = {
        table: 'custom_table',
        queryKey: ['custom'],
        queryClient,
        schema: 'custom_schema',
      };

      expect(options.schema).toBe('custom_schema');
    });
  });

  describe('PresenceState interface', () => {
    it('should have all required fields', () => {
      const presence: PresenceState = {
        userId: 'user-123',
        online: true,
      };

      expect(presence.userId).toBe('user-123');
      expect(presence.online).toBe(true);
    });

    it('should support optional lastSeen', () => {
      const presence: PresenceState = {
        userId: 'user-123',
        online: true,
        lastSeen: new Date().toISOString(),
      };

      expect(presence.lastSeen).toBeDefined();
    });

    it('should support optional metadata', () => {
      const presence: PresenceState = {
        userId: 'user-123',
        online: true,
        metadata: {
          name: 'John Doe',
          avatar: 'https://example.com/avatar.jpg',
          role: 'admin',
        },
      };

      expect(presence.metadata?.name).toBe('John Doe');
      expect(presence.metadata?.role).toBe('admin');
    });

    it('should represent offline state', () => {
      const presence: PresenceState = {
        userId: 'user-456',
        online: false,
        lastSeen: '2025-01-01T12:00:00.000Z',
      };

      expect(presence.online).toBe(false);
      expect(presence.lastSeen).toBeDefined();
    });
  });

  describe('Query key patterns', () => {
    it('should support simple query keys', () => {
      const queryClient = new QueryClient();
      const options: RealtimeSyncOptions<{ id: string }> = {
        table: 'projects',
        queryKey: ['projects'],
        queryClient,
      };

      expect(options.queryKey).toEqual(['projects']);
    });

    it('should support nested query keys', () => {
      const queryClient = new QueryClient();
      const options: RealtimeSyncOptions<{ id: string }> = {
        table: 'tasks',
        queryKey: ['projects', 'proj-123', 'tasks'],
        queryClient,
      };

      expect(options.queryKey).toEqual(['projects', 'proj-123', 'tasks']);
    });

    it('should support query keys with filters', () => {
      const queryClient = new QueryClient();
      const options: RealtimeSyncOptions<{ id: string }> = {
        table: 'events',
        queryKey: ['events', { status: 'active', limit: 10 }],
        queryClient,
      };

      expect(options.queryKey[0]).toBe('events');
      expect(options.queryKey[1]).toEqual({ status: 'active', limit: 10 });
    });
  });
});
