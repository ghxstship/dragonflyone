'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Shield, CheckCircle, XCircle, Settings, Zap, AlertTriangle } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { Button } from '@ghxstship/ui';

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

const MOCK_GATEWAYS: PaymentGateway[] = [
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

export default function PaymentSettingsPage() {
  const [gateways] = useState<PaymentGateway[]>(MOCK_GATEWAYS);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const connectedCount = gateways.filter((g) => g.status === 'connected').length;

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
            <h1 className="text-h2-md font-weight-bold text-foreground">Payment Settings</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Configure payment gateways and processing options
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="text-body-sm text-muted-foreground">Gateways</span>
            </div>
            <p className="text-h3-md font-weight-bold text-foreground">{gateways.length}</p>
          </div>
          <div className="bg-background border-2 border-success/50 rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-body-sm text-muted-foreground">Connected</span>
            </div>
            <p className="text-h3-md font-weight-bold text-success">{connectedCount}</p>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-body-sm text-muted-foreground">PCI Compliant</span>
            </div>
            <p className="text-h3-md font-weight-bold text-foreground">Yes</p>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Payment Gateways</h2>
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
                        <h3 className="text-body-lg font-weight-semibold text-foreground">
                          {gateway.name}
                        </h3>
                        {gateway.is_default && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-badge text-body-xs font-weight-medium">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {gateway.supports_apple_pay && (
                          <span className="text-body-xs text-muted-foreground">Apple Pay</span>
                        )}
                        {gateway.supports_google_pay && (
                          <span className="text-body-xs text-muted-foreground">Google Pay</span>
                        )}
                        {gateway.supports_ach && (
                          <span className="text-body-xs text-muted-foreground">ACH</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {gateway.last_synced && (
                      <span className="text-body-xs text-muted-foreground">
                        Synced {formatDate(gateway.last_synced)}
                      </span>
                    )}
                    {gateway.status === 'connected' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded-badge text-body-xs font-weight-medium">
                        <CheckCircle className="h-3 w-3" />
                        Connected
                      </span>
                    ) : gateway.status === 'error' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/20 text-destructive rounded-badge text-body-xs font-weight-medium">
                        <AlertTriangle className="h-3 w-3" />
                        Error
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-badge text-body-xs font-weight-medium">
                        <XCircle className="h-3 w-3" />
                        Disconnected
                      </span>
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
              <h2 className="text-h4-md font-weight-semibold text-foreground">
                {selectedGateway.name} Settings
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-body-sm font-weight-medium text-foreground">Default Gateway</p>
                  <p className="text-body-xs text-muted-foreground">Use this gateway for all new payments</p>
                </div>
                <button
                  className={`w-12 h-6 rounded-avatar transition-colors ${
                    selectedGateway.is_default ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                      selectedGateway.is_default ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-body-sm font-weight-medium text-foreground">Apple Pay</p>
                  <p className="text-body-xs text-muted-foreground">Accept Apple Pay payments</p>
                </div>
                <button
                  className={`w-12 h-6 rounded-avatar transition-colors ${
                    selectedGateway.supports_apple_pay ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                      selectedGateway.supports_apple_pay ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-body-sm font-weight-medium text-foreground">Google Pay</p>
                  <p className="text-body-xs text-muted-foreground">Accept Google Pay payments</p>
                </div>
                <button
                  className={`w-12 h-6 rounded-avatar transition-colors ${
                    selectedGateway.supports_google_pay ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                      selectedGateway.supports_google_pay ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-body-sm font-weight-medium text-foreground">ACH Bank Transfers</p>
                  <p className="text-body-xs text-muted-foreground">Accept bank transfer payments</p>
                </div>
                <button
                  className={`w-12 h-6 rounded-avatar transition-colors ${
                    selectedGateway.supports_ach ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                      selectedGateway.supports_ach ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <Button variant="destructive" size="sm">
                Disconnect
              </Button>
              <Button variant="solid" size="sm">
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </AtlvsAppLayout>
  );
}
