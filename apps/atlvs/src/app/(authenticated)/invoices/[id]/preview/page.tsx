'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Printer, Download, Building2, Mail, Phone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Body,
  Button,
  H1,
  H2,
  H3,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

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
          <Body className="text-destructive">Failed to load invoice</Body>
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
            <H1 className="text-h2-md font-weight-bold text-foreground">Print Preview</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Invoice #{invoice.invoice_number}
            </Body>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <Text className="text-body-sm font-weight-medium">Print</Text>
          </Button>
          <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} iconPosition="left">
            PDF
          </Button>
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
                <Text className="text-h3-md font-weight-bold text-foreground">{invoice.organization.name}</Text>
              </div>
            )}
            {invoice.organization.address && (
              <Body className="text-body-sm text-muted-foreground">{invoice.organization.address}</Body>
            )}
            {invoice.organization.phone && (
              <Body className="text-body-sm text-muted-foreground">{invoice.organization.phone}</Body>
            )}
            {invoice.organization.email && (
              <Body className="text-body-sm text-muted-foreground">{invoice.organization.email}</Body>
            )}
          </div>
          <div className="text-right">
            <H2 className="text-h2-md font-weight-bold text-foreground">INVOICE</H2>
            <Body className="text-body-md text-muted-foreground">#{invoice.invoice_number}</Body>
            <Text className={`inline-block mt-2 px-3 py-1 rounded-avatar text-body-sm font-weight-medium ${
              invoice.status === 'paid' ? 'bg-success-100 text-success-800' :
              invoice.status === 'overdue' ? 'bg-error-100 text-error-800' :
              invoice.status === 'sent' ? 'bg-info-100 text-info-800' :
              'bg-ink-100 text-ink-800'
            }`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b-2 border-border">
          <div>
            <H3 className="text-body-sm font-weight-semibold text-muted-foreground uppercase tracking-label mb-2">Bill To</H3>
            <Body className="text-body-md font-weight-medium text-foreground">
              {invoice.contact.first_name} {invoice.contact.last_name}
            </Body>
            {invoice.contact.company && (
              <Body className="text-body-sm text-foreground">{invoice.contact.company}</Body>
            )}
            {invoice.contact.address && (
              <Body className="text-body-sm text-muted-foreground">{invoice.contact.address}</Body>
            )}
            <div className="mt-2">
              {invoice.contact.email && (
                <Body className="text-body-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {invoice.contact.email}
                </Body>
              )}
              {invoice.contact.phone && (
                <Body className="text-body-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {invoice.contact.phone}
                </Body>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="space-y-1">
              <Body className="text-body-sm text-muted-foreground">
                <Text className="font-weight-medium">Issue Date:</Text> {formatDate(invoice.issue_date)}
              </Body>
              <Body className="text-body-sm text-muted-foreground">
                <Text className="font-weight-medium">Due Date:</Text> {formatDate(invoice.due_date)}
              </Body>
              {invoice.payment_terms && (
                <Body className="text-body-sm text-muted-foreground">
                  <Text className="font-weight-medium">Terms:</Text> {invoice.payment_terms}
                </Body>
              )}
            </div>
          </div>
        </div>

        <Table className="w-full mb-8">
          <TableHeader>
            <TableRow className="border-b-2 border-border">
              <TableHead className="text-left py-3 text-body-sm font-weight-semibold text-muted-foreground">Description</TableHead>
              <TableHead className="text-right py-3 text-body-sm font-weight-semibold text-muted-foreground w-24">Qty</TableHead>
              <TableHead className="text-right py-3 text-body-sm font-weight-semibold text-muted-foreground w-32">Unit Price</TableHead>
              <TableHead className="text-right py-3 text-body-sm font-weight-semibold text-muted-foreground w-32">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {invoice.line_items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="py-3 text-body-md text-foreground">{item.description}</TableCell>
                <TableCell className="py-3 text-body-md text-foreground text-right">{item.quantity}</TableCell>
                <TableCell className="py-3 text-body-md text-foreground text-right">{formatCurrency(item.unit_price)}</TableCell>
                <TableCell className="py-3 text-body-md font-weight-medium text-foreground text-right">{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-body-sm">
              <Text className="text-muted-foreground">Subtotal</Text>
              <Text className="text-foreground">{formatCurrency(invoice.subtotal)}</Text>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-body-sm">
                <Text className="text-muted-foreground">Tax</Text>
                <Text className="text-foreground">{formatCurrency(invoice.tax_amount)}</Text>
              </div>
            )}
            <div className="flex justify-between text-body-md font-weight-semibold pt-2 border-t border-border">
              <Text className="text-foreground">Total</Text>
              <Text className="text-foreground">{formatCurrency(invoice.total_amount)}</Text>
            </div>
            {invoice.amount_paid > 0 && (
              <div className="flex justify-between text-body-sm text-success-600">
                <Text>Paid</Text>
                <Text>-{formatCurrency(invoice.amount_paid)}</Text>
              </div>
            )}
            <div className="flex justify-between text-h4-md font-weight-bold pt-2 border-t-2 border-border">
              <Text className="text-foreground">Balance Due</Text>
              <Text className="text-foreground">{formatCurrency(invoice.balance_due)}</Text>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="pt-6 border-t border-border">
            <H3 className="text-body-sm font-weight-semibold text-muted-foreground uppercase tracking-label mb-2">Notes</H3>
            <Body className="text-body-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</Body>
          </div>
        )}
      </div>
    </div>
  );
}
