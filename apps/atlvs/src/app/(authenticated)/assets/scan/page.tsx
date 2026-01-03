"use client";

/**
 * Asset Barcode Scanner Page
 * Scan assets for check-in, check-out, and inventory
 * Uses shared ScannerLayout for consistent UI across apps
 */

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  ArrowUpFromLine,
  ArrowDownToLine,
  ClipboardList,
  ArrowRightLeft,
  Loader2,
  QrCode,
  History,
} from "lucide-react";
import {
  Body,
  Button,
  Card,
  Select,
  Grid,
  Badge,
  Modal,
  useToast,
  DetailPage,
  Stack,
  Box,
  Section,
  SectionHeader,
  StatCard,
  Input,
} from "@ghxstship/ui";
import {
  useAssetScan,
  useAssetLookup,
  type ScannedAsset,
  type ScanHistory,
  useAuthContext,
  ATLVS_ADMIN_ROLES,
} from "@ghxstship/config";
import { DEMO_SCAN_HISTORY } from "../../../../lib/demo-data";

export default function AssetScanPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();
  const [manualBarcode, setManualBarcode] = useState("");
  const [lookupBarcode, setLookupBarcode] = useState<string | null>(null);
  const [scannedAsset, setScannedAsset] = useState<ScannedAsset | null>(null);
  const [scanMode, setScanMode] = useState<"check_in" | "check_out" | "inventory" | "transfer">("inventory");
  const [showActionModal, setShowActionModal] = useState(false);
  const [transferLocation, setTransferLocation] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const canScanAssets = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const {
    scanHistory: apiScanHistory,
    isLoadingHistory,
    historyError,
    recordScanAsync,
    isRecording,
    refetchHistory,
  } = useAssetScan();
  const { data: lookedUpAsset, isLoading: isLookingUp, error: lookupError } = useAssetLookup(lookupBarcode);

  const scanHistory: ScanHistory[] = apiScanHistory.length > 0 ? apiScanHistory : (DEMO_SCAN_HISTORY as ScanHistory[]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (lookedUpAsset) {
      setScannedAsset(lookedUpAsset);
      setShowActionModal(true);
      setManualBarcode("");
      setLookupBarcode(null);
    }
  }, [lookedUpAsset]);

  useEffect(() => {
    if (lookupError) {
      toast.error("Asset Not Found", lookupError instanceof Error ? lookupError.message : "Asset not found");
      setLookupBarcode(null);
    }
  }, [lookupError, toast]);

  const handleScan = async (barcode: string) => {
    if (!barcode.trim()) return;
    setLookupBarcode(barcode);
  };

  const handleAction = async () => {
    if (!scannedAsset) return;
    try {
      await recordScanAsync({
        barcode: scannedAsset.barcode,
        action: scanMode,
        location: scanMode === "transfer" ? transferLocation : scannedAsset.location,
        notes: undefined,
      });
      toast.success("Success", `Asset ${scanMode.replace("_", " ")} recorded successfully`);
      setShowActionModal(false);
      setScannedAsset(null);
      setTransferLocation("");
      refetchHistory();
      if (inputRef.current) inputRef.current.focus();
    } catch (err) {
      toast.error("Error", err instanceof Error ? err.message : "Failed to record scan");
    }
  };

  const isScanning = isLookingUp;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "error" | "outline"> = {
      available: "success",
      checked_out: "warning",
      maintenance: "warning",
      retired: "error",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, "success" | "warning" | "info" | "outline"> = {
      check_in: "success",
      check_out: "warning",
      inventory: "info",
      transfer: "outline",
    };
    return <Badge variant={variants[action] || "outline"}>{action.replace("_", " ")}</Badge>;
  };

  const todayScans = scanHistory.filter((s) => new Date(s.timestamp).toDateString() === new Date().toDateString()).length;

  const headerActions = (
    <Button variant="outline" onClick={() => router.push("/assets")} icon={<ClipboardList className="size-4" />} iconPosition="left">
      Asset List
    </Button>
  );

  const tabs = [
    {
      id: "scanner",
      label: "Scanner",
      icon: <QrCode className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Today's Scans" value={todayScans.toString()} icon={<Smartphone className="size-5" />} />
            <StatCard label="Check Outs" value={scanHistory.filter((s) => s.action === "check_out").length.toString()} icon={<ArrowUpFromLine className="size-5" />} />
            <StatCard label="Check Ins" value={scanHistory.filter((s) => s.action === "check_in").length.toString()} icon={<ArrowDownToLine className="size-5" />} />
            <StatCard label="Inventory Scans" value={scanHistory.filter((s) => s.action === "inventory").length.toString()} icon={<ClipboardList className="size-5" />} />
          </Grid>

          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <SectionHeader title="Scan Mode" />
              <Grid cols={2} gap={3} className="grid-cols-2 mb-6">
                <Button variant={scanMode === "check_in" ? "solid" : "outline"} onClick={() => setScanMode("check_in")} className="py-4" icon={<ArrowDownToLine className="size-5" />} iconPosition="left">
                  Check In
                </Button>
                <Button variant={scanMode === "check_out" ? "solid" : "outline"} onClick={() => setScanMode("check_out")} className="py-4" icon={<ArrowUpFromLine className="size-5" />} iconPosition="left">
                  Check Out
                </Button>
                <Button variant={scanMode === "inventory" ? "solid" : "outline"} onClick={() => setScanMode("inventory")} className="py-4" icon={<ClipboardList className="size-5" />} iconPosition="left">
                  Inventory
                </Button>
                <Button variant={scanMode === "transfer" ? "solid" : "outline"} onClick={() => setScanMode("transfer")} className="py-4" icon={<ArrowRightLeft className="size-5" />} iconPosition="left">
                  Transfer
                </Button>
              </Grid>

              <SectionHeader title="Scan or Enter Barcode" />
              <Stack gap={4}>
                <Input
                  ref={inputRef}
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleScan(manualBarcode); }}
                  placeholder="Scan barcode or enter manually..."
                  className="text-center font-mono"
                  autoFocus
                />
                <Button
                  variant="solid"
                  onClick={() => handleScan(manualBarcode)}
                  disabled={!manualBarcode.trim() || isScanning || !canScanAssets}
                  className="w-full"
                >
                  {isScanning ? "Scanning..." : canScanAssets ? "Process Scan" : "Scan Access Required"}
                </Button>
              </Stack>

              <Card className="p-4 mt-6 bg-surface-elevated">
                <Body size="sm" className="text-on-dark-muted">
                  1. Select scan mode above<br />
                  2. Scan barcode with scanner or enter manually<br />
                  3. Confirm action in popup<br />
                  4. Asset record will be updated automatically
                </Body>
              </Card>
            </Card>

            <Box>
              <SectionHeader title="Recent Scans" />
              {isLoadingHistory ? (
                <Card className="p-8 text-center">
                  <Stack direction="horizontal" gap={2} className="items-center justify-center">
                    <Loader2 className="size-5 animate-spin" />
                    <Body className="text-on-dark-muted">Loading scan history...</Body>
                  </Stack>
                </Card>
              ) : historyError ? (
                <Card className="p-6 bg-error-900 border-error-500">
                  <Body className="text-error-100">Failed to load scan history</Body>
                </Card>
              ) : (
                <Stack gap={3}>
                  {scanHistory.slice(0, 5).map((scan) => (
                    <Card key={scan.id} className="p-4">
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Box>
                          <Body className="font-weight-medium">{scan.asset_name}</Body>
                          <Body size="sm" className="font-mono text-on-dark-muted">{scan.barcode}</Body>
                        </Box>
                        <Box className="text-right">
                          {getActionBadge(scan.action)}
                          <Body size="sm" className="text-on-dark-muted mt-1">{new Date(scan.timestamp).toLocaleTimeString()}</Body>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                  {scanHistory.length === 0 && (
                    <Card className="p-8 text-center">
                      <Body className="text-on-dark-muted">No scans yet today</Body>
                    </Card>
                  )}
                  <Button variant="outline" onClick={() => router.push("/assets/scan/history")} className="w-full">
                    View Full History
                  </Button>
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
          <SectionHeader title="Scan History" description="All recorded asset scans" />
          <Stack gap={3}>
            {scanHistory.map((scan) => (
              <Card key={scan.id} className="p-4">
                <Stack direction="horizontal" className="items-center justify-between">
                  <Box>
                    <Body className="font-weight-medium">{scan.asset_name}</Body>
                    <Body size="sm" className="font-mono text-on-dark-muted">{scan.barcode}</Body>
                  </Box>
                  <Box className="text-right">
                    {getActionBadge(scan.action)}
                    <Body size="sm" className="text-on-dark-muted mt-1">{new Date(scan.timestamp).toLocaleString()}</Body>
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: "Assets",
          title: "Barcode Scanner",
          description: "Scan assets for check-in, check-out, and inventory",
        }}
        tabs={tabs}
        actions={headerActions}
        backButton={{ label: "Assets", href: "/assets" }}
      />

      <Modal open={showActionModal} onClose={() => setShowActionModal(false)} title="Confirm Action">
        {scannedAsset && (
          <Stack gap={6}>
            <Card className="p-4 bg-surface-elevated">
              <Body className="font-mono mb-2">{scannedAsset.barcode}</Body>
              <Body className="font-weight-medium text-body-lg">{scannedAsset.name}</Body>
              <Stack direction="horizontal" gap={2} className="items-center mt-2">
                <Badge variant="outline">{scannedAsset.category}</Badge>
                {getStatusBadge(scannedAsset.status)}
              </Stack>
            </Card>

            <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
              <Box>
                <Body size="sm" className="text-on-dark-muted">Location</Body>
                <Body>{scannedAsset.location}</Body>
              </Box>
              <Box>
                <Body size="sm" className="text-on-dark-muted">Condition</Body>
                <Body className="capitalize">{scannedAsset.condition}</Body>
              </Box>
              {scannedAsset.serial_number && (
                <Box>
                  <Body size="sm" className="text-on-dark-muted">Serial Number</Body>
                  <Body className="font-mono">{scannedAsset.serial_number}</Body>
                </Box>
              )}
              <Box>
                <Body size="sm" className="text-on-dark-muted">Last Scan</Body>
                <Body>{new Date(scannedAsset.last_scan).toLocaleString()}</Body>
              </Box>
            </Grid>

            <Card className="p-4">
              <Stack direction="horizontal" className="items-center justify-between">
                <Body className="font-weight-medium">Action:</Body>
                {getActionBadge(scanMode)}
              </Stack>
            </Card>

            {scanMode === "transfer" && (
              <Stack gap={2}>
                <Body size="sm" className="text-on-dark-muted">Transfer To Location</Body>
                <Select value={transferLocation} onChange={(e) => setTransferLocation(e.target.value)}>
                  <option value="">Select location...</option>
                  <option value="warehouse_a">Warehouse A</option>
                  <option value="warehouse_b">Warehouse B</option>
                  <option value="venue">Venue</option>
                  <option value="truck">Truck</option>
                </Select>
              </Stack>
            )}

            <Stack direction="horizontal" gap={4}>
              <Button
                variant="solid"
                onClick={handleAction}
                className="flex-1"
                disabled={isRecording || (scanMode === "transfer" && !transferLocation)}
              >
                {isRecording ? (
                  <><Loader2 className="size-4 animate-spin mr-2" />Recording...</>
                ) : (
                  `Confirm ${scanMode.replace("_", " ")}`
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowActionModal(false)} disabled={isRecording}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
      </Modal>
    </>
  );
}
