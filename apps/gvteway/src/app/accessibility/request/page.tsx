'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Switch,
  Alert,
  LoadingSpinner,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'denied':
        return <Badge className="bg-red-500 text-white">Denied</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500 text-white">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>Accessibility Services</H1>
          <Body className="text-grey-600">
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
            <Card className="p-6">
              <H2 className="mb-6">REQUEST SERVICES</H2>
              <form onSubmit={handleSubmit}>
                <Stack gap={6}>
                  <Stack gap={4}>
                    <H3>SELECT SERVICES NEEDED</H3>
                    <Grid cols={2} gap={3}>
                      {SERVICE_TYPES.map(service => (
                        <Card
                          key={service.id}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedServices.includes(service.id)
                              ? 'bg-black text-white'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => toggleService(service.id)}
                        >
                          <Stack gap={1}>
                            <Body className={`font-medium ${
                              selectedServices.includes(service.id) ? 'text-white' : ''
                            }`}>
                              {service.label}
                            </Body>
                            <Body className={`text-sm ${
                              selectedServices.includes(service.id) ? 'text-gray-300' : 'text-gray-500'
                            }`}>
                              {service.description}
                            </Body>
                          </Stack>
                        </Card>
                      ))}
                    </Grid>
                  </Stack>

                  <Field label="Additional Notes">
                    <Textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Please provide any additional details about your needs..."
                      rows={4}
                    />
                  </Field>

                  <Grid cols={2} gap={4}>
                    <Field label="Contact Phone">
                      <Input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </Field>

                    <Field label="Emergency Contact (Optional)">
                      <Input
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        placeholder="Name and phone number"
                      />
                    </Field>
                  </Grid>

                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Switch
                      checked={savePreferences}
                      onChange={(e) => setSavePreferences(e.target.checked)}
                    />
                    <Label>Save these preferences for future events</Label>
                  </Stack>

                  <Button type="submit" variant="solid" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </Stack>
              </form>
            </Card>
          </Stack>

          <Stack gap={6}>
            <Card className="p-6">
              <H3 className="mb-4">YOUR REQUESTS</H3>
              {requests.length > 0 ? (
                <Stack gap={3}>
                  {requests.map(request => (
                    <Card key={request.id} className="p-3">
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="justify-between items-start">
                          <Body className="font-medium text-sm">{request.event_title}</Body>
                          {getStatusBadge(request.status)}
                        </Stack>
                        <Body className="text-xs text-gray-500">{request.event_date}</Body>
                        <Body className="text-xs text-gray-600">{request.request_type}</Body>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Body className="text-gray-500 text-sm">No previous requests</Body>
              )}
            </Card>

            <Card className="p-6 bg-gray-50">
              <H3 className="mb-4">NEED HELP?</H3>
              <Body className="text-sm text-gray-600 mb-4">
                Our accessibility team is here to assist you.
              </Body>
              <Stack gap={2}>
                <Body className="text-sm">
                  <strong>Phone:</strong> 1-800-555-0123
                </Body>
                <Body className="text-sm">
                  <strong>Email:</strong> accessibility@ghxstship.com
                </Body>
                <Body className="text-sm">
                  <strong>TTY:</strong> 1-800-555-0124
                </Body>
              </Stack>
            </Card>
          </Stack>
        </Grid>
        </Stack>
      </Container>
    </Section>
  );
}

export default function AccessibilityRequestPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </Container>
      </Section>
    }>
      <AccessibilityRequestContent />
    </Suspense>
  );
}
