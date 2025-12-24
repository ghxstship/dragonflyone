'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Copy, FileText, DollarSign, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Body,
  Button,
  Form,
  H1,
  H3,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from '@ghxstship/ui';

interface BookingTemplate {
  id: string;
  name: string;
  description?: string;
  event_type?: string;
  default_duration_hours?: number;
  line_items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  total?: number;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

export default function BookingTemplatesPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['booking-templates'],
    queryFn: async () => {
      const response = await fetch('/api/booking-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  const templates: BookingTemplate[] = data?.templates || [];

  const createTemplate = useMutation({
    mutationFn: async (template: Partial<BookingTemplate>) => {
      const response = await fetch('/api/booking-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-templates'] });
      setShowAddForm(false);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/booking-templates/${templateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-templates'] });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load templates</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/bookings"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Booking Templates</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Create reusable templates for common booking types
            </Body>
          </div>
        </div>
        <Button
          variant="solid"
          size="sm"
          onClick={() => setShowAddForm(true)}
          icon={<Plus className="h-4 w-4" />}
          iconPosition="left"
        >
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <Body className="text-body-md text-muted-foreground">No templates yet</Body>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(true)}
            icon={<Plus className="h-4 w-4" />}
            iconPosition="left"
            className="mt-4"
          >
            Create your first template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`bg-background border-2 rounded-card p-4 ${
                !template.is_active ? 'opacity-50 border-border' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <H3 className="text-body-md font-weight-semibold text-foreground">
                    {template.name}
                  </H3>
                  {template.event_type && (
                    <Text className="text-body-xs text-muted-foreground capitalize">
                      {template.event_type.replace('_', ' ')}
                    </Text>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="p-1.5">
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="p-1.5">
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-1.5 hover:bg-destructive/10"
                    onClick={() => {
                      if (confirm('Delete this template?')) {
                        deleteTemplate.mutate(template.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {template.description && (
                <Body className="text-body-sm text-muted-foreground mb-3 line-clamp-2">
                  {template.description}
                </Body>
              )}
              <div className="flex items-center gap-4 text-body-xs text-muted-foreground">
                {template.default_duration_hours && (
                  <Text className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {template.default_duration_hours}h
                  </Text>
                )}
                {template.total && (
                  <Text className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {formatCurrency(template.total)}
                  </Text>
                )}
                <Text>{template.line_items?.length || 0} items</Text>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <Text className="text-body-xs text-muted-foreground">
                  Used {template.usage_count} times
                </Text>
                <Link
                  href={`/bookings/new?template=${template.id}`}
                  className="text-body-xs text-primary hover:underline"
                >
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">Create Template</H3>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTemplate.mutate({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string || undefined,
                  event_type: formData.get('event_type') as string || undefined,
                  default_duration_hours: parseInt(formData.get('duration') as string) || undefined,
                  line_items: [],
                  is_active: true,
                  usage_count: 0,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Template Name *
                </Label>
                <Input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Corporate All-Day Package"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description
                </Label>
                <Textarea
                  name="description"
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Event Type
                  </Label>
                  <Select
                    name="event_type"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  >
                    <option value="">Any</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate</option>
                    <option value="social">Social</option>
                    <option value="conference">Conference</option>
                  </Select>
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Default Duration (hours)
                  </Label>
                  <Input
                    type="number"
                    name="duration"
                    min="1"
                    placeholder="8"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  size="sm"
                  type="submit"
                  disabled={createTemplate.isPending}
                  isLoading={createTemplate.isPending}
                  loadingText="Creating..."
                >
                  Create Template
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
