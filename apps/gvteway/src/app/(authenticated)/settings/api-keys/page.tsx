"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Card, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
  Kicker, MainContent, Container, Checkbox,
} from "@ghxstship/ui";

import { Key, Plus, Trash2, Eye, EyeOff, Copy, CheckCircle, Shield } from "lucide-react";
import {
  useApiKeysData,
  type ApiKey,
  type ApiScope,
  ALL_API_SCOPES,
  getScopeLabel,
} from "@/hooks/useApiKeys";

function ApiKeysPageContent() {
  const router = useRouter();

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

  const activeCount = apiKeys.filter(k => k.is_active).length;
  const expiredCount = apiKeys.filter(k => k.expires_at && new Date(k.expires_at) < new Date()).length;

  const toggleScope = (scope: ApiScope) => {
    setSelectedScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  const handleCreateKey = async () => {
    if (!keyName || selectedScopes.length === 0) return;

    let expires_at: string | undefined;
    if (expiresIn !== "never") {
      const now = new Date();
      switch (expiresIn) {
        case "30d":
          now.setDate(now.getDate() + 30);
          break;
        case "90d":
          now.setDate(now.getDate() + 90);
          break;
        case "1y":
          now.setFullYear(now.getFullYear() + 1);
          break;
      }
      expires_at = now.toISOString();
    }

    try {
      const result = await createApiKey({
        name: keyName,
        scopes: selectedScopes,
        expires_at,
      });
      setNewKey(result.key);
      setShowCreateModal(false);
      setShowKeyModal(true);
      resetForm();
    } catch {
      // Error handled by hook
    }
  };

  const handleToggleKey = async (key: ApiKey) => {
    try {
      await toggleApiKey({ id: key.id, is_active: !key.is_active });
    } catch {
      // Error handled by hook
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        await deleteApiKey(id);
      } catch {
        // Error handled by hook
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
    if (expiry < now) {
      return <Badge variant="ghost">Expired</Badge>;
    }
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7) {
      return <Badge variant="outline">Expires in {daysLeft}d</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <GvtewayAppLayout>
        <MainContent padding="lg">
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Key className="w-12 h-12 mx-auto mb-4 text-on-dark-muted animate-pulse" />
                <Body className="text-on-dark-muted">Loading API keys...</Body>
              </div>
            </div>
          </Container>
        </MainContent>
      </GvtewayAppLayout>
    );
  }

  if (error) {
    return (
      <GvtewayAppLayout>
        <MainContent padding="lg">
          <Container>
            <Alert variant="error">
              <Body>Failed to load API keys: {error instanceof Error ? error.message : 'Unknown error'}</Body>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                Retry
              </Button>
            </Alert>
          </Container>
        </MainContent>
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Settings</Kicker>
              <H2 size="lg" className="text-white">API Keys</H2>
              <Body className="text-on-dark-muted">Manage API keys for programmatic access to your account</Body>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Keys" value={apiKeys.length.toString()} inverted />
              <StatCard label="Active" value={activeCount.toString()} inverted />
              <StatCard label="Expired" value={expiredCount.toString()} inverted />
              <StatCard label="Scopes Available" value={ALL_API_SCOPES.length.toString()} inverted />
            </Grid>

            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Input type="search" placeholder="Search API keys..." className="w-64" inverted />
                <Button variant="solid" inverted onClick={() => setShowCreateModal(true)} icon={<Plus className="size-4" />} iconPosition="left">
                  Create API Key
                </Button>
              </Stack>

              {apiKeys.length === 0 ? (
                <Card inverted className="p-8 text-center">
                  <Key className="w-12 h-12 mx-auto mb-4 text-on-dark-muted" />
                  <H3 className="text-white mb-2">No API keys created</H3>
                  <Body className="text-on-dark-muted mb-4">Create your first API key to access your account programmatically</Body>
                  <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>Create API Key</Button>
                </Card>
              ) : (
                <Card inverted className="overflow-hidden">
                  <Table variant="dark">
                    <TableHeader>
                      <TableRow className="bg-ink-900">
                        <TableHead className="text-on-dark-muted">Name</TableHead>
                        <TableHead className="text-on-dark-muted">Key Prefix</TableHead>
                        <TableHead className="text-on-dark-muted">Status</TableHead>
                        <TableHead className="text-on-dark-muted">Scopes</TableHead>
                        <TableHead className="text-on-dark-muted">Last Used</TableHead>
                        <TableHead className="text-on-dark-muted">Expires</TableHead>
                        <TableHead className="text-on-dark-muted">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((apiKey) => (
                        <TableRow key={apiKey.id} className="border-b border-ink-700">
                          <TableCell>
                            <Body className="font-display text-white">{apiKey.name}</Body>
                          </TableCell>
                          <TableCell>
                            <Label className="font-mono text-white">{apiKey.key_prefix}...</Label>
                          </TableCell>
                          <TableCell>
                            {apiKey.is_active ? (
                              <Badge variant="solid">Active</Badge>
                            ) : (
                              <Badge variant="ghost">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Label className="text-white">{apiKey.scopes.length} scopes</Label>
                          </TableCell>
                          <TableCell>
                            <Label className="text-on-dark-muted">
                              {apiKey.last_used_at 
                                ? new Date(apiKey.last_used_at).toLocaleDateString()
                                : 'Never'}
                            </Label>
                          </TableCell>
                          <TableCell>
                            <Stack direction="horizontal" gap={2} className="items-center">
                              {apiKey.expires_at ? (
                                <>
                                  <Label className="text-on-dark-muted">
                                    {new Date(apiKey.expires_at).toLocaleDateString()}
                                  </Label>
                                  {getExpiryStatus(apiKey.expires_at)}
                                </>
                              ) : (
                                <Label className="text-on-dark-muted">Never</Label>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="horizontal" gap={2}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleKey(apiKey)}
                                icon={apiKey.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                              />
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteKey(apiKey.id)} 
                                icon={<Trash2 className="size-4" />} 
                              />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </Stack>

            <Card inverted className="p-6">
              <Stack gap={4}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Shield className="w-5 h-5 text-on-dark-muted" />
                  <H3 className="text-white">API Security Best Practices</H3>
                </Stack>
                <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                  <Stack gap={2}>
                    <Body className="text-white font-weight-medium">Do:</Body>
                    <ul className="list-disc list-inside text-on-dark-muted space-y-1">
                      <li>Store API keys securely in environment variables</li>
                      <li>Use the minimum required scopes</li>
                      <li>Set expiration dates for keys</li>
                      <li>Rotate keys regularly</li>
                    </ul>
                  </Stack>
                  <Stack gap={2}>
                    <Body className="text-white font-weight-medium">Do Not:</Body>
                    <ul className="list-disc list-inside text-on-dark-muted space-y-1">
                      <li>Commit API keys to version control</li>
                      <li>Share keys across applications</li>
                      <li>Use production keys in development</li>
                      <li>Expose keys in client-side code</li>
                    </ul>
                  </Stack>
                </Grid>
              </Stack>
            </Card>

            <Button variant="outlineInk" onClick={() => router.push("/settings")}>Back to Settings</Button>
          </Stack>
        </Container>
      </MainContent>

      {/* Create API Key Modal */}
      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }}>
        <ModalHeader><H3>Create API Key</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Stack gap={2}>
              <Label>Key Name</Label>
              <Input
                placeholder="e.g., Production Server"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
            </Stack>
            <Stack gap={2}>
              <Label>Expiration</Label>
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="w-full px-3 py-2 border-2 border-ink-200 rounded-button bg-white text-body-sm focus:outline-none focus:border-primary"
              >
                <option value="never">Never expires</option>
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
                <option value="1y">1 year</option>
              </select>
            </Stack>
            <Stack gap={2}>
              <Label>Scopes</Label>
              <Card className="p-4 max-h-[200px] overflow-y-auto">
                <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
                  {ALL_API_SCOPES.map((scope) => (
                    <Stack key={scope} direction="horizontal" gap={2} className="items-center">
                      <Checkbox
                        checked={selectedScopes.includes(scope)}
                        onChange={() => toggleScope(scope)}
                      />
                      <Label size="sm">{getScopeLabel(scope)}</Label>
                    </Stack>
                  ))}
                </Grid>
              </Card>
              <Label size="xs" className="text-ink-500">{selectedScopes.length} scopes selected</Label>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }}>Cancel</Button>
          <Button
            variant="solid"
            onClick={handleCreateKey}
            disabled={isCreating || !keyName || selectedScopes.length === 0}
          >
            {isCreating ? 'Creating...' : 'Create API Key'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* API Key Display Modal */}
      <Modal open={showKeyModal} onClose={() => setShowKeyModal(false)}>
        <ModalHeader><H3>API Key Created</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Alert variant="warning">
              <Body size="sm">This API key will only be shown once. Copy it now and store it securely.</Body>
            </Alert>
            <Stack gap={2}>
              <Label>Your API Key</Label>
              <Stack direction="horizontal" gap={2}>
                <Input value={newKey} readOnly className="font-mono text-body-sm" />
                <Button variant="outline" onClick={copyKey} icon={copiedKey ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}>
                  {copiedKey ? 'Copied' : 'Copy'}
                </Button>
              </Stack>
              <Label size="xs" className="text-ink-500">Include this key in your API requests using the Authorization header</Label>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="solid" onClick={() => setShowKeyModal(false)}>Done</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function ApiKeysPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <ApiKeysPageContent />
    </Suspense>
  );
}
