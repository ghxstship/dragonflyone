'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileText, Plus, Trash2, DollarSign } from 'lucide-react';
import { useCreateProposal } from '@/hooks/useProposals';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export default function NewProposalPage() {
  const router = useRouter();
  const createMutation = useCreateProposal();

  const [formData, setFormData] = useState({
    title: '',
    client_name: '',
    client_email: '',
    event_date: '',
    event_type: '',
    venue_name: '',
    valid_days: 30,
    introduction: '',
    terms_conditions: '',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, total: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'description') {
        item.description = value as string;
      } else if (field === 'quantity') {
        item.quantity = Number(value) || 0;
        item.total = item.quantity * item.unit_price;
      } else if (field === 'unit_price') {
        item.unit_price = Number(value) || 0;
        item.total = item.quantity * item.unit_price;
      }

      updated[index] = item;
      return updated;
    });
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { description: '', quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.client_name) newErrors.client_name = 'Client name is required';
    if (!formData.client_email) newErrors.client_email = 'Client email is required';
    if (lineItems.every((item) => !item.description)) {
      newErrors.line_items = 'At least one line item is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'sent' = 'draft') => {
    e.preventDefault();
    if (!validate()) return;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + formData.valid_days);

    try {
      const result = await createMutation.mutateAsync({
        title: formData.title,
        client_name: formData.client_name,
        client_email: formData.client_email,
        event_date: formData.event_date || undefined,
        event_type: formData.event_type || undefined,
        venue_name: formData.venue_name || undefined,
        valid_until: validUntil.toISOString(),
        introduction: formData.introduction || undefined,
        terms_conditions: formData.terms_conditions || undefined,
        notes: formData.notes || undefined,
        line_items: lineItems.filter((item) => item.description),
        total_amount: calculateTotal(),
        status,
      });
      router.push(`/proposals/${result.id}`);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create proposal',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/proposals"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Link>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-h3-md font-weight-bold text-foreground">New Proposal</h1>
            <p className="text-body-sm text-muted-foreground">
              Create a branded proposal for your client
            </p>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-6">
          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Proposal Title *
            </label>
            <input
              type="text"
              placeholder="e.g., Wedding Reception Package"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {errors.title && (
              <p className="mt-1 text-body-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Client Name *
              </label>
              <input
                type="text"
                placeholder="Client's full name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.client_name && (
                <p className="mt-1 text-body-xs text-destructive">{errors.client_name}</p>
              )}
            </div>
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Client Email *
              </label>
              <input
                type="email"
                placeholder="client@example.com"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.client_email && (
                <p className="mt-1 text-body-xs text-destructive">{errors.client_email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Event Date
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Event Type
              </label>
              <input
                type="text"
                placeholder="e.g., Wedding, Corporate"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Valid For (Days)
              </label>
              <input
                type="number"
                min="1"
                value={formData.valid_days}
                onChange={(e) => setFormData({ ...formData, valid_days: Number(e.target.value) || 30 })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Introduction
            </label>
            <textarea
              rows={3}
              placeholder="Personalized message for your client..."
              value={formData.introduction}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h2 className="text-h4-md font-weight-semibold text-foreground">Pricing</h2>
              </div>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-body-sm font-weight-medium text-primary hover:bg-primary/10 rounded-button transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            {errors.line_items && (
              <p className="text-body-xs text-destructive">{errors.line_items}</p>
            )}

            <div className="border-2 border-border rounded-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2 text-body-xs font-weight-medium text-muted-foreground">Description</th>
                    <th className="text-center px-4 py-2 text-body-xs font-weight-medium text-muted-foreground w-24">Qty</th>
                    <th className="text-right px-4 py-2 text-body-xs font-weight-medium text-muted-foreground w-32">Unit Price</th>
                    <th className="text-right px-4 py-2 text-body-xs font-weight-medium text-muted-foreground w-32">Total</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lineItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="Service or item description"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border-2 border-border rounded bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border-2 border-border rounded bg-background text-body-sm text-center focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                          className="w-full px-2 py-1 border-2 border-border rounded bg-background text-body-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-2 text-right text-body-sm font-weight-medium">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64 border-t border-border pt-4">
                <div className="flex justify-between text-body-lg font-weight-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Terms & Conditions
            </label>
            <textarea
              rows={3}
              placeholder="Payment terms, cancellation policy, etc."
              value={formData.terms_conditions}
              onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/proposals"
              className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'sent')}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create & Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
