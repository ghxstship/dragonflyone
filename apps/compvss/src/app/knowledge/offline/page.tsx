'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, ProgressBar, Alert,
} from '@ghxstship/ui';

interface OfflineContent {
  id: string;
  title: string;
  category: string;
  size: string;
  lastSynced: string;
  status: 'Synced' | 'Pending' | 'Outdated' | 'Error';
  priority: 'High' | 'Medium' | 'Low';
}

interface OfflinePackage {
  id: string;
  name: string;
  description: string;
  contentCount: number;
  totalSize: string;
  downloaded: boolean;
  lastUpdated: string;
}

const mockContent: OfflineContent[] = [
  { id: 'OFF-001', title: 'Safety Procedures Manual', category: 'Safety', size: '2.4 MB', lastSynced: '2024-11-25 08:30', status: 'Synced', priority: 'High' },
  { id: 'OFF-002', title: 'Emergency Response Guide', category: 'Safety', size: '1.8 MB', lastSynced: '2024-11-25 08:30', status: 'Synced', priority: 'High' },
  { id: 'OFF-003', title: 'Audio Equipment Setup', category: 'Equipment', size: '5.2 MB', lastSynced: '2024-11-24 14:00', status: 'Outdated', priority: 'Medium' },
  { id: 'OFF-004', title: 'Lighting Focus Sheets', category: 'Technical', size: '3.1 MB', lastSynced: '2024-11-25 08:30', status: 'Synced', priority: 'Medium' },
  { id: 'OFF-005', title: 'Rigging Calculations', category: 'Technical', size: '1.5 MB', lastSynced: '2024-11-23 10:00', status: 'Pending', priority: 'High' },
  { id: 'OFF-006', title: 'Union Rules Reference', category: 'Compliance', size: '0.8 MB', lastSynced: '2024-11-25 08:30', status: 'Synced', priority: 'Low' },
];

const mockPackages: OfflinePackage[] = [
  { id: 'PKG-001', name: 'Safety Essentials', description: 'Critical safety documents and emergency procedures', contentCount: 12, totalSize: '15.2 MB', downloaded: true, lastUpdated: '2024-11-20' },
  { id: 'PKG-002', name: 'Audio Department', description: 'Audio equipment guides, line lists, and system documentation', contentCount: 28, totalSize: '45.8 MB', downloaded: true, lastUpdated: '2024-11-18' },
  { id: 'PKG-003', name: 'Lighting Department', description: 'Lighting focus sheets, fixture manuals, and programming guides', contentCount: 35, totalSize: '62.3 MB', downloaded: false, lastUpdated: '2024-11-22' },
  { id: 'PKG-004', name: 'Video Department', description: 'Video I/O documentation, LED wall guides, and signal flow diagrams', contentCount: 22, totalSize: '38.5 MB', downloaded: false, lastUpdated: '2024-11-19' },
  { id: 'PKG-005', name: 'Rigging & Staging', description: 'Rigging calculations, load charts, and staging documentation', contentCount: 18, totalSize: '25.1 MB', downloaded: true, lastUpdated: '2024-11-21' },
];

export default function OfflineAccessPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('content');
  const [selectedPackage, setSelectedPackage] = useState<OfflinePackage | null>(null);
  const [syncing, setSyncing] = useState(false);

  const syncedCount = mockContent.filter(c => c.status === 'Synced').length;
  const outdatedCount = mockContent.filter(c => c.status === 'Outdated').length;
  const totalSize = '186.9 MB';
  const downloadedPackages = mockPackages.filter(p => p.downloaded).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Synced': return 'text-success-400';
      case 'Pending': return 'text-warning-400';
      case 'Outdated': return 'text-warning-400';
      case 'Error': return 'text-error-400';
      default: return 'text-ink-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-error-400';
      case 'Medium': return 'text-warning-400';
      case 'Low': return 'text-ink-400';
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
            <H1>Offline Access</H1>
            <Label className="text-ink-400">Download content for mobile-optimized offline access</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Synced Content" value={syncedCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Needs Update" value={outdatedCount} trend={outdatedCount > 0 ? 'down' : 'neutral'} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Downloaded" value={totalSize} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Packages" value={`${downloadedPackages}/${mockPackages.length}`} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {outdatedCount > 0 && (
            <Alert variant="warning">{outdatedCount} item(s) have updates available. Sync to get the latest content.</Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === 'content'} onClick={() => setActiveTab('content')}>My Content</Tab>
                <Tab active={activeTab === 'packages'} onClick={() => setActiveTab('packages')}>Packages</Tab>
                <Tab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setSyncing(true)}>
              {syncing ? 'Syncing...' : 'Sync All'}
            </Button>
          </Stack>

          {activeTab === 'content' && (
            <Table className="border-2 border-ink-800">
              <TableHeader>
                <TableRow className="bg-ink-900">
                  <TableHead className="text-ink-400">Content</TableHead>
                  <TableHead className="text-ink-400">Category</TableHead>
                  <TableHead className="text-ink-400">Size</TableHead>
                  <TableHead className="text-ink-400">Priority</TableHead>
                  <TableHead className="text-ink-400">Last Synced</TableHead>
                  <TableHead className="text-ink-400">Status</TableHead>
                  <TableHead className="text-ink-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockContent.map((content) => (
                  <TableRow key={content.id} className={content.status === 'Outdated' ? 'bg-warning-900/10' : ''}>
                    <TableCell><Label className="text-white">{content.title}</Label></TableCell>
                    <TableCell><Badge variant="outline">{content.category}</Badge></TableCell>
                    <TableCell><Label className="font-mono text-ink-300">{content.size}</Label></TableCell>
                    <TableCell><Label className={getPriorityColor(content.priority)}>{content.priority}</Label></TableCell>
                    <TableCell><Label className="text-ink-300">{content.lastSynced}</Label></TableCell>
                    <TableCell><Label className={getStatusColor(content.status)}>{content.status}</Label></TableCell>
                    <TableCell>
                      <Stack direction="horizontal" gap={2}>
                        {content.status === 'Outdated' && <Button variant="solid" size="sm">Update</Button>}
                        <Button variant="ghost" size="sm">Remove</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'packages' && (
            <Grid cols={2} gap={4}>
              {mockPackages.map((pkg) => (
                <Card key={pkg.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{pkg.name}</Body>
                        <Label className="text-ink-400">{pkg.description}</Label>
                      </Stack>
                      <Badge variant={pkg.downloaded ? 'solid' : 'outline'}>{pkg.downloaded ? 'Downloaded' : 'Available'}</Badge>
                    </Stack>
                    <Grid cols={2} gap={4}>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Content Items</Label>
                        <Label className="font-mono text-white">{pkg.contentCount}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Size</Label>
                        <Label className="font-mono text-white">{pkg.totalSize}</Label>
                      </Stack>
                    </Grid>
                    <Label size="xs" className="text-ink-500">Updated: {pkg.lastUpdated}</Label>
                    <Button variant={pkg.downloaded ? 'outline' : 'solid'} size="sm" onClick={() => setSelectedPackage(pkg)}>
                      {pkg.downloaded ? 'Manage' : 'Download'}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}

          {activeTab === 'settings' && (
            <Stack gap={4}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Sync Settings</H3>
                  <Grid cols={2} gap={4}>
                    <Stack gap={2}>
                      <Label>Auto-Sync</Label>
                      <Select className="border-ink-700 bg-black text-white">
                        <option value="wifi">On WiFi Only</option>
                        <option value="always">Always</option>
                        <option value="manual">Manual Only</option>
                      </Select>
                    </Stack>
                    <Stack gap={2}>
                      <Label>Sync Frequency</Label>
                      <Select className="border-ink-700 bg-black text-white">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="startup">On App Startup</option>
                      </Select>
                    </Stack>
                  </Grid>
                </Stack>
              </Card>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Storage</H3>
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="text-ink-400">Used Space</Label>
                      <Label className="font-mono text-white">{totalSize}</Label>
                    </Stack>
                    <ProgressBar value={35} className="h-2" />
                    <Label size="xs" className="text-ink-500">35% of available offline storage used</Label>
                  </Stack>
                  <Stack gap={2}>
                    <Label>Storage Limit</Label>
                    <Select className="border-ink-700 bg-black text-white">
                      <option value="500">500 MB</option>
                      <option value="1000">1 GB</option>
                      <option value="2000">2 GB</option>
                      <option value="unlimited">Unlimited</option>
                    </Select>
                  </Stack>
                  <Button variant="outline" size="sm">Clear All Offline Data</Button>
                </Stack>
              </Card>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Priority Content</H3>
                  <Label className="text-ink-400">High priority content is always kept up-to-date</Label>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    <Badge variant="solid">Safety Documents</Badge>
                    <Badge variant="solid">Emergency Procedures</Badge>
                    <Badge variant="outline">+ Add Category</Badge>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          )}

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push('/knowledge')}>Back to Knowledge Base</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedPackage} onClose={() => setSelectedPackage(null)}>
        <ModalHeader><H3>{selectedPackage?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedPackage && (
            <Stack gap={4}>
              <Body className="text-ink-300">{selectedPackage.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Content Items</Label><Label className="font-mono text-white">{selectedPackage.contentCount}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Total Size</Label><Label className="font-mono text-white">{selectedPackage.totalSize}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Last Updated</Label><Label className="text-white">{selectedPackage.lastUpdated}</Label></Stack>
              {selectedPackage.downloaded && (
                <Stack gap={2}>
                  <Label className="text-ink-400">Download Status</Label>
                  <ProgressBar value={100} className="h-2" />
                  <Label size="xs" className="text-success-400">Fully downloaded and synced</Label>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPackage(null)}>Close</Button>
          {selectedPackage?.downloaded ? (
            <Button variant="outline">Remove Download</Button>
          ) : (
            <Button variant="solid">Download Package</Button>
          )}
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
