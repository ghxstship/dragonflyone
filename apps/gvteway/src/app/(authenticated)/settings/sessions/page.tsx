"use client";

/**
 * GVTEWAY Sessions Page
 * View and manage active login sessions across devices
 * Uses DetailPage template for consistent layout
 */

import {
  Body,
  Button,
  Card,
  Grid,
  StatCard,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  DetailPage,
  Section,
  SectionHeader,
  useNotifications,
} from "@ghxstship/ui";
import { Monitor, Smartphone, Tablet, Globe, Trash2, LogOut, Shield } from "lucide-react";
import { useSessionsData, type UserSession } from "@/hooks/useSessions";

function getDeviceIcon(deviceType?: string) {
  switch (deviceType?.toLowerCase()) {
    case "mobile":
      return <Smartphone className="size-4" />;
    case "tablet":
      return <Tablet className="size-4" />;
    default:
      return <Monitor className="size-4" />;
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

export default function SessionsPage() {
  const { addNotification } = useNotifications();

  const {
    sessions,
    isLoading,
    error,
    refetch,
    revokeSession,
    isRevoking,
    revokeAllSessions,
    isRevokingAll,
  } = useSessionsData();

  const currentSession = sessions.find((s) => s.is_current);
  const otherSessions = sessions.filter((s) => !s.is_current);

  const handleRevokeSession = async (id: string) => {
    if (confirm("Are you sure you want to end this session? The device will be signed out.")) {
      try {
        await revokeSession(id);
        addNotification({ type: "success", title: "Session Revoked", message: "The session has been ended" });
      } catch (err) {
        addNotification({ type: "error", title: "Error", message: err instanceof Error ? err.message : "Failed to revoke session" });
      }
    }
  };

  const handleRevokeAll = async () => {
    if (confirm("Are you sure you want to sign out all other devices?")) {
      try {
        await revokeAllSessions();
        addNotification({ type: "success", title: "Sessions Revoked", message: "All other sessions have been ended" });
      } catch (err) {
        addNotification({ type: "error", title: "Error", message: err instanceof Error ? err.message : "Failed to revoke sessions" });
      }
    }
  };

  const headerActions = otherSessions.length > 0 ? (
    <Button
      variant="outline"
      onClick={handleRevokeAll}
      disabled={isRevokingAll}
      icon={<LogOut className="size-4" />}
      iconPosition="left"
    >
      {isRevokingAll ? "Signing out..." : "Sign Out All Other Devices"}
    </Button>
  ) : null;

  const tabs = [
    {
      id: "sessions",
      label: "Active Sessions",
      icon: <Monitor className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <StatCard label="Active Sessions" value={sessions.length.toString()} />
            <StatCard label="Other Devices" value={otherSessions.length.toString()} />
            <StatCard label="Current Device" value={currentSession ? "1" : "0"} />
          </Grid>

          {currentSession && (
            <>
              <SectionHeader title="Current Session" description="This is the device you are using now" />
              <Card className="p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-grey-700 rounded-card">
                      {getDeviceIcon(currentSession.device_type)}
                    </div>
                    <div>
                      <Body className="font-weight-medium text-white">{currentSession.device_name || "Unknown Device"}</Body>
                      <Body size="sm" className="text-grey-400">
                        {currentSession.browser || "Unknown Browser"} on {currentSession.os || "Unknown OS"}
                      </Body>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe className="size-3 text-grey-500" />
                        <Body size="sm" className="text-grey-500">
                          {currentSession.location || currentSession.ip_address || "Unknown location"}
                        </Body>
                      </div>
                    </div>
                  </div>
                  <Badge variant="success">Active Now</Badge>
                </div>
              </Card>
            </>
          )}

          <SectionHeader title="Other Sessions" description="Devices where you are also signed in" />
          {otherSessions.length === 0 ? (
            <div className="text-center py-12">
              <Monitor className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="text-grey-400">No other active sessions</Body>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherSessions.map((session: UserSession) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-grey-700 rounded">
                            {getDeviceIcon(session.device_type)}
                          </div>
                          <div>
                            <Body className="font-weight-medium text-white">{session.device_name || "Unknown Device"}</Body>
                            <Body size="sm" className="text-grey-400">
                              {session.browser || "Unknown"} on {session.os || "Unknown"}
                            </Body>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="text-white">{session.location || session.ip_address || "Unknown"}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="text-grey-400">{formatTimeAgo(session.last_active_at)}</Body>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={isRevoking}
                          icon={<Trash2 className="size-4" />}
                        />
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
      label: "Security Tips",
      icon: <Shield className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Security Tips" description="Best practices for account security" />
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-avatar bg-primary flex items-center justify-center flex-shrink-0">
                  <Body size="sm" className="text-white font-weight-medium">1</Body>
                </div>
                <div>
                  <Body className="font-weight-medium text-white">Review unrecognized sessions</Body>
                  <Body size="sm" className="text-grey-400">If you see a session you do not recognize, revoke it immediately</Body>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-avatar bg-primary flex items-center justify-center flex-shrink-0">
                  <Body size="sm" className="text-white font-weight-medium">2</Body>
                </div>
                <div>
                  <Body className="font-weight-medium text-white">Sign out from shared devices</Body>
                  <Body size="sm" className="text-grey-400">Always sign out from public or shared devices when done</Body>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-avatar bg-primary flex items-center justify-center flex-shrink-0">
                  <Body size="sm" className="text-white font-weight-medium">3</Body>
                </div>
                <div>
                  <Body className="font-weight-medium text-white">Enable two-factor authentication</Body>
                  <Body size="sm" className="text-grey-400">Add an extra layer of security to your account</Body>
                </div>
              </div>
            </div>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Settings",
        title: "Session Management",
        description: "View and manage your active login sessions across devices",
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={headerActions}
      backButton={{
        label: "Settings",
        href: "/settings",
      }}
    />
  );
}
