'use client';

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

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, FileText, Copy, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'standard' | 'deposit' | 'final' | 'custom';
  line_items: TemplateLineItem[];
  terms?: string;
  notes?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TemplateLineItem {
  id: string;
  description: string;
  quantity?: number;
  unit_price?: number;
  is_percentage: boolean;
}

const DEMO_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'IT-001',
    name: 'Standard Venue Rental',
    description: 'Default template for venue rental invoices',
    category: 'standard',
    line_items: [
      { id: 'li1', description: 'Venue Rental Fee', is_percentage: false },
      { id: 'li2', description: 'Setup & Breakdown', is_percentage: false },
      { id: 'li3', description: 'Security Deposit', is_percentage: true },
    ],
    terms: 'Payment due within 30 days of invoice date.',
    is_default: true,
    is_active: true,
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-11-15T14:30:00Z',
  },
  {
    id: 'IT-002',
    name: 'Deposit Invoice',
    description: 'Template for collecting initial deposits',
    category: 'deposit',
    line_items: [
      { id: 'li1', description: 'Booking Deposit (50%)', is_percentage: true },
    ],
    terms: 'Non-refundable deposit to secure booking.',
    is_default: false,
    is_active: true,
    created_at: '2024-07-10T09:00:00Z',
    updated_at: '2024-10-20T11:00:00Z',
  },
  {
    id: 'IT-003',
    name: 'Final Balance',
    description: 'Template for final payment collection',
    category: 'final',
    line_items: [
      { id: 'li1', description: 'Remaining Balance', is_percentage: false },
      { id: 'li2', description: 'Additional Services', is_percentage: false },
      { id: 'li3', description: 'Less: Deposit Paid', is_percentage: false },
    ],
    terms: 'Payment due 7 days before event date.',
    is_default: false,
    is_active: true,
    created_at: '2024-08-05T08:00:00Z',
    updated_at: '2024-11-01T16:00:00Z',
  },
];

export default function InvoiceTemplatesPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['invoice-templates', categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter) params.set('category', categoryFilter);
      const response = await fetch(`/api/invoices/templates?${params}`);
      if (!response.ok) {
        return { templates: DEMO_TEMPLATES };
      }
      const result = await response.json();
      return result.templates?.length ? result : { templates: DEMO_TEMPLATES };
    },
  });

  const templates: InvoiceTemplate[] = data?.templates || DEMO_TEMPLATES;

  const filteredTemplates = categoryFilter
    ? templates.filter((t) => t.category === categoryFilter)
    : templates;

  const createTemplate = useMutation({
    mutationFn: async (template: Partial<InvoiceTemplate>) => {
      const response = await fetch('/api/invoices/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
      setShowCreateModal(false);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/invoices/templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-templates'] });
    },
  });

  const duplicateTemplate = async (template: InvoiceTemplate) => {
    await createTemplate.mutateAsync({
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      line_items: template.line_items,
      terms: template.terms,
      notes: template.notes,
      is_default: false,
      is_active: true,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'standard':
        return 'bg-primary/20 text-primary';
      case 'deposit':
        return 'bg-warning/20 text-warning';
      case 'final':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted text-muted-foreground';
    }
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
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <Body className="text-destructive">Failed to load invoice templates</Body>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['invoice-templates'] })}
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-button"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/invoices"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Invoice Templates</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Manage reusable invoice templates for faster invoicing
            </Body>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <Text className="text-body-sm font-weight-medium">New Template</Text>
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <Body className="text-body-sm text-muted-foreground">Total Templates</Body>
          <Body className="text-h3-md font-weight-bold text-foreground">{templates.length}</Body>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <Body className="text-body-sm text-muted-foreground">Active</Body>
          <Body className="text-h3-md font-weight-bold text-success">
            {templates.filter((t) => t.is_active).length}
          </Body>
        </div>
        <div className="bg-background border-2 border-primary/50 rounded-card p-4">
          <Body className="text-body-sm text-muted-foreground">Default</Body>
          <Body className="text-h3-md font-weight-bold text-primary">
            {templates.filter((t) => t.is_default).length}
          </Body>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <Body className="text-body-sm text-muted-foreground">Categories</Body>
          <Body className="text-h3-md font-weight-bold text-warning">
            {new Set(templates.map((t) => t.category)).size}
          </Body>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Categories</option>
          <option value="standard">Standard</option>
          <option value="deposit">Deposit</option>
          <option value="final">Final</option>
          <option value="custom">Custom</option>
        </Select>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No invoice templates
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            Create templates to speed up your invoicing workflow
          </Body>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button"
          >
            <Plus className="h-4 w-4" />
            Create First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-background border-2 border-border rounded-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <H3 className="text-body-md font-weight-semibold text-foreground flex items-center gap-2">
                      {template.name}
                      {template.is_default && (
                        <Text className="px-2 py-0.5 bg-primary/20 text-primary text-body-xs rounded-badge">
                          Default
                        </Text>
                      )}
                    </H3>
                    <Text className={`inline-block px-2 py-0.5 rounded-badge text-body-xs font-weight-medium mt-1 ${getCategoryColor(template.category)}`}>
                      {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                    </Text>
                  </div>
                </div>
                {template.is_active && (
                  <Check className="h-4 w-4 text-success" />
                )}
              </div>
              {template.description && (
                <Body className="text-body-sm text-muted-foreground mb-3">{template.description}</Body>
              )}
              <div className="text-body-xs text-muted-foreground mb-4">
                {template.line_items.length} line items
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Button
                  onClick={() => duplicateTemplate(template)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-body-xs hover:bg-muted rounded-button transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
                <Link
                  href={`/invoices/templates/${template.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-body-xs hover:bg-muted rounded-button transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Link>
                <Button
                  onClick={() => {
                    if (confirm('Delete this template?')) {
                      deleteTemplate.mutate(template.id);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-body-xs text-destructive hover:bg-destructive/10 rounded-button transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">
              Create Invoice Template
            </H3>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTemplate.mutate({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string || undefined,
                  category: formData.get('category') as InvoiceTemplate['category'],
                  terms: formData.get('terms') as string || undefined,
                  line_items: [],
                  is_default: false,
                  is_active: true,
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
                  placeholder="e.g., Standard Venue Rental"
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
                  placeholder="Template description..."
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Category *
                </Label>
                <Select
                  name="category"
                  required
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  <option value="standard">Standard</option>
                  <option value="deposit">Deposit</option>
                  <option value="final">Final</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Payment Terms
                </Label>
                <Textarea
                  name="terms"
                  rows={2}
                  placeholder="Payment terms..."
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTemplate.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createTemplate.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
