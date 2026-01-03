"use client";

/**
 * GVTEWAY Connected Apps Page
 * Manage third-party applications connected to your account
 * Uses DetailPage template for consistent layout
 */

import {
  Body,
  Button,
  Card,
  Grid,
  StatCard,
  Badge,
  useToast,
  DetailPage,
  Section,
  SectionHeader,
  Box,
  Stack,
} from "@ghxstship/ui";
import { Link2, Unlink, ExternalLink, Shield, Info } from "lucide-react";
import { useConnectedAppsData, type ConnectedApp, getProviderInfo } from "@/hooks/useConnectedApps";

export default function ConnectedAppsPage() {
  const toast = useToast();

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
        toast.success("Disconnected", `${app.app_name} has been disconnected`);
      } catch (err) {
        toast.error("Error", err instanceof Error ? err.message : "Failed to disconnect app");
      }
    }
  };

  const tabs = [
    {
      id: "apps",
      label: "Connected Apps",
      icon: <Link2 className="size-4" />,
      content: (
        <Section>
          <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2 mb-6">
            <StatCard label="Connected Apps" value={apps.length.toString()} />
            <StatCard label="Total Permissions" value={apps.reduce((sum, app) => sum + app.scopes.length, 0).toString()} />
          </Grid>

          <SectionHeader title="Your Connected Apps" description="Third-party applications with access to your account" />

          {apps.length === 0 ? (
            <Box className="text-center py-12">
              <Link2 className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted mb-2">No connected apps</Body>
              <Body size="sm" className="text-text-disabled">
                Connect third-party apps to enhance your GVTEWAY experience
              </Body>
            </Box>
          ) : (
            <Stack gap={3}>
              {apps.map((app: ConnectedApp) => {
                const providerInfo = getProviderInfo(app.provider);
                return (
                  <Card key={app.id} className="p-4">
                    <Box className="flex items-start justify-between">
                      <Box className="flex items-center gap-4">
                        <Box className="w-12 h-12 bg-border rounded-card flex items-center justify-center">
                          <Link2 className="size-6 text-text-muted" />
                        </Box>
                        <Box>
                          <Box className="flex items-center gap-2 mb-1">
                            <Body className="font-weight-medium text-white">{app.app_name}</Body>
                            <Badge variant="outline">{providerInfo.name}</Badge>
                          </Box>
                          <Body size="sm" className="text-text-muted mb-2">{providerInfo.description}</Body>
                          <Box className="flex items-center gap-6">
                            <Box>
                              <Body size="sm" className="text-text-disabled">Connected</Body>
                              <Body size="sm" className="text-text-muted">{new Date(app.connected_at).toLocaleDateString()}</Body>
                            </Box>
                            {app.last_used_at && (
                              <Box>
                                <Body size="sm" className="text-text-disabled">Last Used</Body>
                                <Body size="sm" className="text-text-muted">{new Date(app.last_used_at).toLocaleDateString()}</Body>
                              </Box>
                            )}
                            <Box>
                              <Body size="sm" className="text-text-disabled">Permissions</Body>
                              <Body size="sm" className="text-text-muted">{app.scopes.length} granted</Body>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Box className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" icon={<ExternalLink className="size-4" />} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(app)}
                          disabled={isDisconnecting}
                          icon={<Unlink className="size-4" />}
                          iconPosition="left"
                        >
                          Disconnect
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Section>
      ),
    },
    {
      id: "info",
      label: "About",
      icon: <Info className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="About Connected Apps" description="Understanding third-party app access" />
          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <Box className="flex items-start gap-3 mb-4">
                <Shield className="size-6 text-primary flex-shrink-0" />
                <Body className="font-weight-medium text-white">Security</Body>
              </Box>
              <Stack gap={3}>
                <Body size="sm" className="text-text-muted">
                  Connected apps have access to specific parts of your GVTEWAY account based on the permissions you granted.
                </Body>
                <Body size="sm" className="text-text-muted">
                  You can disconnect any app at any time. Disconnecting an app will revoke its access to your account.
                </Body>
              </Stack>
            </Card>
            <Card className="p-6">
              <Box className="flex items-start gap-3 mb-4">
                <Info className="size-6 text-primary flex-shrink-0" />
                <Body className="font-weight-medium text-white">Best Practices</Body>
              </Box>
              <Stack gap={3}>
                <Body size="sm" className="text-text-muted">
                  Only connect apps from sources you trust.
                </Body>
                <Body size="sm" className="text-text-muted">
                  Review permissions before granting access.
                </Body>
                <Body size="sm" className="text-text-muted">
                  Regularly review and remove unused connections.
                </Body>
              </Stack>
            </Card>
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Settings",
        title: "Connected Apps",
        description: "Manage third-party applications connected to your account",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      backButton={{ label: "Settings", href: "/settings" }}
    />
  );
}
