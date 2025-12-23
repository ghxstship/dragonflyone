'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  PhoneInput,
  Textarea,
  Grid,
  Stack,
  Badge,
  Switch,
  Alert,
  Form,
  Kicker,
} from '@ghxstship/ui';
import { useAccessibilityRequestsData } from '@/hooks/useAccessibilityRequests';

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
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');
  const orderId = searchParams.get('order');

  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [savePreferences, setSavePreferences] = useState(true);

  const {
    requests,
    isLoading: loading,
    error,
    submitRequest,
    isSubmitting: submitting,
  } = useAccessibilityRequestsData();

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      setLocalError('Please select at least one service');
      return;
    }

    setLocalError(null);

    try {
      await submitRequest({
        event_id: eventId || undefined,
        order_id: orderId || undefined,
        services: selectedServices,
        notes: additionalNotes,
        contact_phone: contactPhone,
        emergency_contact: emergencyContact,
        save_preferences: savePreferences,
      });
      setSuccess('Your accessibility request has been submitted. We will contact you within 24 hours.');
      setSelectedServices([]);
      setAdditionalNotes('');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to submit request');
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

  if (loading) {
    return <GvtewayLoadingLayout />;
  }

  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Accessibility</Kicker>
              <H2 size="lg" className="text-white">Accessibility Services</H2>
              <Body className="text-on-dark-muted">
                Request accommodations for your upcoming events
              </Body>
            </Stack>

        {(error || localError) && (
          <Alert variant="error" className="mb-6">
            {localError || (error instanceof Error ? error.message : String(error))}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <Grid cols={3} gap={8} className="sm:grid-cols-2 lg:grid-cols-3">
          <Stack className="col-span-2" gap={6}>
            <Card inverted className="p-6">
              <H2 className="mb-6 text-white">Request Services</H2>
              <Form onSubmit={handleSubmit}>
                <Stack gap={6}>
                  <Stack gap={4}>
                    <H3 className="text-white">Select Services Needed</H3>
                    <Grid cols={2} gap={3} className="sm:grid-cols-1 lg:grid-cols-2">
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

                  <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                    <Field label="Contact Phone" inverted>
                      <PhoneInput
                        value={contactPhone}
                        onChange={(value) => setContactPhone(value)}
                        placeholder="Phone number"
                        inverted
                        fullWidth
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
                  {requests.map((request: { id: string; event_title: string; event_date: string; request_type: string; status: string }) => (
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
    </>
  );
}

export default function AccessibilityRequestPage() {
  return (
    <Suspense fallback={<GvtewayLoadingLayout />}>
      <AccessibilityRequestContent />
    </Suspense>
  );
}
