'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
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
  Kicker,
  EmptyState,
  Figure,
} from '@ghxstship/ui';
import Image from 'next/image';
import { Calendar, Ticket, Clock, MapPin, Star, ChevronRight } from 'lucide-react';

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
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

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
    if (daysUntil === 0) return <Badge variant="solid">Today!</Badge>;
    if (daysUntil === 1) return <Badge variant="solid">Tomorrow</Badge>;
    if (daysUntil <= 7) return <Badge variant="solid">{daysUntil} days</Badge>;
    return <Badge variant="outline">{daysUntil} days</Badge>;
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading your events..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Your Tickets</Kicker>
              <H2 size="lg" className="text-white">My Events</H2>
              <Body className="text-on-dark-muted">
                Your upcoming events and past experiences
              </Body>
            </Stack>

            {success && <Alert variant="success">{success}</Alert>}

            {/* Upcoming Events */}
            <Stack gap={6}>
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Coming Up</Kicker>
                <H2 className="text-white">Upcoming Events</H2>
              </Stack>
              
              {events.length > 0 ? (
                <Stack gap={4}>
                  {events.map(event => (
                    <Card key={event.id} inverted interactive className="overflow-hidden">
                      <Grid cols={4} gap={0}>
                        {event.image && (
                          <Figure className="relative h-full min-h-[200px]">
                            <Image
                              src={event.image}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </Figure>
                        )}
                        <Stack className={`p-6 ${event.image ? 'col-span-3' : 'col-span-4'}`}>
                          <Stack direction="horizontal" className="mb-4 items-start justify-between">
                            <Stack gap={2}>
                              <Stack direction="horizontal" gap={3} className="items-center">
                                <H3 className="text-white">{event.title}</H3>
                                {getCountdownBadge(event.days_until)}
                              </Stack>
                              <Stack direction="horizontal" gap={2} className="items-center">
                                <Clock className="size-4 text-on-dark-muted" />
                                <Body className="text-on-dark-muted">
                                  {event.date} at {event.time}
                                </Body>
                              </Stack>
                              <Stack direction="horizontal" gap={2} className="items-center">
                                <MapPin className="size-4 text-on-dark-muted" />
                                <Body className="text-on-dark-muted">
                                  {event.venue}, {event.city}
                                </Body>
                              </Stack>
                            </Stack>
                            <Stack className="items-end">
                              <Badge variant="solid">
                                <Ticket className="mr-1 inline size-3" />
                                {event.ticket_count} ticket{event.ticket_count > 1 ? 's' : ''}
                              </Badge>
                              <Label size="xs" className="mt-1 text-on-dark-disabled">{event.ticket_type}</Label>
                            </Stack>
                          </Stack>

                          <Stack direction="horizontal" className="items-center justify-between border-t border-ink-800 pt-4">
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <Switch
                                checked={event.reminder_enabled}
                                onChange={() => handleToggleReminder(event)}
                              />
                              <Label size="sm" className="text-on-dark-muted">
                                {event.reminder_enabled 
                                  ? `Reminder: ${event.reminder_time} before`
                                  : 'Set reminder'}
                              </Label>
                            </Stack>

                            <Stack direction="horizontal" gap={2}>
                              <Button 
                                variant="outlineInk" 
                                size="sm"
                                onClick={() => handleAddToCalendar(event)}
                                icon={<Calendar className="size-4" />}
                                iconPosition="left"
                              >
                                Add to Calendar
                              </Button>
                              <Button 
                                variant="solid" 
                                size="sm"
                                inverted
                                onClick={() => handleViewTickets(event.order_id)}
                                icon={<Ticket className="size-4" />}
                                iconPosition="left"
                              >
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
                <EmptyState
                  title="No Upcoming Events"
                  description="You don't have any upcoming events. Browse and find your next experience!"
                  action={{
                    label: "Browse Events",
                    onClick: () => router.push('/browse')
                  }}
                  inverted
                />
              )}
            </Stack>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <Stack gap={6}>
                <H2 className="text-on-dark-muted">Past Events</H2>
                <Grid cols={3} gap={4}>
                  {pastEvents.slice(0, 6).map(event => (
                    <Card key={event.id} inverted className="p-4">
                      <Stack gap={3}>
                        <H3 size="sm" className="text-white">{event.title}</H3>
                        <Stack gap={1}>
                          <Label size="xs" className="text-on-dark-muted">{event.date}</Label>
                          <Label size="xs" className="text-on-dark-disabled">{event.venue}</Label>
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/events/${event.event_id}`)}
                            icon={<ChevronRight className="size-4" />}
                            iconPosition="right"
                          >
                            View Event
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/reviews/new?event=${event.event_id}`)}
                            icon={<Star className="size-4" />}
                            iconPosition="left"
                          >
                            Review
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
                {pastEvents.length > 6 && (
                  <Stack className="items-center">
                    <Button 
                      variant="outlineInk" 
                      onClick={() => router.push('/orders/history')}
                      icon={<ChevronRight className="size-4" />}
                      iconPosition="right"
                    >
                      View All Past Events
                    </Button>
                  </Stack>
                )}
              </Stack>
            )}

            {/* Reminder Modal */}
            <Modal
              open={showReminderModal}
              onClose={() => setShowReminderModal(false)}
              title="Set Event Reminder"
            >
              <Stack gap={4}>
                <Body className="text-on-dark-muted">
                  When would you like to be reminded about {selectedEvent?.title}?
                </Body>
                
                <Stack gap={2}>
                  {['1h', '3h', '24h', '48h', '1w'].map(time => (
                    <Button
                      key={time}
                      variant={reminderTime === time ? 'solid' : 'outline'}
                      onClick={() => setReminderTime(time)}
                      fullWidth
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
    </GvtewayAppLayout>
  );
}
