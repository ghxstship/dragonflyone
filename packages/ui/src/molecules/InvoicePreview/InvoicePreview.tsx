"use client";

import React from "react";
import { 
  invoicePreviewVariants,
  invoicePreviewHeaderVariants,
  invoicePreviewCompanyInfoVariants,
  invoicePreviewLogoVariants,
  invoicePreviewCompanyDetailsVariants,
  invoicePreviewCompanyNameVariants,
  invoicePreviewCompanyAddressVariants,
  invoicePreviewContentVariants,
  invoicePreviewSectionVariants,
  invoicePreviewSectionTitleVariants,
  invoicePreviewTableVariants,
  invoicePreviewTableHeaderVariants,
  invoicePreviewTableCellVariants,
  invoicePreviewTotalsVariants,
  invoicePreviewTotalRowVariants,
  invoicePreviewTotalLabelVariants,
  invoicePreviewTotalValueVariants,
  invoicePreviewFooterVariants,
  invoicePreviewNotesVariants,
  invoicePreviewTermsVariants 
} from "./InvoicePreview.variants.js";
import type { 
  InvoicePreviewProps 
} from "./InvoicePreview.types.js";

/**
 * InvoicePreview component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Professional invoice layout
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <InvoicePreview
 *   invoice={invoiceData}
 *   organization={orgData}
 *   client={clientData}
 *   inverted={false}
 * />
 * ```
 */
export function InvoicePreview({
  invoice,
  organization,
  client,
  inverted = false,
  className,
}: InvoicePreviewProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={invoicePreviewVariants({ className })}>
      {/* Header */}
      <div className={invoicePreviewHeaderVariants({})}>
        <div className={invoicePreviewCompanyInfoVariants({})}>
          {/* Logo */}
          {organization.logo_url && (
            <img
              src={organization.logo_url}
              alt={`${organization.name} logo`}
              className={invoicePreviewLogoVariants({})}
            />
          )}
          
          {/* Company Details */}
          <div className={invoicePreviewCompanyDetailsVariants({})}>
            <div className={invoicePreviewCompanyNameVariants({})}>
              {organization.name}
            </div>
            {organization.address && (
              <div className={invoicePreviewCompanyAddressVariants({})}>
                {organization.address}
                {organization.city && organization.city && (
                  <>, {organization.city}</>
                )}
                {organization.state && organization.state && (
                  <>, {organization.state}</>
                )}
                {organization.zip && organization.zip && (
                  <>, {organization.zip}</>
                )}
              </div>
            )}
            {(organization.phone || organization.email) && (
              <div className={invoicePreviewCompanyAddressVariants({})}>
                {organization.phone && (
                  <div>{organization.phone}</div>
                )}
                {organization.email && (
                  <div>{organization.email}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={invoicePreviewContentVariants({})}>
        {/* Invoice Info */}
        <div className={invoicePreviewSectionVariants({})}>
          <h3 className={invoicePreviewSectionTitleVariants({})}>
            INVOICE #{invoice.invoice_number}
          </h3>
          <div className={`text-sm ${inverted ? 'text-text-secondary-inverse' : 'text-text-secondary'}`}>
            Status: <span className="font-bold uppercase">{invoice.status}</span>
          </div>
          <div className={`text-sm ${inverted ? 'text-text-secondary-inverse' : 'text-text-secondary'}`}>
            Issue Date: {formatDate(invoice.issue_date)}
          </div>
          <div className={`text-sm ${inverted ? 'text-text-secondary-inverse' : 'text-text-secondary'}`}>
            Due Date: {formatDate(invoice.due_date)}
          </div>
        </div>

        {/* Bill To */}
        <div className={invoicePreviewSectionVariants({})}>
          <h3 className={invoicePreviewSectionTitleVariants({})}>
            BILL TO
          </h3>
          <div className={`text-lg font-bold ${inverted ? 'text-text-inverse' : 'text-text-primary'}`}>
            {client.name}
          </div>
          {client.company && (
            <div className={`text-sm ${inverted ? 'text-text-secondary-inverse' : 'text-text-secondary'}`}>
              {client.company}
            </div>
          )}
          {client.address && (
            <div className={`text-sm ${inverted ? 'text-text-secondary-inverse' : 'text-text-secondary'}`}>
              {client.address}
              {client.city && client.city && (
                <>, {client.city}</>
              )}
              {client.state && client.state && (
                <>, {client.state}</>
              )}
              {client.zip && client.zip && (
                <>, {client.zip}</>
              )}
            </div>
          )}
          {(client.phone || client.email) && (
            <div className={`text-sm ${inverted ? 'text-text-secondary-inverse' : 'text-text-secondary'}`}>
              {client.phone && (
                <div>{client.phone}</div>
              )}
              {client.email && (
                <div>{client.email}</div>
              )}
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div className={invoicePreviewSectionVariants({})}>
          <h3 className={invoicePreviewSectionTitleVariants({})}>
            LINE ITEMS
          </h3>
          <div className={invoicePreviewTableVariants({})}>
            <table className="w-full">
              <thead>
                <tr className={invoicePreviewTableHeaderVariants({})}>
                  <th className={invoicePreviewTableCellVariants({})}>
                    DESCRIPTION
                  </th>
                  <th className={`text-right ${invoicePreviewTableCellVariants({})}`}>
                    QUANTITY
                  </th>
                  <th className={`text-right ${invoicePreviewTableCellVariants({})}`}>
                    UNIT PRICE
                  </th>
                  <th className={`text-right ${invoicePreviewTableCellVariants({})}`}>
                    TOTAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item) => (
                  <tr key={item.id}>
                    <td className={invoicePreviewTableCellVariants({})}>
                      {item.description}
                    </td>
                    <td className={`text-right ${invoicePreviewTableCellVariants({})}`}>
                      {item.quantity}
                    </td>
                    <td className={`text-right ${invoicePreviewTableCellVariants({})}`}>
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className={`text-right font-bold ${invoicePreviewTableCellVariants({})}`}>
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className={invoicePreviewTotalsVariants({})}>
          <div className={invoicePreviewTotalRowVariants({})}>
            <span className={invoicePreviewTotalLabelVariants({})}>
              Subtotal
            </span>
            <span className={invoicePreviewTotalValueVariants({})}>
              {formatCurrency(invoice.subtotal)}
            </span>
          </div>

          {invoice.tax_amount > 0 && (
            <div className={invoicePreviewTotalRowVariants({})}>
              <span className={invoicePreviewTotalLabelVariants({})}>
                Tax ({(invoice.tax_rate * 100).toFixed(1)}%)
              </span>
              <span className={invoicePreviewTotalValueVariants({})}>
                {formatCurrency(invoice.tax_amount)}
              </span>
            </div>
          )}

          {invoice.service_charge_amount && invoice.service_charge_amount > 0 && (
            <div className={invoicePreviewTotalRowVariants({})}>
              <span className={invoicePreviewTotalLabelVariants ({})}>
                Service Charge ({(invoice.service_charge_rate! * 100).toFixed(1)}%)
              </span>
              <span className={invoicePreviewTotalValueVariants ({})}>
                {formatCurrency(invoice.service_charge_amount)}
              </span>
            </div>
          )}

          {invoice.discount_amount && invoice.discount_amount > 0 && (
            <div className={invoicePreviewTotalRowVariants ({})}>
              <span className={invoicePreviewTotalLabelVariants ({})}>
                Discount
              </span>
              <span className={invoicePreviewTotalValueVariants ({})}>
                -{formatCurrency(invoice.discount_amount)}
              </span>
            </div>
          )}

          <div className={invoicePreviewTotalRowVariants ({})}>
            <span className={`text-lg font-bold ${invoicePreviewTotalLabelVariants ({})}`}>
              TOTAL
            </span>
            <span className={`text-xl font-bold ${invoicePreviewTotalValueVariants ({})}`}>
              {formatCurrency(invoice.total_amount)}
            </span>
          </div>

          {invoice.amount_paid && invoice.amount_paid > 0 && (
            <div className={invoicePreviewTotalRowVariants ({})}>
              <span className={invoicePreviewTotalLabelVariants ({})}>
                Amount Paid
              </span>
              <span className={invoicePreviewTotalValueVariants ({})}>
                {formatCurrency(invoice.amount_paid)}
              </span>
            </div>
          )}

          {invoice.balance_due && invoice.balance_due > 0 && (
            <div className={invoicePreviewTotalRowVariants ({})}>
              <span className={`text-lg font-bold ${invoicePreviewTotalLabelVariants ({})}`}>
                Balance Due
              </span>
              <span className={`text-xl font-bold ${
                invoice.balance_due > 0 
                  ? "text-error-600" 
                  : "text-success-600"
              } ${invoicePreviewTotalValueVariants ({})}`}>
                {formatCurrency(invoice.balance_due)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {(invoice.notes || invoice.terms) && (
        <div className={invoicePreviewFooterVariants ({})}>
          {invoice.notes && (
            <div>
              <h4 className={invoicePreviewSectionTitleVariants ({})}>
                NOTES
              </h4>
              <p className={invoicePreviewNotesVariants ({})}>
                {invoice.notes}
              </p>
            </div>
          )}
          
          {invoice.terms && (
            <div>
              <h4 className={invoicePreviewSectionTitleVariants ({})}>
                TERMS
              </h4>
              <p className={invoicePreviewTermsVariants ({})}>
                {invoice.terms}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
