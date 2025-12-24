'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H2,
  H3,
  Input,
  Label,
  Link,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Webhook } from 'lucide-react';
import { useCreateWebhook } from '@/hooks/useWebhooks';

const EVENT_TYPES = [
  { id: 'booking.created', label: 'Booking Created', category: 'Bookings' },
  { id: 'booking.updated', label: 'Booking Updated', category: 'Bookings' },
  { id: 'booking.cancelled', label: 'Booking Cancelled', category: 'Bookings' },
  { id: 'invoice.created', label: 'Invoice Created', category: 'Invoices' },
  { id: 'invoice.paid', label: 'Invoice Paid', category: 'Invoices' },
  { id: 'payment.received', label: 'Payment Received', category: 'Payments' },
  { id: 'vendor_order.created', label: 'Vendor Order Created', category: 'Vendor Orders' },
  { id: 'vendor_order.approved', label: 'Vendor Order Approved', category: 'Vendor Orders' },
];

export default function NewWebhookPage() {
  const router = useRouter();
  const createMutation = useCreateWebhook();

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
  });

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Webhook name is required';
    if (!formData.url.trim()) newErrors.url = 'Endpoint URL is required';
    if (formData.url && !formData.url.startsWith('https://')) {
      newErrors.url = 'URL must use HTTPS';
    }
    if (selectedEvents.length === 0) {
      newErrors.events = 'Select at least one event';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = (category: string) => {
    const categoryEvents = EVENT_TYPES.filter((e) => e.category === category).map((e) => e.id);
    const allSelected = categoryEvents.every((e) => selectedEvents.includes(e));
    
    if (allSelected) {
      setSelectedEvents((prev) => prev.filter((e) => !categoryEvents.includes(e)));
    } else {
      setSelectedEvents((prev) => [...new Set([...prev, ...categoryEvents])]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        organization_id: 'current',
        name: formData.name,
        url: formData.url,
        events: selectedEvents,
        headers: formData.secret ? { 'X-Webhook-Secret': formData.secret } : {},
        is_active: true,
      });
      router.push('/webhooks');
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create webhook',
      });
    }
  };

  const groupedEvents = EVENT_TYPES.reduce((acc, event) => {
    if (!acc[event.category]) acc[event.category] = [];
    acc[event.category].push(event);
    return acc;
  }, {} as Record<string, typeof EVENT_TYPES>);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/webhooks"
          className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Webhooks
        </Link>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-card">
            <Webhook className="h-6 w-6 text-primary" />
          </div>
          <div>
            <H1 className="text-h3-md font-weight-bold text-foreground">New Webhook</H1>
            <Body className="text-body-sm text-muted-foreground">
              Send event notifications to external systems
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
              Webhook Name *
            </Label>
            <Input
              type="text"
              placeholder="e.g. Slack Notifications"
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
              Endpoint URL *
            </Label>
            <Input
              type="url"
              placeholder="https://example.com/webhook"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {errors.url && (
              <Body className="mt-1 text-body-xs text-destructive">{errors.url}</Body>
            )}
            <Body className="mt-1 text-body-xs text-muted-foreground">
              Must be a valid HTTPS URL
            </Body>
          </div>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Secret (Optional)
            </Label>
            <Input
              type="password"
              placeholder="Webhook signing secret"
              value={formData.secret}
              onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
              className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <Body className="mt-1 text-body-xs text-muted-foreground">
              Used to sign webhook payloads for verification
            </Body>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <H2 className="text-h4-md font-weight-semibold text-foreground">Events *</H2>
              {errors.events && (
                <Text className="text-body-xs text-destructive">{errors.events}</Text>
              )}
            </div>

            <div className="space-y-4">
              {Object.entries(groupedEvents).map(([category, events]) => {
                const allSelected = events.every((e) => selectedEvents.includes(e.id));

                return (
                  <div key={category} className="border-2 border-border rounded-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <H3 className="text-body-sm font-weight-semibold text-foreground">{category}</H3>
                      <Button
                        type="button"
                        onClick={() => handleSelectAll(category)}
                        className="text-body-xs text-primary hover:underline"
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {events.map((event) => (
                        <Label
                          key={event.id}
                          className={`flex items-center gap-3 p-2 rounded-button cursor-pointer transition-colors ${
                            selectedEvents.includes(event.id)
                              ? 'bg-primary/10'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <Input
                            type="checkbox"
                            checked={selectedEvents.includes(event.id)}
                            onChange={() => handleEventToggle(event.id)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <Text className="text-body-sm">{event.label}</Text>
                        </Label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/webhooks"
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
              {createMutation.isPending ? 'Creating...' : 'Create Webhook'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
