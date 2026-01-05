"use client";

import React, { useCallback } from "react";
import { Plus, Trash2, GripVertical, Percent } from "lucide-react";
import clsx from "clsx";
import { invoiceBuilderVariants, lineItemTableVariants, lineItemRowVariants, inputVariants } from "./InvoiceBuilder.variants.js";
import type { 
  InvoiceBuilderProps,
  InvoiceLineItem
} from "./InvoiceBuilder.types.js";

/**
 * InvoiceBuilder component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Dynamic line item management with add/remove functionality
 * - Real-time calculation of totals, tax, and service charges
 * - Editable tax rates and discount amounts
 * - Currency formatting with internationalization support
 * - Readonly mode for viewing invoices
 * - Drag-and-drop ready structure
 * - Bold borders and clear visual hierarchy
 */
export function InvoiceBuilder({
  lineItems,
  onChange,
  taxRate = 0,
  serviceChargeRate = 0,
  discountAmount = 0,
  onTaxRateChange,
  onServiceChargeChange,
  onDiscountChange,
  currency = "USD",
  readonly = false,
  className,
}: InvoiceBuilderProps) {
  const formatCurrency = (value: number, currencyCode = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addLineItem = useCallback(() => {
    const newItem: InvoiceLineItem = {
      id: generateId(),
      description: "",
      quantity: 1,
      unit_price: 0,
      total: 0,
      taxable: true,
    };
    onChange([...lineItems, newItem]);
  }, [lineItems, onChange]);

  const updateLineItem = useCallback(
    (id: string, updates: Partial<InvoiceLineItem>) => {
      const updated = lineItems.map((item) => {
        if (item.id !== id) return item;
        const newItem = { ...item, ...updates };
        newItem.total = newItem.quantity * newItem.unit_price;
        return newItem;
      });
      onChange(updated);
    },
    [lineItems, onChange]
  );

  const removeLineItem = useCallback(
    (id: string) => {
      onChange(lineItems.filter((item) => item.id !== id));
    },
    [lineItems, onChange]
  );

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxableAmount = lineItems
    .filter((item) => item.taxable !== false)
    .reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (taxableAmount * taxRate) / 100;
  const serviceChargeAmount = (subtotal * serviceChargeRate) / 100;
  const total = subtotal + taxAmount + serviceChargeAmount - discountAmount;

  return (
    <div className={clsx(invoiceBuilderVariants({ readonly }), className)}>
      {/* Line Items Table */}
      <div className={lineItemTableVariants({ readonly })}>
        {/* Header */}
        <div className="bg-muted/50 px-4 py-2 grid grid-cols-12 gap-2 text-body-xs font-weight-medium text-muted-foreground">
          <div className="col-span-1"></div>
          <div className="col-span-5">Description</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Unit Price</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {/* Line Items */}
        <div className="divide-y divide-border">
          {lineItems.map((item) => (
            <div
              key={item.id}
              className={lineItemRowVariants({ readonly })}
            >
              <div className="col-span-1 flex items-center gap-1">
                {!readonly && (
                  <>
                    <button className="p-1 text-muted-foreground hover:text-foreground cursor-grab">
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="p-1 text-destructive/60 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              <div className="col-span-5">
                {readonly ? (
                  <span className="text-body-sm">{item.description}</span>
                ) : (
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(item.id, { description: e.target.value })
                    }
                    placeholder="Item description"
                    className={inputVariants({ textAlign: "left" })}
                  />
                )}
              </div>
              <div className="col-span-2">
                {readonly ? (
                  <span className="text-body-sm text-right block">{item.quantity}</span>
                ) : (
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(item.id, { quantity: Number(e.target.value) || 1 })
                    }
                    className={inputVariants({ textAlign: "right" })}
                  />
                )}
              </div>
              <div className="col-span-2">
                {readonly ? (
                  <span className="text-body-sm text-right block">
                    {formatCurrency(item.unit_price, currency)}
                  </span>
                ) : (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateLineItem(item.id, { unit_price: Number(e.target.value) || 0 })
                    }
                    className={inputVariants({ textAlign: "right" })}
                  />
                )}
              </div>
              <div className="col-span-2 text-right">
                <span className="text-body-sm font-weight-medium">
                  {formatCurrency(item.total, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Line Item Button */}
        {!readonly && (
          <div className="p-2 border-t border-border">
            <button
              onClick={addLineItem}
              className="w-full p-2 border-2 border-dashed border-border rounded-card text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="text-body-sm">Add Line Item</span>
            </button>
          </div>
        )}
      </div>

      {/* Totals Section */}
      <div className="flex justify-end">
        <div className="w-80 space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-body-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>

          {/* Tax Rate */}
          <div className="flex justify-between items-center text-body-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tax</span>
              {!readonly && onTaxRateChange && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => onTaxRateChange(Number(e.target.value) || 0)}
                    className="w-16 px-2 py-0.5 border-2 border-border rounded-button text-body-xs text-right focus:outline-none focus:border-primary"
                  />
                  <Percent className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
              {readonly && <span className="text-muted-foreground">({taxRate}%)</span>}
            </div>
            <span>{formatCurrency(taxAmount, currency)}</span>
          </div>

          {/* Service Charge */}
          {(serviceChargeRate > 0 || onServiceChargeChange) && (
            <div className="flex justify-between items-center text-body-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Service Charge</span>
                {!readonly && onServiceChargeChange && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={serviceChargeRate}
                      onChange={(e) => onServiceChargeChange(Number(e.target.value) || 0)}
                      className="w-16 px-2 py-0.5 border-2 border-border rounded-button text-body-xs text-right focus:outline-none focus:border-primary"
                    />
                    <Percent className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                {readonly && <span className="text-muted-foreground">({serviceChargeRate}%)</span>}
              </div>
              <span>{formatCurrency(serviceChargeAmount, currency)}</span>
            </div>
          )}

          {/* Discount */}
          {(discountAmount > 0 || onDiscountChange) && (
            <div className="flex justify-between items-center text-body-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Discount</span>
                {!readonly && onDiscountChange && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountAmount}
                    onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
                    className="w-20 px-2 py-0.5 border-2 border-border rounded-button text-body-xs text-right focus:outline-none focus:border-primary"
                  />
                )}
              </div>
              <span className="text-destructive">-{formatCurrency(discountAmount, currency)}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between text-body-md font-weight-bold pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceBuilder;
