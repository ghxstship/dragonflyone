'use client';

import { useState } from 'react';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  H2,
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Stack,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
} from '@ghxstship/ui';

/**
 * Content Moderation Page
 * Note: Backend API exists for content moderation, ready for integration
 */

interface ModerationItem {
  id: string;
  type: 'review' | 'comment' | 'report';
  content: string;
  author: string;
  eventId: string;
  eventName: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

const mockItems: ModerationItem[] = [
  { id: '1', type: 'review', content: 'Amazing show! Best experience ever!', author: 'john_doe', eventId: 'e1', eventName: 'Summer Fest', status: 'pending', timestamp: '2024-11-23 10:30' },
  { id: '2', type: 'report', content: 'Inappropriate behavior reported', author: 'moderator', eventId: 'e2', eventName: 'Rock Concert', status: 'pending', timestamp: '2024-11-23 11:15' },
  { id: '3', type: 'comment', content: 'Looking forward to this!', author: 'jane_smith', eventId: 'e1', eventName: 'Summer Fest', status: 'approved', timestamp: '2024-11-23 09:45' },
];

export default function ModeratePage() {
  const [items, setItems] = useState(mockItems);

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    setItems(items.map(item => item.id === id ? { ...item, status } : item));
  };

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Admin">
            <FooterLink href="/moderate">Moderation</FooterLink>
            <FooterLink href="/admin">Dashboard</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
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
              <Grid cols={4} gap={4}>
                <Stack gap={2}>
                  <Badge>{item.type.toUpperCase()}</Badge>
                  <Body size="sm">{item.timestamp}</Body>
                </Stack>
                <Stack gap={2} className="col-span-2">
                  <Body className="font-bold">{item.eventName}</Body>
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
        </Container>
      </Section>
    </PageLayout>
  );
}
