'use client';

import { useState, useMemo, useCallback } from 'react';
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
  Kicker,
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
    return <GvtewayLoadingLayout text="Loading calendar..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Plan Your Events</Kicker>
              <Stack direction="horizontal" className="items-center justify-between">
                <H2 size="lg" className="text-white">Event Calendar</H2>
                <Stack direction="horizontal" gap={2}>
                  <Button
                    variant={viewMode === 'month' ? 'solid' : 'outlineInk'}
                    inverted={viewMode === 'month'}
                    onClick={() => setViewMode('month')}
                  >
                    Month
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'solid' : 'outlineInk'}
                    inverted={viewMode === 'week'}
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </Button>
                </Stack>
              </Stack>
            </Stack>

        <Grid cols={3} gap={8}>
          <Stack className="col-span-2" gap={6}>
            <Card inverted className="p-6">
              <Stack direction="horizontal" className="mb-6 items-center justify-between">
                <Button variant="ghost" onClick={handlePrevMonth}>
                  Previous
                </Button>
                <H2 className="text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </H2>
                <Button variant="ghost" onClick={handleNextMonth}>
                  Next
                </Button>
              </Stack>

              <Button variant="outlineInk" className="mb-4" onClick={handleToday}>
                Today
              </Button>

              <Stack className="grid grid-cols-7 gap-1">
                {dayNames.map(day => (
                  <Stack key={day} className="p-2 text-center">
                    <Label className="text-on-dark-muted">{day}</Label>
                  </Stack>
                ))}

                {calendarDays.map((day, index) => (
                  <Card
                    key={index}
                    inverted
                    interactive
                    className={`min-h-[80px] cursor-pointer p-2 transition-colors ${
                      !day.isCurrentMonth ? 'opacity-50' : ''
                    } ${
                      day.isToday ? 'ring-2 ring-white' : ''
                    } ${
                      selectedDate?.toDateString() === day.date.toDateString() 
                        ? 'bg-white text-black' 
                        : ''
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    <Body className={`font-display ${
                      selectedDate?.toDateString() === day.date.toDateString() 
                        ? 'text-black' 
                        : 'text-white'
                    }`}>
                      {day.date.getDate()}
                    </Body>
                    {day.events.length > 0 && (
                      <Stack gap={1} className="mt-1">
                        {day.events.slice(0, 2).map(event => (
                          <Badge
                            key={event.id}
                            variant={selectedDate?.toDateString() === day.date.toDateString() ? 'outline' : 'solid'}
                            className="truncate text-xs"
                          >
                            {event.title}
                          </Badge>
                        ))}
                        {day.events.length > 2 && (
                          <Body size="sm" className={`${
                            selectedDate?.toDateString() === day.date.toDateString()
                              ? 'text-ink-600'
                              : 'text-on-dark-disabled'
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
            <Card inverted className="p-6">
              <H3 className="mb-4 text-white">
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
                        inverted
                        interactive
                        className="cursor-pointer p-4"
                        onClick={() => handleEventClick(event.id)}
                      >
                        <H3 className="mb-1 text-white">{event.title}</H3>
                        <Body size="sm" className="mb-2 text-on-dark-muted">
                          {event.venue}
                        </Body>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant="solid">{event.category}</Badge>
                          <Badge variant="outline">From ${event.price}</Badge>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Body className="text-on-dark-muted">No events on this date.</Body>
                )
              ) : (
                <Body className="text-on-dark-muted">
                  Click on a date to see events.
                </Body>
              )}
            </Card>

            <Card inverted className="p-6">
              <H3 className="mb-4 text-white">Upcoming This Month</H3>
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
                      className="cursor-pointer items-center justify-between border-b border-ink-800 py-2"
                      onClick={() => handleEventClick(event.id)}
                    >
                      <Stack>
                        <Body className="font-display text-white">{event.title || event.name}</Body>
                        <Body size="sm" className="text-on-dark-disabled">
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
    </GvtewayAppLayout>
  );
}
