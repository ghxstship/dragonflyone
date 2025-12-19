'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, FileText, Edit2, Trash2, Copy, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ProposalTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  pricing_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  terms?: string;
  is_default: boolean;
  usage_count: number;
  created_at: string;
}

export default function ProposalTemplatesPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['proposal-templates'],
    queryFn: async () => {
      const response = await fetch('/api/proposal-templates');
      if (!response.ok) {
        return { templates: [] };
      }
      return response.json();
    },
  });

  const templates: ProposalTemplate[] = data?.templates || [];

  const createTemplate = useMutation({
    mutationFn: async (template: Partial<ProposalTemplate>) => {
      const response = await fetch('/api/proposal-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
      setShowAddModal(false);
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/proposal-templates/${templateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/proposals"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Proposal Templates</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Reusable proposal templates for faster creation
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-body-sm font-weight-medium">New Template</span>
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-body-md text-muted-foreground">No templates yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            <Plus className="h-4 w-4" />
            Create your first template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`bg-background border-2 rounded-card overflow-hidden ${
                template.is_default ? 'border-primary' : 'border-border'
              }`}
            >
              {template.is_default && (
                <div className="bg-primary text-primary-foreground text-body-xs text-center py-1">
                  <Check className="inline h-3 w-3 mr-1" />
                  Default Template
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-body-md font-weight-semibold text-foreground">
                    {template.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-muted rounded-button transition-colors">
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 hover:bg-muted rounded-button transition-colors">
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this template?')) {
                          deleteTemplate.mutate(template.id);
                        }
                      }}
                      className="p-1.5 hover:bg-destructive/10 rounded-button transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
                {template.description && (
                  <p className="text-body-sm text-muted-foreground mb-3 line-clamp-2">
                    {template.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-body-xs text-muted-foreground">
                    {template.pricing_items?.length || 0} items
                  </span>
                  <span className="text-body-xs text-muted-foreground">
                    Used {template.usage_count} times
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4">New Template</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createTemplate.mutate({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string || undefined,
                  content: '',
                  pricing_items: [],
                  is_default: formData.get('is_default') === 'on',
                  usage_count: 0,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Corporate Event Proposal"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Brief description of this template"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="is_default" id="is_default" className="w-4 h-4" />
                <label htmlFor="is_default" className="text-body-sm text-foreground">
                  Set as default template
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTemplate.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createTemplate.isPending ? 'Creating...' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
