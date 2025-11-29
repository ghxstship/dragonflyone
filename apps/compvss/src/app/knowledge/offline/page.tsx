'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CompvssAppLayout } from '../../../components/app-layout';
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ProgressBar,
  Alert,
  EnterprisePageHeader,
  MainContent,
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
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Offline Access"
        subtitle="Download content for mobile-optimized offline access"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Knowledge', href: '/knowledge' }, { label: 'Offline' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard label="Synced Content" value={syncedCount.toString()} />
              <StatCard label="Needs Update" value={outdatedCount.toString()} trend={outdatedCount > 0 ? 'down' : 'neutral'} />
              <StatCard label="Downloaded" value={totalSize} />
              <StatCard label="Packages" value={`${downloadedPackages}/${mockPackages.length}`} />
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
              <Button variant="outline" onClick={() => setSyncing(true)}>
                {syncing ? 'Syncing...' : 'Sync All'}
              </Button>
            </Stack>

            {activeTab === 'content' && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Last Synced</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockContent.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell><Body>{content.title}</Body></TableCell>
                      <TableCell><Badge variant="outline">{content.category}</Badge></TableCell>
                      <TableCell><Body className="font-mono text-body-sm">{content.size}</Body></TableCell>
                      <TableCell><Badge variant="outline">{content.priority}</Badge></TableCell>
                      <TableCell><Body className="text-body-sm">{content.lastSynced}</Body></TableCell>
                      <TableCell><Badge variant={content.status === 'Synced' ? 'solid' : 'outline'}>{content.status}</Badge></TableCell>
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
                  <Card key={pkg.id}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display">{pkg.name}</Body>
                          <Body className="text-body-sm">{pkg.description}</Body>
                        </Stack>
                        <Badge variant={pkg.downloaded ? 'solid' : 'outline'}>{pkg.downloaded ? 'Downloaded' : 'Available'}</Badge>
                      </Stack>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Content Items</Body>
                          <Body className="font-mono">{pkg.contentCount}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Size</Body>
                          <Body className="font-mono">{pkg.totalSize}</Body>
                        </Stack>
                      </Grid>
                      <Body className="text-body-sm">Updated: {pkg.lastUpdated}</Body>
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
                <Card>
                  <Stack gap={4}>
                    <H3>Sync Settings</H3>
                    <Grid cols={2} gap={4}>
                      <Stack gap={2}>
                        <Body>Auto-Sync</Body>
                        <Select>
                          <option value="wifi">On WiFi Only</option>
                          <option value="always">Always</option>
                          <option value="manual">Manual Only</option>
                        </Select>
                      </Stack>
                      <Stack gap={2}>
                        <Body>Sync Frequency</Body>
                        <Select>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="startup">On App Startup</option>
                        </Select>
                      </Stack>
                    </Grid>
                  </Stack>
                </Card>
                <Card>
                  <Stack gap={4}>
                    <H3>Storage</H3>
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-body-sm">Used Space</Body>
                        <Body className="font-mono">{totalSize}</Body>
                      </Stack>
                      <ProgressBar value={35} />
                      <Body className="text-body-sm">35% of available offline storage used</Body>
                    </Stack>
                    <Stack gap={2}>
                      <Body>Storage Limit</Body>
                      <Select>
                        <option value="500">500 MB</option>
                        <option value="1000">1 GB</option>
                        <option value="2000">2 GB</option>
                        <option value="unlimited">Unlimited</option>
                      </Select>
                    </Stack>
                    <Button variant="outline" size="sm">Clear All Offline Data</Button>
                  </Stack>
                </Card>
                <Card>
                  <Stack gap={4}>
                    <H3>Priority Content</H3>
                    <Body className="text-body-sm">High priority content is always kept up-to-date</Body>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      <Badge variant="solid">Safety Documents</Badge>
                      <Badge variant="solid">Emergency Procedures</Badge>
                      <Badge variant="outline">+ Add Category</Badge>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            )}

            <Button variant="outline" onClick={() => router.push('/knowledge')}>Back to Knowledge Base</Button>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedPackage} onClose={() => setSelectedPackage(null)}>
        <ModalHeader><H3>{selectedPackage?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedPackage && (
            <Stack gap={4}>
              <Body>{selectedPackage.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body className="text-body-sm">Content Items</Body><Body className="font-mono">{selectedPackage.contentCount}</Body></Stack>
                <Stack gap={1}><Body className="text-body-sm">Total Size</Body><Body className="font-mono">{selectedPackage.totalSize}</Body></Stack>
              </Grid>
              <Stack gap={1}><Body className="text-body-sm">Last Updated</Body><Body>{selectedPackage.lastUpdated}</Body></Stack>
              {selectedPackage.downloaded && (
                <Stack gap={2}>
                  <Body className="text-body-sm">Download Status</Body>
                  <ProgressBar value={100} />
                  <Body className="text-body-sm">Fully downloaded and synced</Body>
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
    </CompvssAppLayout>
  );
}
