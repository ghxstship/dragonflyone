'use client';

import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
import { CompvssAppLayout } from '../../components/app-layout';
import {
  Container,
  Button,
  Card,
  Grid,
  Stack,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import { AdvanceRequestsList } from '@/components/advancing/advance-requests-list';

export default function AdvancingPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'my-requests',
    validTabs: ['my-requests', 'to-fulfill', 'all'],
  });

  // Mock stats - in production these would come from API
  const stats = {
    pending: 12,
    approved: 8,
    fulfilled: 45,
    total: 65,
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Production Advancing"
        subtitle="Submit and manage production advance requests"


        primaryAction={{ label: 'Create New Request', onClick: () => router.push('/advancing/new') }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

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
                  <Tab active={isActive('my-requests')} onClick={() => setActiveTab('my-requests')}>
                    My Requests
                  </Tab>
                  <Tab active={isActive('to-fulfill')} onClick={() => setActiveTab('to-fulfill')}>
                    To Fulfill
                  </Tab>
                  <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>
                    All Requests
                  </Tab>
                </TabsList>

                <TabPanel active={isActive('my-requests')}>
                  <Stack gap={4} className="mt-6">
                    <AdvanceRequestsList />
                  </Stack>
                </TabPanel>

                <TabPanel active={isActive('to-fulfill')}>
                  <Stack gap={4} className="mt-6">
                    <AdvanceRequestsList status="approved" />
                  </Stack>
                </TabPanel>

                <TabPanel active={isActive('all')}>
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
      </MainContent>
    </CompvssAppLayout>
  );
}
