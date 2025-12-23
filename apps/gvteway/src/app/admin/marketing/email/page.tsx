'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
  Kicker, Spinner,
} from '@ghxstship/ui';
import {
  Mail, Send, CheckCircle, MousePointer,
  Eye, Trash2, Pause,
} from 'lucide-react';
import { useEmailCampaignsData, type EmailCampaign } from '@/hooks/useEmailCampaigns';

function EmailMarketingPageContent() {
  const router = useRouter();
  
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'campaigns',
    validTabs: ['campaigns', 'templates', 'analytics'],
  });
  
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  
  const {
    campaigns,
    isLoading,
    error,
    createCampaign,
    isCreating,
    deleteCampaign,
    sendCampaign,
    refetch,
  } = useEmailCampaignsData({ status: statusFilter, campaign_type: typeFilter });

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    preview_text: '',
    from_name: '',
    from_email: '',
    campaign_type: 'one_time' as EmailCampaign['campaign_type'],
    audience_type: 'all' as EmailCampaign['audience_type'],
    html_content: '',
  });

  const totalSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + (c.stats?.delivered || 0), 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.stats?.opened || 0), 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + (c.stats?.clicked || 0), 0);
  const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0';
  const clickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0';

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      sent: 'solid',
      sending: 'outline',
      scheduled: 'outline',
      draft: 'ghost',
      paused: 'outline',
      cancelled: 'ghost',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status.toUpperCase()}</Badge>;
  };

  const handleCreate = async () => {
    try {
      await createCampaign(formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        subject: '',
        preview_text: '',
        from_name: '',
        from_email: '',
        campaign_type: 'one_time',
        audience_type: 'all',
        html_content: '',
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleSend = async (id: string) => {
    if (confirm('Are you sure you want to send this campaign?')) {
      try {
        await sendCampaign(id);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <Body className="text-muted">Loading email campaigns...</Body>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Alert variant="error">
          <Body>Failed to load campaigns: {error instanceof Error ? error.message : 'Unknown error'}</Body>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </Alert>
      </>
    );
  }

  return (
    <>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Marketing</Kicker>
          <H2 size="lg" className="text-white">Email Campaigns</H2>
          <Body className="text-on-dark-muted">Create and manage email marketing campaigns</Body>
        </Stack>

        <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Sent" value={totalSent.toLocaleString()} inverted />
          <StatCard label="Open Rate" value={`${openRate}%`} inverted />
          <StatCard label="Click Rate" value={`${clickRate}%`} inverted />
          <StatCard label="Active Campaigns" value={campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length.toString()} inverted />
        </Grid>

        <Tabs>
          <TabsList>
            <Tab active={isActive('campaigns')} onClick={() => setActiveTab('campaigns')}>Campaigns</Tab>
            <Tab active={isActive('templates')} onClick={() => setActiveTab('templates')}>Templates</Tab>
            <Tab active={isActive('analytics')} onClick={() => setActiveTab('analytics')}>Analytics</Tab>
          </TabsList>

          <TabPanel active={isActive('campaigns')}>
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-center">
                <Stack direction="horizontal" gap={4}>
                  <Input type="search" placeholder="Search campaigns..." className="w-64" inverted />
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    inverted
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sending">Sending</option>
                    <option value="sent">Sent</option>
                    <option value="paused">Paused</option>
                  </Select>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    inverted
                  >
                    <option value="">All Types</option>
                    <option value="one_time">One-Time</option>
                    <option value="automated">Automated</option>
                    <option value="drip">Drip</option>
                    <option value="triggered">Triggered</option>
                  </Select>
                </Stack>
                <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Stack>

              {campaigns.length === 0 ? (
                <Card inverted className="p-12 text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-on-dark-muted" />
                  <H3 className="text-white mb-2">No Campaigns Yet</H3>
                  <Body className="text-on-dark-muted mb-4">Create your first email campaign to engage your audience</Body>
                  <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>
                    Create Campaign
                  </Button>
                </Card>
              ) : (
                <Card inverted className="overflow-hidden">
                  <Table variant="dark">
                    <TableHeader>
                      <TableRow className="bg-ink-900">
                        <TableHead className="text-on-dark-muted">Campaign</TableHead>
                        <TableHead className="text-on-dark-muted">Status</TableHead>
                        <TableHead className="text-on-dark-muted">Type</TableHead>
                        <TableHead className="text-on-dark-muted">Sent</TableHead>
                        <TableHead className="text-on-dark-muted">Opened</TableHead>
                        <TableHead className="text-on-dark-muted">Clicked</TableHead>
                        <TableHead className="text-on-dark-muted">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id} className="border-b border-ink-700">
                          <TableCell>
                            <Stack gap={1}>
                              <Body className="font-display text-white">{campaign.name}</Body>
                              <Label size="xs" className="text-on-dark-muted">{campaign.subject}</Label>
                            </Stack>
                          </TableCell>
                          <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{campaign.campaign_type.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>
                            <Label className="font-mono text-white">{(campaign.stats?.sent || 0).toLocaleString()}</Label>
                          </TableCell>
                          <TableCell>
                            <Stack gap={0}>
                              <Label className="font-mono text-white">{(campaign.stats?.opened || 0).toLocaleString()}</Label>
                              {(campaign.stats?.delivered || 0) > 0 && (
                                <Label size="xs" className="text-on-dark-disabled">
                                  {((campaign.stats!.opened / campaign.stats!.delivered) * 100).toFixed(1)}%
                                </Label>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack gap={0}>
                              <Label className="font-mono text-white">{(campaign.stats?.clicked || 0).toLocaleString()}</Label>
                              {(campaign.stats?.opened || 0) > 0 && (
                                <Label size="xs" className="text-on-dark-disabled">
                                  {((campaign.stats!.clicked / campaign.stats!.opened) * 100).toFixed(1)}%
                                </Label>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="horizontal" gap={2}>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(campaign)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {campaign.status === 'draft' && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => handleSend(campaign.id)}>
                                    <Send className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(campaign.id)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              {campaign.status === 'scheduled' && (
                                <Button variant="ghost" size="sm">
                                  <Pause className="w-4 h-4" />
                                </Button>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </Stack>
          </TabPanel>

          <TabPanel active={isActive('templates')}>
            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Event Announcement', description: 'Announce new events to your subscribers', category: 'Promotion' },
                { name: 'Early Bird Sale', description: 'Drive early ticket sales with exclusive offers', category: 'Sales' },
                { name: 'Event Reminder', description: 'Remind attendees about upcoming events', category: 'Transactional' },
                { name: 'Post-Event Thank You', description: 'Thank attendees and share highlights', category: 'Follow-up' },
                { name: 'VIP Upgrade Offer', description: 'Encourage ticket upgrades', category: 'Upsell' },
                { name: 'Newsletter', description: 'Regular updates and content', category: 'Newsletter' },
              ].map((template, idx) => (
                <Card key={idx} inverted interactive className="cursor-pointer">
                  <Stack gap={3}>
                    <Badge variant="outline">{template.category}</Badge>
                    <Body className="font-display text-white">{template.name}</Body>
                    <Body size="sm" className="text-on-dark-muted">{template.description}</Body>
                    <Button variant="outline" size="sm">Use Template</Button>
                  </Stack>
                </Card>
              ))}
              <Card inverted interactive className="flex cursor-pointer items-center justify-center border-2 border-dashed border-ink-700 min-h-[150px]">
                <Stack gap={2} className="text-center">
                  <Mail className="w-8 h-8 mx-auto text-on-dark-muted" />
                  <Label className="text-on-dark-muted">+ Create Template</Label>
                </Stack>
              </Card>
            </Grid>
          </TabPanel>

          <TabPanel active={isActive('analytics')}>
            <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
              <Card inverted className="p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Performance Overview</H3>
                  <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                    <Stack gap={2} className="p-4 border-2 border-ink-700 rounded-card">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Send className="w-4 h-4 text-on-dark-muted" />
                        <Label className="text-on-dark-muted">Emails Sent</Label>
                      </Stack>
                      <Body className="font-mono text-h4-md text-white">{totalSent.toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={2} className="p-4 border-2 border-ink-700 rounded-card">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <CheckCircle className="w-4 h-4 text-on-dark-muted" />
                        <Label className="text-on-dark-muted">Delivered</Label>
                      </Stack>
                      <Body className="font-mono text-h4-md text-white">{totalDelivered.toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={2} className="p-4 border-2 border-ink-700 rounded-card">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Eye className="w-4 h-4 text-on-dark-muted" />
                        <Label className="text-on-dark-muted">Opens</Label>
                      </Stack>
                      <Body className="font-mono text-h4-md text-white">{totalOpened.toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={2} className="p-4 border-2 border-ink-700 rounded-card">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <MousePointer className="w-4 h-4 text-on-dark-muted" />
                        <Label className="text-on-dark-muted">Clicks</Label>
                      </Stack>
                      <Body className="font-mono text-h4-md text-white">{totalClicked.toLocaleString()}</Body>
                    </Stack>
                  </Grid>
                </Stack>
              </Card>
              <Card inverted className="p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Top Performing Campaigns</H3>
                  <Stack gap={3}>
                    {campaigns
                      .filter(c => c.status === 'sent')
                      .sort((a, b) => (b.stats?.opened || 0) - (a.stats?.opened || 0))
                      .slice(0, 5)
                      .map((campaign, idx) => (
                        <Stack key={campaign.id} direction="horizontal" className="items-center justify-between p-3 border-2 border-ink-700 rounded-card">
                          <Stack gap={1}>
                            <Body className="text-white">{campaign.name}</Body>
                            <Label size="xs" className="text-on-dark-muted">
                              {((campaign.stats?.opened || 0) / (campaign.stats?.delivered || 1) * 100).toFixed(1)}% open rate
                            </Label>
                          </Stack>
                          <Badge variant={idx === 0 ? 'solid' : 'outline'}>#{idx + 1}</Badge>
                        </Stack>
                      ))}
                    {campaigns.filter(c => c.status === 'sent').length === 0 && (
                      <Body className="text-on-dark-muted text-center py-4">No sent campaigns yet</Body>
                    )}
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </TabPanel>
        </Tabs>

        <Button variant="outlineInk" onClick={() => router.push('/admin/marketing')}>
          Back to Marketing
        </Button>
      </Stack>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Email Campaign</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={2}>
              <Label>Campaign Name</Label>
              <Input
                placeholder="e.g., Summer Fest Lineup Reveal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Stack>
            <Stack gap={2}>
              <Label>Subject Line</Label>
              <Input
                placeholder="e.g., 🎉 The lineup is here!"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </Stack>
            <Stack gap={2}>
              <Label>Preview Text</Label>
              <Input
                placeholder="Text shown in email preview"
                value={formData.preview_text}
                onChange={(e) => setFormData({ ...formData, preview_text: e.target.value })}
              />
            </Stack>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Stack gap={2}>
                <Label>From Name</Label>
                <Input
                  placeholder="e.g., Summer Fest"
                  value={formData.from_name}
                  onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                />
              </Stack>
              <Stack gap={2}>
                <Label>From Email</Label>
                <Input
                  type="email"
                  placeholder="e.g., hello@example.com"
                  value={formData.from_email}
                  onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                />
              </Stack>
            </Grid>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Stack gap={2}>
                <Label>Campaign Type</Label>
                <Select
                  value={formData.campaign_type}
                  onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value as EmailCampaign['campaign_type'] })}
                >
                  <option value="one_time">One-Time</option>
                  <option value="automated">Automated</option>
                  <option value="drip">Drip</option>
                  <option value="triggered">Triggered</option>
                </Select>
              </Stack>
              <Stack gap={2}>
                <Label>Audience</Label>
                <Select
                  value={formData.audience_type}
                  onChange={(e) => setFormData({ ...formData, audience_type: e.target.value as EmailCampaign['audience_type'] })}
                >
                  <option value="all">All Subscribers</option>
                  <option value="segment">Segment</option>
                  <option value="list">List</option>
                  <option value="manual">Manual</option>
                </Select>
              </Stack>
            </Grid>
            <Stack gap={2}>
              <Label>Email Content (HTML)</Label>
              <Textarea
                placeholder="Enter HTML content..."
                rows={6}
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
              />
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="outline" onClick={handleCreate} disabled={isCreating}>Save Draft</Button>
          <Button variant="solid" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create & Schedule'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedCampaign} onClose={() => setSelectedCampaign(null)}>
        <ModalHeader><H3>Campaign Details</H3></ModalHeader>
        <ModalBody>
          {selectedCampaign && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Body className="font-display text-h4-md">{selectedCampaign.name}</Body>
                <Label className="text-ink-500">{selectedCampaign.subject}</Label>
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Status</Label>
                  {getStatusBadge(selectedCampaign.status)}
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Type</Label>
                  <Badge variant="outline">{selectedCampaign.campaign_type}</Badge>
                </Stack>
              </Grid>
              <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Sent</Label>
                  <Label className="font-mono">{(selectedCampaign.stats?.sent || 0).toLocaleString()}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Opened</Label>
                  <Label className="font-mono">{(selectedCampaign.stats?.opened || 0).toLocaleString()}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Clicked</Label>
                  <Label className="font-mono">{(selectedCampaign.stats?.clicked || 0).toLocaleString()}</Label>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">From</Label>
                <Body>{selectedCampaign.from_name} &lt;{selectedCampaign.from_email}&gt;</Body>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCampaign(null)}>Close</Button>
          {selectedCampaign?.status === 'draft' && (
            <Button variant="solid" onClick={() => handleSend(selectedCampaign.id)}>
              <Send className="w-4 h-4 mr-2" />
              Send Campaign
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function EmailMarketingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <EmailMarketingPageContent />
    </Suspense>
  );
}
