import { Suspense } from 'react';
import { ConsumerNavigationPublic } from '../../components/navigation';
import { Section, Container, LoadingSpinner } from '@ghxstship/ui';
import ToursContent from './tours-content';

function ToursLoadingFallback() {
  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading tours..." />
      </Container>
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
