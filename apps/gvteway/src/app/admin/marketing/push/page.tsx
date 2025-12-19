'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout } from '@/components/app-layout';
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
  Kicker, Spinner,
} from '@ghxstship/ui';
import {
  Bell, Send, Eye, Trash2, Smartphone, CheckCircle, MousePointer,
} from 'lucide-react';
import { usePushNotificationsData, type PushNotification } from '@/hooks/usePushNotifications';

function PushNotificationsPageContent() {
  const router = useRouter();
  
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);
  
  const {
    notifications,
    isLoading,
    error,
    createNotification,
    isCreating,
    deleteNotification,
    sendNotification,
    refetch,
  } = usePushNotificationsData({ status: statusFilter });

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    action_url: '',
    action_text: '',
    audience_type: 'all' as PushNotification['audience_type'],
  });

  const totalSent = notifications.reduce((sum, n) => sum + (n.stats?.sent || 0), 0);
  const totalDelivered = notifications.reduce((sum, n) => sum + (n.stats?.delivered || 0), 0);
  const totalOpened = notifications.reduce((sum, n) => sum + (n.stats?.opened || 0), 0);
  const totalClicked = notifications.reduce((sum, n) => sum + (n.stats?.clicked || 0), 0);
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0';
  const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '0';

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      sent: 'solid',
      sending: 'outline',
      scheduled: 'outline',
      draft: 'ghost',
      cancelled: 'ghost',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status.toUpperCase()}</Badge>;
  };

  const handleCreate = async () => {
    try {
      await createNotification(formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        body: '',
        action_url: '',
        action_text: '',
        audience_type: 'all',
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleSend = async (id: string) => {
    if (confirm('Are you sure you want to send this notification?')) {
      try {
        await sendNotification(id);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(id);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  if (isLoading) {
    return (
      <GvtewayAppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4" />
            <Body className="text-muted">Loading push notifications...</Body>
          </div>
        </div>
      </GvtewayAppLayout>
    );
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <Alert variant="error">
          <Body>Failed to load notifications: {error instanceof Error ? error.message : 'Unknown error'}</Body>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </Alert>
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Marketing</Kicker>
          <H2 size="lg" className="text-white">Push Notifications</H2>
          <Body className="text-on-dark-muted">Send targeted push notifications to app users</Body>
        </Stack>

        <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Sent" value={totalSent.toLocaleString()} inverted />
          <StatCard label="Delivery Rate" value={`${deliveryRate}%`} inverted />
          <StatCard label="Open Rate" value={`${openRate}%`} inverted />
          <StatCard label="Click Rate" value={totalOpened > 0 ? `${((totalClicked / totalOpened) * 100).toFixed(1)}%` : '0%'} inverted />
        </Grid>

        <Stack gap={4}>
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack direction="horizontal" gap={4}>
              <Input type="search" placeholder="Search notifications..." className="w-64" inverted />
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
              </Select>
            </Stack>
            <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>
              <Bell className="w-4 h-4 mr-2" />
              Create Notification
            </Button>
          </Stack>

          {notifications.length === 0 ? (
            <Card inverted className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-on-dark-muted" />
              <H3 className="text-white mb-2">No Notifications Yet</H3>
              <Body className="text-on-dark-muted mb-4">Create your first push notification to engage your app users</Body>
              <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>
                Create Notification
              </Button>
            </Card>
          ) : (
            <Card inverted className="overflow-hidden">
              <Table variant="dark">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-on-dark-muted">Notification</TableHead>
                    <TableHead className="text-on-dark-muted">Status</TableHead>
                    <TableHead className="text-on-dark-muted">Audience</TableHead>
                    <TableHead className="text-on-dark-muted">Sent</TableHead>
                    <TableHead className="text-on-dark-muted">Delivered</TableHead>
                    <TableHead className="text-on-dark-muted">Opened</TableHead>
                    <TableHead className="text-on-dark-muted">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id} className="border-b border-ink-700">
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{notification.title}</Body>
                          <Label size="xs" className="text-on-dark-muted line-clamp-1">{notification.body}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{notification.audience_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Label className="font-mono text-white">{(notification.stats?.sent || 0).toLocaleString()}</Label>
                      </TableCell>
                      <TableCell>
                        <Stack gap={0}>
                          <Label className="font-mono text-white">{(notification.stats?.delivered || 0).toLocaleString()}</Label>
                          {(notification.stats?.sent || 0) > 0 && (
                            <Label size="xs" className="text-on-dark-disabled">
                              {((notification.stats!.delivered / notification.stats!.sent) * 100).toFixed(1)}%
                            </Label>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack gap={0}>
                          <Label className="font-mono text-white">{(notification.stats?.opened || 0).toLocaleString()}</Label>
                          {(notification.stats?.delivered || 0) > 0 && (
                            <Label size="xs" className="text-on-dark-disabled">
                              {((notification.stats!.opened / notification.stats!.delivered) * 100).toFixed(1)}%
                            </Label>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedNotification(notification)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {notification.status === 'draft' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleSend(notification.id)}>
                                <Send className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(notification.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
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

        <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card inverted className="p-6">
            <Stack gap={4}>
              <H3 className="text-white">Performance Summary</H3>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={2} className="p-4 border-2 border-ink-700 rounded-card">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Smartphone className="w-4 h-4 text-on-dark-muted" />
                    <Label className="text-on-dark-muted">Delivered</Label>
                  </Stack>
                  <Body className="font-mono text-h4-md text-white">{totalDelivered.toLocaleString()}</Body>
                </Stack>
                <Stack gap={2} className="p-4 border-2 border-ink-700 rounded-card">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <CheckCircle className="w-4 h-4 text-on-dark-muted" />
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
                <Stack gap={2} className="p-4 border-2 border-ink-700 rounded-card">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Bell className="w-4 h-4 text-on-dark-muted" />
                    <Label className="text-on-dark-muted">Active</Label>
                  </Stack>
                  <Body className="font-mono text-h4-md text-white">
                    {notifications.filter(n => n.status === 'sending' || n.status === 'scheduled').length}
                  </Body>
                </Stack>
              </Grid>
            </Stack>
          </Card>
          <Card inverted className="p-6">
            <Stack gap={4}>
              <H3 className="text-white">Quick Templates</H3>
              <Stack gap={3}>
                {[
                  { title: 'Event Reminder', desc: 'Remind users about upcoming events' },
                  { title: 'Flash Sale', desc: 'Announce time-limited offers' },
                  { title: 'Lineup Update', desc: 'Share artist announcements' },
                  { title: 'Gate Opening', desc: 'Notify when doors open' },
                ].map((template, idx) => (
                  <Stack key={idx} direction="horizontal" className="items-center justify-between p-3 border-2 border-ink-700 rounded-card">
                    <Stack gap={0}>
                      <Body className="text-white">{template.title}</Body>
                      <Label size="xs" className="text-on-dark-muted">{template.desc}</Label>
                    </Stack>
                    <Button variant="outline" size="sm">Use</Button>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        <Button variant="outlineInk" onClick={() => router.push('/admin/marketing')}>
          Back to Marketing
        </Button>
      </Stack>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Push Notification</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={2}>
              <Label>Title</Label>
              <Input
                placeholder="e.g., 🎉 Lineup Announced!"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={65}
              />
              <Label size="xs" className="text-ink-500">{formData.title.length}/65 characters</Label>
            </Stack>
            <Stack gap={2}>
              <Label>Body</Label>
              <Textarea
                placeholder="Notification message..."
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                rows={3}
                maxLength={240}
              />
              <Label size="xs" className="text-ink-500">{formData.body.length}/240 characters</Label>
            </Stack>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Stack gap={2}>
                <Label>Action URL (optional)</Label>
                <Input
                  placeholder="e.g., /events/summer-fest"
                  value={formData.action_url}
                  onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                />
              </Stack>
              <Stack gap={2}>
                <Label>Action Text (optional)</Label>
                <Input
                  placeholder="e.g., View Lineup"
                  value={formData.action_text}
                  onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                />
              </Stack>
            </Grid>
            <Stack gap={2}>
              <Label>Audience</Label>
              <Select
                value={formData.audience_type}
                onChange={(e) => setFormData({ ...formData, audience_type: e.target.value as PushNotification['audience_type'] })}
              >
                <option value="all">All Users</option>
                <option value="segment">Segment</option>
                <option value="topic">Topic Subscribers</option>
              </Select>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="outline" onClick={handleCreate} disabled={isCreating}>Save Draft</Button>
          <Button variant="solid" onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create & Send'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedNotification} onClose={() => setSelectedNotification(null)}>
        <ModalHeader><H3>Notification Details</H3></ModalHeader>
        <ModalBody>
          {selectedNotification && (
            <Stack gap={4}>
              <Card className="p-4 border-2 border-ink-200">
                <Stack gap={2}>
                  <Body className="font-display">{selectedNotification.title}</Body>
                  <Body size="sm" className="text-ink-600">{selectedNotification.body}</Body>
                  {selectedNotification.action_text && (
                    <Button variant="outline" size="sm" className="w-fit mt-2">
                      {selectedNotification.action_text}
                    </Button>
                  )}
                </Stack>
              </Card>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Status</Label>
                  {getStatusBadge(selectedNotification.status)}
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Audience</Label>
                  <Badge variant="outline">{selectedNotification.audience_type}</Badge>
                </Stack>
              </Grid>
              <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Sent</Label>
                  <Label className="font-mono">{(selectedNotification.stats?.sent || 0).toLocaleString()}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Delivered</Label>
                  <Label className="font-mono">{(selectedNotification.stats?.delivered || 0).toLocaleString()}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Opened</Label>
                  <Label className="font-mono">{(selectedNotification.stats?.opened || 0).toLocaleString()}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Clicked</Label>
                  <Label className="font-mono">{(selectedNotification.stats?.clicked || 0).toLocaleString()}</Label>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedNotification(null)}>Close</Button>
          {selectedNotification?.status === 'draft' && (
            <Button variant="solid" onClick={() => handleSend(selectedNotification.id)}>
              <Send className="w-4 h-4 mr-2" />
              Send Now
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function PushNotificationsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PushNotificationsPageContent />
    </Suspense>
  );
}
