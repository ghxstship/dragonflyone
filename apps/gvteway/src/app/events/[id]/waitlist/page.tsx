'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  Form,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Kicker,
} from '@ghxstship/ui';

interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  ticket_type: string;
  quantity: number;
  position: number;
  status: 'waiting' | 'notified' | 'converted' | 'expired';
  created_at: string;
  notified_at?: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: string;
}

export default function WaitlistPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    ticket_type: 'GA',
    quantity: '1',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventRes, waitlistRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/waitlist`),
      ]);

      if (eventRes.ok) {
        const eventData = await eventRes.json();
        setEvent(eventData.event);
      }

      if (waitlistRes.ok) {
        const waitlistData = await waitlistRes.json();
        setWaitlist(waitlistData.waitlist || []);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoinWaitlist = async () => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/events/${eventId}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          ticket_type: formData.ticket_type,
          quantity: parseInt(formData.quantity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`You have been added to the waitlist at position #${data.position}`);
        setFormData({ email: '', name: '', ticket_type: 'GA', quantity: '1' });
        fetchData();
      } else {
        setError(data.error || 'Failed to join waitlist');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge>Waiting</Badge>;
      case 'notified':
        return <Badge>Notified</Badge>;
      case 'converted':
        return <Badge>Converted</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Events">
        <FooterLink href="/events">Events</FooterLink>
      </FooterColumn>
      <FooterColumn title="Legal">
        <FooterLink href="/legal/privacy">Privacy</FooterLink>
        <FooterLink href="/legal/terms">Terms</FooterLink>
      </FooterColumn>
    </Footer>
  );

  if (loading) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
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
              <Kicker colorScheme="on-dark">Events</Kicker>
              <H2 size="lg" className="text-white">Waitlist</H2>
              {event && (
                <Body className="text-on-dark-muted">
                  {event.title} - {event.date}
                </Body>
              )}
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <Grid cols={2} gap={8}>
          <Stack gap={6}>
            <Card className="p-6">
              <H2 className="mb-6">JOIN THE WAITLIST</H2>
              <Body className="text-ink-600 mb-6">
                This event is currently sold out. Join the waitlist to be notified 
                when tickets become available.
              </Body>

              <Form onSubmit={handleJoinWaitlist}>
                <Stack gap={4}>
                  <Field label="Email Address" required>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </Field>

                  <Field label="Full Name" required>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </Field>

                  <Grid cols={2} gap={4}>
                    <Field label="Ticket Type">
                      <Input
                        value={formData.ticket_type}
                        onChange={(e) => setFormData({ ...formData, ticket_type: e.target.value })}
                        placeholder="GA"
                      />
                    </Field>

                    <Field label="Quantity">
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </Field>
                  </Grid>

                  <Button
                    type="submit"
                    variant="solid"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'Joining...' : 'JOIN WAITLIST'}
                  </Button>
                </Stack>
              </Form>
            </Card>

            <Card className="p-6 bg-ink-50">
              <H3 className="mb-4">HOW IT WORKS</H3>
              <Stack gap={3}>
                <Stack direction="horizontal" gap={3} className="items-start">
                  <Stack className="w-8 h-8 bg-black text-white rounded-full items-center justify-center flex-shrink-0">
                    <Body>1</Body>
                  </Stack>
                  <Body className="text-body-sm text-ink-600">
                    Join the waitlist with your email and ticket preferences
                  </Body>
                </Stack>
                <Stack direction="horizontal" gap={3} className="items-start">
                  <Stack className="w-8 h-8 bg-black text-white rounded-full items-center justify-center flex-shrink-0">
                    <Body>2</Body>
                  </Stack>
                  <Body className="text-body-sm text-ink-600">
                    When tickets become available, you will be notified by email
                  </Body>
                </Stack>
                <Stack direction="horizontal" gap={3} className="items-start">
                  <Stack className="w-8 h-8 bg-black text-white rounded-full items-center justify-center flex-shrink-0">
                    <Body>3</Body>
                  </Stack>
                  <Body className="text-body-sm text-ink-600">
                    Complete your purchase within 24 hours to secure your tickets
                  </Body>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          <Stack gap={6}>
            <Card className="p-6">
              <Stack direction="horizontal" className="justify-between items-center mb-6">
                <H2>WAITLIST STATUS</H2>
                <Badge>{waitlist.filter(w => w.status === 'waiting').length} waiting</Badge>
              </Stack>

              {waitlist.length > 0 ? (
                <Stack gap={3}>
                  {waitlist.slice(0, 10).map((entry, index) => (
                    <Stack
                      key={entry.id}
                      direction="horizontal"
                      className="justify-between items-center py-3 border-b border-ink-200"
                    >
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Stack className="w-8 h-8 bg-ink-100 rounded-full items-center justify-center">
                          <Label>#{entry.position}</Label>
                        </Stack>
                        <Stack>
                          <Body className="font-medium">{entry.name}</Body>
                          <Body className="text-body-sm text-ink-500">
                            {entry.ticket_type} x {entry.quantity}
                          </Body>
                        </Stack>
                      </Stack>
                      {getStatusBadge(entry.status)}
                    </Stack>
                  ))}
                  {waitlist.length > 10 && (
                    <Body className="text-center text-ink-500 text-body-sm">
                      +{waitlist.length - 10} more in waitlist
                    </Body>
                  )}
                </Stack>
              ) : (
                <Stack className="items-center py-8">
                  <Body className="text-ink-500">No one on the waitlist yet.</Body>
                  <Body className="text-ink-600 text-body-sm">Be the first to join!</Body>
                </Stack>
              )}
            </Card>

            <Card className="p-6">
              <H3 className="mb-4">BACK TO EVENT</H3>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/events/${eventId}`)}
              >
                View Event Details
              </Button>
            </Card>
          </Stack>
        </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
