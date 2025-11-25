"use client";

import React from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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
  valid: { label: "VALID", bgColor: colors.black, textColor: colors.white },
  used: { label: "USED", bgColor: colors.grey500, textColor: colors.white },
  transferred: { label: "TRANSFERRED", bgColor: colors.grey600, textColor: colors.white },
  refunded: { label: "REFUNDED", bgColor: colors.grey400, textColor: colors.black },
  expired: { label: "EXPIRED", bgColor: colors.grey300, textColor: colors.grey700 },
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
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.white,
        border: `${borderWidths.medium} solid ${colors.black}`,
        cursor: onClick ? "pointer" : "default",
        transition: transitions.base,
        overflow: "hidden",
        opacity: isActive ? 1 : 0.7,
      }}
    >
      {/* Header with Status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.25rem",
          borderBottom: `${borderWidths.thin} solid ${colors.grey200}`,
        }}
      >
        <div
          style={{
            fontFamily: typography.mono,
            fontSize: fontSizes.monoSM,
            color: colors.grey600,
            letterSpacing: letterSpacing.widest,
          }}
        >
          {ticketType}
        </div>
        <div
          style={{
            backgroundColor: statusInfo.bgColor,
            color: statusInfo.textColor,
            fontFamily: typography.mono,
            fontSize: fontSizes.monoXS,
            letterSpacing: letterSpacing.widest,
            padding: "0.25rem 0.5rem",
          }}
        >
          {statusInfo.label}
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          padding: "1.25rem",
          display: "flex",
          gap: "1.5rem",
        }}
      >
        {/* Event Info */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3
            style={{
              fontFamily: typography.heading,
              fontSize: fontSizes.h4MD,
              color: colors.black,
              textTransform: "uppercase",
              letterSpacing: letterSpacing.wide,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {eventTitle}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <div
              style={{
                fontFamily: typography.mono,
                fontSize: fontSizes.monoSM,
                color: colors.black,
                letterSpacing: letterSpacing.wide,
              }}
            >
              {formatDate(date)}
              {time && ` // ${time}`}
            </div>
            <div
              style={{
                fontFamily: typography.body,
                fontSize: fontSizes.bodySM,
                color: colors.grey700,
              }}
            >
              {venue}
            </div>
            {seatInfo && (
              <div
                style={{
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoSM,
                  color: colors.grey600,
                  letterSpacing: letterSpacing.wide,
                }}
              >
                {seatInfo}
              </div>
            )}
          </div>

          {attendeeName && (
            <div
              style={{
                fontFamily: typography.body,
                fontSize: fontSizes.bodySM,
                color: colors.grey700,
                marginTop: "0.5rem",
              }}
            >
              {attendeeName}
            </div>
          )}
        </div>

        {/* QR Code */}
        {showQR && qrCode && isActive && (
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: colors.white,
              border: `${borderWidths.thin} solid ${colors.grey300}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCode}
              alt="Ticket QR Code"
              style={{
                width: "90%",
                height: "90%",
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>

      {/* Footer with Order Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1.25rem",
          backgroundColor: colors.grey100,
          borderTop: `${borderWidths.thin} solid ${colors.grey200}`,
        }}
      >
        <div
          style={{
            fontFamily: typography.mono,
            fontSize: fontSizes.monoXS,
            color: colors.grey500,
            letterSpacing: letterSpacing.widest,
          }}
        >
          {orderNumber && `ORDER #${orderNumber}`}
        </div>
        <div
          style={{
            fontFamily: typography.mono,
            fontSize: fontSizes.monoXS,
            color: colors.grey500,
            letterSpacing: letterSpacing.widest,
          }}
        >
          ID: {id.slice(0, 8).toUpperCase()}
        </div>
      </div>

      {/* Perforated Edge Effect */}
      <div
        style={{
          height: "8px",
          background: `repeating-linear-gradient(
            90deg,
            ${colors.white} 0px,
            ${colors.white} 8px,
            transparent 8px,
            transparent 16px
          )`,
          borderTop: `${borderWidths.thin} dashed ${colors.grey300}`,
        }}
      />
    </article>
  );
}

export default TicketCard;
