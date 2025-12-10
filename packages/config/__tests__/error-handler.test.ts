import { describe, it, expect } from 'vitest';
import {
  AppError,
  handleApiError,
  createErrorResponse,
} from '../error-handler';

describe('error-handler', () => {
  describe('AppError', () => {
    it('should create error with status code and message', () => {
      const error = new AppError(404, 'Not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.isOperational).toBe(true);
    });

    it('should allow setting isOperational to false', () => {
      const error = new AppError(500, 'Server error', false);
      expect(error.isOperational).toBe(false);
    });

    it('should be instance of Error', () => {
      const error = new AppError(400, 'Bad request');
      expect(error).toBeInstanceOf(Error);
    });

    it('should be instance of AppError', () => {
      const error = new AppError(400, 'Bad request');
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('handleApiError', () => {
    it('should handle AppError', () => {
      const error = new AppError(404, 'Resource not found');
      const result = handleApiError(error);
      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('Resource not found');
    });

    it('should handle standard Error', () => {
      const error = new Error('Something went wrong');
      const result = handleApiError(error);
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Something went wrong');
    });

    it('should handle Error with empty message', () => {
      const error = new Error('');
      const result = handleApiError(error);
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Internal server error');
    });

    it('should handle unknown error types', () => {
      const result = handleApiError('string error');
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('An unexpected error occurred');
    });

    it('should handle null error', () => {
      const result = handleApiError(null);
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('An unexpected error occurred');
    });

    it('should handle undefined error', () => {
      const result = handleApiError(undefined);
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('An unexpected error occurred');
    });

    it('should handle object error', () => {
      const result = handleApiError({ code: 'ERR' });
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('An unexpected error occurred');
    });
  });

  describe('createErrorResponse', () => {
    it('should create response with status code and message', async () => {
      const response = createErrorResponse(400, 'Bad request');
      expect(response.status).toBe(400);
      
      const body = await response.json();
      expect(body.error).toBe('Bad request');
    });

    it('should create 404 response', async () => {
      const response = createErrorResponse(404, 'Not found');
      expect(response.status).toBe(404);
      
      const body = await response.json();
      expect(body.error).toBe('Not found');
    });

    it('should create 500 response', async () => {
      const response = createErrorResponse(500, 'Internal server error');
      expect(response.status).toBe(500);
      
      const body = await response.json();
      expect(body.error).toBe('Internal server error');
    });
  });
});
