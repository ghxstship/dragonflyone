'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H2,
  H3,
  Input,
  Label,
  Text,
} from '@ghxstship/ui';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CreditCard, Check, AlertCircle, Building2, Lock } from 'lucide-react';

interface PublicInvoice {
  id: string;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  contact: {
    first_name: string;
    last_name: string;
    email: string;
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
  };
}

export default function PublicPaymentPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ach'>('card');

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await fetch(`/api/invoices/public/${token}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Invoice not found or payment link has expired');
          } else {
            setError('Failed to load invoice');
          }
          return;
        }
        const data = await response.json();
        setInvoice(data);
      } catch (err) {
        setError('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchInvoice();
    }
  }, [token]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      const response = await fetch(`/api/invoices/public/${token}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: paymentMethod }),
      });
      
      if (response.ok) {
        setInvoice((prev) => prev ? { ...prev, status: 'paid', balance_due: 0 } : null);
      }
    } finally {
      setProcessing(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-100 flex items-center justify-center">
        <div className="animate-pulse text-ink-500">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-ink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-card shadow-sm border-2 border-ink-200 max-w-md">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <H1 className="text-h5-md font-weight-semibold text-ink-900 mb-2">Invoice Not Found</H1>
          <Body className="text-ink-500">{error || 'This payment link may have expired.'}</Body>
        </div>
      </div>
    );
  }

  if (invoice.status === 'paid' || invoice.balance_due <= 0) {
    return (
      <div className="min-h-screen bg-ink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-card shadow-sm border-2 border-ink-200 max-w-md">
          <Check className="h-16 w-16 text-success-600 mx-auto mb-4" />
          <H1 className="text-h4-md font-weight-bold text-ink-900 mb-2">Payment Complete</H1>
          <Body className="text-ink-500 mb-4">
            Thank you! Invoice #{invoice.invoice_number} has been paid in full.
          </Body>
          <Body className="text-body-sm text-ink-400">A receipt has been sent to your email.</Body>
        </div>
      </div>
    );
  }

  const isOverdue = new Date(invoice.due_date) < new Date();

  return (
    <div className="min-h-screen bg-ink-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-card shadow-sm border-2 border-ink-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              {invoice.organization.logo_url ? (
                <Image src={invoice.organization.logo_url} alt={invoice.organization.name} width={40} height={40} className="h-10 w-auto" />
              ) : (
                <Building2 className="h-8 w-8 text-violet-600" />
              )}
              <Text className="text-h6-md font-weight-semibold text-ink-900">{invoice.organization.name}</Text>
            </div>

            <div className="mb-6">
              <H1 className="text-h4-md font-weight-bold text-ink-900">Invoice #{invoice.invoice_number}</H1>
              <Body className="text-body-sm text-ink-500 mt-1">
                For {invoice.contact.first_name} {invoice.contact.last_name}
              </Body>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-body-sm">
                <Text className="text-ink-500">Issue Date</Text>
                <Text className="text-ink-900">{formatDate(invoice.issue_date)}</Text>
              </div>
              <div className="flex justify-between text-body-sm">
                <Text className="text-ink-500">Due Date</Text>
                <Text className={isOverdue ? 'text-error-600 font-weight-medium' : 'text-ink-900'}>
                  {formatDate(invoice.due_date)}
                  {isOverdue && ' (Overdue)'}
                </Text>
              </div>
            </div>

            <div className="border-t border-ink-200 pt-4 mb-4">
              <H3 className="text-body-sm font-weight-medium text-ink-500 mb-3">Items</H3>
              <div className="space-y-2">
                {invoice.line_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-body-sm">
                    <Text className="text-ink-900">
                      {item.description} x {item.quantity}
                    </Text>
                    <Text className="text-ink-900">{formatCurrency(item.total)}</Text>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-ink-200 pt-4">
              <div className="flex justify-between text-body-sm mb-2">
                <Text className="text-ink-500">Total Amount</Text>
                <Text className="text-ink-900">{formatCurrency(invoice.total_amount)}</Text>
              </div>
              {invoice.amount_paid > 0 && (
                <div className="flex justify-between text-body-sm mb-2 text-success-600">
                  <Text>Amount Paid</Text>
                  <Text>-{formatCurrency(invoice.amount_paid)}</Text>
                </div>
              )}
              <div className="flex justify-between text-h6-md font-weight-bold pt-2 border-t border-ink-200">
                <Text className="text-ink-500">Amount Due</Text>
                <Text className="text-ink-900">{formatCurrency(invoice.balance_due)}</Text>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-card shadow-sm border-2 border-ink-200 p-6">
            <H2 className="text-h6-md font-weight-semibold text-ink-900 mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </H2>

            <Form onSubmit={handlePayment} className="space-y-6">
              <div>
                <Label className="block text-body-sm font-weight-medium text-ink-700 mb-2">
                  Payment Method
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-violet-600 bg-violet-50'
                        : 'border-ink-200 hover:border-ink-300'
                    }`}
                  >
                    <CreditCard className={`h-6 w-6 mx-auto mb-1 ${
                      paymentMethod === 'card' ? 'text-violet-600' : 'text-ink-400'
                    }`} />
                    <Text className={`text-sm font-medium ${
                      paymentMethod === 'card' ? 'text-violet-600' : 'text-ink-600'
                    }`}>Card</Text>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setPaymentMethod('ach')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === 'ach'
                        ? 'border-violet-600 bg-violet-50'
                        : 'border-ink-200 hover:border-ink-300'
                    }`}
                  >
                    <Building2 className={`h-6 w-6 mx-auto mb-1 ${
                      paymentMethod === 'ach' ? 'text-violet-600' : 'text-ink-400'
                    }`} />
                    <Text className={`text-sm font-medium ${
                      paymentMethod === 'ach' ? 'text-violet-600' : 'text-ink-600'
                    }`}>Bank (ACH)</Text>
                  </Button>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <Label className="block text-body-sm font-weight-medium text-ink-700 mb-1">
                      Card Number
                    </Label>
                    <Input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-4 py-2 border-2 border-ink-300 rounded-input focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-body-sm font-weight-medium text-ink-700 mb-1">
                        Expiry
                      </Label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border-2 border-ink-300 rounded-input focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <Label className="block text-body-sm font-weight-medium text-ink-700 mb-1">
                        CVC
                      </Label>
                      <Input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-2 border-2 border-ink-300 rounded-input focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'ach' && (
                <div className="space-y-4">
                  <div>
                    <Label className="block text-body-sm font-weight-medium text-ink-700 mb-1">
                      Account Holder Name
                    </Label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border-2 border-ink-300 rounded-input focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <Label className="block text-body-sm font-weight-medium text-ink-700 mb-1">
                      Routing Number
                    </Label>
                    <Input
                      type="text"
                      placeholder="110000000"
                      className="w-full px-4 py-2 border-2 border-ink-300 rounded-input focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <Label className="block text-body-sm font-weight-medium text-ink-700 mb-1">
                      Account Number
                    </Label>
                    <Input
                      type="text"
                      placeholder="000123456789"
                      className="w-full px-4 py-2 border-2 border-ink-300 rounded-input focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-button hover:bg-violet-700 transition-colors disabled:opacity-50 font-weight-medium"
              >
                {processing ? 'Processing...' : `Pay ${formatCurrency(invoice.balance_due)}`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-mono-xs text-ink-400">
                <Lock className="h-3 w-3" />
                Secured by Stripe
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
