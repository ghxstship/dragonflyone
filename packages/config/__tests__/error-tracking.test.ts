import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  handleError,
  formatErrorResponse,
  withErrorHandling,
} from '../error-tracking';

// Mock the logger
vi.mock('../logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('error-tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AppError', () => {
    it('should create error with message, code, and status', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 400);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('AppError');
    });

    it('should default to 500 status code', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should include context', () => {
      const context = { userId: 'user-123', action: 'create' };
      const error = new AppError('Test error', 'TEST_ERROR', 400, context);
      expect(error.context).toEqual(context);
    });

    it('should be instance of Error', () => {
      const error = new AppError('Test', 'TEST', 400);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });

    it('should be instance of AppError', () => {
      const error = new ValidationError('Invalid');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('AuthenticationError', () => {
    it('should create auth error with 401 status', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication required');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Token expired');
      expect(error.message).toBe('Token expired');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with 403 status', () => {
      const error = new AuthorizationError();
      expect(error.message).toBe('Insufficient permissions');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });

    it('should accept custom message', () => {
      const error = new AuthorizationError('Admin access required');
      expect(error.message).toBe('Admin access required');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('User');
      expect(error.message).toBe('User not found');
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should format resource name in message', () => {
      const error = new NotFoundError('Project');
      expect(error.message).toBe('Project not found');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with 409 status', () => {
      const error = new ConflictError('Resource already exists');
      expect(error.message).toBe('Resource already exists');
      expect(error.code).toBe('CONFLICT_ERROR');
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with 429 status', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
      expect(error.name).toBe('RateLimitError');
    });

    it('should accept custom message', () => {
      const error = new RateLimitError('Too many requests, try again in 60 seconds');
      expect(error.message).toBe('Too many requests, try again in 60 seconds');
    });
  });

  describe('handleError', () => {
    it('should return AppError as-is', () => {
      const original = new AppError('Test', 'TEST', 400);
      const result = handleError(original);
      expect(result).toBe(original);
    });

    it('should wrap standard Error in AppError', () => {
      const original = new Error('Standard error');
      const result = handleError(original);
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Standard error');
      expect(result.code).toBe('INTERNAL_ERROR');
      expect(result.statusCode).toBe(500);
    });

    it('should handle unknown error types', () => {
      const result = handleError('string error');
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unknown error occurred');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('should include context in wrapped error', () => {
      const context = { userId: 'user-123' };
      const result = handleError(new Error('Test'), context);
      expect(result.context).toEqual(context);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format error for API response', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 400);
      const response = formatErrorResponse(error);
      
      expect(response).toEqual({
        error: {
          message: 'Test error',
          code: 'TEST_ERROR',
          statusCode: 400,
        },
      });
    });

    it('should format validation error', () => {
      const error = new ValidationError('Invalid email');
      const response = formatErrorResponse(error);
      
      expect(response.error.message).toBe('Invalid email');
      expect(response.error.code).toBe('VALIDATION_ERROR');
      expect(response.error.statusCode).toBe(400);
    });
  });

  describe('withErrorHandling', () => {
    it('should return result on success', async () => {
      const result = await withErrorHandling(async () => 'success');
      expect(result).toBe('success');
    });

    it('should throw AppError on failure', async () => {
      await expect(
        withErrorHandling(async () => {
          throw new Error('Failed');
        })
      ).rejects.toBeInstanceOf(AppError);
    });

    it('should preserve AppError type', async () => {
      const original = new ValidationError('Invalid');
      await expect(
        withErrorHandling(async () => {
          throw original;
        })
      ).rejects.toBe(original);
    });

    it('should include context in error', async () => {
      const context = { action: 'create' };
      try {
        await withErrorHandling(async () => {
          throw new Error('Failed');
        }, context);
      } catch (error) {
        expect((error as AppError).context).toEqual(context);
      }
    });
  });
});
