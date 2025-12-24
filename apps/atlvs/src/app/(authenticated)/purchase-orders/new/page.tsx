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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileText, Plus, Trash2 } from 'lucide-react';
import { useCreatePurchaseOrder } from '@/hooks/usePurchaseOrders';
import { useVendorProfiles } from '@/hooks/useVendorProfiles';

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

function NewPurchaseOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vendorIdParam = searchParams?.get('vendor') ?? null;
  const orderIdParam = searchParams?.get('from_order') ?? null;

  const createMutation = useCreatePurchaseOrder();
  const { data: vendorsData } = useVendorProfiles({});

  const [formData, setFormData] = useState({
    vendor_id: vendorIdParam || '',
    project_id: orderIdParam || '',
    description: '',
    category: 'general',
    priority: 'medium',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, total: 0 },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * 0;
    const shippingAmount = 0;
    const total = subtotal + taxAmount + shippingAmount;
    return { subtotal, taxAmount, shippingAmount, total };
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
    if (!formData.vendor_id) newErrors.vendor_id = 'Vendor is required';
    if (lineItems.length === 0 || lineItems.every((item) => !item.description)) {
      newErrors.line_items = 'At least one line item is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    calculateTotals(); // For display purposes

    try {
      await createMutation.mutateAsync({
        vendor_id: formData.vendor_id,
        project_id: formData.project_id || undefined,
        description: lineItems.filter(i => i.description).map(i => i.description).join(', ') || formData.description,
        category: formData.category,
        priority: formData.priority,
        notes: formData.notes || undefined,
      });
      router.push('/purchase-orders');
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create purchase order',
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
        <Link
          href="/purchase-orders"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Purchase Orders
        </Link>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <H1 className="text-h3-md font-weight-bold text-foreground">New Purchase Order</H1>
            <Body className="text-body-sm text-muted-foreground">
              Create a formal purchase order for a vendor
            </Body>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <Form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Vendor *
              </Label>
              <Select
                value={formData.vendor_id}
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Select vendor</option>
                {vendorsData?.vendors?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </Select>
              {errors.vendor_id && (
                <Body className="mt-1 text-body-xs text-destructive">{errors.vendor_id}</Body>
              )}
            </div>

            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Category
              </Label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="general">General</option>
                <option value="equipment">Equipment</option>
                <option value="services">Services</option>
                <option value="supplies">Supplies</option>
                <option value="rentals">Rentals</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>

            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Project (Optional)
              </Label>
              <Input
                type="text"
                placeholder="Link to project"
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <H2 className="text-h4-md font-weight-semibold text-foreground">Line Items</H2>
              <Button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-body-sm font-weight-medium text-primary hover:bg-primary/10 rounded-button transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {errors.line_items && (
              <Body className="text-body-xs text-destructive">{errors.line_items}</Body>
            )}

            <div className="border-2 border-border rounded-card overflow-hidden">
              <Table className="w-full">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-left px-4 py-2 text-body-xs font-weight-medium text-muted-foreground">Description</TableHead>
                    <TableHead className="text-center px-4 py-2 text-body-xs font-weight-medium text-muted-foreground w-24">Qty</TableHead>
                    <TableHead className="text-right px-4 py-2 text-body-xs font-weight-medium text-muted-foreground w-32">Unit Price</TableHead>
                    <TableHead className="text-right px-4 py-2 text-body-xs font-weight-medium text-muted-foreground w-32">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="px-4 py-2">
                        <Input
                          type="text"
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border-2 border-border rounded bg-background text-body-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border-2 border-border rounded bg-background text-body-sm text-center focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleLineItemChange(index, 'unit_price', e.target.value)}
                          className="w-full px-2 py-1 border-2 border-border rounded bg-background text-body-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right text-body-sm font-weight-medium">
                        {formatCurrency(item.total)}
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <Button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-body-sm">
                  <Text className="text-muted-foreground">Subtotal</Text>
                  <Text className="font-weight-medium">{formatCurrency(subtotal)}</Text>
                </div>
                <div className="flex justify-between text-body-sm border-t border-border pt-2">
                  <Text className="font-weight-semibold">Total</Text>
                  <Text className="text-h4-md font-weight-bold text-primary">{formatCurrency(total)}</Text>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Notes
            </Label>
            <Textarea
              rows={2}
              placeholder="Special instructions or terms..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/purchase-orders"
              className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Creating...' : 'Create Purchase Order'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default function NewPurchaseOrderPage() {
  return (
    <Suspense fallback={<div className="p-6 animate-pulse text-muted-foreground">Loading...</div>}>
      <NewPurchaseOrderContent />
    </Suspense>
  );
}
