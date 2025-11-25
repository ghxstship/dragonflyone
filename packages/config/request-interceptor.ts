import { logger } from './logger';
import { offlineHandler } from './offline-handler';

export type RequestInterceptor = (
  url: string,
  config: RequestInit
) => Promise<{ url: string; config: RequestInit }>;

export type ResponseInterceptor = (
  response: Response
) => Promise<Response>;

export type ErrorInterceptor = (
  error: Error
) => Promise<Error | Response>;

class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  async executeRequestInterceptors(
    url: string,
    config: RequestInit
  ): Promise<{ url: string; config: RequestInit }> {
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
}

export const interceptorManager = new InterceptorManager();

// Default interceptors

// Add request ID to all requests
interceptorManager.addRequestInterceptor(async (url, config) => {
  const headers = new Headers(config.headers);
  headers.set('X-Request-ID', crypto.randomUUID());
  headers.set('X-Client-Version', '1.0.0');
  headers.set('X-Client-Timestamp', new Date().toISOString());

  return {
    url,
    config: {
      ...config,
      headers,
    },
  };
});

// Handle offline requests
interceptorManager.addRequestInterceptor(async (url, config) => {
  if (!offlineHandler.getIsOnline()) {
    logger.warn('Request attempted while offline', { url, method: config.method });
    
    if (config.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method)) {
      offlineHandler.queueRequest(url, config.method, config.body);
      throw new Error('Network offline - request queued for later sync');
    } else {
      throw new Error('Network offline - cannot complete request');
    }
  }

  return { url, config };
});

// Log response times
interceptorManager.addResponseInterceptor(async (response) => {
  const requestId = response.headers.get('X-Request-ID');
  
  logger.debug('Response received', {
    requestId: requestId || undefined,
    status: response.status,
    statusText: response.statusText,
  });

  return response;
});

// Handle common error scenarios
interceptorManager.addErrorInterceptor(async (error) => {
  if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
    logger.error('Network error occurred', error, {
      isOnline: offlineHandler.getIsOnline(),
    });
  }

  return error;
});

export async function interceptedFetch(
  url: string,
  config: RequestInit = {}
): Promise<Response> {
  try {
    const { url: modifiedUrl, config: modifiedConfig } = 
      await interceptorManager.executeRequestInterceptors(url, config);

    const response = await fetch(modifiedUrl, modifiedConfig);

    return await interceptorManager.executeResponseInterceptors(response);
  } catch (error) {
    const handled = await interceptorManager.executeErrorInterceptors(error as Error);
    
    if (handled instanceof Response) {
      return handled;
    }
    
    throw handled;
  }
}
