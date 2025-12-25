'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H2,
  Input,
  MainContent,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Webhook, Trash2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWebhooks, useDeleteWebhook, useTestWebhook } from '@/hooks/useWebhooks';


const EVENT_TYPES = [
  'booking.created',
  'booking.updated',
  'booking.cancelled',
  'invoice.created',
  'invoice.paid',
  'payment.received',
  'vendor_order.created',
  'vendor_order.approved',
];

export default function WebhooksPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useWebhooks('current', true);
  const deleteMutation = useDeleteWebhook();
  const testMutation = useTestWebhook();

  const filteredWebhooks = data?.webhooks?.filter((webhook) => {
    return (
      !searchQuery ||
      webhook.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.url?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete webhook "${name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleTest = async (id: string) => {
    await testMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Webhooks" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Skeleton className="h-12" />
              <Skeleton className="h-48" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Webhooks" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load webhooks"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Webhooks"
        subtitle="Configure outgoing webhooks to integrate with external systems"
        primaryAction={{ label: 'New Webhook', onClick: () => router.push('/webhooks/new') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Box className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search webhooks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </Box>

            {(!filteredWebhooks || filteredWebhooks.length === 0) ? (
              <EmptyState
                title="No webhooks configured"
                description="Create webhooks to send data to external systems when events occur."
                icon={<Webhook className="h-12 w-12" />}
                action={{ label: 'Create First Webhook', onClick: () => router.push('/webhooks/new') }}
              />
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Webhook</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Triggered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWebhooks.map((webhook) => {
                      const isActive = webhook.is_active;
                      const hasFailed = webhook.failure_count > 0;
                      return (
                        <TableRow key={webhook.id}>
                          <TableCell>
                            <Stack gap={0}>
                              <Body className="font-weight-medium">{webhook.name}</Body>
                              <Body size="xs" className="text-muted-foreground truncate max-w-xs">
                                {webhook.url}
                              </Body>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="horizontal" gap={1} className="flex-wrap">
                              {webhook.events?.slice(0, 2).map((event) => (
                                <Badge key={event} variant="ghost">{event}</Badge>
                              ))}
                              {webhook.events && webhook.events.length > 2 && (
                                <Badge variant="ghost">+{webhook.events.length - 2} more</Badge>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={isActive ? (hasFailed ? 'warning' : 'success') : 'ghost'}
                              className="inline-flex items-center gap-1.5"
                            >
                              {isActive ? (hasFailed ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />) : <XCircle className="h-3 w-3" />}
                              {isActive ? (hasFailed ? 'Failing' : 'Active') : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Text size="sm" className="text-muted-foreground">
                              {webhook.last_triggered_at
                                ? new Date(webhook.last_triggered_at).toLocaleString()
                                : 'Never'}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Stack direction="horizontal" gap={2} className="justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTest(webhook.id)}
                                disabled={testMutation.isPending}
                                title="Test webhook"
                              >
                                <RefreshCw className={`h-4 w-4 ${testMutation.isPending ? 'animate-spin' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(webhook.id, webhook.name)}
                                disabled={deleteMutation.isPending}
                                className="text-destructive hover:bg-destructive/10"
                                title="Delete webhook"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}

            <Card className="p-6">
              <H2 className="mb-4">Supported Events</H2>
              <Grid cols={4} gap={2}>
                {EVENT_TYPES.map((event) => (
                  <Badge key={event} variant="outline" className="justify-center py-2">
                    {event}
                  </Badge>
                ))}
              </Grid>
            </Card>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
