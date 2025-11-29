'use client';

import { useRouter } from 'next/navigation';
import { CompvssAppLayout } from '../../../components/app-layout';
import {
  Container,
  Button,
  Stack,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import { AdvanceRequestForm } from '@/components/advancing/advance-request-form';

export default function NewAdvanceRequestPage() {
  const router = useRouter();

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Create Advance Request"
        subtitle="Request production items and services for your event"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Advancing', href: '/advancing' }, { label: 'New' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Stack direction="horizontal" className="items-center justify-end">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </Stack>

            <AdvanceRequestForm
              onSuccess={(requestId) => router.push(`/advancing/${requestId}`)}
              onCancel={() => router.back()}
            />
          </Stack>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
