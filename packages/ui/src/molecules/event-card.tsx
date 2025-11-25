"use client";

import React from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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
  status?: "on-sale" | "sold-out" | "coming-soon" | "cancelled";
  /** Number of tickets remaining (for urgency) */
  ticketsRemaining?: number;
  /** Event category/genre */
  category?: string;
  /** Card variant */
  variant?: "default" | "compact" | "featured";
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
}

const statusConfig = {
  "on-sale": { label: "ON SALE", bgColor: colors.black, textColor: colors.white },
  "sold-out": { label: "SOLD OUT", bgColor: colors.grey600, textColor: colors.white },
  "coming-soon": { label: "COMING SOON", bgColor: colors.grey800, textColor: colors.white },
  "cancelled": { label: "CANCELLED", bgColor: colors.grey500, textColor: colors.white },
};

function formatDate(date: Date | string): { day: string; month: string; weekday: string } {
  const d = typeof date === "string" ? new Date(date) : date;
  return {
    day: d.getDate().toString(),
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
  };
}

export function EventCard({
  id,
  title,
  date,
  venue,
  location,
  imageUrl,
  price,
  status = "on-sale",
  ticketsRemaining,
  category,
  variant = "default",
  onClick,
  className = "",
}: EventCardProps) {
  const dateInfo = formatDate(date);
  const statusInfo = statusConfig[status];
  const showUrgency = ticketsRemaining !== undefined && ticketsRemaining > 0 && ticketsRemaining <= 50;

  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <article
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{
        display: "flex",
        flexDirection: isFeatured ? "column" : isCompact ? "row" : "column",
        backgroundColor: colors.white,
        border: `${borderWidths.medium} solid ${colors.black}`,
        cursor: onClick ? "pointer" : "default",
        transition: transitions.base,
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = `4px 4px 0 0 ${colors.black}`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {/* Image Section */}
      <div
        style={{
          position: "relative",
          width: isCompact ? "120px" : "100%",
          height: isFeatured ? "280px" : isCompact ? "120px" : "180px",
          backgroundColor: colors.grey200,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: status === "cancelled" ? "grayscale(100%)" : "grayscale(100%) contrast(1.1)",
              opacity: status === "cancelled" ? 0.5 : 1,
            }}
          />
        )}

        {/* Date Badge */}
        {!isCompact && (
          <div
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              backgroundColor: colors.white,
              border: `${borderWidths.medium} solid ${colors.black}`,
              padding: "0.5rem 0.75rem",
              textAlign: "center",
              minWidth: "3.5rem",
            }}
          >
            <div
              style={{
                fontFamily: typography.heading,
                fontSize: fontSizes.h3MD,
                color: colors.black,
                lineHeight: 1,
              }}
            >
              {dateInfo.day}
            </div>
            <div
              style={{
                fontFamily: typography.mono,
                fontSize: fontSizes.monoXS,
                color: colors.grey600,
                letterSpacing: letterSpacing.widest,
                marginTop: "0.25rem",
              }}
            >
              {dateInfo.month}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div
          style={{
            position: "absolute",
            top: isCompact ? "0.5rem" : "1rem",
            right: isCompact ? "0.5rem" : "1rem",
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

        {/* Urgency Indicator */}
        {showUrgency && status === "on-sale" && (
          <div
            style={{
              position: "absolute",
              bottom: isCompact ? "0.5rem" : "1rem",
              left: isCompact ? "0.5rem" : "1rem",
              backgroundColor: colors.black,
              color: colors.white,
              fontFamily: typography.mono,
              fontSize: fontSizes.monoXS,
              letterSpacing: letterSpacing.widest,
              padding: "0.25rem 0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: colors.white,
                borderRadius: "50%",
                animation: "pulse 2s infinite",
              }}
            />
            {ticketsRemaining <= 10 ? "ALMOST GONE" : `${ticketsRemaining} LEFT`}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div
        style={{
          padding: isCompact ? "0.75rem" : "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: isCompact ? "0.25rem" : "0.5rem",
          flex: 1,
        }}
      >
        {/* Category */}
        {category && !isCompact && (
          <span
            style={{
              fontFamily: typography.mono,
              fontSize: fontSizes.monoXS,
              color: colors.grey500,
              letterSpacing: letterSpacing.widest,
              textTransform: "uppercase",
            }}
          >
            {category}
          </span>
        )}

        {/* Title */}
        <h3
          style={{
            fontFamily: typography.heading,
            fontSize: isFeatured ? fontSizes.h2MD : isCompact ? fontSizes.h5MD : fontSizes.h4MD,
            color: colors.black,
            textTransform: "uppercase",
            letterSpacing: letterSpacing.wide,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h3>

        {/* Venue & Location */}
        <div
          style={{
            fontFamily: typography.body,
            fontSize: isCompact ? fontSizes.bodySM : fontSizes.bodyMD,
            color: colors.grey700,
          }}
        >
          {venue}
        </div>
        <div
          style={{
            fontFamily: typography.mono,
            fontSize: fontSizes.monoSM,
            color: colors.grey500,
            letterSpacing: letterSpacing.wide,
          }}
        >
          {location}
        </div>

        {/* Compact Date */}
        {isCompact && (
          <div
            style={{
              fontFamily: typography.mono,
              fontSize: fontSizes.monoXS,
              color: colors.grey600,
              letterSpacing: letterSpacing.widest,
              marginTop: "auto",
            }}
          >
            {dateInfo.weekday} {dateInfo.month} {dateInfo.day}
          </div>
        )}

        {/* Price */}
        {price && !isCompact && (
          <div
            style={{
              fontFamily: typography.heading,
              fontSize: fontSizes.h5MD,
              color: colors.black,
              marginTop: "auto",
              paddingTop: "0.5rem",
            }}
          >
            {price}
          </div>
        )}
      </div>
    </article>
  );
}

export default EventCard;
