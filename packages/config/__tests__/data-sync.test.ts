import { describe, it, expect } from 'vitest';
import type { SyncQueueItem } from '../data-sync';

describe('data-sync', () => {
  describe('SyncQueueItem interface', () => {
    it('should have all required fields', () => {
      const item: SyncQueueItem = {
        id: 'sync-123',
        operation: 'create',
        table: 'projects',
        data: { name: 'New Project', status: 'active' },
        timestamp: Date.now(),
        retries: 0,
      };

      expect(item.id).toBe('sync-123');
      expect(item.operation).toBe('create');
      expect(item.table).toBe('projects');
      expect(item.data).toBeDefined();
      expect(item.timestamp).toBeDefined();
      expect(item.retries).toBe(0);
    });

    it('should support create operation', () => {
      const item: SyncQueueItem = {
        id: 'sync-1',
        operation: 'create',
        table: 'tasks',
        data: { title: 'New Task', priority: 'high' },
        timestamp: Date.now(),
        retries: 0,
      };

      expect(item.operation).toBe('create');
    });

    it('should support update operation', () => {
      const item: SyncQueueItem = {
        id: 'sync-2',
        operation: 'update',
        table: 'tasks',
        data: { id: 'task-123', title: 'Updated Task' },
        timestamp: Date.now(),
        retries: 0,
      };

      expect(item.operation).toBe('update');
    });

    it('should support delete operation', () => {
      const item: SyncQueueItem = {
        id: 'sync-3',
        operation: 'delete',
        table: 'tasks',
        data: { id: 'task-123' },
        timestamp: Date.now(),
        retries: 0,
      };

      expect(item.operation).toBe('delete');
    });

    it('should track retry count', () => {
      const item: SyncQueueItem = {
        id: 'sync-4',
        operation: 'create',
        table: 'projects',
        data: { name: 'Test' },
        timestamp: Date.now(),
        retries: 3,
      };

      expect(item.retries).toBe(3);
    });

    it('should store timestamp for ordering', () => {
      const now = Date.now();
      const item1: SyncQueueItem = {
        id: 'sync-1',
        operation: 'create',
        table: 'projects',
        data: {},
        timestamp: now,
        retries: 0,
      };
      const item2: SyncQueueItem = {
        id: 'sync-2',
        operation: 'update',
        table: 'projects',
        data: {},
        timestamp: now + 1000,
        retries: 0,
      };

      expect(item2.timestamp).toBeGreaterThan(item1.timestamp);
    });

    it('should support complex data objects', () => {
      const item: SyncQueueItem = {
        id: 'sync-5',
        operation: 'create',
        table: 'events',
        data: {
          name: 'Concert',
          venue: { name: 'Stadium', capacity: 50000 },
          dates: ['2025-01-15', '2025-01-16'],
          metadata: { genre: 'rock', headliner: 'Band Name' },
        },
        timestamp: Date.now(),
        retries: 0,
      };

      const data = item.data as Record<string, unknown>;
      expect(data.name).toBe('Concert');
      expect((data.venue as Record<string, unknown>).capacity).toBe(50000);
      expect((data.dates as string[]).length).toBe(2);
    });
  });

  describe('Operation types', () => {
    it('should include all operation types', () => {
      const operations: SyncQueueItem['operation'][] = ['create', 'update', 'delete'];
      expect(operations.length).toBe(3);
    });
  });
});
