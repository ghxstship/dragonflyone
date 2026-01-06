import dynamic from 'next/dynamic';
import { Skeleton } from '@ghxstship/ui';

// Lazy load the heavy BEO builder component
export const LazyBEOBuilder = dynamic(() => import('./beo-builder').then(mod => ({ default: mod.BEOBuilder })), {
  loading: () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-2 border-border rounded-card p-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  ssr: false, // Disable SSR for complex interactive components
});
