'use client';

import { useState, useEffect, useCallback } from 'react';
import { WifiOff, RefreshCw, Check, AlertCircle } from 'lucide-react';

export interface OfflineIndicatorProps {
  onRetry?: () => void;
  pendingSyncCount?: number;
  lastSyncTime?: Date | null;
  variant?: 'banner' | 'badge' | 'toast';
  className?: string;
}

export function OfflineIndicator({
  onRetry,
  pendingSyncCount = 0,
  lastSyncTime,
  variant = 'banner',
  className = '',
}: OfflineIndicatorProps) {
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const handleSync = useCallback(async () => {
    if (!onRetry || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await onRetry();
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
    } finally {
      setIsSyncing(false);
    }
  }, [onRetry, isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-sync when coming back online
      if (pendingSyncCount > 0 && onRetry) {
        handleSync();
      }
    };
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSyncCount, onRetry, handleSync]);

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Don't render if online and no pending sync
  if (!isOffline && pendingSyncCount === 0 && !showSyncSuccess) {
    return null;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {isOffline ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-mono-xs uppercase tracking-widest bg-grey-200 text-grey-700 border border-grey-400">
            <WifiOff className="h-3 w-3" />
            Offline
          </span>
        ) : pendingSyncCount > 0 ? (
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1 px-2 py-1 text-mono-xs uppercase tracking-widest bg-warning-100 text-warning-800 border border-warning-400 hover:bg-warning-200 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : `Sync ${pendingSyncCount}`}
          </button>
        ) : showSyncSuccess ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-mono-xs uppercase tracking-widest bg-success-100 text-success-800 border border-success-400">
            <Check className="h-3 w-3" />
            Synced
          </span>
        ) : null}
      </div>
    );
  }

  if (variant === 'toast') {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        {isOffline && (
          <div className="flex items-center gap-3 px-4 py-3 bg-grey-900 text-white border-2 border-black shadow-hard">
            <WifiOff className="h-5 w-5 text-grey-500" />
            <div>
              <div className="font-heading text-mono-sm uppercase tracking-widest">Offline Mode</div>
              <div className="text-mono-xs text-grey-500">Changes will sync when online</div>
            </div>
          </div>
        )}
        
        {!isOffline && pendingSyncCount > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-warning-50 text-warning-900 border-2 border-warning-400 shadow-hard">
            <AlertCircle className="h-5 w-5" />
            <div className="flex-1">
              <div className="font-heading text-mono-sm uppercase tracking-widest">
                {pendingSyncCount} Pending Changes
              </div>
              <div className="text-mono-xs text-warning-700">
                Last sync: {formatLastSync(lastSyncTime || null)}
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3 py-1 text-mono-xs font-heading uppercase tracking-widest bg-warning-400 hover:bg-warning-500 transition-colors disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}

        {showSyncSuccess && (
          <div className="flex items-center gap-3 px-4 py-3 bg-success-50 text-success-900 border-2 border-success-400 shadow-hard">
            <Check className="h-5 w-5" />
            <div className="font-heading text-mono-sm uppercase tracking-widest">
              All Changes Synced
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: banner variant
  return (
    <div className={`w-full ${className}`}>
      {isOffline && (
        <div className="flex items-center justify-center gap-3 px-4 py-2 bg-grey-900 text-white">
          <WifiOff className="h-4 w-4" />
          <span className="font-heading text-mono-sm uppercase tracking-widest">
            You&apos;re offline - Changes will sync automatically
          </span>
        </div>
      )}
      
      {!isOffline && pendingSyncCount > 0 && (
        <div className="flex items-center justify-center gap-3 px-4 py-2 bg-warning-100 text-warning-900 border-b-2 border-warning-400">
          <AlertCircle className="h-4 w-4" />
          <span className="font-heading text-mono-sm uppercase tracking-widest">
            {pendingSyncCount} changes pending sync
          </span>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1 px-2 py-1 text-mono-xs font-heading uppercase tracking-widest bg-warning-400 hover:bg-warning-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}

      {showSyncSuccess && (
        <div className="flex items-center justify-center gap-3 px-4 py-2 bg-success-100 text-success-900 border-b-2 border-success-400">
          <Check className="h-4 w-4" />
          <span className="font-heading text-mono-sm uppercase tracking-widest">
            All changes synced successfully
          </span>
        </div>
      )}
    </div>
  );
}
