'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Copy, Check, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AvailabilityWidget {
  id: string;
  name: string;
  space_ids: string[];
  settings: {
    show_pricing: boolean;
    allow_inquiries: boolean;
    min_notice_days: number;
    max_advance_days: number;
    theme: 'light' | 'dark' | 'auto';
  };
  embed_code: string;
  views: number;
  inquiries: number;
  created_at: string;
}

export default function AvailabilityWidgetPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<AvailabilityWidget | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['availability-widgets'],
    queryFn: async () => {
      const response = await fetch('/api/availability/widgets');
      if (!response.ok) {
        return { widgets: [] };
      }
      return response.json();
    },
  });

  const widgets: AvailabilityWidget[] = data?.widgets || [];

  const createWidget = useMutation({
    mutationFn: async (widget: Partial<AvailabilityWidget>) => {
      const response = await fetch('/api/availability/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(widget),
      });
      if (!response.ok) throw new Error('Failed to create widget');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-widgets'] });
      setShowCreateModal(false);
    },
  });

  const copyEmbedCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading widgets...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/availability"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Availability Widgets</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Embed availability checkers on your website
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span className="text-body-sm font-weight-medium">New Widget</span>
        </button>
      </div>

      {widgets.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-body-md text-muted-foreground">No widgets created yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            Create your first widget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="bg-background border-2 border-border rounded-card p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-body-md font-weight-semibold text-foreground">
                    {widget.name}
                  </h3>
                  <p className="text-body-xs text-muted-foreground">
                    {widget.space_ids.length} spaces
                  </p>
                </div>
                <button
                  onClick={() => setSelectedWidget(widget)}
                  className="p-1.5 hover:bg-muted rounded-button transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-2 bg-muted/30 rounded-card text-center">
                  <p className="text-h4-md font-weight-bold text-foreground">{widget.views}</p>
                  <p className="text-body-xs text-muted-foreground">Views</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-card text-center">
                  <p className="text-h4-md font-weight-bold text-foreground">{widget.inquiries}</p>
                  <p className="text-body-xs text-muted-foreground">Inquiries</p>
                </div>
              </div>
              <button
                onClick={() => copyEmbedCode(widget.embed_code)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 textbg-success-100" />
                    <span className="text-body-sm textbg-success-100">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="text-body-sm">Copy Embed Code</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Widget Details Modal */}
      {selectedWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4">Widget Settings</h3>
            <div className="space-y-4">
              <div>
                <p className="text-body-xs text-muted-foreground">Name</p>
                <p className="text-body-md font-weight-medium text-foreground">{selectedWidget.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-body-xs text-muted-foreground">Views</p>
                  <p className="text-body-md font-weight-bold text-foreground">{selectedWidget.views}</p>
                </div>
                <div>
                  <p className="text-body-xs text-muted-foreground">Inquiries</p>
                  <p className="text-body-md font-weight-bold text-foreground">{selectedWidget.inquiries}</p>
                </div>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Theme</p>
                <p className="text-body-md text-foreground capitalize">{selectedWidget.settings.theme}</p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Settings</p>
                <ul className="text-body-sm text-muted-foreground space-y-1 mt-1">
                  <li>Show pricing: {selectedWidget.settings.show_pricing ? 'Yes' : 'No'}</li>
                  <li>Allow inquiries: {selectedWidget.settings.allow_inquiries ? 'Yes' : 'No'}</li>
                  <li>Min notice: {selectedWidget.settings.min_notice_days} days</li>
                  <li>Max advance: {selectedWidget.settings.max_advance_days} days</li>
                </ul>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground mb-2">Embed Code</p>
                <div className="p-2 bg-muted/30 rounded font-mono text-body-xs break-all">
                  {selectedWidget.embed_code || '<script src="..."></script>'}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedWidget(null)}
                className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4">Create Widget</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createWidget.mutate({
                  name: formData.get('name') as string,
                  space_ids: [],
                  settings: {
                    show_pricing: formData.get('show_pricing') === 'on',
                    allow_inquiries: formData.get('allow_inquiries') === 'on',
                    min_notice_days: parseInt(formData.get('min_notice_days') as string) || 1,
                    max_advance_days: parseInt(formData.get('max_advance_days') as string) || 365,
                    theme: (formData.get('theme') as 'light' | 'dark' | 'auto') || 'light',
                  },
                  embed_code: '',
                  views: 0,
                  inquiries: 0,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Widget Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Main Website Widget"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Min Notice (days)
                  </label>
                  <input
                    type="number"
                    name="min_notice_days"
                    min="0"
                    defaultValue="1"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Max Advance (days)
                  </label>
                  <input
                    type="number"
                    name="max_advance_days"
                    min="1"
                    defaultValue="365"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Theme
                </label>
                <select
                  name="theme"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (match site)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="show_pricing" defaultChecked className="w-4 h-4" />
                  <span className="text-body-sm text-foreground">Show pricing</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="allow_inquiries" defaultChecked className="w-4 h-4" />
                  <span className="text-body-sm text-foreground">Allow inquiries</span>
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createWidget.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createWidget.isPending ? 'Creating...' : 'Create Widget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
