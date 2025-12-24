"use client";

import React from "react";
import { FileText } from "lucide-react";
import clsx from "clsx";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoicePreviewProps {
  invoice: {
    invoice_number: string;
    status: string;
    issue_date: string;
    due_date: string;
    line_items: InvoiceLineItem[];
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    service_charge_rate?: number;
    service_charge_amount?: number;
    discount_amount?: number;
    total_amount: number;
    amount_paid?: number;
    balance_due?: number;
    notes?: string;
    terms?: string;
  };
  organization: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
    logo_url?: string;
  };
  client: {
    name: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    email?: string;
    phone?: string;
  };
  currency?: string;
  className?: string;
}

const formatCurrency = (value: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  viewed: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  overdue: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground line-through",
};

export function InvoicePreview({
  invoice,
  organization,
  client,
  currency = "USD",
  className,
}: InvoicePreviewProps) {
  return (
    <div
      className={clsx(
        "bg-background border-2 border-border rounded-card shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          {/* Organization Info */}
          <div>
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="h-12 mb-3"
              />
            ) : (
              <h2 className="text-h3-md font-weight-bold text-foreground">
                {organization.name}
              </h2>
            )}
            {organization.address && (
              <div className="text-body-sm text-muted-foreground mt-2 space-y-0.5">
                <p>{organization.address}</p>
                {organization.city && (
                  <p>
                    {organization.city}, {organization.state} {organization.zip}
                  </p>
                )}
                {organization.phone && <p>{organization.phone}</p>}
                {organization.email && <p>{organization.email}</p>}
              </div>
            )}
          </div>

          {/* Invoice Info */}
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-h4-md font-weight-bold">INVOICE</span>
            </div>
            <p className="text-body-lg font-weight-semibold">
              #{invoice.invoice_number}
            </p>
            <span
              className={clsx(
                "inline-block px-2 py-0.5 rounded-badge text-body-xs font-weight-medium mt-2 capitalize",
                statusColors[invoice.status] || statusColors.draft
              )}
            >
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Bill To & Dates */}
      <div className="p-6 grid grid-cols-2 gap-6 border-b border-border">
        {/* Bill To */}
        <div>
          <p className="text-body-xs text-muted-foreground font-weight-medium mb-2">
            BILL TO
          </p>
          <p className="text-body-md font-weight-semibold">{client.name}</p>
          {client.company && (
            <p className="text-body-sm text-muted-foreground">{client.company}</p>
          )}
          {client.address && (
            <div className="text-body-sm text-muted-foreground mt-1">
              <p>{client.address}</p>
              {client.city && (
                <p>
                  {client.city}, {client.state} {client.zip}
                </p>
              )}
            </div>
          )}
          {client.email && (
            <p className="text-body-sm text-muted-foreground mt-1">{client.email}</p>
          )}
        </div>

        {/* Dates */}
        <div className="text-right">
          <div className="space-y-2">
            <div>
              <p className="text-body-xs text-muted-foreground">Issue Date</p>
              <p className="text-body-sm font-weight-medium">
                {formatDate(invoice.issue_date)}
              </p>
            </div>
            <div>
              <p className="text-body-xs text-muted-foreground">Due Date</p>
              <p className="text-body-sm font-weight-medium">
                {formatDate(invoice.due_date)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="p-6 border-b border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-body-xs text-muted-foreground font-weight-medium py-2">
                Description
              </th>
              <th className="text-right text-body-xs text-muted-foreground font-weight-medium py-2 w-20">
                Qty
              </th>
              <th className="text-right text-body-xs text-muted-foreground font-weight-medium py-2 w-28">
                Unit Price
              </th>
              <th className="text-right text-body-xs text-muted-foreground font-weight-medium py-2 w-28">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.line_items.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="text-body-sm py-3">{item.description}</td>
                <td className="text-body-sm py-3 text-right">{item.quantity}</td>
                <td className="text-body-sm py-3 text-right">
                  {formatCurrency(item.unit_price, currency)}
                </td>
                <td className="text-body-sm py-3 text-right font-weight-medium">
                  {formatCurrency(item.total, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="p-6 flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-body-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(invoice.subtotal, currency)}</span>
          </div>
          {invoice.tax_rate > 0 && (
            <div className="flex justify-between text-body-sm">
              <span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span>
              <span>{formatCurrency(invoice.tax_amount, currency)}</span>
            </div>
          )}
          {invoice.service_charge_rate && invoice.service_charge_rate > 0 && (
            <div className="flex justify-between text-body-sm">
              <span className="text-muted-foreground">
                Service Charge ({invoice.service_charge_rate}%)
              </span>
              <span>{formatCurrency(invoice.service_charge_amount || 0, currency)}</span>
            </div>
          )}
          {invoice.discount_amount && invoice.discount_amount > 0 && (
            <div className="flex justify-between text-body-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-destructive">
                -{formatCurrency(invoice.discount_amount, currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-body-md font-weight-bold pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatCurrency(invoice.total_amount, currency)}</span>
          </div>
          {invoice.amount_paid !== undefined && invoice.amount_paid > 0 && (
            <>
              <div className="flex justify-between text-body-sm text-success">
                <span>Amount Paid</span>
                <span>-{formatCurrency(invoice.amount_paid, currency)}</span>
              </div>
              <div className="flex justify-between text-body-md font-weight-bold text-primary">
                <span>Balance Due</span>
                <span>{formatCurrency(invoice.balance_due || 0, currency)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notes & Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="px-6 pb-6 space-y-4">
          {invoice.notes && (
            <div>
              <p className="text-body-xs text-muted-foreground font-weight-medium mb-1">
                Notes
              </p>
              <p className="text-body-sm">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <p className="text-body-xs text-muted-foreground font-weight-medium mb-1">
                Terms & Conditions
              </p>
              <p className="text-body-sm text-muted-foreground">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InvoicePreview;
