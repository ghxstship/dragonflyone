/**
 * EventCard component props
 */
export interface EventCardProps {
  /** Event ID */
  id: string;
  
  /** Event title */
  title: string;
  
  /** Event date */
  date: Date | string;
  
  /** Venue name */
  venue: string;
  
  /** Location (city, state) */
  location: string;
  
  /** Image URL */
  imageUrl?: string;
  
  /** Price range or starting price */
  price?: string;
  
  /** Event status */
  status?: EventCardStatus;
  
  /** Number of tickets remaining (for urgency) */
  ticketsRemaining?: number;
  
  /** Event category/genre */
  category?: string;
  
  /** Card variant */
  variant?: EventCardVariant;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Inverted theme (dark background) */
  inverted?: boolean;
  
  /** Custom className */
  className?: string;
}

/**
 * EventCard status types
 */
export type EventCardStatus = 
  | "on-sale"
  | "sold-out"
  | "coming-soon"
  | "cancelled";

/**
 * EventCard variant types
 */
export type EventCardVariant = 
  | "default"
  | "compact"
  | "featured";

/**
 * EventCard formatted date
 */
export interface FormattedDate {
  day: string;
  month: string;
  weekday: string;
}

/**
 * EventCard status configuration
 */
export interface EventCardStatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
}
