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
        "flex bg-white border-2 border-black overflow-hidden transition-all duration-base",
        isFeatured || !isCompact ? "flex-col" : "flex-row",
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-hard",
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
          isCompact ? "w-[120px]" : "w-full",
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
          <div className="absolute top-4 left-4 bg-white border-2 border-black px-3 py-2 text-center min-w-14">
            <div className="font-heading text-h3-md text-black leading-none">
              {dateInfo.day}
            </div>
            <div className="font-code text-mono-xs text-grey-600 tracking-widest mt-1">
              {dateInfo.month}
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div
          className={clsx(
            "absolute font-code text-mono-xs tracking-widest px-2 py-1",
            isCompact ? "top-2 right-2" : "top-4 right-4",
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
              "absolute bg-black text-white font-code text-mono-xs tracking-widest px-2 py-1 flex items-center gap-1.5",
              isCompact ? "bottom-2 left-2" : "bottom-4 left-4"
            )}
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            {ticketsRemaining <= 10 ? "ALMOST GONE" : `${ticketsRemaining} LEFT`}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div
        className={clsx(
          "flex flex-col flex-1",
          isCompact ? "p-3 gap-1" : "p-5 gap-2"
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
            "font-heading text-black uppercase tracking-wide leading-snug",
            isFeatured ? "text-h2-md" : isCompact ? "text-h5-md" : "text-h4-md"
          )}
        >
          {title}
        </h3>

        {/* Venue & Location */}
        <div
          className={clsx(
            "font-body text-grey-700",
            isCompact ? "text-body-sm" : "text-body-md"
          )}
        >
          {venue}
        </div>
        <div className="font-code text-mono-sm text-grey-500 tracking-wide">
          {location}
        </div>

        {/* Compact Date */}
        {isCompact && (
          <div className="font-code text-mono-xs text-grey-600 tracking-widest mt-auto">
            {dateInfo.weekday} {dateInfo.month} {dateInfo.day}
          </div>
        )}

        {/* Price */}
        {price && !isCompact && (
          <div className="font-heading text-h5-md text-black mt-auto pt-2">
            {price}
          </div>
        )}
      </div>
    </article>
  );
}

export default EventCard;
