import dynamic from 'next/dynamic';
import { Skeleton } from '@ghxstship/ui';

// Lazy load heavy BEO dietary component
export const LazyBEODietary = dynamic(() => import('./beo-dietary'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,
});

// Lazy load heavy BEO timeline component
export const LazyBEOTimeline = dynamic(() => import('./beo-timeline'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,
});

// Lazy load heavy BEO section component
export const LazyBEOSection = dynamic(() => import('./beo-section'), {
  loading: () => <Skeleton className="h-32 w-full" />,
  ssr: false,
});

// Lazy load heavy mobile job search component
export const LazyMobileJobSearch = dynamic(() => import('./mobile-job-search'), {
  loading: () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  ),
  ssr: false,
});

// Lazy load heavy crew intelligence component
export const LazyCrewIntelligence = dynamic(() => import('./crew-intelligence'), {
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  ),
  ssr: false,
});
