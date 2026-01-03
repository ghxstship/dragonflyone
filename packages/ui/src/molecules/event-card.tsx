"use client";

import React from "react";
import clsx from "clsx";

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
  /** Inverted theme (dark background) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

const statusConfig = {
  "on-sale": { label: "ON SALE", bgClass: "bg-surface-inverse", textClass: "text-text-primary" },
  "sold-out": { label: "SOLD OUT", bgClass: "bg-muted", textClass: "text-text-primary" },
  "coming-soon": { label: "COMING SOON", bgClass: "bg-surface-elevated", textClass: "text-text-primary" },
  "cancelled": { label: "CANCELLED", bgClass: "bg-muted", textClass: "text-text-primary" },
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
  inverted = false,
  className = "",
}: EventCardProps) {
  const dateInfo = formatDate(date);
  const statusInfo = statusConfig[status];
  const showUrgency = ticketsRemaining !== undefined && ticketsRemaining > 0 && ticketsRemaining <= 50;

  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  const imageHeightClass = isFeatured ? "h-[280px]" : isCompact ? "h-[120px]" : "h-[180px]";

  return (
    <article
      data-event-id={id}
      className={clsx(
        "flex border-2 overflow-hidden transition-all duration-100 ease-[var(--ease-bounce)] rounded-[var(--radius-card)]",
        inverted
          ? "bg-surface-inverse border-border text-text-primary shadow-md"
          : "bg-surface-primary border-border-primary text-text-primary shadow-md",
        isFeatured || !isCompact ? "flex-col" : "flex-row",
        onClick && "cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)]",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Image Section */}
      <div
        className={clsx(
          "relative bg-muted flex-shrink-0 overflow-hidden",
          isCompact ? "w-spacing-28" : "w-full",
          imageHeightClass
        )}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className={clsx(
              "w-full h-full object-cover",
              status === "cancelled" ? "grayscale opacity-50" : "grayscale contrast-[1.1]"
            )}
          />
        )}

        {/* Date Badge */}
        {!isCompact && (
          <div className={clsx(
            "absolute top-spacing-4 left-spacing-4 border-2 px-spacing-3 py-spacing-2 text-center min-w-spacing-14",
            inverted ? "bg-surface-inverse border-border" : "bg-surface-primary border-border-primary"
          )}>
            <div className={clsx("font-heading text-h3-md leading-none", inverted ? "text-text-primary" : "text-text-primary")}>
              {dateInfo.day}
            </div>
            <div className={clsx("font-code text-mono-xs tracking-widest mt-spacing-1", inverted ? "text-text-muted" : "text-text-muted")}>
              {dateInfo.month}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div
          className={clsx(
            "absolute font-code text-mono-xs tracking-widest px-spacing-2 py-spacing-1",
            isCompact ? "top-spacing-2 right-spacing-2" : "top-spacing-4 right-spacing-4",
            statusInfo.bgClass,
            statusInfo.textClass
          )}
        >
          {statusInfo.label}
        </div>

        {/* Urgency Indicator */}
        {showUrgency && status === "on-sale" && (
          <div
            className={clsx(
              "absolute bg-surface-inverse text-text-primary font-code text-mono-xs tracking-widest px-spacing-2 py-spacing-1 flex items-center gap-gap-xs",
              isCompact ? "bottom-spacing-2 left-spacing-2" : "bottom-spacing-4 left-spacing-4"
            )}
          >
            <span className="w-spacing-1 h-spacing-1 bg-on-dark-primary rounded-full animate-pulse" />
            {ticketsRemaining <= 10 ? "ALMOST GONE" : `${ticketsRemaining} LEFT`}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div
        className={clsx(
          "flex flex-col flex-1",
          isCompact ? "p-spacing-3 gap-gap-xs" : "p-spacing-5 gap-gap-xs"
        )}
      >
        {/* Category */}
        {category && !isCompact && (
          <span className="font-code text-mono-xs text-text-disabled tracking-widest uppercase">
            {category}
          </span>
        )}

        {/* Title */}
        <h3
          className={clsx(
            "font-heading uppercase tracking-wide leading-snug",
            inverted ? "text-text-primary" : "text-text-primary",
            isFeatured ? "text-h2-md" : isCompact ? "text-h5-md" : "text-h4-md"
          )}
        >
          {title}
        </h3>

        {/* Venue & Location */}
        <div
          className={clsx(
            "font-body",
            inverted ? "text-text-secondary" : "text-text-muted",
            isCompact ? "text-body-sm" : "text-body-md"
          )}
        >
          {venue}
        </div>
        <div className={clsx("font-code text-mono-sm tracking-wide", inverted ? "text-text-muted" : "text-text-muted")}>
          {location}
        </div>

        {/* Compact Date */}
        {isCompact && (
          <div className={clsx("font-code text-mono-xs tracking-widest mt-auto", inverted ? "text-text-muted" : "text-text-muted")}>
            {dateInfo.weekday} {dateInfo.month} {dateInfo.day}
          </div>
        )}

        {/* Price */}
        {price && !isCompact && (
          <div className={clsx("font-heading text-h5-md mt-auto pt-spacing-2", inverted ? "text-text-primary" : "text-text-primary")}>
            {price}
          </div>
        )}
      </div>
    </article>
  );
}

export default EventCard;
