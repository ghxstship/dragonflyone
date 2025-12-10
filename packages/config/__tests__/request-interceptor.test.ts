import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing
vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../offline-handler', () => ({
  offlineHandler: {
    getIsOnline: vi.fn(() => true),
    queueRequest: vi.fn(),
  },
}));

vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-123',
});

// Create a fresh InterceptorManager for testing
class TestInterceptorManager {
  private requestInterceptors: Array<(url: string, config: RequestInit) => Promise<{ url: string; config: RequestInit }>> = [];
  private responseInterceptors: Array<(response: Response) => Promise<Response>> = [];
  private errorInterceptors: Array<(error: Error) => Promise<Error | Response>> = [];

  addRequestInterceptor(interceptor: (url: string, config: RequestInit) => Promise<{ url: string; config: RequestInit }>): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  addResponseInterceptor(interceptor: (response: Response) => Promise<Response>): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  addErrorInterceptor(interceptor: (error: Error) => Promise<Error | Response>): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  async executeRequestInterceptors(url: string, config: RequestInit): Promise<{ url: string; config: RequestInit }> {
    let modifiedUrl = url;
    let modifiedConfig = config;

    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor(modifiedUrl, modifiedConfig);
      modifiedUrl = result.url;
      modifiedConfig = result.config;
    }

    return { url: modifiedUrl, config: modifiedConfig };
  }

  async executeResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }

    return modifiedResponse;
  }

  async executeErrorInterceptors(error: Error): Promise<Error | Response> {
    let modifiedError: Error | Response = error;

    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError as Error);
    }

    return modifiedError;
  }

  getRequestInterceptorCount(): number {
    return this.requestInterceptors.length;
  }

  getResponseInterceptorCount(): number {
    return this.responseInterceptors.length;
  }

  getErrorInterceptorCount(): number {
    return this.errorInterceptors.length;
  }
}

describe('request-interceptor', () => {
  let manager: TestInterceptorManager;

  beforeEach(() => {
    manager = new TestInterceptorManager();
  });

  describe('InterceptorManager', () => {
    describe('addRequestInterceptor', () => {
      it('should add request interceptor', () => {
        const interceptor = async (url: string, config: RequestInit) => ({ url, config });
        manager.addRequestInterceptor(interceptor);
        expect(manager.getRequestInterceptorCount()).toBe(1);
      });

      it('should return unsubscribe function', () => {
        const interceptor = async (url: string, config: RequestInit) => ({ url, config });
        const unsubscribe = manager.addRequestInterceptor(interceptor);
        expect(typeof unsubscribe).toBe('function');
      });

      it('should remove interceptor on unsubscribe', () => {
        const interceptor = async (url: string, config: RequestInit) => ({ url, config });
        const unsubscribe = manager.addRequestInterceptor(interceptor);
        unsubscribe();
        expect(manager.getRequestInterceptorCount()).toBe(0);
      });
    });

    describe('addResponseInterceptor', () => {
      it('should add response interceptor', () => {
        const interceptor = async (response: Response) => response;
        manager.addResponseInterceptor(interceptor);
        expect(manager.getResponseInterceptorCount()).toBe(1);
      });

      it('should return unsubscribe function', () => {
        const interceptor = async (response: Response) => response;
        const unsubscribe = manager.addResponseInterceptor(interceptor);
        expect(typeof unsubscribe).toBe('function');
      });

      it('should remove interceptor on unsubscribe', () => {
        const interceptor = async (response: Response) => response;
        const unsubscribe = manager.addResponseInterceptor(interceptor);
        unsubscribe();
        expect(manager.getResponseInterceptorCount()).toBe(0);
      });
    });

    describe('addErrorInterceptor', () => {
      it('should add error interceptor', () => {
        const interceptor = async (error: Error) => error;
        manager.addErrorInterceptor(interceptor);
        expect(manager.getErrorInterceptorCount()).toBe(1);
      });

      it('should return unsubscribe function', () => {
        const interceptor = async (error: Error) => error;
        const unsubscribe = manager.addErrorInterceptor(interceptor);
        expect(typeof unsubscribe).toBe('function');
      });

      it('should remove interceptor on unsubscribe', () => {
        const interceptor = async (error: Error) => error;
        const unsubscribe = manager.addErrorInterceptor(interceptor);
        unsubscribe();
        expect(manager.getErrorInterceptorCount()).toBe(0);
      });
    });

    describe('executeRequestInterceptors', () => {
      it('should execute interceptors in order', async () => {
        const order: number[] = [];
        
        manager.addRequestInterceptor(async (url, config) => {
          order.push(1);
          return { url: url + '?first=true', config };
        });
        
        manager.addRequestInterceptor(async (url, config) => {
          order.push(2);
          return { url: url + '&second=true', config };
        });

        const result = await manager.executeRequestInterceptors('/api/test', {});
        
        expect(order).toEqual([1, 2]);
        expect(result.url).toBe('/api/test?first=true&second=true');
      });

      it('should pass modified config through chain', async () => {
        manager.addRequestInterceptor(async (url, config) => {
          return { url, config: { ...config, method: 'POST' } };
        });
        
        manager.addRequestInterceptor(async (url, config) => {
          const headers = new Headers(config.headers);
          headers.set('X-Custom', 'value');
          return { url, config: { ...config, headers } };
        });

        const result = await manager.executeRequestInterceptors('/api/test', {});
        
        expect(result.config.method).toBe('POST');
        expect((result.config.headers as Headers).get('X-Custom')).toBe('value');
      });

      it('should return original values when no interceptors', async () => {
        const result = await manager.executeRequestInterceptors('/api/test', { method: 'GET' });
        
        expect(result.url).toBe('/api/test');
        expect(result.config.method).toBe('GET');
      });
    });

    describe('executeResponseInterceptors', () => {
      it('should execute interceptors in order', async () => {
        const order: number[] = [];
        
        manager.addResponseInterceptor(async (response) => {
          order.push(1);
          return response;
        });
        
        manager.addResponseInterceptor(async (response) => {
          order.push(2);
          return response;
        });

        const mockResponse = new Response('test');
        await manager.executeResponseInterceptors(mockResponse);
        
        expect(order).toEqual([1, 2]);
      });

      it('should return original response when no interceptors', async () => {
        const mockResponse = new Response('test');
        const result = await manager.executeResponseInterceptors(mockResponse);
        
        expect(result).toBe(mockResponse);
      });
    });

    describe('executeErrorInterceptors', () => {
      it('should execute interceptors in order', async () => {
        const order: number[] = [];
        
        manager.addErrorInterceptor(async (error) => {
          order.push(1);
          return error;
        });
        
        manager.addErrorInterceptor(async (error) => {
          order.push(2);
          return error;
        });

        const error = new Error('test error');
        await manager.executeErrorInterceptors(error);
        
        expect(order).toEqual([1, 2]);
      });

      it('should allow interceptor to return Response', async () => {
        manager.addErrorInterceptor(async () => {
          return new Response('fallback', { status: 200 });
        });

        const error = new Error('test error');
        const result = await manager.executeErrorInterceptors(error);
        
        expect(result).toBeInstanceOf(Response);
      });

      it('should return original error when no interceptors', async () => {
        const error = new Error('test error');
        const result = await manager.executeErrorInterceptors(error);
        
        expect(result).toBe(error);
      });
    });
  });
});
