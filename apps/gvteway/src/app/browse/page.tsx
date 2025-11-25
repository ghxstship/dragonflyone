import { Suspense } from 'react';
import { Section, LoadingSpinner } from '@ghxstship/ui';
import BrowseContent from './browse-content';

function BrowseLoadingFallback() {
  return (
    <Section className="min-h-screen bg-white flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </Section>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoadingFallback />}>
      <BrowseContent />
    </Suspense>
  );
}
