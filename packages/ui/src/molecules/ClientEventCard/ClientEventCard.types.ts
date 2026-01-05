/**
 * ClientEventCard venue information
 */
export interface ClientEventCardVenue {
  name: string;
  address?: string;
}

/**
 * ClientEventCard status types
 */
export type ClientEventCardStatus = 
  | "upcoming"
  | "in_progress"
  | "completed"
  | "cancelled";

/**
 * ClientEventCard component props
 */
export interface ClientEventCardProps {
  id: string;
  name: string;
  eventType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  venue?: ClientEventCardVenue;
  guestCount?: number;
  status: ClientEventCardStatus;
  documentsCount?: number;
  invoicesCount?: number;
  balanceDue?: number;
  onClick?: () => void;
  onViewDocuments?: () => void;
  onViewInvoices?: () => void;
  inverted?: boolean;
  className?: string;
}
