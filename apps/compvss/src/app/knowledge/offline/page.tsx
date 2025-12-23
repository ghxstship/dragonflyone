'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
// Layout provided by route group
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

import {
  useOfflineContent,
  useOfflinePackages,
  type OfflinePackage,
} from '../../../hooks/useOfflineContent';

export default function OfflineAccessPage() {
  const router = useRouter();
  const { data: offlineContent = [] } = useOfflineContent();
  const { data: packages = [] } = useOfflinePackages();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'content',
    validTabs: ['content', 'packages', 'settings'],
  });
  const [selectedPackage, setSelectedPackage] = useState<OfflinePackage | null>(null);
  const [syncing, setSyncing] = useState(false);

  const syncedCount = offlineContent.filter(c => c.status === 'Synced').length;
  const outdatedCount = offlineContent.filter(c => c.status === 'Outdated').length;
  const totalSize = '186.9 MB';
  const downloadedPackages = packages.filter(p => p.downloaded).length;

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'ghost' => {
    switch (status) {
      case 'Synced': return 'success';
      case 'Pending': return 'warning';
      case 'Outdated': return 'warning';
      case 'Error': return 'error';
      default: return 'ghost';
    }
  };

  return (
    <>
      <EnterprisePageHeader
        title="Offline Access"
        subtitle="Download content for mobile-optimized offline access"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Synced Content" value={syncedCount.toString()} />
              <StatCard label="Needs Update" value={outdatedCount.toString()} trend={outdatedCount > 0 ? 'down' : 'neutral'} />
              <StatCard label="Downloaded" value={totalSize} />
              <StatCard label="Packages" value={`${downloadedPackages}/${packages.length}`} />
            </Grid>

            {outdatedCount > 0 && (
              <Alert variant="warning">{outdatedCount} item(s) have updates available. Sync to get the latest content.</Alert>
            )}

            <Stack direction="horizontal" className="justify-between">
              <Tabs>
                <TabsList>
                  <Tab active={isActive('content')} onClick={() => setActiveTab('content')}>My Content</Tab>
                  <Tab active={isActive('packages')} onClick={() => setActiveTab('packages')}>Packages</Tab>
                  <Tab active={isActive('settings')} onClick={() => setActiveTab('settings')}>Settings</Tab>
                </TabsList>
              </Tabs>
              <Button variant="outline" onClick={() => setSyncing(true)}>
                {syncing ? 'Syncing...' : 'Sync All'}
              </Button>
            </Stack>

            {isActive('content') && (
              <Table variant="dark">
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
                  {offlineContent.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell><Body>{content.title}</Body></TableCell>
                      <TableCell><Badge variant="outline">{content.category}</Badge></TableCell>
                      <TableCell><Body className="font-mono">{content.size}</Body></TableCell>
                      <TableCell><Badge variant="outline">{content.priority}</Badge></TableCell>
                      <TableCell><Body size="sm" className="">{content.lastSynced}</Body></TableCell>
                      <TableCell><Badge variant={getStatusVariant(content.status)}>{content.status}</Badge></TableCell>
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

            {isActive('packages') && (
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                {packages.map((pkg) => (
                  <Card key={pkg.id}>
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display">{pkg.name}</Body>
                          <Body size="sm" className="">{pkg.description}</Body>
                        </Stack>
                        <Badge variant={pkg.downloaded ? 'solid' : 'outline'}>{pkg.downloaded ? 'Downloaded' : 'Available'}</Badge>
                      </Stack>
                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Stack gap={1}>
                          <Body size="sm" className="">Content Items</Body>
                          <Body className="font-mono">{pkg.contentCount}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className="">Size</Body>
                          <Body className="font-mono">{pkg.totalSize}</Body>
                        </Stack>
                      </Grid>
                      <Body size="sm" className="">Updated: {pkg.lastUpdated}</Body>
                      <Button variant={pkg.downloaded ? 'outline' : 'solid'} size="sm" onClick={() => setSelectedPackage(pkg)}>
                        {pkg.downloaded ? 'Manage' : 'Download'}
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            )}

            {isActive('settings') && (
              <Stack gap={4}>
                <Card>
                  <Stack gap={4}>
                    <H3>Sync Settings</H3>
                    <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
                        <Body size="sm" className="">Used Space</Body>
                        <Body className="font-mono">{totalSize}</Body>
                      </Stack>
                      <ProgressBar value={35} />
                      <Body size="sm" className="">35% of available offline storage used</Body>
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
                    <Body size="sm" className="">High priority content is always kept up-to-date</Body>
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
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Content Items</Body><Body className="font-mono">{selectedPackage.contentCount}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Total Size</Body><Body className="font-mono">{selectedPackage.totalSize}</Body></Stack>
              </Grid>
              <Stack gap={1}><Body size="sm" className="">Last Updated</Body><Body>{selectedPackage.lastUpdated}</Body></Stack>
              {selectedPackage.downloaded && (
                <Stack gap={2}>
                  <Body size="sm" className="">Download Status</Body>
                  <ProgressBar value={100} />
                  <Body size="sm" className="">Fully downloaded and synced</Body>
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
    </>
  );
}
