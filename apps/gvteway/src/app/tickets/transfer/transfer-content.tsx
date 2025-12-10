'use client';

import { useState } from 'react';
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
  Spinner,
} from '@ghxstship/ui';
import { useTicketTransferData } from '@/hooks/useTicketTransfer';

export default function TicketTransferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticketId');
  
  const [selectedTicket, setSelectedTicket] = useState<string | null>(ticketId);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    tickets,
    isLoading: loading,
    error,
    transferTicket,
    isTransferring: submitting,
  } = useTicketTransferData();

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !recipientEmail) return;

    setLocalError(null);

    try {
      await transferTicket({
        ticket_id: selectedTicket,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        message,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/tickets');
      }, 3000);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to transfer ticket');
    }
  };

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
              <Body className="text-white text-h3-md">✓</Body>
            </Stack>
            <Display>TRANSFER COMPLETE</Display>
            <Body className="text-center text-ink-600 max-w-md">
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
          <Body className="mt-2 text-ink-600">
            Send your ticket to a friend or family member
          </Body>
        </Section>

        {(error || localError) && (
          <Alert variant="error" className="mb-6">
            {error instanceof Error ? error.message : localError || String(error)}
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
                          ? 'border-2 border-black bg-ink-50' 
                          : 'border-2 border-ink-200 hover:border-ink-400'
                      }`}
                      onClick={() => setSelectedTicket(ticket.id)}
                    >
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <H3>{ticket.event_title}</H3>
                          <Body className="text-ink-600">{ticket.event_date}</Body>
                          <Stack direction="horizontal" gap={2} className="mt-2">
                            <Badge>{ticket.ticket_type}</Badge>
                            {ticket.seat_info && (
                              <Badge variant="outline">{ticket.seat_info}</Badge>
                            )}
                          </Stack>
                        </Stack>
                        <Stack className={`w-6 h-6 rounded-avatar border-2 ${
                          selectedTicket === ticket.id 
                            ? 'border-black bg-black' 
                            : 'border-ink-300'
                        }`}>
                          {selectedTicket === ticket.id && (
                            <Body className="text-white text-center text-body-sm">✓</Body>
                          )}
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Stack className="items-center py-8">
                  <Body className="text-ink-500">No transferable tickets found.</Body>
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

                <Stack className="border-t border-ink-200 pt-4 mt-2">
                  <Button
                    variant="solid"
                    className="w-full"
                    disabled={!selectedTicket || !recipientEmail || submitting}
                    onClick={handleTransfer}
                  >
                    {submitting ? (
                      <Stack direction="horizontal" gap={2} className="items-center justify-center">
                        <Spinner variant="grey" size="sm" />
                        <Body>Transferring...</Body>
                      </Stack>
                    ) : (
                      'TRANSFER TICKET'
                    )}
                  </Button>
                </Stack>
              </Stack>
            </Card>

            <Card className="p-6 bg-ink-50">
              <H3 className="mb-4">TRANSFER POLICY</H3>
              <Stack gap={2}>
                <Body className="text-body-sm text-ink-600">
                  • Transfers are final and cannot be undone
                </Body>
                <Body className="text-body-sm text-ink-600">
                  • The recipient will receive an email to claim the ticket
                </Body>
                <Body className="text-body-sm text-ink-600">
                  • Original ticket will be invalidated after transfer
                </Body>
                <Body className="text-body-sm text-ink-600">
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
