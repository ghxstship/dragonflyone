/**
 * Ticket status
 */
export type TicketStatus = "valid" | "used" | "transferred" | "refunded" | "expired";

/**
 * TicketCard component props
 */
export interface TicketCardProps {
  /** Ticket ID */
  id: string;
  /** Event title */
  eventTitle: string;
  /** Ticket type (GA, VIP, etc.) */
  ticketType: string;
  /** Event date */
  date: Date | string;
  /** Event time */
  time?: string;
  /** Venue name */
  venue: string;
  /** Seat/section info */
  seatInfo?: string;
  /** QR code data URL */
  qrCode?: string;
  /** Ticket status */
  status?: TicketStatus;
  /** Order number */
  orderNumber?: string;
  /** Attendee name */
  attendeeName?: string;
  /** Show QR code */
  showQR?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Theme inversion */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}
