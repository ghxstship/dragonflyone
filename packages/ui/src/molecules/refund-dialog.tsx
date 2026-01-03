"use client";

import React, { useState } from "react";
import { X, AlertTriangle, DollarSign, Loader2 } from "lucide-react";
import clsx from "clsx";

export interface RefundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (refundData: RefundData) => Promise<void>;
  paymentId: string;
  originalAmount: number;
  amountPaid: number;
  currency?: string;
  customerName?: string;
  transactionDate?: string;
  isProcessing?: boolean;
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

export function RefundDialog({
  isOpen,
  onClose,
  onConfirm,
  paymentId,
  originalAmount,
  amountPaid,
  currency = "USD",
  customerName,
  transactionDate,
  isProcessing = false,
  error,
  className,
}: RefundDialogProps) {
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-overlay"
        onClick={isProcessing ? undefined : onClose}
      />

      {/* Dialog */}
      <div
        className={clsx(
          "relative bg-background border-2 border-border rounded-card w-full max-w-md mx-4 shadow-xl",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="text-body-md font-weight-semibold">Process Refund</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 hover:bg-muted rounded-button transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error Display */}
          {(error || validationError) && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border-2 border-destructive/20 rounded-card">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-body-sm text-destructive">{error || validationError}</p>
            </div>
          )}

          {/* Payment Summary */}
          <div className="p-3 bg-muted/30 rounded-card space-y-1">
            {customerName && (
              <p className="text-body-sm">
                <span className="text-muted-foreground">Customer:</span> {customerName}
              </p>
            )}
            <p className="text-body-sm">
              <span className="text-muted-foreground">Original Amount:</span>{" "}
              {formatCurrency(originalAmount, currency)}
            </p>
            <p className="text-body-sm">
              <span className="text-muted-foreground">Amount Paid:</span>{" "}
              {formatCurrency(amountPaid, currency)}
            </p>
            {transactionDate && (
              <p className="text-body-sm">
                <span className="text-muted-foreground">Date:</span> {transactionDate}
              </p>
            )}
          </div>

          {/* Refund Type */}
          <div className="space-y-2">
            <p className="text-body-xs text-muted-foreground font-weight-medium">
              Refund Type
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRefundType("full")}
                className={clsx(
                  "flex-1 px-3 py-2 border-2 rounded-button text-body-sm transition-colors",
                  refundType === "full"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
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
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                Partial Refund
              </button>
            </div>
          </div>

          {/* Partial Amount */}
          {refundType === "partial" && (
            <div>
              <label className="text-body-xs text-muted-foreground font-weight-medium block mb-1">
                Refund Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={amountPaid}
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary"
                  disabled={isProcessing}
                />
              </div>
              <p className="text-body-xs text-muted-foreground mt-1">
                Maximum: {formatCurrency(amountPaid, currency)}
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-body-xs text-muted-foreground font-weight-medium block mb-1">
              Reason for Refund *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary"
              disabled={isProcessing}
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
            <label className="text-body-xs text-muted-foreground font-weight-medium block mb-1">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this refund..."
              rows={2}
              className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary resize-none"
              disabled={isProcessing}
            />
          </div>

          {/* Refund Summary */}
          <div className="p-3 bg-warning/10 border-2 border-warning/20 rounded-card">
            <p className="text-body-sm font-weight-medium">
              Refund Amount: {formatCurrency(refundAmount, currency)}
            </p>
            <p className="text-body-xs text-muted-foreground mt-1">
              This action cannot be undone. The refund will be processed to the original payment method.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 border-2 border-border rounded-button text-body-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || refundAmount <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-button font-weight-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Process Refund</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RefundDialog;
