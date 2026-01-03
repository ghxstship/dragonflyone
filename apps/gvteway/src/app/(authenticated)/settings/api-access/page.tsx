"use client";

/**
 * GVTEWAY API Access Page
 * Manage API keys for programmatic access to the platform
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
  useToast,
  DetailPage,
  Section,
  SectionHeader,
  Box,
  Stack,
} from "@ghxstship/ui";
import { Key, Plus, Trash2, Copy, CheckCircle, Power, PowerOff, Code, FileText } from "lucide-react";
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

export default function ApiAccessPage() {
  const toast = useToast();
  const { hasRole } = useAuthContext();
  const canManageApiKeys = ADMIN_ROLES.some((role) => hasRole(role));

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<ApiScope[]>([]);

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

  const toggleScope = (scope: ApiScope) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleCreateKey = async () => {
    if (!keyName || selectedScopes.length === 0) return;
    try {
      const result = await createApiKey({ name: keyName, scopes: selectedScopes });
      setNewKey(result.key);
      setShowCreateModal(false);
      setShowKeyModal(true);
      resetForm();
      toast.success("Created", "API key created successfully");
    } catch (err) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to create API key");
    }
  };

  const handleToggleKey = async (key: ApiKey) => {
    try {
      await toggleApiKey({ id: key.id, is_active: !key.is_active });
      toast.success("Updated", `API key ${key.is_active ? "disabled" : "enabled"}`);
    } catch (err) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to update API key");
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (confirm("Are you sure you want to delete this API key? This action cannot be undone.")) {
      try {
        await deleteApiKey(id);
        toast.success("Deleted", "API key deleted");
      } catch (err) {
        toast.error("Error", err instanceof Error ? err.message : "Failed to delete API key");
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
          <Grid cols={3} gap={4} className="grid-cols-1 lg:grid-cols-3 mb-6">
            <StatCard label="Total API Keys" value={apiKeys.length.toString()} />
            <StatCard label="Active Keys" value={activeCount.toString()} />
            <StatCard label="Available Scopes" value={ALL_API_SCOPES.length.toString()} />
          </Grid>

          <SectionHeader title="API Keys" description="Manage your API keys for programmatic access" />

          {apiKeys.length === 0 ? (
            <Box className="text-center py-12">
              <Key className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted mb-4">No API keys</Body>
              {canManageApiKeys && (
                <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create API Key</Button>
              )}
            </Box>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scopes</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>
                        <Body className="font-weight-medium text-white">{key.name}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="font-mono text-white">{key.key_prefix}...</Body>
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.is_active ? "success" : "outline"}>
                          {key.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="text-white">{key.scopes.length} scopes</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="text-text-muted">
                          {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never"}
                        </Body>
                      </TableCell>
                      <TableCell>
                        <Box className="flex items-center gap-2">
                          {canManageApiKeys && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleToggleKey(key)} icon={key.is_active ? <PowerOff className="size-4" /> : <Power className="size-4" />} />
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteKey(key.id)} icon={<Trash2 className="size-4" />} />
                            </>
                          )}
                        </Box>
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
      id: "docs",
      label: "Documentation",
      icon: <FileText className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="API Documentation" description="How to use your API keys" />
          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <Box className="flex items-start gap-3 mb-4">
                <Code className="size-6 text-primary flex-shrink-0" />
                <Body className="font-weight-medium text-white">Authentication</Body>
              </Box>
              <Stack gap={3}>
                <Body size="sm" className="text-text-muted">
                  Include your API key in the Authorization header:
                </Body>
                <Card className="p-3 bg-surface-elevated">
                  <Body size="sm" className="font-mono text-white">Authorization: Bearer YOUR_API_KEY</Body>
                </Card>
              </Stack>
            </Card>
            <Card className="p-6">
              <Box className="flex items-start gap-3 mb-4">
                <FileText className="size-6 text-primary flex-shrink-0" />
                <Body className="font-weight-medium text-white">Base URL</Body>
              </Box>
              <Stack gap={3}>
                <Body size="sm" className="text-text-muted">
                  All API requests should be made to:
                </Body>
                <Card className="p-3 bg-surface-elevated">
                  <Body size="sm" className="font-mono text-white">https://api.gvteway.com/v1</Body>
                </Card>
              </Stack>
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
          title: "API Access",
          description: "Manage API keys for programmatic access to the GVTEWAY platform",
        }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
        actions={headerActions}
        backButton={{ label: "Settings", href: "/settings" }}
      />

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create API Key">
        <Stack gap={4}>
          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Key Name</Body>
            <Input placeholder="e.g., Production Server" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
          </Stack>
          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Permissions</Body>
            <Card className="p-4 max-h-[250px] overflow-y-auto">
              <Grid cols={2} gap={2} className="grid-cols-1 lg:grid-cols-2">
                {ALL_API_SCOPES.map((scope) => (
                  <Box key={scope} className="flex items-center gap-2">
                    <Checkbox checked={selectedScopes.includes(scope)} onChange={() => toggleScope(scope)} />
                    <Body size="sm">{getScopeLabel(scope)}</Body>
                  </Box>
                ))}
              </Grid>
            </Card>
            <Body size="sm" className="text-text-disabled">{selectedScopes.length} permissions selected</Body>
          </Stack>
          <Box className="flex gap-4">
            <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancel</Button>
            <Button variant="solid" onClick={handleCreateKey} disabled={isCreating || !keyName || selectedScopes.length === 0}>
              {isCreating ? "Creating..." : "Create Key"}
            </Button>
          </Box>
        </Stack>
      </Modal>

      <Modal open={showKeyModal} onClose={() => setShowKeyModal(false)} title="API Key Created">
        <Stack gap={4}>
          <Card className="p-4 bg-warning-900 border-warning-500">
            <Body size="sm" className="text-warning-100">This key will only be shown once. Copy it now and store it securely.</Body>
          </Card>
          <Stack gap={2}>
            <Body size="sm" className="text-text-muted">Your API Key</Body>
            <Box className="flex gap-2">
              <Input value={newKey} readOnly className="font-mono" />
              <Button variant="outline" onClick={copyKey} icon={copiedKey ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}>
                {copiedKey ? "Copied" : "Copy"}
              </Button>
            </Box>
          </Stack>
          <Button variant="solid" onClick={() => setShowKeyModal(false)}>Done</Button>
        </Stack>
      </Modal>
    </>
  );
}
