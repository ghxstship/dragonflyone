import { Suspense } from 'react';
import { GvtewayLoadingLayout } from '@/components/app-layout';
import ToursContent from './tours-content';

export default function ToursPage() {
  return (
    <Suspense fallback={<GvtewayLoadingLayout text="Loading tours..." />}>
      <ToursContent />
    </Suspense>
  );
}
