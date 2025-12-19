/* eslint-disable no-console */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logger,
  createRequestLogger,
  logApiCall,
  logDatabaseQuery,
  logAuthEvent,
} from '../logger';

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV;
  
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.clearContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  describe('logger instance', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Test warning message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Test error message');
      expect(console.error).toHaveBeenCalled();
    });

    it('should log error with Error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(console.error).toHaveBeenCalled();
    });

    it('should include context in log messages', () => {
      logger.info('Test message', { userId: 'user-123' });
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        expect.objectContaining({ userId: 'user-123' }),
        undefined
      );
    });
  });

  describe('setContext', () => {
    it('should set context that persists across log calls', () => {
      logger.setContext({ userId: 'user-123' });
      logger.info('First message');
      logger.info('Second message');
      
      expect(console.log).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ userId: 'user-123' }),
        undefined
      );
    });

    it('should merge new context with existing', () => {
      logger.setContext({ userId: 'user-123' });
      logger.setContext({ organizationId: 'org-456' });
      logger.info('Test message');
      
      expect(console.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ userId: 'user-123', organizationId: 'org-456' }),
        undefined
      );
    });
  });

  describe('clearContext', () => {
    it('should clear all context', () => {
      logger.setContext({ userId: 'user-123' });
      logger.clearContext();
      logger.info('Test message');
      
      expect(console.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({ userId: 'user-123' }),
        undefined
      );
    });
  });

  describe('performance', () => {
    it('should log performance metrics', () => {
      logger.performance('database-query', 150);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Performance: database-query'),
        expect.objectContaining({
          operation: 'database-query',
          durationMs: 150,
          performanceMetric: true,
        }),
        undefined
      );
    });
  });

  describe('trackAsync', () => {
    it('should track successful async operations', async () => {
      const result = await logger.trackAsync('test-operation', async () => {
        return 'success';
      });
      
      expect(result).toBe('success');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Performance: test-operation'),
        expect.objectContaining({
          operation: 'test-operation',
          status: 'success',
        }),
        undefined
      );
    });

    it('should track failed async operations', async () => {
      const error = new Error('Operation failed');
      
      await expect(
        logger.trackAsync('failing-operation', async () => {
          throw error;
        })
      ).rejects.toThrow('Operation failed');
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('createRequestLogger', () => {
    it('should create logger with requestId in context', () => {
      const requestLogger = createRequestLogger('req-123');
      requestLogger.info('Request started');
      
      expect(console.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ requestId: 'req-123' }),
        undefined
      );
    });
  });

  describe('logApiCall', () => {
    it('should log API call details', () => {
      logApiCall('GET', '/api/users', 200, 45);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('API Call: GET /api/users'),
        expect.objectContaining({
          method: 'GET',
          endpoint: '/api/users',
          statusCode: 200,
          durationMs: 45,
          apiCall: true,
        }),
        undefined
      );
    });

    it('should include additional context', () => {
      logApiCall('POST', '/api/events', 201, 120, { userId: 'user-123' });
      
      expect(console.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          userId: 'user-123',
          method: 'POST',
        }),
        undefined
      );
    });
  });

  describe('logDatabaseQuery', () => {
    it('should log database query details', () => {
      logDatabaseQuery('SELECT * FROM users', 25, 10);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Database Query'),
        expect.objectContaining({
          query: 'SELECT * FROM users',
          durationMs: 25,
          rowCount: 10,
          databaseQuery: true,
        }),
        undefined
      );
    });

    it('should truncate long queries', () => {
      const longQuery = 'SELECT ' + 'a, '.repeat(100) + 'b FROM table';
      logDatabaseQuery(longQuery, 50);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: expect.stringContaining('...'),
        }),
        undefined
      );
    });
  });

  describe('logAuthEvent', () => {
    it('should log successful auth events as info', () => {
      logAuthEvent('login', 'user-123', true);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Auth: login'),
        expect.objectContaining({
          userId: 'user-123',
          event: 'login',
          authEvent: true,
        }),
        undefined
      );
    });

    it('should log failed auth events as warning', () => {
      logAuthEvent('login', 'user-123', false);
      
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Auth: login'),
        expect.objectContaining({
          userId: 'user-123',
          event: 'login',
          authEvent: true,
        }),
        undefined
      );
    });

    it('should handle missing userId', () => {
      logAuthEvent('logout', undefined, true);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Auth: logout'),
        expect.objectContaining({
          event: 'logout',
        }),
        undefined
      );
    });
  });
});
