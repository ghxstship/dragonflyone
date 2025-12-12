'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CompvssAppLayout } from '../../components/app-layout';
import { log } from '@ghxstship/config';
import {
  Container,
  H2,
  H3,
  Body,
  Button,
  Card,
  Badge,
  Grid,
  Stack,
  StatCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Spinner,
  useNotifications,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

import {
  DEMO_SYNC_JOBS,
  type DemoSyncJob as SyncJob,
} from '../../lib/demo-data';

export default function CompvssIntegrationsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyncJobs();
  }, []);

  const fetchSyncJobs = async () => {
    setLoading(true);
    try {
      // Use centralized demo data
      setSyncJobs(DEMO_SYNC_JOBS);
    } catch (error) {
      log.error('Failed to fetch sync jobs:', error instanceof Error ? error : undefined);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      synced: 'solid',
      pending: 'outline',
      failed: 'ghost',
    };
    return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Platform Integrations"
        subtitle="Monitor cross-platform data synchronization and manage production workflows."


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={3} gap={6}>
              <StatCard value="24" label="Projects from ATLVS" />
              <StatCard value="18" label="Events to GVTEWAY" />
              <StatCard value="142" label="Asset Allocations" />
            </Grid>

            <Card>
              <Stack gap={6}>
                <Stack gap={4} direction="horizontal" className="justify-between items-center">
                  <H2>Recent Sync Jobs</H2>
                  <Button onClick={fetchSyncJobs} variant="outline">
                    Refresh
                  </Button>
                </Stack>

                {loading ? (
                  <Stack className="items-center justify-center py-12">
                    <Spinner variant="grey" size="lg" text="Loading sync jobs..." />
                  </Stack>
                ) : (
                  <Table variant="dark">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell><Body>{job.source_system.toUpperCase()}</Body></TableCell>
                          <TableCell><Body>{job.target_system.toUpperCase()}</Body></TableCell>
                          <TableCell>{getStatusBadge(job.status)}</TableCell>
                          <TableCell><Body size="sm" className="">{new Date(job.created_at).toLocaleString()}</Body></TableCell>
                          <TableCell>
                            <Body className="font-mono">{job.payload.action}</Body>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Stack>
            </Card>

            <Card>
              <Stack gap={6}>
                <Stack gap={2}>
                  <H2>Integration Workflows</H2>
                  <Body>
                    Trigger cross-platform workflows from COMPVSS production operations.
                  </Body>
                </Stack>

                <Grid cols={2} gap={4}>
                  <Card>
                    <Stack gap={4}>
                      <H3>Event Publishing</H3>
                      <Body size="sm" className="">
                        Publish production project details to GVTEWAY for ticket sales and guest experience.
                      </Body>
                      <Button variant="solid" onClick={() => { addNotification({ type: 'success', title: 'Publishing', message: 'Event data being synced to GVTEWAY' }); }}>
                        Publish to GVTEWAY
                      </Button>
                    </Stack>
                  </Card>

                  <Card>
                    <Stack gap={4}>
                      <H3>Asset Request</H3>
                      <Body size="sm" className="">
                        Check availability and request asset allocation from ATLVS inventory.
                      </Body>
                      <Button variant="outline" onClick={() => router.push('/advancing/requests/new')}>
                        Request from ATLVS
                      </Button>
                    </Stack>
                  </Card>

                  <Card>
                    <Stack gap={4}>
                      <H3>Expense Submission</H3>
                      <Body size="sm" className="">
                        Submit production expenses directly to ATLVS finance for approval and payment.
                      </Body>
                      <Button variant="outline" onClick={() => router.push('/expenses/new')}>
                        Submit to Finance
                      </Button>
                    </Stack>
                  </Card>

                  <Card>
                    <Stack gap={4}>
                      <H3>Crew Sync</H3>
                      <Body size="sm" className="">
                        Synchronize crew assignments and time tracking with ATLVS payroll system.
                      </Body>
                      <Button variant="outline" onClick={() => { addNotification({ type: 'info', title: 'Syncing', message: 'Crew data sync initiated' }); }}>
                        Sync Crew Data
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
