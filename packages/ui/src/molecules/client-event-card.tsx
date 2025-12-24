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
  ClockIcon,
} from "lucide-react";
import clsx from "clsx";

export interface ClientEventCardProps {
  id: string;
  name: string;
  eventType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  venue?: {
    name: string;
    address?: string;
  };
  guestCount?: number;
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
  documentsCount?: number;
  invoicesCount?: number;
  balanceDue?: number;
  onClick?: () => void;
  onViewDocuments?: () => void;
  onViewInvoices?: () => void;
  className?: string;
}

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
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  upcoming: { label: "Upcoming", color: "bg-primary/10 text-primary", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-warning/10 text-warning", icon: ClockIcon },
  completed: { label: "Completed", color: "bg-success/10 text-success", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground", icon: AlertCircle },
};

export function ClientEventCard({
  name,
  eventType,
  date,
  startTime,
  endTime,
  venue,
  guestCount,
  status,
  documentsCount = 0,
  invoicesCount = 0,
  balanceDue,
  onClick,
  onViewDocuments,
  onViewInvoices,
  className,
}: ClientEventCardProps) {
  const statusInfo = statusConfig[status] || statusConfig.upcoming;
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={clsx(
        "bg-background border-2 border-border rounded-card overflow-hidden transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/50",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-body-xs text-muted-foreground">{eventType}</span>
              <span
                className={clsx(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-body-xs font-weight-medium",
                  statusInfo.color
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </span>
            </div>
            <h3 className="text-body-md font-weight-semibold line-clamp-2">{name}</h3>
          </div>
          {onClick && (
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Date & Time */}
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-body-sm">{formatDate(date)}</p>
            {startTime && (
              <p className="text-body-xs text-muted-foreground">
                {formatTime(startTime)}
                {endTime && ` - ${formatTime(endTime)}`}
              </p>
            )}
          </div>
        </div>

        {/* Venue */}
        {venue && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-body-sm">{venue.name}</p>
              {venue.address && (
                <p className="text-body-xs text-muted-foreground">{venue.address}</p>
              )}
            </div>
          </div>
        )}

        {/* Guest Count */}
        {guestCount !== undefined && (
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <p className="text-body-sm">{guestCount} guests</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        {onViewDocuments && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDocuments();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-button hover:bg-muted/80 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="text-body-xs">
              {documentsCount} {documentsCount === 1 ? "Document" : "Documents"}
            </span>
          </button>
        )}
        {onViewInvoices && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewInvoices();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-button hover:bg-muted/80 transition-colors"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span className="text-body-xs">
              {invoicesCount} {invoicesCount === 1 ? "Invoice" : "Invoices"}
            </span>
          </button>
        )}
      </div>

      {/* Balance Due */}
      {balanceDue !== undefined && balanceDue > 0 && (
        <div className="px-4 py-3 bg-warning/5 border-t border-warning/20">
          <div className="flex items-center justify-between">
            <span className="text-body-xs text-warning font-weight-medium">
              Balance Due
            </span>
            <span className="text-body-sm font-weight-semibold text-warning">
              {formatCurrency(balanceDue)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientEventCard;
