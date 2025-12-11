'use client';

import { useEffect } from 'react';
import { useOffline } from '../hooks/useOffline';

export function ServiceWorkerRegistration() {
  const { registerServiceWorker } = useOffline();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, [registerServiceWorker]);

  return null;
}
