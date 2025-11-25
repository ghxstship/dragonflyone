'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
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
  LoadingSpinner,
  StatCard,
} from '@ghxstship/ui';

interface ScannedAsset {
  id: string;
  barcode: string;
  name: string;
  category: string;
  status: 'available' | 'checked_out' | 'maintenance' | 'retired';
  location: string;
  last_scan: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  serial_number?: string;
}

interface ScanHistory {
  id: string;
  barcode: string;
  asset_name: string;
  action: 'check_in' | 'check_out' | 'inventory' | 'transfer';
  scanned_by: string;
  timestamp: string;
  location: string;
}

const mockScanHistory: ScanHistory[] = [
  { id: 'SCN-001', barcode: 'AST-001-LED', asset_name: 'LED Wall Panel Set A', action: 'check_out', scanned_by: 'John Martinez', timestamp: '2024-11-24T14:30:00Z', location: 'Warehouse A' },
  { id: 'SCN-002', barcode: 'AST-002-AUD', asset_name: 'Meyer Sound Line Array', action: 'check_in', scanned_by: 'Sarah Chen', timestamp: '2024-11-24T12:15:00Z', location: 'Venue - Main Stage' },
  { id: 'SCN-003', barcode: 'AST-003-LGT', asset_name: 'Lighting Console grandMA3', action: 'inventory', scanned_by: 'Mike Thompson', timestamp: '2024-11-24T10:00:00Z', location: 'Warehouse B' },
];

export default function AssetScanPage() {
  const router = useRouter();
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedAsset, setScannedAsset] = useState<ScannedAsset | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>(mockScanHistory);
  const [scanMode, setScanMode] = useState<'check_in' | 'check_out' | 'inventory' | 'transfer'>('inventory');
  const [isScanning, setIsScanning] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on input for barcode scanner
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleScan = async (barcode: string) => {
    if (!barcode.trim()) return;

    setIsScanning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock scanned asset
      const asset: ScannedAsset = {
        id: 'AST-001',
        barcode: barcode,
        name: 'LED Wall Panel Set A',
        category: 'Video',
        status: 'available',
        location: 'Warehouse A',
        last_scan: new Date().toISOString(),
        condition: 'good',
        serial_number: 'SN-2024-001234',
      };

      setScannedAsset(asset);
      setShowActionModal(true);
      setManualBarcode('');
    } catch (err) {
      setError('Failed to scan asset');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAction = async () => {
    if (!scannedAsset) return;

    const newScan: ScanHistory = {
      id: `SCN-${Date.now()}`,
      barcode: scannedAsset.barcode,
      asset_name: scannedAsset.name,
      action: scanMode,
      scanned_by: 'Current User',
      timestamp: new Date().toISOString(),
      location: scannedAsset.location,
    };

    setScanHistory([newScan, ...scanHistory]);
    setSuccess(`Asset ${scanMode.replace('_', ' ')} recorded successfully`);
    setShowActionModal(false);
    setScannedAsset(null);

    // Refocus input for next scan
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-500 text-white',
      checked_out: 'bg-yellow-500 text-black',
      maintenance: 'bg-orange-500 text-white',
      retired: 'bg-gray-500 text-white',
    };
    return <Badge className={colors[status] || ''}>{status.replace('_', ' ')}</Badge>;
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      check_in: 'bg-green-500 text-white',
      check_out: 'bg-blue-500 text-white',
      inventory: 'bg-purple-500 text-white',
      transfer: 'bg-orange-500 text-white',
    };
    return <Badge className={colors[action] || ''}>{action.replace('_', ' ')}</Badge>;
  };

  const todayScans = scanHistory.filter(s => {
    const scanDate = new Date(s.timestamp).toDateString();
    return scanDate === new Date().toDateString();
  }).length;

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack>
              <Display>BARCODE SCANNER</Display>
              <Body className="mt-2 text-gray-600">
                Scan assets for check-in, check-out, and inventory
              </Body>
            </Stack>
            <Button variant="outline" onClick={() => router.push('/assets')}>
              Asset List
            </Button>
          </Stack>
        </Section>

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
            icon={<span>📱</span>}
          />
          <StatCard
            label="Check Outs"
            value={scanHistory.filter(s => s.action === 'check_out').length}
            icon={<span>📤</span>}
          />
          <StatCard
            label="Check Ins"
            value={scanHistory.filter(s => s.action === 'check_in').length}
            icon={<span>📥</span>}
          />
          <StatCard
            label="Inventory Scans"
            value={scanHistory.filter(s => s.action === 'inventory').length}
            icon={<span>📋</span>}
          />
        </Grid>

        <Grid cols={2} gap={8}>
          <Card className="p-8 border-2 border-black">
            <Stack gap={6}>
              <H2>SCAN MODE</H2>
              <Grid cols={2} gap={4}>
                <Button
                  variant={scanMode === 'check_in' ? 'solid' : 'outline'}
                  onClick={() => setScanMode('check_in')}
                  className="py-6"
                >
                  📥 Check In
                </Button>
                <Button
                  variant={scanMode === 'check_out' ? 'solid' : 'outline'}
                  onClick={() => setScanMode('check_out')}
                  className="py-6"
                >
                  📤 Check Out
                </Button>
                <Button
                  variant={scanMode === 'inventory' ? 'solid' : 'outline'}
                  onClick={() => setScanMode('inventory')}
                  className="py-6"
                >
                  📋 Inventory
                </Button>
                <Button
                  variant={scanMode === 'transfer' ? 'solid' : 'outline'}
                  onClick={() => setScanMode('transfer')}
                  className="py-6"
                >
                  🔄 Transfer
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
                    className="text-2xl py-4 text-center font-mono"
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

              <Card className="p-4 bg-gray-50 border">
                <Stack gap={2}>
                  <Label className="text-gray-500">Instructions</Label>
                  <Body className="text-sm text-gray-600">
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
            <Stack gap={3}>
              {scanHistory.slice(0, 5).map(scan => (
                <Card key={scan.id} className="p-4 border">
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Body className="font-bold">{scan.asset_name}</Body>
                      <Label className="text-gray-500 font-mono">{scan.barcode}</Label>
                    </Stack>
                    <Stack className="text-right" gap={1}>
                      {getActionBadge(scan.action)}
                      <Label className="text-xs text-gray-400">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </Label>
                    </Stack>
                  </Stack>
                </Card>
              ))}
              {scanHistory.length === 0 && (
                <Card className="p-8 text-center border">
                  <Body className="text-gray-500">No scans yet today</Body>
                </Card>
              )}
            </Stack>
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
              <Card className="p-4 bg-gray-50 border">
                <Stack gap={2}>
                  <Body className="font-mono text-lg">{scannedAsset.barcode}</Body>
                  <H3>{scannedAsset.name}</H3>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant="outline">{scannedAsset.category}</Badge>
                    {getStatusBadge(scannedAsset.status)}
                  </Stack>
                </Stack>
              </Card>

              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-gray-500">Location</Label>
                  <Body>{scannedAsset.location}</Body>
                </Stack>
                <Stack gap={1}>
                  <Label className="text-gray-500">Condition</Label>
                  <Body className="capitalize">{scannedAsset.condition}</Body>
                </Stack>
                {scannedAsset.serial_number && (
                  <Stack gap={1}>
                    <Label className="text-gray-500">Serial Number</Label>
                    <Body className="font-mono">{scannedAsset.serial_number}</Body>
                  </Stack>
                )}
                <Stack gap={1}>
                  <Label className="text-gray-500">Last Scan</Label>
                  <Body>{new Date(scannedAsset.last_scan).toLocaleString()}</Body>
                </Stack>
              </Grid>

              <Card className="p-4 border-2 border-black">
                <Stack direction="horizontal" className="justify-between items-center">
                  <Body className="font-bold">Action:</Body>
                  {getActionBadge(scanMode)}
                </Stack>
              </Card>

              {scanMode === 'transfer' && (
                <Field label="Transfer To Location">
                  <Select>
                    <option value="">Select location...</option>
                    <option value="warehouse_a">Warehouse A</option>
                    <option value="warehouse_b">Warehouse B</option>
                    <option value="venue">Venue</option>
                    <option value="truck">Truck</option>
                  </Select>
                </Field>
              )}

              <Stack direction="horizontal" gap={4}>
                <Button variant="solid" onClick={handleAction} className="flex-1">
                  Confirm {scanMode.replace('_', ' ')}
                </Button>
                <Button variant="outline" onClick={() => setShowActionModal(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          )}
        </Modal>
      </Container>
    </Section>
  );
}
