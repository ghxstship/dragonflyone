'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  H1,
  Button,
  ButtonGroup,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
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
    <Container>
      <ButtonGroup>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </ButtonGroup>

      <H1>Advance Request</H1>

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
    </Container>
  );
}
