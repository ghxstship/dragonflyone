"use client";

import React from "react";
import { 
  eventCardVariants,
  eventCardImageVariants,
  eventCardDateVariants,
  eventCardContentVariants,
  eventCardStatusVariants 
} from "./EventCard.variants.js";
import type { EventCardProps, FormattedDate } from "./EventCard.types.js";

/**
 * EventCard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Interactive hover states
 * - Status badges
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <EventCard
 *   id="event-123"
 *   title="Summer Music Festival"
 *   date={new Date('2024-07-15')}
 *   venue="Madison Square Garden"
 *   location="New York, NY"
 *   imageUrl="/event-image.jpg"
 *   price="$45 - $125"
 *   status="on-sale"
 *   onClick={() => console.log('Card clicked')}
 * />
 * ```
 */
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
  className,
}: EventCardProps) {
  // Format date for display
  const formatDate = (date: Date | string): FormattedDate => {
    const d = typeof date === "string" ? new Date(date) : date;
    return {
      day: d.getDate().toString(),
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
    };
  };

  const formattedDate = formatDate(date);

  return (
    <article
      className={eventCardVariants({ variant, inverted, className })}
      onClick={() => onClick?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Event: ${title} at ${venue} on ${formattedDate.month} ${formattedDate.day}`}
      data-event-id={id}
    >
      {/* Status Badge */}
      {status && (
        <div className={eventCardStatusVariants({ status })}>
          {status.replace('-', ' ').toUpperCase()}
        </div>
      )}

      {/* Image */}
      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt={`${title} at ${venue}`}
            className={eventCardImageVariants({ variant })}
          />
          {/* Date overlay on image */}
          <div className="absolute top-2 left-2">
            <div className={eventCardDateVariants({ inverted })}>
              <div className="text-lg">{formattedDate.day}</div>
              <div className="text-xs">{formattedDate.month}</div>
            </div>
          </div>
        </div>
      ) : (
        // Date display when no image
        <div className="flex justify-center p-6">
          <div className={eventCardDateVariants({ inverted })}>
            <div className="text-2xl">{formattedDate.day}</div>
            <div className="text-sm">{formattedDate.month}</div>
            <div className="text-xs">{formattedDate.weekday}</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={eventCardContentVariants({ variant })}>
        {/* Category */}
        {category && (
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
            {category}
          </div>
        )}

        {/* Title */}
        <h3 className="font-bold text-lg text-text-primary line-clamp-2">
          {title}
        </h3>

        {/* Venue and Location */}
        <div className="text-sm text-text-secondary">
          <div className="font-medium">{venue}</div>
          <div>{location}</div>
        </div>

        {/* Price */}
        {price && (
          <div className="font-bold text-text-primary">
            {price}
          </div>
        )}

        {/* Tickets Remaining */}
        {ticketsRemaining !== undefined && ticketsRemaining > 0 && (
          <div className="text-xs text-text-muted">
            {ticketsRemaining} tickets remaining
          </div>
        )}

        {/* Urgency for low tickets */}
        {ticketsRemaining !== undefined && ticketsRemaining <= 10 && ticketsRemaining > 0 && (
          <div className="text-xs font-bold text-error-600 animate-pulse">
            Only {ticketsRemaining} tickets left!
          </div>
        )}
      </div>
    </article>
  );
}
