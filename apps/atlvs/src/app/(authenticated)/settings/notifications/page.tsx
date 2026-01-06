'use client';

/**
 * Notification Settings Page
 * Uses normalized SettingsPageLayout template from @ghxstship/ui
 */

import { useState, useCallback } from 'react';
import { Bell, Mail, MessageSquare, Calendar, DollarSign, Users } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Body, Box, Button, Card, H1, H2, Input, Label, Skeleton, Stack, Text} from '@ghxstship/ui';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';

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
  const { hasRole } = useAuthContext();

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

  const handleToggle = useCallback((key: keyof NotificationSettings) => {
    if (!currentSettings) return;
    const newSettings = {
      ...currentSettings,
      [key]: !currentSettings[key],
    };
    setSettings(newSettings);
  }, [currentSettings]);

  const handleDigestChange = useCallback((value: 'none' | 'daily' | 'weekly') => {
    if (!currentSettings) return;
    setSettings({
      ...currentSettings,
      email_digest: value,
    });
  }, [currentSettings]);

  const _handleSave = useCallback(() => {
    if (currentSettings) {
      updateSettings.mutate(currentSettings);
    }
  }, [currentSettings, updateSettings]);

  if (isLoading) {
    return (
      <Box className="max-w-4xl mx-auto p-6">
        <Box className="mb-6">
          <H1 className="text-h4-md font-weight-bold text-text-primary mb-2">Notifications</H1>
          <Body className="text-text-muted">Loading...</Body>
        </Box>
        <Stack gap={6}>
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </Stack>
      </Box>
    );
  }

  return (
    <Box className="max-w-4xl mx-auto p-6">
      <Box className="mb-6">
        <H1 className="text-h4-md font-weight-bold text-text-primary mb-2">Notifications</H1>
        <Body className="text-text-muted">Configure how you receive updates</Body>
      </Box>
      <Stack gap={6}>
        <Card className="p-6">
          <Stack direction="horizontal" gap={2} className="items-center mb-4">
            <Mail className="h-5 w-5" />
            <H2>Email Notifications</H2>
          </Stack>
          <Stack gap={4}>
            {[
              { key: 'email_bookings' as const, label: 'Booking Updates', description: 'New bookings, confirmations, and cancellations', icon: Calendar },
              { key: 'email_payments' as const, label: 'Payment Alerts', description: 'Payment received, pending, or failed', icon: DollarSign },
              { key: 'email_proposals' as const, label: 'Proposal Activity', description: 'When proposals are viewed or accepted', icon: MessageSquare },
              { key: 'email_leads' as const, label: 'New Leads', description: 'Lead form submissions and inquiries', icon: Users },
              { key: 'email_reminders' as const, label: 'Reminders', description: 'Task and event reminders', icon: Bell },
            ].map(({ key, label, description, icon: IconComponent }) => (
              <Box key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                <Stack direction="horizontal" gap={3} className="items-center">
                  <IconComponent className="h-5 w-5 text-text-primary" />
                  <Stack gap={0}>
                    <Body size="sm" className="font-weight-medium">{label}</Body>
                    <Body size="xs" className="text-text-primary">{description}</Body>
                  </Stack>
                </Stack>
                <Button
                  variant="ghost"
                  onClick={() => handleToggle(key)}
                  className={`relative w-11 h-6 rounded-avatar transition-colors ${
                    currentSettings?.[key] ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-avatar transition-transform ${
                      currentSettings?.[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </Button>
              </Box>
            ))}
          </Stack>
          <Box className="mt-6 pt-4 border-t border-border">
            <Body size="sm" className="font-weight-medium mb-2">Email Digest</Body>
            <Stack direction="horizontal" gap={4}>
              {(['none', 'daily', 'weekly'] as const).map((value) => (
                <Label key={value} className="flex items-center gap-2 cursor-pointer">
                  <Input
                    type="radio"
                    name="digest"
                    checked={currentSettings?.email_digest === value}
                    onChange={() => handleDigestChange(value)}
                    className="w-4 h-4"
                  />
                  <Text size="sm" className="capitalize">{value}</Text>
                </Label>
              ))}
            </Stack>
          </Box>
        </Card>

        <Card className="p-6">
          <Stack direction="horizontal" gap={2} className="items-center mb-4">
            <MessageSquare className="h-5 w-5" />
            <H2>Push Notifications</H2>
          </Stack>
          <Stack gap={4}>
            {[
              { key: 'push_bookings' as const, label: 'Booking Updates', icon: Calendar },
              { key: 'push_payments' as const, label: 'Payment Alerts', icon: DollarSign },
              { key: 'push_proposals' as const, label: 'Proposal Activity', icon: MessageSquare },
              { key: 'push_leads' as const, label: 'New Leads', icon: Users },
              { key: 'push_reminders' as const, label: 'Reminders', icon: Bell },
            ].map(({ key, label, icon: IconComponent }) => (
              <Box key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                <Stack direction="horizontal" gap={3} className="items-center">
                  <IconComponent className="h-5 w-5 text-text-primary" />
                  <Body size="sm" className="font-weight-medium">{label}</Body>
                </Stack>
                <Button
                  variant="ghost"
                  onClick={() => handleToggle(key)}
                  className={`relative w-11 h-6 rounded-avatar transition-colors ${
                    currentSettings?.[key] ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Text
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-avatar transition-transform ${
                      currentSettings?.[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </Button>
              </Box>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
