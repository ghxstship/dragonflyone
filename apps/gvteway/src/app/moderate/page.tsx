'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Layout provided by route group
import {
  H2,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Stack,
  Kicker,
  Skeleton,
  EmptyState,
} from '@ghxstship/ui';

import {
  DEMO_MODERATION_ITEMS,
} from '@/lib/demo-data';

interface ModerationItem {
  id: string;
  type: string;
  content: string;
  author: string;
  eventName: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

async function fetchModerationItems(): Promise<ModerationItem[]> {
  const response = await fetch('/api/admin/moderation');
  if (!response.ok) throw new Error('Failed to fetch moderation items');
  return response.json();
}

export default function ModeratePage() {
  const queryClient = useQueryClient();
  
  const { data: apiItems, isLoading, error } = useQuery({
    queryKey: ['moderation-items'],
    queryFn: fetchModerationItems,
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      const response = await fetch(`/api/admin/moderation/${id}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to moderate item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-items'] });
    },
  });

  // Use API data or fall back to demo data
  const items: ModerationItem[] = apiItems || DEMO_MODERATION_ITEMS;

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    moderateMutation.mutate({ id, action: status === 'approved' ? 'approve' : 'reject' });
  };

  if (isLoading) {
    return (
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Admin</Kicker>
          <H2 size="lg" className="text-white">Moderation</H2>
          <Body className="text-on-dark-muted">Loading moderation items...</Body>
        </Stack>
        <Grid cols={3} gap={4}>
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </Grid>
      </Stack>
    );
  }

  if (error && !apiItems) {
    return (
      <Stack gap={10}>
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Admin</Kicker>
          <H2 size="lg" className="text-white">Moderation</H2>
        </Stack>
        <EmptyState
          title="Error Loading Items"
          description={error instanceof Error ? error.message : 'Failed to load moderation items'}
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
          inverted
        />
      </Stack>
    );
  }

  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Admin</Kicker>
              <H2 size="lg" className="text-white">Moderation</H2>
              <Body className="text-on-dark-muted">Review and moderate user content</Body>
            </Stack>

        <Grid cols={3} gap={4} className="mb-8">
          <Card className="p-6 text-center">
            <H2>{items.filter(i => i.status === 'pending').length}</H2>
            <Body>Pending Review</Body>
          </Card>
          <Card className="p-6 text-center">
            <H2>{items.filter(i => i.status === 'approved').length}</H2>
            <Body>Approved</Body>
          </Card>
          <Card className="p-6 text-center">
            <H2>{items.filter(i => i.status === 'rejected').length}</H2>
            <Body>Rejected</Body>
          </Card>
        </Grid>

        <Stack gap={4}>
          {items.map(item => (
            <Card key={item.id} className="p-6">
              <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                <Stack gap={2}>
                  <Badge>{item.type.toUpperCase()}</Badge>
                  <Body size="sm">{item.timestamp}</Body>
                </Stack>
                <Stack gap={2} className="col-span-2">
                  <Body className="font-weight-bold">{item.eventName}</Body>
                  <Body size="sm">By: {item.author}</Body>
                  <Body>{item.content}</Body>
                </Stack>
                <Stack direction="horizontal" gap={2} className="items-center justify-end">
                  {item.status === 'pending' ? (
                    <>
                      <Button
                        variant="solid"
                        size="sm"
                        onClick={() => handleAction(item.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(item.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Badge>{item.status.toUpperCase()}</Badge>
                  )}
                </Stack>
              </Grid>
            </Card>
          ))}
        </Stack>
          </Stack>
    </>
  );
}
