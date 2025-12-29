// Master Calendar Utilities
// Headless utilities for calendar operations - UI components should be implemented in each app

import type {
  MasterCalendarEvent,
  CalendarSourceType,
  CalendarEventStatus,
} from './types/calendar-types';

// Re-export types and constants for convenience
export type { MasterCalendarEvent, CalendarSourceType, CalendarEventStatus };
export {
  SOURCE_TYPE_LABELS,
  SOURCE_TYPE_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from './types/calendar-types';

// Helper to get days in a month for calendar grid
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Add padding days from previous month
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add padding days from next month to complete the grid (6 rows)
  const endPadding = 42 - days.length;
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
}

// Get week days starting from a date
export function getWeekDays(date: Date): Date[] {
  const dayOfWeek = date.getDay();
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - dayOfWeek);
  
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

// Format date to YYYY-MM-DD
export function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format time from ISO datetime
export function formatTime(datetime: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(datetime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  });
}

// Format date for display
export function formatDateDisplay(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

// Group events by date
export function groupEventsByDate(events: MasterCalendarEvent[]): Record<string, MasterCalendarEvent[]> {
  const grouped: Record<string, MasterCalendarEvent[]> = {};
  
  events.forEach(event => {
    const date = event.start_datetime.split('T')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });
  
  // Sort events within each day by start time
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => 
      new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
    );
  });
  
  return grouped;
}

// Group events by hour for day/week views
export function groupEventsByHour(events: MasterCalendarEvent[]): Record<number, MasterCalendarEvent[]> {
  const grouped: Record<number, MasterCalendarEvent[]> = {};
  
  events.forEach(event => {
    const hour = new Date(event.start_datetime).getHours();
    if (!grouped[hour]) {
      grouped[hour] = [];
    }
    grouped[hour].push(event);
  });
  
  return grouped;
}

// Get date range for different view types
export function getDateRangeForView(
  view: 'month' | 'week' | 'day' | 'list',
  currentDate: Date
): { start: Date; end: Date } {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const day = currentDate.getDate();

  switch (view) {
    case 'month': {
      return {
        start: new Date(year, month, 1),
        end: new Date(year, month + 1, 0),
      };
    }
    case 'week': {
      const dayOfWeek = currentDate.getDay();
      return {
        start: new Date(year, month, day - dayOfWeek),
        end: new Date(year, month, day + (6 - dayOfWeek)),
      };
    }
    case 'day': {
      return {
        start: new Date(year, month, day),
        end: new Date(year, month, day + 1),
      };
    }
    case 'list':
    default: {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 30);
      return { start, end };
    }
  }
}

// Check if a date is today
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Check if a date is in the current month
export function isCurrentMonth(date: Date, referenceDate: Date): boolean {
  return date.getMonth() === referenceDate.getMonth();
}

// Get event duration in minutes
export function getEventDuration(event: MasterCalendarEvent): number {
  const start = new Date(event.start_datetime);
  const end = new Date(event.end_datetime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

// Format duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Source type category groups for filtering
export const SOURCE_TYPE_GROUPS: Record<string, CalendarSourceType[]> = {
  'CRM': ['crm_meeting', 'crm_call', 'crm_task', 'crm_reminder', 'crm_deadline'],
  'Venue': ['venue_booking', 'venue_hold', 'venue_block', 'venue_maintenance'],
  'Production': ['production_event', 'production_rehearsal', 'production_soundcheck', 'production_load_in', 'production_load_out', 'production_strike'],
  'Show': ['show_performance', 'show_set_time', 'show_cue', 'run_of_show_entry'],
  'Project': ['project_milestone', 'project_deadline', 'contract_deadline', 'advancing_deadline'],
  'Crew': ['crew_shift', 'crew_assignment', 'crew_availability'],
  'External': ['external_google', 'external_outlook', 'external_apple', 'external_ical'],
  'Other': ['personal', 'holiday', 'other'],
};

// Get category for a source type
export function getSourceTypeCategory(sourceType: CalendarSourceType): string {
  for (const [category, types] of Object.entries(SOURCE_TYPE_GROUPS)) {
    if (types.includes(sourceType)) {
      return category;
    }
  }
  return 'Other';
}

// Check for time conflicts between events
export function hasTimeConflict(
  event1: MasterCalendarEvent,
  event2: MasterCalendarEvent
): boolean {
  const start1 = new Date(event1.start_datetime).getTime();
  const end1 = new Date(event1.end_datetime).getTime();
  const start2 = new Date(event2.start_datetime).getTime();
  const end2 = new Date(event2.end_datetime).getTime();
  
  return start1 < end2 && end1 > start2;
}

// Find conflicting events
export function findConflicts(
  events: MasterCalendarEvent[],
  targetEvent: MasterCalendarEvent
): MasterCalendarEvent[] {
  return events.filter(
    event => event.id !== targetEvent.id && hasTimeConflict(event, targetEvent)
  );
}

// Calculate calendar summary statistics
export function calculateCalendarSummary(events: MasterCalendarEvent[]) {
  const today = formatDateKey(new Date());
  const now = new Date();
  
  return {
    total: events.length,
    today: events.filter(e => e.start_datetime.startsWith(today)).length,
    upcoming: events.filter(e => new Date(e.start_datetime) > now).length,
    past: events.filter(e => new Date(e.end_datetime) < now).length,
    bySourceType: events.reduce((acc, e) => {
      acc[e.source_type] = (acc[e.source_type] || 0) + 1;
      return acc;
    }, {} as Record<CalendarSourceType, number>),
    byStatus: events.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {} as Record<CalendarEventStatus, number>),
    byCategory: events.reduce((acc, e) => {
      const category = getSourceTypeCategory(e.source_type);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}
