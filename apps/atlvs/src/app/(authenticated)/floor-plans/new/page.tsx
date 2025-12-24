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
  Textarea,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Layout } from 'lucide-react';
import { useCreateFloorPlan } from '@/hooks/useFloorPlans';

const DIMENSION_UNITS = ['ft', 'm', 'yd'];

export default function NewFloorPlanPage() {
  const router = useRouter();
  const createMutation = useCreateFloorPlan();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    width: '',
    height: '',
    unit: 'ft',
    scale: '1',
    is_template: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Floor plan name is required';
    if (!formData.width || parseFloat(formData.width) <= 0) {
      newErrors.width = 'Valid width is required';
    }
    if (!formData.height || parseFloat(formData.height) <= 0) {
      newErrors.height = 'Valid height is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await createMutation.mutateAsync({
        organization_id: 'current',
        name: formData.name,
        description: formData.description || undefined,
        dimensions: {
          width: parseFloat(formData.width),
          height: parseFloat(formData.height),
          unit: formData.unit,
        },
        scale: parseFloat(formData.scale) || 1,
        is_template: formData.is_template,
      });
      router.push(`/floor-plans/${result.floor_plan?.id || ''}`);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create floor plan',
      });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/floor-plans"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Floor Plans
        </Link>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <Layout className="h-6 w-6 text-primary" />
          </div>
          <div>
            <H1 className="text-h3-md font-weight-bold text-foreground">New Floor Plan</H1>
            <Body className="text-body-sm text-muted-foreground">
              Create a new floor plan for your venue
            </Body>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive rounded-card text-destructive text-body-sm">
            {errors.submit}
          </div>
        )}

        <Form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Floor Plan Name *
            </Label>
            <Input
              type="text"
              placeholder="e.g. Main Ballroom - Theater Setup"
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
              Description
            </Label>
            <Textarea
              rows={3}
              placeholder="Describe this floor plan configuration..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          <div className="space-y-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground border-b border-border pb-2">
              Dimensions
            </H2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Width *
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.width && (
                  <Body className="mt-1 text-body-xs text-destructive">{errors.width}</Body>
                )}
              </div>

              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Height *
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {errors.height && (
                  <Body className="mt-1 text-body-xs text-destructive">{errors.height}</Body>
                )}
              </div>

              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Unit
                </Label>
                <Select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {DIMENSION_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Scale (pixels per unit)
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="1"
                value={formData.scale}
                onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                className="w-full max-w-xs px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Body className="mt-1 text-body-xs text-muted-foreground">
                Default is 1 pixel per unit. Increase for more detail.
              </Body>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-card">
            <Input
              type="checkbox"
              id="is_template"
              checked={formData.is_template}
              onChange={(e) => setFormData({ ...formData, is_template: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <Label htmlFor="is_template" className="text-body-sm text-foreground">
              Save as template (can be reused for other venues)
            </Label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/floor-plans"
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
              {createMutation.isPending ? 'Creating...' : 'Create Floor Plan'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
