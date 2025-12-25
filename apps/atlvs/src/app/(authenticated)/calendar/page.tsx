'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  MainContent,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Grid3X3, Clock } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendar';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const startDate = useMemo(() => {
    const date = new Date(currentDate);
    if (viewMode === 'month') {
      date.setDate(1);
      date.setDate(date.getDate() - date.getDay());
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() - date.getDay());
    }
    return date.toISOString().split('T')[0];
  }, [currentDate, viewMode]);

  const endDate = useMemo(() => {
    const date = new Date(currentDate);
    if (viewMode === 'month') {
      date.setMonth(date.getMonth() + 1, 0);
      date.setDate(date.getDate() + (6 - date.getDay()));
    } else if (viewMode === 'week') {
      date.setDate(date.getDate() + (6 - date.getDay()));
    }
    return date.toISOString().split('T')[0];
  }, [currentDate, viewMode]);

  const { data, isLoading, error } = useCalendarEvents({ start_date: startDate, end_date: endDate });

  const events = data?.events || [];

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDaysInMonth = () => {
    const days: Array<{ date: Date; isCurrentMonth: boolean; events: typeof events }> = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.date === dateStr);
      days.push({
        date: new Date(d),
        isCurrentMonth: d.getMonth() === currentDate.getMonth(),
        events: dayEvents,
      });
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Calendar" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Skeleton className="h-96" />
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Calendar" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load calendar"
              description="There was an error loading your calendar events."
              action={{ label: 'Retry', onClick: () => router.refresh() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <Box className="h-full flex flex-col">
      <EnterprisePageHeader
        title="Calendar"
        subtitle={formatMonthYear()}
        primaryAction={{ label: 'New Booking', onClick: () => router.push('/bookings/new') }}
      />
      <Box className="px-6 py-3 border-b border-border">
        <Stack direction="horizontal" className="justify-between">
          <Stack direction="horizontal" gap={2} className="items-center">
            <Button variant="ghost" size="sm" onClick={navigatePrev}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Text className="font-weight-medium min-w-[180px] text-center">
              {formatMonthYear()}
            </Text>
            <Button variant="ghost" size="sm" onClick={navigateNext}>
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="ml-2">
              Today
            </Button>
          </Stack>
          <Stack direction="horizontal" gap={3}>
            <Stack direction="horizontal" className="border-2 border-border rounded-button overflow-hidden">
              {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'solid' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="rounded-none capitalize"
                >
                  {mode}
                </Button>
              ))}
            </Stack>
            <Link href="/calendar/spaces">
              <Button variant="outline" size="sm">
                <Grid3X3 className="h-4 w-4 mr-2" />
                Spaces
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Box>

      <Box className="flex-1 overflow-auto p-6">
        {viewMode === 'month' && (
          <Box className="h-full">
            <Grid cols={7} className="border-l border-t border-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Box
                  key={day}
                  className="p-2 text-center font-weight-medium text-muted-foreground border-r border-b border-border bg-muted/50"
                >
                  <Text size="sm">{day}</Text>
                </Box>
              ))}
              {getDaysInMonth().map((day, index) => (
                <Box
                  key={index}
                  className={`min-h-[100px] p-2 border-r border-b border-border ${
                    day.isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                  }`}
                >
                  <Box className={`mb-1 ${
                    isToday(day.date)
                      ? 'w-7 h-7 flex items-center justify-center bg-primary text-primary-foreground rounded-avatar font-weight-bold'
                      : day.isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  }`}>
                    <Text size="sm">{day.date.getDate()}</Text>
                  </Box>
                  <Stack gap={1}>
                    {day.events.slice(0, 3).map((event) => (
                      <Link
                        key={event.id}
                        href={event.type === 'booking' ? `/bookings/${event.id}` : '#'}
                        className={`block px-2 py-0.5 truncate rounded ${
                          event.type === 'hold'
                            ? 'bg-success-100 text-success-600 border-2 border-success-200'
                            : 'bg-primary/10 text-primary border-2 border-primary/20'
                        }`}
                        style={event.color ? { backgroundColor: `${event.color}20`, color: event.color, borderColor: `${event.color}40` } : {}}
                      >
                        <Text size="xs">{event.title}</Text>
                      </Link>
                    ))}
                    {day.events.length > 3 && (
                      <Text size="xs" className="text-muted-foreground px-2">
                        +{day.events.length - 3} more
                      </Text>
                    )}
                  </Stack>
                </Box>
              ))}
            </Grid>
          </Box>
        )}

        {viewMode === 'agenda' && (
          <Stack gap={4}>
            {events.length === 0 ? (
              <EmptyState
                title="No events in this period"
                description="There are no events scheduled for this time period."
                icon={<CalendarIcon className="h-12 w-12" />}
              />
            ) : (
              events.map((event) => (
                <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                  <Stack direction="horizontal" gap={4} className="items-start">
                    <Box className="flex-shrink-0 text-center">
                      <Text size="xs" className="text-muted-foreground uppercase">
                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Body className="font-weight-bold">
                        {new Date(event.date).getDate()}
                      </Body>
                    </Box>
                    <Box className="flex-1">
                      <Link
                        href={event.type === 'booking' ? `/bookings/${event.id}` : '#'}
                        className="font-weight-medium hover:text-primary"
                      >
                        <Text>{event.title}</Text>
                      </Link>
                      <Stack direction="horizontal" gap={4} className="mt-1">
                        {event.start_time && (
                          <Text size="sm" className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {event.start_time} - {event.end_time}
                          </Text>
                        )}
                        {event.venue && (
                          <Text size="sm" className="text-muted-foreground">
                            {(event.venue as { name: string }).name}
                          </Text>
                        )}
                      </Stack>
                    </Box>
                    <Badge
                      variant={event.status === 'confirmed' ? 'success' : event.status === 'pending' ? 'warning' : 'error'}
                      className="capitalize"
                    >
                      {event.status}
                    </Badge>
                  </Stack>
                </Card>
              ))
            )}
          </Stack>
        )}

        {(viewMode === 'week' || viewMode === 'day') && (
          <EmptyState
            title={`${viewMode === 'week' ? 'Week' : 'Day'} view coming soon`}
            description="Use Month or Agenda view for now"
            icon={<CalendarIcon className="h-12 w-12" />}
          />
        )}
      </Box>
    </Box>
  );
}
