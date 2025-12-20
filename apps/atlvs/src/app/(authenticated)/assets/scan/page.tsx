'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, ArrowUpFromLine, ArrowDownToLine, ClipboardList, ArrowRightLeft, Loader2 } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import {
  Container,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  StatCard,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';
import { useAssetScan, useAssetLookup, type ScannedAsset, type ScanHistory } from '@ghxstship/config';

import { DEMO_SCAN_HISTORY } from '../../../../lib/demo-data';


export default function AssetScanPage() {
  const router = useRouter();
  const [manualBarcode, setManualBarcode] = useState('');
  const [lookupBarcode, setLookupBarcode] = useState<string | null>(null);
  const [scannedAsset, setScannedAsset] = useState<ScannedAsset | null>(null);
  const [scanMode, setScanMode] = useState<'check_in' | 'check_out' | 'inventory' | 'transfer'>('inventory');
  const [showActionModal, setShowActionModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transferLocation, setTransferLocation] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Real API integration
  const { scanHistory: apiScanHistory, isLoadingHistory, historyError, recordScanAsync, isRecording, refetchHistory } = useAssetScan();
  const { data: lookedUpAsset, isLoading: isLookingUp, error: lookupError } = useAssetLookup(lookupBarcode);

  // Use API data with demo fallback
  const scanHistory: ScanHistory[] = apiScanHistory.length > 0 ? apiScanHistory : (DEMO_SCAN_HISTORY as ScanHistory[]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle asset lookup result
  useEffect(() => {
    if (lookedUpAsset) {
      setScannedAsset(lookedUpAsset);
      setShowActionModal(true);
      setManualBarcode('');
      setLookupBarcode(null);
    }
  }, [lookedUpAsset]);

  // Handle lookup error
  useEffect(() => {
    if (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : 'Asset not found');
      setLookupBarcode(null);
    }
  }, [lookupError]);

  const handleScan = async (barcode: string) => {
    if (!barcode.trim()) return;
    setError(null);
    setLookupBarcode(barcode);
  };

  const handleAction = async () => {
    if (!scannedAsset) return;

    try {
      await recordScanAsync({
        barcode: scannedAsset.barcode,
        action: scanMode,
        location: scanMode === 'transfer' ? transferLocation : scannedAsset.location,
        notes: undefined,
      });

      setSuccess(`Asset ${scanMode.replace('_', ' ')} recorded successfully`);
      setShowActionModal(false);
      setScannedAsset(null);
      setTransferLocation('');
      refetchHistory();

      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record scan');
    }
  };

  const isScanning = isLookingUp;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-success-500 text-white',
      checked_out: 'bg-success-100 text-success-800black',
      maintenance: 'bg-success-100 text-success-800white',
      retired: 'bg-error-100 text-error-800white',
    };
    return <Badge className={colors[status] || ''}>{status.replace('_', ' ')}</Badge>;
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      check_in: 'bg-success-500 text-white',
      check_out: 'bg-warning-100 text-warning-800hite',
      inventory: 'bg-violet-500 text-white',
      transfer: 'bg-success-100 text-success-800white',
    };
    return <Badge className={colors[action] || ''}>{action.replace('_', ' ')}</Badge>;
  };

  const todayScans = scanHistory.filter(s => {
    const scanDate = new Date(s.timestamp).toDateString();
    return scanDate === new Date().toDateString();
  }).length;

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Barcode Scanner"
        subtitle="Scan assets for check-in, check-out, and inventory"


        secondaryActions={[{ id: 'asset-list', label: 'Asset List', onClick: () => router.push('/assets') }]}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Today's Scans"
            value={todayScans}
            icon={<Smartphone className="size-5" />}
          />
          <StatCard
            label="Check Outs"
            value={scanHistory.filter(s => s.action === 'check_out').length}
            icon={<ArrowUpFromLine className="size-5" />}
          />
          <StatCard
            label="Check Ins"
            value={scanHistory.filter(s => s.action === 'check_in').length}
            icon={<ArrowDownToLine className="size-5" />}
          />
          <StatCard
            label="Inventory Scans"
            value={scanHistory.filter(s => s.action === 'inventory').length}
            icon={<ClipboardList className="size-5" />}
          />
        </Grid>

        <Grid cols={2} gap={8} className="sm:grid-cols-1 lg:grid-cols-2">
          <Card className="p-8 border-2 border-black">
            <Stack gap={6}>
              <H2>SCAN MODE</H2>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Button
                  variant={scanMode === 'check_in' ? 'solid' : 'outline'}
                  onClick={() => setScanMode('check_in')}
                  className="py-6"
                >
                  <ArrowDownToLine className="size-5 mr-2" /> Check In
                </Button>
                <Button
                  variant={scanMode === 'check_out' ? 'solid' : 'outline'}
                  onClick={() => setScanMode('check_out')}
                  className="py-6"
                >
                  <ArrowUpFromLine className="size-5 mr-2" /> Check Out
                </Button>
                <Button
                  variant={scanMode === 'inventory' ? 'solid' : 'outline'}
                  onClick={() => setScanMode('inventory')}
                  className="py-6"
                >
                  <ClipboardList className="size-5 mr-2" /> Inventory
                </Button>
                <Button
                  variant={scanMode === 'transfer' ? 'solid' : 'outline'}
                  onClick={() => setScanMode('transfer')}
                  className="py-6"
                >
                  <ArrowRightLeft className="size-5 mr-2" /> Transfer
                </Button>
              </Grid>

              <Stack gap={4}>
                <H3>SCAN OR ENTER BARCODE</H3>
                <Field label="">
                  <Input
                    ref={inputRef}
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleScan(manualBarcode);
                      }
                    }}
                    placeholder="Scan barcode or enter manually..."
                    className="text-h5-md py-4 text-center font-mono"
                    autoFocus
                  />
                </Field>
                <Button
                  variant="solid"
                  onClick={() => handleScan(manualBarcode)}
                  disabled={!manualBarcode.trim() || isScanning}
                  className="py-4"
                >
                  {isScanning ? 'Scanning...' : 'Process Scan'}
                </Button>
              </Stack>

              <Card className="p-4 bg-ink-50 border-2">
                <Stack gap={2}>
                  <Label className="text-ink-500">Instructions</Label>
                  <Body size="sm" className=" text-ink-600">
                    1. Select scan mode above<br />
                    2. Scan barcode with scanner or enter manually<br />
                    3. Confirm action in popup<br />
                    4. Asset record will be updated automatically
                  </Body>
                </Stack>
              </Card>
            </Stack>
          </Card>

          <Stack gap={6}>
            <H2>RECENT SCANS</H2>
            {isLoadingHistory ? (
              <Card className="p-8 text-center border-2">
                <Stack direction="horizontal" className="justify-center items-center" gap={2}>
                  <Loader2 className="size-5 animate-spin" />
                  <Body className="text-ink-500">Loading scan history...</Body>
                </Stack>
              </Card>
            ) : historyError ? (
              <Alert variant="error">
                Failed to load scan history: {historyError instanceof Error ? historyError.message : 'Unknown error'}
              </Alert>
            ) : (
              <Stack gap={3}>
                {scanHistory.slice(0, 5).map(scan => (
                  <Card key={scan.id} className="p-4 border-2">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={1}>
                        <Body className="font-weight-bold">{scan.asset_name}</Body>
                        <Label className="text-ink-500 font-mono">{scan.barcode}</Label>
                      </Stack>
                      <Stack className="text-right" gap={1}>
                        {getActionBadge(scan.action)}
                        <Label className="text-mono-xs text-ink-600">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </Label>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
                {scanHistory.length === 0 && (
                  <Card className="p-8 text-center border-2">
                    <Body className="text-ink-500">No scans yet today</Body>
                  </Card>
                )}
              </Stack>
            )}
            <Button variant="outline" onClick={() => router.push('/assets/scan/history')}>
              View Full History
            </Button>
          </Stack>
        </Grid>

        <Modal
          open={showActionModal}
          onClose={() => setShowActionModal(false)}
          title="Confirm Action"
        >
          {scannedAsset && (
            <Stack gap={6}>
              <Card className="p-4 bg-ink-50 border-2">
                <Stack gap={2}>
                  <Body className="font-mono text-body-md">{scannedAsset.barcode}</Body>
                  <H3>{scannedAsset.name}</H3>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant="outline">{scannedAsset.category}</Badge>
                    {getStatusBadge(scannedAsset.status)}
                  </Stack>
                </Stack>
              </Card>

              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Label className="text-ink-500">Location</Label>
                  <Body>{scannedAsset.location}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-ink-500">Condition</Label>
                  <Body className="capitalize">{scannedAsset.condition}</Body>
                </Stack>
                {scannedAsset.serial_number && (
                  <Stack gap={1}>
                    <Label className="text-ink-500">Serial Number</Label>
                    <Body className="font-mono">{scannedAsset.serial_number}</Body>
                  </Stack>
                )}
                <Stack gap={1}>
                  <Label className="text-ink-500">Last Scan</Label>
                  <Body>{new Date(scannedAsset.last_scan).toLocaleString()}</Body>
                </Stack>
              </Grid>

              <Card className="p-4 border-2 border-black">
                <Stack direction="horizontal" className="justify-between items-center">
                  <Body className="font-weight-bold">Action:</Body>
                  {getActionBadge(scanMode)}
                </Stack>
              </Card>

              {scanMode === 'transfer' && (
                <Field label="Transfer To Location">
                  <Select value={transferLocation} onChange={(e) => setTransferLocation(e.target.value)}>
                    <option value="">Select location...</option>
                    <option value="warehouse_a">Warehouse A</option>
                    <option value="warehouse_b">Warehouse B</option>
                    <option value="venue">Venue</option>
                    <option value="truck">Truck</option>
                  </Select>
                </Field>
              )}

              <Stack direction="horizontal" gap={4}>
                <Button 
                  variant="solid" 
                  onClick={handleAction} 
                  className="flex-1"
                  disabled={isRecording || (scanMode === 'transfer' && !transferLocation)}
                >
                  {isRecording ? (
                    <><Loader2 className="size-4 animate-spin mr-2" />Recording...</>
                  ) : (
                    `Confirm ${scanMode.replace('_', ' ')}`
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowActionModal(false)} disabled={isRecording}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          )}
        </Modal>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
