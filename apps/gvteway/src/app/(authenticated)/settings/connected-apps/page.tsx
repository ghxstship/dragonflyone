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
  useNotifications,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";
import { Link2, Unlink, ExternalLink, Shield, Info } from "lucide-react";
import { useConnectedAppsData, type ConnectedApp, getProviderInfo } from "@/hooks/useConnectedApps";

export default function ConnectedAppsPage() {
  const { addNotification } = useNotifications();

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
        addNotification({ type: "success", title: "Disconnected", message: `${app.app_name} has been disconnected` });
      } catch (err) {
        addNotification({ type: "error", title: "Error", message: err instanceof Error ? err.message : "Failed to disconnect app" });
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
            <div className="text-center py-12">
              <Link2 className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="text-grey-400 mb-2">No connected apps</Body>
              <Body size="sm" className="text-grey-500">
                Connect third-party apps to enhance your GVTEWAY experience
              </Body>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.map((app: ConnectedApp) => {
                const providerInfo = getProviderInfo(app.provider);
                return (
                  <Card key={app.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-grey-700 rounded-card flex items-center justify-center">
                          <Link2 className="size-6 text-grey-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Body className="font-weight-medium text-white">{app.app_name}</Body>
                            <Badge variant="outline">{providerInfo.name}</Badge>
                          </div>
                          <Body size="sm" className="text-grey-400 mb-2">{providerInfo.description}</Body>
                          <div className="flex items-center gap-6">
                            <div>
                              <Body size="sm" className="text-grey-500">Connected</Body>
                              <Body size="sm" className="text-grey-400">{new Date(app.connected_at).toLocaleDateString()}</Body>
                            </div>
                            {app.last_used_at && (
                              <div>
                                <Body size="sm" className="text-grey-500">Last Used</Body>
                                <Body size="sm" className="text-grey-400">{new Date(app.last_used_at).toLocaleDateString()}</Body>
                              </div>
                            )}
                            <div>
                              <Body size="sm" className="text-grey-500">Permissions</Body>
                              <Body size="sm" className="text-grey-400">{app.scopes.length} granted</Body>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
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
              <div className="flex items-start gap-3 mb-4">
                <Shield className="size-6 text-primary flex-shrink-0" />
                <Body className="font-weight-medium text-white">Security</Body>
              </div>
              <div className="space-y-3">
                <Body size="sm" className="text-grey-400">
                  Connected apps have access to specific parts of your GVTEWAY account based on the permissions you granted.
                </Body>
                <Body size="sm" className="text-grey-400">
                  You can disconnect any app at any time. Disconnecting an app will revoke its access to your account.
                </Body>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Info className="size-6 text-primary flex-shrink-0" />
                <Body className="font-weight-medium text-white">Best Practices</Body>
              </div>
              <div className="space-y-3">
                <Body size="sm" className="text-grey-400">
                  Only connect apps from sources you trust.
                </Body>
                <Body size="sm" className="text-grey-400">
                  Review permissions before granting access.
                </Body>
                <Body size="sm" className="text-grey-400">
                  Regularly review and remove unused connections.
                </Body>
              </div>
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
