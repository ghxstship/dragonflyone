import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger, createLogger, getLogger, configureLogger, log } from '../logging';

describe('logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Logger class', () => {
    describe('constructor', () => {
      it('should create logger with default config', () => {
        const logger = new Logger();
        expect(logger).toBeDefined();
      });

      it('should accept custom config', () => {
        const logger = new Logger({
          minLevel: 'warn',
          service: 'test-service',
        });
        expect(logger).toBeDefined();
      });
    });

    describe('log levels', () => {
      it('should log debug messages', () => {
        const logger = new Logger({ minLevel: 'debug' });
        logger.debug('Debug message');
        expect(console.debug).toHaveBeenCalled();
      });

      it('should log info messages', () => {
        const logger = new Logger({ minLevel: 'info' });
        logger.info('Info message');
        expect(console.info).toHaveBeenCalled();
      });

      it('should log warn messages', () => {
        const logger = new Logger({ minLevel: 'warn' });
        logger.warn('Warning message');
        expect(console.warn).toHaveBeenCalled();
      });

      it('should log error messages', () => {
        const logger = new Logger({ minLevel: 'error' });
        logger.error('Error message');
        expect(console.error).toHaveBeenCalled();
      });

      it('should log fatal messages', () => {
        const logger = new Logger({ minLevel: 'fatal' });
        logger.fatal('Fatal message');
        expect(console.error).toHaveBeenCalled();
      });

      it('should respect minimum log level', () => {
        const logger = new Logger({ minLevel: 'warn' });
        logger.debug('Debug message');
        logger.info('Info message');
        expect(console.debug).not.toHaveBeenCalled();
        expect(console.info).not.toHaveBeenCalled();
      });
    });

    describe('context', () => {
      it('should set context', () => {
        const logger = new Logger({ minLevel: 'debug' });
        logger.setContext({ userId: 'user-1' });
        logger.debug('Test message');
        expect(console.debug).toHaveBeenCalled();
      });

      it('should clear context', () => {
        const logger = new Logger({ minLevel: 'debug' });
        logger.setContext({ userId: 'user-1' });
        logger.clearContext();
        logger.debug('Test message');
        expect(console.debug).toHaveBeenCalled();
      });

      it('should merge context on set', () => {
        const logger = new Logger({ minLevel: 'debug' });
        logger.setContext({ userId: 'user-1' });
        logger.setContext({ orgId: 'org-1' });
        logger.debug('Test message');
        expect(console.debug).toHaveBeenCalled();
      });
    });

    describe('child logger', () => {
      it('should create child logger with inherited context', () => {
        const logger = new Logger({ minLevel: 'debug' });
        logger.setContext({ userId: 'user-1' });
        const childLogger = logger.child({ requestId: 'req-1' });
        expect(childLogger).toBeDefined();
        childLogger.debug('Child message');
        expect(console.debug).toHaveBeenCalled();
      });
    });

    describe('error logging', () => {
      it('should log error with Error object', () => {
        const logger = new Logger({ minLevel: 'error' });
        const error = new Error('Test error');
        logger.error('Error occurred', error);
        expect(console.error).toHaveBeenCalled();
      });

      it('should log error without Error object', () => {
        const logger = new Logger({ minLevel: 'error' });
        logger.error('Error occurred');
        expect(console.error).toHaveBeenCalled();
      });

      it('should log error with context', () => {
        const logger = new Logger({ minLevel: 'error' });
        logger.error('Error occurred', new Error('Test'), { extra: 'data' });
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe('sensitive data redaction', () => {
      it('should redact sensitive fields', () => {
        const logger = new Logger({ minLevel: 'debug', redactSensitive: true });
        logger.debug('Test', { password: 'secret123' });
        const call = (console.debug as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(call).toContain('[REDACTED]');
        expect(call).not.toContain('secret123');
      });

      it('should not redact when disabled', () => {
        const logger = new Logger({ minLevel: 'debug', redactSensitive: false });
        logger.debug('Test', { password: 'secret123' });
        const call = (console.debug as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(call).toContain('secret123');
      });

      it('should redact nested sensitive fields', () => {
        const logger = new Logger({ minLevel: 'debug', redactSensitive: true });
        logger.debug('Test', { user: { apiKey: 'key123' } });
        const call = (console.debug as ReturnType<typeof vi.fn>).mock.calls[0][0];
        expect(call).toContain('[REDACTED]');
        expect(call).not.toContain('key123');
      });
    });

    describe('timing', () => {
      it('should create timing function', () => {
        const logger = new Logger({ minLevel: 'info' });
        const endTimer = logger.time('operation');
        expect(typeof endTimer).toBe('function');
      });

      it('should log duration when timer ends', () => {
        const logger = new Logger({ minLevel: 'info' });
        const endTimer = logger.time('operation');
        endTimer();
        expect(console.info).toHaveBeenCalled();
      });
    });
  });

  describe('createLogger', () => {
    it('should create new logger instance', () => {
      const logger = createLogger({ service: 'test' });
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('getLogger', () => {
    it('should return default logger', () => {
      const logger = getLogger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should return same instance on multiple calls', () => {
      const logger1 = getLogger();
      const logger2 = getLogger();
      expect(logger1).toBe(logger2);
    });
  });

  describe('configureLogger', () => {
    it('should configure default logger', () => {
      configureLogger({ minLevel: 'warn' });
      const logger = getLogger();
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('log convenience object', () => {
    it('should have debug method', () => {
      expect(typeof log.debug).toBe('function');
    });

    it('should have info method', () => {
      expect(typeof log.info).toBe('function');
    });

    it('should have warn method', () => {
      expect(typeof log.warn).toBe('function');
    });

    it('should have error method', () => {
      expect(typeof log.error).toBe('function');
    });

    it('should have fatal method', () => {
      expect(typeof log.fatal).toBe('function');
    });

    it('should have time method', () => {
      expect(typeof log.time).toBe('function');
    });
  });
});
