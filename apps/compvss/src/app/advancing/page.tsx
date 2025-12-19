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
import { useQuery } from '@tanstack/react-query';
import type { ProductionAdvance } from '@ghxstship/config/types/advancing';

export default function AdvancingPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'my-requests',
    validTabs: ['my-requests', 'to-fulfill', 'all'],
  });

  // Fetch all requests to calculate stats
  const { data: requestsData } = useQuery({
    queryKey: ['advancing-requests-stats'],
    queryFn: async () => {
      const response = await fetch('/api/advancing/requests?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    },
  });
  const requests: ProductionAdvance[] = requestsData?.data || [];
  
  // Calculate real stats from API data
  const stats = {
    pending: requests.filter((r) => r.status === 'submitted' || r.status === 'under_review').length,
    approved: requests.filter((r) => r.status === 'approved' || r.status === 'in_progress').length,
    fulfilled: requests.filter((r) => r.status === 'fulfilled').length,
    total: requests.length,
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
            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
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
            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
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
