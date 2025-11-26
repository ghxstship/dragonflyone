'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  H1,
  Body,
  Button,
  ButtonGroup,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
} from '@ghxstship/ui';
import { AdvanceRequestsList } from '@/components/advancing/advance-requests-list';
import { FulfillmentManager } from '@/components/advancing/fulfillment-manager';
import type { AdvanceStatus } from '@ghxstship/config/types/advancing';

export default function AdvancingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-requests' | 'to-fulfill' | 'all'>('my-requests');

  return (
    <Container>
      <H1>Production Advancing</H1>
      <Body>Submit and manage production advance requests</Body>

      <ButtonGroup>
        <Button variant="solid" onClick={() => router.push('/advancing/new')}>
          Create New Request
        </Button>
      </ButtonGroup>

      <Tabs>
        <TabsList>
          <Tab active={activeTab === 'my-requests'} onClick={() => setActiveTab('my-requests')}>My Requests</Tab>
          <Tab active={activeTab === 'to-fulfill'} onClick={() => setActiveTab('to-fulfill')}>To Fulfill</Tab>
          <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>All Requests</Tab>
        </TabsList>

        <TabPanel active={activeTab === 'my-requests'}>
          <AdvanceRequestsList />
        </TabPanel>

        <TabPanel active={activeTab === 'to-fulfill'}>
          <AdvanceRequestsList status="approved" />
        </TabPanel>

        <TabPanel active={activeTab === 'all'}>
          <AdvanceRequestsList />
        </TabPanel>
      </Tabs>
    </Container>
  );
}
