"use client";

/**
 * Credential Scanner Page
 * Scan credentials for zone access verification using QR codes or badge numbers
 * Uses DetailPage template for consistent layout
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  BadgeCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  Loader2,
  Shield,
  MapPin,
  Clock,
} from "lucide-react";
import {
  Body,
  Button,
  Card,
  Input,
  Select,
  Grid,
  Badge,
  Modal,
  StatCard,
  useToast,
  DetailPage,
  Section,
  SectionHeader,
  Stack,
  Box,
} from "@ghxstship/ui";
import {
  useVerifyCredential,
  useLogCredentialScan,
  useCredentialStats,
  type Credential,
} from "@/hooks/useCredentials";

interface RecentScan {
  id: string;
  badgeNumber: string;
  holderName: string;
  credentialType: string;
  zoneName: string;
  status: "granted" | "denied" | "expired";
  timestamp: Date;
}

export default function CredentialScanPage() {
  const router = useRouter();
  const toast = useToast();
  const [manualBadge, setManualBadge] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [scannedCredential, setScannedCredential] = useState<{
    valid: boolean;
    reason?: string;
    accessType?: string;
    credential?: Credential;
  } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const verifyMutation = useVerifyCredential();
  const logScanMutation = useLogCredentialScan();
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useCredentialStats();

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleScan = async (badge: string) => {
    if (!badge.trim()) return;

    try {
      const result = await verifyMutation.mutateAsync({
        badgeNumber: badge,
        zoneId: selectedZoneId || undefined,
      });

      setScannedCredential(result);
      setShowResultModal(true);
      setManualBadge("");

      // Log the scan
      if (result.credential) {
        await logScanMutation.mutateAsync({
          credentialId: result.credential.id,
          zoneId: selectedZoneId,
          scanType: "verify",
          result: result.valid ? "granted" : "denied",
        });

        // Add to recent scans
        const newScan: RecentScan = {
          id: result.credential.id,
          badgeNumber: result.credential.badge_number,
          holderName: result.credential.contact
            ? `${result.credential.contact.first_name} ${result.credential.contact.last_name}`
            : "Unknown",
          credentialType: result.credential.credential_type?.name || "Unknown",
          zoneName: selectedZoneId || "All Zones",
          status: result.valid ? "granted" : result.reason?.includes("expired") ? "expired" : "denied",
          timestamp: new Date(),
        };
        setRecentScans((prev) => [newScan, ...prev.slice(0, 19)]);
      }

      if (inputRef.current) inputRef.current.focus();
    } catch (err) {
      toast.error("Scan Failed", err instanceof Error ? err.message : "Failed to verify credential");
      setManualBadge("");
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const getStatusBadge = (valid: boolean, reason?: string) => {
    if (valid) {
      return <Badge variant="success">Access Granted</Badge>;
    }
    if (reason?.includes("expired")) {
      return <Badge variant="warning">Expired</Badge>;
    }
    if (reason?.includes("suspended")) {
      return <Badge variant="warning">Suspended</Badge>;
    }
    return <Badge variant="error">Access Denied</Badge>;
  };

  const getScanStatusIcon = (status: string) => {
    switch (status) {
      case "granted":
        return <CheckCircle className="size-5 text-success-500" />;
      case "expired":
        return <AlertTriangle className="size-5 text-warning-500" />;
      default:
        return <XCircle className="size-5 text-error-500" />;
    }
  };

  const isScanning = verifyMutation.isPending;

  const headerActions = (
    <Button
      variant="outline"
      onClick={() => router.push("/credentials")}
      icon={<BadgeCheck className="size-4" />}
      iconPosition="left"
    >
      Credentials
    </Button>
  );

  const credentialStats = stats || { total: 0, active: 0, pending: 0, suspended: 0, revoked: 0, expired: 0 };

  const tabs = [
    {
      id: "scanner",
      label: "Scanner",
      icon: <QrCode className="size-4" />,
      content: (
        <Section>
          {isLoadingStats ? (
            <Card className="p-8 text-center mb-6">
              <Stack direction="horizontal" gap={2} className="items-center justify-center">
                <Loader2 className="size-5 animate-spin" />
                <Body className="text-on-dark-muted">Loading statistics...</Body>
              </Stack>
            </Card>
          ) : statsError ? (
            <Card className="p-6 bg-error-900 border-error-500 mb-6">
              <Body className="text-error-100">Failed to load credential statistics</Body>
            </Card>
          ) : (
            <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard
                label="Total Credentials"
                value={credentialStats.total.toString()}
                icon={<BadgeCheck className="size-5" />}
              />
              <StatCard
                label="Active"
                value={credentialStats.active.toString()}
                icon={<CheckCircle className="size-5" />}
              />
              <StatCard
                label="Suspended"
                value={credentialStats.suspended.toString()}
                icon={<AlertTriangle className="size-5" />}
              />
              <StatCard
                label="Revoked"
                value={credentialStats.revoked.toString()}
                icon={<XCircle className="size-5" />}
              />
            </Grid>
          )}

          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <SectionHeader title="Scan Credential" />
              <Stack gap={4}>
                <Select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                >
                  <option value="">All Zones (General Verification)</option>
                  <option value="zone-backstage">Backstage</option>
                  <option value="zone-vip">VIP Area</option>
                  <option value="zone-production">Production Office</option>
                  <option value="zone-catering">Catering</option>
                  <option value="zone-loading">Loading Dock</option>
                </Select>

                <Input
                  ref={inputRef}
                  value={manualBadge}
                  onChange={(e) => setManualBadge(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleScan(manualBadge);
                  }}
                  placeholder="Scan badge or enter badge number..."
                  className="text-center font-mono"
                  autoFocus
                />

                <Button
                  variant="solid"
                  onClick={() => handleScan(manualBadge)}
                  disabled={!manualBadge.trim() || isScanning}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Credential"
                  )}
                </Button>
              </Stack>

              <Card className="p-4 mt-6 bg-grey-800">
                <Body size="sm" className="text-on-dark-muted">
                  1. Optionally select a zone to verify specific access
                  <br />
                  2. Scan the badge QR code or enter the badge number manually
                  <br />
                  3. Review credential holder information
                  <br />
                  4. Grant or deny access based on verification result
                </Body>
              </Card>
            </Card>

            <Box>
              <SectionHeader title="Recent Scans" />
              {recentScans.length === 0 ? (
                <Card className="p-8 text-center">
                  <Body className="text-on-dark-muted">No scans yet</Body>
                </Card>
              ) : (
                <Stack gap={3}>
                  {recentScans.slice(0, 5).map((scan) => (
                    <Card key={`${scan.id}-${scan.timestamp.getTime()}`} className="p-4">
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Stack direction="horizontal" gap={3} className="items-center">
                          {getScanStatusIcon(scan.status)}
                          <Box>
                            <Body className="font-weight-medium">{scan.holderName}</Body>
                            <Body size="sm" className="font-mono text-on-dark-muted">
                              {scan.badgeNumber}
                            </Body>
                          </Box>
                        </Stack>
                        <Box className="text-right">
                          <Badge variant="outline">{scan.credentialType}</Badge>
                          <Body size="sm" className="text-on-dark-muted mt-1">
                            <MapPin className="size-3 inline mr-1" />
                            {scan.zoneName}
                          </Body>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>
        </Section>
      ),
    },
    {
      id: "history",
      label: "History",
      icon: <History className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Scan History" description="All recorded credential scans for this session" />
          {recentScans.length === 0 ? (
            <Card className="p-8 text-center">
              <Body className="text-on-dark-muted">No scan history available</Body>
            </Card>
          ) : (
            <Stack gap={3}>
              {recentScans.map((scan) => (
                <Card key={`history-${scan.id}-${scan.timestamp.getTime()}`} className="p-4">
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      {getScanStatusIcon(scan.status)}
                      <Box>
                        <Body className="font-weight-medium">{scan.holderName}</Body>
                        <Body size="sm" className="font-mono text-on-dark-muted">
                          {scan.badgeNumber}
                        </Body>
                      </Box>
                    </Stack>
                    <Box className="text-right">
                      <Badge variant="outline">{scan.credentialType}</Badge>
                      <Body size="sm" className="text-on-dark-muted mt-1">
                        <Clock className="size-3 inline mr-1" />
                        {scan.timestamp.toLocaleString()}
                      </Body>
                    </Box>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: "Credentials",
          title: "Credential Scanner",
          description: "Verify credentials for zone access",
        }}
        tabs={tabs}
        actions={headerActions}
        backButton={{ label: "Credentials", href: "/credentials" }}
      />

      <Modal
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="Credential Verification Result"
      >
        {scannedCredential && (
          <Stack gap={6}>
            <Card className="p-4 bg-grey-800">
              <Stack direction="horizontal" gap={3} className="items-center mb-4">
                {scannedCredential.valid ? (
                  <CheckCircle className="size-8 text-success-500" />
                ) : (
                  <XCircle className="size-8 text-error-500" />
                )}
                <Box>
                  <Body className="font-weight-medium text-body-lg">
                    {scannedCredential.credential?.contact
                      ? `${scannedCredential.credential.contact.first_name} ${scannedCredential.credential.contact.last_name}`
                      : "Unknown Holder"}
                  </Body>
                  {getStatusBadge(scannedCredential.valid, scannedCredential.reason)}
                </Box>
              </Stack>

              {scannedCredential.credential && (
                <Body className="font-mono text-on-dark-muted">
                  Badge: {scannedCredential.credential.badge_number}
                </Body>
              )}
            </Card>

            {scannedCredential.credential && (
              <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
                <Box>
                  <Body size="sm" className="text-on-dark-muted">
                    Credential Type
                  </Body>
                  <Body>{scannedCredential.credential.credential_type?.name || "Unknown"}</Body>
                </Box>
                <Box>
                  <Body size="sm" className="text-on-dark-muted">
                    Status
                  </Body>
                  <Body className="capitalize">{scannedCredential.credential.status}</Body>
                </Box>
                {scannedCredential.credential.contact?.email && (
                  <Box>
                    <Body size="sm" className="text-on-dark-muted">
                      Email
                    </Body>
                    <Body>{scannedCredential.credential.contact.email}</Body>
                  </Box>
                )}
                {scannedCredential.accessType && (
                  <Box>
                    <Body size="sm" className="text-on-dark-muted">
                      Access Type
                    </Body>
                    <Body className="capitalize">{scannedCredential.accessType}</Body>
                  </Box>
                )}
                {scannedCredential.credential.expires_at && (
                  <Box>
                    <Body size="sm" className="text-on-dark-muted">
                      Expires
                    </Body>
                    <Body>{new Date(scannedCredential.credential.expires_at).toLocaleDateString()}</Body>
                  </Box>
                )}
              </Grid>
            )}

            {scannedCredential.reason && !scannedCredential.valid && (
              <Card className="p-4 bg-error-900 border-error-500">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Shield className="size-5 text-error-300" />
                  <Body className="text-error-100">{scannedCredential.reason}</Body>
                </Stack>
              </Card>
            )}

            <Button
              variant="outline"
              onClick={() => setShowResultModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </Stack>
        )}
      </Modal>
    </>
  );
}
