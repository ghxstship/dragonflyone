"use client";

import { useState, useEffect, useCallback } from "react";
import { WifiOff, RefreshCw, Check, AlertCircle } from "lucide-react";
import { 
  offlineIndicatorVariants,
  offlineIndicatorIconVariants,
  offlineIndicatorTextVariants,
  offlineIndicatorButtonVariants 
} from "./OfflineIndicator.variants.js";
import type { OfflineIndicatorProps } from "./OfflineIndicator.types.js";

/**
 * OfflineIndicator component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Connection status indicators
 * - Auto-sync functionality
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <OfflineIndicator
 *   onRetry={() => console.log('Retrying sync')}
 *   pendingSyncCount={5}
 *   lastSyncTime={new Date()}
 *   variant="banner"
 * />
 * ```
 */
export function OfflineIndicator({
  onRetry,
  pendingSyncCount = 0,
  lastSyncTime,
  variant = "banner",
  inverted = false,
  className,
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

  // Format last sync time
  const formatLastSync = (date: Date | null): string => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  // Don't render if online and no pending items
  if (!isOffline && pendingSyncCount === 0 && !showSyncSuccess) {
    return null;
  }

  const hasPendingItems = pendingSyncCount > 0;

  return (
    <div className={offlineIndicatorVariants({ variant, isOffline, className })}>
      {/* Status Icon and Message */}
      <div className="flex items-center gap-3">
        <div className={offlineIndicatorIconVariants({ isOffline })}>
          {isOffline ? (
            <WifiOff />
          ) : showSyncSuccess ? (
            <Check />
          ) : hasPendingItems ? (
            <AlertCircle />
          ) : (
            <Check />
          )}
        </div>
        
        <div className={offlineIndicatorTextVariants({ isOffline })}>
          {isOffline ? (
            <div>
              <div className="font-medium">You&apos;re offline</div>
              <div className="text-sm opacity-75">
                Changes will sync when connection is restored
              </div>
            </div>
          ) : showSyncSuccess ? (
            <div className="font-medium">Sync completed successfully</div>
          ) : hasPendingItems ? (
            <div>
              <div className="font-medium">
                {pendingSyncCount} item{pendingSyncCount > 1 ? 's' : ''} pending sync
              </div>
              <div className="text-sm opacity-75">
                Last sync: {formatLastSync(lastSyncTime || null)}
              </div>
            </div>
          ) : (
            <div className="font-medium">All changes synced</div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {(isOffline || hasPendingItems) && onRetry && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={offlineIndicatorButtonVariants({ isOffline })}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : isOffline ? 'Retry' : 'Sync Now'}
        </button>
      )}

      {/* Sync Success Message */}
      {showSyncSuccess && !isOffline && !hasPendingItems && (
        <div className="text-sm font-medium text-success-600">
          ✓ All changes synced successfully
        </div>
      )}
    </div>
  );
}
