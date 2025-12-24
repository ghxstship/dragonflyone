"use client";

import React from "react";
import {
  X,
  User,
  Calendar,
  Percent,
  Mail,
  Phone,
  Building,
  Edit,
  Trash2,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";

export interface DealQuickViewProps {
  deal: {
    id: string;
    deal_number: string;
    name: string;
    value: number;
    probability: number;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    company?: string;
    expected_close_date?: string;
    assignee?: { full_name: string; email?: string };
    stage?: { name: string; color: string };
    notes?: string;
    source?: string;
    created_at: string;
  };
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveStage?: () => void;
  className?: string;
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
    year: "numeric",
  });
};

export function DealQuickView({
  deal,
  onClose,
  onEdit,
  onDelete,
  onMoveStage,
  className,
}: DealQuickViewProps) {
  return (
    <div
      className={clsx(
        "bg-background border-2 border-border rounded-card shadow-xl w-80",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-body-xs text-muted-foreground">{deal.deal_number}</p>
            <h3 className="text-body-md font-weight-semibold mt-0.5 line-clamp-2">
              {deal.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-button transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Stage Badge */}
        {deal.stage && (
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: deal.stage.color }}
            />
            <span className="text-body-sm">{deal.stage.name}</span>
          </div>
        )}
      </div>

      {/* Value & Probability */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-xs text-muted-foreground">Deal Value</p>
            <p className="text-h4-md font-weight-bold text-primary">
              {formatCurrency(deal.value)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-body-xs text-muted-foreground">Probability</p>
            <div className="flex items-center gap-1">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-body-lg font-weight-semibold">{deal.probability}%</span>
            </div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-body-xs text-muted-foreground">Weighted Value</p>
          <p className="text-body-md font-weight-medium">
            {formatCurrency((deal.value * deal.probability) / 100)}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-4 space-y-2">
        {deal.contact_name && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-body-sm truncate">{deal.contact_name}</span>
          </div>
        )}
        {deal.contact_email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a
              href={`mailto:${deal.contact_email}`}
              className="text-body-sm text-primary hover:underline truncate"
            >
              {deal.contact_email}
            </a>
          </div>
        )}
        {deal.contact_phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a
              href={`tel:${deal.contact_phone}`}
              className="text-body-sm text-primary hover:underline"
            >
              {deal.contact_phone}
            </a>
          </div>
        )}
        {deal.company && (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-body-sm truncate">{deal.company}</span>
          </div>
        )}
        {deal.expected_close_date && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-body-sm">
              Expected: {formatDate(deal.expected_close_date)}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {deal.notes && (
        <div className="px-4 pb-4">
          <p className="text-body-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-body-sm line-clamp-3">{deal.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-3 border-t border-border bg-muted/30 flex items-center gap-2">
        {onMoveStage && (
          <button
            onClick={onMoveStage}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-body-sm bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            Move Stage
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 border-2 border-destructive/30 rounded-button hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default DealQuickView;
