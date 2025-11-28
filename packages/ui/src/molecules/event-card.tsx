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
  "on-sale": { label: "ON SALE", bgClass: "bg-black", textClass: "text-white" },
  "sold-out": { label: "SOLD OUT", bgClass: "bg-grey-600", textClass: "text-white" },
  "coming-soon": { label: "COMING SOON", bgClass: "bg-grey-800", textClass: "text-white" },
  "cancelled": { label: "CANCELLED", bgClass: "bg-grey-500", textClass: "text-white" },
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
      className={clsx(
        "flex border-2 overflow-hidden transition-all duration-100 ease-[var(--ease-bounce)] rounded-[var(--radius-card)]",
        inverted
          ? "bg-ink-900 border-grey-700 text-white shadow-[4px_4px_0_rgba(255,255,255,0.1)]"
          : "bg-white border-black text-black shadow-[4px_4px_0_rgba(0,0,0,0.1)]",
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
          "relative bg-grey-200 flex-shrink-0 overflow-hidden",
          isCompact ? "w-spacing-28" : "w-full",
          imageHeightClass
        )}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
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
            inverted ? "bg-ink-900 border-grey-600" : "bg-white border-black"
          )}>
            <div className={clsx("font-heading text-h3-md leading-none", inverted ? "text-white" : "text-black")}>
              {dateInfo.day}
            </div>
            <div className={clsx("font-code text-mono-xs tracking-widest mt-spacing-1", inverted ? "text-grey-400" : "text-grey-600")}>
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
              "absolute bg-black text-white font-code text-mono-xs tracking-widest px-spacing-2 py-spacing-1 flex items-center gap-gap-xs",
              isCompact ? "bottom-spacing-2 left-spacing-2" : "bottom-spacing-4 left-spacing-4"
            )}
          >
            <span className="w-spacing-1 h-spacing-1 bg-white rounded-full animate-pulse" />
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
          <span className="font-code text-mono-xs text-grey-500 tracking-widest uppercase">
            {category}
          </span>
        )}

        {/* Title */}
        <h3
          className={clsx(
            "font-heading uppercase tracking-wide leading-snug",
            inverted ? "text-white" : "text-black",
            isFeatured ? "text-h2-md" : isCompact ? "text-h5-md" : "text-h4-md"
          )}
        >
          {title}
        </h3>

        {/* Venue & Location */}
        <div
          className={clsx(
            "font-body",
            inverted ? "text-grey-300" : "text-grey-700",
            isCompact ? "text-body-sm" : "text-body-md"
          )}
        >
          {venue}
        </div>
        <div className={clsx("font-code text-mono-sm tracking-wide", inverted ? "text-grey-400" : "text-grey-500")}>
          {location}
        </div>

        {/* Compact Date */}
        {isCompact && (
          <div className={clsx("font-code text-mono-xs tracking-widest mt-auto", inverted ? "text-grey-400" : "text-grey-600")}>
            {dateInfo.weekday} {dateInfo.month} {dateInfo.day}
          </div>
        )}

        {/* Price */}
        {price && !isCompact && (
          <div className={clsx("font-heading text-h5-md mt-auto pt-spacing-2", inverted ? "text-white" : "text-black")}>
            {price}
          </div>
        )}
      </div>
    </article>
  );
}

export default EventCard;
