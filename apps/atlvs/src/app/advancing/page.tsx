'use client';

import { useState } from 'react';
import { Container, H1, Body, Tabs, TabsList, Tab, TabPanel } from '@ghxstship/ui';
import { AdvanceRequestsList } from '@/components/advancing/advance-requests-list';

type TabValue = 'all' | 'submitted' | 'approved' | 'in_progress' | 'fulfilled';

export default function AdvancingPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  return (
    <Container>
      <H1>Production Advancing</H1>
      <Body>Manage production advance requests and catalog items</Body>

      <Tabs>
        <TabsList>
          <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>All Requests</Tab>
          <Tab active={activeTab === 'submitted'} onClick={() => setActiveTab('submitted')}>Pending Review</Tab>
          <Tab active={activeTab === 'approved'} onClick={() => setActiveTab('approved')}>Approved</Tab>
          <Tab active={activeTab === 'in_progress'} onClick={() => setActiveTab('in_progress')}>In Progress</Tab>
          <Tab active={activeTab === 'fulfilled'} onClick={() => setActiveTab('fulfilled')}>Fulfilled</Tab>
        </TabsList>

        <TabPanel active={activeTab === 'all'}>
          <AdvanceRequestsList />
        </TabPanel>

        <TabPanel active={activeTab === 'submitted'}>
          <AdvanceRequestsList status="submitted" />
        </TabPanel>

        <TabPanel active={activeTab === 'approved'}>
          <AdvanceRequestsList status="approved" />
        </TabPanel>

        <TabPanel active={activeTab === 'in_progress'}>
          <AdvanceRequestsList status="in_progress" />
        </TabPanel>

        <TabPanel active={activeTab === 'fulfilled'}>
          <AdvanceRequestsList status="fulfilled" />
        </TabPanel>
      </Tabs>
    </Container>
  );
}
