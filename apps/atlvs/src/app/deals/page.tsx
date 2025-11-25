'use client';

import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { Display, Body, Button, Card, Spinner, Container, Section, Stack, H3, Breadcrumb, BreadcrumbItem, EmptyState } from '@ghxstship/ui';
import { useDeals } from '../../hooks/useDeals';

export default function DealsPage() {
  const router = useRouter();
  const { data: deals, isLoading, refetch } = useDeals();

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-ink-950 text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <Spinner size="lg" />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-ink-950 text-white">
      <Navigation />
      <Section className="py-8">
        <Container>
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
            <BreadcrumbItem active>Deals</BreadcrumbItem>
          </Breadcrumb>

          <Stack gap={4} direction="horizontal" className="mb-8 items-center justify-between">
            <Display>Deals</Display>
            <Button variant="solid" onClick={() => router.push('/deals/new')}>New Deal</Button>
          </Stack>

          <Stack gap={4}>
            {(deals || []).map((deal) => (
              <Card key={deal.id} className="p-6 bg-ink-900 border-ink-800">
                <Stack gap={4} direction="horizontal" className="items-start justify-between">
                  <Stack gap={2}>
                    <H3 className="text-xl font-bold uppercase text-white">{deal.title}</H3>
                    <Body className="text-grey-400">{deal.status}</Body>
                    <Body className="text-grey-500">${deal.value?.toLocaleString()}</Body>
                  </Stack>
                  <Button variant="outline" onClick={() => router.push(`/deals/${deal.id}`)}>View</Button>
                </Stack>
              </Card>
            ))}
            {(!deals || deals.length === 0) && (
              <EmptyState
                title="No Deals Yet"
                description="Get started by creating your first deal."
                action={{ label: "Create Deal", onClick: () => router.push('/deals/new') }}
              />
            )}
          </Stack>
        </Container>
      </Section>
    </Section>
  );
}
