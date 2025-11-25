import { logger } from './logger';

export interface OfflineConfig {
  enableOfflineMode?: boolean;
  syncOnReconnect?: boolean;
  queueRequests?: boolean;
}

interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: string;
  timestamp: number;
}

export class OfflineHandler {
  private isOnline: boolean = true;
  private requestQueue: QueuedRequest[] = [];
  private config: OfflineConfig;
  private listeners: Set<(online: boolean) => void> = new Set();

  constructor(config: OfflineConfig = {}) {
    this.config = {
      enableOfflineMode: true,
      syncOnReconnect: true,
      queueRequests: true,
      ...config,
    };

    if (typeof window !== 'undefined') {
      this.setupEventListeners();
      this.isOnline = navigator.onLine;
    }
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private handleOnline(): void {
    this.isOnline = true;
    logger.info('Network connection restored');
    this.notifyListeners(true);

    if (this.config.syncOnReconnect && this.requestQueue.length > 0) {
      this.syncQueuedRequests();
    }
  }

  private handleOffline(): void {
    this.isOnline = false;
    logger.warn('Network connection lost');
    this.notifyListeners(false);
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }

  onStatusChange(callback: (online: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getIsOnline(): boolean {
    return this.isOnline;
  }

  queueRequest(url: string, method: string, body?: unknown): string {
    if (!this.config.queueRequests) {
      throw new Error('Request queuing is disabled');
    }

    const request: QueuedRequest = {
      id: crypto.randomUUID(),
      url,
      method,
      body: body ? JSON.stringify(body) : undefined,
      timestamp: Date.now(),
    };

    this.requestQueue.push(request);
    logger.debug('Request queued for offline sync', { requestId: request.id, url, method });

    this.saveQueueToStorage();

    return request.id;
  }

  private saveQueueToStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('offline_request_queue', JSON.stringify(this.requestQueue));
      } catch (error) {
        logger.error('Failed to save request queue to storage', error as Error);
      }
    }
  }

  private loadQueueFromStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('offline_request_queue');
        if (stored) {
          this.requestQueue = JSON.parse(stored);
        }
      } catch (error) {
        logger.error('Failed to load request queue from storage', error as Error);
      }
    }
  }

  async syncQueuedRequests(): Promise<void> {
    if (this.requestQueue.length === 0) return;

    logger.info(`Syncing ${this.requestQueue.length} queued requests`);

    const requests = [...this.requestQueue];
    this.requestQueue = [];

    for (const request of requests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: request.body,
        });

        if (response.ok) {
          logger.debug('Queued request synced successfully', { requestId: request.id });
        } else {
          logger.warn('Queued request failed, re-queuing', { requestId: request.id });
          this.requestQueue.push(request);
        }
      } catch (error) {
        logger.error('Failed to sync queued request', error as Error, { requestId: request.id });
        this.requestQueue.push(request);
      }
    }

    this.saveQueueToStorage();
  }

  getQueuedRequestCount(): number {
    return this.requestQueue.length;
  }

  clearQueue(): void {
    this.requestQueue = [];
    this.saveQueueToStorage();
  }
}

export const offlineHandler = new OfflineHandler();
