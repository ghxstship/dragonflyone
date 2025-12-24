'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H3,
  Input,
  Label,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Key, Copy, Trash2, Eye, EyeOff, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  key_hash?: string;
  scopes: string[];
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  is_active: boolean;
}

const DEMO_API_KEYS: ApiKey[] = [
  {
    id: 'AK-001',
    name: 'Production API Key',
    key_prefix: 'atlvs_live_****',
    scopes: ['read:bookings', 'write:bookings', 'read:contacts', 'write:contacts'],
    last_used_at: '2024-12-18T14:30:00Z',
    created_at: '2024-06-01T10:00:00Z',
    is_active: true,
  },
  {
    id: 'AK-002',
    name: 'Development API Key',
    key_prefix: 'atlvs_test_****',
    scopes: ['read:bookings', 'read:contacts', 'read:invoices'],
    last_used_at: '2024-12-15T09:00:00Z',
    created_at: '2024-08-15T11:00:00Z',
    is_active: true,
  },
  {
    id: 'AK-003',
    name: 'Integration Key - Zapier',
    key_prefix: 'atlvs_int_****',
    scopes: ['read:bookings', 'webhooks'],
    last_used_at: '2024-12-10T16:00:00Z',
    expires_at: '2025-06-01T00:00:00Z',
    created_at: '2024-09-01T08:00:00Z',
    is_active: true,
  },
];

const AVAILABLE_SCOPES = [
  { id: 'read:bookings', name: 'Read Bookings', description: 'View booking information' },
  { id: 'write:bookings', name: 'Write Bookings', description: 'Create and update bookings' },
  { id: 'read:contacts', name: 'Read Contacts', description: 'View contact information' },
  { id: 'write:contacts', name: 'Write Contacts', description: 'Create and update contacts' },
  { id: 'read:invoices', name: 'Read Invoices', description: 'View invoice information' },
  { id: 'write:invoices', name: 'Write Invoices', description: 'Create and update invoices' },
  { id: 'webhooks', name: 'Webhooks', description: 'Manage webhook subscriptions' },
];

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await fetch('/api/settings/api-keys');
      if (!response.ok) {
        return { keys: DEMO_API_KEYS };
      }
      const result = await response.json();
      return result.keys?.length ? result : { keys: DEMO_API_KEYS };
    },
  });

  const apiKeys: ApiKey[] = data?.keys || DEMO_API_KEYS;

  const createKey = useMutation({
    mutationFn: async (keyConfig: { name: string; scopes: string[]; expires_at?: string }) => {
      const response = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyConfig),
      });
      if (!response.ok) throw new Error('Failed to create API key');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      if (data.key) {
        setNewKeyValue(data.key);
      }
    },
  });

  const revokeKey = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/settings/api-keys/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to revoke API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId)
        ? prev.filter((s) => s !== scopeId)
        : [...prev, scopeId]
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading API keys...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <Body className="text-destructive">Failed to load API keys</Body>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['api-keys'] })}
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground">API Keys</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Manage API keys for third-party integrations
            </Body>
          </div>
        </div>
        <Button
          onClick={() => { setSelectedScopes([]); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <Text className="text-body-sm font-weight-medium">Generate Key</Text>
        </Button>
      </div>

      <div className="bg-warning/10 border-2 border-warning rounded-card p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <Body className="text-body-sm font-weight-medium text-foreground">Security Notice</Body>
            <Body className="text-body-xs text-muted-foreground mt-1">
              API keys provide access to your account. Keep them secure and never share them publicly.
              Revoke any keys that may have been compromised.
            </Body>
          </div>
        </div>
      </div>

      {apiKeys.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No API keys
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            Generate an API key to integrate with external services
          </Body>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button"
          >
            <Plus className="h-4 w-4" />
            Generate First Key
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className={`bg-background border-2 rounded-card p-4 ${
                key.is_active ? 'border-border' : 'border-destructive/50 bg-destructive/5'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-card flex items-center justify-center ${
                    key.is_active ? 'bg-primary/10' : 'bg-destructive/10'
                  }`}>
                    <Key className={`h-5 w-5 ${key.is_active ? 'text-primary' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <Body className="text-body-md font-weight-semibold text-foreground">{key.name}</Body>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-body-xs bg-muted px-2 py-0.5 rounded font-mono">
                        {showKey[key.id] ? `atlvs_****_${key.id.slice(-8)}` : key.key_prefix}
                      </code>
                      <Button
                        onClick={() => setShowKey((prev) => ({ ...prev, [key.id]: !prev[key.id] }))}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        {showKey[key.id] ? (
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <Eye className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(key.key_prefix)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                      >
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {key.is_active ? (
                    <Text className="flex items-center gap-1 px-2 py-1 bg-success/20 text-success text-body-xs rounded-badge">
                      <CheckCircle className="h-3 w-3" />
                      Active
                    </Text>
                  ) : (
                    <Text className="px-2 py-1 bg-destructive/20 text-destructive text-body-xs rounded-badge">
                      Revoked
                    </Text>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {key.scopes.map((scope) => (
                  <Text
                    key={scope}
                    className="px-2 py-0.5 bg-muted text-muted-foreground text-body-xs rounded-badge"
                  >
                    {scope}
                  </Text>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-4 text-body-xs text-muted-foreground">
                  <Text className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Created: {new Date(key.created_at).toLocaleDateString()}
                  </Text>
                  {key.last_used_at && (
                    <Text>Last used: {new Date(key.last_used_at).toLocaleDateString()}</Text>
                  )}
                  {key.expires_at && (
                    <Text className="text-warning">
                      Expires: {new Date(key.expires_at).toLocaleDateString()}
                    </Text>
                  )}
                </div>
                {key.is_active && (
                  <Button
                    onClick={() => {
                      if (confirm('Revoke this API key? This action cannot be undone.')) {
                        revokeKey.mutate(key.id);
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-body-xs text-destructive hover:bg-destructive/10 rounded-button transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-lg w-full mx-4">
            {newKeyValue ? (
              <>
                <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">
                  API Key Generated
                </H3>
                <div className="bg-success/10 border-2 border-success rounded-card p-4 mb-4">
                  <Body className="text-body-sm text-success mb-2">
                    Copy your API key now. You will not be able to see it again.
                  </Body>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-body-sm bg-background p-2 rounded font-mono break-all">
                      {newKeyValue}
                    </code>
                    <Button
                      onClick={() => copyToClipboard(newKeyValue)}
                      className="p-2 bg-success text-success-foreground rounded-button"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => { setShowCreateModal(false); setNewKeyValue(null); }}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-button"
                >
                  Done
                </Button>
              </>
            ) : (
              <>
                <H3 className="text-h4-md font-weight-semibold text-foreground mb-4">
                  Generate API Key
                </H3>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    createKey.mutate({
                      name: formData.get('name') as string,
                      scopes: selectedScopes,
                      expires_at: formData.get('expires_at') as string || undefined,
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                      Key Name *
                    </Label>
                    <Input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g., Production API Key"
                      className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                      Scopes *
                    </Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {AVAILABLE_SCOPES.map((scope) => (
                        <Label
                          key={scope.id}
                          className="flex items-start gap-3 p-2 border-2 border-border rounded-button cursor-pointer hover:bg-muted/50"
                        >
                          <Input
                            type="checkbox"
                            checked={selectedScopes.includes(scope.id)}
                            onChange={() => toggleScope(scope.id)}
                            className="mt-0.5 w-4 h-4 border-2 border-border rounded"
                          />
                          <div>
                            <Body className="text-body-sm font-weight-medium text-foreground">{scope.name}</Body>
                            <Body className="text-body-xs text-muted-foreground">{scope.description}</Body>
                          </div>
                        </Label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                      Expiration Date (Optional)
                    </Label>
                    <Input
                      type="date"
                      name="expires_at"
                      className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createKey.isPending || selectedScopes.length === 0}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {createKey.isPending ? 'Generating...' : 'Generate Key'}
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
