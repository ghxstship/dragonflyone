'use client';

import { useRouter } from 'next/navigation';
import { Container, Section, Button, Stack, PageLayout } from '@ghxstship/ui';
import { CreatorNavigationAuthenticated } from '../../../../components/navigation';
import { AdvanceRequestDetail } from '@/components/advancing/advance-request-detail';

export default function AdvanceRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <PageLayout background="black" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={6}>
            <Button variant="outline" onClick={() => router.back()}>
              ← Back to Advancing
            </Button>

            <AdvanceRequestDetail
              requestId={params.id}
              onUpdate={() => router.refresh()}
            />
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
