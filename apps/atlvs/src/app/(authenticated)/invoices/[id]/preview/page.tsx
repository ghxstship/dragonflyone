'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Printer, Download, Building2, Mail, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  notes?: string;
  payment_terms?: string;
  contact: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
  };
  line_items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  organization: {
    name: string;
    logo_url?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export default function InvoicePreviewPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) throw new Error('Failed to fetch invoice');
      return response.json() as Promise<Invoice>;
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load invoice</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link
            href={`/invoices/${invoiceId}`}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Print Preview</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Invoice #{invoice.invoice_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span className="text-body-sm font-weight-medium">Print</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors">
            <Download className="h-4 w-4" />
            <span className="text-body-sm font-weight-medium">PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-border rounded-card p-8 print:border-0 print:p-0 max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            {invoice.organization.logo_url ? (
              <Image src={invoice.organization.logo_url} alt={invoice.organization.name} width={48} height={48} className="h-12 w-auto mb-4" />
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="text-h3-md font-weight-bold text-foreground">{invoice.organization.name}</span>
              </div>
            )}
            {invoice.organization.address && (
              <p className="text-body-sm text-muted-foreground">{invoice.organization.address}</p>
            )}
            {invoice.organization.phone && (
              <p className="text-body-sm text-muted-foreground">{invoice.organization.phone}</p>
            )}
            {invoice.organization.email && (
              <p className="text-body-sm text-muted-foreground">{invoice.organization.email}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-h2-md font-weight-bold text-foreground">INVOICE</h2>
            <p className="text-body-md text-muted-foreground">#{invoice.invoice_number}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-avatar text-body-sm font-weight-medium ${
              invoice.status === 'paid' ? 'bg-success-100 text-success-800' :
              invoice.status === 'overdue' ? 'bg-error-100 text-error-800' :
              invoice.status === 'sent' ? 'bg-info-100 text-info-800' :
              'bg-ink-100 text-ink-800'
            }`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b-2 border-border">
          <div>
            <h3 className="text-body-sm font-weight-semibold text-muted-foreground uppercase tracking-label mb-2">Bill To</h3>
            <p className="text-body-md font-weight-medium text-foreground">
              {invoice.contact.first_name} {invoice.contact.last_name}
            </p>
            {invoice.contact.company && (
              <p className="text-body-sm text-foreground">{invoice.contact.company}</p>
            )}
            {invoice.contact.address && (
              <p className="text-body-sm text-muted-foreground">{invoice.contact.address}</p>
            )}
            <div className="mt-2">
              {invoice.contact.email && (
                <p className="text-body-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {invoice.contact.email}
                </p>
              )}
              {invoice.contact.phone && (
                <p className="text-body-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {invoice.contact.phone}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="space-y-1">
              <p className="text-body-sm text-muted-foreground">
                <span className="font-weight-medium">Issue Date:</span> {formatDate(invoice.issue_date)}
              </p>
              <p className="text-body-sm text-muted-foreground">
                <span className="font-weight-medium">Due Date:</span> {formatDate(invoice.due_date)}
              </p>
              {invoice.payment_terms && (
                <p className="text-body-sm text-muted-foreground">
                  <span className="font-weight-medium">Terms:</span> {invoice.payment_terms}
                </p>
              )}
            </div>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-3 text-body-sm font-weight-semibold text-muted-foreground">Description</th>
              <th className="text-right py-3 text-body-sm font-weight-semibold text-muted-foreground w-24">Qty</th>
              <th className="text-right py-3 text-body-sm font-weight-semibold text-muted-foreground w-32">Unit Price</th>
              <th className="text-right py-3 text-body-sm font-weight-semibold text-muted-foreground w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoice.line_items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 text-body-md text-foreground">{item.description}</td>
                <td className="py-3 text-body-md text-foreground text-right">{item.quantity}</td>
                <td className="py-3 text-body-md text-foreground text-right">{formatCurrency(item.unit_price)}</td>
                <td className="py-3 text-body-md font-weight-medium text-foreground text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-body-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-body-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-body-md font-weight-semibold pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatCurrency(invoice.total_amount)}</span>
            </div>
            {invoice.amount_paid > 0 && (
              <div className="flex justify-between text-body-sm text-success-600">
                <span>Paid</span>
                <span>-{formatCurrency(invoice.amount_paid)}</span>
              </div>
            )}
            <div className="flex justify-between text-h4-md font-weight-bold pt-2 border-t-2 border-border">
              <span className="text-foreground">Balance Due</span>
              <span className="text-foreground">{formatCurrency(invoice.balance_due)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="pt-6 border-t border-border">
            <h3 className="text-body-sm font-weight-semibold text-muted-foreground uppercase tracking-label mb-2">Notes</h3>
            <p className="text-body-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
