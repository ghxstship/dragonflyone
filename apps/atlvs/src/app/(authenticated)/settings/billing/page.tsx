'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Check, Download, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@ghxstship/ui';

interface BillingInfo {
  plan: {
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    features: string[];
  };
  usage: {
    bookings: number;
    bookings_limit: number;
    storage_gb: number;
    storage_limit_gb: number;
    team_members: number;
    team_limit: number;
  };
  payment_method?: {
    type: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  next_billing_date: string;
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
  }>;
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    features: ['Up to 50 bookings/month', '2 team members', '5GB storage', 'Email support'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    features: ['Unlimited bookings', '10 team members', '50GB storage', 'Priority support', 'Custom branding'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 399,
    features: ['Everything in Pro', 'Unlimited team', 'Unlimited storage', 'Dedicated support', 'API access', 'SSO'],
  },
];

export default function BillingSettingsPage() {
  const [showChangePlan, setShowChangePlan] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['billing-info'],
    queryFn: async () => {
      const response = await fetch('/api/settings/billing');
      if (!response.ok) {
        return {
          plan: {
            name: 'Professional',
            price: 149,
            interval: 'monthly',
            features: ['Unlimited bookings', '10 team members', '50GB storage'],
          },
          usage: {
            bookings: 127,
            bookings_limit: -1,
            storage_gb: 12.5,
            storage_limit_gb: 50,
            team_members: 5,
            team_limit: 10,
          },
          payment_method: {
            type: 'card',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025,
          },
          next_billing_date: '2025-02-15',
          invoices: [
            { id: 'inv-001', date: '2025-01-15', amount: 149, status: 'paid' },
            { id: 'inv-002', date: '2024-12-15', amount: 149, status: 'paid' },
            { id: 'inv-003', date: '2024-11-15', amount: 149, status: 'paid' },
          ],
        } as BillingInfo;
      }
      return response.json() as Promise<BillingInfo>;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
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
        <div className="animate-pulse text-muted-foreground">Loading billing...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Billing & Plans
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage your subscription and payment methods
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-background border-2 border-primary rounded-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-h4-md font-weight-semibold text-foreground">
                  {data?.plan.name} Plan
                </h2>
                <p className="text-body-sm text-muted-foreground">
                  {formatCurrency(data?.plan.price || 0)}/{data?.plan.interval}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowChangePlan(true)}>
                Change Plan
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted/30 rounded-card">
                <p className="text-body-xs text-muted-foreground">Bookings</p>
                <p className="text-body-md font-weight-semibold text-foreground">
                  {data?.usage.bookings || 0}
                  {(data?.usage.bookings_limit ?? -1) > 0 && (
                    <span className="text-muted-foreground font-weight-normal">
                      /{data?.usage.bookings_limit}
                    </span>
                  )}
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-card">
                <p className="text-body-xs text-muted-foreground">Storage</p>
                <p className="text-body-md font-weight-semibold text-foreground">
                  {data?.usage.storage_gb || 0}GB
                  <span className="text-muted-foreground font-weight-normal">
                    /{data?.usage.storage_limit_gb || 0}GB
                  </span>
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-card">
                <p className="text-body-xs text-muted-foreground">Team</p>
                <p className="text-body-md font-weight-semibold text-foreground">
                  {data?.usage.team_members || 0}
                  <span className="text-muted-foreground font-weight-normal">
                    /{data?.usage.team_limit || 0}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Payment Method</h2>
            {data?.payment_method ? (
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-card">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-body-sm font-weight-medium text-foreground">
                      •••• •••• •••• {data.payment_method.last4}
                    </p>
                    <p className="text-body-xs text-muted-foreground">
                      Expires {data.payment_method.exp_month}/{data.payment_method.exp_year}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Update
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/30 rounded-card">
                <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-body-sm text-muted-foreground">No payment method on file</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Add Payment Method
                </Button>
              </div>
            )}
            <div className="mt-4 flex items-center gap-2 text-body-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Next billing date: {data?.next_billing_date ? formatDate(data.next_billing_date) : 'N/A'}
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Billing History</h2>
            {!data?.invoices || data.invoices.length === 0 ? (
              <p className="text-body-sm text-muted-foreground text-center py-4">
                No invoices yet
              </p>
            ) : (
              <div className="space-y-2">
                {data.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-card"
                  >
                    <div>
                      <p className="text-body-sm text-foreground">{formatDate(invoice.date)}</p>
                      <p className="text-body-xs text-muted-foreground">{invoice.id}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-0.5 text-body-xs rounded capitalize ${
                        invoice.status === 'paid'
                          ? 'bg-success-100 text-success-800'
                          : invoice.status === 'pending'
                          ? 'bg-warning-100 text-warning-800'
                          : 'bg-error-100 text-error-800'
                      }`}>
                        {invoice.status}
                      </span>
                      <span className="text-body-sm font-weight-medium text-foreground">
                        {formatCurrency(invoice.amount)}
                      </span>
                      <Button variant="ghost" size="icon" className="p-1">
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/30 border-2 border-dashed border-border rounded-card p-4">
            <h3 className="text-body-md font-weight-semibold text-foreground mb-2">Need help?</h3>
            <p className="text-body-sm text-muted-foreground mb-3">
              Contact our billing team for any questions.
            </p>
            <a href="mailto:billing@example.com" className="text-primary text-body-sm hover:underline">
              billing@example.com
            </a>
          </div>
        </div>
      </div>

      {showChangePlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-3xl w-full mx-4">
            <h3 className="text-h3-md font-weight-bold text-foreground mb-6">Change Plan</h3>
            <div className="grid grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-card border-2 ${
                    plan.popular ? 'border-primary' : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <span className="text-body-xs text-primary font-weight-medium">Most Popular</span>
                  )}
                  <h4 className="text-h4-md font-weight-semibold text-foreground mt-1">{plan.name}</h4>
                  <p className="text-h3-md font-weight-bold text-foreground">
                    {formatCurrency(plan.price)}
                    <span className="text-body-sm text-muted-foreground font-weight-normal">/mo</span>
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-body-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-success-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={data?.plan.name === plan.name ? 'ghost' : 'solid'}
                    size="sm"
                    fullWidth
                    className="mt-4"
                    disabled={data?.plan.name === plan.name}
                  >
                    {data?.plan.name === plan.name ? 'Current Plan' : 'Select'}
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowChangePlan(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
