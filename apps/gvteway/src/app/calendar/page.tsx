'use client';

import { useState, useMemo, useCallback } from 'react';
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
  LoadingSpinner,
} from '@ghxstship/ui';
import { useEvents } from '@/hooks/useEvents';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: any[];
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  const { data: events, isLoading } = useEvents({ status: 'published' });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = (events || []).filter((event: any) => {
        const eventDate = new Date(event.date || event.start_date);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents,
      });
    }

    return days;
  }, [currentDate, events]);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return (events || []).filter((event: any) => {
      const eventDate = new Date(event.date || event.start_date);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  }, [selectedDate, events]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

  const handleDayClick = useCallback((day: CalendarDay) => {
    setSelectedDate(day.date);
  }, []);

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  if (isLoading) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading calendar..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
            <H1>Event Calendar</H1>
            <Stack direction="horizontal" gap={2}>
              <Button
                variant={viewMode === 'month' ? 'solid' : 'outline'}
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'solid' : 'outline'}
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
            </Stack>
          </Stack>

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            <Card className="p-6">
              <Stack direction="horizontal" className="justify-between items-center mb-6">
                <Button variant="ghost" onClick={handlePrevMonth}>
                  Previous
                </Button>
                <H2>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </H2>
                <Button variant="ghost" onClick={handleNextMonth}>
                  Next
                </Button>
              </Stack>

              <Button variant="outline" className="mb-4" onClick={handleToday}>
                Today
              </Button>

              <Stack className="grid grid-cols-7 gap-1">
                {dayNames.map(day => (
                  <Stack key={day} className="p-2 text-center">
                    <Label className="text-ink-500">{day}</Label>
                  </Stack>
                ))}

                {calendarDays.map((day, index) => (
                  <Card
                    key={index}
                    className={`p-2 min-h-card cursor-pointer transition-colors ${
                      !day.isCurrentMonth ? 'bg-ink-50 opacity-50' : ''
                    } ${
                      day.isToday ? 'border-2 border-black' : ''
                    } ${
                      selectedDate?.toDateString() === day.date.toDateString() 
                        ? 'bg-black text-white' 
                        : 'hover:bg-ink-100'
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    <Body className={`font-bold ${
                      selectedDate?.toDateString() === day.date.toDateString() 
                        ? 'text-white' 
                        : ''
                    }`}>
                      {day.date.getDate()}
                    </Body>
                    {day.events.length > 0 && (
                      <Stack gap={1} className="mt-1">
                        {day.events.slice(0, 2).map(event => (
                          <Stack
                            key={event.id}
                            className={`px-1 py-0.5 text-mono-xs truncate rounded ${
                              selectedDate?.toDateString() === day.date.toDateString()
                                ? 'bg-white text-black'
                                : 'bg-black text-white'
                            }`}
                          >
                            <Body className="text-mono-xs truncate">{event.title}</Body>
                          </Stack>
                        ))}
                        {day.events.length > 2 && (
                          <Body className={`text-mono-xs ${
                            selectedDate?.toDateString() === day.date.toDateString()
                              ? 'text-ink-200'
                              : 'text-ink-500'
                          }`}>
                            +{day.events.length - 2} more
                          </Body>
                        )}
                      </Stack>
                    )}
                  </Card>
                ))}
              </Stack>
            </Card>
          </Stack>

          <Stack gap={6}>
            <Card className="p-6">
              <H3 className="mb-4">
                {selectedDate 
                  ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Select a Date'
                }
              </H3>

              {selectedDate ? (
                selectedDayEvents.length > 0 ? (
                  <Stack gap={4}>
                    {selectedDayEvents.map(event => (
                      <Card
                        key={event.id}
                        className="p-4 cursor-pointer hover:bg-ink-50 transition-colors"
                        onClick={() => handleEventClick(event.id)}
                      >
                        <H3 className="mb-1">{event.title}</H3>
                        <Body className="text-ink-600 text-body-sm mb-2">
                          {event.venue}
                        </Body>
                        <Stack direction="horizontal" gap={2}>
                          <Badge>{event.category}</Badge>
                          <Badge variant="outline">From ${event.price}</Badge>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Body className="text-ink-500">No events on this date.</Body>
                )
              ) : (
                <Body className="text-ink-500">
                  Click on a date to see events.
                </Body>
              )}
            </Card>

            <Card className="p-6">
              <H3 className="mb-4">UPCOMING THIS MONTH</H3>
              <Stack gap={3}>
                {(events || [])
                  .filter((event: any) => {
                    const eventDate = new Date(event.date || event.start_date);
                    return eventDate.getMonth() === currentDate.getMonth() &&
                           eventDate.getFullYear() === currentDate.getFullYear() &&
                           eventDate >= new Date();
                  })
                  .slice(0, 5)
                  .map((event: any) => (
                    <Stack
                      key={event.id}
                      direction="horizontal"
                      className="justify-between items-center py-2 border-b border-ink-200 cursor-pointer hover:bg-ink-50"
                      onClick={() => handleEventClick(event.id)}
                    >
                      <Stack>
                        <Body className="font-medium">{event.title || event.name}</Body>
                        <Body className="text-body-sm text-ink-500">
                          {new Date(event.date || event.start_date).toLocaleDateString()}
                        </Body>
                      </Stack>
                      <Badge variant="outline">${event.price || 0}</Badge>
                    </Stack>
                  ))}
              </Stack>
            </Card>
          </Stack>
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
