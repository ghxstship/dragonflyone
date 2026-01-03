"use client";

/**
 * Ticket Scanner Page
 * Scan tickets for event check-in using QR codes or barcodes
 * Uses DetailPage template for consistent layout
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Ticket,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  Loader2,
  Users,
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
  useCheckInTicket,
  useScanTicket,
  type TicketScanResult,
} from "@/hooks/useTicketScanner";
import { useEventScanData } from "@/hooks/useEventOperations";

interface RecentScan {
  id: string;
  ticketCode: string;
  attendeeName: string;
  ticketType: string;
  status: "success" | "duplicate" | "invalid" | "expired";
  timestamp: Date;
}

export default function TicketScanPage() {
  const router = useRouter();
  const toast = useToast();
  const [manualCode, setManualCode] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [scannedTicket, setScannedTicket] = useState<TicketScanResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const scanMutation = useScanTicket();
  const checkInMutation = useCheckInTicket();
  const { stats, isLoading: isLoadingStats, error: statsError } = useEventScanData(selectedEventId);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleScan = async (code: string) => {
    if (!code.trim()) return;

    try {
      const result = await scanMutation.mutateAsync(code);
      setScannedTicket(result);
      setShowResultModal(true);
      setManualCode("");

      // Add to recent scans
      const newScan: RecentScan = {
        id: result.ticket_id,
        ticketCode: result.ticket_code,
        attendeeName: result.attendee_name,
        ticketType: result.ticket_type,
        status: result.status === "valid" ? "success" : result.status === "already_checked_in" ? "duplicate" : "invalid",
        timestamp: new Date(),
      };
      setRecentScans((prev) => [newScan, ...prev.slice(0, 19)]);

      if (inputRef.current) inputRef.current.focus();
    } catch (err) {
      toast.error("Scan Failed", err instanceof Error ? err.message : "Failed to scan ticket");
      setManualCode("");
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleCheckIn = async () => {
    if (!scannedTicket || !selectedEventId) return;

    try {
      await checkInMutation.mutateAsync({
        ticket_code: scannedTicket.ticket_code,
        event_id: selectedEventId,
      });
      toast.success("Check-in Successful", `${scannedTicket.attendee_name} has been checked in`);
      setShowResultModal(false);
      setScannedTicket(null);
      if (inputRef.current) inputRef.current.focus();
    } catch (err) {
      toast.error("Check-in Failed", err instanceof Error ? err.message : "Failed to check in ticket");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "error" | "outline"> = {
      valid: "success",
      already_checked_in: "warning",
      invalid: "error",
      cancelled: "error",
      expired: "error",
    };
    const labels: Record<string, string> = {
      valid: "Valid",
      already_checked_in: "Already Checked In",
      invalid: "Invalid",
      cancelled: "Cancelled",
      expired: "Expired",
    };
    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  const getScanStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="size-5 text-success-500" />;
      case "duplicate":
        return <AlertTriangle className="size-5 text-warning-500" />;
      default:
        return <XCircle className="size-5 text-error-500" />;
    }
  };

  const isScanning = scanMutation.isPending;
  const isCheckingIn = checkInMutation.isPending;

  const headerActions = (
    <Button
      variant="outline"
      onClick={() => router.push("/tickets")}
      icon={<Ticket className="size-4" />}
      iconPosition="left"
    >
      My Tickets
    </Button>
  );

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
                <Body className="text-text-muted">Loading statistics...</Body>
              </Stack>
            </Card>
          ) : statsError ? (
            <Card className="p-6 bg-error-900 border-error-500 mb-6">
              <Body className="text-error-100">Failed to load scan statistics</Body>
            </Card>
          ) : (
            <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard
                label="Total Scans"
                value={stats.total.toString()}
                icon={<QrCode className="size-5" />}
              />
              <StatCard
                label="Valid Check-ins"
                value={stats.valid.toString()}
                icon={<CheckCircle className="size-5" />}
              />
              <StatCard
                label="Invalid Scans"
                value={stats.invalid.toString()}
                icon={<XCircle className="size-5" />}
              />
              <StatCard
                label="Check-in Rate"
                value={stats.total > 0 ? `${Math.round((stats.valid / stats.total) * 100)}%` : "0%"}
                icon={<Users className="size-5" />}
              />
            </Grid>
          )}

          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <SectionHeader title="Scan Ticket" />
              <Stack gap={4}>
                <Select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">Select Event...</option>
                  <option value="demo-event-1">Summer Music Festival</option>
                  <option value="demo-event-2">Tech Conference 2024</option>
                  <option value="demo-event-3">Comedy Night</option>
                </Select>

                <Input
                  ref={inputRef}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleScan(manualCode);
                  }}
                  placeholder="Scan QR code or enter ticket code..."
                  className="text-center font-mono"
                  autoFocus
                  disabled={!selectedEventId}
                />

                <Button
                  variant="solid"
                  onClick={() => handleScan(manualCode)}
                  disabled={!manualCode.trim() || isScanning || !selectedEventId}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Scanning...
                    </>
                  ) : (
                    "Scan Ticket"
                  )}
                </Button>
              </Stack>

              <Card className="p-4 mt-6 bg-surface-elevated">
                <Body size="sm" className="text-text-muted">
                  1. Select the event from the dropdown
                  <br />
                  2. Scan the QR code with a scanner or enter the ticket code manually
                  <br />
                  3. Verify attendee information in the popup
                  <br />
                  4. Confirm check-in to admit the guest
                </Body>
              </Card>
            </Card>

            <Box>
              <SectionHeader title="Recent Scans" />
              {recentScans.length === 0 ? (
                <Card className="p-8 text-center">
                  <Body className="text-text-muted">No scans yet</Body>
                </Card>
              ) : (
                <Stack gap={3}>
                  {recentScans.slice(0, 5).map((scan) => (
                    <Card key={scan.id} className="p-4">
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Stack direction="horizontal" gap={3} className="items-center">
                          {getScanStatusIcon(scan.status)}
                          <Box>
                            <Body className="font-weight-medium">{scan.attendeeName}</Body>
                            <Body size="sm" className="font-mono text-text-muted">
                              {scan.ticketCode}
                            </Body>
                          </Box>
                        </Stack>
                        <Box className="text-right">
                          <Badge variant="outline">{scan.ticketType}</Badge>
                          <Body size="sm" className="text-text-muted mt-1">
                            {scan.timestamp.toLocaleTimeString()}
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
          <SectionHeader title="Scan History" description="All recorded ticket scans for this session" />
          {recentScans.length === 0 ? (
            <Card className="p-8 text-center">
              <Body className="text-text-muted">No scan history available</Body>
            </Card>
          ) : (
            <Stack gap={3}>
              {recentScans.map((scan) => (
                <Card key={`${scan.id}-${scan.timestamp.getTime()}`} className="p-4">
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      {getScanStatusIcon(scan.status)}
                      <Box>
                        <Body className="font-weight-medium">{scan.attendeeName}</Body>
                        <Body size="sm" className="font-mono text-text-muted">
                          {scan.ticketCode}
                        </Body>
                      </Box>
                    </Stack>
                    <Box className="text-right">
                      <Badge variant="outline">{scan.ticketType}</Badge>
                      <Body size="sm" className="text-text-muted mt-1">
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
          kicker: "Tickets",
          title: "Ticket Scanner",
          description: "Scan tickets for event check-in",
        }}
        tabs={tabs}
        actions={headerActions}
        backButton={{ label: "Tickets", href: "/tickets" }}
      />

      <Modal
        open={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="Ticket Scan Result"
      >
        {scannedTicket && (
          <Stack gap={6}>
            <Card className="p-4 bg-surface-elevated">
              <Stack direction="horizontal" gap={3} className="items-center mb-4">
                {scannedTicket.status === "valid" ? (
                  <CheckCircle className="size-8 text-success-500" />
                ) : scannedTicket.status === "already_checked_in" ? (
                  <AlertTriangle className="size-8 text-warning-500" />
                ) : (
                  <XCircle className="size-8 text-error-500" />
                )}
                <Box>
                  <Body className="font-weight-medium text-body-lg">
                    {scannedTicket.attendee_name}
                  </Body>
                  {getStatusBadge(scannedTicket.status)}
                </Box>
              </Stack>

              <Body className="font-mono text-text-muted">{scannedTicket.ticket_code}</Body>
            </Card>

            <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
              <Box>
                <Body size="sm" className="text-text-muted">
                  Event
                </Body>
                <Body>{scannedTicket.event_name}</Body>
              </Box>
              <Box>
                <Body size="sm" className="text-text-muted">
                  Ticket Type
                </Body>
                <Body>{scannedTicket.ticket_type}</Body>
              </Box>
              <Box>
                <Body size="sm" className="text-text-muted">
                  Email
                </Body>
                <Body>{scannedTicket.attendee_email}</Body>
              </Box>
              {scannedTicket.seat_info && (
                <Box>
                  <Body size="sm" className="text-text-muted">
                    Seat
                  </Body>
                  <Body>
                    {scannedTicket.seat_info.section} - Row {scannedTicket.seat_info.row}, Seat{" "}
                    {scannedTicket.seat_info.seat}
                  </Body>
                </Box>
              )}
              {scannedTicket.checked_in_at && (
                <Box>
                  <Body size="sm" className="text-text-muted">
                    Checked In At
                  </Body>
                  <Body>{new Date(scannedTicket.checked_in_at).toLocaleString()}</Body>
                </Box>
              )}
            </Grid>

            <Stack direction="horizontal" gap={4}>
              {scannedTicket.status === "valid" && (
                <Button
                  variant="solid"
                  onClick={handleCheckIn}
                  className="flex-1"
                  disabled={isCheckingIn}
                >
                  {isCheckingIn ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Checking In...
                    </>
                  ) : (
                    "Confirm Check-in"
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowResultModal(false)}
                className={scannedTicket.status === "valid" ? "" : "flex-1"}
              >
                {scannedTicket.status === "valid" ? "Cancel" : "Close"}
              </Button>
            </Stack>
          </Stack>
        )}
      </Modal>
    </>
  );
}
