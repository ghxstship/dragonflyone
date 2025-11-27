'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../components/navigation';
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
  Grid,
  Stack,
  Badge,
  Switch,
  Alert,
  Modal,
  LoadingSpinner,
} from '@ghxstship/ui';
import Image from 'next/image';

interface UpcomingEvent {
  id: string;
  event_id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  image?: string;
  ticket_count: number;
  ticket_type: string;
  order_id: string;
  reminder_enabled: boolean;
  reminder_time: string;
  days_until: number;
}

export default function MyEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEvent | null>(null);
  const [reminderTime, setReminderTime] = useState('24h');
  const [success, setSuccess] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.upcoming || []);
        setPastEvents(data.past || []);
      }
    } catch (err) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleToggleReminder = async (event: UpcomingEvent) => {
    if (!event.reminder_enabled) {
      setSelectedEvent(event);
      setShowReminderModal(true);
    } else {
      await updateReminder(event.id, false, '');
    }
  };

  const updateReminder = async (eventId: string, enabled: boolean, time: string) => {
    try {
      const response = await fetch(`/api/user/events/${eventId}/reminder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, reminder_time: time }),
      });

      if (response.ok) {
        setSuccess(enabled ? 'Reminder set!' : 'Reminder removed');
        fetchEvents();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update reminder');
    }
  };

  const handleSetReminder = async () => {
    if (selectedEvent) {
      await updateReminder(selectedEvent.id, true, reminderTime);
      setShowReminderModal(false);
      setSelectedEvent(null);
    }
  };

  const handleViewTickets = (orderId: string) => {
    router.push(`/tickets?order=${orderId}`);
  };

  const handleAddToCalendar = (event: UpcomingEvent) => {
    const startDate = new Date(`${event.date}T${event.time}`);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
LOCATION:${event.venue}, ${event.city}
DESCRIPTION:You have ${event.ticket_count} ticket(s) for this event.
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    a.click();
  };

  const getCountdownBadge = (daysUntil: number) => {
    if (daysUntil === 0) return <Badge className="bg-error-500 text-white">Today!</Badge>;
    if (daysUntil === 1) return <Badge className="bg-warning-500 text-white">Tomorrow</Badge>;
    if (daysUntil <= 7) return <Badge className="bg-warning-500 text-white">{daysUntil} days</Badge>;
    return <Badge variant="outline">{daysUntil} days</Badge>;
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading your events..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>My Events</H1>
            <Body className="text-grey-600">
              Your upcoming events and past experiences
            </Body>
          </Stack>

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <Section className="mb-12">
          <H2 className="mb-6">UPCOMING EVENTS</H2>
          
          {events.length > 0 ? (
            <Stack gap={4}>
              {events.map(event => (
                <Card key={event.id} className="overflow-hidden">
                  <Grid cols={4} gap={0}>
                    {event.image && (
                      <Stack className="bg-grey-100 relative h-full">
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </Stack>
                    )}
                    <Stack className={`p-6 ${event.image ? 'col-span-3' : 'col-span-4'}`}>
                      <Stack direction="horizontal" className="justify-between items-start mb-4">
                        <Stack gap={2}>
                          <Stack direction="horizontal" gap={3} className="items-center">
                            <H3>{event.title}</H3>
                            {getCountdownBadge(event.days_until)}
                          </Stack>
                          <Body className="text-grey-600">
                            {event.date} at {event.time}
                          </Body>
                          <Body className="text-grey-500">
                            {event.venue}, {event.city}
                          </Body>
                        </Stack>
                        <Stack className="items-end">
                          <Badge>{event.ticket_count} ticket{event.ticket_count > 1 ? 's' : ''}</Badge>
                          <Body className="text-sm text-grey-500 mt-1">{event.ticket_type}</Body>
                        </Stack>
                      </Stack>

                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <Switch
                            checked={event.reminder_enabled}
                            onChange={() => handleToggleReminder(event)}
                          />
                          <Label className="text-sm">
                            {event.reminder_enabled 
                              ? `Reminder: ${event.reminder_time} before`
                              : 'Set reminder'}
                          </Label>
                        </Stack>

                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" onClick={() => handleAddToCalendar(event)}>
                            Add to Calendar
                          </Button>
                          <Button variant="solid" onClick={() => handleViewTickets(event.order_id)}>
                            View Tickets
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Grid>
                </Card>
              ))}
            </Stack>
          ) : (
            <Card className="p-12 text-center">
              <H3 className="mb-4">NO UPCOMING EVENTS</H3>
              <Body className="text-grey-600 mb-6">
                You don&apos;t have any upcoming events. Browse and find your next experience!
              </Body>
              <Button variant="solid" onClick={() => router.push('/browse')}>
                Browse Events
              </Button>
            </Card>
          )}
        </Section>

        {pastEvents.length > 0 && (
          <Section>
            <H2 className="mb-6">PAST EVENTS</H2>
            <Grid cols={3} gap={4}>
              {pastEvents.slice(0, 6).map(event => (
                <Card key={event.id} className="p-4">
                  <Stack gap={2}>
                    <H3 className="text-lg">{event.title}</H3>
                    <Body className="text-grey-600 text-sm">{event.date}</Body>
                    <Body className="text-grey-500 text-sm">{event.venue}</Body>
                    <Stack direction="horizontal" gap={2} className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/events/${event.event_id}`)}
                      >
                        View Event
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/reviews/new?event=${event.event_id}`)}
                      >
                        Leave Review
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
            {pastEvents.length > 6 && (
              <Stack className="items-center mt-6">
                <Button variant="outline" onClick={() => router.push('/orders/history')}>
                  View All Past Events
                </Button>
              </Stack>
            )}
          </Section>
        )}

        <Modal
          open={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          title="Set Event Reminder"
        >
          <Stack gap={4}>
            <Body>
              When would you like to be reminded about {selectedEvent?.title}?
            </Body>
            
            <Stack gap={2}>
              {['1h', '3h', '24h', '48h', '1w'].map(time => (
                <Button
                  key={time}
                  variant={reminderTime === time ? 'solid' : 'outline'}
                  onClick={() => setReminderTime(time)}
                  className="w-full"
                >
                  {time === '1h' && '1 hour before'}
                  {time === '3h' && '3 hours before'}
                  {time === '24h' && '1 day before'}
                  {time === '48h' && '2 days before'}
                  {time === '1w' && '1 week before'}
                </Button>
              ))}
            </Stack>

            <Stack direction="horizontal" gap={4} className="mt-4">
              <Button variant="solid" onClick={handleSetReminder}>
                Set Reminder
              </Button>
              <Button variant="outline" onClick={() => setShowReminderModal(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Modal>
        </Stack>
      </Container>
    </Section>
  );
}
