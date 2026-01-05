"use client";

import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  CreditCard,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
} from "lucide-react";
import { 
  clientEventCardVariants,
  clientEventCardContentVariants,
  clientEventCardHeaderVariants,
  clientEventCardTitleVariants,
  clientEventCardStatusVariants,
  clientEventCardDetailsVariants,
  clientEventCardDetailItemVariants,
  clientEventCardFooterVariants,
  clientEventCardActionVariants 
} from "./ClientEventCard.variants.js";
import type { 
  ClientEventCardProps, 
  ClientEventCardStatus 
} from "./ClientEventCard.types.js";

/**
 * ClientEventCard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Status-based styling
 * - Interactive hover states
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <ClientEventCard
 *   id="event-1"
 *   name="Birthday Party"
 *   eventType="Birthday"
 *   date="2024-03-15"
 *   startTime="18:00"
 *   endTime="22:00"
 *   venue={{ name: "Party Hall", address: "123 Main St" }}
 *   guestCount={25}
 *   status="upcoming"
 *   onClick={() => console.log('Card clicked')}
 * />
 * ```
 */
export function ClientEventCard({
  name,
  eventType,
  date,
  startTime,
  endTime,
  venue,
  guestCount,
  status,
  documentsCount,
  invoicesCount,
  balanceDue,
  onClick,
  onViewDocuments,
  onViewInvoices,
  inverted = false,
  className,
}: ClientEventCardProps) {
  // Format date and time
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get status icon
  const getStatusIcon = (cardStatus: ClientEventCardStatus) => {
    switch (cardStatus) {
      case "upcoming":
        return <Calendar className="w-4 h-4" />;
      case "in_progress":
        return <ClockIcon className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={clientEventCardVariants({ status, inverted, className })}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Event: ${name}`}
    >
      <div className={clientEventCardContentVariants({ inverted })}>
        {/* Header */}
        <div className={clientEventCardHeaderVariants({ inverted })}>
          <div className="flex-1">
            <h3 className={clientEventCardTitleVariants({ inverted })}>
              {name}
            </h3>
            <p className={`text-sm ${inverted ? 'text-text-secondary-inverse' : 'text-text-secondary'}`}>
              {eventType}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className={clientEventCardStatusVariants({ status })}>
            <div className="flex items-center gap-1">
              {getStatusIcon(status)}
              <span>{status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className={clientEventCardDetailsVariants({ inverted })}>
          {/* Date */}
          <div className={clientEventCardDetailItemVariants({ inverted })}>
            <Calendar className="w-4 h-4" />
            <span>{formatDate(date)}</span>
          </div>

          {/* Time */}
          {startTime && (
            <div className={clientEventCardDetailItemVariants({ inverted })}>
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(startTime)}
                {endTime && ` - ${formatTime(endTime)}`}
              </span>
            </div>
          )}

          {/* Venue */}
          {venue && (
            <div className={clientEventCardDetailItemVariants({ inverted })}>
              <MapPin className="w-4 h-4" />
              <span>
                {venue.name}
                {venue.address && `, ${venue.address}`}
              </span>
            </div>
          )}

          {/* Guest Count */}
          {guestCount && (
            <div className={clientEventCardDetailItemVariants({ inverted })}>
              <Users className="w-4 h-4" />
              <span>{guestCount} guest{guestCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {(documentsCount || invoicesCount || balanceDue !== undefined) && (
          <div className={clientEventCardFooterVariants({ inverted })}>
            <div className="flex items-center gap-4">
              {/* Documents */}
              {documentsCount !== undefined && documentsCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDocuments?.();
                  }}
                  className={clientEventCardActionVariants({ inverted })}
                >
                  <FileText className="w-4 h-4" />
                  <span>{documentsCount} document{documentsCount !== 1 ? 's' : ''}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Invoices */}
              {invoicesCount !== undefined && invoicesCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewInvoices?.();
                  }}
                  className={clientEventCardActionVariants({ inverted })}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{invoicesCount} invoice{invoicesCount !== 1 ? 's' : ''}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Balance Due */}
              {balanceDue !== undefined && balanceDue > 0 && (
                <div className={`text-sm font-bold ${
                  inverted ? 'text-error-400' : 'text-error-600'
                }`}>
                  Balance: ${balanceDue.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
