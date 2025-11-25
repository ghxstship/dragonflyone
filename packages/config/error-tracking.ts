import { logger } from './logger';

export interface ErrorContext {
  userId?: string;
  organizationId?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'VALIDATION_ERROR', 400, context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: ErrorContext) {
    super(message, 'AUTHENTICATION_ERROR', 401, context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: ErrorContext) {
    super(message, 'AUTHORIZATION_ERROR', 403, context);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: ErrorContext) {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404, context);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, 'CONFLICT_ERROR', 409, context);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: ErrorContext) {
    super(message, 'RATE_LIMIT_ERROR', 429, context);
    this.name = 'RateLimitError';
  }
}

export function handleError(error: unknown, context?: ErrorContext): AppError {
  if (error instanceof AppError) {
    logger.error(error.message, error, { ...error.context, ...context });
    return error;
  }

  if (error instanceof Error) {
    const appError = new AppError(
      error.message,
      'INTERNAL_ERROR',
      500,
      context
    );
    logger.error(error.message, error, context);
    return appError;
  }

  const unknownError = new AppError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    context
  );
  logger.error('Unknown error', new Error(String(error)), context);
  return unknownError;
}

export function formatErrorResponse(error: AppError): {
  error: {
    message: string;
    code: string;
    statusCode: number;
  };
} {
  return {
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    },
  };
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw handleError(error, context);
  }
}

export function initErrorTracking(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logger.error('Uncaught error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', event.reason, {
        promise: String(event.promise),
      });
    });
  }

  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection', reason as Error);
    });
  }
}
