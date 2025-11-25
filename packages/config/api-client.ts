import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';
import { logger } from './logger';
import { handleError, AppError } from './error-tracking';

export interface ApiClientConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

const DEFAULT_CONFIG: ApiClientConfig = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

export class ApiClient {
  private config: ApiClientConfig;
  private supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>, config?: ApiClientConfig) {
    this.supabase = supabase;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session?.access_token || null;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestConfig
  ): Promise<Response> {
    const timeout = options.timeout || this.config.timeout!;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new AppError('Request timeout', 'TIMEOUT_ERROR', 408);
      }
      throw error;
    }
  }

  private async fetchWithRetry(
    url: string,
    options: RequestConfig,
    retries: number = this.config.retries!
  ): Promise<Response> {
    try {
      return await this.fetchWithTimeout(url, options);
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(this.config.retryDelay!);
        logger.warn(`Retrying request to ${url}, ${retries} attempts remaining`);
        return this.fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.statusCode >= 500 || error.statusCode === 408;
    }
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request<T = unknown>(
    url: string,
    config?: RequestConfig
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const headers = new Headers(config?.headers);
      headers.set('Content-Type', 'application/json');

      if (!config?.skipAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }

      const response = await this.fetchWithRetry(url, {
        ...config,
        headers,
      });

      const duration = performance.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error(`API request failed: ${config?.method || 'GET'} ${url}`, undefined, {
          statusCode: response.status,
          statusText: response.statusText,
          errorData,
          durationMs: duration,
        });

        throw new AppError(
          errorData.message || response.statusText,
          errorData.code || 'API_ERROR',
          response.status
        );
      }

      logger.debug(`API request success: ${config?.method || 'GET'} ${url}`, {
        statusCode: response.status,
        durationMs: duration,
      });

      const data = await response.json();
      return data as T;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error(`API request error: ${config?.method || 'GET'} ${url}`, error as Error, {
        durationMs: duration,
      });
      throw handleError(error, { url, method: config?.method });
    }
  }

  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

export function createApiClient(
  supabase: SupabaseClient<Database>,
  config?: ApiClientConfig
): ApiClient {
  return new ApiClient(supabase, config);
}
