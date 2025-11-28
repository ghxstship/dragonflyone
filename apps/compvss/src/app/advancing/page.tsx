'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import {
  Container,
  Section,
  Button,
  Card,
  Grid,
  Stack,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  PageLayout,
  SectionHeader,
} from '@ghxstship/ui';
import { AdvanceRequestsList } from '@/components/advancing/advance-requests-list';

export default function AdvancingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-requests' | 'to-fulfill' | 'all'>('my-requests');

  // Mock stats - in production these would come from API
  const stats = {
    pending: 12,
    approved: 8,
    fulfilled: 45,
    total: 65,
  };

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header */}
            <SectionHeader
              kicker="COMPVSS"
              title="Production Advancing"
              description="Submit and manage production advance requests"
              colorScheme="on-light"
              gap="lg"
            />

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={stats.pending.toString()} label="Pending Requests" />
              <StatCard value={stats.approved.toString()} label="Approved" />
              <StatCard value={stats.fulfilled.toString()} label="Fulfilled" />
              <StatCard value={stats.total.toString()} label="Total Requests" />
            </Grid>

            {/* Action Buttons */}
            <Stack direction="horizontal" gap={4}>
              <Button variant="solid" onClick={() => router.push('/advancing/new')}>
                Create New Request
              </Button>
              <Button variant="outline" onClick={() => router.push('/advancing/catalog')}>
                Browse Catalog
              </Button>
            </Stack>

            {/* Tabs */}
            <Card className="p-6">
              <Tabs>
                <TabsList>
                  <Tab active={activeTab === 'my-requests'} onClick={() => setActiveTab('my-requests')}>
                    My Requests
                  </Tab>
                  <Tab active={activeTab === 'to-fulfill'} onClick={() => setActiveTab('to-fulfill')}>
                    To Fulfill
                  </Tab>
                  <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                    All Requests
                  </Tab>
                </TabsList>

                <TabPanel active={activeTab === 'my-requests'}>
                  <Stack gap={4} className="mt-6">
                    <AdvanceRequestsList />
                  </Stack>
                </TabPanel>

                <TabPanel active={activeTab === 'to-fulfill'}>
                  <Stack gap={4} className="mt-6">
                    <AdvanceRequestsList status="approved" />
                  </Stack>
                </TabPanel>

                <TabPanel active={activeTab === 'all'}>
                  <Stack gap={4} className="mt-6">
                    <AdvanceRequestsList />
                  </Stack>
                </TabPanel>
              </Tabs>
            </Card>

            {/* Quick Links */}
            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push('/projects')}>
                Projects
              </Button>
              <Button variant="outline" onClick={() => router.push('/vendors')}>
                Vendors
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
