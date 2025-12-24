'use client';

import {
  Body,
  Button,
  Form,
  H1,
  Input,
  Label,
  Select,
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreatePreferredVendor } from '@/hooks/usePreferredVendors';
import { useVendorProfiles } from '@/hooks/useVendorProfiles';
import { getCategoryTree } from '@ghxstship/config';

export default function NewPreferredVendorPage() {
  const router = useRouter();
  const createMutation = useCreatePreferredVendor();
  const { data: vendorsData, isLoading: vendorsLoading } = useVendorProfiles({});
  
  // Get hierarchical category tree from unified catalog system
  const categoryTree = getCategoryTree();

  const [formData, setFormData] = useState({
    vendor_id: '',
    category: '',
    priority: 1,
    negotiated_discount: '',
    valid_from: '',
    valid_to: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.vendor_id) newErrors.vendor_id = 'Vendor is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.priority < 1) newErrors.priority = 'Priority must be at least 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        vendor_id: formData.vendor_id,
        category: formData.category,
        priority: formData.priority,
        negotiated_discount: formData.negotiated_discount
          ? parseFloat(formData.negotiated_discount)
          : undefined,
        valid_from: formData.valid_from || undefined,
        valid_to: formData.valid_to || undefined,
        notes: formData.notes || undefined,
      });
      router.push('/preferred-vendors');
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to add preferred vendor',
      });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/preferred-vendors"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Preferred Vendors
        </Link>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <H1 className="text-h3-md font-weight-bold text-foreground mb-6">
          Add Preferred Vendor
        </H1>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <Form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Vendor *
            </Label>
            <Select
              value={formData.vendor_id}
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
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
            {errors.vendor_id && (
              <Body className="mt-1 text-body-xs text-destructive">{errors.vendor_id}</Body>
            )}
          </div>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Category *
            </Label>
            <Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a category</option>
              {categoryTree.map((parent) => (
                <optgroup key={parent.code} label={parent.name}>
                  {parent.children.map((child) => (
                    <option key={child.code} value={child.code}>
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
            {errors.category && (
              <Body className="mt-1 text-body-xs text-destructive">{errors.category}</Body>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Priority
              </Label>
              <Input
                type="number"
                min="1"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Body className="mt-1 text-body-xs text-muted-foreground">
                1 = highest priority
              </Body>
            </div>

            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Negotiated Discount (%)
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g. 10"
                value={formData.negotiated_discount}
                onChange={(e) =>
                  setFormData({ ...formData, negotiated_discount: e.target.value })
                }
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Valid From
              </Label>
              <Input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Valid Until
              </Label>
              <Input
                type="date"
                value={formData.valid_to}
                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Notes
            </Label>
            <Textarea
              rows={3}
              placeholder="Any special terms, conditions, or notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/preferred-vendors"
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
              {createMutation.isPending ? 'Adding...' : 'Add Preferred Vendor'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
