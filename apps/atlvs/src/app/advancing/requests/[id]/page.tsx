'use client';

import { useRouter } from 'next/navigation';
import { Container, Button, ButtonGroup } from '@ghxstship/ui';
import { AdvanceRequestDetail } from '@/components/advancing/advance-request-detail';

export default function AdvanceRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <Container>
      <ButtonGroup>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </ButtonGroup>

      <AdvanceRequestDetail
        requestId={params.id}
        onUpdate={() => router.refresh()}
      />
    </Container>
  );
}
