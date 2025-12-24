'use client';

import {
  Body,
  Button,
  Form,
  H1,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useCreateVendorOrder } from '@/hooks/useVendorOrders';
import { useVendorProfiles } from '@/hooks/useVendorProfiles';
import { useCatalogItems, type CatalogItem } from '@/hooks/useCatalog';

interface OrderItem {
  id: string;
  catalog_item_id?: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
}

export default function NewVendorOrderPage() {
  const router = useRouter();
  const createMutation = useCreateVendorOrder();
  const { data: vendorsData, isLoading: vendorsLoading } = useVendorProfiles({});
  const { data: catalogData } = useCatalogItems({});

  const [formData, setFormData] = useState({
    vendor_profile_id: '',
    booking_id: '',
    delivery_date: '',
    delivery_time: '',
    delivery_location: '',
    special_instructions: '',
    payment_terms: 'Net 30',
    notes: '',
  });

  const [items, setItems] = useState<OrderItem[]>([
    {
      id: crypto.randomUUID(),
      name: '',
      quantity: 1,
      unit: 'each',
      unit_price: 0,
      discount_percent: 0,
      tax_rate: 8,
    },
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        name: '',
        quantity: 1,
        unit: 'each',
        unit_price: 0,
        discount_percent: 0,
        tax_rate: 8,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const selectCatalogItem = (itemId: string, catalogItemId: string) => {
    const catalogItem = catalogData?.items?.find((ci: CatalogItem) => ci.id === catalogItemId);
    if (catalogItem) {
      setItems(
        items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                catalog_item_id: catalogItemId,
                name: catalogItem.name,
                description: catalogItem.description,
                unit_price: catalogItem.base_price || 0,
                unit: catalogItem.unit_type || 'each',
              }
            : item
        )
      );
    }
  };

  const calculateItemTotal = (item: OrderItem) => {
    const discountedPrice = item.unit_price * (1 - item.discount_percent / 100);
    return discountedPrice * item.quantity;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const taxAmount = items.reduce((sum, item) => {
    const itemTotal = calculateItemTotal(item);
    return sum + itemTotal * (item.tax_rate / 100);
  }, 0);
  const total = subtotal + taxAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.vendor_profile_id) newErrors.vendor = 'Vendor is required';
    if (items.some((item) => !item.name)) newErrors.items = 'All items must have a name';
    if (items.some((item) => item.quantity <= 0)) newErrors.items = 'Quantity must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        organization_id: 'current',
        vendor_profile_id: formData.vendor_profile_id,
        booking_id: formData.booking_id || undefined,
        delivery_date: formData.delivery_date || undefined,
        delivery_time: formData.delivery_time || undefined,
        delivery_location: formData.delivery_location || undefined,
        special_instructions: formData.special_instructions || undefined,
        payment_terms: formData.payment_terms || undefined,
        notes: formData.notes || undefined,
        items: items.map((item) => ({
          product_id: item.catalog_item_id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          tax_rate: item.tax_rate,
        })),
      });
      router.push('/vendor-orders');
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create order',
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/vendor-orders"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Vendor Orders
        </Link>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <H1 className="text-h3-md font-weight-bold text-foreground mb-6">
          Create Vendor Order
        </H1>

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
                value={formData.vendor_profile_id}
                onChange={(e) => setFormData({ ...formData, vendor_profile_id: e.target.value })}
                disabled={vendorsLoading}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
              >
                <option value="">Select a vendor</option>
                {vendorsData?.vendors?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </Select>
              {errors.vendor && (
                <Body className="mt-1 text-body-xs text-destructive">{errors.vendor}</Body>
              )}
            </div>

            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Payment Terms
              </Label>
              <Select
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="50% Deposit">50% Deposit</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Delivery Date
              </Label>
              <Input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Delivery Time
              </Label>
              <Input
                type="time"
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Delivery Location
              </Label>
              <Input
                type="text"
                placeholder="e.g. Main Stage, Loading Dock A"
                value={formData.delivery_location}
                onChange={(e) => setFormData({ ...formData, delivery_location: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-body-sm font-weight-medium text-foreground">
                Order Items *
              </Label>
              <Button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 text-body-sm text-primary hover:text-primary/80"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            {errors.items && (
              <Body className="mb-2 text-body-xs text-destructive">{errors.items}</Body>
            )}

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 p-3 bg-muted/30 rounded-card border-2 border-border"
                >
                  <div className="col-span-4">
                    {catalogData?.items && catalogData.items.length > 0 ? (
                      <Select
                        value={item.catalog_item_id || ''}
                        onChange={(e) => selectCatalogItem(item.id, e.target.value)}
                        className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm"
                      >
                        <option value="">Select from catalog...</option>
                        {catalogData.items.map((ci: CatalogItem) => (
                          <option key={ci.id} value={ci.id}>
                            {ci.name} - {formatCurrency(ci.base_price || 0)}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm"
                      />
                    )}
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Unit Price"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Discount %"
                      value={item.discount_percent}
                      onChange={(e) => updateItem(item.id, 'discount_percent', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-end font-weight-medium text-body-sm">
                    {formatCurrency(calculateItemTotal(item))}
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <Button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-button transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 p-4 bg-muted/50 rounded-card">
              <div className="flex justify-between text-body-sm">
                <Text className="text-muted-foreground">Subtotal</Text>
                <Text className="font-weight-medium">{formatCurrency(subtotal)}</Text>
              </div>
              <div className="flex justify-between text-body-sm">
                <Text className="text-muted-foreground">Tax</Text>
                <Text className="font-weight-medium">{formatCurrency(taxAmount)}</Text>
              </div>
              <div className="flex justify-between text-h4-md font-weight-bold border-t border-border pt-2">
                <Text>Total</Text>
                <Text>{formatCurrency(total)}</Text>
              </div>
            </div>
          </div>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Special Instructions
            </Label>
            <Textarea
              rows={3}
              placeholder="Any special delivery or handling instructions..."
              value={formData.special_instructions}
              onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/vendor-orders"
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
              {createMutation.isPending ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
