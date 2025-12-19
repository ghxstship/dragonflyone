'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Calendar, DollarSign, Edit2, Trash2, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PaymentPlan {
  id: string;
  name: string;
  description?: string;
  booking_id?: string;
  booking_name?: string;
  total_amount: number;
  currency: string;
  installments: Installment[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface Installment {
  id: string;
  due_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paid_at?: string;
}

const DEMO_PLANS: PaymentPlan[] = [
  {
    id: 'PP-001',
    name: 'Corporate Event Q1',
    description: '3-installment plan for corporate event',
    booking_id: 'BK-001',
    booking_name: 'Annual Gala 2025',
    total_amount: 45000,
    currency: 'USD',
    installments: [
      { id: 'i1', due_date: '2024-12-01', amount: 15000, status: 'paid', paid_at: '2024-11-28' },
      { id: 'i2', due_date: '2025-01-15', amount: 15000, status: 'pending' },
      { id: 'i3', due_date: '2025-02-01', amount: 15000, status: 'pending' },
    ],
    status: 'active',
    created_at: '2024-11-15T10:00:00Z',
    updated_at: '2024-11-28T14:30:00Z',
  },
  {
    id: 'PP-002',
    name: 'Wedding Package',
    description: '4-installment wedding payment plan',
    booking_id: 'BK-002',
    booking_name: 'Smith-Johnson Wedding',
    total_amount: 28000,
    currency: 'USD',
    installments: [
      { id: 'i1', due_date: '2024-10-01', amount: 7000, status: 'paid', paid_at: '2024-09-30' },
      { id: 'i2', due_date: '2024-11-01', amount: 7000, status: 'paid', paid_at: '2024-11-01' },
      { id: 'i3', due_date: '2024-12-01', amount: 7000, status: 'overdue' },
      { id: 'i4', due_date: '2025-01-15', amount: 7000, status: 'pending' },
    ],
    status: 'active',
    created_at: '2024-09-01T09:00:00Z',
    updated_at: '2024-12-05T11:00:00Z',
  },
  {
    id: 'PP-003',
    name: 'Conference Sponsorship',
    description: '2-installment sponsor payment',
    booking_id: 'BK-003',
    booking_name: 'Tech Summit 2025',
    total_amount: 20000,
    currency: 'USD',
    installments: [
      { id: 'i1', due_date: '2024-11-15', amount: 10000, status: 'paid', paid_at: '2024-11-14' },
      { id: 'i2', due_date: '2025-01-15', amount: 10000, status: 'paid', paid_at: '2024-12-20' },
    ],
    status: 'completed',
    created_at: '2024-10-20T08:00:00Z',
    updated_at: '2024-12-20T16:00:00Z',
  },
];

export default function PaymentPlansPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['payment-plans', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const response = await fetch(`/api/payments/plans?${params}`);
      if (!response.ok) {
        return { plans: DEMO_PLANS };
      }
      const result = await response.json();
      return result.plans?.length ? result : { plans: DEMO_PLANS };
    },
  });

  const plans: PaymentPlan[] = data?.plans || DEMO_PLANS;

  const filteredPlans = statusFilter
    ? plans.filter((p) => p.status === statusFilter)
    : plans;

  const createPlan = useMutation({
    mutationFn: async (plan: Partial<PaymentPlan>) => {
      const response = await fetch('/api/payments/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      if (!response.ok) throw new Error('Failed to create plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-plans'] });
      setShowCreateModal(false);
    },
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/payments/plans/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete plan');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-plans'] });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/20 text-success';
      case 'completed':
        return 'bg-primary/20 text-primary';
      case 'cancelled':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const totalReceivable = plans
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => {
      const pending = p.installments
        .filter((i) => i.status !== 'paid')
        .reduce((s, i) => s + i.amount, 0);
      return sum + pending;
    }, 0);

  const overdueAmount = plans
    .flatMap((p) => p.installments)
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading payment plans...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load payment plans</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['payment-plans'] })}
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/payments"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Payment Plans</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Manage installment payment plans for bookings
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-body-sm font-weight-medium">New Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Active Plans</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">
            {plans.filter((p) => p.status === 'active').length}
          </p>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">Total Receivable</span>
          </div>
          <p className="text-h3-md font-weight-bold text-success">
            ${totalReceivable.toLocaleString()}
          </p>
        </div>
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <span className="text-body-sm text-muted-foreground">Overdue</span>
          </div>
          <p className="text-h3-md font-weight-bold text-destructive">
            ${overdueAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-background border-2 border-secondary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-secondary" />
            <span className="text-body-sm text-muted-foreground">Completed</span>
          </div>
          <p className="text-h3-md font-weight-bold text-secondary">
            {plans.filter((p) => p.status === 'completed').length}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No payment plans
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            Create payment plans to offer flexible payment options
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button"
          >
            <Plus className="h-4 w-4" />
            Create First Plan
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-background border-2 border-border rounded-card overflow-hidden"
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-body-lg font-weight-semibold text-foreground">
                        {plan.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-badge text-body-xs font-weight-medium ${getStatusColor(plan.status)}`}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </div>
                    {plan.booking_name && (
                      <p className="text-body-sm text-muted-foreground">
                        Booking: {plan.booking_name}
                      </p>
                    )}
                    {plan.description && (
                      <p className="text-body-xs text-muted-foreground mt-1">{plan.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/payments/plans/${plan.id}/edit`}
                      className="p-2 hover:bg-muted rounded-button transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Delete this payment plan?')) {
                          deletePlan.mutate(plan.id);
                        }
                      }}
                      className="p-2 hover:bg-destructive/10 rounded-button transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-body-sm text-muted-foreground">
                    Total: <span className="font-weight-semibold text-foreground">${plan.total_amount.toLocaleString()}</span>
                  </span>
                  <span className="text-body-sm text-muted-foreground">
                    {plan.installments.filter((i) => i.status === 'paid').length} of {plan.installments.length} paid
                  </span>
                </div>
                <div className="space-y-2">
                  {plan.installments.map((installment, index) => (
                    <div
                      key={installment.id}
                      className={`flex items-center justify-between p-3 rounded-button ${
                        installment.status === 'paid' ? 'bg-success/10' :
                        installment.status === 'overdue' ? 'bg-destructive/10' :
                        'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(installment.status)}
                        <div>
                          <p className="text-body-sm font-weight-medium text-foreground">
                            Installment {index + 1}
                          </p>
                          <p className="text-body-xs text-muted-foreground">
                            Due: {new Date(installment.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-body-sm font-weight-semibold text-foreground">
                          ${installment.amount.toLocaleString()}
                        </p>
                        <p className="text-body-xs text-muted-foreground capitalize">
                          {installment.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4">
              Create Payment Plan
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const totalAmount = parseFloat(formData.get('total_amount') as string) || 0;
                const numInstallments = parseInt(formData.get('num_installments') as string) || 2;
                const installmentAmount = totalAmount / numInstallments;
                const installments: Installment[] = Array.from({ length: numInstallments }, (_, i) => ({
                  id: `temp-${i}`,
                  due_date: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  amount: installmentAmount,
                  status: 'pending' as const,
                }));
                createPlan.mutate({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string || undefined,
                  total_amount: totalAmount,
                  currency: 'USD',
                  installments,
                  status: 'draft',
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Corporate Event Payment Plan"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Plan description..."
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    name="total_amount"
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Installments *
                  </label>
                  <select
                    name="num_installments"
                    required
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    <option value="2">2 Installments</option>
                    <option value="3">3 Installments</option>
                    <option value="4">4 Installments</option>
                    <option value="6">6 Installments</option>
                    <option value="12">12 Installments</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPlan.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createPlan.isPending ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
