"use client";

import React from "react";
import { User, Calendar, DollarSign, Percent, Eye } from "lucide-react";
import { 
  dealCardVariants,
  dealCardHeaderVariants,
  dealCardDealInfoVariants,
  dealCardDealNumberVariants,
  dealCardDealNameVariants,
  dealCardMetricsVariants,
  dealCardMetricVariants,
  dealCardMetricLabelVariants,
  dealCardMetricValueVariants,
  dealCardDetailsVariants,
  dealCardDetailItemVariants,
  dealCardStageVariants 
} from "./DealCard.variants.js";
import type { DealCardProps } from "./DealCard.types.js";

/**
 * DealCard component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Deal pipeline visualization
 * - Multiple variants (default, compact)
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <DealCard
 *   id="deal-1"
 *   dealNumber="DEAL-001"
 *   name="Enterprise Software License"
 *   value={50000}
 *   probability={75}
 *   contactName="John Doe"
 *   stageName="Proposal"
 *   onClick={() => console.log('Card clicked')}
 * />
 * ```
 */
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
  inverted = false,
  compact = false,
  className,
}: DealCardProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get probability color based on value
  const getProbabilityColor = (prob: number) => {
    if (prob >= 75) return "text-success-600";
    if (prob >= 50) return "text-warning-600";
    if (prob >= 25) return "text-error-600";
    return "text-error-600";
  };

  const cardVariant = compact ? "compact" : "default";

  return (
    <div
      className={dealCardVariants({ variant: cardVariant, inverted, className })}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Deal: ${name}, Value: ${formatCurrency(value)}, Probability: ${probability}%`}
    >
      {/* Header */}
      <div className={dealCardHeaderVariants({ variant: cardVariant, inverted })}>
        {/* Deal Info */}
        <div className={dealCardDealInfoVariants({ variant: cardVariant, inverted })}>
          <div className={dealCardDealNumberVariants({ inverted })}>
            {dealNumber}
          </div>
          <h3 className={dealCardDealNameVariants({ variant: cardVariant, inverted })}>
            {name}
          </h3>
        </div>

        {/* Stage Badge */}
        {stageName && (
          <div 
            className={dealCardStageVariants({ inverted })}
            style={{ 
              backgroundColor: stageColor || 'var(--color-brand-primary)',
              color: 'white'
            }}
          >
            {stageName}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className={dealCardMetricsVariants({ variant: cardVariant, inverted })}>
        {/* Value */}
        <div className={dealCardMetricVariants({ inverted })}>
          <DollarSign className="w-4 h-4" />
          <div>
            <div className={dealCardMetricLabelVariants({ inverted })}>
              VALUE
            </div>
            <div className={dealCardMetricValueVariants({ type: "value", inverted })}>
              {formatCurrency(value)}
            </div>
          </div>
        </div>

        {/* Probability */}
        <div className={dealCardMetricVariants({ inverted })}>
          <Percent className="w-4 h-4" />
          <div>
            <div className={dealCardMetricLabelVariants({ inverted })}>
              PROBABILITY
            </div>
            <div className={`font-bold ${getProbabilityColor(probability)}`}>
              {probability}%
            </div>
          </div>
        </div>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
            className={`p-2 border-2 rounded-button transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] hover:scale-105 ${
              inverted 
                ? "border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse" 
                : "border-border text-text-secondary hover:bg-surface-hover"
            }`}
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Details (hidden in compact variant) */}
      <div className={dealCardDetailsVariants({ variant: cardVariant, inverted })}>
        {/* Contact */}
        {contactName && (
          <div className={dealCardDetailItemVariants({ inverted })}>
            <User className="w-4 h-4" />
            <span>{contactName}</span>
          </div>
        )}

        {/* Expected Close Date */}
        {expectedCloseDate && (
          <div className={dealCardDetailItemVariants({ inverted })}>
            <Calendar className="w-4 h-4" />
            <span>Expected: {formatDate(expectedCloseDate)}</span>
          </div>
        )}

        {/* Assignee */}
        {assigneeName && (
          <div className={dealCardDetailItemVariants({ inverted })}>
            <User className="w-4 h-4" />
            <span>Assigned to: {assigneeName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
