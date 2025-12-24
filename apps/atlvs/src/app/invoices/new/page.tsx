'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H2,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, DollarSign, Calendar, User, FileText } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_amount: number;
}

const PAYMENT_TERMS = [
  { value: 'due_on_receipt', label: 'Due on Receipt' },
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    payment_terms: 'net_30',
    due_date: '',
    notes: '',
    billing_address: '',
    po_number: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, tax_rate: 0, discount_amount: 0 },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), description: '', quantity: 1, unit_price: 0, tax_rate: 0, discount_amount: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map((item) => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateLineTotal = (item: LineItem) => {
    const subtotal = item.quantity * item.unit_price;
    const tax = subtotal * (item.tax_rate / 100);
    return subtotal + tax - item.discount_amount;
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    return lineItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.unit_price;
      return sum + (subtotal * (item.tax_rate / 100));
    }, 0);
  };

  const calculateDiscount = () => {
    return lineItems.reduce((sum, item) => sum + item.discount_amount, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          line_items: lineItems.filter((item) => item.description.trim() !== ''),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create invoice');
      }

      router.push('/invoices');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AtlvsAppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Create Invoice</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Create a new invoice for a client
            </Body>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-card">
            <Body className="text-body-sm text-destructive">{error}</Body>
          </div>
        )}

        <Form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Client Information
            </H2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Client <Text className="text-destructive">*</Text>
                </Label>
                <Select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a client...</option>
                  <option value="client-1">Acme Corporation</option>
                  <option value="client-2">TechStart Inc</option>
                  <option value="client-3">Global Events Co</option>
                </Select>
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Project (Optional)
                </Label>
                <Select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a project...</option>
                  <option value="project-1">Summer Festival 2025</option>
                  <option value="project-2">Product Launch Event</option>
                  <option value="project-3">Annual Gala</option>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Billing Address
                </Label>
                <Textarea
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Enter billing address..."
                />
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Payment Terms
            </H2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Payment Terms
                </Label>
                <Select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PAYMENT_TERMS.map((term) => (
                    <option key={term.value} value={term.value}>{term.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Due Date <Text className="text-destructive">*</Text>
                </Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  PO Number
                </Label>
                <Input
                  type="text"
                  value={formData.po_number}
                  onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Client PO #"
                />
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center justify-between mb-4">
              <H2 className="text-h4-md font-weight-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Line Items
              </H2>
              <Button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-body-sm font-weight-medium text-primary hover:bg-primary/10 rounded-button transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-body-xs font-weight-semibold text-muted-foreground uppercase px-2">
                <div className="col-span-4">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-1 text-right">Tax %</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1" />
              </div>

              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <Input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={item.tax_rate}
                      onChange={(e) => updateLineItem(item.id, 'tax_rate', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm text-right focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <Text className="text-body-sm font-weight-medium text-foreground">
                      {formatCurrency(calculateLineTotal(item))}
                    </Text>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="p-1.5 hover:bg-destructive/10 rounded-button transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-body-sm">
                    <Text className="text-muted-foreground">Subtotal</Text>
                    <Text className="font-weight-medium text-foreground">{formatCurrency(calculateSubtotal())}</Text>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <Text className="text-muted-foreground">Tax</Text>
                    <Text className="font-weight-medium text-foreground">{formatCurrency(calculateTax())}</Text>
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-body-sm">
                      <Text className="text-muted-foreground">Discount</Text>
                      <Text className="font-weight-medium text-success">-{formatCurrency(calculateDiscount())}</Text>
                    </div>
                  )}
                  <div className="flex justify-between text-body-lg font-weight-bold pt-2 border-t border-border">
                    <Text className="text-foreground">Total</Text>
                    <Text className="text-primary">{formatCurrency(calculateTotal())}</Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Notes</H2>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Additional notes for the client..."
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <DollarSign className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </Form>
      </div>
    </AtlvsAppLayout>
  );
}
