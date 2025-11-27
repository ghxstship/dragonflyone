"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, Button,
  Section as UISection, Card, Badge, Alert,
} from "@ghxstship/ui";

interface OfflineTicket {
  id: string;
  eventName: string;
  eventDate: string;
  ticketType: string;
  qrCode: string;
  cachedAt: string;
  expiresAt: string;
  isValid: boolean;
}

const mockOfflineTickets: OfflineTicket[] = [
  { id: "TKT-001", eventName: "Summer Fest 2024", eventDate: "2024-11-25", ticketType: "VIP Pass", qrCode: "QR_DATA_ENCRYPTED_001", cachedAt: "2024-11-24T10:00:00Z", expiresAt: "2024-11-26T00:00:00Z", isValid: true },
  { id: "TKT-002", eventName: "Summer Fest 2024", eventDate: "2024-11-25", ticketType: "General Admission", qrCode: "QR_DATA_ENCRYPTED_002", cachedAt: "2024-11-24T10:00:00Z", expiresAt: "2024-11-26T00:00:00Z", isValid: true },
];

export default function OfflineWalletPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<string>("2024-11-24T10:00:00Z");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastSync(new Date().toISOString());
    setIsSyncing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>OFFLINE WALLET</H1>
            <Body className="text-ink-600">Access your tickets even without internet connection</Body>
          </Stack>

          <Card className={`p-4 border-2 ${isOnline ? "border-success-500 bg-success-50" : "border-warning-500 bg-warning-50"}`}>
            <Stack direction="horizontal" className="justify-between items-center">
              <Stack gap={1}>
                <Label className="font-bold">{isOnline ? "Online" : "Offline Mode"}</Label>
                <Label size="xs" className="text-ink-500">
                  Last synced: {formatDate(lastSync)}
                </Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Badge variant={isOnline ? "solid" : "outline"}>
                  {isOnline ? "Connected" : "No Connection"}
                </Badge>
                {isOnline && (
                  <Button variant="outline" size="sm" onClick={handleSync} disabled={isSyncing}>
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Card>

          {!isOnline && (
            <Alert variant="info">
              You are currently offline. Your cached tickets are available below. QR codes will work for entry.
            </Alert>
          )}

          <Stack gap={4}>
            <H3>CACHED TICKETS ({mockOfflineTickets.length})</H3>
            
            {mockOfflineTickets.map((ticket) => (
              <Card key={ticket.id} className="border-2 border-black overflow-hidden">
                <Stack gap={0}>
                  <Card className="p-4 bg-black text-white">
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <Body className="font-bold text-body-md">{ticket.eventName}</Body>
                        <Label className="text-ink-600">{ticket.eventDate}</Label>
                      </Stack>
                      <Badge variant="solid">{ticket.ticketType}</Badge>
                    </Stack>
                  </Card>
                  
                  <Stack className="p-6" gap={4}>
                    <Card className="aspect-square max-w-48 mx-auto bg-ink-100 border border-ink-200 flex items-center justify-center">
                      <Stack gap={2} className="text-center p-4">
                        <Label className="text-ink-500">QR Code</Label>
                        <Body className="text-mono-xs text-ink-600 font-mono break-all">{ticket.id}</Body>
                        <Label size="xs" className="text-success-600">✓ Available Offline</Label>
                      </Stack>
                    </Card>

                    <Grid cols={2} gap={4}>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Cached</Label>
                        <Label>{formatDate(ticket.cachedAt)}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Valid Until</Label>
                        <Label>{formatDate(ticket.expiresAt)}</Label>
                      </Stack>
                    </Grid>

                    <Stack direction="horizontal" gap={2}>
                      <Button variant="solid" className="flex-1">Show QR Code</Button>
                      <Button variant="outline">Add to Apple Wallet</Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>

          <Card className="p-4 border border-ink-200 bg-ink-50">
            <Stack gap={3}>
              <H3>OFFLINE MODE INFO</H3>
              <Stack gap={2}>
                <Stack direction="horizontal" gap={2}>
                  <Label className="text-success-600">✓</Label>
                  <Body className="text-body-sm">QR codes work without internet</Body>
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Label className="text-success-600">✓</Label>
                  <Body className="text-body-sm">Tickets cached for 48 hours</Body>
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Label className="text-success-600">✓</Label>
                  <Body className="text-body-sm">Automatic sync when online</Body>
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Label className="text-warning-600">!</Label>
                  <Body className="text-body-sm">Transfers require internet connection</Body>
                </Stack>
              </Stack>
            </Stack>
          </Card>

          <Stack gap={4}>
            <H3>STORAGE</H3>
            <Card className="p-4 border border-ink-200">
              <Stack gap={3}>
                <Stack direction="horizontal" className="justify-between">
                  <Label>Cached Data</Label>
                  <Label className="font-mono">2.4 MB</Label>
                </Stack>
                <Card className="h-2 bg-ink-200 rounded-full overflow-hidden">
                  <Card className="h-full bg-black w-1/4" />
                </Card>
                <Label size="xs" className="text-ink-500">Using 2.4 MB of 10 MB available</Label>
                <Button variant="outline" size="sm">Clear Cache</Button>
              </Stack>
            </Card>
          </Stack>

          <Button variant="outline" onClick={() => router.push("/wallet")}>Back to Wallet</Button>
        </Stack>
      </Container>
    </UISection>
  );
}
