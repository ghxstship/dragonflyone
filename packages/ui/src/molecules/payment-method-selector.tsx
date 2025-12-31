"use client";

import React from "react";
import { CreditCard, Building2, Wallet, Check, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Tooltip } from "../atoms/tooltip.js";

export interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "wallet";
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  isDefault?: boolean;
}

export interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethodId?: string | null;
  onSelect: (methodId: string) => void;
  onSetDefault?: (methodId: string) => void;
  onDelete?: (methodId: string) => void;
  onAddNew?: () => void;
  allowAddNew?: boolean;
  showActions?: boolean;
  className?: string;
}

const methodIcons: Record<string, React.ElementType> = {
  card: CreditCard,
  bank: Building2,
  wallet: Wallet,
};

const cardBrandColors: Record<string, string> = {
  visa: "bg-blue-500",
  mastercard: "bg-orange-500",
  amex: "bg-indigo-500",
  discover: "bg-amber-500",
};

export function PaymentMethodSelector({
  methods,
  selectedMethodId,
  onSelect,
  onSetDefault,
  onDelete,
  onAddNew,
  allowAddNew = true,
  showActions = true,
  className,
}: PaymentMethodSelectorProps) {
  return (
    <div className={clsx("space-y-2", className)}>
      {methods.map((method) => {
        const Icon = methodIcons[method.type] || CreditCard;
        const isSelected = selectedMethodId === method.id;

        return (
          <div
            key={method.id}
            className={clsx(
              "flex items-center gap-3 p-3 border-2 rounded-card transition-colors cursor-pointer",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onSelect(method.id)}
          >
            {/* Icon */}
            <div
              className={clsx(
                "w-10 h-10 rounded-button flex items-center justify-center",
                method.type === "card" && method.brand
                  ? cardBrandColors[method.brand.toLowerCase()] || "bg-muted"
                  : "bg-muted"
              )}
            >
              <Icon
                className={clsx(
                  "h-5 w-5",
                  method.type === "card" && method.brand ? "text-white" : "text-muted-foreground"
                )}
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-body-sm font-weight-medium">
                  {method.type === "card" && method.brand && (
                    <span className="capitalize">{method.brand} </span>
                  )}
                  {method.type === "bank" && method.bankName && (
                    <span>{method.bankName} </span>
                  )}
                  •••• {method.last4}
                </p>
                {method.isDefault && (
                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-badge text-body-xs">
                    Default
                  </span>
                )}
              </div>
              {method.type === "card" && method.expiryMonth && method.expiryYear && (
                <p className="text-body-xs text-muted-foreground">
                  Expires {String(method.expiryMonth).padStart(2, "0")}/{method.expiryYear}
                </p>
              )}
              {method.type === "bank" && (
                <p className="text-body-xs text-muted-foreground">Bank Account</p>
              )}
            </div>

            {/* Selection Indicator */}
            <div
              className={clsx(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected ? "border-primary bg-primary" : "border-border"
              )}
            >
              {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {onSetDefault && !method.isDefault && (
                  <Tooltip content="Set as default">
                    <button
                      onClick={() => onSetDefault(method.id)}
                      className="p-1.5 text-body-xs text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Set as default"
                    >
                      Set Default
                    </button>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip content="Remove payment method">
                    <button
                      onClick={() => onDelete(method.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove payment method"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add New Method */}
      {allowAddNew && onAddNew && (
        <button
          onClick={onAddNew}
          className="w-full p-3 border-2 border-dashed border-border rounded-card text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          <span className="text-body-sm">Add Payment Method</span>
        </button>
      )}

      {/* Empty State */}
      {methods.length === 0 && !allowAddNew && (
        <div className="p-6 text-center">
          <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-body-sm text-muted-foreground">No payment methods available</p>
        </div>
      )}
    </div>
  );
}

export default PaymentMethodSelector;
