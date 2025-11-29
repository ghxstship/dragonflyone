'use client';

import { useRouter } from 'next/navigation';
import { Container, Section, Button, Stack, PageLayout, SectionHeader,
  EnterprisePageHeader,
  MainContent,} from '@ghxstship/ui';
import { AdvanceRequestForm } from '@/components/advancing/advance-request-form';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';

export default function NewAdvanceRequestPage() {
  const router = useRouter();

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <Stack direction="horizontal" className="items-center justify-between">
              <EnterprisePageHeader
        title="Create Advance Request"
        subtitle="Request production items and services for your event"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Advancing', href: '/advancing' }, { label: 'New' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />
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
      </Section>
    </PageLayout>
  );
}
