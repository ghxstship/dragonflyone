/**
 * Centralized Log Aggregation System
 * Structured logging with support for multiple providers
 */

// =============================================================================
// TYPES
// =============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogProvider = 'console' | 'datadog' | 'logrocket' | 'axiom' | 'sentry';

export interface LogEntry {
  /** Log level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Timestamp */
  timestamp: string;
  /** Service/app name */
  service: string;
  /** Environment */
  environment: string;
  /** Trace ID for distributed tracing */
  traceId?: string;
  /** Span ID */
  spanId?: string;
  /** User ID */
  userId?: string;
  /** Organization ID */
  organizationId?: string;
  /** Request ID */
  requestId?: string;
  /** Additional context */
  context?: Record<string, unknown>;
  /** Error details */
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  /** Performance metrics */
  metrics?: {
    duration?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  /** Tags for filtering */
  tags?: string[];
}

export interface LoggerConfig {
  /** Minimum log level */
  minLevel: LogLevel;
  /** Service name */
  service: string;
  /** Environment */
  environment: string;
  /** Enabled providers */
  providers: LogProvider[];
  /** Provider-specific configuration */
  providerConfig?: {
    datadog?: {
      apiKey: string;
      site?: string;
    };
    logrocket?: {
      appId: string;
    };
    axiom?: {
      apiToken: string;
      dataset: string;
    };
    sentry?: {
      dsn: string;
    };
  };
  /** Whether to include stack traces */
  includeStackTrace?: boolean;
  /** Whether to redact sensitive data */
  redactSensitive?: boolean;
  /** Fields to redact */
  sensitiveFields?: string[];
}

// =============================================================================
// LOG LEVEL PRIORITY
// =============================================================================

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: 'info',
  service: 'ghxstship',
  environment: process.env.NODE_ENV || 'development',
  providers: ['console'],
  includeStackTrace: true,
  redactSensitive: true,
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'apiKey',
    'api_key',
    'authorization',
    'cookie',
    'creditCard',
    'credit_card',
    'ssn',
    'social_security',
  ],
};

// =============================================================================
// LOGGER CLASS
// =============================================================================

export class Logger {
  private config: LoggerConfig;
  private context: Record<string, unknown> = {};
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Set persistent context for all log entries
   */
  setContext(context: Record<string, unknown>): void {
    this.context = { ...this.context, ...context };
  }
  
  /**
   * Clear context
   */
  clearContext(): void {
    this.context = {};
  }
  
  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, unknown>): Logger {
    const childLogger = new Logger(this.config);
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }
  
  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }
  
  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }
  
  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: this.config.includeStackTrace ? error.stack : undefined,
    } : undefined;
    
    this.log('error', message, { ...context, error: errorDetails });
  }
  
  /**
   * Log a fatal error message
   */
  fatal(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: this.config.includeStackTrace ? error.stack : undefined,
    } : undefined;
    
    this.log('fatal', message, { ...context, error: errorDetails });
  }
  
  /**
   * Log with timing
   */
  time(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info(`${label} completed`, { metrics: { duration } });
    };
  }
  
  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    // Check if level meets minimum
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.minLevel]) {
      return;
    }
    
    // Build log entry
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.config.service,
      environment: this.config.environment,
      context: this.redactSensitiveData({ ...this.context, ...context }),
    };
    
    // Send to providers
    for (const provider of this.config.providers) {
      this.sendToProvider(provider, entry);
    }
  }
  
  /**
   * Redact sensitive data from context
   */
  private redactSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
    if (!this.config.redactSensitive) return data;
    
    const redacted: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (this.config.sensitiveFields?.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        redacted[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        redacted[key] = this.redactSensitiveData(value as Record<string, unknown>);
      } else {
        redacted[key] = value;
      }
    }
    
    return redacted;
  }
  
  /**
   * Send log entry to provider
   */
  private sendToProvider(provider: LogProvider, entry: LogEntry): void {
    switch (provider) {
      case 'console':
        this.sendToConsole(entry);
        break;
      case 'datadog':
        this.sendToDatadog(entry);
        break;
      case 'logrocket':
        this.sendToLogRocket(entry);
        break;
      case 'axiom':
        this.sendToAxiom(entry);
        break;
      case 'sentry':
        this.sendToSentry(entry);
        break;
    }
  }
  
  /**
   * Console provider
   */
  private sendToConsole(entry: LogEntry): void {
    const formatted = JSON.stringify(entry, null, 2);
    
    switch (entry.level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(formatted);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
      case 'fatal':
        console.error(formatted);
        break;
    }
  }
  
  /**
   * Datadog provider
   * Uses @datadog/browser-logs SDK when available
   * Install: pnpm add @datadog/browser-logs
   * Initialize: datadogLogs.init({ clientToken: '...', site: 'datadoghq.com', service: 'ghxstship' })
   */
  private sendToDatadog(entry: LogEntry): void {
    if (typeof window !== 'undefined' && (window as unknown as { DD_LOGS?: { logger: { log: (message: string, context: Record<string, unknown>, level: string) => void } } }).DD_LOGS) {
      (window as unknown as { DD_LOGS: { logger: { log: (message: string, context: Record<string, unknown>, level: string) => void } } }).DD_LOGS.logger.log(
        entry.message,
        entry.context || {},
        entry.level
      );
    }
  }
  
  /**
   * LogRocket provider
   * Uses LogRocket SDK when available
   * Install: pnpm add logrocket
   * Initialize: LogRocket.init('your-app-id')
   */
  private sendToLogRocket(entry: LogEntry): void {
    if (typeof window !== 'undefined' && (window as unknown as { LogRocket?: { log: (message: string, context?: Record<string, unknown>) => void; warn: (message: string, context?: Record<string, unknown>) => void; error: (message: string, context?: Record<string, unknown>) => void } }).LogRocket) {
      const lr = (window as unknown as { LogRocket: { log: (message: string, context?: Record<string, unknown>) => void; warn: (message: string, context?: Record<string, unknown>) => void; error: (message: string, context?: Record<string, unknown>) => void } }).LogRocket;
      switch (entry.level) {
        case 'error':
        case 'fatal':
          lr.error(entry.message, entry.context);
          break;
        case 'warn':
          lr.warn(entry.message, entry.context);
          break;
        default:
          lr.log(entry.message, entry.context);
      }
    }
  }
  
  /**
   * Axiom provider
   * Uses Axiom HTTP API for log ingestion
   * Configure via providerConfig.axiom.apiToken and providerConfig.axiom.dataset
   */
  private sendToAxiom(entry: LogEntry): void {
    const axiomConfig = this.config.providerConfig?.axiom;
    if (axiomConfig && typeof fetch !== 'undefined') {
      fetch(`https://api.axiom.co/v1/datasets/${axiomConfig.dataset}/ingest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${axiomConfig.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([entry]),
      }).catch(() => {
        // Silently fail - don't want logging to break the app
      });
    }
  }
  
  /**
   * Sentry provider
   * Uses @sentry/nextjs SDK when available
   * Install: pnpm add @sentry/nextjs
   * Initialize via sentry.client.config.ts and sentry.server.config.ts
   */
  private sendToSentry(entry: LogEntry): void {
    if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureMessage: (message: string, level: string) => void; captureException: (error: Error) => void } }).Sentry) {
      const sentry = (window as unknown as { Sentry: { captureMessage: (message: string, level: string) => void; captureException: (error: Error) => void } }).Sentry;
      if (entry.level === 'error' || entry.level === 'fatal') {
        if (entry.error) {
          sentry.captureException(new Error(entry.error.message));
        } else {
          sentry.captureMessage(entry.message, entry.level);
        }
      }
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let defaultLogger: Logger | null = null;

/**
 * Get the default logger instance
 */
export function getLogger(): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger();
  }
  return defaultLogger;
}

/**
 * Configure the default logger
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  defaultLogger = new Logger(config);
}

/**
 * Create a new logger with specific configuration
 */
export function createLogger(config: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export const log = {
  debug: (message: string, context?: Record<string, unknown>) => getLogger().debug(message, context),
  info: (message: string, context?: Record<string, unknown>) => getLogger().info(message, context),
  warn: (message: string, context?: Record<string, unknown>) => getLogger().warn(message, context),
  error: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => getLogger().error(message, error, context),
  fatal: (message: string, error?: Error | unknown, context?: Record<string, unknown>) => getLogger().fatal(message, error, context),
  time: (label: string) => getLogger().time(label),
};
