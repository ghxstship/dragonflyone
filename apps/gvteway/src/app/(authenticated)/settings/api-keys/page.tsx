"use client";

/**
 * GVTEWAY API Keys Page
 * Manage API keys for programmatic access
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import {
  Body,
  Button,
  Card,
  Grid,
  StatCard,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  Checkbox,
  Select,
  useNotifications,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";
import { Key, Plus, Trash2, Eye, EyeOff, Copy, CheckCircle, Shield } from "lucide-react";
import {
  useApiKeysData,
  type ApiKey,
  type ApiScope,
  ALL_API_SCOPES,
  getScopeLabel,
} from "@/hooks/useApiKeys";
import { useAuthContext, PlatformRole } from "@ghxstship/config";

const ADMIN_ROLES = [
  PlatformRole.GVTEWAY_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

export default function ApiKeysPage() {
  const { addNotification } = useNotifications();
  const { hasRole } = useAuthContext();
  const canManageApiKeys = ADMIN_ROLES.some((role) => hasRole(role));

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<ApiScope[]>([]);
  const [expiresIn, setExpiresIn] = useState<string>("never");

  const {
    apiKeys,
    isLoading,
    error,
    refetch,
    createApiKey,
    isCreating,
    toggleApiKey,
    deleteApiKey,
  } = useApiKeysData();

  const activeCount = apiKeys.filter((k) => k.is_active).length;
  const expiredCount = apiKeys.filter((k) => k.expires_at && new Date(k.expires_at) < new Date()).length;

  const toggleScope = (scope: ApiScope) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleCreateKey = async () => {
    if (!keyName || selectedScopes.length === 0) return;
    let expires_at: string | undefined;
    if (expiresIn !== "never") {
      const now = new Date();
      switch (expiresIn) {
        case "30d": now.setDate(now.getDate() + 30); break;
        case "90d": now.setDate(now.getDate() + 90); break;
        case "1y": now.setFullYear(now.getFullYear() + 1); break;
      }
      expires_at = now.toISOString();
    }
    try {
      const result = await createApiKey({ name: keyName, scopes: selectedScopes, expires_at });
      setNewKey(result.key);
      setShowCreateModal(false);
      setShowKeyModal(true);
      resetForm();
      addNotification({ type: "success", title: "Created", message: "API key created successfully" });
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: err instanceof Error ? err.message : "Failed to create API key" });
    }
  };

  const handleToggleKey = async (key: ApiKey) => {
    try {
      await toggleApiKey({ id: key.id, is_active: !key.is_active });
      addNotification({ type: "success", title: "Updated", message: `API key ${key.is_active ? "disabled" : "enabled"}` });
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: err instanceof Error ? err.message : "Failed to update API key" });
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      try {
        await deleteApiKey(id);
        addNotification({ type: "success", title: "Deleted", message: "API key deleted" });
      } catch (err) {
        addNotification({ type: "error", title: "Error", message: err instanceof Error ? err.message : "Failed to delete API key" });
      }
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(newKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const resetForm = () => {
    setKeyName("");
    setSelectedScopes([]);
    setExpiresIn("never");
  };

  const getExpiryStatus = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const expiry = new Date(expiresAt);
    const now = new Date();
    if (expiry < now) return <Badge variant="error">Expired</Badge>;
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) return <Badge variant="warning">Expires in {daysLeft}d</Badge>;
    return null;
  };

  const headerActions = canManageApiKeys ? (
    <Button variant="solid" onClick={() => setShowCreateModal(true)} icon={<Plus className="size-4" />} iconPosition="left">
      Create API Key
    </Button>
  ) : null;

  const tabs = [
    {
      id: "keys",
      label: "API Keys",
      icon: <Key className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Total Keys" value={apiKeys.length.toString()} />
            <StatCard label="Active" value={activeCount.toString()} />
            <StatCard label="Expired" value={expiredCount.toString()} />
            <StatCard label="Scopes Available" value={ALL_API_SCOPES.length.toString()} />
          </Grid>

          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="text-on-dark-muted mb-4">No API keys created</Body>
              {canManageApiKeys && (
                <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create API Key</Button>
              )}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key Prefix</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scopes</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>
                        <Body className="font-weight-medium text-white">{apiKey.name}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="font-mono text-white">{apiKey.key_prefix}...</Body>
                      </TableCell>
                      <TableCell>
                        {apiKey.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="text-white">{apiKey.scopes.length} scopes</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="text-on-dark-muted">
                          {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : "Never"}
                        </Body>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {apiKey.expires_at ? (
                            <>
                              <Body size="sm" className="text-on-dark-muted">{new Date(apiKey.expires_at).toLocaleDateString()}</Body>
                              {getExpiryStatus(apiKey.expires_at)}
                            </>
                          ) : (
                            <Body size="sm" className="text-on-dark-muted">Never</Body>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canManageApiKeys && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleToggleKey(apiKey)} icon={apiKey.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />} />
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteKey(apiKey.id)} icon={<Trash2 className="size-4" />} />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Section>
      ),
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="API Security Best Practices" description="Guidelines for secure API key management" />
          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <Body className="font-weight-medium text-white mb-4">Do:</Body>
              <div className="space-y-2">
                <Body size="sm" className="text-on-dark-muted">Store API keys securely in environment variables</Body>
                <Body size="sm" className="text-on-dark-muted">Use the minimum required scopes</Body>
                <Body size="sm" className="text-on-dark-muted">Set expiration dates for keys</Body>
                <Body size="sm" className="text-on-dark-muted">Rotate keys regularly</Body>
              </div>
            </Card>
            <Card className="p-6">
              <Body className="font-weight-medium text-white mb-4">Do Not:</Body>
              <div className="space-y-2">
                <Body size="sm" className="text-on-dark-muted">Commit API keys to version control</Body>
                <Body size="sm" className="text-on-dark-muted">Share keys across applications</Body>
                <Body size="sm" className="text-on-dark-muted">Use production keys in development</Body>
                <Body size="sm" className="text-on-dark-muted">Expose keys in client-side code</Body>
              </div>
            </Card>
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: "Settings",
          title: "API Keys",
          description: "Manage API keys for programmatic access to your account",
        }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
        actions={headerActions}
        backButton={{ label: "Settings", href: "/settings" }}
      />

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create API Key">
        <div className="space-y-4">
          <div className="space-y-2">
            <Body size="sm" className="text-on-dark-muted">Key Name</Body>
            <Input placeholder="e.g., Production Server" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Body size="sm" className="text-on-dark-muted">Expiration</Body>
            <Select value={expiresIn} onChange={(e) => setExpiresIn(e.target.value)}>
              <option value="never">Never expires</option>
              <option value="30d">30 days</option>
              <option value="90d">90 days</option>
              <option value="1y">1 year</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Body size="sm" className="text-on-dark-muted">Scopes</Body>
            <Card className="p-4 max-h-[200px] overflow-y-auto">
              <Grid cols={2} gap={2} className="grid-cols-1 lg:grid-cols-2">
                {ALL_API_SCOPES.map((scope) => (
                  <div key={scope} className="flex items-center gap-2">
                    <Checkbox checked={selectedScopes.includes(scope)} onChange={() => toggleScope(scope)} />
                    <Body size="sm">{getScopeLabel(scope)}</Body>
                  </div>
                ))}
              </Grid>
            </Card>
            <Body size="sm" className="text-on-dark-disabled">{selectedScopes.length} scopes selected</Body>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancel</Button>
            <Button variant="solid" onClick={handleCreateKey} disabled={isCreating || !keyName || selectedScopes.length === 0}>
              {isCreating ? "Creating..." : "Create API Key"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={showKeyModal} onClose={() => setShowKeyModal(false)} title="API Key Created">
        <div className="space-y-4">
          <Card className="p-4 bg-warning-900 border-warning-500">
            <Body size="sm" className="text-warning-100">This API key will only be shown once. Copy it now and store it securely.</Body>
          </Card>
          <div className="space-y-2">
            <Body size="sm" className="text-on-dark-muted">Your API Key</Body>
            <div className="flex gap-2">
              <Input value={newKey} readOnly className="font-mono" />
              <Button variant="outline" onClick={copyKey} icon={copiedKey ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}>
                {copiedKey ? "Copied" : "Copy"}
              </Button>
            </div>
            <Body size="sm" className="text-on-dark-disabled">Include this key in your API requests using the Authorization header</Body>
          </div>
          <Button variant="solid" onClick={() => setShowKeyModal(false)}>Done</Button>
        </div>
      </Modal>
    </>
  );
}
