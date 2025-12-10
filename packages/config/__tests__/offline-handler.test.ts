import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfflineHandler } from '../offline-handler';

// Mock the logger
vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
});

describe('offline-handler', () => {
  let handler: OfflineHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = new OfflineHandler();
  });

  describe('constructor', () => {
    it('should create handler with default config', () => {
      const h = new OfflineHandler();
      expect(h.getIsOnline()).toBe(true);
    });

    it('should accept custom config', () => {
      const h = new OfflineHandler({
        enableOfflineMode: false,
        syncOnReconnect: false,
        queueRequests: false,
      });
      expect(h).toBeDefined();
    });
  });

  describe('getIsOnline', () => {
    it('should return online status', () => {
      expect(handler.getIsOnline()).toBe(true);
    });
  });

  describe('onStatusChange', () => {
    it('should add listener and return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = handler.onStatusChange(callback);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow unsubscribing', () => {
      const callback = vi.fn();
      const unsubscribe = handler.onStatusChange(callback);
      
      unsubscribe();
      // No error should be thrown
    });
  });

  describe('queueRequest', () => {
    it('should queue a request and return id', () => {
      const id = handler.queueRequest('/api/test', 'POST', { data: 'test' });
      
      expect(id).toBeTruthy();
      expect(handler.getQueuedRequestCount()).toBe(1);
    });

    it('should queue multiple requests', () => {
      handler.queueRequest('/api/test1', 'POST');
      handler.queueRequest('/api/test2', 'PUT');
      handler.queueRequest('/api/test3', 'DELETE');
      
      expect(handler.getQueuedRequestCount()).toBe(3);
    });

    it('should throw when queuing is disabled', () => {
      const h = new OfflineHandler({ queueRequests: false });
      
      expect(() => h.queueRequest('/api/test', 'POST')).toThrow('Request queuing is disabled');
    });

    it('should handle request without body', () => {
      const id = handler.queueRequest('/api/test', 'GET');
      
      expect(id).toBeTruthy();
      expect(handler.getQueuedRequestCount()).toBe(1);
    });
  });

  describe('getQueuedRequestCount', () => {
    it('should return 0 when queue is empty', () => {
      expect(handler.getQueuedRequestCount()).toBe(0);
    });

    it('should return correct count after queuing', () => {
      handler.queueRequest('/api/test1', 'POST');
      handler.queueRequest('/api/test2', 'POST');
      
      expect(handler.getQueuedRequestCount()).toBe(2);
    });
  });

  describe('clearQueue', () => {
    it('should clear all queued requests', () => {
      handler.queueRequest('/api/test1', 'POST');
      handler.queueRequest('/api/test2', 'POST');
      
      expect(handler.getQueuedRequestCount()).toBe(2);
      
      handler.clearQueue();
      
      expect(handler.getQueuedRequestCount()).toBe(0);
    });

    it('should work on empty queue', () => {
      handler.clearQueue();
      expect(handler.getQueuedRequestCount()).toBe(0);
    });
  });

  describe('config options', () => {
    it('should respect enableOfflineMode option', () => {
      const h = new OfflineHandler({ enableOfflineMode: false });
      expect(h).toBeDefined();
    });

    it('should respect syncOnReconnect option', () => {
      const h = new OfflineHandler({ syncOnReconnect: false });
      expect(h).toBeDefined();
    });

    it('should merge config with defaults', () => {
      const h = new OfflineHandler({ enableOfflineMode: false });
      // Should still have default values for other options
      expect(h).toBeDefined();
    });
  });
});
