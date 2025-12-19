'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, BarChart3, Code, Eye, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useLeadForm } from '@/hooks/useLeadForms';

export default function LeadFormDetailPage() {
  const params = useParams();
  const formId = params.id as string;
  const [copied, setCopied] = useState(false);

  const { data: form, isLoading, error } = useLeadForm(formId);

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="${window.location.origin}/f/${form?.slug}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading form...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Form not found</p>
          <Link href="/lead-forms" className="text-primary hover:underline mt-2 inline-block">
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/lead-forms"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-h2-md font-weight-bold text-foreground">{form.name}</h1>
              <span
                className={`px-2 py-0.5 text-body-xs rounded ${
                  form.active
                    ? 'bg-success-100 text-success-800'
                    : 'bg-ink-100 text-ink-800'
                }`}
              >
                {form.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {form.description && (
              <p className="text-body-sm text-muted-foreground mt-1">{form.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/lead-forms/${formId}/submissions`}
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-body-sm">Submissions ({form.submissions_count})</span>
          </Link>
          <Link
            href={`/lead-forms/${formId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <span className="text-body-sm font-weight-medium">Edit Form</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Form Fields</h2>
            {form.fields.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">No fields configured</p>
            ) : (
              <div className="space-y-3">
                {form.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 p-3 bg-muted/30 border-2 border-border rounded-card"
                  >
                    <span className="text-body-xs text-muted-foreground w-6">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-body-sm font-weight-medium text-foreground">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-body-xs text-destructive">*</span>
                        )}
                      </div>
                      <span className="text-body-xs text-muted-foreground capitalize">
                        {field.type}
                      </span>
                    </div>
                    <span className="text-body-xs text-muted-foreground font-mono">
                      {field.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Preview</h2>
            <div className="border-2 border-dashed border-border rounded-card p-6 bg-muted/20">
              <div className="space-y-4">
                {form.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border-2 border-border rounded bg-background"
                        rows={3}
                        disabled
                      />
                    ) : field.type === 'select' ? (
                      <select className="w-full px-3 py-2 border-2 border-border rounded bg-background" disabled>
                        <option>Select an option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border-2 border-border rounded bg-background"
                        disabled
                      />
                    )}
                  </div>
                ))}
                <button
                  disabled
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-button opacity-75"
                >
                  {form.settings.submit_button_text || 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Links</h2>
            <div className="space-y-2">
              <a
                href={`/f/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-sm">View Live Form</span>
              </a>
              <Link
                href={`/lead-forms/${formId}/analytics`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-sm">View Analytics</span>
              </Link>
              <Link
                href={`/lead-forms/${formId}/embed`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <Code className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-sm">Get Embed Code</span>
              </Link>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Embed Code</h2>
            <div className="bg-muted p-3 rounded font-mono text-body-xs overflow-x-auto mb-3">
              {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form.slug}" ...>`}
            </div>
            <button
              onClick={handleCopyEmbed}
              className="flex items-center gap-2 px-4 py-2 w-full justify-center border-2 border-border rounded-button hover:bg-muted transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-body-sm text-success">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="text-body-sm">Copy Embed Code</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Settings</h2>
            <div className="space-y-3 text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auto Response</span>
                <span className={form.settings.auto_response_enabled ? 'text-success' : 'text-muted-foreground'}>
                  {form.settings.auto_response_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Notifications</span>
                <span className={form.settings.notification_enabled ? 'text-success' : 'text-muted-foreground'}>
                  {form.settings.notification_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Default Source</span>
                <span className="text-foreground">{form.settings.default_lead_source || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
