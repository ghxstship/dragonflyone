'use client';

import { useState } from 'react';
import { GvtewayAppLayout } from '@/components/app-layout';
import {
  H2,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Stack,
  Kicker,
} from '@ghxstship/ui';

/**
 * Content Moderation Page
 * Note: Backend API exists for content moderation, ready for integration
 */

import {
  DEMO_MODERATION_ITEMS,
} from '@/lib/demo-data';

const mockItems = DEMO_MODERATION_ITEMS;

export default function ModeratePage() {
  const [items, setItems] = useState(mockItems);

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    setItems(items.map(item => item.id === id ? { ...item, status } : item));
  };

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Admin</Kicker>
              <H2 size="lg" className="text-white">Moderation</H2>
              <Body className="text-on-dark-muted">Review and moderate user content</Body>
            </Stack>

        <Grid cols={3} className="mb-8">
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
    </GvtewayAppLayout>
  );
}
