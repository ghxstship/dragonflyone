import type { ReactNode } from 'react';

export interface ApiErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}
