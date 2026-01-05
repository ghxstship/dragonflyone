import type { BaseViewProps } from '../types.js';

export interface CalendarViewProps<T extends { id: string }> extends BaseViewProps<T> {
  /** Field for start date */
  startDateField: keyof T;
  
  /** Field for end date (optional, for ranges) */
  endDateField?: keyof T;
  
  /** Field for due date (if different from end) */
  dueDateField?: keyof T;
  
  /** Field for all-day events */
  allDayField?: keyof T;
  
  /** Field for event color */
  colorField?: keyof T;
  
  /** Field for event title */
  titleField?: keyof T;
  
  /** Field for event description */
  descriptionField?: keyof T;
  
  /** Field for event location */
  locationField?: keyof T;
  
  /** Field for event attendees */
  attendeesField?: keyof T;
  
  /** Default view mode */
  defaultView?: CalendarViewMode;
  
  /** Enable drag to reschedule */
  enableDragReschedule?: boolean;
  
  /** Enable drag to extend duration */
  enableDragResize?: boolean;
  
  /** Enable multi-day events */
  enableMultiDay?: boolean;
  
  /** Enable mini calendar */
  enableMiniCalendar?: boolean;
  
  /** Enable today indicator */
  enableTodayIndicator?: boolean;
  
  /** Enable weekend highlighting */
  enableWeekendHighlight?: boolean;
  
  /** Enable week numbers */
  enableWeekNumbers?: boolean;
  
  /** Custom event renderer */
  eventRenderer?: (event: T, viewMode: CalendarViewMode) => React.ReactNode;
  
  /** Custom day renderer */
  dayRenderer?: (date: Date, events: T[]) => React.ReactNode;
  
  /** Custom header renderer */
  headerRenderer?: (date: Date, viewMode: CalendarViewMode) => React.ReactNode;
  
  /** Event click handler */
  onEventClick?: (event: T) => void;
  
  /** Event double-click handler */
  onEventDoubleClick?: (event: T) => void;
  
  /** Day click handler */
  onDayClick?: (date: Date) => void;
  
  /** Navigation handlers */
  onNavigate?: (direction: 'prev' | 'next' | 'today') => void;
  
  /** View change handler */
  onViewChange?: (viewMode: CalendarViewMode) => void;
  
  /** Date range selection */
  enableDateSelection?: boolean;
  
  /** Selected date range */
  selectedRange?: {
    start: Date;
    end: Date;
  };
  
  /** Date selection handler */
  onDateSelect?: (range: { start: Date; end: Date }) => void;
  
  /** Working hours */
  workingHours?: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    days: number[]; // 0-6 (Sunday-Saturday)
  };
  
  /** Time slots */
  timeSlots?: {
    enabled: boolean;
    duration: number; // minutes
    startHour: number;
    endHour: number;
  };
  
  /** Calendar configuration */
  config?: {
    firstDayOfWeek?: number; // 0-6 (Sunday-Saturday)
    locale?: string;
    timeZone?: string;
    height?: string;
    eventLimit?: number;
  };
}

export type CalendarViewMode = 
  | 'month'
  | 'week'
  | 'day'
  | 'agenda'
  | 'year';

export interface CalendarEvent<T> {
  /** Event data */
  data: T;
  
  /** Event ID */
  id: string;
  
  /** Event title */
  title: string;
  
  /** Start date */
  start: Date;
  
  /** End date */
  end?: Date;
  
  /** All day flag */
  allDay?: boolean;
  
  /** Event color */
  color?: string;
  
  /** Event location */
  location?: string;
  
  /** Event description */
  description?: string;
  
  /** Attendees */
  attendees?: string[];
  
  /** Is event being dragged */
  isDragging?: boolean;
  
  /** Is event selected */
  selected?: boolean;
  
  /** Event status */
  status?: 'confirmed' | 'tentative' | 'cancelled';
  
  /** Event type */
  type?: 'meeting' | 'task' | 'reminder' | 'birthday' | 'holiday' | 'other';
}

export interface CalendarDay<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Date */
  date: Date;
  
  /** Is current month */
  isCurrentMonth: boolean;
  
  /** Is today */
  isToday: boolean;
  
  /** Is weekend */
  isWeekend: boolean;
  
  /** Is working day */
  isWorkingDay?: boolean;
  
  /** Events for this day */
  events: CalendarEvent<T>[];
  
  /** Is selected */
  selected?: boolean;
  
  /** Is in range */
  isInRange?: boolean;
  
  /** Is range start */
  isRangeStart?: boolean;
  
  /** Is range end */
  isRangeEnd?: boolean;
  
  /** Day number */
  dayNumber: number;
  
  /** Week number */
  weekNumber?: number;
}

export interface CalendarWeek {
  /** Week number */
  weekNumber: number;
  
  /** Days in week */
  days: CalendarDay[];
  
  /** Start date of week */
  startDate: Date;
  
  /** End date of week */
  endDate: Date;
}

export interface CalendarMonth {
  /** Month number */
  month: number;
  
  /** Year */
  year: number;
  
  /** Name */
  name: string;
  
  /** Weeks in month */
  weeks: CalendarWeek[];
  
  /** First day */
  firstDay: Date;
  
  /** Last day */
  lastDay: Date;
  
  /** Number of days */
  daysInMonth: number;
}

export interface TimeSlot<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Start time */
  start: Date;
  
  /** End time */
  end: Date;
  
  /** Slot index */
  index: number;
  
  /** Is working hour */
  isWorkingHour?: boolean;
  
  /** Events in slot */
  events: CalendarEvent<T>[];
}
