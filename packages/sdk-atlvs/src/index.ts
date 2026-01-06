/**
 * ATLVS SDK
 * TypeScript SDK for the ATLVS Business Operations Platform API
 * 
 * @version 1.0.0
 * @see https://developers.ghxstship.com
 */

export const SDK_VERSION = '1.0.0';

// =============================================================================
// TYPES
// =============================================================================

export interface AtlvsConfig {
  /** Base URL for the API (defaults to production) */
  baseUrl?: string;
  /** API key for authentication */
  apiKey?: string;
  /** Bearer token for authentication */
  bearerToken?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
}

export interface PaginationParams {
  /** Maximum number of items to return (max 100) */
  limit?: number;
  /** Pagination cursor from previous response */
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
    total: number;
  };
}

// Deal Types
export type DealStatus = 'open' | 'won' | 'lost';
export type DealStage = 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  stage: DealStage;
  status: DealStatus;
  owner_id: string;
  organization_id: string;
  contact_ids: string[];
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface DealCreateInput {
  name: string;
  value: number;
  currency?: string;
  stage?: DealStage;
  owner_id?: string;
  contact_ids?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface DealUpdateInput {
  name?: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  owner_id?: string;
  contact_ids?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface DealListParams extends PaginationParams {
  status?: DealStatus | 'all';
}

// Webhook Types
export type WebhookEvent = 
  | 'deal.created'
  | 'deal.updated'
  | 'deal.won'
  | 'deal.lost'
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'asset.created'
  | 'asset.updated'
  | 'asset.deleted';

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  secret?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookCreateInput {
  url: string;
  events: WebhookEvent[];
  secret?: string;
}

// Asset Types
export interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  location: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  organization_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AssetCreateInput {
  name: string;
  type: string;
  status?: Asset['status'];
  location?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  metadata?: Record<string, unknown>;
}

export interface AssetUpdateInput {
  name?: string;
  type?: string;
  status?: Asset['status'];
  location?: string;
  serial_number?: string;
  metadata?: Record<string, unknown>;
}

// Error Types
export class AtlvsError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AtlvsError';
  }
}

export class AtlvsValidationError extends AtlvsError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'AtlvsValidationError';
  }
}

export class AtlvsAuthenticationError extends AtlvsError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AtlvsAuthenticationError';
  }
}

export class AtlvsNotFoundError extends AtlvsError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 404, 'NOT_FOUND');
    this.name = 'AtlvsNotFoundError';
  }
}

export class AtlvsRateLimitError extends AtlvsError {
  constructor(public readonly retryAfter: number) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds`, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'AtlvsRateLimitError';
  }
}

// =============================================================================
// HTTP CLIENT
// =============================================================================

const DEFAULT_BASE_URL = 'https://api.ghxstship.com/atlvs/v1';
const DEFAULT_TIMEOUT = 30000;

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

class HttpClient {
  private baseUrl: string;
  private apiKey?: string;
  private bearerToken?: string;
  private timeout: number;
  private fetchFn: typeof fetch;

  constructor(config: AtlvsConfig) {
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
    this.apiKey = config.apiKey;
    this.bearerToken = config.bearerToken;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.fetchFn = config.fetch || globalThis.fetch;

    if (!this.apiKey && !this.bearerToken) {
      throw new AtlvsAuthenticationError('Either apiKey or bearerToken must be provided');
    }
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const url = new URL(options.path, this.baseUrl);
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': `atlvs-sdk/${SDK_VERSION}`,
    };

    if (this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    } else if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this.fetchFn(url.toString(), {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof AtlvsError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AtlvsError('Request timeout', 408, 'TIMEOUT');
      }
      
      throw new AtlvsError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'NETWORK_ERROR'
      );
    }
  }

  private async handleError(response: Response): Promise<never> {
    let errorData: { message?: string; code?: string; details?: Record<string, unknown> } = {};
    
    try {
      errorData = await response.json();
    } catch {
      // Response body is not JSON
    }

    const message = errorData.message || response.statusText;

    switch (response.status) {
      case 400:
        throw new AtlvsValidationError(message, errorData.details);
      case 401:
        throw new AtlvsAuthenticationError(message);
      case 404:
        throw new AtlvsError(message, 404, 'NOT_FOUND');
      case 429:
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
        throw new AtlvsRateLimitError(retryAfter);
      default:
        throw new AtlvsError(message, response.status, errorData.code || 'API_ERROR', errorData.details);
    }
  }
}

// =============================================================================
// RESOURCE CLIENTS
// =============================================================================

class DealsClient {
  constructor(private http: HttpClient) {}

  /**
   * List deals with pagination and filtering
   */
  async list(params: DealListParams = {}): Promise<PaginatedResponse<Deal>> {
    return this.http.request({
      method: 'GET',
      path: '/deals',
      params: {
        limit: params.limit,
        cursor: params.cursor,
        status: params.status,
      },
    });
  }

  /**
   * Get a single deal by ID
   */
  async get(id: string): Promise<Deal> {
    return this.http.request({
      method: 'GET',
      path: `/deals/${encodeURIComponent(id)}`,
    });
  }

  /**
   * Create a new deal
   */
  async create(input: DealCreateInput): Promise<Deal> {
    return this.http.request({
      method: 'POST',
      path: '/deals',
      body: input,
    });
  }

  /**
   * Update an existing deal
   */
  async update(id: string, input: DealUpdateInput): Promise<Deal> {
    return this.http.request({
      method: 'PATCH',
      path: `/deals/${encodeURIComponent(id)}`,
      body: input,
    });
  }

  /**
   * Delete a deal
   */
  async delete(id: string): Promise<void> {
    return this.http.request({
      method: 'DELETE',
      path: `/deals/${encodeURIComponent(id)}`,
    });
  }

  /**
   * Iterate through all deals with automatic pagination
   */
  async *listAll(params: Omit<DealListParams, 'cursor'> = {}): AsyncGenerator<Deal> {
    let cursor: string | undefined;
    
    do {
      const response = await this.list({ ...params, cursor });
      
      for (const deal of response.data) {
        yield deal;
      }
      
      cursor = response.pagination.hasMore ? response.pagination.cursor || undefined : undefined;
    } while (cursor);
  }
}

class WebhooksClient {
  constructor(private http: HttpClient) {}

  /**
   * List all webhook subscriptions
   */
  async list(): Promise<{ data: Webhook[] }> {
    return this.http.request({
      method: 'GET',
      path: '/webhooks',
    });
  }

  /**
   * Get a single webhook by ID
   */
  async get(id: string): Promise<Webhook> {
    return this.http.request({
      method: 'GET',
      path: `/webhooks/${encodeURIComponent(id)}`,
    });
  }

  /**
   * Create a new webhook subscription
   */
  async create(input: WebhookCreateInput): Promise<Webhook> {
    return this.http.request({
      method: 'POST',
      path: '/webhooks',
      body: input,
    });
  }

  /**
   * Delete a webhook subscription
   */
  async delete(id: string): Promise<void> {
    return this.http.request({
      method: 'DELETE',
      path: `/webhooks/${encodeURIComponent(id)}`,
    });
  }

  /**
   * Verify a webhook signature (async, works in both browser and Node.js)
   * 
   * @param payload - The raw webhook payload string
   * @param signature - The signature from the webhook header (format: sha256=...)
   * @param secret - Your webhook secret
   * @returns Promise<boolean> - Whether the signature is valid
   */
  async verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
    // Use Web Crypto API (works in both browser and modern Node.js)
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const key = await globalThis.crypto.subtle.importKey(
          'raw',
          encoder.encode(secret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signatureBuffer = await globalThis.crypto.subtle.sign(
          'HMAC',
          key,
          encoder.encode(payload)
        );
        const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        // Constant-time comparison to prevent timing attacks
        const expected = `sha256=${expectedSignature}`;
        if (signature.length !== expected.length) {
          return false;
        }
        let result = 0;
        for (let i = 0; i < signature.length; i++) {
          result |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
        }
        return result === 0;
      } catch {
        return false;
      }
    }
    
    // Fallback for older environments - use Node.js crypto via dynamic import
    try {
      const crypto = await import('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      const expected = `sha256=${expectedSignature}`;
      
      // Constant-time comparison to prevent timing attacks
      if (signature.length !== expected.length) {
        return false;
      }
      let result = 0;
      for (let i = 0; i < signature.length; i++) {
        result |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
      }
      return result === 0;
    } catch {
      return false;
    }
  }
}

class AssetsClient {
  constructor(private http: HttpClient) {}

  /**
   * List assets with pagination
   */
  async list(params: PaginationParams = {}): Promise<PaginatedResponse<Asset>> {
    return this.http.request({
      method: 'GET',
      path: '/assets',
      params: {
        limit: params.limit,
        cursor: params.cursor,
      },
    });
  }

  /**
   * Get a single asset by ID
   */
  async get(id: string): Promise<Asset> {
    return this.http.request({
      method: 'GET',
      path: `/assets/${encodeURIComponent(id)}`,
    });
  }

  /**
   * Create a new asset
   */
  async create(input: AssetCreateInput): Promise<Asset> {
    return this.http.request({
      method: 'POST',
      path: '/assets',
      body: input,
    });
  }

  /**
   * Update an existing asset
   */
  async update(id: string, input: AssetUpdateInput): Promise<Asset> {
    return this.http.request({
      method: 'PATCH',
      path: `/assets/${encodeURIComponent(id)}`,
      body: input,
    });
  }

  /**
   * Delete an asset
   */
  async delete(id: string): Promise<void> {
    return this.http.request({
      method: 'DELETE',
      path: `/assets/${encodeURIComponent(id)}`,
    });
  }
}

// =============================================================================
// MAIN CLIENT
// =============================================================================

export interface AtlvsClient {
  /** Deal management operations */
  deals: DealsClient;
  /** Webhook subscription management */
  webhooks: WebhooksClient;
  /** Asset management operations */
  assets: AssetsClient;
}

/**
 * Create an ATLVS API client
 * 
 * @example
 * ```typescript
 * const atlvs = createAtlvsClient({
 *   apiKey: process.env.ATLVS_API_KEY,
 * });
 * 
 * // List deals
 * const { data: deals } = await atlvs.deals.list({ status: 'open' });
 * 
 * // Create a deal
 * const deal = await atlvs.deals.create({
 *   name: 'Enterprise Contract',
 *   value: 150000,
 *   currency: 'USD',
 * });
 * 
 * // Iterate through all deals
 * for await (const deal of atlvs.deals.listAll()) {
 *   console.log(deal.name);
 * }
 * ```
 */
export function createAtlvsClient(config: AtlvsConfig): AtlvsClient {
  const http = new HttpClient(config);
  
  return {
    deals: new DealsClient(http),
    webhooks: new WebhooksClient(http),
    assets: new AssetsClient(http),
  };
}

// Re-export for convenience
export type { AtlvsClient as Client };
