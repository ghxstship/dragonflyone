'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Grid,
  Stack,
  Badge,
  Switch,
  Alert,
  LoadingSpinner,
  Form,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
} from '@ghxstship/ui';

interface AccessibilityRequest {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  request_type: string;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  notes?: string;
  created_at: string;
}

const SERVICE_TYPES = [
  { id: 'wheelchair', label: 'Wheelchair Accessible Seating', description: 'Reserved accessible seating area' },
  { id: 'companion', label: 'Companion Seating', description: 'Adjacent seating for a companion or aide' },
  { id: 'asl', label: 'ASL Interpreter', description: 'American Sign Language interpretation' },
  { id: 'captioning', label: 'Closed Captioning', description: 'Real-time captioning services' },
  { id: 'audio_description', label: 'Audio Description', description: 'Descriptive audio for visual elements' },
  { id: 'assistive_listening', label: 'Assistive Listening Device', description: 'Personal amplification device' },
  { id: 'service_animal', label: 'Service Animal Accommodation', description: 'Space for service animal' },
  { id: 'mobility_assistance', label: 'Mobility Assistance', description: 'Help with venue navigation' },
  { id: 'sensory_kit', label: 'Sensory Kit', description: 'Noise-canceling headphones, fidget tools' },
  { id: 'other', label: 'Other Accommodation', description: 'Describe your specific needs' },
];

function AccessibilityRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');
  const orderId = searchParams.get('order');

  const [requests, setRequests] = useState<AccessibilityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [savePreferences, setSavePreferences] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/accessibility/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/accessibility/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: eventId,
          order_id: orderId,
          services: selectedServices,
          notes: additionalNotes,
          contact_phone: contactPhone,
          emergency_contact: emergencyContact,
          save_preferences: savePreferences,
        }),
      });

      if (response.ok) {
        setSuccess('Your accessibility request has been submitted. We will contact you within 24 hours.');
        setSelectedServices([]);
        setAdditionalNotes('');
        fetchRequests();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="solid">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'denied':
        return <Badge variant="outline">Denied</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Accessibility">
        <FooterLink href="/accessibility">Accessibility</FooterLink>
        <FooterLink href="/accessibility/request">Request Services</FooterLink>
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
          <LoadingSpinner size="lg" text="Loading..." />
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
              <Kicker colorScheme="on-dark">Accessibility</Kicker>
              <H2 size="lg" className="text-white">Accessibility Services</H2>
              <Body className="text-on-dark-muted">
                Request accommodations for your upcoming events
              </Body>
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

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            <Card inverted className="p-6">
              <H2 className="mb-6 text-white">Request Services</H2>
              <Form onSubmit={handleSubmit}>
                <Stack gap={6}>
                  <Stack gap={4}>
                    <H3 className="text-white">Select Services Needed</H3>
                    <Grid cols={2} gap={3}>
                      {SERVICE_TYPES.map(service => (
                        <Card
                          key={service.id}
                          inverted
                          interactive
                          className={`cursor-pointer p-4 ${
                            selectedServices.includes(service.id)
                              ? 'ring-2 ring-white'
                              : ''
                          }`}
                          onClick={() => toggleService(service.id)}
                        >
                          <Stack gap={1}>
                            <Body className="font-display text-white">
                              {service.label}
                            </Body>
                            <Body size="sm" className="text-on-dark-muted">
                              {service.description}
                            </Body>
                          </Stack>
                        </Card>
                      ))}
                    </Grid>
                  </Stack>

                  <Field label="Additional Notes" inverted>
                    <Textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Please provide any additional details about your needs..."
                      rows={4}
                      inverted
                    />
                  </Field>

                  <Grid cols={2} gap={4}>
                    <Field label="Contact Phone" inverted>
                      <Input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        inverted
                      />
                    </Field>

                    <Field label="Emergency Contact (Optional)" inverted>
                      <Input
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        placeholder="Name and phone number"
                        inverted
                      />
                    </Field>
                  </Grid>

                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Switch
                      checked={savePreferences}
                      onChange={(e) => setSavePreferences(e.target.checked)}
                    />
                    <Label className="text-on-dark-muted">Save these preferences for future events</Label>
                  </Stack>

                  <Button type="submit" variant="solid" inverted disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </Stack>
              </Form>
            </Card>
          </Stack>

          <Stack gap={6}>
            <Card inverted className="p-6">
              <H3 className="mb-4 text-white">Your Requests</H3>
              {requests.length > 0 ? (
                <Stack gap={3}>
                  {requests.map(request => (
                    <Card key={request.id} inverted className="p-3">
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="items-start justify-between">
                          <Body size="sm" className="font-display text-white">{request.event_title}</Body>
                          {getStatusBadge(request.status)}
                        </Stack>
                        <Body size="sm" className="font-mono text-on-dark-disabled">{request.event_date}</Body>
                        <Body size="sm" className="font-mono text-on-dark-muted">{request.request_type}</Body>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Body size="sm" className="text-on-dark-muted">No previous requests</Body>
              )}
            </Card>

            <Card inverted variant="elevated" className="p-6">
              <H3 className="mb-4 text-white">Need Help?</H3>
              <Body size="sm" className="mb-4 text-on-dark-muted">
                Our accessibility team is here to assist you.
              </Body>
              <Stack gap={2}>
                <Body size="sm" className="text-on-dark-muted">
                  <span className="font-display text-white">Phone:</span> 1-800-555-0123
                </Body>
                <Body size="sm" className="text-on-dark-muted">
                  <span className="font-display text-white">Email:</span> accessibility@ghxstship.com
                </Body>
                <Body size="sm" className="text-on-dark-muted">
                  <span className="font-display text-white">TTY:</span> 1-800-555-0124
                </Body>
              </Stack>
            </Card>
          </Stack>
        </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}

export default function AccessibilityRequestPage() {
  const fallbackFooter = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Accessibility">
        <FooterLink href="/accessibility">Accessibility</FooterLink>
      </FooterColumn>
      <FooterColumn title="Legal">
        <FooterLink href="/legal/privacy">Privacy</FooterLink>
        <FooterLink href="/legal/terms">Terms</FooterLink>
      </FooterColumn>
    </Footer>
  );

  return (
    <Suspense fallback={
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={fallbackFooter}>
        <Section background="black" className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </Section>
      </PageLayout>
    }>
      <AccessibilityRequestContent />
    </Suspense>
  );
}
