'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreVertical, Eye, Edit2, Trash2, Code, BarChart3, ExternalLink } from 'lucide-react';
import { useLeadForms, useDeleteLeadForm } from '@/hooks/useLeadForms';

export default function LeadFormsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data, isLoading, error } = useLeadForms();
  const deleteForm = useDeleteLeadForm();

  const forms = data || [];
  const filteredForms = forms.filter(
    (form) =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.description && form.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (formId: string) => {
    if (confirm('Are you sure you want to delete this form?')) {
      await deleteForm.mutateAsync(formId);
    }
    setActiveMenu(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading lead forms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load lead forms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Lead Forms</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Create and manage lead capture forms
          </p>
        </div>
        <Link
          href="/lead-forms/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-body-sm font-weight-medium">New Form</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {filteredForms.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <p className="text-body-md text-muted-foreground">
            {searchQuery ? 'No forms match your search' : 'No lead forms yet'}
          </p>
          {!searchQuery && (
            <Link
              href="/lead-forms/new"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Create your first form
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-background border-2 border-border rounded-card overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link
                      href={`/lead-forms/${form.id}`}
                      className="text-body-md font-weight-semibold text-foreground hover:text-primary"
                    >
                      {form.name}
                    </Link>
                    <span
                      className={`ml-2 inline-flex px-2 py-0.5 text-body-xs rounded ${
                        form.active
                          ? 'bg-success-100 text-success-800'
                          : 'bg-ink-100 text-ink-800'
                      }`}
                    >
                      {form.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === form.id ? null : form.id)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {activeMenu === form.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-background border-2 border-border rounded-card shadow-lg z-10">
                        <Link
                          href={`/lead-forms/${form.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-body-sm hover:bg-muted"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                        <Link
                          href={`/lead-forms/${form.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2 text-body-sm hover:bg-muted"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </Link>
                        <Link
                          href={`/lead-forms/${form.id}/submissions`}
                          className="flex items-center gap-2 px-4 py-2 text-body-sm hover:bg-muted"
                        >
                          <BarChart3 className="h-4 w-4" />
                          Submissions
                        </Link>
                        <Link
                          href={`/lead-forms/${form.id}/embed`}
                          className="flex items-center gap-2 px-4 py-2 text-body-sm hover:bg-muted"
                        >
                          <Code className="h-4 w-4" />
                          Embed Code
                        </Link>
                        <button
                          onClick={() => handleDelete(form.id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-body-sm text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {form.description && (
                  <p className="text-body-sm text-muted-foreground mb-3 line-clamp-2">
                    {form.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-body-xs text-muted-foreground">
                  <span>{form.submissions_count || 0} submissions</span>
                  <span>{form.fields?.length || 0} fields</span>
                </div>
              </div>
              <div className="px-4 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
                <Link
                  href={`/lead-forms/${form.id}/analytics`}
                  className="flex items-center gap-1 text-body-xs text-primary hover:underline"
                >
                  <BarChart3 className="h-3 w-3" />
                  Analytics
                </Link>
                <a
                    href={`/f/${form.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-body-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Preview
                  </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
