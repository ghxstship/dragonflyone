'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Icon,
  Input,
  Label,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Mail, MessageSquare, Calendar, DollarSign, Users, Save } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface NotificationSettings {
  email_bookings: boolean;
  email_payments: boolean;
  email_proposals: boolean;
  email_leads: boolean;
  email_reminders: boolean;
  email_digest: 'none' | 'daily' | 'weekly';
  push_bookings: boolean;
  push_payments: boolean;
  push_proposals: boolean;
  push_leads: boolean;
  push_reminders: boolean;
}

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings/notifications');
      if (!response.ok) {
        return {
          email_bookings: true,
          email_payments: true,
          email_proposals: true,
          email_leads: true,
          email_reminders: true,
          email_digest: 'daily',
          push_bookings: true,
          push_payments: true,
          push_proposals: false,
          push_leads: true,
          push_reminders: true,
        } as NotificationSettings;
      }
      return response.json() as Promise<NotificationSettings>;
    },
  });

  const [settings, setSettings] = useState<NotificationSettings | null>(null);

  const updateSettings = useMutation({
    mutationFn: async (newSettings: NotificationSettings) => {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });

  const currentSettings = settings || data;

  const handleToggle = (key: keyof NotificationSettings) => {
    if (!currentSettings) return;
    const newSettings = {
      ...currentSettings,
      [key]: !currentSettings[key],
    };
    setSettings(newSettings);
  };

  const handleDigestChange = (value: 'none' | 'daily' | 'weekly') => {
    if (!currentSettings) return;
    setSettings({
      ...currentSettings,
      email_digest: value,
    });
  };

  const handleSave = () => {
    if (currentSettings) {
      updateSettings.mutate(currentSettings);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
            </H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Configure how you receive updates
            </Body>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <Text className="text-body-sm font-weight-medium">
            {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
          </Text>
        </Button>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </H2>
        <div className="space-y-4">
          {[
            { key: 'email_bookings' as const, label: 'Booking Updates', description: 'New bookings, confirmations, and cancellations', icon: Calendar },
            { key: 'email_payments' as const, label: 'Payment Alerts', description: 'Payment received, pending, or failed', icon: DollarSign },
            { key: 'email_proposals' as const, label: 'Proposal Activity', description: 'When proposals are viewed or accepted', icon: MessageSquare },
            { key: 'email_leads' as const, label: 'New Leads', description: 'Lead form submissions and inquiries', icon: Users },
            { key: 'email_reminders' as const, label: 'Reminders', description: 'Task and event reminders', icon: Bell },
          ].map(({ key, label, description, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Body className="text-body-sm font-weight-medium text-foreground">{label}</Body>
                  <Body className="text-body-xs text-muted-foreground">{description}</Body>
                </div>
              </div>
              <Button
                onClick={() => handleToggle(key)}
                className={`relative w-11 h-6 rounded-avatar transition-colors ${
                  currentSettings?.[key] ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <Text
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-avatar transition-transform ${
                    currentSettings?.[key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-border">
          <Body className="text-body-sm font-weight-medium text-foreground mb-2">Email Digest</Body>
          <div className="flex items-center gap-4">
            {(['none', 'daily', 'weekly'] as const).map((value) => (
              <Label key={value} className="flex items-center gap-2 cursor-pointer">
                <Input
                  type="radio"
                  name="digest"
                  checked={currentSettings?.email_digest === value}
                  onChange={() => handleDigestChange(value)}
                  className="w-4 h-4"
                />
                <Text className="text-body-sm text-foreground capitalize">{value}</Text>
              </Label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Push Notifications
        </H2>
        <div className="space-y-4">
          {[
            { key: 'push_bookings' as const, label: 'Booking Updates', icon: Calendar },
            { key: 'push_payments' as const, label: 'Payment Alerts', icon: DollarSign },
            { key: 'push_proposals' as const, label: 'Proposal Activity', icon: MessageSquare },
            { key: 'push_leads' as const, label: 'New Leads', icon: Users },
            { key: 'push_reminders' as const, label: 'Reminders', icon: Bell },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <Body className="text-body-sm font-weight-medium text-foreground">{label}</Body>
              </div>
              <Button
                onClick={() => handleToggle(key)}
                className={`relative w-11 h-6 rounded-avatar transition-colors ${
                  currentSettings?.[key] ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <Text
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-avatar transition-transform ${
                    currentSettings?.[key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
