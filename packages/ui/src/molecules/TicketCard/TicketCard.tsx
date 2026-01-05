"use client";

import React from "react";
import { 
  ticketCardVariants,
  ticketCardHeaderVariants,
  ticketCardContentVariants,
  ticketCardTitleVariants,
  ticketCardInfoVariants,
  ticketCardStatusVariants,
  ticketCardQRContainerVariants,
  ticketCardQRVariants 
} from "./TicketCard.variants.js";
import type { 
  TicketCardProps,
  TicketStatus 
} from "./TicketCard.types.js";

/**
 * TicketCard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Ticket card with QR code and status
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <TicketCard
 *   id="ticket-123"
 *   eventTitle="Summer Festival"
 *   ticketType="VIP"
 *   date={new Date()}
 *   venue="Main Arena"
 *   status="valid"
 *   showQR={true}
 *   inverted={false}
 * />
 * ```
 */
export function TicketCard({
  id: _id,
  eventTitle,
  ticketType,
  date,
  time,
  venue,
  seatInfo,
  qrCode,
  status = "valid" as TicketStatus,
  orderNumber,
  attendeeName,
  showQR = false,
  onClick,
  inverted = false,
  className,
}: TicketCardProps) {
  // Format date
  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Get status label
  const getStatusLabel = (status: TicketStatus): string => {
    const statusLabels = {
      valid: "VALID",
      used: "USED",
      transferred: "TRANSFERRED",
      refunded: "REFUNDED",
      expired: "EXPIRED",
    };
    return statusLabels[status];
  };

  return (
    <div
      className={ticketCardVariants({ inverted, className })}
      onClick={onClick}
    >
      {/* Header */}
      <div className={ticketCardHeaderVariants({ inverted })}>
        <div className="flex items-center justify-between">
          <div className={ticketCardTitleVariants({ inverted })}>
            {eventTitle}
          </div>
          <div className={ticketCardStatusVariants({ status, inverted })}>
            {getStatusLabel(status)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={ticketCardContentVariants({ inverted })}>
        {/* Ticket Type */}
        <div className={ticketCardInfoVariants({ inverted })}>
          {ticketType}
        </div>

        {/* Date and Time */}
        <div className={ticketCardInfoVariants({ inverted })}>
          {formatDate(date)}
          {time && ` • ${time}`}
        </div>

        {/* Venue */}
        <div className={ticketCardInfoVariants({ inverted })}>
          {venue}
        </div>

        {/* Seat Info */}
        {seatInfo && (
          <div className={ticketCardInfoVariants({ inverted })}>
            {seatInfo}
          </div>
        )}

        {/* Order Number */}
        {orderNumber && (
          <div className={ticketCardInfoVariants({ inverted })}>
            Order: {orderNumber}
          </div>
        )}

        {/* Attendee Name */}
        {attendeeName && (
          <div className={ticketCardInfoVariants({ inverted })}>
            {attendeeName}
          </div>
        )}

        {/* QR Code */}
        {showQR && qrCode && (
          <div className={ticketCardQRContainerVariants({ inverted })}>
            <img
              src={qrCode}
              alt="QR Code"
              className={ticketCardQRVariants({ inverted })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
