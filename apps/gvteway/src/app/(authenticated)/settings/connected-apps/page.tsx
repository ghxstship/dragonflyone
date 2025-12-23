"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, StatCard,
  Button, Card, Badge, Alert, Kicker, MainContent, Container,
} from "@ghxstship/ui";

import { Link2, Unlink, ExternalLink } from "lucide-react";
import { useConnectedAppsData, type ConnectedApp, getProviderInfo } from "@/hooks/useConnectedApps";

function ConnectedAppsPageContent() {
  const router = useRouter();

  const {
    apps,
    isLoading,
    error,
    refetch,
    disconnectApp,
    isDisconnecting,
  } = useConnectedAppsData();

  const handleDisconnect = async (app: ConnectedApp) => {
    if (confirm(`Are you sure you want to disconnect ${app.app_name}? You may need to reconnect to use its features.`)) {
      try {
        await disconnectApp(app.id);
      } catch {
        // Error handled by hook
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <MainContent padding="lg">
          <Container>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Link2 className="w-12 h-12 mx-auto mb-4 text-on-dark-muted animate-pulse" />
                <Body className="text-on-dark-muted">Loading connected apps...</Body>
              </div>
            </div>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainContent padding="lg">
          <Container>
            <Alert variant="error">
              <Body>Failed to load connected apps: {error instanceof Error ? error.message : 'Unknown error'}</Body>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                Retry
              </Button>
            </Alert>
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Settings</Kicker>
              <H2 size="lg" className="text-white">Connected Apps</H2>
              <Body className="text-on-dark-muted">Manage third-party applications connected to your account</Body>
            </Stack>

            <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
              <StatCard label="Connected Apps" value={apps.length.toString()} inverted />
              <StatCard label="Total Permissions" value={apps.reduce((sum, app) => sum + app.scopes.length, 0).toString()} inverted />
            </Grid>

            <Card inverted className="p-4">
              <Stack gap={4}>
                <H3 className="text-white">Your Connected Apps</H3>

                {apps.length === 0 ? (
                  <Stack gap={4} className="py-8 text-center">
                    <Link2 className="w-12 h-12 mx-auto text-on-dark-muted" />
                    <H3 className="text-white">No connected apps</H3>
                    <Body className="text-on-dark-muted">
                      Connect third-party apps to enhance your GVTEWAY experience
                    </Body>
                  </Stack>
                ) : (
                  <Stack gap={3}>
                    {apps.map((app: ConnectedApp) => {
                      const providerInfo = getProviderInfo(app.provider);
                      return (
                        <Card key={app.id} className="p-4 bg-ink-800 border-ink-700">
                          <Stack direction="horizontal" className="justify-between items-start">
                            <Stack direction="horizontal" gap={4} className="items-center">
                              <div className="w-12 h-12 bg-ink-700 rounded-card flex items-center justify-center">
                                <Link2 className="size-6 text-on-dark-muted" />
                              </div>
                              <Stack gap={1}>
                                <Stack direction="horizontal" gap={2} className="items-center">
                                  <Body className="font-display text-white">{app.app_name}</Body>
                                  <Badge variant="outline">{providerInfo.name}</Badge>
                                </Stack>
                                <Label size="xs" className="text-on-dark-muted">{providerInfo.description}</Label>
                                <Stack direction="horizontal" gap={4} className="mt-2">
                                  <Stack gap={0}>
                                    <Label size="xs" className="text-on-dark-disabled">Connected</Label>
                                    <Label size="xs" className="text-on-dark-muted">
                                      {new Date(app.connected_at).toLocaleDateString()}
                                    </Label>
                                  </Stack>
                                  {app.last_used_at && (
                                    <Stack gap={0}>
                                      <Label size="xs" className="text-on-dark-disabled">Last Used</Label>
                                      <Label size="xs" className="text-on-dark-muted">
                                        {new Date(app.last_used_at).toLocaleDateString()}
                                      </Label>
                                    </Stack>
                                  )}
                                  <Stack gap={0}>
                                    <Label size="xs" className="text-on-dark-disabled">Permissions</Label>
                                    <Label size="xs" className="text-on-dark-muted">{app.scopes.length} granted</Label>
                                  </Stack>
                                </Stack>
                              </Stack>
                            </Stack>
                            <Stack direction="horizontal" gap={2}>
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={<ExternalLink className="size-4" />}
                              />
                              <Button
                                variant="outlineInk"
                                size="sm"
                                onClick={() => handleDisconnect(app)}
                                disabled={isDisconnecting}
                                icon={<Unlink className="size-4" />}
                                iconPosition="left"
                              >
                                Disconnect
                              </Button>
                            </Stack>
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Card>

            <Card inverted className="p-4">
              <Stack gap={3}>
                <H3 className="text-white">About Connected Apps</H3>
                <Stack gap={2}>
                  <Body size="sm" className="text-on-dark-muted">
                    Connected apps have access to specific parts of your GVTEWAY account based on the permissions you granted.
                  </Body>
                  <Body size="sm" className="text-on-dark-muted">
                    You can disconnect any app at any time. Disconnecting an app will revoke its access to your account.
                  </Body>
                  <Body size="sm" className="text-on-dark-muted">
                    Only connect apps from sources you trust.
                  </Body>
                </Stack>
              </Stack>
            </Card>

            <Button variant="outlineInk" onClick={() => router.push("/settings")}>Back to Settings</Button>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}

export default function ConnectedAppsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <ConnectedAppsPageContent />
    </Suspense>
  );
}
