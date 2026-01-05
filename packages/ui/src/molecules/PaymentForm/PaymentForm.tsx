"use client";

import React, { useState } from "react";
import { CreditCard, Lock, AlertCircle, Loader2 } from "lucide-react";
import { 
  paymentFormVariants,
  paymentFormHeaderVariants,
  paymentFormTitleVariants,
  paymentFormAmountVariants,
  paymentFormContentVariants,
  paymentFormSectionVariants,
  paymentFormSectionTitleVariants,
  paymentFormSavedMethodsVariants,
  paymentFormSavedMethodVariants,
  paymentFormSavedMethodInfoVariants,
  paymentFormSavedMethodBrandVariants,
  paymentFormSavedMethodDetailsVariants,
  paymentFormInputGroupVariants,
  paymentFormInputVariants,
  paymentFormCheckboxVariants,
  paymentFormErrorVariants,
  paymentFormFooterVariants,
  paymentFormSecurityNoteVariants 
} from "./PaymentForm.variants.js";
import type { 
  PaymentFormProps, 
  PaymentFormData 
} from "./PaymentForm.types.js";

/**
 * PaymentForm component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Secure payment form styling
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <PaymentForm
 *   amount={99.99}
 *   currency="USD"
 *   onSubmit={handleSubmit}
 *   inverted={false}
 * />
 * ```
 */
export function PaymentForm({
  amount,
  currency = "USD",
  onSubmit,
  onCancel,
  isProcessing = false,
  error = null,
  savedMethods = [],
  allowSaveCard = true,
  inverted = false,
  className,
}: PaymentFormProps) {
  // State
  const [selectedMethodId, setSelectedMethodId] = useState<string | undefined>(
    savedMethods.length > 0 ? savedMethods[0].id : undefined
  );
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    saveCard: false,
  });

  // Format currency
  const formatCurrency = (value: number, curr = currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Card brand logos
  const cardBrandLogos: Record<string, string> = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    discover: "💳",
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentData: PaymentFormData = selectedMethodId
      ? { paymentMethodId: selectedMethodId }
      : formData;
    
    await onSubmit(paymentData);
  };

  // Handle input changes
  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle method selection
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethodId(methodId);
  };

  // Handle new card selection
  const handleNewCardSelect = () => {
    setSelectedMethodId(undefined);
  };

  return (
    <div className={paymentFormVariants({ inverted, className })}>
      {/* Header */}
      <div className={paymentFormHeaderVariants({ inverted })}>
        <h3 className={paymentFormTitleVariants({ inverted })}>
          Payment Information
        </h3>
        <div className={paymentFormAmountVariants({ inverted })}>
          {formatCurrency(amount)}
        </div>
      </div>

      {/* Content */}
      <div className={paymentFormContentVariants({ inverted })}>
        {/* Error */}
        {error && (
          <div className={paymentFormErrorVariants({ inverted })}>
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Saved Payment Methods */}
        {savedMethods.length > 0 && (
          <div className={paymentFormSectionVariants({ inverted })}>
            <h4 className={paymentFormSectionTitleVariants({ inverted })}>
              SAVED PAYMENT METHODS
            </h4>
            
            <div className={paymentFormSavedMethodsVariants({ inverted })}>
              {savedMethods.map((method) => (
                <div
                  key={method.id}
                  className={paymentFormSavedMethodVariants({ 
                    selected: selectedMethodId === method.id, 
                    inverted 
                  })}
                  onClick={() => handleMethodSelect(method.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleMethodSelect(method.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${method.brand} ending in ${method.last4}`}
                  aria-pressed={selectedMethodId === method.id}
                >
                  <div className={paymentFormSavedMethodInfoVariants({ inverted })}>
                    <div className={paymentFormSavedMethodBrandVariants({ inverted })}>
                      {cardBrandLogos[method.brand.toLowerCase()] || "💳"}
                    </div>
                    <div className={paymentFormSavedMethodDetailsVariants({ inverted })}>
                      <div className="font-medium">{method.brand}</div>
                      <div>•••• {method.last4}</div>
                      <div>Expires {method.expiryMonth}/{method.expiryYear}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* New Card Option */}
              <div
                className={paymentFormSavedMethodVariants({ 
                  selected: selectedMethodId === undefined, 
                  inverted 
                })}
                onClick={handleNewCardSelect}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNewCardSelect();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Add new card"
                aria-pressed={selectedMethodId === undefined}
              >
                <div className={paymentFormSavedMethodInfoVariants({ inverted })}>
                  <div className={paymentFormSavedMethodBrandVariants({ inverted })}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className={paymentFormSavedMethodDetailsVariants({ inverted })}>
                    <div className="font-medium">Add New Card</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Card Form */}
        {selectedMethodId === undefined && (
          <div className={paymentFormSectionVariants({ inverted })}>
            <h4 className={paymentFormSectionTitleVariants({ inverted })}>
              CARD INFORMATION
            </h4>
            
            <div className={paymentFormInputGroupVariants({ inverted })}>
              <input
                type="text"
                placeholder="Card Number"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                className={paymentFormInputVariants({ inverted })}
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={paymentFormInputGroupVariants({ inverted })}>
                <input
                  type="text"
                  placeholder="MM"
                  value={formData.expiryMonth}
                  onChange={(e) => handleInputChange("expiryMonth", e.target.value)}
                  className={paymentFormInputVariants({ inverted })}
                  disabled={isProcessing}
                  maxLength={2}
                />
              </div>
              
              <div className={paymentFormInputGroupVariants({ inverted })}>
                <input
                  type="text"
                  placeholder="YY"
                  value={formData.expiryYear}
                  onChange={(e) => handleInputChange("expiryYear", e.target.value)}
                  className={paymentFormInputVariants({ inverted })}
                  disabled={isProcessing}
                  maxLength={2}
                />
              </div>
            </div>

            <div className={paymentFormInputGroupVariants({ inverted })}>
              <input
                type="text"
                placeholder="CVV"
                value={formData.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                className={paymentFormInputVariants({ inverted })}
                disabled={isProcessing}
                maxLength={4}
              />
            </div>

            <div className={paymentFormInputGroupVariants({ inverted })}>
              <input
                type="text"
                placeholder="Cardholder Name"
                value={formData.cardholderName}
                onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                className={paymentFormInputVariants({ inverted })}
                disabled={isProcessing}
              />
            </div>

            {allowSaveCard && (
              <div className={paymentFormCheckboxVariants({ inverted })}>
                <input
                  type="checkbox"
                  id="saveCard"
                  checked={formData.saveCard}
                  onChange={(e) => handleInputChange("saveCard", e.target.checked)}
                  disabled={isProcessing}
                />
                <label htmlFor="saveCard">Save card for future purchases</label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={paymentFormFooterVariants({ inverted })}>
        <div className={paymentFormSecurityNoteVariants({ inverted })}>
          <Lock className="w-3 h-3" />
          <span>Your payment information is secure and encrypted</span>
        </div>
        
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className={`px-4 py-2 border-2 rounded-button font-medium transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] ${
                inverted 
                  ? "border-border-inverse text-text-secondary-inverse hover:bg-surface-hover-inverse" 
                  : "border-border text-text-secondary hover:bg-surface-hover"
              }`}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isProcessing}
            className={`px-4 py-2 border-2 rounded-button font-medium transition-all duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] ${
              isProcessing 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:scale-105"
            } ${
              inverted 
                ? "bg-brand-primary border-brand-primary text-white" 
                : "bg-brand-primary border-brand-primary text-white"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              `Pay ${formatCurrency(amount)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
