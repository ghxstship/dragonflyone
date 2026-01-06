"use client";

import React, { useState } from "react";
import { AlertTriangle, DollarSign, Loader2 } from "lucide-react";
import { 
  refundDialogVariants,
  refundDialogHeaderVariants,
  refundDialogTitleVariants,
  refundDialogWarningVariants,
  refundDialogContentVariants,
  refundDialogSectionVariants,
  refundDialogSectionTitleVariants,
  refundDialogPaymentInfoVariants,
  refundDialogPaymentRowVariants,
  refundDialogPaymentLabelVariants,
  refundDialogPaymentValueVariants,
  refundDialogInputGroupVariants,
  refundDialogInputVariants,
  refundDialogTextareaVariants,
  refundDialogErrorVariants,
  refundDialogFooterVariants,
  refundDialogButtonVariants 
} from "./RefundDialog.variants.js";
import type { 
  RefundDialogProps, 
  RefundData,
  RefundReasonOption 
} from "./RefundDialog.types.js";

/**
 * RefundDialog component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Refund dialog with form and validation
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <RefundDialog
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleRefund}
 *   paymentId="pay_123"
 *   originalAmount={100}
 *   amountPaid={100}
 *   inverted={false}
 * />
 * ```
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
  error = null,
  inverted = false,
  className,
}: RefundDialogProps) {
  // State
  const [refundAmount, setRefundAmount] = useState(amountPaid.toString());
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");

  // Handle deprecated props
  const isDialogOpen = open ?? isOpen ?? false;
  const isLoading = loading ?? isProcessing ?? false;

  // Refund reasons
  const refundReasons: RefundReasonOption[] = [
    { value: "requested_by_customer", label: "Requested by customer" },
    { value: "duplicate", label: "Duplicate charge" },
    { value: "fraudulent", label: "Fraudulent transaction" },
    { value: "service_not_provided", label: "Service not provided" },
    { value: "event_cancelled", label: "Event cancelled" },
    { value: "partial_service", label: "Partial service provided" },
    { value: "other", label: "Other" },
  ];

  // Format currency
  const formatCurrency = (value: number, curr = currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const refundData: RefundData = {
      paymentId,
      amount: parseFloat(refundAmount),
      reason: refundReason,
      notes: refundNotes || undefined,
    };
    
    await onConfirm(refundData);
  };

  // Handle amount change
  const handleAmountChange = (value: string) => {
    // Only allow valid decimal numbers
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setRefundAmount(value);
    }
  };

  // Validate refund amount
  const isValidAmount = parseFloat(refundAmount) > 0 && parseFloat(refundAmount) <= amountPaid;
  const isValidForm = refundReason && isValidAmount;

  if (!isDialogOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={refundDialogVariants({ className })}>
        {/* Header */}
        <div className={refundDialogHeaderVariants({})}>
          <h3 className={refundDialogTitleVariants({})}>
            Process Refund
          </h3>
        </div>

        {/* Warning */}
        <div className={refundDialogWarningVariants({})}>
          <AlertTriangle className="w-4 h-4" />
          <span>This action cannot be undone. The refund will be processed immediately.</span>
        </div>

        {/* Content */}
        <div className={refundDialogContentVariants({})}>
          {/* Error */}
          {error && (
            <div className={refundDialogErrorVariants({})}>
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Information */}
          <div className={refundDialogSectionVariants({})}>
            <h4 className={refundDialogSectionTitleVariants({})}>
              PAYMENT INFORMATION
            </h4>
            
            <div className={refundDialogPaymentInfoVariants({})}>
              {customerName && (
                <div className={refundDialogPaymentRowVariants({})}>
                  <span className={refundDialogPaymentLabelVariants({})}>
                    Customer
                  </span>
                  <span className={refundDialogPaymentValueVariants({})}>
                    {customerName}
                  </span>
                </div>
              )}
              
              {transactionDate && (
                <div className={refundDialogPaymentRowVariants({})}>
                  <span className={refundDialogPaymentLabelVariants({})}>
                    Transaction Date
                  </span>
                  <span className={refundDialogPaymentValueVariants({})}>
                    {new Date(transactionDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className={refundDialogPaymentRowVariants({})}>
                <span className={refundDialogPaymentLabelVariants({})}>
                  Original Amount
                </span>
                <span className={refundDialogPaymentValueVariants({})}>
                  {formatCurrency(originalAmount)}
                </span>
              </div>
              
              <div className={refundDialogPaymentRowVariants({})}>
                <span className={refundDialogPaymentLabelVariants({})}>
                  Amount Paid
                </span>
                <span className={refundDialogPaymentValueVariants({})}>
                  {formatCurrency(amountPaid)}
                </span>
              </div>
            </div>
          </div>

          {/* Refund Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Refund Amount */}
            <div className={refundDialogSectionVariants({})}>
              <h4 className={refundDialogSectionTitleVariants({})}>
                REFUND AMOUNT
              </h4>
              
              <div className={refundDialogInputGroupVariants({})}>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="0.00"
                    value={refundAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`pl-10 ${refundDialogInputVariants({})}`}
                    disabled={isLoading}
                  />
                </div>
                
                {!isValidAmount && refundAmount && (
                  <p className="text-sm text-error-600">
                    Amount must be between 0.01 and {formatCurrency(amountPaid)}
                  </p>
                )}
              </div>
            </div>

            {/* Refund Reason */}
            <div className={refundDialogSectionVariants({})}>
              <h4 className={refundDialogSectionTitleVariants({})}>
                REFUND REASON
              </h4>
              
              <div className={refundDialogInputGroupVariants({})}>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className={refundDialogInputVariants({})}
                  disabled={isLoading}
                  required
                >
                  <option value="">Select a reason</option>
                  {refundReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Refund Notes */}
            <div className={refundDialogSectionVariants({})}>
              <h4 className={refundDialogSectionTitleVariants({})}>
                NOTES (OPTIONAL)
              </h4>
              
              <div className={refundDialogInputGroupVariants({})}>
                <textarea
                  placeholder="Add any additional notes about this refund..."
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  className={refundDialogTextareaVariants({})}
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={refundDialogFooterVariants({})}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={refundDialogButtonVariants({ 
              variant: "secondary", 
              loading: isLoading, 
              inverted 
            })}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !isValidForm}
            className={refundDialogButtonVariants({ 
              variant: "primary", 
              loading: isLoading, 
              inverted 
            })}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing Refund...
              </>
            ) : (
              `Refund ${formatCurrency(parseFloat(refundAmount) || 0)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
