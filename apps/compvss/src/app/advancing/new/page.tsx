'use client';

import { useRouter } from 'next/navigation';
import { Container, H1, Body, Button } from '@ghxstship/ui';
import { AdvanceRequestForm } from '@/components/advancing/advance-request-form';

export default function NewAdvanceRequestPage() {
  const router = useRouter();

  return (
    <Container>
      <Button variant="outline" onClick={() => router.back()}>
        Back
      </Button>

      <H1>Create Advance Request</H1>
      <Body>Request production items and services for your event</Body>

      <AdvanceRequestForm
        onSuccess={(requestId) => router.push(`/advancing/${requestId}`)}
        onCancel={() => router.back()}
      />
    </Container>
  );
}
