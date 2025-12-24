'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendar';
import { useSpaces } from '@/hooks/useSpaces';

export default function CalendarTimelinePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month'>('week');

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const { data: eventsData } = useCalendarEvents({
    start_date: startOfWeek.toISOString().split('T')[0],
    end_date: endOfWeek.toISOString().split('T')[0],
  });

  const { data: spacesData } = useSpaces();

  const events = eventsData?.events || [];
  const spaces = spacesData?.spaces || [];

  const getDaysInRange = () => {
    const days: Date[] = [];
    const start = new Date(startOfWeek);
    for (let i = 0; i < 7; i++) {
      days.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInRange();

  const getEventsForSpaceAndDay = (spaceId: string, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(
      (event) =>
        event.space_id === spaceId &&
        event.start_time?.startsWith(dateStr)
    );
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/calendar"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Timeline View</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Gantt-style calendar view
            </Body>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border-2 border-border rounded-button overflow-hidden">
            <Button
              onClick={() => setZoomLevel('day')}
              className={`px-3 py-1.5 text-body-sm ${
                zoomLevel === 'day' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              Day
            </Button>
            <Button
              onClick={() => setZoomLevel('week')}
              className={`px-3 py-1.5 text-body-sm ${
                zoomLevel === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              Week
            </Button>
            <Button
              onClick={() => setZoomLevel('month')}
              className={`px-3 py-1.5 text-body-sm ${
                zoomLevel === 'month' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            onClick={goToToday}
            className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            Today
          </Button>
          <Button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <H2 className="text-h4-md font-weight-semibold text-foreground">
          {startOfWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </H2>
      </div>

      <div className="bg-background border-2 border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/30">
                <TableHead className="sticky left-0 bg-muted/30 px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground w-48 border-r border-border">
                  Space
                </TableHead>
                {days.map((day) => (
                  <TableHead
                    key={day.toISOString()}
                    className={`px-2 py-3 text-center text-body-sm font-weight-medium min-w-[100px] ${
                      isToday(day) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {formatDateShort(day)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {spaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <Body className="text-body-sm">No spaces configured</Body>
                  </TableCell>
                </TableRow>
              ) : (
                spaces.map((space) => (
                  <TableRow key={space.id} className="border-b border-border hover:bg-muted/10">
                    <TableCell className="sticky left-0 bg-background px-4 py-3 border-r border-border">
                      <Link
                        href={`/spaces/${space.id}`}
                        className="text-body-sm font-weight-medium text-foreground hover:text-primary"
                      >
                        {space.name}
                      </Link>
                      <Body className="text-body-xs text-muted-foreground">
                        {space.capacity} guests
                      </Body>
                    </TableCell>
                    {days.map((day) => {
                      const dayEvents = getEventsForSpaceAndDay(space.id, day);
                      return (
                        <TableCell
                          key={day.toISOString()}
                          className={`px-2 py-2 align-top min-w-[100px] ${
                            isToday(day) ? 'bg-primary/5' : ''
                          }`}
                        >
                          {dayEvents.length > 0 ? (
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className="px-2 py-1 bg-primary text-primary-foreground rounded text-body-xs truncate"
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-body-xs text-muted-foreground text-center">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-8" />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between text-body-xs text-muted-foreground">
        <Body>Showing {spaces.length} spaces</Body>
        <Body>{events.length} events this week</Body>
      </div>
    </div>
  );
}
