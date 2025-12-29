/**
 * Rate Limiting Enforcement
 * Per-user and per-endpoint rate limiting with headers
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// TYPES
// =============================================================================

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Whether to include rate limit headers in response */
  includeHeaders: boolean;
  /** Key generator function */
  keyGenerator?: (request: NextRequest) => string;
  /** Skip function - return true to skip rate limiting */
  skip?: (request: NextRequest) => boolean;
  /** Handler for rate limit exceeded */
  onLimitExceeded?: (request: NextRequest, limit: RateLimitInfo) => NextResponse | void;
}

export interface RateLimitInfo {
  /** Total limit */
  limit: number;
  /** Remaining requests */
  remaining: number;
  /** Reset timestamp (Unix milliseconds) */
  reset: number;
  /** Whether limit is exceeded */
  exceeded: boolean;
}

export interface RateLimitResult {
  /** Whether request is allowed */
  allowed: boolean;
  /** Rate limit info */
  info: RateLimitInfo;
  /** Response (if blocked) */
  response?: NextResponse;
}

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

export const RATE_LIMIT_PRESETS: Record<string, RateLimitConfig> = {
  // Standard API endpoints
  standard: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
    includeHeaders: true,
  },
  
  // Authentication endpoints (stricter)
  auth: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
    includeHeaders: true,
  },
  
  // Search endpoints
  search: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
    includeHeaders: true,
  },
  
  // AI/ML endpoints (expensive)
  ai: {
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
    includeHeaders: true,
  },
  
  // File upload endpoints
  upload: {
    limit: 20,
    windowMs: 60 * 1000, // 1 minute
    includeHeaders: true,
  },
  
  // Webhook endpoints
  webhook: {
    limit: 1000,
    windowMs: 60 * 1000, // 1 minute
    includeHeaders: true,
  },
  
  // Public endpoints (generous)
  public: {
    limit: 200,
    windowMs: 60 * 1000, // 1 minute
    includeHeaders: true,
  },
};

// =============================================================================
// IN-MEMORY STORE (for development/single instance)
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  Array.from(memoryStore.entries()).forEach(([key, entry]) => {
    if (entry.resetAt <= now) {
      memoryStore.delete(key);
    }
  });
}

// Cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 60 * 1000);
}

// =============================================================================
// RATE LIMIT STORE INTERFACE
// =============================================================================

export interface RateLimitStore {
  /** Increment the counter for a key */
  increment(key: string, windowMs: number): Promise<RateLimitEntry>;
  /** Get current count for a key */
  get(key: string): Promise<RateLimitEntry | null>;
  /** Reset a key */
  reset(key: string): Promise<void>;
}

/**
 * In-memory rate limit store
 */
export const memoryRateLimitStore: RateLimitStore = {
  async increment(key: string, windowMs: number): Promise<RateLimitEntry> {
    const now = Date.now();
    const existing = memoryStore.get(key);
    
    if (existing && existing.resetAt > now) {
      existing.count++;
      return existing;
    }
    
    const entry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, entry);
    return entry;
  },
  
  async get(key: string): Promise<RateLimitEntry | null> {
    const entry = memoryStore.get(key);
    if (!entry || entry.resetAt <= Date.now()) {
      return null;
    }
    return entry;
  },
  
  async reset(key: string): Promise<void> {
    memoryStore.delete(key);
  },
};

// =============================================================================
// KEY GENERATORS
// =============================================================================

/**
 * Generate rate limit key from IP address
 */
export function ipKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';
  return `ip:${ip}`;
}

/**
 * Generate rate limit key from user ID
 */
export function userKeyGenerator(request: NextRequest): string {
  // Try to get user ID from various sources
  const authHeader = request.headers.get('authorization');
  const userId = request.headers.get('x-user-id');
  
  if (userId) {
    return `user:${userId}`;
  }
  
  if (authHeader) {
    // Hash the auth header for privacy
    const hash = simpleHash(authHeader);
    return `auth:${hash}`;
  }
  
  // Fall back to IP
  return ipKeyGenerator(request);
}

/**
 * Generate rate limit key from endpoint
 */
export function endpointKeyGenerator(request: NextRequest): string {
  const path = request.nextUrl.pathname;
  const method = request.method;
  const ip = ipKeyGenerator(request);
  return `${method}:${path}:${ip}`;
}

/**
 * Simple hash function for strings
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// =============================================================================
// RATE LIMITER
// =============================================================================

export class RateLimiter {
  private config: RateLimitConfig;
  private store: RateLimitStore;
  
  constructor(
    config: Partial<RateLimitConfig> = {},
    store: RateLimitStore = memoryRateLimitStore
  ) {
    this.config = {
      ...RATE_LIMIT_PRESETS.standard,
      ...config,
    };
    this.store = store;
  }
  
  /**
   * Check rate limit for a request
   */
  async check(request: NextRequest): Promise<RateLimitResult> {
    // Check if should skip
    if (this.config.skip?.(request)) {
      return {
        allowed: true,
        info: {
          limit: this.config.limit,
          remaining: this.config.limit,
          reset: Date.now() + this.config.windowMs,
          exceeded: false,
        },
      };
    }
    
    // Generate key
    const key = this.config.keyGenerator?.(request) || ipKeyGenerator(request);
    
    // Increment counter
    const entry = await this.store.increment(key, this.config.windowMs);
    
    // Calculate info
    const info: RateLimitInfo = {
      limit: this.config.limit,
      remaining: Math.max(0, this.config.limit - entry.count),
      reset: entry.resetAt,
      exceeded: entry.count > this.config.limit,
    };
    
    // Check if exceeded
    if (info.exceeded) {
      const response = this.config.onLimitExceeded?.(request, info) || 
        this.createRateLimitResponse(info);
      
      return {
        allowed: false,
        info,
        response,
      };
    }
    
    return {
      allowed: true,
      info,
    };
  }
  
  /**
   * Create rate limit exceeded response
   */
  private createRateLimitResponse(info: RateLimitInfo): NextResponse {
    const retryAfter = Math.ceil((info.reset - Date.now()) / 1000);
    
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
      },
      {
        status: 429,
        headers: this.getRateLimitHeaders(info),
      }
    );
  }
  
  /**
   * Get rate limit headers
   */
  getRateLimitHeaders(info: RateLimitInfo): Record<string, string> {
    if (!this.config.includeHeaders) {
      return {};
    }
    
    return {
      'X-RateLimit-Limit': info.limit.toString(),
      'X-RateLimit-Remaining': info.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(info.reset / 1000).toString(),
      'Retry-After': Math.ceil((info.reset - Date.now()) / 1000).toString(),
    };
  }
  
  /**
   * Add rate limit headers to response
   */
  addHeaders(response: NextResponse, info: RateLimitInfo): NextResponse {
    const headers = this.getRateLimitHeaders(info);
    
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }
    
    return response;
  }
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

/**
 * Create rate limiting middleware
 */
export function withRateLimit(
  config: Partial<RateLimitConfig> = {},
  store?: RateLimitStore
) {
  const limiter = new RateLimiter(config, store);
  
  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const result = await limiter.check(request);
    
    if (!result.allowed) {
      return result.response!;
    }
    
    const response = await handler(request);
    return limiter.addHeaders(response, result.info);
  };
}

/**
 * Rate limit handler wrapper for API routes
 */
export function rateLimited(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: Partial<RateLimitConfig> = {}
) {
  const limiter = new RateLimiter(config);
  
  return async function(request: NextRequest): Promise<NextResponse> {
    const result = await limiter.check(request);
    
    if (!result.allowed) {
      return result.response!;
    }
    
    const response = await handler(request);
    return limiter.addHeaders(response, result.info);
  };
}

// =============================================================================
// ENDPOINT-SPECIFIC RATE LIMITERS
// =============================================================================

/**
 * Get rate limiter for endpoint type
 */
export function getRateLimiterForEndpoint(
  endpoint: string,
  store?: RateLimitStore
): RateLimiter {
  // Determine preset based on endpoint
  let preset = RATE_LIMIT_PRESETS.standard;
  
  if (endpoint.includes('/auth/') || endpoint.includes('/login') || endpoint.includes('/signup')) {
    preset = RATE_LIMIT_PRESETS.auth;
  } else if (endpoint.includes('/search')) {
    preset = RATE_LIMIT_PRESETS.search;
  } else if (endpoint.includes('/ai/') || endpoint.includes('/generate')) {
    preset = RATE_LIMIT_PRESETS.ai;
  } else if (endpoint.includes('/upload') || endpoint.includes('/import')) {
    preset = RATE_LIMIT_PRESETS.upload;
  } else if (endpoint.includes('/webhook')) {
    preset = RATE_LIMIT_PRESETS.webhook;
  } else if (endpoint.includes('/public/')) {
    preset = RATE_LIMIT_PRESETS.public;
  }
  
  return new RateLimiter(preset, store);
}

// =============================================================================
// EXPORTS
// =============================================================================

export const rateLimiters = {
  standard: new RateLimiter(RATE_LIMIT_PRESETS.standard),
  auth: new RateLimiter(RATE_LIMIT_PRESETS.auth),
  search: new RateLimiter(RATE_LIMIT_PRESETS.search),
  ai: new RateLimiter(RATE_LIMIT_PRESETS.ai),
  upload: new RateLimiter(RATE_LIMIT_PRESETS.upload),
  webhook: new RateLimiter(RATE_LIMIT_PRESETS.webhook),
  public: new RateLimiter(RATE_LIMIT_PRESETS.public),
};
