'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@ghxstship/ui';
import { Container, H1, H2, H3, Body, Button, Card, Badge, Grid, Stack, StatCard, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, LoadingSpinner } from '@ghxstship/ui';

interface SyncJob {
  id: string;
  source_system: string;
  target_system: string;
  status: string;
  created_at: string;
  payload: any;
}

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
      // Mock data for demonstration
      const mockJobs: SyncJob[] = [
        {
          id: '1',
          source_system: 'atlvs',
          target_system: 'compvss',
          status: 'synced',
          created_at: new Date().toISOString(),
          payload: { action: 'create_project', deal_id: 'deal-123' },
        },
        {
          id: '2',
          source_system: 'compvss',
          target_system: 'gvteway',
          status: 'pending',
          created_at: new Date().toISOString(),
          payload: { action: 'create_event', project_id: 'proj-456' },
        },
      ];
      setSyncJobs(mockJobs);
    } catch (error) {
      console.error('Failed to fetch sync jobs:', error);
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
    <Container size="xl" className="py-12">
      <Stack gap={8}>
        <Stack gap={4}>
          <H1>COMPVSS Platform Integrations</H1>
          <Body>
            Monitor cross-platform data synchronization and manage production workflows.
          </Body>
        </Stack>

        <Grid cols={3} gap={6}>
          <StatCard value={24} label="Projects from ATLVS" />
          <StatCard value={18} label="Events to GVTEWAY" />
          <StatCard value={142} label="Asset Allocations" />
        </Grid>

        <Card className="p-8">
          <Stack gap={6}>
            <Stack gap={4} direction="horizontal" className="justify-between items-center">
              <H2>Recent Sync Jobs</H2>
              <Button onClick={fetchSyncJobs} variant="outline">
                Refresh
              </Button>
            </Stack>

            {loading ? (
              <Stack className="py-12 items-center justify-center">
                <LoadingSpinner size="lg" text="Loading sync jobs..." />
              </Stack>
            ) : (
              <Table variant="bordered">
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
                      <TableCell className="uppercase">{job.source_system}</TableCell>
                      <TableCell className="uppercase">{job.target_system}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <Body className="font-mono text-xs">{job.payload.action}</Body>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Stack>
        </Card>

        <Card className="p-8">
          <Stack gap={6}>
            <Stack gap={2}>
              <H2>Integration Workflows</H2>
              <Body>
                Trigger cross-platform workflows from COMPVSS production operations.
              </Body>
            </Stack>

            <Grid cols={2} gap={4}>
              <Card className="p-4 border border-grey-800">
                <Stack gap={4}>
                  <H3>Event Publishing</H3>
                  <Body className="text-sm">
                    Publish production project details to GVTEWAY for ticket sales and guest experience.
                  </Body>
                  <Button variant="solid" className="w-full" onClick={() => { addNotification({ type: 'success', title: 'Publishing', message: 'Event data being synced to GVTEWAY' }); }}>
                    Publish to GVTEWAY
                  </Button>
                </Stack>
              </Card>

              <Card className="p-4 border border-grey-800">
                <Stack gap={4}>
                  <H3>Asset Request</H3>
                  <Body className="text-sm">
                    Check availability and request asset allocation from ATLVS inventory.
                  </Body>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/advancing/requests/new')}>
                    Request from ATLVS
                  </Button>
                </Stack>
              </Card>

              <Card className="p-4 border border-grey-800">
                <Stack gap={4}>
                  <H3>Expense Submission</H3>
                  <Body className="text-sm">
                    Submit production expenses directly to ATLVS finance for approval and payment.
                  </Body>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/expenses/new')}>
                    Submit to Finance
                  </Button>
                </Stack>
              </Card>

              <Card className="p-4 border border-grey-800">
                <Stack gap={4}>
                  <H3>Crew Sync</H3>
                  <Body className="text-sm">
                    Synchronize crew assignments and time tracking with ATLVS payroll system.
                  </Body>
                  <Button variant="outline" className="w-full" onClick={() => { addNotification({ type: 'info', title: 'Syncing', message: 'Crew data sync initiated' }); }}>
                    Sync Crew Data
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
