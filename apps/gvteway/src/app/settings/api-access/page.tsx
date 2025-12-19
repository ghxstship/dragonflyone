"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Alert,
  Kicker, MainContent, Container, Checkbox,
} from "@ghxstship/ui";

import { Key, Plus, Trash2, Copy, CheckCircle, Power, PowerOff } from "lucide-react";
import {
  useApiKeysData,
  type ApiKey,
  type ApiScope,
  ALL_API_SCOPES,
  getScopeLabel,
} from "@/hooks/useApiKeys";

function ApiAccessPageContent() {
  const router = useRouter();
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

  const activeCount = apiKeys.filter(k => k.is_active).length;

  const toggleScope = (scope: ApiScope) => {
    setSelectedScopes(prev =>
      prev.includes(scope)
        ? prev.filter(s => s !== scope)
        : [...prev, scope]
    );
  };

  const handleCreateKey = async () => {
    if (!keyName || selectedScopes.length === 0) return;

    try {
      const result = await createApiKey({
        name: keyName,
        scopes: selectedScopes,
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
              <H2 size="lg" className="text-white">API Access</H2>
              <Body className="text-on-dark-muted">Manage API keys for programmatic access to the GVTEWAY platform</Body>
            </Stack>

            <Grid cols={3} gap={6}>
              <StatCard label="Total API Keys" value={apiKeys.length.toString()} inverted />
              <StatCard label="Active Keys" value={activeCount.toString()} inverted />
              <StatCard label="Available Scopes" value={ALL_API_SCOPES.length.toString()} inverted />
            </Grid>

            <Card inverted className="p-4">
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between items-center">
                  <H3 className="text-white">API Keys</H3>
                  <Button variant="solid" inverted onClick={() => setShowCreateModal(true)} icon={<Plus className="size-4" />} iconPosition="left">
                    Create API Key
                  </Button>
                </Stack>

                {apiKeys.length === 0 ? (
                  <Stack gap={4} className="py-8 text-center">
                    <Key className="w-12 h-12 mx-auto text-on-dark-muted" />
                    <H3 className="text-white">No API keys</H3>
                    <Body className="text-on-dark-muted">Create your first API key to get started with the API</Body>
                    <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>Create API Key</Button>
                  </Stack>
                ) : (
                  <Table variant="dark">
                    <TableHeader>
                      <TableRow className="bg-ink-900">
                        <TableHead className="text-on-dark-muted">Name</TableHead>
                        <TableHead className="text-on-dark-muted">Key</TableHead>
                        <TableHead className="text-on-dark-muted">Status</TableHead>
                        <TableHead className="text-on-dark-muted">Scopes</TableHead>
                        <TableHead className="text-on-dark-muted">Last Used</TableHead>
                        <TableHead className="text-on-dark-muted">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((key) => (
                        <TableRow key={key.id} className="border-b border-ink-700">
                          <TableCell>
                            <Body className="font-display text-white">{key.name}</Body>
                          </TableCell>
                          <TableCell>
                            <Label className="font-mono text-white">{key.key_prefix}...</Label>
                          </TableCell>
                          <TableCell>
                            <Badge variant={key.is_active ? 'solid' : 'ghost'}>
                              {key.is_active ? 'Active' : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Label className="text-white">{key.scopes.length} scopes</Label>
                          </TableCell>
                          <TableCell>
                            <Label className="text-on-dark-muted">
                              {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                            </Label>
                          </TableCell>
                          <TableCell>
                            <Stack direction="horizontal" gap={2}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleKey(key)}
                                icon={key.is_active ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteKey(key.id)}
                                icon={<Trash2 className="size-4" />}
                              />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Stack>
            </Card>

            <Card inverted className="p-4">
              <Stack gap={4}>
                <H3 className="text-white">API Documentation</H3>
                <Body className="text-on-dark-muted">
                  Use your API key to authenticate requests to the GVTEWAY API. Include the key in the Authorization header:
                </Body>
                <Card className="p-3 bg-ink-900">
                  <Label className="font-mono text-white">Authorization: Bearer YOUR_API_KEY</Label>
                </Card>
                <Body className="text-on-dark-muted">
                  API Base URL: <Label className="font-mono text-white">https://api.gvteway.com/v1</Label>
                </Body>
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
              <Label>Permissions</Label>
              <Card className="p-4 max-h-[250px] overflow-y-auto">
                <Grid cols={2} gap={2}>
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
              <Label size="xs" className="text-ink-500">{selectedScopes.length} permissions selected</Label>
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
            {isCreating ? 'Creating...' : 'Create Key'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Key Display Modal */}
      <Modal open={showKeyModal} onClose={() => setShowKeyModal(false)}>
        <ModalHeader><H3>API Key Created</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Alert variant="warning">
              <Body size="sm">This key will only be shown once. Copy it now and store it securely.</Body>
            </Alert>
            <Stack gap={2}>
              <Label>Your API Key</Label>
              <Stack direction="horizontal" gap={2}>
                <Input value={newKey} readOnly className="font-mono" />
                <Button variant="outline" onClick={copyKey} icon={copiedKey ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}>
                  {copiedKey ? 'Copied' : 'Copy'}
                </Button>
              </Stack>
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

export default function ApiAccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <ApiAccessPageContent />
    </Suspense>
  );
}
