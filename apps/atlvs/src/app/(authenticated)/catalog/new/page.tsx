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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { useCreateCatalogItem, useCatalogCategories } from '@/hooks/useCatalog';

const UNIT_TYPES = ['each', 'hour', 'day', 'week', 'linear ft', 'sq ft', 'lb', 'gallon'];
const STATUS_OPTIONS = ['draft', 'active', 'inactive', 'discontinued'];

export default function NewCatalogItemPage() {
  const router = useRouter();
  const createMutation = useCreateCatalogItem();
  const { data: categoriesData } = useCatalogCategories();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    description: '',
    base_price: '',
        unit_type: 'each',
    min_quantity: '1',
    max_quantity: '',
    lead_time_days: '',
    status: 'draft',
    specifications: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
      newErrors.base_price = 'Valid base price is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        organization_id: 'current',
        name: formData.name,
        sku: formData.sku || undefined,
        category_id: formData.category_id || undefined,
        description: formData.description || undefined,
        base_price: parseFloat(formData.base_price),
                unit_type: formData.unit_type,
        min_quantity: parseInt(formData.min_quantity) || 1,
        max_quantity: formData.max_quantity ? parseInt(formData.max_quantity) : undefined,
        lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : undefined,
        specifications: formData.specifications ? JSON.parse(formData.specifications) : undefined,
      });
      router.push('/catalog');
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create catalog item',
      });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <H1 className="text-h3-md font-weight-bold text-foreground">Add Catalog Item</H1>
            <Body className="text-body-sm text-muted-foreground">
              Add a new product or service to your catalog
            </Body>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <Form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Basic Information
            </H2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Item Name *
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. LED Par Light"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.name && (
                  <Body className="mt-1 text-body-xs text-destructive">{errors.name}</Body>
                )}
              </div>

              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  SKU
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. LED-PAR-001"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Category
                </Label>
                <Select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select category</option>
                  {categoriesData?.categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Description
              </Label>
              <Textarea
                rows={3}
                placeholder="Brief description of the item..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Pricing & Units
            </H2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Base Price *
                </Label>
                <div className="relative">
                  <Text className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</Text>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                {errors.base_price && (
                  <Body className="mt-1 text-body-xs text-destructive">{errors.base_price}</Body>
                )}
              </div>

              
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Unit Type
                </Label>
                <Select
                  value={formData.unit_type}
                  onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {UNIT_TYPES.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Min Quantity
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Max Quantity
                </Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="No limit"
                  value={formData.max_quantity}
                  onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Lead Time (days)
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.lead_time_days}
                  onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Additional Details
            </H2>

            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Notes
              </Label>
              <Textarea
                rows={2}
                placeholder="Internal notes about this item..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/catalog"
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
              {createMutation.isPending ? 'Creating...' : 'Create Item'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
