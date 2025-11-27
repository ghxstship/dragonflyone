"use client";

import React from "react";
import clsx from "clsx";

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
  status?: "valid" | "used" | "transferred" | "refunded" | "expired";
  /** Order number */
  orderNumber?: string;
  /** Attendee name */
  attendeeName?: string;
  /** Show QR code */
  showQR?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
}

const statusConfig = {
  valid: { label: "VALID", bgClass: "bg-black", textClass: "text-white" },
  used: { label: "USED", bgClass: "bg-grey-500", textClass: "text-white" },
  transferred: { label: "TRANSFERRED", bgClass: "bg-grey-600", textClass: "text-white" },
  refunded: { label: "REFUNDED", bgClass: "bg-grey-400", textClass: "text-black" },
  expired: { label: "EXPIRED", bgClass: "bg-grey-300", textClass: "text-grey-700" },
};

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
}

export function TicketCard({
  id,
  eventTitle,
  ticketType,
  date,
  time,
  venue,
  seatInfo,
  qrCode,
  status = "valid",
  orderNumber,
  attendeeName,
  showQR = true,
  onClick,
  className = "",
}: TicketCardProps) {
  const statusInfo = statusConfig[status];
  const isActive = status === "valid";

  return (
    <article
      className={clsx(
        "flex flex-col bg-white border-2 border-black overflow-hidden transition-all duration-base",
        onClick && "cursor-pointer",
        !isActive && "opacity-70",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header with Status */}
      <div className="flex justify-between items-center px-spacing-5 py-spacing-4 border-b border-grey-200">
        <div className="font-code text-mono-sm text-grey-600 tracking-widest">
          {ticketType}
        </div>
        <div
          className={clsx(
            "font-code text-mono-xs tracking-widest px-spacing-2 py-spacing-1",
            statusInfo.bgClass,
            statusInfo.textClass
          )}
        >
          {statusInfo.label}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-spacing-5 flex gap-gap-lg">
        {/* Event Info */}
        <div className="flex-1 flex flex-col gap-gap-sm">
          <h3 className="font-heading text-h4-md text-black uppercase tracking-wide leading-snug">
            {eventTitle}
          </h3>

          <div className="flex flex-col gap-gap-xs">
            <div className="font-code text-mono-sm text-black tracking-wide">
              {formatDate(date)}
              {time && ` // ${time}`}
            </div>
            <div className="font-body text-body-sm text-grey-700">
              {venue}
            </div>
            {seatInfo && (
              <div className="font-code text-mono-sm text-grey-600 tracking-wide">
                {seatInfo}
              </div>
            )}
          </div>

          {attendeeName && (
            <div className="font-body text-body-sm text-grey-700 mt-spacing-2">
              {attendeeName}
            </div>
          )}
        </div>

        {/* QR Code */}
        {showQR && qrCode && isActive && (
          <div className="w-spacing-24 h-spacing-24 bg-white border border-grey-300 flex items-center justify-center flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCode}
              alt="Ticket QR Code"
              className="w-full h-full p-spacing-1 object-contain"
            />
          </div>
        )}
      </div>

      {/* Footer with Order Info */}
      <div className="flex justify-between items-center px-spacing-5 py-spacing-3 bg-grey-100 border-t border-grey-200">
        <div className="font-code text-mono-xs text-grey-500 tracking-widest">
          {orderNumber && `ORDER #${orderNumber}`}
        </div>
        <div className="font-code text-mono-xs text-grey-500 tracking-widest">
          ID: {id.slice(0, 8).toUpperCase()}
        </div>
      </div>

      {/* Perforated Edge Effect - keeping inline style for complex gradient */}
      <div
        className="h-spacing-2 border-t border-dashed border-grey-300"
        style={{
          background: `repeating-linear-gradient(90deg, white 0px, white 8px, transparent 8px, transparent 16px)`,
        }}
      />
    </article>
  );
}

export default TicketCard;
