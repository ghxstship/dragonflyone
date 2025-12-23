"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, StatCard,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Card, Badge, Alert, Kicker, MainContent, Container,
} from "@ghxstship/ui";

import { Monitor, Smartphone, Tablet, Globe, Trash2, LogOut } from "lucide-react";
import { useSessionsData, type UserSession } from "@/hooks/useSessions";

function getDeviceIcon(deviceType?: string) {
  switch (deviceType?.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="size-4" />;
    case 'tablet':
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

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

function SessionsPageContent() {
  const router = useRouter();

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

  const currentSession = sessions.find(s => s.is_current);
  const otherSessions = sessions.filter(s => !s.is_current);

  const handleRevokeSession = async (id: string) => {
    if (confirm('Are you sure you want to end this session? The device will be signed out.')) {
      try {
        await revokeSession(id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleRevokeAll = async () => {
    if (confirm('Are you sure you want to sign out all other devices?')) {
      try {
        await revokeAllSessions();
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
                <Monitor className="w-12 h-12 mx-auto mb-4 text-on-dark-muted animate-pulse" />
                <Body className="text-on-dark-muted">Loading sessions...</Body>
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
              <Body>Failed to load sessions: {error instanceof Error ? error.message : 'Unknown error'}</Body>
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
              <H2 size="lg" className="text-white">Session Management</H2>
              <Body className="text-on-dark-muted">View and manage your active login sessions across devices</Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Active Sessions" value={sessions.length.toString()} inverted />
              <StatCard label="Other Devices" value={otherSessions.length.toString()} inverted />
              <StatCard label="Current Device" value={currentSession ? '1' : '0'} inverted />
            </Grid>

            {/* Current Session */}
            {currentSession && (
              <Card inverted className="p-4">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <H3 className="text-white">Current Session</H3>
                    <Badge variant="solid">Active Now</Badge>
                  </Stack>
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <div className="p-3 bg-ink-800 rounded-card">
                      {getDeviceIcon(currentSession.device_type)}
                    </div>
                    <Stack gap={1}>
                      <Body className="text-white">{currentSession.device_name || 'Unknown Device'}</Body>
                      <Label size="xs" className="text-on-dark-muted">
                        {currentSession.browser || 'Unknown Browser'} on {currentSession.os || 'Unknown OS'}
                      </Label>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Globe className="size-3 text-on-dark-muted" />
                        <Label size="xs" className="text-on-dark-muted">
                          {currentSession.location || currentSession.ip_address || 'Unknown location'}
                        </Label>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            )}

            {/* Other Sessions */}
            <Card inverted className="p-4">
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between items-center">
                  <H3 className="text-white">Other Sessions</H3>
                  {otherSessions.length > 0 && (
                    <Button
                      variant="outlineInk"
                      size="sm"
                      onClick={handleRevokeAll}
                      disabled={isRevokingAll}
                      icon={<LogOut className="size-4" />}
                      iconPosition="left"
                    >
                      {isRevokingAll ? 'Signing out...' : 'Sign Out All'}
                    </Button>
                  )}
                </Stack>

                {otherSessions.length === 0 ? (
                  <Stack gap={4} className="py-8 text-center">
                    <Monitor className="w-12 h-12 mx-auto text-on-dark-muted" />
                    <Body className="text-on-dark-muted">No other active sessions</Body>
                  </Stack>
                ) : (
                  <Table variant="dark">
                    <TableHeader>
                      <TableRow className="bg-ink-900">
                        <TableHead className="text-on-dark-muted">Device</TableHead>
                        <TableHead className="text-on-dark-muted">Location</TableHead>
                        <TableHead className="text-on-dark-muted">Last Active</TableHead>
                        <TableHead className="text-on-dark-muted">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {otherSessions.map((session: UserSession) => (
                        <TableRow key={session.id} className="border-b border-ink-700">
                          <TableCell>
                            <Stack direction="horizontal" gap={3} className="items-center">
                              <div className="p-2 bg-ink-800 rounded">
                                {getDeviceIcon(session.device_type)}
                              </div>
                              <Stack gap={0}>
                                <Body className="text-white">{session.device_name || 'Unknown Device'}</Body>
                                <Label size="xs" className="text-on-dark-muted">
                                  {session.browser || 'Unknown'} on {session.os || 'Unknown'}
                                </Label>
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Label className="text-white">{session.location || session.ip_address || 'Unknown'}</Label>
                          </TableCell>
                          <TableCell>
                            <Label className="text-on-dark-muted">{formatTimeAgo(session.last_active_at)}</Label>
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
                )}
              </Stack>
            </Card>

            <Card inverted className="p-4">
              <Stack gap={3}>
                <H3 className="text-white">Security Tips</H3>
                <Stack gap={2}>
                  <Body size="sm" className="text-on-dark-muted">
                    - If you see a session you do not recognize, revoke it immediately
                  </Body>
                  <Body size="sm" className="text-on-dark-muted">
                    - Sign out from public or shared devices when done
                  </Body>
                  <Body size="sm" className="text-on-dark-muted">
                    - Enable two-factor authentication for extra security
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

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <SessionsPageContent />
    </Suspense>
  );
}
