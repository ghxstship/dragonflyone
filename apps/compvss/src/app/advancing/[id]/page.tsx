'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Button,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Stack,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from '@ghxstship/ui';
import { useAdvancingRequest } from '@ghxstship/config';
import { AdvanceRequestDetail } from '@/components/advancing/advance-request-detail';
import { FulfillmentManager } from '@/components/advancing/fulfillment-manager';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';

export default function AdvanceRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: request } = useAdvancingRequest(params.id);
  const [activeTab, setActiveTab] = useState<'details' | 'fulfill'>('details');

  const canFulfill = request && ['approved', 'in_progress'].includes(request.status);

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <Stack direction="horizontal" className="items-center justify-between">
              <SectionHeader
                kicker="COMPVSS"
                title="Advance Request"
                description={`Request ID: ${params.id}`}
                colorScheme="on-light"
                gap="lg"
              />
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </Stack>

            {canFulfill ? (
              <Tabs>
                <TabsList>
                  <Tab active={activeTab === 'details'} onClick={() => setActiveTab('details')}>Details</Tab>
                  <Tab active={activeTab === 'fulfill'} onClick={() => setActiveTab('fulfill')}>Fulfill Items</Tab>
                </TabsList>

                <TabPanel active={activeTab === 'details'}>
                  <AdvanceRequestDetail requestId={params.id} onUpdate={() => router.refresh()} />
                </TabPanel>

                <TabPanel active={activeTab === 'fulfill'}>
                  <FulfillmentManager requestId={params.id} onSuccess={() => router.refresh()} />
                </TabPanel>
              </Tabs>
            ) : (
              <AdvanceRequestDetail requestId={params.id} onUpdate={() => router.refresh()} />
            )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
