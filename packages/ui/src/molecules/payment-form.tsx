"use client";

import React, { useState } from "react";
import { CreditCard, Lock, AlertCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

export interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSubmit: (paymentData: PaymentFormData) => Promise<void>;
  onCancel?: () => void;
  isProcessing?: boolean;
  error?: string | null;
  savedMethods?: SavedPaymentMethod[];
  allowSaveCard?: boolean;
  className?: string;
}

export interface PaymentFormData {
  paymentMethodId?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  cardholderName?: string;
  saveCard?: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

const formatCurrency = (value: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};

const cardBrandLogos: Record<string, string> = {
  visa: "💳",
  mastercard: "💳",
  amex: "💳",
  discover: "💳",
};

export function PaymentForm({
  amount,
  currency = "USD",
  onSubmit,
  onCancel,
  isProcessing = false,
  error,
  savedMethods = [],
  allowSaveCard = true,
  className,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | "new">(
    savedMethods.length > 0 ? savedMethods[0].id : "new"
  );
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").substr(0, 19);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (selectedMethod === "new") {
      const cleanedCardNumber = cardNumber.replace(/\s/g, "");
      if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
        setValidationError("Please enter a valid card number");
        return;
      }
      if (!expiryMonth || !expiryYear) {
        setValidationError("Please enter the expiry date");
        return;
      }
      if (cvv.length < 3 || cvv.length > 4) {
        setValidationError("Please enter a valid CVV");
        return;
      }
      if (!cardholderName.trim()) {
        setValidationError("Please enter the cardholder name");
        return;
      }

      await onSubmit({
        cardNumber: cleanedCardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName,
        saveCard,
      });
    } else {
      await onSubmit({ paymentMethodId: selectedMethod });
    }
  };

  return (
    <div className={clsx("bg-background border-2 border-border rounded-card", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-success" />
            <span className="text-body-sm font-weight-medium">Secure Payment</span>
          </div>
          <span className="text-body-lg font-weight-bold text-primary">
            {formatCurrency(amount, currency)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Error Display */}
        {(error || validationError) && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border-2 border-destructive/20 rounded-card">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-body-sm text-destructive">{error || validationError}</p>
          </div>
        )}

        {/* Saved Payment Methods */}
        {savedMethods.length > 0 && (
          <div className="space-y-2">
            <p className="text-body-xs text-muted-foreground font-weight-medium">
              Saved Payment Methods
            </p>
            {savedMethods.map((method) => (
              <label
                key={method.id}
                className={clsx(
                  "flex items-center gap-3 p-3 border-2 rounded-card cursor-pointer transition-colors",
                  selectedMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  className="sr-only"
                />
                <span className="text-body-lg">{cardBrandLogos[method.brand] || "💳"}</span>
                <div className="flex-1">
                  <p className="text-body-sm font-weight-medium capitalize">
                    {method.brand} •••• {method.last4}
                  </p>
                  <p className="text-body-xs text-muted-foreground">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
                {selectedMethod === method.id && (
                  <div className="w-4 h-4 rounded-full bg-primary" />
                )}
              </label>
            ))}
            <label
              className={clsx(
                "flex items-center gap-3 p-3 border-2 rounded-card cursor-pointer transition-colors",
                selectedMethod === "new"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="new"
                checked={selectedMethod === "new"}
                onChange={() => setSelectedMethod("new")}
                className="sr-only"
              />
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-body-sm">Use a new card</span>
            </label>
          </div>
        )}

        {/* New Card Form */}
        {selectedMethod === "new" && (
          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="text-body-xs text-muted-foreground font-weight-medium block mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary pr-10"
                  disabled={isProcessing}
                />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-body-xs text-muted-foreground font-weight-medium block mb-1">
                  Month
                </label>
                <select
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary"
                  disabled={isProcessing}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                      {String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-body-xs text-muted-foreground font-weight-medium block mb-1">
                  Year
                </label>
                <select
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary"
                  disabled={isProcessing}
                >
                  <option value="">YY</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={String(year).slice(-2)}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="text-body-xs text-muted-foreground font-weight-medium block mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="text-body-xs text-muted-foreground font-weight-medium block mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary"
                disabled={isProcessing}
              />
            </div>

            {/* Save Card */}
            {allowSaveCard && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  disabled={isProcessing}
                />
                <span className="text-body-sm">Save card for future payments</span>
              </label>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-button font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Pay {formatCurrency(amount, currency)}
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-4 py-2.5 border-2 border-border rounded-button text-body-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Security Note */}
        <p className="text-body-xs text-muted-foreground text-center">
          Your payment information is encrypted and secure.
        </p>
      </form>
    </div>
  );
}

export default PaymentForm;
