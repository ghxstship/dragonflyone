"use client";

import React from "react";
import {
  X,
  User,
  Calendar,
  Mail,
  Phone,
  Building,
  Edit,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { 
  dealQuickViewVariants,
  dealQuickViewModalVariants,
  dealQuickViewHeaderVariants,
  dealQuickViewTitleVariants,
  dealQuickViewCloseVariants,
  dealQuickViewContentVariants,
  dealQuickViewSectionVariants,
  dealQuickViewSectionTitleVariants,
  dealQuickViewMetricsVariants,
  dealQuickViewMetricVariants,
  dealQuickViewMetricLabelVariants,
  dealQuickViewMetricValueVariants,
  dealQuickViewInfoItemVariants,
  dealQuickViewFooterVariants,
  dealQuickViewActionVariants 
} from "./DealQuickView.variants.js";
import type { 
  DealQuickViewProps 
} from "./DealQuickView.types.js";

/**
 * DealQuickView component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Modal overlay with backdrop blur
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Comprehensive deal information display
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <DealQuickView
 *   deal={{
 *     id: "deal-1",
 *     deal_number: "DEAL-001",
 *     name: "Enterprise Software License",
 *     value: 50000,
 *     probability: 75,
 *     contact_name: "John Doe"
 *   }}
 *   onClose={() => console.log('Closed')}
 * />
 * ```
 */
export function DealQuickView({
  deal,
  onClose,
  onEdit,
  onDelete,
  onMoveStage,
  inverted = false,
  className,
}: DealQuickViewProps) {
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
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format date time
  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className={dealQuickViewVariants({ inverted, className })}
      onKeyDown={handleKeyDown}
    >
      {/* Modal */}
      <div className={dealQuickViewModalVariants({ inverted })}>
        {/* Header */}
        <div className={dealQuickViewHeaderVariants({ inverted })}>
          <h2 className={dealQuickViewTitleVariants({ inverted })}>
            {deal.deal_number}
          </h2>
          
          <button
            onClick={onClose}
            className={dealQuickViewCloseVariants({ inverted })}
            aria-label="Close quick view"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className={dealQuickViewContentVariants({ inverted })}>
          {/* Deal Title */}
          <div className={dealQuickViewSectionVariants({ inverted })}>
            <h3 className={`text-2xl font-bold ${inverted ? 'text-text-inverse' : 'text-text-primary'}`}>
              {deal.name}
            </h3>
            {deal.company && (
              <p className={`text-sm ${inverted ? 'text-text-secondary-inverse' : 'text-text-secondary'}`}>
                {deal.company}
              </p>
            )}
          </div>

          {/* Metrics */}
          <div className={dealQuickViewMetricsVariants({ inverted })}>
            {/* Value */}
            <div className={dealQuickViewMetricVariants({ inverted })}>
              <div className={dealQuickViewMetricLabelVariants({ inverted })}>
                VALUE
              </div>
              <div className={dealQuickViewMetricValueVariants({ inverted })}>
                {formatCurrency(deal.value)}
              </div>
            </div>

            {/* Probability */}
            <div className={dealQuickViewMetricVariants({ inverted })}>
              <div className={dealQuickViewMetricLabelVariants({ inverted })}>
                PROBABILITY
              </div>
              <div className={`font-bold text-lg ${
                deal.probability >= 75 ? "text-success-600" :
                deal.probability >= 50 ? "text-warning-600" :
                "text-error-600"
              }`}>
                {deal.probability}%
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {(deal.contact_name || deal.contact_email || deal.contact_phone) && (
            <div className={dealQuickViewSectionVariants({ inverted })}>
              <h4 className={dealQuickViewSectionTitleVariants({ inverted })}>
                CONTACT INFORMATION
              </h4>
              
              {deal.contact_name && (
                <div className={dealQuickViewInfoItemVariants({ inverted })}>
                  <User className="w-4 h-4" />
                  <span>{deal.contact_name}</span>
                </div>
              )}
              
              {deal.contact_email && (
                <div className={dealQuickViewInfoItemVariants({ inverted })}>
                  <Mail className="w-4 h-4" />
                  <span>{deal.contact_email}</span>
                </div>
              )}
              
              {deal.contact_phone && (
                <div className={dealQuickViewInfoItemVariants({ inverted })}>
                  <Phone className="w-4 h-4" />
                  <span>{deal.contact_phone}</span>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          {(deal.expected_close_date || deal.stage || deal.assignee) && (
            <div className={dealQuickViewSectionVariants({ inverted })}>
              <h4 className={dealQuickViewSectionTitleVariants({ inverted })}>
                TIMELINE
              </h4>
              
              {deal.expected_close_date && (
                <div className={dealQuickViewInfoItemVariants({ inverted })}>
                  <Calendar className="w-4 h-4" />
                  <span>Expected Close: {formatDate(deal.expected_close_date)}</span>
                </div>
              )}
              
              {deal.stage && (
                <div className={dealQuickViewInfoItemVariants({ inverted })}>
                  <Building className="w-4 h-4" />
                  <span>Stage: {deal.stage.name}</span>
                </div>
              )}
              
              {deal.assignee && (
                <div className={dealQuickViewInfoItemVariants({ inverted })}>
                  <User className="w-4 h-4" />
                  <span>Assigned to: {deal.assignee.full_name}</span>
                </div>
              )}
            </div>
          )}

          {/* Additional Information */}
          {(deal.source || deal.notes || deal.created_at) && (
            <div className={dealQuickViewSectionVariants({ inverted })}>
              <h4 className={dealQuickViewSectionTitleVariants({ inverted })}>
                ADDITIONAL INFORMATION
              </h4>
              
              {deal.source && (
                <div className={dealQuickViewInfoItemVariants({ inverted })}>
                  <ArrowRight className="w-4 h-4" />
                  <span>Source: {deal.source}</span>
                </div>
              )}
              
              {deal.notes && (
                <div className={`p-3 border-2 rounded-[var(--radius-card)] ${
                  inverted 
                    ? "bg-surface-elevated-inverse border-border-inverse text-text-inverse" 
                    : "bg-surface-elevated border-border text-text-primary"
                }`}>
                  {deal.notes}
                </div>
              )}
              
              {deal.created_at && (
                <div className={dealQuickViewInfoItemVariants({ inverted })}>
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDateTime(deal.created_at)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={dealQuickViewFooterVariants({ inverted })}>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className={dealQuickViewActionVariants({ variant: "default", inverted })}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            
            {onMoveStage && (
              <button
                onClick={onMoveStage}
                className={dealQuickViewActionVariants({ variant: "primary", inverted })}
              >
                <ArrowRight className="w-4 h-4" />
                Move Stage
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={onDelete}
                className={dealQuickViewActionVariants({ variant: "danger", inverted })}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
