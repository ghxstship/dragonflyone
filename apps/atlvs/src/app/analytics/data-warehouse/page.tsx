'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert, ProgressBar,
} from '@ghxstship/ui';

interface DataSource {
  id: string;
  name: string;
  type: 'Database' | 'API' | 'File' | 'Streaming';
  status: 'Connected' | 'Syncing' | 'Error' | 'Disconnected';
  lastSync: string;
  recordCount: number;
  syncFrequency: string;
}

interface ETLJob {
  id: string;
  name: string;
  source: string;
  destination: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'Success' | 'Running' | 'Failed' | 'Scheduled';
  duration?: string;
  recordsProcessed?: number;
}

const mockSources: DataSource[] = [
  { id: 'SRC-001', name: 'ATLVS Production DB', type: 'Database', status: 'Connected', lastSync: '2024-11-25 10:30', recordCount: 2450000, syncFrequency: 'Real-time' },
  { id: 'SRC-002', name: 'COMPVSS Events DB', type: 'Database', status: 'Connected', lastSync: '2024-11-25 10:30', recordCount: 1850000, syncFrequency: 'Real-time' },
  { id: 'SRC-003', name: 'GVTEWAY Consumer DB', type: 'Database', status: 'Syncing', lastSync: '2024-11-25 10:15', recordCount: 3200000, syncFrequency: '15 min' },
  { id: 'SRC-004', name: 'Stripe Payments API', type: 'API', status: 'Connected', lastSync: '2024-11-25 10:28', recordCount: 450000, syncFrequency: 'Hourly' },
  { id: 'SRC-005', name: 'Salesforce CRM', type: 'API', status: 'Connected', lastSync: '2024-11-25 09:00', recordCount: 125000, syncFrequency: 'Daily' },
  { id: 'SRC-006', name: 'Google Analytics', type: 'API', status: 'Error', lastSync: '2024-11-24 18:00', recordCount: 8500000, syncFrequency: 'Daily' },
];

const mockJobs: ETLJob[] = [
  { id: 'ETL-001', name: 'Financial Data Aggregation', source: 'ATLVS Production DB', destination: 'Analytics Warehouse', schedule: 'Every 15 min', lastRun: '2024-11-25 10:15', nextRun: '2024-11-25 10:30', status: 'Success', duration: '2m 15s', recordsProcessed: 15420 },
  { id: 'ETL-002', name: 'Event Metrics Rollup', source: 'COMPVSS Events DB', destination: 'Analytics Warehouse', schedule: 'Hourly', lastRun: '2024-11-25 10:00', nextRun: '2024-11-25 11:00', status: 'Success', duration: '5m 32s', recordsProcessed: 45200 },
  { id: 'ETL-003', name: 'Customer 360 Build', source: 'Multiple', destination: 'Customer Data Platform', schedule: 'Daily 2AM', lastRun: '2024-11-25 02:00', nextRun: '2024-11-26 02:00', status: 'Success', duration: '45m 12s', recordsProcessed: 125000 },
  { id: 'ETL-004', name: 'Revenue Attribution', source: 'Stripe + Salesforce', destination: 'Analytics Warehouse', schedule: 'Daily 6AM', lastRun: '2024-11-25 06:00', nextRun: '2024-11-26 06:00', status: 'Running', recordsProcessed: 8500 },
];

export default function DataWarehousePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sources');
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [selectedJob, setSelectedJob] = useState<ETLJob | null>(null);

  const connectedSources = mockSources.filter(s => s.status === 'Connected').length;
  const errorSources = mockSources.filter(s => s.status === 'Error').length;
  const totalRecords = mockSources.reduce((sum, s) => sum + s.recordCount, 0);
  const runningJobs = mockJobs.filter(j => j.status === 'Running').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Connected': case 'Success': return 'text-green-400';
      case 'Syncing': case 'Running': case 'Scheduled': return 'text-blue-400';
      case 'Error': case 'Failed': return 'text-red-400';
      case 'Disconnected': return 'text-ink-400';
      default: return 'text-ink-400';
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Data Warehouse Integration</H1>
            <Label className="text-ink-400">Manage data sources, ETL pipelines, and warehouse connections</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Data Sources" value={mockSources.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Connected" value={connectedSources} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Records" value={`${(totalRecords / 1000000).toFixed(1)}M`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="ETL Jobs" value={mockJobs.length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {errorSources > 0 && (
            <Alert variant="error">{errorSources} data source(s) have connection errors</Alert>
          )}

          <Tabs>
            <TabsList>
              <Tab active={activeTab === 'sources'} onClick={() => setActiveTab('sources')}>Data Sources</Tab>
              <Tab active={activeTab === 'etl'} onClick={() => setActiveTab('etl')}>ETL Jobs</Tab>
              <Tab active={activeTab === 'schema'} onClick={() => setActiveTab('schema')}>Schema</Tab>
            </TabsList>
          </Tabs>

          {activeTab === 'sources' && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-end">
                <Button variant="outlineWhite">Add Data Source</Button>
              </Stack>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-ink-400">Source</TableHead>
                    <TableHead className="text-ink-400">Type</TableHead>
                    <TableHead className="text-ink-400">Records</TableHead>
                    <TableHead className="text-ink-400">Sync Frequency</TableHead>
                    <TableHead className="text-ink-400">Last Sync</TableHead>
                    <TableHead className="text-ink-400">Status</TableHead>
                    <TableHead className="text-ink-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSources.map((source) => (
                    <TableRow key={source.id} className={source.status === 'Error' ? 'bg-red-900/10' : ''}>
                      <TableCell><Label className="text-white">{source.name}</Label></TableCell>
                      <TableCell><Badge variant="outline">{source.type}</Badge></TableCell>
                      <TableCell><Label className="font-mono text-white">{source.recordCount.toLocaleString()}</Label></TableCell>
                      <TableCell><Label className="text-ink-300">{source.syncFrequency}</Label></TableCell>
                      <TableCell><Label className="font-mono text-ink-300">{source.lastSync}</Label></TableCell>
                      <TableCell><Label className={getStatusColor(source.status)}>{source.status}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSource(source)}>Details</Button>
                          {source.status === 'Error' && <Button variant="solid" size="sm">Reconnect</Button>}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}

          {activeTab === 'etl' && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-end">
                <Button variant="outlineWhite">Create ETL Job</Button>
              </Stack>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-ink-400">Job Name</TableHead>
                    <TableHead className="text-ink-400">Source → Destination</TableHead>
                    <TableHead className="text-ink-400">Schedule</TableHead>
                    <TableHead className="text-ink-400">Last Run</TableHead>
                    <TableHead className="text-ink-400">Duration</TableHead>
                    <TableHead className="text-ink-400">Records</TableHead>
                    <TableHead className="text-ink-400">Status</TableHead>
                    <TableHead className="text-ink-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell><Label className="text-white">{job.name}</Label></TableCell>
                      <TableCell>
                        <Stack gap={0}>
                          <Label className="text-ink-300">{job.source}</Label>
                          <Label size="xs" className="text-ink-500">→ {job.destination}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Label className="text-ink-300">{job.schedule}</Label></TableCell>
                      <TableCell><Label className="font-mono text-ink-300">{job.lastRun}</Label></TableCell>
                      <TableCell><Label className="font-mono text-white">{job.duration || '-'}</Label></TableCell>
                      <TableCell><Label className="font-mono text-white">{job.recordsProcessed?.toLocaleString() || '-'}</Label></TableCell>
                      <TableCell><Label className={getStatusColor(job.status)}>{job.status}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedJob(job)}>Details</Button>
                          <Button variant="outline" size="sm">Run Now</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}

          {activeTab === 'schema' && (
            <Grid cols={2} gap={4}>
              {['dim_customers', 'dim_projects', 'dim_employees', 'fact_transactions', 'fact_events', 'fact_timesheets'].map((table) => (
                <Card key={table} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="font-mono text-white">{table}</Label>
                      <Badge variant="outline">{table.startsWith('dim') ? 'Dimension' : 'Fact'}</Badge>
                    </Stack>
                    <Stack gap={1}>
                      {['id', 'created_at', 'updated_at', table.startsWith('dim') ? 'name' : 'amount'].map((col) => (
                        <Label key={col} size="xs" className="text-ink-400 font-mono">• {col}</Label>
                      ))}
                      <Label size="xs" className="text-ink-500">+ more columns...</Label>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/analytics')}>Back to Analytics</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedSource} onClose={() => setSelectedSource(null)}>
        <ModalHeader><H3>Data Source Details</H3></ModalHeader>
        <ModalBody>
          {selectedSource && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Source Name</Label>
                <Body className="text-white">{selectedSource.name}</Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedSource.type}</Badge>
                <Label className={getStatusColor(selectedSource.status)}>{selectedSource.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Total Records</Label><Label className="font-mono text-white">{selectedSource.recordCount.toLocaleString()}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Sync Frequency</Label><Label className="text-white">{selectedSource.syncFrequency}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Last Sync</Label><Label className="font-mono text-white">{selectedSource.lastSync}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSource(null)}>Close</Button>
          <Button variant="solid">Sync Now</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedJob} onClose={() => setSelectedJob(null)}>
        <ModalHeader><H3>ETL Job Details</H3></ModalHeader>
        <ModalBody>
          {selectedJob && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label className="text-ink-400">Job Name</Label>
                <Body className="text-white">{selectedJob.name}</Body>
              </Stack>
              <Label className={getStatusColor(selectedJob.status)}>{selectedJob.status}</Label>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Source</Label><Label className="text-white">{selectedJob.source}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Destination</Label><Label className="text-white">{selectedJob.destination}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Schedule</Label><Label className="text-white">{selectedJob.schedule}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Next Run</Label><Label className="font-mono text-white">{selectedJob.nextRun}</Label></Stack>
              </Grid>
              {selectedJob.duration && (
                <Grid cols={2} gap={4}>
                  <Stack gap={1}><Label className="text-ink-400">Duration</Label><Label className="font-mono text-white">{selectedJob.duration}</Label></Stack>
                  <Stack gap={1}><Label className="text-ink-400">Records Processed</Label><Label className="font-mono text-white">{selectedJob.recordsProcessed?.toLocaleString()}</Label></Stack>
                </Grid>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedJob(null)}>Close</Button>
          <Button variant="outline">View Logs</Button>
          <Button variant="solid">Run Now</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
