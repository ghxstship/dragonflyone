"use client";

import React, { useState } from "react";
import { AlertTriangle, DollarSign, Loader2 } from "lucide-react";
import clsx from "clsx";
import { OverlayLayout } from "../templates/overlay-layout.js";

export interface RefundDialogProps {
  /** Whether the dialog is open (standardized prop name) */
  open: boolean;
  /** @deprecated Use `open` instead */
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: (refundData: RefundData) => Promise<void>;
  paymentId: string;
  originalAmount: number;
  amountPaid: number;
  currency?: string;
  customerName?: string;
  transactionDate?: string;
  /** @deprecated Use `loading` instead */
  isProcessing?: boolean;
  /** Loading/processing state (standardized prop name) */
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export interface RefundData {
  paymentId: string;
  amount: number;
  reason: string;
  notes?: string;
}

const refundReasons = [
  { value: "requested_by_customer", label: "Requested by customer" },
  { value: "duplicate", label: "Duplicate charge" },
  { value: "fraudulent", label: "Fraudulent transaction" },
  { value: "service_not_provided", label: "Service not provided" },
  { value: "event_cancelled", label: "Event cancelled" },
  { value: "partial_service", label: "Partial service provided" },
  { value: "other", label: "Other" },
];

const formatCurrency = (value: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};

/**
 * RefundDialog component - Bold Contemporary Pop Art Adventure
 * 
 * Built on OverlayLayout for consistent accessibility and behavior:
 * - Focus trap
 * - Escape key handling
 * - Body scroll prevention
 * - ARIA attributes
 * 
 * Features:
 * - Full/partial refund toggle
 * - Amount validation
 * - Reason selection
 * - Processing state with spinner
 */
export function RefundDialog({
  open,
  isOpen,
  onClose,
  onConfirm,
  paymentId,
  originalAmount,
  amountPaid,
  currency = "USD",
  customerName,
  transactionDate,
  isProcessing,
  loading,
  error,
  className,
}: RefundDialogProps) {
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Support both old and new prop names for backward compatibility
  const isDialogOpen = open ?? isOpen ?? false;
  const isLoading = loading ?? isProcessing ?? false;

  const refundAmount = refundType === "full" ? amountPaid : parseFloat(partialAmount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!reason) {
      setValidationError("Please select a refund reason");
      return;
    }

    if (refundType === "partial") {
      const amount = parseFloat(partialAmount);
      if (isNaN(amount) || amount <= 0) {
        setValidationError("Please enter a valid refund amount");
        return;
      }
      if (amount > amountPaid) {
        setValidationError("Refund amount cannot exceed the amount paid");
        return;
      }
    }

    await onConfirm({
      paymentId,
      amount: refundAmount,
      reason,
      notes: notes || undefined,
    });
  };

  const footerContent = (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={isLoading}
        className="flex-1 px-4 py-2.5 border-2 border-border rounded-button text-body-sm hover:bg-muted transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="refund-form"
        disabled={isLoading || refundAmount <= 0}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-error text-white rounded-button font-semibold hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>Process Refund</>
        )}
      </button>
    </div>
  );

  return (
    <OverlayLayout
      type="modal"
      size="md"
      open={isDialogOpen}
      onClose={onClose}
      title="Process Refund"
      closeOnEscape={!isLoading}
      closeOnBackdrop={!isLoading}
      preventScroll
      animation="scale"
      inverted={false}
      showClose={!isLoading}
      footerContent={footerContent}
      className={className}
      ariaLabel="Process Refund"
      ariaDescribedBy="refund-dialog-description"
    >
      <form id="refund-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Error Display */}
        {(error || validationError) && (
          <div className="flex items-start gap-2 p-3 bg-error/10 border-2 border-error/20 rounded-card">
            <AlertTriangle className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
            <p className="text-body-sm text-error">{error || validationError}</p>
          </div>
        )}

        {/* Payment Summary */}
        <div className="p-3 bg-muted/30 rounded-card space-y-1">
          {customerName && (
            <p className="text-body-sm">
              <span className="text-on-light-muted">Customer:</span> {customerName}
            </p>
          )}
          <p className="text-body-sm">
            <span className="text-on-light-muted">Original Amount:</span>{" "}
            {formatCurrency(originalAmount, currency)}
          </p>
          <p className="text-body-sm">
            <span className="text-on-light-muted">Amount Paid:</span>{" "}
            {formatCurrency(amountPaid, currency)}
          </p>
          {transactionDate && (
            <p className="text-body-sm">
              <span className="text-on-light-muted">Date:</span> {transactionDate}
            </p>
          )}
        </div>

        {/* Refund Type */}
        <div className="space-y-2">
          <p className="text-body-xs text-on-light-muted font-semibold">
            Refund Type
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRefundType("full")}
              className={clsx(
                "flex-1 px-3 py-2 border-2 rounded-button text-body-sm transition-colors",
                refundType === "full"
                  ? "border-primary-500 bg-primary-500/10 text-primary-600"
                  : "border-border hover:border-primary-500/50"
              )}
            >
              Full Refund
            </button>
            <button
              type="button"
              onClick={() => setRefundType("partial")}
              className={clsx(
                "flex-1 px-3 py-2 border-2 rounded-button text-body-sm transition-colors",
                refundType === "partial"
                  ? "border-primary-500 bg-primary-500/10 text-primary-600"
                  : "border-border hover:border-primary-500/50"
              )}
            >
              Partial Refund
            </button>
          </div>
        </div>

        {/* Partial Amount */}
        {refundType === "partial" && (
          <div>
            <label className="text-body-xs text-on-light-muted font-semibold block mb-1">
              Refund Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-light-muted" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={amountPaid}
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary-500"
                disabled={isLoading}
              />
            </div>
            <p className="text-body-xs text-on-light-muted mt-1">
              Maximum: {formatCurrency(amountPaid, currency)}
            </p>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="text-body-xs text-on-light-muted font-semibold block mb-1">
            Reason for Refund *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary-500"
            disabled={isLoading}
          >
            <option value="">Select a reason</option>
            {refundReasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="text-body-xs text-on-light-muted font-semibold block mb-1">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes about this refund..."
            rows={2}
            className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary-500 resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Refund Summary */}
        <div id="refund-dialog-description" className="p-3 bg-warning/10 border-2 border-warning/20 rounded-card">
          <p className="text-body-sm font-semibold">
            Refund Amount: {formatCurrency(refundAmount, currency)}
          </p>
          <p className="text-body-xs text-on-light-muted mt-1">
            This action cannot be undone. The refund will be processed to the original payment method.
          </p>
        </div>
      </form>
    </OverlayLayout>
  );
}

export default RefundDialog;
