'use client';

import { useRouter } from 'next/navigation';
import { Container, Button, Stack, EnterprisePageHeader, MainContent } from '@ghxstship/ui';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { AdvanceRequestDetail } from '@/components/advancing/advance-request-detail';

export default function AdvanceRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Advance Request"
        subtitle={`Request ID: ${params.id}`}
        breadcrumbs={[
          { label: 'ATLVS', href: '/dashboard' },
          { label: 'Advancing', href: '/advancing' },
          { label: 'Request Detail' },
        ]}
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
    </AtlvsAppLayout>
  );
}
