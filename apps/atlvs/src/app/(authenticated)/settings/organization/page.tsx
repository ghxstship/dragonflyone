'use client';

/**
 * Organization Settings Page
 * Uses normalized SettingsPageLayout template from @ghxstship/ui
 */

import { useState, useEffect } from 'react';
import { Building2, Upload, Globe, MapPin, Phone, Mail, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import { useRouter } from 'next/navigation';
import {
  Alert, Body, Box, Button, Card, EmptyState, Grid, H2, Input, Label, Select, SettingsPageLayout, Skeleton, Stack} from '@ghxstship/ui';

interface OrganizationSettings {
  id: string;
  name: string;
  legal_name?: string;
  logo_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  tax_id?: string;
  industry?: string;
  timezone: string;
  currency: string;
  date_format: string;
  fiscal_year_start: string;
}

const TIMEZONES = [
  { id: 'America/New_York', label: 'Eastern Time (ET)' },
  { id: 'America/Chicago', label: 'Central Time (CT)' },
  { id: 'America/Denver', label: 'Mountain Time (MT)' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { id: 'America/Phoenix', label: 'Arizona (No DST)' },
  { id: 'Europe/London', label: 'London (GMT/BST)' },
  { id: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)' },
];

const CURRENCIES = [
  { id: 'USD', label: 'US Dollar ($)' },
  { id: 'EUR', label: 'Euro (€)' },
  { id: 'GBP', label: 'British Pound (£)' },
  { id: 'CAD', label: 'Canadian Dollar (CA$)' },
  { id: 'AUD', label: 'Australian Dollar (A$)' },
];

const DATE_FORMATS = [
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

// Default empty organization settings structure (no demo data)
const DEFAULT_ORG_SETTINGS: OrganizationSettings = {
  id: '',
  name: '',
  legal_name: '',
  website: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  },
  tax_id: '',
  industry: '',
  timezone: 'America/New_York',
  currency: 'USD',
  date_format: 'MM/DD/YYYY',
  fiscal_year_start: 'January',
};

// Roles that can manage organization settings

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const { hasRole, user } = useAuthContext();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<OrganizationSettings>(DEFAULT_ORG_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // RBAC: Check if user can manage organization settings
  const canManageOrg = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data, isLoading, error } = useQuery({
    queryKey: ['organization-settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings/organization');
      if (!response.ok) {
        // Return empty defaults instead of demo data on error
        return DEFAULT_ORG_SETTINGS;
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (settings: OrganizationSettings) => {
      const response = await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-settings'] });
      setHasChanges(false);
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address!, [field]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <SettingsPageLayout
        title="Organization Settings"
        description="Loading..."
        maxWidth="xl"
      >
        <Grid cols={3} gap={6}>
          <Box className="col-span-2"><Skeleton className="h-96" /></Box>
          <Skeleton className="h-96" />
        </Grid>
      </SettingsPageLayout>
    );
  }

  if (error) {
    return (
      <SettingsPageLayout
        title="Organization Settings"
        description="Error"
        maxWidth="xl"
      >
        <EmptyState
          title="Failed to load settings"
          description="There was an error loading organization settings. Please try again."
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      </SettingsPageLayout>
    );
  }

  // RBAC: If user doesn't have permission, show unauthorized message
  if (!canManageOrg) {
    return (
      <SettingsPageLayout
        title="Organization Settings"
        description="Access Denied"
        maxWidth="xl"
      >
        <Card className="p-8 text-center max-w-xl mx-auto">
          <Stack gap={4} className="items-center">
            <H2>Access Denied</H2>
            <Body className="text-muted-foreground">
              You do not have permission to manage organization settings.
              This action requires ATLVS Admin or higher role.
            </Body>
            <Body className="text-muted-foreground text-body-sm">
              Current user: {user?.email || 'Unknown'}
            </Body>
            <Button variant="outline" onClick={() => router.push('/settings')}>
              Back to Settings
            </Button>
          </Stack>
        </Card>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Organization Settings"
      description="Manage your organization profile and preferences"
      maxWidth="xl"
      headerActions={
        <Button
          variant="solid"
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || saveMutation.isPending}
          isLoading={saveMutation.isPending}
          loadingText="Saving..."
          icon={<Save className="h-4 w-4" />}
          iconPosition="left"
        >
          Save Changes
        </Button>
      }
    >
      <Stack gap={6}>
            {saveMutation.isSuccess && (
              <Alert variant="success">Settings saved successfully!</Alert>
            )}

            <Grid cols={3} gap={6}>
              <Stack gap={6} className="col-span-2">
                <Card className="p-6">
                  <H2 className="mb-4">Basic Information</H2>
                  <Stack gap={4}>
                    <Grid cols={2} gap={4}>
                      <Stack gap={2}>
                        <Label>Organization Name *</Label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      </Stack>
                      <Stack gap={2}>
                        <Label>Legal Name</Label>
                        <Input
                          type="text"
                          value={formData.legal_name || ''}
                          onChange={(e) => handleChange('legal_name', e.target.value)}
                        />
                      </Stack>
                    </Grid>
                    <Grid cols={2} gap={4}>
                      <Stack gap={2}>
                        <Label>Industry</Label>
                        <Input
                          type="text"
                          value={formData.industry || ''}
                          onChange={(e) => handleChange('industry', e.target.value)}
                        />
                      </Stack>
                      <Stack gap={2}>
                        <Label>Tax ID / EIN</Label>
                        <Input
                          type="text"
                          value={formData.tax_id || ''}
                          onChange={(e) => handleChange('tax_id', e.target.value)}
                        />
                      </Stack>
                    </Grid>
                  </Stack>
                </Card>

                <Card className="p-6">
                  <Stack direction="horizontal" gap={2} className="items-center mb-4">
                    <Phone className="h-5 w-5" />
                    <H2>Contact Information</H2>
                  </Stack>
                  <Stack gap={4}>
                    <Grid cols={2} gap={4}>
                      <Stack gap={2}>
                        <Label><Mail className="h-4 w-4 inline mr-1" />Email</Label>
                        <Input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                      </Stack>
                      <Stack gap={2}>
                        <Label>Phone</Label>
                        <Input
                          type="tel"
                          value={formData.phone || ''}
                          onChange={(e) => handleChange('phone', e.target.value)}
                        />
                      </Stack>
                    </Grid>
                    <Stack gap={2}>
                      <Label><Globe className="h-4 w-4 inline mr-1" />Website</Label>
                      <Input
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => handleChange('website', e.target.value)}
                      />
                    </Stack>
                  </Stack>
                </Card>

                <Card className="p-6">
                  <Stack direction="horizontal" gap={2} className="items-center mb-4">
                    <MapPin className="h-5 w-5" />
                    <H2>Address</H2>
                  </Stack>
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Label>Street Address</Label>
                      <Input
                        type="text"
                        value={formData.address?.street || ''}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                      />
                    </Stack>
                    <Grid cols={3} gap={4}>
                      <Stack gap={2}>
                        <Label>City</Label>
                        <Input
                          type="text"
                          value={formData.address?.city || ''}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                        />
                      </Stack>
                      <Stack gap={2}>
                        <Label>State / Province</Label>
                        <Input
                          type="text"
                          value={formData.address?.state || ''}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                        />
                      </Stack>
                      <Stack gap={2}>
                        <Label>ZIP / Postal Code</Label>
                        <Input
                          type="text"
                          value={formData.address?.zip || ''}
                          onChange={(e) => handleAddressChange('zip', e.target.value)}
                        />
                      </Stack>
                    </Grid>
                    <Stack gap={2}>
                      <Label>Country</Label>
                      <Input
                        type="text"
                        value={formData.address?.country || ''}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                      />
                    </Stack>
                  </Stack>
                </Card>
              </Stack>

              <Stack gap={6}>
                <Card className="p-6">
                  <H2 className="mb-4">Regional Settings</H2>
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Label>Timezone</Label>
                      <Select
                        value={formData.timezone}
                        onChange={(e) => handleChange('timezone', e.target.value)}
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz.id} value={tz.id}>{tz.label}</option>
                        ))}
                      </Select>
                    </Stack>
                    <Stack gap={2}>
                      <Label>Currency</Label>
                      <Select
                        value={formData.currency}
                        onChange={(e) => handleChange('currency', e.target.value)}
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </Select>
                    </Stack>
                    <Stack gap={2}>
                      <Label>Date Format</Label>
                      <Select
                        value={formData.date_format}
                        onChange={(e) => handleChange('date_format', e.target.value)}
                      >
                        {DATE_FORMATS.map((df) => (
                          <option key={df.id} value={df.id}>{df.label}</option>
                        ))}
                      </Select>
                    </Stack>
                    <Stack gap={2}>
                      <Label>Fiscal Year Start</Label>
                      <Select
                        value={formData.fiscal_year_start}
                        onChange={(e) => handleChange('fiscal_year_start', e.target.value)}
                      >
                        {['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </Select>
                    </Stack>
                  </Stack>
                </Card>

                <Card className="p-6">
                  <Stack direction="horizontal" gap={2} className="items-center mb-4">
                    <Upload className="h-5 w-5" />
                    <H2>Logo</H2>
                  </Stack>
                  <Box className="border-2 border-dashed border-border rounded-card p-8 text-center">
                    {formData.logo_url ? (
                      <Box className="max-h-24 mx-auto mb-2 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-primary" />
                      </Box>
                    ) : (
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    )}
                    <Body size="xs" className="text-muted-foreground mb-2">
                      PNG, JPG up to 2MB
                    </Body>
                    <Button variant="outline" size="sm">Upload Logo</Button>
                  </Box>
                </Card>
              </Stack>
            </Grid>
          </Stack>
        </SettingsPageLayout>
  );
}
