import { Suspense } from 'react';
import { ConsumerNavigationPublic } from '@/components/navigation';
import { Section, Container, LoadingSpinner, PageLayout, Footer, FooterColumn, FooterLink, Display } from '@ghxstship/ui';
import ToursContent from './tours-content';

function ToursLoadingFallback() {
  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/tours">Tours</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10 flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading tours..." />
        </Container>
      </Section>
    </PageLayout>
  );
}

export default function ToursPage() {
  return (
    <Suspense fallback={<ToursLoadingFallback />}>
      <ToursContent />
    </Suspense>
  );
}
