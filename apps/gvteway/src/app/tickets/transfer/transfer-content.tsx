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
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
} from '@ghxstship/ui';

interface Ticket {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  ticket_type: string;
  seat_info?: string;
  status: 'active' | 'transferred' | 'used';
  qr_code: string;
}

export default function TicketTransferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticketId');
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(ticketId);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets?status=active&transferable=true');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !recipientEmail) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/tickets/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: selectedTicket,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/tickets');
        }, 3000);
      } else {
        setError(data.error || 'Failed to transfer ticket');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  if (success) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Stack className="items-center justify-center min-h-[60vh]" gap={6}>
            <Stack className="w-24 h-24 bg-black rounded-full items-center justify-center">
              <Body className="text-white text-4xl">✓</Body>
            </Stack>
            <Display>TRANSFER COMPLETE</Display>
            <Body className="text-center text-gray-600 max-w-md">
              Your ticket has been successfully transferred to {recipientEmail}. 
              They will receive an email with instructions to claim their ticket.
            </Body>
            <Button variant="outline" onClick={() => router.push('/tickets')}>
              Back to My Tickets
            </Button>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Display>TRANSFER TICKET</Display>
          <Body className="mt-2 text-gray-600">
            Send your ticket to a friend or family member
          </Body>
        </Section>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Grid cols={2} gap={8}>
          <Stack gap={6}>
            <Card className="p-6">
              <H2 className="mb-6">SELECT TICKET TO TRANSFER</H2>
              
              {tickets.length > 0 ? (
                <Stack gap={4}>
                  {tickets.map(ticket => (
                    <Card
                      key={ticket.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedTicket === ticket.id 
                          ? 'border-2 border-black bg-gray-50' 
                          : 'border border-gray-200 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedTicket(ticket.id)}
                    >
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <H3>{ticket.event_title}</H3>
                          <Body className="text-gray-600">{ticket.event_date}</Body>
                          <Stack direction="horizontal" gap={2} className="mt-2">
                            <Badge>{ticket.ticket_type}</Badge>
                            {ticket.seat_info && (
                              <Badge variant="outline">{ticket.seat_info}</Badge>
                            )}
                          </Stack>
                        </Stack>
                        <Stack className={`w-6 h-6 rounded-full border-2 ${
                          selectedTicket === ticket.id 
                            ? 'border-black bg-black' 
                            : 'border-gray-300'
                        }`}>
                          {selectedTicket === ticket.id && (
                            <Body className="text-white text-center text-sm">✓</Body>
                          )}
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Stack className="items-center py-8">
                  <Body className="text-gray-500">No transferable tickets found.</Body>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/events')}>
                    Browse Events
                  </Button>
                </Stack>
              )}
            </Card>
          </Stack>

          <Stack gap={6}>
            <Card className="p-6">
              <H2 className="mb-6">RECIPIENT DETAILS</H2>
              
              <Stack gap={4}>
                <Field label="Recipient Email" required>
                  <Input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="friend@example.com"
                    required
                  />
                </Field>

                <Field label="Recipient Name">
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="John Doe"
                  />
                </Field>

                <Field label="Personal Message (Optional)">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enjoy the show!"
                  />
                </Field>

                <Stack className="border-t border-gray-200 pt-4 mt-2">
                  <Button
                    variant="solid"
                    className="w-full"
                    disabled={!selectedTicket || !recipientEmail || submitting}
                    onClick={handleTransfer}
                  >
                    {submitting ? (
                      <Stack direction="horizontal" gap={2} className="items-center justify-center">
                        <LoadingSpinner size="sm" />
                        <Body>Transferring...</Body>
                      </Stack>
                    ) : (
                      'TRANSFER TICKET'
                    )}
                  </Button>
                </Stack>
              </Stack>
            </Card>

            <Card className="p-6 bg-gray-50">
              <H3 className="mb-4">TRANSFER POLICY</H3>
              <Stack gap={2}>
                <Body className="text-sm text-gray-600">
                  • Transfers are final and cannot be undone
                </Body>
                <Body className="text-sm text-gray-600">
                  • The recipient will receive an email to claim the ticket
                </Body>
                <Body className="text-sm text-gray-600">
                  • Original ticket will be invalidated after transfer
                </Body>
                <Body className="text-sm text-gray-600">
                  • Some events may restrict ticket transfers
                </Body>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Container>
    </Section>
  );
}
