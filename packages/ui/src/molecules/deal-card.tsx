"use client";

import React from "react";
import { User, Calendar, DollarSign, Percent } from "lucide-react";
import clsx from "clsx";

export interface DealCardProps {
  id: string;
  dealNumber: string;
  name: string;
  value: number;
  probability: number;
  contactName?: string;
  expectedCloseDate?: string;
  assigneeName?: string;
  stageName?: string;
  stageColor?: string;
  onClick?: () => void;
  onQuickView?: () => void;
  className?: string;
  compact?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export function DealCard({
  dealNumber,
  name,
  value,
  probability,
  contactName,
  expectedCloseDate,
  assigneeName,
  stageName,
  stageColor,
  onClick,
  onQuickView,
  className,
  compact = false,
}: DealCardProps) {
  return (
    <div
      className={clsx(
        "bg-background border-2 border-border rounded-card transition-all cursor-pointer",
        "hover:shadow-md hover:border-primary/50",
        compact ? "p-2" : "p-3",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-body-xs text-muted-foreground">{dealNumber}</p>
          <p
            className={clsx(
              "font-weight-medium line-clamp-2",
              compact ? "text-body-xs" : "text-body-sm"
            )}
          >
            {name}
          </p>
        </div>
        {stageName && stageColor && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stageColor }}
            />
            <span className="text-body-xs text-muted-foreground">{stageName}</span>
          </div>
        )}
      </div>

      {/* Value & Probability */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          <span className="text-body-sm font-weight-semibold text-primary">
            {formatCurrency(value)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Percent className="h-3 w-3 text-muted-foreground" />
          <span className="text-body-xs px-1.5 py-0.5 bg-muted rounded-badge">
            {probability}%
          </span>
        </div>
      </div>

      {/* Details */}
      {!compact && (
        <div className="mt-2 pt-2 border-t border-border space-y-1">
          {contactName && (
            <div className="flex items-center gap-1.5 text-body-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">{contactName}</span>
            </div>
          )}
          {expectedCloseDate && (
            <div className="flex items-center gap-1.5 text-body-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Expected: {formatDate(expectedCloseDate)}</span>
            </div>
          )}
          {assigneeName && (
            <div className="flex items-center gap-1.5 text-body-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="truncate">Assigned: {assigneeName}</span>
            </div>
          )}
        </div>
      )}

      {/* Quick View Button */}
      {onQuickView && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView();
          }}
          className="mt-2 w-full text-body-xs text-primary hover:underline"
        >
          Quick View
        </button>
      )}
    </div>
  );
}

export default DealCard;
