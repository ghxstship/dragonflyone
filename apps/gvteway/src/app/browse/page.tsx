import { Suspense } from 'react';
import { Section, LoadingSpinner, Container } from '@ghxstship/ui';
import BrowseContent from './browse-content';

function BrowseLoadingFallback() {
  return (
    <Section background="black" className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <Container className="relative z-10 flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </Container>
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
