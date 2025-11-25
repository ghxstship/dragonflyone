import { Suspense } from 'react';
import { Section, LoadingSpinner } from '@ghxstship/ui';
import ToursContent from './tours-content';

function ToursLoadingFallback() {
  return (
    <Section className="min-h-screen bg-white flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </Section>
  );
}

export default function ToursPage() {
  return (
    <Suspense fallback={<ToursLoadingFallback />}>
      <ToursContent />
    </Suspense>
  );
}
