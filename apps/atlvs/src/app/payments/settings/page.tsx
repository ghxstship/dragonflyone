'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, Shield, CheckCircle, XCircle, Settings, Zap, AlertTriangle } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  Body,
  Button,
  H1,
  H2,
  H3,
  Text,
  Skeleton,
  EmptyState,
  useNotifications,
} from '@ghxstship/ui';

interface PaymentGateway {
  id: string;
  name: string;
  type: 'stripe' | 'square' | 'paypal';
  status: 'connected' | 'disconnected' | 'error';
  is_default: boolean;
  supports_ach: boolean;
  supports_apple_pay: boolean;
  supports_google_pay: boolean;
  last_synced?: string;
}

const DEMO_GATEWAYS: PaymentGateway[] = [
  {
    id: '1',
    name: 'Stripe',
    type: 'stripe',
    status: 'connected',
    is_default: true,
    supports_ach: true,
    supports_apple_pay: true,
    supports_google_pay: true,
    last_synced: '2024-01-18T10:00:00',
  },
  {
    id: '2',
    name: 'Square',
    type: 'square',
    status: 'disconnected',
    is_default: false,
    supports_ach: false,
    supports_apple_pay: true,
    supports_google_pay: true,
  },
];

async function fetchPaymentGateways(): Promise<PaymentGateway[]> {
  const response = await fetch('/api/payments/gateways');
  if (!response.ok) throw new Error('Failed to fetch payment gateways');
  return response.json();
}

export default function PaymentSettingsPage() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);

  const { data: apiGateways, isLoading, error } = useQuery({
    queryKey: ['payment-gateways'],
    queryFn: fetchPaymentGateways,
  });

  const updateGatewayMutation = useMutation({
    mutationFn: async (gateway: Partial<PaymentGateway> & { id: string }) => {
      const response = await fetch(`/api/payments/gateways/${gateway.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gateway),
      });
      if (!response.ok) throw new Error('Failed to update gateway');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
      addNotification({ type: 'success', title: 'Gateway Updated', message: 'Payment gateway settings saved.' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Update Failed', message: 'Failed to update gateway settings.' });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (gatewayId: string) => {
      const response = await fetch(`/api/payments/gateways/${gatewayId}/disconnect`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to disconnect gateway');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-gateways'] });
      setSelectedGateway(null);
      addNotification({ type: 'success', title: 'Gateway Disconnected', message: 'Payment gateway has been disconnected.' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Disconnect Failed', message: 'Failed to disconnect gateway.' });
    },
  });

  // Use API data or fall back to demo data
  const gateways = apiGateways && apiGateways.length > 0 ? apiGateways : DEMO_GATEWAYS;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const connectedCount = gateways.filter((g) => g.status === 'connected').length;

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </AtlvsAppLayout>
    );
  }

  if (error && !apiGateways) {
    return (
      <AtlvsAppLayout>
        <div className="p-6">
          <EmptyState
            title="Error Loading Payment Settings"
            description={error instanceof Error ? error.message : 'Failed to load payment gateways'}
            action={{ label: 'Retry', onClick: () => window.location.reload() }}
          />
        </div>
      </AtlvsAppLayout>
    );
  }

  return (
    <AtlvsAppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/payments"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">Payment Settings</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Configure payment gateways and processing options
            </Body>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <Text className="text-body-sm text-muted-foreground">Gateways</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-foreground">{gateways.length}</Body>
          </div>
          <div className="bg-background border-2 border-success/50 rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <Text className="text-body-sm text-muted-foreground">Connected</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-success">{connectedCount}</Body>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <Text className="text-body-sm text-muted-foreground">PCI Compliant</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-foreground">Yes</Body>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Payment Gateways</H2>
          <div className="space-y-4">
            {gateways.map((gateway) => (
              <div
                key={gateway.id}
                className={`p-4 border-2 rounded-card transition-colors cursor-pointer ${
                  selectedGateway?.id === gateway.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedGateway(gateway)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-card flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <H3 className="text-body-lg font-weight-semibold text-foreground">
                          {gateway.name}
                        </H3>
                        {gateway.is_default && (
                          <Text className="px-2 py-0.5 bg-primary/20 text-primary rounded-badge text-body-xs font-weight-medium">
                            Default
                          </Text>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {gateway.supports_apple_pay && (
                          <Text className="text-body-xs text-muted-foreground">Apple Pay</Text>
                        )}
                        {gateway.supports_google_pay && (
                          <Text className="text-body-xs text-muted-foreground">Google Pay</Text>
                        )}
                        {gateway.supports_ach && (
                          <Text className="text-body-xs text-muted-foreground">ACH</Text>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {gateway.last_synced && (
                      <Text className="text-body-xs text-muted-foreground">
                        Synced {formatDate(gateway.last_synced)}
                      </Text>
                    )}
                    {gateway.status === 'connected' ? (
                      <Text className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded-badge text-body-xs font-weight-medium">
                        <CheckCircle className="h-3 w-3" />
                        Connected
                      </Text>
                    ) : gateway.status === 'error' ? (
                      <Text className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/20 text-destructive rounded-badge text-body-xs font-weight-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Error
                      </Text>
                    ) : (
                      <Text className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-badge text-body-xs font-weight-medium">
                        <XCircle className="h-3 w-3" />
                        Disconnected
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Button variant="solid" size="sm" icon={<Zap className="h-4 w-4" />} iconPosition="left">
              Add Gateway
            </Button>
          </div>
        </div>

        {selectedGateway && selectedGateway.status === 'connected' && (
          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-primary" />
              <H2 className="text-h4-md font-weight-semibold text-foreground">
                {selectedGateway.name} Settings
              </H2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <Body className="text-body-sm font-weight-medium text-foreground">Default Gateway</Body>
                  <Body className="text-body-xs text-muted-foreground">Use this gateway for all new payments</Body>
                </div>
                <Button
                  className={`w-12 h-6 rounded-avatar transition-colors ${
                    selectedGateway.is_default ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                      selectedGateway.is_default ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <Body className="text-body-sm font-weight-medium text-foreground">Apple Pay</Body>
                  <Body className="text-body-xs text-muted-foreground">Accept Apple Pay payments</Body>
                </div>
                <Button
                  className={`w-12 h-6 rounded-avatar transition-colors ${
                    selectedGateway.supports_apple_pay ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                      selectedGateway.supports_apple_pay ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <Body className="text-body-sm font-weight-medium text-foreground">Google Pay</Body>
                  <Body className="text-body-xs text-muted-foreground">Accept Google Pay payments</Body>
                </div>
                <Button
                  className={`w-12 h-6 rounded-avatar transition-colors ${
                    selectedGateway.supports_google_pay ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                      selectedGateway.supports_google_pay ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <Body className="text-body-sm font-weight-medium text-foreground">ACH Bank Transfers</Body>
                  <Body className="text-body-xs text-muted-foreground">Accept bank transfer payments</Body>
                </div>
                <Button
                  className={`w-12 h-6 rounded-avatar transition-colors ${
                    selectedGateway.supports_ach ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                      selectedGateway.supports_ach ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => disconnectMutation.mutate(selectedGateway.id)}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
              </Button>
              <Button 
                variant="solid" 
                size="sm"
                onClick={() => updateGatewayMutation.mutate(selectedGateway)}
                disabled={updateGatewayMutation.isPending}
              >
                {updateGatewayMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AtlvsAppLayout>
  );
}
