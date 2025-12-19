import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface OrganizationSettings {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: '12h' | '24h';
  fiscal_year_start_month: number;
  business_hours: {
    [day: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    website?: string;
  };
  tax_settings: {
    tax_id?: string;
    default_tax_rate?: number;
    tax_inclusive: boolean;
  };
  invoice_settings: {
    prefix: string;
    next_number: number;
    payment_terms_days: number;
    late_fee_percentage?: number;
    footer_text?: string;
  };
  booking_settings: {
    min_lead_time_hours: number;
    max_advance_booking_days: number;
    default_event_duration_hours: number;
    require_deposit: boolean;
    deposit_percentage?: number;
    cancellation_policy?: string;
  };
  email_settings: {
    sender_name: string;
    sender_email: string;
    reply_to_email?: string;
    bcc_email?: string;
    email_signature?: string;
  };
  integrations: {
    stripe_connected: boolean;
    quickbooks_connected: boolean;
    google_calendar_connected: boolean;
    slack_connected: boolean;
  };
  features: {
    multi_venue: boolean;
    client_portal: boolean;
    online_payments: boolean;
    e_signatures: boolean;
    custom_branding: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingsInput {
  name?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  timezone?: string;
  currency?: string;
  date_format?: string;
  time_format?: '12h' | '24h';
  fiscal_year_start_month?: number;
  business_hours?: OrganizationSettings['business_hours'];
  contact_info?: Partial<OrganizationSettings['contact_info']>;
  tax_settings?: Partial<OrganizationSettings['tax_settings']>;
  invoice_settings?: Partial<OrganizationSettings['invoice_settings']>;
  booking_settings?: Partial<OrganizationSettings['booking_settings']>;
  email_settings?: Partial<OrganizationSettings['email_settings']>;
}

async function fetchOrganizationSettings(): Promise<OrganizationSettings> {
  const response = await fetch('/api/organization/settings');
  if (!response.ok) {
    throw new Error('Failed to fetch organization settings');
  }
  return response.json();
}

async function updateOrganizationSettings(input: UpdateSettingsInput): Promise<OrganizationSettings> {
  const response = await fetch('/api/organization/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update settings');
  }
  return response.json();
}

async function uploadLogo(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/organization/logo', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload logo');
  }
  return response.json();
}

async function testEmailSettings(): Promise<{ sent: boolean }> {
  const response = await fetch('/api/organization/test-email', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to send test email');
  }
  return response.json();
}

export function useOrganizationSettings() {
  return useQuery({
    queryKey: ['organization-settings'],
    queryFn: fetchOrganizationSettings,
  });
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganizationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
    },
  });
}

export function useTestEmailSettings() {
  return useMutation({
    mutationFn: testEmailSettings,
  });
}
