'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Alert,
  Spinner,
} from '@ghxstship/ui';
import { useGiftTicketsData } from '@/hooks/useGiftTickets';

export default function GiftTicketsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    event_id: eventId || '',
    ticket_type_id: '',
    quantity: '1',
    recipient_email: '',
    recipient_name: '',
    sender_name: '',
    message: '',
    delivery_date: '',
    wrap_style: 'classic',
  });

  const {
    events,
    ticketTypes,
    isLoading: loading,
    sendGift,
    isSending: submitting,
    setSelectedEventId,
  } = useGiftTicketsData(formData.event_id || null);

  useEffect(() => {
    if (formData.event_id) {
      setSelectedEventId(formData.event_id);
    }
  }, [formData.event_id, setSelectedEventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      await sendGift({
        ...formData,
        quantity: parseInt(formData.quantity),
      });
      setSuccess(true);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to send gift');
    }
  };

  const selectedEvent = events.find(e => e.id === formData.event_id);
  const selectedTicketType = ticketTypes.find(t => t.id === formData.ticket_type_id);
  const totalPrice = selectedTicketType 
    ? selectedTicketType.price * parseInt(formData.quantity || '0')
    : 0;

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <Spinner variant="grey" size="lg" />
      </Section>
    );
  }

  if (success) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Stack className="items-center justify-center min-h-[60vh]" gap={6}>
            <Stack className="w-24 h-24 bg-black rounded-avatar items-center justify-center">
              <Body className="text-white text-h3-md">🎁</Body>
            </Stack>
            <Display>GIFT SENT!</Display>
            <Body className="text-center text-ink-600 max-w-md">
              Your gift tickets have been sent to {formData.recipient_email}.
              {formData.delivery_date && (
                <> They will receive them on {new Date(formData.delivery_date).toLocaleDateString()}.</>
              )}
            </Body>
            <Stack direction="horizontal" gap={4}>
              <Button variant="solid" onClick={() => router.push('/events')}>
                Browse More Events
              </Button>
              <Button variant="outline" onClick={() => router.push('/orders')}>
                View Orders
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Display>GIFT TICKETS</Display>
          <Body className="mt-2 text-ink-600">
            Send tickets as a gift to someone special
          </Body>
        </Section>

        {localError && (
          <Alert variant="error" className="mb-6">
            {localError}
          </Alert>
        )}

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            <Stack gap={6}>
                <Card className="p-6">
                  <H2 className="mb-6">SELECT EVENT & TICKETS</H2>
                  
                  <Stack gap={4}>
                    <Field label="Event" required>
                      <Select
                        value={formData.event_id}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          event_id: e.target.value,
                          ticket_type_id: '',
                        })}
                        required
                      >
                        <option value="">Select an event</option>
                        {events.map(event => (
                          <option key={event.id} value={event.id}>
                            {event.title} - {event.date}
                          </option>
                        ))}
                      </Select>
                    </Field>

                    {formData.event_id && ticketTypes.length > 0 && (
                      <Field label="Ticket Type" required>
                        <Select
                          value={formData.ticket_type_id}
                          onChange={(e) => setFormData({ ...formData, ticket_type_id: e.target.value })}
                          required
                        >
                          <option value="">Select ticket type</option>
                          {ticketTypes.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name} - ${type.price} ({type.available} available)
                            </option>
                          ))}
                        </Select>
                      </Field>
                    )}

                    <Field label="Quantity" required>
                      <Select
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </Select>
                    </Field>
                  </Stack>
                </Card>

                <Card className="p-6">
                  <H2 className="mb-6">RECIPIENT DETAILS</H2>
                  
                  <Stack gap={4}>
                    <Grid cols={2} gap={4}>
                      <Field label="Recipient Name" required>
                        <Input
                          value={formData.recipient_name}
                          onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </Field>

                      <Field label="Recipient Email" required>
                        <Input
                          type="email"
                          value={formData.recipient_email}
                          onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                          placeholder="friend@example.com"
                          required
                        />
                      </Field>
                    </Grid>

                    <Field label="Your Name">
                      <Input
                        value={formData.sender_name}
                        onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                        placeholder="Your name (shown on gift)"
                      />
                    </Field>

                    <Field label="Personal Message">
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Write a personal message for the recipient..."
                        rows={3}
                      />
                    </Field>

                    <Field label="Delivery Date (Optional)">
                      <Input
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <Body className="text-body-sm text-ink-500 mt-1">
                        Leave empty to send immediately
                      </Body>
                    </Field>
                  </Stack>
                </Card>

                <Card className="p-6">
                  <H2 className="mb-6">GIFT WRAP STYLE</H2>
                  
                  <Grid cols={3} gap={4}>
                    {[
                      { id: 'classic', name: 'Classic', emoji: '🎁' },
                      { id: 'celebration', name: 'Celebration', emoji: '🎉' },
                      { id: 'elegant', name: 'Elegant', emoji: '✨' },
                    ].map(style => (
                      <Card
                        key={style.id}
                        className={`p-4 cursor-pointer text-center transition-all ${
                          formData.wrap_style === style.id
                            ? 'border-2 border-black bg-ink-50'
                            : 'border-2 border-ink-200 hover:border-ink-400'
                        }`}
                        onClick={() => setFormData({ ...formData, wrap_style: style.id })}
                      >
                        <Body className="text-h4-md mb-2">{style.emoji}</Body>
                        <Body className="font-weight-medium">{style.name}</Body>
                      </Card>
                    ))}
                  </Grid>
                </Card>

                <Button
                  variant="solid"
                  className="w-full"
                  disabled={!formData.event_id || !formData.ticket_type_id || !formData.recipient_email || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? 'Processing...' : 'SEND GIFT'}
                </Button>
              </Stack>
          </Stack>

          <Stack gap={6}>
            <Card className="p-6">
              <H2 className="mb-4">ORDER SUMMARY</H2>
              
              {selectedEvent && selectedTicketType ? (
                <Stack gap={4}>
                  <Stack gap={2}>
                    <Body className="font-weight-bold">{selectedEvent.title}</Body>
                    <Body className="text-body-sm text-ink-600">{selectedEvent.date}</Body>
                    <Body className="text-body-sm text-ink-600">{selectedEvent.venue}</Body>
                  </Stack>

                  <Stack className="border-t-2 border-ink-200 pt-4">
                    <Stack direction="horizontal" className="justify-between">
                      <Body>{selectedTicketType.name}</Body>
                      <Body>${selectedTicketType.price}</Body>
                    </Stack>
                    <Stack direction="horizontal" className="justify-between text-ink-600">
                      <Body>Quantity</Body>
                      <Body>x {formData.quantity}</Body>
                    </Stack>
                  </Stack>

                  <Stack className="border-t-2 border-black pt-4">
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="font-weight-bold">Total</Body>
                      <Body className="font-weight-bold">${totalPrice.toFixed(2)}</Body>
                    </Stack>
                  </Stack>
                </Stack>
              ) : (
                <Body className="text-ink-500">
                  Select an event and ticket type to see your order summary.
                </Body>
              )}
            </Card>

            <Card className="p-6 bg-ink-50">
              <H3 className="mb-4">GIFT POLICY</H3>
              <Stack gap={2}>
                <Body className="text-body-sm text-ink-600">
                  • Gift tickets are non-refundable
                </Body>
                <Body className="text-body-sm text-ink-600">
                  • Recipient can transfer tickets once
                </Body>
                <Body className="text-body-sm text-ink-600">
                  • Gift expires if not claimed within 30 days
                </Body>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Container>
    </Section>
  );
}
