'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, FileText, Plus, Trash2 } from 'lucide-react';
import { useCreateVendorInvoice, type VendorInvoiceLineItem } from '@/hooks/useVendorInvoices';
import { useVendorProfiles } from '@/hooks/useVendorProfiles';

function NewVendorInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorIdParam = searchParams.get('vendor');

  const createMutation = useCreateVendorInvoice();
  const { data: vendorsData } = useVendorProfiles({});

  const [formData, setFormData] = useState({
    vendor_profile_id: vendorIdParam || '',
    vendor_invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    payment_terms: 'Net 30',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<VendorInvoiceLineItem[]>([
    { description: '', quantity: 1, unit_price: 0, total: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * 0; // Can add tax calculation
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleLineItemChange = (index: number, field: keyof VendorInvoiceLineItem, value: string | number) => {
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
    if (!formData.vendor_profile_id) newErrors.vendor_profile_id = 'Vendor is required';
    if (!formData.invoice_date) newErrors.invoice_date = 'Invoice date is required';
    if (!formData.due_date) newErrors.due_date = 'Due date is required';
    if (lineItems.length === 0 || lineItems.every((item) => !item.description)) {
      newErrors.line_items = 'At least one line item is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { subtotal, taxAmount, total } = calculateTotals();

    try {
      await createMutation.mutateAsync({
        vendor_profile_id: formData.vendor_profile_id,
        vendor_invoice_number: formData.vendor_invoice_number || undefined,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        payment_terms: formData.payment_terms || undefined,
        line_items: lineItems.filter((item) => item.description),
        subtotal,
        tax_amount: taxAmount,
        total,
        notes: formData.notes || undefined,
      });
      router.push('/vendor-invoices');
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create invoice',
      });
    }
  };

  const { subtotal, total } = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <a
          href="/vendor-invoices"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </a>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-h3-md font-weight-bold text-foreground">Record Vendor Invoice</h1>
            <p className="text-body-sm text-muted-foreground">
              Enter an invoice received from a vendor
            </p>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Vendor *
              </label>
              <select
                value={formData.vendor_profile_id}
                onChange={(e) => setFormData({ ...formData, vendor_profile_id: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select vendor</option>
                {vendorsData?.vendors?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              {errors.vendor_profile_id && (
                <p className="mt-1 text-body-xs text-destructive">{errors.vendor_profile_id}</p>
              )}
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Vendor Invoice #
              </label>
              <input
                type="text"
                placeholder="Vendor's invoice number"
                value={formData.vendor_invoice_number}
                onChange={(e) => setFormData({ ...formData, vendor_invoice_number: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.invoice_date && (
                <p className="mt-1 text-body-xs text-destructive">{errors.invoice_date}</p>
              )}
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              {errors.due_date && (
                <p className="mt-1 text-body-xs text-destructive">{errors.due_date}</p>
              )}
            </div>

            <div>
              <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Payment Terms
              </label>
              <select
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-h4-md font-weight-semibold text-foreground">Line Items</h2>
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
                          placeholder="Item description"
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
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-body-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-weight-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-body-sm border-t border-border pt-2">
                  <span className="font-weight-semibold">Total</span>
                  <span className="text-h4-md font-weight-bold text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes about this invoice..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <a
              href="/vendor-invoices"
              className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Saving...' : 'Record Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewVendorInvoicePage() {
  return (
    <Suspense fallback={<div className="p-6 animate-pulse text-muted-foreground">Loading...</div>}>
      <NewVendorInvoiceContent />
    </Suspense>
  );
}
