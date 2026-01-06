"use client";

import React from "react";
import { CreditCard, Building2, Wallet, Check, Trash2, Plus } from "lucide-react";
import { 
  paymentMethodSelectorVariants,
  paymentMethodSelectorMethodVariants,
  paymentMethodSelectorMethodInfoVariants,
  paymentMethodSelectorMethodIconVariants,
  paymentMethodSelectorMethodDetailsVariants,
  paymentMethodSelectorMethodNameVariants,
  paymentMethodSelectorMethodMetaVariants,
  paymentMethodSelectorMethodActionsVariants,
  paymentMethodSelectorActionButtonVariants,
  paymentMethodSelectorAddButtonVariants,
  paymentMethodSelectorDefaultBadgeVariants 
} from "./PaymentMethodSelector.variants.js";
import type { 
  PaymentMethodSelectorProps 
} from "./PaymentMethodSelector.types.js";

/**
 * PaymentMethodSelector component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Payment method selection with actions
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <PaymentMethodSelector
 *   methods={paymentMethods}
 *   selectedMethodId="method-1"
 *   onSelect={(id) => console.log('Selected:', id)}
 *   inverted={false}
 * />
 * ```
 */
export function PaymentMethodSelector({
  methods,
  selectedMethodId,
  onSelect,
  onSetDefault,
  onDelete,
  onAddNew,
  allowAddNew = true,
  showActions = true,
  inverted = false,
  className,
}: PaymentMethodSelectorProps) {
  // Method icons
  const methodIcons = {
    card: <CreditCard className="w-5 h-5" />,
    bank: <Building2 className="w-5 h-5" />,
    wallet: <Wallet className="w-5 h-5" />,
  };

  // Card brand colors - using grayscale for neutral appearance
  const cardBrandColors: Record<string, string> = {
    visa: "bg-gray-600",
    mastercard: "bg-gray-700",
    amex: "bg-gray-500",
    discover: "bg-gray-600",
  };

  // Handle method selection
  const handleMethodSelect = (methodId: string) => {
    onSelect(methodId);
  };

  // Handle set default
  const handleSetDefault = (methodId: string) => {
    onSetDefault?.(methodId);
  };

  // Handle delete
  const handleDelete = (methodId: string) => {
    onDelete?.(methodId);
  };

  // Handle add new
  const handleAddNew = () => {
    onAddNew?.();
  };

  return (
    <div className={paymentMethodSelectorVariants({ className })}>
      {/* Payment Methods */}
      {methods.map((method) => (
        <div
          key={method.id}
          className={paymentMethodSelectorMethodVariants({ 
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
          aria-label={`Select ${method.type} ending in ${method.last4}`}
          aria-pressed={selectedMethodId === method.id}
        >
          {/* Method Info */}
          <div className={paymentMethodSelectorMethodInfoVariants({})}>
            {/* Icon */}
            <div className={paymentMethodSelectorMethodIconVariants({})}>
              <div 
                className={`flex items-center justify-center w-full h-full rounded text-white ${
                  method.type === 'card' && method.brand 
                    ? cardBrandColors[method.brand.toLowerCase()] || "bg-gray-500"
                    : "bg-gray-500"
                }`}
              >
                {methodIcons[method.type]}
              </div>
            </div>

            {/* Details */}
            <div className={paymentMethodSelectorMethodDetailsVariants({})}>
              <div className={paymentMethodSelectorMethodNameVariants({})}>
                {method.type === 'card' && method.brand 
                  ? `${method.brand} •••• ${method.last4}`
                  : method.type === 'bank' && method.bankName
                  ? `${method.bankName} •••• ${method.last4}`
                  : `${method.type.charAt(0).toUpperCase() + method.type.slice(1)} •••• ${method.last4}`
                }
              </div>
              
              <div className={paymentMethodSelectorMethodMetaVariants({})}>
                {method.type === 'card' && method.expiryMonth && method.expiryYear && (
                  <span>Expires {method.expiryMonth}/{method.expiryYear}</span>
                )}
                {method.isDefault && (
                  <span className="ml-2">Default</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className={paymentMethodSelectorMethodActionsVariants({})}>
              {!method.isDefault && onSetDefault && (
                <button
                  className={paymentMethodSelectorActionButtonVariants({ variant: "default" })}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefault(method.id);
                  }}
                  title="Set as default"
                  aria-label={`Set ${method.type} ending in ${method.last4} as default`}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  className={paymentMethodSelectorActionButtonVariants({ variant: "danger" })}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(method.id);
                  }}
                  title="Delete payment method"
                  aria-label={`Delete ${method.type} ending in ${method.last4}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Default Badge */}
          {method.isDefault && (
            <div className={paymentMethodSelectorDefaultBadgeVariants({})}>
              DEFAULT
            </div>
          )}
        </div>
      ))}

      {/* Add New Button */}
      {allowAddNew && onAddNew && (
        <button
          className={paymentMethodSelectorAddButtonVariants({})}
          onClick={handleAddNew}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAddNew();
            }
          }}
          aria-label="Add new payment method"
        >
          <Plus className="w-5 h-5" />
          <span>Add Payment Method</span>
        </button>
      )}
    </div>
  );
}
