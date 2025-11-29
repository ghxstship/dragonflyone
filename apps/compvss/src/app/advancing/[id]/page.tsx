'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompvssAppLayout } from '../../../components/app-layout';
import {
  Container,
  Button,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Stack,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import { useAdvancingRequest } from '@ghxstship/config';
import { AdvanceRequestDetail } from '@/components/advancing/advance-request-detail';
import { FulfillmentManager } from '@/components/advancing/fulfillment-manager';

export default function AdvanceRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: request } = useAdvancingRequest(params.id);
  const [activeTab, setActiveTab] = useState<'details' | 'fulfill'>('details');

  const canFulfill = request && ['approved', 'in_progress'].includes(request.status);

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Advance Request"
        subtitle={`Request ID: ${params.id}`}
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Advancing', href: '/advancing' }, { label: params.id }]}
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
      </MainContent>
    </CompvssAppLayout>
  );
}
