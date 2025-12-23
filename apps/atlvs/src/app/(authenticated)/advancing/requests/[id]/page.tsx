'use client';

import { useRouter } from 'next/navigation';
import { Container, Button, Stack, EnterprisePageHeader, MainContent } from '@ghxstship/ui';
// Layout provided by route group
import { AdvanceRequestDetail } from '@/components/advancing/advance-request-detail';

export default function AdvanceRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <>
      <EnterprisePageHeader
        title="Advance Request"
        subtitle={`Request ID: ${params.id}`}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
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
      </MainContent>
    </>
  );
}
