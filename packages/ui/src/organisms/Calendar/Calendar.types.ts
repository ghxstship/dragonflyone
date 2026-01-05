export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  color?: string;
}

export interface CalendarProps {
  /** Events to display */
  events?: CalendarEvent[];
  /** Selected date */
  selectedDate?: Date;
  /** Date selection handler */
  onDateSelect?: (date: Date) => void;
  /** Event click handler */
  onEventClick?: (event: CalendarEvent) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Show week numbers */
  showWeekNumbers?: boolean;
  /** Start week on Monday */
  weekStartsOnMonday?: boolean;
  /** Inverted theme (for dark backgrounds) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}
