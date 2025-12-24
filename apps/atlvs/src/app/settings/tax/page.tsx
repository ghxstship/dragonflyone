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
  Select,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Percent, Globe, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  region: string;
  country: string;
  applies_to: 'all' | 'services' | 'products' | 'rentals';
  is_default: boolean;
  is_active: boolean;
}

interface TaxSettings {
  tax_enabled: boolean;
  display_prices_with_tax: boolean;
  tax_calculation_method: 'inclusive' | 'exclusive';
  default_tax_rate_id?: string;
  tax_number?: string;
  tax_number_label?: string;
}

const DEMO_TAX_RATES: TaxRate[] = [
  { id: 'TR-001', name: 'Standard Rate', rate: 20, region: 'United Kingdom', country: 'GB', applies_to: 'all', is_default: true, is_active: true },
  { id: 'TR-002', name: 'Reduced Rate', rate: 5, region: 'United Kingdom', country: 'GB', applies_to: 'services', is_default: false, is_active: true },
  { id: 'TR-003', name: 'US Sales Tax - NY', rate: 8.875, region: 'New York', country: 'US', applies_to: 'all', is_default: false, is_active: true },
  { id: 'TR-004', name: 'US Sales Tax - CA', rate: 7.25, region: 'California', country: 'US', applies_to: 'all', is_default: false, is_active: true },
  { id: 'TR-005', name: 'Zero Rate', rate: 0, region: 'Global', country: 'ALL', applies_to: 'all', is_default: false, is_active: true },
];

const DEMO_SETTINGS: TaxSettings = {
  tax_enabled: true,
  display_prices_with_tax: false,
  tax_calculation_method: 'exclusive',
  default_tax_rate_id: 'TR-001',
  tax_number: 'GB123456789',
  tax_number_label: 'VAT Number',
};

export default function TaxSettingsPage() {
  const queryClient = useQueryClient();
  const [showRateModal, setShowRateModal] = useState(false);
  const [editingRate, setEditingRate] = useState<TaxRate | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tax-settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings/tax');
      if (!response.ok) {
        return { rates: DEMO_TAX_RATES, settings: DEMO_SETTINGS };
      }
      const result = await response.json();
      return result.rates?.length ? result : { rates: DEMO_TAX_RATES, settings: DEMO_SETTINGS };
    },
  });

  const taxRates: TaxRate[] = data?.rates || DEMO_TAX_RATES;
  const settings: TaxSettings = data?.settings || DEMO_SETTINGS;

  const [localSettings, setLocalSettings] = useState<TaxSettings>(settings);

  const saveSettings = useMutation({
    mutationFn: async (newSettings: TaxSettings) => {
      const response = await fetch('/api/settings/tax', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
    },
  });

  const createRate = useMutation({
    mutationFn: async (rate: Partial<TaxRate>) => {
      const response = await fetch('/api/settings/tax/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rate),
      });
      if (!response.ok) throw new Error('Failed to create rate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
      setShowRateModal(false);
      setEditingRate(null);
    },
  });

  const deleteRate = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/settings/tax/rates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete rate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
    },
  });

  const getAppliesToLabel = (appliesTo: string) => {
    switch (appliesTo) {
      case 'all': return 'All Items';
      case 'services': return 'Services Only';
      case 'products': return 'Products Only';
      case 'rentals': return 'Rentals Only';
      default: return appliesTo;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading tax settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <Body className="text-destructive">Failed to load tax settings</Body>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['tax-settings'] })}
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-button"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Tax Settings</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Configure tax rates and calculation settings
          </Body>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6 space-y-6">
        <H2 className="text-h4-md font-weight-semibold text-foreground">General Settings</H2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Body className="text-body-sm font-weight-medium text-foreground">Enable Tax Calculation</Body>
              <Body className="text-body-xs text-muted-foreground">Apply tax to invoices and quotes</Body>
            </div>
            <Button
              onClick={() => setLocalSettings({ ...localSettings, tax_enabled: !localSettings.tax_enabled })}
              className={`relative w-12 h-6 rounded-avatar transition-colors ${
                localSettings.tax_enabled ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <Text
                className={`absolute top-1 w-4 h-4 bg-white rounded-avatar transition-transform ${
                  localSettings.tax_enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Body className="text-body-sm font-weight-medium text-foreground">Display Prices with Tax</Body>
              <Body className="text-body-xs text-muted-foreground">Show tax-inclusive prices to customers</Body>
            </div>
            <Button
              onClick={() => setLocalSettings({ ...localSettings, display_prices_with_tax: !localSettings.display_prices_with_tax })}
              className={`relative w-12 h-6 rounded-avatar transition-colors ${
                localSettings.display_prices_with_tax ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <Text
                className={`absolute top-1 w-4 h-4 bg-white rounded-avatar transition-transform ${
                  localSettings.display_prices_with_tax ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </Button>
          </div>

          <div>
            <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Tax Calculation Method
            </Label>
            <Select
              value={localSettings.tax_calculation_method}
              onChange={(e) => setLocalSettings({ ...localSettings, tax_calculation_method: e.target.value as 'inclusive' | 'exclusive' })}
              className="w-full max-w-xs px-4 py-2 border-2 border-border rounded-button bg-background focus:outline-none focus:border-primary"
            >
              <option value="exclusive">Tax Exclusive (add tax to prices)</option>
              <option value="inclusive">Tax Inclusive (prices include tax)</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Tax Number Label
              </Label>
              <Input
                type="text"
                value={localSettings.tax_number_label || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, tax_number_label: e.target.value })}
                placeholder="e.g., VAT Number, GST Number"
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                Tax Number
              </Label>
              <Input
                type="text"
                value={localSettings.tax_number || ''}
                onChange={(e) => setLocalSettings({ ...localSettings, tax_number: e.target.value })}
                placeholder="Your tax registration number"
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => saveSettings.mutate(localSettings)}
              disabled={saveSettings.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saveSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center justify-between mb-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground">Tax Rates</H2>
          <Button
            onClick={() => { setEditingRate(null); setShowRateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <Text className="text-body-sm">Add Rate</Text>
          </Button>
        </div>

        {taxRates.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 border-2 border-dashed border-border rounded-card">
            <Percent className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <Body className="text-body-sm text-muted-foreground">No tax rates configured</Body>
          </div>
        ) : (
          <div className="space-y-3">
            {taxRates.map((rate) => (
              <div
                key={rate.id}
                className={`flex items-center justify-between p-4 border-2 rounded-card ${
                  rate.is_default ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-card flex items-center justify-center">
                    <Percent className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Body className="text-body-md font-weight-semibold text-foreground">{rate.name}</Body>
                      {rate.is_default && (
                        <Text className="px-2 py-0.5 bg-primary/20 text-primary text-body-xs rounded-badge">
                          Default
                        </Text>
                      )}
                      {!rate.is_active && (
                        <Text className="px-2 py-0.5 bg-muted text-muted-foreground text-body-xs rounded-badge">
                          Inactive
                        </Text>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-body-xs text-muted-foreground mt-1">
                      <Text className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {rate.region}, {rate.country}
                      </Text>
                      <Text>•</Text>
                      <Text>{getAppliesToLabel(rate.applies_to)}</Text>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Body className="text-h4-md font-weight-bold text-foreground">{rate.rate}%</Body>
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => { setEditingRate(rate); setShowRateModal(true); }}
                      className="p-2 hover:bg-muted rounded-button transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    {!rate.is_default && (
                      <Button
                        onClick={() => {
                          if (confirm('Delete this tax rate?')) {
                            deleteRate.mutate(rate.id);
                          }
                        }}
                        className="p-2 hover:bg-destructive/10 rounded-button transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">
              {editingRate ? 'Edit Tax Rate' : 'Add Tax Rate'}
            </H3>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createRate.mutate({
                  id: editingRate?.id,
                  name: formData.get('name') as string,
                  rate: parseFloat(formData.get('rate') as string),
                  region: formData.get('region') as string,
                  country: formData.get('country') as string,
                  applies_to: formData.get('applies_to') as TaxRate['applies_to'],
                  is_default: formData.get('is_default') === 'on',
                  is_active: true,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Rate Name *
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingRate?.name}
                    placeholder="e.g., Standard Rate"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Rate (%) *
                  </Label>
                  <Input
                    type="number"
                    name="rate"
                    required
                    min="0"
                    max="100"
                    step="0.001"
                    defaultValue={editingRate?.rate}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Region *
                  </Label>
                  <Input
                    type="text"
                    name="region"
                    required
                    defaultValue={editingRate?.region}
                    placeholder="e.g., California, United Kingdom"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Country Code *
                  </Label>
                  <Input
                    type="text"
                    name="country"
                    required
                    maxLength={3}
                    defaultValue={editingRate?.country}
                    placeholder="e.g., US, GB"
                    className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Applies To
                </Label>
                <Select
                  name="applies_to"
                  defaultValue={editingRate?.applies_to || 'all'}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  <option value="all">All Items</option>
                  <option value="services">Services Only</option>
                  <option value="products">Products Only</option>
                  <option value="rentals">Rentals Only</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  defaultChecked={editingRate?.is_default}
                  className="w-4 h-4 border-2 border-border rounded"
                />
                <Label htmlFor="is_default" className="text-body-sm text-foreground">
                  Set as default tax rate
                </Label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => { setShowRateModal(false); setEditingRate(null); }}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRate.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createRate.isPending ? 'Saving...' : editingRate ? 'Update Rate' : 'Add Rate'}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
