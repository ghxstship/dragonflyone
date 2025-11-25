type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  organizationId?: string;
  requestId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private context: LogContext = {};

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  private log(level: LogLevel, message: string, error?: Error, additionalContext?: LogContext): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...additionalContext },
      ...(error && { error }),
    };

    const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    
    if (process.env.NODE_ENV === 'production') {
      logMethod(JSON.stringify(entry));
      
      if (level === 'error' && typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error || new Error(message), {
          contexts: { custom: entry.context },
        });
      }
    } else {
      logMethod(`[${level.toUpperCase()}] ${message}`, entry.context, error);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, undefined, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, undefined, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, undefined, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, error, context);
  }

  performance(operation: string, durationMs: number, context?: LogContext): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      operation,
      durationMs,
      performanceMetric: true,
    });
  }

  async trackAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.performance(operation, duration, { ...context, status: 'success' });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${operation} failed`, error as Error, { ...context, durationMs: duration });
      throw error;
    }
  }
}

export const logger = new Logger();

export function createRequestLogger(requestId: string): Logger {
  const requestLogger = new Logger();
  requestLogger.setContext({ requestId });
  return requestLogger;
}

export function logApiCall(
  method: string,
  endpoint: string,
  statusCode: number,
  durationMs: number,
  context?: LogContext
): void {
  logger.info(`API Call: ${method} ${endpoint}`, {
    ...context,
    method,
    endpoint,
    statusCode,
    durationMs,
    apiCall: true,
  });
}

export function logDatabaseQuery(
  query: string,
  durationMs: number,
  rowCount?: number,
  context?: LogContext
): void {
  logger.debug('Database Query', {
    ...context,
    query: query.length > 100 ? `${query.substring(0, 100)}...` : query,
    durationMs,
    rowCount,
    databaseQuery: true,
  });
}

export function logAuthEvent(
  event: string,
  userId?: string,
  success: boolean = true,
  context?: LogContext
): void {
  const level = success ? 'info' : 'warn';
  const message = `Auth: ${event}`;
  
  if (success) {
    logger.info(message, { ...context, userId, event, authEvent: true });
  } else {
    logger.warn(message, { ...context, userId, event, authEvent: true });
  }
}
