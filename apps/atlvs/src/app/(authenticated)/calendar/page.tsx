'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Grid3X3, Clock } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendar';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

export default function CalendarPage() {
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load calendar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-h2-md font-weight-bold text-foreground">Calendar</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={navigatePrev}
                className="p-2 hover:bg-muted rounded-button transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <span className="text-body-md font-weight-medium text-foreground min-w-[180px] text-center">
                {formatMonthYear()}
              </span>
              <button
                onClick={navigateNext}
                className="p-2 hover:bg-muted rounded-button transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={goToToday}
                className="ml-2 px-3 py-1 text-body-sm border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                Today
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border-2 border-border rounded-button overflow-hidden">
              {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-body-sm capitalize ${
                    viewMode === mode
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <Link
              href="/calendar/spaces"
              className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="text-body-sm">Spaces</span>
            </Link>
            <Link
              href="/bookings/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-body-sm font-weight-medium">New Booking</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'month' && (
          <div className="h-full">
            <div className="grid grid-cols-7 border-l border-t border-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-body-sm font-weight-medium text-muted-foreground border-r border-b border-border bg-muted/50"
                >
                  {day}
                </div>
              ))}
              {getDaysInMonth().map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border-r border-b border-border ${
                    day.isCurrentMonth ? 'bg-background' : 'bg-muted/30'
                  }`}
                >
                  <div className={`text-body-sm mb-1 ${
                    isToday(day.date)
                      ? 'w-7 h-7 flex items-center justify-center bg-primary text-primary-foreground rounded-avatar font-weight-bold'
                      : day.isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.events.slice(0, 3).map((event) => (
                      <Link
                        key={event.id}
                        href={event.type === 'booking' ? `/bookings/${event.id}` : '#'}
                        className={`block px-2 py-0.5 text-body-xs truncate rounded ${
                          event.type === 'hold'
                            ? 'bg-success-100 text-success-600 border-2 border-success-200'
                            : 'bg-primary/10 text-primary border-2 border-primary/20'
                        }`}
                        style={event.color ? { backgroundColor: `${event.color}20`, color: event.color, borderColor: `${event.color}40` } : {}}
                      >
                        {event.title}
                      </Link>
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-body-xs text-muted-foreground px-2">
                        +{day.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'agenda' && (
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-body-md text-muted-foreground">No events in this period</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 bg-background border-2 border-border rounded-card hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 text-center">
                    <div className="text-body-xs text-muted-foreground uppercase">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-h3-md font-weight-bold text-foreground">
                      {new Date(event.date).getDate()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Link
                      href={event.type === 'booking' ? `/bookings/${event.id}` : '#'}
                      className="text-body-md font-weight-medium text-foreground hover:text-primary"
                    >
                      {event.title}
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-body-sm text-muted-foreground">
                      {event.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.start_time} - {event.end_time}
                        </span>
                      )}
                      {event.venue && (
                        <span>{(event.venue as { name: string }).name}</span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-body-xs rounded capitalize ${
                      event.status === 'confirmed'
                        ? 'bg-success-100 text-success-800'
                        : event.status === 'pending'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-ink-100 text-error-600'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {(viewMode === 'week' || viewMode === 'day') && (
          <div className="text-center py-12 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{viewMode === 'week' ? 'Week' : 'Day'} view coming soon</p>
            <p className="text-body-sm mt-1">Use Month or Agenda view for now</p>
          </div>
        )}
      </div>
    </div>
  );
}
